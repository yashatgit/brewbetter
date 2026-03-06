import { useState } from "react";
import { Button } from "../ui/Button";
import { StarRating } from "../ui/StarRating";
import { useCreateTasting } from "../../hooks/use-tasting";
import { Eye, Coffee, Zap, Info, X } from "lucide-react";
import type { LucideIcon } from "lucide-react";

interface TastingFlowProps {
  brewLogId: string;
  onComplete: () => void;
  onSkip: () => void;
}

type BodyType = "thin" | "medium" | "thick";
type AftertasteQuality = "pleasant" | "neutral" | "unpleasant";
type MindfulnessLevel = "focused" | "casual" | "distracted";
type TasteDirection = "wanted_less" | "just_right" | "wanted_more";
type BodyDirection = "wanted_lighter" | "just_right" | "wanted_heavier";
type TasteLevel = 1 | 2 | 3;

interface TastingData {
  mindfulness: MindfulnessLevel | null;
  sweetness: TasteLevel;
  sourness: TasteLevel;
  bitterness: TasteLevel;
  sweetnessDirection: TasteDirection | null;
  sournessDirection: TasteDirection | null;
  bitternessDirection: TasteDirection | null;
  body: BodyType | null;
  bodyDirection: BodyDirection | null;
  hasAftertaste: boolean | null;
  aftertasteQuality: AftertasteQuality | null;
  flavorTags: string[];
  overallRating: number;
  personalNotes: string;
}

const FLAVOR_TAGS = [
  "None",
  "Chocolate",
  "Caramel",
  "Nutty",
  "Fruity",
  "Berry",
  "Citrus",
  "Floral",
  "Honey",
  "Spicy",
  "Earthy",
  "Smoky",
  "Vanilla",
];

const STAR_ANCHORS: Record<number, string> = {
  1: "Not for me",
  2: "Below average",
  3: "Decent cup",
  4: "Really good",
  5: "Exceptional",
};

const TASTE_OPTIONS: { value: TasteLevel; label: string }[] = [
  { value: 1, label: "Low" },
  { value: 2, label: "Medium" },
  { value: 3, label: "High" },
];

const BODY_OPTIONS: { value: BodyType; label: string; description: string }[] =
  [
    { value: "thin", label: "Thin", description: "Delicate and tea-like" },
    { value: "medium", label: "Medium", description: "Balanced, like juice" },
    { value: "thick", label: "Thick", description: "Rich and syrupy" },
  ];

const AFTERTASTE_OPTIONS: {
  value: AftertasteQuality;
  label: string;
}[] = [
  { value: "pleasant", label: "Pleasant" },
  { value: "neutral", label: "Neutral" },
  { value: "unpleasant", label: "Unpleasant" },
];

const MINDFULNESS_OPTIONS: {
  value: MindfulnessLevel;
  label: string;
  icon: LucideIcon;
}[] = [
  { value: "focused", label: "Focused", icon: Eye },
  { value: "casual", label: "Casual", icon: Coffee },
  { value: "distracted", label: "Distracted", icon: Zap },
];

const TASTE_DIRECTION_OPTIONS: { value: TasteDirection; label: string }[] = [
  { value: "wanted_less", label: "Wanted less" },
  { value: "just_right", label: "Just right" },
  { value: "wanted_more", label: "Wanted more" },
];

const BODY_DIRECTION_OPTIONS: { value: BodyDirection; label: string }[] = [
  { value: "wanted_lighter", label: "Wanted lighter" },
  { value: "just_right", label: "Just right" },
  { value: "wanted_heavier", label: "Wanted heavier" },
];

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <h3 className="text-lg font-display text-foreground mb-1">{children}</h3>
  );
}

function SectionSubtitle({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-sm text-muted-foreground mb-4">{children}</p>
  );
}

function InfoTooltip({ text }: { text: string }) {
  const [open, setOpen] = useState(false);
  return (
    <span className="relative inline-flex ml-1.5 align-middle">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="text-muted-foreground hover:text-editorial transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        aria-label="More info"
      >
        <Info size={15} />
      </button>
      {open && (
        <span className="absolute left-6 top-0 z-10 w-56 border-2 border-border bg-card p-3 text-xs text-secondary-foreground leading-relaxed shadow-none">
          {text}
          <button
            type="button"
            onClick={() => setOpen(false)}
            className="absolute top-1 right-1 text-muted-foreground hover:text-foreground"
            aria-label="Close"
          >
            <X size={12} />
          </button>
        </span>
      )}
    </span>
  );
}

function DirectionSelector<T extends string>({
  options,
  value,
  onChange,
}: {
  options: { value: T; label: string }[];
  value: T | null;
  onChange: (v: T) => void;
}) {
  return (
    <div className="flex gap-2 mt-2">
      {options.map((opt) => {
        const selected = value === opt.value;
        return (
          <button
            key={opt.value}
            type="button"
            onClick={() => onChange(opt.value)}
            className={`flex-1 px-2 py-1.5 text-xs font-mono uppercase tracking-wide border-2 transition-all duration-200 ease-out focus:outline-none focus-visible:ring-2 focus-visible:ring-ring ${
              selected
                ? "border-border bg-accent text-editorial"
                : "border-secondary bg-card text-muted-foreground hover:bg-muted"
            }`}
          >
            {opt.label}
          </button>
        );
      })}
    </div>
  );
}

function TasteSelector({
  label,
  tooltip,
  value,
  onChange,
  direction,
  onDirectionChange,
}: {
  label: string;
  tooltip: string;
  value: TasteLevel;
  onChange: (v: TasteLevel) => void;
  direction: TasteDirection | null;
  onDirectionChange: (v: TasteDirection) => void;
}) {
  return (
    <div>
      <p className="text-sm font-display text-foreground mb-1">{label}</p>
      <p className="text-xs text-muted-foreground mb-3">{tooltip}</p>
      <div className="grid grid-cols-3 gap-3">
        {TASTE_OPTIONS.map((opt) => {
          const selected = value === opt.value;
          return (
            <button
              key={opt.value}
              type="button"
              onClick={() => onChange(opt.value)}
              className={`select-card flex items-center justify-center py-3 text-center ${
                selected ? "select-card--active" : ""
              }`}
            >
              <span
                className={`text-sm font-display ${
                  selected ? "text-editorial" : "text-secondary-foreground"
                }`}
              >
                {opt.label}
              </span>
            </button>
          );
        })}
      </div>
      <DirectionSelector
        options={TASTE_DIRECTION_OPTIONS}
        value={direction}
        onChange={onDirectionChange}
      />
    </div>
  );
}

export function TastingFlow({
  brewLogId,
  onComplete,
  onSkip,
}: TastingFlowProps) {
  const [data, setData] = useState<TastingData>({
    mindfulness: null,
    sweetness: 2,
    sourness: 2,
    bitterness: 2,
    sweetnessDirection: null,
    sournessDirection: null,
    bitternessDirection: null,
    body: null,
    bodyDirection: null,
    hasAftertaste: null,
    aftertasteQuality: null,
    flavorTags: [],
    overallRating: 0,
    personalNotes: "",
  });

  const createTasting = useCreateTasting();

  const update = (updates: Partial<TastingData>) => {
    setData((prev) => ({ ...prev, ...updates }));
  };

  const toggleFlavorTag = (tag: string) => {
    if (tag === "None") {
      setData((prev) => ({
        ...prev,
        flavorTags: prev.flavorTags.includes("None") ? [] : ["None"],
      }));
      return;
    }
    setData((prev) => ({
      ...prev,
      flavorTags: prev.flavorTags.includes(tag)
        ? prev.flavorTags.filter((t) => t !== tag)
        : [...prev.flavorTags.filter((t) => t !== "None"), tag],
    }));
  };

  const handleSave = () => {
    const tags = data.flavorTags.filter((t) => t !== "None");
    createTasting.mutate(
      {
        brewLogId,
        sweetness: data.sweetness,
        sourness: data.sourness,
        bitterness: data.bitterness,
        sweetnessDirection: data.sweetnessDirection,
        sournessDirection: data.sournessDirection,
        bitternessDirection: data.bitternessDirection,
        body: data.body ?? "medium",
        bodyDirection: data.bodyDirection,
        aftertastePresence: data.hasAftertaste ?? false,
        aftertastePleasant: data.aftertasteQuality,
        flavorTags: tags.length > 0 ? JSON.stringify(tags) : null,
        flavorNotes: null,
        overallEnjoyment: data.overallRating || 3,
        personalNotes: data.personalNotes || null,
        mindfulness: data.mindfulness,
      },
      { onSuccess: onComplete }
    );
  };

  return (
    <div className="mx-auto w-full max-w-md space-y-8 py-4 animate-fade-in">
      {/* Mindfulness */}
      <section>
        <SectionTitle>How present were you while brewing?</SectionTitle>      
        <div className="grid grid-cols-3 gap-3">
          {MINDFULNESS_OPTIONS.map((opt) => {
            const selected = data.mindfulness === opt.value;
            const Icon = opt.icon;
            return (
              <button
                key={opt.value}
                type="button"
                onClick={() => update({ mindfulness: opt.value })}
                className={`flex flex-col items-center justify-center gap-2 p-4 border-2 text-center transition-all duration-200 ease-out focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ${
                  selected
                    ? "border-border bg-accent"
                    : "border-border bg-card hover:bg-muted"
                }`}
              >
                <Icon
                  size={20}
                  className={selected ? "text-editorial" : "text-muted-foreground"}
                />
                <span
                  className={`text-sm font-display ${
                    selected ? "text-editorial" : "text-secondary-foreground"
                  }`}
                >
                  {opt.label}
                </span>
              </button>
            );
          })}
        </div>
      </section>

      {/* Taste */}
      <section>
        <SectionTitle>
          How does it taste?          
        </SectionTitle>
        <div className="space-y-6">
          <TasteSelector
            label="Sweetness"
            tooltip="How sweet does this coffee taste? Think caramel, honey, or fruit-like sweetness."
            value={data.sweetness}
            onChange={(v) => update({ sweetness: v })}
            direction={data.sweetnessDirection}
            onDirectionChange={(v) => update({ sweetnessDirection: v })}
          />
          <TasteSelector
            label="Sourness"
            tooltip="The bright, tangy quality — like citrus or green apple. Sometimes called acidity."
            value={data.sourness}
            onChange={(v) => update({ sourness: v })}
            direction={data.sournessDirection}
            onDirectionChange={(v) => update({ sournessDirection: v })}
          />
          <TasteSelector
            label="Bitterness"
            tooltip="The sharp, dry taste — like dark chocolate or grapefruit pith. Some bitterness is normal."
            value={data.bitterness}
            onChange={(v) => update({ bitterness: v })}
            direction={data.bitternessDirection}
            onDirectionChange={(v) => update({ bitternessDirection: v })}
          />
        </div>
      </section>

      {/* Body */}
      <section>
        <SectionTitle>
          How does it feel in your mouth?
          <InfoTooltip text="Body describes the weight and texture of the coffee on your tongue — from light and watery to heavy and syrupy." />
        </SectionTitle>
        <SectionSubtitle>Pick the closest match</SectionSubtitle>
        <div className="grid grid-cols-3 gap-3">
          {BODY_OPTIONS.map((opt) => {
            const selected = data.body === opt.value;
            return (
              <button
                key={opt.value}
                type="button"
                onClick={() => update({ body: opt.value })}
                className={`select-card flex flex-col items-center justify-center gap-2 p-4 text-center ${
                  selected ? "select-card--active" : ""
                }`}
              >
                <span
                  className={`text-base font-display ${
                    selected ? "text-editorial" : "text-secondary-foreground"
                  }`}
                >
                  {opt.label}
                </span>
                <span
                  className={`text-xs leading-tight ${
                    selected ? "text-editorial" : "text-muted-foreground"
                  }`}
                >
                  {opt.description}
                </span>
              </button>
            );
          })}
        </div>
        <DirectionSelector
          options={BODY_DIRECTION_OPTIONS}
          value={data.bodyDirection}
          onChange={(v) => update({ bodyDirection: v })}
        />
      </section>

      {/* Aftertaste */}
      <section>
        <SectionTitle>
          Aftertaste
          <InfoTooltip text="The lingering flavors that remain after you swallow. A long, pleasant finish is often a sign of quality." />
        </SectionTitle>
        <SectionSubtitle>Did you notice a lingering finish?</SectionSubtitle>
        <div className="space-y-4">
          <div className="flex justify-center gap-3">
            {([true, false] as const).map((val) => {
              const selected = data.hasAftertaste === val;
              return (
                <button
                  key={String(val)}
                  type="button"
                  className={`min-w-[110px] border-2 px-6 py-3 text-sm font-medium transition-all duration-200 ease-out focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ${
                    selected
                      ? "border-border bg-accent text-editorial"
                      : "border-border bg-card text-secondary-foreground hover:bg-muted"
                  }`}
                  onClick={() =>
                    update({
                      hasAftertaste: val,
                      aftertasteQuality: val ? data.aftertasteQuality : null,
                    })
                  }
                >
                  {val ? "Yes" : "No"}
                </button>
              );
            })}
          </div>

          {data.hasAftertaste && (
            <div className="space-y-3">
              <p className="text-center text-sm font-display text-secondary-foreground">
                How was it?
              </p>
              <div className="flex justify-center gap-3">
                {AFTERTASTE_OPTIONS.map((opt) => {
                  const selected = data.aftertasteQuality === opt.value;
                  return (
                    <button
                      key={opt.value}
                      type="button"
                      className={`border-2 px-5 py-2.5 text-sm font-medium transition-all duration-200 ease-out focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ${
                        selected
                          ? "border-border bg-accent text-editorial"
                          : "border-border bg-card text-secondary-foreground hover:bg-muted"
                      }`}
                      onClick={() => update({ aftertasteQuality: opt.value })}
                    >
                      {opt.label}
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Flavor Tags */}
      <section>
        <SectionTitle>
          Flavor Tags
          <InfoTooltip text="Select the flavors you noticed in this cup." />
        </SectionTitle>
        <SectionSubtitle>What flavors stood out?</SectionSubtitle>
        <div className="flex flex-wrap gap-2">
          {FLAVOR_TAGS.map((tag) => {
            const active = data.flavorTags.includes(tag);
            return (
              <button
                key={tag}
                type="button"
                onClick={() => toggleFlavorTag(tag)}
                className={active ? "chip chip--active" : "chip"}
              >
                {tag}
              </button>
            );
          })}
        </div>
      </section>

      {/* Overall Rating */}
      <section>
        <SectionTitle>Overall Rating</SectionTitle>
        <SectionSubtitle>How much did you enjoy this cup?</SectionSubtitle>
        <div className="flex flex-col items-center gap-3 pt-2">
          <StarRating
            value={data.overallRating}
            onChange={(v) => update({ overallRating: v })}
            size="lg"
          />
          {data.overallRating > 0 && (
            <span className="text-sm font-mono text-editorial">
              {STAR_ANCHORS[data.overallRating]}
            </span>
          )}
        </div>
      </section>

      {/* Notes */}
      <section>
        <SectionTitle>Final thoughts</SectionTitle>
        <SectionSubtitle>Anything else worth remembering?</SectionSubtitle>
        <textarea
          value={data.personalNotes}
          onChange={(e) => update({ personalNotes: e.target.value })}
          placeholder="Jot down any other thoughts, adjustments for next time..."
          rows={4}
          className="w-full border-2 border-border bg-background px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground transition-colors duration-200 ease-out focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:border-ring resize-none"
        />
      </section>

      {/* Actions */}
      <div className="flex items-center justify-between pt-4">
        <button
          type="button"
          onClick={onSkip}
          className="text-sm text-muted-foreground hover:text-secondary-foreground transition-colors"
        >
          Skip
        </button>
        <Button
          onClick={handleSave}
          disabled={createTasting.isPending}
          className="px-8 py-2.5"
        >
          {createTasting.isPending ? "Saving..." : "Save Tasting"}
        </Button>
      </div>
    </div>
  );
}
