import express from 'express';
import cors from 'cors';

const app = express();
app.use(cors());
app.use(express.json({ limit: '50mb' }));

const SEEDREAM_API_KEY = 'ark-9a977420-cc22-4733-a347-3fc95b7ea359-ab24f*';
const SEEDREAM_BASE_URL = 'https://ark.cn-beijing.volces.com/api/v3/images/generations';
const SEEDREAM_MODEL = 'doubao-seedream-4-0-250828'; // ⚠️ 开通后请确认此模型名称是否正确

const DEEPSEEK_API_KEY = 'sk-a2ef1f2f1faf424c90e35562f65c6704*';
const DEEPSEEK_BASE_URL = 'https://api.deepseek.com/v1/chat/completions';
const DEEPSEEK_MODEL = 'deepseek-v4-flash';

app.post('/api/seedream/generate', async (req, res) => {
  try {
    const { prompt, image, size, watermark } = req.body;

    const payload = {
      model: SEEDREAM_MODEL,
      prompt,
      sequential_image_generation: 'disabled',
      response_format: 'url',
      size: size || '2K',
      stream: false,
      watermark: watermark || false,
    };

    if (image && image.length > 0) {
      payload.image = image;
    }

    console.log('[Seedream] Sending request...');
    console.log('[Seedream] Prompt:', prompt.substring(0, 100));
    
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 120000);
    
    const response = await fetch(SEEDREAM_BASE_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${SEEDREAM_API_KEY}`,
      },
      body: JSON.stringify(payload),
      signal: controller.signal,
    });
    
    clearTimeout(timeout);

    const responseText = await response.text();
    console.log('[Seedream] Response status:', response.status, 'Body length:', responseText.length);

    let data;
    try {
      data = JSON.parse(responseText);
    } catch (parseError) {
      console.error('[Seedream] JSON parse error:', parseError.message);
      return res.status(500).json({
        success: false,
        error: 'Invalid response from API',
        message: 'API返回了无效的数据格式',
        detail: responseText.substring(0, 500),
      });
    }

    if (!response.ok) {
      console.error('[Seedream] Error:', JSON.stringify(data, null, 2));
      return res.status(response.status).json({
        success: false,
        error: data.error || data,
        message: data.error?.message || data.message || '图像生成失败',
      });
    }

    res.json({ success: true, data });
  } catch (error) {
    console.error('[Seedream] Exception:', error.message);
    const statusCode = error.name === 'AbortError' ? 504 : 500;
    res.status(statusCode).json({
      success: false,
      error: error.message,
      message: error.name === 'AbortError' ? '请求超时，图像生成需要较长时间' : '服务器内部错误',
    });
  }
});

app.post('/api/deepseek/optimize', async (req, res) => {
  try {
    const { prompt, style } = req.body;

    const systemPrompt = `你是一个专业的AI图像生成提示词优化助手。你的任务是将用户输入的简单提示词优化为更适合图像生成模型的高质量英文提示词。

优化要求：
1. 将中文提示词翻译并优化为专业的英文提示词
2. 添加专业摄影/设计术语（如 lighting, composition, color palette等）
3. 指定艺术风格和画质关键词
4. 保持原始意图，不添加与原意无关的元素
5. ${style ? `偏向"${style}"风格` : '根据内容自动判断最佳风格'}

请以JSON格式返回优化结果：
{
  "optimized_prompt": "优化后的完整英文提示词",
  "explanation": "用中文简要说明做了哪些优化（1-2句话）",
  "keywords_added": ["添加的关键词1", "添加的关键词2"]
}`;

    console.log('[DeepSeek] Optimizing prompt...');
    const response = await fetch(DEEPSEEK_BASE_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${DEEPSEEK_API_KEY}`,
      },
      body: JSON.stringify({
        model: DEEPSEEK_MODEL,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: prompt },
        ],
        stream: false,
        temperature: 0.7,
      }),
    });

    const data = await response.json();
    console.log('[DeepSeek] Response status:', response.status);

    if (!response.ok) {
      console.error('[DeepSeek] Error:', JSON.stringify(data, null, 2));
      return res.status(response.status).json({
        success: false,
        error: data.error || data,
        message: data.error?.message || '提示词优化失败',
      });
    }

    const content = data.choices?.[0]?.message?.content || '';
    let optimized;
    try {
      const match = content.match(/\{[\s\S]*\}/);
      if (match) {
        optimized = JSON.parse(match[0]);
      } else {
        optimized = {
          optimized_prompt: content,
          explanation: '已优化提示词',
          keywords_added: [],
        };
      }
    } catch {
      optimized = {
        optimized_prompt: content,
        explanation: '已优化提示词',
        keywords_added: [],
      };
    }

    res.json({ success: true, data: optimized });
  } catch (error) {
    console.error('[DeepSeek] Exception:', error.message);
    res.status(500).json({
      success: false,
      error: error.message,
      message: '服务器内部错误',
    });
  }
});

const PORT = 3001;
app.listen(PORT, () => {
  console.log(`AI Proxy Server running on http://localhost:${PORT}`);
  console.log(`  Seedream endpoint: POST /api/seedream/generate`);
  console.log(`  DeepSeek endpoint: POST /api/deepseek/optimize`);
});
