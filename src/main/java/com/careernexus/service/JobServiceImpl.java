package com.careernexus.service;

import com.careernexus.dto.JobDTO;
import com.careernexus.entity.*;
import com.careernexus.exception.BadRequestException;
import com.careernexus.exception.ResourceNotFoundException;
import com.careernexus.exception.UnauthorizedException;
import com.careernexus.repository.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class JobServiceImpl implements JobService {

    private final JobRepository jobRepository;
    private final HrProfileRepository hrProfileRepository;
    private final CompanyRepository companyRepository;
    private final StudentProfileRepository studentProfileRepository;
    private final SavedJobRepository savedJobRepository;
    private final AuditLogService auditLogService;

    public JobServiceImpl(JobRepository jobRepository, HrProfileRepository hrProfileRepository,
                          CompanyRepository companyRepository, StudentProfileRepository studentProfileRepository,
                          SavedJobRepository savedJobRepository, AuditLogService auditLogService) {
        this.jobRepository = jobRepository;
        this.hrProfileRepository = hrProfileRepository;
        this.companyRepository = companyRepository;
        this.studentProfileRepository = studentProfileRepository;
        this.savedJobRepository = savedJobRepository;
        this.auditLogService = auditLogService;
    }

    private JobDTO.JobResponse mapToResponse(Job job) {
        JobDTO.JobEligibilityDTO eligibilityDTO = null;
        if (job.getJobEligibility() != null) {
            eligibilityDTO = new JobDTO.JobEligibilityDTO(
                    job.getJobEligibility().getMinimumCgpa(),
                    job.getJobEligibility().getEligibleDepartments(),
                    job.getJobEligibility().getGraduationYears(),
                    job.getJobEligibility().isBacklogsAllowed()
            );
        }

        return new JobDTO.JobResponse(
                job.getId(),
                job.getTitle(),
                job.getDescription(),
                job.getCompany().getId(),
                job.getCompany().getName(),
                job.getPostedBy().getId(),
                job.getPostedBy().getUser().getFullName(),
                job.getLocation(),
                job.getSalaryRange(),
                job.getJobType(),
                job.getCreatedAt(),
                job.getDeadline(),
                eligibilityDTO
        );
    }

    @Override
    @Transactional
    public JobDTO.JobResponse postJob(Long hrUserId, JobDTO.JobRequest request) {
        HrProfile hrProfile = hrProfileRepository.findById(hrUserId)
                .orElseThrow(() -> new ResourceNotFoundException("HR Profile not found for User ID: " + hrUserId));

        Company company = companyRepository.findById(request.companyId())
                .orElseThrow(() -> new ResourceNotFoundException("Company not found with ID: " + request.companyId()));

        // Check if HR belongs to the company they are posting for
        if (hrProfile.getCompany() == null || !hrProfile.getCompany().getId().equals(company.getId())) {
            throw new UnauthorizedException("You are not authorized to post a job on behalf of " + company.getName());
        }

        Job job = Job.builder()
                .title(request.title())
                .description(request.description())
                .company(company)
                .postedBy(hrProfile)
                .location(request.location())
                .salaryRange(request.salaryRange())
                .jobType(request.jobType())
                .deadline(request.deadline())
                .build();

        if (request.eligibility() != null) {
            JobEligibility eligibility = JobEligibility.builder()
                    .job(job)
                    .minimumCgpa(request.eligibility().minimumCgpa())
                    .eligibleDepartments(request.eligibility().eligibleDepartments())
                    .graduationYears(request.eligibility().graduationYears())
                    .backlogsAllowed(request.eligibility().backlogsAllowed())
                    .build();
            job.setJobEligibility(eligibility);
        }

        Job saved = jobRepository.save(job);

        auditLogService.log("POST_JOB", hrProfile.getUser(), "Job posted: " + saved.getTitle() + " at " + company.getName());

        return mapToResponse(saved);
    }

    @Override
    @Transactional(readOnly = true)
    public JobDTO.JobResponse getJob(Long jobId) {
        Job job = jobRepository.findById(jobId)
                .orElseThrow(() -> new ResourceNotFoundException("Job not found with ID: " + jobId));
        return mapToResponse(job);
    }

    @Override
    @Transactional(readOnly = true)
    public List<JobDTO.JobResponse> getAllJobs() {
        return jobRepository.findAll().stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<JobDTO.JobResponse> getJobsByCompany(Long companyId) {
        return jobRepository.findByCompanyId(companyId).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public void deleteJob(Long hrUserId, Long jobId) {
        Job job = jobRepository.findById(jobId)
                .orElseThrow(() -> new ResourceNotFoundException("Job not found with ID: " + jobId));

        // Let either the poster HR or an ADMIN delete it.
        HrProfile hrProfile = hrProfileRepository.findById(hrUserId).orElse(null);

        if (hrProfile != null && !job.getPostedBy().getId().equals(hrProfile.getId())) {
            throw new UnauthorizedException("You are not authorized to delete this job posting");
        }

        jobRepository.delete(job);

        User performer = hrProfile != null ? hrProfile.getUser() : null;
        auditLogService.log("DELETE_JOB", performer, "Deleted job ID: " + jobId);
    }

    @Override
    @Transactional
    public void saveJob(Long studentUserId, Long jobId) {
        StudentProfile studentProfile = studentProfileRepository.findById(studentUserId)
                .orElseThrow(() -> new ResourceNotFoundException("Student Profile not found"));

        Job job = jobRepository.findById(jobId)
                .orElseThrow(() -> new ResourceNotFoundException("Job not found"));

        if (savedJobRepository.existsByStudentIdAndJobId(studentUserId, jobId)) {
            throw new BadRequestException("Job is already saved");
        }

        SavedJob savedJob = SavedJob.builder()
                .student(studentProfile)
                .job(job)
                .build();

        savedJobRepository.save(savedJob);

        auditLogService.log("SAVE_JOB", studentProfile.getUser(), "Saved job ID: " + jobId);
    }

    @Override
    @Transactional
    public void unsaveJob(Long studentUserId, Long jobId) {
        SavedJob savedJob = savedJobRepository.findByStudentIdAndJobId(studentUserId, jobId)
                .orElseThrow(() -> new ResourceNotFoundException("Saved job bookmark not found"));

        savedJobRepository.delete(savedJob);

        StudentProfile studentProfile = studentProfileRepository.findById(studentUserId).orElse(null);
        User performer = studentProfile != null ? studentProfile.getUser() : null;
        auditLogService.log("UNSAVE_JOB", performer, "Unsaved job ID: " + jobId);
    }

    @Override
    @Transactional(readOnly = true)
    public List<JobDTO.JobResponse> getSavedJobs(Long studentUserId) {
        return savedJobRepository.findByStudentId(studentUserId).stream()
                .map(savedJob -> mapToResponse(savedJob.getJob()))
                .collect(Collectors.toList());
    }
}
