import { createClient } from '@/lib/supabase/server'

export type AuthenticatedMembership = {
  userId: string
  householdId: string
  role: 'owner' | 'member'
}

type AuthResult =
  | { ok: true; membership: AuthenticatedMembership }
  | { ok: false; status: 401 | 403 | 500; message: string }

export async function getAuthenticatedMembership(): Promise<AuthResult> {
  const supabase = await createClient()

  const { data: { user }, error: userError } = await supabase.auth.getUser()

  if (userError || !user) {
    return { ok: false, status: 401, message: 'Not authenticated' }
  }

  const { data: membership, error: membershipError } = await supabase
    .from('household_members')
    .select('household_id, role')
    .eq('user_id', user.id)
    .limit(1)
    .maybeSingle()

  if (membershipError) {
    console.error('[getAuthenticatedMembership] membership lookup failed:', membershipError.message)
    return { ok: false, status: 500, message: 'Failed to load membership' }
  }

  if (!membership) {
    return { ok: false, status: 403, message: 'No household membership found' }
  }

  return {
    ok: true,
    membership: {
      userId: user.id,
      householdId: membership.household_id,
      role: membership.role as 'owner' | 'member',
    },
  }
}
