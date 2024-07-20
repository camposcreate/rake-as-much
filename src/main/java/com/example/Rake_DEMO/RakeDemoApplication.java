package com.example.Rake_DEMO;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication(scanBasePackages = {"com.example.Rake_DEMO", "controller", "service"})
public class RakeDemoApplication {

	public static void main(String[] args) {

		SpringApplication.run(RakeDemoApplication.class, args);
	}
}
