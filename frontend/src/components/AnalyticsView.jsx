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
  faChartLine,
  faCube,
  faChartArea,
  faChartPie,
  faRocket,
  faEye,
  faDownload,
  faMagic,
  faFilter,
  faSync
} from '@fortawesome/free-solid-svg-icons';
import { saveAs } from 'file-saver';
import { getFileData } from '../api';
import Chart3D from './Chart3D';
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
  const [zAxis, setZAxis] = useState(''); // For 3D charts
  const [chartTitle, setChartTitle] = useState('Data Visualization');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [view3D, setView3D] = useState(false);
  const [chartColors, setChartColors] = useState(['#3B82F6', '#EF4444', '#10B981', '#F59E0B', '#8B5CF6']);
  const [showAdvancedOptions, setShowAdvancedOptions] = useState(false);
  const [dataFilter, setDataFilter] = useState('');
  const [chartAnimation, setChartAnimation] = useState(true);
  const [autoRefresh, setAutoRefresh] = useState(false);
  
  const chartRef = useRef(null);
  const fullscreenRef = useRef(null);

  useEffect(() => {
    loadFileData();
  }, [fileId]); // eslint-disable-line react-hooks/exhaustive-deps

  // Auto-refresh effect
  useEffect(() => {
    let interval;
    if (autoRefresh && fileData) {
      interval = setInterval(() => {
        loadFileData();
      }, 30000); // Refresh every 30 seconds
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [autoRefresh, fileData]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (fileData && fileData.sheets && fileData.sheets[selectedSheet]) {
      const sheet = fileData.sheets[selectedSheet];
      if (sheet.data && sheet.data.length > 0) {
        const columns = Object.keys(sheet.data[0]);
        if (!xAxis && columns.length > 0) setXAxis(columns[0]);
        if (!yAxis && columns.length > 1) setYAxis(columns[1]);
        if (!zAxis && columns.length > 2) setZAxis(columns[2]);
      }
    }
  }, [fileData, selectedSheet, xAxis, yAxis, zAxis]);

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
    if (!data || data.length === 0) return [];

    let filteredData = data;

    // Apply search filter
    if (searchTerm) {
      filteredData = filteredData.filter(row => {
        return Object.values(row).some(value => 
          value && value.toString().toLowerCase().includes(searchTerm.toLowerCase())
        );
      });
    }

    // Apply data filter
    if (dataFilter) {
      try {
        filteredData = filteredData.filter(row => {
          // Simple filter: column_name > value or column_name = value
          const [column, operator, value] = dataFilter.split(/\s*(>|<|=|>=|<=)\s*/);
          if (column && operator && value) {
            const rowValue = parseFloat(row[column.trim()]) || 0;
            const filterValue = parseFloat(value.trim()) || 0;
            
            switch (operator.trim()) {
              case '>': return rowValue > filterValue;
              case '<': return rowValue < filterValue;
              case '>=': return rowValue >= filterValue;
              case '<=': return rowValue <= filterValue;
              case '=': return Math.abs(rowValue - filterValue) < 0.001;
              default: return true;
            }
          }
          return true;
        });
      } catch (e) {
        console.warn('Invalid filter expression:', dataFilter);
      }
    }

    return filteredData;
  };

  const prepareChartData = () => {
    const data = getFilteredData();
    if (!data.length || !xAxis || !yAxis) return null;

    console.log('Preparing chart data:', { chartType, xAxis, yAxis, dataLength: data.length });

    // For scatter plots, we need {x, y} format
    if (chartType === 'scatter') {
      const scatterData = data.map(row => ({
        x: isNaN(row[xAxis]) ? 0 : Number(row[xAxis]),
        y: isNaN(row[yAxis]) ? 0 : Number(row[yAxis])
      })).filter(point => point.x !== 0 || point.y !== 0); // Remove invalid points

      return {
        datasets: [{
          label: `${yAxis} vs ${xAxis}`,
          data: scatterData,
          backgroundColor: 'rgba(59, 130, 246, 0.6)',
          borderColor: '#3B82F6',
          borderWidth: 1,
          pointRadius: 6,
          pointHoverRadius: 8,
          showLine: false
        }]
      };
    }

    // For other chart types
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

    const chartData = {
      labels,
      datasets: [dataset]
    };

    console.log('Chart data prepared:', chartData);
    return chartData;
  };

  const getChartOptions = () => {
    const baseOptions = {
      responsive: true,
      maintainAspectRatio: false,
      animation: {
        duration: chartAnimation ? 2000 : 0,
        easing: 'easeInOutQuart',
      },
      plugins: {
        title: {
          display: true,
          text: chartTitle,
          font: {
            size: 18,
            weight: 'bold'
          },
          color: '#1a365d',
          padding: 20
        },
        legend: {
          display: true,
          position: chartType === 'pie' || chartType === 'doughnut' ? 'bottom' : 'top',
          labels: {
            color: '#1a365d',
            font: {
              size: 12
            },
            padding: 15,
            usePointStyle: true
          }
        },
        tooltip: {
          backgroundColor: 'rgba(26, 54, 93, 0.95)',
          titleColor: '#fff',
          bodyColor: '#fff',
          borderColor: '#3B82F6',
          borderWidth: 2,
          cornerRadius: 8,
          titleFont: {
            size: 14,
            weight: 'bold'
          },
          bodyFont: {
            size: 12
          },
          padding: 12,
          displayColors: true
        }
      },
      interaction: {
        intersect: false,
        mode: 'index'
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
    if (!data) {
      console.log('No chart data available');
      return null;
    }

    console.log('Rendering chart:', { chartType, data, view3D });
    
    // Render 3D chart if 3D mode is enabled
    if (view3D) {
      return (
        <Chart3D 
          data={getFilteredData()} 
          xAxis={xAxis} 
          yAxis={yAxis} 
          zAxis={zAxis} 
          chartType={chartType} 
        />
      );
    }
    
    // Render 2D charts
    const options = getChartOptions();
    const commonProps = {
      ref: chartRef,
      data,
      options
    };

    try {
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
    } catch (error) {
      console.error('Chart rendering error:', error);
      return (
        <div className="chart-error">
          <p>Error rendering chart: {error.message}</p>
        </div>
      );
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
            {/* Quick Action Buttons */}
            <div className="quick-actions">
              <button 
                className={`action-btn ${view3D ? 'active' : ''}`}
                onClick={() => setView3D(!view3D)}
                title="Toggle 3D View"
              >
                <FontAwesomeIcon icon={faCube} />
              </button>
              <button 
                className="action-btn"
                onClick={() => setAutoRefresh(!autoRefresh)}
                title={autoRefresh ? "Disable Auto Refresh" : "Enable Auto Refresh"}
              >
                <FontAwesomeIcon icon={faSync} className={autoRefresh ? 'spinning' : ''} />
              </button>
              <button 
                className="action-btn"
                onClick={() => downloadChart('png')}
                title="Quick Download PNG"
              >
                <FontAwesomeIcon icon={faDownload} />
              </button>
            </div>
            
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

      {/* Enhanced Settings Panel */}
      {showSettings && (
        <div className="settings-panel">
          <div className="settings-header">
            <h3>
              <FontAwesomeIcon icon={faCog} style={{marginRight: '10px', color: 'var(--orange)'}} />
              Chart Configuration
            </h3>
            <div className="settings-tabs">
              <button 
                className={`tab ${!showAdvancedOptions ? 'active' : ''}`}
                onClick={() => setShowAdvancedOptions(false)}
              >
                Basic
              </button>
              <button 
                className={`tab ${showAdvancedOptions ? 'active' : ''}`}
                onClick={() => setShowAdvancedOptions(true)}
              >
                Advanced
              </button>
            </div>
          </div>

          <div className="settings-content">
            {!showAdvancedOptions ? (
              // Basic Settings
              <div className="settings-grid">
                <div className="setting-group">
                  <label>Chart Type</label>
                  <select value={chartType} onChange={(e) => setChartType(e.target.value)}>
                    <option value="bar">📊 Bar Chart</option>
                    <option value="line">📈 Line Chart</option>
                    <option value="pie">🥧 Pie Chart</option>
                    <option value="doughnut">🍩 Doughnut Chart</option>
                    <option value="scatter">🎯 Scatter Plot</option>
                  </select>
                </div>
                
                <div className="setting-group">
                  <label>Visualization Mode</label>
                  <div className="toggle-group">
                    <button 
                      className={`toggle-btn ${!view3D ? 'active' : ''}`}
                      onClick={() => setView3D(false)}
                    >
                      <FontAwesomeIcon icon={faChartBar} /> 2D
                    </button>
                    <button 
                      className={`toggle-btn ${view3D ? 'active' : ''}`}
                      onClick={() => setView3D(true)}
                    >
                      <FontAwesomeIcon icon={faCube} /> 3D
                    </button>
                  </div>
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

                {view3D && (
                  <div className="setting-group">
                    <label>Z-Axis (3D)</label>
                    <select value={zAxis} onChange={(e) => setZAxis(e.target.value)}>
                      <option value="">Select Column (Optional)</option>
                      {columns.map(col => (
                        <option key={col} value={col}>{col}</option>
                      ))}
                    </select>
                  </div>
                )}
                
                <div className="setting-group full-width">
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
            ) : (
              // Advanced Settings
              <div className="settings-grid">
                <div className="setting-group">
                  <label>Data Filter</label>
                  <div className="input-with-icon">
                    <FontAwesomeIcon icon={faFilter} className="input-icon" />
                    <input 
                      type="text" 
                      value={dataFilter} 
                      onChange={(e) => setDataFilter(e.target.value)}
                      placeholder="e.g., Sales > 1000"
                    />
                  </div>
                  <small className="help-text">Format: column_name operator value (e.g., "Sales {'>'}  1000")</small>
                </div>

                <div className="setting-group">
                  <label>Animation</label>
                  <div className="toggle-group">
                    <button 
                      className={`toggle-btn ${chartAnimation ? 'active' : ''}`}
                      onClick={() => setChartAnimation(!chartAnimation)}
                    >
                      <FontAwesomeIcon icon={faMagic} /> {chartAnimation ? 'Enabled' : 'Disabled'}
                    </button>
                  </div>
                </div>

                <div className="setting-group">
                  <label>Auto Refresh</label>
                  <div className="toggle-group">
                    <button 
                      className={`toggle-btn ${autoRefresh ? 'active' : ''}`}
                      onClick={() => setAutoRefresh(!autoRefresh)}
                    >
                      <FontAwesomeIcon icon={faSync} /> {autoRefresh ? 'On' : 'Off'}
                    </button>
                  </div>
                </div>

                <div className="setting-group">
                  <label>Search Data</label>
                  <div className="input-with-icon">
                    <FontAwesomeIcon icon={faSearch} className="input-icon" />
                    <input
                      type="text"
                      placeholder="Search in data..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>
                </div>
              </div>
            )}
          </div>
          
          <div className="download-section">
            <h4>
              <FontAwesomeIcon icon={faDownload} style={{marginRight: '8px'}} />
              Export Options
            </h4>
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
        {/* Main Chart Section - Prominent Display */}
        <div className="chart-main-section">
          <div className="chart-header">
            <div className="chart-title-section">
              <h2>
                <FontAwesomeIcon icon={view3D ? faCube : faChartBar} style={{marginRight: '10px', color: 'var(--blue)'}} />
                {chartTitle}
              </h2>
              <div className="chart-meta">
                {view3D ? '3D Visualization' : '2D Chart'} • 
                {chartType.charAt(0).toUpperCase() + chartType.slice(1)} • 
                {getFilteredData().length} data points
              </div>
            </div>
            <div className="chart-actions">
              <button 
                className={`view-toggle ${!view3D ? 'active' : ''}`}
                onClick={() => setView3D(false)}
                title="2D View"
              >
                <FontAwesomeIcon icon={faChartBar} />
              </button>
              <button 
                className={`view-toggle ${view3D ? 'active' : ''}`}
                onClick={() => setView3D(true)}
                title="3D View"
              >
                <FontAwesomeIcon icon={faCube} />
              </button>
              <button 
                className="chart-action"
                onClick={() => setIsFullscreen(!isFullscreen)}
              >
                <FontAwesomeIcon icon={isFullscreen ? faCompress : faExpand} />
              </button>
            </div>
          </div>
          
          <div className="chart-container-main">
            {prepareChartData() && (xAxis && yAxis) ? (
              <div className="chart-display">
                {renderChart()}
                {/* Chart Info Overlay */}
                <div className="chart-info-overlay">
                  <div className="chart-badges">
                    {view3D && <span className="badge badge-3d">3D</span>}
                    {chartAnimation && <span className="badge badge-animated">Animated</span>}
                    {autoRefresh && <span className="badge badge-refresh">Auto-Refresh</span>}
                    {dataFilter && <span className="badge badge-filtered">Filtered</span>}
                  </div>
                </div>
              </div>
            ) : (
              <div className="no-chart-main">
                <FontAwesomeIcon icon={faRocket} className="no-chart-icon" />
                <div className="no-chart-content">
                  {!xAxis || !yAxis ? (
                    <div>
                      <h3>Ready to create amazing visualizations!</h3>
                      <p>Select X and Y axes from the settings panel to generate your chart</p>
                      <div className="axis-status">
                        <div className={`axis-item ${xAxis ? 'selected' : ''}`}>
                          <FontAwesomeIcon icon={xAxis ? faEye : faSearch} />
                          X-Axis: {xAxis || 'Not selected'}
                        </div>
                        <div className={`axis-item ${yAxis ? 'selected' : ''}`}>
                          <FontAwesomeIcon icon={yAxis ? faEye : faSearch} />
                          Y-Axis: {yAxis || 'Not selected'}
                        </div>
                      </div>
                      <button 
                        className="cta-button"
                        onClick={() => setShowSettings(true)}
                      >
                        <FontAwesomeIcon icon={faCog} />
                        Open Settings
                      </button>
                    </div>
                  ) : (
                    <div>
                      <h3>No data available</h3>
                      <p>Try adjusting your search filters or check if the file has valid data.</p>
                      <div className="debug-info">
                        <div>Chart Type: {chartType}</div>
                        <div>Data Rows: {getFilteredData().length}</div>
                        <div>X-Axis: {xAxis}</div>
                        <div>Y-Axis: {yAxis}</div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Split Layout: Data Table and Statistics */}
        <div className="analytics-bottom-section">
          {/* Statistics Panel */}
          {stats && (
            <div className="stats-section">
              <h3>
                <FontAwesomeIcon icon={faChartLine} style={{marginRight: '8px', color: 'var(--orange)'}} />
                Statistical Summary
              </h3>
              <div className="stats-grid-enhanced">
                <div className="stat-card">
                  <div className="stat-icon">
                    <FontAwesomeIcon icon={faTable} />
                  </div>
                  <div className="stat-info">
                    <span className="stat-value">{stats.count}</span>
                    <span className="stat-label">Data Points</span>
                  </div>
                </div>
                <div className="stat-card">
                  <div className="stat-icon">
                    <FontAwesomeIcon icon={faChartArea} />
                  </div>
                  <div className="stat-info">
                    <span className="stat-value">{stats.sum}</span>
                    <span className="stat-label">Sum</span>
                  </div>
                </div>
                <div className="stat-card">
                  <div className="stat-icon">
                    <FontAwesomeIcon icon={faChartLine} />
                  </div>
                  <div className="stat-info">
                    <span className="stat-value">{stats.average}</span>
                    <span className="stat-label">Average</span>
                  </div>
                </div>
                <div className="stat-card">
                  <div className="stat-icon">📉</div>
                  <div className="stat-info">
                    <span className="stat-value">{stats.min}</span>
                    <span className="stat-label">Minimum</span>
                  </div>
                </div>
                <div className="stat-card">
                  <div className="stat-icon">📈</div>
                  <div className="stat-info">
                    <span className="stat-value">{stats.max}</span>
                    <span className="stat-label">Maximum</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Data Table Section */}
          <div className="data-section-compact">
            <div className="data-header">
              <h3>
                <FontAwesomeIcon icon={faTable} style={{marginRight: '8px'}} />
                Data Preview
              </h3>
              <div className="data-info">
                Showing {Math.min(data.length, 100)} of {data.length} rows
                {dataFilter && <span className="filter-indicator">• Filtered</span>}
              </div>
            </div>
            
            <div className="data-table-container-compact">
              <table className="data-table">
                <thead>
                  <tr>
                    {columns.map(col => (
                      <th key={col}>
                        <div className="column-header">
                          {col}
                          {(col === xAxis || col === yAxis || col === zAxis) && (
                            <span className="axis-indicator">
                              {col === xAxis && <span className="x-axis">X</span>}
                              {col === yAxis && <span className="y-axis">Y</span>}
                              {col === zAxis && <span className="z-axis">Z</span>}
                            </span>
                          )}
                        </div>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {data.slice(0, 50).map((row, index) => (
                    <tr key={index}>
                      {columns.map(col => (
                        <td key={col}>{String(row[col] || '')}</td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
              {data.length > 50 && (
                <div className="table-footer">
                  Showing first 50 rows of {data.length} total rows
                  {searchTerm && <span> • Search: "{searchTerm}"</span>}
                  {dataFilter && <span> • Filter: "{dataFilter}"</span>}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnalyticsView;
