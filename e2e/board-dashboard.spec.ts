import { test, expect } from '@playwright/test';

test.describe('Board Dashboard', () => {
  let boardId: string;

  test.beforeEach(async ({ page }) => {
    // Limpar localStorage antes de cada teste
    await page.goto('/');
    await page.evaluate(() => {
      localStorage.clear();
    });
    
    // Criar um board para os testes
    await page.goto('/');
    await page.waitForLoadState('domcontentloaded');
    
    // Criar board
    await page.click('text=Criar Primeiro Board');
    await page.fill('input[placeholder*="nome"]', 'Board de Teste');
    await page.fill('textarea[placeholder*="descrição"]', 'Board para testar dashboard');
    await page.click('button:has-text("Salvar")');
    await expect(page.locator('.q-dialog')).toBeHidden();
    
    // Obter ID do board criado
    const boardData = await page.evaluate(() => {
      const boards = JSON.parse(localStorage.getItem('boards') || '[]');
      return { boardId: boards[0]?.id };
    });
    
    boardId = boardData.boardId;
  });

  test('deve exibir estado de carregamento inicialmente', async ({ page }) => {
    await page.goto('/');
    
    // Verificar se o componente de loading está visível
    await expect(page.locator('.q-spinner-dots')).toBeVisible();
    await expect(page.locator('text=Carregando...')).toBeVisible();
  });

  test('deve exibir header do dashboard após carregamento', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('domcontentloaded');
    
    // Verificar se o header está presente
    await expect(page.locator('text=Sprint Board')).toBeVisible();
    await expect(page.locator('text=Gerencie suas tarefas de forma eficiente')).toBeVisible();
  });

  test('deve exibir sidebar com boards', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('domcontentloaded');
    
    // Verificar se a sidebar está presente
    await expect(page.locator('text=Boards')).toBeVisible();
    await expect(page.locator('text=Board de Teste')).toBeVisible();
  });

  test('deve exibir estado vazio quando não há tarefas', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('domcontentloaded');
    
    // Verificar se o estado vazio está exibido
    await expect(page.locator('text=Nenhuma Tarefa Encontrada')).toBeVisible();
    await expect(page.locator('text=Adicione sua primeira tarefa para começar a trabalhar.')).toBeVisible();
    await expect(page.locator('button:has-text("Criar Primeira Tarefa")')).toBeVisible();
  });

  test('deve criar nova tarefa através do botão', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('domcontentloaded');
    
    // Clicar no botão de criar tarefa
    await page.click('button:has-text("Criar Primeira Tarefa")');
    
    // Verificar se o modal de nova tarefa abriu
    await expect(page.locator('.q-dialog')).toBeVisible();
    await expect(page.locator('text=Nova Tarefa')).toBeVisible();
    
    // Preencher formulário
    await page.fill('input[placeholder*="título"]', 'Tarefa de Teste');
    await page.fill('textarea[placeholder*="descrição"]', 'Descrição da tarefa');
    
    // Salvar
    await page.click('button:has-text("Salvar")');
    
    // Verificar se o modal fechou
    await expect(page.locator('.q-dialog')).toBeHidden();
    
    // Verificar se a tarefa foi criada
    await expect(page.locator('text=Tarefa de Teste')).toBeVisible();
  });

  test('deve exibir kanban board quando há tarefas', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('domcontentloaded');
    
    // Criar uma tarefa
    await page.click('button:has-text("Criar Primeira Tarefa")');
    await page.fill('input[placeholder*="título"]', 'Tarefa Kanban');
    await page.fill('textarea[placeholder*="descrição"]', 'Tarefa para testar kanban');
    await page.click('button:has-text("Salvar")');
    await expect(page.locator('.q-dialog')).toBeHidden();
    
    // Verificar se o kanban board está visível
    await expect(page.locator('.kanban-container')).toBeVisible();
    
    // Verificar se as colunas estão presentes
    await expect(page.locator('text=Backlog')).toBeVisible();
    await expect(page.locator('text=Sprint')).toBeVisible();
    await expect(page.locator('text=Em Progresso')).toBeVisible();
    await expect(page.locator('text=Testando')).toBeVisible();
    await expect(page.locator('text=Concluído')).toBeVisible();
  });

  test('deve exibir atalhos de teclado', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('domcontentloaded');
    
    // Verificar se o ícone de atalhos está presente
    const keyboardIcon = page.locator('button[icon="keyboard"]');
    await expect(keyboardIcon).toBeVisible();
    
    // Hover no ícone para ver o tooltip
    await keyboardIcon.hover();
    
    // Verificar se o tooltip com as dicas aparece
    await expect(page.locator('text=Ctrl+N - Nova Tarefa')).toBeVisible();
    await expect(page.locator('text=Ctrl+B - Novo Board')).toBeVisible();
  });

  test('deve abrir modal de nova tarefa com Ctrl+N', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('domcontentloaded');
    
    // Pressionar Ctrl+N
    await page.keyboard.press('Control+n');
    
    // Verificar se o modal de nova tarefa abriu
    await expect(page.locator('.q-dialog')).toBeVisible();
    await expect(page.locator('text=Nova Tarefa')).toBeVisible();
  });

  test('deve abrir modal de novo board com Ctrl+B', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('domcontentloaded');
    
    // Pressionar Ctrl+B
    await page.keyboard.press('Control+b');
    
    // Verificar se o modal de novo board abriu
    await expect(page.locator('.q-dialog')).toBeVisible();
    await expect(page.locator('text=Novo Board')).toBeVisible();
  });

  test('deve exibir estado vazio quando não há boards', async ({ page }) => {
    // Limpar localStorage para simular estado sem boards
    await page.evaluate(() => {
      localStorage.clear();
    });
    
    await page.goto('/');
    await page.waitForLoadState('domcontentloaded');
    
    // Verificar se o estado vazio de boards está exibido
    await expect(page.locator('text=Nenhum Board Encontrado')).toBeVisible();
    await expect(page.locator('text=Crie seu primeiro board para começar a organizar suas tarefas.')).toBeVisible();
    await expect(page.locator('button:has-text("Criar Primeiro Board")')).toBeVisible();
  });

  test('deve criar novo board através do estado vazio', async ({ page }) => {
    // Limpar localStorage
    await page.evaluate(() => {
      localStorage.clear();
    });
    
    await page.goto('/');
    await page.waitForLoadState('domcontentloaded');
    
    // Clicar no botão de criar board
    await page.click('button:has-text("Criar Primeiro Board")');
    
    // Verificar se o modal de novo board abriu
    await expect(page.locator('.q-dialog')).toBeVisible();
    await expect(page.locator('text=Novo Board')).toBeVisible();
    
    // Preencher formulário
    await page.fill('input[placeholder*="nome"]', 'Meu Primeiro Board');
    await page.fill('textarea[placeholder*="descrição"]', 'Descrição do board');
    
    // Salvar
    await page.click('button:has-text("Salvar")');
    
    // Verificar se o modal fechou
    await expect(page.locator('.q-dialog')).toBeHidden();
    
    // Verificar se o board foi criado
    await expect(page.locator('text=Meu Primeiro Board')).toBeVisible();
  });

  test('deve funcionar em modo responsivo', async ({ page }) => {
    // Definir viewport móvel
    await page.setViewportSize({ width: 375, height: 667 });
    
    await page.goto('/');
    await page.waitForLoadState('domcontentloaded');
    
    // Verificar se o layout se adapta
    await expect(page.locator('text=Sprint Board')).toBeVisible();
    
    // Verificar se a sidebar se adapta
    const drawer = page.locator('.q-drawer');
    await expect(drawer).toBeVisible();
  });

  test('deve exibir loading state corretamente', async ({ page }) => {
    await page.goto('/');
    
    // Verificar se o loading state está presente
    await expect(page.locator('.q-spinner-dots')).toBeVisible();
    
    // Aguardar o loading terminar
    await page.waitForLoadState('domcontentloaded');
    
    // Verificar se o loading desapareceu
    await expect(page.locator('.q-spinner-dots')).toBeHidden();
  });

  test('deve alternar entre estados vazios corretamente', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('domcontentloaded');
    
    // Deve estar no estado de tarefas vazias
    await expect(page.locator('text=Nenhuma Tarefa Encontrada')).toBeVisible();
    
    // Criar uma tarefa
    await page.click('button:has-text("Criar Primeira Tarefa")');
    await page.fill('input[placeholder*="título"]', 'Tarefa Teste');
    await page.fill('textarea[placeholder*="descrição"]', 'Descrição');
    await page.click('button:has-text("Salvar")');
    await expect(page.locator('.q-dialog')).toBeHidden();
    
    // Deve mostrar o kanban board
    await expect(page.locator('.kanban-container')).toBeVisible();
    await expect(page.locator('text=Nenhuma Tarefa Encontrada')).toBeHidden();
  });

  test('deve manter estado da sidebar', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('domcontentloaded');
    
    // Verificar se a sidebar está aberta por padrão
    const drawer = page.locator('.q-drawer');
    await expect(drawer).toBeVisible();
    
    // Verificar se o board está listado na sidebar
    await expect(page.locator('text=Board de Teste')).toBeVisible();
  });
});

test.describe('Board Dashboard - Keyboard Shortcuts', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.evaluate(() => {
      localStorage.clear();
    });
    
    // Criar um board para os testes
    await page.goto('/');
    await page.waitForLoadState('domcontentloaded');
    await page.click('text=Criar Primeiro Board');
    await page.fill('input[placeholder*="nome"]', 'Board de Teste');
    await page.fill('textarea[placeholder*="descrição"]', 'Board para testar atalhos');
    await page.click('button:has-text("Salvar")');
    await expect(page.locator('.q-dialog')).toBeHidden();
  });

  test('deve abrir nova tarefa com Ctrl+N quando há boards', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('domcontentloaded');
    
    // Pressionar Ctrl+N
    await page.keyboard.press('Control+n');
    
    // Verificar se o modal de nova tarefa abriu
    await expect(page.locator('.q-dialog')).toBeVisible();
    await expect(page.locator('text=Nova Tarefa')).toBeVisible();
  });

  test('deve abrir novo board com Ctrl+N quando não há boards', async ({ page }) => {
    // Limpar localStorage
    await page.evaluate(() => {
      localStorage.clear();
    });
    
    await page.goto('/');
    await page.waitForLoadState('domcontentloaded');
    
    // Pressionar Ctrl+N (deve abrir modal de board já que não há boards)
    await page.keyboard.press('Control+n');
    
    // Verificar se o modal de novo board abriu
    await expect(page.locator('.q-dialog')).toBeVisible();
    await expect(page.locator('text=Novo Board')).toBeVisible();
  });

  test('deve abrir novo board com Ctrl+B sempre', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('domcontentloaded');
    
    // Pressionar Ctrl+B
    await page.keyboard.press('Control+b');
    
    // Verificar se o modal de novo board abriu
    await expect(page.locator('.q-dialog')).toBeVisible();
    await expect(page.locator('text=Novo Board')).toBeVisible();
  });
});
