// Inicialización del slider
document.addEventListener('DOMContentLoaded', function() {
    // Inicializar Swiper
    const swiper = new Swiper('.swiper', {
        // Optional parameters
        direction: 'horizontal',
        loop: true,
        speed: 800,
        autoplay: {
            delay: 5000,
            disableOnInteraction: false,
        },
        
        // Pagination
        pagination: {
            el: '.swiper-pagination',
            clickable: true,
        },
        
        // Navigation arrows
        navigation: {
            nextEl: '.swiper-button-next',
            prevEl: '.swiper-button-prev',
        },
        
        // Efectos
        effect: 'fade',
        fadeEffect: {
            crossFade: true
        },
    });

    // Menú móvil
    const menuBtn = document.getElementById('menuBtn');
    const header = document.querySelector('.header');
    
    menuBtn.addEventListener('click', function() {
        header.classList.toggle('active');
    });

    // Carrito flotante
    const cartBtn = document.getElementById('cartBtn');
    const closeCart = document.getElementById('closeCart');
    const cartSidebar = document.getElementById('cartSidebar');
    
    cartBtn.addEventListener('click', function() {
        cartSidebar.classList.add('active');
        document.body.style.overflow = 'hidden';
    });
    
    closeCart.addEventListener('click', function() {
        cartSidebar.classList.remove('active');
        document.body.style.overflow = '';
    });

    // Cerrar carrito al hacer clic fuera
    document.addEventListener('click', function(event) {
        if (!cartSidebar.contains(event.target) && !cartBtn.contains(event.target)) {
            cartSidebar.classList.remove('active');
            document.body.style.overflow = '';
        }
    });

    // Filtros de categorías
    const categoryBtns = document.querySelectorAll('.category-btn');
    categoryBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            // Remover clase active de todos los botones
            categoryBtns.forEach(b => b.classList.remove('active'));
            // Agregar clase active al botón clickeado
            this.classList.add('active');
            
            // Aquí podrías filtrar productos
            filterProducts(this.textContent);
        });
    });

    // Botones de agregar al carrito
    const addButtons = document.querySelectorAll('.btn-combo, .btn-add, .btn-buy');
    addButtons.forEach(btn => {
        btn.addEventListener('click', function(e) {
            e.preventDefault();
            
            // Crear notificación
            createNotification('Producto agregado al carrito!', 'success');
            
            // Actualizar contador del carrito
            updateCartCount(1);
            
            // Agregar animación al botón
            this.classList.add('added');
            setTimeout(() => {
                this.classList.remove('added');
            }, 1000);
        });
    });

    // Formulario de contacto
    const contactForm = document.getElementById('contactForm');
    if (contactForm) {
        contactForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            // Validación simple
            const inputs = this.querySelectorAll('input, textarea');
            let isValid = true;
            
            inputs.forEach(input => {
                if (!input.value.trim()) {
                    input.style.borderColor = 'var(--secondary)';
                    isValid = false;
                } else {
                    input.style.borderColor = '';
                }
            });
            
            if (isValid) {
                // Simular envío
                const submitBtn = this.querySelector('.btn-submit');
                const originalText = submitBtn.innerHTML;
                
                submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Enviando...';
                submitBtn.disabled = true;
                
                setTimeout(() => {
                    createNotification('Mensaje enviado con éxito! Te contactaremos pronto.', 'success');
                    submitBtn.innerHTML = originalText;
                    submitBtn.disabled = false;
                    contactForm.reset();
                }, 1500);
            } else {
                createNotification('Por favor completa todos los campos', 'error');
            }
        });
    }

    // Scroll suave para enlaces
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            e.preventDefault();
            
            const targetId = this.getAttribute('href');
            if (targetId === '#') return;
            
            const targetElement = document.querySelector(targetId);
            if (targetElement) {
                window.scrollTo({
                    top: targetElement.offsetTop - 80,
                    behavior: 'smooth'
                });
                
                // Cerrar menú móvil si está abierto
                header.classList.remove('active');
            }
        });
    });

    // Animación de elementos al hacer scroll
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };
    
    const observer = new IntersectionObserver(function(entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('animate');
            }
        });
    }, observerOptions);
    
    // Observar elementos para animación
    document.querySelectorAll('.combo-card, .product-card, .price-card').forEach(el => {
        observer.observe(el);
    });

    // Funciones auxiliares
    function createNotification(message, type) {
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.innerHTML = `
            <i class="fas fa-${type === 'success' ? 'check-circle' : 'exclamation-circle'}"></i>
            <span>${message}</span>
            <button class="notification-close"><i class="fas fa-times"></i></button>
        `;
        
        document.body.appendChild(notification);
        
        // Mostrar notificación
        setTimeout(() => {
            notification.classList.add('show');
        }, 10);
        
        // Auto-eliminar después de 5 segundos
        setTimeout(() => {
            notification.classList.remove('show');
            setTimeout(() => {
                notification.remove();
            }, 300);
        }, 5000);
        
        // Botón para cerrar
        notification.querySelector('.notification-close').addEventListener('click', function() {
            notification.classList.remove('show');
            setTimeout(() => {
                notification.remove();
            }, 300);
        });
    }
    
    function updateCartCount(increment) {
        const cartCount = document.querySelector('.cart-count');
        let currentCount = parseInt(cartCount.textContent) || 0;
        currentCount += increment;
        cartCount.textContent = currentCount;
        
        // Animación
        cartCount.classList.add('pulse');
        setTimeout(() => {
            cartCount.classList.remove('pulse');
        }, 500);
    }
    
    function filterProducts(category) {
        // Esta función debería filtrar productos basándose en la categoría
        console.log(`Filtrando por: ${category}`);
        // Aquí integrarías tu lógica de filtrado
    }

    // Estilos para notificaciones
    const style = document.createElement('style');
    style.textContent = `
        .notification {
            position: fixed;
            top: 100px;
            right: 20px;
            background: var(--gradient-primary);
            color: white;
            padding: 15px 20px;
            border-radius: 12px;
            box-shadow: var(--shadow-hover);
            display: flex;
            align-items: center;
            gap: 15px;
            z-index: 9999;
            transform: translateX(400px);
            transition: transform 0.3s ease;
            max-width: 400px;
        }
        
        .notification.show {
            transform: translateX(0);
        }
        
        .notification.error {
            background: var(--gradient-secondary);
        }
        
        .notification i {
            font-size: 1.2rem;
        }
        
        .notification-close {
            background: none;
            border: none;
            color: white;
            cursor: pointer;
            margin-left: auto;
        }
        
        .pulse {
            animation: pulse 0.5s ease;
        }
        
        @keyframes pulse {
            0% { transform: scale(1); }
            50% { transform: scale(1.3); }
            100% { transform: scale(1); }
        }
    `;
    document.head.appendChild(style);
});

// Función para cargar más productos (simulación)
function loadMoreProducts() {
    const productsGrid = document.querySelector('.products-grid');
    if (!productsGrid) return;
    
    const products = [
        { name: 'Arroz 1kg', desc: 'Tipo especial', price: '$2.50', icon: 'fas fa-utensils' },
        { name: 'Frijoles 500g', desc: 'Negros premium', price: '$3.00', icon: 'fas fa-seedling' },
        { name: 'Azúcar 1kg', desc: 'Blanca refinada', price: '$1.80', icon: 'fas fa-cube' },
        { name: 'Café 250g', desc: 'Molido tradicional', price: '$5.00', icon: 'fas fa-coffee' }
    ];
    
    products.forEach(product => {
        const productCard = document.createElement('div');
        productCard.className = 'product-card';
        productCard.innerHTML = `
            <div class="product-img">
                <i class="${product.icon}"></i>
            </div>
            <h3>${product.name}</h3>
            <p class="product-desc">${product.desc}</p>
            <div class="product-price">
                <span class="price">${product.price}</span>
                <button class="btn-add"><i class="fas fa-plus"></i></button>
            </div>
        `;
        
        productCard.querySelector('.btn-add').addEventListener('click', function() {
            createNotification(`${product.name} agregado al carrito!`, 'success');
            updateCartCount(1);
        });
        
        productsGrid.appendChild(productCard);
    });
}

// Ejecutar cuando se hace clic en "Ver todos"
document.querySelector('.btn-view-all')?.addEventListener('click', function(e) {
    e.preventDefault();
    loadMoreProducts();
    this.style.display = 'none';
});
