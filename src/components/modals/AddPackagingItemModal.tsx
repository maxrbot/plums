"use client"

import { Fragment, useState, useEffect } from 'react'
import { Dialog, Transition } from '@headlessui/react'
import { XMarkIcon, PlusIcon } from '@heroicons/react/24/outline'
import { getPackagingSuggestions } from '@/config/packaging-suggestions'

interface AddPackagingItemModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: (names: string[]) => void
  type: 'package' | 'size'
  commodityName: string
}

export default function AddPackagingItemModal({
  isOpen,
  onClose,
  onSave,
  type,
  commodityName
}: AddPackagingItemModalProps) {
  const [name, setName] = useState('')
  const [collection, setCollection] = useState<string[]>([])

  useEffect(() => {
    if (!isOpen) {
      setName('')
      setCollection([])
    }
  }, [isOpen])

  const handleAddToCollection = () => {
    if (name.trim() && !collection.includes(name.trim())) {
      setCollection([...collection, name.trim()])
      setName('')
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      handleAddToCollection()
    }
  }

  const removeFromCollection = (item: string) => {
    setCollection(collection.filter(i => i !== item))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (collection.length > 0) {
      onSave(collection)
      setName('')
      setCollection([])
      onClose()
    }
  }

  const quickAdd = (example: string) => {
    if (!collection.includes(example)) {
      setCollection([...collection, example])
    }
  }

  // Get smart suggestions based on commodity
  const suggestions = getPackagingSuggestions(commodityName)
  const examples = type === 'package' 
    ? suggestions.packageTypes 
    : suggestions.sizeGrades

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
              <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all">
                <div className="flex items-center justify-between mb-4">
                  <Dialog.Title as="h3" className="text-lg font-semibold text-gray-900">
                    {type === 'package' ? '📦 Add Package Types' : '📏 Add Size Grades'}
                  </Dialog.Title>
                  <button
                    onClick={onClose}
                    className="text-gray-400 hover:text-gray-500 transition-colors"
                  >
                    <XMarkIcon className="h-5 w-5" />
                  </button>
                </div>

                <div className="mb-4">
                  <p className="text-sm text-gray-600">
                    For <span className="font-semibold text-gray-900 capitalize">{commodityName.replace('-', ' ')}</span>
                  </p>
                </div>

                <form onSubmit={handleSubmit}>
                  {/* Input with Add Button */}
                  <div className="mb-4">
                    <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                      {type === 'package' ? 'Package Type Name' : 'Size Grade Name'}
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        id="name"
                        autoFocus
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        onKeyPress={handleKeyPress}
                        placeholder={type === 'package' ? 'e.g., 25lb Carton' : 'e.g., Large'}
                        className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-base"
                      />
                      <button
                        type="button"
                        onClick={handleAddToCollection}
                        disabled={!name.trim()}
                        className="px-4 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white rounded-lg transition-colors"
                      >
                        <PlusIcon className="h-5 w-5" />
                      </button>
                    </div>
                  </div>

                  {/* Collection Display */}
                  {collection.length > 0 && (
                    <div className="mb-4 p-3 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg border border-blue-100">
                      <p className="text-xs font-medium text-gray-700 mb-2">
                        Added ({collection.length}):
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {collection.map((item) => (
                          <div
                            key={item}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white border border-blue-200 rounded-lg text-sm text-gray-900"
                          >
                            <span>{item}</span>
                            <button
                              type="button"
                              onClick={() => removeFromCollection(item)}
                              className="text-gray-400 hover:text-red-600 transition-colors"
                            >
                              <XMarkIcon className="h-4 w-4" />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Examples */}
                  <div className="mb-6">
                    <p className="text-xs font-medium text-gray-500 mb-2">Quick add:</p>
                    <div className="flex flex-wrap gap-2">
                      {examples.map((example) => (
                        <button
                          key={example}
                          type="button"
                          onClick={() => quickAdd(example)}
                          disabled={collection.includes(example)}
                          className="px-3 py-1 text-xs font-medium text-blue-600 bg-blue-50 hover:bg-blue-100 disabled:opacity-50 disabled:cursor-not-allowed rounded-full transition-colors"
                        >
                          {example}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-3">
                    <button
                      type="button"
                      onClick={onClose}
                      className="flex-1 px-4 py-2.5 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={collection.length === 0}
                      className="flex-1 px-4 py-2.5 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed rounded-lg transition-colors"
                    >
                      Add {collection.length > 0 ? `${collection.length} ` : ''}{type === 'package' ? 'Package' : 'Size'}{collection.length !== 1 ? 's' : ''}
                    </button>
                  </div>
                </form>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  )
}

