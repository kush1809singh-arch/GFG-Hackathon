const ChartRenderer = {
    render(ctx, config) {
        // Destroy existing chart if any
        if (ctx.chart) {
            ctx.chart.destroy();
        }
        
        return new Chart(ctx, config);
    }
};

