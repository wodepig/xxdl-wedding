import { readOssJson, getFeatureUrl, createOssSuccessResponse, createOssErrorResponse } from '../../utils/ossStorage'
import type { PersonList } from '../../../shared/types/person'

/**
 * 获取人员列表
 * GET /api/person?url=自定义OSS链接
 */
export default defineEventHandler(async (event) => {
  try {
    // 获取查询参数中的自定义 URL
    const query = getQuery(event)
    const customUrl = query.url as string | undefined

    // 获取实际使用的 URL
    const url = getFeatureUrl('person', customUrl)

    if (!url) {
      return createOssErrorResponse('未配置存储地址')
    }

    const data = await readOssJson<PersonList>(url)

    if (!data) {
      // 返回默认空数据结构
      return createOssSuccessResponse<PersonList>({
        persons: []
      })
    }

    return createOssSuccessResponse(data)
  } catch (error) {
    console.error('获取人员列表失败:', error)
    return createOssErrorResponse('获取人员列表失败')
  }
})
