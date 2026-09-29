export const CONTACT = {
  email: "implesiaitltd@gmail.com",
  whatsapp: "https://wa.me/8801516527932",
  linkedin: "https://www.linkedin.com/company/implesia-it-ltd",
} as const;

export const PRACTICE = [
  {
    index: "01",
    title: "Product platforms",
    body: "Public sites plus the dashboards behind them. Role-based, multi-tenant, built to be operated.",
  },
  {
    index: "02",
    title: "Marketplaces",
    body: "Listings, search, lead flow, and the transactions that have to stay understandable.",
  },
  {
    index: "03",
    title: "Learning systems",
    body: "Academies and corporate LMS products: courses, progress, assessments, admin reporting.",
  },
  {
    index: "04",
    title: "Real-time care",
    body: "Scheduling, messaging, and live consultation where delay is not a detail.",
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
    kind: "Marketplace",
    title: "Gulf Franchise",
    body: "Franchise discovery across the Gulf — listings, search, and lead management.",
    stack: "Next.js · Laravel",
    image: "/work-gulf.png",
    href: "https://gulffranchisehub.com/",
  },
  {
    year: "2026",
    kind: "SaaS",
    title: "Flyger Academy",
    body: "Aviation academy with instructor, student, and admin dashboards on a multi-tenant setup.",
    stack: "Next.js · NestJS · PostgreSQL",
    image: "/work-academy.png",
  },
  {
    year: "2025",
    kind: "Healthcare",
    title: "Telemedicine",
    body: "Appointments, WebRTC consultations, and patient messaging over WebSocket.",
    stack: "Next.js · NestJS · WebRTC",
    image: "/work-telemedicine.png",
  },
  {
    year: "2026",
    kind: "Learning",
    title: "Arong LMS",
    body: "Corporate learning: courses, progress, assessments, and admin reporting.",
    stack: "Next.js · NestJS · PostgreSQL",
    image: "/work-lms.png",
  },
  {
    year: "2025",
    kind: "Web",
    title: "Baby Grow",
    body: "A parenting guide for UK families — milestones, content, and early-stage childcare.",
    stack: "Next.js · Node.js · MongoDB",
    image: "/work-babygrow.png",
    href: "https://www.thebabygrow.co.uk/",
  },
  {
    year: "2026",
    kind: "Travel",
    title: "Flyger OTA",
    body: "Flight discovery and booking for an online travel agency.",
    stack: "Next.js · Node.js · PostgreSQL",
    image: "/work-ota.png",
  },
];

export const QUESTIONS = [
  {
    q: "Who do you work with?",
    a: "Teams who need software that carries revenue, reputation, or daily operations. Startups and established companies. The common bar is that the system must hold.",
    voice: "/voice/faq-01.wav?v=shade",
  },
  {
    q: "What do you actually deliver?",
    a: "Product platforms, marketplaces, learning systems, and operational tools. Implesia IT designs and ships them — web applications, the services behind them, and the delivery around both.",
    voice: "/voice/faq-02.wav?v=shade",
  },
  {
    q: "Where are you based?",
    a: "Dhaka, Bangladesh. Mirpur. Clients are not limited to one market.",
    voice: "/voice/faq-03.wav?v=shade",
  },
  {
    q: "How does a project start?",
    a: "A conversation about the stakes, the users, and what must not fail. Then scope, architecture, and a delivery plan we can both stand behind.",
    voice: "/voice/faq-04.wav?v=shade",
  },
  {
    q: "Is this only websites?",
    a: "No. A public site is often the front door. The work behind it is dashboards, APIs, data, and the operations a team has to live with after launch.",
    voice: "/voice/faq-05.wav?v=shade",
  },
] as const;

export const STORM_LINES = [
  "/voice/line-01.wav?v=shade",
  "/voice/line-02.wav?v=shade",
  "/voice/line-03.wav?v=shade",
  "/voice/line-04.wav?v=shade",
  "/voice/line-05.wav?v=shade",
  "/voice/line-06.wav?v=shade",
  "/voice/line-07.wav?v=shade",
  "/voice/line-08.wav?v=shade",
  "/voice/line-09.wav?v=shade",
  "/voice/line-10.wav?v=shade",
] as const;
