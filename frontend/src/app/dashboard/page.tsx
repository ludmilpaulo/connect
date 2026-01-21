'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  Container, Typography, Grid, Card, CardContent, CardActions, Button,
  CircularProgress, Box, Paper, LinearProgress, Chip, Avatar, Divider,
  List, ListItem, ListItemText, ListItemIcon, ListItemAvatar
} from '@mui/material'
import {
  School, Book, PictureAsPdf, MusicNote, VideoLibrary, PlayArrow,
  CheckCircle, TrendingUp, Dashboard as DashboardIcon, EmojiEvents, QueryStats
} from '@mui/icons-material'
import Link from 'next/link'
import { useAuth } from '@/contexts/AuthContext'
import api from '@/utils/axios'
import { calculateCourseProgress, getCourseProgress } from '@/utils/progress'

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api'

interface Material {
  id: number
  title: string
  material_type: string
  file_url: string
  file_size?: number
  order: number
}

interface Lesson {
  id: number
  title: string
  description: string
  order: number
  materials: Material[]
}

interface Course {
  id: number
  title: string
  description: string
  created_at: string
  lessons: Lesson[]
  materials: Material[]
}

export default function StudentDashboard() {
  const router = useRouter()
  const { user, loading: authLoading } = useAuth()
  const [courses, setCourses] = useState<Course[]>([])
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({
    totalCourses: 0,
    totalMaterials: 0,
    totalLessons: 0,
    completedMaterials: 0
  })

  useEffect(() => {
    if (!authLoading) {
      if (!user) {
        router.push('/login')
        return
      }
      fetchData()
    }
  }, [user, authLoading, router])

  const fetchData = async () => {
    try {
      setLoading(true)
      const response = await api.get('/courses/')
      const coursesData = response.data.results || response.data
      setCourses(coursesData)
      
      // Calculate stats
      const totalMaterials = coursesData.reduce((acc: number, course: Course) => {
        return acc + (course.materials?.length || 0) + 
               course.lessons?.reduce((sum: number, lesson: Lesson) => sum + (lesson.materials?.length || 0), 0) || 0
      }, 0)
      
      const totalLessons = coursesData.reduce((acc: number, course: Course) => {
        return acc + (course.lessons?.length || 0)
      }, 0)

      // Calculate completed materials from progress
      const totalCompleted = coursesData.reduce((acc: number, course: Course) => {
        const courseMaterials = (course.materials?.length || 0) + 
          course.lessons?.reduce((sum: number, lesson: Lesson) => sum + (lesson.materials?.length || 0), 0) || 0
        const progress = getCourseProgress(course.id)
        return acc + progress.completedMaterials.length
      }, 0)

      setStats({
        totalCourses: coursesData.length,
        totalMaterials,
        totalLessons,
        completedMaterials: totalCompleted
      })
      setLoading(false)
    } catch (error) {
      console.error('Error fetching data:', error)
      setLoading(false)
    }
  }

  const getMaterialIcon = (type: string) => {
    switch (type) {
      case 'pdf':
        return <PictureAsPdf color="error" />
      case 'mp3':
        return <MusicNote color="success" />
      case 'video':
        return <VideoLibrary color="warning" />
      default:
        return <Book />
    }
  }

  const formatFileSize = (bytes?: number) => {
    if (!bytes) return ''
    const mb = bytes / (1024 * 1024)
    return `${mb.toFixed(2)} MB`
  }

  const getCourseProgressPercentage = (course: Course) => {
    const totalMaterials = (course.materials?.length || 0) + 
      course.lessons?.reduce((sum, lesson) => sum + (lesson.materials?.length || 0), 0) || 0
    return calculateCourseProgress(course.id, totalMaterials)
  }

  if (loading) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="100vh"
        sx={{
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        }}
      >
        <Box textAlign="center">
          <CircularProgress size={60} sx={{ color: 'white', mb: 2 }} />
          <Typography variant="h6" sx={{ color: 'white' }}>
            Carregando dashboard...
          </Typography>
        </Box>
      </Box>
    )
  }

  return (
    <Box
      sx={{
        minHeight: '100vh',
        pb: 8,
        background:
          'radial-gradient(900px circle at 10% 10%, rgba(37, 99, 235, 0.25), transparent 35%), radial-gradient(900px circle at 90% 20%, rgba(124, 58, 237, 0.22), transparent 45%), linear-gradient(135deg, #0B1220 0%, #101A33 40%, #0B1220 100%)',
      }}
    >
      <Container maxWidth="lg" sx={{ py: 4, px: { xs: 2, sm: 3 } }}>
        <Paper
          elevation={0}
          sx={{
            p: { xs: 3, sm: 4 },
            mb: 4,
            borderRadius: 4,
            background: 'rgba(255, 255, 255, 0.92)',
            backdropFilter: 'blur(14px)',
            boxShadow: '0 30px 80px rgba(0,0,0,0.35)',
          }}
        >
          <Box display="flex" alignItems="center" justifyContent="space-between" gap={2} mb={3}>
            <Box display="flex" alignItems="center" gap={2}>
              <Avatar sx={{ bgcolor: 'primary.main', width: 56, height: 56 }}>
                <DashboardIcon sx={{ fontSize: 28 }} />
              </Avatar>
              <Box>
                <Typography variant="h4" sx={{ fontWeight: 900, letterSpacing: '-0.02em', mb: 0.5 }}>
                  Meu Dashboard
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Bem-vindo, {user?.first_name || user?.username}. Continue sua trilha e acompanhe seu progresso.
                </Typography>
              </Box>
            </Box>
            <Box display={{ xs: 'none', md: 'flex' }} gap={1}>
              <Chip icon={<QueryStats />} label="Progresso em tempo real" variant="outlined" />
              <Chip icon={<EmojiEvents />} label="Metas e conquistas" variant="outlined" />
            </Box>
          </Box>

          {/* Statistics Cards */}
          <Grid container spacing={3} sx={{ mb: 4 }}>
            <Grid item xs={12} sm={6} md={3}>
              <Card sx={{ background: 'linear-gradient(135deg, #2563EB 0%, #7C3AED 100%)', color: 'white' }}>
                <CardContent>
                  <Box display="flex" alignItems="center" justifyContent="space-between">
                    <Box>
                      <Typography variant="h3" sx={{ fontWeight: 700 }}>
                        {stats.totalCourses}
                      </Typography>
                      <Typography variant="body2" sx={{ opacity: 0.9 }}>
                        Cursos
                      </Typography>
                    </Box>
                    <School sx={{ fontSize: 48, opacity: 0.3 }} />
                  </Box>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} sm={6} md={3}>
              <Card sx={{ background: 'linear-gradient(135deg, #EC4899 0%, #F97316 100%)', color: 'white' }}>
                <CardContent>
                  <Box display="flex" alignItems="center" justifyContent="space-between">
                    <Box>
                      <Typography variant="h3" sx={{ fontWeight: 700 }}>
                        {stats.totalLessons}
                      </Typography>
                      <Typography variant="body2" sx={{ opacity: 0.9 }}>
                        Aulas
                      </Typography>
                    </Box>
                    <Book sx={{ fontSize: 48, opacity: 0.28 }} />
                  </Box>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} sm={6} md={3}>
              <Card sx={{ background: 'linear-gradient(135deg, #06B6D4 0%, #22C55E 100%)', color: 'white' }}>
                <CardContent>
                  <Box display="flex" alignItems="center" justifyContent="space-between">
                    <Box>
                      <Typography variant="h3" sx={{ fontWeight: 700 }}>
                        {stats.totalMaterials}
                      </Typography>
                      <Typography variant="body2" sx={{ opacity: 0.9 }}>
                        Materiais
                      </Typography>
                    </Box>
                    <PictureAsPdf sx={{ fontSize: 48, opacity: 0.28 }} />
                  </Box>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} sm={6} md={3}>
              <Card sx={{ background: 'linear-gradient(135deg, #F59E0B 0%, #F97316 100%)', color: 'white' }}>
                <CardContent>
                  <Box display="flex" alignItems="center" justifyContent="space-between">
                    <Box>
                      <Typography variant="h3" sx={{ fontWeight: 700 }}>
                        {stats.completedMaterials}
                      </Typography>
                      <Typography variant="body2" sx={{ opacity: 0.9 }}>
                        Completados
                      </Typography>
                    </Box>
                    <CheckCircle sx={{ fontSize: 48, opacity: 0.28 }} />
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          </Grid>

          <Divider sx={{ my: 4 }} />

          {/* Courses List */}
          <Box>
            <Box display="flex" alignItems="baseline" justifyContent="space-between" gap={2} mb={2.5}>
              <Box>
                <Typography variant="h5" gutterBottom sx={{ fontWeight: 900, letterSpacing: '-0.01em', mb: 0.25 }}>
                  Meus Cursos
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Continue de onde parou — o progresso fica salvo automaticamente.
                </Typography>
              </Box>
              <Link href="/" style={{ textDecoration: 'none' }}>
                <Button variant="outlined" startIcon={<TrendingUp />}>
                  Explorar mais
                </Button>
              </Link>
            </Box>
            {courses.length === 0 ? (
              <Paper sx={{ p: 4, textAlign: 'center' }}>
                <School sx={{ fontSize: 60, color: 'text.secondary', mb: 2 }} />
                <Typography variant="h6" color="text.secondary" gutterBottom>
                  Nenhum curso disponível
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                  Entre em contato com o administrador para ter acesso aos cursos.
                </Typography>
                <Link href="/">
                  <Button variant="contained" startIcon={<School />}>
                    Explorar Cursos
                  </Button>
                </Link>
              </Paper>
            ) : (
              <Grid container spacing={3}>
                {courses.map((course) => {
                  const progress = getCourseProgressPercentage(course)
                  const courseMaterials = (course.materials?.length || 0) + 
                    course.lessons?.reduce((sum, lesson) => sum + (lesson.materials?.length || 0), 0) || 0
                  const progressData = getCourseProgress(course.id)
                  
                  return (
                    <Grid item xs={12} md={6} key={course.id}>
                      <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                        <CardContent sx={{ flexGrow: 1 }}>
                          <Box display="flex" alignItems="center" gap={2} mb={2}>
                            <Avatar sx={{ bgcolor: 'primary.main' }}>
                              <School />
                            </Avatar>
                            <Box sx={{ flexGrow: 1 }}>
                              <Typography variant="h6" sx={{ fontWeight: 600 }}>
                                {course.title}
                              </Typography>
                              <Box display="flex" gap={1} mt={1}>
                                <Chip label={`${course.lessons?.length || 0} aulas`} size="small" />
                                <Chip label={`${courseMaterials} materiais`} size="small" variant="outlined" />
                              </Box>
                            </Box>
                          </Box>
                          
                          <Typography variant="body2" color="text.secondary" paragraph>
                            {course.description || 'Explore materiais de aprendizado abrangentes.'}
                          </Typography>

                          <Box sx={{ mt: 2 }}>
                            <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
                              <Typography variant="caption" color="text.secondary">
                                Progresso do Curso
                              </Typography>
                              <Typography variant="caption" color="primary" sx={{ fontWeight: 600 }}>
                                {progress}% • {progressData.completedMaterials.length}/{courseMaterials}
                              </Typography>
                            </Box>
                            <LinearProgress 
                              variant="determinate" 
                              value={progress} 
                              sx={{ 
                                height: 10, 
                                borderRadius: 5,
                                bgcolor: 'grey.200',
                                '& .MuiLinearProgress-bar': {
                                  borderRadius: 5,
                                  background: progress === 100 
                                    ? 'linear-gradient(90deg, #16A34A 0%, #22C55E 100%)'
                                    : 'linear-gradient(90deg, #2563EB 0%, #7C3AED 100%)'
                                }
                              }} 
                            />
                            {progress > 0 && progress < 100 && (
                              <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block' }}>
                                Continue estudando para completar o curso!
                              </Typography>
                            )}
                            {progress === 100 && (
                              <Typography variant="caption" color="success.main" sx={{ mt: 0.5, display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                <CheckCircle fontSize="small" /> Curso concluído!
                              </Typography>
                            )}
                          </Box>

                          {/* Recent Materials */}
                          {course.materials && course.materials.length > 0 && (
                            <Box sx={{ mt: 3 }}>
                              <Typography variant="subtitle2" gutterBottom sx={{ fontWeight: 600 }}>
                                Materiais Recentes
                              </Typography>
                              <List dense>
                                {course.materials.slice(0, 3).map((material) => (
                                  <ListItem key={material.id} sx={{ px: 0, py: 0.5 }}>
                                    <ListItemIcon sx={{ minWidth: 36 }}>
                                      {getMaterialIcon(material.material_type)}
                                    </ListItemIcon>
                                    <ListItemText
                                      primary={material.title}
                                      primaryTypographyProps={{ variant: 'caption' }}
                                      secondary={formatFileSize(material.file_size)}
                                      secondaryTypographyProps={{ variant: 'caption' }}
                                    />
                                  </ListItem>
                                ))}
                              </List>
                            </Box>
                          )}
                        </CardContent>
                        <CardActions sx={{ p: 2, pt: 0 }}>
                          <Link href={`/courses/${course.id}`} style={{ width: '100%' }}>
                            <Button
                              fullWidth
                              variant="contained"
                              startIcon={<PlayArrow />}
                            >
                              Continuar Aprendendo
                            </Button>
                          </Link>
                        </CardActions>
                      </Card>
                    </Grid>
                  )
                })}
              </Grid>
            )}
          </Box>
        </Paper>
      </Container>
    </Box>
  )
}
