package com.careernexus.service;

import com.careernexus.dto.ProfileDTO;
import com.careernexus.entity.*;
import com.careernexus.exception.BadRequestException;
import com.careernexus.exception.ResourceNotFoundException;
import com.careernexus.repository.*;
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
                profile.getSkills()
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

        StudentProfile saved = studentProfileRepository.save(profile);

        auditLogService.log("UPDATE_STUDENT_PROFILE", user, "Student profile updated successfully");

        return new ProfileDTO.StudentProfileResponse(
                saved.getId(),
                mapToUserResponse(saved.getUser()),
                saved.getRollNumber(),
                saved.getDepartment(),
                saved.getCgpa(),
                saved.getGraduationYear(),
                saved.getSkills()
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
                profile.getIndustry()
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
        profile.setCurrentCompany(request.currentCompany());
        profile.setCurrentRole(request.currentRole());
        profile.setGraduationYear(request.graduationYear());
        profile.setDepartment(request.department());
        profile.setIndustry(request.industry());

        AlumniProfile saved = alumniProfileRepository.save(profile);

        auditLogService.log("UPDATE_ALUMNI_PROFILE", user, "Alumni profile updated successfully");

        return new ProfileDTO.AlumniProfileResponse(
                saved.getId(),
                mapToUserResponse(saved.getUser()),
                saved.getCurrentCompany(),
                saved.getCurrentRole(),
                saved.getGraduationYear(),
                saved.getDepartment(),
                saved.getIndustry()
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

        Company company = companyRepository.findById(request.companyId())
                .orElseThrow(() -> new ResourceNotFoundException("Company not found with ID: " + request.companyId()));

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
}
