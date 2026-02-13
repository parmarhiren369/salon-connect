import { create } from 'zustand';

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

interface AppState {
  customers: Customer[];
  templates: MessageTemplate[];
  billings: Billing[];
  salonServices: SalonService[];
  memberships: Membership[];
  membershipPlans: MembershipPlan[];
  addCustomer: (customer: Omit<Customer, 'id'>) => void;
  deleteCustomer: (id: string) => void;
  updateCustomer: (id: string, data: Partial<Customer>) => void;
  addTemplate: (template: Omit<MessageTemplate, 'id'>) => void;
  deleteTemplate: (id: string) => void;
  updateTemplate: (id: string, data: Partial<MessageTemplate>) => void;
  addBilling: (billing: Omit<Billing, 'id'>) => void;
  deleteBilling: (id: string) => void;
  updateBilling: (id: string, data: Partial<Billing>) => void;
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

const loadState = <T>(key: string, fallback: T): T => {
  try {
    const stored = localStorage.getItem(key);
    return stored ? JSON.parse(stored) : fallback;
  } catch { return fallback; }
};

const saveState = (key: string, value: unknown) => {
  localStorage.setItem(key, JSON.stringify(value));
};

export const useStore = create<AppState>((set, get) => ({
  customers: loadState<Customer[]>('ls-customers', []),
  billings: loadState<Billing[]>('ls-billings', []),
  salonServices: loadState<SalonService[]>('ls-services', []),
  memberships: loadState<Membership[]>('ls-memberships', []),
  membershipPlans: loadState<MembershipPlan[]>('ls-membership-plans', []),
  templates: loadState<MessageTemplate[]>('ls-templates', [
    { id: '1', name: 'Grand Sale', content: 'Hi {name}! 🎉 Grand Sale at Life Style Studio! Get up to 50% OFF on all services. Book now! Call us to reserve your slot.', category: 'sale' },
    { id: '2', name: 'Festival Offer', content: 'Dear {name}, ✨ Celebrate this festive season with Life Style Studio! Special packages starting from ₹999. Limited slots available!', category: 'festival' },
    { id: '3', name: 'Loyalty Discount', content: 'Hi {name}! 💖 As our valued customer, enjoy an exclusive 20% discount on your next visit to Life Style Studio. Valid this month only!', category: 'discount' },
  ]),

  addCustomer: (customer) => set((state) => {
    const updated = [...state.customers, { ...customer, id: crypto.randomUUID() }];
    saveState('ls-customers', updated);
    return { customers: updated };
  }),

  deleteCustomer: (id) => set((state) => {
    const updated = state.customers.filter(c => c.id !== id);
    saveState('ls-customers', updated);
    return { customers: updated };
  }),

  updateCustomer: (id, data) => set((state) => {
    const updated = state.customers.map(c => c.id === id ? { ...c, ...data } : c);
    saveState('ls-customers', updated);
    return { customers: updated };
  }),

  addTemplate: (template) => set((state) => {
    const updated = [...state.templates, { ...template, id: crypto.randomUUID() }];
    saveState('ls-templates', updated);
    return { templates: updated };
  }),

  deleteTemplate: (id) => set((state) => {
    const updated = state.templates.filter(t => t.id !== id);
    saveState('ls-templates', updated);
    return { templates: updated };
  }),

  updateTemplate: (id, data) => set((state) => {
    const updated = state.templates.map(t => t.id === id ? { ...t, ...data } : t);
    saveState('ls-templates', updated);
    return { templates: updated };
  }),

  addBilling: (billing) => set((state) => {
    const updated = [...state.billings, { ...billing, id: crypto.randomUUID() }];
    saveState('ls-billings', updated);
    return { billings: updated };
  }),

  deleteBilling: (id) => set((state) => {
    const updated = state.billings.filter(b => b.id !== id);
    saveState('ls-billings', updated);
    return { billings: updated };
  }),

  updateBilling: (id, data) => set((state) => {
    const updated = state.billings.map(b => b.id === id ? { ...b, ...data } : b);
    saveState('ls-billings', updated);
    return { billings: updated };
  }),

  addSalonService: (service) => set((state) => {
    const updated = [...state.salonServices, { ...service, id: crypto.randomUUID() }];
    saveState('ls-services', updated);
    return { salonServices: updated };
  }),

  deleteSalonService: (id) => set((state) => {
    const updated = state.salonServices.filter(s => s.id !== id);
    saveState('ls-services', updated);
    return { salonServices: updated };
  }),

  updateSalonService: (id, data) => set((state) => {
    const updated = state.salonServices.map(s => s.id === id ? { ...s, ...data } : s);
    saveState('ls-services', updated);
    return { salonServices: updated };
  }),

  addMembership: (membership) => set((state) => {
    const updated = [...state.memberships, { ...membership, id: crypto.randomUUID() }];
    saveState('ls-memberships', updated);
    return { memberships: updated };
  }),

  deleteMembership: (id) => set((state) => {
    const updated = state.memberships.filter(m => m.id !== id);
    saveState('ls-memberships', updated);
    return { memberships: updated };
  }),

  updateMembership: (id, data) => set((state) => {
    const updated = state.memberships.map(m => m.id === id ? { ...m, ...data } : m);
    saveState('ls-memberships', updated);
    return { memberships: updated };
  }),

  addMembershipPlan: (plan) => set((state) => {
    const updated = [...state.membershipPlans, { ...plan, id: crypto.randomUUID() }];
    saveState('ls-membership-plans', updated);
    return { membershipPlans: updated };
  }),

  deleteMembershipPlan: (id) => set((state) => {
    const updated = state.membershipPlans.filter(p => p.id !== id);
    saveState('ls-membership-plans', updated);
    return { membershipPlans: updated };
  }),

  updateMembershipPlan: (id, data) => set((state) => {
    const updated = state.membershipPlans.map(p => p.id === id ? { ...p, ...data } : p);
    saveState('ls-membership-plans', updated);
    return { membershipPlans: updated };
  }),
}));
