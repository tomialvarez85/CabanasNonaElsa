import Link from "next/link";

interface BackButtonProps {
  href: string;
  label?: string;
}

/**
 * Botón estándar de "volver" para el header de una pantalla secundaria.
 * Reusa el mismo estilo (.btn-secondary) que el resto de los botones
 * secundarios de la app, para no introducir un patrón visual nuevo.
 */
export default function BackButton({ href, label = "Volver" }: BackButtonProps) {
  return (
    <Link href={href} aria-label={label} className="btn-secondary shrink-0 px-3">
      <span aria-hidden="true">←</span>
      <span className="hidden sm:inline">{label}</span>
    </Link>
  );
}
