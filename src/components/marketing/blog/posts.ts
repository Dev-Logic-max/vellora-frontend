export type Post = {
  slug: string;
  title: string;
  excerpt: string;
  category: string;
  date: string;
  author: string;
  readingTime: string;
  body: string[];
};

// PLACEHOLDER editorial content for the showcase — replace with real posts later.
export const POSTS: Post[] = [
  {
    slug: "scheduling-across-multiple-stores",
    title: "How to schedule across multiple stores without the chaos",
    excerpt:
      "Templates, coverage rules, and shift transfers that keep every location staffed — with less back-and-forth.",
    category: "Operations",
    date: "2026-05-28",
    author: "A. Rivera",
    readingTime: "6 min read",
    body: [
      "Running schedules for one store is hard enough. Across five or ten, the spreadsheet approach breaks down fast: versions drift, managers double-book, and nobody trusts the numbers.",
      "The fix isn't more meetings — it's reusable structure. Start from weekly templates per store, layer in coverage rules so understaffed shifts surface automatically, and make transfers a one-tap action instead of a group-chat negotiation.",
      "When the schedule becomes the single source of truth, managers stop reconciling and start managing. That's the difference between software that records work and software that removes it.",
    ],
  },
  {
    slug: "qr-attendance-that-actually-works",
    title: "QR attendance that actually works for frontline teams",
    excerpt:
      "Why store-bound QR clock-in beats honor-system timesheets — and how to keep it tamper-resistant.",
    category: "Attendance",
    date: "2026-05-14",
    author: "J. Chen",
    readingTime: "5 min read",
    body: [
      "Paper sign-in sheets and manual timesheets share one flaw: they're guesses. Hours get rounded, breaks get forgotten, and payroll inherits the errors.",
      "Store-bound QR clock-in turns attendance into data. Staff scan a code tied to the location, and timesheets build themselves — accurate to the minute, with anomalies flagged for review.",
      "The result is faster payroll prep and fewer disputes, because everyone is looking at the same trustworthy record.",
    ],
  },
  {
    slug: "multi-tenant-security-explained",
    title: "Multi-tenant security, explained for HR leaders",
    excerpt:
      "What row-level security really means, and why app-layer isolation alone isn't enough.",
    category: "Security",
    date: "2026-04-30",
    author: "M. Okafor",
    readingTime: "7 min read",
    body: [
      "When one platform serves many companies, the most important promise is isolation: your data is yours, and no other tenant can ever see it.",
      "App-layer checks help, but they're a single point of failure. Defense-in-depth adds row-level security at the database, so even a bug in application code can't leak data across tenants.",
      "Pair that with role-based access and private document storage, and isolation stops being a hope and becomes an architectural guarantee.",
    ],
  },
  {
    slug: "leave-management-without-the-paperwork",
    title: "Leave management without the paperwork",
    excerpt: "Policies, balances, and approval chains that route requests to the right person.",
    category: "People",
    date: "2026-04-12",
    author: "S. Park",
    readingTime: "4 min read",
    body: [
      "Time-off requests get lost in inboxes because the process lives in inboxes. Move it into a system with clear policies and balances, and the friction disappears.",
      "Configurable approval chains mean each request reaches the right manager automatically, with accruals and public holidays handled for you.",
      "Less chasing, fewer mistakes, and a record everyone can rely on at review time.",
    ],
  },
  {
    slug: "hiring-for-stores-at-scale",
    title: "Hiring for stores at scale with a built-in ATS",
    excerpt:
      "From job post to onboarded hire — one pipeline, one careers site, far less spreadsheet.",
    category: "Recruiting",
    date: "2026-03-25",
    author: "L. Romano",
    readingTime: "6 min read",
    body: [
      "Frontline hiring is high-volume and time-sensitive. Every day a shift goes unfilled is a day of lost coverage.",
      "A built-in ATS keeps jobs, candidates, and interviews in one pipeline, with a public careers site so applicants never hit a dead end.",
      "Tie it to onboarding templates and a new hire is productive on day one — not buried in forms.",
    ],
  },
  {
    slug: "designing-a-themeable-design-system",
    title: "Designing a themeable design system from day one",
    excerpt: "How tokens make re-theming a swap of values instead of a rewrite of components.",
    category: "Design",
    date: "2026-03-08",
    author: "D. Müller",
    readingTime: "5 min read",
    body: [
      "If you want a product to feel premium and stay flexible, commit to design tokens early. Every color, radius, and font becomes a variable, not a hardcoded value.",
      "With that foundation, adding a new theme is a token file — not a sweep through hundreds of components. Light, dark, and brand variants come almost for free.",
      "It's the simplest lever for a UI that looks intentional today and adapts effortlessly tomorrow.",
    ],
  },
];

export function getPost(slug: string): Post | undefined {
  return POSTS.find((post) => post.slug === slug);
}

export function formatDate(date: string): string {
  return new Date(date).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}
