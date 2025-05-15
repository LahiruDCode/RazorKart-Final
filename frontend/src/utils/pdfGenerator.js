import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

/**
 * Generates a PDF report from users data
 * @param {Array} users - Array of user objects
 * @param {String} title - Title for the PDF report
 */
export const generateUsersPDF = (users, title = 'User Management Report') => {
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
  const tableColumn = ["Username", "Email", "Role", "Status"];
  const tableRows = [];
  
  // Format user data for table
  users.forEach(user => {
    const userData = [
      user.username,
      user.email,
      user.role,
      user.status
    ];
    tableRows.push(userData);
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
      2: { // Role column
        cellWidth: 'auto',
        customParseCell: (cell, data) => {
          const role = cell.raw;
          return { content: role, styles: { fontStyle: 'bold' } };
        }
      },
      3: { // Status column
        cellWidth: 'auto'
      }
    }
  });
  
  // Add footer
  const pageCount = doc.internal.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(10);
    doc.setTextColor(150);
    doc.text(
      'RazorKart User Management System',
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
  doc.save(`razorkart_users_report_${new Date().toISOString().slice(0, 10)}.pdf`);
};
