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
import {Dropdown, type DropdownChangeEvent} from "primereact/dropdown";
import {useSection} from "../hooks/useSection.ts";
import type { Section } from "../types/section";
import { queryClient } from "../lib/queryClient.ts";

const emptyInventoryItem: InventoryItem = {
    id: 0,
    name: "",
    total_entries: 0,
    total_exits: 0,
    current_stock: 0,
    has_critical_stock: false,
    critical_stock_quantity: 0,
    is_deleted: false,
    section_id: null,
    section_name: "Sin sección",
    deleted_at: "",
};

const hasCriticalStockTemplate = (rowData: InventoryItem) => rowData.has_critical_stock ? 'Si' : 'No';
const isDeletedTemplate = (rowData: InventoryItem) => rowData.is_deleted ? 'Si' : 'No';
const dateTemplate = (rowData: InventoryItem) => {
    if (!rowData.deleted_at) return '';
    const date = new Date(rowData.deleted_at);
    return date.toLocaleString('es-ES', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
    });
};

function Inventory() {
    const [statusFilter, setStatusFilter] = useState<'all' | 'unhidden' | 'hidden' | 'critical'>('all');
    const { data, isLoading, isError, refetch } = useInventory(statusFilter);
    const [inventoryItems, setInventoryItems] = useState<InventoryItem[]>([]);
    const criticalStockOptions = [{ label: 'No', value: false }, { label: 'Sí', value: true }];
    const { data: sections = [] } = useSection();
    const sectionOptions = [{ label: 'Sin sección', value: null }, ...(sections?.map?.((section: Section) => ({ label: section.name, value: section.id })) || [])];

    const normalizeSectionId = (value: number | string | null | undefined) => {
        if (value === null || value === undefined || value === '') return null;
        return typeof value === 'string' ? Number(value) : value;
    };

    useEffect(() => {
        if (data) {
            const normalizedData = data.map(item => ({
                ...item,
                section_name: item.section_name || 'Sin sección'
            }));
            setInventoryItems(normalizedData);
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
            { field: 'deleted_at', header: 'Fecha de eliminacion/baja?',body: dateTemplate , sortable: true, style: { minWidth: '6rem' } },
        ],
        dialogContent: (item, submitted, onInputChange, onInputTextAreaChange, onInputNumberChange) => (
            <div className="dialog-grid two-columns">
                <div className="field dialog-field">
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
                <div className="field dialog-field">
                    <label htmlFor="description" className="font-bold">Descripción</label>
                    <InputText
                        id="description"
                        value={item.description}
                        onChange={(e) => onInputChange(e, 'description')}
                    />
                </div>

                <div className="field dialog-field">
                    <label htmlFor="has_critical_stock" className="font-bold">¿Tiene stock critico?</label>
                    <SelectButton
                        className="critical-stock-toggle"
                        value={item.has_critical_stock}
                        onChange={(e) => onInputChange({ target: { value: e.value } } as unknown as React.ChangeEvent<HTMLInputElement>, 'has_critical_stock')}
                        options={criticalStockOptions}
                    />
                </div>

                <div className="field dialog-field">
                    <label htmlFor="critical_stock_quantity" className="font-bold">Cantidad de stock critico</label>
                    <InputNumber
                        id="critical_stock_quantity"
                        variant="filled"
                        value={item.critical_stock_quantity ?? 0}
                        onValueChange={(e) => onInputNumberChange({ value: e.value ?? null }, 'critical_stock_quantity')}
                        mode="decimal"
                        minFractionDigits={0}
                        maxFractionDigits={2}
                    />
                </div>

                <div className="field dialog-field">
                    <label htmlFor="comments" className="font-bold">Comentarios</label>
                    <InputTextarea
                        id="comments"
                        value={item.comments}
                        onChange={(e) => onInputTextAreaChange(e, 'comments')}
                        rows={3}
                        cols={20}
                    />
                </div>
                <div className="field dialog-field">
                    <label htmlFor="section_id" className="font-bold">Sección</label>
                    <Dropdown
                        id="section_id"
                        value={normalizeSectionId(item.section_id)}
                        options={sectionOptions}
                        optionLabel="label"
                        optionValue="value"
                        placeholder="Seleccione una sección (opcional)"
                        onChange={(e: DropdownChangeEvent) =>
                            onInputChange(
                                { target: { value: normalizeSectionId(e.value) } } as unknown as React.ChangeEvent<HTMLInputElement>,
                                'section_id'
                            )
                        }
                    />
                </div>
            </div>
        ),
        getItemDisplayName: (item) => item.name,
        emptyItem: emptyInventoryItem,
        initialData: inventoryItems,
        validateItem: (item) => item.name.trim() !== '',
        onDeleteItem: async (id: number) => {
            await inventoryItemAPI.deleteItem(id);
            await refetch();
        },
        onSaveItem: async (item, isNew) => {
            const normalizedSectionId = normalizeSectionId(item.section_id);
            const payload = {
                name: item.name,
                description: item.description,
                has_critical_stock: item.has_critical_stock,
                critical_stock_quantity: item.critical_stock_quantity,
                comments: item.comments,
                section_id: normalizedSectionId,
            };

            if (isNew) {
                const created = await inventoryItemAPI.createItem(payload);
                const section = sections?.find((s: Section) => s.id === created.section_id);
                const itemWithSectionName = {
                    ...created,
                    section_name: section?.name || "Sin sección",
                };
                await queryClient.invalidateQueries({ queryKey: ['inventory'] });
                await refetch();
                return itemWithSectionName;
            }

            await inventoryItemAPI.updateItem(item.id, payload);
            const section = sections?.find((s: Section) => s.id === item.section_id);
            const updated = {
                ...item,
                section_name: section?.name || "Sin sección",
            };
            await queryClient.invalidateQueries({ queryKey: ['inventory'] });
            await refetch();
            return updated;
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
