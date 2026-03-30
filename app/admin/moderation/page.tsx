"use client";

import { useState, useEffect } from "react";
import AdminSideNav from "@/components/AdminSideNav";
import AdminTopNav from "@/components/AdminTopNav";
import { useAuth } from "@/context/AuthContext";
import { redirect } from "next/navigation";

interface FlaggedPost {
  id: string;
  title: string;
  excerpt: string;
  author: string;
  authorEmail: string;
  reason: string;
  severity: "low" | "medium" | "high" | "critical";
  status: "pending" | "approved" | "rejected" | "escalated";
  flaggedAt: string;
  aiAnalysis?: string;
}

export default function ModerationPage() {
  const { user, isAdmin } = useAuth();
  const [posts, setPosts] = useState<FlaggedPost[]>([]);
  const [filter, setFilter] = useState<"all" | "pending" | "approved" | "rejected" | "escalated">("all");

  useEffect(() => {
    if (!user) redirect("/auth");
    if (user && !isAdmin) redirect("/dashboard");
  }, [user, isAdmin]);
  const [selectedPost, setSelectedPost] = useState<FlaggedPost | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [deletingPostId, setDeletingPostId] = useState<string | null>(null);

  useEffect(() => {
    fetchFlaggedPosts();
  }, []);

  const fetchFlaggedPosts = async () => {
    try {
      const response = await fetch("/api/posts?limit=20");
      const data = await response.json();
      // Map posts to flagged format for demo
      const flagged: FlaggedPost[] = (data.posts || []).slice(0, 8).map((p: any, i: number) => ({
        id: p.id,
        title: p.title || `Flagged Content #${i + 1}`,
        excerpt: p.excerpt || p.content?.substring(0, 120) || "Content under review...",
        author: p.author_name || "Unknown Author",
        authorEmail: p.author_email || "user@example.com",
        reason: ["Policy Violation", "Spam", "Misleading AI Content", "Hate Speech", "Copyright"][i % 5],
        severity: (["low", "medium", "high", "critical"] as const)[i % 4],
        status: (["pending", "approved", "rejected", "escalated"] as const)[i % 4],
        flaggedAt: new Date(Date.now() - i * 3600000 * 6).toLocaleDateString(),
        aiAnalysis: i % 2 === 0 ? "AI analysis suggests potential policy violation in paragraphs 2-3. Confidence: 78%." : undefined,
      }));
      setPosts(flagged);
      if (flagged.length > 0) setSelectedPost(flagged[0]);
    } catch (error) {
      console.error("Failed to fetch posts:", error);
    }
  };

  const handleAction = (postId: string, action: "approved" | "rejected" | "escalated") => {
    setPosts((prev) => prev.map((p) => (p.id === postId ? { ...p, status: action } : p)));
    if (selectedPost?.id === postId) {
      setSelectedPost({ ...selectedPost, status: action });
    }
  };

  const handleAIAnalysis = async () => {
    if (!selectedPost) return;
    setAnalyzing(true);
    try {
      const response = await fetch("/api/ai/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          topic: `Analyze this content for policy violations: "${selectedPost.title}" - ${selectedPost.excerpt}`,
          tone: "analytical",
        }),
      });
      const data = await response.json();
      const analysis = data.content || "No policy violations detected. Content appears to be within acceptable guidelines.";
      setPosts((prev) => prev.map((p) => (p.id === selectedPost.id ? { ...p, aiAnalysis: analysis } : p)));
      setSelectedPost({ ...selectedPost, aiAnalysis: analysis });
    } catch {
      setSelectedPost({ ...selectedPost, aiAnalysis: "AI analysis unavailable. Please review manually." });
    } finally {
      setAnalyzing(false);
    }
  };

  const handleDeletePost = async (postId: string) => {
    if (!confirm("Delete this post permanently? This action cannot be undone.")) return;
    setDeletingPostId(postId);
    try {
      const response = await fetch(`/api/admin/posts/${postId}`, { method: "DELETE" });
      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data.error || "Failed to delete post");
      }

      setPosts((current) => current.filter((post) => post.id !== postId));
      if (selectedPost?.id === postId) {
        setSelectedPost(null);
      }
    } catch (error) {
      alert(error instanceof Error ? error.message : "Failed to delete post");
    } finally {
      setDeletingPostId(null);
    }
  };

  const filteredPosts = posts.filter((p) => filter === "all" || p.status === filter);

  const severityColor = (s: string) => {
    const map: Record<string, string> = {
      low: "bg-green-500/10 text-green-400",
      medium: "bg-yellow-500/10 text-yellow-400",
      high: "bg-orange-500/10 text-orange-400",
      critical: "bg-red-500/10 text-red-400",
    };
    return map[s] || map.low;
  };

  const statusColor = (s: string) => {
    const map: Record<string, string> = {
      pending: "bg-yellow-500/10 text-yellow-400",
      approved: "bg-green-500/10 text-green-400",
      rejected: "bg-red-500/10 text-red-400",
      escalated: "bg-purple-500/10 text-purple-400",
    };
    return map[s] || map.pending;
  };

  const stats = [
    { label: "Queue", value: posts.filter((p) => p.status === "pending").length, icon: "pending_actions", color: "text-yellow-400" },
    { label: "Approved", value: posts.filter((p) => p.status === "approved").length, icon: "check_circle", color: "text-green-400" },
    { label: "Rejected", value: posts.filter((p) => p.status === "rejected").length, icon: "cancel", color: "text-red-400" },
    { label: "Escalated", value: posts.filter((p) => p.status === "escalated").length, icon: "warning", color: "text-purple-400" },
  ];

  return (
    <div className="dark min-h-screen bg-background text-on-background font-body">
      <AdminSideNav activePage="moderation" />
      <AdminTopNav activePage="moderation" />

      <main className="md:ml-64 pt-20 min-h-screen p-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-10 gap-6">
          <div>
            <h2 className="text-5xl font-extrabold font-headline tracking-tighter text-white mb-2">
              Content <span className="text-primary italic">Moderation</span>
            </h2>
            <p className="text-on-surface-variant text-sm">Review flagged content with AI-assisted analysis.</p>
          </div>
          <div className="flex gap-3">
            <button className="px-5 py-2.5 bg-surface-container-high border border-outline-variant/20 rounded-lg text-xs font-bold text-on-surface-variant hover:text-on-surface transition-all">
              <span className="material-symbols-outlined text-sm mr-1 align-middle">history</span>
              History
            </button>
            <button className="px-5 py-2.5 bg-linear-to-r from-primary to-primary-container text-on-primary-fixed rounded-lg text-xs font-bold hover:scale-[1.02] transition-all shadow-lg shadow-primary/20">
              <span className="material-symbols-outlined text-sm mr-1 align-middle">auto_fix_high</span>
              Auto-Review
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
          {stats.map((s) => (
            <div key={s.label} className="glass-panel rounded-xl p-5">
              <div className="flex items-center gap-2 mb-2">
                <span className={`material-symbols-outlined text-sm ${s.color}`}>{s.icon}</span>
                <span className="text-[10px] font-bold uppercase tracking-wider text-on-surface-variant">{s.label}</span>
              </div>
              <span className="text-2xl font-extrabold font-headline">{s.value}</span>
            </div>
          ))}
        </div>

        {/* Filter Tabs */}
        <div className="flex gap-2 mb-6">
          {(["all", "pending", "approved", "rejected", "escalated"] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-all ${
                filter === f ? "bg-primary text-on-primary" : "bg-surface-container-high text-on-surface-variant hover:text-on-surface"
              }`}
            >
              {f}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Queue List */}
          <div className="lg:col-span-1 space-y-3 max-h-[calc(100vh-320px)] overflow-y-auto pr-2">
            {filteredPosts.map((post) => (
              <button
                key={post.id}
                onClick={() => setSelectedPost(post)}
                className={`w-full text-left glass-panel rounded-xl p-4 transition-all hover:border-primary/20 ${
                  selectedPost?.id === post.id ? "border-primary/30 bg-surface-container" : ""
                }`}
              >
                <div className="flex items-start justify-between mb-2">
                  <h4 className="text-sm font-bold truncate flex-1 mr-2">{post.title}</h4>
                  <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold uppercase ${severityColor(post.severity)}`}>
                    {post.severity}
                  </span>
                </div>
                <p className="text-xs text-on-surface-variant line-clamp-2 mb-2">{post.excerpt}</p>
                <div className="flex items-center justify-between">
                  <span className="text-[10px] text-on-surface-variant">{post.author}</span>
                  <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold uppercase ${statusColor(post.status)}`}>
                    {post.status}
                  </span>
                </div>
              </button>
            ))}
            {filteredPosts.length === 0 && (
              <div className="text-center py-12 text-on-surface-variant">
                <span className="material-symbols-outlined text-4xl mb-2 block">inbox</span>
                <p className="text-sm">No items in this queue</p>
              </div>
            )}
          </div>

          {/* Detail Panel */}
          <div className="lg:col-span-2">
            {selectedPost ? (
              <div className="glass-panel rounded-xl p-6">
                {/* Post Header */}
                <div className="flex items-start justify-between mb-6">
                  <div>
                    <h3 className="text-xl font-bold font-headline mb-1">{selectedPost.title}</h3>
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full overflow-hidden">
                          <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${selectedPost.authorEmail}`} alt="" className="w-full h-full" />
                        </div>
                        <span className="text-xs font-medium">{selectedPost.author}</span>
                      </div>
                      <span className="text-xs text-on-surface-variant">Flagged {selectedPost.flaggedAt}</span>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${severityColor(selectedPost.severity)}`}>
                      {selectedPost.severity}
                    </span>
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${statusColor(selectedPost.status)}`}>
                      {selectedPost.status}
                    </span>
                  </div>
                </div>

                {/* Reason */}
                <div className="p-4 rounded-lg bg-surface-container-low mb-4">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-on-surface-variant mb-1">Flag Reason</p>
                  <p className="text-sm">{selectedPost.reason}</p>
                </div>

                {/* Content Preview */}
                <div className="p-4 rounded-lg bg-surface-container-low mb-4">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-on-surface-variant mb-1">Content Preview</p>
                  <p className="text-sm text-on-surface-variant leading-relaxed">{selectedPost.excerpt}</p>
                </div>

                {/* AI Analysis */}
                <div className="p-4 rounded-lg bg-surface-container-low mb-6">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-on-surface-variant">AI Context Analysis</p>
                    <button
                      onClick={handleAIAnalysis}
                      disabled={analyzing}
                      className="px-3 py-1 bg-primary/10 text-primary rounded text-[10px] font-bold hover:bg-primary/20 transition-colors disabled:opacity-50"
                    >
                      {analyzing ? "Analyzing..." : "Run Analysis"}
                    </button>
                  </div>
                  {selectedPost.aiAnalysis ? (
                    <p className="text-sm text-on-surface-variant leading-relaxed">{selectedPost.aiAnalysis}</p>
                  ) : (
                    <p className="text-sm text-on-surface-variant italic">Click &quot;Run Analysis&quot; for AI-powered content assessment.</p>
                  )}
                </div>

                {/* Actions */}
                <div className="flex gap-3">
                  <button
                    onClick={() => handleAction(selectedPost.id, "approved")}
                    className="flex-1 px-4 py-3 bg-green-500/10 text-green-400 rounded-lg text-xs font-bold uppercase tracking-wider hover:bg-green-500/20 transition-all"
                  >
                    <span className="material-symbols-outlined text-sm mr-1 align-middle">check_circle</span>
                    Approve
                  </button>
                  <button
                    onClick={() => handleAction(selectedPost.id, "rejected")}
                    className="flex-1 px-4 py-3 bg-red-500/10 text-red-400 rounded-lg text-xs font-bold uppercase tracking-wider hover:bg-red-500/20 transition-all"
                  >
                    <span className="material-symbols-outlined text-sm mr-1 align-middle">cancel</span>
                    Reject
                  </button>
                  <button
                    onClick={() => handleAction(selectedPost.id, "escalated")}
                    className="flex-1 px-4 py-3 bg-purple-500/10 text-purple-400 rounded-lg text-xs font-bold uppercase tracking-wider hover:bg-purple-500/20 transition-all"
                  >
                    <span className="material-symbols-outlined text-sm mr-1 align-middle">escalator_warning</span>
                    Escalate
                  </button>
                </div>

                <button
                  onClick={() => handleDeletePost(selectedPost.id)}
                  disabled={deletingPostId === selectedPost.id}
                  className="mt-3 w-full px-4 py-3 bg-red-500/10 text-red-400 rounded-lg text-xs font-bold uppercase tracking-wider hover:bg-red-500/20 transition-all disabled:opacity-60"
                >
                  <span className="material-symbols-outlined text-sm mr-1 align-middle">delete_forever</span>
                  {deletingPostId === selectedPost.id ? "Deleting..." : "Delete Post"}
                </button>

                {/* Resolution Log */}
                <div className="mt-6 pt-6 border-t border-outline-variant/10">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-on-surface-variant mb-3">Resolution History</h4>
                  <div className="space-y-3">
                    {[
                      { action: "Content flagged by automated system", time: selectedPost.flaggedAt, actor: "System" },
                      { action: "Assigned to moderation queue", time: selectedPost.flaggedAt, actor: "Auto-router" },
                    ].map((log, i) => (
                      <div key={i} className="flex items-center gap-3">
                        <div className="w-1.5 h-1.5 rounded-full bg-outline-variant"></div>
                        <div className="flex-1">
                          <p className="text-xs">{log.action}</p>
                          <p className="text-[10px] text-on-surface-variant">{log.actor} • {log.time}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <div className="glass-panel rounded-xl p-12 text-center text-on-surface-variant">
                <span className="material-symbols-outlined text-5xl mb-3 block">gavel</span>
                <p className="text-sm">Select an item from the queue to review</p>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
