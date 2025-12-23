import { ReactNode } from "react";
import { Loader2 } from "lucide-react";

interface ActionButtonProps {
  onClick: () => void;
  disabled?: boolean;
  icon: ReactNode;
  label: string;
  isLoading?: boolean;
  loadingLabel?: string;
  isActive?: boolean;
  activeIcon?: ReactNode;
  activeLabel?: string;
  activeClassName?: string;
}

const actionButtonStyles = `flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-xs font-medium text-zinc-400 transition-colors hover:bg-zinc-800 hover:text-zinc-200 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:bg-transparent disabled:hover:text-zinc-400`;

export function ActionButton({
  onClick,
  disabled,
  icon,
  label,
  isLoading,
  loadingLabel,
  isActive,
  activeIcon,
  activeLabel,
  activeClassName = "",
}: ActionButtonProps) {
  const renderContent = () => {
    if (isLoading && loadingLabel) {
      return (
        <>
          <Loader2 className="h-3.5 w-3.5 animate-spin" />
          <span>{loadingLabel}</span>
        </>
      );
    }

    if (isActive && activeIcon && activeLabel) {
      return (
        <>
          {activeIcon}
          <span className={activeClassName}>{activeLabel}</span>
        </>
      );
    }

    return (
      <>
        {icon}
        <span>{label}</span>
      </>
    );
  };

  return (
    <button onClick={onClick} disabled={disabled} className={actionButtonStyles}>
      {renderContent()}
    </button>
  );
}
