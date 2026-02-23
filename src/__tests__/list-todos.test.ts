import { describe, it, expect, beforeEach, afterAll } from 'vitest'
import { app } from '../app.js'
import { prisma } from '../lib/prisma.js'
import { cleanDatabase } from './setup.js'

describe('GET /api/todos', () => {
  beforeEach(async () => {
    await cleanDatabase()
  })

  afterAll(async () => {
    await cleanDatabase()
    await prisma.$disconnect()
  })

  it('Todo一覧を取得できる', async () => {
    await app.request('/api/todos', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title: 'Todo1' }),
    })
    await app.request('/api/todos', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title: 'Todo2' }),
    })

    const res = await app.request('/api/todos')

    expect(res.status).toBe(200)
    const body = await res.json()
    expect(body).toHaveLength(2)
  })

  it('Todoが0件の場合は空配列を返す', async () => {
    const res = await app.request('/api/todos')

    expect(res.status).toBe(200)
    const body = await res.json()
    expect(body).toHaveLength(0)
  })

  it('completedフィルタで絞り込める', async () => {
    const createRes = await app.request('/api/todos', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title: '完了済み' }),
    })
    const created = await createRes.json()
    await app.request(`/api/todos/${created.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ completed: true }),
    })
    await app.request('/api/todos', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title: '未完了' }),
    })

    const res = await app.request('/api/todos?completed=true')

    expect(res.status).toBe(200)
    const body = await res.json()
    expect(body).toHaveLength(1)
    expect(body[0].title).toBe('完了済み')
  })
})
