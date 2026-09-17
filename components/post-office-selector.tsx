"use client"

import { useState, useEffect } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import type { PostOffice } from "@/lib/nova-poshta"

interface PostOfficeSelectorProps {
  postOffices: PostOffice[]
  onSelect: (office: PostOffice) => void
  isLoading: boolean
}

export function PostOfficeSelector({ postOffices, onSelect, isLoading }: PostOfficeSelectorProps) {
  const [input, setInput] = useState("")
  const [filteredOffices, setFilteredOffices] = useState<PostOffice[]>([])

  useEffect(() => {
    if (input) {
      const filtered = postOffices.filter(
        (office) => office.Description.toLowerCase().includes(input.toLowerCase()) || office.Number.includes(input),
      )
      setFilteredOffices(filtered.slice(0, 5)) // Показуємо тільки перші 5 результатів
    } else {
      setFilteredOffices([])
    }
  }, [input, postOffices])

  return (
    <div className="space-y-2">
      <Input
        type="text"
        placeholder={isLoading ? "Завантаження відділень..." : "Введіть номер або назву відділення"}
        value={input}
        onChange={(e) => setInput(e.target.value)}
        disabled={isLoading}
      />
      {filteredOffices.length > 0 && (
        <ScrollArea className="h-[200px] w-full rounded-md border">
          <div className="p-4">
            {filteredOffices.map((office) => (
              <Button
                key={office.Ref}
                variant="ghost"
                className="w-full justify-start text-left mb-2"
                onClick={() => {
                  onSelect(office)
                  setInput("")
                }}
              >
                {office.Description}
              </Button>
            ))}
          </div>
        </ScrollArea>
      )}
    </div>
  )
}
