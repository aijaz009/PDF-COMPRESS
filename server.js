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

// Function to compress images
async function compressImage(imageBuffer) {
    return await sharp(imageBuffer)
        .resize({ width: 800 }) // Resize to a width of 800px, adjust as needed
        .jpeg({ quality: 70 }) // Compress to JPEG with 70% quality
        .toBuffer();
}

// Function to process PDF
app.post('/compress', upload.single('pdf'), async (req, res) => {
    const pdfPath = req.file.path;

    try {
        const pdfBytes = fs.readFileSync(pdfPath);
        const pdfDoc = await PDFDocument.load(pdfBytes);
        const compressedPdfDoc = await PDFDocument.create();

        // Loop through each page
        for (let i = 0; i < pdfDoc.getPageCount(); i++) {
            const page = pdfDoc.getPage(i);
            const { width, height } = page.getSize();

            // Create a new page in the compressed PDF
            const newPage = compressedPdfDoc.addPage([width, height]);

            // Extract images from the page
            const images = page.node.getImages(); // This is a conceptual function
            for (const image of images) {
                const imageBuffer = await image.getImageData(); // This is a conceptual function
                const compressedImageBuffer = await compressImage(imageBuffer);
                newPage.drawImage(compressedImageBuffer, { x: 0, y: 0, width, height });
            }
        }

        const compressedPdfBytes = await compressedPdfDoc.save();
        fs.unlinkSync(pdfPath); // Clean up the uploaded file

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
