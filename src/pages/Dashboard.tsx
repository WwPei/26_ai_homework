import { Link } from 'react-router-dom';
import {
  FileText,
  Heart,
  TrendingUp,
  Package,
  Plus,
  FolderOpen,
  ChevronRight,
  Sparkles,
  Clock,
  Calendar,
  BarChart3,
  Zap
} from 'lucide-react';
import { useAppStore } from '../store/useAppStore';
import { cn } from '../lib/utils';
import { GeneratedDraft } from '../types';

export default function Dashboard() {
  const { drafts, templates, getTodayDraftsCount } = useAppStore();
  const todayCount = getTodayDraftsCount();
  const recentDrafts = drafts.slice(0, 5);
  const today = new Date().toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    weekday: 'long'
  });

  const stats = [
    {
      label: '今日生成草稿',
      value: todayCount,
      icon: FileText,
      trend: '+12%',
      gradient: 'gradient-primary',
      description: '较昨日',
      color: 'text-primary'
    },
    {
      label: '收藏模板数',
      value: templates.length,
      icon: Heart,
      trend: '+3',
      gradient: 'gradient-secondary',
      description: '本月新增',
      color: 'text-secondary'
    },
    {
      label: '本周效率提升',
      value: '23%',
      icon: TrendingUp,
      trend: '+5%',
      gradient: 'gradient-success',
      description: '较上周',
      color: 'text-green-500'
    },
    {
      label: '待处理商品',
      value: drafts.filter(d => d.status === 'draft').length,
      icon: Package,
      trend: '',
      gradient: 'gradient-warning',
      description: '需要处理',
      color: 'text-orange-500'
    },
  ];

  const getStatusLabel = (status: GeneratedDraft['status']) => {
    switch (status) {
      case 'draft':
        return '草稿';
      case 'saved':
        return '已保存';
      case 'applied':
        return '已应用';
    }
  };

  const getStatusColor = (status: GeneratedDraft['status']) => {
    switch (status) {
      case 'draft':
        return 'bg-orange-100 text-orange-700';
      case 'saved':
        return 'bg-blue-100 text-blue-700';
      case 'applied':
        return 'bg-green-100 text-green-700';
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto animate-fade-in">
      {/* 顶部欢迎区 */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-[clamp(1.5rem,3vw,2.5rem)] font-bold text-gray-900">
              欢迎回来，运营专员
            </h1>
            <p className="text-gray-500 mt-2 flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              {today}
            </p>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 px-4 py-2 bg-white rounded-xl shadow-soft">
              <Clock className="w-4 h-4 text-gray-500" />
              <span className="text-sm text-gray-700">
                {new Date().toLocaleTimeString('zh-CN')}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* 数据概览卡片 */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {stats.map((stat, index) => (
          <div
            key={stat.label}
            className="bg-white rounded-xl p-6 shadow-soft card-hover"
            style={{ animationDelay: `${index * 0.1}s` }}
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs font-medium text-gray-500">
                    {stat.description}
                  </span>
                  {stat.trend && (
                    <span className="text-xs font-medium text-green-600 bg-green-50 px-2 py-0.5 rounded-full flex items-center gap-1">
                      <TrendingUp className="w-3 h-3" />
                      {stat.trend}
                    </span>
                  )}
                </div>
                <div className="text-[clamp(1.5rem,3vw,2.5rem)] font-bold text-gray-900">
                  {stat.value}
                </div>
                <div className="text-sm text-gray-500 mt-1">
                  {stat.label}
                </div>
              </div>
              <div className={`w-12 h-12 rounded-xl ${stat.gradient} flex items-center justify-center shadow-lg`}>
                <stat.icon className="w-6 h-6 text-white" />
              </div>
            </div>
            <div className="w-full bg-gray-100 rounded-full h-1.5 mt-2">
              <div 
                className={`h-1.5 rounded-full ${stat.gradient}`} 
                style={{ width: `${Math.min(100, (parseInt(stat.value.toString()) || 23) * 2)}%` }}
              />
            </div>
          </div>
        ))}
      </div>

      {/* 快捷操作区 */}
      <div className="flex flex-wrap gap-4 mb-8">
        <Link
          to="/generate"
          className="inline-flex items-center gap-2 gradient-primary text-white px-6 py-3 rounded-xl font-medium btn-primary shadow-lg"
        >
          <Plus className="w-5 h-5" />
          新建生成任务
        </Link>
        <Link
          to="/templates"
          className="inline-flex items-center gap-2 bg-white text-gray-700 px-6 py-3 rounded-xl font-medium border border-gray-200 hover:border-primary hover:text-primary transition-all duration-300 shadow-soft"
        >
          <FolderOpen className="w-5 h-5" />
          管理模板
        </Link>
        <div className="inline-flex items-center gap-2 bg-white text-gray-700 px-6 py-3 rounded-xl font-medium border border-gray-200 hover:border-primary hover:text-primary transition-all duration-300 shadow-soft">
          <BarChart3 className="w-5 h-5" />
          数据分析
        </div>
      </div>

      {/* 最近草稿 */}
      <div className="bg-white rounded-xl shadow-soft overflow-hidden">
        <div className="p-6 border-b border-gray-100 flex items-center justify-between">
          <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
            <Zap className="w-5 h-5 text-primary" />
            最近草稿
          </h2>
          <Link to="/generate" className="text-sm font-medium text-primary hover:underline flex items-center gap-1">
            查看全部
            <ChevronRight className="w-4 h-4" />
          </Link>
        </div>

        {recentDrafts.length > 0 ? (
          <div className="divide-y divide-gray-100">
            {recentDrafts.map((draft, index) => (
              <div
                key={draft.id}
                className="p-6 hover:bg-gray-50 transition-all duration-300 cursor-pointer flex items-start gap-4"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className="w-20 h-24 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0 shadow-sm">
                  <img
                    src={draft.mainImage}
                    alt=""
                    className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-semibold text-gray-900 truncate text-lg">
                    {draft.title}
                  </div>
                  <div className="text-sm text-gray-500 mt-2 space-y-1">
                    {draft.sellingPoints.slice(0, 2).map((point, idx) => (
                      <div key={idx} className="flex items-start gap-2">
                        <div className="w-1.5 h-1.5 bg-primary rounded-full mt-1.5 flex-shrink-0" />
                        <span>{point}</span>
                      </div>
                    ))}
                  </div>
                  <div className="flex items-center gap-3 mt-3">
                    <span
                      className={cn(
                        'text-xs px-2.5 py-1 rounded-full font-medium',
                        getStatusColor(draft.status)
                      )}
                    >
                      {getStatusLabel(draft.status)}
                    </span>
                    <span className="text-xs text-gray-400 flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {new Date(draft.createdAt).toLocaleString('zh-CN', {
                        month: '2-digit',
                        day: '2-digit',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </span>
                  </div>
                </div>
                <ChevronRight className="w-5 h-5 text-gray-400 flex-shrink-0 mt-1" />
              </div>
            ))}
          </div>
        ) : (
          <div className="p-16 text-center animate-fade-in">
            <div className="w-24 h-24 gradient-primary rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
              <Sparkles className="w-12 h-12 text-white" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-3">暂无草稿</h3>
            <p className="text-gray-500 mb-6 max-w-md mx-auto">
              开始创建你的第一个素材吧！使用我们的智能生成工具，快速制作高质量的商品图文。
            </p>
            <Link
              to="/generate"
              className="inline-flex items-center gap-2 gradient-primary text-white px-5 py-3 rounded-xl font-medium btn-primary shadow-lg"
            >
              <Plus className="w-5 h-5" />
              新建任务
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}