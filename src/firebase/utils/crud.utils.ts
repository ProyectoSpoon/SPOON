// src/firebase/utils/crud.utils.ts

import { 
  doc, 
  collection,
  getDocs,
  getDoc,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
  startAfter,
  DocumentData,
  QueryConstraint,
  Timestamp,
  DocumentReference,
  CollectionReference,
  Query,
  writeBatch,
  WriteBatch as FirestoreWriteBatch
} from 'firebase/firestore';
import { db } from '../config';
import { COLLECTIONS, CollectionName } from '../types/collections.types';

export interface QueryOptions {
  where?: {
    field: string;
    operator: '<' | '<=' | '==' | '>=' | '>' | '!=' | 'array-contains' | 'in' | 'array-contains-any' | 'not-in';
    value: any;
  }[];
  orderBy?: {
    field: string;
    direction?: 'asc' | 'desc';
  }[];
  limit?: number;
  startAfter?: any;
  select?: string[];
}

const convertTimestamps = (obj: any): any => {
  if (obj === null || obj === undefined) return obj;
  if (obj instanceof Timestamp) return obj.toDate();
  if (Array.isArray(obj)) return obj.map(convertTimestamps);
  if (typeof obj === 'object') {
    return Object.keys(obj).reduce((acc, key) => ({
      ...acc,
      [key]: convertTimestamps(obj[key])
    }), {});
  }
  return obj;
};

export class FirebaseCrud<T extends { id: string }> {
  protected collectionRef: CollectionReference;

  constructor(
    protected collectionName: CollectionName
  ) {
    this.collectionRef = collection(db, collectionName);
  }

  async create(data: Omit<T, 'id'>, customId?: string): Promise<T> {
    try {
      const docRef = customId 
        ? doc(this.collectionRef, customId)
        : doc(this.collectionRef);
      
      const id = docRef.id;
      const timestamp = Timestamp.now();
      
      const docData = {
        ...data,
        id,
        createdAt: timestamp,
        updatedAt: timestamp
      };
  
      await setDoc(docRef, docData);
      return convertTimestamps(docData) as T;
    } catch (error) {
      console.error(`Error creating document in ${this.collectionName}:`, error);
      throw error;
    }
  }

  async getById(id: string): Promise<T | null> {
    try {
      const docRef = doc(this.collectionRef, id);
      const docSnap = await getDoc(docRef);
      
      if (!docSnap.exists()) return null;
      
      return convertTimestamps(docSnap.data()) as T;
    } catch (error) {
      console.error(`Error getting document from ${this.collectionName}:`, error);
      throw error;
    }
  }

  async query(options?: QueryOptions): Promise<T[]> {
    try {
      const constraints: QueryConstraint[] = [];
      
      if (options?.where) {
        options.where.forEach(({field, operator, value}) => {
          constraints.push(where(field, operator, value));
        });
      }
      
      if (options?.orderBy) {
        options.orderBy.forEach(({field, direction = 'asc'}) => {
          constraints.push(orderBy(field, direction));
        });
      }
      
      if (options?.limit) {
        constraints.push(limit(options.limit));
      }
      
      if (options?.startAfter) {
        constraints.push(startAfter(options.startAfter));
      }
  
      const q = query(this.collectionRef, ...constraints);
      const querySnapshot = await getDocs(q);
      
      return querySnapshot.docs.map(doc => 
        convertTimestamps(doc.data()) as T
      );
    } catch (error) {
      console.error(`Error querying ${this.collectionName}:`, error);
      throw error;
    }
  }

  async update(id: string, data: Partial<T>): Promise<void> {
    try {
      const docRef = doc(this.collectionRef, id);
      
      const updateData = {
        ...data,
        updatedAt: Timestamp.now()
      };
  
      await updateDoc(docRef, updateData);
    } catch (error) {
      console.error(`Error updating document in ${this.collectionName}:`, error);
      throw error;
    }
  }

  async delete(id: string): Promise<void> {
    try {
      const docRef = doc(this.collectionRef, id);
      await deleteDoc(docRef);
    } catch (error) {
      console.error(`Error deleting document from ${this.collectionName}:`, error);
      throw error;
    }
  }

  async exists(id: string): Promise<boolean> {
    try {
      const docRef = doc(this.collectionRef, id);
      const docSnap = await getDoc(docRef);
      return docSnap.exists();
    } catch (error) {
      console.error(`Error checking document existence in ${this.collectionName}:`, error);
      throw error;
    }
  }

  protected createBatchOperation(): FirestoreWriteBatch {
    return writeBatch(db);
  }

  protected async processBatch(batch: FirestoreWriteBatch): Promise<void> {
    try {
      await batch.commit();
    } catch (error) {
      console.error(`Error processing batch operation in ${this.collectionName}:`, error);
      throw error;
    }
  }
}