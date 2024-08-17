const express = require('express');
const multer = require('multer');
const { PDFDocument } = require('pdf-lib');
const fs = require('fs');
const path = require('path');

const app = express();
const upload = multer({ dest: 'uploads/' });

app.use(express.static('public'));

app.post('/compress', upload.single('pdf'), async (req, res) => {
    const compressionLevel = parseInt(req.body.compressionLevel);
    const pdfPath = req.file.path;

    try {
        const pdfBytes = fs.readFileSync(pdfPath);
        const pdfDoc = await PDFDocument.load(pdfBytes);

        // Compress the PDF based on the level
        const compressedPdfBytes = await pdfDoc.save({ useObjectStreams: compressionLevel > 1 });

        res.setHeader('Content-Disposition', 'attachment; filename=compressed.pdf');
        res.setHeader('Content-Type', 'application/pdf');
        res.send(compressedPdfBytes);
    } catch (error) {
        res.status(500).send('Error compressing the PDF');
    } finally {
        fs.unlinkSync(pdfPath); // Clean up the uploaded file
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
