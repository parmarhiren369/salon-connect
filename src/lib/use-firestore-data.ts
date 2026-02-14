import { useEffect, useState } from 'react';
import { useFirebase } from './firebase-context';
import { firestoreSync } from './firestore-sync';
import type { Customer, MessageTemplate, Billing, SalonService, Membership, MembershipPlan } from '@/store/useStore';

// Hook for managing data with Firestore sync
export function useFirestoreData() {
  const { db } = useFirebase();
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [templates, setTemplates] = useState<MessageTemplate[]>([]);
  const [billings, setBillings] = useState<Billing[]>([]);
  const [salonServices, setSalonServices] = useState<SalonService[]>([]);
  const [memberships, setMemberships] = useState<Membership[]>([]);
  const [membershipPlans, setMembershipPlans] = useState<MembershipPlan[]>([]);
  const [loading, setLoading] = useState(true);

  // Initialize and subscribe to all collections
  useEffect(() => {
    if (!db) return;

    const unsubscribers: (() => void)[] = [];

    // Initialize defaults (first time setup)
    firestoreSync.initializeDefaults(db);

    // Subscribe to customers
    unsubscribers.push(
      firestoreSync.subscribe<Customer>(db, 'customers', (data) => {
        setCustomers(data);
        setLoading(false);
      })
    );

    // Subscribe to templates
    unsubscribers.push(
      firestoreSync.subscribe<MessageTemplate>(db, 'templates', setTemplates)
    );

    // Subscribe to billings
    unsubscribers.push(
      firestoreSync.subscribe<Billing>(db, 'billings', setBillings)
    );

    // Subscribe to salon services
    unsubscribers.push(
      firestoreSync.subscribe<SalonService>(db, 'salonServices', setSalonServices)
    );

    // Subscribe to memberships
    unsubscribers.push(
      firestoreSync.subscribe<Membership>(db, 'memberships', setMemberships)
    );

    // Subscribe to membership plans
    unsubscribers.push(
      firestoreSync.subscribe<MembershipPlan>(db, 'membershipPlans', setMembershipPlans)
    );

    // Cleanup subscriptions
    return () => {
      unsubscribers.forEach(unsub => unsub());
    };
  }, [db]);

  return {
    customers,
    templates,
    billings,
    salonServices,
    memberships,
    membershipPlans,
    loading,
    db
  };
}
