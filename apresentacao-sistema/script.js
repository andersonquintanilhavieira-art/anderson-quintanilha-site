const videos = [
    { title: "Introdução", src: "../Apresentação Sistema/Introdução/Introdução-1.mp4" },
    { title: "Abertura de um novo atendimento", src: "../Apresentação Sistema/Abertura de um novo atendimento/Abertura de um novo atendimento-1.mp4" },
    { title: "Primeiro contato", src: "../Apresentação Sistema/Primeiro contato/Primeiro contato-1.mp4" },
    { title: "Acionamento do prestador + Análise de valores (1/3)", src: "../Apresentação Sistema/Acionamento do prestador %2B Análise de valores/Acionamento do prestador %2B Análise de valores-1.mp4" },
    { title: "Acionamento do prestador + Análise de valores (2/3)", src: "../Apresentação Sistema/Acionamento do prestador %2B Análise de valores/Acionamento do prestador %2B Análise de valores-2.mp4" },
    { title: "Acionamento do prestador + Análise de valores (3/3)", src: "../Apresentação Sistema/Acionamento do prestador %2B Análise de valores/Acionamento do prestador %2B Análise de valores-3.mp4" },
    { title: "Pesquisa de qualidade", src: "../Apresentação Sistema/Pesquisa de qualidade/Pesquisa de qualidade-1.mp4" },
    { title: "Introdução de planejamentos", src: "../Apresentação Sistema/Introdução de planejamentos/Introdução de planejamentos-1.mp4" },
    { title: "Sugestões primeiro contato (1/2)", src: "../Apresentação Sistema/Sugestões primeiro contato/Sugestões primeiro contato-1.mp4" },
    { title: "Sugestões primeiro contato (2/2)", src: "../Apresentação Sistema/Sugestões primeiro contato/Sugestões primeiro contato-2.mp4" },
    { title: "Sugestões no acionamento do prestador", src: "../Apresentação Sistema/Sugestões no acionamento do prestador/Sugestões no acionamento do prestador-1.mp4" },
    { title: "Acompanhamento de traslado", src: "../Apresentação Sistema/Acompanhamento de traslado /Acompanhamento de traslado-1.mp4" },
    { title: "Esteira de atendimento (1/3)", src: "../Apresentação Sistema/Esteira de atendimento/Esteira de atendimento-1.mp4" },
    { title: "Esteira de atendimento (2/3)", src: "../Apresentação Sistema/Esteira de atendimento/Esteira de atendimento-2.mp4" },
    { title: "Esteira de atendimento (3/3)", src: "../Apresentação Sistema/Esteira de atendimento/Esteira de atendimento-3.mp4" },
    { title: "Sugestões de Pendências", src: "../Apresentação Sistema/Sugestões de Pendências/Sugestões de Pendências-1.mp4" },
    { title: "Avaliador de performance por pendência", src: "../Apresentação Sistema/Avaliador de performance por pendência/Avaliador de performance por pendência-1.mp4" },
    { title: "Encerramento", src: "../Apresentação Sistema/Encerramento/Encerramento-1.mp4" }
];

let currentVideoIndex = 0;
const userData = { nome: '', whatsapp: '', setor: '', avaliacoes: [] };

// Elementos
const stepForm = document.getElementById('step-form');
const stepVideo = document.getElementById('step-video');
const stepEnd = document.getElementById('step-end');
const introForm = document.getElementById('intro-form');
const videoTitle = document.getElementById('video-title');
const mainVideo = document.getElementById('main-video');
const btnNext = document.getElementById('btn-next');
const btnSpeeds = document.querySelectorAll('.btn-speed');
const progressBar = document.getElementById('progress-bar');

// Submissão do Formulário
introForm.addEventListener('submit', (e) => {
    e.preventDefault();
    userData.nome = document.getElementById('nome').value;
    userData.whatsapp = document.getElementById('whatsapp').value;
    userData.setor = document.getElementById('setor').value;
    
    // (Opcional) Aqui você poderia enviar esses dados para uma API, n8n ou webhook
    console.log("Usuário logado:", userData);

    goToVideoStep();
});

function goToVideoStep() {
    stepForm.classList.remove('active');
    setTimeout(() => {
        stepForm.classList.add('hidden');
        stepVideo.classList.remove('hidden');
        stepVideo.classList.add('active');
        loadVideo(0);
    }, 500); // Aguarda animação de fade out
}

function loadVideo(index) {
    if (index >= videos.length) {
        showEndScreen();
        return;
    }

    currentVideoIndex = index;
    const videoData = videos[index];
    
    videoTitle.textContent = `${index + 1}. ${videoData.title}`;
    
    // Prepara o vídeo
    mainVideo.src = videoData.src;
    mainVideo.load();
    
    // Atualiza a barra de progresso
    const progressPercent = ((index + 1) / videos.length) * 100;
    progressBar.style.width = `${progressPercent}%`;
    
    // Remove o efeito de pulso do botão próximo caso ele tivesse recebido ao terminar o vídeo anterior
    btnNext.classList.remove('pulse');
    
    // Tenta reproduzir automaticamente
    mainVideo.play().catch(err => {
        console.log("Autoplay bloqueado pelo navegador. O usuário precisa clicar em play.", err);
    });
}

// Botão "Próximo Vídeo"
btnNext.addEventListener('click', () => {
    // Registra a consideração atual
    const consideracoesInput = document.getElementById('consideracoes');
    if (consideracoesInput) {
        userData.avaliacoes.push({
            etapa: videos[currentVideoIndex].title,
            texto: consideracoesInput.value
        });
        consideracoesInput.value = ''; // Limpa para a próxima etapa
    }

    mainVideo.pause(); // Para o vídeo atual
    
    stepVideo.classList.remove('active');
    
    setTimeout(() => {
        loadVideo(currentVideoIndex + 1);
        stepVideo.classList.add('active');
    }, 400);
});

// Controles de Velocidade (1x, 1.5x, 2x)
btnSpeeds.forEach(btn => {
    btn.addEventListener('click', (e) => {
        // Reseta todos
        btnSpeeds.forEach(b => b.classList.remove('active'));
        
        // Ativa o selecionado
        const clickedBtn = e.target;
        clickedBtn.classList.add('active');
        
        // Altera a velocidade de reprodução
        const speed = parseFloat(clickedBtn.getAttribute('data-speed'));
        mainVideo.playbackRate = speed;
    });
});

// Animação no botão "Próximo" quando o vídeo termina
mainVideo.addEventListener('ended', () => {
    btnNext.classList.add('pulse');
});

function showEndScreen() {
    console.log("Enviando dados para o webhook...");
    
    // Envia os dados para o webhook do n8n
    fetch('https://n8n-n8n.4wnalj.easypanel.host/webhook/apresentacao-video1', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(userData)
    })
    .then(response => {
        console.log("Dados enviados com sucesso!", response);
    })
    .catch(error => {
        console.error("Erro ao enviar dados para o webhook:", error);
    });

    stepVideo.classList.remove('active');
    setTimeout(() => {
        stepVideo.classList.add('hidden');
        stepEnd.classList.remove('hidden');
        stepEnd.classList.add('active');
    }, 500);
}
