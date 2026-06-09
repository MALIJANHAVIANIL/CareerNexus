package com.careernexus.service;

import com.careernexus.dto.EventDTO;
import com.careernexus.entity.*;
import com.careernexus.exception.BadRequestException;
import com.careernexus.exception.ResourceNotFoundException;
import com.careernexus.repository.CompanyRepository;
import com.careernexus.repository.EventRegistrationRepository;
import com.careernexus.repository.EventRepository;
import com.careernexus.repository.StudentProfileRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class EventServiceImpl implements EventService {

    private final EventRepository eventRepository;
    private final EventRegistrationRepository eventRegistrationRepository;
    private final CompanyRepository companyRepository;
    private final StudentProfileRepository studentProfileRepository;
    private final NotificationService notificationService;
    private final AuditLogService auditLogService;

    public EventServiceImpl(EventRepository eventRepository, EventRegistrationRepository eventRegistrationRepository,
                            CompanyRepository companyRepository, StudentProfileRepository studentProfileRepository,
                            NotificationService notificationService, AuditLogService auditLogService) {
        this.eventRepository = eventRepository;
        this.eventRegistrationRepository = eventRegistrationRepository;
        this.companyRepository = companyRepository;
        this.studentProfileRepository = studentProfileRepository;
        this.notificationService = notificationService;
        this.auditLogService = auditLogService;
    }

    private EventDTO.EventResponse mapToResponse(Event event) {
        return new EventDTO.EventResponse(
                event.getId(),
                event.getTitle(),
                event.getDescription(),
                event.getCompany() != null ? event.getCompany().getId() : null,
                event.getCompany() != null ? event.getCompany().getName() : null,
                event.getSpeaker(),
                event.getStartTime(),
                event.getEndTime(),
                event.getLocation(),
                event.getCreatedAt()
        );
    }

    @Override
    @Transactional
    public EventDTO.EventResponse createEvent(EventDTO.EventRequest request) {
        Company company = null;
        if (request.companyId() != null) {
            company = companyRepository.findById(request.companyId())
                    .orElseThrow(() -> new ResourceNotFoundException("Company not found with ID: " + request.companyId()));
        }

        Event event = Event.builder()
                .title(request.title())
                .description(request.description())
                .company(company)
                .speaker(request.speaker())
                .startTime(request.startTime())
                .endTime(request.endTime())
                .location(request.location())
                .build();

        Event saved = eventRepository.save(event);

        auditLogService.log("CREATE_EVENT", null, "New event created: " + saved.getTitle());

        return mapToResponse(saved);
    }

    @Override
    @Transactional(readOnly = true)
    public EventDTO.EventResponse getEvent(Long eventId) {
        Event event = eventRepository.findById(eventId)
                .orElseThrow(() -> new ResourceNotFoundException("Event not found with ID: " + eventId));
        return mapToResponse(event);
    }

    @Override
    @Transactional(readOnly = true)
    public List<EventDTO.EventResponse> getAllEvents() {
        return eventRepository.findAll().stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public void registerForEvent(Long studentUserId, Long eventId) {
        StudentProfile student = studentProfileRepository.findById(studentUserId)
                .orElseThrow(() -> new ResourceNotFoundException("Student Profile not found"));

        Event event = eventRepository.findById(eventId)
                .orElseThrow(() -> new ResourceNotFoundException("Event not found"));

        if (eventRegistrationRepository.existsByEventIdAndStudentId(eventId, studentUserId)) {
            throw new BadRequestException("You are already registered for this event");
        }

        EventRegistration registration = EventRegistration.builder()
                .event(event)
                .student(student)
                .build();

        eventRegistrationRepository.save(registration);

        // Notify Student
        notificationService.createNotification(
                student.getUser(),
                "Successfully registered for event: " + event.getTitle(),
                NotificationType.EVENT
        );

        auditLogService.log("REGISTER_EVENT", student.getUser(), "Registered for Event ID: " + eventId);
    }

    @Override
    @Transactional(readOnly = true)
    public List<EventDTO.EventResponse> getStudentRegisteredEvents(Long studentUserId) {
        return eventRegistrationRepository.findByStudentId(studentUserId).stream()
                .map(reg -> mapToResponse(reg.getEvent()))
                .collect(Collectors.toList());
    }
}
