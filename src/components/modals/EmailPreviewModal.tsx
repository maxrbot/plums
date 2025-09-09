"use client"

import { Fragment } from 'react'
import { Dialog, Transition } from '@headlessui/react'
import { XMarkIcon, EnvelopeIcon } from '@heroicons/react/24/outline'
import { Contact } from '../../types'

interface EmailPreviewModalProps {
  isOpen: boolean
  onClose: () => void
  contact: Contact
  customMessage?: string
  attachedFiles?: File[]
  userEmail?: string
  userPhone?: string
}

// Generate personalized email content (reusing logic from send page)
const generatePersonalizedEmail = (contact: Contact, customMessage?: string, userEmail?: string, userPhone?: string) => {
  const firstName = contact.firstName || 'Friend'
  const company = contact.company || 'Your Company'
  
  return {
    subject: `Granite Ridge Produce - Today's Deals`,
    content: `Hey ${firstName},

Great talking with you on the phone yesterday! Please see the attached Price Sheet and quality photos. We have some featured items that I think you'll be interested in:

🥬 Today's Featured Items:
• Romaine Lettuce: 24ct cartons, premium grade - $19.00
• Broccoli: 14ct cases, premium quality - $28.50
• Celery: 30ct cartons, crisp and fresh - $24.50
• Valencia Oranges: 40lb cartons (56s), fancy grade - $45.00

${contact.pricesheetSettings?.globalAdjustment !== 0 ? 
  contact.pricesheetSettings?.globalAdjustment && contact.pricesheetSettings.globalAdjustment > 0 ? 
    `As discussed, your premium pricing reflects the priority service and quality grades we reserve for ${company}.` :
    `Don't forget about your ${Math.abs(contact.pricesheetSettings?.globalAdjustment || 0)}% volume discount - already reflected in the attached sheet.`
  : 'All pricing is current as of this morning.'
}

${customMessage ? `Also wanted to mention: ${customMessage}` : ''}

Let me know what quantities work for ${company} and we can get this loaded today.

Talk soon,
Mike Rodriguez
Granite Ridge Produce
${userEmail || 'sales@acrelist.com'} | ${userPhone || '(555) 123-4567'}`
  }
}

export default function EmailPreviewModal({
  isOpen,
  onClose,
  contact,
  customMessage,
  attachedFiles = [],
  userEmail = 'sales@acrelist.com',
  userPhone = '(555) 123-4567'
}: EmailPreviewModalProps) {
  const email = generatePersonalizedEmail(contact, customMessage, userEmail, userPhone)

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
              <Dialog.Panel className="w-full max-w-2xl transform overflow-hidden rounded-2xl bg-white text-left align-middle shadow-xl transition-all">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-gray-200">
                  <div className="flex items-center space-x-3">
                    <div className="flex-shrink-0">
                      <EnvelopeIcon className="h-6 w-6 text-blue-600" />
                    </div>
                    <div>
                      <Dialog.Title as="h3" className="text-lg font-medium text-gray-900">
                        Email Preview
                      </Dialog.Title>
                      <p className="text-sm text-gray-500">
                        {contact.company} • {contact.firstName} {contact.lastName}
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    className="rounded-md text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    onClick={onClose}
                  >
                    <XMarkIcon className="h-6 w-6" />
                  </button>
                </div>

                {/* Email Headers */}
                <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
                  <div className="space-y-2 text-sm">
                    <div className="flex">
                      <span className="w-16 text-gray-500 font-medium">From:</span>
                      <span className="text-gray-900">{userEmail}</span>
                    </div>
                    <div className="flex">
                      <span className="w-16 text-gray-500 font-medium">To:</span>
                      <span className="text-gray-900">{contact.email}</span>
                    </div>
                    <div className="flex">
                      <span className="w-16 text-gray-500 font-medium">Subject:</span>
                      <span className="text-gray-900 font-medium">{email.subject}</span>
                    </div>
                  </div>
                </div>

                {/* Email Body */}
                <div className="p-6">
                  <div className="bg-white border border-gray-200 rounded-lg p-4">
                    <pre className="whitespace-pre-wrap text-sm text-gray-900 font-sans leading-relaxed">
                      {email.content}
                    </pre>
                  </div>

                  {/* Attachments */}
                  {attachedFiles.length > 0 && (
                    <div className="mt-4 pt-4 border-t border-gray-200">
                      <h4 className="text-sm font-medium text-gray-900 mb-2">Attachments</h4>
                      <div className="space-y-2">
                        {attachedFiles.map((file, index) => (
                          <div key={index} className="flex items-center space-x-2 text-sm text-gray-600">
                            <div className="w-4 h-4 bg-gray-300 rounded flex items-center justify-center">
                              {file.type.startsWith('image/') ? '📷' : 
                               file.type.startsWith('video/') ? '🎥' : '📄'}
                            </div>
                            <span>{file.name}</span>
                            <span className="text-gray-400">({(file.size / 1024).toFixed(1)} KB)</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Footer */}
                <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex justify-end">
                  <button
                    type="button"
                    className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
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
