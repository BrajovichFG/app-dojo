import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Modal,
} from 'react-native';
import { useDojoStore } from '../store/dojoStore';
import { Academia, Usuario, CategoriaKarate, SolicitudMatricula } from '../types';
import { isCentralAcademia, matchAcademia, GRADOS_CINTURON, CENTRAL_ACADEMIA_ID } from '../data/constants';
import {
  CATEGORIAS_KUMITE,
  CATEGORIAS_KATA,
  calcularEdad,
  sugerirCategoriaKumite,
  sugerirCategoriaKata,
} from '../utils/karateEngine';
import { colors, radii, useResponsive } from '../theme/theme';

export const ConfiguracionScreen: React.FC = () => {
  const { isMobile } = useResponsive();

  const academias = useDojoStore((state) => state.academias);
  const addAcademia = useDojoStore((state) => state.addAcademia);
  const deleteAcademia = useDojoStore((state) => state.deleteAcademia);
  const users = useDojoStore((state) => state.users);
  const addUsuario = useDojoStore((state) => state.addUsuario);
  const currentUser = useDojoStore((state) => state.currentUser);
  const assignAcademiaToUser = useDojoStore((state) => state.assignAcademiaToUser);
  const removeAcademiaFromUser = useDojoStore((state) => state.removeAcademiaFromUser);
  const students = useDojoStore((state) => state.students);
  const reassignStudentAcademia = useDojoStore((state) => state.reassignStudentAcademia);
  const customCategories = useDojoStore((state) => state.customCategories);
  const addCustomCategory = useDojoStore((state) => state.addCustomCategory);
  const deleteCustomCategory = useDojoStore((state) => state.deleteCustomCategory);

  // Solicitudes de Matrícula Online
  const solicitudesMatricula = useDojoStore((state) => state.solicitudesMatricula);
  const aprobarSolicitudMatricula = useDojoStore((state) => state.aprobarSolicitudMatricula);
  const rechazarSolicitudMatricula = useDojoStore((state) => state.rechazarSolicitudMatricula);
  const deleteSolicitudMatricula = useDojoStore((state) => state.deleteSolicitudMatricula);

  const [activeSubTab, setActiveSubTab] = useState<'sedes' | 'profesores' | 'solicitudes' | 'traslados' | 'categorias'>('solicitudes');

  // Estados sección Solicitud de Alumnos
  const [filtroEstadoSol, setFiltroEstadoSol] = useState<'PENDIENTE' | 'APROBADA' | 'TODAS'>('PENDIENTE');
  const [busquedaSol, setBusquedaSol] = useState('');
  const [selectedSedeForSol, setSelectedSedeForSol] = useState<Record<string, string>>({});
  const [toastMsg, setToastMsg] = useState('');

  // Modal Nueva Sede
  const [showAddSedeModal, setShowAddSedeModal] = useState(false);
  const [sedeNombre, setSedeNombre] = useState('');
  const [sedeDireccion, setSedeDireccion] = useState('');
  const [sedeTelefono, setSedeTelefono] = useState('+56 9 ');
  const [sedeEmail, setSedeEmail] = useState('');

  // Modal Nuevo Profesor
  const [showAddUserModal, setShowAddUserModal] = useState(false);
  const [userNombre, setUserNombre] = useState('');
  const [userEmail, setUserEmail] = useState('');
  const [userTelefono, setUserTelefono] = useState('+56 9 ');
  const [userRol, setUserRol] = useState<'SENSEI' | 'INSTRUCTOR'>('SENSEI');

  // Filtro traslado de alumnos
  const [filtroAlumno, setFiltroAlumno] = useState('');
  const [filtroSedeTraslado, setFiltroSedeTraslado] = useState('ALL');

  // Estados Categorías y Reglas WKF
  const [filtroModalidad, setFiltroModalidad] = useState<'TODAS' | 'KUMITE' | 'KATA' | 'CUSTOM'>('TODAS');
  const [busquedaCat, setBusquedaCat] = useState('');
  const [showAddCatModal, setShowAddCatModal] = useState(false);

  // Formulario nueva categoría
  const [catNombre, setCatNombre] = useState('');
  const [catModalidad, setCatModalidad] = useState<'KUMITE' | 'KATA'>('KUMITE');
  const [catDivision, setCatDivision] = useState('CADETE');
  const [catGenero, setCatGenero] = useState<'M' | 'F' | 'X'>('M');
  const [catEdadMin, setCatEdadMin] = useState('14');
  const [catEdadMax, setCatEdadMax] = useState('15');
  const [catPesoMin, setCatPesoMin] = useState('0');
  const [catPesoMax, setCatPesoMax] = useState('52');

  // Probador interactivo de reglas en tiempo real
  const [simDob, setSimDob] = useState('2011-04-18');
  const [simGenero, setSimGenero] = useState<'M' | 'F'>('M');
  const [simPeso, setSimPeso] = useState('51.2');

  const isDueno = currentUser?.rol === 'ADMIN_GENERAL';

  const handleCreateSede = () => {
    if (!sedeNombre.trim()) return;
    addAcademia({
      nombre: sedeNombre.trim(),
      rut_titular: '14.285.923-1',
      direccion: sedeDireccion.trim() || 'Dirección por definir',
      telefono: sedeTelefono.trim(),
      email: sedeEmail.trim(),
    });
    setSedeNombre('');
    setSedeDireccion('');
    setSedeTelefono('+56 9 ');
    setSedeEmail('');
    setShowAddSedeModal(false);
  };

  const handleCreateUser = () => {
    if (!userNombre.trim() || !userEmail.trim()) return;
    addUsuario({
      nombre_completo: userNombre.trim(),
      email: userEmail.trim().toLowerCase(),
      telefono: userTelefono.trim(),
      rol: userRol,
      activo: true,
      academias: [academias[0]],
    });
    setUserNombre('');
    setUserEmail('');
    setUserTelefono('+56 9 ');
    setShowAddUserModal(false);
  };

  const handleCreateCategory = () => {
    if (!catNombre.trim()) {
      alert('Ingresa el nombre o etiqueta de la categoría.');
      return;
    }
    const edadMinNum = parseInt(catEdadMin, 10) || 0;
    const edadMaxNum = parseInt(catEdadMax, 10) || 99;
    const pesoMinNum = catPesoMin ? parseFloat(catPesoMin.replace(',', '.')) : undefined;
    const pesoMaxNum = catPesoMax ? parseFloat(catPesoMax.replace(',', '.')) : undefined;

    const newCat: CategoriaKarate = {
      id: `custom-cat-${Date.now()}`,
      nombre_etiqueta: catNombre.trim(),
      modalidad: catModalidad,
      division: catDivision.trim().toUpperCase() || 'ESPECIAL',
      genero: catGenero,
      edad_min: edadMinNum,
      edad_max: edadMaxNum,
      peso_min_kg: pesoMinNum,
      peso_max_kg: pesoMaxNum,
    };

    addCustomCategory(newCat);
    setCatNombre('');
    setShowAddCatModal(false);
  };

  const solicitudesPendientes = solicitudesMatricula.filter((s) => s.estado === 'PENDIENTE');
  const solicitudesAprobadas = solicitudesMatricula.filter((s) => s.estado === 'APROBADA');

  const handleAprobarSolicitud = async (solId: string) => {
    const sol = solicitudesMatricula.find((s) => s.id === solId);
    if (!sol) return;
    const targetSede = selectedSedeForSol[solId] || sol.academia_id || academias[0]?.id;
    await aprobarSolicitudMatricula(solId, targetSede);
    setToastMsg(`✓ Matrícula de ${sol.nombres} ${sol.apellidos} aprobada e incorporada a ALUMNOS/ASIGNACION.`);
    setTimeout(() => setToastMsg(''), 5000);
  };

  const handleRechazarSolicitud = (solId: string) => {
    const sol = solicitudesMatricula.find((s) => s.id === solId);
    if (!sol) return;
    rechazarSolicitudMatricula(solId);
    setToastMsg(`Solicitud de ${sol.nombres} ${sol.apellidos} rechazada.`);
    setTimeout(() => setToastMsg(''), 4000);
  };

  const handleOpenWhatsAppSolicitud = (phone: string, studentName: string, guardianName: string) => {
    const cleanPhone = phone.replace(/[^0-9]/g, '');
    const msg = encodeURIComponent(
      `Hola ${guardianName}, le informamos desde Dojo Shito Ryu Kyokan Genbukai Rancagua que la postulación de matrícula de ${studentName} ha sido APROBADA con éxito. ¡Bienvenido/a al dojo! Por favor infórmenos si tiene alguna consulta respecto a su primera clase.`
    );
    if (typeof window !== 'undefined') {
      window.open(`https://wa.me/${cleanPhone}?text=${msg}`, '_blank');
    }
  };

  const allCategories: CategoriaKarate[] = [
    ...CATEGORIAS_KUMITE,
    ...CATEGORIAS_KATA,
    ...customCategories,
  ];

  // Cálculo de simulación interactiva
  const simEdad = simDob ? calcularEdad(simDob) : 0;
  const simPesoNum = parseFloat(simPeso.replace(',', '.')) || 0;
  const simKumiteMatch = simDob && simPesoNum ? sugerirCategoriaKumite(simDob, simGenero, simPesoNum) : null;
  const simKataMatch = simDob ? sugerirCategoriaKata(simDob, simGenero) : null;

  return (
    <ScrollView style={styles.container} contentContainerStyle={[styles.content, isMobile && { padding: 14 }]}>
      {/* Encabezado del Módulo */}
      <View style={styles.headerSquare}>
        <View style={styles.headerRibbon}>
          <Text style={styles.headerRibbonText}>PANEL DE CONTROL GENERAL</Text>
        </View>
        <View style={[styles.headerBody, isMobile && { flexDirection: 'column', alignItems: 'flex-start', gap: 12 }]}>
          <View style={{ flex: 1 }}>
            <Text style={styles.title}>CONFIGURACIONES</Text>
            <Text style={styles.subtitle}>
              Administración de sedes asociadas, traslados de alumnos y reglas oficiales WKF
            </Text>
          </View>
          <View style={[styles.roleBadgeContainer, isMobile && { alignItems: 'flex-start' }]}>
            <Text style={styles.roleBadgeLabel}>PERFIL ACTIVO:</Text>
            <View style={[styles.roleBadgeSquare, isDueno ? styles.badgeDueno : styles.badgeProfe]}>
              <Text style={styles.roleBadgeText}>
                {isDueno ? 'DUEÑO (ADMIN GENERAL)' : 'PROFESOR AUTORIZADO'}
              </Text>
            </View>
          </View>
        </View>

        {/* Sub-Pestañas con Scroll Horizontal en móvil */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.tabsContainer}
        >
          <TouchableOpacity
            style={[styles.subTab, activeSubTab === 'sedes' && styles.subTabActive]}
            onPress={() => setActiveSubTab('sedes')}
          >
            <Text style={[styles.subTabText, activeSubTab === 'sedes' && styles.subTabTextActive]}>
              ESCUELAS Y SEDES ({academias.length})
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.subTab, activeSubTab === 'profesores' && styles.subTabActive]}
            onPress={() => setActiveSubTab('profesores')}
          >
            <Text style={[styles.subTabText, activeSubTab === 'profesores' && styles.subTabTextActive]}>
              PROFESORES Y PERMISOS ({users.length})
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.subTab, activeSubTab === 'solicitudes' && styles.subTabActive]}
            onPress={() => setActiveSubTab('solicitudes')}
          >
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
              <Text style={[styles.subTabText, activeSubTab === 'solicitudes' && styles.subTabTextActive]}>
                SOLICITUD DE ALUMNOS ({solicitudesPendientes.length})
              </Text>
              {solicitudesPendientes.length > 0 && (
                <View style={styles.tabBadgePulse}>
                  <Text style={styles.tabBadgePulseText}>{solicitudesPendientes.length}</Text>
                </View>
              )}
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.subTab, activeSubTab === 'traslados' && styles.subTabActive]}
            onPress={() => setActiveSubTab('traslados')}
          >
            <Text style={[styles.subTabText, activeSubTab === 'traslados' && styles.subTabTextActive]}>
              ALUMNOS/ASIGNACION ({students.length})
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.subTab, activeSubTab === 'categorias' && styles.subTabActive]}
            onPress={() => setActiveSubTab('categorias')}
          >
            <Text style={[styles.subTabText, activeSubTab === 'categorias' && styles.subTabTextActive]}>
              CATEGORÍAS Y REGLAS WKF ({allCategories.length})
            </Text>
          </TouchableOpacity>
        </ScrollView>
      </View>

      {/* SUB-PESTAÑA 1: SEDES / ESCUELAS */}
      {activeSubTab === 'sedes' && (
        <View style={styles.tabContent}>
          <View style={[styles.sectionHeaderBar, isMobile && { flexDirection: 'column', alignItems: 'stretch' }]}>
            <View>
              <Text style={styles.sectionTitle}>LISTADO DE ESCUELAS Y SEDES AUTORIZADAS</Text>
              <Text style={styles.sectionDesc}>
                Cada escuela mantiene sus propios horarios, mensualidades y nómina de alumnos.
              </Text>
            </View>
            {isDueno && (
              <TouchableOpacity
                style={styles.btnActionSquare}
                onPress={() => setShowAddSedeModal(true)}
              >
                <Text style={styles.btnActionText}>+ AGREGAR NUEVA ESCUELA / SEDE</Text>
              </TouchableOpacity>
            )}
          </View>

          <View style={styles.cardsGrid}>
            {academias.map((acad, idx) => {
              const isMatriz = idx === 0 || isCentralAcademia(acad.id);
              const alumnosEnSede = students.filter((s) => matchAcademia(s.academia_id, acad.id)).length;
              const profesEnSede = users.filter((u) => u.academias.some((a) => a.id === acad.id)).length;

              return (
                <View
                  key={acad.id}
                  style={[
                    styles.academiaCardSquare,
                    isMobile && { minWidth: '100%', flex: undefined },
                  ]}
                >
                  <View style={styles.cardHeaderRibbon}>
                    <Text style={styles.cardHeaderRibbonText}>
                      SEDE OFICIAL #{idx + 1} {isMatriz && '• MATRIZ CENTRAL'}
                    </Text>
                  </View>

                  <View style={styles.cardBody}>
                    <Text style={styles.cardTitle}>{acad.nombre}</Text>
                    <View style={styles.cardDetailRow}>
                      <Text style={styles.cardDetailLabel}>Dirección:</Text>
                      <Text style={styles.cardDetailValue}>{acad.direccion || 'Sin dirección'}</Text>
                    </View>
                    <View style={styles.cardDetailRow}>
                      <Text style={styles.cardDetailLabel}>Contacto:</Text>
                      <Text style={styles.cardDetailValue}>{acad.telefono || 'Sin teléfono'}</Text>
                    </View>
                    <View style={styles.cardDetailRow}>
                      <Text style={styles.cardDetailLabel}>RUT Sede:</Text>
                      <Text style={styles.cardDetailValue}>{acad.rut_titular}</Text>
                    </View>

                    <View style={styles.statsRow}>
                      <View style={styles.statBox}>
                        <Text style={styles.statBoxNumber}>{alumnosEnSede}</Text>
                        <Text style={styles.statBoxLabel}>ALUMNOS INSCRITOS</Text>
                      </View>
                      <View style={styles.statBox}>
                        <Text style={styles.statBoxNumber}>{profesEnSede}</Text>
                        <Text style={styles.statBoxLabel}>PROFESORES CON ACCESO</Text>
                      </View>
                    </View>

                    {!isMatriz && isDueno && (
                      <TouchableOpacity
                        style={styles.deleteSedeBtnSquare}
                        onPress={() => {
                          if (confirm(`¿Deseas eliminar la sede "${acad.nombre}"?`)) {
                            deleteAcademia(acad.id);
                          }
                        }}
                      >
                        <Text style={styles.deleteSedeBtnText}>ELIMINAR SEDE</Text>
                      </TouchableOpacity>
                    )}
                  </View>
                </View>
              );
            })}
          </View>
        </View>
      )}

      {/* SUB-PESTAÑA 2: PROFESORES Y ASIGNACIÓN DE SEDES */}
      {activeSubTab === 'profesores' && (
        <View style={styles.tabContent}>
          <View style={[styles.infoNoticeSquare, isMobile && { flexDirection: 'column', alignItems: 'stretch' }]}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
              <Text style={styles.infoNoticeTitle}>MATRIZ DE PRIVILEGIOS Y ASIGNACIÓN DE ESCUELAS</Text>
            </View>
            <Text style={styles.infoNoticeDesc}>
              El Sensei Dueño (<Text style={{ fontWeight: '700', color: colors.textPrimary }}>ADMIN GENERAL</Text>) puede activar o desactivar las escuelas en las que cada profesor tiene permitido entrar para ver alumnos, tomar asistencias y planificar clases.
            </Text>
            {isDueno && (
              <TouchableOpacity
                style={styles.btnActionSquare}
                onPress={() => setShowAddUserModal(true)}
              >
                <Text style={styles.btnActionText}>+ NUEVO PROFESOR</Text>
              </TouchableOpacity>
            )}
          </View>

          <View style={styles.usersList}>
            {users.map((usr) => {
              const isUserDueno = usr.rol === 'ADMIN_GENERAL';
              return (
                <View key={usr.id} style={styles.userCardSquare}>
                  <View style={[styles.userCardHeader, isMobile && { flexDirection: 'column', gap: 8 }]}>
                    <View style={styles.userInfoBox}>
                      <Text style={styles.userFullName}>{usr.nombre_completo}</Text>
                      <Text style={styles.userEmail}>{usr.email} • {usr.telefono}</Text>
                    </View>
                    <View
                      style={[
                        styles.userBadge,
                        isUserDueno ? styles.badgeDueno : styles.badgeProfe,
                      ]}
                    >
                      <Text style={styles.userBadgeText}>
                        {isUserDueno ? 'DUEÑO (ADMIN GENERAL)' : usr.rol}
                      </Text>
                    </View>
                  </View>

                  <View style={styles.assignmentBlock}>
                    <Text style={styles.assignmentTitle}>
                      ESCUELAS / SEDES A LAS QUE TIENE ACCESO ESTE PROFESOR:
                    </Text>
                    <View style={styles.academiasChecksGrid}>
                      {academias.map((acad) => {
                        const hasAccess = usr.academias.some((a) => a.id === acad.id);
                        return (
                          <TouchableOpacity
                            key={acad.id}
                            style={[
                              styles.checkOptionSquare,
                              hasAccess && styles.checkOptionSquareActive,
                              isMobile && { minWidth: '100%' },
                            ]}
                            onPress={() => {
                              if (hasAccess) {
                                if (usr.academias.length <= 1) {
                                  alert('El profesor debe tener al menos una escuela asignada.');
                                  return;
                                }
                                removeAcademiaFromUser(usr.id, acad.id);
                              } else {
                                assignAcademiaToUser(usr.id, acad.id);
                              }
                            }}
                            activeOpacity={0.8}
                          >
                            <View
                              style={[
                                styles.checkboxSquare,
                                hasAccess && styles.checkboxSquareChecked,
                              ]}
                            >
                              {hasAccess && <Text style={styles.checkboxCheck}>✓</Text>}
                            </View>
                            <View style={{ flex: 1 }}>
                              <Text
                                style={[
                                  styles.checkOptionName,
                                  hasAccess && styles.checkOptionNameActive,
                                ]}
                              >
                                {acad.nombre}
                              </Text>
                              <Text style={styles.checkOptionSub}>
                                {hasAccess ? 'Acceso Habilitado' : 'Sin Acceso'}
                              </Text>
                            </View>
                          </TouchableOpacity>
                        );
                      })}
                    </View>
                  </View>
                </View>
              );
            })}
          </View>
        </View>
      )}

      {/* SUB-PESTAÑA 3: BANDEJA DE SOLICITUDES DE MATRÍCULA ONLINE */}
      {activeSubTab === 'solicitudes' && (
        <View style={styles.tabContent}>
          {toastMsg ? (
            <View style={styles.toastBanner}>
              <Text style={styles.toastBannerText}>{toastMsg}</Text>
            </View>
          ) : null}

          <View style={[styles.sectionHeaderBar, isMobile && { flexDirection: 'column', alignItems: 'stretch' }]}>
            <View>
              <Text style={styles.sectionTitle}>SOLICITUD DE ALUMNOS (MATRÍCULAS ONLINE RECIBIDAS)</Text>
              <Text style={styles.sectionDesc}>
                Fichas completadas por apoderados desde el enlace público web. Requieren aprobación antes de integrarse a la nómina oficial.
              </Text>
            </View>
            <View style={[styles.searchBox, isMobile && { width: '100%' }]}>
              <TextInput
                style={styles.searchInput}
                placeholder="Buscar por deportista, RUT o apoderado..."
                placeholderTextColor="#64748B"
                value={busquedaSol}
                onChangeText={setBusquedaSol}
              />
            </View>
          </View>

          {/* Filtros de Estado */}
          <View style={{ flexDirection: 'row', gap: 8, marginBottom: 14, flexWrap: 'wrap' }}>
            <TouchableOpacity
              style={[
                styles.schoolPill,
                filtroEstadoSol === 'PENDIENTE' && styles.schoolPillActive,
                solicitudesPendientes.length > 0 && { borderColor: colors.primary },
              ]}
              onPress={() => setFiltroEstadoSol('PENDIENTE')}
            >
              <Text
                style={[
                  styles.schoolPillText,
                  filtroEstadoSol === 'PENDIENTE' && styles.schoolPillTextActive,
                  solicitudesPendientes.length > 0 && { color: colors.primary, fontWeight: '900' },
                ]}
              >
                ⏳ PENDIENTES ({solicitudesPendientes.length})
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.schoolPill,
                filtroEstadoSol === 'APROBADA' && styles.schoolPillActive,
              ]}
              onPress={() => setFiltroEstadoSol('APROBADA')}
            >
              <Text
                style={[
                  styles.schoolPillText,
                  filtroEstadoSol === 'APROBADA' && styles.schoolPillTextActive,
                ]}
              >
                ✓ APROBADAS ({solicitudesAprobadas.length})
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.schoolPill,
                filtroEstadoSol === 'TODAS' && styles.schoolPillActive,
              ]}
              onPress={() => setFiltroEstadoSol('TODAS')}
            >
              <Text
                style={[
                  styles.schoolPillText,
                  filtroEstadoSol === 'TODAS' && styles.schoolPillTextActive,
                ]}
              >
                TODAS LAS SOLICITUDES ({solicitudesMatricula.length})
              </Text>
            </TouchableOpacity>
          </View>

          {/* Listado de Tarjetas de Solicitudes */}
          <View style={{ gap: 14 }}>
            {solicitudesMatricula
              .filter((sol) => {
                if (filtroEstadoSol === 'PENDIENTE' && sol.estado !== 'PENDIENTE') return false;
                if (filtroEstadoSol === 'APROBADA' && sol.estado !== 'APROBADA') return false;
                if (busquedaSol.trim()) {
                  const q = busquedaSol.toLowerCase();
                  const matchName = `${sol.nombres} ${sol.apellidos}`.toLowerCase().includes(q);
                  const matchRut = sol.rut && sol.rut.toLowerCase().includes(q);
                  const matchApod = sol.nombre_apoderado && sol.nombre_apoderado.toLowerCase().includes(q);
                  return matchName || matchRut || matchApod;
                }
                return true;
              })
              .map((sol) => {
                const belt = GRADOS_CINTURON.find((g) => g.id === sol.cinturon_id) || GRADOS_CINTURON[0];
                const solAcademia = academias.find((a) => a.id === sol.academia_id);
                const chosenSedeId = selectedSedeForSol[sol.id] || sol.academia_id || academias[0]?.id;
                const chosenAcademia = academias.find((a) => a.id === chosenSedeId);

                // Cálculo de edad
                let edadCalc = '';
                if (sol.fecha_nacimiento) {
                  const b = new Date(sol.fecha_nacimiento);
                  if (!isNaN(b.getTime())) {
                    const diff = new Date().getFullYear() - b.getFullYear();
                    edadCalc = `${diff} años`;
                  }
                }

                return (
                  <View key={sol.id} style={styles.solicitudCard}>
                    {/* Cinta de Cabecera */}
                    <View style={styles.solicitudCardHeader}>
                      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                        <Text style={styles.solicitudIdText}>
                          SOLICITUD #{sol.id.replace('sol-', '')}
                        </Text>
                        <Text style={styles.solicitudDateText}>
                          • Recibida: {new Date(sol.created_at).toLocaleDateString('es-CL')} a las {new Date(sol.created_at).toLocaleTimeString('es-CL', { hour: '2-digit', minute: '2-digit' })}
                        </Text>
                      </View>

                      <View
                        style={[
                          styles.solicitudStatusPill,
                          sol.estado === 'PENDIENTE' && styles.statusPillPending,
                          sol.estado === 'APROBADA' && styles.statusPillApproved,
                          sol.estado === 'RECHAZADA' && styles.statusPillRejected,
                        ]}
                      >
                        <Text
                          style={[
                            styles.solicitudStatusPillText,
                            sol.estado === 'PENDIENTE' && { color: colors.primary },
                            sol.estado === 'APROBADA' && { color: colors.success },
                            sol.estado === 'RECHAZADA' && { color: colors.danger },
                          ]}
                        >
                          {sol.estado === 'PENDIENTE' && '⏳ PENDIENTE DE APROBACIÓN'}
                          {sol.estado === 'APROBADA' && '✓ MATRÍCULA APROBADA'}
                          {sol.estado === 'RECHAZADA' && '✕ RECHAZADA'}
                        </Text>
                      </View>
                    </View>

                    {/* Cuerpo de la Solicitud */}
                    <View style={styles.solicitudCardBody}>
                      {/* Fila Principal: Datos Alumno y Apoderado */}
                      <View style={[styles.solicitudTwoCols, isMobile && { flexDirection: 'column' }]}>
                        {/* Columna Izquierda: Datos del Deportista */}
                        <View style={styles.solicitudCol}>
                          <Text style={styles.solicitudSectionLabel}>🥋 DATOS DEL DEPORTISTA</Text>
                          <Text style={styles.solicitudStudentName}>
                            {sol.nombres} {sol.apellidos}
                          </Text>

                          <View style={styles.solicitudDataGrid}>
                            <Text style={styles.solicitudDataRow}>
                              • RUT: <Text style={styles.solicitudDataVal}>{sol.rut || 'No informado'}</Text>
                            </Text>
                            <Text style={styles.solicitudDataRow}>
                              • Fecha Nacimiento: <Text style={styles.solicitudDataVal}>{sol.fecha_nacimiento || 'No informada'} {edadCalc ? `(${edadCalc})` : ''}</Text>
                            </Text>
                            <Text style={styles.solicitudDataRow}>
                              • Género: <Text style={styles.solicitudDataVal}>{sol.genero === 'F' ? 'Femenino (Damas)' : 'Masculino (Varones)'}</Text>
                            </Text>
                            <Text style={styles.solicitudDataRow}>
                              • Peso Actual: <Text style={styles.solicitudDataVal}>{sol.peso_actual_kg ? `${sol.peso_actual_kg} kg` : 'Sin pesaje'}</Text>
                            </Text>
                            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginVertical: 2 }}>
                              <Text style={styles.solicitudDataRow}>• Grado / Kyu:</Text>
                              <View style={[styles.beltColorSquare, { backgroundColor: belt.color_hex }]} />
                              <Text style={[styles.solicitudDataVal, { color: colors.primary }]}>{belt.nombre}</Text>
                            </View>
                            <Text style={styles.solicitudDataRow}>
                              • Talla Karategui: <Text style={styles.solicitudDataVal}>Polera {sol.talla_polera || 'M'} • Pantalón {sol.talla_pantalon || 'Talla 3'}</Text>
                            </Text>
                            <Text style={styles.solicitudDataRow}>
                              • Colegio / Trabajo: <Text style={styles.solicitudDataVal}>{sol.lugar_estudio_trabajo || 'No indicado'}</Text>
                            </Text>
                            <Text style={styles.solicitudDataRow}>
                              • Dirección: <Text style={styles.solicitudDataVal}>{sol.direccion || 'No indicada'}</Text>
                            </Text>
                            {sol.escuela_origen ? (
                              <Text style={[styles.solicitudDataRow, { color: colors.accent }]}>
                                • Dojo / Sensei Previo: <Text style={styles.solicitudDataVal}>{sol.escuela_origen}</Text>
                              </Text>
                            ) : null}
                          </View>
                        </View>

                        {/* Columna Derecha: Antecedentes del Apoderado */}
                        <View style={styles.solicitudCol}>
                          <Text style={styles.solicitudSectionLabel}>👨‍👩‍👧 ANTECEDENTES DEL APODERADO / TUTOR</Text>
                          <Text style={styles.solicitudGuardianName}>
                            {sol.nombre_apoderado} ({sol.parentesco_apoderado || 'Titular'})
                          </Text>

                          <View style={styles.solicitudDataGrid}>
                            <Text style={styles.solicitudDataRow}>
                              • RUT Apoderado: <Text style={styles.solicitudDataVal}>{sol.rut_apoderado || 'No informado'}</Text>
                            </Text>
                            <Text style={styles.solicitudDataRow}>
                              • Teléfono WhatsApp: <Text style={[styles.solicitudDataVal, { color: colors.primary }]}>{sol.telefono_apoderado}</Text>
                            </Text>
                            <Text style={styles.solicitudDataRow}>
                              • Correo: <Text style={styles.solicitudDataVal}>{sol.email_apoderado || 'No informado'}</Text>
                            </Text>
                            <Text style={styles.solicitudDataRow}>
                              • Día de Pago Comprometido: <Text style={styles.solicitudDataVal}>Día {sol.dia_pago_mensual || 5} de cada mes</Text>
                            </Text>
                          </View>

                          {/* Sede solicitada por el usuario */}
                          <View style={styles.sedeSolicitadaBox}>
                            <Text style={styles.sedeSolicitadaLabel}>SEDE SOLICITADA EN EL FORMULARIO:</Text>
                            <Text style={styles.sedeSolicitadaVal}>
                              📍 {solAcademia ? solAcademia.nombre : '⚠️ Sin sede seleccionada (Asignar abajo)'}
                            </Text>
                          </View>
                        </View>
                      </View>

                      {/* Asignación de Escuela y Acciones de Aprobación */}
                      <View style={styles.solicitudActionsBar}>
                        {sol.estado === 'PENDIENTE' && (
                          <View style={[styles.assignSchoolRow, isMobile && { flexDirection: 'column', alignItems: 'stretch' }]}>
                            <View style={{ flex: 1 }}>
                              <Text style={styles.assignSchoolLabel}>CONFIRMAR SEDE / ESCUELA A ASIGNAR:</Text>
                              <View style={styles.assignPillsWrap}>
                                {academias.map((ac) => {
                                  const isTarget = chosenSedeId === ac.id;
                                  return (
                                    <TouchableOpacity
                                      key={ac.id}
                                      style={[styles.assignPillBtn, isTarget && styles.assignPillBtnActive]}
                                      onPress={() => setSelectedSedeForSol({ ...selectedSedeForSol, [sol.id]: ac.id })}
                                      activeOpacity={0.8}
                                    >
                                      <Text style={[styles.assignPillText, isTarget && styles.assignPillTextActive]}>
                                        {isTarget ? '● ' : ''}{ac.nombre}
                                      </Text>
                                    </TouchableOpacity>
                                  );
                                })}
                              </View>
                            </View>

                            <View style={[styles.solicitudBtnGroup, isMobile && { flexDirection: 'column', width: '100%' }]}>
                              <TouchableOpacity
                                style={styles.btnApproveSolicitud}
                                onPress={() => handleAprobarSolicitud(sol.id)}
                                activeOpacity={0.85}
                              >
                                <Text style={styles.btnApproveSolicitudText}>
                                  ✓ APROBAR Y PASAR A ALUMNOS/ASIGNACION ➔
                                </Text>
                              </TouchableOpacity>

                              <TouchableOpacity
                                style={styles.btnWhatsAppSolicitud}
                                onPress={() => handleOpenWhatsAppSolicitud(sol.telefono_apoderado, `${sol.nombres} ${sol.apellidos}`, sol.nombre_apoderado)}
                                activeOpacity={0.85}
                              >
                                <Text style={styles.btnWhatsAppSolicitudText}>
                                  📲 ENVIAR WHATSAPP
                                </Text>
                              </TouchableOpacity>

                              <TouchableOpacity
                                style={styles.btnRejectSolicitud}
                                onPress={() => handleRechazarSolicitud(sol.id)}
                                activeOpacity={0.85}
                              >
                                <Text style={styles.btnRejectSolicitudText}>RECHAZAR</Text>
                              </TouchableOpacity>
                            </View>
                          </View>
                        )}

                        {sol.estado === 'APROBADA' && (
                          <View style={[styles.approvedNoticeRow, isMobile && { flexDirection: 'column', alignItems: 'stretch', gap: 10 }]}>
                            <View style={{ flex: 1 }}>
                              <Text style={styles.approvedNoticeTitle}>
                                ✓ ESTE ALUMNO FUE APROBADO Y AGREGADO A LA ESCUELA:
                              </Text>
                              <Text style={styles.approvedNoticeSchool}>
                                📍 {chosenAcademia?.nombre || 'Dojo Central Rancagua'} (Visible en ALUMNOS/ASIGNACION y módulo Alumnos)
                              </Text>
                            </View>

                            <View style={{ flexDirection: 'row', gap: 8 }}>
                              <TouchableOpacity
                                style={styles.btnWhatsAppSolicitud}
                                onPress={() => handleOpenWhatsAppSolicitud(sol.telefono_apoderado, `${sol.nombres} ${sol.apellidos}`, sol.nombre_apoderado)}
                                activeOpacity={0.85}
                              >
                                <Text style={styles.btnWhatsAppSolicitudText}>
                                  📲 CONTACTAR POR WHATSAPP
                                </Text>
                              </TouchableOpacity>

                              <TouchableOpacity
                                style={styles.btnDeleteSolicitud}
                                onPress={() => deleteSolicitudMatricula(sol.id)}
                                activeOpacity={0.85}
                              >
                                <Text style={styles.btnDeleteSolicitudText}>ELIMINAR REGISTRO</Text>
                              </TouchableOpacity>
                            </View>
                          </View>
                        )}
                      </View>
                    </View>
                  </View>
                );
              })}

            {solicitudesMatricula.filter((sol) => {
              if (filtroEstadoSol === 'PENDIENTE' && sol.estado !== 'PENDIENTE') return false;
              if (filtroEstadoSol === 'APROBADA' && sol.estado !== 'APROBADA') return false;
              if (busquedaSol.trim()) {
                const q = busquedaSol.toLowerCase();
                return `${sol.nombres} ${sol.apellidos}`.toLowerCase().includes(q) ||
                  (sol.rut && sol.rut.toLowerCase().includes(q)) ||
                  (sol.nombre_apoderado && sol.nombre_apoderado.toLowerCase().includes(q));
              }
              return true;
            }).length === 0 && (
              <View style={styles.emptySolicitudesCard}>
                <Text style={styles.emptySolicitudesTitle}>
                  ✓ NO HAY SOLICITUDES EN ESTA SECCIÓN
                </Text>
                <Text style={styles.emptySolicitudesDesc}>
                  {filtroEstadoSol === 'PENDIENTE'
                    ? 'No hay postulaciones de matrícula en espera de confirmación. Todas las fichas han sido procesadas.'
                    : 'No se encontraron solicitudes con el filtro seleccionado.'}
                </Text>
              </View>
            )}
          </View>
        </View>
      )}

      {/* SUB-PESTAÑA 4: ALUMNOS/ASIGNACION (TODOS LOS ALUMNOS DEL SISTEMA) */}
      {activeSubTab === 'traslados' && (
        <View style={styles.tabContent}>
          <View style={[styles.sectionHeaderBar, isMobile && { flexDirection: 'column', alignItems: 'stretch' }]}>
            <View>
              <Text style={styles.sectionTitle}>ALUMNOS / ASIGNACIÓN A ESCUELAS (TODOS LOS ALUMNOS)</Text>
              <Text style={styles.sectionDesc}>
                Listado centralizado de todos los alumnos registrados para asignar o trasladar de escuela/sede.
              </Text>
            </View>
            <View style={[styles.searchBox, isMobile && { width: '100%' }]}>
              <TextInput
                style={styles.searchInput}
                placeholder="Buscar alumno por nombre o RUT..."
                placeholderTextColor="#64748B"
                value={filtroAlumno}
                onChangeText={setFiltroAlumno}
              />
            </View>
          </View>

          {/* Filtro Rápido por Sede */}
          <View style={{ flexDirection: 'row', gap: 8, marginBottom: 14, flexWrap: 'wrap' }}>
            <TouchableOpacity
              style={[
                styles.schoolPill,
                filtroSedeTraslado === 'ALL' && styles.schoolPillActive,
              ]}
              onPress={() => setFiltroSedeTraslado('ALL')}
            >
              <Text
                style={[
                  styles.schoolPillText,
                  filtroSedeTraslado === 'ALL' && styles.schoolPillTextActive,
                ]}
              >
                TODOS LOS ALUMNOS ({students.length})
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.schoolPill,
                filtroSedeTraslado === 'SIN_ASIGNAR' && styles.schoolPillActive,
                students.filter((s) => !s.academia_id).length > 0 && { borderColor: colors.accent },
              ]}
              onPress={() => setFiltroSedeTraslado('SIN_ASIGNAR')}
            >
              <Text
                style={[
                  styles.schoolPillText,
                  filtroSedeTraslado === 'SIN_ASIGNAR' && styles.schoolPillTextActive,
                  students.filter((s) => !s.academia_id).length > 0 && { color: colors.accent, fontWeight: '900' },
                ]}
              >
                ⚠️ SIN ASIGNAR ({students.filter((s) => !s.academia_id).length})
              </Text>
            </TouchableOpacity>

            {academias.map((ac) => {
              const isSelectedSede = filtroSedeTraslado === ac.id;
              const countInSede = students.filter((s) => matchAcademia(s.academia_id, ac.id)).length;

              return (
                <TouchableOpacity
                  key={ac.id}
                  style={[
                    styles.schoolPill,
                    isSelectedSede && styles.schoolPillActive,
                  ]}
                  onPress={() => setFiltroSedeTraslado(ac.id)}
                >
                  <Text
                    style={[
                      styles.schoolPillText,
                      isSelectedSede && styles.schoolPillTextActive,
                    ]}
                  >
                    {ac.nombre.replace('Dojo Shito Ryu ', '')} ({countInSede})
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          {/* Vista Escritorio: Tabla */}
          {!isMobile ? (
            <View style={styles.tableCardSquare}>
              <View style={styles.tableHeaderRow}>
                <Text style={[styles.tableTh, { flex: 2 }]}>ALUMNO</Text>
                <Text style={[styles.tableTh, { flex: 1 }]}>RUT</Text>
                <Text style={[styles.tableTh, { flex: 1.5 }]}>SECCIÓN</Text>
                <Text style={[styles.tableTh, { flex: 2.5 }]}>ESCUELA / SEDE ASIGNADA</Text>
              </View>

              {students
                .filter((s) => {
                  const matchesText =
                    !filtroAlumno ||
                    `${s.nombres} ${s.apellidos}`.toLowerCase().includes(filtroAlumno.toLowerCase()) ||
                    (s.rut && s.rut.includes(filtroAlumno));
                  const matchesSede =
                    filtroSedeTraslado === 'ALL'
                      ? true
                      : filtroSedeTraslado === 'SIN_ASIGNAR'
                      ? !s.academia_id
                      : matchAcademia(s.academia_id, filtroSedeTraslado);
                  return matchesText && matchesSede;
                })
                .map((st) => {
                  return (
                    <View key={st.id} style={styles.tableRow}>
                      <View style={{ flex: 2 }}>
                        <Text style={styles.studentNameTh}>
                          {st.nombres} {st.apellidos}
                        </Text>
                        {!st.academia_id && (
                          <Text style={{ color: colors.accent, fontSize: 10, fontWeight: '900', marginTop: 2 }}>
                            ⚠️ SIN SEDE ASIGNADA
                          </Text>
                        )}
                      </View>
                      <Text style={[styles.tableTd, { flex: 1 }]}>{st.rut || 'Sin RUT'}</Text>
                      <Text style={[styles.tableTd, { flex: 1.5 }]}>
                        {st.seccion_id === 'sec-1'
                          ? 'Grupo I'
                          : st.seccion_id === 'sec-2'
                          ? 'Grupo II'
                          : st.seccion_id === 'sec-3'
                          ? 'Adolescentes'
                          : 'Jóvenes y Adultos'}
                      </Text>
                      <View style={{ flex: 2.5, flexDirection: 'row', gap: 6, flexWrap: 'wrap' }}>
                        {academias.map((ac) => {
                          const isAssigned = matchAcademia(st.academia_id, ac.id);
                          return (
                            <TouchableOpacity
                              key={ac.id}
                              style={[
                                styles.schoolPill,
                                isAssigned && styles.schoolPillActive,
                              ]}
                              onPress={() => reassignStudentAcademia(st.id, ac.id)}
                            >
                              <Text
                                style={[
                                  styles.schoolPillText,
                                  isAssigned && styles.schoolPillTextActive,
                                ]}
                              >
                                {isAssigned ? '✓ ' : ''}{ac.nombre.replace('Dojo Shito Ryu ', '')}
                              </Text>
                            </TouchableOpacity>
                          );
                        })}
                      </View>
                    </View>
                  );
                })}
            </View>
          ) : (
            /* Vista Celulares: Tarjetas Responsive de Traslado */
            <View style={{ gap: 10 }}>
              {students
                .filter((s) => {
                  const matchesText =
                    !filtroAlumno ||
                    `${s.nombres} ${s.apellidos}`.toLowerCase().includes(filtroAlumno.toLowerCase()) ||
                    (s.rut && s.rut.includes(filtroAlumno));
                  const matchesSede =
                    filtroSedeTraslado === 'ALL'
                      ? true
                      : filtroSedeTraslado === 'SIN_ASIGNAR'
                      ? !s.academia_id
                      : matchAcademia(s.academia_id, filtroSedeTraslado);
                  return matchesText && matchesSede;
                })
                .map((st) => {
                  return (
                    <View key={st.id} style={styles.mobileTrasladoCard}>
                      <View style={{ marginBottom: 10 }}>
                        <Text style={styles.studentNameTh}>
                          {st.nombres} {st.apellidos}
                        </Text>
                        {!st.academia_id && (
                          <Text style={{ color: colors.accent, fontSize: 11, fontWeight: '900', marginVertical: 2 }}>
                            ⚠️ SIN SEDE ASIGNADA (PENDIENTE ASIGNACIÓN)
                          </Text>
                        )}
                        <Text style={styles.tableTd}>
                          {st.rut || 'Sin RUT'} • {st.seccion_id === 'sec-1' ? 'Grupo I (4-6)' : st.seccion_id === 'sec-2' ? 'Grupo II (4-6)' : st.seccion_id === 'sec-3' ? 'Adolescentes' : 'Adultos'}
                        </Text>
                      </View>

                      <Text style={styles.mobileSedePrompt}>SEDE ASIGNADA (TOCA PARA ASIGNAR O CAMBIAR):</Text>
                      <View style={{ flexDirection: 'row', gap: 6, flexWrap: 'wrap' }}>
                        {academias.map((ac) => {
                          const isAssigned = matchAcademia(st.academia_id, ac.id);
                          return (
                            <TouchableOpacity
                              key={ac.id}
                              style={[
                                styles.schoolPill,
                                isAssigned && styles.schoolPillActive,
                              ]}
                              onPress={() => reassignStudentAcademia(st.id, ac.id)}
                            >
                              <Text
                                style={[
                                  styles.schoolPillText,
                                  isAssigned && styles.schoolPillTextActive,
                                ]}
                              >
                                {isAssigned ? '✓ ' : ''}{ac.nombre.replace('Dojo Shito Ryu ', '')}
                              </Text>
                            </TouchableOpacity>
                          );
                        })}
                      </View>
                    </View>
                  );
                })}
            </View>
          )}
        </View>
      )}

      {/* SUB-PESTAÑA 4: CATEGORÍAS WKF Y REGLAS AUTOMÁTICAS */}
      {activeSubTab === 'categorias' && (
        <View style={styles.tabContent}>
          <View style={[styles.sectionHeaderBar, isMobile && { flexDirection: 'column', alignItems: 'stretch' }]}>
            <View>
              <Text style={styles.sectionTitle}>MATRIZ DE CATEGORÍAS WKF Y REGLAS DE CLASIFICACIÓN</Text>
              <Text style={styles.sectionDesc}>
                Motor de avance y retroceso automático de divisiones según edad cronológica y pesaje corporal.
              </Text>
            </View>
            <TouchableOpacity
              style={styles.btnActionSquare}
              onPress={() => setShowAddCatModal(true)}
            >
              <Text style={styles.btnActionText}>+ NUEVA CATEGORÍA / REGLA</Text>
            </TouchableOpacity>
          </View>

          {/* Explicador de Reglas de Transición */}
          <View style={styles.ruleExplainCardSquare}>
            <View style={styles.ruleExplainRibbon}>
              <Text style={styles.ruleExplainRibbonText}>CÓMO FUNCIONA EL MOTOR DE CATEGORIZACIÓN AUTOMÁTICA</Text>
            </View>
            <View style={styles.ruleExplainBody}>
              <View style={[styles.ruleBoxSquare, isMobile && { minWidth: '100%' }]}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.ruleTitle}>TRANSICIÓN POR EDAD CRONOLÓGICA</Text>
                  <Text style={styles.ruleDesc}>
                    La edad se calcula en tiempo real con la fecha de nacimiento ingresada en la ficha. Al cumplir los años correspondientes a la división superior (12 para U14, 14 para Cadete, 16 para Junior, 18 para Senior), el sistema promueve al alumno sin intervención manual.
                  </Text>
                </View>
              </View>

              <View style={[styles.ruleBoxSquare, isMobile && { minWidth: '100%' }]}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.ruleTitle}>AVANCE Y RETROCESO POR PESAJE CORPORAL</Text>
                  <Text style={styles.ruleDesc}>
                    En Kumite, cada actualización del peso en la ficha del alumno o en el pesaje previo a torneos ubica automáticamente al atleta en su división de peso (ej. -52kg, -57kg, +70kg). Si el alumno rebaja su peso, retrocede de categoría de forma inmediata.
                  </Text>
                </View>
              </View>
            </View>
          </View>

          {/* Probador / Simulador en Tiempo Real */}
          <View style={styles.simulatorCardSquare}>
            <View style={styles.simulatorHeader}>
              <Text style={styles.simulatorTitle}>SIMULADOR Y PROBADOR DE REGLAS EN TIEMPO REAL</Text>
              <Text style={styles.simulatorSub}>
                Ingresa una fecha de nacimiento ficticia o real y un peso para verificar la asignación automática:
              </Text>
            </View>

            <View style={[styles.simulatorControlsRow, isMobile && { flexDirection: 'column' }]}>
              <View style={[styles.inputGroup, { flex: 1 }]}>
                <Text style={styles.inputLabel}>FECHA NACIMIENTO (AAAA-MM-DD)</Text>
                <TextInput
                  style={styles.textInputSquare}
                  value={simDob}
                  onChangeText={setSimDob}
                  placeholder="2011-04-18"
                  placeholderTextColor="#64748B"
                />
              </View>

              <View style={[styles.inputGroup, { flex: 1 }]}>
                <Text style={styles.inputLabel}>GÉNERO</Text>
                <View style={{ flexDirection: 'row', gap: 6 }}>
                  <TouchableOpacity
                    style={[styles.simGenBtn, simGenero === 'M' && styles.simGenBtnActive]}
                    onPress={() => setSimGenero('M')}
                  >
                    <Text style={[styles.simGenText, simGenero === 'M' && styles.simGenTextActive]}>MASCULINO</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.simGenBtn, simGenero === 'F' && styles.simGenBtnActive]}
                    onPress={() => setSimGenero('F')}
                  >
                    <Text style={[styles.simGenText, simGenero === 'F' && styles.simGenTextActive]}>FEMENINO</Text>
                  </TouchableOpacity>
                </View>
              </View>

              <View style={[styles.inputGroup, { flex: 1 }]}>
                <Text style={styles.inputLabel}>PESO CORPORAL (KG)</Text>
                <TextInput
                  style={styles.textInputSquare}
                  value={simPeso}
                  onChangeText={setSimPeso}
                  keyboardType="numeric"
                  placeholder="51.2"
                  placeholderTextColor="#64748B"
                />
              </View>
            </View>

            {/* Resultado de la simulación */}
            <View style={styles.simResultBoxSquare}>
              <View style={[styles.simResultItem, isMobile && { minWidth: '100%' }]}>
                <Text style={styles.simResultLabel}>EDAD CALCULADA:</Text>
                <Text style={styles.simResultValue}>{simEdad} años</Text>
              </View>

              <View style={[styles.simResultItem, isMobile && { minWidth: '100%' }]}>
                <Text style={styles.simResultLabel}>CATEGORÍA KUMITE:</Text>
                <Text style={[styles.simResultValue, { color: colors.primary }]}>
                  {simKumiteMatch ? simKumiteMatch.nombre_etiqueta : 'Sin categoría exacta (Fuera de rango WKF)'}
                </Text>
              </View>

              <View style={[styles.simResultItem, isMobile && { minWidth: '100%' }]}>
                <Text style={styles.simResultLabel}>CATEGORÍA KATA:</Text>
                <Text style={[styles.simResultValue, { color: colors.success }]}>
                  {simKataMatch ? simKataMatch.nombre_etiqueta : 'Sin categoría exacta'}
                </Text>
              </View>
            </View>
          </View>

          {/* Filtros de Categorías */}
          <View style={[styles.catFilterBar, isMobile && { flexDirection: 'column', alignItems: 'stretch' }]}>
            <View style={styles.catFilterPills}>
              {(['TODAS', 'KUMITE', 'KATA', 'CUSTOM'] as const).map((filtro) => {
                const count =
                  filtro === 'TODAS'
                    ? allCategories.length
                    : filtro === 'KUMITE'
                    ? CATEGORIAS_KUMITE.length
                    : filtro === 'KATA'
                    ? CATEGORIAS_KATA.length
                    : customCategories.length;

                const isAct = filtroModalidad === filtro;
                return (
                  <TouchableOpacity
                    key={filtro}
                    style={[styles.filterPillSquare, isAct && styles.filterPillSquareActive]}
                    onPress={() => setFiltroModalidad(filtro)}
                  >
                    <Text style={[styles.filterPillText, isAct && styles.filterPillTextActive]}>
                      {filtro === 'CUSTOM' ? 'PERSONALIZADAS' : filtro} ({count})
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            <View style={[styles.searchBox, isMobile && { width: '100%' }]}>
              <TextInput
                style={styles.searchInput}
                placeholder="Buscar por división, peso o etiqueta..."
                placeholderTextColor="#64748B"
                value={busquedaCat}
                onChangeText={setBusquedaCat}
              />
            </View>
          </View>

          {/* Tabla de Categorías Oficiales y Personalizadas */}
          {!isMobile ? (
            <View style={styles.tableCardSquare}>
              <View style={styles.tableHeaderRow}>
                <Text style={[styles.tableTh, { flex: 1.2 }]}>MODALIDAD</Text>
                <Text style={[styles.tableTh, { flex: 2 }]}>ETIQUETA OFICIAL</Text>
                <Text style={[styles.tableTh, { flex: 1.2 }]}>DIVISIÓN</Text>
                <Text style={[styles.tableTh, { flex: 0.8 }]}>GÉNERO</Text>
                <Text style={[styles.tableTh, { flex: 1.2 }]}>RANGO EDAD</Text>
                <Text style={[styles.tableTh, { flex: 1.5 }]}>RANGO PESO</Text>
                <Text style={[styles.tableTh, { flex: 1.5 }]}>ATLETAS APTOS</Text>
                <Text style={[styles.tableTh, { flex: 1 }]}>ACCIÓN</Text>
              </View>

              {allCategories
                .filter((c) => {
                  if (filtroModalidad === 'KUMITE' && c.modalidad !== 'KUMITE') return false;
                  if (filtroModalidad === 'KATA' && c.modalidad !== 'KATA') return false;
                  if (filtroModalidad === 'CUSTOM' && !c.id.startsWith('custom-cat-')) return false;
                  if (busquedaCat) {
                    const q = busquedaCat.toLowerCase();
                    return (
                      c.nombre_etiqueta.toLowerCase().includes(q) ||
                      c.division.toLowerCase().includes(q) ||
                      (c.peso_max_kg && `${c.peso_max_kg}`.includes(q))
                    );
                  }
                  return true;
                })
                .map((cat) => {
                  const isCustom = cat.id.startsWith('custom-cat-');

                  const atletasCalzan = students.filter((st) => {
                    if (!st.fecha_nacimiento) return false;
                    const edad = calcularEdad(st.fecha_nacimiento);
                    if (edad < cat.edad_min || edad > cat.edad_max) return false;
                    if (cat.genero !== 'X' && st.genero && st.genero !== cat.genero) return false;
                    if (cat.modalidad === 'KUMITE' && cat.peso_max_kg !== undefined) {
                      const peso = st.peso_actual_kg || 0;
                      if (peso < (cat.peso_min_kg ?? 0) || peso > (cat.peso_max_kg ?? 999)) return false;
                    }
                    return true;
                  }).length;

                  return (
                    <View key={cat.id} style={styles.tableRow}>
                      <View style={{ flex: 1.2 }}>
                        <View
                          style={[
                            styles.modBadge,
                            cat.modalidad === 'KUMITE' ? styles.badgeKumite : styles.badgeKata,
                          ]}
                        >
                          <Text style={styles.modBadgeText}>{cat.modalidad}</Text>
                        </View>
                      </View>

                      <View style={{ flex: 2 }}>
                        <Text style={styles.catEtiquetaText}>{cat.nombre_etiqueta}</Text>
                        {isCustom && <Text style={styles.customBadgeNotice}>REGLA PERSONALIZADA</Text>}
                      </View>

                      <Text style={[styles.tableTd, { flex: 1.2, fontWeight: '700' }]}>{cat.division}</Text>
                      <Text style={[styles.tableTd, { flex: 0.8 }]}>
                        {cat.genero === 'M' ? 'Masc' : cat.genero === 'F' ? 'Fem' : 'Mixto'}
                      </Text>
                      <Text style={[styles.tableTd, { flex: 1.2 }]}>
                        {cat.edad_min} a {cat.edad_max === 99 ? '18+' : `${cat.edad_max}`} años
                      </Text>
                      <Text style={[styles.tableTd, { flex: 1.5 }]}>
                        {cat.modalidad === 'KUMITE'
                          ? `${cat.peso_min_kg ?? 0} a ${cat.peso_max_kg === 999 ? '+70' : cat.peso_max_kg} kg`
                          : 'Sin límite (Kata)'}
                      </Text>

                      <View style={{ flex: 1.5 }}>
                        <View
                          style={[
                            styles.atletasAptosBadge,
                            atletasCalzan > 0 ? styles.atletasAptosActive : styles.atletasAptosEmpty,
                          ]}
                        >
                          <Text style={styles.atletasAptosText}>
                            {atletasCalzan} {atletasCalzan === 1 ? 'atleta' : 'atletas'}
                          </Text>
                        </View>
                      </View>

                      <View style={{ flex: 1 }}>
                        {isCustom ? (
                          <TouchableOpacity
                            style={styles.deleteCatBtnSquare}
                            onPress={() => deleteCustomCategory(cat.id)}
                          >
                            <Text style={styles.deleteCatBtnText}>BORRAR</Text>
                          </TouchableOpacity>
                        ) : (
                          <Text style={styles.standardCatLabel}>WKF Oficial</Text>
                        )}
                      </View>
                    </View>
                  );
                })}
            </View>
          ) : (
            /* Vista Móvil: Cards de Categorías */
            <View style={{ gap: 10 }}>
              {allCategories
                .filter((c) => {
                  if (filtroModalidad === 'KUMITE' && c.modalidad !== 'KUMITE') return false;
                  if (filtroModalidad === 'KATA' && c.modalidad !== 'KATA') return false;
                  if (filtroModalidad === 'CUSTOM' && !c.id.startsWith('custom-cat-')) return false;
                  if (busquedaCat) {
                    const q = busquedaCat.toLowerCase();
                    return (
                      c.nombre_etiqueta.toLowerCase().includes(q) ||
                      c.division.toLowerCase().includes(q) ||
                      (c.peso_max_kg && `${c.peso_max_kg}`.includes(q))
                    );
                  }
                  return true;
                })
                .map((cat) => {
                  const isCustom = cat.id.startsWith('custom-cat-');
                  const atletasCalzan = students.filter((st) => {
                    if (!st.fecha_nacimiento) return false;
                    const edad = calcularEdad(st.fecha_nacimiento);
                    if (edad < cat.edad_min || edad > cat.edad_max) return false;
                    if (cat.genero !== 'X' && st.genero && st.genero !== cat.genero) return false;
                    if (cat.modalidad === 'KUMITE' && cat.peso_max_kg !== undefined) {
                      const peso = st.peso_actual_kg || 0;
                      if (peso < (cat.peso_min_kg ?? 0) || peso > (cat.peso_max_kg ?? 999)) return false;
                    }
                    return true;
                  }).length;

                  return (
                    <View key={cat.id} style={styles.mobileCategoryCard}>
                      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                        <View
                          style={[
                            styles.modBadge,
                            cat.modalidad === 'KUMITE' ? styles.badgeKumite : styles.badgeKata,
                          ]}
                        >
                          <Text style={styles.modBadgeText}>{cat.modalidad}</Text>
                        </View>
                        <Text style={{ color: colors.accent, fontSize: 11, fontWeight: '800' }}>
                          {cat.division} • {cat.genero === 'M' ? 'MASC' : cat.genero === 'F' ? 'FEM' : 'MIXTO'}
                        </Text>
                      </View>

                      <Text style={styles.catEtiquetaText}>{cat.nombre_etiqueta}</Text>
                      <Text style={[styles.tableTd, { marginTop: 4 }]}>
                        {cat.edad_min} a {cat.edad_max === 99 ? '18+' : `${cat.edad_max}`} años • {cat.modalidad === 'KUMITE' ? `${cat.peso_min_kg ?? 0} a ${cat.peso_max_kg === 999 ? '+70' : cat.peso_max_kg} kg` : 'Sin límite'}
                      </Text>

                      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 10, paddingTop: 8, borderTopWidth: 1, borderColor: colors.border }}>
                        <View
                          style={[
                            styles.atletasAptosBadge,
                            atletasCalzan > 0 ? styles.atletasAptosActive : styles.atletasAptosEmpty,
                          ]}
                        >
                          <Text style={styles.atletasAptosText}>
                            {atletasCalzan} {atletasCalzan === 1 ? 'atleta apto' : 'atletas aptos'}
                          </Text>
                        </View>

                        {isCustom && (
                          <TouchableOpacity
                            style={styles.deleteCatBtnSquare}
                            onPress={() => deleteCustomCategory(cat.id)}
                          >
                            <Text style={styles.deleteCatBtnText}>BORRAR</Text>
                          </TouchableOpacity>
                        )}
                      </View>
                    </View>
                  );
                })}
            </View>
          )}
        </View>
      )}

      {/* MODAL: CREAR SEDE */}
      <Modal visible={showAddSedeModal} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={[styles.modalBoxSquare, isMobile && { width: '96%' }]}>
            <View style={styles.modalHeaderRibbon}>
              <Text style={styles.modalRibbonText}>NUEVA SEDE / ESCUELA AFILIADA</Text>
            </View>
            <View style={styles.modalBody}>
              <Text style={styles.modalTitle}>REGISTRAR NUEVA ESCUELA EN EL SISTEMA</Text>
              <Text style={styles.modalDesc}>
                Al crear la escuela, quedará disponible para asignar profesores, alumnos y clases.
              </Text>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>NOMBRE DE LA SEDE / ACADEMIA *</Text>
                <TextInput
                  style={styles.textInputSquare}
                  placeholder="Ej: Sede Machalí — Gimnasio Polideportivo"
                  placeholderTextColor="#64748B"
                  value={sedeNombre}
                  onChangeText={setSedeNombre}
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>DIRECCIÓN DE ENTRENAMIENTO</Text>
                <TextInput
                  style={styles.textInputSquare}
                  placeholder="Ej: Av. San Juan #450, Machalí"
                  placeholderTextColor="#64748B"
                  value={sedeDireccion}
                  onChangeText={setSedeDireccion}
                />
              </View>

              <View style={[styles.inputRow, isMobile && { flexDirection: 'column', gap: 0 }]}>
                <View style={[styles.inputGroup, { flex: 1 }]}>
                  <Text style={styles.inputLabel}>TELÉFONO DE CONTACTO</Text>
                  <TextInput
                    style={styles.textInputSquare}
                    value={sedeTelefono}
                    onChangeText={setSedeTelefono}
                  />
                </View>
                <View style={[styles.inputGroup, { flex: 1 }]}>
                  <Text style={styles.inputLabel}>EMAIL DE LA SEDE</Text>
                  <TextInput
                    style={styles.textInputSquare}
                    placeholder="contacto@dojo.cl"
                    placeholderTextColor="#64748B"
                    value={sedeEmail}
                    onChangeText={setSedeEmail}
                  />
                </View>
              </View>

              <View style={styles.modalActions}>
                <TouchableOpacity
                  style={styles.cancelBtnSquare}
                  onPress={() => setShowAddSedeModal(false)}
                >
                  <Text style={styles.cancelBtnText}>CANCELAR</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.saveBtnSquare}
                  onPress={handleCreateSede}
                >
                  <Text style={styles.saveBtnText}>GUARDAR ESCUELA</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </View>
      </Modal>

      {/* MODAL: CREAR PROFESOR */}
      <Modal visible={showAddUserModal} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={[styles.modalBoxSquare, isMobile && { width: '96%' }]}>
            <View style={styles.modalHeaderRibbon}>
              <Text style={styles.modalRibbonText}>NUEVO PROFESOR / INSTRUCTOR</Text>
            </View>
            <View style={styles.modalBody}>
              <Text style={styles.modalTitle}>ALTA DE PROFESOR O INSTRUCTOR</Text>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>NOMBRE COMPLETO *</Text>
                <TextInput
                  style={styles.textInputSquare}
                  placeholder="Ej: Sensei Carlos Valenzuela"
                  placeholderTextColor="#64748B"
                  value={userNombre}
                  onChangeText={setUserNombre}
                />
              </View>

              <View style={[styles.inputRow, isMobile && { flexDirection: 'column', gap: 0 }]}>
                <View style={[styles.inputGroup, { flex: 1 }]}>
                  <Text style={styles.inputLabel}>CORREO ELECTRÓNICO *</Text>
                  <TextInput
                    style={styles.textInputSquare}
                    placeholder="carlos@karate.cl"
                    placeholderTextColor="#64748B"
                    value={userEmail}
                    onChangeText={setUserEmail}
                  />
                </View>
                <View style={[styles.inputGroup, { flex: 1 }]}>
                  <Text style={styles.inputLabel}>TELÉFONO WHATSAPP</Text>
                  <TextInput
                    style={styles.textInputSquare}
                    value={userTelefono}
                    onChangeText={setUserTelefono}
                  />
                </View>
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>ROL / CARGO TÉCNICO</Text>
                <View style={{ flexDirection: 'row', gap: 10 }}>
                  <TouchableOpacity
                    style={[
                      styles.roleSelectBtn,
                      userRol === 'SENSEI' && styles.roleSelectBtnActive,
                    ]}
                    onPress={() => setUserRol('SENSEI')}
                  >
                    <Text
                      style={[
                        styles.roleSelectText,
                        userRol === 'SENSEI' && styles.roleSelectTextActive,
                      ]}
                    >
                      SENSEI (Titular)
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[
                      styles.roleSelectBtn,
                      userRol === 'INSTRUCTOR' && styles.roleSelectBtnActive,
                    ]}
                    onPress={() => setUserRol('INSTRUCTOR')}
                  >
                    <Text
                      style={[
                        styles.roleSelectText,
                        userRol === 'INSTRUCTOR' && styles.roleSelectTextActive,
                      ]}
                    >
                      INSTRUCTOR (Auxiliar)
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>

              <View style={styles.modalActions}>
                <TouchableOpacity
                  style={styles.cancelBtnSquare}
                  onPress={() => setShowAddUserModal(false)}
                >
                  <Text style={styles.cancelBtnText}>CANCELAR</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.saveBtnSquare}
                  onPress={handleCreateUser}
                >
                  <Text style={styles.saveBtnText}>REGISTRAR PROFESOR</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </View>
      </Modal>

      {/* MODAL: CREAR CATEGORÍA PERSONALIZADA */}
      <Modal visible={showAddCatModal} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={[styles.modalBoxSquare, isMobile && { width: '96%' }]}>
            <View style={styles.modalHeaderRibbon}>
              <Text style={styles.modalRibbonText}>NUEVA REGLA DE CATEGORÍA DEPORTIVA</Text>
            </View>
            <View style={styles.modalBody}>
              <Text style={styles.modalTitle}>CONFIGURAR NUEVA CATEGORÍA</Text>
              <Text style={styles.modalDesc}>
                Define los criterios de edad, modalidad y peso. Los alumnos se asociarán automáticamente según coincidan sus datos.
              </Text>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>NOMBRE / ETIQUETA DE LA CATEGORÍA *</Text>
                <TextInput
                  style={styles.textInputSquare}
                  placeholder="Ej: Cadete Novicios -52kg / Open Infantil"
                  placeholderTextColor="#64748B"
                  value={catNombre}
                  onChangeText={setCatNombre}
                />
              </View>

              <View style={[styles.inputRow, isMobile && { flexDirection: 'column', gap: 0 }]}>
                <View style={[styles.inputGroup, { flex: 1 }]}>
                  <Text style={styles.inputLabel}>MODALIDAD</Text>
                  <View style={{ flexDirection: 'row', gap: 6 }}>
                    <TouchableOpacity
                      style={[styles.simGenBtn, catModalidad === 'KUMITE' && styles.simGenBtnActive]}
                      onPress={() => setCatModalidad('KUMITE')}
                    >
                      <Text style={[styles.simGenText, catModalidad === 'KUMITE' && styles.simGenTextActive]}>
                        KUMITE
                      </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[styles.simGenBtn, catModalidad === 'KATA' && styles.simGenBtnActive]}
                      onPress={() => setCatModalidad('KATA')}
                    >
                      <Text style={[styles.simGenText, catModalidad === 'KATA' && styles.simGenTextActive]}>
                        KATA
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>

                <View style={[styles.inputGroup, { flex: 1 }]}>
                  <Text style={styles.inputLabel}>GÉNERO</Text>
                  <View style={{ flexDirection: 'row', gap: 6 }}>
                    {(['M', 'F', 'X'] as const).map((g) => (
                      <TouchableOpacity
                        key={g}
                        style={[styles.simGenBtn, catGenero === g && styles.simGenBtnActive]}
                        onPress={() => setCatGenero(g)}
                      >
                        <Text style={[styles.simGenText, catGenero === g && styles.simGenTextActive]}>
                          {g === 'M' ? 'MASC' : g === 'F' ? 'FEM' : 'MIXTO'}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>DIVISIÓN / GRUPO ETARIO</Text>
                <TextInput
                  style={styles.textInputSquare}
                  placeholder="Ej: U12, U14, CADETE, JUNIOR, SENIOR, OPEN"
                  placeholderTextColor="#64748B"
                  value={catDivision}
                  onChangeText={setCatDivision}
                />
              </View>

              <View style={[styles.inputRow, isMobile && { flexDirection: 'column', gap: 0 }]}>
                <View style={[styles.inputGroup, { flex: 1 }]}>
                  <Text style={styles.inputLabel}>EDAD MÍNIMA (AÑOS)</Text>
                  <TextInput
                    style={styles.textInputSquare}
                    value={catEdadMin}
                    onChangeText={setCatEdadMin}
                    keyboardType="numeric"
                  />
                </View>

                <View style={[styles.inputGroup, { flex: 1 }]}>
                  <Text style={styles.inputLabel}>EDAD MÁXIMA (AÑOS)</Text>
                  <TextInput
                    style={styles.textInputSquare}
                    value={catEdadMax}
                    onChangeText={setCatEdadMax}
                    keyboardType="numeric"
                  />
                </View>
              </View>

              {catModalidad === 'KUMITE' && (
                <View style={[styles.inputRow, isMobile && { flexDirection: 'column', gap: 0 }]}>
                  <View style={[styles.inputGroup, { flex: 1 }]}>
                    <Text style={styles.inputLabel}>PESO MÍNIMO (KG)</Text>
                    <TextInput
                      style={styles.textInputSquare}
                      value={catPesoMin}
                      onChangeText={setCatPesoMin}
                      keyboardType="numeric"
                      placeholder="0"
                      placeholderTextColor="#64748B"
                    />
                  </View>

                  <View style={[styles.inputGroup, { flex: 1 }]}>
                    <Text style={styles.inputLabel}>PESO MÁXIMO (KG)</Text>
                    <TextInput
                      style={styles.textInputSquare}
                      value={catPesoMax}
                      onChangeText={setCatPesoMax}
                      keyboardType="numeric"
                      placeholder="52"
                      placeholderTextColor="#64748B"
                    />
                  </View>
                </View>
              )}

              <View style={styles.modalActions}>
                <TouchableOpacity
                  style={styles.cancelBtnSquare}
                  onPress={() => setShowAddCatModal(false)}
                >
                  <Text style={styles.cancelBtnText}>CANCELAR</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.saveBtnSquare}
                  onPress={handleCreateCategory}
                >
                  <Text style={styles.saveBtnText}>CREAR REGLA DE CATEGORÍA</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </View>
      </Modal>
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
    maxWidth: 1400,
    alignSelf: 'center',
    width: '100%',
  },
  headerSquare: {
    backgroundColor: colors.bgCard,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.xl,
    overflow: 'hidden',
    marginBottom: 24,
  },
  headerRibbon: {
    backgroundColor: colors.bgDark,
    paddingVertical: 6,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderColor: colors.border,
  },
  headerRibbonText: {
    color: colors.textSecondary,
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1.5,
  },
  headerBody: {
    padding: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 16,
  },
  title: {
    color: colors.textPrimary,
    fontSize: 20,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  subtitle: {
    color: colors.textSecondary,
    fontSize: 13,
    marginTop: 4,
  },
  roleBadgeContainer: {
    alignItems: 'flex-end',
  },
  roleBadgeLabel: {
    color: colors.textSecondary,
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1,
    marginBottom: 4,
  },
  roleBadgeSquare: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderRadius: radii.sm,
  },
  badgeDueno: {
    backgroundColor: 'rgba(245, 158, 11, 0.15)',
    borderColor: colors.accent,
  },
  badgeProfe: {
    backgroundColor: 'rgba(255, 107, 0, 0.15)',
    borderColor: colors.primary,
  },
  roleBadgeText: {
    color: colors.textPrimary,
    fontSize: 11,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  tabsContainer: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.bgDark,
  },
  subTab: {
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRightWidth: 1,
    borderColor: colors.border,
  },
  subTabActive: {
    backgroundColor: colors.bgCard,
    borderBottomWidth: 3,
    borderBottomColor: colors.primary,
  },
  subTabText: {
    color: colors.textSecondary,
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  subTabTextActive: {
    color: colors.textPrimary,
  },
  tabContent: {
    gap: 20,
  },
  sectionHeaderBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 16,
    marginBottom: 10,
  },
  sectionTitle: {
    color: colors.textPrimary,
    fontSize: 16,
    fontWeight: '800',
  },
  sectionDesc: {
    color: colors.textSecondary,
    fontSize: 13,
    marginTop: 2,
  },
  btnActionSquare: {
    backgroundColor: colors.primary,
    paddingVertical: 10,
    paddingHorizontal: 18,
    borderRadius: radii.md,
  },
  btnActionText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  cardsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 20,
  },
  academiaCardSquare: {
    flex: 1,
    minWidth: 340,
    backgroundColor: colors.bgCard,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.lg,
    overflow: 'hidden',
  },
  cardHeaderRibbon: {
    backgroundColor: colors.bgDark,
    paddingVertical: 6,
    paddingHorizontal: 14,
    borderBottomWidth: 1,
    borderColor: colors.border,
  },
  cardHeaderRibbonText: {
    color: colors.primary,
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1,
  },
  cardBody: {
    padding: 20,
  },
  cardTitle: {
    color: colors.textPrimary,
    fontSize: 18,
    fontWeight: '900',
    marginBottom: 14,
  },
  cardDetailRow: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  cardDetailLabel: {
    color: colors.textSecondary,
    fontSize: 12,
    fontWeight: '700',
    width: 90,
  },
  cardDetailValue: {
    color: colors.textPrimary,
    fontSize: 12,
    flex: 1,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 18,
    paddingTop: 16,
    borderTopWidth: 1,
    borderColor: colors.border,
  },
  statBox: {
    flex: 1,
    backgroundColor: colors.bgDark,
    padding: 12,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.md,
  },
  statBoxNumber: {
    color: colors.textPrimary,
    fontSize: 20,
    fontWeight: '900',
  },
  statBoxLabel: {
    color: colors.textSecondary,
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 0.5,
    marginTop: 2,
  },
  deleteSedeBtnSquare: {
    marginTop: 14,
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    borderWidth: 1,
    borderColor: colors.danger,
    borderRadius: radii.md,
    paddingVertical: 8,
    alignItems: 'center',
  },
  deleteSedeBtnText: {
    color: colors.danger,
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  infoNoticeSquare: {
    backgroundColor: colors.bgCard,
    borderWidth: 1,
    borderColor: colors.primary,
    borderRadius: radii.lg,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  infoNoticeIcon: {
    fontSize: 24,
  },
  infoNoticeTitle: {
    color: colors.primary,
    fontSize: 13,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  infoNoticeDesc: {
    color: colors.textSecondary,
    fontSize: 12,
    marginTop: 2,
  },
  usersList: {
    gap: 16,
  },
  userCardSquare: {
    backgroundColor: colors.bgCard,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.lg,
    padding: 20,
  },
  userCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  userInfoBox: {},
  userFullName: {
    color: colors.textPrimary,
    fontSize: 17,
    fontWeight: '900',
  },
  userEmail: {
    color: colors.textSecondary,
    fontSize: 12,
    marginTop: 2,
  },
  userBadge: {
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: radii.sm,
    borderWidth: 1,
  },
  userBadgeText: {
    color: colors.textPrimary,
    fontSize: 10,
    fontWeight: '800',
  },
  assignmentBlock: {
    backgroundColor: colors.bgDark,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.md,
  },
  assignmentTitle: {
    color: colors.textSecondary,
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1,
    marginBottom: 12,
  },
  academiasChecksGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  checkOptionSquare: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 10,
    paddingHorizontal: 14,
    backgroundColor: colors.bgCard,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.md,
    minWidth: 260,
  },
  checkOptionSquareActive: {
    borderColor: colors.success,
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
  },
  checkboxSquare: {
    width: 20,
    height: 20,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.bgDark,
    borderRadius: radii.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxSquareChecked: {
    backgroundColor: colors.success,
    borderColor: colors.success,
  },
  checkboxCheck: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '900',
  },
  checkOptionName: {
    color: colors.textSecondary,
    fontSize: 12,
    fontWeight: '700',
  },
  checkOptionNameActive: {
    color: colors.textPrimary,
  },
  checkOptionSub: {
    color: colors.textSecondary,
    fontSize: 10,
  },
  searchBox: {
    width: 280,
  },
  searchInput: {
    backgroundColor: colors.bgDark,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.md,
    paddingVertical: 8,
    paddingHorizontal: 12,
    color: colors.textPrimary,
    fontSize: 12,
  },
  tableCardSquare: {
    backgroundColor: colors.bgCard,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.lg,
    overflow: 'hidden',
  },
  tableHeaderRow: {
    flexDirection: 'row',
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: colors.bgDark,
    borderBottomWidth: 1,
    borderColor: colors.border,
  },
  tableTh: {
    color: colors.textSecondary,
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  tableRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderColor: colors.border,
  },
  studentNameTh: {
    color: colors.textPrimary,
    fontSize: 13,
    fontWeight: '700',
  },
  tableTd: {
    color: colors.textSecondary,
    fontSize: 12,
  },
  mobileTrasladoCard: {
    backgroundColor: colors.bgCard,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.lg,
    padding: 14,
  },
  mobileSedePrompt: {
    color: colors.accent,
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.5,
    marginBottom: 8,
  },
  schoolPill: {
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.bgDark,
    borderRadius: radii.sm,
  },
  schoolPillActive: {
    borderColor: colors.primary,
    backgroundColor: 'rgba(255, 107, 0, 0.15)',
  },
  schoolPillText: {
    color: colors.textSecondary,
    fontSize: 11,
    fontWeight: '700',
  },
  schoolPillTextActive: {
    color: colors.primary,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.85)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalBoxSquare: {
    width: '100%',
    maxWidth: 580,
    backgroundColor: colors.bgCard,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.xl,
    overflow: 'hidden',
  },
  modalHeaderRibbon: {
    backgroundColor: colors.primary,
    paddingVertical: 6,
    paddingHorizontal: 16,
  },
  modalRibbonText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 1,
  },
  modalBody: {
    padding: 24,
  },
  modalTitle: {
    color: colors.textPrimary,
    fontSize: 18,
    fontWeight: '900',
  },
  modalDesc: {
    color: colors.textSecondary,
    fontSize: 13,
    marginTop: 4,
    marginBottom: 20,
  },
  inputGroup: {
    marginBottom: 16,
  },
  inputRow: {
    flexDirection: 'row',
    gap: 16,
  },
  inputLabel: {
    color: colors.textSecondary,
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1,
    marginBottom: 6,
  },
  textInputSquare: {
    backgroundColor: colors.bgDark,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.md,
    paddingVertical: 10,
    paddingHorizontal: 12,
    color: colors.textPrimary,
    fontSize: 13,
  },
  roleSelectBtn: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 12,
    backgroundColor: colors.bgDark,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.md,
    alignItems: 'center',
  },
  roleSelectBtnActive: {
    borderColor: colors.primary,
    backgroundColor: 'rgba(255, 107, 0, 0.15)',
  },
  roleSelectText: {
    color: colors.textSecondary,
    fontSize: 11,
    fontWeight: '800',
  },
  roleSelectTextActive: {
    color: colors.primary,
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 12,
    marginTop: 20,
    paddingTop: 16,
    borderTopWidth: 1,
    borderColor: colors.border,
  },
  cancelBtnSquare: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.md,
  },
  cancelBtnText: {
    color: colors.textSecondary,
    fontSize: 12,
    fontWeight: '800',
  },
  saveBtnSquare: {
    backgroundColor: colors.primary,
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: radii.md,
  },
  saveBtnText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '900',
  },
  // Estilos de Reglas y Categorías WKF
  ruleExplainCardSquare: {
    backgroundColor: colors.bgCard,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.lg,
    overflow: 'hidden',
    marginBottom: 16,
  },
  ruleExplainRibbon: {
    backgroundColor: colors.bgDark,
    paddingVertical: 6,
    paddingHorizontal: 14,
    borderBottomWidth: 1,
    borderColor: colors.border,
  },
  ruleExplainRibbonText: {
    color: colors.primary,
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 1,
  },
  ruleExplainBody: {
    padding: 16,
    flexDirection: 'row',
    gap: 16,
    flexWrap: 'wrap',
  },
  ruleBoxSquare: {
    flex: 1,
    minWidth: 300,
    backgroundColor: colors.bgDark,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.md,
    padding: 14,
    flexDirection: 'row',
    gap: 12,
  },
  ruleIcon: {
    fontSize: 22,
  },
  ruleTitle: {
    color: colors.textPrimary,
    fontSize: 12,
    fontWeight: '900',
    marginBottom: 4,
    letterSpacing: 0.5,
  },
  ruleDesc: {
    color: colors.textSecondary,
    fontSize: 11,
    lineHeight: 16,
  },
  simulatorCardSquare: {
    backgroundColor: colors.bgCard,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.lg,
    padding: 18,
    marginBottom: 16,
  },
  simulatorHeader: {
    marginBottom: 14,
  },
  simulatorTitle: {
    color: colors.accent,
    fontSize: 13,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  simulatorSub: {
    color: colors.textSecondary,
    fontSize: 11,
    marginTop: 2,
  },
  simulatorControlsRow: {
    flexDirection: 'row',
    gap: 16,
    flexWrap: 'wrap',
  },
  simGenBtn: {
    flex: 1,
    paddingVertical: 10,
    backgroundColor: colors.bgDark,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.md,
    alignItems: 'center',
  },
  simGenBtnActive: {
    borderColor: colors.primary,
    backgroundColor: 'rgba(255, 107, 0, 0.15)',
  },
  simGenText: {
    color: colors.textSecondary,
    fontSize: 10,
    fontWeight: '800',
  },
  simGenTextActive: {
    color: colors.primary,
  },
  simResultBoxSquare: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
  },
  simResultItem: {
    flex: 1,
    minWidth: 200,
    backgroundColor: colors.bgDark,
    padding: 10,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.md,
  },
  simResultLabel: {
    color: colors.textSecondary,
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 0.8,
    marginBottom: 2,
  },
  simResultValue: {
    color: colors.textPrimary,
    fontSize: 12,
    fontWeight: '900',
  },
  catFilterBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 12,
  },
  catFilterPills: {
    flexDirection: 'row',
    gap: 8,
    flexWrap: 'wrap',
  },
  filterPillSquare: {
    paddingVertical: 7,
    paddingHorizontal: 12,
    backgroundColor: colors.bgDark,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.sm,
  },
  filterPillSquareActive: {
    backgroundColor: colors.bgCard,
    borderColor: colors.primary,
    borderBottomWidth: 2,
    borderBottomColor: colors.primary,
  },
  filterPillText: {
    color: colors.textSecondary,
    fontSize: 11,
    fontWeight: '800',
  },
  filterPillTextActive: {
    color: colors.textPrimary,
  },
  modBadge: {
    alignSelf: 'flex-start',
    paddingVertical: 3,
    paddingHorizontal: 6,
    borderRadius: radii.sm,
    borderWidth: 1,
  },
  badgeKumite: {
    backgroundColor: 'rgba(255, 107, 0, 0.15)',
    borderColor: colors.primary,
  },
  badgeKata: {
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
    borderColor: colors.success,
  },
  modBadgeText: {
    color: colors.textPrimary,
    fontSize: 9,
    fontWeight: '900',
  },
  catEtiquetaText: {
    color: colors.textPrimary,
    fontSize: 12,
    fontWeight: '800',
  },
  customBadgeNotice: {
    color: colors.accent,
    fontSize: 9,
    fontWeight: '800',
    marginTop: 2,
  },
  atletasAptosBadge: {
    paddingVertical: 3,
    paddingHorizontal: 8,
    borderWidth: 1,
    borderRadius: radii.sm,
    alignSelf: 'flex-start',
  },
  atletasAptosActive: {
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
    borderColor: colors.success,
  },
  atletasAptosEmpty: {
    backgroundColor: colors.bgDark,
    borderColor: colors.border,
  },
  atletasAptosText: {
    color: colors.textPrimary,
    fontSize: 10,
    fontWeight: '800',
  },
  deleteCatBtnSquare: {
    backgroundColor: 'rgba(239, 68, 68, 0.15)',
    borderWidth: 1,
    borderColor: colors.danger,
    borderRadius: radii.sm,
    paddingVertical: 4,
    paddingHorizontal: 8,
    alignItems: 'center',
  },
  deleteCatBtnText: {
    color: colors.danger,
    fontSize: 9,
    fontWeight: '900',
  },
  standardCatLabel: {
    color: colors.textSecondary,
    fontSize: 10,
    fontWeight: '700',
  },
  mobileCategoryCard: {
    backgroundColor: colors.bgCard,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 0,
    padding: 14,
  },
  toastBanner: {
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
    borderLeftWidth: 4,
    borderLeftColor: colors.success,
    padding: 12,
    marginBottom: 14,
  },
  toastBannerText: {
    color: colors.success,
    fontSize: 12,
    fontWeight: '800',
  },
  tabBadgePulse: {
    backgroundColor: colors.primary,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 0,
  },
  tabBadgePulseText: {
    color: '#FFFFFF',
    fontSize: 9,
    fontWeight: '900',
  },
  solicitudCard: {
    backgroundColor: colors.bgCard,
    borderWidth: 1,
    borderColor: colors.borderLight,
    borderRadius: 0,
    overflow: 'hidden',
    width: '100%',
  },
  solicitudCardHeader: {
    backgroundColor: colors.bgSurface,
    paddingVertical: 10,
    paddingHorizontal: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: colors.borderSubtle,
    flexWrap: 'wrap',
    gap: 8,
  },
  solicitudIdText: {
    color: colors.primary,
    fontSize: 11,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  solicitudDateText: {
    color: colors.textDim,
    fontSize: 11,
  },
  solicitudStatusPill: {
    paddingVertical: 3,
    paddingHorizontal: 8,
    borderWidth: 1,
    borderRadius: 0,
  },
  statusPillPending: {
    backgroundColor: 'rgba(255, 107, 0, 0.12)',
    borderColor: colors.primary,
  },
  statusPillApproved: {
    backgroundColor: 'rgba(16, 185, 129, 0.12)',
    borderColor: colors.success,
  },
  statusPillRejected: {
    backgroundColor: 'rgba(239, 68, 68, 0.12)',
    borderColor: colors.danger,
  },
  solicitudStatusPillText: {
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  solicitudCardBody: {
    padding: 16,
    gap: 16,
  },
  solicitudTwoCols: {
    flexDirection: 'row',
    gap: 16,
  },
  solicitudCol: {
    flex: 1,
    gap: 8,
  },
  solicitudSectionLabel: {
    color: colors.accent,
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 0.8,
  },
  solicitudStudentName: {
    color: colors.textPrimary,
    fontSize: 16,
    fontWeight: '900',
  },
  solicitudGuardianName: {
    color: colors.textPrimary,
    fontSize: 14,
    fontWeight: '800',
  },
  solicitudDataGrid: {
    gap: 4,
    marginTop: 2,
  },
  solicitudDataRow: {
    color: colors.textDim,
    fontSize: 11,
  },
  solicitudDataVal: {
    color: colors.textSecondary,
    fontWeight: '700',
  },
  beltColorSquare: {
    width: 12,
    height: 12,
    borderRadius: 0,
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  sedeSolicitadaBox: {
    backgroundColor: colors.bgInput,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
    padding: 10,
    marginTop: 8,
    gap: 4,
  },
  sedeSolicitadaLabel: {
    color: colors.textDim,
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  sedeSolicitadaVal: {
    color: colors.textPrimary,
    fontSize: 11,
    fontWeight: '700',
  },
  solicitudActionsBar: {
    borderTopWidth: 1,
    borderTopColor: colors.borderSubtle,
    paddingTop: 14,
  },
  assignSchoolRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    justifyContent: 'space-between',
  },
  assignSchoolLabel: {
    color: colors.textDim,
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 0.5,
    marginBottom: 6,
  },
  assignPillsWrap: {
    flexDirection: 'row',
    gap: 6,
    flexWrap: 'wrap',
  },
  assignPillBtn: {
    backgroundColor: colors.bgInput,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderRadius: 0,
  },
  assignPillBtnActive: {
    borderColor: colors.primary,
    backgroundColor: 'rgba(255, 107, 0, 0.15)',
  },
  assignPillText: {
    color: colors.textMuted,
    fontSize: 10,
    fontWeight: '700',
  },
  assignPillTextActive: {
    color: colors.primary,
    fontWeight: '900',
  },
  solicitudBtnGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flexWrap: 'wrap',
  },
  btnApproveSolicitud: {
    backgroundColor: colors.success,
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 0,
    alignItems: 'center',
  },
  btnApproveSolicitudText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  btnWhatsAppSolicitud: {
    backgroundColor: 'rgba(37, 211, 102, 0.15)',
    borderWidth: 1,
    borderColor: '#25D366',
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 0,
    alignItems: 'center',
  },
  btnWhatsAppSolicitudText: {
    color: '#25D366',
    fontSize: 10,
    fontWeight: '900',
  },
  btnRejectSolicitud: {
    backgroundColor: 'rgba(239, 68, 68, 0.15)',
    borderWidth: 1,
    borderColor: colors.danger,
    paddingVertical: 10,
    paddingHorizontal: 10,
    borderRadius: 0,
    alignItems: 'center',
  },
  btnRejectSolicitudText: {
    color: colors.danger,
    fontSize: 10,
    fontWeight: '800',
  },
  approvedNoticeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: 'rgba(16, 185, 129, 0.08)',
    borderWidth: 1,
    borderColor: colors.successBorder,
    padding: 12,
  },
  approvedNoticeTitle: {
    color: colors.success,
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  approvedNoticeSchool: {
    color: colors.textPrimary,
    fontSize: 12,
    fontWeight: '800',
    marginTop: 2,
  },
  btnDeleteSolicitud: {
    backgroundColor: colors.bgDark,
    borderWidth: 1,
    borderColor: colors.borderLight,
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderRadius: 0,
    alignItems: 'center',
  },
  btnDeleteSolicitudText: {
    color: colors.textDim,
    fontSize: 9,
    fontWeight: '800',
  },
  emptySolicitudesCard: {
    backgroundColor: colors.bgCard,
    borderWidth: 1,
    borderColor: colors.borderLight,
    borderRadius: 0,
    padding: 30,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  emptySolicitudesTitle: {
    color: colors.success,
    fontSize: 13,
    fontWeight: '900',
  },
  emptySolicitudesDesc: {
    color: colors.textDim,
    fontSize: 11,
    textAlign: 'center',
    maxWidth: 480,
  },
});
