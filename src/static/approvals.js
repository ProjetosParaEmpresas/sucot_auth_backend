document.addEventListener("DOMContentLoaded", function() {
    const usersTableBody = document.getElementById("users-table-body");
    const transactionsTableBody = document.getElementById("transactions-table-body");
    const pendingCountSpan = document.getElementById("pendingCount");
    const approvedCountSpan = document.getElementById("approvedCount");
    const rejectedCountSpan = document.getElementById("rejectedCount");
    const pendingTransactionsCountSpan = document.getElementById("pendingTransactionsCount");
    const approvedTransactionsCountSpan = document.getElementById("approvedTransactionsCount");
    const rejectedTransactionsCountSpan = document.getElementById("rejectedTransactionsCount");
    const userStatusFilter = document.getElementById("user-status-filter");
    const transactionStatusFilter = document.getElementById("transaction-status-filter");
    const transactionTypeFilter = document.getElementById("transaction-type-filter");
    const noUsersMessage = document.getElementById("no-users-message");
    const noTransactionsMessage = document.getElementById("no-transactions-message");

    let allUsers = [];
    let allTransactions = [];

    // Modal elements
    const userDetailsModal = document.getElementById("userDetailsModal");
    const closeModalButton = userDetailsModal.querySelector(".close-button");
    const modalBodyContent = document.getElementById("modal-body-content");
    const approveUserBtn = document.getElementById("approveUserBtn");
    const rejectUserBtn = document.getElementById("rejectUserBtn");
    const deleteUserBtn = document.getElementById("deleteUserBtn");

    let currentUserId = null;
    let currentTransactionId = null;

    // Check admin status on page load
    checkAdminStatus();

    async function checkAdminStatus() {
        try {
            const response = await fetch("/api/check-auth", { credentials: "include" });
            const data = await response.json();
            if (!data.authenticated || !data.user.is_admin) {
                window.location.href = "/login.html";
            }
        } catch (error) {
            console.error("Erro ao verificar autenticação:", error);
            window.location.href = "/login.html";
        }
    }

    // Load data on page load
    loadUsers();
    loadTransactions();

    // Event Listeners for filters
    userStatusFilter.addEventListener("change", filterUsers);
    transactionStatusFilter.addEventListener("change", filterTransactions);
    transactionTypeFilter.addEventListener("change", filterTransactions);

    // User functions
    async function loadUsers() {
        try {
            const response = await fetch("/api/users", { credentials: "include" });
            if (response.ok) {
                allUsers = await response.json();
                updateUsersDisplay();
            } else {
                usersTableBody.innerHTML = `<tr><td colspan="6">Erro ao carregar usuários.</td></tr>`;
                noUsersMessage.style.display = "block";
            }
        } catch (error) {
            console.error("Erro ao carregar usuários:", error);
            usersTableBody.innerHTML = `<tr><td colspan="6">Erro de conexão.</td></tr>`;
            noUsersMessage.style.display = "block";
        }
    }

    function updateUsersDisplay() {
        const filteredUsers = filterUsersData(allUsers, userStatusFilter.value);
        displayUsers(filteredUsers);
        updateUserStats(allUsers);
    }

    function filterUsersData(users, status) {
        if (!status) return users;
        return users.filter(user => user.status === status);
    }

    function displayUsers(users) {
        usersTableBody.innerHTML = "";
        if (users.length === 0) {
            noUsersMessage.style.display = "block";
            return;
        }
        noUsersMessage.style.display = "none";

        users.forEach(user => {
            const row = usersTableBody.insertRow();
            row.innerHTML = `
                <td>${user.id}</td>
                <td>${user.email}</td>
                <td>${user.full_name || "N/A"}</td>
                <td><span class="status-badge status-${user.status}">${getStatusText(user.status)}</span></td>
                <td>
                    <button class="btn-view-details" data-user-id="${user.id}">Ver Detalhes</button>
                    <button class="btn-delete" data-user-id="${user.id}">Excluir</button>
                </td>
            `;
        });

        document.querySelectorAll(".btn-view-details").forEach(button => {
            button.addEventListener("click", function() {
                const userId = this.dataset.userId;
                openUserDetailsModal(userId);
            });
        });

        document.querySelectorAll(".btn-delete").forEach(button => {
            button.addEventListener("click", function() {
                const userId = this.dataset.userId;
                if (confirm("Tem certeza que deseja excluir este usuário?")) {
                    deleteUser(userId);
                }
            });
        });
    }

    function updateUserStats(users) {
        const pending = users.filter(user => user.status === "pending").length;
        const approved = users.filter(user => user.status === "approved").length;
        const rejected = users.filter(user => user.status === "rejected").length;

        pendingCountSpan.textContent = pending;
        approvedCountSpan.textContent = approved;
        rejectedCountSpan.textContent = rejected;
    }

    function filterUsers() {
        updateUsersDisplay();
    }

    async function openUserDetailsModal(userId) {
        const user = allUsers.find(u => u.id == userId);
        if (!user) return;

        currentUserId = userId;
        modalBodyContent.innerHTML = `
            <p><strong>ID:</strong> ${user.id}</p>
            <p><strong>Email:</strong> ${user.email}</p>
            <p><strong>Nome Completo:</strong> ${user.full_name || "N/A"}</p>
            <p><strong>Status:</strong> <span class="status-badge status-${user.status}">${getStatusText(user.status)}</span></p>
            <h3>Dados Pessoais</h3>
            <p><strong>Data de Nascimento:</strong> ${user.date_of_birth || "N/A"}</p>
            <p><strong>Gênero:</strong> ${user.gender || "N/A"}</p>
            <p><strong>Nacionalidade:</strong> ${user.nationality || "N/A"}</p>
            <p><strong>Naturalidade:</strong> ${user.naturalness || "N/A"}</p>
            <p><strong>CPF:</strong> ${user.cpf || "N/A"}</p>
            <h3>Documentos de Identificação</h3>
            <p><strong>RG/CNH Frente:</strong> ${user.rg_cnh_front ? `<a href="${user.rg_cnh_front}" target="_blank">Ver Documento</a>` : "N/A"}</p>
            <p><strong>RG/CNH Verso:</strong> ${user.rg_cnh_back ? `<a href="${user.rg_cnh_back}" target="_blank">Ver Documento</a>` : "N/A"}</p>
            <p><strong>Selfie com Documento:</strong> ${user.selfie_with_doc ? `<a href="${user.selfie_with_doc}" target="_blank">Ver Documento</a>` : "N/A"}</p>
            <p><strong>Comprovante de Residência:</strong> ${user.proof_of_residence ? `<a href="${user.proof_of_residence}" target="_blank">Ver Documento</a>` : "N/A"}</p>
            <h3>Informações Financeiras</h3>
            <p><strong>Ocupação:</strong> ${user.occupation || "N/A"}</p>
            <p><strong>Empresa:</strong> ${user.company_name || "N/A"}</p>
            <p><strong>Renda Mensal:</strong> ${user.monthly_income ? `R$ ${user.monthly_income.toFixed(2)}` : "N/A"}</p>
            <p><strong>Patrimônio Estimado:</strong> ${user.estimated_wealth ? `R$ ${user.estimated_wealth.toFixed(2)}` : "N/A"}</p>
            <p><strong>Fonte de Renda:</strong> ${user.source_of_income || "N/A"}</p>
            <p><strong>Declaração de Recursos Lícitos:</strong> ${user.licit_resources_declaration ? "Sim" : "Não"}</p>
            <h3>Informações Bancárias</h3>
            <p><strong>Banco:</strong> ${user.bank_name || "N/A"}</p>
            <p><strong>Agência:</strong> ${user.bank_agency || "N/A"}</p>
            <p><strong>Conta:</strong> ${user.bank_account || "N/A"}</p>
            <p><strong>Tipo de Conta:</strong> ${user.account_type || "N/A"}</p>
            <p><strong>Titularidade:</strong> ${user.account_ownership || "N/A"}</p>
            <h3>Perfil do Investidor</h3>
            <p><strong>Objetivo:</strong> ${user.investment_objective || "N/A"}</p>
            <p><strong>Tolerância a Risco:</strong> ${user.risk_tolerance || "N/A"}</p>
            <p><strong>Conhecimento:</strong> ${user.investment_knowledge || "N/A"}</p>
            <p><strong>Tipos de Investimento:</strong> ${user.investment_types || "N/A"}</p>
            <h3>Termos e Consentimentos</h3>
            <p><strong>Termos de Uso Aceitos:</strong> ${user.terms_of_use_accepted ? "Sim" : "Não"}</p>
            <p><strong>Política de Privacidade Aceita:</strong> ${user.privacy_policy_accepted ? "Sim" : "Não"}</p>
            <p><strong>LGPD Aceita:</strong> ${user.lgpd_accepted ? "Sim" : "Não"}</p>
            <p><strong>Consentimento Marketing:</strong> ${user.marketing_consent ? "Sim" : "Não"}</p>
        `;

        // Show/hide action buttons based on user status
        if (user.status === "pending") {
            approveUserBtn.style.display = "inline-block";
            rejectUserBtn.style.display = "inline-block";
        } else {
            approveUserBtn.style.display = "none";
            rejectUserBtn.style.display = "none";
        }

        userDetailsModal.style.display = "block";
    }

    closeModalButton.onclick = function() {
        userDetailsModal.style.display = "none";
        currentUserId = null;
    };

    window.onclick = function(event) {
        if (event.target == userDetailsModal) {
            userDetailsModal.style.display = "none";
            currentUserId = null;
        }
    };

    approveUserBtn.onclick = async function() {
        if (currentUserId) {
            await updateUserStatus(currentUserId, "approve");
        }
    };

    rejectUserBtn.onclick = async function() {
        if (currentUserId) {
            await updateUserStatus(currentUserId, "reject");
        }
    };

    deleteUserBtn.onclick = async function() {
        if (currentUserId) {
            if (confirm("Tem certeza que deseja excluir este usuário permanentemente?")) {
                await deleteUser(currentUserId);
            }
        }
    };

    async function updateUserStatus(userId, action) {
        try {
            const response = await fetch(`/api/users/${userId}/${action}`, {
                method: "POST",
                credentials: "include"
            });
            if (response.ok) {
                alert(`Usuário ${action === "approve" ? "aprovado" : "rejeitado"} com sucesso!`);
                userDetailsModal.style.display = "none";
                loadUsers(); // Reload users to update the list and stats
            } else {
                const errorData = await response.json();
                alert(`Erro ao ${action} usuário: ${errorData.error || response.statusText}`);
            }
        } catch (error) {
            console.error(`Erro ao ${action} usuário:`, error);
            alert("Erro de conexão ao atualizar status do usuário.");
        }
    }

    async function deleteUser(userId) {
        try {
            const response = await fetch(`/api/users/${userId}`, {
                method: "DELETE",
                credentials: "include"
            });
            if (response.ok) {
                alert("Usuário excluído com sucesso!");
                userDetailsModal.style.display = "none";
                loadUsers(); // Reload users
            } else {
                const errorData = await response.json();
                alert(`Erro ao excluir usuário: ${errorData.error || response.statusText}`);
            }
        } catch (error) {
            console.error("Erro ao excluir usuário:", error);
            alert("Erro de conexão ao excluir usuário.");
        }
    }

    function getStatusText(status) {
        switch (status) {
            case "pending": return "Pendente";
            case "approved": return "Aprovado";
            case "rejected": return "Rejeitado";
            default: return status;
        }
    }

    // Transaction functions
    async function loadTransactions() {
        try {
            const response = await fetch("/api/transactions", { credentials: "include" });
            if (response.ok) {
                allTransactions = await response.json();
                updateTransactionsDisplay();
            } else {
                transactionsTableBody.innerHTML = `<tr><td colspan="7">Erro ao carregar transações.</td></tr>`;
                noTransactionsMessage.style.display = "block";
            }
        } catch (error) {
            console.error("Erro ao carregar transações:", error);
            transactionsTableBody.innerHTML = `<tr><td colspan="7">Erro de conexão.</td></tr>`;
            noTransactionsMessage.style.display = "block";
        }
    }

    function updateTransactionsDisplay() {
        const filteredTransactions = filterTransactionsData(allTransactions, transactionStatusFilter.value, transactionTypeFilter.value);
        displayTransactions(filteredTransactions);
        updateTransactionStats(allTransactions);
    }

    function filterTransactionsData(transactions, status, type) {
        let filtered = transactions;
        if (status) {
            filtered = filtered.filter(t => t.status === status);
        }
        if (type) {
            filtered = filtered.filter(t => t.type === type);
        }
        return filtered;
    }

    function displayTransactions(transactions) {
        transactionsTableBody.innerHTML = "";
        if (transactions.length === 0) {
            noTransactionsMessage.style.display = "block";
            return;
        }
        noTransactionsMessage.style.display = "none";

        transactions.forEach(transaction => {
            const row = transactionsTableBody.insertRow();
            const typeText = transaction.type === "deposit" ? "Depósito" : "Saque";
            const statusText = getStatusText(transaction.status);
            const requestDate = new Date(transaction.request_date).toLocaleString("pt-BR");

            row.innerHTML = `
                <td>${transaction.id}</td>
                <td>${transaction.user_id}</td> <!-- Placeholder for user email -->
                <td>${typeText}</td>
                <td>R$ ${transaction.amount.toFixed(2)}</td>
                <td><span class="status-badge status-${transaction.status}">${statusText}</span></td>
                <td>${requestDate}</td>
                <td>
                    ${transaction.status === "pending" ? 
                        `<button class="btn-approve-transaction" data-transaction-id="${transaction.id}">Aprovar</button>
                         <button class="btn-reject-transaction" data-transaction-id="${transaction.id}">Rejeitar</button>` : ""}
                </td>
            `;
        });

        document.querySelectorAll(".btn-approve-transaction").forEach(button => {
            button.addEventListener("click", function() {
                const transactionId = this.dataset.transactionId;
                updateTransactionStatus(transactionId, "approve");
            });
        });

        document.querySelectorAll(".btn-reject-transaction").forEach(button => {
            button.addEventListener("click", function() {
                const transactionId = this.dataset.transactionId;
                updateTransactionStatus(transactionId, "reject");
            });
        });
    }

    function updateTransactionStats(transactions) {
        const pending = transactions.filter(t => t.status === "pending").length;
        const approved = transactions.filter(t => t.status === "approved").length;
        const rejected = transactions.filter(t => t.status === "rejected").length;

        pendingTransactionsCountSpan.textContent = pending;
        approvedTransactionsCountSpan.textContent = approved;
        rejectedTransactionsCountSpan.textContent = rejected;
    }

    function filterTransactions() {
        updateTransactionsDisplay();
    }

    async function updateTransactionStatus(transactionId, action) {
        try {
            const response = await fetch(`/api/transactions/${transactionId}/${action}`, {
                method: "POST",
                credentials: "include"
            });
            if (response.ok) {
                alert(`Transação ${action === "approve" ? "aprovada" : "rejeitada"} com sucesso!`);
                loadTransactions(); // Reload transactions to update the list and stats
            } else {
                const errorData = await response.json();
                alert(`Erro ao ${action} transação: ${errorData.error || response.statusText}`);
            }
        } catch (error) {
            console.error(`Erro ao ${action} transação:`, error);
            alert("Erro de conexão ao atualizar status da transação.");
        }
    }
});
});
});


