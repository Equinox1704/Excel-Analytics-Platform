import React, { useState, useEffect, useRef } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';
import { Line, Bar, Pie, Doughnut, Scatter } from 'react-chartjs-2';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faChartBar,
  faCog,
  faTable,
  faSearch,
  faArrowLeft,
  faFilePdf,
  faFileImage,
  faExpand,
  faCompress,
  faSpinner,
  faChartLine
} from '@fortawesome/free-solid-svg-icons';
import { saveAs } from 'file-saver';
import { getFileData } from '../api';
import './AnalyticsView.css';
import logo from "../assets/logo.png";

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

const AnalyticsView = ({ fileId, fileName, onBack }) => {
  const [fileData, setFileData] = useState(null);
  const [selectedSheet, setSelectedSheet] = useState(0);
  const [chartType, setChartType] = useState('bar');
  const [xAxis, setXAxis] = useState('');
  const [yAxis, setYAxis] = useState('');
  const [chartTitle, setChartTitle] = useState('Data Visualization');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  
  const chartRef = useRef(null);
  const fullscreenRef = useRef(null);

  useEffect(() => {
    loadFileData();
  }, [fileId]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (fileData && fileData.sheets && fileData.sheets[selectedSheet]) {
      const sheet = fileData.sheets[selectedSheet];
      if (sheet.data && sheet.data.length > 0) {
        const columns = Object.keys(sheet.data[0]);
        if (!xAxis && columns.length > 0) setXAxis(columns[0]);
        if (!yAxis && columns.length > 1) setYAxis(columns[1]);
      }
    }
  }, [fileData, selectedSheet, xAxis, yAxis]);

  const loadFileData = async () => {
    try {
      setLoading(true);
      const data = await getFileData(fileId);
      setFileData(data);
      setError(null);
    } catch (err) {
      setError('Failed to load file data: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const getCurrentSheetData = () => {
    if (!fileData || !fileData.sheets || !fileData.sheets[selectedSheet]) return [];
    return fileData.sheets[selectedSheet].data || [];
  };

  const getColumns = () => {
    const data = getCurrentSheetData();
    return data.length > 0 ? Object.keys(data[0]) : [];
  };

  const getFilteredData = () => {
    const data = getCurrentSheetData();
    if (!searchTerm) return data;
    
    return data.filter(row => 
      Object.values(row).some(value => 
        String(value).toLowerCase().includes(searchTerm.toLowerCase())
      )
    );
  };

  const prepareChartData = () => {
    const data = getFilteredData();
    if (!data.length || !xAxis || !yAxis) return null;

    const labels = data.map(row => String(row[xAxis]));
    const values = data.map(row => {
      const val = row[yAxis];
      return isNaN(val) ? 0 : Number(val);
    });

    // Generate colors for each data point
    const generateColors = (count) => {
      const baseColors = ['#3B82F6', '#EF4444', '#10B981', '#F59E0B', '#8B5CF6', '#F97316', '#06B6D4', '#84CC16', '#EC4899', '#6366F1'];
      const colors = [];
      for (let i = 0; i < count; i++) {
        colors.push(baseColors[i % baseColors.length]);
      }
      return colors;
    };

    let backgroundColor, borderColor, borderWidth;

    if (chartType === 'pie' || chartType === 'doughnut') {
      backgroundColor = generateColors(labels.length);
      borderColor = '#ffffff';
      borderWidth = 2;
    } else if (chartType === 'line') {
      backgroundColor = 'rgba(59, 130, 246, 0.1)';
      borderColor = '#3B82F6';
      borderWidth = 3;
    } else if (chartType === 'scatter') {
      backgroundColor = 'rgba(59, 130, 246, 0.6)';
      borderColor = '#3B82F6';
      borderWidth = 1;
    } else {
      backgroundColor = 'rgba(59, 130, 246, 0.8)';
      borderColor = '#3B82F6';
      borderWidth = 1;
    }

    const dataset = {
      label: yAxis,
      data: values,
      backgroundColor: backgroundColor,
      borderColor: borderColor,
      borderWidth: borderWidth,
    };

    // Add line-specific properties
    if (chartType === 'line') {
      dataset.fill = false;
      dataset.tension = 0.4;
      dataset.pointBackgroundColor = '#3B82F6';
      dataset.pointBorderColor = '#ffffff';
      dataset.pointBorderWidth = 2;
      dataset.pointRadius = 5;
      dataset.pointHoverRadius = 7;
    }

    // Add scatter-specific properties
    if (chartType === 'scatter') {
      dataset.showLine = false;
      dataset.pointRadius = 6;
      dataset.pointHoverRadius = 8;
    }

    return {
      labels,
      datasets: [dataset]
    };
  };

  const getChartOptions = () => {
    const baseOptions = {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        title: {
          display: true,
          text: chartTitle,
          font: {
            size: 16,
            weight: 'bold'
          },
          color: '#1a365d'
        },
        legend: {
          display: true,
          position: chartType === 'pie' || chartType === 'doughnut' ? 'bottom' : 'top',
          labels: {
            color: '#1a365d',
            font: {
              size: 12
            }
          }
        },
        tooltip: {
          backgroundColor: 'rgba(26, 54, 93, 0.9)',
          titleColor: '#fff',
          bodyColor: '#fff',
          borderColor: '#3B82F6',
          borderWidth: 1,
          titleFont: {
            size: 14,
            weight: 'bold'
          },
          bodyFont: {
            size: 12
          }
        }
      }
    };

    // Add scales for non-pie/doughnut charts
    if (chartType !== 'pie' && chartType !== 'doughnut') {
      baseOptions.scales = {
        y: {
          beginAtZero: true,
          grid: {
            color: 'rgba(26, 54, 93, 0.1)',
            lineWidth: 1
          },
          ticks: {
            color: '#1a365d',
            font: {
              size: 11
            }
          },
          title: {
            display: true,
            text: yAxis,
            color: '#1a365d',
            font: {
              size: 12,
              weight: 'bold'
            }
          }
        },
        x: {
          grid: {
            color: 'rgba(26, 54, 93, 0.1)',
            lineWidth: 1
          },
          ticks: {
            color: '#1a365d',
            font: {
              size: 11
            },
            maxRotation: 45
          },
          title: {
            display: true,
            text: xAxis,
            color: '#1a365d',
            font: {
              size: 12,
              weight: 'bold'
            }
          }
        }
      };
    }

    // Special options for scatter plots
    if (chartType === 'scatter') {
      baseOptions.plugins.legend.display = false;
    }

    return baseOptions;
  };

  const downloadChart = (format) => {
    if (!chartRef.current) return;

    const canvas = chartRef.current.canvas;
    const ctx = canvas.getContext('2d');
    
    if (format === 'png') {
      // Create a white background for the chart
      const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const tempCanvas = document.createElement('canvas');
      tempCanvas.width = canvas.width;
      tempCanvas.height = canvas.height;
      const tempCtx = tempCanvas.getContext('2d');
      
      // Fill with white background
      tempCtx.fillStyle = 'white';
      tempCtx.fillRect(0, 0, tempCanvas.width, tempCanvas.height);
      
      // Draw the chart on top
      tempCtx.putImageData(imgData, 0, 0);
      
      tempCanvas.toBlob((blob) => {
        saveAs(blob, `${fileName}_${chartTitle.replace(/\s+/g, '_')}_chart.png`);
      });
    } else if (format === 'pdf') {
      // For PDF, create a data URL and download
      const dataURL = canvas.toDataURL('image/png', 1.0);
      const link = document.createElement('a');
      link.download = `${fileName}_${chartTitle.replace(/\s+/g, '_')}_chart.png`;
      link.href = dataURL;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const generateSummaryStats = () => {
    const data = getFilteredData();
    if (!data.length || !yAxis) return null;

    const values = data.map(row => Number(row[yAxis])).filter(val => !isNaN(val));
    if (!values.length) return null;

    const sum = values.reduce((a, b) => a + b, 0);
    const avg = sum / values.length;
    const min = Math.min(...values);
    const max = Math.max(...values);
    
    return {
      count: values.length,
      sum: sum.toFixed(2),
      average: avg.toFixed(2),
      min: min.toFixed(2),
      max: max.toFixed(2)
    };
  };

  const renderChart = () => {
    const data = prepareChartData();
    if (!data) return null;

    const options = getChartOptions();
    const commonProps = {
      ref: chartRef,
      data,
      options
    };

    switch (chartType) {
      case 'line':
        return <Line {...commonProps} />;
      case 'bar':
        return <Bar {...commonProps} />;
      case 'pie':
        return <Pie {...commonProps} />;
      case 'doughnut':
        return <Doughnut {...commonProps} />;
      case 'scatter':
        return <Scatter {...commonProps} />;
      default:
        return <Bar {...commonProps} />;
    }
  };

  if (loading) {
    return (
      <div className="analytics-view">
        {/* Header */}
        <header className="analytics-header">
          <div className="analytics-header-content">
            <div className="analytics-header-left">
              <img src={logo} alt="InsightSheet" style={{height: '50px', marginRight: '20px'}} />
              <button onClick={onBack} className="back-btn">
                <FontAwesomeIcon icon={faArrowLeft} />
                Back to Dashboard
              </button>
            </div>
          </div>
        </header>
        
        <div className="analytics-loading">
          <FontAwesomeIcon icon={faSpinner} className="loading-spinner spinning" />
          <p>Loading analytics data...</p>
          <p style={{fontSize: '1rem', opacity: 0.7, marginTop: '10px'}}>
            Preparing your data visualization...
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="analytics-view">
        {/* Header */}
        <header className="analytics-header">
          <div className="analytics-header-content">
            <div className="analytics-header-left">
              <img src={logo} alt="InsightSheet" style={{height: '50px', marginRight: '20px'}} />
              <button onClick={onBack} className="back-btn">
                <FontAwesomeIcon icon={faArrowLeft} />
                Back to Dashboard
              </button>
            </div>
          </div>
        </header>
        
        <div className="analytics-error">
          <p>{error}</p>
          <button onClick={onBack} className="back-btn">
            <FontAwesomeIcon icon={faArrowLeft} /> Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  const stats = generateSummaryStats();
  const columns = getColumns();
  const data = getFilteredData();

  return (
    <div className={`analytics-view ${isFullscreen ? 'fullscreen' : ''}`} ref={fullscreenRef}>
      {/* Header */}
      <header className="analytics-header">
        <div className="analytics-header-content">
          <div className="analytics-header-left">
            {!isFullscreen && (
              <img src={logo} alt="InsightSheet" style={{height: '50px', marginRight: '20px'}} />
            )}
            <button onClick={onBack} className="back-btn">
              <FontAwesomeIcon icon={faArrowLeft} />
              Back to Dashboard
            </button>
            <div className="file-info">
              <h2>{fileName}</h2>
              <span className="sheet-info">
                <FontAwesomeIcon icon={faChartBar} style={{marginRight: '5px'}} />
                {fileData?.sheets?.[selectedSheet]?.name || `Sheet ${selectedSheet + 1}`} • 
                {fileData?.metadata?.totalRows || 0} rows • 
                {fileData?.metadata?.totalSheets || 0} sheets
              </span>
            </div>
          </div>
          <div className="analytics-header-right">
            <button 
              onClick={() => setShowSettings(!showSettings)}
              className={`settings-btn ${showSettings ? 'active' : ''}`}
              title="Chart Settings"
            >
              <FontAwesomeIcon icon={faCog} />
            </button>
            <button 
              onClick={() => setIsFullscreen(!isFullscreen)}
              className="fullscreen-btn"
              title={isFullscreen ? "Exit Fullscreen" : "Enter Fullscreen"}
            >
              <FontAwesomeIcon icon={isFullscreen ? faCompress : faExpand} />
            </button>
          </div>
        </div>
      </header>

      {/* Settings Panel */}
      {showSettings && (
        <div className="settings-panel">
          <div className="settings-grid">
            <div className="setting-group">
              <label>Chart Type</label>
              <select value={chartType} onChange={(e) => setChartType(e.target.value)}>
                <option value="bar">Bar Chart</option>
                <option value="line">Line Chart</option>
                <option value="pie">Pie Chart</option>
                <option value="doughnut">Doughnut Chart</option>
                <option value="scatter">Scatter Plot</option>
              </select>
            </div>
            
            <div className="setting-group">
              <label>X-Axis</label>
              <select value={xAxis} onChange={(e) => setXAxis(e.target.value)}>
                <option value="">Select Column</option>
                {columns.map(col => (
                  <option key={col} value={col}>{col}</option>
                ))}
              </select>
            </div>
            
            <div className="setting-group">
              <label>Y-Axis</label>
              <select value={yAxis} onChange={(e) => setYAxis(e.target.value)}>
                <option value="">Select Column</option>
                {columns.map(col => (
                  <option key={col} value={col}>{col}</option>
                ))}
              </select>
            </div>
            
            <div className="setting-group">
              <label>Chart Title</label>
              <input 
                type="text" 
                value={chartTitle} 
                onChange={(e) => setChartTitle(e.target.value)}
                placeholder="Enter chart title"
              />
            </div>

            {fileData?.sheets && fileData.sheets.length > 1 && (
              <div className="setting-group">
                <label>Sheet</label>
                <select value={selectedSheet} onChange={(e) => setSelectedSheet(Number(e.target.value))}>
                  {fileData.sheets.map((sheet, index) => (
                    <option key={index} value={index}>
                      {sheet.name || `Sheet ${index + 1}`}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>
          
          <div className="download-section">
            <h4>Download Options</h4>
            <div className="download-buttons">
              <button onClick={() => downloadChart('png')} className="download-btn">
                <FontAwesomeIcon icon={faFileImage} />
                PNG
              </button>
              <button onClick={() => downloadChart('pdf')} className="download-btn">
                <FontAwesomeIcon icon={faFilePdf} />
                PDF
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="analytics-content">
        {/* Data Table Section - Full Width */}
        <div className="data-section">
          <div className="data-header">
            <h3>
              <FontAwesomeIcon icon={faTable} />
              Data Preview
            </h3>
            <div className="data-controls">
              <div className="search-box">
                <FontAwesomeIcon icon={faSearch} className="search-icon" />
                <input
                  type="text"
                  placeholder="Search data..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
          </div>
          
          <div className="data-table-container">
            <table className="data-table">
              <thead>
                <tr>
                  {columns.map(col => (
                    <th key={col}>{col}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {data.slice(0, 100).map((row, index) => (
                  <tr key={index}>
                    {columns.map(col => (
                      <td key={col}>{String(row[col] || '')}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
            {data.length > 100 && (
              <div className="table-footer">
                Showing first 100 rows of {data.length} total rows
              </div>
            )}
          </div>
        </div>

        {/* Chart Section - Smaller Section */}
        <div className="chart-section">
          <div className="chart-container">
            {prepareChartData() ? (
              renderChart()
            ) : (
              <div className="no-chart">
                <FontAwesomeIcon icon={faChartBar} className="no-chart-icon" />
                {!xAxis || !yAxis ? (
                  <div>
                    <p>Select X and Y axes to generate chart</p>
                    <div style={{fontSize: '0.9rem', opacity: 0.7, marginTop: '10px'}}>
                      {!xAxis && <div>❌ X-Axis not selected</div>}
                      {!yAxis && <div>❌ Y-Axis not selected</div>}
                      {xAxis && yAxis && <div>✅ Axes selected, checking data...</div>}
                    </div>
                  </div>
                ) : !getFilteredData().length ? (
                  <div>
                    <p>No data available for visualization</p>
                    <div style={{fontSize: '0.9rem', opacity: 0.7, marginTop: '10px'}}>
                      Try adjusting your search filters or check if the file has data.
                    </div>
                  </div>
                ) : (
                  <div>
                    <p>Unable to generate chart</p>
                    <div style={{fontSize: '0.9rem', opacity: 0.7, marginTop: '10px'}}>
                      Chart: {chartType} | Rows: {getFilteredData().length} | X: {xAxis} | Y: {yAxis}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
          
          {/* Statistics */}
          {stats && (
            <div className="stats-panel">
              <h4>
                <FontAwesomeIcon icon={faChartLine} style={{marginRight: '8px', color: 'var(--orange)'}} />
                Summary Statistics
              </h4>
              <div className="stats-grid">
                <div className="stat-item">
                  <span className="stat-label">Count</span>
                  <span className="stat-value">{stats.count}</span>
                </div>
                <div className="stat-item">
                  <span className="stat-label">Sum</span>
                  <span className="stat-value">{stats.sum}</span>
                </div>
                <div className="stat-item">
                  <span className="stat-label">Average</span>
                  <span className="stat-value">{stats.average}</span>
                </div>
                <div className="stat-item">
                  <span className="stat-label">Min</span>
                  <span className="stat-value">{stats.min}</span>
                </div>
                <div className="stat-item">
                  <span className="stat-label">Max</span>
                  <span className="stat-value">{stats.max}</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AnalyticsView;
