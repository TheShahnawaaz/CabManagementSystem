import * as React from "react";
import { Button as ReactEmailButton } from "@react-email/components";

interface ButtonProps {
  href: string;
  children: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({ href, children }) => {
  return (
    <ReactEmailButton
      className="email-button"
      href={href}
      style={{
        display: "inline-block",
        backgroundColor: "#18181b",
        color: "#ffffff",
        padding: "16px 32px",
        fontSize: "16px",
        fontWeight: 600,
        textDecoration: "none",
        borderRadius: "10px",
        textAlign: "center",
      }}
    >
      {children}
    </ReactEmailButton>
  );
};

export default Button;
