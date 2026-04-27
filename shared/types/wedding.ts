/**
 * 婚礼项目共享类型定义
 * 用于前后端共享数据结构
 */

// ==================== 婚礼时间表相关类型 ====================

/** 单个时间点安排 */
export interface TimePoint {
  id: string
  time: string // 格式: HH:mm
  event: string // 事项名称
  note?: string // 备注说明
}

/** 单日婚礼安排 */
export interface WeddingDaySchedule {
  date: string // 格式: YYYY-MM-DD
  timePoints: TimePoint[]
}

/** 完整婚礼时间表数据 */
export interface WeddingSchedule {
  weddingDate?: string // 婚礼主日期
  schedules: WeddingDaySchedule[]
}

// ==================== 通用响应类型 ====================

/** API 通用响应结构 */
export interface ApiResponse<T = unknown> {
  success: boolean
  data?: T
  message?: string
  error?: string
}

// ==================== 坐席管理相关类型（预留） ====================

/** 宾客信息 */
export interface Guest {
  id: string
  name: string
  phone?: string
  tableId?: string
  relation?: string // 关系：男方亲友/女方亲友/共同朋友
  attendCount: number // 出席人数
  status: 'confirmed' | 'pending' | 'declined' // 确认状态
  remark?: string
}

/** 餐桌信息 */
export interface Table {
  id: string
  name: string // 桌号/名称
  capacity: number // 容量
  guests: string[] // 宾客ID列表
  remark?: string
}

/** 坐席安排数据 */
export interface SeatingArrangement {
  tables: Table[]
  guests: Guest[]
}
