import { test, expect } from '@playwright/test';

test.describe('Analytics Page', () => {
  let boardId: string;

  test.beforeEach(async ({ page }) => {
    // Limpar localStorage antes de cada teste
    await page.goto('/');
    await page.evaluate(() => {
      localStorage.clear();
    });
    
    // Criar um board e tarefas para os testes
    await page.goto('/');
    await page.waitForLoadState('domcontentloaded');
    
    // Criar board
    await page.click('text=Criar Primeiro Board');
    await page.fill('input[placeholder*="nome"]', 'Board Analytics');
    await page.fill('textarea[placeholder*="descrição"]', 'Board para testar analytics');
    await page.click('button:has-text("Salvar")');
    await expect(page.locator('.q-dialog')).toBeHidden();
    
    // Obter ID do board criado
    const boardData = await page.evaluate(() => {
      const boards = JSON.parse(localStorage.getItem('boards') || '[]');
      return { boardId: boards[0]?.id };
    });
    
    boardId = boardData.boardId;
    
    // Criar algumas tarefas para testar analytics
    await page.click('button:has-text("Criar Primeira Tarefa")');
    await page.fill('input[placeholder*="título"]', 'Tarefa Backlog');
    await page.fill('textarea[placeholder*="descrição"]', 'Tarefa em backlog');
    await page.click('button:has-text("Salvar")');
    await expect(page.locator('.q-dialog')).toBeHidden();
    
    await page.click('button:has-text("+ Nova Tarefa")');
    await page.fill('input[placeholder*="título"]', 'Tarefa Progresso');
    await page.fill('textarea[placeholder*="descrição"]', 'Tarefa em progresso');
    await page.click('button:has-text("Salvar")');
    await expect(page.locator('.q-dialog')).toBeHidden();
    
    await page.click('button:has-text("+ Nova Tarefa")');
    await page.fill('input[placeholder*="título"]', 'Tarefa Concluída');
    await page.fill('textarea[placeholder*="descrição"]', 'Tarefa concluída');
    await page.click('button:has-text("Salvar")');
    await expect(page.locator('.q-dialog')).toBeHidden();
  });

  test('deve exibir estado de carregamento inicialmente', async ({ page }) => {
    await page.goto(`/analytics?boardId=${boardId}`);
    
    // Verificar se o spinner de carregamento está visível
    await expect(page.locator('.q-spinner-dots')).toBeVisible();
    await expect(page.locator('text=Carregando estatísticas...')).toBeVisible();
  });

  test('deve exibir header da página de analytics', async ({ page }) => {
    await page.goto(`/analytics?boardId=${boardId}`);
    await page.waitForLoadState('domcontentloaded');
    
    // Verificar se o header está presente
    await expect(page.locator('text=Analytics - Board Analytics')).toBeVisible();
    await expect(page.locator('text=Estatísticas detalhadas do board')).toBeVisible();
    
    // Verificar se o botão de voltar está presente
    await expect(page.locator('button[icon="arrow_back"]')).toBeVisible();
    
    // Verificar se o botão de exportar está presente
    await expect(page.locator('button:has-text("Exportar Dados")')).toBeVisible();
  });

  test('deve exibir métricas principais', async ({ page }) => {
    await page.goto(`/analytics?boardId=${boardId}`);
    await page.waitForLoadState('domcontentloaded');
    
    // Verificar se as métricas estão presentes
    await expect(page.locator('text=Total de Tarefas')).toBeVisible();
    await expect(page.locator('text=Taxa de Conclusão')).toBeVisible();
    await expect(page.locator('text=Em Progresso')).toBeVisible();
    await expect(page.locator('text=Eficiência')).toBeVisible();
    
    // Verificar se os valores numéricos estão sendo exibidos
    await expect(page.locator('.text-h3:has-text("3")')).toBeVisible(); // Total de tarefas
  });

  test('deve exibir distribuição por status', async ({ page }) => {
    await page.goto(`/analytics?boardId=${boardId}`);
    await page.waitForLoadState('domcontentloaded');
    
    // Verificar se a seção de distribuição está presente
    await expect(page.locator('text=Distribuição por Status')).toBeVisible();
    
    // Verificar se os status estão listados
    await expect(page.locator('text=Backlog')).toBeVisible();
    await expect(page.locator('text=Sprint')).toBeVisible();
    await expect(page.locator('text=Em Progresso')).toBeVisible();
    await expect(page.locator('text=Testando')).toBeVisible();
    await expect(page.locator('text=Concluído')).toBeVisible();
  });

  test('deve exibir métricas de produtividade', async ({ page }) => {
    await page.goto(`/analytics?boardId=${boardId}`);
    await page.waitForLoadState('domcontentloaded');
    
    // Verificar se a seção de métricas de produtividade está presente
    await expect(page.locator('text=Métricas de Produtividade')).toBeVisible();
    
    // Verificar se as métricas estão listadas
    await expect(page.locator('text=Eficiência')).toBeVisible();
    await expect(page.locator('text=Velocidade')).toBeVisible();
    await expect(page.locator('text=Fluxo')).toBeVisible();
  });

  test('deve exibir tarefas por status', async ({ page }) => {
    await page.goto(`/analytics?boardId=${boardId}`);
    await page.waitForLoadState('domcontentloaded');
    
    // Verificar se a seção de tarefas por status está presente
    await expect(page.locator('text=Tarefas por Status')).toBeVisible();
    
    // Verificar se os cards de status estão presentes
    await expect(page.locator('.status-card')).toHaveCount(5); // 5 status diferentes
  });

  test('deve navegar de volta ao clicar no botão voltar', async ({ page }) => {
    await page.goto(`/analytics?boardId=${boardId}`);
    await page.waitForLoadState('domcontentloaded');
    
    // Clicar no botão voltar
    await page.click('button[icon="arrow_back"]');
    
    // Verificar se voltou para a página inicial
    await expect(page).toHaveURL('/');
  });

  test('deve exportar dados do board', async ({ page }) => {
    await page.goto(`/analytics?boardId=${boardId}`);
    await page.waitForLoadState('domcontentloaded');
    
    // Interceptar o download
    const downloadPromise = page.waitForEvent('download');
    
    // Clicar no botão de exportar
    await page.click('button:has-text("Exportar Dados")');
    
    // Aguardar o download
    const download = await downloadPromise;
    
    // Verificar se o arquivo foi baixado
    expect(download.suggestedFilename()).toContain('analytics-Board Analytics');
    expect(download.suggestedFilename()).toContain('.json');
  });

  test('deve exibir erro quando board não é encontrado', async ({ page }) => {
    const invalidBoardId = 'invalid-board-id';
    await page.goto(`/analytics?boardId=${invalidBoardId}`);
    await page.waitForLoadState('domcontentloaded');
    
    // Verificar se a mensagem de erro está exibida
    await expect(page.locator('text=Board não encontrado')).toBeVisible();
    await expect(page.locator('text=O board solicitado não existe ou foi removido.')).toBeVisible();
    await expect(page.locator('button:has-text("Voltar ao Início")')).toBeVisible();
  });

  test('deve redirecionar para home quando não há boardId', async ({ page }) => {
    await page.goto('/analytics');
    await page.waitForLoadState('domcontentloaded');
    
    // Verificar se foi redirecionado para a página inicial
    await expect(page).toHaveURL('/');
  });

  test('deve exibir progress bars nas métricas', async ({ page }) => {
    await page.goto(`/analytics?boardId=${boardId}`);
    await page.waitForLoadState('domcontentloaded');
    
    // Verificar se as progress bars estão presentes
    await expect(page.locator('.q-linear-progress')).toHaveCount(8); // 5 status + 3 métricas de produtividade
  });

  test('deve exibir ícones corretos nas métricas', async ({ page }) => {
    await page.goto(`/analytics?boardId=${boardId}`);
    await page.waitForLoadState('domcontentloaded');
    
    // Verificar ícones nas métricas principais
    await expect(page.locator('[name="task_alt"]')).toBeVisible();
    await expect(page.locator('[name="check_circle"]')).toBeVisible();
    await expect(page.locator('[name="trending_up"]')).toBeVisible();
    await expect(page.locator('[name="speed"]')).toBeVisible();
    
    // Verificar ícones nas seções
    await expect(page.locator('[name="pie_chart"]')).toBeVisible();
    await expect(page.locator('[name="insights"]')).toBeVisible();
    await expect(page.locator('[name="list"]')).toBeVisible();
  });

  test('deve funcionar em modo responsivo', async ({ page }) => {
    // Definir viewport móvel
    await page.setViewportSize({ width: 375, height: 667 });
    
    await page.goto(`/analytics?boardId=${boardId}`);
    await page.waitForLoadState('domcontentloaded');
    
    // Verificar se o layout se adapta
    await expect(page.locator('text=Analytics - Board Analytics')).toBeVisible();
    
    // Verificar se as métricas se adaptam
    const metricsGrid = page.locator('.metrics-grid');
    const computedStyle = await metricsGrid.evaluate(el => {
      return window.getComputedStyle(el).gridTemplateColumns;
    });
    
    // Em mobile, deve ser 2 colunas
    expect(computedStyle).toBe('repeat(2, 1fr)');
  });

  test('deve exibir cards de status com cores corretas', async ({ page }) => {
    await page.goto(`/analytics?boardId=${boardId}`);
    await page.waitForLoadState('domcontentloaded');
    
    // Verificar se os cards de status têm as classes CSS corretas
    await expect(page.locator('.status-backlog')).toBeVisible();
    await expect(page.locator('.status-sprint')).toBeVisible();
    await expect(page.locator('.status-inprogress')).toBeVisible();
    await expect(page.locator('.status-testing')).toBeVisible();
    await expect(page.locator('.status-done')).toBeVisible();
  });

  test('deve calcular métricas corretamente', async ({ page }) => {
    await page.goto(`/analytics?boardId=${boardId}`);
    await page.waitForLoadState('domcontentloaded');
    
    // Verificar se o total de tarefas está correto (3 tarefas criadas)
    await expect(page.locator('.text-h3:has-text("3")')).toBeVisible();
    
    // Verificar se as porcentagens estão sendo calculadas
    const percentageElements = page.locator('.text-h3:has-text("%")');
    await expect(percentageElements).toHaveCount(3); // 3 métricas com porcentagem
  });

  test('deve exibir hover effects nos cards', async ({ page }) => {
    await page.goto(`/analytics?boardId=${boardId}`);
    await page.waitForLoadState('domcontentloaded');
    
    // Fazer hover em um card de métrica
    const metricCard = page.locator('.metric-card').first();
    await metricCard.hover();
    
    // Verificar se o card ainda está visível após hover
    await expect(metricCard).toBeVisible();
  });
});

test.describe('Analytics Page - Edge Cases', () => {
  test('deve lidar com board sem tarefas', async ({ page }) => {
    // Limpar localStorage
    await page.goto('/');
    await page.evaluate(() => {
      localStorage.clear();
    });
    
    // Criar apenas um board sem tarefas
    await page.goto('/');
    await page.waitForLoadState('domcontentloaded');
    await page.click('text=Criar Primeiro Board');
    await page.fill('input[placeholder*="nome"]', 'Board Vazio');
    await page.fill('textarea[placeholder*="descrição"]', 'Board sem tarefas');
    await page.click('button:has-text("Salvar")');
    await expect(page.locator('.q-dialog')).toBeHidden();
    
    // Obter ID do board
    const boardId = await page.evaluate(() => {
      const boards = JSON.parse(localStorage.getItem('boards') || '[]');
      return boards[0]?.id;
    });
    
    await page.goto(`/analytics?boardId=${boardId}`);
    await page.waitForLoadState('domcontentloaded');
    
    // Verificar se as métricas mostram zero
    await expect(page.locator('.text-h3:has-text("0")')).toBeVisible();
  });

  test('deve lidar com board com muitas tarefas', async ({ page }) => {
    // Limpar localStorage
    await page.goto('/');
    await page.evaluate(() => {
      localStorage.clear();
    });
    
    // Criar board
    await page.goto('/');
    await page.waitForLoadState('domcontentloaded');
    await page.click('text=Criar Primeiro Board');
    await page.fill('input[placeholder*="nome"]', 'Board Grande');
    await page.fill('textarea[placeholder*="descrição"]', 'Board com muitas tarefas');
    await page.click('button:has-text("Salvar")');
    await expect(page.locator('.q-dialog')).toBeHidden();
    
    // Obter ID do board
    const boardId = await page.evaluate(() => {
      const boards = JSON.parse(localStorage.getItem('boards') || '[]');
      return boards[0]?.id;
    });
    
    // Criar várias tarefas programaticamente
    await page.evaluate((boardId) => {
      const tasks = [];
      for (let i = 1; i <= 20; i++) {
        tasks.push({
          id: `task-${i}`,
          title: `Tarefa ${i}`,
          description: `Descrição da tarefa ${i}`,
          status: ['backlog', 'sprint', 'inprogress', 'testing', 'done'][i % 5],
          boardId: boardId,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        });
      }
      localStorage.setItem('tasks', JSON.stringify(tasks));
    }, boardId);
    
    await page.goto(`/analytics?boardId=${boardId}`);
    await page.waitForLoadState('domcontentloaded');
    
    // Verificar se as métricas estão sendo calculadas corretamente
    await expect(page.locator('.text-h3:has-text("20")')).toBeVisible();
  });
});
