package mth.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import mth.models.Marks;

@Repository
public interface MarksRepository extends JpaRepository<Marks, Long> {

	@Query("select M from Marks M where M.studentid=:studentid order by M.semester, M.subject")
	public List<Marks> findByStudentId(@Param("studentid") Long studentid);

	@Query("select avg(M.score) from Marks M where M.studentid=:studentid")
	public Double averageScore(@Param("studentid") Long studentid);

	// Average score per student, used for ranking
	@Query("select M.studentid, avg(M.score) from Marks M group by M.studentid order by avg(M.score) desc")
	public List<Object[]> averageScoreAllStudents();
}
