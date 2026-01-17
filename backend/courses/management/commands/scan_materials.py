from django.core.management.base import BaseCommand
from django.conf import settings
from courses.models import Material
import os


class Command(BaseCommand):
    help = 'Scan the materials directory and create Material objects'

    def handle(self, *args, **options):
        materials_root = settings.MATERIALS_ROOT
        
        if not os.path.exists(materials_root):
            self.stdout.write(self.style.ERROR(f'Materials directory not found: {materials_root}'))
            return
        
        self.stdout.write(f'Scanning materials directory: {materials_root}')
        created_count = 0
        existing_count = 0
        
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
                        self.stdout.write(self.style.SUCCESS(f'Created: {relative_path}'))
                    else:
                        existing_count += 1
        
        self.stdout.write(self.style.SUCCESS(
            f'\nScan completed!\n'
            f'Created: {created_count} new materials\n'
            f'Existing: {existing_count} materials already in database'
        ))
