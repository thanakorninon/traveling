class ExportManager {
    constructor(app) {
        this.app = app;
        this.jsPDF = window.jspdf.jsPDF;
        this.bindEvents();
    }

    bindEvents() {
        document.getElementById('share-plan-btn').addEventListener('click', () => this.openShareModal());
        document.getElementById('close-share-modal').addEventListener('click', () => this.app.closeModal('share-modal'));
        document.getElementById('export-pdf-btn').addEventListener('click', () => this.exportToPdf());
        document.getElementById('generate-qr-btn').addEventListener('click', () => this.generateQrCode());
    }

    openShareModal() {
        if (this.app.itinerary.length === 0) {
            this.app.showToast('กรุณาสร้างแผนการเดินทางก่อนแชร์', 'error');
            return;
        }
        document.getElementById('qr-code-container').classList.add('hidden');
        this.app.openModal('share-modal');
    }

    async exportToPdf() {
        this.app.showToast('กำลังสร้างไฟล์ PDF...', 'info');
        const itineraryList = document.getElementById('itinerary-list');
        const tripName = document.getElementById('trip-name').value || 'แผนการเดินทาง';

        // Add a temporary class for PDF export styling
        itineraryList.classList.add('exporting-pdf');

        try {
            const canvas = await html2canvas(itineraryList, {
                scale: 2, // Higher scale for better quality
                useCORS: true,
                logging: false,
                onclone: (doc) => {
                    // This runs on a clone of the document, ensuring styles are applied
                    const clonedList = doc.getElementById('itinerary-list');
                    clonedList.style.padding = '20px'; // Add padding for the PDF
                }
            });

            const imgData = canvas.toDataURL('image/png');
            const pdf = new this.jsPDF({
                orientation: 'p',
                unit: 'mm',
                format: 'a4'
            });

            const pdfWidth = pdf.internal.pageSize.getWidth();
            const pdfHeight = pdf.internal.pageSize.getHeight();
            const imgWidth = canvas.width;
            const imgHeight = canvas.height;
            const ratio = imgWidth / imgHeight;
            
            let finalImgWidth = pdfWidth - 20; // with margin
            let finalImgHeight = finalImgWidth / ratio;

            // Handle content that is longer than one page
            let heightLeft = finalImgHeight;
            let position = 10; // top margin

            pdf.setFont('Kanit', 'bold'); // Assuming Kanit font is available or embedded
            pdf.text(tripName, pdfWidth / 2, 15, { align: 'center' });
            
            pdf.addImage(imgData, 'PNG', 10, position + 10, finalImgWidth, finalImgHeight);
            heightLeft -= (pdfHeight - 20); // subtract first page height

            while (heightLeft > 0) {
                position = heightLeft - finalImgHeight;
                pdf.addPage();
                pdf.addImage(imgData, 'PNG', 10, position, finalImgWidth, finalImgHeight);
                heightLeft -= pdfHeight;
            }

            pdf.save(`${tripName}.pdf`);

        } catch (error) {
            console.error("Error generating PDF:", error);
            this.app.showToast('เกิดข้อผิดพลาดในการสร้าง PDF', 'error');
        } finally {
            // Clean up the temporary class
            itineraryList.classList.remove('exporting-pdf');
        }
    }

    generateQrCode() {
        const qrContainer = document.getElementById('qr-code-container');
        const qrcodeDiv = document.getElementById('qrcode');
        qrcodeDiv.innerHTML = ''; // Clear previous QR code

        new QRCode(qrcodeDiv, {
            text: window.location.href,
            width: 200,
            height: 200,
            colorDark: "#000000",
            colorLight: "#ffffff",
            correctLevel: QRCode.CorrectLevel.H
        });

        qrContainer.classList.remove('hidden');
    }
}
