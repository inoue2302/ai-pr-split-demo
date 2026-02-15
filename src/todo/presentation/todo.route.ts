import { Hono } from 'hono'
import { createTodoSchema } from '../application/dto/create-todo.dto.js'
import { createTodo, DuplicateTodoError } from '../application/create-todo.usecase.js'

const todoRoute = new Hono()

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

export { todoRoute }
