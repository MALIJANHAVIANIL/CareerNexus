package com.careernexus.service;

import com.careernexus.dto.CompanyDTO;

import java.util.List;

public interface CompanyService {
    CompanyDTO.CompanyResponse createCompany(CompanyDTO.CompanyRequest request);
    CompanyDTO.CompanyResponse getCompany(Long companyId);
    List<CompanyDTO.CompanyResponse> getAllCompanies();
}
