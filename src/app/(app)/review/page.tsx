"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/lib/auth-context";
import { getDaySummariesForRange } from "@/lib/firestore";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { motion } from "framer-motion";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { ChevronLeft, ChevronRight, TrendingUp, Target, Clock, CheckCircle2 } from "lucide-react";
import { format, startOfWeek, endOfWeek, addWeeks, subWeeks, eachDayOfInterval, isSameWeek } from "date-fns";
import { CATEGORY_COLORS, CATEGORY_LABELS, type DaySummary, type Category } from "@/lib/types";
import { formatDuration } from "@/lib/utils";

export default function WeeklyReviewPage() {
  const { user } = useAuth();
  const [currentWeek, setCurrentWeek] = useState(new Date());
  const [summaries, setSummaries] = useState<DaySummary[]>([]);
  const [loading, setLoading] = useState(true);

  const weekStart = startOfWeek(currentWeek, { weekStartsOn: 1 });
  const weekEnd = endOfWeek(currentWeek, { weekStartsOn: 1 });

  useEffect(() => {
    if (!user) return;
    setLoading(true);
    const start = format(weekStart, "yyyy-MM-dd");
    const end = format(weekEnd, "yyyy-MM-dd");
    getDaySummariesForRange(user.uid, start, end).then((s) => {
      setSummaries(s);
      setLoading(false);
    });
  }, [user, currentWeek]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    );
  }

  const isCurrentWeek = isSameWeek(currentWeek, new Date(), { weekStartsOn: 1 });

  // Aggregated stats
  const avgScore = summaries.length > 0 ? Math.round(summaries.reduce((s, d) => s + d.dayScore, 0) / summaries.length) : 0;
  const totalLogged = summaries.reduce((s, d) => s + d.totalLoggedMinutes, 0);
  const totalUnaccounted = summaries.reduce((s, d) => s + (d.totalUnaccountedMinutes || 0), 0);
  const totalCheckIns = summaries.reduce((s, d) => s + d.checkInsAnswered, 0);
  const totalCheckInsSent = summaries.reduce((s, d) => s + d.checkInsSent, 0);

  // Daily score chart
  const weekDays = eachDayOfInterval({ start: weekStart, end: weekEnd });
  const dailyScoreData = weekDays.map((day) => {
    const dateStr = format(day, "yyyy-MM-dd");
    const summary = summaries.find((s) => s.date === dateStr);
    return {
      day: format(day, "EEE"),
      score: summary?.dayScore || 0,
    };
  });

  // Category totals
  const categoryTotals: Record<string, number> = {};
  summaries.forEach((s) => {
    if (s.categoryBreakdown) {
      Object.entries(s.categoryBreakdown).forEach(([cat, min]) => {
        categoryTotals[cat] = (categoryTotals[cat] || 0) + min;
      });
    }
  });
  const categoryPieData = Object.entries(categoryTotals)
    .filter(([, v]) => v > 0)
    .map(([key, value]) => ({
      name: CATEGORY_LABELS[key as Category] || key,
      value: Math.round(value),
      color: CATEGORY_COLORS[key as keyof typeof CATEGORY_COLORS] || "#6B7280",
    }));

  const tooltipStyle = {
    contentStyle: { background: "var(--card)", border: "1px solid var(--border)", borderRadius: "8px", fontSize: "12px" },
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold">Weekly Review</h1>
        <p className="text-muted-foreground">Reflect on your week and plan ahead.</p>
      </div>

      {/* Week navigation */}
      <div className="flex items-center justify-between">
        <Button variant="ghost" size="sm" onClick={() => setCurrentWeek(subWeeks(currentWeek, 1))}>
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <div className="text-center">
          <p className="font-medium">
            {format(weekStart, "MMM d")} – {format(weekEnd, "MMM d, yyyy")}
          </p>
          {isCurrentWeek && <Badge className="mt-1">This Week</Badge>}
        </div>
        <Button variant="ghost" size="sm" onClick={() => setCurrentWeek(addWeeks(currentWeek, 1))}>
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>

      {summaries.length === 0 ? (
        <Card>
          <CardContent className="p-8 text-center">
            <p className="text-muted-foreground">No data for this week yet.</p>
          </CardContent>
        </Card>
      ) : (
        <>
          {/* Summary stats */}
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            {[
              { icon: Target, label: "Avg Score", value: `${avgScore}`, color: "text-primary" },
              { icon: Clock, label: "Total Logged", value: formatDuration(totalLogged), color: "text-success" },
              { icon: TrendingUp, label: "Unaccounted", value: formatDuration(totalUnaccounted), color: "text-destructive" },
              { icon: CheckCircle2, label: "Check-Ins", value: `${totalCheckIns}/${totalCheckInsSent}`, color: "text-warning" },
            ].map((stat) => (
              <Card key={stat.label}>
                <CardContent className="p-4 text-center">
                  <stat.icon className={`h-5 w-5 mx-auto mb-1 ${stat.color}`} />
                  <p className="text-xl font-bold">{stat.value}</p>
                  <p className="text-xs text-muted-foreground">{stat.label}</p>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Daily Score Chart */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Daily Scores</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={dailyScoreData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                  <XAxis dataKey="day" tick={{ fontSize: 12 }} stroke="var(--muted-foreground)" />
                  <YAxis domain={[0, 100]} tick={{ fontSize: 11 }} stroke="var(--muted-foreground)" />
                  <Tooltip {...tooltipStyle} />
                  <Bar dataKey="score" fill="var(--primary)" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Category Breakdown */}
          {categoryPieData.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Category Breakdown</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={200}>
                  <PieChart>
                    <Pie data={categoryPieData} cx="50%" cy="50%" innerRadius={45} outerRadius={75} paddingAngle={2} dataKey="value">
                      {categoryPieData.map((entry, i) => (
                        <Cell key={i} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(v) => typeof v === "number" ? formatDuration(v) : String(v)} {...tooltipStyle} />
                  </PieChart>
                </ResponsiveContainer>
                <div className="flex flex-wrap gap-2 mt-2 justify-center">
                  {categoryPieData.map((e) => (
                    <div key={e.name} className="flex items-center gap-1.5 text-xs">
                      <div className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: e.color }} />
                      <span className="text-muted-foreground">{e.name}: {formatDuration(e.value)}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Days Overview */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Day by Day</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {weekDays.map((day) => {
                const dateStr = format(day, "yyyy-MM-dd");
                const summary = summaries.find((s) => s.date === dateStr);
                return (
                  <div
                    key={dateStr}
                    className={`flex items-center gap-3 rounded-lg border p-3 ${summary ? "" : "opacity-50"}`}
                  >
                    <div className="text-sm font-medium w-16">{format(day, "EEE")}</div>
                    <div className="text-xs text-muted-foreground w-20">{format(day, "MMM d")}</div>
                    {summary ? (
                      <>
                        <Progress value={summary.dayScore} size="sm" className="flex-1" />
                        <span className="text-sm font-bold w-10 text-right">{summary.dayScore}</span>
                        <Badge variant={summary.dayScore >= 70 ? "success" : summary.dayScore >= 40 ? "warning" : "destructive"} className="text-[10px]">
                          {formatDuration(summary.totalLoggedMinutes)}
                        </Badge>
                      </>
                    ) : (
                      <span className="text-xs text-muted-foreground">No data</span>
                    )}
                  </div>
                );
              })}
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
