import CrudDataTable, {type CrudDataTableConfig} from "../components/crudDataTable.tsx";
import {InputNumber} from "primereact/inputnumber";
import {InputTextarea} from "primereact/inputtextarea";
import {Dropdown, type DropdownChangeEvent} from "primereact/dropdown";
import {Button} from "primereact/button";
import {classNames} from "primereact/utils";
import type {InventoryMovement} from "../types/inventoryMovement.ts";
import {useInventory, useInventoryMovement} from "../hooks/useInventory.ts";
import inventoryItemAPI from "../services/inventoryItemService.ts";
import {useEffect, useMemo, useRef, useState} from "react";
import {Toast} from "primereact/toast";
import TableSkeleton from "../components/TableSkeleton.tsx";
import {Message} from "primereact/message";
import useUserStore from "../store/useUserStore.ts";

const emptyInventoryMovement: InventoryMovement = {
    id: 0,
    inventory_item: "",
    user: "",
    quantity: 0,
    movement_type: "",
    observation: "",
    created_at: "",
};

interface MovementRow {
    key: string;
    inventory_item_id: number;
    observation: string;
    entryQuantity: number;
    exitQuantity: number;
}

const createEmptyRow = (): MovementRow => ({
    key: `${Date.now()}-${Math.random().toString(16).slice(2)}`,
    inventory_item_id: 0,
    observation: "",
    entryQuantity: 0,
    exitQuantity: 0,
});

const dateBodyTemplate = (rowData: InventoryMovement) => {
    const date = new Date(rowData.created_at);
    return date.toLocaleString('es-ES', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
    });
};

const itemNameTemplate = (rowData: InventoryMovement) => {
    const itemDesc = (rowData as any).inventory_item_description ?? "";
    return itemDesc ? `${rowData.inventory_item} ${itemDesc}` : rowData.inventory_item;
}

function InventoryMovementPage() {
     const { data, isLoading, isError, refetch } = useInventoryMovement();
     const { data: inventoryItems = [], refetch: refetchInventory } = useInventory('unhidden');
     const { user } = useUserStore();
     const toast = useRef<Toast>(null);
     const [inventoryMovements, setInventoryMovements] = useState<InventoryMovement[]>([]);
     const [movementRows, setMovementRows] = useState<MovementRow[]>([createEmptyRow()]);
     const [itemSearch, setItemSearch] = useState("");

    const getItemLabel = (itemId: number) => {
        const item = inventoryItems.find((inv) => inv.id === itemId);
        if (!item) return "Artículo";
        return item.description ? `${item.name} ${item.description}` : item.name;
    };

    const getAvailableStock = (itemId: number) => {
        const item = inventoryItems.find((inv) => inv.id === itemId);
        return item?.current_stock ?? 0;
    };

    const actionableRows = useMemo(
        () =>
            movementRows.filter(
                (row) => row.inventory_item_id && (row.entryQuantity > 0 || row.exitQuantity > 0)
            ),
        [movementRows]
    );

    const zeroQuantityRows = useMemo(
        () =>
            movementRows.filter(
                (row) => row.inventory_item_id && row.entryQuantity === 0 && row.exitQuantity === 0
            ),
        [movementRows]
    );

    const insufficientStockItems = useMemo(
        () =>
            movementRows
                .filter((row) => row.inventory_item_id && row.exitQuantity > getAvailableStock(row.inventory_item_id))
                .map((row) => ({
                    id: row.inventory_item_id,
                    name: getItemLabel(row.inventory_item_id),
                    requested: row.exitQuantity,
                    available: getAvailableStock(row.inventory_item_id)
                })),
        [movementRows, inventoryItems]
    );

    const hasAnyValidMovement = useMemo(
        () =>
            movementRows.some(
                (row) =>
                    row.inventory_item_id &&
                    (row.entryQuantity > 0 ||
                        (row.exitQuantity > 0 && row.exitQuantity <= getAvailableStock(row.inventory_item_id)))
            ),
        [movementRows, inventoryItems]
    );

    const hasActionableMovements = () => actionableRows.length > 0;

    const validateMovements = () => {
        if (zeroQuantityRows.length) {
            const detail = zeroQuantityRows
                .map((row) => getItemLabel(row.inventory_item_id))
                .join(" | ");
            toast.current?.show({
                severity: "warn",
                summary: "Cantidades pendientes",
                detail: `Revisa las filas sin entradas ni salidas: ${detail}`,
                life: 6000
            });
            return false;
        }

        if (!hasActionableMovements()) {
            toast.current?.show({
                severity: "warn",
                summary: "Sin movimientos",
                detail: "Agrega al menos una entrada o salida mayor a 0.",
                life: 5000
            });
            return false;
        }

        return hasAnyValidMovement;
    };

    useEffect(() => {
        if (data) {
            setInventoryMovements(data);
        }
    }, [data]);

    const filteredInventoryItems = inventoryItems.filter((item) =>
        item.name.toLowerCase().includes(itemSearch.toLowerCase())
    );

    const ensureTrailingEmptyRow = (rows: MovementRow[]) => {
        const last = rows[rows.length - 1];
        const hasData = Boolean(last.inventory_item_id || last.entryQuantity > 0 || last.exitQuantity > 0 || last.observation.trim());
        return hasData ? [...rows, createEmptyRow()] : rows;
    };

    const updateRow = (rowKey: string, updater: (row: MovementRow) => MovementRow) => {
        setMovementRows((prev) => {
            const updated = prev.map((row) => (row.key === rowKey ? updater(row) : row));
            return ensureTrailingEmptyRow(updated);
        });
    };

    const removeRow = (rowKey: string) => {
        setMovementRows((prev) => {
            const remaining = prev.filter((row) => row.key !== rowKey);
            if (remaining.length === 0) {
                return [createEmptyRow()];
            }
            return ensureTrailingEmptyRow(remaining);
        });
    };

    const handleItemChange = (rowKey: string, value: number) => {
        updateRow(rowKey, (row) => ({ ...row, inventory_item_id: value }));
    };

    const handleObservationChange = (rowKey: string, e: React.ChangeEvent<HTMLTextAreaElement>) => {
        const text = e.target.value;
        updateRow(rowKey, (row) => ({ ...row, observation: text }));
    };

    const handleQuantityChange = (rowKey: string, value: number | null, field: 'entryQuantity' | 'exitQuantity') => {
        updateRow(rowKey, (row) => ({ ...row, [field]: value ?? 0 }));
    };

    const saveMovements = async () => {
        const userId = user?.id;
        if (userId === null || userId === undefined) return;
        const actionableRowsCurrent = actionableRows;
        const validRows = actionableRowsCurrent.filter(
            (row) => row.entryQuantity > 0 || (row.exitQuantity > 0 && row.exitQuantity <= getAvailableStock(row.inventory_item_id))
        );

        if (!validRows.length) {
            const skippedDueToStock = actionableRowsCurrent.some(
                (row) => row.exitQuantity > 0 && row.exitQuantity > getAvailableStock(row.inventory_item_id)
            );

            if (skippedDueToStock) {
                const skippedAll = actionableRowsCurrent.filter(
                    (row) => row.exitQuantity > 0 && row.exitQuantity > getAvailableStock(row.inventory_item_id)
                );
                const detail = skippedAll
                    .map(
                        (row) =>
                            `${getItemLabel(row.inventory_item_id)} (solicitado: ${row.exitQuantity}, disponible: ${getAvailableStock(row.inventory_item_id)})`
                    )
                    .join(" | ");
                toast.current?.show({ severity: "warn", summary: "Stock insuficiente", detail, life: 6000 });
                const handledError = new Error("Stock insuficiente para realizar los movimientos.");
                (handledError as any).suppressToast = true;
                throw handledError;
            }
            const handledError = new Error("No hay movimientos válidos para procesar.");
            (handledError as any).suppressToast = true;
            throw handledError;
        }

        const skippedForStock = actionableRowsCurrent.filter(
            (row) => row.exitQuantity > 0 && row.exitQuantity > getAvailableStock(row.inventory_item_id)
        );

        const requests: Promise<any>[] = [];

        validRows.forEach((row) => {
            const payload = { observation: row.observation } as { quantity: number; observation?: string };
            if (row.entryQuantity > 0) {
                requests.push(
                    inventoryItemAPI.createItemEntry(
                        row.inventory_item_id,
                        { ...payload, quantity: row.entryQuantity },
                        userId
                    )
                );
            }
            const availableStock = getAvailableStock(row.inventory_item_id);
            const canExit = row.exitQuantity > 0 && row.exitQuantity <= availableStock;
            if (canExit) {
                requests.push(
                    inventoryItemAPI.createItemExit(
                        row.inventory_item_id,
                        { ...payload, quantity: row.exitQuantity },
                        userId
                    )
                );
            }
        });

        if (requests.length === 0) return;

        await Promise.all(requests);
        await refetch();
        await refetchInventory();

        setMovementRows([createEmptyRow()]);
        setItemSearch("");

        if (skippedForStock.length) {
            const detail = skippedForStock
                .map(
                    (row) =>
                        `${getItemLabel(row.inventory_item_id)} (solicitado: ${row.exitQuantity}, disponible: ${getAvailableStock(row.inventory_item_id)})`
                )
                .join(" | ");
            toast.current?.show({
                severity: "warn",
                summary: "Movimientos guardados con alertas",
                detail: `Algunos items no se procesaron por falta de stock: ${detail}`,
                life: 8000
            });
            return { data: { ...emptyInventoryMovement }, suppressMessage: true, skipListUpdate: true };
        }

        toast.current?.show({ severity: "success", summary: "Movimientos guardados", detail: "El stock fue actualizado.", life: 5000 });
        return { data: { ...emptyInventoryMovement }, suppressMessage: true, skipListUpdate: true };
    };

    const config: CrudDataTableConfig<InventoryMovement> = {
        entityName: 'Movimiento de Inventario',
        entityNamePlural: 'Movimientos de Inventario',
        title: 'Gestión de Movimientos de Inventario',
        columns: [
            { field: 'id', header: 'Código', sortable: true, style: { minWidth: '6rem' } },
            { field: 'inventory_item', header: 'Artículo',body: itemNameTemplate ,sortable: true, style: { minWidth: '12rem' } },
            { field: 'user', header: 'Usuario', sortable: true, style: { minWidth: '10rem' } },
            { field: 'quantity', header: 'Cantidad', sortable: true, style: { minWidth: '6rem' } },
            { field: 'movement_type', header: 'Tipo de Movimiento', sortable: true, style: { minWidth: '6rem' } },
            { field: 'observation', header: 'Observación', sortable: false, style: { minWidth: '12rem' } },
            { field: 'created_at', header: 'Fecha', body:  dateBodyTemplate,sortable: true, style: { minWidth: '10rem' } },
        ],
        dialogContent: (_inventory_movement, submitted) => {
            const rowsMissingItem = (row: MovementRow) => submitted && (row.entryQuantity > 0 || row.exitQuantity > 0) && !row.inventory_item_id;
            const showNoQuantityWarning = submitted && !hasActionableMovements();
            return (
                <>
                    <div className="grid">
                        {movementRows.map((row, index) => (
                            <div key={row.key} className="col-12">
                                <div className="dialog-section">
                                    <div className="dialog-section-header">
                                        <span className="dialog-section-title">Movimiento #{index + 1}</span>
                                        {movementRows.length > 1 && index < movementRows.length - 1 && (
                                            <Button
                                                icon="pi pi-times"
                                                text
                                                severity="danger"
                                                aria-label="Eliminar movimiento"
                                                onClick={() => removeRow(row.key)}
                                            />
                                        )}
                                    </div>
                                    <div className="field dialog-field">
                                        <label htmlFor={`inventory_item_id_${row.key}`} className="font-bold">Artículo</label>
                                        <Dropdown
                                            id={`inventory_item_id_${row.key}`}
                                            value={row.inventory_item_id || null}
                                            options={filteredInventoryItems.map((item) => ({
                                                label: item.description ? `${item.name} ${item.description}` : item.name,
                                                value: item.id,
                                            }))}
                                            onChange={(e: DropdownChangeEvent) => handleItemChange(row.key, Number(e.value))}
                                            filter
                                            placeholder="Busca y selecciona un artículo"
                                            className={classNames({ 'p-invalid': rowsMissingItem(row) })}
                                        />
                                        {rowsMissingItem(row) && <small className="p-error">Selecciona un artículo para este movimiento.</small>}
                                    </div>
                                    <div className="field dialog-field">
                                        <label htmlFor={`entryQuantity_${row.key}`} className="font-bold">Cantidad de Entrada</label>
                                        <InputNumber
                                            id={`entryQuantity_${row.key}`}
                                            value={row.entryQuantity}
                                            onValueChange={(e) => handleQuantityChange(row.key, e.value, 'entryQuantity')}
                                            min={0}
                                            minFractionDigits={0}
                                            maxFractionDigits={2}
                                        />
                                    </div>
                                    <div className="field dialog-field">
                                        <label htmlFor={`exitQuantity_${row.key}`} className="font-bold">Cantidad de Salida</label>
                                        {row.inventory_item_id !== 0 && (
                                            <small className="text-600 block mb-2">Stock disponible: {getAvailableStock(row.inventory_item_id)}</small>
                                        )}
                                        <InputNumber
                                            id={`exitQuantity_${row.key}`}
                                            value={row.exitQuantity}
                                            onValueChange={(e) => handleQuantityChange(row.key, e.value, 'exitQuantity')}
                                            min={0}
                                            minFractionDigits={0}
                                            maxFractionDigits={2}
                                            className={classNames({ 'p-invalid': submitted && row.inventory_item_id !== 0 && row.exitQuantity > getAvailableStock(row.inventory_item_id) })}
                                        />
                                        {submitted && row.inventory_item_id !== 0 && row.exitQuantity > getAvailableStock(row.inventory_item_id) && (
                                            <small className="p-error">Sin stock suficiente para la salida solicitada.</small>
                                        )}
                                    </div>
                                    <div className="field dialog-field">
                                        <label htmlFor={`observation_${row.key}`} className="font-bold">Observación</label>
                                        <InputTextarea
                                            id={`observation_${row.key}`}
                                            value={row.observation}
                                            onChange={(e) => handleObservationChange(row.key, e)}
                                            rows={2}
                                        />
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                    {submitted && insufficientStockItems.length > 0 && (
                        <Message
                            severity="warn"
                            text={`Sin stock suficiente para: ${insufficientStockItems
                                .map((item) => `${item.name} (sol: ${item.requested}, disp: ${item.available})`)
                                .join(' | ')}`}
                        />
                    )}
                    {showNoQuantityWarning && <Message severity="warn" text="Agrega al menos un movimiento con entrada o salida mayor a 0." />}
                    {submitted && zeroQuantityRows.length > 0 && (
                        <Message
                            severity="warn"
                            text={`Revisa las filas sin cantidades: ${zeroQuantityRows
                                .map((row) => getItemLabel(row.inventory_item_id))
                                .join(' | ')}`}
                        />
                    )}
                    <Message severity="info" text="Cada fila permite enviar entrada y/o salida para distintos artículos. Las cantidades empiezan en 0." />
                </>
            );
        },
        getItemDisplayName: (movement) => movement.inventory_item || `Movimiento ${movement.id}`,
        emptyItem: emptyInventoryMovement,
        initialData: inventoryMovements,
        validateItem: () => validateMovements(),
        onSaveItem: async () => {
            return await saveMovements() as any;
        },
        onDeleteItem: async (id: number) => {
            await inventoryItemAPI.deleteMovement(id);
            await refetch();
        },
        enableEditAction: false,
    };
    if (isLoading) {
        return <TableSkeleton rows={7} columns={5} />;
    }

    if (isError) {
        return <Message severity="error" text="Error al cargar el inventario" />;
    }

    return (
        <>
            <Toast ref={toast} position="top-right" />
            <CrudDataTable config={config} />
        </>
    );
}

export default InventoryMovementPage;

