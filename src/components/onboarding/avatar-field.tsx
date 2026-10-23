"use client"

import dynamic from "next/dynamic"

// La subida habla con Storage, asi que arrastra supabase-js entero (~74 kB) al navegador.
// Importada en firme, ese peso lo pagaba toda la pantalla de ajustes y todo el alta,
// antes de que nadie toque la foto. A demanda llega mientras el usuario lee el formulario.
//
// El hueco mide lo mismo que la ficha real (h-10 de avatar + p-3 arriba y abajo + borde),
// para que nada salte cuando entre.
const AvatarUpload = dynamic(() => import("./avatar-upload").then((mod) => mod.AvatarUpload), {
  ssr: false,
  loading: () => <div className="h-[66px] rounded-lg border border-marron/10 bg-fondo/50" aria-hidden />,
})

export function AvatarField() {
  return <AvatarUpload />
}
