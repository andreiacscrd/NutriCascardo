# Plano de Implementação — Sistema Nutricionista Premium

Este plano detalha as etapas realizadas e as próximas fases para garantir uma experiência de usuário de alto nível, com foco em harmonia visual e eficiência clínica.

## 🟢 Fase 1: Padronização do Design System (Concluída)
- [x] **Unificação de Botões**: Criação das classes `.btn-primary`, `.btn-secondary`, `.btn-ghost` e `.btn-danger` no `index.css`.
- [x] **Remoção de Estilos "Stiff"**: Eliminação de bordas pretas grossas e substituição por sombras suaves e raios de borda de `1.25rem`.
- [x] **Harmonização de Inputs**: Padronização de todos os campos de formulário com foco em legibilidade e feedback visual (foco e hover).
- [x] **Animações de Entrada**: Implementação de transições suaves (`slideUp`) em todos os componentes de página e modais.

## 🟢 Fase 2: Sidebar e Navegação (Concluída)
- [x] **Ajuste de Espaçamento**: Aumento do gap entre links para `1.25rem` para evitar sobreposição.
- [x] **Hierarquia Visual**: Separação clara entre o seletor de tema (Modo Escuro) e a navegação principal.
- [x] **Rótulos Amigáveis**: Mudança de "Dashboard" para **Painel** e padronização da capitalização de **Pacientes**.
- [x] **Prevenção de Estilos Automáticos**: Garantia via CSS (`text-transform: none !important`) de que a capitalização definida no código seja respeitada.

## 🟡 Fase 3: Funcionalidades do Perfil do Paciente (Em Andamento)
- [x] **Evolução Clínica**: Implementação do gráfico de peso (`recharts`) sempre visível para acompanhamento rápido.
- [x] **Histórico de Consultas**: Lista cronológica decrescente com dados antropométricos (Peso, Cintura, Quadril, etc.).
- [x] **Gestão de Anamnese**: Organização dos dados (Pessoal, Clínico, Hábitos) em abas editáveis com salvamento em tempo real.
- [ ] **Integração de IA (Próximo Passo)**: Conectar o botão "Gerar Plano Alimentar" a uma API de IA para sugestões personalizadas baseadas nos hábitos do paciente.

## 🟡 Fase 4: Refinamentos e SEO (Próximo Passo)
- [ ] **Otimização de Performance**: Garantir que o carregamento de grandes listas de pacientes seja eficiente.
- [ ] **Ajustes de Acessibilidade**: Revisar contrastes de cores para garantir leitura perfeita em ambos os modos (claro/escuro).
- [ ] **SEO & Meta Tags**: Implementar títulos dinâmicos para as páginas de pacientes para melhor organização no navegador.

## 🛠️ Tecnologias Utilizadas
- **Frontend**: React + Vite
- **Estilização**: Vanilla CSS (com variáveis para Temas)
- **Backend**: Supabase (Auth + PostgreSQL + RLS)
- **Gráficos**: Recharts
- **Ícones**: Lucide-React
