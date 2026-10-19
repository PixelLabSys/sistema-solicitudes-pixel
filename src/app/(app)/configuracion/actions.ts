"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { getColaboradorActual } from "@/lib/data/colaborador-actual";

async function requireLiderTh() {
  const colaborador = await getColaboradorActual();
  if (!colaborador?.es_lider_th) {
    throw new Error("Solo el Líder de Talento Humano puede hacer esto.");
  }
  return colaborador;
}

export async function crearColaborador(formData: FormData) {
  await requireLiderTh();
  const supabase = await createClient();

  const nombre_completo = String(formData.get("nombre_completo") || "").trim();
  const correo = String(formData.get("correo") || "").trim().toLowerCase();
  const cc = String(formData.get("cc") || "").trim();

  if (!nombre_completo || !correo || !cc) {
    return { error: "Todos los campos son obligatorios." };
  }

  const { error } = await supabase.from("colaborador").insert({
    nombre_completo,
    correo,
    cc,
  });

  if (error) {
    return { error: error.message.includes("duplicate") ? "Ese correo ya está registrado." : error.message };
  }

  revalidatePath("/configuracion");
  return { error: null };
}

export async function importarColaboradores(
  filas: { nombre_completo: string; correo: string; cc: string }[]
) {
  await requireLiderTh();
  const supabase = await createClient();

  let creados = 0;
  const saltados: { correo: string; motivo: string }[] = [];

  for (const fila of filas) {
    const nombre_completo = fila.nombre_completo?.trim();
    const correo = fila.correo?.trim().toLowerCase();
    const cc = fila.cc?.trim();

    if (!nombre_completo || !correo || !cc) {
      saltados.push({ correo: correo || "(sin correo)", motivo: "Faltan datos obligatorios." });
      continue;
    }

    const { error } = await supabase.from("colaborador").insert({ nombre_completo, correo, cc });

    if (error) {
      saltados.push({
        correo,
        motivo: error.message.includes("duplicate") ? "Ese correo ya está registrado." : error.message,
      });
      continue;
    }

    creados++;
  }

  revalidatePath("/configuracion");
  return { creados, saltados };
}

export async function actualizarRoles(
  colaboradorId: string,
  cambios: { es_lider_area?: boolean; es_lider_th?: boolean; es_lider_general?: boolean }
) {
  await requireLiderTh();
  const supabase = await createClient();

  if (cambios.es_lider_area === false) {
    const { count } = await supabase
      .from("solicitud")
      .select("id", { count: "exact", head: true })
      .eq("lider_aprobador_id", colaboradorId)
      .eq("estado", "pendiente");

    if (count && count > 0) {
      return {
        error: `No se puede quitar el rol de líder de área: tiene ${count} solicitud(es) pendiente(s) asignada(s).`,
      };
    }
  }

  const { error } = await supabase
    .from("colaborador")
    .update(cambios)
    .eq("id", colaboradorId);

  if (error) {
    if (cambios.es_lider_general && error.message.includes("duplicate")) {
      return { error: "Ya hay un Líder General asignado. Quítale el rol primero antes de asignarlo a otra persona." };
    }
    return { error: error.message };
  }

  revalidatePath("/configuracion");
  return { error: null };
}

export async function alternarActivo(colaboradorId: string, activo: boolean) {
  await requireLiderTh();
  const supabase = await createClient();

  if (!activo) {
    const { count } = await supabase
      .from("solicitud")
      .select("id", { count: "exact", head: true })
      .eq("lider_aprobador_id", colaboradorId)
      .eq("estado", "pendiente");

    if (count && count > 0) {
      return {
        error: `No se puede desactivar: tiene ${count} solicitud(es) pendiente(s) asignada(s) como líder aprobador.`,
      };
    }
  }

  const { error } = await supabase
    .from("colaborador")
    .update({ activo })
    .eq("id", colaboradorId);

  if (error) return { error: error.message };

  revalidatePath("/configuracion");
  return { error: null };
}

const TIPOS_CONTRATO = ["indefinido", "fijo", "obra_labor", "aprendizaje"];

export async function guardarDatosLaborales(
  colaboradorId: string,
  datos: { genero: string; fecha_ingreso: string; tipo_contrato: string; salario: string }
) {
  await requireLiderTh();
  const supabase = await createClient();

  const salario = Number(datos.salario.replace(/[^\d]/g, ""));

  if (datos.genero !== "masculino" && datos.genero !== "femenino") {
    return { error: "Selecciona el género." };
  }
  if (!/^\d{4}-\d{2}-\d{2}$/.test(datos.fecha_ingreso) || datos.fecha_ingreso > new Date().toISOString().slice(0, 10)) {
    return { error: "La fecha de ingreso es obligatoria y no puede ser futura." };
  }
  if (!TIPOS_CONTRATO.includes(datos.tipo_contrato)) {
    return { error: "Selecciona el tipo de contrato." };
  }
  if (!Number.isFinite(salario) || salario <= 0) {
    return { error: "El salario debe ser un valor mayor a 0." };
  }

  const { error: errorContrato } = await supabase.from("colaborador_contrato").upsert({
    colaborador_id: colaboradorId,
    fecha_ingreso: datos.fecha_ingreso,
    tipo_contrato: datos.tipo_contrato,
    salario,
    actualizado_en: new Date().toISOString(),
  });
  if (errorContrato) return { error: errorContrato.message };

  const { error: errorGenero } = await supabase
    .from("colaborador")
    .update({ genero: datos.genero })
    .eq("id", colaboradorId);
  if (errorGenero) return { error: errorGenero.message };

  revalidatePath("/configuracion");
  return { error: null };
}

export async function guardarConfigCertificado(datos: {
  firmante_id: string;
  cargo: string;
  telefono: string;
  firma_path: string | null;
}) {
  await requireLiderTh();
  const supabase = await createClient();

  const cargo = datos.cargo.trim();
  const telefono = datos.telefono.trim();

  if (!datos.firmante_id) return { error: "Selecciona quién firma los certificados." };
  if (!cargo || !telefono) return { error: "El cargo y el teléfono son obligatorios." };

  const { data: firmante } = await supabase
    .from("colaborador")
    .select("id")
    .eq("id", datos.firmante_id)
    .eq("activo", true)
    .maybeSingle();
  if (!firmante) return { error: "La persona seleccionada no existe o está inactiva." };

  const { error: errorConfig } = await supabase.from("certificado_config").upsert({
    id: true,
    firmante_id: datos.firmante_id,
    firmante_cargo: cargo,
    firmante_telefono: telefono,
    actualizado_en: new Date().toISOString(),
  });
  if (errorConfig) return { error: errorConfig.message };

  if (datos.firma_path) {
    const { error: errorFirma } = await supabase.from("certificado_firma").upsert({
      id: true,
      firma_path: datos.firma_path,
      actualizado_en: new Date().toISOString(),
    });
    if (errorFirma) return { error: errorFirma.message };
  }

  revalidatePath("/configuracion");
  return { error: null };
}
