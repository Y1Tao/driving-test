
import { parseQuestions } from './src/utils/parser';

const text = `
第一部分 法律法规、规章制度和标准规范 
 一、单选题 
 1.题干：根据《中华人民共和国安全生产法》，从业人员在（  ）以下的非高危行业的生产经营单位，可以不设置安全生产管理机构，但至少应配备兼职的安全生产管理人员。 
 A. 100人 
 B. 200人 
 C. 500人 
 D. l000人 
 答案：A 
 
 2.题干：根据《中华人民共和国安全生产法》，国家规定的高危行业、领域的生产经营单位，应当投保（  ）。 
 A. 产品责任保险 
 B. 安全生产责任保险 
 C. 火灾公众责任保险 
 D. 环境污染责任保险 
 答案：B 
`;

console.log('Testing parser with sample text...');
const questions = parseQuestions(text);
console.log('Parsed questions count:', questions.length);
if (questions.length > 0) {
    console.log('First question:', JSON.stringify(questions[0], null, 2));
} else {
    console.log('No questions parsed.');
}
