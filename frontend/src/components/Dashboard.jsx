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
  faExclamationTriangle,
  faTable,
  faRocket,
  faSync,
  faLightbulb,
  faMagic,
  faArrowUp,
  faDatabase,
  faCloudUpload,
  faChartPie
} from '@fortawesome/free-solid-svg-icons';
import { uploadExcelFile, getFileStatus, getUserFiles, deleteFile, getCurrentUser } from '../api';
import AnalyticsView from './AnalyticsView';
import "./Dashboard.css";
import logo from "../assets/logo.png";

export default function Dashboard({ user, onLogout }) {
  console.log('Dashboard component rendered with user:', user);
  
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
  const [currentUser, setCurrentUser] = useState(user || null);

  // Load user's files on component mount
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      loadCurrentUser(); // Load fresh user data from backend
      loadUserFiles();
    } else {
      console.log('No authentication token found');
      setIsLoadingFiles(false);
      if (onLogout) {
        setTimeout(() => onLogout(), 1000);
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Load current user data
  const loadCurrentUser = async () => {
    try {
      const userData = await getCurrentUser();
      console.log('✅ Current user data loaded:', userData);
      setCurrentUser(userData);
    } catch (error) {
      console.error('❌ Failed to load current user:', error);
      // Keep the user data from props if API fails
      setCurrentUser(user);
    }
  };

  const loadUserFiles = async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      console.log('No token available for loading files');
      setIsLoadingFiles(false);
      return;
    }

    try {
      setIsLoadingFiles(true);
      console.log('Loading user files...');
      const files = await getUserFiles();
      console.log('Files loaded:', files);
      setRecentFiles(files);
    } catch (error) {
      console.error('Failed to load files:', error);
      
      if (error.message.includes('Session expired') || 
          error.message.includes('log in') || 
          error.message.includes('401') ||
          error.message.includes('unauthorized')) {
        localStorage.removeItem('token');
        alert('Session expired. Please log in again.');
        if (onLogout) onLogout();
        return;
      }
      
      setRecentFiles([]);
    } finally {
      setIsLoadingFiles(false);
    }
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
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + 20;
        });
      }, 100);

      console.log('Uploading file:', selectedFile.name);
      const response = await uploadExcelFile(selectedFile);
      
      clearInterval(progressInterval);
      setUploadProgress(100);
      setUploadStatus('processing');
      setUploadMessage('Processing Excel file...');

      await pollFileStatus(response.fileId);
      
    } catch (error) {
      console.error('Upload failed:', error);
      setUploadStatus('error');
      
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
      
      setTimeout(() => {
        setUploadStatus('');
        setUploadMessage('');
        setSelectedFile(null);
      }, 3000);
    }
  };

  const pollFileStatus = async (fileId) => {
    const maxAttempts = 60;
    let attempts = 0;

    const checkStatus = async () => {
      try {
        const status = await getFileStatus(fileId);
        
        if (status.status === 'completed') {
          setUploadStatus('completed');
          setUploadMessage('File processed successfully! Redirecting to analytics...');
          
          await loadUserFiles();
          
          setShowAutoRedirect(true);
          setAutoRedirectCount(3);
          
          const countdownInterval = setInterval(() => {
            setAutoRedirectCount(prev => {
              if (prev <= 1) {
                clearInterval(countdownInterval);
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
          
          setTimeout(() => {
            setIsUploading(false);
            setUploadStatus('');
            setUploadMessage('');
            setSelectedFile(null);
            setUploadProgress(0);
            setShowAutoRedirect(false);
          }, 4000);
          
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
          setTimeout(checkStatus, 500);
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
          setTimeout(checkStatus, 500);
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

  const getUserInitials = (user) => {
    if (!user) return 'U';
    
    if (user.username) {
      const names = user.username.trim().split(' ');
      if (names.length >= 2) {
        return (names[0][0] + names[names.length - 1][0]).toUpperCase();
      } else if (names.length === 1) {
        return user.username[0].toUpperCase();
      }
    }
    
    if (user.name) {
      const names = user.name.trim().split(' ');
      if (names.length >= 2) {
        return (names[0][0] + names[names.length - 1][0]).toUpperCase();
      } else if (names.length === 1) {
        return names[0][0].toUpperCase();
      }
    }
    
    if (user.email) {
      return user.email[0].toUpperCase();
    }
    
    return 'U';
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
              <div className="dashboard-header-spacer" />
              <div className="dashboard-user-section">
                <div className="user-profile" onClick={() => setShowUserMenu(!showUserMenu)}>
                  <div className="user-avatar">
                    <span className="user-initials">{getUserInitials(currentUser)}</span>
                  </div>
                  
                  {showUserMenu && (
                    <div className="user-dropdown">
                      <div className="dropdown-header">
                        <div className="dropdown-user-info">
                          <span className="dropdown-user-name">{currentUser?.username || 'User'}</span>
                          <span className="dropdown-user-email">{currentUser?.email || 'user@example.com'}</span>
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
              
              {/* Enhanced Welcome Section */}
              <div className="dashboard-welcome-section-new">
                <div className="welcome-content">
                  <h1>Welcome back, {currentUser?.username || 'User'}! 👋</h1>
                  <p>Transform your Excel data into powerful insights and visualizations</p>
                  <div className="welcome-stats">
                    <div className="stat-card">
                      <div className="stat-icon">
                        <FontAwesomeIcon icon={faDatabase} />
                      </div>
                      <div className="stat-info">
                        <span className="stat-number">{recentFiles.length}</span>
                        <span className="stat-label">Files Uploaded</span>
                      </div>
                    </div>
                    <div className="stat-card">
                      <div className="stat-icon">
                        <FontAwesomeIcon icon={faCheckCircle} />
                      </div>
                      <div className="stat-info">
                        <span className="stat-number">{recentFiles.filter(f => f.status === 'completed').length}</span>
                        <span className="stat-label">Ready for Analysis</span>
                      </div>
                    </div>
                    <div className="stat-card">
                      <div className="stat-icon">
                        <FontAwesomeIcon icon={faArrowUp} />
                      </div>
                      <div className="stat-info">
                        <span className="stat-number">{recentFiles.reduce((sum, f) => sum + (f.totalRows || 0), 0).toLocaleString()}</span>
                        <span className="stat-label">Data Points</span>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="welcome-visual">
                  <div className="floating-elements">
                    <FontAwesomeIcon icon={faChartBar} className="float-icon icon-1" />
                    <FontAwesomeIcon icon={faChartLine} className="float-icon icon-2" />
                    <FontAwesomeIcon icon={faChartPie} className="float-icon icon-3" />
                  </div>
                </div>
              </div>

              {/* Main Dashboard Grid */}
              <div className="dashboard-grid-new">
                
                {/* Left Column - Upload Section */}
                <div className="dashboard-left-new">
                  
                  {/* Enhanced Upload Card */}
                  <div className="upload-main-card">
                    <div className="upload-header">
                      <div className="upload-icon-wrapper">
                        <FontAwesomeIcon icon={faCloudUpload} className="upload-main-icon" />
                      </div>
                      <div className="upload-title">
                        <h2>Upload Excel File</h2>
                        <p>Drag & drop or click to select your .xls or .xlsx file</p>
                      </div>
                    </div>
                    
                    <div className="upload-zone" 
                         onDragOver={(e) => {
                           e.preventDefault();
                           e.currentTarget.classList.add('drag-over');
                         }}
                         onDragLeave={(e) => {
                           e.preventDefault();
                           e.currentTarget.classList.remove('drag-over');
                         }}
                         onDrop={(e) => {
                           e.preventDefault();
                           e.currentTarget.classList.remove('drag-over');
                           const files = e.dataTransfer.files;
                           if (files.length > 0) {
                             const file = files[0];
                             if (file.type === "application/vnd.ms-excel" || 
                                 file.type === "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet") {
                               setSelectedFile(file);
                             } else {
                               alert("Please select a valid Excel file (.xls or .xlsx)");
                             }
                           }
                         }}>
                      <input
                        type="file"
                        accept=".xls,.xlsx"
                        onChange={handleFileSelect}
                        className="file-input"
                        id="file-upload"
                        disabled={isUploading}
                      />
                      
                      {!selectedFile && !isUploading ? (
                        <label htmlFor="file-upload" className="file-upload-zone">
                          <div className="upload-zone-content">
                            <FontAwesomeIcon icon={faFolderOpen} className="zone-icon" />
                            <h3>Drag & Drop your Excel file here</h3>
                            <p>or <span className="click-text">click to browse</span></p>
                            <div className="supported-formats">
                              <span className="format-tag">.xlsx</span>
                              <span className="format-tag">.xls</span>
                            </div>
                            <div className="upload-limits">
                              <small>Maximum file size: 10MB</small>
                            </div>
                          </div>
                        </label>
                      ) : selectedFile && !isUploading ? (
                        <div className="selected-file-display">
                          <div className="file-preview">
                            <FontAwesomeIcon icon={faFileExcel} className="file-icon" />
                            <div className="file-details">
                              <h4>{selectedFile.name}</h4>
                              <p>{(selectedFile.size / 1024 / 1024).toFixed(2)} MB</p>
                            </div>
                            <button 
                              onClick={() => setSelectedFile(null)} 
                              className="remove-file-btn"
                              title="Remove file"
                            >
                              ×
                            </button>
                          </div>
                          <button 
                            onClick={handleFileUpload} 
                            className="upload-action-btn"
                          >
                            <FontAwesomeIcon icon={faRocket} className="btn-icon" />
                            Start Analysis
                          </button>
                        </div>
                      ) : (
                        <div className="upload-progress-display">
                          <div className="upload-status-main">
                            <div className="status-icon-main">
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
                            <div className="status-content">
                              <h4 className="status-message">{uploadMessage}</h4>
                              {selectedFile && (
                                <p className="file-name">{selectedFile.name}</p>
                              )}
                            </div>
                          </div>
                          
                          {uploadStatus !== 'error' && (
                            <div className="progress-section">
                              <div className="progress-bar-main">
                                <div 
                                  className={`progress-fill-main ${uploadStatus}`}
                                  style={{ width: `${uploadProgress}%` }}
                                ></div>
                              </div>
                              <span className="progress-percentage">{uploadProgress}%</span>
                            </div>
                          )}
                          
                          {/* Auto-redirect section */}
                          {showAutoRedirect && (
                            <div className="redirect-section">
                              <div className="redirect-content">
                                <FontAwesomeIcon icon={faCheckCircle} className="success-icon" />
                                <div className="redirect-text">
                                  <h4>🎉 Analysis Complete!</h4>
                                  <p>Redirecting to analytics in <strong>{autoRedirectCount}</strong> seconds...</p>
                                </div>
                              </div>
                              <div className="redirect-buttons">
                                <button 
                                  onClick={() => {
                                    cancelAutoRedirect();
                                    const latestFile = recentFiles.length > 0 ? recentFiles[0] : {
                                      id: uploadMessage.includes('successfully') ? 'latest' : null,
                                      name: selectedFile?.name || 'uploaded_file'
                                    };
                                    setSelectedAnalyticsFile(latestFile);
                                    setShowAnalytics(true);
                                  }}
                                  className="redirect-btn-primary"
                                >
                                  <FontAwesomeIcon icon={faEye} />
                                  View Now
                                </button>
                                <button 
                                  onClick={cancelAutoRedirect}
                                  className="redirect-btn-secondary"
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

                  {/* Quick Actions */}
                  <div className="quick-actions-card">
                    <h3>
                      <FontAwesomeIcon icon={faRocket} style={{marginRight: '8px', color: 'var(--orange)'}} />
                      Quick Actions
                    </h3>
                    <div className="quick-actions-grid">
                      <button className="quick-action-btn" onClick={() => document.getElementById('file-upload').click()}>
                        <FontAwesomeIcon icon={faPlus} />
                        <span>New Upload</span>
                      </button>
                      <button className="quick-action-btn" onClick={() => window.location.reload()}>
                        <FontAwesomeIcon icon={faSync} />
                        <span>Refresh Files</span>
                      </button>
                      <button className="quick-action-btn" onClick={() => alert('Export feature coming soon!')}>
                        <FontAwesomeIcon icon={faDownload} />
                        <span>Export Data</span>
                      </button>
                      <button className="quick-action-btn" onClick={() => alert('Templates feature coming soon!')}>
                        <FontAwesomeIcon icon={faChartBar} />
                        <span>Templates</span>
                      </button>
                    </div>
                  </div>

                  {/* Usage Tips */}
                  <div className="tips-card">
                    <h3>
                      <FontAwesomeIcon icon={faLightbulb} style={{marginRight: '8px', color: 'var(--orange)'}} />
                      Pro Tips
                    </h3>
                    <div className="tips-list">
                      <div className="tip-item">
                        <span className="tip-icon">💡</span>
                        <span>Files up to 10MB are supported</span>
                      </div>
                      <div className="tip-item">
                        <span className="tip-icon">⚡</span>
                        <span>Processing is faster with clean data</span>
                      </div>
                      <div className="tip-item">
                        <span className="tip-icon">🎯</span>
                        <span>Use descriptive column headers</span>
                      </div>
                      <div className="tip-item">
                        <span className="tip-icon">📊</span>
                        <span>Numerical data creates better charts</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Right Column - Recent Files & Analytics */}
                <div className="dashboard-right-new">
                  
                  {/* Recent Files Section */}
                  <div className="recent-files-main">
                    <div className="recent-header">
                      <h3>
                        <FontAwesomeIcon icon={faFileExcel} className="section-icon" />
                        Recent Files
                      </h3>
                      <div className="header-actions">
                        <button className="refresh-btn" onClick={() => loadUserFiles()}>
                          <FontAwesomeIcon icon={faSync} />
                        </button>
                      </div>
                    </div>

                    <div className="files-container">
                      {isLoadingFiles ? (
                        <div className="loading-files">
                          <FontAwesomeIcon icon={faSpinner} className="loading-icon spinning" />
                          <span>Loading your files...</span>
                        </div>
                      ) : recentFiles.length > 0 ? (
                        <div className="recent-files-list">
                          {recentFiles.map((file) => (
                            <div key={file.id} className="file-card">
                              <div className="file-card-header">
                                <div className="file-icon-wrapper">
                                  <FontAwesomeIcon icon={faFileExcel} className="file-card-icon" />
                                </div>
                                <div className="file-card-info">
                                  <h4 className="file-name">{file.name}</h4>
                                  <div className="file-meta">
                                    <span className="file-date">
                                      <FontAwesomeIcon icon={faCalendarAlt} />
                                      {formatDate(file.uploadDate)}
                                    </span>
                                    <span className="file-size">
                                      <FontAwesomeIcon icon={faWeight} />
                                      {file.size}
                                    </span>
                                  </div>
                                </div>
                                <div className="file-status-badge">
                                  <span 
                                    className={`status-dot ${file.status}`}
                                    style={{ backgroundColor: getFileStatusColor(file.status) }}
                                  ></span>
                                  <span className="status-text">{file.status}</span>
                                  {file.status === 'processing' && (
                                    <FontAwesomeIcon icon={faSpinner} className="processing-spinner spinning" />
                                  )}
                                </div>
                              </div>
                              
                              <div className="file-card-stats">
                                {file.totalRows && (
                                  <div className="stat">
                                    <FontAwesomeIcon icon={faTable} />
                                    <span>{file.totalRows.toLocaleString()} rows</span>
                                  </div>
                                )}
                                {file.totalSheets && (
                                  <div className="stat">
                                    <FontAwesomeIcon icon={faFileExcel} />
                                    <span>{file.totalSheets} sheet{file.totalSheets !== 1 ? 's' : ''}</span>
                                  </div>
                                )}
                                <div className="stat">
                                  <FontAwesomeIcon icon={faChartBar} />
                                  <span>{file.charts || 0} charts</span>
                                </div>
                              </div>
                              
                              <div className="file-card-actions">
                                <button 
                                  className={`action-btn primary ${file.status !== 'completed' ? 'disabled' : ''}`}
                                  disabled={file.status !== 'completed'}
                                  onClick={() => handleViewAnalytics(file)}
                                >
                                  <FontAwesomeIcon icon={faEye} />
                                  Analyze
                                </button>
                                <button 
                                  className="action-btn danger"
                                  onClick={() => handleDeleteFile(file.id)}
                                >
                                  <FontAwesomeIcon icon={faTrash} />
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="no-files-state">
                          <FontAwesomeIcon icon={faFileExcel} className="empty-icon" />
                          <h4>No files yet</h4>
                          <p>Upload your first Excel file to get started with data analysis!</p>
                          <button 
                            className="cta-button" 
                            onClick={() => document.getElementById('file-upload').click()}
                          >
                            <FontAwesomeIcon icon={faPlus} />
                            Upload File
                          </button>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Analytics Preview */}
                  {recentFiles.filter(f => f.status === 'completed').length > 0 && (
                    <div className="analytics-preview-card">
                      <h3>
                        <FontAwesomeIcon icon={faChartLine} style={{marginRight: '8px', color: 'var(--orange)'}} />
                        Analytics Overview
                      </h3>
                      <div className="analytics-summary">
                        <div className="summary-item">
                          <span className="summary-label">Total Data Points</span>
                          <span className="summary-value">
                            {recentFiles.reduce((sum, f) => sum + (f.totalRows || 0), 0).toLocaleString()}
                          </span>
                        </div>
                        <div className="summary-item">
                          <span className="summary-label">Files Ready</span>
                          <span className="summary-value">
                            {recentFiles.filter(f => f.status === 'completed').length}
                          </span>
                        </div>
                        <div className="summary-item">
                          <span className="summary-label">Total Sheets</span>
                          <span className="summary-value">
                            {recentFiles.reduce((sum, f) => sum + (f.totalSheets || 0), 0)}
                          </span>
                        </div>
                      </div>
                      <button 
                        className="analytics-cta"
                        onClick={() => {
                          const readyFile = recentFiles.find(f => f.status === 'completed');
                          if (readyFile) {
                            handleViewAnalytics(readyFile);
                          }
                        }}
                      >
                        <FontAwesomeIcon icon={faMagic} />
                        Start Analytics
                      </button>
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
