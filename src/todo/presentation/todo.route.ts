import { Hono } from 'hono'
import { createTodoSchema } from '../application/dto/create-todo.dto.js'
import { updateTodoSchema } from '../application/dto/update-todo.dto.js'
import { createTodo, DuplicateTodoError } from '../application/create-todo.usecase.js'
import { updateTodo, TodoNotFoundError, DuplicateTodoError as UpdateDuplicateTodoError } from '../application/update-todo.usecase.js'

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

todoRoute.put('/:id', async (c) => {
  const id = Number(c.req.param('id'))
  if (Number.isNaN(id)) {
    return c.json({ message: 'IDは数値で指定してください' }, 400)
  }

  const body = await c.req.json()
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
    if (e instanceof UpdateDuplicateTodoError) {
      return c.json({ message: e.message }, 400)
    }
    throw e
  }
})

export { todoRoute }
