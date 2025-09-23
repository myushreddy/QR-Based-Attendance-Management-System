'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { QrCode, Camera, ArrowLeft, CheckCircle, XCircle, Users } from 'lucide-react';

interface Student {
  id: string;
  fullName: string;
  rollNumber: string;
  year: string;
  course: string;
  department: string;
}

interface AttendanceRecord {
  id: string;
  studentId: string;
  date: string;
  checkInTime: string | null;
  checkOutTime: string | null;
  status: 'present' | 'absent';
}

export default function QRScanner() {
  const router = useRouter();
  const [students, setStudents] = useState<Student[]>([]);
  const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecord[]>([]);
  const [scannedCode, setScannedCode] = useState('');
  const [lastScanResult, setLastScanResult] = useState<{
    success: boolean;
    message: string;
    student?: Student;
    action?: 'check-in' | 'check-out';
  } | null>(null);
  const [isScanning, setIsScanning] = useState(false);

  useEffect(() => {
    // Check if user is authenticated (faculty or admin)
    const facultyAuth = localStorage.getItem('facultyAuthenticated');
    const adminAuth = localStorage.getItem('adminAuthenticated');
    
    if (!facultyAuth && !adminAuth) {
      router.push('/');
      return;
    }

    loadData();
  }, [router]);

  const loadData = () => {
    // Load students
    const storedStudents = localStorage.getItem('students');
    if (storedStudents) {
      setStudents(JSON.parse(storedStudents));
    }

    // Load attendance records
    const storedAttendance = localStorage.getItem('attendanceRecords');
    if (storedAttendance) {
      setAttendanceRecords(JSON.parse(storedAttendance));
    }
  };

  const handleScanSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!scannedCode.trim()) return;
    
    processQRCode(scannedCode.trim());
    setScannedCode('');
  };

  const processQRCode = (qrCode: string) => {
    // In a real implementation, QR code would contain student roll number or ID
    // For demo, we'll assume QR code is the roll number
    const student = students.find(s => 
      s.rollNumber.toLowerCase() === qrCode.toLowerCase() ||
      s.id === qrCode
    );

    if (!student) {
      setLastScanResult({
        success: false,
        message: 'Student not found! Please check the QR code.',
      });
      return;
    }

    const today = new Date().toISOString().split('T')[0];
    const currentTime = new Date().toLocaleTimeString('en-US', { hour12: false });

    // Find existing attendance record for today
    const existingRecord = attendanceRecords.find(record => 
      record.studentId === student.id && record.date === today
    );

    let updatedRecords: AttendanceRecord[];
    let action: 'check-in' | 'check-out';

    if (existingRecord) {
      // Student already checked in, this is check-out
      if (!existingRecord.checkOutTime) {
        const updatedRecord = {
          ...existingRecord,
          checkOutTime: currentTime
        };
        updatedRecords = attendanceRecords.map(record => 
          record.id === existingRecord.id ? updatedRecord : record
        );
        action = 'check-out';
        setLastScanResult({
          success: true,
          message: `Check-out successful for ${student.fullName}`,
          student,
          action
        });
      } else {
        // Already checked out
        setLastScanResult({
          success: false,
          message: `${student.fullName} has already checked out today.`,
          student
        });
        return;
      }
    } else {
      // First scan of the day, this is check-in
      const newRecord: AttendanceRecord = {
        id: Date.now().toString(),
        studentId: student.id,
        date: today,
        checkInTime: currentTime,
        checkOutTime: null,
        status: 'present'
      };
      updatedRecords = [...attendanceRecords, newRecord];
      action = 'check-in';
      setLastScanResult({
        success: true,
        message: `Check-in successful for ${student.fullName}`,
        student,
        action
      });
    }

    setAttendanceRecords(updatedRecords);
    localStorage.setItem('attendanceRecords', JSON.stringify(updatedRecords));
  };

  const simulateQRScan = (rollNumber: string) => {
    setScannedCode(rollNumber);
    processQRCode(rollNumber);
  };

  const handleBack = () => {
    const facultyAuth = localStorage.getItem('facultyAuthenticated');
    if (facultyAuth) {
      router.push('/faculty_page');
    } else {
      router.push('/admin_page');
    }
  };

  const todayAttendance = attendanceRecords.filter(record => 
    record.date === new Date().toISOString().split('T')[0]
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <button
                onClick={handleBack}
                className="mr-4 p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <ArrowLeft className="h-5 w-5" />
              </button>
              <div className="flex items-center">
                <div className="bg-green-600 p-2 rounded-lg">
                  <QrCode className="h-6 w-6 text-white" />
                </div>
                <div className="ml-3">
                  <h1 className="text-xl font-semibold text-gray-900">QR Code Scanner</h1>
                  <p className="text-sm text-gray-500">Scan student QR codes for attendance</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Users className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm text-gray-600">Total Students</p>
                <p className="text-2xl font-semibold text-gray-900">{students.length}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <CheckCircle className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm text-gray-600">Present Today</p>
                <p className="text-2xl font-semibold text-gray-900">{todayAttendance.length}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Camera className="h-6 w-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm text-gray-600">Scans Today</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {todayAttendance.reduce((total, record) => {
                    let scans = 0;
                    if (record.checkInTime) scans++;
                    if (record.checkOutTime) scans++;
                    return total + scans;
                  }, 0)}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Scanner Section */}
        <div className="bg-white rounded-xl shadow-sm p-8 mb-8">
          <div className="text-center mb-8">
            <div className="bg-green-100 p-4 rounded-full w-20 h-20 mx-auto mb-4 flex items-center justify-center">
              <QrCode className="h-10 w-10 text-green-600" />
            </div>
            <h2 className="text-2xl font-semibold text-gray-900 mb-2">Scan QR Code</h2>
            <p className="text-gray-600">
              Students should show their QR code to mark attendance
            </p>
          </div>

          {/* Manual Input for Demo */}
          <form onSubmit={handleScanSubmit} className="max-w-md mx-auto mb-8">
            <div className="flex space-x-4">
              <input
                type="text"
                value={scannedCode}
                onChange={(e) => setScannedCode(e.target.value)}
                placeholder="Enter Roll Number (e.g., 21CSE001)"
                className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
              <button
                type="submit"
                disabled={!scannedCode.trim()}
                className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-400 transition-colors"
              >
                Scan
              </button>
            </div>
          </form>

          {/* Quick Demo Buttons */}
          <div className="max-w-md mx-auto">
            <p className="text-sm text-gray-500 text-center mb-4">Quick Demo (Click to simulate scan):</p>
            <div className="grid grid-cols-2 gap-3">
              {students.slice(0, 4).map(student => (
                <button
                  key={student.id}
                  onClick={() => simulateQRScan(student.rollNumber)}
                  className="p-3 text-sm bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                >
                  {student.rollNumber}
                  <br />
                  <span className="text-xs text-gray-600">{student.fullName}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Scan Result */}
        {lastScanResult && (
          <div className={`bg-white rounded-xl shadow-sm p-6 border-l-4 ${
            lastScanResult.success ? 'border-green-500' : 'border-red-500'
          }`}>
            <div className="flex items-center">
              {lastScanResult.success ? (
                <CheckCircle className="h-6 w-6 text-green-600 mr-3" />
              ) : (
                <XCircle className="h-6 w-6 text-red-600 mr-3" />
              )}
              <div>
                <p className={`font-medium ${
                  lastScanResult.success ? 'text-green-800' : 'text-red-800'
                }`}>
                  {lastScanResult.message}
                </p>
                {lastScanResult.student && lastScanResult.action && (
                  <p className="text-sm text-gray-600 mt-1">
                    {lastScanResult.action === 'check-in' ? 'Check-in' : 'Check-out'} time: {' '}
                    {new Date().toLocaleTimeString('en-US', { hour12: false })}
                  </p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Today's Attendance Summary */}
        <div className="bg-white rounded-xl shadow-sm mt-8">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">Today's Attendance</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Student
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Roll Number
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Check-in
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Check-out
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {todayAttendance.map((record) => {
                  const student = students.find(s => s.id === record.studentId);
                  return (
                    <tr key={record.id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {student?.fullName || 'Unknown'}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {student?.rollNumber || 'Unknown'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {record.checkInTime || '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {record.checkOutTime || '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="inline-flex px-2 py-1 text-xs font-medium bg-green-100 text-green-800 rounded-full">
                          Present
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            {todayAttendance.length === 0 && (
              <div className="text-center py-8">
                <p className="text-gray-500">No attendance recorded today.</p>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}