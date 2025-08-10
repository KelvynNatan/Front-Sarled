// ===== GLOBAL VARIABLES =====
let currentSlide = 0;
let isLoading = true;
let currentFilter = 'all';
let animationObserver;

let themeToggle;
let mobileMenuToggle;
let navMenu;

// ===== THEME MANAGEMENT =====
class ThemeManager {
    constructor() {
        this.currentTheme = localStorage.getItem('theme') || 'dark';
        this.init();
    }

    init() {
        this.applyTheme(this.currentTheme);
        this.setupThemeToggle();
    }

    applyTheme(theme) {
        document.documentElement.setAttribute('data-theme', theme);
        localStorage.setItem('theme', theme);
        this.currentTheme = theme;
        this.updateThemeIcon();
    }

    toggleTheme() {
        const newTheme = this.currentTheme === 'dark' ? 'light' : 'dark';
        this.applyTheme(newTheme);
    }

    updateThemeIcon() {
        const themeIcon = document.querySelector('.theme-toggle i');
        if (themeIcon) {
            themeIcon.className = this.currentTheme === 'dark' ? 'fas fa-sun' : 'fas fa-moon';
        }
    }

    setupThemeToggle() {
        themeToggle = document.querySelector('.theme-toggle');
        if (themeToggle) {
            themeToggle.addEventListener('click', () => this.toggleTheme());
        }
    }
}

// ===== LOADER MANAGEMENT =====
class LoaderManager {
    constructor() {
        this.loader = document.querySelector('.loader');
        this.progress = document.querySelector('.loading-progress');
        this.init();
    }

    init() {
        this.simulateLoading();
    }

    simulateLoading() {
        let progress = 0;
        const interval = setInterval(() => {
            progress += Math.random() * 15;
            if (progress >= 100) {
                progress = 100;
                clearInterval(interval);
                setTimeout(() => this.hideLoader(), 500);
            }
            if (this.progress) {
                this.progress.style.width = `${progress}%`;
            }
        }, 100);
    }

    hideLoader() {
        if (this.loader) {
            this.loader.style.opacity = '0';
            setTimeout(() => {
                this.loader.style.display = 'none';
                isLoading = false;
                this.initializeAnimations();
            }, 500);
        }
    }

    initializeAnimations() {
        // Initialize AOS animations
        if (typeof AOS !== 'undefined') {
            AOS.init({
                duration: 800,
                easing: 'ease-in-out',
                once: true,
                offset: 100
            });
        }

        // Initialize particles
        this.initParticles();
        
        // Initialize counters
        this.initCounters();
    }

    initParticles() {
        if (typeof particlesJS !== 'undefined') {
            particlesJS('particles-js', {
                particles: {
                    number: {
                        value: 80,
                        density: {
                            enable: true,
                            value_area: 800
                        }
                    },
                    color: {
                        value: '#ff4b2b'
                    },
                    shape: {
                        type: 'circle',
                        stroke: {
                            width: 0,
                            color: '#000000'
                        }
                    },
                    opacity: {
                        value: 0.5,
                        random: false,
                        anim: {
                            enable: false,
                            speed: 1,
                            opacity_min: 0.1,
                            sync: false
                        }
                    },
                    size: {
                        value: 3,
                        random: true,
                        anim: {
                            enable: false,
                            speed: 40,
                            size_min: 0.1,
                            sync: false
                        }
                    },
                    line_linked: {
                        enable: true,
                        distance: 150,
                        color: '#ff4b2b',
                        opacity: 0.4,
                        width: 1
                    },
                    move: {
                        enable: true,
                        speed: 6,
                        direction: 'none',
                        random: false,
                        straight: false,
                        out_mode: 'out',
                        bounce: false,
                        attract: {
                            enable: false,
                            rotateX: 600,
                            rotateY: 1200
                        }
                    }
                },
                interactivity: {
                    detect_on: 'canvas',
                    events: {
                        onhover: {
                            enable: true,
                            mode: 'repulse'
                        },
                        onclick: {
                            enable: true,
                            mode: 'push'
                        },
                        resize: true
                    },
                    modes: {
                        grab: {
                            distance: 400,
                            line_linked: {
                                opacity: 1
                            }
                        },
                        bubble: {
                            distance: 400,
                            size: 40,
                            duration: 2,
                            opacity: 8,
                            speed: 3
                        },
                        repulse: {
                            distance: 200,
                            duration: 0.4
                        },
                        push: {
                            particles_nb: 4
                        },
                        remove: {
                            particles_nb: 2
                        }
                    }
                },
                retina_detect: true
            });
        }
    }

    initCounters() {
        const counters = document.querySelectorAll('.stat-number');
        const observerOptions = {
            threshold: 0.5,
            rootMargin: '0px 0px -100px 0px'
        };

        const counterObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    this.animateCounter(entry.target);
                    counterObserver.unobserve(entry.target);
                }
            });
        }, observerOptions);

        counters.forEach(counter => {
            counterObserver.observe(counter);
        });
    }

    animateCounter(element) {
        const target = parseInt(element.textContent.replace(/[^0-9]/g, ''));
        const duration = 2000;
        const step = target / (duration / 16);
        let current = 0;

        const timer = setInterval(() => {
            current += step;
            if (current >= target) {
                current = target;
                clearInterval(timer);
            }
            
            const suffix = element.textContent.includes('K') ? 'K+' : 
                          element.textContent.includes('+') ? '+' : '';
            element.textContent = Math.floor(current) + suffix;
        }, 16);
    }
}

// ===== NAVIGATION MANAGEMENT =====
class NavigationManager {
    constructor() {
        this.init();
    }

    init() {
        this.setupMobileMenu();
        this.setupSmoothScrolling();
        this.setupActiveNavigation();
        this.setupScrollHeader();
    }

    setupMobileMenu() {
        mobileMenuToggle = document.querySelector('.mobile-menu-toggle');
        navMenu = document.querySelector('.nav-menu');

        if (mobileMenuToggle && navMenu) {
            mobileMenuToggle.addEventListener('click', () => {
                navMenu.classList.toggle('active');
                mobileMenuToggle.classList.toggle('active');
            });
        }
    }

    setupSmoothScrolling() {
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', function (e) {
                e.preventDefault();
                const target = document.querySelector(this.getAttribute('href'));
                if (target) {
                    target.scrollIntoView({
                        behavior: 'smooth',
                        block: 'start'
                    });
                }
            });
        });
    }

    setupActiveNavigation() {
        const sections = document.querySelectorAll('section[id]');
        const navLinks = document.querySelectorAll('.nav-link');

        const observerOptions = {
            threshold: 0.3,
            rootMargin: '-100px 0px -100px 0px'
        };

        const sectionObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const id = entry.target.getAttribute('id');
                    navLinks.forEach(link => {
                        link.classList.remove('active');
                        if (link.getAttribute('href') === `#${id}`) {
                            link.classList.add('active');
                        }
                    });
                }
            });
        }, observerOptions);

        sections.forEach(section => {
            sectionObserver.observe(section);
        });
    }

    setupScrollHeader() {
        const header = document.querySelector('header');
        let lastScrollY = window.scrollY;

        window.addEventListener('scroll', () => {
            const currentScrollY = window.scrollY;
            
            if (header) {
                if (currentScrollY > 100) {
                    header.style.background = 'rgba(10, 10, 10, 0.98)';
                    header.style.backdropFilter = 'blur(20px)';
                } else {
                    header.style.background = 'rgba(10, 10, 10, 0.95)';
                    header.style.backdropFilter = 'blur(10px)';
                }
            }

            lastScrollY = currentScrollY;
        });
    }
}

// ===== CAROUSEL MANAGEMENT =====
class CarouselManager {
    constructor() {
        this.container = document.querySelector('.carousel-container');
        this.cards = document.querySelectorAll('.game-card');
        this.prevBtn = document.querySelector('.carousel-btn.prev');
        this.nextBtn = document.querySelector('.carousel-btn.next');
        this.currentSlide = 0;
        this.cardsPerView = this.getCardsPerView();
        this.maxSlides = Math.max(0, this.cards.length - this.cardsPerView);
        this.init();
    }

    init() {
        if (!this.container || this.cards.length === 0) return;
        
        this.setupControls();
        this.setupAutoPlay();
        this.setupTouchControls();
        this.updateCarousel();
        
        window.addEventListener('resize', () => {
            this.cardsPerView = this.getCardsPerView();
            this.maxSlides = Math.max(0, this.cards.length - this.cardsPerView);
            this.currentSlide = Math.min(this.currentSlide, this.maxSlides);
            this.updateCarousel();
        });
    }

    getCardsPerView() {
        const containerWidth = this.container.offsetWidth;
        if (containerWidth < 768) return 1;
        if (containerWidth < 1024) return 2;
        return 3;
    }

    setupControls() {
        if (this.prevBtn) {
            this.prevBtn.addEventListener('click', () => this.prevSlide());
        }
        if (this.nextBtn) {
            this.nextBtn.addEventListener('click', () => this.nextSlide());
        }
    }

    setupAutoPlay() {
        setInterval(() => {
            if (!document.hidden) {
                this.nextSlide();
            }
        }, 5000);
    }

    setupTouchControls() {
        let startX = 0;
        let endX = 0;

        this.container.addEventListener('touchstart', (e) => {
            startX = e.touches[0].clientX;
        });

        this.container.addEventListener('touchend', (e) => {
            endX = e.changedTouches[0].clientX;
            const diff = startX - endX;

            if (Math.abs(diff) > 50) {
                if (diff > 0) {
                    this.nextSlide();
                } else {
                    this.prevSlide();
                }
            }
        });
    }

    nextSlide() {
        if (this.currentSlide < this.maxSlides) {
            this.currentSlide++;
        } else {
            this.currentSlide = 0;
        }
        this.updateCarousel();
    }

    prevSlide() {
        if (this.currentSlide > 0) {
            this.currentSlide--;
        } else {
            this.currentSlide = this.maxSlides;
        }
        this.updateCarousel();
    }

    updateCarousel() {
        const cardWidth = this.cards[0]?.offsetWidth || 350;
        const gap = 30;
        const translateX = -(this.currentSlide * (cardWidth + gap));
        
        if (this.container) {
            this.container.style.transform = `translateX(${translateX}px)`;
        }
    }
}

// ===== PORTFOLIO FILTER MANAGEMENT =====
class PortfolioManager {
    constructor() {
        this.filterBtns = document.querySelectorAll('.filter-btn');
        this.gameCards = document.querySelectorAll('.game-card');
        this.init();
    }

    init() {
        this.setupFilters();
    }

    setupFilters() {
        this.filterBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                const filter = btn.getAttribute('data-filter');
                this.filterGames(filter);
                this.updateActiveFilter(btn);
            });
        });
    }

    filterGames(filter) {
        this.gameCards.forEach(card => {
            const category = card.getAttribute('data-category');
            
            if (filter === 'all' || category === filter) {
                card.style.display = 'block';
                card.style.opacity = '0';
                setTimeout(() => {
                    card.style.opacity = '1';
                }, 100);
            } else {
                card.style.opacity = '0';
                setTimeout(() => {
                    card.style.display = 'none';
                }, 300);
            }
        });
    }

    updateActiveFilter(activeBtn) {
        this.filterBtns.forEach(btn => btn.classList.remove('active'));
        activeBtn.classList.add('active');
    }
}

// ===== RATING SYSTEM =====
class RatingSystem {
    constructor() {
        this.init();
    }

    init() {
        document.querySelectorAll('.avaliacao-estrelas').forEach(container => {
            this.setupRating(container);
        });
    }

    setupRating(container) {
        const stars = container.querySelectorAll('.estrela');
        const textElement = container.nextElementSibling;
        let currentRating = 0;

        stars.forEach((star, index) => {
            star.addEventListener('mouseenter', () => {
                this.highlightStars(stars, index + 1);
            });

            star.addEventListener('mouseleave', () => {
                this.highlightStars(stars, currentRating);
            });

            star.addEventListener('click', () => {
                currentRating = index + 1;
                this.highlightStars(stars, currentRating);
                this.updateRatingText(textElement, currentRating);
            });
        });
    }

    highlightStars(stars, rating) {
        stars.forEach((star, index) => {
            if (index < rating) {
                star.classList.add('selecionada');
            } else {
                star.classList.remove('selecionada');
            }
        });
    }

    updateRatingText(textElement, rating) {
        if (!textElement) return;
        
        const messages = {
            1: 'Muito Ruim',
            2: 'Ruim',
            3: 'Regular',
            4: 'Bom',
            5: 'Excelente'
        };
        
        textElement.textContent = `Avaliação: ${rating}/5 - ${messages[rating]}`;
    }
}

// ===== FORM MANAGEMENT =====
class FormManager {
    constructor() {
        this.form = document.querySelector('.formulario');
        this.init();
    }

    init() {
        if (!this.form) return;
        
        this.setupFormValidation();
        this.setupFormSubmission();
        this.setupFormAnimations();
    }

    setupFormValidation() {
        const inputs = this.form.querySelectorAll('input, textarea, select');
        
        inputs.forEach(input => {
            input.addEventListener('blur', () => this.validateField(input));
            input.addEventListener('input', () => this.clearFieldError(input));
        });
    }

    validateField(field) {
        const value = field.value.trim();
        let isValid = true;
        let errorMessage = '';

        // Remove existing error
        this.clearFieldError(field);

        // Validation rules
        if (field.hasAttribute('required') && !value) {
            isValid = false;
            errorMessage = 'Este campo é obrigatório';
        } else if (field.type === 'email' && value && !this.isValidEmail(value)) {
            isValid = false;
            errorMessage = 'Email inválido';
        } else if (field.name === 'nome' && value && value.length < 2) {
            isValid = false;
            errorMessage = 'Nome deve ter pelo menos 2 caracteres';
        }

        if (!isValid) {
            this.showFieldError(field, errorMessage);
        }

        return isValid;
    }

    showFieldError(field, message) {
        field.style.borderColor = '#ef4444';
        
        const errorElement = document.createElement('span');
        errorElement.className = 'field-error';
        errorElement.textContent = message;
        errorElement.style.color = '#ef4444';
        errorElement.style.fontSize = '0.8rem';
        errorElement.style.marginTop = '5px';
        errorElement.style.display = 'block';
        
        field.parentNode.appendChild(errorElement);
    }

    clearFieldError(field) {
        field.style.borderColor = '';
        const errorElement = field.parentNode.querySelector('.field-error');
        if (errorElement) {
            errorElement.remove();
        }
    }

    isValidEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    setupFormSubmission() {
        this.form.addEventListener('submit', (e) => {
            e.preventDefault();
            
            const inputs = this.form.querySelectorAll('input, textarea, select');
            let isFormValid = true;
            
            inputs.forEach(input => {
                if (!this.validateField(input)) {
                    isFormValid = false;
                }
            });
            
            if (isFormValid) {
                this.submitForm();
            }
        });
    }

    async submitForm() {
        const submitBtn = this.form.querySelector('.btn-submit');
        const originalText = submitBtn.textContent;
        
        // Show loading state
        submitBtn.textContent = 'Enviando...';
        submitBtn.disabled = true;
        
        // Simulate form submission
        try {
            await new Promise(resolve => setTimeout(resolve, 2000));
            this.showSuccessMessage();
        } catch (error) {
            this.showErrorMessage();
        } finally {
            submitBtn.textContent = originalText;
            submitBtn.disabled = false;
        }
    }

    showSuccessMessage() {
        const successHTML = `
            <div class="form-success">
                <i class="fas fa-check-circle"></i>
                <h3>Mensagem Enviada!</h3>
                <p>Obrigado pelo contato. Responderemos em breve!</p>
            </div>
        `;
        
        this.form.innerHTML = successHTML;
    }

    showErrorMessage() {
        const errorElement = document.createElement('div');
        errorElement.className = 'form-error';
        errorElement.innerHTML = `
            <i class="fas fa-exclamation-triangle"></i>
            <p>Erro ao enviar mensagem. Tente novamente.</p>
        `;
        errorElement.style.color = '#ef4444';
        errorElement.style.textAlign = 'center';
        errorElement.style.marginTop = '20px';
        
        this.form.appendChild(errorElement);
        
        setTimeout(() => {
            errorElement.remove();
        }, 5000);
    }

    setupFormAnimations() {
        const inputs = this.form.querySelectorAll('input, textarea, select');
        
        inputs.forEach(input => {
            input.addEventListener('focus', () => {
                input.parentNode.classList.add('focused');
            });
            
            input.addEventListener('blur', () => {
                if (!input.value) {
                    input.parentNode.classList.remove('focused');
                }
            });
        });
    }
}



// ===== SCROLL ANIMATIONS =====
class ScrollAnimations {
    constructor() {
        this.init();
    }

    init() {
        this.setupScrollIndicator();
        this.setupParallaxEffects();
    }

    setupScrollIndicator() {
        const scrollIndicator = document.querySelector('.scroll-indicator');
        if (scrollIndicator) {
            scrollIndicator.addEventListener('click', () => {
                const portfolioSection = document.querySelector('.portfolio');
                if (portfolioSection) {
                    portfolioSection.scrollIntoView({ behavior: 'smooth' });
                }
            });
        }
    }

    setupParallaxEffects() {
        const parallaxElements = document.querySelectorAll('.floating-card');
        
        window.addEventListener('scroll', () => {
            const scrolled = window.pageYOffset;
            const rate = scrolled * -0.5;
            
            parallaxElements.forEach((element, index) => {
                const speed = (index + 1) * 0.1;
                element.style.transform = `translateY(${rate * speed}px)`;
            });
        });
    }
}

// ===== GAME INTERACTIONS =====
class GameInteractions {
    constructor() {
        this.init();
    }

    init() {
        this.setupPlayButtons();
        this.setupGameCards();
    }

    setupPlayButtons() {
        document.querySelectorAll('.play-button, .btn-game').forEach(button => {
            button.addEventListener('click', (e) => {
                e.preventDefault();
                const gameCard = button.closest('.game-card');
                const gameName = gameCard?.querySelector('h3')?.textContent || 'Jogo';
                
                if (button.classList.contains('disabled')) {
                    this.showComingSoonMessage(gameName);
                } else {
                    this.showGameLaunchMessage(gameName);
                }
            });
        });
    }

    setupGameCards() {
        document.querySelectorAll('.game-card').forEach(card => {
            card.addEventListener('mouseenter', () => {
                card.style.transform = 'translateY(-10px) scale(1.02)';
            });
            
            card.addEventListener('mouseleave', () => {
                card.style.transform = 'translateY(0) scale(1)';
            });
        });
        
        // Initialize live player count system
        this.initLivePlayerCount();
        
        // Initialize forum interactions
        this.initForumInteractions();
    }

    initLivePlayerCount() {
        // Simulate live player count updates
        const liveCountElements = document.querySelectorAll('.live-count');
        
        liveCountElements.forEach(element => {
            const gameId = element.dataset.game;
            const baseCount = parseInt(element.textContent.match(/\d+/)[0]);
            
            // Update every 5-15 seconds with realistic variations
            setInterval(() => {
                const variation = Math.floor(Math.random() * 20) - 10; // -10 to +10
                const newCount = Math.max(0, baseCount + variation);
                element.textContent = `${newCount} jogadores 🔴 AO VIVO`;
            }, Math.random() * 10000 + 5000); // 5-15 seconds
        });
    }
    
    initForumInteractions() {
        // Forum category click handlers
        const forumCategories = document.querySelectorAll('.forum-category');
        forumCategories.forEach(category => {
            category.addEventListener('click', () => {
                const categoryName = category.querySelector('h4').textContent;
                this.showNotification(`Redirecionando para ${categoryName}...`, 'info');
                // Here you would typically redirect to the forum category page
            });
        });
        
        // Forum button handlers
        const forumButtons = document.querySelectorAll('.forum-btn');
        forumButtons.forEach(button => {
            button.addEventListener('click', (e) => {
                e.preventDefault();
                const buttonText = button.textContent.trim();
                if (buttonText.includes('Entrar')) {
                    this.showNotification('Redirecionando para login do fórum...', 'info');
                } else if (buttonText.includes('Criar')) {
                    this.showNotification('Redirecionando para registro do fórum...', 'info');
                }
            });
        });
        
        // Simulate live forum user count updates
        this.updateForumUserCounts();
    }
    
    updateForumUserCounts() {
        const onlineUserElements = document.querySelectorAll('.online-users');
        
        onlineUserElements.forEach(element => {
            const baseCount = parseInt(element.textContent.match(/\d+/)[0]);
            
            setInterval(() => {
                const variation = Math.floor(Math.random() * 10) - 5; // -5 to +5
                const newCount = Math.max(0, baseCount + variation);
                element.textContent = `🟢 ${newCount} online`;
            }, Math.random() * 15000 + 10000); // 10-25 seconds
        });
    }

    showGameLaunchMessage(gameName) {
        this.showNotification(`Iniciando ${gameName}...`, 'success');
    }

    showComingSoonMessage(gameName) {
        this.showNotification(`${gameName} estará disponível em breve!`, 'info');
    }

    showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.innerHTML = `
            <i class="fas fa-${type === 'success' ? 'check' : 'info'}-circle"></i>
            <span>${message}</span>
        `;
        
        // Styles
        Object.assign(notification.style, {
            position: 'fixed',
            top: '20px',
            right: '20px',
            background: type === 'success' ? '#22c55e' : '#3b82f6',
            color: 'white',
            padding: '15px 20px',
            borderRadius: '10px',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            zIndex: '10000',
            transform: 'translateX(100%)',
            transition: 'transform 0.3s ease'
        });
        
        document.body.appendChild(notification);
        
        // Animate in
        setTimeout(() => {
            notification.style.transform = 'translateX(0)';
        }, 100);
        
        // Remove after delay
        setTimeout(() => {
            notification.style.transform = 'translateX(100%)';
            setTimeout(() => {
                notification.remove();
            }, 300);
        }, 3000);
    }
}

// ===== PERFORMANCE OPTIMIZATION =====
class PerformanceOptimizer {
    constructor() {
        this.init();
    }

    init() {
        this.setupLazyLoading();
        this.setupImageOptimization();
    }

    setupLazyLoading() {
        const images = document.querySelectorAll('img[data-src]');
        
        const imageObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const img = entry.target;
                    img.src = img.dataset.src;
                    img.classList.remove('lazy');
                    imageObserver.unobserve(img);
                }
            });
        });
        
        images.forEach(img => imageObserver.observe(img));
    }

    setupImageOptimization() {
        document.querySelectorAll('img').forEach(img => {
            img.addEventListener('load', () => {
                img.style.opacity = '1';
            });
            
            img.addEventListener('error', () => {
                img.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZGRkIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxNCIgZmlsbD0iIzk5OSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPkltYWdlbSBuw6NvIGVuY29udHJhZGE8L3RleHQ+PC9zdmc+';
            });
        });
    }
}

// ===== MAIN INITIALIZATION =====
class App {
    constructor() {
        this.init();
    }

    init() {
        // Wait for DOM to be fully loaded
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.initializeApp());
        } else {
            this.initializeApp();
        }
    }

    initializeApp() {
        // Initialize all managers
        new ThemeManager();
        new LoaderManager();
        new NavigationManager();
        new CarouselManager();
        new PortfolioManager();
        new RatingSystem();
        new FormManager();

        new ScrollAnimations();
        new GameInteractions();
        new PerformanceOptimizer();
        
        // Setup global event listeners
        this.setupGlobalEvents();
        
        console.log('🚀 Starled Studios website initialized successfully!');
    }

    setupGlobalEvents() {
        // Handle window resize
        let resizeTimeout;
        window.addEventListener('resize', () => {
            clearTimeout(resizeTimeout);
            resizeTimeout = setTimeout(() => {
                this.handleResize();
            }, 250);
        });
        
        // Handle visibility change
        document.addEventListener('visibilitychange', () => {
            if (document.hidden) {
                // Pause animations when tab is not visible
                document.body.classList.add('paused');
            } else {
                // Resume animations when tab becomes visible
                document.body.classList.remove('paused');
            }
        });
        
        // Handle keyboard navigation
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                // Close any open modals or menus
                const activeMenu = document.querySelector('.nav-menu.active');
                if (activeMenu) {
                    activeMenu.classList.remove('active');
                    document.querySelector('.mobile-menu-toggle')?.classList.remove('active');
                }
            }
        });
    }

    handleResize() {
        // Recalculate carousel dimensions
        const carousel = document.querySelector('.carousel-container');
        if (carousel) {
            // Trigger carousel update
            window.dispatchEvent(new Event('carousel-resize'));
        }
    }
}

// ===== START APPLICATION =====
new App();

// ===== LEGACY SUPPORT (for existing star rating functionality) =====
function selecionarEstrela(estrela) {
    const container = estrela.parentElement;
    const estrelas = container.querySelectorAll('.estrela');
    const indice = Array.from(estrelas).indexOf(estrela);
    const textoElement = container.nextElementSibling;
    
    // Clear all stars
    estrelas.forEach(e => e.classList.remove('selecionada'));
    
    // Select stars up to clicked one
    for (let i = 0; i <= indice; i++) {
        estrelas[i].classList.add('selecionada');
    }
    
    // Update text
    const rating = indice + 1;
    const messages = {
        1: 'Muito Ruim',
        2: 'Ruim', 
        3: 'Regular',
        4: 'Bom',
        5: 'Excelente'
    };
    
    if (textoElement) {
        textoElement.textContent = `Avaliação: ${rating}/5 - ${messages[rating]}`;
    }
}

// Export for global access if needed
window.StarledStudios = {
    ThemeManager,
    CarouselManager,
    PortfolioManager,
    RatingSystem,
    FormManager
};
