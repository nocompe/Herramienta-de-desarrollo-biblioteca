import { Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar.jsx";
import Inicio from "./pages/Inicio.jsx";
import Login from "./pages/Login.jsx";
// --- IMPORTS MODULO 1 ---
import Libros from "./pages/Libros.jsx";
// --- IMPORTS MODULO 2 ---
import Socios from "./pages/Socios.jsx";
// --- IMPORTS MODULO 3 ---
import Prestamos from "./pages/Prestamos.jsx";
// --- IMPORTS MODULO 4 ---
import Dashboard from "./pages/Dashboard.jsx";
import { AuthProvider } from "./context/AuthContext.jsx";

/**
 * Componente raiz de BiblioTech UTP.
 * Acuerdo del equipo: cada integrante registra la ruta de su modulo dentro
 * de la zona comentada que le corresponde, para evitar conflictos de fusion.
 */
function App() {
  return (
    <AuthProvider>
      <div className="app">
        <Navbar />
        <main className="contenido">
          <Routes>
            <Route path="/" element={<Inicio />} />
            <Route path="/login" element={<Login />} />
            {/* --- RUTAS MODULO 1 --- */}
            <Route path="/libros" element={<Libros />} />
            {/* --- RUTAS MODULO 2 --- */}
            <Route path="/socios" element={<Socios />} />
            {/* --- RUTAS MODULO 3 --- */}
            <Route path="/prestamos" element={<Prestamos />} />
            {/* --- RUTAS MODULO 4 --- */}
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="*" element={<h2>404 - Pagina no encontrada</h2>} />
          </Routes>
        </main>
        <footer className="pie">
          BiblioTech UTP - Universidad Tecnologica del Peru - Herramientas de Desarrollo
        </footer>
      </div>
    </AuthProvider>
  );
}

export default App;
