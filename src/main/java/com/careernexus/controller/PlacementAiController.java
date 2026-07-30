package com.careernexus.controller;

import com.careernexus.service.PlacementAiService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/tpo/ai-query")
@PreAuthorize("hasRole('ADMIN')")
public class PlacementAiController {

    private final PlacementAiService placementAiService;

    public PlacementAiController(PlacementAiService placementAiService) {
        this.placementAiService = placementAiService;
    }

    @PostMapping
    public ResponseEntity<Map<String, Object>> query(@RequestBody Map<String, Object> payload) {
        String queryText = (String) payload.get("query");
        String apiKey = (String) payload.get("apiKey");
        List<Map<String, String>> history = (List<Map<String, String>>) payload.get("history");
        
        if (queryText == null || queryText.trim().isEmpty()) {
            return ResponseEntity.badRequest().build();
        }
        return ResponseEntity.ok(placementAiService.query(queryText, apiKey, history));
    }
}
