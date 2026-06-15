package mth.models;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

@Entity
@Table
public class Attendance {
	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	Long id;

	Long studentid;

	String subject;

	int semester;

	int totalclasses;

	int attendedclasses;

	public Long getId() {
		return id;
	}

	public void setId(Long id) {
		this.id = id;
	}

	public Long getStudentid() {
		return studentid;
	}

	public void setStudentid(Long studentid) {
		this.studentid = studentid;
	}

	public String getSubject() {
		return subject;
	}

	public void setSubject(String subject) {
		this.subject = subject;
	}

	public int getSemester() {
		return semester;
	}

	public void setSemester(int semester) {
		this.semester = semester;
	}

	public int getTotalclasses() {
		return totalclasses;
	}

	public void setTotalclasses(int totalclasses) {
		this.totalclasses = totalclasses;
	}

	public int getAttendedclasses() {
		return attendedclasses;
	}

	public void setAttendedclasses(int attendedclasses) {
		this.attendedclasses = attendedclasses;
	}
}
