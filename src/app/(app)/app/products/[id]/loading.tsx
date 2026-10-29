import { FormPageSkeleton } from "@/components/app/skeletons"

// Precio, y existencias con el aviso de poco stock (que lleva pista) en dos columnas.
export default function Loading() {
  return <FormPageSkeleton fields={[false, false, true]} />
}
