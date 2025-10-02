'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Calendar, Users, LogOut, Search, QrCode, Download, Filter } from 'lucide-react';

interface Student {
  id: string;
  fullName: string;
  rollNumber: string;
  year: string;
  course: string;
  department: string;
  createdAt: string;
}

interface AttendanceRecord {
  id: string;
  studentId: string;
  date: string;
  checkInTime: string | null;
  checkOutTime: string | null;
  status: 'present' | 'absent';
}

export default function FacultyPage() {
  const router = useRouter();
  const [students, setStudents] = useState<Student[]>([]);
  const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecord[]>([]);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCourse, setFilterCourse] = useState('');
  const [filterYear, setFilterYear] = useState('');
  const [facultyInfo, setFacultyInfo] = useState<any>(null);

  // Check authentication and load data on page load
  useEffect(() => {
    const isAuthenticated = localStorage.getItem('facultyAuthenticated');
    const facultyData = localStorage.getItem('currentFaculty');
    
    if (!isAuthenticated || isAuthenticated !== 'true' || !facultyData) {
      router.push('/');
      return;
    }

    setFacultyInfo(JSON.parse(facultyData));
    loadStudentData();
    loadAttendanceData();
  }, [router]);

  const loadStudentData = () => {
    // Load or create sample student data
    const storedStudents = localStorage.getItem('students');
    if (storedStudents) {
      setStudents(JSON.parse(storedStudents));
    } else {
      // Create sample student data for demo
      const sampleStudents: Student[] = [
        {
          id: '1',
          fullName: 'Rahul Sharma',
          rollNumber: '21CSE001',
          year: '2021',
          course: 'B.Tech Computer Science',
          department: 'Computer Science',
          createdAt: new Date().toISOString()
        },
        {
          id: '2',
          fullName: 'Priya Patel',
          rollNumber: '21CSE002',
          year: '2021',
          course: 'B.Tech Computer Science',
          department: 'Computer Science',
          createdAt: new Date().toISOString()
        },
        {
          id: '3',
          fullName: 'Amit Kumar',
          rollNumber: '22CSE001',
          year: '2022',
          course: 'B.Tech Computer Science',
          department: 'Computer Science',
          createdAt: new Date().toISOString()
        },
        {
          id: '4',
          fullName: 'Sneha Reddy',
          rollNumber: '21IT001',
          year: '2021',
          course: 'B.Tech Information Technology',
          department: 'Information Technology',
          createdAt: new Date().toISOString()
        },
        {
          id: '5',
          fullName: 'Vikash Singh',
          rollNumber: '21ME001',
          year: '2021',
          course: 'B.Tech Mechanical',
          department: 'Mechanical',
          createdAt: new Date().toISOString()
        }
      ];
      setStudents(sampleStudents);
      localStorage.setItem('students', JSON.stringify(sampleStudents));
    }
  };

  const loadAttendanceData = () => {
    const storedAttendance = localStorage.getItem('attendanceRecords');
    if (storedAttendance) {
      setAttendanceRecords(JSON.parse(storedAttendance));
    } else {
      // Create sample attendance for today
      const today = new Date().toISOString().split('T')[0];
      const sampleAttendance: AttendanceRecord[] = [
        {
          id: '1',
          studentId: '1',
          date: today,
          checkInTime: '09:15:30',
          checkOutTime: '16:45:20',
          status: 'present'
        },
        {
          id: '2',
          studentId: '2',
          date: today,
          checkInTime: '09:20:15',
          checkOutTime: null,
          status: 'present'
        },
        {
          id: '3',
          studentId: '3',
          date: today,
          checkInTime: '09:30:45',
          checkOutTime: '15:30:10',
          status: 'present'
        }
      ];
      setAttendanceRecords(sampleAttendance);
      localStorage.setItem('attendanceRecords', JSON.stringify(sampleAttendance));
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('facultyAuthenticated');
    localStorage.removeItem('currentFaculty');
    router.push('/');
  };

  // Filter students based on search and filters
  const filteredStudents = students.filter(student => {
    const matchesSearch = student.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         student.rollNumber.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCourse = !filterCourse || student.course.includes(filterCourse);
    const matchesYear = !filterYear || student.year === filterYear;
    
    return matchesSearch && matchesCourse && matchesYear;
  });

  // Get attendance for selected date
  const getAttendanceForDate = (studentId: string) => {
    return attendanceRecords.find(record => 
      record.studentId === studentId && record.date === selectedDate
    );
  };

  // Get unique courses and years for filters
  const uniqueCourses = [...new Set(students.map(s => s.course))];
  const uniqueYears = [...new Set(students.map(s => s.year))];

  const todayAttendance = attendanceRecords.filter(record => record.date === selectedDate);
  const totalPresent = todayAttendance.filter(record => record.status === 'present').length;
  const totalStudents = students.length;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <div className="flex items-center">
                <div className="bg-green-600 p-2 rounded-lg">
                  <QrCode className="h-6 w-6 text-white" />
                </div>
                <div className="ml-3">
                  <h1 className="text-xl font-semibold text-gray-900">Faculty Dashboard</h1>
                  <p className="text-sm text-gray-500">
                    Welcome, {facultyInfo?.fullName || 'Faculty'}
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
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Users className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm text-gray-600">Total Students</p>
                <p className="text-2xl font-semibold text-gray-900">{totalStudents}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <Users className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm text-gray-600">Present Today</p>
                <p className="text-2xl font-semibold text-gray-900">{totalPresent}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center">
              <div className="p-2 bg-red-100 rounded-lg">
                <Users className="h-6 w-6 text-red-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm text-gray-600">Absent Today</p>
                <p className="text-2xl font-semibold text-gray-900">{totalStudents - totalPresent}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Calendar className="h-6 w-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm text-gray-600">Attendance %</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {totalStudents > 0 ? Math.round((totalPresent / totalStudents) * 100) : 0}%
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Attendance Management */}
        <div className="bg-white rounded-xl shadow-sm">
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex justify-between items-center mb-4">
              <div>
                <h2 className="text-lg font-semibold text-gray-900">Student Attendance</h2>
                <p className="text-sm text-gray-600">Track and manage daily attendance</p>
              </div>
              <div className="flex space-x-3">
                <button className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                  <Download className="h-4 w-4 mr-2" />
                  Export
                </button>
                <button 
                  onClick={() => router.push('/qr_scanner')}
                  className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                >
                  <QrCode className="h-4 w-4 mr-2" />
                  QR Scanner
                </button>
              </div>
            </div>

            {/* Filters */}
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
                <input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder-gray-900 font-semibold"
                  placeholder="Date"
                  style={{ color: '#303133ff', fontWeight: 600 }}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Search</label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <input
                    type="text"
                    placeholder="Search students..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder-gray-700"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Course</label>
                <select
                  value={filterCourse}
                  onChange={(e) => setFilterCourse(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 font-semibold"
                  style={{ color: '#1a202c', fontWeight: 600 }}
                >
                  <option value="" className="text-gray-900 font-semibold">All Courses</option>
                  {uniqueCourses.map(course => (
                    <option key={course} value={course}>{course}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Year</label>
                <select
                  value={filterYear}
                  onChange={(e) => setFilterYear(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 font-semibold"
                  style={{ color: '#1a202c', fontWeight: 600 }}
                >
                  <option value="" className="text-gray-900 font-semibold">All Years</option>
                  {uniqueYears.map(year => (
                    <option key={year} value={year}>{year}</option>
                  ))}
                </select>
              </div>

              <div className="flex items-end">
                <button
                  onClick={() => {
                    setSearchTerm('');
                    setFilterCourse('');
                    setFilterYear('');
                  }}
                  className="w-full px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  Clear Filters
                </button>
              </div>
            </div>
          </div>

          {/* Attendance Table */}
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Student Details
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Roll Number
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Year/Course
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Check-in Time
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Check-out Time
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredStudents.map((student) => {
                  const attendance = getAttendanceForDate(student.id);
                  return (
                    <tr key={student.id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {student.fullName}
                          </div>
                          <div className="text-sm text-gray-500">
                            {student.department}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {student.rollNumber}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{student.year}</div>
                        <div className="text-sm text-gray-500">{student.course}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {attendance?.checkInTime || '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {attendance?.checkOutTime || '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                          attendance?.status === 'present' 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {attendance?.status || 'Absent'}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            {filteredStudents.length === 0 && (
              <div className="text-center py-8">
                <p className="text-gray-500">No students found.</p>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}