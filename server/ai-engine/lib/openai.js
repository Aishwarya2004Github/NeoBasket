const OpenAI = require('openai');

let client = null;

function getOpenAI() {
  if (!process.env.OPENAI_API_KEY) return null;
  if (!client) client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  return client;
}

async function askJson(system, user) {
  const ai = getOpenAI();
  if (!ai) return null;

  const response = await ai.chat.completions.create({
    model: process.env.OPENAI_MODEL || 'gpt-4o-mini',
    temperature: 0.2,
    response_format: { type: 'json_object' },
    messages: [
      { role: 'system', content: system },
      { role: 'user', content: user }
    ]
  });

  const content = response.choices?.[0]?.message?.content || '{}';
  return JSON.parse(content);
}

async function askText(system, user) {
  const ai = getOpenAI();
  if (!ai) return null;

  const response = await ai.chat.completions.create({
    model: process.env.OPENAI_MODEL || 'gpt-4o-mini',
    temperature: 0.5,
    messages: [
      { role: 'system', content: system },
      { role: 'user', content: user }
    ]
  });

  return response.choices?.[0]?.message?.content || '';
}

async function analyzeImage(base64, prompt) {
  const ai = getOpenAI();
  if (!ai) return null;

  const response = await ai.chat.completions.create({
    model: process.env.OPENAI_MODEL || 'gpt-4o-mini',
    temperature: 0.1,
    response_format: { type: 'json_object' },
    messages: [
      {
        role: 'system',
        content: 'You are a grocery computer-vision assistant. Identify visible grocery/food items conservatively. Return JSON only.'
      },
      {
        role: 'user',
        content: [
          { type: 'text', text: prompt },
          { type: 'image_url', image_url: { url: base64 } }
        ]
      }
    ]
  });

  return JSON.parse(response.choices?.[0]?.message?.content || '{}');
}

module.exports = { getOpenAI, askJson, askText, analyzeImage };
