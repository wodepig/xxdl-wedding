<template>
  <BasePersonList
    ref="basePersonListRef"
    :is-admin="isAdmin"
    title="坐席人员"
    icon="i-lucide-users"
    :draggable="true"
    api-endpoint="/api/person"
    storage-key="person"
    @dragstart="onDragStart"
    @update="$emit('update', $event)"
  >
    <!-- 自定义人员项显示 -->
    <template #personItem="{ person }">
      <div class="flex items-center justify-between">
        <div class="flex-1 min-w-0">
          <div class="font-medium text-gray-800 truncate">{{ person.name }}</div>
          <div class="text-xs text-gray-500 mt-0.5">
            <span v-if="person.groomTitle" class="mr-2">男方: {{ person.groomTitle }}</span>
            <span v-if="person.brideTitle">女方: {{ person.brideTitle }}</span>
          </div>
          <div v-if="person.remark" class="text-xs text-gray-400 mt-0.5 truncate">{{ person.remark }}</div>
        </div>
        <div v-if="isAdmin" class="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <UButton
            color="info"
            variant="ghost"
            size="xs"
            icon="i-lucide-pencil"
            class="w-7 h-7 p-0"
            @click.stop="editPerson(person)"
          />
          <UButton
            color="error"
            variant="ghost"
            size="xs"
            icon="i-lucide-trash-2"
            class="w-7 h-7 p-0"
            @click.stop="deletePerson(person.id)"
          />
        </div>
      </div>
    </template>

    <!-- 底部：已分配人员折叠面板 -->
    <template #footer>
      <div v-if="assignedPersons.length > 0" class="mt-4 pt-4 border-t border-gray-200">
        <button
          class="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 transition-colors"
          @click="showAssigned = !showAssigned"
        >
          <UIcon
            name="i-lucide-chevron-down"
            class="w-4 h-4 transition-transform"
            :class="showAssigned ? 'rotate-180' : ''"
          />
          <span>已分配人员 ({{ assignedPersons.length }})</span>
        </button>
        <div v-if="showAssigned" class="mt-2 space-y-2 max-h-[200px] overflow-y-auto">
          <div
            v-for="person in assignedPersons"
            :key="person.id"
            class="p-2 bg-gray-50 rounded-lg text-sm text-gray-500"
          >
            <div class="flex items-center justify-between">
              <span class="truncate">{{ person.name }}</span>
              <UButton
                v-if="isAdmin"
                color="error"
                variant="ghost"
                size="xs"
                icon="i-lucide-x"
                class="w-6 h-6 p-0"
                @click="unassignPerson(person)"
              />
            </div>
          </div>
        </div>
      </div>
    </template>
  </BasePersonList>
</template>

<script setup lang="ts">
import type { Person } from '../../shared/types/person'
import BasePersonList from './BasePersonList.vue'

// Props
const props = defineProps<{
  isAdmin: boolean
}>()

// Emits
const emit = defineEmits<{
  (e: 'dragstart', event: DragEvent, person: Person): void
  (e: 'update', persons: Person[]): void
}>()

// 状态
const basePersonListRef = ref<InstanceType<typeof BasePersonList> | null>(null)
const showAssigned = ref(false)

// 拖拽开始
function onDragStart(event: DragEvent, person: Person) {
  emit('dragstart', event, person)
}

// 计算属性
const persons = computed(() => basePersonListRef.value?.persons || [])
const unassignedPersons = computed(() => persons.value.filter(p => !p.assigned))
const assignedPersons = computed(() => persons.value.filter(p => p.assigned))

// 编辑人员
function editPerson(person: Person) {
  basePersonListRef.value?.editPerson?.(person)
}

// 删除人员
async function deletePerson(id: string) {
  basePersonListRef.value?.deletePerson?.(id)
}

// 取消分配（支持传入 Person 对象或 personId）
async function unassignPerson(personOrId: Person | string) {
  const personId = typeof personOrId === 'string' ? personOrId : personOrId.id
  const basePersons = basePersonListRef.value?.persons
  if (!basePersons) return

  const personIndex = basePersons.findIndex(p => p.id === personId)
  if (personIndex >= 0) {
    // 直接修改 basePersonList 中的数据以触发响应式更新
    basePersons[personIndex] = {
      ...basePersons[personIndex],
      assigned: false,
      tableId: undefined
    }
    await basePersonListRef.value?.saveToOss?.()
  }
}

// 分配人员到圆桌
async function assignPersonToTable(personId: string, tableId: string) {
  const basePersons = basePersonListRef.value?.persons
  if (!basePersons) return

  const personIndex = basePersons.findIndex(p => p.id === personId)
  if (personIndex >= 0) {
    // 直接修改 basePersonList 中的数据以触发响应式更新
    basePersons[personIndex] = {
      ...basePersons[personIndex],
      assigned: true,
      tableId: tableId
    }
    await basePersonListRef.value?.saveToOss?.()
  }
}

// 导入人员列表
async function importPersons(newPersons: Person[]) {
  await basePersonListRef.value?.importPersons?.(newPersons)
}

// 加载数据
function loadData() {
  basePersonListRef.value?.loadData?.()
}

// 暴露方法给父组件
defineExpose({
  loadData,
  assignPersonToTable,
  unassignPerson,
  importPersons,
  persons
})
</script>
