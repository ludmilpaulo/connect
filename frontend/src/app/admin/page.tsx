'use client'

import { useEffect, useState } from 'react'
import {
  Container, Typography, Grid, Card, CardContent, CardActions, Button,
  CircularProgress, Box, Paper, TextField, Dialog, DialogTitle, DialogContent,
  DialogActions, IconButton, Alert, Snackbar, Tabs, Tab, List, ListItem,
  ListItemText, ListItemSecondaryAction, Chip, Divider, Accordion, AccordionSummary,
  AccordionDetails, MenuItem, Select, FormControl, InputLabel
} from '@mui/material'
import {
  ArrowBack, Add, Edit, Delete, FolderOpen, Refresh, School, Book,
  PictureAsPdf, MusicNote, VideoLibrary, ExpandMore, Dashboard, Link as LinkIcon
} from '@mui/icons-material'
import { useAuth } from '@/contexts/AuthContext'
import { useRouter } from 'next/navigation'
import api from '@/utils/axios'

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api'

interface Material {
  id: number
  title: string
  material_type: string
  file_path?: string
  file?: string
  file_size?: number
  order: number
  course?: number
  course_id?: number
  course_title?: string
  level?: number
  level_id?: number
  level_title?: string
}

interface Lesson {
  id: number
  title: string
  description: string
  order: number
  course: number
  materials: Material[]
}

interface Level {
  id: number
  title: string
  description: string
  level_number: number
  order: number
  course: number
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
  levels_count?: number
}

export default function AdminPanel() {
  const router = useRouter()
  const { user, loading: authLoading } = useAuth()
  const [courses, setCourses] = useState<Course[]>([])
  const [materials, setMaterials] = useState<Material[]>([])
  const [loading, setLoading] = useState(true)
  const [scanning, setScanning] = useState(false)
  const [openDialog, setOpenDialog] = useState(false)
  const [currentTab, setCurrentTab] = useState(0)
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' as 'success' | 'error' | 'info' | 'warning' })
  const [newCourse, setNewCourse] = useState({ title: '', description: '', level: 'beginner' })
  const [associateDialog, setAssociateDialog] = useState({ open: false, materialId: 0, courseId: '' })
  const [levels, setLevels] = useState<Level[]>([])
  const [uploadDialog, setUploadDialog] = useState({ open: false, courseId: '', levelId: '' })
  const [uploadFile, setUploadFile] = useState<File | null>(null)
  const [uploadTitle, setUploadTitle] = useState('')
  const [uploading, setUploading] = useState(false)

  useEffect(() => {
    if (!authLoading) {
      if (!user) {
        router.push('/login')
        return
      }
      if (user.user_type !== 'teacher' && user.user_type !== 'admin') {
        router.push('/dashboard')
        return
      }
      fetchData()
    }
  }, [user, authLoading, router])

  const fetchData = async () => {
    try {
      setLoading(true)
      const [coursesRes, materialsRes, levelsRes] = await Promise.all([
        api.get('/courses/'),
        api.get('/materials/'),
        api.get('/levels/')
      ])
      setCourses(coursesRes.data.results || coursesRes.data)
      setMaterials(materialsRes.data.results || materialsRes.data)
      setLevels(levelsRes.data.results || levelsRes.data)
      setLoading(false)
    } catch (error) {
      console.error('Error fetching data:', error)
      setLoading(false)
    }
  }

  const scanMaterials = async () => {
    try {
      setScanning(true)
      const response = await api.get('/materials/scan_materials/')
      setSnackbar({ open: true, message: response.data.message || 'Materiais escaneados com sucesso!', severity: 'success' })
      fetchData()
      setScanning(false)
    } catch (error: any) {
      setSnackbar({ open: true, message: error.response?.data?.error || 'Erro ao escanear materiais', severity: 'error' })
      setScanning(false)
    }
  }

  const createCourse = async () => {
    try {
      const response = await api.post('/courses/', {
        ...newCourse,
        table_of_contents: []
      })
      setSnackbar({ open: true, message: 'Curso criado com sucesso!', severity: 'success' })
      setOpenDialog(false)
      setNewCourse({ title: '', description: '', level: 'beginner' })
      fetchData()
    } catch (error: any) {
      setSnackbar({ open: true, message: error.response?.data?.detail || 'Erro ao criar curso', severity: 'error' })
    }
  }

  const createLevel = async (courseId: number, title: string, description: string = '') => {
    try {
      const course = courses.find(c => c.id === courseId)
      if (!course) return
      
      const existingLevels = levels.filter(l => l.course === courseId)
      const levelNumber = existingLevels.length > 0 
        ? Math.max(...existingLevels.map(l => l.level_number)) + 1 
        : 1
      
      await api.post('/levels/', {
        course: courseId,
        title,
        description,
        level_number: levelNumber,
        order: levelNumber
      })
      setSnackbar({ open: true, message: 'Nível criado com sucesso!', severity: 'success' })
      fetchData()
    } catch (error: any) {
      setSnackbar({ open: true, message: error.response?.data?.detail || 'Erro ao criar nível', severity: 'error' })
    }
  }

  const handleFileUpload = async () => {
    if (!uploadFile || !uploadDialog.courseId) {
      setSnackbar({ open: true, message: 'Selecione um arquivo e um curso', severity: 'error' })
      return
    }

    try {
      setUploading(true)
      const formData = new FormData()
      formData.append('file', uploadFile)
      formData.append('course', uploadDialog.courseId)
      formData.append('title', uploadTitle || uploadFile.name)
      if (uploadDialog.levelId) {
        formData.append('level', uploadDialog.levelId)
      }

      await api.post('/materials/upload/', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      })

      setSnackbar({ open: true, message: 'Arquivo enviado com sucesso!', severity: 'success' })
      setUploadDialog({ open: false, courseId: '', levelId: '' })
      setUploadFile(null)
      setUploadTitle('')
      fetchData()
    } catch (error: any) {
      setSnackbar({ open: true, message: error.response?.data?.error || 'Erro ao enviar arquivo', severity: 'error' })
    } finally {
      setUploading(false)
    }
  }

  const deleteCourse = async (id: number) => {
    if (!confirm('Tem certeza que deseja excluir este curso?')) return
    try {
      await api.delete(`/courses/${id}/`)
      setSnackbar({ open: true, message: 'Curso excluído com sucesso!', severity: 'success' })
      fetchData()
    } catch (error: any) {
      setSnackbar({ open: true, message: error.response?.data?.detail || 'Erro ao excluir curso', severity: 'error' })
    }
  }

  const associateMaterialToCourse = async () => {
    try {
      const courseId = associateDialog.courseId ? parseInt(associateDialog.courseId) : null
      await api.patch(`/materials/${associateDialog.materialId}/`, {
        course: courseId
      })
      setSnackbar({ open: true, message: 'Material associado ao curso com sucesso!', severity: 'success' })
      setAssociateDialog({ open: false, materialId: 0, courseId: '' })
      fetchData()
    } catch (error: any) {
      setSnackbar({ open: true, message: error.response?.data?.detail || 'Erro ao associar material', severity: 'error' })
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
        return <FolderOpen />
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
            Carregando painel de administração...
          </Typography>
        </Box>
      </Box>
    )
  }

  return (
    <Box sx={{ minHeight: '100vh', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', pb: 8 }}>
      <Container maxWidth="lg" sx={{ py: 4, px: { xs: 2, sm: 3 } }}>
        <Paper elevation={0} sx={{ p: 4, mb: 4, background: 'rgba(255, 255, 255, 0.95)' }}>
          <Box display="flex" alignItems="center" justifyContent="space-between" mb={3}>
            <Box display="flex" alignItems="center" gap={2}>
              <Dashboard color="primary" sx={{ fontSize: 40 }} />
              <Typography variant="h4" sx={{ fontWeight: 700 }}>
                Painel de Administração
              </Typography>
            </Box>
            <Button
              startIcon={<ArrowBack />}
              onClick={() => router.push('/')}
              variant="outlined"
            >
              Voltar
            </Button>
          </Box>

          <Tabs value={currentTab} onChange={(_, newValue) => setCurrentTab(newValue)} sx={{ mb: 3 }}>
            <Tab label="Cursos" icon={<School />} iconPosition="start" />
            <Tab label="Níveis" icon={<Book />} iconPosition="start" />
            <Tab label="Materiais" icon={<FolderOpen />} iconPosition="start" />
            <Tab label="Upload" icon={<Add />} iconPosition="start" />
          </Tabs>

          {/* Cursos Tab */}
          {currentTab === 0 && (
            <Box>
              <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
                <Typography variant="h6">Gerenciar Cursos</Typography>
                <Button
                  variant="contained"
                  startIcon={<Add />}
                  onClick={() => setOpenDialog(true)}
                >
                  Novo Curso
                </Button>
              </Box>
              <Grid container spacing={3}>
                {courses.length === 0 ? (
                  <Grid item xs={12}>
                    <Alert severity="info">
                      Nenhum curso encontrado. Crie um novo curso para começar.
                    </Alert>
                  </Grid>
                ) : (
                  courses.map((course) => (
                    <Grid item xs={12} md={6} key={course.id}>
                      <Card>
                        <CardContent>
                          <Typography variant="h6" gutterBottom>
                            {course.title}
                          </Typography>
                          <Typography variant="body2" color="text.secondary" paragraph>
                            {course.description || 'Sem descrição'}
                          </Typography>
                          <Box display="flex" gap={1} mb={2}>
                            <Chip label={`${course.lessons?.length || 0} aulas`} size="small" />
                            <Chip label={`${course.materials?.length || 0} materiais`} size="small" />
                          </Box>
                        </CardContent>
                        <CardActions>
                          <Button
                            size="small"
                            onClick={() => router.push(`/courses/${course.id}`)}
                          >
                            Ver
                          </Button>
                          <Button
                            size="small"
                            color="error"
                            startIcon={<Delete />}
                            onClick={() => deleteCourse(course.id)}
                          >
                            Excluir
                          </Button>
                        </CardActions>
                      </Card>
                    </Grid>
                  ))
                )}
              </Grid>
            </Box>
          )}

          {/* Níveis Tab */}
          {currentTab === 1 && (
            <Box>
              <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
                <Typography variant="h6">Gerenciar Níveis</Typography>
              </Box>
              {courses.length === 0 ? (
                <Alert severity="info">
                  Crie um curso primeiro para adicionar níveis.
                </Alert>
              ) : (
                <Grid container spacing={3}>
                  {courses.map((course) => {
                    const courseLevels = levels.filter(l => l.course === course.id)
                    return (
                      <Grid item xs={12} key={course.id}>
                        <Card>
                          <CardContent>
                            <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                              <Typography variant="h6">{course.title}</Typography>
                              <Button
                                size="small"
                                variant="outlined"
                                startIcon={<Add />}
                                onClick={() => {
                                  const title = prompt('Título do nível:')
                                  if (title) {
                                    const desc = prompt('Descrição (opcional):') || ''
                                    createLevel(course.id, title, desc)
                                  }
                                }}
                              >
                                Adicionar Nível
                              </Button>
                            </Box>
                            {courseLevels.length === 0 ? (
                              <Alert severity="info" sx={{ mt: 2 }}>
                                Nenhum nível criado para este curso.
                              </Alert>
                            ) : (
                              <List>
                                {courseLevels.map((level) => (
                                  <ListItem key={level.id}>
                                    <ListItemText
                                      primary={`Nível ${level.level_number}: ${level.title}`}
                                      secondary={level.description || `${level.materials_count || 0} materiais`}
                                    />
                                    <ListItemSecondaryAction>
                                      <IconButton
                                        size="small"
                                        color="error"
                                        onClick={async () => {
                                          if (confirm('Excluir este nível?')) {
                                            try {
                                              await api.delete(`/levels/${level.id}/`)
                                              setSnackbar({ open: true, message: 'Nível excluído!', severity: 'success' })
                                              fetchData()
                                            } catch (error: any) {
                                              setSnackbar({ open: true, message: 'Erro ao excluir', severity: 'error' })
                                            }
                                          }
                                        }}
                                      >
                                        <Delete />
                                      </IconButton>
                                    </ListItemSecondaryAction>
                                  </ListItem>
                                ))}
                              </List>
                            )}
                          </CardContent>
                        </Card>
                      </Grid>
                    )
                  })}
                </Grid>
              )}
            </Box>
          )}

          {/* Materiais Tab */}
          {currentTab === 2 && (
            <Box>
              <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
                <Typography variant="h6">
                  Materiais Disponíveis ({materials.length})
                </Typography>
                <Button
                  variant="contained"
                  startIcon={scanning ? <CircularProgress size={20} /> : <Refresh />}
                  onClick={scanMaterials}
                  disabled={scanning}
                >
                  Escanear Materiais
                </Button>
              </Box>
              <Alert severity="info" sx={{ mb: 3 }}>
                Os materiais são escaneados do diretório: <strong>J:\Ingles\platform</strong>
              </Alert>
              <Paper variant="outlined" sx={{ maxHeight: 600, overflow: 'auto' }}>
                <List>
                  {materials.length === 0 ? (
                    <ListItem>
                      <ListItemText primary="Nenhum material encontrado. Clique em 'Escanear Materiais' para carregar." />
                    </ListItem>
                  ) : (
                    materials.map((material, index) => (
                      <Box key={material.id}>
                        {index > 0 && <Divider />}
                        <ListItem>
                          <Box sx={{ mr: 2 }}>
                            {getMaterialIcon(material.material_type)}
                          </Box>
                          <ListItemText
                            primary={material.title}
                            secondary={
                              <Box>
                                <Typography variant="caption" display="block">
                                  {material.file_path}
                                </Typography>
                                {material.file_size && (
                                  <Typography variant="caption" color="text.secondary">
                                    {formatFileSize(material.file_size)} • {material.material_type.toUpperCase()}
                                  </Typography>
                                )}
                              </Box>
                            }
                          />
                          <ListItemSecondaryAction>
                            <Box display="flex" gap={1} alignItems="center">
                              {material.course_title && (
                                <Chip 
                                  label={material.course_title} 
                                  size="small" 
                                  color="primary" 
                                  variant="outlined"
                                />
                              )}
                              <Chip label={material.material_type.toUpperCase()} size="small" />
                              <IconButton
                                size="small"
                                onClick={() => setAssociateDialog({ open: true, materialId: material.id, courseId: material.course?.toString() || '' })}
                                color="primary"
                              >
                                <LinkIcon />
                              </IconButton>
                            </Box>
                          </ListItemSecondaryAction>
                        </ListItem>
                      </Box>
                    ))
                  )}
                </List>
              </Paper>
            </Box>
          )}

          {/* Upload Tab */}
          {currentTab === 3 && (
            <Box>
              <Typography variant="h6" gutterBottom>
                Upload de Materiais
              </Typography>
              <Paper sx={{ p: 3, mt: 2 }}>
                <FormControl fullWidth sx={{ mb: 2 }}>
                  <InputLabel>Selecione o Curso</InputLabel>
                  <Select
                    value={uploadDialog.courseId}
                    label="Selecione o Curso"
                    onChange={(e) => setUploadDialog({ ...uploadDialog, courseId: e.target.value, levelId: '' })}
                  >
                    {courses.map((course) => (
                      <MenuItem key={course.id} value={course.id.toString()}>
                        {course.title}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>

                {uploadDialog.courseId && (
                  <FormControl fullWidth sx={{ mb: 2 }}>
                    <InputLabel>Nível (Opcional)</InputLabel>
                    <Select
                      value={uploadDialog.levelId}
                      label="Nível (Opcional)"
                      onChange={(e) => setUploadDialog({ ...uploadDialog, levelId: e.target.value })}
                    >
                      <MenuItem value="">Sem nível específico</MenuItem>
                      {levels
                        .filter(l => l.course === parseInt(uploadDialog.courseId))
                        .map((level) => (
                          <MenuItem key={level.id} value={level.id.toString()}>
                            Nível {level.level_number}: {level.title}
                          </MenuItem>
                        ))}
                    </Select>
                  </FormControl>
                )}

                <TextField
                  fullWidth
                  label="Título do Material (opcional)"
                  value={uploadTitle}
                  onChange={(e) => setUploadTitle(e.target.value)}
                  placeholder="Deixe em branco para usar o nome do arquivo"
                  sx={{ mb: 2 }}
                />

                <Button
                  variant="outlined"
                  component="label"
                  fullWidth
                  sx={{ mb: 2 }}
                  startIcon={<Add />}
                >
                  {uploadFile ? uploadFile.name : 'Selecionar Arquivo'}
                  <input
                    type="file"
                    hidden
                    onChange={(e) => {
                      if (e.target.files && e.target.files[0]) {
                        setUploadFile(e.target.files[0])
                        if (!uploadTitle) {
                          setUploadTitle(e.target.files[0].name)
                        }
                      }
                    }}
                  />
                </Button>

                <Button
                  variant="contained"
                  fullWidth
                  onClick={handleFileUpload}
                  disabled={!uploadFile || !uploadDialog.courseId || uploading}
                  startIcon={uploading ? <CircularProgress size={20} /> : <Add />}
                >
                  {uploading ? 'Enviando...' : 'Enviar Arquivo'}
                </Button>

                <Alert severity="info" sx={{ mt: 2 }}>
                  <Typography variant="body2">
                    <strong>Tipos de arquivo suportados:</strong> PDF, MP3, WAV, Vídeos, Imagens, .exe, ZIP, Word, Excel, PowerPoint e outros.
                  </Typography>
                </Alert>
              </Paper>
            </Box>
          )}
        </Paper>
      </Container>

      {/* Create Course Dialog */}
      <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Criar Novo Curso</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Título do Curso"
            fullWidth
            variant="outlined"
            value={newCourse.title}
            onChange={(e) => setNewCourse({ ...newCourse, title: e.target.value })}
            sx={{ mb: 2 }}
          />
          <TextField
            margin="dense"
            label="Descrição"
            fullWidth
            multiline
            rows={4}
            variant="outlined"
            value={newCourse.description}
            onChange={(e) => setNewCourse({ ...newCourse, description: e.target.value })}
            sx={{ mb: 2 }}
          />
          <FormControl fullWidth>
            <InputLabel>Nível do Curso</InputLabel>
            <Select
              value={newCourse.level}
              label="Nível do Curso"
              onChange={(e) => setNewCourse({ ...newCourse, level: e.target.value })}
            >
              <MenuItem value="beginner">Iniciante</MenuItem>
              <MenuItem value="intermediate">Intermediário</MenuItem>
              <MenuItem value="advanced">Avançado</MenuItem>
              <MenuItem value="expert">Expert</MenuItem>
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>Cancelar</Button>
          <Button onClick={createCourse} variant="contained" disabled={!newCourse.title}>
            Criar
          </Button>
        </DialogActions>
      </Dialog>

      {/* Associate Material to Course Dialog */}
      <Dialog open={associateDialog.open} onClose={() => setAssociateDialog({ ...associateDialog, open: false })} maxWidth="sm" fullWidth>
        <DialogTitle>Associar Material ao Curso</DialogTitle>
        <DialogContent>
          <FormControl fullWidth sx={{ mt: 2 }}>
            <InputLabel>Selecione o Curso</InputLabel>
            <Select
              value={associateDialog.courseId}
              onChange={(e) => setAssociateDialog({ ...associateDialog, courseId: e.target.value })}
              label="Selecione o Curso"
            >
              <MenuItem value="">Nenhum (Remover associação)</MenuItem>
              {courses.map((course) => (
                <MenuItem key={course.id} value={course.id.toString()}>
                  {course.title}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setAssociateDialog({ ...associateDialog, open: false })}>Cancelar</Button>
          <Button onClick={associateMaterialToCourse} variant="contained">
            Associar
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert onClose={() => setSnackbar({ ...snackbar, open: false })} severity={snackbar.severity}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  )
}
