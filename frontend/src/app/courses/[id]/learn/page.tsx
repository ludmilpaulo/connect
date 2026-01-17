'use client'

import { useEffect, useState, useRef } from 'react'
import { useParams, useRouter } from 'next/navigation'
import {
  Box, Typography, Paper, Button, CircularProgress, List,
  ListItem, ListItemButton, ListItemText, ListItemIcon, Divider,
  Chip, IconButton, Slider, Select, MenuItem, FormControl, InputLabel
} from '@mui/material'
import {
  ArrowBack, PictureAsPdf, MusicNote, PlayArrow, Pause,
  VolumeUp, SkipNext, SkipPrevious, Fullscreen, CheckCircle, OpenInNew
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
}

interface MaterialPair {
  pdf: Material | null
  audio: Material | null
  title: string
}

interface Course {
  id: number
  title: string
  description: string
  lessons: any[]
  materials: Material[]
}

export default function CourseLearn() {
  const params = useParams()
  const router = useRouter()
  const { user, loading: authLoading } = useAuth()
  const audioRef = useRef<HTMLAudioElement>(null)
  const [course, setCourse] = useState<Course | null>(null)
  const [loading, setLoading] = useState(true)
  const [materialPairs, setMaterialPairs] = useState<MaterialPair[]>([])
  const [selectedPair, setSelectedPair] = useState<MaterialPair | null>(null)
  const [playing, setPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [volume, setVolume] = useState(100)
  const [completedMaterials, setCompletedMaterials] = useState<Set<number>>(new Set())
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

  useEffect(() => {
    const audio = audioRef.current
    if (!audio) return

    const updateTime = () => setCurrentTime(audio.currentTime)
    const updateDuration = () => setDuration(audio.duration)
    const handleEnded = () => {
      setPlaying(false)
      // Mark audio as completed when it finishes
      if (selectedPair?.audio && course) {
        markMaterialCompleted(course.id, selectedPair.audio.id)
        setCompletedMaterials(prev => new Set(prev).add(selectedPair.audio!.id))
      }
    }

    audio.addEventListener('timeupdate', updateTime)
    audio.addEventListener('loadedmetadata', updateDuration)
    audio.addEventListener('ended', handleEnded)

    return () => {
      audio.removeEventListener('timeupdate', updateTime)
      audio.removeEventListener('loadedmetadata', updateDuration)
      audio.removeEventListener('ended', handleEnded)
    }
  }, [selectedPair?.audio, course])

  useEffect(() => {
    const audio = audioRef.current
    if (!audio) return

    if (playing) {
      audio.play().catch(console.error)
    } else {
      audio.pause()
    }
  }, [playing])

  useEffect(() => {
    const audio = audioRef.current
    if (audio) {
      audio.volume = volume / 100
    }
  }, [volume])

  // Load PDF as blob when selectedPair.pdf changes
  useEffect(() => {
    let pdfBlob: string | null = null

    if (selectedPair?.pdf) {
      setPdfLoading(true)
      setPdfError(null)
      setPdfBlobUrl(null)

      // Construct the correct URL
      const pdfUrl = `/materials/${selectedPair.pdf.id}/file/`
      
      // Fetch PDF as blob with authentication
      api.get(pdfUrl, {
        responseType: 'blob',
        headers: {
          'Accept': 'application/pdf'
        }
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
          setPdfError(error.response?.data?.error || error.message || 'Erro ao carregar PDF')
          setPdfLoading(false)
        })
    } else {
      setPdfBlobUrl(null)
      setPdfError(null)
      setPdfLoading(false)
    }

    // Cleanup: revoke blob URL when component unmounts or PDF changes
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

      // Construct the correct URL
      const audioUrl = `/materials/${selectedPair.audio.id}/file/`
      
      // Fetch Audio as blob with authentication
      api.get(audioUrl, {
        responseType: 'blob',
        headers: {
          'Accept': 'audio/mpeg, audio/*'
        }
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

    // Cleanup: revoke blob URL when component unmounts or audio changes
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
      
      // Organize materials into PDF+Audio pairs
      const pairs = organizeMaterialsIntoPairs(courseData.materials || [])
      setMaterialPairs(pairs)
      if (pairs.length > 0) {
        setSelectedPair(pairs[0])
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
    const audios = materials.filter(m => m.material_type === 'mp3')
    
    // Try to match PDF and Audio by name similarity
    const processedPdfs = new Set<number>()
    const processedAudios = new Set<number>()
    
    pdfs.forEach(pdf => {
      // Find matching audio by name
      const audioMatch = audios.find(audio => {
        if (processedAudios.has(audio.id)) return false
        const pdfName = pdf.title.toLowerCase().replace('.pdf', '').trim()
        const audioName = audio.title.toLowerCase().replace('.mp3', '').trim()
        // Check if names are similar or contain common patterns
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
    
    // Add remaining audios without PDFs
    audios.forEach(audio => {
      if (!processedAudios.has(audio.id)) {
        pairs.push({
          pdf: null,
          audio,
          title: audio.title.replace('.mp3', '')
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

  const selectPair = (pair: MaterialPair) => {
    setSelectedPair(pair)
    setPlaying(false)
    setCurrentTime(0)
    if (audioRef.current) {
      audioRef.current.currentTime = 0
    }
  }

  const nextPair = () => {
    const currentIndex = materialPairs.findIndex(p => p === selectedPair)
    if (currentIndex < materialPairs.length - 1) {
      selectPair(materialPairs[currentIndex + 1])
    }
  }

  const previousPair = () => {
    const currentIndex = materialPairs.findIndex(p => p === selectedPair)
    if (currentIndex > 0) {
      selectPair(materialPairs[currentIndex - 1])
    }
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

  if (!course || materialPairs.length === 0) {
    return (
      <Box sx={{ minHeight: '100vh', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', p: 4 }}>
        <Button
          startIcon={<ArrowBack />}
          onClick={() => router.push(`/courses/${params.id}`)}
          sx={{ mb: 2, color: 'white' }}
        >
          Voltar
        </Button>
        <Paper sx={{ p: 4, textAlign: 'center' }}>
          <Typography variant="h6" color="text.secondary">
            Nenhum material disponível para este curso
          </Typography>
        </Paper>
      </Box>
    )
  }

  return (
    <Box sx={{ minHeight: '100vh', background: '#f5f5f5', display: 'flex', flexDirection: 'column' }}>
      {/* Header */}
      <Paper elevation={2} sx={{ p: 2, borderRadius: 0 }}>
        <Box display="flex" alignItems="center" justifyContent="space-between">
          <Box display="flex" alignItems="center" gap={2}>
            <Button
              startIcon={<ArrowBack />}
              onClick={() => router.push(`/courses/${params.id}`)}
            >
              Voltar
            </Button>
            <Typography variant="h6" sx={{ fontWeight: 600 }}>
              {course.title}
            </Typography>
            {selectedPair && (
              <Chip label={selectedPair.title} size="small" color="primary" />
            )}
          </Box>
          <Box display="flex" alignItems="center" gap={1}>
            <FormControl size="small" sx={{ minWidth: 200 }}>
              <InputLabel>Selecionar Material</InputLabel>
              <Select
                value={materialPairs.indexOf(selectedPair || materialPairs[0])}
                onChange={(e) => selectPair(materialPairs[Number(e.target.value)])}
                label="Selecionar Material"
              >
                {materialPairs.map((pair, index) => (
                  <MenuItem key={index} value={index}>
                    {pair.title}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>
        </Box>
      </Paper>

      {/* Main Content - Split View */}
      <Box sx={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
        {/* Left Panel - PDF Viewer */}
        <Box sx={{ flex: '1 1 60%', display: 'flex', flexDirection: 'column', borderRight: '1px solid #e0e0e0' }}>
          <Paper sx={{ p: 2, borderRadius: 0, borderBottom: '1px solid #e0e0e0' }}>
            <Box display="flex" alignItems="center" gap={1}>
              <PictureAsPdf color="error" />
              <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                {selectedPair?.pdf?.title || 'Nenhum PDF selecionado'}
              </Typography>
            </Box>
          </Paper>
          <Box sx={{ flex: 1, overflow: 'auto', bgcolor: '#525252', position: 'relative' }}>
            {selectedPair?.pdf ? (
              <Box sx={{ width: '100%', height: '100%', position: 'relative' }}>
                {pdfLoading ? (
                  <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
                    <CircularProgress sx={{ color: 'white' }} />
                  </Box>
                ) : pdfError ? (
                  <Box sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', height: '100%', color: 'white', p: 3 }}>
                    <Typography variant="h6" color="error" gutterBottom>
                      Erro ao carregar PDF
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                      {pdfError}
                    </Typography>
                    <Button
                      variant="contained"
                      onClick={() => {
                        // Try to reload PDF
                        if (selectedPair.pdf) {
                          const pdfUrl = `/materials/${selectedPair.pdf.id}/file/`
                          api.get(pdfUrl, { responseType: 'blob' })
                            .then(response => {
                              const blob = new Blob([response.data], { type: 'application/pdf' })
                              const url = URL.createObjectURL(blob)
                              setPdfBlobUrl(url)
                              setPdfError(null)
                            })
                            .catch(err => {
                              setPdfError('Erro ao recarregar PDF. Por favor, tente novamente.')
                            })
                        }
                      }}
                    >
                      Tentar Novamente
                    </Button>
                  </Box>
                ) : pdfBlobUrl ? (
                  <iframe
                    src={`${pdfBlobUrl}#toolbar=1&navpanes=1&scrollbar=1`}
                    style={{
                      width: '100%',
                      height: '100%',
                      minHeight: '600px',
                      border: 'none'
                    }}
                    title="PDF Viewer"
                  />
                ) : (
                  <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
                    <CircularProgress sx={{ color: 'white' }} />
                  </Box>
                )}
              </Box>
            ) : (
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  height: '100%',
                  color: 'white'
                }}
              >
                <Typography variant="h6" color="text.secondary">
                  Nenhum PDF disponível para este material
                </Typography>
              </Box>
            )}
          </Box>
        </Box>

        {/* Right Panel - Audio Player */}
        <Box sx={{ flex: '1 1 40%', display: 'flex', flexDirection: 'column', bgcolor: '#fafafa' }}>
          <Paper sx={{ p: 2, borderRadius: 0, borderBottom: '1px solid #e0e0e0' }}>
            <Box display="flex" alignItems="center" gap={1}>
              <MusicNote color="success" />
              <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                {selectedPair?.audio?.title || 'Nenhum áudio selecionado'}
              </Typography>
            </Box>
          </Paper>

          {selectedPair?.audio ? (
            <Box sx={{ p: 4, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3 }}>
              {/* Audio Player Controls */}
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
                  <IconButton onClick={previousPair} color="primary">
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
                  <IconButton onClick={nextPair} color="primary">
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

              {/* Material List */}
              <Paper sx={{ width: '100%', maxWidth: 400, maxHeight: 400, overflow: 'auto' }}>
                <Box sx={{ p: 2, bgcolor: 'grey.100' }}>
                  <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                    Materiais Disponíveis
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
                                <Box display="flex" gap={1} ml={1} component="span">
                                  {pair.pdf && <Chip label="PDF" size="small" variant="outlined" />}
                                  {pair.audio && <Chip label="Audio" size="small" variant="outlined" color="success" />}
                                </Box>
                              </Box>
                            }
                            secondary={pair.pdf && pair.audio ? 'PDF + Audio' : pair.pdf ? 'PDF' : pair.audio ? 'Audio' : ''}
                          />
                        </ListItemButton>
                      </Box>
                    )
                  })}
                </List>
              </Paper>
            </Box>
          ) : (
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                height: '100%',
                p: 4
              }}
            >
              <Typography variant="h6" color="text.secondary" align="center">
                Nenhum áudio disponível para este material
              </Typography>
            </Box>
          )}

          {/* Hidden Audio Element */}
          {selectedPair?.audio && (
            <audio
              ref={audioRef}
              src={audioBlobUrl || selectedPair.audio.file_url || `${API_BASE_URL.replace('/api', '')}/api/materials/${selectedPair.audio.id}/file/`}
              preload="metadata"
              crossOrigin="anonymous"
              onError={(e) => {
                console.error('Error loading audio:', e)
                // Try to reload with file_url or direct URL
                const audioElement = e.currentTarget
                const audioUrl = selectedPair.audio?.file_url || `${API_BASE_URL.replace('/api', '')}/api/materials/${selectedPair.audio?.id}/file/`
                audioElement.src = audioUrl
              }}
            />
          )}
        </Box>
      </Box>
    </Box>
  )
}
