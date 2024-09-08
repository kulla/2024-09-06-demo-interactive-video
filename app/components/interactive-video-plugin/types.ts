export enum ExerciseType {
  MultipleChoice = 'MultipleChoice',
  SingleChoice = 'SingleChoice',
  Input = 'Input',
  FillInTheBlanks = 'FillInTheBlanks',
  DragAndDrop = 'DragAndDrop',
}

export interface InteractiveVideoState {
  url: string
  markers: Marker[]
}

export interface Marker extends Exercise {
  type: ExerciseType
  time: number
}

export interface Exercise {
  title: string
  content: Content
}

export type Content = { plugin: string; state: unknown }
