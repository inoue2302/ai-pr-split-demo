import type { CreateTodoInput, TodoResponse } from './dto/create-todo.dto.js'
import { insertTodo, findTodoByTitle } from '../infrastructure/todo.repository.js'
import { DuplicateTodoError } from './errors.js'

function normalizeTitle(title: string): string {
  return title
    .trim()
    .replace(/\u3000/g, ' ')
    .replace(/ {2,}/g, ' ')
}

export async function createTodo(input: CreateTodoInput): Promise<TodoResponse> {
  const title = normalizeTitle(input.title)

  const existing = await findTodoByTitle(title)
  if (existing) {
    throw new DuplicateTodoError(title)
  }

  return await insertTodo({ title })
}

export { DuplicateTodoError }
