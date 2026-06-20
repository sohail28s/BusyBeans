import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, useLocation } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import useStore from '../../Hooks/useStore';
import html2pdf from 'html2pdf.js';
import { getAuthConfig } from '../../utils/orderUtils';


export const InvoicePage = () => {
  const { id } = useParams();
  const location = useLocation();
  const setTitle = useStore((state) => state.setTitle);
  const isPartnerRoute = location.pathname.includes('/partnerOrders/') || location.pathname.includes('/partner/');
  const [isLoading, setIsLoading] = useState(true);
  const [orderData, setOrderData] = useState(null);
  const [isCopied, setIsCopied] = useState(false);
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);

  const invoiceRef = useRef(null);

  // --- Data Fetching ---
  const fetchOrderDetails = useCallback(async () => {
    setIsLoading(true);
    try {
      const apiUrl = isPartnerRoute
        ? `https://testingbb.trimworldwide.com/api/v1/admin/partner-order/order-details/${id}`
        : `https://testingbb.trimworldwide.com/api/v1/admin/order-details/${id}`;
      const res = await axios.get(apiUrl, getAuthConfig());

      if (res.data?.status === 'success' && res.data.data?.order) {
        setOrderData(res.data.data.order);
        setTitle(`Invoices / INV-00${id}`);
      } else {
        toast.error("Failed to load invoice data.");
      }
    } catch (error) {
      console.error("Fetch error:", error);
      toast.error("Error fetching invoice details.");
    } finally {
      setIsLoading(false);
    }
  }, [id, isPartnerRoute, setTitle]);

  useEffect(() => {
    fetchOrderDetails();
    return () => setTitle('');
  }, [fetchOrderDetails, setTitle]);

  // --- Action Handlers ---
  const paymentLink = `https://www.busybeancoffee.com/paymentCheck?orderId=${id}`;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(paymentLink);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  const handlePayOnline = () => window.open(paymentLink, '_blank');

  const handleDownloadPdf = () => {
    setIsGeneratingPdf(true);

    // REDUCED TIMEOUT: from 150ms to 50ms
    setTimeout(async () => {
      let iframe = null;
      try {
        const element = invoiceRef.current;
        if (!element) throw new Error("Invoice element not found.");

        // 1. Create a hidden iframe
        iframe = document.createElement('iframe');
        iframe.style.position = 'fixed';
        iframe.style.top = '-9999px';
        iframe.style.left = '-9999px';
        iframe.style.width = '900px';
        iframe.style.height = '1200px';
        iframe.style.border = 'none';
        iframe.style.visibility = 'hidden';
        document.body.appendChild(iframe);

        // 2. Collect all styles from the main document (Tailwind + any other CSS)
        const stylesHtml = Array.from(document.styleSheets)
          .map(sheet => {
            try {
              const rules = Array.from(sheet.cssRules || [])
                .map(r => r.cssText)
                .join('\n');
              return `<style>${rules}</style>`;
            } catch {
              return sheet.href ? `<link rel="stylesheet" href="${sheet.href}">` : '';
            }
          })
          .join('\n');

        // 3. Write full HTML into the iframe including all styles
        const iframeDoc = iframe.contentDocument || iframe.contentWindow.document;
        iframeDoc.open();
        iframeDoc.write(`
                    <!DOCTYPE html>
                    <html>
                    <head>
                        <meta charset="UTF-8" />
                        ${stylesHtml}
                        <style>
                            /* Ensure colors print correctly */
                            * {
                                -webkit-print-color-adjust: exact !important;
                                print-color-adjust: exact !important;
                            }
                            body {
                                margin: 0;
                                background: #fff;
                                font-family: 'Inter', sans-serif;
                            }
                        </style>
                    </head>
                    <body></body>
                    </html>
                `);
        iframeDoc.close();

        // 4. Wait for stylesheets to load inside iframe
        // REDUCED TIMEOUT: from 400ms to 150ms
        await new Promise(resolve => setTimeout(resolve, 150));

        // 5. Clone and inject the invoice element
        const clone = element.cloneNode(true);
        iframeDoc.body.appendChild(clone);

        // 6. Let layout settle
        // REDUCED TIMEOUT: from 150ms to 50ms
        await new Promise(resolve => setTimeout(resolve, 50));

        // 7. Generate PDF from the cloned element inside iframe
        const opt = {
          margin: [0.5, 0.5, 0.5, 0.5],
          filename: `INV-00${id}.pdf`,
          image: { type: 'jpeg', quality: 0.98 },
          html2canvas: {
            scale: 2,
            useCORS: true,
            logging: false,
            windowWidth: 900,
            backgroundColor: '#ffffff',
          },
          jsPDF: { unit: 'in', format: 'letter', orientation: 'portrait' }
        };

        await html2pdf().set(opt).from(iframeDoc.body.firstElementChild).save();
      } catch (error) {
        console.error("PDF generation failed:", error);
        toast.error("Failed to download PDF.");
      } finally {
        // 8. Always clean up the iframe
        if (iframe && document.body.contains(iframe)) {
          document.body.removeChild(iframe);
        }
        setIsGeneratingPdf(false);
      }
    }, 50);
  };

  // --- Formatting Helpers ---
  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    const d = new Date(dateStr);
    return isNaN(d.getTime()) ? '' : d.toLocaleDateString('en-US', { month: '2-digit', day: '2-digit', year: 'numeric' });
  };

  const formatMoney = (val) => isNaN(parseFloat(val)) ? '0.00' : parseFloat(val).toFixed(2);

  if (isLoading) return <div className="p-8 text-center text-gray-500 font-sans">Loading Invoice...</div>;
  if (!orderData) return <div className="p-8 text-center text-red-500 font-sans">Invoice not found.</div>;

  // --- Data Extraction & Calculations ---
  const isPaid = ['done', 'paid'].includes(orderData.paymentStatus?.toLowerCase());
  const companyName = orderData.companyName || orderData.customerName || orderData.salesRepName;
  const addr = orderData.address || {};
  const adminAddr = orderData.adminAddress || {};

  const productsList = (orderData.items || []).filter(item => item.type !== 'charges');
  const chargesList = (orderData.items || []).filter(item => item.type === 'charges');
  const allItems = [...productsList, ...chargesList];

  // 1. Calculate Due Date based on termDays
  let computedDueDate = orderData.dueDate;
  const baseDateString = orderData.invoiceDate || orderData.createdAt;
  const baseDate = new Date(baseDateString);

  if (!isNaN(baseDate.getTime())) {
    const daysToAdd = parseInt(orderData.termDays) || 30; // Fallback to 30 if termDays is missing/invalid
    const calculatedDate = new Date(baseDate);
    calculatedDate.setDate(calculatedDate.getDate() + daysToAdd);
    computedDueDate = calculatedDate;
  }

  let rawPhone = orderData.user?.phoneNumber || orderData.salesRep?.phoneNumber || '';
  if (rawPhone && !rawPhone.toString().startsWith('+')) {
    rawPhone = `+1 ${rawPhone}`;
  }

  return (
    <div className="w-full min-h-screen bg-whitepy-10 flex justify-center font-sans text-black">

      <div
        ref={invoiceRef}
        className="bg-white w-full max-w-[850px] p-12 shadow-sm border border-gray-200"
      >
        <div className="flex justify-between items-start mb-12">
          <div className="flex items-center gap-6">
            <h1 className="text-[32px] font-bold tracking-tight text-black">INVOICE</h1>

            {isPaid && (
              <img
                src={`${window.location.origin}/Images/paidtag.png`}
                alt="Paid"
                className="w-[120px] h-auto transform -rotate-6 opacity-90 select-none"
              />
            )}
          </div>
          <div>
            <h2 className="text-[#86644A] text-[24px] font-bold">
              BUSY BEAN<span className="font-normal italic">Coffee</span>
            </h2>
          </div>
        </div>
        <div className="flex flex-col gap-1 mb-10 text-sm font-semibold">
          <div className="flex w-[300px]">
            <span className="w-[120px] font-bold text-black">Invoice number:</span>
            <span className="text-black">INV-00{id}</span>
          </div>
          <div className="flex w-[300px]">
            <span className="w-[120px] font-bold text-black">Date of issue:</span>
            <span className="text-black">{formatDate(baseDateString)}</span>
          </div>
          <div className="flex w-[300px]">
            <span className="w-[120px] font-bold text-black">Due Date:</span>
            <span className="text-black">{formatDate(computedDueDate)}</span>
          </div>
          <div className="flex w-[300px]">
            <span className="w-[120px] font-bold text-black">PO Number:</span>
            <span className="text-black">{orderData.poNumber || '—'}</span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-12 mb-12">
          <div className="flex flex-col text-[13px] leading-[1.6] text-black">
            <span className="font-bold mb-1">Remit To</span>
            <span className="uppercase">BUSY BEAN COFFEE OF CENTRAL FLORIDA</span>
            <span className="uppercase">{adminAddr.address || '1876 CCCINNAMON CIRCLE'}</span>
            <span className="uppercase">
              {adminAddr.city || 'CITY 4'} {adminAddr.state || 'STATE 3'} {adminAddr.zipCode || '32707'}
            </span>
            <span className="uppercase">{adminAddr.country || 'UNITED STATES'}</span>
            <span>{adminAddr.phoneNumber || '+1 40745122768'}</span>
            <span>{adminAddr.email || 'sigidevelopers@gmail.com'}</span>
          </div>

          {/* Bill To (Customer/Partner) */}
          <div className="flex flex-col text-[13px] leading-[1.6] text-black">
            <span className="font-bold mb-1">Bill To</span>
            <span className="uppercase">{companyName}</span>
            <span className="uppercase">{addr.addressLineOne}</span>
            <span className="uppercase">{addr.town}, {addr.state}, {addr.zipCode}</span>
            <span className="uppercase">{addr.country || 'UNITED STATES'}</span>
            <span>{rawPhone}</span>
            <span>{orderData.user?.emailToSendInvoices || orderData.user?.email || orderData.salesRep?.email || '—'}</span>
          </div>
        </div>

        {/* --- DUE AMOUNT & ACTION BUTTONS (hidden during PDF generation) --- */}
        <div className="mb-10">
          <h3 className="text-xl font-bold mb-1 text-black font-satoshi">
            ${formatMoney(orderData.totalBill)} due amount
          </h3>

          {!isGeneratingPdf && (
            <div className="flex gap-3">
              <button
                onClick={handlePayOnline}
                className="px-6 py-2 bg-[#8b614d] text-white text-[16px] rounded  transition-colors"
              >
                Pay Online
              </button>
              <button
                onClick={handleCopyLink}
                className={`px-6 py-2 text-white text-[14px] rounded transition-all duration-300 w-max ${isCopied ? 'bg-green-500' : 'bg-black'
                  }`}
              >
                {isCopied ? '✓ Copied!' : 'Copy Payment Link'}
              </button>
            </div>
          )}
        </div>

        {/* --- ITEMS TABLE --- */}
        <table className="w-full text-left text-[13px] mb-8 border-collapse">
          <thead>
            <tr className="border-b-2 border-black">
              <th className="py-2 font-bold w-[15%] text-black">Code</th>
              <th className="py-2 font-bold w-[35%] text-black">Item</th>
              <th className="py-2 font-bold w-[15%] text-black">Grind</th>
              <th className="py-2 font-bold text-center w-[10%] text-black">Quantity</th>
              <th className="py-2 font-bold text-right w-[12%] text-black">Unit price</th>
              <th className="py-2 font-bold text-right w-[13%] text-black">Amount</th>
            </tr>
          </thead>
          <tbody>
            {allItems.map((item, index) => (
              <tr key={index} className="border-b border-gray-100">
                <td className="py-3 text-[374151]">{item.productCode || ''}</td>
                <td className="py-3 font-medium text-black">{item.product || item.name}</td>
                <td className="py-3 text-[374151]">{item.grind || ''}</td>

                {/* 3. FIX: Removed background box, just simple centered text */}
                <td className="py-3 text-center align-middle">
                  <span className="text-black font-medium">{item.qty}</span>
                </td>

                <td className="py-3 text-right text-black">${formatMoney(item.price)}</td>
                <td className="py-3 text-right text-black">${formatMoney(item.price * item.qty)}</td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* --- TOTALS --- */}
        <div className="flex justify-end w-full mb-16">
          <div className="w-[300px] flex flex-col gap-2 text-[14px]">
            <div className="flex justify-between">
              <span className="text-[374151]">Subtotal</span>
              <span className="text-black">${formatMoney(orderData.subTotal)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[374151]">Shipping Charges</span>
              <span className="text-black">${formatMoney(orderData.shippingCharges)}</span>
            </div>
            <div className="flex justify-between ">
              <span className="text-[374151]">Total</span>
              <span className="text-black">${formatMoney(orderData.totalBill)}</span>
            </div>
          </div>
        </div>

        {/* --- DOWNLOAD BUTTON (hidden during PDF generation) --- */}
        {!isGeneratingPdf && (
          <div className="flex justify-end mt-12">
            <button
              onClick={handleDownloadPdf}
              className="px-6 py-2.5 bg-black text-white text-[14px] font-medium rounded hover:bg-gray-800 transition-colors"
            >
              Download Invoice
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default InvoicePage;