import { readOssJson, writeOssJson, getFeatureUrl, createOssSuccessResponse, createOssErrorResponse } from '../../utils/ossStorage'
import type { TodoData, TodoDay } from '../../../shared/types/todo'

/**
 * 保存待办事项数据
 * PUT /api/todos
 * Body: { days: TodoDay[], url?: string }
 */
export default defineEventHandler(async (event) => {
  try {
    const body = await readBody<{ days: TodoDay[]; url?: string }>(event)

    if (!body || !Array.isArray(body.days)) {
      return createOssErrorResponse('无效的数据格式')
    }

    // 验证数据结构
    for (const day of body.days) {
      if (!day.date || !Array.isArray(day.items)) {
        return createOssErrorResponse('待办数据格式错误')
      }
    }

    // 获取实际使用的 URL
    const url = getFeatureUrl('todo', body.url)

    if (!url) {
      return createOssErrorResponse('未配置存储地址')
    }

    const data: TodoData = {
      days: body.days,
      lastModified: new Date().toISOString()
    }

    const success = await writeOssJson(url, data)

    if (!success) {
      return createOssErrorResponse('保存失败，请检查OSS权限')
    }

    return createOssSuccessResponse(null, '保存成功')
  } catch (error) {
    console.error('保存待办事项失败:', error)
    return createOssErrorResponse('保存失败')
  }
})
