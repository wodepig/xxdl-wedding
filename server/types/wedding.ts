/**
 * 婚礼项目类型定义（Server端）
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
