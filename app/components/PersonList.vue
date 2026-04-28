<template>
  <UCard class="h-full rounded-2xl shadow-lg">
    <template #header>
      <div class="flex items-center justify-between">
        <div class="flex items-center gap-2 text-lg font-semibold text-gray-800">
          <UIcon name="i-lucide-users" class="text-pink-500" />
          <span>人员列表</span>
          <UBadge size="sm" variant="soft" color="primary">
            {{ unassignedCount }}/{{ persons.length }}
          </UBadge>
        </div>
        <UButton
          v-if="isAdmin"
          color="primary"
          variant="soft"
          size="xs"
          icon="i-lucide-plus"
          @click="openAddModal"
        >
          添加
        </UButton>
      </div>
    </template>

    <!-- 人员列表 -->
    <div class="space-y-2 max-h-[500px] overflow-y-auto pr-1">
      <div
        v-for="person in unassignedPersons"
        :key="person.id"
        draggable="true"
        class="p-3 bg-gradient-to-r from-pink-50 to-purple-50 rounded-xl border border-pink-100 cursor-move hover:shadow-md transition-all hover:scale-[1.02] group"
        @dragstart="onDragStart($event, person)"
      >
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
              @click="editPerson(person)"
            />
            <UButton
              color="error"
              variant="ghost"
              size="xs"
              icon="i-lucide-trash-2"
              class="w-7 h-7 p-0"
              @click="deletePerson(person.id)"
            />
          </div>
        </div>
      </div>

      <!-- 空状态 -->
      <div v-if="unassignedPersons.length === 0" class="text-center py-8 text-gray-400">
        <UIcon name="i-lucide-user-plus" class="w-12 h-12 mx-auto mb-2 opacity-50" />
        <p class="text-sm">暂无未分配人员</p>
        <p v-if="isAdmin" class="text-xs mt-1">点击上方"添加"按钮</p>
      </div>
    </div>

    <!-- 已分配人员折叠面板 -->
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
  </UCard>

  <!-- 添加/编辑人员对话框 -->
  <UModal v-model:open="showModal" :title="editingPerson ? '编辑人员' : '添加人员'">
    <template #body>
      <UFormField label="姓名" class="mb-3">
        <div class="flex gap-2">
          <UInput
            v-model="form.name"
            placeholder="请输入姓名"
            icon="i-lucide-user"
            class="flex-1"
          />
          <UButton
            color="secondary"
            variant="soft"
            icon="i-lucide-copy"
            title="同步到称呼"
            @click="syncNameToTitles"
          />
        </div>
      </UFormField>

      <UFormField label="男方称呼" class="mb-3">
        <UInput
          v-model="form.groomTitle"
          placeholder="如：表哥、同事"
          icon="i-lucide-user-circle"
        />
      </UFormField>

      <UFormField label="女方称呼" class="mb-3">
        <UInput
          v-model="form.brideTitle"
          placeholder="如：舅舅、闺蜜"
          icon="i-lucide-user-circle"
        />
      </UFormField>

      <UFormField label="备注">
        <UTextarea
          v-model="form.remark"
          placeholder="添加备注信息..."
          :rows="2"
        />
      </UFormField>
    </template>

    <template #footer>
      <div class="flex justify-end gap-2">
        <UButton variant="ghost" @click="showModal = false">取消</UButton>
        <UButton color="primary" @click="savePerson">保存</UButton>
      </div>
    </template>
  </UModal>
</template>

<script setup lang="ts">
import type { Person, PersonList } from '../../shared/types/person'

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
const persons = ref<Person[]>([])
const showModal = ref(false)
const editingPerson = ref<Person | null>(null)
const showAssigned = ref(false)
const ossUrl = ref<string>('')

const toast = useToast()

// 表单
const form = reactive({
  name: '',
  groomTitle: '',
  brideTitle: '',
  remark: ''
})

// 计算属性
const unassignedPersons = computed(() => persons.value.filter(p => !p.assigned))
const assignedPersons = computed(() => persons.value.filter(p => p.assigned))
const unassignedCount = computed(() => unassignedPersons.value.length)

// 从本地存储加载 OSS URL
function loadOssUrl() {
  try {
    const stored = localStorage.getItem('wedding-oss-config')
    if (stored) {
      const parsed = JSON.parse(stored)
      ossUrl.value = parsed.person || ''
    }
  } catch (error) {
    console.error('加载OSS配置失败:', error)
  }
}

// 加载人员数据
async function loadData() {
  loadOssUrl()

  interface PersonApiResponse {
    success: boolean
    data?: PersonList
    error?: string
  }

  try {
    const response = await $fetch<PersonApiResponse>('/api/person', {
      query: ossUrl.value ? { url: ossUrl.value } : undefined
    })

    if (response.success && response.data) {
      persons.value = response.data.persons || []
      emit('update', persons.value)
    }
  } catch (error) {
    console.error('加载人员数据失败:', error)
    toast.add({
      title: '加载失败',
      description: '无法加载人员数据',
      color: 'error'
    })
  }
}

// 保存人员数据到 OSS
async function saveToOss() {
  interface PersonApiResponse {
    success: boolean
    data?: PersonList
    error?: string
  }

  try {
    const response = await $fetch<PersonApiResponse>('/api/person', {
      method: 'PUT',
      body: {
        persons: persons.value,
        url: ossUrl.value
      }
    })

    if (!response.success) {
      throw new Error(response.error || '保存失败')
    }

    emit('update', persons.value)
  } catch (error) {
    console.error('保存人员数据失败:', error)
    toast.add({
      title: '保存失败',
      description: '无法保存到云端',
      color: 'error'
    })
  }
}

// 同步姓名到称呼
function syncNameToTitles() {
  if (!form.name.trim()) {
    toast.add({
      title: '请先输入姓名',
      color: 'warning'
    })
    return
  }
  form.groomTitle = form.name.trim()
  form.brideTitle = form.name.trim()
  toast.add({
    title: '已同步',
    description: '姓名已同步到男方称呼和女方称呼',
    color: 'success'
  })
}

// 打开添加对话框
function openAddModal() {
  editingPerson.value = null
  form.name = ''
  form.groomTitle = ''
  form.brideTitle = ''
  form.remark = ''
  showModal.value = true
}

// 编辑人员
function editPerson(person: Person) {
  editingPerson.value = person
  form.name = person.name
  form.groomTitle = person.groomTitle || ''
  form.brideTitle = person.brideTitle || ''
  form.remark = person.remark || ''
  showModal.value = true
}

// 保存人员
async function savePerson() {
  if (!form.name.trim()) {
    toast.add({
      title: '请输入姓名',
      color: 'warning'
    })
    return
  }

  const personData: Person = {
    id: editingPerson.value?.id || `person-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    name: form.name.trim(),
    groomTitle: form.groomTitle.trim() || undefined,
    brideTitle: form.brideTitle.trim() || undefined,
    remark: form.remark.trim() || undefined,
    assigned: editingPerson.value?.assigned || false,
    tableId: editingPerson.value?.tableId
  }

  if (editingPerson.value) {
    const index = persons.value.findIndex(p => p.id === editingPerson.value!.id)
    if (index >= 0) {
      persons.value[index] = personData
    }
  } else {
    persons.value.push(personData)
  }

  await saveToOss()
  showModal.value = false
  toast.add({
    title: editingPerson.value ? '更新成功' : '添加成功',
    color: 'success'
  })
}

// 删除人员
async function deletePerson(id: string) {
  const index = persons.value.findIndex(p => p.id === id)
  if (index >= 0) {
    persons.value.splice(index, 1)
    await saveToOss()
    toast.add({
      title: '删除成功',
      color: 'success'
    })
  }
}

// 取消分配（支持传入 Person 对象或 personId）
async function unassignPerson(personOrId: Person | string) {
  const personId = typeof personOrId === 'string' ? personOrId : personOrId.id
  const p = persons.value.find(p => p.id === personId)
  if (p) {
    p.assigned = false
    p.tableId = undefined
    await saveToOss()
  }
}

// 拖拽开始
function onDragStart(event: DragEvent, person: Person) {
  if (event.dataTransfer) {
    event.dataTransfer.setData('application/json', JSON.stringify(person))
    event.dataTransfer.effectAllowed = 'move'
  }
  emit('dragstart', event, person)
}

// 分配人员到圆桌
async function assignPersonToTable(personId: string, tableId: string) {
  const person = persons.value.find(p => p.id === personId)
  if (person) {
    person.assigned = true
    person.tableId = tableId
    await saveToOss()
  }
}

// 暴露方法给父组件
defineExpose({
  loadData,
  assignPersonToTable,
  unassignPerson,
  persons
})

// 初始化
onMounted(() => {
  loadData()
})
</script>
