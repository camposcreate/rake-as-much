package com.example.Rake_DEMO.controller;
import com.example.Rake_DEMO.service.RakeService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api")
public class RakeController {

    @Autowired
    private RakeService rakeService;

    @PostMapping("/extractKeywords")
    public ResponseEntity<List<String>> extractKeywords(@RequestBody Map<String, String> requestBody) {
        String text = requestBody.get("text");
        List<String> keywords = rakeService.extractKeywords(text);
        return ResponseEntity.ok(keywords);
    }
}
