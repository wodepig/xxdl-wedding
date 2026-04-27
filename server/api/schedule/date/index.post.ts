import {
  addScheduleDate,
  createOssSuccessResponse,
  createOssErrorResponse
} from '../../../utils/scheduleService'
import type { WeddingSchedule } from '../../../types/wedding'

/**
 * 添加新日期
 * POST /api/schedule/date
 * Body: { date: string, url?: string }
 */
export default defineEventHandler(async (event) => {
  try {
    const body = await readBody<{ date: string; url?: string }>(event)

    if (!body.date || !/^\d{4}-\d{2}-\d{2}$/.test(body.date)) {
      return createOssErrorResponse('无效的日期格式')
    }

    const data = await addScheduleDate(body.date, body.url)

    return createOssSuccessResponse<WeddingSchedule>(data, '添加成功')
  } catch (error: any) {
    return createOssErrorResponse(error.message || '添加失败')
  }
})
