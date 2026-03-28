import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';

export default function Footer() {
  return (
    <footer className="w-full pt-24 pb-12 border-t border-white/5 bg-[#0e0e0e]">
      <div className="max-w-7xl mx-auto px-8">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-12 mb-20">
          <div className="col-span-2 lg:col-span-2">
            <Link href="/" className="text-2xl font-bold tracking-tighter text-white mb-6 block font-headline">
              AiBlog
            </Link>
            <p className="text-on-surface-variant max-w-sm mb-8 leading-relaxed text-sm">
              The world's first AI-integrated editorial ecosystem designed for the next generation of professional creators and thought leaders.
            </p>
            <div className="flex gap-4">
              {/* Social Icons */}
              {['twitter', 'linkedin', 'github'].map((platform) => (
                <Button 
                  key={platform}
                  asChild
                  variant="ghost"
                  size="icon"
                  className="w-10 h-10 rounded-full bg-surface-container-high hover:bg-primary/20 hover:text-primary"
                >
                  <Link href="#">
                    <span className="material-symbols-outlined text-lg">public</span>
                  </Link>
                </Button>
              ))}
            </div>
          </div>
          
          {/* Quick Links Sections */}
          <div>
            <h6 className="text-white font-bold text-sm mb-6 uppercase tracking-widest font-headline">Company</h6>
            <ul className="space-y-4 text-sm text-on-surface-variant">
              <li><Link href="/about" className="hover:text-primary transition-colors">About Us</Link></li>
              <li><Link href="/careers" className="hover:text-primary transition-colors flex items-center gap-2">Careers <Badge variant="outline" className="bg-primary/10 text-primary text-[10px] border-transparent">Hiring</Badge></Link></li>
              <li><Link href="/contact" className="hover:text-primary transition-colors">Contact</Link></li>
              <li><Link href="/jobs" className="hover:text-primary transition-colors">Job Board</Link></li>
            </ul>
          </div>
          
          <div>
            <h6 className="text-white font-bold text-sm mb-6 uppercase tracking-widest font-headline">Support</h6>
            <ul className="space-y-4 text-sm text-on-surface-variant">
              <li><Link href="/contact" className="hover:text-primary transition-colors">Help Center</Link></li>
              <li><Link href="/community" className="hover:text-primary transition-colors">Community</Link></li>
            </ul>
          </div>

          <div>
            <h6 className="text-white font-bold text-sm mb-6 uppercase tracking-widest font-headline">Legal</h6>
            <ul className="space-y-4 text-sm text-on-surface-variant">
              <li><Link href="/privacy" className="hover:text-primary transition-colors">Privacy Policy</Link></li>
              <li><Link href="/privacy" className="hover:text-primary transition-colors">Terms of Service</Link></li>
            </ul>
          </div>
        </div>

        <Separator className="mb-8" />
        <div className="flex flex-col md:flex-row justify-between items-center gap-6">
          <span className="text-xs text-gray-600 font-medium">© 2026 AiBlog. Built with precision for the future of editorial value.</span>
          <div className="flex items-center gap-6">
            <Badge variant="outline" className="text-green-500 border-green-500/30 gap-2 font-bold uppercase tracking-widest text-[10px]">
              <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
              All Systems Operational
            </Badge>
          </div>
        </div>
      </div>
    </footer>
  );
}