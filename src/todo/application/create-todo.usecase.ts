import type { CreateTodoInput, TodoResponse } from './dto/create-todo.dto.js'

export function createTodo(input: CreateTodoInput): TodoResponse {
  // モック（後続PRでインフラ層のリポジトリに置き換え）
  const now = new Date().toISOString()
  return {
    id: 1,
    title: input.title,
    completed: false,
    createdAt: now,
    updatedAt: now,
  }
}
