import { describe, it, expect, beforeEach, afterAll } from 'vitest'
import { app } from '../app.js'
import { prisma } from '../lib/prisma.js'
import { cleanDatabase } from './setup.js'

describe('GET /api/todos/:id', () => {
  beforeEach(async () => {
    await cleanDatabase()
  })

  afterAll(async () => {
    await cleanDatabase()
    await prisma.$disconnect()
  })

  it('IDを指定してTodoを取得できる', async () => {
    const createRes = await app.request('/api/todos', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title: '取得テスト' }),
    })
    const created = await createRes.json()

    const res = await app.request(`/api/todos/${created.id}`)

    expect(res.status).toBe(200)
    const body = await res.json()
    expect(body.id).toBe(created.id)
    expect(body.title).toBe('取得テスト')
  })

  it('存在しないIDで404を返す', async () => {
    const res = await app.request('/api/todos/99999')

    expect(res.status).toBe(404)
    const body = await res.json()
    expect(body.message).toContain('Todoが見つかりません')
  })

  it('不正なIDで400を返す', async () => {
    const res = await app.request('/api/todos/-1')

    expect(res.status).toBe(400)
    const body = await res.json()
    expect(body.message).toContain('IDは正の整数で指定してください')
  })
})
