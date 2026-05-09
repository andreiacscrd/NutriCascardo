import { useEffect, useState } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { supabase } from '../lib/supabase'
import Sidebar from '../components/Sidebar'
import { Link } from 'react-router-dom'

const Dashboard = () => {
  const { user } = useAuth()
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({
    totalPacientes: 0,
    consultasSemana: 0,
    pacientesSemRetorno: []
  })

  useEffect(() => {
    fetchDashboardData()
  }, [user.id])

  const fetchDashboardData = async () => {
    try {
      setLoading(true)

      // 1. Total de Pacientes Ativos
      const { count: totalPacientes } = await supabase
        .from('pacientes')
        .select('*', { count: 'exact', head: true })
        .eq('nutricionista_id', user.id)

      // 2. Consultas da Semana
      const today = new Date()
      const firstDayOfWeek = new Date(today.setDate(today.getDate() - today.getDay()))
      const lastDayOfWeek = new Date(today.setDate(today.getDate() - today.getDay() + 6))

      const { count: consultasSemana } = await supabase
        .from('consultas')
        .select('*, pacientes!inner(*)', { count: 'exact', head: true })
        .eq('pacientes.nutricionista_id', user.id)
        .gte('data_consulta', firstDayOfWeek.toISOString().split('T')[0])
        .lte('data_consulta', lastDayOfWeek.toISOString().split('T')[0])

      // 3. Pacientes sem Retorno (> 30 dias e sem próximo retorno agendado)
      // Buscamos todos os pacientes e suas consultas
      const { data: pacientesData } = await supabase
        .from('pacientes')
        .select(`
          id,
          nome,
          consultas (
            data_consulta,
            proximo_retorno
          )
        `)
        .eq('nutricionista_id', user.id)

      const thirtyDaysAgo = new Date()
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

      const semRetorno = (pacientesData || []).filter(p => {
        if (!p.consultas || p.consultas.length === 0) return false

        // Encontrar a última consulta (pela data mais recente)
        const ultimaConsulta = [...p.consultas].sort((a, b) =>
          new Date(b.data_consulta) - new Date(a.data_consulta)
        )[0]

        const dataUltima = new Date(ultimaConsulta.data_consulta)
        const temRetornoFuturo = p.consultas.some(c =>
          c.proximo_retorno && new Date(c.proximo_retorno) >= new Date()
        )

        return dataUltima < thirtyDaysAgo && !temRetornoFuturo
      })

      setStats({
        totalPacientes: totalPacientes || 0,
        consultasSemana: consultasSemana || 0,
        pacientesSemRetorno: semRetorno
      })

    } catch (error) {
      console.error('Erro ao carregar dashboard:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="app-layout">
      <Sidebar />

      <main className="main-content">
        <header style={{ marginBottom: '3.5rem' }}>
          <h1 style={{ fontSize: '2.5rem', fontWeight: 800, margin: 0, letterSpacing: '-0.04em' }}>Bem-vinda, Nutricionista</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '1.125rem', marginTop: '0.5rem' }}>Aqui está o resumo dos seus Pacientes e consultas.</p>
        </header>

        {loading ? (
          <div className="empty-state">Carregando dados...</div>
        ) : (
          <>
            <div className="stats-grid">
              <div className="stat-card">
                <h3>Total de Pacientes Ativos</h3>
                <div className="value">{stats.totalPacientes}</div>
              </div>

              <div className="stat-card">
                <h3>Consultas da Semana</h3>
                <div className="value">{stats.consultasSemana}</div>
              </div>

              <div className="stat-card">
                <h3>Pacientes sem Retorno</h3>
                <div className="value">{stats.pacientesSemRetorno.length}</div>
              </div>
            </div>

            <div className="list-card">
              <h2>Pacientes que precisam de atenção</h2>
              {stats.pacientesSemRetorno.length > 0 ? (
                <ul className="patient-list">
                  {stats.pacientesSemRetorno.map(p => (
                    <li key={p.id} className="patient-item">
                      <Link to={`/pacientes/${p.id}`} className="patient-link">
                        {p.nome}
                      </Link>
                      <span style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>
                        Última consulta há mais de 30 dias
                      </span>
                    </li>
                  ))}
                </ul>
              ) : (
                <div className="empty-state">
                  Nenhum paciente sem retorno no momento.
                </div>
              )}
            </div>
          </>
        )}
      </main>
    </div>
  )
}

export default Dashboard
