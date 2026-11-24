import { Exam, MultipleChoiceQuestion, TrueFalseQuestion } from '../types/exam';
import { normalizeExam } from '../utils/equalLengthNormalizer';
import { exam101 } from './exams/exam101';
import { exam102 } from './exams/exam102';
import { exam103 } from './exams/exam103';
import { exam104 } from './exams/exam104';
import { exam105 } from './exams/exam105';
import { exam106 } from './exams/exam106';

export { exam101, exam102, exam103, exam104, exam105, exam106 };

const RAW_BASE_EXAMS = [exam101, exam102, exam103, exam104, exam105, exam106];

// Thu thập ngân hàng câu hỏi từ 6 đề chuẩn gốc
const poolG10Crop: MultipleChoiceQuestion[] = RAW_BASE_EXAMS.flatMap((e) =>
  e.partI.filter((q) => q.grade === '10' && q.domain === 'crop')
);
const poolG11Husbandry: MultipleChoiceQuestion[] = RAW_BASE_EXAMS.flatMap((e) =>
  e.partI.filter((q) => q.grade === '11' && q.domain === 'husbandry')
);
const poolG12ForestryRegular: MultipleChoiceQuestion[] = RAW_BASE_EXAMS.flatMap((e) =>
  e.partI.filter((q) => q.grade === '12' && q.domain === 'forestry' && !q.chartData && !q.tableData)
);
const poolG12ChartVD: MultipleChoiceQuestion[] = RAW_BASE_EXAMS.flatMap((e) =>
  e.partI.filter((q) => Boolean(q.chartData))
);
const poolG12AquacultureRegular: MultipleChoiceQuestion[] = RAW_BASE_EXAMS.flatMap((e) =>
  e.partI.filter((q) => q.grade === '12' && q.domain === 'aquaculture' && !q.chartData && !q.tableData)
);
const poolG12TableVD: MultipleChoiceQuestion[] = RAW_BASE_EXAMS.flatMap((e) =>
  e.partI.filter((q) => Boolean(q.tableData))
);

// Ngân hàng 4 nhóm câu hỏi Phần II Đúng / Sai
const poolTF1: TrueFalseQuestion[] = RAW_BASE_EXAMS.map((e) => e.partII[0]);
const poolTF2: TrueFalseQuestion[] = RAW_BASE_EXAMS.map((e) => e.partII[1]);
const poolTF3: TrueFalseQuestion[] = RAW_BASE_EXAMS.map((e) => e.partII[2]);
const poolTF4: TrueFalseQuestion[] = RAW_BASE_EXAMS.map((e) => e.partII[3]);

// Bộ sinh số giả ngẫu nhiên có seed (LCG) đảm bảo tính xác định (deterministic)
function createSeededRandom(seed: number) {
  let s = (seed * 9301 + 49297) % 233280;
  return () => {
    s = (s * 9301 + 49297) % 233280;
    return s / 233280;
  };
}

function seededShuffle<T>(arr: T[], rng: () => number): T[] {
  const result = [...arr];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

/**
 * Sinh mã đề chuẩn hóa theo seed (từ mã 107 đến 124).
 * Đảm bảo 100% đúng chuẩn ma trận đề thi tốt nghiệp THPT Bộ GD&ĐT:
 * - 24 câu trắc nghiệm nhiều lựa chọn (trong đó có 1 câu Vận dụng phân tích biểu đồ tại Câu 14 và 1 câu Vận dụng phân tích bảng số liệu tại Câu 23)
 * - 4 câu Đúng/Sai tình huống thực nghiệm (1 câu phân tích bảng số liệu, 1 câu phân tích biểu đồ, 2 câu tình huống thực tiễn)
 */
function generateStandardExam(codeNumber: number): Exam {
  const code = codeNumber.toString();
  const rng = createSeededRandom(codeNumber * 77 + 13);

  // Chọn câu Phần I theo đúng tỉ lệ ma trận chuẩn (24 câu: có 1 câu VD phân tích biểu đồ và 1 câu VD phân tích số liệu)
  const selectedG10 = seededShuffle(poolG10Crop, rng).slice(0, 4);
  const selectedG11 = seededShuffle(poolG11Husbandry, rng).slice(0, 4);
  const selectedForestryRegular = seededShuffle(poolG12ForestryRegular, rng).slice(0, 5);
  const selectedChartVD = seededShuffle(poolG12ChartVD, rng)[0];
  const selectedAquaRegular = seededShuffle(poolG12AquacultureRegular, rng).slice(0, 9);
  const selectedTableVD = seededShuffle(poolG12TableVD, rng)[0];

  const rawPartI: MultipleChoiceQuestion[] = [
    ...selectedG10, // Câu 1 - 4
    ...selectedG11, // Câu 5 - 8
    ...selectedForestryRegular, // Câu 9 - 13
    selectedChartVD, // Câu 14: Vận dụng phân tích biểu đồ
    ...selectedAquaRegular.slice(0, 8), // Câu 15 - 22
    selectedTableVD, // Câu 23: Vận dụng phân tích số liệu
    selectedAquaRegular[8], // Câu 24
  ];

  const partI: MultipleChoiceQuestion[] = rawPartI.map((q, idx) => ({
    ...q,
    number: idx + 1,
    id: `e${code}_q${idx + 1}`,
  }));

  // Chọn 4 câu Phần II từ 4 nhóm tình huống thực tiễn
  const tf1 = seededShuffle(poolTF1, rng)[0];
  const tf2 = seededShuffle(poolTF2, rng)[0];
  const tf3 = seededShuffle(poolTF3, rng)[0];
  const tf4 = seededShuffle(poolTF4, rng)[0];

  const partII: TrueFalseQuestion[] = [
    { ...tf1, number: 1, id: `e${code}_tf1` },
    { ...tf2, number: 2, id: `e${code}_tf2` },
    { ...tf3, number: 3, id: `e${code}_tf3` },
    { ...tf4, number: 4, id: `e${code}_tf4` },
  ];

  return {
    id: `de-chuan-${code}`,
    code,
    title: `Đề Thi Tốt Nghiệp THPT Môn Công Nghệ Nông Nghiệp - Mã Đề ${code}`,
    description: `Đề tham khảo chuẩn hóa Bộ GD&ĐT. Phần I gồm 24 câu trắc nghiệm nhiều lựa chọn (có 01 câu vận dụng phân tích biểu đồ & 01 câu vận dụng phân tích số liệu); Phần II gồm 04 câu đúng/sai thực nghiệm.`,
    durationMinutes: 50,
    partI,
    partII,
  };
}

// Khởi tạo đầy đủ kho 24 mã đề chuẩn hóa cố định (từ mã 101 đến mã 124) với độ dài câu hỏi và câu trả lời bằng nhau
export const MOCK_EXAMS: Exam[] = Array.from({ length: 24 }, (_, i) => {
  const codeNum = 101 + i;
  const rawExam =
    codeNum <= 106
      ? RAW_BASE_EXAMS[codeNum - 101]
      : generateStandardExam(codeNum);
  return normalizeExam(rawExam, i);
});
