import { getSupabase } from './supabaseClient';
import { Alumno, Evento, ExamenGrado, Academia } from '../types';

const SECCION_UUID_MAP: Record<string, string> = {
  'sec-1': 'b75649ab-db11-4e07-b6da-2e2ed4d57aef',
  'sec-2': '1849cd87-a285-4d1b-9a06-761ce40db20e',
  'sec-3': '31a08a56-860e-4321-bbe7-2a7092832549',
  'sec-4': '229e046c-87ad-4122-a29e-322fa2696f9a',
};

const UUID_SECCION_MAP: Record<string, string> = {
  'b75649ab-db11-4e07-b6da-2e2ed4d57aef': 'sec-1',
  '1849cd87-a285-4d1b-9a06-761ce40db20e': 'sec-2',
  '31a08a56-860e-4321-bbe7-2a7092832549': 'sec-3',
  '229e046c-87ad-4122-a29e-322fa2696f9a': 'sec-4',
};

function toValidSeccionUuid(secId?: string): string | null {
  if (!secId) return null;
  if (SECCION_UUID_MAP[secId]) return SECCION_UUID_MAP[secId];
  if (/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(secId)) {
    return secId;
  }
  return '31a08a56-860e-4321-bbe7-2a7092832549'; // Default a Adolescentes
}

function fromSeccionUuid(uuid?: string): string {
  if (!uuid) return 'sec-4';
  if (UUID_SECCION_MAP[uuid]) return UUID_SECCION_MAP[uuid];
  return uuid;
}

export const supabaseService = {
  // 1. Obtener todos los alumnos desde Supabase
  async getAlumnos(): Promise<Alumno[]> {
    const supabase = getSupabase();
    if (!supabase) return [];

    try {
      const { data, error } = await supabase
        .from('alumnos')
        .select('*')
        .order('nombres', { ascending: true });

      if (error) {
        console.warn('Error al obtener alumnos de Supabase:', error.message);
        return [];
      }

      if (!data) return [];

      return data.map((row: any) => ({
        id: row.id,
        academia_id: row.academia_id,
        seccion_id: fromSeccionUuid(row.seccion_id),
        cinturon_id: row.cinturon_id || 1,
        nombres: row.nombres,
        apellidos: row.apellidos || '',
        rut: row.rut || undefined,
        fecha_nacimiento: row.fecha_nacimiento || undefined,
        genero: (row.genero as 'M' | 'F') || 'M',
        peso_actual_kg: row.peso_actual_kg ? parseFloat(row.peso_actual_kg) : undefined,
        fecha_ultimo_pesaje: row.fecha_ultimo_pesaje || undefined,
        direccion: row.direccion || undefined,
        lugar_estudio_trabajo: row.lugar_estudio_trabajo || undefined,
        talla_polera: row.talla_polera || undefined,
        talla_pantalon: row.talla_pantalon || 'M',
        dia_pago_mensual: row.dia_pago_mensual || 5,
        estado: row.estado || 'ACTIVO',
        es_competidor: Boolean(row.es_competidor),
        categoria_kumite: row.categoria_kumite || undefined,
        categoria_kata: row.categoria_kata || undefined,
        fecha_ingreso: row.fecha_ingreso || '2024-01-01',
      }));
    } catch (err) {
      console.error('Error de red al conectar con Supabase:', err);
      return [];
    }
  },

  // 2. Insertar nuevo alumno en Supabase
  async insertAlumno(alumno: Omit<Alumno, 'id'>): Promise<string | null> {
    const supabase = getSupabase();
    if (!supabase) return null;

    try {
      const { data, error } = await supabase
        .from('alumnos')
        .insert({
          academia_id: (!alumno.academia_id || alumno.academia_id === 'acad-1') ? '4fddd818-7ea1-489c-9790-8e55fd755d34' : alumno.academia_id,
          seccion_id: toValidSeccionUuid(alumno.seccion_id),
          cinturon_id: alumno.cinturon_id || 1,
          nombres: alumno.nombres,
          apellidos: alumno.apellidos,
          rut: alumno.rut || null,
          fecha_nacimiento: alumno.fecha_nacimiento || null,
          genero: alumno.genero,
          peso_actual_kg: alumno.peso_actual_kg || null,
          direccion: alumno.direccion || null,
          lugar_estudio_trabajo: alumno.lugar_estudio_trabajo || null,
          talla_polera: alumno.talla_polera || null,
          talla_pantalon: alumno.talla_pantalon || null,
          dia_pago_mensual: alumno.dia_pago_mensual || 5,
          estado: alumno.estado || 'PENDIENTE_CONFIRMACION',
          es_competidor: alumno.es_competidor || false,
          categoria_kumite: alumno.categoria_kumite || null,
          categoria_kata: alumno.categoria_kata || null,
          fecha_ingreso: alumno.fecha_ingreso || new Date().toISOString().split('T')[0],
        })
        .select('id')
        .single();

      if (error) {
        console.warn('Error al insertar alumno en Supabase:', error.message);
        return null;
      }

      return data?.id || null;
    } catch (err) {
      console.error('Error insertando alumno:', err);
      return null;
    }
  },

  // 3. Actualizar alumno en Supabase
  async updateAlumno(id: string, updates: Partial<Alumno>): Promise<boolean> {
    const supabase = getSupabase();
    if (!supabase) return false;

    try {
      const allowedColumns = [
        'academia_id', 'seccion_id', 'cinturon_id', 'nombres', 'apellidos',
        'rut', 'fecha_nacimiento', 'genero', 'peso_actual_kg', 'fecha_ultimo_pesaje',
        'direccion', 'lugar_estudio_trabajo', 'talla_polera', 'talla_pantalon',
        'categoria_kumite', 'categoria_kata', 'foto_url', 'dia_pago_mensual',
        'estado', 'es_competidor', 'fecha_ingreso'
      ];

      const dbUpdates: any = {};
      for (const col of allowedColumns) {
        if ((updates as any)[col] !== undefined) {
          dbUpdates[col] = (updates as any)[col];
        }
      }

      // Mapear categorías manuales si vienen
      if (updates.categoria_kumite_manual !== undefined) {
        dbUpdates.categoria_kumite = updates.categoria_kumite_manual;
      }
      if (updates.categoria_kata_manual !== undefined) {
        dbUpdates.categoria_kata = updates.categoria_kata_manual;
      }

      if (dbUpdates.seccion_id) {
        dbUpdates.seccion_id = toValidSeccionUuid(dbUpdates.seccion_id);
      }
      if (dbUpdates.academia_id === 'acad-1') {
        dbUpdates.academia_id = '4fddd818-7ea1-489c-9790-8e55fd755d34';
      }

      const { error } = await supabase
        .from('alumnos')
        .update(dbUpdates)
        .eq('id', id);

      if (error) {
        console.warn('Error actualizando alumno en Supabase:', error.message);
        return false;
      }
      return true;
    } catch (err) {
      console.error('Error actualizando alumno:', err);
      return false;
    }
  },

  // 4. Registrar o actualizar mensualidad
  async upsertMensualidad(
    alumnoId: string,
    anio: number,
    mes: number,
    estado: 'PAGADO' | 'PENDIENTE' | 'ATRASADO',
    monto: number = 35000,
    metodo: string = 'TRANSFERENCIA'
  ): Promise<boolean> {
    const supabase = getSupabase();
    if (!supabase) return false;

    try {
      const { error } = await supabase
        .from('mensualidades')
        .upsert(
          {
            alumno_id: alumnoId,
            anio,
            mes,
            monto,
            estado,
            metodo_pago: metodo,
            fecha_pago: estado === 'PAGADO' ? new Date().toISOString() : null,
          },
          { onConflict: 'alumno_id, anio, mes' }
        );

      if (error) {
        console.warn('Error actualizando mensualidad en Supabase:', error.message);
        return false;
      }
      return true;
    } catch (err) {
      console.error('Error guardando mensualidad:', err);
      return false;
    }
  },

  // 5. Crear Evento en Supabase
  async createEvento(evento: Omit<Evento, 'id'>): Promise<string | null> {
    const supabase = getSupabase();
    if (!supabase) return null;

    try {
      const { data, error } = await supabase
        .from('eventos')
        .insert({
          academia_id: evento.academia_id === 'acad-1' ? '4fddd818-7ea1-489c-9790-8e55fd755d34' : evento.academia_id,
          nombre: evento.nombre,
          tipo_evento: evento.tipo,
          fecha_evento: evento.fecha_evento,
          lugar: evento.lugar,
          costo_inscripcion: evento.costo_inscripcion,
          estado: evento.estado,
          descripcion: evento.descripcion || null,
        })
        .select('id')
        .single();

      if (error) {
        console.warn('Error creando evento en Supabase:', error.message);
        return null;
      }
      return data?.id || null;
    } catch (err) {
      console.error('Error creando evento:', err);
      return null;
    }
  },

  // 6. Crear Examen de Grado en Supabase
  async createExamen(examen: Omit<ExamenGrado, 'id'>): Promise<string | null> {
    const supabase = getSupabase();
    if (!supabase) return null;

    try {
      const { data, error } = await supabase
        .from('examenes_grado')
        .insert({
          academia_id: examen.academia_id === 'acad-1' ? '4fddd818-7ea1-489c-9790-8e55fd755d34' : examen.academia_id,
          nombre: examen.nombre,
          fecha_examen: examen.fecha_examen,
          costo_derecho_examen: examen.costo_derecho_examen,
          estado: examen.estado,
          descripcion: examen.descripcion || null,
        })
        .select('id')
        .single();

      if (error) {
        console.warn('Error creando examen en Supabase:', error.message);
        return null;
      }
      return data?.id || null;
    } catch (err) {
      console.error('Error creando examen:', err);
      return null;
    }
  },

  // 7. Obtener todas las academias / sedes desde Supabase
  async getAcademias(): Promise<Academia[]> {
    const supabase = getSupabase();
    if (!supabase) return [];

    try {
      const { data, error } = await supabase
        .from('academias')
        .select('*')
        .order('created_at', { ascending: true });

      if (error) {
        console.warn('Error al obtener academias de Supabase:', error.message);
        return [];
      }

      if (!data || data.length === 0) return [];

      return data.map((row: any) => ({
        id: row.id,
        nombre: row.nombre,
        rut_titular: row.rut_titular || '14.285.923-1',
        direccion: row.direccion || '',
        telefono: row.telefono || '',
        email: row.email || '',
        created_at: row.created_at || new Date().toISOString().split('T')[0],
      }));
    } catch (err) {
      console.error('Error de red al conectar con Supabase (academias):', err);
      return [];
    }
  },

  // 8. Insertar nueva academia / sede en Supabase
  async insertAcademia(academia: Omit<Academia, 'id' | 'created_at'>): Promise<string | null> {
    const supabase = getSupabase();
    if (!supabase) return null;

    try {
      const { data, error } = await supabase
        .from('academias')
        .insert({
          nombre: academia.nombre,
          rut_titular: academia.rut_titular || '14.285.923-1',
          direccion: academia.direccion || null,
          telefono: academia.telefono || null,
          email: academia.email || null,
        })
        .select('id')
        .single();

      if (error) {
        console.warn('Error insertando academia en Supabase:', error.message);
        return null;
      }

      return data?.id || null;
    } catch (err) {
      console.error('Error insertando academia en Supabase:', err);
      return null;
    }
  },

  // 9. Eliminar academia / sede de Supabase
  async deleteAcademia(id: string): Promise<boolean> {
    const supabase = getSupabase();
    if (!supabase) return false;

    try {
      const { error } = await supabase
        .from('academias')
        .delete()
        .eq('id', id);

      if (error) {
        console.warn('Error eliminando academia de Supabase:', error.message);
        return false;
      }
      return true;
    } catch (err) {
      console.error('Error eliminando academia:', err);
      return false;
    }
  }
};
