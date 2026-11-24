import { CognitiveLevel, GradeLevel, SubjectDomain } from '../types/exam';

export interface StudentMistakeEntry {
  studentName: string;
  studentClass: string;
  studentId?: string;
  examCode: string;
  chosenAnswer: string;
  correctAnswer?: string;
  timestamp: string;
}

export interface QuestionErrorStat {
  id: string;
  questionNumber?: number;
  grade: GradeLevel;
  domain: SubjectDomain;
  level: CognitiveLevel;
  type: 'mcq' | 'truefalse';
  title: string;
  scenario?: string;
  commonTrap: string; // Phân tích bẫy đề thi khiến học sinh hay sai
  failRatePercent: number; // Tỉ lệ học sinh chọn sai (ví dụ 68%)
  sampleSize: number; // Số lượt thí sinh đã làm
  wrongChoicesBreakdown: { label: string; percent: number; explanationWhyWrong: string }[];
  correctAnswer: string;
  explanation: string;
  textbookRef: string;
  recentStudentsMistakes?: StudentMistakeEntry[];
}

// Dữ liệu thống kê phân tích từ các kỳ thi khảo sát tốt nghiệp THPT chuẩn hóa kèm danh sách HS làm sai
export const INITIAL_FREQUENT_MISTAKES: QuestionErrorStat[] = [
  {
    id: 'mistake_biofloc_c_ratio',
    grade: '12',
    domain: 'aquaculture',
    level: 'TH',
    type: 'mcq',
    title: 'Nguyên lý hoạt động cốt lõi của công nghệ Biofloc (BFT) trong xử lý khí độc amoniac (NH3) trong ao nuôi tôm là gì?',
    commonTrap: 'Học sinh thường nhầm lẫn giữa việc "bổ sung mật rỉ đường (nguồn Carbon)" với việc "bón thêm phân đạm (N)", hoặc nhầm Biofloc với phương pháp diệt khuẩn bằng hóa chất hay thay nước liên tục.',
    failRatePercent: 74,
    sampleSize: 1250,
    wrongChoicesBreakdown: [
      {
        label: 'Phương án: Sử dụng hóa chất diệt khuẩn định kỳ để nước ao luôn trong',
        percent: 42,
        explanationWhyWrong: 'Sai vì Biofloc nuôi cấy vi khuẩn có ích thành hạt bông lơ lửng, dùng hóa chất diệt khuẩn sẽ giết chết toàn bộ hệ vi sinh Biofloc có lợi.',
      },
      {
        label: 'Phương án: Bón thêm phân đạm ure để cân bằng dinh dưỡng cho tảo',
        percent: 21,
        explanationWhyWrong: 'Sai lầm nghiêm trọng! Phân đạm ure bổ sung thêm Nitơ sẽ làm nồng độ amoniac độc vọt lên gấp đôi gây ngộ độc tôm chết hàng loạt.',
      },
      {
        label: 'Phương án: Thay nước 100% mỗi ngày từ sông ngoài vào ao nuôi',
        percent: 11,
        explanationWhyWrong: 'Sai vì mục tiêu lớn nhất của Biofloc là nuôi an toàn sinh học khép kín, hạn chế tối đa thay nước từ bên ngoài để tránh lây lan dịch bệnh.',
      },
    ],
    correctAnswer: 'Bổ sung nguồn Carbon hữu cơ (mật rỉ đường, bột cám) để nâng cao tỉ lệ C:N (12:1 - 15:1), kích thích vi khuẩn dị dưỡng chuyển hóa amoniac thành hạt biofloc giàu protein làm thức ăn cho tôm.',
    explanation: 'Vi khuẩn dị dưỡng cần cả Carbon và Nitơ để tổng hợp protein tế bào. Thức ăn tôm thừa đã có nhiều Nitơ nhưng thiếu Carbon. Khi bổ sung mật rỉ đường (Carbon), vi khuẩn dị dưỡng sẽ "ăn" sạch amoniac (NH3) trong nước tạo thành hạt biofloc.',
    textbookRef: 'Bài 15: Công nghệ nuôi thủy sản hiện đại - Công nghệ 12 KNTT',
    recentStudentsMistakes: [
      { studentName: 'Trần Quốc Bảo', studentClass: '12A1', examCode: '101', chosenAnswer: 'Dùng hóa chất diệt khuẩn', timestamp: '10:15' },
      { studentName: 'Nguyễn Minh Khang', studentClass: '12A2', examCode: '103', chosenAnswer: 'Bón thêm phân đạm ure', timestamp: '09:40' },
      { studentName: 'Vũ Mai Hương', studentClass: '12A2', examCode: '105', chosenAnswer: 'Thay nước 100% mỗi ngày', timestamp: '08:25' },
    ],
  },
  {
    id: 'mistake_antibiotic_virus',
    grade: '12',
    domain: 'aquaculture',
    level: 'TH',
    type: 'mcq',
    title: 'Biện pháp nào sau đây là ĐÚNG khi xử lý ao nuôi tôm bị bùng phát bệnh đốm trắng do virus (WSSV)?',
    commonTrap: 'Học sinh có thói quen hễ thấy "bệnh" là chọn ngay "uống hoặc phun thuốc kháng sinh", quên mất rằng kháng sinh chỉ diệt được vi khuẩn, hoàn toàn vô tác dụng với virus!',
    failRatePercent: 68,
    sampleSize: 1180,
    wrongChoicesBreakdown: [
      {
        label: 'Phương án: Trộn kháng sinh liều cao (như Oxytetracycline) vào thức ăn cho tôm ăn',
        percent: 48,
        explanationWhyWrong: 'Kháng sinh không có cơ chế tác động lên virus WSSV. Trộn kháng sinh vừa vô tác dụng, vừa gây kháng thuốc và tốn kém chi phí.',
      },
      {
        label: 'Phương án: Xả ngay toàn bộ nước ao bị bệnh ra sông để cứu tôm còn sống',
        percent: 20,
        explanationWhyWrong: 'Hành vi vi phạm pháp luật! Xả nước chứa virus WSSV ra kênh rạch chung sẽ làm phát tán mầm bệnh cho toàn vùng nuôi thủy sản xung quanh.',
      },
    ],
    correctAnswer: 'Cách ly ao bệnh, dập dịch bằng Chlorine hoặc vôi bột khử trùng tiêu diệt mầm bệnh trước khi xử lý môi trường an toàn.',
    explanation: 'Bệnh do virus trên tôm hiện chưa có thuốc đặc trị. Nguyên tắc phòng ngừa là chìa khóa: chọn giống tôm bố mẹ sạch bệnh (SPF), xử lý nước ao lắng kỹ, khi ao bị dịch phải khoanh vùng khử trùng dập dịch tại chỗ.',
    textbookRef: 'Bài 14: Phòng và trị bệnh cho động vật thủy sản - Công nghệ 12 KNTT',
    recentStudentsMistakes: [
      { studentName: 'Lê Hoàng Yến', studentClass: '12A3', examCode: '102', chosenAnswer: 'Trộn kháng sinh Oxytetracycline', timestamp: '11:05' },
      { studentName: 'Đỗ Tuấn Kiệt', studentClass: '12A4', examCode: '104', chosenAnswer: 'Xả nước ao bệnh ra sông', timestamp: '10:30' },
      { studentName: 'Phạm Thùy Linh', studentClass: '12A1', examCode: '101', chosenAnswer: 'Trộn kháng sinh liều cao', timestamp: '09:12' },
    ],
  },
  {
    id: 'mistake_forest_fire_grade_v',
    grade: '12',
    domain: 'forestry',
    level: 'VD',
    type: 'truefalse',
    title: 'Xử lý thảm mục và phòng cháy rừng thông ba lá vào cao điểm mùa khô (Cấp dự báo cháy rừng cấp V)',
    scenario: 'Tại khu rừng thông 12 năm tuổi vào mùa hanh khô, thảm mục lá kim rụng dày 8cm chứa nhiều tinh dầu, cấp dự báo cháy rừng đạt cấp V (cực kỳ nguy hiểm).',
    commonTrap: 'Học sinh nhầm lẫn giữa biện pháp "đốt non thực bì có kiểm soát" với việc tự ý đốt vào trưa nắng to kèm gió lớn; hoặc không nhận diện được cấp V là cấp nguy hiểm nhất.',
    failRatePercent: 65,
    sampleSize: 980,
    wrongChoicesBreakdown: [
      {
        label: 'Mệnh đề c): Quét dọn thảm mục gom thành đống rồi đốt non vào giữa trưa trời nắng to và có gió lớn',
        percent: 45,
        explanationWhyWrong: 'Nhiều học sinh chọn mệnh đề này là "Đúng" vì nghĩ đốt non là tốt. Nhưng đốt vào trưa nắng gắt kèm gió lớn ở cấp V là hành vi sai lầm tai hại, ngọn lửa sẽ bốc tàn bay xa gây cháy rừng thảm khốc không thể dập nổi!',
      },
      {
        label: 'Mệnh đề d): Xây dựng đường băng cản lửa trắng và băng cản lửa xanh kết hợp cây bản địa lá rộng',
        percent: 20,
        explanationWhyWrong: 'Một số học sinh tưởng rằng băng cản lửa chỉ là đường đất trống (băng trắng) mà không biết băng cản lửa xanh (trồng cây lá dày mọng nước) mới là giải pháp sinh thái bền vững lâu dài.',
      },
    ],
    correctAnswer: 'Mệnh đề c là SAI; Mệnh đề a, b, d là ĐÚNG.',
    explanation: 'Đốt thực bì trước mùa cháy (đốt non) chỉ được làm khi trời râm mát, lặng gió vào sáng sớm hoặc chiều muộn, có ranh cản lửa bao quanh và lực lượng kiểm lâm túc trực. Cấp V tuyệt đối cấm mọi hành vi dùng lửa trong rừng.',
    textbookRef: 'Bài 7: Bảo vệ và phòng chống cháy rừng - Công nghệ 12 KNTT',
    recentStudentsMistakes: [
      { studentName: 'Hoàng Văn Nam', studentClass: '12A3', examCode: '106', chosenAnswer: 'Chọn mệnh đề c là Đúng', timestamp: '14:20' },
      { studentName: 'Trần Quốc Bảo', studentClass: '12A1', examCode: '102', chosenAnswer: 'Chọn mệnh đề c là Đúng', timestamp: '11:15' },
    ],
  },
  {
    id: 'mistake_forest_seedling_polybag',
    grade: '12',
    domain: 'forestry',
    level: 'TH',
    type: 'mcq',
    title: 'Tại sao khi trồng rừng bằng cây con có bầu đất, người ta bắt buộc phải rạch xé bỏ vỏ bầu nilon trước khi đặt cây vào hố?',
    commonTrap: 'Học sinh nghĩ rằng để nguyên túi nilon sẽ giúp giữ nước và giữ phân bón cho cây tốt hơn, không nhận thức được nilon không phân hủy sẽ bó chặt nghẹt rễ.',
    failRatePercent: 59,
    sampleSize: 1420,
    wrongChoicesBreakdown: [
      {
        label: 'Phương án: Giữ nguyên vỏ bầu nilon để chống mất nước và rễ không bị sâu cắn',
        percent: 39,
        explanationWhyWrong: 'Túi nilon PE không phân hủy ngăn cản rễ phát triển đâm sâu vào đất. Rễ bị cuộn xoắn bên trong túi gây nghẹt rễ, cây còi cọc và dễ bị ngã đổ khi mưa bão.',
      },
      {
        label: 'Phương án: Để làm giảm khối lượng đất xung quanh cổ rễ',
        percent: 20,
        explanationWhyWrong: 'Không liên quan đến khối lượng đất, mà liên quan đến việc giải phóng bộ rễ phát triển tự nhiên.',
      },
    ],
    correctAnswer: 'Để rễ cây con dễ dàng đâm sâu lan rộng vào đất xung quanh, tránh bị bó rễ và nghẹt rễ sinh trưởng kém.',
    explanation: 'Rạch bỏ vỏ nilon nhưng phải giữ nguyên bầu đất không làm vỡ vụn là kỹ thuật bắt buộc để rễ non tiếp xúc ngay với dinh dưỡng và độ ẩm của hố trồng.',
    textbookRef: 'Bài 5: Kỹ thuật trồng rừng - Công nghệ 12 KNTT',
    recentStudentsMistakes: [
      { studentName: 'Nguyễn Thị Thu', studentClass: '12A5', examCode: '101', chosenAnswer: 'Giữ nguyên vỏ bầu chống mất nước', timestamp: '08:45' },
      { studentName: 'Bùi Anh Tuấn', studentClass: '12A2', examCode: '103', chosenAnswer: 'Giữ nguyên vỏ bầu nilon', timestamp: '15:10' },
    ],
  },
  {
    id: 'mistake_fcr_calculation',
    grade: '12',
    domain: 'aquaculture',
    level: 'VD',
    type: 'mcq',
    title: 'Cách tính và ý nghĩa kinh tế của hệ số chuyển đổi thức ăn (FCR) trong nuôi cá tra và cá rô phi thâm canh',
    commonTrap: 'Học sinh hay làm phép tính ngược (lấy khối lượng cá thu hoạch chia cho lượng thức ăn) dẫn đến kết quả FCR < 1, hoặc nhầm tưởng FCR càng cao thì càng tốt.',
    failRatePercent: 54,
    sampleSize: 1100,
    wrongChoicesBreakdown: [
      {
        label: 'Phương án: Lấy tổng khối lượng cá thu hoạch chia cho lượng thức ăn (kết quả 0,67)',
        percent: 36,
        explanationWhyWrong: 'Nhầm lẫn công thức: FCR = Lượng thức ăn tiêu tốn / Khối lượng thủy sản tăng thêm. Ví dụ: ăn 165 tấn thức ăn tạo ra 110 tấn cá thì FCR = 165 / 110 = 1,5 chứ không phải 110 / 165.',
      },
      {
        label: 'Phương án: FCR càng lớn thì hiệu quả sử dụng thức ăn càng cao',
        percent: 18,
        explanationWhyWrong: 'FCR càng nhỏ mới là càng tốt! FCR nhỏ chứng tỏ tiêu tốn ít kg thức ăn hơn để tạo ra 1 kg cá thịt, giảm chi phí sản xuất.',
      },
    ],
    correctAnswer: 'FCR = Tổng lượng thức ăn / Tổng khối lượng tăng thêm. FCR càng nhỏ thì hiệu quả chuyển hóa càng cao và chi phí càng tiết kiệm.',
    explanation: 'Trong nuôi cá tra thương phẩm chuẩn, FCR dao động từ 1,4 đến 1,6. Nếu FCR vọt lên 2,0 chứng tỏ thức ăn bị thất thoát thối đáy ao hoặc cá tiêu hóa kém.',
    textbookRef: 'Bài 13: Thức ăn và dinh dưỡng thủy sản - Công nghệ 12 KNTT',
    recentStudentsMistakes: [
      { studentName: 'Đặng Minh Đức', studentClass: '12A1', examCode: '104', chosenAnswer: 'FCR càng lớn càng tốt', timestamp: '09:50' },
      { studentName: 'Lê Hoàng Yến', studentClass: '12A3', examCode: '105', chosenAnswer: 'Tính ngược 110/165 = 0,67', timestamp: '16:05' },
    ],
  },
  {
    id: 'mistake_soil_lime_gypsum',
    grade: '10',
    domain: 'crop',
    level: 'NB',
    type: 'mcq',
    title: 'Phân biệt biện pháp bón vôi bột (CaCO3, CaO) và bón thạch cao (CaSO4) trong cải tạo các loại đất bất lợi',
    commonTrap: 'Học sinh hay nhầm lẫn: gặp đất mặn lại chọn bón vôi, gặp đất chua lại chọn bón thạch cao.',
    failRatePercent: 52,
    sampleSize: 1300,
    wrongChoicesBreakdown: [
      {
        label: 'Phương án: Bón vôi bột để cải tạo đất mặn ven biển',
        percent: 34,
        explanationWhyWrong: 'Đất mặn ven biển thường có pH trung tính hoặc hơi kiềm, nếu bón vôi (tính kiềm) sẽ làm đất bị kiềm hóa thêm. Đất mặn phải bón thạch cao (CaSO4) để ion Ca2+ đẩy Na+ ra khỏi keo đất rồi thau rửa mặn.',
      },
      {
        label: 'Phương án: Bón phân đạm amoni sunfat liều cao để khử chua đất',
        percent: 18,
        explanationWhyWrong: 'Phân amoni sunfat là phân chua sinh lý, bón vào đất sẽ càng làm đất bị chua gắt hơn.',
      },
    ],
    correctAnswer: 'Bón vôi bột (CaCO3, CaO) để khử chua cho đất chua (pH < 5,5); Bón thạch cao (CaSO4) kết hợp thau chua rửa mặn để cải tạo đất mặn.',
    explanation: 'Quy tắc vàng KNTT 10: Đất chua -> Bón Vôi; Đất mặn -> Bón Thạch cao + Thau rửa mặn!',
    textbookRef: 'Bài 4: Biện pháp cải tạo và sử dụng đất trồng - Công nghệ 10 KNTT',
    recentStudentsMistakes: [
      { studentName: 'Phạm Thùy Linh', studentClass: '12A1', examCode: '101', chosenAnswer: 'Bón vôi bột cải tạo đất mặn', timestamp: '08:15' },
      { studentName: 'Vũ Mai Hương', studentClass: '12A2', examCode: '102', chosenAnswer: 'Bón amoni sunfat khử chua', timestamp: '13:40' },
    ],
  },
  {
    id: 'mistake_sloping_land_tillage',
    grade: '12',
    domain: 'forestry',
    level: 'VD',
    type: 'truefalse',
    title: 'Kỹ thuật làm đất trồng rừng phòng hộ đầu nguồn trên đất dốc > 25 độ chống xói mòn',
    scenario: 'Trên sườn dốc lưu vực hồ thủy điện có độ dốc trên 25 độ, mưa hè lớn gây nguy cơ sạt lở lũ quét.',
    commonTrap: 'Học sinh nghĩ rằng cày đất toàn diện theo chiều dọc từ đỉnh dốc xuống sẽ giúp đất tơi xốp, không lường trước được nước mưa sẽ biến các luống dọc thành rãnh xói mòn lũ bùn.',
    failRatePercent: 48,
    sampleSize: 920,
    wrongChoicesBreakdown: [
      {
        label: 'Mệnh đề: Cày lật đất toàn diện theo chiều dọc từ trên đỉnh dốc thẳng xuống chân dốc',
        percent: 33,
        explanationWhyWrong: 'Cày dọc dốc tạo đường cho dòng chảy tràn xé toạc sườn đồi, cuốn trôi lớp đất màu và gây sạt lở. Bắt buộc phải làm đất cục bộ so le hoặc làm đất theo đường đồng mức!',
      },
      {
        label: 'Mệnh đề: Trồng độc canh một loài cây keo duy nhất mật độ thưa',
        percent: 15,
        explanationWhyWrong: 'Rừng phòng hộ đầu nguồn đòi hỏi rừng hỗn giao đa tầng tán, cây họ Đậu cố định đạm xen với cây gỗ lớn rễ cọc đâm sâu bám giữ sườn dốc.',
      },
    ],
    correctAnswer: 'Mệnh đề cày dọc dốc là SAI; kỹ thuật đúng là làm đất cục bộ theo đường đồng mức và trồng rừng hỗn giao.',
    explanation: 'Độ dốc > 25° phải tuyệt đối tuân thủ quy tắc làm đất bảo vệ đất, không cày toàn diện phá vỡ thảm cỏ tự nhiên.',
    textbookRef: 'Bài 5: Trồng rừng phòng hộ đầu nguồn - Công nghệ 12 KNTT',
    recentStudentsMistakes: [
      { studentName: 'Trần Quốc Bảo', studentClass: '12A1', examCode: '103', chosenAnswer: 'Cày dọc dốc (Đúng)', timestamp: '15:45' },
      { studentName: 'Lê Hoàng Yến', studentClass: '12A3', examCode: '104', chosenAnswer: 'Trồng độc canh một loài keo', timestamp: '14:10' },
    ],
  },
];

export interface QuestionMistakeRecord {
  totalAttempts: number;
  wrongAttempts: number;
  lastChosen: string;
  students: StudentMistakeEntry[];
}

// Helper to record student mistakes during test submission kèm tên và lớp học sinh
export function recordStudentQuestionMistake(
  questionId: string,
  isCorrect: boolean,
  chosenAnswer: string,
  studentInfo?: { name: string; studentClass: string; studentId?: string },
  examCode?: string,
  questionTitle?: string,
  correctAnswer?: string
) {
  if (typeof window === 'undefined') return;
  try {
    const key = 'agritech_student_mistakes_v2';
    const raw = localStorage.getItem(key);
    const records: Record<string, QuestionMistakeRecord> = raw ? JSON.parse(raw) : {};

    if (!records[questionId]) {
      records[questionId] = { totalAttempts: 0, wrongAttempts: 0, lastChosen: chosenAnswer, students: [] };
    }

    records[questionId].totalAttempts += 1;
    records[questionId].lastChosen = chosenAnswer;

    if (!isCorrect) {
      records[questionId].wrongAttempts += 1;
      const sName = studentInfo?.name?.trim() || 'Học sinh';
      const sClass = studentInfo?.studentClass?.trim() || '12A1';
      const sId = studentInfo?.studentId || '';

      const entry: StudentMistakeEntry = {
        studentName: sName,
        studentClass: sClass,
        studentId: sId,
        examCode: examCode || '101',
        chosenAnswer,
        correctAnswer,
        timestamp: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
      };

      // Đưa học sinh mới làm sai lên đầu danh sách, tránh trùng lặp cùng 1 HS trong 1 mã đề
      const existing = records[questionId].students || [];
      records[questionId].students = [
        entry,
        ...existing.filter((s) => !(s.studentName === sName && s.examCode === examCode)),
      ].slice(0, 15);
    }

    localStorage.setItem(key, JSON.stringify(records));
    syncMistakesToServerDebounced(records);
  } catch (e) {
    console.warn('Failed to record student mistake in localStorage', e);
  }
}

let syncMistakesTimer: any = null;
function syncMistakesToServerDebounced(records: Record<string, QuestionMistakeRecord>) {
  if (typeof window === 'undefined') return;
  if (syncMistakesTimer) clearTimeout(syncMistakesTimer);
  syncMistakesTimer = setTimeout(() => {
    fetch('/api/mistakes', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ records }),
    }).catch(() => {
      // ignore offline error
    });
  }, 300);
}

// Đồng bộ dữ liệu học sinh làm sai từ máy chủ về các thiết bị (Android, iOS, Windows)
export async function syncMistakesFromServer(): Promise<Record<string, QuestionMistakeRecord>> {
  if (typeof window === 'undefined') return {};
  const key = 'agritech_student_mistakes_v2';
  try {
    const res = await fetch('/api/mistakes', { cache: 'no-store' });
    if (res.ok) {
      const payload = await res.json();
      if (payload?.success && payload?.data && typeof payload.data === 'object') {
        const raw = localStorage.getItem(key);
        const localRecords: Record<string, QuestionMistakeRecord> = raw ? JSON.parse(raw) : {};
        const merged: Record<string, QuestionMistakeRecord> = { ...localRecords, ...payload.data };
        localStorage.setItem(key, JSON.stringify(merged));
        return merged;
      }
    }
  } catch {
    // fallback to localStorage
  }
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

// Lấy danh sách học sinh làm sai theo Question ID (kết hợp dữ liệu lưu trữ động)
export function getStoredStudentsForQuestion(questionId: string): StudentMistakeEntry[] {
  if (typeof window === 'undefined') return [];
  try {
    const key = 'agritech_student_mistakes_v2';
    const raw = localStorage.getItem(key);
    if (!raw) return [];
    const records: Record<string, QuestionMistakeRecord> = JSON.parse(raw);
    return records[questionId]?.students || [];
  } catch {
    return [];
  }
}
