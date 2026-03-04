"use client";

import { useEffect, useState, use } from "react";
import { useAuth } from "@/lib/auth-context";
import { getDaySummary, getActivityLogsForDate, getCheckInsForDate } from "@/lib/firestore";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { motion } from "framer-motion";
import { ArrowLeft, Clock, Target, CheckCircle2, AlertTriangle } from "lucide-react";
import { format } from "date-fns";
import { useRouter } from "next/navigation";
import { formatDuration } from "@/lib/utils";
import { CATEGORY_COLORS, CATEGORY_LABELS, type DaySummary, type ActivityLogEntry, type CheckInRecord, type Category } from "@/lib/types";

export default function HistoryDatePage({ params }: { params: Promise<{ date: string }> }) {
  const { date } = use(params);
  const { user } = useAuth();
  const router = useRouter();
  const [summary, setSummary] = useState<DaySummary | null>(null);
  const [logs, setLogs] = useState<ActivityLogEntry[]>([]);
  const [checkIns, setCheckIns] = useState<CheckInRecord[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    Promise.all([
      getDaySummary(user.uid, date),
      getActivityLogsForDate(user.uid, date),
      getCheckInsForDate(user.uid, date),
    ]).then(([s, l, c]) => {
      setSummary(s);
      setLogs(l);
      setCheckIns(c);
      setLoading(false);
    });
  }, [user, date]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    );
  }

  const displayDate = format(new Date(date), "EEEE, MMMM d, yyyy");

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="sm" onClick={() => router.push("/history")}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold">{displayDate}</h1>
          {summary && <p className="text-muted-foreground">Day Score: {summary.dayScore}</p>}
        </div>
      </div>

      {!summary ? (
        <Card>
          <CardContent className="p-8 text-center">
            <p className="text-muted-foreground">No summary data for this date.</p>
          </CardContent>
        </Card>
      ) : (
        <>
          {/* Stats */}
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            {[
              { icon: Target, label: "Day Score", value: `${summary.dayScore}`, color: "text-primary" },
              { icon: Clock, label: "Logged", value: formatDuration(summary.totalLoggedMinutes), color: "text-success" },
              { icon: AlertTriangle, label: "Unaccounted", value: formatDuration(summary.totalUnaccountedMinutes), color: "text-destructive" },
              { icon: CheckCircle2, label: "Check-Ins", value: `${summary.checkInsAnswered}/${summary.checkInsSent}`, color: "text-warning" },
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

          {/* Category Breakdown */}
          {summary.categoryBreakdown && Object.keys(summary.categoryBreakdown).length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Category Breakdown</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {Object.entries(summary.categoryBreakdown)
                  .sort(([, a], [, b]) => b - a)
                  .map(([cat, mins]) => (
                    <div key={cat} className="flex items-center gap-3">
                      <div
                        className="h-3 w-3 rounded-full"
                        style={{ backgroundColor: CATEGORY_COLORS[cat as Category] || "#6B7280" }}
                      />
                      <span className="text-sm flex-1">{CATEGORY_LABELS[cat as Category] || cat}</span>
                      <span className="text-sm text-muted-foreground">{formatDuration(mins)}</span>
                      <Progress
                        value={(mins / summary.totalLoggedMinutes) * 100}
                        size="sm"
                        className="w-24"
                        color={CATEGORY_COLORS[cat as Category]}
                      />
                    </div>
                  ))}
              </CardContent>
            </Card>
          )}

          {/* Activity Log */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Activity Log ({logs.length} entries)</CardTitle>
            </CardHeader>
            <CardContent>
              {logs.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-4">No activity logged this day.</p>
              ) : (
                <div className="space-y-2">
                  {logs.map((log) => (
                    <motion.div
                      key={log.id}
                      className="flex items-center gap-3 rounded-lg border p-3"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                    >
                      <div
                        className="h-2.5 w-2.5 rounded-full flex-shrink-0"
                        style={{ backgroundColor: CATEGORY_COLORS[log.category] || "#6B7280" }}
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium truncate">
                            {log.freeText || log.busyLabel || CATEGORY_LABELS[log.category] || log.status}
                          </span>
                          <Badge variant={
                            log.status === "on-track" ? "success" :
                            log.status === "busy" ? "warning" :
                            log.status === "idle" ? "outline" : "destructive"
                          } className="text-[10px] flex-shrink-0">
                            {log.status}
                          </Badge>
                        </div>
                        <p className="text-xs text-muted-foreground">
                          {format(log.startTime.toDate(), "h:mm a")} – {format(log.endTime.toDate(), "h:mm a")}
                        </p>
                      </div>
                      <span className="text-xs text-muted-foreground flex-shrink-0 capitalize">{log.source}</span>
                    </motion.div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Journal Entry */}
          {summary.journalEntry && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Journal</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm whitespace-pre-wrap">{summary.journalEntry}</p>
              </CardContent>
            </Card>
          )}
        </>
      )}
    </div>
  );
}
