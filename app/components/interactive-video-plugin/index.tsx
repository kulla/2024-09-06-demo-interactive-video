'use client'
import * as Toolbar from '@radix-ui/react-toolbar'
import React, { useState } from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faEllipsis } from '@fortawesome/free-solid-svg-icons'
import { faCheckCircle, faCircle } from '@fortawesome/free-regular-svg-icons'
import { cn } from '../../helper/cn'
import { InteractiveVideoEditor } from './editor'
import { InteractiveVideoRenderer } from './renderer'
import { Marker } from './types'

// A CC-BY 3.0 video from Blender Foundation
// See https://mango.blender.org/
const defaultUrl =
  'http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4'

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
