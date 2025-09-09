<script setup lang="ts">
import { useRouter } from 'vue-router'

const router = useRouter()

function goToBoards() {
  router.push('/boards')
}
</script>

<template>
  <div class="landing-page">
    <!-- Hero Section -->
    <section class="hero-section">
      <div class="hero-content">
        <div class="hero-text">
          <h1 class="hero-title">
            <q-icon name="dashboard" class="q-mr-md" color="primary" size="48px" />
            Sprint Board
          </h1>
          <p class="hero-subtitle">
            Gerencie suas tarefas e sprints de forma eficiente e organizada
          </p>
          <p class="hero-description">
            Uma ferramenta completa para gerenciamento de projetos ágeis, 
            com boards visuais, acompanhamento de progresso e analytics detalhadas.
          </p>
          <div class="hero-actions">
            <q-btn 
              color="primary" 
              size="lg"
              label="Começar Agora" 
              @click="goToBoards"
              icon="rocket_launch"
              class="q-px-xl q-py-md"
            />
            <q-btn 
              color="secondary" 
              size="lg"
              label="Saiba Mais" 
              icon="info"
              outline
              class="q-px-xl q-py-md q-ml-md"
            />
          </div>
        </div>
        <div class="hero-image">
          <q-icon name="dashboard" size="200px" color="primary" opacity="0.1" />
        </div>
      </div>
    </section>

    <!-- Features Section -->
    <section class="features-section">
      <div class="container">
        <h2 class="section-title">Recursos Principais</h2>
        <div class="features-grid">
          <div class="feature-card">
            <q-icon name="view_kanban" size="48px" color="primary" class="q-mb-md" />
            <h3>Boards Visuais</h3>
            <p>Organize suas tarefas em colunas visuais com drag-and-drop intuitivo</p>
          </div>
          <div class="feature-card">
            <q-icon name="analytics" size="48px" color="primary" class="q-mb-md" />
            <h3>Analytics Detalhadas</h3>
            <p>Acompanhe o progresso com métricas e relatórios em tempo real</p>
          </div>
          <div class="feature-card">
            <q-icon name="speed" size="48px" color="primary" class="q-mb-md" />
            <h3>Gestão de Sprints</h3>
            <p>Planeje e execute sprints de forma eficiente e organizada</p>
          </div>
          <div class="feature-card">
            <q-icon name="group" size="48px" color="primary" class="q-mb-md" />
            <h3>Colaboração</h3>
            <p>Trabalhe em equipe com atribuição de tarefas e acompanhamento</p>
          </div>
          <div class="feature-card">
            <q-icon name="notifications" size="48px" color="primary" class="q-mb-md" />
            <h3>Notificações</h3>
            <p>Mantenha-se atualizado com alertas e lembretes automáticos</p>
          </div>
          <div class="feature-card">
            <q-icon name="cloud_sync" size="48px" color="primary" class="q-mb-md" />
            <h3>Sincronização</h3>
            <p>Seus dados são salvos automaticamente e sincronizados em tempo real</p>
          </div>
        </div>
      </div>
    </section>

    <!-- How it Works Section -->
    <section class="how-it-works-section">
      <div class="container">
        <h2 class="section-title">Como Funciona</h2>
        <div class="steps-container">
          <div class="step">
            <div class="step-number">1</div>
            <div class="step-content">
              <h3>Crie seu Board</h3>
              <p>Comece criando um board para seu projeto ou sprint</p>
            </div>
          </div>
          <div class="step">
            <div class="step-number">2</div>
            <div class="step-content">
              <h3>Adicione Tarefas</h3>
              <p>Organize suas tarefas em diferentes status e prioridades</p>
            </div>
          </div>
          <div class="step">
            <div class="step-number">3</div>
            <div class="step-content">
              <h3>Acompanhe o Progresso</h3>
              <p>Use analytics para monitorar performance e produtividade</p>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- CTA Section -->
    <section class="cta-section">
      <div class="container">
        <div class="cta-content">
          <h2>Pronto para começar?</h2>
          <p>Transforme a forma como você gerencia projetos e sprints</p>
          <q-btn 
            color="primary" 
            size="xl"
            label="Acessar Sprint Board" 
            @click="goToBoards"
            icon="rocket_launch"
            class="q-px-xl q-py-lg"
          />
        </div>
      </div>
    </section>
  </div>
</template>

<style scoped>
.landing-page {
  min-height: 100vh;
  width: 100%;
  overflow-x: hidden;
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
}

/* Hero Section */
.hero-section {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 80px 0;
  min-height: 70vh;
  display: flex;
  align-items: center;
}

.hero-content {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 60px;
  align-items: center;
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
}

.hero-title {
  font-size: 3.5rem;
  font-weight: 700;
  margin: 0 0 20px 0;
  display: flex;
  align-items: center;
}

.hero-subtitle {
  font-size: 1.5rem;
  font-weight: 500;
  margin: 0 0 20px 0;
  opacity: 0.9;
}

.hero-description {
  font-size: 1.1rem;
  line-height: 1.6;
  margin: 0 0 40px 0;
  opacity: 0.8;
}

.hero-actions {
  display: flex;
  gap: 20px;
  flex-wrap: wrap;
}

.hero-image {
  display: flex;
  justify-content: center;
  align-items: center;
}

/* Features Section */
.features-section {
  padding: 80px 0;
  background: #f8f9fa;
}

.section-title {
  text-align: center;
  font-size: 2.5rem;
  font-weight: 700;
  margin: 0 0 60px 0;
  color: #2c3e50;
}

.features-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 40px;
}

.feature-card {
  background: white;
  padding: 40px 30px;
  border-radius: 16px;
  text-align: center;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.feature-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.15);
}

.feature-card h3 {
  font-size: 1.5rem;
  font-weight: 600;
  margin: 20px 0 15px 0;
  color: #2c3e50;
}

.feature-card p {
  color: #6c757d;
  line-height: 1.6;
  margin: 0;
}

/* How it Works Section */
.how-it-works-section {
  padding: 80px 0;
  background: white;
}

.steps-container {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 40px;
  margin-top: 60px;
}

.step {
  display: flex;
  align-items: flex-start;
  gap: 20px;
}

.step-number {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  width: 60px;
  height: 60px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
  font-weight: 700;
  flex-shrink: 0;
}

.step-content h3 {
  font-size: 1.5rem;
  font-weight: 600;
  margin: 0 0 10px 0;
  color: #2c3e50;
}

.step-content p {
  color: #6c757d;
  line-height: 1.6;
  margin: 0;
}

/* CTA Section */
.cta-section {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 80px 0;
  text-align: center;
}

.cta-content h2 {
  font-size: 2.5rem;
  font-weight: 700;
  margin: 0 0 20px 0;
}

.cta-content p {
  font-size: 1.2rem;
  margin: 0 0 40px 0;
  opacity: 0.9;
}

/* Responsive */
@media (max-width: 768px) {
  .hero-content {
    grid-template-columns: 1fr;
    gap: 40px;
    text-align: center;
  }
  
  .hero-title {
    font-size: 2.5rem;
    flex-direction: column;
    gap: 10px;
  }
  
  .hero-actions {
    justify-content: center;
  }
  
  .features-grid {
    grid-template-columns: 1fr;
  }
  
  .steps-container {
    grid-template-columns: 1fr;
  }
  
  .step {
    flex-direction: column;
    text-align: center;
  }
  
  .section-title {
    font-size: 2rem;
  }
  
  .cta-content h2 {
    font-size: 2rem;
  }
}

@media (max-width: 480px) {
  .hero-section {
    padding: 60px 0;
  }
  
  .hero-title {
    font-size: 2rem;
  }
  
  .hero-subtitle {
    font-size: 1.2rem;
  }
  
  .hero-actions {
    flex-direction: column;
    align-items: center;
  }
  
  .feature-card {
    padding: 30px 20px;
  }
  
  .step {
    gap: 15px;
  }
  
  .step-number {
    width: 50px;
    height: 50px;
    font-size: 1.2rem;
  }
}
</style>
