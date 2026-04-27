<template>
  <UCard class="rounded-3xl shadow-lg">
    <template #header>
      <div class="flex items-center gap-2 text-xl font-semibold text-gray-800">
        <UIcon name="i-lucide-calculator" class="text-pink-500" />
        <span>时间日期计算工具</span>
      </div>
    </template>

    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
      <!-- 时间加减 -->
      <div class="bg-gradient-to-br from-pink-50 to-purple-50 rounded-2xl p-5 border border-pink-100">
        <h3 class="font-semibold mb-4 text-gray-700 flex items-center gap-2 text-lg">
          <UIcon name="i-lucide-clock" class="text-pink-500" />
          时间加减
        </h3>

        <UFormField label="基准时间" class="mb-3">
          <UInput
            v-model="calcBaseTime"
            type="datetime-local"
            icon="i-lucide-calendar-clock"
          />
        </UFormField>

        <div class="flex gap-3 mb-3">
          <UFormField label="数值" class="w-28">
            <UInput
              v-model.number="calcAmount"
              type="number"
              min="0"
            />
          </UFormField>
          <UFormField label="单位" class="flex-1">
            <USelect
              v-model="calcUnit"
              :items="[
                { label: '分钟', value: 'minutes' },
                { label: '小时', value: 'hours' },
                { label: '天', value: 'days' }
              ]"
            />
          </UFormField>
        </div>

        <div class="flex gap-3 mb-4">
          <UButton
            color="info"
            variant="solid"
            class="flex-1"
            icon="i-lucide-plus"
            @click="calculateTime('add')"
          >
            增加
          </UButton>
          <UButton
            color="warning"
            variant="solid"
            class="flex-1"
            icon="i-lucide-minus"
            @click="calculateTime('subtract')"
          >
            减少
          </UButton>
        </div>

        <UAlert
          v-if="calcResult"
          color="info"
          variant="soft"
          icon="i-lucide-info"
          class="rounded-xl"
        >
          <template #title>计算结果</template>
          <template #description>
            <div class="text-lg font-semibold text-blue-600">{{ calcResult }}</div>
          </template>
        </UAlert>

        <!-- 应用到添加事项按钮 -->
        <UButton
          v-if="calcResultTime"
          color="success"
          variant="soft"
          class="w-full mt-3"
          icon="i-lucide-arrow-down"
          @click="applyToNewTimePoint"
        >
          应用到添加事项
        </UButton>
      </div>

      <!-- 日期间隔 -->
      <div class="bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl p-5 border border-purple-100">
        <h3 class="font-semibold mb-4 text-gray-700 flex items-center gap-2 text-lg">
          <UIcon name="i-lucide-calendar-range" class="text-purple-500" />
          日期间隔
        </h3>

        <UFormField label="开始日期" class="mb-3">
          <UInput
            v-model="dateStart"
            type="date"
            icon="i-lucide-calendar-arrow-up"
          />
        </UFormField>

        <UFormField label="结束日期" class="mb-4">
          <UInput
            v-model="dateEnd"
            type="date"
            icon="i-lucide-calendar-arrow-down"
          />
        </UFormField>

        <UButton
          color="secondary"
          variant="solid"
          class="w-full mb-4"
          icon="i-lucide-calculator"
          @click="calculateDateDiff"
        >
          计算间隔
        </UButton>

        <UAlert
          v-if="dateDiffResult"
          color="secondary"
          variant="soft"
          icon="i-lucide-info"
          class="rounded-xl"
        >
          <template #title>间隔天数</template>
          <template #description>
            <div class="text-lg font-semibold text-purple-600">{{ dateDiffResult }}</div>
          </template>
        </UAlert>
      </div>
    </div>
  </UCard>
</template>

<script setup lang="ts">
import { format, addMinutes, addHours, addDays, differenceInDays, parseISO } from 'date-fns'
import { zhCN } from 'date-fns/locale'

// 定义事件
const emit = defineEmits<{
  applyTime: [time: string]
}>()

// 时间加减计算
const calcBaseTime = ref('')
const calcAmount = ref(30)
const calcUnit = ref<'minutes' | 'hours' | 'days'>('minutes')
const calcResult = ref('')
const calcResultTime = ref('') // 存储 HH:mm 格式的时间

// 日期间隔计算
const dateStart = ref('')
const dateEnd = ref('')
const dateDiffResult = ref('')

// 设置基准时间（从外部调用）
function setBaseTime(date: string, time: string) {
  // date: YYYY-MM-DD, time: HH:mm
  calcBaseTime.value = `${date}T${time}`
}

// 计算时间加减
function calculateTime(operation: 'add' | 'subtract') {
  if (!calcBaseTime.value) {
    calcResult.value = '请先选择基准时间'
    calcResultTime.value = ''
    return
  }

  const baseDate = parseISO(calcBaseTime.value)
  const amount = operation === 'add' ? calcAmount.value : -calcAmount.value

  let result: Date
  switch (calcUnit.value) {
    case 'minutes':
      result = addMinutes(baseDate, amount)
      break
    case 'hours':
      result = addHours(baseDate, amount)
      break
    case 'days':
      result = addDays(baseDate, amount)
      break
    default:
      result = baseDate
  }

  calcResult.value = format(result, 'yyyy年MM月dd日 HH:mm', { locale: zhCN })
  calcResultTime.value = format(result, 'HH:mm')
}

// 应用到添加事项
function applyToNewTimePoint() {
  if (calcResultTime.value) {
    emit('applyTime', calcResultTime.value)
  }
}

// 计算日期间隔
function calculateDateDiff() {
  if (!dateStart.value || !dateEnd.value) {
    dateDiffResult.value = '请选择开始和结束日期'
    return
  }

  const start = parseISO(dateStart.value)
  const end = parseISO(dateEnd.value)
  const diff = differenceInDays(end, start)

  if (diff < 0) {
    dateDiffResult.value = '结束日期不能早于开始日期'
  } else {
    dateDiffResult.value = `${diff} 天`
  }
}

// 暴露方法给父组件
defineExpose({
  setBaseTime
})
</script>
