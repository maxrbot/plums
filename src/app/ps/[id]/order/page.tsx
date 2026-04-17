"use client"

import { useEffect } from 'react'
import { useParams, useSearchParams, useRouter } from 'next/navigation'

export default function OrderPageRedirect() {
  const params = useParams()
  const searchParams = useSearchParams()
  const router = useRouter()

  useEffect(() => {
    const id = params?.id as string
    const qs = searchParams?.toString() ? `?${searchParams.toString()}` : ''
    router.replace(`/ps/${id}${qs}`)
  }, [params, searchParams, router])

  return null
}
