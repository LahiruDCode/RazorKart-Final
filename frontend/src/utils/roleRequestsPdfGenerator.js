import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

/**
 * Generates a PDF report from role requests data
 * @param {Array} requests - Array of role request objects
 * @param {String} title - Title for the PDF report
 */
export const generateRoleRequestsPDF = (requests, title = 'Role Requests Report') => {
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
  const tableColumn = ["User", "Email", "Contact Number", "Status"];
  const tableRows = [];
  
  // Format request data for table
  requests.forEach(request => {
    const requestData = [
      request.username || 'N/A',
      request.email || 'N/A',
      request.contactNumber || 'N/A',
      request.status || 'Pending'
    ];
    tableRows.push(requestData);
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
      3: { // Status column
        cellWidth: 'auto',
        customParseCell: (cell, data) => {
          const status = cell.raw.toLowerCase();
          let textColor = [0, 0, 0];
          
          if (status === 'approved') {
            textColor = [0, 128, 0]; // Green for approved
          } else if (status === 'rejected') {
            textColor = [220, 0, 0]; // Red for rejected
          } else if (status === 'pending') {
            textColor = [255, 102, 0]; // Orange for pending
          }
          
          return { 
            content: cell.raw,
            styles: { 
              textColor: textColor,
              fontStyle: 'bold' 
            } 
          };
        }
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
      'RazorKart Role Requests Management',
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
  doc.save(`razorkart_role_requests_${new Date().toISOString().slice(0, 10)}.pdf`);
};
