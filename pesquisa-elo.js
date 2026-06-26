document.addEventListener('DOMContentLoaded', () => {
    // Inicialização das escalas (0-10)
    const generateScale = (containerId, inputName) => {
        const container = document.getElementById(containerId);
        if (!container) return;
        for (let i = 0; i <= 10; i++) {
            const item = document.createElement('div');
            item.className = 'radio-scale-item';
            
            const input = document.createElement('input');
            input.type = 'radio';
            input.name = inputName;
            input.value = i;
            input.id = `${inputName}-${i}`;
            
            const label = document.createElement('label');
            label.className = 'scale-label-btn';
            label.htmlFor = `${inputName}-${i}`;
            label.textContent = i;
            
            item.appendChild(input);
            item.appendChild(label);
            container.appendChild(item);
        }
    };

    generateScale('q1-group', 'satisfacaoProjeto');
    generateScale('q2-group', 'confiancaAntes');
    generateScale('q3-group', 'confiancaHoje');

    // Elementos do DOM
    const form = document.getElementById('survey-form');
    const submitBtn = document.getElementById('submit-btn');
    const btnText = submitBtn.querySelector('.btn-text');
    const loader = submitBtn.querySelector('.loader');
    const formErrorMsg = document.getElementById('form-error-msg');
    const networkErrorMsg = document.getElementById('network-error-msg');
    const successScreen = document.getElementById('success-screen');
    const progressBar = document.getElementById('progress-bar');
    const cards = document.querySelectorAll('.question-card');
    
    // Condicional da P1
    const q1ConditionalContainer = document.getElementById('q1-conditional-container');
    const q1ConditionalLabel = document.getElementById('q1-conditional-label');
    const feedbackSatisfacao = document.getElementById('feedbackSatisfacao');

    form.addEventListener('change', (e) => {
        if (e.target.name === 'satisfacaoProjeto') {
            const value = parseInt(e.target.value, 10);
            q1ConditionalContainer.classList.remove('hidden');
            
            if (value >= 0 && value <= 6) {
                q1ConditionalLabel.textContent = "Por favor, explique suas insatisfações para que possamos alcançar resultados melhores.";
            } else if (value >= 7 && value <= 8) {
                q1ConditionalLabel.textContent = "O que podemos melhorar para alcançar seu 10?";
            } else if (value >= 9 && value <= 10) {
                q1ConditionalLabel.textContent = "O que mais contribuiu para sua satisfação?";
            }
            validateStep();
        }
    });

    // Multi-step Logic
    let currentStep = 0;
    const totalSteps = cards.length;

    const showStep = (stepIndex) => {
        cards.forEach((card, index) => {
            if (index === stepIndex) {
                card.classList.add('active');
            } else {
                card.classList.remove('active');
            }
        });
        updateProgress();
        validateStep();
        
        // Esconde erro de validação global ao mudar de tela
        if(formErrorMsg) formErrorMsg.classList.add('hidden');
    };

    const updateProgress = () => {
        // Barra de progresso baseada na etapa atual
        const progressPercentage = (currentStep / (totalSteps - 1)) * 100;
        progressBar.style.width = `${progressPercentage}%`;
    };

    // Valida apenas os campos obrigatórios do CARD ATUAL
    const validateStep = () => {
        const currentCard = cards[currentStep];
        const nextBtn = currentCard.querySelector('.btn-next');
        if (!nextBtn && currentStep !== totalSteps - 1) return; // Só checa se tiver botão de avançar

        let isValid = true;

        // Se for a P1, precisa checar a condicional
        if (currentCard.getAttribute('data-question') === '1') {
            const radioChecked = currentCard.querySelector('input[type="radio"]:checked');
            if (!radioChecked) isValid = false;
            if (radioChecked && !q1ConditionalContainer.classList.contains('hidden')) {
                if (feedbackSatisfacao.value.trim() === '') isValid = false;
            }
        } 
        // Demais perguntas
        else {
            const requiredRadios = currentCard.querySelectorAll('input[type="radio"]');
            if (requiredRadios.length > 0) {
                // Checa se há algum radio group neste card (se tiver, consideramos obrigatório)
                const isAnyChecked = currentCard.querySelector('input[type="radio"]:checked');
                if (!isAnyChecked) isValid = false;
            }
        }

        // P6 e P7 são opcionais (textos), não invalidam
        if (currentCard.getAttribute('data-question') === '6' || currentCard.getAttribute('data-question') === '7') {
            isValid = true;
        }

        // Habilita/Desabilita o botão Avançar
        if (nextBtn) {
            nextBtn.disabled = !isValid;
        }
        
        // Habilita/Desabilita o botão Submit na última etapa
        if (currentStep === totalSteps - 1) {
            submitBtn.disabled = !isValid;
        }

        return isValid;
    };

    // Listeners para navegação
    cards.forEach((card, index) => {
        const nextBtn = card.querySelector('.btn-next');
        const prevBtn = card.querySelector('.btn-prev');

        if (nextBtn) {
            nextBtn.addEventListener('click', () => {
                if (validateStep()) {
                    currentStep++;
                    showStep(currentStep);
                }
            });
        }

        if (prevBtn) {
            prevBtn.addEventListener('click', () => {
                currentStep--;
                showStep(currentStep);
            });
        }
    });

    // Validar etapa atual a cada input
    form.addEventListener('input', validateStep);
    form.addEventListener('change', validateStep);

    // Inicialização
    showStep(currentStep);

    // Submit
    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        if (!validateStep()) {
            formErrorMsg.classList.remove('hidden');
            return;
        }

        // Prepara UI para carregamento
        submitBtn.disabled = true;
        btnText.classList.add('hidden');
        loader.classList.remove('hidden');
        networkErrorMsg.classList.add('hidden');
        formErrorMsg.classList.add('hidden');

        // Coleta os dados
        const formData = new FormData(form);
        
        const payload = {
            satisfacaoProjeto: parseInt(formData.get('satisfacaoProjeto'), 10),
            feedbackSatisfacao: formData.get('feedbackSatisfacao') || "",
            confiancaAntes: parseInt(formData.get('confiancaAntes'), 10),
            confiancaHoje: parseInt(formData.get('confiancaHoje'), 10),
            avaliacaoComunicacao: formData.get('avaliacaoComunicacao') || "",
            avaliacaoTrabalho: formData.get('avaliacaoTrabalho') || "",
            comentario: formData.get('comentario') || "",
            nome: formData.get('nome') || "",
            autorizacaoMarketing: formData.get('autorizacaoMarketing') || "",
            dataEnvio: new Date().toISOString(),
            userAgent: navigator.userAgent,
            origem: "Pesquisa 1 mês Projeto ELO"
        };

        try {
            const webhookUrl = "https://n8n-n8n.4wnalj.easypanel.host/webhook/pesquisa-fma-1mes";
            
            const response = await fetch(webhookUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(payload)
            });

            if (!response.ok) {
                throw new Error('Erro na comunicação com o servidor');
            }

            // Sucesso
            form.classList.add('hidden');
            document.querySelector('.survey-header').classList.add('hidden');
            document.querySelector('.progress-container').classList.add('hidden');
            
            successScreen.classList.remove('hidden');
            
            // Scroll para o topo
            window.scrollTo({ top: 0, behavior: 'smooth' });

        } catch (error) {
            console.error("Erro ao enviar pesquisa:", error);
            networkErrorMsg.classList.remove('hidden');
            
            // Restaura botão
            submitBtn.disabled = false;
            btnText.classList.remove('hidden');
            loader.classList.add('hidden');
        }
    });
});
