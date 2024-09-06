'use client'

import * as Toolbar from '@radix-ui/react-toolbar'
import React, { useState } from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faEllipsis } from '@fortawesome/free-solid-svg-icons'
import { faCheckCircle, faCircle } from '@fortawesome/free-regular-svg-icons'
import clsx from 'clsx'
import { SerloEditorProps } from '@serlo/editor'

// A CC-BY 3.0 video from Blender Foundation
// See https://mango.blender.org/
const defaultUrl =
  'http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4'

export default function Home() {
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
  return 'editor'
}

function InteractiveVideoRenderer({ url, marker }: InteractiveVideoProps) {
  return 'play'
}

interface InteractiveVideoEditorProps extends InteractiveVideoProps {
  setMarker: React.Dispatch<React.SetStateAction<Marker[]>>
}

interface InteractiveVideoProps {
  url: string
  marker: Marker[]
}

interface Marker {
  id: string
  time: number
  title: string
  content: SerloEditorProps['initialState']
}
