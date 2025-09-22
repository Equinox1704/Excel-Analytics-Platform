import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faUsers,
  faFileExcel,
  faChartLine,
  faServer,
  faTrash,
  faBan,
  faCheck,
  faUserShield
} from '@fortawesome/free-solid-svg-icons';
import './AdminPanel.css';

const AdminPanel = () => {
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalFiles: 0,
    activeUsers: 0,
    systemHealth: 'Healthy'
  });

  const [users, setUsers] = useState([]);
  const [selectedTab, setSelectedTab] = useState('dashboard');

  // Simulated data - replace with actual API calls
  useEffect(() => {
    // Fetch admin dashboard data
    setStats({
      totalUsers: 150,
      totalFiles: 1250,
      activeUsers: 45,
      systemHealth: 'Healthy'
    });

    // Fetch users
    setUsers([
      { id: 1, name: 'John Doe', email: 'john@example.com', status: 'active', filesUploaded: 25 },
      { id: 2, name: 'Jane Smith', email: 'jane@example.com', status: 'inactive', filesUploaded: 12 },
      // Add more mock data as needed
    ]);
  }, []);

  const handleUserAction = (userId, action) => {
    // Implement user actions (ban, delete, activate)
    console.log(`${action} user ${userId}`);
  };

  const renderDashboard = () => (
    <div className="admin-dashboard">
      <h2>Admin Dashboard</h2>
      <div className="admin-stats-grid">
        <div className="admin-stat-card">
          <FontAwesomeIcon icon={faUsers} className="admin-stat-icon" />
          <div className="admin-stat-content">
            <span className="admin-stat-number">{stats.totalUsers}</span>
            <span className="admin-stat-label">Total Users</span>
          </div>
        </div>
        <div className="admin-stat-card">
          <FontAwesomeIcon icon={faFileExcel} className="admin-stat-icon" />
          <div className="admin-stat-content">
            <span className="admin-stat-number">{stats.totalFiles}</span>
            <span className="admin-stat-label">Files Processed</span>
          </div>
        </div>
        <div className="admin-stat-card">
          <FontAwesomeIcon icon={faChartLine} className="admin-stat-icon" />
          <div className="admin-stat-content">
            <span className="admin-stat-number">{stats.activeUsers}</span>
            <span className="admin-stat-label">Active Users</span>
          </div>
        </div>
        <div className="admin-stat-card">
          <FontAwesomeIcon icon={faServer} className="admin-stat-icon" />
          <div className="admin-stat-content">
            <span className="admin-stat-number">{stats.systemHealth}</span>
            <span className="admin-stat-label">System Status</span>
          </div>
        </div>
      </div>
    </div>
  );

  const renderUserManagement = () => (
    <div className="admin-user-management">
      <h2>User Management</h2>
      <div className="admin-table-container">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Status</th>
              <th>Files</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map(user => (
              <tr key={user.id}>
                <td>{user.name}</td>
                <td>{user.email}</td>
                <td>
                  <span className={`status-badge ${user.status}`}>
                    {user.status}
                  </span>
                </td>
                <td>{user.filesUploaded}</td>
                <td className="action-buttons">
                  <button
                    onClick={() => handleUserAction(user.id, 'ban')}
                    className="admin-btn ban"
                    title="Ban User"
                  >
                    <FontAwesomeIcon icon={faBan} />
                  </button>
                  <button
                    onClick={() => handleUserAction(user.id, 'delete')}
                    className="admin-btn delete"
                    title="Delete User"
                  >
                    <FontAwesomeIcon icon={faTrash} />
                  </button>
                  <button
                    onClick={() => handleUserAction(user.id, 'activate')}
                    className="admin-btn activate"
                    title="Activate User"
                  >
                    <FontAwesomeIcon icon={faCheck} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  return (
    <div className="admin-panel">
      <div className="admin-sidebar">
        <div className="admin-sidebar-header">
          <FontAwesomeIcon icon={faUserShield} className="admin-logo" />
          <h1>Admin Panel</h1>
        </div>
        <nav className="admin-nav">
          <button
            className={`admin-nav-btn ${selectedTab === 'dashboard' ? 'active' : ''}`}
            onClick={() => setSelectedTab('dashboard')}
          >
            Dashboard
          </button>
          <button
            className={`admin-nav-btn ${selectedTab === 'users' ? 'active' : ''}`}
            onClick={() => setSelectedTab('users')}
          >
            User Management
          </button>
        </nav>
      </div>
      <div className="admin-content">
        {selectedTab === 'dashboard' ? renderDashboard() : renderUserManagement()}
      </div>
    </div>
  );
};

export default AdminPanel;