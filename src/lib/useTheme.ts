"use client";
import { useEffect, useState } from "react";

export type Tema = "light" | "dark";

export function useTheme() {
  const [tema, setTema] = useState<Tema>("light");

  useEffect(() => {
    setTema(document.documentElement.classList.contains("dark") ? "dark" : "light");
  }, []);

  function alternar() {
    const siguiente: Tema = tema === "dark" ? "light" : "dark";
    document.documentElement.classList.toggle("dark", siguiente === "dark");
    try {
      localStorage.setItem("theme", siguiente);
    } catch {}
    setTema(siguiente);
  }

  return { tema, alternar };
}
