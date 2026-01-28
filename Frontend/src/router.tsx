import { createBrowserRouter, Navigate } from "react-router-dom";
import App from "./App";
import Inventory from "./pages/inventory.tsx";
import InventoryMovement from "./pages/inventoryMovement.tsx";
import Report from "./pages/report.tsx";
import Maintenance from "./pages/maintenance.tsx";
import Section from "./pages/section.tsx";
import Notification from "./pages/notification.tsx";
import Auth from "./pages/auth.tsx";
import useUserStore from "./store/useUserStore.ts";

const ProtectedLayout = () => {
    const { isAuthenticated } = useUserStore();
    if (!isAuthenticated) {
        return <Navigate to="/auth" replace />;
    }
    return <App />;
};

const AuthRedirect = () => {
    const { isAuthenticated } = useUserStore();
    if (isAuthenticated) {
        return <Navigate to="/inventory" replace />;
    }
    return <Auth />;
};

export const router = createBrowserRouter([
    {
        path: "/",
        element: <ProtectedLayout />,
        children: [
            {
                index: true,
                element: <Navigate to="/inventory" replace />,
            },
            {
                path: "inventory",
                element: <Inventory />,
            },
            {
                path: "movements",
                element: <InventoryMovement />,
            },
            {
                path: "reports",
                element: <Report />,
            },
            {
                path: "maintenance",
                element: <Maintenance />,
            },
            {
                path: "sections",
                element: <Section />,
            },
            {
                path: "notifications",
                element: <Notification />,
            },
            {
                path: "*",
                element: <Navigate to="/inventory" replace />,
            }
        ],
    },
    {
        path: "/auth",
        element: <AuthRedirect />,
    },
]);