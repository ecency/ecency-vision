import { HTMLAttributes } from "react";

export type ButtonAppearance =
  | "primary"
  | "secondary"
  | "link"
  | "danger"
  | "success"
  | "warning"
  | "info";
export type ButtonSize = "sm" | "md" | "lg";

interface BaseButtonProps {
  appearance?: ButtonAppearance;
  size?: ButtonSize;
  outline?: boolean;
  className?: string;
  disabled?: boolean;
  full?: boolean;
  href?: string;
  target?: string;
}

export type ButtonProps = BaseButtonProps & HTMLAttributes<HTMLButtonElement | HTMLAnchorElement>;
