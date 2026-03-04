"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/lib/auth-context";
import { getDaySummariesForRange, getActivityLogsForDate } from "@/lib/firestore";
import { getDateString, formatDuration } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, LineChart, Line, AreaChart, Area, Legend,
} from "recharts";
import { CATEGORY_COLORS, CATEGORY_LABELS, type Category, type DaySummary } from "@/lib/types";
import { format, subDays } from "date-fns";
import { BarChart3, TrendingUp, Clock, Target } from "lucide-react";

type DateRange = "7d" | "30d" | "90d";

export default function AnalyticsPage() {
  const { user } = useAuth();
  const [summaries, setSummaries] = useState<DaySummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [range, setRange] = useState<DateRange>("30d");

  const rangeMap: Record<DateRange, number> = { "7d": 7, "30d": 30, "90d": 90 };

  useEffect(() => {
    if (!user) return;
    const endDate = getDateString();
    const startDate = format(subDays(new Date(), rangeMap[range]), "yyyy-MM-dd");

    getDaySummariesForRange(user.uid, startDate, endDate).then((s) => {
      setSummaries(s);
      setLoading(false);
    });
  }, [user, range]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    );
  }

  // Derive data
  const scoreData = summaries.map((s) => ({
    date: format(new Date(s.date), "MMM d"),
    score: s.dayScore,
  }));

  const checkInData = summaries.map((s) => ({
    date: format(new Date(s.date), "MMM d"),
    answered: s.checkInsAnswered,
    missed: s.checkInsMissed,
  }));

  // Aggregate category data
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

  // Waste tracker
  const wasteData = summaries.map((s) => ({
    date: format(new Date(s.date), "MMM d"),
    idle: s.totalIdleMinutes || 0,
    unaccounted: s.totalUnaccountedMinutes || 0,
  }));

  // Averages
  const avgScore = summaries.length > 0 ? Math.round(summaries.reduce((s, d) => s + d.dayScore, 0) / summaries.length) : 0;
  const totalUnaccounted = summaries.reduce((s, d) => s + (d.totalUnaccountedMinutes || 0), 0);
  const avgCheckIn = summaries.length > 0
    ? Math.round(
        (summaries.reduce((s, d) => s + d.checkInsAnswered, 0) /
          Math.max(1, summaries.reduce((s, d) => s + d.checkInsSent, 0))) * 100
      )
    : 0;

  // Empty state
  if (summaries.length === 0) {
    return (
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col items-center justify-center h-96 text-center">
        <BarChart3 className="h-12 w-12 text-muted-foreground mb-3" />
        <h2 className="text-lg font-semibold mb-1">No data yet</h2>
        <p className="text-sm text-muted-foreground max-w-md">
          Start logging your time and we&apos;ll build your insights here. Complete your first full day to see your first chart.
        </p>
      </motion.div>
    );
  }

  const tooltipStyle = {
    contentStyle: { background: "var(--card)", border: "1px solid var(--border)", borderRadius: "8px", fontSize: "12px" },
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Analytics</h1>
          <p className="text-muted-foreground">Your time, visualized.</p>
        </div>
        <div className="flex gap-1">
          {(["7d", "30d", "90d"] as DateRange[]).map((r) => (
            <Button
              key={r}
              variant={range === r ? "default" : "outline"}
              size="sm"
              onClick={() => setRange(r)}
            >
              {r === "7d" ? "7 Days" : r === "30d" ? "30 Days" : "90 Days"}
            </Button>
          ))}
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Card>
          <CardContent className="p-5">
            <div className="flex items-center gap-3">
              <Target className="h-8 w-8 text-primary" />
              <div>
                <p className="text-sm text-muted-foreground">Avg Day Score</p>
                <p className="text-2xl font-bold">{avgScore}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5">
            <div className="flex items-center gap-3">
              <Clock className="h-8 w-8 text-destructive" />
              <div>
                <p className="text-sm text-muted-foreground">Total Unaccounted</p>
                <p className="text-2xl font-bold">{formatDuration(totalUnaccounted)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5">
            <div className="flex items-center gap-3">
              <TrendingUp className="h-8 w-8 text-success" />
              <div>
                <p className="text-sm text-muted-foreground">Avg Check-In Rate</p>
                <p className="text-2xl font-bold">{avgCheckIn}%</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Regularity Score Line Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Day Score Trend</CardTitle>
            <CardDescription>Regularity score over time</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={scoreData}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis dataKey="date" tick={{ fontSize: 11 }} stroke="var(--muted-foreground)" />
                <YAxis domain={[0, 100]} tick={{ fontSize: 11 }} stroke="var(--muted-foreground)" />
                <Tooltip {...tooltipStyle} />
                <Line type="monotone" dataKey="score" stroke="var(--primary)" strokeWidth={2} dot={{ r: 3 }} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Category Breakdown Pie */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Time by Category</CardTitle>
            <CardDescription>Total time allocation</CardDescription>
          </CardHeader>
          <CardContent>
            {categoryPieData.length > 0 ? (
              <>
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
              </>
            ) : (
              <p className="text-center text-sm text-muted-foreground py-12">No category data</p>
            )}
          </CardContent>
        </Card>

        {/* Check-In Response Rate */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Check-In Response Rate</CardTitle>
            <CardDescription>Answered vs missed pings</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={checkInData}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis dataKey="date" tick={{ fontSize: 11 }} stroke="var(--muted-foreground)" />
                <YAxis tick={{ fontSize: 11 }} stroke="var(--muted-foreground)" />
                <Tooltip {...tooltipStyle} />
                <Legend />
                <Bar dataKey="answered" fill="var(--success)" radius={[2, 2, 0, 0]} name="Answered" />
                <Bar dataKey="missed" fill="var(--destructive)" radius={[2, 2, 0, 0]} name="Missed" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Time Waste Tracker */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Time Waste Tracker</CardTitle>
            <CardDescription>Idle + Unaccounted time</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <AreaChart data={wasteData}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis dataKey="date" tick={{ fontSize: 11 }} stroke="var(--muted-foreground)" />
                <YAxis tick={{ fontSize: 11 }} stroke="var(--muted-foreground)" />
                <Tooltip formatter={(v) => `${v} min`} {...tooltipStyle} />
                <Legend />
                <Area type="monotone" dataKey="idle" stackId="1" fill="#D1D5DB" stroke="#D1D5DB" name="Idle" />
                <Area type="monotone" dataKey="unaccounted" stackId="1" fill="#EF4444" stroke="#EF4444" fillOpacity={0.3} name="Unaccounted" />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
