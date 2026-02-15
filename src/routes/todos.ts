import { Hono } from 'hono'
import { createTodoSchema } from '../dto/create-todo.dto.js'
import type { TodoResponse } from '../types/todo.js'

const todoApp = new Hono()

// TODO作成
todoApp.post('/', async (c) => {
  const body = await c.req.json()
  const parsed = createTodoSchema.safeParse(body)

  if (!parsed.success) {
    return c.json({ errors: parsed.error.flatten().fieldErrors }, 400)
  }

  // モックレスポンス（後続PRでサービス層・リポジトリ層に置き換え）
  const now = new Date().toISOString()
  const todo: TodoResponse = {
    id: 1,
    title: parsed.data.title,
    completed: false,
    createdAt: now,
    updatedAt: now,
  }

  return c.json(todo, 201)
})

export { todoApp }
