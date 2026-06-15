package mth.services;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;

import mth.models.Students;
import mth.repository.StudentsRepository;

@Service
public class StudentsService {

	@Autowired
	StudentsRepository SR;

	@Autowired
	JwtService JWT;

	public Object saveStudent(Students S, String token) {
		Map<String, Object> response = new HashMap<>();
		try {
			JWT.validateJWT(token); // Authorization

			Object id = SR.checkByRollno(S.getRollno());
			if (id != null)
				throw new Exception("Roll number already registered");

			if (S.getStatus() == 0)
				S.setStatus(1); // Make the student active by default

			SR.save(S); // Insert into the database table (students)

			response.put("code", 200);
			response.put("message", "New student has been created");
		} catch (Exception e) {
			response.put("code", 500);
			response.put("message", e.getMessage());
		}
		return response;
	}

	public Object getAllStudents(int page, int size, String token) {
		Map<String, Object> response = new HashMap<>();
		try {
			JWT.validateJWT(token); // Authorization
			Pageable pageable = PageRequest.of(page - 1, size, Sort.by("id").ascending());
			Page<Students> students = SR.findAll(pageable);

			response.put("code", 200);
			response.put("page", page);
			response.put("size", size);
			response.put("totalpages", students.getTotalPages());
			response.put("totalrecords", students.getTotalElements());
			response.put("students", students.getContent());
		} catch (Exception e) {
			response.put("code", 500);
			response.put("message", e.getMessage());
		}
		return response;
	}

	public Object getStudentById(Long id, String token) {
		Map<String, Object> response = new HashMap<>();
		try {
			JWT.validateJWT(token); // Authorization
			Students student = SR.findById(id).get();

			response.put("code", 200);
			response.put("student", student);
		} catch (Exception e) {
			response.put("code", 500);
			response.put("message", e.getMessage());
		}
		return response;
	}

	public Object updateStudent(Long id, Students S, String token) {
		Map<String, Object> response = new HashMap<>();
		try {
			JWT.validateJWT(token); // Authorization

			Students temp = SR.findById(id).get();
			temp.setRollno(S.getRollno());
			temp.setName(S.getName());
			temp.setEmail(S.getEmail());
			temp.setDepartment(S.getDepartment());
			temp.setSemester(S.getSemester());
			temp.setStatus(S.getStatus());

			SR.save(temp);

			response.put("code", 200);
			response.put("message", "Student has been updated");
		} catch (Exception e) {
			response.put("code", 500);
			response.put("message", e.getMessage());
		}
		return response;
	}

	public Object deleteStudent(Long id, String token) {
		Map<String, Object> response = new HashMap<>();
		try {
			JWT.validateJWT(token); // Authorization

			SR.deleteById(id);

			response.put("code", 200);
			response.put("message", "Student has been deleted");
		} catch (Exception e) {
			response.put("code", 500);
			response.put("message", e.getMessage());
		}
		return response;
	}

	public Object searchStudent(String key, String token) {
		Map<String, Object> response = new HashMap<>();
		try {
			JWT.validateJWT(token); // Authorization
			List<Object> students = SR.searchStudent(key);
			response.put("code", 200);
			response.put("students", students);
		} catch (Exception e) {
			response.put("code", 500);
			response.put("message", e.getMessage());
		}
		return response;
	}
}
