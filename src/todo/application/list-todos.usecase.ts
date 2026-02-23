import type { TodoResponse } from './dto/create-todo.dto.js'
import { findAllTodos } from '../infrastructure/todo.repository.js'

export async function listTodos(filter?: { completed?: boolean }): Promise<TodoResponse[]> {
  return await findAllTodos(filter)
}
