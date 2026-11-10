import type { Metadata } from "next"

import { SkinDashboardPreview } from "@/components/skin-dashboard-preview"

export const metadata: Metadata = {
  title: "Skin Preview",
  description: "Compare nine narrative visual identities on a live dashboard.",
}

export default function SkinPreviewPage() {
  return <SkinDashboardPreview />
}
