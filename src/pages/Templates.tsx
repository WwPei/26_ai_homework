import { useState } from 'react';
import {
  Search,
  Plus,
  Grid,
  List,
  Edit3,
  Play,
  Trash2,
  X,
  FolderOpen,
  Tag as TagIcon,
  Star,
  Clock,
  BarChart2,
  Eye
} from 'lucide-react';
import { useAppStore } from '../store/useAppStore';
import { cn } from '../lib/utils';
import { Template } from '../types';
import { useToast, Toast } from '../components/Toast';

export default function Templates() {
  const { templates, deleteTemplate, addTemplate } = useAppStore();
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<Template | null>(null);
  const [previewTemplate, setPreviewTemplate] = useState<Template | null>(null);
  const [deletingTemplateId, setDeletingTemplateId] = useState<string | null>(null);
  const { toast, showToast, hideToast } = useToast();
  const [previewForm, setPreviewForm] = useState({
    brand: '示例品牌',
    name: '示例商品',
  });

  const [formData, setFormData] = useState({
    name: '',
    tags: '',
    titlePattern: '',
    sellingPoint1: '',
    sellingPoint2: '',
    sellingPoint3: '',
  });

  const allTags = Array.from(new Set(templates.flatMap((t) => t.tags)));

  const filteredTemplates = templates.filter((template) => {
    const matchesSearch =
      template.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      template.tags.some((tag) => tag.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesTag = selectedTag ? template.tags.includes(selectedTag) : true;
    return matchesSearch && matchesTag;
  });

  const handleApplyTemplate = (template: Template) => {
    // 应用模板到生成页面
    window.location.href = `/generate?template=${template.id}`;
  };

  const handleCreateTemplate = () => {
    const newTemplate: Template = {
      id: Date.now().toString(),
      name: formData.name,
      tags: formData.tags.split(',').map((t) => t.trim()).filter(Boolean),
      previewImage: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=500&fit=crop',
      titlePattern: formData.titlePattern || '【{brand}】{name} - 优质之选',
      sellingPointPatterns: [formData.sellingPoint1, formData.sellingPoint2, formData.sellingPoint3].filter(Boolean),
      usageCount: 0,
      createdAt: new Date().toISOString(),
    };

    addTemplate(newTemplate);
    resetForm();
  };

  const handleEditTemplate = () => {
    if (!editingTemplate) return;

    const updated: Template = {
      ...editingTemplate,
      name: formData.name,
      tags: formData.tags.split(',').map((t) => t.trim()).filter(Boolean),
      titlePattern: formData.titlePattern,
      sellingPointPatterns: [formData.sellingPoint1, formData.sellingPoint2, formData.sellingPoint3].filter(Boolean),
    };

    useAppStore.getState().updateTemplate(editingTemplate.id, updated);
    setEditingTemplate(null);
    resetForm();
  };

  const resetForm = () => {
    setFormData({
      name: '',
      tags: '',
      titlePattern: '',
      sellingPoint1: '',
      sellingPoint2: '',
      sellingPoint3: '',
    });
    setShowCreateModal(false);
    setEditingTemplate(null);
  };

  const handleDeleteTemplate = (id: string) => {
    setDeletingTemplateId(id);
  };

  const confirmDeleteTemplate = (id: string) => {
    deleteTemplate(id);
    setDeletingTemplateId(null);
    showToast('模板删除成功', 'success');
  };

  const cancelDeleteTemplate = () => {
    setDeletingTemplateId(null);
  };

  const openEditModal = (template: Template) => {
    setEditingTemplate(template);
    setFormData({
      name: template.name,
      tags: template.tags.join(', '),
      titlePattern: template.titlePattern,
      sellingPoint1: template.sellingPointPatterns[0] || '',
      sellingPoint2: template.sellingPointPatterns[1] || '',
      sellingPoint3: template.sellingPointPatterns[2] || '',
    });
    setShowCreateModal(true);
  };

  return (
    <div className="p-6 max-w-7xl mx-auto animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8 gap-4">
        <div>
          <h1 className="text-[clamp(1.5rem,3vw,2.5rem)] font-bold text-gray-900 flex items-center gap-3">
            <FolderOpen className="w-8 h-8 text-primary" />
            模板管理
          </h1>
          <p className="text-gray-500 mt-2 text-lg">管理和使用你的素材模板库</p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="inline-flex items-center gap-2 gradient-primary text-white px-6 py-3 rounded-xl font-medium btn-primary shadow-lg transition-all duration-300"
        >
          <Plus className="w-5 h-5" />
          新建模板
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-soft p-6 mb-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex-1 min-w-[200px] relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="搜索模板名称或标签..."
              className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all duration-300 shadow-sm"
            />
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 bg-gray-50 rounded-lg p-1 shadow-sm">
              <button
                onClick={() => setViewMode('grid')}
                className={cn(
                  'p-2 rounded-lg transition-all duration-300',
                  viewMode === 'grid'
                    ? 'bg-white text-primary shadow-md'
                    : 'text-gray-400 hover:text-gray-600'
                )}
              >
                <Grid className="w-5 h-5" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={cn(
                  'p-2 rounded-lg transition-all duration-300',
                  viewMode === 'list'
                    ? 'bg-white text-primary shadow-md'
                    : 'text-gray-400 hover:text-gray-600'
                )}
              >
                <List className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>

        {allTags.length > 0 && (
          <div className="flex items-center gap-3 mt-6 flex-wrap">
            <TagIcon className="w-5 h-5 text-gray-500 flex-shrink-0" />
            <div className="flex items-center gap-2 flex-wrap">
              <button
                onClick={() => setSelectedTag(null)}
                className={cn(
                  'px-4 py-2 rounded-lg text-sm transition-all duration-300 font-medium',
                  selectedTag === null
                    ? 'bg-primary text-white shadow-md'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                )}
              >
                全部
              </button>
              {allTags.map((tag) => (
                <button
                  key={tag}
                  onClick={() => setSelectedTag(selectedTag === tag ? null : tag)}
                  className={cn(
                    'px-4 py-2 rounded-lg text-sm transition-all duration-300 font-medium',
                    selectedTag === tag
                      ? 'bg-primary text-white shadow-md'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  )}
                >
                  {tag}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {filteredTemplates.length > 0 ? (
        viewMode === 'grid' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredTemplates.map((template, index) => (
              <div
                key={template.id}
                className="bg-white rounded-xl shadow-soft overflow-hidden card-hover"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div
                  className="relative aspect-[4/5] cursor-pointer overflow-hidden"
                  onClick={() => setPreviewTemplate(template)}
                >
                  <img
                    src={template.previewImage}
                    alt={template.name}
                    className="w-full h-full object-cover transition-transform duration-700 hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent opacity-0 hover:opacity-100 transition-opacity duration-300 flex items-center justify-center gap-3 p-4">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        openEditModal(template);
                      }}
                      className="p-3 bg-white rounded-xl text-gray-700 hover:bg-gray-100 transition-all duration-300 shadow-lg"
                    >
                      <Edit3 className="w-5 h-5" />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleApplyTemplate(template);
                      }}
                      className="p-3 gradient-primary text-white rounded-xl hover:opacity-90 transition-all duration-300 shadow-lg"
                    >
                      <Play className="w-5 h-5" />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteTemplate(template.id);
                      }}
                      className="p-3 bg-red-500 text-white rounded-xl hover:bg-red-600 transition-all duration-300 shadow-lg"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                  <div className="absolute top-4 left-4 bg-black/60 text-white text-xs px-3 py-1.5 rounded-full backdrop-blur-sm flex items-center gap-1">
                    <BarChart2 className="w-3 h-3" />
                    {template.usageCount} 次
                  </div>
                </div>
                <div className="p-5">
                  <h3 className="font-semibold text-gray-900 text-lg mb-3">{template.name}</h3>
                  <div className="flex items-center gap-2 mb-4 flex-wrap">
                    {template.tags.map((tag) => (
                      <span
                        key={tag}
                        className="px-3 py-1 bg-primary/10 text-primary text-xs font-medium rounded-lg"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                  <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                    <div className="flex items-center gap-2 text-sm text-gray-500">
                      <Clock className="w-4 h-4" />
                      {new Date(template.createdAt).toLocaleDateString('zh-CN')}
                    </div>
                    <div className="flex items-center gap-1 text-sm text-gray-500">
                      <Star className="w-4 h-4 text-yellow-400" />
                      推荐
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-soft overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">模板</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">标签</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">使用次数</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">创建时间</th>
                    <th className="px-6 py-4 text-right text-sm font-semibold text-gray-700">操作</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filteredTemplates.map((template, index) => (
                    <tr 
                      key={template.id} 
                      className="hover:bg-gray-50 transition-colors duration-300"
                      style={{ animationDelay: `${index * 0.1}s` }}
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-4">
                          <img
                            src={template.previewImage}
                            alt=""
                            className="w-16 h-20 object-cover rounded-lg shadow-soft transition-transform duration-300 hover:scale-105"
                          />
                          <div>
                            <div className="font-semibold text-gray-900">{template.name}</div>
                            <div className="text-sm text-gray-500 mt-1">
                              {template.titlePattern}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2 flex-wrap">
                          {template.tags.map((tag) => (
                            <span
                              key={tag}
                              className="px-3 py-1 bg-primary/10 text-primary text-xs font-medium rounded-lg"
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <BarChart2 className="w-4 h-4 text-primary" />
                          <span className="font-medium text-gray-900">{template.usageCount}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">
                        {new Date(template.createdAt).toLocaleDateString('zh-CN')}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-end gap-3">
                          <button
                            onClick={() => setPreviewTemplate(template)}
                            className="p-2 text-gray-500 hover:text-primary hover:bg-primary/10 rounded-lg transition-all duration-300"
                            title="预览"
                          >
                            <Eye className="w-5 h-5" />
                          </button>
                          <button
                            onClick={() => openEditModal(template)}
                            className="p-2 text-gray-500 hover:text-primary hover:bg-primary/10 rounded-lg transition-all duration-300"
                            title="编辑"
                          >
                            <Edit3 className="w-5 h-5" />
                          </button>
                          <button
                            onClick={() => handleApplyTemplate(template)}
                            className="p-2 text-gray-500 hover:text-green-600 hover:bg-green-50 rounded-lg transition-all duration-300"
                            title="应用"
                          >
                            <Play className="w-5 h-5" />
                          </button>
                          <button
                            onClick={() => deleteTemplate(template.id)}
                            className="p-2 text-gray-500 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all duration-300"
                            title="删除"
                          >
                            <Trash2 className="w-5 h-5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )
      ) : (
        <div className="bg-white rounded-xl shadow-soft p-16 text-center animate-fade-in">
          <div className="w-24 h-24 gradient-primary rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
            <FolderOpen className="w-12 h-12 text-white" />
          </div>
          <h3 className="text-xl font-semibold text-gray-900 mb-3">暂无模板</h3>
          <p className="text-gray-500 mb-8 max-w-md mx-auto">
            {searchQuery || selectedTag
              ? '未找到匹配的模板，请尝试其他搜索条件'
              : '创建你的第一个素材模板吧！模板可以帮助你快速生成高质量的商品图文。'}
          </p>
          <button
            onClick={() => setShowCreateModal(true)}
            className="inline-flex items-center gap-2 gradient-primary text-white px-6 py-3 rounded-xl font-medium btn-primary shadow-lg transition-all duration-300"
          >
            <Plus className="w-5 h-5" />
            新建模板
          </button>
        </div>
      )}

      {(showCreateModal || editingTemplate) && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 animate-fade-in">
          <div className="bg-white rounded-2xl p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto animate-scale-in">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
                {editingTemplate ? (
                  <>
                    <Edit3 className="w-5 h-5 text-primary" />
                    编辑模板
                  </>
                ) : (
                  <>
                    <Plus className="w-5 h-5 text-primary" />
                    新建模板
                  </>
                )}
              </h3>
              <button
                onClick={resetForm}
                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">模板名称</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="请输入模板名称"
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all duration-300 shadow-sm"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">标签</label>
                <input
                  type="text"
                  value={formData.tags}
                  onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                  placeholder="多个标签用逗号分隔，如：男包,奢品,高级"
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all duration-300 shadow-sm"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">标题模板</label>
                <input
                  type="text"
                  value={formData.titlePattern}
                  onChange={(e) => setFormData({ ...formData, titlePattern: e.target.value })}
                  placeholder='如：{brand}{name} - 优质之选'
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all duration-300 shadow-sm"
                />
                <p className="text-xs text-gray-400 mt-2">可用变量：{'{brand}'} 品牌名，{'{name}'} 商品名</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">卖点文案模板</label>
                <div className="space-y-3">
                  <input
                    type="text"
                    value={formData.sellingPoint1}
                    onChange={(e) => setFormData({ ...formData, sellingPoint1: e.target.value })}
                    placeholder="卖点1"
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all duration-300 shadow-sm"
                  />
                  <input
                    type="text"
                    value={formData.sellingPoint2}
                    onChange={(e) => setFormData({ ...formData, sellingPoint2: e.target.value })}
                    placeholder="卖点2"
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all duration-300 shadow-sm"
                  />
                  <input
                    type="text"
                    value={formData.sellingPoint3}
                    onChange={(e) => setFormData({ ...formData, sellingPoint3: e.target.value })}
                    placeholder="卖点3"
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all duration-300 shadow-sm"
                  />
                </div>
              </div>

              <div className="flex gap-4 pt-6">
                <button
                  onClick={resetForm}
                  className="flex-1 py-3 border border-gray-200 text-gray-700 rounded-xl font-medium hover:bg-gray-50 transition-all duration-300 shadow-sm"
                >
                  取消
                </button>
                <button
                  onClick={editingTemplate ? handleEditTemplate : handleCreateTemplate}
                  disabled={!formData.name.trim()}
                  className={cn(
                    'flex-1 py-3 rounded-xl font-medium transition-all duration-300',
                    formData.name.trim()
                      ? 'gradient-primary text-white btn-primary shadow-lg'
                      : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  )}
                >
                  {editingTemplate ? '保存修改' : '创建模板'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {previewTemplate && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-8 animate-fade-in">
          <div className="bg-white rounded-2xl max-w-2xl w-full overflow-hidden animate-scale-in">
            <div className="relative">
              <img
                src={previewTemplate.previewImage}
                alt=""
                className="w-full aspect-[4/5] object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/60 to-transparent p-6">
                <h2 className="text-white text-2xl font-bold">{previewTemplate.name}</h2>
                <div className="flex items-center gap-2 mt-3 flex-wrap">
                  {previewTemplate.tags.map((tag) => (
                    <span
                      key={tag}
                      className="px-3 py-1 bg-white/20 text-white text-sm font-medium rounded-lg backdrop-blur-sm"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
                <div className="flex items-center gap-3 mt-4">
                  <div className="flex items-center gap-1 text-white/80 text-sm">
                    <BarChart2 className="w-4 h-4" />
                    使用 {previewTemplate.usageCount} 次
                  </div>
                  <div className="flex items-center gap-1 text-white/80 text-sm">
                    <Clock className="w-4 h-4" />
                    {new Date(previewTemplate.createdAt).toLocaleDateString('zh-CN')}
                  </div>
                </div>
              </div>
              <button
                onClick={() => {
                  setPreviewTemplate(null);
                  setPreviewForm({ brand: '示例品牌', name: '示例商品' });
                }}
                className="absolute top-4 right-4 w-10 h-10 bg-black/50 text-white rounded-full flex items-center justify-center hover:bg-black/70 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 bg-gray-50">
              <div className="mb-6">
                <p className="text-sm font-medium text-gray-700 mb-2">实时预览</p>
                <div className="space-y-3">
                  <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1">品牌名称</label>
                    <input
                      type="text"
                      value={previewForm.brand}
                      onChange={(e) => setPreviewForm({ ...previewForm, brand: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all duration-300"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1">商品名称</label>
                    <input
                      type="text"
                      value={previewForm.name}
                      onChange={(e) => setPreviewForm({ ...previewForm, name: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all duration-300"
                    />
                  </div>
                </div>
              </div>
              
              <div className="mb-6">
                <p className="text-sm font-medium text-gray-700 mb-2">预览效果</p>
                <div className="bg-white p-4 rounded-lg shadow-sm">
                  <p className="font-medium text-gray-900 mb-3">
                    {previewTemplate.titlePattern
                      .replace('{brand}', previewForm.brand)
                      .replace('{name}', previewForm.name)}
                  </p>
                  <div className="space-y-2">
                    {previewTemplate.sellingPointPatterns.map((point, idx) => (
                      <p key={idx} className="text-gray-600 flex items-start gap-2">
                        <div className="w-1.5 h-1.5 bg-primary rounded-full mt-1.5 flex-shrink-0" />
                        {point
                          .replace('{brand}', previewForm.brand)
                          .replace('{name}', previewForm.name)}
                      </p>
                    ))}
                  </div>
                </div>
              </div>
              
              <div className="mb-6">
                <p className="text-sm font-medium text-gray-700 mb-2">标题模板</p>
                <p className="text-gray-600 bg-white p-3 rounded-lg shadow-sm">{previewTemplate.titlePattern}</p>
              </div>
              <div className="mb-6">
                <p className="text-sm font-medium text-gray-700 mb-3">卖点模板</p>
                <div className="space-y-2">
                  {previewTemplate.sellingPointPatterns.map((point, idx) => (
                    <p key={idx} className="text-gray-600 bg-white p-3 rounded-lg shadow-sm flex items-start gap-2">
                      <div className="w-1.5 h-1.5 bg-primary rounded-full mt-1.5 flex-shrink-0" />
                      {point}
                    </p>
                  ))}
                </div>
              </div>
              <div className="flex gap-4">
                <button
                  onClick={() => {
                    setPreviewTemplate(null);
                    openEditModal(previewTemplate);
                  }}
                  className="flex-1 py-3 border border-gray-200 text-gray-700 rounded-xl font-medium hover:bg-gray-50 transition-all duration-300 shadow-sm flex items-center justify-center gap-2"
                >
                  <Edit3 className="w-5 h-5" />
                  编辑模板
                </button>
                <button
                  onClick={() => handleApplyTemplate(previewTemplate)}
                  className="flex-1 py-3 gradient-primary text-white rounded-xl font-medium btn-primary shadow-lg flex items-center justify-center gap-2"
                >
                  <Play className="w-5 h-5" />
                  应用模板
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 删除确认对话框 */}
      {deletingTemplateId && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 animate-fade-in">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md mx-4 shadow-elevated animate-scale-in">
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Trash2 className="w-8 h-8 text-red-500" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">确认删除</h3>
              <p className="text-gray-500">确定要删除这个模板吗？此操作不可撤销。</p>
            </div>

            <div className="flex gap-4">
              <button
                onClick={cancelDeleteTemplate}
                className="flex-1 py-3 border border-gray-200 text-gray-700 rounded-xl font-medium hover:bg-gray-50 transition-all duration-300 shadow-sm"
              >
                取消
              </button>
              <button
                onClick={() => confirmDeleteTemplate(deletingTemplateId)}
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