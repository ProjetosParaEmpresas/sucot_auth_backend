// Aguarda o carregamento completo da página
document.addEventListener('DOMContentLoaded', function() {
    // Inicialização
    initMobileMenu();
    initSmoothScrolling();
    initChart();
    initAnimations();
    initContactForm();
    initCTAButton();
});

// Menu Mobile
function initMobileMenu() {
    const hamburger = document.querySelector('.hamburger');
    const navMenu = document.querySelector('.nav-menu');
    const navLinks = document.querySelectorAll('.nav-link');

    hamburger.addEventListener('click', function() {
        navMenu.classList.toggle('active');
        hamburger.classList.toggle('active');
    });

    // Fecha o menu ao clicar em um link
    navLinks.forEach(link => {
        link.addEventListener('click', function() {
            navMenu.classList.remove('active');
            hamburger.classList.remove('active');
        });
    });
}

// Scroll suave para âncoras
function initSmoothScrolling() {
    const navLinks = document.querySelectorAll('.nav-link');
    
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            const targetId = this.getAttribute('href');
            
            // Se for um link externo (não começa com #), permite navegação normal
            if (!targetId.startsWith('#')) {
                return; // Permite navegação normal
            }
            
            // Para âncoras internas, aplica scroll suave
            e.preventDefault();
            const targetSection = document.querySelector(targetId);
            
            if (targetSection) {
                const offsetTop = targetSection.offsetTop - 70;
                window.scrollTo({
                    top: offsetTop,
                    behavior: 'smooth'
                });
            }
        });
    });
}

// Gráfico Financeiro
function initChart() {
    const canvas = document.getElementById('financialChart');
    const ctx = canvas.getContext('2d');
    
    // Configurações do canvas
    const width = canvas.width;
    const height = canvas.height;
    
    // Dados simulados para o gráfico de candlestick
    const candleData = generateCandleData(50);
    
    // Limpa o canvas
    ctx.clearRect(0, 0, width, height);
    
    // Desenha o gráfico
    drawChart(ctx, candleData, width, height);
    
    // Anima o gráfico
    animateChart(ctx, candleData, width, height);
}

function generateCandleData(count) {
    const data = [];
    let price = 1000;
    
    for (let i = 0; i < count; i++) {
        const open = price;
        const change = (Math.random() - 0.5) * 50;
        const close = open + change;
        const high = Math.max(open, close) + Math.random() * 20;
        const low = Math.min(open, close) - Math.random() * 20;
        
        data.push({
            open: open,
            high: high,
            low: low,
            close: close,
            bullish: close > open
        });
        
        price = close;
    }
    
    return data;
}

function drawChart(ctx, data, width, height) {
    const padding = 40;
    const chartWidth = width - padding * 2;
    const chartHeight = height - padding * 2;
    
    // Encontra min e max para escala
    let minPrice = Infinity;
    let maxPrice = -Infinity;
    
    data.forEach(candle => {
        minPrice = Math.min(minPrice, candle.low);
        maxPrice = Math.max(maxPrice, candle.high);
    });
    
    const priceRange = maxPrice - minPrice;
    const candleWidth = chartWidth / data.length * 0.8;
    const candleSpacing = chartWidth / data.length;
    
    // Desenha grid
    drawGrid(ctx, padding, chartWidth, chartHeight, minPrice, maxPrice);
    
    // Desenha candlesticks
    data.forEach((candle, index) => {
        const x = padding + index * candleSpacing + candleSpacing / 2;
        const openY = padding + (maxPrice - candle.open) / priceRange * chartHeight;
        const closeY = padding + (maxPrice - candle.close) / priceRange * chartHeight;
        const highY = padding + (maxPrice - candle.high) / priceRange * chartHeight;
        const lowY = padding + (maxPrice - candle.low) / priceRange * chartHeight;
        
        drawCandle(ctx, x, openY, closeY, highY, lowY, candleWidth, candle.bullish);
    });
}

function drawGrid(ctx, padding, width, height, minPrice, maxPrice) {
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
    ctx.lineWidth = 1;
    
    // Linhas horizontais
    for (let i = 0; i <= 5; i++) {
        const y = padding + (height / 5) * i;
        ctx.beginPath();
        ctx.moveTo(padding, y);
        ctx.lineTo(padding + width, y);
        ctx.stroke();
    }
    
    // Linhas verticais
    for (let i = 0; i <= 10; i++) {
        const x = padding + (width / 10) * i;
        ctx.beginPath();
        ctx.moveTo(x, padding);
        ctx.lineTo(x, padding + height);
        ctx.stroke();
    }
}

function drawCandle(ctx, x, openY, closeY, highY, lowY, width, bullish) {
    const color = bullish ? '#00ff88' : '#ff4444';
    const bodyTop = Math.min(openY, closeY);
    const bodyBottom = Math.max(openY, closeY);
    const bodyHeight = bodyBottom - bodyTop;
    
    // Linha da vela (wick)
    ctx.strokeStyle = color;
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(x, highY);
    ctx.lineTo(x, lowY);
    ctx.stroke();
    
    // Corpo da vela
    ctx.fillStyle = bullish ? color : 'transparent';
    ctx.strokeStyle = color;
    ctx.lineWidth = 1;
    
    if (bullish) {
        ctx.fillRect(x - width/2, bodyTop, width, bodyHeight || 1);
    } else {
        ctx.strokeRect(x - width/2, bodyTop, width, bodyHeight || 1);
    }
}

function animateChart(ctx, data, width, height) {
    let animationFrame = 0;
    const totalFrames = 60;
    
    function animate() {
        if (animationFrame < totalFrames) {
            const progress = animationFrame / totalFrames;
            const visibleCandles = Math.floor(data.length * progress);
            
            ctx.clearRect(0, 0, width, height);
            drawChart(ctx, data.slice(0, visibleCandles), width, height);
            
            animationFrame++;
            requestAnimationFrame(animate);
        }
    }
    
    animate();
}

// Animações de scroll
function initAnimations() {
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };
    
    const observer = new IntersectionObserver(function(entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, observerOptions);
    
    // Observa elementos para animação
    const animatedElements = document.querySelectorAll('.feature-card, .contact-content');
    animatedElements.forEach(el => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(30px)';
        el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        observer.observe(el);
    });
}

// Formulário de contato
function initContactForm() {
    const form = document.querySelector('.contact-form');
    
    form.addEventListener('submit', function(e) {
        e.preventDefault();
        
        // Simula envio do formulário
        const submitButton = form.querySelector('.submit-button');
        const originalText = submitButton.textContent;
        
        submitButton.textContent = 'Enviando...';
        submitButton.disabled = true;
        
        setTimeout(() => {
            submitButton.textContent = 'Mensagem Enviada!';
            submitButton.style.background = 'linear-gradient(135deg, #00ff88 0%, #00cc66 100%)';
            
            setTimeout(() => {
                submitButton.textContent = originalText;
                submitButton.disabled = false;
                submitButton.style.background = 'linear-gradient(135deg, #FFD700 0%, #FFA500 100%)';
                form.reset();
            }, 2000);
        }, 1500);
    });
}

// Botão CTA "Comece Agora"
function initCTAButton() {
    const ctaButton = document.querySelector('.cta-button');
    
    if (ctaButton) {
        ctaButton.addEventListener('click', function(e) {
            e.preventDefault();
            
            // Adiciona efeito visual de clique
            this.style.transform = 'translateY(2px)';
            
            setTimeout(() => {
                this.style.transform = 'translateY(-2px)';
                
                // Redireciona para a página de login
                window.location.href = 'login.html';
            }, 150);
        });
    }
}

// Efeito de paralaxe no background
window.addEventListener('scroll', function() {
    const scrolled = window.pageYOffset;
    const backgroundChart = document.querySelector('.background-chart');
    
    if (backgroundChart) {
        backgroundChart.style.transform = `translateY(${scrolled * 0.5}px)`;
    }
});

// Atualiza preços em tempo real (simulado)
function updatePrices() {
    const priceIndicators = document.querySelectorAll('.price-value');
    
    priceIndicators.forEach(indicator => {
        const currentPrice = parseFloat(indicator.textContent.replace(',', ''));
        const change = (Math.random() - 0.5) * 10;
        const newPrice = currentPrice + change;
        
        indicator.textContent = newPrice.toLocaleString('pt-BR', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        });
        
        // Atualiza a mudança percentual
        const changeElement = indicator.nextElementSibling;
        if (changeElement) {
            const percentChange = (change / currentPrice * 100).toFixed(2);
            changeElement.textContent = `${percentChange >= 0 ? '+' : ''}${percentChange}%`;
            changeElement.className = `price-change ${percentChange >= 0 ? 'positive' : 'negative'}`;
        }
    });
}

// Atualiza preços a cada 3 segundos
setInterval(updatePrices, 3000);

// Efeito de hover nos cards
document.querySelectorAll('.feature-card').forEach(card => {
    card.addEventListener('mouseenter', function() {
        this.style.transform = 'translateY(-10px) scale(1.02)';
    });
    
    card.addEventListener('mouseleave', function() {
        this.style.transform = 'translateY(0) scale(1)';
    });
});

// Adiciona efeito de digitação no título
function typeWriter(element, text, speed = 100) {
    let i = 0;
    element.innerHTML = '';
    
    function type() {
        if (i < text.length) {
            element.innerHTML += text.charAt(i);
            i++;
            setTimeout(type, speed);
        }
    }
    
    type();
}

// Aplica efeito de digitação quando a página carrega
setTimeout(() => {
    const heroTitle = document.querySelector('.hero-title');
    if (heroTitle) {
        const originalText = heroTitle.textContent;
        typeWriter(heroTitle, originalText, 50);
    }
}, 1000);

