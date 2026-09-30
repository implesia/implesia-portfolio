/** The studio site. Only pages that exist are linked. */
export const IMPLESIA = {
  home: "https://implesia.com/",
  services: "https://implesia.com/services",
  portfolio: "https://implesia.com/portfolio",
  contact: "https://implesia.com/contact",
  tagline: "Building digital products that help businesses stay ahead.",
} as const;

export const CONTACT = {
  email: "implesiaitltd@gmail.com",
  phone: "+8801516527932",
  phoneLabel: "+880 1516 527932",
  whatsapp: "https://wa.me/8801516527932",
  linkedin: "https://www.linkedin.com/company/implesia-it-ltd",
  place: "Mirpur 10, Dhaka",
} as const;

export const PRACTICE = [
  {
    index: "01",
    title: "Web platforms",
    body: "Sites, portals, and the dashboards behind them. Fast, accessible, and built to stay up.",
    tags: ["Micro-frontends", "Headless commerce", "Core Web Vitals"],
  },
  {
    index: "02",
    title: "Mobile applications",
    body: "iOS, Android, and cross-platform apps, from the prototype through the stores.",
    tags: ["Native iOS & Android", "Cross-platform", "Connected devices"],
  },
  {
    index: "03",
    title: "SaaS and cloud",
    body: "Multi-tenant products, APIs, hosting, and infrastructure that can grow with the business.",
    tags: ["Distributed systems", "API-first", "Elastic cloud"],
  },
  {
    index: "04",
    title: "UI and UX",
    body: "Research, flows, and a design system a team can actually build from.",
    tags: ["User flows", "Prototypes", "Design systems"],
  },
  {
    index: "05",
    title: "Business systems",
    body: "ERP, CRM, learning platforms, and hospital management, when the company needs its own.",
    tags: ["ERP", "CRM", "LMS", "Hospital"],
  },
  {
    index: "06",
    title: "Commerce and automation",
    body: "Stores, payments, and the workflows that should not stay manual.",
    tags: ["Stores", "Payments", "Workflows"],
  },
  {
    index: "07",
    title: "AI integrations",
    body: "Assistants, document intelligence, and AI inside a product, with a person still in charge.",
    tags: ["Assistants", "Documents", "AI in product"],
  },
  {
    index: "08",
    title: "Custom software",
    body: "When a package does not fit, we design and build the system for that business.",
    tags: ["Discovery", "Architecture", "Handover"],
  },
] as const;

/** Engineering habits listed on implesia.com/services. */
export const HABITS = [
  "Code reviews",
  "Automated testing",
  "Performance audits",
  "Security scans",
  "CI/CD pipelines",
  "Documentation first",
  "Design systems",
  "Cloud native",
  "Observability",
  "Accessibility",
] as const;

/** Figures published on implesia.com/portfolio and implesia.com/services. */
export const TALLY = [
  {
    value: "12",
    suffix: "+",
    count: true,
    label: "Live projects",
    note: "Platforms, SaaS products, and web systems running in production.",
  },
  {
    value: "8",
    suffix: "+",
    count: true,
    label: "Industry verticals",
    note: "Marketplaces, healthcare, aviation, learning, and enterprise web.",
  },
  {
    value: "2",
    suffix: "",
    count: false,
    label: "Week sprints",
    note: "A working demo at the end of every sprint.",
  },
] as const;

/** Clients named on implesia.com/services. */
export const CLIENTS = [
  {
    name: "Flyger Holidays Ltd.",
    where: "Travel technology",
    body: "Microservice platforms for learning operations and online travel agency workflows.",
    work: ["Flyger LMS", "Flyger OTA"],
  },
  {
    name: "MagicMind Ltd Co.",
    where: "California, USA",
    body: "An AI-powered learning platform: course delivery, personalization, and LMS operations at scale.",
    work: ["LMS with AI"],
  },
  {
    name: "Spyder Byte IT Ltd.",
    where: "Web and commerce",
    body: "A brand website and the e-commerce infrastructure behind it.",
    work: ["Company website", "E-commerce"],
  },
] as const;

/** The delivery method published on implesia.com. */
export const STEPS = [
  {
    index: "01",
    title: "Discovery",
    body: "Technical assessment, stakeholder alignment, and a clear scope before development begins.",
  },
  {
    index: "02",
    title: "Design",
    body: "System architecture, user flows, and high-fidelity prototypes, checked against what can be built and kept.",
  },
  {
    index: "03",
    title: "Build",
    body: "Two-week sprints with a demo at the end of each. Automated tests and CI/CD in every cycle.",
  },
  {
    index: "04",
    title: "Scale",
    body: "Load testing, observability, and tuning. Then runbooks and a handover your team can operate.",
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

/** In seat order around the figure: the first five are the left arc, top to bottom; the rest the right. */
export const QUESTIONS = [
  {
    q: "What does a project cost?",
    a: "It depends on the scope. A free discovery call comes first. Once the scope is clear, you get an estimate for exactly that work.",
    voice: "/voice/faq-06.wav?v=deep",
  },
  {
    q: "What do you actually deliver?",
    a: "The services of an IT company. Web platforms, mobile apps, SaaS and cloud, design, commerce, automation, and AI. ERP, CRM, learning systems, and hospital software. Custom work when the brief is specific.",
    voice: "/voice/faq-02.wav?v=deep",
  },
  {
    q: "What do you build with?",
    a: "Whatever fits the product. Recent work runs on Next.js, NestJS, Laravel, and Node.js, over PostgreSQL or MongoDB, with WebRTC for live calls.",
    voice: "/voice/faq-07.wav?v=deep",
  },
  {
    q: "How long does a project take?",
    a: "As long as the scope needs. Discovery sets the plan. Then the build runs in two-week sprints, with a working demo at the end of each.",
    voice: "/voice/faq-08.wav?v=deep",
  },
  {
    q: "Who do you work with?",
    a: "Companies that need software they can run. Startups and established teams, in Dhaka and beyond.",
    voice: "/voice/faq-01.wav?v=deep",
  },
  {
    q: "Is this only websites?",
    a: "No. A website is often the front door. We also ship mobile apps, cloud platforms, and the systems the business runs on.",
    voice: "/voice/faq-05.wav?v=deep",
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
    q: "Can you sign an NDA?",
    a: "Yes. An NDA is available on request, before you share the details.",
    voice: "/voice/faq-09.wav?v=deep",
  },
  {
    q: "What happens after launch?",
    a: "We load test it, watch it in production, and tune it. Then we write the runbooks and hand it over, so your team can run it.",
    voice: "/voice/faq-10.wav?v=deep",
  },
] as const;

/** One performance. Replace this file with a studio recording of the same words. */
export const STORM_LINES = ["/audio/narration/story.wav?v=deep"] as const;
