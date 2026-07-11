package com.careernexus.service;

import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.careernexus.dto.AuthDTO;
import com.careernexus.entity.AdminProfile;
import com.careernexus.entity.AlumniProfile;
import com.careernexus.entity.HrProfile;
import com.careernexus.entity.Role;
import com.careernexus.entity.StudentProfile;
import com.careernexus.entity.User;
import com.careernexus.exception.BadRequestException;
import com.careernexus.repository.AdminProfileRepository;
import com.careernexus.repository.AlumniProfileRepository;
import com.careernexus.repository.HrProfileRepository;
import com.careernexus.repository.StudentProfileRepository;
import com.careernexus.repository.UserRepository;
import com.careernexus.security.JwtTokenProvider;

@Service
public class AuthServiceImpl implements AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuthenticationManager authenticationManager;
    private final JwtTokenProvider tokenProvider;
    private final AuditLogService auditLogService;
    private final HrProfileRepository hrProfileRepository;
    private final StudentProfileRepository studentProfileRepository;
    private final AlumniProfileRepository alumniProfileRepository;
    private final AdminProfileRepository adminProfileRepository;

    public AuthServiceImpl(
            UserRepository userRepository,
            PasswordEncoder passwordEncoder,
            AuthenticationManager authenticationManager,
            JwtTokenProvider tokenProvider,
            AuditLogService auditLogService,
            HrProfileRepository hrProfileRepository,
            StudentProfileRepository studentProfileRepository,
            AlumniProfileRepository alumniProfileRepository,
            AdminProfileRepository adminProfileRepository) {

        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.authenticationManager = authenticationManager;
        this.tokenProvider = tokenProvider;
        this.auditLogService = auditLogService;
        this.hrProfileRepository = hrProfileRepository;
        this.studentProfileRepository = studentProfileRepository;
        this.alumniProfileRepository = alumniProfileRepository;
        this.adminProfileRepository = adminProfileRepository;
    }

    @Override
    @Transactional
    public AuthDTO.AuthResponse register(AuthDTO.RegisterRequest request) {

        if (userRepository.existsByEmail(request.email())) {
            throw new BadRequestException("Email already in use");
        }

        boolean startVerified = request.role() == Role.STUDENT || request.role() == Role.ADMIN;
        User user = User.builder()
                .email(request.email())
                .password(passwordEncoder.encode(request.password()))
                .fullName(request.fullName())
                .role(request.role())
                .isVerified(startVerified)
                .isActive(true)
                .build();

        if (request.role() == Role.STUDENT) {
            StudentProfile studentProfile = StudentProfile.builder()
                    .user(user)
                    .rollNumber("PENDING_" + request.email())
                    .department("TBD")
                    .cgpa(0.0)
                    .graduationYear(java.time.Year.now().getValue())
                    .build();
            user.setStudentProfile(studentProfile);
        } else if (request.role() == Role.ALUMNI) {
            AlumniProfile alumniProfile = AlumniProfile.builder()
                    .user(user)
                    .currentCompany("TBD")
                    .currentRole("TBD")
                    .graduationYear(java.time.Year.now().getValue())
                    .department("TBD")
                    .build();
            user.setAlumniProfile(alumniProfile);
        } else if (request.role() == Role.HR) {
            HrProfile hrProfile = HrProfile.builder()
                    .user(user)
                    .designation("TBD")
                    .build();
            user.setHrProfile(hrProfile);
        } else if (request.role() == Role.ADMIN) {
            AdminProfile adminProfile = AdminProfile.builder()
                    .user(user)
                    .department("Training & Placement Cell")
                    .build();
            user.setAdminProfile(adminProfile);
        }

        User savedUser = userRepository.save(user);

        auditLogService.log(
                "USER_REGISTER",
                savedUser,
                "User registered successfully with role: " + savedUser.getRole());

        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                        request.email(),
                        request.password()));

        String token = tokenProvider.generateToken(authentication);

        return new AuthDTO.AuthResponse(
                token,
                savedUser.getEmail(),
                savedUser.getFullName(),
                savedUser.getRole());
    }

    @Override
    @Transactional
    public AuthDTO.AuthResponse login(AuthDTO.LoginRequest request) {

        User user = userRepository.findByEmail(request.email())
                .orElseThrow(() -> new BadRequestException("User not found"));

        if (!user.isActive()) {
            throw new BadRequestException("Your account has been deactivated. Please contact TPO.");
        }

        if ((user.getRole() == Role.ALUMNI || user.getRole() == Role.HR) && !user.isVerified()) {
            throw new BadRequestException("Waiting for TPO approval");
        }

        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                        request.email(),
                        request.password()));

        String token = tokenProvider.generateToken(authentication);

        auditLogService.log(
                "USER_LOGIN",
                user,
                "User logged in successfully");

        return new AuthDTO.AuthResponse(
                token,
                user.getEmail(),
                user.getFullName(),
                user.getRole());
    }
}