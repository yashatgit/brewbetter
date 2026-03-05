import { useState } from "react";
import { Button } from "../ui/Button";
import { Slider } from "../ui/Slider";
import { StarRating } from "../ui/StarRating";
import { Input } from "../ui/Input";
import { useCreateTasting } from "../../hooks/use-tasting";
import { Eye, Coffee, Zap } from "lucide-react";
import type { LucideIcon } from "lucide-react";

interface TastingFlowProps {
  brewLogId: string;
  onComplete: () => void;
  onSkip: () => void;
}

type BodyType = "thin" | "medium" | "thick";
type AftertasteQuality = "pleasant" | "neutral" | "unpleasant";
type MindfulnessLevel = "focused" | "casual" | "distracted";

interface TastingData {
  mindfulness: MindfulnessLevel | null;
  acidity: number;
  sweetBitter: number;
  body: BodyType | null;
  hasAftertaste: boolean | null;
  aftertasteQuality: AftertasteQuality | null;
  flavorNotes: string;
  overallRating: number;
  personalNotes: string;
}

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

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <h3 className="text-lg font-display text-espresso-900 mb-1">{children}</h3>
  );
}

function SectionSubtitle({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-sm text-espresso-400 italic mb-4">{children}</p>
  );
}

export function TastingFlow({
  brewLogId,
  onComplete,
  onSkip,
}: TastingFlowProps) {
  const [data, setData] = useState<TastingData>({
    mindfulness: null,
    acidity: 3,
    sweetBitter: 3,
    body: null,
    hasAftertaste: null,
    aftertasteQuality: null,
    flavorNotes: "",
    overallRating: 0,
    personalNotes: "",
  });

  const createTasting = useCreateTasting();

  const update = (updates: Partial<TastingData>) => {
    setData((prev) => ({ ...prev, ...updates }));
  };

  const handleSave = () => {
    createTasting.mutate(
      {
        brewLogId,
        acidityFeel: data.acidity,
        sweetBitter: data.sweetBitter,
        body: data.body ?? "medium",
        aftertastePresence: data.hasAftertaste ?? false,
        aftertastePleasant: data.aftertasteQuality,
        flavorNotes: data.flavorNotes || null,
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
        <SectionTitle>How present are you?</SectionTitle>
        <SectionSubtitle>Your state of mind while tasting</SectionSubtitle>
        <div className="grid grid-cols-3 gap-3">
          {MINDFULNESS_OPTIONS.map((opt) => {
            const selected = data.mindfulness === opt.value;
            const Icon = opt.icon;
            return (
              <button
                key={opt.value}
                type="button"
                onClick={() => update({ mindfulness: opt.value })}
                className={`flex flex-col items-center justify-center gap-2 p-4 rounded-xl border-2 text-center transition-all duration-200 ease-out focus:outline-none focus-visible:ring-2 focus-visible:ring-sienna-400 focus-visible:ring-offset-2 ${
                  selected
                    ? "border-sienna-500 bg-sienna-50 shadow-sm"
                    : "border-cream-200 bg-cream-50 hover:border-cream-300 hover:bg-cream-100"
                }`}
              >
                <Icon
                  size={20}
                  className={selected ? "text-sienna-600" : "text-espresso-400"}
                />
                <span
                  className={`text-sm font-display ${
                    selected ? "text-sienna-700" : "text-espresso-700"
                  }`}
                >
                  {opt.label}
                </span>
              </button>
            );
          })}
        </div>
      </section>

      <hr className="border-cream-200" />

      {/* Feel - Acidity & Sweet/Bitter */}
      <section>
        <SectionTitle>How does it taste?</SectionTitle>
        <SectionSubtitle>Slide to describe what you're experiencing</SectionSubtitle>
        <div className="space-y-8">
          <Slider
            label="Acidity"
            min={1}
            max={5}
            value={data.acidity}
            onChange={(v) => update({ acidity: v })}
            minLabel="Smooth & mellow"
            maxLabel="Bright & sharp"
            className="[&_input]:accent-sienna-500"
          />
          <Slider
            label="Sweet / Bitter"
            min={1}
            max={5}
            value={data.sweetBitter}
            onChange={(v) => update({ sweetBitter: v })}
            minLabel="Sweet"
            maxLabel="Bitter"
            className="[&_input]:accent-sienna-500"
          />
        </div>
      </section>

      <hr className="border-cream-200" />

      {/* Body */}
      <section>
        <SectionTitle>How does it feel in your mouth?</SectionTitle>
        <SectionSubtitle>Pick the closest match</SectionSubtitle>
        <div className="grid grid-cols-3 gap-3">
          {BODY_OPTIONS.map((opt) => {
            const selected = data.body === opt.value;
            return (
              <button
                key={opt.value}
                type="button"
                onClick={() => update({ body: opt.value })}
                className={`flex flex-col items-center justify-center gap-2 p-4 rounded-xl border-2 text-center transition-all duration-200 ease-out focus:outline-none focus-visible:ring-2 focus-visible:ring-sienna-400 focus-visible:ring-offset-2 ${
                  selected
                    ? "border-sienna-500 bg-sienna-50 shadow-sm"
                    : "border-cream-200 bg-cream-50 hover:border-cream-300 hover:bg-cream-100"
                }`}
              >
                <span
                  className={`text-base font-display ${
                    selected ? "text-sienna-700" : "text-espresso-700"
                  }`}
                >
                  {opt.label}
                </span>
                <span
                  className={`text-xs leading-tight ${
                    selected ? "text-sienna-500" : "text-espresso-400"
                  }`}
                >
                  {opt.description}
                </span>
              </button>
            );
          })}
        </div>
      </section>

      <hr className="border-cream-200" />

      {/* Aftertaste */}
      <section>
        <SectionTitle>Aftertaste</SectionTitle>
        <SectionSubtitle>Did you notice a lingering finish?</SectionSubtitle>
        <div className="space-y-4">
          <div className="flex justify-center gap-3">
            {([true, false] as const).map((val) => {
              const selected = data.hasAftertaste === val;
              return (
                <button
                  key={String(val)}
                  type="button"
                  className={`min-w-[110px] rounded-xl border-2 px-6 py-3 text-sm font-medium transition-all duration-200 ease-out focus:outline-none focus-visible:ring-2 focus-visible:ring-sienna-400 focus-visible:ring-offset-2 ${
                    selected
                      ? "border-sienna-500 bg-sienna-50 text-sienna-700 shadow-sm"
                      : "border-cream-200 bg-cream-50 text-espresso-600 hover:border-cream-300"
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
              <p className="text-center text-sm font-display text-espresso-600">
                How was it?
              </p>
              <div className="flex justify-center gap-3">
                {AFTERTASTE_OPTIONS.map((opt) => {
                  const selected = data.aftertasteQuality === opt.value;
                  return (
                    <button
                      key={opt.value}
                      type="button"
                      className={`rounded-xl border-2 px-5 py-2.5 text-sm font-medium transition-all duration-200 ease-out focus:outline-none focus-visible:ring-2 focus-visible:ring-sienna-400 focus-visible:ring-offset-2 ${
                        selected
                          ? "border-sienna-500 bg-sienna-50 text-sienna-700 shadow-sm"
                          : "border-cream-200 bg-cream-50 text-espresso-600 hover:border-cream-300"
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

      <hr className="border-cream-200" />

      {/* Flavor & Rating */}
      <section>
        <SectionTitle>Flavor & Rating</SectionTitle>
        <SectionSubtitle>What stood out to you?</SectionSubtitle>
        <div className="space-y-6">
          <Input
            label="What did this remind you of?"
            placeholder="e.g. chocolate, citrus, berries..."
            value={data.flavorNotes}
            onChange={(e) => update({ flavorNotes: e.target.value })}
          />
          <div className="flex flex-col items-center gap-3 pt-2">
            <span className="text-sm font-display text-espresso-700">
              Overall enjoyment
            </span>
            <StarRating
              value={data.overallRating}
              onChange={(v) => update({ overallRating: v })}
              size="lg"
            />
          </div>
        </div>
      </section>

      <hr className="border-cream-200" />

      {/* Notes */}
      <section>
        <SectionTitle>Final thoughts</SectionTitle>
        <SectionSubtitle>Anything else worth remembering?</SectionSubtitle>
        <textarea
          value={data.personalNotes}
          onChange={(e) => update({ personalNotes: e.target.value })}
          placeholder="Jot down any other thoughts, adjustments for next time..."
          rows={4}
          className="w-full rounded-xl border border-cream-300 bg-cream-50 px-4 py-3 text-sm text-espresso-900 placeholder:text-espresso-400 transition-colors duration-200 ease-out focus:outline-none focus-visible:ring-2 focus-visible:ring-sienna-400 focus-visible:border-sienna-400 resize-none"
        />
      </section>

      {/* Actions */}
      <div className="flex items-center justify-between pt-4 border-t border-cream-200">
        <button
          type="button"
          onClick={onSkip}
          className="text-sm text-espresso-400 hover:text-espresso-600 transition-colors"
        >
          Skip
        </button>
        <Button
          onClick={handleSave}
          disabled={createTasting.isPending}
          className="bg-sienna-600 hover:bg-sienna-700 text-white px-8 py-2.5 font-display"
        >
          {createTasting.isPending ? "Saving..." : "Save Tasting"}
        </Button>
      </div>
    </div>
  );
}
