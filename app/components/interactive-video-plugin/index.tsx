'use client'

import dynamic from 'next/dynamic'
import * as t from 'io-ts'
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
import { SerloEditor, SerloRenderer } from '@serlo/editor'
import { cn } from '../../helper/cn'
import { ModalWithCloseButton } from '../modal'

import IconMultipleChoice from '../../icons/icon-auswahlaufgaben.svg'
import IconInputExercise from '../../icons/icon-input-exercise.svg'
import IconBlanksDnd from '../../icons/icon-blanks-dnd.svg'
import IconBlanksTyping from '../../icons/icon-blanks-typing.svg'

const VideoPlayerWithMarkers = dynamic(
  () => import('react-video-player-extended'),
  { ssr: false },
)

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

export function InteractiveVideoPlugin() {
  const [mode, setMode] = useState<'play' | 'edit'>('edit')
  const [markers, setMarkers] = useState<Marker[]>([])

  const toggleMode = () => {
    setMode((prevMode) => (prevMode === 'play' ? 'edit' : 'play'))
  }

  return (
    <div className="mx-auto max-w-[800px] rounded-md outline-2 outline outline-gray-200">
      <PluginToolbar />
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
  )

  function PluginToolbar() {
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
  const [wasPlayingBeforeModal, setWasPlayingBeforeModal] = useState(false)
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
      {/* By adding "key={markers.length}" the CreateExerciseDialog is
          reset whenever the markers change. */}
      <CreateExerciseDialog
        isOpen={openModal}
        setIsOpen={setOpenModal}
        onSave={({ title, content }) => {
          const newMarker = {
            type: getExerciseType(content),
            time: currentTime.current,
            title: getDefaultTitle(title, currentTime.current),
            content,
          }

          setMarkers((prev) => R.sortBy((x) => x.time, [...prev, newMarker]))
          setOpenModal(false)
          setIsPlaying(wasPlayingBeforeModal)
        }}
        key={markers.length}
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
                type: getExerciseType(content),
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
          setWasPlayingBeforeModal(isPlaying)
          setIsPlaying(false)
        }}
      >
        <FontAwesomeIcon icon={faPlus} /> Aufgabe an aktueller Stelle hinzufügen
      </button>
      <div className="mt-4 mx-4">
        {markers.map((marker, index) => (
          <div key={index} className="flex items-center justify-between mt-2">
            <div className="flex space-x-4 items-center">
              <span>{formatTime(marker.time)}</span>
              <ExerciseIcon
                type={marker.type}
                width={60}
                className="text-gray-500 bg-gray-200 rounded-md"
              />
              <span>{marker.title}</span>
            </div>
            <div className="flex space-x-4 items-center">
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
      />
    </>
  )
}

interface VideoPlayerProps extends InteractiveVideoRendererProps {
  onProgress: (event: Event) => void
  isPlaying: boolean
  setIsPlaying: React.Dispatch<React.SetStateAction<boolean>>
  currentTime?: number
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
      <div className="grid gap-x-1 gap-y-4 grid-cols-3">
        {Object.values(ExerciseType).map((type) => (
          <button
            key={type}
            className="w-32 flex flex-col items-center space-y-2"
            onClick={() => setContent(getInitialContent(type))}
          >
            <ExerciseIcon
              type={type}
              width={150}
              className="button text-orange-300 hover:text-orange-400"
            />
            <span className="text-gray-900">{getExerciseTypeName(type)}</span>
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
      interactive: getInteractiveContent(type),
    },
  }
}

function getInteractiveContent(type: ExerciseType): unknown {
  switch (type) {
    case ExerciseType.MultipleChoice:
    case ExerciseType.SingleChoice:
      return {
        plugin: 'scMcExercise',
        state: {
          isSingleChoice: type === ExerciseType.SingleChoice,
          answers: [
            {
              content: {
                plugin: 'text',
                state: [{ type: 'p', children: [{ text: 'Antwort 1' }] }],
              },
              isCorrect: true,
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
      }
    case ExerciseType.Input:
      return {
        plugin: 'inputExercise',
        state: {
          type: 'input-string-normalized-match-challenge',
          unit: '',
          answers: [
            { value: '', isCorrect: true, feedback: { plugin: 'text' } },
          ],
        },
      }
    case ExerciseType.DragAndDrop:
    case ExerciseType.FillInTheBlanks:
      return {
        plugin: 'blanksExercise',
        state: {
          text: { plugin: 'text' },
          mode:
            type === ExerciseType.FillInTheBlanks ? 'typing' : 'drag-and-drop',
        },
      }
  }
}

const ExerciseContent = t.type({
  plugin: t.literal('exercise'),
  state: t.type({
    interactive: t.union([
      t.type({
        plugin: t.literal('scMcExercise'),
        state: t.type({
          isSingleChoice: t.boolean,
        }),
      }),
      t.type({
        plugin: t.literal('inputExercise'),
      }),
      t.type({
        plugin: t.literal('blanksExercise'),
        state: t.type({
          mode: t.union([t.literal('typing'), t.literal('drag-and-drop')]),
        }),
      }),
    ]),
  }),
})

function getExerciseType(content: unknown): ExerciseType {
  if (!ExerciseContent.is(content)) {
    throw new Error('Invalid exercise content')
  }

  const interactive = content.state.interactive

  if (interactive.plugin === 'scMcExercise') {
    return interactive.state.isSingleChoice
      ? ExerciseType.SingleChoice
      : ExerciseType.MultipleChoice
  } else if (interactive.plugin === 'inputExercise') {
    return ExerciseType.Input
  } else if (interactive.plugin === 'blanksExercise') {
    return interactive.state.mode === 'typing'
      ? ExerciseType.FillInTheBlanks
      : ExerciseType.DragAndDrop
  } else {
    throw new Error('Unknown interactive plugin')
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

function ExerciseIcon({
  type,
  width = 100,
  className,
}: {
  type: ExerciseType
  width?: number
  className?: string
}) {
  const Component = (() => {
    switch (type) {
      case ExerciseType.MultipleChoice:
      case ExerciseType.SingleChoice:
        return IconMultipleChoice
      case ExerciseType.Input:
        return IconInputExercise
      case ExerciseType.FillInTheBlanks:
        return IconBlanksTyping
      case ExerciseType.DragAndDrop:
        return IconBlanksDnd
    }
  })()

  return <Component className={className} width={width} />
}

function getExerciseTypeName(type: ExerciseType): string {
  switch (type) {
    case ExerciseType.MultipleChoice:
      return 'Multiple Choice'
    case ExerciseType.SingleChoice:
      return 'Single Choice'
    case ExerciseType.Input:
      return 'Aufgabe mit Eingabefeld'
    case ExerciseType.FillInTheBlanks:
      return 'Lückentext-Aufgabe'
    case ExerciseType.DragAndDrop:
      return 'Drag & Drop Aufgabe'
  }
}

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
