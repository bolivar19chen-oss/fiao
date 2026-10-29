import { FormPageSkeleton } from "@/components/app/skeletons"

export default function Loading() {
  return <FormPageSkeleton fields={[false, false, false, true]} />
}
