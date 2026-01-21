import { Divider } from 'primereact/divider';
import { InputText } from 'primereact/inputtext';
import { Button } from 'primereact/button';
import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import userAPI from "../services/userService.ts";
import { useNavigate } from "react-router-dom";
import useUserStore from "../store/useUserStore.ts";

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
        <div className="card">
            <div className="flex flex-column md:flex-row">
                <div className="w-full md:w-5 flex flex-column align-items-center justify-content-center gap-3 py-5">
                    <div className="flex flex-wrap justify-content-center align-items-center gap-2">
                        <label className="w-6rem">Correo</label>
                        <InputText id="email" type="text" className="w-12rem" value={email} onChange={(e) => setEmail(e.target.value)} />
                    </div>
                    <div className="flex flex-wrap justify-content-center align-items-center gap-2">
                        <label className="w-6rem">Contraseña</label>
                        <InputText id="password" type="password" className="w-12rem" value={password} onChange={(e) => setPassword(e.target.value)} />
                    </div>
                    <Button label="Iniciar Sesión" icon="pi pi-user" className="w-10rem mx-auto" loading={loginMutation.isPending} disabled={disabledLogin} onClick={() => loginMutation.mutate()}></Button>
                    {error && <small style={{ color: 'red' }}>{error}</small>}
                </div>
                <div className="w-full md:w-2">
                    <Divider layout="vertical" className="hidden md:flex">
                        <b>OR</b>
                    </Divider>
                    <Divider layout="horizontal" className="flex md:hidden" align="center">
                        <b>OR</b>
                    </Divider>
                </div>
                <div className="w-full md:w-5 flex flex-column align-items-center justify-content-center gap-3 py-5">
                    <div className="flex flex-wrap justify-content-center align-items-center gap-2">
                        <label className="w-6rem">Nombre</label>
                        <InputText id="fullName" type="text" className="w-12rem" value={fullName} onChange={(e) => setFullName(e.target.value)} />
                    </div>
                    <Button label="Registrarse" icon="pi pi-user-plus" severity="success" className="w-10rem" loading={registerMutation.isPending} disabled={disabledRegister} onClick={() => registerMutation.mutate()}></Button>
                </div>
            </div>
        </div>
    )
}

export default Auth