import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { useDojoStore, TabType } from '../store/dojoStore';
import { CENTRAL_ACADEMIA_ID, matchAcademia } from '../data/constants';
import { colors, radii, useResponsive } from '../theme/theme';

export const Header: React.FC = () => {
  const currentTab = useDojoStore((state) => state.currentTab);
  const setTab = useDojoStore((state) => state.setTab);
  const logout = useDojoStore((state) => state.logout);
  const currentUser = useDojoStore((state) => state.currentUser);
  const currentAcademia = useDojoStore((state) => state.currentAcademia);
  const switchAcademia = useDojoStore((state) => state.switchAcademia);
  const academias = useDojoStore((state) => state.academias);
  const students = useDojoStore((state) => state.students);
  const studentsCount = students.length;
  const supabaseSyncStatus = useDojoStore((state) => state.supabaseSyncStatus);

  const { isMobile } = useResponsive();
  const [showAcademiaMenu, setShowAcademiaMenu] = useState(false);

  // Cerrar el menú si se hace clic fuera en cualquier lado de la pantalla
  useEffect(() => {
    if (!showAcademiaMenu) return;

    const handleOutsideClick = () => {
      setShowAcademiaMenu(false);
    };

    const timer = setTimeout(() => {
      if (typeof window !== 'undefined') {
        window.addEventListener('click', handleOutsideClick);
        window.addEventListener('touchstart', handleOutsideClick);
      }
    }, 50);

    return () => {
      clearTimeout(timer);
      if (typeof window !== 'undefined') {
        window.removeEventListener('click', handleOutsideClick);
        window.removeEventListener('touchstart', handleOutsideClick);
      }
    };
  }, [showAcademiaMenu]);

  const availableAcademias = currentUser?.rol === 'ADMIN_GENERAL' ? academias : (currentUser?.academias || []);

  const targetAcademiaId = currentAcademia?.id || CENTRAL_ACADEMIA_ID;
  const schoolStudentsCount = students.filter((s) => matchAcademia(s.academia_id, targetAcademiaId)).length;

  const tabs: { key: TabType; label: string; icon: string }[] = [
    { key: 'dashboard', label: 'DASHBOARD', icon: '📊' },
    { key: 'alumnos', label: `ALUMNOS (${schoolStudentsCount})`, icon: '🥋' },
    { key: 'cronograma', label: 'CRONOGRAMA', icon: '📅' },
    { key: 'mensualidades', label: 'MENSUALIDADES', icon: '💰' },
    { key: 'torneos', label: 'EVENTOS Y EXÁMENES', icon: '🏆' },
    { key: 'registro_publico', label: 'LINK MATRÍCULA', icon: '📲' },
    { key: 'configuracion', label: 'CONFIGURACIONES', icon: '⚙️' },
  ];

  return (
    <View style={styles.headerWrapper}>
      {/* Barra superior de estado y usuario */}
      <View style={[styles.topBar, isMobile && styles.topBarMobile]}>
        <View style={styles.brandContainer}>
          <View style={styles.dojoBadge}>
            <Text style={styles.dojoBadgeText}>SHITO RYU</Text>
          </View>
          <View style={{ flex: 1, minWidth: 0, overflow: 'hidden' }}>
            <TouchableOpacity
              style={styles.academiaSelectorBtn}
              onPress={() => setShowAcademiaMenu(!showAcademiaMenu)}
              activeOpacity={0.8}
            >
              <Text style={styles.dojoTitle} numberOfLines={1} ellipsizeMode="tail">
                {currentAcademia?.nombre || 'Dojo Central Rancagua'} ▾
              </Text>
            </TouchableOpacity>
            {!isMobile && (
              <Text style={styles.dojoSubtitle}>
                Usuario: <Text style={{ color: colors.textSecondary, fontWeight: '700' }}>{currentUser?.nombre_completo}</Text> ({currentUser?.rol.replace('_', ' ')})
              </Text>
            )}
          </View>
        </View>

        <View style={styles.topActions}>
          <View
            style={[
              styles.statusPill,
              supabaseSyncStatus === 'SYNCED' && {
                backgroundColor: colors.successBg,
                borderColor: colors.successBorder,
              },
              supabaseSyncStatus === 'CONNECTING' && {
                backgroundColor: colors.warningBg,
                borderColor: colors.warningBorder,
              },
            ]}
          >
            <View
              style={[
                styles.squareDot,
                supabaseSyncStatus === 'SYNCED' && { backgroundColor: colors.success },
                supabaseSyncStatus === 'CONNECTING' && { backgroundColor: colors.warning },
              ]}
            />
            <Text
              style={[
                styles.statusText,
                supabaseSyncStatus === 'SYNCED' && { color: colors.success },
                supabaseSyncStatus === 'CONNECTING' && { color: colors.warning },
              ]}
            >
              {supabaseSyncStatus === 'SYNCED'
                ? isMobile ? `NUBE (${studentsCount})` : `SUPABASE NUBE (${studentsCount})`
                : supabaseSyncStatus === 'CONNECTING'
                ? 'CONECTANDO...'
                : 'MODO LOCAL'}
            </Text>
          </View>

          <TouchableOpacity style={styles.logoutBtn} onPress={logout} activeOpacity={0.8}>
            <Text style={styles.logoutBtnText}>{isMobile ? 'SALIR' : 'CAMBIAR USUARIO'}</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Menú desplegable para cambiar de sede si el usuario tiene varias */}
      {showAcademiaMenu && (
        <View
          style={styles.academiaDropdown}
          // @ts-ignore
          onClick={(e: any) => e.stopPropagation?.()}
        >
          <Text style={styles.dropdownHeader}>CAMBIAR DE SEDE / ACADEMIA:</Text>
          {availableAcademias.map((a) => {
            const isCurrent = matchAcademia(currentAcademia?.id, a.id);
            const aCount = students.filter((s) => matchAcademia(s.academia_id, a.id)).length;

            return (
              <TouchableOpacity
                key={a.id}
                style={[
                  styles.dropdownItem,
                  isCurrent && styles.dropdownItemActive,
                ]}
                onPress={() => {
                  switchAcademia(a.id);
                  setShowAcademiaMenu(false);
                }}
              >
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Text style={[styles.dropdownItemText, isCurrent && styles.dropdownItemTextActive]}>
                    {a.nombre}
                  </Text>
                  <Text style={{ color: isCurrent ? colors.primary : colors.textDim, fontSize: 11, fontWeight: '800' }}>
                    {aCount} {aCount === 1 ? 'alumno' : 'alumnos'}
                  </Text>
                </View>
                <Text style={styles.dropdownItemSub}>{a.direccion}</Text>
              </TouchableOpacity>
            );
          })}
        </View>
      )}

      {/* Barra de navegación de pestañas estilo DojoStrike con scroll horizontal */}
      <View style={styles.navBar}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.navContent}>
          {tabs.map((tab) => {
            const isActive = currentTab === tab.key;
            return (
              <TouchableOpacity
                key={tab.key}
                style={[
                  styles.tabButton,
                  isActive && styles.tabButtonActive,
                  isMobile && styles.tabButtonMobile,
                ]}
                onPress={() => setTab(tab.key)}
                activeOpacity={0.8}
              >
                <Text style={styles.tabIcon}>{tab.icon}</Text>
                <Text style={[styles.tabLabel, isActive && styles.tabLabelActive]}>
                  {tab.label}
                </Text>
                {isActive && <View style={styles.activeBorderBottom} />}
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  headerWrapper: {
    backgroundColor: colors.bgSurface,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderSubtle,
    width: '100%',
    maxWidth: '100%',
    overflow: 'hidden',
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
    flexWrap: 'wrap',
    gap: 12,
    width: '100%',
    maxWidth: '100%',
  },
  topBarMobile: {
    paddingHorizontal: 10,
    paddingVertical: 8,
    gap: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  brandContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
    minWidth: 0,
    overflow: 'hidden',
  },
  dojoBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primary,
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderRadius: 0,
    gap: 6,
  },
  dojoBadgeIcon: {
    fontSize: 14,
  },
  dojoBadgeText: {
    color: '#FFFFFF',
    fontWeight: '900',
    fontSize: 11,
    letterSpacing: 1.2,
  },
  academiaSelectorBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    maxWidth: '100%',
  },
  dojoTitle: {
    fontSize: 14,
    fontWeight: '900',
    color: colors.textPrimary,
    letterSpacing: 0.3,
  },
  dojoSubtitle: {
    fontSize: 11,
    color: colors.textDim,
    marginTop: 2,
  },
  topActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flexShrink: 0,
  },
  statusPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.bgDarkest,
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
    borderRadius: 0,
    gap: 6,
  },
  squareDot: {
    width: 6,
    height: 6,
    borderRadius: 0,
    backgroundColor: colors.success,
  },
  statusText: {
    color: colors.textMuted,
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.6,
  },
  logoutBtn: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    backgroundColor: colors.bgCard,
    borderWidth: 1,
    borderColor: colors.borderLight,
    borderRadius: 0,
  },
  logoutBtnText: {
    color: colors.textSecondary,
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  academiaDropdown: {
    backgroundColor: colors.bgCardElevated,
    borderWidth: 1,
    borderColor: colors.primary,
    marginHorizontal: 16,
    marginBottom: 10,
    padding: 12,
    gap: 8,
    borderRadius: 0,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 10,
    elevation: 6,
  },
  dropdownHeader: {
    color: colors.primary,
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1,
    marginBottom: 2,
  },
  dropdownItem: {
    padding: 10,
    backgroundColor: colors.bgSurface,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
    borderRadius: 0,
  },
  dropdownItemActive: {
    borderColor: colors.primary,
    backgroundColor: 'rgba(255, 107, 0, 0.12)',
  },
  dropdownItemText: {
    color: colors.textPrimary,
    fontSize: 13,
    fontWeight: '700',
  },
  dropdownItemTextActive: {
    color: colors.primary,
    fontWeight: '900',
  },
  dropdownItemSub: {
    color: colors.textDim,
    fontSize: 11,
    marginTop: 2,
  },
  navBar: {
    borderTopWidth: 1,
    borderTopColor: colors.borderSubtle,
    backgroundColor: colors.bgDarkest,
    width: '100%',
    maxWidth: '100%',
    overflow: 'hidden',
  },
  navContent: {
    paddingHorizontal: 6,
    flexDirection: 'row',
  },
  tabButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 8,
    position: 'relative',
    marginVertical: 4,
    marginHorizontal: 2,
    borderRadius: 0,
  },
  tabButtonMobile: {
    paddingHorizontal: 12,
    paddingVertical: 10,
    gap: 6,
  },
  tabButtonActive: {
    backgroundColor: 'rgba(255, 107, 0, 0.12)',
  },
  tabIcon: {
    fontSize: 14,
  },
  tabLabel: {
    fontSize: 11,
    color: colors.textMuted,
    fontWeight: '800',
    letterSpacing: 0.6,
  },
  tabLabelActive: {
    color: colors.primary,
    fontWeight: '900',
  },
  activeBorderBottom: {
    position: 'absolute',
    bottom: -4,
    left: 8,
    right: 8,
    height: 3,
    backgroundColor: colors.primary,
    borderRadius: 0,
  },
});
