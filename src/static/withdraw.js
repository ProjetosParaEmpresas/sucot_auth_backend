document.addEventListener('DOMContentLoaded', function() {
    const withdrawForm = document.getElementById('withdraw-form');
    const messageDiv = document.getElementById('message');
    const amountInput = document.getElementById('amount');
    const amountBtns = document.querySelectorAll('.amount-btn');
    const methodOptions = document.querySelectorAll('.method-option');
    const methodForms = document.querySelectorAll('.method-form');
    const formSteps = document.querySelectorAll('.form-step');
    const stepIndicators = document.querySelectorAll('.step');
    
    // Navigation buttons
    const prevBtn = document.getElementById('prev-btn');
    const nextBtn = document.getElementById('next-btn');
    const submitBtn = document.getElementById('submit-btn');
    const btnText = document.getElementById('btn-text');
    const btnLoading = document.querySelector('.btn-loading');
    
    // Form data
    let currentStep = 1;
    let withdrawData = {
        amount: 0,
        method: 'pix',
        destination: '',
        fee: 0
    };
    
    const availableBalance = 45230.18; // This should come from API

    // Initialize
    updateStepDisplay();
    updateAmountSuggestions();

    // Amount suggestions
    amountBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            const amount = this.dataset.amount;
            if (amount === 'all') {
                amountInput.value = availableBalance;
                withdrawData.amount = availableBalance;
            } else {
                amountInput.value = amount;
                withdrawData.amount = parseFloat(amount);
            }
            validateAmount();
        });
    });

    // Amount input change
    amountInput.addEventListener('input', function() {
        withdrawData.amount = parseFloat(this.value) || 0;
        validateAmount();
    });

    // Method selection
    methodOptions.forEach(option => {
        option.addEventListener('click', function() {
            const method = this.dataset.method;
            selectMethod(method);
        });
    });

    // Navigation
    nextBtn.addEventListener('click', function() {
        if (validateCurrentStep()) {
            nextStep();
        }
    });

    prevBtn.addEventListener('click', function() {
        prevStep();
    });

    // Form submission
    withdrawForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        if (!validateCurrentStep()) {
            return;
        }

        // Show loading state
        btnText.style.display = 'none';
        btnLoading.style.display = 'flex';
        submitBtn.disabled = true;

        try {
            const response = await fetch('/api/withdraw', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials: 'include',
                body: JSON.stringify({
                    amount: withdrawData.amount,
                    method: withdrawData.method,
                    destination: withdrawData.destination
                })
            });

            const data = await response.json();

            if (data.success) {
                showMessage(data.message, 'success');
                setTimeout(() => {
                    showSuccessModal();
                }, 1000);
            } else {
                showMessage(data.message || 'Erro ao processar saque.', 'error');
            }
        } catch (error) {
            console.error('Erro:', error);
            showMessage('Erro de conexão. Tente novamente.', 'error');
        } finally {
            // Hide loading state
            btnText.style.display = 'block';
            btnLoading.style.display = 'none';
            submitBtn.disabled = false;
        }
    });

    function updateAmountSuggestions() {
        const allBtn = document.querySelector('[data-amount="all"]');
        if (allBtn) {
            allBtn.textContent = `R$ ${formatCurrency(availableBalance)}`;
        }
    }

    function validateAmount() {
        const amount = withdrawData.amount;
        const isValid = amount > 0 && amount <= availableBalance;
        
        if (amount > availableBalance) {
            showMessage('Valor excede o saldo disponível.', 'error');
            return false;
        }
        
        return isValid;
    }

    function selectMethod(method) {
        withdrawData.method = method;
        
        // Update active method option
        methodOptions.forEach(option => {
            option.classList.remove('active');
            if (option.dataset.method === method) {
                option.classList.add('active');
                option.querySelector('input[type="radio"]').checked = true;
            }
        });

        // Update active method form
        methodForms.forEach(form => {
            form.classList.remove('active');
        });
        document.getElementById(`${method}-details`).classList.add('active');

        // Update fee
        withdrawData.fee = method === 'ted' ? 15 : 0;
    }

    function validateCurrentStep() {
        switch (currentStep) {
            case 1:
                if (withdrawData.amount <= 0) {
                    showMessage('Digite um valor válido para o saque.', 'error');
                    return false;
                }
                if (withdrawData.amount > availableBalance) {
                    showMessage('Valor excede o saldo disponível.', 'error');
                    return false;
                }
                return true;
                
            case 2:
                if (withdrawData.method === 'pix') {
                    const pixKey = document.getElementById('pix-key').value.trim();
                    if (!pixKey) {
                        showMessage('Digite uma chave PIX válida.', 'error');
                        return false;
                    }
                    withdrawData.destination = pixKey;
                } else if (withdrawData.method === 'ted') {
                    const bank = document.getElementById('bank').value.trim();
                    const agency = document.getElementById('agency').value.trim();
                    const account = document.getElementById('account').value.trim();
                    
                    if (!bank || !agency || !account) {
                        showMessage('Preencha todos os dados bancários.', 'error');
                        return false;
                    }
                    
                    withdrawData.destination = `${bank} - Ag: ${agency} - Conta: ${account}`;
                }
                return true;
                
            case 3:
                return true;
                
            default:
                return false;
        }
    }

    function nextStep() {
        if (currentStep < 3) {
            currentStep++;
            updateStepDisplay();
            
            if (currentStep === 3) {
                updateConfirmationSummary();
            }
        }
    }

    function prevStep() {
        if (currentStep > 1) {
            currentStep--;
            updateStepDisplay();
        }
    }

    function updateStepDisplay() {
        // Update step indicators
        stepIndicators.forEach((step, index) => {
            step.classList.remove('active');
            if (index + 1 <= currentStep) {
                step.classList.add('active');
            }
        });

        // Update form steps
        formSteps.forEach((step, index) => {
            step.classList.remove('active');
            if (index + 1 === currentStep) {
                step.classList.add('active');
            }
        });

        // Update navigation buttons
        prevBtn.style.display = currentStep > 1 ? 'block' : 'none';
        nextBtn.style.display = currentStep < 3 ? 'block' : 'none';
        submitBtn.style.display = currentStep === 3 ? 'block' : 'none';
    }

    function updateConfirmationSummary() {
        document.getElementById('confirm-amount').textContent = formatCurrency(withdrawData.amount);
        document.getElementById('confirm-method').textContent = withdrawData.method === 'pix' ? 'PIX' : 'TED';
        document.getElementById('confirm-destination').textContent = withdrawData.destination;
        document.getElementById('confirm-fee').textContent = withdrawData.fee > 0 ? formatCurrency(withdrawData.fee) : 'Gratuito';
        document.getElementById('confirm-total').textContent = formatCurrency(withdrawData.amount - withdrawData.fee);
    }

    function formatCurrency(value) {
        return new Intl.NumberFormat('pt-BR', {
            style: 'currency',
            currency: 'BRL'
        }).format(value);
    }

    function showMessage(message, type) {
        messageDiv.textContent = message;
        messageDiv.className = `message ${type}`;
        messageDiv.style.display = 'block';
        
        // Auto hide after 5 seconds
        setTimeout(() => {
            messageDiv.style.display = 'none';
        }, 5000);

        // Scroll to message
        messageDiv.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }

    function showSuccessModal() {
        const successModal = document.createElement('div');
        successModal.className = 'success-modal';
        successModal.innerHTML = `
            <div class="success-modal-content">
                <div class="success-modal-header">
                    <div class="success-icon">✅</div>
                    <h3>Saque Solicitado!</h3>
                    <button class="close-modal">&times;</button>
                </div>
                <div class="success-modal-body">
                    <p>Sua solicitação de saque foi enviada com sucesso!</p>
                    <div class="success-details">
                        <div class="detail-row">
                            <span>Valor:</span>
                            <span>${formatCurrency(withdrawData.amount)}</span>
                        </div>
                        <div class="detail-row">
                            <span>Método:</span>
                            <span>${withdrawData.method === 'pix' ? 'PIX' : 'TED'}</span>
                        </div>
                        <div class="detail-row">
                            <span>Processamento:</span>
                            <span>${withdrawData.method === 'pix' ? 'Até 1 hora' : 'Até 1 dia útil'}</span>
                        </div>
                    </div>
                    <div class="success-note">
                        <p><strong>Próximos passos:</strong></p>
                        <ul>
                            <li>Sua solicitação será analisada pela nossa equipe</li>
                            <li>Você receberá uma notificação quando for processada</li>
                            <li>Acompanhe o status na página "Status Transações"</li>
                        </ul>
                    </div>
                    <div class="success-actions">
                        <button class="btn-view-status">Ver Status</button>
                        <button class="btn-new-withdraw">Novo Saque</button>
                    </div>
                </div>
            </div>
        `;

        document.body.appendChild(successModal);

        // Event listeners
        const closeBtn = successModal.querySelector('.close-modal');
        const viewStatusBtn = successModal.querySelector('.btn-view-status');
        const newWithdrawBtn = successModal.querySelector('.btn-new-withdraw');

        closeBtn.addEventListener('click', () => {
            document.body.removeChild(successModal);
        });

        viewStatusBtn.addEventListener('click', () => {
            window.location.href = 'transactions_status.html';
        });

        newWithdrawBtn.addEventListener('click', () => {
            document.body.removeChild(successModal);
            resetForm();
        });

        successModal.addEventListener('click', (e) => {
            if (e.target === successModal) {
                document.body.removeChild(successModal);
            }
        });
    }

    function resetForm() {
        withdrawForm.reset();
        currentStep = 1;
        withdrawData = {
            amount: 0,
            method: 'pix',
            destination: '',
            fee: 0
        };
        updateStepDisplay();
        selectMethod('pix');
        messageDiv.style.display = 'none';
    }

    // PIX key type change
    const pixKeyType = document.getElementById('pix-key-type');
    const pixKeyInput = document.getElementById('pix-key');
    
    if (pixKeyType && pixKeyInput) {
        pixKeyType.addEventListener('change', function() {
            const type = this.value;
            switch (type) {
                case 'cpf':
                    pixKeyInput.placeholder = '000.000.000-00';
                    break;
                case 'email':
                    pixKeyInput.placeholder = 'seu@email.com';
                    break;
                case 'phone':
                    pixKeyInput.placeholder = '(11) 99999-9999';
                    break;
                case 'random':
                    pixKeyInput.placeholder = 'Chave aleatória';
                    break;
            }
        });
    }
});

// Add success modal styles
const successModalStyles = `
<style>
.success-modal {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.8);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 1000;
}

.success-modal-content {
    background: linear-gradient(135deg, #1a1a2e, #16213e);
    border-radius: 20px;
    padding: 2rem;
    max-width: 500px;
    width: 90%;
    border: 1px solid rgba(255, 215, 0, 0.3);
    max-height: 80vh;
    overflow-y: auto;
}

.success-modal-header {
    display: flex;
    align-items: center;
    gap: 1rem;
    margin-bottom: 1.5rem;
    padding-bottom: 1rem;
    border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.success-icon {
    font-size: 2rem;
}

.success-modal-header h3 {
    color: #10b981;
    font-size: 1.3rem;
    margin: 0;
    flex: 1;
}

.close-modal {
    background: none;
    border: none;
    color: rgba(255, 255, 255, 0.7);
    font-size: 1.5rem;
    cursor: pointer;
    padding: 0;
    width: 30px;
    height: 30px;
    display: flex;
    align-items: center;
    justify-content: center;
}

.close-modal:hover {
    color: #ffffff;
}

.success-modal-body p {
    color: #ffffff;
    margin-bottom: 1.5rem;
}

.success-details {
    background: rgba(255, 255, 255, 0.05);
    border-radius: 12px;
    padding: 1rem;
    margin-bottom: 1.5rem;
}

.detail-row {
    display: flex;
    justify-content: space-between;
    padding: 0.5rem 0;
    color: rgba(255, 255, 255, 0.8);
}

.detail-row:not(:last-child) {
    border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.success-note {
    background: rgba(16, 185, 129, 0.1);
    border: 1px solid rgba(16, 185, 129, 0.3);
    border-radius: 12px;
    padding: 1rem;
    margin-bottom: 1.5rem;
}

.success-note p {
    color: #10b981;
    margin: 0 0 0.5rem 0;
    font-weight: 600;
}

.success-note ul {
    color: rgba(255, 255, 255, 0.8);
    margin: 0;
    padding-left: 1.5rem;
}

.success-note li {
    margin-bottom: 0.25rem;
}

.success-actions {
    display: flex;
    gap: 1rem;
}

.btn-view-status,
.btn-new-withdraw {
    flex: 1;
    padding: 0.75rem 1rem;
    border: none;
    border-radius: 8px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.3s ease;
}

.btn-view-status {
    background: linear-gradient(135deg, #ffd700, #ffed4e);
    color: #1a1a2e;
}

.btn-new-withdraw {
    background: rgba(255, 255, 255, 0.1);
    color: #ffffff;
    border: 1px solid rgba(255, 255, 255, 0.2);
}

.btn-view-status:hover {
    transform: translateY(-2px);
    box-shadow: 0 5px 15px rgba(255, 215, 0, 0.4);
}

.btn-new-withdraw:hover {
    background: rgba(255, 255, 255, 0.15);
}
</style>
`;

document.head.insertAdjacentHTML('beforeend', successModalStyles);

