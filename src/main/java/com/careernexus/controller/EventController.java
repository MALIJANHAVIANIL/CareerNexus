package com.careernexus.controller;

import com.careernexus.dto.EventDTO;
import com.careernexus.security.CustomUserDetails;
import com.careernexus.service.EventService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/events")
public class EventController {

    private final EventService eventService;

    public EventController(EventService eventService) {
        this.eventService = eventService;
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('HR', 'ADMIN')")
    public ResponseEntity<EventDTO.EventResponse> createEvent(@Valid @RequestBody EventDTO.EventRequest request) {
        return ResponseEntity.ok(eventService.createEvent(request));
    }

    @GetMapping("/{id}")
    public ResponseEntity<EventDTO.EventResponse> getEvent(@PathVariable Long id) {
        return ResponseEntity.ok(eventService.getEvent(id));
    }

    @GetMapping
    public ResponseEntity<List<EventDTO.EventResponse>> getAllEvents() {
        return ResponseEntity.ok(eventService.getAllEvents());
    }

    @PostMapping("/{eventId}/register")
    @PreAuthorize("hasRole('STUDENT')")
    public ResponseEntity<Void> registerForEvent(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @PathVariable Long eventId) {
        eventService.registerForEvent(userDetails.getId(), eventId);
        return ResponseEntity.ok().build();
    }

    @GetMapping("/registered")
    @PreAuthorize("hasRole('STUDENT')")
    public ResponseEntity<List<EventDTO.EventResponse>> getStudentRegisteredEvents(@AuthenticationPrincipal CustomUserDetails userDetails) {
        return ResponseEntity.ok(eventService.getStudentRegisteredEvents(userDetails.getId()));
    }
}
