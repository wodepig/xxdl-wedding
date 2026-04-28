import { readOssJson, getFeatureUrl, createOssSuccessResponse, createOssErrorResponse } from '../../utils/ossStorage'
import type { TodoData } from '../../../shared/types/todo'

/**
 * 获取待办事项数据
 * GET /api/todos?url=自定义OSS链接
 */
export default defineEventHandler(async (event) => {
  try {
    // 获取查询参数中的自定义 URL
    const query = getQuery(event)
    const customUrl = query.url as string | undefined

    // 获取实际使用的 URL
    const url = getFeatureUrl('todo', customUrl)

    if (!url) {
      return createOssErrorResponse('未配置存储地址')
    }

    const data = await readOssJson<TodoData>(url)

    if (!data) {
      // 返回默认空数据结构
      return createOssSuccessResponse<TodoData>({
        days: []
      })
    }

    return createOssSuccessResponse(data)
  } catch (error) {
    console.error('获取待办事项失败:', error)
    return createOssErrorResponse('获取待办事项失败')
  }
})
