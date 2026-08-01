"use client";

import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

interface LogoutButtonProps {
  /** "header": botón sobre fondo pino (barra superior). "menu": fila dentro del menú desplegable. */
  variant?: "header" | "menu";
}

export default function LogoutButton({ variant = "header" }: LogoutButtonProps) {
  const router = useRouter();

  async function handleLogout() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  }

  if (variant === "menu") {
    return (
      <button
        onClick={handleLogout}
        className="focus-ring block w-full rounded-lg px-3 py-2.5 text-left text-sm font-medium text-cream transition hover:bg-cream/10"
      >
        Cerrar sesión
      </button>
    );
  }

  return (
    <button
      onClick={handleLogout}
      className="focus-ring rounded border border-cream/40 px-3 py-1.5 text-sm font-medium text-cream transition hover:bg-cream/10"
    >
      Cerrar sesión
    </button>
  );
}
