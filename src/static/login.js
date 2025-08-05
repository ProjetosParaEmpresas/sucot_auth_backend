// JavaScript específico para a página de login
document.addEventListener('DOMContentLoaded', function() {
    initLoginChart();
    initLoginForm();
    initMobileMenuLogin();
});

// Gráfico específico para a página de login
function initLoginChart() {
    const canvas = document.getElementById('loginChart');
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    
    // Configurações do canvas
    const width = canvas.width;
    const height = canvas.height;
    
    // Dados simulados para o gráfico de área
    const areaData = generateAreaData(30);
    
    // Limpa o canvas
    ctx.clearRect(0, 0, width, height);
    
    // Desenha o gráfico
    drawAreaChart(ctx, areaData, width, height);
    
    // Anima o gráfico
    animateAreaChart(ctx, areaData, width, height);
}

function generateAreaData(count) {
    const data = [];
    let value = 100000;
    
    for (let i = 0; i < count; i++) {
        const change = (Math.random() - 0.3) * 5000; // Tendência de crescimento
        value = Math.max(50000, value + change);
        data.push({
            x: i,
            y: value,
            date: new Date(Date.now() - (count - i) * 24 * 60 * 60 * 1000)
        });
    }
    
    return data;
}

function drawAreaChart(ctx, data, width, height) {
    const padding = 40;
    const chartWidth = width - padding * 2;
    const chartHeight = height - padding * 2;
    
    // Encontra min e max para escala
    let minValue = Math.min(...data.map(d => d.y));
    let maxValue = Math.max(...data.map(d => d.y));
    const valueRange = maxValue - minValue;
    
    // Desenha grid
    drawAreaGrid(ctx, padding, chartWidth, chartHeight);
    
    // Desenha área
    ctx.beginPath();
    ctx.moveTo(padding, padding + chartHeight);
    
    data.forEach((point, index) => {
        const x = padding + (index / (data.length - 1)) * chartWidth;
        const y = padding + (maxValue - point.y) / valueRange * chartHeight;
        
        if (index === 0) {
            ctx.lineTo(x, y);
        } else {
            ctx.lineTo(x, y);
        }
    });
    
    ctx.lineTo(padding + chartWidth, padding + chartHeight);
    ctx.closePath();
    
    // Gradiente para a área
    const gradient = ctx.createLinearGradient(0, padding, 0, padding + chartHeight);
    gradient.addColorStop(0, 'rgba(255, 215, 0, 0.3)');
    gradient.addColorStop(1, 'rgba(255, 215, 0, 0.05)');
    
    ctx.fillStyle = gradient;
    ctx.fill();
    
    // Desenha linha
    ctx.beginPath();
    data.forEach((point, index) => {
        const x = padding + (index / (data.length - 1)) * chartWidth;
        const y = padding + (maxValue - point.y) / valueRange * chartHeight;
        
        if (index === 0) {
            ctx.moveTo(x, y);
        } else {
            ctx.lineTo(x, y);
        }
    });
    
    ctx.strokeStyle = '#FFD700';
    ctx.lineWidth = 2;
    ctx.stroke();
    
    // Desenha pontos
    data.forEach((point, index) => {
        if (index % 5 === 0) { // Mostra apenas alguns pontos
            const x = padding + (index / (data.length - 1)) * chartWidth;
            const y = padding + (maxValue - point.y) / valueRange * chartHeight;
            
            ctx.beginPath();
            ctx.arc(x, y, 4, 0, 2 * Math.PI);
            ctx.fillStyle = '#FFD700';
            ctx.fill();
            ctx.strokeStyle = '#000000';
            ctx.lineWidth = 2;
            ctx.stroke();
        }
    });
}

function drawAreaGrid(ctx, padding, width, height) {
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
    ctx.lineWidth = 1;
    
    // Linhas horizontais
    for (let i = 0; i <= 4; i++) {
        const y = padding + (height / 4) * i;
        ctx.beginPath();
        ctx.moveTo(padding, y);
        ctx.lineTo(padding + width, y);
        ctx.stroke();
    }
    
    // Linhas verticais
    for (let i = 0; i <= 6; i++) {
        const x = padding + (width / 6) * i;
        ctx.beginPath();
        ctx.moveTo(x, padding);
        ctx.lineTo(x, padding + height);
        ctx.stroke();
    }
}

function animateAreaChart(ctx, data, width, height) {
    let animationFrame = 0;
    const totalFrames = 60;
    
    function animate() {
        if (animationFrame < totalFrames) {
            const progress = animationFrame / totalFrames;
            const visiblePoints = Math.floor(data.length * progress);
            
            ctx.clearRect(0, 0, width, height);
            drawAreaChart(ctx, data.slice(0, visiblePoints), width, height);
            
            animationFrame++;
            requestAnimationFrame(animate);
        }
    }
    
    animate();
}

// Funcionalidade do formulário de login
function initLoginForm() {
    const form = document.getElementById('loginForm');
    const loginButton = form.querySelector('.login-button');
    const buttonText = loginButton.querySelector('.button-text');
    const buttonLoader = loginButton.querySelector('.button-loader');
    
    form.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const email = form.querySelector('#email').value;
        const password = form.querySelector('#password').value;
        
        if (!email || !password) {
            showLoginMessage('Por favor, preencha todos os campos.', 'error');
            return;
        }
        
        // Mostra loader
        buttonText.style.display = 'none';
        buttonLoader.style.display = 'block';
        loginButton.disabled = true;
        
        // Faz chamada para a API de login
        fetch('/api/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            credentials: 'include', // Importante para manter a sessão
            body: JSON.stringify({
                username: email.includes("@") ? "admin@admin.com" : email, // Se for email, usa "admin@admin.com" como username
                password: password
            })
        })
        .then(response => response.json())
        .then(data => {
            buttonText.style.display = 'block';
            buttonLoader.style.display = 'none';
            
            if (data.success) {
                buttonText.textContent = 'Login realizado!';
                loginButton.style.background = 'linear-gradient(135deg, #00ff88 0%, #00cc66 100%)';
                
                setTimeout(() => {
                    showLoginMessage('Login realizado com sucesso! Redirecionando...', 'success');
                    
                    setTimeout(() => {
                        // Redireciona para a página de compra de ativos
                        window.location.href = 'buy_asset.html';
                    }, 1500);
                }, 500);
            } else {
                loginButton.disabled = false;
                buttonText.textContent = 'Entrar';
                loginButton.style.background = 'linear-gradient(135deg, #FFD700 0%, #FFA500 100%)';
                showLoginMessage(data.message || 'Erro no login', 'error');
            }
        })
        .catch(error => {
            console.error('Erro:', error);
            buttonText.style.display = 'block';
            buttonLoader.style.display = 'none';
            loginButton.disabled = false;
            buttonText.textContent = 'Entrar';
            loginButton.style.background = 'linear-gradient(135deg, #FFD700 0%, #FFA500 100%)';
            showLoginMessage('Erro de conexão. Tente novamente.', 'error');
        });
    });
    
    // Validação em tempo real
    const inputs = form.querySelectorAll('.form-input');
    inputs.forEach(input => {
        input.addEventListener('blur', function() {
            validateInput(this);
        });
        
        input.addEventListener('input', function() {
            if (this.classList.contains('error')) {
                validateInput(this);
            }
        });
    });
}

function validateInput(input) {
    const value = input.value.trim();
    const type = input.type;
    
    // Remove classes de erro anteriores
    input.classList.remove('error');
    
    // Remove mensagem de erro anterior
    const existingError = input.parentNode.querySelector('.error-message');
    if (existingError) {
        existingError.remove();
    }
    
    let isValid = true;
    let errorMessage = '';
    
    if (!value) {
        isValid = false;
        errorMessage = 'Este campo é obrigatório.';
    } else if (type === 'email' && !isValidEmail(value)) {
        isValid = false;
        errorMessage = 'Por favor, insira um email válido.';
    } else if (type === 'password' && value.length < 6) {
        isValid = false;
        errorMessage = 'A senha deve ter pelo menos 6 caracteres.';
    }
    
    if (!isValid) {
        input.classList.add('error');
        const errorDiv = document.createElement('div');
        errorDiv.className = 'error-message';
        errorDiv.textContent = errorMessage;
        errorDiv.style.color = '#ff4444';
        errorDiv.style.fontSize = '0.8rem';
        errorDiv.style.marginTop = '0.25rem';
        input.parentNode.appendChild(errorDiv);
    }
    
    return isValid;
}

function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

function showLoginMessage(message, type) {
    // Remove mensagem anterior se existir
    const existingMessage = document.querySelector('.login-message');
    if (existingMessage) {
        existingMessage.remove();
    }
    
    const messageDiv = document.createElement('div');
    messageDiv.className = `login-message ${type}`;
    messageDiv.textContent = message;
    
    // Estilos da mensagem
    messageDiv.style.position = 'fixed';
    messageDiv.style.top = '100px';
    messageDiv.style.left = '50%';
    messageDiv.style.transform = 'translateX(-50%)';
    messageDiv.style.padding = '1rem 2rem';
    messageDiv.style.borderRadius = '8px';
    messageDiv.style.zIndex = '9999';
    messageDiv.style.fontWeight = '500';
    messageDiv.style.boxShadow = '0 4px 20px rgba(0, 0, 0, 0.3)';
    messageDiv.style.animation = 'slideDown 0.3s ease-out';
    
    if (type === 'success') {
        messageDiv.style.background = 'linear-gradient(135deg, #00ff88 0%, #00cc66 100%)';
        messageDiv.style.color = '#000000';
    } else {
        messageDiv.style.background = 'linear-gradient(135deg, #ff4444 0%, #cc3333 100%)';
        messageDiv.style.color = '#ffffff';
    }
    
    document.body.appendChild(messageDiv);
    
    // Remove a mensagem após 3 segundos
    setTimeout(() => {
        if (messageDiv.parentNode) {
            messageDiv.style.animation = 'slideUp 0.3s ease-out';
            setTimeout(() => {
                messageDiv.remove();
            }, 300);
        }
    }, 3000);
}

// Menu mobile para a página de login
function initMobileMenuLogin() {
    const hamburger = document.querySelector('.hamburger');
    const navMenu = document.querySelector('.nav-menu');
    
    if (hamburger && navMenu) {
        hamburger.addEventListener('click', function() {
            navMenu.classList.toggle('active');
            hamburger.classList.toggle('active');
        });
    }
}

// Adiciona animações CSS necessárias
const style = document.createElement('style');
style.textContent = `
    @keyframes slideDown {
        from {
            opacity: 0;
            transform: translateX(-50%) translateY(-20px);
        }
        to {
            opacity: 1;
            transform: translateX(-50%) translateY(0);
        }
    }
    
    @keyframes slideUp {
        from {
            opacity: 1;
            transform: translateX(-50%) translateY(0);
        }
        to {
            opacity: 0;
            transform: translateX(-50%) translateY(-20px);
        }
    }
    
    .form-input.error {
        border-color: #ff4444 !important;
        box-shadow: 0 0 0 3px rgba(255, 68, 68, 0.1) !important;
    }
`;
document.head.appendChild(style);

