import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Modal } from 'react-native';
import { useDojoStore } from '../store/dojoStore';
import { GRADOS_CINTURON, CENTRAL_ACADEMIA_ID, matchAcademia } from '../data/constants';
import { Evento, ExamenGrado, ResultadoExamen, TipoEvento } from '../types';
import { calcularEdad } from '../utils/karateEngine';
import { colors, radii, useResponsive } from '../theme/theme';

export const TorneosScreen: React.FC = () => {
  const { isMobile } = useResponsive();

  const eventos = useDojoStore((state) => state.eventos);
  const addEvento = useDojoStore((state) => state.addEvento);
  const deleteEvento = useDojoStore((state) => state.deleteEvento);
  const assignStudentsToEvento = useDojoStore((state) => state.assignStudentsToEvento);
  const removeStudentFromEvento = useDojoStore((state) => state.removeStudentFromEvento);

  const examenes = useDojoStore((state) => state.examenes);
  const addExamen = useDojoStore((state) => state.addExamen);
  const deleteExamen = useDojoStore((state) => state.deleteExamen);
  const examCandidates = useDojoStore((state) => state.examCandidates);
  const addExamCandidates = useDojoStore((state) => state.addExamCandidates);
  const updateCandidateResult = useDojoStore((state) => state.updateCandidateResult);
  const finalizeExam = useDojoStore((state) => state.finalizeExam);

  const students = useDojoStore((state) => state.students);
  const isStudentUpToDate = useDojoStore((state) => state.isStudentUpToDate);
  const currentAcademia = useDojoStore((state) => state.currentAcademia);

  // Alumnos pertenecientes a la escuela activa
  const targetAcademiaId = currentAcademia?.id || CENTRAL_ACADEMIA_ID;
  const schoolStudents = students.filter((s) => matchAcademia(s.academia_id, targetAcademiaId));

  // Sub-módulos: EVENTOS vs EXAMENES
  const [subModule, setSubModule] = useState<'EVENTOS' | 'EXAMENES'>('EVENTOS');

  // Vista móvil: 'LIST' o 'DETAIL'
  const [mobileView, setMobileView] = useState<'LIST' | 'DETAIL'>('LIST');

  // Estado del Evento Seleccionado
  const [selectedEventoId, setSelectedEventoId] = useState<string>(eventos[0]?.id || '');
  const selectedEvento = eventos.find((e) => e.id === selectedEventoId) || eventos[0];

  // Estado del Examen Seleccionado
  const [selectedExamenId, setSelectedExamenId] = useState<string>(examenes[0]?.id || '');
  const selectedExamen = examenes.find((ex) => ex.id === selectedExamenId) || examenes[0];

  // Modales
  const [showCreateEventoModal, setShowCreateEventoModal] = useState(false);
  const [showCreateExamenModal, setShowCreateExamenModal] = useState(false);
  const [showExportModal, setShowExportModal] = useState(false);
  const [showAssignStudentsModal, setShowAssignStudentsModal] = useState(false);
  const [showAssignCandidatesModal, setShowAssignCandidatesModal] = useState(false);

  // Toast de confirmación de ascensos
  const [ascensosToast, setAscensosToast] = useState(false);

  // Formulario Nuevo Evento
  const [newEveNombre, setNewEveNombre] = useState('');
  const [newEveTipo, setNewEveTipo] = useState<TipoEvento>('TORNEO');
  const [newEveFecha, setNewEveFecha] = useState('2026-06-20');
  const [newEveHora, setNewEveHora] = useState('09:00');
  const [newEveLugar, setNewEveLugar] = useState('Polideportivo Lourdes, Rancagua');
  const [newEveCosto, setNewEveCosto] = useState('15000');
  const [selectedGruposEvento, setSelectedGruposEvento] = useState<string[]>(['sec-3', 'sec-4']);
  const [selectedStudentIdsForEvento, setSelectedStudentIdsForEvento] = useState<string[]>([]);

  // Formulario Nuevo Examen
  const [newExNombre, setNewExNombre] = useState('Toma de Exámenes de Grado Mes Junio 2026');
  const [newExFecha, setNewExFecha] = useState('2026-06-27');
  const [newExCosto, setNewExCosto] = useState('25000');
  const [selectedGruposExamen, setSelectedGruposExamen] = useState<string[]>(['sec-1', 'sec-2', 'sec-3', 'sec-4']);
  const [selectedStudentIdsForExamen, setSelectedStudentIdsForExamen] = useState<string[]>([]);

  // Alumnos inscritos en el evento seleccionado
  const enrolledInEvento = schoolStudents.filter((s) => (selectedEvento?.alumnos_inscritos_ids || []).includes(s.id));

  // Candidatos evaluados en el examen seleccionado
  const candidatesInExam = examCandidates.filter((c) => c.examen_id === selectedExamen?.id);

  // Secciones / Grupos Etarios
  const gruposEtarios = [
    { key: 'sec-1', label: 'Pequeños I (4-6)' },
    { key: 'sec-2', label: 'Pequeños II (4-6)' },
    { key: 'sec-3', label: 'Adolescentes (7-15)' },
    { key: 'sec-4', label: 'Adultos (16+)' },
  ];

  // Handler: Crear Nuevo Evento
  const handleCreateEvento = () => {
    if (!newEveNombre.trim()) return;

    addEvento({
      academia_id: targetAcademiaId,
      nombre: newEveNombre.trim(),
      tipo: newEveTipo,
      fecha_evento: newEveFecha.trim(),
      hora_evento: newEveHora.trim(),
      lugar: newEveLugar.trim(),
      costo_inscripcion: parseInt(newEveCosto, 10) || 0,
      estado: 'ABIERTO',
      alumnos_inscritos_ids: selectedStudentIdsForEvento,
    });

    setShowCreateEventoModal(false);
    setNewEveNombre('');
    setSelectedStudentIdsForEvento([]);
    if (isMobile) setMobileView('DETAIL');
  };

  // Handler: Crear Nueva Toma de Exámenes
  const handleCreateExamen = () => {
    if (!newExNombre.trim()) return;

    const id = `ex-${Date.now()}`;
    addExamen({
      academia_id: targetAcademiaId,
      nombre: newExNombre.trim(),
      fecha_examen: newExFecha.trim(),
      costo_derecho_examen: parseInt(newExCosto, 10) || 0,
      estado: 'CONVOCATORIA',
    });

    if (selectedStudentIdsForExamen.length > 0) {
      addExamCandidates(id, selectedStudentIdsForExamen);
    }

    setSelectedExamenId(id);
    setShowCreateExamenModal(false);
    setSelectedStudentIdsForExamen([]);
    if (isMobile) setMobileView('DETAIL');
  };

  const handleFinalizeAscensos = () => {
    if (!selectedExamen) return;
    finalizeExam(selectedExamen.id);
    setAscensosToast(true);
    setTimeout(() => setAscensosToast(false), 3500);
  };

  return (
    <View style={styles.container}>
      {/* Selector Superior: EVENTOS vs EXÁMENES DE GRADO */}
      <View style={styles.topSelectorBar}>
        <TouchableOpacity
          style={[styles.moduleTabSquare, subModule === 'EVENTOS' && styles.moduleTabSquareActive]}
          onPress={() => {
            setSubModule('EVENTOS');
            if (isMobile) setMobileView('LIST');
          }}
          activeOpacity={0.85}
        >
          <Text style={[styles.moduleTabText, subModule === 'EVENTOS' && styles.moduleTabTextActive]}>
            EVENTOS Y TORNEOS ({eventos.length})
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.moduleTabSquare, subModule === 'EXAMENES' && styles.moduleTabSquareActive]}
          onPress={() => {
            setSubModule('EXAMENES');
            if (isMobile) setMobileView('LIST');
          }}
          activeOpacity={0.85}
        >
          <Text style={[styles.moduleTabText, subModule === 'EXAMENES' && styles.moduleTabTextActive]}>
            EXÁMENES DE GRADO ({examenes.length})
          </Text>
        </TouchableOpacity>
      </View>

      {/* Toast de confirmación de ascensos */}
      {ascensosToast && (
        <View style={styles.toastSuccess}>
          <Text style={styles.toastSuccessText}>
            ✓ ¡ASCENSOS CONFIRMADOS! Los alumnos promovidos han subido automáticamente de cinturón.
          </Text>
        </View>
      )}

      {/* ========================================================
          SUB-MÓDULO 1: EVENTOS (Torneos, Seminarios, Especiales)
         ======================================================== */}
      {subModule === 'EVENTOS' && (
        <View style={[styles.contentRow, isMobile && { flexDirection: 'column' }]}>
          {/* Columna / Vista Izquierda: Lista de Eventos Creados */}
          {(!isMobile || mobileView === 'LIST') && (
            <View style={[styles.sideCol, isMobile && { width: '100%', borderRightWidth: 0 }]}>
              <View style={styles.sideColHeader}>
                <Text style={styles.sideColTitle}>EVENTOS PROGRAMADOS</Text>
                <TouchableOpacity
                  style={styles.sharpAddBtn}
                  onPress={() => setShowCreateEventoModal(true)}
                  activeOpacity={0.85}
                >
                  <Text style={styles.sharpAddBtnText}>+ CREAR EVENTO</Text>
                </TouchableOpacity>
              </View>

              <ScrollView style={{ flex: 1 }}>
                {eventos.map((eve) => {
                  const isSelected = selectedEvento?.id === eve.id;
                  return (
                    <TouchableOpacity
                      key={eve.id}
                      style={[styles.eventSquareItem, isSelected && styles.eventSquareItemSelected]}
                      onPress={() => {
                        setSelectedEventoId(eve.id);
                        if (isMobile) setMobileView('DETAIL');
                      }}
                      activeOpacity={0.8}
                    >
                      <View style={styles.typeBadgeRow}>
                        <View
                          style={[
                            styles.typeTag,
                            {
                              backgroundColor:
                                eve.tipo === 'TORNEO'
                                  ? colors.primary
                                  : eve.tipo === 'SEMINARIO'
                                  ? colors.accent
                                  : '#38BDF8',
                            },
                          ]}
                        >
                          <Text style={styles.typeTagText}>{eve.tipo}</Text>
                        </View>
                        <Text style={styles.eventItemDate}>{eve.fecha_evento}</Text>
                      </View>

                      <Text style={styles.eventItemTitle}>{eve.nombre}</Text>
                      <Text style={styles.eventItemMeta}>
                        {eve.lugar || 'Sede Central'} • {eve.alumnos_inscritos_ids?.length || 0} Alumnos
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>
            </View>
          )}

          {/* Columna / Vista Derecha: Detalle del Evento Seleccionado */}
          {(!isMobile || mobileView === 'DETAIL') && selectedEvento && (
            <ScrollView
              style={[styles.detailCol, isMobile && { width: '100%' }]}
              contentContainerStyle={[styles.detailColContent, isMobile && { padding: 14 }]}
            >
              {/* Botón Volver a la Lista en Celulares */}
              {isMobile && (
                <TouchableOpacity
                  style={styles.backToListBtn}
                  onPress={() => setMobileView('LIST')}
                  activeOpacity={0.85}
                >
                  <Text style={styles.backToListBtnText}>← VOLVER A LA LISTA DE EVENTOS</Text>
                </TouchableOpacity>
              )}

              <View style={styles.eventDetailCard}>
                <View style={styles.eventDetailHeader}>
                  <View style={{ flex: 1, gap: 6, minWidth: 260 }}>
                    <View style={styles.typeBadgeRow}>
                      <View style={styles.sharpOrangeTag}>
                        <Text style={styles.sharpOrangeTagText}>{selectedEvento.tipo}</Text>
                      </View>
                      <Text style={styles.detailStatus}>ESTADO: {selectedEvento.estado}</Text>
                    </View>
                    <Text style={styles.detailTitle}>{selectedEvento.nombre}</Text>
                    <Text style={styles.detailMetaLine}>
                      Fecha: {selectedEvento.fecha_evento} a las {selectedEvento.hora_evento || '09:00'} hrs • {selectedEvento.lugar}
                    </Text>
                    <Text style={styles.detailFee}>
                      Costo de Inscripción: ${selectedEvento.costo_inscripcion.toLocaleString('es-CL')} CLP
                    </Text>
                  </View>

                  <View style={[styles.detailActionsRow, isMobile && { flexDirection: 'column', width: '100%', marginTop: 12 }]}>
                    {/* Botón de Exportar Plantilla Oficial */}
                    <TouchableOpacity
                      style={styles.actionBtnHorizontal}
                      onPress={() => setShowExportModal(true)}
                      activeOpacity={0.85}
                    >
                      <Text style={styles.actionBtnHorizontalText}>EXPORTAR NÓMINA OFICIAL</Text>
                    </TouchableOpacity>

                    {/* Botón Eliminar Evento */}
                    <TouchableOpacity
                      style={[styles.actionBtnHorizontal, styles.actionBtnHorizontalDanger]}
                      onPress={() => {
                        if (confirm(`¿Estás seguro de eliminar el evento "${selectedEvento.nombre}"?`)) {
                          deleteEvento(selectedEvento.id);
                          if (isMobile) setMobileView('LIST');
                        }
                      }}
                      activeOpacity={0.85}
                    >
                      <Text style={[styles.actionBtnHorizontalText, { color: colors.danger }]}>ELIMINAR EVENTO</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </View>

              {/* Nómina de Alumnos Asignados al Evento */}
              <View style={styles.rosterCardSquare}>
                <View style={styles.rosterCardHeaderSquare}>
                  <View style={{ flex: 1, minWidth: 220 }}>
                    <Text style={styles.rosterCardTitleSquare}>
                      ALUMNOS ASIGNADOS ({enrolledInEvento.length})
                    </Text>
                    <Text style={styles.rosterCardSubSquare}>
                      Nómina de competidores / asistentes oficiales del dojo.
                    </Text>
                  </View>

                  <TouchableOpacity
                    style={[styles.manageRosterBtn, isMobile && { width: '100%', marginTop: 8 }]}
                    onPress={() => setShowAssignStudentsModal(true)}
                    activeOpacity={0.85}
                  >
                    <Text style={styles.manageRosterBtnText}>+ ASIGNAR / QUITAR ALUMNOS ({schoolStudents.length} DISPONIBLES)</Text>
                  </TouchableOpacity>
                </View>

                {/* Vista Escritorio: Tabla */}
                {!isMobile ? (
                  <View>
                    <View style={styles.tableHeaderSquare}>
                      <Text style={[styles.thText, { flex: 2 }]}>ALUMNO</Text>
                      <Text style={[styles.thText, { flex: 1.5 }]}>RUT</Text>
                      <Text style={[styles.thText, { flex: 1 }]}>EDAD</Text>
                      <Text style={[styles.thText, { flex: 1.5 }]}>GRADO</Text>
                      {selectedEvento.tipo !== 'SEMINARIO' && (
                        <Text style={[styles.thText, { flex: 2 }]}>CATEGORÍA</Text>
                      )}
                      <Text style={[styles.thText, { flex: 1, textAlign: 'right' }]}>ACCIÓN</Text>
                    </View>

                    {enrolledInEvento.length === 0 ? (
                      <View style={{ padding: 24, alignItems: 'center' }}>
                        <Text style={{ color: colors.textSecondary, fontSize: 13 }}>
                          No hay alumnos asignados a este evento aún. Haz clic en "+ ASIGNAR / QUITAR ALUMNOS" para agregarlos.
                        </Text>
                      </View>
                    ) : (
                      enrolledInEvento.map((s) => {
                        const cinturon = GRADOS_CINTURON.find((g) => g.id === s.cinturon_id) || GRADOS_CINTURON[0];
                        const edadNum = s.fecha_nacimiento ? calcularEdad(s.fecha_nacimiento) : 15;

                        return (
                          <View key={s.id} style={styles.tableRowSquare}>
                            <Text style={[styles.tdName, { flex: 2 }]} numberOfLines={1}>
                              {s.nombres} {s.apellidos}
                            </Text>
                            <Text style={[styles.tdMeta, { flex: 1.5 }]}>{s.rut || 'Sin RUT'}</Text>
                            <Text style={[styles.tdMeta, { flex: 1 }]}>{edadNum} años</Text>
                            <Text style={[styles.tdBelt, { flex: 1.5 }]}>{cinturon.nombre.split(' ')[0]}</Text>

                            {selectedEvento.tipo !== 'SEMINARIO' && (
                              <Text style={[styles.tdCategory, { flex: 2 }]} numberOfLines={1}>
                                {s.categoria_kumite_manual || s.categoria_kumite || 'Categoría por asignar'}
                              </Text>
                            )}

                            <View style={{ flex: 1, alignItems: 'flex-end' }}>
                              <TouchableOpacity
                                style={styles.removeBtn}
                                onPress={() => removeStudentFromEvento(selectedEvento.id, s.id)}
                              >
                                <Text style={styles.removeBtnText}>Quitar</Text>
                              </TouchableOpacity>
                            </View>
                          </View>
                        );
                      })
                    )}
                  </View>
                ) : (
                  /* Vista Móvil: Cards de Alumnos Asignados */
                  <View style={{ gap: 10 }}>
                    {enrolledInEvento.length === 0 ? (
                      <View style={{ padding: 20, alignItems: 'center' }}>
                        <Text style={{ color: colors.textSecondary, fontSize: 13, textAlign: 'center' }}>
                          No hay alumnos asignados a este evento aún.
                        </Text>
                      </View>
                    ) : (
                      enrolledInEvento.map((s) => {
                        const cinturon = GRADOS_CINTURON.find((g) => g.id === s.cinturon_id) || GRADOS_CINTURON[0];
                        const edadNum = s.fecha_nacimiento ? calcularEdad(s.fecha_nacimiento) : 15;

                        return (
                          <View key={s.id} style={styles.mobileEnrolledCard}>
                            <View style={{ flex: 1 }}>
                              <Text style={styles.mobileEnrolledName}>{s.nombres} {s.apellidos}</Text>
                              <Text style={styles.mobileEnrolledSub}>
                                {s.rut || 'Sin RUT'} • {edadNum} años • <Text style={{ color: colors.accent, fontWeight: '700' }}>{cinturon.nombre}</Text>
                              </Text>
                              {selectedEvento.tipo !== 'SEMINARIO' && (
                                <Text style={styles.mobileEnrolledCat}>
                                  {s.categoria_kumite_manual || s.categoria_kumite || 'Categoría por asignar'}
                                </Text>
                              )}
                            </View>
                            <TouchableOpacity
                              style={styles.removeBtnMobile}
                              onPress={() => removeStudentFromEvento(selectedEvento.id, s.id)}
                            >
                              <Text style={styles.removeBtnText}>✕</Text>
                            </TouchableOpacity>
                          </View>
                        );
                      })
                    )}
                  </View>
                )}
              </View>
            </ScrollView>
          )}
        </View>
      )}

      {/* ========================================================
          SUB-MÓDULO 2: EXÁMENES DE GRADO
         ======================================================== */}
      {subModule === 'EXAMENES' && (
        <View style={[styles.contentRow, isMobile && { flexDirection: 'column' }]}>
          {/* Columna / Vista Izquierda: Exámenes de Grado Creados */}
          {(!isMobile || mobileView === 'LIST') && (
            <View style={[styles.sideCol, isMobile && { width: '100%', borderRightWidth: 0 }]}>
              <View style={styles.sideColHeader}>
                <Text style={styles.sideColTitle}>TOMAS DE EXÁMENES</Text>
                <TouchableOpacity
                  style={styles.sharpAddBtn}
                  onPress={() => setShowCreateExamenModal(true)}
                  activeOpacity={0.85}
                >
                  <Text style={styles.sharpAddBtnText}>+ NUEVA TOMA</Text>
                </TouchableOpacity>
              </View>

              <ScrollView style={{ flex: 1 }}>
                {examenes.map((ex) => {
                  const isSelected = selectedExamen?.id === ex.id;
                  const candidatesCount = examCandidates.filter((c) => c.examen_id === ex.id).length;

                  return (
                    <TouchableOpacity
                      key={ex.id}
                      style={[styles.eventSquareItem, isSelected && styles.eventSquareItemSelected]}
                      onPress={() => {
                        setSelectedExamenId(ex.id);
                        if (isMobile) setMobileView('DETAIL');
                      }}
                      activeOpacity={0.8}
                    >
                      <View style={styles.typeBadgeRow}>
                        <View style={[styles.typeTag, { backgroundColor: colors.accent }]}>
                          <Text style={styles.typeTagText}>EXAMEN DE GRADO</Text>
                        </View>
                        <Text style={styles.eventItemDate}>{ex.fecha_examen}</Text>
                      </View>

                      <Text style={styles.eventItemTitle}>{ex.nombre}</Text>
                      <Text style={styles.eventItemMeta}>
                        Derecho: ${ex.costo_derecho_examen.toLocaleString('es-CL')} • {candidatesCount} Postulantes
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>
            </View>
          )}

          {/* Columna / Vista Derecha: Detalle del Examen de Grado Seleccionado */}
          {(!isMobile || mobileView === 'DETAIL') && selectedExamen && (
            <ScrollView
              style={[styles.detailCol, isMobile && { width: '100%' }]}
              contentContainerStyle={[styles.detailColContent, isMobile && { padding: 14 }]}
            >
              {/* Botón Volver a la Lista en Celulares */}
              {isMobile && (
                <TouchableOpacity
                  style={styles.backToListBtn}
                  onPress={() => setMobileView('LIST')}
                  activeOpacity={0.85}
                >
                  <Text style={styles.backToListBtnText}>← VOLVER A LA LISTA DE EXÁMENES</Text>
                </TouchableOpacity>
              )}

              <View style={styles.eventDetailCard}>
                <View style={styles.eventDetailHeader}>
                  <View style={{ flex: 1, gap: 6, minWidth: 260 }}>
                    <View style={styles.typeBadgeRow}>
                      <View style={[styles.sharpOrangeTag, { backgroundColor: 'rgba(245, 158, 11, 0.15)', borderColor: colors.accent }]}>
                        <Text style={[styles.sharpOrangeTagText, { color: colors.accent }]}>EVALUACIÓN TÉCNICA DE CINTURÓN</Text>
                      </View>
                      <Text style={styles.detailStatus}>ESTADO: {selectedExamen.estado}</Text>
                    </View>
                    <Text style={styles.detailTitle}>{selectedExamen.nombre}</Text>
                    <Text style={styles.detailMetaLine}>
                      Fecha: {selectedExamen.fecha_examen} • Derecho de Examen: ${selectedExamen.costo_derecho_examen.toLocaleString('es-CL')} CLP
                    </Text>
                  </View>

                  <View style={[styles.detailActionsRow, isMobile && { flexDirection: 'column', width: '100%', marginTop: 12 }]}>
                    <TouchableOpacity
                      style={[styles.actionBtnHorizontal, styles.actionBtnHorizontalSuccess]}
                      onPress={handleFinalizeAscensos}
                      activeOpacity={0.85}
                    >
                      <Text style={[styles.actionBtnHorizontalText, { color: colors.success }]}>CONFIRMAR ASCENSOS</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={[styles.actionBtnHorizontal, styles.actionBtnHorizontalDanger]}
                      onPress={() => {
                        if (confirm(`¿Estás seguro de eliminar la toma de exámenes "${selectedExamen.nombre}"?`)) {
                          deleteExamen(selectedExamen.id);
                          if (isMobile) setMobileView('LIST');
                        }
                      }}
                      activeOpacity={0.85}
                    >
                      <Text style={[styles.actionBtnHorizontalText, { color: colors.danger }]}>ELIMINAR EXAMEN</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </View>

              {/* CONTENEDOR DE EVALUACIÓN DE GRADO */}
              <View style={styles.rosterCardSquare}>
                <View style={styles.rosterCardHeaderSquare}>
                  <View style={{ flex: 1, minWidth: 220 }}>
                    <Text style={styles.rosterCardTitleSquare}>
                      NÓMINA DE EVALUACIÓN TÉCNICA ({candidatesInExam.length} POSTULANTES)
                    </Text>
                    <Text style={styles.rosterCardSubSquare}>
                      Elige para cada alumno si fue PROMOVIDO, DENEGADO o PROLONGADO según su desempeño.
                    </Text>
                  </View>

                  <TouchableOpacity
                    style={[styles.manageRosterBtn, isMobile && { width: '100%', marginTop: 8 }]}
                    onPress={() => setShowAssignCandidatesModal(true)}
                  >
                    <Text style={styles.manageRosterBtnText}>+ AGREGAR / QUITAR POSTULANTES ({schoolStudents.length} DISPONIBLES)</Text>
                  </TouchableOpacity>
                </View>

                <View style={styles.candidatesGrid}>
                  {candidatesInExam.length === 0 ? (
                    <View style={{ padding: 24, alignItems: 'center' }}>
                      <Text style={{ color: colors.textSecondary, fontSize: 13, textAlign: 'center' }}>
                        No hay postulantes agregados a este examen aún. Haz clic en "+ AGREGAR / QUITAR POSTULANTES".
                      </Text>
                    </View>
                  ) : (
                    candidatesInExam.map((cand) => {
                      const student = students.find((s) => s.id === cand.alumno_id);
                      const actualBelt = GRADOS_CINTURON.find((g) => g.id === cand.grado_actual_id) || GRADOS_CINTURON[0];
                      const nextBelt = GRADOS_CINTURON.find((g) => g.id === cand.grado_postulado_id) || GRADOS_CINTURON[2];
                      const isUpToDate = isStudentUpToDate(cand.alumno_id);

                      return (
                        <View key={cand.id} style={styles.evaluationItemSquare}>
                          <View style={[styles.candHeaderRow, isMobile && { flexDirection: 'column', gap: 8 }]}>
                            <View style={{ flex: 1 }}>
                              <Text style={styles.candNameSquare}>
                                {student ? `${student.nombres} ${student.apellidos}` : 'Alumno'}
                              </Text>
                              <Text style={styles.candBeltsProgression}>
                                Cinturón Actual: <Text style={{ color: colors.textPrimary, fontWeight: '800' }}>{actualBelt.nombre}</Text> ➔ Postula a: <Text style={{ color: colors.accent, fontWeight: '900' }}>{nextBelt.nombre}</Text>
                              </Text>
                            </View>

                            <View style={[styles.badgePillSharp, !isUpToDate && { backgroundColor: 'rgba(239, 68, 68, 0.15)', borderColor: colors.danger }]}>
                              <Text style={[styles.badgePillSharpText, !isUpToDate && { color: colors.danger }]}>
                                {isUpToDate ? 'CUOTA AL DÍA' : 'PENDIENTE PAGO'}
                              </Text>
                            </View>
                          </View>

                          {/* Dictamen */}
                          <View style={styles.evaluationButtonBar}>
                            <Text style={styles.evalLabel}>DICTAMEN DEL EXAMEN:</Text>
                            <View style={[styles.evalButtonsRow, isMobile && { flexDirection: 'column' }]}>
                              <TouchableOpacity
                                style={[
                                  styles.evalChoiceBtn,
                                  cand.resultado === 'PROMOVIDO' && styles.evalChoicePromovido,
                                ]}
                                onPress={() => updateCandidateResult(cand.id, 'PROMOVIDO')}
                              >
                                <Text style={[styles.evalChoiceText, cand.resultado === 'PROMOVIDO' && styles.evalChoiceTextActive]}>
                                  PROMOVIDO
                                </Text>
                              </TouchableOpacity>

                              <TouchableOpacity
                                style={[
                                  styles.evalChoiceBtn,
                                  cand.resultado === 'PROLONGADO' && styles.evalChoiceProlongado,
                                ]}
                                onPress={() => updateCandidateResult(cand.id, 'PROLONGADO')}
                              >
                                <Text style={[styles.evalChoiceText, cand.resultado === 'PROLONGADO' && styles.evalChoiceTextActive]}>
                                  PROLONGADO
                                </Text>
                              </TouchableOpacity>

                              <TouchableOpacity
                                style={[
                                  styles.evalChoiceBtn,
                                  cand.resultado === 'DENEGADO' && styles.evalChoiceDenegado,
                                ]}
                                onPress={() => updateCandidateResult(cand.id, 'DENEGADO')}
                              >
                                <Text style={[styles.evalChoiceText, cand.resultado === 'DENEGADO' && styles.evalChoiceTextActive]}>
                                  DENEGADO
                                </Text>
                              </TouchableOpacity>
                            </View>
                          </View>

                          <View style={styles.obsContainer}>
                            <Text style={styles.obsLabel}>Observaciones de Evaluación:</Text>
                            <TextInput
                              style={styles.obsInput}
                              value={cand.observaciones || ''}
                              onChangeText={(val) => updateCandidateResult(cand.id, cand.resultado, val)}
                              placeholder="Ej: Buena ejecución técnica de Kata, reforzar bloqueo Soto Uke..."
                              placeholderTextColor="#64748B"
                            />
                          </View>
                        </View>
                      );
                    })
                  )}
                </View>
              </View>
            </ScrollView>
          )}
        </View>
      )}

      {/* ========================================================
          MODAL: ASIGNAR ALUMNOS AL EVENTO (Con Grupos Etarios)
         ======================================================== */}
      {showAssignStudentsModal && selectedEvento && (
        <Modal transparent animationType="fade" visible={showAssignStudentsModal}>
          <View style={styles.modalOverlay}>
            <View style={[styles.modalCardSquare, isMobile && { width: '96%', maxHeight: '92%' }]}>
              <View style={styles.modalRibbon}>
                <Text style={styles.modalRibbonText}>CONVOCATORIA PARA: {selectedEvento.nombre.toUpperCase()}</Text>
              </View>

              <View style={styles.modalBody}>
                {/* Filtro rápido por grupos etarios */}
                <Text style={styles.modalLabel}>Filtrar / Marcar por Grupo Etario:</Text>
                <View style={{ flexDirection: 'row', gap: 6, flexWrap: 'wrap', marginBottom: 12 }}>
                  {gruposEtarios.map((g) => {
                    const isChecked = selectedGruposEvento.includes(g.key);
                    return (
                      <TouchableOpacity
                        key={g.key}
                        style={[styles.groupPillBtn, isChecked && styles.groupPillBtnActive]}
                        onPress={() => {
                          if (isChecked) {
                            setSelectedGruposEvento(selectedGruposEvento.filter((k) => k !== g.key));
                          } else {
                            setSelectedGruposEvento([...selectedGruposEvento, g.key]);
                          }
                        }}
                      >
                        <Text style={[styles.groupPillBtnText, isChecked && styles.groupPillBtnTextActive]}>
                          {isChecked ? '✓ ' : ''}{g.label}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>

                <View style={{ flexDirection: 'row', gap: 10, marginBottom: 12 }}>
                  <TouchableOpacity
                    style={styles.quickActionBtn}
                    onPress={() => {
                      const groupEligibleIds = schoolStudents
                        .filter((s) => selectedGruposEvento.includes(s.seccion_id || '') && isStudentUpToDate(s.id))
                        .map((s) => s.id);
                      assignStudentsToEvento(selectedEvento.id, groupEligibleIds);
                    }}
                  >
                    <Text style={styles.quickActionBtnText}>Marcar Al Día de Estos Grupos</Text>
                  </TouchableOpacity>
                </View>

                {/* Lista Completa de Alumnos con su estado de mensualidad */}
                <Text style={styles.modalLabel}>
                  Nómina de Alumnos ({schoolStudents.length} Registrados — Requiere Mensualidad al Día):
                </Text>
                <ScrollView style={{ maxHeight: 280, marginTop: 4 }}>
                  <View style={{ gap: 6 }}>
                    {schoolStudents
                      .filter((s) => selectedGruposEvento.length === 0 || selectedGruposEvento.includes(s.seccion_id || ''))
                      .map((s) => {
                        const isEnrolled = selectedEvento.alumnos_inscritos_ids.includes(s.id);
                        const isUpToDate = isStudentUpToDate(s.id);
                        const cinturon = GRADOS_CINTURON.find((g) => g.id === s.cinturon_id) || GRADOS_CINTURON[0];

                        return (
                          <TouchableOpacity
                            key={s.id}
                            disabled={!isUpToDate && !isEnrolled}
                            style={[
                              styles.eligibleStudentRow,
                              isEnrolled && styles.eligibleStudentRowChecked,
                              !isUpToDate && !isEnrolled && { opacity: 0.5, borderColor: 'rgba(239, 68, 68, 0.3)' },
                            ]}
                            onPress={() => {
                              if (isEnrolled) {
                                removeStudentFromEvento(selectedEvento.id, s.id);
                              } else if (isUpToDate) {
                                assignStudentsToEvento(selectedEvento.id, [s.id]);
                              }
                            }}
                          >
                            <View style={{ flex: 1 }}>
                              <Text style={[styles.eligibleStudentName, !isUpToDate && !isEnrolled && { color: colors.textSecondary }]}>
                                {isEnrolled ? '✓ ' : '○ '} {s.nombres} {s.apellidos}
                              </Text>
                              <Text style={{ color: colors.textSecondary, fontSize: 11, marginTop: 1 }}>
                                {cinturon.nombre}
                              </Text>
                            </View>

                            <View style={{ flexDirection: 'row', gap: 6, alignItems: 'center' }}>
                              <View
                                style={[
                                  styles.badgePillSharp,
                                  isUpToDate
                                    ? { backgroundColor: 'rgba(16, 185, 129, 0.15)', borderColor: colors.success }
                                    : { backgroundColor: 'rgba(239, 68, 68, 0.15)', borderColor: colors.danger },
                                ]}
                              >
                                <Text
                                  style={[
                                    styles.badgePillSharpText,
                                    { color: isUpToDate ? colors.success : colors.danger },
                                  ]}
                                >
                                  {isUpToDate ? 'PAGADO (ELEGIBLE)' : 'DEUDA (NO ELEGIBLE)'}
                                </Text>
                              </View>
                            </View>
                          </TouchableOpacity>
                        );
                      })}
                  </View>
                </ScrollView>

                <View style={styles.modalActions}>
                  <TouchableOpacity
                    style={styles.confirmSquareBtn}
                    onPress={() => setShowAssignStudentsModal(false)}
                  >
                    <Text style={styles.confirmSquareBtnText}>GUARDAR NÓMINA DE ATLETAS</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </View>
        </Modal>
      )}

      {/* ========================================================
          MODAL: AGREGAR / QUITAR POSTULANTES AL EXAMEN
         ======================================================== */}
      {showAssignCandidatesModal && selectedExamen && (
        <Modal transparent animationType="fade" visible={showAssignCandidatesModal}>
          <View style={styles.modalOverlay}>
            <View style={[styles.modalCardSquare, isMobile && { width: '96%', maxHeight: '92%' }]}>
              <View style={[styles.modalRibbon, { backgroundColor: colors.accent }]}>
                <Text style={styles.modalRibbonText}>POSTULANTES A: {selectedExamen.nombre.toUpperCase()}</Text>
              </View>

              <View style={styles.modalBody}>
                <Text style={styles.modalLabel}>
                  Selecciona alumnos a incorporar al examen ({schoolStudents.length} registrados — Requiere Mensualidad al Día):
                </Text>

                <ScrollView style={{ maxHeight: 300, marginTop: 8 }}>
                  <View style={{ gap: 6 }}>
                    {schoolStudents.map((s) => {
                      const isCandidate = examCandidates.some(
                        (c) => c.examen_id === selectedExamen.id && c.alumno_id === s.id
                      );
                      const isUpToDate = isStudentUpToDate(s.id);
                      const cinturon = GRADOS_CINTURON.find((g) => g.id === s.cinturon_id) || GRADOS_CINTURON[0];

                      return (
                        <TouchableOpacity
                          key={s.id}
                          disabled={!isUpToDate && !isCandidate}
                          style={[
                            styles.eligibleStudentRow,
                            isCandidate && styles.eligibleStudentRowChecked,
                            !isUpToDate && !isCandidate && { opacity: 0.5, borderColor: 'rgba(239, 68, 68, 0.3)' },
                          ]}
                          onPress={() => {
                            if (!isCandidate && isUpToDate) {
                              addExamCandidates(selectedExamen.id, [s.id]);
                            }
                          }}
                        >
                          <View style={{ flex: 1 }}>
                            <Text style={[styles.eligibleStudentName, !isUpToDate && !isCandidate && { color: colors.textSecondary }]}>
                              {isCandidate ? '✓ ' : '○ '} {s.nombres} {s.apellidos}
                            </Text>
                            <Text style={{ color: colors.textSecondary, fontSize: 11, marginTop: 2 }}>
                              {cinturon.nombre}
                            </Text>
                          </View>

                          <View
                            style={[
                              styles.badgePillSharp,
                              isUpToDate
                                ? { backgroundColor: 'rgba(16, 185, 129, 0.15)', borderColor: colors.success }
                                : { backgroundColor: 'rgba(239, 68, 68, 0.15)', borderColor: colors.danger },
                            ]}
                          >
                            <Text
                              style={[
                                styles.badgePillSharpText,
                                { color: isUpToDate ? colors.success : colors.danger },
                              ]}
                            >
                              {isUpToDate ? 'PAGADO (ELEGIBLE)' : 'DEUDA (NO ELEGIBLE)'}
                            </Text>
                          </View>
                        </TouchableOpacity>
                      );
                    })}
                  </View>
                </ScrollView>

                <View style={styles.modalActions}>
                  <TouchableOpacity
                    style={styles.confirmSquareBtn}
                    onPress={() => setShowAssignCandidatesModal(false)}
                  >
                    <Text style={styles.confirmSquareBtnText}>LISTO ➔</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </View>
        </Modal>
      )}

      {/* ========================================================
          MODAL: CREAR NUEVO EVENTO
         ======================================================== */}
      {showCreateEventoModal && (
        <Modal transparent animationType="fade" visible={showCreateEventoModal}>
          <View style={styles.modalOverlay}>
            <View style={[styles.modalCardSquare, isMobile && { width: '96%', maxHeight: '92%' }]}>
              <View style={styles.modalRibbon}>
                <Text style={styles.modalRibbonText}>CREAR RECURSO EVENTO / COMPETENCIA</Text>
              </View>

              <ScrollView style={styles.modalBody}>
                <View style={styles.formGroup}>
                  <Text style={styles.modalLabel}>Tipo de Evento:</Text>
                  <View style={{ flexDirection: 'row', gap: 8, flexWrap: 'wrap' }}>
                    {(['TORNEO', 'SEMINARIO', 'EVENTO_ESPECIAL'] as TipoEvento[]).map((t) => (
                      <TouchableOpacity
                        key={t}
                        style={[styles.typeSelectBtn, newEveTipo === t && styles.typeSelectBtnActive]}
                        onPress={() => setNewEveTipo(t)}
                      >
                        <Text style={[styles.typeSelectBtnText, newEveTipo === t && styles.typeSelectBtnTextActive]}>
                          {t.replace('_', ' ')}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>

                <View style={styles.formGroup}>
                  <Text style={styles.modalLabel}>Nombre del Evento:</Text>
                  <TextInput
                    style={styles.modalInputSquare}
                    value={newEveNombre}
                    onChangeText={setNewEveNombre}
                    placeholder="Ej: Campeonato Zonal Rancagua 2026, Seminario de Bunkai..."
                    placeholderTextColor="#64748B"
                  />
                </View>

                <View style={[styles.formRow, isMobile && { flexDirection: 'column', gap: 0 }]}>
                  <View style={[styles.formGroup, { flex: 1 }]}>
                    <Text style={styles.modalLabel}>Fecha (AAAA-MM-DD):</Text>
                    <TextInput
                      style={styles.modalInputSquare}
                      value={newEveFecha}
                      onChangeText={setNewEveFecha}
                      placeholder="2026-06-20"
                      placeholderTextColor="#64748B"
                    />
                  </View>
                  <View style={[styles.formGroup, { flex: 1 }]}>
                    <Text style={styles.modalLabel}>Hora:</Text>
                    <TextInput
                      style={styles.modalInputSquare}
                      value={newEveHora}
                      onChangeText={setNewEveHora}
                      placeholder="09:00"
                      placeholderTextColor="#64748B"
                    />
                  </View>
                </View>

                <View style={[styles.formRow, isMobile && { flexDirection: 'column', gap: 0 }]}>
                  <View style={[styles.formGroup, { flex: 1.5 }]}>
                    <Text style={styles.modalLabel}>Lugar / Recinto:</Text>
                    <TextInput
                      style={styles.modalInputSquare}
                      value={newEveLugar}
                      onChangeText={setNewEveLugar}
                      placeholder="Ej: Polideportivo Lourdes, Rancagua"
                      placeholderTextColor="#64748B"
                    />
                  </View>
                  <View style={[styles.formGroup, { flex: 1 }]}>
                    <Text style={styles.modalLabel}>Costo Inscripción (CLP):</Text>
                    <TextInput
                      style={styles.modalInputSquare}
                      value={newEveCosto}
                      onChangeText={setNewEveCosto}
                      placeholder="15000"
                      placeholderTextColor="#64748B"
                      keyboardType="numeric"
                    />
                  </View>
                </View>

                <View style={styles.modalActions}>
                  <TouchableOpacity style={styles.cancelSquareBtn} onPress={() => setShowCreateEventoModal(false)}>
                    <Text style={styles.cancelSquareBtnText}>CANCELAR</Text>
                  </TouchableOpacity>

                  <TouchableOpacity style={styles.confirmSquareBtn} onPress={handleCreateEvento}>
                    <Text style={styles.confirmSquareBtnText}>CREAR EVENTO ➔</Text>
                  </TouchableOpacity>
                </View>
              </ScrollView>
            </View>
          </View>
        </Modal>
      )}

      {/* ========================================================
          MODAL: CREAR NUEVA TOMA DE EXAMEN
         ======================================================== */}
      {showCreateExamenModal && (
        <Modal transparent animationType="fade" visible={showCreateExamenModal}>
          <View style={styles.modalOverlay}>
            <View style={[styles.modalCardSquare, isMobile && { width: '96%', maxHeight: '92%' }]}>
              <View style={[styles.modalRibbon, { backgroundColor: colors.accent }]}>
                <Text style={styles.modalRibbonText}>CREAR RECURSO DE EXAMEN DE GRADO</Text>
              </View>

              <ScrollView style={styles.modalBody}>
                <View style={styles.formGroup}>
                  <Text style={styles.modalLabel}>Nombre de la Convocatoria de Examen:</Text>
                  <TextInput
                    style={styles.modalInputSquare}
                    value={newExNombre}
                    onChangeText={setNewExNombre}
                    placeholder="Ej: Toma de Exámenes de Grado — Mes Junio 2026"
                    placeholderTextColor="#64748B"
                  />
                </View>

                <View style={[styles.formRow, isMobile && { flexDirection: 'column', gap: 0 }]}>
                  <View style={[styles.formGroup, { flex: 1 }]}>
                    <Text style={styles.modalLabel}>Fecha de Examen (AAAA-MM-DD):</Text>
                    <TextInput
                      style={styles.modalInputSquare}
                      value={newExFecha}
                      onChangeText={setNewExFecha}
                      placeholder="2026-06-27"
                      placeholderTextColor="#64748B"
                    />
                  </View>

                  <View style={[styles.formGroup, { flex: 1 }]}>
                    <Text style={styles.modalLabel}>Precio Derecho a Examen (CLP):</Text>
                    <TextInput
                      style={styles.modalInputSquare}
                      value={newExCosto}
                      onChangeText={setNewExCosto}
                      placeholder="25000"
                      placeholderTextColor="#64748B"
                      keyboardType="numeric"
                    />
                  </View>
                </View>

                <View style={styles.modalActions}>
                  <TouchableOpacity style={styles.cancelSquareBtn} onPress={() => setShowCreateExamenModal(false)}>
                    <Text style={styles.cancelSquareBtnText}>CANCELAR</Text>
                  </TouchableOpacity>

                  <TouchableOpacity style={styles.confirmSquareBtn} onPress={handleCreateExamen}>
                    <Text style={styles.confirmSquareBtnText}>CREAR RECURSO DE EXAMEN ➔</Text>
                  </TouchableOpacity>
                </View>
              </ScrollView>
            </View>
          </View>
        </Modal>
      )}

      {/* ========================================================
          MODAL: EXPORTAR PLANTILLA OFICIAL DE EVENTO (NÓMINA)
         ======================================================== */}
      {showExportModal && selectedEvento && (
        <Modal transparent animationType="fade" visible={showExportModal}>
          <View style={styles.modalOverlay}>
            <View style={[styles.exportModalSquare, isMobile && { width: '96%', maxHeight: '92%' }]}>
              <View style={styles.exportHeader}>
                <Text style={styles.exportTitle}>
                  PLANILLA OFICIAL DE ACREDITACIÓN — {selectedEvento.nombre.toUpperCase()}
                </Text>
                <Text style={styles.exportSub}>
                  Sede: {currentAcademia?.nombre} • Fecha: {selectedEvento.fecha_evento} • Total: {enrolledInEvento.length} Atletas
                </Text>
              </View>

              <ScrollView style={{ maxHeight: 380, padding: 14 }}>
                <View style={styles.exportTableHead}>
                  <Text style={[styles.exportTh, { flex: 2 }]}>NOMBRE COMPLETO</Text>
                  <Text style={[styles.exportTh, { flex: 1.5 }]}>RUT</Text>
                  <Text style={[styles.exportTh, { flex: 1 }]}>EDAD</Text>
                  <Text style={[styles.exportTh, { flex: 1.5 }]}>GRADO</Text>
                  {selectedEvento.tipo !== 'SEMINARIO' && (
                    <Text style={[styles.exportTh, { flex: 2 }]}>CATEGORÍA</Text>
                  )}
                </View>

                {enrolledInEvento.map((s, idx) => {
                  const cinturon = GRADOS_CINTURON.find((g) => g.id === s.cinturon_id) || GRADOS_CINTURON[0];
                  const edadNum = s.fecha_nacimiento ? calcularEdad(s.fecha_nacimiento) : 15;

                  return (
                    <View key={s.id} style={[styles.exportTableRow, idx % 2 === 1 && { backgroundColor: colors.bgDarkest }]}>
                      <Text style={[styles.exportTd, { flex: 2, fontWeight: '800', color: colors.textPrimary }]} numberOfLines={1}>
                        {s.nombres} {s.apellidos}
                      </Text>
                      <Text style={[styles.exportTd, { flex: 1.5 }]}>{s.rut || 'No informado'}</Text>
                      <Text style={[styles.exportTd, { flex: 1 }]}>{edadNum} años</Text>
                      <Text style={[styles.exportTd, { flex: 1.5, color: colors.accent }]}>{cinturon.nombre}</Text>

                      {selectedEvento.tipo !== 'SEMINARIO' && (
                        <Text style={[styles.exportTd, { flex: 2, color: colors.primary }]} numberOfLines={1}>
                          {s.categoria_kumite_manual || s.categoria_kumite || 'Por clasificar'}
                        </Text>
                      )}
                    </View>
                  );
                })}
              </ScrollView>

              <View style={[styles.exportModalFooter, isMobile && { flexDirection: 'column', gap: 10, alignItems: 'stretch' }]}>
                <Text style={styles.exportNotice}>
                  {selectedEvento.tipo === 'SEMINARIO'
                    ? '✓ Seminario técnico: Categorías omitidas por reglamento.'
                    : '✓ Torneo / Competencia: Nómina oficial con peso y categorías para mesa de acreditación.'}
                </Text>
                <View style={{ flexDirection: 'row', gap: 10, flexWrap: 'wrap' }}>
                  <TouchableOpacity
                    style={[styles.closeExportBtn, { backgroundColor: colors.accent }]}
                    onPress={() => {
                      if (typeof window !== 'undefined' && window.print) {
                        window.print();
                      }
                    }}
                    activeOpacity={0.85}
                  >
                    <Text style={[styles.closeExportBtnText, { color: '#000000' }]}>GUARDAR PDF / IMPRIMIR NÓMINA</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.closeExportBtn}
                    onPress={() => setShowExportModal(false)}
                    activeOpacity={0.85}
                  >
                    <Text style={styles.closeExportBtnText}>CERRAR VISTA PREVIA ✕</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </View>
        </Modal>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bgDarkest,
    width: '100%',
    maxWidth: '100%',
    overflow: 'hidden',
  },
  topSelectorBar: {
    flexDirection: 'row',
    backgroundColor: colors.bgDark,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  moduleTabSquare: {
    flex: 1,
    paddingVertical: 14,
    alignItems: 'center',
    borderRightWidth: 1,
    borderRightColor: colors.border,
  },
  moduleTabSquareActive: {
    backgroundColor: colors.bgCard,
    borderBottomWidth: 3,
    borderBottomColor: colors.primary,
  },
  moduleTabText: {
    color: colors.textSecondary,
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  moduleTabTextActive: {
    color: colors.textPrimary,
  },
  toastSuccess: {
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
    borderBottomWidth: 1,
    borderBottomColor: colors.success,
    padding: 12,
    alignItems: 'center',
  },
  toastSuccessText: {
    color: colors.success,
    fontSize: 12,
    fontWeight: '900',
    textAlign: 'center',
  },
  contentRow: {
    flex: 1,
    flexDirection: 'row',
  },
  sideCol: {
    width: 340,
    borderRightWidth: 1,
    borderRightColor: colors.border,
    backgroundColor: colors.bgDark,
  },
  sideColHeader: {
    padding: 14,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  sideColTitle: {
    color: colors.textSecondary,
    fontSize: 11,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  sharpAddBtn: {
    backgroundColor: colors.primary,
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: radii.md,
  },
  sharpAddBtnText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '900',
  },
  eventSquareItem: {
    padding: 14,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    gap: 6,
  },
  eventSquareItemSelected: {
    backgroundColor: colors.bgCard,
    borderLeftWidth: 3,
    borderLeftColor: colors.primary,
  },
  typeBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  typeTag: {
    paddingVertical: 2,
    paddingHorizontal: 6,
    borderRadius: radii.sm,
  },
  typeTagText: {
    color: '#FFFFFF',
    fontSize: 9,
    fontWeight: '900',
  },
  eventItemDate: {
    color: colors.textSecondary,
    fontSize: 10,
    fontWeight: '700',
  },
  eventItemTitle: {
    color: colors.textPrimary,
    fontSize: 14,
    fontWeight: '800',
  },
  eventItemMeta: {
    color: colors.textSecondary,
    fontSize: 11,
  },
  detailCol: {
    flex: 1,
  },
  detailColContent: {
    padding: 24,
    gap: 20,
    maxWidth: 1100,
    alignSelf: 'center',
    width: '100%',
  },
  backToListBtn: {
    backgroundColor: colors.bgCard,
    borderWidth: 1,
    borderColor: colors.border,
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: radii.md,
    alignItems: 'center',
  },
  backToListBtnText: {
    color: colors.primary,
    fontSize: 11,
    fontWeight: '900',
  },
  eventDetailCard: {
    backgroundColor: colors.bgCard,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.lg,
    padding: 20,
  },
  eventDetailHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: 16,
    flexWrap: 'wrap',
  },
  sharpOrangeTag: {
    backgroundColor: 'rgba(255, 107, 0, 0.15)',
    borderWidth: 1,
    borderColor: colors.primary,
    paddingVertical: 2,
    paddingHorizontal: 8,
    borderRadius: radii.sm,
  },
  sharpOrangeTagText: {
    color: colors.primary,
    fontSize: 10,
    fontWeight: '900',
  },
  detailStatus: {
    color: colors.success,
    fontSize: 11,
    fontWeight: '800',
  },
  detailTitle: {
    color: colors.textPrimary,
    fontSize: 20,
    fontWeight: '900',
    marginTop: 4,
  },
  detailMetaLine: {
    color: colors.textSecondary,
    fontSize: 13,
  },
  detailFee: {
    color: colors.accent,
    fontSize: 13,
    fontWeight: '800',
  },
  detailActionsRow: {
    flexDirection: 'row',
    gap: 10,
    alignItems: 'center',
  },
  actionBtnHorizontal: {
    backgroundColor: colors.bgDark,
    borderWidth: 1,
    borderColor: colors.primary,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: radii.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionBtnHorizontalDanger: {
    borderColor: colors.danger,
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
  },
  actionBtnHorizontalSuccess: {
    borderColor: colors.success,
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
  },
  actionBtnHorizontalText: {
    color: colors.primary,
    fontSize: 11,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  exportTemplateBtn: {
    backgroundColor: colors.bgDark,
    borderWidth: 1,
    borderColor: colors.primary,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: radii.md,
    alignItems: 'center',
  },
  exportTemplateBtnText: {
    color: colors.primary,
    fontSize: 11,
    fontWeight: '900',
  },
  exportTemplateBtnSub: {
    color: colors.textSecondary,
    fontSize: 9,
    marginTop: 2,
  },
  deleteResourceBtn: {
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    borderWidth: 1,
    borderColor: colors.danger,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: radii.md,
    alignItems: 'center',
  },
  deleteResourceBtnText: {
    color: colors.danger,
    fontSize: 10,
    fontWeight: '900',
  },
  finalizeExamBtn: {
    backgroundColor: colors.success,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: radii.md,
    alignItems: 'center',
  },
  finalizeExamBtnText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '900',
  },
  finalizeExamBtnSub: {
    color: '#A7F3D0',
    fontSize: 9,
    marginTop: 2,
  },
  rosterCardSquare: {
    backgroundColor: colors.bgCard,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.lg,
    padding: 20,
  },
  rosterCardHeaderSquare: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    paddingBottom: 14,
    marginBottom: 16,
    flexWrap: 'wrap',
    gap: 10,
  },
  rosterCardTitleSquare: {
    color: colors.textPrimary,
    fontSize: 14,
    fontWeight: '900',
  },
  rosterCardSubSquare: {
    color: colors.textSecondary,
    fontSize: 12,
    marginTop: 2,
  },
  manageRosterBtn: {
    backgroundColor: colors.primary,
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: radii.md,
  },
  manageRosterBtnText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '900',
  },
  tableHeaderSquare: {
    flexDirection: 'row',
    backgroundColor: colors.bgDark,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    borderRadius: radii.md,
  },
  thText: {
    color: colors.textSecondary,
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  tableRowSquare: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  tdName: {
    color: colors.textPrimary,
    fontSize: 13,
    fontWeight: '700',
  },
  tdMeta: {
    color: colors.textSecondary,
    fontSize: 11,
  },
  tdBelt: {
    color: colors.accent,
    fontSize: 12,
    fontWeight: '800',
  },
  tdCategory: {
    color: colors.primary,
    fontSize: 11,
    fontWeight: '700',
  },
  removeBtn: {
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderWidth: 1,
    borderColor: colors.danger,
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    borderRadius: radii.sm,
  },
  removeBtnText: {
    color: colors.danger,
    fontSize: 10,
    fontWeight: '800',
  },
  mobileEnrolledCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: colors.bgDark,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 12,
    borderRadius: radii.md,
    gap: 8,
  },
  mobileEnrolledName: {
    color: colors.textPrimary,
    fontSize: 13,
    fontWeight: '800',
  },
  mobileEnrolledSub: {
    color: colors.textSecondary,
    fontSize: 11,
    marginTop: 2,
  },
  mobileEnrolledCat: {
    color: colors.primary,
    fontSize: 11,
    fontWeight: '700',
    marginTop: 2,
  },
  removeBtnMobile: {
    padding: 8,
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    borderWidth: 1,
    borderColor: colors.danger,
    borderRadius: radii.sm,
  },
  candidatesGrid: {
    gap: 16,
  },
  evaluationItemSquare: {
    backgroundColor: colors.bgDark,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.md,
    padding: 16,
  },
  candHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  candNameSquare: {
    color: colors.textPrimary,
    fontSize: 16,
    fontWeight: '900',
  },
  candBeltsProgression: {
    color: colors.textSecondary,
    fontSize: 12,
    marginTop: 2,
  },
  badgePillSharp: {
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
    borderWidth: 1,
    borderColor: colors.success,
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: radii.sm,
    alignSelf: 'flex-start',
  },
  badgePillSharpText: {
    color: colors.success,
    fontSize: 10,
    fontWeight: '800',
  },
  evaluationButtonBar: {
    marginTop: 10,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingTop: 12,
  },
  evalLabel: {
    color: colors.textSecondary,
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1,
    marginBottom: 8,
  },
  evalButtonsRow: {
    flexDirection: 'row',
    gap: 8,
  },
  evalChoiceBtn: {
    flex: 1,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.bgCard,
    alignItems: 'center',
    borderRadius: radii.md,
  },
  evalChoicePromovido: {
    backgroundColor: 'rgba(16, 185, 129, 0.25)',
    borderColor: colors.success,
  },
  evalChoiceProlongado: {
    backgroundColor: 'rgba(245, 158, 11, 0.25)',
    borderColor: colors.accent,
  },
  evalChoiceDenegado: {
    backgroundColor: 'rgba(239, 68, 68, 0.25)',
    borderColor: colors.danger,
  },
  evalChoiceText: {
    color: colors.textSecondary,
    fontSize: 11,
    fontWeight: '900',
  },
  evalChoiceTextActive: {
    color: '#FFFFFF',
  },
  obsContainer: {
    marginTop: 12,
    gap: 4,
  },
  obsLabel: {
    color: colors.textSecondary,
    fontSize: 10,
  },
  obsInput: {
    backgroundColor: colors.bgCard,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.md,
    paddingVertical: 8,
    paddingHorizontal: 12,
    color: colors.textPrimary,
    fontSize: 12,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.85)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalCardSquare: {
    width: '100%',
    maxWidth: 680,
    backgroundColor: colors.bgCard,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.xl,
    maxHeight: '90%',
    overflow: 'hidden',
  },
  modalRibbon: {
    backgroundColor: colors.primary,
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  modalRibbonText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '900',
    letterSpacing: 1,
  },
  modalBody: {
    padding: 20,
  },
  modalLabel: {
    color: colors.textSecondary,
    fontSize: 11,
    fontWeight: '800',
    marginBottom: 6,
  },
  modalInputSquare: {
    backgroundColor: colors.bgDark,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.md,
    paddingVertical: 8,
    paddingHorizontal: 12,
    color: colors.textPrimary,
    fontSize: 13,
  },
  formGroup: {
    marginBottom: 14,
  },
  formRow: {
    flexDirection: 'row',
    gap: 14,
  },
  typeSelectBtn: {
    flex: 1,
    minWidth: 90,
    paddingVertical: 8,
    backgroundColor: colors.bgDark,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.md,
    alignItems: 'center',
  },
  typeSelectBtnActive: {
    borderColor: colors.primary,
    backgroundColor: 'rgba(255, 107, 0, 0.15)',
  },
  typeSelectBtnText: {
    color: colors.textSecondary,
    fontSize: 10,
    fontWeight: '800',
  },
  typeSelectBtnTextActive: {
    color: colors.primary,
  },
  groupPillBtn: {
    paddingVertical: 6,
    paddingHorizontal: 10,
    backgroundColor: colors.bgDark,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.sm,
  },
  groupPillBtnActive: {
    borderColor: colors.primary,
    backgroundColor: 'rgba(255, 107, 0, 0.15)',
  },
  groupPillBtnText: {
    color: colors.textSecondary,
    fontSize: 11,
    fontWeight: '700',
  },
  groupPillBtnTextActive: {
    color: colors.primary,
  },
  quickActionBtn: {
    backgroundColor: colors.bgDark,
    borderWidth: 1,
    borderColor: colors.accent,
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: radii.md,
  },
  quickActionBtnText: {
    color: colors.accent,
    fontSize: 11,
    fontWeight: '800',
  },
  eligibleStudentRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 10,
    backgroundColor: colors.bgDark,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.md,
  },
  eligibleStudentRowChecked: {
    borderColor: colors.success,
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
  },
  eligibleStudentName: {
    color: colors.textPrimary,
    fontSize: 12,
    fontWeight: '700',
  },
  eligibleStatusTag: {
    fontSize: 10,
    fontWeight: '800',
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 12,
    marginTop: 16,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingTop: 14,
  },
  cancelSquareBtn: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.md,
  },
  cancelSquareBtnText: {
    color: colors.textSecondary,
    fontSize: 12,
    fontWeight: '800',
  },
  confirmSquareBtn: {
    backgroundColor: colors.primary,
    borderRadius: radii.md,
    paddingVertical: 10,
    paddingHorizontal: 20,
  },
  confirmSquareBtnText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '900',
  },
  exportModalSquare: {
    width: '100%',
    maxWidth: 820,
    backgroundColor: colors.bgCard,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.xl,
    overflow: 'hidden',
  },
  exportHeader: {
    backgroundColor: colors.bgDark,
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  exportTitle: {
    color: colors.textPrimary,
    fontSize: 15,
    fontWeight: '900',
  },
  exportSub: {
    color: colors.accent,
    fontSize: 12,
    marginTop: 2,
  },
  exportTableHead: {
    flexDirection: 'row',
    backgroundColor: colors.bgDark,
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  exportTh: {
    color: colors.textSecondary,
    fontSize: 10,
    fontWeight: '800',
  },
  exportTableRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  exportTd: {
    color: colors.textSecondary,
    fontSize: 11,
  },
  exportModalFooter: {
    padding: 14,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: colors.bgDark,
  },
  exportNotice: {
    color: colors.success,
    fontSize: 11,
    fontWeight: '700',
  },
  closeExportBtn: {
    backgroundColor: colors.primary,
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: radii.md,
  },
  closeExportBtnText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '900',
  },
});
