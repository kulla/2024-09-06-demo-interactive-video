import dynamic from 'next/dynamic'
import { InteractiveVideoState } from './types'
import { useState } from 'react'

const VideoPlayerWithMarkers = dynamic(
  () => import('react-video-player-extended'),
  { ssr: false },
)

interface VideoPlayerProps extends InteractiveVideoState {
  onProgress: (event: Event) => void
  isPlaying: boolean
  setIsPlaying: React.Dispatch<React.SetStateAction<boolean>>
  currentTime?: number
}

export function VideoPlayer({
  url,
  markers,
  onProgress,
  isPlaying,
  setIsPlaying,
  currentTime,
}: VideoPlayerProps) {
  const [volume, setVolume] = useState(1)

  return (
    <div className="mx-auto w-[640px]">
      {/* Unfortunately the player does not render newly added or
          changed markers. By adding the key attribute the video
          player is rerendered whenever the markers change. */}
      <VideoPlayerWithMarkers
        timeStart={currentTime}
        url={url}
        volume={volume}
        isPlaying={isPlaying}
        onVolume={setVolume}
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
        onProgress={onProgress}
        markers={markers.map((marker, id) => ({ id, ...marker }))}
        key={markers.length}
      />
    </div>
  )
}
