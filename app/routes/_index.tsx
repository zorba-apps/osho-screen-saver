import { useState, useCallback } from 'react';
import { TransitionType } from '~/lib/transitionService';
import ScreenSaver from '~/components/ScreenSaver';
import ControlPanel from '~/components/ControlPanel';

export default function Index() {
  const [isPlaying, setIsPlaying] = useState(true);
  const [transitionType, setTransitionType] = useState<TransitionType>('fade');
  const [transitionDuration, setTransitionDuration] = useState(3000);
  const [currentImage, setCurrentImage] = useState<{ name: string } | null>(null);

  const handleTogglePlay = useCallback(() => {
    setIsPlaying(prev => !prev);
  }, []);

  const handleTransitionTypeChange = useCallback((type: TransitionType) => {
    setTransitionType(type);
  }, []);

  const handleTransitionDurationChange = useCallback((duration: number) => {
    setTransitionDuration(duration);
  }, []);

  const handleImageChange = useCallback((image: { name: string }) => {
    setCurrentImage(image);
  }, []);

  const handleNextImage = useCallback(() => {
    // This will be handled by the ScreenSaver component internally
    // We could add a ref to trigger the transition manually if needed
  }, []);

  const handlePreviousImage = useCallback(() => {
    // This will be handled by the ScreenSaver component internally
    // We could add a ref to trigger the transition manually if needed
  }, []);

  return (
    <div className="h-screen w-screen overflow-hidden bg-black">
      <ScreenSaver
        isPlaying={isPlaying}
        transitionType={transitionType}
        transitionDuration={transitionDuration}
        onImageChange={handleImageChange}
      />
      
      <ControlPanel
        isPlaying={isPlaying}
        onTogglePlay={handleTogglePlay}
        transitionType={transitionType}
        onTransitionTypeChange={handleTransitionTypeChange}
        transitionDuration={transitionDuration}
        onTransitionDurationChange={handleTransitionDurationChange}
        currentImageName={currentImage?.name}
        onNextImage={handleNextImage}
        onPreviousImage={handlePreviousImage}
      />
    </div>
  );
}
