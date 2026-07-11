package com.careernexus.controller;

import com.careernexus.dto.TpoDTO;
import com.careernexus.service.TpoService;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/tpo")
@PreAuthorize("hasRole('ADMIN')")
public class TpoController {

    private final TpoService tpoService;

    public TpoController(TpoService tpoService) {
        this.tpoService = tpoService;
    }

    @GetMapping("/stats")
    public ResponseEntity<TpoDTO.TpoStatsResponse> getStats() {
        return ResponseEntity.ok(tpoService.getStats());
    }

    @GetMapping("/students")
    public ResponseEntity<List<TpoDTO.StudentTpoResponse>> getAllStudents() {
        return ResponseEntity.ok(tpoService.getAllStudents());
    }

    @GetMapping("/alumni")
    public ResponseEntity<List<TpoDTO.AlumniTpoResponse>> getAllAlumni() {
        return ResponseEntity.ok(tpoService.getAllAlumni());
    }

    @GetMapping("/pending-alumni")
    public ResponseEntity<List<TpoDTO.AlumniVerificationResponse>> getPendingAlumni() {
        return ResponseEntity.ok(tpoService.getPendingAlumni());
    }

    @PostMapping("/approve-alumni/{userId}")
    public ResponseEntity<Void> approveAlumni(@PathVariable Long userId) {
        tpoService.approveAlumni(userId);
        return ResponseEntity.ok().build();
    }

    @PostMapping("/reject-alumni/{userId}")
    public ResponseEntity<Void> rejectAlumni(@PathVariable Long userId) {
        tpoService.rejectAlumni(userId);
        return ResponseEntity.ok().build();
    }

    @PostMapping("/hr/deactivate/{userId}")
    public ResponseEntity<Void> deactivateHr(@PathVariable Long userId) {
        tpoService.deactivateHr(userId);
        return ResponseEntity.ok().build();
    }

    @PostMapping("/hr/assign")
    public ResponseEntity<Void> assignHr(@jakarta.validation.Valid @RequestBody TpoDTO.HrAssignmentRequest request) {
        tpoService.assignHr(request);
        return ResponseEntity.ok().build();
    }

    @GetMapping("/reports/download")
    public ResponseEntity<byte[]> downloadReport(@RequestParam(defaultValue = "GENERAL") String type) {
        String csvContent = tpoService.generateReportCsv(type);
        byte[] csvBytes = csvContent.getBytes();

        String filename = String.format("careernexus_report_%s.csv", type.toLowerCase());

        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + filename + "\"")
                .contentType(MediaType.parseMediaType("text/csv"))
                .body(csvBytes);
    }
}
