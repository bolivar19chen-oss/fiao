import type { Metadata } from "next"
import { NotFoundPage } from "@/components/ui/page-not-found"

export const metadata: Metadata = { title: "Page not found - FIA'O" }

export default function NotFound() {
  return <NotFoundPage />
}
