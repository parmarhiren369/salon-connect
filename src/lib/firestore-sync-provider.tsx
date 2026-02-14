import { useEffect, ReactNode } from 'react';
import { useFirebase } from './firebase-context';
import { useStore } from '@/store/useStore';
import { firestoreSync } from './firestore-sync';
import type { Customer, MessageTemplate, Billing, SalonService, Membership, MembershipPlan } from '@/store/useStore';

export function FirestoreSync({ children }: { children: ReactNode }) {
  const { db } = useFirebase();
  const store = useStore();

  useEffect(() => {
    if (!db) return;

    // Set db in store
    store.setDb(db);

    // Initialize defaults (first time setup)
    firestoreSync.initializeDefaults(db);

    const unsubscribers: (() => void)[] = [];

    // Subscribe to all collections
    unsubscribers.push(
      firestoreSync.subscribe<Customer>(db, 'customers', (data) => {
        store.setCustomers(data);
      })
    );

    unsubscribers.push(
      firestoreSync.subscribe<MessageTemplate>(db, 'templates', (data) => {
        store.setTemplates(data);
      })
    );

    unsubscribers.push(
      firestoreSync.subscribe<Billing>(db, 'billings', (data) => {
        store.setBillings(data);
      })
    );

    unsubscribers.push(
      firestoreSync.subscribe<SalonService>(db, 'salonServices', (data) => {
        store.setSalonServices(data);
      })
    );

    unsubscribers.push(
      firestoreSync.subscribe<Membership>(db, 'memberships', (data) => {
        store.setMemberships(data);
      })
    );

    unsubscribers.push(
      firestoreSync.subscribe<MembershipPlan>(db, 'membershipPlans', (data) => {
        store.setMembershipPlans(data);
      })
    );

    // Cleanup subscriptions
    return () => {
      unsubscribers.forEach(unsub => unsub());
    };
  }, [db, store]);

  return <>{children}</>;
}
