"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

interface DatePickerProps {
  value?: string | null
  onChange?: (date: Date | undefined) => void
  className?: string
}

export function DatePicker({ value, onChange, className }: DatePickerProps) {
  const [date, setDate] = React.useState<string>(
    value ? value.split("T")[0] : ""
  )

  return (
    <input
      type="date"
      value={date}
      onChange={(e) => {
        const val = e.target.value
        setDate(val)
        onChange?.(val ? new Date(val) : undefined)
      }}
      className={cn(
        "px-3 py-1.5 text-sm bg-background border border-border rounded-lg text-text-primary focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent",
        !date && "text-text-muted",
        className
      )}
    />
  )
}