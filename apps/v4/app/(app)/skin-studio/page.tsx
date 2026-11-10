import type { Metadata } from "next"

import { SkinStudio } from "@/components/skin-studio"

export const metadata: Metadata = {
  title: "Skin Studio",
  description: "Build, preview, and export a complete shadcn/ui skin.",
}

export default function SkinStudioPage() {
  return (
    <div className="container-wrapper flex-1">
      <div className="container py-8 md:py-12">
        <SkinStudio />
      </div>
    </div>
  )
}
