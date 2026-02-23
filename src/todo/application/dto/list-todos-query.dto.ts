import { z } from 'zod'

export const listTodosQuerySchema = z.object({
  completed: z
    .enum(['true', 'false'])
    .transform((v) => v === 'true')
    .optional(),
})

export type ListTodosQuery = z.infer<typeof listTodosQuerySchema>
