import type { UpdateTodoInput } from './dto/update-todo.dto.js'
import type { TodoResponse } from './dto/create-todo.dto.js'
import { findTodoById, findTodoByTitle, updateTodo as updateTodoRepo } from '../infrastructure/todo.repository.js'

function normalizeTitle(title: string): string {
  return title
    .trim()
    .replace(/\u3000/g, ' ')
    .replace(/ {2,}/g, ' ')
}

export async function updateTodo(id: number, input: UpdateTodoInput): Promise<TodoResponse> {
  const existing = await findTodoById(id)
  if (!existing) {
    throw new TodoNotFoundError(id)
  }

  const data: UpdateTodoInput = {}

  if (input.title !== undefined) {
    const title = normalizeTitle(input.title)
    const duplicate = await findTodoByTitle(title)
    if (duplicate && duplicate.id !== id) {
      throw new DuplicateTodoError(title)
    }
    data.title = title
  }

  if (input.completed !== undefined) {
    data.completed = input.completed
  }

  return await updateTodoRepo(id, data)
}

export class TodoNotFoundError extends Error {
  constructor(id: number) {
    super(`Todoが見つかりません: ${id}`)
    this.name = 'TodoNotFoundError'
  }
}

export class DuplicateTodoError extends Error {
  constructor(title: string) {
    super(`同じタイトルのTodoが既に存在します: ${title}`)
    this.name = 'DuplicateTodoError'
  }
}
