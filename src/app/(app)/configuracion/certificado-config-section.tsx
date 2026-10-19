"use client";

import { useRef, useState, useTransition } from "react";
import type { CertificadoConfig, Colaborador } from "@/lib/types";
import { createClient } from "@/lib/supabase/client";
import { guardarConfigCertificado } from "./actions";

export function CertificadoConfigSection({
  colaboradores,
  config,
  tieneFirma,
}: {
  colaboradores: Colaborador[];
  config: CertificadoConfig | null;
  tieneFirma: boolean;
}) {
  const [firmanteId, setFirmanteId] = useState(config?.firmante_id ?? "");
  const [cargo, setCargo] = useState(config?.firmante_cargo ?? "");
  const [telefono, setTelefono] = useState(config?.firmante_telefono ?? "");
  const [firmaCargada, setFirmaCargada] = useState(tieneFirma);
  const [error, setError] = useState<string | null>(null);
  const [guardado, setGuardado] = useState(false);
  const [pending, startTransition] = useTransition();
  const firmaRef = useRef<HTMLInputElement>(null);

  async function subirFirma(): Promise<{ ok: true; ruta: string | null } | { ok: false }> {
    const archivo = firmaRef.current?.files?.[0];
    if (!archivo || archivo.size === 0) return { ok: true, ruta: null };

    if (!["image/jpeg", "image/png"].includes(archivo.type)) {
      setError("La firma debe ser un archivo JPG o PNG.");
      return { ok: false };
    }
    if (archivo.size > 2 * 1024 * 1024) {
      setError("La firma no puede pesar más de 2MB.");
      return { ok: false };
    }

    const supabase = createClient();
    const extension = archivo.type === "image/png" ? "png" : "jpg";
    const ruta = `certificado-${crypto.randomUUID()}.${extension}`;
    const { error: errorUpload } = await supabase.storage
      .from("firmas")
      .upload(ruta, archivo, { contentType: archivo.type });

    if (errorUpload) {
      setError("No se pudo subir la firma: " + errorUpload.message);
      return { ok: false };
    }
    return { ok: true, ruta };
  }

  function guardar() {
    setError(null);
    setGuardado(false);
    startTransition(async () => {
      const firma = await subirFirma();
      if (!firma.ok) return;

      if (!firma.ruta && !firmaCargada) {
        setError("Sube la imagen de la firma.");
        return;
      }

      const res = await guardarConfigCertificado({
        firmante_id: firmanteId,
        cargo,
        telefono,
        firma_path: firma.ruta,
      });
      if (res?.error) {
        setError(res.error);
        return;
      }
      if (firma.ruta) {
        setFirmaCargada(true);
        if (firmaRef.current) firmaRef.current.value = "";
      }
      setGuardado(true);
    });
  }

  return (
    <div className="card" style={{ marginBottom: 24 }}>
      <p style={{ fontSize: 14, fontWeight: 500, marginBottom: 4 }}>Certificado laboral: quién firma</p>
      <p style={{ fontSize: 12, color: "var(--muted)", marginBottom: 14 }}>
        La persona elegida aprueba las solicitudes de certificado y su firma aparece en el documento. Si ella misma
        pide un certificado, lo aprueba el Líder General.
      </p>

      {error && (
        <div className="alert alert-error" style={{ marginBottom: 14 }}>
          {error}
        </div>
      )}

      <div className="form-grid" style={{ marginBottom: 14 }}>
        <div className="form-group">
          <label className="form-label">Firmante</label>
          <select className="form-select" value={firmanteId} onChange={(e) => setFirmanteId(e.target.value)}>
            <option value="">Selecciona...</option>
            {colaboradores
              .filter((c) => c.activo)
              .map((c) => (
                <option key={c.id} value={c.id}>
                  {c.nombre_completo}
                </option>
              ))}
          </select>
        </div>
        <div className="form-group">
          <label className="form-label">Cargo que aparece en la firma</label>
          <input className="form-input" value={cargo} onChange={(e) => setCargo(e.target.value)} />
        </div>
        <div className="form-group">
          <label className="form-label">Teléfono</label>
          <input className="form-input" value={telefono} onChange={(e) => setTelefono(e.target.value)} />
        </div>
        <div className="form-group">
          <label className="form-label">Imagen de la firma (JPG o PNG)</label>
          <input ref={firmaRef} type="file" accept="image/jpeg,image/png" className="form-input" />
          <p className="form-hint">
            {firmaCargada ? "Ya hay una firma cargada; sube otra solo si quieres reemplazarla." : "Aún no hay firma cargada."}
          </p>
        </div>
      </div>

      <button className="btn btn-primary" disabled={pending} onClick={guardar}>
        {pending ? "Guardando..." : guardado ? "Guardado" : "Guardar"}
      </button>
    </div>
  );
}
