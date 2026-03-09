<script setup lang="ts">
import { onMounted, computed } from 'vue'
import { useQuizStore } from '../stores/quiz'
import { storeToRefs } from 'pinia'
import QuestionCard from '../components/QuestionCard.vue'
import { ArrowLeft, ArrowRight, Home, Trash2 } from 'lucide-vue-next'
import { useRouter } from 'vue-router'

const store = useQuizStore()
const router = useRouter()
const { currentQuestion, currentIndex, currentQuestions, userAnswers, showAnswer, progress, questionStats } = storeToRefs(store)

const currentStats = computed(() => {
  if (!currentQuestion.value || !questionStats.value[currentQuestion.value.id]) return null
  return questionStats.value[currentQuestion.value.id]
})

const removeQuestion = () => {
    if (currentQuestion.value) {
        if (confirm('确定要移除这道错题吗？')) {
            store.removeWrongQuestion(currentQuestion.value.id)
        }
    }
}

onMounted(() => {
  store.startWrongCollection()
})

const goHome = () => {
  router.push('/')
}
</script>

<template>
  <div class="min-h-screen bg-gray-100 flex flex-col">
    <!-- Header -->
    <header class="bg-white shadow-sm px-4 py-3 flex items-center justify-between sticky top-0 z-10">
      <div class="flex items-center space-x-4">
        <button @click="goHome" class="p-2 hover:bg-gray-100 rounded-full">
          <Home class="w-6 h-6 text-gray-600" />
        </button>
        <h1 class="text-lg font-semibold text-gray-800">错题本</h1>
      </div>
      <div v-if="currentQuestions.length > 0" class="text-gray-600 font-medium">
        {{ progress }}
      </div>
    </header>

    <!-- Main Content -->
    <main class="flex-1 flex flex-col items-center p-4 overflow-y-auto">
      <div v-if="currentQuestions.length === 0" class="mt-20 text-center">
          <div class="text-6xl mb-4">🎉</div>
          <h2 class="text-xl font-bold text-gray-700 mb-2">太棒了！</h2>
          <p class="text-gray-500">目前没有错题记录，继续保持！</p>
          <button @click="goHome" class="mt-6 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
              返回首页
          </button>
      </div>
      
      <div v-else-if="currentQuestion" class="w-full max-w-2xl flex flex-col items-center">
          <div v-if="currentStats" class="w-full mb-4 text-sm text-gray-500 bg-white px-4 py-3 rounded-lg shadow-sm flex justify-between items-center">
              <div>
                  <span class="mr-3">做错次数: <span class="text-red-500 font-bold">{{ currentStats.wrong }}</span></span>
                  <span>总练习次数: {{ currentStats.correct + currentStats.wrong }}</span>
              </div>
              <div class="font-medium">
                  错误率: <span class="text-red-600">{{ ((currentStats.wrong / (currentStats.correct + currentStats.wrong)) * 100).toFixed(0) }}%</span>
              </div>
          </div>

          <QuestionCard 
            :question="currentQuestion"
            :user-answer="userAnswers[currentQuestion.id]"
            :show-answer="showAnswer"
            @submit="store.submitAnswer"
          />
          
          <div class="mt-6">
            <button 
                @click="removeQuestion" 
                class="px-5 py-2.5 text-red-600 bg-red-50 hover:bg-red-100 rounded-lg transition-colors flex items-center gap-2 text-sm font-medium border border-red-100"
            >
                <Trash2 class="w-4 h-4" />
                移除此题
            </button>
          </div>
      </div>
    </main>

    <!-- Footer / Navigation -->
    <footer v-if="currentQuestions.length > 0" class="bg-white border-t p-4 flex justify-between items-center sticky bottom-0">
      <button 
        @click="store.prevQuestion"
        :disabled="currentIndex === 0"
        class="flex items-center px-4 py-2 text-gray-700 hover:bg-gray-50 rounded-lg disabled:opacity-50"
      >
        <ArrowLeft class="w-5 h-5 mr-2" />
        上一题
      </button>
      
      <button 
        @click="store.toggleShowAnswer"
        class="text-blue-600 hover:text-blue-800 font-medium"
      >
        {{ showAnswer ? '隐藏答案' : '查看答案' }}
      </button>

      <button 
        @click="store.nextQuestion"
        :disabled="currentIndex === currentQuestions.length - 1"
        class="flex items-center px-4 py-2 text-gray-700 hover:bg-gray-50 rounded-lg disabled:opacity-50"
      >
        下一题
        <ArrowRight class="w-5 h-5 ml-2" />
      </button>
    </footer>
  </div>
</template>
