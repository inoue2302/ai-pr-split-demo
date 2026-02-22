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

describe('PUT /api/todos/:id', () => {
  beforeEach(async () => {
    await cleanDatabase()
  })

  afterAll(async () => {
    await cleanDatabase()
    await prisma.$disconnect()
  })

  it('タイトルを更新できる', async () => {
    const todo = await createTodo('元のタイトル')

    const res = await app.request(`/api/todos/${todo.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title: '新しいタイトル' }),
    })

    expect(res.status).toBe(200)
    const body = await res.json()
    expect(body.title).toBe('新しいタイトル')
    expect(body.id).toBe(todo.id)
  })

  it('completedを更新できる', async () => {
    const todo = await createTodo('完了テスト')

    const res = await app.request(`/api/todos/${todo.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ completed: true }),
    })

    expect(res.status).toBe(200)
    const body = await res.json()
    expect(body.completed).toBe(true)
  })

  it('存在しないIDは404', async () => {
    const res = await app.request('/api/todos/9999', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title: 'テスト' }),
    })

    expect(res.status).toBe(404)
    const body = await res.json()
    expect(body.message).toContain('Todoが見つかりません')
  })

  it('タイトルの前後の空白がトリムされる', async () => {
    const todo = await createTodo('トリム元')

    const res = await app.request(`/api/todos/${todo.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title: '  トリム後  ' }),
    })

    expect(res.status).toBe(200)
    const body = await res.json()
    expect(body.title).toBe('トリム後')
  })

  it('他のTodoと同じタイトルに更新すると重複エラー', async () => {
    await createTodo('既存Todo')
    const todo = await createTodo('変更対象')

    const res = await app.request(`/api/todos/${todo.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title: '既存Todo' }),
    })

    expect(res.status).toBe(400)
    const body = await res.json()
    expect(body.message).toContain('同じタイトルのTodoが既に存在します')
  })

  it('自分自身と同じタイトルはエラーにならない', async () => {
    const todo = await createTodo('同じタイトル')

    const res = await app.request(`/api/todos/${todo.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title: '同じタイトル' }),
    })

    expect(res.status).toBe(200)
  })

  it('不正なIDは400', async () => {
    const res = await app.request('/api/todos/abc', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title: 'テスト' }),
    })

    expect(res.status).toBe(400)
    const body = await res.json()
    expect(body.message).toContain('IDは数値で指定してください')
  })
})
