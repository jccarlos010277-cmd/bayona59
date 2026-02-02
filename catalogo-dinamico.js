// catálogo-dinamico.js - Versión que carga desde Google Sheets
// Sistema híbrido: primero intenta Sheets, si falla usa catalogo.js local

const CatalogoDinamico = {
  // 🔴 REEMPLAZA ESTE ENLACE POR EL TUYO
  sheetURL: 'https://docs.google.com/spreadsheets/d/e/2PACX-1vT2RBATNCTKwgP7EYeiG0Od16zAgR0mrnsxKBITDvaX62a47l0AyGF-isufaRs6Ayk5hXWI3j_jAHeu/pub?output=csv',
  
  // Catálogo en memoria
  productos: [],
  categorias: [],
  cargado: false,
  
  // ==================== INICIALIZACIÓN PRINCIPAL ====================
  inicializar: function() {
    console.log('🔄 Inicializando catálogo dinámico...');
    
    // 1. Primero intentar desde caché (si existe)
    if (this.cargarDesdeCache()) {
      console.log('✅ Catálogo cargado desde caché local');
      this.cargado = true;
      this.despacharEventoCarga();
      this.iniciarAutoRefresco();
      return;
    }
    
    // 2. Si no hay caché, cargar desde Google Sheets
    this.cargarDesdeSheets()
      .then(() => {
        console.log('✅ Catálogo cargado desde Google Sheets:', this.productos.length, 'productos');
        this.guardarEnCache();
        this.cargado = true;
        this.generarCategorias();
        this.despacharEventoCarga();
        this.iniciarAutoRefresco();
      })
      .catch((error) => {
        console.warn('⚠️ No se pudo cargar desde Sheets. Usando catálogo local...', error);
        this.usarRespaldoLocal();
      });
  },
  
  // ==================== CARGAR DESDE GOOGLE SHEETS ====================
  cargarDesdeSheets: function() {
    return new Promise((resolve, reject) => {
      const urlConTimestamp = this.sheetURL + '&t=' + Date.now();
      
      fetch(urlConTimestamp)
        .then(response => {
          if (!response.ok) {
            throw new Error('Error HTTP: ' + response.status);
          }
          return response.text();
        })
        .then(csvText => {
          this.procesarCSV(csvText);
          resolve();
        })
        .catch(error => {
          console.error('❌ Error cargando desde Sheets:', error);
          reject(error);
        });
    });
  },
  
  // ==================== PROCESAR CSV ====================
  procesarCSV: function(csvText) {
    this.productos = [];
    
    const lineas = csvText.split('\n').filter(linea => linea.trim() !== '');
    if (lineas.length < 2) {
      throw new Error('CSV vacío o sin datos');
    }
    
    const encabezados = lineas[0].split(',').map(h => h.trim().toLowerCase());
    
    const idxId = encabezados.indexOf('id');
    const idxNombre = encabezados.indexOf('nombre');
    const idxCategoria = encabezados.indexOf('categoria');
    const idxPrecio = encabezados.indexOf('precio');
    const idxImagen = encabezados.indexOf('imagen');
    const idxDescripcion = encabezados.indexOf('descripcion');
    const idxStock = encabezados.indexOf('stock');
    const idxActivo = encabezados.indexOf('activo');
    const idxOrden = encabezados.indexOf('orden');
    
    for (let i = 1; i < lineas.length; i++) {
      const valores = this.parsearLineaCSV(lineas[i]);
      if (valores.length < 5) continue;
      
      const producto = {
        id: parseInt(valores[idxId]) || i,
        name: valores[idxNombre] || 'Sin nombre',
        price: parseInt(valores[idxPrecio]) || 0,
        image: valores[idxImagen] || 'https://via.placeholder.com/300',
        description: valores[idxDescripcion] || 'Descripción no disponible',
        specificDetails: valores[idxDescripcion] || 'Detalles no disponibles',
        category: valores[idxCategoria] || 'Sin categoría',
        department: 'mercado',
        status: (valores[idxActivo] === 'TRUE' && (parseInt(valores[idxStock]) > 0)) 
                ? 'available' : 'unavailable',
        orden: parseInt(valores[idxOrden]) || i
      };
      
      if (producto.status === 'available') {
        this.productos.push(producto);
      }
    }
    
    // Ordenar por el campo 'orden'
    this.productos.sort((a, b) => a.orden - b.orden);
    
    console.log(`📊 Procesados ${this.productos.length} productos activos`);
  },
  
  // ==================== PARSER CSV AVANZADO ====================
  parsearLineaCSV: function(linea) {
    const valores = [];
    let dentroDeComillas = false;
    let valorActual = '';
    
    for (let i = 0; i < linea.length; i++) {
      const char = linea[i];
      
      if (char === '"') {
        dentroDeComillas = !dentroDeComillas;
      } else if (char === ',' && !dentroDeComillas) {
        valores.push(valorActual.trim());
        valorActual = '';
      } else {
        valorActual += char;
      }
    }
    
    valores.push(valorActual.trim());
    return valores;
  },
  
  // ==================== SISTEMA DE CACHÉ ====================
  guardarEnCache: function() {
    try {
      const cacheData = {
        productos: this.productos,
        categorias: this.categorias,
        timestamp: Date.now(),
        version: '1.0'
      };
      localStorage.setItem('catalogoCache_Bayona59', JSON.stringify(cacheData));
      console.log('💾 Catálogo guardado en caché local');
    } catch (e) {
      console.warn('No se pudo guardar en caché:', e);
    }
  },
  
  cargarDesdeCache: function() {
    try {
      const cache = localStorage.getItem('catalogoCache_Bayona59');
      if (!cache) return false;
      
      const data = JSON.parse(cache);
      if (Date.now() - data.timestamp < 7200000) { // 2 horas
        this.productos = data.productos || [];
        this.categorias = data.categorias || [];
        console.log('💿 Catálogo recuperado desde caché');
        return true;
      } else {
        console.log('⏰ Caché expirado, recargando...');
        localStorage.removeItem('catalogoCache_Bayona59');
      }
    } catch (e) {
      console.warn('Caché corrupto, eliminando...', e);
      localStorage.removeItem('catalogoCache_Bayona59');
    }
    return false;
  },
  
  // ==================== RESPALDO LOCAL ====================
  usarRespaldoLocal: function() {
    if (window.catalogo && window.catalogo.productos) {
      this.productos = window.catalogo.obtenerDisponiblesPorDepartamento('mercado');
      this.cargado = true;
      this.generarCategorias();
      this.despacharEventoCarga();
      console.log('🔄 Usando catálogo local como respaldo');
    } else {
      console.error('❌ No hay catálogo local disponible');
    }
  },
  
  // ==================== CATEGORÍAS ====================
  generarCategorias: function() {
    const cats = new Set();
    this.productos.forEach(p => {
      if (p.category && p.category.trim() !== '') {
        cats.add(p.category);
      }
    });
    this.categorias = Array.from(cats).sort();
  },
  
  // ==================== AUTO-REFRESCO ====================
  iniciarAutoRefresco: function() {
    setInterval(() => {
      if (document.visibilityState === 'visible') {
        console.log('🔄 Actualizando catálogo automáticamente...');
        this.cargarDesdeSheets()
          .then(() => {
            this.guardarEnCache();
            this.generarCategorias();
            window.dispatchEvent(new CustomEvent('catalogoActualizado', {
              detail: { productos: this.productos, categorias: this.categorias }
            }));
            console.log('✅ Catálogo actualizado desde Sheets');
          })
          .catch(err => console.log('No se pudo actualizar automáticamente:', err));
      }
    }, 600000); // 10 minutos
  },
  
  // ==================== EVENTOS ====================
  despacharEventoCarga: function() {
    const event = new CustomEvent('catalogoCargado', {
      detail: { 
        productos: this.productos,
        categorias: this.categorias,
        fuente: this.cargado ? 'sheets' : 'local',
        timestamp: Date.now()
      }
    });
    window.dispatchEvent(event);
  },
  
  // ==================== MÉTODOS DE CONSULTA ====================
  obtenerPorId: function(id) {
    return this.productos.find(p => p.id === id);
  },
  
  obtenerPorCategoria: function(categoria) {
    return this.productos.filter(p => p.category === categoria);
  },
  
  obtenerTodos: function() {
    return this.productos;
  },
  
  obtenerCategorias: function() {
    return this.categorias;
  },
  
  buscarProductos: function(termino) {
    const busqueda = termino.toLowerCase();
    return this.productos.filter(p => 
      p.name.toLowerCase().includes(busqueda) || 
      p.description.toLowerCase().includes(busqueda) ||
      p.category.toLowerCase().includes(busqueda)
    );
  }
};

// Inicializar automáticamente cuando se carga el script
(function() {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function() {
      CatalogoDinamico.inicializar();
    });
  } else {
    CatalogoDinamico.inicializar();
  }
})();

// Hacer disponible globalmente
window.CatalogoDinamico = CatalogoDinamico;