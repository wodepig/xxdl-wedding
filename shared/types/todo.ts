/**
 * 待办事项相关类型定义
 */

/** 待办事项优先级 */
export type TodoPriority = 'high' | 'medium' | 'low'

/** 单个待办事项 */
export interface TodoItem {
  id: string
  title: string
  detail?: string
  completed: boolean
  priority: TodoPriority
  createdAt: string
  completedAt?: string
}

/** 某一天的待办列表 */
export interface TodoDay {
  date: string
  items: TodoItem[]
}

/** 待办事项数据 */
export interface TodoData {
  days: TodoDay[]
  lastModified?: string
}

/** API 响应类型 */
export interface TodoApiResponse<T = unknown> {
  success: boolean
  data?: T
  message?: string
  error?: string
}
