import { cn } from "@/lib/utils";

interface SpinnerProps extends React.HTMLAttributes<HTMLDivElement> {
  size?: "sm" | "md" | "lg" | "xl";
  variant?: "primary" | "secondary" | "muted";
}

export function Spinner({ className, size = "md", variant = "primary", ...props }: SpinnerProps) {
  const sizeClasses = {
    sm: "w-4 h-4 border-2",
    md: "w-6 h-6 border-2",
    lg: "w-8 h-8 border-3",
    xl: "w-12 h-12 border-4",
  };

  const variantClasses = {
    primary: "border-indigo-600 dark:border-indigo-500 border-t-transparent dark:border-t-transparent",
    secondary: "border-emerald-600 dark:border-emerald-500 border-t-transparent dark:border-t-transparent",
    muted: "border-slate-300 dark:border-slate-700 border-t-transparent dark:border-t-transparent",
  };

  return (
    <div
      className={cn(
        "rounded-full animate-spin inline-block",
        sizeClasses[size],
        variantClasses[variant],
        className
      )}
      role="status"
      aria-label="loading"
      {...props}
    >
      <span className="sr-only">Loading...</span>
    </div>
  );
}
