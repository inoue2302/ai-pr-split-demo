import { findTodoById, deleteTodo as deleteTodoFromDb } from '../infrastructure/todo.repository.js'
import { TodoNotFoundError } from './errors.js'

export async function deleteTodo(id: number): Promise<void> {
  const todo = await findTodoById(id)
  if (!todo) {
    throw new TodoNotFoundError(id)
  }
  await deleteTodoFromDb(id)
}
