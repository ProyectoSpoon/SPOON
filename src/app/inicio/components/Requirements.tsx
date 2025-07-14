// /app/inicio/components/Requirements.tsx
import { motion } from 'framer-motion';
import { ScrollReveal } from '@/shared/components/ui/Animated';
import Image from 'next/image';

const requirements = [
 {
   image: "/images/requerimiento 1.png",
   title: "Documentos",
   description: "Documentos legales del restaurante",
 },
 {
   image: "/images/requerimiento 2.png",
   title: "Menú",
   description: "Carta actualizada de productos",
 },
 {
   image: "/images/requerimiento 3.png",
   title: "Logo",
   description: "Logo en alta calidad",
 },
 {
   image: "/images/requerimiento 4.png",
   title: "Fotos",
   description: "Fotos del local y productos",
 }
];

export const Requirements = () => {
 return (
   <section className="py-32 bg-white relative overflow-hidden">
     <div className="container mx-auto px-6 relative">
       <ScrollReveal>
         <h2 className="text-4xl font-bold text-neutral-900 text-center mb-4">
           Requisitos para empezar
         </h2>
         <p className="text-lg text-neutral-600 text-center max-w-2xl mx-auto mb-16">
           Todo lo que necesitas para comenzar a brillar en digital
         </p>
       </ScrollReveal>

       <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-6xl mx-auto">
         {requirements.map((req, index) => (
           <ScrollReveal
             key={index}
             delay={index * 0.1}
           >
             <div className="bg-white border border-neutral-200 rounded-2xl overflow-hidden">
               {/* Contenedor de imagen con aspect-ratio fijo */}
               <div className="relative w-full aspect-[4/3]">
                 <Image
                   src={req.image}
                   alt={req.title}
                   fill
                   className="object-cover"
                 />
               </div>
               
               {/* Contenido centrado */}
               <div className="p-6 text-center">
                 <h3 className="text-xl font-bold text-neutral-900 mb-2">
                   {req.title}
                 </h3>
                 <p className="text-neutral-600">
                   {req.description}
                 </p>
               </div>
             </div>
           </ScrollReveal>
         ))}
       </div>
     </div>
   </section>
 );
};



























