// Background Script para CRM WhatsApp Extension
// Service Worker para Manifest V3

class CRMBackgroundService {
  constructor() {
    this.apiEndpoints = {
      tkinter: 'http://localhost:8000/api',
      openai: 'https://api.openai.com/v1'
    };
    
    this.cache = new Map();
    this.activeConnections = new Set();
    
    this.init();
  }

  init() {
    this.setupEventListeners();
    this.setupAlarms();
    this.initializeStorage();
  }

  setupEventListeners() {
    // Listener para mensagens dos content scripts e popup
    chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
      this.handleMessage(message, sender, sendResponse);
      return true; // Manter canal aberto para resposta assíncrona
    });

    // Listener para instalação/atualização da extensão
    chrome.runtime.onInstalled.addListener((details) => {
      this.handleInstallation(details);
    });

    // Listener para mudanças de aba
    chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
      this.handleTabUpdate(tabId, changeInfo, tab);
    });

    // Listener para conexões de longa duração
    chrome.runtime.onConnect.addListener((port) => {
      this.handleConnection(port);
    });

    // Listener para alarmes
    chrome.alarms.onAlarm.addListener((alarm) => {
      this.handleAlarm(alarm);
    });
  }

  async handleMessage(message, sender, sendResponse) {
    try {
      switch (message.type) {
        case 'GET_AI_SUGGESTION':
          const suggestion = await this.getAISuggestion(message.data);
          sendResponse({ success: true, data: suggestion });
          break;

        case 'SAVE_CONTACT_DATA':
          await this.saveContactData(message.data);
          sendResponse({ success: true });
          break;

        case 'GET_CONTACT_HISTORY':
          const history = await this.getContactHistory(message.contactId);
          sendResponse({ success: true, data: history });
          break;

        case 'SYNC_DATA':
          await this.syncDataWithServer(message.data);
          sendResponse({ success: true });
          break;

        case 'GET_TEMPLATES':
          const templates = await this.getMessageTemplates();
          sendResponse({ success: true, data: templates });
          break;

        case 'ANALYZE_MESSAGE':
          const analysis = await this.analyzeMessage(message.text);
          sendResponse({ success: true, data: analysis });
          break;

        case 'UPDATE_METRICS':
          await this.updateMetrics(message.data);
          sendResponse({ success: true });
          break;

        case 'EXPORT_DATA':
          const exportData = await this.exportAllData();
          sendResponse({ success: true, data: exportData });
          break;

        default:
          sendResponse({ success: false, error: 'Tipo de mensagem não reconhecido' });
      }
    } catch (error) {
      console.error('Erro no background script:', error);
      sendResponse({ success: false, error: error.message });
    }
  }

  async getAISuggestion(data) {
    const cacheKey = `ai_suggestion_${JSON.stringify(data).slice(0, 50)}`;
    
    // Verificar cache primeiro
    if (this.cache.has(cacheKey)) {
      return this.cache.get(cacheKey);
    }

    try {
      // Simular chamada para API de IA (OpenAI)
      const suggestion = await this.callOpenAI(data);
      
      // Armazenar no cache por 5 minutos
      this.cache.set(cacheKey, suggestion);
      setTimeout(() => this.cache.delete(cacheKey), 300000);
      
      return suggestion;
    } catch (error) {
      console.error('Erro ao obter sugestão IA:', error);
      return this.getFallbackSuggestion(data);
    }
  }

  async callOpenAI(data) {
    // Simular resposta da OpenAI para demonstração
    const suggestions = [
      {
        type: 'response',
        text: 'Olá! Obrigado por entrar em contato. Como posso ajudá-lo hoje?',
        confidence: 0.9
      },
      {
        type: 'followup',
        text: 'Gostaria de saber mais sobre nossos produtos?',
        confidence: 0.8
      },
      {
        type: 'closing',
        text: 'Fico à disposição para qualquer dúvida. Tenha um ótimo dia!',
        confidence: 0.85
      }
    ];

    // Simular delay da API
    await new Promise(resolve => setTimeout(resolve, 500));
    
    return suggestions[Math.floor(Math.random() * suggestions.length)];
  }

  getFallbackSuggestion(data) {
    const fallbackSuggestions = [
      {
        type: 'response',
        text: 'Obrigado pela mensagem! Vou analisar e responder em breve.',
        confidence: 0.7
      },
      {
        type: 'acknowledgment',
        text: 'Recebi sua mensagem. Em que posso ajudá-lo?',
        confidence: 0.7
      }
    ];
    
    return fallbackSuggestions[Math.floor(Math.random() * fallbackSuggestions.length)];
  }

  async saveContactData(contactData) {
    try {
      // Salvar no storage local
      const existingData = await chrome.storage.local.get('contacts') || {};
      const contacts = existingData.contacts || {};
      
      contacts[contactData.id] = {
        ...contacts[contactData.id],
        ...contactData,
        lastUpdated: Date.now()
      };
      
      await chrome.storage.local.set({ contacts });
      
      // Sincronizar com servidor se disponível
      this.syncContactWithServer(contactData);
      
      return true;
    } catch (error) {
      console.error('Erro ao salvar dados do contato:', error);
      throw error;
    }
  }

  async getContactHistory(contactId) {
    try {
      const result = await chrome.storage.local.get('contactHistory');
      const history = result.contactHistory || {};
      
      return history[contactId] || [];
    } catch (error) {
      console.error('Erro ao obter histórico do contato:', error);
      return [];
    }
  }

  async syncDataWithServer(data) {
    try {
      // Simular sincronização com servidor Tkinter
      const response = await fetch(`${this.apiEndpoints.tkinter}/sync`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
      });
      
      if (!response.ok) {
        throw new Error(`Erro na sincronização: ${response.status}`);
      }
      
      const result = await response.json();
      return result;
    } catch (error) {
      console.error('Erro na sincronização:', error);
      // Armazenar para sincronização posterior
      this.queueForLaterSync(data);
      throw error;
    }
  }

  async queueForLaterSync(data) {
    const result = await chrome.storage.local.get('syncQueue');
    const queue = result.syncQueue || [];
    
    queue.push({
      data,
      timestamp: Date.now(),
      retries: 0
    });
    
    await chrome.storage.local.set({ syncQueue: queue });
  }

  async getMessageTemplates() {
    try {
      const result = await chrome.storage.local.get('messageTemplates');
      
      if (result.messageTemplates) {
        return result.messageTemplates;
      }
      
      // Templates padrão
      const defaultTemplates = [
        {
          id: 'welcome',
          name: 'Boas-vindas',
          text: 'Olá! Seja bem-vindo(a). Como posso ajudá-lo(a) hoje?',
          category: 'greeting'
        },
        {
          id: 'followup',
          name: 'Follow-up',
          text: 'Olá! Gostaria de saber se ainda tem interesse em nossos produtos/serviços.',
          category: 'followup'
        },
        {
          id: 'thanks',
          name: 'Agradecimento',
          text: 'Muito obrigado(a) pelo contato! Foi um prazer atendê-lo(a).',
          category: 'closing'
        }
      ];
      
      await chrome.storage.local.set({ messageTemplates: defaultTemplates });
      return defaultTemplates;
    } catch (error) {
      console.error('Erro ao obter templates:', error);
      return [];
    }
  }

  async analyzeMessage(text) {
    try {
      // Análise simples de sentimento e intenção
      const analysis = {
        sentiment: this.analyzeSentiment(text),
        intent: this.analyzeIntent(text),
        keywords: this.extractKeywords(text),
        urgency: this.analyzeUrgency(text),
        language: this.detectLanguage(text)
      };
      
      return analysis;
    } catch (error) {
      console.error('Erro na análise da mensagem:', error);
      return null;
    }
  }

  analyzeSentiment(text) {
    const positiveWords = ['obrigado', 'ótimo', 'excelente', 'bom', 'gostei', 'perfeito'];
    const negativeWords = ['ruim', 'péssimo', 'problema', 'erro', 'reclamação', 'insatisfeito'];
    
    const lowerText = text.toLowerCase();
    let score = 0;
    
    positiveWords.forEach(word => {
      if (lowerText.includes(word)) score += 1;
    });
    
    negativeWords.forEach(word => {
      if (lowerText.includes(word)) score -= 1;
    });
    
    if (score > 0) return 'positive';
    if (score < 0) return 'negative';
    return 'neutral';
  }

  analyzeIntent(text) {
    const intents = {
      'question': ['?', 'como', 'quando', 'onde', 'por que', 'qual'],
      'request': ['preciso', 'quero', 'gostaria', 'pode', 'consegue'],
      'complaint': ['problema', 'erro', 'não funciona', 'reclamação'],
      'compliment': ['obrigado', 'parabéns', 'excelente', 'ótimo']
    };
    
    const lowerText = text.toLowerCase();
    
    for (const [intent, keywords] of Object.entries(intents)) {
      if (keywords.some(keyword => lowerText.includes(keyword))) {
        return intent;
      }
    }
    
    return 'general';
  }

  extractKeywords(text) {
    const stopWords = ['o', 'a', 'de', 'para', 'com', 'em', 'um', 'uma', 'e', 'ou'];
    const words = text.toLowerCase().split(/\s+/);
    
    return words
      .filter(word => word.length > 3 && !stopWords.includes(word))
      .slice(0, 5);
  }

  analyzeUrgency(text) {
    const urgentWords = ['urgente', 'emergência', 'rápido', 'agora', 'imediato'];
    const lowerText = text.toLowerCase();
    
    return urgentWords.some(word => lowerText.includes(word)) ? 'high' : 'normal';
  }

  detectLanguage(text) {
    // Detecção simples baseada em palavras comuns
    const portugueseWords = ['que', 'com', 'para', 'uma', 'não', 'mais'];
    const englishWords = ['the', 'and', 'for', 'are', 'but', 'not'];
    
    const lowerText = text.toLowerCase();
    
    const ptCount = portugueseWords.filter(word => lowerText.includes(word)).length;
    const enCount = englishWords.filter(word => lowerText.includes(word)).length;
    
    return ptCount > enCount ? 'pt' : 'en';
  }

  async updateMetrics(metricsData) {
    try {
      const result = await chrome.storage.local.get('crmMetrics');
      const currentMetrics = result.crmMetrics || {};
      
      const updatedMetrics = {
        ...currentMetrics,
        ...metricsData,
        lastUpdated: Date.now()
      };
      
      await chrome.storage.local.set({ crmMetrics: updatedMetrics });
      
      // Notificar popup se estiver aberto
      this.notifyPopup('METRICS_UPDATE', updatedMetrics);
      
      return updatedMetrics;
    } catch (error) {
      console.error('Erro ao atualizar métricas:', error);
      throw error;
    }
  }

  async exportAllData() {
    try {
      const data = await chrome.storage.local.get(null);
      
      const exportData = {
        contacts: data.contacts || {},
        metrics: data.crmMetrics || {},
        activities: data.crmActivities || [],
        templates: data.messageTemplates || [],
        settings: data.crmSettings || {},
        exportDate: new Date().toISOString()
      };
      
      return exportData;
    } catch (error) {
      console.error('Erro ao exportar dados:', error);
      throw error;
    }
  }

  notifyPopup(type, data) {
    chrome.runtime.sendMessage({
      type: type,
      data: data
    }).catch(() => {
      // Popup pode não estar aberto
    });
  }

  handleInstallation(details) {
    if (details.reason === 'install') {
      // Primeira instalação
      this.initializeDefaultData();
      chrome.tabs.create({
        url: chrome.runtime.getURL('welcome.html')
      });
    } else if (details.reason === 'update') {
      // Atualização
      this.migrateData(details.previousVersion);
    }
  }

  async initializeDefaultData() {
    const defaultData = {
      crmSettings: {
        autoCapture: true,
        aiSuggestions: true,
        notifications: false,
        darkMode: false
      },
      crmMetrics: {
        totalMessages: 0,
        activeContacts: 0,
        responseTime: 0,
        conversionRate: 0
      },
      crmActivities: [],
      contacts: {},
      messageTemplates: await this.getMessageTemplates()
    };
    
    await chrome.storage.local.set(defaultData);
  }

  handleTabUpdate(tabId, changeInfo, tab) {
    if (changeInfo.status === 'complete' && tab.url?.includes('web.whatsapp.com')) {
      // WhatsApp Web carregado, injetar content script se necessário
      chrome.tabs.sendMessage(tabId, {
        type: 'TAB_UPDATED',
        url: tab.url
      }).catch(() => {
        // Content script pode não estar carregado ainda
      });
    }
  }

  handleConnection(port) {
    this.activeConnections.add(port);
    
    port.onDisconnect.addListener(() => {
      this.activeConnections.delete(port);
    });
    
    port.onMessage.addListener((message) => {
      this.handlePortMessage(message, port);
    });
  }

  handlePortMessage(message, port) {
    // Lidar com mensagens de conexão de longa duração
    switch (message.type) {
      case 'KEEP_ALIVE':
        port.postMessage({ type: 'ALIVE' });
        break;
        
      case 'REAL_TIME_UPDATE':
        this.broadcastToAllPorts(message, port);
        break;
    }
  }

  broadcastToAllPorts(message, excludePort) {
    this.activeConnections.forEach(port => {
      if (port !== excludePort) {
        try {
          port.postMessage(message);
        } catch (error) {
          // Porta desconectada
          this.activeConnections.delete(port);
        }
      }
    });
  }

  setupAlarms() {
    // Alarme para limpeza de cache
    chrome.alarms.create('cleanCache', { periodInMinutes: 30 });
    
    // Alarme para sincronização periódica
    chrome.alarms.create('syncData', { periodInMinutes: 15 });
    
    // Alarme para backup de dados
    chrome.alarms.create('backupData', { periodInMinutes: 60 });
  }

  handleAlarm(alarm) {
    switch (alarm.name) {
      case 'cleanCache':
        this.cleanCache();
        break;
        
      case 'syncData':
        this.performPeriodicSync();
        break;
        
      case 'backupData':
        this.performDataBackup();
        break;
    }
  }

  cleanCache() {
    const now = Date.now();
    for (const [key, value] of this.cache.entries()) {
      if (now - value.timestamp > 300000) { // 5 minutos
        this.cache.delete(key);
      }
    }
  }

  async performPeriodicSync() {
    try {
      const result = await chrome.storage.local.get('syncQueue');
      const queue = result.syncQueue || [];
      
      if (queue.length > 0) {
        // Tentar sincronizar itens pendentes
        const item = queue[0];
        await this.syncDataWithServer(item.data);
        
        // Remover item da fila se sincronizado com sucesso
        queue.shift();
        await chrome.storage.local.set({ syncQueue: queue });
      }
    } catch (error) {
      console.error('Erro na sincronização periódica:', error);
    }
  }

  async performDataBackup() {
    try {
      const data = await this.exportAllData();
      
      // Manter apenas os últimos 3 backups
      const result = await chrome.storage.local.get('backups');
      const backups = result.backups || [];
      
      backups.push({
        timestamp: Date.now(),
        data: data
      });
      
      if (backups.length > 3) {
        backups.shift();
      }
      
      await chrome.storage.local.set({ backups });
    } catch (error) {
      console.error('Erro no backup de dados:', error);
    }
  }

  async syncContactWithServer(contactData) {
    // Implementação futura para sincronização com servidor
    console.log('Sincronizando contato:', contactData.id);
  }

  async initializeStorage() {
    // Verificar se dados iniciais existem
    const result = await chrome.storage.local.get('crmSettings');
    if (!result.crmSettings) {
      await this.initializeDefaultData();
    }
  }

  async migrateData(previousVersion) {
    // Implementar migração de dados para versões futuras
    console.log('Migrando dados da versão:', previousVersion);
  }
}

// Inicializar o serviço de background
const crmBackgroundService = new CRMBackgroundService();

// Manter o service worker ativo
setInterval(() => {
  console.log('CRM Background Service ativo');
}, 25000);