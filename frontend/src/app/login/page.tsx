'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  Container, Typography, Box, Paper, TextField, Button,
  Alert, CircularProgress, Link as MuiLink, Divider, Tabs, Tab, Grid, Chip
} from '@mui/material'
import { Login as LoginIcon, PersonAdd, School, Person, AutoAwesome, Verified, Lock } from '@mui/icons-material'
import axios from 'axios'
import Link from 'next/link'
import { saveTokens, saveUser } from '@/utils/auth'

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api'

export default function LoginPage() {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState(0)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  
  // Login form
  const [loginData, setLoginData] = useState({ username: '', password: '' })
  
  // Register form
  const [registerData, setRegisterData] = useState({
    username: '',
    email: '',
    password: '',
    password_confirm: '',
    first_name: '',
    last_name: '',
    user_type: 'student',
    phone: ''
  })

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const response = await axios.post(`${API_BASE_URL}/auth/login/`, {
        username: loginData.username.trim(),
        password: loginData.password
      })
      
      if (response.data.tokens && response.data.user) {
        saveTokens(response.data.tokens)
        saveUser(response.data.user)
        router.push('/dashboard')
      } else {
        setError('Resposta inválida do servidor')
        setLoading(false)
      }
    } catch (error: any) {
      console.error('Login error:', error)
      let errorMessage: string
      if (!error.response) {
        errorMessage = 'Não foi possível conectar ao servidor. Verifique se o backend está em execução (http://localhost:8000).'
      } else if (error.response.status === 401) {
        errorMessage = error.response?.data?.error || 'Usuário ou senha incorretos. Use o nome de usuário (não o e-mail) e verifique se o Caps Lock está desligado.'
      } else {
        errorMessage = error.response?.data?.error || error.response?.data?.detail || error.message || 'Erro ao fazer login.'
      }
      setError(errorMessage)
      setLoading(false)
    }
  }

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    if (registerData.password !== registerData.password_confirm) {
      setError('As senhas não coincidem')
      setLoading(false)
      return
    }

    try {
      const response = await axios.post(`${API_BASE_URL}/auth/register/`, registerData)
      
      saveTokens(response.data.tokens)
      saveUser(response.data.user)
      
      router.push('/dashboard')
    } catch (error: any) {
      setError(error.response?.data?.error || 'Erro ao criar conta')
      setLoading(false)
    }
  }

  return (
    <Box sx={{ 
      minHeight: '100vh', 
      background: 'radial-gradient(900px circle at 20% 10%, rgba(37, 99, 235, 0.30), transparent 40%), radial-gradient(900px circle at 90% 20%, rgba(124, 58, 237, 0.25), transparent 45%), linear-gradient(135deg, #0B1220 0%, #101A33 40%, #0B1220 100%)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      py: { xs: 4, md: 6 },
      px: { xs: 2, md: 3 },
    }}>
      <Container maxWidth="md">
        <Paper
          elevation={0}
          sx={{
            overflow: 'hidden',
            borderRadius: 4,
            background: 'rgba(255,255,255,0.92)',
            backdropFilter: 'blur(14px)',
            boxShadow: '0 30px 80px rgba(0,0,0,0.35)',
          }}
        >
          <Grid container>
            {/* Left: Brand / Value prop */}
            <Grid
              item
              xs={12}
              md={5}
              sx={{
                p: { xs: 3, sm: 4, md: 5 },
                color: 'white',
                background:
                  'radial-gradient(700px circle at 20% 20%, rgba(255,255,255,0.18), transparent 35%), linear-gradient(135deg, #2563EB 0%, #7C3AED 60%, #1D4ED8 100%)',
                position: 'relative',
              }}
            >
              <Box display="flex" alignItems="center" gap={1.5} mb={2.5}>
                <Box
                  sx={{
                    width: 44,
                    height: 44,
                    borderRadius: 2.5,
                    display: 'grid',
                    placeItems: 'center',
                    bgcolor: 'rgba(255,255,255,0.18)',
                    border: '1px solid rgba(255,255,255,0.25)',
                  }}
                >
                  <School sx={{ color: 'white' }} />
                </Box>
                <Typography variant="h6" sx={{ fontWeight: 800, letterSpacing: '-0.02em' }}>
                  English Learning
                </Typography>
              </Box>

              <Typography variant="h3" sx={{ fontWeight: 900, lineHeight: 1.05, mb: 1.5 }}>
                Aprenda inglês com foco e clareza.
              </Typography>
              <Typography sx={{ opacity: 0.92, mb: 3.5 }}>
                Cursos organizados por níveis, com materiais (PDF, áudio e apps) para acelerar seu progresso.
              </Typography>

              <Box display="flex" flexWrap="wrap" gap={1} mb={3.5}>
                <Chip
                  icon={<Verified />}
                  label="Conteúdo organizado"
                  sx={{ bgcolor: 'rgba(255,255,255,0.18)', color: 'white' }}
                />
                <Chip
                  icon={<AutoAwesome />}
                  label="UI profissional"
                  sx={{ bgcolor: 'rgba(255,255,255,0.18)', color: 'white' }}
                />
                <Chip
                  icon={<Lock />}
                  label="Acesso seguro (JWT)"
                  sx={{ bgcolor: 'rgba(255,255,255,0.18)', color: 'white' }}
                />
              </Box>

              <Box sx={{ opacity: 0.92 }}>
                <Typography variant="subtitle1" sx={{ fontWeight: 800, mb: 1 }}>
                  O que você ganha
                </Typography>
                <Box component="ul" sx={{ m: 0, pl: 2.2 }}>
                  <Box component="li" sx={{ mb: 0.6 }}>
                    <Typography variant="body2" sx={{ opacity: 0.95 }}>
                      Aulas e níveis com trilha clara
                    </Typography>
                  </Box>
                  <Box component="li" sx={{ mb: 0.6 }}>
                    <Typography variant="body2" sx={{ opacity: 0.95 }}>
                      Visualização na plataforma (sem download)
                    </Typography>
                  </Box>
                  <Box component="li">
                    <Typography variant="body2" sx={{ opacity: 0.95 }}>
                      Progresso do aluno e experiência moderna
                    </Typography>
                  </Box>
                </Box>
              </Box>
            </Grid>

            {/* Right: Auth */}
            <Grid item xs={12} md={7} sx={{ p: { xs: 3, sm: 4, md: 5 } }}>
              <Box mb={2.5}>
                <Typography variant="h4" sx={{ fontWeight: 900, letterSpacing: '-0.02em' }}>
                  {activeTab === 0 ? 'Bem-vindo de volta' : 'Criar conta'}
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mt: 0.75 }}>
                  {activeTab === 0
                    ? 'Entre com seu usuário ou e-mail para continuar.'
                    : 'Crie seu acesso para começar a estudar.'}
                </Typography>
              </Box>

              <Tabs
                value={activeTab}
                onChange={(_, newValue) => setActiveTab(newValue)}
                sx={{
                  mb: 3,
                  '& .MuiTabs-indicator': { height: 3, borderRadius: 2 },
                }}
              >
                <Tab label="Entrar" icon={<LoginIcon />} iconPosition="start" />
                <Tab label="Registrar" icon={<PersonAdd />} iconPosition="start" />
              </Tabs>

              {error && (
                <Alert
                  severity="error"
                  sx={{ mb: 3, borderRadius: 2 }}
                  onClose={() => setError('')}
                >
                  {error}
                </Alert>
              )}

              {activeTab === 0 ? (
                <form onSubmit={handleLogin}>
                  <TextField
                    fullWidth
                    label="Nome de usuário ou Email"
                    value={loginData.username}
                    onChange={(e) => setLoginData({ ...loginData, username: e.target.value })}
                    required
                    sx={{ mb: 2 }}
                  />
                  <TextField
                    fullWidth
                    label="Senha"
                    type="password"
                    value={loginData.password}
                    onChange={(e) => setLoginData({ ...loginData, password: e.target.value })}
                    required
                    sx={{ mb: 3 }}
                  />
                  <Button
                    type="submit"
                    fullWidth
                    variant="contained"
                    size="large"
                    disabled={loading}
                    startIcon={loading ? <CircularProgress size={20} /> : <LoginIcon />}
                    sx={{ mb: 2, py: 1.2 }}
                  >
                    {loading ? 'Entrando...' : 'Entrar'}
                  </Button>
                </form>
              ) : (
                <form onSubmit={handleRegister}>
                  <TextField
                    fullWidth
                    label="Nome de usuário"
                    value={registerData.username}
                    onChange={(e) => setRegisterData({ ...registerData, username: e.target.value })}
                    required
                    sx={{ mb: 2 }}
                  />
                  <TextField
                    fullWidth
                    label="Email"
                    type="email"
                    value={registerData.email}
                    onChange={(e) => setRegisterData({ ...registerData, email: e.target.value })}
                    required
                    sx={{ mb: 2 }}
                  />
                  <Box display="flex" gap={2} mb={2} flexDirection={{ xs: 'column', sm: 'row' }}>
                    <TextField
                      fullWidth
                      label="Nome"
                      value={registerData.first_name}
                      onChange={(e) => setRegisterData({ ...registerData, first_name: e.target.value })}
                      sx={{ flex: 1 }}
                    />
                    <TextField
                      fullWidth
                      label="Sobrenome"
                      value={registerData.last_name}
                      onChange={(e) => setRegisterData({ ...registerData, last_name: e.target.value })}
                      sx={{ flex: 1 }}
                    />
                  </Box>
                  <TextField
                    fullWidth
                    label="Tipo de usuário"
                    select
                    SelectProps={{ native: true }}
                    value={registerData.user_type}
                    onChange={(e) => setRegisterData({ ...registerData, user_type: e.target.value })}
                    sx={{ mb: 2 }}
                  >
                    <option value="student">Estudante</option>
                    <option value="teacher">Professor</option>
                  </TextField>
                  <TextField
                    fullWidth
                    label="Telefone (opcional)"
                    value={registerData.phone}
                    onChange={(e) => setRegisterData({ ...registerData, phone: e.target.value })}
                    sx={{ mb: 2 }}
                  />
                  <TextField
                    fullWidth
                    label="Senha"
                    type="password"
                    value={registerData.password}
                    onChange={(e) => setRegisterData({ ...registerData, password: e.target.value })}
                    required
                    sx={{ mb: 2 }}
                  />
                  <TextField
                    fullWidth
                    label="Confirmar Senha"
                    type="password"
                    value={registerData.password_confirm}
                    onChange={(e) => setRegisterData({ ...registerData, password_confirm: e.target.value })}
                    required
                    sx={{ mb: 3 }}
                  />
                  <Button
                    type="submit"
                    fullWidth
                    variant="contained"
                    size="large"
                    disabled={loading}
                    startIcon={loading ? <CircularProgress size={20} /> : <PersonAdd />}
                    sx={{ mb: 2, py: 1.2 }}
                  >
                    {loading ? 'Criando conta...' : 'Criar Conta'}
                  </Button>
                </form>
              )}

              <Divider sx={{ my: 3 }} />

              <Box textAlign="center">
                <Link href="/" style={{ textDecoration: 'none' }}>
                  <MuiLink component="span" color="text.secondary">
                    Voltar à página inicial
                  </MuiLink>
                </Link>
              </Box>
            </Grid>
          </Grid>
        </Paper>
      </Container>
    </Box>
  )
}
