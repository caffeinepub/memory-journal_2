import { Button } from "@/components/ui/button";
import { useQueryClient } from "@tanstack/react-query";
import { Link, useRouter } from "@tanstack/react-router";
import { BookOpen, Menu, Search, X } from "lucide-react";
import { useState } from "react";
import { useInternetIdentity } from "../hooks/useInternetIdentity";

export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchValue, setSearchValue] = useState("");
  const { identity, login, clear, isLoggingIn } = useInternetIdentity();
  const queryClient = useQueryClient();
  const router = useRouter();
  const isAuthenticated = !!identity;

  const handleAuth = async () => {
    if (isAuthenticated) {
      await clear();
      queryClient.clear();
    } else {
      login();
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchValue.trim()) {
      router.navigate({ to: "/search", search: { q: searchValue } });
      setSearchOpen(false);
      setSearchValue("");
    }
  };

  const navItems = [
    { to: "/", label: "Home" },
    { to: "/archive", label: "Archive" },
    { to: "/search", label: "Search" },
    { to: "/manage", label: "Manage" },
  ] as const;

  return (
    <header className="sticky top-0 z-50 bg-secondary border-b border-border shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand */}
          <Link
            to="/"
            className="flex items-center gap-2 shrink-0"
            data-ocid="header.link"
          >
            <BookOpen className="text-primary" size={22} strokeWidth={1.5} />
            <span className="font-serif text-xl font-semibold text-foreground tracking-tight">
              Aura Memoria
            </span>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-6">
            {navItems.map((item) => (
              <Link
                key={item.to}
                to={item.to}
                className="text-xs font-medium uppercase tracking-widest text-muted-foreground hover:text-foreground transition-colors"
                data-ocid="header.link"
              >
                {item.label}
              </Link>
            ))}
          </nav>

          {/* Actions */}
          <div className="flex items-center gap-2">
            {searchOpen ? (
              <form onSubmit={handleSearch} className="flex items-center gap-1">
                <input
                  type="text"
                  value={searchValue}
                  onChange={(e) => setSearchValue(e.target.value)}
                  placeholder="Search memories…"
                  className="w-48 px-3 py-1.5 text-sm rounded-full border border-border bg-card text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring"
                  data-ocid="header.search_input"
                />
                <button
                  type="button"
                  onClick={() => setSearchOpen(false)}
                  className="text-muted-foreground hover:text-foreground"
                >
                  <X size={16} />
                </button>
              </form>
            ) : (
              <button
                type="button"
                onClick={() => setSearchOpen(true)}
                className="p-2 text-muted-foreground hover:text-foreground transition-colors"
                aria-label="Open search"
                data-ocid="header.button"
              >
                <Search size={18} />
              </button>
            )}
            <Button
              size="sm"
              onClick={handleAuth}
              disabled={isLoggingIn}
              className="hidden sm:inline-flex rounded-full text-xs font-medium uppercase tracking-widest"
              data-ocid="header.button"
            >
              {isLoggingIn ? "…" : isAuthenticated ? "Sign Out" : "Sign In"}
            </Button>
            <button
              type="button"
              className="md:hidden p-2 text-muted-foreground"
              onClick={() => setMenuOpen(!menuOpen)}
              aria-label="Toggle menu"
              data-ocid="header.button"
            >
              {menuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="md:hidden bg-secondary border-t border-border px-4 py-3 space-y-2">
          {navItems.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              onClick={() => setMenuOpen(false)}
              className="block text-sm font-medium uppercase tracking-widest text-muted-foreground hover:text-foreground py-1"
              data-ocid="header.link"
            >
              {item.label}
            </Link>
          ))}
          <Button
            size="sm"
            onClick={handleAuth}
            disabled={isLoggingIn}
            className="w-full rounded-full text-xs uppercase tracking-widest mt-2"
            data-ocid="header.button"
          >
            {isLoggingIn ? "…" : isAuthenticated ? "Sign Out" : "Sign In"}
          </Button>
        </div>
      )}
    </header>
  );
}
