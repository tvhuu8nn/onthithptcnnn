import React, { useMemo, useState } from 'react';
import {
  BookOpenCheck,
  Bookmark,
  Bot,
  Check,
  ChevronDown,
  ChevronUp,
  ClipboardList,
  Clock,
  Copy,
  Cpu,
  Download,
  FileDown,
  FileText,
  FlaskConical,
  Layers,
  Lightbulb,
  ShieldCheck,
  Sparkles,
  Target,
  Wrench,
} from 'lucide-react';
import {
  ChapterMCQItem,
  ChapterQuestionItem,
  ChapterReviewItem,
  ChapterTFQuestion,
  GlossaryItem,
  SGK_GLOSSARY,
  TheoryDocTable,
} from '../data/chapterReviewData';
import { AuthUser } from '../types/auth';
import { downloadHtmlAsDocx, trackDocumentDownload } from '../utils/examDownloader';

interface KhbdLessonPlanSectionProps {
  activeGrade: '10' | '11' | '12';
  bookName: string;
  chapters: ChapterReviewItem[];
  allGradeChapters: ChapterReviewItem[];
  currentUser?: AuthUser | null;
  canDownloadDocuments?: boolean;
  onRequireLogin?: (message?: string) => void;
  onRequireVipUpgrade?: () => void;
}

interface DigitalCompetencyIndicator {
  code: string;
  domain: string;
  activityRef: string;
  description: string;
}

interface AiEducationStrand {
  strandCode: string;
  strandName: string;
  activityRef: string;
  integrationContent: string;
}

interface DetailedBoardPoint {
  lead?: string;
  text: string;
  subPoints?: string[];
}

interface DetailedKnowledgeActivity {
  activityCode: string; // e.g., "Hoạt động 2.1"
  title: string;
  durationMinutes: number;
  nlsCodes: string;
  aiStrandTag: string;
  objective: string;
  learningContentSummary: string;
  guidingQuestions: string[];
  organizationMode: string;
  steps: {
    step1Transfer: string;
    step2Execute: string;
    step3Report: string;
    step4Conclude: string;
  };
  boardPoints: DetailedBoardPoint[];
  comparisonTable?: TheoryDocTable;
  deepExplanation?: {
    question: string;
    answers: string[];
  };
  keyTakeaway?: string;
}

interface BuiltLessonPlan {
  id: string;
  chapter: ChapterReviewItem;
  lessonIndex: number;
  rawLessonTitle: string;
  cleanLessonTitle: string;
  pageHint: string;
  isPractical: boolean;
  periods: number;
  domainLabel: string;
  knowledgeObjectives: string[];
  generalCompetencies: string[];
  techCompetencies: string[];
  digitalCompetencies: DigitalCompetencyIndicator[];
  aiEducationStrands: AiEducationStrand[];
  qualities: string[];
  teacherMaterials: string[];
  studentMaterials: string[];
  warmupPrompt: string;
  knowledgeActivities: DetailedKnowledgeActivity[];
  matchedGlossary: GlossaryItem[];
  practiceMcqs: ChapterMCQItem[];
  applicationTf?: ChapterTFQuestion;
  applicationTask: string;
  aiPracticeActivity: {
    title: string;
    promptTemplate: string;
    verificationRule: string;
    expectedProduct: string;
  };
  worksheetTasks: string[];
  digitalAiRubric: string[];
}

const OPTION_LABELS = ['A', 'B', 'C', 'D'] as const;

const STOP_WORDS = new Set([
  'bài',
  'chương',
  'giới',
  'thiệu',
  'về',
  'của',
  'và',
  'các',
  'một',
  'số',
  'trong',
  'cho',
  'với',
  'khi',
  'để',
  'từ',
  'các',
  'thực',
  'hành',
  'công',
  'nghệ',
  'trang',
  'sgk',
]);

const escapeHtml = (str: string) =>
  str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');

const getDomainLabel = (domain: ChapterReviewItem['domain']): string => {
  switch (domain) {
    case 'crop':
      return 'Công nghệ Trồng trọt';
    case 'husbandry':
      return 'Công nghệ Chăn nuôi';
    case 'forestry':
      return 'Công nghệ Lâm nghiệp';
    case 'aquaculture':
      return 'Công nghệ Thủy sản';
  }
};

const getDomainRealWorldContext = (
  domain: ChapterReviewItem['domain']
): {
  aiUseCase: string;
  sensorExample: string;
  officialSource: string;
  careerOrientation: string;
  localPracticeExample: string;
} => {
  switch (domain) {
    case 'crop':
      return {
        aiUseCase:
          'nhận diện sâu bệnh qua ảnh lá cây, phân tích độ phì đất và khuyến nghị tưới tiêu – bón phân chính xác',
        sensorExample: 'cảm biến độ ẩm đất, pH, EC và ảnh chụp thực địa cây trồng',
        officialSource: 'SGK Công nghệ 10 (KNTT), Cục Trồng trọt và Bảo vệ thực vật',
        careerOrientation: 'Kỹ sư nông nghiệp công nghệ cao, chuyên gia dữ liệu nông học',
        localPracticeExample: 'vùng trồng lúa, rau màu, cây ăn quả hoặc vườn ươm tại địa phương',
      };
    case 'husbandry':
      return {
        aiUseCase:
          'giám sát sức khỏe đàn vật nuôi qua camera AI, tối ưu hóa khẩu phần thức ăn và cảnh báo sớm dịch bệnh',
        sensorExample: 'cảm biến nhiệt độ, độ ẩm, nồng độ NH3 chuồng nuôi và nhật ký tăng trưởng',
        officialSource: 'SGK Công nghệ 11 (KNTT), Cục Chăn nuôi và Thú y',
        careerOrientation: 'Kỹ sư chăn nuôi thông minh, bác sĩ thú y ứng dụng công nghệ số',
        localPracticeExample: 'trang trại chăn nuôi gia súc, gia cầm an toàn sinh học tại địa phương',
      };
    case 'forestry':
      return {
        aiUseCase:
          'phân tích ảnh viễn thám/UAV theo dõi độ che phủ rừng, cảnh báo sớm cháy rừng và phân loại sinh trưởng cây lâm nghiệp',
        sensorExample:
          'dữ liệu ảnh vệ tinh/UAV, bản đồ GIS, cảm biến nhiệt độ – độ ẩm không khí rừng',
        officialSource: 'SGK Công nghệ 12 (KNTT), Cục Lâm nghiệp và Kiểm lâm',
        careerOrientation:
          'Kỹ sư lâm sinh công nghệ số, chuyên viên GIS & quản lý tài nguyên rừng',
        localPracticeExample: 'rừng trồng sản xuất, rừng phòng hộ hoặc vườn ươm cây lâm nghiệp',
      };
    case 'aquaculture':
      return {
        aiUseCase:
          'giám sát chất lượng nước ao nuôi theo thời gian thực, điều khiển cho ăn tự động bằng thị giác máy tính và dự báo dịch bệnh thủy sản',
        sensorExample:
          'cảm biến pH, DO (oxy hòa tan), độ mặn, nhiệt độ nước và camera quan sát đàn thủy sản',
        officialSource: 'SGK Công nghệ 12 (KNTT), Cục Thủy sản và Kiểm ngư',
        careerOrientation:
          'Kỹ sư nuôi trồng thủy sản công nghệ cao, chuyên gia tự động hóa nông – ngư nghiệp',
        localPracticeExample: 'ao/đầm nuôi tôm, cá lồng bè hoặc cơ sở sản xuất giống thủy sản',
      };
  }
};

function parseLessonTitle(raw: string): { cleanTitle: string; pageHint: string; topicName: string } {
  const pageMatch = raw.match(/\((trang\s+[^)]+)\)/i);
  const pageHint = pageMatch ? pageMatch[1] : '';
  const cleanTitle = raw.replace(/\s*\(trang\s+[^)]+\)/i, '').trim();
  const topicName = cleanTitle
    .replace(/^Bài\s+\d+\s*:\s*/i, '')
    .replace(/^Thực\s+hành\s*:\s*/i, '')
    .trim();
  return { cleanTitle, pageHint, topicName };
}

function extractKeywords(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[.,;:!?()[\]"'–—/\\]/g, ' ')
    .split(/\s+/)
    .filter((w) => w.length >= 2 && !STOP_WORDS.has(w));
}

function keywordOverlapScore(sourceText: string, targetText: string): number {
  const srcTokens = extractKeywords(sourceText);
  if (srcTokens.length === 0) return 0;
  const targetLower = targetText.toLowerCase();
  let score = 0;
  const uniqueTokens = Array.from(new Set(srcTokens));
  uniqueTokens.forEach((tok) => {
    if (targetLower.includes(tok)) {
      score += tok.length >= 4 ? 2 : 1;
    }
  });
  return score;
}

function splitSubItemToDetailedPoint(subItem: string): {
  title: string;
  boardPoint: DetailedBoardPoint;
} {
  const colonIdx = subItem.indexOf(':');
  if (colonIdx > 0 && colonIdx < 70) {
    const lead = subItem.slice(0, colonIdx).trim();
    const rest = subItem.slice(colonIdx + 1).trim();
    const segments = rest
      .split(/\s*;\s*/)
      .map((s) => s.trim())
      .filter(Boolean);

    if (segments.length >= 2) {
      return {
        title: lead,
        boardPoint: {
          lead,
          text: segments[0],
          subPoints: segments.slice(1),
        },
      };
    }
    return {
      title: lead,
      boardPoint: {
        lead,
        text: rest,
      },
    };
  }

  return {
    title: subItem.slice(0, 52) + (subItem.length > 52 ? '...' : ''),
    boardPoint: {
      text: subItem,
    },
  };
}

function buildDetailedKnowledgeActivities(
  chapter: ChapterReviewItem,
  cleanTitle: string,
  topicName: string,
  pageHint: string,
  lessonIndex: number,
  isPractical: boolean,
  domainLabel: string,
  domainCtx: ReturnType<typeof getDomainRealWorldContext>
): DetailedKnowledgeActivity[] {
  const activities: DetailedKnowledgeActivity[] = [];

  // Match relevant chapter questions (Q&A) for deep scientific explanations
  const scoredQuestions = chapter.questions
    .map((q, idx) => ({
      q,
      idx,
      score: keywordOverlapScore(topicName, `${q.question} ${q.answer.join(' ')}`),
    }))
    .sort((a, b) => b.score - a.score);

  const matchedQuestions: ChapterQuestionItem[] = scoredQuestions
    .filter((item) => item.score >= 3)
    .map((item) => item.q);

  if (matchedQuestions.length === 0 && chapter.questions.length > 0) {
    matchedQuestions.push(chapter.questions[lessonIndex % chapter.questions.length]);
  }

  // Match relevant coreSummary items
  const matchedCoreNotes = chapter.coreSummary.filter(
    (note) => keywordOverlapScore(topicName, note) >= 2
  );
  const effectiveCoreNotes =
    matchedCoreNotes.length > 0 ? matchedCoreNotes : chapter.coreSummary.slice(0, 2);

  // Priority 1: Use chapter.theoryDocument.lessons if available
  const matchedTheoryLesson = chapter.theoryDocument?.lessons.find((l, idx) => {
    const normA = l.lessonTitle.toLowerCase().replace(/\s+/g, ' ');
    const normB = cleanTitle.toLowerCase().replace(/\s+/g, ' ');
    return (
      idx === lessonIndex ||
      normA.includes(normB.slice(0, 14)) ||
      normB.includes(normA.slice(0, 14))
    );
  });

  if (matchedTheoryLesson && matchedTheoryLesson.sections.length > 0) {
    const totalSections = matchedTheoryLesson.sections.length;
    const perDuration = Math.max(8, Math.round(32 / totalSections));

    matchedTheoryLesson.sections.forEach((sec, secIdx) => {
      const cleanSecHeading = sec.heading.replace(/^\d+\.\s*/, '').trim();
      const boardPoints: DetailedBoardPoint[] = [];

      if (sec.bullets) {
        sec.bullets.forEach((b) => {
          boardPoints.push({
            lead: b.lead ? b.lead.replace(/:$/, '') : undefined,
            text: b.text,
            subPoints: b.subBullets?.map((sb) =>
              sb.lead ? `${sb.lead} ${sb.text}` : sb.text
            ),
          });
        });
      }

      const matchedQ = matchedQuestions[secIdx];
      const coreNote = effectiveCoreNotes[secIdx % Math.max(1, effectiveCoreNotes.length)];
      const nlsCodes =
        secIdx % 2 === 0 ? '1.1.NC1a, 2.4.NC1a' : '1.2.NC1a, 3.1.NC1a';
      const aiStrandTag =
        secIdx % 2 === 0
          ? 'Mạch 1 – Tư duy lấy con người làm trung tâm'
          : 'Mạch 3 – Kỹ thuật & ứng dụng AI';

      const guidingQuestions: string[] = [
        `Câu hỏi 1 (Nhận biết): Dựa vào SGK (${pageHint}), hãy trình bày các nội dung chính về "${cleanSecHeading}"?`,
        `Câu hỏi 2 (Thông hiểu – Phân tích): Phân tích mối liên hệ hoặc cơ sở khoa học của các yếu tố nêu trong mục "${cleanSecHeading}" đối với hiệu quả sản xuất ${domainLabel.toLowerCase()}?`,
        matchedQ
          ? `Câu hỏi 3 (Vận dụng thực tiễn): ${matchedQ.question}`
          : `Câu hỏi 3 (Vận dụng thực tiễn): Hãy lấy 01 ví dụ cụ thể tại ${domainCtx.localPracticeExample} minh họa cho nội dung "${cleanSecHeading}".`,
      ];

      activities.push({
        activityCode: `Hoạt động 2.${secIdx + 1}`,
        title: `Tìm hiểu ${cleanSecHeading}`,
        durationMinutes: perDuration,
        nlsCodes,
        aiStrandTag,
        objective: `HS trình bày, phân tích và hệ thống hóa được đầy đủ kiến thức về "${cleanSecHeading}"; rèn luyện kỹ năng khai thác thông tin số chính thống (${nlsCodes}) và liên hệ thực tiễn sản xuất.`,
        learningContentSummary: `GV chia lớp thành 8 nhóm học tập (Nhóm 1 – Nhóm 8), nghiên cứu mục "${sec.heading}" trong SGK ${chapter.bookTitle} kết hợp học liệu số trình chiếu để hoàn thành Phiếu học tập số ${secIdx + 1} gồm 3 câu hỏi định hướng từ nhận biết đến phân tích – vận dụng.`,
        guidingQuestions,
        organizationMode:
          secIdx % 2 === 0
            ? 'Chia lớp thành 8 nhóm (Nhóm 1 – Nhóm 8) thảo luận theo kỹ thuật Khăn trải bàn kết hợp Phiếu học tập số'
            : 'Chia lớp thành 8 nhóm (Nhóm 1–4 & Nhóm 5–8 đối chiếu chéo), hoàn thành bảng tổng hợp & thuyết trình nhanh',
        steps: {
          step1Transfer: `GV chia lớp thành 8 nhóm (Nhóm 1 – Nhóm 8, phân công rõ Nhóm trưởng và Thư ký), trình chiếu hệ thống câu hỏi định hướng của mục "${cleanSecHeading}" và chuyển giao Phiếu học tập số ${secIdx + 1}. Yêu cầu 8 nhóm đọc kỹ SGK (${pageHint}), đối chiếu hình ảnh/bảng biểu minh họa và tra cứu nhanh số liệu cập nhật từ nguồn chính thống (Mã NLS ${nlsCodes}) trong thời gian ${Math.max(4, Math.floor(perDuration / 2))} phút.`,
          step2Execute: `HS làm việc cá nhân (2 phút) gạch chân từ khóa chính trong SGK, sau đó thảo luận trong từng nhóm (8 nhóm) thống nhất đáp án vào bảng phụ hoặc Phiếu học tập trực tuyến (Google Docs/Padlet). GV di chuyển quanh lớp quan sát 8 nhóm, phát hiện vướng mắc và gợi mở bằng câu hỏi phụ giúp HS giải thích bản chất khoa học thay vì chỉ chép lại sách.`,
          step3Report: `GV gọi ngẫu nhiên đại diện 2 nhóm (ví dụ 1 nhóm thuộc Nhóm 1–4 và 1 nhóm thuộc Nhóm 5–8) lên trình bày kết quả hoặc chia sẻ màn hình sản phẩm. 6 nhóm còn lại lắng nghe, chấm chéo/đối chiếu với sản phẩm của nhóm mình, đặt tối thiểu 01 câu hỏi phản biện và bổ sung ví dụ thực tế tại ${domainCtx.localPracticeExample}.`,
          step4Conclude: `GV nhận xét tinh thần hợp tác và mức độ chính xác của cả 8 nhóm, giải thích chốt lại các khái niệm dễ nhầm lẫn, chiếu bảng tổng hợp chuẩn kiến thức để HS ghi vở và kết nối sang nhiệm vụ tiếp theo.`,
        },
        boardPoints,
        comparisonTable: sec.table,
        deepExplanation: matchedQ
          ? { question: matchedQ.question, answers: matchedQ.answer }
          : undefined,
        keyTakeaway: coreNote,
      });
    });

    return activities;
  }

  // Priority 2: Practical Lesson (Bài Thực hành / Dự án)
  if (isPractical) {
    const mainQ = matchedQuestions[0];
    const extraQ = matchedQuestions[1];
    const relatedBranch = chapter.mindmapNodes
      .map((n) => ({ n, score: keywordOverlapScore(topicName, `${n.title} ${n.subItems.join(' ')}`) }))
      .sort((a, b) => b.score - a.score)[0]?.n;

    activities.push({
      activityCode: 'Hoạt động 2.1',
      title: `Tìm hiểu mục tiêu, chuẩn bị dụng cụ, mẫu vật và quy tắc an toàn thực hành (${topicName})`,
      durationMinutes: 8,
      nlsCodes: '1.1.NC1a, 4.2.NC1a',
      aiStrandTag: 'Mạch 1 – Tư duy lấy con người làm trung tâm',
      objective: `HS nắm vững yêu cầu kỹ thuật, danh mục dụng cụ/mẫu vật cần chuẩn bị và tuân thủ nghiêm ngặt quy tắc an toàn lao động, vệ sinh môi trường trước khi thao tác "${topicName}".`,
      learningContentSummary: `GV chia lớp thành 8 nhóm thực hành (Nhóm 1 – Nhóm 8 tương ứng 8 vị trí/trạm), kiểm tra danh mục dụng cụ – mẫu vật, đối chiếu quy trình hướng dẫn trong SGK (${pageHint}) và hoàn thành bảng kiểm an toàn thực hành.`,
      guidingQuestions: [
        `Câu hỏi 1: Để thực hiện thành công bài thực hành "${topicName}", mỗi nhóm (trong 8 nhóm) cần chuẩn bị những dụng cụ, hóa chất/mẫu vật và thiết bị đo nào?`,
        `Câu hỏi 2: Những quy tắc an toàn lao động, bảo vệ mẫu vật và bảo vệ môi trường nào bắt buộc phải tuân thủ trong quá trình thực hành?`,
        mainQ
          ? `Câu hỏi 3: ${mainQ.question}`
          : `Câu hỏi 3: Vì sao cần đo/kiểm tra chính xác các thông số kỹ thuật trước khi áp dụng vào sản xuất thực tế?`,
      ],
      organizationMode: 'Chia lớp thành 8 nhóm thực hành (Nhóm 1 – Nhóm 8 tại 8 bàn/trạm) kết hợp hướng dẫn trực quan của GV',
      steps: {
        step1Transfer: `GV chia lớp thành 8 nhóm thực hành (Nhóm 1 – Nhóm 8), giới thiệu mục tiêu buổi thực hành "${topicName}", trình chiếu bảng danh mục dụng cụ – mẫu vật và quy tắc an toàn. Giao nhiệm vụ cho 8 nhóm kiểm tra đầy đủ vật tư tại bàn thực hành trong 3 phút và trả lời 3 câu hỏi định hướng.`,
        step2Execute: `Nhóm trưởng của 8 nhóm phân công thành viên kiểm đếm mẫu vật, thiết bị đo và ghi nhận tình trạng vào Phiếu thực hành. Các thành viên đọc kỹ lưu ý an toàn và thảo luận giải thích ý nghĩa khoa học của thao tác chuẩn bị.`,
        step3Report: `Đại diện 2 nhóm (1 nhóm từ Nhóm 1–4 và 1 nhóm từ Nhóm 5–8) báo cáo kết quả chuẩn bị và nêu các rủi ro có thể gặp nếu thao tác sai kỹ thuật; 6 nhóm còn lại đối chiếu và bổ sung.`,
        step4Conclude: `GV kiểm tra nhanh trang bị bảo hộ của cả 8 nhóm, chốt các yêu cầu an toàn bắt buộc và cho phép chuyển sang phần thao tác mẫu.`,
      },
      boardPoints: [
        {
          lead: '1. Chuẩn bị dụng cụ và mẫu vật',
          text: `Đầy đủ dụng cụ chuyên dụng, mẫu vật đạt chuẩn và thiết bị ghi nhận số liệu (bảng đo/điện thoại chụp ảnh quy trình theo hướng dẫn GV) bám sát SGK (${pageHint}).`,
        },
        {
          lead: '2. Yêu cầu an toàn lao động & bảo vệ môi trường',
          text: 'Trang phục gọn gàng, sử dụng bảo hộ (găng tay, khẩu trang nếu cần); thao tác cẩn thận với dụng cụ sắc nhọn/hóa chất; thu gom chất thải, vệ sinh sạch sẽ vị trí sau thực hành.',
        },
        ...(relatedBranch
          ? [
              {
                lead: '3. Cơ sở lý thuyết nền tảng liên quan',
                text: relatedBranch.subItems[0] || relatedBranch.title,
                subPoints: relatedBranch.subItems.slice(1, 3),
              },
            ]
          : []),
      ],
      deepExplanation: mainQ ? { question: mainQ.question, answers: mainQ.answer } : undefined,
      keyTakeaway: effectiveCoreNotes[0],
    });

    activities.push({
      activityCode: 'Hoạt động 2.2',
      title: `GV thao tác mẫu và 8 nhóm HS tiến hành thực hành quy trình "${topicName}"`,
      durationMinutes: 17,
      nlsCodes: '2.4.NC1a, 3.1.NC1a, 5.2.NC1a',
      aiStrandTag: 'Mạch 3 – Kỹ thuật & ứng dụng AI',
      objective: `HS thực hiện đúng trình tự các bước kỹ thuật của bài "${topicName}", ghi nhận số liệu/hình ảnh khách quan, tự đánh giá chất lượng sản phẩm theo Rubric và đề xuất ứng dụng cảm biến/AI tự động hóa khâu đo kiểm.`,
      learningContentSummary: `GV làm mẫu từng bước then chốt kèm phân tích lỗi sai thường gặp; cả 8 nhóm (Nhóm 1 – Nhóm 8) thực hành đồng loạt, ghi chép bảng số liệu số, chụp ảnh minh chứng quy trình và báo cáo kết quả.`,
      guidingQuestions: [
        `Câu hỏi 1: Quy trình thực hành "${topicName}" gồm mấy bước cơ bản? Bước nào quyết định trực tiếp đến độ chính xác/tỉ lệ thành công của sản phẩm?`,
        `Câu hỏi 2: Khi gặp sai lệch số liệu hoặc thao tác chưa đạt chuẩn, nhóm cần điều chỉnh thông số kỹ thuật như thế nào?`,
        `Câu hỏi 3 (Tích hợp số & AI): Trong sản xuất quy mô lớn, người ta có thể thay thế thao tác thủ công này bằng loại cảm biến (${domainCtx.sensorExample}) và mô hình AI nào?`,
      ],
      organizationMode: 'GV làm mẫu (5 phút) → Chia lớp 8 nhóm thực hành & lập hồ sơ số (12 phút)',
      steps: {
        step1Transfer: `GV trình diễn thao tác mẫu chậm, rõ từng bước theo SGK (${pageHint}), chỉ rõ tiêu chuẩn đạt yêu cầu và 2–3 lỗi sai phổ biến cần tránh. Giao cả 8 nhóm (Nhóm 1 – Nhóm 8) tiến hành thực hành, phân công người thao tác – người đo ghi số liệu – người chụp ảnh minh chứng (Mã NLS 3.1.NC1a).`,
        step2Execute: `8 nhóm HS tiến hành thực hành đúng quy trình từng bước; nhập số liệu đo được vào bảng kết quả thực hành (giấy hoặc Google Sheets – Mã NLS 5.2.NC1a). GV theo sát cả 8 bàn thực hành để uốn nắn thao tác kịp thời và đảm bảo an toàn.`,
        step3Report: `8 nhóm trưng bày sản phẩm/bảng kết quả thực hành, tiến hành đánh giá chéo theo cặp nhóm (Nhóm 1↔2, 3↔4, 5↔6, 7↔8 theo tiêu chí GV cung cấp) và giải thích nguyên nhân chênh lệch kết quả nếu có.`,
        step4Conclude: `GV tổng kết kết quả thực hành của 8 nhóm, tuyên dương các nhóm thao tác chuẩn xác – vệ sinh sạch sẽ, phân tích cách khắc phục các lỗi đã xuất hiện và mở rộng liên hệ tới công nghệ cảm biến & AI hiện đại trong ${domainLabel.toLowerCase()}.`,
      },
      boardPoints: [
        {
          lead: 'Bước 1 – Chuẩn bị & xử lý mẫu',
          text: `Xử lý mẫu vật/vị trí thực hành đúng tiêu chuẩn kỹ thuật trước khi đo hoặc thao tác chính (${pageHint}).`,
        },
        {
          lead: 'Bước 2 – Tiến hành thao tác kỹ thuật chính',
          text: 'Thực hiện tuần tự, chính xác từng thao tác theo hướng dẫn SGK; đảm bảo đúng tỉ lệ, thời gian và điều kiện kỹ thuật.',
        },
        {
          lead: 'Bước 3 – Quan sát, đo đạc & ghi nhận kết quả số',
          text: 'Ghi chép trung thực số liệu/hiện tượng vào bảng báo cáo thực hành; chụp ảnh minh chứng sản phẩm trước và sau khi thực hiện.',
        },
        {
          lead: 'Bước 4 – Đánh giá sản phẩm & thu dọn vệ sinh',
          text: 'Đối chiếu sản phẩm với bảng tiêu chí (Rubric), rút kinh nghiệm kỹ thuật và vệ sinh, bàn giao đầy đủ dụng cụ.',
        },
      ],
      deepExplanation: extraQ ? { question: extraQ.question, answers: extraQ.answer } : undefined,
      keyTakeaway: effectiveCoreNotes[1] || effectiveCoreNotes[0],
    });

    return activities;
  }

  // Priority 3: Standard Theory Lesson — Match exact mindmap branch(es) and unpack EVERY subItem into detailed sub-activities
  const scoredBranches = chapter.mindmapNodes.map((branch, idx) => ({
    branch,
    idx,
    score: keywordOverlapScore(topicName, `${branch.title} ${branch.subItems.join(' ')}`),
  }));

  const bestScore = Math.max(...scoredBranches.map((b) => b.score), 0);
  let selectedBranches = scoredBranches
    .filter((b) => b.score > 0 && b.score >= Math.max(2, bestScore - 2))
    .sort((a, b) => a.idx - b.idx)
    .map((b) => b.branch);

  if (selectedBranches.length === 0 && chapter.mindmapNodes.length > 0) {
    const nonPracticalLessons = chapter.lessons.filter(
      (l) => !/thực hành|dự án|trải nghiệm/i.test(l)
    );
    const ratioIdx = Math.min(
      chapter.mindmapNodes.length - 1,
      Math.floor((lessonIndex * chapter.mindmapNodes.length) / Math.max(1, nonPracticalLessons.length))
    );
    selectedBranches = [chapter.mindmapNodes[ratioIdx]];
  }

  // Flatten all subItems of selectedBranches into structured knowledge activities
  const unpackedItems: {
    branchTitle: string;
    title: string;
    boardPoint: DetailedBoardPoint;
  }[] = [];

  selectedBranches.forEach((br) => {
    br.subItems.forEach((subItem) => {
      const parsed = splitSubItemToDetailedPoint(subItem);
      unpackedItems.push({
        branchTitle: br.title,
        title: parsed.title,
        boardPoint: parsed.boardPoint,
      });
    });
  });

  // Group into 2–4 well-balanced sub-activities (avoid too many tiny fragments or 1 overly giant block)
  const targetUnits: {
    title: string;
    points: DetailedBoardPoint[];
  }[] = [];

  if (unpackedItems.length <= 4) {
    unpackedItems.forEach((item) => {
      targetUnits.push({
        title: item.title,
        points: [item.boardPoint],
      });
    });
  } else {
    // Chunk into 3–4 units
    const chunkSize = Math.ceil(unpackedItems.length / 3);
    for (let i = 0; i < unpackedItems.length; i += chunkSize) {
      const slice = unpackedItems.slice(i, i + chunkSize);
      targetUnits.push({
        title: slice.map((s) => s.title).join(' & '),
        points: slice.map((s) => s.boardPoint),
      });
    }
  }

  // Fallback if somehow empty
  if (targetUnits.length === 0) {
    targetUnits.push({
      title: topicName,
      points: chapter.coreSummary.map((c) => splitSubItemToDetailedPoint(c).boardPoint),
    });
  }

  const perUnitMinutes = Math.max(8, Math.round(30 / Math.max(1, targetUnits.length)));

  targetUnits.forEach((unit, uIdx) => {
    const unitSearchText = `${unit.title} ${unit.points.map((p) => `${p.lead || ''} ${p.text}`).join(' ')}`;

    // Find best matching Q&A from chapter.questions for this specific unit
    const bestQ = chapter.questions
      .map((q) => ({ q, score: keywordOverlapScore(unitSearchText, `${q.question} ${q.answer.join(' ')}`) }))
      .sort((a, b) => b.score - a.score)[0];

    const attachedQ =
      bestQ && bestQ.score >= 2
        ? bestQ.q
        : matchedQuestions[uIdx % Math.max(1, matchedQuestions.length)];

    // Find best matching coreSummary note for this specific unit
    const bestCore = chapter.coreSummary
      .map((note) => ({ note, score: keywordOverlapScore(unitSearchText, note) }))
      .sort((a, b) => b.score - a.score)[0];

    const attachedCore =
      bestCore && bestCore.score >= 2
        ? bestCore.note
        : effectiveCoreNotes[uIdx % Math.max(1, effectiveCoreNotes.length)];

    // Expand boardPoints with supporting analytical details if only 1 brief point exists
    const enrichedBoardPoints: DetailedBoardPoint[] = [...unit.points];
    if (
      attachedQ &&
      enrichedBoardPoints.length <= 1 &&
      attachedQ.answer.length > 0
    ) {
      enrichedBoardPoints.push({
        lead: 'Phân tích bản chất & cơ sở khoa học',
        text: attachedQ.answer[0],
        subPoints: attachedQ.answer.slice(1, 3),
      });
    }

    const nlsCodes =
      uIdx === 0
        ? '1.1.NC1a, 2.4.NC1a'
        : uIdx === 1
        ? '1.2.NC1a, 3.1.NC1a'
        : '5.2.NC1a, 6.1.NC1a';
    const aiStrandTag =
      uIdx === 0
        ? 'Mạch 1 – Tư duy lấy con người làm trung tâm'
        : uIdx === 1
        ? 'Mạch 3 – Các kỹ thuật & ứng dụng AI'
        : 'Mạch 2 – Đạo đức AI & kiểm chứng khoa học';

    const guidingQuestions: string[] = [
      `Câu hỏi 1 (Nhận biết): Đọc SGK (${pageHint}), hãy nêu rõ khái niệm/đặc điểm/thành phần cốt lõi của nội dung "${unit.title}"?`,
      `Câu hỏi 2 (Thông hiểu): Giải thích vì sao các yếu tố/biện pháp kỹ thuật trong "${unit.title}" lại có vai trò quyết định đến năng suất và chất lượng sản phẩm ${domainLabel.toLowerCase()}?`,
      attachedQ
        ? `Câu hỏi 3 (Phân tích – Vận dụng): ${attachedQ.question}`
        : `Câu hỏi 3 (Vận dụng thực tiễn): Liên hệ thực tế tại ${domainCtx.localPracticeExample}, nêu 01 tình huống áp dụng hiệu quả nội dung "${unit.title}".`,
    ];

    activities.push({
      activityCode: `Hoạt động 2.${uIdx + 1}`,
      title: `Tìm hiểu về ${unit.title}`,
      durationMinutes: perUnitMinutes,
      nlsCodes,
      aiStrandTag,
      objective: `HS trình bày chính xác, phân tích được cơ sở khoa học và liên hệ vận dụng nội dung "${unit.title}" vào thực tiễn ${domainLabel.toLowerCase()}; phát triển năng lực số (${nlsCodes}) và tư duy công nghệ.`,
      learningContentSummary: `GV chia lớp thành 8 nhóm học tập (Nhóm 1 – Nhóm 8), khai thác kênh chữ, kênh hình trong SGK ${chapter.bookTitle} (${pageHint}) kết hợp học liệu số để thảo luận, hoàn thành Phiếu học tập số ${uIdx + 1} (gồm 3 câu hỏi phân hóa từ Nhận biết → Thông hiểu → Vận dụng).`,
      guidingQuestions,
      organizationMode:
        uIdx % 2 === 0
          ? 'Chia lớp thành 8 nhóm (Nhóm 1 – Nhóm 8) thảo luận theo kỹ thuật Khăn trải bàn kết hợp Phiếu học tập số'
          : 'Chia lớp thành 8 nhóm (Nhóm 1–4 & Nhóm 5–8 đối chiếu chéo) theo kỹ thuật Mảnh ghép & sơ đồ hóa',
      steps: {
        step1Transfer: `GV chia lớp thành 8 nhóm (Nhóm 1 – Nhóm 8, phân công rõ Nhóm trưởng và Thư ký), trình chiếu hình ảnh/sơ đồ trực quan mở đầu mục "${unit.title}" và giao Phiếu học tập số ${uIdx + 1} với 3 câu hỏi định hướng. Yêu cầu cả 8 nhóm đọc SGK (${pageHint}), khai thác dữ liệu kỹ thuật chính thống (Mã NLS ${nlsCodes}) và hoàn thành phiếu nhóm trong ${Math.max(4, Math.floor(perUnitMinutes / 2))} phút.`,
        step2Execute: `HS làm việc cá nhân (2 phút) xác định các từ khóa cốt lõi, sau đó thảo luận trong 8 nhóm để thống nhất câu trả lời, lập bảng so sánh hoặc sơ đồ nhánh trên bảng phụ/Google Docs. GV quan sát tiến độ của 8 nhóm, gợi mở câu hỏi phụ để HS giải thích rõ nguyên nhân – kết quả và liên hệ thực tiễn.`,
        step3Report: `GV gọi đại diện 2 nhóm (1 nhóm thuộc Nhóm 1–4 và 1 nhóm thuộc Nhóm 5–8) trình bày kết quả (ưu tiên nhóm có sơ đồ/bảng biểu rõ ràng). 6 nhóm còn lại theo dõi, đối chiếu chéo theo cặp nhóm (1↔2, 3↔4, 5↔6, 7↔8), đặt câu hỏi phản biện hoặc bổ sung dẫn chứng thực tiễn tại ${domainCtx.localPracticeExample}.`,
        step4Conclude: `GV nhận xét, chấm điểm cộng khích lệ tinh thần làm việc của cả 8 nhóm; phân tích sâu những lỗi hiểu nhầm HS hay mắc phải khi làm bài trắc nghiệm/Đúng–Sai; chốt kiến thức trọng tâm lên bảng để HS ghi chép đầy đủ vào vở.`,
      },
      boardPoints: enrichedBoardPoints,
      deepExplanation: attachedQ
        ? { question: attachedQ.question, answers: attachedQ.answer }
        : undefined,
      keyTakeaway: attachedCore,
    });
  });

  return activities;
}

function buildLessonPlan(
  chapter: ChapterReviewItem,
  rawLessonTitle: string,
  lessonIndex: number
): BuiltLessonPlan {
  const { cleanTitle, pageHint, topicName } = parseLessonTitle(rawLessonTitle);
  const isPractical = /thực hành|dự án|trải nghiệm/i.test(cleanTitle);
  const periods = isPractical ? 1 : 2;
  const domainLabel = getDomainLabel(chapter.domain);
  const domainCtx = getDomainRealWorldContext(chapter.domain);
  const effectivePageHint = pageHint || chapter.pageRef;

  const knowledgeActivities = buildDetailedKnowledgeActivities(
    chapter,
    cleanTitle,
    topicName,
    effectivePageHint,
    lessonIndex,
    isPractical,
    domainLabel,
    domainCtx
  );

  // Match SGK Glossary terms relevant to this lesson/chapter
  const lessonFullText = `${cleanTitle} ${chapter.chapterTitle} ${knowledgeActivities
    .map((a) => `${a.title} ${a.boardPoints.map((p) => `${p.lead || ''} ${p.text}`).join(' ')}`)
    .join(' ')}`;

  const matchedGlossary = SGK_GLOSSARY.filter((g) => g.grade === chapter.grade)
    .map((g) => ({
      g,
      score:
        keywordOverlapScore(g.term, lessonFullText) * 3 +
        keywordOverlapScore(g.definition, lessonFullText),
    }))
    .filter((item) => item.score >= 3)
    .sort((a, b) => b.score - a.score)
    .slice(0, 4)
    .map((item) => item.g);

  // Knowledge objectives derived from detailed knowledgeActivities
  const knowledgeObjectives: string[] = knowledgeActivities.slice(0, 3).map((act) => {
    const cleanActTitle = act.title.replace(/^Tìm hiểu (về )?/i, '').trim();
    return `Trình bày, phân tích và giải thích được cơ sở khoa học của nội dung: ${cleanActTitle}.`;
  });
  if (isPractical) {
    knowledgeObjectives.push(
      `Thực hiện đúng quy trình kỹ thuật, đảm bảo an toàn lao động và vệ sinh môi trường trong bài ${cleanTitle}.`
    );
  } else {
    knowledgeObjectives.push(
      `Vận dụng được kiến thức cốt lõi của ${cleanTitle} để giải thích hiện tượng và đề xuất giải pháp trong thực tiễn ${domainLabel.toLowerCase()}.`
    );
  }

  const generalCompetencies = [
    'Tự chủ và tự học: Chủ động nghiên cứu SGK, học liệu số, sơ đồ tư duy và tìm hiểu thực tiễn sản xuất tại địa phương.',
    'Giao tiếp và hợp tác: Thảo luận nhóm hiệu quả trực tiếp và trên không gian số, trình bày rõ ràng sản phẩm học tập và phản biện tích cực.',
    'Giải quyết vấn đề và sáng tạo: Đề xuất giải pháp kỹ thuật kết hợp công cụ số/AI phù hợp với điều kiện thực tiễn sản xuất.',
  ];

  const techCompetencies = isPractical
    ? [
        `Nhận thức công nghệ: Nắm vững yêu cầu kỹ thuật, quy trình và tiêu chuẩn đánh giá sản phẩm của ${cleanTitle}.`,
        `Sử dụng công nghệ: Thao tác thành thạo, an toàn với dụng cụ, mẫu vật thực hành và thiết bị đo/ghi nhận số liệu số.`,
        'Đánh giá công nghệ: Tự đánh giá và nhận xét kết quả thực hành theo bảng tiêu chí (Rubric), đề xuất cải tiến quy trình.',
      ]
    : [
        `Nhận thức công nghệ: Hiểu rõ bản chất, vai trò và nguyên lý khoa học trong ${cleanTitle} (${chapter.chapterNumber}: ${chapter.chapterTitle}).`,
        'Giao tiếp công nghệ: Đọc hiểu sơ đồ, bảng số liệu kỹ thuật và sử dụng chính xác thuật ngữ chuyên ngành Công nghệ.',
        `Đánh giá công nghệ: Phân tích ưu, nhược điểm của các biện pháp kỹ thuật trong ${domainLabel.toLowerCase()} theo hướng thông minh, bền vững.`,
      ];

  // Năng lực số theo Công văn số 3456/BGDĐT-GDPT ngày 27/06/2025 (Bậc Nâng cao THPT - NC1)
  const digitalCompetencies: DigitalCompetencyIndicator[] = [
    {
      code: '1.1.NC1a & 1.2.NC1a',
      domain: 'Miền 1: Khai thác dữ liệu và thông tin',
      activityRef: 'Hoạt động 1 & 2',
      description: `Tìm kiếm, lọc và đánh giá độ tin cậy của dữ liệu, hình ảnh, thông số kỹ thuật về "${cleanTitle}" từ nguồn chính thống (${domainCtx.officialSource}).`,
    },
    {
      code: '2.4.NC1a',
      domain: 'Miền 2: Giao tiếp và hợp tác trong môi trường số',
      activityRef: 'Hoạt động 2',
      description: `Phối hợp làm việc nhóm trên công cụ cộng tác số (Google Docs/Padlet/LMS) để hoàn thiện Phiếu học tập và phản biện sản phẩm của nhóm bạn.`,
    },
    {
      code: isPractical ? '3.1.NC1a & 3.3.NC1a' : '3.1.NC1a',
      domain: 'Miền 3: Sáng tạo nội dung số',
      activityRef: 'Hoạt động 2 & 4',
      description: isPractical
        ? `Ghi hình/chụp ảnh quy trình thực hành "${cleanTitle}", lập bảng số liệu số và tạo báo cáo/video ngắn có trích dẫn nguồn, tôn trọng bản quyền.`
        : `Thiết kế sơ đồ tư duy số hoặc infographic tóm tắt kiến thức cốt lõi của "${cleanTitle}" trên Canva/Mindmap và trình bày trước lớp.`,
    },
    {
      code: '4.2.NC1a & 4.4.NC1a',
      domain: 'Miền 4: An toàn trong môi trường số',
      activityRef: 'Hoạt động 3 & 4',
      description: `Bảo vệ dữ liệu cá nhân khi đăng nhập hệ thống luyện tập/công cụ AI; nhận thức tác động môi trường và nguyên tắc sử dụng công nghệ số bền vững trong ${domainLabel.toLowerCase()}.`,
    },
    {
      code: '5.2.NC1a',
      domain: 'Miền 5: Giải quyết vấn đề trong môi trường số',
      activityRef: 'Hoạt động 3 & 4',
      description: `Lựa chọn công cụ số phù hợp (bảng tính, trắc nghiệm trực tuyến, mô phỏng thông số) để phân tích tình huống thực tiễn và khắc phục sai sót kỹ thuật.`,
    },
    {
      code: '6.1.NC1a & 6.2.NC1a',
      domain: 'Miền 6: Ứng dụng Trí tuệ nhân tạo (AI)',
      activityRef: 'Hoạt động 2 & 4',
      description: `Sử dụng công cụ AI có kiểm chứng để hỗ trợ tra cứu, phân tích quy trình "${cleanTitle}" và giải thích ứng dụng AI trong ${domainCtx.aiUseCase}.`,
    },
  ];

  // Nội dung giáo dục AI theo Quyết định số 2422/QĐ-BGDĐT ngày 18/08/2026 (4 mạch kiến thức THPT)
  const aiEducationStrands: AiEducationStrand[] = [
    {
      strandCode: 'Mạch 1',
      strandName: 'Tư duy lấy con người làm trung tâm',
      activityRef: 'Hoạt động 1 & 2',
      integrationContent: `Phân tích bài toán thực tiễn của người sản xuất trong "${cleanTitle}"; làm rõ AI chỉ đóng vai trò công cụ hỗ trợ ra quyết định, còn con người (nông dân/kỹ sư) giữ quyền kiểm soát, đánh giá và chịu trách nhiệm cuối cùng.`,
    },
    {
      strandCode: 'Mạch 2',
      strandName: 'Đạo đức AI',
      activityRef: 'Hoạt động 2 & 4',
      integrationContent: `Thực hành đối chiếu kết quả do AI sinh ra với ${domainCtx.officialSource} để phát hiện và loại bỏ sai lệch/ảo giác AI; ghi rõ phần có sử dụng AI hỗ trợ, không sao chép thụ động và không nhập dữ liệu nhạy cảm của cá nhân/cơ sở sản xuất.`,
    },
    {
      strandCode: 'Mạch 3',
      strandName: 'Các kỹ thuật và ứng dụng AI',
      activityRef: 'Hoạt động 2 & 3',
      integrationContent: `Tìm hiểu nguyên lý ứng dụng AI (${domainCtx.aiUseCase}) và thực hành viết câu lệnh (prompt) có cấu trúc (Vai trò – Bối cảnh – Yêu cầu – Ràng buộc kiểm chứng) để khai thác thông tin phục vụ học tập.`,
    },
    {
      strandCode: 'Mạch 4',
      strandName: 'Thiết kế hệ thống AI (Định hướng nghề nghiệp THPT)',
      activityRef: 'Hoạt động 4 (Vận dụng)',
      integrationContent: `Phác thảo sơ đồ ý tưởng hệ thống AI giải quyết bài toán gắn với "${cleanTitle}": Đầu vào (${domainCtx.sensorExample}) → Mô hình AI phân tích/dự báo → Đầu ra cảnh báo/khuyến nghị kỹ thuật; liên hệ định hướng nghề nghiệp (${domainCtx.careerOrientation}).`,
    },
  ];

  const qualities = [
    'Chăm chỉ: Tích cực hoàn thành nhiệm vụ học tập, phiếu học tập số và bài tập vận dụng thực tiễn.',
    'Trung thực & Trách nhiệm số: Sử dụng tài liệu số và AI minh bạch, biết kiểm chứng khoa học, tôn trọng bản quyền và bảo vệ môi trường sinh thái.',
    'Yêu lao động: Trân trọng thành quả lao động sản xuất nông, lâm, thủy sản hiện đại và chủ động định hướng nghề nghiệp.',
  ];

  const teacherMaterials = isPractical
    ? [
        `SGK, SGV ${chapter.bookTitle} (Bộ Kết nối tri thức với cuộc sống).`,
        'Bộ dụng cụ, mẫu vật thực hành, trang bị bảo hộ lao động theo hướng dẫn SGK.',
        'Video/học liệu số minh họa quy trình thao tác mẫu, Phiếu hướng dẫn thực hành, Rubric đánh giá sản phẩm và tiêu chí đánh giá Năng lực số (CV 3456) & GD AI (QĐ 2422).',
      ]
    : [
        `SGK, SGV ${chapter.bookTitle} (Bộ Kết nối tri thức với cuộc sống).`,
        'Bài giảng điện tử (PowerPoint/Canva), máy chiếu, video thực tế về ứng dụng công nghệ số & AI trong sản xuất.',
        'Hệ thống Phiếu học tập số (Google Docs/Padlet/QR luyện tập), bộ câu hỏi trắc nghiệm củng cố, tình huống Đúng/Sai và phiếu kiểm chứng kết quả AI.',
      ];

  const studentMaterials = isPractical
    ? [
        `SGK ${chapter.bookTitle}, vở ghi chép, điện thoại/máy tính bảng (nếu GV cho phép) để chụp ảnh quy trình, nhập bảng số liệu thực hành.`,
        'Chuẩn bị mẫu vật/nguyên liệu theo phân công nhóm trước buổi học và trang phục gọn gàng, an toàn.',
      ]
    : [
        `SGK ${chapter.bookTitle}, vở ghi chép, thiết bị học tập kết nối mạng (theo hướng dẫn của GV).`,
        'Đọc trước nội dung bài học, sưu tầm hình ảnh hoặc ví dụ thực tế ứng dụng công nghệ số/AI tại địa phương.',
      ];

  // Pick practice MCQs distributed per lesson
  const mcqList = chapter.mcqQuestions || [];
  const totalLessons = Math.max(1, chapter.lessons.length);
  const perLessonMcq = 4;
  const startMcqIdx = Math.min(
    Math.max(0, mcqList.length - perLessonMcq),
    Math.floor((lessonIndex * mcqList.length) / totalLessons)
  );
  const practiceMcqs = mcqList.slice(startMcqIdx, startMcqIdx + perLessonMcq);

  // Pick a TF question if available
  const tfList = chapter.tfQuestions || [];
  const applicationTf = tfList.length > 0 ? tfList[lessonIndex % tfList.length] : undefined;

  // Warmup prompt
  const firstQuestion = chapter.questions[lessonIndex % Math.max(1, chapter.questions.length)];
  const warmupPrompt = firstQuestion
    ? `GV trình chiếu hình ảnh/video thực tế tại ${domainCtx.localPracticeExample} (kèm tình huống ứng dụng công nghệ số & AI) liên quan đến ${cleanTitle} và đặt câu hỏi gợi mở: "${firstQuestion.question}" HS quan sát, huy động kiến thức nền và nêu nhận định ban đầu để dẫn dắt vào bài mới. [Tích hợp NLS: 1.1.NC1a | GD AI: Mạch 1 – Tư duy lấy con người làm trung tâm]`
    : `GV trình chiếu hình ảnh thực tiễn về ${cleanTitle} và câu chuyện ứng dụng công nghệ số/AI trong ${domainLabel.toLowerCase()}, yêu cầu HS trả lời nhanh: Tại sao cần áp dụng đúng kỹ thuật này và công nghệ số/AI có thể hỗ trợ con người khâu nào? [Tích hợp NLS: 1.1.NC1a | GD AI: Mạch 1]`;

  // Application task
  const applicationTask = applicationTf
    ? `Phân tích tình huống thực tiễn (Câu hỏi Đúng/Sai gắn với ${chapter.chapterNumber}); đồng thời 8 nhóm (Nhóm 1 – Nhóm 8) tiếp tục phối hợp phác thảo sơ đồ ý tưởng 1 giải pháp số/AI hỗ trợ "${cleanTitle}" tại địa phương (nêu rõ dữ liệu đầu vào – cách AI xử lý – con người kiểm soát & tiêu chí đạo đức AI), nộp báo cáo số (1 trang A4/infographic) vào tiết học sau. [Tích hợp NLS: 3.1.NC1a, 5.2.NC1a, 6.2.NC1a | GD AI: Mạch 2, 4]`
    : `8 nhóm (Nhóm 1 – Nhóm 8) tìm hiểu một mô hình thực tế tại địa phương liên quan đến "${cleanTitle}", thiết kế 01 infographic số đề xuất quy trình áp dụng kết hợp công nghệ số/AI (chỉ rõ dữ liệu cảm biến/ảnh đầu vào, khuyến nghị kỹ thuật và bước kiểm chứng khoa học của con người). [Tích hợp NLS: 3.1.NC1a, 6.2.NC1a | GD AI: Mạch 2, 4]`;

  // Structured AI + Digital Competency mini-activity
  const aiPracticeActivity = {
    title: `Hoạt động 2.${knowledgeActivities.length + 1}: Thực hành tích hợp Năng lực số (CV 3456) & Giáo dục AI (QĐ 2422) theo 8 nhóm`,
    promptTemplate: `"Đóng vai kỹ sư ${domainLabel.toLowerCase()}, hãy lập bảng so sánh ngắn gọn các yếu tố kỹ thuật trọng tâm của bài '${cleanTitle}' (${chapter.chapterNumber}, SGK Công nghệ ${chapter.grade} Kết nối tri thức) và nêu 2 lưu ý sai sót thường gặp trong thực tế tại Việt Nam."`,
    verificationRule: `Cả 8 nhóm đối chiếu từng ý do AI tạo ra với ${domainCtx.officialSource}, gạch chân ít nhất 01 điểm cần chỉnh sửa hoặc bổ sung số liệu chính xác, ghi chú rõ nguồn kiểm chứng (thực hiện Mạch 2 – Đạo đức AI & Mã 1.2.NC1a, 6.2.NC1a).`,
    expectedProduct: `08 Phiếu kiểm chứng AI của 8 nhóm (bản số trên Google Docs/Padlet hoặc bảng phụ) kèm sơ đồ 3 khối của giải pháp AI gợi ý (Đầu vào → Xử lý AI → Quyết định của con người).`,
  };

  // Worksheet tasks synchronized with detailed knowledge activities
  const worksheetTasks = knowledgeActivities.map(
    (act, idx) =>
      `Phiếu học tập số ${idx + 1} (${act.activityCode} – NLS ${act.nlsCodes}): ${act.guidingQuestions[0]} | ${act.guidingQuestions[1]}`
  );
  worksheetTasks.push(
    `Phiếu kiểm chứng AI (CV 3456: 1.2.NC1a, 6.2.NC1a | QĐ 2422: Mạch 2, 3): Thực hành đặt câu lệnh có cấu trúc hỏi trợ lý AI về một tình huống của "${cleanTitle}", sau đó đối chiếu với SGK để kiểm chứng tính chính xác và chỉnh sửa lỗi sai (nếu có).`
  );
  worksheetTasks.push(
    `Phiếu thiết kế ý tưởng AI (CV 3456: 3.1.NC1a, 5.2.NC1a | QĐ 2422: Mạch 1, 4): Phác thảo luồng dữ liệu cho một ứng dụng AI hỗ trợ "${cleanTitle}" (${domainCtx.sensorExample} → Mô hình AI → Cảnh báo cho người sản xuất).`
  );

  const digitalAiRubric = [
    'Mức Tốt (CV 3456 & QĐ 2422): Khai thác đúng nguồn chính thống (1.1.NC1a, 1.2.NC1a), đặt prompt rõ ràng, tự kiểm chứng và phát hiện được sai lệch của AI, trích dẫn minh bạch và phác thảo được luồng hệ thống AI lấy con người làm trung tâm.',
    'Mức Đạt: Biết sử dụng công cụ số hợp tác nhóm (2.4.NC1a) và tạo sản phẩm số (3.1.NC1a); sử dụng AI có đối chiếu SGK dưới sự hướng dẫn của GV, không sao chép nguyên văn.',
    'Mức Cần cố gắng: Còn phụ thuộc vào kết quả AI chưa kiểm chứng hoặc chưa tuân thủ quy tắc an toàn dữ liệu và trích dẫn nguồn (cần GV hướng dẫn củng cố Mã 1.2.NC1a & 4.2.NC1a).',
  ];

  return {
    id: `${chapter.id}-lesson-${lessonIndex + 1}`,
    chapter,
    lessonIndex,
    rawLessonTitle,
    cleanLessonTitle: cleanTitle,
    pageHint: effectivePageHint,
    isPractical,
    periods,
    domainLabel,
    knowledgeObjectives,
    generalCompetencies,
    techCompetencies,
    digitalCompetencies,
    aiEducationStrands,
    qualities,
    teacherMaterials,
    studentMaterials,
    warmupPrompt,
    knowledgeActivities,
    matchedGlossary,
    practiceMcqs,
    applicationTf,
    applicationTask,
    aiPracticeActivity,
    worksheetTasks,
    digitalAiRubric,
  };
}

function buildLessonPlanPlainText(plan: BuiltLessonPlan): string {
  const lines: string[] = [
    `KẾ HOẠCH BÀI DẠY (CHUẨN CÔNG VĂN 5512/BGDĐT-GDTrH)`,
    `Tích hợp Năng lực số theo Công văn số 3456/BGDĐT-GDPT ngày 27/06/2025 & Khung nội dung giáo dục AI theo Quyết định số 2422/QĐ-BGDĐT ngày 18/08/2026 của Bộ GD&ĐT`,
    `Môn học: Công nghệ ${plan.chapter.grade} (${plan.domainLabel}) – Bộ sách Kết nối tri thức với cuộc sống`,
    `${plan.chapter.chapterNumber}: ${plan.chapter.chapterTitle}`,
    `TÊN BÀI DẠY: ${plan.cleanLessonTitle.toUpperCase()}`,
    `Thời lượng thực hiện: ${plan.periods} tiết | Tham chiếu: ${plan.pageHint} | Tổ chức lớp: Chia lớp thành 8 nhóm (Nhóm 1 – Nhóm 8)`,
    ``,
    `I. MỤC TIÊU`,
    `1. Về kiến thức:`,
    ...plan.knowledgeObjectives.map((item) => `   - ${item}`),
    `2. Về năng lực:`,
    `   a) Năng lực chung:`,
    ...plan.generalCompetencies.map((item) => `      - ${item}`),
    `   b) Năng lực Công nghệ:`,
    ...plan.techCompetencies.map((item) => `      - ${item}`),
    `   c) Năng lực số tích hợp (theo Công văn số 3456/BGDĐT-GDPT ngày 27/06/2025 – Bậc Nâng cao THPT):`,
    ...plan.digitalCompetencies.map(
      (dc) => `      - [${dc.code}] ${dc.domain} (${dc.activityRef}): ${dc.description}`
    ),
    `   d) Giáo dục Trí tuệ nhân tạo tích hợp (theo Quyết định số 2422/QĐ-BGDĐT ngày 18/08/2026 – Cấp THPT):`,
    ...plan.aiEducationStrands.map(
      (ai) => `      - ${ai.strandCode} – ${ai.strandName} (${ai.activityRef}): ${ai.integrationContent}`
    ),
    `3. Về phẩm chất:`,
    ...plan.qualities.map((item) => `   - ${item}`),
    ``,
    `II. THIẾT BỊ DẠY HỌC VÀ HỌC LIỆU`,
    `1. Giáo viên:`,
    ...plan.teacherMaterials.map((item) => `   - ${item}`),
    `2. Học sinh:`,
    ...plan.studentMaterials.map((item) => `   - ${item}`),
    ``,
    `III. TIẾN TRÌNH DẠY HỌC`,
    `1. Hoạt động 1: Mở đầu / Khởi động (5 phút)`,
    `   - Mục tiêu: Tạo hứng thú học tập, kết nối kiến thức nền với bài học mới và định hướng tư duy lấy con người làm trung tâm khi tiếp cận công nghệ số/AI.`,
    `   - Nội dung & Tổ chức thực hiện: ${plan.warmupPrompt}`,
    ``,
    `2. Hoạt động 2: Hình thành kiến thức mới (Biên soạn chi tiết chuẩn CV 5512)`,
    ...plan.knowledgeActivities.flatMap((act) => [
      `   ---------------------------------------------------------`,
      `   ${act.activityCode}: ${act.title} (${act.durationMinutes} phút) [NLS: ${act.nlsCodes} | GD AI: ${act.aiStrandTag}]`,
      `   a) Mục tiêu: ${act.objective}`,
      `   b) Nội dung nhiệm vụ (${act.organizationMode}): ${act.learningContentSummary}`,
      ...act.guidingQuestions.map((gq) => `      - ${gq}`),
      `   c) Sản phẩm dự kiến (Nội dung ghi bảng):`,
      ...act.boardPoints.flatMap((bp) => [
        `      + ${bp.lead ? `${bp.lead}: ` : ''}${bp.text}`,
        ...(bp.subPoints ? bp.subPoints.map((sp) => `         * ${sp}`) : []),
      ]),
      ...(act.comparisonTable
        ? [
            `      [Bảng tổng hợp: ${act.comparisonTable.headers.join(' | ')}]`,
            ...act.comparisonTable.rows.map((r) => `         - ${r.join(' | ')}`),
          ]
        : []),
      ...(act.deepExplanation
        ? [
            `      [Phân tích chuyên sâu SGK] ${act.deepExplanation.question}`,
            ...act.deepExplanation.answers.map((ans) => `         -> ${ans}`),
          ]
        : []),
      ...(act.keyTakeaway ? [`      [Ghi nhớ trọng tâm]: ${act.keyTakeaway}`] : []),
      `   d) Tổ chức thực hiện (4 bước CV 5512):`,
      `      - Bước 1 (Chuyển giao nhiệm vụ): ${act.steps.step1Transfer}`,
      `      - Bước 2 (Thực hiện nhiệm vụ): ${act.steps.step2Execute}`,
      `      - Bước 3 (Báo cáo, thảo luận): ${act.steps.step3Report}`,
      `      - Bước 4 (Kết luận, nhận định): ${act.steps.step4Conclude}`,
    ]),
    ``,
    `   * ${plan.aiPracticeActivity.title}:`,
    `     - Gợi ý câu lệnh (Prompt): ${plan.aiPracticeActivity.promptTemplate}`,
    `     - Quy tắc kiểm chứng & Đạo đức AI: ${plan.aiPracticeActivity.verificationRule}`,
    `     - Sản phẩm dự kiến: ${plan.aiPracticeActivity.expectedProduct}`,
    ...(plan.matchedGlossary.length > 0
      ? [
          `   * Hệ thống thuật ngữ SGK trọng tâm:`,
          ...plan.matchedGlossary.map((g) => `     - ${g.term} (${g.pages}): ${g.definition}`),
        ]
      : []),
    ``,
    `3. Hoạt động 3: Luyện tập (10 phút) [Tích hợp NLS: 4.2.NC1a, 5.2.NC1a]`,
    ...plan.practiceMcqs.map(
      (q, i) =>
        `   Câu ${i + 1}: ${q.question}\n   A. ${q.options[0]} | B. ${q.options[1]} | C. ${q.options[2]} | D. ${q.options[3]}\n   -> Đáp án: ${OPTION_LABELS[q.correctIndex]} (${q.explanation})`
    ),
    ``,
    `4. Hoạt động 4: Vận dụng và mở rộng (5 phút) [Tích hợp NLS: 3.1.NC1a, 6.2.NC1a | GD AI: Mạch 2, 4]`,
    `   - Nhiệm vụ: ${plan.applicationTask}`,
    ...(plan.applicationTf
      ? [
          `   - Tình huống Đúng/Sai tham khảo: ${plan.applicationTf.context}`,
          ...plan.applicationTf.statements.map(
            (st) => `     ${st.label}) ${st.text} [${st.isTrue ? 'Đúng' : 'Sai'}]`
          ),
        ]
      : []),
    ``,
    `IV. HỒ SƠ DẠY HỌC (PHIẾU HỌC TẬP & TIÊU CHÍ ĐÁNH GIÁ NLS – AI)`,
    `1. Phiếu học tập:`,
    ...plan.worksheetTasks.map((t) => `   - ${t}`),
    `2. Tiêu chí đánh giá tích hợp Năng lực số (CV 3456) & Giáo dục AI (QĐ 2422):`,
    ...plan.digitalAiRubric.map((r) => `   - ${r}`),
  ];

  return lines.join('\n');
}

function buildSingleLessonHtmlFragment(plan: BuiltLessonPlan, isFirst: boolean): string {
  const digitalTableRows = plan.digitalCompetencies
    .map(
      (dc) => `
      <tr>
        <td style="border:1px solid #94a3b8; padding:5pt; font-weight:bold; color:#0f766e; white-space:nowrap;">${escapeHtml(dc.code)}</td>
        <td style="border:1px solid #94a3b8; padding:5pt; font-weight:bold;">${escapeHtml(dc.domain)}</td>
        <td style="border:1px solid #94a3b8; padding:5pt;">${escapeHtml(dc.description)}</td>
        <td style="border:1px solid #94a3b8; padding:5pt; text-align:center;">${escapeHtml(dc.activityRef)}</td>
      </tr>`
    )
    .join('');

  const aiTableRows = plan.aiEducationStrands
    .map(
      (ai) => `
      <tr>
        <td style="border:1px solid #94a3b8; padding:5pt; font-weight:bold; color:#4338ca; white-space:nowrap;">${escapeHtml(ai.strandCode)}</td>
        <td style="border:1px solid #94a3b8; padding:5pt; font-weight:bold;">${escapeHtml(ai.strandName)}</td>
        <td style="border:1px solid #94a3b8; padding:5pt;">${escapeHtml(ai.integrationContent)}</td>
        <td style="border:1px solid #94a3b8; padding:5pt; text-align:center;">${escapeHtml(ai.activityRef)}</td>
      </tr>`
    )
    .join('');

  const knowledgeActivitiesHtml = plan.knowledgeActivities
    .map((act) => {
      const boardPointsHtml = act.boardPoints
        .map(
          (bp) => `
          <li style="margin-bottom:4pt;">
            ${bp.lead ? `<strong>${escapeHtml(bp.lead)}:</strong> ` : ''}${escapeHtml(bp.text)}
            ${
              bp.subPoints && bp.subPoints.length > 0
                ? `<ul style="margin:2pt 0 2pt 0; padding-left:14pt;">${bp.subPoints
                    .map((sp) => `<li style="margin-bottom:2pt;">${escapeHtml(sp)}</li>`)
                    .join('')}</ul>`
                : ''
            }
          </li>`
        )
        .join('');

      const comparisonTableHtml = act.comparisonTable
        ? `
          <table style="width:100%; border-collapse:collapse; margin-top:6pt; font-size:10pt;">
            <thead>
              <tr style="background-color:#e2e8f0;">
                ${act.comparisonTable.headers
                  .map(
                    (h) =>
                      `<th style="border:1px solid #94a3b8; padding:4pt; text-align:left;">${escapeHtml(h)}</th>`
                  )
                  .join('')}
              </tr>
            </thead>
            <tbody>
              ${act.comparisonTable.rows
                .map(
                  (row) =>
                    `<tr>${row
                      .map(
                        (cell) =>
                          `<td style="border:1px solid #94a3b8; padding:4pt; vertical-align:top;">${escapeHtml(cell)}</td>`
                      )
                      .join('')}</tr>`
                )
                .join('')}
            </tbody>
          </table>`
        : '';

      const deepExplanationHtml = act.deepExplanation
        ? `
          <div style="background-color:#f8fafc; border-left:3px solid #047857; padding:5pt 7pt; margin-top:6pt; font-size:10.5pt;">
            <p style="margin:0 0 3pt 0;"><strong>Giải thích chuyên sâu SGK:</strong> <em>${escapeHtml(act.deepExplanation.question)}</em></p>
            <ul style="margin:0; padding-left:14pt;">
              ${act.deepExplanation.answers
                .map((ans) => `<li style="margin-bottom:2pt;">${escapeHtml(ans)}</li>`)
                .join('')}
            </ul>
          </div>`
        : '';

      const takeawayHtml = act.keyTakeaway
        ? `<p style="margin:6pt 0 0 0; font-size:10.5pt; color:#92400e; background-color:#fffbeb; border:1px solid #fde68a; padding:4pt 6pt;"><strong>Ghi nhớ trọng tâm:</strong> ${escapeHtml(act.keyTakeaway)}</p>`
        : '';

      return `
      <div style="margin-bottom:12pt;">
        <p style="margin:8pt 0 3pt 0; font-weight:bold; color:#064e3b; font-size:11.5pt;">
          ${escapeHtml(act.activityCode)}: ${escapeHtml(act.title)} (${act.durationMinutes} phút)
          <span style="font-weight:normal; color:#0f766e; font-size:10.5pt;">[NLS: ${escapeHtml(act.nlsCodes)} | GD AI: ${escapeHtml(act.aiStrandTag)}]</span>
        </p>
        <p style="margin:2pt 0;"><strong>a) Mục tiêu:</strong> ${escapeHtml(act.objective)}</p>
        <p style="margin:2pt 0;"><strong>b) Nội dung nhiệm vụ (${escapeHtml(act.organizationMode)}):</strong> ${escapeHtml(act.learningContentSummary)}</p>
        <ul style="margin:2pt 0 4pt 0; padding-left:18pt; font-size:11pt;">
          ${act.guidingQuestions.map((gq) => `<li>${escapeHtml(gq)}</li>`).join('')}
        </ul>
        <p style="margin:2pt 0 4pt 0;"><strong>c) Sản phẩm dự kiến &amp; d) Tổ chức thực hiện (4 bước CV 5512):</strong></p>
        <table style="width:100%; border-collapse:collapse; margin-bottom:6pt; font-size:11pt;">
          <thead>
            <tr style="background-color:#ecfdf5;">
              <th style="border:1px solid #94a3b8; padding:6pt; width:46%; text-align:left;">Hoạt động của GV và HS (4 bước)</th>
              <th style="border:1px solid #94a3b8; padding:6pt; width:54%; text-align:left;">Dự kiến sản phẩm / Nội dung ghi bảng</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td style="border:1px solid #94a3b8; padding:6pt; vertical-align:top;">
                <p style="margin:0 0 5pt 0;"><strong>Bước 1 (Chuyển giao nhiệm vụ):</strong> ${escapeHtml(act.steps.step1Transfer)}</p>
                <p style="margin:0 0 5pt 0;"><strong>Bước 2 (Thực hiện nhiệm vụ):</strong> ${escapeHtml(act.steps.step2Execute)}</p>
                <p style="margin:0 0 5pt 0;"><strong>Bước 3 (Báo cáo, thảo luận):</strong> ${escapeHtml(act.steps.step3Report)}</p>
                <p style="margin:0;"><strong>Bước 4 (Kết luận, nhận định):</strong> ${escapeHtml(act.steps.step4Conclude)}</p>
              </td>
              <td style="border:1px solid #94a3b8; padding:6pt; vertical-align:top;">
                <ul style="margin:0; padding-left:14pt;">
                  ${boardPointsHtml}
                </ul>
                ${comparisonTableHtml}
                ${deepExplanationHtml}
                ${takeawayHtml}
              </td>
            </tr>
          </tbody>
        </table>
      </div>`;
    })
    .join('');

  const glossaryHtml =
    plan.matchedGlossary.length > 0
      ? `
      <div style="background-color:#f0fdf4; border:1px solid #86efac; padding:7pt; margin:8pt 0; font-size:10.5pt;">
        <p style="margin:0 0 4pt 0; font-weight:bold; color:#166534;">Hệ thống thuật ngữ chuyên ngành SGK liên quan:</p>
        <ul style="margin:0; padding-left:16pt;">
          ${plan.matchedGlossary
            .map(
              (g) =>
                `<li style="margin-bottom:2pt;"><strong>${escapeHtml(g.term)}</strong> (${escapeHtml(g.pages)}): ${escapeHtml(g.definition)}</li>`
            )
            .join('')}
        </ul>
      </div>`
      : '';

  const mcqHtml = plan.practiceMcqs
    .map(
      (q, i) => `
      <div style="margin-bottom:6pt; font-size:11.5pt;">
        <p style="margin:0 0 2pt 0;"><strong>Câu ${i + 1}:</strong> ${escapeHtml(q.question)}</p>
        <p style="margin:0 0 2pt 12pt;">
          <strong>A.</strong> ${escapeHtml(q.options[0])} &nbsp;&nbsp;
          <strong>B.</strong> ${escapeHtml(q.options[1])} &nbsp;&nbsp;
          <strong>C.</strong> ${escapeHtml(q.options[2])} &nbsp;&nbsp;
          <strong>D.</strong> ${escapeHtml(q.options[3])}
        </p>
        <p style="margin:0 0 0 12pt; color:#047857; font-size:10.5pt;">
          <em>Đáp án: ${OPTION_LABELS[q.correctIndex]} — ${escapeHtml(q.explanation)}</em>
        </p>
      </div>`
    )
    .join('');

  const tfHtml = plan.applicationTf
    ? `
      <div style="background-color:#f8fafc; border:1px solid #cbd5e1; padding:8pt; margin-top:6pt; font-size:11.5pt;">
        <p style="margin:0 0 4pt 0;"><strong>Tình huống vận dụng (Dạng Đúng/Sai):</strong> ${escapeHtml(plan.applicationTf.context)}</p>
        <ul style="margin:0; padding-left:16pt;">
          ${plan.applicationTf.statements
            .map(
              (st) =>
                `<li style="margin-bottom:2pt;"><strong>${st.label})</strong> ${escapeHtml(st.text)} <em>(${st.isTrue ? 'Đúng' : 'Sai'} — ${escapeHtml(st.explanation)})</em></li>`
            )
            .join('')}
        </ul>
      </div>`
    : '';

  return `
  <div style="${isFirst ? '' : 'page-break-before:always;'} margin-bottom:20pt;">
    <table style="width:100%; border-collapse:collapse; margin-bottom:10pt; font-size:11pt;">
      <tr>
        <td style="width:55%; vertical-align:top;">
          <p style="margin:0; font-weight:bold;">TRƯỜNG THPT ........................................</p>
          <p style="margin:2pt 0 0 0; font-weight:bold;">TỔ: CÔNG NGHỆ – NÔNG NGHIỆP</p>
        </td>
        <td style="width:45%; vertical-align:top; text-align:right;">
          <p style="margin:0;">Họ và tên GV: .....................................</p>
          <p style="margin:2pt 0 0 0;">Ngày soạn: ....../....../20......</p>
        </td>
      </tr>
    </table>

    <div style="text-align:center; border-top:2px solid #047857; border-bottom:2px solid #047857; padding:8pt 0; margin-bottom:12pt;">
      <p style="margin:0; font-size:11pt; font-weight:bold; color:#047857; text-transform:uppercase;">
        KẾ HOẠCH BÀI DẠY (THEO CÔNG VĂN 5512/BGDĐT-GDTrH)
      </p>
      <p style="margin:2pt 0 4pt 0; font-size:10pt; color:#3730a3; font-weight:bold;">
        Tích hợp Năng lực số (CV 3456/BGDĐT-GDPT ngày 27/06/2025) &amp; Khung Giáo dục AI (QĐ 2422/QĐ-BGDĐT ngày 18/08/2026)
      </p>
      <h2 style="margin:4pt 0; font-size:14.5pt; color:#064e3b; text-transform:uppercase;">
        ${escapeHtml(plan.cleanLessonTitle)}
      </h2>
      <p style="margin:0; font-size:11pt; color:#334155;">
        Môn học: Công nghệ ${escapeHtml(plan.chapter.grade)} (${escapeHtml(plan.domainLabel)}) &bull;
        ${escapeHtml(plan.chapter.chapterNumber)}: ${escapeHtml(plan.chapter.chapterTitle)} &bull;
        Thời lượng: ${plan.periods} tiết (${escapeHtml(plan.pageHint)}) &bull;
        Tổ chức lớp: Chia thành 8 nhóm (Nhóm 1 – Nhóm 8)
      </p>
    </div>

    <h3 style="margin:10pt 0 4pt 0; font-size:12.5pt; color:#065f46; text-transform:uppercase;">I. MỤC TIÊU</h3>
    <p style="margin:4pt 0 2pt 0;"><strong>1. Về kiến thức:</strong></p>
    <ul style="margin:0 0 6pt 0; padding-left:18pt;">
      ${plan.knowledgeObjectives.map((item) => `<li>${escapeHtml(item)}</li>`).join('')}
    </ul>

    <p style="margin:4pt 0 2pt 0;"><strong>2. Về năng lực:</strong></p>
    <p style="margin:2pt 0 2pt 12pt;"><em>a) Năng lực chung:</em></p>
    <ul style="margin:0 0 4pt 0; padding-left:24pt;">
      ${plan.generalCompetencies.map((item) => `<li>${escapeHtml(item)}</li>`).join('')}
    </ul>
    <p style="margin:2pt 0 2pt 12pt;"><em>b) Năng lực Công nghệ:</em></p>
    <ul style="margin:0 0 6pt 0; padding-left:24pt;">
      ${plan.techCompetencies.map((item) => `<li>${escapeHtml(item)}</li>`).join('')}
    </ul>

    <p style="margin:4pt 0 4pt 12pt;"><em>c) Năng lực số tích hợp (theo Công văn số 3456/BGDĐT-GDPT ngày 27/06/2025 của Bộ GD&amp;ĐT – Bậc Nâng cao THPT):</em></p>
    <table style="width:100%; border-collapse:collapse; margin-bottom:8pt; font-size:10.5pt;">
      <thead>
        <tr style="background-color:#f0fdfa;">
          <th style="border:1px solid #94a3b8; padding:5pt; width:16%; text-align:left;">Mã chỉ báo</th>
          <th style="border:1px solid #94a3b8; padding:5pt; width:24%; text-align:left;">Miền năng lực số</th>
          <th style="border:1px solid #94a3b8; padding:5pt; width:46%; text-align:left;">Biểu hiện tích hợp cụ thể trong bài dạy</th>
          <th style="border:1px solid #94a3b8; padding:5pt; width:14%; text-align:center;">Hoạt động</th>
        </tr>
      </thead>
      <tbody>
        ${digitalTableRows}
      </tbody>
    </table>

    <p style="margin:4pt 0 4pt 12pt;"><em>d) Nội dung Giáo dục Trí tuệ nhân tạo tích hợp (theo Quyết định số 2422/QĐ-BGDĐT ngày 18/08/2026 của Bộ GD&amp;ĐT – Cấp THPT):</em></p>
    <table style="width:100%; border-collapse:collapse; margin-bottom:8pt; font-size:10.5pt;">
      <thead>
        <tr style="background-color:#eef2ff;">
          <th style="border:1px solid #94a3b8; padding:5pt; width:12%; text-align:left;">Mạch</th>
          <th style="border:1px solid #94a3b8; padding:5pt; width:26%; text-align:left;">Mạch kiến thức GD AI</th>
          <th style="border:1px solid #94a3b8; padding:5pt; width:48%; text-align:left;">Nội dung tích hợp gắn với bài học</th>
          <th style="border:1px solid #94a3b8; padding:5pt; width:14%; text-align:center;">Hoạt động</th>
        </tr>
      </thead>
      <tbody>
        ${aiTableRows}
      </tbody>
    </table>

    <p style="margin:4pt 0 2pt 0;"><strong>3. Về phẩm chất:</strong></p>
    <ul style="margin:0 0 8pt 0; padding-left:18pt;">
      ${plan.qualities.map((item) => `<li>${escapeHtml(item)}</li>`).join('')}
    </ul>

    <h3 style="margin:10pt 0 4pt 0; font-size:12.5pt; color:#065f46; text-transform:uppercase;">II. THIẾT BỊ DẠY HỌC VÀ HỌC LIỆU</h3>
    <p style="margin:4pt 0 2pt 0;"><strong>1. Đối với giáo viên:</strong></p>
    <ul style="margin:0 0 4pt 0; padding-left:18pt;">
      ${plan.teacherMaterials.map((item) => `<li>${escapeHtml(item)}</li>`).join('')}
    </ul>
    <p style="margin:4pt 0 2pt 0;"><strong>2. Đối với học sinh:</strong></p>
    <ul style="margin:0 0 8pt 0; padding-left:18pt;">
      ${plan.studentMaterials.map((item) => `<li>${escapeHtml(item)}</li>`).join('')}
    </ul>

    <h3 style="margin:10pt 0 4pt 0; font-size:12.5pt; color:#065f46; text-transform:uppercase;">III. TIẾN TRÌNH DẠY HỌC</h3>

    <p style="margin:6pt 0 3pt 0; font-weight:bold;">A. Hoạt động 1: Mở đầu / Khởi động (5 phút)</p>
    <ul style="margin:0 0 6pt 0; padding-left:18pt;">
      <li><strong>Mục tiêu:</strong> Khơi gợi hứng thú, kết nối trải nghiệm thực tế của HS với nội dung ${escapeHtml(plan.cleanLessonTitle)} và định hướng tư duy lấy con người làm trung tâm.</li>
      <li><strong>Nội dung &amp; Tổ chức thực hiện:</strong> ${escapeHtml(plan.warmupPrompt)}</li>
      <li><strong>Sản phẩm:</strong> Câu trả lời ban đầu của HS và định hướng nhiệm vụ học tập của bài mới.</li>
    </ul>

    <p style="margin:8pt 0 4pt 0; font-weight:bold; font-size:12pt; color:#064e3b;">B. Hoạt động 2: Hình thành kiến thức mới (Chi tiết từng mục nội dung chuẩn CV 5512)</p>
    ${knowledgeActivitiesHtml}

    <div style="background-color:#eef2ff; border:1px solid #818cf8; padding:8pt; margin:8pt 0; font-size:11pt;">
      <p style="margin:0 0 4pt 0; font-weight:bold; color:#312e81;">
        ${escapeHtml(plan.aiPracticeActivity.title)}
      </p>
      <p style="margin:0 0 3pt 0;"><strong>Câu lệnh (Prompt) thực hành có cấu trúc:</strong> ${escapeHtml(plan.aiPracticeActivity.promptTemplate)}</p>
      <p style="margin:0 0 3pt 0;"><strong>Yêu cầu kiểm chứng &amp; Đạo đức AI:</strong> ${escapeHtml(plan.aiPracticeActivity.verificationRule)}</p>
      <p style="margin:0;"><strong>Sản phẩm dự kiến:</strong> ${escapeHtml(plan.aiPracticeActivity.expectedProduct)}</p>
    </div>

    ${glossaryHtml}

    <p style="margin:6pt 0 3pt 0; font-weight:bold;">C. Hoạt động 3: Luyện tập (10 phút) — <em>Tích hợp NLS: 4.2.NC1a, 5.2.NC1a</em></p>
    <p style="margin:0 0 4pt 0;"><em>GV tổ chức cho HS hoàn thành nhanh bộ câu hỏi trắc nghiệm củng cố (trên phiếu hoặc hệ thống luyện đề trực tuyến):</em></p>
    ${mcqHtml}

    <p style="margin:6pt 0 3pt 0; font-weight:bold;">D. Hoạt động 4: Vận dụng và mở rộng (5 phút) — <em>Tích hợp NLS: 3.1.NC1a, 6.2.NC1a | GD AI: Mạch 2, 4</em></p>
    <p style="margin:0 0 4pt 0;"><strong>Nhiệm vụ giao về nhà:</strong> ${escapeHtml(plan.applicationTask)}</p>
    ${tfHtml}

    <h3 style="margin:10pt 0 4pt 0; font-size:12.5pt; color:#065f46; text-transform:uppercase;">IV. HỒ SƠ DẠY HỌC (PHIẾU HỌC TẬP &amp; RUBRIC ĐÁNH GIÁ NLS – AI)</h3>
    <p style="margin:4pt 0 2pt 0;"><strong>1. Phiếu học tập gợi ý:</strong></p>
    <ul style="margin:0 0 6pt 0; padding-left:18pt;">
      ${plan.worksheetTasks.map((t) => `<li>${escapeHtml(t)}</li>`).join('')}
    </ul>
    <p style="margin:4pt 0 2pt 0;"><strong>2. Tiêu chí đánh giá tích hợp Năng lực số (CV 3456) &amp; Giáo dục AI (QĐ 2422):</strong></p>
    <ul style="margin:0 0 6pt 0; padding-left:18pt;">
      ${plan.digitalAiRubric.map((r) => `<li>${escapeHtml(r)}</li>`).join('')}
    </ul>
    <p style="margin:6pt 0 0 0; font-style:italic; color:#475569;">Rút kinh nghiệm sau tiết dạy: ..............................................................................................................</p>
  </div>`;
}

function buildKhbdWordDocument(plans: BuiltLessonPlan[], docTitle: string): string {
  const bodyHtml = plans
    .map((plan, idx) => buildSingleLessonHtmlFragment(plan, idx === 0))
    .join('\n');

  return `<!DOCTYPE html>
<html xmlns:o="urn:schemas-microsoft-com:office:office"
      xmlns:w="urn:schemas-microsoft-com:office:word"
      xmlns="http://www.w3.org/TR/REC-html40">
<head>
  <meta charset="utf-8" />
  <title>${escapeHtml(docTitle)}</title>
  <!--[if gte mso 9]>
  <xml>
    <w:WordDocument>
      <w:View>Print</w:View>
      <w:Zoom>100</w:Zoom>
      <w:DoNotOptimizeForBrowser/>
    </w:WordDocument>
  </xml>
  <![endif]-->
  <style>
    @page {
      size: 21cm 29.7cm;
      margin: 2cm 2cm 2cm 2.5cm;
    }
    body {
      font-family: "Times New Roman", Times, serif;
      font-size: 12pt;
      line-height: 1.4;
      color: #111827;
    }
  </style>
</head>
<body>
  ${bodyHtml}
</body>
</html>`;
}

export const KhbdLessonPlanSection: React.FC<KhbdLessonPlanSectionProps> = ({
  activeGrade,
  bookName,
  chapters,
  allGradeChapters,
  currentUser,
  canDownloadDocuments = true,
  onRequireLogin,
  onRequireVipUpgrade,
}) => {
  const [expandedPlanId, setExpandedPlanId] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [downloadedId, setDownloadedId] = useState<string | null>(null);

  const chapterPlansMap = useMemo(() => {
    return chapters.map((ch) => ({
      chapter: ch,
      plans: ch.lessons.map((rawLesson, idx) => buildLessonPlan(ch, rawLesson, idx)),
    }));
  }, [chapters]);

  const totalVisibleLessons = useMemo(
    () => chapterPlansMap.reduce((sum, item) => sum + item.plans.length, 0),
    [chapterPlansMap]
  );

  const totalGradeLessons = useMemo(
    () => allGradeChapters.reduce((sum, ch) => sum + ch.lessons.length, 0),
    [allGradeChapters]
  );

  const totalGradePeriods = useMemo(
    () =>
      allGradeChapters.reduce(
        (sum, ch) =>
          sum +
          ch.lessons.reduce(
            (lsum, raw) => lsum + (/thực hành|dự án|trải nghiệm/i.test(raw) ? 1 : 2),
            0
          ),
        0
      ),
    [allGradeChapters]
  );

  const getTrackCategory = (): 'de_lop_10' | 'de_lop_11' | 'de_lop_12' => {
    if (activeGrade === '10') return 'de_lop_10';
    if (activeGrade === '11') return 'de_lop_11';
    return 'de_lop_12';
  };

  const ensureDownloadPermission = (loginMsg: string): boolean => {
    if (!currentUser) {
      onRequireLogin?.(loginMsg);
      return false;
    }
    if (!canDownloadDocuments) {
      onRequireVipUpgrade?.();
      return false;
    }
    return true;
  };

  const handleCopyPlan = (plan: BuiltLessonPlan) => {
    const text = buildLessonPlanPlainText(plan);
    navigator.clipboard.writeText(text);
    setCopiedId(plan.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleDownloadSinglePlan = (plan: BuiltLessonPlan) => {
    if (
      !ensureDownloadPermission(
        'Vui lòng đăng nhập tài khoản để tải Kế hoạch bài dạy (KHBD chuẩn CV 5512 – Tích hợp NLS & AI) dạng Word (.docx)!'
      )
    ) {
      return;
    }
    const docTitle = `KHBD LỚP ${plan.chapter.grade} (TÍCH HỢP NLS 3456 & AI 2422) - ${plan.cleanLessonTitle}`;
    const html = buildKhbdWordDocument([plan], docTitle);
    const filename = `KHBD_5512_NLS3456_AI2422_Cong_Nghe_${plan.chapter.grade}_${plan.chapter.id.toUpperCase()}_Bai_${plan.lessonIndex + 1}.docx`;
    downloadHtmlAsDocx(html, filename);
    trackDocumentDownload({
      fileName: filename,
      documentTitle: `KHBD Lớp ${plan.chapter.grade} (NLS 3456 & AI 2422) - ${plan.cleanLessonTitle}`,
      category: getTrackCategory(),
      categoryLabel: `KHBD CV 5512 · NLS 3456 · AI 2422 (Lớp ${plan.chapter.grade})`,
      modeLabel: 'Kế hoạch bài dạy chi tiết tích hợp NLS & AI (.docx)',
    });
    setDownloadedId(plan.id);
    setTimeout(() => setDownloadedId(null), 2500);
  };

  const handleDownloadChapterPlans = (chapter: ChapterReviewItem, plans: BuiltLessonPlan[]) => {
    if (
      !ensureDownloadPermission(
        'Vui lòng đăng nhập tài khoản để tải trọn bộ KHBD theo chương dạng Word (.docx)!'
      )
    ) {
      return;
    }
    const docTitle = `KHBD LỚP ${chapter.grade} (NLS 3456 & AI 2422) - ${chapter.chapterNumber}: ${chapter.chapterTitle}`;
    const html = buildKhbdWordDocument(plans, docTitle);
    const filename = `KHBD_5512_NLS3456_AI2422_Cong_Nghe_${chapter.grade}_${chapter.id.toUpperCase()}_Ca_Chuong.docx`;
    downloadHtmlAsDocx(html, filename);
    trackDocumentDownload({
      fileName: filename,
      documentTitle: `KHBD Lớp ${chapter.grade} (NLS 3456 & AI 2422) - ${chapter.chapterNumber}: ${chapter.chapterTitle}`,
      category: getTrackCategory(),
      categoryLabel: `KHBD CV 5512 · NLS 3456 · AI 2422 (Lớp ${chapter.grade})`,
      modeLabel: `Trọn bộ KHBD chương (${plans.length} bài .docx)`,
    });
    setDownloadedId(`chapter-${chapter.id}`);
    setTimeout(() => setDownloadedId(null), 2500);
  };

  const handleDownloadAllGradePlans = () => {
    if (
      !ensureDownloadPermission(
        `Vui lòng đăng nhập tài khoản để tải trọn bộ KHBD Công nghệ Lớp ${activeGrade} (.docx)!`
      )
    ) {
      return;
    }
    const allPlans = allGradeChapters.flatMap((ch) =>
      ch.lessons.map((raw, idx) => buildLessonPlan(ch, raw, idx))
    );
    const docTitle = `TRỌN BỘ KHBD (CV 5512 · NLS 3456 · AI 2422) CÔNG NGHỆ LỚP ${activeGrade}`;
    const html = buildKhbdWordDocument(allPlans, docTitle);
    const filename = `Tron_Bo_KHBD_5512_NLS3456_AI2422_Cong_Nghe_Lop_${activeGrade}.docx`;
    downloadHtmlAsDocx(html, filename);
    trackDocumentDownload({
      fileName: filename,
      documentTitle: `Trọn bộ KHBD Lớp ${activeGrade} tích hợp NLS 3456 & AI 2422 (${allPlans.length} bài)`,
      category: getTrackCategory(),
      categoryLabel: `KHBD CV 5512 · NLS 3456 · AI 2422 (Lớp ${activeGrade})`,
      modeLabel: `Trọn bộ cả năm Lớp ${activeGrade} (.docx)`,
    });
    setDownloadedId(`grade-all-${activeGrade}`);
    setTimeout(() => setDownloadedId(null), 2500);
  };

  return (
    <div className="space-y-5">
      {/* Top Overview & Policy Framework Card */}
      <div className="bg-white rounded-2xl border border-indigo-200 p-5 sm:p-6 shadow-2xs space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md bg-indigo-50 text-indigo-800 border border-indigo-200 text-xs font-bold">
                <ClipboardList className="w-3.5 h-3.5" />
                <span>Chuẩn CV 5512/BGDĐT-GDTrH</span>
              </span>
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md bg-teal-50 text-teal-800 border border-teal-200 text-xs font-bold">
                <Cpu className="w-3.5 h-3.5" />
                <span>Năng lực số · CV 3456/BGDĐT-GDPT (27/06/2025)</span>
              </span>
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md bg-violet-50 text-violet-800 border border-violet-200 text-xs font-bold">
                <Bot className="w-3.5 h-3.5" />
                <span>Khung GD AI · QĐ 2422/QĐ-BGDĐT (18/08/2026)</span>
              </span>
            </div>

            <h2 className="text-lg sm:text-xl font-extrabold text-slate-900">
              Kho KHBD {bookName} (Lớp {activeGrade}) — Biên Soạn Chi Tiết &amp; Tích Hợp NLS – AI
            </h2>

            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed max-w-4xl">
              Gồm <strong>{allGradeChapters.length} chương</strong> ·{' '}
              <strong>{totalGradeLessons} bài học</strong> (dự kiến ~{totalGradePeriods} tiết) bám sát SGK Kết nối tri thức với cuộc sống. Phần <strong>Hình thành kiến thức mới</strong> được biên soạn chi tiết theo từng tiểu mục (Mục tiêu – Câu hỏi định hướng – Bảng 2 cột tổ chức 4 bước CV 5512 – Nội dung ghi bảng – Giải thích cơ sở khoa học SGK &amp; Thuật ngữ), tích hợp đầy đủ <strong>Năng lực số (CV 3456)</strong> và <strong>Giáo dục AI (QĐ 2422)</strong>.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 shrink-0">
            <button
              type="button"
              onClick={handleDownloadAllGradePlans}
              className="px-4 py-2.5 rounded-xl bg-indigo-700 hover:bg-indigo-800 text-white text-xs sm:text-sm font-bold shadow-xs transition-all flex items-center gap-2 cursor-pointer"
            >
              {downloadedId === `grade-all-${activeGrade}` ? (
                <>
                  <Check className="w-4 h-4 text-emerald-300" />
                  <span>Đã xuất trọn bộ KHBD Lớp {activeGrade}!</span>
                </>
              ) : (
                <>
                  <FileDown className="w-4 h-4" />
                  <span>Tải trọn bộ KHBD Lớp {activeGrade} ({totalGradeLessons} bài .docx)</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Two Reference Framework Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2 border-t border-slate-100">
          <div className="rounded-xl bg-teal-50/70 border border-teal-200 p-3.5 space-y-1">
            <p className="text-xs font-extrabold text-teal-900 flex items-center gap-1.5">
              <Cpu className="w-4 h-4 text-teal-700 shrink-0" />
              <span>Tích hợp Năng lực số — CV 3456/BGDĐT-GDPT (27/06/2025)</span>
            </p>
            <p className="text-[11px] text-teal-900/85 leading-relaxed">
              Gắn mã chỉ báo bậc Nâng cao cấp THPT (<strong>1.1.NC1a – 6.2.NC1a</strong>) trải đều 6 miền: Khai thác dữ liệu · Giao tiếp &amp; hợp tác số · Sáng tạo nội dung số · An toàn không gian mạng · Giải quyết vấn đề · Ứng dụng AI.
            </p>
          </div>

          <div className="rounded-xl bg-violet-50/70 border border-violet-200 p-3.5 space-y-1">
            <p className="text-xs font-extrabold text-violet-900 flex items-center gap-1.5">
              <Bot className="w-4 h-4 text-violet-700 shrink-0" />
              <span>Tích hợp Khung Giáo dục AI — QĐ 2422/QĐ-BGDĐT (18/08/2026)</span>
            </p>
            <p className="text-[11px] text-violet-900/85 leading-relaxed">
              Lồng ghép đủ 4 mạch kiến thức cấp THPT: <strong>(1) Tư duy lấy con người làm trung tâm · (2) Đạo đức AI · (3) Kỹ thuật &amp; ứng dụng AI · (4) Thiết kế hệ thống AI</strong> gắn định hướng nghề nghiệp.
            </p>
          </div>
        </div>

        <div className="pt-2 border-t border-slate-100 flex flex-wrap items-center gap-4 text-xs text-slate-600">
          <span className="inline-flex items-center gap-1.5 font-semibold text-indigo-800">
            <Layers className="w-3.5 h-3.5" />
            Đang hiển thị {chapterPlansMap.length} chương ({totalVisibleLessons} bài KHBD)
          </span>
          <span className="inline-flex items-center gap-1.5">
            <Target className="w-3.5 h-3.5 text-emerald-600" />
            Hình thành kiến thức chi tiết bảng 2 cột · Chia lớp thành 8 nhóm (Nhóm 1 – Nhóm 8)
          </span>
          <span className="inline-flex items-center gap-1.5">
            <BookOpenCheck className="w-3.5 h-3.5 text-amber-600" />
            Kèm Giải thích chuyên sâu SGK, Thuật ngữ, Phiếu học tập &amp; Rubric
          </span>
        </div>
      </div>

      {/* Chapter Groups & Lesson Plan Cards */}
      {chapterPlansMap.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-10 text-center space-y-2">
          <ClipboardList className="w-10 h-10 text-slate-300 mx-auto" />
          <p className="text-sm font-bold text-slate-700">
            Không tìm thấy Kế hoạch bài dạy phù hợp với từ khóa đang lọc.
          </p>
          <p className="text-xs text-slate-500">
            Hãy thử xóa từ khóa tìm kiếm hoặc chọn &ldquo;Tất cả chương&rdquo; ở thanh bộ lọc phía trên.
          </p>
        </div>
      ) : (
        <div className="space-y-5">
          {chapterPlansMap.map(({ chapter, plans }) => (
            <div
              key={chapter.id}
              className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden"
            >
              {/* Chapter Header */}
              <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-emerald-950 px-5 py-4 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <div className="flex flex-wrap items-center gap-2 text-[11px] font-bold text-indigo-200 uppercase">
                    <span>{chapter.chapterNumber}</span>
                    <span>•</span>
                    <span>{chapter.pageRef}</span>
                    <span>•</span>
                    <span>{plans.length} KHBD (Tích hợp NLS 3456 &amp; AI 2422)</span>
                  </div>
                  <h3 className="text-base sm:text-lg font-extrabold mt-0.5 text-white">
                    {chapter.chapterTitle}
                  </h3>
                </div>

                <button
                  type="button"
                  onClick={() => handleDownloadChapterPlans(chapter, plans)}
                  className="px-3.5 py-2 rounded-lg bg-white/15 hover:bg-white/25 border border-white/25 text-white text-xs font-bold transition-all flex items-center justify-center gap-1.5 shrink-0 cursor-pointer"
                >
                  {downloadedId === `chapter-${chapter.id}` ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-300" />
                      <span>Đã tải KHBD cả chương</span>
                    </>
                  ) : (
                    <>
                      <Download className="w-3.5 h-3.5" />
                      <span>Tải KHBD cả chương (.docx)</span>
                    </>
                  )}
                </button>
              </div>

              {/* Lessons List */}
              <div className="divide-y divide-slate-100">
                {plans.map((plan) => {
                  const isExpanded = expandedPlanId === plan.id;
                  return (
                    <div key={plan.id} className="p-4 sm:p-5 transition-colors hover:bg-slate-50/60">
                      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                        <div className="space-y-1.5 min-w-0">
                          <div className="flex flex-wrap items-center gap-1.5">
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-indigo-50 text-indigo-800 border border-indigo-200 text-[11px] font-bold">
                              <FileText className="w-3 h-3" />
                              CV 5512 ({plan.knowledgeActivities.length} tiểu mục HTKT)
                            </span>
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-teal-50 text-teal-800 border border-teal-200 text-[11px] font-bold">
                              <Cpu className="w-3 h-3" />
                              NLS 3456 (NC1)
                            </span>
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-violet-50 text-violet-800 border border-violet-200 text-[11px] font-bold">
                              <Bot className="w-3 h-3" />
                              GD AI 2422
                            </span>
                            {plan.isPractical && (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-amber-50 text-amber-800 border border-amber-200 text-[11px] font-bold">
                                <FlaskConical className="w-3 h-3" />
                                Thực hành
                              </span>
                            )}
                            <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-slate-500 ml-1">
                              <Clock className="w-3 h-3" />
                              {plan.periods} tiết · {plan.pageHint}
                            </span>
                          </div>

                          <h4 className="text-sm sm:text-base font-bold text-slate-900 leading-snug">
                            {plan.cleanLessonTitle}
                          </h4>

                          <p className="text-xs text-slate-600 line-clamp-2">
                            <strong className="text-slate-700">Các hoạt động hình thành kiến thức:</strong>{' '}
                            {plan.knowledgeActivities
                              .map((a) => `${a.activityCode} (${a.title})`)
                              .join(' · ')}
                          </p>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex flex-wrap items-center gap-2 shrink-0">
                          <button
                            type="button"
                            onClick={() => setExpandedPlanId(isExpanded ? null : plan.id)}
                            className={`px-3 py-2 rounded-lg text-xs font-bold border transition-all flex items-center gap-1.5 cursor-pointer ${
                              isExpanded
                                ? 'bg-indigo-700 text-white border-indigo-700'
                                : 'bg-indigo-50 text-indigo-800 border-indigo-200 hover:bg-indigo-100'
                            }`}
                          >
                            {isExpanded ? (
                              <>
                                <ChevronUp className="w-3.5 h-3.5" />
                                <span>Thu gọn KHBD</span>
                              </>
                            ) : (
                              <>
                                <ChevronDown className="w-3.5 h-3.5" />
                                <span>Xem KHBD chi tiết</span>
                              </>
                            )}
                          </button>

                          <button
                            type="button"
                            onClick={() => handleCopyPlan(plan)}
                            className="px-3 py-2 rounded-lg text-xs font-bold bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 transition-all flex items-center gap-1.5 cursor-pointer"
                            title="Sao chép nội dung KHBD"
                          >
                            {copiedId === plan.id ? (
                              <>
                                <Check className="w-3.5 h-3.5 text-emerald-600" />
                                <span className="text-emerald-700">Đã chép</span>
                              </>
                            ) : (
                              <>
                                <Copy className="w-3.5 h-3.5" />
                                <span>Sao chép</span>
                              </>
                            )}
                          </button>

                          <button
                            type="button"
                            onClick={() => handleDownloadSinglePlan(plan)}
                            className="px-3 py-2 rounded-lg text-xs font-bold bg-emerald-700 hover:bg-emerald-800 text-white border border-emerald-700 transition-all flex items-center gap-1.5 cursor-pointer"
                          >
                            {downloadedId === plan.id ? (
                              <>
                                <Check className="w-3.5 h-3.5 text-emerald-200" />
                                <span>Đã tải .docx</span>
                              </>
                            ) : (
                              <>
                                <Download className="w-3.5 h-3.5" />
                                <span>Tải Word (.docx)</span>
                              </>
                            )}
                          </button>
                        </div>
                      </div>

                      {/* Expanded Full CV 5512 + CV 3456 + QĐ 2422 Lesson Plan Preview */}
                      {isExpanded && (
                        <div className="mt-4 pt-4 border-t border-indigo-100 space-y-5 text-xs sm:text-sm text-slate-800 bg-slate-50/70 rounded-xl p-4 sm:p-5 border">
                          {/* I. MỤC TIÊU */}
                          <section className="space-y-3">
                            <h5 className="text-sm font-extrabold text-indigo-900 uppercase flex items-center gap-1.5">
                              <Target className="w-4 h-4 text-indigo-700" />
                              I. Mục tiêu bài dạy
                            </h5>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                              <div className="bg-white rounded-xl p-3.5 border border-slate-200 space-y-1.5">
                                <p className="font-bold text-emerald-800 text-xs uppercase">
                                  1. Về kiến thức
                                </p>
                                <ul className="list-disc pl-4 space-y-1 text-xs text-slate-700">
                                  {plan.knowledgeObjectives.map((obj, idx) => (
                                    <li key={idx}>{obj}</li>
                                  ))}
                                </ul>
                              </div>

                              <div className="bg-white rounded-xl p-3.5 border border-slate-200 space-y-1.5">
                                <p className="font-bold text-indigo-800 text-xs uppercase">
                                  2. Năng lực chung &amp; Công nghệ
                                </p>
                                <ul className="list-disc pl-4 space-y-1 text-xs text-slate-700">
                                  {plan.techCompetencies.map((comp, idx) => (
                                    <li key={idx}>{comp}</li>
                                  ))}
                                </ul>
                              </div>

                              <div className="bg-white rounded-xl p-3.5 border border-slate-200 space-y-1.5">
                                <p className="font-bold text-amber-800 text-xs uppercase">
                                  3. Về phẩm chất
                                </p>
                                <ul className="list-disc pl-4 space-y-1 text-xs text-slate-700">
                                  {plan.qualities.map((q, idx) => (
                                    <li key={idx}>{q}</li>
                                  ))}
                                </ul>
                              </div>
                            </div>

                            {/* I.2c Năng lực số theo CV 3456/BGDĐT-GDPT (27/06/2025) */}
                            <div className="bg-white rounded-xl border border-teal-200 overflow-hidden">
                              <div className="bg-teal-50 px-4 py-2.5 border-b border-teal-200 flex flex-wrap items-center justify-between gap-2">
                                <p className="font-extrabold text-teal-900 text-xs flex items-center gap-1.5">
                                  <Cpu className="w-4 h-4 text-teal-700" />
                                  <span>
                                    2c. Năng lực số tích hợp — Công văn số 3456/BGDĐT-GDPT (ngày 27/06/2025 · Bậc Nâng cao THPT)
                                  </span>
                                </p>
                              </div>
                              <div className="overflow-x-auto">
                                <table className="w-full text-left border-collapse text-xs">
                                  <thead>
                                    <tr className="bg-slate-50 text-slate-700 border-b border-slate-200">
                                      <th className="px-3 py-2 font-bold w-32">Mã chỉ báo</th>
                                      <th className="px-3 py-2 font-bold w-52">Miền năng lực số</th>
                                      <th className="px-3 py-2 font-bold">Biểu hiện tích hợp trong bài</th>
                                      <th className="px-3 py-2 font-bold w-28 text-center">Hoạt động</th>
                                    </tr>
                                  </thead>
                                  <tbody className="divide-y divide-slate-100">
                                    {plan.digitalCompetencies.map((dc, idx) => (
                                      <tr key={idx} className="hover:bg-teal-50/30">
                                        <td className="px-3 py-2 font-extrabold text-teal-800 align-top whitespace-nowrap">
                                          {dc.code}
                                        </td>
                                        <td className="px-3 py-2 font-semibold text-slate-800 align-top">
                                          {dc.domain}
                                        </td>
                                        <td className="px-3 py-2 text-slate-700 align-top">
                                          {dc.description}
                                        </td>
                                        <td className="px-3 py-2 text-center text-teal-700 font-semibold align-top whitespace-nowrap">
                                          {dc.activityRef}
                                        </td>
                                      </tr>
                                    ))}
                                  </tbody>
                                </table>
                              </div>
                            </div>

                            {/* I.2d Khung Giáo dục AI theo QĐ 2422/QĐ-BGDĐT (18/08/2026) */}
                            <div className="bg-white rounded-xl border border-violet-200 overflow-hidden">
                              <div className="bg-violet-50 px-4 py-2.5 border-b border-violet-200 flex flex-wrap items-center justify-between gap-2">
                                <p className="font-extrabold text-violet-900 text-xs flex items-center gap-1.5">
                                  <Bot className="w-4 h-4 text-violet-700" />
                                  <span>
                                    2d. Giáo dục Trí tuệ nhân tạo tích hợp — Quyết định số 2422/QĐ-BGDĐT (ngày 18/08/2026 · 4 mạch cấp THPT)
                                  </span>
                                </p>
                              </div>
                              <div className="overflow-x-auto">
                                <table className="w-full text-left border-collapse text-xs">
                                  <thead>
                                    <tr className="bg-slate-50 text-slate-700 border-b border-slate-200">
                                      <th className="px-3 py-2 font-bold w-24">Mạch</th>
                                      <th className="px-3 py-2 font-bold w-56">Mạch nội dung GD AI</th>
                                      <th className="px-3 py-2 font-bold">Nội dung lồng ghép cụ thể</th>
                                      <th className="px-3 py-2 font-bold w-28 text-center">Hoạt động</th>
                                    </tr>
                                  </thead>
                                  <tbody className="divide-y divide-slate-100">
                                    {plan.aiEducationStrands.map((ai, idx) => (
                                      <tr key={idx} className="hover:bg-violet-50/30">
                                        <td className="px-3 py-2 font-extrabold text-violet-800 align-top whitespace-nowrap">
                                          {ai.strandCode}
                                        </td>
                                        <td className="px-3 py-2 font-semibold text-slate-800 align-top">
                                          {ai.strandName}
                                        </td>
                                        <td className="px-3 py-2 text-slate-700 align-top">
                                          {ai.integrationContent}
                                        </td>
                                        <td className="px-3 py-2 text-center text-violet-700 font-semibold align-top whitespace-nowrap">
                                          {ai.activityRef}
                                        </td>
                                      </tr>
                                    ))}
                                  </tbody>
                                </table>
                              </div>
                            </div>
                          </section>

                          {/* II. THIẾT BỊ DẠY HỌC VÀ HỌC LIỆU */}
                          <section className="space-y-2">
                            <h5 className="text-sm font-extrabold text-indigo-900 uppercase flex items-center gap-1.5">
                              <Wrench className="w-4 h-4 text-indigo-700" />
                              II. Thiết bị dạy học và học liệu (kèm học liệu số &amp; AI)
                            </h5>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                              <div className="bg-white rounded-xl p-3.5 border border-slate-200">
                                <p className="font-bold text-slate-800 text-xs mb-1">1. Giáo viên:</p>
                                <ul className="list-disc pl-4 space-y-1 text-xs text-slate-700">
                                  {plan.teacherMaterials.map((m, idx) => (
                                    <li key={idx}>{m}</li>
                                  ))}
                                </ul>
                              </div>
                              <div className="bg-white rounded-xl p-3.5 border border-slate-200">
                                <p className="font-bold text-slate-800 text-xs mb-1">2. Học sinh:</p>
                                <ul className="list-disc pl-4 space-y-1 text-xs text-slate-700">
                                  {plan.studentMaterials.map((m, idx) => (
                                    <li key={idx}>{m}</li>
                                  ))}
                                </ul>
                              </div>
                            </div>
                          </section>

                          {/* III. TIẾN TRÌNH DẠY HỌC (4 HOẠT ĐỘNG 5512) */}
                          <section className="space-y-4">
                            <h5 className="text-sm font-extrabold text-indigo-900 uppercase flex items-center gap-1.5">
                              <Sparkles className="w-4 h-4 text-indigo-700" />
                              III. Tiến trình dạy học (4 hoạt động chuẩn CV 5512 tích hợp NLS &amp; AI)
                            </h5>

                            {/* Hoạt động 1 */}
                            <div className="bg-white rounded-xl p-4 border border-slate-200 space-y-1.5">
                              <p className="font-bold text-emerald-900 text-xs sm:text-sm">
                                Hoạt động 1: Mở đầu / Khởi động (5 phút)
                              </p>
                              <p className="text-xs text-slate-700 leading-relaxed">{plan.warmupPrompt}</p>
                            </div>

                            {/* Hoạt động 2 — BIÊN SOẠN CHI TIẾT */}
                            <div className="bg-white rounded-xl p-4 sm:p-5 border-2 border-emerald-200 space-y-4">
                              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-emerald-100 pb-3">
                                <div>
                                  <p className="font-extrabold text-emerald-950 text-sm sm:text-base">
                                    Hoạt động 2: Hình thành kiến thức mới (Biên soạn chi tiết chuẩn CV 5512)
                                  </p>
                                  <p className="text-xs text-slate-600 mt-0.5">
                                    Gồm {plan.knowledgeActivities.length} hoạt động thành phần + 01 hoạt động thực hành tích hợp Năng lực số &amp; Giáo dục AI — đầy đủ Mục tiêu, Câu hỏi định hướng, Tổ chức 4 bước và Nội dung ghi bảng.
                                  </p>
                                </div>
                              </div>

                              <div className="space-y-4">
                                {plan.knowledgeActivities.map((act, aIdx) => (
                                  <div
                                    key={aIdx}
                                    className="rounded-xl border border-emerald-200 bg-emerald-50/25 overflow-hidden"
                                  >
                                    {/* Sub-activity Header */}
                                    <div className="bg-emerald-900 text-white px-4 py-2.5 flex flex-wrap items-center justify-between gap-2">
                                      <p className="font-extrabold text-xs sm:text-sm">
                                        {act.activityCode}: {act.title} ({act.durationMinutes} phút)
                                      </p>
                                      <div className="flex flex-wrap items-center gap-1.5 text-[10px] font-bold">
                                        <span className="px-2 py-0.5 rounded bg-teal-500/30 border border-teal-300/40 text-teal-100">
                                          NLS: {act.nlsCodes}
                                        </span>
                                        <span className="px-2 py-0.5 rounded bg-violet-500/30 border border-violet-300/40 text-violet-100">
                                          GD AI: {act.aiStrandTag}
                                        </span>
                                      </div>
                                    </div>

                                    <div className="p-4 space-y-3.5 bg-white">
                                      {/* a) Mục tiêu & b) Nội dung nhiệm vụ */}
                                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 text-xs">
                                        <div className="rounded-lg bg-slate-50 border border-slate-200 p-3 space-y-1">
                                          <p className="font-bold text-emerald-900">a) Mục tiêu hoạt động:</p>
                                          <p className="text-slate-700 leading-relaxed">{act.objective}</p>
                                          <p className="text-[11px] text-slate-600 pt-1">
                                            <strong>Hình thức tổ chức:</strong> {act.organizationMode}
                                          </p>
                                        </div>

                                        <div className="rounded-lg bg-indigo-50/50 border border-indigo-200 p-3 space-y-1.5">
                                          <p className="font-bold text-indigo-950">
                                            b) Nội dung nhiệm vụ &amp; Hệ thống câu hỏi định hướng:
                                          </p>
                                          <ul className="list-disc pl-4 space-y-1 text-slate-800">
                                            {act.guidingQuestions.map((gq, gIdx) => (
                                              <li key={gIdx}>{gq}</li>
                                            ))}
                                          </ul>
                                        </div>
                                      </div>

                                      {/* c) Sản phẩm dự kiến & d) Tổ chức thực hiện 2 cột chuẩn CV 5512 */}
                                      <div className="grid grid-cols-1 lg:grid-cols-12 border border-slate-300 rounded-xl overflow-hidden text-xs">
                                        {/* Left Column: 4 Steps of GV & HS */}
                                        <div className="lg:col-span-6 border-b lg:border-b-0 lg:border-r border-slate-300 bg-white">
                                          <div className="bg-slate-100 px-3.5 py-2 border-b border-slate-300 font-extrabold text-slate-900">
                                            d) Tổ chức thực hiện — Hoạt động của GV và HS (4 bước)
                                          </div>
                                          <div className="p-3.5 space-y-2.5 leading-relaxed text-slate-700">
                                            <div>
                                              <span className="font-extrabold text-emerald-900">
                                                Bước 1. Chuyển giao nhiệm vụ:
                                              </span>{' '}
                                              {act.steps.step1Transfer}
                                            </div>
                                            <div>
                                              <span className="font-extrabold text-emerald-900">
                                                Bước 2. Thực hiện nhiệm vụ:
                                              </span>{' '}
                                              {act.steps.step2Execute}
                                            </div>
                                            <div>
                                              <span className="font-extrabold text-emerald-900">
                                                Bước 3. Báo cáo, thảo luận:
                                              </span>{' '}
                                              {act.steps.step3Report}
                                            </div>
                                            <div>
                                              <span className="font-extrabold text-emerald-900">
                                                Bước 4. Kết luận, nhận định:
                                              </span>{' '}
                                              {act.steps.step4Conclude}
                                            </div>
                                          </div>
                                        </div>

                                        {/* Right Column: Expected Product / Board Content */}
                                        <div className="lg:col-span-6 bg-emerald-50/20">
                                          <div className="bg-emerald-100/80 px-3.5 py-2 border-b border-slate-300 font-extrabold text-emerald-950">
                                            c) Dự kiến sản phẩm / Nội dung ghi bảng chi tiết
                                          </div>
                                          <div className="p-3.5 space-y-3">
                                            <ul className="list-disc pl-4 space-y-2 text-slate-800 leading-relaxed">
                                              {act.boardPoints.map((bp, bpIdx) => (
                                                <li key={bpIdx}>
                                                  {bp.lead && (
                                                    <strong className="text-slate-950">{bp.lead}: </strong>
                                                  )}
                                                  <span>{bp.text}</span>
                                                  {bp.subPoints && bp.subPoints.length > 0 && (
                                                    <ul className="list-circle pl-4 mt-1 space-y-1 text-slate-700">
                                                      {bp.subPoints.map((sp, spIdx) => (
                                                        <li key={spIdx}>– {sp}</li>
                                                      ))}
                                                    </ul>
                                                  )}
                                                </li>
                                              ))}
                                            </ul>

                                            {/* Structured Comparison Table if available */}
                                            {act.comparisonTable && (
                                              <div className="overflow-x-auto rounded-lg border border-slate-300 bg-white">
                                                <table className="w-full text-left border-collapse text-[11px]">
                                                  <thead>
                                                    <tr className="bg-slate-100 border-b border-slate-300">
                                                      {act.comparisonTable.headers.map((h, hIdx) => (
                                                        <th
                                                          key={hIdx}
                                                          className="px-2.5 py-1.5 font-bold text-slate-900 border-r last:border-r-0 border-slate-200"
                                                        >
                                                          {h}
                                                        </th>
                                                      ))}
                                                    </tr>
                                                  </thead>
                                                  <tbody className="divide-y divide-slate-200">
                                                    {act.comparisonTable.rows.map((row, rIdx) => (
                                                      <tr key={rIdx}>
                                                        {row.map((cell, cIdx) => (
                                                          <td
                                                            key={cIdx}
                                                            className="px-2.5 py-1.5 text-slate-700 align-top border-r last:border-r-0 border-slate-200"
                                                          >
                                                            {cell}
                                                          </td>
                                                        ))}
                                                      </tr>
                                                    ))}
                                                  </tbody>
                                                </table>
                                              </div>
                                            )}

                                            {/* Deep Scientific Explanation from chapter.questions */}
                                            {act.deepExplanation && (
                                              <div className="rounded-lg bg-white border-l-4 border-emerald-600 border border-slate-200 p-3 space-y-1">
                                                <p className="font-bold text-emerald-900 text-[11px] uppercase">
                                                  Phân tích chuyên sâu &amp; Giải thích cơ sở khoa học (SGK):
                                                </p>
                                                <p className="font-semibold text-slate-900 italic">
                                                  {act.deepExplanation.question}
                                                </p>
                                                <ul className="list-disc pl-4 space-y-1 text-slate-700">
                                                  {act.deepExplanation.answers.map((ans, ansIdx) => (
                                                    <li key={ansIdx}>{ans}</li>
                                                  ))}
                                                </ul>
                                              </div>
                                            )}

                                            {/* Core Summary Note */}
                                            {act.keyTakeaway && (
                                              <div className="rounded-lg bg-amber-50 border border-amber-200 p-2.5 flex items-start gap-2 text-[11px] text-amber-950">
                                                <Lightbulb className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                                                <div>
                                                  <strong>Ghi nhớ trọng tâm: </strong>
                                                  {act.keyTakeaway}
                                                </div>
                                              </div>
                                            )}
                                          </div>
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                ))}

                                {/* Điểm nhấn thực hành AI & Đạo đức AI */}
                                <div className="rounded-xl border border-violet-200 bg-violet-50/60 p-4 space-y-1.5">
                                  <p className="font-extrabold text-violet-950 text-xs sm:text-sm flex items-center gap-1.5">
                                    <Bot className="w-4 h-4 text-violet-700 shrink-0" />
                                    <span>{plan.aiPracticeActivity.title}</span>
                                  </p>
                                  <p className="text-xs text-slate-800">
                                    <strong>Câu lệnh (Prompt) mẫu (Mạch 3 – Kỹ thuật AI):</strong>{' '}
                                    <span className="italic">{plan.aiPracticeActivity.promptTemplate}</span>
                                  </p>
                                  <p className="text-xs text-slate-800">
                                    <strong>Kiểm chứng &amp; Đạo đức AI (Mạch 2 · Mã 1.2.NC1a, 6.2.NC1a):</strong>{' '}
                                    {plan.aiPracticeActivity.verificationRule}
                                  </p>
                                  <p className="text-xs text-slate-800">
                                    <strong>Sản phẩm học tập:</strong> {plan.aiPracticeActivity.expectedProduct}
                                  </p>
                                </div>

                                {/* Matched SGK Glossary Terms */}
                                {plan.matchedGlossary.length > 0 && (
                                  <div className="rounded-xl border border-emerald-200 bg-emerald-50/40 p-4 space-y-2">
                                    <p className="font-extrabold text-emerald-950 text-xs flex items-center gap-1.5">
                                      <Bookmark className="w-4 h-4 text-emerald-700 shrink-0" />
                                      <span>Hệ thống thuật ngữ chuyên ngành SGK liên quan đến bài học</span>
                                    </p>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                                      {plan.matchedGlossary.map((g, gIdx) => (
                                        <div
                                          key={gIdx}
                                          className="bg-white rounded-lg p-2.5 border border-emerald-100 text-xs"
                                        >
                                          <p className="font-bold text-emerald-900">
                                            {g.term}{' '}
                                            <span className="font-normal text-[11px] text-slate-500">
                                              ({g.pages})
                                            </span>
                                          </p>
                                          <p className="text-slate-700 mt-0.5">{g.definition}</p>
                                        </div>
                                      ))}
                                    </div>
                                  </div>
                                )}
                              </div>
                            </div>

                            {/* Hoạt động 3 */}
                            <div className="bg-white rounded-xl p-4 border border-slate-200 space-y-2.5">
                              <p className="font-bold text-emerald-900 text-xs sm:text-sm">
                                Hoạt động 3: Luyện tập củng cố (10 phút — {plan.practiceMcqs.length} câu hỏi nhanh · NLS 4.2.NC1a, 5.2.NC1a)
                              </p>
                              <div className="space-y-2">
                                {plan.practiceMcqs.map((q, qIdx) => (
                                  <div
                                    key={qIdx}
                                    className="rounded-lg bg-slate-50 border border-slate-200 p-3 text-xs space-y-1"
                                  >
                                    <p className="font-semibold text-slate-900">
                                      Câu {qIdx + 1}: {q.question}
                                    </p>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-1 text-slate-700 pl-1">
                                      {q.options.map((opt, oIdx) => (
                                        <span
                                          key={oIdx}
                                          className={
                                            oIdx === q.correctIndex
                                              ? 'font-bold text-emerald-800'
                                              : ''
                                          }
                                        >
                                          {OPTION_LABELS[oIdx]}. {opt}
                                        </span>
                                      ))}
                                    </div>
                                    <p className="text-[11px] text-emerald-700 italic">
                                      Đáp án {OPTION_LABELS[q.correctIndex]}: {q.explanation}
                                    </p>
                                  </div>
                                ))}
                              </div>
                            </div>

                            {/* Hoạt động 4 */}
                            <div className="bg-white rounded-xl p-4 border border-slate-200 space-y-2">
                              <p className="font-bold text-emerald-900 text-xs sm:text-sm">
                                Hoạt động 4: Vận dụng và mở rộng (5 phút · NLS 3.1.NC1a, 6.2.NC1a | GD AI: Mạch 2, 4)
                              </p>
                              <p className="text-xs text-slate-700">{plan.applicationTask}</p>
                              {plan.applicationTf && (
                                <div className="rounded-lg bg-amber-50/70 border border-amber-200 p-3 space-y-1.5 text-xs">
                                  <p className="font-bold text-amber-950">
                                    Tình huống Đúng/Sai tích hợp thực tiễn:
                                  </p>
                                  <p className="text-slate-800">{plan.applicationTf.context}</p>
                                  <ul className="space-y-1 pl-1">
                                    {plan.applicationTf.statements.map((st) => (
                                      <li key={st.label} className="text-slate-700">
                                        <strong className="text-slate-900">{st.label})</strong> {st.text}{' '}
                                        <span
                                          className={`inline-block px-1.5 py-0.5 rounded text-[10px] font-bold ${
                                            st.isTrue
                                              ? 'bg-emerald-100 text-emerald-800'
                                              : 'bg-rose-100 text-rose-800'
                                          }`}
                                        >
                                          {st.isTrue ? 'Đúng' : 'Sai'}
                                        </span>
                                      </li>
                                    ))}
                                  </ul>
                                </div>
                              )}
                            </div>
                          </section>

                          {/* IV. HỒ SƠ DẠY HỌC & RUBRIC NLS - AI */}
                          <section className="grid grid-cols-1 lg:grid-cols-2 gap-3">
                            <div className="bg-white rounded-xl p-4 border border-slate-200 space-y-1.5">
                              <h5 className="text-xs sm:text-sm font-extrabold text-indigo-900 uppercase">
                                IV.1. Phiếu học tập gợi ý
                              </h5>
                              <ul className="list-disc pl-4 space-y-1 text-xs text-slate-700">
                                {plan.worksheetTasks.map((task, tIdx) => (
                                  <li key={tIdx}>{task}</li>
                                ))}
                              </ul>
                            </div>

                            <div className="bg-white rounded-xl p-4 border border-teal-200 space-y-1.5">
                              <h5 className="text-xs sm:text-sm font-extrabold text-teal-900 uppercase flex items-center gap-1.5">
                                <ShieldCheck className="w-4 h-4 text-teal-700 shrink-0" />
                                <span>IV.2. Tiêu chí đánh giá NLS (CV 3456) &amp; GD AI (QĐ 2422)</span>
                              </h5>
                              <ul className="list-disc pl-4 space-y-1 text-xs text-slate-700">
                                {plan.digitalAiRubric.map((rubric, rIdx) => (
                                  <li key={rIdx}>{rubric}</li>
                                ))}
                              </ul>
                            </div>
                          </section>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
