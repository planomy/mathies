import type { Question } from '../types';

export function getQuestionText(question: Question): string {
  if (question.kind === 'drill') {
    return `${question.a} ${question.operation} ${question.b} =`;
  }
  return question.prompt;
}

export function formatAnswer(question: Question): string {
  if (question.kind === 'drill') {
    return String(question.answer);
  }
  return question.answer;
}
