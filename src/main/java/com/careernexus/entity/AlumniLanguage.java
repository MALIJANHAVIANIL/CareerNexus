package com.careernexus.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "alumni_languages")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AlumniLanguage {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "alumni_profile_id", nullable = false)
    private AlumniProfile alumniProfile;

    @Column(nullable = false)
    private String language;
}
