import React, { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { QRCodeSVG } from 'qrcode.react';
import axios from 'axios';
import QRHistoryModal from './History.jsx';
const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;

const QRGenerator = () => {
  const [url, setUrl] = useState('');
  const [isDynamic, setIsDynamic] = useState(true);
  const [withLogo, setWithLogo] = useState(false);
  const [qrData, setQrData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [imagePath, setImagePath] = useState('');
  const qrRef = useRef();
  const [qrRendered, setQrRendered] = useState(false);

  //useEffect to save QR code after it's rendered
  useEffect(() => {
    const saveQRAfterRender = async () => {
      if (qrData && qrRef.current) {
        try {
          await saveQRCode(qrData.trackingId || 'qrcode');
        } catch (error) {
          console.error('Error saving QR code after render:', error);
        }
      }
    };

    if (qrData) {
      // delay to ensure the QR is fully rendered
      const timer = setTimeout(() => {
        setQrRendered(true);
        saveQRAfterRender();
      }, 500);
      
      return () => clearTimeout(timer);
    }
  }, [qrData]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!url) return;
    
    setIsLoading(true);
    setQrRendered(false);
    
    try {
      const response = await axios.post(`${API_BASE_URL}/qr/generate`, {
        url,
        isDynamic,
        withLogo
      });
      
      setQrData(response.data);

      
    } catch (error) {
      console.error('Error generating QR code:', error);
      alert('Failed to generate QR code');
    } finally {
      setIsLoading(false);
    }
  };
  
  const generateQRCodeImage = () => {
    return new Promise((resolve, reject) => {
      if (!qrRef.current) {
        console.error("QR ref state:", qrRef.current);
        reject(new Error('QR Code reference not available'));
        return;
      }
      
      const svg = qrRef.current;
      const svgData = new XMLSerializer().serializeToString(svg);
      

      const canvas = document.createElement("canvas");
      canvas.width = 400;  
      canvas.height = 400;
      
      const ctx = canvas.getContext("2d");
      

      ctx.fillStyle = "white";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      const img = new Image();
      const logoImg = new Image();
      logoImg.crossOrigin = "anonymous";
      logoImg.src = "https://iili.io/39yM50u.md.png";
      
      Promise.all([
        new Promise((innerResolve) => {
          img.onload = innerResolve;
          img.src = `data:image/svg+xml;base64,${btoa(svgData)}`;
        }),
        withLogo ? new Promise((innerResolve) => {
          logoImg.onload = innerResolve;
        }) : Promise.resolve()
      ]).then(() => {
   
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        

        if (withLogo) {
          const logoSize = 70; 
          const centerX = (canvas.width - logoSize) / 2;
          const centerY = (canvas.height - logoSize) / 2;
          ctx.drawImage(logoImg, centerX, centerY, logoSize, logoSize);
        }
        
        const imageData = canvas.toDataURL("image/png", 1.0);
        resolve(imageData);
      }).catch((error) => {
        reject(error);
      });
    });
  };
  
  const saveQRCode = async (fileName) => {
    try {
      console.log('Attempting to save QR code...');
      const imageData = await generateQRCodeImage();
      console.log('QR code image generated successfully');
      
      
      const base64Data = imageData.replace(/^data:image\/png;base64,/, "");
      
     
      const response = await axios.post(`${API_BASE_URL}/qr/saveImage`, {
        imageData: base64Data,
        fileName: `${fileName}.png`
      });
      
      setImagePath(response.data.path);
      console.log('QR code saved successfully at:', response.data.path);
      
      return response.data.path;
    } catch (error) {
      console.error('Error saving QR code:', error);
      alert('Failed to save QR code image');
      throw error;
    }
  };
  
  const downloadQRCode = async () => {
    try {
      const imageData = await generateQRCodeImage();
      
      const a = document.createElement("a");
      a.download = "qrcode.png";
      a.href = imageData;
      a.click();
    } catch (error) {
      console.error("Error downloading QR code:", error);
      alert("Failed to download QR code");
    }
  };
  
  return (
    <div className="row">
      <div className="col-md-6">
        <div className="card">
          <div className="card-body">
            <h5 className="card-title">Generate QR Code</h5>
            <form onSubmit={handleSubmit}>
              <div className="mb-3">
                <label htmlFor="url" className="form-label">URL</label>
                <input
                  type="url"
                  className="form-control"
                  id="url"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  placeholder="https://example.com"
                  required
                />
              </div>
              
              <div className="mb-3 form-check">
                <input
                  type="checkbox"
                  className="form-check-input"
                  id="dynamic"
                  checked={isDynamic}
                  onChange={() => setIsDynamic(!isDynamic)}
                />
                <label className="form-check-label" htmlFor="dynamic">
                  Dynamic QR Code (with tracking)
                </label>
              </div>
              
              <div className="mb-3 form-check">
                <input
                  type="checkbox"
                  className="form-check-input"
                  id="logo"
                  checked={withLogo}
                  onChange={() => setWithLogo(!withLogo)}
                />
                <label className="form-check-label" htmlFor="logo">
                  Add DCS Logo to QR Code
                </label>
              </div>
              
              <button
                type="submit"
                className="btn btn-primary"
                disabled={isLoading || !url}
              >
                {isLoading ? 'Generating...' : 'Generate QR Code'}
              </button>
            </form>
          </div>
        </div>
      </div>
      
      <div className="col-md-6">
        {qrData && (
          <div className="card">
            <div className="card-body text-center">
              <h5 className="card-title">Your QR Code</h5>
              <div className="qr-code">
                <QRCodeSVG
                  ref={qrRef}
                  value={qrData.url}
                  size={300}
                  level="H"
                  boostLevel="true"
                  marginSize={4}
                  imageSettings={
                    withLogo ? {
                      src: "https://iili.io/39yM50u.md.png",
                      excavate: true,
                      height: 55,
                      width: 55,
                    } : undefined
                  }
                />
              </div>
              
              <button
                onClick={downloadQRCode}
                className="btn btn-success mt-3"
              >
                Download QR Code
              </button>
              
              {qrData.isDynamic && (
                <div className="mt-3">
                  <p>Tracking ID: {qrData.trackingId}</p>
                  {imagePath && (
                    <p className="text-muted">
                      <small>Qr Code Saved at</small>
                    </p>
                  )}
                  <Link 
                    to={`/dashboard/${qrData.trackingId}`}
                    className="btn btn-info"
                  >
                    View Analytics
                  </Link>
                </div>
              )}
              
              {/* Loading indicator while saving */}
              {qrData && !qrRendered && (
                <p className="text-muted mt-2">
                  <small>Saving QR code...</small>
                </p>
              )}
            </div>
          </div>
        )}
      </div>
      <div>
        <QRHistoryModal />
      </div>
    </div>
  );
};

export default QRGenerator;