import { NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { useTheme } from '../contexts/ThemeContext'

const Sidebar = () => {
  const { signOut } = useAuth()
  const { theme, toggleTheme } = useTheme()
  const navigate = useNavigate()

  const handleLogout = async () => {
    await signOut()
    navigate('/login')
  }

  return (
    <aside className="sidebar">
      <NavLink to="/dashboard" className="sidebar-logo">
        NutriCascardo
      </NavLink>

      <nav className="nav-links">
        <NavLink 
          to="/dashboard" 
          className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
        >
          Painel
        </NavLink>
        <NavLink 
          to="/pacientes" 
          className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
        >
          Pacientes
        </NavLink>
      </nav>

      <div className="sidebar-footer" style={{ marginTop: 'auto', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <button onClick={toggleTheme} className="btn-theme-toggle" style={{ marginBottom: 0 }}>
          {theme === 'light' ? '🌙 Modo Escuro' : '☀️ Modo Claro'}
        </button>

        <button onClick={handleLogout} className="btn-logout">
          Sair
        </button>
      </div>
    </aside>
  )
}

export default Sidebar
