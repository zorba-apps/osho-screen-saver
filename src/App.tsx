import { Routes, Route } from 'react-router-dom'
import ScreenSaver from './components/ScreenSaver'
import ControlPanel from './components/ControlPanel'
import { useState, useEffect } from 'react'
import { TransitionType } from './lib/transitionService'
import { ImageData } from './lib/imageService'

function App() {
  const [showControls, setShowControls] = useState(false)
  const [isPlaying, setIsPlaying] = useState(true)
  const [transitionType, setTransitionType] = useState<TransitionType>('fade')
  const [transitionDuration, setTransitionDuration] = useState(3000)
  const [currentImage, setCurrentImage] = useState<ImageData | null>(null)
  const [isDarkBackground, setIsDarkBackground] = useState(true)
  const [isFullScreen, setIsFullScreen] = useState(false)
  const [keepPanelVisible, setKeepPanelVisible] = useState(false)

  useEffect(() => {
    let timeoutId: NodeJS.Timeout

    const handleMouseMove = () => {
      setShowControls(true)
      if (!keepPanelVisible) {
        clearTimeout(timeoutId)
        timeoutId = setTimeout(() => {
          setShowControls(false)
        }, 3000)
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

    return () => {
      document.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('keydown', handleKeyDown)
      document.removeEventListener('fullscreenchange', handleFullScreenChange)
      clearTimeout(timeoutId)
    }
  }, [isFullScreen, keepPanelVisible])

  const handleTogglePlay = () => {
    setIsPlaying(prev => !prev)
  }

  const handleImageChange = (image: ImageData) => {
    setCurrentImage(image)
  }

  const handleTextColorChange = (isDark: boolean) => {
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
          currentImageName={currentImage?.name}
          onNextImage={handleNextImage}
          onPreviousImage={handlePreviousImage}
          isDarkBackground={isDarkBackground}
          isFullScreen={isFullScreen}
          onToggleFullScreen={toggleFullScreen}
          keepPanelVisible={keepPanelVisible}
          onToggleKeepPanelVisible={toggleKeepPanelVisible}
          onResetKeepPanelVisible={resetKeepPanelVisible}
        />
      )}
    </div>
  )
}

export default App
