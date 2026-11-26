export interface StudentAnswerPartIDetail {
  questionNumber: number;
  questionId: string;
  questionText: string;
  options: {
    A: string;
    B: string;
    C: string;
    D: string;
  };
  selectedAnswer: 'A' | 'B' | 'C' | 'D' | null;
  correctAnswer: 'A' | 'B' | 'C' | 'D';
  isCorrect: boolean;
  explanation?: string;
}

export interface StudentAnswerPartIIDetail {
  questionNumber: number;
  questionId: string;
  scenarioTitle: string;
  scenario: string;
  earnedScore: number;
  statements: Array<{
    subId: 'a' | 'b' | 'c' | 'd';
    text: string;
    userChoice: boolean | null;
    correctChoice: boolean;
    isCorrect: boolean;
    explanation?: string;
  }>;
}

export interface StudentExamPaper {
  partI?: Record<string, 'A' | 'B' | 'C' | 'D' | null>;
  partII?: Record<string, Record<'a' | 'b' | 'c' | 'd', boolean | null>>;
  partIDetails: StudentAnswerPartIDetail[];
  partIIDetails: StudentAnswerPartIIDetail[];
}

export interface StudentSubmission {
  id: string;
  studentName: string;
  studentClass: string;
  studentId?: string;
  examId: string;
  examCode: string;
  examTitle: string;
  totalScore: number; // / 10.0
  partIScore: number; // / 6.0
  partIIScore: number; // / 4.0
  partICorrectCount: number; // / 24
  partIICorrectCount: number; // / 16
  timeSpentSeconds: number;
  submittedAt: string; // ISO 8601
  rank: 'Xuất sắc' | 'Giỏi' | 'Khá' | 'Trung bình' | 'Cần cố gắng';
  note?: string;
  violationCount?: number;
  isAutoCollected?: boolean;
  autoSubmittedByTeacher?: boolean;
  teacherUsername?: string;
  teacherName?: string;
  examPaper?: StudentExamPaper;
}

export interface ClassStatisticsSummary {
  totalStudents: number;
  averageScore: number;
  highestScore: number;
  lowestScore: number;
  passRate: number; // Score >= 5.0 in %
  goodRate: number; // Score >= 8.0 in %
  scoreDistribution: {
    under5: number; // < 5.0
    from5to65: number; // 5.0 - 6.4
    from65to8: number; // 6.5 - 7.9
    from8to9: number; // 8.0 - 8.9
    from9to10: number; // 9.0 - 10.0
  };
}
