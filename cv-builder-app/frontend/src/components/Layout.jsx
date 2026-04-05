import React from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import { LayoutDashboard, FileText, Mail, Bot, LogOut, Sparkles } from 'lucide-react';

const Layout = ({ children }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [theme, setTheme] = React.useState(localStorage.getItem('theme') || 'light');
  const user = JSON.parse(sessionStorage.getItem('user') || '{}');

  React.useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
  }, [theme]);

  const handleLogout = () => {
    sessionStorage.clear();
    navigate('/login');
  };

  // No Layout for Login page
  if (location.pathname === '/login') return children;

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div style={{ padding: '0 20px', marginBottom: '40px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{ width: '32px', height: '32px', background: 'var(--accent-gradient)', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white' }}>
              <Sparkles size={18} />
            </div>
            <span className="outfit" style={{ fontSize: '18px', fontWeight: '800', letterSpacing: '-0.5px' }}>Studio</span>
          </div>
          
          <button 
            onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
            style={{ background: 'var(--bg-base)', border: '1px solid var(--border-subtle)', color: 'var(--text-primary)', padding: '6px', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center' }}
          >
            {theme === 'light' ? <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path></svg> : <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="5"></circle><line x1="12" y1="1" x2="12" y2="3"></line><line x1="12" y1="21" x2="12" y2="23"></line><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line><line x1="1" y1="12" x2="3" y2="12"></line><line x1="21" y1="12" x2="23" y2="12"></line><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line></svg>}
          </button>
        </div>

        <nav style={{ flex: 1 }}>
          <NavLink to="/" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
            <LayoutDashboard size={20} /> Dashboard
          </NavLink>
          <NavLink to="/cv/new" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
            <FileText size={20} /> Construtor de CV
          </NavLink>
          <NavLink to="/cover-letter" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
            <Mail size={20} /> Carta de Apresentação
          </NavLink>
          <div className="nav-link" style={{ opacity: 0.5, cursor: 'not-allowed' }}>
            <Bot size={20} /> Entrevista IA (Breve)
          </div>
        </nav>

        <div style={{ padding: '20px', background: 'rgba(99, 102, 241, 0.05)', borderRadius: '16px', marginBottom: '20px' }}>
          <p style={{ fontSize: '12px', fontWeight: 'bold', color: 'var(--accent-primary)', marginBottom: '4px' }}>PLANO FREE</p>
          <p style={{ fontSize: '11px', color: 'var(--text-tertiary)' }}>{user.email}</p>
        </div>

        <button onClick={handleLogout} className="nav-link logout" style={{ background: 'transparent', border: 'none', width: '100%', cursor: 'pointer' }}>
          <LogOut size={20} /> Sair da conta
        </button>
      </aside>

      <main className="main-content custom-scrollbar">
        {children}
      </main>

      {/* MOBILE BOTTOM NAV */}
      <nav className="bottom-nav">
        <NavLink to="/" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
          <LayoutDashboard size={22} /> Dash
        </NavLink>
        <NavLink to="/cv/new" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
          <FileText size={22} /> Novo CV
        </NavLink>
        <NavLink to="/cover-letter" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
          <Mail size={22} /> Carta
        </NavLink>
        <button onClick={handleLogout} className="nav-link" style={{ background: 'transparent', border: 'none', cursor: 'pointer' }}>
          <LogOut size={22} /> Sair
        </button>
      </nav>
    </div>
  );
};

export default Layout;
