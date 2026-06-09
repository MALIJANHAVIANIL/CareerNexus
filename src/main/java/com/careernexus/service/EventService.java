package com.careernexus.service;

import com.careernexus.dto.EventDTO;

import java.util.List;

public interface EventService {
    EventDTO.EventResponse createEvent(EventDTO.EventRequest request);
    EventDTO.EventResponse getEvent(Long eventId);
    List<EventDTO.EventResponse> getAllEvents();
    void registerForEvent(Long studentUserId, Long eventId);
    List<EventDTO.EventResponse> getStudentRegisteredEvents(Long studentUserId);
}
