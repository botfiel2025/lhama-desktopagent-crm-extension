// AI Configuration Manager
class AIConfigManager {
  constructor() {
    this.currentPromptId = null;
    this.defaultPrompts = [
      {
        id: 'greeting',
        name: 'Saudação Padrão',
        category: 'greeting',
        prompt: 'Responda de forma amigável e profissional. Use o contexto da empresa: {context}. Mensagem do cliente: {message}',
        keywords: ['oi', 'olá', 'bom dia', 'boa tarde', 'boa noite'],
        active: true
      },
      {
        id: 'support',
        name: 'Suporte Técnico',
        category: 'support',
        prompt: 'Forneça uma resposta útil e técnica para resolver o problema. Contexto: {context}. Problema: {message}',
        keywords: ['problema', 'erro', 'não funciona', 'ajuda', 'suporte'],
        active: true
      },
      {
        id: 'sales',
        name: 'Resposta de Vendas',
        category: 'sales',
        prompt: 'Responda focando nos benefícios do produto/serviço. Seja persuasivo mas não agressivo. Contexto: {context}. Interesse: {message}',
        keywords: ['preço', 'valor', 'comprar', 'produto', 'serviço'],
        active: true
      },
      {
        id: 'followup',
        name: 'Follow-up Automático',
        category: 'followup',
        prompt: 'Crie uma mensagem de acompanhamento personalizada baseada na conversa anterior. Contexto: {context}',
        keywords: [],
        active: false
      }
    ];
    this.init();
  }

  async init() {
    await this.loadSettings();
    this.setupEventListeners();
    this.checkAPIStatus();
    this.renderPrompts();
    this.updateTemperatureDisplay();
  }

  async loadSettings() {
    try {
      const result = await chrome.storage.local.get([
        'aiSettings', 'customPrompts', 'businessContext'
      ]);
      
      // Configurações de IA
      const aiSettings = result.aiSettings || {
        autoSuggestions: false,
        sentimentAnalysis: true,
        intentDetection: true,
        followupSuggestions: false,
        model: 'gpt-4',
        temperature: 0.7,
        maxTokens: 150
      };
      
      // Contexto do negócio
      const businessContext = result.businessContext || {
        companyName: '',
        businessSector: '',
        businessDescription: '',
        communicationTone: 'casual'
      };
      
      // Prompts personalizados
      const customPrompts = result.customPrompts || this.defaultPrompts;
      
      this.applySettings(aiSettings, businessContext);
      this.prompts = customPrompts;
      
    } catch (error) {
      console.error('Erro ao carregar configurações:', error);
      this.prompts = this.defaultPrompts;
    }
  }

  applySettings(aiSettings, businessContext) {
    // Aplicar toggles
    document.getElementById('auto-suggestions').classList.toggle('active', aiSettings.autoSuggestions);
    document.getElementById('sentiment-analysis').classList.toggle('active', aiSettings.sentimentAnalysis);
    document.getElementById('intent-detection').classList.toggle('active', aiSettings.intentDetection);
    document.getElementById('followup-suggestions').classList.toggle('active', aiSettings.followupSuggestions);
    
    // Aplicar configurações do modelo
    document.getElementById('ai-model').value = aiSettings.model;
    document.getElementById('temperature').value = aiSettings.temperature;
    document.getElementById('max-tokens').value = aiSettings.maxTokens;
    
    // Aplicar contexto do negócio
    document.getElementById('company-name').value = businessContext.companyName;
    document.getElementById('business-sector').value = businessContext.businessSector;
    document.getElementById('business-description').value = businessContext.businessDescription;
    document.getElementById('communication-tone').value = businessContext.communicationTone;
  }

  setupEventListeners() {
    // Temperature slider
    const temperatureSlider = document.getElementById('temperature');
    temperatureSlider.addEventListener('input', () => {
      this.updateTemperatureDisplay();
    });
  }

  updateTemperatureDisplay() {
    const temperature = document.getElementById('temperature').value;
    document.getElementById('temperature-value').textContent = temperature;
  }

  async checkAPIStatus() {
    const statusElement = document.getElementById('api-status');
    
    try {
      // Simular verificação da API
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Por enquanto, simular status conectado
      const isConnected = Math.random() > 0.3; // 70% chance de estar conectado
      
      statusElement.classList.toggle('connected', isConnected);
      statusElement.querySelector('div:last-child div:last-child').textContent = 
        isConnected ? 'Conectado e funcionando' : 'Erro de conexão - Verifique sua chave API';
      
    } catch (error) {
      statusElement.classList.remove('connected');
      statusElement.querySelector('div:last-child div:last-child').textContent = 
        'Erro ao verificar conexão';
    }
  }

  renderPrompts() {
    const container = document.getElementById('prompts-container');
    
    container.innerHTML = this.prompts.map(prompt => `
      <div class="prompt-card" data-id="${prompt.id}">
        <div class="prompt-header">
          <div class="prompt-name">${prompt.name}</div>
          <div class="prompt-actions">
            <span class="status-indicator ${prompt.active ? 'status-active' : 'status-inactive'}">
              ${prompt.active ? '✓ Ativo' : '✗ Inativo'}
            </span>
            <button class="btn btn-secondary btn-small" onclick="editPrompt('${prompt.id}')">
              ✏️ Editar
            </button>
            <button class="btn btn-danger btn-small" onclick="deletePrompt('${prompt.id}')">
              🗑️ Excluir
            </button>
          </div>
        </div>
        <div style="margin-bottom: 8px;">
          <strong>Categoria:</strong> ${this.getCategoryName(prompt.category)}
        </div>
        <div style="margin-bottom: 8px;">
          <strong>Palavras-chave:</strong> ${prompt.keywords.length > 0 ? prompt.keywords.join(', ') : 'Nenhuma'}
        </div>
        <div style="font-size: 13px; color: #7f8c8d; line-height: 1.4;">
          ${prompt.prompt.length > 150 ? prompt.prompt.substring(0, 150) + '...' : prompt.prompt}
        </div>
      </div>
    `).join('');
  }

  getCategoryName(category) {
    const categories = {
      general: 'Geral',
      support: 'Suporte',
      sales: 'Vendas',
      followup: 'Follow-up',
      greeting: 'Saudação'
    };
    return categories[category] || 'Geral';
  }

  openPromptModal(promptId = null) {
    this.currentPromptId = promptId;
    const modal = document.getElementById('prompt-modal');
    const title = document.getElementById('modal-title');
    
    if (promptId) {
      const prompt = this.prompts.find(p => p.id === promptId);
      if (prompt) {
        title.textContent = 'Editar Prompt';
        document.getElementById('prompt-name').value = prompt.name;
        document.getElementById('prompt-category').value = prompt.category;
        document.getElementById('prompt-text').value = prompt.prompt;
        document.getElementById('prompt-keywords').value = prompt.keywords.join(', ');
      }
    } else {
      title.textContent = 'Novo Prompt';
      document.getElementById('prompt-name').value = '';
      document.getElementById('prompt-category').value = 'general';
      document.getElementById('prompt-text').value = '';
      document.getElementById('prompt-keywords').value = '';
    }
    
    modal.style.display = 'block';
  }

  closePromptModal() {
    document.getElementById('prompt-modal').style.display = 'none';
    this.currentPromptId = null;
  }

  savePrompt() {
    const name = document.getElementById('prompt-name').value.trim();
    const category = document.getElementById('prompt-category').value;
    const text = document.getElementById('prompt-text').value.trim();
    const keywords = document.getElementById('prompt-keywords').value
      .split(',')
      .map(k => k.trim())
      .filter(k => k.length > 0);
    
    if (!name || !text) {
      this.showNotification('Nome e prompt são obrigatórios', 'error');
      return;
    }
    
    if (this.currentPromptId) {
      // Editar prompt existente
      const promptIndex = this.prompts.findIndex(p => p.id === this.currentPromptId);
      if (promptIndex !== -1) {
        this.prompts[promptIndex] = {
          ...this.prompts[promptIndex],
          name,
          category,
          prompt: text,
          keywords
        };
      }
    } else {
      // Criar novo prompt
      const newPrompt = {
        id: 'custom-' + Date.now(),
        name,
        category,
        prompt: text,
        keywords,
        active: true
      };
      this.prompts.push(newPrompt);
    }
    
    this.renderPrompts();
    this.closePromptModal();
    this.showNotification('Prompt salvo com sucesso!');
  }

  editPrompt(promptId) {
    this.openPromptModal(promptId);
  }

  deletePrompt(promptId) {
    if (confirm('Tem certeza que deseja excluir este prompt?')) {
      this.prompts = this.prompts.filter(p => p.id !== promptId);
      this.renderPrompts();
      this.showNotification('Prompt excluído com sucesso!');
    }
  }

  toggleSwitch(element) {
    element.classList.toggle('active');
  }

  async saveSettings() {
    try {
      // Coletar configurações de IA
      const aiSettings = {
        autoSuggestions: document.getElementById('auto-suggestions').classList.contains('active'),
        sentimentAnalysis: document.getElementById('sentiment-analysis').classList.contains('active'),
        intentDetection: document.getElementById('intent-detection').classList.contains('active'),
        followupSuggestions: document.getElementById('followup-suggestions').classList.contains('active'),
        model: document.getElementById('ai-model').value,
        temperature: parseFloat(document.getElementById('temperature').value),
        maxTokens: parseInt(document.getElementById('max-tokens').value)
      };
      
      // Coletar contexto do negócio
      const businessContext = {
        companyName: document.getElementById('company-name').value.trim(),
        businessSector: document.getElementById('business-sector').value.trim(),
        businessDescription: document.getElementById('business-description').value.trim(),
        communicationTone: document.getElementById('communication-tone').value
      };
      
      // Salvar no storage
      await chrome.storage.local.set({
        aiSettings,
        businessContext,
        customPrompts: this.prompts
      });
      
      // Notificar background script sobre as mudanças
      chrome.runtime.sendMessage({
        type: 'AI_SETTINGS_UPDATED',
        data: { aiSettings, businessContext, prompts: this.prompts }
      });
      
      this.showNotification('Configurações salvas com sucesso!');
      
    } catch (error) {
      console.error('Erro ao salvar configurações:', error);
      this.showNotification('Erro ao salvar configurações', 'error');
    }
  }

  async resetToDefaults() {
    if (confirm('Tem certeza que deseja restaurar todas as configurações padrão?')) {
      try {
        // Limpar storage
        await chrome.storage.local.remove(['aiSettings', 'businessContext', 'customPrompts']);
        
        // Recarregar página
        window.location.reload();
        
      } catch (error) {
        console.error('Erro ao restaurar padrões:', error);
        this.showNotification('Erro ao restaurar configurações', 'error');
      }
    }
  }

  async testAI() {
    const testMessage = 'Olá, gostaria de saber mais sobre seus produtos.';
    
    try {
      this.showNotification('Testando IA...', 'info');
      
      // Simular teste da IA
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const aiSettings = {
        model: document.getElementById('ai-model').value,
        temperature: parseFloat(document.getElementById('temperature').value),
        maxTokens: parseInt(document.getElementById('max-tokens').value)
      };
      
      const businessContext = {
        companyName: document.getElementById('company-name').value || 'Sua Empresa',
        businessSector: document.getElementById('business-sector').value || 'Geral',
        businessDescription: document.getElementById('business-description').value || 'Empresa focada em atendimento ao cliente'
      };
      
      // Resposta simulada
      const mockResponse = `Olá! Obrigado pelo interesse em nossos produtos da ${businessContext.companyName}. ` +
        `Como empresa do setor ${businessContext.businessSector}, temos várias opções que podem atender suas necessidades. ` +
        `Gostaria de saber qual tipo de produto específico você está procurando?`;
      
      // Mostrar resultado em um alert (em produção, seria um modal mais elaborado)
      alert(`Teste da IA:\n\nMensagem de entrada: "${testMessage}"\n\nResposta gerada:\n"${mockResponse}"\n\nConfiguração usada:\n- Modelo: ${aiSettings.model}\n- Temperatura: ${aiSettings.temperature}\n- Max Tokens: ${aiSettings.maxTokens}`);
      
      this.showNotification('Teste concluído com sucesso!');
      
    } catch (error) {
      console.error('Erro no teste da IA:', error);
      this.showNotification('Erro ao testar IA', 'error');
    }
  }

  showNotification(message, type = 'success') {
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.textContent = message;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
      notification.classList.add('show');
    }, 100);
    
    setTimeout(() => {
      notification.classList.remove('show');
      setTimeout(() => {
        document.body.removeChild(notification);
      }, 300);
    }, 3000);
  }
}

// Funções globais
let aiConfigManager;

function toggleSwitch(element) {
  aiConfigManager.toggleSwitch(element);
}

function openPromptModal(promptId = null) {
  aiConfigManager.openPromptModal(promptId);
}

function closePromptModal() {
  aiConfigManager.closePromptModal();
}

function savePrompt() {
  aiConfigManager.savePrompt();
}

function editPrompt(promptId) {
  aiConfigManager.editPrompt(promptId);
}

function deletePrompt(promptId) {
  aiConfigManager.deletePrompt(promptId);
}

function saveSettings() {
  aiConfigManager.saveSettings();
}

function resetToDefaults() {
  aiConfigManager.resetToDefaults();
}

function testAI() {
  aiConfigManager.testAI();
}

// Inicializar quando a página carregar
document.addEventListener('DOMContentLoaded', () => {
  aiConfigManager = new AIConfigManager();
});

// Fechar modal ao clicar fora
window.addEventListener('click', (event) => {
  const modal = document.getElementById('prompt-modal');
  if (event.target === modal) {
    closePromptModal();
  }
});