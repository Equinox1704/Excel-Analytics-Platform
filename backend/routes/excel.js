const express = require('express');
const multer = require('multer');
const XLSX = require('xlsx');
const path = require('path');
const fs = require('fs');
const ExcelFile = require('../models/ExcelFile');
const authenticateToken = require('../middleware/auth');
const router = express.Router();

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadDir = 'uploads/excel';
    // Create directory if it doesn't exist
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    // Generate unique filename
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const fileFilter = (req, file, cb) => {
  // Check if file is Excel format
  const allowedMimes = [
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
  ];
  
  if (allowedMimes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Only Excel files (.xls, .xlsx) are allowed!'), false);
  }
};

const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit
  }
});

// Upload Excel file
router.post('/upload', authenticateToken, upload.single('excelFile'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    // Get authenticated user ID
    const userId = req.user._id;
    console.log(`📊 User ${req.user.email} uploading file: ${req.file.originalname}`);

    // Create initial file record with timeout handling
    const excelFile = new ExcelFile({
      userId: userId,
      filename: req.file.filename,
      originalName: req.file.originalname,
      size: req.file.size,
      status: 'processing'
    });

    await excelFile.save({ 
      maxTimeMS: 10000,
      bufferCommands: false 
    });

    // Process Excel file asynchronously
    processExcelFile(req.file.path, excelFile._id);

    res.json({
      message: 'File uploaded successfully',
      fileId: excelFile._id,
      status: 'processing'
    });

  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ 
      message: 'Upload failed', 
      error: error.message 
    });
  }
});

// Process Excel file function
async function processExcelFile(filePath, fileId) {
  try {
    // Read the Excel file
    const workbook = XLSX.readFile(filePath);
    const sheetNames = workbook.SheetNames;
    
    const sheets = [];
    let totalRows = 0;
    let totalColumns = 0;

    // Process each sheet
    for (const sheetName of sheetNames) {
      const worksheet = workbook.Sheets[sheetName];
      
      // Convert to JSON
      const jsonData = XLSX.utils.sheet_to_json(worksheet, { 
        header: 1,
        defval: null 
      });
      
      if (jsonData.length > 0) {
        // First row as headers
        const columns = jsonData[0] || [];
        const data = jsonData.slice(1).map(row => {
          const rowObj = {};
          columns.forEach((col, index) => {
            if (col) {
              rowObj[col] = row[index] || null;
            }
          });
          return rowObj;
        });

        sheets.push({
          name: sheetName,
          data: data,
          columns: columns,
          rowCount: data.length
        });

        totalRows += data.length;
        totalColumns = Math.max(totalColumns, columns.length);
      }
    }

    // Update file record with processed data
    await ExcelFile.findByIdAndUpdate(fileId, {
      status: 'completed',
      sheets: sheets,
      metadata: {
        totalSheets: sheetNames.length,
        totalRows: totalRows,
        totalColumns: totalColumns,
        fileType: path.extname(filePath),
        processedAt: new Date()
      }
    }, {
      maxTimeMS: 15000,
      bufferCommands: false
    });

    // Clean up uploaded file
    fs.unlinkSync(filePath);

    console.log(`✅ Excel file processed successfully: ${fileId}`);

  } catch (error) {
    console.error('Excel processing error:', error);
    
    try {
      // Update file record with error
      await ExcelFile.findByIdAndUpdate(fileId, {
        status: 'error',
        errorMessage: error.message
      }, {
        maxTimeMS: 10000,
        bufferCommands: false
      });
    } catch (updateError) {
      console.error('Error updating file status:', updateError);
    }

    // Clean up uploaded file
    try {
      fs.unlinkSync(filePath);
    } catch (unlinkError) {
      console.error('File cleanup error:', unlinkError);
    }
  }
}

// Get file status
router.get('/status/:fileId', authenticateToken, async (req, res) => {
  try {
    const file = await ExcelFile.findOne({
      _id: req.params.fileId,
      userId: req.user._id // Ensure user can only access their own files
    })
    .select('status errorMessage metadata originalName uploadDate')
    .maxTimeMS(5000)
    .setOptions({ bufferCommands: false })
    .lean();
    
    if (!file) {
      return res.status(404).json({ message: 'File not found' });
    }

    res.json(file);
  } catch (error) {
    console.error('Status check error:', error);
    
    if (error.name === 'MongoNetworkTimeoutError' || error.message.includes('timeout')) {
      return res.status(503).json({ message: 'Database temporarily unavailable. Please try again.' });
    }
    
    res.status(500).json({ message: 'Status check failed' });
  }
});

// Get user's files
router.get('/files', authenticateToken, async (req, res) => {
  try {
    const files = await ExcelFile.find({ 
      userId: req.user._id 
    })
    .select('originalName uploadDate status metadata charts size')
    .sort({ uploadDate: -1 })
    .limit(20)
    .maxTimeMS(8000)
    .setOptions({ bufferCommands: false })
    .lean();

    const formattedFiles = files.map(file => ({
      id: file._id,
      name: file.originalName,
      uploadDate: file.uploadDate.toISOString().split('T')[0],
      size: `${(file.size / (1024 * 1024)).toFixed(1)} MB`,
      type: 'excel',
      status: file.status,
      charts: file.charts ? file.charts.length : 0,
      totalRows: file.metadata?.totalRows || 0,
      totalSheets: file.metadata?.totalSheets || 0
    }));

    res.json(formattedFiles);
  } catch (error) {
    console.error('Files fetch error:', error);
    
    if (error.name === 'MongoNetworkTimeoutError' || error.message.includes('timeout')) {
      return res.status(503).json({ message: 'Database temporarily unavailable. Please try again.' });
    }
    
    res.status(500).json({ message: 'Failed to fetch files' });
  }
});

// Get file data for visualization
router.get('/data/:fileId', authenticateToken, async (req, res) => {
  try {
    const file = await ExcelFile.findOne({
      _id: req.params.fileId,
      userId: req.user._id // Ensure user can only access their own files
    })
    .maxTimeMS(10000)
    .setOptions({ bufferCommands: false })
    .lean();
    
    if (!file) {
      return res.status(404).json({ message: 'File not found' });
    }

    if (file.status !== 'completed') {
      return res.status(400).json({ 
        message: 'File not ready', 
        status: file.status 
      });
    }

    res.json({
      id: file._id,
      name: file.originalName,
      sheets: file.sheets,
      metadata: file.metadata
    });
  } catch (error) {
    console.error('Data fetch error:', error);
    
    if (error.name === 'MongoNetworkTimeoutError' || error.message.includes('timeout')) {
      return res.status(503).json({ message: 'Database temporarily unavailable. Please try again.' });
    }
    
    res.status(500).json({ message: 'Failed to fetch file data' });
  }
});

// Delete file
router.delete('/file/:fileId', authenticateToken, async (req, res) => {
  try {
    const file = await ExcelFile.findOneAndDelete({
      _id: req.params.fileId,
      userId: req.user._id // Ensure user can only delete their own files
    });
    
    if (!file) {
      return res.status(404).json({ message: 'File not found' });
    }

    res.json({ message: 'File deleted successfully' });
  } catch (error) {
    console.error('Delete error:', error);
    res.status(500).json({ message: 'Failed to delete file' });
  }
});

module.exports = router;
