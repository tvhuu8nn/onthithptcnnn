import { ChapterMCQItem, ChapterTFQuestion } from './chapterReviewData';

/**
 * Bổ sung mỗi chương Lớp 10 (cn10-c1 .. cn10-c8) thêm 10 câu trắc nghiệm nhiều lựa chọn
 * (gồm 5 câu Nhận biết [21..25] + 5 câu Thông hiểu [26..30])
 * Kết hợp với 20 câu sẵn có (15 Nhận biết + 5 Thông hiểu) => Đúng 30 câu/chương (20 Nhận biết + 10 Thông hiểu).
 */
export const EXTRA_MCQ_10_FOR_30: Record<string, ChapterMCQItem[]> = {
  'cn10-c1': [
    {
      number: 21,
      level: 'biet',
      question:
        'Theo đặc tính sinh vật học về cấu trúc thân, nhóm cây trồng nào sau đây thuộc nhóm cây thân thảo?',
      options: [
        'Cây lúa nước, cây ngô, cây rau cải ngọt, cây cà chua và cây hành lá',
        'Cây xoài cát, cây mít nghệ, cây sầu riêng, cây bưởi và cây nhãn lồng',
        'Cây cao su, cây cà phê vối, cây điều ghép, cây thông và cây bạch đàn',
        'Cây cam sành, cây quýt đường, cây vải thiều, cây chôm chôm và cây mận',
      ],
      correctIndex: 0,
      explanation:
        'Cây thân thảo có thân mềm, ít gỗ hóa, chu kì sống thường ngắn như lúa, ngô, rau cải, cà chua (Bài 2 SGK CN 10).',
    },
    {
      number: 22,
      level: 'biet',
      question:
        'Theo số lá mầm trong phôi hạt, nhóm cây trồng nào sau đây thuộc nhóm cây một lá mầm?',
      options: [
        'Cây lúa nước, cây ngô, cây mía, cây hành củ, cây tỏi và cây hoa lan',
        'Cây đậu tương, cây lạc, cây đậu xanh, cây rau cải và cây cà chua',
        'Cây cam, cây bưởi, cây xoài, cây nhãn, cây vải thiều và cây sầu riêng',
        'Cây cà phê, cây cao su, cây hồ tiêu, cây điều và cây chè trung du',
      ],
      correctIndex: 0,
      explanation:
        'Lúa, ngô, mía, hành, tỏi, hoa lan thuộc nhóm cây một lá mầm (hạt có 1 lá mầm, rễ chùm, gân lá song song hoặc hình cung).',
    },
    {
      number: 23,
      level: 'biet',
      question:
        'Yêu cầu nào sau đây là phẩm chất cần thiết đối với người lao động trong ngành trồng trọt hiện đại?',
      options: [
        'Có kiến thức chuyên môn, kĩ năng vận hành thiết bị và ý thức bảo vệ môi trường',
        'Chỉ cần làm việc theo kinh nghiệm truyền miệng mà không cần học quy trình mới',
        'Ưu tiên sử dụng tối đa hóa chất độc hại để rút ngắn thời gian chăm sóc cây',
        'Bỏ qua các quy định về an toàn vệ sinh thực phẩm khi thu hoạch nông sản',
      ],
      correctIndex: 0,
      explanation:
        'Người lao động trồng trọt cần có kiến thức khoa học, kĩ năng vận hành máy móc công nghệ và ý thức bảo vệ môi trường (Bài 1 SGK CN 10).',
    },
    {
      number: 24,
      level: 'biet',
      question:
        'Theo mục đích sử dụng (Bài 2 SGK Công nghệ 10), nhóm cây trồng nào sau đây thuộc nhóm cây công nghiệp lâu năm chủ lực ở Việt Nam?',
      options: [
        'Cây cà phê, cây cao su, cây hồ tiêu, cây chè và cây điều',
        'Cây lúa nước, cây ngô lai, cây khoai lang và cây sắn',
        'Cây cải bắp, cây su hào, cây súp lơ và cây rau muống',
        'Cây hoa cúc, cây hoa hồng, cây hoa đào và cây quất cảnh',
      ],
      correctIndex: 0,
      explanation:
        'Cà phê, cao su, hồ tiêu, chè, điều là các cây công nghiệp lâu năm cung cấp nguyên liệu cho chế biến và xuất khẩu.',
    },
    {
      number: 25,
      level: 'biet',
      question:
        'Thành phần tia sáng nào trong phổ ánh sáng mặt trời có hiệu quả quang hợp cao nhất đối với lục lạp của cây trồng (Bài 2 SGK Công nghệ 10)?',
      options: [
        'Tia sáng đỏ và tia sáng xanh tím',
        'Tia sáng lục và tia tử ngoại cực ngắn',
        'Tia hồng ngoại nhiệt và tia X xuyên thấu',
        'Tia gamma và sóng vô tuyến tần số cao',
      ],
      correctIndex: 0,
      explanation:
        'Diệp lục hấp thụ mạnh nhất tia đỏ (tổng hợp carbohydrate) và tia xanh tím (tổng hợp amino acid, protein).',
    },
    {
      number: 26,
      level: 'hieu',
      question:
        'Vì sao việc phát triển vùng chuyên canh quy mô lớn đạt chuẩn VietGAP lại giúp nâng cao giá trị nông sản Việt Nam?',
      options: [
        'Đảm bảo chất lượng đồng đều, an toàn thực phẩm và đáp ứng tiêu chuẩn xuất khẩu',
        'Giúp tăng gấp mười lần lượng thuốc trừ sâu hóa học tồn dư bên trong nông sản',
        'Làm giảm hoàn toàn nhu cầu sử dụng nước tưới và ánh sáng mặt trời của cây',
        'Giúp người nông dân không cần thu hoạch mà nông sản vẫn tự bảo quản ngoài đồng',
      ],
      correctIndex: 0,
      explanation:
        'Sản xuất theo VietGAP/GlobalGAP tại vùng chuyên canh giúp kiểm soát an toàn thực phẩm, truy xuất nguồn gốc và mở rộng xuất khẩu.',
    },
    {
      number: 27,
      level: 'hieu',
      question:
        'Tại sao khi thiếu nước kéo dài trong giai đoạn cây lúa làm đòng – trỗ bông thì năng suất hạt lại sụt giảm nghiêm trọng?',
      options: [
        'Vì thiếu nước làm cản trở quang hợp, vận chuyển chất dinh dưỡng và thụ phấn tạo hạt',
        'Vì thiếu nước làm cho rễ lúa phát triển quá mạnh và hút hết chất diệp lục của lá',
        'Vì thiếu nước làm hạt lúa tự động nảy mầm ngay khi vẫn còn nằm ở trên bông',
        'Vì thiếu nước làm tăng gấp đôi số lượng hạt chắc trên mỗi bông lúa khi thu hoạch',
      ],
      correctIndex: 0,
      explanation:
        'Nước là nguyên liệu quang hợp và môi trường vận chuyển chất hữu cơ về hạt; thiếu nước lúc làm đòng – trỗ gây nghẹn đòng, hạt lép nhiều.',
    },
    {
      number: 28,
      level: 'hieu',
      question:
        'Mối quan hệ giữa giống cây trồng và kĩ thuật canh tác được thể hiện chính xác nhất qua nhận định nào sau đây?',
      options: [
        'Giống quy định tiềm năng năng suất còn kĩ thuật canh tác giúp phát huy tối đa tiềm năng đó',
        'Kĩ thuật canh tác có thể biến đổi giống cây lương thực thành giống cây lấy gỗ lâu năm',
        'Khi đã có giống tốt thì không cần tưới nước, bón phân hay phòng trừ sâu bệnh hại nữa',
        'Giống cây trồng chỉ có vai trò trang trí còn năng suất hoàn toàn do phân hóa học quyết định',
      ],
      correctIndex: 0,
      explanation:
        'Giống quy định giới hạn năng suất di truyền, còn kĩ thuật canh tác điều chỉnh ngoại cảnh để giống phát huy tối đa tiềm năng (Bài 2 SGK CN 10).',
    },
    {
      number: 29,
      level: 'hieu',
      question:
        'Vì sao ở các vườn trồng thanh long tại Bình Thuận, Tiền Giang, nông dân thường thắp đèn LED vào ban đêm trong vụ thu – đông?',
      options: [
        'Để kéo dài thời gian chiếu sáng nhân tạo vượt ngưỡng quang chu kì ngày dài, kích thích thanh long ra hoa trái vụ',
        'Để sưởi ấm cho quả thanh long chín ngay trên cây chỉ sau một đêm chiếu sáng liên tục',
        'Để thay thế hoàn toàn việc tưới nước và bón phân hữu cơ cho cây thanh long suốt mùa khô',
        'Để biến cây thanh long từ nhóm cây ngày dài thành nhóm cây ôn đới chịu băng tuyết',
      ],
      correctIndex: 0,
      explanation:
        'Thanh long là cây ngày dài (chỉ ra hoa khi độ dài ngày > 12 giờ); vụ thu – đông ngày ngắn nên cần chiếu đèn ban đêm để phá quang chu kì đêm dài.',
    },
    {
      number: 30,
      level: 'hieu',
      question:
        'Tại sao khi nhiệt độ không khí vượt quá 40 °C kèm gió khô nóng kéo dài thì hầu hết cây trồng nhiệt đới đều ngừng sinh trưởng và héo rũ?',
      options: [
        'Vì nhiệt độ quá cao làm biến tính enzyme, rối loạn quang hợp – hô hấp và làm cây thoát hơi nước vượt quá khả năng hút nước của rễ',
        'Vì ở nhiệt độ trên 40 °C nước trong đất bị đóng băng hoàn toàn khiến rễ cây không thể đâm sâu xuống đất',
        'Vì nhiệt độ cao làm khí carbon dioxide trong không khí biến mất hoàn toàn trên đồng ruộng',
        'Vì cây trồng tự động rụng toàn bộ bộ rễ để chuyển sang hình thức sống trôi nổi trên mặt nước',
      ],
      correctIndex: 0,
      explanation:
        'Nhiệt độ > 40 °C vượt ngưỡng thuận lợi (15–40 °C), làm tổn thương màng tế bào, bất hoạt enzyme quang hợp và gây mất cân bằng nước nghiêm trọng.',
    },
  ],
  'cn10-c2': [
    {
      number: 21,
      level: 'biet',
      question:
        'Theo cấu tạo của hạt keo đất (Bài 3 SGK Công nghệ 10), lớp nằm ngoài cùng có khả năng trao đổi ion với dung dịch đất là',
      options: [
        'Lớp ion khuếch tán gồm các ion chuyển động tự do quanh hạt keo',
        'Nhân keo đất nằm ở vị trí trung tâm không mang điện tích tự do',
        'Lớp ion quyết định điện gắn chặt trực tiếp lên bề mặt nhân keo',
        'Lớp ion bất động nằm sát lớp ion quyết định điện của hạt keo',
      ],
      correctIndex: 0,
      explanation:
        'Cấu tạo hạt keo đất: Nhân keo -> Lớp ion quyết định điện -> Lớp ion bất động -> Lớp ion khuếch tán (trao đổi ion với dung dịch đất).',
    },
    {
      number: 22,
      level: 'biet',
      question:
        'Độ chua hoạt tính của đất trồng được tạo nên bởi các ion nào tồn tại tự do trong dung dịch đất?',
      options: [
        'Các ion H+ tự do hòa tan ở bên trong dung dịch đất trồng',
        'Các ion Al3+ và H+ nằm trên bề mặt lớp khuếch tán keo đất',
        'Các ion Ca2+ và Mg2+ bám chặt trên bề mặt hạt keo đất âm',
        'Các ion Na+ và Cl- hòa tan với nồng độ cao trong nước ngầm',
      ],
      correctIndex: 0,
      explanation:
        'Độ chua hoạt tính do ion H+ tự do trong dung dịch đất gây nên; độ chua tiềm tàng do H+ và Al3+ trên bề mặt keo đất gây nên (Bài 3 trang 22).',
    },
    {
      number: 23,
      level: 'biet',
      question:
        'Giá thể đá trân châu (Perlite) dùng trong trồng trọt được sản xuất bằng cách nung quặng đá núi lửa ở nhiệt độ',
      options: [
        'Nung ở nhiệt độ cao khoảng từ 800 °C đến 850 °C cho nở xốp',
        'Nung ở nhiệt độ thấp khoảng từ 50 °C đến 70 °C trong bóng râm',
        'Ngâm trong nước vôi trong ở nhiệt độ phòng từ 20 °C đến 25 °C',
        'Ủ yếm khí với trấu tươi ở nhiệt độ khoảng từ 40 °C đến 50 °C',
      ],
      correctIndex: 0,
      explanation:
        'Giá thể Perlite được tạo ra bằng cách nghiền nhỏ đá núi lửa rồi nung ở 800–850 °C tạo hạt xốp trắng nhẹ (Bài 5 trang 35).',
    },
    {
      number: 24,
      level: 'biet',
      question:
        'Theo Bài 3 SGK Công nghệ 10, trong thành phần phần rắn của đất trồng tự nhiên, tỉ lệ chất vô cơ (khoáng) và chất hữu cơ chiếm khoảng',
      options: [
        'Chất vô cơ chiếm khoảng 95% và chất hữu cơ chiếm dưới 5%',
        'Chất vô cơ chiếm khoảng 10% và chất hữu cơ chiếm trên 90%',
        'Chất vô cơ chiếm 50% và không khí chiếm 50% khối lượng phần rắn',
        'Hoàn toàn 100% là chất mùn hữu cơ không có hạt khoáng vô cơ',
      ],
      correctIndex: 0,
      explanation:
        'Phần rắn của đất gồm khoảng 95% chất vô cơ (hạt cát, limon, sét chứa khoáng) và dưới 5% chất hữu cơ (xác sinh vật và chất mùn).',
    },
    {
      number: 25,
      level: 'biet',
      question:
        'Khi sản xuất giá thể trấu hun từ vỏ trấu tươi (Bài 5 SGK Công nghệ 10), nguyên tắc kĩ thuật đốt quan trọng nhất cần tuân thủ là',
      options: [
        'Đốt trong điều kiện yếm khí (không có ngọn lửa) để vỏ trấu than hóa đen đều mà không cháy thành tro trắng',
        'Tưới xăng vào đống trấu rồi đốt bùng ngọn lửa lớn ngoài gió để trấu cháy sạch thành tro bụi mịn',
        'Ngâm vỏ trấu trong dung dịch acid sulfuric đậm đặc suốt bảy ngày trước khi đem phơi nắng',
        'Nung vỏ trấu trong lò luyện kim ở nhiệt độ trên 1500 °C để biến vỏ trấu thành viên sỏi gốm',
      ],
      correctIndex: 0,
      explanation:
        'Trấu hun được đốt âm ỉ trong điều kiện yếm khí (hun khói) để giữ nguyên hình dạng hạt trấu than hóa xốp nhẹ và sạch mầm bệnh.',
    },
    {
      number: 26,
      level: 'hieu',
      question:
        'Vì sao khi cải tạo đất xám bạc màu, người ta phải thực hiện cày sâu dần kết hợp với bón tăng cường phân hữu cơ?',
      options: [
        'Vì tầng đất mặt rất mỏng và nghèo mùn nên cày sâu ngay sẽ đưa tầng đất chết lên mặt ruộng',
        'Vì đất xám bạc màu có tầng canh tác dày tới hai mét và chứa quá nhiều chất mùn hữu cơ',
        'Để làm tăng nhanh lượng hạt cát thô và thúc đẩy quá trình rửa trôi dinh dưỡng xuống sâu',
        'Để làm cho mặt đất bị đóng váng cứng lại ngăn không cho nước mưa thấm xuống tầng rễ',
      ],
      correctIndex: 0,
      explanation:
        'Đất xám bạc màu có tầng canh tác mỏng, nghèo sét và mùn; phải cày sâu dần từng vụ kết hợp bón phân hữu cơ để làm dày tầng đất mặt.',
    },
    {
      number: 27,
      level: 'hieu',
      question:
        'Tại sao khi trộn giá thể Perlite hoặc gốm viên vào đất trồng trong chậu lại giúp hạn chế tình trạng thối rễ cây cảnh?',
      options: [
        'Vì các hạt giá thể có nhiều lỗ xốp giúp thoát nước dư thừa nhanh và giữ độ thoáng khí O2 cho rễ',
        'Vì giá thể Perlite tiết ra thuốc kháng sinh hóa học tiêu diệt toàn bộ nấm bệnh trong chậu',
        'Vì giá thể gốm viên làm cho nước trong chậu đông đặc lại không cho rễ cây tiếp xúc với nước',
        'Vì các giá thể trơ cứng này cung cấp lượng đạm nguyên chất cao gấp mười lần phân bón urea',
      ],
      correctIndex: 0,
      explanation:
        'Perlite và gốm viên có cấu trúc lỗ xốp thông thoáng, giúp thoát nước tốt, chống ngập úng và duy trì oxygen cho rễ hô hấp.',
    },
    {
      number: 28,
      level: 'hieu',
      question:
        'Trong thực hành xác định độ mặn của đất (Bài 6), nếu kết quả đo nồng độ muối tan đạt 4,2‰ thì cần xử lí đất như thế nào?',
      options: [
        'Đất bị nhiễm mặn nên cần bón vôi đẩy Na+ khỏi keo đất kết hợp thau rửa bằng nước ngọt',
        'Đất hoàn toàn ngọt bình thường nên không cần áp dụng bất kì biện pháp cải tạo đất nào',
        'Cần bón thêm nhiều muối ăn NaCl vào ruộng để cân bằng áp suất thẩm thấu cho rễ cây',
        'Cần tháo nước biển trực tiếp vào ngâm ruộng liên tục trong suốt ba tháng mùa khô hạn',
      ],
      correctIndex: 0,
      explanation:
        'Đất có nồng độ muối tan > 2,56‰ là đất mặn; mức 4,2‰ cần cải tạo bằng bón vôi (Ca2+ đẩy Na+) và dẫn nước ngọt thau rửa mặn.',
    },
    {
      number: 29,
      level: 'hieu',
      question:
        'Vì sao khi sử dụng mùn xơ dừa làm giá thể ươm cây con, người ta bắt buộc phải ngâm xả nước sạch và xử lí bằng nước vôi trong?',
      options: [
        'Để hòa tan và loại bỏ chất chát tanin, lignin có trong xơ dừa tươi vốn gây ức chế và làm thối đầu rễ non',
        'Để làm tăng hàm lượng muối mặn NaCl trong xơ dừa lên mức cao nhất giúp cây chịu hạn',
        'Để biến toàn bộ sợi xơ dừa hữu cơ thành các hạt cát thạch anh vô cơ không bị phân hủy',
        'Vì nước vôi làm cho xơ dừa mất hoàn toàn khả năng giữ ẩm và thoát hết nước ngay lập tức',
      ],
      correctIndex: 0,
      explanation:
        'Xơ dừa tươi chứa nhiều tanin (tan trong nước) và lignin (tan trong kiềm/nước vôi) gây nghẽn mạch và chát rễ nên phải ngâm xả kĩ (Bài 5 trang 33).',
    },
    {
      number: 30,
      level: 'hieu',
      question:
        'Tại sao loại đất thịt nhẹ và đất phù sa giàu mùn lại giữ phân bón tốt hơn nhiều so với đất cát thô?',
      options: [
        'Vì đất thịt và đất giàu mùn chứa nhiều hạt keo đất âm có khả năng hấp phụ trao đổi giữ các cation dinh dưỡng (NH4+, K+, Ca2+)',
        'Vì đất cát thô có quá nhiều hạt keo sét giữ chặt phân bón không cho rễ cây hút được',
        'Vì trong đất thịt nhẹ hoàn toàn không có nước nên các chất dinh dưỡng không thể hòa tan được',
        'Vì hạt cát thô tự động biến đổi phân đạm và phân kali thành khí nitrogen bay hết lên trời',
      ],
      correctIndex: 0,
      explanation:
        'Khả năng giữ dinh dưỡng (CEC) phụ thuộc vào hàm lượng keo sét và keo mùn; đất cát nghèo keo đất nên phân bón dễ bị nước rửa trôi.',
    },
  ],
  'cn10-c3': [
    {
      number: 21,
      level: 'biet',
      question:
        'Theo Bài 7 SGK Công nghệ 10, nhóm các nguyên tố dinh dưỡng đa lượng thiết yếu mà cây trồng cần với lượng lớn là',
      options: [
        'Đạm (Nitrogen - N), Lân (Phosphorus - P) và Kali (Potassium - K)',
        'Sắt (Fe), Kẽm (Zn), Đồng (Cu), Mangan (Mn) và Molypden (Mo)',
        'Vàng (Au), Bạc (Ag), Bạch kim (Pt), Thủy ngân (Hg) và Chì (Pb)',
        'Khí hiếm Helium (He), Neon (Ne), Argon (Ar) và Krypton (Kr)',
      ],
      correctIndex: 0,
      explanation:
        'Đạm (N), Lân (P), Kali (K) là 3 nguyên tố dinh dưỡng đa lượng chính được bổ sung thông qua phân bón.',
    },
    {
      number: 22,
      level: 'biet',
      question:
        'Bón phân thúc cho cây trồng là hình thức bón phân được thực hiện vào thời điểm nào sau đây?',
      options: [
        'Bón trong quá trình cây đang sinh trưởng, phát triển mạnh để đáp ứng kịp thời nhu cầu dinh dưỡng',
        'Bón toàn bộ lượng phân vào trong đất trước khi tiến hành gieo hạt hoặc trồng cây con lên ruộng',
        'Bón vào nông sản sau khi đã thu hoạch đem về kho bảo quản để làm tăng khối lượng hạt khô',
        'Chỉ bón một lần duy nhất sau khi cây trồng đã già cỗi và kết thúc hoàn toàn chu kì sống',
      ],
      correctIndex: 0,
      explanation:
        'Bón thúc là bón trong thời kì cây đang sinh trưởng phát triển (đẻ nhánh, vươn lóng, đón đòng, nuôi quả).',
    },
    {
      number: 23,
      level: 'biet',
      question:
        'Trong thực hành nhận biết phân bón hóa học (Bài 11), loại phân bón nào không tan hoặc ít tan trong nước và có màu xám tro?',
      options: [
        'Phân lân nung chảy hoặc phân supe lân (có màu xám trắng hoặc xám tro)',
        'Phân đạm urea tinh thể màu trắng tròn tan rất nhanh hoàn toàn trong nước',
        'Phân kali clorua có màu đỏ hồng như muối ớt và tan hoàn toàn trong nước',
        'Phân đạm amoni nitrat có màu trắng ngà dễ chảy nước và tan hết trong nước',
      ],
      correctIndex: 0,
      explanation:
        'Phân lân (supe lân, lân nung chảy) có màu xám tro/xám xanh và không tan hoặc ít tan trong nước lạnh (Bài 11 trang 57).',
    },
    {
      number: 24,
      level: 'biet',
      question:
        'Theo Bài 9 SGK Công nghệ 10, loại phân bón vi sinh chứa các chủng vi khuẩn Rhizobium hoặc Azotobacter có tác dụng chính là',
      options: [
        'Cố định nitrogen phân tử (N2) tự do trong không khí thành dạng đạm amoni (NH4+) cho cây trồng hấp thu',
        'Phân giải trực tiếp các viên đá sỏi thạch anh thành nguyên tố kali nguyên chất trong đất',
        'Tiêu diệt toàn bộ hệ giun đất và các vi sinh vật phân giải chất hữu cơ ở tầng đất mặt',
        'Làm tăng độ chua của đất phèn lên gấp mười lần để ức chế sự phát triển của bộ rễ lúa',
      ],
      correctIndex: 0,
      explanation:
        'Phân vi sinh cố định đạm chứa VSV sống (Rhizobium cộng sinh nốt sần cây họ Đậu, Azotobacter hội sinh) chuyển hóa N2 không khí thành NH4+.',
    },
    {
      number: 25,
      level: 'biet',
      question:
        'Theo Bài 10 SGK Công nghệ 10, nhiệt độ thích hợp ở giữa đống ủ trong giai đoạn phân giải mạnh khi sản xuất phân hữu cơ vi sinh là',
      options: [
        'Khoảng 50 °C – 60 °C (giúp phân giải nhanh chất hữu cơ và tiêu diệt mầm bệnh, hạt cỏ)',
        'Khoảng -10 °C – 0 °C (đóng băng đống ủ để giữ nguyên trạng thái rơm rạ tươi sống)',
        'Khoảng 250 °C – 300 °C (đốt cháy toàn bộ chất hữu cơ và vi sinh vật thành tro)',
        'Dưới 10 °C trong suốt toàn bộ quá trình ủ từ lúc phối trộn đến lúc đem bón',
      ],
      correctIndex: 0,
      explanation:
        'Hoạt động của VSV hiếu khí làm nhiệt độ đống ủ tăng lên 50–60 °C, thúc đẩy phân hủy cellulose và diệt mầm bệnh hại.',
    },
    {
      number: 26,
      level: 'hieu',
      question:
        'Vì sao khi bảo quản các loại phân bón hóa học như đạm urea, amoni nitrat không được để lẫn lộn các loại phân với nhau?',
      options: [
        'Vì chúng dễ xảy ra phản ứng hóa học làm chảy nước, vón cục và mất chất dinh dưỡng',
        'Vì để chung các loại phân sẽ làm khối lượng bao phân tự động tăng lên gấp ba lần',
        'Vì phân đạm trộn sẵn với vôi khi bảo quản sẽ giữ được lượng đạm bền vững mãi mãi',
        'Vì các hạt phân bón sẽ tự nảy mầm thành cây cỏ dại ngay bên trong kho chứa phân',
      ],
      correctIndex: 0,
      explanation:
        'Trộn lẫn các loại phân hóa học khi bảo quản gây phản ứng trao đổi tạo muối hút ẩm chảy nước hoặc giải phóng khí NH3.',
    },
    {
      number: 27,
      level: 'hieu',
      question:
        'Tại sao việc bón kết hợp phân bón hữu cơ với phân bón hóa học lại mang lại hiệu quả bền vững cao nhất cho đất và cây?',
      options: [
        'Phân hóa học cung cấp dinh dưỡng nhanh còn phân hữu cơ cải tạo đất và giữ phân lâu bền',
        'Phân hữu cơ làm tiêu hủy hoàn toàn các nguyên tố khoáng N, P, K có trong phân hóa học',
        'Làm cho đất trồng chuyển sang trạng thái hóa đá vĩnh viễn để không bị xói mòn do mưa',
        'Giúp cây trồng không cần sử dụng bộ rễ để hút nước trong suốt cả vụ gieo trồng nữa',
      ],
      correctIndex: 0,
      explanation:
        'Phân hóa học cấp khoáng dễ tiêu nhanh, còn phân hữu cơ bổ sung mùn, tăng keo đất và nuôi VSV giúp đất tơi xốp bền vững.',
    },
    {
      number: 28,
      level: 'hieu',
      question:
        'Khi thử một mẫu phân bón trên cục than hồng thấy có mùi khai nồng của khí amoniac (NH3) bốc lên thì mẫu đó thuộc nhóm',
      options: [
        'Nhóm phân đạm (như đạm amoni sunfat, amoni clorua hoặc đạm urea)',
        'Nhóm phân lân nung chảy không có chứa nguyên tố nitrogen trong phân',
        'Nhóm phân kali clorua hoặc kali sunfat chỉ chứa nguyên tố potassium',
        'Nhóm bột đá vôi nghiền mịn dùng để bón khử chua cho đất phèn mặn',
      ],
      correctIndex: 0,
      explanation:
        'Khi đốt trên than hồng, phân đạm nóng chảy/bốc khói trắng và tỏa mùi khai nồng đặc trưng của khí NH3 (Bài 11 trang 58).',
    },
    {
      number: 29,
      level: 'hieu',
      question:
        'Vì sao phân lân và phân hữu cơ hoai mục thường được ưu tiên dùng để bón lót trước khi gieo trồng chứ ít dùng để bón thúc muộn?',
      options: [
        'Vì phân lân ít tan và phân hữu cơ cần thời gian khoáng hóa chậm, đồng thời lân kích thích bộ rễ cây con phát triển sớm',
        'Vì phân lân và phân hữu cơ bay hơi hết vào không khí chỉ sau mười phút tiếp xúc với đất ẩm',
        'Vì nếu bón lót phân đạm urea với liều lượng thật cao thì hạt giống sẽ không bao giờ bị xót rễ',
        'Vì cây trồng ở giai đoạn cây con hoàn toàn không cần đến nguyên tố phosphorus để tạo rễ',
      ],
      correctIndex: 0,
      explanation:
        'Phân lân khó tan và phân hữu cơ phân giải từ từ nên bón lót giúp cung cấp dinh dưỡng bền và kích thích rễ non đâm nhanh.',
    },
    {
      number: 30,
      level: 'hieu',
      question:
        'Tại sao khi bón phân vi sinh vật cho cây trồng, người ta không được trộn chung phân vi sinh với vôi bột hoặc thuốc trừ nấm bệnh hóa học?',
      options: [
        'Vì độ kiềm cao của vôi và độc tính của thuốc hóa học sẽ tiêu diệt các vi sinh vật sống có ích trong phân vi sinh',
        'Vì phân vi sinh sẽ làm cho thuốc trừ nấm biến thành đường glucose nuôi sống các loài cỏ dại',
        'Vì trộn vôi với phân vi sinh sẽ làm hạt phân nở to gấp một trăm lần làm gãy máy bón phân',
        'Vì vi sinh vật trong phân chỉ hoạt động được khi trộn trực tiếp với nước sôi ở nhiệt độ 100 °C',
      ],
      correctIndex: 0,
      explanation:
        'Phân vi sinh chứa các chủng VSV sống; trộn với vôi hoặc thuốc diệt khuẩn/diệt nấm sẽ làm chết VSV, mất hoàn toàn tác dụng sinh học.',
    },
  ],
  'cn10-c4': [
    {
      number: 21,
      level: 'biet',
      question:
        'Cấp hạt giống nào có độ thuần di truyền cao nhất, được nhân ra trực tiếp từ hạt giống tác giả để sản xuất hạt giống xác nhận?',
      options: [
        'Hạt giống siêu nguyên chủng và hạt giống nguyên chủng',
        'Hạt giống thương phẩm đại trà đã qua nhiều vụ gieo trồng ngoài đồng ruộng',
        'Hạt giống thu hoạch tận dụng từ các ruộng sản xuất lương thực thương mại',
        'Hạt giống lai F2, F3 đã bị phân li tính trạng mạnh ở các thế hệ kế tiếp',
      ],
      correctIndex: 0,
      explanation:
        'Hệ thống nhân giống chuẩn: Hạt giống tác giả -> Siêu nguyên chủng -> Nguyên chủng -> Xác nhận (Bài 12 trang 62).',
    },
    {
      number: 22,
      level: 'biet',
      question:
        'Trong phương pháp chọn lọc cá thể (Bài 13), việc đánh giá và chọn lọc ở thế hệ đầu tiên dựa trên cơ sở nào?',
      options: [
        'Chọn các cá thể tốt nhất rồi thu hạt riêng từng cây để gieo thành từng dòng kiểm tra đời sau',
        'Thu hoạch trộn lẫn tất cả hạt của các cây được chọn lại thành một khối hạt giống chung',
        'Nhổ bỏ toàn bộ các cây có năng suất cao và chỉ giữ lại các cây thấp bé bị nhiễm sâu bệnh',
        'Sử dụng tia phóng xạ chiếu trực tiếp vào ruộng lúa đang chín để thu hoạch ngay hôm sau',
      ],
      correctIndex: 0,
      explanation:
        'Chọn lọc cá thể thu hạt riêng từng cá thể ưu tú và gieo thành từng dòng riêng để đánh giá kiểu gen qua đời con (Bài 13 trang 66).',
    },
    {
      number: 23,
      level: 'biet',
      question:
        'Trong kĩ thuật ghép cây ăn quả (Bài 14), bộ phận cành hoặc mắt lấy từ cây mẹ có phẩm chất tốt đem gắn vào gốc ghép gọi là',
      options: [
        'Cành ghép hoặc mắt ghép (mang các đặc tính di truyền ưu tú cần nhân nhanh)',
        'Gốc ghép (bộ phận cây con gieo từ hạt có bộ rễ khỏe thích nghi tốt với đất)',
        'Bầu đất bó chiết (hỗn hợp đất bùn trộn rơm mục bó quanh vị trí khoanh vỏ)',
        'Mô sẹo bất định (khối tế bào chưa phân hóa nuôi cấy trong bình thủy tinh)',
      ],
      correctIndex: 0,
      explanation:
        'Cây ghép gồm Gốc ghép (cung cấp bộ rễ khỏe, chống chịu tốt) và Cành ghép/mắt ghép (lấy từ cây mẹ ưu tú quyết định phẩm chất quả).',
    },
    {
      number: 24,
      level: 'biet',
      question:
        'Theo Bài 13 SGK Công nghệ 10, phương pháp tạo giống bằng cách chiếu các tia phóng xạ (tia X, tia gamma) hoặc dùng hóa chất (EMS, colchicine) lên hạt nảy mầm, đỉnh sinh trưởng gọi là',
      options: [
        'Phương pháp chọn tạo giống bằng gây đột biến nhân tạo',
        'Phương pháp nhân giống vô tính bằng chiết cành truyền thống',
        'Phương pháp bảo quản hạt giống ngắn hạn trong chum vại kín',
        'Phương pháp chọn lọc hỗn hợp một lần trên ruộng đại trà',
      ],
      correctIndex: 0,
      explanation:
        'Sử dụng tác nhân vật lí (tia phóng xạ) hoặc hóa học (EMS, colchicine) làm biến đổi vật chất di truyền là phương pháp gây đột biến nhân tạo.',
    },
    {
      number: 25,
      level: 'biet',
      question:
        'Trong quy trình nhân giống bằng nuôi cấy mô tế bào (Bài 14 SGK Công nghệ 10), cơ sở khoa học cốt lõi giúp một mảnh mô lá hoặc đỉnh sinh trưởng tái sinh thành cây hoàn chỉnh là',
      options: [
        'Tính toàn năng của tế bào thực vật',
        'Hiện tượng ưu thế lai ở thế hệ con lai F1',
        'Quá trình thụ tinh kép của hạt phấn trên đầu nhụy',
        'Sự đột biến số lượng nhiễm sắc thể ngẫu nhiên',
      ],
      correctIndex: 0,
      explanation:
        'Nuôi cấy mô tế bào (vi nhân giống in vitro) dựa trên tính toàn năng của tế bào thực vật khi nuôi trên môi trường MS có hormone thích hợp.',
    },
    {
      number: 26,
      level: 'hieu',
      question:
        'Vì sao khi chọn gốc ghép cho các giống cam, bưởi đặc sản, người ta thường chọn cây bưởi chua hoặc cam ba lá gieo từ hạt?',
      options: [
        'Vì cây gieo từ hạt có bộ rễ cọc ăn sâu khỏe mạnh và chống chịu sâu bệnh, úng hạn rất tốt',
        'Vì gốc ghép bưởi chua sẽ biến toàn bộ quả của cành ghép thành quả chanh rất nhỏ và chua',
        'Vì cây gieo từ hạt hoàn toàn không có rễ nên không cần tưới nước suốt quá trình trồng',
        'Vì gốc ghép sẽ làm cho cây ăn quả ngừng sinh trưởng và chết ngay sau vụ thu hoạch đầu tiên',
      ],
      correctIndex: 0,
      explanation:
        'Gốc ghép gieo từ hạt phát triển rễ cọc khỏe, thích nghi tốt với đất đai và kháng bệnh thối rễ, còn cành ghép giữ nguyên phẩm chất quả mẹ.',
    },
    {
      number: 27,
      level: 'hieu',
      question:
        'Tại sao trong quy trình nhân giống bằng nuôi cấy mô tế bào (Bài 14), cây con sau khi tạo rễ trong ống nghiệm phải qua giai đoạn vườn ươm?',
      options: [
        'Để cây con thích nghi dần với ánh sáng, độ ẩm tự nhiên trước khi đem trồng ra đồng ruộng',
        'Để làm cho toàn bộ lá và rễ của cây con in vitro bị héo rụng hết trước khi đem đi trồng',
        'Vì trong ống nghiệm cây con chưa có tế bào thực vật mà chỉ là các hạt khoáng chất vô cơ',
        'Để lây nhiễm các loại virus và nấm bệnh ngoài tự nhiên vào cây giống trước khi xuất vườn',
      ],
      correctIndex: 0,
      explanation:
        'Cây in vitro sống trong bình độ ẩm gần 100%, khí khổng hoạt động yếu; cần huấn luyện ở vườn ươm để thích nghi nắng gió tự nhiên.',
    },
    {
      number: 28,
      level: 'hieu',
      question:
        'So với phương pháp chọn lọc hỗn hợp, phương pháp chọn lọc cá thể có ưu điểm vượt trội nào trong công tác giống?',
      options: [
        'Kiểm tra được kiểu gen của từng cá thể qua các dòng đời con nên tạo ra giống có độ thuần cao',
        'Đơn giản, tốn ít công sức hơn và không cần theo dõi riêng rẽ từng dòng ở các vụ kế tiếp',
        'Chỉ cần thực hiện trong vòng một ngày là tạo ra ngay giống cây biến đổi gen kháng sâu',
        'Không cần gieo trồng ngoài đồng ruộng mà chỉ cần phân loại kích thước hạt ở trong kho',
      ],
      correctIndex: 0,
      explanation:
        'Chọn lọc cá thể theo dõi riêng từng dòng con cháu của mỗi cây mẹ nên phân biệt được biến dị di truyền (kiểu gen) với biến dị môi trường.',
    },
    {
      number: 29,
      level: 'hieu',
      question:
        'Vì sao khi nhân giống cây ăn quả bằng phương pháp chiết cành (Bài 15), người ta chỉ bóc hết lớp vỏ và cạo sạch tầng phát sinh (libe – tượng tầng) ở vết khoanh mà không cắt đứt phần gỗ?',
      options: [
        'Để mạch gỗ vẫn vận chuyển nước và muối khoáng từ gốc lên nuôi cành chiết tươi sống, đồng thời chặn chất hữu cơ từ lá xuống để kích thích ra rễ tại mép trên vết khoanh',
        'Để cắt đứt hoàn toàn nguồn nước từ gốc lên làm cho cành chiết khô héo ngay sau khi bó bầu đất',
        'Vì lớp gỗ bên trong có khả năng tự di chuyển ra ngoài biến thành vỏ quả ngọt chỉ sau ba ngày',
        'Để các loài sâu đục thân và nấm bệnh dễ dàng xâm nhập vào lõi gỗ làm mục gãy cành chiết',
      ],
      correctIndex: 0,
      explanation:
        'Khoanh vỏ và cạo sạch tượng tầng giúp cắt mạch rây (chất hữu cơ và auxin từ lá dồn lại ở mép cắt trên kích thích tạo rễ bất định) trong khi mạch gỗ vẫn cấp nước nuôi cành.',
    },
    {
      number: 30,
      level: 'hieu',
      question:
        'Tại sao nông dân trồng ngô lai hoặc lúa lai F1 chỉ sử dụng hạt lai F1 cho một vụ thương phẩm chứ không giữ hạt thu hoạch từ ruộng F1 làm giống cho vụ sau?',
      options: [
        'Vì ưu thế lai cao nhất ở F1 rồi giảm mạnh ở F2 do các cặp gene dị hợp phân li tạo ra các cá thể đồng hợp lặn làm năng suất và độ đồng đều sụt giảm',
        'Vì hạt thu hoạch từ ruộng ngô lai F1 hoàn toàn không có phôi nên tỉ lệ nảy mầm luôn bằng 0%',
        'Vì cây F2 sẽ phát triển cao gấp năm lần cây F1 làm đổ ngã toàn bộ ruộng khi có gió nhẹ',
        'Vì hạt F2 khi gieo xuống đất sẽ tự động biến thành giống cỏ dại không thể ra bắp hoặc trỗ bông',
      ],
      correctIndex: 0,
      explanation:
        'Ưu thế lai đạt cực đại ở F1 nhờ trạng thái dị hợp tử; nếu lấy hạt F1 gieo tiếp (đời F2) sẽ xảy ra phân li tính trạng làm mất ưu thế lai.',
    },
  ],
  'cn10-c5': [
    {
      number: 21,
      level: 'biet',
      question:
        'Loài côn trùng nào sau đây là đối tượng môi giới truyền virus gây bệnh vàng lùn, lùn xoắn lá hại lúa (Bài 17)?',
      options: [
        'Rầy nâu hại lúa (Nilaparvata lugens) chích hút nhựa và truyền virus',
        'Sâu tơ hại rau họ thập tự ăn khuyết biểu bì lá cải bắp và su hào',
        'Ruồi đục quả đẻ trứng vào bên trong vỏ các loại quả ổi, xoài, cam',
        'Sâu đục thân bướm hai chấm đục vào nõn cây lúa gây dảnh héo bông bạc',
      ],
      correctIndex: 0,
      explanation:
        'Rầy nâu vừa chích hút nhựa làm lúa cháy rầy vừa là môi giới truyền virus vàng lùn, lùn xoắn lá (Bài 17 trang 86).',
    },
    {
      number: 22,
      level: 'biet',
      question:
        'Bệnh đạo ôn hại lúa (Bài 18 SGK Công nghệ 10) do tác nhân vi sinh vật nào gây ra và có vết bệnh điển hình hình gì?',
      options: [
        'Do nấm Pyricularia oryzae gây ra với vết bệnh trên lá hình thoi, tâm xám trắng',
        'Do vi khuẩn Ralstonia solanacearum gây héo xanh rũ đột ngột nhưng lá vẫn xanh',
        'Do tuyến trùng kí sinh ở bộ rễ làm rễ lúa phình to thành các u sưng tròn',
        'Do virus gây ra làm lá lúa xoắn tít lại như mũi hành và cây lùn hẳn xuống',
      ],
      correctIndex: 0,
      explanation:
        'Bệnh đạo ôn lúa do nấm Pyricularia oryzae gây ra; vết bệnh điển hình trên lá hình thoi (mắt én), viền nâu, tâm xám trắng (Bài 18 trang 91).',
    },
    {
      number: 23,
      level: 'biet',
      question:
        'Chế phẩm nấm xanh (Metarhizium) và nấm trắng (Beauveria) trong bảo vệ thực vật được dùng để phòng trừ nhóm dịch hại nào?',
      options: [
        'Phòng trừ các loài sâu hại và rầy nâu, bọ cánh cứng hại cây trồng',
        'Phòng trừ các loài cỏ dại lá rộng và cỏ lồng vực mọc trên ruộng lúa',
        'Cung cấp trực tiếp nguyên tố đạm và kali dễ tiêu cho bộ rễ cây trồng',
        'Kích thích quả cây ăn quả chín đồng loạt chỉ sau một đêm phun thuốc',
      ],
      correctIndex: 0,
      explanation:
        'Chế phẩm nấm xanh và nấm trắng là thuốc trừ sâu vi sinh kí sinh gây bệnh làm chết rầy nâu, châu chấu, bọ cánh cứng, sâu hại (Bài 20 trang 101).',
    },
    {
      number: 24,
      level: 'biet',
      question:
        'Theo Bài 17 SGK Công nghệ 10, chu kì biến thái hoàn toàn của đa số các loài sâu hại thuộc bộ Cánh vảy (như sâu tơ, sâu cuốn lá, sâu đục thân) trải qua 4 pha phát triển theo thứ tự là',
      options: [
        'Trứng -> Sâu non (ấu trùng) -> Nhộng -> Trưởng thành (ngài/bướm)',
        'Trứng -> Trưởng thành -> Nhộng -> Sâu non (ấu trùng)',
        'Nhộng -> Trứng -> Sâu non -> Bào tử nấm kí sinh',
        'Trứng -> Rầy cám -> Rầy trưởng thành (không có giai đoạn nhộng)',
      ],
      correctIndex: 0,
      explanation:
        'Côn trùng biến thái hoàn toàn (bộ Cánh vảy, Cánh cứng, Hai cánh) qua 4 giai đoạn: Trứng -> Sâu non (phá hại mạnh nhất) -> Nhộng -> Trưởng thành.',
    },
    {
      number: 25,
      level: 'biet',
      question:
        'Theo Bài 18 SGK Công nghệ 10, bệnh vàng lá greening (bệnh gân xanh) gây suy thoái nghiêm trọng trên cây ăn quả có múi (cam, quýt, bưởi) do tác nhân nào gây ra và loài nào truyền bệnh?',
      options: [
        'Do vi khuẩn Candidatus Liberibacter kí sinh mạch rây gây ra và do rầy chổng cánh truyền bệnh',
        'Do nấm mốc trắng sống trên bề mặt vỏ quả gây ra và do giun đất truyền bệnh',
        'Do thiếu ánh sáng mặt trời vào buổi trưa gây ra và do ong mật truyền bệnh',
        'Do thừa phân kali clorua trong đất gây ra và do nhện bắt mồi truyền bệnh',
      ],
      correctIndex: 0,
      explanation:
        'Bệnh vàng lá greening trên cây có múi do vi khuẩn Liberibacter sống trong mạch rây gây ra, lây truyền qua mắt ghép nhiễm bệnh và rầy chổng cánh (Diaphorina citri).',
    },
    {
      number: 26,
      level: 'hieu',
      question:
        'Vì sao khi ruộng lúa đang bị bệnh đạo ôn hoặc bệnh bạc lá phát triển mạnh, tuyệt đối không được bón thúc thêm phân đạm?',
      options: [
        'Vì thừa đạm làm lá lúa xanh non mềm yếu, giàu amino acid tự do khiến nấm và vi khuẩn lây lan bùng phát',
        'Vì phân đạm sẽ kết tủa với bào tử nấm tạo thành lớp màng bảo vệ giúp cây lúa khỏi bệnh ngay lập tức',
        'Vì phân đạm sẽ làm cho toàn bộ nước trong ruộng lúa bị đóng băng khiến rễ lúa không hút được nước',
        'Vì khi bị bệnh cây lúa đã biến đổi thành cây họ Đậu tự cố định được đạm từ không khí',
      ],
      correctIndex: 0,
      explanation:
        'Thừa đạm làm vách tế bào mô lá mỏng, đạm hòa tan cao tạo nguồn thức ăn lí tưởng cho nấm đạo ôn và vi khuẩn bạc lá phát triển dữ dội.',
    },
    {
      number: 27,
      level: 'hieu',
      question:
        'Tại sao biện pháp bảo vệ các loài thiên địch (nhện bắt mồi, bọ rùa, ong kí sinh) lại giúp ổn định hệ sinh thái đồng ruộng?',
      options: [
        'Vì thiên địch khống chế tự nhiên quần thể sâu hại dưới ngưỡng gây hại mà không gây ô nhiễm môi trường',
        'Vì các loài thiên địch sẽ ăn trụi toàn bộ lá và thân của cây trồng thay cho các loài sâu hại',
        'Vì thiên địch tiết ra chất hóa học làm cho cỏ dại trên đồng ruộng phát triển nhanh gấp mười lần',
        'Vì khi có thiên địch thì cây trồng không cần ánh sáng mặt trời và nước tưới vẫn sống tốt',
      ],
      correctIndex: 0,
      explanation:
        'Thiên địch tiêu diệt sâu hại tự nhiên, giúp duy trì cân bằng sinh thái, giảm số lần phun thuốc hóa học và ngăn bùng phát dịch hại.',
    },
    {
      number: 28,
      level: 'hieu',
      question:
        'Nguyên tắc "Đúng thời điểm" trong nguyên tắc "4 đúng" khi sử dụng thuốc bảo vệ thực vật được hiểu đúng nhất là',
      options: [
        'Phun khi dịch hại đến ngưỡng phòng trừ, ở tuổi sâu non mẫn cảm nhất và đảm bảo thời gian cách li',
        'Phun định kì cứ mỗi tuần hai lần bất kể trên đồng ruộng có xuất hiện sâu bệnh hại hay không',
        'Phun vào đúng lúc trời đang mưa to gió lớn hoặc giữa trưa nắng gắt để thuốc bốc hơi nhanh',
        'Phun ngay vào buổi sáng trước khi thu hoạch rau ăn lá đem ra chợ bán vào buổi chiều cùng ngày',
      ],
      correctIndex: 0,
      explanation:
        'Đúng thời điểm là phun khi sâu non tuổi 1–2 mẫn cảm nhất, bệnh mới chớm đến ngưỡng, trời mát lặng gió và tuân thủ thời gian cách li.',
    },
    {
      number: 29,
      level: 'hieu',
      question:
        'Vì sao đối với bệnh héo xanh vi khuẩn hại cà chua, khoai tây (do Ralstonia solanacearum), biện pháp luân canh với lúa nước và nhổ tiêu hủy cây bệnh lại quan trọng hơn phun thuốc hóa học lên lá?',
      options: [
        'Vì vi khuẩn tồn tại lâu trong đất và xâm nhập gây tắc mạch dẫn bên trong thân nên thuốc phun ngoài lá hầu như không diệt được nguồn bệnh trong mạch gỗ',
        'Vì vi khuẩn héo xanh chỉ sống được trên mặt nước ruộng lúa chứ không sống được ở trong đất trồng cạn',
        'Vì cây cà chua khi bị héo xanh sẽ tự hồi phục hoàn toàn nếu cắt bỏ toàn bộ phần ngọn cây',
        'Vì thuốc hóa học phun lên lá sẽ làm cho quả cà chua biến thành củ khoai tây ngay trên cành',
      ],
      correctIndex: 0,
      explanation:
        'Vi khuẩn Ralstonia solanacearum lưu tồn trong đất và cư trú trong bó mạch dẫn gây héo rũ; luân canh lúa nước tạo môi trường ngập yếm khí tiêu diệt vi khuẩn trong đất.',
    },
    {
      number: 30,
      level: 'hieu',
      question:
        'Tại sao chế phẩm nấm đối kháng Trichoderma khi bón vào đất cùng phân hữu cơ lại giúp phòng ngừa hiệu quả bệnh thối rễ do nấm Fusarium và Phytophthora?',
      options: [
        'Vì nấm Trichoderma cạnh tranh dinh dưỡng, tiết enzyme phân hủy vách tế bào nấm gây bệnh và kích thích bộ rễ cây trồng phát triển khỏe mạnh',
        'Vì nấm Trichoderma làm cho độ pH của đất giảm xuống mức 1,0 tiêu diệt toàn bộ rễ cây và sinh vật đất',
        'Vì nấm Trichoderma hút cạn toàn bộ lượng nước tưới trong đất làm cho rễ cây khô héo',
        'Vì nấm Trichoderma là chất diệt cỏ hóa học cực mạnh làm rụng toàn bộ lá cây trồng sau khi bón',
      ],
      correctIndex: 0,
      explanation:
        'Trichoderma là nấm đối kháng có ích: vừa kí sinh tiêu diệt nấm bệnh trong đất (Fusarium, Rhizoctonia, Phytophthora), vừa phân giải cellulose thành mùn.',
    },
  ],
  'cn10-c6': [
    {
      number: 21,
      level: 'biet',
      question:
        'Khâu kĩ thuật làm đất trước khi gieo trồng gồm các công việc cơ bản theo trình tự nào sau đây (Bài 21)?',
      options: [
        'Cày đất, bừa và đập đất, lên luống (đối với cây trồng cạn) và bón phân lót',
        'Thu hoạch nông sản, phơi sấy khô, đóng bao bì và đưa vào kho lạnh bảo quản',
        'Tỉa cành tạo tán, phun thuốc kích thích ra hoa và bao quả chống ruồi đục quả',
        'Xây dựng nhà máy chế biến, đóng hộp chân không và vận chuyển đi xuất khẩu',
      ],
      correctIndex: 0,
      explanation:
        'Quy trình làm đất chuẩn gồm: Cày đất -> Bừa và đập đất -> Lên luống -> Bón phân lót (Bài 21 trang 106).',
    },
    {
      number: 22,
      level: 'biet',
      question:
        'Trong chăm sóc cây trồng (Bài 21), việc tỉa dặm được thực hiện ngay sau khi hạt mọc mầm hoặc sau khi cấy nhằm mục đích',
      options: [
        'Đảm bảo mật độ và khoảng cách cây đồng đều trên toàn bộ diện tích ruộng',
        'Làm giảm một nửa số lượng cây khỏe mạnh để nhường đất cho cỏ dại mọc lên',
        'Thu hoạch toàn bộ thân lá cây con để đem đi chế biến đồ hộp xuất khẩu ngay',
        'Thay thế hoàn toàn việc tưới nước và bón phân thúc trong suốt cả vụ mùa',
      ],
      correctIndex: 0,
      explanation:
        'Tỉa bỏ chỗ dày/cây yếu và dặm vào chỗ cây khuyết giúp đảm bảo đúng mật độ, khoảng cách quy định.',
    },
    {
      number: 23,
      level: 'biet',
      question:
        'Phương pháp bảo quản nông sản trong kho có kiểm soát thành phần khí quyển (tăng CO2, giảm O2) được gọi là',
      options: [
        'Phương pháp bảo quản trong điều kiện khí quyển điều chỉnh (CA/MA)',
        'Phương pháp phơi khô thủ công trực tiếp dưới ánh nắng mặt trời gay gắt',
        'Phương pháp ngâm nông sản tươi sống vào trong dung dịch nước muối mặn',
        'Phương pháp ủ chua yếm khí cùng với mật rỉ đường làm thức ăn gia súc',
      ],
      correctIndex: 0,
      explanation:
        'Bảo quản trong khí quyển điều chỉnh (CA/MA) giảm O2 và tăng CO2 giúp ức chế hô hấp và kéo dài tuổi thọ rau quả tươi (Bài 22 trang 113).',
    },
    {
      number: 24,
      level: 'biet',
      question:
        'Theo Bài 22 SGK Công nghệ 10, công nghệ sấy nào làm đông lạnh nhanh nông sản rồi cho nước thăng hoa trực tiếp từ thể rắn sang thể hơi trong buồng chân không để giữ nguyên màu sắc, hương vị và vitamin?',
      options: [
        'Công nghệ sấy thăng hoa (sấy đông khô – Freeze drying)',
        'Công nghệ phơi nắng thủ công trên sân gạch ngoài trời',
        'Công nghệ hun khói trực tiếp bằng củi gỗ và than đá',
        'Công nghệ muối chua lên men lactic trong bể xi măng',
      ],
      correctIndex: 0,
      explanation:
        'Sấy thăng hoa (sấy lạnh đông khô) tách ẩm ở nhiệt độ thấp trong chân không nên giữ nguyên hình dạng, màu sắc và hàm lượng dinh dưỡng cao nhất.',
    },
    {
      number: 25,
      level: 'biet',
      question:
        'Theo Bài 22 SGK Công nghệ 10, việc xử lí chiếu xạ nông sản (bằng tia bức xạ liều lượng cho phép) trước khi xuất khẩu sang các thị trường khó tính như Mỹ, Úc nhằm mục đích chính là',
      options: [
        'Tiêu diệt côn trùng kiểm dịch (trứng và sâu non ruồi đục quả), ức chế nảy mầm và kéo dài thời gian bảo quản',
        'Làm cho nông sản phát sáng phóng xạ trong bóng tối để người tiêu dùng dễ nhận biết',
        'Tăng khối lượng của mỗi quả xoài và quả thanh long lên gấp ba lần trước khi cân',
        'Thay thế hoàn toàn việc rửa sạch và đóng gói bao bì nông sản sau khi thu hoạch',
      ],
      correctIndex: 0,
      explanation:
        'Chiếu xạ nông sản giúp diệt triệt để côn trùng kiểm dịch thực vật, nấm khuẩn và ức chế củ/hạt nảy mầm mà không để lại tồn dư hóa chất.',
    },
    {
      number: 26,
      level: 'hieu',
      question:
        'Vì sao khi trồng các loại cây lấy củ như khoai lang, khoai tây, lạc lại bắt buộc phải lên luống cao và vun gốc kĩ?',
      options: [
        'Giúp tầng đất mặt dày, tơi xốp, thoát nước tốt để tia củ/quả phát triển thuận lợi và dễ thu hoạch',
        'Để giữ cho bộ rễ cây luôn bị ngập chìm hoàn toàn trong nước bùn suốt cả chu kì sinh trưởng',
        'Để ngăn không cho bộ lá cây khoai lang tiếp xúc với ánh sáng mặt trời và khí carbon dioxide',
        'Để làm cho củ khoai tây mọc lộ hoàn toàn lên trên mặt đất và chuyển sang màu xanh lục chứa độc tố',
      ],
      correctIndex: 0,
      explanation:
        'Lên luống và vun gốc tạo tầng đất tơi xốp, thoáng khí, thoát nước nhanh và che kín củ khoai tây tránh hóa xanh sinh độc tố solanin.',
    },
    {
      number: 27,
      level: 'hieu',
      question:
        'Tại sao trước khi đưa hạt thóc, hạt ngô vào kho bảo quản kín lâu dài, người ta phải phơi hoặc sấy giảm độ ẩm hạt xuống dưới 13%?',
      options: [
        'Để hạ thấp cường độ hô hấp của hạt đến mức tối thiểu, ngăn hạt nảy mầm và ức chế nấm mốc hại',
        'Để kích thích hạt thóc và hạt ngô nảy mầm đồng loạt ngay ở bên trong bao tải chứa trong kho',
        'Để làm tăng tối đa hoạt động của các loài mọt gạo và nấm mốc tiết độc tố aflatoxin trong hạt',
        'Để hạt lương thực tự động chuyển hóa tinh bột thành protein động vật trong thời gian bảo quản',
      ],
      correctIndex: 0,
      explanation:
        'Khi độ ẩm hạt < 13%, cường độ hô hấp cực thấp, không sinh nhiệt ẩm cục bộ và nấm mốc/côn trùng không thể phát triển.',
    },
    {
      number: 28,
      level: 'hieu',
      question:
        'Trong quy trình trồng cây cảnh trong chậu (Bài 23), việc lót một lớp sỏi nhẹ hoặc viên đất nung ở đáy chậu trước khi cho giá thể vào giúp',
      options: [
        'Tạo độ thông thoáng ở đáy chậu và giúp nước tưới dư thừa thoát nhanh qua lỗ thoát nước, tránh bị tắc',
        'Bịt thật kín lỗ thoát nước ở đáy chậu để giữ toàn bộ nước tưới ngập đầy chậu như ruộng lúa nước',
        'Cung cấp toàn bộ lượng đạm và kali cho cây cảnh mà không cần bón thêm bất kì loại phân nào khác',
        'Ngăn không cho bộ rễ của cây cảnh phát triển xuống nửa dưới của chậu trồng trong suốt nhiều năm',
      ],
      correctIndex: 0,
      explanation:
        'Lớp viên đất nung/sỏi nhẹ dưới đáy chậu ngăn giá thể mịn làm bít lỗ thoát nước, giúp thoát nước thừa nhanh và chống thối rễ.',
    },
    {
      number: 29,
      level: 'hieu',
      question:
        'Vì sao khi thu hoạch các loại rau ăn lá và quả tươi xuất khẩu, người ta khuyên nên thu hái vào buổi sáng sớm (khi tan sương) hoặc chiều mát và đưa ngay vào phòng làm mát sơ bộ (pre-cooling)?',
      options: [
        'Để hạ nhanh nhiệt độ đồng ruộng trong nông sản, giảm cường độ hô hấp và hạn chế mất nước làm héo rau quả',
        'Vì thu hoạch giữa trưa nắng gắt sẽ làm hàm lượng vitamin C trong quả tăng lên gấp mười lần',
        'Để nước mưa ban đêm ngấm đầy vào bên trong vết cắt cuống quả giúp nấm mốc phát triển nhanh',
        'Vì buổi sáng sớm nông sản không có quá trình hô hấp tế bào nên không bao giờ bị hư hỏng',
      ],
      correctIndex: 0,
      explanation:
        'Thu hái lúc trời mát và làm mát sơ bộ ngay sau thu hoạch giúp loại bỏ "nhiệt đồng ruộng", giảm thoát hơi nước và ức chế enzyme phân giải.',
    },
    {
      number: 30,
      level: 'hieu',
      question:
        'Tại sao trong chế biến nước quả đóng hộp hoặc rau quả muối chua, người ta cần thực hiện khâu chần (blanching) hoặc thanh trùng Pasteur ở nhiệt độ thích hợp?',
      options: [
        'Để tiêu diệt vi sinh vật gây hư hỏng và bất hoạt các enzyme oxy hóa làm biến màu, biến mùi sản phẩm',
        'Để đốt cháy toàn bộ lượng đường và vitamin tự nhiên trong quả thành tro carbon màu đen',
        'Để làm cho vỏ hộp kim loại tự động giãn nở gấp đôi dung tích ban đầu sau khi đóng nắp',
        'Để kích thích các loài vi khuẩn gây thối rữa nhân lên nhanh hơn trong thời gian bảo quản',
      ],
      correctIndex: 0,
      explanation:
        'Chần/thanh trùng giúp tiêu diệt VSV gây hỏng và bất hoạt enzyme polyphenol oxidase (gây thâm nâu), giữ màu sắc và kéo dài hạn sử dụng.',
    },
  ],
  'cn10-c7': [
    {
      number: 21,
      level: 'biet',
      question:
        'Theo Bài 24 SGK Công nghệ 10, kiểu nhà trồng cây có mái che và vách bao quanh bằng lưới chuyên dụng ngăn côn trùng gọi là',
      options: [
        'Nhà lưới (gồm nhà lưới kín hoàn toàn và nhà lưới hở mái/vách)',
        'Nhà kính hiện đại điều khiển tự động hoàn toàn bằng máy tính',
        'Kho lạnh bảo quản nông sản điều chỉnh khí quyển CA công suất lớn',
        'Bể nuôi cấy vi tảo công nghiệp khép kín đặt ở dưới tầng hầm',
      ],
      correctIndex: 0,
      explanation:
        'Nhà lưới được bao che bằng lưới chắn côn trùng hoặc lưới che nắng, chi phí đầu tư thấp hơn nhà kính (Bài 24 trang 120).',
    },
    {
      number: 22,
      level: 'biet',
      question:
        'Hệ thống tưới nước tiết kiệm nào đưa nước dưới dạng các hạt sương cực nhỏ làm tăng độ ẩm không khí và làm mát nhanh nhà màng?',
      options: [
        'Hệ thống tưới phun sương tự động (thường dùng cho hoa lan, nấm, vườn ươm)',
        'Hệ thống tưới ngập tràn mặt ruộng truyền thống dùng cho canh tác lúa nước',
        'Hệ thống tưới rãnh thấm dẫn nước chảy tràn qua các rãnh đất giữa hai luống',
        'Hệ thống tưới thủ công bằng thùng ô doa xách tay tưới trực tiếp vào gốc cây',
      ],
      correctIndex: 0,
      explanation:
        'Tưới phun sương tạo các hạt nước li ti giúp tăng ẩm độ không khí, giảm nhiệt độ, rất hợp với hoa lan, nấm và giâm cành (Bài 24 trang 122).',
    },
    {
      number: 23,
      level: 'biet',
      question:
        'Trong công nghệ trồng cây không dùng đất (Bài 25), kĩ thuật màng dinh dưỡng mỏng chảy tuần hoàn qua rễ có kí hiệu viết tắt là',
      options: [
        'Hệ thống thủy canh hồi lưu kĩ thuật màng dinh dưỡng NFT (Nutrient Film Technique)',
        'Hệ thống bảo quản nông sản trong khí quyển điều chỉnh CA (Controlled Atmosphere)',
        'Hệ thống quản lí dịch hại tổng hợp trên đồng ruộng IPM (Integrated Pest Management)',
        'Hệ thống định vị vệ tinh toàn cầu dẫn đường máy nông nghiệp GPS (Global Positioning System)',
      ],
      correctIndex: 0,
      explanation:
        'NFT (Nutrient Film Technique) là kĩ thuật thủy canh hồi lưu dùng dòng dung dịch dinh dưỡng mỏng chảy tuần hoàn qua máng trồng.',
    },
    {
      number: 24,
      level: 'biet',
      question:
        'Theo Bài 25 SGK Công nghệ 10, phương pháp trồng cây không dùng đất trong đó bộ rễ cây treo lơ lửng trong buồng kín tối và được phun sương dung dịch dinh dưỡng định kì theo chu kì vài phút một lần là',
      options: [
        'Công nghệ khí canh (Aeroponics)',
        'Công nghệ thủy canh tĩnh không hồi lưu',
        'Công nghệ trồng cây trên giá thể xơ dừa tưới nhỏ giọt',
        'Công nghệ canh tác lúa nước truyền thống ngoài đồng',
      ],
      correctIndex: 0,
      explanation:
        'Khí canh (Aeroponics) treo rễ trong không khí kín và phun sương dinh dưỡng trực tiếp vào rễ, tiết kiệm tới 95% nước và cung cấp tối đa O2 cho rễ.',
    },
    {
      number: 25,
      level: 'biet',
      question:
        'Trong hệ thống trồng trọt thông minh ứng dụng công nghệ IoT (Bài 24 SGK Công nghệ 10), bộ phận nào đảm nhận nhiệm vụ thu thập thông số nhiệt độ, độ ẩm, ánh sáng, pH, EC trên đồng ruộng/nhà kính?',
      options: [
        'Hệ thống các cảm biến điện tử (Sensors)',
        'Lưỡi cày lật đất của máy kéo công suất lớn',
        'Bao bì đóng gói nông sản bằng giấy carton',
        'Bình phun thuốc trừ sâu đeo vai bơm tay',
      ],
      correctIndex: 0,
      explanation:
        'Cảm biến (Sensor) đo đạc các thông số môi trường và gửi dữ liệu về bộ điều khiển trung tâm để tự động bật/tắt tưới, quạt, rèm che.',
    },
    {
      number: 26,
      level: 'hieu',
      question:
        'Vì sao khi trồng cây bằng hệ thống thủy canh, người ta phải thường xuyên kiểm tra chỉ số pH và chỉ số EC của dung dịch dinh dưỡng?',
      options: [
        'Vì pH và nồng độ muối khoáng hòa tan (EC) quyết định trực tiếp khả năng hấp thu dinh dưỡng của rễ cây',
        'Vì chỉ số EC dùng để đo tốc độ gió và cường độ bức xạ mặt trời chiếu vào bên trong nhà kính',
        'Vì nếu không đo EC mỗi ngày thì dung dịch nước trong bể sẽ tự động biến thành xăng dầu dễ cháy',
        'Vì cây trồng trong hệ thống thủy canh chỉ hút được các chất dinh dưỡng khi độ pH đạt mức 14,0',
      ],
      correctIndex: 0,
      explanation:
        'Chỉ số EC phản ánh tổng nồng độ ion khoáng hòa tan và pH (tối ưu 5,5–6,5) quyết định khả năng hòa tan và hấp thu các nguyên tố đa, vi lượng.',
    },
    {
      number: 27,
      level: 'hieu',
      question:
        'So với trồng cây trên đất ngoài đồng ruộng, công nghệ thủy canh và khí canh trong nhà màng giúp giảm thiểu thuốc BVTV vì',
      options: [
        'Cách li hoàn toàn với mầm bệnh trong đất và có lưới ngăn côn trùng xâm nhập từ bên ngoài',
        'Dung dịch dinh dưỡng thủy canh có pha sẵn liều lượng cao thuốc trừ sâu hóa học cực độc',
        'Cây trồng trong hệ thống thủy canh có lớp vỏ thân bằng kim loại nên sâu không cắn thủng được',
        'Các loài sâu bệnh khi bay vào nhà màng sẽ tự động biến thành các loài ong mật thụ phấn',
      ],
      correctIndex: 0,
      explanation:
        'Không dùng đất tự nhiên giúp loại bỏ mầm bệnh truyền qua đất, kết hợp lưới chắn côn trùng nên hạn chế tối đa sâu bệnh.',
    },
    {
      number: 28,
      level: 'hieu',
      question:
        'Tại sao hệ thống tưới nhỏ giọt lại đặc biệt phù hợp và mang lại hiệu quả kinh tế cao cho các vùng khô hạn, khan hiếm nước ngọt?',
      options: [
        'Cấp nước trực tiếp từ từ vào đúng vùng rễ cây nên giảm tối đa lượng nước bốc hơi và thấm sâu lãng phí',
        'Làm cho toàn bộ mặt đất giữa các hàng cây luôn ngập nước sâu ba mươi xăng-ti-mét suốt mùa khô',
        'Biến nước biển mặn chát thành nước ngọt tinh khiết ngay tại đầu vòi nhỏ giọt mà không cần lọc',
        'Giúp cây trồng ngừng hoàn toàn quá trình thoát hơi nước qua khí khổng ở lá vào ban ngày nắng nóng',
      ],
      correctIndex: 0,
      explanation:
        'Tưới nhỏ giọt đưa nước và phân hòa tan thẳng tới vùng rễ tích cực, tiết kiệm 30–60% lượng nước so với tưới tràn/tưới phun.',
    },
    {
      number: 29,
      level: 'hieu',
      question:
        'Vì sao khi pha dung dịch dinh dưỡng gốc cho hệ thống thủy canh (như công thức Hoagland), người ta phải pha thành hai bình đậm đặc riêng biệt (Bình A chứa Ca(NO3)2 và Bình B chứa muối sunfat, photphat) chứ không trộn chung đậm đặc?',
      options: [
        'Để tránh phản ứng giữa ion Ca2+ với các ion SO4 2- và PO4 3- ở nồng độ đậm đặc tạo kết tủa CaSO4, Ca3(PO4)2 làm mất dinh dưỡng và tắc vòi',
        'Vì nếu trộn chung hai bình A và B thì dung dịch sẽ phát nổ ngay lập tức ở nhiệt độ phòng',
        'Để làm cho màu sắc của hai bình dung dịch đẹp hơn khi trưng bày trong nhà kính',
        'Vì cây trồng chỉ uống dung dịch bình A vào buổi sáng và uống dung dịch bình B vào ban đêm',
      ],
      correctIndex: 0,
      explanation:
        'Ở nồng độ đậm đặc, Ca2+ kết hợp với PO4 3- và SO4 2- tạo kết tủa không tan; phải pha riêng thành dung dịch gốc A và B rồi mới hòa loãng vào bể nước.',
    },
    {
      number: 30,
      level: 'hieu',
      question:
        'Trong canh tác dưa lưới công nghệ cao trong nhà màng (Bài 25), vì sao khi cây ra hoa cái người ta vẫn phải thả ong mật vào nhà màng hoặc thụ phấn bổ sung bằng tay?',
      options: [
        'Vì nhà màng kín ngăn côn trùng tự nhiên và cản gió bên ngoài nên hoa dưa lưới cần tác nhân hỗ trợ chuyển hạt phấn sang đầu nhụy để đậu quả đều',
        'Vì ong mật sẽ ăn hết các lá già ở gốc cây dưa lưới thay cho công nhân cắt tỉa lá',
        'Vì ong mật tiết ra mật ngọt thấm trực tiếp qua vỏ quả làm tăng độ đường Brix của dưa lưới',
        'Vì nếu không có ong mật thì hệ thống tưới nhỏ giọt tự động sẽ ngừng bơm nước',
      ],
      correctIndex: 0,
      explanation:
        'Hoa dưa lưới là hoa thụ phấn nhờ côn trùng; nhà màng có lưới kín chắn côn trùng bên ngoài nên phải đưa thùng ong mật vào hoặc thụ phấn nhân tạo.',
    },
  ],
  'cn10-c8': [
    {
      number: 21,
      level: 'biet',
      question:
        'Theo Bài 26 SGK Công nghệ 10, dấu hiệu nào cho thấy môi trường đất canh tác đang bị suy thoái và ô nhiễm do lạm dụng hóa chất?',
      options: [
        'Đất bị chua hóa, chai cứng, nghèo mùn, tồn dư kim loại nặng và suy giảm mạnh giun đất, vi sinh vật có ích',
        'Đất ngày càng tơi xốp, giàu chất mùn đen, độ pH trung tính ổn định và có rất nhiều giun đất sinh sống',
        'Cây trồng sinh trưởng khỏe mạnh tự nhiên, không xuất hiện sâu bệnh và cho năng suất tăng bền vững',
        'Nguồn nước ngầm và nước mặt quanh vùng canh tác trong sạch, giàu oxygen hòa tan và tôm cá phát triển',
      ],
      correctIndex: 0,
      explanation:
        'Lạm dụng phân hóa học và thuốc BVTV làm đất chua, chai cứng, tích lũy độc chất và tiêu diệt hệ vi sinh vật đất, giun đất.',
    },
    {
      number: 22,
      level: 'biet',
      question:
        'Khi sử dụng rơm rạ làm giá thể trồng nấm rơm (Bài 27), thời gian từ lúc cấy giống nấm vào mô rơm đến lúc bắt đầu thu hoạch khoảng',
      options: [
        'Khoảng từ 12 đến 15 ngày sau khi cấy giống là bắt đầu thu hái được nấm rơm',
        'Khoảng từ 2 đến 3 năm sau khi cấy giống mới bắt đầu xuất hiện quả thể nấm',
        'Chỉ sau đúng 30 phút kể từ lúc ngâm rơm vào nước vôi là thu hoạch được nấm',
        'Khoảng từ 6 đến 8 tháng ủ rơm trong kho lạnh đóng băng ở nhiệt độ -10 °C',
      ],
      correctIndex: 0,
      explanation:
        'Theo quy trình trồng nấm rơm trên giá thể rơm rạ (Bài 27 trang 139), nấm rơm cho thu hoạch nhanh chỉ sau 12–15 ngày cấy giống.',
    },
    {
      number: 23,
      level: 'biet',
      question:
        'Trong quy trình ủ phân hữu cơ vi sinh từ phụ phẩm trồng trọt, độ ẩm của khối nguyên liệu khi phối trộn cần duy trì ở mức',
      options: [
        'Độ ẩm khoảng 55% – 65% (bóp chặt nắm nguyên liệu thấy nước rỉ qua kẽ tay nhưng không nhỏ giọt)',
        'Độ ẩm khoảng 0% – 5% (nguyên liệu phải phơi sấy thật khô giòn để dễ bốc cháy khi ủ đống)',
        'Độ ẩm khoảng 98% – 100% (nguyên liệu phải ngâm chìm hoàn toàn dưới đáy bể nước sâu hai mét)',
        'Không cần quan tâm đến độ ẩm vì vi sinh vật phân giải cellulose hoạt động tốt trong chân không',
      ],
      correctIndex: 0,
      explanation:
        'Độ ẩm tối ưu cho đống ủ phân hữu cơ vi sinh là 55–65%: đủ ẩm cho VSV hoạt động nhưng vẫn đảm bảo độ thoáng khí O2.',
    },
    {
      number: 24,
      level: 'biet',
      question:
        'Theo Bài 26 SGK Công nghệ 10, vỏ bao bì, chai lọ thuốc bảo vệ thực vật sau khi pha phun xong ngoài đồng ruộng cần được xử lí như thế nào?',
      options: [
        'Tráng rửa 3 lần và thu gom bỏ vào bể/thùng chứa chuyên dụng đặt tại đồng ruộng để đưa đi tiêu hủy chất thải nguy hại theo quy định',
        'Vứt trực tiếp xuống kênh mương tưới tiêu hoặc bờ ruộng để nước mưa cuốn trôi đi nơi khác',
        'Đem về rửa qua bằng nước lã rồi dùng để đựng nước uống hoặc đựng mật ong trong gia đình',
        'Đem chôn lấp lẫn vào trong đống ủ phân hữu cơ vi sinh để bón cho các luống rau ăn sống',
      ],
      correctIndex: 0,
      explanation:
        'Bao bì thuốc BVTV sau sử dụng là chất thải nguy hại, bắt buộc phải thu gom vào bể chứa chuyên dụng trên đồng ruộng để xử lí tiêu hủy an toàn.',
    },
    {
      number: 25,
      level: 'biet',
      question:
        'Theo Bài 27 SGK Công nghệ 10, phụ phẩm trồng trọt nào sau đây rất giàu chất xơ cellulose, thường được tận dụng vừa làm thức ăn ủ chua cho trâu bò vừa làm nguyên liệu sản xuất viên nén sinh khối (biomass)?',
      options: [
        'Rơm rạ, thân lá cây ngô sau thu hoạch, ngọn lá mía, bã mía và vỏ trấu',
        'Các loại chai nhựa đựng thuốc trừ sâu và màng phủ nông nghiệp PE',
        'Nước thải từ các nhà máy mạ kim loại nặng và hóa chất công nghiệp',
        'Đá sỏi cuội và cát thạch anh khai thác từ lòng sông tự nhiên',
      ],
      correctIndex: 0,
      explanation:
        'Rơm rạ, thân lá ngô, bã mía, vỏ trấu là nguồn phụ phẩm sinh khối khổng lồ dùng ủ thức ăn gia súc, trồng nấm, ủ phân hữu cơ hoặc ép viên năng lượng.',
    },
    {
      number: 26,
      level: 'hieu',
      question:
        'Vì sao việc xử lí rơm rạ ngay tại ruộng bằng chế phẩm vi sinh (như Trichoderma) lại tốt hơn nhiều so với việc đốt đồng sau gặt?',
      options: [
        'Giúp phân giải nhanh rơm rạ thành mùn hữu cơ trả lại dinh dưỡng cho đất, diệt nấm bệnh và không gây khói bụi',
        'Làm cho toàn bộ rơm rạ biến thành chất nhựa tổng hợp phủ kín mặt ruộng để ngăn cỏ dại mọc lên',
        'Giúp tăng lượng khí thải carbon monoxide (CO) và bụi mịn PM2.5 vào bầu khí quyển quanh khu dân cư',
        'Làm cho đất ruộng bị ngộ độc hữu cơ nặng hơn gấp năm lần so với việc vùi rơm tươi chưa xử lí',
      ],
      correctIndex: 0,
      explanation:
        'Phun chế phẩm Trichoderma lên rơm rạ giúp phân giải nhanh cellulose thành mùn, hạn chế ngộ độc hữu cơ vụ sau và không gây ô nhiễm khói bụi.',
    },
    {
      number: 27,
      level: 'hieu',
      question:
        'Tại sao thức ăn ủ chua từ thân lá cây ngô sau khi mở túi lấy cho trâu bò ăn hàng ngày lại phải ép khí và buộc kín miệng túi ngay?',
      options: [
        'Để ngăn không khí (O2) lọt vào làm nấm mốc và vi khuẩn hiếu khí phát triển gây thối hỏng phần thức ăn còn lại',
        'Để giữ cho ánh sáng mặt trời bên trong túi không bị thoát ra ngoài làm giảm màu xanh của lá ngô',
        'Vì nếu để hở miệng túi thì toàn bộ muối khoáng trong thân ngô sẽ bay hơi hết ra ngoài không khí',
        'Để làm tăng nhiệt độ trong túi lên trên 100 °C giúp nấu chín phần thức ăn cho ngày hôm sau',
      ],
      correctIndex: 0,
      explanation:
        'Thức ăn ủ chua bảo quản nhờ pH thấp và yếm khí; để hở miệng túi sẽ làm O2 xâm nhập kích hoạt nấm mốc và vi khuẩn hiếu khí gây thối hỏng.',
    },
    {
      number: 28,
      level: 'hieu',
      question:
        'Giải pháp tổng thể nào sau đây giúp giảm thiểu bền vững ô nhiễm môi trường trong sản xuất trồng trọt hiện đại?',
      options: [
        'Áp dụng quản lí dịch hại tổng hợp (IPM), tăng phân hữu cơ – vi sinh và tái chế phụ phẩm theo kinh tế tuần hoàn',
        'Tăng gấp đôi liều lượng phân đạm hóa học và phun thuốc trừ sâu định kì hàng tuần trên mọi cánh đồng',
        'Cấm hoàn toàn hoạt động trồng lúa và trồng cây ăn quả trên phạm vi cả nước để bảo vệ đất trống',
        'Đổ toàn bộ bao bì thuốc bảo vệ thực vật và phụ phẩm nông nghiệp xuống kênh mương thoát nước',
      ],
      correctIndex: 0,
      explanation:
        'Kết hợp IPM, bón phân cân đối ưu tiên phân hữu cơ/vi sinh và tái chế phụ phẩm trồng trọt theo kinh tế tuần hoàn giúp bảo vệ môi trường bền vững.',
    },
    {
      number: 29,
      level: 'hieu',
      question:
        'Vì sao nếu cày vùi trực tiếp một lượng lớn rơm rạ tươi ngay trước ngày gieo sạ vụ lúa kế tiếp trong điều kiện ngập nước thường gây hiện tượng lúa bị vàng lá, thối rễ đen (ngộ độc hữu cơ)?',
      options: [
        'Vì rơm tươi phân hủy yếm khí trong đất ngập nước lấy mất oxygen của rễ và sinh ra nhiều khí độc H2S, CH4 cùng các acid hữu cơ làm thối rễ lúa',
        'Vì rơm tươi cung cấp quá nhiều khí oxygen tinh khiết làm rễ cây lúa non bị cháy khô dưới bùn',
        'Vì rơm tươi biến đất ruộng thành đất cát khô hạn không giữ được nước tưới trên mặt ruộng',
        'Vì sợi rơm tươi tự động phát triển thành cây cỏ lồng vực cạnh tranh ánh sáng với cây lúa non',
      ],
      correctIndex: 0,
      explanation:
        'Rơm tươi vùi ngập nước phân giải yếm khí tiêu thụ hết O2 trong bùn và sinh độc chất H2S, Fe2+, acid hữu cơ gây thối đen rễ lúa; cần phun chế phẩm Trichoderma xử lí trước 10–15 ngày.',
    },
    {
      number: 30,
      level: 'hieu',
      question:
        'Tại sao trong quy trình xử lí rơm rạ làm giá thể trồng nấm rơm (Bài 27), người ta phải ngâm rơm khô với nước vôi trong (pH khoảng 12–13) trước khi ủ đống?',
      options: [
        'Để làm mềm sợi cellulose của rơm, trung hòa acid hữu cơ và tiêu diệt các bào tử nấm dại, tạp khuẩn cạnh tranh với sợi nấm rơm',
        'Để biến sợi rơm hữu cơ thành các sợi thủy tinh không thấm nước trong suốt quá trình trồng nấm',
        'Vì nấm rơm là loài thực vật có hoa cần rất nhiều chất diệp lục từ nước vôi để quang hợp',
        'Để làm cho đống rơm đóng băng ở nhiệt độ âm giúp bảo quản rơm không bị phân hủy',
      ],
      correctIndex: 0,
      explanation:
        'Ngâm rơm trong nước vôi (0,5–1%) giúp phá vỡ lớp sáp vỏ rơm để rơm ngấm đủ nước, nâng pH kiềm tiêu diệt nấm mốc dại và vi khuẩn gây hại.',
    },
  ],
};

/**
 * Ngân hàng 4 câu Đúng/Sai cho từng chương Lớp 10 (8 chương × 4 câu = 32 câu Đúng/Sai).
 * Mỗi câu gồm:
 * - Tình huống thực tế (context) bám sát nội dung chương SGK Công nghệ 10 – Công nghệ Trồng trọt (Kết nối tri thức)
 * - Dẫn nguồn cụ thể (citation) từ cơ quan nghiên cứu / tạp chí chuyên ngành uy tín
 * - 4 ý mệnh đề (1 ý Nhận biết 'biet', 1 ý Thông hiểu 'hieu', 2 ý Vận dụng 'vandung')
 */
export const CHAPTER_TF_10: Record<string, ChapterTFQuestion[]> = {
  'cn10-c1': [
    {
      number: 1,
      context:
        'Tình huống thực tế: Tại vùng chuyên canh lúa chất lượng cao ở Đồng bằng sông Cửu Long (An Giang, Đồng Tháp), các hợp tác xã đã triển khai đề án canh tác lúa thông minh thích ứng biến đổi khí hậu. Nông dân sử dụng giống lúa xác nhận ST25 và Đài Thơm 8, áp dụng thiết bị bay không người lái (Drone) để gieo sạ cụm và phun chế phẩm sinh học, đồng thời lắp đặt trạm cảm biến mực nước để điều tiết tưới "Ướt – Khô xen kẽ" (AWD), giúp giảm 30% lượng nước tưới và giảm 40% lượng giống gieo sạ.',
      citation:
        'Nguồn: Viện Nghiên cứu Lúa Đồng bằng sông Cửu Long (CLRRI) & Cục Trồng trọt (Bộ NN&PTNT) – Quy trình canh tác lúa giảm phát thải vùng ĐBSCL, 2024.',
      statements: [
        {
          label: 'a',
          level: 'biet',
          text: 'Cây lúa nước thuộc nhóm cây lương thực hằng năm, thân thảo, một lá mầm và có nguồn gốc nhiệt đới.',
          isTrue: true,
          explanation:
            'Theo Bài 2 SGK Công nghệ 10, lúa là cây lương thực hằng năm, thân thảo, một lá mầm, nhóm cây nhiệt đới.',
        },
        {
          label: 'b',
          level: 'hieu',
          text: 'Việc ứng dụng thiết bị bay không người lái (Drone) và cảm biến mực nước tự động là biểu hiện của xu hướng cơ giới hóa, tự động hóa trong trồng trọt công nghệ cao.',
          isTrue: true,
          explanation:
            'Drone và cảm biến IoT giúp tăng độ chính xác, tiết kiệm vật tư và giải phóng sức lao động theo định hướng nông nghiệp 4.0.',
        },
        {
          label: 'c',
          level: 'vandung',
          text: 'Nếu một hợp tác xã có 50 ha lúa áp dụng quy trình trên giúp giảm lượng giống từ 120 kg/ha xuống còn 72 kg/ha thì tổng lượng lúa giống tiết kiệm được trong một vụ là 2,4 tấn.',
          isTrue: true,
          explanation:
            'Mỗi ha tiết kiệm 120 - 72 = 48 kg giống; trên 50 ha tiết kiệm được 50 × 48 = 2.400 kg = 2,4 tấn giống.',
        },
        {
          label: 'd',
          level: 'vandung',
          text: 'Khi đã sử dụng giống lúa đặc sản ST25 và máy bay không người lái thì hợp tác xã có thể gieo trồng ở bất kì nhiệt độ nào dưới 10 °C mà cây lúa vẫn trỗ bông bình thường.',
          isTrue: false,
          explanation:
            'Lúa là cây nhiệt đới (nhiệt độ thuận lợi 20–35 °C); dưới 10–13 °C cây lúa ngừng sinh trưởng và nghẹn đòng dù giống tốt.',
        },
      ],
    },
    {
      number: 2,
      context:
        'Tình huống thực tế: Tại vùng trồng thanh long xuất khẩu huyện Hàm Thuận Nam (tỉnh Bình Thuận), vào vụ chính (tháng 4 đến tháng 9 dương lịch, độ dài ngày trên 12,5 giờ), cây thanh long ra hoa tự nhiên rất sai. Tuy nhiên, từ tháng 10 đến tháng 2 năm sau (mùa ngày ngắn), nông dân phải chong đèn LED chuyên dụng công suất 9W (ánh sáng đỏ – vàng) từ 20 giờ tối đến 4 giờ sáng trong 15–18 đêm liên tục để kích thích thanh long ra hoa rải vụ phục vụ xuất khẩu.',
      citation:
        'Nguồn: Viện Cây ăn quả miền Nam (SOFRI) – Hướng dẫn kĩ thuật chong đèn LED điều khiển ra hoa thanh long rải vụ đạt chuẩn VietGAP, 2023.',
      statements: [
        {
          label: 'a',
          level: 'biet',
          text: 'Hiện tượng cây thanh long phản ứng ra hoa phụ thuộc vào tương quan độ dài ngày và đêm được gọi là hiện tượng quang chu kì.',
          isTrue: true,
          explanation:
            'Quang chu kì là phản ứng của thực vật với tương quan độ dài ngày và đêm điều tiết sự ra hoa (Bài 2 trang 15).',
        },
        {
          label: 'b',
          level: 'hieu',
          text: 'Cây thanh long thuộc nhóm cây ngày ngắn nên chỉ có thể phân hóa mầm hoa khi thời gian chiếu sáng trong ngày ngắn hơn 10 giờ.',
          isTrue: false,
          explanation:
            'Thanh long là cây ngày dài (cần thời gian chiếu sáng > 12 giờ/ngày mới phân hóa mầm hoa).',
        },
        {
          label: 'c',
          level: 'vandung',
          text: 'Việc thay thế bóng đèn sợi đốt 60W truyền thống bằng bóng đèn LED nông nghiệp 9W có phổ tia đỏ phù hợp giúp nhà vườn tiết kiệm tới 85% điện năng tiêu thụ mà vẫn đạt hiệu quả phân hóa mầm hoa.',
          isTrue: true,
          explanation:
            'Công suất giảm từ 60W xuống 9W giúp tiết kiệm (60 - 9) / 60 = 85% điện năng và phổ ánh sáng đỏ kích thích tốt photoreceptor.',
        },
        {
          label: 'd',
          level: 'vandung',
          text: 'Nếu áp dụng cùng quy trình chong đèn ban đêm suốt mùa thu – đông này cho ruộng hoa cúc ngắn ngày thì hoa cúc sẽ ra hoa sớm hơn bình thường.',
          isTrue: false,
          explanation:
            'Hoa cúc là cây ngày ngắn; chiếu đèn ban đêm vào mùa thu – đông sẽ ức chế hoa cúc đóng nụ để cây vươn cao thân chứ không làm ra hoa sớm.',
        },
      ],
    },
    {
      number: 3,
      context:
        'Tình huống thực tế: Trung tâm Nông nghiệp Công nghệ cao tại TP. Đà Lạt (tỉnh Lâm Đồng) triển khai mô hình trồng rau ăn lá ôn đới (cải bó xôi, xà lách Romaine, cải kale) và dâu tây trong hệ thống nhà kính hiện đại. Trong khi nhiệt độ mùa hè ở các tỉnh đồng bằng Nam Bộ lên tới 35–38 °C không trồng được các cây này ngoài trời, thì tại Đà Lạt (độ cao 1.500 m, nhiệt độ trung bình 18–21 °C) cây sinh trưởng rất tốt, cho năng suất cao hơn 25–30%.',
      citation:
        'Nguồn: Viện Khoa học Kỹ thuật Nông nghiệp miền Nam (IAS) & Sở NN&PTNT Lâm Đồng – Báo cáo phát triển nông nghiệp ứng dụng công nghệ cao tại Đà Lạt, 2024.',
      statements: [
        {
          label: 'a',
          level: 'biet',
          text: 'Dâu tây, cải bó xôi, xà lách và su hào đều được phân loại vào nhóm cây trồng có nguồn gốc ôn đới.',
          isTrue: true,
          explanation:
            'Theo Bài 2 SGK Công nghệ 10 (trang 13), dâu tây, bắp cải, su hào, xà lách thuộc nhóm cây nguồn gốc ôn đới.',
        },
        {
          label: 'b',
          level: 'hieu',
          text: 'Các giống rau và dâu tây ôn đới sinh trưởng thuận lợi ở Đà Lạt vì nền nhiệt độ mát mẻ (15–22 °C) phù hợp với bản chất di truyền của nhóm cây có nguồn gốc vĩ độ ôn hòa.',
          isTrue: true,
          explanation:
            'Cây ôn đới ưa khí hậu mát lạnh; nhiệt độ cao trên 35 °C làm cây hô hấp mạnh, ngừng tích lũy chất khô và không phân hóa mầm hoa.',
        },
        {
          label: 'c',
          level: 'vandung',
          text: 'Để trồng thành công xà lách và dâu tây tại vùng đồng bằng nắng nóng, trang trại bắt buộc phải đầu tư nhà kính làm mát (cooling pad + chiller làm lạnh dung dịch rễ) nhằm hạ nhiệt độ vùng rễ xuống 18–22 °C.',
          isTrue: true,
          explanation:
            'Làm mát tiểu khí hậu nhà kính và làm mát dung dịch dinh dưỡng thủy canh giúp rễ cây ôn đới hấp thu nước và khoáng bình thường ở vùng nóng.',
        },
        {
          label: 'd',
          level: 'vandung',
          text: 'Nếu đưa giống sầu riêng và chôm chôm nhiệt đới lên trồng ngoài trời tại vùng núi cao thường xuyên có sương muối và nhiệt độ mùa đông xuống dưới 5 °C thì cây sẽ cho năng suất quả cao gấp đôi ở miền Tây.',
          isTrue: false,
          explanation:
            'Sầu riêng và chôm chôm là cây nhiệt đới điển hình, rất mẫn cảm với rét đậm và sương muối (< 10 °C cây bị cháy lá, rụng hoa và chết).',
        },
      ],
    },
    {
      number: 4,
      context:
        'Tình huống thực tế: Khảo sát chuỗi giá trị ngành hàng cà phê tại tỉnh Đắk Lắk cho thấy: khi nông dân canh tác tự phát, lạm dụng phân hóa học và thu hái cà phê khi tỷ lệ quả chín chỉ đạt 40–50%, hạt cà phê nhân có chất lượng thấp và bị ép giá. Ngược lại, các hợp tác xã liên kết sản xuất theo tiêu chuẩn 4C và VietGAP, tưới tiết kiệm kết hợp bón phân theo độ phì đất và thu hái khi tỷ lệ quả chín trên 95% đã giúp giá bán cà phê đặc sản tăng thêm 25–40% và xuất khẩu sang EU, Nhật Bản.',
      citation:
        'Nguồn: Viện Khoa học Kỹ thuật Nông Lâm nghiệp Tây Nguyên (WASI) – Quy trình tái canh và sản xuất cà phê bền vững vùng Tây Nguyên, Bộ NN&PTNT, 2023.',
      statements: [
        {
          label: 'a',
          level: 'biet',
          text: 'Cung cấp nguồn hàng nông sản xuất khẩu chủ lực và nguyên liệu cho công nghiệp chế biến là hai trong những vai trò quan trọng của ngành trồng trọt Việt Nam.',
          isTrue: true,
          explanation:
            'Bài 1 SGK Công nghệ 10 khẳng định trồng trọt cung cấp lương thực, nguyên liệu công nghiệp chế biến và nông sản xuất khẩu.',
        },
        {
          label: 'b',
          level: 'hieu',
          text: 'Các yếu tố giống, đất trồng, nước tưới và kĩ thuật canh tác – thu hoạch có mối quan hệ tác động tổng hợp quyết định cả năng suất lẫn phẩm chất nông sản.',
          isTrue: true,
          explanation:
            'Tất cả 6 yếu tố chính trong trồng trọt gắn kết chặt chẽ; thiếu đồng bộ ở khâu chăm sóc hoặc thu hoạch đều làm giảm chất lượng.',
        },
        {
          label: 'c',
          level: 'vandung',
          text: 'Việc thu hái cà phê khi quả chín đạt trên 95% giúp hạt tích lũy tối đa chất khô, đường và hợp chất thơm, đồng thời giảm tỷ lệ hạt đen vỡ trong khâu chế biến.',
          isTrue: true,
          explanation:
            'Quả cà phê chín sinh lí tích lũy đầy đủ chất khô và tiền chất hương vị, giúp nâng cao chất lượng cà phê nhân xuất khẩu.',
        },
        {
          label: 'd',
          level: 'vandung',
          text: 'Để tiết kiệm công lao động, người trồng cà phê nên tuốt sạch toàn bộ quả xanh non và cành lá ngay sau khi hoa vừa đậu quả được 2 tháng.',
          isTrue: false,
          explanation:
            'Thu hoạch quả xanh non làm hạt teo lép, mất phẩm chất, giảm mạnh sản lượng và làm gãy cành dự trữ cho vụ năm sau.',
        },
      ],
    },
  ],
  'cn10-c2': [
    {
      number: 1,
      context:
        'Tình huống thực tế: Kết quả phân tích mẫu đất tại vùng đất phèn trồng khóm (dứa) và lúa ở vùng Tứ giác Long Xuyên (tỉnh Kiên Giang) vào đầu mùa mưa ghi nhận: pH(KCl) của tầng đất mặt (0–20 cm) chỉ đạt 3,8; hàm lượng ion Al3+ và Fe3+ di động rất cao gây ngộ độc làm rễ lúa bị quăn queo, thâm đen và không hút được lân. Trạm Khuyến nông đã hướng dẫn nông dân bón 1,5 tấn vôi nông nghiệp (CaCO3)/ha kết hợp đưa nước ngọt vào ngâm ruộng rồi tháo cạn qua hệ thống kênh tiêu trước khi xuống giống.',
      citation:
        'Nguồn: Viện Thổ nhưỡng Nông hóa (SFRI) & Khoa Nông nghiệp – Trường Đại học Cần Thơ, Tài liệu hướng dẫn quản lí và cải tạo đất phèn vùng ĐBSCL, 2023.',
      statements: [
        {
          label: 'a',
          level: 'biet',
          text: 'Mẫu đất có trị số pH = 3,8 được xếp vào nhóm đất rất chua (do pH nhỏ hơn 6,6).',
          isTrue: true,
          explanation:
            'Theo Bài 3 SGK Công nghệ 10 (trang 23), đất có pH < 6,6 là đất chua; pH = 3,8 là mức đất rất chua.',
        },
        {
          label: 'b',
          level: 'hieu',
          text: 'Các ion Al3+ và H+ bám trên bề mặt lớp khuếch tán của hạt keo đất là nguyên nhân tạo nên độ chua tiềm tàng của đất phèn.',
          isTrue: true,
          explanation:
            'Độ chua tiềm tàng do các ion H+ và Al3+ hấp phụ trên bề mặt keo đất gây nên khi trao đổi với cation trong dung dịch đất.',
        },
        {
          label: 'c',
          level: 'vandung',
          text: 'Khi bón vôi kết hợp thau rửa nước ngọt, ion Ca2+ sẽ đẩy H+ và Al3+ ra khỏi keo đất, trung hòa acid tự do và kết tủa Al3+, Fe3+ di động thành dạng kết tủa không gây độc cho rễ lúa.',
          isTrue: true,
          explanation:
            'Đây là cơ sở khoa học cốt lõi của biện pháp bón vôi kết hợp thủy lợi thau chua rửa phèn (Bài 4 trang 26).',
        },
        {
          label: 'd',
          level: 'vandung',
          text: 'Trên nền đất phèn chua có pH = 3,8 này, nông dân nên bón liên tục phân đạm sunfat (NH4)2SO4 và phân kali clorua (KCl) với liều cao để khử chua thay cho vôi.',
          isTrue: false,
          explanation:
            '(NH4)2SO4 và KCl là các loại phân có phản ứng sinh lí chua; bón vào đất phèn sẽ giải phóng thêm H+ và SO4 2-, Cl- làm đất càng chua nặng hơn.',
        },
      ],
    },
    {
      number: 2,
      context:
        'Tình huống thực tế: Trong đợt hạn mặn mùa khô tại huyện Thạnh Phú (tỉnh Bến Tre), nước biển xâm nhập sâu làm độ mặn của đất vườn cây ăn quả và ruộng lúa ven biển tăng cao. Khi cán bộ kĩ thuật lấy mẫu đất đo thực hành theo quy trình Bài 6, nồng độ muối tan tổng số trong đất đạt 5,4‰, trên mặt ruộng khi khô xuất hiện lớp váng muối trắng xóa và keo đất hấp phụ lượng lớn ion Na+ làm đất bị bết chặt khi ướt, nứt nẻ cứng như đá khi khô.',
      citation:
        'Nguồn: Viện Khoa học Thủy lợi miền Nam (SIWRR) & Cục Trồng trọt – Khuyến cáo kĩ thuật cải tạo đất nhiễm mặn phục hồi sản xuất sau hạn mặn vùng ĐBSCL, 2024.',
      statements: [
        {
          label: 'a',
          level: 'biet',
          text: 'Theo tiêu chuẩn phân loại đất trồng (Bài 4 SGK Công nghệ 10), đất có nồng độ muối tan lớn hơn 2,56‰ được xác định là đất mặn.',
          isTrue: true,
          explanation:
            'Bài 4 SGK Công nghệ 10 (trang 28) quy định đất mặn là đất có nồng độ muối tan (NaCl, Na2SO4...) trên 2,56‰.',
        },
        {
          label: 'b',
          level: 'hieu',
          text: 'Cây trồng thông thường bị héo chết trên đất nhiễm mặn 5,4‰ chủ yếu vì áp suất thẩm thấu của dung dịch đất cao hơn dịch tế bào lông hút khiến rễ không hút được nước (hạn sinh lí).',
          isTrue: true,
          explanation:
            'Nồng độ muối tan cao trong đất làm tăng áp suất thẩm thấu ngoài dung dịch đất và gây độc trực tiếp của ion Na+, Cl- đối với rễ.',
        },
        {
          label: 'c',
          level: 'vandung',
          text: 'Quy trình cải tạo đúng cho ruộng đất mặn 5,4‰ là bón vôi (CaO/CaSO4) để Ca2+ đẩy Na+ ra khỏi keo đất, sau đó dẫn nước ngọt vào ngâm ruộng rồi tháo bỏ nước mặn ra kênh tiêu.',
          isTrue: true,
          explanation:
            'Ca2+ trao đổi đẩy Na+ khỏi keo đất vào dung dịch, sau đó dùng nước ngọt rửa trôi muối hòa tan ra khỏi ruộng (Bài 4 trang 28).',
        },
        {
          label: 'd',
          level: 'vandung',
          text: 'Trong lúc chưa có nguồn nước ngọt để thau rửa mặn, nông dân nên bơm trực tiếp nước lợ có độ mặn 8‰ từ ngoài sông vào tưới đẫm lên tán lá cây sầu riêng mỗi ngày.',
          isTrue: false,
          explanation:
            'Sầu riêng rất mẫn cảm với mặn (ngưỡng chịu mặn nước tưới < 0,5–1‰); tưới nước mặn 8‰ lên lá và gốc sẽ làm cháy lá, rụng lá và chết cây ngay.',
        },
      ],
    },
    {
      number: 3,
      context:
        'Tình huống thực tế: Tại vùng đất xám bạc màu trên phù sa cổ ở huyện Hiệp Hòa (tỉnh Bắc Giang), kết quả điều tra phẫu diện đất cho thấy: tầng canh tác chỉ dày 10–12 cm, thành phần cơ giới nhẹ (tỉ lệ cát chiếm trên 75%, rất ít hạt sét), hàm lượng chất mùn dưới 1,0%, pH = 4,6. Đất rất dễ bị rửa trôi dinh dưỡng khi mưa lớn và nhanh khô hạn khi nắng.',
      citation:
        'Nguồn: Viện Thổ nhưỡng Nông hóa (SFRI – VAAS) – Báo cáo khoa học cải tạo và nâng cao độ phì đất xám bạc màu vùng trung du Bắc Bộ, 2022.',
      statements: [
        {
          label: 'a',
          level: 'biet',
          text: 'Đất xám bạc màu có đặc điểm tầng đất mặt mỏng, thành phần cơ giới nhẹ (nhiều cát, ít sét), nghèo mùn và thường có phản ứng chua.',
          isTrue: true,
          explanation:
            'Theo Bài 4 SGK Công nghệ 10 (trang 29), đất xám bạc màu hình thành trên phù sa cổ, cơ giới nhẹ, nghèo dinh dưỡng, chua và tầng đất mỏng.',
        },
        {
          label: 'b',
          level: 'hieu',
          text: 'Đất xám bạc màu giữ nước và phân bón kém vì hàm lượng hạt sét và mùn hữu cơ quá thấp nên số lượng hạt keo đất có khả năng hấp phụ trao đổi ion rất ít.',
          isTrue: true,
          explanation:
            'Keo đất chủ yếu có trong phần hạt sét và chất mùn; đất nhiều cát ít sét – mùn nên khả năng hấp phụ giữ phân và nước rất thấp.',
        },
        {
          label: 'c',
          level: 'vandung',
          text: 'Để cải tạo bền vững vùng đất này, nông dân cần cày sâu dần từng vụ kết hợp bón 10–15 tấn phân hữu cơ hoai mục + vôi bột/ha và luân canh cây họ Đậu (lạc, đậu tương).',
          isTrue: true,
          explanation:
            'Cày sâu dần kết hợp bón phân hữu cơ, vôi và trồng cây họ Đậu cố định đạm giúp làm dày tầng canh tác và tăng hàm lượng keo mùn (Bài 4 trang 30).',
        },
        {
          label: 'd',
          level: 'vandung',
          text: 'Ngay trong vụ đầu tiên cải tạo, nông dân nên dùng máy cày đại trà cày lật sâu một lần tới 40 cm để đưa toàn bộ tầng đất sét nghèo dinh dưỡng ở dưới sâu lên phủ kín mặt ruộng.',
          isTrue: false,
          explanation:
            'Tầng đất mặt của đất bạc màu rất mỏng (10–12 cm); nếu cày lật sâu ngay 40 cm sẽ đưa tầng đất chết nghèo dinh dưỡng lên mặt làm cây không sống được.',
        },
      ],
    },
    {
      number: 4,
      context:
        'Tình huống thực tế: Một vườn ươm giống rau và hoa công nghệ cao tại huyện Gia Lâm (Hà Nội) sản xuất giá thể đóng bầu ươm cây con theo công thức phối trộn thể tích: 60% mùn xơ dừa đã qua xử lí + 25% trấu hun + 15% đá trân châu (Perlite). Trong lô sản xuất đầu tiên, do công nhân bỏ qua công đoạn ngâm xả xơ dừa tươi bằng nước sạch và nước vôi trong nên sau khi gieo hạt cà chua được 7 ngày, cây con có biểu hiện chững lại, đầu rễ non bị thâm nâu.',
      citation:
        'Nguồn: Học viện Nông nghiệp Việt Nam (VNUA) – Giáo trình Giá thể trồng cây và Kỹ thuật sản xuất cây giống rau hoa công nghệ cao, NXB Nông nghiệp, 2023.',
      statements: [
        {
          label: 'a',
          level: 'biet',
          text: 'Trong hỗn hợp giá thể của vườn ươm, mùn xơ dừa và trấu hun thuộc nhóm giá thể hữu cơ tự nhiên, còn đá Perlite thuộc nhóm giá thể trơ cứng (vô cơ).',
          isTrue: true,
          explanation:
            'Theo Bài 5 SGK Công nghệ 10 (trang 31–35), than bùn, mùn cưa, trấu hun, xơ dừa là giá thể hữu cơ; Perlite và gốm viên là giá thể trơ vô cơ.',
        },
        {
          label: 'b',
          level: 'hieu',
          text: 'Nguyên nhân làm đầu rễ cây cà chua con bị thâm nâu trong lô đầu tiên là do xơ dừa tươi chưa xử lí còn chứa nhiều tanin và lignin hòa tan gây ngộ độc cho rễ non.',
          isTrue: true,
          explanation:
            'Xơ dừa tươi chứa hàm lượng cao tanin (chất chát) và lignin gây ức chế sự hút nước, khoáng và làm thâm đầu rễ cây con (Bài 5 trang 33).',
        },
        {
          label: 'c',
          level: 'vandung',
          text: 'Để khắc phục cho lô giá thể tiếp theo, xưởng cần ngâm xơ dừa trong nước sạch 2–3 ngày (xả 2–3 lần), sau đó ngâm nước vôi (2 kg vôi/100 lít nước) trong 5–7 ngày rồi rửa sạch trước khi phối trộn.',
          isTrue: true,
          explanation:
            'Đây là quy trình chuẩn tạo giá thể xơ dừa trong Bài 5 SGK Công nghệ 10 (trang 33) để khử sạch tanin và lignin.',
        },
        {
          label: 'd',
          level: 'vandung',
          text: 'Việc phối trộn thêm 25% trấu hun và 15% đá Perlite vào mùn xơ dừa chỉ làm tốn kém chi phí chứ không có tác dụng cải thiện độ thoáng khí hay khả năng thoát nước của bầu ươm.',
          isTrue: false,
          explanation:
            'Xơ dừa giữ ẩm cao nhưng dễ bí khí nếu dùng đơn độc; phối trộn thêm trấu hun và Perlite tạo độ tơi xốp, thoáng khí O2 và bổ sung khoáng K, Si.',
        },
      ],
    },
  ],
  'cn10-c3': [
    {
      number: 1,
      context:
        'Tình huống thực tế: Tại vùng trồng vải thiều xuất khẩu huyện Lục Ngạn (tỉnh Bắc Giang), sau khi thu hoạch quả vào tháng 7, các nhà vườn tiến hành tỉa cành và bón phân phục hồi cây với công thức mỗi gốc (10 năm tuổi): 30 kg phân hữu cơ vi sinh + 1,5 kg phân lân supe + 0,5 kg đạm urea. Đến giai đoạn nuôi quả lớn và trước thu hoạch 1 tháng, nhà vườn giảm đạm và tăng cường bón phân kali sunfat (K2SO4) để quả vải vào cùi dày, ngọt đậm và lên màu vỏ đỏ tươi đẹp.',
      citation:
        'Nguồn: Viện Nghiên cứu Rau quả (FAVRI) & Sở NN&PTNT Bắc Giang – Quy trình kĩ thuật thâm canh vải thiều đạt tiêu chuẩn GlobalGAP phục vụ xuất khẩu, 2024.',
      statements: [
        {
          label: 'a',
          level: 'biet',
          text: 'Trong các loại phân nhà vườn sử dụng, đạm urea, lân supe và kali sunfat thuộc nhóm phân bón hóa học đơn đa lượng.',
          isTrue: true,
          explanation:
            'Theo Bài 7 SGK Công nghệ 10, phân đơn chỉ chứa 1 nguyên tố dinh dưỡng đa lượng chính (N hoặc P hoặc K).',
        },
        {
          label: 'b',
          level: 'hieu',
          text: 'Việc tăng cường bón phân kali (K2SO4) ở giai đoạn nuôi quả giúp thúc đẩy quá trình vận chuyển và tích lũy đường, chất khô về quả, làm tăng độ ngọt và màu sắc quả vải.',
          isTrue: true,
          explanation:
            'Nguyên tố Kali (K) đóng vai trò quyết định trong vận chuyển carbohydrate từ lá về cơ quan dự trữ (quả, củ, hạt) và nâng cao phẩm chất nông sản.',
        },
        {
          label: 'c',
          level: 'vandung',
          text: 'Ở lần bón phục hồi sau thu hoạch, nhà vườn nên trộn chung 1,5 kg phân lân supe với 30 kg phân hữu cơ vi sinh và đào rãnh bón lấp đất xung quanh hình chiếu tán cây.',
          isTrue: true,
          explanation:
            'Bón theo rãnh quanh hình chiếu tán cây (nơi tập trung nhiều rễ hút) và lấp đất giúp phân lân và phân hữu cơ vi sinh phát huy hiệu quả tối đa.',
        },
        {
          label: 'd',
          level: 'vandung',
          text: 'Để quả vải ngọt hơn và vỏ dày không bị nứt, vào thời điểm 10 ngày trước khi thu hoạch, nhà vườn nên bón thúc thật nhiều phân đạm urea nguyên chất (3 kg urea/gốc).',
          isTrue: false,
          explanation:
            'Bón nhiều đạm sát ngày thu hoạch làm quả vải bị chua, nhạt nước, nứt vỏ hàng loạt, dễ nhiễm nấm thán thư và nhanh thối sau thu hoạch.',
        },
      ],
    },
    {
      number: 2,
      context:
        'Tình huống thực tế: Một hợp tác xã trồng lạc (đậu phộng) xuân trên đất cát pha tại huyện Diễn Châu (tỉnh Nghệ An) thực hiện thí nghiệm đối chứng trên 2 lô ruộng: Lô 1 bón phân nền NPK truyền thống; Lô 2 bón cùng lượng phân lân, kali và vôi nhưng giảm 60% phân đạm hóa học và thay bằng việc trộn hạt giống lạc với chế phẩm phân vi sinh cố định đạm (chứa vi khuẩn Rhizobium đạt mật độ ≥ 10^8 CFU/g) ngay trước khi gieo ở nơi râm mát. Kết quả thu hoạch Lô 2 có số nốt sần hữu hiệu tăng gấp 2,5 lần và năng suất củ khô tăng 18,4% so với Lô 1.',
      citation:
        'Nguồn: Viện Thổ nhưỡng Nông hóa (SFRI) – Kết quả ứng dụng phân bón vi sinh vật cố định nitơ cho cây họ Đậu tại vùng Bắc Trung Bộ, Tạp chí KH&CN Nông nghiệp Việt Nam, 2023.',
      statements: [
        {
          label: 'a',
          level: 'biet',
          text: 'Chế phẩm chứa vi khuẩn Rhizobium sử dụng ở Lô 2 thuộc nhóm phân bón vi sinh vật cố định đạm cộng sinh với cây họ Đậu.',
          isTrue: true,
          explanation:
            'Theo Bài 9 SGK Công nghệ 10 (trang 49), vi khuẩn Rhizobium sống cộng sinh tạo nốt sần ở rễ cây họ Đậu để cố định N2 không khí.',
        },
        {
          label: 'b',
          level: 'hieu',
          text: 'Khi trộn hạt giống lạc với phân vi sinh cố định đạm, người dân phải thực hiện ở nơi râm mát và gieo ngay rồi lấp đất ẩm để tránh tia tử ngoại mặt trời làm chết vi khuẩn.',
          isTrue: true,
          explanation:
            'Ánh nắng trực tiếp và nhiệt độ cao làm chết các tế bào vi sinh vật sống trong chế phẩm phân vi sinh (Bài 9 trang 51).',
        },
        {
          label: 'c',
          level: 'vandung',
          text: 'Nhờ hoạt động cố định đạm sinh học của nốt sần ở Lô 2, sau khi thu hoạch củ lạc, phần thân lá lạc trả lại cho đất một lượng đạm hữu cơ đáng kể giúp cải tạo độ phì đất cho vụ lúa mùa kế tiếp.',
          isTrue: true,
          explanation:
            'Cây họ Đậu cộng sinh với Rhizobium vừa tự túc phần lớn đạm cho cây vừa để lại sinh khối giàu đạm cải tạo đất.',
        },
        {
          label: 'd',
          level: 'vandung',
          text: 'Để tiết kiệm công lao động ở Lô 2, nông dân nên trộn chung chế phẩm vi sinh Rhizobium trực tiếp với thuốc trừ nấm hóa học gốc đồng và vôi bột đang nóng rồi mới đem áo vào hạt lạc.',
          isTrue: false,
          explanation:
            'Thuốc trừ nấm gốc đồng và vôi nóng có tính sát khuẩn mạnh sẽ tiêu diệt hoàn toàn vi khuẩn Rhizobium trong phân vi sinh.',
        },
      ],
    },
    {
      number: 3,
      context:
        'Tình huống thực tế: Tại trang trại trồng rau hữu cơ ở huyện Đơn Dương (tỉnh Lâm Đồng), kỹ sư nông nghiệp hướng dẫn công nhân ủ 2 tấn phụ phẩm rau già, thân cây ngô băm nhỏ (dài 3–5 cm) phối trộn với 500 kg phân bò, 10 kg phân lân nung chảy và 2 kg chế phẩm nấm đối kháng Trichoderma. Khối ủ được tưới nước đạt độ ẩm 60%, phủ bạt giữ nhiệt; sau 7 ngày nhiệt độ tâm đống ủ tăng lên 58 °C, công nhân tiến hành đảo trộn định kì và sau 35 ngày thu được phân hữu cơ vi sinh tơi xốp, màu nâu đen, không còn mùi hôi.',
      citation:
        'Nguồn: Viện Khoa học Nông nghiệp Việt Nam (VAAS) – Sổ tay kĩ thuật sản xuất và sử dụng phân bón hữu cơ vi sinh từ phụ phẩm trồng trọt, NXB Nông nghiệp, 2023.',
      statements: [
        {
          label: 'a',
          level: 'biet',
          text: 'Quy trình trên là quy trình sản xuất phân bón hữu cơ vi sinh từ phụ phẩm nông nghiệp kết hợp chủng vi sinh vật phân giải chất hữu cơ.',
          isTrue: true,
          explanation:
            'Theo Bài 10 SGK Công nghệ 10 (trang 54), ủ chất hữu cơ với chế phẩm VSV có ích (như Trichoderma) tạo thành phân hữu cơ vi sinh.',
        },
        {
          label: 'b',
          level: 'hieu',
          text: 'Việc duy trì độ ẩm 60% và đảo trộn đống ủ định kì nhằm cung cấp đủ nước và khí oxygen (O2) cho các vi sinh vật hiếu khí hoạt động phân giải cellulose.',
          isTrue: true,
          explanation:
            'VSV phân giải chất hữu cơ trong ủ compost chủ yếu là nhóm hiếu khí, cần độ ẩm 55–65% và độ thông thoáng O2.',
        },
        {
          label: 'c',
          level: 'vandung',
          text: 'Mức nhiệt độ 58 °C đạt được ở tâm đống ủ có tác dụng tiêu diệt các mầm bệnh hại thực vật, trứng côn trùng và làm mất sức nảy mầm của hạt cỏ dại có lẫn trong nguyên liệu.',
          isTrue: true,
          explanation:
            'Nhiệt độ sinh học 55–65 °C trong đống ủ giúp khử trùng tự nhiên khối phân ủ mà không làm chết bào tử VSV chịu nhiệt có ích.',
        },
        {
          label: 'd',
          level: 'vandung',
          text: 'Khi kiểm tra độ ẩm đống ủ, nếu bóp nhẹ nắm nguyên liệu thấy nước chảy thành dòng ròng ròng qua kẽ tay (độ ẩm trên 85%) thì không cần xử lí gì vì càng ướt phân càng nhanh hoai.',
          isTrue: false,
          explanation:
            'Độ ẩm > 85% làm bít kín khe hở không khí, đống ủ chuyển sang phân hủy yếm khí gây mùi thối chua và làm chết nấm Trichoderma hiếu khí.',
        },
      ],
    },
    {
      number: 4,
      context:
        'Tình huống thực tế: Trong kho vật tư của một hợp tác xã nông nghiệp tại tỉnh Thái Bình có 3 bao phân bón hóa học bị mờ nhãn hiệu (gồm: 1 bao Đạm amoni sunfat (NH4)2SO4, 1 bao Supe lân Ca(H2PO4)2 và 1 bao Kali clorua KCl). Nhóm học sinh lớp 10 đã vận dụng Bài 11 SGK Công nghệ 10 lấy mẫu từng bao để nhận biết nhanh bằng quan sát màu sắc, hòa tan vào nước cất và đốt thử trên cục than hồng.',
      citation:
        'Nguồn: Bộ Giáo dục và Đào tạo – Sách giáo khoa Công nghệ 10 (Công nghệ Trồng trọt, Bộ Kết nối tri thức với cuộc sống), Bài 11: Thực hành nhận biết một số loại phân bón hóa học, trang 57–59.',
      statements: [
        {
          label: 'a',
          level: 'biet',
          text: 'Mẫu phân bón có dạng bột màu xám tro (hoặc xám trắng), khi khuấy vào ống nghiệm chứa nước cất thấy không tan hoặc chỉ tan một phần rất nhỏ tạo dung dịch đục là phân Supe lân.',
          isTrue: true,
          explanation:
            'Theo Bài 11 SGK Công nghệ 10 (trang 57), nhóm phân lân có màu xám tro/xám nâu và không tan hoặc ít tan trong nước.',
        },
        {
          label: 'b',
          level: 'hieu',
          text: 'Mẫu phân tan hoàn toàn trong nước, khi rắc lên cục than hồng thấy nóng chảy, bốc khói trắng và tỏa mùi khai nồng của khí NH3 là phân Đạm amoni sunfat.',
          isTrue: true,
          explanation:
            'Phân đạm khi đốt trên than hồng bị nhiệt phân giải phóng khí amoniac (NH3) có mùi khai nồng đặc trưng (Bài 11 trang 58).',
        },
        {
          label: 'c',
          level: 'vandung',
          text: 'Mẫu phân còn lại có tinh thể màu đỏ hồng (như muối ớt), tan hoàn toàn trong nước và khi đốt trên than hồng không có mùi khai mà phát tiếng nổ lách tách là phân Kali clorua (KCl).',
          isTrue: true,
          explanation:
            'Kali clorua (KCl) có màu đỏ hồng/trắng đục, tan hết trong nước và khi đốt trên than hồng các tinh thể muối nổ lách tách, không có mùi khai.',
        },
        {
          label: 'd',
          level: 'vandung',
          text: 'Sau khi phân loại xong, hợp tác xã nên đổ trộn chung bao Đạm amoni sunfat với vôi bột (CaO) vào cùng một thùng kín để dự trữ dùng dần cho vụ lúa cách đó 4 tháng.',
          isTrue: false,
          explanation:
            'Tuyệt đối không trộn phân đạm amoni với vôi để bảo quản vì phản ứng tạo khí NH3 bay hơi làm mất đạm hoàn toàn.',
        },
      ],
    },
  ],
  'cn10-c4': [
    {
      number: 1,
      context:
        'Tình huống thực tế: Giống lúa ST25 (do nhóm kĩ sư Hồ Quang Cua và cộng sự tại tỉnh Sóc Trăng chọn tạo) được lai tạo phức tạp từ nhiều giống bố mẹ có nguồn gốc khác nhau (giống lúa thơm đặc sản địa phương lai với các dòng kháng bệnh đạo ôn, thân cứng và năng suất cao), sau đó trải qua nhiều thế hệ chọn lọc cá thể theo dòng để cố định các gene quý. Năm 2019 và 2023, gạo ST25 hai lần đạt giải "Gạo ngon nhất thế giới" với hạt gạo thon dài, trắng trong, cơm dẻo thơm mùi lá dứa – cốm non và thời gian sinh trưởng ngắn (95–105 ngày).',
      citation:
        'Nguồn: Cục Trồng trọt (Bộ NN&PTNT) & Sở NN&PTNT Sóc Trăng – Hồ sơ công nhận giống cây trồng nông nghiệp mới đối với giống lúa thơm ST25, 2020.',
      statements: [
        {
          label: 'a',
          level: 'biet',
          text: 'Giống lúa ST25 được tạo ra bằng phương pháp lai hữu tính kết hợp với chọn lọc cá thể qua các thế hệ.',
          isTrue: true,
          explanation:
            'Lai hữu tính giúp tổ hợp các gene quý từ nhiều giống bố mẹ, sau đó chọn lọc cá thể theo dòng để tạo giống thuần mới (Bài 13 trang 66–67).',
        },
        {
          label: 'b',
          level: 'hieu',
          text: 'Việc áp dụng chọn lọc cá thể theo từng dòng ở các thế hệ sau khi lai giúp các nhà chọn giống kiểm tra chính xác kiểu gene và loại bỏ các dòng còn phân li tính trạng.',
          isTrue: true,
          explanation:
            'Chọn lọc cá thể thu hạt riêng từng cây ưu tú và gieo thành dòng để đánh giá sự di truyền ổn định của kiểu gene.',
        },
        {
          label: 'c',
          level: 'vandung',
          text: 'Để giữ vững phẩm chất gạo ST25 trên diện rộng, các hợp tác xã thương phẩm cần sử dụng nguồn hạt giống cấp Xác nhận (được nhân từ hạt giống Nguyên chủng) thay vì dùng thóc thịt thu hoạch ngoài ruộng làm giống qua nhiều vụ.',
          isTrue: true,
          explanation:
            'Dùng thóc thịt làm giống nhiều vụ sẽ bị lẫn tạp cơ học, lai tạp tự nhiên và thoái hóa giống làm giảm hương thơm và năng suất.',
        },
        {
          label: 'd',
          level: 'vandung',
          text: 'Vì ST25 là giống lúa thuần đã được công nhận nên nông dân có thể gieo hạt ST25 trên đất mặn có nồng độ muối 15‰ mà cây lúa vẫn cho năng suất 8 tấn/ha.',
          isTrue: false,
          explanation:
            'Ngưỡng chịu mặn của các giống lúa chịu mặn (kể cả ST25 trong mô hình lúa – tôm) chỉ khoảng 3–4‰; ở độ mặn 15‰ cây lúa sẽ chết hoàn toàn.',
        },
      ],
    },
    {
      number: 2,
      context:
        'Tình huống thực tế: Tại các phòng thí nghiệm công nghệ sinh học ở TP. Đà Lạt (Lâm Đồng) và TP. Hồ Chí Minh, quy trình vi nhân giống (nuôi cấy mô tế bào in vitro) hoa lan Hồ Điệp và chuối già Nam Mỹ (chuối Laba/Cavendish) được thực hiện quanh năm. Từ 1 chồi đỉnh sinh trưởng sạch bệnh ban đầu, sau 6–8 tháng nhân nhanh trên môi trường dinh dưỡng MS có bổ sung hormone Cytokinin và Auxin trong phòng vô trùng, trung tâm sản xuất được hàng vạn cây giống đồng đều hoàn toàn về mặt di truyền.',
      citation:
        'Nguồn: Viện Di truyền Nông nghiệp (AGI – VAAS) & Trung tâm Công nghệ Sinh học TP.HCM – Quy trình vi nhân giống chuối và hoa lan quy mô công nghiệp, 2023.',
      statements: [
        {
          label: 'a',
          level: 'biet',
          text: 'Nhân giống cây trồng bằng nuôi cấy mô tế bào là một phương pháp nhân giống vô tính hiện đại dựa trên tính toàn năng của tế bào thực vật.',
          isTrue: true,
          explanation:
            'Theo Bài 14 SGK Công nghệ 10 (trang 69), nuôi cấy mô tế bào thuộc nhóm nhân giống vô tính, giữ nguyên kiểu gene cây mẹ.',
        },
        {
          label: 'b',
          level: 'hieu',
          text: 'Trong quy trình nuôi cấy mô, giai đoạn chuyển chồi sang môi trường tạo rễ cần điều chỉnh tăng tỉ lệ hormone Auxin (như IBA, NAA) để kích thích mô sẹo/gốc chồi hình thành bộ rễ hoàn chỉnh.',
          isTrue: true,
          explanation:
            'Hormone Cytokinin kích thích bật chồi, còn hormone Auxin kích thích sự phân hóa và hình thành rễ bất định cho chồi in vitro.',
        },
        {
          label: 'c',
          level: 'vandung',
          text: 'Nhờ nuôi cấy từ mô phân sinh đỉnh kết hợp kiểm soát vô trùng nghiêm ngặt, cây chuối giống cấy mô hoàn toàn sạch bệnh virus chùn ngọn (BBTV) và bệnh héo vàng Panama khi xuất vườn.',
          isTrue: true,
          explanation:
            'Đỉnh sinh trưởng có tốc độ phân bào nhanh, ít mạch dẫn nên sạch virus; nuôi cấy vô trùng giúp tạo nguồn cây giống sạch bệnh đồng loạt.',
        },
        {
          label: 'd',
          level: 'vandung',
          text: 'Ngay khi vừa rút cây con ra khỏi bình thủy tinh trong phòng thí nghiệm, nông dân nên đem trồng thẳng ra đồng ruộng dưới nắng gắt 37 °C ngay lập tức để cây quang hợp mạnh.',
          isTrue: false,
          explanation:
            'Cây con mới ra khỏi bình in vitro phải qua giai đoạn huấn luyện ở vườn ươm có mái che và giữ ẩm (Bài 14 trang 71); trồng thẳng ra nắng gắt cây sẽ mất nước chết ngay.',
        },
      ],
    },
    {
      number: 3,
      context:
        'Tình huống thực tế: Tại vùng cây ăn quả huyện Chợ Lách (tỉnh Bến Tre) và huyện Cao Phong (tỉnh Hòa Bình), các nghệ nhân sản xuất cây giống có múi (cam, bưởi da xanh) thường gieo hạt bưởi chua hoặc cam ba lá để làm gốc ghép. Khi cây gốc ghép cao 50–60 cm, đường kính thân đạt 0,6–0,8 cm, người ta cắt lấy mắt ghép hoặc đoạn cành bánh tẻ từ cây bưởi da xanh đầu dòng (đã được xử lí sạch bệnh vàng lá greening trong nhà lưới) ghép vào gốc ghép ở độ cao cách mặt bầu 15–20 cm.',
      citation:
        'Nguồn: Viện Cây ăn quả miền Nam (SOFRI) – Quy trình sản xuất cây giống cây ăn quả có múi sạch bệnh trong nhà lưới cách li côn trùng, Bộ NN&PTNT, 2023.',
      statements: [
        {
          label: 'a',
          level: 'biet',
          text: 'Ghép cây là phương pháp nhân giống vô tính gắn một bộ phận sinh dưỡng (mắt ghép hoặc cành ghép) của cây mẹ lên một cây khác (gốc ghép) để tạo thành một cá thể mới.',
          isTrue: true,
          explanation:
            'Theo Bài 14 SGK Công nghệ 10 (trang 68), cây ghép là sự kết hợp giữa gốc ghép và cành/mắt ghép.',
        },
        {
          label: 'b',
          level: 'hieu',
          text: 'Thao tác kĩ thuật quyết định sự tiếp hợp sống của vết ghép là phải đặt áp sát lớp tượng tầng (tầng phát sinh) của mắt ghép/cành ghép trùng khít với lớp tượng tầng của gốc ghép và buộc dây nilon kín chặt.',
          isTrue: true,
          explanation:
            'Tượng tầng của gốc ghép và cành ghép tiếp xúc khít nhau mới phân chia tạo mô sẹo nối liền mạch gỗ và mạch rây nuôi sống cành ghép.',
        },
        {
          label: 'c',
          level: 'vandung',
          text: 'Cây bưởi da xanh nhân giống bằng phương pháp ghép này vừa có bộ rễ cọc khỏe mạnh, chống chịu bệnh thối rễ của gốc bưởi hạt, vừa cho quả giữ nguyên hương vị ngon ngọt của cây bưởi da xanh mẹ và ra quả sớm hơn trồng hạt.',
          isTrue: true,
          explanation:
            'Ghép cây kết hợp được ưu thế bộ rễ khỏe của gốc ghép gieo hạt với phẩm chất quả ưu tú và tuổi thành숙 của cành ghép.',
        },
        {
          label: 'd',
          level: 'vandung',
          text: 'Sau khi mắt ghép đã bật mầm dài 15 cm, nếu trên phần thân gốc ghép phía dưới vết ghép mọc ra nhiều chồi dại (mầmbưởi chua) thì nhà vườn nên giữ lại toàn bộ chồi dại đó để cây có nhiều lá hơn.',
          isTrue: false,
          explanation:
            'Phải tỉa bỏ kịp thời toàn bộ mầm dại mọc ra từ gốc ghép vì chúng cạnh tranh mạnh nước và dinh dưỡng làm cành ghép chính bị còi cọc và chết.',
        },
      ],
    },
    {
      number: 4,
      context:
        'Tình huống thực tế: Tại vùng trồng vải thiều Thanh Hà (tỉnh Hải Dương) và nhãn lồng (tỉnh Hưng Yên), vào tháng 3 – tháng 4 dương lịch khi thời tiết ấm áp và có mưa xuân, nông dân thực hiện nhân giống bằng phương pháp chiết cành. Người dân chọn các cành bánh tẻ (đường kính 1–1,5 cm) nằm ở tầng giữa tán, vươn ra ánh sáng, dùng dao sắc khoanh một đoạn vỏ dài 2–3 cm, cạo sạch lớp màng nhầy (tượng tầng) trên mặt gỗ, để khô nhựa 2–3 ngày rồi bó bầu bằng hỗn hợp đất bùn ao trộn rơm mục (hoặc xơ dừa ẩm) và bọc kín bằng màng nilon trong.',
      citation:
        'Nguồn: Viện Nghiên cứu Rau quả (FAVRI) & Bộ Giáo dục và Đào tạo – Bài 15: Thực hành nhân giống cây trồng bằng phương pháp giâm cành, chiết cành, SGK Công nghệ 10, trang 72–75.',
      statements: [
        {
          label: 'a',
          level: 'biet',
          text: 'Chiết cành là phương pháp làm cho cành ra rễ bất định ngay trên cây mẹ rồi mới cắt rời đem trồng thành cây mới.',
          isTrue: true,
          explanation:
            'Theo Bài 14 & Bài 15 SGK Công nghệ 10, chiết cành tạo bầu đất cho cành ra rễ ngay trên cây mẹ trước khi cắt hạ bầu.',
        },
        {
          label: 'b',
          level: 'hieu',
          text: 'Việc dùng màng nilon trong suốt để bọc bầu chiết giúp giữ ẩm ổn định cho giá thể bên trong bầu, đồng thời giúp người làm vườn dễ dàng quan sát màu sắc rễ từ ngoài vào.',
          isTrue: true,
          explanation:
            'Nilon trong vừa ngăn thoát hơi nước giữ bầu luôn ẩm, vừa cho phép kiểm tra thời điểm rễ chuyển màu vàng ngà để cắt cành chiết.',
        },
        {
          label: 'c',
          level: 'vandung',
          text: 'Nếu khi khoanh vỏ mà người làm vườn không cạo sạch lớp tượng tầng (màng trơn sát gỗ) thì vỏ cành sẽ nhanh chóng liền lại, chất hữu cơ vận chuyển xuống gốc bình thường và cành chiết sẽ không ra rễ.',
          isTrue: true,
          explanation:
            'Cạo sạch tượng tầng nhằm cắt đứt hoàn toàn sự tái tạo mạch rây, buộc chất dinh dưỡng và hormone auxin từ lá tích tụ ở mép cắt trên để phân hóa rễ.',
        },
        {
          label: 'd',
          level: 'vandung',
          text: 'Khi quan sát qua lớp nilon thấy rễ cành chiết đã chuyển từ màu trắng sang màu vàng ngà hoặc nâu nhạt, người làm vườn nên cắt rời cành chiết ở vị trí phía trên bầu đất 5 cm để đem đi trồng.',
          isTrue: false,
          explanation:
            'Khi cắt cành chiết rời khỏi cây mẹ, bắt buộc phải cắt ở vị trí phía DƯỚI bầu đất 2–3 cm; nếu cắt phía trên bầu đất thì cành sẽ bị tách rời khỏi toàn bộ bầu rễ!',
        },
      ],
    },
  ],
  'cn10-c5': [
    {
      number: 1,
      context:
        'Tình huống thực tế: Vào giai đoạn lúa vụ Đông Xuân đang đẻ nhánh rộ đến làm đòng tại tỉnh Thái Bình, thời tiết xuất hiện sương mù dày đặc vào sáng sớm, ẩm độ không khí trên 90%, nhiệt độ dao động 20–25 °C kèm mưa phùn. Trên các ruộng gieo giống lúa nhiễm và bón thừa phân đạm, lá lúa xuất hiện nhiều vết chấm nhỏ màu xanh xám, sau lớn dần thành hình thoi (hình mắt én), phần giữa vết bệnh màu xám trắng, viền nâu sẫm; những ruộng nặng vết bệnh nối liền nhau làm lá lúa cháy khô sụp xuống.',
      citation:
        'Nguồn: Cục Bảo vệ thực vật (Bộ NN&PTNT) – Quy chuẩn kĩ thuật quốc gia QCVN 01-166:2014/BNNPTNT về phương pháp điều tra phát hiện dịch hại cây lúa, 2023.',
      statements: [
        {
          label: 'a',
          level: 'biet',
          text: 'Triệu chứng vết bệnh hình thoi (hình mắt én) tâm xám trắng trên lá lúa là dấu hiệu điển hình của bệnh đạo ôn hại lúa do nấm Pyricularia oryzae gây ra.',
          isTrue: true,
          explanation:
            'Theo Bài 18 SGK Công nghệ 10 (trang 91), bệnh đạo ôn lúa do nấm Pyricularia oryzae gây vết bệnh hình thoi tâm xám trắng.',
        },
        {
          label: 'b',
          level: 'hieu',
          text: 'Thời tiết âm u, mưa phùn, sương mù nhiều kết hợp với ruộng lúa gieo dày và bón thừa phân đạm là điều kiện ngoại cảnh thuận lợi nhất làm bào tử nấm đạo ôn nảy mầm và lây lan bùng phát.',
          isTrue: true,
          explanation:
            'Độ ẩm cao > 90%, nhiệt độ mát 20–28 °C và lá lúa xanh non mềm yếu do thừa đạm làm nấm đạo ôn phát triển cực nhanh.',
        },
        {
          label: 'c',
          level: 'vandung',
          text: 'Khi phát hiện ruộng lúa chớm bị bệnh đạo ôn lá, nông dân cần ngừng ngay việc bón thúc phân đạm, không phun phân bón lá chứa đạm, giữ đủ nước trong ruộng và phun thuốc đặc trị đạo ôn theo nguyên tắc "4 đúng".',
          isTrue: true,
          explanation:
            'Ngừng bón đạm và giữ mực nước ổn định kết hợp phun thuốc đặc trị (như Tricyclazole, Isoprothiolane) là quy trình xử lí chuẩn khi lúa bị đạo ôn.',
        },
        {
          label: 'd',
          level: 'vandung',
          text: 'Để lá lúa nhanh xanh trở lại ngay trong lúc vết bệnh đạo ôn đang cấp tính, nông dân nên rút cạn khô nước ruộng và rải thêm 10 kg phân đạm urea/sào Bắc Bộ.',
          isTrue: false,
          explanation:
            'Để ruộng khô hạn kết hợp bón thúc thêm đạm urea lúc đang bị đạo ôn sẽ làm bệnh bùng phát dữ dội gây "cháy rụi" toàn bộ ruộng lúa.',
        },
      ],
    },
    {
      number: 2,
      context:
        'Tình huống thực tế: Tại vùng chuyên canh rau bắp cải và súp lơ an toàn ở huyện Mộc Châu (tỉnh Sơn La), sâu tơ (Plutella xylostella) là đối tượng dịch hại nguy hiểm nhất vì có vòng đời ngắn và rất nhanh kháng thuốc hóa học. Thay vì phun thuốc hóa học tràn lan, các hợp tác xã đã áp dụng chương trình Quản lí dịch hại tổng hợp (IPM): sử dụng bẫy pheromone giới tính để giám sát mật độ bướm trưởng thành, bảo vệ ong kí sinh Cotesia vestalis và phun chế phẩm vi khuẩn Bacillus thuringiensis (Bt) kết hợp nấm trắng Beauveria bassiana khi sâu non ở tuổi 1–2.',
      citation:
        'Nguồn: Viện Bảo vệ thực vật (PPRI – VAAS) – Quy trình quản lí tổng hợp (IPM) sâu tơ hại rau họ thập tự theo hướng hữu cơ sinh học, 2023.',
      statements: [
        {
          label: 'a',
          level: 'biet',
          text: 'Chế phẩm vi khuẩn Bacillus thuringiensis (Bt), nấm trắng Beauveria và ong kí sinh đều thuộc nhóm biện pháp sinh học trong phòng trừ sâu, bệnh hại cây trồng.',
          isTrue: true,
          explanation:
            'Theo Bài 19 & Bài 20 SGK Công nghệ 10, sử dụng thiên địch (ong kí sinh) và chế phẩm vi sinh (Bt, nấm trắng, nấm xanh) là biện pháp sinh học.',
        },
        {
          label: 'b',
          level: 'hieu',
          text: 'Vi khuẩn Bt khi được sâu tơ ăn phải cùng lá rau sẽ giải phóng tinh thể protein độc tố (delta-endotoxin) trong ruột giữa có môi trường kiềm của sâu non, gây thủng ruột làm sâu ngừng ăn và chết.',
          isTrue: true,
          explanation:
            'Tinh thể protein Cry của vi khuẩn Bt chỉ hoạt hóa trong môi trường kiềm của ruột sâu non bộ Cánh vảy nên diệt sâu đặc hiệu mà an toàn cho người và gia súc.',
        },
        {
          label: 'c',
          level: 'vandung',
          text: 'Khi phun chế phẩm vi sinh Bt và nấm trắng Beauveria trên ruộng bắp cải, nông dân nên phun vào chiều mát khi sâu non mới nở (tuổi 1–2) để tránh tia cực tím mặt trời làm giảm hiệu lực của vi sinh vật.',
          isTrue: true,
          explanation:
            'Phun chế phẩm vi sinh vào chiều mát giúp bào tử nấm và vi khuẩn Bt không bị tia UV phân hủy, đồng thời sâu non tuổi 1–2 mẫn cảm nhất và hay bò ra ăn lá vào chiều tối.',
        },
        {
          label: 'd',
          level: 'vandung',
          text: 'Để tăng hiệu quả diệt sâu tơ nhanh hơn, nông dân nên pha chung chế phẩm vi khuẩn sống Bt và nấm Beauveria với thuốc trừ nấm gốc đồng và nước vôi đặc trong cùng một bình phun.',
          isTrue: false,
          explanation:
            'Thuốc gốc đồng và nước vôi có tính kiềm/sát khuẩn mạnh sẽ tiêu diệt bào tử nấm Beauveria và làm biến tính độc tố Bt ngay trong bình pha.',
        },
      ],
    },
    {
      number: 3,
      context:
        'Tình huống thực tế: Tại các vùng trồng xoài cát Hòa Lộc, ổi lê và nhãn xuất khẩu ở tỉnh Đồng Tháp và Sơn La, ruồi đục quả (Bactrocera dorsalis) thường dùng máng đẻ trứng chích xuyên qua vỏ quả sắp chín để đẻ trứng vào trong thịt quả. Dòi (ấu trùng) nở ra ăn thối nhũn phần thịt quả bên trong làm quả rụng hàng loạt và bị các nước nhập khẩu trả về nếu phát hiện có ấu trùng kiểm dịch.',
      citation:
        'Nguồn: Cục Bảo vệ thực vật (Bộ NN&PTNT) & Viện Bảo vệ thực vật – Tài liệu hướng dẫn quản lí tổng hợp ruồi đục quả trên cây ăn quả xuất khẩu, 2024.',
      statements: [
        {
          label: 'a',
          level: 'biet',
          text: 'Ruồi đục quả là loài côn trùng biến thái hoàn toàn gồm 4 giai đoạn: Trứng -> Dòi (sâu non) -> Nhộng (trong đất) -> Ruồi trưởng thành.',
          isTrue: true,
          explanation:
            'Theo Bài 17 SGK Công nghệ 10 (trang 89), ruồi đục quả biến thái hoàn toàn; dòi đục trong quả rồi búng xuống đất hóa nhộng.',
        },
        {
          label: 'b',
          level: 'hieu',
          text: 'Việc phun thuốc trừ sâu tiếp xúc thông thường lên bề mặt quả khi quả đã bị ruồi đẻ trứng vào bên trong ít mang lại hiệu quả vì dòi nằm sâu trong thịt quả không tiếp xúc với thuốc.',
          isTrue: true,
          explanation:
            'Trứng và dòi nằm kín bên trong lớp vỏ quả nên thuốc tiếp xúc không diệt được dòi lại dễ gây tồn dư hóa chất trên quả sắp thu hoạch.',
        },
        {
          label: 'c',
          level: 'vandung',
          text: 'Giải pháp an toàn và hiệu quả nhất đang được các vùng xuất khẩu áp dụng là dùng túi chuyên dụng bao quả từ khi quả còn non kết hợp treo bẫy dẫn dụ pheromone (Methyl Eugenol) và bẫy bả protein diệt ruồi trưởng thành.',
          isTrue: true,
          explanation:
            'Bao quả tạo rào cản vật lí ngăn ruồi chích đẻ trứng, kết hợp bẫy Methyl Eugenol và bả protein giúp diệt ruồi trưởng thành mà không tồn dư thuốc trên quả (Bài 19 trang 98).',
        },
        {
          label: 'd',
          level: 'vandung',
          text: 'Đối với những quả bị thối rụng dưới gốc có chứa dòi bên trong, nhà vườn nên cứ để mặc trên mặt đất vườn cho tự mục nát để làm phân bón cho cây.',
          isTrue: false,
          explanation:
            'Để quả rụng chứa dòi trên mặt đất sẽ giúp dòi chui xuống đất hóa nhộng rồi vũ hóa thành hàng vạn ruồi trưởng thành gây hại nặng hơn ở đợt sau; phải thu gom tiêu hủy.',
        },
      ],
    },
    {
      number: 4,
      context:
        'Tình huống thực tế: Tại vùng chuyên canh cà chua và khoai tây huyện Đơn Dương (tỉnh Lâm Đồng), vào mùa mưa ẩm và nhiệt độ cao (28–33 °C), một số ruộng trồng độc canh cây họ Cà liên tục nhiều năm xuất hiện hiện tượng cây đang xanh tốt bỗng nhiên héo rũ đột ngột vào buổi trưa, ban đêm tươi lại đôi chút rồi sau 2–3 ngày chết hẳn nhưng lá vẫn còn giữ màu xanh. Khi cắt ngang gốc thân sát mặt đất đem nhúng vào cốc nước trong suốt, chỉ sau vài phút thấy có dòng dịch nhầy màu trắng đục như sữa chảy ra từ bó mạch dẫn.',
      citation:
        'Nguồn: Viện Bảo vệ thực vật (PPRI) & Bộ Giáo dục và Đào tạo – Bài 18: Một số bệnh hại cây trồng phổ biến (Bệnh héo xanh vi khuẩn), SGK Công nghệ 10, trang 93–94.',
      statements: [
        {
          label: 'a',
          level: 'biet',
          text: 'Hiện tượng cây héo rũ đột ngột khi lá vẫn xanh và có dịch vi khuẩn trắng đục chảy ra từ mạch dẫn là triệu chứng đặc trưng của bệnh héo xanh vi khuẩn (do Ralstonia solanacearum).',
          isTrue: true,
          explanation:
            'Theo Bài 18 SGK Công nghệ 10 (trang 93), bệnh héo xanh vi khuẩn do Ralstonia solanacearum gây tắc mạch gỗ làm cây héo đột ngột khi lá vẫn xanh.',
        },
        {
          label: 'b',
          level: 'hieu',
          text: 'Cây bị héo rũ nhanh chóng dù đất vẫn đủ ẩm là do vi khuẩn nhân lên với mật độ cực lớn và tiết dịch nhầy polisaccarit làm bít tắc hoàn toàn các mạch gỗ vận chuyển nước từ rễ lên lá.',
          isTrue: true,
          explanation:
            'Sinh khối vi khuẩn và dịch nhầy làm tắc nghẽn bó mạch dẫn gỗ khiến nước không lên được tán lá.',
        },
        {
          label: 'c',
          level: 'vandung',
          text: 'Biện pháp phòng trừ căn cơ đối với ruộng đã nhiễm bệnh này là nhổ bỏ sớm cây bệnh đem tiêu hủy, rắc vôi khử trùng hố, sử dụng giống kháng bệnh và luân canh với cây lúa nước hoặc cây ngô.',
          isTrue: true,
          explanation:
            'Luân canh với lúa nước hoặc cây khác họ (họ Hòa thảo), vệ sinh đồng ruộng, bón vôi và chế phẩm đối kháng là biện pháp hiệu quả nhất (Bài 18 trang 94).',
        },
        {
          label: 'd',
          level: 'vandung',
          text: 'Khi nhổ các cây cà chua chết do bệnh héo xanh, nông dân nên vứt các cây bệnh đó xuống đầu nguồn mương nước tưới để tận dụng dòng nước tưới tràn qua các luống cà chua còn lại.',
          isTrue: false,
          explanation:
            'Vi khuẩn Ralstonia solanacearum lây lan cực nhanh theo dòng nước tưới tràn và qua vết thương ở rễ; vứt cây bệnh xuống mương tưới sẽ làm lây bệnh cho toàn bộ ruộng.',
        },
      ],
    },
  ],
  'cn10-c6': [
    {
      number: 1,
      context:
        'Tình huống thực tế: Tại vùng sản xuất lúa hàng hóa quy mô lớn ở tỉnh An Giang, lúa tươi vừa gặt bằng máy gặt đập liên hợp ngoài đồng có độ ẩm hạt khá cao (từ 24% đến 28%). Thay vì phơi thủ công trên mặt đường phụ thuộc thời tiết, doanh nghiệp thu mua đưa lúa tươi ngay trong vòng 12 giờ sau gặt vào hệ thống tháp sấy tĩnh vỉ ngang tuần hoàn ở nhiệt độ tác nhân sấy 42–45 °C để hạ độ ẩm hạt xuống mức 12,5%, làm nguội rồi đưa vào hệ thống Silo thép kín có kiểm soát nhiệt độ (20–25 °C) bảo quản trong 12 tháng.',
      citation:
        'Nguồn: Viện Cơ điện Nông nghiệp và Công nghệ Sau thu hoạch (VIAEP) – Quy trình công nghệ sấy và bảo quản thóc gạo trong Silo hiện đại, Bộ NN&PTNT, 2023.',
      statements: [
        {
          label: 'a',
          level: 'biet',
          text: 'Việc sấy hạ độ ẩm thóc xuống 12,5% và chứa trong Silo thép kín là sự kết hợp giữa phương pháp bảo quản khô và bảo quản kín thông thoáng có điều khiển.',
          isTrue: true,
          explanation:
            'Theo Bài 22 SGK Công nghệ 10 (trang 112), hạt lương thực được sấy khô đạt thủy phần an toàn (< 13%) rồi bảo quản trong kho/silo.',
        },
        {
          label: 'b',
          level: 'hieu',
          text: 'Nếu để thóc tươi có độ ẩm 26% chất đống trong bao tải quá 48 giờ mà không sấy ngay thì khối hạt sẽ hô hấp cực mạnh, sinh nhiệt nóng lên làm hạt nảy mầm, vàng gạo và nhiễm nấm mốc Aflatoxin.',
          isTrue: true,
          explanation:
            'Ở độ ẩm 24–28%, hạt lúa tươi và vi sinh vật hô hấp rất mạnh tỏa nhiệt – ẩm gây bốc nóng, thối mốc và giảm tỷ lệ gạo nguyên.',
        },
        {
          label: 'c',
          level: 'vandung',
          text: 'Khi sấy 10 tấn thóc tươi có độ ẩm ban đầu 26% xuống độ ẩm bảo quản an toàn 12,5%, khối lượng nước đã tách ra khỏi lô thóc là hơn 1,54 tấn nước (khối lượng thóc khô thu được khoảng 8,46 tấn).',
          isTrue: true,
          explanation:
            'Khối lượng chất khô = 10 × (1 - 0,26) = 7,4 tấn; ở độ ẩm 12,5%, khối lượng thóc = 7,4 / (1 - 0,125) = 8,457 tấn -> lượng nước bay hơi = 10 - 8,457 = 1,543 tấn.',
        },
        {
          label: 'd',
          level: 'vandung',
          text: 'Đối với lô thóc dùng làm hạt giống cho vụ sau, nhà máy nên tăng nhiệt độ buồng sấy lên 85–90 °C để rút ngắn thời gian sấy xuống còn 1 giờ.',
          isTrue: false,
          explanation:
            'Sấy thóc giống ở nhiệt độ cao 85–90 °C sẽ làm biến tính protein phôi hạt, giết chết phôi làm hạt mất hoàn toàn khả năng nảy mầm (sấy hạt giống chỉ được giữ ở 40–43 °C).',
        },
      ],
    },
    {
      number: 2,
      context:
        'Tình huống thực tế: Để xuất khẩu quả vải thiều tươi (Bắc Giang) và nhãn lồng (Hưng Yên) bằng đường biển kéo dài 25–30 ngày sang thị trường châu Âu và Nhật Bản, doanh nghiệp chế biến áp dụng chuỗi bảo quản lạnh kết hợp khí quyển điều chỉnh (Controlled Atmosphere – CA): Quả vừa cắt khỏi cây được đưa vào phòng làm mát sơ bộ (Pre-cooling) hạ nhiệt độ tâm quả xuống 4–5 °C, xử lí diệt nấm, đóng trong bao màng bán thấm (MAP) và xếp vào container lạnh CA duy trì nhiệt độ 3–5 °C, nồng độ O2 giảm xuống 3–5% và CO2 duy trì ở mức 5–7%.',
      citation:
        'Nguồn: Viện Cơ điện Nông nghiệp và Công nghệ Sau thu hoạch (VIAEP) & Viện Nghiên cứu Rau quả – Công nghệ bảo quản vải, nhãn tươi xuất khẩu đường biển, 2024.',
      statements: [
        {
          label: 'a',
          level: 'biet',
          text: 'Công nghệ bảo quản duy trì nhiệt độ thấp kết hợp giảm nồng độ O2 và tăng nồng độ CO2 hợp lí trong kho/container được gọi là bảo quản trong điều kiện khí quyển điều chỉnh (CA).',
          isTrue: true,
          explanation:
            'Theo Bài 22 SGK Công nghệ 10 (trang 113), bảo quản CA (Controlled Atmosphere) kiểm soát chặt nhiệt độ, độ ẩm và thành phần khí O2, CO2.',
        },
        {
          label: 'b',
          level: 'hieu',
          text: 'Việc hạ thấp nhiệt độ xuống 3–5 °C và giảm nồng độ O2 xuống 3–5% giúp ức chế cường độ hô hấp của quả tươi, làm chậm quá trình phân hủy đường, acid hữu cơ và giảm sự sinh tổng hợp khí ethylene gây chín già.',
          isTrue: true,
          explanation:
            'Nhiệt độ thấp và O2 thấp – CO2 cao vừa phải làm giảm tốc độ phản ứng enzyme hô hấp và ức chế hormone chín ethylene.',
        },
        {
          label: 'c',
          level: 'vandung',
          text: 'Khâu làm mát sơ bộ (Pre-cooling) ngay sau thu hoạch đóng vai trò quyết định vì giúp triệt tiêu nhanh "nhiệt đồng ruộng", ngăn vỏ quả vải bị mất nước chuyển sang màu nâu xỉn trước khi đóng gói.',
          isTrue: true,
          explanation:
            'Quả vải rất dễ bị nâu vỏ nếu mất nước và giữ nhiệt cao sau hái; làm mát sơ bộ ngay giúp giữ màu đỏ tươi của vỏ quả.',
        },
        {
          label: 'd',
          level: 'vandung',
          text: 'Để quả vải tươi giữ được lâu hơn nữa trong container CA, kĩ thuật viên nên rút cạn nồng độ O2 xuống 0% tuyệt đối và hạ nhiệt độ buồng bảo quản quả vải tươi xuống -18 °C.',
          isTrue: false,
          explanation:
            'Nếu O2 = 0% quả tươi sẽ chuyển sang hô hấp yếm khí sinh rượu ethanol gây thối nát mùi ủng; nếu hạ xuống -18 °C làm đóng băng vỡ màng tế bào khiến quả tươi nhũn nước khi rã đông.',
        },
      ],
    },
    {
      number: 3,
      context:
        'Tình huống thực tế: Một nhà máy chế biến nông sản công nghệ cao tại tỉnh Lâm Đồng thu mua dâu tây và mít nghệ đạt độ chín thu hoạch để sản xuất sản phẩm "Dâu tây và mít sấy giòn cao cấp". Thay vì chiên trong dầu sôi ở nhiệt độ cao dễ làm sản phẩm ngấm dầu và mất màu, nhà máy sử dụng công nghệ sấy thăng hoa (Freeze-drying): nguyên liệu sau sơ chế được cấp đông nhanh ở -35 °C đến -40 °C, sau đó đưa vào buồng hút chân không để tinh thể nước đá trong quả thăng hoa trực tiếp thành hơi nước. Sản phẩm thu được giữ nguyên hình dạng, màu sắc tự nhiên và giữ được trên 95% hàm lượng vitamin.',
      citation:
        'Nguồn: Viện Công nghệ Sinh học và Công nghệ Thực phẩm (ĐH Bách khoa Hà Nội) & Bài 22 SGK Công nghệ 10 – Chế biến nông sản ứng dụng công nghệ cao, trang 115–116.',
      statements: [
        {
          label: 'a',
          level: 'biet',
          text: 'Sấy thăng hoa (sấy đông khô) là một trong những công nghệ chế biến nông sản hiện đại giúp nâng cao giá trị gia tăng và kéo dài thời hạn bảo quản nông sản.',
          isTrue: true,
          explanation:
            'Theo Bài 22 SGK Công nghệ 10 (trang 115), công nghệ sấy lạnh/sấy thăng hoa là phương pháp chế biến nông sản tiên tiến.',
        },
        {
          label: 'b',
          level: 'hieu',
          text: 'Sản phẩm sấy thăng hoa giữ được cấu trúc xốp giòn, không bị co ngót biến dạng và bảo toàn được vitamin C là nhờ quá trình tách nước diễn ra ở nhiệt độ rất thấp trong môi trường chân không.',
          isTrue: true,
          explanation:
            'Nước đá thăng hoa trực tiếp từ thể rắn sang thể hơi ở nhiệt độ thấp nên khung tế bào không bị xẹp co rút và vitamin nhạy nhiệt không bị phân hủy.',
        },
        {
          label: 'c',
          level: 'vandung',
          text: 'Vì sản phẩm trái cây sau sấy thăng hoa có cấu trúc rỗng xốp và độ ẩm cực thấp (< 3–5%) nên rất dễ hút ẩm trở lại; do đó nhà máy bắt buộc phải đóng gói ngay trong bao bì kín có hút chân không hoặc bơm khí nitơ.',
          isTrue: true,
          explanation:
            'Sản phẩm sấy thăng hoa có tính hút ẩm rất mạnh; đóng gói kín chống ẩm và chống oxy hóa giúp giữ độ giòn xốp lâu dài.',
        },
        {
          label: 'd',
          level: 'vandung',
          text: 'Đối với nguyên liệu dâu tây bị dập nát thối mốc trên 50% diện tích quả, nhà máy cứ đưa thẳng vào máy sấy thăng hoa thì sản phẩm đầu ra vẫn tự động biến thành dâu tây tươi lành đạt chuẩn xuất khẩu.',
          isTrue: false,
          explanation:
            'Quy trình chế biến bắt buộc phải qua bước chọn lọc, phân loại loại bỏ nguyên liệu thối mốc (Bài 22); công nghệ sấy không thể phục hồi nông sản đã thối hỏng.',
        },
      ],
    },
    {
      number: 4,
      context:
        'Tình huống thực tế: Tại huyện Văn Giang (tỉnh Hưng Yên) và làng hoa Xuân Quan, các nhà vườn trồng cây hoa hồng cổ và cây quất cảnh trong chậu phục vụ dịp Tết Nguyên đán. Quy trình kĩ thuật được thực hiện bài bản: Chọn chậu có lỗ thoát nước ở đáy -> Lót lớp sỏi nhẹ/viên đất nung dày 3–4 cm dưới đáy chậu -> Cho giá thể (đất phù sa ải trộn phân hữu cơ hoai mục, trấu hun và xơ dừa) vào 2/3 chậu -> Đặt bầu cây chính giữa, lấp giá thể cách miệng chậu 3–5 cm, ấn nhẹ quanh gốc -> Tưới đẫm nước và đặt nơi thoáng mát trong 5–7 ngày đầu.',
      citation:
        'Nguồn: Viện Nghiên cứu Rau quả (FAVRI) & Bộ Giáo dục và Đào tạo – Bài 23: Thực hành trồng và chăm sóc cây cảnh trong chậu, SGK Công nghệ 10, trang 117–118.',
      statements: [
        {
          label: 'a',
          level: 'biet',
          text: 'Quy trình trồng cây cảnh trong chậu ở tình huống trên tuân thủ đúng trình tự 4 bước chuẩn trong Bài 23 SGK Công nghệ 10 (Chuẩn bị -> Cho giá thể vào chậu -> Trồng cây -> Tưới nước).',
          isTrue: true,
          explanation:
            'Theo Bài 23 SGK Công nghệ 10 (trang 117–118), quy trình trồng cây trong chậu gồm chuẩn bị chậu/giá thể/cây, cho giá thể, đặt cây lấp đất và tưới nước.',
        },
        {
          label: 'b',
          level: 'hieu',
          text: 'Khi lấp giá thể vào chậu, người trồng để mặt giá thể thấp hơn miệng chậu từ 3–5 cm nhằm giữ nước khi tưới không bị tràn ra ngoài kéo theo chất dinh dưỡng.',
          isTrue: true,
          explanation:
            'Lấp giá thể thấp hơn miệng chậu 2–5 cm giúp giữ nước tưới thấm đều xuống bầu rễ và không bị tràn bùn đất ra ngoài (Bài 23 trang 118).',
        },
        {
          label: 'c',
          level: 'vandung',
          text: 'Nếu một hộ gia đình mua chậu cây cảnh về trồng nhưng dùng xi măng bịt kín lỗ thoát nước ở đáy chậu và ngày nào cũng tưới ngập nước thì chỉ sau 1–2 tuần bộ rễ cây sẽ bị thối đen và lá vàng rụng.',
          isTrue: true,
          explanation:
            'Bịt lỗ thoát nước làm nước ứ đọng ở đáy chậu đẩy hết khí O2 ra ngoài, rễ cây hô hấp yếm khí sinh độc chất và bị nấm thối rễ tấn công.',
        },
        {
          label: 'd',
          level: 'vandung',
          text: 'Khi mới đánh bầu cây hoa hồng từ vườn ươm sang trồng vào chậu mới, nhà vườn nên dùng chân giẫm thật mạnh làm vỡ nát toàn bộ bầu đất quanh rễ và bón ngay 200 g đạm urea nguyên chất sát gốc.',
          isTrue: false,
          explanation:
            'Làm vỡ bầu đất gây đứt rễ tơ và bón đạm urea đậm đặc sát rễ mới trồng sẽ gây xót rễ (cháy rễ thẩm thấu) làm cây chết héo.',
        },
      ],
    },
  ],
  'cn10-c7': [
    {
      number: 1,
      context:
        'Tình huống thực tế: Một trang trại nông nghiệp công nghệ cao tại huyện Củ Chi (TP. Hồ Chí Minh) đầu tư hệ thống nhà màng diện tích 2.000 m2 trồng dưa lưới (giống Taki Nhật Bản) trên giá thể mùn xơ dừa đặt trong túi PE. Toàn bộ hệ thống tưới nhỏ giọt bù áp kết hợp châm phân tự động (Fertigation) được điều khiển qua bộ cảm biến IoT: mỗi cây có 1 que cắm nhỏ giọt cấp chính xác 1,2 – 1,8 lít dung dịch dinh dưỡng/ngày (chia làm 6–8 lần tưới theo cường độ bức xạ mặt trời), giữ chỉ số pH dung dịch ở mức 5,8–6,2 và chỉ số dẫn điện EC tăng dần từ 1,5 mS/cm (giai đoạn cây con) lên 2,5 mS/cm (giai đoạn nuôi quả).',
      citation:
        'Nguồn: Khu Nông nghiệp Công nghệ cao TP. Hồ Chí Minh (AHTP) – Quy trình trồng dưa lưới trong nhà màng ứng dụng hệ thống tưới nhỏ giọt tự động IoT, 2024.',
      statements: [
        {
          label: 'a',
          level: 'biet',
          text: 'Mô hình trên kết hợp đồng thời công nghệ nhà màng, hệ thống tưới nhỏ giọt châm phân tự động và công nghệ trồng cây trên giá thể không dùng đất.',
          isTrue: true,
          explanation:
            'Theo Bài 24 & Bài 25 SGK Công nghệ 10, đây là tổ hợp các công nghệ cao điển hình trong trồng trọt hiện đại.',
        },
        {
          label: 'b',
          level: 'hieu',
          text: 'Việc chia lượng dung dịch dinh dưỡng thành 6–8 lần tưới nhỏ giọt trong ngày theo bức xạ mặt trời giúp vùng rễ luôn đủ ẩm, đủ khoáng và thoáng khí, đồng thời hạn chế tối đa sự thất thoát phân bón.',
          isTrue: true,
          explanation:
            'Tưới nhỏ giọt nhiều lần với lượng vừa đủ theo nhu cầu thoát hơi nước giúp cây hấp thu tối đa nước – khoáng mà không bị ngập úng hay rửa trôi.',
        },
        {
          label: 'c',
          level: 'vandung',
          text: 'Ở giai đoạn quả dưa lưới đang tạo lưới và tích lũy đường trước thu hoạch 15 ngày, kĩ thuật viên cần tăng tỉ lệ Kali (K) trong dung dịch dinh dưỡng và kiểm soát lượng nước tưới vừa phải để độ ngọt đạt từ 14–16 độ Brix.',
          isTrue: true,
          explanation:
            'Tăng Kali và tiết chế nước tưới hợp lí ở giai đoạn chín giúp tăng vận chuyển đường về quả và tránh nứt quả, nhạt quả.',
        },
        {
          label: 'd',
          level: 'vandung',
          text: 'Nếu cảm biến báo chỉ số EC của dung dịch tưới tăng vọt lên 8,5 mS/cm và pH tụt xuống 3,0 thì kĩ thuật viên cứ giữ nguyên không cần điều chỉnh vì nồng độ muối khoáng càng đậm đặc cây dưa lưới càng lớn nhanh.',
          isTrue: false,
          explanation:
            'EC = 8,5 mS/cm là nồng độ muối quá cao gây áp suất thẩm thấu lớn làm cháy rễ, héo cây, còn pH = 3,0 quá chua gây hỏng bộ rễ.',
        },
      ],
    },
    {
      number: 2,
      context:
        'Tình huống thực tế: Tại Trung tâm Nghiên cứu Khoai tây, Rau và Hoa ở Đà Lạt (Lâm Đồng), để nhân nhanh củ giống khoai tây siêu nguyên chủng sạch bệnh (mini-tuber), các nhà khoa học áp dụng hệ thống khí canh (Aeroponics). Cây khoai tây in vitro sạch bệnh được trồng trên các tấm xốp đậy kín buồng tối; bộ rễ lơ lửng hoàn toàn trong không khí được hệ thống béc phun sương tự động phun dung dịch dinh dưỡng 30 giây sau mỗi 5–10 phút. Kết quả mỗi cây khoai tây khí canh cho thu hoạch từ 40–60 củ giống siêu nguyên chủng (gấp 8–10 lần so với trồng trên giá thể truyền thống).',
      citation:
        'Nguồn: Viện Khoa học Kỹ thuật Nông nghiệp miền Nam (IAS) & Học viện Nông nghiệp Việt Nam – Công nghệ khí canh trong nhân giống khoai tây sạch bệnh, 2023.',
      statements: [
        {
          label: 'a',
          level: 'biet',
          text: 'Trong hệ thống khí canh (Aeroponics), bộ rễ cây trồng không ngâm trong nước hay đất mà treo lơ lửng trong không khí kín và hấp thu dinh dưỡng qua dạng sương mù.',
          isTrue: true,
          explanation:
            'Theo Bài 25 SGK Công nghệ 10 (trang 129), khí canh là kĩ thuật trồng cây có bộ rễ treo trong không khí và được phun sương dinh dưỡng định kì.',
        },
        {
          label: 'b',
          level: 'hieu',
          text: 'Hệ thống khí canh cho hệ số nhân củ giống khoai tây cao gấp 8–10 lần trồng đất vì bộ rễ được cung cấp tối đa khí oxygen (O2), hoàn toàn không gặp lực cản cơ học của đất và cho phép thu hoạch củ nhiều đợt.',
          isTrue: true,
          explanation:
            'Rễ và tia củ trong buồng khí canh tối được hô hấp hiếu khí tối đa, hấp thu khoáng nhanh và người trồng có thể mở cửa buồng thu hái củ đạt kích cỡ định kì.',
        },
        {
          label: 'c',
          level: 'vandung',
          text: 'Vì bộ rễ treo lơ lửng trong không khí không có giá thể giữ ẩm dự trữ, nên trang trại khí canh bắt buộc phải trang bị máy phát điện dự phòng tự động và bộ lọc nước tinh để tránh mất điện hoặc tắc béc phun làm khô héo rễ.',
          isTrue: true,
          explanation:
            'Nhược điểm lớn nhất của khí canh là nếu mất điện hoặc tắc vòi phun trong vài giờ vào ngày nắng nóng thì bộ rễ sẽ khô chết rất nhanh.',
        },
        {
          label: 'd',
          level: 'vandung',
          text: 'Để các củ khoai tây hình thành trên bộ rễ trong buồng khí canh phát triển to hơn, kĩ thuật viên nên tháo bỏ tấm chắn sáng để ánh nắng mặt trời chiếu trực tiếp vào buồng chứa rễ suốt cả ngày.',
          isTrue: false,
          explanation:
            'Buồng chứa rễ và tia củ khoai tây bắt buộc phải tối hoàn toàn; nếu chiếu sáng vào buồng rễ, rêu tảo sẽ mọc bám kín rễ và củ khoai tây sẽ hóa xanh thành chồi lá, sinh độc tố solanin.',
        },
      ],
    },
    {
      number: 3,
      context:
        'Tình huống thực tế: Một hợp tác xã rau an toàn tại huyện Gia Lâm (Hà Nội) vận hành 3.000 m2 giàn thủy canh hồi lưu kĩ thuật màng dinh dưỡng NFT (Nutrient Film Technique) để sản xuất rau xà lách và cải ngọt quanh năm. Dung dịch dinh dưỡng từ bể ngầm được máy bơm đẩy lên đầu các ống nhựa PVC đặt nghiêng độ dốc 1,5–2%, tạo thành một lớp màng nước mỏng (dày 2–4 mm) chảy liên tục qua đáy rọ trồng cây rồi thu hồi về bể chứa để tuần hoàn tái sử dụng.',
      citation:
        'Nguồn: Viện Nghiên cứu Rau quả (FAVRI) & Bộ Giáo dục và Đào tạo – Bài 25: Công nghệ trồng cây không dùng đất (Hệ thống thủy canh hồi lưu NFT), SGK Công nghệ 10, trang 125–128.',
      statements: [
        {
          label: 'a',
          level: 'biet',
          text: 'Mô hình trồng rau của hợp tác xã thuộc nhóm công nghệ thủy canh hồi lưu (có dòng dung dịch dinh dưỡng chảy tuần hoàn).',
          isTrue: true,
          explanation:
            'Theo Bài 25 SGK Công nghệ 10 (trang 127), thủy canh hồi lưu sử dụng máy bơm đưa dung dịch dinh dưỡng tuần hoàn qua các máng trồng.',
        },
        {
          label: 'b',
          level: 'hieu',
          text: 'Việc duy trì lớp dung dịch chảy thành màng mỏng (2–4 mm) ở đáy ống thay vì bơm ngập đầy ống giúp phần trên của bộ rễ luôn tiếp xúc với không khí trong ống để lấy oxygen hô hấp.',
          isTrue: true,
          explanation:
            'Nguyên lí cốt lõi của kĩ thuật màng dinh dưỡng (NFT) là phần dưới rễ chạm màng dịch hút khoáng, phần trên rễ nằm trong khoảng không khí ẩm trong ống để hô hấp.',
        },
        {
          label: 'c',
          level: 'vandung',
          text: 'Vào những ngày nắng nóng mùa hè, do cây rau thoát hơi nước mạnh hơn hút muối khoáng làm mức nước trong bể giảm và chỉ số EC tăng lên, người vận hành cần bổ sung thêm nước sạch và điều chỉnh lại EC, pH về ngưỡng chuẩn.',
          isTrue: true,
          explanation:
            'Khi trời nắng nóng cây hút nhiều nước làm dung dịch trong bể đặc lại (EC tăng); cần châm bù nước sạch và kiểm tra pH (5,5–6,5).',
        },
        {
          label: 'd',
          level: 'vandung',
          text: 'Nếu một máng trồng có vài cây xà lách bị nhiễm nấm thối rễ Pythium nặng, người vận hành vẫn nên để dòng nước từ máng bệnh đó chảy chung về bể tổng để bơm tuần hoàn nuôi toàn bộ 3.000 m2 nhà màng.',
          isTrue: false,
          explanation:
            'Trong hệ thống thủy canh hồi lưu, mầm bệnh nấm thủy sinh (như Pythium) lây lan rất nhanh theo dòng nước tuần hoàn; phải cách li ngay cây/máng bệnh và khử trùng nguồn nước.',
        },
      ],
    },
    {
      number: 4,
      context:
        'Tình huống thực tế: Tại nông trường trồng cam vinh và bưởi tại huyện Quỳ Hợp (tỉnh Nghệ An) có địa hình đồi bát úp độ dốc 8–12°, trước đây tưới bằng vòi dí thủ công vừa tốn nhân công vừa gây xói mòn đất mặt. Nông trường đã chuyển đổi sang hệ thống tưới phun mưa cục bộ dưới tán kết hợp cảm biến độ ẩm đất đặt ở độ sâu 20–30 cm. Khi độ ẩm đất giảm xuống dưới 65% độ ẩm đồng ruộng, bộ điều khiển trung tâm tự động mở van điện từ và khởi động bơm tưới cho đến khi độ ẩm đạt 80% thì tự động ngắt.',
      citation:
        'Nguồn: Viện Nước, Tưới tiêu và Môi trường (IWE) – Ứng dụng công nghệ tưới tiết kiệm nước tự động cho cây ăn quả có múi vùng gò đồi, Bộ NN&PTNT, 2023.',
      statements: [
        {
          label: 'a',
          level: 'biet',
          text: 'Hệ thống tưới tự động tại nông trường hoạt động dựa trên sự kết nối giữa cảm biến độ ẩm đất, bộ điều khiển trung tâm, máy bơm và hệ thống đường ống – vòi phun.',
          isTrue: true,
          explanation:
            'Theo Bài 24 SGK Công nghệ 10 (trang 123), hệ thống tưới tự động gồm nguồn nước, máy bơm, bộ điều khiển, cảm biến, đường ống và đầu tưới.',
        },
        {
          label: 'b',
          level: 'hieu',
          text: 'So với tưới ngập tràn hoặc tưới dí vòi lưu lượng lớn trên đất dốc, tưới phun mưa cục bộ dưới tán giúp nước thấm từ từ vào tầng rễ, không phá vỡ kết cấu đất và chống xói mòn đất mặt hiệu quả.',
          isTrue: true,
          explanation:
            'Hạt mưa nhỏ phun đều dưới tán với cường độ vừa phải giúp đất kịp thấm nước, không tạo dòng chảy tràn gây xói mòn trên đất dốc.',
        },
        {
          label: 'c',
          level: 'vandung',
          text: 'Để hệ thống vận hành bền bỉ, định kì hàng tuần kĩ thuật viên cần kiểm tra và vệ sinh bộ lọc đĩa/lọc lưới ở trạm bơm nhằm ngăn cặn bùn, rác và tảo làm tắc nghẽn các béc phun mưa.',
          isTrue: true,
          explanation:
            'Trong hệ thống tưới phun mưa và nhỏ giọt, bộ lọc nước giữ vai trò sống còn để tránh tắc đầu béc phun.',
        },
        {
          label: 'd',
          level: 'vandung',
          text: 'Khi lắp đặt đầu dò cảm biến độ ẩm đất cho vườn cây ăn quả, kĩ thuật viên nên cắm cảm biến treo lơ lửng trên cành cây cao 2 mét để đo độ ẩm của đất chính xác nhất.',
          isTrue: false,
          explanation:
            'Cảm biến độ ẩm đất phải được cắm trực tiếp vào tầng đất canh tác nơi tập trung bộ rễ hoạt động của cây (độ sâu 15–30 cm), không phải treo trên cành cây.',
        },
      ],
    },
  ],
  'cn10-c8': [
    {
      number: 1,
      context:
        'Tình huống thực tế: Hàng năm Việt Nam phát sinh hơn 40 triệu tấn rơm rạ sau các vụ thu hoạch lúa. Trước đây, tại nhiều địa phương vùng Đồng bằng sông Hồng và Đồng bằng sông Cửu Long, thói quen đốt rơm rạ trực tiếp trên đồng ruộng sau gặt tạo ra những cột khói mù mịt. Kết quả quan trắc môi trường cho thấy đốt 1 tấn rơm khô phát thải khoảng 1,4 tấn khí CO2, hàng chục kg khí độc CO, NOx và bụi mịn PM2.5, đồng thời làm nhiệt độ bề mặt đất tăng cao tiêu diệt hệ vi sinh vật có ích ở tầng đất mặt (0–5 cm).',
      citation:
        'Nguồn: Viện Môi trường Nông nghiệp (IAE – VAAS) & Cục Trồng trọt – Báo cáo quản lí rơm rạ theo hướng nông nghiệp tuần hoàn và giảm phát thải khí nhà kính, 2024.',
      statements: [
        {
          label: 'a',
          level: 'biet',
          text: 'Hành vi đốt phụ phẩm rơm rạ ngoài đồng ruộng là một trong những nguyên nhân gây ô nhiễm môi trường không khí và làm suy thoái hệ sinh vật đất trồng.',
          isTrue: true,
          explanation:
            'Theo Bài 26 SGK Công nghệ 10 (trang 132), đốt phụ phẩm trồng trọt phát thải khí nhà kính, bụi mịn và làm nghèo chất hữu cơ trong đất.',
        },
        {
          label: 'b',
          level: 'hieu',
          text: 'Khi đốt rơm rạ thành tro trên ruộng, toàn bộ lượng chất hữu cơ tạo mùn và nguyên tố đạm (N), lưu huỳnh (S) trong rơm đều bị cháy và bay hơi mất vào không khí, chỉ còn lại một phần khoáng tro dễ bị nước mưa rửa trôi.',
          isTrue: true,
          explanation:
            'Đốt rơm làm mất gần như 100% chất hữu cơ và > 80% đạm (biến thành khí N2, NOx), làm đất ngày càng nghèo mùn và chai cứng.',
        },
        {
          label: 'c',
          level: 'vandung',
          text: 'Thay vì đốt đồng, nông dân dùng máy cuộn rơm thu gom rơm khô về làm giá thể trồng nấm rơm, sau đó lấy bã rơm mục sau thu hoạch nấm đem ủ phân hữu cơ bón lại cho ruộng lúa là mô hình kinh tế tuần hoàn tiêu biểu.',
          isTrue: true,
          explanation:
            'Mô hình Lúa -> Rơm -> Nấm rơm -> Phân hữu cơ -> Lúa giúp nâng cao thu nhập trên cùng diện tích và trả lại chất mùn cho đất (Bài 27).',
        },
        {
          label: 'd',
          level: 'vandung',
          text: 'Nếu không kịp thu gom rơm, nông dân nên cày vùi toàn bộ rơm tươi xuống bùn ngập nước rồi gieo sạ lúa vụ mới ngay trong ngày hôm sau mà không cần dùng chế phẩm vi sinh phân giải rơm rạ.',
          isTrue: false,
          explanation:
            'Vùi rơm tươi ngập nước và sạ lúa ngay sẽ gây phân hủy yếm khí sinh khí độc H2S và acid hữu cơ làm lúa mới sạ bị ngộ độc hữu cơ thối rễ.',
        },
      ],
    },
    {
      number: 2,
      context:
        'Tình huống thực tế: Tại huyện Lấp Vò (tỉnh Đồng Tháp) và huyện Thới Lai (TP. Cần Thơ), hàng nghìn hộ nông dân đã tận dụng nguồn rơm rạ sau gặt để phát triển nghề trồng nấm rơm trong nhà và ngoài trời. Quy trình kĩ thuật chuẩn gồm: Làm ướt rơm khô trong nước vôi (0,5–1%) -> Chất đống ủ rơm cao 1,5 m trong 6–8 ngày (đảo rơm 1–2 lần khi nhiệt độ đống ủ đạt 65–70 °C) -> Đóng mô rơm và cấy meo giống nấm rơm -> Chăm sóc giữ ẩm, che phủ -> Thu hái nấm sau 12–15 ngày.',
      citation:
        'Nguồn: Trung tâm Nghiên cứu và Phát triển Nấm (Viện Di truyền Nông nghiệp) & Bài 27 SGK Công nghệ 10 – Ứng dụng công nghệ vi sinh trong xử lí phụ phẩm trồng trọt, trang 138–139.',
      statements: [
        {
          label: 'a',
          level: 'biet',
          text: 'Quy trình xử lí rơm rạ làm giá thể trồng nấm rơm gồm các bước chính: làm ướt nguyên liệu trong nước vôi, ủ nguyên liệu, đảo trộn và đóng mô cấy giống nấm.',
          isTrue: true,
          explanation:
            'Theo Bài 27 SGK Công nghệ 10 (trang 138–139), đây là quy trình chuẩn xử lí phụ phẩm rơm rạ để trồng nấm rơm.',
        },
        {
          label: 'b',
          level: 'hieu',
          text: 'Giai đoạn ủ đống rơm từ 6–8 ngày ở nhiệt độ 65–70 °C giúp làm mềm sợi rơm, chuyển hóa một phần cellulose thành dạng dinh dưỡng dễ hấp thu cho sợi nấm rơm và tiêu diệt các mầm bệnh, nấm dại.',
          isTrue: true,
          explanation:
            'Quá trình ủ nhiệt sinh học làm chín rơm, giúp hệ enzyme của nấm rơm dễ dàng hấp thu dinh dưỡng và khử trùng tự nhiên khối giá thể.',
        },
        {
          label: 'c',
          level: 'vandung',
          text: 'Khi thu hoạch nấm rơm, người trồng nên thu hái lúc quả thể nấm còn ở dạng hình trứng (chưa rách màng bao tán) vào sáng sớm hoặc chiều mát để nấm có chất lượng thương phẩm, độ giòn ngọt cao nhất và bảo quản được lâu.',
          isTrue: true,
          explanation:
            'Nấm rơm đạt giá trị thương phẩm cao nhất ở giai đoạn "nấm búp/hình trứng"; nếu để nấm bung dù (nở xòe) nấm sẽ nhũn, đen và giảm giá trị.',
        },
        {
          label: 'd',
          level: 'vandung',
          text: 'Trong lúc đống rơm mới ủ đang nóng 70 °C, người trồng nên đem meo giống nấm rơm cấy ngay lập tức vào giữa đống rơm nóng đó để tơ nấm mọc nhanh hơn.',
          isTrue: false,
          explanation:
            'Nhiệt độ thích hợp cho sợi nấm rơm phát triển là 30–35 °C; cấy meo giống lúc rơm đang nóng 70 °C sẽ làm chết hoàn toàn sợi nấm giống.',
        },
      ],
    },
    {
      number: 3,
      context:
        'Tình huống thực tế: Tại vùng chăn nuôi bò sữa kết hợp trồng ngô sinh khối ở huyện Mộc Châu (tỉnh Sơn La) và huyện Ba Vì (Hà Nội), sau khi thu hoạch bắp ngô non hoặc thu cắt cây ngô ở giai đoạn chín sáp, nông dân thực hiện chế biến thức ăn ủ chua dự trữ cho vụ đông. Thân và lá ngô tươi được phơi héo nhẹ giảm độ ẩm xuống còn 65–70%, băm nhỏ thành đoạn 2–3 cm, trộn đều với 0,5% muối ăn + 2–3% mật rỉ đường (hoặc bột ngô) + chế phẩm vi khuẩn lactic (Lactobacillus plantarum), sau đó nén thật chặt vào túi nilon dày hoặc hố ủ, ép hết không khí và buộc kín trong 21–30 ngày.',
      citation:
        'Nguồn: Viện Chăn nuôi Quốc gia (NIAS) & Bộ Giáo dục và Đào tạo – Bài 27 & Bài 28: Thực hành làm thức ăn ủ chua từ phụ phẩm trồng trọt, SGK Công nghệ 10, trang 137–141.',
      statements: [
        {
          label: 'a',
          level: 'biet',
          text: 'Quy trình ủ chua phụ phẩm trồng trọt ứng dụng hoạt động lên men của nhóm vi khuẩn lactic trong điều kiện yếm khí.',
          isTrue: true,
          explanation:
            'Theo Bài 27 & Bài 28 SGK Công nghệ 10 (trang 137, 140), ủ chua dựa trên quá trình vi khuẩn lactic lên men đường thành acid lactic trong điều kiện kị khí.',
        },
        {
          label: 'b',
          level: 'hieu',
          text: 'Việc bổ sung thêm mật rỉ đường (hoặc bột ngô) khi phối trộn nhằm cung cấp nguồn đường dễ lên men cho vi khuẩn lactic nhanh chóng sinh ra acid lactic, hạ pH khối ủ xuống khoảng 3,8–4,2 để ức chế vi khuẩn gây thối.',
          isTrue: true,
          explanation:
            'Mật rỉ đường là cơ chất giúp vi khuẩn lactic nhân nhanh và tạo đủ lượng acid lactic làm chua khối thức ăn, bảo quản lâu dài không bị thối.',
        },
        {
          label: 'c',
          level: 'vandung',
          text: 'Sau 30 ngày mở túi kiểm tra, nếu thấy thức ăn có màu vàng xanh tự nhiên, mùi thơm chua dịu như dưa muối, thân lá mềm nhưng không nhũn nát và không có nấm mốc trắng/đen thì mẻ ủ đạt chất lượng tốt để cho bò ăn.',
          isTrue: true,
          explanation:
            'Đây là tiêu chuẩn đánh giá cảm quan mẻ thức ăn ủ chua đạt yêu cầu kĩ thuật theo Bài 28 SGK Công nghệ 10 (trang 141).',
        },
        {
          label: 'd',
          level: 'vandung',
          text: 'Khi nén nguyên liệu vào túi ủ, người làm nên để nguyên cả cây ngô dài 2 mét không cần băm nhỏ và chọc thủng nhiều lỗ quanh túi nilon để không khí lưu thông vào trong túi.',
          isTrue: false,
          explanation:
            'Không băm nhỏ và làm thủng túi sẽ khiến không khí (O2) tràn vào khối ủ, vi khuẩn lactic yếm khí không hoạt động được mà nấm mốc và vi khuẩn hiếu khí sẽ làm thối đen toàn bộ mẻ ủ.',
        },
      ],
    },
    {
      number: 4,
      context:
        'Tình huống thực tế: Tại các cánh đồng mẫu lớn sản xuất lúa và rau màu đạt chuẩn VietGAP ở tỉnh Hải Dương và tỉnh Vĩnh Phúc, chính quyền địa phương đã xây dựng hệ thống các bể bê tông có mái che đặt dọc theo các trục đường nội đồng để thu gom bao bì thuốc bảo vệ thực vật (BVTV) sau sử dụng. Theo quy chế của hợp tác xã, sau khi pha thuốc, nông dân phải tráng rửa chai lọ 3 lần (đổ nước tráng vào bình phun), bỏ vỏ bao bì vào bể thu gom; định kì đơn vị chức năng vận chuyển về nhà máy đốt tiêu hủy chất thải nguy hại ở nhiệt độ trên 1.050 °C.',
      citation:
        'Nguồn: Cục Bảo vệ thực vật (Bộ NN&PTNT) & Bộ Tài nguyên và Môi trường – Thông tư liên tịch số 05/2016/TTLT-BNNPTNT-BTNMT hướng dẫn thu gom, vận chuyển và xử lí bao gói thuốc BVTV sau sử dụng.',
      statements: [
        {
          label: 'a',
          level: 'biet',
          text: 'Bao bì, chai lọ thuốc bảo vệ thực vật sau sử dụng và lượng thuốc thừa tồn đọng là một trong những nguồn chính gây ô nhiễm đất, nước và không khí trong trồng trọt.',
          isTrue: true,
          explanation:
            'Theo Bài 26 SGK Công nghệ 10 (trang 132), lạm dụng thuốc BVTV và vứt bỏ bao bì bừa bãi gây ô nhiễm nghiêm trọng môi trường nông thôn.',
        },
        {
          label: 'b',
          level: 'hieu',
          text: 'Thao tác tráng rửa chai lọ thuốc BVTV 3 lần ngay tại ruộng và đổ nước tráng vào bình phun vừa giúp tận dụng hết lượng thuốc bám trong vỏ chai, vừa giảm tới hơn 95% lượng hóa chất độc hại còn sót lại trong bao bì thải.',
          isTrue: true,
          explanation:
            'Tráng rửa 3 lần là quy tắc an toàn bắt buộc giúp giảm tối đa lượng hóa chất độc tồn lưu trong vỏ bao bì trước khi bỏ vào bể thu gom.',
        },
        {
          label: 'c',
          level: 'vandung',
          text: 'Để giảm thiểu từ gốc lượng vỏ bao bì hóa chất thải ra đồng ruộng, hợp tác xã cần đẩy mạnh ứng dụng Quản lí dịch hại tổng hợp (IPM), trồng hoa trên bờ ruộng dẫn dụ thiên địch và ưu tiên dùng thuốc BVTV sinh học.',
          isTrue: true,
          explanation:
            'Áp dụng công nghệ sinh thái ("công nghệ sinh thái ruộng lúa bờ hoa") và IPM giúp giảm 50–70% số lần phải phun thuốc hóa học.',
        },
        {
          label: 'd',
          level: 'vandung',
          text: 'Khi bể thu gom bao bì thuốc BVTV ngoài đồng đã đầy, nông dân nên tự ý châm lửa đốt cháy toàn bộ vỏ chai nhựa và túi nilon đựng thuốc ngay tại đầu gió sát khu dân cư.',
          isTrue: false,
          explanation:
            'Tự ý đốt vỏ nhựa thuốc BVTV ở nhiệt độ thấp ngoài trời sẽ phát tán khí cực độc Dioxin/Furan và hơi thuốc trừ sâu gây ngộ độc cấp tính cho cộng đồng.',
        },
      ],
    },
  ],
};
