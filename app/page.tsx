'use client'

import * as Toolbar from '@radix-ui/react-toolbar'
import React, { useCallback, useRef, useState } from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faEllipsis, faPlus } from '@fortawesome/free-solid-svg-icons'
import { faCheckCircle, faCircle } from '@fortawesome/free-regular-svg-icons'
import clsx from 'clsx'
import { SerloEditorProps } from '@serlo/editor'
import VideoPlayerWithMarkers from 'react-video-markers'

// A CC-BY 3.0 video from Blender Foundation
// See https://mango.blender.org/
const defaultUrl =
  'http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4'

export default function InteractiveVideoPlugin() {
  const [mode, setMode] = useState<'play' | 'edit'>('edit')
  const [marker, setMarker] = useState<Marker[]>([])

  const toggleMode = () => {
    setMode((prevMode) => (prevMode === 'play' ? 'edit' : 'play'))
  }

  return (
    <main className="p-4">
      <div className="mx-auto max-w-[800px] rounded-md outline-2 outline outline-gray-200">
        {renderToolbar()}
        <div className="p-2">
          {mode === 'edit' ? (
            <InteractiveVideoEditor
              url={defaultUrl}
              marker={marker}
              setMarker={setMarker}
            />
          ) : (
            <InteractiveVideoRenderer url={defaultUrl} marker={marker} />
          )}
        </div>
      </div>
    </main>
  )

  function renderToolbar() {
    return (
      <Toolbar.Root
        className={clsx(
          'relative top-[-2px] left-[-2px] rounded-t-md w-[calc(100%+4px)]',
          ' bg-orange-100 flex justify-end  align-center p-1',
        )}
      >
        <div className="mx-2 font-bold text-sm">Interaktives Video</div>
        <Toolbar.Separator className="h-6 w-[2px] bg-gray-400" />
        <Toolbar.Button
          className={clsx(
            'mx-2 rounded-md border border-gray-500 text-sm transition-all',
            'px-1 hover:bg-orange-200 focus-visible:bg-orange-200',
          )}
          onClick={toggleMode}
        >
          Vorschau{' '}
          {mode === 'play' ? (
            <FontAwesomeIcon icon={faCircle} />
          ) : (
            <FontAwesomeIcon icon={faCheckCircle} />
          )}
        </Toolbar.Button>
        <Toolbar.Separator className="h-6 w-[2px] bg-gray-400" />
        <Toolbar.Button className="mx-4">
          <FontAwesomeIcon icon={faEllipsis} />
        </Toolbar.Button>
      </Toolbar.Root>
    )
  }
}

function InteractiveVideoEditor({
  url,
  marker,
  changeMarker,
}: InteractiveVideoEditorProps) {
  const currentTime = useRef(0)

  const onProgress = useCallback((event: Event) => {
    if (event.type === 'timeupdate') {
      currentTime.current = (event.target as HTMLVideoElement).currentTime
    }
  }, [])

  return (
    <>
      <VideoPlayer url={url} marker={marker} onProgress={onProgress} />
      <button
        className="mx-auto mt-4 rounded p-2 bg-orange-100 block border-1 border-gray-500"
        onClick={() => console.log(currentTime.current)}
      >
        <FontAwesomeIcon icon={faPlus} /> Aufgabe an aktueller Stelle hinzufügen
      </button>
    </>
  )
}

function InteractiveVideoRenderer({ url, marker }: InteractiveVideoProps) {
  return 'play'
}

function VideoPlayer({ url, marker, onProgress }: VideoPlayerProps) {
  const [volume, setVolume] = useState(1)
  const [isPlaying, setIsPlaying] = useState(false)

  return (
    <div className="mx-auto w-[640px]">
      <VideoPlayerWithMarkers
        url={url}
        volume={volume}
        isPlaying={isPlaying}
        onVolume={setVolume}
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
        onProgress={onProgress}
      />
    </div>
  )
}

interface VideoPlayerProps extends InteractiveVideoProps {
  onProgress: (event: Event) => void
}

interface InteractiveVideoEditorProps extends InteractiveVideoProps {
  setMarker: React.Dispatch<React.SetStateAction<Marker[]>>
}

interface InteractiveVideoProps {
  url: string
  marker: Marker[]
}

interface Marker {
  time: number
  title: string
  content: SerloEditorProps['initialState']
}
