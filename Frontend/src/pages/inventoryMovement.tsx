import CrudDataTable, {type CrudDataTableConfig} from "../components/crudDataTable.tsx";
import {InputNumber} from "primereact/inputnumber";
import {InputTextarea} from "primereact/inputtextarea";
import {Dropdown, type DropdownChangeEvent} from "primereact/dropdown";
import {classNames} from "primereact/utils";
import type {InventoryMovement} from "../types/inventoryMovement.ts";
import {useInventory, useInventoryMovement} from "../hooks/useInventory.ts";
import inventoryItemAPI from "../services/inventoryItemService.ts";
import {useEffect, useState} from "react";
import {ProgressSpinner} from "primereact/progressspinner";
import {Message} from "primereact/message";

const emptyInventoryMovement: InventoryMovement = {
    id: 0,
    item: "",
    user: "",
    quantity: 0,
    movement_type: "",
    observation: "",
    created_at: "",
};

const emptyMovementForm = {
    inventory_item_id: 0,
    observation: "",
    entryQuantity: 0,
    exitQuantity: 0,
};

function InventoryMovementPage() {
    const { data, isLoading, isError, refetch } = useInventoryMovement();
    const { data: inventoryItems = [] } = useInventory('unhidden');
    const [inventoryMovements, setInventoryMovements] = useState<InventoryMovement[]>([]);
    const [movementForm, setMovementForm] = useState(emptyMovementForm);

    useEffect(() => {
        if (data) {
            setInventoryMovements(data);
        }
    }, [data]);

    const handleItemChange = (value: number) => {
        setMovementForm((prev) => ({ ...prev, inventory_item_id: value }));
    };

    const handleObservationChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        setMovementForm((prev) => ({ ...prev, observation: e.target.value }));
    };

    const handleQuantityChange = (value: number | null, field: 'entryQuantity' | 'exitQuantity') => {
        setMovementForm((prev) => ({ ...prev, [field]: value ?? 0 }));
    };

    const saveMovements = async () => {
        const { inventory_item_id, entryQuantity, exitQuantity, observation } = movementForm;
        const userId = 1; // TODO: replace with user id from auth token

        if (!inventory_item_id) return;

        const requests: Promise<any>[] = [];
        if (entryQuantity > 0) {
            requests.push(inventoryItemAPI.createItemEntry(inventory_item_id, { quantity: entryQuantity, observation }, userId));
        }
        if (exitQuantity > 0) {
            requests.push(inventoryItemAPI.createItemExit(inventory_item_id, { quantity: exitQuantity, observation }, userId));
        }

        if (requests.length === 0) return;

        await Promise.all(requests);
        await refetch();
        setMovementForm(emptyMovementForm);
    };

    const config: CrudDataTableConfig<InventoryMovement> = {
        entityName: 'Movimiento de Inventario',
        entityNamePlural: 'Movimientos de Inventario',
        title: 'Gestión de Movimientos de Inventario',
        columns: [
            { field: 'id', header: 'Código', sortable: true, style: { minWidth: '6rem' } },
            { field: 'inventory_item', header: 'Artículo', sortable: true, style: { minWidth: '12rem' } },
            { field: 'user', header: 'Usuario', sortable: true, style: { minWidth: '10rem' } },
            { field: 'quantity', header: 'Cantidad', sortable: true, style: { minWidth: '6rem' } },
            { field: 'movement_type', header: 'Tipo de Movimiento', sortable: true, style: { minWidth: '6rem' } },
            { field: 'observation', header: 'Observación', sortable: false, style: { minWidth: '12rem' } },
            { field: 'created_at', header: 'Fecha', sortable: true, style: { minWidth: '10rem' } },
        ],
        dialogContent: (_inventory_movement, submitted) => {
            const quantitiesInvalid = submitted && movementForm.entryQuantity <= 0 && movementForm.exitQuantity <= 0;
            return (
                <>
                    <div className="field">
                        <label htmlFor="inventory_item_id" className="font-bold">Artículo</label>
                        <Dropdown
                            id="inventory_item_id"
                            value={movementForm.inventory_item_id || null}
                            options={inventoryItems.map((item) => ({ label: item.name, value: item.id }))}
                            onChange={(e: DropdownChangeEvent) => handleItemChange(Number(e.value))}
                            filter
                            placeholder="Busca y selecciona un artículo"
                            className={classNames({ 'p-invalid': submitted && !movementForm.inventory_item_id })}
                        />
                        {submitted && !movementForm.inventory_item_id && <small className="p-error">El artículo es requerido.</small>}
                    </div>
                    <div className="field">
                        <label htmlFor="entryQuantity" className="font-bold">Cantidad de Entrada</label>
                        <InputNumber
                            id="entryQuantity"
                            value={movementForm.entryQuantity}
                            onValueChange={(e) => handleQuantityChange(e.value, 'entryQuantity')}
                            min={0}
                        />
                    </div>
                    <div className="field">
                        <label htmlFor="exitQuantity" className="font-bold">Cantidad de Salida</label>
                        <InputNumber
                            id="exitQuantity"
                            value={movementForm.exitQuantity}
                            onValueChange={(e) => handleQuantityChange(e.value, 'exitQuantity')}
                            min={0}
                        />
                    </div>
                    <div className="field">
                        <label htmlFor="observation" className="font-bold">Observación</label>
                        <InputTextarea
                            id="observation"
                            value={movementForm.observation}
                            onChange={handleObservationChange}
                            rows={3}
                        />
                    </div>
                    {quantitiesInvalid && <Message severity="warn" text="Debes ingresar una cantidad de entrada o salida mayor a 0." />}
                    <Message severity="info" text="Si entrada y salida son 0 no se enviará ninguna solicitud." />
                </>
            );
        },
        getItemDisplayName: (movement) => `${movement.item} - ${movement.movement_type}`,
        emptyItem: emptyInventoryMovement,
        initialData: inventoryMovements,
        validateItem: () => movementForm.inventory_item_id > 0 && (movementForm.entryQuantity > 0 || movementForm.exitQuantity > 0),
        onSaveItem: async () => {
            await saveMovements();
            return { ...emptyInventoryMovement } as InventoryMovement;
        },
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