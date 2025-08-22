# Guia de Testes

## 🧪 Estratégia de Testes

### Pirâmide de Testes
```
    ┌─────────────┐
    │   E2E Tests │ ← Poucos, lentos, caros
    └─────────────┘
   ┌───────────────┐
   │ Integration   │ ← Alguns, médios
   │   Tests       │
   └───────────────┘
  ┌─────────────────┐
  │   Unit Tests    │ ← Muitos, rápidos, baratos
  └─────────────────┘
```

### Cobertura de Testes
- **Unit Tests**: 80%+
- **Integration Tests**: 60%+
- **E2E Tests**: 40%+

## 🧩 Testes Unitários

### Configuração
```bash
# Instalar dependências de teste
npm install --save-dev vitest @testing-library/react @testing-library/jest-dom jsdom
```

### Configuração Vitest
```typescript
// vitest.config.ts
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
    globals: true
  }
});
```

### Setup de Testes
```typescript
// src/test/setup.ts
import '@testing-library/jest-dom';
import { vi } from 'vitest';

// Mock fetch
global.fetch = vi.fn();

// Mock localStorage
Object.defineProperty(window, 'localStorage', {
  value: {
    getItem: vi.fn(),
    setItem: vi.fn(),
    removeItem: vi.fn(),
    clear: vi.fn()
  }
});
```

### Exemplos de Testes

#### Teste de Hook
```typescript
// src/hooks/__tests__/use-auth.test.ts
import { renderHook, act } from '@testing-library/react';
import { useAuth } from '../use-auth';

describe('useAuth', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should initialize with null user', () => {
    const { result } = renderHook(() => useAuth());
    expect(result.current.user).toBeNull();
    expect(result.current.isAuthenticated).toBe(false);
  });

  it('should handle login successfully', async () => {
    const mockUser = { id: '1', email: 'test@example.com' };
    (fetch as any).mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ user: mockUser })
    });

    const { result } = renderHook(() => useAuth());

    await act(async () => {
      const loginResult = await result.current.login('test@example.com', 'password');
      expect(loginResult.ok).toBe(true);
    });

    expect(result.current.user).toBe(mockUser.email);
    expect(result.current.isAuthenticated).toBe(true);
  });

  it('should handle login failure', async () => {
    (fetch as any).mockRejectedValueOnce(new Error('Network error'));

    const { result } = renderHook(() => useAuth());

    await act(async () => {
      const loginResult = await result.current.login('test@example.com', 'password');
      expect(loginResult.ok).toBe(false);
    });

    expect(result.current.user).toBeNull();
    expect(result.current.isAuthenticated).toBe(false);
  });
});
```

#### Teste de Componente
```typescript
// src/components/__tests__/AuthModal.test.tsx
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { AuthModal } from '../AuthModal';

describe('AuthModal', () => {
  const mockOnClose = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render login button', () => {
    render(<AuthModal onClose={mockOnClose} />);
    expect(screen.getByText('Continuar com Google')).toBeInTheDocument();
  });

  it('should call onClose when cancel button is clicked', () => {
    render(<AuthModal onClose={mockOnClose} />);
    fireEvent.click(screen.getByText('Cancelar'));
    expect(mockOnClose).toHaveBeenCalled();
  });

  it('should redirect to Google OAuth when login button is clicked', () => {
    const mockLocation = { href: '' };
    Object.defineProperty(window, 'location', {
      value: mockLocation,
      writable: true
    });

    render(<AuthModal onClose={mockOnClose} />);
    fireEvent.click(screen.getByText('Continuar com Google'));

    expect(mockLocation.href).toBe('/api/auth/google/start');
  });
});
```

#### Teste de Utilitário
```typescript
// src/lib/__tests__/calculator.test.ts
import { calculateProfit, validateInput } from '../calculator';

describe('calculator', () => {
  describe('calculateProfit', () => {
    it('should calculate profit correctly', () => {
      const result = calculateProfit({
        investment: 100,
        tokensFarmed: 50,
        tokensAccelerated: 10,
        tokenPrice: 2
      });

      expect(result.netTokens).toBe(40);
      expect(result.totalValue).toBe(80);
      expect(result.profit).toBe(-20);
      expect(result.roi).toBe(-20);
    });

    it('should handle zero investment', () => {
      const result = calculateProfit({
        investment: 0,
        tokensFarmed: 50,
        tokensAccelerated: 10,
        tokenPrice: 2
      });

      expect(result.roi).toBe(Infinity);
    });
  });

  describe('validateInput', () => {
    it('should validate positive numbers', () => {
      expect(validateInput(100)).toBe(true);
      expect(validateInput(0)).toBe(true);
    });

    it('should reject negative numbers', () => {
      expect(validateInput(-100)).toBe(false);
    });

    it('should reject non-numbers', () => {
      expect(validateInput('abc')).toBe(false);
      expect(validateInput(null)).toBe(false);
      expect(validateInput(undefined)).toBe(false);
    });
  });
});
```

## 🔗 Testes de Integração

### Configuração
```typescript
// src/test/integration/setup.ts
import { setupServer } from 'msw/node';
import { handlers } from './handlers';

export const server = setupServer(...handlers);

beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());
```

### Handlers MSW
```typescript
// src/test/integration/handlers.ts
import { rest } from 'msw';

export const handlers = [
  rest.get('/api/auth/me', (req, res, ctx) => {
    return res(
      ctx.json({
        user: {
          id: '1',
          email: 'test@example.com',
          username: 'testuser'
        }
      })
    );
  }),

  rest.post('/api/auth/login', (req, res, ctx) => {
    const { email, password } = req.body as any;
    
    if (email === 'test@example.com' && password === 'password') {
      return res(ctx.json({ ok: true }));
    }
    
    return res(ctx.status(401), ctx.json({ error: 'invalid_credentials' }));
  }),

  rest.get('/api/runs', (req, res, ctx) => {
    return res(
      ctx.json({
        items: [
          {
            id: '1',
            userId: '1',
            dungeonId: 'dungeon1',
            tokensFarmed: 100,
            tokensAccelerated: 20,
            netTokens: 80,
            timestamp: Date.now()
          }
        ]
      })
    );
  })
];
```

### Teste de Integração
```typescript
// src/test/integration/auth-flow.test.ts
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { AuthModal } from '../../components/AuthModal';
import { server } from './setup';
import { rest } from 'msw';

describe('Authentication Flow', () => {
  it('should complete full login flow', async () => {
    // Mock successful login
    server.use(
      rest.post('/api/auth/login', (req, res, ctx) => {
        return res(ctx.json({ ok: true }));
      }),
      rest.get('/api/auth/me', (req, res, ctx) => {
        return res(ctx.json({
          user: { id: '1', email: 'test@example.com' }
        }));
      })
    );

    render(<AuthModal onClose={vi.fn()} />);

    // Simulate login
    fireEvent.click(screen.getByText('Continuar com Google'));

    // Verify redirect
    await waitFor(() => {
      expect(window.location.href).toBe('/api/auth/google/start');
    });
  });

  it('should handle login errors', async () => {
    server.use(
      rest.post('/api/auth/login', (req, res, ctx) => {
        return res(ctx.status(401), ctx.json({ error: 'invalid_credentials' }));
      })
    );

    // Test error handling
    const { result } = renderHook(() => useAuth());

    await act(async () => {
      const loginResult = await result.current.login('wrong@example.com', 'wrong');
      expect(loginResult.ok).toBe(false);
      expect(loginResult.error).toBe('invalid_credentials');
    });
  });
});
```

## 🌐 Testes E2E

### Configuração Playwright
```typescript
// playwright.config.ts
import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests/e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'html',
  use: {
    baseURL: 'http://localhost:5000',
    trace: 'on-first-retry',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    },
    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
    },
  ],
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:5000',
    reuseExistingServer: !process.env.CI,
  },
});
```

### Teste E2E
```typescript
// tests/e2e/auth.spec.ts
import { test, expect } from '@playwright/test';

test.describe('Authentication', () => {
  test('should login with Google', async ({ page }) => {
    await page.goto('/');
    
    // Click login button
    await page.click('text=Continuar com Google');
    
    // Should redirect to Google OAuth
    await expect(page).toHaveURL(/accounts\.google\.com/);
  });

  test('should show user profile after login', async ({ page }) => {
    // Mock successful authentication
    await page.addInitScript(() => {
      localStorage.setItem('worldshards-current-user', 'test@example.com');
    });

    await page.goto('/');
    
    // Should show user email
    await expect(page.locator('text=test@example.com')).toBeVisible();
  });

  test('should logout successfully', async ({ page }) => {
    // Mock authenticated user
    await page.addInitScript(() => {
      localStorage.setItem('worldshards-current-user', 'test@example.com');
    });

    await page.goto('/');
    
    // Click logout
    await page.click('[data-testid="logout-button"]');
    
    // Should clear user data
    await expect(page.locator('text=test@example.com')).not.toBeVisible();
  });
});
```

## 🧪 Testes de API

### Teste de Endpoints
```typescript
// tests/api/auth.test.ts
import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { setupTestServer } from '../test-utils';

describe('Auth API', () => {
  let server: any;

  beforeAll(async () => {
    server = await setupTestServer();
  });

  afterAll(async () => {
    await server.close();
  });

  it('should start Google OAuth flow', async () => {
    const response = await fetch('/api/auth/google/start');
    expect(response.status).toBe(302);
    expect(response.headers.get('location')).toContain('accounts.google.com');
  });

  it('should handle Google OAuth callback', async () => {
    const mockCode = 'mock-auth-code';
    const response = await fetch(`/api/auth/google/callback?code=${mockCode}`);
    expect(response.status).toBe(302);
    expect(response.headers.get('location')).toBe('/');
  });

  it('should return user info when authenticated', async () => {
    // Mock authenticated session
    const response = await fetch('/api/auth/me', {
      headers: {
        'Cookie': 'ps_session=mock-session-id'
      }
    });
    
    const data = await response.json();
    expect(data.user).toBeDefined();
  });

  it('should logout successfully', async () => {
    const response = await fetch('/api/auth/logout', {
      method: 'POST',
      headers: {
        'Cookie': 'ps_session=mock-session-id'
      }
    });
    
    expect(response.status).toBe(200);
    expect(response.headers.get('set-cookie')).toContain('ps_session=;');
  });
});
```

## 📊 Cobertura de Testes

### Configuração de Cobertura
```typescript
// vitest.config.ts
export default defineConfig({
  test: {
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: [
        'node_modules/',
        'src/test/',
        '**/*.d.ts',
        '**/*.config.*'
      ]
    }
  }
});
```

### Scripts de Teste
```json
{
  "scripts": {
    "test": "vitest",
    "test:ui": "vitest --ui",
    "test:coverage": "vitest --coverage",
    "test:e2e": "playwright test",
    "test:e2e:ui": "playwright test --ui",
    "test:all": "npm run test && npm run test:e2e"
  }
}
```

## 🔧 Ferramentas de Teste

### Desenvolvimento
- **Vitest**: Test runner
- **Testing Library**: Component testing
- **MSW**: API mocking
- **Playwright**: E2E testing

### CI/CD
- **GitHub Actions**: Automated testing
- **Coverage Reports**: Code coverage
- **Test Reports**: Test results
- **Performance Testing**: Load testing

## 📈 Métricas de Qualidade

### Cobertura Mínima
- **Statements**: 80%
- **Branches**: 75%
- **Functions**: 80%
- **Lines**: 80%

### Performance de Testes
- **Unit Tests**: <1s
- **Integration Tests**: <5s
- **E2E Tests**: <30s
- **Full Suite**: <2min

---

**Qualidade através de testes** 🧪