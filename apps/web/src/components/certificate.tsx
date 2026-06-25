"use client";

import { useEffect, useState } from "react";
import { Award, Printer } from "lucide-react";
import { learnerName, setLearnerName } from "@/lib/learning";

export function Certificate({ courseTitle }: { courseTitle: string }) {
  const [name, setName] = useState("");

  useEffect(() => {
    setName(learnerName());
  }, []);

  const date = new Date().toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" });

  function print() {
    if (name.trim()) setLearnerName(name.trim());
    const safe = (s: string) => s.replace(/[<>&]/g, "");
    const html = `<!doctype html><html><head><meta charset="utf-8"><title>Certificate</title>
    <style>
      *{margin:0;padding:0;box-sizing:border-box;font-family:Georgia,'Times New Roman',serif}
      body{display:flex;align-items:center;justify-content:center;min-height:100vh;background:#eee}
      .cert{width:1000px;max-width:96vw;aspect-ratio:1.414/1;background:#fff;border:14px solid #282363;
        position:relative;padding:64px;text-align:center;display:flex;flex-direction:column;justify-content:center}
      .cert:before{content:"";position:absolute;inset:18px;border:2px solid #F15A29}
      .brand{color:#F15A29;letter-spacing:4px;font-weight:bold;font-size:18px;text-transform:uppercase}
      h1{color:#282363;font-size:44px;margin:18px 0 6px}
      .sub{color:#555;font-size:16px}
      .name{color:#282363;font-size:40px;margin:26px 0 6px;border-bottom:2px solid #F15A29;display:inline-block;padding:0 30px 6px}
      .course{font-size:22px;color:#333;margin-top:18px}
      .row{display:flex;justify-content:space-between;margin-top:54px;font-size:14px;color:#555}
      .row b{display:block;color:#282363;font-size:16px}
      @media print{body{background:#fff}.cert{box-shadow:none}}
    </style></head><body>
      <div class="cert">
        <div class="brand">Online Tech Uganda</div>
        <h1>Certificate of Completion</h1>
        <div class="sub">This certifies that</div>
        <div class="name">${safe(name) || "________________"}</div>
        <div class="sub">has successfully completed the course</div>
        <div class="course"><b>${safe(courseTitle)}</b></div>
        <div class="row">
          <div>Date<b>${date}</b></div>
          <div>Issued by<b>Online Tech Uganda</b></div>
        </div>
      </div>
      <script>window.onload=function(){setTimeout(function(){window.print()},300)}</script>
    </body></html>`;
    const w = window.open("", "_blank");
    if (w) {
      w.document.write(html);
      w.document.close();
    }
  }

  return (
    <div className="rounded-lg border border-brand-200 bg-brand-50 p-4">
      <p className="flex items-center gap-2 text-sm font-bold text-brand-700">
        <Award size={18} /> Your certificate is ready!
      </p>
      <div className="mt-3 flex flex-col gap-2 sm:flex-row">
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Enter your name as it should appear"
          className="flex-1 rounded-md border border-ink-600/15 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none"
        />
        <button
          onClick={print}
          disabled={!name.trim()}
          className="inline-flex items-center justify-center gap-1.5 rounded-md bg-brand-500 px-5 py-2 text-sm font-bold text-white transition hover:bg-brand-600 disabled:opacity-50"
        >
          <Printer size={16} /> Download / Print
        </button>
      </div>
    </div>
  );
}
