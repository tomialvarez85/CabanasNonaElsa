import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import LogoutButton from "@/components/LogoutButton";

export default async function Header() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <header className="bg-pine text-cream">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-2 px-4 py-4 sm:px-6">
        <h1 className="text-lg font-semibold tracking-wide sm:text-xl">Gestión de Cabañas</h1>
        {user && (
          <div className="flex items-center gap-4">
            <Link
              href="/resumen-general"
              className="text-sm font-medium text-cream/90 transition hover:text-cream hover:underline"
            >
              Resumen general
            </Link>
            <LogoutButton />
          </div>
        )}
      </div>
    </header>
  );
}
