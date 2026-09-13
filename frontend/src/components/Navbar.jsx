import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Navbar = () => {
  const { isAuthenticated, logout, user } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <nav className="navbar">
      <div className="container nav-content">
        <Link to="/" className="nav-brand" style={{textDecoration: 'none'}}>
          <h1 className="brand-title">BiblioTech UTP</h1>
          <span className="brand-subtitle">Sistema de Gestión de Biblioteca</span>
        </Link>
        <div className="nav-links" style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
          <NavLink to="/" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`} end>Inicio</NavLink>
          <NavLink to="/libros" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>Libros</NavLink>
          <NavLink to="/socios" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>Socios</NavLink>
          <NavLink to="/prestamos" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>Préstamos</NavLink>
          <NavLink to="/dashboard" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>Dashboard</NavLink>
          
          <div style={{ marginLeft: '10px', display: 'flex', alignItems: 'center', gap: '10px', borderLeft: '1px solid rgba(255,255,255,0.2)', paddingLeft: '20px' }}>
            {isAuthenticated ? (
              <>
                <span style={{ color: '#94a3b8', fontSize: '0.9rem' }}>{user?.name || 'Admin'}</span>
                <button onClick={handleLogout} className="btn" style={{ padding: '6px 12px', fontSize: '0.85rem', backgroundColor: 'rgba(239, 68, 68, 0.2)', color: '#fca5a5', border: '1px solid rgba(239, 68, 68, 0.3)' }}>
                  Salir
                </button>
              </>
            ) : (
              <Link to="/login" className="btn btn-primary" style={{ padding: '6px 12px', fontSize: '0.85rem' }}>
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
