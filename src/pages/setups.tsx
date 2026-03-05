import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
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
  const navigate = useNavigate()
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
            <Bookmark size={48} strokeWidth={1.2} className="text-espresso-300 mx-auto" />
          </div>
          <p className="font-display italic text-espresso-400 text-lg">Loading your setups...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-8 max-w-5xl mx-auto animate-fade-in">
      <div className="flex items-end justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-4xl md:text-5xl font-display italic text-espresso-900 tracking-tight leading-[0.95]">
            Saved Setups
          </h1>
          <p className="text-espresso-500 text-sm">
            Quick-start brew configurations
          </p>
        </div>
        <Button
          onClick={openAddDialog}
          className="bg-sienna-600 hover:bg-sienna-700 text-white"
        >
          + Add Setup
        </Button>
      </div>

      {savedSetups.length === 0 ? (
        <div className="text-center py-16 paper-texture rounded-2xl border border-cream-200 bg-cream-50 space-y-4 animate-fade-in">
          <div className="text-espresso-200 animate-float">
            <svg width="100" height="90" viewBox="0 0 100 90" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" className="mx-auto">
              {/* Bookmark shape */}
              <path d="M30 10 h40 v65 l-20 -15 l-20 15 Z" className="fill-cream-300/30" />
              {/* Star inside */}
              <path d="M50 28 l4 8 9 1 -6.5 6.5 1.5 9 -8 -4 -8 4 1.5 -9 -6.5 -6.5 9 -1 Z" className="opacity-20 fill-sienna-400/20" />
              {/* Small lightning bolt */}
              <path d="M55 52 l-3 8 5 -2 -3 8" className="opacity-30" strokeWidth="1.5" />
            </svg>
          </div>
          <p className="text-espresso-400 font-display italic text-lg">
            No saved setups yet
          </p>
          <p className="text-sm text-espresso-400 max-w-sm mx-auto leading-relaxed">
            Save your go-to equipment and parameters for one-tap brew sessions.
          </p>
          <Button
            onClick={openAddDialog}
            className="bg-sienna-600 hover:bg-sienna-700 text-white mt-2"
          >
            Create Your First Setup
          </Button>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 stagger-children">
          {savedSetups.map((setup) => (
            <Card
              key={setup.id}
              className="group space-y-4 border border-cream-200 bg-white rounded-2xl overflow-hidden hover:shadow-lg transition-all duration-250 hover:-translate-y-0.5"
            >
              {/* Setup header — dark strip */}
              <div className="bg-gradient-to-r from-espresso-800 to-espresso-900 px-5 py-4 relative overflow-hidden">
                <div className="absolute -right-6 -top-6 w-24 h-24 rounded-full bg-sienna-500/10 blur-2xl" />
                <div className="relative flex items-center justify-between">
                  <h3 className="font-display text-cream-50 truncate text-xl tracking-tight">
                    {setup.name}
                  </h3>
                  {setup.isDefault && (
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-sienna-500/20 text-sienna-300 border border-sienna-500/20 uppercase tracking-widest">
                      Default
                    </span>
                  )}
                </div>
              </div>

              <div className="px-5 space-y-3">
                <div className="space-y-1.5 text-sm text-espresso-600">
                  <p>
                    <span className="text-espresso-400 text-xs">Grinder:</span>{' '}
                    {getEquipmentName(setup.grinderId)}
                  </p>
                  <p>
                    <span className="text-espresso-400 text-xs">Device:</span>{' '}
                    {getEquipmentName(setup.brewDeviceId)}
                  </p>
                  {(setup.defaultCoffeeDose || setup.defaultTotalWater || setup.defaultWaterTemp) && (
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {setup.defaultCoffeeDose && (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-md bg-cream-200 text-espresso-600 text-xs">
                          {setup.defaultCoffeeDose}g dose
                        </span>
                      )}
                      {setup.defaultTotalWater && (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-md bg-cream-200 text-espresso-600 text-xs">
                          {setup.defaultTotalWater}g water
                        </span>
                      )}
                      {setup.defaultWaterTemp && (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-md bg-cream-200 text-espresso-600 text-xs">
                          {setup.defaultWaterTemp}&deg;C
                        </span>
                      )}
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-2 pt-3 pb-5 border-t border-cream-200">
                  <Button
                    size="sm"
                    onClick={() => navigate(`/brew/new?setup=${setup.id}`)}
                    className="bg-sienna-600 hover:bg-sienna-700 text-white warm-glow font-display"
                  >
                    Brew with this
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => openEditDialog(setup)}
                    className="text-espresso-600 hover:text-espresso-800 hover:bg-cream-100"
                  >
                    Edit
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => setDeleteConfirmId(setup.id)}
                    className="text-rose-500 hover:text-rose-700 hover:bg-rose-100 ml-auto"
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
        <form onSubmit={handleSubmit} className="space-y-4 paper-texture">
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
              className="rounded border-cream-300 text-sienna-600 focus:ring-sienna-500 accent-sienna-600"
            />
            <span className="text-sm text-espresso-700">Set as default setup</span>
          </label>

          <div className="flex justify-end gap-3 pt-3 border-t border-cream-200">
            <Button
              type="button"
              variant="secondary"
              onClick={() => setDialogOpen(false)}
              className="text-espresso-600 hover:bg-cream-100"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={createSetup.isPending || updateSetup.isPending}
              className="bg-sienna-600 hover:bg-sienna-700 text-white"
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
        <p className="text-espresso-500 mb-6 text-sm">
          Are you sure you want to delete this setup? This action cannot be undone.
        </p>
        <div className="flex justify-end gap-3 pt-2 border-t border-cream-200">
          <Button
            variant="secondary"
            onClick={() => setDeleteConfirmId(null)}
            className="text-espresso-600 hover:bg-cream-100"
          >
            Cancel
          </Button>
          <Button
            variant="ghost"
            onClick={() => deleteConfirmId && handleDelete(deleteConfirmId)}
            disabled={deleteSetup.isPending}
            className="bg-rose-500 hover:bg-rose-600 text-white"
          >
            {deleteSetup.isPending ? 'Deleting...' : 'Delete'}
          </Button>
        </div>
      </Dialog>
    </div>
  )
}
