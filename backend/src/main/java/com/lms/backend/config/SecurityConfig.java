package com.lms.backend.config;

import com.lms.backend.security.JwtAuthFilter;
import com.lms.backend.services.JWTService;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.http.HttpStatus;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.HttpStatusEntryPoint;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.List;

@Configuration
public class SecurityConfig {

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http, JWTService jwtService) throws Exception {

        http
            .cors(Customizer.withDefaults())          // uses corsConfigurationSource() below
            .csrf(csrf -> csrf.disable())             // stateless API, token in a header (no cookies)

            .sessionManagement(session ->
                session.sessionCreationPolicy(SessionCreationPolicy.STATELESS)
            )

            // No token / bad token -> 401 (the Angular app signs the user out on 401)
            .exceptionHandling(e -> e.authenticationEntryPoint(new HttpStatusEntryPoint(HttpStatus.UNAUTHORIZED)))

            .authorizeHttpRequests(auth -> auth
                .requestMatchers(HttpMethod.OPTIONS, "/**").permitAll()      // browser preflight

                // Public
                .requestMatchers("/api/auth/login").permitAll()
                .requestMatchers(HttpMethod.POST, "/api/users").permitAll()  // sign-up (UserService blocks ADMIN for anonymous callers)

                // Admin only: user management and writing courses
                .requestMatchers("/api/users", "/api/users/**").hasRole("ADMIN")
                .requestMatchers(HttpMethod.POST, "/api/courses", "/api/courses/**").hasRole("ADMIN")
                .requestMatchers(HttpMethod.PUT, "/api/courses", "/api/courses/**").hasRole("ADMIN")
                .requestMatchers(HttpMethod.DELETE, "/api/courses", "/api/courses/**").hasRole("ADMIN")

                // Admin only: classes, teacher-course assignments, enrollments
                .requestMatchers("/api/classes", "/api/classes/**").hasRole("ADMIN")
                .requestMatchers("/api/teaches", "/api/teaches/**").hasRole("ADMIN")
                .requestMatchers("/api/enrollments", "/api/enrollments/**").hasRole("ADMIN")

                // Everything else (reading courses, change-password, ...) needs a valid token
                .anyRequest().authenticated()
            )

            .addFilterBefore(new JwtAuthFilter(jwtService), UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration config = new CorsConfiguration();
        config.setAllowedOrigins(List.of("http://localhost:4200"));
        config.setAllowedMethods(List.of("GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"));
        config.setAllowedHeaders(List.of("Authorization", "Content-Type"));
        config.setMaxAge(3600L);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", config);
        return source;
    }
}
