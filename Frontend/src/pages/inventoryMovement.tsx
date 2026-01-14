import CrudDataTable, {type CrudDataTableConfig} from "../components/crudDataTable.tsx";
import {InputText} from "primereact/inputtext";
import {InputNumber} from "primereact/inputnumber";
import {InputTextarea} from "primereact/inputtextarea";
import {Dropdown, type DropdownChangeEvent} from "primereact/dropdown";
import {classNames} from "primereact/utils";
import type {InventoryMovement} from "../types/inventoryMovement.ts";
import {useInventoryMovement} from "../hooks/useInventory.ts";
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

const movementTypes = [
    { label: 'Entrada', value: 'Entrada' },
    { label: 'Salida', value: 'Salida' },
];

function InventoryMovementPage() {
    const { data, isLoading, isError } = useInventoryMovement()
    const [inventoryMovements, setInventoryMovements] = useState<InventoryMovement[]>([]);

    useEffect(() => {
        if (data) {
            setInventoryMovements(data);
        }
    }, [data]);

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
        dialogContent: (inventory_movement, submitted, onInputChange, onInputTextAreaChange, onInputNumberChange) => (
            <>
                <div className="field">
                    <label htmlFor="item" className="font-bold">Artículo</label>
                    <InputText
                        id="item"
                        value={inventory_movement.item}
                        onChange={(e) => onInputChange(e, 'item')}
                        required
                        autoFocus
                        className={classNames({ 'p-invalid': submitted && !inventory_movement.item })}
                    />
                    {submitted && !inventory_movement.item && <small className="p-error">El artículo es requerido.</small>}
                </div>
                <div className="field">
                    <label htmlFor="user" className="font-bold">Usuario</label>
                    <InputText
                        id="user"
                        value={inventory_movement.user}
                        onChange={(e) => onInputChange(e, 'user')}
                        required
                        className={classNames({ 'p-invalid': submitted && !inventory_movement.user })}
                    />
                    {submitted && !inventory_movement.user && <small className="p-error">El usuario es requerido.</small>}
                </div>
                <div className="field">
                    <label htmlFor="quantity" className="font-bold">Cantidad</label>
                    <InputNumber
                        id="quantity"
                        value={inventory_movement.quantity}
                        onValueChange={(e) => onInputNumberChange(e, 'quantity')}
                        required
                        min={1}
                        className={classNames({ 'p-invalid': submitted && inventory_movement.quantity <= 0 })}
                    />
                    {submitted && inventory_movement.quantity <= 0 && <small className="p-error">La cantidad debe ser mayor a 0.</small>}
                </div>
                <div className="field">
                    <label htmlFor="movement_type" className="font-bold">Tipo de Movimiento</label>
                    <Dropdown
                        id="movement_type"
                        value={inventory_movement.movement_type}
                        options={movementTypes}
                        onChange={(e: DropdownChangeEvent) => onInputChange(e as unknown as React.ChangeEvent<HTMLInputElement>, 'movement_type')}
                        placeholder="Seleccione un tipo"
                        className={classNames({ 'p-invalid': submitted && !inventory_movement.movement_type })}
                    />
                    {submitted && !inventory_movement.movement_type && <small className="p-error">El tipo de movimiento es requerido.</small>}
                </div>
                <div className="field">
                    <label htmlFor="observation" className="font-bold">Observación</label>
                    <InputTextarea
                        id="observation"
                        value={inventory_movement.observation || ''}
                        onChange={(e) => onInputTextAreaChange(e, 'observation')}
                        rows={3}
                    />
                </div>
            </>
        ),
        getItemDisplayName: (movement) => `${movement.item} - ${movement.movement_type}`,
        emptyItem: emptyInventoryMovement,
        initialData: inventoryMovements,
        validateItem: (movement) =>
            movement.item.trim() !== '' &&
            movement.user.trim() !== '' &&
            movement.quantity > 0 &&
            movement.movement_type.trim() !== '',
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