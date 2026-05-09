# 🥗 NutriCascardo — Sistema de Gestão Nutricional Premium

Bem-vinda ao **NutriCascardo**, uma plataforma moderna e intuitiva projetada para nutricionistas que buscam excelência no atendimento aos seus pacientes. Com uma interface de alta performance e design premium, o sistema centraliza o acompanhamento clínico, evolução antropométrica e gestão de planos alimentares.

![NutriCascardo UI](https://raw.githubusercontent.com/andreiacscrd/NutriCascardo/main/src/assets/hero.png)

## ✨ Funcionalidades Principais

### 📋 Prontuário Digital Inteligente
- Cadastro completo de pacientes com anamnese detalhada (pessoal, clínico e hábitos).
- Organização por abas para acesso rápido aos dados de cada paciente.
- Interface responsiva com animações fluidas.

### 📈 Evolução Clínica e Antropometria
- Gráfico dinâmico de evolução de peso sempre visível no perfil do paciente.
- Registro histórico de medidas (peso, cintura, quadril, % de gordura).
- Visualização cronológica das consultas realizadas.

### 🗓️ Gestão de Consultas
- Registro simplificado de novas consultas com cálculo automático de retorno.
- Visualização de "Pacientes que precisam de atenção" (sem retorno há mais de 30 dias).

### 🌓 Design e Experiência do Usuário
- **Modo Escuro e Claro**: Suporte nativo para ambos os temas com transição suave.
- **Glassmorphism**: Estilo visual moderno com efeitos de transparência e profundidade.
- **Performance**: Construído com React e Vite para uma navegação instantânea.

## 🚀 Tecnologias Utilizadas

- **Frontend**: [React](https://reactjs.org/) + [Vite](https://vitejs.dev/)
- **Backend & Auth**: [Supabase](https://supabase.com/) (PostgreSQL + RLS)
- **Visualização de Dados**: [Recharts](https://recharts.org/)
- **Ícones**: [Lucide-React](https://lucide.dev/)
- **Estilização**: Vanilla CSS com variáveis dinâmicas e design responsivo.

## 🛠️ Como Iniciar o Projeto Localmente

1. **Clone o repositório:**
   ```bash
   git clone https://github.com/andreiacscrd/NutriCascardo.git
   cd NutriCascardo
   ```

2. **Instale as dependências:**
   ```bash
   npm install
   ```

3. **Configure as variáveis de ambiente:**
   Crie um arquivo `.env` na raiz do projeto com as suas chaves do Supabase:
   ```env
   VITE_SUPABASE_URL=sua_url_aqui
   VITE_SUPABASE_ANON_KEY=sua_chave_anonima_aqui
   ```

4. **Inicie o servidor de desenvolvimento:**
   ```bash
   npm run dev
   ```

## 📄 Licença

Este projeto foi desenvolvido para uso profissional exclusivo da Nutricionista Andreia Cascardo.

---
Desenvolvido com ❤️ para a excelência em nutrição.
