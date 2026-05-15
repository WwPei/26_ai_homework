import { useState } from 'react';
import * as XLSX from 'xlsx';
import html2canvas from 'html2canvas';
import {
  Upload,
  Image as ImageIcon,
  Sparkles,
  Trash2,
  X,
  Loader2,
  Check,
  AlertCircle,
  SparklesIcon,
  Droplets,
  Package,
  Palette,
  Users,
  Link2,
  FolderOpen,
  Save,
  Eye,
  Edit3,
  FileSpreadsheet,
  Download,
  Copy,
  ChevronDown
} from 'lucide-react';
import { useAppStore } from '../store/useAppStore';
import { cn } from '../lib/utils';
import { Product, GeneratedDraft, Template as TemplateType } from '../types';
import { useToast, Toast } from '../components/Toast';

const categories = ['服饰', '数码', '家居', '美妆', '食品', '其他'];

interface FormData {
  name: string;
  category: string;
  brand: string;
  material: string;
  size: string;
  color: string;
  targetAudience: string;
  referenceLink: string;
  mainImage: string;
  referenceImage: string;
}

export default function Generator() {
  const { drafts, templates, addDraft, deleteDraft, addTemplate, settings, updateDraft } = useAppStore();
  const [activeTab, setActiveTab] = useState<'single' | 'batch'>('single');
  const [isGenerating, setIsGenerating] = useState(false);
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [savingDraft, setSavingDraft] = useState<GeneratedDraft | null>(null);
  const [templateName, setTemplateName] = useState('');
  const [templateTags, setTemplateTags] = useState('');
  const [selectedTemplate, setSelectedTemplate] = useState<TemplateType | null>(null);
  const [previewDraft, setPreviewDraft] = useState<GeneratedDraft | null>(null);
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const [editingDraft, setEditingDraft] = useState<GeneratedDraft | null>(null);
  const [deletingDraftId, setDeletingDraftId] = useState<string | null>(null);
  const { toast, showToast, hideToast } = useToast();
  const [excelFile, setExcelFile] = useState<File | null>(null);
  const [importedProducts, setImportedProducts] = useState<Partial<Product>[]>([]);
  const [isImporting, setIsImporting] = useState(false);
  const [isGeneratingBatch, setIsGeneratingBatch] = useState(false);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterDate, setFilterDate] = useState<string>('all');
  const [isExporting, setIsExporting] = useState(false);

  const [formData, setFormData] = useState<FormData>({
    name: '',
    category: '',
    brand: '',
    material: '',
    size: '',
    color: '',
    targetAudience: '',
    referenceLink: '',
    mainImage: '',
    referenceImage: '',
  });

  const handleInputChange = (field: keyof FormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleImageUpload = (field: 'mainImage' | 'referenceImage', e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setUploadProgress(0);
      const reader = new FileReader();
      reader.onprogress = (event) => {
        if (event.lengthComputable) {
          setUploadProgress(Math.round((event.loaded / event.total) * 100));
        }
      };
      reader.onload = (e) => {
        const url = e.target?.result as string;
        handleInputChange(field, url);
        setTimeout(() => setUploadProgress(0), 500);
      };
      reader.readAsDataURL(file);
    }
  };

  const generateTitle = (product: Partial<Product>, template?: TemplateType | null) => {
    const brand = product.brand || '品牌';
    const name = product.name || '商品';

    if (template) {
      return template.titlePattern
        .replace('{brand}', brand)
        .replace('{name}', name);
    }

    const prefixes = ['【精选】', '【热卖】', '【推荐】', '【新品】'];
    const suffix = settings.textStyle === 'promotional' ? ' - 限时特惠' :
                   settings.textStyle === 'playful' ? ' - 好看又实用' : '';
    const prefix = prefixes[Math.floor(Math.random() * prefixes.length)];
    return `${prefix}${brand}${name}${suffix}`;
  };

  const generateSellingPoints = (product: Partial<Product>, template?: TemplateType | null) => {
    const category = product.category || '商品';

    if (template) {
      return template.sellingPointPatterns;
    }

    const pointsByCategory: Record<string, string[][]> = {
      '服饰': [
        ['面料舒适，穿着亲肤', '版型修身，修饰身材', '做工精细，细节满分'],
        ['透气性好，夏日必备', '弹性充足，活动自如', '颜色正，不掉色'],
      ],
      '数码': [
        ['性能强劲，运行流畅', '外观时尚，科技感十足', '续航持久，使用安心'],
        ['配置高，性价比之选', '拍照清晰，记录美好', '散热好，不发烫'],
      ],
      '家居': [
        ['材质环保，安全放心', '设计人性化，使用便捷', '收纳有序，整洁美观'],
        ['做工扎实，耐用持久', '美观大方，提升格调', '易清洁，省时省力'],
      ],
      '美妆': [
        ['成分温和，不刺激', '遮瑕力强，持久服帖', '提亮肤色，显气色'],
        ['包装精美，送礼自用皆宜', '味道好闻，心情愉悦', '使用感清爽，不油腻'],
      ],
      '食品': [
        ['口感醇厚，美味可口', '配料干净，健康无添加', '包装严密，新鲜直达'],
        ['量大实惠，性价比高', '味道正宗，地道风味', '食用方便，随时享用'],
      ],
      '其他': [
        ['品质优良，经久耐用', '设计独特，彰显个性', '用途广泛，实用性强'],
        ['做工精细，质量保障', '外观精美，爱不释手', '方便实用，值得拥有'],
      ],
    };

    const points = pointsByCategory[category]?.[Math.floor(Math.random() * 2)] ||
                   pointsByCategory['其他'][Math.floor(Math.random() * 2)];

    return points;
  };

  const handleGenerate = async () => {
    if (!formData.name || !formData.category) {
      return;
    }

    setIsGenerating(true);

    const product: Partial<Product> = {
      name: formData.name,
      category: formData.category,
      brand: formData.brand,
      material: formData.material,
      size: formData.size,
      color: formData.color,
      targetAudience: formData.targetAudience,
      mainImage: formData.mainImage,
      referenceImage: formData.referenceImage,
    };

    await new Promise((resolve) => setTimeout(resolve, 1500));

    const mainImage = formData.mainImage ||
      `https://images.unsplash.com/photo-${1550000000000 + Math.floor(Math.random() * 100000000)}?w=400&h=500&fit=crop`;

    const draft: GeneratedDraft = {
      id: Date.now().toString(),
      productId: Date.now().toString(),
      mainImage: mainImage,
      title: generateTitle(product, selectedTemplate),
      sellingPoints: generateSellingPoints(product, selectedTemplate),
      createdAt: new Date().toISOString(),
      status: 'draft',
    };

    addDraft(draft);
    setIsGenerating(false);

    if (selectedTemplate) {
      setSavingDraft(draft);
      setShowSaveModal(true);
    }
  };

  const handleSaveAsTemplate = () => {
    if (!savingDraft || !templateName.trim()) return;

    const newTemplate: TemplateType = {
      id: Date.now().toString(),
      name: templateName,
      tags: templateTags.split(',').map(t => t.trim()).filter(Boolean),
      previewImage: savingDraft.mainImage,
      titlePattern: savingDraft.title.replace(savingDraft.title.split('】')[1]?.split(' - ')[0] || '', '{name}'),
      sellingPointPatterns: savingDraft.sellingPoints,
      usageCount: 0,
      createdAt: new Date().toISOString(),
    };

    addTemplate(newTemplate);
    setShowSaveModal(false);
    setSavingDraft(null);
    setTemplateName('');
    setTemplateTags('');
  };

  const handleDeleteDraft = (id: string) => {
    setDeletingDraftId(id);
  };

  const confirmDeleteDraft = (id: string) => {
    deleteDraft(id);
    if (previewDraft?.id === id) {
      setPreviewDraft(null);
    }
    setDeletingDraftId(null);
    showToast('草稿删除成功', 'success');
  };

  const cancelDeleteDraft = () => {
    setDeletingDraftId(null);
  };

  const handleEditDraft = (draft: GeneratedDraft) => {
    setEditingDraft(draft);
  };

  const handleUpdateDraft = (id: string, updates: Partial<GeneratedDraft>) => {
    updateDraft(id, updates);
    setEditingDraft(null);
    showToast('草稿更新成功', 'success');
  };

  const cancelEditDraft = () => {
    setEditingDraft(null);
  };

  const handleExcelUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && (file.name.endsWith('.xlsx') || file.name.endsWith('.xls'))) {
      setExcelFile(file);
      processExcelFile(file);
    } else {
      showToast('请上传Excel文件(.xlsx或.xls)', 'error');
    }
  };

  const processExcelFile = (file: File) => {
    setIsImporting(true);
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = e.target?.result;
        const workbook = XLSX.read(data, { type: 'binary' });
        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];
        const jsonData = XLSX.utils.sheet_to_json(worksheet);
        
        const products: Partial<Product>[] = jsonData.map((row: any) => ({
          name: row['商品名称'] || row['name'] || '',
          category: row['商品类目'] || row['category'] || '',
          brand: row['品牌'] || row['brand'] || '',
          material: row['材质'] || row['material'] || '',
          size: row['尺寸'] || row['size'] || '',
          color: row['颜色'] || row['color'] || '',
          targetAudience: row['目标受众'] || row['targetAudience'] || '',
          referenceLink: row['参考链接'] || row['referenceLink'] || '',
          mainImage: row['主图'] || row['mainImage'] || '',
        })).filter(p => p.name);
        
        setImportedProducts(products);
        showToast(`成功导入 ${products.length} 个商品`, 'success');
      } catch (error) {
        showToast('Excel文件解析失败', 'error');
        console.error('Excel解析错误:', error);
      } finally {
        setIsImporting(false);
      }
    };
    reader.readAsBinaryString(file);
  };

  const handleBatchGenerate = () => {
    if (importedProducts.length === 0) {
      showToast('请先导入商品数据', 'error');
      return;
    }
    
    setIsGeneratingBatch(true);
    
    // 模拟批量生成过程
    setTimeout(() => {
      importedProducts.forEach((product, index) => {
        setTimeout(() => {
          const title = generateTitle(product, selectedTemplate);
          const sellingPoints = generateSellingPoints(product, selectedTemplate);
          
          const newDraft: GeneratedDraft = {
            id: Date.now().toString() + index,
            productId: `p${Date.now() + index}`,
            mainImage: product.mainImage || 'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=400&h=500&fit=crop',
            title,
            sellingPoints,
            createdAt: new Date().toISOString(),
            status: 'draft',
          };
          
          addDraft(newDraft);
        }, index * 200);
      });
      
      setTimeout(() => {
        setIsGeneratingBatch(false);
        showToast(`成功生成 ${importedProducts.length} 个素材`, 'success');
        setImportedProducts([]);
        setExcelFile(null);
      }, importedProducts.length * 200 + 500);
    }, 500);
  };

  const handlePreview = (draft: GeneratedDraft) => {
    setPreviewDraft(draft);
  };

  const getFilteredDrafts = () => {
    let filtered = drafts;
    
    // 按状态筛选
    if (filterStatus !== 'all') {
      filtered = filtered.filter(draft => draft.status === filterStatus);
    }
    
    // 按日期筛选
    if (filterDate !== 'all') {
      const now = new Date();
      filtered = filtered.filter(draft => {
        const draftDate = new Date(draft.createdAt);
        const diffTime = Math.abs(now.getTime() - draftDate.getTime());
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        
        switch (filterDate) {
          case 'today':
            return diffDays === 0;
          case 'week':
            return diffDays <= 7;
          case 'month':
            return diffDays <= 30;
          default:
            return true;
        }
      });
    }
    
    return filtered;
  };

  const handleExportAsImage = async (draft: GeneratedDraft) => {
    setIsExporting(true);
    try {
      const element = document.getElementById(`draft-${draft.id}`);
      if (!element) {
        showToast('找不到导出元素', 'error');
        return;
      }
      
      const canvas = await html2canvas(element, {
        backgroundColor: '#ffffff',
        scale: 2,
        useCORS: true
      });
      
      const dataUrl = canvas.toDataURL('image/png');
      const link = document.createElement('a');
      link.href = dataUrl;
      link.download = `商品素材_${draft.title.substring(0, 10)}.png`;
      link.click();
      
      showToast('导出成功', 'success');
    } catch (error) {
      console.error('导出失败:', error);
      showToast('导出失败', 'error');
    } finally {
      setIsExporting(false);
    }
  };

  const handleCopyText = (draft: GeneratedDraft) => {
    const text = `${draft.title}\n\n${draft.sellingPoints.map((point, index) => `${index + 1}. ${point}`).join('\n')}`;
    navigator.clipboard.writeText(text)
      .then(() => {
        showToast('文案已复制到剪贴板', 'success');
      })
      .catch(() => {
        showToast('复制失败', 'error');
      });
  };

  return (
    <div className="p-6 max-w-7xl mx-auto animate-fade-in">
      <div className="mb-8">
        <h1 className="text-[clamp(1.5rem,3vw,2.5rem)] font-bold text-gray-900 flex items-center gap-3">
          <Sparkles className="w-8 h-8 text-primary" />
          素材生成
        </h1>
        <p className="text-gray-500 mt-2 text-lg">创建商品图文素材，投放到抖音电商平台</p>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        <div className="w-full lg:w-2/5">
          <div className="bg-white rounded-xl shadow-soft p-6">
            <div className="flex border-b border-gray-200 mb-6">
              <button
                onClick={() => setActiveTab('single')}
                className={cn(
                  'px-6 py-3 font-medium text-sm transition-all duration-300 relative',
                  activeTab === 'single'
                    ? 'text-primary border-b-2 border-primary'
                    : 'text-gray-500 hover:text-gray-700'
                )}
              >
                单品录入
                <div className={cn(
                  'absolute -bottom-1 left-0 right-0 h-0.5 transition-all duration-300',
                  activeTab === 'single' ? 'bg-primary' : 'bg-transparent'
                )} />
              </button>
              <button
                onClick={() => setActiveTab('batch')}
                className={cn(
                  'px-6 py-3 font-medium text-sm transition-all duration-300 relative',
                  activeTab === 'batch'
                    ? 'text-primary border-b-2 border-primary'
                    : 'text-gray-500 hover:text-gray-700'
                )}
              >
                批量导入
                <div className={cn(
                  'absolute -bottom-1 left-0 right-0 h-0.5 transition-all duration-300',
                  activeTab === 'batch' ? 'bg-primary' : 'bg-transparent'
                )} />
              </button>
            </div>

            {activeTab === 'single' ? (
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-1">
                    <Package className="w-4 h-4 text-gray-500" />
                    商品名称 <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    placeholder="请输入商品名称"
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all duration-300 shadow-sm"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-1">
                    <Droplets className="w-4 h-4 text-gray-500" />
                    商品类目 <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) => handleInputChange('category', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all duration-300 shadow-sm"
                  >
                    <option value="">请选择类目</option>
                    {categories.map((cat) => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">品牌</label>
                    <input
                      type="text"
                      value={formData.brand}
                      onChange={(e) => handleInputChange('brand', e.target.value)}
                      placeholder="选填"
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all duration-300 shadow-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">材质</label>
                    <input
                      type="text"
                      value={formData.material}
                      onChange={(e) => handleInputChange('material', e.target.value)}
                      placeholder="选填"
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all duration-300 shadow-sm"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">尺寸/规格</label>
                    <input
                      type="text"
                      value={formData.size}
                      onChange={(e) => handleInputChange('size', e.target.value)}
                      placeholder="选填"
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all duration-300 shadow-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-1">
                      <Palette className="w-4 h-4 text-gray-500" />
                      颜色
                    </label>
                    <input
                      type="text"
                      value={formData.color}
                      onChange={(e) => handleInputChange('color', e.target.value)}
                      placeholder="选填"
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all duration-300 shadow-sm"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-1">
                    <Users className="w-4 h-4 text-gray-500" />
                    适用人群
                  </label>
                  <input
                    type="text"
                    value={formData.targetAudience}
                    onChange={(e) => handleInputChange('targetAudience', e.target.value)}
                    placeholder="选填"
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all duration-300 shadow-sm"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-1">
                    <Link2 className="w-4 h-4 text-gray-500" />
                    参考链接
                  </label>
                  <input
                    type="text"
                    value={formData.referenceLink}
                    onChange={(e) => handleInputChange('referenceLink', e.target.value)}
                    placeholder="输入历史爆款链接（选填）"
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all duration-300 shadow-sm"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    主图上传 <span className="text-red-500">*</span>
                  </label>
                  <div 
                    className={cn(
                      'border-2 border-dashed rounded-2xl p-6 text-center transition-all duration-300 relative',
                      formData.mainImage 
                        ? 'border-primary/30 bg-primary/5' 
                        : 'border-gray-200 hover:border-primary/50 hover:bg-primary/5'
                    )}
                  >
                    {formData.mainImage ? (
                      <div className="relative">
                        <img
                          src={formData.mainImage}
                          alt="主图预览"
                          className="max-h-48 mx-auto rounded-xl shadow-soft transition-transform duration-500 hover:scale-105"
                        />
                        <button
                          onClick={() => handleInputChange('mainImage', '')}
                          className="absolute -top-3 -right-3 w-8 h-8 bg-red-500 text-white rounded-full flex items-center justify-center shadow-lg hover:bg-red-600 transition-colors"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ) : (
                      <>
                        <Upload className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                        <p className="text-sm font-medium text-gray-600">点击或拖拽上传主图</p>
                        <p className="text-xs text-gray-400 mt-1">支持 JPG、PNG，建议尺寸 800x1000</p>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => handleImageUpload('mainImage', e)}
                          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                        />
                      </>
                    )}
                    {uploadProgress > 0 && (
                      <div className="absolute bottom-0 left-0 right-0 h-1 bg-gray-200">
                        <div 
                          className="h-full bg-primary transition-all duration-300" 
                          style={{ width: `${uploadProgress}%` }}
                        />
                      </div>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">参考图上传</label>
                  <div className="border-2 border-dashed border-gray-200 rounded-2xl p-4 text-center hover:border-primary/50 hover:bg-primary/5 transition-all duration-300">
                    {formData.referenceImage ? (
                      <div className="relative">
                        <img
                          src={formData.referenceImage}
                          alt="参考图预览"
                          className="max-h-36 mx-auto rounded-lg shadow-sm transition-transform duration-500 hover:scale-105"
                        />
                        <button
                          onClick={() => handleInputChange('referenceImage', '')}
                          className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 transition-colors"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    ) : (
                      <>
                        <ImageIcon className="w-10 h-10 text-gray-400 mx-auto mb-2" />
                        <p className="text-sm text-gray-500">上传参考图（选填）</p>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => handleImageUpload('referenceImage', e)}
                          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                        />
                      </>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3 flex items-center gap-1">
                    <FolderOpen className="w-4 h-4 text-gray-500" />
                    选择模板（可选）
                  </label>
                  <div className="grid grid-cols-3 gap-3">
                    {templates.slice(0, 6).map((template) => (
                      <div
                        key={template.id}
                        onClick={() => setSelectedTemplate(selectedTemplate?.id === template.id ? null : template)}
                        className={cn(
                          'relative rounded-lg overflow-hidden cursor-pointer border-2 transition-all duration-300',
                          selectedTemplate?.id === template.id
                            ? 'border-primary shadow-md ring-2 ring-primary/20'
                            : 'border-transparent hover:border-gray-200 hover:shadow-sm'
                        )}
                      >
                        <img
                          src={template.previewImage}
                          alt={template.name}
                          className="w-full h-20 object-cover transition-transform duration-500 hover:scale-110"
                        />
                        <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent p-2">
                          <p className="text-white text-xs font-medium truncate">{template.name}</p>
                        </div>
                        {selectedTemplate?.id === template.id && (
                          <div className="absolute top-2 right-2 w-5 h-5 gradient-primary rounded-full flex items-center justify-center shadow-md">
                            <Check className="w-3 h-3 text-white" />
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                <button
                  onClick={handleGenerate}
                  disabled={!formData.name || !formData.category || isGenerating}
                  className={cn(
                    'w-full py-4 rounded-xl font-medium flex items-center justify-center gap-2 transition-all duration-300',
                    !formData.name || !formData.category
                      ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                      : 'gradient-primary text-white btn-primary shadow-lg'
                  )}
                >
                  {isGenerating ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      生成中...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-5 h-5" />
                      立即生成
                    </>
                  )}
                </button>
              </div>
            ) : (
              <div className="py-10 text-center animate-fade-in">
                <div className="w-20 h-20 gradient-secondary rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
                  <FileSpreadsheet className="w-10 h-10 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">批量导入功能</h3>
                <p className="text-gray-500 mb-6 max-w-md mx-auto">
                  支持 Excel/CSV 格式批量导入商品信息，快速生成多个素材
                </p>
                
                <div className="mb-8">
                  <div className="border-2 border-dashed border-gray-200 rounded-2xl p-6 text-center hover:border-primary/50 hover:bg-primary/5 transition-all duration-300">
                    {isImporting ? (
                      <div className="flex flex-col items-center gap-4">
                        <Loader2 className="w-8 h-8 text-primary animate-spin" />
                        <p className="text-gray-600">正在解析Excel文件...</p>
                      </div>
                    ) : (
                      <>
                        <FileSpreadsheet className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                        <p className="text-sm font-medium text-gray-600 mb-2">点击或拖拽上传Excel文件</p>
                        <p className="text-xs text-gray-400 mb-4">支持 .xlsx、.xls 格式</p>
                        <input
                          type="file"
                          accept=".xlsx,.xls"
                          onChange={handleExcelUpload}
                          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                        />
                        <button className="px-6 py-3 gradient-secondary text-white rounded-xl font-medium btn-primary shadow-lg">
                          选择文件
                        </button>
                      </>
                    )}
                  </div>
                  
                  {excelFile && (
                    <div className="mt-4 bg-gray-50 rounded-xl p-4 shadow-inner">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <FileSpreadsheet className="w-5 h-5 text-secondary" />
                          <span className="text-sm font-medium text-gray-900">{excelFile.name}</span>
                        </div>
                        <button
                          onClick={() => {
                            setExcelFile(null);
                            setImportedProducts([]);
                          }}
                          className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-200 rounded-lg transition-colors"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                      {importedProducts.length > 0 && (
                        <div className="mt-2">
                          <p className="text-sm text-gray-500 mb-2">已解析 {importedProducts.length} 个商品：</p>
                          <div className="max-h-40 overflow-y-auto">
                            {importedProducts.slice(0, 5).map((product, index) => (
                              <div key={index} className="flex items-center justify-between p-2 border-b border-gray-100 last:border-0">
                                <span className="text-sm text-gray-700 truncate">{product.name}</span>
                                <span className="text-xs text-gray-500">{product.category}</span>
                              </div>
                            ))}
                            {importedProducts.length > 5 && (
                              <div className="p-2 text-center text-sm text-gray-500">
                                还有 {importedProducts.length - 5} 个商品...
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
                
                <button
                  onClick={handleBatchGenerate}
                  disabled={importedProducts.length === 0 || isGeneratingBatch}
                  className={cn(
                    'px-8 py-3 rounded-xl font-medium transition-all duration-300',
                    importedProducts.length === 0 || isGeneratingBatch
                      ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                      : 'gradient-primary text-white btn-primary shadow-lg'
                  )}
                >
                  {isGeneratingBatch ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin mr-2" />
                      批量生成中...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4 mr-2" />
                      批量生成 ({importedProducts.length})
                    </>
                  )}
                </button>
                
                <div className="mt-6">
                  <a 
                    href="/template.xlsx" 
                    download="商品导入模板.xlsx"
                    className="text-sm text-secondary hover:underline flex items-center gap-1 justify-center"
                  >
                    <FileSpreadsheet className="w-4 h-4" />
                    下载Excel模板
                  </a>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="w-full lg:w-3/5">
          <div className="bg-white rounded-xl shadow-soft p-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 gap-4">
              <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
                <ImageIcon className="w-5 h-5 text-primary" />
                生成结果 ({getFilteredDrafts().length})
              </h2>
              <div className="flex flex-wrap gap-3">
                <div className="relative">
                  <select
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                    className="appearance-none pl-3 pr-8 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all duration-300 bg-white text-sm"
                  >
                    <option value="all">全部状态</option>
                    <option value="draft">草稿</option>
                    <option value="saved">已保存</option>
                    <option value="applied">已应用</option>
                  </select>
                  <div className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
                    <ChevronDown className="w-4 h-4" />
                  </div>
                </div>
                <div className="relative">
                  <select
                    value={filterDate}
                    onChange={(e) => setFilterDate(e.target.value)}
                    className="appearance-none pl-3 pr-8 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all duration-300 bg-white text-sm"
                  >
                    <option value="all">全部时间</option>
                    <option value="today">今天</option>
                    <option value="week">本周</option>
                    <option value="month">本月</option>
                  </select>
                  <div className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
                    <ChevronDown className="w-4 h-4" />
                  </div>
                </div>
              </div>
            </div>

            {getFilteredDrafts().length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {getFilteredDrafts().map((draft, index) => (
                  <div
                    key={draft.id}
                    id={`draft-${draft.id}`}
                    className="border border-gray-100 rounded-xl overflow-hidden shadow-soft card-hover"
                    style={{ animationDelay: `${index * 0.1}s` }}
                  >
                    <div
                      className="relative aspect-[4/5] cursor-pointer overflow-hidden"
                      onClick={() => handlePreview(draft)}
                    >
                      <img
                        src={draft.mainImage}
                        alt=""
                        className="w-full h-full object-cover transition-transform duration-700 hover:scale-110"
                      />
                      <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent p-4">
                        <h3 className="text-white font-medium text-sm line-clamp-2 transition-all duration-300 hover:text-white/90">{draft.title}</h3>
                        <div className="mt-2 space-y-1">
                          {draft.sellingPoints.slice(0, 2).map((point, idx) => (
                            <p key={idx} className="text-white/80 text-xs">• {point}</p>
                          ))}
                        </div>
                      </div>
                      <div className="absolute top-3 left-3 bg-black/60 text-white text-xs px-2 py-1 rounded-full backdrop-blur-sm">
                        {new Date(draft.createdAt).toLocaleDateString('zh-CN')}
                      </div>
                    </div>
                    <div className="p-4 bg-gray-50 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <button
                          onClick={() => handlePreview(draft)}
                          className="p-2 text-gray-500 hover:text-primary hover:bg-primary/10 rounded-lg transition-all duration-300"
                          title="预览"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleEditDraft(draft)}
                          className="p-2 text-gray-500 hover:text-primary hover:bg-primary/10 rounded-lg transition-all duration-300"
                          title="编辑"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => {
                            setSavingDraft(draft);
                            setShowSaveModal(true);
                          }}
                          className="p-2 text-gray-500 hover:text-primary hover:bg-primary/10 rounded-lg transition-all duration-300"
                          title="收藏为模板"
                        >
                          <Save className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleExportAsImage(draft)}
                          disabled={isExporting}
                          className="p-2 text-gray-500 hover:text-primary hover:bg-primary/10 rounded-lg transition-all duration-300"
                          title="导出为图片"
                        >
                          {isExporting ? (
                            <Loader2 className="w-4 h-4 text-primary animate-spin" />
                          ) : (
                            <Download className="w-4 h-4" />
                          )}
                        </button>
                        <button
                          onClick={() => handleCopyText(draft)}
                          className="p-2 text-gray-500 hover:text-primary hover:bg-primary/10 rounded-lg transition-all duration-300"
                          title="复制文案"
                        >
                          <Copy className="w-4 h-4" />
                        </button>
                      </div>
                      <button
                        onClick={() => handleDeleteDraft(draft.id)}
                        className="p-2 text-gray-500 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all duration-300"
                        title="删除"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-20 text-center animate-fade-in">
                <div className="w-24 h-24 gradient-primary rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
                  <SparklesIcon className="w-12 h-12 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">暂无生成结果</h3>
                <p className="text-gray-500 mb-6 max-w-md mx-auto">
                  填写左侧商品信息，点击"立即生成"开始创作高质量的商品图文素材
                </p>
                <div className="flex justify-center">
                  <div className="px-4 py-2 bg-gray-100 rounded-lg text-gray-600 text-sm flex items-center gap-2">
                    <AlertCircle className="w-4 h-4" />
                    主图和商品名称为必填项
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {showSaveModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 animate-fade-in">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md mx-4 shadow-elevated animate-scale-in">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
                <Save className="w-5 h-5 text-primary" />
                收藏为模板
              </h3>
              <button
                onClick={() => {
                  setShowSaveModal(false);
                  setSavingDraft(null);
                  setTemplateName('');
                  setTemplateTags('');
                }}
                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">模板名称</label>
                <input
                  type="text"
                  value={templateName}
                  onChange={(e) => setTemplateName(e.target.value)}
                  placeholder="请输入模板名称"
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all duration-300 shadow-sm"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">标签</label>
                <input
                  type="text"
                  value={templateTags}
                  onChange={(e) => setTemplateTags(e.target.value)}
                  placeholder="多个标签用逗号分隔，如：男包,奢品,高级"
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all duration-300 shadow-sm"
                />
              </div>

              <div className="bg-gray-50 rounded-xl p-4 shadow-inner">
                <p className="text-sm font-medium text-gray-700 mb-3">模板预览</p>
                <div className="flex gap-4">
                  {savingDraft && (
                    <>
                      <img
                        src={savingDraft.mainImage}
                        alt=""
                        className="w-24 h-30 object-cover rounded-lg shadow-soft"
                      />
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-900 line-clamp-2">
                          {savingDraft.title}
                        </p>
                        <div className="mt-2 space-y-1">
                          {savingDraft.sellingPoints.slice(0, 2).map((point, idx) => (
                            <p key={idx} className="text-xs text-gray-500 flex items-start gap-1">
                              <Check className="w-3 h-3 text-primary mt-0.5 flex-shrink-0" />
                              {point}
                            </p>
                          ))}
                        </div>
                      </div>
                    </>
                  )}
                </div>
              </div>

              <div className="flex gap-4 pt-4">
                <button
                  onClick={() => {
                    setShowSaveModal(false);
                    setSavingDraft(null);
                    setTemplateName('');
                    setTemplateTags('');
                  }}
                  className="flex-1 py-3 border border-gray-200 text-gray-700 rounded-xl font-medium hover:bg-gray-50 transition-all duration-300 shadow-sm"
                >
                  取消
                </button>
                <button
                  onClick={handleSaveAsTemplate}
                  disabled={!templateName.trim()}
                  className={cn(
                    'flex-1 py-3 rounded-xl font-medium transition-all duration-300',
                    templateName.trim()
                      ? 'gradient-primary text-white btn-primary shadow-lg'
                      : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  )}
                >
                  保存模板
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {previewDraft && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-8 animate-fade-in">
          <div className="bg-white rounded-2xl max-w-2xl w-full overflow-hidden animate-scale-in">
            <div className="relative">
              <img
                src={previewDraft.mainImage}
                alt=""
                className="w-full aspect-[4/5] object-cover"
              />
              <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/90 via-black/60 to-transparent p-6">
                <h2 className="text-white text-2xl font-bold">{previewDraft.title}</h2>
                <div className="mt-4 space-y-2">
                  {previewDraft.sellingPoints.map((point, idx) => (
                    <div key={idx} className="flex items-center gap-2">
                      <Check className="w-5 h-5 text-green-400" />
                      <span className="text-white/90">{point}</span>
                    </div>
                  ))}
                </div>
              </div>
              <button
                onClick={() => setPreviewDraft(null)}
                className="absolute top-4 right-4 w-10 h-10 bg-black/50 text-white rounded-full flex items-center justify-center hover:bg-black/70 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-5 bg-gray-50 flex items-center justify-between">
              <span className="text-sm text-gray-500">
                生成时间：{new Date(previewDraft.createdAt).toLocaleString('zh-CN')}
              </span>
              <button
                onClick={() => setPreviewDraft(null)}
                className="px-5 py-2.5 gradient-primary text-white rounded-lg font-medium btn-primary shadow-soft"
              >
                关闭
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 编辑草稿弹窗 */}
      {editingDraft && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 animate-fade-in">
          <div className="bg-white rounded-2xl p-6 w-full max-w-2xl mx-4 shadow-elevated animate-scale-in">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
                <Edit3 className="w-5 h-5 text-primary" />
                编辑草稿
              </h3>
              <button
                onClick={cancelEditDraft}
                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">商品标题</label>
                <input
                  type="text"
                  value={editingDraft.title}
                  onChange={(e) => setEditingDraft({ ...editingDraft, title: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all duration-300 shadow-sm"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">卖点文案</label>
                {editingDraft.sellingPoints.map((point, index) => (
                  <div key={index} className="mb-2">
                    <input
                      type="text"
                      value={point}
                      onChange={(e) => {
                        const newPoints = [...editingDraft.sellingPoints];
                        newPoints[index] = e.target.value;
                        setEditingDraft({ ...editingDraft, sellingPoints: newPoints });
                      }}
                      className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all duration-300 shadow-sm"
                      placeholder={`卖点 ${index + 1}`}
                    />
                  </div>
                ))}
              </div>

              <div className="flex gap-4 pt-4">
                <button
                  onClick={cancelEditDraft}
                  className="flex-1 py-3 border border-gray-200 text-gray-700 rounded-xl font-medium hover:bg-gray-50 transition-all duration-300 shadow-sm"
                >
                  取消
                </button>
                <button
                  onClick={() => handleUpdateDraft(editingDraft.id, editingDraft)}
                  className="flex-1 py-3 gradient-primary text-white rounded-xl font-medium transition-all duration-300 shadow-lg"
                >
                  保存修改
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 删除确认对话框 */}
      {deletingDraftId && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 animate-fade-in">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md mx-4 shadow-elevated animate-scale-in">
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Trash2 className="w-8 h-8 text-red-500" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">确认删除</h3>
              <p className="text-gray-500">确定要删除这个草稿吗？此操作不可撤销。</p>
            </div>

            <div className="flex gap-4">
              <button
                onClick={cancelDeleteDraft}
                className="flex-1 py-3 border border-gray-200 text-gray-700 rounded-xl font-medium hover:bg-gray-50 transition-all duration-300 shadow-sm"
              >
                取消
              </button>
              <button
                onClick={() => confirmDeleteDraft(deletingDraftId)}
                className="flex-1 py-3 bg-red-500 text-white rounded-xl font-medium hover:bg-red-600 transition-all duration-300 shadow-lg"
              >
                确认删除
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toast通知 */}
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={hideToast}
        />
      )}
    </div>
  );
}