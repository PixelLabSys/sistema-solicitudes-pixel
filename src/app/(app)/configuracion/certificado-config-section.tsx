"use client";

import { useRef, useState, useTransition } from "react";
import type { CertificadoConfig, CertificadoFirmante, Colaborador } from "@/lib/types";
import { createClient } from "@/lib/supabase/client";
import { guardarFirmante, guardarFirmantePrincipal } from "./actions";

function TarjetaFirmante({
  colaborador,
  etiqueta,
  firmante,
}: {
  colaborador: Colaborador;
  etiqueta: string;
  firmante?: CertificadoFirmante;
}) {
  const [cargo, setCargo] = useState(firmante?.cargo ?? "");
  const [telefono, setTelefono] = useState(firmante?.telefono ?? "");
  const [firmaCargada, setFirmaCargada] = useState(Boolean(firmante));
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

      const res = await guardarFirmante({
        colaborador_id: colaborador.id,
        cargo,
        telefono,
        firma_path: firma.ruta,
      });
      if (res?.error) {
        setError(res.error);
        return;
      }
      setFirmaCargada(true);
      if (firmaRef.current) firmaRef.current.value = "";
      setGuardado(true);
    });
  }

  return (
    <div style={{ border: "1px solid var(--border)", borderRadius: 10, padding: 16, marginBottom: 12 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
        <p style={{ fontSize: 13, fontWeight: 600 }}>{colaborador.nombre_completo}</p>
        <span className="badge badge-blue">{etiqueta}</span>
        <span className={`badge ${firmaCargada ? "badge-green" : "badge-yellow"}`}>
          {firmaCargada ? "Firma configurada" : "Falta configurar"}
        </span>
      </div>

      {error && (
        <div className="alert alert-error" style={{ marginBottom: 12 }}>
          {error}
        </div>
      )}

      <div className="form-grid" style={{ marginBottom: 12 }}>
        <div className="form-group">
          <label className="form-label">Cargo que aparece en la firma</label>
          <input className="form-input" value={cargo} onChange={(e) => setCargo(e.target.value)} />
        </div>
        <div className="form-group">
          <label className="form-label">Teléfono</label>
          <input className="form-input" value={telefono} onChange={(e) => setTelefono(e.target.value)} />
        </div>
        <div className="form-group form-full">
          <label className="form-label">Imagen de la firma (JPG o PNG)</label>
          <input ref={firmaRef} type="file" accept="image/jpeg,image/png" className="form-input" />
          <p className="form-hint">
            {firmaCargada ? "Ya hay una firma cargada; sube otra solo si quieres reemplazarla." : "Aún no hay firma cargada."}
          </p>
        </div>
      </div>

      <button className="btn btn-primary btn-sm" disabled={pending} onClick={guardar}>
        {pending ? "Guardando..." : guardado ? "Guardado" : "Guardar"}
      </button>
    </div>
  );
}

export function CertificadoConfigSection({
  colaboradores,
  config,
  firmantes,
}: {
  colaboradores: Colaborador[];
  config: CertificadoConfig | null;
  firmantes: CertificadoFirmante[];
}) {
  const [principalId, setPrincipalId] = useState(config?.firmante_id ?? "");
  const [error, setError] = useState<string | null>(null);
  const [guardado, setGuardado] = useState(false);
  const [pending, startTransition] = useTransition();

  const activos = colaboradores.filter((c) => c.activo);
  const liderGeneral = activos.find((c) => c.es_lider_general);
  const principal = activos.find((c) => c.id === (config?.firmante_id ?? ""));
  const mapa = new Map(firmantes.map((f) => [f.colaborador_id, f]));

  function guardarPrincipal() {
    setError(null);
    setGuardado(false);
    startTransition(async () => {
      const res = await guardarFirmantePrincipal(principalId);
      if (res?.error) setError(res.error);
      else setGuardado(true);
    });
  }

  return (
    <div className="card" style={{ marginBottom: 24 }}>
      <p style={{ fontSize: 14, fontWeight: 500, marginBottom: 4 }}>Certificado laboral: quién aprueba y firma</p>
      <p style={{ fontSize: 12, color: "var(--muted)", marginBottom: 14 }}>
        En cada certificado firma quien lo aprueba. Lo aprueba la persona principal; si ella misma pide uno, lo aprueba y
        lo firma el Líder General.
      </p>

      {error && (
        <div className="alert alert-error" style={{ marginBottom: 14 }}>
          {error}
        </div>
      )}

      <div style={{ display: "flex", gap: 8, alignItems: "flex-end", flexWrap: "wrap", marginBottom: 16 }}>
        <div className="form-group" style={{ minWidth: 260 }}>
          <label className="form-label">Aprobador y firmante principal</label>
          <select className="form-select" value={principalId} onChange={(e) => setPrincipalId(e.target.value)}>
            <option value="">Selecciona...</option>
            {activos.map((c) => (
              <option key={c.id} value={c.id}>
                {c.nombre_completo}
              </option>
            ))}
          </select>
        </div>
        <button className="btn btn-primary btn-sm" disabled={pending} onClick={guardarPrincipal}>
          {pending ? "Guardando..." : guardado ? "Guardado" : "Guardar"}
        </button>
      </div>

      {principal && <TarjetaFirmante key={principal.id} colaborador={principal} etiqueta="Principal" firmante={mapa.get(principal.id)} />}

      {liderGeneral && liderGeneral.id !== principal?.id ? (
        <TarjetaFirmante
          key={liderGeneral.id}
          colaborador={liderGeneral}
          etiqueta="Líder General (respaldo)"
          firmante={mapa.get(liderGeneral.id)}
        />
      ) : (
        !liderGeneral && (
          <div className="alert alert-warning">
            No hay un Líder General activo. Sin él, la persona principal no podría pedir su propio certificado.
          </div>
        )
      )}
    </div>
  );
}
