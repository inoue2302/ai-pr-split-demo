import { prisma } from '../lib/prisma.js'

export async function cleanDatabase() {
  await prisma.todo.deleteMany()
}
