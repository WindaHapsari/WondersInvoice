let selectedBrand = '';
        let itemData = []; // To store item data for calculation and display

        // Brand data centralized for easy management
        const brandDetails = {
            'FOLLOWERSINDO': {
                name: 'FOLLOWERSINDO',
                tagline: 'Makin Murah, Makin Mudah',
                color: '#ADD8E6', // Light Blue for borders
                darkColor: '#007bff', // Darker blue for text/highlights
                instaAccount: '@Followersindo_official',
                email: 'followersindocom@gmail.com',
                phoneNumber: '62 877-5115-992',
                logo: 'https://cdn.brandfetch.io/idRgTV3x-I/w/100/h/100/theme/dark/logo.png?c=1dxbfHSJFAPEGdCLU4o5B' // Placeholder, replace with actual URL
            },
            'RESELLERINDO': {
                name: 'RESELLERINDO',
                tagline: 'Digital Services',
                color: '#FFA500', // Orange for borders
                darkColor: '#FF8C00', // Darker orange for text/highlights
                instaAccount: '@Resellerindo_official',
                email: 'resellerindo@gmail.com',
                phoneNumber: '0341-238921',
                logo: 'https://cdn.brandfetch.io/idoWNHBS7k/w/300/h/300/theme/dark/icon.png?c=1dxbfHSJFAPEGdCLU4o5B' // Placeholder, replace with actual URL
            },
            'VIRALIZER': {
                name: 'VIRALIZER',
                tagline: 'Digital Services',
                color: '#FFC0CB', // Pink for borders
                darkColor: '#FF69B4', // Darker pink for text/highlights
                instaAccount: '@viralizer',
                email: 'viralizer@gmail.com',
                phoneNumber: '0341-234534',
                logo: 'https://cdn.brandfetch.io/idounjzpdC/w/1804/h/1654/theme/dark/logo.png?c=1dxbfHSJFAPEGdCLU4o5B' // Placeholder, replace with actual URL
            }
        };

        document.addEventListener('DOMContentLoaded', () => {
            // Add one initial item row to the form
            addItemRow();
            calculateTotals(); // Initial calculation for empty form

            // Set current date to invoiceDate input
            const today = new Date().toISOString().split('T')[0];
            document.getElementById('invoiceDate').value = today;
        });

        function selectBrand(brand) {
            selectedBrand = brand;
            const brandInfo = brandDetails[selectedBrand];

            document.getElementById('brandSelectionSection').style.display = 'none';
            const formContainer = document.getElementById('formContainer');
            formContainer.style.display = 'block';
            document.getElementById('formTitle').textContent = `Form Pengisian Invoice (${brandInfo.name})`;

            // Update 'your company' default fields based on selected brand
            document.getElementById('yourCompanyName').value = brandInfo.name;

            //document.getElementById('yourCompanyField').value = brandInfo.tagline; 

            // Apply brand class to form container for styling
            formContainer.classList.remove('brand-FOLLOWERSINDO', 'brand-RESELLERINDO', 'brand-VIRALIZER');
            formContainer.classList.add(`brand-${selectedBrand}`);

            // Scroll to the form
            formContainer.scrollIntoView({ behavior: 'smooth' });
        }

        function addItemRow() {
            const tableBody = document.querySelector('#itemsTable tbody');
            const newRow = tableBody.insertRow();
            const rowIndex = itemData.length; // Use current length for logical index

            newRow.innerHTML = `
                <td><input type="number" name="quantity[]" value="1" min="1" oninput="updateGrandTotal(${rowIndex})"></td>
                <td><input type="text" name="username[]"></td>
                <td><input type="text" name="services[]"></td>
                <td>Rp <input type="text" name="unitPrice[]" value="0" min="0" oninput="updateGrandTotal(${rowIndex})"></td>
                <td><span class="grand-total">Rp 0</span></td>
                <td><button type="button" class="delete-btn" onclick="deleteItemRow(this, ${rowIndex})">Hapus</button></td>
            `;
            // Initialize itemData for this new row
            itemData.push({ quantity: 1, username: '', services: '', unitPrice: 0, grandTotal: 0 });
            updateGrandTotal(rowIndex); // Calculate initial grand total for the new row
        }

        function deleteItemRow(button, rowIndex) {
            const row = button.closest('tr');
            row.remove();
            itemData.splice(rowIndex, 1); // Remove from itemData array

            // Re-index remaining rows to ensure correct mapping
            document.querySelectorAll('#itemsTable tbody tr').forEach((r, idx) => {
                const quantityInput = r.querySelector('input[name="quantity[]"]');
                const unitPriceInput = r.querySelector('input[name="unitPrice[]"]');
                const deleteBtn = r.querySelector('.delete-btn');

                if (quantityInput) quantityInput.setAttribute('oninput', `updateGrandTotal(${idx})`);
                if (unitPriceInput) unitPriceInput.setAttribute('oninput', `updateGrandTotal(${idx})`);
                if (deleteBtn) deleteBtn.setAttribute('onclick', `deleteItemRow(this, ${idx})`);
            });

            calculateTotals();
        }

        function updateGrandTotal(rowIndex) {
            const row = document.querySelector(`#itemsTable tbody tr:nth-child(${rowIndex + 1})`);
            if (!row) return; // Row might have been deleted

            const quantityInput = row.querySelector('input[name="quantity[]"]');
            const unitPriceInput = row.querySelector('input[name="unitPrice[]"]');
            const grandTotalSpan = row.querySelector('.grand-total');

            const quantity = parseFloat(quantityInput.value) || 0;

            // Ambil nilai, ganti koma dengan titik, lalu ubah jadi float
            const unitPriceValue = unitPriceInput.value.replace(',', '.');
            const unitPrice = parseFloat(unitPriceInput.value) || 0;
            const grandTotal = quantity * unitPrice;

            grandTotalSpan.textContent = `Rp ${grandTotal.toLocaleString('id-ID')}`;

            // Update itemData for this row
            if (itemData[rowIndex]) {
                itemData[rowIndex].quantity = quantity;
                itemData[rowIndex].username = row.querySelector('input[name="username[]"]').value;
                itemData[rowIndex].services = row.querySelector('input[name="services[]"]').value;
                itemData[rowIndex].unitPrice = unitPrice;
                itemData[rowIndex].grandTotal = grandTotal;
            }
            calculateTotals();
        }

        document.getElementById('invoiceForm').addEventListener('submit', function(event) {
            event.preventDefault();

            document.getElementById('loadingOverlay').classList.add('visible');

            const formData = {
                brand: selectedBrand,
                invoiceNumber: document.getElementById('invoiceNumber').value,
                invoiceDate: document.getElementById('invoiceDate').value,
                yourCompany: {
                    name: document.getElementById('yourCompanyName').value,
                    field: document.getElementById('yourCompanyField').value,
                },
                clientCompany: {
                    name: document.getElementById('clientCompanyName').value,
                    field: document.getElementById('clientCompanyField').value,
                },
                items: [],
                notes: document.getElementById('notes').value,
                adminFeeAmount: parseFloat(document.getElementById('adminFeeAmount').value) || 0,
                taxAmount: parseFloat(document.getElementById('taxAmount').value) || 0,
                discountAmount: parseFloat(document.getElementById('discountAmount').value) || 0
            };

            // Re-collect item data directly from the current form state
            const itemRows = document.querySelectorAll('#itemsTable tbody tr');
            itemRows.forEach(row => {
                const quantity = parseFloat(row.querySelector('input[name="quantity[]"]').value) || 0;
                const username = row.querySelector('input[name="username[]"]').value;
                const services = row.querySelector('input[name="services[]"]').value;
                const unitPrice = parseFloat(row.querySelector('input[name="unitPrice[]"]').value) || 0;
                const grandTotal = quantity * unitPrice;

                formData.items.push({
                    quantity: quantity,
                    username: username,
                    services: services,
                    unitPrice: unitPrice,
                    grandTotal: grandTotal
                });
            });

            setTimeout(() => {
                populateInvoice(formData);
                document.getElementById('loadingOverlay').classList.remove('visible');
                document.getElementById('invoiceDisplaySection').style.display = 'block';
                document.getElementById('invoiceDisplaySection').scrollIntoView({ behavior: 'smooth' });
            }, 1000);
        });

        function calculateTotals() {
            let subtotal = 0;
            itemData.forEach(item => {
                subtotal += item.grandTotal;
            });

            const adminFeeValue = document.getElementById('adminFeeAmount').value.replace(',', '.');
            const taxValue = document.getElementById('taxAmount').value.replace(',', '.');
            const discountValue = document.getElementById('discountAmount').value.replace(',', '.');

            const adminFee = parseFloat(adminFeeValue) || 0;
            const tax = parseFloat(taxValue) || 0;
            const discount = parseFloat(discountValue) || 0;

            let total = subtotal + adminFee + tax - discount;
            if (total < 0) total = 0;

            document.getElementById('subtotalDisplay').textContent = `Rp ${subtotal.toLocaleString('id-ID')}`;
            document.getElementById('totalDisplay').textContent = `Rp ${total.toLocaleString('id-ID')}`;
        }


        function populateInvoice(invoiceData) {
            const brandInfo = brandDetails[invoiceData.brand];

            // Apply brand specific styles to invoice display section
            const invoiceDisplaySection = document.getElementById('invoiceDisplaySection');
            const itemsDisplayTable = document.getElementById('displayItemsTable');
            const amountDueTable = document.getElementById('amountDueTable');
            const copyrightQuestion = document.getElementById('copyrightQuestion');


            // Clear previous brand classes
            invoiceDisplaySection.classList.remove('brand-FOLLOWERSINDO', 'brand-RESELLERINDO', 'brand-VIRALIZER');
            itemsDisplayTable.classList.remove('brand-FOLLOWERSINDO', 'brand-RESELLERINDO', 'brand-VIRALIZER');
            amountDueTable.classList.remove('brand-FOLLOWERSINDO', 'brand-RESELLERINDO', 'brand-VIRALIZER');

            // Add new brand class
            invoiceDisplaySection.classList.add(`brand-${invoiceData.brand}`);
            itemsDisplayTable.classList.add(`brand-${invoiceData.brand}`);
            amountDueTable.classList.add(`brand-${invoiceData.brand}`);
            
            // Set copyright question color based on brand
            copyrightQuestion.style.color = brandInfo.darkColor;

            // Populate Main Logo, Brand Name and Tagline
            document.getElementById('mainBrandLogo').src = brandInfo.logo;
            document.getElementById('displayBrandName').textContent = brandInfo.name;
            document.getElementById('displayBrandTagline').textContent = brandInfo.tagline;

            // Populate Contact Info (Instagram, Email, Phone) - WhatsApp removed
            document.getElementById('displayInstaAccount').textContent = brandInfo.instaAccount;
            document.getElementById('displayEmail').textContent = brandInfo.email;
            document.getElementById('displayPhoneNumber').textContent = brandInfo.phoneNumber;

            // Populate general info
            document.getElementById('displayInvoiceNumber').textContent = invoiceData.invoiceNumber;
            document.getElementById('displayInvoiceDate').textContent = new Date(invoiceData.invoiceDate).toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: 'numeric' });

            // Populate FROM section
            document.getElementById('fromCompanyName').textContent = invoiceData.yourCompany.name;
            document.getElementById('fromCompanyField').textContent = invoiceData.yourCompany.field;
            //document.getElementById('fromCompanyAddress').textContent = invoiceData.yourCompany.address;
            //document.getElementById('fromCompanyPostalCode').textContent = invoiceData.yourCompany.postalCode;


            // Populate TO section
            document.getElementById('toCompanyName').textContent = invoiceData.clientCompany.name;
            document.getElementById('toCompanyField').textContent = invoiceData.clientCompany.field;
            //document.getElementById('toCompanyAddress').textContent = invoiceData.clientCompany.address;
            //document.getElementById('toCompanyPostalCode').textContent = invoiceData.clientCompany.postalCode;


            // Populate ITEMS table
            const itemsTableBody = document.querySelector('#displayItemsTable tbody');
            itemsTableBody.innerHTML = ''; // Clear previous items
            let subtotal = 0;
            invoiceData.items.forEach(item => {
                const row = itemsTableBody.insertRow();
                row.innerHTML = `
                    <td>${item.quantity}</td>
                    <td>${item.username}</td>
                    <td>${item.services}</td>
                    <td>Rp ${item.unitPrice.toLocaleString('id-ID')}</td>
                    <td class="grand-total-cell">Rp ${item.grandTotal.toLocaleString('id-ID')}</td>
                `;
                subtotal += item.grandTotal;
            });

            // Populate Notes
            document.getElementById('displayNotes').textContent = invoiceData.notes || 'Tidak ada catatan.';


            // Calculate and populate AMOUNT DUE
            const adminFee = invoiceData.adminFeeAmount;
            const tax = invoiceData.taxAmount;
            const discount = invoiceData.discountAmount;

            let total = subtotal + adminFee + tax - discount;
            if (total < 0) total = 0;

            document.getElementById('displaySubtotal').textContent = `Rp ${subtotal.toLocaleString('id-ID')}`;
            document.getElementById('displayAdminFee').textContent = `Rp ${adminFee.toLocaleString('id-ID')}`;
            document.getElementById('displayTax').textContent = `Rp ${tax.toLocaleString('id-ID')}`;
            document.getElementById('displayDiscount').textContent = `Rp ${discount.toLocaleString('id-ID')}`;
            document.getElementById('displayTotal').textContent = `Rp ${total.toLocaleString('id-ID')}`;

            // Ensure notes box height matches amount due table height
            adjustNotesBoxHeight();
        }

        // Function to adjust notes box height
        function adjustNotesBoxHeight() {
            const amountDueTable = document.getElementById('amountDueTable');
            const notesBox = document.querySelector('.notes-box');
            
            // Set a small delay to ensure the table has rendered before calculating height
            setTimeout(() => {
                // Reset minHeight first to get accurate current height of amountDueTable
                notesBox.style.minHeight = 'auto'; 
                // Set minimum height based on amountDueTable's offsetHeight
                notesBox.style.minHeight = `${amountDueTable.offsetHeight}px`; 
            }, 100); // Small delay
        }

        // Call adjustNotesBoxHeight when window is resized to maintain layout
        window.addEventListener('resize', adjustNotesBoxHeight);


        async function downloadInvoice(format) {
        const invoiceElement = document.getElementById('invoiceDisplaySection');
        const downloadButtons = document.querySelector('.download-buttons'); // Ambil elemen tombol download

        // Sembunyikan tombol download sementara sebelum capture
        downloadButtons.style.display = 'none';

        // Increase render scale for better quality (higher value = sharper image)
        const scale = 4;

        const canvas = await html2canvas(invoiceElement, {
            scale: scale,
            useCORS: true,
            logging: false,
            windowWidth: invoiceElement.scrollWidth,
            windowHeight: invoiceElement.scrollHeight
        });

        // Tampilkan kembali tombol download setelah capture selesai
        downloadButtons.style.display = 'block';

        const { jsPDF } = window.jspdf;
        const imgData = canvas.toDataURL('image/png');

        // A4 dimensions in mm
        const pdfWidth = 210;
        const pdfHeight = 297;

        if (format === 'png') {
            const link = document.createElement('a');
            link.href = imgData;
            link.download = 'invoice.png';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        } else if (format === 'pdf') {
            const doc = new jsPDF('p', 'mm', 'a4');
            const imgProps = doc.getImageProperties(imgData);

            // Hitung rasio untuk memastikan gambar muat dalam satu halaman A4
            // Kita ingin gambar mengisi lebar penuh halaman PDF
            const imgWidth = pdfWidth;
            // Hitung tinggi gambar berdasarkan rasio aslinya
            const imgHeight = (imgProps.height * imgWidth) / imgProps.width;

            // Jika tinggi gambar melebihi tinggi halaman PDF, sesuaikan skala
            let finalImgWidth = imgWidth;
            let finalImgHeight = imgHeight;
            if (imgHeight > pdfHeight) {
                const ratio = pdfHeight / imgHeight; // Rasio untuk menyesuaikan tinggi
                finalImgHeight = pdfHeight;
                finalImgWidth = imgWidth * ratio; // Sesuaikan lebar agar rasio tetap
            }

            // Hitung posisi X untuk menengahkan gambar jika lebarnya disesuaikan
            const marginX = (pdfWidth - finalImgWidth) / 2;

            // Tambahkan gambar ke PDF
            // Gunakan finalImgWidth dan finalImgHeight untuk memastikan fit page
            doc.addImage(imgData, 'PNG', marginX, 0, finalImgWidth, finalImgHeight);

            // Hapus loop addPage() yang sebelumnya membuat multi-halaman
            // heightLeft -= pdfHeight;
            // while (heightLeft >= 0) { ... }
            // Karena kita sudah memastikan gambar fit dalam satu halaman
            
            doc.save('invoice.pdf');
        }
    }
