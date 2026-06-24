import Link from 'next/link'

export default function Home() {
  return (
    <main className="min-h-screen bg-stone-50 flex flex-col items-center justify-center px-4">
      <div className="text-center">
        <h1 className="text-4xl font-semibold text-stone-800 mb-2">Facet</h1>
        <p className="text-stone-500 mb-10">Every piece has a story. Keep it.</p>
        <Link
          href="/items"
          className="rounded-lg bg-stone-800 text-white px-6 py-3 font-medium hover:bg-stone-700"
        >
          View your collection
        </Link>
      </div>
    </main>
  )
}
