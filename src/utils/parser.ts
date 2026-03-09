import type { Question, QuestionType } from '../types';

export const parseQuestions = (text: string): Question[] => {
  const lines = text.split('\n');
  const questions: Question[] = [];
  let currentSection: QuestionType = 'single';
  let currentCategory = '未分类';
  let currentQuestion: Partial<Question> | null = null;
  let questionIndex = 1;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]?.trim();
    if (!line) continue;

    // Detect category (e.g. "第一部分 ...")
    if (/^第[一二三四五六七八九十]+部分/.test(line)) {
        currentCategory = line;
        continue;
    }

    // Detect section
    if (line.startsWith('一、') || line.startsWith('单选题')) {
      currentSection = 'single';
      continue;
    } else if (line.startsWith('二、') || line.startsWith('多选题')) {
      currentSection = 'multiple';
      continue;
    } else if (line.startsWith('三、') || line.startsWith('判断题')) {
      currentSection = 'judgment';
      continue;
    } else if (line.startsWith('四、') || line.startsWith('案例题')) {
      currentSection = 'case';
      continue;
    }

    // Detect new question
    // Check for "题干：" at start, or "1、题干：" or "1.题干：" or "1. 题干："
    // Also support missing "题干：" if it starts with a number (e.g. "106.根据...")
    if (line.startsWith('题干：') || /^\d+[.、．]\s*(?:题干：)?/.test(line)) {
      if (currentQuestion) {
        // If judgment question has no options, add default options
        if (currentQuestion.type === 'judgment' && (!currentQuestion.options || currentQuestion.options.length === 0)) {
           currentQuestion.options = ['正确', '错误'];
        }
        questions.push(currentQuestion as Question);
      }
      
      const content = line.replace(/^\d+[.、．]\s*/, '').replace('题干：', '').trim();
      currentQuestion = {
        id: `q-${questionIndex}`,
        index: questionIndex++,
        type: currentSection,
        category: currentCategory,
        content,
        options: [],
        answer: '',
      };
      continue;
    }

    // Detect options and answer
    if (currentQuestion) {
      // Detect answer line
      // Support both full-width '：' and half-width ':'
      const answerMatch = line.match(/^(?:答案|正确答案)[:：]\s*(.*)$/);
      if (answerMatch) {
        let answerStr = answerMatch[1].trim();
        
        // Remove trailing punctuation
        answerStr = answerStr.replace(/[。．.]$/, '');
        
        if (currentSection === 'multiple' || currentSection === 'case') {
             // Split 'AB' into ['A', 'B']
             currentQuestion.answer = answerStr.split('').filter(c => /[A-Z]/.test(c));
        } else {
            currentQuestion.answer = answerStr;
        }
        continue;
      }

      // Check for options
      // Use exec loop for better compatibility and robustness
      // Updated regex to handle "A、" at start of line more robustly, and also check for simple "A " if needed?
      // But standard format is A、 or A. or A．
      // Also handle malformed options like "D特种..." (missing dot)
      const regex = /^\s*([A-F])(?:[.、．]|\s+|(?=[\u4e00-\u9fa5]))\s*/;
      let matches: {label: string, index: number, length: number}[] = [];
      
      const startMatch = line.match(regex);
      if (startMatch && startMatch.index !== undefined) {
          matches.push({
              label: startMatch[1],
              index: 0,
              length: startMatch[0].length
          });
      }

      // Check for subsequent options in the same line or other options if not started with one (though structure implies options start new lines or follow)
      // Actually, the previous regex was global and found all matches.
      // The issue with global regex is it might match "A." inside text.
      // We should only match if it looks like an option structure.
      // Typically: Start of line OR preceded by whitespace.
      
      const globalRegex = /(?:^|\s)([A-F])[.、．]/g;
      let match;
      while ((match = globalRegex.exec(line)) !== null) {
          // Calculate true start index of the option label
          const isSpaceStart = match[0].startsWith(' ');
          const matchStartIndex = match.index + (isSpaceStart ? 1 : 0);
          
          // Avoid duplicates if we handled startMatch (which handles index 0)
          if (matchStartIndex === 0 && startMatch) continue;
          
          matches.push({
              label: match[1],
              index: matchStartIndex,
              length: match[0].length
          });
      }
      
      // Sort matches by index
      matches.sort((a, b) => a.index - b.index);

      if (matches.length > 0) {
        for (let j = 0; j < matches.length; j++) {
            const match = matches[j];
            const optionLabel = match.label; 
            const startIndex = match.index;
            const nextMatch = matches[j+1];
            const endIndex = nextMatch ? nextMatch.index : line.length;
            
            const optionContent = line.slice(startIndex + match.length, endIndex).trim();
            // Store as "A. content"
            currentQuestion.options?.push(`${optionLabel}. ${optionContent}`);
        }
      } else {
         // Continuation lines
         if (currentQuestion.options && currentQuestion.options.length > 0 && !currentQuestion.answer) {
             const lastOptionIndex = currentQuestion.options.length - 1;
             currentQuestion.options[lastOptionIndex] += ' ' + line;
         } else if (currentQuestion.options && currentQuestion.options.length === 0 && !currentQuestion.answer) {
             currentQuestion.content += '\n' + line;
         }
      }
    }
  }

  // Push last question
  if (currentQuestion) {
    if (currentQuestion.type === 'judgment' && (!currentQuestion.options || currentQuestion.options.length === 0)) {
        currentQuestion.options = ['正确', '错误'];
    }
    questions.push(currentQuestion as Question);
  }

  return questions;
};
