import { ReactNode, useState, useEffect } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Sparkles,
  FolderOpen,
  Settings,
  Scissors,
  Wand2
} from 'lucide-react';
import { cn } from '../lib/utils';

interface LayoutProps {
  children: ReactNode;
}

const navItems = [
  { path: '/', icon: LayoutDashboard, label: '工作台' },
  { path: '/generate', icon: Sparkles, label: '素材生成' },
  { path: '/templates', icon: FolderOpen, label: '模板库' },
  { path: '/ai-image', icon: Wand2, label: 'AI图像' },
  { path: '/settings', icon: Settings, label: '设置' },
];

export default function Layout({ children }: LayoutProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ctrl+N: 新建任务（跳转到生成页面）
      if (e.ctrlKey && e.key === 'n') {
        e.preventDefault();
        navigate('/generate');
      }
      
      // Ctrl+D: 回到工作台
      if (e.ctrlKey && e.key === 'd') {
        e.preventDefault();
        navigate('/');
      }
      
      // Ctrl+T: 模板库
      if (e.ctrlKey && e.key === 't') {
        e.preventDefault();
        navigate('/templates');
      }
      
      // Ctrl+G: AI图像生成
      if (e.ctrlKey && e.key === 'g') {
        e.preventDefault();
        navigate('/ai-image');
      }
      
      // Ctrl+S: 设置页面
      if (e.ctrlKey && e.key === 's') {
        e.preventDefault();
        navigate('/settings');
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [navigate]);

  return (
    <div className="flex min-h-screen">
      <aside 
        className={cn(
          'bg-[#1A1A2E] transition-all duration-300 ease-in-out flex flex-col overflow-hidden',
          isExpanded ? 'w-64' : 'w-16'
        )}
        onMouseEnter={() => setIsExpanded(true)}
        onMouseLeave={() => setIsExpanded(false)}
      >
        <div className="h-16 flex items-center px-4 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 gradient-primary rounded-lg flex items-center justify-center flex-shrink-0 shadow-lg">
              <Scissors className="w-4 h-4 text-white" />
            </div>
            <span className={cn(
              'text-white font-bold text-lg whitespace-nowrap transition-all duration-300 ease-in-out',
              isExpanded ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-4'
            )}>
              素材工坊
            </span>
          </div>
        </div>

        <nav className="flex-1 py-4 px-2">
          {navItems.map((item, index) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                cn(
                  'flex items-center gap-3 py-3 rounded-xl transition-all duration-300 ease-in-out relative overflow-hidden',
                  'hover:bg-white/10 hover:translate-x-1',
                  isActive && 'bg-white/15 border-l-2 border-[#FF0050] shadow-inner shadow-primary/20'
                )
              }
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              {({ isActive }) => (
                <>
                  <div className={cn(
                    'w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 transition-all duration-300',
                    isActive ? 'bg-white/20 text-[#FF0050]' : 'text-white/70 hover:text-white'
                  )}>
                    <item.icon className="w-5 h-5" />
                  </div>
                  <span className={cn(
                    'text-sm whitespace-nowrap transition-all duration-300 ease-in-out',
                    isActive ? 'text-white font-medium' : 'text-white/70',
                    isExpanded ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-4'
                  )}>
                    {item.label}
                  </span>
                  {isActive && (
                    <div className="absolute -right-4 top-1/2 transform -translate-y-1/2 w-8 h-8 gradient-primary rounded-full opacity-20" />
                  )}
                </>
              )}
            </NavLink>
          ))}
        </nav>

        <div className={cn(
          'p-4 border-t border-white/10 transition-all duration-300 ease-in-out',
          isExpanded ? 'opacity-100' : 'opacity-0'
        )}>
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
              <span className="text-white text-sm font-medium">运营</span>
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-white text-sm font-medium truncate">运营专员</div>
              <div className="text-white/50 text-xs">企业版</div>
            </div>
          </div>
        </div>
      </aside>

      <main className="flex-1 overflow-auto">
        <div className="page-transition animate-fade-in">
          {children}
        </div>
      </main>
    </div>
  );
}