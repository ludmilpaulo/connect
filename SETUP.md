# Quick Setup Guide

## Prerequisites

- Python 3.8+ (for Django backend)
- Node.js 16+ and npm (for Next.js and React Native)
- Materials directory at `J:\Ingles\platform`

## Step-by-Step Setup

### 1. Backend (Django)

```bash
cd backend
python -m venv venv
venv\Scripts\activate  # On Windows PowerShell
pip install -r requirements.txt
python manage.py migrate
python manage.py createsuperuser
python manage.py scan_materials  # Scans J:\Ingles\platform
python manage.py runserver
```

Backend will run at: `http://localhost:8000`

### 2. Frontend (Next.js)

Open a new terminal:

```bash
cd frontend
npm install
# Create .env.local with: NEXT_PUBLIC_API_URL=http://localhost:8000/api
npm run dev
```

Frontend will run at: `http://localhost:3000`

### 3. Mobile (React Native) - Optional

Open another terminal:

```bash
cd mobile
npm install
# Update API_BASE_URL in App.tsx to your computer's IP
npm start
```

## Access Points

- **Web App**: http://localhost:3000
- **API**: http://localhost:8000/api
- **Admin Panel**: http://localhost:8000/admin
- **API Docs**: http://localhost:8000/api/courses/

## First Steps

1. Start the Django backend
2. Visit `http://localhost:8000/admin` and log in
3. Create a Course in the admin panel
4. Optionally create Lessons and link Materials
5. Or use `python manage.py scan_materials` to auto-create materials from files
6. Start the Next.js frontend
7. Visit `http://localhost:3000` to browse courses

## Troubleshooting

- **Materials not showing**: Run `python manage.py scan_materials`
- **CORS errors**: Make sure `django-cors-headers` is installed and CORS settings are configured
- **Mobile app can't connect**: Update `API_BASE_URL` in `mobile/App.tsx` with your computer's local IP address

## Usuários de Teste

Foram criados 2 usuários de teste:

**Estudante:**
- Usuário: `student`
- Senha: `student123`

**Professor:**
- Usuário: `teacher`
- Senha: `teacher123`

Para criar novos usuários de teste, execute:
```bash
cd backend
python create_test_users.py
```

Veja mais detalhes em `TEST_USERS.md`
