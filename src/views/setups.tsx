import { useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  useSavedSetups,
  useCreateSavedSetup,
  useUpdateSavedSetup,
  useDeleteSavedSetup,
} from '../hooks/use-saved-setups'
import { useEquipment } from '../hooks/use-equipment'
import { useBrewMethods } from '../hooks/use-brew-logs'
import { Button } from '../components/ui/Button'
import { Input } from '../components/ui/Input'
import { Select } from '../components/ui/Select'
import { Card } from '../components/ui/Card'
import { Dialog } from '../components/ui/Dialog'
import { Bookmark } from 'lucide-react'
import type { SavedSetup, Equipment, BrewMethod } from '../types/database'

interface SetupFormData {
  name: string
  grinderId: string
  brewDeviceId: string
  filterId: string
  waterTypeId: string
  brewMethodId: string
  defaultCoffeeDose: string
  defaultTotalWater: string
  defaultWaterTemp: string
  defaultGrindSetting: string
  isDefault: boolean
}

const emptyForm: SetupFormData = {
  name: '',
  grinderId: '',
  brewDeviceId: '',
  filterId: '',
  waterTypeId: '',
  brewMethodId: '',
  defaultCoffeeDose: '',
  defaultTotalWater: '',
  defaultWaterTemp: '',
  defaultGrindSetting: '',
  isDefault: false,
}

function equipmentOptions(items: Equipment[] | undefined, type: string) {
  return (items ?? [])
    .filter((e) => e.type === type)
    .map((e) => ({ value: e.id, label: e.name }))
}

export default function Setups() {
  const router = useRouter()
  const { data: setups, isLoading } = useSavedSetups()
  const { data: equipment } = useEquipment()
  const { data: brewMethods } = useBrewMethods()
  const createSetup = useCreateSavedSetup()
  const updateSetup = useUpdateSavedSetup()
  const deleteSetup = useDeleteSavedSetup()

  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [form, setForm] = useState<SetupFormData>(emptyForm)
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null)

  const savedSetups = (setups ?? []) as SavedSetup[]
  const equipmentList = (equipment ?? []) as Equipment[]
  const methods = (brewMethods ?? []) as BrewMethod[]

  const grinders = equipmentOptions(equipmentList, 'grinder')
  const brewDevices = equipmentOptions(equipmentList, 'brew_device')
  const filters = equipmentOptions(equipmentList, 'filter')
  const waterTypes = equipmentOptions(equipmentList, 'water_type')
  const methodOptions = methods.map((m) => ({ value: m.id, label: m.name }))

  function openAddDialog() {
    setEditingId(null)
    setForm(emptyForm)
    setDialogOpen(true)
  }

  function openEditDialog(setup: SavedSetup) {
    setEditingId(setup.id)
    setForm({
      name: setup.name,
      grinderId: setup.grinderId,
      brewDeviceId: setup.brewDeviceId,
      filterId: setup.filterId ?? '',
      waterTypeId: setup.waterTypeId ?? '',
      brewMethodId: setup.brewMethodId,
      defaultCoffeeDose: setup.defaultCoffeeDose?.toString() ?? '',
      defaultTotalWater: setup.defaultTotalWater?.toString() ?? '',
      defaultWaterTemp: setup.defaultWaterTemp?.toString() ?? '',
      defaultGrindSetting: setup.defaultGrindSetting ?? '',
      isDefault: setup.isDefault,
    })
    setDialogOpen(true)
  }

  function updateField(field: keyof SetupFormData, value: string | boolean) {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const payload = {
      name: form.name,
      grinderId: form.grinderId,
      brewDeviceId: form.brewDeviceId,
      filterId: form.filterId || null,
      waterTypeId: form.waterTypeId || null,
      brewMethodId: form.brewMethodId,
      defaultCoffeeDose: form.defaultCoffeeDose ? Number(form.defaultCoffeeDose) : null,
      defaultTotalWater: form.defaultTotalWater ? Number(form.defaultTotalWater) : null,
      defaultWaterTemp: form.defaultWaterTemp ? Number(form.defaultWaterTemp) : null,
      defaultGrindSetting: form.defaultGrindSetting || null,
      isDefault: form.isDefault,
    }

    if (editingId) {
      updateSetup.mutate(
        { id: editingId, data: payload },
        { onSuccess: () => setDialogOpen(false) }
      )
    } else {
      createSetup.mutate(payload, {
        onSuccess: () => setDialogOpen(false),
      })
    }
  }

  function handleDelete(id: string) {
    deleteSetup.mutate(id, {
      onSuccess: () => setDeleteConfirmId(null),
    })
  }

  function getEquipmentName(id: string | null | undefined): string {
    if (!id) return '-'
    const item = equipmentList.find((e) => e.id === id)
    return item?.name ?? '-'
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-12 animate-fade-in">
        <div className="text-center space-y-4">
          <div className="animate-float">
            <Bookmark size={48} strokeWidth={1.2} className="text-muted-foreground mx-auto" />
          </div>
          <p className="font-mono text-muted-foreground text-sm uppercase tracking-widest">Loading your setups...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-8 max-w-5xl mx-auto animate-fade-in">
      <div className="flex items-end justify-between gap-4">
        <div className="space-y-1">
          <p className="kicker">Configurations</p>
          <h1 className="text-4xl md:text-5xl font-display text-foreground tracking-tight leading-[0.95]">
            Saved Setups
          </h1>
          <p className="text-muted-foreground text-sm">
            Quick-start brew configurations
          </p>
        </div>
        <Button
          onClick={openAddDialog}
        >
          + Add Setup
        </Button>
      </div>

      {savedSetups.length === 0 ? (
        <Card className="text-center py-16 space-y-4 animate-fade-in">
          <div className="text-muted-foreground animate-float">
            <svg width="100" height="90" viewBox="0 0 100 90" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" className="mx-auto">
              {/* Bookmark shape */}
              <path d="M30 10 h40 v65 l-20 -15 l-20 15 Z" className="fill-muted-foreground/10" />
              {/* Star inside */}
              <path d="M50 28 l4 8 9 1 -6.5 6.5 1.5 9 -8 -4 -8 4 1.5 -9 -6.5 -6.5 9 -1 Z" className="opacity-20 fill-accent/20" />
              {/* Small lightning bolt */}
              <path d="M55 52 l-3 8 5 -2 -3 8" className="opacity-30" strokeWidth="1.5" />
            </svg>
          </div>
          <p className="text-muted-foreground font-display text-lg">
            No saved setups yet
          </p>
          <p className="text-sm text-muted-foreground max-w-sm mx-auto leading-relaxed">
            Save your go-to equipment and parameters for one-tap brew sessions.
          </p>
          <Button
            onClick={openAddDialog}
            className="mt-2"
          >
            Create Your First Setup
          </Button>
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 stagger-children">
          {savedSetups.map((setup) => (
            <Card
              key={setup.id}
              accent="editorial"
              className="group space-y-4 overflow-hidden !p-0"
            >
              {/* Setup header — dark strip */}
              <div className="bg-muted px-6 py-4 relative overflow-hidden">
                <div className="relative flex items-center justify-between">
                  <h3 className="font-display text-foreground truncate text-xl tracking-tight">
                    {setup.name}
                  </h3>
                  {setup.isDefault && (
                    <span className="inline-flex items-center px-2 py-0.5 text-[10px] font-semibold bg-inverted text-inverted-foreground border-2 border-border uppercase tracking-widest">
                      Default
                    </span>
                  )}
                </div>
              </div>

              <div className="px-6 space-y-3">
                <div className="space-y-1.5 text-sm text-secondary-foreground">
                  <p>
                    <span className="text-muted-foreground text-xs">Grinder:</span>{' '}
                    {getEquipmentName(setup.grinderId)}
                  </p>
                  <p>
                    <span className="text-muted-foreground text-xs">Device:</span>{' '}
                    {getEquipmentName(setup.brewDeviceId)}
                  </p>
                  {(setup.defaultCoffeeDose || setup.defaultTotalWater || setup.defaultWaterTemp) && (
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {setup.defaultCoffeeDose && (
                        <span className="inline-flex items-center px-2 py-0.5 bg-muted text-secondary-foreground text-xs">
                          {setup.defaultCoffeeDose}g dose
                        </span>
                      )}
                      {setup.defaultTotalWater && (
                        <span className="inline-flex items-center px-2 py-0.5 bg-muted text-secondary-foreground text-xs">
                          {setup.defaultTotalWater}g water
                        </span>
                      )}
                      {setup.defaultWaterTemp && (
                        <span className="inline-flex items-center px-2 py-0.5 bg-muted text-secondary-foreground text-xs">
                          {setup.defaultWaterTemp}&deg;C
                        </span>
                      )}
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-2 pt-3 pb-6 border-t border-secondary">
                  <Button
                    size="sm"
                    onClick={() => router.push(`/brew/new?setup=${setup.id}`)}
                    className="font-display"
                  >
                    Brew with this
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => openEditDialog(setup)}
                  >
                    Edit
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => setDeleteConfirmId(setup.id)}
                    className="text-destructive hover:text-destructive hover:bg-destructive/10 ml-auto"
                  >
                    Delete
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Add / Edit Dialog */}
      <Dialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        title={editingId ? 'Edit Setup' : 'New Setup'}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Name"
            value={form.name}
            onChange={(e) => updateField('name', e.target.value)}
            placeholder="e.g. Morning V60"
            required
          />

          <Select
            label="Grinder"
            options={grinders}
            value={form.grinderId}
            onChange={(e) => updateField('grinderId', e.target.value)}
            placeholder="Select grinder"
            required
          />

          <Select
            label="Brew Device"
            options={brewDevices}
            value={form.brewDeviceId}
            onChange={(e) => updateField('brewDeviceId', e.target.value)}
            placeholder="Select brew device"
            required
          />

          <Select
            label="Filter"
            options={[{ value: '', label: 'None' }, ...filters]}
            value={form.filterId}
            onChange={(e) => updateField('filterId', e.target.value)}
          />

          <Select
            label="Water Type"
            options={[{ value: '', label: 'None' }, ...waterTypes]}
            value={form.waterTypeId}
            onChange={(e) => updateField('waterTypeId', e.target.value)}
          />

          <Select
            label="Brew Method"
            options={methodOptions}
            value={form.brewMethodId}
            onChange={(e) => updateField('brewMethodId', e.target.value)}
            placeholder="Select method"
            required
          />

          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Default Dose (g)"
              type="number"
              step="0.1"
              value={form.defaultCoffeeDose}
              onChange={(e) => updateField('defaultCoffeeDose', e.target.value)}
              placeholder="e.g. 15"
            />
            <Input
              label="Default Water (g)"
              type="number"
              step="1"
              value={form.defaultTotalWater}
              onChange={(e) => updateField('defaultTotalWater', e.target.value)}
              placeholder="e.g. 250"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Default Temp (&deg;C)"
              type="number"
              step="1"
              value={form.defaultWaterTemp}
              onChange={(e) => updateField('defaultWaterTemp', e.target.value)}
              placeholder="e.g. 96"
            />
            <Input
              label="Default Grind Setting"
              value={form.defaultGrindSetting}
              onChange={(e) => updateField('defaultGrindSetting', e.target.value)}
              placeholder="e.g. 24 clicks"
            />
          </div>

          <label className="flex items-center gap-2.5 cursor-pointer">
            <input
              type="checkbox"
              checked={form.isDefault}
              onChange={(e) => updateField('isDefault', e.target.checked)}
              className="border-input accent-primary"
            />
            <span className="text-sm text-secondary-foreground">Set as default setup</span>
          </label>

          <div className="flex justify-end gap-3 pt-3 border-t border-border">
            <Button
              type="button"
              variant="secondary"
              onClick={() => setDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={createSetup.isPending || updateSetup.isPending}
            >
              {createSetup.isPending || updateSetup.isPending
                ? 'Saving...'
                : editingId
                  ? 'Update'
                  : 'Create'}
            </Button>
          </div>
        </form>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={!!deleteConfirmId}
        onClose={() => setDeleteConfirmId(null)}
        title="Delete Setup"
      >
        <p className="text-muted-foreground mb-6 text-sm">
          Are you sure you want to delete this setup? This action cannot be undone.
        </p>
        <div className="flex justify-end gap-3 pt-2 border-t border-border">
          <Button
            variant="secondary"
            onClick={() => setDeleteConfirmId(null)}
          >
            Cancel
          </Button>
          <Button
            variant="ghost"
            onClick={() => deleteConfirmId && handleDelete(deleteConfirmId)}
            disabled={deleteSetup.isPending}
            className="bg-destructive hover:bg-destructive/80 text-primary-foreground"
          >
            {deleteSetup.isPending ? 'Deleting...' : 'Delete'}
          </Button>
        </div>
      </Dialog>
    </div>
  )
}
