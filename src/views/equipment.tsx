import { useState } from "react";
import { Button } from "../components/ui/Button";
import { Input } from "../components/ui/Input";
import { Card } from "../components/ui/Card";
import { Dialog } from "../components/ui/Dialog";
import {
  useEquipment,
  useCreateEquipment,
  useUpdateEquipment,
  useDeleteEquipment,
} from "../hooks/use-equipment";
import type { Equipment, EquipmentType } from "../types/database";
import { getEquipmentIcon } from "../lib/equipment-icons";

const EQUIPMENT_SECTIONS: {
  type: EquipmentType;
  label: string;
  singular: string;
}[] = [
  { type: "grinder", label: "Grinders", singular: "Grinder" },
  { type: "brew_device", label: "Brew Devices", singular: "Brew Device" },
  { type: "filter", label: "Filters", singular: "Filter" },
  { type: "water_type", label: "Water Types", singular: "Water Type" },
];

interface FormState {
  name: string;
  brand: string;
  model: string;
  grindUnitLabel: string;
  isDefault: boolean;
}

const emptyForm: FormState = {
  name: "",
  brand: "",
  model: "",
  grindUnitLabel: "",
  isDefault: false,
};

export default function EquipmentPage() {
  const [activeTab, setActiveTab] = useState<EquipmentType>("grinder");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<Equipment | null>(null);
  const [form, setForm] = useState<FormState>(emptyForm);
  const [nameError, setNameError] = useState("");

  const { data: equipment = [], isLoading } = useEquipment(activeTab);
  const createMutation = useCreateEquipment();
  const updateMutation = useUpdateEquipment();
  const deleteMutation = useDeleteEquipment();

  const activeSection = EQUIPMENT_SECTIONS.find((s) => s.type === activeTab)!;

  function openAddDialog() {
    setEditingItem(null);
    setForm(emptyForm);
    setNameError("");
    setDialogOpen(true);
  }

  function openEditDialog(item: Equipment) {
    setEditingItem(item);
    setForm({
      name: item.name,
      brand: item.brand ?? "",
      model: item.model ?? "",
      grindUnitLabel: item.grindUnitLabel ?? "",
      isDefault: item.isDefault,
    });
    setNameError("");
    setDialogOpen(true);
  }

  function closeDialog() {
    setDialogOpen(false);
    setEditingItem(null);
    setForm(emptyForm);
    setNameError("");
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!form.name.trim()) {
      setNameError("Name is required");
      return;
    }

    const payload: Record<string, unknown> = {
      type: activeTab,
      name: form.name.trim(),
      brand: form.brand.trim() || null,
      model: form.model.trim() || null,
      isDefault: form.isDefault,
      grindUnitLabel:
        activeTab === "grinder" ? form.grindUnitLabel.trim() || null : null,
    };

    if (editingItem) {
      updateMutation.mutate(
        { id: editingItem.id, data: payload },
        { onSuccess: closeDialog }
      );
    } else {
      createMutation.mutate(payload, { onSuccess: closeDialog });
    }
  }

  function handleDelete(id: string) {
    deleteMutation.mutate(id);
  }

  const isSaving = createMutation.isPending || updateMutation.isPending;

  return (
    <div className="animate-fade-in space-y-6">
      {/* Tabs */}
      <div className="mb-8 flex gap-1.5 bg-background border-2 border-border p-1.5">
        {EQUIPMENT_SECTIONS.map((section) => (
          <button
            key={section.type}
            onClick={() => setActiveTab(section.type)}
            className={`flex-1 px-3 py-2.5 text-sm font-medium transition-all duration-200 ${
              activeTab === section.type
                ? "bg-primary text-primary-foreground"
                : "bg-muted text-secondary-foreground hover:text-foreground hover:bg-secondary"
            }`}
          >
            {section.label}
          </button>
        ))}
      </div>

      {/* Section header with add button */}
      <div className="mb-5 flex items-center justify-between gap-4">
        <div className="flex items-center gap-4 flex-1 min-w-0">
          <h2 className="text-2xl font-display text-foreground shrink-0">
            {activeSection.label}
          </h2>
          <div className="flex-1 border-t border-input" />
        </div>
        <Button
          size="sm"
          onClick={openAddDialog}
          className="shrink-0"
        >
          + Add {activeSection.singular}
        </Button>
      </div>

      {/* Equipment grid */}
      {isLoading ? (
        <div className="flex items-center justify-center py-12 animate-fade-in">
          <div className="text-center space-y-4">
            <div className="animate-float">
              {(() => {
                const Icon = getEquipmentIcon(activeTab, '');
                return <Icon size={48} strokeWidth={1.2} className="text-muted-foreground mx-auto" />;
              })()}
            </div>
            <p className="font-display text-muted-foreground text-lg">Loading your gear...</p>
          </div>
        </div>
      ) : equipment.length === 0 ? (
        <Card className="py-16 text-center animate-fade-in">
          <div className="text-muted-foreground mb-4">
            {(() => {
              const Icon = getEquipmentIcon(activeTab, '');
              return <Icon size={48} strokeWidth={1} className="mx-auto" />;
            })()}
          </div>
          <p className="text-muted-foreground font-display text-lg mb-3">
            No {activeSection.label.toLowerCase()} yet
          </p>
          <p className="text-sm text-muted-foreground mb-5 max-w-sm mx-auto leading-relaxed">
            Add your gear to quickly build brew setups.
          </p>
          <Button
            size="sm"
            onClick={openAddDialog}
          >
            + Add your first {activeSection.singular.toLowerCase()}
          </Button>
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 stagger-children">
          {equipment.map((item: Equipment) => (
            <Card
              key={item.id}
              accent="editorial"
              className="flex flex-col justify-between gap-3 overflow-hidden !p-0"
            >
              <div className="p-6">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-3">
                    <div className="flex items-center justify-center w-10 h-10 bg-accent border-2 border-border">
                      {(() => {
                        const Icon = getEquipmentIcon(item.type, item.name);
                        return <Icon size={20} className="text-editorial" />;
                      })()}
                    </div>
                    <h3 className="font-display text-foreground text-lg tracking-tight">
                      {item.name}
                    </h3>
                  </div>
                  {item.isDefault && (
                    <span className="inline-flex items-center px-2 py-0.5 text-[10px] font-bold bg-success/20 text-success uppercase tracking-wider">
                      Default
                    </span>
                  )}
                </div>

                {(item.brand || item.model) && (
                  <p className="mt-2 ml-[52px] text-sm text-muted-foreground">
                    {[item.brand, item.model].filter(Boolean).join(" \u00B7 ")}
                  </p>
                )}

                {activeTab === "grinder" && item.grindUnitLabel && (
                  <p className="mt-2 ml-[52px] text-xs text-muted-foreground">
                    Grind unit: {item.grindUnitLabel}
                  </p>
                )}
              </div>

              <div className="flex gap-2 border-t border-secondary px-6 py-3">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => openEditDialog(item)}
                >
                  Edit
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-destructive hover:bg-destructive/10 hover:text-destructive"
                  onClick={() => handleDelete(item.id)}
                  disabled={deleteMutation.isPending}
                >
                  Delete
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Add / Edit dialog */}
      <Dialog
        open={dialogOpen}
        onClose={closeDialog}
        title={
          editingItem
            ? `Edit ${activeSection.singular}`
            : `Add ${activeSection.singular}`
        }
      >
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <Input
            label="Name"
            placeholder={`e.g. ${activeTab === "grinder" ? "Niche Zero" : activeTab === "brew_device" ? "V60" : activeTab === "filter" ? "Hario tabbed" : "Third Wave Water"}`}
            value={form.name}
            onChange={(e) => {
              setForm({ ...form, name: e.target.value });
              if (nameError) setNameError("");
            }}
            error={nameError}
          />

          <Input
            label="Brand (optional)"
            placeholder="e.g. Hario, Fellow, Baratza"
            value={form.brand}
            onChange={(e) => setForm({ ...form, brand: e.target.value })}
          />

          <Input
            label="Model (optional)"
            placeholder="e.g. 02, Ode Gen 2"
            value={form.model}
            onChange={(e) => setForm({ ...form, model: e.target.value })}
          />

          {activeTab === "grinder" && (
            <Input
              label="Grind Unit Label"
              placeholder='e.g. "Niche dial", "1Zpresso clicks"'
              value={form.grindUnitLabel}
              onChange={(e) =>
                setForm({ ...form, grindUnitLabel: e.target.value })
              }
            />
          )}

          <label className="flex items-center gap-2.5 cursor-pointer">
            <input
              type="checkbox"
              checked={form.isDefault}
              onChange={(e) =>
                setForm({ ...form, isDefault: e.target.checked })
              }
              className="h-4 w-4 border-input text-primary accent-primary focus:ring-ring"
            />
            <span className="data-label">
              Set as default
            </span>
          </label>

          <div className="mt-2 flex justify-end gap-3 pt-3 border-t border-border">
            <Button
              variant="secondary"
              type="button"
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
                : editingItem
                  ? "Save Changes"
                  : `Add ${activeSection.singular}`}
            </Button>
          </div>
        </form>
      </Dialog>
    </div>
  );
}
