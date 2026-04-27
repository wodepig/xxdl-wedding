import {
  deleteTimePoint,
  createOssSuccessResponse,
  createOssErrorResponse
} from '../../../../../utils/scheduleService'
import type { WeddingSchedule } from '../../../../../types/wedding'

/**
 * 删除时间点
 * DELETE /api/schedule/date/:date/timepoint/:id?url=自定义OSS链接
 */
export default defineEventHandler(async (event) => {
  try {
    const date = getRouterParam(event, 'date')
    const id = getRouterParam(event, 'id')
    const query = getQuery(event)
    const customUrl = query.url as string | undefined

    if (!date || !id) {
      return createOssErrorResponse('参数错误')
    }

    const data = await deleteTimePoint(date, id, customUrl)

    return createOssSuccessResponse<WeddingSchedule>(data, '删除成功')
  } catch (error: any) {
    return createOssErrorResponse(error.message || '删除失败')
  }
})
