import type { ApiResponse } from './fileStorage'

/**
 * OSS 存储配置
 */
export interface OssConfig {
  url: string
  defaultUrl: string
}

/**
 * 功能类型映射
 */
export const FeatureFiles: Record<string, string> = {
  schedule: '时间表.json',
  seating: '坐席.json',
  budget: '预算.json',
  todo: '待办.json'
}

/**
 * 默认 OSS URL（可以从环境变量或配置中读取）
 */
export const DefaultOssUrls: Record<string, string> = {
  schedule: 'https://lsky-ezrpa.oss-cn-qingdao.aliyuncs.com/weeding/time/config.json',
  seating: 'https://lsky-ezrpa.oss-cn-qingdao.aliyuncs.com/weeding/坐席.json',
  person: 'https://lsky-ezrpa.oss-cn-qingdao.aliyuncs.com/weeding/person.json',
  budget: 'https://your-bucket.oss-cn-hangzhou.aliyuncs.com/wedding/预算.json',
  todo: 'https://your-bucket.oss-cn-hangzhou.aliyuncs.com/wedding/待办.json'
}

/**
 * 从 OSS URL 读取 JSON 数据
 * @param url OSS URL
 * @returns 解析后的JSON数据
 */
export async function readOssJson<T>(url: string): Promise<T | null> {
  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Accept': 'application/json'
      }
    })

    if (!response.ok) {
      console.error(`OSS read failed: ${response.status} ${response.statusText}`)
      return null
    }

    const data = await response.json()
    return data as T
  } catch (error) {
    console.error('OSS read error:', error)
    return null
  }
}

/**
 * 写入 JSON 数据到 OSS URL
 * 注意：这需要 OSS 具有写入权限，通常需要签名 URL 或 STS 临时凭证
 * @param url OSS URL（可以是预签名URL）
 * @param data 要写入的数据
 */
export async function writeOssJson<T>(url: string, data: T): Promise<boolean> {
  try {
    const response = await fetch(url, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(data, null, 2)
    })

    if (!response.ok) {
      console.error(`OSS write failed: ${response.status} ${response.statusText}`)
      return false
    }

    return true
  } catch (error) {
    console.error('OSS write error:', error)
    return false
  }
}

/**
 * 获取功能的存储 URL
 * 优先使用用户配置的 URL，否则使用默认值
 * @param feature 功能名称 (schedule, seating, budget, todo)
 * @param customUrl 用户自定义 URL
 * @returns 实际使用的 URL
 */
export function getFeatureUrl(feature: string, customUrl?: string): string {
  if (customUrl && customUrl.trim()) {
    return customUrl.trim()
  }
  return DefaultOssUrls[feature] || ''
}

/**
 * 创建 OSS 存储的响应
 */
export function createOssSuccessResponse<T>(data: T, message?: string): ApiResponse<T> {
  return {
    success: true,
    data,
    message
  }
}

export function createOssErrorResponse(error: string): ApiResponse {
  return {
    success: false,
    error
  }
}
