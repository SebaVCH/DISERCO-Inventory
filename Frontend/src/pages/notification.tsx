import type React from 'react';
import {useEffect, useMemo, useState} from 'react';
import {Dropdown, type DropdownChangeEvent} from 'primereact/dropdown';
import {classNames} from 'primereact/utils';
import {ProgressSpinner} from 'primereact/progressspinner';
import {Message} from 'primereact/message';
import CrudDataTable, {type CrudDataTableConfig} from '../components/crudDataTable.tsx';
import {useNotificationSubscriptions} from '../hooks/useNotificationSubscription.ts';
import {useUser} from '../hooks/useUser.ts';
import type {NotificationSubscription} from '../types/notificationSubscription.ts';
import type {UserProfile} from '../types/user.ts';
import notificationAPI from '../services/notificationService.ts';

const emptySubscription: NotificationSubscription = {
    id: 0,
    user_id: 0,
    user: undefined,
};

function NotificationPage() {
    const { data: subscriptionsData = [], isLoading: isLoadingSubscriptions, isError: isErrorSubscriptions } = useNotificationSubscriptions();
    const { data: usersData = [], isLoading: isLoadingUsers, isError: isErrorUsers } = useUser();
    const [subscriptions, setSubscriptions] = useState<NotificationSubscription[]>([]);

    useEffect(() => {
        setSubscriptions((subscriptionsData ?? []).filter((sub) => sub.user_id !== 0));
    }, [subscriptionsData]);

    const eligibleUsers = useMemo<UserProfile[]>(() => {
        const subscribedIds = new Set(subscriptions.map((sub) => sub.user_id));
        return (usersData ?? []).filter((user) => user.id !== 0 && !subscribedIds.has(user.id));
    }, [subscriptions, usersData]);

    const config: CrudDataTableConfig<NotificationSubscription> = {
        entityName: 'Suscripción',
        entityNamePlural: 'Suscripciones',
        title: 'Gestión de Notificaciones',
        columns: [
            { field: 'id', header: 'ID', sortable: true, style: { minWidth: '6rem' } },
            { header: 'Nombre', body: (rowData) => rowData.user?.full_name ?? '—', style: { minWidth: '16rem' } },
            { header: 'Correo', body: (rowData) => rowData.user?.email ?? '—', style: { minWidth: '16rem' } },
        ],
        dialogContent: (subscription, submitted, onInputChange) => (
            <div className="field">
                <label htmlFor="user_id" className="font-bold">Usuario</label>
                <Dropdown
                    id="user_id"
                    value={subscription.user_id || null}
                    options={eligibleUsers}
                    optionLabel="full_name"
                    optionValue="id"
                    placeholder={eligibleUsers.length ? 'Seleccione un usuario' : 'No hay usuarios disponibles'}
                    onChange={(e: DropdownChangeEvent) => onInputChange({ target: { value: e.value } } as unknown as React.ChangeEvent<HTMLInputElement>, 'user_id')}
                    className={classNames({ 'p-invalid': submitted && !subscription.user_id })}
                    filter
                />
                {submitted && !subscription.user_id && <small className="p-error">Seleccione un usuario.</small>}
            </div>
        ),
        getItemDisplayName: (subscription) => subscription.user?.full_name ?? `ID ${subscription.id}`,
        emptyItem: emptySubscription,
        initialData: subscriptions,
        validateItem: (subscription) => subscription.user_id > 0,
        enableEditAction: false,
        enableCreateAction: eligibleUsers.length > 0,
        onSaveItem: async (subscription, isNew) => {
            if (!isNew) {
                return subscription;
            }
            const created = await notificationAPI.createNotificationSub(subscription.user_id);
            const linkedUser = usersData?.find((u) => u.id === created.user_id) || usersData?.find((u) => u.id === subscription.user_id);
            const newSubscription = { ...created, user: created.user ?? linkedUser };
            setSubscriptions((prev) => [...prev, newSubscription]);
            return newSubscription;
        },
        onDeleteItem: async (id) => {
            await notificationAPI.deleteNotificationSub(id);
            setSubscriptions((prev) => prev.filter((subscription) => subscription.id !== id));
        },
    };

    if (isLoadingSubscriptions || isLoadingUsers) {
        return <div className="flex justify-content-center mt-5"><ProgressSpinner /></div>;
    }

    if (isErrorSubscriptions || isErrorUsers) {
        return <Message severity="error" text="Error al cargar las suscripciones de notificaciones" />;
    }

    return <CrudDataTable config={config} />;
}

export default NotificationPage;
