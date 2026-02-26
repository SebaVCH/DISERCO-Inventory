import CrudDataTable, {type CrudDataTableConfig} from "../components/crudDataTable.tsx";
import {InputNumber} from "primereact/inputnumber";
import {InputTextarea} from "primereact/inputtextarea";
import {Dropdown, type DropdownChangeEvent} from "primereact/dropdown";
import {InputText} from "primereact/inputtext";
import {Button} from "primereact/button";
import {classNames} from "primereact/utils";
import type {InventoryMovement} from "../types/inventoryMovement.ts";
import {useInventory, useInventoryMovement} from "../hooks/useInventory.ts";
import inventoryItemAPI from "../services/inventoryItemService.ts";
import {useEffect, useMemo, useRef, useState} from "react";
import {Toast} from "primereact/toast";
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

const createEmptyRow = (observation = ""): MovementRow => ({
    key: `${Date.now()}-${Math.random().toString(16).slice(2)}`,
    inventory_item_id: 0,
    observation,
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
     const [documentType, setDocumentType] = useState<'ACTA_DE_ENTREGA' | 'SALIDA'>('SALIDA');
     const [documentFolio, setDocumentFolio] = useState("");
     const [documentDate, setDocumentDate] = useState(() => {
         const now = new Date();
         const day = String(now.getDate()).padStart(2, '0');
         const month = String(now.getMonth() + 1).padStart(2, '0');
         const year = now.getFullYear();
         return `${day}.${month}.${year}`;
     });

    const documentTypeOptions = [
        { label: 'Acta de entrega', value: 'ACTA_DE_ENTREGA' },
        { label: 'Salida', value: 'SALIDA' }
    ];

    const getItemLabel = (itemId: number) => {
        const item = inventoryItems.find((inv) => inv.id === itemId);
        if (!item) return "Artículo";
        return item.description ? `${item.name} ${item.description}` : item.name;
    };

    const getAvailableStock = (itemId: number) => {
        const item = inventoryItems.find((inv) => inv.id === itemId);
        return item?.current_stock ?? 0;
    };

    const toolObservationPrefix = "Persona a cargo:";

    const isValidDocumentDate = (value: string) => /^\d{2}\.\d{2}\.\d{4}$/.test(value.trim());

    const buildDocumentPrefix = () => {
        if (!isValidDocumentDate(documentDate)) return "";
        const formattedDate = documentDate.trim();
        if (documentType === 'SALIDA') {
            const trimmedFolio = documentFolio.trim();
            return trimmedFolio
                ? `SALIDA N°${trimmedFolio} - ${formattedDate}`
                : `SALIDA - ${formattedDate}`;
        }
        return `ACTA DE ENTREGA - ${formattedDate}`;
    };

    const sanitizeDocumentDateInput = (raw: string) =>
        raw.replace(/[^\d.]/g, '').slice(0, 10);

    const documentPrefix = useMemo(() => buildDocumentPrefix(), [documentType, documentFolio, documentDate]);

    const isToolItem = (itemId: number) => {
        const item = inventoryItems.find((inv) => inv.id === itemId);
        return item?.is_tool ?? false;
    };

    const stripToolObservationPrefix = (text: string) => {
        const trimmed = text.trimStart();
        if (trimmed.toLowerCase().startsWith(toolObservationPrefix.toLowerCase())) {
            return trimmed.slice(toolObservationPrefix.length).trimStart();
        }
        return text;
    };

    const stripDocumentPrefix = (text: string) => {
        const trimmed = text.trimStart();
        const salidaMatch = /^SALIDA(?:\s+N°\S+)?\s+-\s+\d{2}\.\d{2}\.\d{4}\s*/i;
        const actaMatch = /^ACTA DE ENTREGA\s+-\s+\d{2}\.\d{2}\.\d{4}\s*/i;
        if (salidaMatch.test(trimmed)) {
            return trimmed.replace(salidaMatch, '');
        }
        if (actaMatch.test(trimmed)) {
            return trimmed.replace(actaMatch, '');
        }
        return text;
    };

    const applyObservationPrefixes = (text: string, isTool: boolean) => {
        const withoutDoc = stripDocumentPrefix(text);
        const withoutTool = stripToolObservationPrefix(withoutDoc);
        const cleaned = withoutTool.trimStart();
        const parts: string[] = [];
        if (documentPrefix) {
            parts.push(documentPrefix);
        }
        if (isTool) {
            parts.push(toolObservationPrefix);
        }
        if (cleaned) {
            parts.push(cleaned);
        }
        return parts.join(' ').trim();
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

    useEffect(() => {
        setMovementRows((prev) =>
            prev.map((row) => ({
                ...row,
                observation: applyObservationPrefixes(row.observation, isToolItem(row.inventory_item_id))
            }))
        );
    }, [documentPrefix, inventoryItems]);

    const filteredInventoryItems = inventoryItems.filter((item) =>
        item.name.toLowerCase().includes(itemSearch.toLowerCase())
    );

    const ensureTrailingEmptyRow = (rows: MovementRow[]) => {
        const last = rows[rows.length - 1];
        const hasData = Boolean(last.inventory_item_id || last.entryQuantity > 0 || last.exitQuantity > 0 || last.observation.trim());
        return hasData ? [...rows, createEmptyRow(documentPrefix)] : rows;
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
                return [createEmptyRow(documentPrefix)];
            }
            return ensureTrailingEmptyRow(remaining);
        });
    };

    const handleItemChange = (rowKey: string, value: number) => {
        updateRow(rowKey, (row) => {
            const isTool = isToolItem(value);
            return {
                ...row,
                inventory_item_id: value,
                observation: applyObservationPrefixes(row.observation, isTool),
            };
        });
    };

    const handleObservationChange = (rowKey: string, e: React.ChangeEvent<HTMLTextAreaElement>) => {
        const text = e.target.value;
        updateRow(rowKey, (row) => ({
            ...row,
            observation: applyObservationPrefixes(text, isToolItem(row.inventory_item_id)),
        }));
    };

    const handleQuantityChange = (rowKey: string, value: number | null | undefined, field: 'entryQuantity' | 'exitQuantity') => {
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
                    <div className="dialog-section">
                        <div className="dialog-section-header">
                            <span className="dialog-section-title">Documento del movimiento</span>
                        </div>
                        <div className="dialog-doc-row">
                            <div className="field dialog-field dialog-doc-field">
                                <label htmlFor="movementDocType" className="font-bold">Tipo de documento</label>
                                <Dropdown
                                    id="movementDocType"
                                    value={documentType}
                                    options={documentTypeOptions}
                                    onChange={(e: DropdownChangeEvent) => setDocumentType(e.value)}
                                    placeholder="Selecciona un tipo"
                                />
                            </div>
                            {documentType === 'SALIDA' && (
                                <div className="field dialog-field dialog-doc-field">
                                    <label htmlFor="movementDocFolio" className="font-bold">N° de folio</label>
                                    <InputText
                                        id="movementDocFolio"
                                        value={documentFolio}
                                        onChange={(e) => setDocumentFolio(e.target.value)}
                                        placeholder="Ej: 299"
                                    />
                                </div>
                            )}
                            <div className="field dialog-field dialog-doc-field">
                                <label htmlFor="movementDocDate" className="font-bold">Fecha</label>
                                <InputText
                                    id="movementDocDate"
                                    value={documentDate}
                                    onChange={(e) => setDocumentDate(sanitizeDocumentDateInput(e.target.value))}
                                    placeholder="dd.mm.aaaa"
                                    inputMode="numeric"
                                    maxLength={10}
                                />
                            </div>
                        </div>
                        {documentPrefix && (
                            <small className="text-600">Vista previa: {documentPrefix}</small>
                        )}
                    </div>
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
                                        <label htmlFor={`entryQuantity_${row.key}`} className="font-bold">
                                            Cantidad de <span style={{ color: '#16a34a' }}>Entrada</span>
                                        </label>
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
                                        <label htmlFor={`exitQuantity_${row.key}`} className="font-bold">
                                            Cantidad de <span style={{ color: '#dc2626' }}>Salida</span>
                                        </label>
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
        isLoading: isLoading,
        skeletonRows: 7,
        onSaveItem: async () => {
            return await saveMovements() as any;
        },
        onDeleteItem: async (id: number) => {
            await inventoryItemAPI.deleteMovement(id);
            await refetch();
        },
        enableEditAction: false,
    };

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

