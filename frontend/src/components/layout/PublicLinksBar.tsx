import { Link } from "react-router-dom";

const publicLinks = [
  { to: "/terms", label: "Terms & Conditions" },
  { to: "/privacy", label: "Privacy Policy" },
  { to: "/cancellation-refunds", label: "Cancellation & Refunds" },
  { to: "/contact", label: "Contact Us" },
];

export function PublicLinksBar() {
  return (
    <div className="border-t bg-card/60">
      <div className="container mx-auto flex flex-wrap gap-4 px-4 py-4 text-sm text-muted-foreground">
        {publicLinks.map((link) => (
          <Link
            key={link.to}
            to={link.to}
            className="font-medium hover:text-foreground"
          >
            {link.label}
          </Link>
        ))}
      </div>
    </div>
  );
}
