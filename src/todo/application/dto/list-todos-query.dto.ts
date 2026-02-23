import { z } from 'zod'

export const listTodosQuerySchema = z.object({
  completed: z
    .enum(['true', 'false'])
    .transform((value) => value === 'true')
    .optional(),
}).strict()

export type ListTodosQuery = z.infer<typeof listTodosQuerySchema>
