import type { TodoResponse } from './dto/create-todo.dto.js'
import { findTodoById } from '../infrastructure/todo.repository.js'
import { TodoNotFoundError } from './errors.js'

export async function getTodo(id: number): Promise<TodoResponse> {
  const todo = await findTodoById(id)
  if (!todo) {
    throw new TodoNotFoundError(id)
  }
  return todo
}
