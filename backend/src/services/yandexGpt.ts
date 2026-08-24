import dotenv from 'dotenv';
dotenv.config();

const LLM_BASE_URL = process.env.LLM_BASE_URL || 'http://127.0.0.1:4096/v1';
const LLM_API_KEY = process.env.LLM_API_KEY || '';
const LLM_MODEL = process.env.LLM_MODEL || 'xiaomi/mimo-v2.5-pro';

const TONE_PROMPTS: Record<string, string> = {
  friendly: 'дружелюбный, тёплый, неформальный тон, как будто пишешь другу',
  expert: 'экспертный, уверенный тон с фактами и аргументами',
  selling: 'продающий, с призывом к действию и акцентом на выгоду',
  casual: 'разговорный, лёгкий, с юмором и эмодзи',
  formal: 'официальный, деловой, уважительный тон',
};

interface ChatChoice {
  message: { content: string };
}

interface ChatResponse {
  choices: ChatChoice[];
}

export async function generatePostText(topic: string, tone: string): Promise<string> {
  if (!LLM_API_KEY) {
    return generateFallback(topic, tone);
  }

  const toneDesc = TONE_PROMPTS[tone] || TONE_PROMPTS.friendly;

  const systemPrompt = 'Ты — SMM-специалист. Пишешь посты для соцсетей на русском языке. Отвечай ТОЛЬКО текстом поста, без кавычек и пояснений.';

  const userPrompt = `Напши пост для соцсетей (ВКонтакте, Telegram или Instagram) на тему: "${topic}".
Тон: ${toneDesc}.
Требования:
- Пост должен быть готов к публикации без правок
- Длина: 150–500 символов
- Используй активный залог, без канцелярита
- Добавь 1–3 эмодзи, если тон неформальный
- Не используй хештеги — они добавятся отдельно
- Пиши от первого лица (от лица бизнеса/бренда)`;

  try {
    const res = await fetch(`${LLM_BASE_URL}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${LLM_API_KEY}`,
      },
      body: JSON.stringify({
        model: LLM_MODEL,
        temperature: 0.7,
        max_tokens: 1000,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt },
        ],
      }),
    });

    if (!res.ok) {
      const errText = await res.text();
      console.error('LLM error:', res.status, errText);
      return generateFallback(topic, tone);
    }

    const data = (await res.json()) as ChatResponse;
    const text = data.choices?.[0]?.message?.content?.trim();
    return text || generateFallback(topic, tone);
  } catch (err) {
    console.error('LLM request failed:', err);
    return generateFallback(topic, tone);
  }
}

function generateFallback(topic: string, tone: string): string {
  const templates: Record<string, string[]> = {
    friendly: [
      `Привет! Хотим рассказать вам про ${topic}. Заходите к нам — будет интересно! 😊`,
      `Друзья, ${topic} — это то, что мы делаем с душой. Приходите, убедитесь сами!`,
    ],
    expert: [
      `${topic} — это область, в которой мы работаем уже не первый год. Наши специалисты знают всё о качестве и результатах. Доверьтесь профессионалам.`,
    ],
    selling: [
      `🔥 ${topic} — по специальной цене! Только на этой неделе скидка 20%. Успейте, количество ограничено!`,
    ],
    casual: [
      `Ну что, кто готов? ${topic} — это тема дня. Залетайте, обсудим! 😄`,
    ],
    formal: [
      `Приглашаем вас ознакомиться с нашим предложением: ${topic}. Гарантируем качество и индивидуальный подход.`,
    ],
  };

  const variants = templates[tone] || templates.friendly;
  return variants[Math.floor(Math.random() * variants.length)];
}
