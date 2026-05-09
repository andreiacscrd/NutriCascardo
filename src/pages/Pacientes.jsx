import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { supabase } from '../lib/supabase'
import Sidebar from '../components/Sidebar'
import { Search, UserPlus } from 'lucide-react'

const Pacientes = () => {
  const { user } = useAuth()
  const [pacientes, setPacientes] = useState([])
  const [searchTerm, setSearchTerm] = useState('')
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  useEffect(() => {
    fetchPacientes()
  }, [user.id])

  const fetchPacientes = async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('pacientes')
        .select(`
          id,
          nome,
          objetivos,
          consultas (
            data_consulta
          )
        `)
        .eq('nutricionista_id', user.id)
        .order('nome')

      if (error) throw error

      const formattedData = data.map(p => {
        const ultimaConsulta = p.consultas?.length > 0 
          ? [...p.consultas].sort((a, b) => new Date(b.data_consulta) - new Date(a.data_consulta))[0].data_consulta
          : 'Nenhuma consulta'

        return {
          ...p,
          ultimaConsulta,
          objetivoPrincipal: p.objetivos?.[0] || 'Não definido'
        }
      })

      setPacientes(formattedData)
    } catch (error) {
      console.error('Erro ao buscar pacientes:', error)
    } finally {
      setLoading(false)
    }
  }

  const filteredPacientes = pacientes.filter(p => 
    p.nome.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div className="app-layout">
      <Sidebar />
      <main className="main-content">
        <header style={{ marginBottom: '3.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <h1 style={{ fontSize: '2.5rem', fontWeight: 800, margin: 0, letterSpacing: '-0.04em' }}>Meus Pacientes</h1>
            <p style={{ color: 'var(--text-muted)', fontSize: '1.125rem', marginTop: '0.5rem' }}>Gerencie sua base de pacientes e acompanhamentos.</p>
          </div>
          <Link to="/pacientes/novo" className="btn-primary" style={{ textDecoration: 'none' }}>
            <UserPlus size={20} />
            Novo Paciente
          </Link>
        </header>

        <div className="stats-grid" style={{ marginBottom: '3rem' }}>
          <div className="stat-card">
            <h3>Total de Pacientes</h3>
            <div className="value">{pacientes.length}</div>
          </div>
        </div>

        <div className="list-card">
          <div className="search-container" style={{ marginBottom: '2.5rem' }}>
            <div style={{ position: 'relative', flex: 1, maxWidth: '500px' }}>
              <Search 
                size={20} 
                style={{ position: 'absolute', left: '1.25rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} 
              />
              <input 
                type="text" 
                placeholder="Buscar por nome ou objetivo..." 
                style={{ paddingLeft: '3.5rem', width: '100%' }}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          {loading ? (
            <div className="empty-state">Carregando pacientes...</div>
          ) : filteredPacientes.length > 0 ? (
            <table className="patient-table">
              <thead>
                <tr>
                  <th>Nome</th>
                  <th>Objetivo Principal</th>
                  <th>Última Consulta</th>
                </tr>
              </thead>
              <tbody>
                {filteredPacientes.map(p => (
                  <tr key={p.id} className="patient-row" onClick={() => navigate(`/pacientes/${p.id}`)}>
                    <td style={{ fontWeight: 700, fontSize: '1.125rem' }}>{p.nome}</td>
                    <td>
                      <span className="badge" style={{ background: 'var(--primary-light)', color: 'var(--primary-color)', padding: '0.4rem 0.8rem', borderRadius: '0.75rem', fontSize: '0.875rem', fontWeight: 600 }}>
                        {p.objetivoPrincipal}
                      </span>
                    </td>
                    <td style={{ color: 'var(--text-muted)' }}>
                      {p.ultimaConsulta !== 'Nenhuma consulta' 
                        ? new Date(p.ultimaConsulta).toLocaleDateString('pt-BR') 
                        : p.ultimaConsulta}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="empty-state" style={{ padding: '4rem 0' }}>
              {searchTerm ? 'Nenhum paciente encontrado para esta busca.' : 'Nenhum paciente cadastrado ainda.'}
            </div>
          )}
        </div>
      </main>
    </div>
  )
}

export default Pacientes
