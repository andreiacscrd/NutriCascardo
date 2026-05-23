import { GoogleGenerativeAI } from "@google/generative-ai";

export default async function handler(req, res) {
  // Permitir apenas requisições POST
  if (req.method !== "POST") {
    res.setHeader("Allow", ["POST"]);
    return res.status(405).json({ error: `Método ${req.method} não permitido` });
  }

  const { dados_do_paciente } = req.body || {};

  if (!dados_do_paciente) {
    return res.status(400).json({ error: "Dados do paciente são obrigatórios" });
  }

  const apiKey = process.env.GOOGLE_API_KEY;
  if (!apiKey) {
    console.error("GOOGLE_API_KEY não configurada no backend");
    return res.status(500).json({ error: "Configuração do servidor incompleta. Chave de API ausente." });
  }

  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({
      model: "gemini-2.5-flash",
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
    });

    const prompt = `
Você é um nutricionista clínico profissional especialista na culinária e rotina brasileira.
Gere um plano alimentar semanal completo, saudável e diversificado com base nos dados do paciente fornecidos abaixo.

Dados do Paciente (Metas, Alergias, Restrições e Histórico):
${typeof dados_do_paciente === "object" ? JSON.stringify(dados_do_paciente, null, 2) : dados_do_paciente}

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
    // ... repetir estruturado para os 7 dias da semana (Segunda a Domingo)
  ]
}
`;

    const result = await model.generateContent(prompt);
    const responseText = result.response.text();

    // Validação com try/catch ao tentar fazer o JSON.parse
    const planoGerado = JSON.parse(responseText);

    return res.status(200).json(planoGerado);
  } catch (error) {
    console.error("Erro na geração do plano com Gemini:", error);
    return res.status(500).json({ error: "Não foi possível gerar o plano com IA no momento. Detalhes: " + error.message });
  }
}
