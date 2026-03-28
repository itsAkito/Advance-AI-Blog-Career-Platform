"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Navbar from "@/components/NavBar";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { useAuth } from "@/context/AuthContext";
import { Suspense } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Skeleton } from "@/components/ui/skeleton";

function EditorContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const editId = searchParams.get("id");
  const { user } = useAuth();
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [excerpt, setExcerpt] = useState("");
  const [topic, setTopic] = useState("");
  const [tone, setTone] = useState("professional");
  const [loading, setLoading] = useState(false);
  const [generatingAI, setGeneratingAI] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [showAISidebar, setShowAISidebar] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [coverImageUrl, setCoverImageUrl] = useState("");
  const [imagePrompt, setImagePrompt] = useState("");
  const [generatingImage, setGeneratingImage] = useState(false);
  const [useAIImage, setUseAIImage] = useState(true);
  const [uploadingImage, setUploadingImage] = useState(false);
  const contentRef = useRef<HTMLTextAreaElement>(null);

  // Markdown formatting helper
  const insertFormat = (prefix: string, suffix: string = prefix) => {
    const textarea = contentRef.current;
    if (!textarea) return;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selected = content.substring(start, end);
    const before = content.substring(0, start);
    const after = content.substring(end);
    const formatted = selected
      ? `${before}${prefix}${selected}${suffix}${after}`
      : `${before}${prefix}text${suffix}${after}`;
    setContent(formatted);
    // Restore cursor position inside the formatting markers
    setTimeout(() => {
      textarea.focus();
      const cursorPos = selected ? start + prefix.length + selected.length + suffix.length : start + prefix.length;
      textarea.setSelectionRange(selected ? cursorPos : start + prefix.length, selected ? cursorPos : start + prefix.length + 4);
    }, 0);
  };

  const formatActions: { icon: string; label: string; action: () => void }[] = [
    { icon: "format_bold", label: "Bold", action: () => insertFormat("**") },
    { icon: "format_italic", label: "Italic", action: () => insertFormat("*") },
    { icon: "format_strikethrough", label: "Strikethrough", action: () => insertFormat("~~") },
    { icon: "format_list_bulleted", label: "Bullet List", action: () => insertFormat("\n- ", "") },
    { icon: "format_list_numbered", label: "Numbered List", action: () => insertFormat("\n1. ", "") },
    { icon: "format_quote", label: "Blockquote", action: () => insertFormat("\n> ", "") },
    { icon: "code", label: "Inline Code", action: () => insertFormat("`") },
    { icon: "code_blocks", label: "Code Block", action: () => insertFormat("\n```\n", "\n```\n") },
    { icon: "title", label: "Heading", action: () => insertFormat("\n## ", "") },
    { icon: "link", label: "Link", action: () => insertFormat("[", "](url)") },
    { icon: "horizontal_rule", label: "Divider", action: () => insertFormat("\n\n---\n\n", "") },
  ];

  // Load existing post when editing
  const loadPost = useCallback(async () => {
    if (!editId) return;
    try {
      const response = await fetch(`/api/posts/${editId}`);
      if (response.ok) {
        const post = await response.json();
        setTitle(post.title || "");
        setContent(post.content || "");
        setExcerpt(post.excerpt || "");
        setTopic(post.topic || "");
        setCoverImageUrl(post.cover_image_url || "");
        setIsEditing(true);
      }
    } catch (err) {
      console.error("Failed to load post:", err);
    }
  }, [editId]);

  useEffect(() => {
    loadPost();
  }, [loadPost]);

  const wordCount = content.split(/\s+/).filter((w) => w.length > 0).length;
  const readTime = Math.max(1, Math.ceil(wordCount / 200));

  const handleGenerateWithAI = async () => {
    if (!user) { setError("You must be logged in."); return; }
    if (!topic.trim()) { setError("Enter a topic for AI generation"); return; }
    setGeneratingAI(true);
    setError("");
    try {
      const response = await fetch("/api/ai/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ topic, tone, userId: user.id }),
      });
      if (!response.ok) throw new Error("Failed to generate content");
      const data = await response.json();
      setContent(data.content || "");
      setTitle(data.title || "");
      setExcerpt(data.excerpt || "");
      setSuccess("Content generated!");
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      setError(String(err));
    } finally {
      setGeneratingAI(false);
    }
  };

  const handleGenerateTitle = async () => {
    if (!content.trim()) return;
    setGeneratingAI(true);
    try {
      const response = await fetch("/api/ai/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ topic: `Generate a compelling title for this content: ${content.substring(0, 500)}`, tone, userId: user?.id }),
      });
      if (response.ok) {
        const data = await response.json();
        setTitle(data.title || data.content?.split("\n")[0] || "");
      }
    } catch (err) {
      console.error(err);
    } finally {
      setGeneratingAI(false);
    }
  };

  const handleGenerateImage = async () => {
    const prompt = imagePrompt.trim() || title.trim() || topic.trim();
    if (!prompt) { setError("Enter a title or image prompt first"); return; }
    setGeneratingImage(true);
    setError("");
    try {
      const response = await fetch("/api/ai/generate-image", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt }),
      });
      if (!response.ok) throw new Error("Failed to generate image");
      const data = await response.json();
      setCoverImageUrl(data.imageUrl);
      setSuccess("Cover image generated!");
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      setError(String(err));
    } finally {
      setGeneratingImage(false);
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingImage(true);
    setError("");
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("folder", "blog-covers");
      const response = await fetch("/api/upload", { method: "POST", body: formData });
      if (!response.ok) throw new Error("Upload failed");
      const data = await response.json();
      setCoverImageUrl(data.url);
      setSuccess("Image uploaded!");
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      setError(String(err));
    } finally {
      setUploadingImage(false);
    }
  };

  const handleSummarize = async () => {
    if (!content.trim()) return;
    setGeneratingAI(true);
    try {
      const response = await fetch("/api/ai/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ topic: `Summarize this content concisely in 2-3 sentences:\n\n${content.substring(0, 2000)}`, tone, userId: user?.id }),
      });
      if (response.ok) {
        const data = await response.json();
        setExcerpt(data.content || data.excerpt || "");
      }
    } catch (err) {
      console.error(err);
    } finally {
      setGeneratingAI(false);
    }
  };

  const handlePublish = async () => {
    if (!user) { setError("You must be logged in."); return; }
    if (!title.trim() || !content.trim()) { setError("Title and content are required"); return; }
    setLoading(true);
    setError("");
    try {
      const url = isEditing ? `/api/posts/${editId}` : "/api/posts";
      const method = isEditing ? "PUT" : "POST";
      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          content,
          excerpt: excerpt || content.substring(0, 150),
          topic,
          cover_image_url: coverImageUrl || null,
          ai_generated: false,
          userId: user.id,
          published: true,
        }),
      });
      if (!response.ok) throw new Error("Failed to publish");
      setSuccess(isEditing ? "Updated!" : "Published!");
      setTimeout(() => router.push("/dashboard/posts"), 2000);
    } catch (err) {
      setError(String(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <ProtectedRoute>
      <Navbar />
      <div className="flex min-h-screen bg-background pt-16">
        {/* Main Editor */}
        <div className={`flex-1 flex flex-col ${showAISidebar ? "lg:mr-80" : ""} transition-all`}>
          {/* Toolbar */}
          <div className="sticky top-16 z-30 bg-surface-container-low/80 backdrop-blur-xl border-b border-outline-variant/10 px-6 py-3 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Button variant="ghost" size="icon" onClick={() => router.back()} className="text-on-surface-variant">
                <span className="material-symbols-outlined text-lg">arrow_back</span>
              </Button>
              <Separator orientation="vertical" className="h-5" />
              <TooltipProvider delayDuration={300}>
                <div className="flex gap-0.5 flex-wrap">
                  {formatActions.map((action) => (
                    <Tooltip key={action.icon}>
                      <TooltipTrigger asChild>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={action.action}
                          className="h-8 w-8 text-on-surface-variant hover:text-on-surface"
                        >
                          <span className="material-symbols-outlined text-[18px]">{action.icon}</span>
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent side="bottom" className="text-xs">{action.label}</TooltipContent>
                    </Tooltip>
                  ))}
                </div>
              </TooltipProvider>
            </div>
            <div className="flex items-center gap-3">
              <Badge variant="outline" className="text-xs text-on-surface-variant">{wordCount} words &bull; {readTime} min read</Badge>
              <Button
                variant={showAISidebar ? "secondary" : "ghost"}
                size="icon"
                onClick={() => setShowAISidebar(!showAISidebar)}
                className={showAISidebar ? "bg-primary/10 text-primary" : "text-on-surface-variant"}
              >
                <span className="material-symbols-outlined text-[18px]">auto_awesome</span>
              </Button>
              <Button
                onClick={handlePublish}
                disabled={loading}
                className="bg-gradient-to-r from-primary to-primary-container text-on-primary-fixed font-bold shadow-lg shadow-primary/20 hover:scale-[1.02] transition-all"
              >
                {loading ? "Publishing..." : isEditing ? "Update" : "Publish"}
              </Button>
            </div>
          </div>

          {/* Editor Content */}
          <div className="flex-1 max-w-3xl mx-auto w-full px-6 py-10">
            {error && (
              <div className="mb-4 p-3 rounded-lg bg-error/10 border border-error/20 text-error text-sm flex items-center gap-2">
                <span className="material-symbols-outlined text-sm">error</span>
                {error}
                <button onClick={() => setError("")} className="ml-auto"><span className="material-symbols-outlined text-sm">close</span></button>
              </div>
            )}
            {success && (
              <div className="mb-4 p-3 rounded-lg bg-green-500/10 border border-green-500/20 text-green-400 text-sm flex items-center gap-2">
                <span className="material-symbols-outlined text-sm">check_circle</span>
                {success}
              </div>
            )}

            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Untitled Post"
              className="w-full bg-transparent text-4xl md:text-5xl font-extrabold font-headline tracking-tighter text-on-surface placeholder:text-on-surface-variant/30 outline-none mb-4 leading-tight"
            />

            {/* Cover Image Preview */}
            {coverImageUrl && (
              <div className="relative mb-6 rounded-xl overflow-hidden group">
                <img src={coverImageUrl} alt="Cover" className="w-full h-48 object-cover" />
                <button
                  onClick={() => setCoverImageUrl("")}
                  className="absolute top-2 right-2 p-1.5 rounded-lg bg-black/50 text-white opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <span className="material-symbols-outlined text-sm">close</span>
                </button>
              </div>
            )}

            <input
              value={excerpt}
              onChange={(e) => setExcerpt(e.target.value)}
              placeholder="Add a brief excerpt..."
              className="w-full bg-transparent text-lg text-on-surface-variant placeholder:text-on-surface-variant/20 outline-none mb-8"
            />
            <textarea
              ref={contentRef}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Start writing your story... (Markdown supported: **bold**, *italic*, ## heading, etc.)"
              className="w-full flex-1 min-h-[60vh] bg-transparent text-on-surface placeholder:text-on-surface-variant/20 outline-none resize-none text-base leading-relaxed font-mono"
            />
          </div>
        </div>

        {/* AI Assistant Sidebar */}
        {showAISidebar && (
          <aside className="hidden lg:flex fixed right-0 top-16 w-80 h-[calc(100vh-64px)] flex-col bg-surface-container-low border-l border-outline-variant/10 z-20">
            <div className="p-6 border-b border-outline-variant/10">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-primary" style={{ fontVariationSettings: "'FILL' 1" }}>auto_awesome</span>
                <h3 className="font-bold font-headline">AI Assistant</h3>
              </div>
              <p className="text-xs text-on-surface-variant mt-1">Powered by Gemini</p>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {/* Quick Actions */}
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-on-surface-variant">Quick Actions</span>
                <div className="mt-3 space-y-2">
                  <Button
                    variant="ghost"
                    onClick={handleGenerateTitle}
                    disabled={generatingAI}
                    className="w-full justify-start gap-3 h-auto p-3"
                  >
                    <span className="material-symbols-outlined text-primary text-sm">title</span>
                    Generate Title
                  </Button>
                  <Button
                    variant="ghost"
                    onClick={handleSummarize}
                    disabled={generatingAI}
                    className="w-full justify-start gap-3 h-auto p-3"
                  >
                    <span className="material-symbols-outlined text-secondary text-sm">summarize</span>
                    {generatingAI ? "Summarizing..." : "Summarize"}
                  </Button>
                  <Button variant="ghost" className="w-full justify-start gap-3 h-auto p-3">
                    <span className="material-symbols-outlined text-tertiary text-sm">psychology</span>
                    Check Tone
                  </Button>
                </div>
              </div>

              {/* Full Generation */}
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-on-surface-variant">Generate Full Article</span>
                <div className="mt-3 space-y-3">
                  <Input
                    value={topic}
                    onChange={(e) => setTopic(e.target.value)}
                    placeholder="Enter topic..."
                    className="bg-surface-container border-outline-variant/20 text-on-surface placeholder:text-on-surface-variant/50 focus:border-primary"
                  />
                  <select
                    value={tone}
                    onChange={(e) => setTone(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-lg bg-surface-container border border-outline-variant/20 text-sm text-on-surface outline-none focus:border-primary"
                  >
                    <option value="professional">Professional</option>
                    <option value="casual">Casual</option>
                    <option value="academic">Academic</option>
                    <option value="creative">Creative</option>
                  </select>
                  <Button
                    onClick={handleGenerateWithAI}
                    disabled={generatingAI}
                    className="w-full bg-gradient-to-r from-secondary to-tertiary text-white font-bold hover:scale-[1.02] transition-all"
                  >
                    {generatingAI ? "Generating..." : "Generate with AI"}
                  </Button>
                </div>
              </div>

              {/* Cover Image Generation */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-on-surface-variant">Cover Image</span>
                  <button
                    onClick={() => setUseAIImage(!useAIImage)}
                    className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${useAIImage ? "bg-primary" : "bg-surface-container-highest"}`}
                  >
                    <span className={`inline-block h-3.5 w-3.5 rounded-full bg-white transition-transform ${useAIImage ? "translate-x-4" : "translate-x-0.5"}`} />
                  </button>
                </div>
                <p className="text-[10px] text-on-surface-variant mb-3">
                  {useAIImage ? "AI generates a cover image from your prompt" : "Upload an image from your device"}
                </p>
                <div className="space-y-3">
                  {useAIImage ? (
                    <>
                      <Input
                        value={imagePrompt}
                        onChange={(e) => setImagePrompt(e.target.value)}
                        placeholder="Image prompt (or uses title)..."
                        className="bg-surface-container border-outline-variant/20 text-on-surface placeholder:text-on-surface-variant/50 focus:border-primary"
                      />
                      <Button
                        onClick={handleGenerateImage}
                        disabled={generatingImage}
                        className="w-full bg-gradient-to-r from-primary to-secondary text-white font-bold hover:scale-[1.02] transition-all"
                      >
                        <span className="material-symbols-outlined text-sm">auto_awesome</span>
                        {generatingImage ? "Generating..." : "Generate with AI"}
                      </Button>
                    </>
                  ) : (
                    <>
                      <label className="w-full py-3 border-2 border-dashed border-outline-variant/30 rounded-lg text-sm text-on-surface-variant flex items-center justify-center gap-2 cursor-pointer hover:border-primary/40 transition-colors">
                        <span className="material-symbols-outlined text-sm">upload_file</span>
                        {uploadingImage ? "Uploading..." : "Choose File"}
                        <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" disabled={uploadingImage} />
                      </label>
                      <div className="text-[10px] text-on-surface-variant">Or paste a URL:</div>
                      <Input
                        value={coverImageUrl}
                        onChange={(e) => setCoverImageUrl(e.target.value)}
                        placeholder="https://..."
                        className="bg-surface-container border-outline-variant/20 text-on-surface placeholder:text-on-surface-variant/50 focus:border-primary"
                      />
                    </>
                  )}
                  {coverImageUrl && (
                    <div className="rounded-lg overflow-hidden border border-outline-variant/20">
                      <img src={coverImageUrl} alt="Cover preview" className="w-full h-32 object-cover" />
                    </div>
                  )}
                </div>
              </div>

              {/* Live Insights */}
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-on-surface-variant">Live Insights</span>
                <div className="mt-3 space-y-3">
                  <Card className="bg-surface-container border-none">
                    <CardContent className="p-3 space-y-1">
                      <div className="flex justify-between text-xs">
                        <span className="text-on-surface-variant">Readability</span>
                        <Badge variant="outline" className="text-green-400 border-green-400/30 text-[10px] h-5">Good</Badge>
                      </div>
                      <div className="w-full h-1 bg-surface-container-highest rounded-full">
                        <div className="h-full bg-green-400 rounded-full" style={{ width: "78%" }}></div>
                      </div>
                    </CardContent>
                  </Card>
                  <Card className="bg-surface-container border-none">
                    <CardContent className="p-3 space-y-1">
                      <div className="flex justify-between text-xs">
                        <span className="text-on-surface-variant">SEO Score</span>
                        <Badge variant="outline" className="text-yellow-400 border-yellow-400/30 text-[10px] h-5">Fair</Badge>
                      </div>
                      <div className="w-full h-1 bg-surface-container-highest rounded-full">
                        <div className="h-full bg-yellow-400 rounded-full" style={{ width: "55%" }}></div>
                      </div>
                    </CardContent>
                  </Card>
                  <Card className="bg-surface-container border-none">
                    <CardContent className="p-3 space-y-1">
                      <div className="flex justify-between text-xs">
                        <span className="text-on-surface-variant">Engagement</span>
                        <Badge variant="outline" className="text-primary border-primary/30 text-[10px] h-5">{wordCount > 300 ? "High" : "Low"}</Badge>
                      </div>
                      <div className="w-full h-1 bg-surface-container-highest rounded-full">
                        <div className="h-full bg-primary rounded-full" style={{ width: `${Math.min(100, (wordCount / 500) * 100)}%` }}></div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </div>
          </aside>
        )}
      </div>
    </ProtectedRoute>
  );
}

export default function EditorPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Skeleton className="h-10 w-10 rounded-full" />
          <Skeleton className="h-4 w-32" />
        </div>
      </div>
    }>
      <EditorContent />
    </Suspense>
  );
}
