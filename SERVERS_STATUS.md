# Status dos Servidores

## Servidores Iniciados

### ✅ Backend Django
- **Status:** RODANDO
- **URL:** http://localhost:8000
- **API:** http://localhost:8000/api
- **Admin:** http://localhost:8000/admin
- **Porta:** 8000

### ✅ Frontend Next.js
- **Status:** RODANDO
- **URL:** http://localhost:3000
- **Login:** http://localhost:3000/login
- **Dashboard:** http://localhost:3000/dashboard
- **Admin:** http://localhost:3000/admin (apenas professores)
- **Porta:** 3000

### ✅ Mobile App (Expo)
- **Status:** INICIANDO
- **Comando:** `npm start` (no diretório mobile)
- **QR Code:** Aparecerá na janela do terminal
- **Porta:** Variável (gerenciada pelo Expo)

## Como Acessar

### Web Application
1. Abra seu navegador
2. Acesse: **http://localhost:3000**
3. Clique em "Entrar" ou acesse diretamente: **http://localhost:3000/login**
4. Use as credenciais:
   - **Estudante:** `student` / `student123`
   - **Professor:** `teacher` / `teacher123`

### Mobile App
1. Instale o app **Expo Go** no seu celular
2. Abra o app Expo Go
3. Escaneie o QR code que aparece na janela do terminal
4. O app será carregado no seu dispositivo

## Endpoints da API

### Autenticação
- `POST /api/auth/register/` - Registrar novo usuário
- `POST /api/auth/login/` - Fazer login
- `GET /api/auth/me/` - Obter informações do usuário atual
- `POST /api/auth/refresh/` - Renovar token

### Cursos
- `GET /api/courses/` - Lista de cursos
- `GET /api/courses/{id}/` - Detalhes do curso
- `POST /api/courses/` - Criar curso (autenticado)
- `DELETE /api/courses/{id}/` - Deletar curso (autenticado)

### Materiais
- `GET /api/materials/` - Lista de materiais
- `GET /api/materials/{id}/file/` - Baixar material
- `PATCH /api/materials/{id}/` - Associar material a curso
- `GET /api/materials/scan_materials/` - Escanear materiais (autenticado)

## Comandos Úteis

### Parar Servidores
```powershell
# Parar Backend
Get-Process | Where-Object {$_.ProcessName -eq "python"} | Stop-Process

# Parar Frontend
Get-Process | Where-Object {$_.ProcessName -eq "node"} | Stop-Process
```

### Reiniciar Servidores
```powershell
# Backend
cd backend
python manage.py runserver

# Frontend
cd frontend
npm run dev

# Mobile
cd mobile
npm start
```

## Troubleshooting

### Backend não responde
- Verifique se a porta 8000 está livre
- Verifique se há erros na janela do terminal do backend
- Tente acessar: http://localhost:8000/admin

### Frontend não carrega
- Aguarde 10-20 segundos (Next.js pode demorar para compilar)
- Verifique se a porta 3000 está livre
- Verifique se há erros na janela do terminal do frontend

### Mobile não conecta
- Certifique-se de que o backend está rodando
- Verifique o IP do servidor em `mobile/App.tsx`
- Certifique-se de que o dispositivo está na mesma rede

## Logs

Os logs de cada servidor aparecem nas respectivas janelas do terminal:
- **Backend:** Mostra requisições HTTP e erros do Django
- **Frontend:** Mostra compilação do Next.js e erros
- **Mobile:** Mostra QR code e status do Expo
