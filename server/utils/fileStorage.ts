import { readFile, writeFile, access, mkdir } from 'fs/promises'
import { join } from 'path'

const DATA_DIR = './server/data'

/**
 * 确保数据目录存在
 */
async function ensureDataDir(): Promise<void> {
  try {
    await access(DATA_DIR)
  } catch {
    await mkdir(DATA_DIR, { recursive: true })
  }
}

/**
 * 读取JSON文件
 * @param filename 文件名（不含路径）
 * @returns 解析后的JSON数据
 */
export async function readJsonFile<T>(filename: string): Promise<T | null> {
  await ensureDataDir()
  const filepath = join(DATA_DIR, filename)

  try {
    const content = await readFile(filepath, 'utf-8')
    return JSON.parse(content) as T
  } catch {
    return null
  }
}

/**
 * 写入JSON文件
 * @param filename 文件名（不含路径）
 * @param data 要写入的数据
 */
export async function writeJsonFile<T>(filename: string, data: T): Promise<void> {
  await ensureDataDir()
  const filepath = join(DATA_DIR, filename)
  await writeFile(filepath, JSON.stringify(data, null, 2), 'utf-8')
}

/**
 * API 通用响应结构
 */
export interface ApiResponse<T = unknown> {
  success: boolean
  data?: T
  message?: string
  error?: string
}

/**
 * 创建成功响应
 */
export function createSuccessResponse<T>(data: T, message?: string): ApiResponse<T> {
  return {
    success: true,
    data,
    message
  }
}

/**
 * 创建错误响应
 */
export function createErrorResponse(error: string): ApiResponse {
  return {
    success: false,
    error
  }
}
