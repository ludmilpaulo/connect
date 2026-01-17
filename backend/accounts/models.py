from django.contrib.auth.models import AbstractUser
from django.db import models


class User(AbstractUser):
    USER_TYPE_CHOICES = [
        ('student', 'Estudante'),
        ('teacher', 'Professor'),
        ('admin', 'Administrador'),
    ]
    
    user_type = models.CharField(max_length=20, choices=USER_TYPE_CHOICES, default='student')
    phone = models.CharField(max_length=20, blank=True)
    avatar = models.ImageField(upload_to='avatars/', blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['-created_at']
    
    def __str__(self):
        return f"{self.username} ({self.get_user_type_display()})"
    
    @property
    def is_student(self):
        return self.user_type == 'student'
    
    @property
    def is_teacher(self):
        return self.user_type == 'teacher'


class StudentProfile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='student_profile')
    enrollment_date = models.DateField(auto_now_add=True)
    progress = models.JSONField(default=dict, blank=True)  # Store course progress
    
    class Meta:
        ordering = ['-enrollment_date']
    
    def __str__(self):
        return f"Perfil de Estudante: {self.user.username}"


class TeacherProfile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='teacher_profile')
    hire_date = models.DateField(auto_now_add=True)
    bio = models.TextField(blank=True)
    specialization = models.CharField(max_length=200, blank=True)
    
    class Meta:
        ordering = ['-hire_date']
    
    def __str__(self):
        return f"Perfil de Professor: {self.user.username}"
