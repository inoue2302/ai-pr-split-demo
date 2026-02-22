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

  it('completedをtrueからfalseに戻せる', async () => {
    const todo = await createTodo('戻しテスト')

    await app.request(`/api/todos/${todo.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ completed: true }),
    })

    const res = await app.request(`/api/todos/${todo.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ completed: false }),
    })

    expect(res.status).toBe(200)
    const body = await res.json()
    expect(body.completed).toBe(false)
  })

  it('titleとcompletedを同時に更新できる', async () => {
    const todo = await createTodo('同時更新')

    const res = await app.request(`/api/todos/${todo.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title: '更新後', completed: true }),
    })

    expect(res.status).toBe(200)
    const body = await res.json()
    expect(body.title).toBe('更新後')
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

  it('全角スペースが半角に変換される', async () => {
    const todo = await createTodo('変換元')

    const res = await app.request(`/api/todos/${todo.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title: 'テスト\u3000Todo' }),
    })

    expect(res.status).toBe(200)
    const body = await res.json()
    expect(body.title).toBe('テスト Todo')
  })

  it('連続スペースが1つに正規化される', async () => {
    const todo = await createTodo('正規化元')

    const res = await app.request(`/api/todos/${todo.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title: 'テスト   Todo' }),
    })

    expect(res.status).toBe(200)
    const body = await res.json()
    expect(body.title).toBe('テスト Todo')
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
    const body = await res.json()
    expect(body.title).toBe('同じタイトル')
  })

  it('不正なIDは400', async () => {
    const res = await app.request('/api/todos/abc', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title: 'テスト' }),
    })

    expect(res.status).toBe(400)
    const body = await res.json()
    expect(body.message).toContain('IDは正の整数で指定してください')
  })

  it('小数のIDは400', async () => {
    const res = await app.request('/api/todos/1.5', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title: 'テスト' }),
    })

    expect(res.status).toBe(400)
  })

  it('負数のIDは400', async () => {
    const res = await app.request('/api/todos/-1', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title: 'テスト' }),
    })

    expect(res.status).toBe(400)
  })

  it('空オブジェクトでの更新はバリデーションエラー', async () => {
    const todo = await createTodo('空更新テスト')

    const res = await app.request(`/api/todos/${todo.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({}),
    })

    expect(res.status).toBe(400)
  })

  it('101文字超のタイトルはバリデーションエラー', async () => {
    const todo = await createTodo('長文テスト')
    const longTitle = 'あ'.repeat(101)

    const res = await app.request(`/api/todos/${todo.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title: longTitle }),
    })

    expect(res.status).toBe(400)
  })

  it('不正なJSONは400', async () => {
    const res = await app.request('/api/todos/1', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: 'invalid json',
    })

    expect(res.status).toBe(400)
    const body = await res.json()
    expect(body.message).toContain('不正なJSON形式')
  })

  it('空白のみのタイトルはバリデーションエラー', async () => {
    const todo = await createTodo('空白テスト')

    const res = await app.request(`/api/todos/${todo.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title: '   ' }),
    })

    expect(res.status).toBe(400)
  })
})
