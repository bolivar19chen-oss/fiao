"use client"

import { Bar, BarChart, Cell, LabelList, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts"
import { BRAND, SERIE } from "@/lib/colors"
import { categories } from "@/data/panama"

const COLORS = [...SERIE, BRAND.marron.claro]

export function CategoryChart() {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart data={categories} layout="vertical" margin={{ top: 4, right: 40, left: 0, bottom: 4 }}>
        <XAxis type="number" hide />
        <YAxis
          type="category"
          dataKey="label"
          width={112}
          tickLine={false}
          axisLine={false}
          tick={{ fill: "rgb(var(--marron) / 0.7)", fontSize: 13 }}
        />
        <Tooltip
          cursor={{ fill: "rgb(var(--marron) / 0.04)" }}
          formatter={(value) => [`${value} stores`, "Registered"]}
          contentStyle={{
            borderRadius: 14,
            border: "1px solid rgb(var(--marron) / 0.1)",
            background: "rgb(var(--fondo))",
            boxShadow: "0 12px 32px -12px rgb(72 45 31 / 0.25)",
            color: "rgb(var(--marron))",
          }}
        />
        <Bar dataKey="stores" radius={[0, 8, 8, 0]} barSize={22}>
          {categories.map((c, i) => (
            <Cell key={c.label} fill={COLORS[i % COLORS.length]} />
          ))}
          <LabelList dataKey="stores" position="right" fill="rgb(var(--marron))" fontSize={13} fontWeight={600} />
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  )
}
