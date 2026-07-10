import { Loader2 } from "lucide-react";
import AppStoreIcon from "./AppStoreIcon";

interface StoreCtaLinkProps {
  href: string;
  children: React.ReactNode;
  className?: string;
}

export function StoreCtaLink({ href, children, className = "" }: StoreCtaLinkProps) {
  return (
    <a href={href} className={`btn-primary gap-2 ${className}`.trim()}>
      <span>{children}</span>
      <AppStoreIcon />
    </a>
  );
}

interface StoreCtaButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  loading?: boolean;
  loadingLabel?: string;
}

export function StoreCtaButton({
  children,
  className = "",
  loading = false,
  loadingLabel = "Processing...",
  disabled,
  ...props
}: StoreCtaButtonProps) {
  return (
    <button
      type="submit"
      className={`btn-primary w-full gap-2 ${className}`.trim()}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? (
        <>
          <Loader2 className="h-4 w-4 animate-spin" />
          {loadingLabel}
        </>
      ) : (
        <>
          <span>{children}</span>
          <AppStoreIcon />
        </>
      )}
    </button>
  );
}
