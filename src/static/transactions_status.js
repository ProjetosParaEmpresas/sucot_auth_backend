document.addEventListener('DOMContentLoaded', function() {
    const transactionsList = document.getElementById('transactions-list');
    const statusFilter = document.getElementById('status-filter');
    const typeFilter = document.getElementById('type-filter');
    
    let allTransactions = [];

    // Carregar transações
    loadTransactions();

    // Event listeners para filtros
    statusFilter.addEventListener('change', filterTransactions);
    typeFilter.addEventListener('change', filterTransactions);

    async function loadTransactions() {
        try {
            const response = await fetch('/api/transactions', {
                method: 'GET',
                credentials: 'include'
            });

            if (response.ok) {
                allTransactions = await response.json();
                displayTransactions(allTransactions);
            } else {
                transactionsList.innerHTML = '<div class="no-transactions">Erro ao carregar transações.</div>';
            }
        } catch (error) {
            console.error('Erro:', error);
            transactionsList.innerHTML = '<div class="no-transactions">Erro de conexão.</div>';
        }
    }

    function displayTransactions(transactions) {
        if (transactions.length === 0) {
            transactionsList.innerHTML = '<div class="no-transactions">Nenhuma transação encontrada.</div>';
            return;
        }

        const transactionsHTML = transactions.map(transaction => {
            const typeText = transaction.type === 'deposit' ? 'Depósito' : 'Saque';
            const statusText = getStatusText(transaction.status);
            const requestDate = new Date(transaction.request_date).toLocaleString('pt-BR');
            const approvalDate = transaction.approval_date ? 
                new Date(transaction.approval_date).toLocaleString('pt-BR') : 'N/A';

            return `
                <div class="transaction-item">
                    <div class="transaction-header">
                        <div class="transaction-type">${typeText}</div>
                        <div class="transaction-amount">R$ ${transaction.amount.toFixed(2)}</div>
                        <div class="transaction-status status-${transaction.status}">${statusText}</div>
                    </div>
                    <div class="transaction-details">
                        <div>Solicitado em: ${requestDate}</div>
                        <div>Processado em: ${approvalDate}</div>
                    </div>
                </div>
            `;
        }).join('');

        transactionsList.innerHTML = transactionsHTML;
    }

    function filterTransactions() {
        const statusValue = statusFilter.value;
        const typeValue = typeFilter.value;

        let filteredTransactions = allTransactions;

        if (statusValue) {
            filteredTransactions = filteredTransactions.filter(t => t.status === statusValue);
        }

        if (typeValue) {
            filteredTransactions = filteredTransactions.filter(t => t.type === typeValue);
        }

        displayTransactions(filteredTransactions);
    }

    function getStatusText(status) {
        switch (status) {
            case 'pending':
                return 'Pendente';
            case 'approved':
                return 'Aprovado';
            case 'rejected':
                return 'Rejeitado';
            default:
                return status;
        }
    }
});

