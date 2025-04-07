package net.geoffcox.agarioclone;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableScheduling
public class AgarioCloneApplication {

	public static void main(String[] args) {
		SpringApplication.run(AgarioCloneApplication.class, args);
	}

}
