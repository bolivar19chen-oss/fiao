import { FormPageSkeleton } from "@/components/app/skeletons"

// Nombre, y telefono y notas con su pista debajo.
export default function Loading() {
  return <FormPageSkeleton fields={[false, true, true]} />
}
