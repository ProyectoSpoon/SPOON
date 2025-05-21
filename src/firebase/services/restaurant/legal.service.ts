// src/firebase/services/restaurant/legal.service.ts

import { db, storage } from '@/firebase/config';
import { 
  collection, 
  doc, 
  getDoc, 
  setDoc, 
  updateDoc,
  serverTimestamp,
  WriteBatch,
  writeBatch, 
  QueryDocumentSnapshot
} from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { COLLECTIONS } from '@/firebase/types/collections.types';
import { IEmpresa } from '@/firebase/types/collections.types';

export interface DocumentInfo {
  id: string;
  file: File;
  type: 'rut' | 'camaraComercio' | 'otros';
}

export interface LegalDocument {
  url: string;
  fileName: string;
  type: string;
  uploadedAt: any;
  status: 'pending' | 'completed' | 'error';
}

const restaurantLegalService = {
  collections: {
    empresas: collection(db, COLLECTIONS.EMPRESAS),
    documentosLegales: collection(db, 'documentos_legales')
  },

  async saveDatosFiscales(empresaId: string, data: IEmpresa['datosFiscales']): Promise<void> {
    try {
      const docRef = doc(this.collections.empresas, empresaId);
      await updateDoc(docRef, {
        datosFiscales: data,
        'metadata.updatedAt': serverTimestamp()
      });
    } catch (error) {
      console.error('Error saving datos fiscales:', error);
      throw error;
    }
  },

  async uploadDocument(empresaId: string, document: DocumentInfo): Promise<string> {
    try {
      const storageRef = ref(
        storage, 
        `empresas/${empresaId}/legal/${document.type}_${Date.now()}`
      );

      await uploadBytes(storageRef, document.file);
      const downloadURL = await getDownloadURL(storageRef);

      const docRef = doc(this.collections.empresas, empresaId);
      await updateDoc(docRef, {
        [`documentosLegales.${document.type}`]: downloadURL,
        'metadata.updatedAt': serverTimestamp()
      });

      return downloadURL;
    } catch (error) {
      console.error('Error uploading document:', error);
      throw error;
    }
  },

  async getAllLegalInfo(empresaId: string): Promise<{
    datosFiscales: IEmpresa['datosFiscales'];
    documentosLegales: IEmpresa['documentosLegales'];
  }> {
    try {
      const docRef = doc(this.collections.empresas, empresaId);
      const docSnap = await getDoc(docRef);

      if (!docSnap.exists()) {
        throw new Error('Empresa not found');
      }

      const data = docSnap.data() as IEmpresa;
      return {
        datosFiscales: data.datosFiscales,
        documentosLegales: data.documentosLegales
      };
    } catch (error) {
      console.error('Error fetching legal info:', error);
      throw error;
    }
  },

  async validateLegalInfo(empresaId: string): Promise<{
    isValid: boolean;
    missingFields: string[];
    errors: string[];
  }> {
    try {
      const allInfo = await this.getAllLegalInfo(empresaId);
      const missingFields: string[] = [];
      const errors: string[] = [];

      // Validar datos fiscales
      if (!allInfo.datosFiscales.razonSocial) missingFields.push('razonSocial');
      if (!allInfo.datosFiscales.nit) missingFields.push('nit');
      if (!allInfo.datosFiscales.regimenTributario) missingFields.push('regimenTributario');
      if (!allInfo.datosFiscales.actividadEconomica) missingFields.push('actividadEconomica');

      // Validar documentos
      if (!allInfo.documentosLegales.rut) missingFields.push('rut');
      if (!allInfo.documentosLegales.camaraComercio) missingFields.push('camaraComercio');

      // Validaciones específicas
      if (allInfo.datosFiscales.nit && !/^\d{9,11}$/.test(allInfo.datosFiscales.nit)) {
        errors.push('NIT inválido');
      }

      return {
        isValid: missingFields.length === 0 && errors.length === 0,
        missingFields,
        errors
      };
    } catch (error) {
      console.error('Error validating legal info:', error);
      throw error;
    }
  }
};

export default restaurantLegalService;