"use client";

import { useEffect, useState } from "react";
import { LAST_CABANA_STORAGE_KEY } from "@/lib/lastCabana";
import BackButton from "@/components/ui/BackButton";

export default function VolverAlCalendarioButton() {
  const [href, setHref] = useState("/");

  useEffect(() => {
    const lastCabanaId = window.localStorage.getItem(LAST_CABANA_STORAGE_KEY);
    if (lastCabanaId) setHref(`/?cabana=${lastCabanaId}`);
  }, []);

  return <BackButton href={href} label="Volver" />;
}
