package com.careernexus.dto;

import jakarta.validation.constraints.NotBlank;

public final class CompanyDTO {
    private CompanyDTO() {}

    public record CompanyRequest(
        @NotBlank(message = "Company name is required")
        String name,

        String website,
        String description,

        @NotBlank(message = "Industry is required")
        String industry
    ) {}

    public record CompanyResponse(
        Long id,
        String name,
        String website,
        String description,
        String industry
    ) {}
}
