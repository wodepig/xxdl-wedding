<template>
  <div class="fixed inset-0 pointer-events-none overflow-hidden z-0">
    <div
      v-for="heart in hearts"
      :key="heart.id"
      class="absolute text-2xl opacity-30"
      :style="{
        left: heart.left + '%',
        animationDuration: heart.duration + 's',
        animationDelay: heart.delay + 's',
        fontSize: heart.size + 'px'
      }"
      style="animation: float 15s infinite linear;"
    >
      {{ heart.emoji }}
    </div>
  </div>
</template>

<script setup lang="ts">
interface Heart {
  id: number
  emoji: string
  left: number
  duration: number
  delay: number
  size: number
}

const emojis: string[] = ['💕', '💖', '💗', '💓', '💝', '💘', '🌸', '✨']

const hearts = ref<Heart[]>([])

function generateHearts() {
  const newHearts: Heart[] = []
  for (let i = 0; i < 15; i++) {
    const randomIndex = Math.floor(Math.random() * emojis.length)
    const emoji = emojis[randomIndex]
    if (emoji) {
      newHearts.push({
        id: i,
        emoji,
        left: Math.random() * 100,
        duration: 10 + Math.random() * 10,
        delay: Math.random() * 10,
        size: 15 + Math.random() * 15
      })
    }
  }
  hearts.value = newHearts
}

onMounted(() => {
  generateHearts()
})
</script>

<style scoped>
@keyframes float {
  0%, 100% {
    transform: translateY(100vh) rotate(0deg);
    opacity: 0;
  }
  10% {
    opacity: 0.3;
  }
  90% {
    opacity: 0.3;
  }
  100% {
    transform: translateY(-100vh) rotate(720deg);
    opacity: 0;
  }
}
</style>
