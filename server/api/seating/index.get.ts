import { readOssJson, getFeatureUrl, createOssSuccessResponse, createOssErrorResponse } from '../../utils/ossStorage'
import type { SeatingLayout } from '../../../shared/types/seating'

/**
 * 获取婚礼坐席布局
 * GET /api/seating?url=自定义OSS链接
 */
export default defineEventHandler(async (event) => {
  try {
    // 获取查询参数中的自定义 URL
    const query = getQuery(event)
    const customUrl = query.url as string | undefined

    // 获取实际使用的 URL
    const url = getFeatureUrl('seating', customUrl)

    if (!url) {
      return createOssErrorResponse('未配置存储地址')
    }

    const data = await readOssJson<SeatingLayout>(url)

    if (!data) {
      // 返回默认空数据结构
      return createOssSuccessResponse<SeatingLayout>({
        tables: []
      })
    }

    return createOssSuccessResponse(data)
  } catch (error) {
    console.error('获取坐席布局失败:', error)
    return createOssErrorResponse('获取坐席布局失败')
  }
})
