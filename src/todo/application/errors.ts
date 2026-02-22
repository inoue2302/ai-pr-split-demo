export class DuplicateTodoError extends Error {
  constructor(title: string) {
    super(`同じタイトルのTodoが既に存在します: ${title}`)
    this.name = 'DuplicateTodoError'
  }
}

export class TodoNotFoundError extends Error {
  constructor(id: number) {
    super(`Todoが見つかりません: ${id}`)
    this.name = 'TodoNotFoundError'
  }
}
