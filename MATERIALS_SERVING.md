# Como os Materiais São Servidos - Plataforma Online

## Configuração Atual

Os materiais são servidos **exclusivamente através do backend Django**, tornando a plataforma adequada para uso online.

## Fluxo de Servimento de Materiais

### 1. Armazenamento
- **Localização**: Os arquivos físicos estão em `J:\Ingles\platform`
- **Banco de Dados**: Os metadados dos materiais são armazenados no banco de dados Django
- **URLs**: Os materiais são acessados através da API do Django, não diretamente pelo sistema de arquivos

### 2. Endpoint da API

**URL do Material**: `http://localhost:8000/api/materials/{id}/file/`

Este endpoint:
- Busca o material no banco de dados pelo ID
- Lê o arquivo físico de `J:\Ingles\platform` usando o caminho armazenado
- Serve o arquivo com o content-type apropriado (PDF, MP3, etc.)
- Retorna o arquivo via HTTP response

### 3. Serializador

O `MaterialSerializer` automaticamente gera URLs completas:
```python
def get_file_url(self, obj):
    request = self.context.get('request')
    if request:
        url = reverse('material-file', kwargs={'pk': obj.pk})
        return request.build_absolute_uri(url)  # Retorna URL completa
    return None
```

### 4. Frontend

O frontend usa a URL retornada pelo backend diretamente:
```typescript
href={material.file_url || `${API_BASE_URL}/materials/${material.id}/file/`}
```

## Vantagens desta Abordagem

✅ **Segurança**: Arquivos não são acessíveis diretamente por URL do sistema de arquivos
✅ **Controle**: Backend pode adicionar autenticação, logs, rate limiting, etc.
✅ **Online**: Funciona perfeitamente em ambiente de produção/servidor
✅ **Flexibilidade**: Pode servir arquivos de qualquer localização (local, S3, CDN, etc.)
✅ **Metadados**: Informações do material vêm do banco de dados

## Estrutura de URLs

### API Endpoints:
- `GET /api/courses/` - Lista cursos
- `GET /api/courses/{id}/` - Detalhes do curso (com materiais)
- `GET /api/materials/` - Lista materiais
- `GET /api/materials/{id}/file/` - **Serve o arquivo do material**

### Exemplo de Resposta da API:

```json
{
  "id": 1,
  "title": "Wizard - 01.mp3",
  "material_type": "mp3",
  "file_url": "http://localhost:8000/api/materials/1/file/",
  "file_size": 5242880,
  "file_path": "Curso de Inglês Wizard em mp3\\Wizard - 01.mp3"
}
```

O `file_url` é uma URL completa e acessível publicamente (ou através de autenticação, se configurada).

## Configuração para Produção

### Em Produção:

1. **Materiais em Servidor**:
   - Os arquivos devem estar no servidor onde o Django roda
   - O caminho `J:\Ingles\platform` pode ser alterado para qualquer diretório
   - Configure `MATERIALS_ROOT` em `settings.py`

2. **URLs Públicas**:
   - Certifique-se de que o Django pode acessar os arquivos
   - Configure CORS se necessário
   - Use HTTPS em produção

3. **Permissões**:
   - Django precisa ter permissão de leitura no diretório de materiais
   - Arquivos devem estar acessíveis ao processo do Django

## Migração para Outros Armazenamentos

Se no futuro precisar usar S3, CDN, etc.:

1. Modifique apenas o método `file()` em `MaterialViewSet`
2. O resto da aplicação continua funcionando igual
3. URLs e serializadores permanecem os mesmos

## Resumo

✅ **Todos os materiais são servidos através do Django backend**
✅ **URLs são geradas dinamicamente pelo backend**
✅ **Frontend apenas usa as URLs fornecidas pelo backend**
✅ **Plataforma totalmente online e pronta para produção**
