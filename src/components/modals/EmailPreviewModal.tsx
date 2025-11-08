"use client"

import { Fragment, useState, useEffect } from 'react'
import { Dialog, Transition } from '@headlessui/react'
import { XMarkIcon, EnvelopeIcon, PencilIcon, CheckIcon } from '@heroicons/react/24/outline'
import { Contact } from '../../types'

interface EmailPreviewModalProps {
  isOpen: boolean
  onClose: () => void
  contact: Contact
  priceSheetTitle?: string
  priceSheetUrl?: string
  productsCount?: number
  customMessage?: string
  userName?: string
  userEmail?: string
  onSave?: (contactId: string, subject: string, message: string) => void
  savedCustomContent?: { subject?: string; content?: string } // Pre-saved custom content
  isPreview?: boolean // If true, show note about personalized URLs
}

// Generate HTML email preview matching the real email template
const generateEmailHTML = (
  contact: Contact, 
  subject: string,
  message: string,
  priceSheetUrl?: string,
  productsCount?: number,
  userName?: string,
  userEmail?: string
) => {
  const firstName = contact.firstName || 'there'
  const url = priceSheetUrl || '#'
  const count = productsCount || 0
  const fromName = userName || 'Your Team'
  const fromEmail = userEmail || 'sales@acrelist.com'
  
  return `<div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #ffffff; border: 1px solid #e5e7eb; border-radius: 8px; overflow: hidden;">
<div style="background: linear-gradient(135deg, #10b981 0%, #059669 100%); padding: 40px 30px; text-align: center;">
<h1 style="color: #ffffff; margin: 0 0 8px 0; font-size: 28px; font-weight: 700;">${subject}</h1>
<p style="color: rgba(255, 255, 255, 0.9); margin: 0; font-size: 16px;">${count} products available</p>
</div>
<div style="padding: 40px 30px;">
<p style="color: #111827; font-size: 16px; line-height: 1.6; margin: 0 0 20px 0;">Hi ${firstName},</p>
<p style="color: #374151; font-size: 16px; line-height: 1.6; margin: 0 0 20px 0; white-space: pre-wrap;">${message}</p>
<p style="color: #374151; font-size: 16px; line-height: 1.6; margin: 0 0 30px 0;">Click the button below to view the full price sheet with current availability and pricing:</p>
<div style="text-align: center; margin: 40px 0;">
<span style="display: inline-block; background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: #ffffff; text-decoration: none; padding: 16px 40px; border-radius: 8px; font-weight: 600; font-size: 16px; box-shadow: 0 4px 6px rgba(16, 185, 129, 0.3); cursor: default;">View Price Sheet →</span>
</div>
<p style="color: #6b7280; font-size: 14px; line-height: 1.6; margin: 30px 0 0 0;">If you have any questions or would like to place an order, please don't hesitate to reach out.</p>
</div>
<div style="background-color: #f9fafb; padding: 30px; border-top: 1px solid #e5e7eb;">
<p style="margin: 0 0 10px 0; color: #374151; font-size: 14px; font-weight: 600;">${fromName}</p>
<p style="margin: 0 0 5px 0; color: #6b7280; font-size: 13px;">${fromEmail}</p>
<div style="margin-top: 20px; padding-top: 20px; border-top: 1px solid #e5e7eb;">
<p style="margin: 0; color: #9ca3af; font-size: 11px; text-align: center;">This pricing is intended for ${contact.firstName} ${contact.lastName}.<br>Questions? Simply reply to this email.</p>
</div>
</div>
</div>`
}

export default function EmailPreviewModal({
  isOpen,
  onClose,
  contact,
  priceSheetTitle,
  priceSheetUrl,
  productsCount,
  customMessage,
  userName,
  userEmail,
  onSave,
  savedCustomContent,
  isPreview = false
}: EmailPreviewModalProps) {
  // Editable state - initialize with saved content if it exists
  const [isEditing, setIsEditing] = useState(false)
  const [editedSubject, setEditedSubject] = useState(
    savedCustomContent?.subject || priceSheetTitle || 'Price Sheet'
  )
  const [editedMessage, setEditedMessage] = useState(
    savedCustomContent?.content || customMessage || "I wanted to share our latest pricing with you. Please take a look at what we have available."
  )
  const [hasChanges, setHasChanges] = useState(false)
  const [showSavedMessage, setShowSavedMessage] = useState(false)

  const originalSubject = savedCustomContent?.subject || priceSheetTitle || 'Price Sheet'
  const originalMessage = savedCustomContent?.content || customMessage || "I wanted to share our latest pricing with you. Please take a look at what we have available."

  // Reset when modal opens/closes or contact changes
  useEffect(() => {
    if (isOpen) {
      setEditedSubject(originalSubject)
      setEditedMessage(originalMessage)
      setHasChanges(false)
      setIsEditing(false)
      setShowSavedMessage(false)
    }
  }, [isOpen, contact.id, originalSubject, originalMessage])

  const handleSubjectChange = (value: string) => {
    setEditedSubject(value)
    setHasChanges(value !== originalSubject || editedMessage !== originalMessage)
  }

  const handleMessageChange = (value: string) => {
    setEditedMessage(value)
    setHasChanges(editedSubject !== originalSubject || value !== originalMessage)
  }

  const handleSave = () => {
    if (onSave && hasChanges) {
      onSave(contact.id || (contact as any)._id, editedSubject, editedMessage)
      setHasChanges(false)
      setIsEditing(false)
      setShowSavedMessage(true)
      // Hide message after 3 seconds
      setTimeout(() => setShowSavedMessage(false), 3000)
    }
  }

  const handleClose = () => {
    if (hasChanges) {
      if (confirm('You have unsaved changes. Are you sure you want to close?')) {
        onClose()
      }
    } else {
      onClose()
    }
  }

  const htmlPreview = generateEmailHTML(
    contact,
    priceSheetTitle || 'Price Sheet', // Always use the price sheet title for the header
    editedMessage,
    priceSheetUrl,
    productsCount,
    userName,
    userEmail
  )

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={handleClose}>
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
              <Dialog.Panel className="w-full max-w-3xl transform overflow-hidden rounded-2xl bg-white text-left align-middle shadow-xl transition-all">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-gray-200">
                  <div className="flex items-center space-x-3">
                    <div className="flex-shrink-0">
                      <EnvelopeIcon className="h-6 w-6 text-blue-600" />
                    </div>
                    <div>
                      <Dialog.Title as="h3" className="text-lg font-medium text-gray-900">
                        Email Preview {isEditing && <span className="text-blue-600">(Editing)</span>}
                        {showSavedMessage && <span className="text-green-600 ml-2">✓ Saved!</span>}
                      </Dialog.Title>
                      <p className="text-sm text-gray-500">
                        {contact.company} • {contact.firstName} {contact.lastName}
                        {savedCustomContent && !isEditing && (
                          <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800">
                            Custom Version
                          </span>
                        )}
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    className="text-gray-400 hover:text-gray-500"
                    onClick={handleClose}
                  >
                    <XMarkIcon className="h-6 w-6" />
                  </button>
                </div>

                {/* Content */}
                <div className="p-6 max-h-[70vh] overflow-y-auto">
                  {isEditing ? (
                    <div className="space-y-4">
                      {/* Subject Line Editor */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Subject Line
                        </label>
                        <input
                          type="text"
                          value={editedSubject}
                          onChange={(e) => handleSubjectChange(e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>

                      {/* Message Editor */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Message (editable section only)
                        </label>
                        <textarea
                          value={editedMessage}
                          onChange={(e) => handleMessageChange(e.target.value)}
                          rows={6}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 font-mono text-sm"
                        />
                        <p className="mt-1 text-xs text-gray-500">
                          Only the message content is editable. The email header, button, and footer will remain unchanged.
                        </p>
                      </div>

                      {/* Preview of edited email */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Preview
                        </label>
                        <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 overflow-auto">
                          <div dangerouslySetInnerHTML={{ __html: htmlPreview }} />
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {/* Subject Line Display */}
                      <div className="bg-white border border-gray-200 rounded-lg p-4">
                        <label className="block text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">
                          Subject Line
                        </label>
                        <p className="text-sm font-medium text-gray-900">{editedSubject}</p>
                      </div>
                      
                      {/* Email Preview */}
                      <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
                        <div dangerouslySetInnerHTML={{ __html: htmlPreview }} />
                      </div>
                    </div>
                  )}
                </div>

                {/* Footer */}
                <div className="bg-gray-50 px-6 py-4 flex items-center justify-between border-t border-gray-200">
                  <div>
                    {hasChanges && (
                      <p className="text-sm text-amber-600">
                        ⚠️ You have unsaved changes
                      </p>
                    )}
                  </div>
                  <div className="flex items-center space-x-3">
                    {isEditing && (
                      <>
                        <button
                          type="button"
                          onClick={() => {
                            setEditedSubject(originalSubject)
                            setEditedMessage(originalMessage)
                            setIsEditing(false)
                            setHasChanges(false)
                          }}
                          className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
                        >
                          Cancel
                        </button>
                        <button
                          type="button"
                          onClick={handleSave}
                          disabled={!hasChanges}
                          className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <CheckIcon className="h-4 w-4 mr-1" />
                          Save Changes
                        </button>
                      </>
                    )}
                    {!isEditing && (
                      <>
                        {onSave && (
                          <button
                            type="button"
                            onClick={() => setIsEditing(true)}
                            className="inline-flex items-center px-4 py-2 text-sm font-medium text-blue-600 bg-white border border-blue-300 rounded-md hover:bg-blue-50"
                          >
                            <PencilIcon className="h-4 w-4 mr-1" />
                            Edit Email
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={onClose}
                          className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
                        >
                          Close Preview
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  )
}
