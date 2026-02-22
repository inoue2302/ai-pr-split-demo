import { z } from 'zod'

export const updateTodoSchema = z.object({
  title: z.string().trim().min(1, 'タイトルは必須です').max(100, 'タイトルは100文字以内で入力してください').optional(),
  completed: z.boolean().optional(),
}).refine(data => Object.keys(data).length > 0, {
  message: '更新フィールドを1つ以上指定してください',
})

export type UpdateTodoInput = {
  title?: string
  completed?: boolean
}
