"use client"

import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts"
import { collectionTrend } from "@/data/panama"
import { formatCents } from "@/lib/format"

const axisTick = { fill: "rgb(72 45 31 / 0.55)", fontSize: 12 }
const compactUsd = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", notation: "compact" })

export function CollectionChart() {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <AreaChart data={collectionTrend} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
        <defs>
          <linearGradient id="fill-collected" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#b91c1c" stopOpacity={0.28} />
            <stop offset="100%" stopColor="#b91c1c" stopOpacity={0} />
          </linearGradient>
          <linearGradient id="fill-outstanding" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#ffbf32" stopOpacity={0.35} />
            <stop offset="100%" stopColor="#ffbf32" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid vertical={false} stroke="rgb(72 45 31 / 0.08)" />
        <XAxis dataKey="month" tickLine={false} axisLine={false} tick={axisTick} />
        <YAxis
          tickLine={false}
          axisLine={false}
          tick={axisTick}
          width={52}
          tickFormatter={(cents: number) => compactUsd.format(cents / 100)}
        />
        <Tooltip
          formatter={(value, name) => [formatCents(Number(value)), name === "collectedCents" ? "Collected" : "Outstanding"]}
          contentStyle={{
            borderRadius: 14,
            border: "1px solid rgb(72 45 31 / 0.1)",
            boxShadow: "0 12px 32px -12px rgb(72 45 31 / 0.25)",
            color: "#482d1f",
          }}
        />
        <Area type="monotone" dataKey="outstandingCents" stroke="#e0a21c" strokeWidth={2} fill="url(#fill-outstanding)" />
        <Area type="monotone" dataKey="collectedCents" stroke="#b91c1c" strokeWidth={2} fill="url(#fill-collected)" />
      </AreaChart>
    </ResponsiveContainer>
  )
}
