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
  faPlus
} from '@fortawesome/free-solid-svg-icons';
import "./Dashboard.css";
import logo from "../assets/logo.png";

export default function Dashboard({ user, onLogout }) {
  const [selectedFile, setSelectedFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [recentFiles, setRecentFiles] = useState([]);
  const [showUserMenu, setShowUserMenu] = useState(false);

  // Simulate loading recent files with more realistic data
  useEffect(() => {
    // In a real app, this would fetch from your backend
    setRecentFiles([
      { 
        id: 1,
        name: "Sales_Data_Q4.xlsx", 
        uploadDate: "2025-01-15", 
        size: "2.3 MB", 
        type: "excel",
        status: "completed",
        charts: 3
      },
      { 
        id: 2,
        name: "Marketing_Analytics.xlsx", 
        uploadDate: "2025-01-12", 
        size: "1.8 MB", 
        type: "excel",
        status: "completed",
        charts: 5
      },
      { 
        id: 3,
        name: "Financial_Report.xlsx", 
        uploadDate: "2025-01-10", 
        size: "3.1 MB", 
        type: "excel",
        status: "processing",
        charts: 0
      },
    ]);
  }, []);

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
    // TODO: Implement actual file upload logic
    setTimeout(() => {
      setIsUploading(false);
      alert("File uploaded successfully! (Demo)");
      // Add to recent files with enhanced data
      setRecentFiles(prev => [{
        id: Date.now(),
        name: selectedFile.name,
        uploadDate: new Date().toISOString().split('T')[0],
        size: `${(selectedFile.size / (1024 * 1024)).toFixed(1)} MB`,
        type: "excel",
        status: "completed",
        charts: Math.floor(Math.random() * 5) + 1
      }, ...prev.slice(0, 2)]);
      setSelectedFile(null);
    }, 2000);
  };

  const handleDeleteFile = (fileId) => {
    setRecentFiles(prev => prev.filter(file => file.id !== fileId));
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
              />
              <label htmlFor="file-upload" className="file-upload-label">
                <FontAwesomeIcon icon={faFolderOpen} className="label-icon" />
                Choose File
              </label>
              
              {selectedFile && (
                <div className="selected-file">
                  <div className="selected-file-info">
                    <FontAwesomeIcon icon={faFileExcel} className="file-type-icon" />
                    <span>Selected: {selectedFile.name}</span>
                  </div>
                  <button 
                    onClick={handleFileUpload} 
                    className="upload-btn"
                    disabled={isUploading}
                  >
                    <FontAwesomeIcon icon={faUpload} className="btn-icon" />
                    {isUploading ? "Uploading..." : "Upload & Analyze"}
                  </button>
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
              {recentFiles.length > 0 ? (
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
                        </div>
                        <div className="file-status">
                          <span 
                            className="status-indicator" 
                            style={{ backgroundColor: getFileStatusColor(file.status) }}
                          ></span>
                          {file.status}
                        </div>
                      </div>
                      <div className="file-actions">
                        <button className="file-action-btn view-btn">
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
  );
}
