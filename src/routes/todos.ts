import { Hono } from 'hono'

type Todo = {
  id: string
  title: string
  completed: boolean
}

const todos: Todo[] = []
let nextId = 1

const todoApp = new Hono()

// 一覧取得
todoApp.get('/', (c) => {
  return c.json(todos)
})

// 単体取得
todoApp.get('/:id', (c) => {
  const todo = todos.find((t) => t.id === c.req.param('id'))
  if (!todo) {
    return c.json({ message: 'Todo not found' }, 404)
  }
  return c.json(todo)
})

// 作成
todoApp.post('/', async (c) => {
  const body = await c.req.json<{ title: string }>()
  const todo: Todo = {
    id: String(nextId++),
    title: body.title,
    completed: false,
  }
  todos.push(todo)
  return c.json(todo, 201)
})

// 更新
todoApp.put('/:id', async (c) => {
  const index = todos.findIndex((t) => t.id === c.req.param('id'))
  if (index === -1) {
    return c.json({ message: 'Todo not found' }, 404)
  }
  const body = await c.req.json<{ title?: string; completed?: boolean }>()
  todos[index] = { ...todos[index], ...body }
  return c.json(todos[index])
})

// 削除
todoApp.delete('/:id', (c) => {
  const index = todos.findIndex((t) => t.id === c.req.param('id'))
  if (index === -1) {
    return c.json({ message: 'Todo not found' }, 404)
  }
  const deleted = todos.splice(index, 1)[0]
  return c.json(deleted)
})

export { todoApp }
