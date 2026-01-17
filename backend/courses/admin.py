from django.contrib import admin
from .models import Course, Lesson, Material, Level


@admin.register(Course)
class CourseAdmin(admin.ModelAdmin):
    list_display = ['title', 'level', 'created_at']
    list_filter = ['level', 'created_at']
    search_fields = ['title', 'description']
    readonly_fields = ['created_at', 'updated_at']


@admin.register(Level)
class LevelAdmin(admin.ModelAdmin):
    list_display = ['title', 'course', 'level_number', 'order']
    list_filter = ['course']
    search_fields = ['title', 'description']
    ordering = ['course', 'level_number', 'order']


@admin.register(Lesson)
class LessonAdmin(admin.ModelAdmin):
    list_display = ['title', 'course', 'order']
    list_filter = ['course']
    search_fields = ['title', 'description']


@admin.register(Material)
class MaterialAdmin(admin.ModelAdmin):
    list_display = ['title', 'material_type', 'course', 'level', 'lesson', 'order']
    list_filter = ['material_type', 'course', 'level']
    search_fields = ['title', 'file_path']
    readonly_fields = ['created_at']