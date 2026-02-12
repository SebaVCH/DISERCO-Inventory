import React, { useState, useRef, useEffect } from 'react';
import type { ReactNode } from 'react';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import type { ColumnProps } from 'primereact/column';
import { Toast } from 'primereact/toast';
import { Button } from 'primereact/button';
import { Toolbar } from 'primereact/toolbar';
import { IconField } from 'primereact/iconfield';
import { InputIcon } from 'primereact/inputicon';
import { Dialog } from 'primereact/dialog';
import { InputText } from 'primereact/inputtext';
import { Menu } from 'primereact/menu';
import { Checkbox } from 'primereact/checkbox';

export interface BaseEntity {
    id: number;
}

export interface CrudDataTableConfig<T extends BaseEntity> {
    entityName: string;
    entityNamePlural: string;
    title: string;
    columns: ColumnProps[];
    dialogContent: (
        item: T,
        submitted: boolean,
        onInputChange: (e: React.ChangeEvent<HTMLInputElement>, name: string) => void,
        onInputTextAreaChange: (e: React.ChangeEvent<HTMLTextAreaElement>, name: string) => void,
        onInputNumberChange: (e: { value: number | null }, name: string) => void
    ) => ReactNode;
    getItemDisplayName: (item: T) => string;
    emptyItem: T;
    initialData: T[];
    validateItem: (item: T) => boolean;
    onDeleteItem?: (id: number) => Promise<void>;
    onSaveItem?: (item: T, isNew: boolean) => Promise<T | { data: T; suppressMessage?: boolean; skipListUpdate?: boolean }>;
    enableEditAction?: boolean;
    additionalActions?: (item: T) => ReactNode;
    enableCreateAction?: boolean;
    toolbarLeftContent?: ReactNode;
    toolbarRightContent?: ReactNode;
    enableColumnToggle?: boolean;
}

interface CrudDataTableProps<T extends BaseEntity> {
    config: CrudDataTableConfig<T>;
}

function CrudDataTable<T extends BaseEntity>({ config }: CrudDataTableProps<T>) {
    const {
        entityName,
        entityNamePlural,
        title,
        columns,
        dialogContent,
        getItemDisplayName,
        emptyItem,
        initialData,
        validateItem,
        onDeleteItem,
        onSaveItem,
        enableEditAction = true,
        additionalActions,
        enableCreateAction = true,
        toolbarLeftContent,
        toolbarRightContent,
        enableColumnToggle = false,
    } = config;

    const [items, setItems] = useState<T[]>(initialData);
    const [itemDialog, setItemDialog] = useState<boolean>(false);
    const [deleteItemDialog, setDeleteItemDialog] = useState<boolean>(false);
    const [item, setItem] = useState<T>(emptyItem);
    const [selectedItems, setSelectedItems] = useState<T[]>([]);
    const [submitted, setSubmitted] = useState<boolean>(false);
    const [globalFilter, setGlobalFilter] = useState<string>('');
    const [isDeleting, setIsDeleting] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const toast = useRef<Toast>(null);
    const dt = useRef<DataTable<T[]>>(null);
    const columnMenuRef = useRef<Menu>(null);

    // Estado para controlar la visibilidad de las columnas
    const [visibleColumns, setVisibleColumns] = useState<{ [key: string]: boolean }>(() => {
        // Intentar cargar las preferencias desde localStorage
        const storageKey = `columnVisibility_${title.replace(/\s+/g, '_')}`;
        const savedPreferences = localStorage.getItem(storageKey);

        if (savedPreferences) {
            return JSON.parse(savedPreferences);
        }

        // Por defecto, todas las columnas son visibles
        const initialVisibility: { [key: string]: boolean } = {};
        columns.forEach((col, index) => {
            const key = col.field || col.header?.toString() || `column_${index}`;
            initialVisibility[key] = true;
        });
        return initialVisibility;
    });

    useEffect(() => {
        setItems(initialData);
    }, [initialData]);

    // Persistir preferencias de columnas en localStorage
    useEffect(() => {
        const storageKey = `columnVisibility_${title.replace(/\s+/g, '_')}`;
        localStorage.setItem(storageKey, JSON.stringify(visibleColumns));
    }, [visibleColumns, title]);

    const openNew = () => {
        setItem(emptyItem);
        setSubmitted(false);
        setItemDialog(true);
    };

    const hideDialog = () => {
        setSubmitted(false);
        setItemDialog(false);
    };

    const hideDeleteItemDialog = () => {
        setDeleteItemDialog(false);
    };

    const saveItem = async () => {
        setSubmitted(true);

        if (validateItem(item)) {
            setIsSaving(true);
            try {
                const isNew = !item.id;
                const result = onSaveItem ? await onSaveItem(item, isNew) : item;

                let savedItem: T;
                let suppressMessage = false;
                let skipListUpdate = false;

                if (result && typeof result === 'object' && 'data' in result) {
                    savedItem = (result as { data: T }).data;
                    suppressMessage = Boolean((result as { suppressMessage?: boolean }).suppressMessage);
                    skipListUpdate = Boolean((result as { skipListUpdate?: boolean }).skipListUpdate);
                } else {
                    savedItem = result as T;
                }

                const updatedItems = [...items];
                const updatedItem = { ...savedItem };

                if (!skipListUpdate) {
                    if (!isNew) {
                        const index = findIndexById(item.id);
                        if (index !== -1) {
                            updatedItems[index] = updatedItem;
                        }
                    } else {
                        updatedItems.push(updatedItem);
                    }

                    setItems(updatedItems);
                }

                if (!suppressMessage) {
                    toast.current?.show({
                        severity: 'success',
                        summary: 'Exitoso',
                        detail: `${entityName} ${isNew ? 'Creado' : 'Actualizado'}`,
                        life: 3000
                    });
                }

                setItemDialog(false);
                setItem(emptyItem);
            } catch (error: unknown) {
                const isHandled = Boolean((error as { suppressToast?: boolean })?.suppressToast);
                if (!isHandled) {
                    toast.current?.show({
                        severity: 'error',
                        summary: 'Error',
                        detail: `No se pudo ${!item.id ? 'crear' : 'actualizar'} el registro`,
                        life: 3000
                    });
                }
            } finally {
                setIsSaving(false);
            }
        }
    };

    const editItem = (item: T) => {
        setItem({ ...item });
        setItemDialog(true);
    };

    const confirmDeleteItem = (item: T) => {
        setItem(item);
        setDeleteItemDialog(true);
    };

    const deleteItem = async () => {
        try {
            setIsDeleting(true);
            if (onDeleteItem) {
                await onDeleteItem(item.id);
            }
            const remainingItems = items.filter((val) => val.id !== item.id);
            setItems(remainingItems);
            toast.current?.show({
                severity: 'success',
                summary: 'Exitoso',
                detail: `${entityName} Eliminado`,
                life: 3000
            });
        } catch (_error) {
            toast.current?.show({
                severity: 'error',
                summary: 'Error',
                detail: 'No se pudo eliminar el registro',
                life: 3000
            });
        } finally {
            setIsDeleting(false);
            setDeleteItemDialog(false);
            setItem(emptyItem);
        }
    };

    const findIndexById = (id: number) => {
        let index = -1;
        for (let i = 0; i < items.length; i++) {
            if (items[i].id === id) {
                index = i;
                break;
            }
        }
        return index;
    };

    const onInputChange = (e: React.ChangeEvent<HTMLInputElement>, name: string) => {
        const val = e.target?.value === undefined ? '' : e.target.value;
        const _item = { ...item, [name]: val } as T;
        setItem(_item);
    };

    const onInputTextAreaChange = (e: React.ChangeEvent<HTMLTextAreaElement>, name: string) => {
        const val = e.target?.value ?? '';
        const _item = { ...item, [name]: val } as T;
        setItem(_item);
    };

    const onInputNumberChange = (e: { value: number | null }, name: string) => {
        const val = e.value ?? 0;
        const _item = { ...item, [name]: val } as T;
        setItem(_item);
    };

    const toggleColumnVisibility = (columnKey: string) => {
        setVisibleColumns(prev => ({
            ...prev,
            [columnKey]: !prev[columnKey]
        }));
    };

    const toggleAllColumns = (visible: boolean) => {
        const newVisibility: { [key: string]: boolean } = {};
        columns.forEach((col, index) => {
            const key = col.field || col.header?.toString() || `column_${index}`;
            newVisibility[key] = visible;
        });
        setVisibleColumns(newVisibility);
    };

    const getColumnKey = (col: ColumnProps, index: number): string => {
        return col.field || col.header?.toString() || `column_${index}`;
    };

    const leftToolbarTemplate = () => {
        return (
            <div className="flex flex-wrap gap-2 align-items-center">
                {enableCreateAction && (
                    <Button
                        label="Nuevo"
                        icon="pi pi-plus"
                        severity="success"
                        onClick={openNew}
                    />
                )}
                {toolbarLeftContent}
            </div>
        );
    };

    const rightToolbarTemplate = () => {
        return (
            <div className="flex flex-wrap gap-2 align-items-center justify-content-end">
                {toolbarRightContent}
            </div>
        );
    };

    const actionBodyTemplate = (rowData: T) => {
        return (
            <div className="flex gap-2">
                {additionalActions && additionalActions(rowData)}
                {enableEditAction && (
                    <Button
                        icon="pi pi-pencil"
                        rounded
                        outlined
                        className="mr-2"
                        disabled={isDeleting}
                        onClick={() => editItem(rowData)}
                    />
                )}
                <Button
                    icon="pi pi-trash"
                    rounded
                    outlined
                    severity="danger"
                    disabled={isDeleting}
                    onClick={() => confirmDeleteItem(rowData)}
                />
            </div>
        );
    };

    const header = (
        <div className="flex flex-wrap gap-2 align-items-center justify-content-between">
            <h4 className="m-0">{title}</h4>
            <div className="flex gap-2 align-items-center">
                {enableColumnToggle && (
                    <Button
                        icon="pi pi-table"
                        rounded
                        outlined
                        tooltip="Mostrar/Ocultar Columnas"
                        tooltipOptions={{ position: 'top' }}
                        onClick={(e) => columnMenuRef.current?.toggle(e)}
                    />
                )}
                <IconField iconPosition="left">
                    <InputIcon className="pi pi-search" />
                    <InputText
                        type="search"
                        placeholder="Buscar..."
                        onInput={(e) => {
                            const target = e.target as HTMLInputElement;
                            setGlobalFilter(target.value);
                        }}
                    />
                </IconField>
            </div>
        </div>
    );

    const itemDialogFooter = (
        <React.Fragment>
            <Button label="Guardar" icon="pi pi-check" onClick={saveItem} disabled={isSaving} loading={isSaving} />
        </React.Fragment>
    );

    const deleteItemDialogFooter = (
        <React.Fragment>
            <Button label="No" onClick={hideDeleteItemDialog} disabled={isDeleting} />
            <Button label="Sí" severity="danger" onClick={deleteItem} disabled={isDeleting} />
        </React.Fragment>
    );

    return (
        <div>
            <Toast ref={toast} />
            <Menu
                ref={columnMenuRef}
                popup
                model={[
                    {
                        template: () => (
                            <div className="p-3" style={{ minWidth: '250px' }}>
                                <div className="flex align-items-center justify-content-between mb-3">
                                    <span className="font-bold">Columnas Visibles</span>
                                    <Button
                                        label="Todas"
                                        size="small"
                                        text
                                        onClick={() => toggleAllColumns(true)}
                                    />
                                </div>
                                <div className="flex flex-column gap-2">
                                    {columns.map((col, index) => {
                                        const columnKey = getColumnKey(col, index);
                                        const columnLabel = col.header?.toString() || `Columna ${index + 1}`;
                                        return (
                                            <div key={columnKey} className="flex align-items-center">
                                                <Checkbox
                                                    inputId={`col-${columnKey}`}
                                                    checked={visibleColumns[columnKey] ?? true}
                                                    onChange={() => toggleColumnVisibility(columnKey)}
                                                />
                                                <label htmlFor={`col-${columnKey}`} className="ml-2 cursor-pointer">
                                                    {columnLabel}
                                                </label>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        )
                    }
                ]}
            />
            <div className="card">
                <Toolbar
                    className="mb-4"
                    left={leftToolbarTemplate}
                    right={rightToolbarTemplate}
                />

                <DataTable
                    ref={dt}
                    value={items}
                    selection={selectedItems}
                    selectionMode="multiple"
                    onSelectionChange={(e) => {
                        if (Array.isArray(e.value)) {
                            setSelectedItems(e.value);
                        }
                    }}
                    dataKey="id"
                    paginator
                    rows={5}
                    rowsPerPageOptions={[5, 10, 20, 30]}
                    paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
                    currentPageReportTemplate={`Mostrando {first} a {last} de {totalRecords} ${entityNamePlural.toLowerCase()}`}
                    globalFilter={globalFilter}
                    header={header}
                    emptyMessage={`No hay ${entityNamePlural.toLowerCase()} registrados`}
                >
                    {columns.map((col, index) => {
                        const columnKey = getColumnKey(col, index);
                        if (!visibleColumns[columnKey] && visibleColumns[columnKey] !== undefined) {
                            return null;
                        }
                        return <Column key={index} {...col} />;
                    })}
                    <Column header="Acciones" body={actionBodyTemplate} exportable={false} style={{ minWidth: '8rem' }} />
                </DataTable>
            </div>

            <Dialog
                visible={itemDialog}
                style={{ width: '32rem' }}
                breakpoints={{ '960px': '75vw', '641px': '90vw' }}
                header={`Detalles del ${entityName}`}
                modal
                className="app-dialog"
                contentClassName="dialog-content"
                footer={itemDialogFooter}
                onHide={hideDialog}
            >
                <div className="dialog-surface dialog-grid">
                    {dialogContent(item, submitted, onInputChange, onInputTextAreaChange, onInputNumberChange)}
                </div>
            </Dialog>

            <Dialog
                visible={deleteItemDialog}
                style={{ width: '32rem' }}
                breakpoints={{ '960px': '75vw', '641px': '90vw' }}
                header="Confirmar"
                modal
                className="app-dialog"
                footer={deleteItemDialogFooter}
                onHide={hideDeleteItemDialog}
            >
                <div className="dialog-surface">
                    <div className="confirmation-content">
                        <i className="pi pi-exclamation-triangle mr-3" style={{ fontSize: '2rem' }} />
                        {item && (
                            <span>
                                ¿Está seguro de que desea eliminar <b>{getItemDisplayName(item)}</b>?
                            </span>
                        )}
                    </div>
                </div>
            </Dialog>
        </div>
    );
}

export default CrudDataTable;

