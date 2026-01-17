"""
Script para resetar a senha do usuário tutor
"""
import os
import django
import sys

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'english_platform.settings')
django.setup()

from accounts.models import User
from django.contrib.auth import authenticate

def reset_tutor_password():
    try:
        user = User.objects.get(username='tutor')
        print(f"Usuário encontrado: {user.username}")
        print(f"Tipo: {user.user_type}")
        print(f"Email: {user.email}")
        
        # Test current password
        test = authenticate(username='tutor', password='Maitland@2025')
        if test is not None:
            print("\n[OK] Senha atual está correta!")
            print("O login deve funcionar. Verifique se o backend está rodando.")
        else:
            print("\n[INFO] Senha atual não está correta. Resetando senha...")
            user.set_password('Maitland@2025')
            user.save()
            print("[OK] Senha resetada para: Maitland@2025")
            
            # Test new password
            test2 = authenticate(username='tutor', password='Maitland@2025')
            if test2 is not None:
                print("[OK] Autenticação funcionando após reset!")
            else:
                print("[ERRO] Ainda há problema com a autenticação")
                
    except User.DoesNotExist:
        print("[ERRO] Usuário 'tutor' não encontrado!")
        print("Criando usuário tutor...")
        user = User.objects.create_user(
            username='tutor',
            email='tutor@example.com',
            password='Maitland@2025',
            first_name='Tutor',
            last_name='Maitland',
            user_type='teacher',
        )
        from accounts.models import TeacherProfile
        TeacherProfile.objects.create(user=user)
        print("[OK] Usuário tutor criado com sucesso!")
        print("  Username: tutor")
        print("  Password: Maitland@2025")
        print("  Tipo: teacher")
    except Exception as e:
        print(f"[ERRO] Erro ao processar: {e}")
        import traceback
        traceback.print_exc()

if __name__ == '__main__':
    reset_tutor_password()
