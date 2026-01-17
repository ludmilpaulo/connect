# English Learning Platform

A comprehensive platform for learning English built with Django (backend), Next.js (web frontend), and React Native (mobile app).

## Features

- **Course Management**: Organize English learning materials into courses and lessons
- **Multiple Material Types**: Support for PDFs, MP3 audio files, videos, and images
- **Web Platform**: Modern Next.js frontend for web browsers
- **Mobile App**: React Native mobile application for iOS and Android
- **RESTful API**: Django REST Framework API for accessing materials

## Project Structure

```
.
├── backend/          # Django backend API
├── frontend/         # Next.js web frontend
├── mobile/           # React Native mobile app
└── README.md
```

## Materials Location

The platform reads materials from: `J:\Ingles\platform`

This directory contains:
- `CURSO DE INGLES/` - Course materials with PDFs and CD folders
- `Curso de Inglês Wizard em mp3/` - MP3 audio lessons
- `curso Ingles.exe` - Executable (content accessible via the platform)

## Setup Instructions

### Backend (Django)

1. Navigate to the backend directory:
```bash
cd backend
```

2. Create a virtual environment (recommended):
```bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

3. Install dependencies:
```bash
pip install -r requirements.txt
```

4. Run migrations:
```bash
python manage.py migrate
```

5. Create a superuser:
```bash
python manage.py createsuperuser
```

6. Scan materials directory (optional):
```bash
python manage.py scan_materials
```

7. Run the development server:
```bash
python manage.py runserver
```

The API will be available at `http://localhost:8000/api/`
Admin panel: `http://localhost:8000/admin/`

### Frontend (Next.js)

1. Navigate to the frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Create `.env.local` file:
```
NEXT_PUBLIC_API_URL=http://localhost:8000/api
```

4. Run the development server:
```bash
npm run dev
```

The web app will be available at `http://localhost:3000`

### Mobile (React Native)

1. Navigate to the mobile directory:
```bash
cd mobile
```

2. Install dependencies:
```bash
npm install
```

3. Update `App.tsx` to set the correct API_BASE_URL:
```typescript
const API_BASE_URL = 'http://YOUR_IP:8000/api'; // Replace with your computer's IP
```

4. Run the app:
```bash
npm start
# or
npm run android  # For Android
npm run ios      # For iOS
```

## Usage

### Accessing Materials via Web

1. Start the Django backend server
2. Start the Next.js frontend server
3. Open `http://localhost:3000` in your browser
4. Browse courses and click on materials to view/open them

### Creating Courses and Lessons

1. Access the Django admin panel at `http://localhost:8000/admin/`
2. Log in with your superuser credentials
3. Create Courses, Lessons, and link Materials

### Scanning Materials Automatically

The platform can automatically scan the materials directory:

**Via Management Command:**
```bash
cd backend
python manage.py scan_materials
```

**Via API Endpoint:**
```bash
GET http://localhost:8000/api/materials/scan_materials/
```

## API Endpoints

- `GET /api/courses/` - List all courses
- `GET /api/courses/{id}/` - Get course details with lessons and materials
- `GET /api/lessons/` - List all lessons
- `GET /api/materials/` - List all materials
- `GET /api/materials/{id}/file/` - Download/view material file
- `GET /api/materials/scan_materials/` - Scan materials directory

## Technology Stack

- **Backend**: Django 4.2, Django REST Framework
- **Web Frontend**: Next.js 14, React 18, Material-UI
- **Mobile**: React Native, Expo, React Native Paper
- **Database**: SQLite (default, can be changed to PostgreSQL/MySQL)

## Notes

- Make sure the materials directory path `J:\Ingles\platform` exists and is accessible
- For mobile app, update the API_BASE_URL with your computer's local IP address
- The platform supports PDF, MP3, MP4, JPG, JPEG, and PNG file types
- Materials can be organized by course and lesson, or used standalone

## License

This project is for educational purposes.
