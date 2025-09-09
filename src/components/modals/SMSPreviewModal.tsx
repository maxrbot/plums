"use client"

import { Fragment } from 'react'
import { Dialog, Transition } from '@headlessui/react'
import { XMarkIcon, DevicePhoneMobileIcon } from '@heroicons/react/24/outline'
import { Contact } from '../../types'

interface SMSPreviewModalProps {
  isOpen: boolean
  onClose: () => void
  contact: Contact
}

// Generate SMS content
const generateSMSContent = (contact: Contact) => {
  const firstName = contact.firstName || 'Friend'
  
  const smsContent = `Hey ${firstName}! Fresh price sheet ready with today's deals. Check it out: graniteridge.com/ps/today

🥬 Featured: Romaine $19, Broccoli $28.50, Celery $24.50
${contact.pricesheetSettings?.globalAdjustment && contact.pricesheetSettings.globalAdjustment < 0 ? 
  `Your ${Math.abs(contact.pricesheetSettings.globalAdjustment)}% discount applied! ` : ''}
Call me for quantities! 📞

- Mike | (559) 555-0187`

  return smsContent
}

export default function SMSPreviewModal({
  isOpen,
  onClose,
  contact
}: SMSPreviewModalProps) {
  const smsContent = generateSMSContent(contact)
  const characterCount = smsContent.length

  return (
    <Transition appear show={isOpen} as={Fragment}>
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
          <div className="fixed inset-0 bg-black bg-opacity-25" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4 text-center">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white text-left align-middle shadow-xl transition-all">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-gray-200">
                  <div className="flex items-center space-x-3">
                    <div className="flex-shrink-0">
                      <DevicePhoneMobileIcon className="h-6 w-6 text-green-600" />
                    </div>
                    <div>
                      <Dialog.Title as="h3" className="text-lg font-medium text-gray-900">
                        SMS Preview
                      </Dialog.Title>
                      <p className="text-sm text-gray-500">
                        {contact.company} • {contact.firstName} {contact.lastName}
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    className="rounded-md text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-green-500"
                    onClick={onClose}
                  >
                    <XMarkIcon className="h-6 w-6" />
                  </button>
                </div>

                {/* SMS Headers */}
                <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
                  <div className="space-y-2 text-sm">
                    <div className="flex">
                      <span className="w-16 text-gray-500 font-medium">From:</span>
                      <span className="text-gray-900">(559) 555-0187</span>
                    </div>
                    <div className="flex">
                      <span className="w-16 text-gray-500 font-medium">To:</span>
                      <span className="text-gray-900">{contact.phone || '(555) 123-4567'}</span>
                    </div>
                  </div>
                </div>

                {/* Phone Mockup */}
                <div className="p-6 bg-gradient-to-b from-blue-50 to-blue-100">
                  <div className="mx-auto max-w-xs">
                    {/* iPhone Frame */}
                    <div className="bg-black rounded-[2.5rem] p-2 shadow-2xl">
                      <div className="bg-white rounded-[2rem] overflow-hidden">
                        {/* Status Bar */}
                        <div className="bg-gray-100 px-6 py-2 flex justify-between items-center text-xs font-medium">
                          <span>9:41 AM</span>
                          <div className="flex items-center space-x-1">
                            <div className="w-4 h-2 bg-green-500 rounded-sm"></div>
                            <span>100%</span>
                          </div>
                        </div>
                        
                        {/* Messages Header */}
                        <div className="bg-gray-50 px-4 py-3 border-b border-gray-200">
                          <div className="flex items-center space-x-3">
                            <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white text-sm font-medium">
                              MR
                            </div>
                            <div>
                              <p className="font-medium text-sm">Mike Rodriguez</p>
                              <p className="text-xs text-gray-500">Granite Ridge Produce</p>
                            </div>
                          </div>
                        </div>

                        {/* SMS Content */}
                        <div className="p-4 min-h-[300px] bg-white">
                          <div className="flex justify-end mb-4">
                            <div className="max-w-[80%] bg-blue-500 text-white rounded-2xl rounded-br-md px-4 py-2">
                              <p className="text-sm whitespace-pre-wrap">{smsContent}</p>
                            </div>
                          </div>
                          
                          {/* Delivered indicator */}
                          <div className="flex justify-end">
                            <p className="text-xs text-gray-400">Delivered</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Character Count */}
                <div className="px-6 py-3 bg-gray-50 border-t border-gray-200">
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-gray-600">Message Length</span>
                    <span className={`font-medium ${characterCount > 160 ? 'text-red-600' : 'text-green-600'}`}>
                      {characterCount}/160 characters
                    </span>
                  </div>
                  {characterCount > 160 && (
                    <p className="text-xs text-red-600 mt-1">
                      Message will be sent as {Math.ceil(characterCount / 160)} parts
                    </p>
                  )}
                </div>

                {/* Footer */}
                <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex justify-end">
                  <button
                    type="button"
                    className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                    onClick={onClose}
                  >
                    Close Preview
                  </button>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  )
}
