import { AnchorHTMLAttributes, ButtonHTMLAttributes, ReactNode } from "react";

export type ButtonAppearance =
  | "primary"
  | "secondary"
  | "gray-link"
  | "link"
  | "danger"
  | "success"
  | "warning"
  | "info";
export type ButtonSize = "xs" | "sm" | "md" | "lg";

interface RegularButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  appearance?: ButtonAppearance;
  size?: ButtonSize;
  outline?: boolean;
  className?: string;
  disabled?: boolean;
  full?: boolean;
  icon?: ReactNode;
  iconPlacement?: "left" | "right";
  iconClassName?: string;
  noPadding?: boolean;
}

interface LinkButtonProps extends AnchorHTMLAttributes<HTMLAnchorElement> {
  href: string;
  appearance?: ButtonAppearance;
  size?: ButtonSize;
  outline?: boolean;
  className?: string;
  disabled?: boolean;
  full?: boolean;
  icon?: ReactNode;
  iconPlacement?: "left" | "right";
  iconClassName?: string;
  noPadding?: boolean;
}

export type ButtonProps = RegularButtonProps | LinkButtonProps;
