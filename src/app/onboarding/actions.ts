"use server"

import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"

import { PROVINCES } from "@/data/provinces"
import { createClient } from "@/lib/supabase/server"

export type FormState = { error: string } | null

const field = (data: FormData, name: string) => String(data.get(name) ?? "").trim()

// 18 anos cumplidos. La base lo exige igual con un trigger: esto solo evita el viaje.
function isAdult(dob: string) {
  const birth = new Date(`${dob}T00:00:00`)
  if (Number.isNaN(birth.getTime())) return false
  const limit = new Date()
  limit.setFullYear(limit.getFullYear() - 18)
  return birth <= limit
}

function checkPerson(data: FormData) {
  const fullName = field(data, "full_name")
  const nationalId = field(data, "national_id")
  const phone = field(data, "phone")
  const dateOfBirth = field(data, "date_of_birth")

  if (fullName.length < 2 || fullName.length > 120) return "Enter your full name."
  // Formato sin verificar: docs/ONBOARDING.md seccion 5. No vacio y nada mas, porque un
  // validador inventado rechaza cedulas validas.
  // TODO: formato de cedula contra el Tribunal Electoral.
  if (!nationalId) return "Enter your national ID number."
  if (!phone) return "Enter your phone number."
  if (!dateOfBirth) return "Enter your date of birth."
  if (!isAdult(dateOfBirth)) return "You must be 18 or older to use FIA'O."
  return null
}

export async function completeCustomer(_prev: FormState, data: FormData): Promise<FormState> {
  const problem = checkPerson(data)
  if (problem) return { error: problem }

  const supabase = await createClient()
  const { data: auth } = await supabase.auth.getClaims()
  // El middleware ya exige sesion, pero sin esto user_id viajaba como undefined y el
  // insert fallaba con un mensaje que no dice nada.
  if (!auth) return { error: "Your session expired. Log in again." }

  // La provincia decide en que tiendas puede pedir fiado, asi que se valida aca y no
  // solo en el `check` de la base: el navegador puede mandar cualquier cosa.
  const province = field(data, "province")
  if (!PROVINCES.includes(province)) return { error: "Choose your province." }

  const { error } = await supabase.from("profiles").insert({
    user_id: auth.claims.sub,
    role: "customer",
    full_name: field(data, "full_name"),
    national_id: field(data, "national_id"),
    phone: field(data, "phone"),
    date_of_birth: field(data, "date_of_birth"),
    province,
  })

  if (error) {
    // El mensaje al usuario es generico a proposito, pero sin esto la causa real se
    // pierde y no hay forma de diagnosticar un alta fallida.
    console.error("completeCustomer insert failed:", error)
    return { error: "We couldn't save your details. Try again." }
  }
  // A /me y no a la pantalla del codigo: vincular una tienda no es parte del alta. El
  // cliente se registra desde su casa y pide el codigo cuando pasa por el mostrador.
  redirect("/me")
}

export async function completeBusiness(_prev: FormState, data: FormData): Promise<FormState> {
  const problem = checkPerson(data)
  if (problem) return { error: problem }

  const structure = field(data, "legal_structure")
  if (structure !== "natural" && structure !== "corporation") return { error: "Choose a legal structure." }
  if (!field(data, "trade_name")) return { error: "Enter your shop's name." }
  if (structure === "corporation" && !field(data, "legal_name")) return { error: "Enter the registered legal name." }

  // TODO: formato de RUC y digito verificador contra la DGI. Hoy solo no vacio.
  for (const [name, message] of [
    ["ruc", "Enter your RUC."],
    ["ruc_dv", "Enter the RUC check digit."],
    ["operating_notice", "Enter your operating notice number."],
    ["province_code", "Enter the province."],
    ["district_code", "Enter the district."],
    ["corregimiento_code", "Enter the corregimiento."],
    ["address", "Enter the shop's address."],
  ] as const) {
    if (!field(data, name)) return { error: message }
  }

  const supabase = await createClient()
  const { error } = await supabase.rpc("complete_business_onboarding", {
    p_full_name: field(data, "full_name"),
    p_national_id: field(data, "national_id"),
    p_phone: field(data, "phone"),
    p_date_of_birth: field(data, "date_of_birth"),
    p_trade_name: field(data, "trade_name"),
    p_legal_structure: structure,
    p_legal_name: field(data, "legal_name"),
    p_ruc: field(data, "ruc"),
    p_ruc_dv: field(data, "ruc_dv"),
    p_operating_notice: field(data, "operating_notice"),
    p_legal_rep_name: field(data, "legal_rep_name"),
    p_legal_rep_id: field(data, "legal_rep_id"),
    p_province_code: field(data, "province_code"),
    p_district_code: field(data, "district_code"),
    p_corregimiento_code: field(data, "corregimiento_code"),
    p_address: field(data, "address"),
  })

  if (error) return { error: "We couldn't set up your shop. Try again." }
  redirect("/app")
}

export async function redeemInvite(_prev: FormState, data: FormData): Promise<FormState> {
  const code = field(data, "code")
  if (!code) return { error: "Enter the code your shop gave you." }

  const supabase = await createClient()
  const { error } = await supabase.rpc("redeem_customer_invite", { p_code: code })

  // Vencido, ya usado o inexistente dan el mismo mensaje: no se revela si existio.
  if (error) return { error: "That code is not valid any more. Ask your shop for a new one." }
  // Hay un acreedor nuevo: sin esto el cache del router (staleTimes) devolveria la cartera
  // vieja y la tienda recien vinculada no aparece.
  revalidatePath("/me", "layout")
  redirect("/me")
}
