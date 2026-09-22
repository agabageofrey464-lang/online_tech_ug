// Titles/summaries only — the full note content lives on the SERVER and is
// fetched (gated) from /api/v1/courses/{slug}/notes. This keeps premium content
// out of the browser bundle. See apps/api/app/api/routes/courses.py.

export type NoteMeta = { n: number; title: string; summary: string };

export const courseNotes: Record<string, NoteMeta[]> = {
  "computer-basics": [
    {
      "n": 1,
      "title": "Introduction to Computers",
      "summary": "What a computer is, its types, uses and why it matters."
    },
    {
      "n": 2,
      "title": "Computer Hardware",
      "summary": "The physical parts — processor, memory, storage and devices."
    },
    {
      "n": 3,
      "title": "Software & Operating Systems",
      "summary": "System vs application software and how Windows works."
    },
    {
      "n": 4,
      "title": "Files, Folders & Storage",
      "summary": "Saving, organising and backing up your work safely."
    },
    {
      "n": 5,
      "title": "Word Processing (Microsoft Word)",
      "summary": "Create, format, and print professional documents."
    },
    {
      "n": 6,
      "title": "The Internet & Email",
      "summary": "Browse, search, use email and stay safe online."
    },
    {
      "n": 7,
      "title": "Computer Care & Security",
      "summary": "Protect against viruses, keep data safe, maintain your machine."
    },
    {
      "n": 8,
      "title": "Practical Skills & Revision",
      "summary": "Typing practice, everyday tasks, and a revision checklist."
    }
  ],
  "microsoft-office": [
    {
      "n": 1,
      "title": "Getting Started with Microsoft Office",
      "summary": "The Office suite, the ribbon interface, and skills shared by every program."
    },
    {
      "n": 2,
      "title": "Microsoft Word — Word Processing",
      "summary": "Create, format, lay out and finish professional documents."
    },
    {
      "n": 3,
      "title": "Microsoft Excel — Spreadsheets",
      "summary": "Enter data, calculate with formulas & functions, and make charts."
    },
    {
      "n": 4,
      "title": "Microsoft PowerPoint — Presentations",
      "summary": "Build and deliver clear, attractive slide shows."
    },
    {
      "n": 5,
      "title": "Microsoft Access — Databases",
      "summary": "Store and manage large sets of related records."
    },
    {
      "n": 6,
      "title": "Microsoft Publisher — Desktop Publishing",
      "summary": "Design flyers, cards, brochures and newsletters."
    }
  ],
  "internet-email": [
    {
      "n": 1,
      "title": "Understanding the Internet",
      "summary": "What the Internet is, how you connect, and key terms."
    },
    {
      "n": 2,
      "title": "Web Browsers & Searching",
      "summary": "Use a browser well and find what you need on Google."
    },
    {
      "n": 3,
      "title": "Email — Sending & Receiving",
      "summary": "Create an account and send professional messages with attachments."
    },
    {
      "n": 4,
      "title": "Online Safety, Scams & Mobile Money",
      "summary": "Protect yourself, spot scams, and transact safely."
    }
  ],
  "typing-skills": [
    {
      "n": 1,
      "title": "The Keyboard & Correct Posture",
      "summary": "Know the keyboard layout and set up to type without strain."
    },
    {
      "n": 2,
      "title": "Touch Typing — Home Row & Finger Placement",
      "summary": "The correct finger positions for typing without looking."
    },
    {
      "n": 3,
      "title": "Building Accuracy & Speed",
      "summary": "Drills and habits that grow correct, fast typing."
    }
  ],
  "microsoft-word": [
    {
      "n": 1,
      "title": "Word Basics — Typing & Editing",
      "summary": "The Word screen, entering text, and editing."
    },
    {
      "n": 2,
      "title": "Formatting & Styles",
      "summary": "Make documents neat with fonts, paragraphs, lists and styles."
    },
    {
      "n": 3,
      "title": "Layout, Tables, Pictures, Mail Merge & Printing",
      "summary": "Page setup, objects, bulk letters and finishing your document."
    }
  ],
  "microsoft-excel": [
    {
      "n": 1,
      "title": "Excel Basics — Workbook, Cells & Data",
      "summary": "The spreadsheet grid and entering data."
    },
    {
      "n": 2,
      "title": "Formulas & Functions",
      "summary": "Calculate automatically with =, SUM, AVERAGE, IF and VLOOKUP."
    },
    {
      "n": 3,
      "title": "Formatting, Sort/Filter, Charts & Printing",
      "summary": "Present and analyse data, then print it well."
    }
  ],
  "microsoft-powerpoint": [
    {
      "n": 1,
      "title": "Slides, Layouts & Themes",
      "summary": "Build the structure and look of a presentation."
    },
    {
      "n": 2,
      "title": "Content, Transitions & Animations",
      "summary": "Add text, media and gentle movement."
    },
    {
      "n": 3,
      "title": "Slide Master, Presenter View & Delivering",
      "summary": "Brand every slide and present with confidence."
    }
  ],
  "microsoft-access": [
    {
      "n": 1,
      "title": "Databases & Tables",
      "summary": "What a database is and how to store data in tables."
    },
    {
      "n": 2,
      "title": "Relationships & Queries",
      "summary": "Link tables and ask questions of your data."
    },
    {
      "n": 3,
      "title": "Forms & Reports",
      "summary": "Enter data easily and produce neat printouts."
    }
  ],
  "microsoft-publisher": [
    {
      "n": 1,
      "title": "Publisher Basics & Publications",
      "summary": "What Publisher does and how to start a design."
    },
    {
      "n": 2,
      "title": "Text & Picture Boxes, Design",
      "summary": "Place and style objects for a neat, branded look."
    },
    {
      "n": 3,
      "title": "Common Publications & Printing",
      "summary": "Design real items and prepare them for print."
    }
  ],
  "graphic-design": [
    {
      "n": 1,
      "title": "Design Foundations & Tools",
      "summary": "What graphic design is, the tools you'll use, and how designers work."
    },
    {
      "n": 2,
      "title": "Design Principles That Make Work Look Professional",
      "summary": "Balance, contrast, hierarchy, alignment and whitespace."
    },
    {
      "n": 3,
      "title": "Colour & Typography",
      "summary": "Choosing colours that work together and fonts that stay readable."
    },
    {
      "n": 4,
      "title": "Logos, Branding & Exporting Your Work",
      "summary": "Designing a real logo and delivering the right files."
    }
  ],
  "digital-marketing": [
    {
      "n": 1,
      "title": "Digital Marketing Foundations",
      "summary": "What digital marketing is, the main channels, and how to plan."
    },
    {
      "n": 2,
      "title": "Social Media & Content That Sells",
      "summary": "Building pages, creating content and growing an audience."
    },
    {
      "n": 3,
      "title": "Paid Ads & Measuring Results",
      "summary": "Running ads that make money and reading the numbers."
    }
  ],
  "cybersecurity-basics": [
    {
      "n": 1,
      "title": "Security Foundations & Passwords",
      "summary": "The threats that matter and how to lock your accounts properly."
    },
    {
      "n": 2,
      "title": "Phishing, Scams & Malware",
      "summary": "Spotting the traps and knowing what to do when infected."
    },
    {
      "n": 3,
      "title": "Protecting Your Data & Business",
      "summary": "Backups, safe browsing, privacy and securing a small business."
    }
  ],
  "web-development": [
    {
      "n": 1,
      "title": "How the Web Actually Works",
      "summary": "Clients, servers, HTTP, domains and hosting — the ground every web developer stands on."
    },
    {
      "n": 2,
      "title": "HTML — The Structure of a Page",
      "summary": "Elements, semantic markup, forms and accessibility."
    },
    {
      "n": 3,
      "title": "CSS — Making It Look Right",
      "summary": "The box model, layout with Flexbox and Grid, and responsive design."
    },
    {
      "n": 4,
      "title": "JavaScript & Dynamic Pages",
      "summary": "Variables, functions, the DOM, events and talking to a server."
    }
  ],
  "python-programming": [
    {
      "n": 1,
      "title": "Programming Foundations with Python",
      "summary": "What a program is, how Python runs, variables, types and input."
    },
    {
      "n": 2,
      "title": "Control Flow, Lists & Dictionaries",
      "summary": "Decisions, loops, and the data structures you will use daily."
    },
    {
      "n": 3,
      "title": "Functions, Files & Errors",
      "summary": "Writing reusable code, saving data, and handling what goes wrong."
    }
  ],
  "computer-networking": [
    {
      "n": 1,
      "title": "Networking Fundamentals",
      "summary": "What a network is, types, topologies and the OSI model."
    },
    {
      "n": 2,
      "title": "IP Addressing & Subnetting",
      "summary": "Addresses, classes, private ranges, DHCP, DNS and NAT."
    },
    {
      "n": 3,
      "title": "Devices, Cabling & Troubleshooting",
      "summary": "Switches, routers, Wi-Fi, cable standards and a method for finding faults."
    }
  ]
};
