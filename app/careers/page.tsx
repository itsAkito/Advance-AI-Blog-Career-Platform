"use client";

import Link from "next/link";
import Navbar from "@/components/NavBar";
import Footer from "@/components/Footer";

const openings = [
  {
    title: "Senior Backend Engineer",
    department: "Engineering",
    location: "Bangalore, India (Remote)",
    type: "Full-time",
    description: "Build and scale our AI-powered content platform serving millions of creators worldwide. You'll work with Node.js, Next.js, Supabase, and integrate with cutting-edge LLM APIs.",
  },
  {
    title: "AI/ML Research Engineer",
    department: "AI Research",
    location: "Remote (Global)",
    type: "Full-time",
    description: "Push the boundaries of AI in content creation. Research and develop novel approaches for text generation, content analysis, and personalized recommendations.",
  },
  {
    title: "Product Designer (UX/UI)",
    department: "Design",
    location: "Remote (India/US)",
    type: "Full-time",
    description: "Shape the future of our editorial platform with intuitive, beautiful design. Work on our design system, user flows, and data visualization components.",
  },
  {
    title: "Community Manager",
    department: "Community",
    location: "Remote (India)",
    type: "Full-time",
    description: "Build and nurture our creator community. Organize events, manage content programs, and help creators grow their careers through our platform.",
  },
  {
    title: "Technical Writer",
    department: "Content",
    location: "Remote (Global)",
    type: "Contract",
    description: "Create comprehensive API documentation, tutorials, and developer guides that empower creators to maximize our platform's potential.",
  },
];

const perks = [
  { icon: "laptop_mac", title: "Remote First", desc: "Work from anywhere in the world" },
  { icon: "school", title: "Learning Budget", desc: "₹1L annual learning & conference budget" },
  { icon: "health_and_safety", title: "Health Insurance", desc: "Comprehensive health coverage for you & family" },
  { icon: "psychology", title: "Mental Health", desc: "Free counseling and wellness programs" },
  { icon: "flight", title: "Unlimited PTO", desc: "Take the time you need, when you need it" },
  { icon: "savings", title: "Equity", desc: "Stock options to share in our growth" },
];

export default function CareersPage() {
  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-background pt-24 pb-16 px-4 sm:px-8">
        <div className="max-w-5xl mx-auto">
          <header className="mb-16 text-center">
            <span className="text-[10px] font-bold tracking-[0.2em] text-on-surface-variant uppercase block mb-4">Join Our Team</span>
            <h1 className="font-headline text-5xl md:text-6xl font-extrabold tracking-tighter text-on-surface leading-[0.95]">
              Build the Future of <span className="text-gradient italic">Content</span>
            </h1>
            <p className="text-on-surface-variant mt-4 max-w-2xl mx-auto leading-relaxed">
              We're a team of builders, creators, and AI enthusiasts on a mission to redefine editorial excellence. Join us.
            </p>
          </header>

          {/* Perks */}
          <section className="mb-16">
            <h2 className="text-3xl font-bold font-headline tracking-tight mb-8 text-center">Why AiBlog?</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {perks.map((perk) => (
                <div key={perk.title} className="glass-panel rounded-2xl p-6 text-center hover:border-primary/20 transition-all">
                  <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
                    <span className="material-symbols-outlined text-primary text-xl">{perk.icon}</span>
                  </div>
                  <h3 className="font-bold font-headline text-sm mb-1">{perk.title}</h3>
                  <p className="text-xs text-on-surface-variant">{perk.desc}</p>
                </div>
              ))}
            </div>
          </section>

          {/* Open Positions */}
          <section>
            <h2 className="text-3xl font-bold font-headline tracking-tight mb-8">Open Positions</h2>
            <div className="space-y-4">
              {openings.map((job) => (
                <div
                  key={job.title}
                  className="glass-panel rounded-2xl p-6 hover:border-primary/20 transition-all group"
                >
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex-1">
                      <h3 className="text-lg font-bold font-headline group-hover:text-primary transition-colors">
                        {job.title}
                      </h3>
                      <div className="flex flex-wrap gap-3 mt-2 text-xs text-on-surface-variant">
                        <span className="flex items-center gap-1">
                          <span className="material-symbols-outlined text-xs">apartment</span>
                          {job.department}
                        </span>
                        <span className="flex items-center gap-1">
                          <span className="material-symbols-outlined text-xs">location_on</span>
                          {job.location}
                        </span>
                        <span className="px-2 py-0.5 rounded-full bg-primary/10 text-primary font-semibold">
                          {job.type}
                        </span>
                      </div>
                      <p className="text-sm text-on-surface-variant mt-3 leading-relaxed">{job.description}</p>
                    </div>
                    <Link
                      href="/contact"
                      className="shrink-0 px-6 py-2.5 bg-gradient-to-r from-primary to-primary-container text-on-primary-fixed font-bold rounded-lg text-sm hover:scale-[1.02] transition-all shadow-lg shadow-primary/20"
                    >
                      Apply
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* CTA */}
          <section className="mt-16 glass-panel rounded-2xl p-10 text-center">
            <h3 className="text-2xl font-bold font-headline mb-3">Don&apos;t see a role that fits?</h3>
            <p className="text-on-surface-variant mb-6 max-w-md mx-auto text-sm">
              We&apos;re always looking for exceptional people. Send us your resume and tell us how you&apos;d contribute.
            </p>
            <Link
              href="/contact"
              className="inline-block px-8 py-3.5 border border-primary text-primary font-bold rounded-xl text-sm hover:bg-primary/10 transition-all"
            >
              Get in Touch
            </Link>
          </section>
        </div>
      </main>
      <Footer />
    </>
  );
}
