import { prisma } from '../../lib/prisma.js'
import type { CreateTodoInput, TodoResponse } from '../application/dto/create-todo.dto.js'

export async function insertTodo(input: CreateTodoInput): Promise<TodoResponse> {
  const todo = await prisma.todo.create({
    data: {
      title: input.title,
    },
  })

  return {
    id: todo.id,
    title: todo.title,
    completed: todo.completed,
    createdAt: todo.createdAt.toISOString(),
    updatedAt: todo.updatedAt.toISOString(),
  }
}

export async function findTodoByTitle(title: string): Promise<TodoResponse | null> {
  const todo = await prisma.todo.findFirst({
    where: { title },
  })

  if (!todo) return null

  return {
    id: todo.id,
    title: todo.title,
    completed: todo.completed,
    createdAt: todo.createdAt.toISOString(),
    updatedAt: todo.updatedAt.toISOString(),
  }
}
