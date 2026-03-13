import { ReactNode } from "react";
import { cn } from "@/lib/utils";

export function Card({ children, className, glowColor }: { children: ReactNode, className?: string, glowColor?: 'primary' | 'destructive' | 'warning' }) {
  return (
    <div className={cn(
      "bg-card/60 backdrop-blur-md rounded-2xl border border-border/50 shadow-xl overflow-hidden relative group transition-all duration-300 hover:border-border",
      glowColor === 'primary' && "hover:shadow-[0_0_30px_-5px_rgba(0,255,255,0.15)] hover:border-primary/30",
      glowColor === 'destructive' && "shadow-[0_0_20px_-5px_rgba(255,0,0,0.15)] border-destructive/30",
      glowColor === 'warning' && "hover:shadow-[0_0_30px_-5px_rgba(255,165,0,0.15)] hover:border-warning/30",
      className
    )}>
      {children}
    </div>
  );
}

export function StatCard({ title, value, icon: Icon, trend, colorClass = "text-primary" }: any) {
  return (
    <Card glowColor="primary" className="p-6 flex items-start justify-between">
      <div>
        <p className="text-sm font-medium text-muted-foreground uppercase tracking-wider mb-1">{title}</p>
        <h3 className="text-3xl font-display font-bold text-white">{value}</h3>
        {trend && (
          <p className="text-xs text-muted-foreground mt-2">
            <span className={trend > 0 ? "text-destructive" : "text-success"}>
              {trend > 0 ? "↑" : "↓"} {Math.abs(trend)}%
            </span> vs last hour
          </p>
        )}
      </div>
      <div className={cn("p-3 rounded-xl bg-secondary/50 border border-border/50", colorClass)}>
        <Icon className="h-6 w-6" />
      </div>
    </Card>
  );
}

export function Badge({ children, variant = 'default', className }: any) {
  const variants: any = {
    default: "bg-secondary text-secondary-foreground border-border",
    primary: "bg-primary/20 text-primary border-primary/30",
    destructive: "bg-destructive/20 text-destructive border-destructive/30",
    warning: "bg-warning/20 text-warning border-warning/30",
    success: "bg-success/20 text-success border-success/30",
  };
  
  return (
    <span className={cn("px-2.5 py-1 rounded-md text-xs font-semibold border uppercase tracking-wider", variants[variant], className)}>
      {children}
    </span>
  );
}

export function RiskBadge({ level }: { level: string }) {
  const map: Record<string, string> = {
    low: 'success',
    medium: 'warning',
    high: 'destructive',
    critical: 'destructive'
  };
  return <Badge variant={map[level] || 'default'} className={level === 'critical' ? 'animate-pulse shadow-[0_0_10px_rgba(255,0,0,0.5)]' : ''}>{level}</Badge>;
}

export function EmotionBadge({ emotion }: { emotion: string }) {
  const map: Record<string, string> = {
    calm: 'success',
    stressed: 'warning',
    drunk: 'warning',
    pain: 'destructive',
    abusive: 'destructive',
    unknown: 'default'
  };
  return <Badge variant={map[emotion] || 'default'}>{emotion}</Badge>;
}

export function Button({ children, onClick, variant = 'primary', className, disabled }: any) {
  const variants: any = {
    primary: "bg-primary text-primary-foreground shadow-[0_0_15px_rgba(0,255,255,0.3)] hover:shadow-[0_0_25px_rgba(0,255,255,0.5)] hover:brightness-110",
    destructive: "bg-destructive text-destructive-foreground shadow-[0_0_15px_rgba(255,0,0,0.3)] hover:shadow-[0_0_25px_rgba(255,0,0,0.5)] hover:brightness-110",
    outline: "bg-transparent border border-border text-foreground hover:bg-secondary hover:border-muted-foreground",
    ghost: "bg-transparent text-muted-foreground hover:text-foreground hover:bg-secondary",
  };
  
  return (
    <button 
      onClick={onClick} 
      disabled={disabled}
      className={cn(
        "px-5 py-2.5 rounded-xl font-bold uppercase tracking-wider text-sm transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed active:scale-95",
        variants[variant],
        className
      )}
    >
      {children}
    </button>
  );
}
