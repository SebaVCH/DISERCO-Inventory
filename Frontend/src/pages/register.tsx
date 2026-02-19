import { InputText } from 'primereact/inputtext';
import { Button } from 'primereact/button';
import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import userAPI from "../services/userService.ts";
import { useNavigate } from "react-router-dom";
import useUserStore from "../store/useUserStore.ts";
import './auth.css';
import { Toast } from 'primereact/toast';
import { useRef } from 'react';

function Register() {
    const navigate = useNavigate();
    const { user } = useUserStore();
    const toast = useRef<Toast>(null);
    const [registerEmail, setRegisterEmail] = useState('');
    const [registerPassword, setRegisterPassword] = useState('');
    const [fullName, setFullName] = useState('');
    const [registerError, setRegisterError] = useState<string | null>(null);

    const isValidEmail = (value: string) => /[^@\s]+@[^@\s]+\.[^@\s]+/.test(value);

    const registerMutation = useMutation({
        mutationFn: () => userAPI.register({ email: registerEmail, password: registerPassword, full_name: fullName }),
        onSuccess: () => {
            setRegisterError(null);
            toast.current?.show({
                severity: 'success',
                summary: 'Usuario registrado',
                detail: 'El usuario ha sido registrado exitosamente',
                life: 3000
            });
            setRegisterEmail('');
            setRegisterPassword('');
            setFullName('');
        },
        onError: (err: unknown) => {
            let errorMsg = 'Error al registrar usuario';
            if (err && typeof err === 'object' && 'response' in err) {
                const response = (err as { response?: { data?: { detail?: unknown } } }).response;
                if (response?.data?.detail) {
                    const detail = response.data.detail;
                    if (typeof detail === 'string') {
                        errorMsg = detail;
                    } else if (Array.isArray(detail)) {
                        errorMsg = detail.map((e: { msg?: string }) => e.msg || JSON.stringify(e)).join(', ');
                    }
                }
            }
            setRegisterError(errorMsg);
        }
    });

    const disabledRegister = !registerEmail || !registerPassword || !fullName || registerMutation.isPending;

    const handleRegister = () => {
        if (!isValidEmail(registerEmail)) {
            setRegisterError('Ingresa un correo válido');
            return;
        }
        setRegisterError(null);
        registerMutation.mutate();
    };

    if (user?.id !== 0) {
        return (
            <div className="auth-layout">
                <div className="card auth-card" style={{ maxWidth: '500px' }}>
                    <div className="auth-header">
                        <div>
                            <h2 className="auth-title">Acceso Denegado</h2>
                            <p className="auth-subtitle">Solo el administrador puede registrar nuevos usuarios.</p>
                        </div>
                    </div>
                    <div style={{ padding: '2rem' }}>
                        <Button
                            label="Volver al inventario"
                            icon="pi pi-arrow-left"
                            onClick={() => navigate('/inventory')}
                            style={{ width: '100%' }}
                        />
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="auth-layout">
            <Toast ref={toast} />
            <div className="card auth-card" style={{ maxWidth: '500px' }}>
                <div className="auth-header">
                    <div>
                        <p className="auth-eyebrow">DISERCO Inventory - Panel de Administrador</p>
                        <h2 className="auth-title">Registrar Nuevo Usuario</h2>
                        <p className="auth-subtitle">Crea una nueva cuenta para un usuario del sistema.</p>
                    </div>
                </div>
                <div style={{ padding: '2rem' }}>
                    <div className="auth-field">
                        <label htmlFor="fullName">Nombre completo</label>
                        <InputText
                            id="fullName"
                            type="text"
                            value={fullName}
                            onChange={(e) => setFullName(e.target.value)}
                            placeholder="John Doe"
                            style={{ width: '100%' }}
                        />
                    </div>
                    <div className="auth-field">
                        <label htmlFor="emailRegister">Correo</label>
                        <InputText
                            id="emailRegister"
                            type="email"
                            value={registerEmail}
                            onChange={(e) => setRegisterEmail(e.target.value)}
                            placeholder="correo@empresa.com"
                            style={{ width: '100%' }}
                        />
                    </div>
                    <div className="auth-field">
                        <label htmlFor="passwordRegister">Contraseña</label>
                        <InputText
                            id="passwordRegister"
                            type="password"
                            value={registerPassword}
                            onChange={(e) => setRegisterPassword(e.target.value)}
                            placeholder="••••••••"
                            style={{ width: '100%' }}
                        />
                    </div>
                    <Button
                        label="Registrar usuario"
                        icon="pi pi-user-plus"
                        severity="success"
                        className="auth-button"
                        loading={registerMutation.isPending}
                        disabled={disabledRegister}
                        onClick={handleRegister}
                        style={{ width: '100%', marginTop: '1rem' }}
                    />
                    {registerError && <small className="auth-error">{registerError}</small>}
                    <Button
                        label="Volver"
                        icon="pi pi-arrow-left"
                        severity="secondary"
                        text
                        onClick={() => navigate('/inventory')}
                        style={{ width: '100%', marginTop: '0.5rem' }}
                    />
                </div>
            </div>
        </div>
    )
}

export default Register

