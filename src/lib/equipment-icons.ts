import type { LucideIcon } from 'lucide-react'
import { Cog, Circle, Grip, Coffee, Triangle, Cylinder, Filter, Droplets } from 'lucide-react'
import type { EquipmentType } from '../types/database'

const GRINDER_ICONS: Record<string, LucideIcon> = {
  'Niche Zero': Circle,
  '1Zpresso': Grip,
}

const BREW_DEVICE_ICONS: Record<string, LucideIcon> = {
  'V60': Triangle,
  'AeroPress': Cylinder,
}

const DEFAULT_ICONS: Record<EquipmentType, LucideIcon> = {
  grinder: Cog,
  brew_device: Coffee,
  filter: Filter,
  water_type: Droplets,
}

const SPECIFIC_ICONS: Partial<Record<EquipmentType, Record<string, LucideIcon>>> = {
  grinder: GRINDER_ICONS,
  brew_device: BREW_DEVICE_ICONS,
}

export function getEquipmentIcon(type: EquipmentType, name: string): LucideIcon {
  const specificMap = SPECIFIC_ICONS[type]
  if (specificMap) {
    for (const [key, icon] of Object.entries(specificMap)) {
      if (name.toLowerCase().includes(key.toLowerCase())) {
        return icon
      }
    }
  }
  return DEFAULT_ICONS[type]
}
