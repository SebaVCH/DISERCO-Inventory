import { createBrowserRouter, Navigate } from "react-router-dom";
import { lazy, Suspense } from "react";
import App from "./App";
import Login from "./pages/login.tsx";
import useUserStore from "./store/useUserStore.ts";

const Inventory         = lazy(() => import("./pages/inventory.tsx"));
const InventoryMovement = lazy(() => import("./pages/inventoryMovement.tsx"));
const Report            = lazy(() => import("./pages/report.tsx"));
const Maintenance       = lazy(() => import("./pages/maintenance.tsx"));
const Section           = lazy(() => import("./pages/section.tsx"));
const Notification      = lazy(() => import("./pages/notification.tsx"));
const Register          = lazy(() => import("./pages/register.tsx"));

const PageSkeleton = () => (
    <div style={{
        width: '100%',
        minHeight: '400px',
        background: 'linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%)',
        backgroundSize: '200% 100%',
    }} />
);

const ProtectedLayout = () => {
    const { isAuthenticated } = useUserStore();
    if (!isAuthenticated) return <Navigate to="/login" replace />;
    return <App />;
};

const LoginRedirect = () => {
    const { isAuthenticated } = useUserStore();
    if (isAuthenticated) return <Navigate to="/inventory" replace />;
    return <Login />;
};

export const router = createBrowserRouter([
    {
        path: "/",
        element: <ProtectedLayout />,
        children: [
            { index: true, element: <Navigate to="/inventory" replace /> },
            { path: "inventory",   element: <Suspense fallback={<PageSkeleton />}><Inventory /></Suspense> },
            { path: "movements",   element: <Suspense fallback={<PageSkeleton />}><InventoryMovement /></Suspense> },
            { path: "reports",     element: <Suspense fallback={<PageSkeleton />}><Report /></Suspense> },
            { path: "maintenance", element: <Suspense fallback={<PageSkeleton />}><Maintenance /></Suspense> },
            { path: "sections",    element: <Suspense fallback={<PageSkeleton />}><Section /></Suspense> },
            { path: "notifications", element: <Suspense fallback={<PageSkeleton />}><Notification /></Suspense> },
            { path: "register",    element: <Suspense fallback={<PageSkeleton />}><Register /></Suspense> },
            { path: "*",           element: <Navigate to="/inventory" replace /> },
        ],
    },
    { path: "/login", element: <LoginRedirect /> },
]);
