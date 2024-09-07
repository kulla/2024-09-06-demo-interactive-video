'use client'

import * as R from 'ramda'
import * as Toolbar from '@radix-ui/react-toolbar'
import React, { useCallback, useRef, useState } from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
  faEdit,
  faEllipsis,
  faPlus,
  faTrash,
} from '@fortawesome/free-solid-svg-icons'
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
  const [markers, setMarkers] = useState<Marker[]>([])

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
              markers={markers}
              setMarkers={setMarkers}
            />
          ) : (
            <InteractiveVideoRenderer url={defaultUrl} markers={markers} />
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
            <FontAwesomeIcon icon={faCheckCircle} />
          ) : (
            <FontAwesomeIcon icon={faCircle} />
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
  setMarkers: React.Dispatch<React.SetStateAction<Marker[]>>
}

function InteractiveVideoEditor({
  url,
  markers,
  setMarkers,
}: InteractiveVideoEditorProps) {
  const [openModal, setOpenModal] = useState(false)
  const [isPlaying, setIsPlaying] = useState(false)
  const [editIndex, setEditIndex] = useState<null | number>(null)
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
        markers={markers}
        onProgress={onProgress}
        isPlaying={isPlaying}
        setIsPlaying={setIsPlaying}
        currentTime={currentTime.current}
      />
      <CreateExerciseDialog
        isOpen={openModal}
        setIsOpen={setOpenModal}
        onSave={({ title, content }) => {
          const newMarker = {
            type: ExerciseType.MultipleChoice,
            time: currentTime.current,
            title: getDefaultTitle(title, currentTime.current),
            content,
          }

          console.log(newMarker)

          setMarkers((prev) => R.sortBy((x) => x.time, [...prev, newMarker]))
          setOpenModal(false)
        }}
      />
      {editIndex !== null ? (
        <CreateExerciseDialog
          isOpen={editIndex !== null}
          setIsOpen={(value) => {
            if (!value) setEditIndex(null)
          }}
          initialContent={markers[editIndex].content}
          initialTitle={markers[editIndex].title}
          onSave={({ title, content }) => {
            setMarkers((prev) => [
              ...prev.slice(0, editIndex),
              {
                ...prev[editIndex],
                content,
                title: getDefaultTitle(title, currentTime.current),
              },
              ...prev.slice(editIndex + 1),
            ])

            setEditIndex(null)
          }}
        />
      ) : null}
      <button
        className="button mx-auto mt-4 block"
        onClick={() => {
          setOpenModal(true)
          setIsPlaying(false)
        }}
      >
        <FontAwesomeIcon icon={faPlus} /> Aufgabe an aktueller Stelle hinzufügen
      </button>
      <div className="mt-4 mx-4">
        {markers.map((marker, index) => (
          <div key={index} className="flex items-center justify-between mt-2">
            <div className="flex space-x-4">
              <span>{formatTime(marker.time)}</span>
              <span>{marker.type}</span>
              <span>{marker.title}</span>
            </div>
            <div className="flex space-x-4">
              <button className="button" onClick={() => setEditIndex(index)}>
                <FontAwesomeIcon icon={faEdit} /> Bearbeiten
              </button>
              <button
                className="button"
                onClick={() => {
                  setMarkers((prev) => prev.filter((x) => x !== marker))
                }}
              >
                <FontAwesomeIcon icon={faTrash} /> Löschen
              </button>
            </div>
          </div>
        ))}
      </div>
    </>
  )
}

interface InteractiveVideoRendererProps {
  url: string
  markers: Marker[]
}

function InteractiveVideoRenderer({
  url,
  markers,
}: InteractiveVideoRendererProps) {
  return 'play'
}

interface VideoPlayerProps extends InteractiveVideoRendererProps {
  onProgress: (event: Event) => void
  isPlaying: boolean
  setIsPlaying: React.Dispatch<React.SetStateAction<boolean>>
  currentTime: number
}

function VideoPlayer({
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

interface CreateExerciseDialogProps {
  isOpen: boolean
  setIsOpen: React.Dispatch<React.SetStateAction<boolean>>
  onSave: (exercise: Exercise) => void
  initialContent?: Content | null
  initialTitle?: string
}

function CreateExerciseDialog({
  setIsOpen,
  onSave,
  isOpen,
  initialContent = null,
  initialTitle = '',
}: CreateExerciseDialogProps) {
  const [content, setContent] = useState<Content | null>(initialContent)
  const [title, setTitle] = useState(initialTitle)

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
        <SerloEditor
          initialState={content}
          editorVariant="unknown"
          onChange={({ changed, getDocument }) => {
            if (changed) {
              const newContent = getDocument()

              if (newContent !== null) setContent(newContent)
            }
          }}
        >
          {(editor) => {
            return <>{editor.element}</>
          }}
        </SerloEditor>
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

interface Marker extends Exercise {
  type: ExerciseType
  time: number
}

interface Exercise {
  title: string
  content: Content
}

type Content = { plugin: string; state: unknown }

function getDefaultTitle(title: string, time: number): string {
  return title.trim() !== ''
    ? title
    : `Aufgabe an der Stelle ${formatTime(time)}`
}

function formatTime(seconds: number): string {
  const hours = Math.floor(seconds / 3600)
    .toString()
    .padStart(2, '0')
  const minutes = Math.floor((seconds % 3600) / 60)
    .toString()
    .padStart(2, '0')
  const secs = Math.round(seconds % 60)
    .toString()
    .padStart(2, '0')

  return `${hours}:${minutes}:${secs}`
}
