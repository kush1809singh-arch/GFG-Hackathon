const QueryProcessor = {
    process(data, query) {
        query = query.toLowerCase();
        const response = { text: '', chartConfig: null };
        
        // Intent detection and extraction
        const { groupBy, metric, chartType, filter } = this.parseQuery(query, data);
        
        if (!groupBy || !metric) {
            return {
                text: "I can help with queries like: 'show sales by region', 'top products by revenue', 'units by date' or 'sales trend over time'"
            };
        }
        
        // Aggregate data
        const aggregated = this.aggregateData(data, groupBy, metric, filter);
        
        if (aggregated.length === 0) {
            return { text: `No data found for "${query}"` };
        }
        
        response.text = this.formatResponse(aggregated, groupBy, metric);
        response.chartConfig = this.createChartConfig(aggregated, groupBy, metric, chartType);
        
        return response;
    },
    
    parseQuery(query, data) {
        const columns = Object.keys(data[0] || {});
        const intent = {};
        
        // Common patterns
        if (query.includes('by region') || query.includes('by area')) {
            intent.groupBy = 'region';
        } else if (query.includes('by product')) {
            intent.groupBy = 'product';
        } else if (query.includes('by date') || query.includes('over time')) {
            intent.groupBy = 'date';
        }
        
        if (query.includes('sales')) {
            intent.metric = 'sales';
        } else if (query.includes('revenue')) {
            intent.metric = 'revenue';
        } else if (query.includes('units')) {
            intent.metric = 'units';
        } else {
            intent.metric = 'sales'; // default
        }
        
        // Chart type detection
        if (query.includes('trend') || query.includes('over time')) {
            intent.chartType = 'line';
        } else if (query.includes('top') || query.includes('pie')) {
            intent.chartType = 'pie';
        } else {
            intent.chartType = 'bar';
        }
        
        return intent;
    },
    
    aggregateData(data, groupBy, metric, filter = () => true) {
        const groups = {};
        
        data.filter(filter).forEach(row => {
            const key = row[groupBy];
            if (!groups[key]) {
                groups[key] = { [groupBy]: key, [metric]: 0, count: 0 };
            }
            groups[key][metric] += parseFloat(row[metric] || 0);
            groups[key].count += 1;
        });
        
        return Object.values(groups).sort((a, b) => b[metric] - a[metric]);
    },
    
    formatResponse(data, groupBy, metric) {
        const topItems = data.slice(0, 5);
        let text = `<strong>Top ${topItems.length} ${groupBy}s by ${metric}:</strong><br>`;
        
        topItems.forEach(item => {
            text += `• ${item[groupBy]}: ${item[metric].toLocaleString()}<br>`;
        });
        
        if (data.length > 5) {
            text += `<br>... and ${data.length - 5} more`;
        }
        
        text += `<br><em>Total: ${data.reduce((sum, item) => sum + item[metric], 0).toLocaleString()}</em>`;
        return text;
    },
    
    createChartConfig(data, groupBy, metric, chartType = 'bar') {
        const labels = data.map(item => item[groupBy]);
        const values = data.map(item => item[metric]);
        
        return {
            type: chartType,
            data: {
                labels,
                datasets: [{
                    label: `${metric.charAt(0).toUpperCase() + metric.slice(1)}`,
                    data: values,
                    backgroundColor: this.getChartColors(chartType, values.length),
                    borderColor: '#667eea',
                    borderWidth: 2
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { position: 'top' },
                    title: {
                        display: true,
                        text: `${metric} by ${groupBy}`
                    }
                },
                scales: chartType !== 'pie' ? {
                    y: {
                        beginAtZero: true,
                        ticks: { callback: value => value.toLocaleString() }
                    }
                } : {}
            }
        };
    },
    
    getChartColors(type, count) {
        const colors = {
            bar: ['#667eea', '#764ba2', '#f093fb', '#f5576c', '#4facfe'],
            pie: ['#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF'],
            line: ['#667eea', '#764ba2', '#f093fb']
        };
        
        const palette = colors[type] || colors.bar;
        return Array(count).fill().map((_, i) => palette[i % palette.length]);
    }
};

