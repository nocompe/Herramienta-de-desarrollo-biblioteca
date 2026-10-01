import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useState } from 'react';

const Navbar = () => {
  const { isAuthenticated, logout, user } = useAuth();
  const navigate = useNavigate();
  const [menuAbierto, setMenuAbierto] = useState(false);

  const handleLogout = () => {
    logout();
    setMenuAbierto(false);
    navigate('/');
  };

  const cerrarMenu = () => setMenuAbierto(false);

  return (
    <nav className="navbar">
      <div className="container nav-content">
        <Link to="/" className="nav-brand" onClick={cerrarMenu}>
          <h1 className="brand-title">BiblioTech UTP</h1>
          <span className="brand-subtitle">Sistema de Gestión de Biblioteca</span>
        </Link>

        <button
          type="button"
          className="nav-toggle"
          aria-label={menuAbierto ? 'Cerrar menú' : 'Abrir menú'}
          aria-expanded={menuAbierto}
          onClick={() => setMenuAbierto((prev) => !prev)}
        >
          <span></span>
          <span></span>
          <span></span>
        </button>

        <div className={`nav-links ${menuAbierto ? 'open' : ''}`}>
          <NavLink to="/" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`} end onClick={cerrarMenu}>Inicio</NavLink>
          <NavLink to="/libros" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`} onClick={cerrarMenu}>Libros</NavLink>
          <NavLink to="/socios" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`} onClick={cerrarMenu}>Socios</NavLink>
          <NavLink to="/prestamos" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`} onClick={cerrarMenu}>Préstamos</NavLink>
          <NavLink to="/dashboard" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`} onClick={cerrarMenu}>Dashboard</NavLink>

          <div className="nav-sesion">
            {isAuthenticated ? (
              <>
                <span className="nav-usuario">{user?.name || 'Admin'}</span>
                <button onClick={handleLogout} className="btn btn-salir">
                  Salir
                </button>
              </>
            ) : (
              <Link to="/login" className="btn btn-primary btn-sm" onClick={cerrarMenu}>
                Ingresar
              </Link>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
