export interface SeedreamRequest {
  prompt: string;
  image?: string[];
  size?: string;
  watermark?: boolean;
}

export interface SeedreamResponse {
  success: boolean;
  data?: {
    data?: Array<{ url: string }>;
    url?: string;
  };
  error?: any;
  message?: string;
}

export async function generateImage(params: SeedreamRequest): Promise<SeedreamResponse> {
  const response = await fetch('/api/seedream/generate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      prompt: params.prompt,
      image: params.image,
      size: params.size || '2K',
      watermark: params.watermark || false,
    }),
  });

  const data = await response.json();

  if (!response.ok || !data.success) {
    throw new Error(data.message || data.error?.message || '图像生成失败');
  }

  return data;
}
