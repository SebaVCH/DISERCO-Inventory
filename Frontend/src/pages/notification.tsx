import { useState, useRef } from 'react';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Toast } from 'primereact/toast';
import { Button } from 'primereact/button';
import { Toolbar } from 'primereact/toolbar';
import { IconField } from 'primereact/iconfield';
import { InputIcon } from 'primereact/inputicon';
import { Dialog } from 'primereact/dialog';
import { InputText } from 'primereact/inputtext';
import { classNames } from 'primereact/utils';
import type { User } from '../types/user';

const initialUsers: User[] = [
    {
        id: 1,
        email: "test@gmail.com",
        full_name: "test",
        password: "abc123"
    },
];

const emptyUser: User = {
    id: 0,
    email: "",
    full_name: "",
    password: "",
};

function Notification() {
    const [users, setUsers] = useState<User[]>(initialUsers);
    const [userDialog, setUserDialog] = useState<boolean>(false);
    const [deleteUserDialog, setDeleteUserDialog] = useState<boolean>(false);
    const [deleteUsersDialog, setDeleteUsersDialog] = useState<boolean>(false);
    const [user, setUser] = useState<User>(emptyUser);
    const [selectedUsers, setSelectedUsers] = useState<User[]>([]);
    const [submitted, setSubmitted] = useState<boolean>(false);
    const [globalFilter, setGlobalFilter] = useState<string>('');
    const toast = useRef<Toast>(null);
    const dt = useRef<DataTable<User[]>>(null);

    const openNew = () => {
        setUser(emptyUser);
        setSubmitted(false);
        setUserDialog(true);
    };

    const hideDialog = () => {
        setSubmitted(false);
        setUserDialog(false);
    };

    const hideDeleteUserDialog = () => {
        setDeleteUserDialog(false);
    };

    const hideDeleteUsersDialog = () => {
        setDeleteUsersDialog(false);
    };

    const saveUser = () => {
        setSubmitted(true);

        if (user.full_name.trim() && user.email.trim()) {
            const _users = [...users];
            const _user = { ...user };

            _users.push(_user);
            toast.current?.show({
                severity: 'success',
                summary: 'Exitoso',
                detail: 'Usuario agregado a notificaciones',
                life: 3000
            });

            setUsers(_users);
            setUserDialog(false);
            setUser(emptyUser);
        }
    };

    const confirmDeleteUser = (user: User) => {
        setUser(user);
        setDeleteUserDialog(true);
    };

    const deleteUser = () => {
        const _users = users.filter((val) => val.id !== user.id);
        setUsers(_users);
        setDeleteUserDialog(false);
        setUser(emptyUser);
        toast.current?.show({
            severity: 'success',
            summary: 'Exitoso',
            detail: 'Usuario eliminado de notificaciones',
            life: 3000
        });
    };

    const confirmDeleteSelected = () => {
        setDeleteUsersDialog(true);
    };

    const deleteSelectedUsers = () => {
        const _users = users.filter((val) => !selectedUsers.includes(val));
        setUsers(_users);
        setDeleteUsersDialog(false);
        setSelectedUsers([]);
        toast.current?.show({
            severity: 'success',
            summary: 'Exitoso',
            detail: 'Usuarios eliminados de notificaciones',
            life: 3000
        });
    };

    const onInputChange = (e: React.ChangeEvent<HTMLInputElement>, name: string) => {
        const val = (e.target && e.target.value) || '';
        const _user = { ...user, [name]: val };
        setUser(_user);
    };

    const leftToolbarTemplate = () => {
        return (
            <div className="flex flex-wrap gap-2">
                <Button
                    label="Agregar Usuario"
                    icon="pi pi-plus"
                    severity="success"
                    onClick={openNew}
                />
                <Button
                    label="Eliminar"
                    icon="pi pi-trash"
                    severity="danger"
                    onClick={confirmDeleteSelected}
                    disabled={!selectedUsers || !selectedUsers.length}
                />
            </div>
        );
    };

    const actionBodyTemplate = (rowData: User) => {
        return (
            <Button
                icon="pi pi-trash"
                rounded
                outlined
                severity="danger"
                onClick={() => confirmDeleteUser(rowData)}
                tooltip="Eliminar de notificaciones"
                tooltipOptions={{ position: 'top' }}
            />
        );
    };

    const header = (
        <div className="flex flex-wrap gap-2 align-items-center justify-content-between">
            <h4 className="m-0">Gestión de Notificaciones</h4>
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

    const userDialogFooter = (
        <>
            <Button label="Cancelar" icon="pi pi-times" outlined onClick={hideDialog} />
            <Button label="Agregar" icon="pi pi-check" onClick={saveUser} />
        </>
    );

    const deleteUserDialogFooter = (
        <>
            <Button label="No" icon="pi pi-times" outlined onClick={hideDeleteUserDialog} />
            <Button label="Sí" icon="pi pi-check" severity="danger" onClick={deleteUser} />
        </>
    );

    const deleteUsersDialogFooter = (
        <>
            <Button label="No" icon="pi pi-times" outlined onClick={hideDeleteUsersDialog} />
            <Button label="Sí" icon="pi pi-check" severity="danger" onClick={deleteSelectedUsers} />
        </>
    );

    return (
        <div>
            <Toast ref={toast} />
            <div className="card">
                <Toolbar
                    className="mb-4"
                    start={leftToolbarTemplate}
                />

                <DataTable
                    ref={dt}
                    value={users}
                    selection={selectedUsers}
                    selectionMode="multiple"
                    onSelectionChange={(e) => {
                        if (Array.isArray(e.value)) {
                            setSelectedUsers(e.value);
                        }
                    }}
                    dataKey="id"
                    paginator
                    rows={10}
                    rowsPerPageOptions={[5, 10, 25]}
                    paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
                    currentPageReportTemplate="Mostrando {first} a {last} de {totalRecords} usuarios"
                    globalFilter={globalFilter}
                    header={header}
                >
                    <Column selectionMode="multiple" exportable={false}></Column>
                    <Column field="full_name" header="Nombre" sortable style={{ minWidth: '16rem' }} />
                    <Column field="email" header="Correo" sortable style={{ minWidth: '16rem' }} />
                    <Column header="Acciones" body={actionBodyTemplate} exportable={false} style={{ minWidth: '8rem' }} />
                </DataTable>
            </div>

            <Dialog
                visible={userDialog}
                style={{ width: '32rem' }}
                breakpoints={{ '960px': '75vw', '641px': '90vw' }}
                header="Agregar Usuario a Notificaciones"
                modal
                className="p-fluid"
                footer={userDialogFooter}
                onHide={hideDialog}
            >
                <div className="field">
                    <label htmlFor="full_name" className="font-bold">Nombre</label>
                    <InputText
                        id="full_name"
                        value={user.full_name}
                        onChange={(e) => onInputChange(e, 'full_name')}
                        required
                        autoFocus
                        className={classNames({ 'p-invalid': submitted && !user.full_name })}
                    />
                    {submitted && !user.full_name && <small className="p-error">El nombre es requerido.</small>}
                </div>
                <div className="field">
                    <label htmlFor="email" className="font-bold">Correo</label>
                    <InputText
                        id="email"
                        value={user.email}
                        onChange={(e) => onInputChange(e, 'email')}
                        required
                        className={classNames({ 'p-invalid': submitted && !user.email })}
                    />
                    {submitted && !user.email && <small className="p-error">El correo es requerido.</small>}
                </div>
            </Dialog>

            <Dialog
                visible={deleteUserDialog}
                style={{ width: '32rem' }}
                breakpoints={{ '960px': '75vw', '641px': '90vw' }}
                header="Confirmar"
                modal
                footer={deleteUserDialogFooter}
                onHide={hideDeleteUserDialog}
            >
                <div className="confirmation-content">
                    <i className="pi pi-exclamation-triangle mr-3" style={{ fontSize: '2rem' }} />
                    {user && (
                        <span>
                            ¿Está seguro de que desea eliminar a <b>{user.full_name}</b> de las notificaciones?
                        </span>
                    )}
                </div>
            </Dialog>

            <Dialog
                visible={deleteUsersDialog}
                style={{ width: '32rem' }}
                breakpoints={{ '960px': '75vw', '641px': '90vw' }}
                header="Confirmar"
                modal
                footer={deleteUsersDialogFooter}
                onHide={hideDeleteUsersDialog}
            >
                <div className="confirmation-content">
                    <i className="pi pi-exclamation-triangle mr-3" style={{ fontSize: '2rem' }} />
                    {user && <span>¿Está seguro de que desea eliminar los usuarios seleccionados de las notificaciones?</span>}
                </div>
            </Dialog>
        </div>
    );
}

export default Notification;