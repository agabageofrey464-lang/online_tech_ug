import { redirect } from "next/navigation";

/** A short address to share with students: it opens the internship application form. */
export default function ApplyPage() {
  redirect("/internship#apply-form");
}
