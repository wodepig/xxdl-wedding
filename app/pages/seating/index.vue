<template>
  <div class="min-h-screen bg-gradient-to-br from-pink-100 via-purple-100 to-rose-100">
    <!-- 浮动爱心背景 -->
    <FloatingHearts />

    <div class="container mx-auto px-4 py-6 max-w-7xl relative z-10">
      <!-- 页面标题 -->
      <div class="text-center mb-8 pt-4">
        <div class="text-5xl mb-3">🪑</div>
        <h1 class="text-4xl md:text-5xl font-bold bg-gradient-to-r from-pink-500 via-rose-500 to-purple-500 bg-clip-text text-transparent mb-2">
          婚礼坐席安排
        </h1>
        <p class="text-gray-600">拖拽人员到圆桌分配座位，点击编辑宾客信息</p>
        <div class="mt-3 flex justify-center gap-2 text-2xl">
          <span>💺</span>
          <span>🍽️</span>
          <span>🥂</span>
        </div>
      </div>

      <!-- 统计信息 -->
      <UCard class="mb-6 rounded-3xl shadow-lg">
        <div class="flex flex-wrap justify-center gap-6 py-2">
          <div class="text-center">
            <div class="text-3xl font-bold text-pink-600">{{ tables.length }}</div>
            <div class="text-sm text-gray-500">圆桌数量</div>
          </div>
          <div class="text-center">
            <div class="text-3xl font-bold text-purple-600">{{ totalGuests }}</div>
            <div class="text-sm text-gray-500">已安排宾客</div>
          </div>
          <div class="text-center">
            <div class="text-3xl font-bold text-amber-600">{{ totalCapacity }}</div>
            <div class="text-sm text-gray-500">总座位数</div>
          </div>
          <div class="text-center">
            <div class="text-3xl font-bold text-green-600">{{ totalCapacity - totalGuests }}</div>
            <div class="text-sm text-gray-500">剩余空位</div>
          </div>
        </div>
      </UCard>

      <!-- 工具栏 -->
      <div class="flex flex-wrap justify-center gap-3 mb-6">
        <!-- 视角切换 -->
        <div class="flex items-center bg-white rounded-full shadow-md p-1">
          <button
            class="px-4 py-2 rounded-full text-sm font-medium transition-all"
            :class="viewMode === 'groom' ? 'bg-blue-500 text-white shadow-sm' : 'text-gray-600 hover:bg-gray-100'"
            @click="viewMode = 'groom'"
          >
            <UIcon name="i-lucide-user" class="inline w-4 h-4 mr-1" />
            男方视角
          </button>
          <button
            class="px-4 py-2 rounded-full text-sm font-medium transition-all"
            :class="viewMode === 'bride' ? 'bg-pink-500 text-white shadow-sm' : 'text-gray-600 hover:bg-gray-100'"
            @click="viewMode = 'bride'"
          >
            <UIcon name="i-lucide-user" class="inline w-4 h-4 mr-1" />
            女方视角
          </button>
        </div>

        <template v-if="isAdmin">
          <UButton
            color="primary"
            variant="solid"
            icon="i-lucide-plus-circle"
            @click="openAddTableModal"
          >
            添加圆桌
          </UButton>
          <UButton
            color="secondary"
            variant="soft"
            icon="i-lucide-download"
            @click="exportSeating"
          >
            导出配置
          </UButton>
          <UButton
            color="info"
            variant="soft"
            icon="i-lucide-upload"
            @click="openImportModal"
          >
            导入配置
          </UButton>
          <UButton
            color="error"
            variant="soft"
            icon="i-lucide-trash-2"
            @click="clearAllTables"
          >
            清空所有
          </UButton>
        </template>
      </div>

      <!-- 主内容区域：左侧人员列表 + 右侧坐席布局 -->
      <div class="flex flex-col lg:flex-row gap-6">
        <!-- 左侧人员列表 -->
        <div class="lg:w-80 flex-shrink-0">
          <PersonList
            ref="personListRef"
            :is-admin="isAdmin"
            @dragstart="onPersonDragStart"
            @update="onPersonsUpdate"
          />
        </div>

        <!-- 右侧坐席布局 -->
        <div class="flex-1">
          <UCard class="rounded-3xl shadow-lg overflow-hidden h-full">
            <template #header>
              <div class="flex items-center justify-between">
                <div class="flex items-center gap-2 text-xl font-semibold text-gray-800">
                  <UIcon name="i-lucide-layout-grid" class="text-pink-500" />
                  <span>宴会厅布局</span>
                </div>
                <UBadge color="primary" variant="soft">
                  {{ isAdmin ? '可编辑模式' : '只读模式' }}
                </UBadge>
              </div>
            </template>

            <!-- 拖拽画布 -->
            <div
              ref="canvasRef"
              class="relative w-full h-[600px] bg-gradient-to-br from-amber-50 to-orange-50 rounded-2xl overflow-hidden"
              @mousemove="onCanvasMouseMove"
              @mouseup="onCanvasMouseUp"
              @mouseleave="onCanvasMouseUp"
              @dragover="onCanvasDragOver"
              @drop="onCanvasDrop"
            >
          <!-- 网格背景 -->
          <div class="absolute inset-0 opacity-10" style="background-image: radial-gradient(#999 1px, transparent 1px); background-size: 20px 20px;" />

          <!-- 舞台/主席台标识 -->
          <div class="absolute top-4 left-1/2 -translate-x-1/2 px-8 py-2 bg-gradient-to-r from-red-500 to-pink-500 text-white rounded-full font-medium shadow-lg">
            🎊 舞台 / 主席台 🎊
          </div>

          <!-- 圆桌列表 -->
          <div
            v-for="table in tables"
            :key="table.id"
            class="absolute cursor-move select-none group"
            :style="{
              left: `${table.position.x}%`,
              top: `${table.position.y}%`,
              transform: 'translate(-50%, -50%)'
            }"
            @mousedown="(e) => onTableMouseDown(e, table)"
          >
            <!-- 宾客环绕展示 -->
            <div
              v-if="table.guests.length > 0"
              class="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 pointer-events-none"
            >
              <div
                v-for="(guest, index) in table.guests.slice(0, 12)"
                :key="guest.id"
                class="absolute left-1/2 top-1/2 pointer-events-auto"
                :style="getGuestPositionStyle(index, table.guests.length > 12 ? 12 : table.guests.length)"
              >
                <div
                  class="px-2 py-1 bg-white/95 backdrop-blur-sm rounded-full shadow-md text-xs font-medium whitespace-nowrap border border-gray-200/50 hover:scale-110 hover:shadow-lg transition-all cursor-default max-w-[80px] truncate"
                  :class="isAdmin ? 'text-blue-600' : 'text-gray-700'"
                  :title="getGuestTooltip(guest)"
                >
                  {{ getGuestDisplayName(guest) }}
                </div>
              </div>
              <!-- 超过12人显示 +N -->
              <div
                v-if="table.guests.length > 12"
                class="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"
                :style="{ transform: `translate(-50%, -50%) rotate(165deg) translateY(-88px) rotate(-165deg)` }"
              >
                <div class="px-2 py-1 bg-amber-100 rounded-full shadow-md text-xs font-bold text-amber-700">
                  +{{ table.guests.length - 12 }}
                </div>
              </div>
            </div>

            <!-- 圆桌 -->
            <div
              class="relative w-28 h-28 rounded-full shadow-xl transition-all duration-200 z-10"
              :class="[
                draggingTableId === table.id ? 'scale-110 shadow-2xl z-50' : 'hover:scale-105',
                getTableColorClass(table)
              ]"
            >
              <!-- 桌号 -->
              <div class="absolute inset-0 flex flex-col items-center justify-center text-white">
                <div class="text-sm font-bold truncate px-2 max-w-full">{{ table.name }}</div>
                <div class="text-xs opacity-90">{{ table.guests.length }}/{{ table.capacity }}人</div>
              </div>

              <!-- 操作按钮 -->
              <div v-if="isAdmin" class="absolute -top-2 -right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity z-20">
                <UButton
                  color="info"
                  variant="solid"
                  size="xs"
                  icon="i-lucide-pencil"
                  class="w-6 h-6 rounded-full shadow-md p-0"
                  @click.stop="editTable(table)"
                />
                <UButton
                  color="error"
                  variant="solid"
                  size="xs"
                  icon="i-lucide-trash-2"
                  class="w-6 h-6 rounded-full shadow-md p-0"
                  @click.stop="deleteTable(table.id)"
                />
              </div>

              <!-- 备注标记 -->
              <div v-if="table.remark" class="absolute -bottom-1 -right-1 z-20">
                <UIcon name="i-lucide-sticky-note" class="w-5 h-5 text-amber-500 bg-white rounded-full p-0.5 shadow" />
              </div>
            </div>

            <!-- 宾客详情悬浮卡片 -->
            <div
              v-if="table.guests.length > 0 || table.remark"
              class="absolute left-1/2 -translate-x-1/2 top-full mt-2 w-56 bg-white rounded-xl shadow-xl p-3 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50"
            >
              <div v-if="table.remark" class="mb-2 pb-2 border-b border-gray-100">
                <div class="text-xs text-gray-500 mb-1">备注</div>
                <div class="text-sm text-gray-700">{{ table.remark }}</div>
              </div>
              <div v-if="table.guests.length > 0">
                <div class="text-xs text-gray-500 mb-1">宾客名单 ({{ table.guests.length }}人)</div>
                <div class="max-h-40 overflow-y-auto space-y-2">
                  <div
                    v-for="guest in table.guests"
                    :key="guest.id"
                    class="p-2 bg-gray-50 rounded-lg"
                  >
                    <!-- 可编辑模式：显示姓名 + 称呼 + 删除按钮 -->
                    <template v-if="isAdmin">
                      <div class="flex items-start justify-between gap-2">
                        <div class="flex-1 min-w-0">
                          <div class="font-medium text-sm text-gray-800">{{ guest.name }}</div>
                          <div class="text-xs text-gray-500 mt-0.5">
                            <span v-if="guest.groomTitle" class="mr-2">男方: {{ guest.groomTitle }}</span>
                            <span v-if="guest.brideTitle">女方: {{ guest.brideTitle }}</span>
                          </div>
                          <div v-if="guest.remark" class="text-xs text-gray-400 mt-0.5">{{ guest.remark }}</div>
                        </div>
                        <UButton
                          color="error"
                          variant="ghost"
                          size="xs"
                          icon="i-lucide-x"
                          class="w-6 h-6 p-0 flex-shrink-0"
                          @click.stop="removeGuestFromTable(table.id, guest.id)"
                        />
                      </div>
                    </template>
                    <!-- 只读模式：根据视角显示称呼，不显示姓名 -->
                    <template v-else>
                      <div class="font-medium text-sm text-gray-800">{{ getGuestDisplayName(guest) }}</div>
                      <div v-if="guest.remark" class="text-xs text-gray-400 mt-0.5">{{ guest.remark }}</div>
                    </template>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- 空状态 -->
          <div v-if="tables.length === 0" class="absolute inset-0 flex flex-col items-center justify-center text-gray-400">
            <UIcon name="i-lucide-armchair" class="w-20 h-20 mb-4 opacity-50" />
            <p class="text-lg">暂无圆桌安排</p>
            <p v-if="isAdmin" class="text-sm mt-2">点击上方"添加圆桌"开始安排座位</p>
          </div>

          <!-- 拖拽提示 -->
          <div
            v-if="draggingPerson"
            class="absolute bottom-4 left-1/2 -translate-x-1/2 px-4 py-2 bg-pink-500 text-white rounded-full shadow-lg text-sm font-medium pointer-events-none"
          >
            拖拽到圆桌上进行分配
          </div>
        </div>
          </UCard>
        </div>
      </div>

      <!-- 图例说明 -->
      <div class="mt-6 flex flex-wrap justify-center gap-4 text-sm text-gray-600">
        <div class="flex items-center gap-2">
          <div class="w-4 h-4 rounded-full bg-gradient-to-br from-pink-400 to-pink-600" />
          <span>主桌</span>
        </div>
        <div class="flex items-center gap-2">
          <div class="w-4 h-4 rounded-full bg-gradient-to-br from-purple-400 to-purple-600" />
          <span>男方亲友</span>
        </div>
        <div class="flex items-center gap-2">
          <div class="w-4 h-4 rounded-full bg-gradient-to-br from-rose-400 to-rose-600" />
          <span>女方亲友</span>
        </div>
        <div class="flex items-center gap-2">
          <div class="w-4 h-4 rounded-full bg-gradient-to-br from-amber-400 to-amber-600" />
          <span>共同朋友</span>
        </div>
        <div class="flex items-center gap-2">
          <div class="w-4 h-4 rounded-full bg-gradient-to-br from-blue-400 to-blue-600" />
          <span>其他</span>
        </div>
      </div>
    </div>

    <!-- 添加/编辑圆桌对话框 -->
    <UModal v-model:open="showTableModal" :title="editingTable ? '编辑圆桌' : '添加圆桌'">
      <template #body>
        <UFormField label="桌号/名称" class="mb-3">
          <UInput
            v-model="tableForm.name"
            placeholder="例如：主桌、1号桌"
            icon="i-lucide-tag"
          />
        </UFormField>

        <UFormField label="容纳人数" class="mb-3">
          <UInput
            v-model.number="tableForm.capacity"
            type="number"
            min="1"
            max="20"
            placeholder="8"
            icon="i-lucide-users"
          />
        </UFormField>

        <UFormField label="圆桌类型" class="mb-3">
          <USelect
            v-model="tableForm.type"
            :items="tableTypeOptions"
            placeholder="选择类型"
          />
        </UFormField>

        <UFormField label="圆桌颜色" class="mb-3">
          <div class="grid grid-cols-5 gap-2">
            <button
              v-for="option in colorOptions"
              :key="option.value"
              type="button"
              class="w-10 h-10 rounded-full bg-gradient-to-br shadow-md transition-all hover:scale-110"
              :class="[
                option.color,
                tableForm.color === option.value ? 'ring-2 ring-offset-2 ring-gray-400 scale-110' : ''
              ]"
              :title="option.label"
              @click="tableForm.color = option.value"
            />
          </div>
          <div class="mt-2 flex items-center gap-2">
            <UCheckbox
              v-model="useDefaultColor"
              label="使用默认颜色"
            />
          </div>
        </UFormField>

        <UFormField label="圆桌备注" class="mb-3">
          <UTextarea
            v-model="tableForm.remark"
            placeholder="添加备注信息..."
            :rows="2"
          />
        </UFormField>

        <!-- 宾客列表（只读展示） -->
        <div class="mt-4 pt-4 border-t border-gray-200">
          <div class="flex items-center justify-between mb-3">
            <span class="font-medium text-gray-700">宾客名单</span>
            <UBadge size="sm" variant="soft" color="primary">
              {{ tableForm.guests.length }}/{{ tableForm.capacity }}
            </UBadge>
          </div>

          <div v-if="tableForm.guests.length > 0" class="space-y-2 max-h-64 overflow-y-auto">
            <div
              v-for="guest in tableForm.guests"
              :key="guest.id"
              class="p-3 bg-gray-50 rounded-lg"
            >
              <div class="flex items-center justify-between">
                <div class="flex-1 min-w-0">
                  <div class="font-medium text-gray-800 truncate">{{ guest.name }}</div>
                  <div class="text-xs text-gray-500 mt-0.5">
                    <span v-if="guest.groomTitle" class="mr-2">男方: {{ guest.groomTitle }}</span>
                    <span v-if="guest.brideTitle">女方: {{ guest.brideTitle }}</span>
                  </div>
                  <div v-if="guest.remark" class="text-xs text-gray-400 mt-0.5">{{ guest.remark }}</div>
                </div>
              </div>
            </div>
          </div>
          <div v-else class="text-center py-4 text-gray-400 text-sm">
            暂无宾客，请从左侧人员列表拖拽添加
          </div>
        </div>
      </template>

      <template #footer>
        <div class="flex justify-end gap-2">
          <UButton variant="ghost" @click="showTableModal = false">取消</UButton>
          <UButton color="primary" @click="saveTable">保存</UButton>
        </div>
      </template>
    </UModal>

    <!-- 导入配置对话框 -->
    <UModal v-model:open="showImportModal" title="导入坐席配置">
      <template #body>
        <p class="text-sm text-gray-600 mb-4">
          选择JSON配置文件导入，将覆盖现有所有圆桌数据
        </p>
        <UFormField label="选择文件" class="mb-3">
          <input
            ref="importFileInput"
            type="file"
            accept=".json"
            class="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-pink-50 file:text-pink-700 hover:file:bg-pink-100"
            @change="onImportFileChange"
          />
        </UFormField>
        <div v-if="importPreview.tables.length > 0" class="mt-4">
          <p class="text-sm font-medium text-gray-700 mb-2">
            预览: {{ importPreview.tables.length }} 桌，{{ importPreview.totalGuests }} 人
          </p>
        </div>
      </template>

      <template #footer>
        <div class="flex justify-end gap-2">
          <UButton variant="ghost" @click="showImportModal = false">取消</UButton>
          <UButton
            color="info"
            :disabled="importPreview.tables.length === 0"
            @click="applyImport"
          >
            确认导入
          </UButton>
        </div>
      </template>
    </UModal>

    <!-- 确认清空对话框 -->
    <UModal v-model:open="showClearConfirmModal" title="确认清空">
      <template #body>
        <p class="text-gray-700">
          确定要清空所有圆桌数据吗？此操作不可恢复。
        </p>
      </template>
      <template #footer>
        <div class="flex justify-end gap-2">
          <UButton variant="ghost" @click="showClearConfirmModal = false">取消</UButton>
          <UButton color="error" @click="confirmClearAll">确认清空</UButton>
        </div>
      </template>
    </UModal>
  </div>
</template>

<script setup lang="ts">
import type { RoundTable, TableGuest, SeatingLayout } from '../../../shared/types/seating'
import type { Person } from '../../../shared/types/person'

// 页面元数据
useHead({
  title: '婚礼坐席安排'
})

// 管理员权限
const { isAdmin } = useAdmin()
const toast = useToast()

// 状态
const tables = ref<RoundTable[]>([])
const showTableModal = ref(false)
const showImportModal = ref(false)
const showClearConfirmModal = ref(false)
const editingTable = ref<RoundTable | null>(null)
const importFileInput = ref<HTMLInputElement | null>(null)
const importPreview = ref<{ tables: RoundTable[]; totalGuests: number }>({ tables: [], totalGuests: 0 })
const ossUrl = ref<string>('')
const loading = ref(false)

// 视角模式：groom = 男方视角，bride = 女方视角
const viewMode = ref<'groom' | 'bride'>('groom')

// 拖拽相关
const canvasRef = ref<HTMLElement | null>(null)
const draggingTableId = ref<string | null>(null)
const dragStartPos = ref({ x: 0, y: 0 })
const dragStartMouse = ref({ x: 0, y: 0 })

// 人员列表相关
const personListRef = ref<InstanceType<typeof import('../../components/PersonList.vue').default> | null>(null)
const draggingPerson = ref<Person | null>(null)
const allPersons = ref<Person[]>([])

// 表单
const tableForm = reactive({
  name: '',
  capacity: 10,
  type: 'other',
  remark: '',
  color: '',
  guests: [] as TableGuest[]
})

// 圆桌类型选项
const tableTypeOptions = [
  { label: '主桌', value: 'main' },
  { label: '男方亲友', value: 'groom' },
  { label: '女方亲友', value: 'bride' },
  { label: '共同朋友', value: 'common' },
  { label: '其他', value: 'other' }
]

// 预设颜色选项
const colorOptions = [
  { label: '粉色', value: 'bg-gradient-to-br from-pink-400 to-pink-600', color: 'from-pink-400 to-pink-600' },
  { label: '紫色', value: 'bg-gradient-to-br from-purple-400 to-purple-600', color: 'from-purple-400 to-purple-600' },
  { label: '玫瑰', value: 'bg-gradient-to-br from-rose-400 to-rose-600', color: 'from-rose-400 to-rose-600' },
  { label: '琥珀', value: 'bg-gradient-to-br from-amber-400 to-amber-600', color: 'from-amber-400 to-amber-600' },
  { label: '蓝色', value: 'bg-gradient-to-br from-blue-400 to-blue-600', color: 'from-blue-400 to-blue-600' },
  { label: '绿色', value: 'bg-gradient-to-br from-emerald-400 to-emerald-600', color: 'from-emerald-400 to-emerald-600' },
  { label: '青色', value: 'bg-gradient-to-br from-cyan-400 to-cyan-600', color: 'from-cyan-400 to-cyan-600' },
  { label: '橙色', value: 'bg-gradient-to-br from-orange-400 to-orange-600', color: 'from-orange-400 to-orange-600' },
  { label: '红色', value: 'bg-gradient-to-br from-red-400 to-red-600', color: 'from-red-400 to-red-600' },
  { label: '靛蓝', value: 'bg-gradient-to-br from-indigo-400 to-indigo-600', color: 'from-indigo-400 to-indigo-600' }
]

// 计算属性
const totalGuests = computed(() => tables.value.reduce((sum: number, t: RoundTable) => sum + t.guests.length, 0))
const totalCapacity = computed(() => tables.value.reduce((sum: number, t: RoundTable) => sum + t.capacity, 0))
const useDefaultColor = computed({
  get: () => !tableForm.color,
  set: (val: boolean) => {
    if (val) tableForm.color = ''
  }
})

// 获取宾客名称预览
function getGuestNamesPreview(guests: TableGuest[]): string {
  if (guests.length === 0) return ''
  const names = guests.slice(0, 3).map(g => g.name).filter(Boolean)
  if (guests.length > 3) {
    return names.join('、') + ` 等${guests.length}人`
  }
  return names.join('、')
}

// 计算宾客环绕位置样式
function getGuestPositionStyle(index: number, total: number): Record<string, string> {
  // 将宾客均匀分布在圆桌周围，起始角度为 -90 度（正上方）
  const angleStep = 360 / total
  const angle = -90 + index * angleStep
  const radius = 75 // 距离圆桌中心的半径（像素）

  // 转换为弧度
  const radian = (angle * Math.PI) / 180

  // 计算位置
  const x = Math.cos(radian) * radius
  const y = Math.sin(radian) * radius

  return {
    transform: `translate(calc(-50% + ${x}px), calc(-50% + ${y}px))`
  }
}

// 获取宾客显示名称
function getGuestDisplayName(guest: TableGuest): string {
  // 可编辑模式下显示姓名
  if (isAdmin.value) {
    return guest.name || '未命名'
  }
  // 根据视角显示称呼
  if (viewMode.value === 'groom') {
    return guest.groomTitle || guest.name || '未命名'
  } else {
    return guest.brideTitle || guest.name || '未命名'
  }
}

// 获取宾客悬浮提示内容
function getGuestTooltip(guest: TableGuest): string {
  const parts: string[] = []

  // 可编辑模式下显示姓名
  if (isAdmin.value && guest.name) {
    parts.push(`姓名: ${guest.name}`)
  }

  // 显示称呼信息
  if (viewMode.value === 'groom' && guest.brideTitle) {
    parts.push(`女方称呼: ${guest.brideTitle}`)
  } else if (viewMode.value === 'bride' && guest.groomTitle) {
    parts.push(`男方称呼: ${guest.groomTitle}`)
  }

  // 显示备注
  if (guest.remark) {
    parts.push(`备注: ${guest.remark}`)
  }

  return parts.join('\n') || guest.name || '未命名'
}

// 获取圆桌颜色样式
function getTableColorClass(table: RoundTable): string {
  // 优先使用自定义颜色
  if (table.color) {
    return table.color
  }
  // 否则根据类型使用默认颜色
  const type = (table as unknown as { type?: string }).type || 'other'
  const colorMap: Record<string, string> = {
    main: 'bg-gradient-to-br from-pink-400 to-pink-600',
    groom: 'bg-gradient-to-br from-purple-400 to-purple-600',
    bride: 'bg-gradient-to-br from-rose-400 to-rose-600',
    common: 'bg-gradient-to-br from-amber-400 to-amber-600',
    other: 'bg-gradient-to-br from-blue-400 to-blue-600'
  }
  return colorMap[type] || 'bg-gradient-to-br from-blue-400 to-blue-600'
}

// 打开添加圆桌对话框
function openAddTableModal() {
  editingTable.value = null
  tableForm.name = ''
  tableForm.capacity = 10
  tableForm.type = 'other'
  tableForm.remark = ''
  tableForm.color = ''
  tableForm.guests = []
  showTableModal.value = true
}

// 编辑圆桌
function editTable(table: RoundTable) {
  editingTable.value = table
  tableForm.name = table.name
  tableForm.capacity = table.capacity
  tableForm.type = (table as any).type || 'other'
  tableForm.remark = table.remark || ''
  tableForm.color = table.color || ''
  tableForm.guests = JSON.parse(JSON.stringify(table.guests))
  showTableModal.value = true
}

// 保存圆桌
async function saveTable() {
  if (!tableForm.name) {
    toast.add({
      title: '请输入桌号',
      color: 'warning'
    })
    return
  }

  const tableData: RoundTable & { type?: string } = {
    id: editingTable.value?.id || `table-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    name: tableForm.name,
    capacity: tableForm.capacity,
    guests: tableForm.guests.filter((g: TableGuest) => g.name.trim()),
    remark: tableForm.remark,
    color: tableForm.color || undefined,
    position: editingTable.value?.position || {
      x: 20 + Math.random() * 60,
      y: 30 + Math.random() * 40
    },
    type: tableForm.type
  } as unknown as RoundTable

  if (editingTable.value) {
    const index = tables.value.findIndex((t: RoundTable) => t.id === editingTable.value!.id)
    if (index >= 0) {
      tables.value[index] = tableData as unknown as RoundTable
    }
  } else {
    tables.value.push(tableData as unknown as RoundTable)
  }

  await saveToStorage()
  showTableModal.value = false
  toast.add({
    title: editingTable.value ? '更新成功' : '添加成功',
    color: 'success'
  })
}

// 删除圆桌
async function deleteTable(id: string) {
  const index = tables.value.findIndex((t: RoundTable) => t.id === id)
  if (index >= 0) {
    // 将圆桌上的所有人员标记为未分配
    const table = tables.value[index]
    if (table) {
      for (const guest of table.guests) {
        await personListRef.value?.unassignPerson(guest.id)
      }
    }
    tables.value.splice(index, 1)
    await saveToStorage()
    toast.add({
      title: '删除成功',
      color: 'success'
    })
  }
}

// 从圆桌移除人员
async function removeGuestFromTable(tableId: string, guestId: string) {
  const table = tables.value.find((t: RoundTable) => t.id === tableId)
  if (!table) return

  const guestIndex = table.guests.findIndex((g: TableGuest) => g.id === guestId)
  if (guestIndex >= 0) {
    const guest = table.guests[guestIndex]
    if (guest) {
      table.guests.splice(guestIndex, 1)

      // 更新人员状态为未分配
      await personListRef.value?.unassignPerson(guestId)

      // 保存数据
      await saveToStorage()

      toast.add({
        title: '移除成功',
        description: `${guest.name} 已从 ${table.name} 移除`,
        color: 'success'
      })
    }
  }
}

// 拖拽开始
function onTableMouseDown(e: MouseEvent, table: RoundTable) {
  if (!isAdmin.value) return
  e.preventDefault()
  draggingTableId.value = table.id
  dragStartPos.value = { ...table.position }
  dragStartMouse.value = { x: e.clientX, y: e.clientY }
}

// 拖拽移动
function onCanvasMouseMove(e: MouseEvent) {
  if (!draggingTableId.value || !canvasRef.value) return

  const canvas = canvasRef.value
  const rect = canvas.getBoundingClientRect()

  const deltaX = e.clientX - dragStartMouse.value.x
  const deltaY = e.clientY - dragStartMouse.value.y

  const percentDeltaX = (deltaX / rect.width) * 100
  const percentDeltaY = (deltaY / rect.height) * 100

  const table = tables.value.find((t: RoundTable) => t.id === draggingTableId.value)
  if (table) {
    table.position.x = Math.max(5, Math.min(95, dragStartPos.value.x + percentDeltaX))
    table.position.y = Math.max(10, Math.min(90, dragStartPos.value.y + percentDeltaY))
  }
}

// 拖拽结束
async function onCanvasMouseUp() {
  if (draggingTableId.value) {
    draggingTableId.value = null
    await saveToStorage()
  }
}

// 从本地存储加载 OSS URL
function loadOssUrl() {
  try {
    const stored = localStorage.getItem('wedding-oss-config')
    if (stored) {
      const parsed = JSON.parse(stored)
      ossUrl.value = parsed.seating || ''
    }
  } catch (error) {
    console.error('加载OSS配置失败:', error)
  }
}

// 从 OSS 加载数据
async function loadData() {
  loading.value = true
  try {
    loadOssUrl()

    interface SeatingApiResponse {
      success: boolean
      data?: SeatingLayout
      error?: string
    }

    const response = await $fetch<SeatingApiResponse>('/api/seating', {
      query: ossUrl.value ? { url: ossUrl.value } : undefined
    })

    if (response.success && response.data) {
      tables.value = response.data.tables || []
    } else {
      tables.value = []
    }
  } catch (error) {
    console.error('加载数据失败:', error)
    toast.add({
      title: '加载失败',
      description: '无法加载坐席数据',
      color: 'error'
    })
    tables.value = []
  } finally {
    loading.value = false
  }
}

// 保存到 OSS
async function saveToStorage() {
  try {
    interface SeatingApiResponse {
      success: boolean
      data?: SeatingLayout
      error?: string
    }

    const response = await $fetch<SeatingApiResponse>('/api/seating', {
      method: 'PUT',
      body: {
        tables: tables.value,
        url: ossUrl.value
      }
    })

    if (!response.success) {
      throw new Error(response.error || '保存失败')
    }
  } catch (error) {
    console.error('保存失败:', error)
    toast.add({
      title: '保存失败',
      description: '无法保存到云端，请检查网络连接',
      color: 'error'
    })
  }
}

// 导出配置
function exportSeating() {
  const layout: SeatingLayout = {
    tables: tables.value,
    lastModified: new Date().toISOString()
  }

  const blob = new Blob([JSON.stringify(layout, null, 2)], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url

  const now = new Date()
  const timeStr = `${String(now.getHours()).padStart(2, '0')}-${String(now.getMinutes()).padStart(2, '0')}`
  link.download = `婚礼坐席_${timeStr}.json`

  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)

  toast.add({
    title: '导出成功',
    description: `已导出 ${tables.value.length} 桌，${totalGuests.value} 人`,
    color: 'success'
  })
}

// 打开导入对话框
function openImportModal() {
  importPreview.value = { tables: [], totalGuests: 0 }
  if (importFileInput.value) {
    importFileInput.value.value = ''
  }
  showImportModal.value = true
}

// 处理导入文件
function onImportFileChange(event: Event) {
  const target = event.target as HTMLInputElement
  const file = target.files?.[0]

  if (!file) {
    importPreview.value = { tables: [], totalGuests: 0 }
    return
  }

  const reader = new FileReader()
  reader.onload = (e) => {
    try {
      const content = e.target?.result as string
      const layout: SeatingLayout = JSON.parse(content)

      if (layout.tables && Array.isArray(layout.tables)) {
        const totalGuests = layout.tables.reduce((sum, t) => sum + (t.guests?.length || 0), 0)
        importPreview.value = { tables: layout.tables, totalGuests }
        toast.add({
          title: '文件读取成功',
          description: `找到 ${layout.tables.length} 桌，${totalGuests} 人`,
          color: 'success'
        })
      } else {
        throw new Error('Invalid format')
      }
    } catch (error) {
      toast.add({
        title: '文件格式错误',
        description: '请确保上传的是有效的坐席配置文件',
        color: 'error'
      })
      importPreview.value = { tables: [], totalGuests: 0 }
    }
  }
  reader.readAsText(file)
}

// 应用导入
async function applyImport() {
  tables.value = JSON.parse(JSON.stringify(importPreview.value.tables))
  await saveToStorage()
  showImportModal.value = false
  importPreview.value = { tables: [], totalGuests: 0 }
  toast.add({
    title: '导入成功',
    description: `已导入 ${tables.value.length} 桌`,
    color: 'success'
  })
}

// 清空所有
function clearAllTables() {
  showClearConfirmModal.value = true
}

// 确认清空
async function confirmClearAll() {
  tables.value = []
  await saveToStorage()
  showClearConfirmModal.value = false
  toast.add({
    title: '已清空',
    description: '所有圆桌数据已删除',
    color: 'success'
  })
}

// 人员列表拖拽相关
function onPersonDragStart(event: DragEvent, person: Person) {
  draggingPerson.value = person
}

function onPersonsUpdate(persons: Person[]) {
  allPersons.value = persons
}

function onCanvasDragOver(event: DragEvent) {
  event.preventDefault()
  event.dataTransfer!.dropEffect = 'move'
}

async function onCanvasDrop(event: DragEvent) {
  event.preventDefault()

  if (!draggingPerson.value || !canvasRef.value) return

  const person = draggingPerson.value
  const canvas = canvasRef.value
  const rect = canvas.getBoundingClientRect()

  // 计算鼠标在画布上的相对位置（百分比）
  const x = ((event.clientX - rect.left) / rect.width) * 100
  const y = ((event.clientY - rect.top) / rect.height) * 100

  // 查找最近的圆桌
  let nearestTable: RoundTable | null = null
  let minDistance = Infinity

  for (const table of tables.value) {
    const dx = table.position.x - x
    const dy = table.position.y - y
    const distance = Math.sqrt(dx * dx + dy * dy)

    // 距离小于15%画布宽度视为在圆桌附近
    if (distance < 15 && distance < minDistance) {
      minDistance = distance
      nearestTable = table
    }
  }

  if (nearestTable) {
    // 检查圆桌是否已满
    if (nearestTable.guests.length >= nearestTable.capacity) {
      toast.add({
        title: '该桌已满',
        description: `${nearestTable.name} 已达到最大容量 ${nearestTable.capacity} 人`,
        color: 'warning'
      })
      draggingPerson.value = null
      return
    }

    // 检查人员是否已在该桌
    const alreadyAssigned = nearestTable.guests.some(g => g.id === person.id)
    if (alreadyAssigned) {
      toast.add({
        title: '重复分配',
        description: `${person.name} 已经在 ${nearestTable.name}`,
        color: 'warning'
      })
      draggingPerson.value = null
      return
    }

    // 添加到圆桌
    nearestTable.guests.push({
      id: person.id,
      name: person.name,
      groomTitle: person.groomTitle,
      brideTitle: person.brideTitle,
      remark: person.remark
    })

    // 更新人员状态为已分配
    await personListRef.value?.assignPersonToTable(person.id, nearestTable.id)

    // 保存数据
    await saveToStorage()

    toast.add({
      title: '分配成功',
      description: `${person.name} 已分配到 ${nearestTable.name}`,
      color: 'success'
    })
  } else {
    toast.add({
      title: '未找到圆桌',
      description: '请将人员拖拽到圆桌附近',
      color: 'warning'
    })
  }

  draggingPerson.value = null
}

// 初始化
onMounted(() => {
  loadData()
})
</script>
