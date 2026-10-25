import type { JSX, ReactNode } from "react";
import { useMemo, useState } from "react";
import {
  CheckCircle2,
  Copy,
  Download,
  KeyRound,
  RefreshCw,
  SlidersHorizontal,
  TextCursorInput,
  Eye,
  EyeOff,
} from "lucide-react";
import { cn } from "@/shared/lib/cn";
import { RangeInput } from "@/shared/ui/range";
import { Button } from "@/shared/ui/button";
import { Tooltip } from "@/shared/ui/tooltip";
import { PaneHeader, ToolSurface, ToolToolbar } from "@/shared/components/ToolSurface";
import {
  createPassphrase,
  createPassword,
  type GeneratedSecret,
  type PassphraseOptions,
  type PasswordMode,
  type PasswordOptions,
} from "./password-generator.service";

export function PasswordGeneratorPage(): JSX.Element {
  const [version, setVersion] = useState(0);
  const [mode, setMode] = useState<PasswordMode>("password");
  const [passwordOptions, setPasswordOptions] = useState<PasswordOptions>({
    avoidAmbiguous: true,
    includeLowercase: true,
    includeNumbers: true,
    includeSymbols: true,
    includeUppercase: true,
    length: 24,
  });
  const [passphraseOptions, setPassphraseOptions] = useState<PassphraseOptions>({
    separator: "-",
    titleCase: false,
    words: 5,
  });
  const result = useMemo(() => {
    void version;

    if (mode === "passphrase") {
      return createPassphrase(passphraseOptions);
    }

    return createPassword(passwordOptions);
  }, [mode, passphraseOptions, passwordOptions, version]);

  async function copySecret(): Promise<void> {
    await navigator.clipboard.writeText(result.value);
  }

  function downloadSecret(): void {
    const blob = new Blob([result.value], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");

    anchor.href = url;
    anchor.download = "forge-password.txt";
    anchor.click();
    URL.revokeObjectURL(url);
  }

  return (
    <ToolSurface>
      <ToolToolbar
        left={
          <div className="flex min-w-0 flex-wrap items-center gap-2">
            <ModeButton
              active={mode === "password"}
              icon={<KeyRound aria-hidden="true" className="h-4 w-4" />}
              label="Password"
              onClick={() => setMode("password")}
            />
            <ModeButton
              active={mode === "passphrase"}
              icon={<TextCursorInput aria-hidden="true" className="h-4 w-4" />}
              label="Passphrase"
              onClick={() => setMode("passphrase")}
            />
          </div>
        }
        right={
          <>
            <span className="hidden h-8 items-center gap-2 rounded-md border border-emerald-200 bg-emerald-50 px-2.5 text-[12px] font-semibold text-emerald-700 md:flex">
              <CheckCircle2 aria-hidden="true" className="h-4 w-4" />
              {result.strength}
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
            <Tooltip content="Download output" side="bottom">
              <Button
                aria-label="Download output"
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

      <div className="grid min-h-0 flex-1 overflow-hidden xl:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
        <div className="flex min-h-0 flex-col">
          <PaneHeader
            actions={
              <span className="text-[12px] font-semibold normal-case tracking-normal text-accent-600">
                <SlidersHorizontal
                  aria-hidden="true"
                  className="mr-1 inline h-3.5 w-3.5"
                />
                Local crypto
              </span>
            }
            title="Options"
            tone="blue"
          />
          <OptionsPanel
            mode={mode}
            onPassphraseChange={setPassphraseOptions}
            onPasswordChange={setPasswordOptions}
            passphraseOptions={passphraseOptions}
            passwordOptions={passwordOptions}
          />
        </div>
        <div className="flex min-h-0 flex-col border-t border-slate-200 xl:border-l xl:border-t-0">
          <PaneHeader
            actions={
              <span className="text-[12px] font-semibold normal-case tracking-normal text-emerald-700">
                {Math.round(result.entropyBits)} bits entropy
              </span>
            }
            title={result.label}
            tone="emerald"
          />
          <SecretOutput onCopy={() => void copySecret()} result={result} />
        </div>
      </div>
    </ToolSurface>
  );
}

function ModeButton({
  active,
  icon,
  label,
  onClick,
}: {
  active: boolean;
  icon: ReactNode;
  label: string;
  onClick: () => void;
}): JSX.Element {
  return (
    <Button onClick={onClick} size="sm" variant={active ? "secondary" : "ghost"}>
      {icon}
      {label}
    </Button>
  );
}

function OptionsPanel({
  mode,
  onPassphraseChange,
  onPasswordChange,
  passphraseOptions,
  passwordOptions,
}: {
  mode: PasswordMode;
  onPassphraseChange: (value: PassphraseOptions) => void;
  onPasswordChange: (value: PasswordOptions) => void;
  passphraseOptions: PassphraseOptions;
  passwordOptions: PasswordOptions;
}): JSX.Element {
  if (mode === "passphrase") {
    return (
      <div className="scrollbar-forge min-h-0 flex-1 overflow-auto bg-white p-4">
        <ControlGroup title="Common lengths">
          <div className="grid gap-2 sm:grid-cols-3">
            {[4, 5, 6].map((words) => (
              <PresetCard
                active={passphraseOptions.words === words}
                key={words}
                label={`${words} words`}
                onClick={() => onPassphraseChange({ ...passphraseOptions, words })}
                value={words === 4 ? "Quick" : words === 5 ? "Balanced" : "Strong"}
              />
            ))}
          </div>
        </ControlGroup>
        <RangeControl
          label="Words"
          max={12}
          min={3}
          onChange={(words) => onPassphraseChange({ ...passphraseOptions, words })}
          value={passphraseOptions.words}
        />
        <ControlGroup title="Separator">
          <SegmentedControl
            onChange={(separator) =>
              onPassphraseChange({ ...passphraseOptions, separator })
            }
            options={[
              { label: "Dash", value: "-" },
              { label: "Dot", value: "." },
              { label: "Space", value: " " },
              { label: "None", value: "" },
            ]}
            value={passphraseOptions.separator}
          />
        </ControlGroup>
        <CheckOption
          checked={passphraseOptions.titleCase}
          label="Title case words"
          onChange={(titleCase) =>
            onPassphraseChange({ ...passphraseOptions, titleCase })
          }
        />
      </div>
    );
  }

  return (
    <div className="scrollbar-forge min-h-0 flex-1 overflow-auto bg-white p-4">
      <ControlGroup title="Common lengths">
        <div className="grid gap-2 sm:grid-cols-4">
          {[16, 24, 32, 64].map((length) => (
            <PresetCard
              active={passwordOptions.length === length}
              key={length}
              label={`${length}`}
              onClick={() => onPasswordChange({ ...passwordOptions, length })}
              value={length < 24 ? "Login" : length < 64 ? "Strong" : "Maximum"}
            />
          ))}
        </div>
      </ControlGroup>
      <RangeControl
        label="Length"
        max={128}
        min={8}
        onChange={(length) => onPasswordChange({ ...passwordOptions, length })}
        value={passwordOptions.length}
      />
      <div className="mt-4 grid gap-2 sm:grid-cols-2">
        {[
          ["includeLowercase", "Lowercase"],
          ["includeUppercase", "Uppercase"],
          ["includeNumbers", "Numbers"],
          ["includeSymbols", "Symbols"],
          ["avoidAmbiguous", "Avoid ambiguous"],
        ].map(([key, label]) => (
          <CheckOption
            checked={Boolean(passwordOptions[key as keyof PasswordOptions])}
            key={key}
            label={label}
            onChange={(checked) =>
              onPasswordChange({ ...passwordOptions, [key]: checked })
            }
          />
        ))}
      </div>
    </div>
  );
}

function ControlGroup({
  children,
  title,
}: {
  children: ReactNode;
  title: string;
}): JSX.Element {
  return (
    <section className="mb-4">
      <p className="mb-2 text-[12px] font-bold uppercase tracking-[0.08em] text-slate-500">
        {title}
      </p>
      {children}
    </section>
  );
}

function PresetCard({
  active,
  label,
  onClick,
  value,
}: {
  active: boolean;
  label: string;
  onClick: () => void;
  value: string;
}): JSX.Element {
  return (
    <button
      className={cn(
        "rounded-lg border p-3 text-left transition",
        active
          ? "border-accent-300 bg-accent-50 ring-2 ring-accent-100"
          : "border-slate-200 bg-white hover:border-accent-200 hover:bg-accent-50/40",
      )}
      onClick={onClick}
      type="button"
    >
      <span className="block text-[14px] font-bold text-slate-950">{label}</span>
      <span className="mt-1 block text-[12px] font-semibold text-accent-700">
        {value}
      </span>
    </button>
  );
}

function SegmentedControl<T extends string | number>({
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
              ? "bg-accent-50 text-accent-700 ring-1 ring-inset ring-accent-100"
              : "text-slate-500 hover:bg-slate-50 hover:text-slate-950",
          )}
          key={String(option.value)}
          onClick={() => onChange(option.value)}
          type="button"
        >
          {option.label}
        </button>
      ))}
    </div>
  );
}

function RangeControl({
  label,
  max,
  min,
  onChange,
  value,
}: {
  label: string;
  max: number;
  min: number;
  onChange: (value: number) => void;
  value: number;
}): JSX.Element {
  return (
    <label className="block rounded-lg border border-slate-200 bg-slate-50 p-3">
      <span className="flex items-center justify-between text-[12px] font-bold uppercase tracking-[0.08em] text-slate-500">
        {label}
        <span className="font-mono text-[13px] text-slate-950">{value}</span>
      </span>
      <RangeInput
        className="mt-2"
        label={label}
        min={min}
        max={max}
        value={value}
        onChange={onChange}
      />
    </label>
  );
}

function CheckOption({
  checked,
  label,
  onChange,
}: {
  checked: boolean;
  label: string;
  onChange: (checked: boolean) => void;
}): JSX.Element {
  return (
    <label className="flex items-center gap-2 rounded-md border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700">
      <input
        checked={checked}
        className="accent-accent-600"
        onChange={(event) => onChange(event.target.checked)}
        type="checkbox"
      />
      {label}
    </label>
  );
}

function SecretOutput({
  onCopy,
  result,
}: {
  onCopy: () => void;
  result: GeneratedSecret;
}): JSX.Element {
  const [visible, setVisible] = useState(false);

  return (
    <div className="scrollbar-forge min-h-0 flex-1 overflow-auto bg-white p-4">
      <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start">
          <p className="min-w-0 flex-1 break-all font-mono text-[18px] font-semibold leading-8 text-slate-950">
            {visible ? result.value : maskSecret(result.value)}
          </p>
          <div className="flex shrink-0 flex-wrap gap-2">
            <Button
              onClick={() => setVisible((current) => !current)}
              size="sm"
              variant="ghost"
            >
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
        <Metric label="Length" value={`${result.value.length} chars`} />
      </div>
    </div>
  );
}

function maskSecret(secret: string): string {
  if (secret.length <= 12) {
    return "*".repeat(secret.length);
  }

  return `${secret.slice(0, 6)}${"*".repeat(Math.max(12, secret.length - 12))}${secret.slice(-6)}`;
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
