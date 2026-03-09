<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useQuizStore } from '../stores/quiz'
import { storeToRefs } from 'pinia'
import QuestionCard from '../components/QuestionCard.vue'
import { ArrowLeft, ArrowRight, Home } from 'lucide-vue-next'
import { useRouter, useRoute } from 'vue-router'

const store = useQuizStore()
const router = useRouter()
const route = useRoute()
const { currentQuestion, currentIndex, currentQuestions, userAnswers, showAnswer, progress, answeredQuestions, currentCategory } = storeToRefs(store)

const showJumpInput = ref(false)
const jumpTarget = ref('')

onMounted(() => {
    const category = route.query.category as string
    if (category) {
        store.startCategoryPractice(category)
    } else {
        store.startPractice()
    }
})

const goHome = () => {
  router.push('/')
}

const toggleJumpInput = () => {
    showJumpInput.value = !showJumpInput.value
    if (showJumpInput.value) {
        jumpTarget.value = (currentIndex.value + 1).toString()
    }
}

const handleJump = () => {
    const target = parseInt(jumpTarget.value)
    if (!isNaN(target) && target >= 1 && target <= currentQuestions.value.length) {
        store.jumpToQuestion(target - 1)
        showJumpInput.value = false
    } else {
        alert(`请输入 1 到 ${currentQuestions.value.length} 之间的数字`)
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
        <h1 class="text-lg font-semibold text-gray-800">{{ currentCategory || '顺序练习' }}</h1>
      </div>
      <div class="flex items-center space-x-2">
        <div class="relative">
            <button @click="toggleJumpInput" class="text-gray-600 font-medium hover:text-blue-600 flex items-center">
                {{ progress }}
                <span class="ml-1 text-xs opacity-50">▼</span>
            </button>
            
            <!-- Jump Input Popover -->
            <div v-if="showJumpInput" class="absolute top-full right-0 mt-2 bg-white shadow-lg rounded-lg p-3 border border-gray-100 z-20 w-48">
                <div class="flex items-center space-x-2">
                    <input 
                        v-model="jumpTarget" 
                        type="number" 
                        class="w-full border rounded px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        @keyup.enter="handleJump"
                        placeholder="题号"
                    />
                    <button @click="handleJump" class="bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700">
                        GO
                    </button>
                </div>
            </div>
        </div>
        <div v-if="currentQuestion && answeredQuestions.includes(currentQuestion.id)" class="px-2 py-0.5 text-xs font-medium text-green-700 bg-green-100 rounded-full">
            已做
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
