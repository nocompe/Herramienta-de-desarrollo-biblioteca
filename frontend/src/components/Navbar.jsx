import { NavLink } from "react-router-dom";

/**
 * Barra de navegacion principal de BiblioTech UTP.
 * Rediseno del modulo 4: se agrupan los enlaces en un contenedor propio,
 * se agrega el subtitulo de la marca y el acceso al dashboard.
 * Resolucion del conflicto: se conserva ademas el enlace a Prestamos
 * incorporado por el modulo 3.
 */
function Navbar() {
  return (
    <nav className="navbar">
      <div className="navbar-identidad">
        <span className="navbar-marca">BiblioTech UTP</span>
        <span className="navbar-subtitulo">Sistema de Gestion de Biblioteca</span>
      </div>
      <ul className="navbar-enlaces">
        <li>
          <NavLink to="/">Inicio</NavLink>
        </li>
        <li>
          <NavLink to="/libros">Libros</NavLink>
        </li>
        <li>
          <NavLink to="/socios">Socios</NavLink>
        </li>
        <li>
          <NavLink to="/prestamos">Prestamos</NavLink>
        </li>
        <li>
          <NavLink to="/dashboard">Dashboard</NavLink>
        </li>
      </ul>
    </nav>
  );
}

export default Navbar;
