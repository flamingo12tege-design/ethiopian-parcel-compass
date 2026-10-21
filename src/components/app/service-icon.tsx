type ServiceIconKind = "office" | "calculator" | "claim" | "guide" | "info";

/** Postal-themed line illustrations with shared navy and yellow brand tokens. */
export function ServiceIcon({ kind }: { kind: ServiceIconKind }) {
  return (
    <svg viewBox="0 0 48 48" className="h-12 w-12 shrink-0 text-primary" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      {kind === "office" && <><path d="M8 21h32v20H8z" /><path d="m6 21 18-13 18 13" className="fill-highlight" /><path d="M20 41V29h8v12M12 27h4v5h-4zM32 27h4v5h-4z" /><path d="M24 8V3h10v6H24" className="fill-highlight" /></>}
      {kind === "calculator" && <><rect x="10" y="5" width="28" height="38" rx="4" /><path d="M15 11h18v9H15z" className="fill-highlight" /><path d="M16 27h3m-1.5-1.5v3M28 27h4M16 35h3M28 34h4m-4 3h4" /></>}
      {kind === "claim" && <><path d="M9 10h24v31H9z" /><path d="M14 16h13M14 22h9M14 28h6" /><path d="m33 22 10 4v8c0 5-6 9-10 11-4-2-10-6-10-11v-8z" className="fill-highlight" /><path d="M33 28v7m0 4h.01" /></>}
      {kind === "guide" && <><path d="M24 12c-5-5-13-6-20-3v29c7-3 15-2 20 3 5-5 13-6 20-3V9c-7-3-15-2-20 3Z" /><path d="M24 12v29M9 16h9M9 22h9M9 28h7" /><path d="m29 18 6-3 6 3v9l-6 3-6-3z" className="fill-highlight" /><path d="m29 18 6 3 6-3m-6 3v9" /></>}
      {kind === "info" && <><path d="M7 7h34v27H27l-9 8v-8H7z" /><circle cx="24" cy="20" r="9" className="fill-highlight" /><path d="M24 19v7m0-12h.01" /></>}
    </svg>
  );
}