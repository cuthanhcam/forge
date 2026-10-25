import type { JSX } from "react";
import { useMemo, useState } from "react";
import {
  CheckCircle2,
  Copy,
  Download,
  Eye,
  EyeOff,
  RefreshCw,
  ShieldCheck,
} from "lucide-react";
import { cn } from "@/shared/lib/cn";
import { Button } from "@/shared/ui/button";
import { Tooltip } from "@/shared/ui/tooltip";
import { PaneHeader, ToolSurface, ToolToolbar } from "@/shared/components/ToolSurface";
import {
  createJwtSecret,
  type GeneratedSecret,
  type JwtSecretSize,
  type SecretFormat,
} from "@/features/password-generator/password-generator.service";

const bitMarks = [32, 128, 256, 384, 512];

export function JwtSecretPage(): JSX.Element {
  const [version, setVersion] = useState(0);
  const [size, setSize] = useState<JwtSecretSize>(256);
  const [format, setFormat] = useState<SecretFormat>("base64url");
  const [visible, setVisible] = useState(false);
  const result = useMemo(() => {
    void version;

    return createJwtSecret({
      format,
      size,
      variableName: "JWT_SECRET",
    });
  }, [format, size, version]);

  async function copySecret(): Promise<void> {
    await navigator.clipboard.writeText(result.value);
  }

  function downloadSecret(): void {
    const blob = new Blob([result.value], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");

    anchor.href = url;
    anchor.download = "forge-jwt-secret.txt";
    anchor.click();
    URL.revokeObjectURL(url);
  }

  return (
    <ToolSurface>
      <ToolToolbar
        left={
          <div className="flex min-w-0 flex-wrap items-center gap-2">
            <SegmentedControl
              onChange={setFormat}
              options={[
                { label: "Base64URL", value: "base64url" },
                { label: "Base64", value: "base64" },
                { label: "Hex", value: "hex" },
              ]}
              value={format}
            />
          </div>
        }
        right={
          <>
            <span className="hidden h-8 items-center gap-2 rounded-md border border-emerald-200 bg-emerald-50 px-2.5 text-[12px] font-semibold text-emerald-700 md:flex">
              <CheckCircle2 aria-hidden="true" className="h-4 w-4" />
              {size} bits
            </span>
            <Button
              className="h-9 px-3"
              onClick={() => setVersion((value) => value + 1)}
              size="sm"
              variant="secondary"
            >
              <RefreshCw aria-hidden="true" className="h-4 w-4" />
              Generate
            </Button>
            <Tooltip content="Download secret" side="bottom">
              <Button
                aria-label="Download secret"
                onClick={downloadSecret}
                size="icon"
                variant="ghost"
              >
                <Download aria-hidden="true" className="h-4 w-4" />
              </Button>
            </Tooltip>
          </>
        }
      />

      <div className="grid min-h-0 flex-1 overflow-hidden xl:grid-cols-[minmax(0,0.82fr)_minmax(0,1.18fr)]">
        <div className="flex min-h-0 flex-col">
          <PaneHeader title="Secret options" tone="blue" />
          <div className="scrollbar-forge min-h-0 flex-1 overflow-auto bg-white p-4">
            <section className="grid gap-3">
              <p className="text-[12px] font-bold uppercase tracking-[0.08em] text-slate-500">
                Preset length
              </p>
              <div className="grid gap-2 sm:grid-cols-3">
                <PresetCard
                  active={size === 256}
                  description="Minimum recommended HMAC secret for HS256."
                  label="HS256"
                  onClick={() => setSize(256)}
                  value="256 bits"
                />
                <PresetCard
                  active={size === 384}
                  description="Stronger shared secret for HS384."
                  label="HS384"
                  onClick={() => setSize(384)}
                  value="384 bits"
                />
                <PresetCard
                  active={size === 512}
                  description="High entropy shared secret for HS512."
                  label="HS512"
                  onClick={() => setSize(512)}
                  value="512 bits"
                />
              </div>
            </section>
            <section className="mt-6">
              <div className="mb-3 flex items-center justify-between">
                <p className="text-[12px] font-bold uppercase tracking-[0.08em] text-slate-500">
                  Custom length
                </p>
                <span className="text-[13px] font-bold text-sky-700">{size} bits</span>
              </div>
              <input
                className="w-full accent-sky-600"
                aria-label="Secret length in bits"
                aria-valuetext={`${size} bits`}
                max={512}
                min={32}
                onChange={(event) => setSize(Number(event.target.value))}
                step={8}
                type="range"
                value={size}
              />
              <div className="mt-2 flex justify-between text-[12px] font-medium text-slate-500">
                {bitMarks.map((mark) => (
                  <span key={mark}>{mark}</span>
                ))}
              </div>
            </section>
            <section className="mt-6 rounded-lg border border-slate-200 bg-slate-50 p-3 text-[13px] leading-5 text-slate-600">
              <div className="flex gap-2">
                <ShieldCheck aria-hidden="true" className="mt-0.5 h-4 w-4 text-sky-600" />
                <p>
                  Generated locally with Web Crypto. Store this value in your secret
                  manager or environment config, and rotate it if it is ever exposed.
                </p>
              </div>
            </section>
          </div>
        </div>

        <div className="flex min-h-0 flex-col border-t border-slate-200 xl:border-l xl:border-t-0">
          <PaneHeader
            actions={
              <span className="text-[12px] font-semibold normal-case tracking-normal text-emerald-700">
                {result.value.length.toLocaleString()} chars
              </span>
            }
            title="Generated secret"
            tone="emerald"
          />
          <SecretOutput
            onCopy={() => void copySecret()}
            onToggleVisibility={() => setVisible((current) => !current)}
            result={result}
            visible={visible}
          />
        </div>
      </div>
    </ToolSurface>
  );
}

function PresetCard({
  active,
  description,
  label,
  onClick,
  value,
}: {
  active: boolean;
  description: string;
  label: string;
  onClick: () => void;
  value: string;
}): JSX.Element {
  return (
    <button
      className={cn(
        "rounded-lg border p-3 text-left transition",
        active
          ? "border-sky-300 bg-sky-50 ring-2 ring-sky-100"
          : "border-slate-200 bg-white hover:border-sky-200 hover:bg-sky-50/40",
      )}
      onClick={onClick}
      type="button"
    >
      <span className="block text-[14px] font-bold text-slate-950">{label}</span>
      <span className="mt-1 block font-mono text-[13px] font-semibold text-sky-700">
        {value}
      </span>
      <span className="mt-2 block text-[12px] leading-5 text-slate-500">
        {description}
      </span>
    </button>
  );
}

function SegmentedControl<T extends string>({
  onChange,
  options,
  value,
}: {
  onChange: (value: T) => void;
  options: Array<{ label: string; value: T }>;
  value: T;
}): JSX.Element {
  return (
    <div className="flex flex-wrap gap-1 rounded-md border border-slate-200 bg-white p-1 shadow-sm">
      {options.map((option) => (
        <button
          className={cn(
            "h-8 rounded px-2.5 text-[12px] font-semibold transition",
            value === option.value
              ? "bg-sky-50 text-sky-700 ring-1 ring-inset ring-sky-100"
              : "text-slate-500 hover:bg-slate-50 hover:text-slate-950",
          )}
          key={option.value}
          onClick={() => onChange(option.value)}
          type="button"
        >
          {option.label}
        </button>
      ))}
    </div>
  );
}

function SecretOutput({
  onCopy,
  onToggleVisibility,
  result,
  visible,
}: {
  onCopy: () => void;
  onToggleVisibility: () => void;
  result: GeneratedSecret;
  visible: boolean;
}): JSX.Element {
  return (
    <div className="scrollbar-forge min-h-0 flex-1 overflow-auto bg-white p-4">
      <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start">
          <p className="min-w-0 flex-1 break-all font-mono text-[18px] font-semibold leading-8 text-slate-950">
            {visible ? result.value : maskSecret(result.value)}
          </p>
          <div className="flex shrink-0 flex-wrap gap-2">
            <Button onClick={onToggleVisibility} size="sm" variant="ghost">
              {visible ? (
                <EyeOff aria-hidden="true" className="h-4 w-4" />
              ) : (
                <Eye aria-hidden="true" className="h-4 w-4" />
              )}
              {visible ? "Hide" : "Show"}
            </Button>
            <Button onClick={onCopy} size="sm" variant="secondary">
              <Copy aria-hidden="true" className="h-4 w-4" />
              Copy
            </Button>
          </div>
        </div>
      </div>
      <div className="mt-4 grid gap-3 sm:grid-cols-3">
        <Metric label="Strength" value={result.strength} />
        <Metric label="Entropy" value={`${Math.round(result.entropyBits)} bits`} />
        <Metric label="Format" value="Secret only" />
      </div>
    </div>
  );
}

function Metric({ label, value }: { label: string; value: string }): JSX.Element {
  return (
    <div className="rounded-lg border border-slate-200 bg-white p-3">
      <p className="text-[11px] font-bold uppercase tracking-[0.08em] text-slate-400">
        {label}
      </p>
      <p className="mt-1 text-[14px] font-semibold text-slate-950">{value}</p>
    </div>
  );
}

function maskSecret(secret: string): string {
  if (secret.length <= 12) {
    return "*".repeat(secret.length);
  }

  return `${secret.slice(0, 6)}${"*".repeat(Math.max(12, secret.length - 12))}${secret.slice(-6)}`;
}
