'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Camera, QrCode, CheckCircle, XCircle, ArrowLeft } from 'lucide-react';

export default function StudentScanner() {
  const router = useRouter();
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [scanResult, setScanResult] = useState<string | null>(null);
  const [attendanceMarked, setAttendanceMarked] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [studentInfo, setStudentInfo] = useState<any>(null);

  useEffect(() => {
    // Check if student is authenticated
    const studentAuth = localStorage.getItem('studentAuthenticated');
    const currentStudent = localStorage.getItem('currentStudent');
    
    if (!studentAuth || !currentStudent) {
      router.push('/');
      return;
    }
    
    setStudentInfo(JSON.parse(currentStudent));
    startCamera();
    
    return () => {
      stopCamera();
    };
  }, [router]);

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { 
          facingMode: 'environment', // Back camera for scanning
          width: { ideal: 1280 },
          height: { ideal: 720 }
        }
      });
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        setIsScanning(true);
        setError(null);
        
        // Start scanning for QR codes
        scanForQRCode();
      }
    } catch (err) {
      setError('Unable to access camera. Please allow camera permissions.');
      console.error('Camera error:', err);
    }
  };

  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach(track => track.stop());
    }
    setIsScanning(false);
  };

  const scanForQRCode = () => {
    if (!isScanning || !videoRef.current || !canvasRef.current) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');

    if (!context || video.readyState !== video.HAVE_ENOUGH_DATA) {
      setTimeout(scanForQRCode, 100);
      return;
    }

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    context.drawImage(video, 0, 0, canvas.width, canvas.height);

    // Simulate QR code detection (in real app, use a QR code library like jsQR)
    const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
    const qrCode = detectQRCode(imageData);

    if (qrCode) {
      handleQRCodeDetected(qrCode);
    } else {
      setTimeout(scanForQRCode, 100);
    }
  };

  // Simulate QR detection - in real app, use jsQR library
  const detectQRCode = (imageData: ImageData): string | null => {
    // This is a simulation - in real implementation, use jsQR
    // For demo, we'll simulate finding a QR code randomly
    if (Math.random() < 0.01) { // 1% chance per scan to simulate finding QR
      const currentTime = Date.now();
      return `ATTENDANCE_QR_${Math.floor(currentTime / 15000)}_${currentTime}`;
    }
    return null;
  };

  const handleQRCodeDetected = async (qrData: string) => {
    if (attendanceMarked) return;

    setIsScanning(false);
    setScanResult(qrData);

    // Validate QR code format and timing
    if (validateQRCode(qrData)) {
      await markAttendance(qrData);
    } else {
      setError('Invalid or expired QR code. Please try again.');
      setTimeout(() => {
        setError(null);
        setIsScanning(true);
        scanForQRCode();
      }, 2000);
    }
  };

  const validateQRCode = (qrData: string): boolean => {
    // Check if QR code is in correct format
    if (!qrData.startsWith('ATTENDANCE_QR_')) return false;

    // Extract timestamp from QR code
    const parts = qrData.split('_');
    if (parts.length < 4) return false;

    const qrTimestamp = parseInt(parts[3]);
    const currentTime = Date.now();
    
    // Check if QR code is within 15 second window
    const timeDiff = Math.abs(currentTime - qrTimestamp);
    return timeDiff <= 15000; // 15 seconds tolerance
  };

  const markAttendance = async (qrData: string) => {
    try {
      if (!studentInfo) return;

      const today = new Date().toISOString().split('T')[0];
      const currentTime = new Date().toLocaleTimeString();

      // Get existing attendance records
      const existingAttendance = JSON.parse(localStorage.getItem('attendanceRecords') || '[]');
      
      // Check if already marked for today
      const todayAttendance = existingAttendance.find((record: any) => 
        record.studentId === studentInfo.id && record.date === today
      );

      let updatedAttendance;
      
      if (todayAttendance) {
        // Update check-out time if already checked in
        if (!todayAttendance.checkOutTime) {
          todayAttendance.checkOutTime = currentTime;
          updatedAttendance = existingAttendance;
        } else {
          setError('Attendance already marked for today');
          return;
        }
      } else {
        // Create new attendance record
        const newRecord = {
          id: Date.now().toString(),
          studentId: studentInfo.id,
          date: today,
          checkInTime: currentTime,
          checkOutTime: null,
          status: 'present'
        };
        updatedAttendance = [...existingAttendance, newRecord];
      }

      // Save to localStorage
      localStorage.setItem('attendanceRecords', JSON.stringify(updatedAttendance));
      
      setAttendanceMarked(true);
      stopCamera();
      
      // Auto redirect after 3 seconds
      setTimeout(() => {
        router.push('/student_page');
      }, 3000);

    } catch (error) {
      setError('Failed to mark attendance. Please try again.');
      console.error('Attendance error:', error);
    }
  };

  const handleBack = () => {
    stopCamera();
    router.push('/student_page');
  };

  if (attendanceMarked) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white rounded-xl shadow-sm p-8 text-center max-w-md w-full mx-4">
          <div className="mb-4">
            <CheckCircle className="h-16 w-16 text-green-600 mx-auto" />
          </div>
          <h2 className="text-2xl font-semibold text-gray-900 mb-2">
            Attendance Marked!
          </h2>
          <p className="text-gray-600 mb-4">
            Your attendance has been successfully recorded for today.
          </p>
          <p className="text-sm text-gray-500">
            Redirecting to dashboard in 3 seconds...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900">
      {/* Header */}
      <div className="bg-gray-800 p-4">
        <div className="flex items-center justify-between">
          <button
            onClick={handleBack}
            className="flex items-center text-white hover:text-gray-300"
          >
            <ArrowLeft className="h-5 w-5 mr-2" />
            Back
          </button>
          <h1 className="text-white text-lg font-semibold">Scan Attendance QR</h1>
          <div className="w-16"></div>
        </div>
      </div>

      {/* Camera View */}
      <div className="relative">
        {error ? (
          <div className="h-96 bg-gray-800 flex items-center justify-center">
            <div className="text-center">
              <XCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
              <p className="text-white text-lg mb-4">{error}</p>
              <button
                onClick={() => {
                  setError(null);
                  startCamera();
                }}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Try Again
              </button>
            </div>
          </div>
        ) : (
          <>
            <video
              ref={videoRef}
              autoPlay
              playsInline
              className="w-full h-96 object-cover"
            />
            <canvas ref={canvasRef} className="hidden" />
            
            {/* Scanning Overlay */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="border-2 border-white border-dashed w-64 h-64 rounded-lg flex items-center justify-center">
                <div className="text-center">
                  <QrCode className="h-12 w-12 text-white mx-auto mb-2" />
                  <p className="text-white text-sm">
                    {isScanning ? 'Scanning for QR code...' : 'Initializing camera...'}
                  </p>
                </div>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Instructions */}
      <div className="p-6">
        <div className="bg-white rounded-xl p-4">
          <h3 className="font-semibold text-gray-900 mb-2">Instructions:</h3>
          <ul className="text-sm text-gray-600 space-y-1">
            <li>• Point your camera at the QR code displayed by your faculty</li>
            <li>• Make sure the QR code is clearly visible within the frame</li>
            <li>• The QR code updates every 15 seconds</li>
            <li>• Your attendance will be marked automatically when scanned</li>
          </ul>
        </div>
      </div>

      {scanResult && (
        <div className="p-4">
          <div className="bg-blue-100 border border-blue-300 rounded-lg p-3">
            <p className="text-blue-800 text-sm">
              QR Code detected: Processing attendance...
            </p>
          </div>
        </div>
      )}
    </div>
  );
}