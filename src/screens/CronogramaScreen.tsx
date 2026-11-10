import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Modal } from 'react-native';
import { useDojoStore } from '../store/dojoStore';
import { DiaSemana, HorarioClase } from '../types';
import { CENTRAL_ACADEMIA_ID, matchAcademia } from '../data/constants';
import { colors, radii, useResponsive } from '../theme/theme';

export const CronogramaScreen: React.FC = () => {
  const schedule = useDojoStore((state) => state.schedule);
  const addClass = useDojoStore((state) => state.addClass);
  const deleteHorarioClase = useDojoStore((state) => state.deleteHorarioClase);
  const clearSchedule = useDojoStore((state) => state.clearSchedule);
  const students = useDojoStore((state) => state.students);
  const studentAssignments = useDojoStore((state) => state.studentClassAssignments);
  const payments = useDojoStore((state) => state.payments);
  const currentAcademia = useDojoStore((state) => state.currentAcademia);
  const attendance = useDojoStore((state) => state.attendance);
  const toggleAttendance = useDojoStore((state) => state.toggleAttendance);

  const { isMobile } = useResponsive();

  // Alumnos de la escuela activa
  const targetAcademiaId = currentAcademia?.id || CENTRAL_ACADEMIA_ID;
  const schoolStudents = students.filter((s) => matchAcademia(s.academia_id, targetAcademiaId));

  // 1. Detectar el día real de la computadora del usuario
  const getTodayDiaSemana = (): DiaSemana => {
    const dayNum = new Date().getDay();
    const map: Record<number, DiaSemana> = {
      1: 'LUNES',
      2: 'MARTES',
      3: 'MIERCOLES',
      4: 'JUEVES',
      5: 'VIERNES',
      6: 'SABADO',
      0: 'DOMINGO',
    };
    return map[dayNum] || 'LUNES';
  };

  const today = getTodayDiaSemana();
  const todayDateStr = new Date().toISOString().split('T')[0]; // YYYY-MM-DD

  const [selectedDia, setSelectedDia] = useState<DiaSemana>(today);
  const [selectedDate, setSelectedDate] = useState<string>(todayDateStr);
  const [selectedClassId, setSelectedClassId] = useState<string>('');

  // Modales
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showWeekTemplateModal, setShowWeekTemplateModal] = useState(false);

  // Formulario Planificar Nueva Clase
  const [newClassName, setNewClassName] = useState('');
  const [newClassDays, setNewClassDays] = useState<DiaSemana[]>([today]);
  const [newStartTime, setNewStartTime] = useState('18:00');
  const [newEndTime, setNewEndTime] = useState('19:30');

  // Selección de Grupos Etarios (1 o más)
  const gruposEtarios = [
    { key: 'sec-1', label: 'Pequeños 4-6 Años (Grupo I)', edad: '4 a 6 años' },
    { key: 'sec-2', label: 'Pequeños 4-6 Años (Grupo II)', edad: '4 a 6 años' },
    { key: 'sec-3', label: 'Adolescentes (7 a 15 años)', edad: '7 a 15 años' },
    { key: 'sec-4', label: 'Jóvenes y Adultos (16+)', edad: '16+ años' },
  ];
  const [selectedGrupos, setSelectedGrupos] = useState<string[]>(['sec-3']);

  // Modo de asignación: 'TODOS_GRUPO' o 'INDIVIDUALES'
  const [assignMode, setAssignMode] = useState<'TODOS_GRUPO' | 'INDIVIDUALES'>('TODOS_GRUPO');
  const [specificStudentIds, setSpecificStudentIds] = useState<string[]>([]);

  const dias: { key: DiaSemana; label: string }[] = [
    { key: 'LUNES', label: 'Lunes' },
    { key: 'MARTES', label: 'Martes' },
    { key: 'MIERCOLES', label: 'Miércoles' },
    { key: 'JUEVES', label: 'Jueves' },
    { key: 'VIERNES', label: 'Viernes' },
    { key: 'SABADO', label: 'Sábado' },
    { key: 'DOMINGO', label: 'Domingo' },
  ];

  // Clases del día seleccionado
  const dayClasses = schedule.filter((c) => c.dias_semana.includes(selectedDia));
  const activeClass = dayClasses.find((c) => c.id === selectedClassId) || dayClasses[0];

  // Alumnos asignados a la clase actual
  const enrolledStudents = schoolStudents.filter((s) => {
    const classIds = studentAssignments[s.id] || [];
    return classIds.includes(activeClass?.id || '');
  });

  // Clave de asistencia para la fecha seleccionada
  const attendanceKey = `${activeClass?.id || ''}_${selectedDate}`;
  const currentAttendance = attendance[attendanceKey] || {};

  const handleToggleDayInModal = (d: DiaSemana) => {
    if (newClassDays.includes(d)) {
      if (newClassDays.length > 1) {
        setNewClassDays(newClassDays.filter((day) => day !== d));
      }
    } else {
      setNewClassDays([...newClassDays, d]);
    }
  };

  const handleToggleGrupoInModal = (gKey: string) => {
    if (selectedGrupos.includes(gKey)) {
      if (selectedGrupos.length > 1) {
        setSelectedGrupos(selectedGrupos.filter((k) => k !== gKey));
      }
    } else {
      setSelectedGrupos([...selectedGrupos, gKey]);
    }
  };

  // Alumnos disponibles según los grupos etarios elegidos
  const availableStudentsFromSelectedGroups = schoolStudents.filter((s) =>
    selectedGrupos.includes(s.seccion_id || '')
  );

  const handleCreateClass = () => {
    if (!newClassName.trim()) return;

    let targetStudentIds: string[] = [];
    if (assignMode === 'TODOS_GRUPO') {
      targetStudentIds = availableStudentsFromSelectedGroups.map((s) => s.id);
    } else {
      targetStudentIds = specificStudentIds.length > 0
        ? specificStudentIds
        : availableStudentsFromSelectedGroups.map((s) => s.id);
    }

    addClass(
      {
        academia_id: targetAcademiaId,
        nombre_clase: newClassName.trim(),
        dias_semana: newClassDays,
        hora_inicio: newStartTime.trim(),
        hora_fin: newEndTime.trim(),
        tipo_audiencia: 'MIXTO',
      },
      targetStudentIds
    );

    setNewClassName('');
    setShowCreateModal(false);
  };

  const handleApplyWeekTemplate = () => {
    clearSchedule();

    const p1Students = schoolStudents.filter((s) => s.seccion_id === 'sec-1').map((s) => s.id);
    const p2Students = schoolStudents.filter((s) => s.seccion_id === 'sec-2').map((s) => s.id);
    const adolStudents = schoolStudents.filter((s) => s.seccion_id === 'sec-3').map((s) => s.id);
    const adultStudents = schoolStudents.filter((s) => s.seccion_id === 'sec-4').map((s) => s.id);

    // Lunes, Miércoles, Viernes
    addClass(
      {
        academia_id: targetAcademiaId,
        nombre_clase: 'Karate Infantil Iniciación (4 a 6 años)',
        dias_semana: ['LUNES', 'MIERCOLES', 'VIERNES'],
        hora_inicio: '17:00',
        hora_fin: '18:00',
        tipo_audiencia: 'SOLO_NINOS',
      },
      [...p1Students, ...p2Students]
    );

    addClass(
      {
        academia_id: targetAcademiaId,
        nombre_clase: 'Karate Formativo y Competitivo (Adolescentes 7-15)',
        dias_semana: ['LUNES', 'MIERCOLES', 'VIERNES'],
        hora_inicio: '18:15',
        hora_fin: '19:45',
        tipo_audiencia: 'MIXTO',
      },
      adolStudents
    );

    addClass(
      {
        academia_id: targetAcademiaId,
        nombre_clase: 'Karate Tradicional y Combate (Jóvenes y Adultos)',
        dias_semana: ['LUNES', 'MIERCOLES', 'VIERNES'],
        hora_inicio: '20:00',
        hora_fin: '21:30',
        tipo_audiencia: 'SOLO_ADULTOS',
      },
      adultStudents
    );

    // Martes y Jueves
    addClass(
      {
        academia_id: targetAcademiaId,
        nombre_clase: 'Kumite de Alto Rendimiento WKF (Seleccionados)',
        dias_semana: ['MARTES', 'JUEVES'],
        hora_inicio: '18:30',
        hora_fin: '20:00',
        tipo_audiencia: 'MIXTO',
      },
      adolStudents.slice(0, 15)
    );

    // Sábado
    addClass(
      {
        academia_id: targetAcademiaId,
        nombre_clase: 'Kata Shito Ryu y Defensa Personal Sábado',
        dias_semana: ['SABADO'],
        hora_inicio: '10:00',
        hora_fin: '12:00',
        tipo_audiencia: 'MIXTO',
      },
      [...adolStudents, ...adultStudents]
    );

    setShowWeekTemplateModal(false);
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={[styles.content, isMobile && { padding: 12 }]}>
      {/* 1. BARRA SUPERIOR DE ACCIONES */}
      <View style={[styles.headerBar, isMobile && { flexDirection: 'column', alignItems: 'stretch', gap: 12 }]}>
        <View>
          <Text style={styles.headerTitle}>PLANIFICACIÓN Y ASISTENCIA EN TATAMI</Text>
          <Text style={styles.headerSubtitle}>
            Gestiona la programación semanal de {currentAcademia?.nombre || 'la sede'} y pasa lista por fecha real
          </Text>
        </View>

        <View style={[styles.actionButtonsGroup, isMobile && { flexDirection: 'column', width: '100%' }]}>
          <TouchableOpacity
            style={styles.btnSecondary}
            onPress={() => setShowWeekTemplateModal(true)}
            activeOpacity={0.85}
          >
            <Text style={styles.btnSecondaryText}>📅 PLANTILLA SEMANAL</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.btnPrimary}
            onPress={() => setShowCreateModal(true)}
            activeOpacity={0.85}
          >
            <Text style={styles.btnPrimaryText}>+ PLANIFICAR CLASE</Text>
          </TouchableOpacity>

          {schedule.length > 0 && (
            <TouchableOpacity
              style={styles.btnClear}
              onPress={() => {
                if (typeof window !== 'undefined' && window.confirm('¿Deseas vaciar todas las clases para empezar desde cero?')) {
                  clearSchedule();
                }
              }}
              activeOpacity={0.85}
            >
              <Text style={styles.btnClearText}>🗑️ LIMPIAR</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* 2. SELECTOR DE DÍAS DE LA SEMANA */}
      <View style={styles.daysSelectorRow}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8, paddingVertical: 4 }}>
          {dias.map((d) => {
            const isSelected = selectedDia === d.key;
            const isCurrentDay = today === d.key;
            const classCount = schedule.filter((c) => c.dias_semana.includes(d.key)).length;

            return (
              <TouchableOpacity
                key={d.key}
                style={[
                  styles.dayTab,
                  isSelected && styles.dayTabSelected,
                  isCurrentDay && styles.dayTabToday,
                ]}
                onPress={() => {
                  setSelectedDia(d.key);
                  setSelectedClassId('');
                }}
                activeOpacity={0.8}
              >
                {isCurrentDay && (
                  <View style={styles.todayPillBadge}>
                    <Text style={styles.todayPillText}>HOY</Text>
                  </View>
                )}
                <Text style={[styles.dayLabel, isSelected && styles.dayLabelSelected]}>
                  {d.label.toUpperCase()}
                </Text>
                <Text style={[styles.classCountBadge, isSelected && { color: '#FFFFFF' }]}>
                  {classCount} {classCount === 1 ? 'Clase' : 'Clases'}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      {/* 3. CONTENEDOR PRINCIPAL: CLASES DEL DÍA Y ASISTENCIA EN TATAMI */}
      {dayClasses.length === 0 ? (
        <View style={styles.emptyCard}>
          <Text style={styles.emptyIcon}>🥋</Text>
          <Text style={styles.emptyTitle}>NO HAY CLASES REGISTRADAS PARA EL DÍA {selectedDia}</Text>
          <Text style={styles.emptySub}>
            Planifica una clase nueva o carga la plantilla semanal recomendada con un clic.
          </Text>
          <View style={[styles.emptyActionsRow, isMobile && { flexDirection: 'column' }]}>
            <TouchableOpacity
              style={styles.btnPrimary}
              onPress={() => setShowCreateModal(true)}
            >
              <Text style={styles.btnPrimaryText}>+ PLANIFICAR CLASE PARA EL {selectedDia}</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.btnSecondary}
              onPress={handleApplyWeekTemplate}
            >
              <Text style={styles.btnSecondaryText}>📅 CARGAR PLANTILLA RECOMENDADA</Text>
            </TouchableOpacity>
          </View>
        </View>
      ) : (
        <View style={[styles.scheduleLayoutGrid, isMobile && { flexDirection: 'column' }]}>
          {/* Columna Izquierda: Clases del Día */}
          <View style={[styles.classesCol, isMobile && { width: '100%' }]}>
            <Text style={styles.colHeaderTitle}>
              HORARIOS PROGRAMADOS — {selectedDia} ({dayClasses.length})
            </Text>

            <View style={{ gap: 10, marginTop: 10 }}>
              {dayClasses.map((cl) => {
                const isSelected = activeClass?.id === cl.id;
                const assignedCount = schoolStudents.filter((s) =>
                  (studentAssignments[s.id] || []).includes(cl.id)
                ).length;

                return (
                  <TouchableOpacity
                    key={cl.id}
                    style={[styles.classItem, isSelected && styles.classItemActive]}
                    onPress={() => setSelectedClassId(cl.id)}
                    activeOpacity={0.85}
                  >
                    <View style={styles.classItemTop}>
                      <Text style={styles.classTimeText}>
                        🕒 {cl.hora_inicio} - {cl.hora_fin} hrs
                      </Text>
                      <TouchableOpacity
                        onPress={() => {
                          if (typeof window !== 'undefined' && window.confirm(`¿Eliminar la clase "${cl.nombre_clase}"?`)) {
                            deleteHorarioClase(cl.id);
                          }
                        }}
                      >
                        <Text style={styles.deleteClassBtn}>✕</Text>
                      </TouchableOpacity>
                    </View>

                    <Text style={[styles.classNameText, isSelected && { color: colors.primary }]}>
                      {cl.nombre_clase}
                    </Text>

                    <View style={styles.classItemFooter}>
                      <Text style={styles.classAssignedText}>
                        👥 {assignedCount} {assignedCount === 1 ? 'Alumno asignado' : 'Alumnos asignados'}
                      </Text>
                      {isSelected && (
                        <View style={styles.activeClassDot}>
                          <Text style={styles.activeClassDotText}>LISTA ACTIVA</Text>
                        </View>
                      )}
                    </View>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>

          {/* Columna Derecha: Registro de Asistencia en Tatami */}
          <View style={[styles.attendanceCol, isMobile && { width: '100%' }]}>
            <View style={[styles.attendanceHeader, isMobile && { flexDirection: 'column', alignItems: 'flex-start', gap: 10 }]}>
              <View>
                <Text style={styles.attendanceTitle}>
                  REGISTRO DE ASISTENCIA — {activeClass?.nombre_clase}
                </Text>
                <Text style={styles.attendanceSub}>
                  Horario: {activeClass?.hora_inicio} a {activeClass?.hora_fin} hrs • Tatami Central
                </Text>
              </View>

              <View style={[styles.dateControlRow, isMobile && { width: '100%' }]}>
                <Text style={styles.dateLabel}>FECHA:</Text>
                <TextInput
                  style={[styles.dateInput, isMobile && { flex: 1 }]}
                  value={selectedDate}
                  onChangeText={setSelectedDate}
                  placeholder="YYYY-MM-DD"
                  placeholderTextColor={colors.textDim}
                />
              </View>
            </View>

            {/* Resumen Rápido de Quórum */}
            <View style={styles.quorumBar}>
              <Text style={styles.quorumText}>
                QUÓRUM HOY:{' '}
                <Text style={{ color: colors.success, fontWeight: '900' }}>
                  {Object.values(currentAttendance).filter(Boolean).length} Presentes
                </Text>{' '}
                de {enrolledStudents.length} Alumnos Inscritos (
                {enrolledStudents.length > 0
                  ? Math.round(
                      (Object.values(currentAttendance).filter(Boolean).length / enrolledStudents.length) * 100
                    )
                  : 0}
                %)
              </Text>
            </View>

            {/* Lista de Alumnos para Pasar Lista */}
            <View style={styles.studentsAttendanceList}>
              {enrolledStudents.map((st) => {
                const isPresent = Boolean(currentAttendance[st.id]);

                return (
                  <View key={st.id} style={styles.attendanceStudentRow}>
                    <View style={styles.studentInfoCol}>
                      <Text style={styles.attendanceStudentName}>
                        {st.nombres} {st.apellidos}
                      </Text>
                      <Text style={styles.attendanceStudentMeta}>
                        {st.rut || 'Sin RUT'} • {st.seccion_id === 'sec-1' ? 'Grupo I' : st.seccion_id === 'sec-3' ? 'Adolescentes' : 'Adultos'}
                      </Text>
                    </View>

                    <TouchableOpacity
                      style={[styles.attendanceToggleBtn, isPresent && styles.attendanceToggleBtnPresent]}
                      onPress={() => toggleAttendance(activeClass.id, selectedDate, st.id)}
                      activeOpacity={0.8}
                    >
                      <Text style={[styles.attendanceToggleText, isPresent && styles.attendanceToggleTextPresent]}>
                        {isPresent ? '✓ PRESENTE' : 'AUSENTE'}
                      </Text>
                    </TouchableOpacity>
                  </View>
                );
              })}

              {enrolledStudents.length === 0 && (
                <View style={{ padding: 24, alignItems: 'center' }}>
                  <Text style={{ color: colors.textDim, fontSize: 13 }}>
                    No hay alumnos asignados a este horario aún.
                  </Text>
                </View>
              )}
            </View>
          </View>
        </View>
      )}

      {/* MODAL 1: PLANIFICAR NUEVA CLASE */}
      {showCreateModal && (
        <Modal transparent animationType="fade" visible={showCreateModal}>
          <View style={styles.modalOverlay}>
            <View style={[styles.modalCard, isMobile && { width: '95%', maxHeight: '90%' }]}>
              <View style={styles.modalRibbon}>
                <Text style={styles.modalRibbonText}>NUEVA CLASE — PLANIFICADOR SEMANAL</Text>
              </View>

              <ScrollView style={{ padding: 20 }}>
                <Text style={styles.formSectionTitle}>1. IDENTIFICACIÓN Y HORARIO DE LA CLASE:</Text>

                <View style={{ gap: 6, marginTop: 8 }}>
                  <Text style={styles.fieldLabel}>Nombre de la Clase / Especialidad:</Text>
                  <TextInput
                    style={styles.fieldInput}
                    value={newClassName}
                    onChangeText={setNewClassName}
                    placeholder="Ej: Kumite Competitivo WKF, Kata Shito Ryu, Preescolar"
                    placeholderTextColor={colors.textDim}
                  />
                </View>

                {/* Días en que se repite la clase */}
                <View style={{ marginTop: 14 }}>
                  <Text style={styles.fieldLabel}>Días en que se imparte:</Text>
                  <View style={{ flexDirection: 'row', gap: 6, flexWrap: 'wrap', marginTop: 6 }}>
                    {dias.map((d) => {
                      const isSel = newClassDays.includes(d.key);
                      return (
                        <TouchableOpacity
                          key={d.key}
                          style={[styles.dayChoiceBtn, isSel && styles.dayChoiceBtnActive]}
                          onPress={() => handleToggleDayInModal(d.key)}
                        >
                          <Text style={[styles.dayChoiceText, isSel && styles.dayChoiceTextActive]}>
                            {d.label}
                          </Text>
                        </TouchableOpacity>
                      );
                    })}
                  </View>
                </View>

                {/* Input de Horario */}
                <View style={{ flexDirection: 'row', gap: 12, marginTop: 14 }}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.fieldLabel}>Hora Inicio (HH:MM):</Text>
                    <TextInput
                      style={styles.fieldInput}
                      value={newStartTime}
                      onChangeText={setNewStartTime}
                      placeholder="18:00"
                      placeholderTextColor={colors.textDim}
                    />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.fieldLabel}>Hora Fin (HH:MM):</Text>
                    <TextInput
                      style={styles.fieldInput}
                      value={newEndTime}
                      onChangeText={setNewEndTime}
                      placeholder="19:30"
                      placeholderTextColor={colors.textDim}
                    />
                  </View>
                </View>

                {/* SECCIÓN 2: ASIGNACIÓN DE ALUMNOS */}
                <Text style={[styles.formSectionTitle, { marginTop: 20 }]}>
                  2. AUDIENCIA Y ASIGNACIÓN DE ALUMNOS:
                </Text>

                <View style={{ gap: 8, marginTop: 8 }}>
                  <Text style={styles.fieldLabel}>Selecciona los Grupos Etarios que asisten:</Text>
                  {gruposEtarios.map((g) => {
                    const isSelected = selectedGrupos.includes(g.key);
                    const countInGroup = schoolStudents.filter((s) => s.seccion_id === g.key).length;

                    return (
                      <TouchableOpacity
                        key={g.key}
                        style={[styles.groupSelectRow, isSelected && styles.groupSelectRowActive]}
                        onPress={() => handleToggleGrupoInModal(g.key)}
                        activeOpacity={0.8}
                      >
                        <View style={[styles.groupCheckSquare, isSelected && styles.groupCheckSquareActive]}>
                          {isSelected && <Text style={{ color: '#FFFFFF', fontSize: 10, fontWeight: '900' }}>✓</Text>}
                        </View>
                        <View style={{ flex: 1 }}>
                          <Text style={[styles.groupRowLabel, isSelected && { color: colors.primary }]}>
                            {g.label}
                          </Text>
                          <Text style={styles.groupRowSub}>
                            {g.edad} • {countInGroup} Alumnos en esta sede
                          </Text>
                        </View>
                      </TouchableOpacity>
                    );
                  })}
                </View>

                {/* Modo de asignación */}
                <View style={{ marginTop: 16 }}>
                  <Text style={styles.fieldLabel}>Método de Asignación:</Text>
                  <View style={styles.assignModeRow}>
                    <TouchableOpacity
                      style={[styles.assignModeBtn, assignMode === 'TODOS_GRUPO' && styles.assignModeBtnActive]}
                      onPress={() => setAssignMode('TODOS_GRUPO')}
                    >
                      <Text style={[styles.assignModeBtnText, assignMode === 'TODOS_GRUPO' && styles.assignModeBtnTextActive]}>
                        👥 TODOS los alumnos de los grupos seleccionados ({availableStudentsFromSelectedGroups.length})
                      </Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={[styles.assignModeBtn, assignMode === 'INDIVIDUALES' && styles.assignModeBtnActive]}
                      onPress={() => setAssignMode('INDIVIDUALES')}
                    >
                      <Text style={[styles.assignModeBtnText, assignMode === 'INDIVIDUALES' && styles.assignModeBtnTextActive]}>
                        🎯 Seleccionar alumnos individuales de estos grupos
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>

                {assignMode === 'INDIVIDUALES' && (
                  <View style={styles.individualPickerBox}>
                    <Text style={styles.individualPickerTitle}>
                      Marca los alumnos que asistirán a esta clase:
                    </Text>
                    <ScrollView style={{ maxHeight: 200, marginTop: 8 }}>
                      {availableStudentsFromSelectedGroups.map((st) => {
                        const isPicked = specificStudentIds.includes(st.id);
                        return (
                          <TouchableOpacity
                            key={st.id}
                            style={[styles.studentPickRow, isPicked && styles.studentPickRowActive]}
                            onPress={() => {
                              if (isPicked) {
                                setSpecificStudentIds(specificStudentIds.filter((id) => id !== st.id));
                              } else {
                                setSpecificStudentIds([...specificStudentIds, st.id]);
                              }
                            }}
                          >
                            <Text style={{ color: isPicked ? colors.primary : colors.textSecondary, fontSize: 12 }}>
                              {isPicked ? '✓ ' : '○ '} {st.nombres} {st.apellidos} ({st.rut || 'Sin RUT'})
                            </Text>
                          </TouchableOpacity>
                        );
                      })}
                    </ScrollView>
                  </View>
                )}

                <View style={styles.modalActionsRow}>
                  <TouchableOpacity
                    style={styles.modalCancelBtn}
                    onPress={() => setShowCreateModal(false)}
                  >
                    <Text style={styles.modalCancelBtnText}>CANCELAR</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.modalConfirmBtn}
                    onPress={handleCreateClass}
                  >
                    <Text style={styles.modalConfirmBtnText}>GUARDAR Y PLANIFICAR CLASE</Text>
                  </TouchableOpacity>
                </View>
              </ScrollView>
            </View>
          </View>
        </Modal>
      )}

      {/* MODAL 2: CARGAR PLANTILLA SEMANAL RECOMENDADA */}
      {showWeekTemplateModal && (
        <Modal transparent animationType="fade" visible={showWeekTemplateModal}>
          <View style={styles.modalOverlay}>
            <View style={[styles.modalCard, isMobile && { width: '95%' }]}>
              <View style={styles.modalRibbon}>
                <Text style={styles.modalRibbonText}>PLANTILLA SEMANAL RECOMENDADA — DOJO SHITO RYU</Text>
              </View>

              <View style={{ padding: 20 }}>
                <Text style={styles.templateModalTitle}>
                  ¿Deseas configurar automáticamente el cronograma estándar del Dojo?
                </Text>
                <Text style={styles.templateModalDesc}>
                  Esto configurará la semana completa con horarios para Infantiles, Adolescentes, Adultos y Selección WKF.
                </Text>

                <View style={styles.modalActionsRow}>
                  <TouchableOpacity
                    style={styles.modalCancelBtn}
                    onPress={() => setShowWeekTemplateModal(false)}
                  >
                    <Text style={styles.modalCancelBtnText}>CANCELAR</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.modalConfirmBtn}
                    onPress={handleApplyWeekTemplate}
                  >
                    <Text style={styles.modalConfirmBtnText}>APLICAR PLANTILLA SEMANAL</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </View>
        </Modal>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bgDarkest,
  },
  content: {
    padding: 24,
    gap: 18,
    maxWidth: 1400,
    width: '100%',
    alignSelf: 'center',
  },
  headerBar: {
    backgroundColor: colors.bgCard,
    borderWidth: 1,
    borderColor: colors.borderLight,
    borderRadius: radii.lg,
    padding: 18,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerTitle: {
    color: colors.textPrimary,
    fontSize: 16,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  headerSubtitle: {
    color: colors.textDim,
    fontSize: 12,
    marginTop: 2,
  },
  actionButtonsGroup: {
    flexDirection: 'row',
    gap: 10,
  },
  btnPrimary: {
    backgroundColor: colors.primary,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: radii.md,
    alignItems: 'center',
  },
  btnPrimaryText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  btnSecondary: {
    backgroundColor: colors.bgInput,
    borderWidth: 1,
    borderColor: colors.borderLight,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: radii.md,
    alignItems: 'center',
  },
  btnSecondaryText: {
    color: colors.textSecondary,
    fontSize: 11,
    fontWeight: '800',
  },
  btnClear: {
    backgroundColor: colors.bgInput,
    borderWidth: 1,
    borderColor: colors.dangerBorder,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: radii.md,
    alignItems: 'center',
  },
  btnClearText: {
    color: colors.danger,
    fontSize: 11,
    fontWeight: '800',
  },
  daysSelectorRow: {
    backgroundColor: colors.bgSurface,
    padding: 8,
    borderRadius: radii.lg,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
  },
  dayTab: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    backgroundColor: colors.bgCard,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
    borderRadius: radii.md,
    alignItems: 'center',
  },
  dayTabSelected: {
    backgroundColor: colors.primary,
    borderColor: colors.primaryHover,
  },
  dayTabToday: {
    borderColor: colors.primary,
  },
  todayPillBadge: {
    backgroundColor: colors.accentGold,
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: radii.xs,
    marginBottom: 4,
  },
  todayPillText: {
    color: '#000000',
    fontSize: 8,
    fontWeight: '900',
  },
  dayLabel: {
    color: colors.textMuted,
    fontSize: 12,
    fontWeight: '800',
  },
  dayLabelSelected: {
    color: '#FFFFFF',
    fontWeight: '900',
  },
  classCountBadge: {
    color: colors.textDim,
    fontSize: 10,
    marginTop: 2,
  },
  emptyCard: {
    backgroundColor: colors.bgCard,
    borderWidth: 1,
    borderColor: colors.borderLight,
    borderRadius: radii.lg,
    padding: 36,
    alignItems: 'center',
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: 12,
  },
  emptyTitle: {
    color: colors.textPrimary,
    fontSize: 16,
    fontWeight: '900',
    textAlign: 'center',
  },
  emptySub: {
    color: colors.textDim,
    fontSize: 12,
    marginTop: 4,
    textAlign: 'center',
  },
  emptyActionsRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 18,
  },
  scheduleLayoutGrid: {
    flexDirection: 'row',
    gap: 16,
  },
  classesCol: {
    width: 380,
    backgroundColor: colors.bgCard,
    borderWidth: 1,
    borderColor: colors.borderLight,
    borderRadius: radii.lg,
    padding: 16,
  },
  colHeaderTitle: {
    color: colors.primary,
    fontSize: 11,
    fontWeight: '900',
    letterSpacing: 0.8,
  },
  classItem: {
    backgroundColor: colors.bgInput,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
    borderRadius: radii.md,
    padding: 14,
    gap: 6,
  },
  classItemActive: {
    borderColor: colors.primary,
    backgroundColor: 'rgba(255, 107, 0, 0.10)',
    borderLeftWidth: 4,
    borderLeftColor: colors.primary,
  },
  classItemTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  classTimeText: {
    color: colors.textPrimary,
    fontSize: 12,
    fontWeight: '800',
  },
  deleteClassBtn: {
    color: colors.danger,
    fontSize: 12,
    paddingHorizontal: 4,
  },
  classNameText: {
    color: colors.textSecondary,
    fontSize: 14,
    fontWeight: '800',
  },
  classItemFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 4,
  },
  classAssignedText: {
    color: colors.textDim,
    fontSize: 11,
  },
  activeClassDot: {
    backgroundColor: colors.primary,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: radii.xs,
  },
  activeClassDotText: {
    color: '#FFFFFF',
    fontSize: 8,
    fontWeight: '900',
  },
  attendanceCol: {
    flex: 1,
    backgroundColor: colors.bgCard,
    borderWidth: 1,
    borderColor: colors.borderLight,
    borderRadius: radii.lg,
    padding: 16,
  },
  attendanceHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderSubtle,
  },
  attendanceTitle: {
    color: colors.textPrimary,
    fontSize: 13,
    fontWeight: '900',
  },
  attendanceSub: {
    color: colors.textDim,
    fontSize: 11,
    marginTop: 2,
  },
  dateControlRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  dateLabel: {
    color: colors.textDim,
    fontSize: 10,
    fontWeight: '900',
  },
  dateInput: {
    backgroundColor: colors.bgInput,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
    borderRadius: radii.md,
    paddingHorizontal: 10,
    paddingVertical: 6,
    color: colors.primary,
    fontSize: 12,
    fontWeight: '700',
  },
  quorumBar: {
    backgroundColor: colors.bgInput,
    padding: 10,
    borderRadius: radii.md,
    marginVertical: 12,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
  },
  quorumText: {
    color: colors.textSecondary,
    fontSize: 11,
    fontWeight: '700',
  },
  studentsAttendanceList: {
    gap: 8,
  },
  attendanceStudentRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: colors.bgInput,
    padding: 12,
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
  },
  studentInfoCol: {
    flex: 1,
  },
  attendanceStudentName: {
    color: colors.textPrimary,
    fontSize: 13,
    fontWeight: '800',
  },
  attendanceStudentMeta: {
    color: colors.textDim,
    fontSize: 11,
    marginTop: 2,
  },
  attendanceToggleBtn: {
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: radii.md,
    backgroundColor: colors.bgCard,
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  attendanceToggleBtnPresent: {
    backgroundColor: colors.success,
    borderColor: colors.success,
  },
  attendanceToggleText: {
    color: colors.textDim,
    fontSize: 11,
    fontWeight: '900',
  },
  attendanceToggleTextPresent: {
    color: '#FFFFFF',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.85)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  modalCard: {
    width: 600,
    maxHeight: 640,
    backgroundColor: colors.bgCard,
    borderWidth: 1,
    borderColor: colors.borderLight,
    borderRadius: radii.xl,
    overflow: 'hidden',
  },
  modalRibbon: {
    backgroundColor: colors.primary,
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  modalRibbonText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 1,
  },
  formSectionTitle: {
    color: colors.primary,
    fontSize: 11,
    fontWeight: '900',
    letterSpacing: 0.8,
  },
  fieldLabel: {
    color: colors.textMuted,
    fontSize: 11,
    fontWeight: '700',
  },
  fieldInput: {
    backgroundColor: colors.bgInput,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
    borderRadius: radii.md,
    paddingHorizontal: 12,
    paddingVertical: 10,
    color: colors.textPrimary,
    fontSize: 13,
  },
  dayChoiceBtn: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    backgroundColor: colors.bgInput,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
    borderRadius: radii.sm,
  },
  dayChoiceBtnActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primaryHover,
  },
  dayChoiceText: {
    color: colors.textDim,
    fontSize: 11,
    fontWeight: '700',
  },
  dayChoiceTextActive: {
    color: '#FFFFFF',
    fontWeight: '900',
  },
  groupSelectRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.bgInput,
    padding: 10,
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
    gap: 10,
  },
  groupSelectRowActive: {
    borderColor: colors.primary,
    backgroundColor: 'rgba(255, 107, 0, 0.08)',
  },
  groupCheckSquare: {
    width: 20,
    height: 20,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: colors.borderLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  groupCheckSquareActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  groupRowLabel: {
    color: colors.textSecondary,
    fontSize: 12,
    fontWeight: '800',
  },
  groupRowSub: {
    color: colors.textDim,
    fontSize: 10,
  },
  assignModeRow: {
    gap: 8,
    marginTop: 6,
  },
  assignModeBtn: {
    backgroundColor: colors.bgInput,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
    borderRadius: radii.md,
    padding: 10,
  },
  assignModeBtnActive: {
    borderColor: colors.primary,
    backgroundColor: 'rgba(255, 107, 0, 0.08)',
  },
  assignModeBtnText: {
    color: colors.textMuted,
    fontSize: 12,
    fontWeight: '700',
  },
  assignModeBtnTextActive: {
    color: colors.primary,
    fontWeight: '900',
  },
  individualPickerBox: {
    backgroundColor: colors.bgInput,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
    borderRadius: radii.md,
    padding: 12,
    marginTop: 8,
  },
  individualPickerTitle: {
    color: colors.textDim,
    fontSize: 11,
    fontWeight: '700',
  },
  studentPickRow: {
    paddingVertical: 6,
    paddingHorizontal: 8,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderSubtle,
  },
  studentPickRowActive: {
    backgroundColor: 'rgba(255, 107, 0, 0.12)',
  },
  modalActionsRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 12,
    marginTop: 16,
    borderTopWidth: 1,
    borderTopColor: colors.borderSubtle,
    paddingTop: 16,
  },
  modalCancelBtn: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
    borderRadius: radii.md,
  },
  modalCancelBtnText: {
    color: colors.textMuted,
    fontSize: 12,
    fontWeight: '800',
  },
  modalConfirmBtn: {
    backgroundColor: colors.primary,
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: radii.md,
  },
  modalConfirmBtnText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '900',
  },
  templateModalTitle: {
    color: colors.textPrimary,
    fontSize: 15,
    fontWeight: '900',
    lineHeight: 22,
  },
  templateModalDesc: {
    color: colors.textMuted,
    fontSize: 12,
    marginTop: 6,
    lineHeight: 18,
  },
});
