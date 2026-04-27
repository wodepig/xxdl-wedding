<template>
  <div class="min-h-screen">
    <!-- 导航栏 -->
    <nav class="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-200/50">
      <div class="container mx-auto px-4 max-w-5xl">
        <div class="flex items-center justify-between h-14">
          <!-- Logo -->
          <NuxtLink to="/" class="flex items-center gap-2 text-pink-600 hover:text-pink-700 transition-colors">
            <UIcon name="i-lucide-heart" class="w-6 h-6" />
            <span class="font-bold text-lg hidden sm:inline">婚礼助手</span>
          </NuxtLink>

          <!-- 导航链接 -->
          <div class="flex items-center gap-1 sm:gap-4">
            <NuxtLink
              v-for="item in navItems"
              :key="item.to"
              :to="item.to"
              class="flex items-center gap-1 px-3 py-2 rounded-lg text-sm font-medium transition-colors"
              :class="isActive(item.to) ? 'text-pink-600 bg-pink-50' : 'text-gray-600 hover:text-pink-600 hover:bg-pink-50/50'"
            >
              <UIcon :name="item.icon" class="w-4 h-4" />
              <span class="hidden sm:inline">{{ item.label }}</span>
            </NuxtLink>
          </div>
        </div>
      </div>
    </nav>

    <!-- 页面内容 -->
    <main>
      <slot />
    </main>
  </div>
</template>

<script setup lang="ts">
const route = useRoute()

const navItems = [
  { to: '/', label: '首页', icon: 'i-lucide-home' },
  { to: '/schedule', label: '时间表', icon: 'i-lucide-calendar-days' },
  { to: '/seating', label: '坐席', icon: 'i-lucide-users' },
  { to: '/budget', label: '预算', icon: 'i-lucide-wallet' },
  { to: '/todos', label: '待办', icon: 'i-lucide-clipboard-check' }
]

function isActive(path: string): boolean {
  if (path === '/') {
    return route.path === '/'
  }
  return route.path.startsWith(path)
}
</script>
