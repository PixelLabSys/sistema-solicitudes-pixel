"use client";

import { useState, useTransition } from "react";
import type { Colaborador, ColaboradorContrato } from "@/lib/types";
import { guardarDatosLaborales } from "./actions";

function FilaDatosLaborales({
  colaborador,
  contrato,
}: {
  colaborador: Colaborador;
  contrato?: ColaboradorContrato;
}) {
  const [rol, setRol] = useState(contrato?.rol ?? "");
  const [genero, setGenero] = useState(colaborador.genero ?? "");
  const [fechaIngreso, setFechaIngreso] = useState(contrato?.fecha_ingreso ?? "");
  const [tipoContrato, setTipoContrato] = useState(contrato?.tipo_contrato ?? "");
  const [salario, setSalario] = useState(contrato ? String(contrato.salario) : "");
  const [error, setError] = useState<string | null>(null);
  const [guardado, setGuardado] = useState(false);
  const [pending, startTransition] = useTransition();

  const completo = Boolean(colaborador.genero && contrato && contrato.rol);

  function guardar() {
    setError(null);
    setGuardado(false);
    startTransition(async () => {
      const res = await guardarDatosLaborales(colaborador.id, {
        rol,
        genero,
        fecha_ingreso: fechaIngreso,
        tipo_contrato: tipoContrato,
        salario,
      });
      if (res?.error) setError(res.error);
      else setGuardado(true);
    });
  }

  return (
    <tr>
      <td>{colaborador.nombre_completo}</td>
      <td>
        <input
          className="form-input"
          style={{ minWidth: 170 }}
          maxLength={80}
          placeholder="Ej. Arte Finalista"
          value={rol}
          onChange={(e) => setRol(e.target.value)}
        />
      </td>
      <td>
        <select className="form-select" style={{ minWidth: 110 }} value={genero} onChange={(e) => setGenero(e.target.value as typeof genero)}>
          <option value="">—</option>
          <option value="masculino">Masculino</option>
          <option value="femenino">Femenino</option>
        </select>
      </td>
      <td>
        <input type="date" className="form-input" style={{ minWidth: 150 }} value={fechaIngreso} onChange={(e) => setFechaIngreso(e.target.value)} />
      </td>
      <td>
        <select
          className="form-select"
          style={{ minWidth: 150 }}
          value={tipoContrato}
          onChange={(e) => setTipoContrato(e.target.value as typeof tipoContrato)}
        >
          <option value="">—</option>
          <option value="indefinido">Término indefinido</option>
          <option value="fijo">Término fijo</option>
          <option value="obra_labor">Obra o labor</option>
          <option value="aprendizaje">Aprendizaje</option>
        </select>
      </td>
      <td>
        <input
          type="text"
          inputMode="numeric"
          className="form-input"
          style={{ minWidth: 130 }}
          placeholder="2600000"
          value={salario}
          onChange={(e) => setSalario(e.target.value)}
        />
      </td>
      <td>
        <span className={`badge ${completo ? "badge-green" : "badge-yellow"}`}>
          {completo ? "Completo" : "Incompleto"}
        </span>
        {error && <div className="form-error" style={{ marginTop: 4 }}>{error}</div>}
      </td>
      <td>
        <button className="btn btn-primary btn-sm" disabled={pending} onClick={guardar}>
          {pending ? "Guardando..." : guardado ? "Guardado" : "Guardar"}
        </button>
      </td>
    </tr>
  );
}

export function DatosLaboralesSection({
  colaboradores,
  contratos,
}: {
  colaboradores: Colaborador[];
  contratos: ColaboradorContrato[];
}) {
  const mapa = new Map(contratos.map((c) => [c.colaborador_id, c]));

  return (
    <div className="table-wrap" style={{ marginBottom: 24 }}>
      <div className="table-header">
        <div>
          <p style={{ fontSize: 14, fontWeight: 500 }}>Datos laborales (para certificados)</p>
          <p style={{ fontSize: 12, color: "var(--muted)" }}>
            Rol (como aparece en la carta), género, fecha de ingreso, tipo de contrato y salario. Solo Talento Humano puede ver y editar el salario.
          </p>
        </div>
      </div>
      <table>
        <thead>
          <tr>
            <th>Nombre</th>
            <th>Rol (sale en la carta)</th>
            <th>Género</th>
            <th>Fecha de ingreso</th>
            <th>Tipo de contrato</th>
            <th>Salario mensual</th>
            <th>Estado</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {colaboradores
            .filter((c) => c.activo)
            .map((c) => (
              <FilaDatosLaborales key={c.id} colaborador={c} contrato={mapa.get(c.id)} />
            ))}
        </tbody>
      </table>
    </div>
  );
}
