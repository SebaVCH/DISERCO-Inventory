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
    const [loginEmail, setLoginEmail] = useState('');
    const [loginPassword, setLoginPassword] = useState('');
    const [loginError, setLoginError] = useState<string | null>(null);
    const [registerEmail, setRegisterEmail] = useState('');
    const [registerPassword, setRegisterPassword] = useState('');
    const [fullName, setFullName] = useState('');
    const [registerError, setRegisterError] = useState<string | null>(null);

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

    const registerMutation = useMutation({
        mutationFn: () => userAPI.register({ email: registerEmail, password: registerPassword, full_name: fullName }),
        onSuccess: async (data) => {
            setRegisterError(null);
            await fetchProfileAndSetSession(data.access_token);
            navigate('/inventory');
        },
        onError: (err: any) => {
            let errorMsg = 'Error al registrar usuario';
            if (err?.response?.data?.detail) {
                const detail = err.response.data.detail;
                if (typeof detail === 'string') {
                    errorMsg = detail;
                } else if (Array.isArray(detail)) {
                    errorMsg = detail.map((e: any) => e.msg || JSON.stringify(e)).join(', ');
                }
            }
            setRegisterError(errorMsg);
        }
    });

    const disabledLogin = !loginEmail || !loginPassword || loginMutation.isPending;
    const disabledRegister = !registerEmail || !registerPassword || !fullName || registerMutation.isPending;

    const handleLogin = () => {
        if (!isValidEmail(loginEmail)) {
            setLoginError('Ingresa un correo válido');
            return;
        }
        setLoginError(null);
        loginMutation.mutate();
    };

    const handleRegister = () => {
        if (!isValidEmail(registerEmail)) {
            setRegisterError('Ingresa un correo válido');
            return;
        }
        setRegisterError(null);
        registerMutation.mutate();
    };

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
                            <InputText id="email" type="email" value={loginEmail} onChange={(e) => setLoginEmail(e.target.value)} placeholder="correo@empresa.com" />
                        </div>
                        <div className="auth-field">
                            <label htmlFor="password">Contraseña</label>
                            <InputText id="password" type="password" value={loginPassword} onChange={(e) => setLoginPassword(e.target.value)} placeholder="••••••••" />
                        </div>
                        <Button label="Iniciar sesión" icon="pi pi-sign-in" className="auth-button" loading={loginMutation.isPending} disabled={disabledLogin} onClick={handleLogin}></Button>
                        {loginError && <small className="auth-error">{loginError}</small>}
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
                            <InputText id="emailRegister" type="email" value={registerEmail} onChange={(e) => setRegisterEmail(e.target.value)} placeholder="correo@empresa.com" />
                        </div>
                        <div className="auth-field">
                            <label htmlFor="passwordRegister">Contraseña</label>
                            <InputText id="passwordRegister" type="password" value={registerPassword} onChange={(e) => setRegisterPassword(e.target.value)} placeholder="••••••••" />
                        </div>
                        <Button label="Registrarse" icon="pi pi-user-plus" severity="success" className="auth-button" loading={registerMutation.isPending} disabled={disabledRegister} onClick={handleRegister}></Button>
                        {registerError && <small className="auth-error">{registerError}</small>}
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Auth