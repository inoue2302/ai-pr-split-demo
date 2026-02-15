import { describe, it, expect, beforeEach, afterAll } from 'vitest'
import { app } from '../app.js'
import { prisma } from '../lib/prisma.js'
import { cleanDatabase } from './setup.js'

describe('POST /api/todos', () => {
  beforeEach(async () => {
    await cleanDatabase()
  })

  afterAll(async () => {
    await cleanDatabase()
    await prisma.$disconnect()
  })

  it('Todoを作成できる', async () => {
    const res = await app.request('/api/todos', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title: 'テストTodo' }),
    })

    expect(res.status).toBe(201)
    const body = await res.json()
    expect(body.title).toBe('テストTodo')
    expect(body.id).toBeTypeOf('number')
    expect(body.completed).toBe(false)
  })

  it('タイトルが空の場合はバリデーションエラー', async () => {
    const res = await app.request('/api/todos', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title: '' }),
    })

    expect(res.status).toBe(400)
    const body = await res.json()
    expect(body.errors.title).toBeDefined()
  })

  it('タイトルの前後の空白がトリムされる', async () => {
    const res = await app.request('/api/todos', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title: '  トリムテスト  ' }),
    })

    expect(res.status).toBe(201)
    const body = await res.json()
    expect(body.title).toBe('トリムテスト')
  })

  it('全角スペースが半角に変換される', async () => {
    const res = await app.request('/api/todos', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title: 'テスト\u3000Todo' }),
    })

    expect(res.status).toBe(201)
    const body = await res.json()
    expect(body.title).toBe('テスト Todo')
  })

  it('同じタイトルのTodoは重複エラー', async () => {
    await app.request('/api/todos', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title: '重複テスト' }),
    })

    const res = await app.request('/api/todos', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title: '重複テスト' }),
    })

    expect(res.status).toBe(400)
    const body = await res.json()
    expect(body.message).toContain('同じタイトルのTodoが既に存在します')
  })
})
