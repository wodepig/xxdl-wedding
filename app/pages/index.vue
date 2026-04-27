<template>
  <div class="min-h-screen bg-gradient-to-br from-pink-100 via-purple-100 to-rose-100">
    <!-- 浮动爱心背景 -->
    <FloatingHearts />

    <div class="container mx-auto px-4 py-8 max-w-4xl relative z-10">
      <!-- 主标题 -->
      <div class="text-center mb-12 pt-8">
        <div class="text-6xl md:text-7xl mb-4">💒</div>
        <h1 class="text-4xl md:text-6xl font-bold bg-gradient-to-r from-pink-500 via-rose-500 to-purple-500 bg-clip-text text-transparent mb-4">
          婚礼助手
        </h1>
        <p class="text-lg md:text-xl text-gray-600 mb-6">
          您的完美婚礼，从这里开始规划
        </p>
        <div class="flex justify-center gap-3 text-3xl">
          <span>💕</span>
          <span>💍</span>
          <span>🥂</span>
          <span>🌸</span>
        </div>
      </div>

      <!-- 功能卡片网格 -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <!-- 时间表 -->
        <NuxtLink to="/schedule" class="group">
          <UCard class="h-full rounded-3xl shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 overflow-hidden">
            <div class="bg-gradient-to-br from-pink-500 to-rose-500 p-6 text-white">
              <div class="flex items-center justify-between mb-4">
                <UIcon name="i-lucide-calendar-days" class="w-12 h-12" />
                <UIcon name="i-lucide-arrow-right" class="w-6 h-6 opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
              <h2 class="text-2xl font-bold mb-2">婚礼时间表</h2>
              <p class="opacity-90 text-sm">规划婚礼当天的详细时间安排，让一切井然有序</p>
            </div>
            <div class="p-4 bg-pink-50/50">
              <div class="flex items-center gap-2 text-pink-600 text-sm">
                <UIcon name="i-lucide-check-circle" class="w-4 h-4" />
                <span>多日期管理</span>
              </div>
              <div class="flex items-center gap-2 text-pink-600 text-sm mt-1">
                <UIcon name="i-lucide-check-circle" class="w-4 h-4" />
                <span>时间计算工具</span>
              </div>
            </div>
          </UCard>
        </NuxtLink>

        <!-- 坐席安排 -->
        <NuxtLink to="/seating" class="group">
          <UCard class="h-full rounded-3xl shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 overflow-hidden">
            <div class="bg-gradient-to-br from-purple-500 to-indigo-500 p-6 text-white">
              <div class="flex items-center justify-between mb-4">
                <UIcon name="i-lucide-users" class="w-12 h-12" />
                <UIcon name="i-lucide-arrow-right" class="w-6 h-6 opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
              <h2 class="text-2xl font-bold mb-2">坐席安排</h2>
              <p class="opacity-90 text-sm">智能管理宾客名单和餐桌座位安排</p>
            </div>
            <div class="p-4 bg-purple-50/50">
              <div class="flex items-center gap-2 text-purple-600 text-sm">
                <UIcon name="i-lucide-check-circle" class="w-4 h-4" />
                <span>宾客管理</span>
              </div>
              <div class="flex items-center gap-2 text-purple-600 text-sm mt-1">
                <UIcon name="i-lucide-check-circle" class="w-4 h-4" />
                <span>智能排座</span>
              </div>
            </div>
          </UCard>
        </NuxtLink>

        <!-- 预算管理 -->
        <NuxtLink to="/budget" class="group">
          <UCard class="h-full rounded-3xl shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 overflow-hidden">
            <div class="bg-gradient-to-br from-emerald-500 to-teal-500 p-6 text-white">
              <div class="flex items-center justify-between mb-4">
                <UIcon name="i-lucide-wallet" class="w-12 h-12" />
                <UIcon name="i-lucide-arrow-right" class="w-6 h-6 opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
              <h2 class="text-2xl font-bold mb-2">预算管理</h2>
              <p class="opacity-90 text-sm">记录和追踪婚礼各项开支，合理规划预算</p>
            </div>
            <div class="p-4 bg-emerald-50/50">
              <div class="flex items-center gap-2 text-emerald-600 text-sm">
                <UIcon name="i-lucide-check-circle" class="w-4 h-4" />
                <span>开支记录</span>
              </div>
              <div class="flex items-center gap-2 text-emerald-600 text-sm mt-1">
                <UIcon name="i-lucide-check-circle" class="w-4 h-4" />
                <span>预算统计</span>
              </div>
            </div>
          </UCard>
        </NuxtLink>

        <!-- 待办事项 -->
        <NuxtLink to="/todos" class="group">
          <UCard class="h-full rounded-3xl shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 overflow-hidden">
            <div class="bg-gradient-to-br from-amber-500 to-orange-500 p-6 text-white">
              <div class="flex items-center justify-between mb-4">
                <UIcon name="i-lucide-clipboard-check" class="w-12 h-12" />
                <UIcon name="i-lucide-arrow-right" class="w-6 h-6 opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
              <h2 class="text-2xl font-bold mb-2">待办事项</h2>
              <p class="opacity-90 text-sm">婚礼筹备清单，确保每个细节都不遗漏</p>
            </div>
            <div class="p-4 bg-amber-50/50">
              <div class="flex items-center gap-2 text-amber-600 text-sm">
                <UIcon name="i-lucide-check-circle" class="w-4 h-4" />
                <span>任务清单</span>
              </div>
              <div class="flex items-center gap-2 text-amber-600 text-sm mt-1">
                <UIcon name="i-lucide-check-circle" class="w-4 h-4" />
                <span>进度追踪</span>
              </div>
            </div>
          </UCard>
        </NuxtLink>
      </div>

      <!-- 设置入口 -->
      <div class="flex justify-center mt-8">
        <NuxtLink to="/settings" class="group">
          <UButton
            variant="soft"
            color="neutral"
            icon="i-lucide-settings"
            class="rounded-full px-6"
          >
            数据存储设置
          </UButton>
        </NuxtLink>
      </div>

      <!-- 底部信息 -->
      <div class="text-center mt-12 text-gray-500 text-sm">
        <p>💕 祝您的婚礼完美无瑕 💕</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
useHead({
  title: '婚礼助手 - 首页'
})
</script>
