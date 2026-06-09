package com.careernexus.service;

import com.careernexus.dto.CompanyDTO;
import com.careernexus.entity.Company;
import com.careernexus.exception.BadRequestException;
import com.careernexus.exception.ResourceNotFoundException;
import com.careernexus.repository.CompanyRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class CompanyServiceImpl implements CompanyService {

    private final CompanyRepository companyRepository;
    private final AuditLogService auditLogService;

    public CompanyServiceImpl(CompanyRepository companyRepository, AuditLogService auditLogService) {
        this.companyRepository = companyRepository;
        this.auditLogService = auditLogService;
    }

    private CompanyDTO.CompanyResponse mapToResponse(Company company) {
        return new CompanyDTO.CompanyResponse(
                company.getId(),
                company.getName(),
                company.getWebsite(),
                company.getDescription(),
                company.getIndustry()
        );
    }

    @Override
    @Transactional
    public CompanyDTO.CompanyResponse createCompany(CompanyDTO.CompanyRequest request) {
        if (companyRepository.existsByName(request.name())) {
            throw new BadRequestException("Company name already registered");
        }

        Company company = Company.builder()
                .name(request.name())
                .website(request.website())
                .description(request.description())
                .industry(request.industry())
                .build();

        Company saved = companyRepository.save(company);

        // Record Audit Log
        auditLogService.log("CREATE_COMPANY", null, "Company registered: " + saved.getName());

        return mapToResponse(saved);
    }

    @Override
    @Transactional(readOnly = true)
    public CompanyDTO.CompanyResponse getCompany(Long companyId) {
        Company company = companyRepository.findById(companyId)
                .orElseThrow(() -> new ResourceNotFoundException("Company not found with ID: " + companyId));
        return mapToResponse(company);
    }

    @Override
    @Transactional(readOnly = true)
    public List<CompanyDTO.CompanyResponse> getAllCompanies() {
        return companyRepository.findAll().stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }
}
