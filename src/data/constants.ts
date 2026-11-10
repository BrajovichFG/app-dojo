import { Academia, GradoCinturon, HorarioClase, Seccion, Usuario, Evento, ExamenGrado } from '../types';
import categoriesRaw from './categoriesFromExcel.json';

export const CATEGORIAS_KUMITE_EXCEL: string[] = categoriesRaw.kumite_individual;
export const CATEGORIAS_KATA_EXCEL: string[] = [
  ...categoriesRaw.kata_individual,
  ...categoriesRaw.kata_equipo,
];
export const CATEGORIAS_PARA_KARATE_EXCEL: string[] = categoriesRaw.para_karate;

export const CENTRAL_ACADEMIA_ID = '4fddd818-7ea1-489c-9790-8e55fd755d34';

export function isCentralAcademia(id?: string | null): boolean {
  if (!id) return false;
  return id === 'acad-1' || id === CENTRAL_ACADEMIA_ID;
}

export function matchAcademia(studentAcademiaId?: string | null, targetAcademiaId?: string | null): boolean {
  if (!studentAcademiaId || !targetAcademiaId) return false;
  if (isCentralAcademia(targetAcademiaId)) {
    return isCentralAcademia(studentAcademiaId);
  }
  return studentAcademiaId === targetAcademiaId;
}

export const ACADEMIAS_DISPONIBLES: Academia[] = [
  {
    id: CENTRAL_ACADEMIA_ID,
    nombre: 'Dojo Shito Ryu Kyokan Genbukai Rancagua',
    rut_titular: '14.285.923-1',
    direccion: 'Rancagua, Región de O\'Higgins, Chile',
    telefono: '+56 9 8452 1190',
    email: 'contacto@shitoryurancagua.cl',
    created_at: '2024-01-01',
  },
  {
    id: 'acad-machali',
    nombre: 'Sede Machalí Cordillera',
    rut_titular: '14.285.923-1',
    direccion: 'Av. San Juan #1050, Machalí',
    telefono: '+56 9 8452 1190',
    email: 'machali@shitoryurancagua.cl',
    created_at: '2024-02-01',
  },
  {
    id: 'acad-requinoa',
    nombre: 'Sede Requínoa El Abra',
    rut_titular: '14.285.923-1',
    direccion: 'Camino El Abra s/n, Requínoa',
    telefono: '+56 9 8452 1190',
    email: 'requinoa@shitoryurancagua.cl',
    created_at: '2024-03-01',
  },
];

export const USUARIOS_DISPONIBLES: Usuario[] = [
  {
    id: 'usr-1',
    email: 'milton.echeverria@karate.cl',
    nombre_completo: 'Sensei Milton Echeverría',
    rol: 'ADMIN_GENERAL', // Dueño y Administrador Total
    telefono: '+56 9 8452 1190',
    activo: true,
    academias: [ACADEMIAS_DISPONIBLES[0], ACADEMIAS_DISPONIBLES[1], ACADEMIAS_DISPONIBLES[2]],
  },
];

export const GRADOS_CINTURON: GradoCinturon[] = [
  { id: 1, nombre: 'Blanco (10° Kyu - Jukyu)', color_hex: '#FFFFFF', orden: 1, es_infantil: false },
  { id: 2, nombre: 'Blanco Punta Amarilla (9° Kyu - Kukyu)', color_hex: '#FFFACD', orden: 2, es_infantil: true },
  { id: 3, nombre: 'Amarillo (8° Kyu - Hachikyu)', color_hex: '#FFD700', orden: 3, es_infantil: false },
  { id: 4, nombre: 'Amarillo Punta Naranja (8° Kyu Avanzado)', color_hex: '#FFB347', orden: 4, es_infantil: true },
  { id: 5, nombre: 'Naranja (7° Kyu - Nanakyu)', color_hex: '#FF8C00', orden: 5, es_infantil: false },
  { id: 6, nombre: 'Naranja Punta Verde (7° Kyu Avanzado)', color_hex: '#7FBF7F', orden: 6, es_infantil: true },
  { id: 7, nombre: 'Verde (6° Kyu - Rokukyu)', color_hex: '#228B22', orden: 7, es_infantil: false },
  { id: 8, nombre: 'Verde Punta Azul (6° Kyu Avanzado)', color_hex: '#4682B4', orden: 8, es_infantil: true },
  { id: 9, nombre: 'Azul (5° Kyu - Gokyu)', color_hex: '#0000CD', orden: 9, es_infantil: false },
  { id: 10, nombre: 'Rojo / Púrpura (4° Kyu - Yonkyu)', color_hex: '#C026D3', orden: 10, es_infantil: false },
  { id: 11, nombre: 'Café (3° Kyu - Sankyu)', color_hex: '#8B4513', orden: 11, es_infantil: false },
  { id: 12, nombre: 'Café (2° Kyu - Nikyu)', color_hex: '#6B3410', orden: 12, es_infantil: false },
  { id: 13, nombre: 'Café (1° Kyu - Ikkyu)', color_hex: '#5C2D0E', orden: 13, es_infantil: false },
  { id: 14, nombre: 'Negro 1° Dan (Shodan)', color_hex: '#0F172A', orden: 14, es_infantil: false },
  { id: 15, nombre: 'Negro 2° Dan (Nidan)', color_hex: '#0F172A', orden: 15, es_infantil: false },
];

export const SECCIONES_INICIALES: Seccion[] = [
  { id: 'sec-1', academia_id: 'acad-1', nombre: 'Pequeños 4-6 Años (Grupo I)', edad_min: 4, edad_max: 6, descripcion: 'Iniciación al Karate para preescolares' },
  { id: 'sec-2', academia_id: 'acad-1', nombre: 'Pequeños 4-6 Años (Grupo II)', edad_min: 4, edad_max: 6, descripcion: 'Grupo de tarde para preescolares' },
  { id: 'sec-3', academia_id: 'acad-1', nombre: 'Adolescentes (7 a 15 años)', edad_min: 7, edad_max: 15, descripcion: 'Entrenamiento formativo y competitivo escolar' },
  { id: 'sec-4', academia_id: 'acad-1', nombre: 'Jóvenes y Adultos (16+ años)', edad_min: 16, edad_max: 99, descripcion: 'Karate tradicional, defensa personal y alto rendimiento' },
];

export const HORARIOS_CLASES_INICIALES: HorarioClase[] = [
  {
    id: 'hor-1',
    academia_id: 'acad-1',
    nombre_clase: 'Karate Infantil Mañana (4 a 6 años)',
    dias_semana: ['LUNES', 'MIERCOLES', 'VIERNES'],
    hora_inicio: '08:00',
    hora_fin: '09:00',
    tipo_audiencia: 'SOLO_NINOS',
    cupo_maximo: 15,
    activo: true,
    seccion_id: 'sec-1',
  },
  {
    id: 'hor-2',
    academia_id: 'acad-1',
    nombre_clase: 'Karate Infantil Tarde (4 a 6 años)',
    dias_semana: ['MARTES', 'JUEVES'],
    hora_inicio: '16:30',
    hora_fin: '17:30',
    tipo_audiencia: 'SOLO_NINOS',
    cupo_maximo: 15,
    activo: true,
    seccion_id: 'sec-2',
  },
  {
    id: 'hor-3',
    academia_id: 'acad-1',
    nombre_clase: 'Adolescentes y Juveniles',
    dias_semana: ['LUNES', 'MIERCOLES', 'VIERNES'],
    hora_inicio: '17:30',
    hora_fin: '19:00',
    tipo_audiencia: 'SOLO_NINOS',
    cupo_maximo: 25,
    activo: true,
    seccion_id: 'sec-3',
  },
  {
    id: 'hor-4',
    academia_id: 'acad-1',
    nombre_clase: 'Jóvenes y Adultos Noche',
    dias_semana: ['LUNES', 'MIERCOLES', 'VIERNES'],
    hora_inicio: '19:30',
    hora_fin: '21:00',
    tipo_audiencia: 'SOLO_ADULTOS',
    cupo_maximo: 30,
    activo: true,
    seccion_id: 'sec-4',
  },
  {
    id: 'hor-5',
    academia_id: 'acad-1',
    nombre_clase: 'Clase Mixta Sábados (General)',
    dias_semana: ['SABADO'],
    hora_inicio: '10:00',
    hora_fin: '12:00',
    tipo_audiencia: 'MIXTO',
    cupo_maximo: 35,
    activo: true,
  },
];

export const EVENTOS_INICIALES: Evento[] = [
  {
    id: 'eve-1',
    academia_id: 'acad-1',
    nombre: 'Campeonato Zonal de Karate Rancagua 2026',
    tipo: 'TORNEO',
    fecha_evento: '2026-04-18',
    hora_evento: '09:00',
    lugar: 'Polideportivo Lourdes, Rancagua',
    costo_inscripcion: 15000,
    estado: 'ABIERTO',
    descripcion: 'Torneo oficial zona centro para clasificación federada.',
    alumnos_inscritos_ids: ['alu-3', 'alu-4', 'alu-5', 'alu-10', 'alu-11', 'alu-13', 'alu-14'],
  },
  {
    id: 'eve-2',
    academia_id: 'acad-1',
    nombre: 'Seminario Internacional de Kata y Bunkai Shito-Ryu',
    tipo: 'SEMINARIO',
    fecha_evento: '2026-05-09',
    hora_evento: '15:00',
    lugar: 'Dojo Central Rancagua',
    costo_inscripcion: 20000,
    estado: 'ABIERTO',
    descripcion: 'Capacitación técnica intensiva dictada por Maestros 7° Dan.',
    alumnos_inscritos_ids: ['alu-2', 'alu-3', 'alu-6', 'alu-7', 'alu-8'],
  },
];

export const EXAMENES_INICIALES: ExamenGrado[] = [
  {
    id: 'ex-1',
    academia_id: 'acad-1',
    nombre: 'Toma de Exámenes de Grado — Otoño 2026',
    fecha_examen: '2026-05-23',
    costo_derecho_examen: 25000,
    estado: 'CONVOCATORIA',
    descripcion: 'Evaluación técnica oficial de Katas, Kihon y Bunkai para ascensos.',
  },
];
