// CRM WhatsApp Web - Content Script
// Responsável por injetar a interface CRM no WhatsApp Web

class WhatsAppCRM {
  constructor() {
    this.isInitialized = false;
    this.currentContact = null;
    this.messageObserver = null;
    this.crmPanel = null;
    this.init();
  }

  async init() {
    console.log('🚀 Inicializando CRM WhatsApp Web...');
    
    // Aguarda o WhatsApp Web carregar completamente
    await this.waitForWhatsAppLoad();
    
    // Injeta a interface CRM
    this.injectCRMInterface();
    
    // Inicia o monitoramento de mensagens
    this.startMessageObserver();
    
    // Configura event listeners
    this.setupEventListeners();
    
    this.isInitialized = true;
    console.log('✅ CRM inicializado com sucesso!');
  }

  async waitForWhatsAppLoad() {
    return new Promise((resolve) => {
      const checkLoad = () => {
        const chatList = document.querySelector('[data-testid="chat-list"]');
        const mainPanel = document.querySelector('#main');
        
        if (chatList && mainPanel) {
          console.log('✅ WhatsApp Web carregado');
          resolve();
        } else {
          setTimeout(checkLoad, 1000);
        }
      };
      checkLoad();
    });
  }

  injectCRMInterface() {
    // Remove painel existente se houver
    const existingPanel = document.getElementById('crm-panel');
    if (existingPanel) {
      existingPanel.remove();
    }

    // Cria o painel CRM
    this.crmPanel = this.createCRMPanel();
    
    // Injeta o painel na interface do WhatsApp
    const appWrapper = document.querySelector('#app');
    if (appWrapper) {
      appWrapper.appendChild(this.crmPanel);
      console.log('✅ Painel CRM injetado');
    }

    // Injeta barra de sugestões
    this.injectSuggestionsBar();
  }

  createCRMPanel() {
    const panel = document.createElement('div');
    panel.id = 'crm-panel';
    panel.className = 'crm-panel';
    
    panel.innerHTML = `
      <div class="crm-header">
        <div class="crm-logo">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <path d="M12 2L2 7L12 12L22 7L12 2Z" stroke="#25D366" stroke-width="2" stroke-linejoin="round"/>
            <path d="M2 17L12 22L22 17" stroke="#25D366" stroke-width="2" stroke-linejoin="round"/>
            <path d="M2 12L12 17L22 12" stroke="#25D366" stroke-width="2" stroke-linejoin="round"/>
          </svg>
          <span>CRM</span>
        </div>
        <button class="crm-toggle" id="crm-toggle">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
            <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" stroke-width="2"/>
          </svg>
        </button>
      </div>
      
      <div class="crm-content">
        <div class="crm-tabs">
          <button class="crm-tab active" data-tab="cliente">👤 Cliente</button>
          <button class="crm-tab" data-tab="historico">📜 Histórico</button>
          <button class="crm-tab" data-tab="tags">🏷️ Tags</button>
          <button class="crm-tab" data-tab="notas">📝 Notas</button>
        </div>
        
        <div class="crm-tab-content">
          <div class="crm-tab-panel active" id="cliente-panel">
            <div class="cliente-info">
              <div class="cliente-avatar">
                <div class="avatar-placeholder">👤</div>
              </div>
              <div class="cliente-dados">
                <h3 class="cliente-nome">Selecione um contato</h3>
                <p class="cliente-telefone">-</p>
                <p class="cliente-status">-</p>
              </div>
            </div>
            
            <div class="cliente-stats">
              <div class="stat-item">
                <span class="stat-label">Mensagens</span>
                <span class="stat-value" id="total-messages">0</span>
              </div>
              <div class="stat-item">
                <span class="stat-label">Último contato</span>
                <span class="stat-value" id="last-contact">-</span>
              </div>
              <div class="stat-item">
                <span class="stat-label">Sentimento</span>
                <span class="stat-value" id="sentiment">😐 Neutro</span>
              </div>
            </div>
          </div>
          
          <div class="crm-tab-panel" id="historico-panel">
            <div class="historico-list">
              <p class="empty-state">Nenhum histórico disponível</p>
            </div>
          </div>
          
          <div class="crm-tab-panel" id="tags-panel">
            <div class="tags-container">
              <div class="tags-input">
                <input type="text" placeholder="Adicionar tag..." id="tag-input">
                <button id="add-tag-btn">+</button>
              </div>
              <div class="tags-list" id="tags-list">
                <!-- Tags serão adicionadas dinamicamente -->
              </div>
            </div>
          </div>
          
          <div class="crm-tab-panel" id="notas-panel">
            <div class="notas-container">
              <textarea placeholder="Adicione suas notas sobre este cliente..." id="notas-textarea"></textarea>
              <button class="save-notes-btn" id="save-notes">💾 Salvar Notas</button>
            </div>
          </div>
        </div>
        
        <div class="crm-actions">
          <button class="action-btn primary" id="quick-reply">
            ⚡ Resposta Rápida
          </button>
          <button class="action-btn secondary" id="schedule-message">
            ⏰ Agendar
          </button>
          <button class="action-btn secondary" id="export-data">
            📊 Exportar
          </button>
        </div>
      </div>
    `;
    
    return panel;
  }

  injectSuggestionsBar() {
    // Procura pela área de input do WhatsApp
    const footerElement = document.querySelector('footer[data-testid="conversation-compose-box-input"]');
    if (!footerElement) return;

    // Remove barra existente se houver
    const existingBar = document.getElementById('crm-suggestions-bar');
    if (existingBar) {
      existingBar.remove();
    }

    // Cria a barra de sugestões
    const suggestionsBar = document.createElement('div');
    suggestionsBar.id = 'crm-suggestions-bar';
    suggestionsBar.className = 'crm-suggestions-bar';
    
    suggestionsBar.innerHTML = `
      <div class="suggestions-header">
        <span class="suggestions-title">🤖 Sugestões IA</span>
        <button class="suggestions-toggle" id="suggestions-toggle">−</button>
      </div>
      <div class="suggestions-content">
        <div class="suggestions-list" id="suggestions-list">
          <div class="suggestion-item" data-text="Olá! Como posso ajudá-lo hoje?">
            💬 Saudação padrão
          </div>
          <div class="suggestion-item" data-text="Obrigado pelo seu contato. Vou verificar essa informação para você.">
            🔍 Verificar informação
          </div>
          <div class="suggestion-item" data-text="Entendo sua preocupação. Vamos resolver isso juntos.">
            🤝 Empatia e suporte
          </div>
        </div>
        <div class="suggestions-actions">
          <button class="suggestion-action" id="generate-suggestions">
            ✨ Gerar Novas Sugestões
          </button>
          <button class="suggestion-action" id="templates-btn">
            📋 Templates
          </button>
        </div>
      </div>
    `;
    
    // Insere antes do footer
    footerElement.parentNode.insertBefore(suggestionsBar, footerElement);
  }

  startMessageObserver() {
    // Observa mudanças na área de mensagens
    const messagesContainer = document.querySelector('[data-testid="conversation-panel-messages"]');
    if (!messagesContainer) return;

    this.messageObserver = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.type === 'childList') {
          mutation.addedNodes.forEach((node) => {
            if (node.nodeType === Node.ELEMENT_NODE && node.matches('[data-testid="msg-container"]')) {
              this.processNewMessage(node);
            }
          });
        }
      });
    });

    this.messageObserver.observe(messagesContainer, {
      childList: true,
      subtree: true
    });
  }

  processNewMessage(messageElement) {
    try {
      const messageData = this.extractMessageData(messageElement);
      if (messageData) {
        console.log('📨 Nova mensagem capturada:', messageData);
        
        // Envia para background script
        chrome.runtime.sendMessage({
          type: 'NEW_MESSAGE',
          data: messageData
        });
        
        // Atualiza interface
        this.updateClientInfo(messageData);
      }
    } catch (error) {
      console.error('❌ Erro ao processar mensagem:', error);
    }
  }

  extractMessageData(messageElement) {
    const messageText = messageElement.querySelector('[data-testid="msg-text"]')?.textContent || '';
    const timestamp = messageElement.querySelector('.message-time')?.textContent || new Date().toISOString();
    const isOutgoing = messageElement.classList.contains('message-out');
    
    // Extrai informações do contato atual
    const contactName = document.querySelector('[data-testid="conversation-info-header-chat-title"]')?.textContent || '';
    const contactPhone = this.extractPhoneNumber();
    
    return {
      text: messageText,
      timestamp: timestamp,
      isOutgoing: isOutgoing,
      contactName: contactName,
      contactPhone: contactPhone,
      messageType: 'text'
    };
  }

  extractPhoneNumber() {
    // Tenta extrair o número de telefone da interface
    const headerElement = document.querySelector('[data-testid="conversation-info-header"]');
    if (headerElement) {
      const phoneMatch = headerElement.textContent.match(/\+?[1-9]\d{1,14}/);
      return phoneMatch ? phoneMatch[0] : null;
    }
    return null;
  }

  updateClientInfo(messageData) {
    // Atualiza informações do cliente no painel
    const nomeElement = document.querySelector('.cliente-nome');
    const telefoneElement = document.querySelector('.cliente-telefone');
    const totalMessagesElement = document.getElementById('total-messages');
    const lastContactElement = document.getElementById('last-contact');
    
    if (nomeElement) nomeElement.textContent = messageData.contactName || 'Cliente';
    if (telefoneElement) telefoneElement.textContent = messageData.contactPhone || '-';
    if (lastContactElement) lastContactElement.textContent = 'Agora';
    
    // Incrementa contador de mensagens
    if (totalMessagesElement) {
      const current = parseInt(totalMessagesElement.textContent) || 0;
      totalMessagesElement.textContent = current + 1;
    }
  }

  setupEventListeners() {
    // Toggle do painel CRM
    document.addEventListener('click', (e) => {
      if (e.target.id === 'crm-toggle') {
        this.toggleCRMPanel();
      }
      
      // Tabs do CRM
      if (e.target.classList.contains('crm-tab')) {
        this.switchTab(e.target.dataset.tab);
      }
      
      // Sugestões
      if (e.target.classList.contains('suggestion-item')) {
        this.insertSuggestion(e.target.dataset.text);
      }
      
      // Ações rápidas
      if (e.target.id === 'quick-reply') {
        this.showQuickReplyModal();
      }
      
      if (e.target.id === 'generate-suggestions') {
        this.generateAISuggestions();
      }
      
      if (e.target.id === 'add-tag-btn') {
        this.addTag();
      }
      
      if (e.target.id === 'save-notes') {
        this.saveNotes();
      }
    });
    
    // Enter no input de tags
    document.addEventListener('keypress', (e) => {
      if (e.target.id === 'tag-input' && e.key === 'Enter') {
        this.addTag();
      }
    });
  }

  toggleCRMPanel() {
    const panel = document.getElementById('crm-panel');
    if (panel) {
      panel.classList.toggle('collapsed');
    }
  }

  switchTab(tabName) {
    // Remove active de todas as tabs
    document.querySelectorAll('.crm-tab').forEach(tab => tab.classList.remove('active'));
    document.querySelectorAll('.crm-tab-panel').forEach(panel => panel.classList.remove('active'));
    
    // Ativa a tab selecionada
    document.querySelector(`[data-tab="${tabName}"]`).classList.add('active');
    document.getElementById(`${tabName}-panel`).classList.add('active');
  }

  insertSuggestion(text) {
    // Insere texto no campo de input do WhatsApp
    const inputElement = document.querySelector('[data-testid="conversation-compose-box-input"]');
    if (inputElement) {
      inputElement.textContent = text;
      
      // Dispara eventos para o WhatsApp reconhecer a mudança
      const inputEvent = new Event('input', { bubbles: true });
      inputElement.dispatchEvent(inputEvent);
      
      // Foca no input
      inputElement.focus();
    }
  }

  addTag() {
    const tagInput = document.getElementById('tag-input');
    const tagsList = document.getElementById('tags-list');
    
    if (tagInput && tagsList && tagInput.value.trim()) {
      const tagElement = document.createElement('span');
      tagElement.className = 'tag-item';
      tagElement.innerHTML = `
        ${tagInput.value.trim()}
        <button class="tag-remove" onclick="this.parentElement.remove()">×</button>
      `;
      
      tagsList.appendChild(tagElement);
      tagInput.value = '';
    }
  }

  saveNotes() {
    const notesTextarea = document.getElementById('notas-textarea');
    if (notesTextarea) {
      const notes = notesTextarea.value;
      
      // Salva no storage local
      chrome.storage.local.set({
        [`notes_${this.currentContact}`]: notes
      });
      
      // Feedback visual
      const saveBtn = document.getElementById('save-notes');
      const originalText = saveBtn.textContent;
      saveBtn.textContent = '✅ Salvo!';
      setTimeout(() => {
        saveBtn.textContent = originalText;
      }, 2000);
    }
  }

  generateAISuggestions() {
    // Simula geração de sugestões IA
    const suggestionsList = document.getElementById('suggestions-list');
    if (suggestionsList) {
      suggestionsList.innerHTML = `
        <div class="suggestion-item" data-text="Baseado na nossa conversa, acredito que posso ajudá-lo com isso.">
          🎯 Resposta contextual
        </div>
        <div class="suggestion-item" data-text="Vou encaminhar sua solicitação para o setor responsável.">
          📋 Encaminhar solicitação
        </div>
        <div class="suggestion-item" data-text="Posso agendar uma ligação para discutirmos melhor?">
          📞 Agendar ligação
        </div>
      `;
    }
  }

  showQuickReplyModal() {
    // Implementar modal de resposta rápida
    console.log('🚀 Abrindo modal de resposta rápida...');
  }
}

// Inicializa o CRM quando a página carrega
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    new WhatsAppCRM();
  });
} else {
  new WhatsAppCRM();
}