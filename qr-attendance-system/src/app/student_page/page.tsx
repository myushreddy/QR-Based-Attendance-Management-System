'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { QrCode, Calendar, CheckCircle, XCircle, Clock, LogOut } from 'lucide-react';

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

export default function StudentPage() {
  const router = useRouter();
  const [student, setStudent] = useState<Student | null>(null);
  const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecord[]>([]);
  const [selectedMonth, setSelectedMonth] = useState(new Date().toISOString().slice(0, 7));

  useEffect(() => {
    // In a real app, this would come from authentication
    // For demo, we'll use the first student or allow selection
    const students = JSON.parse(localStorage.getItem('students') || '[]');
    if (students.length > 0) {
      setStudent(students[0]); // Demo: using first student
    }

    const storedAttendance = localStorage.getItem('attendanceRecords');
    if (storedAttendance) {
      setAttendanceRecords(JSON.parse(storedAttendance));
    }
  }, []);

  const handleLogout = () => {
    router.push('/');
  };

  if (!student) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <QrCode className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600">Loading student data...</p>
        </div>
      </div>
    );
  }

  // Filter attendance records for current student and selected month
  const studentAttendance = attendanceRecords.filter(record => 
    record.studentId === student.id && 
    record.date.startsWith(selectedMonth)
  );

  const totalDays = studentAttendance.length;
  const presentDays = studentAttendance.filter(record => record.status === 'present').length;
  const attendancePercentage = totalDays > 0 ? Math.round((presentDays / totalDays) * 100) : 0;

  // Generate QR code (in real app, this would be unique per student)
  const studentQRCode = student.rollNumber;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <div className="flex items-center">
                <div className="bg-blue-600 p-2 rounded-lg">
                  <QrCode className="h-6 w-6 text-white" />
                </div>
                <div className="ml-3">
                  <h1 className="text-xl font-semibold text-gray-900">Student Dashboard</h1>
                  <p className="text-sm text-gray-500">
                    Welcome, {student.fullName}
                  </p>
                </div>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center px-4 py-2 text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <LogOut className="h-4 w-4 mr-2" />
              Logout
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Student Info Card */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-semibold text-gray-900">{student.fullName}</h2>
              <div className="mt-2 space-y-1">
                <p className="text-sm text-gray-600">Roll Number: <span className="font-medium">{student.rollNumber}</span></p>
                <p className="text-sm text-gray-600">Course: <span className="font-medium">{student.course}</span></p>
                <p className="text-sm text-gray-600">Year: <span className="font-medium">{student.year}</span></p>
                <p className="text-sm text-gray-600">Department: <span className="font-medium">{student.department}</span></p>
              </div>
            </div>
            <div className="text-center space-y-4">
              <div className="bg-gray-100 p-4 rounded-lg">
                <QrCode className="h-16 w-16 text-gray-600 mx-auto mb-2" />
                <p className="text-xs text-gray-500">Your QR Code</p>
                <p className="text-sm font-mono font-medium">{studentQRCode}</p>
              </div>
              <button
                onClick={() => router.push('/student_scanner')}
                className="w-full flex items-center justify-center px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-semibold"
              >
                <QrCode className="h-5 w-5 mr-2" />
                Mark Attendance
              </button>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Calendar className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm text-gray-600">Total Days</p>
                <p className="text-2xl font-semibold text-gray-900">{totalDays}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <CheckCircle className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm text-gray-600">Present</p>
                <p className="text-2xl font-semibold text-gray-900">{presentDays}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center">
              <div className="p-2 bg-red-100 rounded-lg">
                <XCircle className="h-6 w-6 text-red-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm text-gray-600">Absent</p>
                <p className="text-2xl font-semibold text-gray-900">{totalDays - presentDays}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center">
              <div className={`p-2 rounded-lg ${
                attendancePercentage >= 75 ? 'bg-green-100' : 'bg-red-100'
              }`}>
                <Clock className={`h-6 w-6 ${
                  attendancePercentage >= 75 ? 'text-green-600' : 'text-red-600'
                }`} />
              </div>
              <div className="ml-4">
                <p className="text-sm text-gray-600">Attendance %</p>
                <p className={`text-2xl font-semibold ${
                  attendancePercentage >= 75 ? 'text-green-600' : 'text-red-600'
                }`}>
                  {attendancePercentage}%
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Attendance Records */}
        <div className="bg-white rounded-xl shadow-sm">
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Attendance History</h3>
                <p className="text-sm text-gray-600">Your daily attendance records</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Month</label>
                <input
                  type="month"
                  value={selectedMonth}
                  onChange={(e) => setSelectedMonth(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Check-in Time
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Check-out Time
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Duration
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {studentAttendance.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).map((record) => {
                  const duration = record.checkInTime && record.checkOutTime 
                    ? calculateDuration(record.checkInTime, record.checkOutTime)
                    : '-';
                  
                  return (
                    <tr key={record.id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {new Date(record.date).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {record.checkInTime || '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {record.checkOutTime || 'Not checked out'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {duration}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                          record.status === 'present' 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {record.status.charAt(0).toUpperCase() + record.status.slice(1)}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            {studentAttendance.length === 0 && (
              <div className="text-center py-8">
                <p className="text-gray-500">No attendance records found for selected month.</p>
              </div>
            )}
          </div>
        </div>

        {/* Instructions */}
        <div className="bg-blue-50 rounded-xl p-6 mt-8">
          <h4 className="text-lg font-semibold text-blue-900 mb-3">How to mark attendance:</h4>
          <ol className="list-decimal list-inside space-y-2 text-sm text-blue-800">
            <li>Show your QR code (displayed above) to the faculty scanner</li>
            <li>First scan of the day will mark your check-in time</li>
            <li>Last scan of the day will mark your check-out time</li>
            <li>Make sure to scan both at arrival and departure for complete attendance</li>
          </ol>
        </div>
      </main>
    </div>
  );
}

function calculateDuration(checkIn: string, checkOut: string): string {
  const [inHours, inMinutes, inSeconds] = checkIn.split(':').map(Number);
  const [outHours, outMinutes, outSeconds] = checkOut.split(':').map(Number);
  
  const inTotalMinutes = inHours * 60 + inMinutes;
  const outTotalMinutes = outHours * 60 + outMinutes;
  
  const diffMinutes = outTotalMinutes - inTotalMinutes;
  const hours = Math.floor(diffMinutes / 60);
  const minutes = diffMinutes % 60;
  
  return `${hours}h ${minutes}m`;
}