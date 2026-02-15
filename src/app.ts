import { Hono } from 'hono'
import { todoRoute } from './todo/presentation/todo.route.js'

const app = new Hono()

app.get('/', (c) => {
  return c.text('Hello World')
})

app.route('/api/todos', todoRoute)

export { app }
