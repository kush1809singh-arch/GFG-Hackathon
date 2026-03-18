class DashboardApp {
    constructor() {
        this.data = [];
        this.chatHistory = [];
        this.currentChart = null;
        
        this.initElements();
        this.bindEvents();
        this.loadSampleData();
    }
    
    initElements() {
        this.uploadInput = document.getElementById('csv-upload');
        this.uploadBtn = document.getElementById('upload-btn');
        this.queryInput = document.getElementById('query-input');
        this.sendBtn = document.getElementById('send-query');
        this.chatHistory = document.getElementById('chat-history');
        this.chartCanvas = document.getElementById('chart-canvas');
    }
    
    bindEvents() {
        this.uploadBtn.addEventListener('click', () => this.handleUpload());
        this.uploadInput.addEventListener('change', () => this.handleUpload());
        
        this.sendBtn.addEventListener('click', () => this.sendQuery());
        this.queryInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.sendQuery();
        });
    }
    
    async loadSampleData() {
        try {
            const response = await fetch('../data/sample-sales.csv');
            const csvText = await response.text();
            this.data = CSVParser.parse(csvText);
            this.addChatMessage('AI', '✅ Sample sales data loaded! Ask me anything about sales, regions, products...');
        } catch (error) {
            console.error('Failed to load sample data:', error);
        }
    }
    
    async handleUpload() {
        const file = this.uploadInput.files[0];
        if (!file) return;
        
        const reader = new FileReader();
        reader.onload = (e) => {
            this.data = CSVParser.parse(e.target.result);
            this.clearCharts();
            this.addChatMessage('AI', `📊 Uploaded ${this.data.length} rows of data! Ready for queries.`);
        };
        reader.readAsText(file);
    }
    
    sendQuery() {
        const query = this.queryInput.value.trim();
        if (!query) return;
        
        this.addChatMessage('User', query);
        this.queryInput.value = '';
        
        const response = QueryProcessor.process(this.data, query);
        this.addChatMessage('AI', response.text);
        
        if (response.chartConfig) {
            this.renderChart(response.chartConfig);
        }
    }
    
    addChatMessage(sender, message) {
        const messageEl = document.createElement('div');
        messageEl.className = `chat-message ${sender === 'User' ? 'user-message' : 'ai-message'}`;
        messageEl.innerHTML = `<strong>${sender}:</strong> ${this.formatMessage(message)}`;
        this.chatHistory.appendChild(messageEl);
        this.chatHistory.scrollTop = this.chatHistory.scrollHeight;
    }
    
    formatMessage(message) {
        // Basic markdown-like formatting
        return message
            .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
            .replace(/\*(.*?)\*/g, '<em>$1</em>');
    }
    
    renderChart(config) {
        this.clearCharts();
        
        this.currentChart = ChartRenderer.render(
            this.chartCanvas.getContext('2d'), 
            config
        );
    }
    
    clearCharts() {
        if (this.currentChart) {
            this.currentChart.destroy();
            this.currentChart = null;
        }
    }
}

// Initialize app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new DashboardApp();
});

