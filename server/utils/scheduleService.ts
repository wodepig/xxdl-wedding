import { readOssJson, writeOssJson, getFeatureUrl, createOssSuccessResponse, createOssErrorResponse } from './ossStorage'
import type { WeddingSchedule, WeddingDaySchedule, TimePoint } from '../types/wedding'
import type { ApiResponse } from './fileStorage'

// 导出响应创建函数
export { createOssSuccessResponse, createOssErrorResponse }
export type { ApiResponse }

/**
 * 获取时间表数据
 * @param customUrl 自定义 OSS URL
 * @returns 时间表数据
 */
export async function getScheduleData(customUrl?: string): Promise<WeddingSchedule> {
  const url = getFeatureUrl('schedule', customUrl)

  if (!url) {
    throw new Error('未配置存储地址')
  }

  const data = await readOssJson<WeddingSchedule>(url)

  if (!data) {
    return { schedules: [] }
  }

  return data
}

/**
 * 保存时间表数据
 * @param data 时间表数据
 * @param customUrl 自定义 OSS URL
 * @returns 是否保存成功
 */
export async function saveScheduleData(data: WeddingSchedule, customUrl?: string): Promise<boolean> {
  const url = getFeatureUrl('schedule', customUrl)

  if (!url) {
    throw new Error('未配置存储地址')
  }

  return await writeOssJson(url, data)
}

/**
 * 添加新日期
 * @param date 日期字符串 YYYY-MM-DD
 * @param customUrl 自定义 OSS URL
 * @returns 更新后的时间表数据
 */
export async function addScheduleDate(date: string, customUrl?: string): Promise<WeddingSchedule> {
  const data = await getScheduleData(customUrl)

  // 检查日期是否已存在
  const exists = data.schedules.some((s: WeddingDaySchedule) => s.date === date)
  if (exists) {
    throw new Error('该日期已存在')
  }

  // 添加新日期
  data.schedules.push({
    date,
    timePoints: []
  })

  // 按日期排序
  data.schedules.sort((a: WeddingDaySchedule, b: WeddingDaySchedule) => a.date.localeCompare(b.date))

  const success = await saveScheduleData(data, customUrl)
  if (!success) {
    throw new Error('保存失败')
  }

  return data
}

/**
 * 删除日期
 * @param date 日期字符串 YYYY-MM-DD
 * @param customUrl 自定义 OSS URL
 * @returns 更新后的时间表数据
 */
export async function deleteScheduleDate(date: string, customUrl?: string): Promise<WeddingSchedule> {
  const data = await getScheduleData(customUrl)

  const index = data.schedules.findIndex((s: WeddingDaySchedule) => s.date === date)
  if (index === -1) {
    throw new Error('日期不存在')
  }

  data.schedules.splice(index, 1)

  const success = await saveScheduleData(data, customUrl)
  if (!success) {
    throw new Error('保存失败')
  }

  return data
}

/**
 * 添加时间点
 * @param date 日期字符串 YYYY-MM-DD
 * @param timePoint 时间点数据
 * @param customUrl 自定义 OSS URL
 * @returns 更新后的时间表数据
 */
export async function addTimePoint(
  date: string,
  timePoint: Omit<TimePoint, 'id'>,
  customUrl?: string
): Promise<WeddingSchedule> {
  const data = await getScheduleData(customUrl)

  const schedule = data.schedules.find((s: WeddingDaySchedule) => s.date === date)
  if (!schedule) {
    throw new Error('日期不存在')
  }

  // 生成唯一 ID
  const id = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`

  // 添加时间点
  schedule.timePoints.push({
    ...timePoint,
    id
  })

  // 按时间排序
  schedule.timePoints.sort((a: TimePoint, b: TimePoint) => a.time.localeCompare(b.time))

  const success = await saveScheduleData(data, customUrl)
  if (!success) {
    throw new Error('保存失败')
  }

  return data
}

/**
 * 更新时间点
 * @param date 日期字符串 YYYY-MM-DD
 * @param timePointId 时间点 ID
 * @param updates 更新的数据
 * @param customUrl 自定义 OSS URL
 * @returns 更新后的时间表数据
 */
export async function updateTimePoint(
  date: string,
  timePointId: string,
  updates: Partial<TimePoint>,
  customUrl?: string
): Promise<WeddingSchedule> {
  const data = await getScheduleData(customUrl)

  const schedule = data.schedules.find((s: WeddingDaySchedule) => s.date === date)
  if (!schedule) {
    throw new Error('日期不存在')
  }

  const timePoint = schedule.timePoints.find((tp: TimePoint) => tp.id === timePointId)
  if (!timePoint) {
    throw new Error('时间点不存在')
  }

  // 更新时间点
  Object.assign(timePoint, updates)

  // 按时间排序（如果时间被修改）
  if (updates.time) {
    schedule.timePoints.sort((a: TimePoint, b: TimePoint) => a.time.localeCompare(b.time))
  }

  const success = await saveScheduleData(data, customUrl)
  if (!success) {
    throw new Error('保存失败')
  }

  return data
}

/**
 * 删除时间点
 * @param date 日期字符串 YYYY-MM-DD
 * @param timePointId 时间点 ID
 * @param customUrl 自定义 OSS URL
 * @returns 更新后的时间表数据
 */
export async function deleteTimePoint(
  date: string,
  timePointId: string,
  customUrl?: string
): Promise<WeddingSchedule> {
  const data = await getScheduleData(customUrl)

  const schedule = data.schedules.find((s: WeddingDaySchedule) => s.date === date)
  if (!schedule) {
    throw new Error('日期不存在')
  }

  const index = schedule.timePoints.findIndex((tp: TimePoint) => tp.id === timePointId)
  if (index === -1) {
    throw new Error('时间点不存在')
  }

  schedule.timePoints.splice(index, 1)

  const success = await saveScheduleData(data, customUrl)
  if (!success) {
    throw new Error('保存失败')
  }

  return data
}
