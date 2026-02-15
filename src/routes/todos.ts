import { Hono } from 'hono'
import { createTodoSchema } from '../dto/create-todo.dto.js'
import { createTodo } from '../usecase/create-todo.usecase.js'

const todoApp = new Hono()

// TODO作成
todoApp.post('/', async (c) => {
  const body = await c.req.json()
  const parsed = createTodoSchema.safeParse(body)

  if (!parsed.success) {
    return c.json({ errors: parsed.error.flatten().fieldErrors }, 400)
  }

  const todo = createTodo(parsed.data)
  return c.json(todo, 201)
})

export { todoApp }
