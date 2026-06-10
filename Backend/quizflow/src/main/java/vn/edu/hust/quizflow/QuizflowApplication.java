package vn.edu.hust.quizflow;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableScheduling
public class QuizflowApplication {

	public static void main(String[] args) {
		SpringApplication.run(QuizflowApplication.class, args);
	}

}
