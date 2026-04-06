import { redirect } from 'next/navigation'

export default function DirectorySlugRedirect({ params }: { params: { slug: string } }) {
  redirect(`/supplier/${params.slug}`)
}
