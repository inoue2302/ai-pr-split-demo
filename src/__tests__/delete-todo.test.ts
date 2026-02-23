import { describe, it, expect, beforeEach, afterAll } from 'vitest'
import { app } from '../app.js'
import { prisma } from '../lib/prisma.js'
import { cleanDatabase } from './setup.js'

async function createTodo(title: string) {
  const res = await app.request('/api/todos', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ title }),
  })
  return res.json()
}

describe('DELETE /api/todos/:id', () => {
  beforeEach(async () => {
    await cleanDatabase()
  })

  afterAll(async () => {
    await cleanDatabase()
    await prisma.$disconnect()
  })

  it('Todoを削除できる', async () => {
    const todo = await createTodo('削除テスト')

    const res = await app.request(`/api/todos/${todo.id}`, {
      method: 'DELETE',
    })

    expect(res.status).toBe(204)
  })

  it('削除後にDBからレコードが消えている', async () => {
    const todo = await createTodo('削除確認テスト')

    const res = await app.request(`/api/todos/${todo.id}`, {
      method: 'DELETE',
    })

    expect(res.status).toBe(204)
    const record = await prisma.todo.findUnique({ where: { id: todo.id } })
    expect(record).toBeNull()
  })

  it('2回目のDELETEで404を返す', async () => {
    const todo = await createTodo('べき等性テスト')

    await app.request(`/api/todos/${todo.id}`, {
      method: 'DELETE',
    })

    const res = await app.request(`/api/todos/${todo.id}`, {
      method: 'DELETE',
    })

    expect(res.status).toBe(404)
    const body = await res.json()
    expect(body.message).toContain('Todoが見つかりません')
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

  it('文字列IDで400を返す', async () => {
    const res = await app.request('/api/todos/abc', {
      method: 'DELETE',
    })

    expect(res.status).toBe(400)
    const body = await res.json()
    expect(body.message).toContain('IDは正の整数で指定してください')
  })

  it('小数IDで400を返す', async () => {
    const res = await app.request('/api/todos/1.5', {
      method: 'DELETE',
    })

    expect(res.status).toBe(400)
    const body = await res.json()
    expect(body.message).toContain('IDは正の整数で指定してください')
  })
})
