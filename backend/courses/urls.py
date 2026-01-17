from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import CourseViewSet, LessonViewSet, MaterialViewSet, LevelViewSet

router = DefaultRouter()
router.register(r'courses', CourseViewSet, basename='course')
router.register(r'lessons', LessonViewSet, basename='lesson')
router.register(r'materials', MaterialViewSet, basename='material')
router.register(r'levels', LevelViewSet, basename='level')

urlpatterns = [
    path('', include(router.urls)),
    path('materials/<int:pk>/file/', MaterialViewSet.as_view({'get': 'file'}), name='material-file'),
]
