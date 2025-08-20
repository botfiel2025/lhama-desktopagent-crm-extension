# Arquitetura do Sistema CRM WhatsApp Web

## 📐 Visão Arquitetural Geral

Este documento detalha a arquitetura técnica do sistema CRM integrado ao WhatsApp Web, abrangendo todos os componentes, suas interações e padrões arquiteturais adotados.

## 🏛️ Arquitetura de Alto Nível

```mermaid
C4Context
    title Diagrama de Contexto - Sistema CRM WhatsApp
    
    Person(user, "Atendente", "Usuário que utiliza o sistema para atendimento")
    Person(customer, "Cliente", "Cliente que envia mensagens via WhatsApp")
    
    System(crm_system, "CRM WhatsApp System", "Sistema completo de CRM integrado")
    
    System_Ext(whatsapp, "WhatsApp Web", "Plataforma oficial do WhatsApp")
    System_Ext(external_apis, "APIs Externas", "Integrações com sistemas terceiros")
    
    Rel(user, crm_system, "Utiliza")
    Rel(customer, whatsapp, "Envia mensagens")
    Rel(crm_system, whatsapp, "Integra com")
    Rel(crm_system, external_apis, "Consome dados")
```

## 🔧 Arquitetura de Componentes

```mermaid
graph TB
    subgraph "Frontend Layer"
        WEB[WhatsApp Web]
        EXT[Extensão CRM]
        UI[Interface Usuário]
    end
    
    subgraph "Application Layer"
        API[API Gateway]
        AUTH[Autenticação]
        BL[Business Logic]
    end
    
    subgraph "Service Layer"
        TK[Tkinter Server]
        WS[WebSocket Service]
        PROC[Message Processor]
    end
    
    subgraph "AI Layer"
        LLAMA[LLaMA Engine]
        NLP[NLP Processor]
        ML[ML Models]
    end
    
    subgraph "Data Layer"
        CACHE[Redis Cache]
        DB[(SQLite DB)]
        FILES[File Storage]
    end
    
    subgraph "Infrastructure Layer"
        LOG[Logging]
        MON[Monitoring]
        SEC[Security]
    end
    
    WEB --> EXT
    EXT --> UI
    UI --> API
    API --> AUTH
    AUTH --> BL
    BL --> TK
    TK --> WS
    TK --> PROC
    PROC --> LLAMA
    LLAMA --> NLP
    NLP --> ML
    TK --> CACHE
    TK --> DB
    TK --> FILES
    TK --> LOG
    TK --> MON
    TK --> SEC
    
    style EXT fill:#e1f5fe
    style TK fill:#f3e5f5
    style LLAMA fill:#e8f5e8
    style DB fill:#fff3e0
```

## 🔄 Fluxo de Dados Detalhado

```mermaid
sequenceDiagram
    participant C as Cliente
    participant WW as WhatsApp Web
    participant EXT as Extensão CRM
    participant API as API Gateway
    participant TK as Tkinter Server
    participant AI as LLaMA Engine
    participant DB as Database
    participant U as Atendente
    
    C->>WW: Envia mensagem
    WW->>EXT: Captura mensagem (DOM Observer)
    EXT->>API: POST /messages/capture
    API->>TK: Processa mensagem
    
    TK->>DB: Salva mensagem bruta
    TK->>AI: Solicita análise
    
    AI->>AI: Processa com LLaMA
    AI->>TK: Retorna insights
    
    TK->>DB: Salva análise
    TK->>API: Envia sugestões
    API->>EXT: WebSocket notification
    EXT->>U: Exibe sugestões na UI
    
    U->>EXT: Seleciona resposta
    EXT->>WW: Insere texto (DOM Manipulation)
    WW->>C: Envia resposta
```

## 🏗️ Padrões Arquiteturais

### 1. Microserviços Modulares

```mermaid
graph LR
    subgraph "Core Services"
        MS1[Message Service]
        MS2[Analysis Service]
        MS3[User Service]
        MS4[Config Service]
    end
    
    subgraph "Support Services"
        SS1[Logging Service]
        SS2[Cache Service]
        SS3[File Service]
        SS4[Notification Service]
    end
    
    API_GW[API Gateway] --> MS1
    API_GW --> MS2
    API_GW --> MS3
    API_GW --> MS4
    
    MS1 --> SS1
    MS1 --> SS2
    MS2 --> SS1
    MS2 --> SS3
    MS3 --> SS4
    MS4 --> SS2
```

### 2. Event-Driven Architecture

```mermaid
graph TB
    subgraph "Event Producers"
        EXT[Extensão CRM]
        TK[Tkinter App]
        AI[LLaMA Engine]
    end
    
    subgraph "Event Bus"
        EB[Event Broker]
        Q1[Message Queue]
        Q2[Analysis Queue]
        Q3[Notification Queue]
    end
    
    subgraph "Event Consumers"
        PROC[Message Processor]
        ANAL[Analysis Processor]
        NOTIF[Notification Processor]
    end
    
    EXT --> EB
    TK --> EB
    AI --> EB
    
    EB --> Q1
    EB --> Q2
    EB --> Q3
    
    Q1 --> PROC
    Q2 --> ANAL
    Q3 --> NOTIF
```

## 🔐 Arquitetura de Segurança

```mermaid
graph TB
    subgraph "Security Layers"
        L1["Layer 1: Network Security"]
        L2["Layer 2: Application Security"]
        L3["Layer 3: Data Security"]
        L4["Layer 4: Infrastructure Security"]
    end
    
    subgraph "Security Components"
        FW[Firewall]
        WAF[Web Application Firewall]
        AUTH[OAuth 2.0 + JWT]
        ENC[AES-256 Encryption]
        AUDIT[Audit Logging]
        BACKUP[Encrypted Backup]
    end
    
    L1 --> FW
    L1 --> WAF
    L2 --> AUTH
    L3 --> ENC
    L4 --> AUDIT
    L4 --> BACKUP
```

## 📊 Modelo de Dados

```mermaid
erDiagram
    USERS {
        int id PK
        string username
        string email
        string password_hash
        datetime created_at
        datetime last_login
        boolean is_active
    }
    
    CONVERSATIONS {
        int id PK
        string whatsapp_id
        int user_id FK
        string customer_name
        string customer_phone
        datetime started_at
        datetime last_message_at
        string status
    }
    
    MESSAGES {
        int id PK
        int conversation_id FK
        string content
        string message_type
        string direction
        datetime timestamp
        json metadata
    }
    
    ANALYSIS {
        int id PK
        int message_id FK
        float sentiment_score
        string intent_classification
        json suggested_responses
        datetime analyzed_at
        string model_version
    }
    
    USERS ||--o{ CONVERSATIONS : manages
    CONVERSATIONS ||--o{ MESSAGES : contains
    MESSAGES ||--|| ANALYSIS : has
```

## 🚀 Arquitetura de Deploy

### Opção 1: Deploy Local

```mermaid
graph TB
    subgraph "Máquina Local"
        subgraph "Browser"
            WW[WhatsApp Web]
            EXT[Extensão CRM]
        end
        
        subgraph "Desktop App"
            TK[Tkinter Server]
            LLAMA[LLaMA Local]
            DB[(SQLite)]
        end
        
        subgraph "Services"
            HTTP[HTTP Server :8080]
            WS[WebSocket :8081]
        end
    end
    
    EXT <--> HTTP
    HTTP <--> TK
    TK <--> LLAMA
    TK <--> DB
    EXT <--> WS
```

### Opção 2: Deploy VPS

```mermaid
graph TB
    subgraph "Cliente Local"
        BROWSER[Browser + Extensão]
    end
    
    subgraph "VPS (KVM 4)"
        subgraph "Application Layer"
            API[API Gateway]
            TK[Tkinter Server]
        end
        
        subgraph "AI Layer"
            LLAMA[LLaMA Engine]
            GPU[GPU Processing]
        end
        
        subgraph "Data Layer"
            DB[(PostgreSQL)]
            REDIS[Redis Cache]
            FILES[File Storage]
        end
        
        subgraph "Infrastructure"
            NGINX[Nginx Proxy]
            SSL[SSL/TLS]
            MON[Monitoring]
        end
    end
    
    BROWSER <--> NGINX
    NGINX <--> API
    API <--> TK
    TK <--> LLAMA
    LLAMA <--> GPU
    TK <--> DB
    TK <--> REDIS
    TK <--> FILES
```

## 📈 Escalabilidade e Performance

```mermaid
graph LR
    subgraph "Load Balancing"
        LB[Load Balancer]
        N1[Node 1]
        N2[Node 2]
        N3[Node 3]
    end
    
    subgraph "Caching Strategy"
        L1[L1: Browser Cache]
        L2[L2: Redis Cache]
        L3[L3: Database Cache]
    end
    
    subgraph "Database Scaling"
        MASTER[(Master DB)]
        SLAVE1[(Slave DB 1)]
        SLAVE2[(Slave DB 2)]
    end
    
    LB --> N1
    LB --> N2
    LB --> N3
    
    N1 --> L2
    N2 --> L2
    N3 --> L2
    
    L2 --> MASTER
    MASTER --> SLAVE1
    MASTER --> SLAVE2
```

## 🔧 Tecnologias e Ferramentas

### Frontend
- **Extensão**: JavaScript ES6+, HTML5, CSS3
- **Build**: Webpack, Babel
- **Testing**: Jest, Cypress

### Backend
- **Core**: Python 3.9+, Tkinter
- **Web**: FastAPI, WebSockets
- **Database**: SQLite (local), PostgreSQL (VPS)
- **Cache**: Redis

### AI/ML
- **Engine**: LLaMA 2/3
- **Framework**: Transformers, PyTorch
- **Processing**: CUDA (GPU), OpenMP (CPU)

### DevOps
- **Containerização**: Docker
- **Orquestração**: Docker Compose
- **Monitoramento**: Prometheus, Grafana
- **Logs**: ELK Stack

## 📋 Considerações de Implementação

### Fases de Desenvolvimento
1. **MVP**: Extensão básica + Tkinter core
2. **AI Integration**: LLaMA + análise básica
3. **Advanced Features**: ML avançado + automações
4. **Production**: Deploy VPS + monitoramento

### Métricas de Performance
- **Latência**: < 200ms para sugestões
- **Throughput**: 1000+ mensagens/minuto
- **Disponibilidade**: 99.9% uptime
- **Precisão IA**: > 85% accuracy

---

*Documento técnico - Arquitetura do Sistema*  
*Versão: 1.0*  
*Data: Janeiro 2024*