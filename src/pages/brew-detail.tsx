import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useBrewLog, useDeleteBrewLog } from "../hooks/use-brew-logs";
import { Badge } from "../components/ui/Badge";
import { StarRating } from "../components/ui/StarRating";
import { Button } from "../components/ui/Button";
import { Slider } from "../components/ui/Slider";
import { Dialog } from "../components/ui/Dialog";
import { TastingFlow } from "../components/tasting/TastingFlow";
import { Eye, Coffee as CoffeeIcon, Zap, Sparkles, Bean } from "lucide-react";
import { useBrewCommentary } from "../hooks/use-llm";
import { formatDateTime, formatBrewTime, daysOffRoast } from "../lib/utils";
import { getEquipmentIcon } from "../lib/equipment-icons";
import { getBrewType } from "../lib/brew-types";
import type { BrewLogWithRelations, EquipmentType } from "../types/database";

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-4 mb-4">
      <h3 className="text-base font-display text-espresso-800 tracking-wide shrink-0">
        {children}
      </h3>
      <div className="flex-1 border-t border-cream-300" />
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
      <span className="text-sm text-espresso-400">{label}</span>
      <span className="text-sm font-medium text-espresso-800">{value}</span>
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
    <div className="rounded-2xl border border-cream-200 bg-cream-50 p-6">
      <SectionLabel>AI Commentary</SectionLabel>
      {!hasContent && !isLoading && (
        <div className="text-center py-4">
          <Button
            onClick={() => handleGenerate()}
            className="bg-sienna-600 hover:bg-sienna-700 text-white inline-flex items-center gap-2"
          >
            <Sparkles size={16} />
            Get AI Commentary
          </Button>
          {error && (
            <p className="mt-3 text-sm text-rose-500">{error}</p>
          )}
        </div>
      )}
      {isLoading && !hasContent && (
        <div className="flex items-center gap-2 py-4 justify-center">
          <span className="inline-block w-2 h-2 rounded-full bg-sienna-400 animate-bounce" style={{ animationDelay: '0ms' }} />
          <span className="inline-block w-2 h-2 rounded-full bg-sienna-400 animate-bounce" style={{ animationDelay: '150ms' }} />
          <span className="inline-block w-2 h-2 rounded-full bg-sienna-400 animate-bounce" style={{ animationDelay: '300ms' }} />
        </div>
      )}
      {hasContent && (
        <div className="prose prose-sm max-w-none">
          <p className="text-sm text-espresso-700 leading-relaxed whitespace-pre-wrap">
            {text}
          </p>
          {isLoading && (
            <span className="inline-block w-1.5 h-4 bg-sienna-400 animate-pulse ml-0.5 align-text-bottom" />
          )}
          {!isLoading && (
            <div className="mt-4 pt-3 border-t border-cream-200">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleGenerate(true)}
                className="text-sienna-600 hover:text-sienna-700 hover:bg-cream-100 inline-flex items-center gap-1.5"
              >
                <Sparkles size={14} />
                Regenerate
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default function BrewDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
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
          onClick={() => navigate("/brew/history")}
          className="text-espresso-500 hover:text-espresso-700"
        >
          &larr; Back to journal
        </Button>
        <div className="flex items-center justify-center py-20">
          <div className="text-center space-y-4">
            <div className="animate-float">
              <Bean size={48} strokeWidth={1.2} className="text-espresso-300 mx-auto" />
            </div>
            <p className="font-display italic text-espresso-400 text-lg">Retrieving your brew...</p>
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
          onClick={() => navigate("/brew/history")}
          className="text-espresso-500 hover:text-espresso-700"
        >
          &larr; Back to journal
        </Button>
        <div className="flex flex-col items-center justify-center py-16 paper-texture rounded-2xl border border-cream-200 bg-cream-50">
          <div className="text-espresso-200 mb-4">
            <svg width="64" height="64" viewBox="0 0 64 64" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="32" cy="32" r="24" className="opacity-30" />
              <path d="M26 26 L38 38 M38 26 L26 38" className="opacity-40" strokeWidth="1.5" />
            </svg>
          </div>
          <h2 className="text-lg font-display italic text-espresso-700 mb-2">
            This brew has vanished
          </h2>
          <p className="text-espresso-400 text-sm">
            It may have been deleted or the link is incorrect.
          </p>
        </div>
      </div>
    );
  }

  const b = brew as BrewLogWithRelations;

  const handleDelete = () => {
    deleteBrew.mutate(b.id, {
      onSuccess: () => navigate("/brew/history"),
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
            className="text-espresso-500 hover:text-espresso-700"
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
          onClick={() => navigate("/brew/history")}
          className="text-espresso-500 hover:text-espresso-700"
        >
          &larr; Back to journal
        </Button>
        <div className="flex gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate(`/brew/new?edit=${b.id}`)}
            className="text-espresso-600 hover:text-espresso-800 hover:bg-cream-100"
          >
            Edit
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowDeleteDialog(true)}
            className="text-rose-500 hover:text-rose-700 hover:bg-rose-100"
          >
            Delete
          </Button>
        </div>
      </div>

      {/* Header - Tasting Card Feel */}
      <div className="rounded-2xl border border-cream-200 bg-gradient-to-br from-espresso-800 via-espresso-900 to-espresso-950 p-7 md:p-8 space-y-3 relative overflow-hidden">
        {/* Decorative grain */}
        <div className="absolute inset-0 opacity-[0.03]" style={{
          backgroundImage: 'radial-gradient(circle at 2px 2px, currentColor 1px, transparent 0)',
          backgroundSize: '20px 20px',
        }} />
        <div className="absolute -right-10 -top-10 w-48 h-48 rounded-full bg-sienna-500/10 blur-3xl" />
        <div className="relative flex items-start justify-between">
          <div>
            <h1 className="text-3xl md:text-4xl font-display text-cream-50 tracking-tight leading-[0.95]">
              {b.bean?.name ?? "Unknown bean"}
            </h1>
            <p className="text-sm text-espresso-400 mt-2">
              {formatDateTime(b.brewedAt)}
            </p>
          </div>
          {b.tasting && (
            <StarRating value={b.tasting.overallEnjoyment} size="md" />
          )}
        </div>
        {b.bean?.roaster && (
          <p className="text-sm text-espresso-400 italic">
            Roasted by {b.bean.roaster}
          </p>
        )}
        <div className="flex gap-2 flex-wrap relative">
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-lg bg-espresso-700/50 text-cream-200 text-xs font-medium border border-espresso-600/30">
            {computedDaysOffRoast} day{computedDaysOffRoast !== 1 ? "s" : ""} off roast
          </span>
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-lg bg-espresso-700/50 text-cream-200 text-xs font-medium border border-espresso-600/30">
            {b.timeOfDay}
          </span>
        </div>
      </div>

      {/* Equipment */}
      <div className="rounded-2xl border border-cream-200 bg-cream-50 p-6 animate-slide-up" style={{ animationDelay: '100ms' }}>
        <SectionLabel>Equipment</SectionLabel>
        <div className="divide-y divide-cream-200">
          {b.grinder && (
            <DetailRow
              label="Grinder"
              value={
                <span className="inline-flex items-center gap-1.5">
                  {(() => {
                    const Icon = getEquipmentIcon('grinder' as EquipmentType, b.grinder!.name);
                    return <Icon size={14} className="text-sienna-500" />;
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
                    return <Icon size={14} className="text-sienna-500" />;
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
                    return <Icon size={14} className="text-sienna-500" />;
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
                    return <Icon size={14} className="text-sienna-500" />;
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
      </div>

      {/* Parameters */}
      <div className="rounded-2xl border border-cream-200 bg-cream-50 p-6 animate-slide-up" style={{ animationDelay: '200ms' }}>
        <SectionLabel>Parameters</SectionLabel>

        {/* Hero recipe strip */}
        <div className="grid grid-cols-3 gap-4 mb-6 pb-6 border-b border-cream-300">
          <div className="text-center">
            <p className="font-display text-3xl md:text-4xl text-espresso-900 tracking-tight leading-none">{b.coffeeDose}g</p>
            <p className="font-body text-[10px] text-espresso-400 uppercase tracking-[0.15em] mt-2 font-medium">Dose</p>
          </div>
          <div className="text-center border-x border-cream-300">
            <p className="font-display text-3xl md:text-4xl text-espresso-900 tracking-tight leading-none">{b.totalWater}g</p>
            <p className="font-body text-[10px] text-espresso-400 uppercase tracking-[0.15em] mt-2 font-medium">Water</p>
          </div>
          <div className="text-center">
            <p className="font-display text-3xl md:text-4xl text-sienna-600 tracking-tight leading-none">1:{b.ratio}</p>
            <p className="font-body text-[10px] text-espresso-400 uppercase tracking-[0.15em] mt-2 font-medium">Ratio</p>
          </div>
        </div>

        <div className="divide-y divide-cream-200">
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
          <div className="mt-4 pt-4 border-t border-cream-200">
            <p className="text-xs font-display text-espresso-600 mb-1.5">
              Technique Notes
            </p>
            <p className="text-sm text-espresso-700 leading-relaxed italic">
              {b.techniqueNotes}
            </p>
          </div>
        )}
      </div>

      {/* Tasting */}
      {b.tasting ? (
        <div className="rounded-2xl border border-cream-200 bg-white paper-texture p-6 animate-slide-up" style={{ animationDelay: '300ms' }}>
          <SectionLabel>Tasting Evaluation</SectionLabel>
          <div className="space-y-6">
            {/* Mindfulness */}
            {b.tasting.mindfulness && (
              <div>
                <p className="text-sm font-display text-espresso-700 mb-1.5">Mindfulness</p>
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-cream-200 text-espresso-600 text-xs font-medium">
                  {b.tasting.mindfulness === "focused" && <Eye size={14} className="text-sienna-500" />}
                  {b.tasting.mindfulness === "casual" && <CoffeeIcon size={14} className="text-sienna-500" />}
                  {b.tasting.mindfulness === "distracted" && <Zap size={14} className="text-sienna-500" />}
                  {b.tasting.mindfulness.charAt(0).toUpperCase() + b.tasting.mindfulness.slice(1)}
                </span>
              </div>
            )}

            {/* Acidity slider (read-only) */}
            <Slider
              label="Acidity"
              min={1}
              max={5}
              value={b.tasting.acidityFeel}
              onChange={() => {}}
              minLabel="Smooth & mellow"
              maxLabel="Bright & sharp"
              className="pointer-events-none [&_input]:accent-sienna-500"
            />

            {/* Sweet/Bitter slider (read-only) */}
            <Slider
              label="Sweet / Bitter"
              min={1}
              max={5}
              value={b.tasting.sweetBitter}
              onChange={() => {}}
              minLabel="Sweet"
              maxLabel="Bitter"
              className="pointer-events-none [&_input]:accent-sienna-500"
            />

            {/* Body */}
            <div>
              <p className="text-sm font-display text-espresso-700 mb-1.5">Body</p>
              <span className="inline-flex items-center px-2.5 py-1 rounded-lg bg-cream-200 text-espresso-600 text-xs font-medium">
                {BODY_LABELS[b.tasting.body] ?? b.tasting.body}
              </span>
            </div>

            {/* Aftertaste */}
            <div>
              <p className="text-sm font-display text-espresso-700 mb-1.5">
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
                <span className="text-sm text-espresso-400 italic">None noticed</span>
              )}
            </div>

            {/* Flavor notes */}
            {b.tasting.flavorNotes && (
              <div>
                <p className="text-sm font-display text-espresso-700 mb-1.5">
                  Flavor Notes
                </p>
                <p className="text-sm text-espresso-600 italic">
                  {b.tasting.flavorNotes}
                </p>
              </div>
            )}

            {/* Overall rating — hero moment */}
            <div className="flex items-center gap-5 pt-5 border-t-2 border-cream-300">
              <div>
                <p className="font-body text-[10px] text-espresso-400 uppercase tracking-[0.15em] font-medium mb-1">Overall</p>
                <p className="font-display text-4xl md:text-5xl text-espresso-900 tracking-tight leading-none">{b.tasting.overallEnjoyment}</p>
              </div>
              <StarRating value={b.tasting.overallEnjoyment} size="md" />
            </div>

            {/* Personal notes */}
            {b.tasting.personalNotes && (
              <div className="pt-3 border-t border-cream-200">
                <p className="text-sm font-display text-espresso-700 mb-1.5">
                  Notes
                </p>
                <p className="text-sm text-espresso-600 leading-relaxed italic">
                  {b.tasting.personalNotes}
                </p>
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-12 paper-texture rounded-2xl border border-cream-200 bg-cream-50 text-center animate-slide-up" style={{ animationDelay: '300ms' }}>
          <div className="text-espresso-200 mb-4">
            <svg width="48" height="48" viewBox="0 0 48 48" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round">
              {[1, 2, 3, 4, 5].map((i) => (
                <path
                  key={i}
                  d={`M${4 + (i - 1) * 9.5} 24 l3.5 -7 3.5 7 7.5 1 -5.5 5.2 1.3 7.3 -6.8 -3.5 -6.8 3.5 1.3 -7.3 -5.5 -5.2 Z`}
                  className={i <= 3 ? "opacity-20" : "opacity-10"}
                  transform={`scale(0.5) translate(${(i - 1) * 2}, 10)`}
                />
              ))}
            </svg>
          </div>
          <p className="text-espresso-400 italic mb-2 font-display text-lg">
            How was this cup?
          </p>
          <p className="text-espresso-400 text-sm mb-5 max-w-xs">
            Rate your brew to track what you love and refine your technique.
          </p>
          <Button
            onClick={() => setShowTastingFlow(true)}
            className="bg-sienna-600 hover:bg-sienna-700 text-white px-8 py-2.5 text-base font-display warm-glow"
          >
            Rate this brew
          </Button>
        </div>
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
          <p className="text-sm text-espresso-500">
            This will permanently delete this brew log and any associated tasting
            data. This action cannot be undone.
          </p>
          <div className="flex justify-end gap-3 pt-2 border-t border-cream-200">
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setShowDeleteDialog(false)}
              className="text-espresso-600 hover:bg-cream-100"
            >
              Cancel
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleDelete}
              disabled={deleteBrew.isPending}
              className="bg-rose-500 hover:bg-rose-600 text-white"
            >
              {deleteBrew.isPending ? "Deleting..." : "Delete brew"}
            </Button>
          </div>
        </div>
      </Dialog>
    </div>
  );
}
