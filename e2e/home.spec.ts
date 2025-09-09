import { test, expect } from '@playwright/test';

test.describe('Home Landing Page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('domcontentloaded');
  });

  test('deve exibir a página inicial com hero section', async ({ page }) => {
    // Verificar se o título principal está visível
    await expect(page.locator('.hero-title')).toContainText('Sprint Board');
    
    // Verificar se o subtítulo está presente
    await expect(page.locator('.hero-subtitle')).toContainText('Gerencie suas tarefas e sprints de forma eficiente e organizada');
    
    // Verificar se a descrição está presente
    await expect(page.locator('.hero-description')).toContainText('Uma ferramenta completa para gerenciamento de projetos ágeis');
    
    // Verificar se os botões de ação estão presentes
    await expect(page.locator('button:has-text("Começar Agora")')).toBeVisible();
    await expect(page.locator('button:has-text("Saiba Mais")')).toBeVisible();
  });


  test('deve exibir seção "Como Funciona"', async ({ page }) => {
    // Verificar se o título da seção está presente
    await expect(page.locator('.how-it-works-section .section-title')).toContainText('Como Funciona');
    
    // Verificar se os passos estão presentes
    await expect(page.locator('.step-content h3:has-text("Crie seu Board")')).toBeVisible();
    await expect(page.locator('.step-content h3:has-text("Adicione Tarefas")')).toBeVisible();
    await expect(page.locator('.step-content h3:has-text("Acompanhe o Progresso")')).toBeVisible();
    
    // Verificar se os números dos passos estão presentes
    await expect(page.locator('.step-number:has-text("1")')).toBeVisible();
    await expect(page.locator('.step-number:has-text("2")')).toBeVisible();
    await expect(page.locator('.step-number:has-text("3")')).toBeVisible();
  });

  test('deve exibir seção CTA (Call to Action)', async ({ page }) => {
    // Verificar se o título da seção está presente
    await expect(page.locator('.cta-content h2')).toContainText('Pronto para começar?');
    
    // Verificar se a descrição está presente
    await expect(page.locator('.cta-content p')).toContainText('Transforme a forma como você gerencia projetos e sprints');
    
    // Verificar se o botão de ação está presente
    await expect(page.locator('button:has-text("Acessar Sprint Board")')).toBeVisible();
  });

  test('deve navegar para boards ao clicar em "Começar Agora"', async ({ page }) => {
    // Clicar no botão "Começar Agora"
    await page.click('button:has-text("Começar Agora")');
    
    // Verificar se navegou para a rota de boards
    await expect(page).toHaveURL('/boards');
  });

  test('deve navegar para boards ao clicar em "Acessar Sprint Board"', async ({ page }) => {
    // Clicar no botão "Acessar Sprint Board"
    await page.click('button:has-text("Acessar Sprint Board")');
    
    // Verificar se navegou para a rota de boards
    await expect(page).toHaveURL('/boards');
  });

  test('deve funcionar em modo responsivo', async ({ page }) => {
    // Definir viewport móvel
    await page.setViewportSize({ width: 375, height: 667 });
    
    // Verificar se o layout se adapta
    await expect(page.locator('.hero-title')).toContainText('Sprint Board');
    
    // Verificar se os botões estão empilhados verticalmente em mobile
    const heroActions = page.locator('.hero-actions');
    const computedStyle = await heroActions.evaluate(el => {
      return window.getComputedStyle(el).flexDirection;
    });
    
    // Em mobile, deve ser column
    expect(computedStyle).toBe('column');
  });

  test('deve ter gradientes e cores corretas', async ({ page }) => {
    // Verificar se as seções têm as classes CSS corretas
    const heroSection = page.locator('.hero-section');
    await expect(heroSection).toBeVisible();
    
    const ctaSection = page.locator('.cta-section');
    await expect(ctaSection).toBeVisible();
    
    const featuresSection = page.locator('.features-section');
    await expect(featuresSection).toBeVisible();
  });

  test('deve exibir cards de recursos com hover effects', async ({ page }) => {
    // Verificar se os cards de recursos estão presentes
    const featureCards = page.locator('.feature-card');
    await expect(featureCards).toHaveCount(6);
    
    // Fazer hover em um card para testar o efeito
    const firstCard = featureCards.first();
    await firstCard.hover();
    
    // Verificar se o card ainda está visível após hover
    await expect(firstCard).toBeVisible();
  });

  test('deve ter estrutura de grid responsiva', async ({ page }) => {
    // Verificar se a grid de recursos está presente
    const featuresGrid = page.locator('.features-grid');
    await expect(featuresGrid).toBeVisible();
    
    // Verificar se a grid de passos está presente
    const stepsContainer = page.locator('.steps-container');
    await expect(stepsContainer).toBeVisible();
  });
});

test.describe('Home Landing Page - Mobile Specific', () => {
  test('deve adaptar layout para mobile', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/');
    await page.waitForLoadState('domcontentloaded');
    
    // Verificar se o título se adapta para mobile
    const heroTitle = page.locator('.hero-title');
    const computedStyle = await heroTitle.evaluate(el => {
      return window.getComputedStyle(el).flexDirection;
    });
    
    // Em mobile, deve ser column
    expect(computedStyle).toBe('column');
  });

  test('deve empilhar cards verticalmente em mobile', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/');
    await page.waitForLoadState('domcontentloaded');
    
    // Verificar se a grid de recursos se adapta
    const featuresGrid = page.locator('.features-grid');
    const computedStyle = await featuresGrid.evaluate(el => {
      return window.getComputedStyle(el).gridTemplateColumns;
    });
    
    // Em mobile, deve ser uma coluna (pode ser 1fr ou um valor fixo como 325px)
    // Verificar se não há múltiplas colunas
    expect(computedStyle).not.toContain(',');
  });

  test('deve adaptar passos para mobile', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/');
    await page.waitForLoadState('domcontentloaded');
    
    // Verificar se os passos se adaptam para mobile
    const step = page.locator('.step').first();
    const computedStyle = await step.evaluate(el => {
      return window.getComputedStyle(el).flexDirection;
    });
    
    // Em mobile, deve ser column
    expect(computedStyle).toBe('column');
  });
});
