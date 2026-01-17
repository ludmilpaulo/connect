'use client'

import { useEffect, useState } from 'react'
import { Container, Typography, Grid, Card, CardContent, CardMedia, CardActions, Button, CircularProgress, Box, AppBar, Toolbar, Chip, Avatar, Menu, MenuItem, IconButton } from '@mui/material'
import { PlayArrow, School, Language, AutoAwesome, Login, Logout, Person } from '@mui/icons-material'
import Link from 'next/link'
import { useAuth } from '@/contexts/AuthContext'
import { useRouter } from 'next/navigation'
import api from '@/utils/axios'

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api'

interface Course {
  id: number
  title: string
  description: string
  thumbnail?: string
  created_at: string
}

export default function Home() {
  const [courses, setCourses] = useState<Course[]>([])
  const [loading, setLoading] = useState(true)
  const { user, logout } = useAuth()
  const router = useRouter()
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null)

  useEffect(() => {
    fetchCourses()
  }, [])

  const fetchCourses = async () => {
    try {
      const response = await api.get('/courses/')
      setCourses(response.data.results || response.data)
      setLoading(false)
    } catch (error) {
      console.error('Error fetching courses:', error)
      setLoading(false)
    }
  }

  const handleMenuClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget)
  }

  const handleMenuClose = () => {
    setAnchorEl(null)
  }

  const handleLogout = () => {
    logout()
    handleMenuClose()
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
            Carregando cursos...
          </Typography>
        </Box>
      </Box>
    )
  }

  return (
    <Box sx={{ minHeight: '100vh', pb: 8 }}>
      <AppBar 
        position="static" 
        elevation={0}
        sx={{ 
          background: 'rgba(255, 255, 255, 0.1)',
          backdropFilter: 'blur(10px)',
          borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
        }}
      >
        <Toolbar sx={{ justifyContent: 'space-between' }}>
          <Box display="flex" alignItems="center" gap={2}>
            <Avatar sx={{ bgcolor: 'secondary.main' }}>
              <School />
            </Avatar>
            <Typography variant="h6" component="div" sx={{ fontWeight: 700, color: 'white' }}>
              Plataforma de Aprendizado de Inglês
            </Typography>
          </Box>
          <Box display="flex" gap={1} alignItems="center">
            <Chip 
              icon={<Language />} 
              label="Aprenda Inglês" 
              sx={{ 
                bgcolor: 'rgba(255, 255, 255, 0.2)',
                color: 'white',
                fontWeight: 600,
              }} 
            />
            {user ? (
              <>
                <Link href="/dashboard">
                  <Chip 
                    label="Dashboard" 
                    sx={{ 
                      bgcolor: 'rgba(255, 255, 255, 0.2)',
                      color: 'white',
                      fontWeight: 600,
                      cursor: 'pointer',
                      '&:hover': {
                        bgcolor: 'rgba(255, 255, 255, 0.3)',
                      }
                    }} 
                  />
                </Link>
                {(user.user_type === 'teacher' || user.user_type === 'admin') && (
                  <Link href="/admin">
                    <Chip 
                      label="Admin" 
                      sx={{ 
                        bgcolor: 'rgba(255, 255, 255, 0.2)',
                        color: 'white',
                        fontWeight: 600,
                        cursor: 'pointer',
                        '&:hover': {
                          bgcolor: 'rgba(255, 255, 255, 0.3)',
                        }
                      }} 
                    />
                  </Link>
                )}
                <IconButton
                  onClick={handleMenuClick}
                  sx={{ color: 'white' }}
                >
                  <Avatar sx={{ width: 32, height: 32, bgcolor: 'secondary.main' }}>
                    {user.first_name?.[0] || user.username[0].toUpperCase()}
                  </Avatar>
                </IconButton>
                <Menu
                  anchorEl={anchorEl}
                  open={Boolean(anchorEl)}
                  onClose={handleMenuClose}
                >
                  <MenuItem onClick={() => { router.push('/dashboard'); handleMenuClose(); }}>
                    <Person sx={{ mr: 1 }} /> Meu Perfil
                  </MenuItem>
                  <MenuItem onClick={handleLogout}>
                    <Logout sx={{ mr: 1 }} /> Sair
                  </MenuItem>
                </Menu>
              </>
            ) : (
              <Link href="/login">
                <Button
                  variant="outlined"
                  startIcon={<Login />}
                  sx={{ 
                    color: 'white',
                    borderColor: 'rgba(255, 255, 255, 0.5)',
                    '&:hover': {
                      borderColor: 'white',
                      bgcolor: 'rgba(255, 255, 255, 0.1)',
                    }
                  }}
                >
                  Entrar
                </Button>
              </Link>
            )}
          </Box>
        </Toolbar>
      </AppBar>

      <Container maxWidth="lg" sx={{ py: 6, px: { xs: 2, sm: 3 } }}>
        <Box textAlign="center" mb={6}>
          <Typography 
            variant="h2" 
            component="h1" 
            gutterBottom 
            sx={{ 
              fontWeight: 800,
              color: 'white',
              mb: 2,
              textShadow: '0 2px 4px rgba(0,0,0,0.1)',
            }}
          >
            Domine o Inglês com Aprendizado Interativo
          </Typography>
          <Typography 
            variant="h6" 
            sx={{ 
              color: 'rgba(255, 255, 255, 0.9)',
              maxWidth: '600px',
              mx: 'auto',
            }}
          >
            Explore nossos cursos abrangentes projetados para ajudá-lo a aprender inglês de forma eficaz
          </Typography>
        </Box>
        
        {courses.length === 0 ? (
          <Card sx={{ p: 4, textAlign: 'center', maxWidth: 600, mx: 'auto' }}>
            <AutoAwesome sx={{ fontSize: 60, color: 'primary.main', mb: 2 }} />
            <Typography variant="h5" gutterBottom>
              Nenhum Curso Disponível Ainda
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
              Crie cursos no painel de administração para começar.
            </Typography>
            <Link href="/admin">
              <Button 
                variant="contained" 
                startIcon={<School />}
              >
                Ir para Painel Admin
              </Button>
            </Link>
          </Card>
        ) : (
          <Grid container spacing={4}>
            {courses.map((course) => (
              <Grid item xs={12} sm={6} md={4} key={course.id}>
                <Card 
                  sx={{ 
                    height: '100%', 
                    display: 'flex', 
                    flexDirection: 'column',
                    background: 'white',
                    overflow: 'hidden',
                  }}
                >
                  <Box
                    sx={{
                      height: 180,
                      background: course.thumbnail 
                        ? `url(${course.thumbnail})` 
                        : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                      backgroundSize: 'cover',
                      backgroundPosition: 'center',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    {!course.thumbnail && (
                      <School sx={{ fontSize: 80, color: 'white', opacity: 0.3 }} />
                    )}
                  </Box>
                  <CardContent sx={{ flexGrow: 1, p: 3 }}>
                    <Typography variant="h5" component="h2" gutterBottom sx={{ fontWeight: 600, mb: 1.5 }}>
                      {course.title}
                    </Typography>
                    <Typography 
                      variant="body2" 
                      color="text.secondary" 
                      sx={{ 
                        mb: 2,
                        display: '-webkit-box',
                        WebkitLineClamp: 3,
                        WebkitBoxOrient: 'vertical',
                        overflow: 'hidden',
                      }}
                    >
                      {course.description || 'Inicie sua jornada de aprendizado de inglês com este curso abrangente.'}
                    </Typography>
                  </CardContent>
                  <CardActions sx={{ p: 2, pt: 0 }}>
                    <Link href={`/courses/${course.id}`} style={{ width: '100%' }}>
                      <Button 
                        fullWidth
                        variant="contained" 
                        startIcon={<PlayArrow />}
                        size="large"
                        sx={{ py: 1.2 }}
                      >
                        Começar Aprendizado
                      </Button>
                    </Link>
                  </CardActions>
                </Card>
              </Grid>
            ))}
          </Grid>
        )}
      </Container>
    </Box>
  )
}
