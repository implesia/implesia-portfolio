export const CONTACT = {
  email: "implesiaitltd@gmail.com",
  whatsapp: "https://wa.me/8801516527932",
  linkedin: "https://www.linkedin.com/company/implesia-it-ltd",
} as const;

export const PRACTICE = [
  {
    index: "01",
    title: "Web platforms",
    body: "Sites, portals, and the dashboards behind them. Fast, accessible, and built to stay up.",
  },
  {
    index: "02",
    title: "Mobile applications",
    body: "iOS, Android, and cross-platform apps, from the prototype through the stores.",
  },
  {
    index: "03",
    title: "SaaS and cloud",
    body: "Multi-tenant products, APIs, hosting, and infrastructure that can grow with the business.",
  },
  {
    index: "04",
    title: "UI and UX",
    body: "Research, flows, and a design system a team can actually build from.",
  },
  {
    index: "05",
    title: "Business systems",
    body: "ERP, CRM, learning platforms, and hospital management, when the company needs its own.",
  },
  {
    index: "06",
    title: "Commerce and automation",
    body: "Stores, payments, and the workflows that should not stay manual.",
  },
  {
    index: "07",
    title: "AI integrations",
    body: "Assistants, document intelligence, and AI inside a product, with a person still in charge.",
  },
  {
    index: "08",
    title: "Custom software",
    body: "When a package does not fit, we design and build the system for that business.",
  },
] as const;

export type WorkItem = {
  year: string;
  kind: string;
  title: string;
  body: string;
  stack: string;
  image: string;
  href?: string;
};

export const WORK: WorkItem[] = [
  {
    year: "2025",
    kind: "Web platform",
    title: "Gulf Franchise",
    body: "A franchise marketplace for the Gulf — listings, search, and lead management.",
    stack: "Next.js · Laravel",
    image: "/work-gulf.png",
    href: "https://gulffranchisehub.com/",
  },
  {
    year: "2026",
    kind: "LMS",
    title: "Flyger Academy",
    body: "An aviation academy: instructor, student, and admin dashboards on a multi-tenant setup.",
    stack: "Next.js · NestJS · PostgreSQL",
    image: "/work-academy.png",
  },
  {
    year: "2025",
    kind: "Hospital",
    title: "Telemedicine",
    body: "Appointments, live consultations, and patient messaging for a care team.",
    stack: "Next.js · NestJS · WebRTC",
    image: "/work-telemedicine.png",
  },
  {
    year: "2026",
    kind: "LMS",
    title: "Arong LMS",
    body: "Corporate learning: courses, progress, assessments, and reporting for admins.",
    stack: "Next.js · NestJS · PostgreSQL",
    image: "/work-lms.png",
  },
  {
    year: "2025",
    kind: "Web platform",
    title: "Baby Grow",
    body: "A parenting guide for UK families — milestones, content, and early childcare.",
    stack: "Next.js · Node.js · MongoDB",
    image: "/work-babygrow.png",
    href: "https://www.thebabygrow.co.uk/",
  },
  {
    year: "2026",
    kind: "Custom software",
    title: "Flyger OTA",
    body: "Flight discovery and booking, built for an online travel agency.",
    stack: "Next.js · Node.js · PostgreSQL",
    image: "/work-ota.png",
  },
];

export const QUESTIONS = [
  {
    q: "Who do you work with?",
    a: "Companies that need software they can run. Startups and established teams, in Dhaka and beyond.",
    voice: "/voice/faq-01.wav?v=deep",
  },
  {
    q: "What do you actually deliver?",
    a: "The services of an IT company. Web platforms, mobile apps, SaaS and cloud, design, commerce, automation, and AI. ERP, CRM, learning systems, and hospital software. Custom work when the brief is specific.",
    voice: "/voice/faq-02.wav?v=deep",
  },
  {
    q: "Where are you based?",
    a: "Dhaka, Bangladesh. Mirpur 10. The work is not limited to one market.",
    voice: "/voice/faq-03.wav?v=deep",
  },
  {
    q: "How does a project start?",
    a: "Discovery first: the users, the scope, and what must not fail. Then architecture, a build you can see, and a handover your team can operate.",
    voice: "/voice/faq-04.wav?v=deep",
  },
  {
    q: "Is this only websites?",
    a: "No. A website is often the front door. We also ship mobile apps, cloud platforms, and the systems the business runs on.",
    voice: "/voice/faq-05.wav?v=deep",
  },
] as const;

/** One performance. Replace this file with a studio recording of the same words. */
export const STORM_LINES = ["/audio/narration/story.wav?v=deep"] as const;
