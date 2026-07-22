import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Creates a product slug from product name and ID.
 * Example: "Chanel No 5" + "664f1a2b3c4d5e6f" → "chanel-no-5-p.664f1a2b3c4d5e6f"
 */
export function getProductSlug(name: string, id: string): string {
  const slug = name
    .toLowerCase()
    .replace(/đ/g, "d")
    .replace(/[àáạảãâầấậẩẫăằắặẳẵ]/g, "a")
    .replace(/[èéẹẻẽêềếệểễ]/g, "e")
    .replace(/[ìíịỉĩ]/g, "i")
    .replace(/[òóọỏõôồốộổỗơờớợởỡ]/g, "o")
    .replace(/[ùúụủũưừứựửữ]/g, "u")
    .replace(/[ỳýỵỷỹ]/g, "y")
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-+|-+$/g, "")
  return `${slug}-p.${id}`
}

/**
 * Extracts the product ID from a product slug.
 * Example: "chanel-no-5-p.664f1a2b3c4d5e6f" → "664f1a2b3c4d5e6f"
 */
export function parseProductId(slug: string): string | null {
  const match = slug.match(/-p\.([a-fA-F0-9]+)$/)
  return match ? match[1] : null
}