<template>
  <div class="min-h-screen bg-gradient-to-br from-emerald-100 via-teal-100 to-cyan-100">
    <FloatingHearts />

    <div class="container mx-auto px-4 py-8 max-w-5xl relative z-10">
      <!-- 页面标题 -->
      <div class="text-center mb-8">
        <div class="text-5xl mb-3">💰</div>
        <h1 class="text-4xl font-bold bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 bg-clip-text text-transparent">
          预算管理
        </h1>
        <p class="text-gray-600 mt-2">记录和追踪婚礼各项开支</p>
      </div>

      <UCard class="rounded-3xl shadow-lg">
        <div class="text-center py-12">
          <UIcon name="i-lucide-construction" class="w-16 h-16 mx-auto mb-4 text-emerald-400" />
          <h2 class="text-2xl font-semibold text-gray-700 mb-2">功能开发中</h2>
          <p class="text-gray-500">预算管理功能即将上线，敬请期待！</p>
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
  title: '预算管理'
})
</script>
