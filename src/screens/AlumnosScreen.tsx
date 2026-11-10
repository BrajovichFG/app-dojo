import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TextInput, TouchableOpacity, Image, Modal } from 'react-native';
import { useDojoStore } from '../store/dojoStore';
import {
  CATEGORIAS_KUMITE_EXCEL,
  CATEGORIAS_KATA_EXCEL,
  CATEGORIAS_PARA_KARATE_EXCEL,
  GRADOS_CINTURON,
  CENTRAL_ACADEMIA_ID,
  matchAcademia,
} from '../data/constants';
import { calcularEdadDescriptiva, sugerirCategoriaKata, sugerirCategoriaKumite, validarRut } from '../utils/karateEngine';
import { Alumno } from '../types';
import { colors, radii, useResponsive } from '../theme/theme';

export const AlumnosScreen: React.FC = () => {
  const students = useDojoStore((state) => state.students);
  const selectedStudentId = useDojoStore((state) => state.selectedStudentId);
  const selectStudent = useDojoStore((state) => state.selectStudent);
  const updateStudent = useDojoStore((state) => state.updateStudent);
  const reassignStudentAcademia = useDojoStore((state) => state.reassignStudentAcademia);
  const payments = useDojoStore((state) => state.payments);
  const currentAcademia = useDojoStore((state) => state.currentAcademia);
  const switchAcademia = useDojoStore((state) => state.switchAcademia);
  const academias = useDojoStore((state) => state.academias);
  const setTab = useDojoStore((state) => state.setTab);

  const { isMobile } = useResponsive();
  const [mobileTab, setMobileTab] = useState<'LIST' | 'DETAIL'>('LIST');

  const [search, setSearch] = useState('');
  type FilterAgeGroup = 'ALL' | 'PREESCOLAR' | 'ADOLESCENTES' | 'ADULTOS';
  const [filterSection, setFilterSection] = useState<FilterAgeGroup>('ALL');

  // Control de scroll horizontal con botones para computadoras sin touchpad
  const filterScrollRef = React.useRef<any>(null);
  const [filterScrollX, setFilterScrollX] = useState(0);

  const handleScrollRight = () => {
    const nextPos = filterScrollX + 160;
    filterScrollRef.current?.scrollTo({ x: nextPos, animated: true });
    setFilterScrollX(nextPos);
  };

  const handleScrollLeft = () => {
    const nextPos = Math.max(0, filterScrollX - 160);
    filterScrollRef.current?.scrollTo({ x: nextPos, animated: true });
    setFilterScrollX(nextPos);
  };

  // Filtrar alumnos por la escuela activa
  const targetAcademiaId = currentAcademia?.id || CENTRAL_ACADEMIA_ID;
  const schoolStudents = students.filter((s) => matchAcademia(s.academia_id, targetAcademiaId));

  // Cálculo de conteos por grupo etario en esta sede
  const countPreescolar = schoolStudents.filter((s) => {
    if (s.seccion_id === 'sec-1' || s.seccion_id === 'sec-2') return true;
    if (s.fecha_nacimiento) {
      const parts = s.fecha_nacimiento.split('-');
      const y = parseInt(parts[0], 10);
      const age = new Date().getFullYear() - y;
      return age >= 4 && age <= 6;
    }
    return false;
  }).length;

  const countAdolescentes = schoolStudents.filter((s) => {
    if (s.seccion_id === 'sec-3') return true;
    if (s.fecha_nacimiento) {
      const parts = s.fecha_nacimiento.split('-');
      const y = parseInt(parts[0], 10);
      const age = new Date().getFullYear() - y;
      return age >= 7 && age <= 15;
    }
    return false;
  }).length;

  const countAdultos = schoolStudents.filter((s) => {
    if (s.seccion_id === 'sec-4') return true;
    if (s.fecha_nacimiento) {
      const parts = s.fecha_nacimiento.split('-');
      const y = parseInt(parts[0], 10);
      const age = new Date().getFullYear() - y;
      return age >= 16;
    }
    return false;
  }).length;

  // Alumno seleccionado dentro de la escuela activa
  const selectedStudent = schoolStudents.find((s) => s.id === selectedStudentId) || schoolStudents[0] || null;

  // Estado del formulario de edición completa
  const [editPeso, setEditPeso] = useState<string>('');
  const [editRut, setEditRut] = useState<string>('');
  const [editDob, setEditDob] = useState<string>('');
  const [editColegio, setEditColegio] = useState<string>('');
  const [editTallaPolera, setEditTallaPolera] = useState<string>('');
  const [editTallaPantalon, setEditTallaPantalon] = useState<string>('');
  const [editCatKumite, setEditCatKumite] = useState<string>('');
  const [editCatKata, setEditCatKata] = useState<string>('');
  const [editFotoUrl, setEditFotoUrl] = useState<string>('');
  const [editCinturonId, setEditCinturonId] = useState<number>(1);
  const [isEditing, setIsEditing] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Modal para seleccionar categoría del listado oficial completo
  const [showCategoryPicker, setShowCategoryPicker] = useState<'KUMITE' | 'KATA' | null>(null);

  // Filtrado de alumnos en lista
  const filteredStudents = schoolStudents.filter((s) => {
    const matchesSearch =
      s.nombres.toLowerCase().includes(search.toLowerCase()) ||
      s.apellidos.toLowerCase().includes(search.toLowerCase()) ||
      (s.rut && s.rut.includes(search));

    const matchesSection = (() => {
      if (filterSection === 'ALL') return true;
      if (filterSection === 'PREESCOLAR') {
        if (s.seccion_id === 'sec-1' || s.seccion_id === 'sec-2') return true;
        if (s.fecha_nacimiento) {
          const parts = s.fecha_nacimiento.split('-');
          const y = parseInt(parts[0], 10);
          const age = new Date().getFullYear() - y;
          return age >= 4 && age <= 6;
        }
        return false;
      }
      if (filterSection === 'ADOLESCENTES') {
        if (s.seccion_id === 'sec-3') return true;
        if (s.fecha_nacimiento) {
          const parts = s.fecha_nacimiento.split('-');
          const y = parseInt(parts[0], 10);
          const age = new Date().getFullYear() - y;
          return age >= 7 && age <= 15;
        }
        return false;
      }
      if (filterSection === 'ADULTOS') {
        if (s.seccion_id === 'sec-4') return true;
        if (s.fecha_nacimiento) {
          const parts = s.fecha_nacimiento.split('-');
          const y = parseInt(parts[0], 10);
          const age = new Date().getFullYear() - y;
          return age >= 16;
        }
        return false;
      }
      return true;
    })();

    return matchesSearch && matchesSection;
  });

  const handleSelect = (s: Alumno) => {
    selectStudent(s.id);
    setEditPeso(s.peso_actual_kg ? s.peso_actual_kg.toString() : '');
    setEditRut(s.rut || '');
    setEditDob(s.fecha_nacimiento || '');
    setEditColegio(s.lugar_estudio_trabajo || '');
    setEditTallaPolera(s.talla_polera || 'M');
    setEditTallaPantalon(s.talla_pantalon || 'Talla 3');
    setEditCatKumite(s.categoria_kumite_manual || s.categoria_kumite || '');
    setEditCatKata(s.categoria_kata_manual || s.categoria_kata || '');
    setEditFotoUrl(s.foto_url || '');
    setEditCinturonId(s.cinturon_id || 1);
    setIsEditing(false);
    if (isMobile) {
      setMobileTab('DETAIL');
    }
  };

  // Función para abrir el selector de archivos nativo del computador o teléfono
  const handlePickPhoto = () => {
    if (typeof document !== 'undefined') {
      const input = document.createElement('input');
      input.type = 'file';
      input.accept = 'image/*';
      input.onchange = (e: any) => {
        const file = e.target?.files?.[0];
        if (file) {
          const reader = new FileReader();
          reader.onload = (event) => {
            const base64 = event.target?.result as string;
            if (base64 && selectedStudent) {
              setEditFotoUrl(base64);
              updateStudent(selectedStudent.id, { foto_url: base64 });
              setSaveSuccess(true);
              setTimeout(() => setSaveSuccess(false), 2000);
            }
          };
          reader.readAsDataURL(file);
        }
      };
      input.click();
    }
  };

  const handleSaveStudent = () => {
    if (!selectedStudent) return;
    const pesoNum = editPeso ? parseFloat(editPeso.replace(',', '.')) : undefined;

    updateStudent(selectedStudent.id, {
      peso_actual_kg: isNaN(pesoNum as any) ? undefined : pesoNum,
      rut: editRut.trim() || undefined,
      fecha_nacimiento: editDob.trim() || undefined,
      lugar_estudio_trabajo: editColegio.trim() || undefined,
      talla_polera: editTallaPolera.trim() || undefined,
      talla_pantalon: editTallaPantalon.trim() || undefined,
      categoria_kumite_manual: editCatKumite.trim() || undefined,
      categoria_kata_manual: editCatKata.trim() || undefined,
      foto_url: editFotoUrl.trim() || undefined,
      cinturon_id: editCinturonId,
    });

    setIsEditing(false);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 2500);
  };

  // Cálculo en tiempo real de categoría sugerida por el motor WKF
  const effectiveDob = isEditing ? editDob : selectedStudent?.fecha_nacimiento;
  const effectivePeso = isEditing
    ? parseFloat(editPeso.replace(',', '.'))
    : selectedStudent?.peso_actual_kg;

  const kataSugerida = effectiveDob
    ? sugerirCategoriaKata(effectiveDob, selectedStudent?.genero || 'M')
    : null;

  const kumiteSugerida = effectiveDob && effectivePeso
    ? sugerirCategoriaKumite(effectiveDob, selectedStudent?.genero || 'M', effectivePeso)
    : null;

  const cinturon = GRADOS_CINTURON.find((g) => g.id === (isEditing ? editCinturonId : selectedStudent?.cinturon_id)) || GRADOS_CINTURON[0];
  const currentMonthNum = new Date().getMonth() + 1;
  const isUpToDate = payments[selectedStudent?.id]?.[currentMonthNum]?.estado === 'PAGADO';

  return (
    <View style={styles.container}>
      {/* Selector Móvil de Pestañas (Lista vs Ficha) si está en teléfono */}
      {isMobile && (
        <View style={styles.mobileTabBar}>
          <TouchableOpacity
            style={[styles.mobileTabBtn, mobileTab === 'LIST' && styles.mobileTabBtnActive]}
            onPress={() => setMobileTab('LIST')}
          >
            <Text style={[styles.mobileTabBtnText, mobileTab === 'LIST' && styles.mobileTabBtnTextActive]}>
              LISTA ({filteredStudents.length})
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.mobileTabBtn, mobileTab === 'DETAIL' && styles.mobileTabBtnActive]}
            onPress={() => setMobileTab('DETAIL')}
            disabled={!selectedStudent}
          >
            <Text style={[styles.mobileTabBtnText, mobileTab === 'DETAIL' && styles.mobileTabBtnTextActive]}>
              FICHA TÉCNICA
            </Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Panel Izquierdo: Lista de Alumnos (Visible en Desktop o en Mobile cuando mobileTab === 'LIST') */}
      {(!isMobile || mobileTab === 'LIST') && (
        <View style={[styles.listPanel, isMobile && styles.listPanelMobile]}>
          {/* Selector de Sede Activa en Cabecera del Panel */}
          <View style={styles.sedePanelContainer}>
            <View style={styles.sedePanelHeader}>
              <Text style={styles.sedePanelTitle}>SEDE ACTIVA</Text>
              <Text style={styles.sedePanelBadge}>
                {schoolStudents.length} {schoolStudents.length === 1 ? 'ALUMNO' : 'ALUMNOS'}
              </Text>
            </View>
            <View style={styles.sedePillsWrap}>
              {academias.map((ac) => {
                const isCurrent = matchAcademia(currentAcademia?.id, ac.id);
                const countInSede = students.filter((s) => matchAcademia(s.academia_id, ac.id)).length;

                return (
                  <TouchableOpacity
                    key={ac.id}
                    style={[styles.sedePillBtn, isCurrent && styles.sedePillBtnActive]}
                    onPress={() => switchAcademia(ac.id)}
                    activeOpacity={0.8}
                  >
                    <Text style={[styles.sedePillBtnText, isCurrent && styles.sedePillBtnTextActive]}>
                      {isCurrent ? '● ' : ''}{ac.nombre.replace('Dojo Shito Ryu ', '')} ({countInSede})
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>

          <View style={styles.searchBarContainer}>
            <TextInput
              style={styles.searchInput}
              placeholder="Buscar por nombre o RUT..."
              placeholderTextColor={colors.textDim}
              value={search}
              onChangeText={setSearch}
            />
          </View>

          {/* Filtros de Secciones por Grupos Etarios con botones < y > para navegación con mouse */}
          <View style={styles.filterPillsContainer}>
            {filterScrollX > 10 && (
              <TouchableOpacity
                style={styles.scrollArrowBtn}
                onPress={handleScrollLeft}
                activeOpacity={0.7}
              >
                <Text style={styles.scrollArrowText}>‹</Text>
              </TouchableOpacity>
            )}

            <ScrollView
              ref={filterScrollRef}
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ gap: 6, paddingHorizontal: 6 }}
              onScroll={(e) => setFilterScrollX(e.nativeEvent.contentOffset.x)}
              scrollEventThrottle={16}
              style={{ flex: 1 }}
            >
              <TouchableOpacity
                style={[styles.filterPill, filterSection === 'ALL' && styles.filterPillActive]}
                onPress={() => setFilterSection('ALL')}
              >
                <Text style={[styles.filterPillText, filterSection === 'ALL' && styles.filterPillTextActive]}>
                  TODOS ({schoolStudents.length})
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.filterPill, filterSection === 'PREESCOLAR' && styles.filterPillActive]}
                onPress={() => setFilterSection('PREESCOLAR')}
              >
                <Text style={[styles.filterPillText, filterSection === 'PREESCOLAR' && styles.filterPillTextActive]}>
                  PREESCOLAR (4-6) ({countPreescolar})
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.filterPill, filterSection === 'ADOLESCENTES' && styles.filterPillActive]}
                onPress={() => setFilterSection('ADOLESCENTES')}
              >
                <Text style={[styles.filterPillText, filterSection === 'ADOLESCENTES' && styles.filterPillTextActive]}>
                  ADOLESCENTES (7-15) ({countAdolescentes})
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.filterPill, filterSection === 'ADULTOS' && styles.filterPillActive]}
                onPress={() => setFilterSection('ADULTOS')}
              >
                <Text style={[styles.filterPillText, filterSection === 'ADULTOS' && styles.filterPillTextActive]}>
                  ADULTOS (16+) ({countAdultos})
                </Text>
              </TouchableOpacity>
            </ScrollView>

            <TouchableOpacity
              style={styles.scrollArrowBtn}
              onPress={handleScrollRight}
              activeOpacity={0.7}
            >
              <Text style={styles.scrollArrowText}>›</Text>
            </TouchableOpacity>
          </View>

          {/* Lista de Alumnos */}
          <ScrollView style={{ flex: 1 }}>
            {filteredStudents.length === 0 ? (
              <View style={styles.emptyListNotice}>
                <Text style={styles.emptyListNoticeText}>
                  {schoolStudents.length === 0
                    ? `No hay alumnos asignados a ${currentAcademia?.nombre || 'esta sede'}.`
                    : 'No se encontraron alumnos con el filtro actual.'}
                </Text>
              </View>
            ) : (
              filteredStudents.map((s) => {
                const isSelected = selectedStudent?.id === s.id;
                const alDia = payments[s.id]?.[currentMonthNum]?.estado === 'PAGADO';

                return (
                  <TouchableOpacity
                    key={s.id}
                    style={[styles.studentCard, isSelected && styles.studentCardSelected]}
                    onPress={() => handleSelect(s)}
                    activeOpacity={0.8}
                  >
                    <View style={styles.studentCardContent}>
                      <View style={[styles.studentAvatar, isSelected && styles.studentAvatarSelected]}>
                        {s.foto_url ? (
                          <Image source={{ uri: s.foto_url }} style={styles.avatarImage} />
                        ) : (
                          <Text style={styles.avatarInitial}>{s.nombres.charAt(0)}</Text>
                        )}
                      </View>
                      <View style={{ flex: 1 }}>
                        <Text style={[styles.studentCardName, isSelected && styles.studentCardNameSelected]} numberOfLines={1}>
                          {s.nombres} {s.apellidos}
                        </Text>
                        <Text style={styles.studentCardMeta} numberOfLines={1}>
                          {s.rut || 'Sin RUT'} • {s.peso_actual_kg ? `${s.peso_actual_kg}kg` : 'Sin peso'}
                        </Text>
                      </View>
                      <View style={[styles.paymentDot, { backgroundColor: alDia ? colors.success : colors.danger }]} />
                      {isMobile && <Text style={styles.cardArrow}>➔</Text>}
                    </View>
                  </TouchableOpacity>
                );
              })
            )}
          </ScrollView>
        </View>
      )}

      {/* Panel Derecho: Ficha Técnica (Visible en Desktop o en Mobile cuando mobileTab === 'DETAIL') */}
      {(!isMobile || mobileTab === 'DETAIL') && (
        <View style={styles.detailContainer}>
          {isMobile && (
            <TouchableOpacity style={styles.mobileBackBtn} onPress={() => setMobileTab('LIST')}>
              <Text style={styles.mobileBackBtnText}>← VOLVER AL LISTADO DE ALUMNOS</Text>
            </TouchableOpacity>
          )}

          {selectedStudent ? (
            <ScrollView style={styles.detailScroll} contentContainerStyle={[styles.detailContentCentered, isMobile && { padding: 12 }]}>
              {saveSuccess && (
                <View style={styles.successToast}>
                  <Text style={styles.successToastText}>✓ FICHA DE ALUMNO ACTUALIZADA CORRECTAMENTE</Text>
                </View>
              )}

              {/* Cabecera Principal del Alumno */}
              <View style={styles.profileCard}>
                <View style={[styles.profileTopRow, isMobile && { flexDirection: 'column', alignItems: 'center' }]}>
                  {/* Contenedor de Foto con Clic para Abrir Explorador de Archivos */}
                  <View style={styles.photoContainer}>
                    {selectedStudent.foto_url ? (
                      <Image source={{ uri: selectedStudent.foto_url }} style={styles.photoImage} />
                    ) : (
                      <View style={styles.photoPlaceholder}>
                        <Text style={styles.photoPlaceholderLetter}>{selectedStudent.nombres.charAt(0)}</Text>
                      </View>
                    )}
                    <TouchableOpacity
                      style={styles.changePhotoBtn}
                      onPress={handlePickPhoto}
                      activeOpacity={0.85}
                    >
                      <Text style={styles.changePhotoBtnText}>SUBIR FOTO</Text>
                    </TouchableOpacity>
                  </View>

                  <View style={[{ flex: 1, gap: 6 }, isMobile && { width: '100%', alignItems: 'center' }]}>
                    <Text style={[styles.profileFullName, isMobile && { textAlign: 'center', fontSize: 18 }]}>
                      {selectedStudent.nombres} {selectedStudent.apellidos}
                    </Text>
                    <Text style={styles.profileRut}>RUT: {selectedStudent.rut || 'No registrado aún'}</Text>
                    <Text style={styles.profileSchool}>
                      Escuela: <Text style={{ color: colors.textPrimary, fontWeight: '800' }}>
                        {academias.find((a) => matchAcademia(selectedStudent.academia_id, a.id))?.nombre || currentAcademia?.nombre || 'Dojo Central'}
                      </Text>
                    </Text>

                    <View style={[styles.badgeTagsRow, isMobile && { justifyContent: 'center' }]}>
                      <View style={styles.beltBadge}>
                        <Text style={styles.beltText}>{cinturon.nombre.toUpperCase()}</Text>
                      </View>
                      <View style={[styles.financeBadge, { backgroundColor: isUpToDate ? 'rgba(16, 185, 129, 0.12)' : 'rgba(239, 68, 68, 0.12)', borderColor: isUpToDate ? 'rgba(16, 185, 129, 0.35)' : 'rgba(239, 68, 68, 0.35)' }]}>
                        <Text style={[styles.financeText, { color: isUpToDate ? colors.success : colors.danger }]}>
                          {isUpToDate ? 'MENSUALIDAD AL DÍA' : 'MENSUALIDAD PENDIENTE'}
                        </Text>
                      </View>
                    </View>
                  </View>

                  <TouchableOpacity
                    style={[styles.editActionBtn, isEditing && styles.editActionBtnActive, isMobile && { width: '100%', alignItems: 'center' }]}
                    onPress={() => setIsEditing(!isEditing)}
                    activeOpacity={0.8}
                  >
                    <Text style={styles.editActionBtnText}>
                      {isEditing ? 'CANCELAR' : 'EDITAR FICHA'}
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>

              {/* Formulario de Edición o Vista Estructurada */}
              {isEditing ? (
                <View style={styles.editFormCard}>
                  <View style={styles.editSectionRibbon}>
                    <Text style={styles.editSectionRibbonText}>MODO EDICIÓN — ANTECEDENTES TÉCNICOS Y PERSONALES</Text>
                  </View>

                  <View style={[styles.formRow, isMobile && { flexDirection: 'column' }]}>
                    <View style={[styles.formCol, { flex: 1 }]}>
                      <Text style={styles.label}>RUT Chileno:</Text>
                      <TextInput
                        style={styles.input}
                        value={editRut}
                        onChangeText={setEditRut}
                        placeholder="Ej: 21.613.369-2"
                        placeholderTextColor={colors.textDim}
                      />
                      {editRut && !validarRut(editRut) && (
                        <Text style={styles.errorText}>Dígito verificador no válido</Text>
                      )}
                    </View>

                    <View style={[styles.formCol, { flex: 1 }]}>
                      <Text style={styles.label}>Fecha de Nacimiento (AAAA-MM-DD):</Text>
                      <TextInput
                        style={styles.input}
                        value={editDob}
                        onChangeText={setEditDob}
                        placeholder="Ej: 2011-06-26"
                        placeholderTextColor={colors.textDim}
                      />
                    </View>
                  </View>

                  <View style={[styles.formRow, isMobile && { flexDirection: 'column' }]}>
                    <View style={[styles.formCol, { flex: 1 }]}>
                      <Text style={styles.label}>Peso Corporal Actual (kg):</Text>
                      <TextInput
                        style={styles.input}
                        value={editPeso}
                        onChangeText={setEditPeso}
                        placeholder="Ej: 53.5"
                        placeholderTextColor={colors.textDim}
                        keyboardType="numeric"
                      />
                    </View>

                    <View style={[styles.formCol, { flex: 1 }]}>
                      <Text style={styles.label}>Colegio / Universidad / Trabajo:</Text>
                      <TextInput
                        style={styles.input}
                        value={editColegio}
                        onChangeText={setEditColegio}
                        placeholder="Ej: Instituto O'Higgins, IRE, UNAB"
                        placeholderTextColor={colors.textDim}
                      />
                    </View>
                  </View>

                  <View style={[styles.formRow, isMobile && { flexDirection: 'column' }]}>
                    <View style={[styles.formCol, { flex: 1 }]}>
                      <Text style={styles.label}>Talla Polera (TFRESH):</Text>
                      <TextInput
                        style={styles.input}
                        value={editTallaPolera}
                        onChangeText={setEditTallaPolera}
                        placeholder="S, M, L, XL, 12, 14"
                        placeholderTextColor={colors.textDim}
                      />
                    </View>

                    <View style={[styles.formCol, { flex: 1 }]}>
                      <Text style={styles.label}>Talla Pantalón / Karategui:</Text>
                      <TextInput
                        style={styles.input}
                        value={editTallaPantalon}
                        onChangeText={setEditTallaPantalon}
                        placeholder="Talla 1, 2, 3, 4, 5 o S, M, L"
                        placeholderTextColor={colors.textDim}
                      />
                    </View>
                  </View>

                  {/* Asignación de Grado de Cinturón */}
                  <View style={{ marginTop: 12 }}>
                    <Text style={styles.label}>Grado de Cinturón Actual:</Text>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginTop: 6 }}>
                      <View style={{ flexDirection: 'row', gap: 6 }}>
                        {GRADOS_CINTURON.map((g) => {
                          const isSel = editCinturonId === g.id;
                          return (
                            <TouchableOpacity
                              key={g.id}
                              style={[
                                styles.beltChoiceBtn,
                                isSel && styles.beltChoiceBtnActive,
                              ]}
                              onPress={() => setEditCinturonId(g.id)}
                            >
                              <View style={[styles.beltColorIndicator, { backgroundColor: g.color_hex }]} />
                              <Text style={[styles.beltChoiceText, isSel && styles.beltChoiceTextActive]}>
                                {g.nombre}
                              </Text>
                            </TouchableOpacity>
                          );
                        })}
                      </View>
                    </ScrollView>
                  </View>

                  {/* Categorías Manuales con Botón para Abrir Lista Completa */}
                  <View style={{ marginTop: 14 }}>
                    <Text style={styles.label}>Categoría Kumite (Combate):</Text>
                    <View style={{ flexDirection: 'row', gap: 8, marginTop: 4 }}>
                      <TextInput
                        style={[styles.input, { flex: 1 }]}
                        value={editCatKumite}
                        onChangeText={setEditCatKumite}
                        placeholder="Asigna o busca en el listado..."
                        placeholderTextColor={colors.textDim}
                      />
                      <TouchableOpacity
                        style={styles.btnOpenCatalog}
                        onPress={() => setShowCategoryPicker('KUMITE')}
                      >
                        <Text style={styles.btnOpenCatalogText}>CATÁLOGO WKF</Text>
                      </TouchableOpacity>
                    </View>
                  </View>

                  <View style={{ marginTop: 14 }}>
                    <Text style={styles.label}>Categoría Kata (Formas):</Text>
                    <View style={{ flexDirection: 'row', gap: 8, marginTop: 4 }}>
                      <TextInput
                        style={[styles.input, { flex: 1 }]}
                        value={editCatKata}
                        onChangeText={setEditCatKata}
                        placeholder="Asigna o busca en el listado..."
                        placeholderTextColor={colors.textDim}
                      />
                      <TouchableOpacity
                        style={styles.btnOpenCatalog}
                        onPress={() => setShowCategoryPicker('KATA')}
                      >
                        <Text style={styles.btnOpenCatalogText}>CATÁLOGO WKF</Text>
                      </TouchableOpacity>
                    </View>
                  </View>

                  <View style={styles.saveActionRow}>
                    <TouchableOpacity style={styles.btnSave} onPress={handleSaveStudent}>
                      <Text style={styles.btnSaveText}>GUARDAR CAMBIOS EN LA FICHA</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              ) : (
                /* Vista de Ficha Técnica Detallada */
                <View style={styles.technicalCard}>
                  <View style={styles.techHeader}>
                    <Text style={styles.techTitle}>DATOS BIOMÉTRICOS Y ANTECEDENTES TÉCNICOS</Text>
                    <Text style={styles.techAgeBadge}>
                      {selectedStudent.fecha_nacimiento ? calcularEdadDescriptiva(selectedStudent.fecha_nacimiento) : 'Edad no calculada'}
                    </Text>
                  </View>

                  <View style={styles.techGrid}>
                    <View style={styles.techItem}>
                      <Text style={styles.techItemLabel}>PESO CORPORAL</Text>
                      <Text style={styles.techItemVal}>
                        {selectedStudent.peso_actual_kg ? `${selectedStudent.peso_actual_kg} kg` : 'Sin registrar'}
                      </Text>
                    </View>

                    <View style={styles.techItem}>
                      <Text style={styles.techItemLabel}>FECHA DE NACIMIENTO</Text>
                      <Text style={styles.techItemVal}>
                        {selectedStudent.fecha_nacimiento || 'Sin registrar'}
                      </Text>
                    </View>

                    <View style={styles.techItem}>
                      <Text style={styles.techItemLabel}>COLEGIO / TRABAJO</Text>
                      <Text style={styles.techItemVal} numberOfLines={1}>
                        {selectedStudent.lugar_estudio_trabajo || 'Sin registrar'}
                      </Text>
                    </View>

                    <View style={styles.techItem}>
                      <Text style={styles.techItemLabel}>GRADO Y KYU ACTUAL</Text>
                      <Text style={[styles.techItemVal, { color: colors.primary, fontWeight: '800' }]}>
                        {cinturon.nombre}
                      </Text>
                    </View>

                    <View style={styles.techItem}>
                      <Text style={styles.techItemLabel}>TALLAS</Text>
                      <Text style={styles.techItemVal}>
                        Polera: {selectedStudent.talla_polera || 'M'} • Pantalón: {selectedStudent.talla_pantalon || 'Talla 3'}
                      </Text>
                    </View>
                  </View>

                  {/* Divisiones WKF sugeridas automáticamente */}
                  <View style={{ marginTop: 20 }}>
                    <Text style={styles.sectionHeaderTitle}>CATEGORÍAS DE COMPETICIÓN OFICIALES (WKF):</Text>

                    <View style={styles.categoryItem}>
                      <View style={styles.categoryTagBar}>
                        <Text style={styles.categoryTagTitle}>KATA INDIVIDUAL (FORMAS)</Text>
                        {selectedStudent.categoria_kata_manual ? (
                          <Text style={styles.manualTag}>Manual</Text>
                        ) : (
                          <Text style={styles.autoTag}>Auto WKF por Edad</Text>
                        )}
                      </View>
                      <Text style={styles.categoryDisplay}>
                        {selectedStudent.categoria_kata_manual ||
                          (kataSugerida ? kataSugerida.nombre_etiqueta : 'Sin fecha de nacimiento')}
                      </Text>
                    </View>

                    <View style={[styles.categoryItem, { marginTop: 10 }]}>
                      <View style={styles.categoryTagBar}>
                        <Text style={styles.categoryTagTitle}>KUMITE INDIVIDUAL (COMBATE)</Text>
                        {selectedStudent.categoria_kumite_manual ? (
                          <Text style={styles.manualTag}>Manual</Text>
                        ) : (
                          <Text style={styles.autoTag}>Auto WKF por Edad y Peso</Text>
                        )}
                      </View>
                      <Text style={[styles.categoryDisplay, { color: colors.primary }]}>
                        {selectedStudent.categoria_kumite_manual ||
                          (kumiteSugerida
                            ? kumiteSugerida.nombre_etiqueta
                            : !selectedStudent.peso_actual_kg
                            ? 'Requiere registrar peso en kg'
                            : 'Sin fecha de nacimiento')}
                      </Text>
                    </View>
                  </View>
                </View>
              )}
            </ScrollView>
          ) : (
            <View style={styles.emptyCentered}>
              <Text style={styles.emptyCenteredTitle}>
                {schoolStudents.length === 0
                  ? 'NO HAY ALUMNOS EN ESTA SEDE'
                  : 'SELECCIONA UN ALUMNO'}
              </Text>
              <Text style={styles.emptyCenteredText}>
                {schoolStudents.length === 0
                  ? `Actualmente "${currentAcademia?.nombre || 'esta sede'}" no tiene alumnos registrados en su nómina.`
                  : 'Haz clic sobre un alumno en la lista de la izquierda para ver su ficha técnica completa.'}
              </Text>
              {schoolStudents.length === 0 && (
                <TouchableOpacity
                  style={styles.btnEmptyGoConfig}
                  onPress={() => setTab('configuracion')}
                  activeOpacity={0.8}
                >
                  <Text style={styles.btnEmptyGoConfigText}>
                    IR A CONFIGURACIÓN PARA ASIGNAR O TRASLADAR ALUMNOS
                  </Text>
                </TouchableOpacity>
              )}
            </View>
          )}
        </View>
      )}

      {/* MODAL: SELECTOR DE TODAS LAS CATEGORÍAS DEL EXCEL */}
      {showCategoryPicker && (
        <Modal transparent animationType="fade" visible={Boolean(showCategoryPicker)}>
          <View style={styles.modalOverlay}>
            <View style={[styles.categoryModal, isMobile && { width: '95%', maxHeight: '90%' }]}>
              <View style={styles.modalRibbon}>
                <Text style={styles.modalRibbonText}>
                  CATÁLOGO OFICIAL WKF — {showCategoryPicker === 'KUMITE' ? 'KUMITE INDIVIDUAL' : 'KATA Y PARA-KARATE'}
                </Text>
              </View>

              <View style={{ padding: 18 }}>
                <Text style={styles.categoryModalTitle}>
                  SELECCIONA LA CATEGORÍA OFICIAL DEL DOJO
                </Text>
                <Text style={styles.categoryModalDesc}>
                  Haz clic sobre una categoría para asignarla de inmediato a la ficha del deportista.
                </Text>

                <ScrollView style={{ maxHeight: 380, marginTop: 14 }}>
                  <View style={styles.categoryGridWrap}>
                    {(showCategoryPicker === 'KUMITE'
                      ? CATEGORIAS_KUMITE_EXCEL
                      : [...CATEGORIAS_KATA_EXCEL, ...CATEGORIAS_PARA_KARATE_EXCEL]
                    ).map((catName) => {
                      const isPicked =
                        showCategoryPicker === 'KUMITE'
                          ? editCatKumite === catName
                          : editCatKata === catName;

                      return (
                        <TouchableOpacity
                          key={catName}
                          style={[styles.categoryChoiceChip, isPicked && styles.categoryChoiceChipActive]}
                          onPress={() => {
                            if (showCategoryPicker === 'KUMITE') {
                              setEditCatKumite(catName);
                            } else {
                              setEditCatKata(catName);
                            }
                            setShowCategoryPicker(null);
                          }}
                        >
                          <Text
                            style={[
                              styles.categoryChoiceChipText,
                              isPicked && styles.categoryChoiceChipTextActive,
                            ]}
                          >
                            {catName}
                          </Text>
                        </TouchableOpacity>
                      );
                    })}
                  </View>
                </ScrollView>

                <View style={{ marginTop: 16, alignItems: 'flex-end' }}>
                  <TouchableOpacity
                    style={styles.closeModalBtn}
                    onPress={() => setShowCategoryPicker(null)}
                  >
                    <Text style={styles.closeModalBtnText}>CERRAR</Text>
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
    flexDirection: 'row',
    backgroundColor: colors.bgDarkest,
    width: '100%',
    maxWidth: '100%',
    overflow: 'hidden',
  },
  mobileTabBar: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 48,
    backgroundColor: colors.bgSurface,
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: colors.borderSubtle,
    zIndex: 10,
  },
  mobileTabBtn: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  mobileTabBtnActive: {
    borderBottomWidth: 3,
    borderBottomColor: colors.primary,
    backgroundColor: 'rgba(255, 107, 0, 0.08)',
  },
  mobileTabBtnText: {
    color: colors.textDim,
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  mobileTabBtnTextActive: {
    color: colors.primary,
    fontWeight: '900',
  },
  listPanel: {
    width: 340,
    borderRightWidth: 1,
    borderRightColor: colors.borderSubtle,
    backgroundColor: colors.bgSurface,
  },
  listPanelMobile: {
    width: '100%',
    paddingTop: 48,
  },
  sedePanelContainer: {
    backgroundColor: colors.bgDarkest,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderSubtle,
    padding: 12,
  },
  sedePanelHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  sedePanelTitle: {
    color: colors.primary,
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 1,
  },
  sedePanelBadge: {
    color: colors.textSecondary,
    fontSize: 10,
    fontWeight: '900',
  },
  sedePillsWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  sedePillBtn: {
    backgroundColor: colors.bgCard,
    borderWidth: 1,
    borderColor: colors.borderLight,
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: radii.md,
  },
  sedePillBtnActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primaryHover,
  },
  sedePillBtnText: {
    color: colors.textSecondary,
    fontSize: 11,
    fontWeight: '700',
  },
  sedePillBtnTextActive: {
    color: '#FFFFFF',
    fontWeight: '900',
  },
  searchBarContainer: {
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderSubtle,
  },
  searchInput: {
    backgroundColor: colors.bgInput,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
    paddingHorizontal: 12,
    paddingVertical: 10,
    color: colors.textPrimary,
    fontSize: 13,
    borderRadius: radii.md,
  },
  filterPillsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 8,
    gap: 4,
    backgroundColor: colors.bgDarkest,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderSubtle,
    width: '100%',
  },
  scrollArrowBtn: {
    backgroundColor: colors.bgCard,
    borderWidth: 1,
    borderColor: colors.borderLight,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 0,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollArrowText: {
    color: colors.primary,
    fontSize: 16,
    fontWeight: '900',
    lineHeight: 18,
  },
  filterPillsRow: {
    flexDirection: 'row',
    padding: 8,
    gap: 6,
    backgroundColor: colors.bgDarkest,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderSubtle,
    flexWrap: 'wrap',
  },
  filterPill: {
    paddingVertical: 4,
    paddingHorizontal: 8,
    backgroundColor: colors.bgCard,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
    borderRadius: radii.sm,
  },
  filterPillActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primaryHover,
  },
  filterPillText: {
    color: colors.textMuted,
    fontSize: 10,
    fontWeight: '800',
  },
  filterPillTextActive: {
    color: '#FFFFFF',
  },
  studentCard: {
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderSubtle,
  },
  studentCardSelected: {
    backgroundColor: 'rgba(255, 107, 0, 0.10)',
    borderLeftWidth: 4,
    borderLeftColor: colors.primary,
  },
  studentCardContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  studentAvatar: {
    width: 40,
    height: 40,
    borderRadius: radii.md,
    backgroundColor: colors.bgCardElevated,
    borderWidth: 1,
    borderColor: colors.borderLight,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  studentAvatarSelected: {
    borderColor: colors.primary,
  },
  avatarImage: {
    width: '100%',
    height: '100%',
  },
  avatarInitial: {
    color: colors.primary,
    fontSize: 16,
    fontWeight: '900',
  },
  studentCardName: {
    color: colors.textSecondary,
    fontSize: 13,
    fontWeight: '800',
  },
  studentCardNameSelected: {
    color: colors.textPrimary,
  },
  studentCardMeta: {
    color: colors.textDim,
    fontSize: 11,
    marginTop: 2,
  },
  paymentDot: {
    width: 8,
    height: 8,
    borderRadius: 0,
  },
  cardArrow: {
    color: colors.primary,
    fontSize: 12,
    fontWeight: '900',
  },
  detailContainer: {
    flex: 1,
    backgroundColor: colors.bgDarkest,
  },
  mobileBackBtn: {
    backgroundColor: colors.bgSurface,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderSubtle,
    marginTop: 48,
  },
  mobileBackBtnText: {
    color: colors.primary,
    fontSize: 12,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  detailScroll: {
    flex: 1,
  },
  detailContentCentered: {
    maxWidth: 960,
    width: '100%',
    alignSelf: 'center',
    padding: 20,
    gap: 16,
  },
  successToast: {
    backgroundColor: colors.successBg,
    borderWidth: 1,
    borderColor: colors.successBorder,
    padding: 12,
    alignItems: 'center',
    borderRadius: radii.md,
  },
  successToastText: {
    color: colors.success,
    fontSize: 12,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  profileCard: {
    backgroundColor: colors.bgCard,
    borderWidth: 1,
    borderColor: colors.borderLight,
    borderRadius: radii.lg,
    padding: 20,
  },
  profileTopRow: {
    flexDirection: 'row',
    gap: 20,
    alignItems: 'flex-start',
    flexWrap: 'wrap',
  },
  photoContainer: {
    width: 104,
    height: 130,
    backgroundColor: colors.bgInput,
    borderWidth: 1,
    borderColor: colors.borderLight,
    borderRadius: radii.md,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  photoImage: {
    width: '100%',
    height: '100%',
  },
  photoPlaceholder: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  photoPlaceholderLetter: {
    fontSize: 36,
    color: colors.primary,
    fontWeight: '900',
  },
  changePhotoBtn: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(11, 15, 25, 0.85)',
    paddingVertical: 4,
    alignItems: 'center',
  },
  changePhotoBtnText: {
    color: colors.textPrimary,
    fontSize: 9,
    fontWeight: '900',
  },
  profileFullName: {
    color: colors.textPrimary,
    fontSize: 22,
    fontWeight: '900',
  },
  profileRut: {
    color: colors.textMuted,
    fontSize: 13,
  },
  profileSchool: {
    color: colors.textDim,
    fontSize: 12,
  },
  badgeTagsRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 6,
    flexWrap: 'wrap',
  },
  beltBadge: {
    backgroundColor: colors.bgDarkest,
    borderWidth: 1,
    borderColor: colors.borderLight,
    borderRadius: radii.sm,
    paddingVertical: 5,
    paddingHorizontal: 12,
  },
  beltText: {
    color: colors.textPrimary,
    fontSize: 11,
    fontWeight: '900',
  },
  financeBadge: {
    paddingVertical: 5,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderRadius: radii.sm,
  },
  financeText: {
    fontSize: 11,
    fontWeight: '800',
  },
  studentSedeTransferWrap: {
    marginTop: 10,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: colors.borderSubtle,
  },
  studentSedeTransferLabel: {
    color: colors.textDim,
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 0.5,
    marginBottom: 6,
  },
  studentSedeTransferRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  studentSedeTransferBtn: {
    backgroundColor: colors.bgInput,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
    borderRadius: radii.sm,
    paddingVertical: 4,
    paddingHorizontal: 8,
  },
  studentSedeTransferBtnActive: {
    backgroundColor: colors.successBg,
    borderColor: colors.successBorder,
  },
  studentSedeTransferBtnText: {
    color: colors.textDim,
    fontSize: 10,
    fontWeight: '700',
  },
  studentSedeTransferBtnTextActive: {
    color: colors.success,
    fontWeight: '900',
  },
  editActionBtn: {
    backgroundColor: colors.primary,
    paddingVertical: 10,
    paddingHorizontal: 18,
    borderRadius: radii.md,
  },
  editActionBtnActive: {
    backgroundColor: colors.bgCardElevated,
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  editActionBtnText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  editFormCard: {
    backgroundColor: colors.bgCard,
    borderWidth: 1,
    borderColor: colors.borderLight,
    borderRadius: radii.lg,
    overflow: 'hidden',
    padding: 20,
  },
  editSectionRibbon: {
    backgroundColor: colors.primary,
    marginHorizontal: -20,
    marginTop: -20,
    marginBottom: 16,
    paddingVertical: 8,
    paddingHorizontal: 20,
  },
  editSectionRibbonText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 1.2,
  },
  formRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 10,
  },
  formCol: {
    gap: 4,
  },
  label: {
    color: colors.textMuted,
    fontSize: 11,
    fontWeight: '800',
  },
  input: {
    backgroundColor: colors.bgInput,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
    borderRadius: radii.md,
    paddingHorizontal: 12,
    paddingVertical: 10,
    color: colors.textPrimary,
    fontSize: 13,
  },
  errorText: {
    color: colors.danger,
    fontSize: 11,
    fontWeight: '700',
  },
  beltChoiceBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 6,
    paddingHorizontal: 10,
    backgroundColor: colors.bgInput,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
    borderRadius: radii.sm,
  },
  beltChoiceBtnActive: {
    borderColor: colors.primary,
    backgroundColor: 'rgba(255, 107, 0, 0.12)',
  },
  beltColorIndicator: {
    width: 10,
    height: 10,
    borderRadius: 0,
  },
  beltChoiceText: {
    color: colors.textMuted,
    fontSize: 11,
    fontWeight: '700',
  },
  beltChoiceTextActive: {
    color: colors.primary,
    fontWeight: '900',
  },
  btnOpenCatalog: {
    backgroundColor: colors.primary,
    paddingHorizontal: 14,
    justifyContent: 'center',
    borderRadius: radii.md,
  },
  btnOpenCatalogText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  saveActionRow: {
    marginTop: 18,
    alignItems: 'flex-end',
  },
  btnSave: {
    backgroundColor: colors.primary,
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: radii.md,
  },
  btnSaveText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  technicalCard: {
    backgroundColor: colors.bgCard,
    borderWidth: 1,
    borderColor: colors.borderLight,
    borderRadius: radii.lg,
    padding: 20,
  },
  techHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderSubtle,
    flexWrap: 'wrap',
    gap: 8,
  },
  techTitle: {
    color: colors.textPrimary,
    fontSize: 14,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  techAgeBadge: {
    color: colors.primary,
    fontSize: 12,
    fontWeight: '900',
  },
  techGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginTop: 14,
  },
  techItem: {
    width: '48%',
    backgroundColor: colors.bgInput,
    padding: 12,
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
  },
  techItemLabel: {
    color: colors.textDim,
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  techItemVal: {
    color: colors.textPrimary,
    fontSize: 13,
    fontWeight: '700',
    marginTop: 4,
  },
  sectionHeaderTitle: {
    color: colors.primary,
    fontSize: 12,
    fontWeight: '900',
    letterSpacing: 0.8,
    marginBottom: 10,
  },
  categoryItem: {
    backgroundColor: colors.bgInput,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
    borderRadius: radii.md,
    padding: 12,
  },
  categoryTagBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  categoryTagTitle: {
    color: colors.textMuted,
    fontSize: 11,
    fontWeight: '800',
  },
  autoTag: {
    color: colors.primary,
    fontSize: 9,
    fontWeight: '800',
    backgroundColor: colors.primaryLight,
    paddingVertical: 2,
    paddingHorizontal: 6,
    borderRadius: radii.xs,
  },
  manualTag: {
    color: colors.accentGold,
    fontSize: 9,
    fontWeight: '800',
    backgroundColor: colors.accentGoldLight,
    paddingVertical: 2,
    paddingHorizontal: 6,
    borderRadius: radii.xs,
  },
  categoryDisplay: {
    color: colors.textPrimary,
    fontSize: 14,
    fontWeight: '900',
    marginTop: 6,
  },
  emptyCentered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  emptyCenteredIcon: {
    fontSize: 48,
    marginBottom: 12,
  },
  emptyCenteredTitle: {
    color: colors.textPrimary,
    fontSize: 16,
    fontWeight: '900',
    letterSpacing: 0.5,
    marginBottom: 6,
  },
  emptyCenteredText: {
    color: colors.textDim,
    fontSize: 13,
    textAlign: 'center',
    maxWidth: 420,
    lineHeight: 20,
  },
  btnEmptyGoConfig: {
    marginTop: 16,
    backgroundColor: colors.primary,
    paddingVertical: 12,
    paddingHorizontal: 18,
    borderRadius: radii.md,
  },
  btnEmptyGoConfigText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  emptyListNotice: {
    padding: 20,
    alignItems: 'center',
  },
  emptyListNoticeText: {
    color: colors.textDim,
    fontSize: 12,
    textAlign: 'center',
    lineHeight: 18,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.85)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  categoryModal: {
    width: 620,
    maxHeight: 580,
    backgroundColor: colors.bgCard,
    borderWidth: 1,
    borderColor: colors.borderLight,
    borderRadius: radii.xl,
    overflow: 'hidden',
  },
  modalRibbon: {
    backgroundColor: colors.primary,
    paddingVertical: 8,
    paddingHorizontal: 18,
  },
  modalRibbonText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 1,
  },
  categoryModalTitle: {
    color: colors.textPrimary,
    fontSize: 16,
    fontWeight: '900',
  },
  categoryModalDesc: {
    color: colors.textMuted,
    fontSize: 12,
    marginTop: 2,
  },
  categoryGridWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  categoryChoiceChip: {
    backgroundColor: colors.bgInput,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
    borderRadius: radii.md,
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  categoryChoiceChipActive: {
    borderColor: colors.primary,
    backgroundColor: 'rgba(255, 107, 0, 0.15)',
  },
  categoryChoiceChipText: {
    color: colors.textSecondary,
    fontSize: 11,
    fontWeight: '800',
  },
  categoryChoiceChipTextActive: {
    color: colors.primary,
    fontWeight: '900',
  },
  closeModalBtn: {
    backgroundColor: colors.bgInput,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
    borderRadius: radii.md,
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  closeModalBtnText: {
    color: colors.textMuted,
    fontSize: 11,
    fontWeight: '800',
  },
});
