import { useState, useRef } from 'react';
import {
  Sparkles,
  Image as ImageIcon,
  Upload,
  Loader2,
  X,
  Download,
  RefreshCw,
  Wand2,
  Lightbulb,
  Copy,
  Check,
  AlertCircle,
  Zap,
  Camera,
  ShoppingBag,
  Gift,
  Palette,
  Monitor
} from 'lucide-react';
import { cn } from '../lib/utils';
import { generateImage } from '../services/seedreamService';
import { optimizePrompt } from '../services/deepseekService';
import { useToast, Toast } from '../components/Toast';

const GENERATION_MODES = [
  { id: 'text-to-image', label: '文生图', desc: '用文字描述生成图片', icon: Wand2 },
  { id: 'poster', label: '电商海报', desc: '生成促销活动海报', icon: ShoppingBag },
  { id: 'first-frame', label: '抖音首图', desc: '生成带货短视频封面', icon: Camera },
  { id: 'scene', label: '场景合成', desc: '商品与场景智能合成', icon: Monitor },
  { id: 'festival', label: '节日营销', desc: '节日主题营销图', icon: Gift },
];

const STYLE_TAGS = [
  '写实摄影', '简约白底', '时尚大片', '国潮风格',
  '清新自然', '科技感', '轻奢高级', 'ins风格',
];

const SIZE_OPTIONS = [
  { value: '1K', label: '1K 标清' },
  { value: '2K', label: '2K 高清' },
  { value: '4K', label: '4K 超清' },
];

export default function AIImageGenerator() {
  const [prompt, setPrompt] = useState('');
  const [optimizedPrompt, setOptimizedPrompt] = useState('');
  const [optimizeExplanation, setOptimizeExplanation] = useState('');
  const [keywordsAdded, setKeywordsAdded] = useState<string[]>([]);
  const [selectedMode, setSelectedMode] = useState('text-to-image');
  const [selectedStyle, setSelectedStyle] = useState<string | null>(null);
  const [selectedSize, setSelectedSize] = useState('2K');
  const [referenceImages, setReferenceImages] = useState<string[]>([]);
  const [generatedImages, setGeneratedImages] = useState<string[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isOptimizing, setIsOptimizing] = useState(false);
  const [showOptimized, setShowOptimized] = useState(false);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const [errorDetail, setErrorDetail] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast, showToast, hideToast } = useToast();

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    Array.from(files).forEach((file) => {
      const reader = new FileReader();
      reader.onload = (ev) => {
        const dataUrl = ev.target?.result as string;
        setReferenceImages((prev) => [...prev, dataUrl]);
      };
      reader.readAsDataURL(file);
    });

    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const removeReferenceImage = (index: number) => {
    setReferenceImages((prev) => prev.filter((_, i) => i !== index));
  };

  const handleOptimizePrompt = async () => {
    if (!prompt.trim()) {
      showToast('请先输入提示词', 'error');
      return;
    }

    setIsOptimizing(true);
    setErrorDetail(null);
    try {
      const result = await optimizePrompt({
        prompt: prompt.trim(),
        style: selectedStyle || undefined,
      });

      if (result.success && result.data) {
        setOptimizedPrompt(result.data.optimized_prompt);
        setOptimizeExplanation(result.data.explanation);
        setKeywordsAdded(result.data.keywords_added || []);
        setShowOptimized(true);
        showToast('提示词优化完成', 'success');
      }
    } catch (error: any) {
      const errMsg = error.message || '优化失败';
      setErrorDetail(`优化失败: ${errMsg}`);
      showToast(errMsg, 'error');
    } finally {
      setIsOptimizing(false);
    }
  };

  const handleUseOptimized = () => {
    setPrompt(optimizedPrompt);
    setShowOptimized(false);
    showToast('已应用优化后的提示词', 'success');
  };

  const buildFullPrompt = () => {
    let fullPrompt = prompt;
    const mode = GENERATION_MODES.find((m) => m.id === selectedMode);
    if (mode && mode.id !== 'text-to-image') {
      fullPrompt = `${fullPrompt}，${mode.label}`;
    }
    if (selectedStyle) {
      fullPrompt = `${fullPrompt}，${selectedStyle}风格`;
    }
    fullPrompt = `${fullPrompt}，professional product photography, high quality, commercial use`;
    return fullPrompt;
  };

  const handleGenerate = async () => {
    if (!prompt.trim()) {
      showToast('请先输入提示词', 'error');
      return;
    }

    setIsGenerating(true);
    setErrorDetail(null);
    setGeneratedImages([]);

    try {
      const fullPrompt = buildFullPrompt();
      const result = await generateImage({
        prompt: fullPrompt,
        image: referenceImages.length > 0 ? referenceImages : undefined,
        size: selectedSize,
        watermark: false,
      });

      if (result.success && result.data) {
        const urls: string[] = [];
        if (result.data.data && Array.isArray(result.data.data)) {
          result.data.data.forEach((item: any) => {
            if (item.url) urls.push(item.url);
          });
        }
        if (result.data.url) {
          urls.push(result.data.url);
        }
        setGeneratedImages(urls);
        showToast(`成功生成 ${urls.length} 张图片`, 'success');
      }
    } catch (error: any) {
      const errMsg = error.message || '图像生成失败';
      setErrorDetail(errMsg);
      showToast(errMsg, 'error');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDownload = (url: string, index: number) => {
    const link = document.createElement('a');
    link.href = url;
    link.download = `ai_generated_${Date.now()}_${index}.png`;
    link.click();
  };

  const handleCopyPrompt = (text: string, index: number) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopiedIndex(index);
      showToast('提示词已复制', 'success');
      setTimeout(() => setCopiedIndex(null), 2000);
    });
  };

  return (
    <div className="p-6 max-w-7xl mx-auto animate-fade-in">
      {toast && <Toast message={toast.message} type={toast.type} onClose={hideToast} />}

      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center shadow-lg shadow-purple-500/20">
            <Sparkles className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-500 bg-clip-text text-transparent">
              AI 图像生成
            </h1>
            <p className="text-gray-500 text-sm">使用先进的AI技术，为您的商品快速生成专业的营销素材</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {/* 生成模式选择 */}
          <div className="bg-white rounded-xl shadow-soft p-6">
            <h3 className="text-sm font-semibold text-gray-700 mb-4 flex items-center gap-2">
              <Palette className="w-4 h-4 text-purple-500" />
              选择生成模式
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
              {GENERATION_MODES.map((mode) => (
                <button
                  key={mode.id}
                  onClick={() => setSelectedMode(mode.id)}
                  className={cn(
                    'p-3 rounded-xl text-center transition-all duration-300 border',
                    selectedMode === mode.id
                      ? 'border-purple-400 bg-purple-50 shadow-sm'
                      : 'border-gray-100 hover:border-purple-200 hover:bg-purple-50/50'
                  )}
                >
                  <mode.icon className={cn(
                    'w-5 h-5 mx-auto mb-1',
                    selectedMode === mode.id ? 'text-purple-600' : 'text-gray-400'
                  )} />
                  <span className={cn(
                    'text-xs font-medium block',
                    selectedMode === mode.id ? 'text-purple-700' : 'text-gray-600'
                  )}>
                    {mode.label}
                  </span>
                  <span className="text-[10px] text-gray-400 block mt-0.5">{mode.desc}</span>
                </button>
              ))}
            </div>
          </div>

          {/* 提示词输入 */}
          <div className="bg-white rounded-xl shadow-soft p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                <Zap className="w-4 h-4 text-amber-500" />
                自定义提示词
              </h3>
              <button
                onClick={handleOptimizePrompt}
                disabled={isOptimizing || !prompt.trim()}
                className={cn(
                  'flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300',
                  isOptimizing || !prompt.trim()
                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    : 'bg-gradient-to-r from-blue-500 to-purple-500 text-white hover:shadow-lg'
                )}
              >
                {isOptimizing ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    优化中...
                  </>
                ) : (
                  <>
                    <Lightbulb className="w-4 h-4" />
                    AI 优化提示词
                  </>
                )}
              </button>
            </div>

            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="描述你想要生成的图片内容，例如：一双红色耐克运动鞋，春节主题海报，喜庆氛围..."
              className="w-full h-28 px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-400/30 focus:border-purple-400 transition-all duration-300 resize-none text-sm shadow-sm"
            />

            {/* DeepSeek优化结果 */}
            {showOptimized && optimizedPrompt && (
              <div className="mt-4 border border-blue-200 bg-blue-50 rounded-xl p-4 animate-scale-in">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-sm font-semibold text-blue-700 flex items-center gap-2">
                    <Lightbulb className="w-4 h-4" />
                    AI 优化建议
                  </h4>
                  <button
                    onClick={() => setShowOptimized(false)}
                    className="p-1 text-blue-400 hover:text-blue-600 hover:bg-blue-100 rounded transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <div className="bg-white rounded-lg p-3 mb-3 shadow-sm">
                  <p className="text-sm text-gray-800 leading-relaxed">{optimizedPrompt}</p>
                </div>

                {optimizeExplanation && (
                  <p className="text-xs text-blue-600 mb-2">{optimizeExplanation}</p>
                )}

                {keywordsAdded.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-3">
                    {keywordsAdded.map((kw, i) => (
                      <span key={i} className="px-2 py-0.5 bg-blue-100 text-blue-700 text-xs rounded-full">
                        + {kw}
                      </span>
                    ))}
                  </div>
                )}

                <button
                  onClick={handleUseOptimized}
                  className="w-full py-2 bg-blue-500 text-white rounded-lg text-sm font-medium hover:bg-blue-600 transition-colors flex items-center justify-center gap-2"
                >
                  <Check className="w-4 h-4" />
                  一键替换为优化后的提示词
                </button>
              </div>
            )}
          </div>

          {/* 风格和尺寸选择 */}
          <div className="bg-white rounded-xl shadow-soft p-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <h3 className="text-sm font-semibold text-gray-700 mb-3">选择风格</h3>
                <div className="flex flex-wrap gap-2">
                  {STYLE_TAGS.map((tag) => (
                    <button
                      key={tag}
                      onClick={() => setSelectedStyle(selectedStyle === tag ? null : tag)}
                      className={cn(
                        'px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-300 border',
                        selectedStyle === tag
                          ? 'border-purple-400 bg-purple-50 text-purple-700 shadow-sm'
                          : 'border-gray-200 text-gray-600 hover:border-purple-200 hover:text-purple-600'
                      )}
                    >
                      {tag}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <h3 className="text-sm font-semibold text-gray-700 mb-3">输出分辨率</h3>
                <div className="flex gap-2">
                  {SIZE_OPTIONS.map((opt) => (
                    <button
                      key={opt.value}
                      onClick={() => setSelectedSize(opt.value)}
                      className={cn(
                        'px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 border',
                        selectedSize === opt.value
                          ? 'border-purple-400 bg-purple-50 text-purple-700 shadow-sm'
                          : 'border-gray-200 text-gray-600 hover:border-purple-200'
                      )}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* 参考图上传 */}
          <div className="bg-white rounded-xl shadow-soft p-6">
            <h3 className="text-sm font-semibold text-gray-700 mb-4 flex items-center gap-2">
              <ImageIcon className="w-4 h-4 text-green-500" />
              参考图片（可选）
            </h3>

            <div className="flex flex-wrap gap-3 mb-3">
              {referenceImages.map((img, index) => (
                <div key={index} className="relative w-20 h-20 rounded-lg overflow-hidden border border-gray-200">
                  <img src={img} alt="" className="w-full h-full object-cover" />
                  <button
                    onClick={() => removeReferenceImage(index)}
                    className="absolute top-0.5 right-0.5 w-5 h-5 bg-black/50 rounded-full flex items-center justify-center hover:bg-black/70 transition-colors"
                  >
                    <X className="w-3 h-3 text-white" />
                  </button>
                </div>
              ))}

              {referenceImages.length < 3 && (
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="w-20 h-20 border-2 border-dashed border-gray-200 rounded-lg flex flex-col items-center justify-center gap-1 hover:border-purple-300 hover:bg-purple-50 transition-all duration-300"
                >
                  <Upload className="w-4 h-4 text-gray-400" />
                  <span className="text-[10px] text-gray-400">上传</span>
                </button>
              )}
            </div>

            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              multiple
              onChange={handleImageUpload}
              className="hidden"
            />

            <p className="text-xs text-gray-400">支持上传最多3张参考图，用于图生图模式</p>
          </div>

          {/* 生成按钮 */}
          <button
            onClick={handleGenerate}
            disabled={isGenerating || !prompt.trim()}
            className={cn(
              'w-full py-4 rounded-xl font-semibold text-lg transition-all duration-300 relative overflow-hidden',
              isGenerating || !prompt.trim()
                ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                : 'bg-gradient-to-r from-purple-500 to-pink-500 text-white hover:shadow-xl hover:shadow-purple-500/25 hover:-translate-y-0.5'
            )}
          >
            {isGenerating ? (
              <span className="flex items-center justify-center gap-3">
                <Loader2 className="w-5 h-5 animate-spin" />
                AI 正在生成中，请稍候...
              </span>
            ) : (
              <span className="flex items-center justify-center gap-3">
                <Sparkles className="w-5 h-5" />
                开始生成
              </span>
            )}
          </button>

          {/* 错误详情 */}
          {errorDetail && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-4 animate-scale-in">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                <div className="flex-1 min-w-0">
                  <h4 className="text-sm font-semibold text-red-700 mb-1">生成失败</h4>
                  <p className="text-sm text-red-600 break-all">{errorDetail}</p>
                </div>
                <button
                  onClick={() => setErrorDetail(null)}
                  className="p-1 text-red-400 hover:text-red-600 rounded transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* 生成结果 */}
          {generatedImages.length > 0 && (
            <div className="bg-white rounded-xl shadow-soft p-6 animate-scale-in">
              <h3 className="text-sm font-semibold text-gray-700 mb-4 flex items-center gap-2">
                <ImageIcon className="w-4 h-4 text-green-500" />
                生成结果 ({generatedImages.length})
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {generatedImages.map((url, index) => (
                  <div key={index} className="border border-gray-100 rounded-xl overflow-hidden shadow-sm card-hover">
                    <img src={url} alt="" className="w-full aspect-[4/5] object-cover" />
                    <div className="p-3 bg-gray-50 flex items-center justify-between">
                      <span className="text-xs text-gray-500 font-medium">结果 {index + 1}</span>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleCopyPrompt(url, index)}
                          className="p-1.5 text-gray-500 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition-all"
                          title="复制链接"
                        >
                          {copiedIndex === index ? (
                            <Check className="w-4 h-4 text-green-500" />
                          ) : (
                            <Copy className="w-4 h-4" />
                          )}
                        </button>
                        <button
                          onClick={() => handleDownload(url, index)}
                          className="p-1.5 text-gray-500 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition-all"
                          title="下载图片"
                        >
                          <Download className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <button
                onClick={handleGenerate}
                disabled={isGenerating}
                className="mt-4 w-full py-3 border border-gray-200 text-gray-700 rounded-xl font-medium hover:bg-gray-50 transition-all duration-300 flex items-center justify-center gap-2"
              >
                <RefreshCw className="w-4 h-4" />
                重新生成
              </button>
            </div>
          )}
        </div>

        {/* 右侧辅助面板 */}
        <div className="space-y-6">
          {/* 功能介绍卡片 */}
          <div className="bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl p-6 text-white shadow-lg shadow-purple-500/20">
            <div className="flex items-center gap-2 mb-3">
              <Sparkles className="w-5 h-5" />
              <h3 className="font-semibold text-lg">AI图像生成</h3>
            </div>
            <p className="text-white/80 text-sm mb-4">
              使用先进的AI技术，为您的商品快速生成专业的营销素材
            </p>
            <div className="space-y-2">
              {['电商海报生成', '抖音首图制作', '智能背景替换', '场景化合成'].map((item) => (
                <div key={item} className="flex items-center gap-2 text-sm text-white/90">
                  <Check className="w-4 h-4 text-white/70" />
                  {item}
                </div>
              ))}
            </div>
          </div>

          {/* 使用提示 */}
          <div className="bg-white rounded-xl shadow-soft p-6">
            <h3 className="text-sm font-semibold text-gray-700 mb-4 flex items-center gap-2">
              <Lightbulb className="w-4 h-4 text-amber-500" />
              使用提示
            </h3>
            <ul className="space-y-3">
              {[
                '上传清晰的商品图片，建议使用白底图',
                '选择合适的生成模式和风格',
                '使用英文提示词通常更稳定',
                '不满意可点击"重新生成"',
              ].map((tip, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-gray-600">
                  <span className="w-5 h-5 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center text-xs flex-shrink-0 mt-0.5">
                    {i + 1}
                  </span>
                  {tip}
                </li>
              ))}
            </ul>
          </div>

          {/* 快捷风格 */}
          <div className="bg-white rounded-xl shadow-soft p-6">
            <h3 className="text-sm font-semibold text-gray-700 mb-4 flex items-center gap-2">
              <Zap className="w-4 h-4 text-purple-500" />
              快捷提示词模板
            </h3>
            <div className="space-y-2">
              {[
                { label: '电商白底图', prompt: 'product on white background, studio lighting, e-commerce photography' },
                { label: '时尚场景', prompt: 'fashion product in modern urban setting, natural lighting trending style' },
                { label: '美食展示', prompt: 'delicious food photography, steam effect, warm lighting, restaurant style' },
              ].map((tpl) => (
                <button
                  key={tpl.label}
                  onClick={() => setPrompt(tpl.prompt)}
                  className="w-full text-left px-3 py-2 border border-gray-100 rounded-lg hover:border-purple-200 hover:bg-purple-50 transition-all duration-300 text-sm"
                >
                  <span className="font-medium text-gray-700">{tpl.label}</span>
                  <span className="block text-xs text-gray-400 mt-0.5 truncate">{tpl.prompt}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
