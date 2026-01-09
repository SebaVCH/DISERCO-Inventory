import React, { useState, useRef } from 'react';
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
        onInputNumberChange: (e: any, name: string) => void
    ) => ReactNode;
    getItemDisplayName: (item: T) => string;
    emptyItem: T;
    initialData: T[];
    validateItem: (item: T) => boolean;
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
    } = config;

    const [items, setItems] = useState<T[]>(initialData);
    const [itemDialog, setItemDialog] = useState<boolean>(false);
    const [deleteItemDialog, setDeleteItemDialog] = useState<boolean>(false);
    const [deleteItemsDialog, setDeleteItemsDialog] = useState<boolean>(false);
    const [item, setItem] = useState<T>(emptyItem);
    const [selectedItems, setSelectedItems] = useState<T[]>([]);
    const [submitted, setSubmitted] = useState<boolean>(false);
    const [globalFilter, setGlobalFilter] = useState<string>('');
    const toast = useRef<Toast>(null);
    const dt = useRef<DataTable<T[]>>(null);

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

    const hideDeleteItemsDialog = () => {
        setDeleteItemsDialog(false);
    };

    const saveItem = () => {
        setSubmitted(true);

        if (validateItem(item)) {
            let _items = [...items];
            let _item = { ...item };

            if (item.id) {
                const index = findIndexById(item.id);
                _items[index] = _item;
                toast.current?.show({
                    severity: 'success',
                    summary: 'Exitoso',
                    detail: `${entityName} Actualizado`,
                    life: 3000
                });
            } else {
                _item.id = createId();
                _items.push(_item);
                toast.current?.show({
                    severity: 'success',
                    summary: 'Exitoso',
                    detail: `${entityName} Creado`,
                    life: 3000
                });
            }

            setItems(_items);
            setItemDialog(false);
            setItem(emptyItem);
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

    const deleteItem = () => {
        let _items = items.filter((val) => val.id !== item.id);
        setItems(_items);
        setDeleteItemDialog(false);
        setItem(emptyItem);
        toast.current?.show({
            severity: 'success',
            summary: 'Exitoso',
            detail: `${entityName} Eliminado`,
            life: 3000
        });
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

    const createId = (): number => {
        let id = '';
        const chars = '0123456789';
        for (let i = 0; i < 5; i++) {
            id += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        return Number(id);
    };

    const confirmDeleteSelected = () => {
        setDeleteItemsDialog(true);
    };

    const deleteSelectedItems = () => {
        let _items = items.filter((val) => !selectedItems.includes(val));
        setItems(_items);
        setDeleteItemsDialog(false);
        setSelectedItems([]);
        toast.current?.show({
            severity: 'success',
            summary: 'Exitoso',
            detail: `${entityNamePlural} Eliminados`,
            life: 3000
        });
    };

    const onInputChange = (e: React.ChangeEvent<HTMLInputElement>, name: string) => {
        const val = (e.target && e.target.value) || '';
        const _item = { ...item, [name]: val } as T;
        setItem(_item);
    };

    const onInputTextAreaChange = (e: React.ChangeEvent<HTMLTextAreaElement>, name: string) => {
        const val = (e.target && e.target.value) || '';
        const _item = { ...item, [name]: val } as T;
        setItem(_item);
    };

    const onInputNumberChange = (e: { value: number | null }, name: string) => {
        const val = e.value ?? 0;
        const _item = { ...item, [name]: val } as T;
        setItem(_item);
    };

    const leftToolbarTemplate = () => {
        return (
            <div className="flex flex-wrap gap-2">
                <Button
                    label="Nuevo"
                    icon="pi pi-plus"
                    severity="success"
                    onClick={openNew}
                />
                <Button
                    label="Eliminar"
                    icon="pi pi-trash"
                    severity="danger"
                    onClick={confirmDeleteSelected}
                    disabled={!selectedItems || !selectedItems.length}
                />
            </div>
        );
    };

    const actionBodyTemplate = (rowData: T) => {
        return (
            <React.Fragment>
                <Button
                    icon="pi pi-pencil"
                    rounded
                    outlined
                    className="mr-2"
                    onClick={() => editItem(rowData)}
                />
                <Button
                    icon="pi pi-trash"
                    rounded
                    outlined
                    severity="danger"
                    onClick={() => confirmDeleteItem(rowData)}
                />
            </React.Fragment>
        );
    };

    const header = (
        <div className="flex flex-wrap gap-2 align-items-center justify-content-between">
            <h4 className="m-0">{title}</h4>
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
    );

    const itemDialogFooter = (
        <React.Fragment>
            <Button label="Cancelar" icon="pi pi-times" outlined onClick={hideDialog} />
            <Button label="Guardar" icon="pi pi-check" onClick={saveItem} />
        </React.Fragment>
    );

    const deleteItemDialogFooter = (
        <React.Fragment>
            <Button label="No" icon="pi pi-times" outlined onClick={hideDeleteItemDialog} />
            <Button label="Sí" icon="pi pi-check" severity="danger" onClick={deleteItem} />
        </React.Fragment>
    );

    const deleteItemsDialogFooter = (
        <React.Fragment>
            <Button label="No" icon="pi pi-times" outlined onClick={hideDeleteItemsDialog} />
            <Button label="Sí" icon="pi pi-check" severity="danger" onClick={deleteSelectedItems} />
        </React.Fragment>
    );

    return (
        <div>
            <Toast ref={toast} />
            <div className="card">
                <Toolbar
                    className="mb-4"
                    left={leftToolbarTemplate}
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
                    rows={10}
                    rowsPerPageOptions={[5, 10, 25]}
                    paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
                    currentPageReportTemplate={`Mostrando {first} a {last} de {totalRecords} ${entityNamePlural.toLowerCase()}`}
                    globalFilter={globalFilter}
                    header={header}
                >
                    <Column selectionMode="multiple" exportable={false}></Column>
                    {columns.map((col, index) => (
                        <Column key={index} {...col} />
                    ))}
                    <Column header="Acciones" body={actionBodyTemplate} exportable={false} style={{ minWidth: '12rem' }} />
                </DataTable>
            </div>

            <Dialog
                visible={itemDialog}
                style={{ width: '32rem' }}
                breakpoints={{ '960px': '75vw', '641px': '90vw' }}
                header={`Detalles del ${entityName}`}
                modal
                className="p-fluid"
                footer={itemDialogFooter}
                onHide={hideDialog}
            >
                {dialogContent(item, submitted, onInputChange, onInputTextAreaChange, onInputNumberChange)}
            </Dialog>

            <Dialog
                visible={deleteItemDialog}
                style={{ width: '32rem' }}
                breakpoints={{ '960px': '75vw', '641px': '90vw' }}
                header="Confirmar"
                modal
                footer={deleteItemDialogFooter}
                onHide={hideDeleteItemDialog}
            >
                <div className="confirmation-content">
                    <i className="pi pi-exclamation-triangle mr-3" style={{ fontSize: '2rem' }} />
                    {item && (
                        <span>
                            ¿Está seguro de que desea eliminar <b>{getItemDisplayName(item)}</b>?
                        </span>
                    )}
                </div>
            </Dialog>

            <Dialog
                visible={deleteItemsDialog}
                style={{ width: '32rem' }}
                breakpoints={{ '960px': '75vw', '641px': '90vw' }}
                header="Confirmar"
                modal
                footer={deleteItemsDialogFooter}
                onHide={hideDeleteItemsDialog}
            >
                <div className="confirmation-content">
                    <i className="pi pi-exclamation-triangle mr-3" style={{ fontSize: '2rem' }} />
                    {item && <span>¿Está seguro de que desea eliminar los {entityNamePlural.toLowerCase()} seleccionados?</span>}
                </div>
            </Dialog>
        </div>
    );
}

export default CrudDataTable;

