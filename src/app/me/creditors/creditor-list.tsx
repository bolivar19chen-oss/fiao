"use client"

import { useState } from "react"
import { Search } from "lucide-react"

import { formatCents } from "@/lib/format"
import { t, type Lang } from "@/lib/i18n"

import type { Creditor } from "../data"
import { Empty, Panel, Row, Rows } from "../ui"

export function CreditorList({ creditors, lang }: { creditors: Creditor[]; lang: Lang }) {
  const [query, setQuery] = useState("")
  const needle = query.trim().toLowerCase()
  const found = needle ? creditors.filter((c) => c.name.toLowerCase().includes(needle)) : creditors

  return (
    <Panel>
      {creditors.length > 4 && (
        <div className="relative mb-6">
          <Search
            className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-marron/70"
            strokeWidth={1.5}
            aria-hidden
          />
          <input
            id="creditor-search"
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder={t(lang, "searchShops")}
            aria-label={t(lang, "searchShops")}
            className="h-10 w-full rounded-full border border-marron/10 bg-papel pl-10 pr-4 text-[15px] text-marron outline-none transition duration-200 ease-apple placeholder:text-marron/70 focus:border-rojo/40 focus:bg-fondo focus:ring-4 focus:ring-rojo/10"
          />
        </div>
      )}

      {found.length === 0 ? (
        <Empty>{needle ? t(lang, "noShopMatches") : t(lang, "notLinkedYet")}</Empty>
      ) : (
        <Rows>
          {found.map((shop) => (
            <Row key={shop.id}>
              <span className="min-w-0 flex-1">
                <span className="block truncate text-[15px] text-marron">{shop.name}</span>
                <span className="block text-[13px] text-marron/70">
                  {shop.score === null ? t(lang, "noScoreYet") : `${t(lang, "storeScore")} ${shop.score}`}
                </span>
              </span>
              {shop.overdue && (
                <span className="shrink-0 text-[13px] font-semibold text-estado-mora">{t(lang, "late")}</span>
              )}
              <span className="shrink-0 text-right text-[15px] tabular-nums text-marron">
                {formatCents(shop.balanceCents)}
              </span>
            </Row>
          ))}
        </Rows>
      )}
    </Panel>
  )
}
