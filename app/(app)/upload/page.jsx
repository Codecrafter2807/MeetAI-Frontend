'use client'

import { useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { fetchApi } from '@/lib/api'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
  Upload,
  FileAudio,
  FileVideo,
  X,
  CheckCircle,
  AlertCircle,
  Loader2,
} from 'lucide-react'
import { cn } from '@/lib/utils'

export default function UploadPage() {
  const router = useRouter()
  const [isDragging, setIsDragging] = useState(false)
  const [files, setFiles] = useState([])

  const handleDragOver = useCallback((e) => {
    e.preventDefault()
    setIsDragging(true)
  }, [])

  const handleDragLeave = useCallback((e) => {
    e.preventDefault()
    setIsDragging(false)
  }, [])

  const handleDrop = useCallback((e) => {
    e.preventDefault()
    setIsDragging(false)
    const droppedFiles = Array.from(e.dataTransfer.files)
    handleFiles(droppedFiles)
  }, [])

  const handleFileInput = useCallback((e) => {
    const selectedFiles = Array.from(e.target.files)
    handleFiles(selectedFiles)
  }, [])

  const handleFiles = (newFiles) => {
    const validFiles = newFiles.filter((file) => {
      const isAudio = file.type.startsWith('audio/')
      const isVideo = file.type.startsWith('video/')
      return isAudio || isVideo
    })

    const filesWithProgress = validFiles.map((file) => ({
      id: Date.now() + Math.random(),
      file,
      name: file.name,
      size: file.size,
      type: file.type.startsWith('audio/') ? 'audio' : 'video',
      progress: 0,
      status: 'uploading',
    }))

    setFiles((prev) => [...prev, ...filesWithProgress])

    // Start real uploads
    filesWithProgress.forEach((fileData) => {
      uploadFile(fileData)
    })
  }

  const uploadFile = async (fileData) => {
    const formData = new FormData()
    formData.append('file', fileData.file)

    try {
      // Set to 50% just as a visual cue that it's working while waiting for response
      setFiles((prev) =>
        prev.map((f) =>
          f.id === fileData.id ? { ...f, progress: 50, status: 'uploading' } : f
        )
      )

      const response = await fetchApi('/api/upload/', {
        method: 'POST',
        body: formData,
      })

      // Upload complete, it's now processing on backend
      setFiles((prev) =>
        prev.map((f) =>
          f.id === fileData.id
            ? { ...f, progress: 100, status: 'completed' }
            : f
        )
      )

      // Redirect to the processing meeting page
      if (response && response.meeting_id) {
        setTimeout(() => {
          router.push(`/meeting/${response.meeting_id}`)
        }, 1500)
      }
    } catch (error) {
      console.error("Upload error:", error)
      setFiles((prev) =>
        prev.map((f) =>
          f.id === fileData.id ? { ...f, status: 'error' } : f
        )
      )
    }
  }

  const removeFile = (fileId) => {
    setFiles((prev) => prev.filter((f) => f.id !== fileId))
  }

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">Upload Recording</h1>
        <p className="text-muted-foreground">
          Upload audio or video files to transcribe and analyze
        </p>
      </div>

      {/* Upload Zone */}
      <Card>
        <CardContent className="p-6">
          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            className={cn(
              'relative flex flex-col items-center justify-center rounded-xl border-2 border-dashed p-12 transition-all',
              isDragging
                ? 'border-primary bg-primary/5'
                : 'border-border hover:border-primary/50 hover:bg-muted/50'
            )}
          >
            <input
              type="file"
              accept="audio/*,video/*"
              multiple
              onChange={handleFileInput}
              className="absolute inset-0 cursor-pointer opacity-0"
            />
            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
              <Upload className="h-8 w-8 text-primary" />
            </div>
            <h3 className="mb-2 text-lg font-semibold">
              {isDragging ? 'Drop files here' : 'Drag and drop files'}
            </h3>
            <p className="mb-4 text-center text-muted-foreground">
              or click to browse from your computer
            </p>
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <span className="flex items-center gap-1">
                <FileAudio className="h-4 w-4" />
                Audio files
              </span>
              <span className="flex items-center gap-1">
                <FileVideo className="h-4 w-4" />
                Video files
              </span>
            </div>
            <p className="mt-4 text-xs text-muted-foreground">
              Supported formats: MP3, WAV, M4A, MP4, MOV, WebM (max 500MB)
            </p>
          </div>
        </CardContent>
      </Card>

      {/* File List */}
      {files.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Uploads</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {files.map((fileData) => (
                <div
                  key={fileData.id}
                  className="flex items-center gap-4 rounded-lg border p-4"
                >
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                    {fileData.type === 'audio' ? (
                      <FileAudio className="h-6 w-6 text-primary" />
                    ) : (
                      <FileVideo className="h-6 w-6 text-primary" />
                    )}
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="mb-1 flex items-center justify-between">
                      <p className="truncate font-medium">{fileData.name}</p>
                      <div className="ml-2 flex items-center gap-2">
                        {fileData.status === 'uploading' && (
                          <span className="text-sm text-muted-foreground">
                            {Math.round(fileData.progress)}%
                          </span>
                        )}
                        {fileData.status === 'processing' && (
                          <span className="flex items-center gap-1 text-sm text-amber-600">
                            <Loader2 className="h-4 w-4 animate-spin" />
                            Processing
                          </span>
                        )}
                        {fileData.status === 'completed' && (
                          <span className="flex items-center gap-1 text-sm text-emerald-600">
                            <CheckCircle className="h-4 w-4" />
                            Completed
                          </span>
                        )}
                        {fileData.status === 'error' && (
                          <span className="flex items-center gap-1 text-sm text-destructive">
                            <AlertCircle className="h-4 w-4" />
                            Failed
                          </span>
                        )}
                      </div>
                    </div>
                    <p className="mb-2 text-sm text-muted-foreground">
                      {formatFileSize(fileData.size)}
                    </p>
                    {fileData.status === 'uploading' && (
                      <div className="h-2 overflow-hidden rounded-full bg-secondary">
                        <div
                          className="h-full bg-primary transition-all duration-300"
                          style={{ width: `${fileData.progress}%` }}
                        />
                      </div>
                    )}
                  </div>

                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => removeFile(fileData.id)}
                    className="h-8 w-8 shrink-0"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Tips */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Tips for best results</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li className="flex items-start gap-2">
              <div className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
              Use high-quality audio recordings with minimal background noise
            </li>
            <li className="flex items-start gap-2">
              <div className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
              Ensure speakers are clearly audible and not talking over each other
            </li>
            <li className="flex items-start gap-2">
              <div className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
              Longer files may take more time to process
            </li>
            <li className="flex items-start gap-2">
              <div className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
              You&apos;ll receive a notification when transcription is complete
            </li>
          </ul>
        </CardContent>
      </Card>
    </div>
  )
}
