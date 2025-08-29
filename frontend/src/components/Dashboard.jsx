import React, { useState, useEffect } from "react";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faUpload, 
  faChartBar, 
  faChartLine, 
  faDownload,
  faFileExcel,
  faUser,
  faSignOutAlt,
  faFolderOpen,
  faCalendarAlt,
  faWeight,
  faEye,
  faTrash,
  faPlus,
  faSpinner,
  faCheckCircle,
  faExclamationTriangle
} from '@fortawesome/free-solid-svg-icons';
import { uploadExcelFile, getFileStatus, getUserFiles, deleteFile } from '../api';
import AnalyticsView from './AnalyticsView';
import "./Dashboard.css";
import logo from "../assets/logo.png";

export default function Dashboard({ user, onLogout }) {
  const [selectedFile, setSelectedFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [recentFiles, setRecentFiles] = useState([]);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [uploadStatus, setUploadStatus] = useState('');
  const [uploadMessage, setUploadMessage] = useState('');
  const [isLoadingFiles, setIsLoadingFiles] = useState(true);
  const [showAnalytics, setShowAnalytics] = useState(false);
  const [selectedAnalyticsFile, setSelectedAnalyticsFile] = useState(null);
  const [autoRedirectCount, setAutoRedirectCount] = useState(0);
  const [showAutoRedirect, setShowAutoRedirect] = useState(false);

  // Load user's files on component mount
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      loadUserFiles();
    } else {
      console.log('No authentication token found');
      setIsLoadingFiles(false);
      // Optionally redirect to login
      if (onLogout) {
        setTimeout(() => onLogout(), 1000);
      }
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const loadUserFiles = async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      console.log('No token available for loading files');
      setIsLoadingFiles(false);
      return;
    }

    try {
      setIsLoadingFiles(true);
      const files = await getUserFiles();
      setRecentFiles(files);
    } catch (error) {
      console.error('Failed to load files:', error);
      
      // Handle authentication errors
      if (error.message.includes('Session expired') || 
          error.message.includes('log in') || 
          error.message.includes('401') ||
          error.message.includes('unauthorized')) {
        localStorage.removeItem('token');
        alert('Session expired. Please log in again.');
        if (onLogout) onLogout();
        return;
      }
      
      // For other errors, just show empty state
      setRecentFiles([]);
    } finally {
      setIsLoadingFiles(false);
    }
  };

  const loadDemoFiles = () => {
    // Demo data for display purposes
    setRecentFiles([
      { 
        id: 1,
        name: "Sales_Data_Q4.xlsx", 
        uploadDate: "2025-01-15", 
        size: "2.3 MB", 
        type: "excel",
        status: "completed",
        charts: 3,
        totalRows: 1250,
        totalSheets: 3
      },
      { 
        id: 2,
        name: "Marketing_Analytics.xlsx", 
        uploadDate: "2025-01-12", 
        size: "1.8 MB", 
        type: "excel",
        status: "completed",
        charts: 5,
        totalRows: 890,
        totalSheets: 2
      },
      { 
        id: 3,
        name: "Financial_Report.xlsx", 
        uploadDate: "2025-01-10", 
        size: "3.1 MB", 
        type: "excel",
        status: "processing",
        charts: 0,
        totalRows: 2100,
        totalSheets: 4
      },
    ]);
    setIsLoadingFiles(false);
  };

  // Close user menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (showUserMenu && !event.target.closest('.user-profile')) {
        setShowUserMenu(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showUserMenu]);

  const handleFileSelect = (event) => {
    const file = event.target.files[0];
    if (file && (file.type === "application/vnd.ms-excel" || 
                 file.type === "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet")) {
      setSelectedFile(file);
    } else {
      alert("Please select a valid Excel file (.xls or .xlsx)");
    }
  };

  const handleFileUpload = async () => {
    if (!selectedFile) return;
    
    setIsUploading(true);
    setUploadProgress(0);
    setUploadStatus('uploading');
    setUploadMessage('Uploading file...');
    
    try {
      // Simulate upload progress
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + 10;
        });
      }, 200);

      // Upload file to backend
      console.log('Uploading file:', selectedFile.name);
      const response = await uploadExcelFile(selectedFile);
      
      clearInterval(progressInterval);
      setUploadProgress(100);
      setUploadStatus('processing');
      setUploadMessage('Processing Excel file...');

      // Poll for file status
      await pollFileStatus(response.fileId);
      
    } catch (error) {
      console.error('Upload failed:', error);
      setUploadStatus('error');
      
      // Handle authentication errors
      if (error.message.includes('Session expired') || error.message.includes('log in')) {
        setUploadMessage('Session expired. Please log in again.');
        localStorage.removeItem('token');
        setTimeout(() => {
          if (onLogout) onLogout();
        }, 2000);
      } else {
        setUploadMessage(`Upload failed: ${error.message}`);
      }
      
      setIsUploading(false);
      
      // Reset after 3 seconds
      setTimeout(() => {
        setUploadStatus('');
        setUploadMessage('');
        setSelectedFile(null);
      }, 3000);
    }
  };

  const pollFileStatus = async (fileId) => {
    const maxAttempts = 30; // 30 seconds max
    let attempts = 0;

    const checkStatus = async () => {
      try {
        const status = await getFileStatus(fileId);
        
        if (status.status === 'completed') {
          setUploadStatus('completed');
          setUploadMessage('File processed successfully! Redirecting to analytics...');
          
          // Reload files list
          await loadUserFiles();
          
          // Show auto-redirect countdown
          setShowAutoRedirect(true);
          setAutoRedirectCount(5);
          
          // Start countdown
          const countdownInterval = setInterval(() => {
            setAutoRedirectCount(prev => {
              if (prev <= 1) {
                clearInterval(countdownInterval);
                // Auto-redirect to analytics
                const completedFile = {
                  id: fileId,
                  name: selectedFile.name
                };
                setSelectedAnalyticsFile(completedFile);
                setShowAnalytics(true);
                return 0;
              }
              return prev - 1;
            });
          }, 1000);
          
          // Reset form after redirect
          setTimeout(() => {
            setIsUploading(false);
            setUploadStatus('');
            setUploadMessage('');
            setSelectedFile(null);
            setUploadProgress(0);
            setShowAutoRedirect(false);
          }, 6000);
          
        } else if (status.status === 'error') {
          setUploadStatus('error');
          setUploadMessage(`Processing failed: ${status.errorMessage || 'Unknown error'}`);
          setIsUploading(false);
          
          setTimeout(() => {
            setUploadStatus('');
            setUploadMessage('');
            setSelectedFile(null);
          }, 3000);
          
        } else if (attempts < maxAttempts) {
          attempts++;
          setTimeout(checkStatus, 1000); // Check again in 1 second
        } else {
          setUploadStatus('error');
          setUploadMessage('Processing timeout. Please try again.');
          setIsUploading(false);
          
          setTimeout(() => {
            setUploadStatus('');
            setUploadMessage('');
            setSelectedFile(null);
          }, 3000);
        }
      } catch (error) {
        console.error('Status check failed:', error);
        attempts++;
        if (attempts < maxAttempts) {
          setTimeout(checkStatus, 1000);
        } else {
          setUploadStatus('error');
          setUploadMessage('Failed to check processing status.');
          setIsUploading(false);
        }
      }
    };

    checkStatus();
  };

  const handleDeleteFile = async (fileId) => {
    try {
      await deleteFile(fileId);
      setRecentFiles(prev => prev.filter(file => file.id !== fileId));
    } catch (error) {
      console.error('Delete failed:', error);
      alert(`Failed to delete file: ${error.message}`);
    }
  };

  const handleViewAnalytics = (file) => {
    setSelectedAnalyticsFile(file);
    setShowAnalytics(true);
  };

  const handleBackToDashboard = () => {
    setShowAnalytics(false);
    setSelectedAnalyticsFile(null);
  };

  const cancelAutoRedirect = () => {
    setShowAutoRedirect(false);
    setAutoRedirectCount(0);
  };

  const getFileStatusColor = (status) => {
    switch (status) {
      case 'completed': return '#10B981';
      case 'processing': return '#F59E0B';
      case 'error': return '#EF4444';
      default: return '#6B7280';
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  return (
    <>
      {showAnalytics ? (
        <AnalyticsView 
          fileId={selectedAnalyticsFile?.id}
          fileName={selectedAnalyticsFile?.name}
          onBack={handleBackToDashboard}
        />
      ) : (
        <div className="dashboard-root">
      {/* Header */}
      <header className="dashboard-header">
        <div className="dashboard-header-content">
          <div className="dashboard-logo-section">
            <img src={logo} alt="InsightSheet" className="dashboard-logo" />
          </div>
          <div className="dashboard-user-section">
            <div className="user-profile" onClick={() => setShowUserMenu(!showUserMenu)}>
              <div className="user-avatar">
                <FontAwesomeIcon icon={faUser} className="user-avatar-icon" />
              </div>
              
              {showUserMenu && (
                <div className="user-dropdown">
                  <div className="dropdown-header">
                    <div className="dropdown-user-info">
                      <span className="dropdown-user-name">{user?.name || 'User'}</span>
                      <span className="dropdown-user-email">{user?.email || 'user@example.com'}</span>
                    </div>
                  </div>
                  <div className="dropdown-divider"></div>
                  <div className="dropdown-item">
                    <FontAwesomeIcon icon={faUser} className="dropdown-icon" />
                    <span>Profile Settings</span>
                  </div>
                  <div className="dropdown-divider"></div>
                  <div className="dropdown-item logout-item" onClick={onLogout}>
                    <FontAwesomeIcon icon={faSignOutAlt} className="dropdown-icon" />
                    <span>Sign Out</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="dashboard-main">
        <div className="dashboard-container">
          <div className="dashboard-welcome-section">
            <h2>Start Analyzing Your Data</h2>
            <p>Upload an Excel file to begin creating insights and visualizations</p>
          </div>

          {/* Upload Section */}
          <div className="dashboard-upload-section">
            <div className="upload-card">
              <div className="upload-icon">
                <FontAwesomeIcon icon={faUpload} className="upload-fa-icon" />
              </div>
              <h3>Upload Excel File</h3>
              <p>Select your .xls or .xlsx file to get started with data analysis</p>
              
              <input
                type="file"
                accept=".xls,.xlsx"
                onChange={handleFileSelect}
                className="file-input"
                id="file-upload"
                disabled={isUploading}
              />
              <label htmlFor="file-upload" className={`file-upload-label ${isUploading ? 'disabled' : ''}`}>
                <FontAwesomeIcon icon={faFolderOpen} className="label-icon" />
                Choose File
              </label>
              
              {selectedFile && !isUploading && (
                <div className="selected-file">
                  <div className="selected-file-info">
                    <FontAwesomeIcon icon={faFileExcel} className="file-type-icon" />
                    <span>Selected: {selectedFile.name}</span>
                  </div>
                  <button 
                    onClick={handleFileUpload} 
                    className="upload-btn"
                  >
                    <FontAwesomeIcon icon={faUpload} className="btn-icon" />
                    Upload & Analyze
                  </button>
                </div>
              )}

              {/* Upload Progress */}
              {isUploading && (
                <div className="upload-progress-section">
                  <div className="upload-status">
                    <div className="status-icon-wrapper">
                      {uploadStatus === 'uploading' && (
                        <FontAwesomeIcon icon={faSpinner} className="status-icon spinning" />
                      )}
                      {uploadStatus === 'processing' && (
                        <FontAwesomeIcon icon={faSpinner} className="status-icon spinning" />
                      )}
                      {uploadStatus === 'completed' && (
                        <FontAwesomeIcon icon={faCheckCircle} className="status-icon success" />
                      )}
                      {uploadStatus === 'error' && (
                        <FontAwesomeIcon icon={faExclamationTriangle} className="status-icon error" />
                      )}
                    </div>
                    <div className="status-text">
                      <span className="status-message">{uploadMessage}</span>
                      {selectedFile && (
                        <span className="file-name">{selectedFile.name}</span>
                      )}
                    </div>
                  </div>
                  
                  {uploadStatus !== 'error' && (
                    <div className="progress-bar-container">
                      <div className="progress-bar">
                        <div 
                          className={`progress-fill ${uploadStatus}`}
                          style={{ width: `${uploadProgress}%` }}
                        ></div>
                      </div>
                      <span className="progress-text">{uploadProgress}%</span>
                    </div>
                  )}
                  
                  {/* Auto-redirect countdown */}
                  {showAutoRedirect && (
                    <div className="auto-redirect-section">
                      <div className="redirect-message">
                        <FontAwesomeIcon icon={faCheckCircle} className="redirect-icon" />
                        <div className="redirect-text">
                          <p>🎉 Ready to analyze your data!</p>
                          <p>Redirecting to analytics in <strong>{autoRedirectCount}</strong> seconds...</p>
                        </div>
                      </div>
                      <div className="redirect-actions">
                        <button 
                          onClick={() => {
                            cancelAutoRedirect();
                            const completedFile = {
                              id: uploadMessage.includes('successfully') ? 'current' : null,
                              name: selectedFile.name
                            };
                            setSelectedAnalyticsFile(completedFile);
                            setShowAnalytics(true);
                          }}
                          className="redirect-btn primary"
                        >
                          View Analytics Now
                        </button>
                        <button 
                          onClick={cancelAutoRedirect}
                          className="redirect-btn secondary"
                        >
                          Stay Here
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Features Preview */}
          <div className="dashboard-content-grid">
            <div className="dashboard-features">
              <h3>What you can do:</h3>
              <div className="feature-grid">
                <div className="feature-item">
                  <div className="feature-icon-wrapper">
                    <FontAwesomeIcon icon={faChartBar} className="feature-fa-icon" />
                  </div>
                  <h4>Data Visualization</h4>
                  <p>Create charts and graphs from your Excel data</p>
                </div>
                <div className="feature-item">
                  <div className="feature-icon-wrapper">
                    <FontAwesomeIcon icon={faChartLine} className="feature-fa-icon" />
                  </div>
                  <h4>Dynamic Analysis</h4>
                  <p>Select different columns for X and Y axes</p>
                </div>
                <div className="feature-item">
                  <div className="feature-icon-wrapper">
                    <FontAwesomeIcon icon={faDownload} className="feature-fa-icon" />
                  </div>
                  <h4>Export Results</h4>
                  <p>Download charts as PNG or PDF files</p>
                </div>
              </div>
            </div>

            {/* Recent Files Section */}
            <div className="dashboard-recent">
              <div className="recent-header">
                <h3>
                  <FontAwesomeIcon icon={faFileExcel} className="section-icon" />
                  Recent Files
                </h3>
                <button className="add-file-btn">
                  <FontAwesomeIcon icon={faPlus} className="btn-icon" />
                  New File
                </button>
              </div>
              {isLoadingFiles ? (
                <div className="loading-files">
                  <FontAwesomeIcon icon={faSpinner} className="loading-icon spinning" />
                  <span>Loading your files...</span>
                </div>
              ) : recentFiles.length > 0 ? (
                <div className="recent-files-list">
                  {recentFiles.map((file) => (
                    <div key={file.id} className="recent-file-item">
                      <div className="file-icon-wrapper">
                        <FontAwesomeIcon icon={faFileExcel} className="file-fa-icon" />
                      </div>
                      <div className="file-info">
                        <div className="file-name">{file.name}</div>
                        <div className="file-meta">
                          <span className="file-date">
                            <FontAwesomeIcon icon={faCalendarAlt} className="meta-icon" />
                            {formatDate(file.uploadDate)}
                          </span>
                          <span className="file-size">
                            <FontAwesomeIcon icon={faWeight} className="meta-icon" />
                            {file.size}
                          </span>
                          <span className="file-charts">
                            <FontAwesomeIcon icon={faChartBar} className="meta-icon" />
                            {file.charts} charts
                          </span>
                          {file.totalRows && (
                            <span className="file-rows">
                              📊 {file.totalRows} rows
                            </span>
                          )}
                        </div>
                        <div className="file-status">
                          <span 
                            className="status-indicator" 
                            style={{ backgroundColor: getFileStatusColor(file.status) }}
                          ></span>
                          {file.status}
                          {file.status === 'processing' && (
                            <FontAwesomeIcon icon={faSpinner} className="processing-spinner spinning" />
                          )}
                        </div>
                      </div>
                      <div className="file-actions">
                        <button 
                          className="file-action-btn view-btn"
                          disabled={file.status !== 'completed'}
                          onClick={() => handleViewAnalytics(file)}
                        >
                          <FontAwesomeIcon icon={faEye} className="action-icon" />
                          View
                        </button>
                        <button 
                          className="file-action-btn delete-btn"
                          onClick={() => handleDeleteFile(file.id)}
                        >
                          <FontAwesomeIcon icon={faTrash} className="action-icon" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="no-recent-files">
                  <FontAwesomeIcon icon={faFileExcel} className="empty-icon" />
                  <h4>No files yet</h4>
                  <p>Upload your first Excel file to get started with data analysis!</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
        </div>
      )}
    </>
  );
}
