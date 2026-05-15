export interface Product {
  id: string;
  name: string;
  category: string;
  brand?: string;
  material?: string;
  size?: string;
  color?: string;
  targetAudience?: string;
  mainImage?: string;
  referenceImage?: string;
  referenceLink?: string;
}

export interface GeneratedDraft {
  id: string;
  productId: string;
  mainImage: string;
  title: string;
  sellingPoints: string[];
  createdAt: string;
  status: 'draft' | 'saved' | 'applied';
}

export interface Template {
  id: string;
  name: string;
  tags: string[];
  previewImage: string;
  titlePattern: string;
  sellingPointPatterns: string[];
  usageCount: number;
  createdAt: string;
}

export interface Settings {
  textStyle: 'professional' | 'playful' | 'simple' | 'promotional';
  titleLength: 'short' | 'medium' | 'long';
  autoEnhanceImage: boolean;
  defaultImageRatio: '1:1' | '4:5' | '9:16';
  defaultBrand: string;
  targetAudience: string;
}