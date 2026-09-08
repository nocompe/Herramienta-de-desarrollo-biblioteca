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
        {/* --- ENLACE MODULO 2 --- */}
        {/* --- ENLACE MODULO 3 --- */}
        {/* --- ENLACE MODULO 4 --- */}
      </ul>
    </nav>
  );
}

export default Navbar;
