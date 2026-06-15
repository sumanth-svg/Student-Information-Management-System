package mth.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import mth.models.Students;

@Repository
public interface StudentsRepository extends JpaRepository<Students, Long> {

	@Query("select S.id from Students S where S.rollno=:rollno")
	public Object checkByRollno(@Param("rollno") String rollno);

	@Query("select S from Students S where lower(S.name) like concat('%', lower(:key), '%') or lower(S.rollno) like concat('%', lower(:key), '%') or lower(S.department) like concat('%', lower(:key), '%')")
	public List<Object> searchStudent(@Param("key") String key);
}
