<script setup lang="ts">
import { zh_cn } from '@nuxt/ui/locale'

useHead({
  titleTemplate: (titleChunk) => {
    return titleChunk ? `${titleChunk} | 婚礼助手` : '婚礼助手'
  },
  meta: [
    { charset: 'utf-8' },
    { name: 'viewport', content: 'width=device-width, initial-scale=1' },
    { name: 'description', content: '婚礼助手 - 规划您的完美婚礼' }
  ],
  link: [
    { rel: 'icon', type: 'image/x-icon', href: '/favicon.ico' }
  ]
})
</script>

<template>
  <UApp :locale="zh_cn">
    <NuxtLayout>
      <NuxtPage />
    </NuxtLayout>
  </UApp>
</template>

<style>
/* 全局样式 */
html {
  scroll-behavior: smooth;
}

body {
  font-family: 'Noto Sans SC', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
}
</style>
