package mth.services;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import mth.models.Attendance;
import mth.models.Marks;
import mth.models.Students;
import mth.repository.AttendanceRepository;
import mth.repository.MarksRepository;
import mth.repository.StudentsRepository;

/**
 * Generates the academic report / summary for a student using real PostgreSQL
 * data. This is the single source of truth for academic calculations; the Node
 * analytics service consumes this same endpoint so the numbers always match.
 */
@Service
public class ReportService {

	@Autowired
	StudentsRepository SR;

	@Autowired
	MarksRepository MR;

	@Autowired
	AttendanceRepository AR;

	@Autowired
	JwtService JWT;

	// Below this average a subject is considered weak; at or above the strong
	// threshold it is considered strong.
	private static final double WEAK_THRESHOLD = 40.0;
	private static final double STRONG_THRESHOLD = 75.0;

	public Object generateReport(Long studentid, String token) {
		Map<String, Object> response = new HashMap<>();
		try {
			JWT.validateJWT(token); // Authorization

			Students student = SR.findById(studentid).get();

			List<Marks> marksList = MR.findByStudentId(studentid);
			List<Attendance> attendanceList = AR.findByStudentId(studentid);

			// ---- Average marks (overall) ----
			Double avgMarks = MR.averageScore(studentid);
			if (avgMarks == null)
				avgMarks = 0.0;
			avgMarks = round(avgMarks);

			// ---- Subject-wise performance (average score per subject) ----
			Map<String, double[]> subjectAgg = new LinkedHashMap<>(); // subject -> [sumScore, count]
			Map<Integer, double[]> semesterAgg = new LinkedHashMap<>(); // semester -> [sumScore, count]
			for (Marks m : marksList) {
				double[] s = subjectAgg.getOrDefault(m.getSubject(), new double[2]);
				s[0] += m.getScore();
				s[1] += 1;
				subjectAgg.put(m.getSubject(), s);

				double[] sem = semesterAgg.getOrDefault(m.getSemester(), new double[2]);
				sem[0] += m.getScore();
				sem[1] += 1;
				semesterAgg.put(m.getSemester(), sem);
			}

			List<Map<String, Object>> subjectPerformance = new ArrayList<>();
			List<String> weakSubjects = new ArrayList<>();
			List<String> strongSubjects = new ArrayList<>();
			for (Map.Entry<String, double[]> e : subjectAgg.entrySet()) {
				double avg = round(e.getValue()[0] / e.getValue()[1]);
				Map<String, Object> sp = new LinkedHashMap<>();
				sp.put("subject", e.getKey());
				sp.put("average", avg);
				subjectPerformance.add(sp);

				if (avg < WEAK_THRESHOLD)
					weakSubjects.add(e.getKey());
				else if (avg >= STRONG_THRESHOLD)
					strongSubjects.add(e.getKey());
			}

			// ---- Semester-wise performance ----
			List<Map<String, Object>> semesterPerformance = new ArrayList<>();
			for (Map.Entry<Integer, double[]> e : semesterAgg.entrySet()) {
				Map<String, Object> sp = new LinkedHashMap<>();
				sp.put("semester", e.getKey());
				sp.put("average", round(e.getValue()[0] / e.getValue()[1]));
				semesterPerformance.add(sp);
			}

			// ---- Attendance percentage (overall) ----
			Object[] totals = AR.attendanceTotals(studentid);
			double attendancePercentage = 0.0;
			if (totals != null && totals.length == 2 && totals[0] != null && totals[1] != null) {
				double attended = ((Number) totals[0]).doubleValue();
				double total = ((Number) totals[1]).doubleValue();
				if (total > 0)
					attendancePercentage = round((attended / total) * 100.0);
			}

			// ---- Ranking (1-based, by average score across all students) ----
			int rank = 0;
			int totalRanked = 0;
			List<Object[]> ranking = MR.averageScoreAllStudents();
			totalRanked = ranking.size();
			for (int i = 0; i < ranking.size(); i++) {
				Long sid = ((Number) ranking.get(i)[0]).longValue();
				if (sid.equals(studentid)) {
					rank = i + 1;
					break;
				}
			}

			response.put("code", 200);
			response.put("student", student);
			response.put("averagemarks", avgMarks);
			response.put("attendancepercentage", attendancePercentage);
			response.put("subjectperformance", subjectPerformance);
			response.put("semesterperformance", semesterPerformance);
			response.put("weaksubjects", weakSubjects);
			response.put("strongsubjects", strongSubjects);
			response.put("rank", rank);
			response.put("totalranked", totalRanked);
		} catch (Exception e) {
			response.put("code", 500);
			response.put("message", e.getMessage());
		}
		return response;
	}

	private double round(double value) {
		return Math.round(value * 100.0) / 100.0;
	}
}
