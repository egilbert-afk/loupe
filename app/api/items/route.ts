import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getAuthenticatedMembership } from '@/lib/supabase/getAuthenticatedMembership'

const VALID_CATEGORIES = ['ring', 'necklace', 'bracelet', 'earrings', 'brooch', 'watch', 'other'] as const
type Category = typeof VALID_CATEGORIES[number]

export async function GET() {
  const auth = await getAuthenticatedMembership()
  if (!auth.ok) {
    return NextResponse.json({ error: auth.message }, { status: auth.status })
  }

  const supabase = await createClient()
  const { data: items, error } = await supabase
    .from('items')
    .select('*')
    .eq('household_id', auth.membership.householdId)
    .eq('is_archived', false)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('[GET /api/items] query failed:', error.message)
    return NextResponse.json({ error: 'Failed to load items' }, { status: 500 })
  }

  return NextResponse.json({ items })
}

export async function POST(request: NextRequest) {
  const auth = await getAuthenticatedMembership()
  if (!auth.ok) {
    return NextResponse.json({ error: auth.message }, { status: auth.status })
  }

  let body: unknown
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  if (
    typeof body !== 'object' ||
    body === null ||
    typeof (body as Record<string, unknown>).name !== 'string' ||
    !(body as Record<string, unknown>).name ||
    !VALID_CATEGORIES.includes((body as Record<string, unknown>).category as Category)
  ) {
    return NextResponse.json(
      { error: 'name (string) and category (ring|necklace|bracelet|earrings|brooch|watch|other) are required' },
      { status: 400 }
    )
  }

  const {
    name,
    category,
    given_by = null,
    headline = null,
    story = null,
    acquired_era = null,
    attributes = [],
  } = body as {
    name: string
    category: Category
    given_by?: string | null
    headline?: string | null
    story?: string | null
    acquired_era?: string | null
    attributes?: { attribute_name: string; attribute_value: string; order_index?: number }[]
  }

  const supabase = await createClient()

  const { data: item, error: itemError } = await supabase
    .from('items')
    .insert({
      household_id: auth.membership.householdId,
      created_by: auth.membership.userId,
      name,
      category,
      given_by,
      headline,
      story,
      acquired_era,
    })
    .select()
    .single()

  if (itemError || !item) {
    console.error('[POST /api/items] insert failed:', itemError?.message)
    return NextResponse.json({ error: 'Failed to create item' }, { status: 500 })
  }

  if (Array.isArray(attributes) && attributes.length > 0) {
    const { error: attrError } = await supabase.from('item_attributes').insert(
      attributes.map((a, i) => ({
        item_id: item.id,
        attribute_name: a.attribute_name,
        attribute_value: a.attribute_value,
        order_index: a.order_index ?? i,
      }))
    )

    if (attrError) {
      console.error('[POST /api/items] attribute insert failed:', attrError.message)
      // Item was created — log but don't fail the whole request
    }
  }

  return NextResponse.json({ item }, { status: 201 })
}
