import { useCallback, useRef, useState } from 'react'
import { InteractiveVideoState, Marker } from './types'
import { VideoPlayer } from './video-player'
import { ModalWithCloseButton } from '../modal'
import * as Toolbar from '@radix-ui/react-toolbar'
import { SerloRenderer } from '@serlo/editor'

export function InteractiveVideoRenderer({
  url,
  markers,
}: InteractiveVideoState) {
  const lastTime = useRef(0)
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentMarker, setCurrentMarker] = useState<Marker | null>(null)

  const onProgress = useCallback(
    (event: Event) => {
      console.log(event, isPlaying)
      if (event.type === 'timeupdate') {
        const currentTime = (event.target as HTMLVideoElement).currentTime

        // FIXXME: The variable `isPlaying` is not updated correctly.
        // Thus we need to check if the video is playing by checking
        // if the currentTime is increasing only a little bit.
        const diff = currentTime - lastTime.current
        if (diff >= 0 && diff < 0.5) {
          const currentMarker = markers.find(
            (marker) =>
              marker.time >= lastTime.current && marker.time < currentTime,
          )

          if (currentMarker) {
            setCurrentMarker(currentMarker)
          }
        }

        lastTime.current = currentTime
      }
    },
    [isPlaying, markers],
  )

  return (
    <>
      {currentMarker !== null ? (
        <ModalWithCloseButton
          isOpen={currentMarker !== null}
          title={currentMarker.title}
          setIsOpen={(value) => {
            if (!value) setCurrentMarker(null)
          }}
        >
          <SerloRenderer document={currentMarker.content} />
          <Toolbar.Root className="flex justify-end mt-6">
            <Toolbar.Button
              className="button"
              onClick={() => setCurrentMarker(null)}
            >
              Weiter
            </Toolbar.Button>
          </Toolbar.Root>
        </ModalWithCloseButton>
      ) : null}
      <VideoPlayer
        url={url}
        markers={markers}
        onProgress={onProgress}
        isPlaying={currentMarker === null ? isPlaying : false}
        setIsPlaying={setIsPlaying}
        key="preview"
      />
    </>
  )
}
