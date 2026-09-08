import { NavLink } from "react-router-dom";

/**
 * Barra de navegacion principal de BiblioTech UTP.
 */
function Navbar() {
  return (
    <nav className="navbar">
      <span className="navbar-marca">BiblioTech UTP</span>
      <ul className="navbar-enlaces">
        <li>
          <NavLink to="/">Inicio</NavLink>
        </li>
        {/* --- ENLACE MODULO 1 --- */}
        <li>
          <NavLink to="/libros">Libros</NavLink>
        </li>
        {/* --- ENLACE MODULO 2 --- */}
        <li>
          <NavLink to="/socios">Socios</NavLink>
        </li>
        {/* --- ENLACE MODULO 3 --- */}
        <li>
          <NavLink to="/prestamos">Prestamos</NavLink>
        </li>
        {/* --- ENLACE MODULO 4 --- */}
      </ul>
    </nav>
  );
}

export default Navbar;
