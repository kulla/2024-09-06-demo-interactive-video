'use client'

import * as Toolbar from '@radix-ui/react-toolbar'
import React, { useCallback, useRef, useState } from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faEllipsis, faPlus } from '@fortawesome/free-solid-svg-icons'
import { faCheckCircle, faCircle } from '@fortawesome/free-regular-svg-icons'
import { SerloEditorProps } from '@serlo/editor'
import VideoPlayerWithMarkers from 'react-video-player-extended'
import { cn } from './helper/cn'
import { ModalWithCloseButton } from './components/modal'

// A CC-BY 3.0 video from Blender Foundation
// See https://mango.blender.org/
const defaultUrl =
  'http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4'

enum ExerciseType {
  MultipleChoice = 'MultipleChoice',
  SingleChoice = 'SingleChoice',
  Input = 'Input',
  FillInTheBlanks = 'FillInTheBlanks',
  DragAndDrop = 'DragAndDrop',
}

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
        className={cn(
          'relative top-[-2px] left-[-2px] rounded-t-md w-[calc(100%+4px)]',
          ' bg-orange-100 flex justify-end  align-center p-1',
        )}
      >
        <div className="mx-2 font-bold text-sm">Interaktives Video</div>
        <Toolbar.Separator className="h-6 w-[2px] bg-gray-400" />
        <Toolbar.Button
          className={cn(
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
  setMarker,
}: InteractiveVideoEditorProps) {
  const [openModal, setOpenModal] = useState(false)
  const currentTime = useRef(0)

  const onProgress = useCallback((event: Event) => {
    if (event.type === 'timeupdate') {
      currentTime.current = (event.target as HTMLVideoElement).currentTime
    }
  }, [])

  return (
    <>
      <VideoPlayer url={url} marker={marker} onProgress={onProgress} />
      <CreateMarkerDialog
        isOpen={openModal}
        setIsOpen={setOpenModal}
        onCreate={(marker) => {
          setMarker((prevMarker) => [...prevMarker, marker])
          setOpenModal(false)
        }}
      />
      <button
        className="mx-auto mt-4 rounded p-2 bg-orange-100 block border-1 border-gray-500"
        onClick={() => setOpenModal(true)}
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

interface CreateMarkerDialogProps {
  isOpen: boolean
  setIsOpen: React.Dispatch<React.SetStateAction<boolean>>
  onCreate: (marker: Marker) => void
}

function CreateMarkerDialog({
  setIsOpen,
  onCreate,
  isOpen,
}: CreateMarkerDialogProps) {
  const [exerciseType, setExerciseType] = useState<ExerciseType | null>(null)

  return (
    <ModalWithCloseButton
      isOpen={isOpen}
      title={
        exerciseType
          ? 'Aufgabe für aktuelle Stelle erstellen'
          : 'Aufgabentyp für aktuelle Stelle auswählen'
      }
      setIsOpen={setIsOpen}
    >
      <ExerciseTypeSelection />
    </ModalWithCloseButton>
  )

  function ExerciseTypeSelection() {
    if (exerciseType !== null) return

    // TODO: Icon hinzufügen
    return (
      <div className="flex flex-col space-y-2">
        <button
          className="rounded-md p-2 bg-orange-100"
          onClick={() => setExerciseType(ExerciseType.MultipleChoice)}
        >
          Multiple Choice
        </button>
        <button
          className="rounded-md p-2 bg-orange-100"
          onClick={() => setExerciseType(ExerciseType.SingleChoice)}
        >
          Single Choice
        </button>
        <button
          className="rounded-md p-2 bg-orange-100"
          onClick={() => setExerciseType(ExerciseType.Input)}
        >
          Input
        </button>
        <button
          className="rounded-md p-2 bg-orange-100"
          onClick={() => setExerciseType(ExerciseType.FillInTheBlanks)}
        >
          Fill in the Blanks
        </button>
        <button
          className="rounded-md p-2 bg-orange-100"
          onClick={() => setExerciseType(ExerciseType.DragAndDrop)}
        >
          Drag and Drop
        </button>
      </div>
    )
  }
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
