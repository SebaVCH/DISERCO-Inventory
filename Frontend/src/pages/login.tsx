import { InputText } from 'primereact/inputtext';
import { Button } from 'primereact/button';
import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import userAPI from "../services/userService.ts";
import { useNavigate } from "react-router-dom";
import useUserStore from "../store/useUserStore.ts";
import './auth.css';

function Login() {
    const navigate = useNavigate();
    const { setSession } = useUserStore();
    const [loginEmail, setLoginEmail] = useState('');
    const [loginPassword, setLoginPassword] = useState('');
    const [loginError, setLoginError] = useState<string | null>(null);

    const isValidEmail = (value: string) => /[^@\s]+@[^@\s]+\.[^@\s]+/.test(value);

    const fetchProfileAndSetSession = async (token: string) => {
        localStorage.setItem('token', token);
        const profile = await userAPI.getProfile();
        setSession(token, profile);
    }

    const loginMutation = useMutation({
        mutationFn: () => userAPI.login({ email: loginEmail, password: loginPassword }),
        onSuccess: async (data) => {
            setLoginError(null);
            await fetchProfileAndSetSession(data.access_token);
            navigate('/inventory');
        },
        onError: (err: any) => {
            let errorMsg = 'Error al iniciar sesión';
            if (err?.response?.data?.detail) {
                const detail = err.response.data.detail;
                if (typeof detail === 'string') {
                    errorMsg = detail;
                } else if (Array.isArray(detail)) {
                    errorMsg = detail.map((e: any) => e.msg || JSON.stringify(e)).join(', ');
                }
            }
            setLoginError(errorMsg);
        }
    });

    const disabledLogin = !loginEmail || !loginPassword || loginMutation.isPending;

    const handleLogin = () => {
        if (!isValidEmail(loginEmail)) {
            setLoginError('Ingresa un correo válido');
            return;
        }
        setLoginError(null);
        loginMutation.mutate();
    };

    return (
        <div className="auth-layout">
            <div className="card auth-card" style={{ maxWidth: '500px' }}>
                <div className="auth-header">
                    <div>
                        <p className="auth-eyebrow">DISERCO Inventory</p>
                        <h2 className="auth-title">Bienvenido</h2>
                        <p className="auth-subtitle">Inicia sesión para gestionar el inventario.</p>
                    </div>
                </div>
                <div style={{ padding: '2rem' }}>
                    <div className="auth-field">
                        <label htmlFor="email">Correo</label>
                        <InputText
                            id="email"
                            type="email"
                            value={loginEmail}
                            onChange={(e) => setLoginEmail(e.target.value)}
                            placeholder="correo@empresa.com"
                            style={{ width: '100%' }}
                        />
                    </div>
                    <div className="auth-field">
                        <label htmlFor="password">Contraseña</label>
                        <InputText
                            id="password"
                            type="password"
                            value={loginPassword}
                            onChange={(e) => setLoginPassword(e.target.value)}
                            placeholder="••••••••"
                            style={{ width: '100%' }}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter' && !disabledLogin) {
                                    handleLogin();
                                }
                            }}
                        />
                    </div>
                    <Button
                        label="Iniciar sesión"
                        icon="pi pi-sign-in"
                        className="auth-button"
                        loading={loginMutation.isPending}
                        disabled={disabledLogin}
                        onClick={handleLogin}
                        style={{ width: '100%', marginTop: '1rem' }}
                    />
                    {loginError && <small className="auth-error">{loginError}</small>}
                </div>
            </div>
        </div>
    )
}

export default Login

