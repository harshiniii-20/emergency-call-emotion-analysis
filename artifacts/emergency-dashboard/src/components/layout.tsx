import { ReactNode } from "react";
import { Link, useLocation } from "wouter";
import { 
  Activity, 
  LayoutDashboard, 
  Radio, 
  FileAudio, 
  BarChart3,
  BellRing
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useCallsData } from "@/hooks/use-calls";

interface LayoutProps {
  children: ReactNode;
}

export function Layout({ children }: LayoutProps) {
  const [location] = useLocation();
  const { data: calls } = useCallsData();
  
  const activeCriticalCalls = calls?.filter(c => c.status === 'active' && c.riskLevel === 'critical').length || 0;

  const navItems = [
    { path: "/", icon: LayoutDashboard, label: "Dashboard" },
    { path: "/live-call", icon: Radio, label: "Live Call Monitor" },
    { path: "/audio-upload", icon: FileAudio, label: "Audio Analysis" },
    { path: "/analytics", icon: BarChart3, label: "Analytics" },
  ];

  return (
    <div className="flex h-screen bg-background text-foreground overflow-hidden relative">
      {/* Background Effect */}
      <div 
        className="absolute inset-0 z-0 opacity-10 pointer-events-none mix-blend-screen bg-cover bg-center"
        style={{ backgroundImage: `url(${import.meta.env.BASE_URL}images/bg-grid.png)` }}
      />
      <div className="absolute inset-0 z-0 bg-gradient-to-br from-primary/5 via-transparent to-destructive/5 pointer-events-none" />

      {/* Sidebar */}
      <aside className="w-64 border-r border-border/50 bg-card/50 backdrop-blur-xl flex flex-col z-10 shadow-2xl shadow-black/50">
        <div className="p-6 flex items-center gap-3 border-b border-border/50">
          <div className="relative flex h-10 w-10 items-center justify-center rounded-xl bg-primary/20 text-primary border border-primary/30">
            <Activity className="h-6 w-6" />
            <div className="absolute inset-0 rounded-xl bg-primary/20 animate-ping" />
          </div>
          <div>
            <h1 className="font-display text-lg font-bold leading-tight text-white tracking-widest">E.C.E.A.S</h1>
            <p className="text-[10px] text-primary uppercase tracking-widest font-semibold">Sys Control</p>
          </div>
        </div>

        <nav className="flex-1 py-6 px-4 space-y-2">
          {navItems.map((item) => {
            const isActive = location === item.path;
            const Icon = item.icon;
            return (
              <Link key={item.path} href={item.path} className={cn(
                "flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 font-medium",
                isActive 
                  ? "bg-primary/10 text-primary border border-primary/20 shadow-[inset_0_0_20px_rgba(0,255,255,0.05)]" 
                  : "text-muted-foreground hover:bg-secondary hover:text-foreground border border-transparent"
              )}>
                <Icon className={cn("h-5 w-5", isActive ? "text-primary drop-shadow-[0_0_8px_rgba(0,255,255,0.5)]" : "")} />
                {item.label}
                
                {item.path === "/live-call" && activeCriticalCalls > 0 && (
                  <span className="ml-auto flex h-5 w-5 items-center justify-center rounded-full bg-destructive text-[10px] font-bold text-white animate-pulse-fast">
                    {activeCriticalCalls}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        <div className="p-4 mt-auto">
          <div className="rounded-xl border border-destructive/30 bg-destructive/10 p-4 relative overflow-hidden group">
            <div className="absolute inset-0 bg-destructive/20 opacity-0 group-hover:opacity-100 transition-opacity" />
            <div className="flex items-center gap-2 text-destructive mb-2">
              <BellRing className="h-4 w-4 animate-bounce" />
              <h3 className="font-display font-bold text-sm">SYSTEM STATUS</h3>
            </div>
            <p className="text-xs text-muted-foreground">Monitoring active connections. AI models online.</p>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 relative z-10 overflow-y-auto overflow-x-hidden">
        <div className="max-w-7xl mx-auto p-6 md:p-8 space-y-8 animate-fade-in">
          {children}
        </div>
      </main>
    </div>
  );
}
