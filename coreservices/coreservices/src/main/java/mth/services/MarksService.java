package mth.services;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import mth.models.Marks;
import mth.repository.MarksRepository;

@Service
public class MarksService {

	@Autowired
	MarksRepository MR;

	@Autowired
	JwtService JWT;

	@Autowired
	PerformanceLogService PLS;

	public Object saveMarks(Marks M, String token) {
		Map<String, Object> response = new HashMap<>();
		try {
			JWT.validateJWT(token); // Authorization

			if (M.getMaxscore() <= 0)
				M.setMaxscore(100); // Default maximum score

			MR.save(M); // Insert into the database table (marks)

			// Automatic performance logging into MongoDB (best-effort)
			Map<String, Object> details = new HashMap<>();
			details.put("subject", M.getSubject());
			details.put("semester", M.getSemester());
			details.put("score", M.getScore());
			details.put("maxscore", M.getMaxscore());
			PLS.log(M.getStudentid(), "MARKS_UPDATE", details);

			response.put("code", 200);
			response.put("message", "Marks have been saved");
		} catch (Exception e) {
			response.put("code", 500);
			response.put("message", e.getMessage());
		}
		return response;
	}

	public Object getMarks(Long studentid, String token) {
		Map<String, Object> response = new HashMap<>();
		try {
			JWT.validateJWT(token); // Authorization
			List<Marks> marks = MR.findByStudentId(studentid);

			response.put("code", 200);
			response.put("marks", marks);
		} catch (Exception e) {
			response.put("code", 500);
			response.put("message", e.getMessage());
		}
		return response;
	}
}
