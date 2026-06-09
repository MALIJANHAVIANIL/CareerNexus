package com.careernexus.service;

import com.careernexus.dto.JobApplicationDTO;
import com.careernexus.entity.*;
import com.careernexus.exception.BadRequestException;
import com.careernexus.exception.ResourceNotFoundException;
import com.careernexus.exception.UnauthorizedException;
import com.careernexus.repository.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class JobApplicationServiceImpl implements JobApplicationService {

    private final JobApplicationRepository jobApplicationRepository;
    private final JobRepository jobRepository;
    private final StudentProfileRepository studentProfileRepository;
    private final ResumeRepository resumeRepository;
    private final HrProfileRepository hrProfileRepository;
    private final AuditLogService auditLogService;
    private final NotificationService notificationService;

    public JobApplicationServiceImpl(JobApplicationRepository jobApplicationRepository, JobRepository jobRepository,
                                     StudentProfileRepository studentProfileRepository, ResumeRepository resumeRepository,
                                     HrProfileRepository hrProfileRepository, AuditLogService auditLogService,
                                     NotificationService notificationService) {
        this.jobApplicationRepository = jobApplicationRepository;
        this.jobRepository = jobRepository;
        this.studentProfileRepository = studentProfileRepository;
        this.resumeRepository = resumeRepository;
        this.hrProfileRepository = hrProfileRepository;
        this.auditLogService = auditLogService;
        this.notificationService = notificationService;
    }

    private JobApplicationDTO.JobApplicationResponse mapToResponse(JobApplication app) {
        return new JobApplicationDTO.JobApplicationResponse(
                app.getId(),
                app.getJob().getId(),
                app.getJob().getTitle(),
                app.getJob().getCompany().getName(),
                app.getStudent().getId(),
                app.getStudent().getUser().getFullName(),
                app.getResume().getId(),
                app.getResume().getFileName(),
                app.getStatus(),
                app.getFeedback(),
                app.getAppliedAt()
        );
    }

    @Override
    @Transactional
    public JobApplicationDTO.JobApplicationResponse apply(Long studentUserId, JobApplicationDTO.JobApplicationRequest request) {
        StudentProfile student = studentProfileRepository.findById(studentUserId)
                .orElseThrow(() -> new ResourceNotFoundException("Student profile not found for User ID: " + studentUserId));

        Job job = jobRepository.findById(request.jobId())
                .orElseThrow(() -> new ResourceNotFoundException("Job not found with ID: " + request.jobId()));

        Resume resume = resumeRepository.findById(request.resumeId())
                .orElseThrow(() -> new ResourceNotFoundException("Resume not found with ID: " + request.resumeId()));

        // Validate resume ownership
        if (!resume.getStudentProfile().getId().equals(studentUserId)) {
            throw new BadRequestException("This resume does not belong to you");
        }

        // Validate application deadline
        if (LocalDateTime.now().isAfter(job.getDeadline())) {
            throw new BadRequestException("The application deadline for this job has passed");
        }

        // Validate already applied
        if (jobApplicationRepository.existsByJobIdAndStudentId(request.jobId(), studentUserId)) {
            throw new BadRequestException("You have already applied for this job");
        }

        // Validate Eligibility Requirements
        JobEligibility eligibility = job.getJobEligibility();
        if (eligibility != null) {
            // CGPA check
            if (eligibility.getMinimumCgpa() != null && student.getCgpa() < eligibility.getMinimumCgpa()) {
                throw new BadRequestException("You do not meet the minimum CGPA requirement of " + eligibility.getMinimumCgpa());
            }

            // Department check
            if (eligibility.getEligibleDepartments() != null && !eligibility.getEligibleDepartments().isBlank()) {
                String deps = eligibility.getEligibleDepartments().toLowerCase();
                String studentDep = student.getDepartment().toLowerCase();
                if (!deps.contains(studentDep)) {
                    throw new BadRequestException("Your department (" + student.getDepartment() + ") is not eligible for this job");
                }
            }

            // Graduation Year check
            if (eligibility.getGraduationYears() != null && !eligibility.getGraduationYears().isBlank()) {
                String years = eligibility.getGraduationYears();
                String studentYear = String.valueOf(student.getGraduationYear());
                if (!years.contains(studentYear)) {
                    throw new BadRequestException("Your graduation year (" + studentYear + ") is not eligible for this job");
                }
            }
        }

        JobApplication application = JobApplication.builder()
                .job(job)
                .student(student)
                .resume(resume)
                .status(JobApplicationStatus.APPLIED)
                .build();

        JobApplication saved = jobApplicationRepository.save(application);

        // Notify HR
        notificationService.createNotification(
                job.getPostedBy().getUser(),
                student.getUser().getFullName() + " applied for your job posting: " + job.getTitle(),
                NotificationType.JOB_ALERT
        );

        auditLogService.log("APPLY_JOB", student.getUser(), "Applied for job: " + job.getTitle() + " (Application ID: " + saved.getId() + ")");

        return mapToResponse(saved);
    }

    @Override
    @Transactional
    public JobApplicationDTO.JobApplicationResponse updateStatus(Long hrUserId, Long applicationId, JobApplicationDTO.ApplicationStatusUpdateRequest request) {
        HrProfile hrProfile = hrProfileRepository.findById(hrUserId)
                .orElseThrow(() -> new ResourceNotFoundException("HR Profile not found for User ID: " + hrUserId));

        JobApplication application = jobApplicationRepository.findById(applicationId)
                .orElseThrow(() -> new ResourceNotFoundException("Job Application not found with ID: " + applicationId));

        // Validate HR belongs to the posting company
        if (!application.getJob().getCompany().getId().equals(hrProfile.getCompany().getId())) {
            throw new UnauthorizedException("You are not authorized to update status for jobs of other companies");
        }

        application.setStatus(request.status());
        application.setFeedback(request.feedback());

        JobApplication saved = jobApplicationRepository.save(application);

        // Notify Student
        notificationService.createNotification(
                application.getStudent().getUser(),
                "Your application status for " + application.getJob().getTitle() + " has been updated to " + request.status(),
                NotificationType.JOB_ALERT
        );

        auditLogService.log("UPDATE_APPLICATION_STATUS", hrProfile.getUser(), "Updated Application ID " + applicationId + " status to " + request.status());

        return mapToResponse(saved);
    }

    @Override
    @Transactional(readOnly = true)
    public List<JobApplicationDTO.JobApplicationResponse> getStudentApplications(Long studentUserId) {
        return jobApplicationRepository.findByStudentId(studentUserId).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<JobApplicationDTO.JobApplicationResponse> getJobApplications(Long hrUserId, Long jobId) {
        HrProfile hrProfile = hrProfileRepository.findById(hrUserId)
                .orElseThrow(() -> new ResourceNotFoundException("HR Profile not found for User ID: " + hrUserId));

        Job job = jobRepository.findById(jobId)
                .orElseThrow(() -> new ResourceNotFoundException("Job not found"));

        if (!job.getCompany().getId().equals(hrProfile.getCompany().getId())) {
            throw new UnauthorizedException("You are not authorized to view applications for other companies' jobs");
        }

        return jobApplicationRepository.findByJobId(jobId).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }
}
