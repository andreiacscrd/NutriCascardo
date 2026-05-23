# 🚀 Guia de Deploy em Produção — Sistema Nutricionista

Este guia detalha o passo a passo para preparar, validar e realizar o deploy seguro do **Sistema Nutricionista** em produção na **Vercel** com banco de dados **Supabase**.

---

## 🔍 1. Checklist de Pré-Deploy & Segurança

Antes de enviar o código para o GitHub, valide os seguintes pontos cruciais de segurança:

1. **Variáveis de Ambiente Ocultas**:
   - As chaves de API e conexões são importadas estritamente de `import.meta.env` ou `process.env`.
   - Nenhuma chave de API real (`GOOGLE_API_KEY` ou credenciais do Supabase) está escrita diretamente (*hardcoded*) no código.

2. **Arquivo `.gitignore` Configurado**:
   - O arquivo [.gitignore](file:///d:/AndreiaC_DESGRAV/Sistema%20Nutricionista/.gitignore) foi atualizado para conter explicitamente `.env`. Isso previne que suas variáveis locais de teste vazem no repositório público do GitHub.

3. **Validação do Build local**:
   - O build de produção foi executado localmente com `npm run build` e compilou em menos de 1 segundo sem qualquer erro de sintaxe ou de imports quebrados.

---

## 🧩 2. Enviando para o GitHub (GitHub Desktop)

Siga este procedimento para versionar suas alterações de forma segura:

1. **Abra o repositório no GitHub Desktop**:
   - Selecione a pasta do projeto `Sistema Nutricionista`.

2. **Revise as Alterações**:
   - Garanta que as únicas modificações listadas sejam os arquivos do código-fonte modificados.
   - **IMPORTANTE**: O arquivo `.env` **não** deve aparecer na lista de arquivos alterados (graças ao `.gitignore` atualizado).

3. **Faça o Commit**:
   - No campo inferior esquerdo do GitHub Desktop, digite uma mensagem curta e clara:
     * Ex: `feat: add AI meal planner integration and production deploy configs`
   - Clique em **Commit to main**.

4. **Envie para o GitHub**:
   - Clique no botão superior **Push origin** para enviar seu código ao repositório remoto.

---

## 🔐 3. Deploy na Vercel (Frontend & Serverless Functions)

1. **Acesse a Vercel**:
   - Entre no painel da [Vercel](https://vercel.com/) e faça login com seu GitHub.

2. **Importar Projeto**:
   - Clique em **Add New...** -> **Project**.
   - Selecione o repositório correspondente ao seu `Sistema Nutricionista`.

3. **Configuração de Variáveis de Ambiente**:
   - Expanda a seção **Environment Variables** nas configurações do projeto antes de clicar em Deploy.
   - Adicione as seguintes variáveis de produção de forma idêntica ao seu `.env` local:
     * `VITE_SUPABASE_URL` = *(Sua URL pública do Supabase)*
     * `VITE_SUPABASE_ANON_KEY` = *(Sua chave anônima pública do Supabase)*
     * `GOOGLE_API_KEY` = *(Sua chave de API de produção do Gemini 2.5 Flash)*

4. **Deploy**:
   - Clique em **Deploy**. A Vercel buildará a aplicação e implantará automaticamente a Serverless Function `/api/gerar-plano` na nuvem global de forma 100% segura.

---

## 🟢 4. Persistência de Dados & RLS no Supabase

1. O banco de dados do Supabase **`nutricionista_sistema`** (ID: `cxyozaxblvnhuzllearp`) está ativo e saudável.
2. A tabela `public.planos_alimentares` já está criada no banco de dados com a estrutura adequada e a RLS (*Row Level Security*) habilitada.
3. As operações de gravação e leitura foram totalmente validadas. Todos os planos gerados e editados são persistidos diretamente na tabela com vinculação ao ID do respectivo paciente e listados imediatamente no histórico clínico.

---

## ✅ Critério de Sucesso

- **Segurança Absoluta**: Nenhuma credencial sensível está no repositório.
- **Produção Estável**: Sistema funcional no domínio fornecido pela Vercel.
- **Experiência Premium**: Nutricionista com poder de gerar planos via IA e editá-los livremente antes de salvar no prontuário digital.
