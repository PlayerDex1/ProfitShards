# Guia de Compliance

## 📋 Regulamentações Aplicáveis

### LGPD (Lei Geral de Proteção de Dados)

#### Princípios Fundamentais
- **Finalidade**: Dados coletados apenas para fins específicos
- **Adequação**: Dados adequados à finalidade
- **Necessidade**: Apenas dados necessários
- **Livre Acesso**: Usuários podem acessar seus dados
- **Qualidade**: Dados precisos e atualizados
- **Transparência**: Informações claras sobre coleta
- **Não Discriminação**: Não discriminação por dados
- **Responsabilização**: Responsabilidade pela proteção

#### Direitos dos Titulares
```typescript
// Implementação dos direitos LGPD
export const lgpdRights = {
  // Direito de acesso
  access: async (userId: string) => {
    const user = await db.prepare('SELECT * FROM users WHERE id = ?').bind(userId).first();
    return sanitizeUser(user);
  },

  // Direito de correção
  correction: async (userId: string, data: Partial<User>) => {
    await db.prepare('UPDATE users SET ? WHERE id = ?').bind(data, userId).run();
  },

  // Direito de exclusão
  deletion: async (userId: string) => {
    await db.prepare('DELETE FROM users WHERE id = ?').bind(userId).run();
    await db.prepare('DELETE FROM sessions WHERE user_id = ?').bind(userId).run();
  },

  // Direito de portabilidade
  portability: async (userId: string) => {
    const user = await db.prepare('SELECT * FROM users WHERE id = ?').bind(userId).first();
    const sessions = await db.prepare('SELECT * FROM sessions WHERE user_id = ?').bind(userId).all();
    return { user, sessions };
  }
};
```

### GDPR (Regulamento Geral de Proteção de Dados)

#### Base Legal para Processamento
```typescript
// Bases legais para processamento
export const gdprBases = {
  CONSENT: 'consent',
  CONTRACT: 'contract',
  LEGAL_OBLIGATION: 'legal_obligation',
  VITAL_INTERESTS: 'vital_interests',
  PUBLIC_TASK: 'public_task',
  LEGITIMATE_INTERESTS: 'legitimate_interests'
};

// Verificação de base legal
export function checkLegalBasis(purpose: string, basis: string): boolean {
  const legalBases = {
    'authentication': [gdprBases.CONSENT, gdprBases.CONTRACT],
    'analytics': [gdprBases.CONSENT, gdprBases.LEGITIMATE_INTERESTS],
    'security': [gdprBases.LEGITIMATE_INTERESTS, gdprBases.LEGAL_OBLIGATION]
  };
  
  return legalBases[purpose]?.includes(basis) || false;
}
```

#### Consentimento
```typescript
// Sistema de consentimento
export interface Consent {
  id: string;
  userId: string;
  purpose: string;
  granted: boolean;
  timestamp: Date;
  version: string;
  ipAddress: string;
}

// Registrar consentimento
export async function recordConsent(userId: string, purpose: string, granted: boolean) {
  await db.prepare(`
    INSERT INTO consents (id, user_id, purpose, granted, timestamp, version, ip_address)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `).bind(
    crypto.randomUUID(),
    userId,
    purpose,
    granted ? 1 : 0,
    Date.now(),
    '1.0',
    request.headers.get('cf-connecting-ip')
  ).run();
}

// Verificar consentimento
export async function hasConsent(userId: string, purpose: string): Promise<boolean> {
  const consent = await db.prepare(`
    SELECT granted FROM consents 
    WHERE user_id = ? AND purpose = ? 
    ORDER BY timestamp DESC LIMIT 1
  `).bind(userId, purpose).first();
  
  return consent?.granted === 1;
}
```

## 🔐 Medidas de Proteção

### Criptografia

#### Dados em Trânsito
```typescript
// HTTPS forçado
export function enforceHTTPS(request: Request): boolean {
  const protocol = new URL(request.url).protocol;
  return protocol === 'https:';
}

// Headers de segurança
export const securityHeaders = {
  'Strict-Transport-Security': 'max-age=31536000; includeSubDomains',
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'DENY',
  'X-XSS-Protection': '1; mode=block'
};
```

#### Dados em Repouso
```typescript
// Criptografia de dados sensíveis
export async function encryptSensitiveData(data: string): Promise<string> {
  const algorithm = 'AES-256-GCM';
  const key = await crypto.subtle.generateKey(
    { name: algorithm, length: 256 },
    true,
    ['encrypt', 'decrypt']
  );
  
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const encoded = new TextEncoder().encode(data);
  
  const encrypted = await crypto.subtle.encrypt(
    { name: algorithm, iv },
    key,
    encoded
  );
  
  return JSON.stringify({
    encrypted: Array.from(new Uint8Array(encrypted)),
    iv: Array.from(iv)
  });
}
```

### Controle de Acesso

#### Autenticação
```typescript
// Verificação de autenticação
export async function requireAuthentication(request: Request): Promise<User> {
  const session = await getSession(request);
  if (!session) {
    throw new Error('Authentication required');
  }
  
  const user = await db.prepare('SELECT * FROM users WHERE id = ?').bind(session.userId).first();
  if (!user) {
    throw new Error('User not found');
  }
  
  return user;
}
```

#### Autorização
```typescript
// Controle de acesso baseado em roles
export interface Permission {
  resource: string;
  action: string;
  conditions?: Record<string, any>;
}

export const userPermissions: Permission[] = [
  { resource: 'own_data', action: 'read' },
  { resource: 'own_data', action: 'update' },
  { resource: 'own_data', action: 'delete' }
];

export function checkPermission(user: User, resource: string, action: string): boolean {
  return userPermissions.some(p => 
    p.resource === resource && p.action === action
  );
}
```

## 📊 Auditoria e Logs

### Logs de Auditoria
```typescript
// Sistema de logs de auditoria
export interface AuditLog {
  id: string;
  userId: string;
  action: string;
  resource: string;
  details: any;
  timestamp: Date;
  ipAddress: string;
  userAgent: string;
}

// Registrar ação de auditoria
export async function logAuditEvent(
  userId: string,
  action: string,
  resource: string,
  details: any,
  request: Request
) {
  await db.prepare(`
    INSERT INTO audit_logs (id, user_id, action, resource, details, timestamp, ip_address, user_agent)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `).bind(
    crypto.randomUUID(),
    userId,
    action,
    resource,
    JSON.stringify(details),
    Date.now(),
    request.headers.get('cf-connecting-ip'),
    request.headers.get('user-agent')
  ).run();
}

// Consultar logs de auditoria
export async function getAuditLogs(
  userId?: string,
  startDate?: Date,
  endDate?: Date
): Promise<AuditLog[]> {
  let query = 'SELECT * FROM audit_logs WHERE 1=1';
  const params: any[] = [];
  
  if (userId) {
    query += ' AND user_id = ?';
    params.push(userId);
  }
  
  if (startDate) {
    query += ' AND timestamp >= ?';
    params.push(startDate.getTime());
  }
  
  if (endDate) {
    query += ' AND timestamp <= ?';
    params.push(endDate.getTime());
  }
  
  query += ' ORDER BY timestamp DESC';
  
  return db.prepare(query).bind(...params).all();
}
```

### Retenção de Dados
```typescript
// Política de retenção
export const retentionPolicy = {
  users: 'indefinite', // Até solicitação de exclusão
  sessions: '7 days',
  audit_logs: '2 years',
  consents: '5 years',
  backups: '1 year'
};

// Limpeza automática de dados
export async function cleanupExpiredData() {
  const now = Date.now();
  
  // Limpar sessões expiradas
  await db.prepare(`
    DELETE FROM sessions 
    WHERE expires_at < ?
  `).bind(now).run();
  
  // Limpar logs antigos
  const twoYearsAgo = now - (2 * 365 * 24 * 60 * 60 * 1000);
  await db.prepare(`
    DELETE FROM audit_logs 
    WHERE timestamp < ?
  `).bind(twoYearsAgo).run();
}
```

## 🚨 Incidentes de Segurança

### Procedimentos de Resposta
```typescript
// Classificação de incidentes
export enum IncidentSeverity {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical'
}

export interface SecurityIncident {
  id: string;
  type: string;
  severity: IncidentSeverity;
  description: string;
  affectedUsers: number;
  discoveredAt: Date;
  resolvedAt?: Date;
  actions: string[];
}

// Registrar incidente
export async function reportSecurityIncident(
  type: string,
  severity: IncidentSeverity,
  description: string,
  affectedUsers: number
): Promise<string> {
  const incidentId = crypto.randomUUID();
  
  await db.prepare(`
    INSERT INTO security_incidents (id, type, severity, description, affected_users, discovered_at)
    VALUES (?, ?, ?, ?, ?, ?)
  `).bind(
    incidentId,
    type,
    severity,
    description,
    affectedUsers,
    Date.now()
  ).run();
  
  // Notificar equipe de segurança
  await notifySecurityTeam(incidentId, severity);
  
  return incidentId;
}

// Notificar autoridades (se necessário)
export async function notifyAuthorities(incident: SecurityIncident) {
  if (incident.severity === IncidentSeverity.CRITICAL) {
    // Notificar ANPD (LGPD)
    await notifyANPD(incident);
    
    // Notificar usuários afetados
    await notifyAffectedUsers(incident);
  }
}
```

## 📋 Checklist de Compliance

### LGPD
- [ ] Mapeamento de dados pessoais
- [ ] Base legal para processamento
- [ ] Consentimento quando necessário
- [ ] Direitos dos titulares implementados
- [ ] Medidas de segurança adequadas
- [ ] Política de privacidade atualizada
- [ ] Treinamento da equipe
- [ ] Auditoria regular

### GDPR
- [ ] Base legal para processamento
- [ ] Consentimento granular
- [ ] Direito ao esquecimento
- [ ] Portabilidade de dados
- [ ] Privacy by design
- [ ] Data protection impact assessment
- [ ] Data protection officer (se necessário)
- [ ] Notificação de violações

### Medidas Técnicas
- [ ] Criptografia em trânsito e repouso
- [ ] Controle de acesso robusto
- [ ] Logs de auditoria
- [ ] Backup e recuperação
- [ ] Testes de segurança
- [ ] Monitoramento contínuo
- [ ] Plano de resposta a incidentes
- [ ] Atualizações de segurança

## 📞 Contatos de Compliance

### Autoridades
- **ANPD (Brasil)**: [www.gov.br/anpd](https://www.gov.br/anpd)
- **CNIL (França)**: [www.cnil.fr](https://www.cnil.fr)
- **ICO (Reino Unido)**: [ico.org.uk](https://ico.org.uk)

### Equipe Interna
- **DPO**: [dpo@worldshards.com](mailto:dpo@worldshards.com)
- **Legal**: [legal@worldshards.com](mailto:legal@worldshards.com)
- **Segurança**: [security@worldshards.com](mailto:security@worldshards.com)

## 📚 Recursos

### Documentação
- [LGPD - Texto Completo](http://www.planalto.gov.br/ccivil_03/_ato2015-2018/2018/lei/l13709.htm)
- [GDPR - Texto Completo](https://gdpr.eu/)
- [ANPD - Orientações](https://www.gov.br/anpd/pt-br/assuntos/notas-tecnicas)
- [CNIL - Guidelines](https://www.cnil.fr/en/home)

### Ferramentas
- [Privacy Impact Assessment](https://www.cnil.fr/en/privacy-impact-assessment-pia)
- [Data Protection Toolkit](https://ico.org.uk/for-organisations/guide-to-data-protection/)
- [GDPR Compliance Checklist](https://gdpr.eu/checklist/)

---

**Compliance é fundamental** 📋