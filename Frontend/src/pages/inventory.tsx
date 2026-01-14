import { InputText } from 'primereact/inputtext';
import { InputTextarea } from 'primereact/inputtextarea';
import { classNames } from 'primereact/utils';
import CrudDataTable from '../components/crudDataTable.tsx';
import type { CrudDataTableConfig } from '../components/crudDataTable.tsx';
import type { InventoryItem } from '../types/inventoryItem.ts';
import {useEffect, useState} from "react";
import { ProgressSpinner } from "primereact/progressspinner";
import { Message } from "primereact/message";
import {RadioButton} from "primereact/radiobutton";
import {useInventory} from "../hooks/useInventory.ts";
import {SelectButton} from "primereact/selectbutton";
import {InputNumber} from "primereact/inputnumber";
import inventoryItemAPI from "../services/inventoryItemService.ts";

const emptyInventoryItem: InventoryItem = {
    id: 0,
    name: "",
    total_entries: 0,
    total_exits: 0,
    current_stock: 0,
    has_critical_stock: false,
    critical_stock_quantity: 0,
    is_deleted: false,
};

const hasCriticalStockTemplate = (rowData: InventoryItem) => rowData.has_critical_stock ? 'Si' : 'No';
const isDeletedTemplate = (rowData: InventoryItem) => rowData.is_deleted ? 'Si' : 'No';

function Inventory() {
    const [statusFilter, setStatusFilter] = useState<'all' | 'unhidden' | 'hidden' | 'critical'>('all');
    const { data, isLoading, isError } = useInventory(statusFilter);
    const [inventoryItems, setInventoryItems] = useState<InventoryItem[]>([]);
    const options = ['off', 'on'];
    const [value, setValue] = useState(options[0]);
    const [defaultValueNumber, setdefaultValueNumber] = useState(100);

    useEffect(() => {
        if (data) {
            setInventoryItems(data);
        }
    }, [data]);

    const config: CrudDataTableConfig<InventoryItem> = {
        entityName: 'Item de Inventario',
        entityNamePlural: 'Items de Inventario',
        title: 'Gestión de inventario',
        columns: [
            { field: 'id', header: 'Código', sortable: true, style: { minWidth: '5rem' } },
            { field: 'section_name', header: 'Sección', sortable: true, style: { minWidth: '7rem' } },
            { field: 'name', header: 'Nombre', sortable: true, style: { minWidth: '8rem' } },
            { field: 'description', header: 'Descripción', sortable: true, style: { minWidth: '12rem' } },
            { field: 'total_entries', header: 'Entradas', sortable: true, style: { minWidth: '6rem' } },
            { field: 'total_exits', header: 'Salidas', sortable: true, style: { minWidth: '6rem' } },
            { field: 'current_stock', header: 'Stock Actual', sortable: true, style: { minWidth: '4rem' } },
            { field: 'has_critical_stock', header: '¿Tiene stock crítico?', body: hasCriticalStockTemplate, sortable: true, style: { minWidth: '6rem' } },
            { field: 'critical_stock_quantity', header: 'Stock crítico minimo', sortable: true, style: { minWidth: '8rem' } },
            { field: 'comments', header: 'Comentarios', sortable: true, style: { minWidth: '8rem' } },
            { field: 'is_deleted', header: '¿Esta eliminado?', body: isDeletedTemplate, sortable: true, style: { minWidth: '6rem' } },
        ],
        dialogContent: (item, submitted, onInputChange, onInputTextAreaChange) => (
            <>
                <div className="field">
                    <label htmlFor="name" className="font-bold">Nombre</label>
                    <InputText
                        id="name"
                        value={item.name}
                        onChange={(e) => onInputChange(e, 'name')}
                        required
                        autoFocus
                        className={classNames({ 'p-invalid': submitted && !item.name })}
                    />
                    {submitted && !item.name && <small className="p-error">El nombre es requerido.</small>}
                </div>

                <div className="field">
                    <label htmlFor="name" className="font-bold">Descripción</label>
                    <InputText
                        id="description"
                        value={item.description}
                        onChange={(e) => onInputChange(e, 'description')}
                        required
                        autoFocus
                        className={classNames({ 'p-invalid': submitted && !item.name })}
                    />
                </div>

                <div className="field">
                    <label htmlFor="has_critical_stock" className="font-bold">¿Tiene stock critico?</label>
                    <SelectButton value={value} onChange={(e) => setValue(e.value)} options={options} />
                </div>

                <div className="field">
                    <label htmlFor="critical_stock_quantity" className="font-bold">Cantidad de stock critico</label>
                    <InputNumber variant="filled" value={defaultValueNumber} onValueChange={(e) => setdefaultValueNumber(e.value)} mode="decimal" minFractionDigits={2} />
                </div>

                <div className="field">
                    <label htmlFor="comments" className="font-bold">Comentarios</label>
                    <InputTextarea
                        id="comments"
                        value={item.comments}
                        onChange={(e) => onInputTextAreaChange(e, 'comments')}
                        required
                        rows={3}
                        cols={20}
                    />
                </div>
            </>
        ),
        getItemDisplayName: (item) => item.name,
        emptyItem: emptyInventoryItem,
        initialData: inventoryItems,
        validateItem: (item) => item.name.trim() !== '',
        onDeleteItem: async (id: number) => {
            await inventoryItemAPI.deleteItem(id);
            setInventoryItems((prev) => prev.filter((it) => it.id !== id));
        },
    };

    if (isLoading) {
        return <div className="flex justify-content-center mt-5"><ProgressSpinner /></div>;
    }

    if (isError) {
        return <Message severity="error" text="Error al cargar el inventario" />;
    }

    return <div>
        <CrudDataTable config={config} />
        <div className="card flex justify-content-center mb-3">
            <div className="flex flex-wrap gap-3">
                <div className="flex align-items-center">
                    <RadioButton inputId="inv-status-all" name="inv-status" value="all" onChange={(e) => setStatusFilter(e.value)} checked={statusFilter === 'all'} />
                    <label htmlFor="inv-status-all" className="ml-2">Todos</label>
                </div>
                <div className="flex align-items-center">
                    <RadioButton inputId="inv-status-unhidden" name="inv-status" value="unhidden" onChange={(e) => setStatusFilter(e.value)} checked={statusFilter === 'unhidden'} />
                    <label htmlFor="inv-status-unhidden" className="ml-2">No eliminados</label>
                </div>
                <div className="flex align-items-center">
                    <RadioButton inputId="inv-status-hidden" name="inv-status" value="hidden" onChange={(e) => setStatusFilter(e.value)} checked={statusFilter === 'hidden'} />
                    <label htmlFor="inv-status-hidden" className="ml-2">Eliminados</label>
                </div>
                <div className="flex align-items-center">
                    <RadioButton inputId="inv-critical" name="inv-status" value="critical" onChange={(e) => setStatusFilter(e.value)} checked={statusFilter === 'critical'} />
                    <label htmlFor="inv-critical" className="ml-2">Stock Critico</label>
                </div>
            </div>
        </div>
    </div>;
}

export default Inventory;