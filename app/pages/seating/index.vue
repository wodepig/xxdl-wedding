<template>
  <div class="min-h-screen bg-gradient-to-br from-purple-100 via-pink-100 to-rose-100">
    <FloatingHearts />

    <div class="container mx-auto px-4 py-8 max-w-5xl relative z-10">
      <!-- 页面标题 -->
      <div class="text-center mb-8">
        <div class="text-5xl mb-3">🪑</div>
        <h1 class="text-4xl font-bold bg-gradient-to-r from-purple-500 via-pink-500 to-rose-500 bg-clip-text text-transparent">
          坐席安排
        </h1>
        <p class="text-gray-600 mt-2">管理宾客名单和餐桌座位</p>
      </div>

      <UCard class="rounded-3xl shadow-lg">
        <div class="text-center py-12">
          <UIcon name="i-lucide-construction" class="w-16 h-16 mx-auto mb-4 text-purple-400" />
          <h2 class="text-2xl font-semibold text-gray-700 mb-2">功能开发中</h2>
          <p class="text-gray-500">坐席安排功能即将上线，敬请期待！</p>
          <UButton to="/" color="primary" variant="solid" class="mt-6">
            返回首页
          </UButton>
        </div>
      </UCard>
    </div>
  </div>
</template>

<script setup lang="ts">
useHead({
  title: '坐席安排'
})
</script>
