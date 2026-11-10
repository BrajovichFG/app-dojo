import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TextInput, TouchableOpacity } from 'react-native';
import { useDojoStore } from '../store/dojoStore';
import { calcularEdadDescriptiva, formatearRut, validarRut } from '../utils/karateEngine';
import { GRADOS_CINTURON, CENTRAL_ACADEMIA_ID } from '../data/constants';
import { colors, radii, useResponsive } from '../theme/theme';

export const RegistroPublicoScreen: React.FC = () => {
  const addStudent = useDojoStore((state) => state.addStudent);
  const setTab = useDojoStore((state) => state.setTab);
  const academias = useDojoStore((state) => state.academias);
  const currentAcademia = useDojoStore((state) => state.currentAcademia);

  const { isMobile } = useResponsive();

  // Selector desplegable compacto de Academia / Sede
  const [selectedAcademiaId, setSelectedAcademiaId] = useState<string>(
    currentAcademia?.id || academias[0]?.id || ''
  );
  const [showAcademiaDropdown, setShowAcademiaDropdown] = useState(false);

  // Formulario Alumno
  const [nombres, setNombres] = useState('');
  const [apellidos, setApellidos] = useState('');
  const [rut, setRut] = useState('');
  const [dob, setDob] = useState('');
  const [genero, setGenero] = useState<'M' | 'F'>('M');
  const [peso, setPeso] = useState('');
  const [direccion, setDireccion] = useState('');
  const [estudio, setEstudio] = useState('');
  const [tallaPolera, setTallaPolera] = useState('M');
  const [tallaPantalon, setTallaPantalon] = useState('Talla 3');
  const [cinturonId, setCinturonId] = useState<number>(1);
  const [escuelaOrigen, setEscuelaOrigen] = useState('');

  // Formulario Apoderado
  const [apoderadoNombre, setApoderadoNombre] = useState('');
  const [apoderadoRut, setApoderadoRut] = useState('');
  const [apoderadoTelefono, setApoderadoTelefono] = useState('+56 9 ');
  const [apoderadoEdad, setApoderadoEdad] = useState('');
  const [diaPago, setDiaPago] = useState('5');

  // Estado de éxito
  const [submitted, setSubmitted] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // Formateador de Fecha DD-MM-YYYY
  const handleDobChange = (text: string) => {
    const cleaned = text.replace(/[^0-9]/g, '').slice(0, 8);
    if (cleaned.length <= 2) {
      setDob(cleaned);
    } else if (cleaned.length <= 4) {
      setDob(`${cleaned.slice(0, 2)}-${cleaned.slice(2)}`);
    } else {
      setDob(`${cleaned.slice(0, 2)}-${cleaned.slice(2, 4)}-${cleaned.slice(4)}`);
    }
  };

  // Normaliza fecha DD-MM-YYYY a YYYY-MM-DD para almacenamiento estándar
  const normalizarFecha = (f: string) => {
    if (!f) return '';
    const clean = f.trim();
    if (clean.includes('-')) {
      const parts = clean.split('-');
      if (parts[0]?.length === 2 && parts[2]?.length === 4) {
        return `${parts[2]}-${parts[1]}-${parts[0]}`;
      }
    }
    return clean;
  };

  const handleSubmit = () => {
    if (!nombres.trim() || !apellidos.trim()) {
      setErrorMessage('Por favor ingresa los nombres y apellidos del alumno.');
      return;
    }

    if (!apoderadoNombre.trim() || !apoderadoTelefono.trim()) {
      setErrorMessage('Por favor completa el nombre y teléfono WhatsApp del apoderado.');
      return;
    }

    setErrorMessage('');
    const pesoNum = peso ? parseFloat(peso.replace(',', '.')) : undefined;
    const fechaNorm = normalizarFecha(dob);

    addStudent({
      academia_id: selectedAcademiaId ? selectedAcademiaId : undefined,
      seccion_id: 'sec-3', // Por defecto adolescentes, el sensei confirmará
      cinturon_id: cinturonId,
      nombres: nombres.trim(),
      apellidos: apellidos.trim(),
      rut: rut.trim() || undefined,
      fecha_nacimiento: fechaNorm || undefined,
      genero,
      peso_actual_kg: isNaN(pesoNum as any) ? undefined : pesoNum,
      direccion: direccion.trim() || undefined,
      lugar_estudio_trabajo: estudio.trim() || undefined,
      talla_polera: tallaPolera,
      talla_pantalon: tallaPantalon,
      dia_pago_mensual: parseInt(diaPago, 10) || 5,
      estado: 'ACTIVO',
      es_competidor: false,
      fecha_ingreso: new Date().toISOString().split('T')[0],
    });

    setSubmitted(true);
  };

  const fechaParaCalculo = normalizarFecha(dob);
  const edadDescriptiva = fechaParaCalculo ? calcularEdadDescriptiva(fechaParaCalculo) : null;
  const currentSelectedAcademia = academias.find((a) => a.id === selectedAcademiaId);

  if (submitted) {
    return (
      <View style={styles.successContainer}>
        <View style={styles.successCard}>
          <Text style={styles.successTitle}>¡INSCRIPCIÓN REGISTRADA CON ÉXITO!</Text>
          <Text style={styles.successDesc}>
            Bienvenido a {currentAcademia?.nombre || 'Dojo Shito Ryu'}. Los datos de{' '}
            <Text style={{ fontWeight: '800', color: colors.textPrimary }}>
              {nombres} {apellidos}
            </Text>{' '}
            han sido guardados en el sistema del dojo. El Sensei validará los antecedentes para su primera clase.
          </Text>

          <TouchableOpacity style={styles.backBtn} onPress={() => setTab('dashboard')}>
            <Text style={styles.backBtnText}>IR AL DASHBOARD DEL DOJO ➔</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={[styles.content, isMobile && { padding: 12 }]}>
      <View style={[styles.formCard, isMobile && { width: '100%', borderRadius: radii.lg }]}>
        {/* Cinta Superior Oficial */}
        <View style={styles.formRibbonTop}>
          <Text style={styles.formRibbonTopText}>PORTAL OFICIAL DE MATRÍCULA ONLINE — SHITO RYU KYOKAN GENBUKAI</Text>
        </View>

        {/* Encabezado con Selector Desplegable Corto de Academia / Sede */}
        <View style={styles.formHeader}>
          <Text style={styles.formTitle}>FICHA DE POSTULACIÓN E INSCRIPCIÓN DEPORTIVA</Text>
          <Text style={styles.formDesc}>
            Completa los antecedentes del deportista para registrar su ingreso oficial al dojo.
          </Text>

          {/* Menú desplegable corto hacia abajo para elegir Academia y Sede */}
          <View style={styles.schoolSelectorBox}>
            <Text style={styles.schoolSelectorLabel}>SEDE / ACADEMIA EN LA QUE SE INSCRIBE:</Text>
            <TouchableOpacity
              style={styles.schoolDropdownTrigger}
              onPress={() => setShowAcademiaDropdown(!showAcademiaDropdown)}
              activeOpacity={0.85}
            >
              <Text style={styles.schoolDropdownTriggerText}>
                {currentSelectedAcademia
                  ? `📍 ${currentSelectedAcademia.nombre} (${currentSelectedAcademia.direccion || 'Sede oficial'})`
                  : '⚠️ Sin sede definida (El Sensei la asignará en Configuraciones)'}
              </Text>
              <Text style={styles.schoolDropdownArrow}>{showAcademiaDropdown ? '▲' : '▼'}</Text>
            </TouchableOpacity>

            {showAcademiaDropdown && (
              <View style={styles.schoolDropdownMenu}>
                {academias.map((ac) => {
                  const isCur = selectedAcademiaId === ac.id;
                  return (
                    <TouchableOpacity
                      key={ac.id}
                      style={[styles.schoolDropdownItem, isCur && styles.schoolDropdownItemActive]}
                      onPress={() => {
                        setSelectedAcademiaId(ac.id);
                        setShowAcademiaDropdown(false);
                      }}
                    >
                      <Text style={[styles.schoolDropdownItemText, isCur && styles.schoolDropdownItemTextActive]}>
                        📍 {ac.nombre} — {ac.direccion || 'Sede oficial'}
                      </Text>
                      {isCur && <Text style={{ color: colors.primary, fontWeight: '900' }}>✓</Text>}
                    </TouchableOpacity>
                  );
                })}
                <TouchableOpacity
                  style={[styles.schoolDropdownItem, selectedAcademiaId === '' && styles.schoolDropdownItemActive]}
                  onPress={() => {
                    setSelectedAcademiaId('');
                    setShowAcademiaDropdown(false);
                  }}
                >
                  <Text style={[styles.schoolDropdownItemText, { color: colors.accent }]}>
                    ⚠️ Sin sede asignada (Asignar en Configuraciones)
                  </Text>
                  {selectedAcademiaId === '' && <Text style={{ color: colors.accent, fontWeight: '900' }}>✓</Text>}
                </TouchableOpacity>
              </View>
            )}
          </View>
        </View>

        {errorMessage ? (
          <View style={styles.errorBanner}>
            <Text style={styles.errorBannerText}>{errorMessage}</Text>
          </View>
        ) : null}

        {/* SECCIÓN 1: DATOS PERSONALES DEL ALUMNO */}
        <View style={styles.fieldset}>
          <Text style={styles.fieldsetTitle}>1. DATOS BIOMÉTRICOS Y PERSONALES DEL DEPORTISTA</Text>

          <View style={[styles.row, isMobile && { flexDirection: 'column' }]}>
            <View style={[styles.inputBox, { flex: 1 }]}>
              <Text style={styles.label}>Nombres del Alumno *</Text>
              <TextInput
                style={styles.input}
                placeholder="Ej: Matías Alejandro"
                placeholderTextColor={colors.textDim}
                value={nombres}
                onChangeText={setNombres}
              />
            </View>

            <View style={[styles.inputBox, { flex: 1 }]}>
              <Text style={styles.label}>Apellidos del Alumno *</Text>
              <TextInput
                style={styles.input}
                placeholder="Ej: Silva Gómez"
                placeholderTextColor={colors.textDim}
                value={apellidos}
                onChangeText={setApellidos}
              />
            </View>
          </View>

          <View style={[styles.row, isMobile && { flexDirection: 'column' }]}>
            <View style={[styles.inputBox, { flex: 1 }]}>
              <Text style={styles.label}>RUT</Text>
              <TextInput
                style={styles.input}
                placeholder="Ej: 21.613.369-2"
                placeholderTextColor={colors.textDim}
                value={rut}
                onChangeText={(val) => setRut(formatearRut(val))}
              />
            </View>

            <View style={[styles.inputBox, { flex: 1 }]}>
              <Text style={styles.label}>Fecha de Nacimiento (DD-MM-YYYY) *</Text>
              <TextInput
                style={styles.input}
                placeholder="18-05-2012"
                placeholderTextColor={colors.textDim}
                value={dob}
                onChangeText={handleDobChange}
                keyboardType="numeric"
              />
              {edadDescriptiva && <Text style={styles.calcAgeText}>{edadDescriptiva}</Text>}
            </View>
          </View>

          <View style={[styles.row, isMobile && { flexDirection: 'column' }]}>
            <View style={[styles.inputBox, { flex: 1 }]}>
              <Text style={styles.label}>Genero</Text>
              <View style={styles.genderRow}>
                <TouchableOpacity
                  style={[styles.genderBtn, genero === 'M' && styles.genderBtnActive]}
                  onPress={() => setGenero('M')}
                >
                  <Text style={[styles.genderText, genero === 'M' && styles.genderTextActive]}>
                    MASCULINO (VARONES)
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.genderBtn, genero === 'F' && styles.genderBtnActive]}
                  onPress={() => setGenero('F')}
                >
                  <Text style={[styles.genderText, genero === 'F' && styles.genderTextActive]}>
                    FEMENINO (DAMAS)
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

            <View style={[styles.inputBox, { flex: 1 }]}>
              <Text style={styles.label}>Peso Corporal Actual (kg)</Text>
              <TextInput
                style={styles.input}
                placeholder="Ej: 52.5"
                placeholderTextColor={colors.textDim}
                value={peso}
                onChangeText={setPeso}
                keyboardType="numeric"
              />
            </View>
          </View>

          <View style={styles.row}>
            <View style={[styles.inputBox, { flex: 1 }]}>
              <Text style={styles.label}>Dirección / Comuna de Residencia</Text>
              <TextInput
                style={styles.input}
                placeholder="Ej: Av. Bombero Villalobos #1240, Rancagua"
                placeholderTextColor={colors.textDim}
                value={direccion}
                onChangeText={setDireccion}
              />
            </View>
          </View>

          <View style={[styles.row, isMobile && { flexDirection: 'column' }]}>
            <View style={[styles.inputBox, { flex: 1.5 }]}>
              <Text style={styles.label}>Colegio / Universidad / Trabajo</Text>
              <TextInput
                style={styles.input}
                placeholder="Ej: Instituto O'Higgins de Rancagua"
                placeholderTextColor={colors.textDim}
                value={estudio}
                onChangeText={setEstudio}
              />
            </View>

            <View style={[styles.inputBox, { flex: 1 }]}>
              <Text style={styles.label}>Talla Polera</Text>
              <TextInput
                style={styles.input}
                placeholder="S, M, L, XL, 12, 14"
                placeholderTextColor={colors.textDim}
                value={tallaPolera}
                onChangeText={setTallaPolera}
              />
            </View>

            <View style={[styles.inputBox, { flex: 1 }]}>
              <Text style={styles.label}>Talla Pantalon</Text>
              <TextInput
                style={styles.input}
                placeholder="Talla 1, 2, 3, 4, 5"
                placeholderTextColor={colors.textDim}
                value={tallaPantalon}
                onChangeText={setTallaPantalon}
              />
            </View>
          </View>

          {/* Selector de Grado / Cinturón */}
          <View style={styles.beltSelectorBox}>
            <Text style={styles.label}>Grado / Cinturón de Ingreso</Text>
            <Text style={styles.beltSelectorHint}>
              Si es alumno nuevo principiante seleccione "Blanco (10° Kyu - Jukyu)". Si ya entrenó Karate en otro Dojo o posee grado previo, seleccione su cinturón actual para tramitar la convalidación oficial:
            </Text>

            <View style={styles.beltsGrid}>
              {GRADOS_CINTURON.map((grado) => {
                const isSelected = cinturonId === grado.id;
                return (
                  <TouchableOpacity
                    key={grado.id}
                    style={[
                      styles.beltOptionCard,
                      isSelected && styles.beltOptionCardActive,
                    ]}
                    onPress={() => setCinturonId(grado.id)}
                    activeOpacity={0.8}
                  >
                    <View
                      style={[
                        styles.beltColorIndicator,
                        { backgroundColor: grado.color_hex },
                        grado.color_hex === '#FFFFFF' && { borderColor: colors.borderLight, borderWidth: 1 },
                      ]}
                    />
                    <Text
                      style={[
                        styles.beltOptionName,
                        isSelected && styles.beltOptionNameActive,
                      ]}
                      numberOfLines={1}
                    >
                      {grado.nombre}
                    </Text>
                    {isSelected && <Text style={styles.beltCheckText}>✓</Text>}
                  </TouchableOpacity>
                );
              })}
            </View>

            {cinturonId !== 1 && (
              <View style={styles.previousDojoBox}>
                <Text style={styles.previousDojoTitle}>
                  ℹ️ CONVALIDACIÓN DE GRADO PREVIO
                </Text>
                <Text style={styles.previousDojoDesc}>
                  Indica el dojo, federación o sensei con quien rendiste tu último examen de grado:
                </Text>
                <TextInput
                  style={styles.input}
                  placeholder="Ej: Dojo Bushido Rancagua / Sensei Manuel Díaz (Federación Chilena)"
                  placeholderTextColor={colors.textDim}
                  value={escuelaOrigen}
                  onChangeText={setEscuelaOrigen}
                />
              </View>
            )}
          </View>
        </View>

        {/* SECCIÓN 2: DATOS DEL APODERADO */}
        <View style={styles.fieldset}>
          <Text style={styles.fieldsetTitle}>2. ANTECEDENTES DEL APODERADO O TITULAR</Text>

          <View style={[styles.row, isMobile && { flexDirection: 'column' }]}>
            <View style={[styles.inputBox, { flex: 1.5 }]}>
              <Text style={styles.label}>Nombre Completo Apoderado *</Text>
              <TextInput
                style={styles.input}
                placeholder="Ej: Carmen Rojas González"
                placeholderTextColor={colors.textDim}
                value={apoderadoNombre}
                onChangeText={setApoderadoNombre}
              />
            </View>

            <View style={[styles.inputBox, { flex: 1 }]}>
              <Text style={styles.label}>Rut Apoderado</Text>
              <TextInput
                style={styles.input}
                placeholder="Ej: 15.342.128-4"
                placeholderTextColor={colors.textDim}
                value={apoderadoRut}
                onChangeText={(val) => setApoderadoRut(formatearRut(val))}
              />
            </View>
          </View>

          <View style={[styles.row, isMobile && { flexDirection: 'column' }]}>
            <View style={[styles.inputBox, { flex: 1.5 }]}>
              <Text style={styles.label}>Teléfono WhatsApp *</Text>
              <TextInput
                style={styles.input}
                placeholder="+56 9 8765 4321"
                placeholderTextColor={colors.textDim}
                value={apoderadoTelefono}
                onChangeText={setApoderadoTelefono}
                keyboardType="phone-pad"
              />
            </View>

            <View style={[styles.inputBox, { flex: 1 }]}>
              <Text style={styles.label}>Edad Apoderado</Text>
              <TextInput
                style={styles.input}
                placeholder="Ej: 42"
                placeholderTextColor={colors.textDim}
                value={apoderadoEdad}
                onChangeText={setApoderadoEdad}
                keyboardType="numeric"
              />
            </View>
          </View>
        </View>

        {/* SECCIÓN 3: ACUERDO DE MENSUALIDAD */}
        <View style={styles.fieldset}>
          <Text style={styles.fieldsetTitle}>3. ACUERDO DE PAGO DE MENSUALIDAD</Text>
          <Text style={styles.fieldHint}>
            Indica el día del mes en que te comprometes a realizar el pago de la cuota para programar los avisos.
          </Text>

          <View style={styles.inputBox}>
            <Text style={styles.label}>Día de Pago Pactado (del 1 al 31)</Text>
            <TextInput
              style={[styles.input, { maxWidth: 120 }]}
              placeholder="5"
              placeholderTextColor={colors.textDim}
              value={diaPago}
              onChangeText={setDiaPago}
              keyboardType="numeric"
            />
          </View>
        </View>

        {/* Botón de Envío */}
        <TouchableOpacity style={styles.submitBtn} onPress={handleSubmit} activeOpacity={0.85}>
          <Text style={styles.submitBtnText}>ENVIAR FICHA DE MATRÍCULA AL DOJO ➔</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
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
  content: {
    padding: 24,
    alignItems: 'center',
  },
  formCard: {
    backgroundColor: colors.bgCard,
    borderWidth: 1,
    borderColor: colors.borderLight,
    borderRadius: radii.xl,
    maxWidth: 780,
    width: '100%',
    overflow: 'hidden',
  },
  formRibbonTop: {
    backgroundColor: colors.primary,
    paddingVertical: 8,
    paddingHorizontal: 16,
    alignItems: 'center',
  },
  formRibbonTopText: {
    color: '#FFFFFF',
    fontWeight: '900',
    fontSize: 10,
    letterSpacing: 1.2,
  },
  formHeader: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderSubtle,
    gap: 6,
  },
  formTitle: {
    color: colors.textPrimary,
    fontSize: 18,
    fontWeight: '900',
    letterSpacing: 0.3,
  },
  formDesc: {
    color: colors.textMuted,
    fontSize: 12,
    lineHeight: 18,
  },
  schoolSelectorBox: {
    marginTop: 10,
    backgroundColor: colors.bgDark,
    borderWidth: 1,
    borderColor: colors.borderLight,
    padding: 12,
  },
  schoolSelectorLabel: {
    color: colors.accent,
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 0.8,
    marginBottom: 6,
  },
  schoolDropdownTrigger: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: colors.bgCard,
    borderWidth: 1,
    borderColor: colors.borderLight,
    paddingVertical: 10,
    paddingHorizontal: 12,
  },
  schoolDropdownTriggerText: {
    color: colors.textPrimary,
    fontSize: 13,
    fontWeight: '800',
    flex: 1,
  },
  schoolDropdownArrow: {
    color: colors.primary,
    fontSize: 11,
    fontWeight: '900',
    marginLeft: 8,
  },
  schoolDropdownMenu: {
    marginTop: 6,
    borderWidth: 1,
    borderColor: colors.primary,
    backgroundColor: colors.bgCard,
  },
  schoolDropdownItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderSubtle,
  },
  schoolDropdownItemActive: {
    backgroundColor: 'rgba(255, 107, 0, 0.12)',
  },
  schoolDropdownItemText: {
    color: colors.textSecondary,
    fontSize: 12,
    fontWeight: '700',
  },
  schoolDropdownItemTextActive: {
    color: colors.primary,
    fontWeight: '900',
  },
  errorBanner: {
    backgroundColor: colors.dangerBg,
    padding: 12,
    borderWidth: 1,
    borderColor: colors.dangerBorder,
    margin: 20,
    marginBottom: 0,
    borderRadius: radii.md,
  },
  errorBannerText: {
    color: colors.danger,
    fontWeight: '700',
    fontSize: 12,
  },
  fieldset: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderSubtle,
    gap: 12,
  },
  fieldsetTitle: {
    color: colors.primary,
    fontSize: 12,
    fontWeight: '900',
    letterSpacing: 0.8,
  },
  fieldHint: {
    color: colors.textDim,
    fontSize: 11,
  },
  row: {
    flexDirection: 'row',
    gap: 12,
    flexWrap: 'wrap',
  },
  inputBox: {
    gap: 4,
    minWidth: 160,
  },
  label: {
    color: colors.textMuted,
    fontSize: 11,
    fontWeight: '700',
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
  calcAgeText: {
    color: colors.primary,
    fontSize: 11,
    marginTop: 2,
    fontWeight: '700',
  },
  genderRow: {
    flexDirection: 'row',
    gap: 6,
  },
  genderBtn: {
    flex: 1,
    paddingVertical: 10,
    backgroundColor: colors.bgInput,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
    borderRadius: radii.md,
    alignItems: 'center',
  },
  genderBtnActive: {
    backgroundColor: 'rgba(255, 107, 0, 0.12)',
    borderColor: colors.primary,
  },
  genderText: {
    color: colors.textDim,
    fontWeight: '700',
    fontSize: 10,
  },
  genderTextActive: {
    color: colors.primary,
    fontWeight: '900',
  },
  submitBtn: {
    backgroundColor: colors.primary,
    borderRadius: radii.md,
    paddingVertical: 16,
    alignItems: 'center',
    margin: 20,
  },
  submitBtnText: {
    color: '#FFFFFF',
    fontWeight: '900',
    fontSize: 13,
    letterSpacing: 0.8,
  },
  successContainer: {
    flex: 1,
    backgroundColor: colors.bgDarkest,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  successCard: {
    backgroundColor: colors.bgCard,
    borderWidth: 2,
    borderColor: colors.success,
    borderRadius: radii.xl,
    padding: 32,
    maxWidth: 520,
    width: '100%',
    alignItems: 'center',
    gap: 14,
  },
  successIcon: {
    fontSize: 48,
  },
  successTitle: {
    color: colors.textPrimary,
    fontSize: 18,
    fontWeight: '900',
    textAlign: 'center',
    letterSpacing: 0.5,
  },
  successDesc: {
    color: colors.textMuted,
    fontSize: 13,
    lineHeight: 18,
    textAlign: 'center',
  },
  backBtn: {
    backgroundColor: colors.primary,
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: radii.md,
    marginTop: 6,
  },
  backBtnText: {
    color: '#FFFFFF',
    fontWeight: '900',
    fontSize: 12,
    letterSpacing: 0.5,
  },
  beltSelectorBox: {
    marginTop: 14,
    paddingTop: 14,
    borderTopWidth: 1,
    borderTopColor: colors.borderSubtle,
    gap: 10,
  },
  beltSelectorHint: {
    color: colors.textDim,
    fontSize: 11,
    lineHeight: 16,
  },
  beltsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  beltOptionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 7,
    paddingHorizontal: 10,
    backgroundColor: colors.bgInput,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
    borderRadius: radii.sm,
    width: '31%',
    minWidth: 150,
  },
  beltOptionCardActive: {
    borderColor: colors.primary,
    backgroundColor: 'rgba(255, 107, 0, 0.12)',
  },
  beltColorIndicator: {
    width: 12,
    height: 12,
    borderRadius: 0,
  },
  beltOptionName: {
    color: colors.textSecondary,
    fontSize: 11,
    fontWeight: '700',
    flex: 1,
  },
  beltOptionNameActive: {
    color: colors.primary,
    fontWeight: '900',
  },
  beltCheckText: {
    color: colors.primary,
    fontWeight: '900',
    fontSize: 12,
  },
  previousDojoBox: {
    backgroundColor: colors.bgInput,
    padding: 12,
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: colors.primary,
    gap: 6,
    marginTop: 8,
  },
  previousDojoTitle: {
    color: colors.primary,
    fontSize: 11,
    fontWeight: '900',
  },
  previousDojoDesc: {
    color: colors.textDim,
    fontSize: 11,
    lineHeight: 16,
  },
});
