import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useDojoStore } from '../store/dojoStore';
import { CENTRAL_ACADEMIA_ID, matchAcademia } from '../data/constants';
import { colors, radii, useResponsive } from '../theme/theme';

export const DashboardScreen: React.FC = () => {
  const students = useDojoStore((state) => state.students);
  const setTab = useDojoStore((state) => state.setTab);
  const selectStudent = useDojoStore((state) => state.selectStudent);
  const payments = useDojoStore((state) => state.payments);
  const eventos = useDojoStore((state) => state.eventos);
  const examenes = useDojoStore((state) => state.examenes);
  const currentAcademia = useDojoStore((state) => state.currentAcademia);
  const academias = useDojoStore((state) => state.academias);

  const { isMobile } = useResponsive();
  const [copiedLink, setCopiedLink] = useState(false);

  // Alumnos pertenecientes a la escuela activa
  const targetAcademiaId = currentAcademia?.id || CENTRAL_ACADEMIA_ID;
  const schoolStudents = students.filter((s) => matchAcademia(s.academia_id, targetAcademiaId));

  const totalAlumnos = schoolStudents.length;
  const today = new Date();
  const currentMonthNum = today.getMonth() + 1; // 1-12
  const monthNames = [
    'ENERO', 'FEBRERO', 'MARZO', 'ABRIL', 'MAYO', 'JUNIO',
    'JULIO', 'AGOSTO', 'SEPTIEMBRE', 'OCTUBRE', 'NOVIEMBRE', 'DICIEMBRE'
  ];
  const currentMonthName = monthNames[currentMonthNum - 1];

  let alDiaCount = 0;
  let recaudadoMes = 0;
  let recaudadoAnual = 0;
  let incompletosCount = 0;

  let countPreescolar = 0; // 4 a 6 años
  let countAdolescentes = 0; // 7 a 15 años
  let countAdultos = 0; // 16+ años
  let countSinFecha = 0;

  schoolStudents.forEach((s) => {
    // Pagos
    const pMes = payments[s.id]?.[currentMonthNum];
    if (pMes?.estado === 'PAGADO') {
      alDiaCount++;
      recaudadoMes += pMes.monto || 35000;
    }

    const sPayments = payments[s.id] || {};
    Object.values(sPayments).forEach((p) => {
      if (p.estado === 'PAGADO') {
        recaudadoAnual += p.monto || 35000;
      }
    });

    // Fichas incompletas
    if (!s.rut || !s.peso_actual_kg || !s.fecha_nacimiento) {
      incompletosCount++;
    }

    // Clasificación dinámica por edad real
    if (s.fecha_nacimiento) {
      const birth = new Date(s.fecha_nacimiento);
      if (!isNaN(birth.getTime())) {
        let age = today.getFullYear() - birth.getFullYear();
        const m = today.getMonth() - birth.getMonth();
        if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) {
          age--;
        }

        if (age >= 4 && age <= 6) {
          countPreescolar++;
        } else if (age >= 7 && age <= 15) {
          countAdolescentes++;
        } else if (age >= 16) {
          countAdultos++;
        } else {
          countPreescolar++;
        }
      } else {
        countSinFecha++;
      }
    } else {
      countSinFecha++;
    }
  });

  const totalProyectadoMes = totalAlumnos * 35000;
  const porcentajeAlDia = totalAlumnos > 0 ? Math.round((alDiaCount / totalAlumnos) * 100) : 0;

  const handleCopyLink = () => {
    const url = `https://dojoshitoryu.cl/inscribete?sede=${currentAcademia?.id || 'rancagua'}`;
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(url).catch(() => {});
    }
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2500);
  };

  const handleGoToStudent = (id: string) => {
    selectStudent(id);
    setTab('alumnos');
  };

  const proximoEvento = eventos[0];
  const proximoExamen = examenes[0];

  return (
    <ScrollView style={styles.container} contentContainerStyle={[styles.content, isMobile && { padding: 12 }]}>
      {/* 1. TABLÓN DE ANUNCIOS OFICIALES DEL DOJO (Estilo DojoStrike) */}
      <View style={styles.announcementCard}>
        <View style={styles.announcementHeader}>
          <View style={styles.announcementBadge}>
            <Text style={styles.announcementBadgeText}>📢 TABLÓN DE ANUNCIOS OFICIAL</Text>
          </View>
          <Text style={styles.announcementDate}>
            ESCUELA ACTIVA: {currentAcademia?.nombre.toUpperCase() || 'DOJO CENTRAL'}
          </Text>
        </View>

        <View style={styles.announcementBody}>
          {proximoEvento ? (
            <View style={[styles.announcementItem, isMobile && { flexDirection: 'column', alignItems: 'flex-start' }]}>
              <View style={styles.announcementTopMetaRow}>
                <View style={styles.announcementDateBox}>
                  <Text style={styles.announcementDay}>
                    {proximoEvento.fecha_evento ? proximoEvento.fecha_evento.split('-')[2] : '18'}
                  </Text>
                  <Text style={styles.announcementMonth}>EVENTO</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.announcementItemTitle}>🏆 {proximoEvento.nombre}</Text>
                  <Text style={styles.announcementItemDesc}>
                    Lugar: {proximoEvento.lugar || 'Por definir'} • Costo: ${proximoEvento.costo_inscripcion.toLocaleString('es-CL')} CLP • {proximoEvento.alumnos_inscritos_ids?.length || 0} inscritos.
                  </Text>
                </View>
              </View>
              <TouchableOpacity
                style={[styles.announcementActionBtn, isMobile && { width: '100%', alignItems: 'center', marginTop: 8 }]}
                onPress={() => setTab('torneos')}
              >
                <Text style={styles.announcementActionText}>Ver Evento ➔</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <Text style={{ color: colors.textDim, padding: 12 }}>No hay eventos programados próximamente.</Text>
          )}

          {proximoExamen && (
            <View style={[styles.announcementItem, { borderTopWidth: 1, borderTopColor: colors.borderSubtle }, isMobile && { flexDirection: 'column', alignItems: 'flex-start' }]}>
              <View style={styles.announcementTopMetaRow}>
                <View style={[styles.announcementDateBox, { backgroundColor: colors.accentGoldLight, borderColor: colors.accentGold }]}>
                  <Text style={[styles.announcementDay, { color: colors.accentGold }]}>
                    {proximoExamen.fecha_examen ? proximoExamen.fecha_examen.split('-')[2] : '23'}
                  </Text>
                  <Text style={[styles.announcementMonth, { color: colors.accentGold }]}>EXAMEN</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.announcementItemTitle}>🥋 {proximoExamen.nombre}</Text>
                  <Text style={styles.announcementItemDesc}>
                    Derecho a examen: ${proximoExamen.costo_derecho_examen.toLocaleString('es-CL')} CLP • Evaluación técnica para ascensos de grado.
                  </Text>
                </View>
              </View>
              <TouchableOpacity
                style={[styles.announcementActionBtn, isMobile && { width: '100%', alignItems: 'center', marginTop: 8 }]}
                onPress={() => setTab('torneos')}
              >
                <Text style={styles.announcementActionText}>Postulantes ➔</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </View>

      {/* 2. GRID DE MÉTRICAS FINANCIERAS Y OPERATIVAS */}
      <View style={styles.metricsGrid}>
        {/* Total Alumnos de esta Escuela */}
        <View style={[styles.metricCard, isMobile && styles.metricCardMobile]}>
          <View style={styles.metricHeader}>
            <Text style={styles.metricLabel}>ALUMNOS EN ESTA ESCUELA</Text>
            <View style={styles.metricPill}>
              <Text style={styles.metricPillText}>Sede Activa</Text>
            </View>
          </View>
          <Text style={styles.metricValue}>{totalAlumnos}</Text>
          <Text style={styles.metricSub}>{currentAcademia?.nombre || 'Dojo Central'}</Text>
        </View>

        {/* Recaudación Mensual */}
        <View style={[styles.metricCard, isMobile && styles.metricCardMobile]}>
          <View style={styles.metricHeader}>
            <Text style={styles.metricLabel}>RECAUDACIÓN MENSUAL ({currentMonthName})</Text>
            <View style={[styles.metricPill, { backgroundColor: colors.successBg, borderColor: colors.successBorder }]}>
              <Text style={[styles.metricPillText, { color: colors.success }]}>{porcentajeAlDia}% Al Día</Text>
            </View>
          </View>
          <Text style={[styles.metricValue, { color: colors.primary }]}>
            ${recaudadoMes.toLocaleString('es-CL')}
          </Text>
          <Text style={styles.metricSub}>
            Proyectado: ${totalProyectadoMes.toLocaleString('es-CL')} CLP ({alDiaCount} pagados)
          </Text>
        </View>

        {/* Recaudación Anual de esta Escuela */}
        <View style={[styles.metricCard, isMobile && styles.metricCardMobile]}>
          <View style={styles.metricHeader}>
            <Text style={styles.metricLabel}>RECAUDACIÓN ANUAL ({today.getFullYear()})</Text>
            <View style={[styles.metricPill, { backgroundColor: colors.accentGoldLight, borderColor: colors.accentGold }]}>
              <Text style={[styles.metricPillText, { color: colors.accentGold }]}>Acumulado</Text>
            </View>
          </View>
          <Text style={[styles.metricValue, { color: colors.accentGold }]}>
            ${recaudadoAnual.toLocaleString('es-CL')}
          </Text>
          <Text style={styles.metricSub}>Total ingresado año en curso en esta sede</Text>
        </View>

        {/* Fichas por Completar */}
        <View style={[styles.metricCard, isMobile && styles.metricCardMobile]}>
          <View style={styles.metricHeader}>
            <Text style={styles.metricLabel}>FICHAS POR COMPLETAR</Text>
            <View style={[styles.metricPill, { backgroundColor: colors.dangerBg, borderColor: colors.dangerBorder }]}>
              <Text style={[styles.metricPillText, { color: colors.danger }]}>Prioridad</Text>
            </View>
          </View>
          <Text style={[styles.metricValue, { color: colors.danger }]}>{incompletosCount}</Text>
          <Text style={styles.metricSub}>Falta RUT, peso o fecha de nacimiento</Text>
        </View>
      </View>

      {/* 3. DISTRIBUCIÓN DINÁMICA DE ALUMNOS POR EDAD CALCULADA */}
      <View style={styles.boxCard}>
        <View style={styles.boxCardHeader}>
          <View>
            <Text style={styles.boxCardTitle}>DISTRIBUCIÓN REAL POR EDAD (CÁLCULO AUTOMÁTICO)</Text>
            <Text style={styles.boxCardSubtitle}>
              Clasificación dinámica según la fecha de nacimiento real de cada deportista
            </Text>
          </View>
          <TouchableOpacity onPress={() => setTab('cronograma')}>
            <Text style={styles.sharpLinkText}>Planificar Clases por Grupo ➔</Text>
          </TouchableOpacity>
        </View>

        <View style={[styles.sectionGrid, isMobile && { flexDirection: 'column' }]}>
          <View style={styles.sectionCol}>
            <View style={styles.sectionBadge}>
              <Text style={styles.sectionBadgeText}>PREESCOLAR (4 - 6 AÑOS)</Text>
            </View>
            <Text style={styles.sectionCount}>{countPreescolar}</Text>
            <Text style={styles.sectionMeta}>
              {totalAlumnos > 0 ? Math.round((countPreescolar / totalAlumnos) * 100) : 0}% del alumnado de esta sede
            </Text>
          </View>

          <View style={styles.sectionCol}>
            <View style={[styles.sectionBadge, { backgroundColor: colors.primary }]}>
              <Text style={styles.sectionBadgeText}>ADOLESCENTES (7 - 15 AÑOS)</Text>
            </View>
            <Text style={[styles.sectionCount, { color: colors.primary }]}>{countAdolescentes}</Text>
            <Text style={styles.sectionMeta}>
              {totalAlumnos > 0 ? Math.round((countAdolescentes / totalAlumnos) * 100) : 0}% del alumnado de esta sede
            </Text>
          </View>

          <View style={styles.sectionCol}>
            <View style={[styles.sectionBadge, { backgroundColor: colors.accentGold }]}>
              <Text style={[styles.sectionBadgeText, { color: '#000000' }]}>JÓVENES Y ADULTOS (16+ AÑOS)</Text>
            </View>
            <Text style={[styles.sectionCount, { color: colors.accentGold }]}>{countAdultos}</Text>
            <Text style={styles.sectionMeta}>
              {totalAlumnos > 0 ? Math.round((countAdultos / totalAlumnos) * 100) : 0}% del alumnado de esta sede
            </Text>
          </View>

          {countSinFecha > 0 && (
            <View style={styles.sectionCol}>
              <View style={[styles.sectionBadge, { backgroundColor: colors.danger }]}>
                <Text style={styles.sectionBadgeText}>EDAD PENDIENTE</Text>
              </View>
              <Text style={[styles.sectionCount, { color: colors.danger }]}>{countSinFecha}</Text>
              <Text style={styles.sectionMeta}>Falta ingresar fecha de nacimiento</Text>
            </View>
          )}
        </View>
      </View>

      {/* 4. REGISTROS PENDIENTES */}
      <View style={styles.boxCard}>
        <View style={styles.boxCardHeader}>
          <View>
            <Text style={styles.boxCardTitle}>REGISTROS PENDIENTES DE VALIDACIÓN TÉCNICA</Text>
            <Text style={styles.boxCardSubtitle}>
              Fichas ingresadas en esta escuela con antecedentes por corroborar (peso, RUT, colegio)
            </Text>
          </View>
          <TouchableOpacity onPress={() => setTab('alumnos')}>
            <Text style={styles.sharpLinkText}>Ver los {totalAlumnos} Alumnos ➔</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.pendingGrid}>
          {schoolStudents
            .filter((s) => !s.rut || !s.peso_actual_kg || !s.fecha_nacimiento)
            .slice(0, 6)
            .map((s) => (
              <View key={s.id} style={[styles.pendingCard, isMobile && { width: '100%' }]}>
                <View style={styles.pendingCardHeader}>
                  <Text style={styles.pendingStudentName} numberOfLines={1}>
                    {s.nombres} {s.apellidos}
                  </Text>
                  <View style={styles.pendingBadge}>
                    <Text style={styles.pendingBadgeText}>Falta Datos</Text>
                  </View>
                </View>

                <View style={styles.pendingDetailsCol}>
                  <Text style={styles.pendingDetailRow}>
                    • RUT: <Text style={{ color: s.rut ? colors.success : colors.danger }}>{s.rut || 'No ingresado'}</Text>
                  </Text>
                  <Text style={styles.pendingDetailRow}>
                    • Peso: <Text style={{ color: s.peso_actual_kg ? colors.success : colors.danger }}>{s.peso_actual_kg ? `${s.peso_actual_kg} kg` : 'No ingresado'}</Text>
                  </Text>
                  <Text style={styles.pendingDetailRow}>
                    • Nacimiento: <Text style={{ color: s.fecha_nacimiento ? colors.success : colors.danger }}>{s.fecha_nacimiento || 'No ingresado'}</Text>
                  </Text>
                </View>

                <TouchableOpacity
                  style={styles.pendingActionBtn}
                  onPress={() => handleGoToStudent(s.id)}
                  activeOpacity={0.8}
                >
                  <Text style={styles.pendingActionBtnText}>Completar Ficha ➔</Text>
                </TouchableOpacity>
              </View>
            ))}

          {schoolStudents.filter((s) => !s.rut || !s.peso_actual_kg || !s.fecha_nacimiento).length === 0 && (
            <View style={styles.allCompleteCard}>
              <Text style={{ fontSize: 28, marginBottom: 8 }}>✅</Text>
              <Text style={styles.allCompleteTitle}>¡TODAS LAS FICHAS TÉCNICAS COMPLETADAS!</Text>
              <Text style={styles.allCompleteSub}>
                Los deportistas de {currentAcademia?.nombre || 'esta sede'} cuentan con sus registros biométricos al día.
              </Text>
            </View>
          )}
        </View>
      </View>

      {/* 5. PORTAL DE AUTO-MATRÍCULA ONLINE */}
      <View style={styles.footerEnrollCard}>
        <View style={styles.footerRibbon}>
          <Text style={styles.footerRibbonText}>PORTAL DE AUTO-MATRÍCULA ONLINE — {currentAcademia?.nombre.toUpperCase()}</Text>
        </View>

        <View style={[styles.footerContentRow, isMobile && { flexDirection: 'column', gap: 16 }]}>
          <View style={{ flex: 1, gap: 8 }}>
            <Text style={styles.footerEnrollTitle}>
              Enlace de Auto-Inscripción Directa para Alumnos Nuevos
            </Text>
            <Text style={styles.footerEnrollDesc}>
              El apoderado o alumno completa su ficha online (RUT, fecha de nacimiento, peso, colegio, talla y cinturón actual) y los datos entran directamente a la base de datos de esta sede.
            </Text>
            <View style={styles.urlBox}>
              <Text style={styles.urlText} numberOfLines={1}>
                https://dojoshitoryu.cl/inscribete?sede={currentAcademia?.id || 'rancagua'}
              </Text>
            </View>
          </View>

          <View style={[styles.footerBtnCol, isMobile && { width: '100%' }]}>
            <TouchableOpacity style={styles.btnCopyLink} onPress={handleCopyLink} activeOpacity={0.85}>
              <Text style={styles.btnCopyLinkText}>
                {copiedLink ? '✓ ¡ENLACE COPIADO AL PORTAPAPELES!' : '📋 COPIAR ENLACE AL PORTAPAPELES'}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.btnPreviewLink}
              onPress={() => setTab('registro_publico')}
              activeOpacity={0.85}
            >
              <Text style={styles.btnPreviewLinkText}>ABRIR FORMULARIO EN VIVO ↗</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
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
    gap: 20,
    maxWidth: 1400,
    width: '100%',
    alignSelf: 'center',
  },
  announcementCard: {
    backgroundColor: colors.bgCard,
    borderWidth: 1,
    borderColor: colors.borderLight,
    borderRadius: radii.lg,
    overflow: 'hidden',
  },
  announcementHeader: {
    backgroundColor: colors.bgSurface,
    paddingVertical: 12,
    paddingHorizontal: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: colors.borderSubtle,
    flexWrap: 'wrap',
    gap: 8,
  },
  announcementBadge: {
    backgroundColor: colors.primary,
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: radii.sm,
  },
  announcementBadgeText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '900',
    letterSpacing: 1,
  },
  announcementDate: {
    color: colors.textMuted,
    fontSize: 11,
    fontWeight: '700',
  },
  announcementBody: {
    padding: 16,
    gap: 12,
  },
  announcementItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 16,
    paddingVertical: 8,
  },
  announcementTopMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    flex: 1,
  },
  announcementDateBox: {
    width: 52,
    height: 52,
    backgroundColor: colors.primaryLight,
    borderWidth: 1,
    borderColor: colors.primary,
    borderRadius: radii.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  announcementDay: {
    color: colors.textPrimary,
    fontSize: 18,
    fontWeight: '900',
    lineHeight: 20,
  },
  announcementMonth: {
    color: colors.primary,
    fontSize: 9,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  announcementItemTitle: {
    color: colors.textPrimary,
    fontSize: 15,
    fontWeight: '800',
  },
  announcementItemDesc: {
    color: colors.textMuted,
    fontSize: 12,
    marginTop: 3,
  },
  announcementActionBtn: {
    backgroundColor: colors.bgInput,
    borderWidth: 1,
    borderColor: colors.primary,
    borderRadius: radii.md,
    paddingVertical: 8,
    paddingHorizontal: 14,
  },
  announcementActionText: {
    color: colors.primary,
    fontSize: 11,
    fontWeight: '800',
  },
  metricsGrid: {
    flexDirection: 'row',
    gap: 16,
    flexWrap: 'wrap',
  },
  metricCard: {
    flex: 1,
    minWidth: 260,
    backgroundColor: colors.bgCard,
    borderWidth: 1,
    borderColor: colors.borderLight,
    borderRadius: radii.lg,
    padding: 20,
  },
  metricCardMobile: {
    minWidth: '100%',
  },
  metricHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  metricLabel: {
    color: colors.textMuted,
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  metricPill: {
    backgroundColor: colors.bgInput,
    paddingVertical: 3,
    paddingHorizontal: 8,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
    borderRadius: radii.sm,
  },
  metricPillText: {
    color: colors.textMuted,
    fontSize: 10,
    fontWeight: '800',
  },
  metricValue: {
    color: colors.textPrimary,
    fontSize: 28,
    fontWeight: '900',
  },
  metricSub: {
    color: colors.textDim,
    fontSize: 11,
    marginTop: 4,
  },
  boxCard: {
    backgroundColor: colors.bgCard,
    borderWidth: 1,
    borderColor: colors.borderLight,
    borderRadius: radii.lg,
    padding: 20,
  },
  boxCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
    flexWrap: 'wrap',
    gap: 10,
  },
  boxCardTitle: {
    color: colors.textPrimary,
    fontSize: 15,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  boxCardSubtitle: {
    color: colors.textMuted,
    fontSize: 12,
    marginTop: 2,
  },
  sharpLinkText: {
    color: colors.primary,
    fontSize: 12,
    fontWeight: '800',
  },
  sectionGrid: {
    flexDirection: 'row',
    gap: 12,
  },
  sectionCol: {
    flex: 1,
    backgroundColor: colors.bgInput,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
    borderRadius: radii.md,
    padding: 16,
  },
  sectionBadge: {
    backgroundColor: colors.bgCardElevated,
    paddingVertical: 4,
    paddingHorizontal: 8,
    alignSelf: 'flex-start',
    borderRadius: radii.sm,
    marginBottom: 10,
  },
  sectionBadgeText: {
    color: '#FFFFFF',
    fontSize: 9,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  sectionCount: {
    color: colors.textPrimary,
    fontSize: 26,
    fontWeight: '900',
  },
  sectionMeta: {
    color: colors.textDim,
    fontSize: 11,
    marginTop: 4,
  },
  pendingGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 14,
  },
  pendingCard: {
    width: '31.5%',
    backgroundColor: colors.bgInput,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
    borderRadius: radii.md,
    padding: 14,
    justifyContent: 'space-between',
  },
  pendingCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  pendingStudentName: {
    color: colors.textPrimary,
    fontSize: 13,
    fontWeight: '800',
    flex: 1,
  },
  pendingBadge: {
    backgroundColor: colors.dangerBg,
    paddingVertical: 2,
    paddingHorizontal: 6,
    borderRadius: radii.xs,
  },
  pendingBadgeText: {
    color: colors.danger,
    fontSize: 9,
    fontWeight: '800',
  },
  pendingDetailsCol: {
    gap: 3,
    marginVertical: 8,
  },
  pendingDetailRow: {
    color: colors.textDim,
    fontSize: 11,
  },
  pendingActionBtn: {
    backgroundColor: colors.primary,
    paddingVertical: 8,
    alignItems: 'center',
    borderRadius: radii.sm,
    marginTop: 4,
  },
  pendingActionBtnText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '800',
  },
  allCompleteCard: {
    flex: 1,
    padding: 30,
    alignItems: 'center',
    justifyContent: 'center',
  },
  allCompleteTitle: {
    color: colors.success,
    fontSize: 14,
    fontWeight: '900',
  },
  allCompleteSub: {
    color: colors.textDim,
    fontSize: 12,
    marginTop: 4,
  },
  footerEnrollCard: {
    backgroundColor: colors.bgCard,
    borderWidth: 1,
    borderColor: colors.primary,
    borderRadius: radii.lg,
    overflow: 'hidden',
  },
  footerRibbon: {
    backgroundColor: colors.primary,
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  footerRibbonText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 1,
  },
  footerContentRow: {
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 20,
  },
  footerEnrollTitle: {
    color: colors.textPrimary,
    fontSize: 16,
    fontWeight: '900',
  },
  footerEnrollDesc: {
    color: colors.textMuted,
    fontSize: 12,
    lineHeight: 18,
  },
  urlBox: {
    backgroundColor: colors.bgInput,
    padding: 10,
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
  },
  urlText: {
    color: colors.primary,
    fontSize: 12,
    fontWeight: '700',
  },
  footerBtnCol: {
    gap: 10,
  },
  btnCopyLink: {
    backgroundColor: colors.primary,
    paddingVertical: 12,
    paddingHorizontal: 18,
    borderRadius: radii.md,
    alignItems: 'center',
  },
  btnCopyLinkText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  btnPreviewLink: {
    backgroundColor: colors.bgInput,
    borderWidth: 1,
    borderColor: colors.borderLight,
    paddingVertical: 12,
    paddingHorizontal: 18,
    borderRadius: radii.md,
    alignItems: 'center',
  },
  btnPreviewLinkText: {
    color: colors.textSecondary,
    fontSize: 11,
    fontWeight: '800',
  },
});
