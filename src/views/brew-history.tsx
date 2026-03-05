import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useBrewLogs } from "../hooks/use-brew-logs";
import { useBeans } from "../hooks/use-beans";
import { StarRating } from "../components/ui/StarRating";
import { Select } from "../components/ui/Select";
import { Input } from "../components/ui/Input";
import { Button } from "../components/ui/Button";
import { Card } from "../components/ui/Card";
import { formatDate, formatBrewTime, formatTime } from "../lib/utils";
import { BookOpen, Search } from "lucide-react";
import type { Bean, BrewLogWithRelations } from "../types/database";

const PAGE_SIZE = 20;

export default function BrewHistory() {
  const router = useRouter();
  const { data: brews, isLoading: brewsLoading } = useBrewLogs();
  const { data: beans, isLoading: beansLoading } = useBeans();

  const [beanFilter, setBeanFilter] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [minRating, setMinRating] = useState("");
  const [activePreset, setActivePreset] = useState<string>("all");
  const [page, setPage] = useState(1);

  const applyPreset = (preset: string) => {
    setActivePreset(preset);
    setPage(1);
    if (preset === "all") {
      setDateFrom("");
      setDateTo("");
      return;
    }
    const today = new Date();
    setDateTo("");
    if (preset === "7d") {
      const from = new Date(today);
      from.setDate(from.getDate() - 7);
      setDateFrom(from.toISOString().split("T")[0]);
    } else if (preset === "30d") {
      const from = new Date(today);
      from.setDate(from.getDate() - 30);
      setDateFrom(from.toISOString().split("T")[0]);
    } else if (preset === "month") {
      const from = new Date(today.getFullYear(), today.getMonth(), 1);
      setDateFrom(from.toISOString().split("T")[0]);
    }
  };

  const beanOptions = useMemo(() => {
    if (!beans) return [];
    return (beans as Bean[]).map((b) => ({
      value: b.id,
      label: b.name,
    }));
  }, [beans]);

  const ratingOptions = [
    { value: "", label: "Any rating" },
    { value: "1", label: "1+ stars" },
    { value: "2", label: "2+ stars" },
    { value: "3", label: "3+ stars" },
    { value: "4", label: "4+ stars" },
    { value: "5", label: "5 stars" },
  ];

  const filteredBrews = useMemo(() => {
    if (!brews) return [];

    let result = [...(brews as BrewLogWithRelations[])];

    result.sort(
      (a, b) =>
        new Date(b.brewedAt).getTime() - new Date(a.brewedAt).getTime()
    );

    if (beanFilter) {
      result = result.filter((brew) => brew.beanId === beanFilter);
    }

    if (dateFrom) {
      const from = new Date(dateFrom);
      result = result.filter((brew) => new Date(brew.brewedAt) >= from);
    }
    if (dateTo) {
      const to = new Date(dateTo);
      to.setHours(23, 59, 59, 999);
      result = result.filter((brew) => new Date(brew.brewedAt) <= to);
    }

    if (minRating) {
      const min = Number(minRating);
      result = result.filter(
        (brew) => brew.tasting && brew.tasting.overallEnjoyment >= min
      );
    }

    return result;
  }, [brews, beanFilter, dateFrom, dateTo, minRating]);

  const totalPages = Math.max(1, Math.ceil(filteredBrews.length / PAGE_SIZE));
  const paginatedBrews = filteredBrews.slice(
    (page - 1) * PAGE_SIZE,
    page * PAGE_SIZE
  );
  const showingFrom = filteredBrews.length === 0 ? 0 : (page - 1) * PAGE_SIZE + 1;
  const showingTo = Math.min(page * PAGE_SIZE, filteredBrews.length);

  const isLoading = brewsLoading || beansLoading;

  const clearFilters = () => {
    setBeanFilter("");
    setDateFrom("");
    setDateTo("");
    setMinRating("");
    setActivePreset("all");
    setPage(1);
  };

  const handleFilterChange = (setter: (v: string) => void) => (e: React.ChangeEvent<HTMLSelectElement | HTMLInputElement>) => {
    setter(e.target.value);
    setPage(1);
  };

  const hasActiveFilters = beanFilter || dateFrom || dateTo || minRating;

  if (isLoading) {
    return (
      <div className="p-6 space-y-4 animate-fade-in">
        <h1 className="text-4xl md:text-5xl font-display text-foreground tracking-tight leading-[0.95]">
          Journal
        </h1>
        <div className="flex items-center justify-center py-20">
          <div className="text-center space-y-4">
            <div className="animate-float">
              <BookOpen size={48} strokeWidth={1.2} className="text-muted-foreground mx-auto" />
            </div>
            <p className="font-display text-muted-foreground text-lg">Opening your journal...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!brews || brews.length === 0) {
    return (
      <div className="p-6 space-y-4 animate-fade-in">
        <h1 className="text-4xl md:text-5xl font-display text-foreground tracking-tight leading-[0.95]">
          Journal
        </h1>
        <Card className="flex flex-col items-center justify-center py-20 paper-texture">
          <div className="text-muted-foreground animate-float mb-6">
            <svg width="120" height="100" viewBox="0 0 120 100" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round">
              {/* Open book */}
              <path d="M60 20 Q40 15 15 20 V80 Q40 75 60 80 Q80 75 105 80 V20 Q80 15 60 20 Z" className="fill-secondary/30" />
              <line x1="60" y1="20" x2="60" y2="80" />
              {/* Lines on left page */}
              <line x1="25" y1="35" x2="52" y2="35" className="opacity-30" />
              <line x1="25" y1="45" x2="48" y2="45" className="opacity-20" />
              <line x1="25" y1="55" x2="50" y2="55" className="opacity-30" />
              {/* Pen */}
              <line x1="85" y1="10" x2="75" y2="65" className="opacity-40" strokeWidth="1.5" />
              <circle cx="75" cy="65" r="1.5" className="fill-primary/40 opacity-40" />
            </svg>
          </div>
          <h2 className="text-xl font-display text-secondary-foreground mb-3">
            Your journal awaits its first entry
          </h2>
          <p className="text-muted-foreground mb-8 max-w-sm text-center text-sm leading-relaxed">
            Every brew tells a story. Start writing yours.
          </p>
          <Button
            onClick={() => router.push("/brew/new")}
            className="bg-primary hover:bg-primary/90 text-primary-foreground"
          >
            Log your first brew
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6 max-w-6xl mx-auto animate-fade-in">
      {/* Header — flat panel with left accent border */}
      <Card accent="data" className="relative overflow-hidden px-7 py-8 md:px-10 md:py-10">
        <div className="relative flex items-end justify-between gap-4">
          <div className="space-y-2">
            <h1 className="text-4xl md:text-5xl font-display text-foreground tracking-tight leading-[0.95]">
              Journal
            </h1>
            <p className="text-sm text-muted-foreground">
              <span className="font-mono text-foreground text-3xl md:text-4xl">{brews.length}</span>{" "}
              brew{brews.length !== 1 ? "s" : ""} logged
            </p>
          </div>
          <Button
            onClick={() => router.push("/brew/new")}
            size="sm"
            className="bg-primary hover:bg-primary/90 text-primary-foreground relative"
          >
            New Brew
          </Button>
        </div>
      </Card>

      {/* Time presets */}
      <div className="flex gap-2 flex-wrap">
        {([
          { key: "7d", label: "Last 7 days" },
          { key: "30d", label: "Last 30 days" },
          { key: "month", label: "This month" },
          { key: "all", label: "All time" },
        ] as const).map((preset) => (
          <button
            key={preset.key}
            type="button"
            onClick={() => applyPreset(preset.key)}
            className={`px-4 py-1.5 text-sm font-medium border-2 transition-all duration-200 ${
              activePreset === preset.key
                ? "bg-primary text-primary-foreground border-primary"
                : "bg-card text-muted-foreground border-border hover:border-border hover:bg-muted"
            }`}
          >
            {preset.label}
          </button>
        ))}
      </div>

      {/* Filters */}
      <Card compact>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Select
            label="Bean"
            options={[{ value: "", label: "All beans" }, ...beanOptions]}
            value={beanFilter}
            onChange={handleFilterChange(setBeanFilter)}
          />
          <Input
            label="From"
            type="date"
            value={dateFrom}
            onChange={(e) => { setDateFrom(e.target.value); setActivePreset(""); setPage(1); }}
          />
          <Input
            label="To"
            type="date"
            value={dateTo}
            onChange={(e) => { setDateTo(e.target.value); setActivePreset(""); setPage(1); }}
          />
          <Select
            label="Min Rating"
            options={ratingOptions}
            value={minRating}
            onChange={handleFilterChange(setMinRating)}
          />
        </div>
        {hasActiveFilters && (
          <div className="mt-4 flex items-center justify-between pt-3 border-t border-border">
            <p className="text-sm text-muted-foreground font-mono">
              {filteredBrews.length} result{filteredBrews.length !== 1 ? "s" : ""}
            </p>
            <Button
              variant="ghost"
              size="sm"
              onClick={clearFilters}
              className="text-editorial hover:text-editorial/80 hover:bg-muted"
            >
              Clear filters
            </Button>
          </div>
        )}
      </Card>

      {/* Results */}
      {filteredBrews.length === 0 ? (
        <Card className="flex flex-col items-center justify-center py-16 paper-texture animate-fade-in">
          <div className="text-muted-foreground mb-4">
            <Search size={40} strokeWidth={1.2} />
          </div>
          <h3 className="text-lg font-display text-secondary-foreground mb-2">
            No brews match your filters
          </h3>
          <p className="text-muted-foreground mb-5 text-sm">
            Try widening your search to uncover more brews.
          </p>
          <Button
            variant="secondary"
            size="sm"
            onClick={clearFilters}
            className="text-muted-foreground hover:bg-muted"
          >
            Clear filters
          </Button>
        </Card>
      ) : (
        <>
          {/* Table */}
          <div className="border-2 border-border bg-background overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border bg-muted">
                    <th className="text-left px-4 py-3 font-display text-xs text-muted-foreground uppercase tracking-wider">Date</th>
                    <th className="text-left px-4 py-3 font-display text-xs text-muted-foreground uppercase tracking-wider">Time</th>
                    <th className="text-left px-4 py-3 font-display text-xs text-muted-foreground uppercase tracking-wider">Bean</th>
                    <th className="text-left px-4 py-3 font-display text-xs text-muted-foreground uppercase tracking-wider">Device</th>
                    <th className="text-right px-4 py-3 font-display text-xs text-muted-foreground uppercase tracking-wider">Dose</th>
                    <th className="text-right px-4 py-3 font-display text-xs text-muted-foreground uppercase tracking-wider">Water</th>
                    <th className="text-right px-4 py-3 font-display text-xs text-muted-foreground uppercase tracking-wider">Ratio</th>
                    <th className="text-right px-4 py-3 font-display text-xs text-muted-foreground uppercase tracking-wider">Brew Time</th>
                    <th className="text-center px-4 py-3 font-display text-xs text-muted-foreground uppercase tracking-wider">Rating</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-muted">
                  {paginatedBrews.map((brew) => (
                    <tr
                      key={brew.id}
                      onClick={() => router.push(`/brew/${brew.id}`)}
                      className="hover:bg-muted cursor-pointer transition-all duration-200 border-l-[3px] border-l-transparent hover:border-l-data"
                    >
                      <td className="px-4 py-3 text-secondary-foreground whitespace-nowrap font-mono">
                        {formatDate(brew.brewedAt)}
                      </td>
                      <td className="px-4 py-3 text-muted-foreground whitespace-nowrap font-mono">
                        {formatTime(brew.brewedAt)}
                      </td>
                      <td className="px-4 py-3 text-foreground font-medium truncate max-w-[200px]">
                        {brew.bean?.name ?? "Unknown"}
                      </td>
                      <td className="px-4 py-3 text-muted-foreground whitespace-nowrap">
                        {brew.brewDevice?.name ?? "-"}
                      </td>
                      <td className="px-4 py-3 text-secondary-foreground text-right whitespace-nowrap font-mono">
                        {brew.coffeeDose}g
                      </td>
                      <td className="px-4 py-3 text-secondary-foreground text-right whitespace-nowrap font-mono">
                        {brew.totalWater}g
                      </td>
                      <td className="px-4 py-3 text-secondary-foreground text-right whitespace-nowrap font-mono">
                        1:{brew.ratio}
                      </td>
                      <td className="px-4 py-3 text-secondary-foreground text-right whitespace-nowrap font-mono">
                        {formatBrewTime(brew.totalBrewTime)}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex justify-center">
                          {brew.tasting ? (
                            <StarRating value={brew.tasting.overallEnjoyment} size="sm" />
                          ) : (
                            <span className="text-xs text-muted-foreground">-</span>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground font-mono">
                Showing {showingFrom}–{showingTo} of {filteredBrews.length}
              </p>
              <div className="flex gap-2">
                <Button
                  variant="secondary"
                  size="sm"
                  disabled={page <= 1}
                  onClick={() => setPage((p) => p - 1)}
                  className="text-muted-foreground"
                >
                  Prev
                </Button>
                <Button
                  variant="secondary"
                  size="sm"
                  disabled={page >= totalPages}
                  onClick={() => setPage((p) => p + 1)}
                  className="text-muted-foreground"
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
