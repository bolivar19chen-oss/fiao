"use client"

import { Bar, BarChart, Cell, LabelList, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts"
import { categories } from "@/data/panama"

const COLORS = ["#b91c1c", "#d64545", "#e0a21c", "#ffbf32", "#8a6a5a"]

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
          tick={{ fill: "rgb(72 45 31 / 0.7)", fontSize: 13 }}
        />
        <Tooltip
          cursor={{ fill: "rgb(72 45 31 / 0.04)" }}
          formatter={(value) => [`${value} stores`, "Registered"]}
          contentStyle={{
            borderRadius: 14,
            border: "1px solid rgb(72 45 31 / 0.1)",
            boxShadow: "0 12px 32px -12px rgb(72 45 31 / 0.25)",
            color: "#482d1f",
          }}
        />
        <Bar dataKey="stores" radius={[0, 8, 8, 0]} barSize={22}>
          {categories.map((c, i) => (
            <Cell key={c.label} fill={COLORS[i % COLORS.length]} />
          ))}
          <LabelList dataKey="stores" position="right" fill="#482d1f" fontSize={13} fontWeight={600} />
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  )
}
