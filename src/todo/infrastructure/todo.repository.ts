import { prisma } from '../../lib/prisma.js'
import type { CreateTodoInput, TodoResponse } from '../application/dto/create-todo.dto.js'
import type { UpdateTodoInput } from '../application/dto/update-todo.dto.js'

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

export async function findTodoById(id: number): Promise<TodoResponse | null> {
  const todo = await prisma.todo.findUnique({
    where: { id },
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

export async function updateTodo(id: number, input: UpdateTodoInput): Promise<TodoResponse> {
  const todo = await prisma.todo.update({
    where: { id },
    data: input,
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
