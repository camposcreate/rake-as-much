package com.example.Rake_DEMO.service;

import com.google.common.reflect.ClassPath;
import edu.ehu.galan.rake.RakeAlgorithm;
import edu.ehu.galan.rake.model.Document;
import edu.ehu.galan.rake.model.Term;
import org.springframework.core.io.ClassPathResource;
import org.springframework.core.io.Resource;
import org.springframework.stereotype.Service;

import java.io.File;
import java.io.IOException;
import java.util.List;
import java.util.stream.Collectors;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Paths;
import java.nio.file.Path;
import java.util.ArrayList;

@Service
public class RakeService {

    public List<String> extractKeywords(String text) {
        // 'text' input text, not file path
        Document document = new Document(text);
        RakeAlgorithm rakeAlgorithm = new RakeAlgorithm();
        Path stopWordsPath = Paths.get("src/main/resources/stopLists/SmartStopListEn");
        try {
            List<String> stopWords = Files.readAllLines(stopWordsPath);
            rakeAlgorithm.loadStopWordsList(stopWords);
        } catch (IOException e) {
            throw new RuntimeException("Failed to load stop words", e);
        }

        // extract keywords from input text
        rakeAlgorithm.init(document, null);
        rakeAlgorithm.runAlgorithm();

        // return keywords
        List<Term> terms = document.getTermList();
        return terms.stream().map(Term::getTerm).collect(Collectors.toList());
    }
}