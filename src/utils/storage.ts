import {
  AppUser,
  MobileUnit,
  VehicleOccurrence,
  InventoryItem,
  PatientClient,
  RolePermissions,
  LocationUpdateLog
} from '../types';
import {
  initialUsers,
  initialUnits,
  initialOccurrences,
  initialInventory,
  initialPatients,
  initialPermissions,
  initialLocationLogs
} from './initialData';
import { ENV } from '../config/env';

const prefix = ENV.storagePrefix;

const STORAGE_KEYS = {
  USERS: `${prefix}users`,
  CURRENT_USER: `${prefix}current_user`,
  UNITS: `${prefix}units`,
  OCCURRENCES: `${prefix}occurrences`,
  LOCATION_LOGS: `${prefix}location_logs`,
  INVENTORY: `${prefix}inventory`,
  PATIENTS: `${prefix}patients`,
  PERMISSIONS: `${prefix}permissions`
};

function safeGet<T>(key: string, defaultValue: T): T {
  try {
    const item = localStorage.getItem(key);
    if (!item) return defaultValue;
    return JSON.parse(item) as T;
  } catch (e) {
    console.error(`Error reading ${key} from localStorage:`, e);
    return defaultValue;
  }
}

function safeSet<T>(key: string, value: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (e) {
    console.error(`Error writing ${key} to localStorage:`, e);
  }
}

export const db = {
  getUsers: (): AppUser[] => safeGet<AppUser[]>(STORAGE_KEYS.USERS, initialUsers),
  saveUsers: (users: AppUser[]): void => safeSet(STORAGE_KEYS.USERS, users),

  getCurrentUser: (): AppUser | null => {
    return safeGet<AppUser | null>(STORAGE_KEYS.CURRENT_USER, null);
  },
  setCurrentUser: (user: AppUser | null): void => {
    if (user === null) {
      localStorage.removeItem(STORAGE_KEYS.CURRENT_USER);
    } else {
      safeSet(STORAGE_KEYS.CURRENT_USER, user);
    }
  },

  getUnits: (): MobileUnit[] => safeGet<MobileUnit[]>(STORAGE_KEYS.UNITS, initialUnits),
  saveUnits: (units: MobileUnit[]): void => safeSet(STORAGE_KEYS.UNITS, units),

  getOccurrences: (): VehicleOccurrence[] => safeGet<VehicleOccurrence[]>(STORAGE_KEYS.OCCURRENCES, initialOccurrences),
  saveOccurrences: (occ: VehicleOccurrence[]): void => safeSet(STORAGE_KEYS.OCCURRENCES, occ),

  getLocationLogs: (): LocationUpdateLog[] => safeGet<LocationUpdateLog[]>(STORAGE_KEYS.LOCATION_LOGS, initialLocationLogs),
  saveLocationLogs: (logs: LocationUpdateLog[]): void => safeSet(STORAGE_KEYS.LOCATION_LOGS, logs),

  getInventory: (): InventoryItem[] => safeGet<InventoryItem[]>(STORAGE_KEYS.INVENTORY, initialInventory),
  saveInventory: (inv: InventoryItem[]): void => safeSet(STORAGE_KEYS.INVENTORY, inv),

  getPatients: (): PatientClient[] => safeGet<PatientClient[]>(STORAGE_KEYS.PATIENTS, initialPatients),
  savePatients: (patients: PatientClient[]): void => safeSet(STORAGE_KEYS.PATIENTS, patients),

  getPermissions: (): RolePermissions => safeGet<RolePermissions>(STORAGE_KEYS.PERMISSIONS, initialPermissions),
  savePermissions: (perm: RolePermissions): void => safeSet(STORAGE_KEYS.PERMISSIONS, perm),

  resetToDefaults: (): void => {
    localStorage.removeItem(STORAGE_KEYS.USERS);
    localStorage.removeItem(STORAGE_KEYS.CURRENT_USER);
    localStorage.removeItem(STORAGE_KEYS.UNITS);
    localStorage.removeItem(STORAGE_KEYS.OCCURRENCES);
    localStorage.removeItem(STORAGE_KEYS.LOCATION_LOGS);
    localStorage.removeItem(STORAGE_KEYS.INVENTORY);
    localStorage.removeItem(STORAGE_KEYS.PATIENTS);
    localStorage.removeItem(STORAGE_KEYS.PERMISSIONS);
  }
};
