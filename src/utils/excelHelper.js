import * as XLSX from 'xlsx';

export const exportToExcel = (data, filename) => {
    // 1. Create a new Workbook
    const workbook = XLSX.utils.book_new();

    // 2. Convert the JSON data to a Worksheet
    const worksheet = XLSX.utils.json_to_sheet(data);

    // 3. Optional: Adjust column widths for better readability
    const colWidths = Object.keys(data[0] || {}).map(key => ({
        wch: Math.max(key.length, 15) // Give a minimum width of 15
    }));
    worksheet['!cols'] = colWidths;

    // 4. Add the Worksheet to the Workbook
    XLSX.utils.book_append_sheet(workbook, worksheet, "Inventory");

    // 5. Trigger the download
    // Ensure the filename ends with .xlsx
    const finalName = filename.endsWith('.xlsx') ? filename : `${filename}.xlsx`;
    XLSX.writeFile(workbook, finalName);
};


