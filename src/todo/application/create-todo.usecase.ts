import type { CreateTodoInput, TodoResponse } from './dto/create-todo.dto.js'
import { insertTodo } from '../infrastructure/todo.repository.js'

export async function createTodo(input: CreateTodoInput): Promise<TodoResponse> {
  return await insertTodo(input)
}
