import { useMemo, useState } from 'react';
import { Dropdown, type DropdownChangeEvent } from 'primereact/dropdown';
import { InputText } from 'primereact/inputtext';
import { InputTextarea } from 'primereact/inputtextarea';
import { Button } from 'primereact/button';
import { Message } from 'primereact/message';
import TableSkeleton from '../components/TableSkeleton.tsx';
import { classNames } from 'primereact/utils';
import CrudDataTable, { type CrudDataTableConfig } from '../components/crudDataTable.tsx';
import { useMaintenance } from '../hooks/useMaintenance.ts';
import { useInventory } from '../hooks/useInventory.ts';
import maintenanceAPI from '../services/maintenanceService.ts';
import type { MaintenanceAssignment, MaintenanceCreatePayload, MaintenanceRecord } from '../types/maintenance.ts';
import type { InventoryItem } from '../types/inventoryItem.ts';

interface MaintenanceRow {
    key: string;
    inventory_item_id: number;
    inventory_item_maintenance_description: string;
}

const createEmptyRow = (): MaintenanceRow => ({
    key: `${Date.now()}-${Math.random().toString(16).slice(2)}`,
    inventory_item_id: 0,
    inventory_item_maintenance_description: '',
});

const formatItemLabel = (item: InventoryItem) => (item.description ? `${item.name} · ${item.description}` : item.name);

const dateBodyTemplate = (rowData: MaintenanceRecord) => {
    if (!rowData.created_at) return '';
    const date = new Date(rowData.created_at);
    if (Number.isNaN(date.getTime())) return rowData.created_at;
    return date.toLocaleString('es-ES', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
    });
};

const itemsBodyTemplate = (rowData: MaintenanceRecord) => {
    if (!rowData.items.length) return 'Sin artículos';
    return (
        <ul className="list-none m-0 p-0">
            {rowData.items.map((item, index) => (
                <li key={`${rowData.id}-${item.inventory_item_id}-${index}`} className="mb-2">
                    <div className="font-medium">{item.inventory_item_name}</div>
                    <div className="text-sm text-600">
                        {item.inventory_item_description || ''}
                        {item.inventory_item_description && item.inventory_item_section_name ? ' · ' : ''}
                        {item.inventory_item_section_name || ''}
                    </div>
                    <div className="text-sm text-700">{item.inventory_item_maintenance_description}</div>
                </li>
            ))}
        </ul>
    );
};

const mapAssignmentsToRecords = (assignments: MaintenanceAssignment[]): MaintenanceRecord[] => {
    const grouped = new Map<number, MaintenanceRecord>();

    assignments.forEach((assignment) => {
        const maintenanceId = assignment.maintenance_id;
        const maintenanceInfo = assignment.maintenance ?? { id: maintenanceId, description: '', created_at: '' };
        const current = grouped.get(maintenanceId) ?? {
            id: maintenanceInfo.id,
            description: maintenanceInfo.description ?? '',
            created_at: maintenanceInfo.created_at ?? '',
            items: [],
        };

        current.items.push({
            inventory_item_id: assignment.inventory_item_id,
            inventory_item_name: assignment.inventory_item?.name ?? `Artículo ${assignment.inventory_item_id}`,
            inventory_item_section_name: assignment.inventory_item?.section_name,
            inventory_item_description: assignment.inventory_item?.description,
            inventory_item_maintenance_description: assignment.inventory_item_maintenance_description,
        });

        grouped.set(maintenanceId, current);
    });

    return Array.from(grouped.values()).sort((a, b) => {
        const aDate = new Date(a.created_at).getTime();
        const bDate = new Date(b.created_at).getTime();
        return (Number.isNaN(bDate) ? 0 : bDate) - (Number.isNaN(aDate) ? 0 : aDate);
    });
};

function MaintenancePage() {
    const { data: maintenanceAssignments, isLoading, isError, refetch } = useMaintenance();
    const { data: inventoryItems = [], isLoading: isInventoryLoading, isError: isInventoryError } = useInventory('unhidden');
    const [rows, setRows] = useState<MaintenanceRow[]>([createEmptyRow()]);
    const [description, setDescription] = useState('');

    const inventoryIndex = useMemo(() => {
        const map = new Map<number, InventoryItem>();
        inventoryItems.forEach((item) => map.set(item.id, item));
        return map;
    }, [inventoryItems]);

    const maintenanceRecords = useMemo(
        () => mapAssignmentsToRecords(maintenanceAssignments ?? []),
        [maintenanceAssignments]
    );

    const ensureTrailingEmptyRow = (currentRows: MaintenanceRow[]) => {
        const last = currentRows[currentRows.length - 1];
        const hasData = Boolean(last.inventory_item_id || last.inventory_item_maintenance_description.trim());
        return hasData ? [...currentRows, createEmptyRow()] : currentRows;
    };

    const updateRow = (rowKey: string, updater: (row: MaintenanceRow) => MaintenanceRow) => {
        setRows((prev) => {
            const updated = prev.map((row) => (row.key === rowKey ? updater(row) : row));
            return ensureTrailingEmptyRow(updated);
        });
    };

    const removeRow = (rowKey: string) => {
        setRows((prev) => {
            const remaining = prev.filter((row) => row.key !== rowKey);
            if (remaining.length === 0) return [createEmptyRow()];
            return ensureTrailingEmptyRow(remaining);
        });
    };

    const handleItemChange = (rowKey: string, value: number) => {
        updateRow(rowKey, (row) => ({ ...row, inventory_item_id: value }));
    };

    const handleDescriptionChange = (rowKey: string, value: string) => {
        updateRow(rowKey, (row) => ({ ...row, inventory_item_maintenance_description: value }));
    };

    const hasValidItems = rows.some((row) => row.inventory_item_id);

    const saveMaintenance = async (): Promise<MaintenanceRecord> => {
        const actionableRows = rows.filter((row) => row.inventory_item_id);
        const payload: MaintenanceCreatePayload = {
            description: description.trim() || undefined,
            items: actionableRows.map((row) => ({
                inventory_item_id: row.inventory_item_id,
                inventory_item_maintenance_description: row.inventory_item_maintenance_description.trim() || description.trim() || null,
            })),
        };

        const created = await maintenanceAPI.createMaintenance(payload);

        const newRecord: MaintenanceRecord = {
            id: created.id,
            description: created.description ?? description,
            created_at: created.created_at ?? new Date().toISOString(),
            items: actionableRows.map((row) => {
                const item = inventoryIndex.get(row.inventory_item_id);
                return {
                    inventory_item_id: row.inventory_item_id,
                    inventory_item_name: item?.name ?? `Artículo ${row.inventory_item_id}`,
                    inventory_item_section_name: item?.section_name,
                    inventory_item_description: item?.description,
                    inventory_item_maintenance_description: row.inventory_item_maintenance_description.trim() || description || 'Mantenimiento',
                };
            }),
        };

        await refetch();
        setRows([createEmptyRow()]);
        setDescription('');
        return newRecord;
    };

    const config: CrudDataTableConfig<MaintenanceRecord> = {
        entityName: 'Mantenimiento',
        entityNamePlural: 'Mantenimientos',
        title: 'Gestión de Mantenimientos',
        columns: [
            { field: 'id', header: 'Código', sortable: true, style: { minWidth: '6rem' } },
            { field: 'description', header: 'Descripción', sortable: true, style: { minWidth: '12rem' } },
            { field: 'created_at', header: 'Fecha', body: dateBodyTemplate, sortable: true, style: { minWidth: '12rem' } },
            { field: 'items', header: 'Artículos', body: itemsBodyTemplate, sortable: false, style: { minWidth: '18rem' } },
        ],
        dialogContent: (_item, submitted) => {
            const showNoItemsWarning = submitted && !hasValidItems;
            const rowsMissingItem = (row: MaintenanceRow) => submitted && row.inventory_item_maintenance_description.trim() !== '' && !row.inventory_item_id;

            return (
                <>
                    <div className="field dialog-field">
                        <label htmlFor="maintenance_description" className="font-bold">Descripción general</label>
                        <InputText
                            id="maintenance_description"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            placeholder="Descripción del mantenimiento"
                        />
                    </div>
                    <div className="grid">
                        {rows.map((row, index) => (
                            <div key={row.key} className="col-12">
                                <div className="dialog-section">
                                    <div className="dialog-section-header">
                                        <span className="dialog-section-title">Artículo #{index + 1}</span>
                                        {rows.length > 1 && index < rows.length - 1 && (
                                            <Button
                                                icon="pi pi-times"
                                                text
                                                severity="danger"
                                                aria-label="Eliminar artículo"
                                                onClick={() => removeRow(row.key)}
                                            />
                                        )}
                                    </div>
                                    <div className="field dialog-field">
                                        <label htmlFor={`inventory_item_id_${row.key}`} className="font-bold">Artículo</label>
                                        <Dropdown
                                            id={`inventory_item_id_${row.key}`}
                                            value={row.inventory_item_id || null}
                                            options={inventoryItems.map((item) => ({ label: formatItemLabel(item), value: item.id }))}
                                            onChange={(e: DropdownChangeEvent) => handleItemChange(row.key, Number(e.value))}
                                            filter
                                            placeholder="Selecciona un artículo"
                                            className={classNames({ 'p-invalid': rowsMissingItem(row) })}
                                        />
                                        {rowsMissingItem(row) && <small className="p-error">Selecciona un artículo para este mantenimiento.</small>}
                                    </div>
                                    <div className="field dialog-field">
                                        <label htmlFor={`maintenance_desc_${row.key}`} className="font-bold">Descripción del mantenimiento</label>
                                        <InputTextarea
                                            id={`maintenance_desc_${row.key}`}
                                            value={row.inventory_item_maintenance_description}
                                            onChange={(e) => handleDescriptionChange(row.key, e.target.value)}
                                            rows={2}
                                            autoResize
                                            placeholder="Detalle específico del mantenimiento (opcional)"
                                        />
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                    {showNoItemsWarning && <Message severity="warn" text="Agrega al menos un artículo con mantenimiento." />}
                    <Message severity="info" text="Cada fila permite asociar otro artículo al mismo mantenimiento." />
                </>
            );
        },
        getItemDisplayName: (maintenance) => maintenance.description || `Mantenimiento ${maintenance.id}`,
        emptyItem: { id: 0, description: '', created_at: '', items: [] },
        initialData: maintenanceRecords,
        validateItem: () => hasValidItems,
        onSaveItem: async () => saveMaintenance(),
        onDeleteItem: async (id: number) => {
            await maintenanceAPI.deleteMaintenance(id);
            await refetch();
        },
        enableEditAction: false,
    };

    if (isLoading || isInventoryLoading) {
        return <TableSkeleton rows={6} columns={4} />;
    }

    if (isError || isInventoryError) {
        return <Message severity="error" text="Error al cargar mantenimientos" />;
    }

    return <CrudDataTable config={config} />;
}

export default MaintenancePage;
