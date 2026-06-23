import { describe, it, expect, vi, beforeEach } from 'vitest'
import { GET, POST } from '@/app/api/items/route'
import { NextRequest } from 'next/server'

// --- mocks ---

vi.mock('@/lib/supabase/getAuthenticatedMembership', () => ({
  getAuthenticatedMembership: vi.fn(),
}))

vi.mock('@/lib/supabase/server', () => ({
  createClient: vi.fn(),
}))

import { getAuthenticatedMembership } from '@/lib/supabase/getAuthenticatedMembership'
import { createClient } from '@/lib/supabase/server'

const mockGetAuth = vi.mocked(getAuthenticatedMembership)
const mockCreateClient = vi.mocked(createClient)

const MEMBERSHIP = { userId: 'user-1', householdId: 'hh-1', role: 'owner' as const }
const AUTH_OK = { ok: true as const, membership: MEMBERSHIP }
const AUTH_401 = { ok: false as const, status: 401 as const, message: 'Not authenticated' }

function makeSelectChain(result: { data: unknown; error: unknown }) {
  const chain: Record<string, unknown> = {}
  for (const m of ['select', 'eq', 'order', 'single']) {
    chain[m] = vi.fn().mockReturnValue(chain)
  }
  chain.order = vi.fn().mockResolvedValue(result)
  return chain
}

function makeInsertChain(result: { data: unknown; error: unknown }) {
  const chain: Record<string, unknown> = {}
  chain.insert = vi.fn().mockReturnValue(chain)
  chain.select = vi.fn().mockReturnValue(chain)
  chain.single = vi.fn().mockResolvedValue(result)
  return chain
}

function makeInsertOnlyChain(result: { error: unknown }) {
  return { insert: vi.fn().mockResolvedValue(result) }
}

function makeRequest(body: unknown) {
  return new NextRequest('http://localhost/api/items', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
}

// --- GET tests ---

describe('GET /api/items', () => {
  beforeEach(() => vi.clearAllMocks())

  it('returns 401 when not authenticated', async () => {
    mockGetAuth.mockResolvedValue(AUTH_401)
    const res = await GET()
    expect(res.status).toBe(401)
  })

  it('returns items for the authenticated household', async () => {
    mockGetAuth.mockResolvedValue(AUTH_OK)
    const items = [{ id: 'item-1', name: 'Grandma ring', category: 'ring' }]
    const chain = makeSelectChain({ data: items, error: null })
    mockCreateClient.mockResolvedValue({ from: () => chain } as never)

    const res = await GET()
    expect(res.status).toBe(200)
    const json = await res.json()
    expect(json.items).toEqual(items)
  })

  it('returns 500 when the database query fails', async () => {
    mockGetAuth.mockResolvedValue(AUTH_OK)
    const chain = makeSelectChain({ data: null, error: { message: 'db error' } })
    mockCreateClient.mockResolvedValue({ from: () => chain } as never)

    const res = await GET()
    expect(res.status).toBe(500)
  })
})

// --- POST tests ---

describe('POST /api/items', () => {
  beforeEach(() => vi.clearAllMocks())

  it('returns 401 when not authenticated', async () => {
    mockGetAuth.mockResolvedValue(AUTH_401)
    const res = await POST(makeRequest({ name: 'Ring', category: 'ring' }))
    expect(res.status).toBe(401)
  })

  it('returns 400 when name is missing', async () => {
    mockGetAuth.mockResolvedValue(AUTH_OK)
    const res = await POST(makeRequest({ category: 'ring' }))
    expect(res.status).toBe(400)
  })

  it('returns 400 when category is invalid', async () => {
    mockGetAuth.mockResolvedValue(AUTH_OK)
    const res = await POST(makeRequest({ name: 'Ring', category: 'jewelry' }))
    expect(res.status).toBe(400)
  })

  it('returns 400 when name is whitespace-only', async () => {
    mockGetAuth.mockResolvedValue(AUTH_OK)
    const res = await POST(makeRequest({ name: '   ', category: 'ring' }))
    expect(res.status).toBe(400)
  })

  it('returns 400 when an attribute is missing attribute_name', async () => {
    mockGetAuth.mockResolvedValue(AUTH_OK)
    const res = await POST(makeRequest({
      name: 'Ring',
      category: 'ring',
      attributes: [{ attribute_value: 'gold' }],
    }))
    expect(res.status).toBe(400)
  })

  it('returns 400 when an attribute has an empty attribute_value', async () => {
    mockGetAuth.mockResolvedValue(AUTH_OK)
    const res = await POST(makeRequest({
      name: 'Ring',
      category: 'ring',
      attributes: [{ attribute_name: 'metal', attribute_value: '   ' }],
    }))
    expect(res.status).toBe(400)
  })

  it('returns 400 when body is not valid JSON', async () => {
    mockGetAuth.mockResolvedValue(AUTH_OK)
    const req = new NextRequest('http://localhost/api/items', {
      method: 'POST',
      body: 'not json',
    })
    const res = await POST(req)
    expect(res.status).toBe(400)
  })

  it('creates an item and returns 201', async () => {
    mockGetAuth.mockResolvedValue(AUTH_OK)
    const newItem = { id: 'item-1', name: 'Grandma ring', category: 'ring', household_id: 'hh-1' }
    const insertChain = makeInsertChain({ data: newItem, error: null })
    mockCreateClient.mockResolvedValue({ from: () => insertChain } as never)

    const res = await POST(makeRequest({ name: 'Grandma ring', category: 'ring' }))
    expect(res.status).toBe(201)
    const json = await res.json()
    expect(json.item.id).toBe('item-1')
  })

  it('uses householdId from auth — ignores any household_id in body', async () => {
    mockGetAuth.mockResolvedValue(AUTH_OK)
    const newItem = { id: 'item-1', name: 'Ring', category: 'ring', household_id: 'hh-1' }
    const insertChain = makeInsertChain({ data: newItem, error: null })
    const mockFrom = vi.fn().mockReturnValue(insertChain)
    mockCreateClient.mockResolvedValue({ from: mockFrom } as never)

    await POST(makeRequest({ name: 'Ring', category: 'ring', household_id: 'attacker-hh' }))

    const insertCall = insertChain.insert as ReturnType<typeof vi.fn>
    expect(insertCall.mock.calls[0][0].household_id).toBe('hh-1')
  })

  it('returns 500 when item insert fails', async () => {
    mockGetAuth.mockResolvedValue(AUTH_OK)
    const insertChain = makeInsertChain({ data: null, error: { message: 'db error' } })
    mockCreateClient.mockResolvedValue({ from: () => insertChain } as never)

    const res = await POST(makeRequest({ name: 'Ring', category: 'ring' }))
    expect(res.status).toBe(500)
  })

  it('creates item with attributes when provided', async () => {
    mockGetAuth.mockResolvedValue(AUTH_OK)
    const newItem = { id: 'item-1', name: 'Ring', category: 'ring', household_id: 'hh-1' }
    const itemInsertChain = makeInsertChain({ data: newItem, error: null })
    const attrInsertChain = makeInsertOnlyChain({ error: null })
    const mockFrom = vi.fn()
      .mockReturnValueOnce(itemInsertChain)
      .mockReturnValueOnce(attrInsertChain)
    mockCreateClient.mockResolvedValue({ from: mockFrom } as never)

    const res = await POST(makeRequest({
      name: 'Ring',
      category: 'ring',
      attributes: [{ attribute_name: 'metal', attribute_value: 'gold' }],
    }))

    expect(res.status).toBe(201)
    const attrInsert = attrInsertChain.insert as ReturnType<typeof vi.fn>
    expect(attrInsert.mock.calls[0][0][0].attribute_name).toBe('metal')
    expect(attrInsert.mock.calls[0][0][0].item_id).toBe('item-1')
  })
})
