/**
 * 人员管理相关类型定义
 */

/** 人员信息 */
export interface Person {
  id: string
  name: string // 姓名
  groomTitle?: string // 男方称呼（如：表哥、同事）
  brideTitle?: string // 女方称呼（如：舅舅、闺蜜）
  remark?: string // 备注
  assigned?: boolean // 是否已分配
  tableId?: string // 分配的圆桌ID
}

/** 人员列表数据 */
export interface PersonList {
  persons: Person[]
  lastModified?: string
}

/** API 响应类型 */
export interface PersonApiResponse<T = unknown> {
  success: boolean
  data?: T
  message?: string
  error?: string
}
