/**
 * 坐席管理相关类型定义
 */

/** 圆桌上的宾客 */
export interface TableGuest {
  id: string
  name: string // 姓名（用于编辑和识别）
  groomTitle?: string // 男方称呼（如：表哥、同事）
  brideTitle?: string // 女方称呼（如：舅舅、闺蜜）
  remark?: string // 备注
}

/** 圆桌信息 */
export interface RoundTable {
  id: string
  name: string // 桌号/名称，如 "主桌"、"1号桌"
  capacity: number // 容纳人数
  guests: TableGuest[] // 宾客列表
  remark?: string // 圆桌备注
  color?: string // 自定义颜色（CSS渐变类或颜色值）
  position: {
    x: number // X坐标（百分比 0-100）
    y: number // Y坐标（百分比 0-100）
  }
}

/** 坐席布局数据 */
export interface SeatingLayout {
  tables: RoundTable[]
  lastModified?: string
}

/** API 响应类型 */
export interface SeatingApiResponse<T = unknown> {
  success: boolean
  data?: T
  message?: string
  error?: string
}
