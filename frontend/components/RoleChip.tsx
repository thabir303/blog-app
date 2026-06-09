import { Crown, ShieldCheck, User, Eye } from "lucide-react";
import { cn } from "@/lib/utils";

export const ROLE_CONFIG = {
  super_admin: {
    icon: Crown,
    label: "Super Admin",
    text: "text-rose-600 dark:text-rose-400",
    bg: "bg-rose-50 dark:bg-rose-950/50",
    dot: "bg-rose-500",
    description: "Full access — manage users, delete any content, assign roles",
  },
  moderator: {
    icon: ShieldCheck,
    label: "Moderator",
    text: "text-violet-600 dark:text-violet-400",
    bg: "bg-violet-50 dark:bg-violet-950/50",
    dot: "bg-violet-500",
    description: "Delete any post or comment. Cannot manage users.",
  },
  regular_user: {
    icon: User,
    label: "Regular User",
    text: "text-sky-600 dark:text-sky-400",
    bg: "bg-sky-50 dark:bg-sky-950/50",
    dot: "bg-sky-500",
    description: "Create posts & comments. Edit or delete own content only.",
  },
  guest: {
    icon: Eye,
    label: "Guest",
    text: "text-slate-500 dark:text-slate-400",
    bg: "bg-slate-100 dark:bg-slate-800/50",
    dot: "bg-slate-400",
    description: "Read-only. Cannot post or comment.",
  },
} as const;

type Role = keyof typeof ROLE_CONFIG;

interface Props {
  role: string;
  iconOnly?: boolean;
  className?: string;
}

export default function RoleChip({ role, iconOnly = false, className }: Props) {
  const cfg = ROLE_CONFIG[role as Role] ?? ROLE_CONFIG.guest;
  const Icon = cfg.icon;
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 text-xs font-medium",
        cfg.text,
        iconOnly ? "" : "px-0.5",
        className
      )}
    >
      <Icon className="h-3 w-3 shrink-0" />
      {!iconOnly && cfg.label}
    </span>
  );
}
