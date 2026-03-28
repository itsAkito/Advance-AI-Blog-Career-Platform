"use client";

import { useState, useEffect } from "react";
import AdminSideNav from "@/components/AdminSideNav";
import AdminTopNav from "@/components/AdminTopNav";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";

interface SystemStats {
  totalUsers: number;
  totalPosts: number;
  activeNow: number;
  systemHealth: number;
}

interface TopCreator {
  name: string;
  posts: number;
  views: string;
  level: string;
}

export default function AdminPage() {
  const { user, isAdmin, loading } = useAuth();
  const router = useRouter();
  const [stats, setStats] = useState<SystemStats>({
    totalUsers: 0,
    totalPosts: 0,
    activeNow: 0,
    systemHealth: 98.7,
  });
  const [topCreators, setTopCreators] = useState<TopCreator[]>([]);

  useEffect(() => {
    if (loading) return;
    if (!user) { router.push("/auth"); return; }
    if (!isAdmin) { router.push("/dashboard"); return; }
  }, [user, isAdmin, loading, router]);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [usersRes, postsRes] = await Promise.all([
          fetch("/api/admin/users"),
          fetch("/api/posts?limit=100"),
        ]);
        const usersData = usersRes.ok ? await usersRes.json() : {};
        const postsData = postsRes.ok ? await postsRes.json() : {};

        const allUsers = usersData.users || [];
        const allPosts = postsData.posts || [];

        setStats({
          totalUsers: allUsers.length,
          totalPosts: allPosts.length,
          activeNow: allUsers.filter((u: any) => u.role === "admin" || u.role === "creator").length,
          systemHealth: 98.7,
        });

        // Build top creators from posts data
        const creatorMap: Record<string, { name: string; posts: number; views: number }> = {};
        for (const post of allPosts) {
          const userId = post.author_id;
          if (!creatorMap[userId]) {
            const matchedUser = allUsers.find((u: any) => u.id === userId);
            creatorMap[userId] = {
              name: matchedUser?.name || "Unknown",
              posts: 0,
              views: 0,
            };
          }
          creatorMap[userId].posts++;
          creatorMap[userId].views += post.views || 0;
        }

        const sorted = Object.values(creatorMap)
          .sort((a, b) => b.posts - a.posts)
          .slice(0, 5)
          .map((c) => ({
            name: c.name,
            posts: c.posts,
            views: c.views >= 1000000 ? `${(c.views / 1000000).toFixed(1)}M` : c.views >= 1000 ? `${(c.views / 1000).toFixed(1)}K` : String(c.views),
            level: c.posts >= 50 ? "Elite" : c.posts >= 20 ? "Authority" : "Creator",
          }));

        setTopCreators(sorted);
      } catch (err) {
        console.error("Failed to fetch stats:", err);
      }
    };
    fetchStats();
  }, []);

  const statCards = [
    { label: "Total Users", value: stats.totalUsers.toLocaleString(), icon: "group", change: "+12%", color: "text-primary" },
    { label: "Total Posts", value: stats.totalPosts.toLocaleString(), icon: "article", change: "+8%", color: "text-secondary" },
    { label: "Active Now", value: stats.activeNow.toLocaleString(), icon: "radio_button_checked", change: "Live", color: "text-green-400" },
    { label: "System Health", value: `${stats.systemHealth}%`, icon: "monitor_heart", change: "Stable", color: "text-tertiary" },
  ];

  const recentReports = [
    { id: "RPT-2401", type: "Content Flag", status: "Pending", severity: "Medium", time: "2h ago" },
    { id: "RPT-2400", type: "User Report", status: "Resolved", severity: "Low", time: "5h ago" },
    { id: "RPT-2399", type: "AI Abuse", status: "Investigating", severity: "High", time: "1d ago" },
    { id: "RPT-2398", type: "Spam Content", status: "Resolved", severity: "Low", time: "2d ago" },
  ];

  return (
    <div className="dark min-h-screen bg-background text-on-background font-body">
      <AdminSideNav activePage="overview" />
      <AdminTopNav activePage="overview" />

      <main className="md:ml-64 pt-20 min-h-screen p-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-10 gap-6">
          <div>
            <h2 className="text-5xl font-extrabold font-headline tracking-tighter text-white mb-2">
              System <span className="text-primary italic">Overview</span>
            </h2>
            <p className="text-on-surface-variant text-sm">Real-time platform health and operational insights.</p>
          </div>
          <div className="flex gap-3">
            <Button variant="outline" className="text-xs font-bold">
              <span className="material-symbols-outlined text-sm mr-1">download</span>
              Export
            </Button>
            <Button className="bg-gradient-to-r from-primary to-primary-container text-on-primary-fixed font-bold shadow-lg shadow-primary/20 hover:scale-[1.02] transition-all text-xs">
              <span className="material-symbols-outlined text-sm mr-1">refresh</span>
              Refresh
            </Button>
          </div>
        </div>

        {/* Stat Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
          {statCards.map((card) => (
            <Card key={card.label} className="bg-surface-container-low/50 backdrop-blur border-outline-variant/10">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-3">
                  <span className={`material-symbols-outlined ${card.color}`}>{card.icon}</span>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-on-surface-variant">{card.label}</span>
                </div>
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-extrabold font-headline">{card.value}</span>
                  <Badge variant="outline" className="text-green-400 border-green-400/30 text-[10px]">{card.change}</Badge>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Recent Reports Table */}
          <Card className="lg:col-span-2 bg-surface-container-low/50 backdrop-blur border-outline-variant/10 overflow-hidden">
            <div className="p-6 border-b border-outline-variant/10">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-bold font-headline">Recent Reports</h3>
                <Button variant="link" className="text-xs text-primary font-bold uppercase tracking-widest p-0 h-auto">View All</Button>
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-outline-variant/10">
                    <th className="px-6 py-3 text-left text-[10px] font-bold uppercase tracking-wider text-on-surface-variant">ID</th>
                    <th className="px-6 py-3 text-left text-[10px] font-bold uppercase tracking-wider text-on-surface-variant">Type</th>
                    <th className="px-6 py-3 text-left text-[10px] font-bold uppercase tracking-wider text-on-surface-variant">Status</th>
                    <th className="px-6 py-3 text-left text-[10px] font-bold uppercase tracking-wider text-on-surface-variant">Severity</th>
                    <th className="px-6 py-3 text-left text-[10px] font-bold uppercase tracking-wider text-on-surface-variant">Time</th>
                  </tr>
                </thead>
                <tbody>
                  {recentReports.map((report) => (
                    <tr key={report.id} className="border-b border-outline-variant/5 hover:bg-surface-container-low/50 transition-colors">
                      <td className="px-6 py-4 text-xs font-mono text-primary">{report.id}</td>
                      <td className="px-6 py-4 text-sm">{report.type}</td>
                      <td className="px-6 py-4">
                        <Badge variant="outline" className={`text-[10px] font-bold ${
                          report.status === "Resolved" ? "bg-green-500/10 text-green-400 border-green-500/20" :
                          report.status === "Pending" ? "bg-yellow-500/10 text-yellow-400 border-yellow-500/20" :
                          "bg-red-500/10 text-red-400 border-red-500/20"
                        }`}>{report.status}</Badge>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`text-xs font-medium ${
                          report.severity === "High" ? "text-red-400" :
                          report.severity === "Medium" ? "text-yellow-400" : "text-on-surface-variant"
                        }`}>{report.severity}</span>
                      </td>
                      <td className="px-6 py-4 text-xs text-on-surface-variant">{report.time}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>

          {/* Top AI Creators */}
          <Card className="bg-surface-container-low/50 backdrop-blur border-outline-variant/10">
            <CardContent className="p-6">
              <h3 className="text-lg font-bold font-headline mb-6">Top AI Creators</h3>
              <div className="space-y-4">
                {topCreators.map((creator, idx) => (
                  <div key={creator.name} className="flex items-center gap-3 p-3 rounded-lg bg-surface-container-low hover:bg-surface-container transition-all">
                    <Avatar className="h-10 w-10 rounded-lg">
                      <AvatarImage src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${creator.name}`} />
                      <AvatarFallback className="rounded-lg">{creator.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold truncate">{creator.name}</p>
                      <p className="text-[10px] text-on-surface-variant">{creator.posts} posts &bull; {creator.views} views</p>
                    </div>
                    <Badge variant={idx === 0 ? "default" : "outline"} className={`text-[10px] ${
                      idx === 0 ? "bg-primary/10 text-primary border-primary/20" : ""
                    }`}>{creator.level}</Badge>
                  </div>
                ))}
              </div>

              <Separator className="my-6" />

              {/* Node Network Mini */}
              <div className="p-4 rounded-lg bg-surface-container-low">
                <div className="flex items-center gap-2 mb-3">
                  <span className="material-symbols-outlined text-primary text-sm">hub</span>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-on-surface-variant">Node Network</span>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { label: "API", status: "online" },
                    { label: "DB", status: "online" },
                    { label: "AI", status: "online" },
                    { label: "CDN", status: "online" },
                    { label: "Auth", status: "online" },
                    { label: "Queue", status: "degraded" },
                  ].map((node) => (
                    <div key={node.label} className="flex items-center gap-1.5 p-2 rounded bg-surface-container">
                      <div className={`w-1.5 h-1.5 rounded-full ${node.status === "online" ? "bg-green-400" : "bg-yellow-400"}`}></div>
                      <span className="text-[10px] font-medium">{node.label}</span>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
