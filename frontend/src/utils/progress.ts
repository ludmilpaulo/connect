// Progress tracking utility
export interface CourseProgress {
  courseId: number
  completedMaterials: number[]
  lastAccessed: string
  progress: number // 0-100
}

export const getCourseProgress = (courseId: number): CourseProgress => {
  if (typeof window === 'undefined') {
    return { courseId, completedMaterials: [], lastAccessed: '', progress: 0 }
  }
  
  const stored = localStorage.getItem(`course_progress_${courseId}`)
  if (stored) {
    return JSON.parse(stored)
  }
  
  return { courseId, completedMaterials: [], lastAccessed: '', progress: 0 }
}

export const saveCourseProgress = (courseId: number, materialId: number) => {
  if (typeof window === 'undefined') return
  
  const progress = getCourseProgress(courseId)
  if (!progress.completedMaterials.includes(materialId)) {
    progress.completedMaterials.push(materialId)
    progress.lastAccessed = new Date().toISOString()
    localStorage.setItem(`course_progress_${courseId}`, JSON.stringify(progress))
  }
}

export const markMaterialCompleted = (courseId: number, materialId: number) => {
  saveCourseProgress(courseId, materialId)
}

export const calculateCourseProgress = (courseId: number, totalMaterials: number): number => {
  const progress = getCourseProgress(courseId)
  if (totalMaterials === 0) return 0
  return Math.round((progress.completedMaterials.length / totalMaterials) * 100)
}

export const isMaterialCompleted = (courseId: number, materialId: number): boolean => {
  const progress = getCourseProgress(courseId)
  return progress.completedMaterials.includes(materialId)
}
