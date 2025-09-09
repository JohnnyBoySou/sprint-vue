# 🚀 Sprint Board - Todo Vue

<div align="center">
  <img src="https://img.shields.io/badge/Vue.js-3.5.18-4FC08D?style=for-the-badge&logo=vue.js&logoColor=white" alt="Vue.js" />
  <img src="https://img.shields.io/badge/TypeScript-5.8.0-3178C6?style=for-the-badge&logo=typescript&logoColor=white" alt="TypeScript" />
  <img src="https://img.shields.io/badge/Quasar-2.18.2-1976D2?style=for-the-badge&logo=quasar&logoColor=white" alt="Quasar" />
  <img src="https://img.shields.io/badge/Vite-5.0-646CFF?style=for-the-badge&logo=vite&logoColor=white" alt="Vite" />
</div>

<br>

<div align="center">
  <h3>📋 Uma ferramenta completa para gerenciamento de projetos ágeis</h3>
  <p>Gerencie suas tarefas e sprints de forma eficiente com boards visuais, acompanhamento de progresso e analytics detalhadas.</p>
</div>

---

## ✨ Funcionalidades

### 🎯 **Gestão de Boards**

- Criação e edição de boards para diferentes projetos
- Organização visual com drag-and-drop intuitivo
- Status de boards (ativo/finalizado)

### 📝 **Sistema de Tarefas**

- Criação e edição de tarefas com descrições detalhadas
- Atribuição de story points e responsáveis
- Definição de datas de vencimento
- Status: Backlog → Sprint → Em Progresso → Testando → Concluído

### 📊 **Analytics Avançadas**

- Métricas de produtividade em tempo real
- Distribuição de tarefas por status
- Taxa de conclusão e eficiência
- Exportação de dados para análise

### 🎨 **Interface Moderna**

- Design responsivo e intuitivo
- Tema claro/escuro
- Componentes visuais atrativos
- Atalhos de teclado para produtividade

### 🔧 **Recursos Técnicos**

- Persistência local com localStorage
- Gerenciamento de estado com Pinia
- Roteamento com Vue Router
- Testes unitários e E2E

---

## 🛠️ Tecnologias

### **Frontend**

- **[Vue.js 3.5.18](https://vuejs.org/)** - Framework JavaScript reativo
- **[TypeScript 5.8.0](https://www.typescriptlang.org/)** - Tipagem estática
- **[Quasar 2.18.2](https://quasar.dev/)** - Framework de componentes
- **[Vite](https://vitejs.dev/)** - Build tool e dev server
- **[Vue Router 4.5.1](https://router.vuejs.org/)** - Roteamento
- **[Pinia 3.0.3](https://pinia.vuejs.org/)** - Gerenciamento de estado

### **Desenvolvimento**

- **[Vitest 3.2.4](https://vitest.dev/)** - Testes unitários
- **[Playwright 1.54.1](https://playwright.dev/)** - Testes E2E
- **[ESLint 9.31.0](https://eslint.org/)** - Linting
- **[Prettier 3.6.2](https://prettier.io/)** - Formatação de código
- **[Sass 1.92.1](https://sass-lang.com/)** - Pré-processador CSS

### **Utilitários**

- **[UUID 13.0.0](https://www.npmjs.com/package/uuid)** - Geração de IDs únicos
- **[VueDraggable 4.1.0](https://github.com/SortableJS/vue.draggable.next)** - Drag and drop

---

## 🚀 Instalação e Uso

### **Pré-requisitos**

- Node.js 20.19.0+ ou 22.12.0+
- npm ou yarn

### **Instalação**

```bash
# Clone o repositório
git clone https://github.com/seu-usuario/todo-vue.git

# Entre no diretório
cd todo-vue

# Instale as dependências
npm install
```

### **Desenvolvimento**

```bash
# Inicie o servidor de desenvolvimento
npm run dev

# Acesse http://localhost:5173
```

### **Build para Produção**

```bash
# Gere o build otimizado
npm run build

# Visualize o build localmente
npm run preview
```

---

## 🧪 Testes

### **Testes Unitários**

```bash
# Execute os testes unitários
npm run test:unit

# Execute em modo watch
npm run test:unit -- --watch
```

### **Testes E2E**

```bash
# Instale os browsers do Playwright (primeira vez)
npx playwright install

# Execute os testes E2E
npm run test:e2e

# Execute apenas no Chromium
npm run test:e2e -- --project=chromium

# Execute em modo debug
npm run test:e2e -- --debug
```

---

## 🔧 Scripts Disponíveis

| Script              | Descrição                            |
| ------------------- | ------------------------------------ |
| `npm run dev`       | Inicia o servidor de desenvolvimento |
| `npm run build`     | Gera build de produção               |
| `npm run preview`   | Visualiza o build localmente         |
| `npm run test:unit` | Executa testes unitários             |
| `npm run test:e2e`  | Executa testes E2E                   |
| `npm run lint`      | Executa linting no código            |
| `npm run format`    | Formata o código com Prettier        |

---

## 📱 Atalhos de Teclado

| Atalho     | Ação        |
| ---------- | ----------- |
| `Ctrl + N` | Nova tarefa |
| `Ctrl + B` | Novo board  |

---

## 🎯 Como Usar

1. **Crie um Board**: Comece criando um board para seu projeto
2. **Adicione Tarefas**: Organize suas tarefas com descrições, story points e responsáveis
3. **Gerencie o Fluxo**: Mova tarefas entre os status usando drag-and-drop
4. **Acompanhe o Progresso**: Use a página de Analytics para métricas detalhadas
5. **Exporte Dados**: Baixe relatórios em JSON para análise externa

---

## 🏗️ Estrutura do Projeto

```
src/
├── components/          # Componentes reutilizáveis
│   ├── BoardView.vue   # Visualização do board Kanban
│   ├── TaskAddModal.vue # Modal para adicionar tarefas
│   ├── BoardAddModal.vue # Modal para adicionar boards
│   └── ...
├── stores/             # Gerenciamento de estado (Pinia)
│   ├── boards.ts       # Store dos boards
│   ├── tasks.ts        # Store das tarefas
│   └── theme.ts        # Store do tema
├── views/              # Páginas da aplicação
│   ├── Home.vue        # Página inicial
│   ├── Board.vue       # Página do board
│   └── Analytics.vue   # Página de analytics
├── router/             # Configuração de rotas
└── assets/             # Recursos estáticos
```

---

## 🤝 Contribuindo

1. Fork o projeto
2. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

---

## 📄 Licença

Este projeto está sob a licença MIT. Veja o arquivo [LICENSE](LICENSE) para mais detalhes.

---

## 👨‍💻 Autor

**Seu Nome**

- GitHub: [@JohnnyBoySou](https://github.com/JohnnyBoySou/o)
- LinkedIn: [João Sousa](https://www.linkedin.com/in/jo%C3%A3o-sousa-8441321aa/)

---

<div align="center">
  <p>Feito com ❤️ usando Vue.js e Quasar</p>
  <p>⭐ Se este projeto te ajudou, considere dar uma estrela!</p>
</div>
