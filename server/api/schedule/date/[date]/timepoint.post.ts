import {
  addTimePoint,
  createOssSuccessResponse,
  createOssErrorResponse
} from '../../../../utils/scheduleService'
import type { WeddingSchedule, TimePoint } from '../../../../types/wedding'

/**
 * 添加时间点
 * POST /api/schedule/date/:date/timepoint
 * Body: TimePoint & { url?: string }
 */
export default defineEventHandler(async (event) => {
  try {
    const date = getRouterParam(event, 'date')
    const body = await readBody<Partial<TimePoint> & { url?: string }>(event)

    if (!date || !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
      return createOssErrorResponse('无效的日期格式')
    }

    if (!body.time || !body.event) {
      return createOssErrorResponse('时间和事项不能为空')
    }

    const { url, ...timePointData } = body

    const data = await addTimePoint(date, {
      time: timePointData.time!,
      event: timePointData.event!,
      note: timePointData.note || ''
    }, url)

    return createOssSuccessResponse<WeddingSchedule>(data, '添加成功')
  } catch (error: any) {
    return createOssErrorResponse(error.message || '添加失败')
  }
})
