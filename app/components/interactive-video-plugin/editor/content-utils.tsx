import * as t from 'io-ts'
import IconMultipleChoice from '../../../icons/icon-auswahlaufgaben.svg'
import IconInputExercise from '../../../icons/icon-input-exercise.svg'
import IconBlanksDnd from '../../../icons/icon-blanks-dnd.svg'
import IconBlanksTyping from '../../../icons/icon-blanks-typing.svg'
import { Content, ExerciseType } from '../types'

export function getInitialContent(type: ExerciseType): Content {
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

export function getExerciseType(content: unknown): ExerciseType {
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

export function ExerciseIcon({
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

export function getExerciseTypeName(type: ExerciseType): string {
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
