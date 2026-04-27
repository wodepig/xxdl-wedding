import {
  updateTimePoint,
  createOssSuccessResponse,
  createOssErrorResponse
} from '../../../../../utils/scheduleService'
import type { WeddingSchedule, TimePoint } from '../../../../../types/wedding'

/**
 * 更新时间点
 * PUT /api/schedule/date/:date/timepoint/:id
 * Body: Partial<TimePoint> & { url?: string }
 */
export default defineEventHandler(async (event) => {
  try {
    const date = getRouterParam(event, 'date')
    const id = getRouterParam(event, 'id')
    const body = await readBody<Partial<TimePoint> & { url?: string }>(event)

    if (!date || !id) {
      return createOssErrorResponse('参数错误')
    }

    const { url, ...updates } = body

    const data = await updateTimePoint(date, id, updates, url)

    return createOssSuccessResponse<WeddingSchedule>(data, '更新成功')
  } catch (error: any) {
    return createOssErrorResponse(error.message || '更新失败')
  }
})
