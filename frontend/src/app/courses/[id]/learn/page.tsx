'use client'

import { useEffect, useState, useRef } from 'react'
import { useParams, useRouter } from 'next/navigation'
import {
  Box, Typography, Paper, Button, CircularProgress, List,
  ListItem, ListItemButton, ListItemText, ListItemIcon, Divider,
  Chip, IconButton, Slider, Alert, Avatar, Container
} from '@mui/material'
import {
  ArrowBack, PictureAsPdf, MusicNote, PlayArrow, Pause,
  VolumeUp, SkipNext, SkipPrevious, CheckCircle, Book, School
} from '@mui/icons-material'
import { useAuth } from '@/contexts/AuthContext'
import api from '@/utils/axios'
import { markMaterialCompleted, isMaterialCompleted } from '@/utils/progress'

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api'

interface Material {
  id: number
  title: string
  material_type: string
  file_url: string
  file_size?: number
  duration?: number
  order: number
  level?: number | null
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
  levels?: Level[]
  materials: Material[]
}

interface MaterialPair {
  pdf: Material | null
  audio: Material | null
  title: string
}

export default function CourseLearn() {
  const params = useParams()
  const router = useRouter()
  const { user, loading: authLoading } = useAuth()
  const audioRef = useRef<HTMLAudioElement>(null)
  const [course, setCourse] = useState<Course | null>(null)
  const [loading, setLoading] = useState(true)
  const [selectedLevel, setSelectedLevel] = useState<Level | null>(null)
  const [materialPairs, setMaterialPairs] = useState<MaterialPair[]>([])
  const [selectedPair, setSelectedPair] = useState<MaterialPair | null>(null)
  const [playing, setPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [volume, setVolume] = useState(100)
  const [pdfBlobUrl, setPdfBlobUrl] = useState<string | null>(null)
  const [pdfLoading, setPdfLoading] = useState(false)
  const [pdfError, setPdfError] = useState<string | null>(null)
  const [audioBlobUrl, setAudioBlobUrl] = useState<string | null>(null)
  const [audioLoading, setAudioLoading] = useState(false)

  useEffect(() => {
    if (!authLoading) {
      if (!user) {
        router.push('/login')
        return
      }
      if (params.id) {
        fetchCourse(params.id as string)
      }
    }
  }, [params.id, user, authLoading, router])

  // Audio playback controls
  useEffect(() => {
    const audio = audioRef.current
    if (!audio) return

    const updateTime = () => setCurrentTime(audio.currentTime)
    const updateDuration = () => setDuration(audio.duration)
    const handleEnded = () => {
      setPlaying(false)
      if (selectedPair?.audio && course) {
        markMaterialCompleted(course.id, selectedPair.audio.id)
      }
    }

    audio.addEventListener('timeupdate', updateTime)
    audio.addEventListener('loadedmetadata', updateDuration)
    audio.addEventListener('ended', handleEnded)
    audio.volume = volume / 100

    return () => {
      audio.removeEventListener('timeupdate', updateTime)
      audio.removeEventListener('loadedmetadata', updateDuration)
      audio.removeEventListener('ended', handleEnded)
    }
  }, [selectedPair, volume, course])

  useEffect(() => {
    if (playing && audioRef.current) {
      audioRef.current.play()
    } else if (!playing && audioRef.current) {
      audioRef.current.pause()
    }
  }, [playing])

  // Load PDF as blob when selectedPair.pdf changes
  useEffect(() => {
    let pdfBlob: string | null = null

    if (selectedPair?.pdf) {
      setPdfLoading(true)
      setPdfBlobUrl(null)
      setPdfError(null)

      // Use full URL to ensure proper request
      const pdfUrl = `${API_BASE_URL}/materials/${selectedPair.pdf.id}/file/`
      
      api.get(pdfUrl, {
        responseType: 'blob',
        headers: {
          'Accept': 'application/pdf'
        },
        timeout: 60000 // 60 seconds timeout for large files
      })
        .then(response => {
          const blob = new Blob([response.data], { type: 'application/pdf' })
          const url = URL.createObjectURL(blob)
          pdfBlob = url
          setPdfBlobUrl(url)
          setPdfLoading(false)
        })
        .catch(error => {
          console.error('Error loading PDF:', error)
          if (error.code === 'ECONNABREFUSED' || error.message === 'Network Error') {
            setPdfError('Não foi possível conectar ao servidor. Verifique se o backend está rodando.')
          } else if (error.response?.status === 404) {
            setPdfError('PDF não encontrado no servidor')
          } else if (error.response?.status === 401) {
            setPdfError('Sessão expirada. Por favor, faça login novamente.')
          } else {
            setPdfError('Erro ao carregar PDF. Por favor, tente novamente.')
          }
          setPdfLoading(false)
        })
    } else {
      setPdfBlobUrl(null)
      setPdfLoading(false)
    }

    return () => {
      if (pdfBlob) {
        URL.revokeObjectURL(pdfBlob)
      }
    }
  }, [selectedPair?.pdf?.id])

  // Load Audio as blob when selectedPair.audio changes
  useEffect(() => {
    let audioBlob: string | null = null

    if (selectedPair?.audio) {
      setAudioLoading(true)
      setAudioBlobUrl(null)

      // Use full URL to ensure proper request
      const audioUrl = `${API_BASE_URL}/materials/${selectedPair.audio.id}/file/`
      
      api.get(audioUrl, {
        responseType: 'blob',
        headers: {
          'Accept': 'audio/mpeg, audio/*'
        },
        timeout: 60000 // 60 seconds timeout for large files
      })
        .then(response => {
          const blob = new Blob([response.data], { type: 'audio/mpeg' })
          const url = URL.createObjectURL(blob)
          audioBlob = url
          setAudioBlobUrl(url)
          setAudioLoading(false)
        })
        .catch(error => {
          console.error('Error loading audio:', error)
          if (error.code === 'ECONNABREFUSED' || error.message === 'Network Error') {
            console.error('Backend não está respondendo')
          } else if (error.response?.status === 404) {
            console.error('Áudio não encontrado')
          } else if (error.response?.status === 401) {
            console.error('Sessão expirada')
          }
          setAudioLoading(false)
          // Fallback to file_url if blob loading fails
          if (selectedPair.audio?.file_url) {
            setAudioBlobUrl(selectedPair.audio.file_url)
          }
        })
    } else {
      setAudioBlobUrl(null)
      setAudioLoading(false)
    }

    return () => {
      if (audioBlob) {
        URL.revokeObjectURL(audioBlob)
      }
    }
  }, [selectedPair?.audio?.id])

  const fetchCourse = async (id: string) => {
    try {
      const response = await api.get(`/courses/${id}/`)
      const courseData = response.data
      setCourse(courseData)
      
      // Select first level if available
      if (courseData.levels && courseData.levels.length > 0) {
        const firstLevel = courseData.levels[0]
        setSelectedLevel(firstLevel)
        const pairs = organizeMaterialsIntoPairs(firstLevel.materials || [])
        setMaterialPairs(pairs)
        if (pairs.length > 0) {
          setSelectedPair(pairs[0])
        }
      } else {
        // Fallback to direct materials
        const pairs = organizeMaterialsIntoPairs(courseData.materials || [])
        setMaterialPairs(pairs)
        if (pairs.length > 0) {
          setSelectedPair(pairs[0])
        }
      }
      
      setLoading(false)
    } catch (error) {
      console.error('Error fetching course:', error)
      setLoading(false)
    }
  }

  const organizeMaterialsIntoPairs = (materials: Material[]): MaterialPair[] => {
    const pairs: MaterialPair[] = []
    const pdfs = materials.filter(m => m.material_type === 'pdf')
    const audios = materials.filter(m => m.material_type === 'mp3' || m.material_type === 'wav')
    
    const processedPdfs = new Set<number>()
    const processedAudios = new Set<number>()
    
    pdfs.forEach(pdf => {
      const audioMatch = audios.find(audio => {
        if (processedAudios.has(audio.id)) return false
        const pdfName = pdf.title.toLowerCase().replace('.pdf', '').trim()
        const audioName = audio.title.toLowerCase().replace(/\.(mp3|wav)$/, '').trim()
        return pdfName.includes(audioName) || audioName.includes(pdfName) ||
               pdfName.split(' ')[0] === audioName.split(' ')[0]
      })
      
      if (audioMatch) {
        processedPdfs.add(pdf.id)
        processedAudios.add(audioMatch.id)
        pairs.push({
          pdf,
          audio: audioMatch,
          title: pdf.title.replace('.pdf', '')
        })
      } else {
        processedPdfs.add(pdf.id)
        pairs.push({
          pdf,
          audio: null,
          title: pdf.title.replace('.pdf', '')
        })
      }
    })
    
    audios.forEach(audio => {
      if (!processedAudios.has(audio.id)) {
        pairs.push({
          pdf: null,
          audio,
          title: audio.title.replace(/\.(mp3|wav)$/, '')
        })
      }
    })
    
    return pairs.sort((a, b) => {
      const aNum = parseInt(a.title.match(/\d+/)?.[0] || '0')
      const bNum = parseInt(b.title.match(/\d+/)?.[0] || '0')
      return aNum - bNum
    })
  }

  const formatTime = (seconds: number) => {
    if (isNaN(seconds)) return '0:00'
    const mins = Math.floor(seconds / 60)
    const secs = Math.floor(seconds % 60)
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  const handleTimeChange = (value: number | number[]) => {
    const time = Array.isArray(value) ? value[0] : value
    if (audioRef.current) {
      audioRef.current.currentTime = time
      setCurrentTime(time)
    }
  }

  const handleVolumeChange = (value: number | number[]) => {
    const vol = Array.isArray(value) ? value[0] : value
    setVolume(vol)
  }

  const selectLevel = (level: Level) => {
    setSelectedLevel(level)
    const pairs = organizeMaterialsIntoPairs(level.materials || [])
    setMaterialPairs(pairs)
    if (pairs.length > 0) {
      setSelectedPair(pairs[0])
      setPlaying(false)
    } else {
      setSelectedPair(null)
    }
  }

  const selectPair = (pair: MaterialPair) => {
    setSelectedPair(pair)
    setPlaying(false)
    if (pair.audio && course) {
      const wasCompleted = isMaterialCompleted(course.id, pair.audio.id)
      if (!wasCompleted) {
        markMaterialCompleted(course.id, pair.audio.id)
      }
    }
  }

  const nextPair = () => {
    const currentIndex = materialPairs.indexOf(selectedPair!)
    if (currentIndex < materialPairs.length - 1) {
      selectPair(materialPairs[currentIndex + 1])
    }
  }

  const previousPair = () => {
    const currentIndex = materialPairs.indexOf(selectedPair!)
    if (currentIndex > 0) {
      selectPair(materialPairs[currentIndex - 1])
    }
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

  if (!course) {
    return (
      <Box sx={{ minHeight: '100vh', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', p: 4, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Container maxWidth="sm">
          <Alert severity="error">Curso não encontrado</Alert>
          <Button
            startIcon={<ArrowBack />}
            onClick={() => router.push('/')}
            sx={{ mt: 2 }}
            variant="contained"
          >
            Voltar aos Cursos
          </Button>
        </Container>
      </Box>
    )
  }

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100vh', overflow: 'hidden' }}>
      {/* Header */}
      <Paper
        elevation={0}
        sx={{
          p: 2,
          borderRadius: 0,
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          color: 'white'
        }}
      >
        <Box display="flex" alignItems="center" justifyContent="space-between">
          <Box display="flex" alignItems="center" gap={2}>
            <Button
              startIcon={<ArrowBack />}
              onClick={() => router.push(`/courses/${params.id}`)}
              sx={{ color: 'white' }}
            >
              Voltar
            </Button>
            <Divider orientation="vertical" flexItem sx={{ borderColor: 'rgba(255,255,255,0.3)' }} />
            <Avatar sx={{ bgcolor: 'rgba(255,255,255,0.2)' }}>
              <School />
            </Avatar>
            <Box>
              <Typography variant="h6" sx={{ fontWeight: 700 }}>
                {course.title}
              </Typography>
              {selectedLevel && (
                <Typography variant="caption" sx={{ opacity: 0.9 }}>
                  Nível {selectedLevel.level_number}: {selectedLevel.title}
                </Typography>
              )}
            </Box>
          </Box>
        </Box>
      </Paper>

      <Box sx={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
        {/* Left Sidebar - Levels */}
        <Paper
          elevation={0}
          sx={{
            width: 280,
            borderRight: '1px solid rgba(0,0,0,0.12)',
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden'
          }}
        >
          <Box sx={{ p: 2, borderBottom: '1px solid rgba(0,0,0,0.12)' }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 1 }}>
              Níveis do Curso
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {course.levels?.length || 0} níveis disponíveis
            </Typography>
          </Box>
          <Box sx={{ flex: 1, overflow: 'auto' }}>
            {course.levels && course.levels.length > 0 ? (
              <List dense>
                {course.levels.map((level) => (
                  <ListItem key={level.id} disablePadding>
                    <ListItemButton
                      selected={selectedLevel?.id === level.id}
                      onClick={() => selectLevel(level)}
                      sx={{
                        '&.Mui-selected': {
                          bgcolor: 'primary.light',
                          color: 'primary.contrastText',
                          '&:hover': {
                            bgcolor: 'primary.light',
                          }
                        }
                      }}
                    >
                      <ListItemIcon>
                        <Avatar
                          sx={{
                            width: 32,
                            height: 32,
                            bgcolor: selectedLevel?.id === level.id ? 'primary.main' : 'grey.300',
                            color: selectedLevel?.id === level.id ? 'white' : 'text.primary'
                          }}
                        >
                          {level.level_number}
                        </Avatar>
                      </ListItemIcon>
                      <ListItemText
                        primary={level.title}
                        secondary={`${level.materials?.length || 0} materiais`}
                      />
                    </ListItemButton>
                  </ListItem>
                ))}
              </List>
            ) : (
              <Box sx={{ p: 2, textAlign: 'center' }}>
                <Typography variant="body2" color="text.secondary">
                  Nenhum nível disponível
                </Typography>
              </Box>
            )}
          </Box>
        </Paper>

        {/* Main Content Area */}
        <Box sx={{ display: 'flex', flex: 1, flexDirection: 'column', overflow: 'hidden' }}>
          {/* Materials List */}
          {materialPairs.length > 0 && (
            <Paper
              elevation={0}
              sx={{
                p: 2,
                borderBottom: '1px solid rgba(0,0,0,0.12)',
                maxHeight: 200,
                overflow: 'auto'
              }}
            >
              <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
                Materiais do Nível
              </Typography>
              <Box display="flex" gap={1} flexWrap="wrap">
                {materialPairs.map((pair, index) => (
                  <Chip
                    key={index}
                    label={pair.title}
                    onClick={() => selectPair(pair)}
                    color={pair === selectedPair ? 'primary' : 'default'}
                    variant={pair === selectedPair ? 'filled' : 'outlined'}
                    icon={
                      <Box display="flex" gap={0.5}>
                        {pair.pdf && <PictureAsPdf sx={{ fontSize: 16 }} />}
                        {pair.audio && <MusicNote sx={{ fontSize: 16 }} />}
                      </Box>
                    }
                    sx={{ cursor: 'pointer' }}
                  />
                ))}
              </Box>
            </Paper>
          )}

          {/* Split View - PDF and Audio */}
          <Box sx={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
            {/* PDF Viewer - Left */}
            <Box sx={{ flex: '1 1 60%', display: 'flex', flexDirection: 'column', borderRight: '1px solid rgba(0,0,0,0.12)' }}>
              <Paper sx={{ p: 1.5, borderRadius: 0, borderBottom: '1px solid rgba(0,0,0,0.12)' }}>
                <Box display="flex" alignItems="center" gap={1}>
                  <PictureAsPdf color="error" />
                  <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                    {selectedPair?.pdf?.title || 'Nenhum PDF selecionado'}
                  </Typography>
                </Box>
              </Paper>
              <Box sx={{ flex: 1, overflow: 'auto', bgcolor: '#525252', position: 'relative' }}>
                {selectedPair?.pdf ? (
                  <>
                    {pdfLoading ? (
                      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
                        <CircularProgress sx={{ color: 'white' }} />
                      </Box>
                    ) : pdfError ? (
                      <Box sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', height: '100%', color: 'white', p: 3 }}>
                        <Alert severity="error" sx={{ mb: 2 }}>
                          {pdfError}
                        </Alert>
                        <Button variant="contained" onClick={() => {
                          if (selectedPair.pdf) {
                            const pdfUrl = `${API_BASE_URL}/materials/${selectedPair.pdf.id}/file/`
                            setPdfLoading(true)
                            api.get(pdfUrl, { responseType: 'blob', timeout: 60000 })
                              .then(response => {
                                const blob = new Blob([response.data], { type: 'application/pdf' })
                                const url = URL.createObjectURL(blob)
                                setPdfBlobUrl(url)
                                setPdfError(null)
                                setPdfLoading(false)
                              })
                              .catch(() => {
                                setPdfError('Erro ao recarregar PDF')
                                setPdfLoading(false)
                              })
                          }
                        }}>
                          Tentar Novamente
                        </Button>
                      </Box>
                    ) : pdfBlobUrl ? (
                      <iframe
                        src={`${pdfBlobUrl}#toolbar=1&navpanes=1&scrollbar=1`}
                        style={{
                          width: '100%',
                          height: '100%',
                          border: 'none'
                        }}
                        title="PDF Viewer"
                      />
                    ) : null}
                  </>
                ) : (
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: 'white' }}>
                    <Typography variant="h6" color="text.secondary">
                      Selecione um material com PDF
                    </Typography>
                  </Box>
                )}
              </Box>
            </Box>

            {/* Audio Player - Right */}
            <Box sx={{ flex: '1 1 40%', display: 'flex', flexDirection: 'column', bgcolor: '#fafafa' }}>
              <Paper sx={{ p: 1.5, borderRadius: 0, borderBottom: '1px solid rgba(0,0,0,0.12)' }}>
                <Box display="flex" alignItems="center" gap={1}>
                  <MusicNote color="success" />
                  <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                    {selectedPair?.audio?.title || 'Nenhum áudio selecionado'}
                  </Typography>
                </Box>
              </Paper>

              {selectedPair?.audio ? (
                <Box sx={{ p: 4, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3, flex: 1 }}>
                  {audioLoading ? (
                    <CircularProgress />
                  ) : (
                    <>
                      {/* Audio Controls */}
                      <Box sx={{ width: '100%', maxWidth: 400 }}>
                        <Box sx={{ mb: 3 }}>
                          <Slider
                            value={currentTime}
                            max={duration || 0}
                            onChange={(_, value) => handleTimeChange(value)}
                            sx={{ mb: 1 }}
                          />
                          <Box display="flex" justifyContent="space-between">
                            <Typography variant="caption" color="text.secondary">
                              {formatTime(currentTime)}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              {formatTime(duration)}
                            </Typography>
                          </Box>
                        </Box>

                        <Box display="flex" alignItems="center" justifyContent="center" gap={2}>
                          <IconButton onClick={previousPair} color="primary" disabled={!selectedPair || materialPairs.indexOf(selectedPair) === 0}>
                            <SkipPrevious />
                          </IconButton>
                          <IconButton
                            onClick={() => setPlaying(!playing)}
                            color="primary"
                            sx={{
                              width: 64,
                              height: 64,
                              bgcolor: 'primary.main',
                              color: 'white',
                              '&:hover': {
                                bgcolor: 'primary.dark',
                              }
                            }}
                          >
                            {playing ? <Pause /> : <PlayArrow />}
                          </IconButton>
                          <IconButton onClick={nextPair} color="primary" disabled={!selectedPair || materialPairs.indexOf(selectedPair) === materialPairs.length - 1}>
                            <SkipNext />
                          </IconButton>
                        </Box>

                        <Box sx={{ mt: 3, display: 'flex', alignItems: 'center', gap: 2 }}>
                          <VolumeUp color="action" />
                          <Slider
                            value={volume}
                            min={0}
                            max={100}
                            onChange={(_, value) => handleVolumeChange(value)}
                            sx={{ flex: 1 }}
                          />
                          <Typography variant="caption" color="text.secondary">
                            {volume}%
                          </Typography>
                        </Box>
                      </Box>

                      {/* Materials List */}
                      <Paper sx={{ width: '100%', maxWidth: 400, maxHeight: 300, overflow: 'auto', flex: 1 }}>
                        <Box sx={{ p: 2, bgcolor: 'grey.100' }}>
                          <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                            Materiais do Nível
                          </Typography>
                        </Box>
                        <List dense>
                          {materialPairs.map((pair, index) => {
                            const isCompleted = pair.audio && course ? isMaterialCompleted(course.id, pair.audio.id) : false
                            return (
                              <Box key={index}>
                                {index > 0 && <Divider />}
                                <ListItemButton
                                  selected={pair === selectedPair}
                                  onClick={() => selectPair(pair)}
                                  sx={{
                                    '&.Mui-selected': {
                                      bgcolor: 'primary.light',
                                      '&:hover': {
                                        bgcolor: 'primary.light',
                                      }
                                    }
                                  }}
                                >
                                  <ListItemIcon>
                                    {pair.pdf ? <PictureAsPdf color="error" /> : <MusicNote color="success" />}
                                  </ListItemIcon>
                                  <ListItemText
                                    primary={
                                      <Box display="flex" alignItems="center" gap={1} component="span">
                                        <Typography variant="body2" component="span" sx={{ fontWeight: pair === selectedPair ? 600 : 400 }}>
                                          {pair.title}
                                        </Typography>
                                        {isCompleted && (
                                          <CheckCircle color="success" sx={{ fontSize: 18 }} />
                                        )}
                                      </Box>
                                    }
                                    secondary={pair.pdf && pair.audio ? 'PDF + Áudio' : pair.pdf ? 'PDF' : pair.audio ? 'Áudio' : ''}
                                  />
                                </ListItemButton>
                              </Box>
                            )
                          })}
                        </List>
                      </Paper>
                    </>
                  )}
                </Box>
              ) : (
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', p: 4 }}>
                  <Typography variant="h6" color="text.secondary" align="center">
                    Selecione um material com áudio
                  </Typography>
                </Box>
              )}

              {/* Hidden Audio Element */}
              {selectedPair?.audio && (
                <audio
                  ref={audioRef}
                  src={audioBlobUrl || selectedPair.audio.file_url || `${API_BASE_URL}/materials/${selectedPair.audio.id}/file/`}
                  preload="metadata"
                  onLoadedMetadata={() => {
                    if (audioRef.current) {
                      setDuration(audioRef.current.duration)
                    }
                  }}
                />
              )}
            </Box>
          </Box>
        </Box>
      </Box>
    </Box>
  )
}
