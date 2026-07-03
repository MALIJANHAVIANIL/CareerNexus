// Centralized Mock Database for CareerNexus

export const mockUsers = [
  {
    id: "user-1",
    email: "student@careernexus.com",
    name: "Alex Rivera",
    role: "student",
    title: "Computer Science Student at State University",
    avatar: "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150",
    skills: ["React", "JavaScript", "Tailwind CSS", "Node.js", "Python", "SQL"],
    education: [
      {
        degree: "Bachelor of Science in Computer Science",
        school: "State University",
        year: "2023 - 2027",
        gpa: "3.8/4.0"
      }
    ],
    experience: [],
    resumeUrl: "#",
    resumeName: "Alex_Rivera_Resume.pdf",
    savedJobs: ["job-2", "job-4"],
    appliedJobs: [
      { jobId: "job-1", status: "applied", date: "2026-06-10" },
      { jobId: "job-3", status: "shortlisted", date: "2026-06-12" }
    ]
  },
  {
    id: "user-2",
    email: "alumni@careernexus.com",
    name: "Sarah Chen",
    role: "alumni",
    title: "Senior Software Engineer at Google",
    avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150",
    skills: ["System Design", "Go", "Java", "Kubernetes", "React", "Mentorship"],
    company: "Google",
    education: [
      { degree: "M.S. in Computer Science", school: "Stanford University", year: "2018 - 2020" },
      { degree: "B.S. in Software Engineering", school: "State University", year: "2014 - 2018" }
    ],
    experience: [
      { role: "Senior Software Engineer", company: "Google", duration: "2022 - Present", description: "Tech lead for search infrastructure team." },
      { role: "Software Engineer", company: "Microsoft", duration: "2020 - 2022", description: "Worked on Azure cloud services." }
    ],
    mentorProfile: {
      bio: "Passionate about helping students transition from college to big tech. Specializing in data structures, algorithms, and system design interviews.",
      domain: "Software Engineering",
      slotsAvailable: 3,
      rating: 4.9,
      reviewsCount: 18,
      studentsMentored: 12
    }
  },
  {
    id: "user-3",
    email: "hr@careernexus.com",
    name: "Marcus Thompson",
    role: "hr",
    title: "Lead Talent Partner at Stripe",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150",
    company: "Stripe",
    skills: ["Talent Acquisition", "Technical Recruiting", "Employer Branding"],
    education: [{ degree: "B.A. in Human Resources", school: "Boston College", year: "2012 - 2016" }],
    experience: [
      { role: "Lead Talent Partner", company: "Stripe", duration: "2021 - Present" },
      { role: "Technical Recruiter", company: "Meta", duration: "2018 - 2021" }
    ]
  }
];

export const mockJobs = [
  {
    id: "job-1",
    title: "Frontend Developer Intern",
    company: "Stripe",
    logo: "S",
    logoBg: "bg-purple-600",
    location: "San Francisco, CA (Hybrid)",
    type: "Internship",
    salary: "$45 - $60 / hour",
    postedDate: "2 days ago",
    description: "Stripe is looking for a Frontend Developer Intern to join our Dashboard team. You will write clean, well-tested React code and collaborate closely with product managers and designers to build beautiful checkout workflows.",
    requirements: [
      "Proficient in HTML, CSS, and modern JavaScript",
      "Experience with React or another component-based frontend framework",
      "Strong understanding of responsive design and web accessibility",
      "Enrolled in a BS or MS program in Computer Science or equivalent"
    ],
    benefits: [
      "Competitive hourly pay",
      "Mentorship from senior engineers",
      "Housing stipend for remote work",
      "Potential for full-time return offer"
    ],
    applicantsCount: 14
  },
  {
    id: "job-2",
    title: "Software Engineer (New Grad)",
    company: "Google",
    logo: "G",
    logoBg: "bg-red-500",
    location: "Mountain View, CA (On-site)",
    type: "Full-time",
    salary: "$130,000 - $160,000 / year",
    postedDate: "5 days ago",
    description: "Join Google's engineering rotation program. Work across diverse teams from Search to Youtube. Solve complex system engineering challenges at global scale.",
    requirements: [
      "BS, MS or PhD in Computer Science or related fields graduating by Summer 2026",
      "Strong coding skills in C++, Java, Python, or Go",
      "Solid understanding of algorithms, data structures, and software engineering principles"
    ],
    benefits: [
      "Top-tier health, dental, and vision insurance",
      "Free gourmet meals and snacks on campus",
      "Generous 401(k) matching",
      "On-site gyms and wellness centers"
    ],
    applicantsCount: 45
  },
  {
    id: "job-3",
    title: "Associate Product Manager",
    company: "Atlassian",
    logo: "A",
    logoBg: "bg-blue-600",
    location: "Remote (USA)",
    type: "Full-time",
    salary: "$110,000 - $135,000 / year",
    postedDate: "1 week ago",
    description: "Atlassian is hiring for our APM program. You will lead cross-functional squads, research user behaviors, construct product backlogs, and launch features for millions of users on Jira or Confluence.",
    requirements: [
      "Excellent communication, organization, and analytical skills",
      "Demonstrated leadership ability (e.g. lead of a club, startup project, or hackathon)",
      "Technical background (CS/Engineering degree or minor) is highly preferred"
    ],
    benefits: [
      "Flexible working hours and remote setups",
      "Annual education budget of $2,000",
      "Stunning mental health and fitness benefits",
      "Unlimited paid time off"
    ],
    applicantsCount: 32
  },
  {
    id: "job-4",
    title: "Data Analyst Intern",
    company: "Airbnb",
    logo: "A",
    logoBg: "bg-rose-500",
    location: "Seattle, WA (Hybrid)",
    type: "Internship",
    salary: "$40 - $52 / hour",
    postedDate: "3 days ago",
    description: "Help guide Airbnb's host-growth strategies. You will build SQL pipelines, analyze experiment metrics, design dashboards, and present insights to executives.",
    requirements: [
      "Strong SQL skills (joins, window functions, aggregations)",
      "Familiarity with Python or R for data analysis",
      "Experience with visualization tools like Tableau or Superset"
    ],
    benefits: [
      "Travel credits for booking Airbnb stays",
      "Complimentary organic lunch options",
      "Paid sick leave and team building events"
    ],
    applicantsCount: 19
  }
];

export const mockMentors = [
  {
    id: "mentor-1",
    name: "Sarah Chen",
    title: "Senior Engineer at Google",
    company: "Google",
    avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150",
    domain: "Software Engineering",
    skills: ["System Design", "Go", "Algorithms", "Backend"],
    bio: "Ex-Microsoft. Helping juniors land FAANG roles with structured coding practice and mock interviews.",
    rating: 4.9,
    reviews: 18
  },
  {
    id: "mentor-2",
    name: "David Kim",
    title: "Product Manager at Meta",
    company: "Meta",
    avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150",
    domain: "Product Management",
    skills: ["Product Strategy", "Metrics & A/B Testing", "Resume Review", "Mock PM Interviews"],
    bio: "MBA grad from Wharton. 6+ years PM experience. I specialize in non-tech to PM transitions.",
    rating: 4.8,
    reviews: 14
  },
  {
    id: "mentor-3",
    name: "Elena Rostova",
    title: "UX Director at Figma",
    company: "Figma",
    avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150",
    domain: "UI/UX Design",
    skills: ["Figma", "Portfolio Review", "Design Systems", "Interaction Design"],
    bio: "Design advocate and advisor. Helping young design minds refine their visual portfolios.",
    rating: 5.0,
    reviews: 22
  },
  {
    id: "mentor-4",
    name: "Karan Patel",
    title: "Data Science Lead at Netflix",
    company: "Netflix",
    avatar: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150",
    domain: "Data Science",
    skills: ["SQL", "Machine Learning", "Python", "A/B Testing"],
    bio: "Passionate about causal inference and ML engineering. Helping future data scientists write cleaner code.",
    rating: 4.7,
    reviews: 11
  }
];

export const mockMentorshipRequests = [
  {
    id: "req-1",
    studentId: "user-1",
    studentName: "Alex Rivera",
    studentAvatar: "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150",
    studentTitle: "Computer Science Student at State University",
    mentorId: "user-2", // Sarah Chen
    message: "Hi Sarah! I am a junior Computer Science student focusing on backend development. I saw you work on search infrastructure at Google and would love to get your guidance on System Design concepts.",
    domain: "Software Engineering",
    status: "pending",
    date: "2026-06-16"
  }
];

export const mockInterviews = [
  {
    id: "int-1",
    company: "Google",
    role: "Software Engineer Intern",
    difficulty: "Hard",
    difficultyColor: "bg-red-100 text-red-700 border-red-200",
    authorName: "Sarah Chen",
    authorRole: "Alumni",
    date: "2026-05-15",
    content: "The interview process consisted of 1 resume screening, 1 phone screen (focused on data structures and algorithms), and 2 coding virtual rounds. Each coding round lasted 45 minutes on Google Meet.",
    questions: [
      "Given an array of integers representing the positions of trees, find the minimum distance to place k guards such that all trees are covered.",
      "Design a rate limiter that supports sliding window log algorithms."
    ],
    tips: "Focus heavily on edge cases. Always speak out loud while solving and explain your time complexity before writing a single line of code."
  },
  {
    id: "int-2",
    company: "Stripe",
    role: "Frontend Developer",
    difficulty: "Medium",
    difficultyColor: "bg-yellow-100 text-yellow-700 border-yellow-200",
    authorName: "James Carter",
    authorRole: "Alumni",
    date: "2026-06-01",
    content: "Stripe's frontend interviews are highly practical. Instead of Leetcode, they give you a real codebase (in React/JS) and ask you to fix bugs, implement features, and write unit tests.",
    questions: [
      "Implement a collapsible multi-level sidebar navigation from an API payload.",
      "Optimize a payment form component to prevent double-clicks and show instant validation errors."
    ],
    tips: "Understand React performance (re-renders, hooks like useMemo, useCallback) and make sure your UI styling looks very clean."
  },
  {
    id: "int-3",
    company: "Meta",
    role: "Product Manager",
    difficulty: "Hard",
    difficultyColor: "bg-red-100 text-red-700 border-red-200",
    authorName: "David Kim",
    authorRole: "Alumni",
    date: "2026-06-12",
    content: "Meta PM interviews look at product sense and execution. They want to hear highly structured answers that map to their goals (Community, Ads, Messaging).",
    questions: [
      "How would you improve Instagram Stories for senior citizens?",
      "Meta wants to launch a peer-to-peer marketplace inside WhatsApp. Walk through your strategy."
    ],
    tips: "Use frameworks but don't sound robotic. Always tie your metrics back to the core company mission."
  }
];

export const mockEvents = [
  {
    id: "evt-1",
    title: "Cracking the Tech Interview",
    speaker: "Sarah Chen (Google)",
    speakerTitle: "Senior Software Engineer",
    date: "June 25, 2026",
    time: "6:00 PM - 7:30 PM EST",
    type: "Webinar",
    location: "Zoom Virtual Link",
    description: "Join Sarah Chen, a senior engineer at Google, as she breaks down the exact coding interview blueprint that got her offers from Google, Microsoft, and Uber. She will solve a mock Leetcode problem live.",
    registeredUsers: ["user-1"],
    image: "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=600"
  },
  {
    id: "evt-2",
    title: "HR Panel: Fall Recruiting Trends",
    speaker: "Marcus Thompson & Friends",
    speakerTitle: "Talent Leaders at Stripe, Meta, and Netflix",
    date: "July 02, 2026",
    time: "4:00 PM - 5:30 PM EST",
    type: "Panel Discussion",
    location: "CareerNexus Auditorium & Virtual Stream",
    description: "A panel debate on what recruiters are looking for in the post-AI job landscape. Get advice on how to stand out without relying purely on high GPAs.",
    registeredUsers: [],
    image: "https://images.unsplash.com/photo-1515187029135-18ee286d815b?w=600"
  },
  {
    id: "evt-3",
    title: "Alumni Networking Mixer",
    speaker: "Hosted by CareerNexus Board",
    speakerTitle: "Alumni Association",
    date: "July 10, 2026",
    time: "7:00 PM - 9:00 PM EST",
    type: "Mixer",
    location: "Grand Ballroom, Downtown Hub",
    description: "An informal mixer for students and alumni to chat over coffee, share business cards, and discuss potential referrals in various industries.",
    registeredUsers: [],
    image: "https://images.unsplash.com/photo-1511795409834-ef04bbd61622?w=600"
  }
];

export const mockChats = [
  {
    chatId: "chat-1",
    studentId: "user-1",
    mentorId: "user-2", // Sarah Chen
    mentorName: "Sarah Chen",
    mentorAvatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150",
    mentorTitle: "Senior Engineer at Google",
    messages: [
      { senderId: "user-1", text: "Hi Sarah! Thanks for accepting my request.", timestamp: "2026-06-16T10:00:00Z" },
      { senderId: "user-2", text: "Hey Alex, nice to connect! I read your backend interest request. Let's schedule a call this weekend. What concepts are you currently studying?", timestamp: "2026-06-16T10:05:00Z" },
      { senderId: "user-1", text: "I am working through systems design: scaling databases, replication, and caching (Redis). Let me know what time works best!", timestamp: "2026-06-16T10:08:00Z" },
      { senderId: "user-2", text: "Awesome! Saturday at 11 AM EST is free. Send me a calendar invite and we'll check where your bottlenecks are.", timestamp: "2026-06-16T10:12:00Z" }
    ]
  }
];

export const mockNotifications = [
  {
    id: "notif-1",
    userId: "user-1",
    type: "job",
    title: "Application Shortlisted",
    message: "Congratulations! You have been shortlisted for Frontend Developer Intern at Stripe.",
    read: false,
    timestamp: "2 hours ago"
  },
  {
    id: "notif-2",
    userId: "user-1",
    type: "mentorship",
    title: "Mentor Approved",
    message: "Sarah Chen accepted your mentorship connection request. Open your Chat tab to begin.",
    read: false,
    timestamp: "1 day ago"
  },
  {
    id: "notif-3",
    userId: "user-1",
    type: "event",
    title: "Event Reminder",
    message: "Reminder: 'Cracking the Tech Interview' starts in 24 hours.",
    read: true,
    timestamp: "2 days ago"
  }
];
