import { Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar.jsx";
import Inicio from "./pages/Inicio.jsx";
// --- IMPORTS MODULO 1 ---
// --- IMPORTS MODULO 2 ---
// --- IMPORTS MODULO 3 ---
// --- IMPORTS MODULO 4 ---

/**
 * Componente raiz de BiblioTech UTP.
 * Acuerdo del equipo: cada integrante registra la ruta de su modulo dentro
 * de la zona comentada que le corresponde, para evitar conflictos de fusion.
 */
function App() {
  return (
    <div className="app">
      <Navbar />
      <main className="contenido">
        <Routes>
          <Route path="/" element={<Inicio />} />
          {/* --- RUTAS MODULO 1 --- */}
          {/* --- RUTAS MODULO 2 --- */}
          {/* --- RUTAS MODULO 3 --- */}
          {/* --- RUTAS MODULO 4 --- */}
          <Route path="*" element={<h2>404 - Pagina no encontrada</h2>} />
        </Routes>
      </main>
      <footer className="pie">
        BiblioTech UTP - Universidad Tecnologica del Peru - Herramientas de Desarrollo
      </footer>
    </div>
  );
}

export default App;
