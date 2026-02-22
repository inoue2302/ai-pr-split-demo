import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    fileParallelism: false,
    env: {
      DATABASE_URL: 'postgresql://postgres:postgres@localhost:5433/todo_app_test?schema=public',
    },
  },
})
