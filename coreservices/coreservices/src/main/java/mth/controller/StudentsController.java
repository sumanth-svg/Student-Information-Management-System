package mth.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import mth.models.Students;
import mth.services.StudentsService;

@RestController
@RequestMapping("/student")
@CrossOrigin(origins = "*", allowedHeaders = "*")
public class StudentsController {

	@Autowired
	StudentsService SS;

	@PostMapping("/savestudent")
	public Object saveStudent(@RequestBody Students S, @RequestHeader String Token) {
		return SS.saveStudent(S, Token);
	}

	@GetMapping("/getallstudents/{PAGE}/{SIZE}")
	public Object getAllStudents(@PathVariable("PAGE") int page, @PathVariable("SIZE") int size,
			@RequestHeader String Token) {
		return SS.getAllStudents(page, size, Token);
	}

	@GetMapping("/getstudent/{ID}")
	public Object getStudent(@PathVariable("ID") Long id, @RequestHeader String Token) {
		return SS.getStudentById(id, Token);
	}

	@PutMapping("/updatestudent/{ID}")
	public Object updateStudent(@PathVariable("ID") Long id, @RequestBody Students S, @RequestHeader String Token) {
		return SS.updateStudent(id, S, Token);
	}

	@DeleteMapping("/deletestudent/{ID}")
	public Object deleteStudent(@PathVariable("ID") Long id, @RequestHeader String Token) {
		return SS.deleteStudent(id, Token);
	}

	@GetMapping("/searchstudent/{KEY}")
	public Object searchStudent(@PathVariable("KEY") String key, @RequestHeader String Token) {
		return SS.searchStudent(key, Token);
	}
}
