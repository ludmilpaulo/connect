# Django Backend - English Learning Platform

## Setup

1. Install dependencies:
```bash
pip install -r requirements.txt
```

2. Run migrations:
```bash
python manage.py migrate
```

3. Create superuser:
```bash
python manage.py createsuperuser
```

4. Scan materials (optional):
```bash
python manage.py scan_materials
```

5. Run server:
```bash
python manage.py runserver
```

## API Endpoints

- `/api/courses/` - List courses
- `/api/courses/{id}/` - Course details
- `/api/materials/{id}/file/` - Get material file
- `/api/materials/scan_materials/` - Scan materials directory

## Configuration

Materials are read from: `J:\Ingles\platform`

To change this, update `MATERIALS_ROOT` in `english_platform/settings.py`
