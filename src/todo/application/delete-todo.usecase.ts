import { deleteTodo as deleteTodoFromDb } from '../infrastructure/todo.repository.js'

export async function deleteTodo(id: number): Promise<void> {
  await deleteTodoFromDb(id)
}
