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
    onDeleteItem?: (id: number) => Promise<void>;
    onSaveItem?: (item: T, isNew: boolean) => Promise<T>;
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
    } = config;

    const [items, setItems] = useState<T[]>(initialData);
    const [itemDialog, setItemDialog] = useState<boolean>(false);
    const [deleteItemDialog, setDeleteItemDialog] = useState<boolean>(false);
    const [item, setItem] = useState<T>(emptyItem);
    const [selectedItems, setSelectedItems] = useState<T[]>([]);
    const [submitted, setSubmitted] = useState<boolean>(false);
    const [globalFilter, setGlobalFilter] = useState<string>('');
    const [isDeleting, setIsDeleting] = useState(false);
    const toast = useRef<Toast>(null);
    const dt = useRef<DataTable<T[]>>(null);

    useEffect(() => {
        setItems(initialData);
    }, [initialData]);

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
            try {
                const isNew = !item.id;
                const savedItem = onSaveItem ? await onSaveItem(item, isNew) : item;
                let _items = [...items];
                let _item = { ...savedItem };

                if (!isNew) {
                    const index = findIndexById(item.id);
                    if (index !== -1) {
                        _items[index] = _item;
                    }
                } else {
                    _items.push(_item);
                }

                setItems(_items);
                toast.current?.show({
                    severity: 'success',
                    summary: 'Exitoso',
                    detail: `${entityName} ${isNew ? 'Creado' : 'Actualizado'}`,
                    life: 3000
                });
                setItemDialog(false);
                setItem(emptyItem);
            } catch (error) {
                toast.current?.show({
                    severity: 'error',
                    summary: 'Error',
                    detail: `No se pudo ${!item.id ? 'crear' : 'actualizar'} el registro`,
                    life: 3000
                });
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
            let _items = items.filter((val) => val.id !== item.id);
            setItems(_items);
            toast.current?.show({
                severity: 'success',
                summary: 'Exitoso',
                detail: `${entityName} Eliminado`,
                life: 3000
            });
        } catch (error) {
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
        const val = e.target?.value ?? '';
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

    const leftToolbarTemplate = () => {
        return (
            <div className="flex flex-wrap gap-2">
                <Button
                    label="Nuevo"
                    icon="pi pi-plus"
                    severity="success"
                    onClick={openNew}
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
                    disabled={isDeleting}
                    onClick={() => editItem(rowData)}
                />
                <Button
                    icon="pi pi-trash"
                    rounded
                    outlined
                    severity="danger"
                    disabled={isDeleting}
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
            <Button label="No" icon="pi pi-times" outlined onClick={hideDeleteItemDialog} disabled={isDeleting} />
            <Button label="Sí" icon="pi pi-check" severity="danger" onClick={deleteItem} loading={isDeleting} />
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
                    emptyMessage={`No hay ${entityNamePlural.toLowerCase()} registrados`}
                >
                    {columns.map((col, index) => (
                        <Column key={index} {...col} />
                    ))}
                    <Column header="Acciones" body={actionBodyTemplate} exportable={false} style={{ minWidth: '8rem' }} />
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
        </div>
    );
}

export default CrudDataTable;

