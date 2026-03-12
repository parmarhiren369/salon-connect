import { useEffect, useState, ReactNode } from 'react';
import { onAuthStateChanged, User } from 'firebase/auth';
import { useFirebase } from './firebase-context';
import { useStore } from '@/store/useStore';
import { firestoreSync } from './firestore-sync';
import type { Customer, MessageTemplate, Billing, SalonService, Membership, MembershipPlan, Appointment } from '@/store/useStore';

export function FirestoreSync({ children }: { children: ReactNode }) {
  const { db, auth } = useFirebase();
  const store = useStore();
  const [user, setUser] = useState<User | null | undefined>(undefined);

  // Track auth state so subscriptions restart after signOut + signIn (e.g. after password change)
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (u) => {
      setUser(u);
    });
    return unsubscribe;
  }, [auth]);

  useEffect(() => {
    // Only subscribe when both db and an authenticated user are available
    if (!db || !user) return;

    // Set db in store
    store.setDb(db);

    // Initialize defaults (first time setup) - wrap in try-catch
    firestoreSync.initializeDefaults(db).catch(err => {
      console.error('Failed to initialize defaults:', err);
    });

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
      firestoreSync.subscribe<Appointment>(db, 'appointments', (data) => {
        store.setAppointments(data);
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

    // Cleanup subscriptions when user changes (signOut/signIn) or component unmounts
    return () => {
      unsubscribers.forEach(unsub => unsub());
    };
  }, [db, user]); // Re-subscribe whenever auth user changes

  return <>{children}</>;
}
