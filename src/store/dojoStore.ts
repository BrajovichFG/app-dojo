import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import rawStudents from '../data/initialStudents.json';
import { supabaseService } from '../services/supabaseService';
import { SUPABASE_CONFIG } from '../config/supabaseConfig';
import {
  ACADEMIAS_DISPONIBLES,
  GRADOS_CINTURON,
  SECCIONES_INICIALES,
  USUARIOS_DISPONIBLES,
  EVENTOS_INICIALES,
  EXAMENES_INICIALES,
} from '../data/constants';
import {
  Academia,
  Alumno,
  CategoriaKarate,
  EstadoPago,
  Evento,
  ExamenGrado,
  HorarioClase,
  PostulacionExamen,
  ResultadoExamen,
  Seccion,
  Usuario,
} from '../types';

export type TabType =
  | 'dashboard'
  | 'alumnos'
  | 'cronograma'
  | 'mensualidades'
  | 'torneos'
  | 'registro_publico'
  | 'configuracion';

interface PaymentRecord {
  estado: EstadoPago;
  monto: number;
  fecha?: string;
  metodo?: string;
}

interface DojoState {
  // Sincronización Nube Supabase
  supabaseSyncStatus: 'CONNECTING' | 'SYNCED' | 'LOCAL';
  initSupabase: () => Promise<void>;

  // Autenticación por Usuario y Sede
  users: Usuario[];
  currentUser: Usuario | null;
  currentAcademia: Academia | null;
  loginAsUser: (userId: string, academiaId?: string) => void;
  switchAcademia: (academiaId: string) => void;
  logout: () => void;

  // Gestión de Sedes / Escuelas y Profesores (Módulo Configuración)
  academias: Academia[];
  addAcademia: (newAcademia: Omit<Academia, 'id' | 'created_at'>) => void;
  deleteAcademia: (id: string) => void;
  addUsuario: (newUsuario: Omit<Usuario, 'id'>) => void;
  assignAcademiaToUser: (userId: string, academiaId: string) => void;
  removeAcademiaFromUser: (userId: string, academiaId: string) => void;
  reassignStudentAcademia: (studentId: string, newAcademiaId: string) => void;

  // Navegación
  currentTab: TabType;
  setTab: (tab: TabType) => void;

  // Sedes y Secciones
  secciones: Seccion[];

  // Alumnos
  students: Alumno[];
  selectedStudentId: string | null;
  selectStudent: (id: string | null) => void;
  addStudent: (student: Omit<Alumno, 'id'>) => void;
  updateStudent: (id: string, updates: Partial<Alumno>) => void;

  // Pagos de Mensualidades (por alumno y mes 1-12)
  payments: Record<string, Record<number, PaymentRecord>>;
  togglePayment: (studentId: string, month: number, monto?: number, metodo?: string) => void;
  isStudentUpToDate: (studentId: string, month?: number) => boolean;

  // Cronograma y Clases
  schedule: HorarioClase[];
  studentClassAssignments: Record<string, string[]>; // studentId -> classIds
  addClass: (newClass: Omit<HorarioClase, 'id' | 'activo'>, studentIds?: string[]) => void;
  deleteHorarioClase: (classId: string) => void;
  clearSchedule: () => void;
  assignStudentToClass: (studentId: string, classId: string) => void;
  removeStudentFromClass: (studentId: string, classId: string) => void;

  // Asistencia diaria por fecha
  attendance: Record<string, Record<string, boolean>>; // [classId_YYYY-MM-DD]: { [studentId]: boolean }
  toggleAttendance: (classId: string, dateStr: string, studentId: string) => void;

  // Módulo Eventos (Torneos, Seminarios, Eventos)
  eventos: Evento[];
  addEvento: (newEvento: Omit<Evento, 'id'>) => void;
  updateEvento: (id: string, updates: Partial<Evento>) => void;
  deleteEvento: (id: string) => void;
  assignStudentsToEvento: (eventoId: string, studentIds: string[]) => void;
  removeStudentFromEvento: (eventoId: string, studentId: string) => void;

  // Módulo Exámenes de Grado
  examenes: ExamenGrado[];
  addExamen: (newExamen: Omit<ExamenGrado, 'id'>) => void;
  deleteExamen: (id: string) => void;
  examCandidates: PostulacionExamen[];
  addExamCandidates: (examenId: string, studentIds: string[]) => void;
  updateCandidateResult: (candidateId: string, resultado: ResultadoExamen, observaciones?: string) => void;
  finalizeExam: (examenId: string) => void;

  // Categorías personalizables
  customCategories: CategoriaKarate[];
  addCustomCategory: (cat: CategoriaKarate) => void;
  deleteCustomCategory: (id: string) => void;
}

// Convert raw students to typed Alumno array
const initialStudents: Alumno[] = (rawStudents as any[]).map((s, index) => ({
  id: s.id || `alu-${index + 1}`,
  academia_id: 'acad-1',
  seccion_id:
    s.seccion === 'Pequeños 4-6 Años (Grupo I)'
      ? 'sec-1'
      : s.seccion === 'Pequeños 4-6 Años (Grupo II)'
      ? 'sec-2'
      : s.seccion === 'Adolescentes'
      ? 'sec-3'
      : 'sec-4',
  cinturon_id: 1, // Blanco
  nombres: s.nombres || s.nombre_completo,
  apellidos: s.apellidos || '',
  rut: s.rut || undefined,
  fecha_nacimiento: s.fecha_nacimiento || undefined,
  genero: s.genero || 'M',
  peso_actual_kg: s.peso_actual_kg || undefined,
  direccion: s.direccion || undefined,
  lugar_estudio_trabajo: s.establecimiento || undefined,
  talla_polera: s.talla_polera || undefined,
  talla_pantalon: s.talla_pantalon || 'M',
  dia_pago_mensual: 5,
  estado: s.estado || 'ACTIVO',
  categoria_kumite: s.categoria_kumite || undefined,
  categoria_kata: s.categoria_kata || undefined,
  es_competidor: Boolean(s.categoria_kumite || s.categoria_kata || s.pago_zonal || s.pago_nacional),
  fecha_ingreso: s.fecha_ingreso || '2024-01-01',
}));

// Iniciar pagos limpios para registrar a partir de ahora
const initialPayments: Record<string, Record<number, PaymentRecord>> = {};
initialStudents.forEach((student) => {
  initialPayments[student.id] = {};
});

// Storage adapter para web/localStorage
const webStorage =
  typeof window !== 'undefined' && window.localStorage
    ? createJSONStorage(() => window.localStorage)
    : undefined;

export const useDojoStore = create<DojoState>()(
  persist(
    (set, get) => ({
      supabaseSyncStatus: SUPABASE_CONFIG.isConfigured() ? 'SYNCED' : 'LOCAL',
      initSupabase: async () => {
        if (!SUPABASE_CONFIG.isConfigured()) return;
        set({ supabaseSyncStatus: 'CONNECTING' });
        try {
          const [remoteStudents, remoteAcademias] = await Promise.all([
            supabaseService.getAlumnos(),
            supabaseService.getAcademias(),
          ]);

          const nextState: Partial<DojoState> = { supabaseSyncStatus: 'SYNCED' };

          // 1. Fusionar alumnos remotos con locales para preservar atributos modificados localmente
          const localStudents = get().students || [];
          let finalStudents = remoteStudents.map((rs) => {
            const localMatch = localStudents.find(
              (ls) =>
                ls.id === rs.id ||
                (ls.nombres.trim().toLowerCase() === rs.nombres.trim().toLowerCase() &&
                 ls.apellidos.trim().toLowerCase() === rs.apellidos.trim().toLowerCase())
            );
            if (localMatch) {
              return {
                ...localMatch,
                ...rs,
                // Preservar atributos si en local existían y en remoto venían vacíos o nulos
                rut: rs.rut || localMatch.rut,
                fecha_nacimiento: rs.fecha_nacimiento || localMatch.fecha_nacimiento,
                genero: rs.genero || localMatch.genero,
                peso_actual_kg: rs.peso_actual_kg !== undefined ? rs.peso_actual_kg : localMatch.peso_actual_kg,
                direccion: rs.direccion || localMatch.direccion,
                lugar_estudio_trabajo: rs.lugar_estudio_trabajo || localMatch.lugar_estudio_trabajo,
                talla_polera: rs.talla_polera || localMatch.talla_polera,
                talla_pantalon: rs.talla_pantalon || localMatch.talla_pantalon,
                foto_url: rs.foto_url || localMatch.foto_url,
                cinturon_id: rs.cinturon_id || localMatch.cinturon_id,
              };
            }
            return rs;
          });

          for (const localSt of localStudents) {
            const alreadyInFinal = finalStudents.some(
              (fs) =>
                fs.id === localSt.id ||
                (fs.nombres.trim().toLowerCase() === localSt.nombres.trim().toLowerCase() &&
                 fs.apellidos.trim().toLowerCase() === localSt.apellidos.trim().toLowerCase())
            );
            if (!alreadyInFinal) {
              const realId = await supabaseService.insertAlumno(localSt);
              finalStudents.unshift({ ...localSt, id: realId || localSt.id });
            }
          }
          nextState.students = finalStudents;

          let finalAcademias = (remoteAcademias.length > 0 ? [...remoteAcademias] : [...(get().academias || [])])
            .filter((a) => a.id !== 'acad-machali' && a.id !== 'acad-requinoa');

          if (finalAcademias.length === 0) {
            finalAcademias = [...ACADEMIAS_DISPONIBLES];
          }

          // Sincronizar automáticamente cualquier academia local pendiente (ej. creadas antes de la sincronización)
          const currentLocalAcads = (get().academias || [])
            .filter((a) => a.id !== 'acad-machali' && a.id !== 'acad-requinoa');
          for (const localAcad of currentLocalAcads) {
            const alreadyExists = finalAcademias.some(
              (ra) => ra.id === localAcad.id || ra.nombre.trim().toLowerCase() === localAcad.nombre.trim().toLowerCase()
            );
            if (!alreadyExists) {
              const newId = await supabaseService.insertAcademia(localAcad);
              if (newId) {
                finalAcademias.push({ ...localAcad, id: newId });
              }
            }
          }

          if (finalAcademias.length > 0) {
            nextState.academias = finalAcademias;

            const currentId = get().currentAcademia?.id;
            const updatedAcad =
              finalAcademias.find((a) => a.id === currentId) ||
              finalAcademias.find((a) => a.nombre.toLowerCase().includes('rancagua')) ||
              finalAcademias[0];

            nextState.currentAcademia = updatedAcad;

            const currentUser = get().currentUser;
            if (currentUser?.rol === 'ADMIN_GENERAL') {
              nextState.currentUser = {
                ...currentUser,
                academias: finalAcademias,
              };
            }
          }

          set(nextState as any);
        } catch (err) {
          console.error('Error sincronizando con Supabase:', err);
          set({ supabaseSyncStatus: 'LOCAL' });
        }
      },

      users: USUARIOS_DISPONIBLES,
      currentUser: null,
      currentAcademia: null,

      loginAsUser: (userId, academiaId) => {
        const user = get().users.find((u) => u.id === userId) || get().users[0];
        const availableAcads = get().academias || ACADEMIAS_DISPONIBLES;
        const targetAcademia = academiaId
          ? availableAcads.find((a) => a.id === academiaId) || user?.academias?.find((a) => a.id === academiaId) || availableAcads[0]
          : availableAcads[0];

        set({
          currentUser: user,
          currentAcademia: targetAcademia,
          currentTab: 'dashboard',
        });
      },

      switchAcademia: (academiaId) => {
        const target = get().academias.find((a) => a.id === academiaId);
        if (target) {
          set({ currentAcademia: target, selectedStudentId: null });
        }
      },

      logout: () => set({ currentUser: null, currentAcademia: null }),

      // Gestión de Sedes y Profesores
      academias: ACADEMIAS_DISPONIBLES,

      addAcademia: async (newAcademiaData) => {
        const tempId = `acad-${Date.now()}`;
        const newAcad: Academia = {
          ...newAcademiaData,
          id: tempId,
          created_at: new Date().toISOString().split('T')[0],
        };

        set((state) => {
          // El Dueño (ADMIN_GENERAL) obtiene automáticamente acceso a la nueva sede
          const updatedUsers = state.users.map((u) => {
            if (u.rol === 'ADMIN_GENERAL') {
              return {
                ...u,
                academias: [...u.academias, newAcad],
              };
            }
            return u;
          });

          const updatedCurrentUser =
            state.currentUser?.rol === 'ADMIN_GENERAL'
              ? { ...state.currentUser, academias: [...state.currentUser.academias, newAcad] }
              : state.currentUser;

          return {
            academias: [...state.academias, newAcad],
            users: updatedUsers,
            currentUser: updatedCurrentUser,
          };
        });

        // Insertar en Supabase en tiempo real
        try {
          const remoteId = await supabaseService.insertAcademia(newAcademiaData);
          if (remoteId) {
            set((state) => {
              const replaceId = (acad: Academia) =>
                acad.id === tempId ? { ...acad, id: remoteId } : acad;

              return {
                academias: state.academias.map(replaceId),
                currentAcademia:
                  state.currentAcademia?.id === tempId
                    ? { ...state.currentAcademia, id: remoteId }
                    : state.currentAcademia,
                users: state.users.map((u) => ({
                  ...u,
                  academias: u.academias.map(replaceId),
                })),
                currentUser: state.currentUser
                  ? {
                      ...state.currentUser,
                      academias: state.currentUser.academias.map(replaceId),
                    }
                  : state.currentUser,
              };
            });
          }
        } catch (err) {
          console.warn('Error al guardar academia en Supabase:', err);
        }
      },

      deleteAcademia: async (id: string) => {
        set((state) => ({
          academias: state.academias.filter((a) => a.id !== id),
          users: state.users.map((u) => ({
            ...u,
            academias: u.academias.filter((a) => a.id !== id),
          })),
          currentUser: state.currentUser
            ? {
                ...state.currentUser,
                academias: state.currentUser.academias.filter((a) => a.id !== id),
              }
            : state.currentUser,
        }));

        try {
          await supabaseService.deleteAcademia(id);
        } catch (err) {
          console.warn('Error al eliminar academia en Supabase:', err);
        }
      },

      addUsuario: (newUsuarioData) => {
        const id = `usr-${Date.now()}`;
        const newUsr: Usuario = {
          ...newUsuarioData,
          id,
        };
        set((state) => ({
          users: [...state.users, newUsr],
        }));
      },

      assignAcademiaToUser: (userId, academiaId) => {
        set((state) => {
          const targetAcad = state.academias.find((a) => a.id === academiaId);
          if (!targetAcad) return state;

          const updatedUsers = state.users.map((u) => {
            if (u.id !== userId) return u;
            if (u.academias.some((a) => a.id === academiaId)) return u;
            return {
              ...u,
              academias: [...u.academias, targetAcad],
            };
          });

          const updatedCurrent =
            state.currentUser?.id === userId
              ? updatedUsers.find((u) => u.id === userId) || state.currentUser
              : state.currentUser;

          return {
            users: updatedUsers,
            currentUser: updatedCurrent,
          };
        });
      },

      removeAcademiaFromUser: (userId, academiaId) => {
        set((state) => {
          const updatedUsers = state.users.map((u) => {
            if (u.id !== userId) return u;
            return {
              ...u,
              academias: u.academias.filter((a) => a.id !== academiaId),
            };
          });

          const updatedCurrent =
            state.currentUser?.id === userId
              ? updatedUsers.find((u) => u.id === userId) || state.currentUser
              : state.currentUser;

          return {
            users: updatedUsers,
            currentUser: updatedCurrent,
          };
        });
      },

      reassignStudentAcademia: (studentId, newAcademiaId) => {
        set((state) => ({
          students: state.students.map((st) =>
            st.id === studentId ? { ...st, academia_id: newAcademiaId } : st
          ),
        }));
        supabaseService.updateAlumno(studentId, { academia_id: newAcademiaId });
      },

      currentTab: 'dashboard',
      setTab: (tab) => set({ currentTab: tab }),

      secciones: SECCIONES_INICIALES,

      students: initialStudents,
      selectedStudentId: null,
      selectStudent: (id) => set({ selectedStudentId: id }),

      addStudent: (newStudentData) => {
        const tempId = `alu-${Date.now()}`;
        const newStudent: Alumno = {
          ...newStudentData,
          id: tempId,
        };
        set((state) => ({
          students: [newStudent, ...state.students],
          selectedStudentId: tempId,
        }));

        supabaseService.insertAlumno(newStudentData).then((realId) => {
          if (realId) {
            set((state) => ({
              students: state.students.map((st) => (st.id === tempId ? { ...st, id: realId } : st)),
              selectedStudentId: state.selectedStudentId === tempId ? realId : state.selectedStudentId,
            }));
          }
        });
      },

      updateStudent: (id, updates) => {
        set((state) => ({
          students: state.students.map((st) => (st.id === id ? { ...st, ...updates } : st)),
        }));
        supabaseService.updateAlumno(id, updates);
      },

      payments: initialPayments,
      togglePayment: (studentId, month, monto = 35000, metodo = 'TRANSFERENCIA') => {
        let newStatus: EstadoPago = 'PAGADO';
        set((state) => {
          const studentPayments = state.payments[studentId] || {};
          const current = studentPayments[month]?.estado || 'PENDIENTE';
          newStatus = current === 'PAGADO' ? 'PENDIENTE' : 'PAGADO';

          return {
            payments: {
              ...state.payments,
              [studentId]: {
                ...studentPayments,
                [month]: {
                  estado: newStatus,
                  monto,
                  fecha: newStatus === 'PAGADO' ? new Date().toISOString().split('T')[0] : undefined,
                  metodo: newStatus === 'PAGADO' ? metodo : undefined,
                },
              },
            },
          };
        });
        supabaseService.upsertMensualidad(studentId, new Date().getFullYear(), month, newStatus as any, monto, metodo);
      },

      isStudentUpToDate: (studentId, month) => {
        const targetMonth = month || new Date().getMonth() + 1;
        const stPayments = get().payments[studentId] || {};
        return stPayments[targetMonth]?.estado === 'PAGADO';
      },

      // Cronograma y Clases
      schedule: [],
      studentClassAssignments: {},

      addClass: (newClassData, studentIds = []) => {
        const id = `hor-${Date.now()}`;
        const newClass: HorarioClase = {
          ...newClassData,
          id,
          activo: true,
        };

        set((state) => {
          const updatedAssignments = { ...state.studentClassAssignments };
          studentIds.forEach((sId) => {
            const cur = updatedAssignments[sId] || [];
            if (!cur.includes(id)) {
              updatedAssignments[sId] = [...cur, id];
            }
          });

          return {
            schedule: [...state.schedule, newClass],
            studentClassAssignments: updatedAssignments,
          };
        });
      },

      deleteHorarioClase: (classId) => {
        set((state) => ({
          schedule: state.schedule.filter((c) => c.id !== classId),
        }));
      },

      clearSchedule: () => set({ schedule: [], studentClassAssignments: {} }),

      assignStudentToClass: (studentId, classId) => {
        set((state) => {
          const current = state.studentClassAssignments[studentId] || [];
          if (current.includes(classId)) return state;
          return {
            studentClassAssignments: {
              ...state.studentClassAssignments,
              [studentId]: [...current, classId],
            },
          };
        });
      },

      removeStudentFromClass: (studentId, classId) => {
        set((state) => {
          const current = state.studentClassAssignments[studentId] || [];
          return {
            studentClassAssignments: {
              ...state.studentClassAssignments,
              [studentId]: current.filter((c) => c !== classId),
            },
          };
        });
      },

      // Asistencia diaria por fecha
      attendance: {},
      toggleAttendance: (classId, dateStr, studentId) => {
        const key = `${classId}_${dateStr}`;
        set((state) => {
          const currentForDate = state.attendance[key] || {};
          const isPresent = Boolean(currentForDate[studentId]);
          return {
            attendance: {
              ...state.attendance,
              [key]: {
                ...currentForDate,
                [studentId]: !isPresent,
              },
            },
          };
        });
      },

      // Módulo Eventos (Torneos, Seminarios, Especiales)
      eventos: EVENTOS_INICIALES,

      addEvento: (newEventoData) => {
        const id = `eve-${Date.now()}`;
        const newEvento: Evento = {
          ...newEventoData,
          id,
        };
        set((state) => ({
          eventos: [newEvento, ...state.eventos],
        }));
        supabaseService.createEvento(newEventoData);
      },

      updateEvento: (id, updates) => {
        set((state) => ({
          eventos: state.eventos.map((e) => (e.id === id ? { ...e, ...updates } : e)),
        }));
      },

      deleteEvento: (id) => {
        set((state) => ({
          eventos: state.eventos.filter((e) => e.id !== id),
        }));
      },

      assignStudentsToEvento: (eventoId, studentIds) => {
        set((state) => ({
          eventos: state.eventos.map((e) => {
            if (e.id !== eventoId) return e;
            const setIds = new Set([...e.alumnos_inscritos_ids, ...studentIds]);
            return { ...e, alumnos_inscritos_ids: Array.from(setIds) };
          }),
        }));
      },

      removeStudentFromEvento: (eventoId, studentId) => {
        set((state) => ({
          eventos: state.eventos.map((e) => {
            if (e.id !== eventoId) return e;
            return {
              ...e,
              alumnos_inscritos_ids: e.alumnos_inscritos_ids.filter((id) => id !== studentId),
            };
          }),
        }));
      },

      // Módulo Exámenes de Grado
      examenes: EXAMENES_INICIALES,

      addExamen: (newExamenData) => {
        const id = `ex-${Date.now()}`;
        const newExamen: ExamenGrado = {
          ...newExamenData,
          id,
        };
        set((state) => ({
          examenes: [newExamen, ...state.examenes],
        }));
        supabaseService.createExamen(newExamenData);
      },

      deleteExamen: (id) => {
        set((state) => ({
          examenes: state.examenes.filter((ex) => ex.id !== id),
          examCandidates: state.examCandidates.filter((c) => c.examen_id !== id),
        }));
      },

      examCandidates: [
        {
          id: 'cand-1',
          examen_id: 'ex-1',
          alumno_id: 'alu-3',
          grado_actual_id: 1,
          grado_postulado_id: 3,
          estado_mensualidad: 'AL_DIA',
          estado_pago_examen: 'PAGADO',
          resultado: 'PENDIENTE',
          observaciones: 'Evaluación de Katas Pinan Nidan y Kihon básico.',
        },
        {
          id: 'cand-2',
          examen_id: 'ex-1',
          alumno_id: 'alu-4',
          grado_actual_id: 1,
          grado_postulado_id: 3,
          estado_mensualidad: 'AL_DIA',
          estado_pago_examen: 'PAGADO',
          resultado: 'PENDIENTE',
          observaciones: 'Buen rendimiento en combate y velocidad de ataque.',
        },
      ],

      addExamCandidates: (examenId, studentIds) => {
        set((state) => {
          const existing = new Set(
            state.examCandidates.filter((c) => c.examen_id === examenId).map((c) => c.alumno_id)
          );
          const newCandidates: PostulacionExamen[] = [];

          studentIds.forEach((sId) => {
            if (existing.has(sId)) return;
            const student = state.students.find((s) => s.id === sId);
            if (!student) return;

            const currentBelt = student.cinturon_id || 1;
            const nextBelt = currentBelt < 15 ? currentBelt + 1 : currentBelt;
            const isUpToDate = get().isStudentUpToDate(sId);

            newCandidates.push({
              id: `cand-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
              examen_id: examenId,
              alumno_id: sId,
              grado_actual_id: currentBelt,
              grado_postulado_id: nextBelt,
              estado_mensualidad: isUpToDate ? 'AL_DIA' : 'MOROSO',
              estado_pago_examen: 'PENDIENTE',
              resultado: 'PENDIENTE',
            });
          });

          return {
            examCandidates: [...state.examCandidates, ...newCandidates],
          };
        });
      },

      updateCandidateResult: (candidateId, resultado, observaciones) => {
        set((state) => ({
          examCandidates: state.examCandidates.map((c) =>
            c.id === candidateId
              ? {
                  ...c,
                  resultado,
                  observaciones: observaciones !== undefined ? observaciones : c.observaciones,
                }
              : c
          ),
        }));
      },

      finalizeExam: (examenId) => {
        set((state) => {
          const promoted = state.examCandidates.filter(
            (c) => c.examen_id === examenId && c.resultado === 'PROMOVIDO'
          );
          const promotedMap = new Map(promoted.map((p) => [p.alumno_id, p.grado_postulado_id]));

          const updatedStudents = state.students.map((st) => {
            if (promotedMap.has(st.id)) {
              const newBelt = promotedMap.get(st.id)!;
              // Guardar en Supabase en segundo plano
              supabaseService.updateAlumno(st.id, { cinturon_id: newBelt });
              return { ...st, cinturon_id: newBelt };
            }
            return st;
          });

          const updatedExams = state.examenes.map((ex) =>
            ex.id === examenId ? { ...ex, estado: 'FINALIZADO' as const } : ex
          );

          return {
            students: updatedStudents,
            examenes: updatedExams,
          };
        });
      },

      customCategories: [],
      addCustomCategory: (cat) => {
        set((state) => ({
          customCategories: [...state.customCategories, cat],
        }));
      },
      deleteCustomCategory: (id) => {
        set((state) => ({
          customCategories: state.customCategories.filter((c) => c.id !== id),
        }));
      },
    }),
    {
      name: 'dojo_shito_ryu_storage_v5',
      storage: webStorage,
      migrate: (persistedState: any) => {
        if (persistedState) {
          persistedState.users = USUARIOS_DISPONIBLES;
          if (!persistedState.currentUser || persistedState.currentUser.id !== 'usr-1') {
            persistedState.currentUser = USUARIOS_DISPONIBLES[0];
          }
        }
        return persistedState;
      },
    }
  )
);
