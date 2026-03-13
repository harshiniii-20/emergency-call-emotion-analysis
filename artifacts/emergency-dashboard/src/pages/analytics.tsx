import { Layout } from "@/components/layout";
import { Card } from "@/components/ui-elements";
import { useAnalyticsSummaryData, useEmotionTrendsData, useCallVolumeData } from "@/hooks/use-analytics";
import { BarChart3, Loader2 } from "lucide-react";
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Legend, ResponsiveContainer,
  LineChart, Line, PieChart, Pie, Cell
} from "recharts";

const COLORS = {
  primary: 'hsl(180, 100%, 45%)',
  destructive: 'hsl(0, 84%, 60%)',
  warning: 'hsl(35, 100%, 55%)',
  success: 'hsl(142, 71%, 45%)',
  muted: 'hsl(215, 20%, 65%)',
  card: 'hsl(220, 40%, 7%)',
  border: 'hsl(220, 40%, 14%)'
};

const EMOTION_COLORS: Record<string, string> = {
  stressed: COLORS.warning,
  drunk: '#8b5cf6', // Indigo
  abusive: COLORS.destructive,
  pain: '#ef4444', // Red
  calm: COLORS.success,
  unknown: COLORS.muted
};

export function Analytics() {
  const { data: summary, isLoading: load1 } = useAnalyticsSummaryData();
  const { data: trends, isLoading: load2 } = useEmotionTrendsData();
  const { data: volume, isLoading: load3 } = useCallVolumeData();

  if (load1 || load2 || load3) {
    return (
      <Layout>
        <div className="h-[80vh] flex items-center justify-center">
          <Loader2 className="h-12 w-12 text-primary animate-spin" />
        </div>
      </Layout>
    );
  }

  // Format data for PieChart
  const pieData = summary?.emotionDistribution.map(d => ({
    name: d.emotion,
    value: d.count
  })) || [];

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-card border border-border p-3 rounded-lg shadow-xl">
          <p className="text-white font-bold mb-2">{label}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} style={{ color: entry.color }} className="text-sm flex justify-between gap-4">
              <span className="capitalize">{entry.name}:</span>
              <span className="font-mono font-bold">{entry.value}</span>
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <Layout>
      <header className="mb-8">
        <h1 className="text-3xl font-display font-bold text-white tracking-wider flex items-center gap-3">
          <BarChart3 className="text-primary" />
          Intelligence Analytics
        </h1>
        <p className="text-muted-foreground mt-2">Historical trends and aggregate emotion data analysis.</p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Emotion Trend Line Chart */}
        <Card className="p-6 lg:col-span-2">
          <div className="mb-6">
            <h2 className="text-lg font-display text-white uppercase tracking-wider">24h Emotion Frequency Trend</h2>
            <p className="text-sm text-muted-foreground">Volume of specific emotions detected over time</p>
          </div>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={trends} margin={{ top: 5, right: 30, left: 0, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke={COLORS.border} vertical={false} />
                <XAxis dataKey="hour" stroke={COLORS.muted} fontSize={12} tickMargin={10} />
                <YAxis stroke={COLORS.muted} fontSize={12} />
                <RechartsTooltip content={<CustomTooltip />} />
                <Legend iconType="circle" wrapperStyle={{ fontSize: '12px', paddingTop: '20px' }} />
                
                <Line type="monotone" dataKey="stressed" stroke={EMOTION_COLORS.stressed} strokeWidth={3} dot={{r:4}} activeDot={{r:6}} />
                <Line type="monotone" dataKey="pain" stroke={EMOTION_COLORS.pain} strokeWidth={3} dot={{r:4}} activeDot={{r:6}} />
                <Line type="monotone" dataKey="abusive" stroke={EMOTION_COLORS.abusive} strokeWidth={2} dot={false} />
                <Line type="monotone" dataKey="calm" stroke={EMOTION_COLORS.calm} strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Call Volume Bar Chart */}
        <Card className="p-6">
          <div className="mb-6">
            <h2 className="text-lg font-display text-white uppercase tracking-wider">Call Volume vs Risk</h2>
            <p className="text-sm text-muted-foreground">Total calls compared to high-risk escalations</p>
          </div>
          <div className="h-[250px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={volume} margin={{ top: 5, right: 0, left: -20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke={COLORS.border} vertical={false} />
                <XAxis dataKey="hour" stroke={COLORS.muted} fontSize={12} />
                <YAxis stroke={COLORS.muted} fontSize={12} />
                <RechartsTooltip content={<CustomTooltip />} cursor={{fill: 'rgba(255,255,255,0.05)'}} />
                <Legend iconType="circle" wrapperStyle={{ fontSize: '12px' }} />
                <Bar dataKey="count" name="Total Calls" fill={COLORS.primary} radius={[4, 4, 0, 0]} />
                <Bar dataKey="highRisk" name="High Risk" fill={COLORS.destructive} radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Emotion Distribution Pie Chart */}
        <Card className="p-6">
          <div className="mb-6">
            <h2 className="text-lg font-display text-white uppercase tracking-wider">Overall Emotion Share</h2>
            <p className="text-sm text-muted-foreground">Distribution across all recorded calls today</p>
          </div>
          <div className="h-[250px] relative">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={90}
                  paddingAngle={5}
                  dataKey="value"
                  stroke="none"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={EMOTION_COLORS[entry.name] || COLORS.primary} />
                  ))}
                </Pie>
                <RechartsTooltip content={<CustomTooltip />} />
              </PieChart>
            </ResponsiveContainer>
            {/* Center text */}
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <span className="text-2xl font-bold font-mono text-white">{summary?.totalCallsToday}</span>
              <span className="text-xs text-muted-foreground uppercase">Calls</span>
            </div>
          </div>
        </Card>

      </div>
    </Layout>
  );
}
