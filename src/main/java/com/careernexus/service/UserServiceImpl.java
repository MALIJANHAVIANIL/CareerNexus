package com.careernexus.service;

import com.careernexus.dto.ProfileDTO;
import com.careernexus.entity.*;
import com.careernexus.exception.BadRequestException;
import com.careernexus.exception.ResourceNotFoundException;
import com.careernexus.repository.*;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class UserServiceImpl implements UserService {

    private final UserRepository userRepository;
    private final StudentProfileRepository studentProfileRepository;
    private final AlumniProfileRepository alumniProfileRepository;
    private final HrProfileRepository hrProfileRepository;
    private final AdminProfileRepository adminProfileRepository;
    private final CompanyRepository companyRepository;
    private final AuditLogService auditLogService;

    private static final ObjectMapper objectMapper = new ObjectMapper()
            .configure(com.fasterxml.jackson.databind.DeserializationFeature.FAIL_ON_UNKNOWN_PROPERTIES, false);

    // Helper records for JSON serialization / deserialization
    public record StudentInternshipDTO(String role, String company, String startDate, String endDate, String description) {}
    public record StudentProjectDTO(String title, String techStack, String description, String link) {}
    public record StudentCertificationDTO(String name, String issuer, String date) {}
    public record StudentSocialDTO(String linkedin, String github, String portfolio) {}

    public record AlumniProjectDTO(String title, String techStack, String description, String link) {}
    public record AlumniCertificationDTO(String name, String issuer, String date) {}
    public record AlumniSocialDTO(String linkedin, String github) {}

    public UserServiceImpl(UserRepository userRepository, StudentProfileRepository studentProfileRepository,
                           AlumniProfileRepository alumniProfileRepository, HrProfileRepository hrProfileRepository,
                           AdminProfileRepository adminProfileRepository, CompanyRepository companyRepository,
                           AuditLogService auditLogService) {
        this.userRepository = userRepository;
        this.studentProfileRepository = studentProfileRepository;
        this.alumniProfileRepository = alumniProfileRepository;
        this.hrProfileRepository = hrProfileRepository;
        this.adminProfileRepository = adminProfileRepository;
        this.companyRepository = companyRepository;
        this.auditLogService = auditLogService;
    }

    private ProfileDTO.UserProfileResponse mapToUserResponse(User user) {
        return new ProfileDTO.UserProfileResponse(user.getId(), user.getEmail(), user.getFullName(), user.getRole());
    }

    // Student Serialization Helpers
    private String serializeStudentInternships(List<StudentInternship> list) {
        if (list == null) return "[]";
        try {
            List<StudentInternshipDTO> dtos = list.stream()
                .map(item -> new StudentInternshipDTO(item.getRole(), item.getCompany(), item.getStartDate(), item.getEndDate(), item.getDescription()))
                .collect(Collectors.toList());
            return objectMapper.writeValueAsString(dtos);
        } catch (Exception e) {
            return "[]";
        }
    }

    private String serializeStudentProjects(List<StudentProject> list) {
        if (list == null) return "[]";
        try {
            List<StudentProjectDTO> dtos = list.stream()
                .map(item -> new StudentProjectDTO(item.getTitle(), item.getTechStack(), item.getDescription(), item.getLink()))
                .collect(Collectors.toList());
            return objectMapper.writeValueAsString(dtos);
        } catch (Exception e) {
            return "[]";
        }
    }

    private String serializeStudentLanguages(List<StudentLanguage> list) {
        if (list == null) return "[]";
        try {
            List<String> langs = list.stream()
                .map(StudentLanguage::getLanguage)
                .collect(Collectors.toList());
            return objectMapper.writeValueAsString(langs);
        } catch (Exception e) {
            return "[]";
        }
    }

    private String serializeStudentCertifications(List<StudentCertification> list) {
        if (list == null) return "[]";
        try {
            List<StudentCertificationDTO> dtos = list.stream()
                .map(item -> new StudentCertificationDTO(item.getName(), item.getIssuer(), item.getDate()))
                .collect(Collectors.toList());
            return objectMapper.writeValueAsString(dtos);
        } catch (Exception e) {
            return "[]";
        }
    }

    private String serializeStudentSocials(StudentSocialLink link) {
        if (link == null) {
            return "{\"linkedin\":\"\",\"github\":\"\",\"portfolio\":\"\"}";
        }
        try {
            return objectMapper.writeValueAsString(new StudentSocialDTO(link.getLinkedin(), link.getGithub(), link.getPortfolio()));
        } catch (Exception e) {
            return "{\"linkedin\":\"\",\"github\":\"\",\"portfolio\":\"\"}";
        }
    }

    // Alumni Serialization Helpers
    private String serializeAlumniProjects(List<AlumniProject> list) {
        if (list == null) return "[]";
        try {
            List<AlumniProjectDTO> dtos = list.stream()
                .map(item -> new AlumniProjectDTO(item.getTitle(), item.getTechStack(), item.getDescription(), item.getLink()))
                .collect(Collectors.toList());
            return objectMapper.writeValueAsString(dtos);
        } catch (Exception e) {
            return "[]";
        }
    }

    private String serializeAlumniLanguages(List<AlumniLanguage> list) {
        if (list == null) return "[]";
        try {
            List<String> langs = list.stream()
                .map(AlumniLanguage::getLanguage)
                .collect(Collectors.toList());
            return objectMapper.writeValueAsString(langs);
        } catch (Exception e) {
            return "[]";
        }
    }

    private String serializeAlumniCertifications(List<AlumniCertification> list) {
        if (list == null) return "[]";
        try {
            List<AlumniCertificationDTO> dtos = list.stream()
                .map(item -> new AlumniCertificationDTO(item.getName(), item.getIssuer(), item.getDate()))
                .collect(Collectors.toList());
            return objectMapper.writeValueAsString(dtos);
        } catch (Exception e) {
            return "[]";
        }
    }

    private String serializeAlumniSocials(AlumniSocialLink link) {
        if (link == null) {
            return "{\"linkedin\":\"\",\"github\":\"\"}";
        }
        try {
            return objectMapper.writeValueAsString(new AlumniSocialDTO(link.getLinkedin(), link.getGithub()));
        } catch (Exception e) {
            return "{\"linkedin\":\"\",\"github\":\"\"}";
        }
    }

    @Override
    @Transactional(readOnly = true)
    public ProfileDTO.StudentProfileResponse getStudentProfile(Long userId) {
        StudentProfile profile = studentProfileRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Student profile not found"));
        return new ProfileDTO.StudentProfileResponse(
                profile.getId(),
                mapToUserResponse(profile.getUser()),
                profile.getRollNumber(),
                profile.getDepartment(),
                profile.getCgpa(),
                profile.getGraduationYear(),
                profile.getSkills(),
                profile.getSummary(),
                serializeStudentInternships(profile.getInternships()),
                serializeStudentProjects(profile.getProjects()),
                serializeStudentLanguages(profile.getLanguages()),
                serializeStudentCertifications(profile.getCertifications()),
                serializeStudentSocials(profile.getSocialLink()),
                profile.getResumeName(),
                profile.getResumeSize(),
                profile.getResumeUploaded()
        );
    }

    @Override
    @Transactional
    public ProfileDTO.StudentProfileResponse updateStudentProfile(Long userId, ProfileDTO.StudentProfileRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        if (user.getRole() != Role.STUDENT) {
            throw new BadRequestException("User role is not STUDENT");
        }

        StudentProfile profile = studentProfileRepository.findById(userId)
                .orElse(new StudentProfile());

        profile.setUser(user);
        profile.setRollNumber(request.rollNumber());
        profile.setDepartment(request.department());
        profile.setCgpa(request.cgpa());
        profile.setGraduationYear(request.graduationYear());
        profile.setSkills(request.skills());
        profile.setSummary(request.summary());

        // Deserialization: Internships
        profile.getInternships().clear();
        if (request.internships() != null && !request.internships().trim().isEmpty()) {
            try {
                List<StudentInternshipDTO> dtos = objectMapper.readValue(request.internships(), new TypeReference<List<StudentInternshipDTO>>() {});
                for (StudentInternshipDTO dto : dtos) {
                    profile.getInternships().add(StudentInternship.builder()
                            .studentProfile(profile)
                            .role(dto.role())
                            .company(dto.company())
                            .startDate(dto.startDate())
                            .endDate(dto.endDate())
                            .description(dto.description())
                            .build());
                }
            } catch (Exception e) {
                // ignore
            }
        }

        // Deserialization: Projects
        profile.getProjects().clear();
        if (request.projects() != null && !request.projects().trim().isEmpty()) {
            try {
                List<StudentProjectDTO> dtos = objectMapper.readValue(request.projects(), new TypeReference<List<StudentProjectDTO>>() {});
                for (StudentProjectDTO dto : dtos) {
                    profile.getProjects().add(StudentProject.builder()
                            .studentProfile(profile)
                            .title(dto.title())
                            .techStack(dto.techStack())
                            .description(dto.description())
                            .link(dto.link())
                            .build());
                }
            } catch (Exception e) {
                // ignore
            }
        }

        // Deserialization: Languages
        profile.getLanguages().clear();
        if (request.languages() != null && !request.languages().trim().isEmpty()) {
            try {
                List<String> langs = objectMapper.readValue(request.languages(), new TypeReference<List<String>>() {});
                for (String lang : langs) {
                    profile.getLanguages().add(StudentLanguage.builder()
                            .studentProfile(profile)
                            .language(lang)
                            .build());
                }
            } catch (Exception e) {
                // ignore
            }
        }

        // Deserialization: Certifications
        profile.getCertifications().clear();
        if (request.certifications() != null && !request.certifications().trim().isEmpty()) {
            try {
                List<StudentCertificationDTO> dtos = objectMapper.readValue(request.certifications(), new TypeReference<List<StudentCertificationDTO>>() {});
                for (StudentCertificationDTO dto : dtos) {
                    profile.getCertifications().add(StudentCertification.builder()
                            .studentProfile(profile)
                            .name(dto.name())
                            .issuer(dto.issuer())
                            .date(dto.date())
                            .build());
                }
            } catch (Exception e) {
                // ignore
            }
        }

        // Deserialization: Socials
        if (request.socials() != null && !request.socials().trim().isEmpty()) {
            try {
                StudentSocialDTO dto = objectMapper.readValue(request.socials(), StudentSocialDTO.class);
                StudentSocialLink link = profile.getSocialLink();
                if (link == null) {
                    link = new StudentSocialLink();
                    link.setStudentProfile(profile);
                }
                link.setLinkedin(dto.linkedin());
                link.setGithub(dto.github());
                link.setPortfolio(dto.portfolio());
                profile.setSocialLink(link);
            } catch (Exception e) {
                // ignore
            }
        } else {
            profile.setSocialLink(null);
        }

        profile.setResumeName(request.resumeName());
        profile.setResumeSize(request.resumeSize());
        profile.setResumeUploaded(request.resumeUploaded());

        StudentProfile saved = studentProfileRepository.save(profile);

        auditLogService.log("UPDATE_STUDENT_PROFILE", user, "Student profile updated successfully");

        return new ProfileDTO.StudentProfileResponse(
                saved.getId(),
                mapToUserResponse(saved.getUser()),
                saved.getRollNumber(),
                saved.getDepartment(),
                saved.getCgpa(),
                saved.getGraduationYear(),
                saved.getSkills(),
                saved.getSummary(),
                serializeStudentInternships(saved.getInternships()),
                serializeStudentProjects(saved.getProjects()),
                serializeStudentLanguages(saved.getLanguages()),
                serializeStudentCertifications(saved.getCertifications()),
                serializeStudentSocials(saved.getSocialLink()),
                saved.getResumeName(),
                saved.getResumeSize(),
                saved.getResumeUploaded()
        );
    }

    @Override
    @Transactional(readOnly = true)
    public ProfileDTO.AlumniProfileResponse getAlumniProfile(Long userId) {
        AlumniProfile profile = alumniProfileRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Alumni profile not found"));
        return new ProfileDTO.AlumniProfileResponse(
                profile.getId(),
                mapToUserResponse(profile.getUser()),
                profile.getCurrentCompany(),
                profile.getCurrentRole(),
                profile.getGraduationYear(),
                profile.getDepartment(),
                profile.getIndustry(),
                profile.getSummary(),
                profile.getExperience() != null ? profile.getExperience() : "[]",
                serializeAlumniProjects(profile.getProjects()),
                serializeAlumniLanguages(profile.getLanguages()),
                serializeAlumniCertifications(profile.getCertifications()),
                serializeAlumniSocials(profile.getSocialLink())
        );
    }

    @Override
    @Transactional
    public ProfileDTO.AlumniProfileResponse updateAlumniProfile(Long userId, ProfileDTO.AlumniProfileRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        if (user.getRole() != Role.ALUMNI) {
            throw new BadRequestException("User role is not ALUMNI");
        }

        AlumniProfile profile = alumniProfileRepository.findById(userId)
                .orElse(new AlumniProfile());

        profile.setUser(user);
        String companyName = request.currentCompany();
        profile.setCurrentCompany(companyName);
        if (companyName != null && !companyName.trim().isEmpty()) {
            String trimmedCompany = companyName.trim();
            if (!companyRepository.existsByName(trimmedCompany)) {
                Company newCompany = Company.builder()
                        .name(trimmedCompany)
                        .industry("Technology")
                        .website("https://" + trimmedCompany.toLowerCase().replaceAll("[^a-z0-9]", "") + ".com")
                        .build();
                companyRepository.save(newCompany);
            }
        }
        profile.setCurrentRole(request.currentRole());
        profile.setGraduationYear(request.graduationYear());
        profile.setDepartment(request.department());
        profile.setIndustry(request.industry());
        profile.setSummary(request.summary());
        
        // Alumni experience acts as internships JSON field
        profile.setExperience(request.internships());

        // Deserialization: Projects
        profile.getProjects().clear();
        if (request.projects() != null && !request.projects().trim().isEmpty()) {
            try {
                List<AlumniProjectDTO> dtos = objectMapper.readValue(request.projects(), new TypeReference<List<AlumniProjectDTO>>() {});
                for (AlumniProjectDTO dto : dtos) {
                    profile.getProjects().add(AlumniProject.builder()
                            .alumniProfile(profile)
                            .title(dto.title())
                            .techStack(dto.techStack())
                            .description(dto.description())
                            .link(dto.link())
                            .build());
                }
            } catch (Exception e) {
                // ignore
            }
        }

        // Deserialization: Languages
        profile.getLanguages().clear();
        if (request.languages() != null && !request.languages().trim().isEmpty()) {
            try {
                List<String> langs = objectMapper.readValue(request.languages(), new TypeReference<List<String>>() {});
                for (String lang : langs) {
                    profile.getLanguages().add(AlumniLanguage.builder()
                            .alumniProfile(profile)
                            .language(lang)
                            .build());
                }
            } catch (Exception e) {
                // ignore
            }
        }

        // Deserialization: Certifications
        profile.getCertifications().clear();
        if (request.certifications() != null && !request.certifications().trim().isEmpty()) {
            try {
                List<AlumniCertificationDTO> dtos = objectMapper.readValue(request.certifications(), new TypeReference<List<AlumniCertificationDTO>>() {});
                for (AlumniCertificationDTO dto : dtos) {
                    profile.getCertifications().add(AlumniCertification.builder()
                            .alumniProfile(profile)
                            .name(dto.name())
                            .issuer(dto.issuer())
                            .date(dto.date())
                            .build());
                }
            } catch (Exception e) {
                // ignore
            }
        }

        // Deserialization: Socials
        if (request.socials() != null && !request.socials().trim().isEmpty()) {
            try {
                AlumniSocialDTO dto = objectMapper.readValue(request.socials(), AlumniSocialDTO.class);
                AlumniSocialLink link = profile.getSocialLink();
                if (link == null) {
                    link = new AlumniSocialLink();
                    link.setAlumniProfile(profile);
                }
                link.setLinkedin(dto.linkedin());
                link.setGithub(dto.github());
                profile.setSocialLink(link);
            } catch (Exception e) {
                // ignore
            }
        } else {
            profile.setSocialLink(null);
        }

        AlumniProfile saved = alumniProfileRepository.save(profile);

        auditLogService.log("UPDATE_ALUMNI_PROFILE", user, "Alumni profile updated successfully");

        return new ProfileDTO.AlumniProfileResponse(
                saved.getId(),
                mapToUserResponse(saved.getUser()),
                saved.getCurrentCompany(),
                saved.getCurrentRole(),
                saved.getGraduationYear(),
                saved.getDepartment(),
                saved.getIndustry(),
                saved.getSummary(),
                saved.getExperience() != null ? saved.getExperience() : "[]",
                serializeAlumniProjects(saved.getProjects()),
                serializeAlumniLanguages(saved.getLanguages()),
                serializeAlumniCertifications(saved.getCertifications()),
                serializeAlumniSocials(saved.getSocialLink())
        );
    }

    @Override
    @Transactional(readOnly = true)
    public ProfileDTO.HrProfileResponse getHrProfile(Long userId) {
        HrProfile profile = hrProfileRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("HR profile not found"));
        return new ProfileDTO.HrProfileResponse(
                profile.getId(),
                mapToUserResponse(profile.getUser()),
                profile.getCompany() != null ? profile.getCompany().getId() : null,
                profile.getCompany() != null ? profile.getCompany().getName() : null,
                profile.getDesignation()
        );
    }

    @Override
    @Transactional
    public ProfileDTO.HrProfileResponse updateHrProfile(Long userId, ProfileDTO.HrProfileRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        if (user.getRole() != Role.HR) {
            throw new BadRequestException("User role is not HR");
        }

        Company company = null;
        if (request.companyId() != null) {
            company = companyRepository.findById(request.companyId())
                    .orElseThrow(() -> new ResourceNotFoundException("Company not found with ID: " + request.companyId()));
        } else if (request.companyName() != null && !request.companyName().trim().isEmpty()) {
            String cName = request.companyName().trim();
            company = companyRepository.findByName(cName)
                    .orElseGet(() -> {
                        Company newComp = Company.builder()
                                .name(cName)
                                .industry("Technology")
                                .website("https://" + cName.toLowerCase().replaceAll("[^a-z0-9]", "") + ".com")
                                .build();
                        return companyRepository.save(newComp);
                    });
        } else {
            throw new BadRequestException("Either Company ID or Company Name is required");
        }

        HrProfile profile = hrProfileRepository.findById(userId)
                .orElse(new HrProfile());

        profile.setUser(user);
        profile.setCompany(company);
        profile.setDesignation(request.designation());

        HrProfile saved = hrProfileRepository.save(profile);

        auditLogService.log("UPDATE_HR_PROFILE", user, "HR profile updated for company: " + company.getName());

        return new ProfileDTO.HrProfileResponse(
                saved.getId(),
                mapToUserResponse(saved.getUser()),
                saved.getCompany().getId(),
                saved.getCompany().getName(),
                saved.getDesignation()
        );
    }

    @Override
    @Transactional(readOnly = true)
    public ProfileDTO.AdminProfileResponse getAdminProfile(Long userId) {
        AdminProfile profile = adminProfileRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Admin profile not found"));
        return new ProfileDTO.AdminProfileResponse(
                profile.getId(),
                mapToUserResponse(profile.getUser()),
                profile.getDepartment()
        );
    }

    @Override
    @Transactional
    public ProfileDTO.AdminProfileResponse updateAdminProfile(Long userId, ProfileDTO.AdminProfileRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        if (user.getRole() != Role.ADMIN) {
            throw new BadRequestException("User role is not ADMIN");
        }

        AdminProfile profile = adminProfileRepository.findById(userId)
                .orElse(new AdminProfile());

        profile.setUser(user);
        profile.setDepartment(request.department());

        AdminProfile saved = adminProfileRepository.save(profile);

        auditLogService.log("UPDATE_ADMIN_PROFILE", user, "Admin profile updated successfully");

        return new ProfileDTO.AdminProfileResponse(
                saved.getId(),
                mapToUserResponse(saved.getUser()),
                saved.getDepartment()
        );
    }

    @Override
    @Transactional(readOnly = true)
    public List<ProfileDTO.AlumniProfileResponse> getVerifiedMentors() {
        return alumniProfileRepository.findAll().stream()
                .filter(ap -> ap.getUser().isVerified())
                .map(profile -> new ProfileDTO.AlumniProfileResponse(
                        profile.getId(),
                        mapToUserResponse(profile.getUser()),
                        profile.getCurrentCompany(),
                        profile.getCurrentRole(),
                        profile.getGraduationYear(),
                        profile.getDepartment(),
                        profile.getIndustry(),
                        profile.getSummary(),
                        profile.getExperience() != null ? profile.getExperience() : "[]",
                        serializeAlumniProjects(profile.getProjects()),
                        serializeAlumniLanguages(profile.getLanguages()),
                        serializeAlumniCertifications(profile.getCertifications()),
                        serializeAlumniSocials(profile.getSocialLink())
                ))
                .collect(Collectors.toList());
    }
}
