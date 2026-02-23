import { describe, it, expect, beforeEach, afterAll } from 'vitest'
import { app } from '../app.js'
import { prisma } from '../lib/prisma.js'
import { cleanDatabase } from './setup.js'

describe('DELETE /api/todos/:id', () => {
  beforeEach(async () => {
    await cleanDatabase()
  })

  afterAll(async () => {
    await cleanDatabase()
    await prisma.$disconnect()
  })

  it('Todoを削除できる', async () => {
    const createRes = await app.request('/api/todos', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title: '削除テスト' }),
    })
    const created = await createRes.json()

    const res = await app.request(`/api/todos/${created.id}`, {
      method: 'DELETE',
    })

    expect(res.status).toBe(204)
  })

  it('削除後にDBからレコードが消えている', async () => {
    const createRes = await app.request('/api/todos', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title: '削除確認テスト' }),
    })
    const created = await createRes.json()

    await app.request(`/api/todos/${created.id}`, {
      method: 'DELETE',
    })

    const record = await prisma.todo.findUnique({ where: { id: created.id } })
    expect(record).toBeNull()
  })

  it('存在しないIDで404を返す', async () => {
    const res = await app.request('/api/todos/99999', {
      method: 'DELETE',
    })

    expect(res.status).toBe(404)
    const body = await res.json()
    expect(body.message).toContain('Todoが見つかりません')
  })

  it('不正なIDで400を返す', async () => {
    const res = await app.request('/api/todos/-1', {
      method: 'DELETE',
    })

    expect(res.status).toBe(400)
    const body = await res.json()
    expect(body.message).toContain('IDは正の整数で指定してください')
  })
})
