'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  Container, Typography, Box, Paper, TextField, Button,
  Alert, CircularProgress, Link as MuiLink, Divider, Tabs, Tab
} from '@mui/material'
import { Login as LoginIcon, PersonAdd, School, Person } from '@mui/icons-material'
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
      const errorMessage = error.response?.data?.error || 
                          error.response?.data?.detail || 
                          error.message || 
                          'Erro ao fazer login. Verifique suas credenciais.'
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
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      py: 4
    }}>
      <Container maxWidth="sm">
        <Paper elevation={10} sx={{ p: 4, borderRadius: 3 }}>
          <Box textAlign="center" mb={3}>
            <School sx={{ fontSize: 60, color: 'primary.main', mb: 2 }} />
            <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>
              Plataforma de Aprendizado de Inglês
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Entre ou crie sua conta para começar
            </Typography>
          </Box>

          <Tabs value={activeTab} onChange={(_, newValue) => setActiveTab(newValue)} sx={{ mb: 3 }}>
            <Tab label="Entrar" icon={<LoginIcon />} iconPosition="start" />
            <Tab label="Registrar" icon={<PersonAdd />} iconPosition="start" />
          </Tabs>

          {error && (
            <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError('')}>
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
                sx={{ mb: 2 }}
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
              <Box display="flex" gap={2} mb={2}>
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
                sx={{ mb: 2 }}
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
        </Paper>
      </Container>
    </Box>
  )
}
