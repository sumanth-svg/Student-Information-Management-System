package mth.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import mth.models.Attendance;

@Repository
public interface AttendanceRepository extends JpaRepository<Attendance, Long> {

	@Query("select A from Attendance A where A.studentid=:studentid order by A.semester, A.subject")
	public List<Attendance> findByStudentId(@Param("studentid") Long studentid);

	@Query("select sum(A.attendedclasses), sum(A.totalclasses) from Attendance A where A.studentid=:studentid")
	public Object[] attendanceTotals(@Param("studentid") Long studentid);
}
