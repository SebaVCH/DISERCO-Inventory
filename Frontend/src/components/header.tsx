import { TabMenu } from 'primereact/tabmenu';
import type {MenuItem} from 'primereact/menuitem';
import { useNavigate, useLocation } from 'react-router-dom';
import './header.css';
import useUserStore from "../store/useUserStore.ts";
import userAPI from "../services/userService.ts";

function Header() {
    const navigate = useNavigate();
    const location = useLocation();
    const {user, isAuthenticated, clearSession} = useUserStore();

    const leftItems: MenuItem[] = [
        { label: 'Inventario', icon: 'pi pi-warehouse', command: () => navigate('/inventory') },
        { label: 'Movimientos', icon: 'pi pi-arrow-right-arrow-left', command: () => navigate('/movements') },
        { label: 'Reportes', icon: 'pi pi-chart-bar', command: () => navigate('/reports') },
        { label: 'Mantenimiento', icon: 'pi pi-cog', command: () => navigate('/maintenance') },
        { label: 'Secciones', icon: 'pi pi-building', command: () => navigate('/sections') },
        { label: 'Notificaciones', icon: 'pi pi-bell', command: () => navigate('/notifications') }
    ];

    const rightItems: MenuItem[] = isAuthenticated ? [
        { label: user?.full_name ?? 'Mi cuenta', icon: 'pi pi-user' },
        { label: 'Cerrar sesión', icon: 'pi pi-sign-out', command: () => {
                userAPI.logout();
                clearSession();
                navigate('/auth');
            } }
    ] : [
        { label: 'Iniciar sesión / Registrar', icon: 'pi pi-user', command: () => navigate('/auth') }
    ];

    const getActiveIndex = () => {
        const pathToIndex: { [key: string]: number } = {
            '/inventory': 0,
            '/movements': 1,
            '/reports': 2,
            '/maintenance': 3,
            '/sections': 4,
            '/notifications': 5,
        };

        return pathToIndex[location.pathname] ?? 0;
    };

    return (
        <div className="header-container">
            <div className="header-wrapper">
                <div className="header-left">
                    <TabMenu model={leftItems} activeIndex={getActiveIndex()} />
                </div>
                <div className="header-right">
                    <TabMenu model={rightItems} />
                </div>
            </div>
        </div>
    )
}

export default Header