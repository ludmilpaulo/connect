from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticatedOrReadOnly, IsAuthenticated, IsAdminUser
from rest_framework.parsers import MultiPartParser, FormParser
from django.http import FileResponse, Http404
from django.conf import settings
from django.core.files.storage import default_storage
from django.core.files.base import ContentFile
import os
from .models import Course, Lesson, Material, Level
from .serializers import CourseSerializer, CourseListSerializer, LessonSerializer, MaterialSerializer, LevelSerializer


class CourseViewSet(viewsets.ModelViewSet):
    queryset = Course.objects.all()
    permission_classes = [IsAuthenticatedOrReadOnly]
    
    def get_serializer_class(self):
        if self.action == 'list':
            return CourseListSerializer
        return CourseSerializer
    
    def get_queryset(self):
        queryset = Course.objects.all()
        return queryset
    
    def get_permissions(self):
        """
        Instantiates and returns the list of permissions that this view requires.
        """
        if self.action in ['create', 'update', 'partial_update', 'destroy']:
            permission_classes = [IsAuthenticated]  # Teachers and admins can create/edit
        else:
            permission_classes = [IsAuthenticatedOrReadOnly]
        return [permission() for permission in permission_classes]


class LessonViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Lesson.objects.all()
    serializer_class = LessonSerializer


class LevelViewSet(viewsets.ModelViewSet):
    queryset = Level.objects.all()
    serializer_class = LevelSerializer
    permission_classes = [IsAuthenticatedOrReadOnly]
    
    def get_queryset(self):
        queryset = Level.objects.all()
        course = self.request.query_params.get('course', None)
        if course:
            queryset = queryset.filter(course=course)
        return queryset
    
    def get_permissions(self):
        if self.action in ['create', 'update', 'partial_update', 'destroy']:
            permission_classes = [IsAuthenticated]  # Only teachers/admins can manage levels
        else:
            permission_classes = [IsAuthenticatedOrReadOnly]
        return [permission() for permission in permission_classes]


class MaterialViewSet(viewsets.ModelViewSet):
    queryset = Material.objects.all()
    serializer_class = MaterialSerializer
    permission_classes = [IsAuthenticatedOrReadOnly]
    parser_classes = [MultiPartParser, FormParser]
    
    def get_queryset(self):
        queryset = Material.objects.all()
        course = self.request.query_params.get('course', None)
        level = self.request.query_params.get('level', None)
        if course:
            queryset = queryset.filter(course=course)
        if level:
            queryset = queryset.filter(level=level)
        return queryset
    
    def get_permissions(self):
        """
        Instantiates and returns the list of permissions that this view requires.
        """
        if self.action in ['create', 'update', 'partial_update', 'destroy', 'scan_materials', 'upload']:
            permission_classes = [IsAuthenticated]  # Only authenticated users can manage materials
        elif self.action == 'file':
            permission_classes = [IsAuthenticatedOrReadOnly]
        else:
            permission_classes = [IsAuthenticatedOrReadOnly]
        return [permission() for permission in permission_classes]
    
    def perform_create(self, serializer):
        # Check if user is teacher or admin
        user = self.request.user
        if user.user_type not in ['teacher', 'admin']:
            from rest_framework.exceptions import PermissionDenied
            raise PermissionDenied("Apenas professores e administradores podem criar materiais.")
        serializer.save()
    
    @action(detail=True, methods=['get'])
    def file(self, request, pk=None):
        """Serve the material file"""
        try:
            material = self.get_object()
            file_path = material.get_full_path()
            
            if not file_path or not os.path.exists(file_path):
                raise Http404("File not found")
            
            # Determine content type based on file extension
            content_type_map = {
                '.pdf': 'application/pdf',
                '.mp3': 'audio/mpeg',
                '.wav': 'audio/wav',
                '.mp4': 'video/mp4',
                '.avi': 'video/x-msvideo',
                '.mov': 'video/quicktime',
                '.jpg': 'image/jpeg',
                '.jpeg': 'image/jpeg',
                '.png': 'image/png',
                '.gif': 'image/gif',
                '.exe': 'application/x-msdownload',
                '.zip': 'application/zip',
                '.doc': 'application/msword',
                '.docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
                '.xls': 'application/vnd.ms-excel',
                '.xlsx': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
                '.ppt': 'application/vnd.ms-powerpoint',
                '.pptx': 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
            }
            
            ext = os.path.splitext(file_path)[1].lower()
            content_type = content_type_map.get(ext, 'application/octet-stream')
            
            # Open file in binary mode and create response
            with open(file_path, 'rb') as f:
                response = FileResponse(f, content_type=content_type)
                filename = os.path.basename(file_path)
                
                # Always use inline to prevent download - files should be viewed in platform
                # Check user type - only students should have download disabled
                user = request.user
                is_student = hasattr(user, 'user_type') and user.user_type == 'student'
                
                if is_student:
                    # For students: force inline viewing for most files, but allow .exe to be executable
                    if ext == '.exe':
                        # For .exe files, use inline so they can be executed in the platform
                        response['Content-Disposition'] = f'inline; filename="{filename}"'
                    else:
                        # For other files: force inline viewing, prevent download
                        response['Content-Disposition'] = f'inline; filename="{filename}"'
                        # Prevent download via right-click and other methods
                        response['X-Content-Type-Options'] = 'nosniff'
                        response['Content-Security-Policy'] = "default-src 'self'"
                else:
                    # For teachers/admins: allow normal access
                    if ext in ['.zip']:
                        response['Content-Disposition'] = f'attachment; filename="{filename}"'
                    else:
                        response['Content-Disposition'] = f'inline; filename="{filename}"'
                
                # Add headers for viewing in iframe/embed
                response['Access-Control-Allow-Origin'] = '*'
                response['Access-Control-Allow-Methods'] = 'GET, OPTIONS'
                response['Access-Control-Allow-Headers'] = 'Content-Type, Authorization'
                
                # Additional headers for specific file types
                if ext == '.pdf':
                    response['Content-Type'] = 'application/pdf'
                    response['Accept-Ranges'] = 'bytes'
                elif ext in ['.mp3', '.wav']:
                    response['Accept-Ranges'] = 'bytes'
                    response['Content-Type'] = content_type
                
                return response
            
        except Material.DoesNotExist:
            raise Http404("Material not found")
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
    @action(detail=False, methods=['post'])
    def upload(self, request):
        """Upload a new material file"""
        try:
            # Check if user is teacher or admin
            if request.user.user_type not in ['teacher', 'admin']:
                return Response(
                    {'error': 'Apenas professores e administradores podem fazer upload de materiais.'},
                    status=status.HTTP_403_FORBIDDEN
                )
            
            if 'file' not in request.FILES:
                return Response(
                    {'error': 'Nenhum arquivo fornecido.'},
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            uploaded_file = request.FILES['file']
            course_id = request.data.get('course')
            level_id = request.data.get('level')
            title = request.data.get('title', uploaded_file.name)
            order = request.data.get('order', 0)
            
            if not course_id:
                return Response(
                    {'error': 'ID do curso é obrigatório.'},
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            try:
                course = Course.objects.get(pk=course_id)
            except Course.DoesNotExist:
                return Response(
                    {'error': 'Curso não encontrado.'},
                    status=status.HTTP_404_NOT_FOUND
                )
            
            level = None
            if level_id:
                try:
                    level = Level.objects.get(pk=level_id, course=course)
                except Level.DoesNotExist:
                    return Response(
                        {'error': 'Nível não encontrado.'},
                        status=status.HTTP_404_NOT_FOUND
                    )
            
            # Create material
            material = Material.objects.create(
                course=course,
                level=level,
                title=title,
                file=uploaded_file,
                order=order
            )
            
            serializer = MaterialSerializer(material, context={'request': request})
            return Response(serializer.data, status=status.HTTP_201_CREATED)
            
        except Exception as e:
            return Response(
                {'error': str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
    
    @action(detail=False, methods=['get'])
    def scan_materials(self, request):
        """Scan the materials directory and create Material objects"""
        materials_root = settings.MATERIALS_ROOT
        
        if not os.path.exists(materials_root):
            return Response({'error': 'Materials directory not found'}, 
                          status=status.HTTP_404_NOT_FOUND)
        
        created_count = 0
        
        # Walk through the directory structure
        for root, dirs, files in os.walk(materials_root):
            for file in files:
                if file.lower().endswith(('.pdf', '.mp3', '.mp4', '.jpg', '.jpeg', '.png')):
                    file_path = os.path.join(root, file)
                    relative_path = os.path.relpath(file_path, materials_root)
                    
                    # Determine material type
                    ext = os.path.splitext(file)[1].lower()
                    material_type_map = {
                        '.pdf': 'pdf',
                        '.mp3': 'mp3',
                        '.mp4': 'video',
                        '.jpg': 'image',
                        '.jpeg': 'image',
                        '.png': 'image',
                    }
                    material_type = material_type_map.get(ext, 'other')
                    
                    # Check if material already exists
                    if not Material.objects.filter(file_path=relative_path).exists():
                        Material.objects.create(
                            title=file,
                            file_path=relative_path,
                            material_type=material_type,
                            file_size=os.path.getsize(file_path) if os.path.exists(file_path) else None
                        )
                        created_count += 1
        
        return Response({'message': f'Scan completed. Created {created_count} new materials.'})
