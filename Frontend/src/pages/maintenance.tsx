import { useState } from 'react';
import { PickList } from 'primereact/picklist';
import type { PickListChangeEvent } from 'primereact/picklist';
import type {InventoryItem} from "../types/inventoryItem.ts";

const initialProducts: InventoryItem[] = [
    {
        id: 1000,
        section_name: "Areas Verdes",
        name: "Podadora",
        description: "Codigo 1-2-3-4-5-6",
        total_entries: 10,
        total_exits: 5,
        current_stock: 5,
        has_critical_stock: false,
        critical_stock_quantity: 0,
        comments: "Nueva",
        is_deleted: false
    },
    {
        id: 1001,
        name: "Tornillo",
        total_entries: 200,
        total_exits: 50,
        current_stock: 50,
        has_critical_stock: true,
        critical_stock_quantity: 100,
        is_deleted: false
    },
];

function Maintenance() {
    const [source, setSource] = useState<InventoryItem[]>(initialProducts);
    const [target, setTarget] = useState<InventoryItem[]>([]);

    const onChange = (event: PickListChangeEvent) => {
        setSource(event.source);
        setTarget(event.target);
    };

    const itemTemplate = (item: InventoryItem) => {
        return (
            <div className="flex flex-wrap p-2 align-items-center gap-3">
                <div className="flex-1 flex flex-column gap-2">
                    <span className="font-bold">{item.name}</span>
                    <div className="flex align-items-center gap-2">
                        <i className="pi pi-tag text-sm"></i>
                        <span>{item.section_name || 'Sin sección'}</span>
                    </div>
                    {item.description && (
                        <div className="text-sm text-600">
                            {item.description}
                        </div>
                    )}
                    <div className="flex align-items-center gap-2 text-sm">
                        <i className="pi pi-box"></i>
                        <span>Stock: {item.current_stock}</span>
                    </div>
                </div>
            </div>
        );
    };

    return (
        <div className="card">
            <PickList
                dataKey="id"
                source={source}
                target={target}
                onChange={onChange}
                itemTemplate={itemTemplate}
                filter
                filterBy="name,section,description"
                breakpoint="1280px"
                sourceHeader="Disponibles"
                targetHeader="Seleccionados"
                sourceStyle={{ height: '24rem' }}
                targetStyle={{ height: '24rem' }}
                sourceFilterPlaceholder="Buscar por nombre, sección o descripción"
                targetFilterPlaceholder="Buscar por nombre, sección o descripción"
            />
        </div>
    );
}

export default Maintenance