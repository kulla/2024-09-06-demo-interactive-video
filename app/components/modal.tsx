import { faXmark } from '@fortawesome/free-solid-svg-icons'
import * as Dialog from '@radix-ui/react-dialog'
import { type ReactNode, useRef, useEffect } from 'react'

import { cn } from '../helper/cn'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'

export interface ModalWithCloseButtonProps {
  title: string | ReactNode
  isOpen: boolean
  setIsOpen: (open: boolean) => void
  children: ReactNode
}

export function ModalWithCloseButton({
  isOpen,
  title,
  setIsOpen,
  children,
}: ModalWithCloseButtonProps) {
  const previouslyFocusedElementRef = useRef<HTMLElement | null>(null)

  // Restores the focus to the previous element!
  useEffect(() => {
    if (!isOpen) {
      if (previouslyFocusedElementRef.current) {
        previouslyFocusedElementRef.current.focus()
      }
      return
    }

    previouslyFocusedElementRef.current = document.activeElement as HTMLElement
  }, [isOpen])

  return (
    <>
      <Dialog.Root open={isOpen} onOpenChange={setIsOpen}>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 bg-white bg-opacity-75" />
          <Dialog.Content
            className={cn(
              'fixed top-1/2 left-1/2 max-w-[640px] max-h-[80vh]',
              'transform -translate-x-1/2 -translate-y-1/2 w-full',
              'bg-white rounded-xl shadow-lg p-6 flex flex-col',
            )}
            onEscapeKeyDown={() => setIsOpen(false)}
            aria-describedby={undefined}
          >
            <Dialog.Title
              className={cn(
                'mb-6 pb-1 font-bold hyphens-auto',
                'border-b border-gray-300 text-gray-900',
              )}
            >
              {title}
            </Dialog.Title>

            <div className="flex-1 overflow-y-auto overflow-x-hidden">
              {children}
            </div>

            <Dialog.Close
              aria-label="Close"
              onClick={() => setIsOpen(false)}
              title="Abbrechen"
              className={cn(
                'absolute right-3.5 top-3.5 inline-flex h-6 w-6',
                'cursor-pointer items-center justify-center rounded-full',
                'border-none leading-tight text-almost-black hover:bg-orange-200',
                'hover:text-white',
              )}
              data-qa="modal-close-button"
            >
              <FontAwesomeIcon icon={faXmark} className="h-5" />
            </Dialog.Close>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
    </>
  )
}
