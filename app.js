// app.js - Cerebro principal de la tienda
const TiendaApp = {
    // Configuración
    config: {
        carritoStorageKey: 'carrito_bayona59',
        moneda: '$',
        whatsappNumero: '+53512345678',
        whatsappMensaje: 'Hola, me gustaría hacer un pedido de Bodegón Bayona 59:'
    },

    // Estado
    estado: {
        carrito: [],
        catalogo: [],
        categorias: [],
        filtroCategoria: 'todas',
        departamentoActual: 'mercado'
    },

    // ==================== INICIALIZACIÓN ====================
    inicializar: function() {
        console.log('🛒 Inicializando tienda Bodegón Bayona 59...');
        
        // 1. Configurar navegación móvil
        this.configurarNavegacionMovil();
        
        // 2. Cargar carrito desde localStorage
        this.cargarCarrito();
        
        // 3. Inicializar catálogo dinámico
        this.inicializarCatalogo();
        
        // 4. Configurar event listeners
        this.configurarEventListeners();
        
        // 5. Inicializar animaciones scroll
        this.inicializarAnimacionesScroll();
        
        // 6. Inicializar contadores
        this.inicializarContadores();
        
        // 7. Mostrar productos iniciales
        this.mostrarProductosDepartamento('mercado');
    },

    // ==================== NAVEGACIÓN MÓVIL ====================
    configurarNavegacionMovil: function() {
        const mobileMenuBtn = document.getElementById('mobileMenuBtn');
        const navLinks = document.getElementById('navLinks');
        
        if (mobileMenuBtn && navLinks) {
            mobileMenuBtn.addEventListener('click', function() {
                navLinks.classList.toggle('active');
                this.innerHTML = navLinks.classList.contains('active') 
                    ? '<i class="fas fa-times"></i>' 
                    : '<i class="fas fa-bars"></i>';
            });
            
            // Cerrar menú al hacer clic en enlace
            document.querySelectorAll('.nav-links a').forEach(link => {
                link.addEventListener('click', function() {
                    if (window.innerWidth <= 768) {
                        navLinks.classList.remove('active');
                        mobileMenuBtn.innerHTML = '<i class="fas fa-bars"></i>';
                    }
                });
            });
        }
    },

    // ==================== ANIMACIONES ====================
    inicializarAnimacionesScroll: function() {
        const elementosAnimar = document.querySelectorAll('.animate-on-scroll');
        
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('visible');
                }
            });
        }, {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        });
        
        elementosAnimar.forEach(elemento => observer.observe(elemento));
    },

    inicializarContadores: function() {
        const contadores = document.querySelectorAll('.stat-num');
        
        if (!contadores.length) return;
        
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const contador = entry.target;
                    const valorFinal = parseInt(contador.getAttribute('data-count'));
                    this.animarContador(contador, valorFinal);
                    observer.unobserve(contador);
                }
            });
        }, { threshold: 0.5 });
        
        contadores.forEach(contador => observer.observe(contador));
    },

    animarContador: function(elemento, valorFinal) {
        let valorActual = 0;
        const incremento = valorFinal / 100;
        const velocidad = valorFinal > 100 ? 20 : 30;
        
        const timer = setInterval(() => {
            valorActual += incremento;
            if (valorActual >= valorFinal) {
                elemento.textContent = valorFinal;
                clearInterval(timer);
            } else {
                elemento.textContent = Math.floor(valorActual);
            }
        }, velocidad);
    },

    // ==================== CATÁLOGO DINÁMICO ====================
    inicializarCatalogo: function() {
        window.addEventListener('catalogoCargado', (event) => {
            console.log('✅ Catálogo cargado desde:', event.detail.fuente);
            this.estado.catalogo = event.detail.productos;
            this.estado.categorias = event.detail.categorias;
            
            this.actualizarFiltrosCategorias();
            this.mostrarProductosDepartamento(this.estado.departamentoActual);
        });
        
        window.addEventListener('catalogoActualizado', (event) => {
            console.log('🔄 Catálogo actualizado');
            this.estado.catalogo = event.detail.productos;
            this.estado.categorias = event.detail.categorias;
            
            if (this.estado.departamentoActual === 'mercado') {
                this.mostrarProductosDepartamento('mercado');
            }
        });
        
        if (window.CatalogoDinamico) {
            window.CatalogoDinamico.inicializar();
        }
    },

    // ==================== MOSTRAR PRODUCTOS ====================
    mostrarProductosDepartamento: function(departamento) {
        this.estado.departamentoActual = departamento;
        this.estado.filtroCategoria = 'todas';
        
        let productosMostrar = [];
        
        if (departamento === 'mercado') {
            if (this.estado.catalogo && this.estado.catalogo.length > 0) {
                productosMostrar = this.estado.catalogo;
            } else {
                productosMostrar = window.catalogo ? 
                    window.catalogo.obtenerDisponiblesPorDepartamento('mercado') : [];
            }
        } else {
            productosMostrar = window.catalogo ? 
                window.catalogo.obtenerPorDepartamento(departamento) : [];
        }
        
        this.generarHTMLProductos(productosMostrar, departamento);
        this.actualizarContadorProductos(productosMostrar.length);
        
        // Actualizar navegación activa
        document.querySelectorAll('.nav-departamento').forEach(btn => {
            btn.classList.remove('activo');
        });
        document.querySelector(`.nav-departamento[data-departamento="${departamento}"]`)?.classList.add('activo');
    },

    generarHTMLProductos: function(productos, departamento) {
        const contenedor = document.getElementById('productos-container');
        if (!contenedor) return;
        
        if (productos.length === 0) {
            contenedor.innerHTML = `
                <div class="no-productos">
                    <i class="fas fa-box-open"></i>
                    <h3>No hay productos disponibles</h3>
                    <p>Pronto tendremos más productos en esta categoría.</p>
                </div>
            `;
            return;
        }
        
        let html = '';
        
        productos.forEach(producto => {
            const disponible = producto.status === 'available';
            const precio = producto.price > 0 ? 
                `${this.config.moneda}${producto.price.toLocaleString()}` : 
                'Próximamente';
            
            html += `
                <div class="producto-card ${!disponible ? 'proximamente' : ''}">
                    <div class="producto-img">
                        <img src="${producto.image}" alt="${producto.name}" loading="lazy">
                        ${!disponible ? '<span class="producto-badge proximo">Próximo</span>' : ''}
                        ${producto.category && departamento === 'mercado' ? 
                          `<span class="producto-categoria">${producto.category}</span>` : ''}
                    </div>
                    <div class="producto-info">
                        <h3>${producto.name}</h3>
                        <p class="producto-desc">${producto.description}</p>
                        <div class="producto-detalles">
                            <span class="producto-especifico">${producto.specificDetails || ''}</span>
                            <div class="producto-precio">${precio}</div>
                        </div>
                        ${disponible && producto.price > 0 ? `
                            <button class="btn-agregar" 
                                    data-id="${producto.id}" 
                                    data-nombre="${producto.name}" 
                                    data-precio="${producto.price}">
                                <i class="fas fa-plus"></i> Añadir al carrito
                            </button>
                        ` : `
                            <button class="btn-proximo" disabled>
                                <i class="fas fa-clock"></i> Próximamente
                            </button>
                        `}
                    </div>
                </div>
            `;
        });
        
        contenedor.innerHTML = html;
        this.configurarBotonesProductos();
    },

    // ==================== FILTROS ====================
    actualizarFiltrosCategorias: function() {
        const filtroContainer = document.getElementById('filtro-categorias');
        if (!filtroContainer || this.estado.departamentoActual !== 'mercado') {
            filtroContainer.style.display = 'none';
            return;
        }
        
        filtroContainer.style.display = 'flex';
        
        if (!this.estado.categorias || this.estado.categorias.length === 0) {
            filtroContainer.innerHTML = '';
            return;
        }
        
        let html = `
            <button class="filtro-cat ${this.estado.filtroCategoria === 'todas' ? 'activo' : ''}" 
                    data-categoria="todas">
                Todos
            </button>
        `;
        
        this.estado.categorias.forEach(categoria => {
            html += `
                <button class="filtro-cat ${this.estado.filtroCategoria === categoria ? 'activo' : ''}" 
                        data-categoria="${categoria}">
                    ${categoria}
                </button>
            `;
        });
        
        filtroContainer.innerHTML = html;
        
        document.querySelectorAll('.filtro-cat').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const categoria = e.target.getAttribute('data-categoria');
                this.estado.filtroCategoria = categoria;
                
                // Filtrar productos
                let productosFiltrados = [];
                if (this.estado.catalogo && this.estado.catalogo.length > 0) {
                    productosFiltrados = this.estado.catalogo;
                } else {
                    productosFiltrados = window.catalogo ? 
                        window.catalogo.obtenerDisponiblesPorDepartamento('mercado') : [];
                }
                
                if (categoria !== 'todas') {
                    productosFiltrados = productosFiltrados.filter(
                        p => p.category === categoria
                    );
                }
                
                this.generarHTMLProductos(productosFiltrados, 'mercado');
                this.actualizarContadorProductos(productosFiltrados.length);
                
                document.querySelectorAll('.filtro-cat').forEach(b => b.classList.remove('activo'));
                e.target.classList.add('activo');
            });
        });
    },

    // ==================== CARRITO DE COMPRAS ====================
    cargarCarrito: function() {
        try {
            const carritoGuardado = localStorage.getItem(this.config.carritoStorageKey);
            if (carritoGuardado) {
                this.estado.carrito = JSON.parse(carritoGuardado);
                this.actualizarContadorCarrito();
            }
        } catch (e) {
            console.warn('Error al cargar carrito:', e);
            this.estado.carrito = [];
        }
    },

    guardarCarrito: function() {
        try {
            localStorage.setItem(
                this.config.carritoStorageKey, 
                JSON.stringify(this.estado.carrito)
            );
        } catch (e) {
            console.warn('Error al guardar carrito:', e);
        }
    },

    agregarAlCarrito: function(id, nombre, precio) {
        const itemExistente = this.estado.carrito.find(item => item.id === id);
        
        if (itemExistente) {
            itemExistente.cantidad += 1;
        } else {
            this.estado.carrito.push({
                id: id,
                nombre: nombre,
                precio: precio,
                cantidad: 1,
                fecha: new Date().toISOString()
            });
        }
        
        this.actualizarContadorCarrito();
        this.guardarCarrito();
        this.mostrarNotificacion(`${nombre} añadido al carrito`);
        
        return true;
    },

    eliminarDelCarrito: function(id) {
        this.estado.carrito = this.estado.carrito.filter(item => item.id !== id);
        this.actualizarContadorCarrito();
        this.guardarCarrito();
    },

    actualizarCantidadCarrito: function(id, nuevaCantidad) {
        const item = this.estado.carrito.find(item => item.id === id);
        if (item) {
            if (nuevaCantidad <= 0) {
                this.eliminarDelCarrito(id);
            } else {
                item.cantidad = nuevaCantidad;
                this.guardarCarrito();
            }
        }
    },

    vaciarCarrito: function() {
        this.estado.carrito = [];
        this.actualizarContadorCarrito();
        this.guardarCarrito();
    },

    // ==================== INTERFAZ ====================
    actualizarContadorCarrito: function() {
        const totalItems = this.estado.carrito.reduce((total, item) => total + item.cantidad, 0);
        const elementos = document.querySelectorAll('.carrito-count');
        
        elementos.forEach(el => {
            el.textContent = totalItems;
            if (totalItems > 0) {
                el.classList.add('activo');
            } else {
                el.classList.remove('activo');
            }
        });
    },

    actualizarContadorProductos: function(cantidad) {
        const contador = document.getElementById('contador-productos');
        if (contador) {
            contador.textContent = `${cantidad} productos`;
        }
    },

    mostrarNotificacion: function(mensaje, tipo = 'exito') {
        const notificacion = document.createElement('div');
        notificacion.className = `notificacion ${tipo}`;
        notificacion.innerHTML = `
            <i class="fas fa-${tipo === 'exito' ? 'check' : 'exclamation'}"></i>
            <span>${mensaje}</span>
        `;
        
        document.body.appendChild(notificacion);
        
        setTimeout(() => notificacion.classList.add('mostrar'), 10);
        
        setTimeout(() => {
            notificacion.classList.remove('mostrar');
            setTimeout(() => {
                if (notificacion.parentNode) {
                    notificacion.parentNode.removeChild(notificacion);
                }
            }, 300);
        }, 3000);
    },

    // ==================== WHATSAPP ====================
    generarPedidoWhatsApp: function() {
        if (this.estado.carrito.length === 0) {
            this.mostrarNotificacion('Tu carrito está vacío', 'error');
            return;
        }
        
        let mensaje = `*Pedido - Bodegón Bayona 59*\n\n`;
        let total = 0;
        
        this.estado.carrito.forEach(item => {
            const subtotal = item.precio * item.cantidad;
            total += subtotal;
            mensaje += `• ${item.cantidad}x ${item.nombre} - $${subtotal.toLocaleString()}\n`;
        });
        
        mensaje += `\n*Total: $${total.toLocaleString()}*\n\n`;
        mensaje += `---\n`;
        mensaje += `*Datos del cliente:*\n`;
        mensaje += `Nombre: [PENDIENTE]\n`;
        mensaje += `Teléfono: [PENDIENTE]\n`;
        mensaje += `Dirección: [PENDIENTE]\n`;
        mensaje += `---\n`;
        mensaje += `*Método de pago:* Efectivo/Transferencia\n`;
        mensaje += `*Horario de entrega:* [ESPECIFICAR]\n`;
        
        const mensajeCodificado = encodeURIComponent(mensaje);
        const url = `https://wa.me/${this.config.whatsappNumero}?text=${mensajeCodificado}`;
        
        window.open(url, '_blank');
    },

    // ==================== EVENT LISTENERS ====================
    configurarEventListeners: function() {
        // Navegación entre departamentos
        document.querySelectorAll('.nav-departamento').forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const departamento = e.target.getAttribute('data-departamento');
                this.mostrarProductosDepartamento(departamento);
            });
        });
        
        // Carrito flotante
        const btnCarrito = document.querySelector('.btn-carrito');
        const carritoFlotante = document.getElementById('carritoFlotante');
        const cerrarCarrito = document.getElementById('cerrarCarrito');
        
        if (btnCarrito && carritoFlotante) {
            btnCarrito.addEventListener('click', (e) => {
                e.preventDefault();
                carritoFlotante.classList.add('active');
                this.actualizarCarritoFlotante();
            });
        }
        
        if (cerrarCarrito) {
            cerrarCarrito.addEventListener('click', () => {
                carritoFlotante.classList.remove('active');
            });
        }
        
        // Finalizar compra
        const checkoutBtn = document.getElementById('checkoutBtn');
        if (checkoutBtn) {
            checkoutBtn.addEventListener('click', () => {
                this.generarPedidoWhatsApp();
            });
        }
        
        // Vaciar carrito
        const vaciarCarritoBtn = document.getElementById('vaciarCarrito');
        if (vaciarCarritoBtn) {
            vaciarCarritoBtn.addEventListener('click', () => {
                if (confirm('¿Estás seguro de vaciar el carrito?')) {
                    this.vaciarCarrito();
                    this.actualizarCarritoFlotante();
                    this.mostrarNotificacion('Carrito vaciado');
                }
            });
        }
        
        // Newsletter
        const newsletterForm = document.getElementById('newsletterForm');
        if (newsletterForm) {
            newsletterForm.addEventListener('submit', (e) => {
                e.preventDefault();
                const email = e.target.querySelector('input[type="email"]').value;
                e.target.innerHTML = '<p style="color: #c5a572; font-weight: 600;">¡Gracias por suscribirte!</p>';
                localStorage.setItem('newsletterSubscribed', 'true');
                this.mostrarNotificacion('Te has suscrito al newsletter');
            });
        }
        
        // Cerrar carrito al hacer clic fuera
        document.addEventListener('click', (e) => {
            const carritoFlotante = document.getElementById('carritoFlotante');
            const btnCarrito = document.querySelector('.btn-carrito');
            
            if (carritoFlotante && carritoFlotante.classList.contains('active') &&
                !carritoFlotante.contains(e.target) && 
                !btnCarrito.contains(e.target)) {
                carritoFlotante.classList.remove('active');
            }
        });
    },

    configurarBotonesProductos: function() {
        document.querySelectorAll('.btn-agregar').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const id = parseInt(e.target.getAttribute('data-id'));
                const nombre = e.target.getAttribute('data-nombre');
                const precio = parseInt(e.target.getAttribute('data-precio'));
                
                this.agregarAlCarrito(id, nombre, precio);
                
                e.target.innerHTML = '<i class="fas fa-check"></i> Añadido';
                e.target.classList.add('añadido');
                
                setTimeout(() => {
                    e.target.innerHTML = '<i class="fas fa-plus"></i> Añadir al carrito';
                    e.target.classList.remove('añadido');
                }, 1000);
            });
        });
    },

    actualizarCarritoFlotante: function() {
        const carritoItems = document.getElementById('carritoItems');
        const carritoTotal = document.getElementById('carritoTotal');
        
        if (!carritoItems || !carritoTotal) return;
        
        if (this.estado.carrito.length === 0) {
            carritoItems.innerHTML = `
                <div class="carrito-vacio">
                    <i class="fas fa-shopping-basket"></i>
                    <p>Tu carrito está vacío</p>
                    <a href="#productos" class="btn-carrito-vacio">Ver productos</a>
                </div>
            `;
            carritoTotal.textContent = '0';
            return;
        }
        
        let html = '';
        let total = 0;
        
        this.estado.carrito.forEach(item => {
            const subtotal = item.precio * item.cantidad;
            total += subtotal;
            
            html += `
                <div class="carrito-item">
                    <div class="carrito-item-info">
                        <h4>${item.nombre}</h4>
                        <p>${this.config.moneda}${item.precio.toLocaleString()} x ${item.cantidad}</p>
                    </div>
                    <div class="carrito-item-actions">
                        <button class="btn-cantidad menos" data-id="${item.id}">-</button>
                        <span>${item.cantidad}</span>
                        <button class="btn-cantidad mas" data-id="${item.id}">+</button>
                        <button class="btn-eliminar" data-id="${item.id}">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </div>
            `;
        });
        
        carritoItems.innerHTML = html;
        carritoTotal.textContent = total.toLocaleString();
        
        // Event listeners para los botones del carrito
        document.querySelectorAll('.btn-cantidad.menos').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const id = parseInt(e.target.getAttribute('data-id'));
                const item = this.estado.carrito.find(item => item.id === id);
                if (item) {
                    this.actualizarCantidadCarrito(id, item.cantidad - 1);
                    this.actualizarCarritoFlotante();
                }
            });
        });
        
        document.querySelectorAll('.btn-cantidad.mas').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const id = parseInt(e.target.getAttribute('data-id'));
                const item = this.estado.carrito.find(item => item.id === id);
                if (item) {
                    this.actualizarCantidadCarrito(id, item.cantidad + 1);
                    this.actualizarCarritoFlotante();
                }
            });
        });
        
        document.querySelectorAll('.btn-eliminar').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const id = parseInt(e.target.getAttribute('data-id'));
                this.eliminarDelCarrito(id);
                this.actualizarCarritoFlotante();
                this.mostrarNotificacion('Producto eliminado');
            });
        });
    }
};

// Inicializar cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', function() {
    TiendaApp.inicializar();
});

// Cambiar título dinámico para pestañas inactivas
document.addEventListener('visibilitychange', function() {
    if (document.hidden) {
        document.title = "¡Vuelve! - Bodegón Bayona 59";
    } else {
        document.title = "Bodegón Bayona 59 - Productos Gourmet | La Habana";
    }
});

// Hacer disponible globalmente
window.TiendaApp = TiendaApp;