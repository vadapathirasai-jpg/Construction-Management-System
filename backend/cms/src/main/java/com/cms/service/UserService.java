package com.cms.service;

import java.util.List;
import java.util.UUID;
import java.time.LocalDateTime;
import java.time.Instant;
import java.time.Duration;
import java.util.concurrent.ConcurrentHashMap;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.http.HttpStatus;

import com.cms.entity.User;
import com.cms.repository.UserRepository;

@Service
public class UserService {

    private final ConcurrentHashMap<String, Instant> resendRateLimits = new ConcurrentHashMap<>();

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private org.springframework.security.crypto.password.PasswordEncoder passwordEncoder;

    @Autowired
    private EmailService emailService;

    public User saveUser(User user) {
        if (userRepository.count() == 0) {
            user.setRole("ADMIN");
        } else if (!isCallerAuthenticatedAdmin()) {
            user.setRole("SITE ENGINEER");
        }

    	//check name not empty
        if (user.getName() == null || user.getName().trim().isEmpty()) {
            throw new IllegalArgumentException("Name is required.");
        }
        //check email is not empty
        if (user.getEmail() == null || user.getEmail().trim().isEmpty()) {
            throw new IllegalArgumentException("Email is required.");
        }
        //check for role not empty
        if (user.getRole() == null || user.getRole().trim().isEmpty()) {
            throw new IllegalArgumentException("Role is required.");
        }
        //check for password
        if(user.getPassword() == null || user.getPassword().trim().isEmpty()) {
        	throw new IllegalArgumentException("Password is required...");
        }
        
        
        //cleaning all values to make it uniform
        user.setName(user.getName().trim());
        user.setEmail(user.getEmail().trim().toLowerCase());
        normalizeUserRole(user);
        
        //Default status
        if (user.getStatus() == null || user.getStatus().trim().isEmpty()) {
            user.setStatus("Pending");
        }
        
        //Check for duplicate email exit or not
        if (userRepository.existsByEmail(user.getEmail())) {
            throw new IllegalArgumentException("An account with this email already exists.");
        }
        if (user.getId() == null || user.getId().trim().isEmpty() || userRepository.existsById(user.getId())) {
            user.setId(generateUserId());
        }
        //encode the password
        user.setPassword(passwordEncoder.encode(user.getPassword()));
        
        // Generate and set 6-digit OTP code
        String otp = String.format("%06d", new java.util.Random().nextInt(1000000));
        user.setVerificationToken(otp);
        user.setTokenExpiry(LocalDateTime.now().plusMinutes(15));
        
        User savedUser = userRepository.save(user);
        
        // Asynchronously/safely call email service so it doesn't fail registration
        try {
            emailService.sendVerificationOtp(savedUser.getEmail(), savedUser.getName(), otp);
        } catch (Exception ex) {
            // Handled inside EmailService
        }
        
        return savedUser;
    }

    public List<User> getAllUsers() {
        return userRepository.findAll();
    }

    public User getUserById(String id) {
        return userRepository.findById(id).orElse(null);
    }

    public User updateUser(User user) {
        User existing = userRepository.findById(user.getId()).orElse(null);
        String previousRole = existing != null ? existing.getRole() : null;

        // if true
        if (existing != null) {
        	//no password
            if (user.getPassword() == null || user.getPassword().isEmpty()) {
                user.setPassword(existing.getPassword());
            } 
            else if (!user.getPassword().equals(existing.getPassword()) && !user.getPassword().startsWith("$2a$")) {
                // If it's a new password (not already a BCrypt hash starting with $2a$), encode it
                user.setPassword(passwordEncoder.encode(user.getPassword()));
            }
        } 
        // if false
        else
        
        {
            if (user.getPassword() == null || user.getPassword().isEmpty()) {
                user.setPassword(passwordEncoder.encode("password123"));
            } else {
                user.setPassword(passwordEncoder.encode(user.getPassword()));
            }
        }
        
        normalizeUserRole(user);
        User savedUser = userRepository.save(user);

        if (existing != null && previousRole != null && !previousRole.equalsIgnoreCase(savedUser.getRole())) {
            try {
                emailService.sendRoleUpdatedEmail(savedUser.getEmail(), savedUser.getName(), savedUser.getRole());
            } catch (Exception ex) {
                System.err.println("Failed to send role update email for " + savedUser.getEmail() + ": " + ex.getMessage());
            }
        }

        return savedUser;
    }

    public void deleteUser(String id) {
        userRepository.deleteById(id);
    }

    private void normalizeUserRole(User user) {
        if (user.getRole() != null) {
            String rawRole = user.getRole().trim();
            if ("ADMIN".equalsIgnoreCase(rawRole)) {
                user.setRole("ADMIN");
            } else if ("PROJECT MANAGER".equalsIgnoreCase(rawRole) || "PROJECT_MANAGER".equalsIgnoreCase(rawRole)) {
                user.setRole("PROJECT MANAGER");
            } else if ("SITE ENGINEER".equalsIgnoreCase(rawRole) || "SITE_ENGINEER".equalsIgnoreCase(rawRole)) {
                user.setRole("SITE ENGINEER");
            } else if ("ACCOUNTANT".equalsIgnoreCase(rawRole)) {
                user.setRole("ACCOUNTANT");
            } else {
                user.setRole(rawRole);
            }
        }
    }

    public String verifyUser(String email, String otp) {
        if (email == null || email.trim().isEmpty() || otp == null || otp.trim().isEmpty()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Email and OTP are required.");
        }
        String normalizedEmail = email.trim().toLowerCase();
        User user = userRepository.findByEmail(normalizedEmail)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.BAD_REQUEST, "Invalid verification request."));

        if ("Active".equalsIgnoreCase(user.getStatus())) {
            return "Your account is already verified. You can log in now.";
        }

        if (user.getVerificationToken() == null || !user.getVerificationToken().equals(otp.trim())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Invalid OTP code.");
        }

        if (user.getTokenExpiry() == null || user.getTokenExpiry().isBefore(LocalDateTime.now())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "OTP code has expired.");
        }

        user.setStatus("Active");
        userRepository.save(user);

        return "Account verified successfully. You can now login.";
    }

    public void resendVerification(String email) {
        if (email == null || email.trim().isEmpty()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Email is required.");
        }
        String normalizedEmail = email.trim().toLowerCase();
        Instant now = Instant.now();

        // Prevent memory leak by removing expired rate limit entries inline
        resendRateLimits.entrySet().removeIf(entry -> Duration.between(entry.getValue(), now).getSeconds() > 60);

        Instant lastSent = resendRateLimits.get(normalizedEmail);
        if (lastSent != null && Duration.between(lastSent, now).getSeconds() < 60) {
            throw new ResponseStatusException(HttpStatus.TOO_MANY_REQUESTS, "Please wait before requesting another verification email.");
        }

        resendRateLimits.put(normalizedEmail, now);

        User user = userRepository.findByEmail(normalizedEmail).orElse(null);
        if (user == null) {
            return;
        }

        if (!"Pending".equalsIgnoreCase(user.getStatus())) {
            return;
        }

        String otp = String.format("%06d", new java.util.Random().nextInt(1000000));
        user.setVerificationToken(otp);
        user.setTokenExpiry(LocalDateTime.now().plusMinutes(15));
        userRepository.save(user);

        emailService.sendVerificationOtp(user.getEmail(), user.getName(), otp);
    }

    private String generateUserId() {
        String id;
        do {
            id = "USR-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase();
        } while (userRepository.existsById(id));
        return id;
    }

    private boolean isCallerAuthenticatedAdmin() {
        org.springframework.security.core.Authentication authentication = 
            org.springframework.security.core.context.SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !authentication.isAuthenticated()) {
            return false;
        }
        return authentication.getAuthorities().stream()
                .map(org.springframework.security.core.GrantedAuthority::getAuthority)
                .anyMatch(role -> "ADMIN".equalsIgnoreCase(role));
    }
}
