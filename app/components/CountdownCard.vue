<template>
  <UCard class="mb-6 rounded-3xl shadow-lg overflow-hidden">
    <div class="bg-gradient-to-r from-pink-500 via-rose-500 to-purple-500 p-6 text-white">
      <div class="text-center">
        <div class="text-lg opacity-90 mb-2">距离婚礼还有</div>
        <div v-if="countdown.days >= 0" class="flex justify-center items-baseline gap-2">
          <span class="text-5xl md:text-6xl font-bold">{{ countdown.days }}</span>
          <span class="text-xl">天</span>
          <span class="text-3xl md:text-4xl font-bold">{{ countdown.hours }}</span>
          <span class="text-xl">时</span>
          <span class="text-3xl md:text-4xl font-bold">{{ countdown.minutes }}</span>
          <span class="text-xl">分</span>
        </div>
        <div v-else class="text-3xl font-bold">
          🎉 婚礼已举行，祝百年好合！
        </div>
        <div v-if="countdown.days >= 0" class="mt-3 text-sm opacity-80">
          {{ targetDate }}
        </div>
      </div>
    </div>
  </UCard>
</template>

<script setup lang="ts">
interface Props {
  targetDate: string
}

const props = defineProps<Props>()

const countdown = ref({
  days: 0,
  hours: 0,
  minutes: 0
})

let timer: NodeJS.Timeout | null = null

function updateCountdown() {
  const target = new Date(props.targetDate + 'T00:00:00')
  const now = new Date()
  const diff = target.getTime() - now.getTime()

  if (diff <= 0) {
    countdown.value = { days: -1, hours: 0, minutes: 0 }
    return
  }

  const days = Math.floor(diff / (1000 * 60 * 60 * 24))
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))

  countdown.value = { days, hours, minutes }
}

onMounted(() => {
  updateCountdown()
  timer = setInterval(updateCountdown, 60000) // 每分钟更新一次
})

onUnmounted(() => {
  if (timer) {
    clearInterval(timer)
  }
})
</script>
