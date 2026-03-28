# AiBlog - Quick Start Guide

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ installed
- npm or yarn package manager
- Git (optional)

### Installation Steps

1. **Navigate to the project directory**
   ```bash
   cd aiblog
   ```

2. **Fix npm permissions issue (one-time)**
   ```bash
   npm config set legacy-peer-deps true
   ```

3. **Install dependencies**
   ```bash
   npm install
   ```

4. **Start development server**
   ```bash
   npm run dev
   ```

5. **Open in browser**
   - Navigate to `http://localhost:3000`
   - You should see the AiBlog landing page

## 📁 Project Structure

### Key Directories
- `/app` - Next.js pages and layouts
- `/components` - Reusable React components
- `/context` - Global state management
- `/public` - Static assets

### Important Files
- `tailwind.config.ts` - Design system configuration
- `tsconfig.json` - TypeScript settings
- `next.config.ts` - Next.js configuration
- `package.json` - Dependencies and scripts

## 🎨 Design System

### Colors (from Tailwind config)
```
Primary: #85adff (Electric Blue)
Secondary: #c180ff (Purple)
Background: #0e0e0e (Deep Navy)
```

### Fonts
- **Manrope** - Headings and large text
- **Inter** - Body text and labels

### Custom Utilities
- `.glass-panel` - Glassmorphic effect
- `.text-gradient` - Gradient text
- `.button-primary` - Primary button style

## 🔧 Common Commands

```bash
# Development
npm run dev              # Start dev server (http://localhost:3000)

# Building
npm run build            # Build for production
npm run start            # Run production build

# Code Quality
npm run lint             # Run ESLint

# Cleanup
npm run clean            # Remove build files
```

## 📄 Pages Overview

### Landing Page (`/`)
- Hero section
- Platform statistics
- Featured stories
- Call-to-action buttons

### Dashboard (`/dashboard`)
- Analytics cards (views, engagement, followers)
- Recent activity timeline
- Career milestones
- AI insights

### Editor (`/editor`)
- Distraction-free writing canvas
- Formatting toolbar
- AI Assistant sidebar
- Word counter

### Community (`/community`)
- Post feed
- Category filters
- Author profiles
- Career mentor spotlight

## 🧩 Component Guide

### TopNavBar
```typescript
import TopNavBar from "@/components/TopNavBar";

<TopNavBar currentPage="dashboard" />
```

### SideNavBar
```typescript
import SideNavBar from "@/components/SideNavBar";

<SideNavBar activePage="dashboard" />
```

### StatCard
```typescript
import StatCard from "@/components/StatCard";

<StatCard
  icon="views"
  label="Weekly Views"
  value="124.8K"
  change="+12.5%"
  changeColor="green"
/>
```

### PostCard
```typescript
import PostCard from "@/components/PostCard";

<PostCard
  title="How to Build with AI"
  excerpt="A guide to integrating AI into your workflow..."
  category="Tech"
  categoryColor="primary"
  author="Jane Doe"
  authorRole="Tech Educator"
  image="/post-image.jpg"
  views={2450}
  likes={142}
  comments={38}
  readTime="5 min"
/>
```

## 🎯 State Management

### Using App Context
```typescript
"use client";

import { useApp } from "@/context/AppContext";

export default function MyComponent() {
  const { activeNav, setActiveNav, isDarkMode } = useApp();

  return (
    <button onClick={() => setActiveNav("dashboard")}>
      Go to Dashboard
    </button>
  );
}
```

### Available Context Values
- `activeNav` - Current active page
- `setActiveNav` - Update active page
- `isDarkMode` - Theme state
- `setIsDarkMode` - Toggle theme
- `userStats` - User statistics object

## 🎨 Styling Guidelines

### Tailwind Classes Pattern
```typescript
// Mobile-first approach
<div className="
  px-4 py-2           // Base mobile styles
  md:px-6 md:py-4     // Tablet adjustments
  lg:px-8 lg:py-6     // Desktop adjustments
  dark:bg-zinc-900    // Dark mode
  hover:scale-105     // Hover effects
  transition-all      // Smooth transitions
">
  Content
</div>
```

### Custom Utilities
```typescript
// Glass panel effect
<div className="glass-panel">
  Glassmorphic content
</div>

// Gradient text
<h1 className="text-gradient">
  Gradient heading
</h1>

// Primary button
<button className="button-primary">
  Click me
</button>
```

## 🔐 Environment Variables

Create a `.env.local` file in the project root for environment secrets:

```bash
# .env.local (not committed to git)
NEXT_PUBLIC_API_URL=http://localhost:3000/api
DATABASE_URL=your_mongodb_connection_string
```

## 📱 Responsive Design

### Breakpoints
- **Mobile (0px)** - Default/base styles
- **Tablet (768px+)** - `md:` prefix
- **Desktop (1024px+)** - `lg:` prefix
- **Large (1280px+)** - `xl:` prefix

### Testing Responsive Design
1. Open DevTools (F12 or Cmd+Option+I)
2. Click device toggle button
3. Select different devices or sizes
4. Test navigation and layout

## 🐛 Troubleshooting

### npm install fails
```bash
# Try the fix
npm config set legacy-peer-deps true
npm install --force
```

### Port 3000 already in use
```bash
# Use different port
npm run dev -- -p 3001
```

### TypeScript errors
- Check that your component has a Props interface
- Verify all function return types
- Use strict null checking

### Styling not applying
- Clear browser cache (Cmd+Shift+Delete)
- Restart dev server
- Check dark class on html element
- Verify Tailwind config includes your file path

## 📚 Additional Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [React Documentation](https://react.dev)
- [Tailwind CSS Docs](https://tailwindcss.com/docs)
- [TypeScript Handbook](https://www.typescriptlang.org/docs)
- [Framer Motion Docs](https://www.framer.com/motion)

## 🎯 Next Steps

1. **Explore the code** - Read through components and pages
2. **Modify styling** - Update `tailwind.config.ts` colors or fonts
3. **Add new pages** - Create new route in `/app`
4. **Integrate database** - Set up MongoDB connection
5. **Add authentication** - Implement NextAuth.js or similar
6. **Deploy** - Push to Vercel or your hosting platform

## 💡 Tips & Tricks

### Hot Reload
- Changes to files automatically reload in browser
- No need to restart dev server

### Viewing Tailwind Classes
- Inspect element in DevTools
- Look for generated classes in HTML

### Component Reusability
- Keep components small and focused
- Use Props interfaces for flexibility
- Leverage composition over inheritance

### Performance Optimization
- Use `next/image` for images
- Lazy load heavy components
- Code split with `dynamic()`

---

**Ready to start building? Run `npm run dev` and visit http://localhost:3000!** 🎉
