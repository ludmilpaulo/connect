from django.db import models
from django.conf import settings
import os


class Course(models.Model):
    LEVEL_CHOICES = [
        ('beginner', 'Iniciante'),
        ('intermediate', 'Intermediário'),
        ('advanced', 'Avançado'),
        ('expert', 'Expert'),
    ]
    
    title = models.CharField(max_length=200)
    description = models.TextField(blank=True)
    thumbnail = models.ImageField(upload_to='thumbnails/', blank=True, null=True)
    level = models.CharField(max_length=20, choices=LEVEL_CHOICES, default='beginner')
    table_of_contents = models.JSONField(default=list, blank=True, help_text="Table of contents structure")
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['-created_at']
    
    def __str__(self):
        return self.title


class Lesson(models.Model):
    course = models.ForeignKey(Course, related_name='lessons', on_delete=models.CASCADE)
    title = models.CharField(max_length=200)
    description = models.TextField(blank=True)
    order = models.IntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        ordering = ['order', 'created_at']
    
    def __str__(self):
        return f"{self.course.title} - {self.title}"


class Level(models.Model):
    """Course level to organize materials"""
    course = models.ForeignKey(Course, related_name='levels', on_delete=models.CASCADE)
    title = models.CharField(max_length=200)
    description = models.TextField(blank=True)
    level_number = models.IntegerField(default=1, help_text="Level order (1, 2, 3...)")
    order = models.IntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        ordering = ['level_number', 'order']
        unique_together = ['course', 'level_number']
    
    def __str__(self):
        return f"{self.course.title} - Nível {self.level_number}: {self.title}"


class Material(models.Model):
    MATERIAL_TYPE_CHOICES = [
        ('pdf', 'PDF'),
        ('mp3', 'Audio MP3'),
        ('wav', 'Audio WAV'),
        ('video', 'Video'),
        ('image', 'Image'),
        ('exe', 'Aplicação .exe'),
        ('zip', 'Arquivo ZIP'),
        ('doc', 'Documento Word'),
        ('xls', 'Planilha Excel'),
        ('ppt', 'Apresentação PowerPoint'),
        ('other', 'Outro'),
    ]
    
    lesson = models.ForeignKey(Lesson, related_name='materials', on_delete=models.CASCADE, blank=True, null=True)
    course = models.ForeignKey(Course, related_name='materials', on_delete=models.CASCADE, blank=True, null=True)
    level = models.ForeignKey(Level, related_name='materials', on_delete=models.CASCADE, blank=True, null=True, help_text="Level this material belongs to")
    title = models.CharField(max_length=200)
    file_path = models.CharField(max_length=500, blank=True, null=True, help_text="Path relative to MATERIALS_ROOT (for scanned files)")
    file = models.FileField(upload_to='materials/%Y/%m/', blank=True, null=True, help_text="Upload file directly")
    material_type = models.CharField(max_length=10, choices=MATERIAL_TYPE_CHOICES, default='other')
    file_size = models.BigIntegerField(blank=True, null=True)
    duration = models.IntegerField(blank=True, null=True, help_text="Duration in seconds for audio/video")
    order = models.IntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        ordering = ['order', 'created_at']
    
    def __str__(self):
        return self.title
    
    def get_full_path(self):
        """Returns the full file system path to the material"""
        if self.file:
            return self.file.path
        elif self.file_path:
            return os.path.join(settings.MATERIALS_ROOT, self.file_path)
        return None
    
    def get_file_url(self):
        """Returns the URL to access this material"""
        from django.urls import reverse
        return reverse('material-file', kwargs={'pk': self.pk})
    
    def save(self, *args, **kwargs):
        # Auto-detect material type from file extension
        if self.file:
            ext = os.path.splitext(self.file.name)[1].lower()
            ext_to_type = {
                '.pdf': 'pdf',
                '.mp3': 'mp3',
                '.wav': 'wav',
                '.mp4': 'video',
                '.avi': 'video',
                '.mov': 'video',
                '.jpg': 'image',
                '.jpeg': 'image',
                '.png': 'image',
                '.gif': 'image',
                '.exe': 'exe',
                '.zip': 'zip',
                '.rar': 'zip',
                '.doc': 'doc',
                '.docx': 'doc',
                '.xls': 'xls',
                '.xlsx': 'xls',
                '.ppt': 'ppt',
                '.pptx': 'ppt',
            }
            if ext in ext_to_type:
                self.material_type = ext_to_type[ext]
            if self.file.size:
                self.file_size = self.file.size
        super().save(*args, **kwargs)