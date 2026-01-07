import './App.css'
import Header from "./components/header.tsx";
import { Outlet } from "react-router-dom";

function App() {

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
