export const parseCSVLine = (line: string): string[] => {
  const result: string[] = [];
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
};

export const validateCSVHeaders = (headers: string[]) => {
  const hasProductId = headers.includes('product_id');
  const hasProductTitle = headers.includes('product_title');
  const hasReviewText = headers.includes('review_text');
  
  if (!hasReviewText) {
    throw new Error("CSV must contain 'review_text' column.");
  }

  if (!hasProductId && !hasProductTitle) {
    throw new Error("CSV must contain either 'product_id' or 'product_title' column.");
  }
};

export const parseCSVData = (lines: string[], headers: string[]) => {
  return lines.slice(1).map((line, index) => {
    const values = parseCSVLine(line);
    const row: any = {};
    headers.forEach((header, headerIndex) => {
      row[header] = values[headerIndex] || '';
    });
    console.log(`Row ${index + 1}:`, row);
    return row;
  });
};