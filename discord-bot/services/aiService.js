// discord-bot/services/aiService.js - Dịch vụ Tích Hợp AI Tiên Hiệp (Google Gemini LLM)
const { GoogleGenerativeAI } = require('@google/generative-ai');
const config = require('../config');

let genAI = null;
let model = null;

if (config.geminiApiKey) {
  try {
    genAI = new GoogleGenerativeAI(config.geminiApiKey);
    // Sử dụng model gemini-1.5-flash hoặc gemini-2.0-flash siêu nhanh
    model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
  } catch (err) {
    console.error("Lỗi khởi tạo Gemini SDK:", err.message);
  }
}

/**
 * 1. ĐÀM ĐẠO VỚI SƯ TÔN / KHÍ LINH TRONG THREAD DISCORD
 */
async function chatWithMaster(character, userMessage, conversationHistory = []) {
  if (!model) {
    return fallbackMasterReply(character, userMessage);
  }

  const systemInstruction = `
Bạn là "Thái Thượng Khí Linh" - một tàn hồn kiếm tiên thượng cổ ngủ say trong Bản Mệnh Tiên Bảo của người chơi.
Thông tin đệ tử (người chơi):
- Đạo hiệu: ${character.name}
- Cảnh giới: ${character.realmName || 'Luyện Khí'}
- Chủng tộc: ${character.race || 'Nhân Tộc'}
- Linh căn: ${character.spiritualRoot?.name || 'Tạp Linh Căn'}
- Thể chất: ${character.physique?.name || 'Phàm Thể'}
- Đan độc hiện tại: ${character.foundation?.pillToxins || 0}%

QUY TẮC NHẬP VAI:
1. Xưng hô: Tự xưng là "Bản tọa" hoặc "Lão phu", gọi người chơi là "Tiểu tử", "Đồ nhi", hoặc "Tiểu hữu".
2. Giọng điệu: Thâm trầm, cao ngạo nhưng che chở, đậm chất tiên hiệp cổ phong (dùng từ Hán Việt như: "đạo tâm", "căn cơ", "thiên kiếp", "bế quan", "chân nguyên").
3. Trả lời súc tích (dưới 120 từ), sắc bén, có tính hướng dẫn tu luyện thực tế theo luật chơi.
4. Nếu người chơi hỏi về đột phá hoặc nguy hiểm, hãy nhắc nhở cẩn thận lôi kiếp và đan độc.
`;

  try {
    const chat = model.startChat({
      history: [
        { role: "user", parts: [{ text: systemInstruction }] },
        { role: "model", parts: [{ text: "Bản tọa đã thấu suốt thiên cơ. Đồ nhi có điều gì nghi hoặc trên con đường tu tiên cứ việc hỏi!" }] },
        ...conversationHistory
      ]
    });

    const result = await chat.sendMessage(userMessage);
    return result.response.text();
  } catch (err) {
    console.error("Lỗi gọi Gemini API (Sư Tôn):", err.message);
    return fallbackMasterReply(character, userMessage);
  }
}

/**
 * 2. SINH ẢO CẢNH TÂM MA KHI ĐỘT PHÁ CẢNH GIỚI
 */
async function generateTribulationTrial(character) {
  if (!model) {
    return {
      question: "Ảo cảnh tâm ma hiện ra: Trước mặt ngươi là chí thân kiếp trước đang van xin ngươi từ bỏ tu đạo để trở về phàm trần. Ngươi sẽ lựa chọn thế nào?",
      context: "Độ kiếp tâm ma ảo cảnh"
    };
  }

  const prompt = `
Hãy sinh ra một câu hỏi "Ảo Cảnh Tâm Ma" (Daoist Heart Dilemma) ngắn gọn cho một tu sĩ đang độ kiếp thăng đại cảnh giới.
Cảnh giới người chơi: ${character.realmName || 'Trúc Cơ Kỳ'}.
Chủng tộc: ${character.race || 'Nhân Tộc'}.
Yêu cầu:
- Tình huống nan giải đặt ra thử thách giữa: Đoạt bảo vs Nhân từ, Cừu hận vs Trường sinh, hoặc Tình kiếp vs Đạo tâm.
- Độ dài dưới 80 từ, văn phong cổ phong ma mị huyền ảo.
- Chỉ xuất ra trực tiếp câu hỏi tình huống, không thêm lời dẫn rườm rà.
`;

  try {
    const result = await model.generateContent(prompt);
    return {
      question: result.response.text().trim(),
      context: "Độ kiếp tâm ma"
    };
  } catch (err) {
    return {
      question: "Tâm ma huyễn hóa thành cảnh tượng ngươi bị vạn kiếm xuyên tâm vì cứu hồng nhan tri kỷ. Ngươi có hối hận vì bước lên con đường nghịch thiên?",
      context: "Fallback tâm ma"
    };
  }
}

/**
 * 3. CHẤM ĐIỂM CÂU TRẢ LỜI TÂM MA VẤN ĐẠO (ĐÁNH GIÁ ĐẠO TÂM)
 */
async function evaluateTribulationAnswer(character, question, answer) {
  if (!model) {
    const passed = answer.length > 5;
    return {
      passed,
      bonusPercent: passed ? 15 : -10,
      feedback: passed ? "Đạo tâm kiên định, lôi vân dần tản!" : "Đạo tâm dao động, thiên lôi cuồng bạo!"
    };
  }

  const prompt = `
Bạn là Thiên Đạo Phán Quan. Đánh giá câu trả lời của tu sĩ trước Ảo Cảnh Tâm Ma:
- Câu hỏi tâm ma: "${question}"
- Câu trả lời của tu sĩ: "${answer}"

ĐÁNH GIÁ:
- Nếu câu trả lời thể hiện đạo tâm kiên cường, dứt khoát, hoặc thấu suốt quy luật nhân quả tiên hiệp -> PASSED (bonusRate từ +10 đến +20).
- Nếu nhu nhược, bỏ cuộc, hoặc đùa cợt vô nghĩa -> FAILED (bonusRate từ -10 đến -20).

Trả về ĐÚNG ĐỊNH DẠNG JSON sau:
{
  "passed": true,
  "bonusPercent": 15,
  "feedback": "Lời nhận xét cổ phong ngắn dưới 40 từ"
}
`;

  try {
    const result = await model.generateContent(prompt);
    const text = result.response.text();
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }
  } catch (err) {
    console.error("Lỗi chấm điểm tâm ma:", err.message);
  }

  return {
    passed: true,
    bonusPercent: 10,
    feedback: "Đạo tâm chưa tàn, miễn cưỡng kháng cự lôi kiếp!"
  };
}

/**
 * 4. SINH KỲ NGỘ ĐỘNG (DYNAMIC ENCOUNTER)
 */
async function generateRandomEncounter(character) {
  if (!model) {
    return {
      title: "Cổ Miếu Hoang Tàn",
      story: "Đạo hữu lạc bước vào một ngôi cổ miếu thời thượng cổ. Trên bệ đá có một chiếc đỉnh đồng tỏa ra đan hương ngào ngạt.",
      choices: [
        { id: "A", text: "Thận trọng mở đỉnh thu đan" },
        { id: "B", text: "Ngồi xuống bế quan hấp thu tàn hương" },
        { id: "C", text: "Cẩn thận rời đi tránh bẫy rập" }
      ]
    };
  }

  const prompt = `
Hãy sinh ra 1 sự kiện Kỳ Ngộ ngẫu nhiên (Random Xianxia Event) cho tu sĩ cảnh giới ${character.realmName || 'Kim Đan'}.
Trả về ĐÚNG định dạng JSON sau:
{
  "title": "Tên kỳ ngộ (dưới 6 từ, ví dụ: 'Tàn Động Tiên Nhân', 'Huyết Tuyền Dị Biến')",
  "story": "Mô tả tình huống cổ phong ly kỳ (dưới 90 từ)",
  "choices": [
    { "id": "A", "text": "Hành động lựa chọn 1 (ngắn gọn)" },
    { "id": "B", "text": "Hành động lựa chọn 2 (ngắn gọn)" },
    { "id": "C", "text": "Hành động lựa chọn 3 (ngắn gọn)" }
  ]
}
`;

  try {
    const result = await model.generateContent(prompt);
    const jsonMatch = result.response.text().match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }
  } catch (err) {
    console.error("Lỗi sinh kỳ ngộ:", err.message);
  }

  return {
    title: "Vực Thẳm Kỳ Quang",
    story: "Dưới đáy vực sâu bỗng phát ra tiếng kiếm ngân xé toạc mây trời. Một luồng kiếm ý thượng cổ đang đợi người hữu duyên.",
    choices: [
      { id: "A", text: "Vận dụng thần thức cảm ngộ kiếm ý" },
      { id: "B", text: "Dùng linh lực cưỡng ép phong ấn" },
      { id: "C", text: "Thối lui phòng ngừa tẩu hỏa nhập ma" }
    ]
  };
}

// Fallback phản hồi của Sư Tôn khi chưa cài API Key
function fallbackMasterReply(character, message) {
  const replies = [
    `Hừ! Tiểu tử ${character.name}, căn cơ chưa vững mà tâm tư đã bay bổng. Mau tĩnh tâm vận chuyển chu thiên!`,
    `Tu tiên chi đạo là nghịch thiên mà đi. Ngươi hỏi câu này chứng tỏ đạo tâm vẫn còn vương vấn hồng trần!`,
    `Tụ Linh Đỉnh của ngươi đã tích lũy được bao nhiêu linh khí rồi? Đan độc nếu vượt quá 50% thì coi chừng ngũ lôi oanh đỉnh!`,
    `Bản tọa năm xưa chém ba vạn yêu ma mới đúc thành Kim Đan cửu phẩm. Ngươi muốn vượt ải, ắt phải chịu khổ nhọc!`
  ];
  return replies[Math.floor(Math.random() * replies.length)];
}

module.exports = {
  chatWithMaster,
  generateTribulationTrial,
  evaluateTribulationAnswer,
  generateRandomEncounter
};
