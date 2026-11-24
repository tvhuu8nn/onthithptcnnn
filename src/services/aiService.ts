// Chạy độc lập 100% trên trình duyệt (Client-side), không gọi GoogleGenAI / Gemini API để không tốn quota API

export async function explainQuestionWithAI(questionContext: {
  questionTitle: string;
  domain: string;
  optionsOrStatements: string;
  studentChoice?: string;
  correctAnswer: string;
  contextScenario?: string;
}): Promise<string> {
  return [
    `• Đáp án trọng tâm: ${questionContext.correctAnswer}.`,
    `• Bản chất cốt lõi: Bám sát định nghĩa và quy trình kỹ thuật chuẩn trong SGK Công nghệ (Kết nối tri thức) – Lĩnh vực: ${questionContext.domain}.`,
    questionContext.contextScenario
      ? `• Lưu ý tình huống: Đối chiếu trực tiếp số liệu bảng/biểu đồ hoặc điều kiện thực tế trong đề để kết luận Đúng/Sai.`
      : `• Mẹo chọn nhanh: Loại trừ ngay các phương án chứa từ tuyệt đối sai quy chuẩn ("hoàn toàn không", "tự do 100%", "bỏ qua xử lý").`,
  ].join('\n');
}
