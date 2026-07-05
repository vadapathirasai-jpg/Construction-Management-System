package com.cms.service;

import java.util.List;
import java.util.UUID;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.cms.entity.User;
import com.cms.repository.UserRepository;

@Service
public class UserService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private org.springframework.security.crypto.password.PasswordEncoder passwordEncoder;

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
        user.setRole(user.getRole().trim().toUpperCase());
        
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
        
        
        return userRepository.save(user);
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
        
        
        return userRepository.save(user);
    }

    public void deleteUser(String id) {
        userRepository.deleteById(id);
    }

    private String generateUserId() {
        String id;
        do {
            id = "USR-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase();
        } while (userRepository.existsById(id));
        return id;
    }
}
