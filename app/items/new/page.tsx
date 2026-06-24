'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

const CATEGORIES = ['ring', 'necklace', 'bracelet', 'earrings', 'brooch', 'watch', 'other'] as const
type Category = typeof CATEGORIES[number]

const SUGGESTED_ATTRIBUTES = ['metal', 'gemstone', 'carat_weight', 'setting_style', 'hallmark', 'ring_size', 'chain_length']

type Attribute = { attribute_name: string; attribute_value: string }

export default function NewItemPage() {
  const router = useRouter()

  const [name, setName] = useState('')
  const [category, setCategory] = useState<Category | ''>('')
  const [givenBy, setGivenBy] = useState('')
  const [headline, setHeadline] = useState('')
  const [story, setStory] = useState('')
  const [acquiredEra, setAcquiredEra] = useState('')
  const [attributes, setAttributes] = useState<Attribute[]>([])
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)

  function addAttribute(name = '') {
    setAttributes(prev => [...prev, { attribute_name: name, attribute_value: '' }])
  }

  function updateAttribute(index: number, field: keyof Attribute, value: string) {
    setAttributes(prev => prev.map((a, i) => i === index ? { ...a, [field]: value } : a))
  }

  function removeAttribute(index: number) {
    setAttributes(prev => prev.filter((_, i) => i !== index))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!category) {
      setError('Please select a category.')
      return
    }
    setSaving(true)
    setError('')

    const res = await fetch('/api/items', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name,
        category,
        given_by: givenBy || null,
        headline: headline || null,
        story: story || null,
        acquired_era: acquiredEra || null,
        attributes: attributes.filter(a => a.attribute_name.trim() && a.attribute_value.trim()),
      }),
    })

    if (!res.ok) {
      const json = await res.json().catch(() => ({}))
      setError(json.error ?? 'Something went wrong. Please try again.')
      setSaving(false)
      return
    }

    router.push('/items')
  }

  return (
    <main className="min-h-screen bg-stone-50 px-4 py-8 max-w-lg mx-auto">
      <h1 className="text-2xl font-semibold text-stone-800 mb-6">Add a piece</h1>

      <form onSubmit={handleSubmit} className="space-y-6">

        {/* Name */}
        <div>
          <label className="block text-sm font-medium text-stone-700 mb-1">
            Name <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={name}
            onChange={e => setName(e.target.value)}
            placeholder="e.g. Grandma's sapphire ring"
            required
            className="w-full rounded-lg border border-stone-300 px-3 py-2 text-stone-800 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-stone-400"
          />
        </div>

        {/* Category */}
        <div>
          <label className="block text-sm font-medium text-stone-700 mb-1">
            Category <span className="text-red-500">*</span>
          </label>
          <select
            value={category}
            onChange={e => setCategory(e.target.value as Category)}
            required
            className="w-full rounded-lg border border-stone-300 px-3 py-2 text-stone-800 focus:outline-none focus:ring-2 focus:ring-stone-400 bg-white"
          >
            <option value="">Select a category</option>
            {CATEGORIES.map(c => (
              <option key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</option>
            ))}
          </select>
        </div>

        {/* Given by */}
        <div>
          <label className="block text-sm font-medium text-stone-700 mb-1">Given by</label>
          <input
            type="text"
            value={givenBy}
            onChange={e => setGivenBy(e.target.value)}
            placeholder="e.g. My grandmother, on my wedding day"
            className="w-full rounded-lg border border-stone-300 px-3 py-2 text-stone-800 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-stone-400"
          />
        </div>

        {/* Headline */}
        <div>
          <label className="block text-sm font-medium text-stone-700 mb-1">One-line story</label>
          <input
            type="text"
            value={headline}
            onChange={e => setHeadline(e.target.value)}
            placeholder="e.g. Worn at every family wedding since 1962"
            className="w-full rounded-lg border border-stone-300 px-3 py-2 text-stone-800 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-stone-400"
          />
        </div>

        {/* Story */}
        <div>
          <label className="block text-sm font-medium text-stone-700 mb-1">Full story</label>
          <textarea
            value={story}
            onChange={e => setStory(e.target.value)}
            placeholder="The longer story — for whoever inherits this piece."
            rows={4}
            className="w-full rounded-lg border border-stone-300 px-3 py-2 text-stone-800 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-stone-400 resize-none"
          />
        </div>

        {/* Acquired era */}
        <div>
          <label className="block text-sm font-medium text-stone-700 mb-1">When</label>
          <input
            type="text"
            value={acquiredEra}
            onChange={e => setAcquiredEra(e.target.value)}
            placeholder="e.g. 1970s, my 30th birthday, inherited 2019"
            className="w-full rounded-lg border border-stone-300 px-3 py-2 text-stone-800 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-stone-400"
          />
        </div>

        {/* Attributes */}
        <div>
          <label className="block text-sm font-medium text-stone-700 mb-2">Details</label>

          {attributes.length > 0 && (
            <div className="space-y-2 mb-3">
              {attributes.map((attr, i) => (
                <div key={i} className="flex gap-2 items-center">
                  <input
                    type="text"
                    value={attr.attribute_name}
                    onChange={e => updateAttribute(i, 'attribute_name', e.target.value)}
                    placeholder="Detail (e.g. metal)"
                    className="flex-1 rounded-lg border border-stone-300 px-3 py-2 text-sm text-stone-800 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-stone-400"
                  />
                  <input
                    type="text"
                    value={attr.attribute_value}
                    onChange={e => updateAttribute(i, 'attribute_value', e.target.value)}
                    placeholder="Value (e.g. white gold)"
                    className="flex-1 rounded-lg border border-stone-300 px-3 py-2 text-sm text-stone-800 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-stone-400"
                  />
                  <button
                    type="button"
                    onClick={() => removeAttribute(i)}
                    className="text-stone-400 hover:text-red-500 text-lg leading-none px-1"
                    aria-label="Remove"
                  >×</button>
                </div>
              ))}
            </div>
          )}

          <div className="flex flex-wrap gap-2 mb-2">
            {SUGGESTED_ATTRIBUTES.map(s => (
              <button
                key={s}
                type="button"
                onClick={() => addAttribute(s)}
                className="text-xs rounded-full border border-stone-300 px-3 py-1 text-stone-600 hover:bg-stone-100"
              >
                + {s.replace('_', ' ')}
              </button>
            ))}
          </div>

          <button
            type="button"
            onClick={() => addAttribute()}
            className="text-sm text-stone-500 hover:text-stone-700 underline"
          >
            + Add custom detail
          </button>
        </div>

        {error && (
          <p className="text-sm text-red-600">{error}</p>
        )}

        <button
          type="submit"
          disabled={saving}
          className="w-full rounded-lg bg-stone-800 text-white py-3 font-medium hover:bg-stone-700 disabled:opacity-50"
        >
          {saving ? 'Saving…' : 'Save piece'}
        </button>
      </form>
    </main>
  )
}
