package com.careernexus.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.DecimalMax;
import jakarta.validation.constraints.DecimalMin;
import lombok.*;

@Entity
@Table(name = "job_eligibility")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class JobEligibility {

    @Id
    private Long id;

    @OneToOne(fetch = FetchType.LAZY)
    @MapsId
    @JoinColumn(name = "job_id")
    private Job job;

    @DecimalMin(value = "0.0")
    @DecimalMax(value = "10.0")
    @Column(name = "minimum_cgpa")
    private Double minimumCgpa;

    @Column(name = "eligible_departments")
    private String eligibleDepartments; // Comma separated, e.g. "CSE,ECE,IT"

    @Column(name = "graduation_years")
    private String graduationYears; // Comma separated, e.g. "2025,2026"

    @Column(name = "backlogs_allowed", nullable = false)
    private boolean backlogsAllowed;

    @Column(name = "minimum_tenth_percentage")
private Double minimumTenthPercentage;

@Column(name = "minimum_twelfth_percentage")
private Double minimumTwelfthPercentage;

@Column(name = "allowed_gap_years")
private Integer allowedGapYears;

@Column(name = "bond_required")
private Boolean bondRequired;

@Column(name = "bond_duration")
private String bondDuration;


}
