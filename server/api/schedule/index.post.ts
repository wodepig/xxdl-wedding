import { readOssJson, writeOssJson, getFeatureUrl, createOssSuccessResponse, createOssErrorResponse } from '../../utils/ossStorage'
import type { WeddingSchedule, WeddingDaySchedule } from '../../types/wedding'

/**
 * 保存完整婚礼时间表
 * POST /api/schedule
 * Body: { data: WeddingSchedule, url?: string }
 */
export default defineEventHandler(async (event) => {
  try {
    const body = await readBody<{ data: WeddingSchedule; url?: string }>(event)

    if (!body || !body.data || !Array.isArray(body.data.schedules)) {
      return createOssErrorResponse('无效的数据格式')
    }

    // 验证数据结构
    for (const schedule of body.data.schedules) {
      if (!schedule.date || !Array.isArray(schedule.timePoints)) {
        return createOssErrorResponse('日程数据格式错误')
      }
    }

    // 获取实际使用的 URL
    const url = getFeatureUrl('schedule', body.url)

    if (!url) {
      return createOssErrorResponse('未配置存储地址')
    }

    const success = await writeOssJson(url, body.data)

    if (!success) {
      return createOssErrorResponse('保存失败，请检查OSS权限')
    }

    return createOssSuccessResponse(null, '保存成功')
  } catch (error) {
    console.error('保存时间表失败:', error)
    return createOssErrorResponse('保存失败')
  }
})
