<script setup lang="ts">
import { onMounted } from 'vue'
import { useQuizStore } from '../stores/quiz'
import { storeToRefs } from 'pinia'
import QuestionCard from '../components/QuestionCard.vue'
import { ArrowLeft, ArrowRight, Home } from 'lucide-vue-next'
import { useRouter } from 'vue-router'

const store = useQuizStore()
const router = useRouter()
const { currentQuestion, currentIndex, currentQuestions, userAnswers, showAnswer, progress, isReviewMode, score } = storeToRefs(store)

onMounted(() => {
  store.startMockExam()
})

const goHome = () => {
  if (isReviewMode.value) {
      router.push('/')
      return
  }
  if (confirm('确定要退出模拟考试吗？进度将不会保存。')) {
      router.push('/')
  }
}

const handleSubmitExam = () => {
    if (confirm('确定要交卷吗？')) {
        store.submitExam()
    }
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
        <h1 class="text-lg font-semibold text-gray-800">
            {{ isReviewMode ? '考试结果' : '模拟考试' }}
        </h1>
      </div>
      <div class="flex items-center space-x-4">
          <div v-if="isReviewMode" class="text-green-600 font-bold text-lg">
              得分: {{ score }}
          </div>
          <div class="text-gray-600 font-medium">
            {{ progress }}
          </div>
      </div>
    </header>

    <!-- Main Content -->
    <main class="flex-1 flex flex-col items-center p-4 overflow-y-auto">
      <QuestionCard 
        v-if="currentQuestion"
        :question="currentQuestion"
        :user-answer="userAnswers[currentQuestion.id]"
        :show-answer="showAnswer"
        @submit="store.submitAnswer"
      />
      
      <div v-else class="text-center mt-20 text-gray-500">
        加载中...
      </div>
    </main>

    <!-- Footer / Navigation -->
    <footer class="bg-white border-t p-4 flex justify-between items-center sticky bottom-0">
      <button 
        @click="store.prevQuestion"
        :disabled="currentIndex === 0"
        class="flex items-center px-4 py-2 text-gray-700 hover:bg-gray-50 rounded-lg disabled:opacity-50"
      >
        <ArrowLeft class="w-5 h-5 mr-2" />
        上一题
      </button>
      
      <button 
        v-if="!isReviewMode"
        @click="handleSubmitExam"
        class="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 font-medium shadow-sm"
      >
        交卷
      </button>
      <div v-else class="text-gray-500 text-sm">
          考试已结束
      </div>

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
