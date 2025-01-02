// Main application JavaScript

const API_URL = 'https://technotherapy.matthewwarrenjackson.workers.dev';  // Replace with your worker URL

// Headers for all API requests
const headers = {
    'Content-Type': 'application/json'
};

// Chat functionality
const chatMessages = document.getElementById('chat-messages');
const chatInput = document.getElementById('chat-input');

async function sendMessage() {
    const message = chatInput.value.trim();
    if (!message) return;

    // Add user message to chat
    appendMessage(message, 'user');
    chatInput.value = '';

    try {
        const response = await fetch(`${API_URL}/api/chat`, {
            method: 'POST',
            headers: headers,
            body: JSON.stringify({ message })
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        appendMessage(data.response, 'ai');
    } catch (error) {
        console.error('Error:', error);
        appendMessage('Sorry, I encountered an error. Please try again.', 'ai');
    }
}

function appendMessage(message, sender) {
    const messageDiv = document.createElement('div');
    messageDiv.className = `chat-message ${sender}-message`;
    messageDiv.textContent = message;
    chatMessages.appendChild(messageDiv);
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

// Journal functionality
async function saveJournalEntry() {
    const content = document.getElementById('journal-entry').value.trim();
    const mood = document.getElementById('mood-select').value;

    if (!content) return;

    try {
        const response = await fetch(`${API_URL}/api/journal`, {
            method: 'POST',
            headers: headers,
            body: JSON.stringify({
                content: content,
                mood: mood
            })
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        
        if (data.success) {
            alert('Journal entry saved and analyzed successfully!');
            document.getElementById('journal-entry').value = '';
            
            // Display the AI's analysis
            appendMessage('Analysis: ' + data.analysis, 'ai');
        }
    } catch (error) {
        console.error('Error:', error);
        alert('Failed to save journal entry. Please try again.');
    }
}

// Meditation functionality
async function getMeditationPrompt() {
    const meditationContent = document.getElementById('meditation-content');
    meditationContent.textContent = 'Loading meditation prompt...';
    meditationContent.classList.add('loading');

    try {
        const response = await fetch(`${API_URL}/api/meditation`, {
            method: 'GET',
            headers: headers
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        
        meditationContent.classList.remove('loading');
        meditationContent.textContent = data.prompt;
    } catch (error) {
        console.error('Error:', error);
        meditationContent.classList.remove('loading');
        meditationContent.textContent = 'Failed to load meditation prompt. Please try again.';
    }
}

// Event listeners
document.addEventListener('DOMContentLoaded', () => {
    // Initialize chat
    const chatMessages = document.getElementById('chat-messages');
    if (chatMessages) {
        appendMessage('Hello! I\'m your AI therapeutic companion. How are you feeling today?', 'ai');
    }

    // Add event listeners only if elements exist
    const chatInput = document.getElementById('chat-input');
    if (chatInput) {
        chatInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                sendMessage();
            }
        });
    }

    const saveJournalEntryButton = document.getElementById('save-journal-entry');
    if (saveJournalEntryButton) {
        saveJournalEntryButton.addEventListener('click', saveJournalEntry);
    }

    const getMeditationPromptButton = document.getElementById('get-meditation-prompt');
    if (getMeditationPromptButton) {
        getMeditationPromptButton.addEventListener('click', getMeditationPrompt);
    }
});
