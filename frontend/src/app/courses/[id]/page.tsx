'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import {
  Container, Typography, Grid, Card, CardContent, CardActions, Button,
  List, ListItem, ListItemText, ListItemIcon, CircularProgress, Box,
  Accordion, AccordionSummary, AccordionDetails, Paper, Divider, Chip, Avatar
} from '@mui/material'
import { ArrowBack, PictureAsPdf, MusicNote, VideoLibrary, InsertDriveFile, ExpandMore, OpenInNew, Book, School, PlayArrow } from '@mui/icons-material'
import api from '@/utils/axios'

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api'

interface Material {
  id: number
  title: string
  material_type: string
  file_url: string
  file_size?: number
  duration?: number
  level?: number | null
}

interface Lesson {
  id: number
  title: string
  description: string
  order: number
  materials: Material[]
}

interface Level {
  id: number
  title: string
  description: string
  level_number: number
  order: number
  materials: Material[]
  materials_count?: number
}

interface Course {
  id: number
  title: string
  description: string
  level: string
  level_display?: string
  table_of_contents?: any[]
  created_at: string
  lessons: Lesson[]
  materials: Material[]
  levels?: Level[]
}

export default function CourseDetail() {
  const params = useParams()
  const router = useRouter()
  const [course, setCourse] = useState<Course | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (params.id) {
      fetchCourse(params.id as string)
    }
  }, [params.id])

  const fetchCourse = async (id: string) => {
    try {
      const response = await api.get(`/courses/${id}/`)
      setCourse(response.data)
      setLoading(false)
    } catch (error) {
      console.error('Error fetching course:', error)
      setLoading(false)
    }
  }

  const getMaterialIcon = (type: string) => {
    switch (type) {
      case 'pdf':
        return <PictureAsPdf />
      case 'mp3':
        return <MusicNote />
      case 'video':
        return <VideoLibrary />
      default:
        return <InsertDriveFile />
    }
  }

  const formatFileSize = (bytes?: number) => {
    if (!bytes) return ''
    const mb = bytes / (1024 * 1024)
    return `${mb.toFixed(2)} MB`
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
            Carregando curso...
          </Typography>
        </Box>
      </Box>
    )
  }

  if (!course) {
    return (
      <Box sx={{ minHeight: '100vh', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', py: 8 }}>
        <Container maxWidth="lg">
          <Card sx={{ p: 4, textAlign: 'center' }}>
            <Typography variant="h5" color="error" gutterBottom>
              Curso não encontrado
            </Typography>
            <Button
              variant="contained"
              startIcon={<ArrowBack />}
              onClick={() => router.push('/')}
              sx={{ mt: 2 }}
            >
              Voltar aos Cursos
            </Button>
          </Card>
        </Container>
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
        <Button
          startIcon={<ArrowBack />}
          onClick={() => router.push('/')}
          sx={{ 
            mb: 3,
            color: 'white',
            '&:hover': {
              bgcolor: 'rgba(255, 255, 255, 0.1)',
            }
          }}
        >
          Voltar aos Cursos
        </Button>

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
          <Box display="flex" alignItems="center" gap={2} mb={2}>
            <Avatar sx={{ bgcolor: 'primary.main', width: 56, height: 56 }}>
              <Book sx={{ fontSize: 32 }} />
            </Avatar>
            <Box sx={{ flexGrow: 1 }}>
              <Typography variant="h3" component="h1" gutterBottom sx={{ fontWeight: 700, mb: 0.5 }}>
                {course.title}
              </Typography>
              <Chip 
                icon={<School />} 
                label="Curso de Inglês" 
                size="small"
                color="primary"
              />
            </Box>
            {(course.materials && course.materials.length > 0) && (
              <Button
                variant="contained"
                size="large"
                startIcon={<PlayArrow />}
                onClick={() => router.push(`/courses/${course.id}/learn`)}
                sx={{ minWidth: 200 }}
              >
                Iniciar Aprendizado
              </Button>
            )}
          </Box>
          <Divider sx={{ my: 2 }} />
          <Typography variant="body1" color="text.secondary" sx={{ fontSize: '1.1rem', lineHeight: 1.8 }}>
            {course.description || 'Explore materiais de aprendizado abrangentes projetados para aprimorar suas habilidades em inglês.'}
          </Typography>
        </Paper>

      {/* Table of Contents */}
      {course.table_of_contents && course.table_of_contents.length > 0 && (
        <Paper
          elevation={0}
          sx={{
            p: { xs: 3, sm: 4 },
            mb: 4,
            borderRadius: 4,
            background: 'rgba(255, 255, 255, 0.92)',
            backdropFilter: 'blur(14px)',
          }}
        >
          <Typography variant="h5" gutterBottom sx={{ fontWeight: 900, letterSpacing: '-0.01em', mb: 2 }}>
            Índice do Curso
          </Typography>
          <List>
            {course.table_of_contents.map((item: any, index: number) => (
              <ListItem key={index}>
                <ListItemText
                  primary={item.title || `Item ${index + 1}`}
                  secondary={item.description}
                />
              </ListItem>
            ))}
          </List>
        </Paper>
      )}

      {/* Levels */}
      {course.levels && course.levels.length > 0 && (
        <Paper
          elevation={0}
          sx={{
            p: { xs: 3, sm: 4 },
            mb: 4,
            borderRadius: 4,
            background: 'rgba(255, 255, 255, 0.92)',
            backdropFilter: 'blur(14px)',
          }}
        >
          <Typography variant="h5" gutterBottom sx={{ fontWeight: 900, letterSpacing: '-0.01em', mb: 2 }}>
            Níveis do Curso
          </Typography>
          {course.levels.map((level) => (
            <Accordion key={level.id} sx={{ mb: 2, borderRadius: 3, overflow: 'hidden' }}>
              <AccordionSummary expandIcon={<ExpandMore />}>
                <Box display="flex" alignItems="center" gap={2} width="100%">
                  <Chip 
                    label={`Nível ${level.level_number}`} 
                    color="primary" 
                    variant="outlined"
                  />
                  <Typography variant="h6" sx={{ fontWeight: 600 }}>
                    {level.title}
                  </Typography>
                  <Chip 
                    label={`${level.materials?.length || level.materials_count || 0} materiais`} 
                    size="small"
                    sx={{ ml: 'auto' }}
                  />
                </Box>
              </AccordionSummary>
              <AccordionDetails>
                {level.description && (
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    {level.description}
                  </Typography>
                )}
                {level.materials && level.materials.length > 0 ? (
                  <Grid container spacing={2}>
                    {level.materials.map((material) => (
                      <Grid item xs={12} sm={6} md={4} key={material.id}>
                        <Card>
                          <CardContent>
                            <Box display="flex" alignItems="center" gap={1} mb={1}>
                              {getMaterialIcon(material.material_type)}
                              <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                                {material.title}
                              </Typography>
                            </Box>
                            {material.file_size && (
                              <Typography variant="caption" color="text.secondary">
                                {formatFileSize(material.file_size)}
                              </Typography>
                            )}
                          </CardContent>
                          <CardActions>
                            <Button
                              size="small"
                              onClick={() => router.push(`/courses/${params.id}/materials/${material.id}/view`)}
                              variant="contained"
                              fullWidth
                            >
                              Visualizar
                            </Button>
                          </CardActions>
                        </Card>
                      </Grid>
                    ))}
                  </Grid>
                ) : (
                  <Typography variant="body2" color="text.secondary">
                    Nenhum material disponível neste nível
                  </Typography>
                )}
              </AccordionDetails>
            </Accordion>
          ))}
        </Paper>
      )}

      {/* Direct Materials (not in lessons or levels) */}
      {course.materials && course.materials.length > 0 && course.materials.filter((m: Material) => !m.level && !course.lessons?.some(l => l.materials?.some((lm: Material) => lm.id === m.id))).length > 0 && (
        <Paper elevation={0} sx={{ p: 4, mb: 4, background: 'rgba(255, 255, 255, 0.95)' }}>
          <Box display="flex" alignItems="center" gap={1} mb={3}>
            <School color="primary" />
            <Typography variant="h5" gutterBottom sx={{ fontWeight: 600, mb: 0 }}>
              Materiais do Curso
            </Typography>
            <Chip label={course.materials.length} size="small" color="primary" variant="outlined" />
          </Box>
          <Grid container spacing={3}>
            {course.materials.map((material) => (
              <Grid item xs={12} sm={6} md={4} key={material.id}>
                <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                  <CardContent sx={{ flexGrow: 1, p: 2.5 }}>
                    <Box display="flex" alignItems="center" gap={1.5} mb={1.5}>
                      <Box
                        sx={{
                          p: 1.5,
                          borderRadius: 2,
                          bgcolor: material.material_type === 'pdf' ? 'error.light' 
                            : material.material_type === 'mp3' ? 'success.light'
                            : material.material_type === 'video' ? 'warning.light'
                            : 'grey.200',
                          color: material.material_type === 'pdf' ? 'error.main'
                            : material.material_type === 'mp3' ? 'success.main'
                            : material.material_type === 'video' ? 'warning.main'
                            : 'grey.600',
                        }}
                      >
                        {getMaterialIcon(material.material_type)}
                      </Box>
                      <Box sx={{ flexGrow: 1, minWidth: 0 }}>
                        <Typography 
                          variant="subtitle1" 
                          sx={{ 
                            fontWeight: 600,
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap',
                          }}
                        >
                          {material.title}
                        </Typography>
                        {material.file_size && (
                          <Typography variant="caption" color="text.secondary">
                            {formatFileSize(material.file_size)}
                          </Typography>
                        )}
                      </Box>
                    </Box>
                  </CardContent>
                  <CardActions sx={{ p: 2, pt: 0 }}>
                    <Button
                      fullWidth
                      variant="contained"
                      onClick={() => router.push(`/courses/${params.id}/materials/${material.id}/view`)}
                      endIcon={<OpenInNew />}
                      size="medium"
                    >
                      Visualizar Material
                    </Button>
                  </CardActions>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Paper>
      )}

      {/* Lessons */}
      {course.lessons && course.lessons.length > 0 && (
        <Paper elevation={0} sx={{ p: 4, background: 'rgba(255, 255, 255, 0.95)' }}>
          <Box display="flex" alignItems="center" gap={1} mb={3}>
            <Book color="primary" />
            <Typography variant="h5" gutterBottom sx={{ fontWeight: 600, mb: 0 }}>
              Aulas
            </Typography>
            <Chip label={course.lessons.length} size="small" color="primary" variant="outlined" />
          </Box>
          {course.lessons.map((lesson, index) => (
            <Accordion 
              key={lesson.id} 
              sx={{ 
                mb: 2,
                boxShadow: '0 1px 3px 0 rgb(0 0 0 / 0.1)',
                '&:before': { display: 'none' },
                '&.Mui-expanded': {
                  boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)',
                }
              }}
            >
              <AccordionSummary 
                expandIcon={<ExpandMore />}
                sx={{
                  bgcolor: 'grey.50',
                  borderRadius: 2,
                  '&:hover': {
                    bgcolor: 'grey.100',
                  },
                  '&.Mui-expanded': {
                    borderBottomLeftRadius: 0,
                    borderBottomRightRadius: 0,
                  }
                }}
              >
                <Box display="flex" alignItems="center" gap={2}>
                  <Chip 
                    label={`Aula ${index + 1}`} 
                    size="small" 
                    color="primary" 
                    variant="outlined"
                  />
                  <Typography variant="h6" sx={{ fontWeight: 600 }}>
                    {lesson.title}
                  </Typography>
                  {lesson.materials.length > 0 && (
                    <Chip 
                      label={`${lesson.materials.length} materiais`} 
                      size="small" 
                      sx={{ ml: 'auto' }}
                    />
                  )}
                </Box>
              </AccordionSummary>
              <AccordionDetails sx={{ p: 3 }}>
                {lesson.description && (
                  <Typography variant="body1" color="text.secondary" sx={{ mb: 3, lineHeight: 1.8 }}>
                    {lesson.description}
                  </Typography>
                )}
                {lesson.materials.length > 0 ? (
                  <List sx={{ p: 0 }}>
                    {lesson.materials.map((material, matIndex) => (
                      <Box key={material.id}>
                        {matIndex > 0 && <Divider sx={{ my: 1 }} />}
                        <ListItem 
                          sx={{ 
                            px: 0,
                            py: 1.5,
                            '&:hover': {
                              bgcolor: 'grey.50',
                              borderRadius: 1,
                            }
                          }}
                        >
                          <ListItemIcon sx={{ minWidth: 48 }}>
                            <Box
                              sx={{
                                p: 1,
                                borderRadius: 1.5,
                                bgcolor: material.material_type === 'pdf' ? 'error.light' 
                                  : material.material_type === 'mp3' ? 'success.light'
                                  : material.material_type === 'video' ? 'warning.light'
                                  : 'grey.200',
                                color: material.material_type === 'pdf' ? 'error.main'
                                  : material.material_type === 'mp3' ? 'success.main'
                                  : material.material_type === 'video' ? 'warning.main'
                                  : 'grey.600',
                              }}
                            >
                              {getMaterialIcon(material.material_type)}
                            </Box>
                          </ListItemIcon>
                          <ListItemText
                            primary={
                              <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                                {material.title}
                              </Typography>
                            }
                            secondary={material.file_size ? formatFileSize(material.file_size) : ''}
                            sx={{ mr: 2 }}
                          />
                          <Button
                            size="small"
                            onClick={() => router.push(`/courses/${params.id}/materials/${material.id}/view`)}
                            variant="contained"
                            endIcon={<OpenInNew />}
                          >
                            Visualizar
                          </Button>
                        </ListItem>
                      </Box>
                    ))}
                  </List>
                ) : (
                  <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', py: 2 }}>
                    Nenhum material disponível para esta aula
                  </Typography>
                )}
              </AccordionDetails>
            </Accordion>
          ))}
        </Paper>
      )}
      </Container>
    </Box>
  )
}
