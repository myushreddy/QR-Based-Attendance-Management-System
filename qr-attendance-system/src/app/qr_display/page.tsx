'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { QrCode, RefreshCw, Users, Clock, ArrowLeft } from 'lucide-react';

export default function QRDisplay() {
  const router = useRouter();
  const [qrData, setQrData] = useState('');
  const [timeRemaining, setTimeRemaining] = useState(15);
  const [facultyInfo, setFacultyInfo] = useState<any>(null);
  const [sessionActive, setSessionActive] = useState(true);

  useEffect(() => {
    const facultyAuth = localStorage.getItem('facultyAuthenticated');
    const currentFaculty = localStorage.getItem('currentFaculty');
    
    if (!facultyAuth || !currentFaculty) {
      router.push('/');
      return;
    }
    
    setFacultyInfo(JSON.parse(currentFaculty));
    generateQRCode();
    
    // Timer for QR refresh every 15 seconds
    const qrInterval = setInterval(generateQRCode, 15000);
    
    // Countdown timer
    const countdownInterval = setInterval(() => {
      setTimeRemaining(prev => {
        if (prev <= 1) {
          return 15;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      clearInterval(qrInterval);
      clearInterval(countdownInterval);
    };
  }, [router]);

  const generateQRCode = () => {
    const timestamp = Date.now();
    const sessionId = Math.floor(timestamp / 15000); // 15-second blocks
    const qrContent = `ATTENDANCE_QR_${sessionId}_${timestamp}`;
    setQrData(qrContent);
    setTimeRemaining(15);
  };

  const handleBack = () => {
    router.push('/faculty_page');
  };

  const toggleSession = () => {
    setSessionActive(!sessionActive);
  };

  // Generate QR code display (using text representation for demo)
  const renderQRCode = () => {
    if (!sessionActive) {
      return (
        <div className="w-80 h-80 bg-gray-200 border-2 border-gray-300 rounded-lg flex items-center justify-center">
          <div className="text-center">
            <QrCode className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">Session Paused</p>
          </div>
        </div>
      );
    }

    // In a real app, use a QR code library like 'qrcode' to generate actual QR image
    return (
      <div className="w-80 h-80 bg-white border-2 border-gray-300 rounded-lg p-4 flex items-center justify-center relative">
        {/* QR Code Pattern Simulation */}
        <div className="grid grid-cols-8 gap-1 w-full h-full">
          {Array.from({ length: 64 }, (_, i) => (
            <div
              key={i}
              className={`${
                (qrData.charCodeAt(i % qrData.length) + i) % 2 === 0
                  ? 'bg-black'
                  : 'bg-white'
              } w-full h-full`}
            />
          ))}
        </div>
        
        {/* QR Code corners */}
        <div className="absolute top-2 left-2 w-8 h-8 border-4 border-black"></div>
        <div className="absolute top-2 right-2 w-8 h-8 border-4 border-black"></div>
        <div className="absolute bottom-2 left-2 w-8 h-8 border-4 border-black"></div>
        
        {/* Center indicator */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-12 h-12 bg-black rounded"></div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <button
                onClick={handleBack}
                className="flex items-center text-gray-600 hover:text-gray-900 mr-4"
              >
                <ArrowLeft className="h-5 w-5 mr-2" />
                Back
              </button>
              <div className="flex items-center">
                <div className="bg-green-600 p-2 rounded-lg">
                  <QrCode className="h-6 w-6 text-white" />
                </div>
                <div className="ml-3">
                  <h1 className="text-xl font-semibold text-gray-900">Attendance QR Code</h1>
                  <p className="text-sm text-gray-500">
                    Faculty: {facultyInfo?.fullName || 'Faculty'}
                  </p>
                </div>
              </div>
            </div>
            <button
              onClick={toggleSession}
              className={`flex items-center px-4 py-2 rounded-lg transition-colors ${
                sessionActive
                  ? 'bg-red-100 text-red-700 hover:bg-red-200'
                  : 'bg-green-100 text-green-700 hover:bg-green-200'
              }`}
            >
              {sessionActive ? 'Pause Session' : 'Resume Session'}
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* QR Code Display */}
          <div className="bg-white rounded-xl shadow-sm p-8">
            <div className="text-center">
              <h2 className="text-2xl font-semibold text-gray-900 mb-6">
                Scan for Attendance
              </h2>
              
              <div className="flex justify-center mb-6">
                {renderQRCode()}
              </div>

              {/* Timer and Status */}
              <div className="space-y-4">
                <div className={`inline-flex items-center px-4 py-2 rounded-full text-sm font-medium ${
                  sessionActive
                    ? 'bg-green-100 text-green-800'
                    : 'bg-gray-100 text-gray-800'
                }`}>
                  <div className={`w-2 h-2 rounded-full mr-2 ${
                    sessionActive ? 'bg-green-500' : 'bg-gray-500'
                  }`}></div>
                  {sessionActive ? 'Session Active' : 'Session Paused'}
                </div>

                {sessionActive && (
                  <div className="flex items-center justify-center space-x-2 text-lg">
                    <RefreshCw className="h-5 w-5 text-blue-600" />
                    <span className="text-gray-700">Refreshes in:</span>
                    <span className="font-mono font-bold text-blue-600">
                      {timeRemaining}s
                    </span>
                  </div>
                )}
              </div>

              <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                <p className="text-sm text-blue-800">
                  <strong>Instructions:</strong> Students should scan this QR code using their mobile app to mark attendance.
                  The QR code refreshes every 15 seconds for security.
                </p>
              </div>
            </div>
          </div>

          {/* Session Info and Controls */}
          <div className="space-y-6">
            {/* Session Details */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Session Details</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Faculty:</span>
                  <span className="font-medium">{facultyInfo?.fullName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Department:</span>
                  <span className="font-medium">{facultyInfo?.department}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Date:</span>
                  <span className="font-medium">{new Date().toLocaleDateString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Time:</span>
                  <span className="font-medium">{new Date().toLocaleTimeString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">QR Refresh:</span>
                  <span className="font-medium">Every 15 seconds</span>
                </div>
              </div>
            </div>

            {/* Today's Stats */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Today's Attendance</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <Users className="h-8 w-8 text-green-600 mx-auto mb-2" />
                  <div className="text-2xl font-bold text-green-600">
                    {JSON.parse(localStorage.getItem('attendanceRecords') || '[]')
                      .filter((record: any) => record.date === new Date().toISOString().split('T')[0] && record.status === 'present').length}
                  </div>
                  <div className="text-sm text-green-600">Present</div>
                </div>
                <div className="text-center p-4 bg-blue-50 rounded-lg">
                  <Clock className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                  <div className="text-2xl font-bold text-blue-600">
                    {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </div>
                  <div className="text-sm text-blue-600">Current Time</div>
                </div>
              </div>
            </div>

            {/* Instructions */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">How it Works</h3>
              <div className="space-y-2 text-sm text-gray-600">
                <div className="flex items-start">
                  <div className="w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-xs font-bold mr-3 mt-0.5">1</div>
                  <p>Display this QR code on a large screen or projector</p>
                </div>
                <div className="flex items-start">
                  <div className="w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-xs font-bold mr-3 mt-0.5">2</div>
                  <p>Students open their attendance app and scan the QR code</p>
                </div>
                <div className="flex items-start">
                  <div className="w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-xs font-bold mr-3 mt-0.5">3</div>
                  <p>Attendance is automatically marked when QR is scanned</p>
                </div>
                <div className="flex items-start">
                  <div className="w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-xs font-bold mr-3 mt-0.5">4</div>
                  <p>QR code refreshes every 15 seconds for security</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}