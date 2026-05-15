import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Product, GeneratedDraft, Template, Settings } from '../types';

interface AppState {
  products: Product[];
  drafts: GeneratedDraft[];
  templates: Template[];
  settings: Settings;

  addDraft: (draft: GeneratedDraft) => void;
  deleteDraft: (id: string) => void;
  updateDraft: (id: string, draft: Partial<GeneratedDraft>) => void;

  addTemplate: (template: Template) => void;
  deleteTemplate: (id: string) => void;
  updateTemplate: (id: string, template: Partial<Template>) => void;
  incrementTemplateUsage: (id: string) => void;

  updateSettings: (settings: Partial<Settings>) => void;

  getTodayDraftsCount: () => number;
  getRecentDrafts: (count: number) => GeneratedDraft[];
}

const defaultSettings: Settings = {
  textStyle: 'professional',
  titleLength: 'medium',
  autoEnhanceImage: true,
  defaultImageRatio: '4:5',
  defaultBrand: '',
  targetAudience: '',
};

const mockTemplates: Template[] = [
  {
    id: '1',
    name: '高端奢品风',
    tags: ['男包', '奢品', '高级感'],
    previewImage: 'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=400&h=500&fit=crop',
    titlePattern: '【{brand}】{name} - 奢华之选，品质生活',
    sellingPointPatterns: ['精选材质，匠心工艺', '简约设计，百搭时尚', '容量充足，收纳有序'],
    usageCount: 128,
    createdAt: '2024-01-15',
  },
  {
    id: '2',
    name: '活力运动风',
    tags: ['运动', '活力', '户外'],
    previewImage: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400&h=500&fit=crop',
    titlePattern: '【{brand}】{name} - 动起来，更精彩',
    sellingPointPatterns: ['轻便透气，穿着舒适', '防滑耐磨，户外首选', '时尚配色，活力满满'],
    usageCount: 89,
    createdAt: '2024-01-20',
  },
  {
    id: '3',
    name: '甜美少女风',
    tags: ['女包', '甜美', '日常'],
    previewImage: 'https://images.unsplash.com/photo-1594633313593-bab3825d0caf?w=400&h=500&fit=crop',
    titlePattern: '【{brand}】{name} - 甜美清新，少女心爆棚',
    sellingPointPatterns: ['精致小巧，携带方便', '柔软材质，手感舒适', '多色可选，点亮穿搭'],
    usageCount: 156,
    createdAt: '2024-02-01',
  },
  {
    id: '4',
    name: '商务精英风',
    tags: ['商务', '通勤', '正式'],
    previewImage: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=400&h=500&fit=crop',
    titlePattern: '【{brand}】{name} - 商务精英，职场利器',
    sellingPointPatterns: ['皮质柔软，质感高级', '分区合理，取放便捷', '低调沉稳，彰显品味'],
    usageCount: 94,
    createdAt: '2024-02-10',
  },
  {
    id: '5',
    name: '大促爆款风',
    tags: ['大促', '爆款', '限时'],
    previewImage: 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=400&h=500&fit=crop',
    titlePattern: '【抢】{name} - 限时特惠，错过不再',
    sellingPointPatterns: ['全网低价，限时抢购', '品质保障，售后无忧', '库存有限，先到先得'],
    usageCount: 234,
    createdAt: '2024-02-15',
  },
];

const mockDrafts: GeneratedDraft[] = [
  {
    id: '1',
    productId: 'p1',
    mainImage: 'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=400&h=500&fit=crop',
    title: '【LV】Carryall MM - 奢华之选，品质生活',
    sellingPoints: ['精选牛皮，匠心工艺', '简约设计，百搭时尚', '容量充足，收纳有序'],
    createdAt: new Date(Date.now() - 86400000).toISOString(),
    status: 'saved',
  },
  {
    id: '2',
    productId: 'p2',
    mainImage: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400&h=500&fit=crop',
    title: '【Nike】Air Max 270 - 动起来，更精彩',
    sellingPoints: ['轻便透气，穿着舒适', '防滑耐磨，户外首选', '时尚配色，活力满满'],
    createdAt: new Date(Date.now() - 172800000).toISOString(),
    status: 'draft',
  },
  {
    id: '3',
    productId: 'p3',
    mainImage: 'https://images.unsplash.com/photo-1594633313593-bab3825d0caf?w=400&h=500&fit=crop',
    title: '【Coach】Parker Mini - 甜美清新，少女心爆棚',
    sellingPoints: ['精致小巧，携带方便', '柔软材质，手感舒适', '多色可选，点亮穿搭'],
    createdAt: new Date(Date.now() - 259200000).toISOString(),
    status: 'saved',
  },
];

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      products: [],
      drafts: mockDrafts,
      templates: mockTemplates,
      settings: defaultSettings,

      addDraft: (draft) => set((state) => ({
        drafts: [draft, ...state.drafts]
      })),

      deleteDraft: (id) => set((state) => ({
        drafts: state.drafts.filter(d => d.id !== id)
      })),

      updateDraft: (id, draft) => set((state) => ({
        drafts: state.drafts.map(d => d.id === id ? { ...d, ...draft } : d)
      })),

      addTemplate: (template) => set((state) => ({
        templates: [template, ...state.templates]
      })),

      deleteTemplate: (id) => set((state) => ({
        templates: state.templates.filter(t => t.id !== id)
      })),

      updateTemplate: (id, template) => set((state) => ({
        templates: state.templates.map(t => t.id === id ? { ...t, ...template } : t)
      })),

      incrementTemplateUsage: (id) => set((state) => ({
        templates: state.templates.map(t =>
          t.id === id ? { ...t, usageCount: t.usageCount + 1 } : t
        )
      })),

      updateSettings: (newSettings) => set((state) => ({
        settings: { ...state.settings, ...newSettings }
      })),

      getTodayDraftsCount: () => {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        return get().drafts.filter(d => new Date(d.createdAt) >= today).length;
      },

      getRecentDrafts: (count) => {
        return get().drafts.slice(0, count);
      },
    }),
    {
      name: 'ecommerce-workshop-storage',
    }
  )
);