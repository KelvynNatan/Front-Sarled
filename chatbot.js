class NEXORChatbot {
    constructor() {
        this.isOpen = false;
        this.responses = {
            'como jogar': 'Para começar a jogar, você pode baixar nossos jogos na seção de Downloads. Temos tutoriais completos para iniciantes! 🎮',
            'suporte': 'Para suporte técnico, visite nossa seção de Suporte ou acesse o fórum. Nossa equipe está sempre pronta para ajudar! 🛠️',
            'eventos': 'Confira nossa seção de Competições & Eventos no fórum para participar de torneios e ganhar prêmios incríveis! 🏆',
            'forum': 'Nosso fórum é o lugar perfeito para interagir com a comunidade, fazer perguntas e compartilhar experiências! 💬',
            'download': 'Você pode baixar nossos jogos na seção principal do site. Todos os downloads são gratuitos e seguros! ⬇️',
            'conta': 'Para criar uma conta, clique em "Criar Conta" no fórum. É rápido e gratuito! 👤',
            'requisitos': 'Os requisitos mínimos variam por jogo. Confira a seção de cada jogo para mais detalhes sobre compatibilidade. 💻',
            'comunidade': 'Nossa comunidade é ativa no fórum, Discord e redes sociais. Junte-se a nós! 🌟',
            'atualizações': 'Acompanhe as últimas atualizações na seção Desenvolvimento & Feedback do fórum! 🔄',
            'bug': 'Para reportar bugs, use a seção de Suporte Técnico no fórum. Inclua detalhes e screenshots se possível! 🐛'
        };
        
        this.initializeEventListeners();
    }
    
    initializeEventListeners() {
        const toggle = document.getElementById('chatbotToggle');
        const input = document.getElementById('messageInput');
        const sendButton = document.getElementById('sendButton');
        
        if (toggle) toggle.addEventListener('click', () => this.toggleChatbot());
        if (input) {
            input.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') this.sendMessage();
            });
            input.addEventListener('input', () => {
                if (sendButton) sendButton.disabled = input.value.trim() === '';
            });
        }
    }
    
    toggleChatbot() {
        const window = document.getElementById('chatbotWindow');
        const toggle = document.getElementById('chatbotToggle');
        const icon = document.getElementById('toggleIcon');
        
        this.isOpen = !this.isOpen;
        
        if (this.isOpen) {
            window.classList.add('active');
            toggle.classList.add('active');
            icon.className = 'fas fa-times';
            const input = document.getElementById('messageInput');
            if (input) input.focus();
        } else {
            window.classList.remove('active');
            toggle.classList.remove('active');
            icon.className = 'fas fa-robot';
        }
    }
    
    sendMessage(message = null) {
        const input = document.getElementById('messageInput');
        const text = message || (input ? input.value.trim() : '');
        
        if (!text) return;
        
        this.addMessage(text, 'user');
        if (input) {
            input.value = '';
            const sendButton = document.getElementById('sendButton');
            if (sendButton) sendButton.disabled = true;
        }
        
        this.showTypingIndicator();
        
        setTimeout(() => {
            this.hideTypingIndicator();
            const response = this.generateResponse(text);
            this.addMessage(response, 'bot');
        }, 1000 + Math.random() * 1000);
    }
    
    addMessage(text, sender) {
        const messagesContainer = document.getElementById('chatbotMessages');
        if (!messagesContainer) return;
        
        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${sender}`;
        
        const avatar = document.createElement('div');
        avatar.className = 'message-avatar';
        avatar.innerHTML = sender === 'bot' ? '<i class="fas fa-robot"></i>' : '<i class="fas fa-user"></i>';
        
        const content = document.createElement('div');
        content.className = 'message-content';
        content.textContent = text;
        
        messageDiv.appendChild(avatar);
        messageDiv.appendChild(content);
        
        const typingIndicator = document.getElementById('typingIndicator');
        messagesContainer.insertBefore(messageDiv, typingIndicator);
        
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }
    
    showTypingIndicator() {
        const indicator = document.getElementById('typingIndicator');
        if (indicator) {
            indicator.style.display = 'flex';
            
            const messagesContainer = document.getElementById('chatbotMessages');
            if (messagesContainer) {
                messagesContainer.scrollTop = messagesContainer.scrollHeight;
            }
        }
    }
    
    hideTypingIndicator() {
        const indicator = document.getElementById('typingIndicator');
        if (indicator) {
            indicator.style.display = 'none';
        }
    }
    
    generateResponse(message) {
        const lowerMessage = message.toLowerCase();
        
        // Busca por palavras-chave nas respostas
        for (const [key, response] of Object.entries(this.responses)) {
            if (lowerMessage.includes(key)) {
                return response;
            }
        }
        
        // Respostas baseadas em padrões
        if (lowerMessage.includes('olá') || lowerMessage.includes('oi') || lowerMessage.includes('hello')) {
            return 'Olá! 👋 Como posso ajudar você hoje? Posso responder sobre nossos jogos, suporte, eventos e muito mais!';
        }
        
        if (lowerMessage.includes('obrigado') || lowerMessage.includes('valeu')) {
            return 'De nada! 😊 Estou sempre aqui para ajudar. Se tiver mais dúvidas, é só perguntar!';
        }
        
        if (lowerMessage.includes('tchau') || lowerMessage.includes('bye')) {
            return 'Até logo! 👋 Volte sempre que precisar de ajuda. Bons jogos! 🎮';
        }
        
        if (lowerMessage.includes('?')) {
            return 'Essa é uma ótima pergunta! Para informações mais específicas, recomendo visitar nosso fórum ou seção de suporte. Posso ajudar com navegação no site, informações gerais sobre jogos, eventos e suporte. 🤔';
        }
        
        // Resposta padrão
        const defaultResponses = [
            'Interessante! Para mais informações detalhadas, confira nosso fórum ou seção de suporte. 🔍',
            'Posso ajudar você a navegar pelo site! Tente perguntar sobre jogos, eventos, suporte ou fórum. 🎯',
            'Não tenho certeza sobre isso, mas nossa comunidade no fórum pode ter a resposta! 💭',
            'Para informações específicas, recomendo visitar as seções relevantes do site ou contatar nosso suporte. 📞'
        ];
        
        return defaultResponses[Math.floor(Math.random() * defaultResponses.length)];
    }
}

// Função global para ações rápidas
function sendQuickMessage(message) {
    if (window.chatbot) {
        window.chatbot.sendMessage(message);
    }
}

// Função global para enviar mensagem
function sendMessage() {
    if (window.chatbot) {
        window.chatbot.sendMessage();
    }
}

// Inicializar chatbot quando o DOM estiver carregado
document.addEventListener('DOMContentLoaded', function() {
    window.chatbot = new NEXORChatbot();
});

// Auto-abrir chatbot após 5 segundos (opcional)
setTimeout(() => {
    if (window.chatbot && !window.chatbot.isOpen) {
        // window.chatbot.toggleChatbot(); // Descomente para auto-abrir
    }
}, 5000);