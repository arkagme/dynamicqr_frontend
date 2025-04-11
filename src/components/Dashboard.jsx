import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
const API_BASE_URL = process.env.REACT_APP_API_BASE_URL ||  '/api';

const Dashboard = () => {
  const { id } = useParams();
  const [loading, setLoading] = useState(true);
  const [analytics, setAnalytics] = useState(null);
  const [error, setError] = useState(null);

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      return new Date(dateString).toLocaleString();
    } catch (err) {
      console.error("Date formatting error:", err);
      return 'Invalid date';
    }
  };
  
  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const response = await axios.get(`${API_BASE_URL}/qr/analytics/${id}`);
        setAnalytics(response.data);
      } catch (err) {
        setError(err.response?.data?.error || 'Failed to fetch analytics');
      } finally {
        setLoading(false);
      }
    };
    
    fetchAnalytics();
  }, [id]);
  
  if (loading) return <div className="text-center mt-5"><div className="spinner-border"></div></div>;
  
  if (error) {
    return (
      <div className="alert alert-danger mt-4">
        {error}
        <Link to="/" className="btn btn-primary mt-3 d-block">Back to Generator</Link>
      </div>
    );
  }

  const qrImageUrl = `/api/assets/${id}.png`;


  const handleDownload = (e) => {
    e.preventDefault();
    
    const xhr = new XMLHttpRequest();
    xhr.open('GET', qrImageUrl, true);
    xhr.responseType = 'blob';
    
    xhr.onload = function() {
      if (this.status === 200) {
        // Create a blob URL from the blob response
        const blob = new Blob([this.response], {type: 'image/png'});
        const url = window.URL.createObjectURL(blob);
        
        // Create a link element and trigger download
        const a = document.createElement('a');
        a.style.display = 'none';
        a.href = url;
        a.download = `qrcode-${id}.png`;
        document.body.appendChild(a);
        a.click();
        
        // Clean up
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      }
    };
    
    xhr.send();
  };
  
  return (
    <div className="dashboard">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>QR Code Analytics</h2>
        <Link to="/" className="btn btn-primary">Create New QR</Link>
      </div>
      
      <div className="row">
        <div className="col-md-4">
          <div className="card mb-4">
            <div className="card-body">
              <h5 className="card-title">QR Code Details</h5>
              <div className="text-center mb-3">
              <img 
                  src={qrImageUrl} 
                  alt="QR Code" 
                  className="img-fluid" 
                  style={{ maxWidth: '200px' }}
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='100' viewBox='0 0 100 100'%3E%3Crect width='100' height='100' fill='%23f5f5f5'/%3E%3Ctext x='50%25' y='50%25' font-family='Arial' font-size='12' text-anchor='middle' dominant-baseline='middle' fill='%23999'%3EQR Code%3C/text%3E%3C/svg%3E";
                    console.error("Failed to load QR code image");
                  }}
                />
                <button 
                  onClick={handleDownload} 
                  className="btn btn-success mt-2 d-block w-100"
                >
                  Download QR Code
                </button>
              </div>
              <p><strong>ID:</strong> {analytics.qr.id}</p>
              <p><strong>Target URL:</strong> <a href={analytics.qr.target_url} target="_blank" rel="noopener noreferrer">{analytics.qr.target_url}</a></p>
              <p><strong>Created:</strong> {analytics.qr.created_at}</p>
              <p><strong>Logo Included:</strong> {analytics.qr.with_logo ? 'Yes' : 'No'}</p>
            </div>
          </div>
        </div>
        
        <div className="col-md-8">
          <div className="card mb-4">
            <div className="card-body">
              <h5 className="card-title">Scan Statistics</h5>
              <div className="row text-center">
                <div className="col-md-4">
                  <div className="p-3 border rounded mb-3">
                    <h2 className="text-primary">{analytics.stats.get_qr_analytics.total_scans}</h2>
                    <p className="mb-0">Total Scans</p>
                  </div>
                </div>
                <div className="col-md-4">
                  <div className="p-3 border rounded mb-3">
                    <h2 className="text-success">{analytics.stats.get_qr_analytics.unique_visitors}</h2>
                    <p className="mb-0">Unique Visitors</p>
                  </div>
                </div>
                <div className="col-md-4">
                  <div className="p-3 border rounded mb-3">
                    <h2 className="text-info">{analytics.stats.get_qr_analytics.last_scan}</h2>
                    <p className="mb-0">Last Scan</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <div className="card">
            <div className="card-body">
              <h5 className="card-title">Daily Scan Activity</h5>
              {analytics.dailyScans.length === 0 ? (
                <p className="text-center">No scan data available yet</p>
              ) : (
                <table className="table table-striped">
                  <thead>
                    <tr>
                      <th>Date</th>
                      <th>Scans</th>
                    </tr>
                  </thead>
                  <tbody>
                    {analytics.dailyScans.map((day) => (
                      <tr key={day.date}>
                        <td>{new Date(day.date).toLocaleDateString()}</td>
                        <td>{day.scans}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;