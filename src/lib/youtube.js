import { supabase } from './supabase'

const EDGE_FUNCTION_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/lingua-youtube`

export async function callYouTubeEdge(action, params = {}) {
  const { data: { session } } = await supabase.auth.getSession()
  if (!session) throw new Error('Not authenticated')

  const res = await fetch(EDGE_FUNCTION_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${session.access_token}`,
    },
    body: JSON.stringify({ action, ...params }),
  })

  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(err.error || `YouTube API error: ${res.status}`)
  }

  return res.json()
}

export async function fetchPlaylists(language) {
  const { data, error } = await supabase
    .from('lingua_playlists')
    .select('*')
    .eq('language', language)
    .eq('is_active', true)
    .order('sort_order')

  if (error) throw error
  return data || []
}

export async function fetchPlaylistItems(playlistId) {
  const { data, error } = await supabase
    .from('lingua_playlist_items')
    .select('*')
    .eq('playlist_id', playlistId)
    .eq('is_active', true)
    .order('position')

  if (error) throw error
  return data || []
}

export async function searchYouTubeVideos(query, language, maxResults = 10) {
  const data = await callYouTubeEdge('search', { query, language, maxResults })
  return data
}

export async function syncPlaylistsFromYouTube(language) {
  const data = await callYouTubeEdge('sync_playlists', { language })
  return data
}

export function parseYouTubeDuration(duration) {
  if (!duration) return 0
  const match = duration.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/)
  if (!match) return 0
  const h = parseInt(match[1] || '0')
  const m = parseInt(match[2] || '0')
  const s = parseInt(match[3] || '0')
  return h * 3600 + m * 60 + s
}
