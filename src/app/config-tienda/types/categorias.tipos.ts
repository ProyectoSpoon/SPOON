export interface Subcategoria {
    id: string;
    nombre: string;
    productos: string[];
  }
  
  export interface Categoria {
    id: string;
    nombre: string;
    icono: string;
    subcategorias: Subcategoria[];
  }
  
  export const CATEGORIAS: Categoria[] = [
    {
      id: 'panaderia',
      nombre: 'Panadería y Pastelería',
      icono: '🥖',
      subcategorias: [
        {
          id: 'pasteles-tartas',
          nombre: '1. Pasteles y Tartas',
          productos: ['Pasteles de cumpleaños', 'Tartas de frutas', 'Cheesecake', 'Tarta de chocolate']
        },
        {
          id: 'reposteria-fina',
          nombre: '2. Repostería Fina',
          productos: ['Croissants', 'Eclairs', 'Galletas gourmet', 'Macarrones']
        },
        {
          id: 'postres-individuales',
          nombre: '3. Postres Individuales',
          productos: ['Cupcakes', 'Brownies', 'Donas', 'Muffins']
        },
        {
          id: 'empanadas-bollos',
          nombre: '4. Empanadas y Bollos Salados',
          productos: ['Empanadas de jamón y queso', 'Bollos de carne', 'Panes rellenos']
        },
        {
          id: 'bebidas-calientes',
          nombre: '5. Bebidas Calientes',
          productos: ['Café', 'Chocolate caliente', 'Té']
        },
        {
          id: 'bebidas-frias',
          nombre: '6. Bebidas Frías',
          productos: ['Jugos naturales', 'Refrescos', 'Agua embotellada']
        }
      ]
    },
    {
      id: 'comida-rapida',
      nombre: 'Comida Rápida (Local y Calle)',
      icono: '🍔',
      subcategorias: [
        {
          id: 'hamburguesas',
          nombre: '1. Hamburguesas',
          productos: ['Hamburguesa clásica', 'Con queso', 'Doble carne', 'Vegetariana', 'Especialidades de la casa']
        },
        {
          id: 'perros-calientes',
          nombre: '2. Perros Calientes',
          productos: ['Clásicos', 'Con queso', 'Con chili', 'Con tocino', 'Especialidades locales']
        },
        {
          id: 'tacos',
          nombre: '3. Tacos',
          productos: ['Tacos de carne asada', 'Al pastor', 'De pollo', 'Vegetarianos']
        },
        {
          id: 'pasteles',
          nombre: '4. Pasteles',
          productos: ['De pollo', 'De jamón', 'De milanesa', 'De pierna', 'De chorizo', 'De huevo']
        },
        {
          id: 'burritos-quesadillas',
          nombre: '5. Burritos y Quesadillas',
          productos: ['Burritos de carne', 'De pollo', 'Vegetarianos', 'Quesadillas simples', 'Quesadillas rellenas']
        },
        {
          id: 'sandwiches-wraps',
          nombre: '6. Sándwiches y Wraps',
          productos: ['Sándwich de jamón y queso', 'De pollo', 'Vegetarianos', 'Wraps de ensalada']
        },
        {
          id: 'pizzas',
          nombre: '7. Pizzas por Porción o Enteras',
          productos: ['Margherita', 'Pepperoni', 'Hawaiana', 'Vegetariana', 'Especial de la casa']
        },
        {
          id: 'pollo-frito',
          nombre: '8. Pollo Frito y Nuggets',
          productos: ['Piezas de pollo frito', 'Nuggets de pollo', 'Alitas de pollo en diferentes salsas']
        },
        {
          id: 'papas-snacks',
          nombre: '9. Papas Fritas y Snacks',
          productos: ['Papas a la francesa', 'Aros de cebolla', 'Nachos con queso', 'Papas en espiral']
        },
        {
          id: 'bebidas',
          nombre: '10. Bebidas y Acompañamientos',
          productos: ['Refrescos', 'Jugos', 'Agua', 'Malteadas', 'Batidos']
        },
        {
          id: 'dulces-postres',
          nombre: '11. Dulces y Postres Rápidos',
          productos: ['Helados', 'Conos de nieve', 'Paletas', 'Churros', 'Flan', 'Pudín']
        }
      ]
    }
  ];