import { useState } from 'react'
import { Content, Exercise, ExerciseType } from '../types'
import { ModalWithCloseButton } from '../../modal'
import { SerloEditor } from '@serlo/editor'
import {
  ExerciseIcon,
  getExerciseTypeName,
  getInitialContent,
} from './content-utils'
import * as Toolbar from '@radix-ui/react-toolbar'

interface CreateExerciseDialogProps {
  isOpen: boolean
  setIsOpen: React.Dispatch<React.SetStateAction<boolean>>
  onSave: (exercise: Exercise) => void
  initialContent?: Content | null
  initialTitle?: string
}

export function CreateExerciseDialog({
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
