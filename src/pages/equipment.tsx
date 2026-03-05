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
      <div className="mb-8 flex gap-1.5 rounded-xl bg-cream-100 border border-cream-200 p-1.5">
        {EQUIPMENT_SECTIONS.map((section) => (
          <button
            key={section.type}
            onClick={() => setActiveTab(section.type)}
            className={`flex-1 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200 ${
              activeTab === section.type
                ? "bg-sienna-600 text-white shadow-sm"
                : "bg-cream-200 text-espresso-600 hover:text-espresso-800 hover:bg-cream-300"
            }`}
          >
            {section.label}
          </button>
        ))}
      </div>

      {/* Section header with add button */}
      <div className="mb-5 flex items-center justify-between gap-4">
        <div className="flex items-center gap-4 flex-1 min-w-0">
          <h2 className="text-2xl font-display text-espresso-800 shrink-0">
            {activeSection.label}
          </h2>
          <div className="flex-1 border-t border-cream-300" />
        </div>
        <Button
          size="sm"
          onClick={openAddDialog}
          className="bg-sienna-600 hover:bg-sienna-700 text-white shrink-0"
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
                return <Icon size={48} strokeWidth={1.2} className="text-espresso-300 mx-auto" />;
              })()}
            </div>
            <p className="font-display italic text-espresso-400 text-lg">Loading your gear...</p>
          </div>
        </div>
      ) : equipment.length === 0 ? (
        <div className="py-16 text-center paper-texture rounded-2xl border border-cream-200 bg-cream-50 animate-fade-in">
          <div className="text-espresso-200 mb-4">
            {(() => {
              const Icon = getEquipmentIcon(activeTab, '');
              return <Icon size={48} strokeWidth={1} className="mx-auto" />;
            })()}
          </div>
          <p className="text-espresso-400 font-display italic text-lg mb-3">
            No {activeSection.label.toLowerCase()} yet
          </p>
          <p className="text-sm text-espresso-400 mb-5 max-w-sm mx-auto leading-relaxed">
            Add your gear to quickly build brew setups.
          </p>
          <Button
            size="sm"
            onClick={openAddDialog}
            className="bg-sienna-600 hover:bg-sienna-700 text-white"
          >
            + Add your first {activeSection.singular.toLowerCase()}
          </Button>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 stagger-children">
          {equipment.map((item: Equipment) => (
            <Card
              key={item.id}
              className="flex flex-col justify-between gap-3 border border-cream-200 bg-white rounded-2xl overflow-hidden hover:shadow-lg transition-all duration-250 hover:-translate-y-0.5"
            >
              <div className="p-5">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-3">
                    <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-sienna-500/10 border border-sienna-500/15">
                      {(() => {
                        const Icon = getEquipmentIcon(item.type, item.name);
                        return <Icon size={20} className="text-sienna-600" />;
                      })()}
                    </div>
                    <h3 className="font-display text-espresso-900 text-lg tracking-tight">
                      {item.name}
                    </h3>
                  </div>
                  {item.isDefault && (
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-sage-200 text-sage-700 uppercase tracking-wider">
                      Default
                    </span>
                  )}
                </div>

                {(item.brand || item.model) && (
                  <p className="mt-2 ml-[52px] text-sm text-espresso-500 italic">
                    {[item.brand, item.model].filter(Boolean).join(" \u00B7 ")}
                  </p>
                )}

                {activeTab === "grinder" && item.grindUnitLabel && (
                  <p className="mt-2 ml-[52px] text-xs text-espresso-400">
                    Grind unit: {item.grindUnitLabel}
                  </p>
                )}
              </div>

              <div className="flex gap-2 border-t border-cream-200 px-5 py-3">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => openEditDialog(item)}
                  className="text-espresso-600 hover:text-espresso-800 hover:bg-cream-100"
                >
                  Edit
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-rose-500 hover:bg-rose-100 hover:text-rose-700"
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
        <form onSubmit={handleSubmit} className="flex flex-col gap-4 paper-texture">
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
              className="h-4 w-4 rounded border-cream-300 text-sienna-600 accent-sienna-600 focus:ring-sienna-500"
            />
            <span className="text-sm font-medium text-espresso-700">
              Set as default
            </span>
          </label>

          <div className="mt-2 flex justify-end gap-3 pt-3 border-t border-cream-200">
            <Button
              variant="secondary"
              type="button"
              onClick={closeDialog}
              className="text-espresso-600 hover:bg-cream-100"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSaving}
              className="bg-sienna-600 hover:bg-sienna-700 text-white"
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
