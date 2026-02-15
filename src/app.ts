import { Hono } from 'hono'
import { todoApp } from './routes/todos.js'

const app = new Hono()

app.route('/api/todos', todoApp)

export { app }
