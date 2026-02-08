import { create } from 'zustand';

export interface Customer {
  id: string;
  name: string;
  mobile: string;
  date: string;
  services?: string;
  notes?: string;
}

export interface MessageTemplate {
  id: string;
  name: string;
  content: string;
  category: 'sale' | 'discount' | 'festival' | 'general';
}

interface AppState {
  customers: Customer[];
  templates: MessageTemplate[];
  addCustomer: (customer: Omit<Customer, 'id'>) => void;
  deleteCustomer: (id: string) => void;
  updateCustomer: (id: string, data: Partial<Customer>) => void;
  addTemplate: (template: Omit<MessageTemplate, 'id'>) => void;
  deleteTemplate: (id: string) => void;
  updateTemplate: (id: string, data: Partial<MessageTemplate>) => void;
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
}));
