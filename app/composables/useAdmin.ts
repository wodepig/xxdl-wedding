// 管理员权限管理
const ADMIN_PASSWORD = 'xxdlovo'
const STORAGE_KEY = 'wedding-admin-auth'

// 全局状态
const isAdmin = ref(false)
const isAuthenticated = ref(false)

/**
 * 使用管理员权限
 * 提供全局的编辑权限管理
 */
export function useAdmin() {
  // 检查本地存储的认证状态
  function checkAuth() {
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      if (stored) {
        const parsed = JSON.parse(stored)
        // 验证存储的密码是否正确
        if (parsed.password === ADMIN_PASSWORD) {
          isAdmin.value = true
          isAuthenticated.value = true
          return true
        }
      }
    } catch (error) {
      console.error('读取认证状态失败:', error)
    }
    isAdmin.value = false
    isAuthenticated.value = false
    return false
  }

  /**
   * 验证密码
   * @param password 输入的密码
   * @returns 是否验证成功
   */
  function verifyPassword(password: string): boolean {
    if (password === ADMIN_PASSWORD) {
      isAdmin.value = true
      isAuthenticated.value = true
      // 保存到本地存储
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify({ password }))
      } catch (error) {
        console.error('保存认证状态失败:', error)
      }
      return true
    }
    return false
  }

  /**
   * 退出登录
   */
  function logout() {
    isAdmin.value = false
    isAuthenticated.value = false
    try {
      localStorage.removeItem(STORAGE_KEY)
    } catch (error) {
      console.error('清除认证状态失败:', error)
    }
  }

  /**
   * 切换编辑模式（用于设置页面）
   */
  function toggleEditMode(password: string): boolean {
    if (isAdmin.value) {
      // 如果已经是管理员，则退出
      logout()
      return false
    } else {
      // 否则尝试验证密码
      return verifyPassword(password)
    }
  }

  // 初始化时检查认证状态
  if (process.client) {
    checkAuth()
  }

  return {
    isAdmin: readonly(isAdmin),
    isAuthenticated: readonly(isAuthenticated),
    verifyPassword,
    logout,
    toggleEditMode,
    checkAuth
  }
}
