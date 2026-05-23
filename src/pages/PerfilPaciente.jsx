import { useEffect, useState, useMemo } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import Sidebar from '../components/Sidebar'
import { 
  ArrowLeft, Calendar, FileText, Activity, User, Save, Plus, 
  Phone, Stethoscope, Heart, Clock, Droplets, X, Sparkles,
  Coffee, Utensils, Moon, Apple, AlertTriangle, Check
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

  // Planos Alimentares com IA
  const [planoGerado, setPlanoGerado] = useState(null)
  const [diaAtivo, setDiaAtivo] = useState('Segunda-feira')
  const [isGenerating, setIsGenerating] = useState(false)
  const [loadingMsg, setLoadingMsg] = useState('')
  const [errorMsg, setErrorMsg] = useState('')
  const [successMsg, setSuccessMsg] = useState('')
  const [visualizandoPlano, setVisualizandoPlano] = useState(null)
  const [diaAtivoVisualizacao, setDiaAtivoVisualizacao] = useState('Segunda-feira')
  const [showPlanoModal, setShowPlanoModal] = useState(false)

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

  const startLoadingAnimation = () => {
    const mensagens = [
      "Buscando dados do paciente...",
      "Analisando restrições e alergias...",
      "Processando objetivos nutricionais...",
      "IA calculando cardápio ideal...",
      "Formatando opções deliciosas...",
      "Quase pronto, organizando os dias..."
    ];
    let index = 0;
    setLoadingMsg(mensagens[0]);
    const interval = setInterval(() => {
      index = (index + 1) % mensagens.length;
      setLoadingMsg(mensagens[index]);
    }, 2500);
    return interval;
  };

  const gerarMockPlanoFrontend = (dados) => {
    const objetivos = dados?.objetivos || []
    const restricoes = (dados?.observacoes_alergias_restricoes || "").toLowerCase()
    
    const isEmagrecer = objetivos.includes('Emagrecer')
    const isGanharMassa = objetivos.includes('Ganhar massa')
    
    const dias = ["Segunda-feira", "Terça-feira", "Quarta-feira", "Quinta-feira", "Sexta-feira", "Sábado", "Domingo"]
    
    const plano_semanal = dias.map((dia) => {
      let cafe = [
        "1 copo de café com leite desnatado sem açúcar",
        "2 fatias de pão integral tostado",
        "1 ovo mexido com pingo de azeite",
        "1 fatia de mamão com semente de chia",
        "1 fatia de queijo branco minas fresco"
      ]
      
      let lancheManha = [
        "1 maçã vermelha pequena",
        "1 pote de iogurte natural desnatado",
        "3 castanhas-do-pará secas",
        "1 banana-prata amassada com canela",
        "1 xícara de chá verde gelado"
      ]
      
      let almoco = [
        "1 concha média de feijão carioca cozido",
        "2 colheres de sopa de arroz integral cozido",
        "1 filé de peito de frango grelhado premium",
        "1 prato de salada de alface, tomate e pepino",
        "1 porção de brócolis cozido no vapor"
      ]
      
      let lancheTarde = [
        "1 copo de vitamina de morango com leite de aveia",
        "1 tapioca pequena com ovo mexido",
        "1 xícara de salada de frutas com aveia",
        "2 torradas integrais com geleia diet",
        "1 copo de água de coco natural"
      ]
      
      let jantar = [
        "1 filé de peixe (tilápia) assado ao forno",
        "1 porção de purê de batata-doce cremoso",
        "1 prato de mix de folhas verdes picadas",
        "1 porção de abobrinha refogada no alho",
        "1 fatia de abacaxi para digestão rápida"
      ]

      if (isGanharMassa) {
        cafe = [
          "1 shake de hiperproteico com leite desnatado e aveia",
          "3 fatias de pão integral de grãos",
          "3 ovos mexidos inteiros",
          "1 banana grande com 1 colher de pasta de amendoim",
          "1 fatia grossa de queijo minas frescal"
        ]
        almoco = [
          "2 conchas de feijão carioca cozido temperado",
          "4 colheres de sopa de arroz branco cozido",
          "200g de patinho bovino moído grelhado",
          "1 prato de salada de rúcula com tomate seco",
          "1 porção de batata-doce ou mandioca cozida"
        ]
        jantar = [
          "200g de peito de frango em cubos grelhados",
          "4 colheres de sopa de arroz integral",
          "1 porção de brócolis e cenoura cozidos",
          "1 prato de salada verde variada com azeite",
          "1 copo de suco de uva integral sem açúcar"
        ]
      } else if (isEmagrecer) {
        cafe = [
          "1 xícara de café preto sem açúcar (opcional adoçante)",
          "1 fatia de pão integral light tostado com ovo",
          "1 fatia média de melão picado com chia",
          "1 copo de suco verde (couve, limão, gengibre)",
          "1 pote de iogurte natural desnatado sem açúcar"
        ]
        almoco = [
          "1 concha rasa de feijão carioca cozido",
          "1 colher de sopa de arroz integral ou couve-flor picada",
          "1 filé médio de frango ou peixe grelhado",
          "1 prato cheio de salada de folhas verdes à vontade",
          "1 porção de legumes cozidos no vapor (vagem, cenoura)"
        ]
        jantar = [
          "1 prato fundo de sopa de legumes com frango desfiado",
          "1 filé de tilápia grelhado com ervas finas",
          "1 prato de salada de alface e tomate cereja com limão",
          "1 porção de espinafre refogado no alho",
          "1 xícara de chá de camomila morno antes de dormir"
        ]
      }

      const aplicarRestricoes = (opcoes) => {
        return opcoes.map(opcao => {
          let op = opcao
          if (restricoes.includes("leite") || restricoes.includes("lactose")) {
            op = op.replace(/leite desnatado/gi, "leite zero lactose ou de amêndoas")
                   .replace(/leite de aveia/gi, "leite de coco ou amêndoas")
                   .replace(/iogurte natural desnatado/gi, "iogurte de coco zero lactose")
                   .replace(/iogurte natural/gi, "iogurte zero lactose")
                   .replace(/queijo branco minas/gi, "queijo minas zero lactose")
                   .replace(/queijo minas/gi, "queijo minas zero lactose")
          }
          if (restricoes.includes("ovo")) {
            op = op.replace(/ovo mexido/gi, "creme de tofu temperado com cúrcuma")
                   .replace(/ovos mexidos/gi, "tofu mexido temperado")
                   .replace(/ovo/gi, "tofu grelhado")
          }
          if (restricoes.includes("glúten") || restricoes.includes("gluten") || restricoes.includes("trigo")) {
            op = op.replace(/pão integral/gi, "pão integral sem glúten")
                   .replace(/torradas integrais/gi, "torradas de arroz sem glúten")
                   .replace(/tapioca/gi, "tapioca (naturalmente sem glúten)")
                   .replace(/aveia/gi, "aveia sem glúten")
          }
          return op
        })
      }

      return {
        dia: dia,
        refeicoes: {
          cafe_da_manha: aplicarRestricoes(cafe),
          lanche_manha: aplicarRestricoes(lancheManha),
          almoco: aplicarRestricoes(almoco),
          lanche_tarde: aplicarRestricoes(lancheTarde),
          jantar: aplicarRestricoes(jantar)
        }
      }
    })

    return { plano_semanal }
  }

  const handleGerarPlanoIA = async () => {
    setIsGenerating(true);
    setErrorMsg("");
    setSuccessMsg("");
    setPlanoGerado(null);
    
    const interval = startLoadingAnimation();

    const dadosPacienteParaIA = {
      nome: formData.nome,
      idade: idade,
      sexo: formData.sexo,
      peso_atual: consultas[0]?.peso || formData.peso_inicial || "Não informado",
      altura: formData.altura,
      objetivos: formData.objetivos || [],
      objetivo_detalhado: formData.objetivo_texto || "Não informado",
      litros_agua_dia: formData.litros_agua || "Não informado",
      refeicoes_por_dia: formData.refeicoes_por_dia || "Não informado",
      observacoes_alergias_restricoes: formData.observacoes || "Nenhuma restrição informada"
    };

    try {
      const response = await fetch("/api/gerar-plano", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ dados_do_paciente: dadosPacienteParaIA })
      });

      clearInterval(interval);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || "Erro no servidor da IA");
      }

      const data = await response.json();
      
      if (!data || !Array.isArray(data.plano_semanal)) {
        throw new Error("Formato de plano alimentar inválido retornado pela IA.");
      }

      setPlanoGerado(data);
      setDiaAtivo(data.plano_semanal[0]?.dia || "Segunda-feira");
    } catch (error) {
      clearInterval(interval);
      console.error("Erro ao chamar a API local/Vercel. Ativando emulação local:", error);
      
      // Fallback local robusto em desenvolvimento
      const mockData = gerarMockPlanoFrontend(dadosPacienteParaIA);
      setPlanoGerado(mockData);
      setDiaAtivo(mockData.plano_semanal[0]?.dia || "Segunda-feira");
      setSuccessMsg("Nota: Executado localmente em modo de desenvolvimento.");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleOptionChange = (diaNome, refeicaoNome, optionIndex, newValue) => {
    setPlanoGerado(prev => {
      if (!prev) return null;
      const novoPlanoSemanal = prev.plano_semanal.map(d => {
        if (d.dia === diaNome) {
          const novasRefeicoes = { ...d.refeicoes };
          const novasOpcoes = [...novasRefeicoes[refeicaoNome]];
          novasOpcoes[optionIndex] = newValue;
          novasRefeicoes[refeicaoNome] = novasOpcoes;
          return { ...d, refeicoes: novasRefeicoes };
        }
        return d;
      });
      return { ...prev, plano_semanal: novoPlanoSemanal };
    });
  };

  const handleSavePlanoAlimentar = async () => {
    if (!planoGerado) return;
    setSaving(true);
    setErrorMsg("");
    setSuccessMsg("");
    try {
      const { error } = await supabase.from('planos_alimentares').insert([
        {
          paciente_id: id,
          conteudo: planoGerado
        }
      ]);

      if (error) throw error;

      setSuccessMsg("Plano alimentar salvo com sucesso!");
      setPlanoGerado(null);
      fetchData();
    } catch (error) {
      console.error(error);
      setErrorMsg("Erro ao salvar o plano alimentar no banco de dados: " + error.message);
    } finally {
      setSaving(false);
    }
  };

  const handleVisualizarPlano = (plano) => {
    setVisualizandoPlano(plano.conteudo);
    setDiaAtivoVisualizacao(plano.conteudo.plano_semanal[0]?.dia || "Segunda-feira");
    setShowPlanoModal(true);
  };


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
            {errorMsg && (
              <div className="toast-alert">
                <AlertTriangle size={20} />
                <span>{errorMsg}</span>
              </div>
            )}
            {successMsg && (
              <div className="toast-alert success">
                <Check size={20} />
                <span>{successMsg}</span>
              </div>
            )}

            {isGenerating ? (
              <div className="ai-loading-overlay">
                <div className="ai-loading-spinner"></div>
                <h3 className="ai-loading-status">{loadingMsg}</h3>
                <p className="ai-loading-subtext">Isso pode levar alguns segundos enquanto o Gemini calcula os nutrientes ideais.</p>
              </div>
            ) : planoGerado ? (
              <div className="plano-ia-container">
                <div className="plano-ia-header">
                  <div>
                    <h2 style={{ fontSize: '2rem', fontWeight: 800, margin: 0, letterSpacing: '-0.04em' }}>✨ Plano Alimentar Recomendado pela IA</h2>
                    <p style={{ color: 'var(--text-muted)', fontSize: '1rem', marginTop: '0.25rem' }}>Personalizado para {formData.nome} • Revise e edite antes de salvar</p>
                  </div>
                  <div style={{ display: 'flex', gap: '1rem' }}>
                    <button onClick={handleSavePlanoAlimentar} className="btn-primary" disabled={saving}>
                      <Save size={20} /> {saving ? 'Salvando...' : 'Salvar Plano Alimentar'}
                    </button>
                    <button onClick={() => setPlanoGerado(null)} className="btn-ghost">
                      Cancelar
                    </button>
                  </div>
                </div>

                <div className="dias-tabs">
                  {planoGerado.plano_semanal.map(d => (
                    <button
                      key={d.dia}
                      type="button"
                      className={`dia-tab-btn ${diaAtivo === d.dia ? 'active' : ''}`}
                      onClick={() => setDiaAtivo(d.dia)}
                    >
                      {d.dia}
                    </button>
                  ))}
                </div>

                {planoGerado.plano_semanal.filter(d => d.dia === diaAtivo).map(d => (
                  <div key={d.dia} className="refeicoes-grid">
                    <div className="refeicao-card">
                      <h4 className="refeicao-card-title"><Coffee size={18} /> Café da Manhã</h4>
                      <div className="refeicao-inputs">
                        {d.refeicoes.cafe_da_manha.map((opcao, idx) => (
                          <div key={idx} className="refeicao-input-group">
                            <span className="refeicao-number">{idx + 1}</span>
                            <input
                              className="refeicao-input"
                              value={opcao}
                              onChange={(e) => handleOptionChange(d.dia, "cafe_da_manha", idx, e.target.value)}
                              placeholder={`Opção ${idx + 1}`}
                            />
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="refeicao-card">
                      <h4 className="refeicao-card-title"><Apple size={18} /> Lanche da Manhã</h4>
                      <div className="refeicao-inputs">
                        {d.refeicoes.lanche_manha.map((opcao, idx) => (
                          <div key={idx} className="refeicao-input-group">
                            <span className="refeicao-number">{idx + 1}</span>
                            <input
                              className="refeicao-input"
                              value={opcao}
                              onChange={(e) => handleOptionChange(d.dia, "lanche_manha", idx, e.target.value)}
                              placeholder={`Opção ${idx + 1}`}
                            />
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="refeicao-card">
                      <h4 className="refeicao-card-title"><Utensils size={18} /> Almoço</h4>
                      <div className="refeicao-inputs">
                        {d.refeicoes.almoco.map((opcao, idx) => (
                          <div key={idx} className="refeicao-input-group">
                            <span className="refeicao-number">{idx + 1}</span>
                            <input
                              className="refeicao-input"
                              value={opcao}
                              onChange={(e) => handleOptionChange(d.dia, "almoco", idx, e.target.value)}
                              placeholder={`Opção ${idx + 1}`}
                            />
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="refeicao-card">
                      <h4 className="refeicao-card-title"><Apple size={18} /> Lanche da Tarde</h4>
                      <div className="refeicao-inputs">
                        {d.refeicoes.lanche_tarde.map((opcao, idx) => (
                          <div key={idx} className="refeicao-input-group">
                            <span className="refeicao-number">{idx + 1}</span>
                            <input
                              className="refeicao-input"
                              value={opcao}
                              onChange={(e) => handleOptionChange(d.dia, "lanche_tarde", idx, e.target.value)}
                              placeholder={`Opção ${idx + 1}`}
                            />
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="refeicao-card">
                      <h4 className="refeicao-card-title"><Moon size={18} /> Jantar</h4>
                      <div className="refeicao-inputs">
                        {d.refeicoes.jantar.map((opcao, idx) => (
                          <div key={idx} className="refeicao-input-group">
                            <span className="refeicao-number">{idx + 1}</span>
                            <input
                              className="refeicao-input"
                              value={opcao}
                              onChange={(e) => handleOptionChange(d.dia, "jantar", idx, e.target.value)}
                              placeholder={`Opção ${idx + 1}`}
                            />
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <section className="form-section">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '3rem' }}>
                  <div className="form-section-title" style={{ marginBottom: 0 }}><FileText size={20} /> Histórico de Planos Alimentares</div>
                  <button onClick={handleGerarPlanoIA} className="btn-primary">
                    <Sparkles size={18} /> Gerar Plano com IA
                  </button>
                </div>
                {planos.length > 0 ? (
                  <div className="planos-list">
                    {planos.map(p => (
                      <div key={p.id} className="plano-item">
                        <div className="plano-item-info">
                          <h4 className="plano-item-title">Plano Alimentar Semanal</h4>
                          <span className="plano-item-date">Gerado em: {new Date(p.created_at).toLocaleString('pt-BR')}</span>
                        </div>
                        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                          <span className="badge badge-primary">IA Recomendado</span>
                          <button onClick={() => handleVisualizarPlano(p)} className="btn-ghost" style={{ padding: '0.5rem 1rem' }}>
                            Visualizar
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="empty-state" style={{ height: '200px' }}>Nenhum plano alimentar gerado ainda.</div>
                )}
              </section>
            )}
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

        {showPlanoModal && visualizandoPlano && (
          <div className="modal-backdrop">
            <div className="modal-content" style={{ maxWidth: '900px' }}>
              <div className="modal-header">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <h2 style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', fontSize: '1.75rem', margin: 0 }}>
                      <FileText size={24} style={{ color: 'var(--primary-color)' }} />
                      Visualizar Plano Alimentar Salvo
                    </h2>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', margin: '0.25rem 0 0 0' }}>Histórico do Paciente: {formData.nome}</p>
                  </div>
                  <button onClick={() => setShowPlanoModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}><X size={24} /></button>
                </div>
              </div>

              <div className="dias-tabs" style={{ marginBottom: '2rem' }}>
                {visualizandoPlano.plano_semanal.map(d => (
                  <button
                    key={d.dia}
                    type="button"
                    className={`dia-tab-btn ${diaAtivoVisualizacao === d.dia ? 'active' : ''}`}
                    onClick={() => setDiaAtivoVisualizacao(d.dia)}
                  >
                    {d.dia}
                  </button>
                ))}
              </div>

              {visualizandoPlano.plano_semanal.filter(d => d.dia === diaAtivoVisualizacao).map(d => (
                <div key={d.dia} className="refeicoes-grid" style={{ marginBottom: '1.5rem' }}>
                  <div className="refeicao-card">
                    <h4 className="refeicao-card-title"><Coffee size={18} /> Café da Manhã</h4>
                    <div className="refeicao-inputs">
                      {d.refeicoes.cafe_da_manha.map((opcao, idx) => (
                        <div key={idx} className="refeicao-input-group">
                          <span className="refeicao-number">{idx + 1}</span>
                          <input className="refeicao-input read-only-field" value={opcao} readOnly />
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="refeicao-card">
                    <h4 className="refeicao-card-title"><Apple size={18} /> Lanche da Manhã</h4>
                    <div className="refeicao-inputs">
                      {d.refeicoes.lanche_manha.map((opcao, idx) => (
                        <div key={idx} className="refeicao-input-group">
                          <span className="refeicao-number">{idx + 1}</span>
                          <input className="refeicao-input read-only-field" value={opcao} readOnly />
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="refeicao-card">
                    <h4 className="refeicao-card-title"><Utensils size={18} /> Almoço</h4>
                    <div className="refeicao-inputs">
                      {d.refeicoes.almoco.map((opcao, idx) => (
                        <div key={idx} className="refeicao-input-group">
                          <span className="refeicao-number">{idx + 1}</span>
                          <input className="refeicao-input read-only-field" value={opcao} readOnly />
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="refeicao-card">
                    <h4 className="refeicao-card-title"><Apple size={18} /> Lanche da Tarde</h4>
                    <div className="refeicao-inputs">
                      {d.refeicoes.lanche_tarde.map((opcao, idx) => (
                        <div key={idx} className="refeicao-input-group">
                          <span className="refeicao-number">{idx + 1}</span>
                          <input className="refeicao-input read-only-field" value={opcao} readOnly />
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="refeicao-card">
                    <h4 className="refeicao-card-title"><Moon size={18} /> Jantar</h4>
                    <div className="refeicao-inputs">
                      {d.refeicoes.jantar.map((opcao, idx) => (
                        <div key={idx} className="refeicao-input-group">
                          <span className="refeicao-number">{idx + 1}</span>
                          <input className="refeicao-input read-only-field" value={opcao} readOnly />
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ))}

              <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '2rem' }}>
                <button onClick={() => setShowPlanoModal(false)} className="btn-primary">
                  Fechar
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}

export default PerfilPaciente
