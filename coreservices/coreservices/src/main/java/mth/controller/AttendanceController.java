package mth.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import mth.models.Attendance;
import mth.services.AttendanceService;

@RestController
@RequestMapping("/attendance")
@CrossOrigin(origins = "*", allowedHeaders = "*")
public class AttendanceController {

	@Autowired
	AttendanceService AS;

	@PostMapping("/saveattendance")
	public Object saveAttendance(@RequestBody Attendance A, @RequestHeader String Token) {
		return AS.saveAttendance(A, Token);
	}

	@GetMapping("/getattendance/{STUDENTID}")
	public Object getAttendance(@PathVariable("STUDENTID") Long studentid, @RequestHeader String Token) {
		return AS.getAttendance(studentid, Token);
	}
}
