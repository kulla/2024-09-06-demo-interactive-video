'use client'

import * as Toolbar from '@radix-ui/react-toolbar'
import React, { useCallback, useRef, useState } from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faEllipsis, faPlus } from '@fortawesome/free-solid-svg-icons'
import { faCheckCircle, faCircle } from '@fortawesome/free-regular-svg-icons'
import { SerloEditor } from '@serlo/editor'
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

interface InteractiveVideoEditorProps extends InteractiveVideoRendererProps {
  setMarker: React.Dispatch<React.SetStateAction<Marker[]>>
}

function InteractiveVideoEditor({
  url,
  marker,
  setMarker,
}: InteractiveVideoEditorProps) {
  const [openModal, setOpenModal] = useState(false)
  const [isPlaying, setIsPlaying] = useState(false)
  const currentTime = useRef(0)

  const onProgress = useCallback((event: Event) => {
    if (event.type === 'timeupdate') {
      currentTime.current = (event.target as HTMLVideoElement).currentTime
    }
  }, [])

  return (
    <>
      <VideoPlayer
        url={url}
        marker={marker}
        onProgress={onProgress}
        isPlaying={isPlaying}
        setIsPlaying={setIsPlaying}
      />
      <CreateExerciseDialog
        isOpen={openModal}
        setIsOpen={setOpenModal}
        onSave={(exercise) => {
          const newMarker = {
            type: ExerciseType.MultipleChoice,
            time: currentTime.current,
            ...exercise,
          }

          setMarker((prev) => [...prev, newMarker])
          setOpenModal(false)
        }}
      />
      <button
        className="button mx-auto mt-4 block"
        onClick={() => {
          setOpenModal(true)
          setIsPlaying(false)
        }}
      >
        <FontAwesomeIcon icon={faPlus} /> Aufgabe an aktueller Stelle hinzufügen
      </button>
    </>
  )
}

interface InteractiveVideoRendererProps {
  url: string
  marker: Marker[]
}

function InteractiveVideoRenderer({
  url,
  marker,
}: InteractiveVideoRendererProps) {
  return 'play'
}

interface VideoPlayerProps extends InteractiveVideoRendererProps {
  onProgress: (event: Event) => void
  isPlaying: boolean
  setIsPlaying: React.Dispatch<React.SetStateAction<boolean>>
}

function VideoPlayer({
  url,
  marker,
  onProgress,
  isPlaying,
  setIsPlaying,
}: VideoPlayerProps) {
  const [volume, setVolume] = useState(1)

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

interface CreateExerciseDialogProps {
  isOpen: boolean
  setIsOpen: React.Dispatch<React.SetStateAction<boolean>>
  onSave: (exercise: Exercise) => void
}

function CreateExerciseDialog({
  setIsOpen,
  onSave,
  isOpen,
}: CreateExerciseDialogProps) {
  const [content, setContent] = useState<Content | null>(null)
  const [title, setTitle] = useState('')

  return (
    <ModalWithCloseButton
      isOpen={isOpen}
      title={
        content === null ? (
          'Aufgabentyp auswählen'
        ) : (
          <input
            className="border-none focus:outline-none"
            type="text"
            value={title}
            placeholder="Titel"
            onChange={(e) => setTitle(e.target.value)}
          />
        )
      }
      setIsOpen={setIsOpen}
    >
      {content === null ? (
        <ExerciseTypeSelection />
      ) : (
        <ExerciseEditor content={content} />
      )}
      <SaveAndCloseToolbar />
    </ModalWithCloseButton>
  )

  function ExerciseTypeSelection() {
    return (
      <div className="flex flex-col space-y-2">
        {Object.values(ExerciseType).map((type) => (
          <button
            key={type}
            className="button"
            onClick={() => setContent(getInitialContent(type))}
          >
            {type}
          </button>
        ))}
      </div>
    )
  }

  function ExerciseEditor({ content }: { content: Content }) {
    return (
      <>
        <SerloEditor
          initialState={content}
          editorVariant="unknown"
          onChange={({ changed, getDocument }) => {
            if (changed) {
              const newState = getDocument()

              if (newState !== null) {
                setContent(newState)
              }
            }
          }}
        >
          {(editor) => {
            return <>{editor.element}</>
          }}
        </SerloEditor>
      </>
    )
  }

  function SaveAndCloseToolbar() {
    return (
      <Toolbar.Root className="flex justify-end mt-6">
        {content !== null ? (
          <Toolbar.Button
            className="button mr-4"
            onClick={() => {
              onSave({ title, content })
              setIsOpen(false)
            }}
          >
            Speichern
          </Toolbar.Button>
        ) : null}
        <Toolbar.Button className="button" onClick={() => setIsOpen(false)}>
          Abbrechen
        </Toolbar.Button>
      </Toolbar.Root>
    )
  }
}

function getInitialContent(type: ExerciseType): Content {
  return {
    plugin: 'exercise',
    state: {
      content: {
        plugin: 'rows',
        state: [
          {
            plugin: 'text',
            state: [
              {
                type: 'p',
                children: [
                  { text: 'Aufgabenstellung:', strong: true },
                  { text: ' ' },
                ],
              },
            ],
          },
        ],
      },
      interactive: {
        plugin: 'scMcExercise',
        state: {
          isSingleChoice: false,
          answers: [
            {
              content: {
                plugin: 'text',
                state: [{ type: 'p', children: [{ text: 'Antwort 1' }] }],
              },
              isCorrect: false,
              feedback: {
                plugin: 'text',
                state: [{ type: 'p', children: [{ text: '' }] }],
              },
            },
            {
              content: {
                plugin: 'text',
                state: [{ type: 'p', children: [{ text: 'Antwort 2' }] }],
              },
              isCorrect: false,
              feedback: {
                plugin: 'text',
                state: [{ type: 'p', children: [{ text: '' }] }],
              },
            },
          ],
        },
      },
    },
  }
}

interface Marker {
  type: ExerciseType
  time: number
}

interface Exercise {
  title: string
  content: Content
}

type Content = { plugin: string; state: unknown }
