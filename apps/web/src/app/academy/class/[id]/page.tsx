"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Loader2, ShieldAlert, Users } from "lucide-react";
import { academy, type JoinInfo } from "@/lib/academy";

/**
 * The live classroom.
 *
 * The video call itself runs on Jitsi, loaded into this page. Carrying video,
 * audio, screen sharing and recording between thirty phones needs a media
 * server and TURN relays for the ones behind mobile NAT — that is
 * infrastructure, not a feature, and writing our own would be worse than what
 * already exists.
 *
 * What is ours is everything around it: who may enter, when the door opens,
 * who actually turned up and for how long. The server checks all of that
 * before it will even tell this page the room name, so the room cannot be
 * read off the page by someone who isn't enrolled.
 */

declare global {
  interface Window {
    JitsiMeetExternalAPI?: new (domain: string, options: Record<string, unknown>) => {
      dispose: () => void;
      addListener: (event: string, handler: (...args: unknown[]) => void) => void;
      executeCommand: (command: string, ...args: unknown[]) => void;
    };
  }
}

function loadJitsi(domain: string): Promise<void> {
  return new Promise((resolve, reject) => {
    if (window.JitsiMeetExternalAPI) return resolve();
    const s = document.createElement("script");
    s.src = `https://${domain}/external_api.js`;
    s.async = true;
    s.onload = () => resolve();
    s.onerror = () => reject(new Error("Couldn't load the classroom."));
    document.body.appendChild(s);
  });
}

export default function ClassroomPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const classId = Number(params?.id);

  const [info, setInfo] = useState<JoinInfo | null>(null);
  const [error, setError] = useState("");
  const [status, setStatus] = useState("Checking your place in this class…");

  const holder = useRef<HTMLDivElement | null>(null);
  const callRef = useRef<{ dispose: () => void } | null>(null);
  const leftRef = useRef(false);

  /** Tell the server we've gone, so the register closes our row. */
  const leave = useCallback(() => {
    if (leftRef.current || !classId) return;
    leftRef.current = true;
    academy.leave(classId).catch(() => {
      /* leaving is best-effort — ending the class closes it anyway */
    });
  }, [classId]);

  useEffect(() => {
    let alive = true;

    (async () => {
      try {
        // The server decides. If this succeeds we are enrolled, the door is
        // open, and we have been marked present.
        const joined = await academy.join(classId);
        if (!alive) return;
        setInfo(joined);
        setStatus("Connecting to the classroom…");

        await loadJitsi(joined.domain);
        if (!alive || !holder.current || !window.JitsiMeetExternalAPI) return;

        const api = new window.JitsiMeetExternalAPI(joined.domain, {
          roomName: joined.room,
          parentNode: holder.current,
          userInfo: { displayName: joined.display_name },
          configOverwrite: {
            prejoinPageEnabled: false,
            startWithAudioMuted: !joined.is_host,
            startWithVideoMuted: !joined.is_host,
            disableDeepLinking: true,
          },
          interfaceConfigOverwrite: {
            // Our own branding, and no invitations to leave for the Jitsi app.
            SHOW_JITSI_WATERMARK: false,
            SHOW_BRAND_WATERMARK: false,
            MOBILE_APP_PROMO: false,
            DEFAULT_REMOTE_DISPLAY_NAME: "Classmate",
            TOOLBAR_BUTTONS: [
              "microphone",
              "camera",
              "desktop",
              "chat",
              "raisehand",
              "participants-pane",
              "tileview",
              "filmstrip",
              "settings",
              "hangup",
              ...(joined.is_host ? ["recording", "mute-everyone", "security"] : []),
            ],
          },
        });

        callRef.current = api;
        api.addListener("readyToClose", () => {
          leave();
          router.push("/academy");
        });
        api.addListener("videoConferenceLeft", leave);
        setStatus("");
      } catch (e) {
        if (alive) setError(e instanceof Error ? e.message : "Couldn't join this class.");
      }
    })();

    // Closing the tab counts as leaving.
    const onUnload = () => leave();
    window.addEventListener("beforeunload", onUnload);

    return () => {
      alive = false;
      window.removeEventListener("beforeunload", onUnload);
      leave();
      try {
        callRef.current?.dispose();
      } catch {
        /* already gone */
      }
    };
  }, [classId, leave, router]);

  if (error) {
    return (
      <div className="container-page py-16">
        <div className="mx-auto max-w-md rounded-card border border-amber-200 bg-amber-50 p-7 text-center">
          <ShieldAlert className="mx-auto text-amber-600" size={34} />
          <h1 className="mt-3 text-lg font-extrabold text-ink-900">Can&apos;t join this class</h1>
          <p className="mt-1.5 text-sm text-amber-900">{error}</p>
          <div className="mt-5 flex flex-wrap justify-center gap-2">
            <Link
              href="/academy"
              className="press rounded-lg bg-brand-500 px-5 py-2.5 text-sm font-bold text-white hover:bg-brand-600"
            >
              Back to my academy
            </Link>
            <Link
              href="/login?next=/academy"
              className="press rounded-lg border border-ink-600/20 bg-white px-5 py-2.5 text-sm font-bold text-ink-700 hover:bg-ink-50"
            >
              Sign in
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-[100dvh] flex-col bg-ink-900">
      {/* A slim bar — on a phone every millimetre belongs to the video. */}
      <header className="flex shrink-0 items-center gap-3 bg-ink-800 px-3 py-2 text-white">
        <button
          onClick={() => {
            leave();
            router.push("/academy");
          }}
          aria-label="Leave class"
          className="press rounded-md p-1.5 text-white/80 hover:bg-white/10 hover:text-white"
        >
          <ArrowLeft size={19} />
        </button>
        <div className="min-w-0 flex-1">
          <p className="truncate text-[13px] font-bold leading-tight">
            {info?.title ?? "Classroom"}
          </p>
          <p className="truncate text-[11px] text-white/60">
            {info?.lecturer_name ? `${info.lecturer_name} · ` : ""}
            {info?.is_host ? "You are the lecturer" : "Live class"}
          </p>
        </div>
        {info && (
          <span className="flex shrink-0 items-center gap-1.5 rounded-full bg-white/10 px-2.5 py-1 text-[11px] font-bold">
            <Users size={12} /> {info.attendees}
          </span>
        )}
      </header>

      {status && (
        <div className="flex flex-1 flex-col items-center justify-center gap-3 text-white/80">
          <Loader2 className="animate-spin" size={28} />
          <p className="text-sm">{status}</p>
          <p className="max-w-xs text-center text-xs text-white/50">
            Allow the camera and microphone when your phone asks, or join muted and turn them on
            when you need to.
          </p>
        </div>
      )}

      {/* The call fills whatever is left. */}
      <div ref={holder} className={`min-h-0 flex-1 ${status ? "hidden" : ""}`} />
    </div>
  );
}
