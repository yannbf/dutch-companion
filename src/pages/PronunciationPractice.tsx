import { FormEvent, useEffect, useRef, useState } from "react";
import { AppHeader } from "@/components/AppHeader";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, Volume2 } from "lucide-react";

const WIDGET_SCRIPT_SRC = "https://youglish.com/public/emb/widget.js";
const WIDGET_COMPONENTS = 76;
const WIDGET_CONTAINER_ID = "youglish-widget-container";

const getThemeColor = (cssVar: string, fallback: string) => {
  const value = getComputedStyle(document.documentElement).getPropertyValue(cssVar).trim();
  return value ? `hsl(${value})` : fallback;
};

const loadYouglishApi = () => {
  if (window.YG) {
    window.__youglishApiReady = true;
    return Promise.resolve();
  }

  if (window.__youglishApiPromise) {
    return window.__youglishApiPromise;
  }

  window.__youglishApiPromise = new Promise<void>((resolve, reject) => {
    const previousReadyHandler = window.onYouglishAPIReady;

    window.onYouglishAPIReady = () => {
      window.__youglishApiReady = true;
      previousReadyHandler?.();
      resolve();
    };

    const existingScript = document.querySelector<HTMLScriptElement>("script[data-youglish-api='true']");
    if (existingScript) {
      return;
    }

    const script = document.createElement("script");
    script.src = WIDGET_SCRIPT_SRC;
    script.async = true;
    script.setAttribute("data-youglish-api", "true");
    script.onerror = () => {
      reject(new Error("Failed to load YouGlish API."));
    };

    document.body.appendChild(script);
  });

  return window.__youglishApiPromise;
};

const PronunciationPractice = () => {
  const [query, setQuery] = useState("");
  const [apiLoading, setApiLoading] = useState(true);
  const [isSearching, setIsSearching] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const widgetRef = useRef<{
    fetch: (q: string, lang: string, accent?: string) => void;
    close?: () => void;
  } | null>(null);

  useEffect(() => {
    let mounted = true;

    const initializeWidget = async () => {
      try {
        await loadYouglishApi();
        const container = document.getElementById(WIDGET_CONTAINER_ID);
        if (!mounted || !container || !window.YG || widgetRef.current) {
          if (mounted) {
            setApiLoading(false);
          }
          return;
        }

        const widgetTheme = {
          backgroundColor: getThemeColor("--card", "#ffffff"),
          panelsBackgroundColor: getThemeColor("--muted", "#f5f5f5"),
          textColor: getThemeColor("--muted-foreground", "#7F98AD"),
          titleColor: getThemeColor("--foreground", "#555555"),
          captionColor: getThemeColor("--foreground", "#6495BF"),
          linkColor: getThemeColor("--primary", "#337ab7"),
          keywordColor: getThemeColor("--primary", "orange"),
          queryColor: getThemeColor("--primary", "orange"),
          markerColor: getThemeColor("--accent", "yellow"),
        };

        widgetRef.current = new window.YG.Widget(WIDGET_CONTAINER_ID, {
          autoStart: 1,
          components: WIDGET_COMPONENTS,
          ...widgetTheme,
          events: {
            onFetchDone: (event) => {
              if (!mounted) return;
              setIsSearching(false);
              if (event.totalResult === 0) {
                setError("No pronunciation videos found for this word.");
              } else {
                setError(null);
              }
            },
            onError: () => {
              if (!mounted) return;
              setIsSearching(false);
              setError("Could not load pronunciation content. Please try again.");
            },
          },
        });

        setApiLoading(false);
      } catch {
        if (!mounted) return;
        setApiLoading(false);
        setError("Could not load YouGlish API. Please try again later.");
      }
    };

    initializeWidget();

    return () => {
      mounted = false;
      widgetRef.current?.close?.();
    };
  }, []);

  const handleSearch = (event: FormEvent) => {
    event.preventDefault();
    const trimmed = query.trim();
    if (!trimmed || !widgetRef.current || apiLoading) return;

    setError(null);
    setIsSearching(true);
    widgetRef.current.fetch(trimmed, "dutch");
  };

  return (
    <div className="min-h-screen bg-background pb-24">
      <AppHeader title="Pronunciation" backPath="/exercises" />

      <div className="max-w-3xl mx-auto px-4 pt-20 space-y-5">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Volume2 className="w-5 h-5" />
              Pronunciation Practice
            </CardTitle>
            <CardDescription>
              Search a Dutch word to autoplay real YouTube pronunciation clips with captions.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <form onSubmit={handleSearch} className="flex gap-2">
              <Input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Type a Dutch word (e.g. ideeën)"
                disabled={apiLoading || isSearching}
              />
              <Button type="submit" disabled={apiLoading || isSearching || !query.trim()}>
                {isSearching ? <Loader2 className="w-4 h-4 animate-spin" /> : "Search"}
              </Button>
            </form>

            {apiLoading && (
              <div className="rounded-md border border-border p-3 text-sm text-muted-foreground flex items-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin" />
                Loading YouGlish player...
              </div>
            )}

            {error && (
              <div className="rounded-md border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive">
                {error}
              </div>
            )}
          </CardContent>
        </Card>

        <div className="rounded-lg border border-border overflow-hidden bg-card min-h-[300px]">
          <div id={WIDGET_CONTAINER_ID} className="w-full" />
        </div>
      </div>
    </div>
  );
};

export default PronunciationPractice;