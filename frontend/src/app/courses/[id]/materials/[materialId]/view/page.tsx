'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import {
  Box, Typography, Paper, Button, CircularProgress, Container,
  Alert, Card, CardContent
} from '@mui/material'
import {
  ArrowBack, PictureAsPdf, MusicNote, InsertDriveFile,
  Description, TableChart, Slideshow, Apps, PlayArrow
} from '@mui/icons-material'
import { useAuth } from '@/contexts/AuthContext'
import api from '@/utils/axios'

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api'

interface Material {
  id: number
  title: string
  material_type: string
  file_url: string
  file_size?: number
}

export default function MaterialView() {
  const params = useParams()
  const router = useRouter()
  const { user, loading: authLoading } = useAuth()
  const [material, setMaterial] = useState<Material | null>(null)
  const [loading, setLoading] = useState(true)
  const [fileBlobUrl, setFileBlobUrl] = useState<string | null>(null)
  const [fileLoading, setFileLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!authLoading) {
      if (!user) {
        router.push('/login')
        return
      }
      if (params.materialId) {
        fetchMaterial(params.materialId as string)
      }
    }
  }, [params.materialId, user, authLoading, router])

  const fetchMaterial = async (id: string) => {
    try {
      const response = await api.get(`/materials/${id}/`)
      setMaterial(response.data)
      loadFile(response.data)
      setLoading(false)
    } catch (error) {
      console.error('Error fetching material:', error)
      setError('Erro ao carregar material')
      setLoading(false)
    }
  }

  const loadFile = async (mat: Material) => {
    setFileLoading(true)
    try {
      const fileUrl = `/materials/${mat.id}/file/`
      const response = await api.get(fileUrl, {
        responseType: 'blob',
        headers: {
          'Accept': '*/*'
        }
      })
      
      const blob = new Blob([response.data])
      const url = URL.createObjectURL(blob)
      setFileBlobUrl(url)
      setFileLoading(false)
    } catch (error) {
      console.error('Error loading file:', error)
      setError('Erro ao carregar arquivo')
      setFileLoading(false)
    }
  }

  const getMaterialIcon = (type: string) => {
    switch (type) {
      case 'pdf':
        return <PictureAsPdf color="error" sx={{ fontSize: 40 }} />
      case 'mp3':
      case 'wav':
        return <MusicNote color="success" sx={{ fontSize: 40 }} />
      case 'doc':
        return <Description color="primary" sx={{ fontSize: 40 }} />
      case 'xls':
        return <TableChart color="success" sx={{ fontSize: 40 }} />
      case 'ppt':
        return <Slideshow color="warning" sx={{ fontSize: 40 }} />
      case 'exe':
        return <Apps color="info" sx={{ fontSize: 40 }} />
      default:
        return <InsertDriveFile sx={{ fontSize: 40 }} />
    }
  }

  const getViewerComponent = () => {
    if (!material || !fileBlobUrl) return null

    const type = material.material_type

    // PDF Viewer
    if (type === 'pdf') {
      return (
        <iframe
          src={`${fileBlobUrl}#toolbar=1&navpanes=1&scrollbar=1`}
          style={{
            width: '100%',
            height: '80vh',
            minHeight: '600px',
            border: 'none'
          }}
          title="PDF Viewer"
        />
      )
    }

    // Audio Player
    if (type === 'mp3' || type === 'wav') {
      return (
        <Box sx={{ textAlign: 'center', py: 8 }}>
          <audio
            controls
            src={fileBlobUrl}
            style={{ width: '100%', maxWidth: '600px' }}
            autoPlay={false}
          >
            Seu navegador não suporta o elemento de áudio.
          </audio>
        </Box>
      )
    }

    // Word Documents - Show in iframe (browser will handle if possible)
    if (type === 'doc') {
      return (
        <Box>
          <Alert severity="info" sx={{ mb: 2 }}>
            <Typography variant="body2">
              Este documento Word está disponível para visualização. O navegador tentará exibir o conteúdo quando possível.
            </Typography>
          </Alert>
          <iframe
            src={fileBlobUrl}
            style={{
              width: '100%',
              height: '80vh',
              minHeight: '600px',
              border: '1px solid #ddd',
              borderRadius: '4px'
            }}
            title="Word Viewer"
          />
          <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
            Nota: Se o documento não aparecer, seu navegador pode não suportar a visualização direta deste tipo de arquivo.
          </Typography>
        </Box>
      )
    }

    // Excel Documents - Show in iframe (browser will handle if possible)
    if (type === 'xls') {
      return (
        <Box>
          <Alert severity="info" sx={{ mb: 2 }}>
            <Typography variant="body2">
              Esta planilha Excel está disponível para visualização. O navegador tentará exibir o conteúdo quando possível.
            </Typography>
          </Alert>
          <iframe
            src={fileBlobUrl}
            style={{
              width: '100%',
              height: '80vh',
              minHeight: '600px',
              border: '1px solid #ddd',
              borderRadius: '4px'
            }}
            title="Excel Viewer"
          />
          <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
            Nota: Se a planilha não aparecer, seu navegador pode não suportar a visualização direta deste tipo de arquivo.
          </Typography>
        </Box>
      )
    }

    // PowerPoint Documents - Show in iframe (browser will handle if possible)
    if (type === 'ppt') {
      return (
        <Box>
          <Alert severity="info" sx={{ mb: 2 }}>
            <Typography variant="body2">
              Esta apresentação PowerPoint está disponível para visualização. O navegador tentará exibir o conteúdo quando possível.
            </Typography>
          </Alert>
          <iframe
            src={fileBlobUrl}
            style={{
              width: '100%',
              height: '80vh',
              minHeight: '600px',
              border: '1px solid #ddd',
              borderRadius: '4px'
            }}
            title="PowerPoint Viewer"
          />
          <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
            Nota: Se a apresentação não aparecer, seu navegador pode não suportar a visualização direta deste tipo de arquivo.
          </Typography>
        </Box>
      )
    }

    // Executable files - Allow execution via iframe or object tag
    if (type === 'exe') {
      return (
        <Box>
          <Alert severity="info" sx={{ mb: 2 }}>
            <Typography variant="body2">
              Este é um arquivo executável. Clique no botão abaixo para executar o aplicativo na plataforma.
            </Typography>
          </Alert>
          <Card sx={{ p: 4, textAlign: 'center' }}>
            <CardContent>
              <Apps sx={{ fontSize: 80, color: 'primary.main', mb: 2 }} />
              <Typography variant="h5" gutterBottom>
                {material.title}
              </Typography>
              {material.file_size && (
                <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                  Tamanho: {(material.file_size / (1024 * 1024)).toFixed(2)} MB
                </Typography>
              )}
              <Box sx={{ mt: 3 }}>
                <Box
                  sx={{
                    width: '100%',
                    minHeight: '600px',
                    border: '2px dashed #ddd',
                    borderRadius: '4px',
                    p: 4,
                    textAlign: 'center',
                    bgcolor: 'grey.50',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                >
                  <PlayArrow sx={{ fontSize: 80, color: 'primary.main', mb: 2 }} />
                  <Typography variant="h6" gutterBottom>
                    Aplicativo Pronto para Execução
                  </Typography>
                  <Typography variant="body2" color="text.secondary" paragraph>
                    Clique no botão abaixo para executar o aplicativo "{material.title}" na plataforma.
                  </Typography>
                  <Button
                    variant="contained"
                    size="large"
                    startIcon={<PlayArrow />}
                    onClick={() => {
                      // Create an iframe to execute the .exe
                      const iframe = document.createElement('iframe')
                      iframe.src = fileBlobUrl
                      iframe.style.display = 'none'
                      iframe.style.width = '100%'
                      iframe.style.height = '600px'
                      iframe.style.border = 'none'
                      
                      // Try to execute via object tag
                      const container = document.getElementById('exe-container')
                      if (container) {
                        container.innerHTML = ''
                        const object = document.createElement('object')
                        object.data = fileBlobUrl
                        object.type = 'application/x-msdownload'
                        object.style.width = '100%'
                        object.style.height = '600px'
                        object.style.border = '1px solid #ddd'
                        object.style.borderRadius = '4px'
                        container.appendChild(object)
                      }
                    }}
                    sx={{ mt: 2, minWidth: 200 }}
                  >
                    Executar Aplicativo
                  </Button>
                  <Box id="exe-container" sx={{ width: '100%', mt: 3, minHeight: '400px' }} />
                </Box>
              </Box>
              <Typography variant="caption" color="text.secondary" sx={{ mt: 2, display: 'block' }}>
                Nota: O aplicativo será executado na plataforma. Se não iniciar automaticamente, use o botão "Executar Aplicativo".
              </Typography>
            </CardContent>
          </Card>
        </Box>
      )
    }

    // Default: Show file info
    return (
      <Card sx={{ p: 4, textAlign: 'center' }}>
        <CardContent>
          {getMaterialIcon(type)}
          <Typography variant="h5" gutterBottom sx={{ mt: 2 }}>
            {material.title}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Tipo de arquivo: {type.toUpperCase()}
          </Typography>
          {material.file_size && (
            <Typography variant="body2" color="text.secondary">
              Tamanho: {(material.file_size / (1024 * 1024)).toFixed(2)} MB
            </Typography>
          )}
        </CardContent>
      </Card>
    )
  }

  if (loading || authLoading) {
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
        <CircularProgress size={60} sx={{ color: 'white' }} />
      </Box>
    )
  }

  if (error || !material) {
    return (
      <Box sx={{ minHeight: '100vh', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', p: 4 }}>
        <Container maxWidth="lg">
          <Button
            startIcon={<ArrowBack />}
            onClick={() => router.back()}
            sx={{ mb: 2, color: 'white' }}
          >
            Voltar
          </Button>
          <Paper sx={{ p: 4, textAlign: 'center' }}>
            <Alert severity="error">{error || 'Material não encontrado'}</Alert>
          </Paper>
        </Container>
      </Box>
    )
  }

  return (
    <Box sx={{ minHeight: '100vh', background: '#f5f5f5' }}>
      <Paper elevation={2} sx={{ p: 2, borderRadius: 0 }}>
        <Box display="flex" alignItems="center" gap={2}>
          <Button
            startIcon={<ArrowBack />}
            onClick={() => router.back()}
          >
            Voltar
          </Button>
          <Box display="flex" alignItems="center" gap={1}>
            {getMaterialIcon(material.material_type)}
            <Typography variant="h6" sx={{ fontWeight: 600 }}>
              {material.title}
            </Typography>
          </Box>
        </Box>
      </Paper>

      <Container maxWidth="xl" sx={{ py: 4 }}>
        <Paper elevation={0} sx={{ p: 3, minHeight: '80vh' }}>
          {fileLoading ? (
            <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
              <CircularProgress size={60} />
            </Box>
          ) : fileBlobUrl ? (
            getViewerComponent()
          ) : (
            <Alert severity="warning">
              Não foi possível carregar o arquivo. Por favor, tente novamente.
            </Alert>
          )}
        </Paper>
      </Container>
    </Box>
  )
}
