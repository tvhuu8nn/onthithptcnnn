import { ChapterMCQItem, ChapterTFQuestion } from './chapterReviewData';

/**
 * Bổ sung mỗi chương Lớp 11 (cn11-c1 .. cn11-c6) thêm 10 câu trắc nghiệm nhiều lựa chọn
 * (gồm 5 câu Nhận biết [21..25] + 5 câu Thông hiểu [26..30])
 * Kết hợp với 20 câu sẵn có (15 Nhận biết + 5 Thông hiểu) => Đúng 30 câu/chương (20 Nhận biết + 10 Thông hiểu).
 */
export const EXTRA_MCQ_11_FOR_30: Record<string, ChapterMCQItem[]> = {
  'cn11-c1': [
    {
      number: 21,
      level: 'biet',
      question:
        'Theo Bài 1 SGK Công nghệ 11, sản phẩm nào sau đây của ngành chăn nuôi là nguồn nguyên liệu cho công nghiệp chế biến da giày và dệt may?',
      options: [
        'Da trâu, da bò, lông cừu, lông vũ của vịt và ngỗng',
        'Rơm rạ khô, thân cây ngô, vỏ trấu và bã mía ép khô',
        'Mủ cao su tự nhiên, nhựa thông và sợi bông vải thô',
        'Gỗ keo lai, gỗ bạch đàn, tre nứa và song mây rừng',
      ],
      correctIndex: 0,
      explanation:
        'Ngành chăn nuôi cung cấp nguyên liệu cho công nghiệp nhẹ như da (trâu, bò), lông (cừu, vịt, ngỗng), sừng, móng (Bài 1 trang 6).',
    },
    {
      number: 22,
      level: 'biet',
      question:
        'Theo Bài 1 SGK Công nghệ 11, thành tựu nổi bật về ứng dụng công nghệ cao trong quản lí trang trại chăn nuôi hiện nay là',
      options: [
        'Sử dụng chip điện tử gắn tai, cảm biến IoT và hệ thống tự động hóa tiểu khí hậu chuồng nuôi',
        'Chỉ chăn thả vật nuôi tự do trong rừng tự nhiên mà không cần xây dựng chuồng trại hay tiêm phòng',
        'Thay thế hoàn toàn thức ăn và nước uống của vật nuôi bằng các loại phân bón hóa học tổng hợp',
        'Loại bỏ hoàn toàn công tác kiểm dịch thú y và vệ sinh khử trùng chuồng trại trong suốt vụ nuôi',
      ],
      correctIndex: 0,
      explanation:
        'Chăn nuôi hiện đại ứng dụng cảm biến IoT, thẻ chip RFID gắn tai theo dõi cá thể và tự động hóa cho ăn, uống, làm mát chuồng.',
    },
    {
      number: 23,
      level: 'biet',
      question:
        'Theo Bài 1 SGK Công nghệ 11, người chuyên nghiên cứu về chọn lọc, lai tạo và nhân giống các giống vật nuôi mới có năng suất cao được gọi là',
      options: [
        'Nhà nghiên cứu giống vật nuôi hoặc kĩ sư di truyền – giống vật nuôi',
        'Kĩ sư khai thác lâm sản và chế biến gỗ công nghiệp rừng trồng',
        'Kĩ thuật viên điều khiển tàu đánh bắt hải sản xa bờ bằng lưới vây',
        'Kiến trúc sư thiết kế quy hoạch cảnh quan công viên cây xanh đô thị',
      ],
      correctIndex: 0,
      explanation:
        'Kĩ sư/nhà nghiên cứu giống vật nuôi thực hiện bảo tồn, chọn lọc, nhân giống và lai tạo các giống vật nuôi mới (Bài 1 trang 9).',
    },
    {
      number: 24,
      level: 'biet',
      question:
        'Theo Bài 2 SGK Công nghệ 11, nhóm gia cầm nào sau đây thuộc nhóm gia cầm nuôi lấy trứng chuyên dụng phổ biến ở Việt Nam?',
      options: [
        'Gà Leghorn, gà Ai Cập, gà Isa Brown và vịt Khaki Campbell',
        'Gà Đông Tảo, gà Hồ, gà Mía và vịt Bầu Bến chuyên lấy thịt',
        'Bò BBB (Blanc Bleu Belge), bò Charolais và bò Brahman',
        'Lợn Landrace, lợn Yorkshire, lợn Duroc và lợn Pietrain',
      ],
      correctIndex: 0,
      explanation:
        'Gà Leghorn, gà Isa Brown, gà Ai Cập và vịt Khaki Campbell là các giống gia cầm hướng trứng có sản lượng trứng/năm rất cao.',
    },
    {
      number: 25,
      level: 'biet',
      question:
        'Theo nguồn gốc hình thành (Bài 2 SGK Công nghệ 11), nhóm giống vật nuôi nào sau đây đều thuộc nhóm giống vật nuôi nội (bản địa Việt Nam)?',
      options: [
        'Lợn Móng Cái, lợn Ỉ, gà Đông Tảo, gà Hồ, vịt Cỏ và bò Vàng Việt Nam',
        'Lợn Landrace, lợn Yorkshire, bò Holstein Friesian và gà Ross 308',
        'Bò BBB, bò Red Angus, lợn Duroc, lợn Pietrain và vịt Super Meat',
        'Gà Leghorn, gà Plymouth, dê Boer, cừu Dorper và ngựa thuần chủng Anh',
      ],
      correctIndex: 0,
      explanation:
        'Lợn Móng Cái, lợn Ỉ, gà Đông Tảo, gà Hồ, vịt Cỏ, bò Vàng là các giống bản địa lâu đời của Việt Nam.',
    },
    {
      number: 26,
      level: 'hieu',
      question:
        'Vì sao việc chuyển dịch từ chăn nuôi nhỏ lẻ nông hộ sang chăn nuôi trang trại tập trung quy mô công nghiệp lại là xu thế tất yếu ở Việt Nam?',
      options: [
        'Giúp áp dụng đồng bộ cơ giới hóa, kiểm soát dịch bệnh an toàn sinh học và hạ giá thành sản phẩm chăn nuôi',
        'Vì chăn nuôi trang trại tập trung không cần sử dụng thức ăn chăn nuôi và không cần tiêm vắc-xin phòng bệnh',
        'Để làm tăng gấp đôi chi phí nhân công lao động thủ công cho mỗi ki-lô-gam thịt hơi xuất chuồng',
        'Vì chăn nuôi nông hộ nhỏ lẻ luôn đòi hỏi phải trang bị hệ thống robot tự động hóa đắt tiền hơn trang trại',
      ],
      correctIndex: 0,
      explanation:
        'Chăn nuôi trang trại tập trung giúp kiểm soát an toàn sinh học, tự động hóa chăm sóc, xử lí chất thải tập trung và tăng năng suất.',
    },
    {
      number: 27,
      level: 'hieu',
      question:
        'Tại sao các giống vật nuôi bản địa Việt Nam (như lợn Móng Cái, gà Ri) tuy năng suất thấp hơn giống ngoại nhưng vẫn cần được bảo tồn nguồn gene?',
      options: [
        'Vì chúng có khả năng thích nghi cao, kháng bệnh tốt, chất lượng thịt thơm ngon và là nguyên liệu quý để lai tạo',
        'Vì các giống bản địa hoàn toàn không cần ăn uống gì mà vẫn tự lớn nhanh gấp ba lần các giống nhập nội',
        'Vì giống bản địa có khối lượng cơ thể trưởng thành lớn gấp mười lần các giống ngoại chuyên thịt cao sản',
        'Vì các giống vật nuôi ngoại nhập khẩu về Việt Nam đều không thể đẻ trứng hoặc sinh con được',
      ],
      correctIndex: 0,
      explanation:
        'Giống nội mang các gene quý về khả năng chống chịu kham khổ, kháng bệnh nhiệt đới, mắn đẻ và chất lượng thịt đặc sản.',
    },
    {
      number: 28,
      level: 'hieu',
      question:
        'Trong chăn nuôi thông minh (Bài 2), việc lắp đặt cảm biến nhiệt độ – độ ẩm kết nối quạt hút và tấm làm mát tự động mang lại lợi ích gì?',
      options: [
        'Duy trì tiểu khí hậu chuồng nuôi luôn ở ngưỡng tối ưu, giúp vật nuôi giảm stress nhiệt và tăng hiệu quả chuyển hóa thức ăn',
        'Giúp biến đổi khí carbonic trong chuồng thành thức ăn tinh giàu đạm cho vật nuôi mà không cần cho ăn cám',
        'Làm cho nhiệt độ trong chuồng nuôi luôn giữ ở mức trên 45 °C suốt mùa hè để tiêu diệt mọi loài côn trùng',
        'Thay thế hoàn toàn vai trò của bác sĩ thú y trong việc phẫu thuật ngoại khoa các ca đẻ khó ở gia súc lớn',
      ],
      correctIndex: 0,
      explanation:
        'Kiểm soát tiểu khí hậu tự động giữ nhiệt độ, độ ẩm ổn định, ngăn ngừa stress nhiệt làm giảm ăn và suy giảm miễn dịch.',
    },
    {
      number: 29,
      level: 'hieu',
      question:
        'Tại sao việc đảm bảo phúc lợi động vật (chuồng thông thoáng, mật độ hợp lí, vận chuyển nhân đạo) lại giúp nâng cao chất lượng thịt thương phẩm?',
      options: [
        'Vì vật nuôi không bị hoảng loạn hay stress cấp tính trước khi giết mổ sẽ hạn chế hiện tượng thịt nhạt màu, mềm nhão, rỉ dịch (PSE)',
        'Vì khi được nghe nhạc và ở chuồng rộng thì toàn bộ xương của vật nuôi sẽ biến thành thịt nạc nguyên chất',
        'Vì phúc lợi động vật giúp vật nuôi tự tổng hợp được kháng sinh trong máu để tiêu diệt mọi vi khuẩn gây thối',
        'Vì mật độ nuôi thưa làm cho hàm lượng nước tự do trong cơ bắp tăng lên chiếm 99% khối lượng thân thịt',
      ],
      correctIndex: 0,
      explanation:
        'Khi vật nuôi bị hoảng sợ trước giết mổ, glycogen phân giải yếm khí nhanh tạo acid lactic lúc thân thịt còn nóng gây hội chứng thịt PSE.',
    },
    {
      number: 30,
      level: 'hieu',
      question:
        'Khi phân loại vật nuôi theo mục đích sử dụng (Bài 2), vì sao người chăn nuôi cần xác định rõ hướng chuyên dụng (thịt, trứng, sữa hay kiêm dụng)?',
      options: [
        'Để xây dựng quy trình dinh dưỡng, thiết kế chuồng trại và chế độ chăm sóc phù hợp nhất với tiềm năng di truyền của giống',
        'Để bắt buộc mọi giống bò chuyên thịt phải vắt được lượng sữa nhiều hơn giống bò sữa chuyên dụng',
        'Vì các giống vật nuôi chuyên dụng đều có chung một khẩu phần ăn và thời gian khai thác giống hệt nhau',
        'Để có thể nuôi nhốt chung tất cả các loài gia súc và gia cầm vào cùng một ô chuồng chật hẹp',
      ],
      correctIndex: 0,
      explanation:
        'Mỗi hướng sản xuất có đặc điểm trao đổi chất và yêu cầu dinh dưỡng, chuồng nuôi khác nhau; phân loại đúng giúp khai thác tối đa năng suất.',
    },
  ],
  'cn11-c2': [
    {
      number: 21,
      level: 'biet',
      question:
        'Theo Bài 3 SGK Công nghệ 11, điều kiện để một quần thể vật nuôi được công nhận là một giống vật nuôi độc lập về quy mô số lượng là',
      options: [
        'Phải đạt số lượng cá thể nhất định đủ lớn để duy trì sự ổn định di truyền và tránh giao phối cận huyết',
        'Chỉ cần có duy nhất một cá thể đực hoặc một cá thể cái mới được phát hiện ngẫu nhiên trong tự nhiên',
        'Bắt buộc phải có trên một trăm triệu cá thể đang được nuôi ở tất cả các tỉnh thành trong cả nước',
        'Không cần quan tâm đến số lượng cá thể mà chỉ cần có màu lông khác biệt với các con vật xung quanh',
      ],
      correctIndex: 0,
      explanation:
        'Một giống vật nuôi phải có số lượng cá thể đủ lớn và tính di truyền ổn định để nhân giống lâu dài không bị suy thoái cận huyết (Bài 3 trang 17).',
    },
    {
      number: 22,
      level: 'biet',
      question:
        'Theo Bài 4 SGK Công nghệ 11, các chỉ tiêu như sản lượng sữa một chu kì, sản lượng trứng/năm, tỉ lệ thịt xẻ và tiêu tốn thức ăn/kg tăng khối lượng thuộc nhóm tiêu chí chọn giống nào?',
      options: [
        'Nhóm chỉ tiêu về năng suất và hiệu quả sản xuất (sức sản xuất) của vật nuôi',
        'Nhóm chỉ tiêu về màu sắc lông, da, hình dáng sừng và tai của vật nuôi',
        'Nhóm chỉ tiêu về tập tính ngủ nghỉ và phản xạ tự vệ của vật nuôi hoang dã',
        'Nhóm chỉ tiêu về kích thước chuồng trại và khoảng cách từ trại đến khu dân cư',
      ],
      correctIndex: 0,
      explanation:
        'Sản lượng trứng, sữa, tỉ lệ nạc, tiêu tốn thức ăn (FCR) là các chỉ tiêu đánh giá sức sản xuất trong chọn giống vật nuôi.',
    },
    {
      number: 23,
      level: 'biet',
      question:
        'Trong chọn lọc cá thể (Bài 4 SGK Công nghệ 11), bước kiểm tra phẩm chất giống của con đực thông qua năng suất của đời con do nó sinh ra gọi là',
      options: [
        'Kiểm tra đực giống qua đời sau (đánh giá giá trị di truyền thông qua chất lượng đời con)',
        'Chọn lọc hàng loạt dựa vào quan sát màu lông bên ngoài của cả đàn vật nuôi thương phẩm',
        'Lai kinh tế hai giống để tạo ra toàn bộ con lai dùng vào mục đích nuôi lấy thịt thương phẩm',
        'Phối giống tự nhiên ngẫu nhiên không có sự ghi chép sổ sách lí lịch của từng cá thể',
      ],
      correctIndex: 0,
      explanation:
        'Sau khi kiểm tra bản thân, các cá thể đực giống tốt tiếp tục được kiểm tra qua đời sau để khẳng định khả năng di truyền vượt trội (Bài 4 trang 23).',
    },
    {
      number: 24,
      level: 'biet',
      question:
        'Theo Bài 5 SGK Công nghệ 11, phương pháp cho giao phối giữa các cá thể đực và cái thuộc cùng một giống để tạo ra đời con mang 100% máu giống đó gọi là',
      options: [
        'Phương pháp nhân giống thuần chủng vật nuôi',
        'Phương pháp lai kinh tế ba giống hoặc bốn giống',
        'Phương pháp lai cải tạo giống vật nuôi địa phương',
        'Phương pháp lai xa giữa hai loài động vật khác nhau',
      ],
      correctIndex: 0,
      explanation:
        'Nhân giống thuần chủng là cho phối giống giữa con đực và con cái của cùng một giống nhằm bảo tồn và củng cố giống đó (Bài 5 trang 25).',
    },
    {
      number: 25,
      level: 'biet',
      question:
        'Trong công thức lai kinh tế phổ biến ở Việt Nam: Lợn đực ngoại (Yorkshire/Landrace) × Lợn cái nội (Móng Cái), toàn bộ đàn con lai F1 sinh ra được sử dụng để',
      options: [
        'Nuôi lấy thịt thương phẩm để khai thác ưu thế lai (không dùng con lai F1 để làm giống tiếp)',
        'Giữ lại 100% làm lợn đực giống hạt nhân cấp cụ kị cho toàn bộ các trại giống quốc gia',
        'Thả vào các khu bảo tồn thiên nhiên hoang dã để thay thế hoàn toàn loài lợn rừng tự nhiên',
        'Dùng làm vật chủ thí nghiệm để sản xuất các loại thuốc bảo vệ thực vật dùng cho cây lúa',
      ],
      correctIndex: 0,
      explanation:
        'Trong lai kinh tế, toàn bộ con lai được dùng nuôi thương phẩm vì nếu dùng F1 làm giống tiếp thì đời F2 sẽ phân li tính trạng và giảm ưu thế lai.',
    },
    {
      number: 26,
      level: 'hieu',
      question:
        'Vì sao trong sản xuất chăn nuôi thương phẩm, người ta không sử dụng con lai F1 của phép lai kinh tế để tiếp tục nhân giống tạo đời F2?',
      options: [
        'Vì ở thế hệ F2 các cặp gene dị hợp bị phân li làm giảm mạnh ưu thế lai và đàn con không đồng đều',
        'Vì toàn bộ con lai F1 trong phép lai kinh tế đều bị mất hoàn toàn cơ quan sinh sản ngay khi sinh ra',
        'Vì thế hệ F2 sẽ có tốc độ lớn nhanh gấp mười lần thế hệ F1 làm gãy sập sàn chuồng chăn nuôi',
        'Vì con lai F1 chỉ có thể sống được ở môi trường nước mặn chứ không sống được ở chuồng trại trên cạn',
      ],
      correctIndex: 0,
      explanation:
        'Ưu thế lai biểu hiện cao nhất ở F1 do trạng thái dị hợp tử tối đa; đời F2 sẽ phân li tính trạng làm giảm năng suất.',
    },
    {
      number: 27,
      level: 'hieu',
      question:
        'Tại sao phương pháp chọn lọc cá thể (Bài 4) lại mang lại hiệu quả di truyền chính xác và bền vững hơn nhiều so với chọn lọc hàng loạt?',
      options: [
        'Vì chọn lọc cá thể kết hợp đánh giá cả ngoại hình bản thân, phả hệ tổ tiên và kiểm tra chất lượng đời con nên xác định đúng kiểu gene',
        'Vì chọn lọc cá thể không cần ghi chép sổ sách theo dõi và thực hiện nhanh chỉ trong vòng năm phút ngoài chuồng nuôi',
        'Vì chọn lọc cá thể chỉ dựa duy nhất vào màu sắc lông của vật nuôi mà bỏ qua toàn bộ các chỉ tiêu về năng suất',
        'Vì chọn lọc hàng loạt chỉ áp dụng được cho cá sấu còn chọn lọc cá thể chỉ áp dụng được cho ong mật',
      ],
      correctIndex: 0,
      explanation:
        'Chọn lọc cá thể đánh giá cả bản thân, gia hệ và đời sau nên chọn đúng giá trị kiểu gene di truyền.',
    },
    {
      number: 28,
      level: 'hieu',
      question:
        'Trong quy trình cấy truyền phôi bò (Bài 6), vì sao bò cái cho phôi và bò cái nhận phôi bắt buộc phải được xử lí đồng pha động dục?',
      options: [
        'Để trạng thái sinh lí tử cung của bò nhận phôi tương thích hoàn toàn với tuổi phát triển của phôi, giúp phôi làm tổ và sống sót',
        'Để bò cái nhận phôi truyền toàn bộ các gene quy định màu lông và tầm vóc của nó sang cho phôi được cấy vào',
        'Để hai con bò cái có thể tự động trao đổi phôi cho nhau qua không khí mà không cần kĩ thuật viên thao tác',
        'Để rút ngắn thời gian mang thai của bò cái nhận phôi từ chín tháng mười ngày xuống còn đúng bảy ngày',
      ],
      correctIndex: 0,
      explanation:
        'Nếu tử cung bò nhận không cùng pha sinh lí nội tiết với bò cho phôi tại thời điểm thu phôi thì phôi cấy vào sẽ bị đào thải.',
    },
    {
      number: 29,
      level: 'hieu',
      question:
        'Tại sao việc ứng dụng công nghệ xác định giới tính tinh trùng bò sữa (tinh phân giới tính cái) lại mang lại hiệu quả kinh tế đột phá cho các trang trại bò sữa?',
      options: [
        'Giúp tạo ra trên 90% bê cái hướng sữa để nhanh chóng mở rộng quy mô đàn bò vắt sữa và giảm tỉ lệ bê đực hiệu quả kinh tế thấp',
        'Giúp tạo ra 100% bê đực chuyên dùng để kéo cày trên các cánh đồng lúa nước thay cho máy cày cơ giới',
        'Làm cho bò mẹ có thể tiết sữa liên tục suốt mười năm mà không cần phải mang thai và đẻ bê con',
        'Giúp tinh trùng bò sữa tự động nhân đôi số lượng trong bình nitrogen lỏng ở nhiệt độ -196 °C',
      ],
      correctIndex: 0,
      explanation:
        'Trong chăn nuôi bò sữa, dùng tinh phân giới tính X giúp sinh ra ~90% bê cái, đẩy nhanh tốc độ nhân đàn bò sữa cao sản.',
    },
    {
      number: 30,
      level: 'hieu',
      question:
        'Vì sao khi bảo quản tinh dịch động vật trong bình chứa nitrogen lỏng ở nhiệt độ -196 °C thì tinh trùng vẫn giữ được khả năng thụ tinh qua hàng chục năm?',
      options: [
        'Vì ở nhiệt độ siêu lạnh -196 °C cùng chất bảo quản chống đông, mọi hoạt động trao đổi chất của tế bào tinh trùng tạm ngừng hoàn toàn mà không bị vỡ màng',
        'Vì ở nhiệt độ -196 °C các tế bào tinh trùng vẫn bơi lội mạnh mẽ và tự phân chia nguyên phân tạo ra hàng triệu tinh trùng mới',
        'Vì nitrogen lỏng cung cấp một lượng lớn đường glucose và protein giúp nuôi sống tinh trùng trong suốt nhiều năm',
        'Vì nhiệt độ -196 °C làm đốt cháy toàn bộ phần đuôi của tinh trùng giúp đầu tinh trùng nhẹ hơn khi phối giống',
      ],
      correctIndex: 0,
      explanation:
        'Môi trường pha loãng có chất bảo vệ đông lạnh kết hợp giữ ở -196 °C đưa tinh trùng vào trạng thái tiềm sinh (ngừng trao đổi chất).',
    },
  ],
  'cn11-c3': [
    {
      number: 21,
      level: 'biet',
      question:
        'Theo Bài 7 SGK Công nghệ 11, đơn vị dùng để đo lường nhu cầu năng lượng trao đổi trong khẩu phần ăn của gia cầm và lợn phổ biến là',
      options: [
        'Kilocalorie (kcal) hoặc Megajoule (MJ) năng lượng trao đổi (ME) trong 1 kg thức ăn',
        'Milimét thủy ngân (mmHg) đo áp suất thẩm thấu của dịch tiêu hóa trong dạ dày',
        'Độ pH và chỉ số dẫn điện EC của dung dịch nước uống cung cấp tại núm uống tự động',
        'Số lượng vi khuẩn hiếu khí tổng số tính bằng đơn vị CFU trên một gam phân thải ra',
      ],
      correctIndex: 0,
      explanation:
        'Nhu cầu năng lượng của vật nuôi thường biểu thị bằng năng lượng trao đổi ME (kcal hoặc MJ) trên 1 kg thức ăn (Bài 7 trang 37).',
    },
    {
      number: 22,
      level: 'biet',
      question:
        'Theo Bài 7 SGK Công nghệ 11, nguyên tố khoáng đa lượng nào sau đây đóng vai trò cấu tạo nên trên 90% bộ xương, răng của gia súc và vỏ trứng gia cầm?',
      options: [
        'Khoáng Calcium (Ca) kết hợp chặt chẽ với Phosphorus (P)',
        'Khoáng vi lượng Iodine (I) và nguyên tố Selenium (Se)',
        'Khoáng vi lượng Cobalt (Co) và nguyên tố Manganese (Mn)',
        'Chất xơ thô không hòa tan (Cellulose và Lignin thực vật)',
      ],
      correctIndex: 0,
      explanation:
        'Calcium (Ca) và Phosphorus (P) là hai chất khoáng đa lượng chủ yếu cấu tạo bộ xương gia súc và vỏ trứng gia cầm.',
    },
    {
      number: 23,
      level: 'biet',
      question:
        'Theo Bài 8 SGK Công nghệ 11, nhóm thức ăn nào sau đây thuộc nhóm thức ăn giàu protein có nguồn gốc thực vật dùng trong chăn nuôi?',
      options: [
        'Khô dầu đậu tương (đậu nành), khô dầu lạc, hạt đậu tương rang và khô dầu hạt cải',
        'Bột cá biển, bột thịt xương, bột huyết, bột lông vũ thủy phân và bột nhộng tằm',
        'Hạt ngô vàng, tấm gạo, cám gạo, sắn lát khô, hạt lúa mì và hạt cao lương',
        'Rơm lúa khô, cỏ voi tươi, cỏ Ghine, thân lá cây ngô già và bã mía tươi',
      ],
      correctIndex: 0,
      explanation:
        'Khô dầu đậu tương (~44–48% protein thô) và khô dầu lạc là nguyên liệu giàu protein thực vật quan trọng nhất (Bài 8 trang 41).',
    },
    {
      number: 24,
      level: 'biet',
      question:
        'Theo Bài 8 SGK Công nghệ 11, thức ăn hỗn hợp hoàn chỉnh (dạng viên hoặc dạng bột mảnh) có đặc điểm nào sau đây?',
      options: [
        'Đã chứa đầy đủ và cân đối các chất dinh dưỡng, cho vật nuôi ăn trực tiếp và chỉ cần cung cấp thêm nước uống sạch',
        'Có hàm lượng đạm và khoáng cực kì đậm đặc nên bắt buộc phải pha thêm 90% ngô, cám gạo trước khi cho ăn',
        'Chỉ chứa duy nhất các loại vitamin tổng hợp và chất tạo màu mà không có bất kì nguồn năng lượng hay protein nào',
        'Chỉ sử dụng để bón lót xuống đáy ao nuôi cá chứ không được phép cho gia súc hoặc gia cầm trên cạn ăn',
      ],
      correctIndex: 0,
      explanation:
        'Thức ăn hỗn hợp hoàn chỉnh đã cân đối đủ dinh dưỡng theo giai đoạn sinh trưởng, cho ăn trực tiếp không cần pha trộn thêm (Bài 8 trang 42).',
    },
    {
      number: 25,
      level: 'biet',
      question:
        'Theo Bài 10 SGK Công nghệ 11, độc tố vi nấm cực kì nguy hiểm thường sinh ra trong hạt ngô, khô dầu lạc bị mốc (do nấm Aspergillus flavus) gây ngộ độc gan và ung thư ở vật nuôi là',
      options: [
        'Độc tố Aflatoxin',
        'Hormone Oxytocin',
        'Enzyme Cellulase',
        'Vitamin C (Acid ascorbic)',
      ],
      correctIndex: 0,
      explanation:
        'Nấm mốc Aspergillus flavus phát triển trên ngô, lạc ẩm mốc tiết độc tố Aflatoxin rất bền nhiệt, gây hoại tử gan và giảm miễn dịch.',
    },
    {
      number: 26,
      level: 'hieu',
      question:
        'Vì sao khi phối trộn khẩu phần ăn cho lợn và gia cầm (động vật dạ dày đơn), người ta đặc biệt chú ý bổ sung các amino acid thiết yếu như Lysine và Methionine?',
      options: [
        'Vì cơ thể lợn và gia cầm không tự tổng hợp được các amino acid thiết yếu này, nếu thiếu dù chỉ một chất sẽ làm hạn chế tổng hợp protein của cả cơ thể',
        'Vì Lysine và Methionine là hai loại chất xơ thô giúp mề gà nghiền nát sỏi đá thành nước uống tinh khiết',
        'Vì nếu bổ sung Lysine thì người chăn nuôi có thể cắt bỏ hoàn toàn nguồn thức ăn giàu năng lượng như ngô và tấm gạo',
        'Vì chỉ có trâu bò mới tự tổng hợp được chất béo còn lợn và gà dùng Lysine để biến thành vỏ trấu lót chuồng',
      ],
      correctIndex: 0,
      explanation:
        'Các amino acid thiết yếu (Lysine, Methionine, Tryptophan) vật nuôi dạ dày đơn không tự tổng hợp đủ, bắt buộc phải cung cấp từ thức ăn.',
    },
    {
      number: 27,
      level: 'hieu',
      question:
        'Tại sao trâu, bò có thể sử dụng được một lượng nhất định urea (nitơ phi protein) trong thức ăn ủ rơm để tạo ra protein cho cơ thể, trong khi lợn và gà ăn urea sẽ bị ngộ độc?',
      options: [
        'Vì trong dạ cỏ của trâu bò có hệ vi sinh vật cộng sinh dùng nitơ từ urea để tổng hợp protein vi sinh vật rồi tiêu hóa ở dạ múi khế và ruột non',
        'Vì dạ dày của lợn và gà có kích thước lớn gấp mười lần dạ cỏ của trâu bò nên hấp thu urea quá chậm',
        'Vì trâu bò thở ra toàn bộ lượng urea qua mũi ngay khi nhai lại nên urea không đi vào trong dạ dày',
        'Vì urea khi vào dạ cỏ trâu bò sẽ tự động biến thành hạt ngô vàng giàu tinh bột và chất béo',
      ],
      correctIndex: 0,
      explanation:
        'Hệ VSV trong dạ cỏ gia súc nhai lại chuyển hóa nitơ từ urea thành protein vi sinh vật; lợn và gà không có dạ cỏ nên bị ngộ độc NH3.',
    },
    {
      number: 28,
      level: 'hieu',
      question:
        'Trong quy trình ủ thức ăn tinh bột với nấm men (Bài 9), việc lên men sinh học mang lại lợi ích vượt trội nào cho hệ tiêu hóa của lợn con và gia cầm non?',
      options: [
        'Tăng hàm lượng protein vi sinh vật, vitamin nhóm B, tạo mùi thơm kích thích tính thèm ăn và ức chế vi khuẩn có hại trong đường ruột',
        'Làm tăng gấp năm lần hàm lượng chất xơ khó tiêu và chất chát tannin để làm chậm quá trình tiêu hóa thức ăn',
        'Biến toàn bộ tinh bột trong ngô và cám gạo thành các muối kim loại nặng giúp xương lợn con cứng như thép',
        'Tiêu diệt sạch toàn bộ các enzyme tiêu hóa tự nhiên có trong dịch vị dạ dày và dịch tụy của vật nuôi non',
      ],
      correctIndex: 0,
      explanation:
        'Thức ăn lên men giàu sinh khối VSV, vitamin nhóm B, enzyme và acid hữu cơ giúp vật nuôi non ăn khỏe, tiêu hóa tốt và giảm tiêu chảy.',
    },
    {
      number: 29,
      level: 'hieu',
      question:
        'Tại sao việc sử dụng công nghệ ép viên nhiệt ẩm trong sản xuất thức ăn chăn nuôi công nghiệp lại giúp giảm hệ số tiêu tốn thức ăn (FCR)?',
      options: [
        'Vì nhiệt ẩm làm hồ hóa tinh bột dễ tiêu hóa hơn, tiêu diệt vi khuẩn gây bệnh và ngăn vật nuôi lựa chọn bới vãi thức ăn',
        'Vì thức ăn dạng viên không chứa bất kì chất dinh dưỡng nào nên vật nuôi ăn ít đi mà chỉ uống nước cầm hơi',
        'Vì quá trình ép viên làm tăng độ ẩm của viên cám lên mức 85% giúp viên cám nặng hơn gấp ba lần cám bột',
        'Vì viên cám sau khi ép có vỏ cứng như sỏi đá nên nằm lại vĩnh viễn trong dạ dày giúp vật nuôi luôn cảm thấy no',
      ],
      correctIndex: 0,
      explanation:
        'Hơi nước nóng trong máy ép viên làm chín tinh bột, diệt khuẩn Salmonella/E.coli và định hình viên đồng nhất giúp giảm rơi vãi.',
    },
    {
      number: 30,
      level: 'hieu',
      question:
        'Khi bảo quản hạt ngũ cốc làm thức ăn chăn nuôi trong silo hiện đại (Bài 10), vì sao hệ thống quạt thông gió làm mát và cảm biến nhiệt – ẩm lại giữ vai trò quyết định?',
      options: [
        'Giúp kịp thời phát hiện và triệt tiêu các điểm tích nhiệt – ẩm cục bộ trong khối hạt, ngăn chặn côn trùng và nấm mốc bùng phát',
        'Để bơm thật nhiều hơi nước nóng ẩm từ ngoài trời mưa vào trong silo giúp hạt ngô nảy mầm đồng loạt trước khi nghiền',
        'Vì hệ thống quạt trong silo dùng để thổi bay toàn bộ hạt ngô ra ngoài trời mỗi khi có ánh nắng mặt trời xuất hiện',
        'Để làm tăng hàm lượng độc tố Aflatoxin tự nhiên trong khối hạt ngô dự trữ lên mức tối đa trước khi xuất kho',
      ],
      correctIndex: 0,
      explanation:
        'Cảm biến nhiệt – ẩm kết hợp quạt thông gió giúp duy trì độ ẩm < 13–14% và ngăn tự bốc nóng cục bộ trong silo chứa hạt.',
    },
  ],
  'cn11-c4': [
    {
      number: 21,
      level: 'biet',
      question:
        'Theo Bài 11 SGK Công nghệ 11, nhóm bệnh nào sau đây có khả năng lây lan nhanh từ cá thể mắc bệnh sang cá thể khỏe mạnh và bùng phát thành dịch lớn?',
      options: [
        'Nhóm bệnh truyền nhiễm (do virus, vi khuẩn gây ra như dịch tả lợn châu Phi, cúm gia cầm, lở mồm long móng)',
        'Nhóm bệnh không truyền nhiễm do chấn thương cơ học như gãy chân, trật khớp hoặc hóc dị vật đường ăn',
        'Nhóm bệnh rối loạn trao đổi chất do thiếu hụt vitamin D, thiếu khoáng calcium hoặc trúng độc muối ăn',
        'Nhóm dị tật bẩm sinh di truyền cá biệt xuất hiện ở một vài cá thể do đột biến nhiễm sắc thể hiếm gặp',
      ],
      correctIndex: 0,
      explanation:
        'Bệnh truyền nhiễm do VSV gây bệnh (virus, vi khuẩn, nấm) gây ra và lây truyền nhanh thành dịch lớn (Bài 11 trang 57).',
    },
    {
      number: 22,
      level: 'biet',
      question:
        'Theo Bài 12 SGK Công nghệ 11, tác nhân gây bệnh Tụ huyết trùng ở lợn (đấu dấu) và gia cầm là loài vi sinh vật nào sau đây?',
      options: [
        'Vi khuẩn Pasteurella multocida',
        'Virus cúm gia cầm Influenza type A (H5N1)',
        'Virus gây hội chứng rối loạn sinh sản và hô hấp (PRRS)',
        'Kí sinh trùng giun đũa lợn Ascaris suum',
      ],
      correctIndex: 0,
      explanation:
        'Bệnh tụ huyết trùng ở lợn, trâu bò và gia cầm là bệnh truyền nhiễm cấp tính do vi khuẩn Pasteurella multocida gây ra (Bài 12 trang 63).',
    },
    {
      number: 23,
      level: 'biet',
      question:
        'Theo Bài 12 SGK Công nghệ 11, bệnh truyền nhiễm nguy hiểm nào ở lợn do virus ASFV gây ra, có tỉ lệ chết lên tới gần 100% và hiện cần kiểm soát an toàn sinh học cực kì nghiêm ngặt?',
      options: [
        'Bệnh Dịch tả lợn châu Phi (African Swine Fever – ASF)',
        'Bệnh thiếu máu dinh dưỡng do thiếu sắt ở lợn con sơ sinh',
        'Bệnh còi xương và bại liệt sau khi đẻ ở lợn nái nuôi con',
        'Bệnh ghẻ ngứa ngoài da do cái ghẻ Sarcoptes kí sinh',
      ],
      correctIndex: 0,
      explanation:
        'Bệnh Dịch tả lợn châu Phi (ASF) do virus ASFV gây sốt cao, xuất huyết nặng nội tạng, tỉ lệ chết lên tới 100% (Bài 12 trang 62).',
    },
    {
      number: 24,
      level: 'biet',
      question:
        'Theo Bài 13 SGK Công nghệ 11, bệnh truyền nhiễm nào ở gia cầm do chủng virus Paramyxovirus gây ra với triệu chứng điển hình là khó thở, tiêu chảy phân xanh trắng và ngoẹo cổ?',
      options: [
        'Bệnh Newcastle (còn gọi là bệnh gà rù)',
        'Bệnh cầu trùng ruột non do đơn bào Eimeria',
        'Bệnh thiếu vitamin B1 gây co giật ở gà con',
        'Bệnh mổ cắn lông nhau do mật độ nuôi quá dày',
      ],
      correctIndex: 0,
      explanation:
        'Bệnh Newcastle (gà rù) do virus Newcastle (Paramyxovirus) gây tổn thương hô hấp, tiêu hóa (phân xanh trắng) và thần kinh (ngoẹo cổ).',
    },
    {
      number: 25,
      level: 'biet',
      question:
        'Theo Bài 15 SGK Công nghệ 11, kĩ thuật chẩn đoán phân tử hiện đại giúp phát hiện nhanh và chính xác đoạn gene đặc hiệu của virus, vi khuẩn gây bệnh trong mẫu bệnh phẩm là',
      options: [
        'Kĩ thuật phản ứng chuỗi trùng hợp PCR (hoặc Real-time PCR / RT-PCR)',
        'Phương pháp quan sát màu sắc lông bằng mắt thường từ khoảng cách xa',
        'Phương pháp cân khối lượng cơ thể vật nuôi bằng cân đồng hồ cơ học',
        'Phương pháp đo chiều dài chuồng nuôi bằng thước dây kim loại cuộn',
      ],
      correctIndex: 0,
      explanation:
        'Kĩ thuật PCR và RT-PCR giúp nhân bản và phát hiện chính xác vật chất di truyền (ADN/ARN) của mầm bệnh (Bài 15 trang 77).',
    },
    {
      number: 26,
      level: 'hieu',
      question:
        'Vì sao thuốc kháng sinh chỉ có tác dụng điều trị các bệnh do vi khuẩn (như tụ huyết trùng, phó thương hàn) mà hoàn toàn không tiêu diệt được virus (như virus PRRS, ASF, Newcastle)?',
      options: [
        'Vì kháng sinh tác động vào vách tế bào hoặc bộ máy tổng hợp protein của tế bào vi khuẩn, trong khi virus không có cấu tạo tế bào và kí sinh nội bào bắt buộc',
        'Vì kích thước của hạt virus lớn gấp một nghìn lần con vi khuẩn nên phân tử kháng sinh không thể bao bọc hết virus',
        'Vì virus có khả năng sử dụng thuốc kháng sinh làm nguồn thức ăn giàu năng lượng để nhân lên nhanh hơn trong máu',
        'Vì thuốc kháng sinh khi tiêm vào cơ thể vật nuôi sẽ tự động bốc hơi hết qua da nếu gặp phải các chủng virus',
      ],
      correctIndex: 0,
      explanation:
        'Kháng sinh tác động lên thành tế bào hoặc ribosome của vi khuẩn; virus không có cấu tạo tế bào và kí sinh nội bào nên kháng sinh không diệt được virus.',
    },
    {
      number: 27,
      level: 'hieu',
      question:
        'Tại sao khi sử dụng kháng sinh điều trị bệnh nhiễm khuẩn cho vật nuôi, người chăn nuôi bắt buộc phải tuân thủ đúng "thời gian ngừng thuốc" trước khi giết mổ hoặc khai thác sữa, trứng?',
      options: [
        'Để cơ thể vật nuôi đào thải hết lượng kháng sinh tồn dư, bảo đảm an toàn thực phẩm và ngăn ngừa tình trạng kháng kháng sinh ở người tiêu dùng',
        'Để làm cho khối lượng cơ thể của vật nuôi tăng thêm gấp đôi chỉ trong vòng hai mươi bốn giờ trước khi xuất bán',
        'Vì nếu không ngừng thuốc thì màu lông bên ngoài của vật nuôi sẽ chuyển hết sang màu xanh tím khi đưa ra ánh sáng',
        'Để giúp các vi khuẩn gây bệnh trong chuồng nuôi có đủ thời gian phục hồi và nhân lên trở lại trong cơ thể vật nuôi',
      ],
      correctIndex: 0,
      explanation:
        'Ngừng thuốc đúng thời gian quy định giúp dư lượng kháng sinh trong thịt, trứng, sữa giảm xuống dưới ngưỡng an toàn, bảo vệ người tiêu dùng.',
    },
    {
      number: 28,
      level: 'hieu',
      question:
        'Vì sao chỉ tiêm vắc-xin phòng bệnh cho đàn vật nuôi đang khỏe mạnh mà tuyệt đối không tiêm vắc-xin cho những con vật đang sốt cao hoặc đang ủ bệnh truyền nhiễm?',
      options: [
        'Vì vật nuôi đang ốm có hệ miễn dịch suy yếu không tạo đủ kháng thể, thậm chí phản ứng vắc-xin sẽ làm bệnh nặng thêm và gây chết nhanh',
        'Vì vắc-xin khi tiêm vào con vật đang sốt cao sẽ tự động biến thành nước cất vô tác dụng ngay ở đầu kim tiêm',
        'Vì con vật đang sốt cao đã có sẵn lượng kháng thể cao gấp mười lần con vật khỏe mạnh nên không cần tiêm thêm',
        'Vì tiêm vắc-xin cho vật nuôi đang ốm sẽ làm gãy toàn bộ kim tiêm bằng thép không gỉ của bác sĩ thú y',
      ],
      correctIndex: 0,
      explanation:
        'Vắc-xin cần hệ miễn dịch khỏe mạnh để sinh kháng thể sau 1–3 tuần; tiêm vào vật nuôi đang ốm sẽ gây quá tải miễn dịch và phát bệnh nặng.',
    },
    {
      number: 29,
      level: 'hieu',
      question:
        'Trong phòng bệnh tổng hợp cho trang trại chăn nuôi (Bài 11), tại sao thực hiện "cùng vào – cùng ra" (all-in, all-out) theo từng dãy chuồng lại giúp cắt đứt vòng đời mầm bệnh?',
      options: [
        'Vì tạo ra khoảng thời gian trống chuồng hoàn toàn giữa hai lứa nuôi để tổng vệ sinh, phun sát trùng và để trống chuồng tiêu diệt triệt để mầm bệnh lưu cữu',
        'Vì khi xuất bán cùng lúc thì các mầm bệnh sẽ tự động đi theo xe tải ra khỏi trại mà không cần phải rửa chuồng hay phun thuốc sát trùng',
        'Vì phương thức này cho phép nhốt lẫn lộn lợn con mới sinh với lợn thịt sắp xuất chuồng trong cùng một ô chuồng suốt năm',
        'Vì giúp người chăn nuôi tiết kiệm được 100% chi phí mua vắc-xin và thức ăn hỗn hợp trong suốt quá trình nuôi',
      ],
      correctIndex: 0,
      explanation:
        'Nguyên tắc "cùng vào – cùng ra" ngăn lây chéo từ lứa cũ sang lứa mới và cho phép tổng tẩy uế, sát trùng, để trống chuồng diệt sạch mầm bệnh.',
    },
    {
      number: 30,
      level: 'hieu',
      question:
        'So với vắc-xin truyền thống, vắc-xin tái tổ hợp sản xuất bằng công nghệ gene (Bài 15) có ưu điểm vượt trội nào về mặt an toàn sinh học?',
      options: [
        'Chỉ sử dụng đoạn gene mã hóa protein kháng nguyên đặc hiệu nên hoàn toàn không có nguy cơ mầm bệnh phục hồi độc lực gây bệnh cho vật nuôi',
        'Có thể bảo quản ở ngoài nắng nóng 50 °C suốt nhiều năm mà không bao giờ bị giảm hoạt lực sinh học',
        'Chỉ cần tiêm một mũi duy nhất cho một cá thể là toàn bộ các con vật khác trong trại tự động có miễn dịch theo',
        'Có tác dụng thay thế hoàn toàn thức ăn hỗn hợp và nước uống hàng ngày của đàn gia súc, gia cầm',
      ],
      correctIndex: 0,
      explanation:
        'Vắc-xin tái tổ hợp chỉ chứa protein kháng nguyên bề mặt đặc hiệu nên tuyệt đối an toàn, không có nguy cơ tái độc lực.',
    },
  ],
  'cn11-c5': [
    {
      number: 21,
      level: 'biet',
      question:
        'Theo Bài 16 SGK Công nghệ 11, khi lựa chọn hướng chuồng nuôi gia súc, gia cầm ở Việt Nam, hai hướng chuồng được ưu tiên hàng đầu để đón gió mát mùa hè và tránh gió lạnh mùa đông là',
      options: [
        'Hướng Nam hoặc hướng Đông – Nam',
        'Hướng Tây hoặc hướng Tây – Bắc',
        'Hướng Bắc hoặc hướng Đông – Bắc',
        'Hướng chính Tây đón nắng chiều gay gắt',
      ],
      correctIndex: 0,
      explanation:
        'Chuồng nuôi quay hướng Nam hoặc Đông – Nam giúp đón gió mát mùa hè, ấm áp mùa đông, tránh nắng gắt hướng Tây và gió mùa Đông Bắc (Bài 16 trang 85).',
    },
    {
      number: 22,
      level: 'biet',
      question:
        'Theo Bài 16 SGK Công nghệ 11, trong kiểu chuồng kín hiện đại, hệ thống tấm làm mát (cooling pad) thường được lắp đặt ở vị trí nào so với hệ thống quạt hút gió công nghiệp?',
      options: [
        'Lắp đặt ở đầu chuồng đối diện với dàn quạt hút ở cuối chuồng để tạo luồng gió mát đi dọc suốt chiều dài chuồng',
        'Lắp đặt ở bên ngoài cổng tường rào cách xa chuồng nuôi khoảng năm trăm mét để làm mát đường giao thông',
        'Lắp đặt chìm ở dưới đáy bể chứa chất thải biogas nằm sâu dưới lòng đất bên dưới nền chuồng nuôi',
        'Đặt chồng khít lên phía trước cánh quạt hút gió để ngăn không cho bất kì luồng không khí nào đi qua quạt',
      ],
      correctIndex: 0,
      explanation:
        'Chuồng kín hoạt động theo nguyên lí áp suất âm: quạt hút đặt ở cuối chuồng hút khí ra, không khí bên ngoài đi qua tấm cooling pad ở đầu đối diện làm mát chuồng.',
    },
    {
      number: 23,
      level: 'biet',
      question:
        'Theo Bài 17 SGK Công nghệ 11, đối với lợn con sơ sinh trong tuần lễ đầu tiên, ngoài việc cho bú sữa đầu càng sớm càng tốt, biện pháp kĩ thuật bắt buộc để phòng bệnh thiếu máu là',
      options: [
        'Tiêm bổ sung chế phẩm sắt (dextran sắt) cho lợn con vào khoảng ngày tuổi thứ 3 và ngày tuổi thứ 10',
        'Cho lợn con ăn ngay một ki-lô-gam rơm lúa khô và cỏ voi già mỗi ngày ngay sau khi cắt rốn',
        'Tắm nước đá lạnh cho toàn bộ đàn lợn con sơ sinh ba lần mỗi ngày để rèn luyện sức chịu lạnh',
        'Tách lợn con sơ sinh nhốt hoàn toàn trong bóng tối tuyệt đối và không cho bú sữa mẹ trong tuần đầu',
      ],
      correctIndex: 0,
      explanation:
        'Dự trữ sắt ở lợn con sơ sinh rất thấp và sữa mẹ nghèo sắt nên phải tiêm sắt lúc 3 ngày tuổi và nhắc lại lúc 10–14 ngày tuổi (Bài 17 trang 91).',
    },
    {
      number: 24,
      level: 'biet',
      question:
        'Theo Bài 18 SGK Công nghệ 11, trong chăn nuôi gà đẻ trứng công nghiệp, yếu tố ngoại cảnh nào cần được chiếu bổ sung theo quy trình nghiêm ngặt (14–16 giờ/ngày) để kích thích tuyến yên tiết hormone sinh sản?',
      options: [
        'Chế độ chiếu sáng (thời gian và cường độ ánh sáng trong chuồng nuôi gà đẻ)',
        'Chế độ phun mưa nhân tạo làm ướt đẫm bộ lông gà đẻ suốt ngày đêm',
        'Chế độ phát tiếng ồn cường độ cực lớn liên tục trong chuồng nuôi gà đẻ',
        'Chế độ bơm khí carbonic đậm đặc vào trong chuồng nuôi vào ban đêm',
      ],
      correctIndex: 0,
      explanation:
        'Ánh sáng tác động qua thị giác đến vùng dưới đồi – tuyến yên của gà mái đẻ, kích thích tiết FSH, LH duy trì năng suất đẻ trứng cao (Bài 18 trang 96).',
    },
    {
      number: 25,
      level: 'biet',
      question:
        'Theo Bài 20 SGK Công nghệ 11, mục tiêu cốt lõi của quy trình chăn nuôi theo tiêu chuẩn VietGAP là gì?',
      options: [
        'Đảm bảo an toàn thực phẩm, kiểm soát dịch bệnh, bảo vệ môi trường, sức khỏe người lao động và truy xuất được nguồn gốc',
        'Sử dụng tối đa các loại chất tạo nạc nhóm Beta-agonist và kháng sinh cấm để rút ngắn một nửa thời gian nuôi',
        'Xóa bỏ hoàn toàn việc ghi chép nhật kí chăn nuôi để giảm bớt khối lượng công việc hành chính cho trang trại',
        'Cho phép giết mổ và tiêu thụ tự do các loại gia súc, gia cầm chết do dịch bệnh truyền nhiễm nguy hiểm',
      ],
      correctIndex: 0,
      explanation:
        'VietGAP đảm bảo chất lượng, an toàn thực phẩm, an toàn dịch bệnh, bảo vệ môi trường và truy xuất nguồn gốc (Bài 20 trang 104).',
    },
    {
      number: 26,
      level: 'hieu',
      question:
        'Vì sao nền chuồng nuôi gia súc, gia cầm bắt buộc phải được thiết kế cao ráo hơn mặt đất xung quanh (30–50 cm), phẳng, không trơn trượt và có độ dốc thoát nước 2–3% về phía rãnh thoát?',
      options: [
        'Để giữ nền chuồng luôn khô sạch, thoát nhanh nước tiểu và nước rửa chuồng, hạn chế vi sinh vật gây bệnh phát triển và tránh trượt ngã trật khớp cho vật nuôi',
        'Để giữ toàn bộ nước thải và phân tươi đọng lại ngập trên mặt sàn chuồng giúp làm mát bụng vật nuôi suốt mùa đông lạnh giá',
        'Vì độ dốc 2–3% giúp các viên thức ăn tự động lăn ngược từ dưới rãnh thoát chất thải lên trên máng ăn của vật nuôi',
        'Để ngăn không cho ánh sáng mặt trời và không khí trong lành lưu thông vào bên trong khu vực chuồng nuôi gia súc',
      ],
      correctIndex: 0,
      explanation:
        'Nền chuồng khô ráo, thoát nước tốt và có độ nhám vừa phải giúp hạn chế ẩm ướt, khí độc NH3, bệnh móng khớp và tiêu chảy (Bài 16 trang 86).',
    },
    {
      number: 27,
      level: 'hieu',
      question:
        'Tại sao đối với lợn con theo mẹ, người chăn nuôi cần tập cho lợn con ăn sớm thức ăn tập ăn (creep feed) từ lúc 7 ngày tuổi dù lợn mẹ vẫn đang tiết sữa?',
      options: [
        'Để rèn luyện hệ thống enzyme tiêu hóa phát triển sớm, bù đắp dinh dưỡng khi sữa mẹ giảm dần từ tuần thứ 3 và giảm stress tiêu chảy khi cai sữa',
        'Để làm cho lợn mẹ ngừng tiết sữa hoàn toàn ngay từ ngày thứ bảy sau khi đẻ và chuyển sang mang thai lứa tiếp theo ngay lập tức',
        'Vì sữa của lợn mẹ từ ngày thứ bảy trở đi chỉ chứa toàn nước lã mà không còn bất kì chất dinh dưỡng hay khoáng chất nào',
        'Để lợn con có thể tự đi kiếm ăn ngoài đồng cỏ tự nhiên như trâu bò trưởng thành ngay từ khi mới được một tuần tuổi',
      ],
      correctIndex: 0,
      explanation:
        'Tập ăn sớm giúp hệ enzyme dạ dày – ruột lợn con phát triển quen với thức ăn thực vật, bù đắp dinh dưỡng và tránh khủng hoảng sau cai sữa.',
    },
    {
      number: 28,
      level: 'hieu',
      question:
        'Trong quy trình chăn nuôi theo tiêu chuẩn VietGAP (Bài 20), vì sao việc ghi chép đầy đủ sổ nhật kí chăn nuôi (giống, thức ăn, vắc-xin, thuốc thú y) và lưu trữ hồ sơ lại bắt buộc?',
      options: [
        'Để minh bạch quy trình sản xuất, phục vụ kiểm tra đánh giá chứng nhận và truy xuất chính xác nguồn gốc sản phẩm khi có sự cố an toàn thực phẩm',
        'Chỉ để trang trí tủ sách của văn phòng trang trại chứ không có bất kì giá trị thực tiễn nào đối với người tiêu dùng hay cơ quan quản lí',
        'Để thay thế hoàn toàn việc tiêm phòng vắc-xin và vệ sinh khử trùng chuồng trại trong suốt quá trình nuôi dưỡng vật nuôi',
        'Vì nếu ghi sổ nhật kí hàng ngày thì vật nuôi sẽ tự động lớn nhanh gấp đôi mà không cần phải tiêu tốn thức ăn hỗn hợp',
      ],
      correctIndex: 0,
      explanation:
        'Hồ sơ nhật kí chăn nuôi là căn cứ để truy xuất nguồn gốc sản phẩm, kiểm soát thời gian ngừng thuốc và chứng nhận VietGAP.',
    },
    {
      number: 29,
      level: 'hieu',
      question:
        'Tại sao trong khẩu phần ăn của bò sữa cao sản, người chăn nuôi luôn phải duy trì tỉ lệ thức ăn thô xanh (cỏ tươi, thức ăn ủ chua) hợp lí bên cạnh thức ăn tinh hỗn hợp?',
      options: [
        'Để duy trì hoạt động nhai lại, ổn định pH dạ cỏ cho vi sinh vật phân giải xơ tạo acid acetic tổng hợp chất béo sữa và phòng bệnh toan hóa dạ cỏ',
        'Vì thức ăn thô xanh có hàm lượng năng lượng trao đổi cao gấp mười lần hạt ngô vàng và khô dầu đậu tương ép',
        'Để làm cho sản lượng sữa của bò giảm đi một nửa nhằm tiết kiệm thời gian vận hành hệ thống máy vắt sữa tự động',
        'Vì bò sữa cao sản không có khả năng tiêu hóa được bất kì loại tinh bột hay protein nào có trong thức ăn tinh hỗn hợp',
      ],
      correctIndex: 0,
      explanation:
        'Thức ăn thô xanh kích thích nhai lại tiết nước bọt trung hòa acid dạ cỏ, cung cấp tiền chất tổng hợp mỡ sữa và chống bệnh acidosis.',
    },
    {
      number: 30,
      level: 'hieu',
      question:
        'Trong hệ thống vắt sữa tự động bằng robot ở trang trại bò sữa công nghệ cao (Bài 20), việc mỗi con bò đeo vòng cổ gắn chip điện tử giúp hệ thống thực hiện điều gì?',
      options: [
        'Tự động nhận diện từng cá thể bò, kiểm tra khoảng cách từ lần vắt trước, định lượng thức ăn tinh theo năng suất sữa và cảnh báo sớm bệnh viêm vú',
        'Phát sóng điện từ điều khiển bò sữa tự bay qua hàng rào chuồng nuôi để ra cánh đồng thu hoạch cỏ voi mang về kho',
        'Biến sữa tươi vừa vắt ra thành các hộp sữa bột đóng lon hoàn chỉnh ngay bên trong vòng cổ của con bò',
        'Thay thế hoàn toàn hệ thống cung cấp nước uống và hệ thống quạt thông gió làm mát ở bên trong chuồng nuôi bò sữa',
      ],
      correctIndex: 0,
      explanation:
        'Chip RFID gắn cổ giúp robot nhận diện cá thể bò, cấp thức ăn tinh theo năng suất sữa và đo độ dẫn điện sữa từng núm vú để phát hiện sớm viêm vú.',
    },
  ],
  'cn11-c6': [
    {
      number: 21,
      level: 'biet',
      question:
        'Theo Bài 21 SGK Công nghệ 11, các loại khí độc và khí gây mùi hôi thối phát sinh chủ yếu từ quá trình phân hủy chất thải chăn nuôi trong chuồng trại là',
      options: [
        'Khí ammonia (NH3), khí hydrogen sulfide (H2S), khí methane (CH4) và các hợp chất indole, skatole',
        'Khí oxygen tinh khiết (O2), khí helium (He), khí neon (Ne) và hơi nước cất vô trùng trong lành',
        'Khí ozone tầng bình lưu (O3) và các ion âm có lợi cho đường hô hấp của con người',
        'Hương thơm tinh dầu sả chanh và tinh dầu tràm trà tự nhiên bốc lên từ nền chuồng xi măng',
      ],
      correctIndex: 0,
      explanation:
        'Phân hủy chất thải chăn nuôi sinh ra NH3, H2S, CH4, CO2, indole, skatole gây ô nhiễm không khí và hại hô hấp vật nuôi (Bài 21 trang 110).',
    },
    {
      number: 22,
      level: 'biet',
      question:
        'Theo Bài 21 SGK Công nghệ 11, nhóm chất thải nào phát sinh từ hoạt động thú y trong trang trại được xếp vào nhóm chất thải nguy hại cần thu gom và xử lí riêng biệt?',
      options: [
        'Kim tiêm đã qua sử dụng, vỏ lọ vắc-xin, bao bì thuốc thú y, bông băng dính máu và xác vật nuôi mắc bệnh truyền nhiễm',
        'Phân trâu bò ăn cỏ tự nhiên đã được ủ hoai mục hoàn toàn dùng để bón lót cho vườn cây ăn quả',
        'Lá cây khô rụng trên đường nội bộ khu hành chính và nước mưa chảy tràn trên mái nhà kho chứa cỏ',
        'Vỏ trấu khô và mùn cưa gỗ thông sạch mới mua về chưa đưa vào sử dụng làm đệm lót chuồng nuôi',
      ],
      correctIndex: 0,
      explanation:
        'Vỏ lọ vắc-xin, kim tiêm, thuốc thú y, dụng cụ dính bệnh phẩm và xác vật nuôi chết do dịch bệnh là chất thải nguy hại (Bài 21 trang 111).',
    },
    {
      number: 23,
      level: 'biet',
      question:
        'Theo Bài 22 SGK Công nghệ 11, thành phần khí cháy chủ yếu có trong khí sinh học (biogas) thu được từ hầm ủ kị khí chất thải chăn nuôi là',
      options: [
        'Khí methane (CH4, chiếm khoảng 55% – 70% thể tích khí sinh học)',
        'Khí oxygen nguyên chất (O2, chiếm trên 95% thể tích khí sinh học)',
        'Khí nitrogen trơ (N2, chiếm hoàn toàn 100% thể tích khí sinh học)',
        'Khí chlorine (Cl2) dùng để khử trùng nước cấp sinh hoạt đô thị',
      ],
      correctIndex: 0,
      explanation:
        'Trong khí sinh học (biogas), khí methane (CH4) chiếm khoảng 55–70% có thể dùng làm nhiên liệu đun nấu hoặc chạy máy phát điện (Bài 22 trang 114).',
    },
    {
      number: 24,
      level: 'biet',
      question:
        'Theo Bài 22 SGK Công nghệ 11, kĩ thuật nuôi gia cầm hoặc lợn trên lớp vật liệu hữu cơ trơ (trấu, mùn cưa dày 20–50 cm) có phun chế phẩm vi sinh vật có ích để phân hủy phân tại chỗ gọi là',
      options: [
        'Chăn nuôi trên đệm lót sinh học (đệm lót vi sinh)',
        'Chăn nuôi trên sàn nhựa dội rửa nước liên tục hàng giờ',
        'Chăn nuôi thủy canh tuần hoàn trong bể chứa dung dịch khoáng',
        'Chăn nuôi lồng bè nổi trên các hồ thủy điện và vịnh biển kín',
      ],
      correctIndex: 0,
      explanation:
        'Đệm lót sinh học gồm lớp chất độn giàu xơ (trấu, mùn cưa) trộn chế phẩm VSV giúp đồng hóa phân và nước tiểu ngay tại nền chuồng (Bài 22 trang 115).',
    },
    {
      number: 25,
      level: 'biet',
      question:
        'Theo Bài 22 SGK Công nghệ 11, thiết bị cơ học dùng để tách riêng phần bã phân rắn và phần nước thải lỏng trước khi đưa nước thải vào hầm biogas ở các trang trại lợn quy mô lớn là',
      options: [
        'Máy ép tách phân (máy tách pha rắn – lỏng chất thải chăn nuôi)',
        'Máy nghiền búa nghiền hạt ngô và khô dầu đậu tương thành bột mịn',
        'Máy ấp trứng gia cầm tự động điều chỉnh nhiệt độ và đảo khay trứng',
        'Máy vắt sữa bò tự động dùng áp lực chân không theo nhịp sinh lí',
      ],
      correctIndex: 0,
      explanation:
        'Máy ép tách phân thu hồi bã rắn để ủ phân hữu cơ, còn phần nước lỏng đi vào hầm biogas giúp tránh đầy hầm và đóng váng (Bài 22 trang 113).',
    },
    {
      number: 26,
      level: 'hieu',
      question:
        'Vì sao việc xả trực tiếp nước thải chăn nuôi chưa qua xử lí (chứa nhiều chất hữu cơ, N, P) ra ao hồ, sông suối lại gây ra hiện tượng "phú dưỡng hóa" làm chết cá và thủy sinh vật?',
      options: [
        'Vì hàm lượng N, P cao làm tảo bùng phát quá mức rồi chết đi, vi sinh vật phân hủy xác tảo và chất hữu cơ làm cạn kiệt oxygen hòa tan (DO) trong nước',
        'Vì nước thải chăn nuôi làm cho nhiệt độ nước sông hồ ngay lập tức tăng vọt lên mức sôi 100 °C làm chín toàn bộ tôm cá',
        'Vì các chất hữu cơ trong phân vật nuôi hút sạch toàn bộ phân tử nước làm cho lòng sông hồ khô cạn trơ đáy chỉ sau một đêm',
        'Vì chất thải chăn nuôi làm độ mặn của nước ngọt tăng lên gấp mười lần độ mặn của nước biển đại dương',
      ],
      correctIndex: 0,
      explanation:
        'Nước thải chăn nuôi giàu N, P và chất hữu cơ gây phú dưỡng (tảo nở hoa), tiêu thụ hết oxygen hòa tan (DO) và sinh khí độc NH3, H2S làm cá chết.',
    },
    {
      number: 27,
      level: 'hieu',
      question:
        'Tại sao nước thải sau khi đi ra khỏi bể biogas (nước sau biogas) vẫn chưa được phép xả thẳng ra kênh mương công cộng mà cần qua hệ thống hồ sinh học hoặc tưới cây có kiểm soát?',
      options: [
        'Vì nước sau biogas vẫn còn hàm lượng ammonium (NH4+), phosphorus và chất hữu cơ hòa tan cao vượt quy chuẩn xả thải trực tiếp ra nguồn nước mặt',
        'Vì nước sau biogas đã biến thành xăng dầu nguyên chất rất dễ bắt lửa cháy nổ khi tiếp xúc với ánh nắng mặt trời',
        'Vì bên trong nước sau biogas có chứa nồng độ acid sulfuric đậm đặc có thể ăn mòn thủng toàn bộ bờ đất kênh mương',
        'Vì nước sau biogas hoàn toàn vô trùng và tinh khiết hơn nước cất y tế nên nếu xả ra sông sẽ làm lãng phí nước uống',
      ],
      correctIndex: 0,
      explanation:
        'Nước sau biogas vẫn còn nồng độ N (NH4+) và P hòa tan rất cao; cần tiếp tục xử lí qua hồ sinh học thực vật hoặc dùng tưới cây nông nghiệp.',
    },
    {
      number: 28,
      level: 'hieu',
      question:
        'Trong quá trình vận hành công trình khí sinh học (biogas), vì sao người chăn nuôi cần hạn chế để một lượng lớn thuốc sát trùng chuồng trại hoặc kháng sinh đậm đặc chảy vào hầm ủ?',
      options: [
        'Vì hóa chất sát trùng và kháng sinh sẽ tiêu diệt hoặc ức chế hệ vi sinh vật kị khí (đặc biệt là vi khuẩn sinh methane), làm hầm ngừng sinh khí gas',
        'Vì thuốc sát trùng khi gặp khí methane trong hầm biogas sẽ ngay lập tức biến toàn bộ bùn đáy hầm thành kim loại rắn',
        'Vì kháng sinh làm cho hệ vi sinh vật trong hầm biogas sinh sản nhanh gấp một trăm lần gây nổ tung nắp hầm chỉ sau một giờ',
        'Vì hóa chất sát trùng làm cho khí methane chuyển hóa hết thành khí thơm hương hoa nhài không thể đốt cháy trên bếp gas',
      ],
      correctIndex: 0,
      explanation:
        'Quá trình sinh khí biogas phụ thuộc vào hệ vi khuẩn kị khí và cổ khuẩn sinh methane; hóa chất sát trùng mạnh chảy vào hầm sẽ diệt VSV làm "chết" hầm.',
    },
    {
      number: 29,
      level: 'hieu',
      question:
        'Tại sao mô hình kinh tế tuần hoàn "Vườn – Ao – Chuồng – Biogas" (VACB) lại được đánh giá là giải pháp bền vững điển hình cho chăn nuôi nông hộ và trang trại ở Việt Nam?',
      options: [
        'Vì chất thải của khâu chăn nuôi được xử lí qua biogas và ủ phân thành đầu vào (năng lượng, phân bón, thức ăn) cho trồng trọt và thủy sản, giảm tối đa phát thải',
        'Vì mô hình này cho phép xây dựng chuồng lợn nằm ngay phía trên mặt giếng nước uống sinh hoạt của gia đình để tiết kiệm diện tích đất',
        'Vì trong mô hình VACB người nông dân không cần cho vật nuôi ăn và không cần chăm sóc cây trồng mà vẫn thu hoạch quanh năm',
        'Vì mô hình này giúp loại bỏ hoàn toàn sự xuất hiện của các loài vi sinh vật phân giải trong môi trường đất và nước',
      ],
      correctIndex: 0,
      explanation:
        'Mô hình VACB khép kín vòng tuần hoàn vật chất: chất thải chăn nuôi -> Biogas (nhiên liệu) + phân hữu cơ bón cây + nuôi giun/cá -> phụ phẩm vườn làm thức ăn.',
    },
    {
      number: 30,
      level: 'hieu',
      question:
        'Khi sử dụng đệm lót sinh học trong chăn nuôi gà hoặc lợn (Bài 22), vì sao cần định kì cào xới mặt đệm lót và tránh để nước uống rò rỉ làm ướt sũng đệm lót?',
      options: [
        'Để cung cấp oxygen và duy trì độ ẩm thích hợp (~40–50%) cho vi sinh vật hiếu khí hoạt động phân giải phân; nếu ướt sũng sẽ chuyển sang yếm khí gây thối và mốc',
        'Để làm cho toàn bộ lớp trấu và mùn cưa bay lên lơ lửng trong không khí giúp gà hít thở nhiều bụi gỗ hơn mỗi ngày',
        'Vì nếu đệm lót bị ướt nước thì các vi sinh vật có ích sẽ tự động biến thành các loài côn trùng cánh cứng cắn chân vật nuôi',
        'Để hạ nhiệt độ của lớp đệm lót xuống dưới 0 °C nhằm bảo quản đông lạnh phân tươi ngay trên nền chuồng nuôi',
      ],
      correctIndex: 0,
      explanation:
        'VSV trong đệm lót sinh học chủ yếu là hiếu khí cần độ thoáng khí và độ ẩm vừa phải; nếu rò nước làm ướt sũng sẽ thiếu O2, phát sinh khí độc NH3 và nấm mốc.',
    },
  ],
};

/**
 * Ngân hàng 4 câu Đúng/Sai cho từng chương Lớp 11 (6 chương × 4 câu = 24 câu Đúng/Sai).
 * Mỗi câu gồm:
 * - Tình huống thực tế (context) bám sát nội dung chương SGK Công nghệ 11 – Công nghệ Chăn nuôi (Kết nối tri thức)
 * - Dẫn nguồn cụ thể (citation) từ cơ quan nghiên cứu / tạp chí chuyên ngành uy tín
 * - 4 ý mệnh đề (1 ý Nhận biết 'biet', 1 ý Thông hiểu 'hieu', 2 ý Vận dụng 'vandung')
 */
export const CHAPTER_TF_11: Record<string, ChapterTFQuestion[]> = {
  'cn11-c1': [
    {
      number: 1,
      context:
        'Tình huống thực tế: Tổ hợp trang trại chăn nuôi bò sữa công nghệ cao tại huyện Nghĩa Đàn (tỉnh Nghệ An) và huyện Mộc Châu (tỉnh Sơn La) đang nuôi hàng chục nghìn con bò sữa cao sản thuần chủng Holstein Friesian (HF) nhập nội. Mỗi con bò được gắn một vòng cổ tích hợp chip cảm biến (Pedometer/RFID) kết nối về trung tâm dữ liệu để theo dõi bước chân (phát hiện động dục), thời gian nhai lại, nhiệt độ cơ thể và sản lượng sữa từng ca vắt; chuồng nuôi trang bị quạt làm mát tự động và hệ thống phun sương khi nhiệt độ vượt 26 °C. Năng suất sữa trung bình đạt từ 9.500 đến 10.500 lít/con/chu kì 305 ngày.',
      citation:
        'Nguồn: Cục Chăn nuôi (Bộ NN&PTNT) & Viện Chăn nuôi Quốc gia (NIAS) – Báo cáo ứng dụng công nghệ cao 4.0 trong chăn nuôi bò sữa công nghiệp tại Việt Nam, 2024.',
      statements: [
        {
          label: 'a',
          level: 'biet',
          text: 'Bò sữa Holstein Friesian (HF) nuôi tại trang trại thuộc nhóm giống vật nuôi nhập nội, gia súc nhai lại (dạ dày 4 túi) và có hướng sản xuất chuyên sữa.',
          isTrue: true,
          explanation:
            'Theo Bài 2 SGK Công nghệ 11, bò HF có nguồn gốc từ Hà Lan (nhập nội), thuộc nhóm gia súc ăn cỏ nhai lại và chuyên dụng hướng sữa.',
        },
        {
          label: 'b',
          level: 'hieu',
          text: 'Hệ thống làm mát chuồng tự động đóng vai trò sống còn vì bò sữa HF có nguồn gốc ôn đới, rất mẫn cảm với stress nhiệt ở khí hậu nóng ẩm Việt Nam.',
          isTrue: true,
          explanation:
            'Bò HF chịu nóng kém (nhiệt độ thích hợp 10–22 °C); nếu nhiệt độ chuồng > 28–30 °C bò sẽ giảm ăn, giảm thời gian nhai lại và tụt sản lượng sữa.',
        },
        {
          label: 'c',
          level: 'vandung',
          text: 'Khi chip cảm biến báo một con bò đột ngột giảm mạnh thời gian nhai lại trong ngày kèm tăng nhiệt độ cơ thể, phần mềm sẽ cảnh báo sớm cho bác sĩ thú y tách cá thể đó kiểm tra bệnh trước khi triệu chứng lâm sàng nặng xuất hiện.',
          isTrue: true,
          explanation:
            'Theo dõi thời gian nhai lại và thân nhiệt theo thời gian thực bằng chip IoT giúp phát hiện sớm rối loạn tiêu hóa, viêm vú hoặc sốt nhiễm trùng.',
        },
        {
          label: 'd',
          level: 'vandung',
          text: 'Vì đã có hệ thống tự động hóa hiện đại nên trang trại có thể chuyển đàn bò HF cao sản sang phương thức chăn thả tự do hoàn toàn trong rừng tự nhiên không cần chuồng trại hay thức ăn hỗn hợp.',
          isTrue: false,
          explanation:
            'Bò sữa HF cao sản đòi hỏi khẩu phần TMR cân đối nghiêm ngặt và tiểu khí hậu mát mẻ; thả rông tự do thiếu dinh dưỡng và nắng nóng sẽ làm bò suy kiệt và mất sữa.',
        },
      ],
    },
    {
      number: 2,
      context:
        'Tình huống thực tế: Chương trình bảo tồn và khai thác nguồn gene vật nuôi bản địa tại miền Bắc Việt Nam đang duy trì các đàn hạt nhân giống Gà Đông Tảo (Hưng Yên), Gà Hồ (Bắc Ninh), Gà Mía (Sơn Tây) và Lợn Móng Cái (Quảng Ninh). Mặc dù gà Mía và gà Ri bản địa có tốc độ sinh trưởng chậm hơn giống gà công nghiệp lông trắng Ross 308 (gà Ross 308 nuôi 42 ngày đạt 2,5–2,8 kg, trong khi gà bản địa nuôi 4–5 tháng mới đạt 1,6–2,0 kg), nhưng các hợp tác xã nuôi gà bản địa theo phương thức bán chăn thả (có chuồng kết hợp vườn cây vận động) vẫn thu lợi nhuận ổn định nhờ giá bán thịt thương phẩm cao gấp 2–3 lần gà công nghiệp.',
      citation:
        'Nguồn: Viện Chăn nuôi Quốc gia (NIAS) – Chương trình bảo tồn và sử dụng bền vững nguồn gene vật nuôi bản địa Việt Nam giai đoạn 2021–2025, Bộ NN&PTNT.',
      statements: [
        {
          label: 'a',
          level: 'biet',
          text: 'Mô hình nuôi gà có chuồng trại kiên cố kết hợp sân vườn chăn thả có kiểm soát và bổ sung thức ăn hỗn hợp thuộc phương thức chăn nuôi bán công nghiệp (bán thâm canh).',
          isTrue: true,
          explanation:
            'Theo Bài 2 SGK Công nghệ 11 (trang 15), chăn nuôi bán công nghiệp kết hợp nuôi chuồng với bãi chăn thả và thức ăn công nghiệp.',
        },
        {
          label: 'b',
          level: 'hieu',
          text: 'Các giống gà nội (Đông Tảo, Hồ, Mía, Ri) được người tiêu dùng ưa chuộng và có giá trị kinh tế cao vì chất lượng thịt thơm ngon, săn chắc, đồng thời lưu giữ các gene quý về khả năng kháng bệnh và thích nghi khí hậu nhiệt đới.',
          isTrue: true,
          explanation:
            'Giống bản địa tuy năng suất thấp hơn giống ngoại nhưng có ưu thế vượt trội về hương vị thịt đặc sản và sức đề kháng.',
        },
        {
          label: 'c',
          level: 'vandung',
          text: 'Để vừa giữ được hương vị thịt thơm ngon của gà nội vừa cải thiện tốc độ lớn và sản lượng trứng, các trung tâm giống thường dùng gà Ri/gà Mía làm nền để lai tạo với các dòng gà lông màu năng suất cao tạo con lai thương phẩm.',
          isTrue: true,
          explanation:
            'Lai kinh tế giữa gà nội và gà ngoại lông màu giúp kết hợp chất lượng thịt ngon, dễ nuôi của gà nội với tốc độ tăng trưởng nhanh của gà ngoại.',
        },
        {
          label: 'd',
          level: 'vandung',
          text: 'Để nâng cao hiệu quả kinh tế ngành chăn nuôi, các địa phương nên xóa bỏ hoàn toàn việc nuôi bảo tồn các giống lợn Móng Cái, gà Đông Tảo, gà Hồ và thay thế 100% bằng giống gà công nghiệp lông trắng.',
          isTrue: false,
          explanation:
            'Xóa bỏ các giống bản địa sẽ làm mất vĩnh viễn nguồn gene quý hiếm không thể phục hồi và đánh mất phân khúc sản phẩm đặc sản giá trị cao.',
        },
      ],
    },
    {
      number: 3,
      context:
        'Tình huống thực tế: Tại một nhà máy giết mổ và chế biến thịt lợn xuất khẩu đạt chuẩn ở tỉnh Hà Nam và tỉnh Đồng Nai, quy trình đảm bảo "Phúc lợi động vật" (Animal Welfare) được kiểm soát nghiêm ngặt: Lợn thương phẩm được vận chuyển bằng xe chuyên dụng có mái che và quạt thông gió vào lúc trời mát; khi về nhà máy lợn được nghỉ ngơi trong chuồng chờ yên tĩnh, uống nước đầy đủ và tắm mát 4–6 giờ, tuyệt đối không dùng roi điện đánh đập xua đuổi, sau đó được gây ngất nhân đạo bằng khí CO2 (hoặc dòng điện chuẩn) trước khi giết mổ. Kết quả kiểm tra chất lượng thân thịt cho thấy tỉ lệ thịt mắc hội chứng PSE (thịt nhạt màu, mềm nhão, rỉ dịch) giảm từ 18% xuống dưới 1,5%.',
      citation:
        'Nguồn: Cục Thú y & Tổ chức Thú y Thế giới (WOAH) – Tiêu chuẩn phúc lợi động vật trong vận chuyển và giết mổ gia súc, Tạp chí Khoa học Kỹ thuật Thú y, 2023.',
      statements: [
        {
          label: 'a',
          level: 'biet',
          text: 'Việc không đánh đập, đảm bảo vật nuôi không bị khát, nóng bức, hoảng sợ khi vận chuyển và gây ngất nhân đạo trước giết mổ là nội dung thực hành đảm bảo phúc lợi động vật trong chăn nuôi.',
          isTrue: true,
          explanation:
            'Theo Bài 2 SGK Công nghệ 11 (trang 16–17), phúc lợi động vật yêu cầu đối xử nhân đạo trong suốt quá trình nuôi, vận chuyển và giết mổ.',
        },
        {
          label: 'b',
          level: 'hieu',
          text: 'Khi lợn bị hoảng loạn và stress cấp tính ngay trước lúc giết mổ, glycogen trong cơ bị phân giải yếm khí quá nhanh sinh nhiều acid lactic làm pH thịt tụt thấp khi thân thịt còn nóng, gây biến tính protein cơ tạo thành thịt PSE.',
          isTrue: true,
          explanation:
            'Stress cấp tính trước giết mổ làm pH cơ giảm nhanh (< 5,6 trong 45 phút đầu) ở nhiệt độ cơ cao (> 38 °C), làm cơ mất khả năng giữ nước (PSE).',
        },
        {
          label: 'c',
          level: 'vandung',
          text: 'Thực hiện tốt phúc lợi động vật không chỉ thể hiện tính nhân văn mà còn trực tiếp nâng cao hiệu quả kinh tế cho doanh nghiệp nhờ giảm tỉ lệ hao hụt khối lượng vận chuyển và tăng tỉ lệ thịt đủ tiêu chuẩn xuất khẩu.',
          isTrue: true,
          explanation:
            'Giảm stress giúp giảm tỉ lệ chết khi vận chuyển, giảm vết bầm tụ máu và loại bỏ thịt lỗi PSE/DFD, nâng cao giá trị thương phẩm.',
        },
        {
          label: 'd',
          level: 'vandung',
          text: 'Để vận chuyển được nhiều lợn hơn trong một chuyến xe vào buổi trưa hè 39 °C, chủ xe nên nhồi nhét lợn đứng chồng lên nhau gấp đôi định mức và dùng gậy điện chích liên tục cho lợn chạy nhanh lên thùng xe.',
          isTrue: false,
          explanation:
            'Nhồi nhét quá mật độ dưới nắng nóng 39 °C và dùng gậy điện sẽ gây sốc nhiệt chết hàng loạt trên xe và làm hỏng hoàn toàn chất lượng thịt.',
        },
      ],
    },
    {
      number: 4,
      context:
        'Tình huống thực tế: Một doanh nghiệp chăn nuôi lợn quy mô 2.000 lợn nái và 20.000 lợn thịt tại tỉnh Bình Phước xây dựng mô hình chăn nuôi bền vững khép kín: Tuyển dụng đội ngũ kĩ sư chăn nuôi, bác sĩ thú y và kĩ sư vận hành tự động hóa; áp dụng chuồng kín lạnh hoàn toàn; toàn bộ chất thải được xử lí qua hệ thống máy ép tách phân (phần rắn ủ phân hữu cơ vi sinh cung cấp cho các vườn cao su, hồ tiêu; phần lỏng vào hầm Biogas phủ bạt HDPE chạy máy phát điện cung cấp 70% điện năng cho trại).',
      citation:
        'Nguồn: Cục Chăn nuôi (Bộ NN&PTNT) – Chiến lược phát triển chăn nuôi giai đoạn 2021–2030, tầm nhìn 2045 theo hướng công nghiệp công nghệ cao và kinh tế tuần hoàn.',
      statements: [
        {
          label: 'a',
          level: 'biet',
          text: 'Hoạt động của trang trại trên có sự tham gia của nhiều ngành nghề thuộc lĩnh vực chăn nuôi như kĩ sư chăn nuôi, bác sĩ thú y và kĩ thuật viên vận hành thiết bị chăn nuôi.',
          isTrue: true,
          explanation:
            'Theo Bài 1 SGK Công nghệ 11 (trang 9–10), lĩnh vực chăn nuôi gồm các nghề nghiên cứu giống, dinh dưỡng, chăn nuôi – thú y và kĩ thuật thiết bị.',
        },
        {
          label: 'b',
          level: 'hieu',
          text: 'Mô hình của doanh nghiệp đáp ứng tiêu chí chăn nuôi bền vững vì kết hợp hài hòa giữa hiệu quả kinh tế cao, an toàn dịch bệnh và tái tạo năng lượng – bảo vệ môi trường sinh thái.',
          isTrue: true,
          explanation:
            'Theo Bài 2 SGK Công nghệ 11 (trang 16), chăn nuôi bền vững phải đảm bảo kinh tế, xã hội – phúc lợi động vật và bảo vệ môi trường.',
        },
        {
          label: 'c',
          level: 'vandung',
          text: 'Việc thu hồi khí methane (CH4) từ hầm Biogas để chạy máy phát điện vừa giúp trang trại tiết kiệm hàng trăm triệu đồng tiền điện mỗi năm, vừa ngăn chặn khí nhà kính CH4 phát tán trực tiếp vào khí quyển.',
          isTrue: true,
          explanation:
            'Khí CH4 có tiềm năng gây hiệu ứng nhà kính cao gấp ~28 lần CO2; đốt CH4 phát điện vừa tạo năng lượng sạch vừa giảm phát thải khí nhà kính.',
        },
        {
          label: 'd',
          level: 'vandung',
          text: 'Trong trang trại công nghệ cao này, người lao động không cần có kiến thức chuyên môn về sinh lí vật nuôi hay an toàn sinh học mà chỉ cần biết nhấn nút bật/tắt cầu giao điện.',
          isTrue: false,
          explanation:
            'Bài 1 SGK Công nghệ 11 nêu rõ người lao động chăn nuôi hiện đại phải có kiến thức chuyên môn vững, kĩ năng công nghệ cao và đạo đức nghề nghiệp.',
        },
      ],
    },
  ],
  'cn11-c2': [
    {
      number: 1,
      context:
        'Tình huống thực tế: Trung tâm Nghiên cứu Lợn Thụy Phương (Viện Chăn nuôi Quốc gia) thực hiện chương trình chọn lọc nâng cao năng suất các dòng lợn đực giống ngoại thuần chủng Duroc và Pietrain. Khi đàn lợn đực hậu bị đạt giai đoạn từ 30 kg đến 100 kg, trung tâm tiến hành "Kiểm tra năng suất cá thể (kiểm tra bản thân)" bằng máy siêu âm đo độ dày mỡ lưng và thăn thịt trên cơ thể sống, tính tốc độ tăng khối lượng hàng ngày và hệ số tiêu tốn thức ăn (FCR). Sau đó, những cá thể đực xuất sắc nhất tiếp tục được đưa vào khai thác tinh để "Kiểm tra đực giống qua đời sau".',
      citation:
        'Nguồn: Viện Chăn nuôi Quốc gia (NIAS) – Quy trình kiểm tra năng suất cá thể và đánh giá giá trị giống lợn (BLUP), Tạp chí Khoa học Công nghệ Chăn nuôi, 2023.',
      statements: [
        {
          label: 'a',
          level: 'biet',
          text: 'Phương pháp chọn giống kết hợp đánh giá bản thân, phả hệ tổ tiên và kiểm tra chất lượng đời con được áp dụng tại trung tâm là phương pháp chọn lọc cá thể.',
          isTrue: true,
          explanation:
            'Theo Bài 4 SGK Công nghệ 11 (trang 22–23), chọn lọc cá thể gồm đánh giá tổ tiên, kiểm tra bản thân và kiểm tra đực giống qua đời sau.',
        },
        {
          label: 'b',
          level: 'hieu',
          text: 'Bước "Kiểm tra đực giống qua đời sau" là bước quyết định nhất để khẳng định phẩm chất di truyền của lợn đực giống vì kiểu hình của một cá thể có thể bị ảnh hưởng bởi môi trường nuôi dưỡng, còn năng suất của đàn con phản ánh chính xác giá trị kiểu gene truyền lại.',
          isTrue: true,
          explanation:
            'Một con đực có ngoại hình đẹp chưa chắc đã truyền đạt tốt các gene năng suất cho đời con; kiểm tra đời con giúp xác định chính xác giá trị giống.',
        },
        {
          label: 'c',
          level: 'vandung',
          text: 'Trong số 2 cá thể lợn đực Duroc có cùng tốc độ tăng trọng từ 30–100 kg trong 70 ngày: Cá thể A có độ dày mỡ lưng 9,5 mm và FCR = 2,15 kg thức ăn/kg tăng trọng; Cá thể B có độ dày mỡ lưng 16,0 mm và FCR = 2,75 kg thức ăn/kg tăng trọng, thì kĩ sư giống cần chọn Cá thể A làm đực giống hạt nhân.',
          isTrue: true,
          explanation:
            'Đối với lợn hướng nạc (Duroc), độ dày mỡ lưng càng mỏng (tỉ lệ nạc cao) và hệ số tiêu tốn thức ăn FCR càng thấp thì hiệu quả kinh tế càng cao.',
        },
        {
          label: 'd',
          level: 'vandung',
          text: 'Đối với các trang trại nuôi lợn thịt thương phẩm đại trà quy mô hàng vạn con xuất bán cho lò mổ, người nuôi bắt buộc phải thực hiện đầy đủ bước kiểm tra qua đời sau cho từng con lợn thịt trước khi xuất bán.',
          isTrue: false,
          explanation:
            'Chọn lọc cá thể (kiểm tra đời sau) tốn nhiều thời gian, chi phí nên chỉ áp dụng ở trại giống hạt nhân chọn đực/cái giống; đàn thương phẩm chỉ áp dụng chọn lọc hàng loạt.',
        },
      ],
    },
    {
      number: 2,
      context:
        'Tình huống thực tế: Tại các vùng chăn nuôi lợn hàng hóa ở Việt Nam, các trang trại áp dụng phổ biến công thức lai kinh tế 3 giống (hoặc 4 giống) để sản xuất lợn thịt thương phẩm: Dùng lợn nái giống Landrace (L) phối với đực giống Yorkshire (Y) tạo ra con lai cái F1 (LY). Sau đó, dùng toàn bộ đàn nái lai F1 (LY) có khả năng sinh sản sai con, tiết sữa tốt phối với đực giống cuối cùng là giống Duroc (D) để tạo ra đàn lợn con lai 3 máu (LYD) nuôi lấy thịt thương phẩm xuất chuồng lúc 100–110 kg.',
      citation:
        'Nguồn: Cục Chăn nuôi (Bộ NN&PTNT) – Sổ tay hướng dẫn công thức lai kinh tế trong chăn nuôi lợn ngoại hướng nạc tại Việt Nam, 2023.',
      statements: [
        {
          label: 'a',
          level: 'biet',
          text: 'Phép lai giữa các giống lợn khác nhau (Landrace × Yorkshire × Duroc) để toàn bộ con lai cuối cùng (LYD) dùng nuôi lấy thịt thương phẩm gọi là phương pháp lai kinh tế.',
          isTrue: true,
          explanation:
            'Theo Bài 5 SGK Công nghệ 11 (trang 26), lai kinh tế là phép lai giữa các cá thể khác giống để tạo con lai có ưu thế lai cao dùng làm sản phẩm thương phẩm.',
        },
        {
          label: 'b',
          level: 'hieu',
          text: 'Công thức lai 3 giống (LY × D) hiệu quả hơn lai 2 giống đơn giản vì vừa khai thác được ưu thế lai về ngoại hình, tốc độ lớn, tỉ lệ nạc cao của đực cuối Duroc, vừa khai thác được ưu thế lai về khả năng sinh sản, nuôi con khéo của mẹ lai F1 (LY).',
          isTrue: true,
          explanation:
            'Nái lai F1 (LY) có ưu thế lai về sinh sản (đẻ nhiều con, nhiều sữa), kết hợp với đực Duroc chuyên thịt siêu nạc giúp tối ưu cả số con cai sữa và chất lượng thịt.',
        },
        {
          label: 'c',
          level: 'vandung',
          text: 'Toàn bộ đàn lợn con lai 3 máu (LYD) sinh ra đều được nuôi vỗ béo để xuất bán thịt thương phẩm chứ tuyệt đối không giữ lại làm lợn đực giống hay nái giống cho thế hệ tiếp theo.',
          isTrue: true,
          explanation:
            'Con lai kinh tế cuối cùng (LYD) có kiểu gene dị hợp cao; nếu giữ lại làm giống sẽ bị phân li tính trạng ở đời sau làm giảm năng suất và độ đồng đều.',
        },
        {
          label: 'd',
          level: 'vandung',
          text: 'Nếu một trang trại không nhập tinh lợn giống thuần mà cứ lấy lợn đực và lợn cái trong cùng một đàn con lai (cùng cha mẹ ruột) cho giao phối cận huyết liên tục 5 đời thì đàn lợn sẽ ngày càng to khỏe và kháng bệnh tốt hơn.',
          isTrue: false,
          explanation:
            'Giao phối cận huyết liên tục làm các gene lặn có hại chuyển sang trạng thái đồng hợp tử, gây suy thoái giống (quái thai, sức sống kém, giảm sinh sản).',
        },
      ],
    },
    {
      number: 3,
      context:
        'Tình huống thực tế: Tại đàn bò cái nền địa phương ở tỉnh Bình Định và tỉnh Hà Nội (bò Lai Sind có tầm vóc trung bình 250–280 kg, tỉ lệ thịt xẻ khoảng 46–48%, chịu nhiệt và kham khổ rất tốt), ngành nông nghiệp địa phương đã triển khai dự án "Thụ tinh nhân tạo bò thịt chất lượng cao". Dẫn tinh viên sử dụng tinh bò đực giống BBB (Blanc Bleu Belge của Bỉ) bảo quản đông lạnh trong cọng rạ ở bình nitrogen lỏng (-196 °C), giải đông ở nước ấm 37 °C trong 30 giây rồi phối cho bò cái nền Lai Sind đang động dục, tạo ra bê lai F1 BBB có khối lượng trưởng thành đạt 500–600 kg và tỉ lệ thịt xẻ đạt trên 60%.',
      citation:
        'Nguồn: Công ty Cổ phần Giống gia súc Hà Nội & Sở NN&PTNT Bình Định – Kết quả dự án lai tạo bò BBB trên nền bò cái Lai Sind bằng thụ tinh nhân tạo, 2024.',
      statements: [
        {
          label: 'a',
          level: 'biet',
          text: 'Kĩ thuật sử dụng dụng cụ chuyên dụng đưa tinh dịch đã qua kiểm tra, pha loãng và bảo quản của bò đực BBB vào đường sinh dục bò cái Lai Sind đang động dục là công nghệ thụ tinh nhân tạo.',
          isTrue: true,
          explanation:
            'Theo Bài 6 SGK Công nghệ 11 (trang 29–30), thụ tinh nhân tạo sử dụng thiết bị kĩ thuật đưa tinh dịch đực giống vào cơ quan sinh dục cái.',
        },
        {
          label: 'b',
          level: 'hieu',
          text: 'Việc áp dụng thụ tinh nhân tạo bằng tinh đông lạnh giúp nông dân ở khắp các tỉnh thành sử dụng được nguồn gene bò đực giống BBB cao sản của thế giới mà không cần phải nuôi trực tiếp bò đực ngoại đắt tiền tại hộ gia đình, đồng thời khắc phục sự chênh lệch tầm vóc quá lớn giữa bò đực BBB (1.000 kg) và bò cái Lai Sind (260 kg).',
          isTrue: true,
          explanation:
            'Bò đực BBB nặng trên 1 tấn không thể nhảy phối trực tiếp cho bò cái Lai Sind nhỏ bé; thụ tinh nhân tạo giải quyết triệt để rào cản tầm vóc và không gian.',
        },
        {
          label: 'c',
          level: 'vandung',
          text: 'Một con bò đực giống cao sản nếu nhảy phối trực tiếp chỉ phối được cho khoảng 40–50 bò cái/năm, nhưng khi khai thác làm tinh đông lạnh phục vụ thụ tinh nhân tạo có thể phối giống cho từ 5.000 đến 10.000 bò cái/năm.',
          isTrue: true,
          explanation:
            'Pha loãng và đông lạnh tinh dịch giúp nhân rộng hiệu suất sử dụng đực giống ưu tú lên hàng trăm lần (Bài 6 trang 29).',
        },
        {
          label: 'd',
          level: 'vandung',
          text: 'Khi lấy cọng tinh đông lạnh từ bình nitrogen lỏng (-196 °C) ra để phối giống, dẫn tinh viên nên nhúng cọng tinh vào cốc nước đang sôi 100 °C trong 2 phút để tinh trùng rã đông nhanh nhất.',
          isTrue: false,
          explanation:
            'Giải đông tinh đông lạnh bắt buộc phải thực hiện ở nhiệt độ sinh lí khoảng 35–38 °C; nhúng vào nước sôi 100 °C sẽ nấu chín và giết chết 100% tinh trùng.',
        },
      ],
    },
    {
      number: 4,
      context:
        'Tình huống thực tế: Trung tâm Nghiên cứu Bò và Đồng cỏ Ba Vì (Hà Nội) áp dụng quy trình công nghệ cấy truyền phôi kết hợp chỉ thị phân tử (MAS) để nhân nhanh đàn bò sữa hạt nhân cao sản: Chọn bò cái HF hạt nhân có năng suất sữa > 11.000 lít/chu kì (đã xét nghiệm chỉ thị phân tử mang kiểu gene đồng hợp tử Kappa-casein BB cho hàm lượng đạm sữa cao) làm "bò cho phôi". Sau khi tiêm hormone FSH gây siêu bài noãn và phối bằng tinh phân giới tính cái, kĩ thuật viên thu được 10 phôi tốt ở ngày thứ 7 rồi cấy sang tử cung của 10 "bò cái nhận phôi" khỏe mạnh đã được xử lí đồng pha động dục.',
      citation:
        'Nguồn: Viện Chăn nuôi Quốc gia (NIAS) – Ứng dụng công nghệ cấy truyền phôi và chỉ thị phân tử (MAS) trong chọn tạo đàn bò sữa hạt nhân tại Việt Nam, 2023.',
      statements: [
        {
          label: 'a',
          level: 'biet',
          text: 'Quy trình trên đã ứng dụng kết hợp 3 công nghệ sinh học hiện đại trong nhân giống vật nuôi gồm: Công nghệ cấy truyền phôi, Công nghệ xác định giới tính tinh trùng và Công nghệ chọn giống bằng chỉ thị phân tử (MAS).',
          isTrue: true,
          explanation:
            'Theo Bài 6 SGK Công nghệ 11 (trang 32–35), đây là các công nghệ sinh học mũi nhọn trong chọn và nhân giống vật nuôi.',
        },
        {
          label: 'b',
          level: 'hieu',
          text: 'Những con bê cái sinh ra từ 10 con bò cái nhận phôi (mang thai hộ) sẽ mang hoàn toàn đặc tính di truyền cao sản của cặp bò bố mẹ cho phôi chứ không mang hệ gene của bò cái nhận phôi.',
          isTrue: true,
          explanation:
            'Bò cái nhận phôi chỉ đóng vai trò nuôi dưỡng phôi trong tử cung (mang thai hộ); toàn bộ vật chất di truyền trong nhân của bê con nhận từ tinh trùng và trứng của bố mẹ cho phôi.',
        },
        {
          label: 'c',
          level: 'vandung',
          text: 'Nếu bình thường 1 bò cái HF cao sản mỗi năm chỉ đẻ được 1 bê con, thì nhờ kĩ thuật gây siêu bài noãn và cấy truyền phôi (thực hiện 3–4 đợt thu phôi/năm), từ 1 bò cái hạt nhân có thể tạo ra 20–30 bê con cao sản mỗi năm.',
          isTrue: true,
          explanation:
            'Cấy truyền phôi giúp khai thác tối đa tiềm năng di truyền của con cái cao sản tương tự như thụ tinh nhân tạo khai thác con đực (Bài 6 trang 32).',
        },
        {
          label: 'd',
          level: 'vandung',
          text: 'Khi chọn 10 con bò cái nhận phôi, kĩ thuật viên nên chọn những con bò cái đang mắc bệnh viêm nội mạc tử cung mãn tính và không cần xử lí đồng pha động dục với bò cho phôi.',
          isTrue: false,
          explanation:
            'Bò nhận phôi bắt buộc phải khỏe mạnh, cơ quan sinh sản hoàn toàn bình thường và phải đồng pha động dục với bò cho phôi thì phôi mới làm tổ và phát triển được.',
        },
      ],
    },
  ],
  'cn11-c3': [
    {
      number: 1,
      context:
        'Tình huống thực tế: Một nhà máy sản xuất thức ăn chăn nuôi công nghiệp tại tỉnh Hưng Yên thiết kế công thức thức ăn hỗn hợp hoàn chỉnh cho 2 đối tượng khác nhau: (1) Thức ăn cho lợn con tập ăn – cai sữa (khối lượng 5–15 kg) có mức năng lượng trao đổi ME = 3.300 kcal/kg, tỉ lệ Protein thô = 20–21%, Xơ thô ≤ 4%, có bổ sung bột sữa, Lysine, Methionine và enzyme tiêu hóa; (2) Thức ăn cho gà mái đẻ trứng thương phẩm giai đoạn đẻ rộ có ME = 2.750 kcal/kg, Protein thô = 17%, nhưng hàm lượng khoáng Calcium (Ca) được nâng cao lên mức 3,8–4,2% (cao gấp 4 lần so với thức ăn gà thịt).',
      citation:
        'Nguồn: Bộ Nông nghiệp và Phát triển nông thôn – Quy chuẩn kĩ thuật quốc gia QCVN 01-183:2016/BNNPTNT về thức ăn hỗn hợp cho lợn và gia cầm & Tiêu chuẩn Việt Nam TCVN.',
      statements: [
        {
          label: 'a',
          level: 'biet',
          text: 'Hai loại thức ăn do nhà máy sản xuất thuộc nhóm thức ăn hỗn hợp hoàn chỉnh, người chăn nuôi mua về cho vật nuôi ăn trực tiếp và chỉ cần cung cấp đầy đủ nước uống sạch.',
          isTrue: true,
          explanation:
            'Theo Bài 8 SGK Công nghệ 11 (trang 42), thức ăn hỗn hợp hoàn chỉnh đã cân đối đủ các chất dinh dưỡng, dùng cho ăn trực tiếp.',
        },
        {
          label: 'b',
          level: 'hieu',
          text: 'Khẩu phần của gà mái đẻ trứng phải có hàm lượng Calcium (3,8–4,2%) cao gấp 4 lần gà thịt vì mỗi ngày gà đẻ cần huy động khoảng 2,0–2,2 gam Calcium để hình thành lớp vỏ cứng (CaCO3) của quả trứng.',
          isTrue: true,
          explanation:
            'Vỏ trứng gia cầm cấu tạo chủ yếu từ CaCO3; nếu thiếu Calcium và Vitamin D3 trong thức ăn, gà đẻ sẽ rút Ca từ xương làm mềm xương và đẻ trứng vỏ mỏng/không vỏ (Bài 7 trang 38).',
        },
        {
          label: 'c',
          level: 'vandung',
          text: 'Thức ăn cho lợn con (5–15 kg) phải có tỉ lệ protein cao (20–21%) và giới hạn xơ thô rất thấp (≤ 4%) vì lợn con đang phát triển mô cơ rất nhanh nhưng hệ thống enzyme tiêu hóa chưa hoàn thiện, không tiêu hóa được nhiều chất xơ.',
          isTrue: true,
          explanation:
            'Vật nuôi non cần nhiều protein dễ tiêu để tạo mô cơ và miễn dịch; nếu xơ thô cao sẽ gây rối loạn tiêu hóa và tiêu chảy ở lợn con.',
        },
        {
          label: 'd',
          level: 'vandung',
          text: 'Để tiết kiệm chi phí, trang trại nuôi lợn con mới cai sữa (5 kg) nên lấy cám của gà mái đẻ trứng (chứa 4,2% Calcium) cho lợn con ăn thay thế hoàn toàn trong 1 tháng đầu.',
          isTrue: false,
          explanation:
            'Cám gà đẻ chứa tới 4,2% Ca (quá thừa kiềm CaCO3) sẽ làm trung hòa hết acid HCl trong dạ dày lợn con, gây khó tiêu, tiêu chảy nặng và cản trở hấp thu kẽm (Zn).',
        },
      ],
    },
    {
      number: 2,
      context:
        'Tình huống thực tế: Tại các tỉnh miền núi phía Bắc (Hà Giang, Cao Bằng, Lào Cai), vào mùa đông nhiệt độ thường xuống thấp dưới 8–10 °C, đồng cỏ tự nhiên khô héo làm trâu, bò thiếu thức ăn xanh nghiêm trọng. Trung tâm Khuyến nông đã hướng dẫn đồng bào thực hiện song song 2 kĩ thuật chế biến dự trữ thức ăn từ vụ thu: (1) Ủ chua thân cây ngô sau thu bắp và cỏ voi xanh trong túi/hố ủ kín với mật rỉ đường (2–3%) và muối ăn (0,5%); (2) Ủ kiềm hóa rơm lúa khô bằng dung dịch phân đạm Urea (tỉ lệ 4 kg Urea hòa vào 80–100 lít nước sạch tưới đều cho 100 kg rơm khô) rồi ủ kín trong 2–3 tuần.',
      citation:
        'Nguồn: Trung tâm Khuyến nông Quốc gia (Bộ NN&PTNT) – Kỹ thuật chế biến và dự trữ thức ăn thô xanh phòng chống đói rét cho trâu bò vụ Đông – Xuân, 2023.',
      statements: [
        {
          label: 'a',
          level: 'biet',
          text: 'Kĩ thuật ủ chua cỏ tươi là phương pháp chế biến sinh học (lên men lactic), còn kĩ thuật ủ rơm khô với Urea là phương pháp chế biến hóa học – sinh học làm giàu dinh dưỡng cho thức ăn thô.',
          isTrue: true,
          explanation:
            'Theo Bài 9 SGK Công nghệ 11 (trang 46–48), ủ chua và kiềm hóa rơm bằng urea/vôi là các phương pháp chế biến thức ăn thô xanh phổ biến.',
        },
        {
          label: 'b',
          level: 'hieu',
          text: 'Khi ủ rơm khô với dung dịch Urea 4%, khí NH3 giải phóng từ sự thủy phân Urea sẽ phá vỡ liên kết ligno-cellulose làm sợi rơm mềm ra, đồng thời cung cấp nguồn nitơ phi protein cho hệ vi sinh vật dạ cỏ của trâu bò tổng hợp nên protein vi sinh vật.',
          isTrue: true,
          explanation:
            'Rơm ủ urea vừa tăng tỉ lệ tiêu hóa chất xơ từ ~40% lên 55–60%, vừa nâng hàm lượng protein thô quy đổi của rơm từ ~3–4% lên 8–9%.',
        },
        {
          label: 'c',
          level: 'vandung',
          text: 'Nếu một hộ chăn nuôi có 3 con bò thịt, mỗi con cần ăn trung bình 15 kg thức ăn ủ chua/ngày trong suốt 60 ngày mùa đông khan hiếm cỏ, thì hộ đó cần chuẩn bị hố ủ chứa tối thiểu 2,7 tấn thức ăn ủ chua thành phẩm.',
          isTrue: true,
          explanation:
            'Tổng lượng thức ăn ủ chua cần dùng = 3 con × 15 kg/ngày × 60 ngày = 2.700 kg = 2,7 tấn.',
        },
        {
          label: 'd',
          level: 'vandung',
          text: 'Sau khi ủ rơm với Urea 4% thành công, người chăn nuôi nên lấy rơm ủ Urea đó trộn với nước cho đàn lợn con và đàn gà con trong gia đình ăn hàng ngày để bổ sung đạm.',
          isTrue: false,
          explanation:
            'Chỉ gia súc nhai lại có dạ cỏ mới sử dụng được nitơ phi protein (Urea); lợn và gia cầm là động vật dạ dày đơn không tiêu hóa được rơm và sẽ bị ngộ độc NH3 từ Urea.',
        },
      ],
    },
    {
      number: 3,
      context:
        'Tình huống thực tế: Tại một trang trại chăn nuôi gà thịt lông màu và lợn thịt quy mô nông hộ ở tỉnh Bắc Giang, người chăn nuôi áp dụng quy trình "Ủ lên men thức ăn tinh bột bằng chế phẩm sinh học" theo Bài 9 SGK Công nghệ 11: Phối trộn 60 kg bột ngô + 35 kg cám gạo + 5 kg khô dầu đậu tương, hòa chế phẩm nấm men Saccharomyces cerevisiae và vi khuẩn lactic vào nước ấm có pha chút mật rỉ đường rồi tưới đều vào hỗn hợp bột sao cho đạt độ ẩm 35–40% (nắm lại thành cục, buông tay chạm nhẹ là tơi ra), sau đó cho vào thùng nhựa đậy kín ủ trong 24–48 giờ.',
      citation:
        'Nguồn: Học viện Nông nghiệp Việt Nam & Bộ Giáo dục và Đào tạo – Bài 9: Các phương pháp chế biến thức ăn chăn nuôi (Thực hành ủ lên men thức ăn), SGK Công nghệ 11, trang 47–49.',
      statements: [
        {
          label: 'a',
          level: 'biet',
          text: 'Trong hỗn hợp nguyên liệu trên, bột ngô và cám gạo thuộc nhóm thức ăn giàu năng lượng (tinh bột), còn khô dầu đậu tương thuộc nhóm thức ăn giàu protein thực vật.',
          isTrue: true,
          explanation:
            'Theo Bài 8 SGK Công nghệ 11 (trang 41), hạt ngũ cốc (ngô, tấm, cám) là thức ăn giàu năng lượng; khô dầu đậu tương là thức ăn giàu protein.',
        },
        {
          label: 'b',
          level: 'hieu',
          text: 'Sau 24–48 giờ ủ, khối thức ăn ấm lên, tỏa mùi thơm chua ngọt nhẹ của rượu và este là do nấm men và vi khuẩn lactic đã nhân sinh khối, phân giải một phần tinh bột thành đường đơn, acid hữu cơ và tổng hợp thêm protein vi sinh vật, vitamin nhóm B.',
          isTrue: true,
          explanation:
            'Quá trình lên men làm tăng giá trị sinh học của thức ăn, tạo mùi vị thơm ngon kích thích vật nuôi ăn nhiều và dễ tiêu hóa (Bài 9 trang 47).',
        },
        {
          label: 'c',
          level: 'vandung',
          text: 'Việc cho lợn và gà ăn thức ăn ủ men sống này giúp cân bằng hệ vi sinh đường ruột, giảm rõ rệt tỉ lệ mắc bệnh tiêu chảy phân trắng và giảm mùi hôi của phân thải ra chuồng nuôi.',
          isTrue: true,
          explanation:
            'Hệ vi sinh vật có lợi (Probiotics) và acid lactic trong thức ăn ủ men ức chế vi khuẩn E. coli, Salmonella trong ruột và tăng tỉ lệ hấp thu đạm.',
        },
        {
          label: 'd',
          level: 'vandung',
          text: 'Sau khi mẻ thức ăn ủ men đã thơm ngon đạt chuẩn, người chăn nuôi nên đem toàn bộ cám ủ men đó đun sôi kĩ ở 100 °C trong 1 giờ trước khi cho ăn để các vi sinh vật có ích hoạt động mạnh hơn.',
          isTrue: false,
          explanation:
            'Đun sôi ở 100 °C sẽ tiêu diệt toàn bộ nấm men sống, vi khuẩn lactic có lợi và làm mất hoạt tính các enzyme tiêu hóa vừa tạo ra trong thức ăn ủ men.',
        },
      ],
    },
    {
      number: 4,
      context:
        'Tình huống thực tế: Vào mùa mưa nồm ẩm tại miền Bắc, một cơ sở chăn nuôi vịt đẻ tại tỉnh Nam Định thu mua một lô ngô hạt giá rẻ có độ ẩm hạt lên tới 17,5% về đổ đống trực tiếp trên nền xi măng ẩm thấp trong kho tối, không có pallet kê lót. Sau 3 tuần bảo quản, hạt ngô bị bốc nóng, đổi màu và xuất hiện lớp nấm mốc màu vàng lục (Aspergillus flavus). Khi lấy ngô mốc này nghiền trộn cho đàn vịt đẻ ăn liên tục 10 ngày, đàn vịt giảm ăn mạnh, sản lượng trứng tụt 45%, nhiều con chết với bệnh tích gan sưng to, xuất huyết và hoại tử vàng.',
      citation:
        'Nguồn: Viện Thú y Quốc gia (NIVR) & Cục Chăn nuôi – Khuyến cáo phòng chống độc tố nấm mốc Aflatoxin trong nguyên liệu thức ăn chăn nuôi, 2023.',
      statements: [
        {
          label: 'a',
          level: 'biet',
          text: 'Nguyên nhân gây ngộ độc gan cấp tính làm chết đàn vịt trong tình huống trên là do độc tố Aflatoxin tiết ra từ nấm mốc Aspergillus flavus phát triển trên ngô ẩm.',
          isTrue: true,
          explanation:
            'Theo Bài 10 SGK Công nghệ 11 (trang 51), nấm mốc Aspergillus flavus trên ngô, lạc ẩm sinh độc tố Aflatoxin gây độc hại gan và giảm miễn dịch, giảm đẻ.',
        },
        {
          label: 'b',
          level: 'hieu',
          text: 'Lô ngô bị mốc nhanh chóng chỉ sau 3 tuần là do độ ẩm hạt ban đầu quá cao (17,5% so với ngưỡng an toàn < 13–14%) lại đổ trực tiếp trên nền kho ẩm làm hạt hô hấp mạnh sinh nhiệt – ẩm kích hoạt bào tử nấm mốc phát triển.',
          isTrue: true,
          explanation:
            'Độ ẩm hạt > 14% kết hợp nhiệt độ 25–35 °C và kho thiếu thông thoáng là điều kiện lí tưởng cho nấm mốc sinh độc tố (Bài 10 trang 51).',
        },
        {
          label: 'c',
          level: 'vandung',
          text: 'Để bảo quản ngô hạt an toàn lâu dài trong kho, cơ sở phải sấy khô hạt ngô xuống độ ẩm dưới 13%, đóng bao xếp trên kệ pallet cao cách mặt sàn ít nhất 15–20 cm, cách tường kho và kiểm soát thông gió chống ẩm, chống chuột mọt.',
          isTrue: true,
          explanation:
            'Đây là nguyên tắc bảo quản thức ăn chăn nuôi đúng quy chuẩn kĩ thuật trong Bài 10 SGK Công nghệ 11 (trang 51–53).',
        },
        {
          label: 'd',
          level: 'vandung',
          text: 'Đối với số ngô đã bị mốc xanh vàng nặng trong kho, chủ trại chỉ cần đem phơi nắng hoặc nấu chín lên là sẽ phân hủy được 100% độc tố Aflatoxin để cho vịt ăn tiếp an toàn.',
          isTrue: false,
          explanation:
            'Độc tố Aflatoxin cực kì bền với nhiệt (chịu được nhiệt độ trên 250 °C), nên việc phơi nắng hay đun sôi thông thường hoàn toàn không phá hủy được độc tố; thức ăn đã mốc nặng bắt buộc phải loại bỏ.',
        },
      ],
    },
  ],
  'cn11-c4': [
    {
      number: 1,
      context:
        'Tình huống thực tế: Tại một xã chăn nuôi lợn nông hộ ở tỉnh Hưng Yên, một hộ gia đình mua lợn thịt trôi nổi không rõ nguồn gốc và không qua kiểm dịch về nuôi chung ngay với đàn lợn nhà, đồng thời sử dụng thức ăn thừa thu gom từ các quán ăn chưa qua đun nấu chín. Sau 7 ngày, đàn lợn sốt cao 41–42 °C, bỏ ăn, nằm chồng đống, da vùng tai, bụng và bốn chân xuất hiện nhiều nốt xuất huyết tím bầm rồi chết nhanh trong 5–7 ngày với tỉ lệ chết 100%. Kết quả xét nghiệm mẫu máu bằng kĩ thuật Real-time PCR tại Chi cục Thú y khẳng định dương tính với virus Dịch tả lợn châu Phi (ASFV).',
      citation:
        'Nguồn: Cục Thú y (Bộ NN&PTNT) – Hướng dẫn giám sát, chẩn đoán và phòng chống bệnh Dịch tả lợn châu Phi (African Swine Fever – ASF), 2024.',
      statements: [
        {
          label: 'a',
          level: 'biet',
          text: 'Bệnh Dịch tả lợn châu Phi (ASF) là bệnh truyền nhiễm nguy hiểm do virus ASFV gây ra ở loài lợn với triệu chứng sốt cao, xuất huyết nặng và tỉ lệ chết lên tới 100%.',
          isTrue: true,
          explanation:
            'Theo Bài 12 SGK Công nghệ 11 (trang 62), bệnh Dịch tả lợn châu Phi do virus ASFV gây ra có độc lực rất cao, tỉ lệ chết gần như 100%.',
        },
        {
          label: 'b',
          level: 'hieu',
          text: 'Hai sai lầm nghiêm trọng làm mầm bệnh xâm nhập vào hộ chăn nuôi trên là nhập lợn không rõ nguồn gốc (không cách li kiểm dịch) và cho ăn thức ăn thừa chưa nấu chín (vì virus ASFV tồn tại rất lâu trong thịt lợn sống/đông lạnh nhiễm bệnh).',
          isTrue: true,
          explanation:
            'Virus ASFV có sức đề kháng rất cao ngoài môi trường và trong sản phẩm thịt lợn chưa nấu chín; thức ăn thừa chưa đun sôi là nguồn lây phổ biến (Bài 12 trang 62).',
        },
        {
          label: 'c',
          level: 'vandung',
          text: 'Khi có kết quả khẳng định mắc bệnh Dịch tả lợn châu Phi, hộ chăn nuôi bắt buộc phải phối hợp với cơ quan thú y tiêu hủy toàn bộ đàn lợn bệnh đúng quy định, tổng vệ sinh phun hóa chất sát trùng và rắc vôi bột khử trùng toàn bộ khu vực chuồng nuôi.',
          isTrue: true,
          explanation:
            'Bệnh ASF không được phép điều trị; phải báo cơ quan thú y khoanh vùng ổ dịch, tiêu hủy an toàn sinh học và khử trùng triệt để nhằm ngăn dịch lây lan (Bài 12 trang 63).',
        },
        {
          label: 'd',
          level: 'vandung',
          text: 'Vì lợn đang sốt cao 42 °C do virus ASFV nên chủ hộ chỉ cần mua thuốc kháng sinh Penicillin và Streptomycin liều gấp ba về tiêm là sẽ tiêu diệt sạch virus ASFV trong máu lợn.',
          isTrue: false,
          explanation:
            'Thuốc kháng sinh hoàn toàn không có tác dụng tiêu diệt virus (Bài 15 trang 80); bệnh Dịch tả lợn châu Phi do virus gây ra không có thuốc điều trị đặc hiệu.',
        },
      ],
    },
    {
      number: 2,
      context:
        'Tình huống thực tế: Tại một trang trại nuôi 5.000 gà thịt lông màu ở tỉnh Vĩnh Phúc, do chủ trại chủ quan bỏ qua lịch nhỏ và tiêm vắc-xin phòng bệnh Newcastle (bệnh gà rù), đến giai đoạn gà được 35 ngày tuổi, sau một đợt gió mùa lạnh ẩm, đàn gà bỗng nhiên ủ rũ, xù lông, sốt cao, mào tím tái, thở khó khò khè, diều chướng đầy thức ăn chua, ỉa chảy phân lỏng màu xanh trắng và sau vài ngày nhiều con xuất hiện triệu chứng thần kinh ngoẹo đầu, quay vòng tròn rồi chết hàng loạt (tỉ lệ chết trên 70%).',
      citation:
        'Nguồn: Viện Thú y Quốc gia (NIVR) & Bộ Giáo dục và Đào tạo – Bài 13: Phòng, trị một số bệnh phổ biến ở gia cầm (Bệnh Newcastle), SGK Công nghệ 11, trang 66–67.',
      statements: [
        {
          label: 'a',
          level: 'biet',
          text: 'Các triệu chứng khó thở, tiêu chảy phân xanh trắng và ngoẹo cổ quay vòng tròn là biểu hiện lâm sàng điển hình của bệnh Newcastle (bệnh gà rù) do virus gây ra.',
          isTrue: true,
          explanation:
            'Theo Bài 13 SGK Công nghệ 11 (trang 66), bệnh Newcastle gây tổn thương đường hô hấp, tiêu hóa (phân xanh trắng) và thần kinh trung ương (ngoẹo cổ).',
        },
        {
          label: 'b',
          level: 'hieu',
          text: 'Nguyên nhân trực tiếp khiến đàn gà mắc bệnh và chết hàng loạt với tỉ lệ trên 70% là do đàn gà không được chủng ngừa vắc-xin Newcastle nên cơ thể hoàn toàn không có kháng thể miễn dịch chủ động bảo vệ khi virus xâm nhập.',
          isTrue: true,
          explanation:
            'Newcastle là bệnh truyền nhiễm do virus không có thuốc điều trị đặc hiệu; phòng bệnh bằng vắc-xin (Lasota, Hệ I, vắc-xin vô hoạt) là biện pháp quyết định nhất (Bài 13 trang 67).',
        },
        {
          label: 'c',
          level: 'vandung',
          text: 'Để phòng bệnh Newcastle hiệu quả cho lứa gà tiếp theo, trang trại cần thực hiện lịch phòng vắc-xin chuẩn: nhỏ mắt/mũi vắc-xin nhược độc chủng Lasota (hoặc ND-IB) lúc gà 3–5 ngày tuổi, nhắc lại lúc 18–21 ngày tuổi và tiêm vắc-xin Newcastle lúc 35–40 ngày tuổi khi đàn gà khỏe mạnh.',
          isTrue: true,
          explanation:
            'Sử dụng vắc-xin nhược độc nhỏ mắt/mũi cho gà con rồi tiêm nhắc lại giúp duy trì hiệu giá kháng thể bảo hộ bền vững suốt vụ nuôi.',
        },
        {
          label: 'd',
          level: 'vandung',
          text: 'Đối với số gà chết do bệnh Newcastle trong trại, chủ trại nên đem làm lông mổ thịt bán rẻ cho các bếp ăn tập thể hoặc vứt xác gà chết ra mương nước cạnh trại.',
          isTrue: false,
          explanation:
            'Nghiêm cấm giết mổ, bán chạy hoặc vứt xác gia cầm chết dịch ra môi trường vì sẽ làm phát tán virus gây bùng phát dịch bệnh cho cả vùng (Bài 11 & Bài 13).',
        },
      ],
    },
    {
      number: 3,
      context:
        'Tình huống thực tế: Vào buổi sáng mùa xuân sau cơn mưa rào tại huyện Mộc Châu (tỉnh Sơn La), một hộ chăn nuôi bò thả đàn bò ra bãi chăn có nhiều cỏ ba lá (cỏ họ Đậu) đang mọc non mơn mởn và còn ướt đẫm nước mưa, sương sớm. Sau khi ăn no khoảng 1 giờ, một con bò cái có biểu hiện bồn chồn, ngừng ăn, ngừng nhai lại, khó thở, đứng dạng hai chân trước, vùng hõm hông bên trái phồng căng to nhanh như mặt trống; khi dùng ngón tay gõ vào hông trái nghe tiếng kêu "bộp bộp" như gõ trống.',
      citation:
        'Nguồn: Học viện Nông nghiệp Việt Nam & Bộ Giáo dục và Đào tạo – Bài 14: Phòng, trị một số bệnh phổ biến ở trâu, bò (Bệnh chướng hơi dạ cỏ), SGK Công nghệ 11, trang 74–75.',
      statements: [
        {
          label: 'a',
          level: 'biet',
          text: 'Hiện tượng hõm hông trái của bò căng phồng nhanh như cái trống sau khi ăn nhiều cỏ non ướt mưa là triệu chứng điển hình của bệnh chướng hơi dạ cỏ cấp tính (một bệnh không truyền nhiễm).',
          isTrue: true,
          explanation:
            'Theo Bài 14 SGK Công nghệ 11 (trang 74), bệnh chướng hơi dạ cỏ làm dạ cỏ (nằm ở bên trái xoang bụng) tích đầy khí gây căng phồng hõm hông trái.',
        },
        {
          label: 'b',
          level: 'hieu',
          text: 'Cơ chế gây bệnh là do cỏ non họ Đậu ướt nước lên men cực nhanh trong dạ cỏ sinh ra lượng lớn khí (CH4, CO2) tạo thành các bọt khí bền vững trộn lẫn thức ăn làm bít kín tâm vị, khiến bò không thể ợ hơi thoát khí ra ngoài được.',
          isTrue: true,
          explanation:
            'Protein hòa tan và saponin trong cỏ non họ Đậu tạo bọt khí bền ngăn phản xạ ợ hơi, làm dạ cỏ trương to chèn ép cơ hoành gây ngạt thở (Bài 14 trang 74).',
        },
        {
          label: 'c',
          level: 'vandung',
          text: 'Để cấp cứu ngay cho con bò trên, người nuôi cần dắt bò đứng lên chỗ đất dốc (đầu cao hơn mông để giảm ép tim phổi), kéo lưỡi kích thích ợ hơi, cho uống dung dịch phá bọt chống lên men (như dầu thực vật, cồn tỏi, bia hoặc thuốc Tympanol), và nếu nguy kịch phải dùng kim Trocar chọc thoát hơi ở tâm hõm hông trái.',
          isTrue: true,
          explanation:
            'Đây là phác đồ xử lí và cấp cứu chuẩn đối với bệnh chướng hơi dạ cỏ cấp tính ở trâu bò theo Bài 14 SGK Công nghệ 11 (trang 75).',
        },
        {
          label: 'd',
          level: 'vandung',
          text: 'Để phòng bệnh chướng hơi dạ cỏ, vào những ngày mưa phùn sương muối, người chăn nuôi nên lùa trâu bò đang đói ra ăn thật no cỏ non ướt đẫm sương ngay từ 5 giờ sáng và không cho ăn thêm rơm khô.',
          isTrue: false,
          explanation:
            'Phòng bệnh chướng hơi dạ cỏ đòi hỏi KHÔNG chăn thả khi cỏ còn ướt đẫm sương/mưa và nên cho trâu bò ăn lót dạ một ít rơm khô/cỏ khô trước khi ăn cỏ non (Bài 14 trang 75).',
        },
      ],
    },
    {
      number: 4,
      context:
        'Tình huống thực tế: Tại một trang trại nuôi lợn thịt ở tỉnh Đồng Nai, sau đợt thời tiết chuyển mùa nắng mưa thất thường, một ô chuồng lợn có biểu hiện sốt 41 °C, thở thể bụng, ho và vùng da cổ, hầu sưng thủy thũng đỏ tím. Bác sĩ thú y lấy mẫu dịch ngoáy mũi gửi phòng thí nghiệm làm xét nghiệm PCR và kháng sinh đồ, xác định lợn mắc bệnh Tụ huyết trùng cấp tính do vi khuẩn Pasteurella multocida nhạy cảm cao với kháng sinh Ceftiofur và Florfenicol. Bác sĩ đã chỉ định tiêm kháng sinh Ceftiofur đúng liều lượng liên tục trong 4 ngày kết hợp thuốc hạ sốt, Vitamin C và tuân thủ thời gian ngừng thuốc 14 ngày trước khi xuất bán.',
      citation:
        'Nguồn: Cục Thú y (Bộ NN&PTNT) & Bài 12, Bài 15 SGK Công nghệ 11 – Ứng dụng công nghệ sinh học trong phòng, trị bệnh vật nuôi và sử dụng kháng sinh có trách nhiệm.',
      statements: [
        {
          label: 'a',
          level: 'biet',
          text: 'Trong tình huống trên, bác sĩ thú y đã ứng dụng kĩ thuật chẩn đoán phân tử PCR để xác định chính xác tác nhân vi khuẩn Pasteurella multocida gây bệnh Tụ huyết trùng.',
          isTrue: true,
          explanation:
            'Theo Bài 12 & Bài 15 SGK Công nghệ 11 (trang 63, 77), bệnh tụ huyết trùng do vi khuẩn Pasteurella multocida gây ra và PCR giúp chẩn đoán nhanh, chính xác mầm bệnh.',
        },
        {
          label: 'b',
          level: 'hieu',
          text: 'Phác đồ điều trị bằng kháng sinh Ceftiofur mang lại hiệu quả khỏi bệnh cao vì Tụ huyết trùng là bệnh nhiễm khuẩn (do vi khuẩn gây ra) và thuốc được lựa chọn dựa trên kết quả kháng sinh đồ.',
          isTrue: true,
          explanation:
            'Kháng sinh tiêu diệt hoặc ức chế đặc hiệu vi khuẩn; làm kháng sinh đồ giúp chọn đúng loại kháng sinh mà vi khuẩn chưa kháng (Bài 15 trang 80–81).',
        },
        {
          label: 'c',
          level: 'vandung',
          text: 'Việc tiêm đủ liệu trình 4 ngày và tuân thủ nghiêm ngặt thời gian ngừng thuốc 14 ngày trước khi xuất chuồng vừa giúp tiêu diệt dứt điểm vi khuẩn tránh tái phát kháng thuốc, vừa đảm bảo thịt lợn xuất bán không còn tồn dư kháng sinh.',
          isTrue: true,
          explanation:
            'Nguyên tắc sử dụng kháng sinh an toàn trong chăn nuôi là: Đúng thuốc, đúng liều, đủ liệu trình và đủ thời gian ngừng thuốc trước khi thu hoạch sản phẩm (Bài 15 trang 81).',
        },
        {
          label: 'd',
          level: 'vandung',
          text: 'Khi thấy lợn vừa giảm sốt sau mũi tiêm kháng sinh ngày đầu tiên, chủ trại nên tự ý ngừng tiêm ngay và hôm sau xuất bán số lợn đó cho lò mổ để tiết kiệm tiền thuốc.',
          isTrue: false,
          explanation:
            'Ngừng kháng sinh nửa chừng khi mới tiêm 1 ngày sẽ làm vi khuẩn chưa chết hẳn bùng phát trở lại và tạo chủng siêu kháng thuốc; xuất bán ngay hôm sau sẽ gây tồn dư kháng sinh cao trong thịt.',
        },
      ],
    },
  ],
  'cn11-c5': [
    {
      number: 1,
      context:
        'Tình huống thực tế: Một hợp tác xã chăn nuôi tại tỉnh Thanh Hóa quy hoạch xây dựng mới một khu trang trại nuôi lợn thịt công nghệ cao quy mô 2.400 con/lứa theo kiểu chuồng kín (Tunnel ventilation). Khu đất được chọn nằm ở vị trí cao ráo, cách xa khu dân cư, trường học, chợ và trục đường giao thông chính trên 500 m. Các dãy chuồng được thiết kế quay theo hướng Đông – Nam; nền chuồng cao hơn mặt đất xung quanh 40 cm, có độ dốc 2,5% về phía rãnh thoát nước thải; một đầu hồi lắp giàn tấm làm mát (Cooling pad) và đầu hồi đối diện lắp dàn quạt hút công suất lớn kết nối tủ điều khiển nhiệt độ tự động.',
      citation:
        'Nguồn: Cục Chăn nuôi (Bộ NN&PTNT) – Tiêu chuẩn quốc gia TCVN 9121:2012 về Chuồng nuôi lợn – Yêu cầu thiết kế kĩ thuật và quy định khoảng cách an toàn chăn nuôi.',
      statements: [
        {
          label: 'a',
          level: 'biet',
          text: 'Việc thiết kế chuồng nuôi quay hướng Đông – Nam, nền chuồng cao ráo có độ dốc thoát nước 2–3% và bố trí xa khu dân cư là tuân thủ đúng các yêu cầu kĩ thuật chuồng nuôi trong Bài 16 SGK Công nghệ 11.',
          isTrue: true,
          explanation:
            'Theo Bài 16 SGK Công nghệ 11 (trang 85–87), chuồng nuôi cần đặt nơi yên tĩnh xa khu dân cư, hướng Nam hoặc Đông – Nam, nền cao ráo dốc 2–3%.',
        },
        {
          label: 'b',
          level: 'hieu',
          text: 'Nguyên lí làm mát của chuồng kín trên là khi dàn quạt ở cuối chuồng hút không khí nóng và khí độc (NH3, CO2) ra ngoài sẽ tạo áp suất âm kéo luồng không khí tươi bên ngoài đi xuyên qua giàn tấm làm mát (Cooling pad) có nước chảy làm hạ nhiệt độ chuồng xuống 5–7 °C.',
          isTrue: true,
          explanation:
            'Hệ thống thông gió áp suất âm kết hợp tấm làm mát bay hơi nước (Cooling pad) giúp duy trì tiểu khí hậu chuồng nuôi mát mẻ, giàu O2 suốt mùa hè.',
        },
        {
          label: 'c',
          level: 'vandung',
          text: 'Nếu vào những ngày mùa đông rét đậm ở Thanh Hóa (nhiệt độ ngoài trời xuống 11 °C) kèm độ ẩm cao 92%, người vận hành cần tắt hệ thống bơm nước tấm làm mát và giảm bớt số lượng quạt hút để giữ ấm cho đàn lợn và tránh gió lạnh lùa gây viêm phổi.',
          isTrue: true,
          explanation:
            'Vào mùa đông lạnh ẩm, chỉ duy trì quạt thông gió tối thiểu để đẩy khí độc mà không bật nước làm mát nhằm giữ nhiệt độ chuồng ở ngưỡng tối ưu (20–25 °C cho lợn thịt).',
        },
        {
          label: 'd',
          level: 'vandung',
          text: 'Để chuồng kín thông thoáng hơn vào mùa hè, khi đang bật dàn quạt hút và tấm làm mát ở hai đầu chuồng, công nhân nên mở toang toàn bộ cửa sổ và cửa chính ở hai bên hông giữa chuồng.',
          isTrue: false,
          explanation:
            'Chuồng kín hoạt động nhờ áp suất âm dọc chuồng; nếu mở toang cửa hông giữa chuồng, gió nóng bên ngoài sẽ lọt thẳng vào giữa chuồng mà không đi qua tấm làm mát, làm mất tác dụng làm mát ở nửa đầu chuồng.',
        },
      ],
    },
    {
      number: 2,
      context:
        'Tình huống thực tế: Tại khu chuồng nái đẻ và nuôi con của một trang trại lợn ngoại ở tỉnh Thái Nguyên, một đàn lợn con gồm 12 con vừa được sinh ra từ mẹ lai F1 (Yorkshire × Landrace). Kĩ thuật viên thực hiện quy trình chăm sóc lợn con sơ sinh theo Bài 17 SGK Công nghệ 11: Lau khô dịch nhầy mũi miệng và thân mình -> Cắt rốn và sát trùng cuống rốn bằng cồn Iodine 5% -> Bấm nanh, cắt đuôi -> Cho lợn con bú sữa đầu của mẹ ngay trong giờ đầu tiên -> Bật đèn hồng ngoại sưởi ấm ô úm ở nhiệt độ 32–34 °C -> Tiêm sắt (Dextran Fe) lần 1 lúc 3 ngày tuổi và tập ăn sớm từ 7 ngày tuổi.',
      citation:
        'Nguồn: Viện Chăn nuôi Quốc gia (NIAS) & Bộ Giáo dục và Đào tạo – Bài 17: Chăm sóc và nuôi dưỡng lợn (Quy trình chăm sóc lợn con sơ sinh), SGK Công nghệ 11, trang 90–91.',
      statements: [
        {
          label: 'a',
          level: 'biet',
          text: 'Các thao tác giữ ấm 32–34 °C, cho bú sữa đầu sớm, tiêm bổ sung sắt và tập ăn sớm là quy trình chuẩn trong chăm sóc và nuôi dưỡng lợn con theo mẹ (giai đoạn từ sơ sinh đến cai sữa).',
          isTrue: true,
          explanation:
            'Theo Bài 17 SGK Công nghệ 11 (trang 90–91), đây là các biện pháp kĩ thuật cốt lõi khi chăm sóc lợn con theo mẹ.',
        },
        {
          label: 'b',
          level: 'hieu',
          text: 'Việc cho lợn con bú sữa đầu càng sớm càng tốt trong 1–2 giờ đầu sau sinh là cực kì quan trọng vì sữa đầu rất giàu kháng thể (Immunoglobulin) giúp tạo miễn dịch thụ động bảo vệ lợn con, và khả năng hấp thu nguyên vẹn kháng thể qua thành ruột lợn con giảm rất nhanh sau 24 giờ.',
          isTrue: true,
          explanation:
            'Lợn con mới sinh chưa tự tạo được kháng thể; sữa đầu cung cấp kháng thể đặc hiệu và niêm mạc ruột lợn con chỉ hấp thu nguyên phân tử kháng thể trong 24–36 giờ đầu.',
        },
        {
          label: 'c',
          level: 'vandung',
          text: 'Nếu một hộ chăn nuôi quên không tiêm bổ sung chế phẩm sắt cho đàn lợn con nuôi trên sàn chuồng công nghiệp thì đến khoảng 10–15 ngày tuổi lợn con sẽ bị thiếu máu dinh dưỡng (da niêm mạc nhợt nhạt, lông xù, còi cọc và tiêu chảy phân trắng).',
          isTrue: true,
          explanation:
            'Mỗi ngày lợn con cần 7–10 mg sắt để tạo hồng cầu nhưng sữa mẹ chỉ cấp được ~1 mg/ngày; không tiêm sắt sẽ gây bệnh thiếu máu thiếu sắt ở lợn con.',
        },
        {
          label: 'd',
          level: 'vandung',
          text: 'Khi đến ngày cai sữa (21–28 ngày tuổi), để lợn con nhanh thích nghi, kĩ thuật viên nên chuyển ngay đàn lợn con sang ô chuồng mới, đồng thời đổi đột ngột 100% sang loại thức ăn mới và tiêm cùng lúc 3 loại vắc-xin trong đúng ngày cai sữa.',
          isTrue: false,
          explanation:
            'Khi cai sữa tuyệt đối tránh gây "đa stress" cùng lúc; phải giữ nguyên lợn con ở chuồng cũ vài ngày (chỉ chuyển mẹ đi), giữ nguyên loại thức ăn tập ăn và chuyển đổi từ từ 5–7 ngày, không tiêm vắc-xin đúng ngày cai sữa.',
        },
      ],
    },
    {
      number: 3,
      context:
        'Tình huống thực tế: Tại một trang trại nuôi gà thịt và gà đẻ trứng công nghiệp ở tỉnh Bình Dương, kĩ thuật viên áp dụng quy trình úm gà con từ 1 đến 21 ngày tuổi trong quây úm có lót trấu sạch dày 10 cm và treo bóng đèn sưởi hồng ngoại. Vào đêm ngày thứ 3, khi kiểm tra chuồng úm, kĩ thuật viên quan sát thấy toàn bộ đàn gà con dạt hết ra sát mép vách quây úm (tránh thật xa bóng đèn sưởi ở giữa), nhiều con nằm bẹp, dang rộng hai cánh, há mỏ thở gấp và uống rất nhiều nước.',
      citation:
        'Nguồn: Trung tâm Nghiên cứu Gia cầm Thụy Phương (NIAS) & Bộ Giáo dục và Đào tạo – Bài 18: Chăm sóc và nuôi dưỡng gia cầm, SGK Công nghệ 11, trang 94–97.',
      statements: [
        {
          label: 'a',
          level: 'biet',
          text: 'Biểu hiện gà con tản ra xa nguồn nhiệt, nằm dang cánh và há mỏ thở gấp cho thấy nhiệt độ trong quây úm đang bị quá cao (gà con bị nóng).',
          isTrue: true,
          explanation:
            'Theo Bài 18 SGK Công nghệ 11 (trang 95), khi nhiệt độ quây úm quá cao gà con tránh xa đèn sưởi, há mỏ thở; khi quá lạnh gà co cụm dưới đèn; khi vừa đủ gà phân bố đều.',
        },
        {
          label: 'b',
          level: 'hieu',
          text: 'Giai đoạn gà con từ 1–21 ngày tuổi phải được úm sưởi ấm nhân tạo cẩn thận vì trung khu điều hòa thân nhiệt của gà con chưa hoàn chỉnh và lớp lông tơ mỏng chưa giữ được nhiệt cơ thể.',
          isTrue: true,
          explanation:
            'Gà con mới nở chưa tự ổn định được thân nhiệt trước biến động môi trường nên rất dễ bị cảm lạnh hoặc sốc nhiệt (Bài 18 trang 94).',
        },
        {
          label: 'c',
          level: 'vandung',
          text: 'Trước tình huống gà con đang bị nóng trong quây úm trên, kĩ thuật viên cần nâng cao bóng đèn sưởi lên (hoặc tắt bớt bóng sưởi), nới rộng quây úm, tăng độ thông thoáng và pha bổ sung chất điện giải + Vitamin C vào nước uống mát cho gà.',
          isTrue: true,
          explanation:
            'Hạ nhiệt độ sưởi về mức chuẩn (khoảng 31–33 °C ở tuần 1 rồi giảm dần mỗi tuần 2–3 °C) và bổ sung điện giải giúp gà con thoát khỏi stress nhiệt.',
        },
        {
          label: 'd',
          level: 'vandung',
          text: 'Khi đàn gà mái hậu bị bước vào giai đoạn đẻ trứng thương phẩm (từ tuần 20 trở đi), để gà đẻ nhiều trứng nhất, trang trại nên tắt hết đèn chiếu sáng để giữ chuồng tối 20 giờ/ngày.',
          isTrue: false,
          explanation:
            'Đối với gà mái đẻ trứng, phải duy trì thời gian chiếu sáng 14–16 giờ/ngày (cường độ 10–20 lux) để kích thích tuyến yên tiết hormone FSH, LH duy trì đẻ trứng; để tối 20 giờ/ngày gà sẽ ngừng đẻ (Bài 18 trang 96).',
        },
      ],
    },
    {
      number: 4,
      context:
        'Tình huống thực tế: Một hợp tác xã chăn nuôi gà thịt lông màu (gà ta lai) quy mô 15.000 con tại huyện Yên Thế (tỉnh Bắc Giang) đăng kí xây dựng và được cấp Giấy chứng nhận Thực hành chăn nuôi tốt VietGAP. Quy trình tại hợp tác xã được chuẩn hóa từ khâu con giống có giấy kiểm dịch nguồn gốc rõ ràng, thức ăn và nước uống đạt chuẩn không có chất cấm, áp dụng an toàn sinh học nghiêm ngặt (hố sát trùng, nhà tắm khử trùng ở cổng trại), xử lí chất thải bằng đệm lót sinh học và ghi chép đầy đủ sổ nhật kí chăn nuôi điện tử gắn mã QR truy xuất nguồn gốc trên từng bao bì thịt gà xuất bán vào hệ thống siêu thị.',
      citation:
        'Nguồn: Cục Chăn nuôi (Bộ NN&PTNT) – Quyết định ban hành Quy trình thực hành chăn nuôi tốt cho chăn nuôi gà và lợn an toàn tại Việt Nam (VietGAHP / VietGAP), 2023.',
      statements: [
        {
          label: 'a',
          level: 'biet',
          text: 'Quy trình chăn nuôi theo tiêu chuẩn VietGAP tại hợp tác xã gồm các nội dung chính: chuẩn bị chuồng trại – con giống, quản lí thức ăn – nước uống, quản lí dịch bệnh – vệ sinh thú y, quản lí chất thải – môi trường và ghi chép lưu trữ hồ sơ.',
          isTrue: true,
          explanation:
            'Theo Bài 20 SGK Công nghệ 11 (trang 104–106), đây là các yêu cầu cốt lõi của quy trình chăn nuôi theo tiêu chuẩn VietGAP.',
        },
        {
          label: 'b',
          level: 'hieu',
          text: 'Việc gắn mã QR truy xuất nguồn gốc từ sổ nhật kí chăn nuôi điện tử giúp người tiêu dùng và siêu thị kiểm tra minh bạch toàn bộ lịch sử con giống, loại cám sử dụng, lịch tiêm vắc-xin và ngày ngừng thuốc trước giết mổ.',
          isTrue: true,
          explanation:
            'Truy xuất nguồn gốc (Traceability) dựa trên hồ sơ ghi chép là yêu cầu bắt buộc của VietGAP để bảo đảm an toàn thực phẩm và nâng cao giá trị sản phẩm.',
        },
        {
          label: 'c',
          level: 'vandung',
          text: 'Khi có thương lái hoặc xe vận chuyển cám từ bên ngoài đến giao hàng tại cổng trại VietGAP, nhân viên bảo vệ bắt buộc phải yêu cầu xe đi qua hố/giàn phun khử trùng, người giao hàng không được tự ý đi thẳng vào khu chuồng nuôi mà phải giao nhận tại kho trung chuyển ở vòng ngoài.',
          isTrue: true,
          explanation:
            'Kiểm soát chặt người và phương tiện ra vào cổng trại (nguyên tắc cách li một chiều) là hàng rào an toàn sinh học quan trọng nhất để ngăn dịch bệnh xâm nhập.',
        },
        {
          label: 'd',
          level: 'vandung',
          text: 'Khi đã có giấy chứng nhận VietGAP, để gà có da vàng bóng đẹp và tăng trọng nhanh trong tuần cuối trước khi xuất bán vào siêu thị, hợp tác xã có thể trộn chất tạo nạc Salbutamol và phẩm màu công nghiệp Vàng Ô vào thức ăn.',
          isTrue: false,
          explanation:
            'Salbutamol (nhóm Beta-agonist) và chất Vàng Ô (Auramine O) là các hóa chất bị cấm tuyệt đối trong chăn nuôi vì gây ngộ độc và ung thư cho người tiêu dùng; vi phạm sẽ bị thu hồi chứng nhận VietGAP và xử lí hình sự.',
        },
      ],
    },
  ],
  'cn11-c6': [
    {
      number: 1,
      context:
        'Tình huống thực tế: Một trang trại chăn nuôi lợn thịt quy mô 3.000 con tại tỉnh Đồng Nai phát sinh trung bình mỗi ngày khoảng 6 tấn phân rắn và 35 m3 nước thải rửa chuồng. Trước đây, khi hệ thống xử lí bị sự cố và nước thải chảy tràn ra mương nước dẫn vào hồ tự nhiên cạnh trại, chỉ sau 10 ngày nước hồ chuyển sang màu xanh đậm đặc của tảo lam, bốc mùi hôi thối nồng nặc của khí NH3 và H2S, chỉ số DO (oxygen hòa tan) vào ban đêm tụt xuống dưới 0,8 mg/L làm cá trong hồ nổi đầu chết hàng loạt.',
      citation:
        'Nguồn: Viện Môi trường Nông nghiệp & Bộ Tài nguyên và Môi trường – Quy chuẩn kĩ thuật quốc gia QCVN 62-MT:2016/BTNMT về nước thải chăn nuôi.',
      statements: [
        {
          label: 'a',
          level: 'biet',
          text: 'Chất thải chăn nuôi chưa qua xử lí chứa hàm lượng cao các chất hữu cơ, các hợp chất nitơ (N), phosphorus (P), khí độc (NH3, H2S) và nhiều vi sinh vật gây bệnh.',
          isTrue: true,
          explanation:
            'Theo Bài 21 SGK Công nghệ 11 (trang 110), chất thải rắn, lỏng và khí từ chăn nuôi chứa nhiều chất hữu cơ, khoáng N, P và mầm bệnh gây ô nhiễm.',
        },
        {
          label: 'b',
          level: 'hieu',
          text: 'Hiện tượng nước hồ chuyển màu xanh đặc do tảo bùng phát rồi làm cạn kiệt oxygen hòa tan (DO < 0,8 mg/L) gây chết cá được gọi là hiện tượng phú dưỡng hóa nguồn nước.',
          isTrue: true,
          explanation:
            'Nồng độ N và P quá cao trong nước thải chăn nuôi kích thích tảo nở hoa; khi tảo chết và VSV phân hủy chất hữu cơ sẽ tiêu thụ sạch O2 trong nước.',
        },
        {
          label: 'c',
          level: 'vandung',
          text: 'Để khắc phục triệt để, trang trại cần lắp đặt máy ép tách phân (thu hồi 6 tấn bã phân rắn đưa vào nhà ủ phân hữu cơ vi sinh) và dẫn 35 m3 nước thải lỏng qua hệ thống bể Biogas phủ bạt HDPE kết hợp chuỗi hồ sinh học hiếu khí – thực vật thủy sinh trước khi tái sử dụng tưới cây.',
          isTrue: true,
          explanation:
            'Tách pha rắn – lỏng kết hợp Biogas và hồ sinh học là quy trình xử lí nước thải chăn nuôi công nghiệp hiệu quả nhất hiện nay (Bài 22 trang 113–114).',
        },
        {
          label: 'd',
          level: 'vandung',
          text: 'Để tránh bị phát hiện xả thải ra hồ mặt nước, trang trại nên khoan giếng sâu xuống tầng nước ngầm rồi bơm thẳng 35 m3 nước thải chăn nuôi chưa xử lí xuống lòng đất mỗi ngày.',
          isTrue: false,
          explanation:
            'Bơm nước thải chưa xử lí xuống tầng nước ngầm là hành vi vi phạm pháp luật nghiêm trọng, gây ô nhiễm vĩnh viễn nguồn nước ngầm sinh hoạt bằng nitrate (NO3-) và vi khuẩn E. coli, Coliform.',
        },
      ],
    },
    {
      number: 2,
      context:
        'Tình huống thực tế: Tại huyện Cẩm Giàng (tỉnh Hải Dương) và huyện Ba Vì (Hà Nội), nhiều trang trại chăn nuôi gà thịt trên nền chuồng và lợn thịt đã chuyển từ phương thức rửa chuồng bằng nước hàng ngày sang mô hình "Chăn nuôi trên đệm lót sinh học" (Bài 22 SGK Công nghệ 11). Nền chuồng được rải một lớp trấu khô trộn mùn cưa dày 30–40 cm, sau đó phun dịch chế phẩm vi sinh vật có ích (chứa nấm men Saccharomyces, vi khuẩn Bacillus subtilis, xạ khuẩn) lên bề mặt. Trong suốt vụ nuôi 3–4 tháng, trang trại hoàn toàn không phải dùng nước dội rửa chuồng mà nền chuồng vẫn khô tơi, không có mùi hôi và giảm 80% ruồi muỗi.',
      citation:
        'Nguồn: Học viện Nông nghiệp Việt Nam & Trung tâm Khuyến nông Quốc gia – Quy trình kĩ thuật làm và sử dụng đệm lót sinh học trong chăn nuôi lợn và gia cầm, 2023.',
      statements: [
        {
          label: 'a',
          level: 'biet',
          text: 'Sử dụng đệm lót sinh học là biện pháp ứng dụng công nghệ vi sinh vật để phân hủy trực tiếp phân và nước tiểu của vật nuôi ngay tại nền chuồng.',
          isTrue: true,
          explanation:
            'Theo Bài 22 SGK Công nghệ 11 (trang 115), đệm lót sinh học gồm chất độn giàu xơ và hệ VSV có ích giúp đồng hóa chất thải tại chỗ.',
        },
        {
          label: 'b',
          level: 'hieu',
          text: 'Nền chuồng đệm lót sinh học không còn mùi hôi thối là nhờ các vi sinh vật có ích phát triển mạnh đã chuyển hóa các hợp chất chứa nitơ và lưu huỳnh trong phân thành protein vi sinh vật và các chất mùn không mùi, đồng thời ức chế vi khuẩn gây thối.',
          isTrue: true,
          explanation:
            'Hệ VSV trong đệm lót đồng hóa NH3, H2S và phân giải nhanh chất hữu cơ nên triệt tiêu mùi hôi và ức chế vi khuẩn gây bệnh tiêu hóa, hô hấp.',
        },
        {
          label: 'c',
          level: 'vandung',
          text: 'Sau khi kết thúc 1–2 lứa nuôi gà, toàn bộ lớp đệm lót sinh học đã hoai mục có thể được thu gom đóng bao làm nguồn phân bón hữu cơ vi sinh giàu dinh dưỡng để bón trực tiếp cho cây ăn quả và cây công nghiệp.',
          isTrue: true,
          explanation:
            'Đệm lót sau khi kết thúc lứa nuôi đã được VSV phân giải thành phân hữu cơ vi sinh tơi xốp, rất tốt để cải tạo đất trồng trọt (Bài 22 trang 115).',
        },
        {
          label: 'd',
          level: 'vandung',
          text: 'Trong quá trình sử dụng đệm lót sinh học, hàng ngày người chăn nuôi nên phun thuốc sát trùng hóa học nồng độ cao trực tiếp lên toàn bộ bề mặt lớp đệm lót để diệt vi khuẩn.',
          isTrue: false,
          explanation:
            'Tuyệt đối không phun hóa chất sát trùng trực tiếp lên đệm lót sinh học vì sẽ tiêu diệt toàn bộ hệ vi sinh vật có ích đang phân giải phân trong đệm lót.',
        },
      ],
    },
    {
      number: 3,
      context:
        'Tình huống thực tế: Một hợp tác xã nông nghiệp tuần hoàn tại huyện Củ Chi (TP. Hồ Chí Minh) kết hợp nuôi 100 con bò thịt với trại nuôi giun quế (trùn quế – Perionyx excavatus) diện tích 1.000 m2. Toàn bộ lượng phân bò tươi thải ra hàng ngày được thu gom, hòa thêm nước đạt độ ẩm khoảng 75–80% rồi cho vào các luống nuôi giun quế. Cứ 1 tấn phân bò tươi qua hệ tiêu hóa của giun quế tạo ra khoảng 500–600 kg phân trùn quế (Vermicompost) chất lượng cao để trồng rau hữu cơ và thu được 25–30 kg sinh khối giun quế tươi giàu đạm (chứa ~65–70% protein tính theo vật chất khô) để làm thức ăn bổ sung cho gà và cá.',
      citation:
        'Nguồn: Viện Sinh học Nhiệt đới (VAST) & Sở NN&PTNT TP. Hồ Chí Minh – Mô hình nuôi trùn quế xử lí chất thải chăn nuôi bò theo hướng nông nghiệp tuần hoàn, 2023.',
      statements: [
        {
          label: 'a',
          level: 'biet',
          text: 'Nuôi giun quế bằng chất thải chăn nuôi là một phương pháp sinh học hiệu quả giúp xử lí chất thải rắn thành phân bón hữu cơ và nguồn thức ăn giàu protein.',
          isTrue: true,
          explanation:
            'Theo Bài 22 SGK Công nghệ 11 (trang 113–115), ủ phân hữu cơ (compost) và nuôi giun trùn quế (vermicomposting) là các biện pháp sinh học xử lí chất thải rắn.',
        },
        {
          label: 'b',
          level: 'hieu',
          text: 'Phân trùn quế có chất lượng vượt trội hơn phân chuồng thông thường vì khi đi qua ống tiêu hóa của giun, chất hữu cơ được nghiền mịn và làm giàu bởi hệ vi sinh vật cố định đạm, phân giải lân cùng các acid humic kích thích rễ cây phát triển.',
          isTrue: true,
          explanation:
            'Trong ruột giun quế có hệ enzyme và VSV cộng sinh phong phú giúp chuyển hóa phân bò thành mùn hữu cơ dễ tiêu, giàu humic và sạch mùi hôi.',
        },
        {
          label: 'c',
          level: 'vandung',
          text: 'Nếu đàn 100 con bò thịt của hợp tác xã thải ra trung bình 1,5 tấn phân tươi/ngày (tương đương 45 tấn phân tươi/tháng) được đưa hết vào nuôi giun quế theo định mức trên, thì mỗi tháng hợp tác xã thu được khoảng 22,5 – 27 tấn phân trùn quế và hơn 1,1 tấn giun quế tươi.',
          isTrue: true,
          explanation:
            'Với 45 tấn phân tươi/tháng: lượng phân trùn quế = 45 × (0,5..0,6) = 22,5..27 tấn; lượng giun tươi = 45 × (25..30 kg) = 1.125..1.350 kg (> 1,1 tấn).',
        },
        {
          label: 'd',
          level: 'vandung',
          text: 'Khi mới tẩy giun sán cho đàn bò bằng thuốc hóa học liều cao, công nhân nên lấy ngay phân bò chứa đầy thuốc tẩy giun trong 2 ngày đầu đó đổ trực tiếp vào luống nuôi giun quế.',
          isTrue: false,
          explanation:
            'Phân gia súc vừa uống thuốc tẩy giun sán có chứa dư lượng hoạt chất diệt giun rất cao; nếu cho giun quế ăn ngay sẽ làm chết sạch toàn bộ đàn giun quế trong trại.',
        },
      ],
    },
    {
      number: 4,
      context:
        'Tình huống thực tế: Tại một trang trại nuôi lợn quy mô 1.500 con ở tỉnh Hà Nam, hệ thống hầm Biogas композит/HDPE dung tích 500 m3 đang vận hành ổn định, cung cấp khí đốt và chạy máy phát điện hàng ngày. Tuy nhiên, sau một đợt dịch bệnh trên địa bàn, công nhân đã pha hóa chất sát trùng cực mạnh (Xút NaOH 3% và Chlorine đậm đặc) dội rửa toàn bộ các dãy chuồng liên tục 5 ngày và cho toàn bộ nước hóa chất sát trùng đó chảy thẳng xuống hầm Biogas. Chỉ 1 tuần sau, áp suất khí trên đồng hồ đo giảm về 0, hầm Biogas ngừng sinh khí hoàn toàn và nước thải đầu ra có mùi hôi nồng nặc.',
      citation:
        'Nguồn: Dự án Chương trình Khí sinh học ngành Chăn nuôi Việt Nam (Cục Chăn nuôi – Bộ NN&PTNT) – Sổ tay vận hành, bảo dưỡng và xử lí sự cố công trình Biogas, 2023.',
      statements: [
        {
          label: 'a',
          level: 'biet',
          text: 'Công trình khí sinh học (Biogas) xử lí chất thải chăn nuôi dựa trên quá trình lên men phân hủy chất hữu cơ của hệ vi sinh vật trong điều kiện kị khí (không có oxygen).',
          isTrue: true,
          explanation:
            'Theo Bài 22 SGK Công nghệ 11 (trang 114), hầm biogas hoạt động nhờ hệ vi sinh vật kị khí phân giải chất hữu cơ tạo khí CH4 và CO2.',
        },
        {
          label: 'b',
          level: 'hieu',
          text: 'Nguyên nhân làm hầm Biogas ngừng sinh khí ("chết hầm") là do lượng lớn xút (NaOH) và Chlorine đậm đặc chảy vào hầm đã làm biến động pH đột ngột và tiêu diệt nhóm vi khuẩn sinh khí methane rất nhạy cảm trong hầm.',
          isTrue: true,
          explanation:
            'Nhóm vi khuẩn/cổ khuẩn sinh methane (Methanogens) rất mẫn cảm với chất sát trùng, kháng sinh và pH quá kiềm/quá chua (pH tối ưu là 6,8–7,5).',
        },
        {
          label: 'c',
          level: 'vandung',
          text: 'Để phòng ngừa sự cố trên khi tổng vệ sinh sát trùng chuồng trại, trang trại cần thiết kế van chuyển hướng dòng chảy tại rãnh thu gom để dẫn nước rửa chuồng có chứa hóa chất sát trùng đậm đặc sang hố trung hòa xử lí riêng, không cho chảy thẳng vào hầm Biogas.',
          isTrue: true,
          explanation:
            'Tách riêng đường thoát nước mưa và nước rửa chuồng chứa hóa chất sát trùng đậm đặc khỏi đường vào hầm Biogas là nguyên tắc kĩ thuật quan trọng khi vận hành hầm.',
        },
        {
          label: 'd',
          level: 'vandung',
          text: 'Khi hầm Biogas bị ngừng sinh khí và nghi bị tắc ống dẫn, công nhân nên cầm bật lửa hoặc đuốc đang cháy chui xuống lòng hầm Biogas để soi kiểm tra xem còn khí methane hay không.',
          isTrue: false,
          explanation:
            'Tuyệt đối nghiêm cấm mang lửa xuống hầm Biogas hoặc chui xuống hầm khi chưa thông khí vì khí CH4 trộn O2 sẽ gây nổ hầm và khí H2S, CO2 tích tụ trong hầm kín gây ngạt tử vong ngay lập tức.',
        },
      ],
    },
  ],
};
