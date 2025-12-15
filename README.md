# Cal Poly Clubs

> The unofficial pulse of campus life at California Polytechnic State University

<div align="center">

![Next.js](https://img.shields.io/badge/Next.js-16.0-black?style=flat&logo=next.js)
![React](https://img.shields.io/badge/React-19.2-blue?style=flat&logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?style=flat&logo=typescript)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-4.0-38bdf8?style=flat&logo=tailwindcss)
![Supabase](https://img.shields.io/badge/Supabase-PostgreSQL-3ecf8e?style=flat&logo=supabase)

</div>

---

## Overview

**Cal Poly Clubs** is an unofficial, student-driven directory and review platform for Cal Poly clubs and organizations. Built to empower students with transparent, peer-generated insights, this platform lets you discover, explore, and share honest feedback about campus organizations through real student reviews.

Unlike official channels, Cal Poly Clubs provides unfiltered perspectives on what it's really like to be part of a club—the time commitment, the social atmosphere, and the career value—all through anonymous student reviews.

---

## Features

### 🔍 **Club Discovery**

- **Comprehensive Directory** – Browse 486 Cal Poly clubs and organizations
- **Smart Search** – Full-text search with 300ms debouncing for instant results
- **Category Filtering** – Dynamically generated filters based on top 10 club categories
- **Trending Section** – Featured showcase of top 3 clubs by review count
- **Infinite Scroll** – Load more clubs with smooth pagination

### ⭐ **Review System**

- **5-Star Rating** – Interactive rating with half-star precision
- **Vibe Check™ Metrics** – Three-dimensional club assessment:
  - 🎉 **Social Atmosphere** (Strict → Party)
  - 📚 **Workload Intensity** (None → Intense)
  - 💼 **Career Value** (None → High)
- **Anonymous Reviews** – No login required, completely anonymous
- **Written Feedback** – Optional detailed review text with major field
- **One Review Per Device** – Smart localStorage tracking prevents spam
- **Review Flagging** – Community moderation with reporting system
- **Real-time Toast Notifications** – Instant feedback for user actions

### 📊 **Club Analytics**

- **Aggregate Statistics** – Real-time calculation of average ratings and vibe metrics
- **Visual Vibe Bars** – Color-coded percentage bars for each dimension
- **Review Count Display** – Transparent community engagement metrics
- **Star Visualization** – At-a-glance rating display on club cards and detail pages

### 🎨 **User Experience**

- **Responsive Design** – Seamless experience from mobile to desktop
- **Framer Motion Animations** – Smooth transitions and hover effects
- **Modal Strategy** – Desktop dialog modals and mobile bottom drawers
- **Sticky Navigation** – Dynamic header with club breadcrumbs
- **Empty States** – Contextual messages when no results found
- **Cal Poly Branding** – Official Poly Green (#154734) and Gold (#C69214) colors

---

## Tech Stack

### **Frontend**
- **Framework**: [Next.js 16.0](https://nextjs.org/) with App Router
- **UI Library**: [React 19.2](https://react.dev/)
- **Language**: [TypeScript 5](https://www.typescriptlang.org/)
- **Styling**: [Tailwind CSS v4](https://tailwindcss.com/)
- **Component Library**: [shadcn/ui](https://ui.shadcn.com/) (Radix UI primitives)
- **Animations**: [Framer Motion 12.23](https://www.framer.com/motion/)
- **Icons**: [Lucide React](https://lucide.dev/)
- **Notifications**: [Sonner](https://sonner.emilkowal.ski/)

### **Backend & Database**
- **Database**: [Supabase PostgreSQL](https://supabase.com/)
- **Static Data**: JSON file with 1000+ club records from CampusLabs API
- **Real-time Queries**: Direct Supabase client integration
- **Authentication**: None (anonymous reviews)

### **Utilities**
- **Class Management**: clsx + tailwind-merge
- **Date Formatting**: Native JavaScript Date API
- **Responsive Hooks**: Custom `useMediaQuery` hook
- **Debouncing**: Custom React hook with 300ms delay

---

## Project Structure

```
calpoly-clubs/
├── app/
│   ├── club/
│   │   └── [id]/
│   │       └── page.tsx          # Dynamic club detail pages (SSG)
│   ├── page.tsx                  # Home page with directory listing
│   ├── layout.tsx                # Root layout with header/footer/toaster
│   ├── globals.css               # Global styles + Cal Poly theme
│   └── icon.tsx                  # App icon component
│
├── components/
│   ├── ui/                       # shadcn UI components
│   │   ├── badge.tsx
│   │   ├── button.tsx
│   │   ├── card.tsx
│   │   ├── dialog.tsx
│   │   ├── drawer.tsx
│   │   ├── input.tsx
│   │   ├── scroll-area.tsx
│   │   ├── separator.tsx
│   │   ├── slider.tsx
│   │   └── textarea.tsx
│   ├── ClubCard.tsx              # Reusable club card component
│   ├── Logo.tsx                  # Cal Poly Clubs logo
│   ├── ReviewForm.tsx            # Review submission form with vibe checks
│   ├── ReviewItem.tsx            # Individual review display card
│   ├── ResponsiveReview.tsx      # Responsive modal wrapper
│   └── SiteHeader.tsx            # Fixed navigation header
│
├── hooks/
│   └── use-media-query.ts        # Responsive breakpoint detection hook
│
├── lib/
│   ├── clubs.json                # Static club data (727KB, 1000+ clubs)
│   ├── data.ts                   # Data fetching utilities
│   ├── supabase.ts               # Supabase client initialization
│   ├── types.ts                  # TypeScript interface definitions
│   └── utils.ts                  # Utility functions (cn, etc.)
│
├── tailwind.config.js            # Tailwind CSS configuration
├── postcss.config.mjs            # PostCSS configuration
├── tsconfig.json                 # TypeScript configuration
├── next.config.ts                # Next.js configuration
├── components.json               # shadcn CLI configuration
└── package.json                  # Project dependencies
```

---

## Database Schema

### **reviews** table (Supabase PostgreSQL)

| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID | Primary key (auto-generated) |
| `club_id` | string | References club ID from static JSON |
| `rating` | integer (1-5) | Star rating |
| `vibe_social` | integer (0-100) | Social atmosphere score |
| `vibe_workload` | integer (0-100) | Workload intensity score |
| `vibe_value` | integer (0-100) | Career value score |
| `text_content` | text | Written review body (optional) |
| `user_major` | text | Student major (optional) |
| `created_at` | timestamp | Submission timestamp |
| `is_flagged` | boolean | Moderation flag status |

### **Club** interface (Static JSON)

```typescript
interface Club {
  Id: string;                    // Unique identifier
  Name: string;                  // Full organization name
  ShortName?: string;            // Abbreviated name
  Description?: string;          // HTML-formatted description
  Summary?: string;              // Plain text summary
  ProfilePicture?: string;       // Image file ID for CampusLabs CDN
  CategoryNames?: string[];      // Classification tags
  WebsiteKey?: string;           // Slug for official Cal Poly page
}
```

### **Database Functions**

- `mark_review_flagged(row_id: UUID)` – RPC function for flagging reviews (prevents double-flagging)

---

## Installation & Setup

### Prerequisites

- Node.js 20+ and npm
- Supabase account (free tier works)
- Git

### 1. Clone the Repository

```bash
git clone https://github.com/yourusername/calpoly-clubs.git
cd calpoly-clubs
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Set Up Environment Variables

Create a `.env.local` file in the root directory:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

**Get your Supabase credentials:**
1. Create a project at [supabase.com](https://supabase.com)
2. Go to Project Settings → API
3. Copy the URL and `anon` public key

### 4. Set Up Database

Create the `reviews` table in your Supabase database:

```sql
CREATE TABLE reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  club_id TEXT NOT NULL,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  vibe_social INTEGER DEFAULT 50 CHECK (vibe_social >= 0 AND vibe_social <= 100),
  vibe_workload INTEGER DEFAULT 50 CHECK (vibe_workload >= 0 AND vibe_workload <= 100),
  vibe_value INTEGER DEFAULT 50 CHECK (vibe_value >= 0 AND vibe_value <= 100),
  text_content TEXT,
  user_major TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  is_flagged BOOLEAN DEFAULT FALSE
);

-- Enable Row Level Security (optional, for public read access)
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;

-- Allow public read access
CREATE POLICY "Allow public read access" ON reviews
  FOR SELECT USING (true);

-- Allow public insert access (anonymous reviews)
CREATE POLICY "Allow public insert access" ON reviews
  FOR INSERT WITH CHECK (true);
```

Create the flagging RPC function:

```sql
CREATE OR REPLACE FUNCTION mark_review_flagged(row_id UUID)
RETURNS VOID AS $$
BEGIN
  UPDATE reviews SET is_flagged = TRUE WHERE id = row_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

### 5. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### 6. Build for Production

```bash
npm run build
npm start
```

---

## Development

### Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server on port 3000 |
| `npm run build` | Build production bundle |
| `npm start` | Start production server |
| `npm run lint` | Run ESLint for code quality |

### Key Development Files

- **`app/page.tsx`** – Main directory page (client component)
- **`app/club/[id]/page.tsx`** – Club detail pages (server component with SSG)
- **`components/ReviewForm.tsx`** – Review submission logic
- **`lib/data.ts`** – Club data fetching utilities
- **`lib/supabase.ts`** – Supabase client configuration

### Adding New UI Components

This project uses shadcn/ui. To add components:

```bash
npx shadcn@latest add [component-name]
```

Example:
```bash
npx shadcn@latest add dropdown-menu
```

---

## Deployment

### Vercel (Recommended)

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new)

1. Push your code to GitHub
2. Import the repository in Vercel
3. Add environment variables in Vercel dashboard
4. Deploy!

### Environment Variables for Production

Set these in your hosting platform:

```
NEXT_PUBLIC_SUPABASE_URL=your_production_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_production_supabase_anon_key
```

### Build Configuration

- **Output**: Static + Server rendering (hybrid)
- **Static Generation**: All club detail pages pre-rendered at build time
- **ISR**: Not currently configured (can be added with `revalidate`)
- **Image Optimization**: Uses Next.js Image component for CampusLabs CDN images

---

## Key Features Explained

### Smart Review Tracking

Reviews are tracked per device using `localStorage`:

```typescript
// Prevent multiple reviews from same device
localStorage.setItem(`reviewed_club_${clubId}`, reviewId);

// Verify review still exists in database before blocking
const { data } = await supabase
  .from("reviews")
  .select("id")
  .eq("id", localReviewId)
  .single();
```

This ensures:
- One review per device
- If a review is deleted by moderators, users can review again
- No authentication required

### Responsive Modal Strategy

Desktop and mobile users get optimized experiences:

```typescript
const isDesktop = useMediaQuery("(min-width: 768px)");

if (isDesktop) {
  return <Dialog>...</Dialog>;  // Modal overlay
} else {
  return <Drawer>...</Drawer>;  // Bottom sheet
}
```

### Real-time Statistics

All ratings are calculated on-the-fly:

```typescript
const stats = {
  rating: (totalRating / reviewCount).toFixed(1),
  social: Math.round(totalSocial / reviewCount),
  workload: Math.round(totalWorkload / reviewCount),
  value: Math.round(totalValue / reviewCount),
};
```

No pre-computed ratings in the database means stats are always up-to-date.

### Debounced Search

Search waits 300ms after the last keystroke before filtering:

```typescript
function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);
  useEffect(() => {
    const handler = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(handler);
  }, [value, delay]);
  return debouncedValue;
}
```

This prevents excessive re-renders and improves performance.

---

## Design System

### Cal Poly Brand Colors

```css
--color-poly-green: #154734;   /* Primary brand color */
--color-poly-gold: #C69214;    /* Accent/star color */
--color-poly-cream: #F4F1EA;   /* Background alternative */
--color-poly-clay: #EAD9C2;    /* Neutral alternative */
```

### Typography

- **Sans Serif**: Inter (body text)
- **Serif**: Source Serif 4 (headings, branded text)

### Component Patterns

- **Cards**: Rounded corners with subtle shadows
- **Buttons**: Primary (Poly Green), Secondary (outline), Ghost variants
- **Modals**: Backdrop blur with smooth animations
- **Badges**: Pill-shaped category tags
- **Stars**: Filled gold for ratings, outlined gray for empty

---

## Contributing

This is a personal project, but contributions are welcome! Here's how:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Contribution Guidelines

- Follow existing code style (TypeScript, Tailwind utilities)
- Write descriptive commit messages
- Test on both mobile and desktop
- Ensure no TypeScript errors (`npm run build`)
- Update documentation if adding new features

---

## Roadmap

- [ ] User authentication for review management
- [ ] Edit/delete own reviews
- [ ] Advanced filtering (by rating, vibe metrics)
- [ ] Sort options (newest, highest rated, most reviews)
- [ ] Club comparison tool
- [ ] Export reviews to PDF
- [ ] Admin dashboard for moderation
- [ ] Email notifications for flagged reviews
- [ ] Rate limiting for review submissions
- [ ] Dark mode support

---

## FAQ

### How often is club data updated?
Club data is sourced from the CampusLabs API and stored statically in `lib/clubs.json`. Updates require manual refresh and rebuild.

### Are reviews really anonymous?
Yes, completely. No user authentication or tracking beyond device-level (localStorage). Reviews cannot be traced to individuals.

### Can I delete my review?
Currently, no. Reviews are anonymous and device-tracked only. Future versions will add user accounts for review management.

### How do you prevent spam reviews?
Reviews are limited to one per device per club using localStorage. The system verifies the review still exists in the database before blocking new submissions.

### What happens when I flag a review?
Flagged reviews are marked in the database with `is_flagged: true`. They remain visible to users but can be filtered/reviewed by moderators in the database.

### Is this affiliated with Cal Poly?
No, this is an independent student project. It's not officially associated with California Polytechnic State University.

---

## License

This project is open source and available under the [MIT License](LICENSE).

---

## Acknowledgments

- **Cal Poly** – For providing the inspiration and the amazing campus community
- **CampusLabs** – For the club data via their API
- **shadcn** – For the beautiful component library
- **Vercel** – For Next.js and deployment platform
- **Supabase** – For the database and real-time functionality

---

<div align="center">

**Made with 💚 by [Benjamin Garcia](https://bentgarcia.com)**

</div>
