import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import fs from 'fs'
import path from 'path'

// Função para carregar variáveis do .env manualmente para Node.js local
function loadEnvFile() {
  const envPath = path.resolve(process.cwd(), '.env')
  if (fs.existsSync(envPath)) {
    const content = fs.readFileSync(envPath, 'utf-8')
    const env = {}
    content.split('\n').forEach(line => {
      const parts = line.split('=')
      if (parts.length >= 2) {
        const key = parts[0].trim()
        const value = parts.slice(1).join('=').trim()
        env[key] = value
      }
    })
    return env
  }
  return {}
}

function gerarMockPlano(dados) {
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

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        if (req.url === '/api/gerar-plano' && req.method === 'POST') {
          let body = ''
          req.on('data', chunk => {
            body += chunk
          })

          req.on('end', async () => {
            try {
              const { dados_do_paciente } = JSON.parse(body)
              const env = loadEnvFile()
              const apiKey = env.GOOGLE_API_KEY || process.env.GOOGLE_API_KEY

              res.setHeader('Content-Type', 'application/json')

              if (!apiKey) {
                console.warn("GOOGLE_API_KEY não encontrada no .env. Gerando plano mockado adaptativo.")
                const mockPlano = gerarMockPlano(dados_do_paciente)
                res.statusCode = 200
                res.end(JSON.stringify(mockPlano))
                return
              }

              // Executa chamada direta à API REST do Gemini (sem depender de imports de SDK no vite.config)
              const responseGemini = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`, {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                  contents: [{
                    parts: [{
                      text: `
Você é um nutricionista clínico profissional especialista na culinária e rotina brasileira.
Gere um plano alimentar semanal completo, saudável e diversificado com base nos dados do paciente fornecidos abaixo.

Dados do Paciente (Metas, Alergias, Restrições e Histórico):
${JSON.stringify(dados_do_paciente, null, 2)}

⚠️ Regras Críticas de Execução:
- Você deve responder APENAS e estritamente o objeto JSON solicitado.
- Não inclua blocos de código markdown (como \`\`\`json ... \`\`\`), explicações, introduções ou textos complementares.
- Adapte o cardápio rigorosamente a quaisquer alergias ou restrições descritas nos dados.
- Utilize alimentos comuns, acessíveis e culturalmente aceitos no Brasil.
- Evite repetições monótonas de alimentos nos dias seguidos.

O formato do JSON retornado deve seguir exatamente esta estrutura:
{
  "plano_semanal": [
    {
      "dia": "Segunda-feira",
      "refeicoes": {
        "cafe_da_manha": ["Opção 1", "Opção 2", "Opção 3", "Opção 4", "Opção 5"],
        "lanche_manha": ["Opção 1", "Opção 2", "Opção 3", "Opção 4", "Opção 5"],
        "almoco": ["Opção 1", "Opção 2", "Opção 3", "Opção 4", "Opção 5"],
        "lanche_tarde": ["Opção 1", "Opção 2", "Opção 3", "Opção 4", "Opção 5"],
        "jantar": ["Opção 1", "Opção 2", "Opção 3", "Opção 4", "Opção 5"]
      }
    }
  ]
}
`
                    }]
                  }],
                  generationConfig: {
                    responseMimeType: "application/json",
                    responseSchema: {
                      type: "OBJECT",
                      properties: {
                        plano_semanal: {
                          type: "ARRAY",
                          items: {
                            type: "OBJECT",
                            properties: {
                              dia: { type: "STRING" },
                              refeicoes: {
                                type: "OBJECT",
                                properties: {
                                  cafe_da_manha: { type: "ARRAY", items: { type: "STRING" } },
                                  lanche_manha: { type: "ARRAY", items: { type: "STRING" } },
                                  almoco: { type: "ARRAY", items: { type: "STRING" } },
                                  lanche_tarde: { type: "ARRAY", items: { type: "STRING" } },
                                  jantar: { type: "ARRAY", items: { type: "STRING" } }
                                },
                                required: ["cafe_da_manha", "lanche_manha", "almoco", "lanche_tarde", "jantar"]
                              }
                            },
                            required: ["dia", "refeicoes"]
                          }
                        }
                      },
                      required: ["plano_semanal"]
                    }
                  }
                })
              })

              if (!responseGemini.ok) {
                const errText = await responseGemini.text()
                throw new Error("Erro na API do Gemini: " + errText)
              }

              const geminiData = await responseGemini.json()
              if (!geminiData.candidates?.[0]?.content?.parts?.[0]?.text) {
                throw new Error("Resposta vazia da API do Gemini.")
              }

              const responseText = geminiData.candidates[0].content.parts[0].text
              const planoGerado = JSON.parse(responseText)

              res.statusCode = 200
              res.end(JSON.stringify(planoGerado))
            } catch (err) {
              console.error("Erro no middleware do Gemini:", err)
              res.statusCode = 500
              res.end(JSON.stringify({ error: "Erro na geração local: " + err.message }))
            }
          })
        } else {
          next()
        }
      })
    }
  }
})
