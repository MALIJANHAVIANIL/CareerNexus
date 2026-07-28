package com.careernexus.controller;

import com.careernexus.dto.NotificationDTO;
import com.careernexus.security.CustomUserDetails;
import com.careernexus.service.NotificationService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/notifications")
public class NotificationController {

    private final NotificationService notificationService;

    public NotificationController(NotificationService notificationService) {
        this.notificationService = notificationService;
    }

    @GetMapping
    public ResponseEntity<List<NotificationDTO.NotificationResponse>> getUserNotifications(
            @AuthenticationPrincipal CustomUserDetails userDetails) {
        return ResponseEntity.ok(notificationService.getUserNotifications(userDetails.getId()));
    }

    @PutMapping("/{id}/read")
    public ResponseEntity<Void> markAsRead(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @PathVariable Long id) {
        notificationService.markAsRead(userDetails.getId(), id);
        return ResponseEntity.ok().build();
    }

    @PostMapping("/broadcast-hr")
    @org.springframework.security.access.prepost.PreAuthorize("hasRole('HR')")
    public ResponseEntity<Void> broadcastHr(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @RequestBody java.util.Map<String, String> payload) {
        String msg = payload.get("message");
        if (msg == null || msg.trim().isEmpty()) {
            throw new com.careernexus.exception.BadRequestException("Message cannot be empty");
        }
        notificationService.createHrBroadcast(userDetails.getId(), msg);
        return ResponseEntity.ok().build();
    }

    @PostMapping("/schedule-test")
    @org.springframework.security.access.prepost.PreAuthorize("hasRole('HR')")
    public ResponseEntity<Void> scheduleTest(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @RequestBody java.util.Map<String, Object> payload) {
        Long jobId = Long.valueOf(payload.get("jobId").toString());
        String testDate = payload.get("testDate").toString();
        String testTime = payload.get("testTime").toString();
        String testLink = payload.get("testLink").toString();
        String instructions = payload.get("instructions").toString();
        notificationService.scheduleOnlineTest(userDetails.getId(), jobId, testDate, testTime, testLink, instructions);
        return ResponseEntity.ok().build();
    }
}
