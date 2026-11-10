// ===========================================================
// Tipos TypeScript del Sistema de Gestión del Dojo (v2.0)
// ===========================================================

export interface Academia {
  id: string;
  nombre: string;
  rut_titular: string;
  direccion?: string;
  telefono?: string;
  email?: string;
  logo_url?: string;
  created_at: string;
}

export interface Usuario {
  id: string;
  email: string;
  nombre_completo: string;
  rol: 'ADMIN_GENERAL' | 'SENSEI' | 'INSTRUCTOR';
  telefono?: string;
  activo: boolean;
  academias: Academia[];
}

export interface Seccion {
  id: string;
  academia_id: string;
  nombre: string;
  edad_min: number;
  edad_max: number;
  descripcion?: string;
}

export interface GradoCinturon {
  id: number;
  nombre: string;
  color_hex: string;
  orden: number;
  es_infantil: boolean;
}

export interface Alumno {
  id: string;
  academia_id?: string;
  seccion_id?: string;
  cinturon_id: number;
  nombres: string;
  apellidos: string;
  rut?: string;
  fecha_nacimiento?: string;
  genero?: 'M' | 'F';
  peso_actual_kg?: number;
  fecha_ultimo_pesaje?: string;
  direccion?: string;
  lugar_estudio_trabajo?: string;
  talla_polera?: string;
  talla_pantalon?: string;
  foto_url?: string;
  dia_pago_mensual: number;
  estado: 'PENDIENTE_CONFIRMACION' | 'ACTIVO' | 'INACTIVO' | 'RETIRADO';
  es_competidor: boolean;
  categoria_kumite?: string;
  categoria_kata?: string;
  categoria_kumite_manual?: string;
  categoria_kata_manual?: string;
  fecha_ingreso: string;
  escuela_origen?: string;

  seccion?: Seccion;
  cinturon?: GradoCinturon;
  apoderados?: Apoderado[];
}

export interface Apoderado {
  id: string;
  alumno_id: string;
  nombre_completo: string;
  rut: string;
  edad?: number;
  telefono_whatsapp: string;
  email?: string;
  parentesco: 'Padre' | 'Madre' | 'Tutor' | 'Titular' | 'Otro';
}

export interface HistorialPesaje {
  id: string;
  alumno_id: string;
  peso_kg: number;
  fecha_pesaje: string;
  notas?: string;
}

export interface CategoriaKarate {
  id: string;
  modalidad: 'KATA' | 'KUMITE' | 'PARA_KARATE';
  division: string;
  genero: 'M' | 'F' | 'X';
  edad_min: number;
  edad_max: number;
  peso_min_kg?: number;
  peso_max_kg?: number;
  nombre_etiqueta: string;
}

export type DiaSemana = 'LUNES' | 'MARTES' | 'MIERCOLES' | 'JUEVES' | 'VIERNES' | 'SABADO' | 'DOMINGO';

export interface HorarioClase {
  id: string;
  academia_id: string;
  nombre_clase: string;
  dias_semana: DiaSemana[];
  hora_inicio: string;
  hora_fin: string;
  tipo_audiencia: 'SOLO_NINOS' | 'SOLO_ADULTOS' | 'MIXTO';
  cupo_maximo?: number;
  activo: boolean;
  seccion_id?: string;
}

export interface RegistroAsistencia {
  id: string;
  horario_clase_id: string;
  alumno_id: string;
  fecha_clase: string;
  presente: boolean;
  notas?: string;
}

export type EstadoPago = 'PAGADO' | 'PENDIENTE' | 'ATRASADO' | 'CONDONADO';

export interface Mensualidad {
  id: string;
  alumno_id: string;
  anio: number;
  mes: number;
  monto: number;
  estado: EstadoPago;
  fecha_pago?: string;
  metodo_pago?: 'TRANSFERENCIA' | 'EFECTIVO' | 'OTRO';
  notas?: string;
}

// --- Módulo Eventos (Torneos, Seminarios, Eventos Especiales) ---
export type TipoEvento = 'TORNEO' | 'SEMINARIO' | 'EVENTO_ESPECIAL';

export interface Evento {
  id: string;
  academia_id: string;
  nombre: string;
  tipo: TipoEvento;
  fecha_evento: string;
  hora_evento?: string;
  lugar?: string;
  costo_inscripcion: number;
  estado: 'ABIERTO' | 'CERRADO' | 'FINALIZADO';
  descripcion?: string;
  alumnos_inscritos_ids: string[];
}

// --- Módulo Exámenes de Grado ---
export type ResultadoExamen = 'PROMOVIDO' | 'DENEGADO' | 'PROLONGADO' | 'PENDIENTE';

export interface PostulacionExamen {
  id: string;
  examen_id: string;
  alumno_id: string;
  grado_actual_id: number;
  grado_postulado_id: number;
  estado_mensualidad: 'AL_DIA' | 'MOROSO';
  estado_pago_examen: 'PAGADO' | 'PENDIENTE';
  resultado: ResultadoExamen;
  observaciones?: string;
}

export interface ExamenGrado {
  id: string;
  academia_id: string;
  nombre: string;
  fecha_examen: string;
  costo_derecho_examen: number;
  estado: 'CONVOCATORIA' | 'EN_EVALUACION' | 'FINALIZADO';
  descripcion?: string;
}

export interface Comprobante {
  id: string;
  academia_id: string;
  alumno_id: string;
  tipo_origen: 'MENSUALIDAD' | 'TORNEO' | 'EXAMEN';
  referencia_pago_id?: string;
  folio_interno?: string;
  folio_sii?: string;
  monto_total: number;
  retencion_sii?: number;
  glosa_servicio: string;
  url_pdf?: string;
  enviado_whatsapp: boolean;
  fecha_emision: string;
}
