'use client'

import { Heading } from '@radix-ui/themes'
import * as Toolbar from '@radix-ui/react-toolbar'
import { useState } from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faEllipsis } from '@fortawesome/free-solid-svg-icons'
import { faCheckCircle, faCircle } from '@fortawesome/free-regular-svg-icons'

export default function Home() {
  const [mode, setMode] = useState<'play' | 'edit'>('edit')

  const toggleMode = () => {
    setMode((prevMode) => (prevMode === 'play' ? 'edit' : 'play'))
  }

  return (
    <main className="p-4">
      <div className="mx-auto max-w-[800px] rounded-md outline-2 outline outline-grey">
        <Toolbar.Root className="relative top-[-2px] left-[-2px] rounded-t-md w-[calc(100%+4px)] bg-orange flex justify-end  align-center p-1">
          <Toolbar.Button className="mx-2 font-bold text-sm">
            Interaktives Video
          </Toolbar.Button>
          <Toolbar.Separator className="h-6 w-[2px] bg-gray-400" />
          <Toolbar.Button
            className="mx-2 rounded-md border border-gray-500 px-1 text-sm transition-all hover:bg-editor-primary-200 focus-visible:bg-editor-primary-200"
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
        <div className="p-2">
          <Heading>{mode === 'play' ? 'Play' : 'Edit'}</Heading>
        </div>
      </div>
    </main>
  )
}
