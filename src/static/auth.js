// Script de autenticação comum
class AuthManager {
    constructor() {
        this.user = null;
        this.isAuthenticated = false;
    }

    // Verifica se o usuário está autenticado
    async checkAuth() {
        try {
            const response = await fetch('/api/check-auth', {
                method: 'GET',
                credentials: 'include'
            });
            
            const data = await response.json();
            
            if (data.authenticated) {
                this.isAuthenticated = true;
                this.user = data.user;
                return true;
            } else {
                this.isAuthenticated = false;
                this.user = null;
                return false;
            }
        } catch (error) {
            console.error('Erro ao verificar autenticação:', error);
            this.isAuthenticated = false;
            this.user = null;
            return false;
        }
    }

    // Faz logout
    async logout() {
        try {
            const response = await fetch('/api/logout', {
                method: 'POST',
                credentials: 'include'
            });
            
            const data = await response.json();
            
            if (data.success) {
                this.isAuthenticated = false;
                this.user = null;
                window.location.href = 'login.html';
            }
        } catch (error) {
            console.error('Erro ao fazer logout:', error);
        }
    }

    // Redireciona para login se não estiver autenticado
    async requireAuth() {
        const isAuth = await this.checkAuth();
        if (!isAuth) {
            window.location.href = 'login.html';
            return false;
        }
        return true;
    }

    // Atualiza informações do usuário na interface
    updateUserInfo() {
        if (this.isAuthenticated && this.user) {
            // Atualiza elementos que mostram informações do usuário
            const userElements = document.querySelectorAll('.user-info');
            userElements.forEach(element => {
                element.textContent = this.user.email || this.user.username;
            });

            // Show admin menu if user is admin
            if (this.user.is_admin) {
                const adminLinks = document.querySelectorAll('.admin-only');
                adminLinks.forEach(link => {
                    link.style.display = 'block';
                });
            }

            // Adiciona evento de logout aos botões de sair
            const logoutButtons = document.querySelectorAll('.logout-btn');
            logoutButtons.forEach(button => {
                button.addEventListener('click', (e) => {
                    e.preventDefault();
                    this.logout();
                });
            });
        }
    }
}

// Instância global do gerenciador de autenticação
const authManager = new AuthManager();

// Função para páginas que requerem autenticação
async function initAuthenticatedPage() {
    const isAuthenticated = await authManager.requireAuth();
    if (isAuthenticated) {
        authManager.updateUserInfo();
    }
}

// Função para a página de login
async function initLoginPage() {
    const isAuthenticated = await authManager.checkAuth();
    if (isAuthenticated) {
        // Se já estiver logado, redireciona para o dashboard
        window.location.href = 'buy_asset.html';
    }
}

