import { Exam, UserExamAnswers, ExamResultSummary, PartIIScoreBreakdown } from '../types/exam';

export type ScoringMethod = 'user_custom' | 'moet_standard';

/**
 * Tính điểm cho 1 câu hỏi đúng/sai gồm 4 ý theo quy tắc chuẩn Bộ GD&ĐT:
 *   + Đúng 1 ý: 0.1 điểm
 *   + Đúng 2 ý: 0.25 điểm
 *   + Đúng 3 ý: 0.5 điểm
 *   + Đúng 4 ý: 1.0 điểm
 */
export function calculatePartIIQuestionScore(
  correctCount: number,
  _method: ScoringMethod = 'user_custom'
): number {
  if (correctCount === 4) return 1.0;
  if (correctCount === 3) return 0.5;
  if (correctCount === 2) return 0.25;
  if (correctCount === 1) return 0.1;
  return 0.0;
}

export function evaluateExam(
  exam: Exam,
  userAnswers: UserExamAnswers,
  scoringMethod: ScoringMethod = 'user_custom'
): ExamResultSummary {
  let partIScore = 0;
  let partICorrectCount = 0;

  const domainScores = {
    crop: { correct: 0, total: 0, score: 0 },
    husbandry: { correct: 0, total: 0, score: 0 },
    forestry: { correct: 0, total: 0, score: 0 },
    aquaculture: { correct: 0, total: 0, score: 0 },
  };

  const levelScores = {
    NB: { correct: 0, total: 0 },
    TH: { correct: 0, total: 0 },
    VD: { correct: 0, total: 0 },
  };

  // Evaluate Part I (6.0 points total when Part II exists, or 10.0 points total when Part II is empty)
  const totalPartIPoints = exam.partII.length > 0 ? Math.max(0, 10.0 - exam.partII.length * 1.0) : 10.0;
  const pointPerPartI = exam.partI.length > 0 ? totalPartIPoints / exam.partI.length : 0;

  exam.partI.forEach((q) => {
    const domainBucket = domainScores[q.domain] || domainScores.aquaculture;
    const levelBucket = levelScores[q.level] || levelScores.NB;
    domainBucket.total += 1;
    levelBucket.total += 1;

    const selected = userAnswers.partI[q.id];
    if (selected === q.correctAnswer) {
      partICorrectCount += 1;
      partIScore += pointPerPartI;
      domainBucket.correct += 1;
      domainBucket.score += pointPerPartI;
      levelBucket.correct += 1;
    }
  });

  // Evaluate Part II (True/False questions, each up to 1.0 point)
  let partIIScore = 0;
  let partIICorrectStatementsCount = 0;
  const partIIQuestionsScore: Record<string, PartIIScoreBreakdown> = {};

  exam.partII.forEach((tfQ) => {
    let questionCorrectStatements = 0;
    const userAnswersForQ = userAnswers.partII[tfQ.id] || { a: null, b: null, c: null, d: null };

    tfQ.statements.forEach((stmt) => {
      const levelBucket = levelScores[stmt.level] || levelScores.NB;
      levelBucket.total += 1;
      const userChoice = userAnswersForQ[stmt.subId];
      if (userChoice !== null && userChoice === stmt.isCorrect) {
        questionCorrectStatements += 1;
        partIICorrectStatementsCount += 1;
        levelBucket.correct += 1;
      }
    });

    const questionScore = calculatePartIIQuestionScore(questionCorrectStatements, scoringMethod);
    partIIScore += questionScore;

    partIIQuestionsScore[tfQ.id] = {
      correctStatementsCount: questionCorrectStatements,
      earnedScore: questionScore,
    };

    // Attribute to domain
    const domainBucket = domainScores[tfQ.domain] || domainScores.aquaculture;
    domainBucket.score += questionScore;
    domainBucket.total += tfQ.statements.length; // 4 statements
    domainBucket.correct += questionCorrectStatements;
  });

  // Round scores to 2 decimal places
  const roundedPartIScore = Math.round(partIScore * 100) / 100;
  const roundedPartIIScore = Math.round(partIIScore * 100) / 100;
  const totalScore = Math.min(10.0, Math.round((roundedPartIScore + roundedPartIIScore) * 100) / 100);

  return {
    examId: exam.id,
    examCode: exam.code,
    examTitle: exam.title,
    completedAt: new Date().toISOString(),
    totalScore,
    partIScore: roundedPartIScore,
    partIIScore: roundedPartIIScore,
    partICorrectCount,
    partIICorrectStatementsCount,
    partIIQuestionsScore,
    domainScores,
    levelScores,
    timeSpentSeconds: userAnswers.timeSpentSeconds,
    studentInfo: userAnswers.studentInfo,
    violationCount: userAnswers.violationCount || 0,
  };
}
