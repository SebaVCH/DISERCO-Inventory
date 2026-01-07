import { createBrowserRouter, Navigate } from "react-router-dom";
import App from "./App";
import Inventory from "./pages/inventory.tsx";
import InventoryMovement from "./pages/inventory-movement.tsx";
import Report from "./pages/report.tsx";
import Maintenance from "./pages/maintenance.tsx";
import Section from "./pages/section.tsx";
import Notification from "./pages/notification.tsx";
import Auth from "./pages/auth.tsx";

export const router = createBrowserRouter([
    {
        path: "/",
        element: <App />,
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
        element: <Auth />,
    },
]);


