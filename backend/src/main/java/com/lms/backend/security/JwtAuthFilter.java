package com.lms.backend.security;

import com.lms.backend.Enum.User.Role;
import com.lms.backend.services.JWTService;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.JwtException;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.List;

/**
 * Reads "Authorization: Bearer <token>", checks the signature and expiry, and signs the user in for this request.
 * A missing or invalid token is not an error here: the request just stays anonymous and SecurityConfig decides.
 *
 * NOT a @Component on purpose. It is created in SecurityConfig, so Spring Boot does not also register it
 * as a plain servlet filter (which would run it outside the security chain).
 */
public class JwtAuthFilter extends OncePerRequestFilter {

    private final JWTService jwtService;

    public JwtAuthFilter(JWTService jwtService) {
        this.jwtService = jwtService;
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request,
                                    HttpServletResponse response,
                                    FilterChain chain) throws ServletException, IOException {
        String header = request.getHeader("Authorization");

        if (header != null && header.startsWith("Bearer ")) {
            try {
                Claims claims = jwtService.parse(header.substring(7));
                Long userId = ((Number) claims.get("userId")).longValue();
                Role role = Role.valueOf(claims.get("role", String.class));
                AuthUser principal = new AuthUser(userId, claims.getSubject(), role);

                var authentication = new UsernamePasswordAuthenticationToken(
                        principal, null, List.of(new SimpleGrantedAuthority("ROLE_" + role.name())));
                SecurityContextHolder.getContext().setAuthentication(authentication);
            } catch (JwtException | IllegalArgumentException | ClassCastException | NullPointerException e) {
                SecurityContextHolder.clearContext(); // expired, tampered or malformed token
            }
        }

        chain.doFilter(request, response);
    }
}
