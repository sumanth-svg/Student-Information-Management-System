package mth.services;

import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.time.Duration;
import java.util.Map;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import com.fasterxml.jackson.databind.ObjectMapper;

/**
 * Pushes academic events (marks updates, attendance updates, analytics requests)
 * to the Node task service so they are persisted in the MongoDB performance_logs
 * collection. Logging is best-effort: a failure here must never break the main
 * PostgreSQL write, so all exceptions are swallowed and only logged to console.
 */
@Service
public class PerformanceLogService {

	@Value("${taskservice.url:http://localhost:8002}")
	private String taskServiceUrl;

	private final HttpClient client = HttpClient.newBuilder()
			.connectTimeout(Duration.ofSeconds(5))
			.build();

	private final ObjectMapper mapper = new ObjectMapper();

	/**
	 * Send a performance log event to MongoDB via the Node service.
	 *
	 * @param studentid the student the event relates to
	 * @param eventtype e.g. "MARKS_UPDATE", "ATTENDANCE_UPDATE"
	 * @param details   free-form details map describing the event
	 */
	public void log(Long studentid, String eventtype, Map<String, Object> details) {
		try {
			Map<String, Object> body = Map.of(
					"studentid", studentid,
					"eventtype", eventtype,
					"details", details == null ? Map.of() : details
			);

			HttpRequest request = HttpRequest.newBuilder()
					.uri(URI.create(taskServiceUrl + "/academic/performancelog"))
					.timeout(Duration.ofSeconds(5))
					.header("Content-Type", "application/json")
					.POST(HttpRequest.BodyPublishers.ofString(mapper.writeValueAsString(body)))
					.build();

			// Fire asynchronously so the academic write is never blocked by logging.
			client.sendAsync(request, HttpResponse.BodyHandlers.discarding());
		} catch (Exception e) {
			System.out.println("PerformanceLog skipped (taskservice unavailable): " + e.getMessage());
		}
	}
}
