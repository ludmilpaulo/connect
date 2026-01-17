"""
Script para criar usuários de teste (estudante e professor)
"""
import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'english_platform.settings')
django.setup()

from accounts.models import User, StudentProfile, TeacherProfile

def create_test_users():
    # Criar estudante
    student, created = User.objects.get_or_create(
        username='student',
        defaults={
            'email': 'student@example.com',
            'first_name': 'João',
            'last_name': 'Silva',
            'user_type': 'student',
        }
    )
    if created:
        student.set_password('student123')
        student.save()
        StudentProfile.objects.create(user=student)
        print(f"[OK] Estudante criado: {student.username} / senha: student123")
    else:
        print(f"[INFO] Estudante ja existe: {student.username}")
    
    # Criar professor
    teacher, created = User.objects.get_or_create(
        username='teacher',
        defaults={
            'email': 'teacher@example.com',
            'first_name': 'Maria',
            'last_name': 'Santos',
            'user_type': 'teacher',
        }
    )
    if created:
        teacher.set_password('teacher123')
        teacher.save()
        TeacherProfile.objects.create(user=teacher)
        print(f"[OK] Professor criado: {teacher.username} / senha: teacher123")
    else:
        print(f"[INFO] Professor ja existe: {teacher.username}")
    
    print("\nCredenciais de teste:")
    print("=" * 50)
    print("ESTUDANTE:")
    print("  Usuário: student")
    print("  Senha: student123")
    print("  Email: student@example.com")
    print("\nPROFESSOR:")
    print("  Usuário: teacher")
    print("  Senha: teacher123")
    print("  Email: teacher@example.com")
    print("=" * 50)

if __name__ == '__main__':
    create_test_users()
