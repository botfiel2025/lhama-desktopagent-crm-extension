// Popup JavaScript para CRM WhatsApp Extension

class PopupDashboard {
  constructor() {
    this.metrics = {
      totalMessages: 0,
      activeContacts: 0,
      responseTime: 0,
      conversionRate: 0
    };
    
    this.activities = [];
    this.settings = {
      autoCapture: true,
      aiSuggestions: true,
      notifications: false,
      darkMode: false
    };
    
    this.init();
  }

  async init() {
    await this.loadStoredData();
    this.setupEventListeners();
    this.updateMetrics();
    this.updateActivityList();
    this.startRealTimeUpdates();
  }

  async loadStoredData() {
    try {
      const result = await chrome.storage.local.get([
        'crmMetrics',
        'crmActivities', 
        'crmSettings'
      ]);
      
      if (result.crmMetrics) {
        this.metrics = { ...this.metrics, ...result.crmMetrics };
      }
      
      if (result.crmActivities) {
        this.activities = result.crmActivities;
      }
      
      if (result.crmSettings) {
        this.settings = { ...this.settings, ...result.crmSettings };
      }
      
      this.updateSettingsUI();
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
    }
  }

  setupEventListeners() {
    // Toggle switches
    document.querySelectorAll('.toggle-switch').forEach(toggle => {
      toggle.addEventListener('click', (e) => {
        this.handleToggleSwitch(e.target.id);
      });
    });

    // Action buttons
    document.getElementById('export-data')?.addEventListener('click', () => {
      this.exportData();
    });

    document.getElementById('view-reports')?.addEventListener('click', () => {
      this.openReports();
    });

    document.getElementById('manage-templates')?.addEventListener('click', () => {
      this.manageTemplates();
    });

    document.getElementById('ai-settings')?.addEventListener('click', () => {
      this.openAISettings();
    });

    // Listen for messages from content script
    chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
      this.handleMessage(message, sender, sendResponse);
    });
  }

  handleToggleSwitch(toggleId) {
    const toggle = document.getElementById(toggleId);
    const isActive = toggle.classList.contains('active');
    
    if (isActive) {
      toggle.classList.remove('active');
      this.settings[this.camelCase(toggleId)] = false;
    } else {
      toggle.classList.add('active');
      this.settings[this.camelCase(toggleId)] = true;
    }
    
    this.saveSettings();
    this.notifyContentScript(toggleId, !isActive);
  }

  camelCase(str) {
    return str.replace(/-([a-z])/g, (g) => g[1].toUpperCase());
  }

  async saveSettings() {
    try {
      await chrome.storage.local.set({ crmSettings: this.settings });
    } catch (error) {
      console.error('Erro ao salvar configurações:', error);
    }
  }

  notifyContentScript(setting, value) {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (tabs[0] && tabs[0].url.includes('web.whatsapp.com')) {
        chrome.tabs.sendMessage(tabs[0].id, {
          type: 'SETTING_CHANGED',
          setting: setting,
          value: value
        });
      }
    });
  }

  updateSettingsUI() {
    Object.keys(this.settings).forEach(key => {
      const kebabCase = key.replace(/([A-Z])/g, '-$1').toLowerCase();
      const toggle = document.getElementById(kebabCase);
      if (toggle) {
        if (this.settings[key]) {
          toggle.classList.add('active');
        } else {
          toggle.classList.remove('active');
        }
      }
    });
  }

  updateMetrics() {
    // Atualizar valores das métricas na UI
    const elements = {
      'total-messages': this.metrics.totalMessages,
      'active-contacts': this.metrics.activeContacts,
      'response-time': `${this.metrics.responseTime}s`,
      'conversion-rate': `${this.metrics.conversionRate}%`
    };

    Object.keys(elements).forEach(id => {
      const element = document.getElementById(id);
      if (element) {
        this.animateValue(element, element.textContent, elements[id]);
      }
    });
  }

  animateValue(element, start, end) {
    const startNum = parseInt(start) || 0;
    const endNum = parseInt(end) || 0;
    const duration = 1000;
    const startTime = performance.now();

    const animate = (currentTime) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      
      const current = Math.floor(startNum + (endNum - startNum) * progress);
      
      if (element.id === 'response-time') {
        element.textContent = `${current}s`;
      } else if (element.id === 'conversion-rate') {
        element.textContent = `${current}%`;
      } else {
        element.textContent = current;
      }
      
      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };
    
    requestAnimationFrame(animate);
  }

  updateActivityList() {
    const activityList = document.getElementById('activity-list');
    if (!activityList) return;

    if (this.activities.length === 0) {
      activityList.innerHTML = `
        <div class="empty-state">
          <div class="empty-state-icon">📭</div>
          <p>Nenhuma atividade recente</p>
        </div>
      `;
      return;
    }

    const recentActivities = this.activities.slice(-5).reverse();
    
    activityList.innerHTML = recentActivities.map(activity => `
      <div class="activity-item">
        <div class="activity-icon">${this.getActivityIcon(activity.type)}</div>
        <div class="activity-content">
          <div class="activity-title">${activity.title}</div>
          <div class="activity-time">${this.formatTime(activity.timestamp)}</div>
        </div>
      </div>
    `).join('');
  }

  getActivityIcon(type) {
    const icons = {
      'message': '💬',
      'contact': '👤',
      'tag': '🏷️',
      'note': '📝',
      'ai': '🤖',
      'export': '📊',
      'template': '📋'
    };
    return icons[type] || '📌';
  }

  formatTime(timestamp) {
    const now = new Date();
    const time = new Date(timestamp);
    const diff = now - time;
    
    if (diff < 60000) {
      return 'Agora mesmo';
    } else if (diff < 3600000) {
      return `${Math.floor(diff / 60000)}min atrás`;
    } else if (diff < 86400000) {
      return `${Math.floor(diff / 3600000)}h atrás`;
    } else {
      return time.toLocaleDateString('pt-BR');
    }
  }

  addActivity(type, title) {
    const activity = {
      id: Date.now(),
      type: type,
      title: title,
      timestamp: Date.now()
    };
    
    this.activities.push(activity);
    
    // Manter apenas as últimas 50 atividades
    if (this.activities.length > 50) {
      this.activities = this.activities.slice(-50);
    }
    
    this.saveActivities();
    this.updateActivityList();
  }

  async saveActivities() {
    try {
      await chrome.storage.local.set({ crmActivities: this.activities });
    } catch (error) {
      console.error('Erro ao salvar atividades:', error);
    }
  }

  startRealTimeUpdates() {
    // Atualizar métricas a cada 30 segundos
    setInterval(() => {
      this.requestMetricsUpdate();
    }, 30000);

    // Atualizar status de conexão
    this.updateConnectionStatus();
    setInterval(() => {
      this.updateConnectionStatus();
    }, 5000);
  }

  requestMetricsUpdate() {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (tabs[0] && tabs[0].url.includes('web.whatsapp.com')) {
        chrome.tabs.sendMessage(tabs[0].id, {
          type: 'REQUEST_METRICS_UPDATE'
        });
      }
    });
  }

  updateConnectionStatus() {
    const indicator = document.getElementById('status-indicator');
    if (!indicator) return;

    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (tabs[0] && tabs[0].url.includes('web.whatsapp.com')) {
        indicator.style.background = '#27AE60';
        indicator.title = 'Conectado ao WhatsApp Web';
      } else {
        indicator.style.background = '#E74C3C';
        indicator.title = 'Desconectado - Abra o WhatsApp Web';
      }
    });
  }

  handleMessage(message, sender, sendResponse) {
    switch (message.type) {
      case 'METRICS_UPDATE':
        this.metrics = { ...this.metrics, ...message.data };
        this.updateMetrics();
        this.saveMetrics();
        break;
        
      case 'NEW_ACTIVITY':
        this.addActivity(message.activityType, message.title);
        break;
        
      case 'CONNECTION_STATUS':
        this.updateConnectionStatus();
        break;
    }
  }

  async saveMetrics() {
    try {
      await chrome.storage.local.set({ crmMetrics: this.metrics });
    } catch (error) {
      console.error('Erro ao salvar métricas:', error);
    }
  }

  // Action handlers
  exportData() {
    this.addActivity('export', 'Dados exportados');
    
    const data = {
      metrics: this.metrics,
      activities: this.activities,
      timestamp: new Date().toISOString()
    };
    
    const blob = new Blob([JSON.stringify(data, null, 2)], {
      type: 'application/json'
    });
    
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `crm-whatsapp-data-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    
    URL.revokeObjectURL(url);
  }

  openReports() {
    this.addActivity('template', 'Relatórios acessados');
    chrome.tabs.create({
      url: chrome.runtime.getURL('reports.html')
    });
  }

  manageTemplates() {
    this.addActivity('template', 'Templates gerenciados');
    chrome.tabs.create({
      url: chrome.runtime.getURL('templates.html')
    });
  }

  openAISettings() {
    this.addActivity('ai', 'Configurações IA acessadas');
    chrome.tabs.create({
      url: chrome.runtime.getURL('ai-settings.html')
    });
  }
}

// Inicializar dashboard quando o popup carregar
document.addEventListener('DOMContentLoaded', () => {
  new PopupDashboard();
});

// Simular dados para demonstração
setTimeout(() => {
  const dashboard = new PopupDashboard();
  dashboard.metrics = {
    totalMessages: 127,
    activeContacts: 23,
    responseTime: 45,
    conversionRate: 18
  };
  
  dashboard.activities = [
    {
      id: 1,
      type: 'message',
      title: 'Nova mensagem de João Silva',
      timestamp: Date.now() - 300000
    },
    {
      id: 2,
      type: 'contact',
      title: 'Contato Maria Santos adicionado',
      timestamp: Date.now() - 600000
    },
    {
      id: 3,
      type: 'ai',
      title: 'Sugestão IA aplicada',
      timestamp: Date.now() - 900000
    }
  ];
  
  dashboard.updateMetrics();
  dashboard.updateActivityList();
}, 1000);