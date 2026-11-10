// ===========================================================
// Motor de Categorías de Karate (WKF / Federación Chilena)
// Calcula automáticamente la categoría de Kata y Kumite
// basándose en edad, género y peso del alumno.
// ===========================================================

import { CategoriaKarate } from '../types';

/**
 * Calcula la edad exacta en años a partir de una fecha de nacimiento.
 * Si se proporciona una fecha de referencia (ej. fecha del torneo),
 * la edad se calcula respecto a esa fecha.
 */
export function calcularEdad(fechaNacimiento: string, fechaReferencia?: string): number {
  const nacimiento = new Date(fechaNacimiento);
  const referencia = fechaReferencia ? new Date(fechaReferencia) : new Date();

  let edad = referencia.getFullYear() - nacimiento.getFullYear();
  const mesActual = referencia.getMonth();
  const mesNacimiento = nacimiento.getMonth();

  if (
    mesActual < mesNacimiento ||
    (mesActual === mesNacimiento && referencia.getDate() < nacimiento.getDate())
  ) {
    edad--;
  }

  return edad;
}

/**
 * Calcula la edad en formato descriptivo: "14 años 5 meses"
 */
export function calcularEdadDescriptiva(fechaNacimiento: string): string {
  if (!fechaNacimiento) return 'Sin fecha de nacimiento';

  const nacimiento = new Date(fechaNacimiento);
  const hoy = new Date();

  let anios = hoy.getFullYear() - nacimiento.getFullYear();
  let meses = hoy.getMonth() - nacimiento.getMonth();

  if (hoy.getDate() < nacimiento.getDate()) {
    meses--;
  }

  if (meses < 0) {
    anios--;
    meses += 12;
  }

  return `${anios} años ${meses} meses`;
}

/**
 * Tabla completa de categorías de Kumite (WKF / Federación Chilena)
 * Extraída directamente del Excel del Dojo
 */
export const CATEGORIAS_KUMITE: CategoriaKarate[] = [
  // U12 Masculino
  { id: 'U12-M-35', modalidad: 'KUMITE', division: 'U12', genero: 'M', edad_min: 10, edad_max: 11, peso_min_kg: 0, peso_max_kg: 35, nombre_etiqueta: 'U12 M -35kg' },
  { id: 'U12-M-40', modalidad: 'KUMITE', division: 'U12', genero: 'M', edad_min: 10, edad_max: 11, peso_min_kg: 35.01, peso_max_kg: 40, nombre_etiqueta: 'U12 M -40kg' },
  { id: 'U12-M-45', modalidad: 'KUMITE', division: 'U12', genero: 'M', edad_min: 10, edad_max: 11, peso_min_kg: 40.01, peso_max_kg: 45, nombre_etiqueta: 'U12 M -45kg' },
  { id: 'U12-M-45P', modalidad: 'KUMITE', division: 'U12', genero: 'M', edad_min: 10, edad_max: 11, peso_min_kg: 45.01, peso_max_kg: 999, nombre_etiqueta: 'U12 M +45kg' },
  // U12 Femenino
  { id: 'U12-F-37', modalidad: 'KUMITE', division: 'U12', genero: 'F', edad_min: 10, edad_max: 11, peso_min_kg: 0, peso_max_kg: 37, nombre_etiqueta: 'U12 F -37kg' },
  { id: 'U12-F-42', modalidad: 'KUMITE', division: 'U12', genero: 'F', edad_min: 10, edad_max: 11, peso_min_kg: 37.01, peso_max_kg: 42, nombre_etiqueta: 'U12 F -42kg' },
  { id: 'U12-F-47', modalidad: 'KUMITE', division: 'U12', genero: 'F', edad_min: 10, edad_max: 11, peso_min_kg: 42.01, peso_max_kg: 47, nombre_etiqueta: 'U12 F -47kg' },
  { id: 'U12-F-47P', modalidad: 'KUMITE', division: 'U12', genero: 'F', edad_min: 10, edad_max: 11, peso_min_kg: 47.01, peso_max_kg: 999, nombre_etiqueta: 'U12 F +47kg' },
  // U14 Masculino
  { id: 'U14-M-40', modalidad: 'KUMITE', division: 'U14', genero: 'M', edad_min: 12, edad_max: 13, peso_min_kg: 0, peso_max_kg: 40, nombre_etiqueta: 'U14 M -40kg' },
  { id: 'U14-M-45', modalidad: 'KUMITE', division: 'U14', genero: 'M', edad_min: 12, edad_max: 13, peso_min_kg: 40.01, peso_max_kg: 45, nombre_etiqueta: 'U14 M -45kg' },
  { id: 'U14-M-50', modalidad: 'KUMITE', division: 'U14', genero: 'M', edad_min: 12, edad_max: 13, peso_min_kg: 45.01, peso_max_kg: 50, nombre_etiqueta: 'U14 M -50kg' },
  { id: 'U14-M-55', modalidad: 'KUMITE', division: 'U14', genero: 'M', edad_min: 12, edad_max: 13, peso_min_kg: 50.01, peso_max_kg: 55, nombre_etiqueta: 'U14 M -55kg' },
  { id: 'U14-M-55P', modalidad: 'KUMITE', division: 'U14', genero: 'M', edad_min: 12, edad_max: 13, peso_min_kg: 55.01, peso_max_kg: 999, nombre_etiqueta: 'U14 M +55kg' },
  // U14 Femenino
  { id: 'U14-F-42', modalidad: 'KUMITE', division: 'U14', genero: 'F', edad_min: 12, edad_max: 13, peso_min_kg: 0, peso_max_kg: 42, nombre_etiqueta: 'U14 F -42kg' },
  { id: 'U14-F-47', modalidad: 'KUMITE', division: 'U14', genero: 'F', edad_min: 12, edad_max: 13, peso_min_kg: 42.01, peso_max_kg: 47, nombre_etiqueta: 'U14 F -47kg' },
  { id: 'U14-F-52', modalidad: 'KUMITE', division: 'U14', genero: 'F', edad_min: 12, edad_max: 13, peso_min_kg: 47.01, peso_max_kg: 52, nombre_etiqueta: 'U14 F -52kg' },
  { id: 'U14-F-52P', modalidad: 'KUMITE', division: 'U14', genero: 'F', edad_min: 12, edad_max: 13, peso_min_kg: 52.01, peso_max_kg: 999, nombre_etiqueta: 'U14 F +52kg' },
  // CADETE Masculino (14-15)
  { id: 'CADETE-M-52', modalidad: 'KUMITE', division: 'CADETE', genero: 'M', edad_min: 14, edad_max: 15, peso_min_kg: 0, peso_max_kg: 52, nombre_etiqueta: 'CADETE M -52kg' },
  { id: 'CADETE-M-57', modalidad: 'KUMITE', division: 'CADETE', genero: 'M', edad_min: 14, edad_max: 15, peso_min_kg: 52.01, peso_max_kg: 57, nombre_etiqueta: 'CADETE M -57kg' },
  { id: 'CADETE-M-63', modalidad: 'KUMITE', division: 'CADETE', genero: 'M', edad_min: 14, edad_max: 15, peso_min_kg: 57.01, peso_max_kg: 63, nombre_etiqueta: 'CADETE M -63kg' },
  { id: 'CADETE-M-70', modalidad: 'KUMITE', division: 'CADETE', genero: 'M', edad_min: 14, edad_max: 15, peso_min_kg: 63.01, peso_max_kg: 70, nombre_etiqueta: 'CADETE M -70kg' },
  { id: 'CADETE-M-70P', modalidad: 'KUMITE', division: 'CADETE', genero: 'M', edad_min: 14, edad_max: 15, peso_min_kg: 70.01, peso_max_kg: 999, nombre_etiqueta: 'CADETE M +70kg' },
  // CADETE Femenino (14-15)
  { id: 'CADETE-F-47', modalidad: 'KUMITE', division: 'CADETE', genero: 'F', edad_min: 14, edad_max: 15, peso_min_kg: 0, peso_max_kg: 47, nombre_etiqueta: 'CADETE F -47kg' },
  { id: 'CADETE-F-54', modalidad: 'KUMITE', division: 'CADETE', genero: 'F', edad_min: 14, edad_max: 15, peso_min_kg: 47.01, peso_max_kg: 54, nombre_etiqueta: 'CADETE F -54kg' },
  { id: 'CADETE-F-61', modalidad: 'KUMITE', division: 'CADETE', genero: 'F', edad_min: 14, edad_max: 15, peso_min_kg: 54.01, peso_max_kg: 61, nombre_etiqueta: 'CADETE F -61kg' },
  { id: 'CADETE-F-61P', modalidad: 'KUMITE', division: 'CADETE', genero: 'F', edad_min: 14, edad_max: 15, peso_min_kg: 61.01, peso_max_kg: 999, nombre_etiqueta: 'CADETE F +61kg' },
  // JUNIOR Masculino (16-17)
  { id: 'JUNIOR-M-55', modalidad: 'KUMITE', division: 'JUNIOR', genero: 'M', edad_min: 16, edad_max: 17, peso_min_kg: 0, peso_max_kg: 55, nombre_etiqueta: 'JUNIOR M -55kg' },
  { id: 'JUNIOR-M-61', modalidad: 'KUMITE', division: 'JUNIOR', genero: 'M', edad_min: 16, edad_max: 17, peso_min_kg: 55.01, peso_max_kg: 61, nombre_etiqueta: 'JUNIOR M -61kg' },
  { id: 'JUNIOR-M-68', modalidad: 'KUMITE', division: 'JUNIOR', genero: 'M', edad_min: 16, edad_max: 17, peso_min_kg: 61.01, peso_max_kg: 68, nombre_etiqueta: 'JUNIOR M -68kg' },
  { id: 'JUNIOR-M-76', modalidad: 'KUMITE', division: 'JUNIOR', genero: 'M', edad_min: 16, edad_max: 17, peso_min_kg: 68.01, peso_max_kg: 76, nombre_etiqueta: 'JUNIOR M -76kg' },
  { id: 'JUNIOR-M-76P', modalidad: 'KUMITE', division: 'JUNIOR', genero: 'M', edad_min: 16, edad_max: 17, peso_min_kg: 76.01, peso_max_kg: 999, nombre_etiqueta: 'JUNIOR M +76kg' },
  // JUNIOR Femenino (16-17)
  { id: 'JUNIOR-F-48', modalidad: 'KUMITE', division: 'JUNIOR', genero: 'F', edad_min: 16, edad_max: 17, peso_min_kg: 0, peso_max_kg: 48, nombre_etiqueta: 'JUNIOR F -48kg' },
  { id: 'JUNIOR-F-53', modalidad: 'KUMITE', division: 'JUNIOR', genero: 'F', edad_min: 16, edad_max: 17, peso_min_kg: 48.01, peso_max_kg: 53, nombre_etiqueta: 'JUNIOR F -53kg' },
  { id: 'JUNIOR-F-59', modalidad: 'KUMITE', division: 'JUNIOR', genero: 'F', edad_min: 16, edad_max: 17, peso_min_kg: 53.01, peso_max_kg: 59, nombre_etiqueta: 'JUNIOR F -59kg' },
  { id: 'JUNIOR-F-66', modalidad: 'KUMITE', division: 'JUNIOR', genero: 'F', edad_min: 16, edad_max: 17, peso_min_kg: 59.01, peso_max_kg: 66, nombre_etiqueta: 'JUNIOR F -66kg' },
  { id: 'JUNIOR-F-66P', modalidad: 'KUMITE', division: 'JUNIOR', genero: 'F', edad_min: 16, edad_max: 17, peso_min_kg: 66.01, peso_max_kg: 999, nombre_etiqueta: 'JUNIOR F +66kg' },
  // SENIOR Masculino (18+)
  { id: 'SENIOR-M-60', modalidad: 'KUMITE', division: 'SENIOR', genero: 'M', edad_min: 18, edad_max: 99, peso_min_kg: 0, peso_max_kg: 60, nombre_etiqueta: 'SENIOR M -60kg' },
  { id: 'SENIOR-M-67', modalidad: 'KUMITE', division: 'SENIOR', genero: 'M', edad_min: 18, edad_max: 99, peso_min_kg: 60.01, peso_max_kg: 67, nombre_etiqueta: 'SENIOR M -67kg' },
  { id: 'SENIOR-M-75', modalidad: 'KUMITE', division: 'SENIOR', genero: 'M', edad_min: 18, edad_max: 99, peso_min_kg: 67.01, peso_max_kg: 75, nombre_etiqueta: 'SENIOR M -75kg' },
  { id: 'SENIOR-M-84', modalidad: 'KUMITE', division: 'SENIOR', genero: 'M', edad_min: 18, edad_max: 99, peso_min_kg: 75.01, peso_max_kg: 84, nombre_etiqueta: 'SENIOR M -84kg' },
  { id: 'SENIOR-M-84P', modalidad: 'KUMITE', division: 'SENIOR', genero: 'M', edad_min: 18, edad_max: 99, peso_min_kg: 84.01, peso_max_kg: 999, nombre_etiqueta: 'SENIOR M +84kg' },
  // SENIOR Femenino (18+)
  { id: 'SENIOR-F-50', modalidad: 'KUMITE', division: 'SENIOR', genero: 'F', edad_min: 18, edad_max: 99, peso_min_kg: 0, peso_max_kg: 50, nombre_etiqueta: 'SENIOR F -50kg' },
  { id: 'SENIOR-F-55', modalidad: 'KUMITE', division: 'SENIOR', genero: 'F', edad_min: 18, edad_max: 99, peso_min_kg: 50.01, peso_max_kg: 55, nombre_etiqueta: 'SENIOR F -55kg' },
  { id: 'SENIOR-F-61', modalidad: 'KUMITE', division: 'SENIOR', genero: 'F', edad_min: 18, edad_max: 99, peso_min_kg: 55.01, peso_max_kg: 61, nombre_etiqueta: 'SENIOR F -61kg' },
  { id: 'SENIOR-F-68', modalidad: 'KUMITE', division: 'SENIOR', genero: 'F', edad_min: 18, edad_max: 99, peso_min_kg: 61.01, peso_max_kg: 68, nombre_etiqueta: 'SENIOR F -68kg' },
  { id: 'SENIOR-F-68P', modalidad: 'KUMITE', division: 'SENIOR', genero: 'F', edad_min: 18, edad_max: 99, peso_min_kg: 68.01, peso_max_kg: 999, nombre_etiqueta: 'SENIOR F +68kg' },
];

export const CATEGORIAS_KATA: CategoriaKarate[] = [
  { id: 'KATA-U12-M', modalidad: 'KATA', division: 'U12', genero: 'M', edad_min: 10, edad_max: 11, nombre_etiqueta: 'Kata U12 Masculino' },
  { id: 'KATA-U12-F', modalidad: 'KATA', division: 'U12', genero: 'F', edad_min: 10, edad_max: 11, nombre_etiqueta: 'Kata U12 Femenino' },
  { id: 'KATA-U14-M', modalidad: 'KATA', division: 'U14', genero: 'M', edad_min: 12, edad_max: 13, nombre_etiqueta: 'Kata U14 Masculino' },
  { id: 'KATA-U14-F', modalidad: 'KATA', division: 'U14', genero: 'F', edad_min: 12, edad_max: 13, nombre_etiqueta: 'Kata U14 Femenino' },
  { id: 'KATA-CADETE-M', modalidad: 'KATA', division: 'CADETE', genero: 'M', edad_min: 14, edad_max: 15, nombre_etiqueta: 'Kata Cadete Masculino' },
  { id: 'KATA-CADETE-F', modalidad: 'KATA', division: 'CADETE', genero: 'F', edad_min: 14, edad_max: 15, nombre_etiqueta: 'Kata Cadete Femenino' },
  { id: 'KATA-JUNIOR-M', modalidad: 'KATA', division: 'JUNIOR', genero: 'M', edad_min: 16, edad_max: 17, nombre_etiqueta: 'Kata Junior Masculino' },
  { id: 'KATA-JUNIOR-F', modalidad: 'KATA', division: 'JUNIOR', genero: 'F', edad_min: 16, edad_max: 17, nombre_etiqueta: 'Kata Junior Femenino' },
  { id: 'KATA-SENIOR-M', modalidad: 'KATA', division: 'SENIOR', genero: 'M', edad_min: 18, edad_max: 99, nombre_etiqueta: 'Kata Senior Masculino' },
  { id: 'KATA-SENIOR-F', modalidad: 'KATA', division: 'SENIOR', genero: 'F', edad_min: 18, edad_max: 99, nombre_etiqueta: 'Kata Senior Femenino' },
];

/**
 * Sugiere automáticamente la categoría de KUMITE del alumno
 * basándose en su edad, género y peso.
 */
export function sugerirCategoriaKumite(
  fechaNacimiento: string,
  genero: 'M' | 'F',
  pesoKg: number,
  fechaReferencia?: string,
): CategoriaKarate | null {
  if (!fechaNacimiento || !genero || !pesoKg) return null;

  const edad = calcularEdad(fechaNacimiento, fechaReferencia);

  const categoria = CATEGORIAS_KUMITE.find(
    (cat) =>
      cat.genero === genero &&
      edad >= cat.edad_min &&
      edad <= cat.edad_max &&
      pesoKg >= (cat.peso_min_kg ?? 0) &&
      pesoKg <= (cat.peso_max_kg ?? 999),
  );

  return categoria || null;
}

/**
 * Sugiere automáticamente la categoría de KATA del alumno
 * basándose en su edad y género.
 */
export function sugerirCategoriaKata(
  fechaNacimiento: string,
  genero: 'M' | 'F',
  fechaReferencia?: string,
): CategoriaKarate | null {
  if (!fechaNacimiento || !genero) return null;

  const edad = calcularEdad(fechaNacimiento, fechaReferencia);

  return CATEGORIAS_KATA.find(
    (cat) =>
      cat.genero === genero &&
      edad >= cat.edad_min &&
      edad <= cat.edad_max,
  ) || null;
}

/**
 * Valida un RUT chileno (algoritmo módulo 11)
 */
export function validarRut(rut: string): boolean {
  if (!rut) return false;

  const cleanRut = rut.replace(/[.\-]/g, '').toUpperCase();
  if (cleanRut.length < 2) return false;

  const cuerpo = cleanRut.slice(0, -1);
  const dv = cleanRut.slice(-1);

  if (!/^\d+$/.test(cuerpo)) return false;

  let suma = 0;
  let multiplo = 2;

  for (let i = cuerpo.length - 1; i >= 0; i--) {
    suma += parseInt(cuerpo[i]) * multiplo;
    multiplo = multiplo === 7 ? 2 : multiplo + 1;
  }

  const dvEsperado = 11 - (suma % 11);
  let dvCalculado: string;

  if (dvEsperado === 11) dvCalculado = '0';
  else if (dvEsperado === 10) dvCalculado = 'K';
  else dvCalculado = dvEsperado.toString();

  return dv === dvCalculado;
}

/**
 * Formatea un RUT chileno: 12345678-9 → 12.345.678-9
 */
export function formatearRut(rut: string): string {
  if (!rut) return '';
  const clean = rut.replace(/[.\-]/g, '');
  if (clean.length < 2) return rut;

  const cuerpo = clean.slice(0, -1);
  const dv = clean.slice(-1);

  const formatted = cuerpo.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  return `${formatted}-${dv}`;
}
