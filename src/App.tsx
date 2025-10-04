import { Routes, Route } from 'react-router-dom'
import ScreenSaver from './components/ScreenSaver'
import ControlPanel from './components/ControlPanel'
import GalleryModal from './components/GalleryModal'
import { PWAUpdateNotification } from './components/PWAUpdateNotification'
import { PWAInstallPrompt } from './components/PWAInstallPrompt'
import { PWAStatusIndicator } from './components/PWAStatusIndicator'
import { useState, useEffect, useRef } from 'react'
import { TransitionType } from './lib/transitionService'
import { ImageData } from './lib/imageService'
import { TouchGestureDetector } from './lib/touchUtils'
import { AudioService } from './lib/audioService'
import { usePWA } from './lib/usePWA'

function App() {
  const [showControls, setShowControls] = useState(false)
  const [isPlaying, setIsPlaying] = useState(true)
  const [transitionType, setTransitionType] = useState<TransitionType>('fade')
  const [transitionDuration, setTransitionDuration] = useState(3000)
  const [currentImage, setCurrentImage] = useState<ImageData | null>(null)
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const [totalImages, setTotalImages] = useState(0)
  const [isDarkBackground, setIsDarkBackground] = useState(true)
  const [isFullScreen, setIsFullScreen] = useState(false)
  const [keepPanelVisible, setKeepPanelVisible] = useState(false)
  const [isMobile, setIsMobile] = useState(false)
  const [isGalleryOpen, setIsGalleryOpen] = useState(false)
  
  // Audio state
  const [audioFile, setAudioFile] = useState<File | null>(null)
  const [isAudioPlaying, setIsAudioPlaying] = useState(false)
  const [audioCurrentTime, setAudioCurrentTime] = useState(0)
  const [audioDuration, setAudioDuration] = useState(0)
  const [audioTrackName, setAudioTrackName] = useState('')
  const [selectedMeditationId, setSelectedMeditationId] = useState<string | undefined>()
  const [hasMeditationLoaded, setHasMeditationLoaded] = useState(false)
  const audioService = useRef(AudioService.getInstance())
  
  // PWA functionality
  const pwa = usePWA()

  useEffect(() => {
    let timeoutId: NodeJS.Timeout
    const touchDetector = new TouchGestureDetector()

    // Detect if device is mobile
    const checkMobile = () => {
      const isMobileDevice = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ||
                            ('ontouchstart' in window) ||
                            (navigator.maxTouchPoints > 0)
      setIsMobile(isMobileDevice)
    }

    checkMobile()

    const handleMouseMove = () => {
      setShowControls(true)
      if (!keepPanelVisible) {
        clearTimeout(timeoutId)
        timeoutId = setTimeout(() => {
          setShowControls(false)
        }, 3000)
      }
    }

    const handleTouchStart = (e: TouchEvent) => {
      touchDetector.onTouchStart(e)
    }

    const handleTouchEnd = (e: TouchEvent) => {
      const swipe = touchDetector.onTouchEnd(e)
      
      // Show panel on swipe up or tap
      if (swipe.direction === 'up' || swipe.direction === 'none') {
        setShowControls(true)
        if (!keepPanelVisible) {
          clearTimeout(timeoutId)
          timeoutId = setTimeout(() => {
            setShowControls(false)
          }, 3000)
        }
      }
      
      // Hide panel on swipe down
      if (swipe.direction === 'down') {
        setShowControls(false)
        resetKeepPanelVisible()
      }
    }

  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.key === 'Escape') {
      if (isFullScreen) {
        exitFullScreen()
      } else {
        setShowControls(false)
        resetKeepPanelVisible() // Reset pin state when closing
      }
    } else if (e.key === ' ') {
      e.preventDefault()
      setIsPlaying(prev => !prev)
    } else if (e.key === 'F11') {
      e.preventDefault()
      toggleFullScreen()
    }
  }

    const handleFullScreenChange = () => {
      setIsFullScreen(!!document.fullscreenElement)
    }

    document.addEventListener('mousemove', handleMouseMove)
    document.addEventListener('keydown', handleKeyDown)
    document.addEventListener('fullscreenchange', handleFullScreenChange)
    document.addEventListener('touchstart', handleTouchStart, { passive: true })
    document.addEventListener('touchend', handleTouchEnd, { passive: true })

    return () => {
      document.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('keydown', handleKeyDown)
      document.removeEventListener('fullscreenchange', handleFullScreenChange)
      document.removeEventListener('touchstart', handleTouchStart)
      document.removeEventListener('touchend', handleTouchEnd)
      clearTimeout(timeoutId)
    }
  }, [isFullScreen, keepPanelVisible])


  // Audio service event handlers
  useEffect(() => {
    const audio = audioService.current
    
    const handleTimeUpdate = (time: number) => {
      setAudioCurrentTime(time)
    }
    
    const handleDurationChange = (duration: number) => {
      setAudioDuration(duration)
    }
    
    const handlePlaybackStateChange = (playing: boolean) => {
      setIsAudioPlaying(playing)
    }
    
    const handleTrackLoaded = (track: any) => {
      setAudioTrackName(track.name)
    }

    audio.on('timeUpdate', handleTimeUpdate)
    audio.on('durationChange', handleDurationChange)
    audio.on('playbackStateChange', handlePlaybackStateChange)
    audio.on('trackLoaded', handleTrackLoaded)

    return () => {
      audio.off('timeUpdate', handleTimeUpdate)
      audio.off('durationChange', handleDurationChange)
      audio.off('playbackStateChange', handlePlaybackStateChange)
      audio.off('trackLoaded', handleTrackLoaded)
    }
  }, [])

  const handleTogglePlay = () => {
    setIsPlaying(prev => !prev)
  }

  const handleImageChange = (image: ImageData, index: number, total: number) => {
    setCurrentImage(image)
    setCurrentImageIndex(index)
    setTotalImages(total)
  }

  const handleTextColorChange = (isDark: boolean) => {
    // Update color scheme based on image brightness
    setIsDarkBackground(isDark)
  }

  const toggleFullScreen = async () => {
    try {
      if (!document.fullscreenElement) {
        await document.documentElement.requestFullscreen()
        setIsFullScreen(true)
      } else {
        await document.exitFullscreen()
        setIsFullScreen(false)
      }
    } catch (error) {
      console.error('Error toggling full screen:', error)
    }
  }

  const exitFullScreen = async () => {
    try {
      if (document.fullscreenElement) {
        await document.exitFullscreen()
        setIsFullScreen(false)
      }
    } catch (error) {
      console.error('Error exiting full screen:', error)
    }
  }

  const toggleKeepPanelVisible = () => {
    setKeepPanelVisible(prev => !prev)
  }

  const resetKeepPanelVisible = () => {
    setKeepPanelVisible(false)
  }

  const downloadCurrentImage = () => {
    if (currentImage) {
      const link = document.createElement('a')
      link.href = currentImage.url
      link.download = currentImage.name || 'osho-image.jpg'
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    }
  }

  const toggleGallery = () => {
    console.log('Gallery button clicked')
    setIsGalleryOpen(true)
  }

  const closeGallery = () => {
    setIsGalleryOpen(false)
  }

  const handleNextImage = () => {
    if ((window as any).nextImage) {
      (window as any).nextImage();
    }
  }

  const handlePreviousImage = () => {
    if ((window as any).previousImage) {
      (window as any).previousImage();
    }
  }

  // Audio control functions
  const handleAudioFileSelect = async (file: File) => {
    try {
      setAudioFile(file)
      setHasMeditationLoaded(false) // Clear meditation state when file is selected
      await audioService.current.loadFile(file)
    } catch (error) {
      console.error('Error loading audio file:', error)
      alert('Error loading audio file. Please try a different file.')
    }
  }

  const handleAudioPlayPause = async () => {
    try {
      if (isAudioPlaying) {
        audioService.current.pause()
      } else {
        await audioService.current.play()
      }
    } catch (error) {
      console.error('Error controlling playback:', error)
    }
  }

  const handleAudioStop = () => {
    audioService.current.stop()
  }

  const handleMeditationSelect = async (meditationUrl: string, meditationName: string, urls?: string[]) => {
    try {
      console.log('Loading meditation:', meditationName, meditationUrl)
      
      // Clear any existing file selection
      setAudioFile(null)
      setHasMeditationLoaded(false)
      
      let workingUrl = meditationUrl
      
      // If we have multiple URLs, try them in order
      if (urls && urls.length > 1) {
        console.log('Trying multiple URL formats...')
        for (const url of urls) {
          try {
            console.log('Testing URL:', url)
            const response = await fetch(url, { method: 'HEAD' })
            if (response.ok) {
              workingUrl = url
              console.log('Found working URL:', url)
              break
            } else {
              console.log(`URL failed with status ${response.status}:`, url)
            }
          } catch (urlError) {
            console.log('URL test failed:', url, urlError)
          }
        }
      } else {
        // Test single URL
        const response = await fetch(meditationUrl, { method: 'HEAD' })
        if (!response.ok) {
          throw new Error(`URL not accessible: ${response.status} ${response.statusText}`)
        }
      }
      
      console.log('Using URL:', workingUrl)
      
      // Load meditation from working URL
      await audioService.current.loadFromUrl(workingUrl, meditationName)
      
      // Find the meditation ID from the URL (extract from Cloudinary URL)
      const meditationId = workingUrl.includes('Nadabrahma_Meditaton_with_Osho_Voice_hswhsu') 
        ? 'nadabrahma-meditation' 
        : 'unknown-meditation'
      
      setSelectedMeditationId(meditationId)
      setHasMeditationLoaded(true)
      
      console.log('Meditation loaded successfully:', meditationName)
    } catch (error) {
      console.error('Error loading meditation:', error)
      console.error('URL that failed:', meditationUrl)
      alert(`Error loading meditation: ${error.message || 'Unknown error'}`)
    }
  }


  return (
    <div className="relative w-full h-screen overflow-hidden bg-black">
      <Routes>
        <Route 
          path="/" 
          element={
            <ScreenSaver 
              isPlaying={isPlaying}
              transitionType={transitionType}
              transitionDuration={transitionDuration}
              onImageChange={handleImageChange}
              onNextImage={handleNextImage}
              onPreviousImage={handlePreviousImage}
              onTextColorChange={handleTextColorChange}
            />
          } 
        />
      </Routes>
      {showControls && (
        <ControlPanel
          isPlaying={isPlaying}
          onTogglePlay={handleTogglePlay}
          transitionType={transitionType}
          onTransitionTypeChange={setTransitionType}
          transitionDuration={transitionDuration}
          onTransitionDurationChange={setTransitionDuration}
          onNextImage={handleNextImage}
          onPreviousImage={handlePreviousImage}
          isDarkBackground={isDarkBackground}
          isFullScreen={isFullScreen}
          onToggleFullScreen={toggleFullScreen}
          onToggleGallery={toggleGallery}
          keepPanelVisible={keepPanelVisible}
          onToggleKeepPanelVisible={toggleKeepPanelVisible}
          onResetKeepPanelVisible={resetKeepPanelVisible}
          isMobile={isMobile}
          onDownloadImage={downloadCurrentImage}
          // Audio props
          audioFile={audioFile}
          isAudioPlaying={isAudioPlaying}
          audioCurrentTime={audioCurrentTime}
          audioDuration={audioDuration}
          audioTrackName={audioTrackName}
          currentImageUrl={currentImage?.url}
          onAudioFileSelect={handleAudioFileSelect}
          onAudioPlayPause={handleAudioPlayPause}
          onAudioStop={handleAudioStop}
          onMeditationSelect={handleMeditationSelect}
          selectedMeditationId={selectedMeditationId}
          hasMeditationLoaded={hasMeditationLoaded}
        />
      )}
      <GalleryModal
        isOpen={isGalleryOpen}
        onClose={closeGallery}
        isDarkBackground={isDarkBackground}
      />
      
      {/* PWA Components */}
      <PWAUpdateNotification />
      <PWAInstallPrompt />
      <PWAStatusIndicator />
    </div>
  )
}

export default App
