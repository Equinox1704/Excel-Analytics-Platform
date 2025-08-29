const mongoose = require('mongoose');

const excelFileSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  filename: {
    type: String,
    required: true
  },
  originalName: {
    type: String,
    required: true
  },
  size: {
    type: Number,
    required: true
  },
  uploadDate: {
    type: Date,
    default: Date.now
  },
  status: {
    type: String,
    enum: ['uploading', 'processing', 'completed', 'error'],
    default: 'uploading'
  },
  sheets: [{
    name: String,
    data: [{
      type: mongoose.Schema.Types.Mixed
    }],
    columns: [String],
    rowCount: Number
  }],
  metadata: {
    totalSheets: Number,
    totalRows: Number,
    totalColumns: Number,
    fileType: String,
    processedAt: Date
  },
  charts: [{
    id: String,
    type: String,
    title: String,
    xAxis: String,
    yAxis: String,
    data: mongoose.Schema.Types.Mixed,
    createdAt: {
      type: Date,
      default: Date.now
    }
  }],
  errorMessage: String
}, {
  timestamps: true
});

// Index for faster queries
excelFileSchema.index({ userId: 1, uploadDate: -1 });
excelFileSchema.index({ status: 1 });

module.exports = mongoose.model('ExcelFile', excelFileSchema);
