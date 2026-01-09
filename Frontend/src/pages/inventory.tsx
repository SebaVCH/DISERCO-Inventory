import { InputText } from 'primereact/inputtext';
import { InputTextarea } from 'primereact/inputtextarea';
import { classNames } from 'primereact/utils';
import CrudDataTable from '../components/crudDataTable.tsx';
import type { CrudDataTableConfig } from '../components/crudDataTable.tsx';
import type { InventoryItem } from '../types/inventoryItem.ts';

const initialInventoryItems: InventoryItem[] = [
    {
        id: 1000,
        section: "Areas Verdes",
        name: "Podadora",
        description: "Codigo 1-2-3-4-5-6",
        total_entries: 10,
        total_exits: 5,
        current_stock: 5,
        has_critical_stock: false,
        critical_stock_quantity: 0,
        comments: "Nueva",
    },
    {
        id: 1001,
        name: "Tornillo",
        total_entries: 200,
        total_exits: 50,
        current_stock: 50,
        has_critical_stock: true,
        critical_stock_quantity: 100,
    },
];

const emptyInventoryItem: InventoryItem = {
    id: 0,
    name: "",
    total_entries: 0,
    total_exits: 0,
    current_stock: 0,
    has_critical_stock: false,
    critical_stock_quantity: 0,
};

const hasCriticalStockTemplate = (rowData: InventoryItem) => {
    return rowData.has_critical_stock ? 'Si' : 'No';
};

function Inventory() {
    const config: CrudDataTableConfig<InventoryItem> = {
        entityName: 'Item de Inventario',
        entityNamePlural: 'Items de Inventario',
        title: 'Gestión de inventario',
        columns: [
            { field: 'id', header: 'Código', sortable: true, style: { minWidth: '6rem' } },
            { field: 'section', header: 'Seccion', sortable: true, style: { minWidth: '8rem' } },
            { field: 'name', header: 'Nombre', sortable: true, style: { minWidth: '16rem' } },
            { field: 'description', header: 'Descripcion', sortable: true, style: { minWidth: '16rem' } },
            { field: 'total_entries', header: 'Entradas', sortable: true, style: { minWidth: '7rem' } },
            { field: 'total_exits', header: 'Salidas', sortable: true, style: { minWidth: '7rem' } },
            { field: 'current_stock', header: 'Stock Actual', sortable: true, style: { minWidth: '7rem' } },
            { field: 'has_critical_stock', header: '¿Tiene stock critico?', body: hasCriticalStockTemplate, sortable: true, style: { minWidth: '6rem' } },
            { field: 'critical_stock_quantity', header: 'Stock critico minimo', sortable: true, style: { minWidth: '8rem' } },
            { field: 'comments', header: 'Comentarios', sortable: true, style: { minWidth: '16rem' } },
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
                    <label htmlFor="description" className="font-bold">Descripción</label>
                    <InputTextarea
                        id="description"
                        value={item.description}
                        onChange={(e) => onInputTextAreaChange(e, 'description')}
                        required
                        rows={3}
                        cols={20}
                    />
                </div>
            </>
        ),
        getItemDisplayName: (item) => item.name,
        emptyItem: emptyInventoryItem,
        initialData: initialInventoryItems,
        validateItem: (item) => item.name.trim() !== '',
    };

    return <CrudDataTable config={config} />;
}

export default Inventory;