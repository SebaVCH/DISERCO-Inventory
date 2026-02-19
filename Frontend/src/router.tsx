import { createBrowserRouter, Navigate } from "react-router-dom";
import App from "./App";
import Inventory from "./pages/inventory.tsx";
import InventoryMovement from "./pages/inventoryMovement.tsx";
import Report from "./pages/report.tsx";
import Maintenance from "./pages/maintenance.tsx";
import Section from "./pages/section.tsx";
import Notification from "./pages/notification.tsx";
import Login from "./pages/login.tsx";
import Register from "./pages/register.tsx";
import useUserStore from "./store/useUserStore.ts";

const ProtectedLayout = () => {
    const { isAuthenticated } = useUserStore();
    if (!isAuthenticated) {
        return <Navigate to="/login" replace />;
    }
    return <App />;
};

const LoginRedirect = () => {
    const { isAuthenticated } = useUserStore();
    if (isAuthenticated) {
        return <Navigate to="/inventory" replace />;
    }
    return <Login />;
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
                path: "register",
                element: <Register />,
            },
            {
                path: "*",
                element: <Navigate to="/inventory" replace />,
            }
        ],
    },
    {
        path: "/login",
        element: <LoginRedirect />,
    },
]);