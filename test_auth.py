"""
Script para testar a autenticação
"""
import requests
import json

API_BASE_URL = 'http://localhost:8000/api'

def test_login(username, password, user_type):
    print(f"\n{'='*60}")
    print(f"Testando login como {user_type.upper()}")
    print(f"{'='*60}")
    
    response = requests.post(f'{API_BASE_URL}/auth/login/', json={
        'username': username,
        'password': password
    })
    
    if response.status_code == 200:
        data = response.json()
        print(f"✅ Login bem-sucedido!")
        print(f"   Usuário: {data['user']['username']}")
        print(f"   Tipo: {data['user']['user_type']}")
        print(f"   Nome: {data['user']['first_name']} {data['user']['last_name']}")
        print(f"   Token recebido: {'Sim' if data['tokens']['access'] else 'Não'}")
        return data['tokens']['access']
    else:
        print(f"❌ Erro no login: {response.status_code}")
        print(f"   Resposta: {response.text}")
        return None

def test_protected_endpoint(token, endpoint_name, endpoint_url):
    print(f"\n🔒 Testando endpoint protegido: {endpoint_name}")
    headers = {'Authorization': f'Bearer {token}'}
    response = requests.get(endpoint_url, headers=headers)
    
    if response.status_code == 200:
        print(f"✅ Acesso permitido ao {endpoint_name}")
        return True
    else:
        print(f"❌ Acesso negado ao {endpoint_name}: {response.status_code}")
        return False

def test_register():
    print(f"\n{'='*60}")
    print("Testando registro de novo usuário")
    print(f"{'='*60}")
    
    response = requests.post(f'{API_BASE_URL}/auth/register/', json={
        'username': 'testuser',
        'email': 'testuser@example.com',
        'password': 'test123456',
        'password_confirm': 'test123456',
        'first_name': 'Test',
        'last_name': 'User',
        'user_type': 'student'
    })
    
    if response.status_code == 201:
        print(f"✅ Registro bem-sucedido!")
        print(f"   Usuário criado: {response.json()['user']['username']}")
        return True
    else:
        print(f"❌ Erro no registro: {response.status_code}")
        print(f"   Resposta: {response.text}")
        return False

def main():
    print("\n" + "="*60)
    print("TESTE DE AUTENTICAÇÃO - Plataforma de Inglês")
    print("="*60)
    
    # Testar login do estudante
    student_token = test_login('student', 'student123', 'estudante')
    
    # Testar login do professor
    teacher_token = test_login('teacher', 'teacher123', 'professor')
    
    # Testar endpoints protegidos com token do estudante
    if student_token:
        print(f"\n{'='*60}")
        print("Testando endpoints com token de ESTUDANTE")
        print(f"{'='*60}")
        test_protected_endpoint(student_token, 'Lista de Cursos', f'{API_BASE_URL}/courses/')
        test_protected_endpoint(student_token, 'Meu Perfil', f'{API_BASE_URL}/auth/me/')
    
    # Testar endpoints protegidos com token do professor
    if teacher_token:
        print(f"\n{'='*60}")
        print("Testando endpoints com token de PROFESSOR")
        print(f"{'='*60}")
        test_protected_endpoint(teacher_token, 'Lista de Cursos', f'{API_BASE_URL}/courses/')
        test_protected_endpoint(teacher_token, 'Meu Perfil', f'{API_BASE_URL}/auth/me/')
        test_protected_endpoint(teacher_token, 'Lista de Materiais', f'{API_BASE_URL}/materials/')
    
    # Testar registro
    test_register()
    
    print(f"\n{'='*60}")
    print("Testes concluídos!")
    print(f"{'='*60}\n")

if __name__ == '__main__':
    try:
        main()
    except requests.exceptions.ConnectionError:
        print("\n❌ ERRO: Não foi possível conectar ao servidor Django.")
        print("   Certifique-se de que o servidor está rodando em http://localhost:8000")
        print("   Execute: cd backend && python manage.py runserver")
    except Exception as e:
        print(f"\n❌ Erro inesperado: {e}")
