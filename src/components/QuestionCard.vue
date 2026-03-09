<script setup lang="ts">
import { ref, watch, computed } from 'vue'
import type { Question } from '../types'
import { CheckCircle, XCircle } from 'lucide-vue-next'

const props = defineProps<{
  question: Question
  userAnswer?: string | string[]
  showAnswer: boolean
}>()

const emit = defineEmits<{
  (e: 'submit', answer: string | string[]): void
}>()

const isUserCorrect = computed(() => {
    if (!props.userAnswer) return false
    
    const correctArr = Array.isArray(props.question.answer) 
        ? props.question.answer 
        : [props.question.answer]
        
    const answerArr = Array.isArray(props.userAnswer) 
        ? props.userAnswer 
        : [props.userAnswer]

    if (correctArr.length !== answerArr.length) return false
    
    const sortedCorrect = [...correctArr].sort().join('')
    const sortedAnswer = [...answerArr].sort().join('')
    
    return sortedCorrect === sortedAnswer
})

// For multiple choice, we need local state to track selection before submit
const localSelected = ref<string[]>([])

watch(() => props.question.id, () => {
  localSelected.value = []
})

const getLabel = (option: string): string => {
    const match = option.match(/^([A-F])[.、]/);
    return match ? match[1]! : option;
}

const toggleOption = (option: string) => {
  if (props.showAnswer) return
  
  const label = getLabel(option)
  
  if (props.question.type === 'multiple' || props.question.type === 'case') {
    if (localSelected.value.includes(label)) {
      localSelected.value = localSelected.value.filter(l => l !== label)
    } else {
      localSelected.value.push(label)
    }
  } else {
    emit('submit', label)
  }
}

const submitMultiple = () => {
  emit('submit', localSelected.value)
}

const isSelected = (option: string) => {
  const label = getLabel(option)
  if (props.question.type === 'multiple' || props.question.type === 'case') {
     if (props.showAnswer && props.userAnswer) {
         const answer = Array.isArray(props.userAnswer) ? props.userAnswer : [props.userAnswer]
         return answer.includes(label)
     }
     return localSelected.value.includes(label)
  }
  return props.userAnswer === label
}

const getOptionClass = (option: string) => {
  const label = getLabel(option)
  const base = "p-4 border rounded-lg cursor-pointer transition-colors flex items-center justify-between mb-3"
  const selectedClass = "border-blue-500 bg-blue-50 text-blue-700"
  const correctClass = "border-green-500 bg-green-50 text-green-700"
  const wrongClass = "border-red-500 bg-red-50 text-red-700"
  
  const isSel = isSelected(option)
  
  if (!props.showAnswer) {
    return isSel ? `${base} ${selectedClass}` : `${base} hover:bg-gray-50`
  }
  
  const correctAnswers = Array.isArray(props.question.answer) ? props.question.answer : [props.question.answer]
  const isCorrect = correctAnswers.includes(label)
  
  if (isCorrect) return `${base} ${correctClass}`
  if (isSel && !isCorrect) return `${base} ${wrongClass}`
  
  return `${base} opacity-60`
}
</script>

<template>
  <div class="bg-white rounded-xl shadow-md p-6 max-w-2xl w-full">
    <div class="mb-4">
      <span class="inline-block px-3 py-1 text-sm font-semibold rounded-full bg-gray-100 text-gray-600 mb-2">
        {{ question.type === 'single' ? '单选题' : question.type === 'multiple' ? '多选题' : question.type === 'judgment' ? '判断题' : '案例题' }}
      </span>
      <h3 class="text-xl font-medium leading-relaxed whitespace-pre-line">{{ question.content }}</h3>
    </div>
    
    <div class="space-y-3">
      <div 
        v-for="option in question.options" 
        :key="option"
        @click="toggleOption(option)"
        :class="getOptionClass(option)"
      >
        <span>{{ option }}</span>
        <div v-if="showAnswer" class="flex items-center gap-2">
           <span v-if="isSelected(option)" class="text-xs font-bold px-2 py-0.5 rounded bg-white bg-opacity-50 border border-opacity-20">
                你的选择
           </span>
           <CheckCircle v-if="getOptionClass(option).includes('border-green-500')" class="w-5 h-5 text-green-600" />
           <XCircle v-if="getOptionClass(option).includes('border-red-500')" class="w-5 h-5 text-red-600" />
        </div>
      </div>
    </div>

    <div v-if="(question.type === 'multiple' || question.type === 'case') && !showAnswer" class="mt-6 text-center">
      <button 
        @click="submitMultiple"
        :disabled="localSelected.length === 0"
        class="px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
      >
        提交答案
      </button>
    </div>
    
    <div v-if="showAnswer" class="mt-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
      <div class="mb-2 font-bold text-lg" :class="isUserCorrect ? 'text-green-600' : 'text-red-600'">
        {{ isUserCorrect ? '回答正确' : '回答错误' }}
      </div>
      <p class="font-semibold text-gray-700">
        正确答案：
        <span class="text-green-600">
          {{ Array.isArray(question.answer) ? question.answer.join('') : question.answer }}
        </span>
      </p>
    </div>
  </div>
</template>
