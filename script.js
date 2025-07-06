// Variáveis globais
let usuarioLogado = false;
let calculadoraDisplay = '';
let temporizadorIntervalo = null;
let temporizadorTempo = 0;
let temporizadorRodando = false;
let temaAtual = localStorage.getItem('tema') || 'light';
let idiomaAtual = localStorage.getItem('idioma') || 'pt-PT';

// Configuração do Firebase
const firebaseConfig = {
    apiKey: "sua_api_key",
    authDomain: "seu_auth_domain",
    projectId: "seu_project_id",
    storageBucket: "seu_storage_bucket",
    messagingSenderId: "seu_messaging_sender_id",
    appId: "seu_app_id"
};

// Inicializar Firebase
firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const provider = new firebase.auth.GoogleAuthProvider();
const fbProvider = new firebase.auth.FacebookAuthProvider();

// Funções de autenticação
function abrirModal(tipo) {
    document.getElementById(`${tipo}Modal`).style.display = 'block';
}

function fecharModal(tipo) {
    document.getElementById(`${tipo}Modal`).style.display = 'none';
}

// Autenticação com email/senha
async function iniciarSessao(email, senha) {
    try {
        await auth.signInWithEmailAndPassword(email, senha);
        usuarioLogado = true;
        atualizarEstadoLogin();
        fecharModal('login');
    } catch (erro) {
        alert('Erro ao iniciar sessão: ' + erro.message);
    }
}

// Autenticação com Google
async function loginComGoogle() {
    try {
        const resultado = await auth.signInWithPopup(provider);
        usuarioLogado = true;
        atualizarEstadoLogin();
        fecharModal('login');
    } catch (erro) {
        alert('Erro ao iniciar sessão com Google: ' + erro.message);
    }
}

// Autenticação com Facebook
async function loginComFacebook() {
    try {
        const resultado = await auth.signInWithPopup(fbProvider);
        usuarioLogado = true;
        atualizarEstadoLogin();
        fecharModal('login');
    } catch (erro) {
        alert('Erro ao iniciar sessão com Facebook: ' + erro.message);
    }
}

async function terminarSessao() {
    try {
        await auth.signOut();
        usuarioLogado = false;
        atualizarEstadoLogin();
    } catch (erro) {
        alert('Erro ao terminar sessão: ' + erro.message);
    }
}

// Funções de tema e idioma
function mudarTema(tema) {
    document.body.className = `tema-${tema}`;
    localStorage.setItem('tema', tema);
    temaAtual = tema;
}

function mudarIdioma(idioma) {
    localStorage.setItem('idioma', idioma);
    idiomaAtual = idioma;
    // Implementar tradução da interface
}

function atualizarEstadoLogin() {
    const elementosRestritos = document.querySelectorAll('.login-required');
    elementosRestritos.forEach(elemento => {
        if (usuarioLogado) {
            elemento.classList.remove('disabled');
            const mensagem = elemento.querySelector('.login-message');
            if (mensagem) mensagem.style.display = 'none';
        } else {
            elemento.classList.add('disabled');
            const mensagem = elemento.querySelector('.login-message');
            if (mensagem) mensagem.style.display = 'block';
        }
    });

    const btnLogin = document.getElementById('btnLogin');
    const btnLogout = document.getElementById('btnLogout');
    if (btnLogin && btnLogout) {
        btnLogin.style.display = usuarioLogado ? 'none' : 'block';
        btnLogout.style.display = usuarioLogado ? 'block' : 'none';
    }
}

// Funções da Calculadora
function atualizarDisplay() {
    const display = document.querySelector('.calc-display');
    if (display) {
        display.value = calculadoraDisplay;
    }
}

function adicionarNumero(num) {
    if (calculadoraDisplay === 'Erro') {
        limparCalculadora();
    }
    calculadoraDisplay += num;
    atualizarDisplay();
}

function adicionarOperador(op) {
    if (calculadoraDisplay === 'Erro') {
        limparCalculadora();
    }
    if (calculadoraDisplay !== '' && !isNaN(calculadoraDisplay[calculadoraDisplay.length - 1])) {
        calculadoraDisplay += op;
        atualizarDisplay();
    }
}

function limparCalculadora() {
    calculadoraDisplay = '';
    atualizarDisplay();
}

function calcular() {
    try {
        // Substituir eval por uma função mais segura
        const resultado = Function('return ' + calculadoraDisplay)();
        if (isFinite(resultado)) {
            calculadoraDisplay = resultado.toString();
        } else {
            throw new Error('Resultado inválido');
        }
        atualizarDisplay();
    } catch (e) {
        calculadoraDisplay = 'Erro';
        atualizarDisplay();
        setTimeout(limparCalculadora, 1000);
    }
}

// Funções do Temporizador
function atualizarDisplayTemporizador() {
    const display = document.querySelector('.timer-display');
    if (display) {
        const minutos = Math.floor(temporizadorTempo / 60);
        const segundos = temporizadorTempo % 60;
        display.textContent = `${minutos.toString().padStart(2, '0')}:${segundos.toString().padStart(2, '0')}`;
    }
}

function iniciarTemporizador() {
    if (!temporizadorRodando && temporizadorTempo > 0) {
        temporizadorRodando = true;
        const btnStart = document.getElementById('start-timer');
        const btnPause = document.getElementById('pause-timer');
        if (btnStart) btnStart.style.display = 'none';
        if (btnPause) btnPause.style.display = 'inline-block';

        temporizadorIntervalo = setInterval(() => {
            if (temporizadorTempo > 0) {
                temporizadorTempo--;
                atualizarDisplayTemporizador();
                if (temporizadorTempo === 0) {
                    pararTemporizador();
                    const audio = new Audio('https://actions.google.com/sounds/v1/alarms/beep_short.ogg');
                    audio.play();
                    alert('Tempo esgotado!');
                }
            }
        }, 1000);
    }
}

function pararTemporizador() {
    temporizadorRodando = false;
    clearInterval(temporizadorIntervalo);
    const btnStart = document.getElementById('start-timer');
    const btnPause = document.getElementById('pause-timer');
    if (btnStart) btnStart.style.display = 'inline-block';
    if (btnPause) btnPause.style.display = 'none';
}

function reiniciarTemporizador() {
    pararTemporizador();
    temporizadorTempo = 25 * 60; // Padrão: 25 minutos
    atualizarDisplayTemporizador();
}

function definirTemporizador(minutos) {
    pararTemporizador();
    temporizadorTempo = minutos * 60;
    atualizarDisplayTemporizador();
}

// Funções da Lista de Tarefas
function adicionarTarefa() {
    const input = document.querySelector('.todo-input input');
    const texto = input.value.trim();
    
    if (texto) {
        const lista = document.getElementById('todos');
        const li = document.createElement('li');
        li.innerHTML = `
            <span>${texto}</span>
            <button onclick="this.parentElement.remove()">×</button>
        `;
        lista.appendChild(li);
        input.value = '';
    }
}

// Funções das Notas Rápidas
function salvarNota() {
    const textarea = document.querySelector('.quick-notes textarea');
    const nota = textarea.value.trim();
    
    if (nota) {
        localStorage.setItem('nota_rapida', nota);
        alert('Nota salva com sucesso!');
    }
}

function limparNota() {
    document.querySelector('.quick-notes textarea').value = '';
    localStorage.removeItem('nota_rapida');
}

function carregarNota() {
    const nota = localStorage.getItem('nota_rapida');
    if (nota) {
        document.querySelector('.quick-notes textarea').value = nota;
    }
}

// Funções de Conversão
const unidades = {
    temperatura: {
        celsius: { nome: 'Celsius', simbolo: '°C' },
        fahrenheit: { nome: 'Fahrenheit', simbolo: '°F' },
        kelvin: { nome: 'Kelvin', simbolo: 'K' }
    },
    comprimento: {
        metros: { nome: 'Metros', simbolo: 'm', fator: 1 },
        quilometros: { nome: 'Quilômetros', simbolo: 'km', fator: 0.001 },
        centimetros: { nome: 'Centímetros', simbolo: 'cm', fator: 100 },
        milimetros: { nome: 'Milímetros', simbolo: 'mm', fator: 1000 },
        pes: { nome: 'Pés', simbolo: 'ft', fator: 3.28084 },
        polegadas: { nome: 'Polegadas', simbolo: 'in', fator: 39.3701 }
    },
    peso: {
        quilos: { nome: 'Quilogramas', simbolo: 'kg', fator: 1 },
        gramas: { nome: 'Gramas', simbolo: 'g', fator: 1000 },
        miligramas: { nome: 'Miligramas', simbolo: 'mg', fator: 1000000 },
        libras: { nome: 'Libras', simbolo: 'lb', fator: 2.20462 },
        oncas: { nome: 'Onças', simbolo: 'oz', fator: 35.274 }
    },
    velocidade: {
        kmh: { nome: 'Quilômetros por hora', simbolo: 'km/h', fator: 1 },
        ms: { nome: 'Metros por segundo', simbolo: 'm/s', fator: 0.277778 },
        mph: { nome: 'Milhas por hora', simbolo: 'mph', fator: 0.621371 }
    },
    area: {
        m2: { nome: 'Metros quadrados', simbolo: 'm²', fator: 1 },
        km2: { nome: 'Quilômetros quadrados', simbolo: 'km²', fator: 0.000001 },
        hectares: { nome: 'Hectares', simbolo: 'ha', fator: 0.0001 },
        acres: { nome: 'Acres', simbolo: 'ac', fator: 0.000247105 }
    },
    volume: {
        litros: { nome: 'Litros', simbolo: 'L', fator: 1 },
        mililitros: { nome: 'Mililitros', simbolo: 'mL', fator: 1000 },
        m3: { nome: 'Metros cúbicos', simbolo: 'm³', fator: 0.001 },
        galoes: { nome: 'Galões', simbolo: 'gal', fator: 0.264172 }
    }
};

function atualizarUnidades() {
    const tipo = document.getElementById('tipo-conversao').value;
    const deSelect = document.getElementById('unidade-entrada');
    const paraSelect = document.getElementById('unidade-saida');
    
    deSelect.innerHTML = '';
    paraSelect.innerHTML = '';
    
    for (const [key, unidade] of Object.entries(unidades[tipo])) {
        deSelect.innerHTML += `<option value="${key}">${unidade.nome} (${unidade.simbolo})</option>`;
        paraSelect.innerHTML += `<option value="${key}">${unidade.nome} (${unidade.simbolo})</option>`;
    }
}

function converter() {
    const valor = parseFloat(document.getElementById('valor-entrada').value);
    const tipo = document.getElementById('tipo-conversao').value;
    const de = document.getElementById('unidade-entrada').value;
    const para = document.getElementById('unidade-saida').value;
    let resultado;

    if (isNaN(valor)) {
        alert('Por favor, insira um valor válido.');
        return;
    }

    if (tipo === 'temperatura') {
        // Conversões de temperatura são casos especiais
        if (de === 'celsius' && para === 'fahrenheit') {
            resultado = (valor * 9/5) + 32;
        } else if (de === 'fahrenheit' && para === 'celsius') {
            resultado = (valor - 32) * 5/9;
        } else if (de === 'celsius' && para === 'kelvin') {
            resultado = valor + 273.15;
        } else if (de === 'kelvin' && para === 'celsius') {
            resultado = valor - 273.15;
        } else if (de === 'fahrenheit' && para === 'kelvin') {
            resultado = (valor - 32) * 5/9 + 273.15;
        } else if (de === 'kelvin' && para === 'fahrenheit') {
            resultado = (valor - 273.15) * 9/5 + 32;
        } else {
            resultado = valor; // Mesma unidade
        }
    } else {
        // Para outras conversões, usamos o sistema de fatores
        const fatorDe = unidades[tipo][de].fator;
        const fatorPara = unidades[tipo][para].fator;
        resultado = (valor / fatorDe) * fatorPara;
    }

    const simboloDe = unidades[tipo][de].simbolo;
    const simboloPara = unidades[tipo][para].simbolo;

    document.getElementById('resultado').innerHTML = 
        `<strong>${valor} ${simboloDe}</strong> = <strong>${resultado.toFixed(2)} ${simboloPara}</strong>`;

    adicionarHistorico(valor, simboloDe, simboloPara, resultado);
}

// Adicionar event listeners
document.addEventListener('DOMContentLoaded', () => {
    const tipoSelect = document.getElementById('tipo-conversao');
    if (tipoSelect) {
        tipoSelect.addEventListener('change', atualizarUnidades);
        atualizarUnidades(); // Inicializar as unidades
    }
});

function adicionarHistorico(valor, de, para, resultado) {
    const historico = document.getElementById('history-list');
    const li = document.createElement('li');
    li.textContent = `${valor} ${de} → ${resultado.toFixed(2)} ${para}`;
    historico.insertBefore(li, historico.firstChild);

    if (historico.children.length > 5) {
        historico.removeChild(historico.lastChild);
    }
}

// Funções do Blog
function enviarPost() {
    if (!usuarioLogado) {
        alert('Por favor, inicie sessão para publicar.');
        return;
    }

    const texto = document.getElementById('post-texto').value.trim();
    if (texto) {
        const posts = document.getElementById('posts');
        const post = document.createElement('div');
        post.className = 'post';
        post.innerHTML = `
            <p>${texto}</p>
            <div class="post-info">
                <span>Agora mesmo</span>
                <button onclick="this.parentElement.parentElement.remove()">Apagar</button>
            </div>
        `;
        posts.insertBefore(post, posts.firstChild);
        document.getElementById('post-texto').value = '';
    }
}

// Funções do Max IA
async function enviarMensagem() {
    if (!usuarioLogado) {
        alert('Por favor, inicie sessão para conversar com o Max.');
        return;
    }

    const mensagem = document.getElementById('chat-input').value.trim();
    if (!mensagem) return;

    // Adicionar mensagem do usuário
    adicionarMensagemAoChat('user', mensagem);
    document.getElementById('chat-input').value = '';

    try {
        const resposta = await consultarOpenAI(mensagem);
        adicionarMensagemAoChat('bot', resposta);
    } catch (erro) {
        console.error('Erro ao consultar OpenAI:', erro);
        adicionarMensagemAoChat('bot', 'Desculpe, ocorreu um erro ao processar sua mensagem.');
    }
}

function adicionarMensagemAoChat(tipo, texto) {
    const chatMessages = document.querySelector('.chat-messages');
    const mensagem = document.createElement('div');
    mensagem.className = `message ${tipo}`;
    mensagem.innerHTML = `
        <div class="message-content">${texto}</div>
        ${tipo === 'bot' ? '<ul class="suggestions"></ul>' : ''}
    `;
    chatMessages.appendChild(mensagem);
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

async function consultarOpenAI(mensagem) {
    const OPENAI_API_KEY = 'sk-Ue4Wd4Wd4Wd4Wd4Wd4Wd4Wd4Wd4Wd4Wd4Wd4Wd4';
    
    // Adicionar indicador de digitação
    const chatMessages = document.querySelector('.chat-messages');
    const typingIndicator = document.createElement('div');
    typingIndicator.className = 'message bot typing';
    typingIndicator.innerHTML = '<div class="message-content">Max está digitando...</div>';
    chatMessages.appendChild(typingIndicator);
    
    try {
        // Preparar o contexto para o Max
        const contexto = {
            role: "system",
            content: "Você é o Max, um assistente educacional amigável que ajuda estudantes em português de Portugal. Você deve ser prestativo, paciente e fornecer explicações claras e detalhadas. Foque em temas educacionais e mantenha um tom profissional mas acolhedor."
        };

        const response = await fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${OPENAI_API_KEY}`
            },
            body: JSON.stringify({
                model: "gpt-3.5-turbo",
                messages: [contexto, {
                    role: "user",
                    content: mensagem
                }],
                temperature: 0.7,
                max_tokens: 500
            })
        });

        // Remover indicador de digitação
        chatMessages.removeChild(typingIndicator);

        if (!response.ok) {
            throw new Error('Erro na resposta da API');
        }

        const data = await response.json();
        const resposta = data.choices[0].message.content;

        // Adicionar sugestões de perguntas relacionadas
        const sugestoes = [
            "Como posso melhorar meus estudos?",
            "Pode me ajudar com matemática?",
            "Dicas para organização escolar?",
            "Como preparar para exames?"
        ];

        setTimeout(() => {
            const ultimaMensagem = document.querySelector('.chat-messages .message:last-child');
            const sugestoesList = ultimaMensagem.querySelector('.suggestions');
            if (sugestoesList) {
                sugestoesList.innerHTML = sugestoes
                    .map(s => `<li onclick="document.getElementById('chat-input').value='${s}';">${s}</li>`)
                    .join('');
            }
        }, 1000);

        return resposta;

    } catch (erro) {
        console.error('Erro ao consultar OpenAI:', erro);
        chatMessages.removeChild(typingIndicator);
        return 'Desculpe, ocorreu um erro ao processar sua mensagem. Por favor, tente novamente mais tarde.';
    }
}

// Funções de Upload de Apresentações
function uploadApresentacao() {
    if (!usuarioLogado) {
        alert('Por favor, inicie sessão para fazer upload de apresentações.');
        return;
    }

    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.pdf,.ppt,.pptx';
    input.onchange = function(e) {
        const arquivo = e.target.files[0];
        if (arquivo) {
            // Aqui você pode implementar o upload real do arquivo
            const apresentacao = {
                nome: arquivo.name,
                tamanho: (arquivo.size / 1024 / 1024).toFixed(2) + ' MB',
                data: new Date().toLocaleDateString()
            };
            adicionarApresentacaoALista(apresentacao);
        }
    };
    input.click();
}

function adicionarApresentacaoALista(apresentacao) {
    const grid = document.getElementById('presentations-grid');
    const div = document.createElement('div');
    div.className = 'presentation-card';
    div.innerHTML = `
        <h4>${apresentacao.nome}</h4>
        <p>Tamanho: ${apresentacao.tamanho}</p>
        <p>Data: ${apresentacao.data}</p>
        <button onclick="this.parentElement.remove()">Remover</button>
    `;
    grid.appendChild(div);
}

// Inicialização
document.addEventListener('DOMContentLoaded', () => {
    // Carregar nota salva
    carregarNota();

    // Inicializar displays
    atualizarDisplay();
    atualizarDisplayTemporizador();
    atualizarEstadoLogin();

    // Adicionar listeners para teclas da calculadora
    document.addEventListener('keydown', (e) => {
        if (e.key >= '0' && e.key <= '9') {
            adicionarNumero(e.key);
        } else if (e.key === '+' || e.key === '-' || e.key === '*' || e.key === '/') {
            adicionarOperador(e.key);
        } else if (e.key === 'Enter') {
            calcular();
        } else if (e.key === 'Escape') {
            limparCalculadora();
        }
    });
});