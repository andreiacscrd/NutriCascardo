import { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { supabase } from '../lib/supabase'
import Sidebar from '../components/Sidebar'
import {
  Save,
  ArrowLeft,
  User,
  Phone,
  Activity,
  Stethoscope,
  Heart,
  Clock,
  Droplets,
  Calendar
} from 'lucide-react'

const NovoPaciente = () => {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState('pessoal')
  const [loading, setLoading] = useState(false)

  // Estados do Formulário
  const [formData, setFormData] = useState({
    nome: '',
    data_nascimento: '',
    sexo: '',
    telefone: '',
    whatsapp: '',
    email: '',
    peso_inicial: '',
    altura: '',
    objetivos: [],
    objetivo_texto: '',
    nivel_atividade: '',
    patologias: [],
    patologias_extra: '',
    restricoes_alimentares: [],
    restricoes_extra: '',
    alergias: [],
    alergias_extra: '',
    medicamentos: '',
    suplementos: '',
    refeicoes_por_dia: '',
    horario_acorda: '',
    horario_dorme: '',
    litros_agua: '',
    atividade_fisica: false,
    atividade_fisica_descricao: '',
    observacoes: ''
  })

  // Cálculos Automáticos
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
    if (!formData.peso_inicial || !formData.altura) return ''
    const peso = parseFloat(formData.peso_inicial)
    const alturaM = parseFloat(formData.altura) / 100
    if (isNaN(peso) || isNaN(alturaM) || alturaM === 0) return ''
    return (peso / (alturaM * alturaM)).toFixed(1)
  }, [formData.peso_inicial, formData.altura])

  // Handlers
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }))
  }

  const handleMultiSelect = (category, value) => {
    setFormData(prev => {
      const current = prev[category]
      if (current.includes(value)) {
        return { ...prev, [category]: current.filter(item => item !== value) }
      } else {
        return { ...prev, [category]: [...current, value] }
      }
    })
  }

  const formatTimeInput = (value) => {
    if (!value) return ''
    const clean = value.toString().replace(/\D/g, '')
    if (clean.length === 0) return ''
    let hours, mins
    if (clean.length <= 2) {
      hours = clean.padStart(2, '0')
      mins = '00'
    } else {
      hours = clean.slice(0, clean.length - 2).padStart(2, '0')
      mins = clean.slice(-2).padStart(2, '0')
    }
    return `${hours}:${mins}`
  }

  const handleSave = async (e) => {
    e.preventDefault()
    if (!formData.nome) return alert('O nome completo é obrigatório.')

    setLoading(true)
    try {
      const payload = {
        ...formData,
        nutricionista_id: user.id,
        horario_acorda: formatTimeInput(formData.horario_acorda),
        horario_dorme: formatTimeInput(formData.horario_dorme),
        peso_inicial: formData.peso_inicial === '' ? null : Number(formData.peso_inicial),
        altura: formData.altura === '' ? null : Number(formData.altura),
        refeicoes_por_dia: formData.refeicoes_por_dia === '' ? null : Number(formData.refeicoes_por_dia),
        litros_agua: formData.litros_agua === '' ? null : Number(formData.litros_agua),
      }

      const { data, error } = await supabase.from('pacientes').insert([payload]).select()
      if (error) throw error
      alert('Paciente cadastrado com sucesso!')
      navigate(`/pacientes/${data[0].id}`)
    } catch (error) {
      console.error('Erro ao salvar:', error)
      alert('Erro ao salvar paciente: ' + error.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="app-layout">
      <Sidebar />
      <main className="main-content">
        <header style={{ marginBottom: '4rem', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <button onClick={() => navigate('/Pacientes')} className="back-button">
              <ArrowLeft size={18} /> Voltar para lista
            </button>
            <h1 style={{ fontSize: '3rem', fontWeight: 800, margin: '0.5rem 0 0 0', letterSpacing: '-0.05em' }}>Novo Paciente</h1>
            <p style={{ color: 'var(--text-muted)', fontSize: '1.25rem', marginTop: '0.75rem' }}>Cadastre um novo Paciente para iniciar o acompanhamento personalizado.</p>
          </div>
          <button onClick={handleSave} className="btn-primary" disabled={loading}>
            <Save size={22} />
            {loading ? 'Salvando...' : 'Finalizar Cadastro'}
          </button>
        </header>

        <div className="form-wrapper">
          <div className="tabs-header" style={{ marginBottom: '4rem' }}>
            {['pessoal', 'clinico', 'habitos'].map(tab => (
              <button
                key={tab}
                className={`tab-btn ${activeTab === tab ? 'active' : ''}`}
                onClick={() => setActiveTab(tab)}
                style={{ textTransform: 'capitalize' }}
              >
                {tab}
              </button>
            ))}
          </div>

          {/* ABA PESSOAL */}
          {activeTab === 'pessoal' && (
            <div className="form-container" key="pessoal">
              <section className="form-section">
                <div className="form-section-title">
                  <User size={20} /> Informações Básicas
                </div>
                <div className="form-grid">
                  <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                    <label>Nome Completo *</label>
                    <input name="nome" value={formData.nome} onChange={handleChange} placeholder="Como o paciente deve ser chamado?" required />
                  </div>
                  <div className="form-group">
                    <label>Data de Nascimento</label>
                    <input type="date" name="data_nascimento" value={formData.data_nascimento} onChange={handleChange} />
                  </div>
                  <div className="form-group">
                    <label>Idade Atual</label>
                    <div className="input-with-addon">
                      <input value={idade} className="read-only-field" readOnly placeholder="--" />
                      <span className="input-addon">anos</span>
                    </div>
                  </div>
                  <div className="form-group">
                    <label>Sexo</label>
                    <select name="sexo" value={formData.sexo} onChange={handleChange}>
                      <option value="">Selecione...</option>
                      <option value="Feminino">Feminino</option>
                      <option value="Masculino">Masculino</option>
                      <option value="Outro">Outro</option>
                    </select>
                  </div>
                </div>
              </section>

              <section className="form-section">
                <div className="form-section-title">
                  <Phone size={20} /> Canais de Contato
                </div>
                <div className="form-grid">
                  <div className="form-group">
                    <label>Telefone</label>
                    <input name="telefone" value={formData.telefone} onChange={handleChange} placeholder="(00) 00000-0000" />
                  </div>
                  <div className="form-group">
                    <label>WhatsApp</label>
                    <input name="whatsapp" value={formData.whatsapp} onChange={handleChange} placeholder="(00) 00000-0000" />
                  </div>
                  <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                    <label>E-mail</label>
                    <input type="email" name="email" value={formData.email} onChange={handleChange} placeholder="email@paciente.com" />
                  </div>
                </div>
              </section>
            </div>
          )}

          {/* ABA CLÍNICO */}
          {activeTab === 'clinico' && (
            <div className="form-container" key="clinico">
              <section className="form-section">
                <div className="form-section-title">
                  <Activity size={20} /> Avaliação Física
                </div>
                <div className="form-grid">
                  <div className="form-group">
                    <label>Peso Atual</label>
                    <div className="input-with-addon">
                      <input type="number" name="peso_inicial" value={formData.peso_inicial} onChange={handleChange} placeholder="0.0" />
                      <span className="input-addon">kg</span>
                    </div>
                  </div>
                  <div className="form-group">
                    <label>Altura</label>
                    <div className="input-with-addon">
                      <input type="number" name="altura" value={formData.altura} onChange={handleChange} placeholder="0" />
                      <span className="input-addon">cm</span>
                    </div>
                  </div>
                  <div className="form-group">
                    <label>IMC (Automático)</label>
                    <input value={imc} className="read-only-field" readOnly placeholder="--" />
                  </div>
                  <div className="form-group">
                    <label>Nível de Atividade</label>
                    <select name="nivel_atividade" value={formData.nivel_atividade} onChange={handleChange}>
                      <option value="">Selecione...</option>
                      <option value="Sedentário">Sedentário</option>
                      <option value="Levemente ativo">Levemente ativo</option>
                      <option value="Moderadamente ativo">Moderadamente ativo</option>
                      <option value="Muito ativo">Muito ativo</option>
                      <option value="Extremamente ativo">Extremamente ativo</option>
                    </select>
                  </div>
                </div>
              </section>

              <section className="form-section">
                <div className="form-section-title">
                  <Stethoscope size={20} /> Anamnese e Objetivos
                </div>
                <div className="form-grid">
                  <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                    <label>Objetivos Principais</label>
                    <div className="checkbox-grid">
                      {['Emagrecer', 'Ganhar massa', 'Controlar diabetes', 'Saúde geral', 'Performance esportiva', 'Reeducação alimentar'].map(obj => (
                        <label key={obj} className="checkbox-item">
                          <input type="checkbox" checked={formData.objetivos.includes(obj)} onChange={() => handleMultiSelect('objetivos', obj)} />
                          {obj}
                        </label>
                      ))}
                    </div>
                    <textarea
                      name="objetivo_texto"
                      value={formData.objetivo_texto}
                      onChange={handleChange}
                      placeholder="Descreva detalhadamente o objetivo do paciente..."
                      style={{ marginTop: '0.75rem', minHeight: '80px' }}
                    />
                  </div>
                  <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                    <label>Patologias</label>
                    <div className="checkbox-grid">
                      {['Diabetes', 'Hipertensão', 'Gastrite', 'Refluxo', 'Anemia', 'Hipotireoidismo'].map(pat => (
                        <label key={pat} className="checkbox-item">
                          <input type="checkbox" checked={formData.patologias.includes(pat)} onChange={() => handleMultiSelect('patologias', pat)} />
                          {pat}
                        </label>
                      ))}
                    </div>
                    <input
                      name="patologias_extra"
                      value={formData.patologias_extra}
                      onChange={handleChange}
                      placeholder="Outras patologias..."
                      style={{ marginTop: '0.75rem' }}
                    />
                  </div>

                  <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                    <label>Restrições Alimentares</label>
                    <div className="checkbox-grid">
                      {['Glúten', 'Lactose', 'Açúcar', 'Sal', 'Carne vermelha', 'Frutos do mar'].map(res => (
                        <label key={res} className="checkbox-item">
                          <input type="checkbox" checked={formData.restricoes_alimentares.includes(res)} onChange={() => handleMultiSelect('restricoes_alimentares', res)} />
                          {res}
                        </label>
                      ))}
                    </div>
                    <input
                      name="restricoes_extra"
                      value={formData.restricoes_extra}
                      onChange={handleChange}
                      placeholder="Outras restrições..."
                      style={{ marginTop: '0.75rem' }}
                    />
                  </div>

                  <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                    <label>Alergias</label>
                    <div className="checkbox-grid">
                      {['Amendoim', 'Ovos', 'Leite', 'Soja', 'Trigo', 'Peixe'].map(alg => (
                        <label key={alg} className="checkbox-item">
                          <input type="checkbox" checked={formData.alergias.includes(alg)} onChange={() => handleMultiSelect('alergias', alg)} />
                          {alg}
                        </label>
                      ))}
                    </div>
                    <input
                      name="alergias_extra"
                      value={formData.alergias_extra}
                      onChange={handleChange}
                      placeholder="Outras alergias..."
                      style={{ marginTop: '0.75rem' }}
                    />
                  </div>

                  <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                    <label>Medicamentos em Uso</label>
                    <textarea name="medicamentos" value={formData.medicamentos} onChange={handleChange} placeholder="Liste os medicamentos e dosagens..." style={{ minHeight: '80px' }} />
                  </div>
                  <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                    <label>Suplementos em Uso</label>
                    <textarea name="suplementos" value={formData.suplementos} onChange={handleChange} placeholder="Liste os suplementos e dosagens..." style={{ minHeight: '80px' }} />
                  </div>
                </div>
              </section>
            </div>
          )}

          {/* ABA HÁBITOS */}
          {activeTab === 'habitos' && (
            <div className="form-container" key="habitos">
              <section className="form-section">
                <div className="form-section-title">
                  <Clock size={20} /> Rotina Diária
                </div>
                <div className="form-grid">
                  <div className="form-group">
                    <label>Refeições/Dia</label>
                    <input type="number" name="refeicoes_por_dia" value={formData.refeicoes_por_dia} onChange={handleChange} placeholder="0" />
                  </div>
                  <div className="form-group">
                    <label>Horário Acorda</label>
                    <div className="input-with-addon">
                      <input type="number" name="horario_acorda" value={formData.horario_acorda} onChange={handleChange} placeholder="Ex: 630" />
                      <span className="input-addon">{formatTimeInput(formData.horario_acorda)}</span>
                    </div>
                  </div>
                  <div className="form-group">
                    <label>Horário Dorme</label>
                    <div className="input-with-addon">
                      <input type="number" name="horario_dorme" value={formData.horario_dorme} onChange={handleChange} placeholder="Ex: 2230" />
                      <span className="input-addon">{formatTimeInput(formData.horario_dorme)}</span>
                    </div>
                  </div>
                  <div className="form-group">
                    <label>Consumo de Água</label>
                    <div className="input-with-addon">
                      <input type="number" name="litros_agua" value={formData.litros_agua} onChange={handleChange} step="0.1" />
                      <span className="input-addon">litros/dia</span>
                    </div>
                  </div>
                </div>
              </section>

              <section className="form-section">
                <div className="form-section-title">
                  <Heart size={20} /> Estilo de Vida e Obs.
                </div>
                <div className="form-grid">
                  <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                    <label className="checkbox-item" style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--text-main)' }}>
                      <input type="checkbox" name="atividade_fisica" checked={formData.atividade_fisica} onChange={handleChange} />
                      Pratica atividade física regularmente?
                    </label>
                    {formData.atividade_fisica && (
                      <textarea name="atividade_fisica_descricao" value={formData.atividade_fisica_descricao} onChange={handleChange} placeholder="Qual atividade e frequência?" style={{ marginTop: '1rem', minHeight: '80px' }} />
                    )}
                  </div>
                  <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                    <label>Observações Clínicas Gerais</label>
                    <textarea name="observacoes" value={formData.observacoes} onChange={handleChange} placeholder="Qualquer outra informação relevante para o plano alimentar..." style={{ minHeight: '120px' }} />
                  </div>
                </div>
              </section>
            </div>
          )}

          <div style={{ padding: '2rem 0', display: 'flex', justifyContent: 'flex-end', gap: '1.5rem' }}>
            <button onClick={() => navigate('/pacientes')} className="btn-ghost">
              Cancelar
            </button>
            <button onClick={handleSave} className="btn-primary" disabled={loading}>
              <Save size={20} />
              {loading ? 'Salvando...' : 'Finalizar Cadastro'}
            </button>
          </div>
        </div>
      </main>
    </div>
  )
}

export default NovoPaciente
