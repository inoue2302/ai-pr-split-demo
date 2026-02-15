import { Hono } from 'hono'
import { createTodoSchema } from '../dto/create-todo.dto.js'
import { createTodo } from '../usecase/create-todo.usecase.js'

const todoRoute = new Hono()

todoRoute.post('/', async (c) => {
  const body = await c.req.json()
  const parsed = createTodoSchema.safeParse(body)

  if (!parsed.success) {
    return c.json({ errors: parsed.error.flatten().fieldErrors }, 400)
  }

  const todo = createTodo(parsed.data)
  return c.json(todo, 201)
})

export { todoRoute }
