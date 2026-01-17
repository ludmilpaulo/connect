# Usuários de Teste Criados

## Credenciais de Acesso

### Estudante
- **Usuário:** `student`
- **Senha:** `student123`
- **Email:** `student@example.com`
- **Nome:** João Silva
- **Tipo:** Estudante

### Professor
- **Usuário:** `teacher`
- **Senha:** `teacher123`
- **Email:** `teacher@example.com`
- **Nome:** Maria Santos
- **Tipo:** Professor

## Como Testar

### 1. Via Interface Web (Frontend)

1. Acesse `http://localhost:3000/login`
2. Use as credenciais acima para fazer login
3. Teste as funcionalidades:
   - **Estudante:** Pode ver cursos, dashboard, materiais
   - **Professor:** Pode ver cursos, dashboard, materiais E acessar painel admin

### 2. Via API (Backend)

#### Login do Estudante
```bash
curl -X POST http://localhost:8000/api/auth/login/ \
  -H "Content-Type: application/json" \
  -d '{"username": "student", "password": "student123"}'
```

#### Login do Professor
```bash
curl -X POST http://localhost:8000/api/auth/login/ \
  -H "Content-Type: application/json" \
  -d '{"username": "teacher", "password": "teacher123"}'
```

#### Acessar Endpoint Protegido
```bash
# Use o token retornado no login
curl -X GET http://localhost:8000/api/auth/me/ \
  -H "Authorization: Bearer SEU_TOKEN_AQUI"
```

## Endpoints de Autenticação

- `POST /api/auth/register/` - Registrar novo usuário
- `POST /api/auth/login/` - Fazer login
- `GET /api/auth/me/` - Obter informações do usuário atual (requer autenticação)
- `POST /api/auth/refresh/` - Renovar token de acesso

## Permissões

- **Estudante:** Pode ler cursos e materiais, acessar dashboard
- **Professor:** Pode ler e criar/editar cursos e materiais, acessar painel admin
- **Admin:** Acesso total ao sistema
