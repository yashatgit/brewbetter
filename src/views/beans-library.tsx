import { useState, useRef, type FormEvent } from "react";
import { Button } from "../components/ui/Button";
import { Input } from "../components/ui/Input";
import { Select } from "../components/ui/Select";
import { Card } from "../components/ui/Card";
import { Dialog } from "../components/ui/Dialog";
import {
  useBeans,
  useCreateBean,
  useUpdateBean,
  useDeleteBean,
} from "../hooks/use-beans";
import { useBeanScan } from "../hooks/use-llm";
import { Camera } from "lucide-react";
import type { Bean, ProcessingMethod, RoastLevel } from "../types/database";

const PROCESSING_METHOD_OPTIONS: { value: ProcessingMethod; label: string }[] =
  [
    { value: "washed", label: "Washed" },
    { value: "natural", label: "Natural" },
    { value: "honey", label: "Honey" },
    { value: "anaerobic", label: "Anaerobic" },
    { value: "infused", label: "Infused" },
    { value: "wet_hulled", label: "Wet Hulled" },
    { value: "other", label: "Other" },
  ];

const ROAST_LEVEL_OPTIONS: { value: RoastLevel; label: string }[] = [
  { value: "light", label: "Light" },
  { value: "medium_light", label: "Medium Light" },
  { value: "medium", label: "Medium" },
  { value: "medium_dark", label: "Medium Dark" },
  { value: "dark", label: "Dark" },
];

const PROCESSING_METHOD_LABELS: Record<ProcessingMethod, string> =
  Object.fromEntries(
    PROCESSING_METHOD_OPTIONS.map((o) => [o.value, o.label])
  ) as Record<ProcessingMethod, string>;

const ROAST_LEVEL_LABELS: Record<RoastLevel, string> = Object.fromEntries(
  ROAST_LEVEL_OPTIONS.map((o) => [o.value, o.label])
) as Record<RoastLevel, string>;

interface BeanFormData {
  name: string;
  roaster: string;
  originCountry: string;
  originRegion: string;
  variety: string;
  processingMethod: ProcessingMethod;
  roastLevel: RoastLevel;
  roastDate: string;
  altitudeMasl: string;
  bagWeightG: string;
  notes: string;
  isActive: boolean;
}

const EMPTY_FORM: BeanFormData = {
  name: "",
  roaster: "",
  originCountry: "",
  originRegion: "",
  variety: "",
  processingMethod: "washed",
  roastLevel: "medium",
  roastDate: "",
  altitudeMasl: "",
  bagWeightG: "",
  notes: "",
  isActive: true,
};

function beanToFormData(bean: Bean): BeanFormData {
  return {
    name: bean.name,
    roaster: bean.roaster,
    originCountry: bean.originCountry,
    originRegion: bean.originRegion ?? "",
    variety: bean.variety ?? "",
    processingMethod: bean.processingMethod,
    roastLevel: bean.roastLevel,
    roastDate: bean.roastDate,
    altitudeMasl: bean.altitudeMasl != null ? String(bean.altitudeMasl) : "",
    bagWeightG: bean.bagWeightG != null ? String(bean.bagWeightG) : "",
    notes: bean.notes ?? "",
    isActive: bean.isActive,
  };
}

function formDataToPayload(form: BeanFormData) {
  return {
    name: form.name,
    roaster: form.roaster,
    originCountry: form.originCountry,
    originRegion: form.originRegion || null,
    variety: form.variety || null,
    processingMethod: form.processingMethod,
    roastLevel: form.roastLevel,
    roastDate: form.roastDate,
    altitudeMasl: form.altitudeMasl ? Number(form.altitudeMasl) : null,
    bagWeightG: form.bagWeightG ? Number(form.bagWeightG) : null,
    notes: form.notes || null,
    isActive: form.isActive,
  };
}

export default function BeansLibrary() {
  const { data: beans, isLoading, error } = useBeans();
  const createBean = useCreateBean();
  const updateBean = useUpdateBean();
  const deleteBean = useDeleteBean();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingBean, setEditingBean] = useState<Bean | null>(null);
  const [form, setForm] = useState<BeanFormData>(EMPTY_FORM);
  const [showActiveOnly, setShowActiveOnly] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { scan: scanBag, isLoading: isScanning, error: scanError } = useBeanScan();

  const openAdd = () => {
    setEditingBean(null);
    setForm(EMPTY_FORM);
    setDialogOpen(true);
  };

  const openEdit = (bean: Bean) => {
    setEditingBean(bean);
    setForm(beanToFormData(bean));
    setDialogOpen(true);
  };

  const closeDialog = () => {
    setDialogOpen(false);
    setEditingBean(null);
    setForm(EMPTY_FORM);
  };

  const handleScanBag = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    // Reset file input so same file can be re-selected
    e.target.value = "";

    const reader = new FileReader();
    reader.onload = async () => {
      const base64 = reader.result as string;
      const result = await scanBag(base64);
      if (result) {
        const VALID_PROCESSING: ProcessingMethod[] = ["washed", "natural", "honey", "anaerobic", "infused", "wet_hulled", "other"];
        const VALID_ROAST: RoastLevel[] = ["light", "medium_light", "medium", "medium_dark", "dark"];

        setEditingBean(null);
        setForm({
          name: result.name ?? "",
          roaster: result.roaster ?? "",
          originCountry: result.originCountry ?? "",
          originRegion: result.originRegion ?? "",
          variety: result.variety ?? "",
          processingMethod: VALID_PROCESSING.includes(result.processingMethod) ? result.processingMethod : "washed",
          roastLevel: VALID_ROAST.includes(result.roastLevel) ? result.roastLevel : "medium",
          roastDate: result.roastDate ?? "",
          altitudeMasl: result.altitudeMasl != null ? String(result.altitudeMasl) : "",
          bagWeightG: result.bagWeightG != null ? String(result.bagWeightG) : "",
          notes: result.notes ?? "",
          isActive: true,
        });
        setDialogOpen(true);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    const payload = formDataToPayload(form);

    if (editingBean) {
      updateBean.mutate(
        { id: editingBean.id, data: payload },
        { onSuccess: closeDialog }
      );
    } else {
      createBean.mutate(payload, { onSuccess: closeDialog });
    }
  };

  const handleDelete = (bean: Bean) => {
    if (window.confirm(`Delete "${bean.name}"? This cannot be undone.`)) {
      deleteBean.mutate(bean.id);
    }
  };

  const updateField = <K extends keyof BeanFormData>(
    key: K,
    value: BeanFormData[K]
  ) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const filteredBeans = showActiveOnly
    ? beans?.filter((b) => b.isActive)
    : beans;

  const isSaving = createBean.isPending || updateBean.isPending;

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Actions */}
      <div className="flex items-center justify-end gap-2">
        <Button
          variant="secondary"
          onClick={() => fileInputRef.current?.click()}
          disabled={isScanning}
          className="gap-1.5"
        >
          <Camera size={16} />
          {isScanning ? "Scanning..." : "Scan Bag"}
        </Button>
        <Button
          onClick={openAdd}
        >
          + Add Bean
        </Button>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          capture="environment"
          onChange={handleScanBag}
          className="hidden"
        />
      </div>

      {/* Filter toggle */}
      <div className="flex items-center gap-4 px-4 py-3 bg-muted border-2 border-border">
        <label className="inline-flex items-center gap-2.5 text-sm text-secondary-foreground cursor-pointer select-none">
          <input
            type="checkbox"
            checked={showActiveOnly}
            onChange={(e) => setShowActiveOnly(e.target.checked)}
            className="border-input text-primary focus:ring-ring accent-primary"
          />
          <span className="font-medium">Show active only</span>
        </label>
        {beans && (
          <span className="text-sm text-muted-foreground">
            {filteredBeans?.length} of {beans.length} beans
          </span>
        )}
      </div>

      {/* Scan error */}
      {scanError && (
        <div className="px-4 py-3 bg-destructive/10 border border-destructive/20 text-sm text-destructive">
          Scan failed: {scanError}
        </div>
      )}

      {/* Loading / Error states */}
      {isLoading && (
        <div className="flex items-center justify-center py-12">
          <div className="text-center space-y-4 animate-fade-in">
            <div className="animate-float">
              <svg width="48" height="48" viewBox="0 0 48 48" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" className="text-muted-foreground mx-auto">
                <ellipse cx="24" cy="24" rx="12" ry="16" />
                <path d="M24 8 Q20 24 24 40" />
              </svg>
            </div>
            <p className="font-display text-muted-foreground text-lg">Loading your beans...</p>
          </div>
        </div>
      )}
      {error && (
        <p className="text-destructive text-center py-12">
          Failed to load beans. Please try again.
        </p>
      )}

      {/* Empty state */}
      {!isLoading && !error && filteredBeans?.length === 0 && (
        <Card className="text-center py-20 animate-fade-in">
          <div className="text-muted-foreground animate-float mb-6">
            <svg width="100" height="100" viewBox="0 0 100 100" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" className="mx-auto">
              {/* Bean bag */}
              <path d="M30 75 Q20 75 20 60 V35 Q20 25 30 25 h40 Q80 25 80 35 V60 Q80 75 70 75 Z" className="fill-secondary/30" />
              <ellipse cx="50" cy="25" rx="30" ry="6" className="fill-secondary/20" />
              {/* Bean inside */}
              <ellipse cx="50" cy="52" rx="10" ry="14" className="opacity-30" />
              <path d="M50 38 Q47 52 50 66" className="opacity-25" />
            </svg>
          </div>
          <p className="text-muted-foreground text-lg font-display mb-3">
            {showActiveOnly
              ? "No active beans right now"
              : "Your bean library is waiting to be filled"}
          </p>
          {!showActiveOnly && (
            <>
              <p className="text-sm text-muted-foreground mb-6 max-w-sm mx-auto leading-relaxed">
                Add your first bag to start tracking origins, roasters, and flavor profiles.
              </p>
              <Button
                onClick={openAdd}
              >
                + Add Your First Bean
              </Button>
            </>
          )}
        </Card>
      )}

      {/* Bean grid */}
      {filteredBeans && filteredBeans.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 stagger-children">
          {filteredBeans.map((bean: Bean) => (
            <Card
              key={bean.id}
              compact
              className="flex flex-col justify-between gap-2"
            >
              {/* Top row: name + roaster (truncated) + status + actions */}
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0 flex-1">
                  <h3 className="font-display text-base text-foreground leading-snug tracking-tight">
                    {bean.name}
                  </h3>
                  {bean.roaster && (
                    <p className="text-sm text-muted-foreground mt-1 font-body truncate">
                      {bean.roaster}
                    </p>
                  )}
                </div>
                <div className="flex items-center gap-1.5 shrink-0">
                  <span
                    className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium whitespace-nowrap ${
                      bean.isActive
                        ? "bg-success/20 text-success"
                        : "bg-destructive/10 text-destructive"
                    }`}
                  >
                    {bean.isActive ? "Active" : "Inactive"}
                  </span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => openEdit(bean)}
                    className="!px-1.5 !py-0.5 text-xs"
                  >
                    Edit
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDelete(bean)}
                    disabled={deleteBean.isPending}
                    className="text-destructive hover:text-destructive hover:bg-destructive/10 !px-1.5 !py-0.5 text-xs"
                  >
                    Del
                  </Button>
                </div>
              </div>

              {/* Badges row: origin + processing + roast inline */}
              <div className="flex flex-wrap items-center gap-1.5">
                <span className="inline-flex items-center px-2 py-0.5 bg-muted text-secondary-foreground text-xs font-medium">
                  {bean.originCountry}
                  {bean.originRegion ? ` \u00B7 ${bean.originRegion}` : ""}
                </span>
                <span className="inline-flex items-center px-1.5 py-0.5 bg-muted text-secondary-foreground text-[11px]">
                  {PROCESSING_METHOD_LABELS[bean.processingMethod]}
                </span>
                <span className="inline-flex items-center px-1.5 py-0.5 bg-muted text-secondary-foreground text-[11px]">
                  {ROAST_LEVEL_LABELS[bean.roastLevel]}
                </span>
                <span className="text-[11px] text-muted-foreground ml-auto">
                  Roasted {bean.roastDate}
                </span>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Add / Edit Dialog */}
      <Dialog
        open={dialogOpen}
        onClose={closeDialog}
        title={editingBean ? "Edit Bean" : "New Bean Entry"}
      >
        <form onSubmit={handleSubmit} className="space-y-5">
          <Input
            label="Name"
            required
            value={form.name}
            onChange={(e) => updateField("name", e.target.value)}
            placeholder="e.g. Gesha Village Lot 74"
          />

          <Input
            label="Roaster"
            required
            value={form.roaster}
            onChange={(e) => updateField("roaster", e.target.value)}
            placeholder="e.g. Onyx Coffee Lab"
          />

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Origin Country"
              required
              value={form.originCountry}
              onChange={(e) => updateField("originCountry", e.target.value)}
              placeholder="e.g. Ethiopia"
            />
            <Input
              label="Origin Region"
              value={form.originRegion}
              onChange={(e) => updateField("originRegion", e.target.value)}
              placeholder="e.g. Yirgacheffe"
            />
          </div>

          <Input
            label="Variety"
            value={form.variety}
            onChange={(e) => updateField("variety", e.target.value)}
            placeholder="e.g. Gesha, SL28"
          />

          <div className="grid grid-cols-2 gap-4">
            <Select
              label="Processing Method"
              required
              options={PROCESSING_METHOD_OPTIONS}
              value={form.processingMethod}
              onChange={(e) =>
                updateField(
                  "processingMethod",
                  e.target.value as ProcessingMethod
                )
              }
            />
            <Select
              label="Roast Level"
              required
              options={ROAST_LEVEL_OPTIONS}
              value={form.roastLevel}
              onChange={(e) =>
                updateField("roastLevel", e.target.value as RoastLevel)
              }
            />
          </div>

          <Input
            label="Roast Date"
            type="date"
            required
            value={form.roastDate}
            onChange={(e) => updateField("roastDate", e.target.value)}
          />

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Altitude (masl)"
              type="number"
              min={0}
              value={form.altitudeMasl}
              onChange={(e) => updateField("altitudeMasl", e.target.value)}
              placeholder="e.g. 1900"
            />
            <Input
              label="Bag Weight (g)"
              type="number"
              min={0}
              value={form.bagWeightG}
              onChange={(e) => updateField("bagWeightG", e.target.value)}
              placeholder="e.g. 250"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label
              htmlFor="bean-notes"
              className="data-label"
            >
              Notes
            </label>
            <textarea
              id="bean-notes"
              rows={3}
              value={form.notes}
              onChange={(e) => updateField("notes", e.target.value)}
              placeholder="Tasting notes, purchase info, anything worth remembering..."
              className="border-2 border-border bg-background px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:border-ring resize-none"
            />
          </div>

          <label className="inline-flex items-center gap-2.5 text-sm text-secondary-foreground cursor-pointer select-none">
            <input
              type="checkbox"
              checked={form.isActive}
              onChange={(e) => updateField("isActive", e.target.checked)}
              className="border-input text-primary focus:ring-ring accent-primary"
            />
            Active
          </label>

          <div className="flex justify-end gap-3 pt-3 border-t border-border">
            <Button
              type="button"
              variant="secondary"
              onClick={closeDialog}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSaving}
            >
              {isSaving
                ? "Saving..."
                : editingBean
                  ? "Update Bean"
                  : "Add Bean"}
            </Button>
          </div>
        </form>
      </Dialog>
    </div>
  );
}
