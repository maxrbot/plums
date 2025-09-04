"use client"

import { useState, useRef } from 'react'
import { Dialog } from '@headlessui/react'
import { 
  XMarkIcon, 
  DocumentArrowUpIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  ArrowDownTrayIcon
} from '@heroicons/react/24/outline'

interface CropImportModalProps {
  isOpen: boolean
  onClose: () => void
  onImport: (data: any[]) => Promise<void>
}

interface ImportPreview {
  valid: any[]
  invalid: any[]
  duplicates: any[]
}

export default function CropImportModal({ isOpen, onClose, onImport }: CropImportModalProps) {
  const [file, setFile] = useState<File | null>(null)
  const [csvData, setCsvData] = useState<any[]>([])
  const [preview, setPreview] = useState<ImportPreview | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)
  const [isImporting, setIsImporting] = useState(false)
  const [step, setStep] = useState<'upload' | 'preview' | 'complete'>('upload')
  const [error, setError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileSelect = (selectedFile: File) => {
    if (!selectedFile.name.toLowerCase().endsWith('.csv')) {
      setError('Please select a CSV file')
      return
    }

    setFile(selectedFile)
    setError(null)
    processFile(selectedFile)
  }

  const processFile = async (file: File) => {
    setIsProcessing(true)
    
    try {
      const text = await file.text()
      const lines = text.split('\n').filter(line => line.trim())
      
      if (lines.length < 2) {
        throw new Error('CSV file must contain at least a header row and one data row')
      }

      const headers = lines[0].split(',').map(h => h.trim().toLowerCase())
      const requiredHeaders = ['commodity', 'variety', 'category']
      const optionalHeaders = ['shipping_point_name', 'facility_type', 'availability_start_month', 'availability_end_month']
      const missingHeaders = requiredHeaders.filter(h => !headers.includes(h))
      
      if (missingHeaders.length > 0) {
        throw new Error(`Missing required columns: ${missingHeaders.join(', ')}`)
      }

      const data = lines.slice(1).map((line, index) => {
        const values = line.split(',').map(v => v.trim())
        const row: any = { _rowIndex: index + 2 }
        
        headers.forEach((header, i) => {
          row[header] = values[i] || ''
        })
        
        return row
      })

      setCsvData(data)
      validateData(data)
      setStep('preview')
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to process file')
    } finally {
      setIsProcessing(false)
    }
  }

  const validateData = (data: any[]) => {
    const valid: any[] = []
    const invalid: any[] = []
    const duplicates: any[] = []
    const seen = new Set<string>()

    data.forEach(row => {
      const errors: string[] = []
      
      // Required field validation
      if (!row.commodity) errors.push('Commodity is required')
      if (!row.variety) errors.push('Variety is required')
      if (!row.category) errors.push('Category is required')
      
      // Duplicate check
      const key = `${row.commodity}-${row.variety}-${row.category}`.toLowerCase()
      if (seen.has(key)) {
        duplicates.push({ ...row, errors: ['Duplicate entry'] })
        return
      }
      seen.add(key)
      
      if (errors.length > 0) {
        invalid.push({ ...row, errors })
      } else {
        valid.push(row)
      }
    })

    setPreview({ valid, invalid, duplicates })
  }

  const handleImport = async () => {
    if (!preview || preview.valid.length === 0) return
    
    setIsImporting(true)
    try {
      await onImport(preview.valid)
      setStep('complete')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Import failed')
    } finally {
      setIsImporting(false)
    }
  }

  const downloadTemplate = () => {
    const template = `commodity,variety,category,is_organic,shipping_point_name,facility_type,availability_start_month,availability_end_month,min_price,max_price,price_unit,min_order,order_unit,shipping_zones,lead_time_days,notes
strawberry,Albion,berries,true,Fresno Distribution Center,distribution_center,3,8,4.00,5.50,lb,50,case,"Central CA,Northern CA",2,Premium organic berries
tomato,Roma,vine-crops,false,Salinas Cooler Facility,cooler,4,10,2.50,3.25,lb,25,case,"Central CA,Coastal CA",1,Classic paste tomato
lettuce,Romaine,leafy-greens,true,Imperial Valley Warehouse,warehouse,1,12,1.75,2.50,head,100,case,"Southern CA,Southwest",3,Year-round organic lettuce`

    const blob = new Blob([template], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'crop-import-template.csv'
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const resetModal = () => {
    setFile(null)
    setCsvData([])
    setPreview(null)
    setStep('upload')
    setError(null)
    setIsProcessing(false)
    setIsImporting(false)
  }

  const handleClose = () => {
    resetModal()
    onClose()
  }

  return (
    <Dialog open={isOpen} onClose={handleClose} className="relative z-50">
      <div className="fixed inset-0 bg-black/25" />
      
      <div className="fixed inset-0 flex items-center justify-center p-4">
        <Dialog.Panel className="mx-auto max-w-2xl w-full bg-white rounded-lg shadow-xl">
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <Dialog.Title className="text-lg font-medium text-gray-900">
              {step === 'upload' && 'Import Crops from CSV'}
              {step === 'preview' && 'Review Import Data'}
              {step === 'complete' && 'Import Complete'}
            </Dialog.Title>
            <button
              onClick={handleClose}
              className="text-gray-400 hover:text-gray-500"
            >
              <XMarkIcon className="h-6 w-6" />
            </button>
          </div>

          <div className="p-6">
            {step === 'upload' && (
              <div className="space-y-6">
                <div className="text-center">
                  <DocumentArrowUpIcon className="mx-auto h-12 w-12 text-gray-400" />
                  <h3 className="mt-2 text-sm font-medium text-gray-900">Upload CSV File</h3>
                  <p className="mt-1 text-sm text-gray-500">
                    Import your crop data from a CSV file
                  </p>
                </div>

                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6">
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".csv"
                    onChange={(e) => e.target.files?.[0] && handleFileSelect(e.target.files[0])}
                    className="hidden"
                  />
                  
                  <div className="text-center">
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700"
                      disabled={isProcessing}
                    >
                      <DocumentArrowUpIcon className="h-4 w-4 mr-2" />
                      {isProcessing ? 'Processing...' : 'Choose CSV File'}
                    </button>
                    
                    <p className="mt-2 text-xs text-gray-500">
                      Or drag and drop your CSV file here
                    </p>
                  </div>
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
                  <div className="flex items-start">
                    <div className="flex-shrink-0">
                      <ArrowDownTrayIcon className="h-5 w-5 text-blue-400" />
                    </div>
                    <div className="ml-3">
                      <h3 className="text-sm font-medium text-blue-800">
                        Need a template?
                      </h3>
                      <div className="mt-2 text-sm text-blue-700">
                        <p>Download our CSV template with sample data to get started.</p>
                        <button
                          onClick={downloadTemplate}
                          className="mt-2 font-medium text-blue-600 hover:text-blue-500"
                        >
                          Download Template →
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                {error && (
                  <div className="bg-red-50 border border-red-200 rounded-md p-4">
                    <div className="flex">
                      <ExclamationTriangleIcon className="h-5 w-5 text-red-400" />
                      <div className="ml-3">
                        <h3 className="text-sm font-medium text-red-800">Error</h3>
                        <p className="mt-1 text-sm text-red-700">{error}</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {step === 'preview' && preview && (
              <div className="space-y-6">
                <div className="grid grid-cols-3 gap-4">
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-center">
                    <div className="text-2xl font-bold text-green-600">{preview.valid.length}</div>
                    <div className="text-sm text-green-700">Valid Records</div>
                  </div>
                  <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-center">
                    <div className="text-2xl font-bold text-red-600">{preview.invalid.length}</div>
                    <div className="text-sm text-red-700">Invalid Records</div>
                  </div>
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-center">
                    <div className="text-2xl font-bold text-yellow-600">{preview.duplicates.length}</div>
                    <div className="text-sm text-yellow-700">Duplicates</div>
                  </div>
                </div>

                {preview.valid.length > 0 && (
                  <div>
                    <h4 className="text-sm font-medium text-gray-900 mb-2">
                      Valid Records (First 5)
                    </h4>
                    <div className="bg-gray-50 rounded-lg p-3 max-h-40 overflow-y-auto">
                      {preview.valid.slice(0, 5).map((row, index) => (
                        <div key={index} className="text-xs text-gray-600 mb-1">
                          {row.commodity} - {row.variety} ({row.category})
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {preview.invalid.length > 0 && (
                  <div>
                    <h4 className="text-sm font-medium text-red-700 mb-2">
                      Invalid Records
                    </h4>
                    <div className="bg-red-50 rounded-lg p-3 max-h-40 overflow-y-auto">
                      {preview.invalid.map((row, index) => (
                        <div key={index} className="text-xs text-red-600 mb-2">
                          Row {row._rowIndex}: {row.errors.join(', ')}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="flex justify-between">
                  <button
                    onClick={() => setStep('upload')}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
                  >
                    Back
                  </button>
                  <button
                    onClick={handleImport}
                    disabled={preview.valid.length === 0 || isImporting}
                    className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isImporting ? 'Importing...' : `Import ${preview.valid.length} Records`}
                  </button>
                </div>
              </div>
            )}

            {step === 'complete' && (
              <div className="text-center space-y-4">
                <CheckCircleIcon className="mx-auto h-12 w-12 text-green-500" />
                <h3 className="text-lg font-medium text-gray-900">Import Successful!</h3>
                <p className="text-sm text-gray-500">
                  Your crops have been imported and are now available in your catalog.
                </p>
                <button
                  onClick={handleClose}
                  className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700"
                >
                  Done
                </button>
              </div>
            )}
          </div>
        </Dialog.Panel>
      </div>
    </Dialog>
  )
}
