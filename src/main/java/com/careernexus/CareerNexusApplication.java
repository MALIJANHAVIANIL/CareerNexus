package com.careernexus;

import com.careernexus.entity.AdminProfile;
import com.careernexus.entity.AuditLog;
import com.careernexus.entity.Role;
import com.careernexus.entity.User;
import com.careernexus.repository.AdminProfileRepository;
import com.careernexus.repository.AuditLogRepository;
import com.careernexus.repository.CompanyRepository;
import com.careernexus.repository.UserRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.Bean;
import org.springframework.data.jpa.repository.config.EnableJpaAuditing;
import org.springframework.security.crypto.password.PasswordEncoder;

@SpringBootApplication
@EnableJpaAuditing
public class CareerNexusApplication {
    public static void main(String[] args) {
        SpringApplication.run(CareerNexusApplication.class, args);
    }

    @Bean
    public CommandLineRunner initDatabase(
            UserRepository userRepository,
            PasswordEncoder passwordEncoder,
            AdminProfileRepository adminProfileRepository,
            CompanyRepository companyRepository,
            AuditLogRepository auditLogRepository) {
        return args -> {
            // Seed Admin (TPO)
            if (!userRepository.existsByEmail("tpo@college.edu")) {
                userRepository.findByEmail("admin@test.com").ifPresent(oldAdmin -> {
                    for (AuditLog log : auditLogRepository.findAll()) {
                        if (log.getPerformedBy() != null && log.getPerformedBy().getId().equals(oldAdmin.getId())) {
                            log.setPerformedBy(null);
                            auditLogRepository.save(log);
                        }
                    }
                    adminProfileRepository.deleteById(oldAdmin.getId());
                    userRepository.delete(oldAdmin);
                });

                User admin = User.builder()
                        .email("tpo@college.edu")
                        .password(passwordEncoder.encode("Admin@123"))
                        .fullName("TPO Officer")
                        .role(Role.ADMIN)
                        .isActive(true)
                        .isVerified(true)
                        .build();

                AdminProfile adminProfile = AdminProfile.builder()
                        .user(admin)
                        .department("Training & Placement Cell")
                        .build();

                admin.setAdminProfile(adminProfile);
                userRepository.save(admin);
            } else {
                userRepository.findByEmail("tpo@college.edu").ifPresent(admin -> {
                    if (admin.getAdminProfile() == null) {
                        AdminProfile adminProfile = AdminProfile.builder()
                                .user(admin)
                                .department("Training & Placement Cell")
                                .build();
                        admin.setAdminProfile(adminProfile);
                        userRepository.save(admin);
                    }
                });
            }

            // Seed default companies if none exist
            if (companyRepository.count() == 0) {
                String[][] companies = {
                    {"Google India", "Tech", "https://google.co.in"},
                    {"Stripe", "Fintech", "https://stripe.com"},
                    {"TCS", "Consulting", "https://tcs.com"},
                    {"Capgemini", "IT Services", "https://capgemini.com"},
                    {"Infosys", "IT Services", "https://infosys.com"},
                    {"JPMorgan Chase", "Finance", "https://jpmorgan.com"}
                };
                for (String[] comp : companies) {
                    com.careernexus.entity.Company company = com.careernexus.entity.Company.builder()
                            .name(comp[0])
                            .industry(comp[1])
                            .website(comp[2])
                            .build();
                    companyRepository.save(company);
                }
            }
        };
    }
}
