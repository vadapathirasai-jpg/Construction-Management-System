package com.cms.config;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.List;

@Configuration
@EnableWebSecurity
public class SecurityConfig {

    @Autowired
    private JwtFilter jwtFilter;

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
            .csrf(csrf -> csrf.disable())
            .cors(cors -> cors.configurationSource(corsConfigurationSource()))
            .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
            .authorizeHttpRequests(auth -> auth
                .requestMatchers(HttpMethod.OPTIONS, "/**").permitAll()
                .requestMatchers("/users/login").permitAll()
                .requestMatchers(HttpMethod.POST, "/users").permitAll()
                .requestMatchers("/users/verify").permitAll()
                .requestMatchers("/users/resend-verification").permitAll()
                .requestMatchers("/error").permitAll()
                
                .requestMatchers(HttpMethod.GET, "/users/*/projects").authenticated()

                // Users administration
                .requestMatchers("/users/**").hasAuthority("ADMIN")
                
                // Attendance
                .requestMatchers(HttpMethod.GET, "/attendance/**").authenticated()
                .requestMatchers(HttpMethod.DELETE, "/attendance/**").hasAuthority("ADMIN")
                .requestMatchers("/attendance/**").hasAnyAuthority("ADMIN", "PROJECT MANAGER", "SITE ENGINEER")
                
                // Project Assignments
                .requestMatchers(HttpMethod.POST, "/projects/*/assignments").hasAuthority("ADMIN")
                .requestMatchers(HttpMethod.DELETE, "/projects/*/assignments/**").hasAuthority("ADMIN")
                .requestMatchers(HttpMethod.GET, "/projects/*/assignments").authenticated()

                // Projects
                .requestMatchers(HttpMethod.POST, "/projects/*/assistant/**").hasAnyAuthority("ADMIN", "PROJECT MANAGER")
                .requestMatchers(HttpMethod.GET, "/projects/**").authenticated()
                .requestMatchers(HttpMethod.DELETE, "/projects/**").hasAuthority("ADMIN")
                .requestMatchers("/projects/**").hasAnyAuthority("ADMIN", "PROJECT MANAGER")
                
                // Workers
                .requestMatchers(HttpMethod.GET, "/workers/**").authenticated()
                .requestMatchers("/workers/**").hasAnyAuthority("ADMIN", "PROJECT MANAGER")
                
                // Materials
                .requestMatchers(HttpMethod.GET, "/materials/**").authenticated()
                .requestMatchers("/materials/**").hasAnyAuthority("ADMIN", "PROJECT MANAGER")
                
                // Expenses
                .requestMatchers(HttpMethod.GET, "/expenses/**").authenticated()
                .requestMatchers(HttpMethod.DELETE, "/expenses/**").hasAuthority("ADMIN")
                .requestMatchers("/expenses/**").hasAnyAuthority("ADMIN", "PROJECT MANAGER", "ACCOUNTANT")
                
                // Daily Reports
                .requestMatchers(HttpMethod.GET, "/daily-reports/**").authenticated()
                .requestMatchers("/daily-reports/**").hasAnyAuthority("ADMIN", "PROJECT MANAGER", "SITE ENGINEER")
                
                .anyRequest().authenticated()
            )
            .addFilterBefore(jwtFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();
        configuration.setAllowedOriginPatterns(List.of("*"));
        configuration.setAllowedMethods(List.of("GET", "POST", "PUT", "DELETE", "OPTIONS"));
        configuration.setAllowedHeaders(List.of("Authorization", "Content-Type"));
        configuration.setExposedHeaders(List.of("Authorization"));
        configuration.setAllowCredentials(true);
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }
}
