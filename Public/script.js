document.getElementById('compressionLevel').addEventListener('input', function() {
    const compressionValue = this.value;
    document.getElementById('compressionValue').textContent = compressionValue;

    // Update estimated size based on compression level
    const fileInput = document.getElementById('pdfFile');
    if (fileInput.files.length > 0) {
        const fileSize = fileInput.files[0].size; // in bytes
        const estimatedSize = Math.max(1, Math.floor(fileSize * (1 - (compressionValue - 1) * 0.2))); // Adjust the estimation logic
        document.getElementById('estimatedSize').textContent = `Estimated Size: ${(estimatedSize / 1024).toFixed(2)} KB`;
    }
});

document.getElementById('pdfFile').addEventListener('change', function() {
    const fileInput = this;
    const filePath = fileInput.value;
    const allowedExtensions = /(\.pdf)$/i;

    if (!allowedExtensions.exec(filePath)) {
        alert('Please upload a file with .pdf extension.');
        fileInput.value = ''; // Clear the input
    }
});

document.getElementById('uploadForm').addEventListener('submit', async function(event) {
    event.preventDefault();

    const formData = new FormData();
    const pdfFile = document.getElementById('pdfFile').files[0];
    const compressionLevel = document.getElementById('compressionLevel').value;

    if (!pdfFile || pdfFile.type !== 'application/pdf') {
        alert('Please upload a valid PDF file.');
        return;
    }

    formData.append('pdf', pdfFile);
    formData.append('compressionLevel', compressionLevel);

    const response = await fetch('/compress', {
        method: 'POST',
        body: formData,
    });

    if (response.ok) {
        const blob = await response.blob();
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'compressed.pdf';
        document.body.appendChild(a);
        a.click();
        a.remove();
    } else {
        alert('Error compressing the PDF');
    }
});
