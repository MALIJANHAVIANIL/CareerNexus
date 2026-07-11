package com.careernexus.service;

import com.careernexus.dto.TpoDTO;
import com.careernexus.entity.*;
import com.careernexus.exception.ResourceNotFoundException;
import com.careernexus.repository.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class TpoServiceImpl implements TpoService {

    private final UserRepository userRepository;
    private final StudentProfileRepository studentProfileRepository;
    private final AlumniProfileRepository alumniProfileRepository;
    private final HrProfileRepository hrProfileRepository;
    private final CompanyRepository companyRepository;
    private final JobApplicationRepository jobApplicationRepository;
    private final AuditLogService auditLogService;

    public TpoServiceImpl(
            UserRepository userRepository,
            StudentProfileRepository studentProfileRepository,
            AlumniProfileRepository alumniProfileRepository,
            HrProfileRepository hrProfileRepository,
            CompanyRepository companyRepository,
            JobApplicationRepository jobApplicationRepository,
            AuditLogService auditLogService) {

        this.userRepository = userRepository;
        this.studentProfileRepository = studentProfileRepository;
        this.alumniProfileRepository = alumniProfileRepository;
        this.hrProfileRepository = hrProfileRepository;
        this.companyRepository = companyRepository;
        this.jobApplicationRepository = jobApplicationRepository;
        this.auditLogService = auditLogService;
    }

    @Override
    @Transactional(readOnly = true)
    public TpoDTO.TpoStatsResponse getStats() {
        long totalStudents = studentProfileRepository.count();
        
        // Count unique students with status SELECTED
        long placedStudents = studentProfileRepository.countUniqueStudentsWithApplicationStatus(JobApplicationStatus.SELECTED);

        long activeRecruiters = companyRepository.count();

        long approvedMentors = alumniProfileRepository.countVerifiedAlumni();

        int placementRate = totalStudents > 0 ? (int) ((placedStudents * 100) / totalStudents) : 0;

        return new TpoDTO.TpoStatsResponse(
                placementRate,
                placedStudents,
                activeRecruiters,
                approvedMentors
        );
    }

    @Override
    @Transactional(readOnly = true)
    public List<TpoDTO.AlumniVerificationResponse> getPendingAlumni() {
        return alumniProfileRepository.findPendingAlumni().stream()
                .map(ap -> new TpoDTO.AlumniVerificationResponse(
                        ap.getId(),
                        ap.getUser().getFullName(),
                        ap.getUser().getEmail(),
                        ap.getCurrentCompany(),
                        ap.getCurrentRole(),
                        ap.getGraduationYear(),
                        ap.getUser().getEmail() // fallback to email or dummy if prn is missing
                ))
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public void approveAlumni(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Alumni user not found with ID: " + userId));
        user.setIsVerified(true);
        userRepository.save(user);
        auditLogService.log("APPROVE_ALUMNI", user, "Alumni mentor approved by TPO");
    }

    @Override
    @Transactional
    public void rejectAlumni(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Alumni user not found with ID: " + userId));
        user.setIsActive(false);
        userRepository.save(user);
        auditLogService.log("REJECT_ALUMNI", user, "Alumni registration rejected/deactivated by TPO");
    }

    @Override
    @Transactional
    public void deactivateHr(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("HR user not found with ID: " + userId));
        user.setIsActive(false);
        userRepository.save(user);
        auditLogService.log("DEACTIVATE_HR", user, "HR Recruiter account deactivated by TPO");
    }

    @Override
    @Transactional
    public void assignHr(TpoDTO.HrAssignmentRequest request) {
        User hrUser = userRepository.findById(request.hrUserId())
                .orElseThrow(() -> new ResourceNotFoundException("HR User not found with ID: " + request.hrUserId()));
        
        Company company = companyRepository.findById(request.companyId())
                .orElseThrow(() -> new ResourceNotFoundException("Company not found with ID: " + request.companyId()));

        HrProfile hrProfile = hrProfileRepository.findByUserId(request.hrUserId())
                .orElse(new HrProfile());

        hrProfile.setUser(hrUser);
        hrProfile.setCompany(company);
        hrProfileRepository.save(hrProfile);

        hrUser.setIsVerified(true);
        userRepository.save(hrUser);

        auditLogService.log("ASSIGN_HR_TO_COMPANY", hrUser, "HR assigned to company: " + company.getName());
    }

    @Override
    @Transactional(readOnly = true)
    public String generateReportCsv(String type) {
        StringBuilder csv = new StringBuilder();
        
        if ("PLACED".equalsIgnoreCase(type) || "STUDENT".equalsIgnoreCase(type)) {
            csv.append("Student Name,Email,Department,Roll Number,CGPA,Placement Status\n");
            for (StudentProfile sp : studentProfileRepository.findAll()) {
                boolean isPlaced = sp.getJobApplications().stream()
                        .anyMatch(app -> app.getStatus() == JobApplicationStatus.SELECTED);
                
                if ("PLACED".equalsIgnoreCase(type) && !isPlaced) {
                    continue;
                }

                csv.append(String.format("\"%s\",\"%s\",\"%s\",\"%s\",%.2f,\"%s\"\n",
                        sp.getUser().getFullName(),
                        sp.getUser().getEmail(),
                        sp.getDepartment() != null ? sp.getDepartment() : "N/A",
                        sp.getRollNumber() != null ? sp.getRollNumber() : "N/A",
                        sp.getCgpa() != null ? sp.getCgpa() : 0.0,
                        isPlaced ? "PLACED" : "UNPLACED"
                ));
            }
        } else if ("COMPANY".equalsIgnoreCase(type)) {
            csv.append("Company Name,Industry,Total Posted Jobs\n");
            for (Company c : companyRepository.findAll()) {
                csv.append(String.format("\"%s\",\"%s\",%d\n",
                        c.getName(),
                        c.getIndustry(),
                        c.getJobs() != null ? c.getJobs().size() : 0
                ));
            }
        } else if ("PENDING_APPLICATIONS".equalsIgnoreCase(type)) {
            csv.append("Candidate Name,Email,Job Title,Company,Status,Applied At\n");
            for (JobApplication app : jobApplicationRepository.findAll()) {
                if (app.getStatus() == JobApplicationStatus.APPLIED || app.getStatus() == JobApplicationStatus.SHORTLISTED) {
                    csv.append(String.format("\"%s\",\"%s\",\"%s\",\"%s\",\"%s\",\"%s\"\n",
                            app.getStudent().getUser().getFullName(),
                            app.getStudent().getUser().getEmail(),
                            app.getJob().getTitle(),
                            app.getJob().getCompany().getName(),
                            app.getStatus(),
                            app.getAppliedAt()
                    ));
                }
            }
        } else {
            // Default General Report
            csv.append("Metric,Value\n");
            TpoDTO.TpoStatsResponse stats = getStats();
            csv.append(String.format("Placement Rate,%d%%\n", stats.placementRate()));
            csv.append(String.format("Placed Students,%d\n", stats.placedStudents()));
            csv.append(String.format("Active Recruiters,%d\n", stats.activeRecruiters()));
            csv.append(String.format("Approved Alumni Mentors,%d\n", stats.approvedMentors()));
        }

        return csv.toString();
    }

    @Override
    @Transactional(readOnly = true)
    public List<TpoDTO.StudentTpoResponse> getAllStudents() {
        return studentProfileRepository.findAll().stream()
                .map(sp -> {
                    boolean isPlaced = sp.getJobApplications().stream()
                            .anyMatch(app -> app.getStatus() == JobApplicationStatus.SELECTED);
                    return new TpoDTO.StudentTpoResponse(
                            sp.getId(),
                            sp.getUser().getFullName(),
                            sp.getUser().getEmail(),
                            sp.getRollNumber(),
                            sp.getDepartment(),
                            sp.getCgpa(),
                            sp.getGraduationYear(),
                            isPlaced ? "PLACED" : "UNPLACED"
                    );
                })
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<TpoDTO.AlumniTpoResponse> getAllAlumni() {
        return alumniProfileRepository.findAll().stream()
                .map(ap -> new TpoDTO.AlumniTpoResponse(
                        ap.getId(),
                        ap.getUser().getFullName(),
                        ap.getUser().getEmail(),
                        ap.getCurrentCompany(),
                        ap.getCurrentRole(),
                        ap.getGraduationYear(),
                        ap.getUser().getIsVerified()
                ))
                .collect(Collectors.toList());
    }
}
