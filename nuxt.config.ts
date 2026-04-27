// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },

  typescript: {
    typeCheck: false
  },
  devServer: {
    port: 3002
  },

  ssr: false,
  // 启用 Nuxt UI
  modules: ['@nuxt/ui'],
  css: ['~/assets/css/main.css'],
  ui: {
    fonts: false
  },
  // 应用配置
  app: {
    head: {
      htmlAttrs: {
        lang: 'zh-CN'
      }
    }
  },

  // 组件自动导入
  components: {
    dirs: [
      {
        path: '~/components',
        pathPrefix: false
      }
    ]
  },

  // 路径别名
  alias: {
    '~/shared': './shared'
  },

  // 颜色模式
  colorMode: {
    preference: 'light',
    fallback: 'light'
  }
})
