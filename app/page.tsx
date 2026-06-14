import { redirect } from "next/navigation";
import { routing } from "@/i18n/routing";

// The app is locale-prefixed (`/he`, `/en`). Send the bare root to the default.
export default function RootPage() {
  redirect(`/${routing.defaultLocale}`);
}
