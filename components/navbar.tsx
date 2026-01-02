"use client"

import { useState, useCallback, useEffect, memo } from "react"
import Link from "next/link"
import { Search, Bell, User, Menu, X, Sparkles } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { ThemeToggle } from "@/components/theme-toggle"

type SearchResult = {
  title: string
  href: string
  category: string
}

export const Navbar = memo(function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [searchResults, setSearchResults] = useState<SearchResult[]>([])
  const [showSearchResults, setShowSearchResults] = useState(false)
  const [searchLoading, setSearchLoading] = useState(false)

  const performSearch = useCallback(async (query: string) => {
    const q = query.trim()
    if (!q) {
      setSearchResults([])
      setShowSearchResults(false)
      return
    }

    try {
      setSearchLoading(true)
      const res = await fetch(`/api/search?q=${encodeURIComponent(q)}`)
      if (!res.ok) {
        throw new Error("Errore nella ricerca")
      }
      const data = (await res.json()) as SearchResult[]
      setSearchResults(data)
      setShowSearchResults(data.length > 0)
    } catch {
      setSearchResults([])
      setShowSearchResults(false)
    } finally {
      setSearchLoading(false)
    }
  }, [])

  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults([])
      setShowSearchResults(false)
      return
    }

    const handle = setTimeout(() => {
      void performSearch(searchQuery)
    }, 250)

    return () => clearTimeout(handle)
  }, [searchQuery, performSearch])

  return (
    <nav className="sticky top-0 z-50 bg-card border-b border-border shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3 font-bold text-xl">
            <div className="w-8 h-8 bg-gradient-to-br from-primary to-secondary rounded-lg flex items-center justify-center text-primary-foreground">
              📚
            </div>
            <span className="hidden sm:inline">Classe 1R</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-8">
            <Link href="/" className="text-foreground/70 hover:text-foreground transition">
              Inizio
            </Link>
            <Link href="/esercizi" className="text-foreground/70 hover:text-foreground transition">
              Esercizi
            </Link>
            <Link href="/appunti" className="text-foreground/70 hover:text-foreground transition">
              Appunti
            </Link>
            <Link href="/progetti" className="text-foreground/70 hover:text-foreground transition">
              Progetti
            </Link>
            <Link href="/guida" className="text-foreground/70 hover:text-foreground transition">
              Guida
            </Link>
            <Link href="/ai" className="text-foreground/70 hover:text-foreground transition flex items-center gap-1">
              <Sparkles className="w-4 h-4" />
              IA
            </Link>
          </div>

          {/* Search and Icons */}
          <div className="flex items-center gap-4 relative">
            <div className="hidden sm:flex items-center gap-2 bg-muted rounded-lg px-3 py-2 relative">
              <Search className="w-4 h-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Cerca..."
                className="bg-transparent outline-none text-sm w-32 placeholder-muted-foreground"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onFocus={() => searchQuery && setShowSearchResults(true)}
              />
              {(showSearchResults || searchLoading) && (
                <Card className="absolute top-full left-0 mt-2 w-80 p-2 z-50 bg-card border border-border shadow-lg">
                  <div className="space-y-1 max-h-64 overflow-y-auto">
                    {searchLoading && (
                      <div className="p-2 text-xs text-foreground/60">Ricerca in corso...</div>
                    )}
                    {!searchLoading && searchResults.length === 0 && (
                      <div className="p-2 text-xs text-foreground/60">Nessun risultato</div>
                    )}
                    {!searchLoading &&
                      searchResults.map((result, idx) => (
                        <Link
                          key={idx}
                          href={result.href}
                          onClick={() => {
                            setSearchQuery("")
                            setShowSearchResults(false)
                          }}
                          className="block p-2 rounded hover:bg-muted transition text-sm"
                        >
                          <div className="font-medium text-foreground">{result.title}</div>
                          <div className="text-xs text-foreground/60">{result.category}</div>
                        </Link>
                      ))}
                  </div>
                </Card>
              )}
            </div>

            <ThemeToggle />

            <Link href="/notifiche">
              <Button variant="ghost" size="icon" className="relative">
                <Bell className="w-5 h-5" />
                <span className="absolute top-1 right-1 w-2 h-2 bg-destructive rounded-full"></span>
              </Button>
            </Link>

            <Link href="/profilo">
              <Button variant="ghost" size="icon">
                <User className="w-5 h-5" />
              </Button>
            </Link>

            {/* Mobile Menu Toggle */}
            <button onClick={() => setMenuOpen(!menuOpen)} className="md:hidden p-2">
              {menuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {menuOpen && (
          <div className="md:hidden pb-4 border-t border-border">
            <Link href="/" className="block py-2 text-foreground/70 hover:text-foreground">
              Inizio
            </Link>
            <Link href="/esercizi" className="block py-2 text-foreground/70 hover:text-foreground">
              Esercizi
            </Link>
            <Link href="/appunti" className="block py-2 text-foreground/70 hover:text-foreground">
              Appunti
            </Link>
            <Link href="/progetti" className="block py-2 text-foreground/70 hover:text-foreground">
              Progetti
            </Link>
            <Link href="/guida" className="block py-2 text-foreground/70 hover:text-foreground">
              Guida
            </Link>
            <Link href="/ai" className="block py-2 text-foreground/70 hover:text-foreground flex items-center gap-2">
              <Sparkles className="w-4 h-4" />
              Assistente IA
            </Link>
          </div>
        )}
      </div>
    </nav>
  )
})
