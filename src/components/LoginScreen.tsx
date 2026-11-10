import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  TextInput,
} from 'react-native';
import { useDojoStore } from '../store/dojoStore';
import { colors, useResponsive } from '../theme/theme';

export const LoginScreen: React.FC = () => {
  const users = useDojoStore((state) => state.users);
  const academias = useDojoStore((state) => state.academias);
  const loginAsUser = useDojoStore((state) => state.loginAsUser);
  const setTab = useDojoStore((state) => state.setTab);
  const { isMobile } = useResponsive();

  // Campos de fachada para autenticación
  const [identificador, setIdentificador] = useState('admin@dojoshitoryu.cl');
  const [password, setPassword] = useState('••••••••••••');
  const [selectedAcademiaId, setSelectedAcademiaId] = useState<string>(
    academias[0]?.id || ''
  );
  const [errorMsg, setErrorMsg] = useState('');

  const handleLogin = () => {
    if (!identificador.trim()) {
      setErrorMsg('Por favor ingresa tu RUT o correo autorizado.');
      return;
    }
    setErrorMsg('');

    // Usuario administrador por defecto para la fachada
    const adminUser = users.find((u) => u.rol === 'ADMIN_GENERAL') || users[0];
    const targetAcadId = selectedAcademiaId || academias[0]?.id || '';

    loginAsUser(adminUser ? adminUser.id : 'usr-1', targetAcadId);
  };

  const handleOpenPublicForm = () => {
    const adminUser = users.find((u) => u.rol === 'ADMIN_GENERAL') || users[0];
    const targetAcadId = selectedAcademiaId || academias[0]?.id || '';
    loginAsUser(adminUser ? adminUser.id : 'usr-1', targetAcadId);
    setTab('registro_publico');
  };

  return (
    <ScrollView
      contentContainerStyle={[
        styles.container,
        isMobile && { padding: 12 },
      ]}
    >
      <View style={[styles.card, isMobile && { maxWidth: '100%' }]}>
        {/* Barra superior oficial */}
        <View style={styles.topHeaderRibbon}>
          <Text style={styles.ribbonText}>
            DOJOSTRIKE OS • SHITO RYU KYOKAN GENBUKAI
          </Text>
        </View>

        {/* Encabezado y Marca */}
        <View style={styles.headerBody}>
          <View style={styles.brandRow}>
            <View style={styles.logoSquare}>
              <Text style={styles.logoSquareText}>SR</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.title}>PORTAL DE ACCESO AL DOJO</Text>
              <Text style={styles.subtitle}>
                Panel Administrativo, Control de Nóminas y Planificación Técnica
              </Text>
            </View>
          </View>
        </View>

        {errorMsg ? (
          <View style={styles.errorBox}>
            <Text style={styles.errorText}>{errorMsg}</Text>
          </View>
        ) : null}

        {/* Formulario de Fachada de Credenciales */}
        <View style={styles.sectionBlock}>
          <Text style={styles.sectionTitle}>1. CREDENCIALES DE ACCESO:</Text>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>RUT O CORREO INSTITUCIONAL</Text>
            <TextInput
              style={styles.textInput}
              value={identificador}
              onChangeText={setIdentificador}
              placeholder="Ej: 14.285.923-1 o admin@dojoshitoryu.cl"
              placeholderTextColor={colors.textDim}
              autoCapitalize="none"
            />
          </View>

          <View style={[styles.inputGroup, { marginTop: 12 }]}>
            <Text style={styles.inputLabel}>CONTRASEÑA DE SEGURIDAD</Text>
            <TextInput
              style={styles.textInput}
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              placeholder="Ingresa tu clave"
              placeholderTextColor={colors.textDim}
            />
          </View>
        </View>

        {/* Selector de Sede a Administrar */}
        <View style={styles.sectionBlock}>
          <Text style={styles.sectionTitle}>2. SELECCIONA LA SEDE O ESCUELA A ADMINISTRAR:</Text>
          <View style={styles.academiaList}>
            {academias.map((a, idx) => {
              const isSelected = selectedAcademiaId === a.id;
              return (
                <TouchableOpacity
                  key={a.id}
                  style={[
                    styles.academiaOption,
                    isSelected && styles.academiaOptionSelected,
                  ]}
                  onPress={() => setSelectedAcademiaId(a.id)}
                  activeOpacity={0.85}
                >
                  <View
                    style={[
                      styles.indicatorBar,
                      isSelected && styles.indicatorBarActive,
                    ]}
                  />
                  <View style={{ flex: 1 }}>
                    <Text
                      style={[
                        styles.academiaName,
                        isSelected && styles.academiaNameSelected,
                      ]}
                    >
                      {a.nombre}
                    </Text>
                    <Text style={styles.academiaAddress}>
                      {a.direccion || 'Sede oficial'}
                    </Text>
                  </View>
                  <View
                    style={[
                      styles.statusPill,
                      isSelected && styles.statusPillActive,
                    ]}
                  >
                    <Text
                      style={[
                        styles.statusPillText,
                        isSelected && styles.statusPillTextActive,
                      ]}
                    >
                      {isSelected ? '✓ SELECCIONADA' : 'ELEGIR'}
                    </Text>
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* Botón Principal de Ingreso */}
        <View style={styles.actionBlock}>
          <TouchableOpacity
            style={styles.enterButton}
            onPress={handleLogin}
            activeOpacity={0.85}
          >
            <Text style={styles.enterButtonText}>
              INICIAR SESIÓN Y ACCEDER AL SISTEMA ➔
            </Text>
          </TouchableOpacity>

          {/* Enlace al Formulario Público de Matrícula */}
          <TouchableOpacity
            style={styles.publicLinkButton}
            onPress={handleOpenPublicForm}
            activeOpacity={0.85}
          >
            <Text style={styles.publicLinkText}>
              IR AL FORMULARIO PÚBLICO DE MATRÍCULA ONLINE
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.footerNote}>
          <Text style={styles.footerText}>
            Dojo Shito Ryu Kyokan Genbukai • Rancagua, Chile • v2.6 Fachada Segura
          </Text>
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: colors.bgDarkest,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  card: {
    width: '100%',
    maxWidth: 620,
    backgroundColor: colors.bgCard,
    borderWidth: 1,
    borderColor: colors.borderLight,
    borderRadius: 0,
    overflow: 'hidden',
  },
  topHeaderRibbon: {
    backgroundColor: colors.primary,
    paddingVertical: 8,
    paddingHorizontal: 20,
    alignItems: 'center',
  },
  ribbonText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 1.5,
  },
  headerBody: {
    padding: 24,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderSubtle,
    backgroundColor: colors.bgSurface,
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  logoSquare: {
    width: 48,
    height: 48,
    borderRadius: 0,
    backgroundColor: colors.primaryLight,
    borderWidth: 2,
    borderColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoSquareText: {
    fontSize: 20,
    fontWeight: '900',
    color: colors.primary,
  },
  title: {
    fontSize: 18,
    fontWeight: '900',
    color: colors.textPrimary,
    letterSpacing: 0.5,
  },
  subtitle: {
    fontSize: 12,
    color: colors.textMuted,
    marginTop: 3,
  },
  errorBox: {
    backgroundColor: 'rgba(239, 68, 68, 0.15)',
    borderLeftWidth: 4,
    borderLeftColor: colors.danger,
    padding: 12,
    marginHorizontal: 20,
    marginTop: 16,
  },
  errorText: {
    color: colors.danger,
    fontSize: 12,
    fontWeight: '700',
  },
  sectionBlock: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderSubtle,
  },
  sectionTitle: {
    color: colors.accent,
    fontSize: 11,
    fontWeight: '900',
    letterSpacing: 1,
    marginBottom: 12,
  },
  inputGroup: {
    gap: 6,
  },
  inputLabel: {
    color: colors.textSecondary,
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  textInput: {
    backgroundColor: colors.bgDark,
    borderWidth: 1,
    borderColor: colors.borderLight,
    borderRadius: 0,
    paddingVertical: 10,
    paddingHorizontal: 12,
    color: colors.textPrimary,
    fontSize: 13,
  },
  academiaList: {
    gap: 8,
  },
  academiaOption: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.bgDark,
    padding: 12,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
    borderRadius: 0,
    gap: 12,
  },
  academiaOptionSelected: {
    borderColor: colors.primary,
    backgroundColor: 'rgba(255, 107, 0, 0.08)',
  },
  indicatorBar: {
    width: 4,
    height: 36,
    backgroundColor: colors.borderLight,
    borderRadius: 0,
  },
  indicatorBarActive: {
    backgroundColor: colors.primary,
  },
  academiaName: {
    color: colors.textSecondary,
    fontSize: 13,
    fontWeight: '800',
  },
  academiaNameSelected: {
    color: colors.textPrimary,
  },
  academiaAddress: {
    color: colors.textDim,
    fontSize: 11,
    marginTop: 2,
  },
  statusPill: {
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderWidth: 1,
    borderColor: colors.borderLight,
    borderRadius: 0,
  },
  statusPillActive: {
    borderColor: colors.primary,
    backgroundColor: 'rgba(255, 107, 0, 0.15)',
  },
  statusPillText: {
    color: colors.textDim,
    fontSize: 10,
    fontWeight: '800',
  },
  statusPillTextActive: {
    color: colors.primary,
    fontWeight: '900',
  },
  actionBlock: {
    padding: 20,
    gap: 10,
  },
  enterButton: {
    backgroundColor: colors.primary,
    paddingVertical: 14,
    paddingHorizontal: 20,
    alignItems: 'center',
    borderRadius: 0,
  },
  enterButtonText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '900',
    letterSpacing: 1,
  },
  publicLinkButton: {
    backgroundColor: colors.bgDark,
    paddingVertical: 12,
    paddingHorizontal: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.borderLight,
    borderRadius: 0,
  },
  publicLinkText: {
    color: colors.textMuted,
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  footerNote: {
    borderTopWidth: 1,
    borderTopColor: colors.borderSubtle,
    padding: 14,
    alignItems: 'center',
    backgroundColor: colors.bgDarkest,
  },
  footerText: {
    color: colors.textDim,
    fontSize: 10,
    letterSpacing: 0.3,
  },
});
