import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useBrewLog, useDeleteBrewLog } from "../hooks/use-brew-logs";
import { Badge } from "../components/ui/Badge";
import { StarRating } from "../components/ui/StarRating";
import { Button } from "../components/ui/Button";

import { Dialog } from "../components/ui/Dialog";
import { TastingFlow } from "../components/tasting/TastingFlow";
import { Card } from "../components/ui/Card";
import { Eye, Coffee as CoffeeIcon, Zap, Sparkles, Bean, XCircle } from "lucide-react";
import { useBrewCommentary } from "../hooks/use-llm";
import { formatDateTime, formatBrewTime, daysOffRoast } from "../lib/utils";
import { getEquipmentIcon } from "../lib/equipment-icons";
import { getBrewType } from "../lib/brew-types";
import type { BrewLogWithRelations, EquipmentType } from "../types/database";

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-4 mb-4">
      <h3 className="text-xs font-mono uppercase tracking-widest text-muted-foreground shrink-0">
        {children}
      </h3>
      <div className="flex-1 border-t border-input" />
    </div>
  );
}

function DetailRow({
  label,
  value,
}: {
  label: string;
  value: React.ReactNode;
}) {
  if (value === null || value === undefined) return null;
  return (
    <div className="flex justify-between py-2">
      <span className="text-sm text-muted-foreground">{label}</span>
      <span className="text-sm font-mono text-data">{value}</span>
    </div>
  );
}

const BODY_LABELS: Record<string, string> = {
  thin: "Thin (tea-like)",
  medium: "Medium (juice-like)",
  thick: "Thick (syrupy)",
};

const AFTERTASTE_LABELS: Record<string, string> = {
  pleasant: "Pleasant",
  neutral: "Neutral",
  unpleasant: "Unpleasant",
};

const TASTE_LEVEL_LABELS: Record<number, string> = {
  1: "Low",
  2: "Medium",
  3: "High",
};

const DIRECTION_LABELS: Record<string, string> = {
  wanted_less: "Wanted less",
  just_right: "Just right",
  wanted_more: "Wanted more",
};

const BODY_DIRECTION_LABELS: Record<string, string> = {
  wanted_lighter: "Wanted lighter",
  just_right: "Just right",
  wanted_heavier: "Wanted heavier",
};

const AFTERTASTE_VARIANTS: Record<string, "success" | "default" | "warning"> = {
  pleasant: "success",
  neutral: "default",
  unpleasant: "warning",
};

function AiCommentarySection({
  brewId,
  existingCommentary,
  onGenerated,
}: {
  brewId: string;
  existingCommentary?: string | null;
  onGenerated?: () => void;
}) {
  const { text, isLoading, error, generate, hasContent } = useBrewCommentary(brewId, existingCommentary);

  const handleGenerate = async (force?: boolean) => {
    await generate(force);
    onGenerated?.();
  };

  return (
    <Card accent="data" className="bg-muted">
      <SectionLabel>AI Commentary</SectionLabel>
      {!hasContent && !isLoading && (
        <div className="text-center py-4">
          <Button
            onClick={() => handleGenerate()}
            className="bg-primary hover:bg-accent-foreground text-primary-foreground inline-flex items-center gap-2"
          >
            <Sparkles size={16} />
            Get AI Commentary
          </Button>
          {error && (
            <p className="mt-3 text-sm text-destructive">{error}</p>
          )}
        </div>
      )}
      {isLoading && !hasContent && (
        <div className="flex items-center gap-2 py-4 justify-center">
          <span className="inline-block w-2 h-2 bg-primary animate-bounce" />
          <span className="inline-block w-2 h-2 bg-primary animate-bounce" style={{ animationDelay: '150ms' }} />
          <span className="inline-block w-2 h-2 bg-primary animate-bounce" style={{ animationDelay: '300ms' }} />
        </div>
      )}
      {hasContent && (
        <div className="prose prose-sm max-w-none">
          <p className="text-sm text-secondary-foreground leading-relaxed whitespace-pre-wrap">
            {text}
          </p>
          {isLoading && (
            <span className="inline-block w-1.5 h-4 bg-primary animate-pulse ml-0.5 align-text-bottom" />
          )}
          {!isLoading && (
            <div className="mt-4 pt-3 border-t border-border">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleGenerate(true)}
                className="text-editorial hover:text-editorial hover:bg-muted inline-flex items-center gap-1.5"
              >
                <Sparkles size={14} />
                Regenerate
              </Button>
            </div>
          )}
        </div>
      )}
    </Card>
  );
}

export default function BrewDetail() {
  const params = useParams<{ id: string }>();
  const id = params?.id as string | undefined;
  const router = useRouter();
  const { data: brew, isLoading, refetch } = useBrewLog(id ?? "");
  const deleteBrew = useDeleteBrewLog();

  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showTastingFlow, setShowTastingFlow] = useState(false);

  if (isLoading) {
    return (
      <div className="p-6 space-y-4 animate-fade-in">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => router.push("/brew/history")}
          className="text-muted-foreground hover:text-secondary-foreground"
        >
          &larr; Back to journal
        </Button>
        <div className="flex items-center justify-center py-20">
          <div className="text-center space-y-4">
            <div className="animate-float">
              <Bean size={48} strokeWidth={1.2} className="text-muted-foreground mx-auto" />
            </div>
            <p className="font-display text-muted-foreground text-lg">Retrieving your brew...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!brew) {
    return (
      <div className="p-6 space-y-4 animate-fade-in">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => router.push("/brew/history")}
          className="text-muted-foreground hover:text-secondary-foreground"
        >
          &larr; Back to journal
        </Button>
        <Card className="flex flex-col items-center justify-center py-16">
          <div className="text-muted-foreground mb-4">
            <XCircle size={48} strokeWidth={1.5} />
          </div>
          <h2 className="text-lg font-display text-foreground mb-2">
            This brew has vanished
          </h2>
          <p className="text-muted-foreground text-sm">
            It may have been deleted or the link is incorrect.
          </p>
        </Card>
      </div>
    );
  }

  const b = brew as BrewLogWithRelations;

  const handleDelete = () => {
    deleteBrew.mutate(b.id, {
      onSuccess: () => router.push("/brew/history"),
    });
  };

  const handleTastingComplete = () => {
    setShowTastingFlow(false);
    refetch();
  };

  const computedDaysOffRoast =
    b.bean?.roastDate
      ? daysOffRoast(b.brewedAt, b.bean.roastDate)
      : b.daysOffRoast;

  // Tasting flow full-screen overlay
  if (showTastingFlow) {
    return (
      <div className="p-6 animate-fade-in">
        <div className="mb-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowTastingFlow(false)}
            className="text-muted-foreground hover:text-secondary-foreground"
          >
            &larr; Back to brew
          </Button>
        </div>
        <TastingFlow
          brewLogId={b.id}
          onComplete={handleTastingComplete}
          onSkip={() => setShowTastingFlow(false)}
        />
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6 max-w-2xl mx-auto animate-fade-in">
      {/* Navigation */}
      <div className="flex items-center justify-between">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => router.push("/brew/history")}
          className="text-muted-foreground hover:text-secondary-foreground"
        >
          &larr; Back to journal
        </Button>
        <div className="flex gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.push(`/brew/new?edit=${b.id}`)}
            className="text-secondary-foreground hover:text-foreground hover:bg-muted"
          >
            Edit
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowDeleteDialog(true)}
            className="text-destructive hover:text-destructive hover:bg-destructive/10"
          >
            Delete
          </Button>
        </div>
      </div>

      {/* Header */}
      <Card accent="editorial" className="space-y-3">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-3xl md:text-4xl font-display text-foreground tracking-tight leading-[0.95]">
              {b.bean?.name ?? "Unknown bean"}
            </h1>
            <p className="text-sm text-muted-foreground mt-2">
              {formatDateTime(b.brewedAt)}
            </p>
          </div>
          {b.tasting && (
            <StarRating value={b.tasting.overallEnjoyment} size="md" />
          )}
        </div>
        {b.bean?.roaster && (
          <p className="text-sm text-muted-foreground">
            Roasted by {b.bean.roaster}
          </p>
        )}
        <div className="flex gap-2 flex-wrap">
          <span className="inline-flex items-center px-2.5 py-0.5 bg-muted text-secondary-foreground text-xs font-medium border border-input">
            {computedDaysOffRoast} day{computedDaysOffRoast !== 1 ? "s" : ""} off roast
          </span>
          <span className="inline-flex items-center px-2.5 py-0.5 bg-muted text-secondary-foreground text-xs font-medium border border-input">
            {b.timeOfDay}
          </span>
        </div>
      </Card>

      {/* Equipment */}
      <Card className="animate-slide-up" style={{ animationDelay: '100ms' }}>
        <SectionLabel>Equipment</SectionLabel>
        <div className="divide-y divide-border">
          {b.grinder && (
            <DetailRow
              label="Grinder"
              value={
                <span className="inline-flex items-center gap-1.5">
                  {(() => {
                    const Icon = getEquipmentIcon('grinder' as EquipmentType, b.grinder!.name);
                    return <Icon size={14} className="text-data" />;
                  })()}
                  {b.grinder.name} @ {b.grinderSetting}
                </span>
              }
            />
          )}
          {b.brewDevice && (
            <DetailRow
              label="Brew Device"
              value={
                <span className="inline-flex items-center gap-1.5">
                  {(() => {
                    const Icon = getEquipmentIcon('brew_device' as EquipmentType, b.brewDevice!.name);
                    return <Icon size={14} className="text-data" />;
                  })()}
                  {b.brewDevice.name}
                </span>
              }
            />
          )}
          {b.filter && (
            <DetailRow
              label="Filter"
              value={
                <span className="inline-flex items-center gap-1.5">
                  {(() => {
                    const Icon = getEquipmentIcon('filter' as EquipmentType, b.filter!.name);
                    return <Icon size={14} className="text-data" />;
                  })()}
                  {b.filter.name}
                </span>
              }
            />
          )}
          {b.waterType && (
            <DetailRow
              label="Water"
              value={
                <span className="inline-flex items-center gap-1.5">
                  {(() => {
                    const Icon = getEquipmentIcon('water_type' as EquipmentType, b.waterType!.name);
                    return <Icon size={14} className="text-data" />;
                  })()}
                  {b.waterType.name}
                </span>
              }
            />
          )}
          {b.brewMethod && (
            <DetailRow label="Method" value={b.brewMethod.name} />
          )}
        </div>
      </Card>

      {/* Parameters */}
      <Card className="animate-slide-up" style={{ animationDelay: '200ms' }}>
        <SectionLabel>Parameters</SectionLabel>

        {/* Hero recipe strip */}
        <div className="grid grid-cols-3 gap-4 mb-6 pb-6 border-b border-input">
          <div className="text-center">
            <p className="font-mono text-3xl md:text-4xl text-foreground tracking-tight leading-none">{b.coffeeDose}g</p>
            <p className="font-body text-[10px] text-muted-foreground uppercase tracking-[0.15em] mt-2 font-medium">Dose</p>
          </div>
          <div className="text-center border-x border-input">
            <p className="font-mono text-3xl md:text-4xl text-foreground tracking-tight leading-none">{b.totalWater}g</p>
            <p className="font-body text-[10px] text-muted-foreground uppercase tracking-[0.15em] mt-2 font-medium">Water</p>
          </div>
          <div className="text-center">
            <p className="font-mono text-3xl md:text-4xl text-data tracking-tight leading-none">1:{b.ratio}</p>
            <p className="font-body text-[10px] text-muted-foreground uppercase tracking-[0.15em] mt-2 font-medium">Ratio</p>
          </div>
        </div>

        <div className="divide-y divide-border">
          {(() => {
            const brewType = getBrewType(b.brewTypeId);
            return brewType ? (
              <DetailRow label="Brew Type" value={`${brewType.icon} ${brewType.name}`} />
            ) : null;
          })()}
          <DetailRow label="Water Temp" value={`${b.waterTemp}\u00B0C`} />
          {b.bloomWater != null && (
            <DetailRow label="Bloom Water" value={`${b.bloomWater}g`} />
          )}
          {b.bloomTime != null && (
            <DetailRow
              label="Bloom Time"
              value={formatBrewTime(b.bloomTime)}
            />
          )}
          {b.numPours != null && (
            <DetailRow
              label="Pours"
              value={`${b.numPours} pour${b.numPours !== 1 ? "s" : ""}`}
            />
          )}
          <DetailRow
            label="Total Brew Time"
            value={formatBrewTime(b.totalBrewTime)}
          />
          {/* Extra params from brew type */}
          {(() => {
            const brewType = getBrewType(b.brewTypeId);
            const extra = b.extraParams as Record<string, any> | null | undefined;
            if (!brewType || !extra) return null;
            return brewType.extraFields.map((field) => {
              const val = extra[field.name];
              if (val === undefined || val === null || val === "") return null;
              if (field.type === "boolean") {
                return <DetailRow key={field.name} label={field.label} value={val ? "Yes" : "No"} />;
              }
              return (
                <DetailRow
                  key={field.name}
                  label={field.label}
                  value={`${val}${field.unit ? field.unit : ""}`}
                />
              );
            });
          })()}
        </div>
        {b.techniqueNotes && (
          <div className="mt-4 pt-4 border-t border-border">
            <p className="text-xs font-mono uppercase tracking-widest text-muted-foreground mb-1.5">
              Technique Notes
            </p>
            <p className="text-sm text-secondary-foreground leading-relaxed">
              {b.techniqueNotes}
            </p>
          </div>
        )}
      </Card>

      {/* Tasting */}
      {b.tasting ? (
        <Card className="animate-slide-up" style={{ animationDelay: '300ms' }}>
          <SectionLabel>Tasting Evaluation</SectionLabel>
          <div className="space-y-6">
            {/* Mindfulness */}
            {b.tasting.mindfulness && (
              <div>
                <p className="text-sm font-display text-foreground mb-1.5">Mindfulness</p>
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-muted text-secondary-foreground text-xs font-medium border border-input">
                  {b.tasting.mindfulness === "focused" && <Eye size={14} className="text-data" />}
                  {b.tasting.mindfulness === "casual" && <CoffeeIcon size={14} className="text-data" />}
                  {b.tasting.mindfulness === "distracted" && <Zap size={14} className="text-data" />}
                  {b.tasting.mindfulness.charAt(0).toUpperCase() + b.tasting.mindfulness.slice(1)}
                </span>
              </div>
            )}

            {/* Taste levels */}
            {([
              { label: "Sweetness", value: b.tasting.sweetness, direction: b.tasting.sweetnessDirection },
              { label: "Sourness", value: b.tasting.sourness, direction: b.tasting.sournessDirection },
              { label: "Bitterness", value: b.tasting.bitterness, direction: b.tasting.bitternessDirection },
            ] as const).map((taste) => (
              <div key={taste.label}>
                <p className="text-sm font-display text-foreground mb-1.5">{taste.label}</p>
                <span className="inline-flex items-center px-2.5 py-1 bg-muted text-secondary-foreground text-xs font-medium border border-input">
                  {TASTE_LEVEL_LABELS[taste.value] ?? taste.value}
                </span>
                {taste.direction && (
                  <span className="inline-flex ml-2 text-xs font-mono text-muted-foreground uppercase tracking-wide">
                    {DIRECTION_LABELS[taste.direction]}
                  </span>
                )}
              </div>
            ))}

            {/* Body */}
            <div>
              <p className="text-sm font-display text-foreground mb-1.5">Body</p>
              <span className="inline-flex items-center px-2.5 py-1 bg-muted text-secondary-foreground text-xs font-medium border border-input">
                {BODY_LABELS[b.tasting.body] ?? b.tasting.body}
              </span>
              {b.tasting.bodyDirection && (
                <span className="inline-flex ml-2 text-xs font-mono text-muted-foreground uppercase tracking-wide">
                  {BODY_DIRECTION_LABELS[b.tasting.bodyDirection]}
                </span>
              )}
            </div>

            {/* Aftertaste */}
            <div>
              <p className="text-sm font-display text-foreground mb-1.5">
                Aftertaste
              </p>
              {b.tasting.aftertastePresence ? (
                <Badge
                  variant={
                    AFTERTASTE_VARIANTS[b.tasting.aftertastePleasant ?? "neutral"]
                  }
                >
                  {AFTERTASTE_LABELS[b.tasting.aftertastePleasant ?? "neutral"]}
                </Badge>
              ) : (
                <span className="text-sm text-muted-foreground">None noticed</span>
              )}
            </div>

            {/* Flavor tags */}
            {b.tasting.flavorTags && (() => {
              try {
                const tags: string[] = JSON.parse(b.tasting.flavorTags);
                if (tags.length === 0) return null;
                return (
                  <div>
                    <p className="text-sm font-display text-foreground mb-1.5">
                      Flavor Tags
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {tags.map((tag) => (
                        <span key={tag} className="chip chip--active">{tag}</span>
                      ))}
                    </div>
                  </div>
                );
              } catch { return null; }
            })()}

            {/* Flavor notes */}
            {b.tasting.flavorNotes && (
              <div>
                <p className="text-sm font-display text-foreground mb-1.5">
                  Flavor Notes
                </p>
                <p className="text-sm text-secondary-foreground">
                  {b.tasting.flavorNotes}
                </p>
              </div>
            )}

            {/* Overall rating */}
            <div className="flex items-center gap-5 pt-5 border-t-2 border-border">
              <div className="bg-inverted text-inverted-foreground px-4 py-3">
                <p className="font-body text-[10px] text-inverted-muted uppercase tracking-[0.15em] font-medium mb-1">Overall</p>
                <p className="font-mono text-4xl md:text-5xl text-inverted-foreground tracking-tight leading-none">{b.tasting.overallEnjoyment}</p>
              </div>
              <StarRating value={b.tasting.overallEnjoyment} size="md" />
            </div>

            {/* Personal notes */}
            {b.tasting.personalNotes && (
              <div className="pt-3 border-t border-border">
                <p className="text-sm font-display text-foreground mb-1.5">
                  Notes
                </p>
                <p className="text-sm text-secondary-foreground leading-relaxed">
                  {b.tasting.personalNotes}
                </p>
              </div>
            )}
          </div>
        </Card>
      ) : (
        <Card className="flex flex-col items-center justify-center py-12 text-center animate-slide-up" style={{ animationDelay: '300ms' }}>
          <div className="mb-4">
            <StarRating value={0} size="lg" />
          </div>
          <p className="text-muted-foreground mb-2 font-display text-lg">
            How was this cup?
          </p>
          <p className="text-muted-foreground text-sm mb-5 max-w-xs">
            Rate your brew to track what you love and refine your technique.
          </p>
          <Button
            onClick={() => setShowTastingFlow(true)}
            className="bg-primary hover:bg-accent-foreground text-primary-foreground px-8 py-2.5 text-base font-display"
          >
            Rate this brew
          </Button>
        </Card>
      )}

      {/* AI Commentary */}
      <AiCommentarySection
        brewId={b.id}
        existingCommentary={b.aiCommentary}
        onGenerated={() => refetch()}
      />

      {/* Delete confirmation dialog */}
      <Dialog
        open={showDeleteDialog}
        onClose={() => setShowDeleteDialog(false)}
        title="Delete this brew?"
      >
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">
            This will permanently delete this brew log and any associated tasting
            data. This action cannot be undone.
          </p>
          <div className="flex justify-end gap-3 pt-2 border-t border-border">
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setShowDeleteDialog(false)}
              className="text-secondary-foreground hover:bg-muted"
            >
              Cancel
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleDelete}
              disabled={deleteBrew.isPending}
              className="bg-destructive hover:bg-destructive/90 text-primary-foreground"
            >
              {deleteBrew.isPending ? "Deleting..." : "Delete brew"}
            </Button>
          </div>
        </div>
      </Dialog>
    </div>
  );
}
