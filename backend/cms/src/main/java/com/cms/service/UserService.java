package com.cms.service;

import java.util.List;
import java.util.UUID;
import java.time.LocalDateTime;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.http.HttpStatus;

import com.cms.entity.User;
import com.cms.repository.UserRepository;

@Service
public class UserService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private org.springframework.security.crypto.password.PasswordEncoder passwordEncoder;

    @Autowired
    private EmailService emailService;

    public User saveUser(User user) {
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
        
        // Generate and set verification token/expiry
        String token = UUID.randomUUID().toString();
        user.setVerificationToken(token);
        user.setTokenExpiry(LocalDateTime.now().plusHours(24));
        
        User savedUser = userRepository.save(user);
        
        // Asynchronously/safely call email service so it doesn't fail registration
        try {
            emailService.sendVerificationEmail(savedUser.getEmail(), savedUser.getName(), token);
        } catch (Exception ex) {
            System.err.println("Failed to send verification email for " + savedUser.getEmail() + ": " + ex.getMessage());
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
        return userRepository.save(user);
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

    public String verifyUser(String token) {
        User user = userRepository.findByVerificationToken(token)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.BAD_REQUEST, "Invalid verification link."));

        if (user.getTokenExpiry() == null || user.getTokenExpiry().isBefore(LocalDateTime.now())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Verification link has expired.");
        }

        user.setStatus("Active");
        user.setVerificationToken(null);
        user.setTokenExpiry(null);
        userRepository.save(user);

        return "Account verified successfully. You can now login.";
    }

    private String generateUserId() {
        String id;
        do {
            id = "USR-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase();
        } while (userRepository.existsById(id));
        return id;
    }
}
