import { defineStore } from 'pinia'
import { ref, computed, watch } from 'vue'
import type { Question } from '../types'
import { parseQuestions } from '../utils/parser'
// @ts-ignore
import questionsPublicRaw from '../assets/公共题库.md?raw'
// @ts-ignore
import questionsProfessionalRaw from '../assets/专业题库.md?raw'

export const useQuizStore = defineStore('quiz', () => {
  const allQuestions = ref<Question[]>([])
  const currentQuestions = ref<Question[]>([])
  const currentIndex = ref(0)
  const userAnswers = ref<Record<string, string | string[]>>({})
  const answeredQuestions = ref<string[]>([]) // List of question IDs that have been answered correctly or incorrectly
  const wrongQuestions = ref<string[]>([])
  const questionStats = ref<Record<string, { correct: number, wrong: number }>>({})
  const showAnswer = ref(false)
  const isExamMode = ref(false)
  const isReviewMode = ref(false)
  const score = ref(0)
  const currentCategory = ref<string>('')

  const currentQuestion = computed(() => currentQuestions.value[currentIndex.value])
  const progress = computed(() => `${currentIndex.value + 1} / ${currentQuestions.value.length}`)
  
  const categories = computed(() => {
    const cats = new Set<string>()
    allQuestions.value.forEach(q => {
        if (q.category && q.category !== '未分类') cats.add(q.category)
    })
    return Array.from(cats)
  })

  const init = async () => {
    if (allQuestions.value.length === 0) {
        // Parse public questions
        console.log('Init: Parsing questions...')
        const publicQuestions = parseQuestions(questionsPublicRaw).map(q => ({
            ...q,
            source: 'public' as const,
            id: `pub-${q.id}` // Prefix ID to avoid collision
        }))

        // Parse professional questions
        const professionalQuestions = parseQuestions(questionsProfessionalRaw).map(q => ({
            ...q,
            source: 'professional' as const,
            id: `pro-${q.id}` // Prefix ID to avoid collision
        }))
        
        console.log('Public questions loaded:', publicQuestions.length)
        console.log('Professional questions loaded:', professionalQuestions.length)

        allQuestions.value = [...publicQuestions, ...professionalQuestions]
        
        // In development, try to load from server (file system)
        if (import.meta.env.DEV) {
            try {
                const res = await fetch('/api/data')
                if (res.ok) {
                    const data = await res.json()
                    wrongQuestions.value = data.wrongQuestions || []
                    answeredQuestions.value = data.answeredQuestions || []
                    questionStats.value = data.questionStats || {}
                    // Save practice index to store for later use
                    localStorage.setItem('serverPracticeIndex', data.practiceIndex?.toString() || '0')
                }
            } catch (e) {
                console.error('Failed to load data from server, falling back to localStorage', e)
            }
        }
        
        // Always load from localStorage as fallback or primary source in production
        const storedWrong = localStorage.getItem('wrongQuestions')
        if (storedWrong) {
            // Merge or overwrite? For now, if server failed or we are in prod, use local
            if (wrongQuestions.value.length === 0) {
                 wrongQuestions.value = JSON.parse(storedWrong)
            }
        }
        const storedAnswered = localStorage.getItem('answeredQuestions')
        if (storedAnswered) {
             if (answeredQuestions.value.length === 0) {
                 answeredQuestions.value = JSON.parse(storedAnswered)
             }
        }
        const storedStats = localStorage.getItem('questionStats')
        if (storedStats) {
             if (Object.keys(questionStats.value).length === 0) {
                 questionStats.value = JSON.parse(storedStats)
             }
        }
    }
  }

  const saveData = async () => {
      // In production, only localStorage is used (handled inside specific methods)
      // In dev, we try to sync with file
      if (import.meta.env.DEV) {
          try {
              await fetch('/api/data', {
                  method: 'POST',
                  headers: {
                      'Content-Type': 'application/json'
                  },
                  body: JSON.stringify({
                      wrongQuestions: wrongQuestions.value,
                      answeredQuestions: answeredQuestions.value,
                      practiceIndex: currentIndex.value,
                      questionStats: questionStats.value
                  }),
                  keepalive: true // Ensure request is sent even if page unloads
              })
          } catch (e) {
              console.error('Failed to save data to server', e)
          }
      }
  }

  const startCategoryPractice = async (category: string) => {
      await init()
      currentCategory.value = category
      currentQuestions.value = allQuestions.value.filter(q => q.category === category)
      currentIndex.value = 0
      showAnswer.value = false
      isExamMode.value = false
      isReviewMode.value = false
  }

  const startPractice = async () => {
    await init()
    currentCategory.value = ''
    currentQuestions.value = [...allQuestions.value]
    
    // Restore progress
    const serverIndex = localStorage.getItem('serverPracticeIndex')
    const localIndex = localStorage.getItem('practiceIndex')
    // Prefer server index if available and newer? Or just trust server?
    // Use the maximum of local and server index to ensure we don't lose progress
    // if one of them failed to update.
    const sIndex = serverIndex ? parseInt(serverIndex) : 0
    const lIndex = localIndex ? parseInt(localIndex) : 0
    const savedIndex = Math.max(sIndex, lIndex)
    
    // Validate savedIndex
    if (!isNaN(savedIndex) && savedIndex >= 0 && savedIndex < currentQuestions.value.length) {
        currentIndex.value = savedIndex
    } else {
        currentIndex.value = 0
    }
    
    // Check if current question has been answered before
    const q = currentQuestions.value[currentIndex.value]
    if (q && answeredQuestions.value.includes(q.id)) {
        // ...
    }

    showAnswer.value = false
    isExamMode.value = false
    isReviewMode.value = false
  }

  const startMockExam = () => {
      init()
      
      const selectQuestions = (type: string, count: number) => {
          const pubQs = allQuestions.value.filter(q => q.type === type && q.source === 'public')
          const proQs = allQuestions.value.filter(q => q.type === type && q.source === 'professional')
          
          const targetPubCount = Math.round(count * 0.7)
          const targetProCount = count - targetPubCount
          
          let selectedPub = [...pubQs].sort(() => 0.5 - Math.random()).slice(0, targetPubCount)
          let selectedPro = [...proQs].sort(() => 0.5 - Math.random()).slice(0, targetProCount)
          
          // Fill deficits
          if (selectedPub.length < targetPubCount) {
              const needed = targetPubCount - selectedPub.length
              const morePro = [...proQs].filter(q => !selectedPro.includes(q)).sort(() => 0.5 - Math.random()).slice(0, needed)
              selectedPro = [...selectedPro, ...morePro]
          }
          
          if (selectedPro.length < targetProCount) {
              const needed = targetProCount - selectedPro.length
              const morePub = [...pubQs].filter(q => !selectedPub.includes(q)).sort(() => 0.5 - Math.random()).slice(0, needed)
              selectedPub = [...selectedPub, ...morePub]
          }
          
          return [...selectedPub, ...selectedPro].sort(() => 0.5 - Math.random())
      }

      // Select 50 Single, 20 Multiple, 10 Judgment, 6 Case
      const singleQuestions = selectQuestions('single', 50)
      const multipleQuestions = selectQuestions('multiple', 20)
      const judgmentQuestions = selectQuestions('judgment', 10)
      const caseQuestions = selectQuestions('case', 6)
      
      const examQuestions = [
          ...singleQuestions,
          ...multipleQuestions,
          ...judgmentQuestions,
          ...caseQuestions
      ]

      currentQuestions.value = examQuestions
      currentIndex.value = 0
      userAnswers.value = {}
      showAnswer.value = false
      isExamMode.value = true
      isReviewMode.value = false
      score.value = 0
  }

  const startWrongCollection = () => {
      init()
      currentQuestions.value = allQuestions.value.filter(q => wrongQuestions.value.includes(q.id))
      currentIndex.value = 0
      showAnswer.value = false
      isExamMode.value = false
      isReviewMode.value = false
  }

  const submitAnswer = (answer: string | string[]) => {
      if (!currentQuestion.value) return

      userAnswers.value[currentQuestion.value.id] = answer
      
      if (!isExamMode.value) {
          showAnswer.value = true
          
          // Check correctness immediately for practice/wrong mode
          let isCorrect = false
          const correct = currentQuestion.value.answer
          
          if (Array.isArray(correct)) {
              if (Array.isArray(answer)) {
                  const sortedCorrect = [...correct].sort().join('')
                  const sortedAnswer = [...answer].sort().join('')
                  isCorrect = sortedCorrect === sortedAnswer
              }
          } else {
              isCorrect = correct === answer
          }

          // Update stats
          const stats = questionStats.value[currentQuestion.value.id] || { correct: 0, wrong: 0 }
          if (isCorrect) {
              stats.correct++
          } else {
              stats.wrong++
          }
          questionStats.value[currentQuestion.value.id] = stats
          localStorage.setItem('questionStats', JSON.stringify(questionStats.value))

          if (!isCorrect) {
              if (!wrongQuestions.value.includes(currentQuestion.value.id)) {
                  wrongQuestions.value.push(currentQuestion.value.id)
                  localStorage.setItem('wrongQuestions', JSON.stringify(wrongQuestions.value))
              }
          }
          
          // Mark as answered
          if (!answeredQuestions.value.includes(currentQuestion.value.id)) {
              answeredQuestions.value.push(currentQuestion.value.id)
              localStorage.setItem('answeredQuestions', JSON.stringify(answeredQuestions.value))
          }
          
          saveData()
      }
  }

  const submitExam = () => {
      isExamMode.value = false
      isReviewMode.value = true
      let correctCount = 0
      
      currentQuestions.value.forEach(q => {
          const uAns = userAnswers.value[q.id]
          let isCorrect = false
          if (uAns) {
              const correct = q.answer
              if (Array.isArray(correct)) {
              if (Array.isArray(uAns)) {
                  const sortedCorrect = [...correct].sort().join('')
                  const sortedAnswer = [...uAns].sort().join('')
                  isCorrect = sortedCorrect === sortedAnswer
              }
          } else {
                  isCorrect = correct === uAns
              }
          }
          
          if (isCorrect) {
              correctCount++
              const stats = questionStats.value[q.id] || { correct: 0, wrong: 0 }
              stats.correct++
              questionStats.value[q.id] = stats
          } else {
              const stats = questionStats.value[q.id] || { correct: 0, wrong: 0 }
              stats.wrong++
              questionStats.value[q.id] = stats

              if (!wrongQuestions.value.includes(q.id)) {
                  wrongQuestions.value.push(q.id)
              }
          }
      })
      
      localStorage.setItem('wrongQuestions', JSON.stringify(wrongQuestions.value))
      localStorage.setItem('questionStats', JSON.stringify(questionStats.value))
      saveData()
      score.value = correctCount
      showAnswer.value = true
  }

  const nextQuestion = () => {
      if (currentIndex.value < currentQuestions.value.length - 1) {
          currentIndex.value++
          
          if (isReviewMode.value) {
              showAnswer.value = true
          } else if (isExamMode.value) {
              showAnswer.value = false
          } else {
              const q = currentQuestions.value[currentIndex.value]
              showAnswer.value = q ? !!userAnswers.value[q.id] : false
          }
          
          if (!isExamMode.value && !isReviewMode.value && currentQuestions.value.length === allQuestions.value.length) {
              localStorage.setItem('practiceIndex', currentIndex.value.toString())
              saveData()
          }
      }
  }

  const prevQuestion = () => {
      if (currentIndex.value > 0) {
          currentIndex.value--
          
          if (isReviewMode.value) {
              showAnswer.value = true
          } else if (isExamMode.value) {
              showAnswer.value = false
          } else {
              const q = currentQuestions.value[currentIndex.value]
              showAnswer.value = q ? !!userAnswers.value[q.id] : false
          }
          
          if (!isExamMode.value && !isReviewMode.value && currentQuestions.value.length === allQuestions.value.length) {
              localStorage.setItem('practiceIndex', currentIndex.value.toString())
              saveData()
          }
      }
  }
  
  const jumpToQuestion = (index: number) => {
      if (index >= 0 && index < currentQuestions.value.length) {
          currentIndex.value = index
          
          if (isReviewMode.value) {
              showAnswer.value = true
          } else if (isExamMode.value) {
              showAnswer.value = false
          } else {
              const q = currentQuestions.value[currentIndex.value]
              showAnswer.value = q ? !!userAnswers.value[q.id] : false
          }
          
          if (!isExamMode.value && !isReviewMode.value && currentQuestions.value.length === allQuestions.value.length) {
              localStorage.setItem('practiceIndex', currentIndex.value.toString())
              saveData()
          }
      }
  }

  const toggleShowAnswer = () => {
      showAnswer.value = !showAnswer.value
  }

  const removeWrongQuestion = (questionId: string) => {
      wrongQuestions.value = wrongQuestions.value.filter(id => id !== questionId)
      localStorage.setItem('wrongQuestions', JSON.stringify(wrongQuestions.value))
      
      // If we are in wrong collection mode, we need to update currentQuestions
      // Note: we don't change currentIndex here to avoid jarring UI changes, 
      // but we need to make sure we don't go out of bounds if it was the last question
      if (currentQuestions.value.some(q => q.id === questionId)) {
          // Find index of removed question
          const idx = currentQuestions.value.findIndex(q => q.id === questionId)
          
          currentQuestions.value = currentQuestions.value.filter(q => q.id !== questionId)
          
          // Adjust currentIndex if necessary
          if (currentIndex.value >= currentQuestions.value.length) {
              currentIndex.value = Math.max(0, currentQuestions.value.length - 1)
          } else if (idx < currentIndex.value) {
              // If we removed a question before the current one, decrement index
              currentIndex.value--
          }
      }
      
      saveData()
  }

  // Auto-save when index changes (debounced slightly if needed, but direct save is safer for now)
  watch(currentIndex, () => {
      if (!isExamMode.value && !isReviewMode.value && currentQuestions.value.length === allQuestions.value.length) {
          localStorage.setItem('practiceIndex', currentIndex.value.toString())
          saveData()
      }
  })

  return {
      allQuestions,
      currentQuestions,
      currentIndex,
      currentQuestion,
      userAnswers,
      answeredQuestions,
      wrongQuestions,
      questionStats,
      showAnswer,
      isExamMode,
      isReviewMode,
      score,
      categories,
      currentCategory,
      progress,
      init,
      startPractice,
      startCategoryPractice,
      startMockExam,
      startWrongCollection,
      submitAnswer,
      submitExam,
      nextQuestion,
      prevQuestion,
      jumpToQuestion,
      toggleShowAnswer,
      removeWrongQuestion
  }
})
