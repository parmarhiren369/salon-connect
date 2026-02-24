import { create } from 'zustand';
import type { Firestore } from 'firebase/firestore';
import { firestoreSync } from '@/lib/firestore-sync';

export interface Customer {
  id: string;
  name: string;
  mobile: string;
  date: string;
  birthday?: string;
  anniversary?: string;
  reference?: string;
  services?: string;
  notes?: string;
}

export interface Membership {
  id: string;
  customerId: string;
  customerName: string;
  plan: string;
  planId?: string;
  startDate: string;
  endDate: string;
  amount: number;
  totalBenefits?: number;
  usedBenefits?: number;
  status: 'active' | 'expired';
}

export interface MembershipPlan {
  id: string;
  name: string;
  price: number;
  totalBenefits: number;
}

export interface MessageTemplate {
  id: string;
  name: string;
  content: string;
  category: 'sale' | 'discount' | 'festival' | 'general';
  imageUrl?: string;
}

export interface Billing {
  id: string;
  customerId: string;
  customerName?: string;
  service: string;
  services?: string[];
  amount: string | number;
  discount?: number;
  finalAmount?: number;
  date: string;
  notes?: string;
  paymentMethod?: 'cash' | 'upi' | 'card' | 'bank_transfer' | 'other';
}

export interface SalonService {
  id: string;
  name: string;
  price: number;
  category: string;
}

export interface Appointment {
  id: string;
  customerId: string;
  customerName?: string;
  date: string;
  time: string;
  service: string;
  notes?: string;
  status: 'scheduled' | 'completed' | 'cancelled';
}

interface AppState {
  db: Firestore | null;
  customers: Customer[];
  templates: MessageTemplate[];
  billings: Billing[];
  appointments: Appointment[];
  salonServices: SalonService[];
  memberships: Membership[];
  membershipPlans: MembershipPlan[];
  setDb: (db: Firestore) => void;
  setCustomers: (customers: Customer[]) => void;
  setTemplates: (templates: MessageTemplate[]) => void;
  setBillings: (billings: Billing[]) => void;
  setAppointments: (appointments: Appointment[]) => void;
  setSalonServices: (services: SalonService[]) => void;
  setMemberships: (memberships: Membership[]) => void;
  setMembershipPlans: (plans: MembershipPlan[]) => void;
  addCustomer: (customer: Omit<Customer, 'id'>) => Promise<string | void>;
  deleteCustomer: (id: string) => void;
  updateCustomer: (id: string, data: Partial<Customer>) => void;
  addTemplate: (template: Omit<MessageTemplate, 'id'>) => void;
  deleteTemplate: (id: string) => void;
  updateTemplate: (id: string, data: Partial<MessageTemplate>) => void;
  addBilling: (billing: Omit<Billing, 'id'>) => void;
  deleteBilling: (id: string) => void;
  updateBilling: (id: string, data: Partial<Billing>) => void;
  addAppointment: (appointment: Omit<Appointment, 'id'>) => void;
  deleteAppointment: (id: string) => void;
  updateAppointment: (id: string, data: Partial<Appointment>) => void;
  addSalonService: (service: Omit<SalonService, 'id'>) => void;
  deleteSalonService: (id: string) => void;
  updateSalonService: (id: string, data: Partial<SalonService>) => void;
  addMembership: (membership: Omit<Membership, 'id'>) => void;
  deleteMembership: (id: string) => void;
  updateMembership: (id: string, data: Partial<Membership>) => void;
  addMembershipPlan: (plan: Omit<MembershipPlan, 'id'>) => void;
  deleteMembershipPlan: (id: string) => void;
  updateMembershipPlan: (id: string, data: Partial<MembershipPlan>) => void;
}

export const useStore = create<AppState>((set, get) => ({
  db: null,
  customers: [],
  billings: [],
  appointments: [],
  salonServices: [],
  memberships: [],
  membershipPlans: [],
  templates: [],

  setDb: (db) => set({ db }),
  setCustomers: (customers) => set({ customers }),
  setTemplates: (templates) => set({ templates }),
  setBillings: (billings) => set({ billings }),
  setAppointments: (appointments) => set({ appointments }),
  setSalonServices: (services) => set({ salonServices: services }),
  setMemberships: (memberships) => set({ memberships }),
  setMembershipPlans: (plans) => set({ membershipPlans: plans }),

  addCustomer: async (customer) => {
    const { db } = get();
    if (!db) return;
    try {
      const id = await firestoreSync.add(db, 'customers', customer);
      return id;
    } catch (error) {
      console.error('Error adding customer:', error);
    }
  },

  deleteCustomer: async (id) => {
    const { db } = get();
    if (!db) return;
    try {
      await firestoreSync.delete(db, 'customers', id);
    } catch (error) {
      console.error('Error deleting customer:', error);
    }
  },

  updateCustomer: async (id, data) => {
    const { db } = get();
    if (!db) return;
    try {
      await firestoreSync.update(db, 'customers', id, data);
    } catch (error) {
      console.error('Error updating customer:', error);
    }
  },

  addTemplate: async (template) => {
    const { db } = get();
    if (!db) return;
    try {
      await firestoreSync.add(db, 'templates', template);
    } catch (error) {
      console.error('Error adding template:', error);
    }
  },

  deleteTemplate: async (id) => {
    const { db } = get();
    if (!db) return;
    try {
      await firestoreSync.delete(db, 'templates', id);
    } catch (error) {
      console.error('Error deleting template:', error);
    }
  },

  updateTemplate: async (id, data) => {
    const { db } = get();
    if (!db) return;
    try {
      await firestoreSync.update(db, 'templates', id, data);
    } catch (error) {
      console.error('Error updating template:', error);
    }
  },

  addBilling: async (billing) => {
    const { db } = get();
    if (!db) return;
    try {
      await firestoreSync.add(db, 'billings', billing);
    } catch (error) {
      console.error('Error adding billing:', error);
    }
  },

  deleteBilling: async (id) => {
    const { db } = get();
    if (!db) return;
    try {
      await firestoreSync.delete(db, 'billings', id);
    } catch (error) {
      console.error('Error deleting billing:', error);
    }
  },

  updateBilling: async (id, data) => {
    const { db } = get();
    if (!db) return;
    try {
      await firestoreSync.update(db, 'billings', id, data);
    } catch (error) {
      console.error('Error updating billing:', error);
    }
  },

  addAppointment: async (appointment) => {
    const { db } = get();
    if (!db) return;
    try {
      await firestoreSync.add(db, 'appointments', appointment);
    } catch (error) {
      console.error('Error adding appointment:', error);
    }
  },

  deleteAppointment: async (id) => {
    const { db } = get();
    if (!db) return;
    try {
      await firestoreSync.delete(db, 'appointments', id);
    } catch (error) {
      console.error('Error deleting appointment:', error);
    }
  },

  updateAppointment: async (id, data) => {
    const { db } = get();
    if (!db) return;
    try {
      await firestoreSync.update(db, 'appointments', id, data);
    } catch (error) {
      console.error('Error updating appointment:', error);
    }
  },

  addSalonService: async (service) => {
    const { db } = get();
    if (!db) return;
    try {
      await firestoreSync.add(db, 'salonServices', service);
    } catch (error) {
      console.error('Error adding salon service:', error);
    }
  },

  deleteSalonService: async (id) => {
    const { db } = get();
    if (!db) return;
    try {
      await firestoreSync.delete(db, 'salonServices', id);
    } catch (error) {
      console.error('Error deleting salon service:', error);
    }
  },

  updateSalonService: async (id, data) => {
    const { db } = get();
    if (!db) return;
    try {
      await firestoreSync.update(db, 'salonServices', id, data);
    } catch (error) {
      console.error('Error updating salon service:', error);
    }
  },

  addMembership: async (membership) => {
    const { db } = get();
    if (!db) return;
    try {
      await firestoreSync.add(db, 'memberships', membership);
    } catch (error) {
      console.error('Error adding membership:', error);
    }
  },

  deleteMembership: async (id) => {
    const { db } = get();
    if (!db) return;
    try {
      await firestoreSync.delete(db, 'memberships', id);
    } catch (error) {
      console.error('Error deleting membership:', error);
    }
  },

  updateMembership: async (id, data) => {
    const { db } = get();
    if (!db) return;
    try {
      await firestoreSync.update(db, 'memberships', id, data);
    } catch (error) {
      console.error('Error updating membership:', error);
    }
  },

  addMembershipPlan: async (plan) => {
    const { db } = get();
    if (!db) return;
    try {
      await firestoreSync.add(db, 'membershipPlans', plan);
    } catch (error) {
      console.error('Error adding membership plan:', error);
    }
  },

  deleteMembershipPlan: async (id) => {
    const { db } = get();
    if (!db) return;
    try {
      await firestoreSync.delete(db, 'membershipPlans', id);
    } catch (error) {
      console.error('Error deleting membership plan:', error);
    }
  },

  updateMembershipPlan: async (id, data) => {
    const { db } = get();
    if (!db) return;
    try {
      await firestoreSync.update(db, 'membershipPlans', id, data);
    } catch (error) {
      console.error('Error updating membership plan:', error);
    }
  },
}));
