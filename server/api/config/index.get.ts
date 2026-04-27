import { getFeatureUrl, DefaultOssUrls } from '../../utils/ossStorage'
import type { ApiResponse } from '../../utils/fileStorage'

/**
 * 获取配置信息
 * GET /api/config
 */
export default defineEventHandler(async () => {
  try {
    // 返回默认配置
    const config = {
      features: {
        schedule: {
          name: '时间表',
          defaultUrl: DefaultOssUrls.schedule,
          description: '婚礼时间安排表'
        },
        seating: {
          name: '坐席',
          defaultUrl: DefaultOssUrls.seating,
          description: '婚礼坐席安排'
        },
        budget: {
          name: '预算',
          defaultUrl: DefaultOssUrls.budget,
          description: '婚礼预算管理'
        },
        todo: {
          name: '待办',
          defaultUrl: DefaultOssUrls.todo,
          description: '婚礼待办事项'
        }
      }
    }

    return {
      success: true,
      data: config
    } as ApiResponse<typeof config>
  } catch (error) {
    return {
      success: false,
      error: '获取配置失败'
    } as ApiResponse
  }
})
