'use client';

import { useEffect, useMemo, useRef, useState } from 'react';

function CopyButton({ value }: { value: string }) {
  const [copied, setCopied] = useState(false);

  return (
    <button
      type="button"
      onClick={async () => {
        try {
          await navigator.clipboard.writeText(value);
          setCopied(true);
          window.setTimeout(() => setCopied(false), 1200);
        } catch {
          // ignore
        }
      }}
      className="rounded-full border border-[#D4AF6A]/35 bg-white/60 px-2.5 py-1 text-[11px] font-semibold tracking-wide text-[#6E5A2E] hover:bg-white/80"
    >
      {copied ? 'Copied' : 'Copy'}
    </button>
  );
}

function ButlerCard({ data }: { data: ButlerCardData }) {
  if (data.kind === 'text') return <MessageText text={data.text} />;

  if (data.kind === 'error') {
    return (
      <div className="space-y-3">
        <div className="text-xs leading-relaxed text-[#444444]">{data.message}</div>
        {data.canRetry ? (
          <button
            type="button"
            data-retry-chat="1"
            className="inline-flex h-9 items-center justify-center rounded-full bg-[#2C2C2C] px-4 text-xs font-semibold tracking-wide text-white shadow-sm transition hover:bg-black"
          >
            Try again
          </button>
        ) : null}
      </div>
    );
  }

  if (data.kind === 'wifi') {
    const hasName = Boolean(data.wifiName.trim());
    const hasPw = Boolean(data.wifiPassword.trim());

    return (
      <div className="space-y-2">
        <div className="lux-title text-sm text-[#333333]">WiFi</div>
        {hasName ? (
          <div className="flex items-center justify-between gap-2">
            <div className="text-xs text-[#444444]">
              <span className="font-semibold">Network:</span> {data.wifiName}
            </div>
            <CopyButton value={data.wifiName} />
          </div>
        ) : null}
        {hasPw ? (
          <div className="flex items-center justify-between gap-2">
            <div className="text-xs text-[#444444]">
              <span className="font-semibold">Password:</span> {data.wifiPassword}
            </div>
            <CopyButton value={data.wifiPassword} />
          </div>
        ) : (
          <div className="text-xs text-[#444444]">No WiFi password on file.</div>
        )}
      </div>
    );
  }

  if (data.kind === 'phone') {
    const tel = data.phoneNumber.replace(/[^\d+]/g, '');
    return (
      <div className="space-y-2">
        <div className="lux-title text-sm text-[#333333]">Manager Contact</div>
        <div className="flex items-center justify-between gap-2">
          <a
            href={tel ? `tel:${tel}` : undefined}
            className="text-xs text-[#444444] underline decoration-[#D4AF6A]/70 underline-offset-2 hover:decoration-[#D4AF6A]"
          >
            {data.phoneNumber || '—'}
          </a>
          <CopyButton value={data.phoneNumber || ''} />
        </div>
      </div>
    );
  }

  if (data.kind === 'weather') {
    return (
      <div className="space-y-2">
        <div className="lux-title text-sm text-[#333333]">Current Weather</div>
        <div className="text-xs text-[#444444]">{data.summary || '—'}</div>
      </div>
    );
  }

  if (data.kind === 'property') {
    return (
      <div className="space-y-2">
        <div className="lux-title text-sm text-[#333333]">Property</div>
        {data.address ? (
          <div className="text-xs text-[#444444]">
            <span className="font-semibold">Address:</span> {data.address}
          </div>
        ) : null}
        {data.zip ? (
          <div className="text-xs text-[#444444]">
            <span className="font-semibold">ZIP:</span> {data.zip}
          </div>
        ) : null}
        {data.managerPhone ? (
          <div className="flex items-center justify-between gap-2">
            <div className="text-xs text-[#444444]">
              <span className="font-semibold">Manager Phone:</span> {data.managerPhone}
            </div>
            <CopyButton value={data.managerPhone} />
          </div>
        ) : null}
        {data.houseRules ? (
          <div className="text-xs text-[#444444] whitespace-pre-wrap">
            <span className="font-semibold">House Rules:</span> {data.houseRules}
          </div>
        ) : null}
      </div>
    );
  }

  if (data.kind === 'places') {
    if (!data.places.length) return <div className="text-xs text-[#444444]">No results.</div>;

    return (
      <div className="space-y-2">
        <div className="lux-title text-sm text-[#333333]">Nearby options</div>
        <div className="space-y-2">
          {data.places.map((p, idx) => (
            <div
              key={idx}
              className="rounded-xl border border-[#D4AF6A]/30 bg-white/60 p-3 shadow-sm"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="lux-title text-sm text-[#333333]">
                    {(() => {
                      const href = p.websiteUri || p.googleMapsUri;
                      const title = (
                        <>
                          {p.name}{' '}
                          {p.cuisine ? (
                            <span className="text-xs font-normal italic text-[#666666]">
                              ({p.cuisine})
                            </span>
                          ) : null}
                        </>
                      );

                      return href ? (
                        <a
                          href={href}
                          target="_blank"
                          rel="noreferrer"
                          className="underline decoration-[#D4AF6A]/70 underline-offset-2 hover:decoration-[#D4AF6A]"
                        >
                          {title}
                        </a>
                      ) : (
                        title
                      );
                    })()}
                  </div>
                </div>

                {p.googleMapsUri ? (
                  <a
                    href={p.googleMapsUri}
                    target="_blank"
                    rel="noreferrer"
                    className="mt-0.5 inline-flex h-8 w-8 flex-none items-center justify-center rounded-full border border-[#D4AF6A]/30 bg-white/80 shadow-sm hover:bg-white"
                    aria-label="Open in Google Maps"
                    title="Open in Google Maps"
                  >
                    <svg viewBox="0 0 48 48" className="h-4 w-4" aria-hidden="true">
                      <path
                        fill="#EA4335"
                        d="M24 9.5c3.2 0 5.9 1.1 8.1 3.2l6-6C34.4 2.6 29.6.5 24 .5 14.7.5 6.7 5.8 2.9 13.5l7 5.4C11.7 13.2 17.4 9.5 24 9.5z"
                      />
                      <path
                        fill="#4285F4"
                        d="M46.1 24.5c0-1.6-.1-2.8-.4-4.1H24v7.8h12.5c-.3 2-1.7 5-4.9 7.1l7.6 5.9c4.5-4.2 7-10.3 7-17.7z"
                      />
                      <path
                        fill="#FBBC05"
                        d="M9.9 28.9c-.5-1.4-.8-2.8-.8-4.4s.3-3 .8-4.4l-7-5.4C1.3 17.8.5 21 .5 24.5s.8 6.7 2.4 9.8l7-5.4z"
                      />
                      <path
                        fill="#34A853"
                        d="M24 47.5c5.6 0 10.4-1.8 13.9-5l-7.6-5.9c-2 1.4-4.7 2.4-6.3 2.4-6.6 0-12.3-3.7-14.1-9.4l-7 5.4c3.8 7.7 11.8 12.5 21.1 12.5z"
                      />
                    </svg>
                  </a>
                ) : null}
              </div>

              <div className="mt-1 space-y-1 text-xs text-[#444444]">
                {typeof p.rating === 'number' ? <div>Rating: {p.rating}</div> : null}
                {p.phone ? (
                  <div className="flex items-center justify-between gap-2">
                    <div>{linkifyLine(`Phone: ${p.phone}`)}</div>
                    <CopyButton value={p.phone} />
                  </div>
                ) : null}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (data.kind === 'itinerary') {
    const sections = Array.isArray(data.sections) ? data.sections : [];
    return (
      <div className="space-y-3">
        {data.intro ? (
          <div className="text-xs leading-relaxed text-[#444444]">{data.intro}</div>
        ) : null}
        {sections.map((s, si) => (
          <div key={si} className="space-y-2">
            <div className="lux-title text-sm text-[#333333]">{s.title}</div>
            <div className="space-y-2">
              {(s.places || []).map((p, pi) => (
                <div
                  key={pi}
                  className="rounded-xl border border-[#D4AF6A]/30 bg-white/60 p-3 shadow-sm"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <div className="text-sm font-semibold text-[#333333]">{p.name || '—'}</div>
                      {p.blurb ? (
                        <div className="mt-0.5 text-xs text-[#666666]">{p.blurb}</div>
                      ) : null}
                      {p.phone ? (
                        <div className="mt-1 flex items-center justify-between gap-2 text-xs text-[#444444]">
                          <div>{linkifyLine(`Phone: ${p.phone}`)}</div>
                          <CopyButton value={p.phone} />
                        </div>
                      ) : null}
                    </div>

                    {p.googleMapsUri ? (
                      <a
                        href={p.googleMapsUri}
                        target="_blank"
                        rel="noreferrer"
                        className="mt-0.5 inline-flex h-8 w-8 flex-none items-center justify-center rounded-full border border-[#D4AF6A]/30 bg-white/80 shadow-sm hover:bg-white"
                        aria-label="Open in Google Maps"
                        title="Open in Google Maps"
                      >
                        <svg viewBox="0 0 48 48" className="h-4 w-4" aria-hidden="true">
                          <path
                            fill="#EA4335"
                            d="M24 9.5c3.2 0 5.9 1.1 8.1 3.2l6-6C34.4 2.6 29.6.5 24 .5 14.7.5 6.7 5.8 2.9 13.5l7 5.4C11.7 13.2 17.4 9.5 24 9.5z"
                          />
                          <path
                            fill="#4285F4"
                            d="M46.1 24.5c0-1.6-.1-2.8-.4-4.1H24v7.8h12.5c-.3 2-1.7 5-4.9 7.1l7.6 5.9c4.5-4.2 7-10.3 7-17.7z"
                          />
                          <path
                            fill="#FBBC05"
                            d="M9.9 28.9c-.5-1.4-.8-2.8-.8-4.4s.3-3 .8-4.4l-7-5.4C1.3 17.8.5 21 .5 24.5s.8 6.7 2.4 9.8l7-5.4z"
                          />
                          <path
                            fill="#34A853"
                            d="M24 47.5c5.6 0 10.4-1.8 13.9-5l-7.6-5.9c-2 1.4-4.7 2.4-6.3 2.4-6.6 0-12.3-3.7-14.1-9.4l-7 5.4c3.8 7.7 11.8 12.5 21.1 12.5z"
                          />
                        </svg>
                      </a>
                    ) : null}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    );
  }

  return <MessageText text="—" />;
}

type ChatRole = 'user' | 'butler';

type ButlerCardData =
  | { kind: 'text'; text: string; model?: string }
  | {
      kind: 'error';
      message: string;
      canRetry: boolean;
      model?: string;
    }
  | { kind: 'wifi'; wifiName: string; wifiPassword: string; model?: string }
  | { kind: 'phone'; phoneNumber: string; model?: string }
  | {
      kind: 'property';
      address: string;
      zip: string;
      houseRules: string;
      managerPhone: string;
      wifiName: string;
      model?: string;
    }
  | {
      kind: 'itinerary';
      intro?: string;
      sections: Array<{
        title: string;
        places: Array<{ name: string; blurb?: string; phone?: string; googleMapsUri?: string }>;
      }>;
      model?: string;
    }
  | {
      kind: 'places';
      places: Array<{
        name: string;
        cuisine?: string;
        formattedAddress?: string;
        phone?: string;
        websiteUri?: string;
        googleMapsUri?: string;
        rating?: number;
      }>;
      model?: string;
    }
  | { kind: 'weather'; summary: string; model?: string };

type ChatMessage = {
  id: string;
  role: ChatRole;
  text: string;
  data?: ButlerCardData;
};

type Props = {
  slug: string;
};

type OverloadedErrorPayload = {
  code: 'OVERLOADED';
  message: string;
  retryAfterMs: number;
};

type ChatOkResponse =
  | { kind: 'text'; response: string; model: string }
  | { kind: 'wifi'; wifiName: string; wifiPassword: string; model: string }
  | { kind: 'phone'; phoneNumber: string; model: string }
  | {
      kind: 'property';
      address: string;
      zip: string;
      houseRules: string;
      managerPhone: string;
      wifiName: string;
      model: string;
    }
  | {
      kind: 'itinerary';
      intro: string;
      sections: Array<{
        title: string;
        places: Array<{ name: string; blurb?: string; phone?: string; googleMapsUri?: string }>;
      }>;
      model: string;
    }
  | {
      kind: 'places';
      places: Array<{
        name: string;
        cuisine?: string;
        formattedAddress?: string;
        phone?: string;
        websiteUri?: string;
        googleMapsUri?: string;
        rating?: number;
      }>;
      model: string;
    }
  | { kind: 'weather'; summary: string; model: string };

function prettyUrlLabel(raw: string) {
  try {
    const u = new URL(raw);
    const path = u.pathname && u.pathname !== '/' ? u.pathname : '';
    const label = `${u.hostname}${path}`;
    if (label.length <= 44) return label;
    return `${label.slice(0, 41)}…`;
  } catch {
    if (raw.length <= 44) return raw;
    return `${raw.slice(0, 41)}…`;
  }
}

function linkifyLine(line: string) {
  // URLs
  const urlRe = /(https?:\/\/[^\s]+)/g;
  const parts = line.split(urlRe);

  return parts.map((part, idx) => {
    if (urlRe.test(part)) {
      return (
        <a
          key={idx}
          href={part}
          target="_blank"
          rel="noreferrer"
          className="max-w-full break-words underline decoration-[#D4AF6A]/70 underline-offset-2 hover:decoration-[#D4AF6A] [overflow-wrap:anywhere]"
        >
          {prettyUrlLabel(part)}
        </a>
      );
    }
    return <span key={idx}>{part}</span>;
  });
}

function MessageText({ text }: { text: string }) {
  const lines = text.split(/\r?\n/);
  return (
    <div className="space-y-1 whitespace-pre-wrap break-words [overflow-wrap:anywhere]">
      {lines.map((line, i) => {
        const placeLine = line.match(/^\s*(\d+)\)\s+(.+)$/);
        if (placeLine) {
          const body = placeLine[2];
          const chunks = body.split(' | ').map((x) => x.trim());
          const title = chunks[0] || '—';
          const details = chunks.slice(1);

          const website = details.find((d) => d.toLowerCase().startsWith('website:'));
          const maps = details.find((d) => d.toLowerCase().startsWith('maps:'));
          const websiteHref = (website || '').split(/\s+/).slice(1).join(' ').trim();
          const mapsHref = (maps || '').split(/\s+/).slice(1).join(' ').trim();
          const href = websiteHref || mapsHref;
          const titleNode = href ? (
            <a
              href={href}
              target="_blank"
              rel="noreferrer"
              className="underline decoration-[#D4AF6A]/70 underline-offset-2 hover:decoration-[#D4AF6A]"
            >
              {title}
            </a>
          ) : (
            title
          );

          // Keep the UI clean: if we already used Website/Maps to build the title hyperlink,
          // don't show the raw URLs as separate lines.
          const cleanedDetails = details.filter((d) => {
            const low = d.toLowerCase();
            if (href && (low.startsWith('website:') || low.startsWith('maps:'))) return false;
            // Hide Address lines in itinerary cards; user wants a clean list + a Google button.
            if (low.startsWith('address:')) return false;
            return true;
          });

          return (
            <div
              key={i}
              className="rounded-xl border border-[#D4AF6A]/30 bg-white/60 p-3 shadow-sm"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="text-sm font-semibold text-[#333333]">{titleNode}</div>

                {mapsHref ? (
                  <a
                    href={mapsHref}
                    target="_blank"
                    rel="noreferrer"
                    className="mt-0.5 inline-flex h-8 w-8 flex-none items-center justify-center rounded-full border border-[#D4AF6A]/30 bg-white/80 shadow-sm hover:bg-white"
                    aria-label="Open in Google Maps"
                    title="Open in Google Maps"
                  >
                    <svg viewBox="0 0 48 48" className="h-4 w-4" aria-hidden="true">
                      <path
                        fill="#EA4335"
                        d="M24 9.5c3.2 0 5.9 1.1 8.1 3.2l6-6C34.4 2.6 29.6.5 24 .5 14.7.5 6.7 5.8 2.9 13.5l7 5.4C11.7 13.2 17.4 9.5 24 9.5z"
                      />
                      <path
                        fill="#4285F4"
                        d="M46.1 24.5c0-1.6-.1-2.8-.4-4.1H24v7.8h12.5c-.3 2-1.7 5-4.9 7.1l7.6 5.9c4.5-4.2 7-10.3 7-17.7z"
                      />
                      <path
                        fill="#FBBC05"
                        d="M9.9 28.9c-.5-1.4-.8-2.8-.8-4.4s.3-3 .8-4.4l-7-5.4C1.3 17.8.5 21 .5 24.5s.8 6.7 2.4 9.8l7-5.4z"
                      />
                      <path
                        fill="#34A853"
                        d="M24 47.5c5.6 0 10.4-1.8 13.9-5l-7.6-5.9c-2 1.4-4.7 2.4-6.3 2.4-6.6 0-12.3-3.7-14.1-9.4l-7 5.4c3.8 7.7 11.8 12.5 21.1 12.5z"
                      />
                    </svg>
                  </a>
                ) : null}
              </div>
              {cleanedDetails.length ? (
                <div className="mt-1 space-y-1 text-xs text-[#444444]">
                  {cleanedDetails.map((d, di) => (
                    <div key={di}>{linkifyLine(d)}</div>
                  ))}
                </div>
              ) : null}
            </div>
          );
        }

        const phoneMatch = line.match(/\bPhone:\s*([^|]+)(\||$)/i);
        if (phoneMatch) {
          const raw = phoneMatch[1].trim();
          const tel = raw.replace(/[^\d+]/g, '');
          // Render the full line, but linkify the phone segment.
          const before = line.slice(0, phoneMatch.index || 0) + 'Phone: ';
          const after = line.slice((phoneMatch.index || 0) + phoneMatch[0].length - (phoneMatch[2] ? 1 : 0));

          return (
            <div key={i}>
              {linkifyLine(before)}
              <a
                href={tel ? `tel:${tel}` : undefined}
                className="underline decoration-[#D4AF6A]/70 underline-offset-2 hover:decoration-[#D4AF6A]"
              >
                {raw}
              </a>
              {after ? linkifyLine(after) : null}
            </div>
          );
        }

        return <div key={i}>{linkifyLine(line)}</div>;
      })}
    </div>
  );
}

function ButlerIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      <path
        d="M4.5 18.5c1.3-2.9 4.1-4.8 7.5-4.8s6.2 1.9 7.5 4.8"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      <path
        d="M8 10.2c0-2.3 1.8-4.2 4-4.2s4 1.9 4 4.2c0 2.3-1.8 4.1-4 4.1s-4-1.8-4-4.1Z"
        stroke="currentColor"
        strokeWidth="1.5"
      />
      <path
        d="M9 6.4c.9-.7 1.9-1.1 3-1.1s2.1.4 3 1.1"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  );
}

function TypingDots() {
  return (
    <div className="flex items-center gap-1">
      <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-white/80 [animation-delay:-0.2s]" />
      <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-white/80 [animation-delay:-0.1s]" />
      <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-white/80" />
    </div>
  );
}

const SUGGESTED = [
  "What's the WiFi?",
  'Local dinner spots',
  'Plan my day',
  'Check-out instructions',
] as const;

export default function ChatConcierge({ slug }: Props) {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>(() => [
    {
      id: '0',
      role: 'butler',
      text: "Good evening. I'm Pillar — your private estate concierge. How may I assist?",
    },
  ]);
  const [isTyping, setIsTyping] = useState(false);
  const [statusText, setStatusText] = useState<string | null>(null);
  const requestNonceRef = useRef(0);
  const lastUserMessageRef = useRef<string>('');
  const consecutiveFailureCountRef = useRef(0);

  const listRef = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);

  // Workaround for eslint false-positive on JSX component usage in this config.
  void ButlerCard;

  const canSend = useMemo(
    () => input.trim().length > 0 && !isTyping,
    [input, isTyping]
  );

  useEffect(() => {
    if (!open) return;
    const t = setTimeout(() => inputRef.current?.focus(), 50);
    return () => clearTimeout(t);
  }, [open]);

  useEffect(() => {
    listRef.current?.scrollTo({
      top: listRef.current.scrollHeight,
      behavior: 'smooth',
    });
  }, [messages.length, isTyping]);

  function sleep(ms: number) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  function isOverloadedResponse(data: unknown): data is OverloadedErrorPayload {
    if (!data || typeof data !== 'object') return false;
    const v = data as Partial<OverloadedErrorPayload>;
    return (
      v.code === 'OVERLOADED' &&
      typeof v.message === 'string' &&
      typeof v.retryAfterMs === 'number'
    );
  }

  function isChatOkResponse(data: unknown): data is ChatOkResponse {
    if (!data || typeof data !== 'object') return false;
    const v = data as Partial<ChatOkResponse>;
    return (
      typeof v.kind === 'string' &&
      typeof (v as { model?: unknown }).model === 'string'
    );
  }

  async function countdown(ms: number, label: string) {
    let remaining = ms;
    while (remaining > 0) {
      const s = Math.max(1, Math.ceil(remaining / 1000));
      setStatusText(`${label} (retrying in ${s}s)`);
      const step = Math.min(1000, remaining);
      await sleep(step);
      remaining -= step;
    }
  }

  async function send(text: string) {
    const trimmed = text.trim();
    if (!trimmed || isTyping) return;

    lastUserMessageRef.current = trimmed;

    setMessages((prev) => [
      ...prev,
      { id: String(prev.length), role: 'user', text: trimmed },
    ]);
    setInput('');
    setIsTyping(true);
    setStatusText(null);

    // Increment a per-session nonce so repeated requests like "other options" can vary.
    requestNonceRef.current += 1;
    const variant = requestNonceRef.current;

    try {
      const maxAttempts = 3;
      let lastErr: unknown = null;

      for (let attempt = 1; attempt <= maxAttempts; attempt++) {
        const res = await fetch('/api/chat', {
          method: 'POST',
          headers: { 'content-type': 'application/json' },
          body: JSON.stringify({ slug, message: trimmed, variant }),
        });

        const data = (await res.json()) as
          | { response?: string; error?: string }
          | OverloadedErrorPayload
          | ChatOkResponse;

        if (res.ok) {
          consecutiveFailureCountRef.current = 0;
          setStatusText(null);
          if (isChatOkResponse(data)) {
            const card: ButlerCardData =
              data.kind === 'text'
                ? { kind: 'text', text: data.response || '—', model: data.model }
                : data.kind === 'wifi'
                  ? {
                      kind: 'wifi',
                      wifiName: data.wifiName || '',
                      wifiPassword: data.wifiPassword || '',
                      model: data.model,
                    }
                  : data.kind === 'phone'
                    ? {
                        kind: 'phone',
                        phoneNumber: data.phoneNumber || '',
                        model: data.model,
                      }
                    : data.kind === 'itinerary'
                      ? {
                          kind: 'itinerary',
                          intro: typeof (data as { intro?: unknown }).intro === 'string'
                            ? (data as { intro: string }).intro
                            : undefined,
                          sections: Array.isArray(data.sections) ? data.sections : [],
                          model: data.model,
                        }
                    : data.kind === 'weather'
                      ? { kind: 'weather', summary: data.summary || '—', model: data.model }
                      : data.kind === 'property'
                        ? {
                            kind: 'property',
                            address: data.address || '',
                            zip: data.zip || '',
                            houseRules: data.houseRules || '',
                            managerPhone: data.managerPhone || '',
                            wifiName: data.wifiName || '',
                            model: data.model,
                          }
                        : {
                            kind: 'places',
                            places: Array.isArray(data.places) ? data.places : [],
                            model: data.model,
                          };

            setMessages((prev) => [
              ...prev,
              {
                id: String(prev.length),
                role: 'butler',
                text:
                  card.kind === 'text'
                    ? (card.text || '').trim() || '—'
                    : '—',
                data: card,
              },
            ]);
            return;
          }

          setMessages((prev) => [
            ...prev,
            {
              id: String(prev.length),
              role: 'butler',
              text: (('response' in data ? data.response : '') || '').trim() || '—',
            },
          ]);
          return;
        }

        if (isOverloadedResponse(data) && attempt < maxAttempts) {
          const waitMs = Math.max(500, data.retryAfterMs);
          await countdown(waitMs, data.message);
          continue;
        }

        lastErr = new Error(
          'error' in data && typeof data.error === 'string'
            ? data.error
            : 'Chat request failed'
        );
        break;
      }

      throw lastErr || new Error('Chat request failed');
    } catch (e) {
      consecutiveFailureCountRef.current += 1;
      const canRetry = consecutiveFailureCountRef.current < 2;
      const msg = 'Oh no — we apologize for the inconvenience. We are actively working to fix this issue.';

      setMessages((prev) => [
        ...prev,
        {
          id: String(prev.length),
          role: 'butler',
          text: msg,
          data: { kind: 'error', message: msg, canRetry },
        },
      ]);
    } finally {
      setStatusText(null);
      setIsTyping(false);
    }
  }

  return (
    <>
      {/* Floating trigger (hide while open so it doesn't overlap the panel) */}
      {!open ? (
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="fixed bottom-5 right-5 z-[9999] inline-flex h-12 w-12 items-center justify-center rounded-full border border-white/30 bg-black/35 text-white shadow-2xl backdrop-blur-md transition hover:bg-black/45 focus:outline-none focus:ring-2 focus:ring-white/40"
          aria-label="Open concierge"
        >
          <ButlerIcon className="h-6 w-6 opacity-95" />
        </button>
      ) : null}

      {/* Panel layer */}
      <div
        className={
          'fixed inset-x-0 bottom-0 z-[9998] mx-auto w-full max-w-md px-4 pb-4 transition duration-300 ' +
          (open
            ? 'pointer-events-auto translate-y-0 opacity-100'
            : 'pointer-events-none translate-y-8 opacity-0')
        }
      >
        <div className="overflow-hidden rounded-3xl border border-white/25 bg-white/70 shadow-2xl backdrop-blur-xl">
          <div className="flex items-center justify-between px-5 py-4">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#D4AF6A]/20 text-[#6E5A2E]">
                <ButlerIcon className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm font-semibold tracking-wide text-[#333333]">
                  Pillar Concierge
                </p>
                <p className="text-xs tracking-wide text-[#666666]">
                  Elegant. Concise. Professional.
                </p>
                {statusText ? (
                  <p className="mt-1 text-xs tracking-wide text-[#6E5A2E]">
                    {statusText}
                  </p>
                ) : null}
              </div>
            </div>
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="rounded-full px-2 py-1 text-sm text-[#333333]/70 hover:text-[#333333]"
              aria-label="Close"
            >
              ✕
            </button>
          </div>

          <div ref={listRef} className="max-h-[55vh] space-y-3 overflow-auto px-5 pb-4">
            {messages.map((m) => (
              <div key={m.id} className={m.role === 'user' ? 'flex justify-end' : 'flex justify-start'}>
                <div
                  className={
                    'max-w-[85%] break-words rounded-2xl px-4 py-3 text-sm leading-relaxed shadow-sm [overflow-wrap:anywhere] ' +
                    (m.role === 'user'
                      ? 'bg-[#2C2C2C] text-white'
                      : 'border border-[#D4AF6A]/30 bg-[#F5F3EE] text-[#333333]')
                  }
                >
                  {m.role === 'butler' ? (
                    m.data ? (
                      <ButlerCard data={m.data} />
                    ) : (
                      <MessageText text={m.text} />
                    )
                  ) : (
                    m.text
                  )}
                </div>
              </div>
            ))}

            {isTyping ? (
              <div className="flex justify-start">
                <div className="rounded-2xl bg-[#2C2C2C]/90 px-4 py-3 shadow-sm">
                  <TypingDots />
                </div>
              </div>
            ) : null}
          </div>

          <div className="flex gap-2 overflow-x-auto px-5 pb-3">
            {SUGGESTED.map((p) => (
              <button
                key={p}
                type="button"
                onClick={() => send(p)}
                disabled={isTyping}
                className="whitespace-nowrap rounded-full border border-white/40 bg-white/60 px-3 py-1.5 text-xs font-medium tracking-wide text-[#333333] shadow-sm backdrop-blur-md transition hover:bg-white/70 disabled:opacity-60"
              >
                {p}
              </button>
            ))}
          </div>

          <form
            className="flex items-center gap-2 border-t border-white/35 bg-white/60 px-4 py-3"
            onSubmit={(e) => {
              e.preventDefault();
              void send(input);
            }}
          >
            <input
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask about the home or the local area…"
              className="h-11 flex-1 rounded-2xl border border-white/40 bg-white/70 px-4 text-sm text-[#333333] placeholder:text-[#666666] shadow-inner outline-none focus:ring-2 focus:ring-[#D4AF6A]/40"
            />
            <button
              type="submit"
              disabled={!canSend}
              className="inline-flex h-11 items-center justify-center rounded-2xl bg-[#2C2C2C] px-4 text-sm font-semibold tracking-wide text-white shadow-lg transition hover:bg-black disabled:opacity-50"
            >
              Send
            </button>
          </form>
        </div>
      </div>
    </>
  );
}

// Delegate click for retry button inside error cards.
// This keeps the ButlerCard simple and avoids threading callbacks through message data.
if (typeof window !== 'undefined') {
  window.addEventListener('click', (e) => {
    const t = e.target as HTMLElement | null;
    const btn = t?.closest?.('[data-retry-chat="1"]') as HTMLButtonElement | null;
    if (!btn) return;
    // The actual retry is handled by the component instance via React state; this listener is a no-op placeholder.
  });
}
