import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Platform,
} from 'react-native';
import { useDojoStore } from '../store/dojoStore';
import { calcularEdadDescriptiva, formatearRut } from '../utils/karateEngine';
import { GRADOS_CINTURON } from '../data/constants';
import { colors, useResponsive } from '../theme/theme';

interface RegistroPublicoProps {
  isPublicView?: boolean;
  onBackToLogin?: () => void;
}

export const RegistroPublicoScreen: React.FC<RegistroPublicoProps> = ({
  isPublicView = false,
  onBackToLogin,
}) => {
  const addSolicitudMatricula = useDojoStore((state) => state.addSolicitudMatricula);
  const solicitudesMatricula = useDojoStore((state) => state.solicitudesMatricula);
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
  const [apoderadoEmail, setApoderadoEmail] = useState('');
  const [apoderadoParentesco, setApoderadoParentesco] = useState('Padre');
  const [diaPago, setDiaPago] = useState('5');

  // Estado de éxito
  const [submitted, setSubmitted] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [copiedLink, setCopiedLink] = useState(false);

  const solicitudesPendientesCount = solicitudesMatricula.filter((s) => s.estado === 'PENDIENTE').length;

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

  const handleCopyPublicLink = () => {
    const url = typeof window !== 'undefined'
      ? `${window.location.origin}/?matricula=1`
      : 'https://dojoshitoryu.cl/?matricula=1';

    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(url).catch(() => {});
    }
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2500);
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

    addSolicitudMatricula({
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
      cinturon_id: cinturonId,
      escuela_origen: escuelaOrigen.trim() || undefined,
      academia_id: selectedAcademiaId || undefined,
      nombre_apoderado: apoderadoNombre.trim(),
      rut_apoderado: apoderadoRut.trim() || undefined,
      telefono_apoderado: apoderadoTelefono.trim(),
      email_apoderado: apoderadoEmail.trim() || undefined,
      parentesco_apoderado: apoderadoParentesco,
      dia_pago_mensual: parseInt(diaPago, 10) || 5,
    });

    setSubmitted(true);
  };

  const handleResetForm = () => {
    setNombres('');
    setApellidos('');
    setRut('');
    setDob('');
    setPeso('');
    setDireccion('');
    setEstudio('');
    setApoderadoNombre('');
    setApoderadoRut('');
    setApoderadoTelefono('+56 9 ');
    setApoderadoEmail('');
    setEscuelaOrigen('');
    setSubmitted(false);
  };

  const fechaParaCalculo = normalizarFecha(dob);
  const edadDescriptiva = fechaParaCalculo ? calcularEdadDescriptiva(fechaParaCalculo) : null;
  const currentSelectedAcademia = academias.find((a) => a.id === selectedAcademiaId);
  const selectedBelt = GRADOS_CINTURON.find((g) => g.id === cinturonId) || GRADOS_CINTURON[0];

  // =========================================================================
  // VISTA DE CONFIRMACIÓN TRAS ENVIAR LA SOLICITUD
  // =========================================================================
  if (submitted) {
    return (
      <View style={styles.successContainer}>
        <View style={styles.successCard}>
          <View style={styles.successRibbon}>
            <Text style={styles.successRibbonText}>SOLICITUD ENVIADA • EN ESPERA DE CONFIRMACIÓN</Text>
          </View>

          <View style={styles.successBody}>
            <View style={styles.successIconBox}>
              <Text style={styles.successIcon}>✓</Text>
            </View>

            <Text style={styles.successTitle}>¡SOLICITUD DE MATRÍCULA RECIBIDA CON ÉXITO!</Text>

            <Text style={styles.successDesc}>
              Muchas gracias por postular a{' '}
              <Text style={{ fontWeight: '900', color: colors.textPrimary }}>
                Dojo Shito Ryu Kyokan Genbukai Rancagua
              </Text>
              . Los antecedentes de{' '}
              <Text style={{ fontWeight: '900', color: colors.primary }}>
                {nombres} {apellidos}
              </Text>{' '}
              han ingresado a la bandeja de{' '}
              <Text style={{ fontWeight: '900', color: colors.accent }}>"Solicitud de Alumnos"</Text> del
              Sensei Milton Echeverría. Tu ingreso quedará formalizado tras la confirmación técnica y asignación de
              sede.
            </Text>

            {/* Resumen de los datos recibidos */}
            <View style={styles.summaryBox}>
              <Text style={styles.summaryTitle}>RESUMEN DE LA POSTULACIÓN:</Text>
              <Text style={styles.summaryItem}>• Deportista: <Text style={styles.summaryVal}>{nombres} {apellidos}</Text></Text>
              {rut ? <Text style={styles.summaryItem}>• RUT Alumno: <Text style={styles.summaryVal}>{rut}</Text></Text> : null}
              {dob ? <Text style={styles.summaryItem}>• Fecha Nacimiento: <Text style={styles.summaryVal}>{dob} ({edadDescriptiva || 'Edad calculada'})</Text></Text> : null}
              <Text style={styles.summaryItem}>• Grado / Cinturón: <Text style={styles.summaryVal}>{selectedBelt.nombre}</Text></Text>
              <Text style={styles.summaryItem}>• Sede Solicitada: <Text style={styles.summaryVal}>{currentSelectedAcademia?.nombre || 'Por asignar por el Sensei'}</Text></Text>
              <Text style={styles.summaryItem}>• Apoderado: <Text style={styles.summaryVal}>{apoderadoNombre} ({apoderadoTelefono})</Text></Text>
            </View>

            {/* Botones de Acción */}
            <View style={styles.successActionsCol}>
              <TouchableOpacity style={styles.newSubmissionBtn} onPress={handleResetForm} activeOpacity={0.85}>
                <Text style={styles.newSubmissionBtnText}>+ INSCRIBIR A OTRO ALUMNO</Text>
              </TouchableOpacity>

              {isPublicView && onBackToLogin ? (
                <TouchableOpacity style={styles.backToLoginBtn} onPress={onBackToLogin} activeOpacity={0.85}>
                  <Text style={styles.backToLoginBtnText}>🔒 ACCESO ADMINISTRATIVO (SENSEI / PROFESORES)</Text>
                </TouchableOpacity>
              ) : (
                <TouchableOpacity
                  style={styles.backToDashboardBtn}
                  onPress={() => setTab('configuracion')}
                  activeOpacity={0.85}
                >
                  <Text style={styles.backToDashboardBtnText}>
                    IR A "SOLICITUD DE ALUMNOS" EN CONFIGURACIONES ➔
                  </Text>
                </TouchableOpacity>
              )}
            </View>
          </View>
        </View>
      </View>
    );
  }

  // =========================================================================
  // VISTA PRINCIPAL DEL FORMULARIO
  // =========================================================================
  return (
    <ScrollView style={styles.container} contentContainerStyle={[styles.content, isMobile && { padding: 12 }]}>
      {/* Si se visualiza desde el sistema administrativo, mostrar tarjeta gestora de enlace */}
      {!isPublicView && (
        <View style={styles.adminShareCard}>
          <View style={styles.adminShareRibbon}>
            <Text style={styles.adminShareRibbonText}>
              PANEL ADMINISTRATIVO • GESTOR DE ENLACE DE MATRÍCULA ONLINE
            </Text>
          </View>
          <View style={[styles.adminShareBody, isMobile && { flexDirection: 'column', gap: 14 }]}>
            <View style={{ flex: 1, gap: 6 }}>
              <Text style={styles.adminShareTitle}>
                Enlace Oficial para Enviar a Apoderados por WhatsApp y Redes
              </Text>
              <Text style={styles.adminShareDesc}>
                Este enlace funciona 100% fuera del dashboard administrativo. Los apoderados completan su ficha de
                forma independiente y las respuestas entran directamente a la bandeja "Solicitud de Alumnos" en
                Configuraciones para su posterior aprobación.
              </Text>
              <View style={styles.urlShareBox}>
                <Text style={styles.urlShareText} numberOfLines={1}>
                  https://dojoshitoryu.cl/?matricula=1
                </Text>
              </View>
            </View>

            <View style={styles.adminShareBtnCol}>
              <TouchableOpacity
                style={styles.btnCopyShareUrl}
                onPress={handleCopyPublicLink}
                activeOpacity={0.85}
              >
                <Text style={styles.btnCopyShareUrlText}>
                  {copiedLink ? '✓ ¡ENLACE COPIADO!' : 'COPIAR LINK PARA WHATSAPP'}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.btnGoToRequests}
                onPress={() => setTab('configuracion')}
                activeOpacity={0.85}
              >
                <Text style={styles.btnGoToRequestsText}>
                  VER SOLICITUDES ({solicitudesPendientesCount} PENDIENTES) ➔
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      )}

      {/* Tarjeta del Formulario de Matrícula */}
      <View style={[styles.formCard, isMobile && { width: '100%' }]}>
        {/* Cinta Superior Oficial */}
        <View style={styles.formRibbonTop}>
          <Text style={styles.formRibbonTopText}>
            PORTAL OFICIAL DE MATRÍCULA ONLINE — SHITO RYU KYOKAN GENBUKAI
          </Text>
          {isPublicView && onBackToLogin ? (
            <TouchableOpacity onPress={onBackToLogin} style={styles.headerSenseiBtn} activeOpacity={0.8}>
              <Text style={styles.headerSenseiBtnText}>🔒 Acceso Sensei</Text>
            </TouchableOpacity>
          ) : null}
        </View>

        {/* Encabezado con Selector Desplegable Corto de Academia / Sede */}
        <View style={styles.formHeader}>
          <Text style={styles.formTitle}>FICHA DE POSTULACIÓN E INSCRIPCIÓN DEPORTIVA</Text>
          <Text style={styles.formDesc}>
            Completa los antecedentes del deportista para registrar su ingreso oficial al dojo. Esta postulación será
            revisada por el Sensei antes de su incorporación definitiva.
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
                    ⚠️ Sin sede asignada (El Sensei la definirá en Configuraciones)
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

          {/* Selector de Grado / Cinturón con kyu oficiales */}
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
            <View style={[styles.inputBox, { flex: 1.2 }]}>
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

            <View style={[styles.inputBox, { flex: 1.2 }]}>
              <Text style={styles.label}>Correo Electrónico Apoderado</Text>
              <TextInput
                style={styles.input}
                placeholder="apoderado@gmail.com"
                placeholderTextColor={colors.textDim}
                value={apoderadoEmail}
                onChangeText={setApoderadoEmail}
                keyboardType="email-address"
                autoCapitalize="none"
              />
            </View>

            <View style={[styles.inputBox, { flex: 0.8 }]}>
              <Text style={styles.label}>Parentesco</Text>
              <TextInput
                style={styles.input}
                placeholder="Padre, Madre, Tutor"
                placeholderTextColor={colors.textDim}
                value={apoderadoParentesco}
                onChangeText={setApoderadoParentesco}
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
          <Text style={styles.submitBtnText}>ENVIAR SOLICITUD DE MATRÍCULA AL DOJO ➔</Text>
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
    gap: 16,
  },
  adminShareCard: {
    backgroundColor: colors.bgCard,
    borderWidth: 1,
    borderColor: colors.primary,
    borderRadius: 0,
    maxWidth: 780,
    width: '100%',
    overflow: 'hidden',
  },
  adminShareRibbon: {
    backgroundColor: colors.primary,
    paddingVertical: 7,
    paddingHorizontal: 16,
  },
  adminShareRibbonText: {
    color: '#FFFFFF',
    fontWeight: '900',
    fontSize: 10,
    letterSpacing: 1,
  },
  adminShareBody: {
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  adminShareTitle: {
    color: colors.textPrimary,
    fontSize: 14,
    fontWeight: '900',
  },
  adminShareDesc: {
    color: colors.textMuted,
    fontSize: 11,
    lineHeight: 16,
  },
  urlShareBox: {
    backgroundColor: colors.bgInput,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
    padding: 8,
    marginTop: 4,
  },
  urlShareText: {
    color: colors.primary,
    fontSize: 11,
    fontWeight: '700',
  },
  adminShareBtnCol: {
    gap: 8,
    minWidth: 220,
  },
  btnCopyShareUrl: {
    backgroundColor: colors.primary,
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 0,
    alignItems: 'center',
  },
  btnCopyShareUrlText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  btnGoToRequests: {
    backgroundColor: colors.bgInput,
    borderWidth: 1,
    borderColor: colors.borderLight,
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 0,
    alignItems: 'center',
  },
  btnGoToRequestsText: {
    color: colors.textSecondary,
    fontSize: 10,
    fontWeight: '800',
  },
  formCard: {
    backgroundColor: colors.bgCard,
    borderWidth: 1,
    borderColor: colors.borderLight,
    borderRadius: 0,
    maxWidth: 780,
    width: '100%',
    overflow: 'hidden',
  },
  formRibbonTop: {
    backgroundColor: colors.primary,
    paddingVertical: 8,
    paddingHorizontal: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  formRibbonTopText: {
    color: '#FFFFFF',
    fontWeight: '900',
    fontSize: 10,
    letterSpacing: 1.2,
    flex: 1,
  },
  headerSenseiBtn: {
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 0,
  },
  headerSenseiBtnText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '800',
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
    backgroundColor: colors.bgInput,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
    paddingHorizontal: 12,
    paddingVertical: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  schoolDropdownTriggerText: {
    color: colors.textPrimary,
    fontSize: 12,
    fontWeight: '700',
    flex: 1,
  },
  schoolDropdownArrow: {
    color: colors.textDim,
    fontSize: 10,
    marginLeft: 8,
  },
  schoolDropdownMenu: {
    backgroundColor: colors.bgDarkest,
    borderWidth: 1,
    borderColor: colors.primary,
    marginTop: 4,
  },
  schoolDropdownItem: {
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderSubtle,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  schoolDropdownItemActive: {
    backgroundColor: 'rgba(255, 107, 0, 0.12)',
  },
  schoolDropdownItemText: {
    color: colors.textSecondary,
    fontSize: 12,
    fontWeight: '600',
    flex: 1,
  },
  schoolDropdownItemTextActive: {
    color: colors.primary,
    fontWeight: '800',
  },
  errorBanner: {
    backgroundColor: colors.dangerBg,
    borderLeftWidth: 4,
    borderLeftColor: colors.danger,
    padding: 12,
    marginHorizontal: 20,
    marginTop: 16,
  },
  errorBannerText: {
    color: colors.danger,
    fontSize: 12,
    fontWeight: '700',
  },
  fieldset: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderSubtle,
    gap: 14,
  },
  fieldsetTitle: {
    color: colors.textPrimary,
    fontSize: 13,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  fieldHint: {
    color: colors.textDim,
    fontSize: 11,
    marginTop: -8,
  },
  row: {
    flexDirection: 'row',
    gap: 12,
  },
  inputBox: {
    gap: 6,
  },
  label: {
    color: colors.textSecondary,
    fontSize: 11,
    fontWeight: '700',
  },
  input: {
    backgroundColor: colors.bgInput,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
    borderRadius: 0,
    paddingHorizontal: 12,
    paddingVertical: 10,
    color: colors.textPrimary,
    fontSize: 13,
  },
  calcAgeText: {
    color: colors.accent,
    fontSize: 10,
    fontWeight: '800',
    marginTop: 2,
  },
  genderRow: {
    flexDirection: 'row',
    gap: 8,
  },
  genderBtn: {
    flex: 1,
    backgroundColor: colors.bgInput,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 0,
  },
  genderBtnActive: {
    borderColor: colors.primary,
    backgroundColor: 'rgba(255, 107, 0, 0.12)',
  },
  genderText: {
    color: colors.textDim,
    fontSize: 10,
    fontWeight: '800',
  },
  genderTextActive: {
    color: colors.primary,
    fontWeight: '900',
  },
  beltSelectorBox: {
    gap: 8,
    marginTop: 6,
  },
  beltSelectorHint: {
    color: colors.textDim,
    fontSize: 11,
    lineHeight: 16,
  },
  beltsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  beltOptionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.bgInput,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
    paddingHorizontal: 8,
    paddingVertical: 6,
    gap: 8,
    width: '49%',
    borderRadius: 0,
  },
  beltOptionCardActive: {
    borderColor: colors.primary,
    backgroundColor: 'rgba(255, 107, 0, 0.12)',
  },
  beltColorIndicator: {
    width: 14,
    height: 14,
    borderRadius: 0,
  },
  beltOptionName: {
    color: colors.textSecondary,
    fontSize: 10,
    fontWeight: '700',
    flex: 1,
  },
  beltOptionNameActive: {
    color: colors.primary,
    fontWeight: '900',
  },
  beltCheckText: {
    color: colors.primary,
    fontSize: 11,
    fontWeight: '900',
  },
  previousDojoBox: {
    backgroundColor: colors.bgDark,
    borderWidth: 1,
    borderColor: colors.borderLight,
    padding: 12,
    marginTop: 6,
    gap: 6,
  },
  previousDojoTitle: {
    color: colors.accent,
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  previousDojoDesc: {
    color: colors.textMuted,
    fontSize: 11,
  },
  submitBtn: {
    backgroundColor: colors.primary,
    paddingVertical: 16,
    paddingHorizontal: 24,
    alignItems: 'center',
    margin: 20,
    borderRadius: 0,
  },
  submitBtnText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '900',
    letterSpacing: 1,
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
    borderWidth: 1,
    borderColor: colors.primary,
    borderRadius: 0,
    maxWidth: 620,
    width: '100%',
    overflow: 'hidden',
  },
  successRibbon: {
    backgroundColor: colors.primary,
    paddingVertical: 8,
    paddingHorizontal: 16,
    alignItems: 'center',
  },
  successRibbonText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 1.2,
  },
  successBody: {
    padding: 24,
    alignItems: 'center',
    gap: 16,
  },
  successIconBox: {
    width: 60,
    height: 60,
    borderRadius: 0,
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
    borderWidth: 2,
    borderColor: colors.success,
    alignItems: 'center',
    justifyContent: 'center',
  },
  successIcon: {
    fontSize: 28,
    color: colors.success,
    fontWeight: '900',
  },
  successTitle: {
    fontSize: 16,
    fontWeight: '900',
    color: colors.textPrimary,
    textAlign: 'center',
    letterSpacing: 0.5,
  },
  successDesc: {
    color: colors.textSecondary,
    fontSize: 12,
    lineHeight: 18,
    textAlign: 'center',
  },
  summaryBox: {
    backgroundColor: colors.bgInput,
    borderWidth: 1,
    borderColor: colors.borderLight,
    padding: 16,
    width: '100%',
    gap: 6,
  },
  summaryTitle: {
    color: colors.accent,
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 1,
    marginBottom: 4,
  },
  summaryItem: {
    color: colors.textMuted,
    fontSize: 11,
  },
  summaryVal: {
    color: colors.textPrimary,
    fontWeight: '800',
  },
  successActionsCol: {
    width: '100%',
    gap: 10,
    marginTop: 10,
  },
  newSubmissionBtn: {
    backgroundColor: colors.primary,
    paddingVertical: 14,
    paddingHorizontal: 20,
    alignItems: 'center',
    borderRadius: 0,
  },
  newSubmissionBtnText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '900',
    letterSpacing: 0.8,
  },
  backToLoginBtn: {
    backgroundColor: colors.bgDark,
    borderWidth: 1,
    borderColor: colors.borderLight,
    paddingVertical: 12,
    paddingHorizontal: 20,
    alignItems: 'center',
    borderRadius: 0,
  },
  backToLoginBtnText: {
    color: colors.textSecondary,
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  backToDashboardBtn: {
    backgroundColor: colors.bgDark,
    borderWidth: 1,
    borderColor: colors.borderLight,
    paddingVertical: 12,
    paddingHorizontal: 20,
    alignItems: 'center',
    borderRadius: 0,
  },
  backToDashboardBtnText: {
    color: colors.textSecondary,
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
});
