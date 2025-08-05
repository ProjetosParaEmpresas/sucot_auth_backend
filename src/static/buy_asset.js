// JavaScript para a página de compra de ativos
document.addEventListener('DOMContentLoaded', function() {
    initAssetTrading();
    initMobileMenuTrading();
    initLogout();
    updateMarketPrices();
    
    // Atualiza preços a cada 5 segundos
    setInterval(updateMarketPrices, 5000);
});

// Variáveis globais
let selectedAsset = null;
let assetPrices = {
    'PETR4': 32.45,
    'VALE3': 68.90,
    'ITUB4': 28.76,
    'BBDC4': 15.23,
    'ABEV3': 12.87
};

// Inicialização do sistema de trading
function initAssetTrading() {
    const marketItems = document.querySelectorAll('.market-item');
    const tradingForm = document.getElementById('tradingForm');
    const quantityInput = document.getElementById('quantity');
    const orderTypeSelect = document.getElementById('orderType');
    
    // Event listeners para seleção de ativos
    marketItems.forEach(item => {
        item.addEventListener('click', function() {
            selectAsset(this);
        });
    });
    
    // Event listener para mudança na quantidade
    quantityInput.addEventListener('input', updateOrderSummary);
    
    // Event listener para tipo de ordem
    orderTypeSelect.addEventListener('change', function() {
        const limitPriceGroup = document.getElementById('limitPriceGroup');
        if (this.value === 'limit') {
            limitPriceGroup.style.display = 'block';
        } else {
            limitPriceGroup.style.display = 'none';
        }
        updateOrderSummary();
    });
    
    // Event listener para o formulário de trading
    tradingForm.addEventListener('submit', function(e) {
        e.preventDefault();
        processBuyOrder();
    });
    
    // Busca de ativos
    const searchInput = document.getElementById('assetSearch');
    const searchBtn = document.querySelector('.search-btn');
    
    searchInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            searchAsset();
        }
    });
    
    searchBtn.addEventListener('click', searchAsset);
}

// Selecionar ativo
function selectAsset(element) {
    // Remove seleção anterior
    document.querySelectorAll('.market-item').forEach(item => {
        item.classList.remove('selected');
    });
    
    // Adiciona seleção atual
    element.classList.add('selected');
    
    const symbol = element.dataset.symbol;
    const name = element.querySelector('.market-name').textContent;
    const price = element.querySelector('.price').textContent;
    
    selectedAsset = {
        symbol: symbol,
        name: name,
        price: parseFloat(price.replace('R$ ', '').replace(',', '.'))
    };
    
    // Atualiza campos do formulário
    document.getElementById('selectedAsset').value = `${symbol} - ${name}`;
    document.getElementById('assetPrice').value = price;
    
    // Atualiza resumo da ordem
    updateOrderSummary();
    
    // Gera gráfico do ativo
    generateAssetChart(symbol);
    
    // Esconde placeholder do gráfico
    document.getElementById('chartPlaceholder').style.display = 'none';
    document.getElementById('assetChart').style.display = 'block';
}

// Atualizar resumo da ordem
function updateOrderSummary() {
    if (!selectedAsset) return;
    
    const quantity = parseInt(document.getElementById('quantity').value) || 0;
    const price = selectedAsset.price;
    const fee = 9.90; // Taxa fixa de corretagem
    
    const subtotal = quantity * price;
    const total = subtotal + fee;
    
    document.getElementById('summaryQuantity').textContent = quantity;
    document.getElementById('summaryPrice').textContent = `R$ ${price.toFixed(2).replace('.', ',')}`;
    document.getElementById('summaryFee').textContent = `R$ ${fee.toFixed(2).replace('.', ',')}`;
    document.getElementById('summaryTotal').textContent = `R$ ${total.toFixed(2).replace('.', ',')}`;
}

// Processar ordem de compra
function processBuyOrder() {
    if (!selectedAsset) {
        showTradingMessage('Por favor, selecione um ativo primeiro.', 'error');
        return;
    }
    
    const quantity = parseInt(document.getElementById('quantity').value);
    const orderType = document.getElementById('orderType').value;
    
    if (!quantity || quantity <= 0) {
        showTradingMessage('Por favor, insira uma quantidade válida.', 'error');
        return;
    }
    
    const buyButton = document.querySelector('.buy-button');
    if (!buyButton) {
        showTradingMessage('Erro: Botão de compra não encontrado.', 'error');
        return;
    }
    
    const buttonText = buyButton.querySelector('.button-text') || buyButton;
    const originalText = buttonText.textContent;
    
    // Simula processamento da ordem
    buttonText.textContent = 'Processando...';
    buyButton.disabled = true;
    buyButton.style.opacity = '0.7';
    
    setTimeout(() => {
        // Simula ordem bem-sucedida
        buttonText.textContent = 'Ordem Executada!';
        buyButton.style.background = 'linear-gradient(135deg, #00ff88 0%, #00cc66 100%)';
        
        showTradingMessage(`Ordem de compra executada com sucesso!\n${quantity} ações de ${selectedAsset.symbol}`, 'success');
        
        // Adiciona ao portfólio
        addToPortfolio(selectedAsset, quantity);
        
        // Atualiza saldo
        updateBalance();
        
        // Reset do formulário após 3 segundos
        setTimeout(() => {
            buttonText.textContent = originalText;
            buyButton.disabled = false;
            buyButton.style.opacity = '1';
            buyButton.style.background = 'linear-gradient(135deg, #FFD700 0%, #FFA500 100%)';
            
            // Limpa seleção
            document.querySelectorAll('.market-item').forEach(item => {
                item.classList.remove('selected');
            });
            selectedAsset = null;
            document.getElementById('tradingForm').reset();
            document.getElementById('selectedAsset').value = '';
            document.getElementById('assetPrice').value = '';
            updateOrderSummary();
            
            // Esconde gráfico
            document.getElementById('chartPlaceholder').style.display = 'block';
            document.getElementById('assetChart').style.display = 'none';
        }, 3000);
    }, 2000);
}

// Adicionar ao portfólio
function addToPortfolio(asset, quantity) {
    const portfolioBody = document.getElementById('portfolioBody');
    
    // Verifica se o ativo já existe no portfólio
    const existingRow = portfolioBody.querySelector(`[data-symbol="${asset.symbol}"]`);
    
    if (existingRow) {
        // Atualiza quantidade existente
        const quantityCell = existingRow.querySelector('.quantity');
        const currentQuantity = parseInt(quantityCell.textContent);
        quantityCell.textContent = currentQuantity + quantity;
    } else {
        // Adiciona nova linha ao portfólio
        const newRow = document.createElement('div');
        newRow.className = 'table-row';
        newRow.dataset.symbol = asset.symbol;
        
        const change = (Math.random() - 0.5) * 10; // Variação aleatória
        const changeClass = change >= 0 ? 'positive' : 'negative';
        const changeSign = change >= 0 ? '+' : '';
        
        newRow.innerHTML = `
            <div class="table-cell">
                <div class="asset-info">
                    <span class="asset-symbol">${asset.symbol}</span>
                    <span class="asset-name">${asset.name}</span>
                </div>
            </div>
            <div class="table-cell quantity">${quantity}</div>
            <div class="table-cell">R$ ${asset.price.toFixed(2).replace('.', ',')}</div>
            <div class="table-cell">R$ ${asset.price.toFixed(2).replace('.', ',')}</div>
            <div class="table-cell ${changeClass}">${changeSign}${change.toFixed(2)}%</div>
            <div class="table-cell">R$ ${(asset.price * quantity).toFixed(2).replace('.', ',')}</div>
        `;
        
        portfolioBody.appendChild(newRow);
    }
}

// Atualizar saldo (simulado)
function updateBalance() {
    const totalBalance = document.getElementById('totalBalance');
    const availableBalance = document.getElementById('availableBalance');
    
    // Simula redução do saldo disponível
    const currentAvailable = parseFloat(availableBalance.textContent.replace('R$ ', '').replace('.', '').replace(',', '.'));
    const orderTotal = parseFloat(document.getElementById('summaryTotal').textContent.replace('R$ ', '').replace('.', '').replace(',', '.'));
    
    const newAvailable = currentAvailable - orderTotal;
    availableBalance.textContent = `R$ ${newAvailable.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`;
}

// Buscar ativo
function searchAsset() {
    const searchTerm = document.getElementById('assetSearch').value.toUpperCase();
    const marketItems = document.querySelectorAll('.market-item');
    
    if (!searchTerm) {
        marketItems.forEach(item => item.style.display = 'flex');
        return;
    }
    
    marketItems.forEach(item => {
        const symbol = item.dataset.symbol;
        const name = item.querySelector('.market-name').textContent.toUpperCase();
        
        if (symbol.includes(searchTerm) || name.includes(searchTerm)) {
            item.style.display = 'flex';
        } else {
            item.style.display = 'none';
        }
    });
}

// Atualizar preços do mercado (simulado)
function updateMarketPrices() {
    const marketItems = document.querySelectorAll('.market-item');
    
    marketItems.forEach(item => {
        const symbol = item.dataset.symbol;
        const priceElement = item.querySelector('.price');
        const changeElement = item.querySelector('.change');
        
        // Simula variação de preço
        const currentPrice = assetPrices[symbol];
        const variation = (Math.random() - 0.5) * 2; // Variação de -1% a +1%
        const newPrice = currentPrice * (1 + variation / 100);
        
        assetPrices[symbol] = newPrice;
        
        // Atualiza preço na interface
        priceElement.textContent = `R$ ${newPrice.toFixed(2).replace('.', ',')}`;
        
        // Atualiza variação
        const changePercent = variation;
        const changeClass = changePercent >= 0 ? 'positive' : 'negative';
        const changeSign = changePercent >= 0 ? '+' : '';
        
        changeElement.textContent = `${changeSign}${changePercent.toFixed(2)}%`;
        changeElement.className = `change ${changeClass}`;
        
        // Atualiza preço no formulário se o ativo estiver selecionado
        if (selectedAsset && selectedAsset.symbol === symbol) {
            selectedAsset.price = newPrice;
            document.getElementById('assetPrice').value = `R$ ${newPrice.toFixed(2).replace('.', ',')}`;
            updateOrderSummary();
        }
    });
}

// Gerar gráfico do ativo
function generateAssetChart(symbol) {
    const canvas = document.getElementById('assetChart');
    const ctx = canvas.getContext('2d');
    
    // Limpa o canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Gera dados simulados para o gráfico
    const chartData = generateChartData(symbol, 30);
    
    // Desenha o gráfico
    drawAssetChart(ctx, chartData, canvas.width, canvas.height);
}

function generateChartData(symbol, points) {
    const data = [];
    let basePrice = assetPrices[symbol];
    
    for (let i = 0; i < points; i++) {
        const variation = (Math.random() - 0.5) * 0.1; // Variação de -5% a +5%
        basePrice = basePrice * (1 + variation);
        data.push({
            x: i,
            y: basePrice,
            time: new Date(Date.now() - (points - i) * 60 * 60 * 1000) // Horas atrás
        });
    }
    
    return data;
}

function drawAssetChart(ctx, data, width, height) {
    const padding = 40;
    const chartWidth = width - padding * 2;
    const chartHeight = height - padding * 2;
    
    // Encontra min e max para escala
    const prices = data.map(d => d.y);
    const minPrice = Math.min(...prices);
    const maxPrice = Math.max(...prices);
    const priceRange = maxPrice - minPrice;
    
    // Desenha grid
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
    ctx.lineWidth = 1;
    
    // Linhas horizontais
    for (let i = 0; i <= 4; i++) {
        const y = padding + (chartHeight / 4) * i;
        ctx.beginPath();
        ctx.moveTo(padding, y);
        ctx.lineTo(padding + chartWidth, y);
        ctx.stroke();
    }
    
    // Linhas verticais
    for (let i = 0; i <= 6; i++) {
        const x = padding + (chartWidth / 6) * i;
        ctx.beginPath();
        ctx.moveTo(x, padding);
        ctx.lineTo(x, padding + chartHeight);
        ctx.stroke();
    }
    
    // Desenha linha do preço
    ctx.beginPath();
    ctx.strokeStyle = '#FFD700';
    ctx.lineWidth = 2;
    
    data.forEach((point, index) => {
        const x = padding + (index / (data.length - 1)) * chartWidth;
        const y = padding + (maxPrice - point.y) / priceRange * chartHeight;
        
        if (index === 0) {
            ctx.moveTo(x, y);
        } else {
            ctx.lineTo(x, y);
        }
    });
    
    ctx.stroke();
    
    // Desenha área sob a linha
    ctx.beginPath();
    ctx.moveTo(padding, padding + chartHeight);
    
    data.forEach((point, index) => {
        const x = padding + (index / (data.length - 1)) * chartWidth;
        const y = padding + (maxPrice - point.y) / priceRange * chartHeight;
        ctx.lineTo(x, y);
    });
    
    ctx.lineTo(padding + chartWidth, padding + chartHeight);
    ctx.closePath();
    
    const gradient = ctx.createLinearGradient(0, padding, 0, padding + chartHeight);
    gradient.addColorStop(0, 'rgba(255, 215, 0, 0.3)');
    gradient.addColorStop(1, 'rgba(255, 215, 0, 0.05)');
    
    ctx.fillStyle = gradient;
    ctx.fill();
    
    // Desenha pontos
    data.forEach((point, index) => {
        if (index % 5 === 0) { // Mostra apenas alguns pontos
            const x = padding + (index / (data.length - 1)) * chartWidth;
            const y = padding + (maxPrice - point.y) / priceRange * chartHeight;
            
            ctx.beginPath();
            ctx.arc(x, y, 3, 0, 2 * Math.PI);
            ctx.fillStyle = '#FFD700';
            ctx.fill();
            ctx.strokeStyle = '#000000';
            ctx.lineWidth = 1;
            ctx.stroke();
        }
    });
}

// Menu mobile para trading
function initMobileMenuTrading() {
    const hamburger = document.querySelector('.hamburger');
    const navMenu = document.querySelector('.nav-menu');
    
    if (hamburger && navMenu) {
        hamburger.addEventListener('click', function() {
            navMenu.classList.toggle('active');
            hamburger.classList.toggle('active');
        });
    }
}

// Logout
function initLogout() {
    const logoutBtn = document.querySelector('.logout-btn');
    
    if (logoutBtn) {
        logoutBtn.addEventListener('click', function(e) {
            e.preventDefault();
            
            if (confirm('Tem certeza que deseja sair?')) {
                showTradingMessage('Fazendo logout...', 'info');
                
                setTimeout(() => {
                    window.location.href = 'index.html';
                }, 1500);
            }
        });
    }
}

// Mostrar mensagens de trading
function showTradingMessage(message, type) {
    // Remove mensagem anterior se existir
    const existingMessage = document.querySelector('.trading-message');
    if (existingMessage) {
        existingMessage.remove();
    }
    
    const messageDiv = document.createElement('div');
    messageDiv.className = `trading-message ${type}`;
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
    messageDiv.style.maxWidth = '400px';
    messageDiv.style.textAlign = 'center';
    messageDiv.style.whiteSpace = 'pre-line';
    
    if (type === 'success') {
        messageDiv.style.background = 'linear-gradient(135deg, #00ff88 0%, #00cc66 100%)';
        messageDiv.style.color = '#000000';
    } else if (type === 'error') {
        messageDiv.style.background = 'linear-gradient(135deg, #ff4444 0%, #cc3333 100%)';
        messageDiv.style.color = '#ffffff';
    } else {
        messageDiv.style.background = 'linear-gradient(135deg, #FFD700 0%, #FFA500 100%)';
        messageDiv.style.color = '#000000';
    }
    
    document.body.appendChild(messageDiv);
    
    // Remove a mensagem após 4 segundos
    setTimeout(() => {
        if (messageDiv.parentNode) {
            messageDiv.style.animation = 'slideUp 0.3s ease-out';
            setTimeout(() => {
                messageDiv.remove();
            }, 300);
        }
    }, 4000);
}

