import { ChapterMCQItem } from './chapterReviewData';

/**
 * Ngân hàng bổ sung 5 câu Vận dụng (level: 'vandung') cho từng chương Lớp 10 (8 chương = 40 câu)
 * và từng chương Lớp 11 (6 chương = 30 câu) theo chuẩn SGK Kết nối tri thức với cuộc sống.
 * Khi gộp với 20 câu Nhận biết + 10 câu Thông hiểu sẵn có, mỗi chương Lớp 10 và Lớp 11
 * có trọn bộ 35 câu trắc nghiệm nhiều lựa chọn (20 Nhận biết · 10 Thông hiểu · 5 Vận dụng) + 4 câu Đúng/Sai.
 */
export const VANDUNG_MCQ_10: Record<string, ChapterMCQItem[]> = {
  // ==========================================================================
  // LỚP 10 - CHƯƠNG I: GIỚI THIỆU CHUNG VỀ TRỒNG TRỌT (5 câu Vận dụng)
  // ==========================================================================
  'cn10-c1': [
    {
      number: 31,
      level: 'vandung',
      question:
        'Một hợp tác xã tại Lâm Đồng muốn trồng hoa cúc thương phẩm phục vụ dịp Tết Nguyên đán nhưng cây có nguy cơ ra hoa sớm khi ngày ngắn. Biện pháp kĩ thuật nào sau đây cần áp dụng để điều khiển thời điểm ra hoa đúng dịp Tết?',
      options: [
        'Thắp đèn chiếu sáng bổ sung vào ban đêm ở giai đoạn sinh trưởng sinh dưỡng để kéo dài thời gian ngày, ức chế phân hóa mầm hoa sớm',
        'Che tối hoàn toàn bằng bạt đen suốt ban ngày để rút ngắn thời gian chiếu sáng xuống dưới 6 giờ mỗi ngày',
        'Ngừng tưới nước hoàn toàn và cắt tỉa hết bộ lá xanh của cây hoa cúc ngay từ khi mới trồng được 2 tuần',
        'Bón thật nhiều phân đạm urê liều cao vào giai đoạn nụ hoa đã nở nhằm làm chậm quá trình tàn của cánh hoa',
      ],
      correctIndex: 0,
      explanation:
        'Hoa cúc là cây ngày ngắn; chiếu đèn ban đêm làm gián đoạn đêm dài, giúp cây tiếp tục vươn cao tích lũy dinh dưỡng và chỉ phân hóa mầm hoa khi ngắt đèn đúng lịch Tết (Bài 2 SGK CN 10).',
    },
    {
      number: 32,
      level: 'vandung',
      question:
        'Gia đình bác An ở vùng đồng bằng sông Hồng dự định luân canh các cây trồng trong năm để tận dụng điều kiện nhiệt độ từng mùa. Phương án bố trí cơ cấu cây trồng nào sau đây phù hợp nhất với nguồn gốc nhiệt độ của cây?',
      options: [
        'Vụ xuân và vụ mùa trồng lúa nước (cây nhiệt đới); vụ đông trồng bắp cải, su hào, khoai tây (cây có nguồn gốc ôn đới)',
        'Vụ xuân và vụ mùa trồng su hào, bắp cải, súp lơ; vụ đông giá rét gieo cấy lúa nước và trồng sầu riêng, chôm chôm',
        'Trồng độc canh cây táo tây và cây lê ôn đới suốt cả ba vụ tại vùng đất trũng ngập nước quanh năm ở đồng bằng',
        'Chỉ gieo trồng ngô và lúa vào những tháng có nhiệt độ trung bình xuống dưới 10 °C để tránh sâu bệnh hại phát sinh',
      ],
      correctIndex: 0,
      explanation:
        'Vụ xuân – hè nóng ẩm thích hợp cho cây nhiệt đới (lúa); vụ đông lạnh mát (15–20 °C) ở miền Bắc rất thích hợp cho các cây rau có nguồn gốc ôn đới như su hào, cải bắp, khoai tây (Bài 2 SGK CN 10).',
    },
    {
      number: 33,
      level: 'vandung',
      question:
        'Một trang trại trồng dưa lưới trong nhà màng tại Tây Ninh đối mặt với tình trạng thiếu lao động tưới nước và nắng nóng làm bốc hơi nước mạnh. Giải pháp công nghệ cao nào giải quyết đồng thời hai vấn đề trên hiệu quả nhất?',
      options: [
        'Lắp đặt hệ thống tưới nhỏ giọt tự động kết hợp châm phân (Fertigation) điều khiển qua cảm biến độ ẩm giá thể và hẹn giờ',
        'Dùng máy bơm công suất lớn xả ngập trắng toàn bộ mặt nền nhà màng mỗi ngày ba lần vào buổi trưa nắng gắt',
        'Tháo bỏ toàn bộ mái che nhà màng để đón nước mưa tự nhiên và dùng lao động thủ công gánh nước tưới từng gốc',
        'Phun thuốc hóa học ức chế thoát hơi nước làm đóng kín hoàn toàn khí khổng của lá dưa lưới suốt cả vụ trồng',
      ],
      correctIndex: 0,
      explanation:
        'Hệ thống tưới nhỏ giọt kết hợp châm phân tự động theo cảm biến giúp cấp nước và dinh dưỡng chính xác tận vùng rễ, tiết kiệm 50–70% nước và giảm tối đa nhân công (Bài 1 SGK CN 10).',
    },
    {
      number: 34,
      level: 'vandung',
      question:
        'Khi thiết kế hệ thống đèn LED nhân tạo cho phòng nuôi cấy mô và trồng rau thủy canh trong nhà kín không có ánh sáng mặt trời, kĩ sư nông nghiệp cần ưu tiên phối hợp hai dải ánh sáng đơn sắc nào để cây quang hợp tối ưu?',
      options: [
        'Phối hợp ánh sáng đỏ (bước sóng 620–680 nm) và ánh sáng xanh tím (bước sóng 430–470 nm) theo tỉ lệ phù hợp từng giai đoạn',
        'Chỉ sử dụng duy nhất ánh sáng màu lục (bước sóng 500–550 nm) vì lá cây có màu xanh lục nên hấp thụ mạnh nhất',
        'Chỉ sử dụng tia tử ngoại (UV-C) cường độ cao chiếu liên tục 24/24 giờ để kích thích tế bào lá phân chia nhanh',
        'Sử dụng hoàn toàn tia hồng ngoại nhiệt công suất lớn để đốt nóng bề mặt lá thay thế cho quá trình quang hợp',
      ],
      correctIndex: 0,
      explanation:
        'Diệp lục hấp thụ mạnh nhất tia đỏ (tổng hợp carbohydrate) và tia xanh tím (tổng hợp protein, amino acid); phối hợp LED đỏ và xanh tím cho hiệu suất quang hợp cao nhất (Bài 2 SGK CN 10).',
    },
    {
      number: 35,
      level: 'vandung',
      question:
        'Một doanh nghiệp muốn xuất khẩu nhãn lồng và thanh long sang thị trường châu Âu (EU) và Nhật Bản với giá trị cao. Doanh nghiệp cần tổ chức sản xuất theo định hướng nào sau đây để đáp ứng rào cản kĩ thuật quốc tế?',
      options: [
        'Xây dựng vùng trồng có mã số định danh, canh tác theo chuẩn GlobalGAP/VietGAP, ghi chép nhật kí điện tử truy xuất nguồn gốc',
        'Tăng gấp đôi liều lượng thuốc bảo vệ thực vật hóa học sát ngày thu hoạch để quả bóng đẹp và không có côn trùng bám',
        'Thu gom nông sản trôi nổi không rõ nguồn gốc từ nhiều hộ nhỏ lẻ rồi đóng chung vào một bao bì xuất khẩu',
        'Khai thác tối đa đất rừng phòng hộ đầu nguồn để mở rộng diện tích trồng tự phát không cần quy hoạch vùng trồng',
      ],
      correctIndex: 0,
      explanation:
        'Để xuất khẩu chính ngạch vào thị trường khó tính (EU, Nhật, Mỹ), nông sản phải có mã số vùng trồng, đạt chuẩn GlobalGAP/VietGAP, kiểm soát dư lượng và truy xuất được nguồn gốc (Bài 1 SGK CN 10).',
    },
  ],

  // ==========================================================================
  // LỚP 10 - CHƯƠNG II: ĐẤT TRỒNG (5 câu Vận dụng)
  // ==========================================================================
  'cn10-c2': [
    {
      number: 31,
      level: 'vandung',
      question:
        'Sau khi đo pH của một mẫu đất canh tác tại nông trại bằng máy đo pH, kết quả hiển thị pH = 4,3. Để trồng rau cải và đậu tương đạt năng suất cao trên mảnh đất này, người nông dân cần áp dụng tổ hợp biện pháp cải tạo nào?',
      options: [
        'Bón vôi bột với liều lượng thích hợp để khử chua (kết tủa Al3+, Fe3+), kết hợp bón phân hữu cơ hoai mục và không bón phân sinh lí chua',
        'Bón bổ sung thật nhiều phân đạm sunphat (NH4)2SO4 và phân kali sunphat K2SO4 để làm giảm thêm độ pH của đất',
        'Bơm nước biển có độ mặn cao vào ngâm ruộng trong nhiều tuần liên tục để muối NaCl trung hòa hết lượng ion H+',
        'Cày lật tầng đất sét chua tiềm tàng ở sâu dưới đáy lên hẳn bề mặt ruộng rồi gieo hạt ngay lập tức không cần bón phân',
      ],
      correctIndex: 0,
      explanation:
        'Đất có pH = 4,3 là đất rất chua; cần bón vôi (Ca2+ đẩy H+, Al3+ ra khỏi keo đất để trung hòa), kết hợp phân hữu cơ tăng đệm đất và tránh phân chua sinh lí (Bài 4 SGK CN 10).',
    },
    {
      number: 32,
      level: 'vandung',
      question:
        'Một hộ nông dân mua xơ dừa tươi từ cơ sở lột vỏ dừa về để làm giá thể trồng dưa lưới trong túi bầu. Trước khi đưa vào trồng, hộ nông dân cần xử lí xơ dừa theo quy trình nào để cây không bị ngộ độc rễ?',
      options: [
        'Ngâm xơ dừa trong nước sạch 2–3 ngày rồi ngâm tiếp nước vôi trong (2 kg vôi/100 L nước) từ 5–7 ngày và rửa sạch để loại bỏ tanin, lignin',
        'Đổ trực tiếp xơ dừa tươi vừa xay vào túi bầu rồi đem trồng cây con ngay để tận dụng tối đa vị chát tự nhiên trong vỏ dừa',
        'Trộn xơ dừa tươi với dầu hỏa và muối ăn nồng độ cao rồi phơi nắng 1 giờ trước khi gieo hạt giống rau màu',
        'Nung xơ dừa tươi trong lò nhiệt độ cao 1 200 °C suốt 10 giờ liên tục cho đến khi biến thành viên sỏi gốm cứng',
      ],
      correctIndex: 0,
      explanation:
        'Xơ dừa tươi chứa nhiều tanin (vị chát) và lignin gây kết tủa protein và ức chế rễ cây; phải ngâm nước sạch và ngâm nước vôi (2 kg/100 L) rồi xả sạch trước khi trồng (Bài 5 SGK CN 10).',
    },
    {
      number: 33,
      level: 'vandung',
      question:
        'Tại vùng đất ven biển tỉnh Tiền Giang bị xâm nhập mặn vào mùa khô làm nồng độ muối tan trong đất vượt trên 3‰, quy trình cải tạo đất mặn nào sau đây mang lại hiệu quả đúng nguyên lí trao đổi ion của keo đất?',
      options: [
        'Đắp đê ngăn mặn, bón vôi (CaSO4 hoặc CaCO3) để ion Ca2+ đẩy ion Na+ ra khỏi keo đất, sau đó đưa nước ngọt vào ngâm và tháo rửa mặn',
        'Bơm trực tiếp nước ngọt vào ruộng rồi giữ nguyên nước đó phơi nắng cho bốc hơi cạn khô mà không tháo nước ra kênh tiêu',
        'Bón thật nhiều muối ăn NaCl kết hợp phân đạm urê để tăng áp suất thẩm thấu giúp rễ cây lúa hút nước dễ dàng hơn',
        'Cày lật sâu lớp đất mặn ở tầng dưới lên mặt ruộng vào giữa mùa khô hạn khi không có nguồn nước ngọt dự trữ',
      ],
      correctIndex: 0,
      explanation:
        'Cải tạo đất mặn dựa trên nguyên lí dùng Ca2+ (bón vôi) đẩy Na+ khỏi lớp khuếch tán của keo đất vào dung dịch đất, sau đó dùng nước ngọt rửa trôi Na+ qua hệ thống tiêu (Bài 4 SGK CN 10).',
    },
    {
      number: 34,
      level: 'vandung',
      question:
        'Một vùng đất xám bạc màu ở trung du Bắc Bộ có tầng canh tác mỏng, thành phần cơ giới nhẹ (nhiều cát, ít sét và mùn), nghèo dinh dưỡng. Giải pháp canh tác bền vững nào phù hợp nhất cho vùng đất này?',
      options: [
        'Cày sâu dần kết hợp tăng cường bón phân hữu cơ, phân xanh, vôi và luân canh – xen canh cây họ Đậu để bồi dục đất',
        'Chỉ bón độc nhất phân đạm hóa học với liều lượng thật lớn vào lúc trời mưa to để phân thấm nhanh xuống tầng đất sâu',
        'Cày sâu một lần 40 cm lật toàn bộ tầng đất cái nghèo dinh dưỡng lên mặt đất và bỏ hoang không trồng cây che phủ',
        'Đốt sạch toàn bộ tàn dư thực vật, rơm rạ trên mặt ruộng và tháo cạn kiệt nguồn nước tưới quanh năm',
      ],
      correctIndex: 0,
      explanation:
        'Đất xám bạc màu nghèo sét và mùn, tầng đất mỏng nên phải cày sâu dần kết hợp bón nhiều phân hữu cơ, trồng cây phân xanh/cây họ Đậu cố định đạm để tăng keo hữu cơ (Bài 4 SGK CN 10).',
    },
    {
      number: 35,
      level: 'vandung',
      question:
        'Để phối trộn giá thể trồng cây cảnh cao cấp trong chậu vừa đảm bảo giữ ẩm, giàu dinh dưỡng hữu cơ vừa thông thoáng khí và thoát nước tốt cho bộ rễ, người trồng nên kết hợp các loại giá thể nào sau đây?',
      options: [
        'Phối trộn xơ dừa đã xử lí tanin, than bùn (hoặc phân trùn quế) với trấu hun và đá perlite theo tỉ lệ cân đối',
        'Chỉ sử dụng 100% đất sét nặng lấy ở tầng sâu phơi khô đập nhỏ rồi nén thật chặt vào trong chậu trồng cây',
        'Chỉ sử dụng 100% sỏi gốm keramzit kích thước lớn mà không bổ sung bất kì giá thể giữ ẩm hay dung dịch dinh dưỡng nào',
        'Sử dụng mùn cưa gỗ tươi vừa xẻ trộn với vôi sống nguyên chất rồi đem trồng cây ngay trong ngày hôm đó',
      ],
      correctIndex: 0,
      explanation:
        'Phối trộn xơ dừa + than bùn (giữ ẩm, giàu mùn) với trấu hun + đá perlite (xốp thoáng khí, thoát nước tốt, sạch mầm bệnh) tạo môi trường tối ưu cho bộ rễ (Bài 5 SGK CN 10).',
    },
  ],

  // ==========================================================================
  // LỚP 10 - CHƯƠNG III: PHÂN BÓN (5 câu Vận dụng)
  // ==========================================================================
  'cn10-c3': [
    {
      number: 31,
      level: 'vandung',
      question:
        'Khi chuẩn bị trộn phân bón lót cho ruộng ngô, một học sinh thấy trong kho có phân lân nung chảy, vôi bột nông nghiệp, phân đạm amoni sunphat (NH4)2SO4 và phân hữu cơ vi sinh. Nguyên tắc phối trộn nào sau đây là đúng kĩ thuật?',
      options: [
        'Tuyệt đối không trộn phân đạm amoni với vôi bột hoặc phân lân nung chảy có tính kiềm vì sẽ giải phóng khí NH3 làm mất đạm',
        'Trộn chung phân đạm amoni với vôi bột và nước trước 1 tuần để phản ứng sinh nhiệt giúp hạt ngô nảy mầm nhanh hơn',
        'Trộn trực tiếp phân vi sinh sống với vôi bột nồng độ cao và thuốc diệt khuẩn hóa học để tăng mật độ vi sinh vật',
        'Hòa tan phân lân nung chảy vào bình phun thuốc để phun trực tiếp lên lá ngô non thay cho việc bón lót vào đất',
      ],
      correctIndex: 0,
      explanation:
        'Phân đạm chứa ion NH4+ khi gặp chất kiềm (vôi, tro bếp, lân nung chảy) sẽ xảy ra phản ứng tạo khí NH3 bay hơi gây thất thoát đạm và cháy lá (Bài 8 SGK CN 10).',
    },
    {
      number: 32,
      level: 'vandung',
      question:
        'Một hợp tác xã trồng lúa có lượng lớn rơm rạ và thân cây ngô sau thu hoạch. Để ủ thành phân hữu cơ giàu dinh dưỡng, tơi xốp và tiêu diệt hạt cỏ dại, hợp tác xã nên áp dụng quy trình kĩ thuật nào sau đây?',
      options: [
        'Băm nhỏ phế phụ phẩm, tưới ẩm đạt 60–65%, phối trộn chế phẩm vi sinh phân giải xenlulozơ (Trichoderma) và trát bùn/đậy bạt ủ hoai mục',
        'Đốt cháy hoàn toàn toàn bộ rơm rạ ngay trên mặt ruộng khô để lấy tro trắng bón trực tiếp cho cây lúa vụ kế tiếp',
        'Vùi tươi nguyên cả bó rơm rạ khô cứng vào ruộng ngay ngày hôm trước rồi cấy lúa con ngay ngày hôm sau',
        'Ngâm rơm rạ với dung dịch thuốc trừ cỏ và dầu diesel trong bể kín để rơm mục nhanh trong vòng 24 giờ',
      ],
      correctIndex: 0,
      explanation:
        'Ủ rơm rạ với chế phẩm vi sinh (như nấm đối kháng Trichoderma) ở ẩm độ ~60% giúp phân giải nhanh cellulose thành mùn hữu cơ, nhiệt độ đống ủ 50–60 °C diệt mầm bệnh và hạt cỏ (Bài 9, 10 SGK CN 10).',
    },
    {
      number: 33,
      level: 'vandung',
      question:
        'Khi bảo quản phân đạm urê và phân kali clorua tại kho của trang trại trong mùa mưa ẩm, người quản lí kho cần thực hiện biện pháp nào sau đây để tránh phân bị chảy nước, vón cục và giảm chất lượng?',
      options: [
        'Buộc kín miệng bao nhựa chống ẩm, xếp bao trên kệ gỗ (pallet) cách mặt đất và cách tường, để nơi khô ráo thoáng mát',
        'Đổ rời toàn bộ phân đạm và phân kali thành một đống chung trực tiếp trên nền đất ẩm ngoài hiên kho cho thoáng gió',
        'Phơi các bao phân đạm urê trực tiếp ngoài trời nắng gắt 40 °C suốt cả tháng để hạt phân luôn khô cứng',
        'Xếp chung các bao phân hóa học sát cạnh bếp lò đốt than củi và bể chứa xăng dầu của máy cày',
      ],
      correctIndex: 0,
      explanation:
        'Phân hóa học (đặc biệt là đạm urê, đạm nitrat) rất dễ hút ẩm chảy nước và phân hủy ở nhiệt độ cao; cần bảo quản chống ẩm, kê trên kệ gỗ, chống nóng và không trộn lẫn (Bài 8 SGK CN 10).',
    },
    {
      number: 34,
      level: 'vandung',
      question:
        'Một vườn cam đang ở giai đoạn nuôi quả lớn và tích lũy đường nhưng lá có biểu hiện thiếu vi lượng kẽm (Zn) và bo (B). Biện pháp bón phân bổ sung nào sau đây giúp cây hấp thụ nhanh nhất và đạt hiệu quả kinh tế cao?',
      options: [
        'Pha dung dịch phân bón lá chứa vi lượng Zn, B đúng nồng độ khuyến cáo rồi phun đều lên hai mặt lá vào sáng sớm hoặc chiều mát',
        'Rải phân lân nung chảy dạng bột khô lên trên bề mặt cỏ quanh gốc cam vào lúc giữa trưa nắng gắt không tưới nước',
        'Bón thúc thật nhiều phân đạm urê liều gấp ba lần bình thường vào gốc cam ngay trước ngày thu hoạch quả',
        'Tưới nước vôi đặc trực tiếp lên tán lá và hoa quả cam để cung cấp vi lượng kẽm và bo cho cây',
      ],
      correctIndex: 0,
      explanation:
        'Phân vi lượng cần lượng nhỏ nhưng thiết yếu; phun qua lá vào lúc mát trời (khí khổng mở, ít bốc hơi) giúp cây hấp thụ nhanh, không bị keo đất cố định (Bài 7, 8 SGK CN 10).',
    },
    {
      number: 35,
      level: 'vandung',
      question:
        'Khi bón phân vi sinh cố định đạm (Rhizobium) cho ruộng lạc (đậu phộng) vào đầu vụ xuân, người nông dân cần thao tác như thế nào để vi sinh vật trong phân sống sót và hình thành nốt sần hiệu quả nhất?',
      options: [
        'Trộn đều chế phẩm vi sinh với hạt giống hoặc bón lót vào rãnh đất đủ ẩm rồi lấp đất ngay, tránh ánh nắng trực tiếp mặt trời',
        'Rải mỏng phân vi sinh lên mặt ruộng khô cằn lúc 12 giờ trưa nắng gắt để tia tử ngoại kích hoạt vi khuẩn phát triển',
        'Hòa phân vi sinh chung với dung dịch thuốc trừ nấm bệnh gốc đồng (CuSO4) rồi phun ướt đẫm hạt giống trước khi gieo',
        'Đun sôi chế phẩm phân vi sinh với nước ở 100 °C trong 15 phút để tiệt trùng hoàn toàn trước khi đem bón ra ruộng',
      ],
      correctIndex: 0,
      explanation:
        'Phân vi sinh chứa vi sinh vật sống nên nhạy cảm với tia UV nắng gắt, nhiệt độ cao và hóa chất diệt khuẩn; cần trộn hạt trong bóng râm hoặc bón vào đất ẩm và lấp đất ngay (Bài 9 SGK CN 10).',
    },
  ],

  // ==========================================================================
  // LỚP 10 - CHƯƠNG IV: CÔNG NGHỆ GIỐNG CÂY TRỒNG (5 câu Vận dụng)
  // ==========================================================================
  'cn10-c4': [
    {
      number: 31,
      level: 'vandung',
      question:
        'Sau vụ thu hoạch ngô lai F1 có năng suất rất cao (đạt 8 tấn/ha), một hộ nông dân định giữ lại hạt ngô thương phẩm thu được từ ruộng F1 này để làm giống gieo cho vụ sau. Là kĩ thuật viên, em sẽ tư vấn như thế nào?',
      options: [
        'Không dùng hạt thu từ cây F1 làm giống cho vụ sau vì ở thế hệ F2 các gene phân li làm giảm mạnh ưu thế lai, cây không đồng đều và năng suất sụt giảm',
        'Nên giữ lại toàn bộ hạt F1 thu hoạch được để làm giống vì thế hệ F2 sẽ có ưu thế lai cao gấp đôi so với thế hệ F1',
        'Chỉ cần ngâm hạt thu từ ruộng F1 vào nước muối ấm là có thể duy trì nguyên vẹn ưu thế lai suốt 10 thế hệ liên tiếp',
        'Chọn những bắp ngô nhỏ nhất trên ruộng F1 để làm giống vì hạt nhỏ sẽ không xảy ra hiện tượng phân li tính trạng',
      ],
      correctIndex: 0,
      explanation:
        'Ưu thế lai biểu hiện cao nhất ở F1 rồi giảm dần qua các thế hệ sau do sự phân li tạo các kiểu gene đồng hợp lặn có hại; vì vậy hạt lai F1 chỉ dùng trồng thương phẩm 1 vụ (Bài 13 SGK CN 10).',
    },
    {
      number: 32,
      level: 'vandung',
      question:
        'Một trung tâm giống cây trồng cần nhân nhanh 100 000 cây giống hoa đồng tiền và chuối già Nam Mỹ sạch bệnh virus, đồng nhất về mặt di truyền từ một vài cây mẹ ưu tú trong thời gian ngắn. Phương pháp nhân giống nào đáp ứng tốt nhất yêu cầu này?',
      options: [
        'Nhân giống vô tính bằng công nghệ nuôi cấy mô tế bào thực vật (vi nhân giống in vitro) từ mô phân sinh đỉnh sinh trưởng',
        'Thu hạt tự nhiên từ quả chuối và hoa đồng tiền ngoài đồng ruộng rồi đem gieo trực tiếp trên luống đất cát',
        'Sử dụng phương pháp chiết cành thủ công bằng bầu đất bùn ao trên từng thân cây chuối và cây hoa đồng tiền',
        'Phun tia phóng xạ gamma liều cao vào hạt giống để gây đột biến ngẫu nhiên hàng loạt ngoài đồng ruộng',
      ],
      correctIndex: 0,
      explanation:
        'Nuôi cấy mô tế bào (dựa trên tính toàn năng của tế bào) từ đỉnh sinh trưởng giúp nhân nhanh với hệ số nhân cực lớn, cây con đồng nhất di truyền và sạch virus (Bài 14 SGK CN 10).',
    },
    {
      number: 33,
      level: 'vandung',
      question:
        'Tại vùng ven biển thường xuyên bị ngập mặn, nhà chọn giống muốn kết hợp bộ rễ khỏe, chịu mặn tốt của giống cà chua dại (hoặc bầu lấy vỏ) với khả năng cho quả to, ngọt của giống dưa hấu/cà chua cao sản. Biện pháp nhân giống nào hiệu quả nhất?',
      options: [
        'Áp dụng kĩ thuật ghép cây: dùng cây có bộ rễ khỏe chịu mặn, kháng bệnh làm gốc ghép và dùng giống quả ngon năng suất cao làm cành/ngọn ghép',
        'Đem cành của giống cao sản giâm trực tiếp xuống vùng đất ngập mặn mà không cần xử lí hay sử dụng gốc ghép',
        'Trồng xen hai giống cạnh nhau để bộ rễ của chúng tự động trao đổi gene chịu mặn trong đất chỉ sau một tuần',
        'Ngâm hạt giống dưa hấu cao sản vào nước biển đặc 10% trước khi gieo để hạt tự biến đổi thành giống chịu mặn',
      ],
      correctIndex: 0,
      explanation:
        'Kĩ thuật ghép kết hợp được ưu điểm bộ rễ khỏe, chống chịu sâu bệnh/mặn/úng của gốc ghép với phẩm chất nông sản tốt của cành ghép (Bài 14 SGK CN 10).',
    },
    {
      number: 34,
      level: 'vandung',
      question:
        'Trong bài thực hành giâm cành hoa muống (hoặc rau ngót, hoa hồng), để tỉ lệ cành giâm ra rễ đạt trên 90% và cành không bị héo rũ hay thối gốc, học sinh cần thực hiện đúng các thao tác kĩ thuật nào sau đây?',
      options: [
        'Chọn cành bánh tẻ khỏe mạnh cắt vát 15–20 cm, tỉa bớt lá giảm thoát hơi nước, nhúng gốc vào dung dịch kích rễ (α-NAA/IBA) rồi cắm nghiêng vào giá thể ẩm thoáng',
        'Chọn cành non mềm nhất vừa mới nhú, giữ nguyên toàn bộ lá to và hoa rồi cắm thẳng xuống bùn đặc ngập nước giữa trời nắng gắt',
        'Chọn cành già khô đã hóa gỗ hoàn toàn, nhúng toàn bộ phần ngọn lá vào dung dịch thuốc diệt cỏ trước khi cắm xuống đất',
        'Cắt khúc cành dài 2 cm không có mắt ngủ nào rồi vùi sâu 30 cm dưới lòng đất sét khô cứng không tưới nước',
      ],
      correctIndex: 0,
      explanation:
        'Cành bánh tẻ giàu dinh dưỡng dự trữ, cắt bớt phiến lá giúp giảm thoát hơi nước khi chưa có rễ, nhúng chất điều hòa sinh trưởng auxin (IBA, α-NAA) kích thích mô sẹo phân hóa rễ bất định nhanh (Bài 14, 15 SGK CN 10).',
    },
    {
      number: 35,
      level: 'vandung',
      question:
        'Để duy trì độ thuần chủng và cấp giống của một giống lúa thuần mới được công nhận phục vụ sản xuất đại trà cho nông dân, cơ sở sản xuất hạt giống cần tổ chức nhân giống theo sơ đồ thứ tự các cấp hạt giống nào?',
      options: [
        'Từ hạt giống tác giả (siêu nguyên chủng) nhân ra hạt giống nguyên chủng, sau đó từ nguyên chủng nhân ra hạt giống xác nhận để cung cấp đại trà',
        'Lấy trực tiếp hạt lúa thương phẩm thu mua từ các chợ nông sản đem đóng bao làm hạt giống siêu nguyên chủng',
        'Từ hạt giống xác nhận đại trà ngoài đồng nhân ngược lại thành hạt giống nguyên chủng và hạt giống tác giả',
        'Trộn lẫn tất cả các giống lúa khác nhau trên cùng một cánh đồng để các giống tự thụ phấn chéo tạo hạt giống nguyên chủng',
      ],
      correctIndex: 0,
      explanation:
        'Quy trình sản xuất giống cây trồng chuẩn gồm: Hạt giống siêu nguyên chủng (SNC) -> Hạt giống nguyên chủng (NC) -> Hạt giống xác nhận (XN) phục vụ sản xuất đại trà (Bài 12, 13 SGK CN 10).',
    },
  ],

  // ==========================================================================
  // LỚP 10 - CHƯƠNG V: PHÒNG TRỪ SÂU, BỆNH HẠI CÂY TRỒNG (5 câu Vận dụng)
  // ==========================================================================
  'cn10-c5': [
    {
      number: 31,
      level: 'vandung',
      question:
        'Trên cánh đồng lúa đang giai đoạn đẻ nhánh rộ, cán bộ bảo vệ thực vật điều tra thấy mật độ rầy nâu mới ở mức thấp (chưa tới ngưỡng gây hại kinh tế) và trên ruộng có rất nhiều nhện lùn, bọ rùa đỏ và kiến ba khoang. Biện pháp xử lí nào đúng nguyên tắc IPM?',
      options: [
        'Không phun thuốc trừ sâu hóa học phổ rộng để bảo vệ quần thể thiên địch tự nhiên (nhện, bọ rùa) khống chế rầy nâu, kết hợp thăm đồng thường xuyên',
        'Phun ngay thuốc trừ sâu hóa học cực độc liều gấp đôi trên toàn cánh đồng để tiêu diệt sạch cả rầy nâu lẫn nhện và bọ rùa',
        'Bón thúc thật nhiều phân đạm urê để lá lúa xanh đậm mềm yếu giúp rầy nâu tập trung lại một chỗ dễ bắt bằng tay',
        'Tháo cạn sạch nước ruộng và đốt lửa trực tiếp trên mặt ruộng đang có lúa xanh để xua đuổi côn trùng',
      ],
      correctIndex: 0,
      explanation:
        'Theo nguyên tắc Quản lí dịch hại tổng hợp (IPM), khi mật độ sâu hại dưới ngưỡng kinh tế và thiên địch dồi dào, không phun thuốc hóa học để bảo tồn thiên địch tự nhiên khống chế sâu hại (Bài 19 SGK CN 10).',
    },
    {
      number: 32,
      level: 'vandung',
      question:
        'Một vườn bưởi và cam sành xuất hiện triệu chứng lá vàng lốm đốm, cành khô chết dần từ ngọn, quả nhỏ bị lệch tâm và hạt bị thối đen; trên vườn có nhiều rầy chổng cánh sinh sống. Chẩn đoán nguyên nhân và giải pháp phòng trừ nào sau đây là chính xác?',
      options: [
        'Cây mắc bệnh vàng lá greening do vi khuẩn Candidatus Liberibacter lây truyền qua rầy chổng cánh; cần trồng cây giống sạch bệnh, cắt tiêu hủy cành bệnh và trừ rầy chổng cánh',
        'Cây mắc bệnh đạo ôn do nấm Pyricularia oryzae gây ra; chỉ cần phun nước vôi loãng lên quả là cây tự khỏi hoàn toàn sau 2 ngày',
        'Cây bị thiếu ánh sáng mặt trời; chỉ cần chặt bỏ toàn bộ rễ cọc của cây bưởi và ngừng tưới nước trong suốt mùa khô',
        'Cây bị sâu đục thân bướm hai chấm của cây lúa tấn công; cần bơm nước ngập kín ngọn cây bưởi trong 15 ngày',
      ],
      correctIndex: 0,
      explanation:
        'Bệnh vàng lá greening trên cây có múi do vi khuẩn sống trong mạch libe, môi giới truyền bệnh là rầy chổng cánh; bệnh không có thuốc trị đặc hiệu nên phải dùng giống sạch bệnh, tiêu hủy cây bệnh nặng và diệt rầy truyền bệnh (Bài 18 SGK CN 10).',
    },
    {
      number: 33,
      level: 'vandung',
      question:
        'Hợp tác xã trồng rau cải ăn lá theo tiêu chuẩn hữu cơ phát hiện sâu tơ và sâu xanh bướm trắng mới nở mật độ cao. Loại chế phẩm nào sau đây được phép phun để diệt sâu hiệu quả mà vẫn đảm bảo an toàn tuyệt đối cho người tiêu dùng?',
      options: [
        'Phun chế phẩm sinh học chứa vi khuẩn Bacillus thuringiensis (Bt) hoặc nấm xanh Metarhizium, nấm trắng Beauveria vào chiều mát',
        'Phun thuốc trừ sâu hóa học nhóm lân hữu cơ có thời gian cách li 30 ngày rồi thu hoạch rau bán ngay vào sáng hôm sau',
        'Pha thuốc diệt cỏ cháy nhanh với dầu nhớt thải để phun ướt đẫm toàn bộ luống rau cải đang chuẩn bị thu hoạch',
        'Rải vôi sống nguyên chất phủ kín mặt lá rau cải vào lúc 12 giờ trưa để đốt cháy sâu non và lá rau',
      ],
      correctIndex: 0,
      explanation:
        'Chế phẩm vi khuẩn Bt tiết tinh thể protein độc đặc hiệu làm liệt ruột sâu non bộ Cánh vảy (sâu tơ, sâu xanh) nhưng an toàn với người, vật nuôi và môi trường (Bài 19, 20 SGK CN 10).',
    },
    {
      number: 34,
      level: 'vandung',
      question:
        'Khi chuẩn bị pha chế dung dịch Boóc-đô (Bordeaux 1%) để phòng trừ nấm bệnh cho vườn cây ăn quả trong bài thực hành, thao tác pha trộn nào sau đây là đúng quy trình kĩ thuật để tạo ra huyền phù xanh da trời bền vững, không bị kết tủa hỏng?',
      options: [
        'Đổ từ từ dung dịch đồng sunphat (CuSO4) loãng vào dung dịch nước vôi sữa (Ca(OH)2) vừa đổ vừa khuấy đều trong chậu nhựa, kiểm tra pH trung tính hoặc hơi kiềm',
        'Đổ ngược dung dịch nước vôi đặc vào dung dịch CuSO4 đang đun sôi trong nồi bằng sắt hoặc bằng nhôm',
        'Trộn bột CuSO4 khô với vôi cục chưa tôi trong thùng tôn sắt rồi đổ nước sôi vào đậy kín nắp suốt 3 ngày',
        'Pha dung dịch CuSO4 nguyên chất không cần vôi rồi phun trực tiếp lên lá non để axit sunfuric đốt cháy nấm bệnh',
      ],
      correctIndex: 0,
      explanation:
        'Khi pha thuốc Boóc-đô, bắt buộc đổ từ từ dung dịch CuSO4 vào nước vôi sữa (không làm ngược lại và không dùng thùng kim loại sắt/nhôm vì Cu2+ bị đẩy ra) để tạo hạt keo Cu(OH)2 mịn lơ lửng bám dính tốt (Bài 20 SGK CN 10).',
    },
    {
      number: 35,
      level: 'vandung',
      question:
        'Để hạn chế tối đa sự tích lũy nguồn sâu, bệnh hại (như bệnh héo xanh vi khuẩn trên cà chua, khoai tây, ớt) lưu tồn trong đất qua nhiều vụ liên tiếp mà không tốn chi phí hóa chất, biện pháp canh tác nào sau đây hiệu quả nhất?',
      options: [
        'Thực hiện luân canh cây trồng khác họ (như luân canh cây họ Cà với lúa nước hoặc cây họ Đậu), kết hợp cày ải phơi đất và vệ sinh đồng ruộng',
        'Trồng độc canh liên tục cây cà chua và cây ớt trên cùng một mảnh đất suốt 10 vụ liền không nghỉ',
        'Giữ lại toàn bộ thân lá cây cà chua bị bệnh héo xanh của vụ trước vùi trực tiếp xuống hố trồng cây con vụ mới',
        'Bón thật nhiều phân đạm hóa học và tưới ngập úng thường xuyên cho ruộng cà chua để vi khuẩn không thở được',
      ],
      correctIndex: 0,
      explanation:
        'Luân canh cây trồng khác họ (đặc biệt luân canh cây cạn họ Cà với lúa nước) làm cắt đứt nguồn thức ăn kí chủ chuyên tính và tiêu diệt mầm bệnh héo xanh vi khuẩn Ralstonia solanacearum trong đất (Bài 18, 19 SGK CN 10).',
    },
  ],

  // ==========================================================================
  // LỚP 10 - CHƯƠNG VI: KĨ THUẬT TRỒNG TRỌT (5 câu Vận dụng)
  // ==========================================================================
  'cn10-c6': [
    {
      number: 31,
      level: 'vandung',
      question:
        'Một nông hộ có mảnh đất thịt nhẹ cần chuẩn bị làm đất để trồng khoai lang và lạc (đậu phộng). Quy trình làm đất nào sau đây phù hợp nhất với đặc điểm sinh học của các cây lấy củ này?',
      options: [
        'Cày sâu, bừa kĩ đập nhỏ đất cho tơi xốp, nhặt sạch cỏ dại, bón lót phân hữu cơ và lên luống cao thoát nước tốt giúp củ dễ phình to',
        'Không cày bừa mà giữ nguyên mặt đất nén chặt, đắp bờ giữ nước ngập sâu 20 cm suốt cả vụ như ruộng cấy lúa nước',
        'Chỉ phát sơ cỏ trên mặt đất rồi rải hạt lạc và dây khoai lang nằm phơi trên bề mặt đá sỏi khô cứng',
        'Đào các hố sâu 1 mét cách nhau 5 mét như trồng cây gỗ rừng lâu năm rồi đổ đầy đất sét đặc vào hố',
      ],
      correctIndex: 0,
      explanation:
        'Khoai lang và lạc hình thành củ trong đất, cần đất tơi xốp thoáng khí và thoát nước nhanh; lên luống cao giúp tầng đất mặt dày, dễ vun xới, chống ngập úng thối củ (Bài 21 SGK CN 10).',
    },
    {
      number: 32,
      level: 'vandung',
      question:
        'Trước khi đem gieo hạt lúa giống cho vụ xuân khi thời tiết còn lạnh, người nông dân thực hiện phơi nhẹ hạt giống, ngâm hạt trong nước ấm "3 sôi 2 lạnh" (khoảng 54 °C) có pha dung dịch xử lí nấm, sau đó ủ ấm cho nứt nanh. Mục đích của quy trình này là gì?',
      options: [
        'Phá ngủ nghỉ, tiêu diệt mầm nấm bệnh bám trên vỏ hạt và kích thích phôi hạt nảy mầm nhanh, đồng đều khi gieo ra ruộng',
        'Làm chín hoàn toàn nội nhũ tinh bột bên trong hạt lúa để côn trùng và chim chuột không ăn được hạt giống',
        'Biến đổi giống lúa ngắn ngày thành giống lúa dài ngày có khả năng sống dưới đáy hồ sâu không cần ánh sáng',
        'Thay thế hoàn toàn việc làm đất, bón phân lót và tưới nước trong suốt 3 tháng sinh trưởng của cây lúa',
      ],
      correctIndex: 0,
      explanation:
        'Xử lí hạt giống bằng nhiệt (nước ấm 54 °C) kết hợp ủ ẩm giúp diệt nguồn nấm bệnh trên vỏ hạt, hoạt hóa enzyme thủy phân chất dự trữ giúp hạt nảy mầm đồng loạt (Bài 21 SGK CN 10).',
    },
    {
      number: 33,
      level: 'vandung',
      question:
        'Khi chăm sóc vườn cam và xoài ở giai đoạn kiến thiết cơ bản (1–3 năm đầu sau trồng), kĩ thuật viên hướng dẫn nông dân cắt ngọn cây ở độ cao 60–80 cm để giữ lại 3–4 cành cấp 1 phân bố đều các hướng, sau đó tiếp tục tạo cành cấp 2, cấp 3. Biện pháp này nhằm mục đích gì?',
      options: [
        'Tạo bộ khung tán cân đối, vững chắc, thông thoáng giúp cây nhận ánh sáng đều, hạn chế sâu bệnh và cho năng suất cao ổn định về sau',
        'Làm cho cây cam và cây xoài ngừng sinh trưởng vĩnh viễn để biến thành cây cỏ lùn chỉ cao dưới 20 cm',
        'Để cây dồn toàn bộ nhựa luyện xuống rễ nhằm thu hoạch củ cam và củ xoài ở dưới lòng đất',
        'Làm rụng toàn bộ lá xanh của cây để cây không còn thực hiện quá trình quang hợp hay thoát hơi nước nữa',
      ],
      correctIndex: 0,
      explanation:
        'Đốn tỉa, tạo hình giai đoạn kiến thiết cơ bản giúp khống chế chiều cao, tạo bộ khung tán hình phễu/hình bán cầu thông thoáng, chịu được gió bão và phân bố quả đều (Bài 21, 24 SGK CN 10).',
    },
    {
      number: 34,
      level: 'vandung',
      question:
        'Sau khi thu hoạch 50 tấn cà chua và vải thiều tươi để vận chuyển đi tiêu thụ ở xa và xuất khẩu, doanh nghiệp nên áp dụng công nghệ bảo quản nào sau đây để giữ độ tươi ngon lâu nhất mà không dùng hóa chất độc hại?',
      options: [
        'Phân loại quả lành lặn, làm mát sơ bộ rồi bảo quản trong kho lạnh kết hợp điều chỉnh khí quyển (CA/MAP: giảm O2, tăng nhẹ CO2 phù hợp)',
        'Chất đống toàn bộ quả tươi trong kho tôn kín nóng bức 42 °C và phun nước liên tục lên đống quả suốt 10 ngày',
        'Phơi trực tiếp quả cà chua và vải thiều tươi dưới nắng gắt trên mặt đường nhựa trước khi đóng vào thùng kín',
        'Ngâm quả tươi vào dung dịch formol công nghiệp nồng độ cao để diệt vi khuẩn gây thối quả',
      ],
      correctIndex: 0,
      explanation:
        'Bảo quản lạnh kết hợp điều chỉnh thành phần khí quyển (CA – Controlled Atmosphere hoặc bao bì MAP) giúp ức chế cường độ hô hấp và sự sinh tổng hợp ethylene của rau quả tươi, kéo dài thời hạn bảo quản (Bài 22 SGK CN 10).',
    },
    {
      number: 35,
      level: 'vandung',
      question:
        'Gia đình em muốn tận dụng khoảng sân thượng có nắng 6 giờ/ngày để trồng rau ăn lá và cà chua trong chậu nhựa phục vụ bữa ăn sạch hằng ngày. Quy trình kĩ thuật nào sau đây đảm bảo cây sinh trưởng tốt trên sân thượng?',
      options: [
        'Chọn chậu có lỗ thoát nước đáy, phối trộn đất sạch với xơ dừa và phân trùn quế (tỉ lệ 5:3:2), tưới đủ ẩm sáng/chiều và bón thúc định kì phân hữu cơ sinh học',
        'Dùng chậu bịt kín hoàn toàn đáy không có lỗ thoát nước, đổ ngập nước đến miệng chậu để ngâm rễ cà chua suốt cả tháng',
        'Lấy cát xây dựng nguyên chất không trộn phân bón đổ vào chậu và chỉ tưới nước mỗi tháng một lần vào buổi trưa nắng',
        'Trồng dày 50 cây cà chua trong một chậu nhỏ đường kính 15 cm và đặt chậu trong gầm cầu thang tối hoàn toàn',
      ],
      correctIndex: 0,
      explanation:
        'Trồng cây trong chậu (Bài 23 SGK CN 10) bắt buộc chậu phải có lỗ thoát nước chống thối rễ, giá thể tơi xốp giàu dinh dưỡng hữu cơ, đặt nơi đủ ánh sáng và tưới nước – bón thúc hợp lí.',
    },
  ],

  // ==========================================================================
  // LỚP 10 - CHƯƠNG VII: TRỒNG TRỌT CÔNG NGHỆ CAO (5 câu Vận dụng)
  // ==========================================================================
  'cn10-c7': [
    {
      number: 31,
      level: 'vandung',
      question:
        'Một trang trại trồng rau xà lách bằng hệ thống thủy canh hồi lưu (NFT) ở vùng có mùa hè nắng nóng gay gắt nhận thấy dung dịch dinh dưỡng trong ống nhựa bị nóng lên trên 33 °C làm hàm lượng oxygen hòa tan giảm và rễ rau bị thối. Giải pháp khắc phục nào hợp lí nhất?',
      options: [
        'Chôn bể chứa dung dịch ngầm dưới đất mát, bọc cách nhiệt đường ống, kết hợp sục khí bổ sung oxygen và dùng lưới cắt nắng/quạt làm mát nhà màng',
        'Tăng gấp 5 lần nồng độ muối khoáng trong dung dịch dinh dưỡng để nước có nhiệt độ sôi cao hơn và không bị bốc hơi',
        'Ngừng hoàn toàn máy bơm tuần hoàn dung dịch vào ban ngày để nước đứng yên trong ống dưới ánh nắng mặt trời',
        'Đổ thêm nước sôi vào bể chứa dung dịch thủy canh để tiêu diệt các vi sinh vật làm thối rễ rau xà lách',
      ],
      correctIndex: 0,
      explanation:
        'Trong thủy canh hồi lưu, nhiệt độ dung dịch quá cao (>30 °C) làm giảm mạnh lượng O2 hòa tan gây ngạt và thối rễ; cần hạ nhiệt bể chứa (chôn ngầm/làm mát), sục khí tăng O2 và giảm nhiệt nhà màng (Bài 26 SGK CN 10).',
    },
    {
      number: 32,
      level: 'vandung',
      question:
        'Một công ty sản xuất giống khoai tây tại Đà Lạt muốn nhân nhanh củ giống khoai tây siêu nguyên chủng sạch bệnh với hệ số nhân gấp hàng chục lần so với trồng trên đất, đồng thời kiểm soát tuyệt đối bệnh héo xanh và tuyến trùng. Công nghệ nào phù hợp nhất?',
      options: [
        'Ứng dụng công nghệ khí canh (Aeroponics): treo bộ rễ trong buồng tối kín và phun sương dung dịch dinh dưỡng định kì tự động vào rễ',
        'Trồng khoai tây trực tiếp trên ruộng đất trũng ngập nước quanh năm đã từng trồng cà chua bị bệnh héo xanh nặng',
        'Ngâm toàn bộ thân và lá cây khoai tây chìm hoàn toàn dưới đáy bể nước sâu 2 mét không có ánh sáng',
        'Trồng khoai tây trên nền bê tông khô hoàn toàn mà không phun dung dịch dinh dưỡng hay tưới nước trong suốt vụ',
      ],
      correctIndex: 0,
      explanation:
        'Công nghệ khí canh (Bài 26 SGK CN 10) cực kì ưu việt để sản xuất củ giống khoai tây sạch bệnh: rễ lơ lửng trong không khí tối giàu O2, được phun sương dinh dưỡng giúp tạo số lượng củ bi (minituber) gấp 8–10 lần trồng đất.',
    },
    {
      number: 33,
      level: 'vandung',
      question:
        'Trong nhà kính thông minh trồng dâu tây ứng dụng công nghệ IoT, khi cảm biến nhiệt độ báo nhiệt độ trong nhà kính tăng lên 34 °C và cảm biến độ ẩm không khí giảm xuống 45%, bộ điều khiển trung tâm sẽ tự động kích hoạt cơ cấu chấp hành nào?',
      options: [
        'Tự động kéo lưới cắt nắng, bật hệ thống quạt thông gió đối lưu kết hợp giàn làm mát (cooling pad) hoặc phun sương để hạ nhiệt và tăng độ ẩm',
        'Tự động đóng kín toàn bộ cửa thông gió và bật hệ thống lò sưởi nhiệt công suất cao bên trong nhà kính',
        'Tự động xả hết toàn bộ dung dịch phân bón ra ngoài cống thoát nước và ngắt nguồn điện của toàn trang trại',
        'Tự động bật đèn chiếu sáng sưởi ấm cường độ cao để làm khô nhanh bề mặt lá cây dâu tây',
      ],
      correctIndex: 0,
      explanation:
        'Hệ thống IoT trong nhà kính thông minh (Bài 25, 27 SGK CN 10) thu thập dữ liệu từ cảm biến nhiệt – ẩm và tự động điều khiển lưới che nắng, quạt thông gió, giàn cooling pad/phun sương đưa tiểu khí hậu về ngưỡng tối ưu cho dâu tây (18–25 °C).',
    },
    {
      number: 34,
      level: 'vandung',
      question:
        'Khi pha dung dịch dinh dưỡng thủy canh cho rau ăn lá (như cải ngọt, xà lách), vì sao kĩ thuật viên luôn phải pha riêng cốt phân A (chứa Calcium nitrate) và cốt phân B (chứa các muối sulfate, phosphate, vi lượng) rồi mới hòa loãng từng phần vào bể nước?',
      options: [
        'Để tránh phản ứng hóa học trực tiếp giữa ion Ca2+ đậm đặc với ion SO4^2- và PO4^3- gây kết tủa CaSO4, Ca3(PO4)2 làm mất dinh dưỡng và tắc béc tưới',
        'Để làm cho dung dịch dinh dưỡng chuyển sang màu đen sẫm giúp ngăn cản ánh sáng chiếu vào bể chứa',
        'Để hai dung dịch phản ứng nổ sinh nhiệt làm ấm nước tưới cho rau trong những ngày mùa hè nóng bức',
        'Vì nếu pha chung một bình thì các nguyên tố khoáng đa lượng N, P, K sẽ tự động bay hơi hết vào không khí',
      ],
      correctIndex: 0,
      explanation:
        'Ở nồng độ đậm đặc, Ca2+ trong dung dịch A tác dụng ngay với SO4^2- và HPO4^2- trong dung dịch B tạo kết tủa thạch cao (CaSO4) và canxi photphat không tan, cây không hút được (Bài 26 SGK CN 10).',
    },
    {
      number: 35,
      level: 'vandung',
      question:
        'Một học sinh thực hành trồng rau thủy canh tĩnh (bán thủy canh) tại nhà bằng thùng xốp có nắp đục lỗ đặt rọ nhựa. Để cây rau sinh trưởng tốt mà không cần máy bơm sục khí điện, học sinh cần lưu ý kĩ thuật quan trọng nào khi đổ dung dịch vào thùng?',
      options: [
        'Không đổ dung dịch ngập sát đáy rọ mà phải chừa một khoảng không khí (2–4 cm) dưới nắp thùng để phần trên bộ rễ hô hấp lấy oxygen',
        'Đổ dung dịch dinh dưỡng tràn ngập lên tận ngọn lá rau và đậy kín nilon không cho không khí lọt vào thùng',
        'Pha dung dịch dinh dưỡng có độ dẫn điện EC cao gấp 10 lần khuyến cáo (EC > 15 mS/cm) để rau lớn nhanh trong 2 ngày',
        'Đặt thùng thủy canh ở trong phòng kín tối hoàn toàn suốt 30 ngày để rêu xanh không phát triển được',
      ],
      correctIndex: 0,
      explanation:
        'Trong thủy canh tĩnh không có máy sục khí, phải để khoảng trống không khí giữa mặt thoáng dung dịch và đáy giá thể (2–4 cm) để phần rễ khí sinh hấp thụ O2, tránh ngạt và thối rễ (Bài 26 SGK CN 10).',
    },
  ],

  // ==========================================================================
  // LỚP 10 - CHƯƠNG VIII: BẢO VỆ MÔI TRƯỜNG TRONG TRỒNG TRỌT (5 câu Vận dụng)
  // ==========================================================================
  'cn10-c8': [
    {
      number: 31,
      level: 'vandung',
      question:
        'Tại một xã chuyên thâm canh lúa 3 vụ/năm, sau mỗi vụ thu hoạch nhiều hộ dân thường đốt đồng (đốt rơm rạ) gây khói bụi mù mịt, phát thải khí nhà kính và làm chai cứng đất. Giải pháp nào sau đây vừa bảo vệ môi trường vừa mang lại lợi ích kinh tế trực tiếp cho nông dân?',
      options: [
        'Thu gom rơm rạ bằng máy cuộn rơm để trồng nấm rơm, làm thức ăn dự trữ cho trâu bò hoặc phun chế phẩm vi sinh ủ làm phân bón hữu cơ tại ruộng',
        'Đổ toàn bộ rơm rạ tươi xuống các kênh mương thủy lợi và sông ngòi quanh xã để dòng nước cuốn trôi đi nơi khác',
        'Tưới xăng dầu vào rơm rạ để đốt cháy nhanh hơn vào ban đêm nhằm tránh lực lượng chức năng phát hiện',
        'Gom toàn bộ rơm rạ đem chôn lấp chung với vỏ chai lọ thuốc bảo vệ thực vật tại các bãi rác sinh hoạt tự phát',
      ],
      correctIndex: 0,
      explanation:
        'Thu gom rơm rạ làm nguyên liệu trồng nấm, thức ăn gia súc, đệm lót sinh học hoặc ủ phân hữu cơ bằng vi sinh giúp tuần hoàn chất dinh dưỡng, tăng thu nhập và chấm dứt ô nhiễm khói bụi do đốt đồng (Bài 28, 29, 30 SGK CN 10).',
    },
    {
      number: 32,
      level: 'vandung',
      question:
        'Sau khi pha và phun thuốc bảo vệ thực vật trên đồng ruộng, người nông dân còn dư một số vỏ bao bì, chai lọ thuốc BVTV. Cách xử lí nào sau đây đúng quy định bảo vệ môi trường trong trồng trọt?',
      options: [
        'Tráng rửa bao bì 3 lần khi pha thuốc, sau đó thu gom toàn bộ vỏ bao bì bỏ vào bể chứa chuyên dụng có mái che tại đồng ruộng để đơn vị chức năng xử lí',
        'Vứt trực tiếp vỏ chai lọ thuốc trừ sâu xuống mương nước tưới tiêu ngay cạnh ruộng hoặc bờ ao nuôi cá',
        'Đem vỏ chai nhựa đựng thuốc trừ sâu về nhà rửa bằng xà phòng rồi tái sử dụng làm chai đựng nước uống và dầu ăn',
        'Gom vỏ bao bì nhựa thuốc BVTV đốt trực tiếp cùng với lá khô ngay đầu hướng gió cạnh khu dân cư',
      ],
      correctIndex: 0,
      explanation:
        'Bao bì thuốc BVTV sau sử dụng là chất thải nguy hại; phải thu gom vào bể chứa chuyên dụng trên cánh đồng để cơ quan chuyên môn thu gom, tiêu hủy an toàn theo quy định (Bài 28, 29 SGK CN 10).',
    },
    {
      number: 33,
      level: 'vandung',
      question:
        'Một vùng canh tác ngô và sắn trên đất dốc ở miền núi đang bị xói mòn, rửa trôi lớp đất mặt màu mỡ và gây bồi lấp, ô nhiễm nguồn nước hồ chứa phía dưới mỗi khi mưa lớn. Tổ hợp biện pháp canh tác nào khắc phục hiệu quả nhất tình trạng này?',
      options: [
        'Canh tác theo đường đồng mức, làm ruộng bậc thang, trồng xen cây họ Đậu che phủ đất và trồng các băng cây phân xanh cản dòng chảy',
        'Cày xới đất theo chiều dọc từ đỉnh dốc thẳng xuống chân dốc và phun thuốc diệt cỏ làm trống trơn toàn bộ mặt đất',
        'Chặt phá hết các dải cây rừng ở đỉnh đồi để mở rộng diện tích trồng sắn độc canh liên tục nhiều năm',
        'Bón thật nhiều phân đạm hóa học dễ tan ngay trước các trận mưa rào lớn để nước mưa cuốn phân đi khắp sườn đồi',
      ],
      correctIndex: 0,
      explanation:
        'Trên đất dốc, canh tác theo đường đồng mức kết hợp trồng xen cây họ Đậu che phủ mặt đất và băng cây xanh giúp giảm tốc độ dòng chảy mặt, giữ đất, giữ phân và bảo vệ nguồn nước (Bài 29 SGK CN 10).',
    },
    {
      number: 34,
      level: 'vandung',
      question:
        'Một trang trại kết hợp trồng trọt (lúa, ngô, cỏ voi, vườn cây ăn quả) và chăn nuôi (bò thịt, trâu, giun quế) muốn xây dựng mô hình nông nghiệp tuần hoàn không chất thải. Quy trình kết nối nào sau đây là hợp lí nhất?',
      options: [
        'Dùng phụ phẩm trồng trọt (rơm, thân ngô) ủ chua làm thức ăn cho bò và nuôi nấm; phân bò dùng nuôi giun quế và ủ phân hữu cơ vi sinh bón quay lại cho vườn cây',
        'Đốt bỏ toàn bộ phụ phẩm trồng trọt, còn phân bò xả thẳng ra suối tự nhiên và mua 100% phân hóa học bón cho cây ăn quả',
        'Dùng thuốc bảo vệ thực vật hóa học trộn vào cỏ voi cho bò ăn để tiêu diệt kí sinh trùng đường ruột của bò',
        'Chôn lấp toàn bộ rơm rạ và phân bò xuống hố sâu lót bạt kín không sử dụng cho bất kì hoạt động sản xuất nào',
      ],
      correctIndex: 0,
      explanation:
        'Mô hình nông nghiệp tuần hoàn tận dụng phế phụ phẩm trồng trọt làm thức ăn chăn nuôi/trồng nấm, và chất thải chăn nuôi được xử lí (nuôi trùn quế, ủ vi sinh) thành phân hữu cơ trả lại cho đất (Bài 29, 30 SGK CN 10).',
    },
    {
      number: 35,
      level: 'vandung',
      question:
        'Trong bài thực hành ủ phân hữu cơ từ phế phụ phẩm trồng trọt bằng chế phẩm vi sinh (Bài 30 SGK Công nghệ 10), khi kiểm tra độ ẩm nguyên liệu bằng cách nắm chặt một nắm nguyên liệu trong lòng bàn tay, dấu hiệu nào cho thấy độ ẩm đã đạt mức tối ưu (60–65%)?',
      options: [
        'Thấy nước rỉ nhẹ ra ở các kẽ ngón tay nhưng không nhỏ thành giọt, khi mở bàn tay ra khối nguyên liệu vẫn kết dính không bị rời rạc',
        'Nước chảy ròng ròng thành dòng liên tục qua kẽ tay như vắt khăn ướt sũng nước',
        'Nguyên liệu khô cứng hoàn toàn, khi mở tay ra bị bung rời ngay và có bụi bay mù mịt',
        'Nguyên liệu biến thành hỗn hợp bùn lỏng sệt ngập trong nước không thể cầm nắm được',
      ],
      correctIndex: 0,
      explanation:
        'Theo quy trình thực hành Bài 30 SGK CN 10, độ ẩm đống ủ đạt chuẩn 60–65% khi nắm chặt nguyên liệu thấy nước vừa rỉ ra kẽ ngón tay mà không nhỏ thành giọt.',
    },
  ],
};

export const VANDUNG_MCQ_11: Record<string, ChapterMCQItem[]> = {
  // ==========================================================================
  // LỚP 11 - CHƯƠNG I: GIỚI THIỆU CHUNG VỀ CHĂN NUÔI (5 câu Vận dụng)
  // ==========================================================================
  'cn11-c1': [
    {
      number: 31,
      level: 'vandung',
      question:
        'Một nhà đầu tư có diện tích đất hạn chế tại vùng ngoại thành nhưng có vốn lớn, muốn nuôi 5 000 con lợn thịt thương phẩm đạt năng suất cao, đồng đều, kiểm soát dịch bệnh chặt chẽ và không phụ thuộc thời tiết. Phương thức chăn nuôi nào phù hợp nhất?',
      options: [
        'Áp dụng phương thức chăn nuôi công nghiệp (thâm canh) trong chuồng kín có hệ thống điều khiển tiểu khí hậu, cho ăn uống tự động và an toàn sinh học',
        'Áp dụng phương thức chăn thả tự do hoàn toàn cho đàn lợn tự đi kiếm ăn ngoài đồng ruộng và kênh mương công cộng',
        'Nuôi nhốt tạm bợ trong các lán trại hở bằng tre nứa cạnh khu dân cư đông đúc và dùng thức ăn thừa chưa qua xử lí nhiệt',
        'Chia nhỏ 5 000 con lợn thả rông vào rừng phòng hộ tự nhiên không cần chuồng trại, bác sĩ thú y hay tiêm phòng vaccine',
      ],
      correctIndex: 0,
      explanation:
        'Chăn nuôi công nghiệp (thâm canh) trong chuồng kín tự động hóa giúp nuôi mật độ cao trên diện tích hẹp, kiểm soát tiểu khí hậu và an toàn sinh học tối ưu (Bài 2 SGK CN 11).',
    },
    {
      number: 32,
      level: 'vandung',
      question:
        'Một hợp tác xã ở vùng đồi gò trung du Bắc Bộ muốn phát triển chăn nuôi gà đặc sản (gà Đông Tảo, gà Hồ hoặc gà Mía) có chất lượng thịt thơm ngon, săn chắc và đảm bảo phúc lợi động vật. Mô hình chăn nuôi nào sau đây là tối ưu nhất?',
      options: [
        'Chăn nuôi bán công nghiệp (hữu cơ/VietGAP): kết hợp chuồng nuôi thông thoáng có đệm lót sinh học với vườn chăn thả rộng có cây bóng mát để gà vận động',
        'Nhốt chật cứng gà Đông Tảo trong các lồng sắt tầng hẹp suốt đời không cho di chuyển và chiếu đèn cường độ cao 24/24 giờ',
        'Thả gà hoàn toàn trong rừng hoang không có chuồng trú mưa nắng, không cho ăn thêm và không tiêm vaccine phòng bệnh',
        'Chỉ cho gà ăn duy nhất bột đá vôi trộn với phân đạm hóa học urê để chân gà to nhanh trong vòng 2 tuần',
      ],
      correctIndex: 0,
      explanation:
        'Chăn nuôi bán công nghiệp (kết hợp chuồng nuôi kiểm soát dịch bệnh, thức ăn chuẩn với sân vườn vận động tự nhiên) giúp giống gà bản địa có chất lượng thịt thơm chắc và đảm bảo phúc lợi động vật (Bài 2 SGK CN 11).',
    },
    {
      number: 33,
      level: 'vandung',
      question:
        'Khi vận chuyển đàn lợn thịt và gà thịt từ trang trại đến cơ sở giết mổ tập trung vào mùa hè nắng nóng, biện pháp nào sau đây tuân thủ đúng yêu cầu về phúc lợi động vật (Animal welfare) và giữ chất lượng thịt tốt nhất?',
      options: [
        'Vận chuyển vào sáng sớm hoặc chiều mát bằng xe chuyên dụng thông thoáng, mật độ hợp lí, không đánh đập và cho vật nuôi nghỉ ngơi uống nước trước khi giết mổ nhân đạo',
        'Nhồi nhét vật nuôi quá tải trong thùng xe kín mít vào lúc 12 giờ trưa nắng gắt và dùng gậy sắt đánh đập để lợn lên xe nhanh',
        'Bơm ép nước bẩn vào dạ dày vật nuôi ngay trước khi giết mổ để tăng khối lượng cân bán thương phẩm',
        'Trói chặt chân vật nuôi treo ngược ngoài thành xe tải chạy suốt 2 ngày liên tục không cho uống nước',
      ],
      correctIndex: 0,
      explanation:
        'Đảm bảo phúc lợi động vật khi vận chuyển và giết mổ (tránh sợ hãi, đau đớn, sốc nhiệt) vừa mang tính nhân đạo vừa tránh hiện tượng thịt PSE (nhạt màu, mềm, rỉ dịch) do stress (Bài 2 trang 17 SGK CN 11).',
    },
    {
      number: 34,
      level: 'vandung',
      question:
        'Trang trại bò sữa quy mô 1 000 con muốn theo dõi chính xác sản lượng sữa, lượng thức ăn thu nhận, thân nhiệt và chu kì động dục của từng cá thể bò cái mỗi ngày để phát hiện sớm bò ốm. Công nghệ nào cần trang bị cho đàn bò?',
      options: [
        'Gắn vòng cổ thông minh tích hợp cảm biến sinh học và thẻ chip RFID kết nối phần mềm quản lí đàn tự động (IoT)',
        'Thuê nhân công cầm sổ giấy đi theo từng con bò suốt 24 giờ mỗi ngày để đếm số bước chân bằng mắt thường',
        'Nhốt chung cả 1 000 con bò vào một bãi đất trống không đánh số tai và trộn kháng sinh vào bể nước uống chung',
        'Chỉ kiểm tra sức khỏe đàn bò mỗi năm một lần vào dịp cuối năm bằng cách cân tổng khối lượng cả đàn',
      ],
      correctIndex: 0,
      explanation:
        'Ứng dụng chip điện tử RFID và vòng cổ cảm biến IoT giúp nhận diện cá thể, đo thân nhiệt, thời gian nhai lại, vận động để phát hiện động dục và cảnh báo bệnh sớm tự động (Bài 1, 2 SGK CN 11).',
    },
    {
      number: 35,
      level: 'vandung',
      question:
        'Một hộ nông dân tại vùng ven biển Ninh Thuận có điều kiện khí hậu khô nóng, lượng mưa thấp, thảm thực vật chủ yếu là cỏ tự nhiên ngắn và cây bụi gai. Loài và giống vật nuôi nào sau đây thích nghi tốt nhất để phát triển chăn nuôi hàng hóa tại đây?',
      options: [
        'Nuôi cừu Phan Rang và dê (như dê Bách Thảo, dê Boer lai) vì chúng chịu khô nóng giỏi và tận dụng tốt thảm cỏ cây bụi nghèo dinh dưỡng',
        'Nuôi bò sữa cao sản Hà Lan (HF) thuần chủng ngoài bãi cát nắng nóng không cần chuồng làm mát vì bò HF rất ưa nhiệt độ 40 °C',
        'Nuôi vịt siêu thịt và ngỗng đàn quy mô lớn trên đồi cát khô hạn hoàn toàn không có ao hồ hay nguồn nước ngọt',
        'Nuôi lợn ngoại Landrace và Yorkshire thả rông ngoài đồi nắng để lợn tự gặm cành cây bụi gai thay thức ăn tinh',
      ],
      correctIndex: 0,
      explanation:
        'Cừu Phan Rang và dê là gia súc nhai lại nhỏ có khả năng chịu hạn, chịu nóng rất tốt, tận dụng hiệu quả bãi chăn thả khô cằn ở vùng Nam Trung Bộ (Bài 2 SGK CN 11).',
    },
  ],

  // ==========================================================================
  // LỚP 11 - CHƯƠNG II: CÔNG NGHỆ GIỐNG VẬT NUÔI (5 câu Vận dụng)
  // ==========================================================================
  'cn11-c2': [
    {
      number: 31,
      level: 'vandung',
      question:
        'Một trại giống lợn cần tuyển chọn những con lợn đực và lợn cái hậu bị có tốc độ sinh trưởng nhanh, tỉ lệ nạc cao và tiêu tốn thức ăn thấp nhất để đưa vào đàn giống hạt nhân. Phương pháp chọn lọc nào sau đây đem lại độ chính xác cao nhất?',
      options: [
        'Kết hợp kiểm tra năng suất cá thể (cân khối lượng, siêu âm độ dày mỡ lưng, tính FCR) với chọn lọc theo chỉ thị phân tử (MAS) và phả hệ',
        'Chỉ quan sát màu sắc lông da bên ngoài lúc lợn con mới sơ sinh được 1 ngày tuổi rồi quyết định giữ lại làm đực giống',
        'Chọn ngẫu nhiên những con lợn ăn tốn nhiều thức ăn nhất nhưng có lớp mỡ lưng dày nhất trong đàn thương phẩm',
        'Lấy những con lợn lai thương phẩm 3 máu (Duroc × Landrace × Yorkshire) giữ lại để nhân thuần chủng làm đàn ông bà',
      ],
      correctIndex: 0,
      explanation:
        'Kiểm tra năng suất cá thể (đo tăng trọng, dày mỡ lưng, FCR từ 25–100 kg) kết hợp chỉ thị phân tử DNA (MAS) giúp đánh giá chính xác giá trị giống di truyền của lợn hậu bị (Bài 4, 6 SGK CN 11).',
    },
    {
      number: 32,
      level: 'vandung',
      question:
        'Một trang trại nuôi lợn nái địa phương (lợn Móng Cái) có ưu điểm đẻ sai, nuôi con khéo, thích nghi tốt nhưng lợn con sinh ra có tỉ lệ mỡ cao và lớn chậm. Để sản xuất đàn lợn thịt thương phẩm vừa khỏe mạnh vừa lớn nhanh, nhiều nạc và bán hết sau 1 lứa nuôi, trang trại nên áp dụng phép lai nào?',
      options: [
        'Áp dụng lai kinh tế: cho lợn nái Móng Cái phối giống (thụ tinh nhân tạo) với tinh lợn đực ngoại cao sản (như Yorkshire, Landrace hoặc Duroc) để lấy con lai F1 nuôi thịt',
        'Cho lợn nái Móng Cái giao phối cận huyết với lợn đực cùng ổ đẻ liên tiếp qua 5 thế hệ để tăng tỉ lệ nạc',
        'Nhập hoàn toàn lợn rừng hoang dã về lai với lợn Móng Cái để lợn con tăng trọng đạt 100 kg chỉ sau 2 tháng',
        'Giữ lại toàn bộ con lai kinh tế F1 cho giao phối với nhau để làm giống nái sinh sản lâu dài qua nhiều thế hệ',
      ],
      correctIndex: 0,
      explanation:
        'Lai kinh tế giữa mẹ là giống nội (Móng Cái: đẻ sai, khéo nuôi con) với bố là giống ngoại cao sản (Yorkshire/Landrace/Duroc: lớn nhanh, siêu nạc) tạo con lai F1 có ưu thế lai cao dùng nuôi thương phẩm (Bài 5 SGK CN 11).',
    },
    {
      number: 33,
      level: 'vandung',
      question:
        'Tại đàn bò địa phương của một huyện miền núi, bò có tầm vóc nhỏ (160–180 kg), tỉ lệ thịt xẻ thấp. Ngành nông nghiệp địa phương muốn cải tạo nâng cao tầm vóc và khả năng chịu nóng của toàn bộ đàn bò cái nền qua nhiều thế hệ ("Sind hóa đàn bò"). Phương pháp nhân giống nào cần thực hiện?',
      options: [
        'Áp dụng lai cải tạo: dùng tinh bò đực giống cao sản (Red Sindhi hoặc Brahman) phối với bò cái Vàng địa phương, rồi tiếp tục lấy con cái lai phối ngược với đực cao sản qua 3–4 thế hệ',
        'Áp dụng nhân giống thuần chủng khép kín trong nội bộ đàn bò Vàng tầm vóc nhỏ của từng thôn bản mà không nhập tinh bò ngoại',
        'Áp dụng lai xa khác loài giữa bò Vàng địa phương với trâu đầm lầy để tạo ra con lai bất thụ nuôi lấy sữa',
        'Mổ thịt toàn bộ đàn bò cái địa phương ngay lập tức và nhập bò sữa ôn đới về thả rông trên núi đá dốc',
      ],
      correctIndex: 0,
      explanation:
        'Lai cải tạo (dùng giống cao sản Red Sindhi/Brahman cải tạo giống bò Vàng địa phương qua nhiều thế hệ) là cơ sở của chương trình "Sind hóa" và "Zebu hóa" đàn bò Việt Nam (Bài 5 SGK CN 11).',
    },
    {
      number: 34,
      level: 'vandung',
      question:
        'Một trung tâm giống bò sữa cao sản muốn từ một vài con bò cái HF kỉ lục (cho trên 10 000 kg sữa/chu kì) tạo ra hàng chục bê cái con mang 100% hệ gene ưu tú của bò mẹ cao sản trong một năm nhờ đàn bò cái thường mang thai hộ. Quy trình công nghệ nào cần áp dụng?',
      options: [
        'Gây siêu bài noãn ở bò cái cao sản, thụ tinh nhân tạo bằng tinh phân giới tính X, thu hoạch phôi ở ngày thứ 7 rồi cấy truyền phôi vào tử cung bò nhận đồng pha động dục',
        'Chỉ cho bò cái cao sản phối giống tự nhiên với bò đực và chờ bò mẹ tự mang thai đẻ mỗi năm 1 bê con theo sinh lí tự nhiên',
        'Lấy sữa tươi của bò cái cao sản tiêm trực tiếp vào tĩnh mạch của những con bò cái thường để biến chúng thành bò cao sản',
        'Lấy tế bào sừng của bò đực đem nuôi trong dung dịch muối ăn để tự mọc thành bê con mà không cần bò cái mang thai',
      ],
      correctIndex: 0,
      explanation:
        'Công nghệ cấy truyền phôi (MOET) kết hợp siêu bài noãn và tinh phân giới tính X giúp khai thác tối đa tiềm năng di truyền của con cái cao sản, tạo nhiều bê cái giống chất lượng cao mỗi năm (Bài 6 SGK CN 11).',
    },
    {
      number: 35,
      level: 'vandung',
      question:
        'Trước khi chọn mua lợn đực giống Duroc về khai thác tinh phục vụ thụ tinh nhân tạo cho đàn lợn siêu nạc, phòng xét nghiệm di truyền sử dụng kĩ thuật PCR kết hợp enzyme cắt giới hạn để kiểm tra gene Halothane (RYR1). Mục đích thực tiễn của xét nghiệm này là gì?',
      options: [
        'Loại bỏ các cá thể mang gene lặn đột biến Halothane gây hội chứng stress ở lợn (PSS) làm lợn dễ chết đột ngột khi vận chuyển và cho thịt PSE kém chất lượng',
        'Làm cho bộ lông của lợn đực Duroc chuyển từ màu nâu đỏ sang màu trắng tuyền giống lợn Yorkshire',
        'Giúp lợn đực Duroc có khả năng tự tổng hợp tất cả các vitamin và chất khoáng mà không cần ăn thức ăn',
        'Thay thế hoàn toàn việc tiêm các loại vaccine phòng bệnh dịch tả và lở mồm long móng cho đàn lợn con',
      ],
      correctIndex: 0,
      explanation:
        'Ứng dụng chỉ thị phân tử DNA (PCR-RFLP) sàng lọc gene Halothane giúp loại bỏ gene gây hội chứng stress (PSS) và thịt PSE (nhạt màu, mềm, rỉ dịch) ở lợn giống hướng nạc (Bài 6 SGK CN 11).',
    },
  ],

  // ==========================================================================
  // LỚP 11 - CHƯƠNG III: THỨC ĂN CHĂN NUÔI (5 câu Vận dụng)
  // ==========================================================================
  'cn11-c3': [
    {
      number: 31,
      level: 'vandung',
      question:
        'Một trang trại chăn nuôi bò sữa thu hoạch được 30 tấn cây ngô dày ở giai đoạn chín sáp và cỏ voi xanh vào cuối vụ hè thu. Để dự trữ lượng thức ăn thô xanh này cho bò ăn dần suốt mùa đông khô hanh mà vẫn giữ được nhiều vitamin, vị thơm chua dịu và tiêu hóa tốt, trang trại nên làm gì?',
      options: [
        'Băm nhỏ cỏ và cây ngô (2–3 cm), phơi héo nhẹ đạt độ ẩm 65–70%, phối trộn thêm 0,5% muối ăn và rỉ mật đường rồi nén chặt yếm khí trong hố/túi ủ chua cùng vi khuẩn lactic',
        'Chất đống toàn bộ cỏ tươi ướt sũng ngoài trời mưa không che đậy suốt 3 tháng để nấm mốc tự phân hủy thành bùn',
        'Đốt toàn bộ 30 tấn cây ngô và cỏ voi thành tro than rồi trộn với nước lã cho bò sữa uống hằng ngày vào mùa đông',
        'Ngâm cỏ tươi vào bể chứa vôi đặc và xút ăn da (NaOH) nồng độ 50% rồi vớt ra cho bò ăn ngay không cần rửa lại',
      ],
      correctIndex: 0,
      explanation:
        'Ủ chua thức ăn thô xanh ở độ ẩm 65–70% trong điều kiện yếm khí giúp vi khuẩn lactic lên men đường thành acid lactic hạ pH xuống ~4,0–4,2, ức chế vi khuẩn gây thối và bảo quản thức ăn lâu dài (Bài 9, 10 SGK CN 11).',
    },
    {
      number: 32,
      level: 'vandung',
      question:
        'Khi xây dựng khẩu phần ăn cho đàn lợn con giai đoạn sau cai sữa (khối lượng 7–15 kg), kĩ thuật viên dinh dưỡng cần lựa chọn và chế biến các nguyên liệu thức ăn như thế nào để lợn con không bị rối loạn tiêu hóa, tiêu chảy?',
      options: [
        'Sử dụng nguyên liệu giàu protein dễ tiêu (bột cá chất lượng cao, khô dầu đậu tương lên men, bột sữa), ép đùn/nấu chín tinh bột và bổ sung enzyme tiêu hóa, probiotics, acid hữu cơ',
        'Chỉ cho lợn con ăn toàn bộ bã mía thô, rơm khô nghiền và hạt đậu tương sống chưa qua rang chín để rèn luyện dạ dày',
        'Trộn thêm 5% urê hóa học vào cám sống cho lợn con ăn để hệ vi sinh vật dạ dày đơn tự tổng hợp protein',
        'Cắt giảm hoàn toàn protein và khoáng đa lượng trong khẩu phần, chỉ cho lợn con uống nước đường pha muối mặn',
      ],
      correctIndex: 0,
      explanation:
        'Lợn con mới cai sữa có hệ enzyme tiêu hóa và HCl dạ dày chưa hoàn thiện, lại nhạy cảm với chất kháng dinh dưỡng (trypsin inhibitor trong đậu tương sống); cần thức ăn chín/ép đùn dễ tiêu kèm probiotics và acid hữu cơ (Bài 8, 9 SGK CN 11).',
    },
    {
      number: 33,
      level: 'vandung',
      question:
        'Một đàn gà đẻ trứng thương phẩm đang ở giai đoạn đẻ đỉnh cao (tỉ lệ đẻ 90%) xuất hiện hiện tượng nhiều quả trứng có vỏ mỏng, sần sùi, dễ dập vỡ và một số gà mái bị bại liệt chân. Nguyên nhân dinh dưỡng và cách điều chỉnh khẩu phần nào sau đây là đúng?',
      options: [
        'Khẩu phần bị thiếu hụt Calcium (Ca), Phosphorus (P) hoặc Vitamin D3; cần bổ sung bột đá vôi/vỏ sò nghiền, DCP và Vitamin D3 đúng tỉ lệ Ca : P khoảng (3,5–4) : 1',
        'Khẩu phần bị dư thừa quá nhiều chất khoáng; cần cắt bỏ hoàn toàn bột đá, bột xương và chỉ cho gà ăn ngô hạt nguyên chất',
        'Do gà uống quá nhiều nước sạch; cần ngừng cấp nước uống cho đàn gà đẻ trong vòng 5 ngày liên tiếp để vỏ trứng cứng lại',
        'Do thiếu chất xơ thô không tan; cần thay thế 80% thức ăn hỗn hợp bằng mùn cưa và vỏ trấu khô cho gà đẻ ăn',
      ],
      correctIndex: 0,
      explanation:
        'Vỏ trứng gia cầm cấu tạo chủ yếu từ CaCO3; thiếu Ca, P hoặc thiếu Vitamin D3 (giúp hấp thụ Ca ở ruột) làm gà phải huy động Ca từ xương gây vỏ trứng mỏng và bại liệt (Bài 7, 8 SGK CN 11).',
    },
    {
      number: 34,
      level: 'vandung',
      question:
        'Trong kho bảo quản nguyên liệu thức ăn của trang trại vào mùa mưa ẩm, một lô ngô hạt và khô dầu lạc có độ ẩm 17% bị nhiễm nấm mốc Aspergillus flavus màu vàng lục. Cách xử lí nào sau đây đảm bảo an toàn cho đàn vật nuôi?',
      options: [
        'Không sử dụng lô nguyên liệu đã mốc nặng làm thức ăn chăn nuôi vì độc tố Aflatoxin rất bền nhiệt (nấu chín không phân hủy hết), gây ngộ độc gan và tồn dư trong thịt, trứng, sữa',
        'Đem lô ngô và khô dầu lạc mốc nấu sôi ở 100 °C trong 15 phút rồi cho vịt con và lợn nái mang thai ăn bình thường vì nhiệt đã diệt hết độc tố',
        'Phơi khô lại dưới nắng rồi nghiền mịn trộn lẫn với cám thơm để vật nuôi không phát hiện ra mùi mốc khi ăn',
        'Ngâm ngô mốc vào nước vôi đặc rồi đem喂 (cho ăn) trực tiếp cho đàn bò sữa đang vắt sữa cung cấp cho trẻ em',
      ],
      correctIndex: 0,
      explanation:
        'Nấm mốc Aspergillus flavus tiết độc tố vi nấm Aflatoxin cực độc gây hoại tử gan, ung thư và bài tiết qua sữa (Aflatoxin M1), chịu nhiệt tới trên 250 °C nên nấu chín thường không khử được (Bài 11 SGK CN 11).',
    },
    {
      number: 35,
      level: 'vandung',
      question:
        'Hộ chăn nuôi muốn tận dụng hạt đậu tương (đậu nành) tự trồng được để phối trộn thức ăn giàu đạm cho đàn lợn thịt và gà thịt. Trước khi nghiền trộn vào khẩu phần, bắt buộc phải xử lí hạt đậu tương bằng biện pháp nào và vì sao?',
      options: [
        'Phải rang chín, hấp chín hoặc ép đùn nhiệt để bất hoạt chất kháng trypsin (trypsin inhibitor) và urease giúp vật nuôi tiêu hóa hấp thụ được protein',
        'Phải ngâm hạt đậu tương sống trong nước đá lạnh 0 °C rồi cho ăn sống hoàn toàn để giữ nguyên hoạt tính của chất ức chế trypsin',
        'Chỉ cần trộn hạt đậu tương sống nguyên hạt với đất sét khô để làm tăng khối lượng thức ăn trong máng',
        'Phải ủ hạt đậu tương sống trong bóng tối ẩm ướt cho mọc nấm mốc đen hoàn toàn trước khi đem cho lợn ăn',
      ],
      correctIndex: 0,
      explanation:
        'Hạt đậu tương sống chứa yếu tố kháng dinh dưỡng (chất ức chế enzyme trypsin) gây khó tiêu, sưng tuyến tụy và tiêu chảy ở vật nuôi dạ dày đơn; xử lí nhiệt (rang/ép đùn) sẽ phá hủy chất ức chế này (Bài 9 SGK CN 11).',
    },
  ],

  // ==========================================================================
  // LỚP 11 - CHƯƠNG IV: PHÒNG, TRỊ BỆNH CHO VẬT NUÔI (5 câu Vận dụng)
  // ==========================================================================
  'cn11-c4': [
    {
      number: 31,
      level: 'vandung',
      question:
        'Khi dịch tả lợn châu Phi (ASF) đang bùng phát ở các xã lân cận, một trang trại lợn thịt quy mô 500 con chưa bị nhiễm bệnh cần thực hiện ngay tổ hợp biện pháp an toàn sinh học nào để bảo vệ đàn lợn?',
      options: [
        'Kiểm soát chặt người và phương tiện ra vào, phun sát trùng/rải vôi bột định kì, diệt vật chủ trung gian (ruồi, chuột, ve), không dùng thức ăn thừa chưa nấu chín và tiêm vaccine (nếu đủ điều kiện khuyến cáo)',
        'Cho thương lái và xe vận chuyển lợn từ vùng có dịch tự do đi thẳng vào khu chuồng nuôi để khảo sát giá bán lợn',
        'Thu gom nước rửa thịt lợn và thức ăn thừa từ các chợ dân sinh vùng dịch đem về đổ trực tiếp vào máng cho lợn ăn',
        'Tiêm kháng sinh Penicillin liều cao mỗi ngày cho toàn bộ đàn lợn để tiêu diệt virus dịch tả lợn châu Phi',
      ],
      correctIndex: 0,
      explanation:
        'Dịch tả lợn châu Phi do virus ASFV có sức đề kháng rất cao, kháng sinh không có tác dụng diệt virus; biện pháp quyết định là an toàn sinh học nghiêm ngặt (cách li, sát trùng, kiểm soát thức ăn/phương tiện) và vaccine được cấp phép (Bài 12, 13 SGK CN 11).',
    },
    {
      number: 32,
      level: 'vandung',
      question:
        'Một đàn gà nuôi tập trung có biểu hiện sốt cao, ủ rũ, xù lông, mào tím tái, khó thở (khò khè), sưng phù đầu mặt, xuất huyết da chân và tỉ lệ chết rất nhanh lên tới 80–90% chỉ sau 2–3 ngày. Nghi ngờ đàn gà mắc bệnh truyền nhiễm nguy hiểm nào và hướng xử lí đúng quy định thú y là gì?',
      options: [
        'Nghi mắc bệnh cúm gia cầm (H5N1/H5N6); phải cách li ngay khu chuồng, báo cáo cơ quan thú y địa phương lấy mẫu xét nghiệm, tuyệt đối không bán chạy hay giết mổ gà bệnh và thực hiện tiêu hủy, khử trùng theo quy định',
        'Gà chỉ bị cảm nắng thông thường; nên nhanh chóng đem toàn bộ số gà đang ốm ra chợ bán hạ giá hoặc mổ thịt cấp đông để thu hồi vốn',
        'Nghi mắc bệnh thiếu vitamin C; chỉ cần vứt xác gà chết xuống sông suối cạnh trại để cá ăn rồi cho gà còn lại uống nước muối',
        'Cho người lao động không đeo khẩu trang hay đồ bảo hộ vào ôm gà ốm ngủ chung trong phòng kín để sưởi ấm cho gà',
      ],
      correctIndex: 0,
      explanation:
        'Triệu chứng sốt cao, phù đầu mặt, tím mào, xuất huyết chân và chết hàng loạt rất nhanh là điển hình của Cúm gia cầm thể độc lực cao (bệnh truyền lây giữa động vật và người); bắt buộc khai báo thú y, cách li, tiêu hủy an toàn, nghiêm cấm bán chạy (Bài 14 SGK CN 11).',
    },
    {
      number: 33,
      level: 'vandung',
      question:
        'Khi sử dụng vaccine sống nhược độc (như vaccine Lasota phòng bệnh Newcastle ở gà hoặc vaccine PRRS ở lợn), kĩ thuật viên thú y cần tuân thủ quy tắc bảo quản và sử dụng nào sau đây để vaccine tạo được miễn dịch chủ động tốt nhất?',
      options: [
        'Bảo quản vaccine trong dây chuyền lạnh (2–8 °C), tránh ánh nắng trực tiếp, pha bằng nước pha chuyên dụng không chứa chất sát trùng và chỉ tiêm/nhỏ cho đàn vật nuôi đang khỏe mạnh',
        'Pha vaccine sống nhược độc bằng nước sôi 100 °C có pha thêm thuốc sát trùng Iodine để vaccine sạch khuẩn trước khi tiêm',
        'Chỉ chọn những con vật nuôi đang sốt cao, ủ rũ nặng do mắc bệnh truyền nhiễm để tiêm vaccine sống liều gấp ba lần',
        'Để lọ vaccine đã pha mở nắp ngoài trời nắng 35 °C suốt 3 ngày rồi mới đem tiêm dần cho từng chuồng nuôi',
      ],
      correctIndex: 0,
      explanation:
        'Vaccine sống nhược độc chứa mầm bệnh đã làm yếu; nhiệt độ cao, ánh sáng mặt trời và hóa chất sát trùng sẽ làm chết virus vaccine gây mất hiệu lực. Đồng thời chỉ chủng ngừa cho vật nuôi khỏe mạnh để cơ thể đáp ứng tạo kháng thể tốt (Bài 12, 15 SGK CN 11).',
    },
    {
      number: 34,
      level: 'vandung',
      question:
        'Một đàn bò thịt có triệu chứng sốt cao (40–41 °C), chảy nhiều nước bọt trắng như bọt xà phòng, niêm mạc miệng, lưỡi, lợi và kẽ móng chân nổi các mụn nước, sau đó vỡ ra gây loét làm bò đi lại khập khiễng. Chẩn đoán bệnh và biện pháp xử lí tại chỗ nào là phù hợp?',
      options: [
        'Bò mắc bệnh Lở mồm long móng (FMD); cần cách li ngay gia súc bệnh, báo thú y, vệ sinh vết loét miệng bằng dung dịch chua nhẹ (chanh/khế/phèn chua 2%), sát trùng móng bằng CuSO4/Xanh methylen và tiêm thuốc trợ sức, kháng sinh chống phụ nhiễm',
        'Bò mắc bệnh tụ huyết trùng cấp tính; chỉ cần bắt bò bệnh kéo cày nặng suốt ngày dưới nắng để cơ chân hoạt động làm lành vết thương',
        'Bò bị ngộ độc muối ăn; cần thả đàn bò đang bị loét móng đi sang các trang trại chăn nuôi bò sữa lân cận để tắm chung ao nước',
        'Dùng dao cắt bỏ toàn bộ lưỡi và móng chân của con bò rồi đem bán thịt tươi chưa qua kiểm dịch ngay tại cổng trang trại',
      ],
      correctIndex: 0,
      explanation:
        'Sốt cao, chảy nước bọt như xà phòng, mụn nước loét ở miệng, lưỡi và vành móng là triệu chứng đặc trưng của bệnh Lở mồm long móng ở gia súc có móng guốc chẵn; cần cách li tuyệt đối, xử lí vết loét bằng dung dịch acid nhẹ/sát trùng và chống nhiễm trùng kế phát (Bài 13 SGK CN 11).',
    },
    {
      number: 35,
      level: 'vandung',
      question:
        'Trong điều trị bệnh nhiễm khuẩn đường hô hấp ở lợn thịt bằng thuốc kháng sinh, bác sĩ thú y yêu cầu phải dùng đúng thuốc đặc hiệu, đủ liều lượng, đủ liệu trình (3–5 ngày) và tuân thủ nghiêm ngặt "thời gian ngưng thuốc" trước khi xuất bán giết mổ. Việc tuân thủ thời gian ngưng thuốc nhằm mục đích gì?',
      options: [
        'Đảm bảo lượng kháng sinh trong cơ thể vật nuôi đã được đào thải hết xuống dưới ngưỡng an toàn, không để lại tồn dư kháng sinh trong thịt gây hại sức khỏe người tiêu dùng và kháng thuốc',
        'Làm cho khối lượng cơ thể lợn tăng vọt thêm 30 kg chỉ trong vài ngày ngưng thuốc nhờ tích nước trong mô mỡ',
        'Để vi khuẩn gây bệnh có thời gian phục hồi và nhân lên trở lại trong phổi lợn trước khi đem đi giết mổ',
        'Giúp thịt lợn sau khi giết mổ có mùi thơm nồng của thuốc kháng sinh để bảo quản ngoài trời không bị ôi thiu',
      ],
      correctIndex: 0,
      explanation:
        'Tuân thủ thời gian ngưng thuốc (withdrawal period) giúp cơ thể vật nuôi chuyển hóa và đào thải kháng sinh tồn dư trong mô thịt, nội tạng, đảm bảo vệ sinh an toàn thực phẩm và phòng chống kháng kháng sinh ở người (Bài 12, 15 SGK CN 11).',
    },
  ],

  // ==========================================================================
  // LỚP 11 - CHƯƠNG V: CÔNG NGHỆ CHĂN NUÔI (5 câu Vận dụng)
  // ==========================================================================
  'cn11-c5': [
    {
      number: 31,
      level: 'vandung',
      question:
        'Khi quy hoạch và thiết kế xây dựng hệ thống chuồng kín nuôi gà thịt công nghiệp tại khu vực miền Bắc Việt Nam, việc chọn hướng chuồng và bố trí hệ thống thông gió làm mát cần thực hiện như thế nào để tối ưu tiểu khí hậu?',
      options: [
        'Chọn hướng chuồng Nam hoặc Đông Nam để mát mùa hè, ấm mùa đông; lắp hệ thống quạt hút công suất lớn ở một đầu hồi và giàn tấm làm mát (cooling pad) ở đầu hồi đối diện để tạo thông gió áp suất âm',
        'Chọn hướng chuồng chính Tây để đón nắng gắt buổi chiều chiếu thẳng vào chuồng và xây tường kín 4 phía không lắp quạt thông gió',
        'Xây dựng chuồng nuôi ngay sát cạnh khu vực nhà vệ sinh công cộng và đặt chuồng cách리 (cách li) thú y ở đầu hướng gió thổi vào khu chuồng chính',
        'Lắp đặt cả hệ thống quạt hút gió và tấm làm mát cooling pad chồng khít lên nhau tại cùng một góc tường chuồng nuôi',
      ],
      correctIndex: 0,
      explanation:
        'Hướng chuồng Nam hoặc Đông Nam phù hợp khí hậu Việt Nam; trong chuồng kín, quạt hút đặt đối diện tấm cooling pad theo chiều dọc chuồng tạo luồng gió mát đi qua toàn bộ đàn vật nuôi (Bài 16 SGK CN 11).',
    },
    {
      number: 32,
      level: 'vandung',
      question:
        'Trong quy trình chăm sóc lợn con sơ sinh từ 1 đến 21 ngày tuổi (Bài 18 SGK Công nghệ 11), tại sao kĩ thuật viên bắt buộc phải cho lợn con bú sữa đầu càng sớm càng tốt (trong 1–2 giờ đầu sau sinh) và tiêm bổ sung sắt (Fe-dextran) vào lúc 3 ngày tuổi và 10 ngày tuổi?',
      options: [
        'Vì sữa đầu giàu kháng thể IgG giúp lợn con có miễn dịch thụ động chống bệnh; còn sữa mẹ rất nghèo sắt trong khi lợn con lớn nhanh nên phải tiêm sắt để phòng bệnh thiếu máu gây còi cọc, tiêu chảy',
        'Vì sữa đầu chứa nhiều chất xơ thô giúp lợn con tập nhai cỏ; còn tiêm sắt giúp răng nanh của lợn con cứng như kim loại không cần bấm nanh',
        'Vì lợn con sơ sinh không có dạ dày nên phải tiêm sắt trực tiếp vào máu để thay thế hoàn toàn việc bú sữa mẹ suốt 21 ngày',
        'Để làm giảm thân nhiệt của lợn con sơ sinh xuống dưới 30 °C giúp lợn con không cần sưởi ấm bằng đèn hồng ngoại vào mùa đông',
      ],
      correctIndex: 0,
      explanation:
        'Nhau thai lợn thuộc loại biểu mô – mạch máu nên kháng thể không truyền qua nhau thai được mà phải nhận qua sữa đầu trong 24 giờ đầu; đồng thời dự trữ sắt ở lợn sơ sinh rất thấp và sữa mẹ thiếu sắt nên phải tiêm sắt ngày thứ 3 và thứ 10 (Bài 18 SGK CN 11).',
    },
    {
      number: 33,
      level: 'vandung',
      question:
        'Khi úm gà con mới nở từ 1 đến 14 ngày tuổi trong quây úm, người chăn nuôi quan sát thấy đàn gà con tụ tập chụm lại thành từng đám dày đặc ngay phía dưới bóng đèn sưởi, kêu chiếp chiếp liên tục và lười đi ăn uống. Hiện tượng này phản ánh điều gì và cần xử lí ra sao?',
      options: [
        'Nhiệt độ trong quây úm đang bị quá thấp (gà bị lạnh); cần hạ thấp bóng đèn sưởi hoặc tăng công suất sưởi ấm và che chắn kín gió lùa cho quây úm',
        'Nhiệt độ trong quây úm đang quá nóng bức; cần tắt ngay toàn bộ đèn sưởi và bật quạt thổi gió lạnh trực tiếp vào đàn gà con',
        'Nhiệt độ quây úm đã hoàn toàn thích hợp; không cần điều chỉnh gì thêm mà chỉ cần ngừng cho gà ăn trong 2 ngày',
        'Đàn gà con đang bị thừa ánh sáng mặt trời; cần tháo dỡ hết bạt quây và đem gà con thả ra ngoài sân mưa',
      ],
      correctIndex: 0,
      explanation:
        'Khi úm gia cầm non (Bài 17 SGK CN 11): gà chụm dưới đèn là bị lạnh (thiếu nhiệt); gà tản xa đèn há mỏ thở là quá nóng; gà dạt về một phía là có gió lùa; gà phân bố đều, ăn uống linh hoạt là đủ nhiệt.',
    },
    {
      number: 34,
      level: 'vandung',
      question:
        'Tại một trang trại chăn nuôi bò sữa công nghệ cao, để thu được sữa tươi nguyên liệu có tổng số vi sinh vật tạp nhiễm thấp nhất và phòng ngừa bệnh viêm vú cho đàn bò cái đang khai thác sữa, quy trình vắt sữa bằng máy cần thực hiện như thế nào?',
      options: [
        'Vệ sinh bầu vú bằng nước ấm sạch, lau khô bằng khăn riêng từng con, vắt bỏ vài tia sữa đầu để kiểm tra viêm vú, lắp cụm cốc vắt đúng áp suất và nhúng núm vú vào dung dịch sát trùng (Iodine) ngay sau khi vắt xong',
        'Không rửa bầu vú trước khi vắt, dùng chung một chiếc khăn ướt bẩn lau cho cả 100 con bò rồi bật máy hút sữa ở áp suất cực đại suốt 30 phút mỗi con',
        'Vắt sữa ngay trên nền chuồng ngập phân và nước tiểu, sau khi vắt xong để sữa tươi ngoài trời nắng 6 giờ rồi mới đưa vào bồn lạnh',
        'Tiêm thuốc kháng sinh trực tiếp vào thùng sữa tươi vừa vắt được để tiêu diệt các vi khuẩn rơi vào sữa trong lúc vắt',
      ],
      correctIndex: 0,
      explanation:
        'Quy trình vắt sữa chuẩn VietGAP/GlobalGAP (Bài 19, 20 SGK CN 11): rửa bầu vú nước ấm, lau khăn riêng, kiểm tra tia sữa đầu, vắt máy đúng nhịp và nhúng sát trùng núm vú sau vắt (khi lỗ núm vú chưa khép kín) để ngăn vi khuẩn xâm nhập gây viêm vú.',
    },
    {
      number: 35,
      level: 'vandung',
      question:
        'Một cơ sở chế biến thịt muốn sản xuất lạp xưởng và xúc xích tiệt trùng có độ kết dính dẻo dai (cấu trúc nhũ tương bền vững), màu sắc hồng đẹp và bảo quản được lâu. Trong khâu xay trộn tạo nhũ tương thịt, yếu tố kĩ thuật nào đóng vai trò quyết định để không bị "tách mỡ - tách nước"?',
      options: [
        'Xay thịt và mỡ ở nhiệt độ thấp (bổ sung đá vảy giữ nhiệt độ khối mọc dưới 12 °C) để protein myofibrillar không bị biến tính nhiệt sớm và tạo màng bọc bền vững quanh các hạt cầu mỡ',
        'Đun sôi toàn bộ thịt và mỡ ở 100 °C trước khi đưa vào máy xay tốc độ cao để mỡ tan chảy hoàn toàn thành dầu lỏng',
        'Xay thịt ở nhiệt độ nóng 45 °C trong thời gian thật dài mà không cho muối hay phụ gia tạo nhũ để tiết kiệm điện năng',
        'Ngâm khối thịt xay vào dung dịch acid đậm đặc pH = 2,0 trước khi nhồi vào vỏ xúc xích và đem hun khói',
      ],
      correctIndex: 0,
      explanation:
        'Trong công nghệ chế biến xúc xích (Bài 20 SGK CN 11), quá trình xay tạo nhũ tương phải giữ nhiệt độ khối thịt lạnh (<12 °C nhờ đá vảy) để protein sợi cơ hòa tan tạo mạng lưới gel giữ nước và bao bọc hạt mỡ, tránh hiện tượng tách mỡ khi hấp chín.',
    },
  ],

  // ==========================================================================
  // LỚP 11 - CHƯƠNG VI: BẢO VỆ MÔI TRƯỜNG TRONG CHĂN NUÔI (5 câu Vận dụng)
  // ==========================================================================
  'cn11-c6': [
    {
      number: 31,
      level: 'vandung',
      question:
        'Một trang trại nuôi 300 con lợn thịt muốn xử lí triệt để lượng phân và nước thải rửa chuồng hằng ngày nhằm vừa giảm mùi hôi thối, diệt mầm bệnh kí sinh trùng vừa thu được khí đốt phục vụ đun nấu, phát điện sưởi ấm cho lợn con. Giải pháp công nghệ nào phù hợp nhất?',
      options: [
        'Xây dựng hệ thống hầm khí sinh học (Biogas) phủ bạt HDPE hoặc composite kết hợp hồ sinh học để lên men kị khí chất thải tạo khí CH4 và thu nước thải sau biogas tưới cây',
        'Xả trực tiếp toàn bộ phân tươi và nước rửa chuồng ra mương thoát nước chung của thôn xóm vào những ngày trời mưa to',
        'Đào một hố đất không chống thấm ngay cạnh giếng nước sinh hoạt của gia đình để chứa toàn bộ nước thải chăn nuôi',
        'Phơi phân lợn tươi ngay trước cửa hút gió của khu chuồng nuôi lợn con để tận dụng hơi nóng từ quạt thông gió',
      ],
      correctIndex: 0,
      explanation:
        'Công nghệ hầm Biogas lên men kị khí chất thải chăn nuôi giúp phân hủy chất hữu cơ sinh khí methane (CH4) làm nhiên liệu sạch, giảm mùi hôi và tiêu diệt phần lớn mầm bệnh trong chất thải (Bài 21, 22 SGK CN 11).',
    },
    {
      number: 32,
      level: 'vandung',
      question:
        'Một nông hộ nuôi 1 000 con gà thịt trong chuồng nền gần khu dân cư muốn áp dụng kĩ thuật không phải rửa chuồng bằng nước, không phát sinh nước thải và khử hoàn toàn mùi khí NH3, H2S trong chuồng nuôi. Nông hộ cần thực hiện quy trình kĩ thuật nào?',
      options: [
        'Sử dụng công nghệ đệm lót sinh học: rải lớp trấu, mùn cưa dày 10–15 cm trên nền chuồng khô ráo và phun/trộn đều chế phẩm vi sinh vật có ích (Bacillus, nấm men, xạ khuẩn) để phân hủy phân tại chỗ',
        'Rải một lớp cát ướt dày 2 cm trên nền chuồng và mỗi ngày bơm nước rửa chuồng hai lần cho chảy tràn ra vườn',
        'Trộn vôi sống và thuốc sát trùng nồng độ cao trực tiếp vào gói men vi sinh đệm lót để diệt hết vi sinh vật trong trấu',
        'Đóng kín toàn bộ cửa chuồng gà không thông gió để giữ toàn bộ khí độc NH3 và H2S ở lại bên trong chuồng nuôi',
      ],
      correctIndex: 0,
      explanation:
        'Đệm lót sinh học chứa hệ vi sinh vật hiếu khí có lợi giúp đồng hóa và phân hủy trực tiếp phân, nước tiểu ngay trên nền trấu/mùn cưa, khử mùi hôi khí độc (NH3, H2S), giữ ấm chuồng và không xả nước thải (Bài 21, 22 SGK CN 11).',
    },
    {
      number: 33,
      level: 'vandung',
      question:
        'Để giảm thiểu lượng nitrogen (N), phosphorus (P) và mùi hôi bài tiết ra môi trường ngay từ nguồn thức ăn (trước khi vật nuôi thải phân ra chuồng), kĩ sư dinh dưỡng trang trại nên áp dụng giải pháp sinh học nào trong khẩu phần ăn của lợn và gia cầm?',
      options: [
        'Cân đối chính xác acid amin thiết yếu theo khẩu phần ăn lí tưởng và bổ sung chế phẩm enzyme tiêu hóa (như enzyme Phytase, Protease) cùng Probiotics (men vi sinh đường ruột) và chiết xuất Yucca',
        'Tăng hàm lượng protein thô trong thức ăn lên gấp đôi nhu cầu của vật nuôi để phần đạm dư thừa thải ra làm phân bón',
        'Cắt bỏ hoàn toàn nguồn nước uống của đàn lợn để lợn không đi tiểu tiện ra nền chuồng nuôi',
        'Trộn thêm đất sét và mùn cưa với tỉ lệ 50% vào thức ăn hỗn hợp của gà đẻ để làm khô phân gà',
      ],
      correctIndex: 0,
      explanation:
        'Bổ sung enzyme Phytase (giải phóng P từ phytate thực vật), Protease và Probiotics vào thức ăn giúp vật nuôi tiêu hóa triệt để dinh dưỡng, giảm 20–30% lượng N, P và khí độc NH3, H2S thải ra theo phân (Bài 21 SGK CN 11).',
    },
    {
      number: 34,
      level: 'vandung',
      question:
        'Tại một trang trại bò thịt quy mô lớn, lượng phân rắn thu gom hằng ngày rất nhiều. Thay vì ủ truyền thống mất 3–4 tháng, trang trại muốn chuyển hóa nhanh phân bò thành phân bón hữu cơ cao cấp giàu acid humic và đồng thời thu được nguồn thức ăn giàu đạm tươi cho gà, cá. Giải pháp nào hiệu quả nhất?',
      options: [
        'Sử dụng phân bò đã làm mát làm thức ăn nuôi giun quế (trùn quế) hoặc ấu trùng ruồi lính đen: thu sinh khối giun/ấu trùng giàu protein làm thức ăn chăn nuôi và thu phân trùn quế bón cây',
        'Đổ toàn bộ phân bò tươi xuống ao nuôi cá với khối lượng lớn mỗi ngày để phân tự lắng thành lớp bùn dày dưới đáy ao',
        'Đốt cháy phân bò tươi bằng dầu hỏa trong lò kín để lấy khói xông trực tiếp vào khu chuồng nuôi bò',
        'Đóng bao phân bò tươi còn ướt sũng vừa mới thải ra rồi đem bón trực tiếp sát gốc các cây rau ăn lá non',
      ],
      correctIndex: 0,
      explanation:
        'Nuôi trùn quế (giun quế) hoặc ấu trùng ruồi lính đen trên chất thải hữu cơ chăn nuôi là mô hình kinh tế tuần hoàn tiêu biểu: vừa xử lí nhanh chất thải thành phân hữu cơ vi sinh (vermicompost) vừa tạo nguồn đạm động vật quý cho gia cầm, thủy sản (Bài 21, 22 SGK CN 11).',
    },
    {
      number: 35,
      level: 'vandung',
      question:
        'Khi vận hành hầm Biogas tại trang trại chăn nuôi lợn, người chăn nuôi phát hiện lượng khí gas sinh ra giảm hẳn dù vẫn nạp phân đều đặn; kiểm tra thấy người làm công vừa xả một lượng lớn nước thuốc sát trùng chuồng trại và kháng sinh thừa xuống hầm. Nguyên nhân và cách khắc phục là gì?',
      options: [
        'Hóa chất sát trùng và kháng sinh đã tiêu diệt hệ vi sinh vật kị khí (vi khuẩn sinh methane) trong hầm; cần ngưng xả hóa chất sát trùng vào hầm, pha loãng dịch ủ và bổ sung chế phẩm vi sinh kị khí/phân trâu bò tươi làm mồi',
        'Do thuốc sát trùng làm khí methane đông đặc thành đá dưới đáy hầm; cần đốt lửa trực tiếp bên trong lòng hầm biogas để làm tan băng',
        'Do hầm biogas bị thiếu ánh sáng mặt trời; cần tháo bỏ toàn bộ nắp hầm biogas ra để ánh nắng chiếu trực tiếp vào dịch phân',
        'Do thiếu khí oxygen trong hầm; cần dùng máy bơm sục khí oxy liên tục vào đáy hầm biogas để vi khuẩn sinh methane hô hấp hiếu khí',
      ],
      correctIndex: 0,
      explanation:
        'Quá trình tạo khí Biogas phụ thuộc vào hệ vi sinh vật lên men kị khí (đặc biệt là vi khuẩn Methanogens); thuốc sát trùng và kháng sinh diệt vi khuẩn này làm hầm "chết men", cần tách riêng đường thoát nước sát trùng và bổ sung nguồn vi sinh mồi (Bài 21, 22 SGK CN 11).',
    },
  ],
};
