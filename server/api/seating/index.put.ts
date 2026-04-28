import { readOssJson, writeOssJson, getFeatureUrl, createOssSuccessResponse, createOssErrorResponse } from '../../utils/ossStorage'
import type { SeatingLayout, RoundTable } from '../../../shared/types/seating'

/**
 * 更新婚礼坐席布局
 * PUT /api/seating
 * Body: { tables: RoundTable[], url?: string }
 */
export default defineEventHandler(async (event) => {
  try {
    const body = await readBody<{
      tables: RoundTable[]
      url?: string
    }>(event)

    if (!body || !Array.isArray(body.tables)) {
      return createOssErrorResponse('无效的请求数据')
    }

    // 获取实际使用的 URL
    const url = getFeatureUrl('seating', body.url)

    if (!url) {
      return createOssErrorResponse('未配置存储地址')
    }

    // 读取现有数据
    const existingData = await readOssJson<SeatingLayout>(url)

    // 合并数据
    const layout: SeatingLayout = {
      tables: body.tables,
      lastModified: new Date().toISOString()
    }

    // 写入 OSS
    const success = await writeOssJson(url, layout)

    if (!success) {
      return createOssErrorResponse('保存失败')
    }

    return createOssSuccessResponse(layout)
  } catch (error) {
    console.error('更新坐席布局失败:', error)
    return createOssErrorResponse('更新坐席布局失败')
  }
})
