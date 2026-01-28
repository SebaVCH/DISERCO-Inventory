import { Divider } from 'primereact/divider';
import { InputText } from 'primereact/inputtext';
import { Button } from 'primereact/button';
import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import userAPI from "../services/userService.ts";
import { useNavigate } from "react-router-dom";
import useUserStore from "../store/useUserStore.ts";
import './auth.css';

function Auth() {
    const navigate = useNavigate();
    const { setSession } = useUserStore();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [fullName, setFullName] = useState('');
    const [error, setError] = useState<string | null>(null);

    const fetchProfileAndSetSession = async (token: string) => {
        localStorage.setItem('token', token);
        const profile = await userAPI.getProfile();
        setSession(token, profile);
    }

    const loginMutation = useMutation({
        mutationFn: () => userAPI.login({ email, password }),
        onSuccess: async (data) => {
            setError(null);
            await fetchProfileAndSetSession(data.access_token);
            navigate('/inventory');
        },
        onError: (err: any) => {
            setError(err?.response?.data?.detail ?? 'Error al iniciar sesión');
        }
    });

    const registerMutation = useMutation({
        mutationFn: () => userAPI.register({ email, password, full_name: fullName }),
        onSuccess: async (data) => {
            setError(null);
            await fetchProfileAndSetSession(data.access_token);
            navigate('/inventory');
        },
        onError: (err: any) => {
            setError(err?.response?.data?.detail ?? 'Error al registrar usuario');
        }
    });

    const disabledLogin = !email || !password || loginMutation.isPending;
    const disabledRegister = !email || !password || !fullName || registerMutation.isPending;

    return (
        <div className="auth-layout">
            <div className="card auth-card">
                <div className="auth-header">
                    <div>
                        <p className="auth-eyebrow">DISERCO Inventory</p>
                        <h2 className="auth-title">Bienvenido</h2>
                        <p className="auth-subtitle">Inicia sesión o crea tu cuenta para gestionar el inventario.</p>
                    </div>
                </div>
                <div className="auth-columns">
                    <div className="auth-column">
                        <p className="auth-column-title">Iniciar sesión</p>
                        <div className="auth-field">
                            <label htmlFor="email">Correo</label>
                            <InputText id="email" type="text" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="correo@empresa.com" />
                        </div>
                        <div className="auth-field">
                            <label htmlFor="password">Contraseña</label>
                            <InputText id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" />
                        </div>
                        <Button label="Iniciar sesión" icon="pi pi-sign-in" className="auth-button" loading={loginMutation.isPending} disabled={disabledLogin} onClick={() => loginMutation.mutate()}></Button>
                        {error && <small className="auth-error">{error}</small>}
                    </div>
                    <div className="auth-divider">
                        <Divider layout="vertical" className="hidden md:flex">
                            <b></b>
                        </Divider>
                        <Divider layout="horizontal" className="flex md:hidden" align="center">
                            <b></b>
                        </Divider>
                    </div>
                    <div className="auth-column">
                        <p className="auth-column-title">Crear cuenta</p>
                        <div className="auth-field">
                            <label htmlFor="fullName">Nombre completo</label>
                            <InputText id="fullName" type="text" value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder="John Doe" />
                        </div>
                        <div className="auth-field">
                            <label htmlFor="emailRegister">Correo</label>
                            <InputText id="emailRegister" type="text" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="correo@empresa.com" />
                        </div>
                        <div className="auth-field">
                            <label htmlFor="passwordRegister">Contraseña</label>
                            <InputText id="passwordRegister" type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" />
                        </div>
                        <Button label="Registrarse" icon="pi pi-user-plus" severity="success" className="auth-button" loading={registerMutation.isPending} disabled={disabledRegister} onClick={() => registerMutation.mutate()}></Button>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Auth