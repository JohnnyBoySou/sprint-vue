import { test, expect } from '@playwright/test';

test.describe('Task Details Page', () => {
  let boardId: string;
  let taskId: string;

  test.beforeEach(async ({ page }) => {
    // Limpar localStorage antes de cada teste
    await page.goto('/');
    await page.evaluate(() => {
      localStorage.clear();
    });
    
    // Criar um board e uma tarefa para os testes
    await page.goto('/');
    await page.waitForLoadState('domcontentloaded');
    
    // Criar board
    await page.click('text=Criar Primeiro Board');
    await page.fill('input[placeholder*="nome"]', 'Board de Teste');
    await page.fill('textarea[placeholder*="descrição"]', 'Board para testar tarefas');
    await page.click('button:has-text("Salvar")');
    await expect(page.locator('.q-dialog')).toBeHidden();
    
    // Criar tarefa
    await page.click('text=+ Nova Tarefa');
    await page.fill('input[placeholder*="título"]', 'Tarefa de Teste');
    await page.fill('textarea[placeholder*="descrição"]', 'Descrição da tarefa de teste');
    await page.click('button:has-text("Salvar")');
    await expect(page.locator('.q-dialog')).toBeHidden();
    
    // Obter IDs do board e tarefa criados
    const boardData = await page.evaluate(() => {
      const boards = JSON.parse(localStorage.getItem('boards') || '[]');
      const tasks = JSON.parse(localStorage.getItem('tasks') || '[]');
      return {
        boardId: boards[0]?.id,
        taskId: tasks[0]?.id
      };
    });
    
    boardId = boardData.boardId;
    taskId = boardData.taskId;
  });

  test('deve exibir estado de carregamento inicialmente', async ({ page }) => {
    await page.goto(`/board/${boardId}/task/${taskId}`);
    
    // Verificar se o spinner de carregamento está visível
    await expect(page.locator('.q-spinner-dots')).toBeVisible();
    await expect(page.locator('text=Carregando tarefa...')).toBeVisible();
  });

  test('deve exibir detalhes da tarefa após carregamento', async ({ page }) => {
    await page.goto(`/board/${boardId}/task/${taskId}`);
    await page.waitForLoadState('domcontentloaded');
    
    // Verificar se o header está presente
    await expect(page.locator('text=Detalhes da Tarefa')).toBeVisible();
    await expect(page.locator(`text=ID: ${taskId}`)).toBeVisible();
    
    // Verificar se os botões de ação estão presentes
    await expect(page.locator('button:has-text("Editar")')).toBeVisible();
    await expect(page.locator('button:has-text("Excluir")')).toBeVisible();
    
    // Verificar se as informações da tarefa estão exibidas
    await expect(page.locator('text=Tarefa de Teste')).toBeVisible();
    await expect(page.locator('text=Descrição da tarefa de teste')).toBeVisible();
    
    // Verificar se o status está exibido
    await expect(page.locator('text=Backlog')).toBeVisible();
    
    // Verificar se as informações do board estão presentes
    await expect(page.locator('text=Board Associado')).toBeVisible();
    await expect(page.locator('text=Board de Teste')).toBeVisible();
  });

  test('deve exibir erro quando tarefa não é encontrada', async ({ page }) => {
    const invalidTaskId = 'invalid-task-id';
    await page.goto(`/board/${boardId}/task/${invalidTaskId}`);
    await page.waitForLoadState('domcontentloaded');
    
    // Verificar se a mensagem de erro está exibida
    await expect(page.locator('text=Tarefa não encontrada')).toBeVisible();
    await expect(page.locator('text=A tarefa solicitada não existe ou foi removida.')).toBeVisible();
    await expect(page.locator('button:has-text("Voltar ao início")')).toBeVisible();
  });

  test('deve exibir erro quando tarefa não pertence ao board', async ({ page }) => {
    // Criar outro board
    await page.goto('/');
    await page.click('text=+ Nova Tarefa'); // Isso deve abrir modal de board se não há tarefas
    const newBoardBtn = page.locator('button:has-text("Novo Board"), button[icon="add"]').first();
    await newBoardBtn.click();
    await page.fill('input[placeholder*="nome"]', 'Outro Board');
    await page.fill('textarea[placeholder*="descrição"]', 'Outro board');
    await page.click('button:has-text("Salvar")');
    
    // Obter ID do novo board
    const newBoardId = await page.evaluate(() => {
      const boards = JSON.parse(localStorage.getItem('boards') || '[]');
      return boards[1]?.id;
    });
    
    // Tentar acessar a tarefa com o board errado
    await page.goto(`/board/${newBoardId}/task/${taskId}`);
    await page.waitForLoadState('domcontentloaded');
    
    // Verificar se a mensagem de erro está exibida
    await expect(page.locator('text=Tarefa não pertence a este board')).toBeVisible();
  });

  test('deve permitir editar título da tarefa', async ({ page }) => {
    await page.goto(`/board/${boardId}/task/${taskId}`);
    await page.waitForLoadState('domcontentloaded');
    
    // Clicar no botão editar
    await page.click('button:has-text("Editar")');
    
    // Verificar se os campos de edição apareceram
    await expect(page.locator('input[placeholder*="título"]')).toBeVisible();
    await expect(page.locator('textarea[placeholder*="descrição"]')).toBeVisible();
    await expect(page.locator('.q-select')).toBeVisible();
    
    // Verificar se os botões de salvar/cancelar apareceram
    await expect(page.locator('button:has-text("Salvar")')).toBeVisible();
    await expect(page.locator('button:has-text("Cancelar")')).toBeVisible();
    
    // Editar o título
    const titleInput = page.locator('input[placeholder*="título"]');
    await titleInput.clear();
    await titleInput.fill('Tarefa Editada');
    
    // Salvar
    await page.click('button:has-text("Salvar")');
    
    // Verificar se a edição foi salva
    await expect(page.locator('text=Tarefa Editada')).toBeVisible();
    await expect(page.locator('button:has-text("Editar")')).toBeVisible();
  });

  test('deve permitir editar descrição da tarefa', async ({ page }) => {
    await page.goto(`/board/${boardId}/task/${taskId}`);
    await page.waitForLoadState('domcontentloaded');
    
    // Entrar no modo de edição
    await page.click('button:has-text("Editar")');
    
    // Editar a descrição
    const descriptionInput = page.locator('textarea[placeholder*="descrição"]');
    await descriptionInput.clear();
    await descriptionInput.fill('Nova descrição da tarefa');
    
    // Salvar
    await page.click('button:has-text("Salvar")');
    
    // Verificar se a descrição foi atualizada
    await expect(page.locator('text=Nova descrição da tarefa')).toBeVisible();
  });

  test('deve permitir alterar status da tarefa', async ({ page }) => {
    await page.goto(`/board/${boardId}/task/${taskId}`);
    await page.waitForLoadState('domcontentloaded');
    
    // Entrar no modo de edição
    await page.click('button:has-text("Editar")');
    
    // Alterar o status
    await page.click('.q-select');
    await page.click('text=Em Progresso');
    
    // Salvar
    await page.click('button:has-text("Salvar")');
    
    // Verificar se o status foi atualizado
    await expect(page.locator('text=Em Progresso')).toBeVisible();
  });

  test('deve validar título obrigatório na edição', async ({ page }) => {
    await page.goto(`/board/${boardId}/task/${taskId}`);
    await page.waitForLoadState('domcontentloaded');
    
    // Entrar no modo de edição
    await page.click('button:has-text("Editar")');
    
    // Limpar o título
    const titleInput = page.locator('input[placeholder*="título"]');
    await titleInput.clear();
    
    // Tentar salvar
    await page.click('button:has-text("Salvar")');
    
    // Verificar se a mensagem de erro apareceu
    await expect(page.locator('text=Título é obrigatório')).toBeVisible();
  });

  test('deve cancelar edição e restaurar valores originais', async ({ page }) => {
    await page.goto(`/board/${boardId}/task/${taskId}`);
    await page.waitForLoadState('domcontentloaded');
    
    // Entrar no modo de edição
    await page.click('button:has-text("Editar")');
    
    // Fazer alterações
    const titleInput = page.locator('input[placeholder*="título"]');
    await titleInput.clear();
    await titleInput.fill('Título Alterado');
    
    // Cancelar edição
    await page.click('button:has-text("Cancelar")');
    
    // Verificar se os valores originais foram restaurados
    await expect(page.locator('text=Tarefa de Teste')).toBeVisible();
    await expect(page.locator('text=Título Alterado')).toBeHidden();
  });

  test('deve exibir dialog de confirmação para exclusão', async ({ page }) => {
    await page.goto(`/board/${boardId}/task/${taskId}`);
    await page.waitForLoadState('domcontentloaded');
    
    // Clicar no botão excluir
    await page.click('button:has-text("Excluir")');
    
    // Verificar se o dialog de confirmação apareceu
    await expect(page.locator('text=Confirmar Exclusão')).toBeVisible();
    await expect(page.locator('text=Tem certeza que deseja excluir a tarefa')).toBeVisible();
    await expect(page.locator('text=Tarefa de Teste')).toBeVisible();
    await expect(page.locator('text=Esta ação não pode ser desfeita.')).toBeVisible();
    
    // Verificar se os botões de ação estão presentes
    await expect(page.locator('button:has-text("Cancelar")')).toBeVisible();
    await expect(page.locator('button:has-text("Excluir")')).toBeVisible();
  });

  test('deve excluir tarefa após confirmação', async ({ page }) => {
    await page.goto(`/board/${boardId}/task/${taskId}`);
    await page.waitForLoadState('domcontentloaded');
    
    // Clicar no botão excluir
    await page.click('button:has-text("Excluir")');
    
    // Confirmar exclusão
    await page.click('button:has-text("Excluir")');
    
    // Verificar se foi redirecionado para a página inicial
    await expect(page).toHaveURL('/');
    
    // Verificar se a tarefa foi removida do localStorage
    const tasks = await page.evaluate(() => {
      return JSON.parse(localStorage.getItem('tasks') || '[]');
    });
    expect(tasks).toHaveLength(0);
  });

  test('deve cancelar exclusão da tarefa', async ({ page }) => {
    await page.goto(`/board/${boardId}/task/${taskId}`);
    await page.waitForLoadState('domcontentloaded');
    
    // Clicar no botão excluir
    await page.click('button:has-text("Excluir")');
    
    // Cancelar exclusão
    await page.click('button:has-text("Cancelar")');
    
    // Verificar se o dialog fechou e a tarefa ainda está visível
    await expect(page.locator('text=Confirmar Exclusão')).toBeHidden();
    await expect(page.locator('text=Tarefa de Teste')).toBeVisible();
  });

  test('deve navegar de volta usando botão voltar', async ({ page }) => {
    await page.goto(`/board/${boardId}/task/${taskId}`);
    await page.waitForLoadState('domcontentloaded');
    
    // Clicar no botão voltar
    await page.click('button[icon="arrow_back"]');
    
    // Verificar se voltou para a página anterior
    await expect(page).toHaveURL('/');
  });

  test('deve navegar para o board associado', async ({ page }) => {
    await page.goto(`/board/${boardId}/task/${taskId}`);
    await page.waitForLoadState('domcontentloaded');
    
    // Clicar no botão "Ver Board"
    await page.click('button:has-text("Ver Board")');
    
    // Verificar se navegou para o board
    await expect(page).toHaveURL(`/?boardId=${boardId}`);
  });

  test('deve exibir informações do board na sidebar', async ({ page }) => {
    await page.goto(`/board/${boardId}/task/${taskId}`);
    await page.waitForLoadState('domcontentloaded');
    
    // Verificar se as informações do board estão na sidebar
    await expect(page.locator('text=Detalhes')).toBeVisible();
    await expect(page.locator('text=ID da Tarefa')).toBeVisible();
    await expect(page.locator('text=Status Atual')).toBeVisible();
    await expect(page.locator('text=Board')).toBeVisible();
    await expect(page.locator('text=Board de Teste')).toBeVisible();
  });

  test('deve exibir ações rápidas na sidebar', async ({ page }) => {
    await page.goto(`/board/${boardId}/task/${taskId}`);
    await page.waitForLoadState('domcontentloaded');
    
    // Verificar se as ações rápidas estão presentes
    await expect(page.locator('text=Ações Rápidas')).toBeVisible();
    await expect(page.locator('button:has-text("Editar Tarefa")')).toBeVisible();
    await expect(page.locator('button:has-text("Ver Board")')).toBeVisible();
    await expect(page.locator('button:has-text("Voltar")')).toBeVisible();
  });

  test('deve funcionar em modo responsivo', async ({ page }) => {
    // Definir viewport móvel
    await page.setViewportSize({ width: 375, height: 667 });
    
    await page.goto(`/board/${boardId}/task/${taskId}`);
    await page.waitForLoadState('domcontentloaded');
    
    // Verificar se o layout se adapta
    await expect(page.locator('text=Detalhes da Tarefa')).toBeVisible();
    
    // Verificar se os botões estão empilhados verticalmente em mobile
    const headerActions = page.locator('.header-actions');
    const computedStyle = await headerActions.evaluate(el => {
      return window.getComputedStyle(el).flexDirection;
    });
    
    // Em mobile, deve ser column
    expect(computedStyle).toBe('column');
  });

  test('deve exibir placeholder quando não há descrição', async ({ page }) => {
    // Criar uma tarefa sem descrição
    await page.evaluate(() => {
      const tasks = JSON.parse(localStorage.getItem('tasks') || '[]');
      if (tasks.length > 0) {
        tasks[0].description = '';
        localStorage.setItem('tasks', JSON.stringify(tasks));
      }
    });
    
    await page.goto(`/board/${boardId}/task/${taskId}`);
    await page.waitForLoadState('domcontentloaded');
    
    // Verificar se o placeholder da descrição está exibido
    await expect(page.locator('text=Nenhuma descrição fornecida')).toBeVisible();
  });

  test('deve exibir status com cores corretas', async ({ page }) => {
    await page.goto(`/board/${boardId}/task/${taskId}`);
    await page.waitForLoadState('domcontentloaded');
    
    // Verificar se o chip de status está presente com a cor correta
    const statusChip = page.locator('.q-chip:has-text("Backlog")');
    await expect(statusChip).toBeVisible();
    
    // Verificar se tem o ícone de flag
    await expect(statusChip.locator('[icon="flag"]')).toBeVisible();
  });

  test('deve permitir edição através da sidebar', async ({ page }) => {
    await page.goto(`/board/${boardId}/task/${taskId}`);
    await page.waitForLoadState('domcontentloaded');
    
    // Clicar no botão de editar na sidebar
    await page.click('button:has-text("Editar Tarefa")');
    
    // Verificar se entrou no modo de edição
    await expect(page.locator('input[placeholder*="título"]')).toBeVisible();
    await expect(page.locator('button:has-text("Salvar")')).toBeVisible();
  });
});

test.describe('Task Details - Edge Cases', () => {
  test('deve lidar com tarefa sem board associado', async ({ page }) => {
    // Limpar localStorage
    await page.goto('/');
    await page.evaluate(() => {
      localStorage.clear();
    });
    
    // Criar uma tarefa sem board
    await page.evaluate(() => {
      const tasks = [{
        id: 'task-without-board',
        title: 'Tarefa Sem Board',
        description: 'Tarefa sem board associado',
        status: 'backlog',
        boardId: undefined,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }];
      localStorage.setItem('tasks', JSON.stringify(tasks));
    });
    
    // Tentar acessar a tarefa com um boardId qualquer
    await page.goto('/board/some-board-id/task/task-without-board');
    await page.waitForLoadState('domcontentloaded');
    
    // Verificar se a mensagem de erro está exibida
    await expect(page.locator('text=Tarefa não pertence a este board')).toBeVisible();
  });

  test('deve exibir mensagem quando board não é encontrado', async ({ page }) => {
    // Limpar localStorage
    await page.goto('/');
    await page.evaluate(() => {
      localStorage.clear();
    });
    
    // Criar uma tarefa com board
    await page.evaluate(() => {
      const tasks = [{
        id: 'task-with-board',
        title: 'Tarefa Com Board',
        description: 'Tarefa com board',
        status: 'backlog',
        boardId: 'some-board-id',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }];
      localStorage.setItem('tasks', JSON.stringify(tasks));
    });
    
    await page.goto('/board/some-board-id/task/task-with-board');
    await page.waitForLoadState('domcontentloaded');
    
    // Verificar se a mensagem de board não encontrado está exibida
    await expect(page.locator('text=Não associada a nenhum board')).toBeVisible();
  });
});
