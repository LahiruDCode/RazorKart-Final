import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

/**
 * Generates a PDF report from products data
 * @param {Array} products - Array of product objects
 * @param {String} title - Title for the PDF report
 */
export const generateProductsPDF = (products, title = 'Product Inventory Report') => {
  // Initialize PDF document
  const doc = new jsPDF();
  
  // Add title
  doc.setFontSize(18);
  doc.setTextColor(255, 102, 0); // RazorKart orange color
  doc.text(title, 14, 22);
  
  // Add date
  doc.setFontSize(11);
  doc.setTextColor(100);
  const date = new Date().toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
  doc.text(`Generated on: ${date}`, 14, 30);
  
  // Add RazorKart header
  doc.setFontSize(24);
  doc.setTextColor(0);
  doc.text('RazorKart', 14, 15);
  
  // Prepare table data
  const tableColumn = ["Product Name", "Category", "Price", "Stock", "Rating"];
  const tableRows = [];
  
  // Format product data for table
  products.forEach(product => {
    const productData = [
      product.name,
      product.category,
      `$${product.price?.toFixed(2) || '0.00'}`,
      product.stock?.toString() || '0',
      product.rating ? product.rating.toFixed(1) : 'N/A'
    ];
    tableRows.push(productData);
  });
  
  // Add table to document
  autoTable(doc, {
    head: [tableColumn],
    body: tableRows,
    startY: 40,
    styles: { 
      fontSize: 10,
      cellPadding: 3,
      overflow: 'linebreak',
      halign: 'left' 
    },
    headStyles: {
      fillColor: [50, 50, 50],
      textColor: [255, 255, 255],
      fontStyle: 'bold'
    },
    alternateRowStyles: {
      fillColor: [245, 245, 245]
    },
    columnStyles: {
      0: { // Product name column
        cellWidth: 50
      },
      2: { // Price column
        halign: 'right'
      },
      3: { // Stock column
        halign: 'right'
      }
    }
  });
  
  // Add summary information
  const totalProducts = products.length;
  const outOfStock = products.filter(p => p.stock === 0).length;
  const lowStock = products.filter(p => p.stock > 0 && p.stock < 10).length;
  const totalValue = products.reduce((sum, p) => sum + (p.price * p.stock || 0), 0);
  
  const summaryY = doc.lastAutoTable.finalY + 10;
  
  doc.setFontSize(12);
  doc.setTextColor(0);
  doc.text('Inventory Summary', 14, summaryY);
  
  doc.setFontSize(10);
  doc.text(`Total Products: ${totalProducts}`, 14, summaryY + 7);
  doc.text(`Out of Stock: ${outOfStock}`, 14, summaryY + 14);
  doc.text(`Low Stock: ${lowStock}`, 14, summaryY + 21);
  doc.text(`Total Inventory Value: $${totalValue.toFixed(2)}`, 14, summaryY + 28);
  
  // Add footer
  const pageCount = doc.internal.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(10);
    doc.setTextColor(150);
    doc.text(
      'RazorKart Seller Inventory System',
      14,
      doc.internal.pageSize.height - 10
    );
    doc.text(
      `Page ${i} of ${pageCount}`,
      doc.internal.pageSize.width - 25,
      doc.internal.pageSize.height - 10
    );
  }
  
  // Save the PDF
  doc.save(`razorkart_products_report_${new Date().toISOString().slice(0, 10)}.pdf`);
};
