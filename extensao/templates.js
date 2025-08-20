// Templates Manager JavaScript
class TemplatesManager {
  constructor() {
    this.templates = [];
    this.currentFilter = 'all';
    this.editingTemplate = null;
    this.init();
  }

  async init() {
    await this.loadTemplates();
    this.setupEventListeners();
    this.renderTemplates();
  }

  async loadTemplates() {
    try {
      const result = await chrome.storage.local.get(['templates']);
      this.templates = result.templates || this.getDefaultTemplates();
      
      // Se não há templates salvos, salva os padrões
      if (!result.templates) {
        await this.saveTemplates();
      }
    } catch (error) {
      console.error('Erro ao carregar templates:', error);
      this.templates = this.getDefaultTemplates();
    }
  }

  getDefaultTemplates() {
    return [
      {
        id: 'greeting-1',
        name: 'Boas-vindas Padrão',
        category: 'greeting',
        text: 'Olá {{nome}}! 👋\n\nSeja bem-vindo(a)! Como posso ajudá-lo(a) hoje?',
        usageCount: 0,
        lastUsed: null,
        createdAt: new Date().toISOString()
      },
      {
        id: 'greeting-2',
        name: 'Boas-vindas Empresa',
        category: 'greeting',
        text: 'Olá {{nome}}! 👋\n\nObrigado por entrar em contato com a {{empresa}}. Estou aqui para ajudá-lo(a). Em que posso ser útil?',
        usageCount: 0,
        lastUsed: null,
        createdAt: new Date().toISOString()
      },
      {
        id: 'followup-1',
        name: 'Follow-up Geral',
        category: 'followup',
        text: 'Oi {{nome}}! 😊\n\nEspero que esteja tudo bem! Gostaria de saber se ainda tem interesse em nossos serviços.\n\nFico no aguardo do seu retorno!',
        usageCount: 0,
        lastUsed: null,
        createdAt: new Date().toISOString()
      },
      {
        id: 'closing-1',
        name: 'Fechamento Padrão',
        category: 'closing',
        text: 'Muito obrigado pelo seu tempo, {{nome}}! 🙏\n\nFoi um prazer conversar com você. Qualquer dúvida, estarei sempre à disposição.\n\nTenha um ótimo dia!',
        usageCount: 0,
        lastUsed: null,
        createdAt: new Date().toISOString()
      },
      {
        id: 'support-1',
        name: 'Suporte Técnico',
        category: 'support',
        text: 'Olá {{nome}}! 🔧\n\nRecebi sua solicitação de suporte. Vou analisar o problema e retornar com uma solução o mais breve possível.\n\nObrigado pela paciência!',
        usageCount: 0,
        lastUsed: null,
        createdAt: new Date().toISOString()
      }
    ];
  }

  setupEventListeners() {
    // Busca
    const searchInput = document.getElementById('search-input');
    searchInput.addEventListener('input', (e) => {
      this.filterTemplates(e.target.value);
    });

    // Filtros de categoria
    const filterButtons = document.querySelectorAll('.filter-btn');
    filterButtons.forEach(btn => {
      btn.addEventListener('click', (e) => {
        filterButtons.forEach(b => b.classList.remove('active'));
        e.target.classList.add('active');
        this.currentFilter = e.target.dataset.category;
        this.renderTemplates();
      });
    });

    // Form de template
    const form = document.getElementById('template-form');
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      this.saveTemplate();
    });
  }

  filterTemplates(searchTerm) {
    const filtered = this.templates.filter(template => {
      const matchesSearch = !searchTerm || 
        template.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        template.text.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesCategory = this.currentFilter === 'all' || 
        template.category === this.currentFilter;
      
      return matchesSearch && matchesCategory;
    });
    
    this.renderTemplates(filtered);
  }

  renderTemplates(templatesArray = null) {
    const grid = document.getElementById('templates-grid');
    const templates = templatesArray || this.templates.filter(t => 
      this.currentFilter === 'all' || t.category === this.currentFilter
    );

    if (templates.length === 0) {
      grid.innerHTML = `
        <div class="empty-state">
          <div class="empty-state-icon">📝</div>
          <h3>Nenhum template encontrado</h3>
          <p>Crie seu primeiro template para começar a usar mensagens pré-definidas.</p>
          <button class="add-template-btn" onclick="openTemplateModal()">
            ➕ Criar Primeiro Template
          </button>
        </div>
      `;
      return;
    }

    grid.innerHTML = templates.map(template => `
      <div class="template-card" data-id="${template.id}">
        <div class="template-header">
          <div>
            <div class="template-title">${template.name}</div>
            <div class="template-category">${this.getCategoryLabel(template.category)}</div>
          </div>
          <div class="template-actions">
            <button class="action-btn copy-btn" onclick="copyTemplate('${template.id}')" title="Copiar">
              📋
            </button>
            <button class="action-btn edit-btn" onclick="editTemplate('${template.id}')" title="Editar">
              ✏️
            </button>
            <button class="action-btn delete-btn" onclick="deleteTemplate('${template.id}')" title="Excluir">
              🗑️
            </button>
          </div>
        </div>
        <div class="template-content">
          <div class="template-text">${this.formatTemplateText(template.text)}</div>
          <div class="template-stats">
            <div class="usage-count">
              📊 Usado ${template.usageCount} vezes
            </div>
            <div class="last-used">
              🕒 ${template.lastUsed ? this.formatDate(template.lastUsed) : 'Nunca usado'}
            </div>
          </div>
        </div>
      </div>
    `).join('');
  }

  getCategoryLabel(category) {
    const labels = {
      greeting: 'Saudações',
      followup: 'Follow-up',
      closing: 'Fechamento',
      support: 'Suporte',
      sales: 'Vendas',
      other: 'Outros'
    };
    return labels[category] || category;
  }

  formatTemplateText(text) {
    return text
      .replace(/\n/g, '<br>')
      .replace(/{{(\w+)}}/g, '<span class="variable-tag">{{$1}}</span>');
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

  async saveTemplates() {
    try {
      await chrome.storage.local.set({ templates: this.templates });
    } catch (error) {
      console.error('Erro ao salvar templates:', error);
    }
  }

  generateId() {
    return 'template-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9);
  }

  async saveTemplate() {
    const name = document.getElementById('template-name').value.trim();
    const category = document.getElementById('template-category').value;
    const text = document.getElementById('template-text').value.trim();

    if (!name || !category || !text) {
      alert('Por favor, preencha todos os campos obrigatórios.');
      return;
    }

    if (this.editingTemplate) {
      // Editando template existente
      const index = this.templates.findIndex(t => t.id === this.editingTemplate.id);
      if (index !== -1) {
        this.templates[index] = {
          ...this.editingTemplate,
          name,
          category,
          text,
          updatedAt: new Date().toISOString()
        };
      }
    } else {
      // Criando novo template
      const newTemplate = {
        id: this.generateId(),
        name,
        category,
        text,
        usageCount: 0,
        lastUsed: null,
        createdAt: new Date().toISOString()
      };
      this.templates.push(newTemplate);
    }

    await this.saveTemplates();
    this.renderTemplates();
    this.closeTemplateModal();
    
    // Mostrar feedback
    this.showNotification(
      this.editingTemplate ? 'Template atualizado com sucesso!' : 'Template criado com sucesso!'
    );
  }

  editTemplate(templateId) {
    const template = this.templates.find(t => t.id === templateId);
    if (!template) return;

    this.editingTemplate = template;
    
    document.getElementById('modal-title').textContent = 'Editar Template';
    document.getElementById('template-name').value = template.name;
    document.getElementById('template-category').value = template.category;
    document.getElementById('template-text').value = template.text;
    
    this.openTemplateModal();
  }

  async deleteTemplate(templateId) {
    const template = this.templates.find(t => t.id === templateId);
    if (!template) return;

    if (!confirm(`Tem certeza que deseja excluir o template "${template.name}"?`)) {
      return;
    }

    this.templates = this.templates.filter(t => t.id !== templateId);
    await this.saveTemplates();
    this.renderTemplates();
    
    this.showNotification('Template excluído com sucesso!');
  }

  async copyTemplate(templateId) {
    const template = this.templates.find(t => t.id === templateId);
    if (!template) return;

    try {
      await navigator.clipboard.writeText(template.text);
      this.showNotification('Template copiado para a área de transferência!');
      
      // Atualizar estatísticas de uso
      template.usageCount++;
      template.lastUsed = new Date().toISOString();
      await this.saveTemplates();
      this.renderTemplates();
    } catch (error) {
      console.error('Erro ao copiar template:', error);
      this.showNotification('Erro ao copiar template', 'error');
    }
  }

  openTemplateModal() {
    document.getElementById('template-modal').classList.add('active');
    document.getElementById('template-name').focus();
  }

  closeTemplateModal() {
    document.getElementById('template-modal').classList.remove('active');
    document.getElementById('template-form').reset();
    document.getElementById('modal-title').textContent = 'Novo Template';
    this.editingTemplate = null;
  }

  showNotification(message, type = 'success') {
    // Criar elemento de notificação
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
    
    // Animar entrada
    setTimeout(() => {
      notification.style.transform = 'translateX(0)';
    }, 100);
    
    // Remover após 3 segundos
    setTimeout(() => {
      notification.style.transform = 'translateX(100%)';
      setTimeout(() => {
        document.body.removeChild(notification);
      }, 300);
    }, 3000);
  }
}

// Funções globais para os event handlers
let templatesManager;

function openTemplateModal() {
  templatesManager.openTemplateModal();
}

function closeTemplateModal() {
  templatesManager.closeTemplateModal();
}

function saveTemplate() {
  templatesManager.saveTemplate();
}

function editTemplate(templateId) {
  templatesManager.editTemplate(templateId);
}

function deleteTemplate(templateId) {
  templatesManager.deleteTemplate(templateId);
}

function copyTemplate(templateId) {
  templatesManager.copyTemplate(templateId);
}

// Inicializar quando a página carregar
document.addEventListener('DOMContentLoaded', () => {
  templatesManager = new TemplatesManager();
});

// Fechar modal ao clicar fora
document.addEventListener('click', (e) => {
  const modal = document.getElementById('template-modal');
  if (e.target === modal) {
    closeTemplateModal();
  }
});

// Fechar modal com ESC
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') {
    closeTemplateModal();
  }
});