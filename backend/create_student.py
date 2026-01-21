"""
Script para criar uma conta de estudante
"""
import os
import django
import sys

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'english_platform.settings')
django.setup()

from accounts.models import User, StudentProfile

def create_student():
    try:
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
            print(f'\n[OK] Estudante criado com sucesso!')
            print(f'  Usuário: {student.username}')
            print(f'  Senha: student123')
            print(f'  Email: {student.email}')
            print(f'  Nome: {student.first_name} {student.last_name}')
            print(f'  Tipo: {student.get_user_type_display()}')
        else:
            # Update password if user already exists
            student.set_password('student123')
            student.save()
            print(f'\n[INFO] Estudante já existe. Senha atualizada.')
            print(f'  Usuário: {student.username}')
            print(f'  Senha: student123')
            print(f'  Email: {student.email}')
            print(f'  Nome: {student.first_name} {student.last_name}')
            
    except Exception as e:
        print(f'\n[ERRO] Erro ao criar estudante: {e}')
        import traceback
        traceback.print_exc()

if __name__ == '__main__':
    create_student()
