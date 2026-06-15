package mth.controller;

import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import mth.models.Users;
import mth.services.UsersService;

@RestController
@RequestMapping("/user")
@CrossOrigin(origins = "*", allowedHeaders = "*")
public class UsersController {

	@Autowired
	UsersService US;
	
	@PostMapping("/signup")
	public Object signup(@RequestBody Users U)
	{
		System.out.println("Signup request received: " + U);
		System.out.println("Email: " + U.getEmail());
		System.out.println("Fullname: " + U.getFullname());
		System.out.println("Phone: " + U.getPhone());
		System.out.println("Password: " + U.getPassword());
		return US.signup(U);
	}
	
	@PostMapping("/signin")
	public Object signin(@RequestBody Map<String, Object> data)
	{
		return US.signin(data);
	}
	
	@GetMapping("/uinfo")
	public Object uinfo(@RequestHeader("Token") String token)
	{
		return US.uinfo(token);
	}

	@GetMapping("/profile")
	public Object profile(@RequestHeader("Token") String token)
	{
		return US.getProfile(token);
	}
}
