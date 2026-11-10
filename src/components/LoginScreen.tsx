import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { useDojoStore } from '../store/dojoStore';
import { Usuario } from '../types';
import { colors, radii, useResponsive } from '../theme/theme';

export const LoginScreen: React.FC = () => {
  const users = useDojoStore((state) => state.users);
  const loginAsUser = useDojoStore((state) => state.loginAsUser);
  const setTab = useDojoStore((state) => state.setTab);
  const { isMobile } = useResponsive();

  const [selectedUser, setSelectedUser] = useState<Usuario>(users[0]);
  const [selectedAcademiaId, setSelectedAcademiaId] = useState<string>(users[0].academias[0].id);

  const handleSelectUser = (u: Usuario) => {
    setSelectedUser(u);
    if (u.academias.length > 0) {
      setSelectedAcademiaId(u.academias[0].id);
    }
  };

  const handleLogin = () => {
    loginAsUser(selectedUser.id, selectedAcademiaId);
  };

  const handleOpenPublicForm = () => {
    loginAsUser(users[0].id, users[0].academias[0].id);
    setTab('registro_publico');
  };

  return (
    <ScrollView contentContainerStyle={[styles.container, isMobile && { padding: 12 }]}>
      <View style={[styles.card, isMobile && { maxWidth: '100%', borderRadius: radii.lg }]}>
        {/* Barra superior institucional estilo DojoStrike */}
        <View style={styles.topHeaderRibbon}>
          <Text style={styles.ribbonText}>🥋 DOJOSTRIKE • SHITO RYU KYOKAN GENBUKAI</Text>
        </View>

        <View style={[styles.headerBody, isMobile && { padding: 16 }]}>
          <View style={styles.brandRow}>
            <View style={styles.logoCircle}>
              <Text style={styles.logoCircleText}>🥋</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.title}>DOJO SHITO RYU</Text>
              <Text style={styles.subtitle}>
                Panel Administrativo y Técnico • Selecciona tu perfil
              </Text>
            </View>
          </View>
        </View>

        {/* Paso 1: Seleccionar Usuario */}
        <View style={[styles.sectionBlock, isMobile && { padding: 16 }]}>
          <Text style={styles.sectionTitle}>1. SELECCIONA EL USUARIO QUE INGRESA:</Text>
          <View style={styles.userList}>
            {users.map((u) => {
              const isSelected = selectedUser.id === u.id;
              return (
                <TouchableOpacity
                  key={u.id}
                  style={[styles.userOption, isSelected && styles.userOptionSelected]}
                  onPress={() => handleSelectUser(u)}
                  activeOpacity={0.8}
                >
                  <View style={[styles.userIndicator, isSelected && styles.userIndicatorActive]} />
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.userName, isSelected && styles.userNameSelected]}>
                      {u.nombre_completo}
                    </Text>
                    <Text style={styles.userMeta}>
                      Rol: {u.rol.replace('_', ' ')} • {u.academias.length} {u.academias.length === 1 ? 'Sede asignada' : 'Sedes asignadas'}
                    </Text>
                  </View>
                  {isSelected && <Text style={styles.checkText}>✓ ACTIVO</Text>}
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* Paso 2: Seleccionar Sede / Academia */}
        <View style={[styles.sectionBlock, isMobile && { padding: 16 }]}>
          <Text style={styles.sectionTitle}>2. SELECCIONA LA SEDE / ACADEMIA A GESTIONAR:</Text>
          <View style={styles.academiaList}>
            {selectedUser.academias.map((a) => {
              const isSelected = selectedAcademiaId === a.id;
              return (
                <TouchableOpacity
                  key={a.id}
                  style={[styles.academiaOption, isSelected && styles.academiaOptionSelected]}
                  onPress={() => setSelectedAcademiaId(a.id)}
                  activeOpacity={0.8}
                >
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.academiaName, isSelected && styles.academiaNameSelected]}>
                      🥋 {a.nombre}
                    </Text>
                    <Text style={styles.academiaAddress}>📍 {a.direccion}</Text>
                  </View>
                  {isSelected && <View style={styles.sharpDot} />}
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* Botón Principal de Ingreso */}
        <TouchableOpacity style={styles.enterButton} onPress={handleLogin} activeOpacity={0.85}>
          <Text style={styles.enterButtonText}>INGRESAR AL SISTEMA DOJO ➔</Text>
        </TouchableOpacity>

        {/* Enlace al Formulario Público de Matrícula */}
        <TouchableOpacity
          style={styles.publicLinkButton}
          onPress={handleOpenPublicForm}
          activeOpacity={0.85}
        >
          <Text style={styles.publicLinkText}>📲 Abrir Formulario Público de Matrícula Online</Text>
        </TouchableOpacity>

        <View style={styles.footerNote}>
          <Text style={styles.footerText}>
            Dojo Shito Ryu Kyokan Genbukai • Rancagua, Chile • v2.6
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
    maxWidth: 580,
    backgroundColor: colors.bgCard,
    borderWidth: 1,
    borderColor: colors.borderLight,
    borderRadius: radii.xl,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 16,
    elevation: 8,
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
  logoCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.primaryLight,
    borderWidth: 2,
    borderColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoCircleText: {
    fontSize: 22,
  },
  title: {
    fontSize: 20,
    fontWeight: '900',
    color: colors.textPrimary,
    letterSpacing: 0.5,
  },
  subtitle: {
    fontSize: 12,
    color: colors.textMuted,
    marginTop: 3,
  },
  sectionBlock: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderSubtle,
  },
  sectionTitle: {
    color: colors.primary,
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 1,
    marginBottom: 12,
  },
  userList: {
    gap: 8,
  },
  userOption: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.bgInput,
    padding: 12,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
    borderRadius: radii.md,
    gap: 12,
  },
  userOptionSelected: {
    borderColor: colors.primary,
    backgroundColor: 'rgba(255, 107, 0, 0.08)',
  },
  userIndicator: {
    width: 4,
    height: 32,
    backgroundColor: colors.borderLight,
    borderRadius: 2,
  },
  userIndicatorActive: {
    backgroundColor: colors.primary,
  },
  userName: {
    color: colors.textSecondary,
    fontSize: 14,
    fontWeight: '700',
  },
  userNameSelected: {
    color: colors.textPrimary,
  },
  userMeta: {
    color: colors.textDim,
    fontSize: 11,
    marginTop: 2,
  },
  checkText: {
    color: colors.primary,
    fontSize: 11,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  academiaList: {
    gap: 8,
  },
  academiaOption: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.bgInput,
    padding: 12,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
    borderRadius: radii.md,
  },
  academiaOptionSelected: {
    borderColor: colors.primary,
    backgroundColor: 'rgba(255, 107, 0, 0.08)',
  },
  academiaName: {
    color: colors.textSecondary,
    fontSize: 13,
    fontWeight: '700',
  },
  academiaNameSelected: {
    color: colors.primary,
  },
  academiaAddress: {
    color: colors.textDim,
    fontSize: 11,
    marginTop: 2,
  },
  sharpDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.primary,
  },
  enterButton: {
    backgroundColor: colors.primary,
    paddingVertical: 15,
    paddingHorizontal: 20,
    alignItems: 'center',
    margin: 20,
    marginBottom: 8,
    borderRadius: radii.md,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 8,
    elevation: 4,
  },
  enterButtonText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '900',
    letterSpacing: 0.8,
  },
  publicLinkButton: {
    backgroundColor: colors.bgInput,
    paddingVertical: 12,
    paddingHorizontal: 16,
    alignItems: 'center',
    marginHorizontal: 20,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
    borderRadius: radii.md,
  },
  publicLinkText: {
    color: colors.textMuted,
    fontSize: 12,
    fontWeight: '600',
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
  },
});
