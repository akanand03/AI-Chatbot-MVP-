class ChatbotApp {
    constructor() {
        this.apiUrl = 'http://localhost:8000/api';
        this.isConnected = false;
        this.initializeElements();
        this.attachEventListeners();
        this.checkBackendConnection();
        this.loadSystemPrompt();
        this.initializeQuickActions();
    }

    initializeElements() {
        // Chat elements
        this.chatMessages = document.getElementById('chatMessages');
        this.messageInput = document.getElementById('messageInput');
        this.sendButton = document.getElementById('sendButton');
        
        // System prompt elements
        this.systemPrompt = document.getElementById('systemPrompt');
        this.updatePromptBtn = document.getElementById('updatePrompt');
        
        // Status elements
        this.statusIndicator = document.getElementById('statusIndicator');
        this.statusText = document.getElementById('statusText');
        this.statusDot = document.querySelector('.status-dot');
        
        // API status elements
        this.backendStatus = document.getElementById('backendStatus');
        this.openaiStatus = document.getElementById('openaiStatus');
        
        // Example prompts
        this.exampleBtns = document.querySelectorAll('.example-btn');
        
        // Quick action buttons
        this.quickBtns = document.querySelectorAll('.quick-btn');
    }

    attachEventListeners() {
        // Chat functionality
        this.sendButton.addEventListener('click', () => this.sendMessage());
        this.messageInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                this.sendMessage();
            }
        });

        // System prompt functionality
        this.updatePromptBtn.addEventListener('click', () => this.updateSystemPrompt());
        
        // Example prompt buttons
        this.exampleBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                const prompt = btn.getAttribute('data-prompt');
                this.systemPrompt.value = prompt;
                this.updateSystemPrompt();
            });
        });

        // Quick action buttons
        this.quickBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                const message = btn.getAttribute('data-message');
                this.messageInput.value = message;
                this.sendMessage();
            });
        });

        // Auto-resize textarea
        this.systemPrompt.addEventListener('input', () => {
            this.autoResizeTextarea(this.systemPrompt);
        });

        // Input focus enhancement
        this.messageInput.addEventListener('focus', () => {
            this.messageInput.parentElement.style.transform = 'translateY(-2px)';
        });
        
        this.messageInput.addEventListener('blur', () => {
            this.messageInput.parentElement.style.transform = 'translateY(0)';
        });
    }

    autoResizeTextarea(textarea) {
        textarea.style.height = 'auto';
        textarea.style.height = Math.min(textarea.scrollHeight, 200) + 'px';
    }

    async checkBackendConnection() {
        try {
            const response = await fetch(`${this.apiUrl}/system-prompt`, {
                method: 'GET',
                timeout: 5000
            });
            
            if (response.ok) {
                this.isConnected = true;
                this.backendStatus.textContent = '🟢 Connected';
                this.backendStatus.style.color = '#48bb78';
                this.showStatus('Backend connected', 'success');
            } else {
                throw new Error('Backend not responding');
            }
        } catch (error) {
            this.isConnected = false;
            this.backendStatus.textContent = '🔴 Disconnected';
            this.backendStatus.style.color = '#f56565';
            this.showStatus('Backend disconnected', 'error');
            console.error('Backend connection failed:', error);
        }
    }

    async loadSystemPrompt() {
        if (!this.isConnected) return;
        
        try {
            const response = await fetch(`${this.apiUrl}/system-prompt`);
            const data = await response.json();
            this.systemPrompt.value = data.system_prompt;
            this.autoResizeTextarea(this.systemPrompt);
        } catch (error) {
            console.error('Failed to load system prompt:', error);
            this.showStatus('Failed to load system prompt', 'error');
        }
    }

    async updateSystemPrompt() {
        const prompt = this.systemPrompt.value.trim();
        if (!prompt) {
            this.showStatus('Please enter a system prompt', 'error');
            this.systemPrompt.focus();
            return;
        }

        if (!this.isConnected) {
            this.showStatus('Backend not connected', 'error');
            return;
        }

        try {
            this.showStatus('Updating personality...', 'loading');
            this.updatePromptBtn.disabled = true;
            this.updatePromptBtn.innerHTML = '<div class="loading-spinner"></div> Updating...';
            
            const response = await fetch(`${this.apiUrl}/system-prompt`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ system_prompt: prompt })
            });

            if (response.ok) {
                this.showStatus('Personality updated!', 'success');
                this.addMessage('System', '🎭 Personality updated! Try asking me something to see the new behavior.', 'bot');
                
                // Add a subtle success animation
                this.updatePromptBtn.style.background = '#48bb78';
                setTimeout(() => {
                    this.updatePromptBtn.style.background = '';
                }, 1000);
            } else {
                throw new Error('Failed to update system prompt');
            }
        } catch (error) {
            this.showStatus('Failed to update personality', 'error');
            console.error('Error:', error);
        } finally {
            this.updatePromptBtn.disabled = false;
            this.updatePromptBtn.innerHTML = 'Update Personality';
        }
    }

    async sendMessage() {
        const message = this.messageInput.value.trim();
        if (!message) return;

        if (!this.isConnected) {
            this.showStatus('Backend not connected', 'error');
            return;
        }

        // Disable input while processing
        this.setInputState(false);
        
        // Add user message to chat
        this.addMessage('You', message, 'user');
        this.messageInput.value = '';

        // Show typing indicator
        this.showTypingIndicator();
        this.showStatus('Thinking...', 'loading');

        try {
            const response = await fetch(`${this.apiUrl}/chat`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ message })
            });

            const data = await response.json();
            
            // Remove typing indicator
            this.removeTypingIndicator();

            if (response.ok) {
                // Update OpenAI status if we got a successful response
                this.openaiStatus.textContent = '🟢 Working';
                this.openaiStatus.style.color = '#48bb78';
                
                const intentBadge = data.intent !== 'general' ? 
                    `<div class="intent-badge">${data.intent.toUpperCase()}</div>` : '';
                
                this.addMessage('Bot', intentBadge + data.response, 'bot');
                this.showStatus('Ready', 'success');
                
                // Auto-scroll to bottom
                this.scrollToBottom();
            } else {
                throw new Error(data.detail || 'Failed to get response');
            }
        } catch (error) {
            this.removeTypingIndicator();
            
            // Check if it's an OpenAI API error
            if (error.message.includes('openai') || error.message.includes('language model')) {
                this.openaiStatus.textContent = '🔴 API Error';
                this.openaiStatus.style.color = '#f56565';
                this.addMessage('Bot', '❌ Sorry, I\'m having trouble connecting to my language model. Please check your OpenAI API key and try again.', 'bot');
            } else {
                this.addMessage('Bot', '❌ Sorry, I encountered an error. Please check the console for details.', 'bot');
            }
            
            this.showStatus('Error occurred', 'error');
            console.error('Chat error:', error);
        } finally {
            this.setInputState(true);
        }
    }

    addMessage(sender, content, type) {
        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${type}-message`;
        
        const contentDiv = document.createElement('div');
        contentDiv.className = 'message-content';
        contentDiv.innerHTML = content;
        
        messageDiv.appendChild(contentDiv);
        this.chatMessages.appendChild(messageDiv);
        
        // Scroll to bottom with smooth animation
        this.scrollToBottom();
        
        // Add subtle entrance animation
        messageDiv.style.opacity = '0';
        messageDiv.style.transform = 'translateY(20px)';
        
        requestAnimationFrame(() => {
            messageDiv.style.transition = 'opacity 0.4s ease, transform 0.4s ease';
            messageDiv.style.opacity = '1';
            messageDiv.style.transform = 'translateY(0)';
        });
    }

    showTypingIndicator() {
        const typingDiv = document.createElement('div');
        typingDiv.className = 'message bot-message typing-message';
        typingDiv.innerHTML = `
            <div class="message-content typing-indicator">
                <span>Bot is typing</span>
                <div class="typing-dots">
                    <span></span>
                    <span></span>
                    <span></span>
                </div>
            </div>
        `;
        this.chatMessages.appendChild(typingDiv);
        this.scrollToBottom();
    }

    removeTypingIndicator() {
        const typingMessage = this.chatMessages.querySelector('.typing-message');
        if (typingMessage) {
            typingMessage.style.opacity = '0';
            setTimeout(() => {
                if (typingMessage.parentNode) {
                    typingMessage.remove();
                }
            }, 200);
        }
    }

    setInputState(enabled) {
        this.messageInput.disabled = !enabled;
        this.sendButton.disabled = !enabled;
        this.quickBtns.forEach(btn => btn.disabled = !enabled);
        
        if (enabled) {
            this.messageInput.focus();
            this.sendButton.innerHTML = '<span class="send-icon">➤</span> Send';
        } else {
            this.sendButton.innerHTML = '<div class="loading-spinner"></div> Sending...';
        }
    }

    scrollToBottom() {
        requestAnimationFrame(() => {
            this.chatMessages.scrollTo({
                top: this.chatMessages.scrollHeight,
                behavior: 'smooth'
            });
        });
    }

    showStatus(message, type = 'success') {
        this.statusText.textContent = message;
        this.statusDot.className = `status-dot ${type === 'loading' ? 'loading' : type === 'error' ? 'error' : ''}`;
        
        // Auto-hide status after 3 seconds for success/error
        if (type === 'success' || type === 'error') {
            setTimeout(() => {
                if (this.statusText.textContent === message) {
                    this.statusText.textContent = 'Ready';
                    this.statusDot.className = 'status-dot';
                }
            }, 3000);
        }
    }

    initializeQuickActions() {
        // Add hover effects and tooltips for quick action buttons
        this.quickBtns.forEach(btn => {
            const message = btn.getAttribute('data-message');
            
            // Create tooltip
            const tooltip = document.createElement('div');
            tooltip.className = 'tooltip';
            tooltip.textContent = message;
            tooltip.style.cssText = `
                position: absolute;
                background: #2d3748;
                color: white;
                padding: 8px 12px;
                border-radius: 6px;
                font-size: 12px;
                white-space: nowrap;
                opacity: 0;
                pointer-events: none;
                transform: translateX(-50%) translateY(-100%);
                transition: opacity 0.2s ease;
                z-index: 1000;
                top: -10px;
                left: 50%;
            `;
            
            btn.appendChild(tooltip);
            
            btn.addEventListener('mouseenter', () => {
                tooltip.style.opacity = '1';
            });
            
            btn.addEventListener('mouseleave', () => {
                tooltip.style.opacity = '0';
            });
        });
    }

    // Utility method for handling connection retries
    async retryConnection(maxRetries = 3) {
        for (let i = 0; i < maxRetries; i++) {
            this.showStatus(`Retrying connection (${i + 1}/${maxRetries})...`, 'loading');
            await new Promise(resolve => setTimeout(resolve, 2000)); // Wait 2 seconds
            
            await this.checkBackendConnection();
            if (this.isConnected) {
                this.showStatus('Connection restored!', 'success');
                return true;
            }
        }
        
        this.showStatus('Connection failed after retries', 'error');
        return false;
    }

    // Method to handle offline/online events
    handleConnectionChange() {
        window.addEventListener('online', () => {
            this.showStatus('Internet connected', 'success');
            this.checkBackendConnection();
        });

        window.addEventListener('offline', () => {
            this.showStatus('Internet offline', 'error');
            this.isConnected = false;
            this.backendStatus.textContent = '🔴 Offline';
            this.backendStatus.style.color = '#f56565';
        });
    }

    // Initialize error boundary
    initializeErrorHandling() {
        window.addEventListener('error', (event) => {
            console.error('Global error:', event.error);
            this.showStatus('Application error occurred', 'error');
        });

        window.addEventListener('unhandledrejection', (event) => {
            console.error('Unhandled promise rejection:', event.reason);
            this.showStatus('Network error occurred', 'error');
        });
    }
}

// Enhanced initialization with error handling
document.addEventListener('DOMContentLoaded', () => {
    try {
        const app = new ChatbotApp();
        
        // Initialize additional features
        app.handleConnectionChange();
        app.initializeErrorHandling();
        
        // Periodic connection check (every 30 seconds)
        setInterval(() => {
            if (!app.isConnected) {
                app.checkBackendConnection();
            }
        }, 30000);
        
        // Add keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            // Ctrl/Cmd + Enter to send message
            if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
                e.preventDefault();
                app.sendMessage();
            }
            
            // Escape to clear input
            if (e.key === 'Escape') {
                app.messageInput.value = '';
                app.messageInput.blur();
            }
        });
        
        console.log('🤖 Chatbot app initialized successfully!');
        
    } catch (error) {
        console.error('Failed to initialize chatbot app:', error);
        
        // Show fallback error message
        document.body.innerHTML = `
            <div style="
                display: flex;
                justify-content: center;
                align-items: center;
                height: 100vh;
                flex-direction: column;
                gap: 20px;
                text-align: center;
                color: white;
                font-family: system-ui;
            ">
                <h1>⚠️ Application Error</h1>
                <p>Failed to initialize the chatbot. Please refresh the page and try again.</p>
                <button onclick="location.reload()" style="
                    padding: 12px 24px;
                    background: #667eea;
                    color: white;
                    border: none;
                    border-radius: 8px;
                    cursor: pointer;
                    font-size: 16px;
                ">Refresh Page</button>
            </div>
        `;
    }
});

// Service Worker registration for offline functionality (optional)
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js')
            .then((registration) => {
                console.log('SW registered: ', registration);
            })
            .catch((registrationError) => {
                console.log('SW registration failed: ', registrationError);
            });
    });
}