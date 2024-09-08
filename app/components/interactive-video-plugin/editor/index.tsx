import { useCallback, useRef, useState } from 'react'
import { InteractiveVideoState, Marker } from '../types'
import { VideoPlayer } from '../video-player'
import { CreateExerciseDialog } from './create-exercise-dialog'
import { ExerciseIcon, getExerciseType } from './content-utils'
import { formatTime, getDefaultTitle } from './utils'
import * as R from 'ramda'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faEdit, faPlus, faTrash } from '@fortawesome/free-solid-svg-icons'

interface InteractiveVideoEditorProps extends InteractiveVideoState {
  setMarkers: React.Dispatch<React.SetStateAction<Marker[]>>
}

export function InteractiveVideoEditor({
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
