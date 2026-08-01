import { createClient } from "@/lib/supabase/server";
import HeaderMenu from "@/components/HeaderMenu";

export default async function Header() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <header className="bg-pine text-cream">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-2 px-4 py-4 sm:px-6">
        <h1 className="text-lg font-semibold tracking-wide sm:text-xl">Gestión de Cabañas</h1>
        {user && <HeaderMenu />}
      </div>
    </header>
  );
}
