import * as React from "react";
import { Text } from "@react-email/components";

type BadgeVariant = "success" | "warning" | "danger" | "info";

interface BadgeProps {
  variant: BadgeVariant;
  children: React.ReactNode;
}

const variantStyles: Record<
  BadgeVariant,
  { bg: string; color: string; className: string }
> = {
  success: { bg: "#dcfce7", color: "#166534", className: "badge-success" },
  warning: { bg: "#fef3c7", color: "#92400e", className: "badge-warning" },
  danger: { bg: "#fee2e2", color: "#991b1b", className: "badge-danger" },
  info: { bg: "#dbeafe", color: "#1e40af", className: "badge-info" },
};

export const Badge: React.FC<BadgeProps> = ({ variant, children }) => {
  const style = variantStyles[variant];

  return (
    <Text
      className={style.className}
      style={{
        display: "inline-block",
        padding: "6px 14px",
        borderRadius: "50px",
        fontSize: "12px",
        fontWeight: 600,
        textTransform: "uppercase",
        letterSpacing: "0.5px",
        margin: "0 0 20px 0",
        backgroundColor: style.bg,
        color: style.color,
      }}
    >
      {children}
    </Text>
  );
};

export default Badge;
