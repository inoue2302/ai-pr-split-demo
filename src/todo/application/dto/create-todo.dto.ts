import { z } from 'zod'

export const createTodoSchema = z.object({
  title: z.string().min(1, 'タイトルは必須です').max(100, 'タイトルは100文字以内で入力してください'),
})

export type CreateTodoInput = z.infer<typeof createTodoSchema>

export type TodoResponse = {
  id: number
  title: string
  completed: boolean
  createdAt: string
  updatedAt: string
}
