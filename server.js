// server.js
const express = require('express');
const multer = require('multer');
const { PDFDocument } = require('pdf-lib');
const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

const app = express();
const upload = multer({ dest: 'uploads/' });

app.use(express.static('public'));

// Serve the index.html file at the root path
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.post('/compress', upload.single('pdf'), async (req, res) => {
    const pdfPath = req.file.path;

    try {
        const pdfBytes = fs.readFileSync(pdfPath);
        const pdfDoc = await PDFDocument.load(pdfBytes);

        // Create a new PDF document for the compressed output
        const compressedPdfDoc = await PDFDocument.create();

        // Loop through each page
        for (let i = 0; i < pdfDoc.getPageCount(); i++) {
            const [copiedPage] = await compressedPdfDoc.copyPages(pdfDoc, [i]);
            compressedPdfDoc.addPage(copiedPage);
        }

        // Save the compressed PDF
        const compressedPdfBytes = await compressedPdfDoc.save();

        // Clean up the uploaded file
        fs.unlinkSync(pdfPath); // Clean up the uploaded file

        // Send the compressed PDF back to the client
        res.setHeader('Content-Disposition', 'attachment; filename=compressed.pdf');
        res.setHeader('Content-Type', 'application/pdf');
        res.send(compressedPdfBytes);
    } catch (error) {
        console.error('Error compressing PDF:', error);
        res.status(500).send('Error compressing the PDF');
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
