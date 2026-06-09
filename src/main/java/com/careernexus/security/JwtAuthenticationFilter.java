package com.careernexus.security;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.util.StringUtils;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

public class JwtAuthenticationFilter extends OncePerRequestFilter {

    private final JwtTokenProvider tokenProvider;
    private final CustomUserDetailsService customUserDetailsService;

    public JwtAuthenticationFilter(
            JwtTokenProvider tokenProvider,
            CustomUserDetailsService customUserDetailsService) {

        this.tokenProvider = tokenProvider;
        this.customUserDetailsService = customUserDetailsService;
    }

    @Override
    protected void doFilterInternal(
            HttpServletRequest request,
            HttpServletResponse response,
            FilterChain filterChain)
            throws ServletException, IOException {

        try {

            System.out.println("=================================");
            System.out.println("REQUEST URI = " + request.getRequestURI());

            String jwt = getJwtFromRequest(request);

            System.out.println("JWT TOKEN = " + jwt);

            if (StringUtils.hasText(jwt)) {

                System.out.println("TOKEN FOUND");

                if (tokenProvider.validateToken(jwt)) {

                    System.out.println("TOKEN VALID");

                    String email = tokenProvider.getEmailFromJWT(jwt);

                    System.out.println("EMAIL = " + email);

                    UserDetails userDetails =
                            customUserDetailsService.loadUserByUsername(email);

                    System.out.println("AUTHORITIES = "
                            + userDetails.getAuthorities());

                    UsernamePasswordAuthenticationToken authentication =
                            new UsernamePasswordAuthenticationToken(
                                    userDetails,
                                    null,
                                    userDetails.getAuthorities()
                            );

                    authentication.setDetails(
                            new WebAuthenticationDetailsSource()
                                    .buildDetails(request)
                    );

                    SecurityContextHolder.getContext()
                            .setAuthentication(authentication);

                    System.out.println("AUTHENTICATION SET SUCCESSFULLY");
                } else {

                    System.out.println("TOKEN INVALID");
                }

            } else {

                System.out.println("NO TOKEN FOUND");
            }

        } catch (Exception ex) {

            System.out.println("JWT FILTER ERROR");
            ex.printStackTrace();
        }

        filterChain.doFilter(request, response);
    }

    private String getJwtFromRequest(HttpServletRequest request) {

        String bearerToken = request.getHeader("Authorization");

        System.out.println("AUTH HEADER = " + bearerToken);

        if (StringUtils.hasText(bearerToken)
                && bearerToken.startsWith("Bearer ")) {

            return bearerToken.substring(7);
        }

        return null;
    }
}