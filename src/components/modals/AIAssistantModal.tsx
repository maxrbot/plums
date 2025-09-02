'use client'

import { Fragment } from 'react'
import { Dialog, Transition } from '@headlessui/react'
import { XMarkIcon, ChatBubbleLeftRightIcon, SparklesIcon } from '@heroicons/react/24/outline'

interface AIAssistantModalProps {
  isOpen: boolean
  onClose: () => void
}

export default function AIAssistantModal({ isOpen, onClose }: AIAssistantModalProps) {
  return (
    <Transition.Root show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onClose}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" />
        </Transition.Child>

        <div className="fixed inset-0 z-10 overflow-y-auto">
          <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
              enterTo="opacity-100 translate-y-0 sm:scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 translate-y-0 sm:scale-100"
              leaveTo="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
            >
              <Dialog.Panel className="relative transform overflow-hidden rounded-lg bg-white px-4 pb-4 pt-5 text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg sm:p-6">
                <div className="absolute right-0 top-0 hidden pr-4 pt-4 sm:block">
                  <button
                    type="button"
                    className="rounded-md bg-white text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-lime-500 focus:ring-offset-2"
                    onClick={onClose}
                  >
                    <span className="sr-only">Close</span>
                    <XMarkIcon className="h-6 w-6" aria-hidden="true" />
                  </button>
                </div>
                
                <div className="sm:flex sm:items-start">
                  <div className="mx-auto flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-cyan-100 sm:mx-0 sm:h-10 sm:w-10">
                    <ChatBubbleLeftRightIcon className="h-6 w-6 text-cyan-600" aria-hidden="true" />
                  </div>
                  <div className="mt-3 text-center sm:ml-4 sm:mt-0 sm:text-left">
                    <Dialog.Title as="h3" className="text-lg font-semibold leading-6 text-gray-900">
                      AcreList Sales Assistant
                    </Dialog.Title>
                    <div className="mt-2">
                      <p className="text-sm text-gray-600 mb-4">
                        Our AI Sales Assistant is currently available as a premium feature for existing customers.
                      </p>
                      
                      <div className="bg-gradient-to-r from-cyan-50 to-blue-50 rounded-lg p-4 mb-4">
                        <div className="flex items-start space-x-3">
                          <SparklesIcon className="h-5 w-5 text-cyan-600 mt-0.5" />
                          <div>
                            <h4 className="text-sm font-medium text-gray-900 mb-2">What it does:</h4>
                            <ul className="text-xs text-gray-600 space-y-1">
                              <li>• Handles basic customer inquiries 24/7</li>
                              <li>• Qualifies leads automatically</li>
                              <li>• Provides product information and pricing</li>
                              <li>• Schedules follow-up calls with your team</li>
                              <li>• Integrates with your existing price sheets</li>
                            </ul>
                          </div>
                        </div>
                      </div>
                      
                      <p className="text-sm text-gray-600">
                        <strong>Ready to get started?</strong> Sign up for AcreList and explore our core price sheet features. 
                        The AI Sales Assistant will be available as an add-on once you&apos;re set up.
                      </p>
                    </div>
                  </div>
                </div>
                
                <div className="mt-5 sm:mt-4 sm:flex sm:flex-row-reverse">
                  <button
                    type="button"
                    className="inline-flex w-full justify-center rounded-md bg-lime-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-lime-500 sm:ml-3 sm:w-auto"
                    onClick={onClose}
                  >
                    Got it, thanks!
                  </button>
                  <button
                    type="button"
                    className="mt-3 inline-flex w-full justify-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 sm:mt-0 sm:w-auto"
                    onClick={onClose}
                  >
                    Learn more about pricing
                  </button>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition.Root>
  )
}
