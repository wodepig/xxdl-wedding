import { readOssJson, writeOssJson, getFeatureUrl, createOssSuccessResponse, createOssErrorResponse } from '../../utils/ossStorage'
import type { PersonList, Person } from '../../../shared/types/person'

/**
 * 更新人员列表
 * PUT /api/person
 * Body: { persons: Person[], url?: string }
 */
export default defineEventHandler(async (event) => {
  try {
    const body = await readBody<{
      persons: Person[]
      url?: string
    }>(event)

    if (!body || !Array.isArray(body.persons)) {
      return createOssErrorResponse('无效的请求数据')
    }

    // 获取实际使用的 URL
    const url = getFeatureUrl('person', body.url)

    if (!url) {
      return createOssErrorResponse('未配置存储地址')
    }

    // 合并数据
    const list: PersonList = {
      persons: body.persons,
      lastModified: new Date().toISOString()
    }

    // 写入 OSS
    const success = await writeOssJson(url, list)

    if (!success) {
      return createOssErrorResponse('保存失败')
    }

    return createOssSuccessResponse(list)
  } catch (error) {
    console.error('更新人员列表失败:', error)
    return createOssErrorResponse('更新人员列表失败')
  }
})
