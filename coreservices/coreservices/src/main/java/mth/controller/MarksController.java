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

import mth.models.Marks;
import mth.services.MarksService;

@RestController
@RequestMapping("/marks")
@CrossOrigin(origins = "*", allowedHeaders = "*")
public class MarksController {

	@Autowired
	MarksService MS;

	@PostMapping("/savemarks")
	public Object saveMarks(@RequestBody Marks M, @RequestHeader String Token) {
		return MS.saveMarks(M, Token);
	}

	@GetMapping("/getmarks/{STUDENTID}")
	public Object getMarks(@PathVariable("STUDENTID") Long studentid, @RequestHeader String Token) {
		return MS.getMarks(studentid, Token);
	}
}
