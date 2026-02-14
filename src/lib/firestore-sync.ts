import { 
  collection, 
  doc, 
  setDoc, 
  getDoc, 
  getDocs, 
  deleteDoc, 
  updateDoc,
  onSnapshot
} from 'firebase/firestore';
import type { Firestore } from 'firebase/firestore';

// Generic Firestore operations for single-user system
export const firestoreSync = {
  // Get all documents from a collection
  async getAll<T>(db: Firestore, collectionName: string): Promise<T[]> {
    try {
      const snapshot = await getDocs(collection(db, collectionName));
      return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as T));
    } catch (error) {
      console.error(`Error fetching ${collectionName}:`, error);
      return [];
    }
  },

  // Add a document
  async add<T>(db: Firestore, collectionName: string, data: T): Promise<string> {
    try {
      const id = crypto.randomUUID();
      await setDoc(doc(db, collectionName, id), {
        ...data,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      });
      return id;
    } catch (error) {
      console.error(`Error adding to ${collectionName}:`, error);
      throw error;
    }
  },

  // Update a document
  async update<T>(db: Firestore, collectionName: string, id: string, data: Partial<T>): Promise<void> {
    try {
      await updateDoc(doc(db, collectionName, id), {
        ...data,
        updatedAt: new Date().toISOString()
      } as any);
    } catch (error) {
      console.error(`Error updating ${collectionName}:`, error);
      throw error;
    }
  },

  // Delete a document
  async delete(db: Firestore, collectionName: string, id: string): Promise<void> {
    try {
      await deleteDoc(doc(db, collectionName, id));
    } catch (error) {
      console.error(`Error deleting from ${collectionName}:`, error);
      throw error;
    }
  },

  // Subscribe to real-time updates
  subscribe<T>(
    db: Firestore, 
    collectionName: string, 
    callback: (data: T[]) => void
  ): () => void {
    const unsubscribe = onSnapshot(collection(db, collectionName), (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as T));
      callback(data);
    }, (error) => {
      console.error(`Error subscribing to ${collectionName}:`, error);
    });

    return unsubscribe;
  },

  // Initialize default data (for first-time setup)
  async initializeDefaults(db: Firestore): Promise<void> {
    try {
      // Check if templates already exist
      const templates = await this.getAll(db, 'templates');
      
      if (templates.length === 0) {
        // Add default templates
        const defaultTemplates = [
          { name: 'Grand Sale', content: 'Hi {name}! 🎉 Grand Sale at Life Style Studio! Get up to 50% OFF on all services. Book now! Call us to reserve your slot. - {sender}', category: 'sale' },
          { name: 'Festival Offer', content: 'Dear {name}, ✨ Celebrate this festive season with Life Style Studio! Special packages starting from ₹999. Limited slots available! - {sender}', category: 'festival' },
          { name: 'Loyalty Discount', content: 'Hi {name}! 💖 As our valued customer, enjoy an exclusive 20% discount on your next visit to Life Style Studio. Valid this month only! - {sender}', category: 'discount' },
        ];

        for (const template of defaultTemplates) {
          await this.add(db, 'templates', template);
        }
      }
    } catch (error) {
      console.error('Error initializing defaults:', error);
    }
  }
};
