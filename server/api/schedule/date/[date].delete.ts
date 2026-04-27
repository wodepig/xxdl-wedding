import {
  deleteScheduleDate,
  createOssSuccessResponse,
  createOssErrorResponse
} from '../../../utils/scheduleService'
import type { WeddingSchedule } from '../../../types/wedding'

/**
 * 删除指定日期
 * DELETE /api/schedule/date/:date?url=自定义OSS链接
 */
export default defineEventHandler(async (event) => {
  try {
    const date = getRouterParam(event, 'date')
    const query = getQuery(event)
    const customUrl = query.url as string | undefined

    if (!date || !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
      return createOssErrorResponse('无效的日期格式')
    }

    const data = await deleteScheduleDate(date, customUrl)

    return createOssSuccessResponse<WeddingSchedule>(data, '删除成功')
  } catch (error: any) {
    return createOssErrorResponse(error.message || '删除失败')
  }
})
