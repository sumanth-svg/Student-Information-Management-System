package mth.services;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import mth.models.Attendance;
import mth.repository.AttendanceRepository;

@Service
public class AttendanceService {

	@Autowired
	AttendanceRepository AR;

	@Autowired
	JwtService JWT;

	@Autowired
	PerformanceLogService PLS;

	public Object saveAttendance(Attendance A, String token) {
		Map<String, Object> response = new HashMap<>();
		try {
			JWT.validateJWT(token); // Authorization

			if (A.getAttendedclasses() > A.getTotalclasses())
				throw new Exception("Attended classes cannot exceed total classes");

			AR.save(A); // Insert into the database table (attendance)

			// Automatic performance logging into MongoDB (best-effort)
			Map<String, Object> details = new HashMap<>();
			details.put("subject", A.getSubject());
			details.put("semester", A.getSemester());
			details.put("attendedclasses", A.getAttendedclasses());
			details.put("totalclasses", A.getTotalclasses());
			PLS.log(A.getStudentid(), "ATTENDANCE_UPDATE", details);

			response.put("code", 200);
			response.put("message", "Attendance has been saved");
		} catch (Exception e) {
			response.put("code", 500);
			response.put("message", e.getMessage());
		}
		return response;
	}

	public Object getAttendance(Long studentid, String token) {
		Map<String, Object> response = new HashMap<>();
		try {
			JWT.validateJWT(token); // Authorization
			List<Attendance> attendance = AR.findByStudentId(studentid);

			response.put("code", 200);
			response.put("attendance", attendance);
		} catch (Exception e) {
			response.put("code", 500);
			response.put("message", e.getMessage());
		}
		return response;
	}
}
