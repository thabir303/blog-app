"use client";

import { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";
import { ROLE_CONFIG } from "@/components/RoleChip";

export default function RoleLegend() {
  const [open, setOpen] = useState(false);
  const [coords, setCoords] = useState({ top: 0, right: 0 });
  const [portalEl, setPortalEl] = useState<HTMLElement | null>(null);
  const btnRef = useRef<HTMLButtonElement>(null);

  // Create a dedicated portal container appended to body
  useEffect(() => {
    const el = document.createElement("div");
    el.setAttribute("data-portal", "role-legend");
    document.body.appendChild(el);
    setPortalEl(el);
    return () => { document.body.removeChild(el); };
  }, []);

  const handleToggle = () => {
    if (!open && btnRef.current) {
      const rect = btnRef.current.getBoundingClientRect();
      setCoords({ top: rect.bottom + 8, right: window.innerWidth - rect.right });
    }
    setOpen((v) => !v);
  };

  return (
    <>
      <button
        ref={btnRef}
        onClick={handleToggle}
        aria-label="Role legend"
        className="h-5 w-5 rounded-full border border-border bg-muted text-muted-foreground text-[11px] font-bold flex items-center justify-center hover:bg-accent hover:text-foreground transition-colors leading-none shrink-0"
      >
        ?
      </button>

      {portalEl && open && createPortal(
        <>
          {/* Transparent backdrop */}
          <div
            style={{ position: "fixed", inset: 0, zIndex: 9998 }}
            onClick={() => setOpen(false)}
          />
          {/* Popup */}
          <div
            style={{ position: "fixed", top: coords.top, right: coords.right, zIndex: 9999 }}
            className="w-80 bg-popover border border-border rounded-xl shadow-xl overflow-hidden"
          >
            <div className="flex items-center justify-between px-4 py-2.5 border-b border-border bg-muted/40">
              <p className="text-xs font-semibold text-foreground uppercase tracking-wider">Role Guide</p>
              <button
                onClick={() => setOpen(false)}
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
            <div className="p-3 space-y-2.5">
              {(Object.entries(ROLE_CONFIG) as [string, typeof ROLE_CONFIG[keyof typeof ROLE_CONFIG]][]).map(([key, cfg]) => {
                const Icon = cfg.icon;
                return (
                  <div key={key} className="flex items-start gap-3">
                    <span className={`inline-flex items-center gap-1 text-xs font-medium shrink-0 mt-0.5 ${cfg.text}`}>
                      <Icon className="h-3 w-3 shrink-0" />
                      {cfg.label}
                    </span>
                    <p className="text-xs text-muted-foreground leading-relaxed">{cfg.description}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </>,
        portalEl
      )}
    </>
  );
}
