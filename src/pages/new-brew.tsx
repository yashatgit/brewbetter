import { useReducer, useMemo, useEffect, useState, useCallback, useRef } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Card } from "../components/ui/Card";
import { Input } from "../components/ui/Input";
import { useBeans } from "../hooks/use-beans";
import { useEquipment } from "../hooks/use-equipment";
import { useBrewMethods, useBrewLogs, useBrewLog, useCreateBrewLog, useUpdateBrewLog } from "../hooks/use-brew-logs";
import { useSavedSetups } from "../hooks/use-saved-setups";
import {
  calculateRatio,
  formatBrewTime,
  parseBrewTime,
  getTimeOfDay,
  daysOffRoast,
  cn,
} from "../lib/utils";
import { Check, ChevronLeft, ChevronRight, Sun, Minus, Plus } from "lucide-react";
import { getEquipmentIcon } from "../lib/equipment-icons";
import {
  BREW_TYPES,
  BREW_TYPE_CATEGORIES,
  getBrewType,
  type BrewType,
  type BrewTypeField,
} from "../lib/brew-types";
import type {
  Bean,
  Equipment,
  BrewMethod,
  EquipmentType,
  SavedSetup,
  BrewLogWithRelations,
} from "../types/database";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface EquipmentSelections {
  grinderId: string | null;
  brewDeviceId: string | null;
  filterId: string | null;
  waterTypeId: string | null;
}

interface BrewParams {
  coffeeDose: string;
  totalWater: string;
  waterTemp: string;
  grindSetting: string;
  bloomWater: string;
  bloomTime: string;
  numPours: string;
  totalBrewTime: string; // mm:ss
  techniqueNotes: string;
  brewMethodId: string;
}

interface WizardState {
  step: 1 | 2 | 3 | 4;
  beanId: string | null;
  equipment: EquipmentSelections;
  params: BrewParams;
  setupId: string | null;
  brewTypeId: string | null;
  extraParams: Record<string, any>;
}

// ---------------------------------------------------------------------------
// Reducer
// ---------------------------------------------------------------------------

type WizardAction =
  | { type: "SET_BEAN"; beanId: string }
  | { type: "SET_EQUIPMENT"; field: keyof EquipmentSelections; value: string | null }
  | { type: "SET_PARAMS"; updates: Partial<BrewParams> }
  | { type: "SET_SETUP"; setupId: string | null }
  | { type: "SET_BREW_TYPE"; brewTypeId: string }
  | { type: "SET_EXTRA_PARAM"; name: string; value: any }
  | { type: "PREFILL_FROM_SETUP"; setup: SavedSetup }
  | { type: "PREFILL_FROM_BREW"; brew: BrewLogWithRelations }
  | { type: "GO_TO_STEP"; step: WizardState["step"] }
  | { type: "NEXT_STEP" }
  | { type: "PREV_STEP" };

const INITIAL_PARAMS: BrewParams = {
  coffeeDose: "",
  totalWater: "",
  waterTemp: "",
  grindSetting: "",
  bloomWater: "",
  bloomTime: "",
  numPours: "",
  totalBrewTime: "",
  techniqueNotes: "",
  brewMethodId: "",
};

const INITIAL_STATE: WizardState = {
  step: 1,
  beanId: null,
  equipment: {
    grinderId: null,
    brewDeviceId: null,
    filterId: null,
    waterTypeId: null,
  },
  params: INITIAL_PARAMS,
  setupId: null,
  brewTypeId: null,
  extraParams: {},
};

function clampStep(step: number): WizardState["step"] {
  return Math.max(1, Math.min(4, step)) as WizardState["step"];
}

function wizardReducer(state: WizardState, action: WizardAction): WizardState {
  switch (action.type) {
    case "SET_BEAN":
      return { ...state, beanId: action.beanId };
    case "SET_EQUIPMENT":
      return {
        ...state,
        equipment: { ...state.equipment, [action.field]: action.value },
      };
    case "SET_PARAMS":
      return {
        ...state,
        params: { ...state.params, ...action.updates },
      };
    case "SET_SETUP":
      return { ...state, setupId: action.setupId };
    case "SET_BREW_TYPE": {
      const bt = getBrewType(action.brewTypeId);
      const defaults = bt?.defaults ?? {};
      const extraDefaults: Record<string, any> = {};
      for (const f of bt?.extraFields ?? []) {
        if (f.defaultValue !== undefined) extraDefaults[f.name] = f.defaultValue;
      }
      return {
        ...state,
        brewTypeId: action.brewTypeId,
        extraParams: extraDefaults,
        params: {
          ...state.params,
          coffeeDose: state.params.coffeeDose || (defaults.coffeeDose != null ? String(defaults.coffeeDose) : ""),
          totalWater: state.params.totalWater || (defaults.totalWater != null ? String(defaults.totalWater) : ""),
          waterTemp: state.params.waterTemp || (defaults.waterTemp != null ? String(defaults.waterTemp) : ""),
        },
      };
    }
    case "SET_EXTRA_PARAM":
      return {
        ...state,
        extraParams: { ...state.extraParams, [action.name]: action.value },
      };
    case "PREFILL_FROM_SETUP": {
      const s = action.setup;
      return {
        ...state,
        setupId: s.id,
        equipment: {
          grinderId: s.grinderId,
          brewDeviceId: s.brewDeviceId,
          filterId: s.filterId ?? null,
          waterTypeId: s.waterTypeId ?? null,
        },
        params: {
          ...state.params,
          coffeeDose: s.defaultCoffeeDose != null ? String(s.defaultCoffeeDose) : state.params.coffeeDose,
          totalWater: s.defaultTotalWater != null ? String(s.defaultTotalWater) : state.params.totalWater,
          waterTemp: s.defaultWaterTemp != null ? String(s.defaultWaterTemp) : state.params.waterTemp,
          grindSetting: s.defaultGrindSetting ?? state.params.grindSetting,
          brewMethodId: s.brewMethodId,
        },
      };
    }
    case "PREFILL_FROM_BREW": {
      const b = action.brew;
      return {
        ...state,
        equipment: {
          grinderId: b.grinderId,
          brewDeviceId: b.brewDeviceId,
          filterId: b.filterId ?? null,
          waterTypeId: b.waterTypeId,
        },
        brewTypeId: b.brewTypeId ?? state.brewTypeId,
        extraParams: (b.extraParams as Record<string, any>) ?? state.extraParams,
        params: {
          coffeeDose: String(b.coffeeDose),
          totalWater: String(b.totalWater),
          waterTemp: String(b.waterTemp),
          grindSetting: b.grinderSetting,
          bloomWater: b.bloomWater != null ? String(b.bloomWater) : "",
          bloomTime: b.bloomTime != null ? String(b.bloomTime) : "",
          numPours: b.numPours != null ? String(b.numPours) : "",
          totalBrewTime: formatBrewTime(b.totalBrewTime),
          techniqueNotes: b.techniqueNotes ?? "",
          brewMethodId: b.brewMethodId,
        },
      };
    }
    case "GO_TO_STEP":
      return { ...state, step: action.step };
    case "NEXT_STEP":
      return { ...state, step: clampStep(state.step + 1) };
    case "PREV_STEP":
      return { ...state, step: clampStep(state.step - 1) };
    default:
      return state;
  }
}

// ---------------------------------------------------------------------------
// Step Indicator
// ---------------------------------------------------------------------------

const STEP_LABELS = ["Bean", "Equipment", "Params", "Review"];

function StepIndicator({ currentStep }: { currentStep: number }) {
  return (
    <nav aria-label="Brew wizard progress" className="mb-10">
      <div className="flex items-center justify-between relative">
        {/* Background connector line */}
        <div className="absolute top-3 left-0 right-0 h-px bg-muted" aria-hidden="true" />
        {/* Filled progress line */}
        <div
          className="absolute top-3 left-0 h-px bg-primary transition-all duration-500 ease-out"
          style={{ width: `${((currentStep - 1) / (STEP_LABELS.length - 1)) * 100}%` }}
          aria-hidden="true"
        />

        {STEP_LABELS.map((label, i) => {
          const stepNum = i + 1;
          const isActive = stepNum === currentStep;
          const isComplete = stepNum < currentStep;
          return (
            <div key={label} className="relative flex flex-col items-center z-10">
              {/* Dot / checkmark */}
              <span
                className={cn(
                  "flex items-center justify-center w-6 h-6 rounded-full transition-all duration-300",
                  isActive && "bg-primary",
                  isComplete && "bg-primary",
                  !isActive && !isComplete && "bg-secondary border border-border"
                )}
              >
                {isComplete ? (
                  <Check size={12} strokeWidth={3} className="text-primary-foreground" />
                ) : isActive ? (
                  <span className="w-2 h-2 rounded-full bg-card" />
                ) : null}
              </span>
              {/* Label */}
              <span
                className={cn(
                  "mt-2.5 text-xs font-medium tracking-wide transition-colors",
                  isActive && "font-display text-sm text-foreground",
                  isComplete && "text-editorial",
                  !isActive && !isComplete && "text-muted-foreground"
                )}
              >
                {label}
              </span>
            </div>
          );
        })}
      </div>
    </nav>
  );
}

// ---------------------------------------------------------------------------
// Step 1 - Select Bean
// ---------------------------------------------------------------------------

function StepSelectBean({
  beans,
  selectedBeanId,
  lastUsedBeanId,
  onSelect,
}: {
  beans: Bean[];
  selectedBeanId: string | null;
  lastUsedBeanId: string | null;
  onSelect: (id: string) => void;
}) {
  const [search, setSearch] = useState("");

  const activeBeans = useMemo(
    () => beans.filter((b) => b.isActive),
    [beans]
  );

  const filtered = useMemo(() => {
    if (!search.trim()) return activeBeans;
    const q = search.toLowerCase();
    return activeBeans.filter(
      (b) =>
        b.name.toLowerCase().includes(q) ||
        b.roaster.toLowerCase().includes(q) ||
        b.originCountry.toLowerCase().includes(q)
    );
  }, [activeBeans, search]);

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h2 className="font-display text-2xl text-foreground tracking-tight">
          Select a Bean
        </h2>
        <p className="text-sm text-muted-foreground mt-1.5 font-body">
          Choose the coffee bean you are brewing today.
        </p>
      </div>

      {/* Notebook-line search */}
      <div className="max-w-md">
        <input
          type="text"
          placeholder="Search by name, roaster, or origin..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full bg-transparent border-0 border-b-2 border-input px-1 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-ring transition-colors font-body"
        />
      </div>

      {filtered.length === 0 && (
        <p className="text-muted-foreground text-center py-14 font-body">
          {activeBeans.length === 0
            ? "No active beans in your library. Add one first."
            : "No beans match your search."}
        </p>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 stagger-children">
        {filtered.map((bean) => {
          const isSelected = bean.id === selectedBeanId;
          const isLastUsed = bean.id === lastUsedBeanId;
          return (
            <button
              key={bean.id}
              type="button"
              onClick={() => onSelect(bean.id)}
              className={cn(
                "relative text-left p-4 border-2 bg-card transition-all duration-200 ",
                                isSelected
                  ? "border-border bg-accent"
                  : isLastUsed
                    ? "border-border hover:bg-muted"
                    : "border-border hover:bg-muted"
              )}
            >
              {isLastUsed && !isSelected && (
                <span className="absolute top-3 right-3 inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold uppercase tracking-wider bg-muted text-muted-foreground border border-border">
                  Last used
                </span>
              )}
              {isSelected && (
                <span className="absolute top-3 right-3 flex items-center justify-center w-6 h-6 rounded-full bg-primary text-primary-foreground">
                  <Check size={14} strokeWidth={3} />
                </span>
              )}
              <h3 className="font-display text-base text-foreground pr-14 leading-snug">
                {bean.name}
              </h3>
              <p className="text-sm text-muted-foreground mt-1 font-body">
                {bean.roaster}
              </p>
              <span className="inline-block mt-2.5 px-2 py-0.5 rounded text-[11px] font-medium uppercase tracking-wider bg-muted text-secondary-foreground border border-border">
                {bean.originCountry}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Step 2 - Select Equipment
// ---------------------------------------------------------------------------

function EquipmentGroup({
  label,
  type,
  items,
  selectedId,
  required,
  onSelect,
}: {
  label: string;
  type: EquipmentType;
  items: Equipment[];
  selectedId: string | null;
  required: boolean;
  onSelect: (field: keyof EquipmentSelections, id: string | null) => void;
}) {
  const fieldMap: Record<EquipmentType, keyof EquipmentSelections> = {
    grinder: "grinderId",
    brew_device: "brewDeviceId",
    filter: "filterId",
    water_type: "waterTypeId",
  };
  const field = fieldMap[type];

  if (items.length === 0) {
    return (
      <div className="space-y-2">
        <h3 className="font-display text-sm text-secondary-foreground tracking-wide">
          {label} {required && <span className="text-editorial">*</span>}
        </h3>
        <p className="text-sm text-muted-foreground font-body">
          No {label.toLowerCase()} found. Add one in Equipment settings.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <h3 className="font-display text-sm text-secondary-foreground tracking-wide">
        {label} {required && <span className="text-editorial">*</span>}
      </h3>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
        {items.map((eq) => {
          const isSelected = eq.id === selectedId;
          return (
            <button
              key={eq.id}
              type="button"
              onClick={() => onSelect(field, isSelected && !required ? null : eq.id)}
              className={cn(
                "text-left p-3 border transition-all duration-200",
                isSelected
                  ? "border-l-4 border-border bg-accent"
                  : "border-2 border-border hover:bg-muted"
              )}
            >
              <div className="flex items-start justify-between gap-1">
                <div className="flex items-center gap-1.5">
                  {(() => {
                    const Icon = getEquipmentIcon(type, eq.name);
                    return <Icon size={14} className={cn(
                      "shrink-0",
                      isSelected ? "text-editorial" : "text-muted-foreground"
                    )} />;
                  })()}
                  <p className={cn(
                    "text-sm font-medium leading-snug",
                    isSelected ? "text-foreground" : "text-secondary-foreground"
                  )}>
                    {eq.name}
                  </p>
                </div>
                {isSelected && (
                  <span className="flex items-center justify-center w-5 h-5 rounded-full bg-primary text-primary-foreground shrink-0">
                    <Check size={12} strokeWidth={3} />
                  </span>
                )}
              </div>
              {eq.brand && (
                <p className="text-xs text-muted-foreground mt-0.5 font-body">{eq.brand}</p>
              )}
              {eq.isDefault && (
                <span className="inline-block mt-1.5 px-1.5 py-0.5 rounded text-[10px] font-medium uppercase tracking-wider bg-muted text-muted-foreground border border-border">
                  Default
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}

function StepSelectEquipment({
  allEquipment,
  equipment,
  savedSetups,
  selectedSetupId,
  onSelectEquipment,
  onApplySetup,
}: {
  allEquipment: Equipment[];
  equipment: EquipmentSelections;
  savedSetups: SavedSetup[];
  selectedSetupId: string | null;
  onSelectEquipment: (field: keyof EquipmentSelections, id: string | null) => void;
  onApplySetup: (setup: SavedSetup) => void;
}) {
  const byType = useMemo(() => {
    const map: Record<EquipmentType, Equipment[]> = {
      grinder: [],
      brew_device: [],
      filter: [],
      water_type: [],
    };
    for (const eq of allEquipment) {
      map[eq.type]?.push(eq);
    }
    return map;
  }, [allEquipment]);

  return (
    <div className="space-y-8 animate-fade-in">
      <div>
        <h2 className="font-display text-2xl text-foreground tracking-tight">
          Select Equipment
        </h2>
        <p className="text-sm text-muted-foreground mt-1.5 font-body">
          Choose the gear for this brew. Defaults are pre-selected.
        </p>
      </div>

      {/* Saved Setups quick-select */}
      {savedSetups.length > 0 && (
        <div className="space-y-3">
          <h3 className="font-display text-sm text-secondary-foreground tracking-wide">
            Quick Setup
          </h3>
          <div className="flex flex-wrap gap-2">
            {savedSetups.map((setup) => (
              <button
                key={setup.id}
                type="button"
                onClick={() => onApplySetup(setup)}
                className={cn(
                  "px-4 py-2 rounded-full text-sm font-medium border-2 transition-all duration-200",
                  selectedSetupId === setup.id
                    ? "bg-primary text-primary-foreground border-primary"
                    : "border-border text-secondary-foreground hover:bg-muted hover:border-border"
                )}
              >
                {setup.name}
              </button>
            ))}
          </div>
        </div>
      )}

      <EquipmentGroup
        label="Grinder"
        type="grinder"
        items={byType.grinder}
        selectedId={equipment.grinderId}
        required
        onSelect={onSelectEquipment}
      />
      <EquipmentGroup
        label="Brew Device"
        type="brew_device"
        items={byType.brew_device}
        selectedId={equipment.brewDeviceId}
        required
        onSelect={onSelectEquipment}
      />
      <EquipmentGroup
        label="Filter"
        type="filter"
        items={byType.filter}
        selectedId={equipment.filterId}
        required={false}
        onSelect={onSelectEquipment}
      />
      <EquipmentGroup
        label="Water Type"
        type="water_type"
        items={byType.water_type}
        selectedId={equipment.waterTypeId}
        required
        onSelect={onSelectEquipment}
      />
    </div>
  );
}

// ---------------------------------------------------------------------------
// UI Components for Step 3
// ---------------------------------------------------------------------------

function NumberStepper({
  label,
  value,
  onChange,
  step = 1,
  min = 0,
  max = 9999,
  unit,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (val: string) => void;
  step?: number;
  min?: number;
  max?: number;
  unit?: string;
  placeholder?: string;
}) {
  const numVal = parseFloat(value) || 0;

  const decrement = () => {
    const next = Math.max(min, numVal - step);
    onChange(step < 1 ? next.toFixed(1) : String(next));
  };
  const increment = () => {
    const next = Math.min(max, numVal + step);
    onChange(step < 1 ? next.toFixed(1) : String(next));
  };

  return (
    <div className="flex flex-col items-center gap-1.5">
      <span className="data-label">
        {label}
      </span>
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={decrement}
          className="flex items-center justify-center w-9 h-9 rounded-full border-2 border-border text-muted-foreground hover:border-border hover:text-foreground hover:bg-muted transition-colors active:scale-95"
        >
          <Minus size={16} strokeWidth={2.5} />
        </button>
        <div className="relative">
          <input
            type="number"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder}
            min={min}
            max={max}
            step={step}
            className="w-24 text-center font-display text-2xl text-foreground bg-transparent border-0 border-b-2 border-input focus:border-ring focus:outline-none transition-colors [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
          />
          {unit && (
            <span className="absolute right-0 bottom-1 text-xs text-muted-foreground font-medium">
              {unit}
            </span>
          )}
        </div>
        <button
          type="button"
          onClick={increment}
          className="flex items-center justify-center w-9 h-9 rounded-full border-2 border-border text-muted-foreground hover:border-border hover:text-foreground hover:bg-muted transition-colors active:scale-95"
        >
          <Plus size={16} strokeWidth={2.5} />
        </button>
      </div>
    </div>
  );
}

function ParamCard({
  label,
  children,
  className,
}: {
  label: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <Card compact className={className}>
      <p className="data-label mb-4">
        {label}
      </p>
      {children}
    </Card>
  );
}

function ToggleSwitch({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: (val: boolean) => void;
}) {
  return (
    <label className="flex items-center justify-between gap-3 py-2 cursor-pointer">
      <span className="text-sm font-medium text-secondary-foreground">{label}</span>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className={cn(
          "relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200",
          checked ? "bg-primary" : "bg-secondary"
        )}
      >
        <span
          className={cn(
            "inline-block h-4 w-4 rounded-full bg-card transition-transform duration-200",
            checked ? "translate-x-6" : "translate-x-1"
          )}
        />
      </button>
    </label>
  );
}

// ---------------------------------------------------------------------------
// Step 3 - Brew Parameters (Visual Card-Picker)
// ---------------------------------------------------------------------------

function StepBrewParams({
  params,
  selectedBean,
  selectedGrinder,
  brewMethods,
  brewTypeId,
  extraParams,
  onChange,
  onSelectBrewType,
  onExtraParamChange,
}: {
  params: BrewParams;
  selectedBean: Bean | null;
  selectedGrinder: Equipment | null;
  brewMethods: BrewMethod[];
  brewTypeId: string | null;
  extraParams: Record<string, any>;
  onChange: (updates: Partial<BrewParams>) => void;
  onSelectBrewType: (id: string) => void;
  onExtraParamChange: (name: string, value: any) => void;
}) {
  const dose = parseFloat(params.coffeeDose) || 0;
  const water = parseFloat(params.totalWater) || 0;
  const ratio = calculateRatio(water, dose);

  const brewType = getBrewType(brewTypeId);
  const sf = brewType?.standardFields;

  const roastDateDays = useMemo(() => {
    if (!selectedBean?.roastDate) return null;
    const today = new Date().toISOString().split("T")[0];
    return daysOffRoast(today, selectedBean.roastDate);
  }, [selectedBean]);

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h2 className="font-display text-2xl text-foreground tracking-tight">
          Brew Parameters
        </h2>
        <p className="text-sm text-muted-foreground mt-1.5 font-body">
          Dial in the details of your brew.
        </p>
      </div>

      {/* Days off roast info */}
      {roastDateDays != null && roastDateDays >= 0 && (
        <div className="flex items-center gap-3 px-5 py-3.5 bg-accent border-2 border-border">
          <div className="flex items-center justify-center w-8 h-8 rounded-full bg-accent">
            <Sun size={16} strokeWidth={2} className="text-editorial" />
          </div>
          <div>
            <span className="text-sm text-foreground font-body">
              <span className="font-display text-lg font-semibold text-editorial">{roastDateDays}</span>{" "}
              days off roast
            </span>
          </div>
        </div>
      )}

      {/* A) Brew Type Selector */}
      <div className="space-y-3">
        <p className="data-label">
          Brew Type
        </p>
        <div className="overflow-x-auto -mx-2 px-2 pb-2">
          <div className="flex gap-2 min-w-min">
            {BREW_TYPE_CATEGORIES.map((cat) => {
              const typesInCat = BREW_TYPES.filter((t) => t.category === cat.key);
              if (typesInCat.length === 0) return null;
              return typesInCat.map((bt) => {
                const isSelected = bt.id === brewTypeId;
                return (
                  <button
                    key={bt.id}
                    type="button"
                    onClick={() => onSelectBrewType(bt.id)}
                    className={cn(
                      "flex flex-col items-center gap-1.5 px-4 py-3 border-2 transition-all duration-200 shrink-0",
                      isSelected
                        ? "border-border bg-accent"
                        : "border-border bg-card hover:bg-muted"
                    )}
                  >
                    <span className="text-xl">{bt.icon}</span>
                    <span className={cn(
                      "text-xs font-medium whitespace-nowrap",
                      isSelected ? "text-editorial" : "text-secondary-foreground"
                    )}>
                      {bt.name}
                    </span>
                  </button>
                );
              });
            })}
          </div>
        </div>
      </div>

      {/* Brew Method (existing, kept for backward compat) */}
      {brewMethods.length > 0 && (
        <div className="flex flex-col gap-2">
          <label className="data-label">
            Brew Method <span className="text-editorial">*</span>
          </label>
          <div className="flex flex-wrap gap-2">
            {brewMethods.map((m) => (
              <button
                key={m.id}
                type="button"
                onClick={() => onChange({ brewMethodId: m.id })}
                className={cn(
                  "px-4 py-2 rounded-full text-sm font-medium border-2 transition-all duration-200",
                  params.brewMethodId === m.id
                    ? "bg-primary text-primary-foreground border-primary"
                    : "border-border text-secondary-foreground hover:bg-muted hover:border-border"
                )}
              >
                {m.name}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* B) Recipe Card */}
      <div className="space-y-4">
        {/* Dose & Water */}
        {(sf?.coffeeDose !== false && sf?.totalWater !== false) && (
          <ParamCard label="Coffee & Water">
            <div className="flex flex-wrap justify-center gap-8">
              {sf?.coffeeDose !== false && (
                <NumberStepper
                  label="Dose"
                  value={params.coffeeDose}
                  onChange={(v) => onChange({ coffeeDose: v })}
                  step={0.5}
                  min={0}
                  max={100}
                  unit="g"
                  placeholder="18"
                />
              )}
              {sf?.totalWater !== false && (
                <NumberStepper
                  label="Water"
                  value={params.totalWater}
                  onChange={(v) => onChange({ totalWater: v })}
                  step={5}
                  min={0}
                  max={2000}
                  unit="g"
                  placeholder="250"
                />
              )}
            </div>

            {/* Ratio Display */}
            {dose > 0 && water > 0 && (
              <div className="mt-5 flex justify-center">
                <div className="px-6 py-3 bg-inverted border-2 border-border">
                  <p className="text-xs uppercase tracking-widest text-inverted-muted font-medium mb-1 text-center">Brew Ratio</p>
                  <p className="font-display text-3xl text-inverted-foreground tracking-tight text-center">
                    1:{ratio}
                  </p>
                </div>
              </div>
            )}
          </ParamCard>
        )}

        {/* Temperature & Grind */}
        <ParamCard label="Grind & Temperature">
          <div className="flex flex-wrap justify-center gap-8">
            {sf?.waterTemp !== false && (
              <NumberStepper
                label="Temperature"
                value={params.waterTemp}
                onChange={(v) => onChange({ waterTemp: v })}
                step={1}
                min={0}
                max={100}
                unit="°C"
                placeholder="94"
              />
            )}
            {sf?.grindSetting !== false && (
              <div className="flex flex-col items-center gap-1.5">
                <span className="data-label">
                  Grind Setting
                </span>
                <input
                  type="text"
                  value={params.grindSetting}
                  onChange={(e) => onChange({ grindSetting: e.target.value })}
                  placeholder={selectedGrinder?.grindUnitLabel ? `e.g. 24 ${selectedGrinder.grindUnitLabel}` : "e.g. 24 clicks"}
                  className="w-36 text-center font-display text-lg text-foreground bg-transparent border-0 border-b-2 border-input focus:border-ring focus:outline-none transition-colors py-1"
                />
              </div>
            )}
          </div>
        </ParamCard>

        {/* Bloom (if enabled by brew type) */}
        {(sf?.bloomWater !== false || sf?.bloomTime !== false) && (
          <ParamCard label="Bloom">
            <div className="flex flex-wrap justify-center gap-8">
              {sf?.bloomWater !== false && (
                <NumberStepper
                  label="Bloom Water"
                  value={params.bloomWater}
                  onChange={(v) => onChange({ bloomWater: v })}
                  step={5}
                  min={0}
                  max={200}
                  unit="g"
                  placeholder="45"
                />
              )}
              {sf?.bloomTime !== false && (
                <NumberStepper
                  label="Bloom Time"
                  value={params.bloomTime}
                  onChange={(v) => onChange({ bloomTime: v })}
                  step={5}
                  min={0}
                  max={120}
                  unit="s"
                  placeholder="30"
                />
              )}
            </div>
          </ParamCard>
        )}

        {/* Timing */}
        <ParamCard label="Timing">
          <div className="flex flex-wrap justify-center gap-8">
            {sf?.numPours !== false && (
              <NumberStepper
                label="Number of Pours"
                value={params.numPours}
                onChange={(v) => onChange({ numPours: v })}
                step={1}
                min={1}
                max={20}
                placeholder="4"
              />
            )}
            {sf?.totalBrewTime !== false && (
              <div className="flex flex-col items-center gap-1.5">
                <span className="data-label">
                  Total Brew Time
                </span>
                <input
                  type="text"
                  value={params.totalBrewTime}
                  onChange={(e) => onChange({ totalBrewTime: e.target.value })}
                  placeholder="mm:ss"
                  className="w-28 text-center font-display text-2xl text-foreground bg-transparent border-0 border-b-2 border-input focus:border-ring focus:outline-none transition-colors"
                />
              </div>
            )}
          </div>

          {/* Type-specific time fields */}
          {brewType && brewType.extraFields.filter((f) => f.type === "number").length > 0 && (
            <div className="flex flex-wrap justify-center gap-8 mt-6 pt-4 border-t border-border">
              {brewType.extraFields
                .filter((f) => f.type === "number")
                .map((field) => (
                  <NumberStepper
                    key={field.name}
                    label={field.label}
                    value={String(extraParams[field.name] ?? "")}
                    onChange={(v) => onExtraParamChange(field.name, v ? parseFloat(v) : "")}
                    step={field.step ?? 1}
                    min={field.min ?? 0}
                    max={field.max ?? 9999}
                    unit={field.unit}
                    placeholder={field.placeholder}
                  />
                ))}
            </div>
          )}
        </ParamCard>

        {/* Extra Boolean Fields (toggle switches) */}
        {brewType && brewType.extraFields.filter((f) => f.type === "boolean").length > 0 && (
          <ParamCard label="Options">
            <div className="space-y-1">
              {brewType.extraFields
                .filter((f) => f.type === "boolean")
                .map((field) => (
                  <ToggleSwitch
                    key={field.name}
                    label={field.label}
                    checked={!!extraParams[field.name]}
                    onChange={(v) => onExtraParamChange(field.name, v)}
                  />
                ))}
            </div>
          </ParamCard>
        )}

        {/* Technique Notes */}
        {sf?.techniqueNotes !== false && (
          <ParamCard label="Technique Notes">
            <textarea
              rows={3}
              value={params.techniqueNotes}
              onChange={(e) => onChange({ techniqueNotes: e.target.value })}
              placeholder="Describe your pour pattern, agitation, etc."
              className="w-full border-2 border-border bg-background px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground transition-colors focus:outline-none focus:border-ring focus:bg-card font-body"
            />
          </ParamCard>
        )}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Step 4 - Review & Submit
// ---------------------------------------------------------------------------

function ReviewRow({ label, value }: { label: string; value: React.ReactNode }) {
  if (!value) return null;
  return (
    <div className="flex justify-between items-start py-2.5 border-b border-border last:border-0">
      <span className="text-sm text-muted-foreground shrink-0 mr-4 font-body">{label}</span>
      <span className="text-sm font-medium text-foreground text-right font-body">{value}</span>
    </div>
  );
}

function StepReview({
  state,
  bean,
  allEquipment,
  brewMethods,
  isSubmitting,
  onSubmit,
  isEditMode,
}: {
  state: WizardState;
  bean: Bean | null;
  allEquipment: Equipment[];
  brewMethods: BrewMethod[];
  isSubmitting: boolean;
  onSubmit: () => void;
  isEditMode?: boolean;
}) {
  const equipMap = useMemo(() => {
    const m: Record<string, Equipment> = {};
    for (const eq of allEquipment) m[eq.id] = eq;
    return m;
  }, [allEquipment]);

  const grinder = state.equipment.grinderId ? equipMap[state.equipment.grinderId] : null;
  const brewDevice = state.equipment.brewDeviceId ? equipMap[state.equipment.brewDeviceId] : null;
  const filter = state.equipment.filterId ? equipMap[state.equipment.filterId] : null;
  const waterType = state.equipment.waterTypeId ? equipMap[state.equipment.waterTypeId] : null;
  const brewMethod = brewMethods.find((m) => m.id === state.params.brewMethodId);
  const brewType = getBrewType(state.brewTypeId);

  const dose = parseFloat(state.params.coffeeDose) || 0;
  const water = parseFloat(state.params.totalWater) || 0;
  const ratio = calculateRatio(water, dose);
  const brewTimeSecs = parseBrewTime(state.params.totalBrewTime);

  const roastDateDays = useMemo(() => {
    if (!bean?.roastDate) return null;
    const today = new Date().toISOString().split("T")[0];
    return daysOffRoast(today, bean.roastDate);
  }, [bean]);

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="text-center">
        <h2 className="font-display text-2xl text-foreground tracking-tight">
          Review Your Brew
        </h2>
        <p className="text-sm text-muted-foreground mt-1.5 font-body">
          Double-check everything before logging.
        </p>
      </div>

      {/* Tasting card container */}
      <Card className="!p-0 overflow-hidden">
        {/* Card header */}
        <div className="px-6 py-4 bg-muted border-b-2 border-border text-center">
          <p className="font-display text-lg text-foreground">
            {bean?.name ?? "Unknown Bean"}
          </p>
          <p className="text-xs text-muted-foreground mt-0.5 font-body">
            {bean?.roaster}
          </p>
        </div>

        {/* Bean section */}
        <div className="border-b border-border">
          <div className="flex items-center gap-2 px-6 py-3 bg-muted">
            <div className="w-1 h-4 rounded-full bg-primary" />
            <h3 className="data-label">
              Bean
            </h3>
          </div>
          <div className="px-6 py-2">
            <ReviewRow label="Name" value={bean?.name} />
            <ReviewRow label="Roaster" value={bean?.roaster} />
            <ReviewRow label="Origin" value={bean?.originCountry} />
            {roastDateDays != null && roastDateDays >= 0 && (
              <ReviewRow label="Days Off Roast" value={`${roastDateDays} days`} />
            )}
          </div>
        </div>

        {/* Equipment section */}
        <div className="border-b border-border">
          <div className="flex items-center gap-2 px-6 py-3 bg-muted">
            <div className="w-1 h-4 rounded-full bg-success" />
            <h3 className="data-label">
              Equipment
            </h3>
          </div>
          <div className="px-6 py-2">
            <ReviewRow label="Grinder" value={grinder?.name} />
            <ReviewRow label="Brew Device" value={brewDevice?.name} />
            {filter && <ReviewRow label="Filter" value={filter.name} />}
            <ReviewRow label="Water" value={waterType?.name} />
            {brewMethod && <ReviewRow label="Brew Method" value={brewMethod.name} />}
          </div>
        </div>

        {/* Parameters section */}
        <div>
          <div className="flex items-center gap-2 px-6 py-3 bg-muted">
            <div className="w-1 h-4 rounded-full bg-primary" />
            <h3 className="data-label">
              Parameters
            </h3>
          </div>
          <div className="px-6 py-2">
            {brewType && (
              <ReviewRow label="Brew Type" value={`${brewType.icon} ${brewType.name}`} />
            )}
            <ReviewRow label="Coffee Dose" value={`${state.params.coffeeDose}g`} />
            <ReviewRow label="Total Water" value={`${state.params.totalWater}g`} />
            <ReviewRow label="Ratio" value={`1:${ratio}`} />
            <ReviewRow label="Temperature" value={`${state.params.waterTemp}\u00B0C`} />
            <ReviewRow label="Grind Setting" value={state.params.grindSetting} />
            {state.params.bloomWater && (
              <ReviewRow label="Bloom Water" value={`${state.params.bloomWater}g`} />
            )}
            {state.params.bloomTime && (
              <ReviewRow label="Bloom Time" value={`${state.params.bloomTime}s`} />
            )}
            {state.params.numPours && (
              <ReviewRow label="Pours" value={state.params.numPours} />
            )}
            <ReviewRow label="Total Brew Time" value={formatBrewTime(brewTimeSecs)} />
            {/* Extra params from brew type */}
            {brewType?.extraFields.map((field) => {
              const val = state.extraParams[field.name];
              if (val === undefined || val === "" || val === null) return null;
              if (field.type === "boolean") {
                return <ReviewRow key={field.name} label={field.label} value={val ? "Yes" : "No"} />;
              }
              return (
                <ReviewRow
                  key={field.name}
                  label={field.label}
                  value={`${val}${field.unit ? field.unit : ""}`}
                />
              );
            })}
            {state.params.techniqueNotes && (
              <ReviewRow label="Technique" value={state.params.techniqueNotes} />
            )}
          </div>
        </div>
      </Card>

      {/* Log button */}
      <button
        type="button"
        onClick={onSubmit}
        disabled={isSubmitting}
        className={cn(
          "w-full py-4 text-base font-display font-semibold tracking-wide transition-all duration-300",
          "bg-primary text-primary-foreground",
          "hover:bg-primary",
          "active:translate-y-0",
          "disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0"
        )}
      >
        {isSubmitting
          ? (isEditMode ? "Saving Changes..." : "Logging Brew...")
          : (isEditMode ? "Save Changes" : "Log This Brew")}
      </button>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main Page Component
// ---------------------------------------------------------------------------

export default function NewBrew() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  // Edit mode detection
  const editId = searchParams.get("edit");
  const isEditMode = !!editId;
  const { data: editBrew, isLoading: editLoading } = useBrewLog(editId ?? "");

  // Data queries
  const { data: beans = [], isLoading: beansLoading } = useBeans();
  const { data: allEquipment = [], isLoading: equipLoading } = useEquipment();
  const { data: brewMethods = [], isLoading: methodsLoading } = useBrewMethods();
  const { data: savedSetups = [] } = useSavedSetups();
  const { data: brewLogs = [] } = useBrewLogs();
  const createBrewLog = useCreateBrewLog();
  const updateBrewLog = useUpdateBrewLog();

  const [state, dispatch] = useReducer(wizardReducer, INITIAL_STATE);
  const [initialized, setInitialized] = useState(false);

  // Find last-used bean from brew history
  const lastUsedBeanId = useMemo(() => {
    if (!brewLogs.length) return null;
    const sorted = [...(brewLogs as BrewLogWithRelations[])].sort(
      (a, b) => new Date(b.brewedAt).getTime() - new Date(a.brewedAt).getTime()
    );
    return sorted[0]?.beanId ?? null;
  }, [brewLogs]);

  // Pre-select default equipment on first mount, or prefill from edit brew
  useEffect(() => {
    if (initialized || equipLoading || !allEquipment.length) return;

    // Edit mode: prefill from existing brew
    if (isEditMode && editBrew) {
      setInitialized(true);
      const b = editBrew as BrewLogWithRelations;
      dispatch({ type: "SET_BEAN", beanId: b.beanId });
      dispatch({ type: "PREFILL_FROM_BREW", brew: b });
      return;
    }
    if (isEditMode && editLoading) return; // Wait for edit brew to load

    setInitialized(true);

    // Check for setup query param
    const setupId = searchParams.get("setup");
    if (setupId) {
      const setup = (savedSetups as SavedSetup[]).find((s) => s.id === setupId);
      if (setup) {
        dispatch({ type: "PREFILL_FROM_SETUP", setup });
        return;
      }
    }

    // Otherwise pre-select defaults
    const defaultGrinder = allEquipment.find((e) => e.type === "grinder" && e.isDefault);
    const defaultBrewDevice = allEquipment.find((e) => e.type === "brew_device" && e.isDefault);
    const defaultFilter = allEquipment.find((e) => e.type === "filter" && e.isDefault);
    const defaultWater = allEquipment.find((e) => e.type === "water_type" && e.isDefault);

    if (defaultGrinder) dispatch({ type: "SET_EQUIPMENT", field: "grinderId", value: defaultGrinder.id });
    if (defaultBrewDevice) dispatch({ type: "SET_EQUIPMENT", field: "brewDeviceId", value: defaultBrewDevice.id });
    if (defaultFilter) dispatch({ type: "SET_EQUIPMENT", field: "filterId", value: defaultFilter.id });
    if (defaultWater) dispatch({ type: "SET_EQUIPMENT", field: "waterTypeId", value: defaultWater.id });
  }, [allEquipment, equipLoading, initialized, savedSetups, searchParams, isEditMode, editBrew, editLoading]);

  // Pre-fill from last brew with same bean when bean is selected
  useEffect(() => {
    if (!state.beanId || !brewLogs.length) return;
    const lastBrew = [...(brewLogs as BrewLogWithRelations[])]
      .filter((b) => b.beanId === state.beanId)
      .sort((a, b) => new Date(b.brewedAt).getTime() - new Date(a.brewedAt).getTime())[0];
    if (lastBrew) {
      dispatch({ type: "PREFILL_FROM_BREW", brew: lastBrew });
    }
  }, [state.beanId, brewLogs]);

  // Derived data
  const selectedBean = useMemo(
    () => (beans as Bean[]).find((b) => b.id === state.beanId) ?? null,
    [beans, state.beanId]
  );

  const selectedGrinder = useMemo(
    () => (allEquipment as Equipment[]).find((e) => e.id === state.equipment.grinderId) ?? null,
    [allEquipment, state.equipment.grinderId]
  );

  // Step validation
  const canAdvance = useMemo(() => {
    switch (state.step) {
      case 1:
        return !!state.beanId;
      case 2:
        return !!(
          state.equipment.grinderId &&
          state.equipment.brewDeviceId &&
          state.equipment.waterTypeId
        );
      case 3: {
        const baseValid = !!(
          state.params.coffeeDose &&
          state.params.totalWater &&
          state.params.waterTemp &&
          state.params.grindSetting &&
          state.params.totalBrewTime &&
          state.params.brewMethodId
        );
        // Check required extra fields from brew type
        const bt = getBrewType(state.brewTypeId);
        if (bt) {
          const requiredExtras = bt.extraFields.filter((f) => f.required);
          const allRequiredFilled = requiredExtras.every((f) => {
            const val = state.extraParams[f.name];
            return val !== undefined && val !== "" && val !== null;
          });
          return baseValid && allRequiredFilled;
        }
        return baseValid;
      }
      case 4:
        return true;
      default:
        return false;
    }
  }, [state]);

  // Handlers
  const handleSelectBean = useCallback((beanId: string) => {
    dispatch({ type: "SET_BEAN", beanId });
    dispatch({ type: "NEXT_STEP" });
  }, []);

  const handleSelectEquipment = useCallback(
    (field: keyof EquipmentSelections, value: string | null) => {
      dispatch({ type: "SET_EQUIPMENT", field, value });
    },
    []
  );

  const handleApplySetup = useCallback((setup: SavedSetup) => {
    dispatch({ type: "PREFILL_FROM_SETUP", setup });
  }, []);

  const handleParamsChange = useCallback((updates: Partial<BrewParams>) => {
    dispatch({ type: "SET_PARAMS", updates });
  }, []);

  const handleSelectBrewType = useCallback((brewTypeId: string) => {
    dispatch({ type: "SET_BREW_TYPE", brewTypeId });
  }, []);

  const handleExtraParamChange = useCallback((name: string, value: any) => {
    dispatch({ type: "SET_EXTRA_PARAM", name, value });
  }, []);

  const handleSubmit = useCallback(() => {
    if (!selectedBean) return;

    const now = new Date();
    const todayStr = now.toISOString().split("T")[0];
    const roastDays = selectedBean.roastDate
      ? daysOffRoast(todayStr, selectedBean.roastDate)
      : 0;
    const brewTimeSecs = parseBrewTime(state.params.totalBrewTime);
    const dose = parseFloat(state.params.coffeeDose) || 0;
    const water = parseFloat(state.params.totalWater) || 0;

    // Build extra params, filtering out empty values
    const cleanExtraParams: Record<string, any> = {};
    for (const [k, v] of Object.entries(state.extraParams)) {
      if (v !== "" && v !== null && v !== undefined) {
        cleanExtraParams[k] = v;
      }
    }

    const payload = {
      brewedAt: isEditMode && editBrew ? (editBrew as BrewLogWithRelations).brewedAt : now.toISOString(),
      timeOfDay: isEditMode && editBrew ? (editBrew as BrewLogWithRelations).timeOfDay : getTimeOfDay(now),
      beanId: state.beanId,
      daysOffRoast: roastDays,
      grinderId: state.equipment.grinderId,
      grinderSetting: state.params.grindSetting,
      brewDeviceId: state.equipment.brewDeviceId,
      filterId: state.equipment.filterId || null,
      waterTypeId: state.equipment.waterTypeId,
      brewMethodId: state.params.brewMethodId,
      waterTemp: parseFloat(state.params.waterTemp) || 0,
      coffeeDose: dose,
      totalWater: water,
      ratio: calculateRatio(water, dose),
      bloomWater: state.params.bloomWater ? parseFloat(state.params.bloomWater) : null,
      bloomTime: state.params.bloomTime ? parseInt(state.params.bloomTime, 10) : null,
      numPours: state.params.numPours ? parseInt(state.params.numPours, 10) : null,
      totalBrewTime: brewTimeSecs,
      techniqueNotes: state.params.techniqueNotes || null,
      brewTypeId: state.brewTypeId || null,
      extraParams: Object.keys(cleanExtraParams).length > 0 ? cleanExtraParams : null,
    };

    if (isEditMode && editId) {
      updateBrewLog.mutate({ id: editId, data: payload }, {
        onSuccess: () => {
          navigate(`/brew/${editId}`);
        },
      });
    } else {
      createBrewLog.mutate(payload, {
        onSuccess: (result: { id?: string }) => {
          const id = result?.id;
          successNavRef.current = id ? `/brew/${id}` : "/brew/history";
          setShowSuccess(true);
          setTimeout(() => {
            navigate(successNavRef.current!);
          }, 1200);
        },
      });
    }
  }, [state, selectedBean, createBrewLog, updateBrewLog, navigate, isEditMode, editId, editBrew]);

  // Success celebration state
  const [showSuccess, setShowSuccess] = useState(false);
  const successNavRef = useRef<string | null>(null);

  // Track step direction for slide animation
  const prevStepRef = useRef(state.step);
  const [slideDirection, setSlideDirection] = useState<'forward' | 'backward'>('forward');

  useEffect(() => {
    if (state.step !== prevStepRef.current) {
      setSlideDirection(state.step > prevStepRef.current ? 'forward' : 'backward');
      prevStepRef.current = state.step;
    }
  }, [state.step]);

  // Loading
  const isLoading = beansLoading || equipLoading || methodsLoading || (isEditMode && editLoading);

  if (isLoading) {
    return (
      <div className="p-6  min-h-screen">
        <div className="flex flex-col items-center justify-center py-24">
          <div className="w-8 h-8 border-2 border-input border-t-primary rounded-full animate-spin" />
          <p className="mt-4 text-muted-foreground text-sm font-body">Preparing your brew station...</p>
        </div>
      </div>
    );
  }

  // Success celebration screen
  if (showSuccess) {
    return (
      <div className="min-h-screen  flex items-center justify-center">
        <div className="text-center space-y-6">
          <div className="relative inline-flex items-center justify-center">
            {/* Expanding ring */}
            <div className="absolute w-20 h-20 rounded-full border-2 border-editorial animate-success-ring" />
            {/* Check circle */}
            <div className="w-20 h-20 rounded-full bg-success flex items-center justify-center animate-check-circle">
              <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-success-foreground">
                <path d="M5 13l4 4L19 7" className="animate-check-draw" />
              </svg>
            </div>
          </div>
          <p className="font-display text-2xl text-foreground tracking-tight animate-fade-in" style={{ animationDelay: '400ms' }}>
            Brew logged
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen ">
      <div className="p-6 pb-12 max-w-3xl mx-auto">
        {/* Header */}
        <div className="mb-8 text-center animate-fade-in">
          <h1 className="font-display text-3xl text-foreground tracking-tight">
            {isEditMode ? "Edit Brew" : "New Brew"}
          </h1>
          <p className="text-muted-foreground mt-2 text-sm font-body">
            {isEditMode ? "Update the details of your brew." : "Log every detail of your pour."}
          </p>
        </div>

        {/* Step indicator */}
        <StepIndicator currentStep={state.step} />

        {/* Step content — directional slide transition */}
        <div
          key={state.step}
          className={slideDirection === 'forward' ? 'animate-step-forward' : 'animate-step-backward'}
        >
          {state.step === 1 && (
            <StepSelectBean
              beans={beans as Bean[]}
              selectedBeanId={state.beanId}
              lastUsedBeanId={lastUsedBeanId}
              onSelect={handleSelectBean}
            />
          )}

          {state.step === 2 && (
            <StepSelectEquipment
              allEquipment={allEquipment as Equipment[]}
              equipment={state.equipment}
              savedSetups={savedSetups as SavedSetup[]}
              selectedSetupId={state.setupId}
              onSelectEquipment={handleSelectEquipment}
              onApplySetup={handleApplySetup}
            />
          )}

          {state.step === 3 && (
            <StepBrewParams
              params={state.params}
              selectedBean={selectedBean}
              selectedGrinder={selectedGrinder}
              brewMethods={brewMethods as BrewMethod[]}
              brewTypeId={state.brewTypeId}
              extraParams={state.extraParams}
              onChange={handleParamsChange}
              onSelectBrewType={handleSelectBrewType}
              onExtraParamChange={handleExtraParamChange}
            />
          )}

          {state.step === 4 && (
            <StepReview
              state={state}
              bean={selectedBean}
              allEquipment={allEquipment as Equipment[]}
              brewMethods={brewMethods as BrewMethod[]}
              isSubmitting={createBrewLog.isPending || updateBrewLog.isPending}
              onSubmit={handleSubmit}
              isEditMode={isEditMode}
            />
          )}
        </div>

        {/* Navigation buttons */}
        <div className="flex items-center justify-between mt-10 pt-6 border-t border-border">
          <div>
            {state.step > 1 && (
              <button
                type="button"
                onClick={() => dispatch({ type: "PREV_STEP" })}
                className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-medium text-secondary-foreground hover:text-foreground hover:bg-muted transition-all duration-200"
              >
                <ChevronLeft size={16} strokeWidth={2} />
                Back
              </button>
            )}
          </div>
          <div>
            {state.step < 4 && state.step !== 1 && (
              <button
                type="button"
                onClick={() => dispatch({ type: "NEXT_STEP" })}
                disabled={!canAdvance}
                className={cn(
                  "inline-flex items-center gap-2 px-6 py-2.5 text-sm font-semibold transition-all duration-200",
                  canAdvance
                    ? "bg-primary text-primary-foreground hover:bg-primary"
                    : "bg-muted text-muted-foreground cursor-not-allowed"
                )}
              >
                Next
                <ChevronRight size={16} strokeWidth={2} />
              </button>
            )}
          </div>
        </div>

        {/* Submission error */}
        {(createBrewLog.isError || updateBrewLog.isError) && (
          <div className="mt-6 p-4 bg-destructive/10 border border-destructive/20">
            <p className="text-sm text-destructive font-body">
              {isEditMode ? "Failed to save changes. Please try again." : "Failed to log brew. Please try again."}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
