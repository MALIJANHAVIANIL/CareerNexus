package com.careernexus.service;

import com.careernexus.dto.InterviewExperienceDTO;
import com.careernexus.entity.Company;
import com.careernexus.entity.InterviewExperience;
import com.careernexus.entity.User;
import com.careernexus.exception.ResourceNotFoundException;
import com.careernexus.repository.CompanyRepository;
import com.careernexus.repository.InterviewExperienceRepository;
import com.careernexus.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class InterviewExperienceServiceImpl implements InterviewExperienceService {

    private final InterviewExperienceRepository interviewExperienceRepository;
    private final UserRepository userRepository;
    private final CompanyRepository companyRepository;
    private final AuditLogService auditLogService;

    public InterviewExperienceServiceImpl(
            InterviewExperienceRepository interviewExperienceRepository,
            UserRepository userRepository,
            CompanyRepository companyRepository,
            AuditLogService auditLogService) {

        this.interviewExperienceRepository = interviewExperienceRepository;
        this.userRepository = userRepository;
        this.companyRepository = companyRepository;
        this.auditLogService = auditLogService;
    }

    private InterviewExperienceDTO.ExperienceResponse mapToResponse(
            InterviewExperience exp) {

        String userName =
                exp.isAnonymous() ? "Anonymous" : exp.getUser().getFullName();

        Long userId =
                exp.isAnonymous() ? null : exp.getUser().getId();

        return new InterviewExperienceDTO.ExperienceResponse(
                exp.getId(),
                userId,
                userName,
                exp.getCompany().getId(),
                exp.getCompany().getName(),
                exp.getRole(),
                exp.getExperience(),
                exp.getDifficulty(),
                exp.getRounds(),
                exp.isAnonymous(),
                exp.getCreatedAt()
        );
    }

    @Override
    @Transactional
    public InterviewExperienceDTO.ExperienceResponse shareExperience(
            Long userId,
            InterviewExperienceDTO.ExperienceRequest request) {

        User user = userRepository.findById(userId)
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "User not found with ID: " + userId));

        Company company = companyRepository.findById(request.companyId())
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Company not found with ID: " + request.companyId()));

        InterviewExperience experience = InterviewExperience.builder()
                .user(user)
                .company(company)
                .role(request.role())
                .experience(request.experience())
                .difficulty(request.difficulty())
                .rounds(request.rounds())
                .isAnonymous(request.isAnonymous())
                .build();

        InterviewExperience saved =
                interviewExperienceRepository.save(experience);

        auditLogService.log(
                "SHARE_INTERVIEW_EXPERIENCE",
                user,
                "Shared interview experience for company: "
                        + company.getName());

        return mapToResponse(saved);
    }

    @Override
    @Transactional(readOnly = true)
    public List<InterviewExperienceDTO.ExperienceResponse>
    getCompanyExperiences(Long companyId) {

        if (!companyRepository.existsById(companyId)) {
            throw new ResourceNotFoundException(
                    "Company not found with ID: " + companyId);
        }

        return interviewExperienceRepository.findByCompanyId(companyId)
                .stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<InterviewExperienceDTO.ExperienceResponse>
    getAllExperiences() {

        return interviewExperienceRepository.findAll()
                .stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }
}