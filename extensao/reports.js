// Reports Manager JavaScript
class ReportsManager {
  constructor() {
    this.currentPeriod = 'week';
    this.currentType = 'all';
    this.data = {
      messages: [],
      contacts: [],
      templates: [],
      activities: []
    };
    this.init();
  }

  async init() {
    await this.loadData();
    this.setupEventListeners();
    this.renderReports();
  }

  async loadData() {
    try {
      const result = await chrome.storage.local.get([
        'messages', 'contacts', 'templates', 'activities', 'metrics'
      ]);
      
      this.data = {
        messages: result.messages || this.generateMockMessages(),
        contacts: result.contacts || this.generateMockContacts(),
        templates: result.templates || [],
        activities: result.activities || this.generateMockActivities(),
        metrics: result.metrics || this.generateMockMetrics()
      };
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
      this.data = {
        messages: this.generateMockMessages(),
        contacts: this.generateMockContacts(),
        templates: [],
        activities: this.generateMockActivities(),
        metrics: this.generateMockMetrics()
      };
    }
  }

  generateMockMessages() {
    const messages = [];
    const now = new Date();
    
    for (let i = 0; i < 100; i++) {
      const date = new Date(now.getTime() - Math.random() * 7 * 24 * 60 * 60 * 1000);
      messages.push({
        id: `msg-${i}`,
        contactId: `contact-${Math.floor(Math.random() * 20)}`,
        text: `Mensagem de exemplo ${i}`,
        timestamp: date.toISOString(),
        type: Math.random() > 0.5 ? 'sent' : 'received',
        responseTime: Math.random() * 300 // segundos
      });
    }
    
    return messages.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
  }

  generateMockContacts() {
    const names = [
      'João Silva', 'Maria Santos', 'Pedro Oliveira', 'Ana Costa',
      'Carlos Ferreira', 'Lucia Almeida', 'Roberto Lima', 'Fernanda Rocha',
      'Marcos Pereira', 'Juliana Martins', 'Rafael Souza', 'Camila Dias',
      'Bruno Carvalho', 'Patrícia Gomes', 'Diego Ribeiro', 'Vanessa Moura',
      'Thiago Barbosa', 'Renata Campos', 'Gustavo Nunes', 'Priscila Torres'
    ];
    
    return names.map((name, index) => ({
      id: `contact-${index}`,
      name,
      phone: `+55 11 9${String(Math.floor(Math.random() * 100000000)).padStart(8, '0')}`,
      messageCount: Math.floor(Math.random() * 50) + 1,
      lastContact: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString(),
      status: Math.random() > 0.3 ? 'active' : 'inactive'
    }));
  }

  generateMockActivities() {
    const activities = [];
    const now = new Date();
    const types = [
      'Nova mensagem recebida',
      'Mensagem enviada',
      'Contato adicionado',
      'Template usado',
      'Nota adicionada',
      'Tag aplicada'
    ];
    
    for (let i = 0; i < 20; i++) {
      const date = new Date(now.getTime() - Math.random() * 24 * 60 * 60 * 1000);
      activities.push({
        id: `activity-${i}`,
        type: types[Math.floor(Math.random() * types.length)],
        description: `Atividade de exemplo ${i}`,
        timestamp: date.toISOString(),
        contactName: `Contato ${Math.floor(Math.random() * 20) + 1}`
      });
    }
    
    return activities.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
  }

  generateMockMetrics() {
    return {
      totalMessages: 1247,
      activeContacts: 89,
      avgResponseTime: 154, // segundos
      conversionRate: 24.8,
      previousPeriod: {
        totalMessages: 1110,
        activeContacts: 82,
        avgResponseTime: 139,
        conversionRate: 21.6
      }
    };
  }

  setupEventListeners() {
    // Filtro de período
    const periodFilter = document.getElementById('period-filter');
    periodFilter.addEventListener('change', (e) => {
      this.currentPeriod = e.target.value;
      this.toggleCustomDateRange();
      this.renderReports();
    });

    // Filtro de tipo
    const typeFilter = document.getElementById('type-filter');
    typeFilter.addEventListener('change', (e) => {
      this.currentType = e.target.value;
      this.renderReports();
    });

    // Datas personalizadas
    const startDate = document.getElementById('start-date');
    const endDate = document.getElementById('end-date');
    
    [startDate, endDate].forEach(input => {
      input.addEventListener('change', () => {
        if (this.currentPeriod === 'custom') {
          this.renderReports();
        }
      });
    });
  }

  toggleCustomDateRange() {
    const customRange = document.getElementById('custom-date-range');
    customRange.style.display = this.currentPeriod === 'custom' ? 'block' : 'none';
  }

  getDateRange() {
    const now = new Date();
    let startDate, endDate = now;

    switch (this.currentPeriod) {
      case 'today':
        startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        break;
      case 'week':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case 'month':
        startDate = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate());
        break;
      case 'quarter':
        startDate = new Date(now.getFullYear(), now.getMonth() - 3, now.getDate());
        break;
      case 'year':
        startDate = new Date(now.getFullYear() - 1, now.getMonth(), now.getDate());
        break;
      case 'custom':
        const startInput = document.getElementById('start-date').value;
        const endInput = document.getElementById('end-date').value;
        startDate = startInput ? new Date(startInput) : new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        endDate = endInput ? new Date(endInput) : now;
        break;
      default:
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    }

    return { startDate, endDate };
  }

  filterDataByPeriod(data, dateField = 'timestamp') {
    const { startDate, endDate } = this.getDateRange();
    return data.filter(item => {
      const itemDate = new Date(item[dateField]);
      return itemDate >= startDate && itemDate <= endDate;
    });
  }

  renderReports() {
    this.renderMetrics();
    this.renderTopContacts();
    this.renderTopTemplates();
    this.renderPeakHours();
    this.renderMessageTypes();
    this.renderActivityTimeline();
  }

  renderMetrics() {
    const filteredMessages = this.filterDataByPeriod(this.data.messages);
    const filteredContacts = this.filterDataByPeriod(this.data.contacts, 'lastContact');
    
    // Total de mensagens
    const totalMessages = filteredMessages.length;
    document.getElementById('total-messages').textContent = this.formatNumber(totalMessages);
    
    // Contatos ativos
    const activeContacts = filteredContacts.filter(c => c.status === 'active').length;
    document.getElementById('active-contacts').textContent = this.formatNumber(activeContacts);
    
    // Tempo médio de resposta
    const responseTimes = filteredMessages
      .filter(m => m.type === 'sent' && m.responseTime)
      .map(m => m.responseTime);
    
    const avgResponseTime = responseTimes.length > 0 
      ? responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length 
      : 0;
    
    document.getElementById('avg-response-time').textContent = this.formatTime(avgResponseTime);
    
    // Taxa de conversão (simulada)
    const conversionRate = Math.random() * 30 + 15; // 15-45%
    document.getElementById('conversion-rate').textContent = `${conversionRate.toFixed(1)}%`;
  }

  renderTopContacts() {
    const filteredMessages = this.filterDataByPeriod(this.data.messages);
    const contactMessageCount = {};
    
    filteredMessages.forEach(msg => {
      contactMessageCount[msg.contactId] = (contactMessageCount[msg.contactId] || 0) + 1;
    });
    
    const topContacts = Object.entries(contactMessageCount)
      .map(([contactId, count]) => {
        const contact = this.data.contacts.find(c => c.id === contactId);
        return contact ? { ...contact, messageCount: count } : null;
      })
      .filter(Boolean)
      .sort((a, b) => b.messageCount - a.messageCount)
      .slice(0, 5);
    
    const container = document.getElementById('top-contacts-list');
    container.innerHTML = topContacts.map(contact => `
      <div class="contact-item">
        <div class="contact-info">
          <div class="contact-avatar">
            ${contact.name.charAt(0).toUpperCase()}
          </div>
          <div class="contact-details">
            <div class="contact-name">${contact.name}</div>
            <div class="contact-phone">${contact.phone}</div>
          </div>
        </div>
        <div class="contact-stats">
          <div class="stat-item">
            💬 ${contact.messageCount} mensagens
          </div>
          <div class="stat-item">
            🕒 ${this.formatDate(contact.lastContact)}
          </div>
        </div>
      </div>
    `).join('');
  }

  renderTopTemplates() {
    const templates = [
      { name: 'Boas-vindas Padrão', usage: 45 },
      { name: 'Follow-up Geral', usage: 32 },
      { name: 'Suporte Técnico', usage: 28 },
      { name: 'Fechamento Padrão', usage: 21 },
      { name: 'Boas-vindas Empresa', usage: 18 }
    ];
    
    const container = document.getElementById('top-templates');
    container.innerHTML = templates.map(template => `
      <li class="summary-item">
        <span class="summary-label">${template.name}</span>
        <span class="summary-value">${template.usage} usos</span>
      </li>
    `).join('');
  }

  renderPeakHours() {
    const hours = [
      { hour: '09:00 - 10:00', messages: 89 },
      { hour: '14:00 - 15:00', messages: 76 },
      { hour: '10:00 - 11:00', messages: 65 },
      { hour: '16:00 - 17:00', messages: 58 },
      { hour: '11:00 - 12:00', messages: 52 }
    ];
    
    const container = document.getElementById('peak-hours');
    container.innerHTML = hours.map(hour => `
      <li class="summary-item">
        <span class="summary-label">${hour.hour}</span>
        <span class="summary-value">${hour.messages} msgs</span>
      </li>
    `).join('');
  }

  renderMessageTypes() {
    const types = [
      { type: 'Texto', count: 892, percentage: 71.5 },
      { type: 'Imagem', count: 234, percentage: 18.8 },
      { type: 'Áudio', count: 89, percentage: 7.1 },
      { type: 'Documento', count: 32, percentage: 2.6 }
    ];
    
    const container = document.getElementById('message-types');
    container.innerHTML = types.map(type => `
      <li class="summary-item">
        <span class="summary-label">${type.type}</span>
        <span class="summary-value">${type.count} (${type.percentage}%)</span>
      </li>
    `).join('');
  }

  renderActivityTimeline() {
    const filteredActivities = this.filterDataByPeriod(this.data.activities).slice(0, 10);
    
    const container = document.getElementById('activity-timeline');
    container.innerHTML = filteredActivities.map(activity => `
      <div class="timeline-item">
        <div class="timeline-time">${this.formatDateTime(activity.timestamp)}</div>
        <div class="timeline-content">
          <strong>${activity.type}</strong><br>
          ${activity.description}
          ${activity.contactName ? `<br><small>Contato: ${activity.contactName}</small>` : ''}
        </div>
      </div>
    `).join('');
  }

  formatNumber(num) {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + 'M';
    } else if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'K';
    }
    return num.toString();
  }

  formatTime(seconds) {
    if (seconds < 60) {
      return `${Math.round(seconds)}s`;
    } else if (seconds < 3600) {
      const minutes = Math.floor(seconds / 60);
      const remainingSeconds = Math.round(seconds % 60);
      return `${minutes}m ${remainingSeconds}s`;
    } else {
      const hours = Math.floor(seconds / 3600);
      const minutes = Math.floor((seconds % 3600) / 60);
      return `${hours}h ${minutes}m`;
    }
  }

  formatDate(dateString) {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 1) return 'Hoje';
    if (diffDays === 2) return 'Ontem';
    if (diffDays <= 7) return `${diffDays} dias atrás`;
    
    return date.toLocaleDateString('pt-BR');
  }

  formatDateTime(dateString) {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffMinutes = Math.floor(diffTime / (1000 * 60));
    const diffHours = Math.floor(diffMinutes / 60);
    const diffDays = Math.floor(diffHours / 24);
    
    if (diffMinutes < 60) {
      return `${diffMinutes} min atrás`;
    } else if (diffHours < 24) {
      return `${diffHours}h atrás`;
    } else if (diffDays === 1) {
      return 'Ontem às ' + date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
    } else if (diffDays <= 7) {
      return `${diffDays} dias atrás`;
    }
    
    return date.toLocaleDateString('pt-BR') + ' às ' + 
           date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
  }

  async exportReport() {
    try {
      const { startDate, endDate } = this.getDateRange();
      const filteredMessages = this.filterDataByPeriod(this.data.messages);
      const filteredContacts = this.filterDataByPeriod(this.data.contacts, 'lastContact');
      
      const reportData = {
        period: {
          start: startDate.toISOString(),
          end: endDate.toISOString(),
          type: this.currentPeriod
        },
        summary: {
          totalMessages: filteredMessages.length,
          activeContacts: filteredContacts.filter(c => c.status === 'active').length,
          avgResponseTime: this.calculateAvgResponseTime(filteredMessages),
          conversionRate: Math.random() * 30 + 15
        },
        messages: filteredMessages,
        contacts: filteredContacts,
        generatedAt: new Date().toISOString()
      };
      
      const blob = new Blob([JSON.stringify(reportData, null, 2)], {
        type: 'application/json'
      });
      
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `crm-report-${this.currentPeriod}-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      this.showNotification('Relatório exportado com sucesso!');
    } catch (error) {
      console.error('Erro ao exportar relatório:', error);
      this.showNotification('Erro ao exportar relatório', 'error');
    }
  }

  calculateAvgResponseTime(messages) {
    const responseTimes = messages
      .filter(m => m.type === 'sent' && m.responseTime)
      .map(m => m.responseTime);
    
    return responseTimes.length > 0 
      ? responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length 
      : 0;
  }

  showNotification(message, type = 'success') {
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      background: ${type === 'success' ? '#25D366' : '#e74c3c'};
      color: white;
      padding: 16px 24px;
      border-radius: 8px;
      box-shadow: 0 4px 16px rgba(0, 0, 0, 0.2);
      z-index: 10000;
      font-size: 14px;
      font-weight: 500;
      transform: translateX(100%);
      transition: transform 0.3s ease;
    `;
    notification.textContent = message;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
      notification.style.transform = 'translateX(0)';
    }, 100);
    
    setTimeout(() => {
      notification.style.transform = 'translateX(100%)';
      setTimeout(() => {
        document.body.removeChild(notification);
      }, 300);
    }, 3000);
  }
}

// Funções globais
let reportsManager;

function exportReport() {
  reportsManager.exportReport();
}

// Inicializar quando a página carregar
document.addEventListener('DOMContentLoaded', () => {
  reportsManager = new ReportsManager();
});