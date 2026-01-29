import CrudDataTable, {type CrudDataTableConfig} from "../components/crudDataTable.tsx";
import {InputNumber} from "primereact/inputnumber";
import {InputTextarea} from "primereact/inputtextarea";
import {Dropdown, type DropdownChangeEvent} from "primereact/dropdown";
import {Button} from "primereact/button";
import {classNames} from "primereact/utils";
import type {InventoryMovement} from "../types/inventoryMovement.ts";
import {useInventory, useInventoryMovement} from "../hooks/useInventory.ts";
import inventoryItemAPI from "../services/inventoryItemService.ts";
import {useEffect, useState} from "react";
import {ProgressSpinner} from "primereact/progressspinner";
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
     const { data: inventoryItems = [] } = useInventory('unhidden');
     const { user } = useUserStore();
     const [inventoryMovements, setInventoryMovements] = useState<InventoryMovement[]>([]);
     const [movementRows, setMovementRows] = useState<MovementRow[]>([createEmptyRow()]);
     const [itemSearch, setItemSearch] = useState("");

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

    const hasValidMovements = () => movementRows.some((row) => row.inventory_item_id && (row.entryQuantity > 0 || row.exitQuantity > 0));

    const saveMovements = async () => {
        const userId = user?.id;
        if (userId === null || userId === undefined) return;
        const actionableRows = movementRows.filter((row) => row.inventory_item_id && (row.entryQuantity > 0 || row.exitQuantity > 0));
        const requests: Promise<any>[] = [];

        actionableRows.forEach((row) => {
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
            if (row.exitQuantity > 0) {
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
        setMovementRows([createEmptyRow()]);
        setItemSearch("");
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
            const showNoQuantityWarning = submitted && !hasValidMovements();
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
                                            options={filteredInventoryItems.map((item) => ({ label: item.name, value: item.id }))}
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
                                        <InputNumber
                                            id={`exitQuantity_${row.key}`}
                                            value={row.exitQuantity}
                                            onValueChange={(e) => handleQuantityChange(row.key, e.value, 'exitQuantity')}
                                            min={0}
                                            minFractionDigits={0}
                                            maxFractionDigits={2}
                                        />
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
                    {showNoQuantityWarning && <Message severity="warn" text="Agrega al menos un movimiento con entrada o salida mayor a 0." />}
                    <Message severity="info" text="Cada fila permite enviar entrada y/o salida para distintos artículos. Las cantidades empiezan en 0." />
                </>
            );
        },
        getItemDisplayName: (movement) => movement.inventory_item || `Movimiento ${movement.id}`,
        emptyItem: emptyInventoryMovement,
        initialData: inventoryMovements,
        validateItem: () => hasValidMovements(),
        onSaveItem: async () => {
            await saveMovements();
            return { ...emptyInventoryMovement } as InventoryMovement;
        },
        onDeleteItem: async (id: number) => {
            await inventoryItemAPI.deleteMovement(id);
            await refetch();
        },
        enableEditAction: false,
    };
    if (isLoading) {
        return <div className="flex justify-content-center mt-5"><ProgressSpinner /></div>;
    }

    if (isError) {
        return <Message severity="error" text="Error al cargar el inventario" />;
    }

    return <CrudDataTable config={config} />;
}

export default InventoryMovementPage;

