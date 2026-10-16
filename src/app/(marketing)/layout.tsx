import { CookieNotice } from "@/components/layout/cookie-notice"
import { SiteFooter } from "@/components/layout/site-footer"
import { SiteHeader } from "@/components/layout/site-header"

// Sitio publico. La aplicacion autenticada, en (app), tiene su propio shell.
export default function MarketingLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <SiteHeader />
      {children}
      <SiteFooter />
      <CookieNotice />
    </>
  )
}
