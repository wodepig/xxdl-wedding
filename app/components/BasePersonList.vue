<template>
  <UCard class="h-full rounded-2xl shadow-lg">
    <template #header>
      <div class="flex items-center justify-between">
        <div class="flex items-center gap-2 text-lg font-semibold text-gray-800">
          <UIcon :name="icon" class="text-pink-500" />
          <span>{{ title }}</span>
          <UBadge size="sm" variant="soft" color="primary">
            {{ persons.length }}
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
        v-for="person in persons"
        :key="person.id"
        :draggable="draggable"
        class="p-3 bg-gradient-to-r from-pink-50 to-purple-50 rounded-xl border border-pink-100 hover:shadow-md transition-all hover:scale-[1.02] group"
        :class="draggable ? 'cursor-move' : 'cursor-pointer'"
        @dragstart="onDragStart($event, person)"
        @click="$emit('clickPerson', person)"
      >
        <slot name="personItem" :person="person">
          <!-- 默认显示 -->
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
        </slot>
      </div>

      <!-- 空状态 -->
      <div v-if="persons.length === 0" class="text-center py-8 text-gray-400">
        <UIcon name="i-lucide-user-plus" class="w-12 h-12 mx-auto mb-2 opacity-50" />
        <p class="text-sm">暂无人员</p>
        <p v-if="isAdmin" class="text-xs mt-1">点击上方"添加"按钮</p>
      </div>
    </div>

    <!-- 底部插槽 -->
    <slot name="footer" />
  </UCard>

  <!-- 添加/编辑人员对话框 -->
  <UModal v-model:open="showModal" :title="editingPerson ? '编辑人员' : '添加人员'">
    <template #body>
      <slot name="formFields" :form="form">
        <!-- 默认表单字段 -->
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
      </slot>
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
import type { Person } from '../../shared/types/person'

// Props
const props = defineProps<{
  isAdmin: boolean
  title?: string
  icon?: string
  draggable?: boolean
  apiEndpoint?: string
  storageKey?: string
}>()

// Emits
const emit = defineEmits<{
  (e: 'dragstart', event: DragEvent, person: Person): void
  (e: 'update', persons: Person[]): void
  (e: 'clickPerson', person: Person): void
}>()

// 状态
const persons = ref<Person[]>([])
const showModal = ref(false)
const editingPerson = ref<Person | null>(null)
const ossUrl = ref<string>('')

const toast = useToast()

// 默认值
const title = computed(() => props.title || '人员列表')
const icon = computed(() => props.icon || 'i-lucide-users')
const draggable = computed(() => props.draggable ?? false)
const apiEndpoint = computed(() => props.apiEndpoint || '/api/person')
const storageKey = computed(() => props.storageKey || 'person')

// 表单
const form = reactive({
  name: '',
  groomTitle: '',
  brideTitle: '',
  remark: ''
})

// 从本地存储加载 OSS URL
function loadOssUrl() {
  try {
    const stored = localStorage.getItem('wedding-oss-config')
    if (stored) {
      const parsed = JSON.parse(stored)
      ossUrl.value = parsed[storageKey.value] || ''
    }
  } catch (error) {
    console.error('加载OSS配置失败:', error)
  }
}

// 加载人员数据
async function loadData() {
  loadOssUrl()

  interface PersonList {
    persons: Person[]
    lastModified?: string
  }

  interface PersonApiResponse {
    success: boolean
    data?: PersonList
    error?: string
  }

  try {
    const response = await $fetch<PersonApiResponse>(apiEndpoint.value, {
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
  interface PersonList {
    persons: Person[]
    lastModified?: string
  }

  interface PersonApiResponse {
    success: boolean
    data?: PersonList
    error?: string
  }

  try {
    const response = await $fetch<PersonApiResponse>(apiEndpoint.value, {
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

// 拖拽开始
function onDragStart(event: DragEvent, person: Person) {
  if (!draggable.value) return
  if (event.dataTransfer) {
    event.dataTransfer.setData('application/json', JSON.stringify(person))
    event.dataTransfer.effectAllowed = 'move'
  }
  emit('dragstart', event, person)
}

// 导入人员列表
async function importPersons(newPersons: Person[]) {
  if (!newPersons || newPersons.length === 0) return

  // 合并人员列表，以新导入的为准（根据ID去重）
  const existingIds = new Set(persons.value.map(p => p.id))
  const personsToAdd = newPersons.filter(p => !existingIds.has(p.id))

  // 更新已存在的人员信息
  for (const newPerson of newPersons) {
    const existingIndex = persons.value.findIndex(p => p.id === newPerson.id)
    if (existingIndex >= 0) {
      persons.value[existingIndex] = { ...newPerson }
    }
  }

  // 添加新人员
  persons.value.push(...personsToAdd)

  await saveToOss()
  emit('update', persons.value)

  toast.add({
    title: '人员导入成功',
    description: `新增 ${personsToAdd.length} 人，更新 ${newPersons.length - personsToAdd.length} 人`,
    color: 'success'
  })
}

// 暴露方法给父组件
defineExpose({
  loadData,
  importPersons,
  persons
})

// 初始化
onMounted(() => {
  loadData()
})
</script>
