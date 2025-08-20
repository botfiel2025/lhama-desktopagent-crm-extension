# Especificações Técnicas - Aplicativo Desktop Tkinter

## 🖥️ Visão Geral do Aplicativo

O aplicativo desktop Tkinter funciona como o núcleo central do sistema CRM, atuando simultaneamente como servidor HTTP, processador de dados e interface de gerenciamento local. É responsável por receber dados da extensão, processar com IA e fornecer insights em tempo real.

## 🏗️ Arquitetura do Aplicativo

```mermaid
graph TB
    subgraph "Interface Tkinter"
        MAIN["🖼️ Janela Principal"]
        DASH["📊 Dashboard"]
        CONFIG["⚙️ Configurações"]
        LOGS["📋 Logs"]
        STATUS["🔗 Status"]
    end
    
    subgraph "Core Services"
        HTTP["🌐 HTTP Server"]
        WS["📡 WebSocket Server"]
        SCHEDULER["⏰ Task Scheduler"]
        QUEUE["📬 Message Queue"]
    end
    
    subgraph "Processing Layer"
        MSG_PROC["💬 Message Processor"]
        AI_ENGINE["🤖 AI Engine"]
        DATA_MGR["📊 Data Manager"]
        SYNC["🔄 Sync Manager"]
    end
    
    subgraph "Storage Layer"
        SQLITE["💾 SQLite DB"]
        CACHE["⚡ Memory Cache"]
        FILES["📁 File Storage"]
        CONFIG_DB["⚙️ Config DB"]
    end
    
    MAIN --> DASH
    MAIN --> CONFIG
    MAIN --> LOGS
    MAIN --> STATUS
    
    DASH --> HTTP
    CONFIG --> WS
    STATUS --> SCHEDULER
    LOGS --> QUEUE
    
    HTTP --> MSG_PROC
    WS --> AI_ENGINE
    SCHEDULER --> DATA_MGR
    QUEUE --> SYNC
    
    MSG_PROC --> SQLITE
    AI_ENGINE --> CACHE
    DATA_MGR --> FILES
    SYNC --> CONFIG_DB
    
    style MAIN fill:#e1f5fe
    style HTTP fill:#f3e5f5
    style AI_ENGINE fill:#e8f5e8
    style SQLITE fill:#fff3e0
```

## 🎯 Funcionalidades Principais

### 1. Servidor HTTP/API

```mermaid
sequenceDiagram
    participant EXT as Extensão CRM
    participant HTTP as HTTP Server
    participant PROC as Message Processor
    participant AI as AI Engine
    participant DB as Database
    
    EXT->>HTTP: POST /api/messages
    HTTP->>PROC: Process message
    PROC->>AI: Analyze content
    AI->>PROC: Return insights
    PROC->>DB: Store data
    PROC->>HTTP: Response with analysis
    HTTP->>EXT: JSON response
```

**Endpoints Implementados:**
- `GET /api/health` - Status do servidor
- `POST /api/auth/login` - Autenticação
- `POST /api/messages/capture` - Capturar mensagem
- `GET /api/messages/{id}` - Buscar mensagem
- `POST /api/analysis/generate` - Gerar análise
- `GET /api/customers/{phone}` - Dados do cliente
- `GET /api/metrics/dashboard` - Métricas em tempo real

### 2. Interface de Gerenciamento

```mermaid
graph LR
    subgraph "Janela Principal"
        MENU["📋 Menu Principal"]
        TOOLBAR["🔧 Barra Ferramentas"]
        CONTENT["📄 Área Conteúdo"]
        STATUS_BAR["📊 Barra Status"]
    end
    
    subgraph "Abas de Conteúdo"
        TAB1["📈 Dashboard"]
        TAB2["💬 Mensagens"]
        TAB3["👥 Clientes"]
        TAB4["🤖 IA Config"]
        TAB5["⚙️ Sistema"]
    end
    
    CONTENT --> TAB1
    CONTENT --> TAB2
    CONTENT --> TAB3
    CONTENT --> TAB4
    CONTENT --> TAB5
```

### 3. Sistema de Monitoramento

```mermaid
flowchart TD
    MONITOR["🔍 Monitor System"] --> CPU["💻 CPU Usage"]
    MONITOR --> MEM["💾 Memory Usage"]
    MONITOR --> DISK["💿 Disk Usage"]
    MONITOR --> NET["🌐 Network"]
    
    CPU --> ALERT1["⚠️ CPU > 80%"]
    MEM --> ALERT2["⚠️ RAM > 90%"]
    DISK --> ALERT3["⚠️ Disk > 85%"]
    NET --> ALERT4["⚠️ Connection Lost"]
    
    ALERT1 --> NOTIFY["🔔 Notification"]
    ALERT2 --> NOTIFY
    ALERT3 --> NOTIFY
    ALERT4 --> NOTIFY
```

## 💻 Especificações Técnicas

### Estrutura do Projeto

```mermaid
graph TB
    subgraph "Projeto Tkinter CRM"
        MAIN_PY["📄 main.py"]
        
        subgraph "Core Modules"
            SERVER["🌐 server/"]
            UI["🖼️ ui/"]
            SERVICES["⚙️ services/"]
            MODELS["📊 models/"]
        end
        
        subgraph "Server Components"
            HTTP_SRV["📡 http_server.py"]
            WS_SRV["📡 websocket_server.py"]
            API["🔌 api_routes.py"]
            MIDDLEWARE["🔧 middleware.py"]
        end
        
        subgraph "UI Components"
            MAIN_WIN["🖼️ main_window.py"]
            DASHBOARD["📊 dashboard.py"]
            CONFIG_UI["⚙️ config_panel.py"]
            WIDGETS["🧩 custom_widgets.py"]
        end
        
        subgraph "Services"
            AI_SVC["🤖 ai_service.py"]
            DB_SVC["💾 database_service.py"]
            MSG_SVC["💬 message_service.py"]
            SYNC_SVC["🔄 sync_service.py"]
        end
        
        subgraph "Configuration"
            CONFIG["⚙️ config.py"]
            LOGGING["📋 logging_config.py"]
            CONSTANTS["📌 constants.py"]
        end
    end
```

### Dependências Python

```python
# requirements.txt
tkinter>=8.6.0          # Interface gráfica
fastapi>=0.104.0        # API REST
uvicorn>=0.24.0         # ASGI server
websockets>=12.0        # WebSocket support
sqlalchemy>=2.0.0       # ORM database
sqlite3                 # Database engine
requests>=2.31.0        # HTTP client
aiofiles>=23.2.0        # Async file operations
pydantic>=2.5.0         # Data validation
jsonschema>=4.20.0      # JSON validation
psutil>=5.9.0           # System monitoring
schedule>=1.2.0         # Task scheduling
watchdog>=3.0.0         # File monitoring
cryptography>=41.0.0    # Encryption
jwt>=2.8.0              # JWT tokens
redis>=5.0.0            # Cache (optional)
pillow>=10.1.0          # Image processing
matplotlib>=3.8.0       # Charts and graphs
numpy>=1.25.0           # Numerical operations
pandas>=2.1.0           # Data analysis
```

## 🔧 Implementação dos Módulos

### 1. Servidor HTTP (http_server.py)

```mermaid
classDiagram
    class HTTPServer {
        +host: str
        +port: int
        +app: FastAPI
        +start_server()
        +stop_server()
        +register_routes()
        +setup_middleware()
    }
    
    class APIRoutes {
        +auth_routes()
        +message_routes()
        +customer_routes()
        +analytics_routes()
        +system_routes()
    }
    
    class Middleware {
        +cors_middleware()
        +auth_middleware()
        +logging_middleware()
        +rate_limiting()
    }
    
    HTTPServer --> APIRoutes
    HTTPServer --> Middleware
```

**Funcionalidades:**
- Servidor FastAPI assíncrono
- Autenticação JWT
- Rate limiting
- CORS configurável
- Logging de requisições
- Validação de dados com Pydantic

### 2. Interface Principal (main_window.py)

```mermaid
classDiagram
    class MainWindow {
        +root: tk.Tk
        +notebook: ttk.Notebook
        +status_bar: StatusBar
        +menu_bar: MenuBar
        +create_widgets()
        +setup_layout()
        +bind_events()
    }
    
    class Dashboard {
        +metrics_frame: tk.Frame
        +charts_frame: tk.Frame
        +update_metrics()
        +refresh_charts()
    }
    
    class ConfigPanel {
        +ai_config: AIConfigFrame
        +server_config: ServerConfigFrame
        +save_config()
        +load_config()
    }
    
    MainWindow --> Dashboard
    MainWindow --> ConfigPanel
```

**Componentes da Interface:**
- Menu principal com ações rápidas
- Abas organizadas por funcionalidade
- Dashboard com métricas em tempo real
- Painel de configuração intuitivo
- Barra de status com indicadores
- Sistema de notificações integrado

### 3. Processador de Mensagens (message_service.py)

```mermaid
stateDiagram-v2
    [*] --> Received
    Received --> Validating : Validate data
    Validating --> Processing : Data valid
    Validating --> Error : Invalid data
    Processing --> AIAnalysis : Send to AI
    AIAnalysis --> Storing : Analysis complete
    Storing --> Notifying : Data stored
    Notifying --> Complete : Notification sent
    Complete --> [*]
    Error --> [*]
```

**Pipeline de Processamento:**
1. **Recepção**: Captura dados da extensão
2. **Validação**: Verifica integridade dos dados
3. **Enriquecimento**: Adiciona metadados
4. **Análise IA**: Processa com LLaMA
5. **Armazenamento**: Salva no banco de dados
6. **Notificação**: Envia resultado para extensão

## 🗄️ Modelo de Dados

### Schema do Banco SQLite

```mermaid
erDiagram
    USERS {
        integer id PK
        text username UK
        text email UK
        text password_hash
        text role
        datetime created_at
        datetime last_login
        boolean is_active
    }
    
    CONVERSATIONS {
        integer id PK
        text whatsapp_id UK
        integer user_id FK
        text customer_name
        text customer_phone
        text status
        datetime started_at
        datetime last_message_at
        json metadata
    }
    
    MESSAGES {
        integer id PK
        integer conversation_id FK
        text content
        text message_type
        text direction
        datetime timestamp
        text media_url
        json raw_data
    }
    
    AI_ANALYSIS {
        integer id PK
        integer message_id FK
        float sentiment_score
        text intent_classification
        json suggested_responses
        text model_version
        datetime analyzed_at
        json confidence_scores
    }
    
    CUSTOMERS {
        integer id PK
        text phone UK
        text name
        text email
        json tags
        json custom_fields
        datetime first_contact
        datetime last_contact
        text status
    }
    
    SYSTEM_LOGS {
        integer id PK
        text level
        text module
        text message
        json context
        datetime timestamp
    }
    
    USERS ||--o{ CONVERSATIONS : manages
    CONVERSATIONS ||--o{ MESSAGES : contains
    MESSAGES ||--|| AI_ANALYSIS : has
    CUSTOMERS ||--o{ CONVERSATIONS : participates
```

## ⚙️ Sistema de Configuração

### Arquivo de Configuração (config.json)

```json
{
  "server": {
    "host": "localhost",
    "port": 8080,
    "debug": false,
    "auto_start": true
  },
  "websocket": {
    "port": 8081,
    "max_connections": 100
  },
  "database": {
    "path": "./data/crm.db",
    "backup_interval": 3600,
    "max_backups": 10
  },
  "ai": {
    "model_path": "./models/llama",
    "max_tokens": 512,
    "temperature": 0.7,
    "use_gpu": false
  },
  "security": {
    "jwt_secret": "auto-generated",
    "token_expiry": 86400,
    "rate_limit": 100
  },
  "logging": {
    "level": "INFO",
    "file_path": "./logs/app.log",
    "max_size": "10MB",
    "backup_count": 5
  }
}
```

### Interface de Configuração

```mermaid
graph TB
    subgraph "Painel Configuração"
        TAB1["🌐 Servidor"]
        TAB2["🤖 IA/LLaMA"]
        TAB3["💾 Banco Dados"]
        TAB4["🔒 Segurança"]
        TAB5["📋 Logs"]
    end
    
    subgraph "Controles Servidor"
        HOST["🏠 Host/IP"]
        PORT["🔌 Porta"]
        SSL["🔒 SSL/TLS"]
        CORS["🌐 CORS"]
    end
    
    subgraph "Controles IA"
        MODEL["🧠 Modelo"]
        GPU["⚡ GPU"]
        TEMP["🌡️ Temperature"]
        TOKENS["📝 Max Tokens"]
    end
    
    TAB1 --> HOST
    TAB1 --> PORT
    TAB1 --> SSL
    TAB1 --> CORS
    
    TAB2 --> MODEL
    TAB2 --> GPU
    TAB2 --> TEMP
    TAB2 --> TOKENS
```

## 📊 Dashboard e Métricas

### Widgets do Dashboard

```mermaid
graph TB
    subgraph "Dashboard Principal"
        ROW1["📊 Métricas Hoje"]
        ROW2["📈 Gráficos Tempo Real"]
        ROW3["📋 Atividade Recente"]
        ROW4["🔔 Alertas Sistema"]
    end
    
    subgraph "Métricas Hoje"
        M1["💬 Mensagens"]
        M2["👥 Clientes"]
        M3["⏱️ Tempo Médio"]
        M4["🎯 Taxa Conversão"]
    end
    
    subgraph "Gráficos"
        G1["📈 Mensagens/Hora"]
        G2["😊 Sentimento"]
        G3["🏷️ Intenções"]
        G4["⚡ Performance"]
    end
    
    ROW1 --> M1
    ROW1 --> M2
    ROW1 --> M3
    ROW1 --> M4
    
    ROW2 --> G1
    ROW2 --> G2
    ROW2 --> G3
    ROW2 --> G4
```

### Métricas em Tempo Real

```python
# Exemplo de métricas coletadas
class MetricsCollector:
    def collect_realtime_metrics(self):
        return {
            "messages_today": self.count_messages_today(),
            "active_conversations": self.count_active_conversations(),
            "avg_response_time": self.calculate_avg_response_time(),
            "sentiment_distribution": self.get_sentiment_distribution(),
            "system_performance": {
                "cpu_usage": psutil.cpu_percent(),
                "memory_usage": psutil.virtual_memory().percent,
                "disk_usage": psutil.disk_usage('/').percent
            }
        }
```

## 🔄 Sistema de Sincronização

### Sincronização com VPS

```mermaid
sequenceDiagram
    participant LOCAL as App Local
    participant VPS as Servidor VPS
    participant BACKUP as Backup Service
    
    LOCAL->>VPS: Sync request
    VPS->>LOCAL: Last sync timestamp
    LOCAL->>LOCAL: Identify changes
    LOCAL->>VPS: Send incremental data
    VPS->>VPS: Process and store
    VPS->>BACKUP: Trigger backup
    VPS->>LOCAL: Sync confirmation
    LOCAL->>LOCAL: Update sync status
```

### Estratégias de Backup

```mermaid
graph LR
    subgraph "Backup Local"
        AUTO["⏰ Automático"]
        MANUAL["👆 Manual"]
        INCREMENTAL["📈 Incremental"]
    end
    
    subgraph "Backup Remoto"
        CLOUD["☁️ Cloud Storage"]
        VPS_BACKUP["🖥️ VPS Backup"]
        ENCRYPTED["🔒 Criptografado"]
    end
    
    AUTO --> CLOUD
    MANUAL --> VPS_BACKUP
    INCREMENTAL --> ENCRYPTED
```

## 🚀 Performance e Otimização

### Otimizações Implementadas

```mermaid
graph TB
    subgraph "Otimizações de Performance"
        ASYNC["⚡ Async Operations"]
        CACHE["💾 Memory Caching"]
        POOL["🏊 Connection Pooling"]
        BATCH["📦 Batch Processing"]
    end
    
    subgraph "Otimizações de UI"
        LAZY["😴 Lazy Loading"]
        VIRTUAL["📜 Virtual Scrolling"]
        DEBOUNCE["⏱️ Debouncing"]
        THREAD["🧵 Background Threads"]
    end
    
    subgraph "Otimizações de Dados"
        INDEX["📇 Database Indexes"]
        COMPRESS["🗜️ Data Compression"]
        PAGINATE["📄 Pagination"]
        CLEANUP["🧹 Auto Cleanup"]
    end
```

## 🔧 Instalação e Deploy

### Script de Instalação

```bash
#!/bin/bash
# install.sh

echo "🚀 Instalando CRM WhatsApp Desktop..."

# Verificar Python
if ! command -v python3 &> /dev/null; then
    echo "❌ Python 3.9+ é necessário"
    exit 1
fi

# Criar ambiente virtual
python3 -m venv venv
source venv/bin/activate

# Instalar dependências
pip install -r requirements.txt

# Criar diretórios
mkdir -p data logs models backups

# Configuração inicial
cp config.example.json config.json

# Inicializar banco
python scripts/init_database.py

echo "✅ Instalação concluída!"
echo "Execute: python main.py"
```

### Executável Standalone

```python
# build.py - Criar executável com PyInstaller
import PyInstaller.__main__

PyInstaller.__main__.run([
    'main.py',
    '--onefile',
    '--windowed',
    '--name=CRM-WhatsApp',
    '--icon=assets/icon.ico',
    '--add-data=templates;templates',
    '--add-data=static;static',
    '--hidden-import=uvicorn',
    '--hidden-import=fastapi',
])
```

## 📋 Testes e Qualidade

### Estratégia de Testes

```mermaid
graph TB
    subgraph "Testes Unitários"
        PYTEST["🧪 PyTest"]
        MOCK["🎭 Mocking"]
        COVERAGE["📊 Coverage"]
    end
    
    subgraph "Testes Integração"
        API_TEST["🔌 API Tests"]
        DB_TEST["💾 DB Tests"]
        UI_TEST["🖼️ UI Tests"]
    end
    
    subgraph "Testes Performance"
        LOAD["⚡ Load Tests"]
        STRESS["💪 Stress Tests"]
        MEMORY["💾 Memory Tests"]
    end
```

---

## 📋 Próximos Passos

1. **Setup do Ambiente Python**
2. **Implementação do Core Tkinter**
3. **Desenvolvimento do Servidor HTTP**
4. **Integração com Sistema de IA**
5. **Testes de Performance**
6. **Criação do Executável**

---

*Especificações Técnicas - Aplicativo Tkinter*  
*Versão: 1.0*  
*Data: Janeiro 2024*  
*Status: Especificação Completa*