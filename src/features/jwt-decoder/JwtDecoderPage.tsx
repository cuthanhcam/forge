import type { JSX, ReactNode } from "react";
import { useEffect, useMemo, useRef, useState } from "react";
import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import {
  Check,
  CheckCircle2,
  ChevronDown,
  Clock3,
  Copy,
  Download,
  FileJson2,
  Fingerprint,
  KeyRound,
  RotateCcw,
  ShieldAlert,
  ShieldCheck,
  Signature,
  Sparkles,
  TriangleAlert,
  WrapText,
  XCircle,
} from "lucide-react";
import { cn } from "@/shared/lib/cn";
import { Button } from "@/shared/ui/button";
import { Tooltip } from "@/shared/ui/tooltip";
import { PaneHeader, ToolSurface, ToolToolbar } from "@/shared/components/ToolSurface";
import {
  decodeJwt,
  generateJwtExample,
  getJwtBreakdownRows,
  jwtAlgorithms,
  verifyJwtSignature,
  type DecodedJwt,
  type JwtAlgorithm,
  type JwtBreakdownRow,
  type JwtClaimInsight,
  type JwtClaimStatus,
  type JwtSecurityWarning,
  type JwtVerificationResult,
} from "./jwt-decoder.service";

type DecoderView = "decoded" | "claims" | "verify";
type DecodedSectionView = "breakdown" | "json";

const sampleToken =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCIsImtpZCI6ImZvcmdlLWRldi1rZXkifQ.eyJzdWIiOiJ1c2VyXzQyIiwibmFtZSI6IkZvcmdlIERldmVsb3BlciIsImFkbWluIjpmYWxzZSwiaXNzIjoiaHR0cHM6Ly9mb3JnZS5jdXRoYW5oY2FtLndvcmtlcnMuZGV2LyIsImF1ZCI6WyJmb3JnZS1hcGkiLCJmb3JnZS1jbGkiXSwiaWF0IjoxNzE5ODAwMDAwLCJuYmYiOjE3MTk4MDAwMDAsImV4cCI6MjUzMjQwMDAwMCwic2NvcGUiOiJ0b29sczpyZWFkIHRvb2xzOndyaXRlIiwicm9sZXMiOlsiZGV2ZWxvcGVyIiwicmV2aWV3ZXIiXSwibWV0YSI6eyJ3b3Jrc3BhY2UiOiJvcmNhY2UiLCJsb2NhbE9ubHkiOnRydWV9fQ.OXKFSHwicApJrSSp8hdAu8Mk2syW9N0Lfr3-8xbxEtk";

export function JwtDecoderPage(): JSX.Element {
  const [token, setToken] = useState(sampleToken);
  const [view, setView] = useState<DecoderView>("decoded");
  const [secret, setSecret] = useState("forge-secret");
  const [lineWrap, setLineWrap] = useState(true);
  const [exampleAlgorithm, setExampleAlgorithm] = useState<JwtAlgorithm>("HS256");
  const [verification, setVerification] = useState<JwtVerificationResult>({
    message: "Enter a shared secret to verify HMAC signatures.",
    status: "idle",
  });
  const decoded = useMemo(() => decodeJwt(token), [token]);

  useEffect(() => {
    let cancelled = false;

    void verifyJwtSignature(token, secret).then((result) => {
      if (!cancelled) {
        setVerification(result);
      }
    });

    return () => {
      cancelled = true;
    };
  }, [secret, token]);

  async function copyToken(): Promise<void> {
    await navigator.clipboard.writeText(token);
  }

  async function copyDecoded(): Promise<void> {
    await navigator.clipboard.writeText(
      JSON.stringify(
        {
          header: decoded.headerJson,
          payload: decoded.payloadJson,
          signature: decoded.signature,
        },
        null,
        2,
      ),
    );
  }

  function downloadDecoded(): void {
    const blob = new Blob(
      [
        JSON.stringify(
          {
            header: decoded.headerJson,
            payload: decoded.payloadJson,
            signature: decoded.signature,
          },
          null,
          2,
        ),
      ],
      { type: "application/json;charset=utf-8" },
    );
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");

    anchor.href = url;
    anchor.download = "forge-jwt-decoded.json";
    anchor.click();
    URL.revokeObjectURL(url);
  }

  async function generateExample(algorithm: JwtAlgorithm): Promise<void> {
    setExampleAlgorithm(algorithm);
    setToken(await generateJwtExample(algorithm, secret));
    setView("decoded");
  }

  return (
    <ToolSurface>
      <ToolToolbar
        left={
          <div className="flex min-w-0 flex-wrap items-center gap-2">
            <ViewButton
              active={view === "decoded"}
              icon={<FileJson2 aria-hidden="true" className="h-4 w-4" />}
              label="Decoded"
              onClick={() => setView("decoded")}
            />
            <ViewButton
              active={view === "claims"}
              icon={<Fingerprint aria-hidden="true" className="h-4 w-4" />}
              label="Claims"
              onClick={() => setView("claims")}
            />
            <ViewButton
              active={view === "verify"}
              icon={<KeyRound aria-hidden="true" className="h-4 w-4" />}
              label="Verify"
              onClick={() => setView("verify")}
            />
            <div className="ml-1 hidden h-6 w-px bg-slate-200 md:block" />
            <ExampleControl
              onGenerate={(algorithm) => void generateExample(algorithm)}
              value={exampleAlgorithm}
            />
          </div>
        }
        right={
          <>
            <StatusPill decoded={decoded} verification={verification} />
            <button
              aria-pressed={!lineWrap}
              className={cn(
                "flex h-9 items-center gap-2 rounded-md px-2.5 text-[12px] font-semibold transition",
                !lineWrap
                  ? "bg-accent-50 text-accent-700 ring-1 ring-accent-100"
                  : "text-slate-600 hover:bg-slate-100 hover:text-slate-950",
              )}
              onClick={() => setLineWrap((current) => !current)}
              type="button"
            >
              <WrapText aria-hidden="true" className="h-4 w-4" />
              Disable line wrap
            </button>
            <Tooltip content="Copy decoded JSON" side="bottom">
              <Button
                aria-label="Copy decoded JSON"
                className="h-9 px-3"
                disabled={!decoded.payload}
                onClick={() => void copyDecoded()}
                size="sm"
                variant="secondary"
              >
                <Copy aria-hidden="true" className="h-4 w-4" />
                Copy
              </Button>
            </Tooltip>
            <Tooltip content="Download decoded JSON" side="bottom">
              <Button
                aria-label="Download decoded JSON"
                disabled={!decoded.payload}
                onClick={downloadDecoded}
                size="icon"
                variant="ghost"
              >
                <Download aria-hidden="true" className="h-4 w-4" />
              </Button>
            </Tooltip>
            <Tooltip content="Clear" side="bottom">
              <Button
                aria-label="Clear"
                onClick={() => setToken("")}
                size="icon"
                variant="ghost"
              >
                <RotateCcw aria-hidden="true" className="h-4 w-4" />
              </Button>
            </Tooltip>
          </>
        }
      />

      <div className="grid min-h-0 flex-1 overflow-hidden xl:grid-cols-[minmax(0,0.92fr)_minmax(0,1.08fr)]">
        <div className="flex min-h-0 flex-col">
          <PaneHeader
            actions={
              <div className="flex items-center gap-2 text-[12px] font-semibold normal-case tracking-normal text-accent-600">
                <span>{token.length.toLocaleString()} chars</span>
                <button
                  className="rounded px-1.5 py-0.5 text-slate-500 transition hover:bg-white hover:text-slate-950"
                  disabled={!token}
                  onClick={() => void copyToken()}
                  type="button"
                >
                  Copy token
                </button>
              </div>
            }
            title="Encoded token"
            tone="blue"
          />
          <TokenInput lineWrap={lineWrap} onChange={setToken} value={token} />
        </div>

        <div className="flex min-h-0 flex-col border-t border-slate-200 xl:border-l xl:border-t-0">
          <PaneHeader
            actions={<HeaderStats decoded={decoded} />}
            title={<ResultTitle decoded={decoded} view={view} />}
            tone={decoded.error ? "rose" : "emerald"}
          />
          {decoded.error ? (
            <ErrorPanel decoded={decoded} />
          ) : view === "claims" ? (
            <ClaimsPanel claims={decoded.claims} warnings={decoded.warnings} />
          ) : view === "verify" ? (
            <VerifyPanel
              decoded={decoded}
              onSecretChange={setSecret}
              secret={secret}
              verification={verification}
            />
          ) : (
            <DecodedPanel decoded={decoded} lineWrap={lineWrap} />
          )}
        </div>
      </div>
    </ToolSurface>
  );
}

interface ExampleControlProps {
  onGenerate: (algorithm: JwtAlgorithm) => void;
  value: JwtAlgorithm;
}

function ExampleControl({ onGenerate, value }: ExampleControlProps): JSX.Element {
  return (
    <DropdownMenu.Root>
      <DropdownMenu.Trigger asChild>
        <button
          className="flex h-9 items-center gap-2 rounded-md border border-slate-200 bg-white px-2.5 text-[12px] font-semibold text-slate-600 shadow-sm transition hover:bg-slate-50 hover:text-slate-950"
          type="button"
        >
          <Sparkles aria-hidden="true" className="h-4 w-4 text-accent-600" />
          <span className="hidden sm:inline">Generate example</span>
          <span className="font-bold text-slate-950">{value}</span>
          <ChevronDown aria-hidden="true" className="h-3.5 w-3.5" />
        </button>
      </DropdownMenu.Trigger>
      <DropdownMenu.Portal>
        <DropdownMenu.Content
          align="start"
          className="z-50 max-h-80 min-w-44 overflow-auto rounded-md border border-slate-200 bg-white p-1 shadow-lg shadow-slate-950/10"
          sideOffset={6}
        >
          {jwtAlgorithms.map((algorithm) => (
            <DropdownMenu.Item
              className="markdown-menu-item justify-between"
              key={algorithm}
              onSelect={() => onGenerate(algorithm)}
            >
              <span>{algorithm}</span>
              {value === algorithm ? (
                <Check aria-hidden="true" className="h-4 w-4 text-accent-600" />
              ) : null}
            </DropdownMenu.Item>
          ))}
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  );
}

interface ViewButtonProps {
  active: boolean;
  icon: ReactNode;
  label: string;
  onClick: () => void;
}

function ViewButton({ active, icon, label, onClick }: ViewButtonProps): JSX.Element {
  return (
    <Button onClick={onClick} size="sm" variant={active ? "secondary" : "ghost"}>
      {icon}
      {label}
    </Button>
  );
}

function StatusPill({
  decoded,
  verification,
}: {
  decoded: DecodedJwt;
  verification: JwtVerificationResult;
}): JSX.Element {
  if (decoded.error) {
    return (
      <span className="hidden h-9 items-center gap-2 rounded-md border border-rose-200 bg-rose-50 px-3 text-[12px] font-semibold text-rose-700 md:flex">
        <TriangleAlert aria-hidden="true" className="h-4 w-4" />
        Invalid JWT
      </span>
    );
  }

  if (!decoded.payload) {
    return (
      <span className="hidden h-8 items-center gap-2 rounded-md border border-slate-200 bg-slate-50 px-2.5 text-[12px] font-semibold text-slate-500 md:flex">
        <Clock3 aria-hidden="true" className="h-4 w-4" />
        Waiting
      </span>
    );
  }

  if (verification.status === "verified") {
    return (
      <span className="hidden h-8 items-center gap-2 rounded-md border border-emerald-200 bg-emerald-50 px-2.5 text-[12px] font-semibold text-emerald-700 md:flex">
        <ShieldCheck aria-hidden="true" className="h-4 w-4" />
        Signature verified
      </span>
    );
  }

  return (
    <span className="hidden h-8 items-center gap-2 rounded-md border border-amber-200 bg-amber-50 px-2.5 text-[12px] font-semibold text-amber-700 md:flex">
      <ShieldAlert aria-hidden="true" className="h-4 w-4" />
      Decoded locally
    </span>
  );
}

function TokenInput({
  lineWrap,
  onChange,
  value,
}: {
  lineWrap: boolean;
  onChange: (value: string) => void;
  value: string;
}): JSX.Element {
  const highlightRef = useRef<HTMLPreElement | null>(null);
  const [header = "", payload = "", signature = ""] = value.split(".");

  return (
    <div className="flex min-h-0 flex-1 flex-col bg-white">
      <TokenSegmentPreview
        header={header}
        payload={payload}
        signature={signature}
        visible={Boolean(value)}
      />
      <label className="relative block min-h-0 flex-1 bg-white">
        <span className="sr-only">JWT input</span>
        {value ? (
          <pre
            aria-hidden="true"
            className={cn(
              "pointer-events-none absolute inset-0 m-0 overflow-hidden border-0 bg-white p-4 font-mono text-[13px] leading-6",
              lineWrap ? "whitespace-pre-wrap break-all" : "whitespace-pre",
            )}
            ref={highlightRef}
          >
            {highlightEncodedToken(value)}
          </pre>
        ) : null}
        <textarea
          className={cn(
            "scrollbar-forge relative h-full min-h-0 w-full resize-none border-0 bg-transparent p-4 font-mono text-[13px] leading-6 outline-none placeholder:text-slate-400",
            value
              ? "text-transparent caret-slate-950 selection:bg-accent-200/70 selection:text-transparent"
              : "text-slate-950 selection:bg-accent-200/80 selection:text-slate-950",
            lineWrap ? "overflow-auto break-all" : "overflow-auto whitespace-pre",
          )}
          onChange={(event) => onChange(event.target.value)}
          onScroll={(event) => {
            if (highlightRef.current) {
              highlightRef.current.scrollTop = event.currentTarget.scrollTop;
              highlightRef.current.scrollLeft = event.currentTarget.scrollLeft;
            }
          }}
          placeholder="Paste a JWT..."
          spellCheck={false}
          value={value}
          wrap={lineWrap ? "soft" : "off"}
        />
      </label>
    </div>
  );
}

function highlightEncodedToken(value: string): JSX.Element[] {
  const parts = value.split(".");

  return parts.flatMap((part, index) => {
    const className =
      index === 0
        ? "text-accent-700"
        : index === 1
          ? "text-emerald-700"
          : "text-violet-700";
    const segment = (
      <span className={className} key={`segment-${index}`}>
        {part}
      </span>
    );

    if (index === parts.length - 1) {
      return [segment];
    }

    return [
      segment,
      <span className="text-slate-400" key={`dot-${index}`}>
        .
      </span>,
    ];
  });
}

function TokenSegmentPreview({
  header,
  payload,
  signature,
  visible,
}: {
  header: string;
  payload: string;
  signature: string;
  visible: boolean;
}): JSX.Element | null {
  if (!visible) {
    return null;
  }

  return (
    <div className="border-b border-slate-200 bg-slate-50/70 px-3 py-3">
      <div className="grid gap-2 xl:grid-cols-3">
        <TokenSegment label="Header" tone="sky" value={header || "Missing header"} />
        <TokenSegment
          label="Payload"
          tone="emerald"
          value={payload || "Missing payload"}
        />
        <TokenSegment
          label="Signature"
          tone="violet"
          value={signature || "Missing signature"}
        />
      </div>
    </div>
  );
}

function TokenSegment({
  label,
  tone,
  value,
}: {
  label: string;
  tone: "emerald" | "sky" | "violet";
  value: string;
}): JSX.Element {
  const toneClass = {
    emerald: "border-emerald-200 bg-emerald-50 text-emerald-900",
    sky: "border-accent-200 bg-accent-50 text-accent-900",
    violet: "border-violet-200 bg-violet-50 text-violet-900",
  }[tone];
  const badgeClass = {
    emerald: "bg-emerald-100 text-emerald-700",
    sky: "bg-accent-100 text-accent-700",
    violet: "bg-violet-100 text-violet-700",
  }[tone];

  return (
    <div className={cn("min-w-0 rounded-md border px-3 py-2", toneClass)}>
      <div
        className={cn(
          "mb-1 inline-flex rounded px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-[0.08em]",
          badgeClass,
        )}
      >
        {label}
      </div>
      <div className="truncate font-mono text-[12px] leading-5">{value}</div>
    </div>
  );
}

function ResultTitle({
  decoded,
  view,
}: {
  decoded: DecodedJwt;
  view: DecoderView;
}): JSX.Element {
  const title =
    view === "claims" ? "Claims" : view === "verify" ? "Verification" : "Decoded";

  return (
    <span className="flex min-w-0 items-center gap-2">
      <span>{title}</span>
      {decoded.algorithm ? (
        <span className="rounded bg-white/80 px-2 py-1 text-[12px] font-semibold normal-case tracking-normal text-slate-700 ring-1 ring-inset ring-emerald-100">
          {decoded.algorithm}
        </span>
      ) : null}
    </span>
  );
}

function HeaderStats({ decoded }: { decoded: DecodedJwt }): JSX.Element | null {
  if (!decoded.payload || decoded.error) {
    return null;
  }

  return (
    <div className="flex min-w-0 flex-wrap items-center justify-end gap-2 text-[12px] font-semibold normal-case tracking-normal text-emerald-700">
      <span>{decoded.type || "JWT"}</span>
      <span className="h-1 w-1 rounded-full bg-emerald-300" />
      <span>{decoded.signatureBytes.toLocaleString()} signature bytes</span>
      {decoded.isExpired ? <span className="text-rose-700">Expired</span> : null}
      {decoded.isNotYetValid ? (
        <span className="text-amber-700">Not yet valid</span>
      ) : null}
    </div>
  );
}

function DecodedPanel({
  decoded,
  lineWrap,
}: {
  decoded: DecodedJwt;
  lineWrap: boolean;
}): JSX.Element {
  const [headerView, setHeaderView] = useState<DecodedSectionView>("json");
  const [payloadView, setPayloadView] = useState<DecodedSectionView>("json");
  const headerRows = useMemo(
    () => getJwtBreakdownRows(decoded.headerJson, "header"),
    [decoded.headerJson],
  );
  const payloadRows = useMemo(
    () => getJwtBreakdownRows(decoded.payloadJson, "payload"),
    [decoded.payloadJson],
  );

  if (!decoded.payload) {
    return <EmptyResult />;
  }

  return (
    <div className="scrollbar-forge min-h-0 flex-1 overflow-auto bg-white p-4">
      <div className="grid gap-4">
        <JsonBlock
          label="Header"
          onViewChange={setHeaderView}
          rows={headerRows}
          tone="sky"
          value={decoded.header}
          view={headerView}
          wrap={lineWrap}
        />
        <JsonBlock
          label="Payload"
          onViewChange={setPayloadView}
          rows={payloadRows}
          tone="emerald"
          value={decoded.payload}
          view={payloadView}
          wrap={lineWrap}
        />
        <section className="rounded-lg border border-violet-100 bg-violet-50/50">
          <div className="flex items-center justify-between border-b border-violet-100 px-3 py-2">
            <div className="flex items-center gap-2 text-[12px] font-bold uppercase tracking-[0.08em] text-violet-700">
              <Signature aria-hidden="true" className="h-4 w-4" />
              Signature
            </div>
            <span className="text-[12px] font-semibold text-violet-700">
              {decoded.signatureBytes.toLocaleString()} bytes
            </span>
          </div>
          <p
            className={cn(
              "font-mono text-[13px] leading-6 text-violet-900",
              lineWrap
                ? "break-all p-3"
                : "scrollbar-forge overflow-auto whitespace-pre p-3",
            )}
          >
            {decoded.signature || "No signature"}
          </p>
        </section>
      </div>
    </div>
  );
}

function JsonBlock({
  label,
  onViewChange,
  rows,
  tone,
  value,
  view,
  wrap,
}: {
  label: string;
  onViewChange: (view: DecodedSectionView) => void;
  rows: JwtBreakdownRow[];
  tone: "emerald" | "sky";
  value: string;
  view: DecodedSectionView;
  wrap: boolean;
}): JSX.Element {
  const toneClasses =
    tone === "sky"
      ? "border-accent-100 bg-accent-50/50 text-accent-700"
      : "border-emerald-100 bg-emerald-50/50 text-emerald-700";

  return (
    <section className={cn("rounded-lg border", toneClasses)}>
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-current/10 px-3 py-2">
        <div className="text-[12px] font-bold uppercase tracking-[0.08em]">{label}</div>
        <SectionTabs onChange={onViewChange} value={view} />
      </div>
      {view === "breakdown" ? (
        <BreakdownTable rows={rows} />
      ) : (
        <pre
          className={cn(
            "scrollbar-forge overflow-auto p-3 font-mono text-[13px] leading-6 text-slate-900",
            wrap ? "whitespace-pre-wrap break-words" : "whitespace-pre",
          )}
        >
          {highlightJson(value)}
        </pre>
      )}
    </section>
  );
}

function SectionTabs({
  onChange,
  value,
}: {
  onChange: (value: DecodedSectionView) => void;
  value: DecodedSectionView;
}): JSX.Element {
  return (
    <div className="flex rounded-md bg-white/80 p-1 normal-case tracking-normal ring-1 ring-inset ring-slate-200">
      <button
        className={cn(
          "h-7 rounded px-2 text-[12px] font-semibold transition",
          value === "json"
            ? "bg-white text-slate-950 shadow-sm"
            : "text-slate-500 hover:text-slate-950",
        )}
        onClick={() => onChange("json")}
        type="button"
      >
        JSON
      </button>
      <button
        className={cn(
          "h-7 rounded px-2 text-[12px] font-semibold transition",
          value === "breakdown"
            ? "bg-white text-slate-950 shadow-sm"
            : "text-slate-500 hover:text-slate-950",
        )}
        onClick={() => onChange("breakdown")}
        type="button"
      >
        Claims Breakdown
      </button>
    </div>
  );
}

function BreakdownTable({ rows }: { rows: JwtBreakdownRow[] }): JSX.Element {
  return (
    <div className="overflow-hidden bg-white/70">
      {rows.map((row) => (
        <div
          className="grid border-b border-slate-200/80 last:border-b-0 md:grid-cols-[10rem_minmax(0,1fr)_minmax(13rem,0.95fr)]"
          key={row.name}
        >
          <div className="border-slate-200/80 px-3 py-2 font-mono text-[13px] font-semibold text-accent-700 md:border-r">
            {row.name}
          </div>
          <div className="break-words border-slate-200/80 px-3 py-2 font-mono text-[13px] leading-5 text-slate-950 md:border-r">
            {row.value}
          </div>
          <div className="flex items-start justify-between gap-2 px-3 py-2 text-[13px] leading-5 text-slate-600">
            <span>{row.description}</span>
            {row.status ? <ClaimBadge status={row.status} /> : null}
          </div>
        </div>
      ))}
    </div>
  );
}

function highlightJson(value: string): JSX.Element[] {
  return value
    .split(
      /("(?:\\.|[^"\\])*"(?=\s*:)|"(?:\\.|[^"\\])*"|true|false|null|-?\d+(?:\.\d+)?(?:[eE][+-]?\d+)?)/g,
    )
    .map((part, index) => {
      const className =
        /^"(?:\\.|[^"\\])*"$/.test(part) && value.includes(`${part}:`)
          ? "text-accent-700"
          : /^"/.test(part)
            ? "text-emerald-700"
            : /^(true|false|null)$/.test(part)
              ? "font-semibold text-violet-700"
              : /^-?\d/.test(part)
                ? "text-orange-700"
                : "text-slate-900";

      return (
        <span className={className} key={`${part}-${index}`}>
          {part}
        </span>
      );
    });
}

function ClaimsPanel({
  claims,
  warnings,
}: {
  claims: JwtClaimInsight[];
  warnings: JwtSecurityWarning[];
}): JSX.Element {
  return (
    <div className="scrollbar-forge min-h-0 flex-1 overflow-auto bg-white p-4">
      <div className="grid gap-4">
        <div className="grid gap-2 md:grid-cols-2">
          {claims.map((claim) => (
            <ClaimCard claim={claim} key={claim.name} />
          ))}
        </div>
        {warnings.length > 0 ? (
          <div className="grid gap-2">
            {warnings.map((warning) => (
              <WarningCard
                key={`${warning.title}-${warning.message}`}
                warning={warning}
              />
            ))}
          </div>
        ) : (
          <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-4 text-[13px] font-medium text-emerald-800">
            No obvious JWT claim warnings detected. Still validate issuer, audience, and
            signature on the server.
          </div>
        )}
      </div>
    </div>
  );
}

function ClaimCard({ claim }: { claim: JwtClaimInsight }): JSX.Element {
  return (
    <section className="rounded-lg border border-slate-200 bg-white p-3 shadow-sm">
      <div className="flex items-center justify-between gap-2">
        <span className="font-mono text-[12px] font-bold text-accent-700">
          {claim.name}
        </span>
        {claim.status ? <ClaimBadge status={claim.status} /> : null}
      </div>
      <p className="mt-1 text-[12px] font-semibold text-slate-500">{claim.description}</p>
      <p className="mt-2 break-words font-mono text-[13px] leading-5 text-slate-950">
        {claim.value}
      </p>
    </section>
  );
}

function ClaimBadge({ status }: { status: JwtClaimStatus }): JSX.Element {
  const className = {
    active: "bg-emerald-50 text-emerald-700 ring-emerald-100",
    expired: "bg-rose-50 text-rose-700 ring-rose-100",
    future: "bg-amber-50 text-amber-700 ring-amber-100",
    missing: "bg-slate-50 text-slate-500 ring-slate-100",
  }[status];

  return (
    <span className={cn("rounded px-2 py-0.5 text-[11px] font-bold ring-1", className)}>
      {status}
    </span>
  );
}

function WarningCard({ warning }: { warning: JwtSecurityWarning }): JSX.Element {
  const className =
    warning.tone === "rose"
      ? "border-rose-200 bg-rose-50 text-rose-800"
      : "border-amber-200 bg-amber-50 text-amber-800";

  return (
    <section className={cn("rounded-lg border p-3", className)}>
      <div className="flex items-start gap-3">
        <TriangleAlert aria-hidden="true" className="mt-0.5 h-4 w-4 shrink-0" />
        <div>
          <p className="text-[13px] font-bold">{warning.title}</p>
          <p className="mt-1 text-[13px] leading-5">{warning.message}</p>
        </div>
      </div>
    </section>
  );
}

function VerifyPanel({
  decoded,
  onSecretChange,
  secret,
  verification,
}: {
  decoded: DecodedJwt;
  onSecretChange: (value: string) => void;
  secret: string;
  verification: JwtVerificationResult;
}): JSX.Element {
  return (
    <div className="scrollbar-forge min-h-0 flex-1 overflow-auto bg-white p-4">
      <div className="grid gap-4">
        <VerificationBanner verification={verification} />
        <label className="grid gap-2">
          <span className="text-[12px] font-bold uppercase tracking-[0.08em] text-slate-500">
            HMAC shared secret
          </span>
          <textarea
            className="scrollbar-forge min-h-32 resize-y rounded-lg border border-slate-200 bg-slate-50 p-3 font-mono text-[13px] leading-6 text-slate-950 outline-none transition placeholder:text-slate-400 focus:border-accent-500 focus:bg-white focus:ring-4 focus:ring-accent-100"
            onChange={(event) => onSecretChange(event.target.value)}
            placeholder="Enter HS256 / HS384 / HS512 secret..."
            spellCheck={false}
            value={secret}
          />
        </label>
        <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
          <p className="text-[13px] font-semibold text-slate-700">
            Algorithm:{" "}
            <span className="font-mono text-slate-950">
              {decoded.algorithm || "Unknown"}
            </span>
          </p>
          <p className="mt-2 text-[13px] leading-5 text-slate-600">
            Forge verifies HMAC tokens locally with Web Crypto. For RSA, PSS, ECDSA, or
            EdDSA tokens, paste the token here to inspect it and verify the signature with
            your auth service or a public-key verifier.
          </p>
        </div>
      </div>
    </div>
  );
}

function VerificationBanner({
  verification,
}: {
  verification: JwtVerificationResult;
}): JSX.Element {
  const config = {
    error: {
      className: "border-rose-200 bg-rose-50 text-rose-800",
      icon: <TriangleAlert aria-hidden="true" className="h-5 w-5" />,
      title: "Verification error",
    },
    failed: {
      className: "border-rose-200 bg-rose-50 text-rose-800",
      icon: <XCircle aria-hidden="true" className="h-5 w-5" />,
      title: "Signature mismatch",
    },
    idle: {
      className: "border-slate-200 bg-slate-50 text-slate-700",
      icon: <KeyRound aria-hidden="true" className="h-5 w-5" />,
      title: "Ready to verify",
    },
    unsupported: {
      className: "border-amber-200 bg-amber-50 text-amber-800",
      icon: <ShieldAlert aria-hidden="true" className="h-5 w-5" />,
      title: "Verifier unavailable",
    },
    verified: {
      className: "border-emerald-200 bg-emerald-50 text-emerald-800",
      icon: <CheckCircle2 aria-hidden="true" className="h-5 w-5" />,
      title: "Signature verified",
    },
  }[verification.status];

  return (
    <section className={cn("rounded-lg border p-4", config.className)}>
      <div className="flex items-start gap-3">
        {config.icon}
        <div>
          <p className="text-[14px] font-bold">{config.title}</p>
          <p className="mt-1 text-[13px] leading-5">{verification.message}</p>
        </div>
      </div>
    </section>
  );
}

function ErrorPanel({ decoded }: { decoded: DecodedJwt }): JSX.Element {
  return (
    <div className="scrollbar-forge min-h-0 flex-1 overflow-auto bg-white p-4">
      <div className="rounded-lg border border-rose-200 bg-rose-50 p-4 text-rose-800">
        <div className="flex items-start gap-3">
          <TriangleAlert aria-hidden="true" className="mt-0.5 h-5 w-5 shrink-0" />
          <div className="min-w-0">
            <p className="text-[14px] font-semibold">Invalid JWT</p>
            <p className="mt-1 break-words font-mono text-[13px] leading-5">
              {decoded.error}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

function EmptyResult(): JSX.Element {
  return (
    <div className="flex min-h-64 items-center justify-center p-8 text-center text-[13px] font-medium text-slate-400">
      Paste a JWT to decode its header, payload, claims, and signature.
    </div>
  );
}
