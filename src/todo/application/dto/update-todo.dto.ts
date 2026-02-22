import { z } from 'zod'

export const updateTodoSchema = z.object({
  title: z.string().min(1, 'タイトルは必須です').max(100, 'タイトルは100文字以内で入力してください').optional(),
  completed: z.boolean().optional(),
})

export type UpdateTodoInput = z.infer<typeof updateTodoSchema>
