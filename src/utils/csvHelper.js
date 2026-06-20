export const exportToCSV = (dataArray, filename = 'report.csv') => {
    if (!dataArray || !dataArray.length) {
        alert("No data to download!");
        return;
    }
    const headers = Object.keys(dataArray[0]);

    // 2. Build CSV stringa
    const csvRows = [];
    csvRows.push(headers.join(',')); // Add headers row

    for (const row of dataArray) {
        const values = headers.map(header => {
            let val = row[header];
            if (val === null || val === undefined) val = '';
            
            // Safely escape commas and quotes for Excel
            const stringVal = String(val);
            if (stringVal.includes(',') || stringVal.includes('"') || stringVal.includes('\n')) {
                return `"${stringVal.replace(/"/g, '""')}"`;
            }
            return stringVal;
        });
        csvRows.push(values.join(','));
    }

    const csvString = csvRows.join('\n');
    const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });

    // 3. Trigger Download
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
};