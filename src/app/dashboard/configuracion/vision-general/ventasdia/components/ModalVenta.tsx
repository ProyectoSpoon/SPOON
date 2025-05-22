import React, { useState, useMemo, useEffect } from 'react';
import { PlusCircle, X, Heart, ChevronUp, ChevronDown, Loader2 } from 'lucide-react';
import type { Plato, Producto } from '../types/ventasdia.types';
import { useSalePreferences } from '../hooks/useSalePreferences';
import {useKeyboardShortcuts} from '../hooks/useKeyboardShortcuts';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';

interface ModalVentaProps {
 plato: Plato;
 productosAdicionales: Producto[];
 onClose: () => void;
 onConfirm: (platoId: string, cantidad: number, adicionales: { productoId: string, cantidad: number }[]) => Promise<boolean>;
 userId: string;
}

export const ModalVenta: React.FC<ModalVentaProps> = ({ 
 plato, 
 productosAdicionales,
 onClose, 
 onConfirm,
 userId 
}) => {
 const { preferences, updatePreferences } = useSalePreferences(userId);
 const [adicionales, setAdicionales] = useState<Array<{ productoId: string, cantidad: number }>>([]);
 const [productoSeleccionado, setProductoSeleccionado] = useState<string>('');
 const [cantidad, setCantidad] = useState(preferences?.defaultQuantity || 1);
 const [isProcessing, setIsProcessing] = useState(false);

 useKeyboardShortcuts({
   'Enter': () => handleConfirmar(),
   'Escape': onClose,
   '+': () => setCantidad(prev => prev + 1),
   '-': () => setCantidad(prev => Math.max(1, prev - 1)),
   'f': () => setProductoSeleccionado(preferences?.favoriteAddons[0] || ''),
   'Tab': () => document.getElementById('adicionales-select')?.focus(),
 });

 const sugerencias = useMemo(() => {
   if (!preferences?.lastUsedAddons) return [];
   return productosAdicionales
     .filter(p => preferences.lastUsedAddons.includes(p.id))
     .slice(0, 3);
 }, [productosAdicionales, preferences?.lastUsedAddons]);

 const calcularTotal = useMemo(() => {
   const precioBase = plato.precio * cantidad;
   const precioAdicionales = adicionales.reduce((total, adicional) => {
     const producto = productosAdicionales.find(p => p.id === adicional.productoId);
     return total + ((producto?.precio || 0) * adicional.cantidad);
   }, 0);
   return precioBase + precioAdicionales;
 }, [plato.precio, cantidad, adicionales, productosAdicionales]);

 const handleAgregarAdicional = () => {
   if (productoSeleccionado) {
     setAdicionales(prev => {
       const existe = prev.find(a => a.productoId === productoSeleccionado);
       if (existe) {
         return prev.map(a => 
           a.productoId === productoSeleccionado 
             ? { ...a, cantidad: a.cantidad + 1 }
             : a
         );
       }
       
       // Actualizar historial de uso
       const newLastUsed = [
         productoSeleccionado,
         ...(preferences?.lastUsedAddons || []).filter(id => id !== productoSeleccionado)
       ].slice(0, 10);
       
       updatePreferences({ lastUsedAddons: newLastUsed });
       
       return [...prev, { productoId: productoSeleccionado, cantidad: 1 }];
     });
     setProductoSeleccionado('');
   }
 };

 const handleQuitarAdicional = (productoId: string) => {
   setAdicionales(prev => prev.filter(a => a.productoId !== productoId));
 };

 const handleCambiarCantidad = (productoId: string, nuevaCantidad: number) => {
   if (nuevaCantidad > 0) {
     setAdicionales(prev => 
       prev.map(a => 
         a.productoId === productoId 
           ? { ...a, cantidad: nuevaCantidad }
           : a
       )
     );
   }
 };

 const toggleFavorite = (productoId: string) => {
   const newFavorites = preferences?.favoriteAddons.includes(productoId)
     ? preferences.favoriteAddons.filter(id => id !== productoId)
     : [...(preferences?.favoriteAddons || []), productoId];
   updatePreferences({ favoriteAddons: newFavorites });
 };

 const agregarSugerencia = (productoId: string) => {
   setAdicionales(prev => ([
     ...prev,
     { productoId, cantidad: 1 }
   ]));
 };

 const handleConfirmar = async () => {
   try {
     setIsProcessing(true);
     const resultado = await onConfirm(plato.id, cantidad, adicionales);
     
     // Guardar cantidad como preferencia
     updatePreferences({ defaultQuantity: cantidad });
     
     if (resultado) {
       toast.success('¡Venta registrada correctamente!');
       onClose();
     } else {
       toast.error('Error al registrar la venta');
     }
     
   } catch (error) {
     console.error('Error al confirmar venta:', error);
     toast.error('Error al procesar la venta');
   } finally {
     setIsProcessing(false);
   }
 };

 return (
   <motion.div 
     initial={{ opacity: 0 }}
     animate={{ opacity: 1 }}
     exit={{ opacity: 0 }}
     className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
   >
     <motion.div 
       initial={{ scale: 0.9, opacity: 0 }}
       animate={{ scale: 1, opacity: 1 }}
       className={`bg-white rounded-lg w-full max-w-md shadow-xl ${preferences?.compactMode ? 'p-3' : 'p-6'}`}
     >
       <div className="flex justify-between items-start mb-4">
         <h2 className="text-lg font-semibold">Registrar Venta</h2>
         <button 
           onClick={onClose}
           className="text-neutral-400 hover:text-neutral-600"
         >
           <X className="w-5 h-5" />
         </button>
       </div>
       
       <div className="space-y-6">
         {/* Detalles del plato principal con cantidad */}
         <div className="bg-neutral-50 p-4 rounded-lg">
           <div className="flex justify-between items-start">
             <div>
               <h3 className="font-medium text-sm">{plato.nombre}</h3>
               <p className="text-sm text-neutral-600 mt-1">{plato.descripcion}</p>
             </div>
             <div className="flex items-center space-x-2">
               <button
                 onClick={() => setCantidad(prev => Math.max(1, prev - 1))}
                 className="p-1 hover:bg-white rounded"
               >
                 <ChevronDown className="w-4 h-4" />
               </button>
               <input
                 type="number"
                 value={cantidad}
                 onChange={(e) => setCantidad(Math.max(1, parseInt(e.target.value) || 1))}
                 className="w-16 text-center bg-white border rounded p-1"
                 min="1"
               />
               <button
                 onClick={() => setCantidad(prev => prev + 1)}
                 className="p-1 hover:bg-white rounded"
               >
                 <ChevronUp className="w-4 h-4" />
               </button>
             </div>
           </div>
           <p className="text-[#F4821F] font-semibold mt-2">
             ${(plato.precio * cantidad).toLocaleString()}
           </p>
         </div>

         {/* Sugerencias */}
         {sugerencias.length > 0 && (
           <div className="space-y-2">
             <h4 className="text-sm font-medium">Sugerencias</h4>
             <div className="flex flex-wrap gap-2">
               {sugerencias.map(producto => (
                 <button
                   key={producto.id}
                   onClick={() => agregarSugerencia(producto.id)}
                   className="px-3 py-1 text-sm bg-neutral-100 hover:bg-neutral-200 rounded-full flex items-center gap-1"
                 >
                   <span>{producto.nombre}</span>
                   {preferences?.favoriteAddons.includes(producto.id) && (
                     <Heart className="w-3 h-3 text-[#F4821F]" fill="#F4821F" />
                   )}
                 </button>
               ))}
             </div>
           </div>
         )}

         {/* Selector de adicionales */}
         {productosAdicionales.length > 0 && (
           <div className="space-y-3">
             <h4 className="text-sm font-medium">Agregar Adicionales</h4>
             <div className="flex gap-2">
               <select
                 id="adicionales-select"
                 value={productoSeleccionado}
                 onChange={(e) => setProductoSeleccionado(e.target.value)}
                 className="flex-1 px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-[#F4821F] focus:border-[#F4821F]"
               >
                 <option value="">Seleccionar adicional...</option>
                 {productosAdicionales
                   .filter(p => p.disponible)
                   .map(producto => (
                     <option key={producto.id} value={producto.id}>
                       {producto.nombre} - ${producto.precio.toLocaleString()}
                       {preferences?.favoriteAddons.includes(producto.id) ? ' ★' : ''}
                     </option>
                 ))}
               </select>
               <button
                 onClick={() => productoSeleccionado && toggleFavorite(productoSeleccionado)}
                 className="p-2 text-neutral-400 hover:text-[#F4821F] rounded-lg"
                 disabled={!productoSeleccionado}
               >
                 <Heart 
                   className="w-5 h-5" 
                   fill={preferences?.favoriteAddons.includes(productoSeleccionado) ? '#F4821F' : 'none'} 
                 />
               </button>
               <button
                 onClick={handleAgregarAdicional}
                 disabled={!productoSeleccionado}
                 className="p-2 text-[#F4821F] hover:bg-[#FFF4E6] rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
               >
                 <PlusCircle className="w-6 h-6" />
               </button>
             </div>
           </div>
         )}

         {/* Lista de adicionales seleccionados */}
         <AnimatePresence>
           {adicionales.length > 0 && (
             <motion.div 
               initial={{ opacity: 0, height: 0 }}
               animate={{ opacity: 1, height: 'auto' }}
               exit={{ opacity: 0, height: 0 }}
               className="space-y-2"
             >
               {adicionales.map(adicional => {
                 const producto = productosAdicionales.find(p => p.id === adicional.productoId);
                 if (!producto) return null;

                 return (
                   <motion.div
                     key={adicional.productoId}
                     initial={{ opacity: 0, x: -20 }}
                     animate={{ opacity: 1, x: 0 }}
                     exit={{ opacity: 0, x: 20 }}
                     className="flex items-center justify-between bg-neutral-50 p-3 rounded-lg"
                   >
                     <div className="flex-1">
                       <p className="text-sm font-medium">{producto.nombre}</p>
                       <p className="text-sm text-[#F4821F]">
                         ${(producto.precio * adicional.cantidad).toLocaleString()}
                       </p>
                     </div>
                     <div className="flex items-center gap-3">
                       <div className="flex items-center gap-2">
                         <button
                           onClick={() => handleCambiarCantidad(adicional.productoId, adicional.cantidad - 1)}
                           className="w-8 h-8 flex items-center justify-center text-neutral-400 hover:text-neutral-600 hover:bg-neutral-100 rounded"
                         >
                           -
                         </button>
                         <span className="text-sm font-medium w-8 text-center">
                           {adicional.cantidad}
                         </span>
                         <button
                           onClick={() => handleCambiarCantidad(adicional.productoId, adicional.cantidad + 1)}
                           className="w-8 h-8 flex items-center justify-center text-neutral-400 hover:text-neutral-600 hover:bg-neutral-100 rounded"
                         >
                           +
                         </button>
                       </div>
                       <button
                         onClick={() => handleQuitarAdicional(adicional.productoId)}
                         className="p-1 text-red-500 hover:text-red-600 hover:bg-red-50 rounded"
                       >
                         <X className="w-4 h-4" />
                       </button>
                     </div>
                   </motion.div>
                 );
               })}
             </motion.div>
           )}
         </AnimatePresence>

         {/* Total */}
         <div className="pt-4 border-t">
           <div className="flex justify-between items-center">
             <span className="text-sm font-medium">Total</span>
             <span className="text-xl font-bold text-[#F4821F]">
               ${calcularTotal.toLocaleString()}
             </span>
           </div>
         </div>

          {/* Botones de acción */}
          <div className="flex gap-3">
            <button
              className="flex-1 px-4 py-2 bg-[#F4821F] text-white text-sm rounded-lg hover:bg-[#CC6A10] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
              onClick={handleConfirmar}
              disabled={isProcessing}
            >
              {isProcessing ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Procesando...
                </>
              ) : (
                'Confirmar Venta (Enter)'
              )}
            </button>
            <button
              className="px-4 py-2 border text-sm rounded-lg hover:bg-neutral-50"
              onClick={onClose}
            >
              Cancelar (Esc)
            </button>
          </div>

         {/* Atajos de teclado */}
         <div className="text-xs text-gray-500 pt-4 border-t">
           <span className="block">Atajos: Enter - Confirmar | Esc - Cancelar | +/- - Ajustar cantidad</span>
           <span className="block">Tab - Seleccionar adicional | F - Adicional favorito</span>
         </div>
       </div>
     </motion.div>
   </motion.div>
 );
};
