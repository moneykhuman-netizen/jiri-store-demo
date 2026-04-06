import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function removeUndefinedFields<T>(value: T): T {
  if (Array.isArray(value)) {
    return value
      .map((item) => removeUndefinedFields(item))
      .filter((item) => item !== undefined) as T
  }

  if (value && typeof value === "object") {
    return Object.entries(value).reduce((acc, [key, entryValue]) => {
      const cleanedValue = removeUndefinedFields(entryValue)

      if (cleanedValue !== undefined) {
        acc[key] = cleanedValue
      }

      return acc
    }, {} as Record<string, unknown>) as T
  }

  return value
}
