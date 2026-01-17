from rest_framework import serializers
from .models import Course, Lesson, Material, Level


class MaterialSerializer(serializers.ModelSerializer):
    file_url = serializers.SerializerMethodField()
    course_id = serializers.IntegerField(source='course.id', read_only=True)
    course_title = serializers.CharField(source='course.title', read_only=True)
    level_id = serializers.IntegerField(source='level.id', read_only=True)
    level_title = serializers.CharField(source='level.title', read_only=True)
    
    class Meta:
        model = Material
        fields = ['id', 'title', 'material_type', 'file_url', 'file_size', 'duration', 'order', 
                  'course', 'course_id', 'course_title', 'level', 'level_id', 'level_title', 
                  'file_path', 'file', 'created_at']
        read_only_fields = ['title', 'material_type', 'file_size', 'file_path', 'created_at']
    
    def get_file_url(self, obj):
        request = self.context.get('request')
        if request:
            from django.urls import reverse
            url = reverse('material-file', kwargs={'pk': obj.pk})
            return request.build_absolute_uri(url)
        return None


class LevelSerializer(serializers.ModelSerializer):
    materials = MaterialSerializer(many=True, read_only=True)
    materials_count = serializers.SerializerMethodField()
    course_id = serializers.IntegerField(source='course.id', read_only=True)
    course_title = serializers.CharField(source='course.title', read_only=True)
    
    class Meta:
        model = Level
        fields = ['id', 'title', 'description', 'level_number', 'order', 'course', 'course_id', 'course_title', 'materials', 'materials_count', 'created_at']
    
    def get_materials_count(self, obj):
        return obj.materials.count()


class LessonSerializer(serializers.ModelSerializer):
    materials = MaterialSerializer(many=True, read_only=True)
    
    class Meta:
        model = Lesson
        fields = ['id', 'title', 'description', 'order', 'materials']


class CourseSerializer(serializers.ModelSerializer):
    lessons = LessonSerializer(many=True, read_only=True)
    materials = MaterialSerializer(many=True, read_only=True)
    levels = LevelSerializer(many=True, read_only=True)
    level_display = serializers.CharField(source='get_level_display', read_only=True)
    
    class Meta:
        model = Course
        fields = ['id', 'title', 'description', 'thumbnail', 'level', 'level_display', 
                  'table_of_contents', 'created_at', 'updated_at', 'lessons', 'materials', 'levels']


class CourseListSerializer(serializers.ModelSerializer):
    level_display = serializers.CharField(source='get_level_display', read_only=True)
    materials_count = serializers.SerializerMethodField()
    levels_count = serializers.SerializerMethodField()
    
    class Meta:
        model = Course
        fields = ['id', 'title', 'description', 'thumbnail', 'level', 'level_display', 
                  'materials_count', 'levels_count', 'created_at']
    
    def get_materials_count(self, obj):
        return obj.materials.count()
    
    def get_levels_count(self, obj):
        return obj.levels.count()
