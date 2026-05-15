export interface DeepSeekOptimizeRequest {
  prompt: string;
  style?: string;
}

export interface DeepSeekOptimizeResult {
  optimized_prompt: string;
  explanation: string;
  keywords_added: string[];
}

export interface DeepSeekResponse {
  success: boolean;
  data?: DeepSeekOptimizeResult;
  error?: any;
  message?: string;
}

export async function optimizePrompt(params: DeepSeekOptimizeRequest): Promise<DeepSeekResponse> {
  const response = await fetch('/api/deepseek/optimize', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      prompt: params.prompt,
      style: params.style,
    }),
  });

  const data = await response.json();

  if (!response.ok || !data.success) {
    throw new Error(data.message || data.error?.message || '提示词优化失败');
  }

  return data;
}
