package com.cms.controller;

import java.util.List;
import java.util.Map;
import java.util.HashMap;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import com.cms.entity.User;
import com.cms.entity.Project;
import com.cms.service.UserService;
import com.cms.service.ProjectAssignmentService;
import com.cms.repository.UserRepository;
import com.cms.config.JwtUtils;
import org.springframework.security.crypto.password.PasswordEncoder;

@RestController
@RequestMapping("/users")
@CrossOrigin(origins = "*")
public class UserController {

    @Autowired
    private UserService userService;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private JwtUtils jwtUtils;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private ProjectAssignmentService projectAssignmentService;

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody Map<String, String> credentials) {
        String email = credentials.get("email");
        String password = credentials.get("password");

        User user = userRepository.findByEmail(email).orElse(null);
        if (user == null || !isValidPassword(password, user)) {
            Map<String, String> response = new HashMap<>();
            response.put("error", "Invalid email or password");
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(response);
        }

        if (!"Active".equalsIgnoreCase(user.getStatus())) {
            Map<String, String> response = new HashMap<>();
            response.put("error", "Your account is disabled. Please contact the administrator.");
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(response);
        }

        String token = jwtUtils.generateToken(user.getEmail(), user.getName(), user.getRole());
        Map<String, Object> response = new HashMap<>();
        response.put("token", token);
        response.put("user", user);
        return ResponseEntity.ok(response);
    }

    @PostMapping
    public ResponseEntity<?> saveUser(@RequestBody User user) {
        try {
            return ResponseEntity.status(HttpStatus.CREATED).body(userService.saveUser(user));
        } catch (IllegalArgumentException ex) {
            Map<String, String> response = new HashMap<>();
            response.put("error", ex.getMessage());
            return ResponseEntity.badRequest().body(response);
        } catch (Exception ex) {
            Map<String, String> response = new HashMap<>();
            response.put("error", "Registration failed. Please try again.");
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }

    @PostMapping("/verify")
    public ResponseEntity<?> verifyUser(@RequestBody Map<String, String> request) {
        try {
            String email = request.get("email");
            String otp = request.get("otp");
            String result = userService.verifyUser(email, otp);
            Map<String, String> response = new HashMap<>();
            response.put("message", result);
            return ResponseEntity.ok(response);
        } catch (ResponseStatusException ex) {
            Map<String, String> response = new HashMap<>();
            response.put("error", ex.getReason());
            return ResponseEntity.status(ex.getStatusCode()).body(response);
        } catch (Exception ex) {
            Map<String, String> response = new HashMap<>();
            response.put("error", "Verification failed. Please try again.");
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }

    @PostMapping("/resend-verification")
    public ResponseEntity<?> resendVerification(@RequestBody Map<String, String> request) {
        String email = request.get("email");
        userService.resendVerification(email);
        Map<String, String> response = new HashMap<>();
        response.put("message", "If an account with this email exists and is not yet verified, a new verification email has been sent.");
        return ResponseEntity.ok(response);
    }

    @GetMapping
    public List<User> getAllUsers() {
        return userService.getAllUsers();
    }

    @GetMapping("/{id}")
    public User getUserById(@PathVariable String id) {
        return userService.getUserById(id);
    }

    @GetMapping("/{userId}/projects")
    public List<Project> getProjectsForUser(@PathVariable String userId) {
        return projectAssignmentService.getProjectsForUser(userId);
    }

    @PutMapping("/{id}")
    public User updateUser(@PathVariable String id, @RequestBody User user) {
        user.setId(id);
        return userService.updateUser(user);
    }

    @DeleteMapping("/{id}")
    public void deleteUser(@PathVariable String id) {
        userService.deleteUser(id);
    }

    private boolean isValidPassword(String password, User user) {
        if (password == null || user.getPassword() == null) {
            return false;
        }
        if (user.getPassword().startsWith("$2") && passwordEncoder.matches(password, user.getPassword())) {
            return true;
        }
        if (password.equals(user.getPassword())) {
            user.setPassword(passwordEncoder.encode(password));
            userRepository.save(user);
            return true;
        }
        return false;
    }
}
