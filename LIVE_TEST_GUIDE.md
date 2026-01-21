# Guia de Teste ao Vivo - Plataforma de Aprendizado de Inglês

## 🚀 Servidores em Execução

- **Backend**: http://localhost:8000
- **Frontend**: http://localhost:3000
- **Materiais**: J:\Ingles\platform

## 👥 Credenciais de Teste

### Estudante
- **Usuário**: `student`
- **Senha**: `student123`
- **Email**: student@example.com
- **Tipo**: Estudante

### Professor
- **Usuário**: `tutor`
- **Senha**: `Maitland@2025`
- **Email**: test@gmail.com
- **Tipo**: Professor

## 📋 Teste como Estudante

### 1. Login
1. Acesse: http://localhost:3000/login
2. Use as credenciais do estudante
3. ✅ Deve redirecionar para `/dashboard`

### 2. Dashboard do Estudante
1. Acesse: http://localhost:3000/dashboard
2. ✅ Deve mostrar:
   - Estatísticas (cursos, aulas, materiais, completados)
   - Lista de cursos disponíveis
   - Progresso de cada curso
   - Materiais recentes

### 3. Visualizar Curso
1. Acesse: http://localhost:3000/courses/1
2. ✅ Deve mostrar:
   - Informações do curso
   - Índice do curso (se disponível)
   - Níveis do curso com materiais
   - Botão "Iniciar Aprendizado"

### 4. Interface de Aprendizado (Split View)
1. Acesse: http://localhost:3000/courses/1/learn
2. ✅ Deve mostrar:
   - **Sidebar esquerda**: Lista de níveis
   - **Topo**: Chips com materiais do nível selecionado
   - **Esquerda (60%)**: Visualizador de PDF
   - **Direita (40%)**: Player de áudio com controles
   - Lista de materiais no painel direito

### 5. Testar Funcionalidades
- ✅ Selecionar um nível na sidebar
- ✅ Selecionar um material (PDF + Áudio)
- ✅ PDF deve carregar na esquerda
- ✅ Áudio deve carregar na direita
- ✅ Controles de áudio funcionam (play/pause, volume, progresso)
- ✅ Navegação entre materiais (anterior/próximo)
- ✅ Marcação automática de materiais completados

### 6. Visualizar Material Individual
1. Acesse: http://localhost:3000/courses/1/materials/3/view
2. ✅ Deve mostrar o PDF carregado corretamente
3. ✅ Não deve permitir download (Content-Disposition: inline)

## 👨‍🏫 Teste como Professor

### 1. Login como Professor
1. Acesse: http://localhost:3000/login
2. Use as credenciais do professor
3. ✅ Deve redirecionar para `/dashboard`

### 2. Painel de Administração
1. Acesse: http://localhost:3000/admin
2. ✅ Deve mostrar:
   - Aba "Cursos" - gerenciar cursos
   - Aba "Níveis" - gerenciar níveis
   - Aba "Materiais" - gerenciar materiais
   - Aba "Upload" - fazer upload de arquivos

### 3. Gerenciar Cursos
- ✅ Criar novo curso
- ✅ Editar curso existente
- ✅ Excluir curso
- ✅ Associar materiais ao curso

### 4. Gerenciar Níveis
- ✅ Criar novo nível para um curso
- ✅ Editar nível
- ✅ Excluir nível
- ✅ Ver materiais associados ao nível

### 5. Upload de Materiais
1. Vá para a aba "Upload"
2. ✅ Selecionar curso
3. ✅ Selecionar nível (opcional)
4. ✅ Escolher arquivo (PDF, MP3, DOC, XLS, PPT, EXE, etc.)
5. ✅ Fazer upload
6. ✅ Material deve aparecer no curso/nível selecionado

### 6. Escanear Materiais
- ✅ Botão "Escanear Materiais" deve funcionar
- ✅ Deve escanear arquivos de J:\Ingles\platform
- ✅ Criar materiais automaticamente

## 📁 Estrutura de Materiais

### Diretório Base
- **Caminho**: `J:\Ingles\platform`
- ✅ Backend configurado para servir arquivos deste diretório

### Tipos de Arquivo Suportados
- ✅ PDF - Visualização inline
- ✅ MP3/WAV - Player de áudio
- ✅ DOC/DOCX - Visualização (se suportado pelo navegador)
- ✅ XLS/XLSX - Visualização (se suportado pelo navegador)
- ✅ PPT/PPTX - Visualização (se suportado pelo navegador)
- ✅ EXE - Execução na plataforma (com limitações)

## ✅ Checklist de Testes

### Estudante
- [ ] Login funciona
- [ ] Dashboard carrega com estatísticas
- [ ] Lista de cursos aparece
- [ ] Detalhes do curso carregam
- [ ] Níveis aparecem organizados
- [ ] Interface de aprendizado funciona
- [ ] PDF carrega corretamente
- [ ] Áudio carrega e reproduz
- [ ] Controles de áudio funcionam
- [ ] Navegação entre materiais funciona
- [ ] Progresso é salvo
- [ ] Materiais completados são marcados

### Professor
- [ ] Login funciona
- [ ] Painel admin acessível
- [ ] Criar curso funciona
- [ ] Criar nível funciona
- [ ] Upload de arquivo funciona
- [ ] Materiais aparecem após upload
- [ ] Escanear materiais funciona
- [ ] Associar materiais a cursos/níveis funciona

### Segurança
- [ ] Estudantes não podem baixar arquivos (inline apenas)
- [ ] Professores podem baixar arquivos
- [ ] Autenticação requerida para todos os endpoints
- [ ] Tokens JWT funcionam corretamente

## 🐛 Problemas Conhecidos e Soluções

### PDF não carrega
- Verifique se o backend está rodando
- Verifique se o arquivo existe em J:\Ingles\platform
- Verifique o console do navegador para erros

### Áudio não reproduz
- Verifique se o arquivo é MP3 ou WAV
- Verifique se o blob foi carregado corretamente
- Verifique o console do navegador

### Upload não funciona
- Verifique se o backend está rodando
- Verifique se o arquivo não excede o tamanho máximo
- Verifique os logs do backend

## 📊 Status dos Testes

### ✅ Testes de API Realizados
- Login estudante: ✅ SUCESSO
- Login professor: ✅ SUCESSO
- Listar cursos: ✅ SUCESSO
- Detalhes do curso: ✅ SUCESSO
- Material 3 encontrado: ✅ SUCESSO
- Acesso ao arquivo: ✅ SUCESSO

### 🎯 Próximos Passos
1. Testar interface completa no navegador
2. Verificar visualização de PDF em diferentes navegadores
3. Testar reprodução de áudio
4. Verificar upload de diferentes tipos de arquivo
5. Testar organização por níveis

## 🔗 Links Úteis

- **API Base**: http://localhost:8000/api
- **Documentação API**: http://localhost:8000/api/docs (se disponível)
- **Admin Django**: http://localhost:8000/admin
