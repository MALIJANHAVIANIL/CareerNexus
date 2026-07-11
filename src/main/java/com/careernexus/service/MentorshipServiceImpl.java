package com.careernexus.service;

import java.util.List;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.careernexus.dto.MentorshipDTO;
import com.careernexus.entity.AlumniProfile;
import com.careernexus.entity.MentorshipRequest;
import com.careernexus.entity.MentorshipStatus;
import com.careernexus.entity.NotificationType;
import com.careernexus.entity.StudentProfile;
import com.careernexus.exception.BadRequestException;
import com.careernexus.exception.ResourceNotFoundException;
import com.careernexus.exception.UnauthorizedException;
import com.careernexus.repository.AlumniProfileRepository;
import com.careernexus.repository.MentorshipRequestRepository;
import com.careernexus.repository.StudentProfileRepository;

@Service
public class MentorshipServiceImpl implements MentorshipService {

    private final MentorshipRequestRepository mentorshipRequestRepository;
    private final StudentProfileRepository studentProfileRepository;
    private final AlumniProfileRepository alumniProfileRepository;
    private final NotificationService notificationService;
    private final AuditLogService auditLogService;

    public MentorshipServiceImpl(MentorshipRequestRepository mentorshipRequestRepository,
                                 StudentProfileRepository studentProfileRepository,
                                 AlumniProfileRepository alumniProfileRepository,
                                 NotificationService notificationService,
                                 AuditLogService auditLogService) {
        this.mentorshipRequestRepository = mentorshipRequestRepository;
        this.studentProfileRepository = studentProfileRepository;
        this.alumniProfileRepository = alumniProfileRepository;
        this.notificationService = notificationService;
        this.auditLogService = auditLogService;
    }

    private MentorshipDTO.MentorshipResponseDTO mapToResponse(MentorshipRequest request) {
        return new MentorshipDTO.MentorshipResponseDTO(
                request.getId(),
                request.getStudent().getId(),
                request.getStudent().getUser().getFullName(),
                request.getMentor().getId(),
                request.getMentor().getUser().getFullName(),
                request.getStatus(),
                request.getMessage(),
                request.getResponse(),
                request.getCreatedAt(),
                request.getUpdatedAt()
        );
    }

    @Override
    @Transactional
    public MentorshipDTO.MentorshipResponseDTO requestMentorship(Long studentUserId, MentorshipDTO.MentorshipRequestDTO request) {
    	StudentProfile student = studentProfileRepository.findByUserId(studentUserId)
    	        .orElseThrow(() -> new ResourceNotFoundException(
    	                "Student profile not found for User ID: " + studentUserId));

    	AlumniProfile mentor = alumniProfileRepository.findByUserId(request.mentorId())
    	        .orElseThrow(() -> new ResourceNotFoundException(
    	                "Mentor profile not found with User ID: " + request.mentorId()));
        MentorshipRequest mentorshipRequest = MentorshipRequest.builder()
                .student(student)
                .mentor(mentor)
                .message(request.message())
                .status(MentorshipStatus.PENDING)
                .build();

        MentorshipRequest saved = mentorshipRequestRepository.save(mentorshipRequest);

        // Notify mentor (Alumni)
        notificationService.createNotification(
                mentor.getUser(),
                student.getUser().getFullName() + " sent you a mentorship request.",
                NotificationType.MENTORSHIP
        );

        auditLogService.log("REQUEST_MENTORSHIP", student.getUser(), "Mentorship requested from Alumni ID: " + request.mentorId());

        return mapToResponse(saved);
    }

    @Override
    @Transactional
    public MentorshipDTO.MentorshipResponseDTO respondToRequest(Long alumniUserId, Long requestId, MentorshipDTO.MentorshipActionDTO action) {
        AlumniProfile mentor = alumniProfileRepository.findByUserId(alumniUserId)
                .orElseThrow(() -> new ResourceNotFoundException("Mentor profile not found"));

        MentorshipRequest request = mentorshipRequestRepository.findById(requestId)
                .orElseThrow(() -> new ResourceNotFoundException("Mentorship request not found with ID: " + requestId));

        if (!request.getMentor().getUser().getId().equals(alumniUserId)) {
            throw new UnauthorizedException("You are not authorized to respond to this request");
        }

        if (request.getStatus() != MentorshipStatus.PENDING) {
            throw new BadRequestException("This request has already been processed");
        }

        request.setStatus(action.status());
        request.setResponse(action.response());

        MentorshipRequest saved = mentorshipRequestRepository.save(request);

        // Notify Student
        notificationService.createNotification(
                request.getStudent().getUser(),
                mentor.getUser().getFullName() + " has " + action.status().toString().toLowerCase() + " your mentorship request.",
                NotificationType.MENTORSHIP
        );

        auditLogService.log("RESPOND_MENTORSHIP", mentor.getUser(), "Responded to mentorship request ID " + requestId + " with status: " + action.status());

        return mapToResponse(saved);
    }
@Override
@Transactional(readOnly = true)
public List<MentorshipDTO.MentorshipResponseDTO> getStudentRequests(Long studentUserId) {
    return mentorshipRequestRepository.findByStudent_User_Id(studentUserId)
            .stream()
            .map(this::mapToResponse)
            .collect(Collectors.toList());
}

@Override
@Transactional(readOnly = true)
public List<MentorshipDTO.MentorshipResponseDTO> getMentorRequests(Long alumniUserId) {
    return mentorshipRequestRepository.findByMentor_User_Id(alumniUserId)
            .stream()
            .map(this::mapToResponse)
            .collect(Collectors.toList());
}
}
