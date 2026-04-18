import { supabase } from './supabaseClient'

export async function ensureOnboardingRow(tableName, userId) {
  const { data: existing, error: existingError } = await supabase
    .from(tableName)
    .select('id')
    .eq('user_id', userId)
    .maybeSingle()

  if (existingError) {
    throw existingError
  }

  if (existing?.id) {
    return existing.id
  }

  const { data: inserted, error: insertError } = await supabase
    .from(tableName)
    .upsert(
      {
        user_id: userId
      },
      { onConflict: 'user_id' }
    )
    .select('id')
    .single()

  if (insertError) {
    throw insertError
  }

  return inserted.id
}