document.addEventListener('DOMContentLoaded', function() {
    const form = document.getElementById('registerForm');
    const submitBtn = form.querySelector('.submit-btn');
    const btnText = submitBtn.querySelector('.btn-text');
    const btnLoader = submitBtn.querySelector('.btn-loader');

    // CPF mask
    const cpfInput = document.getElementById('cpf');
    cpfInput.addEventListener('input', function(e) {
        let value = e.target.value.replace(/\D/g, '');
        value = value.replace(/(\d{3})(\d)/, '$1.$2');
        value = value.replace(/(\d{3})(\d)/, '$1.$2');
        value = value.replace(/(\d{3})(\d{1,2})$/, '$1-$2');
        e.target.value = value;
    });

    // Password validation
    const passwordInput = document.getElementById('password');
    const confirmPasswordInput = document.getElementById('confirmPassword');

    function validatePassword() {
        const password = passwordInput.value;
        const confirmPassword = confirmPasswordInput.value;

        if (password.length < 8) {
            passwordInput.setCustomValidity('A senha deve ter pelo menos 8 caracteres');
        } else if (!/(?=.*[a-zA-Z])(?=.*\d)/.test(password)) {
            passwordInput.setCustomValidity('A senha deve conter pelo menos uma letra e um número');
        } else {
            passwordInput.setCustomValidity('');
        }

        if (confirmPassword && password !== confirmPassword) {
            confirmPasswordInput.setCustomValidity('As senhas não coincidem');
        } else {
            confirmPasswordInput.setCustomValidity('');
        }
    }

    passwordInput.addEventListener('input', validatePassword);
    confirmPasswordInput.addEventListener('input', validatePassword);

    // Form submission
    form.addEventListener('submit', async function(e) {
        e.preventDefault();

        // Validate form
        if (!form.checkValidity()) {
            form.reportValidity();
            return;
        }

        // Show loading state
        btnText.style.display = 'none';
        btnLoader.style.display = 'flex';
        submitBtn.disabled = true;

        try {
            // Collect form data
            const formData = new FormData(form);
            const data = {};

            // Convert FormData to object
            for (let [key, value] of formData.entries()) {
                if (key === 'investmentTypes') {
                    if (!data[key]) data[key] = [];
                    data[key].push(value);
                } else {
                    data[key] = value;
                }
            }

            // Convert investment types array to comma-separated string
            if (data.investmentTypes) {
                data.investmentTypes = data.investmentTypes.join(',');
            }

            // Map form fields to API fields
            const apiData = {
                email: data.email,
                password: data.password,
                full_name: data.fullName,
                date_of_birth: data.dateOfBirth,
                gender: data.gender,
                nationality: data.nationality,
                naturalness: data.naturalness,
                cpf: data.cpf,
                rg_cnh_front: data.rgCnhFront ? data.rgCnhFront.name : null,
                rg_cnh_back: data.rgCnhBack ? data.rgCnhBack.name : null,
                selfie_with_doc: data.selfieWithDoc ? data.selfieWithDoc.name : null,
                proof_of_residence: data.proofOfResidence ? data.proofOfResidence.name : null,
                occupation: data.occupation,
                company_name: data.companyName,
                monthly_income: parseFloat(data.monthlyIncome) || 0,
                estimated_wealth: parseFloat(data.estimatedWealth) || 0,
                source_of_income: data.sourceOfIncome,
                licit_resources_declaration: data.licitResourcesDeclaration === 'on',
                bank_name: data.bankName,
                bank_agency: data.bankAgency,
                bank_account: data.bankAccount,
                account_type: data.accountType,
                account_ownership: data.accountOwnership,
                investment_objective: data.investmentObjective,
                risk_tolerance: data.riskTolerance,
                investment_knowledge: data.investmentKnowledge,
                investment_types: data.investmentTypes || '',
                terms_of_use_accepted: data.termsOfUse === 'on',
                privacy_policy_accepted: data.privacyPolicy === 'on',
                lgpd_accepted: data.lgpdConsent === 'on',
                marketing_consent: data.marketingConsent === 'on'
            };

            // Send registration request
            const response = await fetch('/api/register', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials: 'include',
                body: JSON.stringify(apiData)
            });

            const result = await response.json();

            if (response.ok && result.success) {
                // Show success message
                showMessage('Cadastro enviado com sucesso! Aguarde a aprovação do administrador.', 'success');
                
                // Redirect to login page after 3 seconds
                setTimeout(() => {
                    window.location.href = 'login.html';
                }, 3000);
            } else {
                showMessage(result.message || 'Erro ao enviar cadastro. Tente novamente.', 'error');
            }
        } catch (error) {
            console.error('Erro:', error);
            showMessage('Erro de conexão. Tente novamente.', 'error');
        } finally {
            // Hide loading state
            btnText.style.display = 'block';
            btnLoader.style.display = 'none';
            submitBtn.disabled = false;
        }
    });

    function showMessage(text, type) {
        // Remove existing messages
        const existingMessages = document.querySelectorAll('.message');
        existingMessages.forEach(msg => msg.remove());

        // Create new message
        const message = document.createElement('div');
        message.className = `message ${type}`;
        message.textContent = text;

        // Insert message at the top of the form
        form.insertBefore(message, form.firstChild);

        // Auto-remove after 5 seconds
        setTimeout(() => {
            message.remove();
        }, 5000);
    }

    // File input styling
    const fileInputs = document.querySelectorAll('input[type="file"]');
    fileInputs.forEach(input => {
        input.addEventListener('change', function() {
            const fileName = this.files[0]?.name || 'Nenhum arquivo selecionado';
            const label = this.previousElementSibling;
            if (this.files[0]) {
                label.style.color = '#22c55e';
                label.textContent = label.textContent.split(' *')[0] + ' - ' + fileName + (label.textContent.includes(' *') ? ' *' : '');
            }
        });
    });
});

