const CSVParser = {
    parse(csvText) {
        const lines = csvText.trim().split('\n');
        if (lines.length < 2) return [];
        
        const headers = this.parseLine(lines[0]);
        return lines.slice(1).map(line => {
            const values = this.parseLine(line);
            return headers.reduce((row, header, i) => {
                row[header] = values[i] || '';
                return row;
            }, {});
        }).filter(row => Object.values(row).some(val => val !== ''));
    },
    
    parseLine(line) {
        const result = [];
        let current = '';
        let inQuotes = false;
        
        for (let i = 0; i < line.length; i++) {
            const char = line[i];
            
            if (char === '"') {
                inQuotes = !inQuotes;
            } else if (char === ',' && !inQuotes) {
                result.push(current.trim().replace(/^"|"$/g, ''));
                current = '';
            } else {
                current += char;
            }
        }
        result.push(current.trim().replace(/^"|"$/g, ''));
        return result;
    }
};

