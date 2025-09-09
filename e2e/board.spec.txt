import { test, expect } from '@playwright/test';

test.describe('Board Management', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    // Aguardar o loading inicial
    await page.waitForLoadState('domcontentloaded');
  });

  test('deve exibir estado vazio quando não há boards', async ({ page }) => {
    // Verificar se o banner de "Nenhum Board Encontrado" está visível
    await expect(page.locator('text=Nenhum Board Encontrado')).toBeVisible();
    await expect(page.locator('text=Crie seu primeiro board para começar a organizar suas tarefas.')).toBeVisible();
    
    // Verificar se o botão "Criar Primeiro Board" está presente
    const createBoardBtn = page.locator('text=Criar Primeiro Board');
    await expect(createBoardBtn).toBeVisible();
    await expect(createBoardBtn).toBeEnabled();
  });

  test('deve criar um novo board', async ({ page }) => {
    // Clicar no botão de criar board
    await page.click('text=Criar Primeiro Board');
    
    // Aguardar o modal aparecer
    await expect(page.locator('.q-dialog')).toBeVisible();
    
    // Preencher o formulário
    await page.fill('input[placeholder*="nome"]', 'Meu Primeiro Board');
    await page.fill('textarea[placeholder*="descrição"]', 'Board de teste para tarefas');
    
    // Clicar em salvar
    await page.click('button:has-text("Salvar")');
    
    // Verificar se o modal fechou
    await expect(page.locator('.q-dialog')).toBeHidden();
    
    // Verificar se o board foi criado (deve aparecer na sidebar)
    await expect(page.locator('text=Meu Primeiro Board')).toBeVisible();
  });

  test('deve exibir estado vazio quando há boards mas não há tarefas', async ({ page }) => {
    // Primeiro criar um board
    await page.click('text=Criar Primeiro Board');
    await page.fill('input[placeholder*="nome"]', 'Board de Teste');
    await page.fill('textarea[placeholder*="descrição"]', 'Descrição do board');
    await page.click('button:has-text("Salvar")');
    
    // Aguardar o modal fechar
    await expect(page.locator('.q-dialog')).toBeHidden();
    
    // Verificar se o banner de "Nenhuma Tarefa Encontrada" aparece
    await expect(page.locator('text=Nenhuma Tarefa Encontrada')).toBeVisible();
    await expect(page.locator('text=Adicione sua primeira tarefa para começar a trabalhar.')).toBeVisible();
    
    // Verificar se o botão "Criar Primeira Tarefa" está presente
    const createTaskBtn = page.locator('text=Criar Primeira Tarefa');
    await expect(createTaskBtn).toBeVisible();
    await expect(createTaskBtn).toBeEnabled();
  });

  test('deve criar uma nova tarefa', async ({ page }) => {
    // Primeiro criar um board
    await page.click('text=Criar Primeiro Board');
    await page.fill('input[placeholder*="nome"]', 'Board de Teste');
    await page.fill('textarea[placeholder*="descrição"]', 'Descrição do board');
    await page.click('button:has-text("Salvar")');
    
    // Aguardar o modal fechar
    await expect(page.locator('.q-dialog')).toBeHidden();
    
    // Clicar no botão de criar tarefa
    await page.click('text=Criar Primeira Tarefa');
    
    // Aguardar o modal de tarefa aparecer
    await expect(page.locator('.q-dialog')).toBeVisible();
    
    // Preencher o formulário da tarefa
    await page.fill('input[placeholder*="título"]', 'Minha Primeira Tarefa');
    await page.fill('textarea[placeholder*="descrição"]', 'Descrição da tarefa de teste');
    
    // Selecionar prioridade
    await page.click('.q-field[data-testid="priority-field"]');
    await page.click('text=Alta');
    
    // Clicar em salvar
    await page.click('button:has-text("Salvar")');
    
    // Verificar se o modal fechou
    await expect(page.locator('.q-dialog')).toBeHidden();
    
    // Verificar se a tarefa foi criada no board
    await expect(page.locator('text=Minha Primeira Tarefa')).toBeVisible();
  });

  test('deve exibir o kanban board quando há boards e tarefas', async ({ page }) => {
    // Primeiro criar um board
    await page.click('text=Criar Primeiro Board');
    await page.fill('input[placeholder*="nome"]', 'Board de Teste');
    await page.fill('textarea[placeholder*="descrição"]', 'Descrição do board');
    await page.click('button:has-text("Salvar")');
    
    // Criar uma tarefa
    await page.click('text=Criar Primeira Tarefa');
    await page.fill('input[placeholder*="título"]', 'Tarefa de Teste');
    await page.fill('textarea[placeholder*="descrição"]', 'Descrição da tarefa');
    await page.click('button:has-text("Salvar")');
    
    // Verificar se o kanban board está visível
    await expect(page.locator('.kanban-container')).toBeVisible();
    
    // Verificar se as colunas estão presentes
    await expect(page.locator('text=Backlog')).toBeVisible();
    await expect(page.locator('text=Sprint')).toBeVisible();
    await expect(page.locator('text=Em Progresso')).toBeVisible();
    await expect(page.locator('text=Testando')).toBeVisible();
    await expect(page.locator('text=Concluído')).toBeVisible();
    
    // Verificar se a tarefa está na coluna Backlog
    await expect(page.locator('text=Tarefa de Teste')).toBeVisible();
  });

  test('deve permitir drag and drop de tarefas entre colunas', async ({ page }) => {
    // Criar board e tarefa
    await page.click('text=Criar Primeiro Board');
    await page.fill('input[placeholder*="nome"]', 'Board de Teste');
    await page.fill('textarea[placeholder*="descrição"]', 'Descrição do board');
    await page.click('button:has-text("Salvar")');
    
    await page.click('text=Criar Primeira Tarefa');
    await page.fill('input[placeholder*="título"]', 'Tarefa Drag Test');
    await page.fill('textarea[placeholder*="descrição"]', 'Tarefa para testar drag');
    await page.click('button:has-text("Salvar")');
    
    // Aguardar a tarefa aparecer
    await expect(page.locator('text=Tarefa Drag Test')).toBeVisible();
    
    // Encontrar a tarefa na coluna Backlog
    const taskCard = page.locator('.task-card:has-text("Tarefa Drag Test")');
    const sprintColumn = page.locator('[data-status="sprint"]');
    
    // Fazer drag and drop da tarefa para a coluna Sprint
    await taskCard.dragTo(sprintColumn);
    
    // Verificar se a tarefa foi movida (aguardar atualização)
    await page.waitForLoadState('domcontentloaded');
    
    // A tarefa deve estar na coluna Sprint agora
    const sprintColumnContent = page.locator('[data-status="sprint"] .column-content');
    await expect(sprintColumnContent.locator('text=Tarefa Drag Test')).toBeVisible();
  });

  test('deve exibir botões de ação no header', async ({ page }) => {
    // Verificar se os botões estão presentes
    await expect(page.locator('text=+ Nova Tarefa')).toBeVisible();
    await expect(page.locator('text=Analytics')).toBeVisible();
    
    // Verificar se os botões estão desabilitados quando não há boards
    const newTaskBtn = page.locator('text=+ Nova Tarefa');
    const analyticsBtn = page.locator('text=Analytics');
    
    await expect(newTaskBtn).toBeDisabled();
    await expect(analyticsBtn).toBeDisabled();
  });

  test('deve habilitar botões após criar um board', async ({ page }) => {
    // Criar um board
    await page.click('text=Criar Primeiro Board');
    await page.fill('input[placeholder*="nome"]', 'Board de Teste');
    await page.fill('textarea[placeholder*="descrição"]', 'Descrição do board');
    await page.click('button:has-text("Salvar")');
    
    // Verificar se os botões foram habilitados
    const newTaskBtn = page.locator('text=+ Nova Tarefa');
    const analyticsBtn = page.locator('text=Analytics');
    
    await expect(newTaskBtn).toBeEnabled();
    await expect(analyticsBtn).toBeEnabled();
  });

  test('deve exibir dicas de atalhos de teclado', async ({ page }) => {
    // Criar um board primeiro
    await page.click('text=Criar Primeiro Board');
    await page.fill('input[placeholder*="nome"]', 'Board de Teste');
    await page.fill('textarea[placeholder*="descrição"]', 'Descrição do board');
    await page.click('button:has-text("Salvar")');
    
    // Verificar se o ícone de atalhos está presente
    const keyboardIcon = page.locator('button[icon="keyboard"]');
    await expect(keyboardIcon).toBeVisible();
    
    // Hover no ícone para ver o tooltip
    await keyboardIcon.hover();
    
    // Verificar se o tooltip com as dicas aparece
    await expect(page.locator('text=Ctrl+N - Nova Tarefa')).toBeVisible();
    await expect(page.locator('text=Ctrl+B - Novo Board')).toBeVisible();
  });
});

test.describe('Keyboard Shortcuts', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('domcontentloaded');
  });

  test('deve abrir modal de nova tarefa com Ctrl+N quando há boards', async ({ page }) => {
    // Primeiro criar um board
    await page.click('text=Criar Primeiro Board');
    await page.fill('input[placeholder*="nome"]', 'Board de Teste');
    await page.fill('textarea[placeholder*="descrição"]', 'Descrição do board');
    await page.click('button:has-text("Salvar")');
    
    // Aguardar o modal fechar
    await expect(page.locator('.q-dialog')).toBeHidden();
    
    // Pressionar Ctrl+N
    await page.keyboard.press('Control+n');
    
    // Verificar se o modal de nova tarefa abriu
    await expect(page.locator('.q-dialog')).toBeVisible();
    await expect(page.locator('text=Nova Tarefa')).toBeVisible();
  });

  test('deve abrir modal de novo board com Ctrl+N quando não há boards', async ({ page }) => {
    // Pressionar Ctrl+N (deve abrir modal de board já que não há boards)
    await page.keyboard.press('Control+n');
    
    // Verificar se o modal de novo board abriu
    await expect(page.locator('.q-dialog')).toBeVisible();
    await expect(page.locator('text=Novo Board')).toBeVisible();
  });

  test('deve abrir modal de novo board com Ctrl+B', async ({ page }) => {
    // Pressionar Ctrl+B
    await page.keyboard.press('Control+b');
    
    // Verificar se o modal de novo board abriu
    await expect(page.locator('.q-dialog')).toBeVisible();
    await expect(page.locator('text=Novo Board')).toBeVisible();
  });
});

test.describe('Board CRUD Operations', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('domcontentloaded');
  });

  test('deve editar um board existente', async ({ page }) => {
    // Criar um board
    await page.click('text=Criar Primeiro Board');
    await page.fill('input[placeholder*="nome"]', 'Board Original');
    await page.fill('textarea[placeholder*="descrição"]', 'Descrição original');
    await page.click('button:has-text("Salvar")');
    
    // Aguardar o modal fechar
    await expect(page.locator('.q-dialog')).toBeHidden();
    
    // Clicar no menu de opções do board na sidebar (assumindo que existe)
    const boardItem = page.locator('text=Board Original').first();
    await boardItem.hover();
    
    // Procurar por um botão de editar (ícone de editar ou menu)
    const editButton = page.locator('button[icon="edit"], button[icon="more_vert"]').first();
    await editButton.click();
    
    // Se houver um menu dropdown, clicar em editar
    const editOption = page.locator('text=Editar');
    await editOption.click();
    
    // Verificar se o modal de edição abriu
    await expect(page.locator('.q-dialog')).toBeVisible();
    
    // Editar o nome do board
    const nameInput = page.locator('input[placeholder*="nome"]');
    await nameInput.clear();
    await nameInput.fill('Board Editado');
    
    // Salvar as alterações
    await page.click('button:has-text("Salvar")');
    
    // Verificar se o modal fechou
    await expect(page.locator('.q-dialog')).toBeHidden();
    
    // Verificar se o nome foi atualizado
    await expect(page.locator('text=Board Editado')).toBeVisible();
  });

  test('deve excluir um board existente', async ({ page }) => {
    // Criar um board
    await page.click('text=Criar Primeiro Board');
    await page.fill('input[placeholder*="nome"]', 'Board para Excluir');
    await page.fill('textarea[placeholder*="descrição"]', 'Board que será excluído');
    await page.click('button:has-text("Salvar")');
    
    // Aguardar o modal fechar
    await expect(page.locator('.q-dialog')).toBeHidden();
    
    // Clicar no menu de opções do board na sidebar
    const boardItem = page.locator('text=Board para Excluir').first();
    await boardItem.hover();
    
    // Procurar por um botão de menu ou excluir
    const menuButton = page.locator('button[icon="more_vert"], button[icon="delete"]').first();
    await menuButton.click();
    
    // Se houver um menu dropdown, clicar em excluir
    const deleteOption = page.locator('text=Excluir');
    await deleteOption.click();
    
    // Confirmar a exclusão se aparecer um dialog de confirmação
    const confirmDialog = page.locator('.q-dialog:has-text("Confirmar")');
    await page.click('button:has-text("Confirmar")');
    
    // Verificar se o board foi removido
    await expect(page.locator('text=Board para Excluir')).toBeHidden();
    
    // Verificar se voltou ao estado vazio
    await expect(page.locator('text=Nenhum Board Encontrado')).toBeVisible();
  });
});

test.describe('Task Management', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('domcontentloaded');
    
    // Criar um board para os testes de tarefas
    await page.click('text=Criar Primeiro Board');
    await page.fill('input[placeholder*="nome"]', 'Board de Tarefas');
    await page.fill('textarea[placeholder*="descrição"]', 'Board para testar tarefas');
    await page.click('button:has-text("Salvar")');
    await expect(page.locator('.q-dialog')).toBeHidden();
  });

  test('deve criar tarefa com todos os campos preenchidos', async ({ page }) => {
    // Clicar no botão de nova tarefa
    await page.click('text=+ Nova Tarefa');
    
    // Preencher todos os campos
    await page.fill('input[placeholder*="título"]', 'Tarefa Completa');
    await page.fill('textarea[placeholder*="descrição"]', 'Descrição detalhada da tarefa');
    
    // Selecionar prioridade
    await page.click('.q-field[data-testid="priority-field"]');
    await page.click('text=Média');
    
    // Selecionar data de vencimento
    const dueDateInput = page.locator('input[type="date"]');
    await dueDateInput.fill('2024-12-31');
    
    // Salvar
    await page.click('button:has-text("Salvar")');
    
    // Verificar se a tarefa foi criada
    await expect(page.locator('text=Tarefa Completa')).toBeVisible();
  });

  test('deve exibir tarefas não relacionadas quando existem', async ({ page }) => {
    // Criar uma tarefa sem board (isso pode ser feito através de uma API ou store)
    // Por enquanto, vamos assumir que existe uma funcionalidade para isso
    
    // Verificar se o banner de tarefas não relacionadas aparece
    const unassignedBanner = page.locator('text=Tarefas Não Relacionadas');
    await expect(unassignedBanner).toBeVisible();
    await expect(page.locator('text=Arraste estas tarefas para um board para organizá-las.')).toBeVisible();
  });

  test('deve navegar para detalhes da tarefa', async ({ page }) => {
    // Criar uma tarefa
    await page.click('text=+ Nova Tarefa');
    await page.fill('input[placeholder*="título"]', 'Tarefa para Detalhes');
    await page.fill('textarea[placeholder*="descrição"]', 'Tarefa para testar navegação');
    await page.click('button:has-text("Salvar")');
    
    // Aguardar a tarefa aparecer
    await expect(page.locator('text=Tarefa para Detalhes')).toBeVisible();
    
    // Clicar no botão "Ver detalhes"
    await page.click('button:has-text("Ver detalhes")');
    
    // Verificar se navegou para a página de detalhes
    await expect(page).toHaveURL(/\/board\/\d+\/task\/\d+/);
  });
});

test.describe('Analytics Integration', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('domcontentloaded');
  });

  test('deve navegar para analytics quando há apenas um board', async ({ page }) => {
    // Criar um board
    await page.click('text=Criar Primeiro Board');
    await page.fill('input[placeholder*="nome"]', 'Board Único');
    await page.fill('textarea[placeholder*="descrição"]', 'Board para analytics');
    await page.click('button:has-text("Salvar")');
    
    // Aguardar o modal fechar
    await expect(page.locator('.q-dialog')).toBeHidden();
    
    // Clicar no botão Analytics
    await page.click('text=Analytics');
    
    // Verificar se navegou para a página de analytics
    await expect(page).toHaveURL(/\/analytics\?boardId=\d+/);
  });

  test('deve mostrar dialog de seleção quando há múltiplos boards', async ({ page }) => {
    // Criar primeiro board
    await page.click('text=Criar Primeiro Board');
    await page.fill('input[placeholder*="nome"]', 'Board 1');
    await page.fill('textarea[placeholder*="descrição"]', 'Primeiro board');
    await page.click('button:has-text("Salvar")');
    await expect(page.locator('.q-dialog')).toBeHidden();
    
    // Criar segundo board
    await page.click('text=+ Nova Tarefa'); // Isso deve abrir o modal de board se não há tarefas
    // Ou procurar por outro botão de criar board
    const newBoardBtn = page.locator('button:has-text("Novo Board"), button[icon="add"]').first();
    await newBoardBtn.click();
    
    await page.fill('input[placeholder*="nome"]', 'Board 2');
    await page.fill('textarea[placeholder*="descrição"]', 'Segundo board');
    await page.click('button:has-text("Salvar")');
    await expect(page.locator('.q-dialog')).toBeHidden();
    
    // Clicar no botão Analytics
    await page.click('text=Analytics');
    
    // Verificar se o dialog de seleção apareceu
    await expect(page.locator('text=Selecionar Board para Analytics')).toBeVisible();
    await expect(page.locator('text=Escolha qual board você deseja analisar:')).toBeVisible();
  });
});

test.describe('Responsive Design', () => {
  test('deve funcionar em dispositivos móveis', async ({ page }) => {
    // Definir viewport móvel
    await page.setViewportSize({ width: 375, height: 667 });
    
    await page.goto('/');
    await page.waitForLoadState('domcontentloaded');
    
    // Verificar se o layout se adapta
    await expect(page.locator('.home-header')).toBeVisible();
    
    // Verificar se os botões estão empilhados verticalmente em mobile
    const headerActions = page.locator('.header-actions');
    const computedStyle = await headerActions.evaluate(el => {
      return window.getComputedStyle(el).flexDirection;
    });
    
    // Em mobile, deve ser column
    expect(computedStyle).toBe('column');
  });
});
