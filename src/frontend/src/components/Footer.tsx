import { Link } from "@tanstack/react-router";
import { BookOpen, Heart } from "lucide-react";

export default function Footer() {
  const year = new Date().getFullYear();
  const caffeineUrl = `https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(typeof window !== "undefined" ? window.location.hostname : "")}`;

  return (
    <footer className="bg-secondary border-t border-border mt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2">
            <BookOpen className="text-primary" size={20} strokeWidth={1.5} />
            <span className="font-serif text-lg font-medium text-foreground">
              Aura Memoria
            </span>
          </div>
          <nav className="flex items-center gap-6">
            {[
              { to: "/", label: "Home" },
              { to: "/archive", label: "Archive" },
              { to: "/search", label: "Search" },
              { to: "/manage", label: "Manage" },
            ].map((item) => (
              <Link
                key={item.to}
                to={item.to}
                className="text-xs uppercase tracking-widest text-muted-foreground hover:text-foreground transition-colors"
              >
                {item.label}
              </Link>
            ))}
          </nav>
        </div>
        <div className="mt-8 pt-6 border-t border-border flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-muted-foreground">
          <span>© {year} Aura Memoria. All rights reserved.</span>
          <span className="flex items-center gap-1">
            Built with <Heart size={12} className="text-primary fill-primary" />{" "}
            using{" "}
            <a
              href={caffeineUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="underline hover:text-foreground transition-colors"
            >
              caffeine.ai
            </a>
          </span>
        </div>
      </div>
    </footer>
  );
}
