import './App.css'
import Header from "./components/header.tsx";
import { Outlet } from "react-router-dom";
import {useEffect} from "react";
import userAPI from "./services/userService.ts";
import useUserStore from "./store/useUserStore.ts";

function App() {
  const {token, user, setUser} = useUserStore();

  useEffect(() => {
    const hydrate = async () => {
      if (token && !user) {
        try {
          const profile = await userAPI.getProfile();
          setUser(profile);
        } catch (e) {
          console.error('No se pudo obtener el perfil', e);
        }
      }
    };

    hydrate();
  }, [token, user, setUser]);
  return (
    <>
          <Header />
          <main style={{ padding: '2rem' }}>
            <Outlet />
          </main>
    </>
  )
}

export default App
