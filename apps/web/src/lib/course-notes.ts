// Written, in-site course notes — organised into UNITS per course. Rendered by
// the gated notes reader (learn/[slug]/notes). Content is plain HTML so it needs
// no markdown dependency; keep it clean and beginner-friendly.

export type NoteUnit = {
  n: number;
  title: string;
  summary: string;
  html: string;
};

const computerBasics: NoteUnit[] = [
  {
    n: 1,
    title: "Introduction to Computers",
    summary: "What a computer is, its types, uses and why it matters.",
    html: `
      <h3>What is a computer?</h3>
      <p>A <b>computer</b> is an electronic machine that accepts <b>data</b> (raw facts), processes it following a set of instructions, and produces useful <b>information</b>. It then stores that information for later use.</p>
      <p>The four basic operations form the <b>IPOS cycle</b>:</p>
      <ul>
        <li><b>Input</b> — you enter data (typing, clicking, scanning).</li>
        <li><b>Processing</b> — the computer works on the data.</li>
        <li><b>Output</b> — results are shown (screen, printout, sound).</li>
        <li><b>Storage</b> — the work is saved for the future.</li>
      </ul>
      <h3>Characteristics of a computer</h3>
      <ul>
        <li><b>Speed</b> — performs millions of operations in a second.</li>
        <li><b>Accuracy</b> — gives correct results (mistakes are usually human — "garbage in, garbage out").</li>
        <li><b>Storage</b> — keeps large amounts of data.</li>
        <li><b>Diligence</b> — never gets tired or bored.</li>
        <li><b>Versatility</b> — does many different tasks.</li>
      </ul>
      <h3>Types of computers</h3>
      <ul>
        <li><b>Desktop</b> — a full computer for an office or home desk.</li>
        <li><b>Laptop</b> — portable, battery-powered, all-in-one.</li>
        <li><b>Tablet & smartphone</b> — touch-screen, pocket-sized computers.</li>
        <li><b>Server</b> — a powerful computer that serves many users/network.</li>
      </ul>
      <h3>Everyday uses</h3>
      <p>Computers are used in <b>business</b> (records, accounts), <b>education</b> (learning, research), <b>banking</b> (mobile money, ATMs), <b>communication</b> (email, WhatsApp), <b>entertainment</b> and <b>government services</b>.</p>
      <div class="note-key"><b>Key points:</b> A computer turns data into information through Input → Processing → Output → Storage. It is fast, accurate, tireless and versatile.</div>
    `,
  },
  {
    n: 2,
    title: "Computer Hardware",
    summary: "The physical parts — processor, memory, storage and devices.",
    html: `
      <h3>What is hardware?</h3>
      <p><b>Hardware</b> means the physical parts of a computer you can touch. It is grouped into the system unit, input devices, output devices and storage.</p>
      <h3>Inside the system unit</h3>
      <ul>
        <li><b>CPU (Central Processing Unit)</b> — the "brain"; it carries out instructions. Speed is measured in <b>GHz</b>.</li>
        <li><b>RAM (Random Access Memory)</b> — temporary working memory. More RAM = smoother multitasking. It is <b>volatile</b> (cleared when power goes off).</li>
        <li><b>Motherboard</b> — the main board that connects all parts.</li>
        <li><b>Storage drive (HDD/SSD)</b> — keeps your files permanently. An <b>SSD</b> is much faster than an <b>HDD</b>.</li>
        <li><b>Power supply</b> — provides electricity to the parts.</li>
      </ul>
      <h3>Input devices</h3>
      <p>Used to <b>enter</b> data: keyboard, mouse, touchpad, scanner, microphone, webcam.</p>
      <h3>Output devices</h3>
      <p>Used to <b>get results</b>: monitor (screen), printer, speakers, projector.</p>
      <h3>Storage sizes (smallest → largest)</h3>
      <p>Bit → Byte → Kilobyte (KB) → Megabyte (MB) → Gigabyte (GB) → Terabyte (TB). 1024 of one unit makes the next.</p>
      <div class="note-key"><b>Key points:</b> CPU processes, RAM is temporary memory, the drive stores permanently. Input devices feed data in; output devices give results out.</div>
    `,
  },
  {
    n: 3,
    title: "Software & Operating Systems",
    summary: "System vs application software and how Windows works.",
    html: `
      <h3>What is software?</h3>
      <p><b>Software</b> is the set of instructions (programs) that tell the hardware what to do. Without software, hardware cannot do anything useful.</p>
      <h3>Two main types</h3>
      <ul>
        <li><b>System software</b> — runs the computer itself. The most important is the <b>Operating System (OS)</b>, e.g. Windows, macOS, Android.</li>
        <li><b>Application software</b> — programs you use for tasks: MS Word, Excel, browsers, WhatsApp, games.</li>
      </ul>
      <h3>What the Operating System does</h3>
      <ul>
        <li>Starts the computer (booting).</li>
        <li>Manages files, memory and devices (printer, keyboard…).</li>
        <li>Provides the screen you interact with (the desktop).</li>
        <li>Runs your applications.</li>
      </ul>
      <h3>The Windows desktop</h3>
      <ul>
        <li><b>Desktop</b> — the main screen after start-up.</li>
        <li><b>Icons</b> — small pictures that open programs or files.</li>
        <li><b>Taskbar</b> — the bar at the bottom (Start button, open programs, clock).</li>
        <li><b>Windows</b> — each program opens in a rectangle you can move, resize, minimise or close.</li>
        <li><b>Start menu</b> — where you find all your programs and the shut-down option.</li>
      </ul>
      <div class="note-key"><b>Key points:</b> System software (the OS) runs the machine; application software does your tasks. Always shut down properly from the Start menu.</div>
    `,
  },
  {
    n: 4,
    title: "Files, Folders & Storage",
    summary: "Saving, organising and backing up your work safely.",
    html: `
      <h3>Files and folders</h3>
      <ul>
        <li>A <b>file</b> is a single saved item — a document, photo, song or video.</li>
        <li>A <b>folder</b> is a container that holds files and other folders, to keep them organised.</li>
        <li>Each file has a <b>name</b> and an <b>extension</b> that shows its type: <code>.docx</code> (Word), <code>.pdf</code>, <code>.jpg</code> (photo), <code>.mp3</code> (music).</li>
      </ul>
      <h3>Common actions</h3>
      <ul>
        <li><b>Save</b> — store your work (Ctrl + S). <b>Save As</b> — save a new copy with a new name.</li>
        <li><b>Copy</b> (Ctrl + C) and <b>Paste</b> (Ctrl + V) — duplicate a file.</li>
        <li><b>Cut</b> (Ctrl + X) and Paste — move a file.</li>
        <li><b>Rename</b>, <b>Delete</b> — deleted items go to the <b>Recycle Bin</b> (can be restored).</li>
      </ul>
      <h3>Storage devices</h3>
      <p>Save and carry files using: <b>flash drives</b>, <b>memory cards</b>, <b>external hard drives</b>, or <b>cloud storage</b> (Google Drive, OneDrive) which keeps files online.</p>
      <h3>Backups — protect your work</h3>
      <p>A <b>backup</b> is a second copy of your important files kept somewhere else (flash drive or cloud). If your computer is lost, stolen or damaged, your work is safe. Back up regularly.</p>
      <div class="note-key"><b>Key points:</b> Organise files into named folders, save often, and keep a backup. Remove flash drives safely to avoid losing data.</div>
    `,
  },
  {
    n: 5,
    title: "Word Processing (Microsoft Word)",
    summary: "Create, format, and print professional documents.",
    html: `
      <h3>What is word processing?</h3>
      <p><b>Word processing</b> is using a program like <b>Microsoft Word</b> to create text documents — letters, reports, CVs and notes.</p>
      <h3>Getting started</h3>
      <ul>
        <li>Open Word and start a <b>Blank document</b>.</li>
        <li>Type your text. Press <b>Enter</b> to start a new paragraph.</li>
        <li>Save early and often: <b>Ctrl + S</b>, give the file a clear name.</li>
      </ul>
      <h3>Formatting your text</h3>
      <ul>
        <li><b>Bold</b> (Ctrl + B), <b>Italic</b> (Ctrl + I), <b>Underline</b> (Ctrl + U).</li>
        <li>Change the <b>font</b>, <b>size</b> and <b>colour</b> from the Home tab.</li>
        <li><b>Alignment</b>: left, centre, right, justify.</li>
        <li>Use <b>bullet</b> and <b>numbered lists</b> for points.</li>
      </ul>
      <h3>Adding more</h3>
      <ul>
        <li><b>Insert</b> tab → add <b>tables</b>, <b>pictures</b>, page numbers and headers/footers.</li>
        <li>Check spelling from the <b>Review</b> tab.</li>
      </ul>
      <h3>Printing</h3>
      <p><b>File → Print</b>. Choose the printer, number of copies, then Print. Use <b>Print Preview</b> first to check how it will look.</p>
      <div class="note-key"><b>Key points:</b> Type, format neatly, save with Ctrl + S, and preview before printing. Practice by typing a simple letter.</div>
    `,
  },
  {
    n: 6,
    title: "The Internet & Email",
    summary: "Browse, search, use email and stay safe online.",
    html: `
      <h3>The Internet</h3>
      <p>The <b>Internet</b> is a worldwide network that connects millions of computers, letting them share information. The <b>World Wide Web</b> is the collection of websites you visit.</p>
      <h3>Web browsers</h3>
      <p>A <b>browser</b> opens websites: <b>Google Chrome</b>, <b>Microsoft Edge</b>, <b>Firefox</b>. Type a web address (URL) or a search word in the address bar.</p>
      <h3>Searching with Google</h3>
      <ul>
        <li>Type clear keywords, not whole sentences.</li>
        <li>Use quotation marks "…" to search an exact phrase.</li>
        <li>Check that a source looks trustworthy before believing it.</li>
      </ul>
      <h3>Email</h3>
      <ul>
        <li>An <b>email address</b> looks like <code>name@gmail.com</code>.</li>
        <li><b>Compose</b> a message: add the recipient (To), a <b>Subject</b>, your message, then <b>Send</b>.</li>
        <li><b>Attachments</b> — send files (documents, photos) with your email.</li>
        <li><b>CC/BCC</b> — send a copy to others (BCC hides the addresses).</li>
      </ul>
      <h3>Staying safe online</h3>
      <ul>
        <li>Never share your <b>password</b> or PIN.</li>
        <li>Beware of <b>scams/phishing</b> — messages that trick you into giving money or details.</li>
        <li>For Mobile Money, always confirm the name before sending.</li>
      </ul>
      <div class="note-key"><b>Key points:</b> Use a browser to reach websites, search with keywords, and email with a clear subject. Protect your passwords and watch out for scams.</div>
    `,
  },
  {
    n: 7,
    title: "Computer Care & Security",
    summary: "Protect against viruses, keep data safe, maintain your machine.",
    html: `
      <h3>Viruses and malware</h3>
      <p>A <b>virus</b> is a harmful program that can damage files or steal data. <b>Malware</b> is the general name for all harmful software.</p>
      <h3>Protecting your computer</h3>
      <ul>
        <li>Install and update <b>antivirus</b> software.</li>
        <li>Don't open unknown email attachments or links.</li>
        <li>Scan flash drives before using them.</li>
        <li>Keep Windows and programs <b>updated</b>.</li>
        <li>Use strong <b>passwords</b> and lock your screen when away.</li>
      </ul>
      <h3>Looking after the hardware</h3>
      <ul>
        <li>Keep the computer clean and free of dust.</li>
        <li>Use a stable power source / surge protector; shut down properly.</li>
        <li>Don't eat or drink over the keyboard.</li>
        <li>Handle laptops gently; charge the battery correctly.</li>
      </ul>
      <h3>Good working habits (ergonomics)</h3>
      <p>Sit upright, keep the screen at eye level, and take short breaks to rest your eyes and hands.</p>
      <div class="note-key"><b>Key points:</b> Use antivirus, avoid unknown links, back up your data, keep software updated, and treat the hardware with care.</div>
    `,
  },
  {
    n: 8,
    title: "Practical Skills & Revision",
    summary: "Typing practice, everyday tasks, and a revision checklist.",
    html: `
      <h3>Typing skills</h3>
      <ul>
        <li>Place fingers on the <b>home row</b> (ASDF — JKL;). Keep thumbs on the space bar.</li>
        <li>Look at the screen, not the keys — build <b>touch typing</b>.</li>
        <li>Accuracy first, then speed. Practice a little every day.</li>
      </ul>
      <h3>Everyday tasks to master</h3>
      <ul>
        <li>Turn the computer on and off correctly.</li>
        <li>Create a folder, save a document into it, and find it again.</li>
        <li>Copy files to a flash drive safely.</li>
        <li>Type and format a one-page letter.</li>
        <li>Create an email and send an attachment.</li>
      </ul>
      <h3>Revision checklist</h3>
      <ul>
        <li>Can you explain Input → Processing → Output → Storage?</li>
        <li>Can you name the CPU, RAM and storage and their jobs?</li>
        <li>Do you know the difference between system and application software?</li>
        <li>Can you save, organise and back up your files?</li>
        <li>Can you search the web and send an email safely?</li>
      </ul>
      <div class="note-key"><b>Well done!</b> Complete the course quiz to earn your certificate. Keep practising — the computer rewards the curious.</div>
    `,
  },
];

const microsoftOffice: NoteUnit[] = [
  {
    n: 1,
    title: "Getting Started with Microsoft Office",
    summary: "The Office suite, the ribbon interface, and skills shared by every program.",
    html: `
      <h3>What is Microsoft Office?</h3>
      <p><b>Microsoft Office</b> is a suite (collection) of programs used for office and business work. The main programs are:</p>
      <ul>
        <li><b>Word</b> — word processing (letters, reports, CVs).</li>
        <li><b>Excel</b> — spreadsheets (numbers, calculations, charts).</li>
        <li><b>PowerPoint</b> — presentations (slides).</li>
        <li><b>Access</b> — databases (organised records).</li>
        <li><b>Publisher</b> — desktop publishing (flyers, cards, newsletters).</li>
      </ul>
      <h3>The common interface</h3>
      <p>All Office programs look similar, so learning one helps you learn the rest.</p>
      <ul>
        <li><b>Ribbon</b> — the strip of tools at the top, divided into <b>tabs</b> (Home, Insert, Layout…).</li>
        <li><b>Quick Access Toolbar</b> — small icons for Save, Undo, Redo.</li>
        <li><b>File / Backstage</b> — New, Open, Save, Print, and program options.</li>
        <li><b>Status bar</b> — information at the bottom (page number, zoom).</li>
      </ul>
      <h3>Skills used everywhere</h3>
      <ul>
        <li><b>Save</b> (Ctrl + S) and <b>Save As</b> to a chosen folder; know the file types: <code>.docx</code>, <code>.xlsx</code>, <code>.pptx</code>, <code>.accdb</code>, <code>.pub</code>.</li>
        <li><b>Open</b>, <b>New</b>, <b>Print</b> (Ctrl + P).</li>
        <li><b>Undo</b> (Ctrl + Z) / <b>Redo</b> (Ctrl + Y).</li>
        <li><b>Cut/Copy/Paste</b> (Ctrl + X / C / V).</li>
      </ul>
      <div class="note-key"><b>Key points:</b> Office programs share the ribbon interface. Master Save, Open, Print, Undo and Copy/Paste once — they work in all of them.</div>
    `,
  },
  {
    n: 2,
    title: "Microsoft Word — Word Processing",
    summary: "Create, format, lay out and finish professional documents.",
    html: `
      <h3>Purpose</h3>
      <p><b>Word</b> is used to create and edit text documents — letters, reports, CVs, notes and books.</p>
      <h3>Typing & editing</h3>
      <ul>
        <li>Type text; press <b>Enter</b> for a new paragraph.</li>
        <li>Select text by dragging, then edit, delete or format it.</li>
        <li><b>Find & Replace</b> (Ctrl + H) to change words quickly.</li>
      </ul>
      <h3>Character formatting (Home tab)</h3>
      <p><b>Bold</b>, <i>Italic</i>, Underline, font type, size, colour, highlight, superscript/subscript.</p>
      <h3>Paragraph formatting</h3>
      <ul>
        <li>Alignment: left, centre, right, <b>justify</b>.</li>
        <li>Line and paragraph <b>spacing</b>; <b>indents</b>.</li>
        <li><b>Bullets</b> and <b>numbered lists</b>.</li>
      </ul>
      <h3>Styles &amp; templates</h3>
      <p><b>Styles</b> (Heading 1, Heading 2, Normal) format text consistently and build an automatic <b>Table of Contents</b>. <b>Templates</b> are ready-made designs.</p>
      <h3>Page layout</h3>
      <ul>
        <li>Margins, orientation (portrait/landscape), paper size, columns.</li>
        <li><b>Headers &amp; footers</b> and automatic <b>page numbers</b> (Insert tab).</li>
        <li><b>Page break</b> (Ctrl + Enter) to start a new page.</li>
      </ul>
      <h3>Inserting objects</h3>
      <p>Insert tab: <b>tables</b>, <b>pictures</b>, shapes, SmartArt, symbols and hyperlinks.</p>
      <h3>Tables</h3>
      <p>Rows and columns of cells for data. Insert a table, add/delete rows, merge cells, and apply a table style.</p>
      <h3>References</h3>
      <p><b>Table of Contents</b>, footnotes, captions and citations (References tab) — built from your Heading styles.</p>
      <h3>Mail Merge</h3>
      <p>Create many personalised letters/labels from one document + a list of names (Mailings tab): Start Mail Merge → select recipients → insert merge fields → finish &amp; print.</p>
      <h3>Review &amp; finishing</h3>
      <ul>
        <li><b>Spelling &amp; Grammar</b> check (Review tab).</li>
        <li><b>Track Changes</b> and <b>Comments</b> for editing together.</li>
        <li><b>Print</b> (Ctrl + P) — preview first, then print.</li>
      </ul>
      <div class="note-key"><b>Key points:</b> Format with styles, lay out pages with margins/headers, insert tables and pictures, and use Mail Merge for bulk letters. Always spell-check and preview before printing.</div>
    `,
  },
  {
    n: 3,
    title: "Microsoft Excel — Spreadsheets",
    summary: "Enter data, calculate with formulas & functions, and make charts.",
    html: `
      <h3>Purpose</h3>
      <p><b>Excel</b> organises numbers and text in a grid and performs calculations automatically — budgets, records, marks, accounts.</p>
      <h3>The workbook</h3>
      <ul>
        <li>A file is a <b>workbook</b>; it contains <b>worksheets</b> (tabs at the bottom).</li>
        <li>A sheet is a grid of <b>cells</b>. Columns are letters (A, B, C), rows are numbers (1, 2, 3), so a cell is <b>A1</b>, <b>B4</b>…</li>
      </ul>
      <h3>Entering data</h3>
      <p>Click a cell and type text, numbers or dates. Press Enter or Tab to move. Use <b>AutoFill</b> (drag the small corner handle) to continue a series.</p>
      <h3>Formulas</h3>
      <ul>
        <li>Every formula starts with <b>=</b>.</li>
        <li>Operators: + − * / and ( ). Example: <code>=(A1+B1)*2</code>.</li>
        <li>Reference cells, not typed numbers, so results update automatically.</li>
      </ul>
      <h3>Common functions</h3>
      <ul>
        <li><code>=SUM(A1:A10)</code> — adds a range.</li>
        <li><code>=AVERAGE(A1:A10)</code> — mean.</li>
        <li><code>=MAX / MIN / COUNT</code> — highest, lowest, how many.</li>
        <li><code>=IF(A1&gt;=50,"Pass","Fail")</code> — makes a decision.</li>
        <li><code>=VLOOKUP(...)</code> — looks up a value in a table.</li>
      </ul>
      <h3>Formatting</h3>
      <p>Number formats (currency UGX, percentage, date), borders, cell colours, merge &amp; centre, wrap text, adjust row/column size.</p>
      <h3>Sorting &amp; filtering</h3>
      <p>Sort data A→Z or by value; use <b>Filter</b> to show only rows that match a condition.</p>
      <h3>Charts</h3>
      <p>Select data → Insert → choose a <b>column</b>, <b>bar</b>, <b>line</b> or <b>pie</b> chart to show it visually.</p>
      <h3>Advanced</h3>
      <ul>
        <li><b>Conditional formatting</b> — colour cells by rule (e.g. fails in red).</li>
        <li><b>Data validation</b> — drop-down lists to control entry.</li>
        <li><b>Pivot tables</b> — summarise large data quickly.</li>
      </ul>
      <h3>Printing</h3>
      <p>Set the <b>print area</b>, fit to page, add gridlines/headings if needed, then print.</p>
      <div class="note-key"><b>Key points:</b> Formulas start with =. Use SUM, AVERAGE and IF, reference cells so results auto-update, then present with charts. Sort/filter to analyse, pivot tables to summarise.</div>
    `,
  },
  {
    n: 4,
    title: "Microsoft PowerPoint — Presentations",
    summary: "Build and deliver clear, attractive slide shows.",
    html: `
      <h3>Purpose</h3>
      <p><b>PowerPoint</b> creates <b>presentations</b> — a series of slides shown on a screen or projector to support a talk.</p>
      <h3>Slides &amp; layouts</h3>
      <ul>
        <li>Add slides (New Slide) and choose a <b>layout</b> (Title, Title &amp; Content, Two Content…).</li>
        <li>Use <b>placeholders</b> for titles, text, pictures.</li>
        <li>Manage slides in the left thumbnail pane (reorder, duplicate, delete).</li>
      </ul>
      <h3>Design &amp; themes</h3>
      <p><b>Themes</b> (Design tab) give consistent colours, fonts and backgrounds. The <b>Slide Master</b> lets you change the look of all slides at once (e.g. add a logo).</p>
      <h3>Content</h3>
      <ul>
        <li>Keep text short — a few bullet points, not paragraphs.</li>
        <li>Insert <b>pictures</b>, <b>shapes</b>, <b>SmartArt</b>, <b>charts</b>, <b>audio</b> and <b>video</b> (Insert tab).</li>
      </ul>
      <h3>Transitions &amp; animations</h3>
      <ul>
        <li><b>Transitions</b> — the effect <i>between</i> slides.</li>
        <li><b>Animations</b> — effects <i>on</i> an object (appear, fly in). Use sparingly.</li>
      </ul>
      <h3>Delivering the show</h3>
      <ul>
        <li>Start: <b>F5</b> (from beginning) or Shift + F5 (current slide).</li>
        <li>Move with arrow keys / click; press <b>Esc</b> to end.</li>
        <li><b>Presenter View</b> shows your notes and the next slide on your screen while the audience sees only the slide.</li>
      </ul>
      <h3>Good practice</h3>
      <p>One idea per slide, large readable fonts, high-contrast colours, and rehearse your timing.</p>
      <div class="note-key"><b>Key points:</b> Use layouts and a theme for consistency, keep slides short and visual, add gentle transitions, and use Presenter View to deliver confidently.</div>
    `,
  },
  {
    n: 5,
    title: "Microsoft Access — Databases",
    summary: "Store and manage large sets of related records.",
    html: `
      <h3>Purpose</h3>
      <p><b>Access</b> is a <b>database</b> program. A database stores large amounts of organised data — for example students, customers or stock — so it can be searched and reported on.</p>
      <h3>Key objects</h3>
      <ul>
        <li><b>Tables</b> — store the data in rows (<b>records</b>) and columns (<b>fields</b>).</li>
        <li><b>Queries</b> — ask questions of the data (find, filter, calculate).</li>
        <li><b>Forms</b> — friendly screens for entering and viewing records.</li>
        <li><b>Reports</b> — neat, printable summaries of the data.</li>
      </ul>
      <h3>Designing a table</h3>
      <ul>
        <li>Each <b>field</b> has a <b>data type</b>: Short Text, Number, Date/Time, Currency, Yes/No, AutoNumber.</li>
        <li>A <b>Primary Key</b> uniquely identifies each record (e.g. StudentID) — no duplicates.</li>
      </ul>
      <h3>Relationships</h3>
      <p>Tables are linked using matching key fields (e.g. a Students table and a Marks table share StudentID). This is a <b>relational database</b> and avoids repeating data.</p>
      <h3>Queries</h3>
      <p>Use <b>Design View</b> to choose fields and set <b>criteria</b> (e.g. Class = "S1"). Queries can sort, filter and calculate totals.</p>
      <h3>Forms &amp; Reports</h3>
      <ul>
        <li><b>Forms</b> make data entry easier and reduce mistakes.</li>
        <li><b>Reports</b> group, sort and total data for printing (e.g. a class list or invoice).</li>
      </ul>
      <div class="note-key"><b>Key points:</b> A database is built from Tables (data), Queries (questions), Forms (entry) and Reports (output). Give each table a Primary Key and link related tables with relationships.</div>
    `,
  },
  {
    n: 6,
    title: "Microsoft Publisher — Desktop Publishing",
    summary: "Design flyers, cards, brochures and newsletters.",
    html: `
      <h3>Purpose</h3>
      <p><b>Publisher</b> is a <b>desktop publishing</b> program used to design printed materials with precise layout — <b>business cards, flyers, brochures, certificates, calendars and newsletters</b>. It gives more layout control than Word.</p>
      <h3>Starting a publication</h3>
      <ul>
        <li>Choose a <b>template</b> (Business Card, Flyer, Brochure…) or a blank page of the right size.</li>
        <li>Set the page size and orientation for your job.</li>
      </ul>
      <h3>Working with objects</h3>
      <ul>
        <li>Everything sits in <b>text boxes</b> and <b>picture boxes</b> you can place anywhere.</li>
        <li>Move, resize, rotate, align and layer (bring to front / send to back) objects.</li>
        <li>Use <b>guides</b> and <b>snapping</b> for neat alignment.</li>
      </ul>
      <h3>Design tools</h3>
      <ul>
        <li><b>Building Blocks</b> — ready-made borders, calendars and adverts.</li>
        <li><b>Colour schemes</b> and <b>font schemes</b> for a consistent brand look.</li>
        <li>Insert your <b>logo</b> and pictures.</li>
      </ul>
      <h3>Common publications</h3>
      <ul>
        <li><b>Business cards &amp; letterheads</b> — small, exact layouts.</li>
        <li><b>Flyers &amp; posters</b> — one eye-catching page.</li>
        <li><b>Brochures</b> — folded, multi-panel documents.</li>
        <li><b>Newsletters</b> — multi-page with columns and headings.</li>
      </ul>
      <h3>Printing &amp; sharing</h3>
      <p>Check the layout, then print — or save/export as <b>PDF</b> to send to a printing bureau.</p>
      <div class="note-key"><b>Key points:</b> Publisher uses movable text and picture boxes for precise design. Start from a template, keep colours/fonts consistent, and export to PDF for professional printing.</div>
    `,
  },
];

const internetEmail: NoteUnit[] = [
  {
    n: 1,
    title: "Understanding the Internet",
    summary: "What the Internet is, how you connect, and key terms.",
    html: `
      <h3>What is the Internet?</h3>
      <p>The <b>Internet</b> is a global network that connects millions of computers so they can share information. The <b>World Wide Web (WWW)</b> is the huge collection of <b>websites</b> you visit on it.</p>
      <h3>How you connect</h3>
      <ul>
        <li><b>Mobile data</b> — a SIM/bundle from a network (MTN, Airtel).</li>
        <li><b>Wi-Fi</b> — wireless internet from a router or hotspot.</li>
        <li><b>Modem/router</b> — the device that provides the connection.</li>
        <li>An <b>ISP</b> (Internet Service Provider) supplies the service.</li>
      </ul>
      <h3>Key terms</h3>
      <ul>
        <li><b>Website</b> — a set of related web pages (e.g. onlinetechug.com).</li>
        <li><b>URL</b> — a web address, e.g. <code>https://www.onlinetechug.com</code>.</li>
        <li><b>Download</b> — bring a file from the internet to your device; <b>Upload</b> — send one out.</li>
        <li><b>Bandwidth/data</b> — the amount of information you can send/receive.</li>
      </ul>
      <div class="note-key"><b>Key points:</b> The Internet connects computers worldwide; the Web is the websites on it. You connect through data or Wi-Fi via an ISP, and reach sites using their URL.</div>
    `,
  },
  {
    n: 2,
    title: "Web Browsers & Searching",
    summary: "Use a browser well and find what you need on Google.",
    html: `
      <h3>Web browsers</h3>
      <p>A <b>browser</b> is the program that opens websites — <b>Google Chrome</b>, <b>Microsoft Edge</b>, <b>Firefox</b>. Type a URL or search word in the <b>address bar</b> at the top.</p>
      <h3>Browser skills</h3>
      <ul>
        <li><b>Tabs</b> — open several pages at once.</li>
        <li><b>Bookmarks/Favourites</b> — save sites you visit often.</li>
        <li><b>History</b> — pages you've visited; <b>Back/Forward</b> arrows to move.</li>
        <li><b>Refresh</b> to reload; <b>Downloads</b> folder holds files you save.</li>
      </ul>
      <h3>Searching with Google</h3>
      <ul>
        <li>Type clear <b>keywords</b>, not full sentences (e.g. <i>price of laptop in Uganda</i>).</li>
        <li>Use quotation marks <code>"…"</code> for an exact phrase.</li>
        <li>Add words to narrow results; scan the short descriptions before clicking.</li>
        <li>Prefer trusted sources; be careful of adverts dressed as results.</li>
      </ul>
      <h3>Downloading & uploading</h3>
      <p>Click a download link to save a file; use an <b>Upload</b>/<b>Attach</b> button to send a file (e.g. a photo or CV) to a website.</p>
      <div class="note-key"><b>Key points:</b> The browser opens websites; use tabs, bookmarks and history to work faster. Search with keywords and check that sources are trustworthy.</div>
    `,
  },
  {
    n: 3,
    title: "Email — Sending & Receiving",
    summary: "Create an account and send professional messages with attachments.",
    html: `
      <h3>What is email?</h3>
      <p><b>Email</b> (electronic mail) sends written messages and files between people over the internet. A common free service is <b>Gmail</b>.</p>
      <h3>Your email address</h3>
      <p>It looks like <code>yourname@gmail.com</code> — the part before @ is your name, after @ is the provider. To create one: go to Gmail → Create account → follow the steps → set a strong password.</p>
      <h3>Sending a message (Compose)</h3>
      <ul>
        <li><b>To</b> — the recipient's address.</li>
        <li><b>Subject</b> — a short line saying what it's about.</li>
        <li><b>Body</b> — your message; be clear and polite.</li>
        <li><b>Send</b> — deliver it.</li>
      </ul>
      <h3>CC, BCC and attachments</h3>
      <ul>
        <li><b>CC</b> — send a copy to others (everyone sees the addresses).</li>
        <li><b>BCC</b> — copy others privately (addresses hidden).</li>
        <li><b>Attachment</b> — click the 📎 to send a file (document, photo).</li>
      </ul>
      <h3>Managing your inbox</h3>
      <ul>
        <li><b>Inbox</b> — received mail; <b>Sent</b> — mail you sent.</li>
        <li><b>Reply</b>, <b>Reply All</b>, <b>Forward</b>.</li>
        <li>Use <b>labels/folders</b> and <b>search</b> to stay organised; delete or archive old mail.</li>
      </ul>
      <div class="note-key"><b>Key points:</b> An email needs a recipient, a subject and a message. Use attachments for files, CC/BCC to copy others, and keep your inbox tidy with labels.</div>
    `,
  },
  {
    n: 4,
    title: "Online Safety, Scams & Mobile Money",
    summary: "Protect yourself, spot scams, and transact safely.",
    html: `
      <h3>Protect your accounts</h3>
      <ul>
        <li>Use <b>strong passwords</b> (letters, numbers, symbols) and a different one per account.</li>
        <li>Never share your <b>password, PIN or OTP</b> — no genuine company asks for them.</li>
        <li>Turn on <b>two-step verification</b> where possible.</li>
        <li>Log out on shared/public computers.</li>
      </ul>
      <h3>Spotting scams (phishing)</h3>
      <ul>
        <li>Messages that create <b>panic or urgency</b> ("your account will close!").</li>
        <li>Fake "you have won" prizes asking you to pay or click a link.</li>
        <li>Links that look slightly wrong; check the real web address.</li>
        <li>Requests to send money or airtime to "help" someone.</li>
      </ul>
      <h3>Mobile Money safety</h3>
      <ul>
        <li>Always confirm the <b>recipient's name</b> before approving.</li>
        <li>Keep your PIN secret; don't approve prompts you didn't start.</li>
        <li>Ignore "wrong send, please reverse" tricks — verify first.</li>
        <li>Keep the SMS confirmation as your receipt.</li>
      </ul>
      <h3>Video calls & communication</h3>
      <p>Stay in touch with <b>WhatsApp</b>, <b>Zoom</b> and <b>Google Meet</b> for messages, voice and video calls — useful for work, school and family.</p>
      <div class="note-key"><b>Key points:</b> Guard your passwords and PIN, never trust urgent "prize/reverse" messages, and always confirm the name before sending Mobile Money.</div>
    `,
  },
];

const typingSkills: NoteUnit[] = [
  {
    n: 1,
    title: "The Keyboard & Correct Posture",
    summary: "Know the keyboard layout and set up to type without strain.",
    html: `
      <h3>The keyboard layout</h3>
      <p>Standard keyboards use the <b>QWERTY</b> layout (named after the first six letters). Main areas:</p>
      <ul>
        <li><b>Letter keys</b> — the middle block.</li>
        <li><b>Number row</b> — across the top; <b>numeric keypad</b> on the right (on full keyboards).</li>
        <li><b>Function keys</b> — F1–F12 along the top.</li>
        <li><b>Special keys</b> — Enter, Backspace, Shift, Ctrl, Alt, Caps Lock, Tab, Space bar.</li>
      </ul>
      <h3>Posture & set-up</h3>
      <ul>
        <li>Sit upright, feet flat, back supported.</li>
        <li>Screen at eye level, about an arm's length away.</li>
        <li>Wrists straight and relaxed — don't rest them hard on the desk.</li>
        <li>Good light to avoid eye strain.</li>
      </ul>
      <div class="note-key"><b>Key points:</b> Learn the QWERTY layout and the special keys, and set up with good posture — it prevents fatigue and helps you type faster.</div>
    `,
  },
  {
    n: 2,
    title: "Touch Typing — Home Row & Finger Placement",
    summary: "The correct finger positions for typing without looking.",
    html: `
      <h3>The home row</h3>
      <p><b>Touch typing</b> means typing without looking at the keys. You start from the <b>home row</b>:</p>
      <ul>
        <li>Left hand fingers on <b>A S D F</b>; right hand on <b>J K L ;</b></li>
        <li>Both thumbs rest on the <b>Space bar</b>.</li>
        <li><b>F</b> and <b>J</b> have small bumps so you can find home without looking.</li>
      </ul>
      <h3>Which finger types which key</h3>
      <ul>
        <li>Each finger reaches the keys just above and below its home key.</li>
        <li>Always return to the home row after each keystroke.</li>
        <li>Use the <b>Shift</b> key with the opposite hand for capital letters.</li>
      </ul>
      <h3>Practice tips</h3>
      <ul>
        <li>Keep your eyes on the screen, not the keyboard.</li>
        <li>Start slowly and correctly — speed comes with time.</li>
        <li>Practise the home row first, then add top and bottom rows.</li>
      </ul>
      <div class="note-key"><b>Key points:</b> Rest fingers on ASDF–JKL;, feel the F and J bumps, and always return to home. Type without looking — accuracy before speed.</div>
    `,
  },
  {
    n: 3,
    title: "Building Accuracy & Speed",
    summary: "Drills and habits that grow correct, fast typing.",
    html: `
      <h3>Accuracy first</h3>
      <p>Typing <b>correctly</b> matters more than typing fast. Mistakes waste time. Build accuracy, then speed will follow naturally.</p>
      <h3>Daily drills</h3>
      <ul>
        <li>Practise the same keys until they feel automatic (<b>muscle memory</b>).</li>
        <li>Type common words and short phrases repeatedly.</li>
        <li>Add <b>numbers</b>, <b>capitals</b> and <b>punctuation</b> gradually.</li>
        <li>Use a free typing tutor or website for guided lessons.</li>
      </ul>
      <h3>Measuring progress (WPM)</h3>
      <ul>
        <li><b>WPM</b> = Words Per Minute — your typing speed.</li>
        <li>Beginners ~20 WPM; steady practice reaches 40–60+ WPM.</li>
        <li>Take a typing test weekly to track improvement.</li>
      </ul>
      <h3>Useful shortcuts</h3>
      <p>Ctrl + C (copy), Ctrl + V (paste), Ctrl + Z (undo), Ctrl + S (save) — they speed up all your work.</p>
      <div class="note-key"><b>Key points:</b> Practise a little every day, aim for accuracy first, build muscle memory, and track your WPM. Learn shortcuts to work faster.</div>
    `,
  },
];

// ── Each Office app as its own course ───────────────────────────────
const msWord: NoteUnit[] = [
  {
    n: 1,
    title: "Word Basics — Typing & Editing",
    summary: "The Word screen, entering text, and editing.",
    html: `
      <h3>What is Microsoft Word?</h3>
      <p><b>Word</b> is a <b>word-processing</b> program used to create text documents — letters, reports, CVs, notes and books.</p>
      <h3>The Word screen</h3>
      <ul>
        <li><b>Ribbon</b> — tabs of tools (Home, Insert, Layout…).</li>
        <li><b>Document area</b> — the blank page you type on.</li>
        <li><b>Cursor</b> — the blinking line where text appears.</li>
        <li><b>Status bar</b> — page and word count at the bottom.</li>
      </ul>
      <h3>Typing & editing</h3>
      <ul>
        <li>Type text; press <b>Enter</b> for a new paragraph, <b>Space</b> between words.</li>
        <li><b>Backspace</b> deletes left, <b>Delete</b> deletes right.</li>
        <li>Select text by dragging, then edit, delete or format it.</li>
        <li><b>Undo</b> (Ctrl + Z) / <b>Redo</b> (Ctrl + Y).</li>
        <li><b>Find &amp; Replace</b> (Ctrl + H) to change words quickly.</li>
      </ul>
      <h3>Saving & opening</h3>
      <p>Save with <b>Ctrl + S</b> (file type <code>.docx</code>); give a clear name and choose a folder. Use <b>File → Open</b> to reopen work later.</p>
      <div class="note-key"><b>Key points:</b> Word creates text documents. Type, edit with Backspace/Delete, undo mistakes, and save early with Ctrl + S.</div>
    `,
  },
  {
    n: 2,
    title: "Formatting & Styles",
    summary: "Make documents neat with fonts, paragraphs, lists and styles.",
    html: `
      <h3>Character formatting (Home tab)</h3>
      <p><b>Bold</b> (Ctrl + B), <i>Italic</i> (Ctrl + I), Underline (Ctrl + U). Change the <b>font</b>, <b>size</b>, <b>colour</b> and highlight.</p>
      <h3>Paragraph formatting</h3>
      <ul>
        <li>Alignment: left, centre, right, <b>justify</b>.</li>
        <li>Line and paragraph <b>spacing</b>; <b>indents</b>.</li>
        <li><b>Bullet</b> and <b>numbered lists</b> for points.</li>
      </ul>
      <h3>Styles & templates</h3>
      <p><b>Styles</b> (Heading 1, Heading 2, Normal) keep formatting consistent and let Word build an automatic <b>Table of Contents</b>. <b>Templates</b> are ready-made designs (CV, letter…).</p>
      <div class="note-key"><b>Key points:</b> Format characters (bold, font, colour) and paragraphs (alignment, spacing, lists). Use Heading styles for a consistent, professional look.</div>
    `,
  },
  {
    n: 3,
    title: "Layout, Tables, Pictures, Mail Merge & Printing",
    summary: "Page setup, objects, bulk letters and finishing your document.",
    html: `
      <h3>Page layout</h3>
      <ul>
        <li>Margins, orientation (portrait/landscape), paper size, columns.</li>
        <li><b>Headers &amp; footers</b> and automatic <b>page numbers</b> (Insert tab).</li>
        <li><b>Page break</b> (Ctrl + Enter) to start a new page.</li>
      </ul>
      <h3>Tables & pictures</h3>
      <p>Insert tab → add <b>tables</b> (rows &amp; columns of cells), <b>pictures</b>, shapes and SmartArt. Add/delete rows, merge cells, apply table styles.</p>
      <h3>Mail Merge</h3>
      <p>Create many personalised letters or labels from one document + a list of names (Mailings tab): Start Mail Merge → select recipients → insert merge fields → finish &amp; print.</p>
      <h3>Review & printing</h3>
      <ul>
        <li><b>Spelling &amp; Grammar</b> check and <b>Track Changes</b>/<b>Comments</b> (Review tab).</li>
        <li><b>Print</b> (Ctrl + P) — preview first, choose copies, then print.</li>
      </ul>
      <div class="note-key"><b>Key points:</b> Set page layout, insert tables/pictures, use Mail Merge for bulk letters, and always spell-check and preview before printing.</div>
    `,
  },
];

const msExcel: NoteUnit[] = [
  {
    n: 1,
    title: "Excel Basics — Workbook, Cells & Data",
    summary: "The spreadsheet grid and entering data.",
    html: `
      <h3>What is Excel?</h3>
      <p><b>Excel</b> is a <b>spreadsheet</b> program that organises numbers and text in a grid and calculates automatically — budgets, records, marks, accounts.</p>
      <h3>Workbooks & worksheets</h3>
      <ul>
        <li>A file is a <b>workbook</b> (<code>.xlsx</code>); it holds <b>worksheets</b> (tabs at the bottom).</li>
        <li>A sheet is a grid of <b>cells</b>. Columns are letters (A, B, C), rows are numbers (1, 2, 3) — a cell is <b>A1</b>, <b>B4</b>…</li>
      </ul>
      <h3>Entering data</h3>
      <ul>
        <li>Click a cell and type text, numbers or dates. Press Enter or Tab to move.</li>
        <li>Use <b>AutoFill</b> (drag the small corner handle) to continue a series (1, 2, 3… or Jan, Feb…).</li>
        <li>Adjust column width/row height by dragging the borders.</li>
      </ul>
      <div class="note-key"><b>Key points:</b> A workbook holds worksheets of cells named by column letter + row number. Type data, then AutoFill to continue a series quickly.</div>
    `,
  },
  {
    n: 2,
    title: "Formulas & Functions",
    summary: "Calculate automatically with =, SUM, AVERAGE, IF and VLOOKUP.",
    html: `
      <h3>Formulas</h3>
      <ul>
        <li>Every formula starts with <b>=</b>.</li>
        <li>Operators: + − * / and ( ). Example: <code>=(A1+B1)*2</code>.</li>
        <li>Reference cells (A1, B2), not typed numbers, so results update automatically when data changes.</li>
      </ul>
      <h3>Common functions</h3>
      <ul>
        <li><code>=SUM(A1:A10)</code> — adds a range.</li>
        <li><code>=AVERAGE(A1:A10)</code> — the mean.</li>
        <li><code>=MAX / =MIN / =COUNT</code> — highest, lowest, how many.</li>
        <li><code>=IF(A1&gt;=50,"Pass","Fail")</code> — makes a decision.</li>
        <li><code>=VLOOKUP(...)</code> — looks up a value in a table.</li>
      </ul>
      <div class="note-key"><b>Key points:</b> Formulas start with =. Use SUM, AVERAGE and IF, and reference cells so results recalculate on their own.</div>
    `,
  },
  {
    n: 3,
    title: "Formatting, Sort/Filter, Charts & Printing",
    summary: "Present and analyse data, then print it well.",
    html: `
      <h3>Formatting</h3>
      <p>Number formats (currency UGX, percentage, date), borders, cell colours, <b>merge &amp; centre</b>, wrap text. <b>Conditional formatting</b> colours cells by rule (e.g. fails in red).</p>
      <h3>Sorting & filtering</h3>
      <p>Sort A→Z or by value; use <b>Filter</b> to show only rows that match a condition. <b>Data validation</b> creates drop-down lists.</p>
      <h3>Charts</h3>
      <p>Select data → Insert → choose a <b>column</b>, <b>bar</b>, <b>line</b> or <b>pie</b> chart to show it visually. <b>Pivot tables</b> summarise large data quickly.</p>
      <h3>Printing</h3>
      <p>Set the <b>print area</b>, fit to page, add gridlines/headings if needed, then print.</p>
      <div class="note-key"><b>Key points:</b> Format for clarity, sort/filter to analyse, chart to present, and set the print area before printing.</div>
    `,
  },
];

const msPowerpoint: NoteUnit[] = [
  {
    n: 1,
    title: "Slides, Layouts & Themes",
    summary: "Build the structure and look of a presentation.",
    html: `
      <h3>What is PowerPoint?</h3>
      <p><b>PowerPoint</b> creates <b>presentations</b> — a series of <b>slides</b> shown on a screen or projector to support a talk.</p>
      <h3>Slides & layouts</h3>
      <ul>
        <li>Add slides (New Slide) and choose a <b>layout</b> (Title, Title &amp; Content, Two Content…).</li>
        <li>Use <b>placeholders</b> for titles, text and pictures.</li>
        <li>Manage slides in the left thumbnail pane — reorder, duplicate, delete.</li>
      </ul>
      <h3>Design & themes</h3>
      <p><b>Themes</b> (Design tab) give consistent colours, fonts and backgrounds across all slides.</p>
      <div class="note-key"><b>Key points:</b> A presentation is a set of slides. Pick a layout for each and one theme for the whole deck to keep it consistent.</div>
    `,
  },
  {
    n: 2,
    title: "Content, Transitions & Animations",
    summary: "Add text, media and gentle movement.",
    html: `
      <h3>Adding content</h3>
      <ul>
        <li>Keep text short — a few bullet points, not paragraphs.</li>
        <li>Insert <b>pictures</b>, <b>shapes</b>, <b>SmartArt</b>, <b>charts</b>, <b>audio</b> and <b>video</b> (Insert tab).</li>
      </ul>
      <h3>Transitions & animations</h3>
      <ul>
        <li><b>Transitions</b> — the effect <i>between</i> slides.</li>
        <li><b>Animations</b> — effects <i>on</i> an object (appear, fly in). Use them sparingly.</li>
      </ul>
      <div class="note-key"><b>Key points:</b> One idea per slide, mostly visuals with short text. Add subtle transitions/animations — don't overdo them.</div>
    `,
  },
  {
    n: 3,
    title: "Slide Master, Presenter View & Delivering",
    summary: "Brand every slide and present with confidence.",
    html: `
      <h3>Slide Master</h3>
      <p>The <b>Slide Master</b> (View tab) changes the look of all slides at once — add a logo, set fonts and colours in one place.</p>
      <h3>Delivering the show</h3>
      <ul>
        <li>Start: <b>F5</b> (from beginning) or Shift + F5 (current slide).</li>
        <li>Move with arrow keys / click; press <b>Esc</b> to end.</li>
        <li><b>Presenter View</b> shows your notes and the next slide on your screen while the audience sees only the slide.</li>
      </ul>
      <h3>Good practice</h3>
      <p>Large readable fonts, high-contrast colours, and rehearse your timing.</p>
      <div class="note-key"><b>Key points:</b> Use the Slide Master to brand all slides, start with F5, and use Presenter View to deliver smoothly.</div>
    `,
  },
];

const msAccess: NoteUnit[] = [
  {
    n: 1,
    title: "Databases & Tables",
    summary: "What a database is and how to store data in tables.",
    html: `
      <h3>What is Access?</h3>
      <p><b>Access</b> is a <b>database</b> program. A database stores large amounts of organised data — students, customers, stock — so it can be searched and reported on.</p>
      <h3>The four objects</h3>
      <ul>
        <li><b>Tables</b> — store the data.</li>
        <li><b>Queries</b> — ask questions of the data.</li>
        <li><b>Forms</b> — screens for entering/viewing records.</li>
        <li><b>Reports</b> — printable summaries.</li>
      </ul>
      <h3>Designing a table</h3>
      <ul>
        <li>Rows are <b>records</b>; columns are <b>fields</b>.</li>
        <li>Each field has a <b>data type</b>: Short Text, Number, Date/Time, Currency, Yes/No, AutoNumber.</li>
        <li>A <b>Primary Key</b> uniquely identifies each record (e.g. StudentID) — no duplicates.</li>
      </ul>
      <div class="note-key"><b>Key points:</b> A database is built from Tables, Queries, Forms and Reports. Tables hold records (rows) and fields (columns); give each table a Primary Key.</div>
    `,
  },
  {
    n: 2,
    title: "Relationships & Queries",
    summary: "Link tables and ask questions of your data.",
    html: `
      <h3>Relationships</h3>
      <p>Tables are linked using matching key fields (e.g. a Students table and a Marks table share <b>StudentID</b>). This is a <b>relational database</b> and avoids repeating data.</p>
      <h3>Queries</h3>
      <ul>
        <li>Use <b>Design View</b> to choose fields and set <b>criteria</b> (e.g. Class = "S1").</li>
        <li>Queries can <b>sort</b>, <b>filter</b> and <b>calculate</b> totals.</li>
        <li>Save a query and re-run it any time on the latest data.</li>
      </ul>
      <div class="note-key"><b>Key points:</b> Relationships link tables through shared key fields; queries find, filter and calculate answers from the data.</div>
    `,
  },
  {
    n: 3,
    title: "Forms & Reports",
    summary: "Enter data easily and produce neat printouts.",
    html: `
      <h3>Forms</h3>
      <p><b>Forms</b> are friendly screens for entering and viewing one record at a time. They make data entry easier and reduce mistakes.</p>
      <h3>Reports</h3>
      <p><b>Reports</b> present data neatly for printing — they can <b>group</b>, <b>sort</b> and <b>total</b> records (e.g. a class list, an invoice, a stock report).</p>
      <div class="note-key"><b>Key points:</b> Use Forms for tidy data entry and Reports for professional, printable summaries of your data.</div>
    `,
  },
];

const msPublisher: NoteUnit[] = [
  {
    n: 1,
    title: "Publisher Basics & Publications",
    summary: "What Publisher does and how to start a design.",
    html: `
      <h3>What is Publisher?</h3>
      <p><b>Publisher</b> is a <b>desktop-publishing</b> program for designing printed materials with precise layout — <b>business cards, flyers, brochures, certificates, calendars and newsletters</b>. It gives more layout control than Word.</p>
      <h3>Starting a publication</h3>
      <ul>
        <li>Choose a <b>template</b> (Business Card, Flyer, Brochure…) or a blank page of the right size.</li>
        <li>Set the page size and orientation for your job.</li>
      </ul>
      <div class="note-key"><b>Key points:</b> Publisher is for precise print designs. Start from a template or set the exact page size for your publication.</div>
    `,
  },
  {
    n: 2,
    title: "Text & Picture Boxes, Design",
    summary: "Place and style objects for a neat, branded look.",
    html: `
      <h3>Working with objects</h3>
      <ul>
        <li>Everything sits in movable <b>text boxes</b> and <b>picture boxes</b>.</li>
        <li>Move, resize, rotate, align and layer (bring to front / send to back).</li>
        <li>Use <b>guides</b> and <b>snapping</b> for neat alignment.</li>
      </ul>
      <h3>Design tools</h3>
      <ul>
        <li><b>Building Blocks</b> — ready-made borders, calendars and adverts.</li>
        <li><b>Colour schemes</b> and <b>font schemes</b> for a consistent brand look.</li>
        <li>Insert your <b>logo</b> and pictures.</li>
      </ul>
      <div class="note-key"><b>Key points:</b> Publisher uses movable text and picture boxes. Align with guides and keep colours/fonts consistent for a professional look.</div>
    `,
  },
  {
    n: 3,
    title: "Common Publications & Printing",
    summary: "Design real items and prepare them for print.",
    html: `
      <h3>Common publications</h3>
      <ul>
        <li><b>Business cards &amp; letterheads</b> — small, exact layouts.</li>
        <li><b>Flyers &amp; posters</b> — one eye-catching page.</li>
        <li><b>Brochures</b> — folded, multi-panel documents.</li>
        <li><b>Newsletters</b> — multi-page with columns and headings.</li>
      </ul>
      <h3>Printing & sharing</h3>
      <p>Check the layout, then print — or save/export as <b>PDF</b> to send to a printing bureau.</p>
      <div class="note-key"><b>Key points:</b> Design cards, flyers, brochures and newsletters, then export to PDF for professional printing.</div>
    `,
  },
];

export const courseNotes: Record<string, NoteUnit[]> = {
  "computer-basics": computerBasics,
  "microsoft-office": microsoftOffice,
  "internet-email": internetEmail,
  "typing-skills": typingSkills,
  // Each Office app as its own course
  "microsoft-word": msWord,
  "microsoft-excel": msExcel,
  "microsoft-powerpoint": msPowerpoint,
  "microsoft-access": msAccess,
  "microsoft-publisher": msPublisher,
};
