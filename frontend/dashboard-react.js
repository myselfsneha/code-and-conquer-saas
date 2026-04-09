const { useEffect, useMemo, useState } = React;

function DashboardApp() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [students, setStudents] = useState([]);
  const [courses, setCourses] = useState([]);
  const [lastUpdated, setLastUpdated] = useState(null);

  const token = localStorage.getItem('token');

  useEffect(() => {
    if (!token) {
      window.location.href = 'login.html';
      return;
    }

    loadMetrics();
    const timer = setInterval(loadMetrics, 30000);
    return () => clearInterval(timer);
  }, []);

  async function loadMetrics() {
    setLoading(true);
    setError('');

    try {
      const [studentsRes, coursesRes] = await Promise.all([
        fetch(`${API}/students?page=1&limit=500`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        fetch(`${API}/courses`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);

      const studentsPayload = await studentsRes.json();
      const coursesPayload = await coursesRes.json();

      if (!studentsRes.ok || !studentsPayload.success) {
        throw new Error(studentsPayload.message || 'Unable to load students');
      }

      if (!coursesRes.ok || !coursesPayload.success) {
        throw new Error(coursesPayload.message || 'Unable to load courses');
      }

      setStudents(studentsPayload.data || []);
      setCourses(coursesPayload.data || []);
      setLastUpdated(new Date());
    } catch (err) {
      setError(err.message || 'Dashboard load failed');
    } finally {
      setLoading(false);
    }
  }

  const metrics = useMemo(() => {
    const courseFeeMap = {};
    courses.forEach((course) => {
      courseFeeMap[course.name] = Number(course.fees || 0);
    });

    const totalStudents = students.length;
    const revenue = students.reduce((sum, s) => sum + Number(s.total_paid || 0), 0);
    const pendingFees = students.reduce((sum, s) => {
      const expected = courseFeeMap[s.course] || 0;
      return sum + Math.max(expected - Number(s.total_paid || 0), 0);
    }, 0);

    const attendanceAvg = totalStudents
      ? students.reduce((sum, s) => sum + Number(s.attendance_percentage || 0), 0) / totalStudents
      : 0;

    return {
      totalStudents,
      revenue,
      pendingFees,
      attendanceAvg: attendanceAvg.toFixed(2),
    };
  }, [students, courses]);

  if (loading) {
    return <div className="text-center mt-5">Loading dashboard...</div>;
  }

  return (
    <div className="dashboard-shell">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="mb-0">📊 Modern Dashboard (React)</h2>
        <span className="badge-soft">
          {lastUpdated ? `Updated: ${lastUpdated.toLocaleTimeString()}` : 'Not synced'}
        </span>
      </div>

      {error && <div className="alert alert-danger">{error}</div>}

      <div className="row g-4">
        <MetricCard label="Total Students" value={metrics.totalStudents} color="primary" icon="👨‍🎓" />
        <MetricCard label="Revenue" value={`₹${metrics.revenue.toLocaleString('en-IN')}`} color="success" icon="💰" />
        <MetricCard label="Pending Fees" value={`₹${metrics.pendingFees.toLocaleString('en-IN')}`} color="warning" icon="📉" />
        <MetricCard label="Attendance %" value={`${metrics.attendanceAvg}%`} color="info" icon="📅" />
      </div>

      <div className="card mt-4 metric-card">
        <div className="card-body">
          <h5 className="card-title">Recent Students</h5>
          <div className="table-responsive">
            <table className="table table-sm align-middle mb-0">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Course</th>
                  <th>Fees Paid</th>
                  <th>Attendance</th>
                </tr>
              </thead>
              <tbody>
                {students.slice(0, 6).map((s) => (
                  <tr key={s.student_id}>
                    <td>{s.name}</td>
                    <td>{s.course}</td>
                    <td>₹{Number(s.total_paid || 0).toLocaleString('en-IN')}</td>
                    <td>{Number(s.attendance_percentage || 0).toFixed(2)}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

function MetricCard({ label, value, color, icon }) {
  return (
    <div className="col-md-6 col-lg-3">
      <div className={`card metric-card border-start border-4 border-${color}`}>
        <div className="card-body">
          <div className="d-flex justify-content-between align-items-start">
            <div>
              <div className="metric-label">{label}</div>
              <div className="metric-value">{value}</div>
            </div>
            <div style={{ fontSize: '1.4rem' }}>{icon}</div>
          </div>
        </div>
      </div>
    </div>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(<DashboardApp />);
