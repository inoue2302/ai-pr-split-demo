import { Hono } from 'hono'
import { createTodoSchema } from '../application/dto/create-todo.dto.js'
import { updateTodoSchema } from '../application/dto/update-todo.dto.js'
import { listTodosQuerySchema } from '../application/dto/list-todos-query.dto.js'
import { createTodo } from '../application/create-todo.usecase.js'
import { updateTodo } from '../application/update-todo.usecase.js'
import { DuplicateTodoError, TodoNotFoundError } from '../application/errors.js'
import type { TodoResponse } from '../application/dto/create-todo.dto.js'

const todoRoute = new Hono()

todoRoute.get('/', async (c) => {
  const parsed = listTodosQuerySchema.safeParse(c.req.query())

  if (!parsed.success) {
    return c.json({ errors: parsed.error.flatten().fieldErrors }, 400)
  }

  // TODO: Replace with usecase
  const mockTodos: TodoResponse[] = [
    { id: 1, title: 'サンプルTodo', completed: false, createdAt: '2025-01-01T00:00:00.000Z', updatedAt: '2025-01-01T00:00:00.000Z' },
  ]
  const filtered = parsed.data.completed !== undefined
    ? mockTodos.filter((t) => t.completed === parsed.data.completed)
    : mockTodos
  return c.json(filtered)
})

todoRoute.get('/:id', async (c) => {
  const idStr = c.req.param('id')
  const id = parseInt(idStr, 10)
  if (isNaN(id) || id <= 0 || String(id) !== idStr) {
    return c.json({ message: 'IDは正の整数で指定してください' }, 400)
  }

  // TODO: Replace with usecase
  const MOCK_NOT_FOUND_ID = 999
  if (id === MOCK_NOT_FOUND_ID) {
    return c.json({ message: `Todoが見つかりません: ${id}` }, 404)
  }
  const mockTodo: TodoResponse = { id, title: 'サンプルTodo', completed: false, createdAt: '2025-01-01T00:00:00.000Z', updatedAt: '2025-01-01T00:00:00.000Z' }
  return c.json(mockTodo)
})

todoRoute.post('/', async (c) => {
  const body = await c.req.json()
  const parsed = createTodoSchema.safeParse(body)

  if (!parsed.success) {
    return c.json({ errors: parsed.error.flatten().fieldErrors }, 400)
  }

  try {
    const todo = await createTodo(parsed.data)
    return c.json(todo, 201)
  } catch (e) {
    if (e instanceof DuplicateTodoError) {
      return c.json({ message: e.message }, 400)
    }
    throw e
  }
})

todoRoute.put('/:id', async (c) => {
  const id = Number(c.req.param('id'))
  if (!Number.isInteger(id) || id <= 0) {
    return c.json({ message: 'IDは正の整数で指定してください' }, 400)
  }

  let body: unknown
  try {
    body = await c.req.json()
  } catch {
    return c.json({ message: 'リクエストボディが不正なJSON形式です' }, 400)
  }

  const parsed = updateTodoSchema.safeParse(body)

  if (!parsed.success) {
    return c.json({ errors: parsed.error.flatten().fieldErrors }, 400)
  }

  try {
    const todo = await updateTodo(id, parsed.data)
    return c.json(todo)
  } catch (e) {
    if (e instanceof TodoNotFoundError) {
      return c.json({ message: e.message }, 404)
    }
    if (e instanceof DuplicateTodoError) {
      return c.json({ message: e.message }, 400)
    }
    throw e
  }
})

todoRoute.delete('/:id', async (c) => {
  const idStr = c.req.param('id')
  const id = parseInt(idStr, 10)
  if (isNaN(id) || id <= 0 || String(id) !== idStr) {
    return c.json({ message: 'IDは正の整数で指定してください' }, 400)
  }

  // TODO: Replace with usecase
  return c.body(null, 204)
})

export { todoRoute }
