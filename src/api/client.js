import { ConvexHttpClient } from 'convex/browser'
import { api } from '../../convex/_generated/api'

const CONVEX_URL = import.meta.env.VITE_CONVEX_URL

export const convexHttp = CONVEX_URL ? new ConvexHttpClient(CONVEX_URL) : null

let memoryToken = null

export function setAuthToken(token) {
  memoryToken = token || null
}

export function getToken() {
  if (memoryToken) return memoryToken
  try {
    const raw = localStorage.getItem('stayhub-auth')
    if (!raw) return null
    return JSON.parse(raw)?.state?.token || null
  } catch {
    return null
  }
}

function wrapError(error) {
  const data = error?.data
  const raw =
    (typeof data === 'string' ? data : data?.message) ||
    error?.message ||
    'Request failed'
  const message = String(raw).replace(/^\[CONVEX[^\]]*\]\s*(\[Request ID:[^\]]*\]\s*)?/i, '').replace(/^Uncaught ConvexError:\s*/i, '').trim() || 'Request failed'
  const next = new Error(message)
  next.status = (typeof data === 'object' && data?.status) || (message.includes('Sign in') || message.includes('Session') ? 401 : 400)
  next.data = data
  return next
}

function client() {
  if (!convexHttp) {
    throw new Error('VITE_CONVEX_URL is not set. Add your Convex deployment URL to frontend/.env')
  }
  return convexHttp
}

export async function convexQuery(fn, args = {}) {
  try {
    const token = getToken()
    return await client().query(fn, token ? { token, ...args } : { ...args })
  } catch (error) {
    throw wrapError(error)
  }
}

export async function convexMutation(fn, args = {}) {
  try {
    const token = getToken()
    return await client().mutation(fn, token ? { token, ...args } : { ...args })
  } catch (error) {
    throw wrapError(error)
  }
}

export { api }
