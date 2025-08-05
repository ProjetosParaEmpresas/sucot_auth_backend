// JavaScript para a página de mercado (treemap)
document.addEventListener('DOMContentLoaded', function() {
    initMarketPage();
    initMobileMenu();
    generateTreemap();
    initMarketControls();
    initModal();
    
    // Atualiza dados a cada 10 segundos
    setInterval(updateMarketData, 10000);
});

// Dados dos ativos brasileiros
const marketAssets = [
    // Grandes empresas (blocos grandes)
    { symbol: 'VALE3', name: 'Vale ON', price: 68.90, change: 1.55, volume: '1.22B', sector: 'mineracao', size: 'large' },
    { symbol: 'PETR4', name: 'Petrobras PN', price: 32.45, change: -0.16, volume: '567.32M', sector: 'petroleo', size: 'large' },
    { symbol: 'ITUB4', name: 'Itaú Unibanco PN', price: 28.76, change: 2.15, volume: '897.09M', sector: 'financeiro', size: 'large' },
    { symbol: 'BBDC4', name: 'Bradesco PN', price: 15.23, change: -1.26, volume: '639.12M', sector: 'financeiro', size: 'large' },
    { symbol: 'ABEV3', name: 'Ambev ON', price: 12.87, change: -0.69, volume: '335.46M', sector: 'varejo', size: 'medium' },
    { symbol: 'WEGE3', name: 'WEG ON', price: 45.67, change: -4.68, volume: '1.11B', sector: 'tecnologia', size: 'large' },
    
    // Empresas médias (blocos médios)
    { symbol: 'BBAS3', name: 'Brasil ON', price: 52.34, change: 0.89, volume: '280.61M', sector: 'financeiro', size: 'medium' },
    { symbol: 'GGBR4', name: 'Gerdau PN', price: 18.45, change: 0.35, volume: '269.72M', sector: 'mineracao', size: 'medium' },
    { symbol: 'EMBR3', name: 'Embraer ON', price: 23.78, change: -3.89, volume: '118.51M', sector: 'tecnologia', size: 'medium' },
    { symbol: 'B3SA3', name: 'B3 ON', price: 11.90, change: -2.02, volume: '230.00M', sector: 'financeiro', size: 'medium' },
    { symbol: 'RENT3', name: 'Localiza ON', price: 67.23, change: 1.45, volume: '156.78M', sector: 'varejo', size: 'medium' },
    { symbol: 'LREN3', name: 'Lojas Renner ON', price: 19.87, change: -0.78, volume: '134.56M', sector: 'varejo', size: 'medium' },
    
    // Empresas menores (blocos pequenos)
    { symbol: 'MGLU3', name: 'Magazine Luiza ON', price: 8.45, change: -3.33, volume: '89.45M', sector: 'varejo', size: 'small' },
    { symbol: 'JBSS3', name: 'JBS ON', price: 34.56, change: 2.67, volume: '78.90M', sector: 'varejo', size: 'small' },
    { symbol: 'SUZB3', name: 'Suzano ON', price: 56.78, change: -0.45, volume: '67.34M', sector: 'mineracao', size: 'small' },
    { symbol: 'CIEL3', name: 'Cielo ON', price: 4.23, change: 1.89, volume: '56.78M', sector: 'financeiro', size: 'small' },
    { symbol: 'RADL3', name: 'Raia Drogasil ON', price: 28.90, change: 0.67, volume: '45.67M', sector: 'varejo', size: 'small' },
    { symbol: 'EQTL3', name: 'Equatorial ON', price: 31.45, change: -1.23, volume: '43.21M', sector: 'tecnologia', size: 'small' },
    { symbol: 'PSSA3', name: 'Porto Seguro ON', price: 18.67, change: -0.89, volume: '38.90M', sector: 'financeiro', size: 'small' },
    { symbol: 'BRFS3', name: 'BRF ON', price: 15.34, change: 3.45, volume: '34.56M', sector: 'varejo', size: 'small' },
    { symbol: 'SMFT3', name: 'Smiles ON', price: 22.78, change: -2.41, volume: '29.87M', sector: 'varejo', size: 'small' },
    { symbol: 'CMIN3', name: 'CSN Mineração ON', price: 4.67, change: 0.78, volume: '27.45M', sector: 'mineracao', size: 'small' },
    { symbol: 'KLBN11', name: 'Klabin UNT', price: 3.89, change: -1.56, volume: '25.34M', sector: 'mineracao', size: 'small' },
    { symbol: 'HAPV3', name: 'Hapvida ON', price: 2.45, change: 2.89, volume: '23.67M', sector: 'varejo', size: 'small' },
    { symbol: 'MRFG3', name: 'Marfrig ON', price: 12.34, change: -0.67, volume: '21.89M', sector: 'varejo', size: 'small' },
    { symbol: 'NTCO3', name: 'Natura ON', price: 17.56, change: 1.23, volume: '19.78M', sector: 'varejo', size: 'small' },
    { symbol: 'COGN3', name: 'Cogna ON', price: 1.78, change: -4.56, volume: '18.45M', sector: 'tecnologia', size: 'small' },
    { symbol: 'YDUQ3', name: 'YDUQS ON', price: 8.90, change: 0.89, volume: '16.78M', sector: 'tecnologia', size: 'small' },
    { symbol: 'ENGI11', name: 'Energisa UNT', price: 45.67, change: 1.45, volume: '15.67M', sector: 'tecnologia', size: 'small' },
    { symbol: 'ALUP11', name: 'Alupar UNT', price: 23.45, change: -0.78, volume: '14.56M', sector: 'tecnologia', size: 'small' },
    { symbol: 'BEEF3', name: 'Minerva ON', price: 6.78, change: 2.34, volume: '13.45M', sector: 'varejo', size: 'small' },
    { symbol: 'CRFB3', name: 'Carrefour BR ON', price: 14.56, change: -1.23, volume: '12.34M', sector: 'varejo', size: 'small' }
];

let filteredAssets = [...marketAssets];
let currentSort = 'volume';

// Inicialização da página
function initMarketPage() {
    updateMarketStats();
    console.log('Página de mercado inicializada');
}

// Gerar treemap
function generateTreemap() {
    const container = document.getElementById('treemapContainer');
    container.innerHTML = '';
    
    // Ordena os ativos conforme o filtro atual
    sortAssets();
    
    filteredAssets.forEach((asset, index) => {
        const block = createTreemapBlock(asset, index);
        container.appendChild(block);
    });
}

// Criar bloco do treemap
function createTreemapBlock(asset, index) {
    const block = document.createElement('div');
    block.className = `treemap-block ${asset.size} ${getColorClass(asset.change)}`;
    block.dataset.symbol = asset.symbol;
    
    // Adiciona delay na animação
    block.style.animationDelay = `${index * 0.05}s`;
    
    block.innerHTML = `
        <div class="block-symbol">${asset.symbol}</div>
        <div class="block-price">R$ ${asset.price.toFixed(2).replace('.', ',')}</div>
        <div class="block-change">${asset.change >= 0 ? '+' : ''}${asset.change.toFixed(2)}%</div>
        <div class="block-volume">${asset.volume}</div>
    `;
    
    // Event listeners
    block.addEventListener('click', () => openAssetModal(asset));
    block.addEventListener('mouseenter', () => highlightBlock(block));
    block.addEventListener('mouseleave', () => unhighlightBlock(block));
    
    return block;
}

// Determinar classe de cor baseada na variação
function getColorClass(change) {
    if (change >= 5) return 'positive-strong';
    if (change >= 2) return 'positive-medium';
    if (change > 0) return 'positive-light';
    if (change === 0) return 'neutral';
    if (change > -2) return 'negative-light';
    if (change > -5) return 'negative-medium';
    return 'negative-strong';
}

// Destacar bloco no hover
function highlightBlock(block) {
    block.style.transform = 'scale(1.05)';
    block.style.zIndex = '100';
}

function unhighlightBlock(block) {
    block.style.transform = 'scale(1)';
    block.style.zIndex = '1';
}

// Controles do mercado
function initMarketControls() {
    const searchInput = document.getElementById('marketSearch');
    const sectorFilter = document.getElementById('sectorFilter');
    const sortFilter = document.getElementById('sortFilter');
    const searchBtn = document.querySelector('.search-btn');
    
    // Busca
    searchInput.addEventListener('input', filterAssets);
    searchBtn.addEventListener('click', filterAssets);
    
    // Filtros
    sectorFilter.addEventListener('change', filterAssets);
    sortFilter.addEventListener('change', function() {
        currentSort = this.value;
        generateTreemap();
    });
}

// Filtrar ativos
function filterAssets() {
    const searchTerm = document.getElementById('marketSearch').value.toUpperCase();
    const sectorFilter = document.getElementById('sectorFilter').value;
    
    filteredAssets = marketAssets.filter(asset => {
        const matchesSearch = asset.symbol.includes(searchTerm) || 
                            asset.name.toUpperCase().includes(searchTerm);
        const matchesSector = sectorFilter === 'all' || asset.sector === sectorFilter;
        
        return matchesSearch && matchesSector;
    });
    
    generateTreemap();
}

// Ordenar ativos
function sortAssets() {
    switch(currentSort) {
        case 'volume':
            filteredAssets.sort((a, b) => parseVolume(b.volume) - parseVolume(a.volume));
            break;
        case 'variation':
            filteredAssets.sort((a, b) => Math.abs(b.change) - Math.abs(a.change));
            break;
        case 'price':
            filteredAssets.sort((a, b) => b.price - a.price);
            break;
        case 'alphabetical':
            filteredAssets.sort((a, b) => a.symbol.localeCompare(b.symbol));
            break;
    }
}

// Converter volume para número
function parseVolume(volume) {
    const num = parseFloat(volume);
    if (volume.includes('B')) return num * 1000000000;
    if (volume.includes('M')) return num * 1000000;
    return num;
}

// Modal do ativo
function initModal() {
    const modal = document.getElementById('assetModal');
    const closeBtn = document.getElementById('modalClose');
    const buyBtn = document.getElementById('buyAssetBtn');
    const watchlistBtn = document.getElementById('addWatchlistBtn');
    
    closeBtn.addEventListener('click', closeAssetModal);
    modal.addEventListener('click', function(e) {
        if (e.target === modal) closeAssetModal();
    });
    
    buyBtn.addEventListener('click', function() {
        const symbol = document.getElementById('modalTitle').textContent;
        redirectToBuyPage(symbol);
    });
    
    watchlistBtn.addEventListener('click', function() {
        const symbol = document.getElementById('modalTitle').textContent;
        addToWatchlist(symbol);
    });
}

// Abrir modal do ativo
function openAssetModal(asset) {
    const modal = document.getElementById('assetModal');
    
    document.getElementById('modalTitle').textContent = asset.symbol;
    document.getElementById('modalName').textContent = asset.name;
    document.getElementById('modalPrice').textContent = `R$ ${asset.price.toFixed(2).replace('.', ',')}`;
    document.getElementById('modalChange').textContent = `${asset.change >= 0 ? '+' : ''}${asset.change.toFixed(2)}%`;
    document.getElementById('modalVolume').textContent = asset.volume;
    document.getElementById('modalSector').textContent = getSectorName(asset.sector);
    
    // Aplica cor da variação
    const changeElement = document.getElementById('modalChange');
    changeElement.className = `info-value ${asset.change >= 0 ? 'positive' : 'negative'}`;
    
    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
}

// Fechar modal
function closeAssetModal() {
    const modal = document.getElementById('assetModal');
    modal.classList.remove('active');
    document.body.style.overflow = 'auto';
}

// Obter nome do setor
function getSectorName(sector) {
    const sectors = {
        'financeiro': 'Financeiro',
        'petroleo': 'Petróleo e Gás',
        'mineracao': 'Mineração',
        'varejo': 'Varejo',
        'tecnologia': 'Tecnologia'
    };
    return sectors[sector] || 'Outros';
}

// Redirecionar para página de compra
function redirectToBuyPage(symbol) {
    closeAssetModal();
    showMessage(`Redirecionando para compra de ${symbol}...`, 'info');
    
    setTimeout(() => {
        window.location.href = `buy_asset.html?asset=${symbol}`;
    }, 1500);
}

// Adicionar à watchlist
function addToWatchlist(symbol) {
    showMessage(`${symbol} adicionado à sua lista de acompanhamento!`, 'success');
    closeAssetModal();
}

// Atualizar estatísticas do mercado
function updateMarketStats() {
    const ibovespa = document.getElementById('ibovespa');
    const ibovespaChange = document.getElementById('ibovespaChange');
    const volume = document.getElementById('volume');
    const activeAssets = document.getElementById('activeAssets');
    
    // Simula variação do Ibovespa
    const currentIbovespa = parseInt(ibovespa.textContent.replace('.', ''));
    const variation = (Math.random() - 0.5) * 2; // -1% a +1%
    const newIbovespa = Math.round(currentIbovespa * (1 + variation / 100));
    
    ibovespa.textContent = newIbovespa.toLocaleString('pt-BR');
    ibovespaChange.textContent = `${variation >= 0 ? '+' : ''}${variation.toFixed(2)}%`;
    ibovespaChange.className = `stat-change ${variation >= 0 ? 'positive' : 'negative'}`;
    
    // Atualiza volume
    const volumeValue = (Math.random() * 10 + 15).toFixed(1);
    volume.textContent = `R$ ${volumeValue}B`;
    
    // Atualiza ativos em alta
    const assetsInHigh = marketAssets.filter(asset => asset.change > 0).length;
    activeAssets.textContent = assetsInHigh;
}

// Atualizar dados do mercado
function updateMarketData() {
    // Atualiza preços e variações dos ativos
    marketAssets.forEach(asset => {
        const priceVariation = (Math.random() - 0.5) * 0.1; // -5% a +5%
        asset.price = asset.price * (1 + priceVariation);
        
        const changeVariation = (Math.random() - 0.5) * 2; // -1% a +1%
        asset.change = Math.max(-10, Math.min(10, asset.change + changeVariation));
    });
    
    // Regenera treemap se não há filtros ativos
    const searchInput = document.getElementById('marketSearch');
    const sectorFilter = document.getElementById('sectorFilter');
    
    if (!searchInput.value && sectorFilter.value === 'all') {
        filteredAssets = [...marketAssets];
        generateTreemap();
    }
    
    updateMarketStats();
}

// Menu mobile
function initMobileMenu() {
    const hamburger = document.querySelector('.hamburger');
    const navMenu = document.querySelector('.nav-menu');
    
    if (hamburger && navMenu) {
        hamburger.addEventListener('click', function() {
            navMenu.classList.toggle('active');
            hamburger.classList.toggle('active');
        });
    }
}

// Mostrar mensagens
function showMessage(message, type) {
    // Remove mensagem anterior se existir
    const existingMessage = document.querySelector('.market-message');
    if (existingMessage) {
        existingMessage.remove();
    }
    
    const messageDiv = document.createElement('div');
    messageDiv.className = `market-message ${type}`;
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

// Adicionar estilos para as animações das mensagens
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
    
    .info-value.positive {
        color: #00ff88 !important;
    }
    
    .info-value.negative {
        color: #ff4444 !important;
    }
`;
document.head.appendChild(style);

