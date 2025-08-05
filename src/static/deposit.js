document.addEventListener('DOMContentLoaded', function() {
    const depositForm = document.getElementById('deposit-form');
    const messageDiv = document.getElementById('message');
    const amountInput = document.getElementById('amount');
    const methodCards = document.querySelectorAll('.method-card');
    const paymentForms = document.querySelectorAll('.payment-form');
    const formTitle = document.getElementById('form-title');
    const btnText = document.getElementById('btn-text');
    const btnLoading = document.querySelector('.btn-loading');
    const amountBtns = document.querySelectorAll('.amount-btn');
    
    // Elements for summary
    const depositAmountSpan = document.getElementById('deposit-amount');
    const feeAmountSpan = document.getElementById('fee-amount');
    const totalAmountSpan = document.getElementById('total-amount');
    
    // Card form elements
    const cardNumberInput = document.getElementById('card-number');
    const cardExpiryInput = document.getElementById('card-expiry');
    const cardCvvInput = document.getElementById('card-cvv');
    
    let currentMethod = 'pix';
    let currentAmount = 0;

    // Initialize
    updateSummary();

    // Method selection
    methodCards.forEach(card => {
        card.addEventListener('click', function() {
            const method = this.dataset.method;
            selectPaymentMethod(method);
        });
    });

    // Amount suggestions
    amountBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            const amount = this.dataset.amount;
            amountInput.value = amount;
            currentAmount = parseFloat(amount);
            updateSummary();
        });
    });

    // Amount input change
    amountInput.addEventListener('input', function() {
        currentAmount = parseFloat(this.value) || 0;
        updateSummary();
    });

    // Card number formatting
    if (cardNumberInput) {
        cardNumberInput.addEventListener('input', function() {
            let value = this.value.replace(/\s/g, '').replace(/[^0-9]/gi, '');
            let formattedValue = value.match(/.{1,4}/g)?.join(' ') || value;
            this.value = formattedValue;
        });
    }

    // Card expiry formatting
    if (cardExpiryInput) {
        cardExpiryInput.addEventListener('input', function() {
            let value = this.value.replace(/\D/g, '');
            if (value.length >= 2) {
                value = value.substring(0, 2) + '/' + value.substring(2, 4);
            }
            this.value = value;
        });
    }

    // CVV formatting
    if (cardCvvInput) {
        cardCvvInput.addEventListener('input', function() {
            this.value = this.value.replace(/\D/g, '');
        });
    }

    // Form submission
    depositForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        if (currentAmount <= 0) {
            showMessage('Valor deve ser maior que zero.', 'error');
            return;
        }

        if (currentMethod === 'card' && !validateCardForm()) {
            showMessage('Por favor, preencha todos os dados do cartão corretamente.', 'error');
            return;
        }

        // Show loading state
        btnText.style.display = 'none';
        btnLoading.style.display = 'flex';
        depositForm.querySelector('.btn-deposit').disabled = true;

        try {
            const response = await fetch('/api/deposit', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials: 'include',
                body: JSON.stringify({ 
                    amount: currentAmount,
                    method: currentMethod,
                    card_data: currentMethod === 'card' ? getCardData() : null
                })
            });

            const data = await response.json();

            if (data.success) {
                showMessage(data.message, 'success');
                depositForm.reset();
                currentAmount = 0;
                updateSummary();
                
                // If PIX, show additional instructions
                if (currentMethod === 'pix') {
                    setTimeout(() => {
                        showPixInstructions();
                    }, 2000);
                }
            } else {
                showMessage(data.message || 'Erro ao processar depósito.', 'error');
            }
        } catch (error) {
            console.error('Erro:', error);
            showMessage('Erro de conexão. Tente novamente.', 'error');
        } finally {
            // Hide loading state
            btnText.style.display = 'block';
            btnLoading.style.display = 'none';
            depositForm.querySelector('.btn-deposit').disabled = false;
        }
    });

    function selectPaymentMethod(method) {
        currentMethod = method;
        
        // Update active method card
        methodCards.forEach(card => {
            card.classList.remove('active');
            if (card.dataset.method === method) {
                card.classList.add('active');
            }
        });

        // Update active payment form
        paymentForms.forEach(form => {
            form.classList.remove('active');
        });
        document.getElementById(`${method}-form`).classList.add('active');

        // Update form title and button text
        if (method === 'pix') {
            formTitle.textContent = 'Depósito via PIX';
            btnText.textContent = 'Depositar via PIX';
        } else if (method === 'card') {
            formTitle.textContent = 'Depósito via Cartão';
            btnText.textContent = 'Depositar via Cartão';
        }

        updateSummary();
    }

    function updateSummary() {
        const fee = calculateFee(currentAmount, currentMethod);
        const total = currentAmount + fee;

        depositAmountSpan.textContent = formatCurrency(currentAmount);
        feeAmountSpan.textContent = fee > 0 ? formatCurrency(fee) : 'Gratuito';
        totalAmountSpan.textContent = formatCurrency(total);
    }

    function calculateFee(amount, method) {
        if (method === 'pix') {
            return 0; // PIX is free
        } else if (method === 'card') {
            return amount * 0.0299; // 2.99% fee for cards
        }
        return 0;
    }

    function formatCurrency(value) {
        return new Intl.NumberFormat('pt-BR', {
            style: 'currency',
            currency: 'BRL'
        }).format(value);
    }

    function validateCardForm() {
        const cardNumber = cardNumberInput.value.replace(/\s/g, '');
        const cardExpiry = cardExpiryInput.value;
        const cardCvv = cardCvvInput.value;
        const cardName = document.getElementById('card-name').value;

        return cardNumber.length >= 13 && 
               cardExpiry.length === 5 && 
               cardCvv.length >= 3 && 
               cardName.trim().length > 0;
    }

    function getCardData() {
        return {
            number: cardNumberInput.value.replace(/\s/g, ''),
            expiry: cardExpiryInput.value,
            cvv: cardCvvInput.value,
            name: document.getElementById('card-name').value
        };
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

    function showPixInstructions() {
        const pixModal = document.createElement('div');
        pixModal.className = 'pix-modal';
        pixModal.innerHTML = `
            <div class="pix-modal-content">
                <div class="pix-modal-header">
                    <h3>🎉 Depósito Solicitado!</h3>
                    <button class="close-modal">&times;</button>
                </div>
                <div class="pix-modal-body">
                    <p>Seu depósito via PIX foi solicitado com sucesso!</p>
                    <div class="pix-instructions">
                        <h4>Próximos passos:</h4>
                        <ol>
                            <li>Acesse seu banco ou app de pagamentos</li>
                            <li>Escolha a opção PIX</li>
                            <li>Use a chave PIX ou QR Code que será enviado por email</li>
                            <li>Confirme o pagamento</li>
                        </ol>
                    </div>
                    <div class="pix-note">
                        <p><strong>Importante:</strong> O valor será creditado automaticamente em sua conta após a confirmação do pagamento.</p>
                    </div>
                </div>
            </div>
        `;

        document.body.appendChild(pixModal);

        // Close modal functionality
        const closeBtn = pixModal.querySelector('.close-modal');
        closeBtn.addEventListener('click', () => {
            document.body.removeChild(pixModal);
        });

        pixModal.addEventListener('click', (e) => {
            if (e.target === pixModal) {
                document.body.removeChild(pixModal);
            }
        });
    }
});

// Add PIX modal styles
const pixModalStyles = `
<style>
.pix-modal {
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

.pix-modal-content {
    background: linear-gradient(135deg, #1a1a2e, #16213e);
    border-radius: 20px;
    padding: 2rem;
    max-width: 500px;
    width: 90%;
    border: 1px solid rgba(255, 215, 0, 0.3);
}

.pix-modal-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 1.5rem;
    padding-bottom: 1rem;
    border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.pix-modal-header h3 {
    color: #ffd700;
    font-size: 1.3rem;
    margin: 0;
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

.pix-modal-body p {
    color: #ffffff;
    margin-bottom: 1.5rem;
}

.pix-instructions h4 {
    color: #ffd700;
    margin-bottom: 1rem;
}

.pix-instructions ol {
    color: rgba(255, 255, 255, 0.8);
    padding-left: 1.5rem;
}

.pix-instructions li {
    margin-bottom: 0.5rem;
}

.pix-note {
    background: rgba(255, 215, 0, 0.1);
    border: 1px solid rgba(255, 215, 0, 0.3);
    border-radius: 12px;
    padding: 1rem;
    margin-top: 1.5rem;
}

.pix-note p {
    color: #ffd700;
    margin: 0;
    font-size: 0.9rem;
}
</style>
`;

document.head.insertAdjacentHTML('beforeend', pixModalStyles);

