import { useEffect, useState, useMemo } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import Sidebar from '../components/Sidebar'
import { 
  ArrowLeft, Calendar, FileText, Activity, User, Save, Plus, 
  Phone, Stethoscope, Heart, Clock, Droplets, X 
} from 'lucide-react'
import { 
  ResponsiveContainer, LineChart, Line, XAxis, YAxis, 
  CartesianGrid, Tooltip as ChartTooltip 
} from 'recharts'

const PerfilPaciente = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const [activeMainTab, setActiveMainTab] = useState('dados')
  const [activeDataTab, setActiveDataTab] = useState('pessoal')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [showModal, setShowModal] = useState(false)
  
  // Dados do Paciente
  const [formData, setFormData] = useState({})
  const [consultas, setConsultas] = useState([])
  const [planos, setPlanos] = useState([])

  // Formulário de Nova Consulta
  const [newConsulta, setNewConsulta] = useState({
    data_consulta: new Date().toISOString().split('T')[0],
    peso: '',
    cintura: '',
    quadril: '',
    percentual_gordura: '',
    observacoes: '',
    proximo_retorno: ''
  })

  useEffect(() => {
    fetchData()
  }, [id])

  const fetchData = async () => {
    try {
      setLoading(true)
      const [pacienteRes, consultasRes, planosRes] = await Promise.all([
        supabase.from('pacientes').select('*').eq('id', id).single(),
        supabase.from('consultas').select('*').eq('paciente_id', id).order('data_consulta', { ascending: false }),
        supabase.from('planos_alimentares').select('*').eq('paciente_id', id).order('created_at', { ascending: false })
      ])

      if (pacienteRes.error) throw pacienteRes.error
      setFormData(pacienteRes.data)
      setConsultas(consultasRes.data || [])
      setPlanos(planosRes.data || [])
    } catch (error) {
      console.error('Erro:', error)
    } finally {
      setLoading(false)
    }
  }

  // Cálculos
  const idade = useMemo(() => {
    if (!formData.data_nascimento) return ''
    const birthDate = new Date(formData.data_nascimento)
    const today = new Date()
    let age = today.getFullYear() - birthDate.getFullYear()
    const m = today.getMonth() - birthDate.getMonth()
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) age--
    return age
  }, [formData.data_nascimento])

  const imc = useMemo(() => {
    const peso = consultas[0]?.peso || formData.peso_inicial
    if (!peso || !formData.altura) return '--'
    const alturaM = parseFloat(formData.altura) / 100
    return (peso / (alturaM * alturaM)).toFixed(1)
  }, [formData, consultas])

  const chartData = useMemo(() => {
    return [...consultas]
      .reverse()
      .map(c => ({
        data: new Date(c.data_consulta).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' }),
        peso: parseFloat(c.peso)
      }))
  }, [consultas])

  // Handlers
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    setFormData(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }))
  }

  const handleMultiSelect = (category, value) => {
    const current = formData[category] || []
    const updated = current.includes(value) 
      ? current.filter(item => item !== value) 
      : [...current, value]
    setFormData(prev => ({ ...prev, [category]: updated }))
  }

  const handleSavePaciente = async () => {
    setSaving(true)
    try {
      const { error } = await supabase.from('pacientes').update(formData).eq('id', id)
      if (error) throw error
      alert('Dados atualizados com sucesso!')
    } catch (error) {
      alert('Erro: ' + error.message)
    } finally {
      setSaving(false)
    }
  }

  const handleSaveConsulta = async (e) => {
    e.preventDefault()
    setSaving(true)
    try {
      const payload = {
        ...newConsulta,
        paciente_id: id,
        peso: newConsulta.peso === '' ? null : Number(newConsulta.peso),
        cintura: newConsulta.cintura === '' ? null : Number(newConsulta.cintura),
        quadril: newConsulta.quadril === '' ? null : Number(newConsulta.quadril),
        percentual_gordura: newConsulta.percentual_gordura === '' ? null : Number(newConsulta.percentual_gordura),
        proximo_retorno: newConsulta.proximo_retorno === '' ? null : newConsulta.proximo_retorno
      }
      const { error } = await supabase.from('consultas').insert([payload])
      if (error) throw error
      setShowModal(false)
      fetchData()
      setNewConsulta({
        data_consulta: new Date().toISOString().split('T')[0],
        peso: '',
        cintura: '',
        quadril: '',
        percentual_gordura: '',
        observacoes: '',
        proximo_retorno: ''
      })
    } catch (error) {
      alert('Erro: ' + error.message)
    } finally {
      setSaving(false)
    }
  }

  if (loading) return <div className="app-layout"><Sidebar /><main className="main-content"><div className="empty-state">Carregando...</div></main></div>

  return (
    <div className="app-layout">
      <Sidebar />
      <main className="main-content">
        <header style={{ marginBottom: '3rem' }}>
          <Link to="/pacientes" className="back-button"><ArrowLeft size={18} /> Voltar para lista</Link>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '1rem' }}>
            <div>
              <h1 style={{ fontSize: '3rem', fontWeight: 800, margin: 0, letterSpacing: '-0.05em', textTransform: 'capitalize' }}>{formData.nome}</h1>
              <p style={{ color: 'var(--text-muted)', fontSize: '1.25rem', marginTop: '0.5rem' }}>{idade} anos • {formData.sexo}</p>
            </div>
            <div className="tabs-header">
              {['dados', 'consultas', 'planos'].map(t => (
                <button 
                  key={t} 
                  className={`tab-btn ${activeMainTab === t ? 'active' : ''}`} 
                  onClick={() => setActiveMainTab(t)} 
                  style={{ textTransform: 'capitalize' }}
                >
                  {t === 'dados' ? 'Pessoal' : t === 'consultas' ? 'Consultas' : 'Planos'}
                </button>
              ))}
            </div>
          </div>
        </header>

        {activeMainTab === 'dados' && (
          <div className="form-wrapper">
            <div className="tabs-header" style={{ marginBottom: '3rem', background: 'var(--primary-light)' }}>
              {['pessoal', 'clinico', 'habitos'].map(t => (
                <button key={t} className={`tab-btn ${activeDataTab === t ? 'active' : ''}`} onClick={() => setActiveDataTab(t)} style={{ textTransform: 'capitalize' }}>
                  {t}
                </button>
              ))}
            </div>

            <div className="form-container">
              {activeDataTab === 'pessoal' && (
                <div className="form-container" key="pessoal">
                  <section className="form-section">
                    <div className="form-section-title"><User size={20} /> Informações Básicas</div>
                    <div className="form-grid">
                      <div className="form-group" style={{ gridColumn: '1 / -1' }}><label>Nome Completo *</label><input name="nome" value={formData.nome || ''} onChange={handleChange} /></div>
                      <div className="form-group"><label>Nascimento</label><input type="date" name="data_nascimento" value={formData.data_nascimento || ''} onChange={handleChange} /></div>
                      <div className="form-group"><label>Sexo</label><select name="sexo" value={formData.sexo || ''} onChange={handleChange}><option value="Feminino">Feminino</option><option value="Masculino">Masculino</option></select></div>
                      <div className="form-group"><label>Telefone</label><input name="telefone" value={formData.telefone || ''} onChange={handleChange} /></div>
                    </div>
                  </section>
                </div>
              )}

              {activeDataTab === 'clinico' && (
                <div className="form-container" key="clinico">
                  <section className="form-section">
                    <div className="form-section-title"><Activity size={20} /> Avaliação e Objetivos</div>
                    <div className="form-grid">
                      <div className="form-group"><label>Peso Inicial (kg)</label><input type="number" name="peso_inicial" value={formData.peso_inicial || ''} onChange={handleChange} /></div>
                      <div className="form-group"><label>Altura (cm)</label><input type="number" name="altura" value={formData.altura || ''} onChange={handleChange} /></div>
                      <div className="form-group" style={{ gridColumn: '1 / -1' }}><label>Objetivos Principais</label>
                        <div className="checkbox-grid">
                          {['Emagrecer', 'Ganhar massa', 'Saúde geral'].map(obj => (
                            <label key={obj} className="checkbox-item"><input type="checkbox" checked={(formData.objetivos || []).includes(obj)} onChange={() => handleMultiSelect('objetivos', obj)} />{obj}</label>
                          ))}
                        </div>
                        <textarea name="objetivo_texto" value={formData.objetivo_texto || ''} onChange={handleChange} style={{ marginTop: '1rem' }} />
                      </div>
                    </div>
                  </section>
                </div>
              )}

              {activeDataTab === 'habitos' && (
                <div className="form-container" key="habitos">
                  <section className="form-section">
                    <div className="form-section-title"><Heart size={20} /> Estilo de Vida</div>
                    <div className="form-grid">
                      <div className="form-group"><label>Água (L/dia)</label><input type="number" name="litros_agua" value={formData.litros_agua || ''} onChange={handleChange} step="0.1" /></div>
                      <div className="form-group"><label>Refeições/dia</label><input type="number" name="refeicoes_por_dia" value={formData.refeicoes_por_dia || ''} onChange={handleChange} /></div>
                      <div className="form-group" style={{ gridColumn: '1 / -1' }}><label>Observações</label><textarea name="observacoes" value={formData.observacoes || ''} onChange={handleChange} /></div>
                    </div>
                  </section>
                </div>
              )}

              <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '2.5rem' }}>
                <button onClick={handleSavePaciente} className="btn-primary" disabled={saving}>
                  <Save size={20} /> {saving ? 'Salvando...' : 'Salvar Alterações'}
                </button>
              </div>
            </div>
          </div>
        )}

        {activeMainTab === 'consultas' && (
          <div className="form-container" style={{ animation: 'slideUp 0.6s ease' }}>
            <section className="form-section">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <div className="form-section-title" style={{ marginBottom: 0 }}><Activity size={20} /> Evolução de Peso</div>
                <button onClick={() => setShowModal(true)} className="btn-primary"><Plus size={20} /> Nova Consulta</button>
              </div>
              
              {consultas.length > 0 ? (
                <div className="chart-container">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={chartData}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                      <XAxis dataKey="data" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} dy={10} />
                      <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} domain={['dataMin - 5', 'dataMax + 5']} />
                      <ChartTooltip contentStyle={{ borderRadius: '1rem', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }} />
                      <Line type="monotone" dataKey="peso" stroke="var(--primary-color)" strokeWidth={4} dot={{ r: 6, fill: 'var(--primary-color)', strokeWidth: 2, stroke: '#fff' }} activeDot={{ r: 8 }} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <div className="empty-state" style={{ height: '300px' }}>Nenhuma consulta registrada ainda.</div>
              )}
            </section>

            <section className="form-section" style={{ padding: 0 }}>
              <div className="form-section-title" style={{ padding: '2.5rem', marginBottom: 0 }}><Calendar size={20} /> Histórico de Consultas</div>
              <div className="consultas-list">
                {consultas.map(c => (
                  <div key={c.id} className="timeline-item">
                    <div className="timeline-date">{new Date(c.data_consulta).toLocaleDateString('pt-BR')}</div>
                    <div className="timeline-content">
                      <div className="timeline-stat"><span className="label">Peso</span><span className="value">{c.peso} kg</span></div>
                      <div className="timeline-stat"><span className="label">Cintura</span><span className="value">{c.cintura || '--'} cm</span></div>
                      <div className="timeline-stat"><span className="label">Gordura</span><span className="value">{c.percentual_gordura || '--'} %</span></div>
                      <div className="timeline-stat"><span className="label">Retorno</span><span className="value">{c.proximo_retorno ? new Date(c.proximo_retorno).toLocaleDateString('pt-BR') : '--'}</span></div>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          </div>
        )}

        {activeMainTab === 'planos' && (
          <div className="form-container">
            <section className="form-section">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '3rem' }}>
                <div className="form-section-title" style={{ marginBottom: 0 }}><FileText size={20} /> Planos Alimentares</div>
                <button className="btn-primary" style={{ opacity: 0.7, cursor: 'not-allowed' }}>Gerar Plano Alimentar (IA)</button>
              </div>
              {planos.length > 0 ? (
                <div className="planos-list">
                  {planos.map(p => (
                    <div key={p.id} className="timeline-item">
                      <div className="timeline-date">{new Date(p.created_at).toLocaleDateString('pt-BR')}</div>
                      <div className="timeline-content">
                        <span className="badge badge-primary">Plano Gerado</span>
                        <button className="nav-link" style={{ padding: '0.5rem 1rem' }}>Visualizar</button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="empty-state" style={{ height: '200px' }}>Nenhum plano alimentar gerado ainda.</div>
              )}
            </section>
          </div>
        )}

        {showModal && (
          <div className="modal-backdrop">
            <div className="modal-content">
              <div className="modal-header">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <h2>Nova Consulta</h2>
                  <button onClick={() => setShowModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}><X size={24} /></button>
                </div>
              </div>
              <form onSubmit={handleSaveConsulta} className="form-grid">
                <div className="form-group" style={{ gridColumn: '1 / -1' }}><label>Data da Consulta</label><input type="date" value={newConsulta.data_consulta} onChange={e => setNewConsulta({...newConsulta, data_consulta: e.target.value})} required /></div>
                <div className="form-group"><label>Peso (kg) *</label><input type="number" step="0.1" value={newConsulta.peso} onChange={e => setNewConsulta({...newConsulta, peso: e.target.value})} required /></div>
                <div className="form-group"><label>% Gordura</label><input type="number" step="0.1" value={newConsulta.percentual_gordura} onChange={e => setNewConsulta({...newConsulta, percentual_gordura: e.target.value})} /></div>
                <div className="form-group"><label>Cintura (cm)</label><input type="number" step="0.1" value={newConsulta.cintura} onChange={e => setNewConsulta({...newConsulta, cintura: e.target.value})} /></div>
                <div className="form-group"><label>Quadril (cm)</label><input type="number" step="0.1" value={newConsulta.quadril} onChange={e => setNewConsulta({...newConsulta, quadril: e.target.value})} /></div>
                <div className="form-group" style={{ gridColumn: '1 / -1' }}><label>Observações</label><textarea value={newConsulta.observacoes} onChange={e => setNewConsulta({...newConsulta, observacoes: e.target.value})} /></div>
                <div className="form-group" style={{ gridColumn: '1 / -1' }}><label>Próximo Retorno</label><input type="date" value={newConsulta.proximo_retorno} onChange={e => setNewConsulta({...newConsulta, proximo_retorno: e.target.value})} /></div>
                <div style={{ gridColumn: '1 / -1', display: 'flex', gap: '1rem', marginTop: '1.5rem' }}>
                  <button type="submit" className="btn-primary" disabled={saving} style={{ flex: 1 }}>
                    {saving ? 'Salvando...' : 'Salvar Consulta'}
                  </button>
                  <button type="button" onClick={() => setShowModal(false)} className="btn-ghost">
                    Cancelar
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}

export default PerfilPaciente
