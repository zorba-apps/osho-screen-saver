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

  useEffect(() => {
    let timeoutId: NodeJS.Timeout

    const handleMouseMove = () => {
      setShowControls(true)
      clearTimeout(timeoutId)
      timeoutId = setTimeout(() => {
        setShowControls(false)
      }, 3000)
    }

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setShowControls(false)
      } else if (e.key === ' ') {
        e.preventDefault()
        setIsPlaying(prev => !prev)
      }
    }

    document.addEventListener('mousemove', handleMouseMove)
    document.addEventListener('keydown', handleKeyDown)

    return () => {
      document.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('keydown', handleKeyDown)
      clearTimeout(timeoutId)
    }
  }, [])

  const handleTogglePlay = () => {
    setIsPlaying(prev => !prev)
  }

  const handleImageChange = (image: ImageData) => {
    setCurrentImage(image)
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
        />
      )}
    </div>
  )
}

export default App
