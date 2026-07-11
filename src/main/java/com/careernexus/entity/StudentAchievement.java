package com.careernexus.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "student_achievements")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class StudentAchievement {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "student_profile_id", nullable = false)
    private StudentProfile studentProfile;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String title;
}
