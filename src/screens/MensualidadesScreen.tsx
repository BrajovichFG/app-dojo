import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Modal } from 'react-native';
import { useDojoStore } from '../store/dojoStore';
import { CENTRAL_ACADEMIA_ID, matchAcademia } from '../data/constants';
import { Alumno, EstadoPago } from '../types';
import { colors, radii, useResponsive } from '../theme/theme';

export const MensualidadesScreen: React.FC = () => {
  const students = useDojoStore((state) => state.students);
  const payments = useDojoStore((state) => state.payments);
  const togglePayment = useDojoStore((state) => state.togglePayment);
  const currentAcademia = useDojoStore((state) => state.currentAcademia);

  const { isMobile } = useResponsive();

  const targetAcademiaId = currentAcademia?.id || CENTRAL_ACADEMIA_ID;
  const schoolStudents = students.filter((s) => matchAcademia(s.academia_id, targetAcademiaId));

  const currentRealMonth = new Date().getMonth() + 1; // Ubicar automáticamente en el mes en curso (1-12)
  const [search, setSearch] = useState('');
  const [selectedMonth, setSelectedMonth] = useState<number>(currentRealMonth);
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'PAGADO' | 'DEUDA'>('ALL');
  const [receiptStudent, setReceiptStudent] = useState<Alumno | null>(null);
  const [receiptPaymentData, setReceiptPaymentData] = useState<{ monto: number; metodo: string } | null>(null);
  const [folioNumber, setFolioNumber] = useState('REC-2026-0042');

  const meses = [
    { num: 1, label: 'Ene' },
    { num: 2, label: 'Feb' },
    { num: 3, label: 'Mar' },
    { num: 4, label: 'Abr' },
    { num: 5, label: 'May' },
    { num: 6, label: 'Jun' },
    { num: 7, label: 'Jul' },
    { num: 8, label: 'Ago' },
    { num: 9, label: 'Sep' },
    { num: 10, label: 'Oct' },
    { num: 11, label: 'Nov' },
    { num: 12, label: 'Dic' },
  ];

  // Filtrado de alumnos por la escuela activa
  const filteredStudents = schoolStudents.filter((s) => {
    const matchesSearch =
      s.nombres.toLowerCase().includes(search.toLowerCase()) ||
      s.apellidos.toLowerCase().includes(search.toLowerCase()) ||
      (s.rut && s.rut.includes(search));

    const isPaid = payments[s.id]?.[selectedMonth]?.estado === 'PAGADO';
    const matchesStatus =
      statusFilter === 'ALL' ||
      (statusFilter === 'PAGADO' && isPaid) ||
      (statusFilter === 'DEUDA' && !isPaid);

    return matchesSearch && matchesStatus;
  });

  // Estadísticas del mes actual seleccionado en esta sede
  const paidCount = schoolStudents.filter((s) => payments[s.id]?.[selectedMonth]?.estado === 'PAGADO').length;
  const pendingCount = schoolStudents.length - paidCount;
  const totalMontoRecaudado = paidCount * 35000;
  const totalProyectado = schoolStudents.length * 35000;

  const handleOpenReceipt = (s: Alumno) => {
    setReceiptStudent(s);
    const pData = payments[s.id]?.[selectedMonth];
    setReceiptPaymentData({
      monto: pData?.monto || 35000,
      metodo: pData?.metodo || 'TRANSFERENCIA',
    });
    setFolioNumber(`REC-2026-${s.id.replace(/\D/g, '').padStart(4, '0')}`);
  };

  const handleSendWhatsApp = () => {
    if (!receiptStudent) return;
    const msg = `*COMPROBANTE DE PAGO — DOJO SHITO RYU*%0A` +
      `--------------------------------%0A` +
      `Alumno: *${receiptStudent.nombres} ${receiptStudent.apellidos}*%0A` +
      `RUT: ${receiptStudent.rut || 'No registrado'}%0A` +
      `Mes Cancelado: *${meses[selectedMonth - 1].label.toUpperCase()} 2026*%0A` +
      `Monto: *$${(receiptPaymentData?.monto || 35000).toLocaleString('es-CL')} CLP*%0A` +
      `Estado: *PAGADO / AL DÍA*%0A` +
      `Sede: ${currentAcademia?.nombre || 'Dojo Central'}%0A` +
      `Folio: ${folioNumber}%0A` +
      `--------------------------------%0A` +
      `Sensei Milton Echeverría • Shito Ryu Kyokan Genbukai`;
    if (typeof window !== 'undefined') {
      window.open(`https://wa.me/?text=${msg}`, '_blank');
    }
  };

  return (
    <View style={styles.container}>
      {/* Barra Superior con KPIs Financieros */}
      <View style={[styles.topStatsBar, isMobile && styles.topStatsBarMobile]}>
        <View style={[styles.statBox, isMobile && { width: '48%', minWidth: 0 }]}>
          <Text style={styles.statLabel}>MES EN REVISIÓN</Text>
          <Text style={styles.statVal}>{meses[selectedMonth - 1].label.toUpperCase()} 2026</Text>
          <Text style={styles.statSub} numberOfLines={1}>{currentAcademia?.nombre || 'Dojo Central'}</Text>
        </View>

        <View style={[styles.statBox, isMobile && { width: '48%', minWidth: 0 }]}>
          <Text style={styles.statLabel}>AL DÍA</Text>
          <Text style={[styles.statVal, { color: colors.success }]}>{paidCount} de {schoolStudents.length}</Text>
          <Text style={styles.statSub}>
            {schoolStudents.length > 0 ? Math.round((paidCount / schoolStudents.length) * 100) : 0}% al día
          </Text>
        </View>

        <View style={[styles.statBox, isMobile && { width: '48%', minWidth: 0 }]}>
          <Text style={styles.statLabel}>PENDIENTES</Text>
          <Text style={[styles.statVal, { color: colors.danger }]}>{pendingCount}</Text>
          <Text style={styles.statSub}>Por cobrar</Text>
        </View>

        <View style={[styles.statBox, isMobile && { width: '48%', minWidth: 0 }]}>
          <Text style={styles.statLabel}>RECAUDADO</Text>
          <Text style={[styles.statVal, { color: colors.primary }]}>
            ${totalMontoRecaudado.toLocaleString('es-CL')}
          </Text>
          <Text style={styles.statSub}>De ${totalProyectado.toLocaleString('es-CL')}</Text>
        </View>

        <View style={[styles.searchBoxWrap, isMobile && { width: '100%', minWidth: 0 }]}>
          <TextInput
            style={styles.searchInput}
            placeholder="Buscar por nombre o RUT..."
            placeholderTextColor={colors.textDim}
            value={search}
            onChangeText={setSearch}
          />
        </View>
      </View>

      {/* Selector de Meses */}
      <View style={styles.monthSelectorBar}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.monthsContent}>
          {meses.map((m) => {
            const isSelected = selectedMonth === m.num;
            return (
              <TouchableOpacity
                key={m.num}
                style={[styles.monthTab, isSelected && styles.monthTabActive]}
                onPress={() => setSelectedMonth(m.num)}
                activeOpacity={0.75}
              >
                <Text style={[styles.monthText, isSelected && styles.monthTextActive]}>
                  {m.label.toUpperCase()}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      {/* Filtros Rápidos de Cobranza */}
      <View style={[styles.filterStrip, isMobile && { flexDirection: 'column', alignItems: 'flex-start', gap: 8 }]}>
        <Text style={styles.filterStripLabel}>FILTRAR NÓMINA ({filteredStudents.length} ALUMNOS):</Text>
        <View style={{ flexDirection: 'row', gap: 6, flexWrap: 'wrap' }}>
          <TouchableOpacity
            style={[styles.statusFilterBtn, statusFilter === 'ALL' && styles.statusFilterBtnActive]}
            onPress={() => setStatusFilter('ALL')}
          >
            <Text style={[styles.statusFilterText, statusFilter === 'ALL' && styles.statusFilterTextActive]}>
              TODOS ({schoolStudents.length})
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.statusFilterBtn, statusFilter === 'PAGADO' && styles.statusFilterBtnActiveGreen]}
            onPress={() => setStatusFilter('PAGADO')}
          >
            <Text style={[styles.statusFilterText, statusFilter === 'PAGADO' && { color: colors.success }]}>
              PAGADO ({paidCount})
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.statusFilterBtn, statusFilter === 'DEUDA' && styles.statusFilterBtnActiveRed]}
            onPress={() => setStatusFilter('DEUDA')}
          >
            <Text style={[styles.statusFilterText, statusFilter === 'DEUDA' && { color: colors.danger }]}>
              DEUDA ({pendingCount})
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Grilla / Nómina de Alumnos con Control de Pago */}
      <ScrollView style={styles.listScroll} contentContainerStyle={[styles.listContent, isMobile && { padding: 12 }]}>
        {!isMobile && (
          <View style={styles.tableHeader}>
            <Text style={[styles.thText, { flex: 2 }]}>ALUMNO / IDENTIFICACIÓN</Text>
            <Text style={[styles.thText, { flex: 1.5 }]}>GRUPO / SECCIÓN</Text>
            <Text style={[styles.thText, { flex: 1, textAlign: 'center' }]}>DÍA CORTE</Text>
            <Text style={[styles.thText, { flex: 1.5, textAlign: 'center' }]}>ESTADO {meses[selectedMonth - 1].label.toUpperCase()}</Text>
            <Text style={[styles.thText, { flex: 1.5, textAlign: 'right' }]}>COMPROBANTE</Text>
          </View>
        )}

        {filteredStudents.map((s) => {
          const isPaid = payments[s.id]?.[selectedMonth]?.estado === 'PAGADO';
          const pRecord = payments[s.id]?.[selectedMonth];

          if (isMobile) {
            // Tarjeta Móvil Responsive para Teléfonos
            return (
              <View key={s.id} style={styles.mobilePaymentCard}>
                <View style={styles.mobileCardTopRow}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.studentNameText} numberOfLines={1}>
                      {s.nombres} {s.apellidos}
                    </Text>
                    <Text style={styles.studentRutText}>{s.rut || 'Sin RUT'}</Text>
                  </View>
                  <View style={[styles.statusBadge, { backgroundColor: isPaid ? colors.successBg : colors.dangerBg, borderColor: isPaid ? colors.successBorder : colors.dangerBorder }]}>
                    <Text style={[styles.statusBadgeText, { color: isPaid ? colors.success : colors.danger }]}>
                      {isPaid ? 'PAGADO' : 'DEUDA'}
                    </Text>
                  </View>
                </View>

                <View style={styles.mobileCardMetaRow}>
                  <Text style={styles.mobileMetaText}>
                    Corte: Día {s.dia_pago_mensual || 5} • $35.000 CLP
                  </Text>
                </View>

                <View style={styles.mobileCardActionsRow}>
                  <TouchableOpacity
                    style={[
                      styles.togglePayBtn,
                      isPaid ? styles.togglePayBtnActive : styles.togglePayBtnPending,
                      { flex: 1 },
                    ]}
                    onPress={() => togglePayment(s.id, selectedMonth)}
                    activeOpacity={0.8}
                  >
                    <Text style={[styles.togglePayBtnText, isPaid && { color: '#FFFFFF' }]}>
                      {isPaid ? 'PAGADO' : 'REGISTRAR PAGO'}
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.receiptActionBtn}
                    onPress={() => handleOpenReceipt(s)}
                    activeOpacity={0.8}
                  >
                    <Text style={styles.receiptActionBtnText}>RECIBO</Text>
                  </TouchableOpacity>
                </View>
              </View>
            );
          }

          // Fila Desktop
          return (
            <View key={s.id} style={styles.tableRow}>
              <View style={{ flex: 2 }}>
                <Text style={styles.studentNameText}>
                  {s.nombres} {s.apellidos}
                </Text>
                <Text style={styles.studentRutText}>{s.rut || 'Sin RUT'}</Text>
              </View>

              <View style={{ flex: 1.5 }}>
                <Text style={styles.sectionBadgeText}>
                  {s.seccion_id === 'sec-1'
                    ? 'Grupo I (4-6)'
                    : s.seccion_id === 'sec-2'
                    ? 'Grupo II (4-6)'
                    : s.seccion_id === 'sec-3'
                    ? 'Adolescentes'
                    : 'Adultos'}
                </Text>
              </View>

              <View style={{ flex: 1, alignItems: 'center' }}>
                <Text style={styles.cutDayText}>Día {s.dia_pago_mensual || 5}</Text>
              </View>

              <View style={{ flex: 1.5, alignItems: 'center' }}>
                <TouchableOpacity
                  style={[
                    styles.togglePayBtn,
                    isPaid ? styles.togglePayBtnActive : styles.togglePayBtnPending,
                  ]}
                  onPress={() => togglePayment(s.id, selectedMonth)}
                  activeOpacity={0.8}
                >
                  <Text style={[styles.togglePayBtnText, isPaid && { color: '#FFFFFF' }]}>
                    {isPaid ? 'PAGADO' : 'MARCAR PAGADO'}
                  </Text>
                </TouchableOpacity>
              </View>

              <View style={{ flex: 1.5, alignItems: 'flex-end' }}>
                <TouchableOpacity
                  style={styles.receiptActionBtn}
                  onPress={() => handleOpenReceipt(s)}
                  activeOpacity={0.8}
                >
                  <Text style={styles.receiptActionBtnText}>GENERAR RECIBO</Text>
                </TouchableOpacity>
              </View>
            </View>
          );
        })}

        {filteredStudents.length === 0 && (
          <View style={styles.emptyBox}>
            <Text style={styles.emptyText}>No hay alumnos con los criterios seleccionados en esta sede.</Text>
          </View>
        )}
      </ScrollView>

      {/* MODAL: COMPROBANTE DE PAGO FORMAL DEL DOJO */}
      {receiptStudent && (
        <Modal transparent animationType="fade" visible={Boolean(receiptStudent)}>
          <View style={styles.modalOverlay}>
            <View style={[styles.receiptCard, isMobile && { width: '95%' }]}>
              {/* Encabezado del Recibo */}
              <View style={styles.receiptHeader}>
                <View style={styles.receiptBrand}>
                  <View>
                    <Text style={styles.receiptBrandTitle}>SHITO RYU KYOKAN GENBUKAI</Text>
                    <Text style={styles.receiptBrandSubtitle}>Rancagua • Región de O'Higgins • Chile</Text>
                  </View>
                </View>
                <View style={{ alignItems: 'flex-end' }}>
                  <Text style={styles.receiptVoucherLabel}>COMPROBANTE DE PAGO</Text>
                  <Text style={styles.receiptVoucherNum}>{folioNumber}</Text>
                </View>
              </View>

              {/* Cuerpo del Comprobante */}
              <View style={{ padding: 24, gap: 14 }}>
                <View style={styles.receiptRow}>
                  <Text style={styles.receiptLabel}>ALUMNO TITULAR:</Text>
                  <Text style={styles.receiptVal}>
                    {receiptStudent.nombres} {receiptStudent.apellidos}
                  </Text>
                </View>

                <View style={styles.receiptRow}>
                  <Text style={styles.receiptLabel}>RUT DEL DEPORTISTA:</Text>
                  <Text style={styles.receiptVal}>{receiptStudent.rut || 'No registrado'}</Text>
                </View>

                <View style={styles.receiptRow}>
                  <Text style={styles.receiptLabel}>PERÍODO MENSUAL:</Text>
                  <Text style={styles.receiptVal}>
                    {meses[selectedMonth - 1].label.toUpperCase()} 2026
                  </Text>
                </View>

                <View style={styles.receiptRow}>
                  <Text style={styles.receiptLabel}>SEDE CORRESPONDIENTE:</Text>
                  <Text style={styles.receiptVal}>{currentAcademia?.nombre || 'Dojo Central'}</Text>
                </View>

                <View style={styles.receiptRow}>
                  <Text style={styles.receiptLabel}>MÉTODO REGISTRADO:</Text>
                  <Text style={styles.receiptVal}>{receiptPaymentData?.metodo || 'TRANSFERENCIA BANCARIA'}</Text>
                </View>

                <View style={styles.receiptTotalBox}>
                  <Text style={styles.receiptTotalLabel}>MONTO CANCELADO:</Text>
                  <Text style={styles.receiptTotalVal}>
                    ${(receiptPaymentData?.monto || 35000).toLocaleString('es-CL')} CLP
                  </Text>
                </View>

                <Text style={styles.receiptLegalNote}>
                  Este comprobante digital certifica la regularización de la mensualidad deportiva correspondiente a la formación integral de karate do en la escuela activa.
                </Text>

                <View style={[styles.receiptBtnRow, isMobile && { flexDirection: 'column' }]}>
                  <TouchableOpacity
                    style={[styles.btnPrint, { backgroundColor: '#166534', borderColor: '#22C55E' }]}
                    onPress={handleSendWhatsApp}
                  >
                    <Text style={[styles.btnPrintText, { color: '#FFFFFF' }]}>ENVIAR POR WHATSAPP</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.btnPrint}
                    onPress={() => {
                      if (typeof window !== 'undefined') window.print();
                    }}
                  >
                    <Text style={styles.btnPrintText}>GUARDAR PDF</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.btnCloseReceipt}
                    onPress={() => setReceiptStudent(null)}
                  >
                    <Text style={styles.btnCloseReceiptText}>CERRAR</Text>
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
  topStatsBar: {
    backgroundColor: colors.bgSurface,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderSubtle,
    paddingHorizontal: 20,
    paddingVertical: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    flexWrap: 'wrap',
  },
  topStatsBarMobile: {
    paddingHorizontal: 12,
    paddingVertical: 10,
    gap: 8,
  },
  statBox: {
    backgroundColor: colors.bgCard,
    borderWidth: 1,
    borderColor: colors.borderLight,
    paddingVertical: 10,
    paddingHorizontal: 14,
    minWidth: 140,
    borderRadius: radii.md,
  },
  statLabel: {
    color: colors.textDim,
    fontSize: 9,
    fontWeight: '900',
    letterSpacing: 0.8,
  },
  statVal: {
    color: colors.textPrimary,
    fontSize: 16,
    fontWeight: '900',
    marginTop: 2,
  },
  statSub: {
    color: colors.textDim,
    fontSize: 10,
    marginTop: 2,
  },
  searchBoxWrap: {
    flex: 1,
    minWidth: 200,
  },
  searchInput: {
    backgroundColor: colors.bgInput,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
    borderRadius: radii.md,
    paddingHorizontal: 12,
    paddingVertical: 10,
    color: colors.textPrimary,
    fontSize: 12,
  },
  monthSelectorBar: {
    backgroundColor: colors.bgDarkest,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderSubtle,
    paddingVertical: 6,
  },
  monthsContent: {
    paddingHorizontal: 12,
    flexDirection: 'row',
    gap: 6,
  },
  monthTab: {
    paddingVertical: 7,
    paddingHorizontal: 16,
    backgroundColor: colors.bgCard,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
    borderRadius: radii.md,
  },
  monthTabActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primaryHover,
  },
  monthText: {
    color: colors.textMuted,
    fontSize: 11,
    fontWeight: '800',
  },
  monthTextActive: {
    color: '#FFFFFF',
    fontWeight: '900',
  },
  filterStrip: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: colors.bgSurface,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderSubtle,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  filterStripLabel: {
    color: colors.textDim,
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  statusFilterBtn: {
    paddingVertical: 5,
    paddingHorizontal: 10,
    backgroundColor: colors.bgCard,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
    borderRadius: radii.sm,
  },
  statusFilterBtnActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primaryHover,
  },
  statusFilterBtnActiveGreen: {
    backgroundColor: colors.successBg,
    borderColor: colors.successBorder,
  },
  statusFilterBtnActiveRed: {
    backgroundColor: colors.dangerBg,
    borderColor: colors.dangerBorder,
  },
  statusFilterText: {
    color: colors.textMuted,
    fontSize: 10,
    fontWeight: '800',
  },
  statusFilterTextActive: {
    color: '#FFFFFF',
  },
  listScroll: {
    flex: 1,
  },
  listContent: {
    padding: 16,
    maxWidth: 1280,
    width: '100%',
    alignSelf: 'center',
    gap: 8,
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: colors.bgSurface,
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
    borderRadius: radii.md,
  },
  thText: {
    color: colors.textDim,
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 0.8,
  },
  tableRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.bgCard,
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderWidth: 1,
    borderColor: colors.borderLight,
    borderRadius: radii.md,
  },
  mobilePaymentCard: {
    backgroundColor: colors.bgCard,
    borderWidth: 1,
    borderColor: colors.borderLight,
    borderRadius: radii.lg,
    padding: 14,
    gap: 10,
  },
  mobileCardTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  statusBadge: {
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderWidth: 1,
    borderRadius: radii.sm,
  },
  statusBadgeText: {
    fontSize: 10,
    fontWeight: '900',
  },
  mobileCardMetaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  mobileMetaText: {
    color: colors.textDim,
    fontSize: 11,
  },
  mobileCardActionsRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 2,
  },
  studentNameText: {
    color: colors.textPrimary,
    fontSize: 13,
    fontWeight: '800',
  },
  studentRutText: {
    color: colors.textDim,
    fontSize: 11,
    marginTop: 1,
  },
  sectionBadgeText: {
    color: colors.textSecondary,
    fontSize: 11,
    fontWeight: '700',
  },
  cutDayText: {
    color: colors.textMuted,
    fontSize: 11,
  },
  togglePayBtn: {
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: radii.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  togglePayBtnActive: {
    backgroundColor: colors.success,
  },
  togglePayBtnPending: {
    backgroundColor: colors.bgInput,
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  togglePayBtnText: {
    color: colors.textMuted,
    fontSize: 11,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  receiptActionBtn: {
    backgroundColor: colors.bgInput,
    borderWidth: 1,
    borderColor: colors.primary,
    borderRadius: radii.md,
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  receiptActionBtnText: {
    color: colors.primary,
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  emptyBox: {
    padding: 30,
    alignItems: 'center',
  },
  emptyText: {
    color: colors.textDim,
    fontSize: 12,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.85)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  receiptCard: {
    width: 540,
    backgroundColor: colors.bgCard,
    borderWidth: 1,
    borderColor: colors.borderLight,
    borderRadius: radii.xl,
    overflow: 'hidden',
  },
  receiptHeader: {
    backgroundColor: colors.primary,
    padding: 18,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  receiptBrand: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  receiptBrandTitle: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '900',
    letterSpacing: 0.8,
  },
  receiptBrandSubtitle: {
    color: '#FFE2D1',
    fontSize: 10,
    marginTop: 1,
  },
  receiptVoucherLabel: {
    color: '#FFFFFF',
    fontSize: 9,
    fontWeight: '900',
    letterSpacing: 1,
  },
  receiptVoucherNum: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '900',
    marginTop: 2,
  },
  receiptRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderSubtle,
  },
  receiptLabel: {
    color: colors.textDim,
    fontSize: 11,
    fontWeight: '800',
  },
  receiptVal: {
    color: colors.textPrimary,
    fontSize: 12,
    fontWeight: '700',
  },
  receiptTotalBox: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: colors.bgInput,
    padding: 14,
    borderRadius: radii.md,
    marginTop: 6,
    borderWidth: 1,
    borderColor: colors.primary,
  },
  receiptTotalLabel: {
    color: colors.textPrimary,
    fontSize: 12,
    fontWeight: '900',
  },
  receiptTotalVal: {
    color: colors.primary,
    fontSize: 18,
    fontWeight: '900',
  },
  receiptLegalNote: {
    color: colors.textDim,
    fontSize: 10,
    lineHeight: 14,
    textAlign: 'center',
    marginVertical: 4,
  },
  receiptBtnRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 8,
  },
  btnPrint: {
    flex: 1,
    backgroundColor: colors.primary,
    paddingVertical: 12,
    borderRadius: radii.md,
    alignItems: 'center',
  },
  btnPrintText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  btnCloseReceipt: {
    flex: 1,
    backgroundColor: colors.bgInput,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
    paddingVertical: 12,
    borderRadius: radii.md,
    alignItems: 'center',
  },
  btnCloseReceiptText: {
    color: colors.textMuted,
    fontSize: 12,
    fontWeight: '800',
  },
});
