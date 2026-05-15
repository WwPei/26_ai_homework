import { useState, useEffect } from 'react';
import {
  Settings as SettingsIcon,
  Palette,
  Image as ImageIcon,
  Building,
  Save,
  Check,
  Sparkles
} from 'lucide-react';
import { useAppStore } from '../store/useAppStore';
import { cn } from '../lib/utils';
import { Settings } from '../types';

const textStyleOptions = [
  { value: 'professional', label: '专业', description: '严谨专业，适合高端商品', icon: '💼' },
  { value: 'playful', label: '活泼', description: '轻松活泼，吸引年轻用户', icon: '🎨' },
  { value: 'simple', label: '简约', description: '简洁明了，突出核心卖点', icon: '✨' },
  { value: 'promotional', label: '促销', description: '强调优惠，促进快速下单', icon: '🔥' },
];

const titleLengthOptions = [
  { value: 'short', label: '短', description: '10-15字', icon: '▮' },
  { value: 'medium', label: '中', description: '15-25字', icon: '▮▮' },
  { value: 'long', label: '长', description: '25-40字', icon: '▮▮▮' },
];

const imageRatioOptions = [
  { value: '1:1', label: '1:1', description: '正方形，适合橱窗展示', icon: '◼' },
  { value: '4:5', label: '4:5', description: '竖版方图，抖音推荐', icon: '▯' },
  { value: '9:16', label: '9:16', description: '全屏竖版，适合沉浸式', icon: '▕' },
];

export default function SettingsPage() {
  const { settings, updateSettings } = useAppStore();
  const [localSettings, setLocalSettings] = useState<Settings>(settings);
  const [isSaved, setIsSaved] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setLocalSettings(settings);
    setTimeout(() => setIsVisible(true), 50);
  }, [settings]);

  const handleSave = () => {
    updateSettings(localSettings);
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2000);
  };

  const handleReset = () => {
    setLocalSettings(settings);
  };

  return (
    <div className={cn(
      "p-6 max-w-4xl mx-auto transition-all duration-700",
      isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
    )}>
      <div className="mb-8 animate-fade-in">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-12 h-12 bg-gradient-to-br from-primary to-pink-400 rounded-2xl flex items-center justify-center shadow-lg shadow-primary/20">
            <SettingsIcon className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
              系统设置
            </h1>
          </div>
        </div>
        <p className="text-gray-500 mt-2 ml-15">配置你的素材生成偏好设置</p>
      </div>

      <div className="space-y-6">
        <div className="bg-white rounded-2xl shadow-soft p-6 card-hover animate-fade-in" style={{ animationDelay: '0.1s' }}>
          <div className="flex items-center gap-3 mb-6 group">
            <div className="w-11 h-11 bg-gradient-to-br from-primary to-pink-400 rounded-xl flex items-center justify-center shadow-md shadow-primary/20 group-hover:shadow-lg group-hover:shadow-primary/30 transition-shadow duration-300">
              <Palette className="w-5 h-5 text-white group-hover:rotate-12 transition-transform duration-300" />
            </div>
            <div>
              <h2 className="font-semibold text-gray-900">生成偏好设置</h2>
              <p className="text-sm text-gray-500">定义默认的文案风格和标题长度</p>
            </div>
          </div>

          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">默认文案风格</label>
              <div className="grid grid-cols-2 gap-3">
                {textStyleOptions.map((option, index) => (
                  <button
                    key={option.value}
                    onClick={() => setLocalSettings({ ...localSettings, textStyle: option.value as Settings['textStyle'] })}
                    className={cn(
                      'p-4 rounded-xl border-2 text-left transition-all duration-300 relative group/btn overflow-hidden',
                      localSettings.textStyle === option.value
                        ? 'border-primary bg-gradient-to-br from-primary/5 to-pink-50 shadow-md shadow-primary/10'
                        : 'border-gray-100 hover:border-gray-200 hover:shadow-sm'
                    )}
                    style={{ animationDelay: `${0.1 + index * 0.05}s` }}
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-primary/0 via-primary/5 to-primary/0 opacity-0 group-hover/btn:opacity-100 transition-opacity duration-300" />
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-lg">{option.icon}</span>
                      <div className={cn(
                        'text-sm font-semibold transition-colors',
                        localSettings.textStyle === option.value ? 'text-primary' : 'text-gray-900 group-hover/btn:text-primary/80'
                      )}>
                        {option.label}
                      </div>
                    </div>
                    <div className="text-xs text-gray-500 relative z-10">{option.description}</div>
                    {localSettings.textStyle === option.value && (
                      <div className="absolute top-2 right-2 w-5 h-5 bg-primary rounded-full flex items-center justify-center animate-scale-in shadow-md">
                        <Check className="w-3 h-3 text-white" />
                      </div>
                    )}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">默认标题长度</label>
              <div className="flex gap-3">
                {titleLengthOptions.map((option, index) => (
                  <button
                    key={option.value}
                    onClick={() => setLocalSettings({ ...localSettings, titleLength: option.value as Settings['titleLength'] })}
                    className={cn(
                      'flex-1 p-4 rounded-xl border-2 text-center transition-all duration-300 relative group/btn overflow-hidden',
                      localSettings.titleLength === option.value
                        ? 'border-primary bg-gradient-to-br from-primary/5 to-pink-50 shadow-md shadow-primary/10'
                        : 'border-gray-100 hover:border-gray-200 hover:shadow-sm'
                    )}
                    style={{ animationDelay: `${0.3 + index * 0.05}s` }}
                  >
                    <div className="absolute inset-0 bg-gradient-to-t from-primary/0 via-primary/5 to-primary/0 opacity-0 group-hover/btn:opacity-100 transition-opacity duration-300" />
                    <div className={cn(
                      'text-2xl font-bold mb-1 transition-colors',
                      localSettings.titleLength === option.value ? 'text-primary' : 'text-gray-300 group-hover/btn:text-primary/50'
                    )}>
                      {option.icon}
                    </div>
                    <div className={cn(
                      'text-sm font-semibold transition-colors relative z-10',
                      localSettings.titleLength === option.value ? 'text-primary' : 'text-gray-900 group-hover/btn:text-primary/80'
                    )}>
                      {option.label}
                    </div>
                    <div className="text-xs text-gray-500 relative z-10">{option.description}</div>
                    {localSettings.titleLength === option.value && (
                      <div className="absolute top-2 right-2 w-5 h-5 bg-primary rounded-full flex items-center justify-center animate-scale-in shadow-md">
                        <Check className="w-3 h-3 text-white" />
                      </div>
                    )}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-soft p-6 card-hover animate-fade-in" style={{ animationDelay: '0.2s' }}>
          <div className="flex items-center gap-3 mb-6 group">
            <div className="w-11 h-11 bg-gradient-to-br from-secondary to-cyan-400 rounded-xl flex items-center justify-center shadow-md shadow-secondary/20 group-hover:shadow-lg group-hover:shadow-secondary/30 transition-shadow duration-300">
              <ImageIcon className="w-5 h-5 text-white group-hover:scale-110 transition-transform duration-300" />
            </div>
            <div>
              <h2 className="font-semibold text-gray-900">图片设置</h2>
              <p className="text-sm text-gray-500">配置默认的图片处理选项</p>
            </div>
          </div>

          <div className="space-y-6">
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl group hover:bg-gray-100/80 transition-colors duration-300">
              <div className="flex items-center gap-3">
                <div className={cn(
                  'w-10 h-10 rounded-xl flex items-center justify-center transition-colors duration-300',
                  localSettings.autoEnhanceImage ? 'bg-primary/10' : 'bg-gray-200/50'
                )}>
                  <Sparkles className={cn(
                    'w-5 h-5 transition-colors duration-300',
                    localSettings.autoEnhanceImage ? 'text-primary' : 'text-gray-400'
                  )} />
                </div>
                <div>
                  <div className="text-sm font-medium text-gray-900">自动增强图片亮度</div>
                  <div className="text-xs text-gray-500 mt-0.5">生成时自动优化图片曝光和亮度</div>
                </div>
              </div>
              <button
                onClick={() => setLocalSettings({ ...localSettings, autoEnhanceImage: !localSettings.autoEnhanceImage })}
                className={cn(
                  'relative w-14 h-7 rounded-full transition-all duration-300 shadow-inner',
                  localSettings.autoEnhanceImage 
                    ? 'bg-gradient-to-r from-primary to-pink-400 shadow-primary/30' 
                    : 'bg-gray-300 hover:bg-gray-400'
                )}
              >
                <span
                  className={cn(
                    'absolute top-1 w-5 h-5 bg-white rounded-full transition-all duration-300 shadow-lg',
                    localSettings.autoEnhanceImage ? 'left-8' : 'left-1'
                  )}
                />
              </button>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">默认主图比例</label>
              <div className="flex gap-3">
                {imageRatioOptions.map((option, index) => (
                  <button
                    key={option.value}
                    onClick={() => setLocalSettings({ ...localSettings, defaultImageRatio: option.value as Settings['defaultImageRatio'] })}
                    className={cn(
                      'flex-1 p-4 rounded-xl border-2 text-center transition-all duration-300 relative group/btn overflow-hidden',
                      localSettings.defaultImageRatio === option.value
                        ? 'border-secondary bg-gradient-to-br from-secondary/5 to-cyan-50 shadow-md shadow-secondary/10'
                        : 'border-gray-100 hover:border-gray-200 hover:shadow-sm'
                    )}
                    style={{ animationDelay: `${0.4 + index * 0.05}s` }}
                  >
                    <div className="absolute inset-0 bg-gradient-to-b from-secondary/0 via-secondary/5 to-secondary/0 opacity-0 group-hover/btn:opacity-100 transition-opacity duration-300" />
                    <div className={cn(
                      'text-2xl font-bold mb-1 transition-colors',
                      localSettings.defaultImageRatio === option.value ? 'text-secondary' : 'text-gray-300 group-hover/btn:text-secondary/50'
                    )}>
                      {option.icon}
                    </div>
                    <div className={cn(
                      'text-sm font-semibold transition-colors relative z-10',
                      localSettings.defaultImageRatio === option.value ? 'text-secondary' : 'text-gray-900 group-hover/btn:text-secondary/80'
                    )}>
                      {option.label}
                    </div>
                    <div className="text-xs text-gray-500 relative z-10">{option.description}</div>
                    {localSettings.defaultImageRatio === option.value && (
                      <div className="absolute top-2 right-2 w-5 h-5 bg-secondary rounded-full flex items-center justify-center animate-scale-in shadow-md">
                        <Check className="w-3 h-3 text-white" />
                      </div>
                    )}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-soft p-6 card-hover animate-fade-in" style={{ animationDelay: '0.3s' }}>
          <div className="flex items-center gap-3 mb-6 group">
            <div className="w-11 h-11 bg-gradient-to-br from-orange-500 to-amber-400 rounded-xl flex items-center justify-center shadow-md shadow-orange-500/20 group-hover:shadow-lg group-hover:shadow-orange-500/30 transition-shadow duration-300">
              <Building className="w-5 h-5 text-white group-hover:scale-110 transition-transform duration-300" />
            </div>
            <div>
              <h2 className="font-semibold text-gray-900">品牌信息</h2>
              <p className="text-sm text-gray-500">设置默认品牌和目标受众</p>
            </div>
          </div>

          <div className="space-y-4">
            <div className="group">
              <label className="block text-sm font-medium text-gray-700 mb-2 group-hover:text-primary transition-colors">默认品牌名</label>
              <div className="relative">
                <input
                  type="text"
                  value={localSettings.defaultBrand}
                  onChange={(e) => setLocalSettings({ ...localSettings, defaultBrand: e.target.value })}
                  placeholder="请输入默认品牌名"
                  className="w-full px-4 py-3 pl-11 border-2 border-gray-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all duration-300 bg-white group-hover:border-gray-200"
                />
                <div className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-300 group-focus-within:text-primary transition-colors">
                  <Building className="w-5 h-5" />
                </div>
              </div>
            </div>

            <div className="group">
              <label className="block text-sm font-medium text-gray-700 mb-2 group-hover:text-primary transition-colors">目标受众预设</label>
              <div className="relative">
                <input
                  type="text"
                  value={localSettings.targetAudience}
                  onChange={(e) => setLocalSettings({ ...localSettings, targetAudience: e.target.value })}
                  placeholder="如：25-35岁都市女性"
                  className="w-full px-4 py-3 pl-11 border-2 border-gray-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all duration-300 bg-white group-hover:border-gray-200"
                />
                <div className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-300 group-focus-within:text-primary transition-colors">
                  <Sparkles className="w-5 h-5" />
                </div>
              </div>
              <p className="text-xs text-gray-400 mt-2 ml-1 flex items-center gap-1">
                <span className="inline-block w-1 h-1 bg-gray-300 rounded-full" />
                设置后将作为默认适用人群
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 animate-fade-in" style={{ animationDelay: '0.4s' }}>
          <button
            onClick={handleReset}
            className="px-6 py-3 border-2 border-gray-200 text-gray-700 rounded-xl font-medium hover:bg-gray-100 hover:border-gray-300 transition-all duration-300 flex items-center gap-2 group"
          >
            <span className="group-hover:-translate-x-0.5 transition-transform">重置</span>
          </button>
          <button
            onClick={handleSave}
            className={cn(
              'px-6 py-3 text-white rounded-xl font-semibold flex items-center gap-2 transition-all duration-300 shadow-lg',
              isSaved
                ? 'bg-gradient-to-r from-green-500 to-emerald-500 shadow-green-500/30 hover:shadow-green-500/40 hover:scale-105'
                : 'bg-gradient-to-r from-primary to-pink-400 shadow-primary/30 hover:shadow-primary/40 hover:scale-105 hover:-translate-y-0.5'
            )}
          >
            {isSaved ? (
              <>
                <Check className="w-4 h-4 animate-scale-in" />
                <span className="animate-fade-in">已保存</span>
              </>
            ) : (
              <>
                <Save className="w-4 h-4 group-hover:rotate-12 transition-transform duration-300" />
                <span>保存设置</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}