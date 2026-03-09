<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useQuizStore } from '../stores/quiz'
import { storeToRefs } from 'pinia'

const router = useRouter()
const store = useQuizStore()
const { categories } = storeToRefs(store)
const showCategoryModal = ref(false)

onMounted(() => {
    // Ensure categories are loaded
    store.init()
})

const startPractice = () => {
  router.push('/practice')
}

const openCategoryModal = () => {
    showCategoryModal.value = true
}

const startCategoryPractice = (category: string) => {
    router.push({ path: '/practice', query: { category } })
}

const startMockExam = () => {
  router.push('/mock-exam')
}

const viewWrongQuestions = () => {
  router.push('/wrong-questions')
}
</script>

<template>
  <div class="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-4">
    <h1 class="text-4xl font-bold mb-8 text-blue-600">驾考刷题宝典</h1>
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 w-full max-w-6xl">
      <div 
        @click="startPractice"
        class="bg-white p-8 rounded-xl shadow-lg hover:shadow-xl transition-shadow cursor-pointer flex flex-col items-center text-center"
      >
        <div class="text-6xl mb-4">📚</div>
        <h2 class="text-2xl font-semibold mb-2">顺序练习</h2>
        <p class="text-gray-500">按照题库顺序逐一练习，打牢基础</p>
      </div>

      <div 
        @click="openCategoryModal"
        class="bg-white p-8 rounded-xl shadow-lg hover:shadow-xl transition-shadow cursor-pointer flex flex-col items-center text-center"
      >
        <div class="text-6xl mb-4">📑</div>
        <h2 class="text-2xl font-semibold mb-2">分类练习</h2>
        <p class="text-gray-500">按章节/模块专项突破</p>
      </div>
      
      <div 
        @click="startMockExam"
        class="bg-white p-8 rounded-xl shadow-lg hover:shadow-xl transition-shadow cursor-pointer flex flex-col items-center text-center"
      >
        <div class="text-6xl mb-4">📝</div>
        <h2 class="text-2xl font-semibold mb-2">模拟考试</h2>
        <p class="text-gray-500">全真模拟考试环境，检测学习成果</p>
      </div>
      
      <div 
        @click="viewWrongQuestions"
        class="bg-white p-8 rounded-xl shadow-lg hover:shadow-xl transition-shadow cursor-pointer flex flex-col items-center text-center"
      >
        <div class="text-6xl mb-4">❌</div>
        <h2 class="text-2xl font-semibold mb-2">错题本</h2>
        <p class="text-gray-500">自动记录做错题目，重点攻克薄弱项</p>
      </div>
    </div>

    <!-- Category Modal -->
    <div v-if="showCategoryModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4" @click.self="showCategoryModal = false">
        <div class="bg-white rounded-xl p-6 max-w-2xl w-full max-h-[80vh] overflow-y-auto">
            <div class="flex justify-between items-center mb-4">
                <h3 class="text-xl font-bold">选择分类</h3>
                <button @click="showCategoryModal = false" class="text-gray-500 hover:text-gray-700">
                    ✕
                </button>
            </div>
            <div class="grid grid-cols-1 gap-3">
                <button 
                    v-for="cat in categories" 
                    :key="cat"
                    @click="startCategoryPractice(cat)"
                    class="text-left p-4 rounded-lg border hover:bg-blue-50 hover:border-blue-200 transition-colors"
                >
                    {{ cat }}
                </button>
                <div v-if="categories.length === 0" class="text-center py-8 text-gray-500">
                    暂无分类数据
                </div>
            </div>
        </div>
    </div>
  </div>
</template>
