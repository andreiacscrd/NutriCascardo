# 🥗 NutriCascardo — Sistema de Gestão Nutricional Premium

O **NutriCascardo** é uma plataforma robusta e de alta performance desenvolvida para nutricionistas que buscam modernizar sua prática clínica. O sistema oferece uma experiência de usuário premium, focada em clareza visual, agilidade no atendimento e acompanhamento detalhado da evolução do paciente.

![Dashboard NutriCascardo](https://raw.githubusercontent.com/andreiacscrd/NutriCascardo/main/public/dashboard.png)

## 📖 O que é o projeto?

O projeto nasceu da necessidade de um sistema que unisse **estética premium** e **funcionalidade clínica**. Ele resolve problemas comuns de prontuários em papel ou sistemas legados lentos, oferecendo:
- **Prontuário Inteligente**: Organização de dados pessoais, clínicos e hábitos em uma interface limpa.
- **Visualização de Dados**: Gráficos automáticos de peso e métricas antropométricas.
- **Gestão de Retornos**: Alertas visuais para pacientes que precisam de atenção.
- **Flexibilidade**: Interface adaptável com Modo Escuro/Claro nativo.

## 🛠️ Como foi desenvolvido? (Dev Journey)

Este projeto foi desenvolvido utilizando uma metodologia moderna de **Pair Programming com IA**, focando em:
1. **Design System Customizado**: Em vez de bibliotecas genéricas, criamos um sistema de design próprio usando Vanilla CSS para garantir que cada detalhe (sombras, raios de borda, animações) fosse único e luxuoso.
2. **Arquitetura Escalável**: Utilizamos **React** com **Vite** para máxima velocidade no desenvolvimento e execução.
3. **Backend as a Service**: O **Supabase** foi escolhido para gerenciar autenticação e banco de dados em tempo real, permitindo uma infraestrutura segura e resiliente sem a complexidade de gerenciar servidores.
4. **Iteração Rápida**: O desenvolvimento foi feito em ciclos incrementais, onde cada funcionalidade (como o gráfico de evolução ou o formulário de anamnese) foi testada e refinada para garantir harmonia visual.

## 🚀 Tecnologias Utilizadas

- **Frontend**: React.js, Vite.
- **Backend**: Supabase (PostgreSQL, Auth, RLS).
- **Gráficos**: Recharts.
- **Ícones**: Lucide-React.
- **Deploy**: Otimizado para Vercel (com suporte a roteamento SPA via `vercel.json`).

## ⚙️ Configuração Local

1. **Clone:** `git clone https://github.com/andreiacscrd/NutriCascardo.git`
2. **Instale:** `npm install`
3. **Ambiente:** Configure o `.env` com `VITE_SUPABASE_URL` e `VITE_SUPABASE_ANON_KEY`.
4. **Rode:** `npm run dev`

---
*Este sistema é um exemplo de como a tecnologia e o design podem elevar o padrão de atendimento na área da saúde.*
