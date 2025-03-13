// src/pages/authStore.js
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { movimientomostraridmoviporusuario } from '../Api/TaskCajaYmovimiento';
import { grupomostrarventa, productobuscar } from '../Api/TaskgrupoYproducto';
import { impresoramostrarseleccionada } from '../Api/TaskareaYimpresora'; 
import Pusher from 'pusher-js';
import { useEffect } from 'react';

// AUTHSTORE - Datos de autenticación
export const useAuthStore = create(
  persist(
    (set) => ({
      authData: [],
      setAuthData: (data) => set({ authData: data }),
      clearAuthData: () => set({ authData: [] })
    }),
    {
      name: 'auth-storage',
    }
  )
);

// MESA STORE
export const useidmesa = create(
  persist(
    (set) => ({
      tableId: null,
      setTableId: (id) => set({ tableId: id }),
      clearTableId: () => set({ tableId: null })
    }),
    {
      name: 'table-storage',
    }
  )
);

// CAJA STORE
export const useidcaja = create(
  persist(
    (set) => ({
      idcaja: null, // Corregido de tableId a idcaja
      setidcaja: (id) => set({ idcaja: id }),
      clearTableId: () => set({ idcaja: null })
    }),
    {
      name: 'table-storagecaja',
    }
  )
);

// SERIAL PC STORE
export const useserialPC = create(
  persist(
    (set, get) => ({
      serial: null,
      
      // Añade la función obtenerSerial directamente al store
      obtenerSerial: async () => {
        try {
          const response = await fetch('http://localhost:5075/api/get-serial');
          const data = await response.json();
          return data.serialNumber;
        } catch (error) {
          console.error('Error al obtener el serial:', error);
          return null;
        }
      },
      
      // Función que actualiza el serial después de obtenerlo
      cargarSerial: async () => {
        const serialPC = await get().obtenerSerial();
        if (serialPC) {
          set({ serial: serialPC });
        }
        return serialPC;
      },
      
      setserial: (id) => set({ serial: id }),
      clearTableId: () => set({ serial: null })
    }),
    {
      name: 'table-serialcaja',
    }
  )
);

// MOVIMIENTOS STORE
export const useMovimientosStore = create((set, get) => ({
  // Estado inicial
  movimientos: [],
  loading: false,
  error: null,
  
  // Cargar movimientos desde la API
  fetchMovimientos: async (idUsuario) => {
    set({ loading: true });
    try {
      const response = await movimientomostraridmoviporusuario({ id_usuario: idUsuario });
      console.log("data:", response.data);
      set({ 
        movimientos: response.data,
        loading: false 
      });
      return response.data;
    } catch (error) {
      set({ 
        error: "Error al cargar movimientos", 
        loading: false 
      });
      console.error(error);
    }
  },
  
  // Inicializar Pusher para escuchar actualizaciones en tiempo real
  setupPusher: (idUsuario) => {
    const pusher = new Pusher('a3742095fcd3fcdc48ab', {
      cluster: 'sa1',
      encrypted: true
    });
    
    // Suscribirnos al canal global "creditos-channel"
    const channel = pusher.subscribe('creditos-channel');
    
    // Escuchar por nuevos movimientos
    channel.bind('nuevo-movimiento', (nuevoMovimiento) => {
      set((state) => ({
        movimientos: [...state.movimientos, nuevoMovimiento]
      }));
    });
    
    // NUEVO: Escuchar apertura de caja
    channel.bind('abrir-movimiento', (data) => {
      console.log('Recibido evento abrir-movimiento:', data);
      // Actualizamos los movimientos con el nuevo ID de movimiento
      set({
        movimientos: { data: data.id_movi }
      });
    });
    
    // Escuchar por actualizaciones de movimientos
    channel.bind('actualizar-movimiento', (movimientoActualizado) => {
      set((state) => ({
        movimientos: state.movimientos.map(mov => 
          mov.id === movimientoActualizado.id ? movimientoActualizado : mov
        )
      }));
    });
    
    // Evento para cerrar movimiento - establecer movimientos a null
    channel.bind('cerrar-movimiento', (data) => {
      console.log('Recibido evento cerrar-movimiento:', data);
      // Establece movimientos a null para que isCerrarCajaDisabled sea true
      set({ movimientos: null });
    });
    
    // Devolver función para desuscribirse
    return () => {
      pusher.unsubscribe('creditos-channel');
    };
  }
}));

// IDVENTA STORE - IDs de venta para impresión
export const useIdVentaStore = create((set, get) => ({
  idVentas: [],             // Cola de IDs de venta pendientes de impresión
  processing: false,        // Estado de procesamiento actual
  printTrigger: 0,          // Contador para forzar actualización
  printSource: null,        // Origen de la solicitud de impresión (MenuComponent, etc.)
  
  // Añadir ID a la cola
  addIdVenta: (id) => {
    if (!id) return;
    
    set(state => {
      // No añadir si ya existe
      if (state.idVentas.includes(id)) return state;

      return {
        idVentas: [...state.idVentas, id],
        printTrigger: state.printTrigger + 1
      };
    });
  },
  
  // Remover ID de la cola
  removeIdVenta: (id) => {
    set(state => ({
      idVentas: state.idVentas.filter(item => item !== id)
    }));
  },
  
  // Establecer estado de procesamiento
  setProcessing: (isProcessing) => {
    set({ processing: isProcessing });
  },
  
  // Establecer fuente de impresión
  setPrintSource: (source) => {
    set({ printSource: source });
  },
  
  // Limpiar todos los valores
  clearAll: () => {
    set({
      idVentas: [],
      processing: false,
      printSource: null
    });
  }
}));

// GROUP STORE
const groupsCache = {};

export const useGroupStore = create((set, get) => ({
  // Estado inicial
  groups: [],
  selectedGroupId: null,
  loading: false,
  error: null,
  
  // Cargar grupos desde API
  fetchGroups: async (empresaId) => {
    if (!empresaId) return;
    
    // Si ya tenemos datos en caché, usarlos inmediatamente
    if (groupsCache[empresaId]) {
      set({ 
        groups: groupsCache[empresaId], 
        loading: false 
      });
      return;
    }
    
    try {
      set({ loading: true, error: null });
      
      const response = await grupomostrarventa({id: empresaId});
      
      if (response?.data?.data) {
        // Guardar en caché global
        groupsCache[empresaId] = response.data.data;
        
        // Actualizar estado
        set({ 
          groups: response.data.data,
          loading: false 
        });
      } else {
        throw new Error("No se recibieron datos válidos");
      }
    } catch (error) {
      console.error("Error en fetchGroups:", error);
      set({ error: 'Error al cargar grupos', loading: false });
    }
  },
  
  // Recargar todos los grupos (cuando llega notificación de Socket.IO)
  reloadGroups: async (empresaId) => {
    if (!empresaId) return;
    
    try {
      const response = await grupomostrarventa({id: empresaId});
      
      if (response?.data?.data) {
        // Guardar en caché global
        groupsCache[empresaId] = response.data.data;
        
        // Mantener selección actual
        const currentSelectedId = get().selectedGroupId;
        
        // Actualizar estado
        set({ 
          groups: response.data.data,
          selectedGroupId: currentSelectedId
        });
      }
    } catch (error) {
      console.error("Error en reloadGroups:", error);
    }
  },
  
  // Establecer grupo seleccionado
  setSelectedGroup: (groupId) => {
    set({ selectedGroupId: groupId });
  }
}));

// PRODUCT STORE
// Cache para productos



const productsCache = {};

// Clave para localStorage
const PRODUCTS_STORAGE_KEY = 'app_products_cache';
const PRODUCTS_TIMESTAMP_KEY = 'app_products_timestamp';

// Función para cargar datos de localStorage al inicio
const loadCachedData = () => {
  try {
    const cachedData = localStorage.getItem(PRODUCTS_STORAGE_KEY);
    const timestamp = localStorage.getItem(PRODUCTS_TIMESTAMP_KEY);
    
    if (cachedData) {
      const parsedData = JSON.parse(cachedData);
      
      // Restaurar caché en memoria desde localStorage
      Object.assign(productsCache, parsedData);
      
      console.log('Datos de productos cargados desde localStorage');
      return true;
    }
  } catch (error) {
    console.error('Error al cargar datos de localStorage:', error);
  }
  return false;
};

// Intenta cargar datos al inicio
loadCachedData();

// Función para guardar caché en localStorage
const saveCacheToStorage = () => {
  try {
    localStorage.setItem(PRODUCTS_STORAGE_KEY, JSON.stringify(productsCache));
    localStorage.setItem(PRODUCTS_TIMESTAMP_KEY, Date.now().toString());
    console.log('Caché de productos guardada en localStorage');
  } catch (error) {
    console.error('Error al guardar en localStorage:', error);
  }
};

// Product store optimizado para actualizaciones en tiempo real
export const useProductStore = create((set, get) => ({
  // Estado inicial
  products: [],
  filteredProducts: [],
  selectedProductId: null,
  loading: false,
  error: null,
  initialized: false,
  lastUpdated: null,
  currentSearchTerm: '', // Agregar esta propiedad para rastrear el término de búsqueda actual
  
  // Inicializar store (solo se ejecuta una vez)
  initialize: (empresaId) => {
    if (get().initialized) return;
    
    // Verificar si tenemos datos en caché
    if (productsCache[empresaId]) {
      set({ 
        products: productsCache[empresaId],
        initialized: true,
        lastUpdated: new Date(),
        loading: false
      });
      
      // Importante: Asegurarse de que filteredProducts esté actualizado
      const searchTerm = get().currentSearchTerm;
      if (searchTerm) {
        get().filterProducts(searchTerm);
      }
    }
  },
  
  // Cargar productos desde API solo si es necesario, preferir caché SIEMPRE
  fetchProducts: async (empresaId, forceUpdate = false) => {
    if (!empresaId) return;
    
    // IMPORTANTE: Nunca forzar actualización en recargas de página
    // Ignorar el parámetro forceUpdate y SIEMPRE usar caché si existe
    
    // Si ya tenemos datos en caché, usarlos inmediatamente SIEMPRE
    if (productsCache[empresaId]) {
      console.log('[ProductStore] Usando datos desde caché local');
      set({ 
        products: productsCache[empresaId], 
        loading: false,
        initialized: true,
        lastUpdated: new Date()
      });
      
      // Actualizar filtrados si hay un término de búsqueda activo
      const searchTerm = get().currentSearchTerm;
      if (searchTerm) {
        get().filterProducts(searchTerm);
      }
      
      return productsCache[empresaId];
    }
    
    // Si no hay datos en caché, entonces sí cargar desde API
    console.log('[ProductStore] Sin caché disponible, cargando desde API');
    try {
      set({ loading: true, error: null });
      
      const response = await productobuscar({id_empresa: empresaId});
      
      if (response?.data?.data) {
        // Guardar en caché global
        productsCache[empresaId] = response.data.data;
        
        // Guardar en localStorage
        saveCacheToStorage();
        
        // Actualizar estado
        set({ 
          products: response.data.data,
          loading: false,
          initialized: true,
          lastUpdated: new Date()
        });
        
        // Asegurarse de actualizar filtrados si hay búsqueda activa
        const searchTerm = get().currentSearchTerm;
        if (searchTerm) {
          get().filterProducts(searchTerm);
        }
        
        return response.data.data;
      } else {
        throw new Error("No se recibieron datos válidos");
      }
    } catch (error) {
      console.error("[ProductStore] Error en fetchProducts:", error);
      set({ error: 'Error al cargar productos', loading: false });
      return [];
    }
  },
  
  // Recargar todos los productos (SOLO cuando llega notificación de Socket.IO)
  reloadProducts: async (empresaId, shouldSkipUpdate = false) => {
    if (!empresaId) return Promise.reject(new Error('No hay empresaId'));
    
    console.log(`[ProductStore] reloadProducts llamado. shouldSkipUpdate: ${shouldSkipUpdate}`);
    
    // Si debemos omitir la actualización, solo actualizar timestamp
    if (shouldSkipUpdate) {
      console.log('[ProductStore] Omitiendo actualización desde API por flag');
      set({ lastUpdated: new Date() });
      return Promise.resolve(get().products); // Devolver productos actuales
    }
    
    // Si llegamos aquí, es porque es una actualización FORZADA por un evento Socket.IO
    console.log('[ProductStore] Ejecutando actualización desde API por EVENTO');
    
    try {
      // Mostrar estado de carga pero no bloquear la UI completamente
      set({ loading: true });
      
      // Llamar a la API para obtener productos actualizados
      const response = await productobuscar({
        id_empresa: empresaId
      });
      
      if (response?.data?.data) {
        console.log('[ProductStore] Datos recibidos de API:', response.data.data.length, 'productos');
        
        // Guardar en caché global
        productsCache[empresaId] = response.data.data;
        
        // Guardar en localStorage
        saveCacheToStorage();
        
        // Mantener selección actual
        const currentSelectedId = get().selectedProductId;
        
        // Actualizar estado
        set({ 
          products: response.data.data,
          selectedProductId: currentSelectedId,
          lastUpdated: new Date(),
          loading: false,
          error: null // Limpiar cualquier error previo
        });
        
        // IMPORTANTE: Siempre actualizar los productos filtrados después de recibir nuevos datos
        // incluso si no hay un término de búsqueda activo
        const searchTerm = get().currentSearchTerm;
        get().filterProducts(searchTerm);
        
        return Promise.resolve(response.data.data);
      } else {
        throw new Error('No se recibieron datos válidos de la API');
      }
    } catch (error) {
      console.error("[ProductStore] Error en reloadProducts:", error);
      
      // Establecer estado de error pero mantener los datos actuales
      set({ 
        loading: false, 
        error: 'Error al recargar productos: ' + (error.message || 'Desconocido')
      });
      
      return Promise.reject(error);
    }
  },
  
  // Filtrar productos por término de búsqueda
  filterProducts: (searchTerm) => {
    const { products } = get();
    
    // Guardar el término de búsqueda actual para poder usarlo en otros métodos
    set({ currentSearchTerm: searchTerm });
    
    if (!searchTerm) {
      set({ filteredProducts: [] });
      return;
    }
    
    const filtered = products.filter(product =>
      product.Descripcion && 
      product.Descripcion.toLowerCase().includes(searchTerm.toLowerCase())
    ).slice(0, 10); // Limitamos a 10 resultados
    
    set({ filteredProducts: filtered });
  },
  
  // Establecer producto seleccionado
  setSelectedProduct: (productId) => {
    set({ selectedProductId: productId });
  },
  
  // Seleccionar producto por ID
  selectProductById: (productId) => {
    const product = get().products.find(p => p.id_producto === productId);
    if (product) {
      set({ selectedProductId: productId });
      return product;
    }
    return null;
  },
  
  // Limpiar caché (útil para logout)
  clearCache: () => {
    Object.keys(productsCache).forEach(key => delete productsCache[key]);
    localStorage.removeItem(PRODUCTS_STORAGE_KEY);
    localStorage.removeItem(PRODUCTS_TIMESTAMP_KEY);
    set({ 
      products: [],
      filteredProducts: [],
      selectedProductId: null,
      initialized: false,
      currentSearchTerm: ''
    });
  }
}));



export const useImpresoraStore = create((set, get) => ({
  // Solo almacenamos la respuesta
  response: null,
  
  // Método que realiza la consulta y almacena la respuesta
  fetchImpresoraData: async (areaDeImpresion) => {
    try {
      // Obtener el serial desde el store existente
      const serialStore = useserialPC.getState();
      const Serial = await serialStore.obtenerSerial();
      
      // Llamar al endpoint
      const response = await impresoramostrarseleccionada({
        serial: Serial,
        nombre: areaDeImpresion
      });
      
      // Guardar solo la respuesta
      set({ response: response.data.data });
      
      return response.data.data;
    } catch (error) {
      console.error('Error:', error);
      return null;
    }
  }
}));

// Hook personalizado mínimo que encapsula el useEffect
export const useImpresoraInit = (areaDeImpresion) => {
  const fetchImpresoraData = useImpresoraStore(state => state.fetchImpresoraData);
  
  useEffect(() => {
    if (areaDeImpresion) {
      fetchImpresoraData(areaDeImpresion);
    }
  }, [areaDeImpresion]);
  
  // Solo retorna la respuesta
  return useImpresoraStore(state => state.response);
};