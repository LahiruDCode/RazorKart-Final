import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

/**
 * Generates a PDF report from inquiries data
 * @param {Array} inquiries - Array of inquiry objects
 * @param {String} title - Title for the PDF report
 */
export const generateInquiriesPDF = (inquiries, title = 'Inquiry Management Report') => {
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
  const tableColumn = ["Date", "Name", "Subject", "Status"];
  const tableRows = [];
  
  // Format inquiry data for table
  inquiries.forEach(inquiry => {
    const inquiryData = [
      new Date(inquiry.createdAt).toLocaleString(),
      inquiry.name,
      inquiry.subject,
      inquiry.status
    ];
    tableRows.push(inquiryData);
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
      0: { // Date column
        cellWidth: 40
      },
      3: { // Status column
        cellWidth: 25,
        customParseCell: (cell, data) => {
          const status = cell.raw;
          let fillColor;
          
          // Assign colors based on status
          switch(status) {
            case 'Pending':
              fillColor = [255, 193, 7, 0.3]; // Yellow
              break;
            case 'Resolved':
              fillColor = [40, 167, 69, 0.3]; // Green
              break;
            case 'Rejected':
              fillColor = [220, 53, 69, 0.3]; // Red
              break;
            default:
              fillColor = [108, 117, 125, 0.3]; // Gray
          }
          
          return { 
            content: status, 
            styles: { 
              fillColor,
              fontStyle: 'bold'
            } 
          };
        }
      }
    }
  });
  
  // Add summary information
  const summaryY = doc.lastAutoTable.finalY + 10;
  
  const totalInquiries = inquiries.length;
  const pendingInquiries = inquiries.filter(inq => inq.status === "Pending").length;
  const resolvedInquiries = inquiries.filter(inq => inq.status === "Resolved").length;
  const rejectedInquiries = inquiries.filter(inq => inq.status === "Rejected").length;
  
  doc.setFontSize(12);
  doc.setTextColor(0);
  doc.text('Inquiry Summary', 14, summaryY);
  
  doc.setFontSize(10);
  doc.text(`Total Inquiries: ${totalInquiries}`, 14, summaryY + 7);
  doc.text(`Pending: ${pendingInquiries}`, 14, summaryY + 14);
  doc.text(`Resolved: ${resolvedInquiries}`, 14, summaryY + 21);
  doc.text(`Rejected: ${rejectedInquiries}`, 14, summaryY + 28);
  
  // Add footer
  const pageCount = doc.internal.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(10);
    doc.setTextColor(150);
    doc.text(
      'RazorKart Inquiry Management System',
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
  doc.save(`razorkart_inquiries_report_${new Date().toISOString().slice(0, 10)}.pdf`);
};
