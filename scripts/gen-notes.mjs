// Generate simple one-page PDF course notes into apps/web/public/courses/.
import fs from "node:fs";
import path from "node:path";

const OUT = "e:/Projects/onlinetech_ug/apps/web/public/courses";
fs.mkdirSync(OUT, { recursive: true });

const COURSES = {
  "computer-basics": {
    title: "Computer Basics for Everyone",
    lessons: [
      "Meet the computer: parts & switching on (8 min)",
      "Using the mouse & keyboard confidently (15 min)",
      "The desktop, windows & menus (18 min)",
      "Files & folders: save, find, organise (25 min)",
      "Typing your first document (30 min)",
      "Getting online safely (22 min)",
    ],
  },
  "microsoft-office": {
    title: "Microsoft Office Mastery",
    lessons: [
      "Word: formatting professional documents (35 min)",
      "Word: tables, images & printing (28 min)",
      "Excel: rows, columns & basic formulas (40 min)",
      "Excel: charts & simple budgets (45 min)",
      "PowerPoint: building a slide deck (30 min)",
      "PowerPoint: animations & presenting (20 min)",
    ],
  },
  "internet-email": {
    title: "Internet, Email & Online Safety",
    lessons: [
      "How the internet & browsers work (10 min)",
      "Searching Google like a pro (14 min)",
      "Creating & using email (22 min)",
      "Mobile Money safety (16 min)",
      "Spotting scams & staying safe (18 min)",
    ],
  },
  "typing-skills": {
    title: "Fast & Accurate Typing",
    lessons: [
      "Home row & correct finger placement (9 min)",
      "Top & bottom rows (12 min)",
      "Numbers & symbols (15 min)",
      "Speed drills & accuracy (20 min)",
      "Real-world typing practice (25 min)",
    ],
  },
};

const esc = (s) => s.replace(/\\/g, "\\\\").replace(/\(/g, "\\(").replace(/\)/g, "\\)");

function buildPdf(lines) {
  const header = "%PDF-1.4\n";
  let body = "";
  const offsets = [];
  const add = (str) => {
    offsets.push(header.length + body.length);
    body += str;
  };

  add("1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj\n");
  add("2 0 obj\n<< /Type /Pages /Kids [3 0 R] /Count 1 >>\nendobj\n");
  add(
    "3 0 obj\n<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595 842] /Resources << /Font << /F1 5 0 R /F2 6 0 R >> >> /Contents 4 0 R >>\nendobj\n",
  );

  let content = "BT\n";
  let y = 790;
  for (const [size, font, text, gap, color] of lines) {
    const c = color || "0 0 0";
    content += `${c} rg\n/${font} ${size} Tf\n1 0 0 1 50 ${y} Tm\n(${esc(text)}) Tj\n`;
    y -= gap;
  }
  content += "ET\n";
  add(`4 0 obj\n<< /Length ${content.length} >>\nstream\n${content}endstream\nendobj\n`);
  add("5 0 obj\n<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>\nendobj\n");
  add("6 0 obj\n<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold >>\nendobj\n");

  const xrefStart = header.length + body.length;
  let xref = "xref\n0 7\n0000000000 65535 f \n";
  for (const o of offsets) xref += String(o).padStart(10, "0") + " 00000 n \n";
  const trailer = `trailer\n<< /Size 7 /Root 1 0 R >>\nstartxref\n${xrefStart}\n%%EOF\n`;
  return Buffer.from(header + body + xref + trailer, "latin1");
}

for (const [slug, c] of Object.entries(COURSES)) {
  const lines = [
    [11, "F2", "ONLINE TECH UGANDA", 22, "0.945 0.353 0.161"],
    [20, "F2", c.title, 26, "0.157 0.137 0.388"],
    [12, "F1", "Course notes & summary", 28],
    [13, "F2", "What you will learn", 20, "0.157 0.137 0.388"],
  ];
  for (const l of c.lessons) lines.push([11, "F1", "-  " + l, 18]);
  lines.push([12, "F2", "Tips", 20, "0.157 0.137 0.388"]);
  lines.push([11, "F1", "-  Practice a little every day.", 16]);
  lines.push([11, "F1", "-  Watch the free lesson, then unlock the rest.", 16]);
  lines.push([11, "F1", "-  Take the quiz to earn your certificate.", 26]);
  lines.push([10, "F1", "onlinetechug.com   |   +256 756 839 270   |   Liberty Tower, Kampala Road", 16, "0.4 0.4 0.45"]);

  fs.writeFileSync(path.join(OUT, `${slug}-notes.pdf`), buildPdf(lines));
  console.log("wrote", slug + "-notes.pdf");
}
