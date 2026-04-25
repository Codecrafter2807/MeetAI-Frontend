# MeetAI Frontend 🎨

The modern, sleek, and highly interactive user interface for MeetAI. Built for performance and premium user experience.

## 🛠 Tech Stack

- **Framework:** [Next.js 15+](https://nextjs.org/) (App Router)
- **Styling:** [Tailwind CSS 4](https://tailwindcss.com/)
- **Components:** [Shadcn/UI](https://ui.shadcn.com/) (Radix UI)
- **Icons:** [Lucide React](https://lucide.dev/)
- **Charts:** [Recharts](https://recharts.org/)
- **State/Forms:** [React Hook Form](https://react-hook-form.com/) & [Zod](https://zod.dev/)
- **Animations:** Tailwind Animate & Custom Micro-animations

## ✨ Core Features

- **Dynamic Landing Page:** High-conversion design with smooth transitions.
- **Meeting Dashboard:** Visualized analytics and meeting history.
- **Interactive Transcript Player:** Seek through audio by clicking transcript segments.
- **Live Recording Interface:** Real-time feedback during live capture.
- **AI Feedback System:** Rate AI summaries to improve accuracy.
- **Responsive Design:** Premium experience across mobile, tablet, and desktop.
- **Dark/Light Mode:** Full support for both themes with system sync.

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn

### Installation

1. **Clone and Navigate:**
   ```bash
   cd Frontend
   ```

2. **Install Dependencies:**
   ```bash
   npm install
   ```

3. **Environment Configuration:**
   Create a `.env.local` file:
   ```env
   NEXT_PUBLIC_API_URL=http://localhost:8000
   NEXT_PUBLIC_GOOGLE_CLIENT_ID=your_google_client_id
   ```

## 🏃 Running Locally

```bash
npm run dev
```

The application will be available at [http://localhost:3000](http://localhost:3000).

## 📁 Project Structure

- `app/` - Next.js App Router (Pages, Layouts)
- `components/` - Reusable UI and layout components
- `lib/` - Utility functions and API clients
- `public/` - Static assets and logos
- `styles/` - Global CSS and Tailwind configuration
