import type { CreateTodoInput } from '../dto/create-todo.dto.js'
import type { TodoResponse } from '../types/todo.js'

export function createTodo(input: CreateTodoInput): TodoResponse {
  // モック（後続PRでリポジトリ層に置き換え）
  const now = new Date().toISOString()
  return {
    id: 1,
    title: input.title,
    completed: false,
    createdAt: now,
    updatedAt: now,
  }
}
