import React from 'react';

const Inicio = () => {
  return (
    <div className="home-container">
      <section className="hero-section">
        <div className="hero-content">
          <span className="api-badge">API conectada - versión 1.0.0</span>
          <h1 className="hero-title">Gestión Inteligente de tu <span>Biblioteca</span></h1>
          <p className="hero-subtitle">
            BiblioTech UTP centraliza el catálogo de libros, el registro de socios 
            y el control de préstamos de manera ágil y moderna.
          </p>
          <div className="hero-actions">
            <button className="btn-primary">Explorar Catálogo</button>
            <button className="btn-outline">Ver Préstamos</button>
          </div>
        </div>
        
        <div className="hero-image-wrapper">
          <img 
            src="https://images.unsplash.com/photo-1507842217343-583bb7270b66?ixlib=rb-1.2.1&auto=format&fit=crop&w=1000&q=80" 
            alt="Interior de una biblioteca moderna" 
            className="hero-image"
          />
          <div className="floating-stats">
            <div className="floating-card">
              <div className="icon">📚</div>
              <div className="stat-info">
                <h4>+5,000</h4>
                <span>Libros</span>
              </div>
            </div>
            <div className="floating-card">
              <div className="icon">👥</div>
              <div className="stat-info">
                <h4>1,200</h4>
                <span>Socios</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="features-section">
        <div className="feature-card">
          <div className="feature-img-container">
            <img src="https://images.unsplash.com/photo-1481627834876-b7833e8f5570?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60" alt="Catálogo" />
          </div>
          <div className="feature-content">
            <h3>Catálogo Digital</h3>
            <p>Organiza y busca libros por categoría, autor o título en cuestión de segundos.</p>
          </div>
        </div>
        <div className="feature-card">
          <div className="feature-img-container">
            <img src="https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60" alt="Préstamos" />
          </div>
          <div className="feature-content">
            <h3>Préstamos Rápidos</h3>
            <p>Gestiona devoluciones, renovaciones y asignaciones con un par de clics.</p>
          </div>
        </div>
        <div className="feature-card">
          <div className="feature-img-container">
            <img src="https://images.unsplash.com/photo-1460925895917-afdab827c52f?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60" alt="Reportes" />
          </div>
          <div className="feature-content">
            <h3>Reportes en Vivo</h3>
            <p>Supervisa el estado general de la biblioteca con estadísticas actualizadas.</p>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Inicio;
