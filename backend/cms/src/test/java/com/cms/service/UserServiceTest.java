package com.cms.service;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

import java.util.Optional;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.security.crypto.password.PasswordEncoder;

import com.cms.entity.User;
import com.cms.repository.UserRepository;

@ExtendWith(MockitoExtension.class)
public class UserServiceTest {

    @InjectMocks
    private UserService userService;

    @Mock
    private UserRepository userRepository;

    @Mock
    private PasswordEncoder passwordEncoder;

    @Mock
    private EmailService emailService;

    @Test
    public void testUpdateUser_UserDoesNotExist_ThrowsResponseStatusException() {
        User user = new User();
        user.setId("non-existent-id");
        user.setPassword("new-password");

        when(userRepository.findById("non-existent-id")).thenReturn(Optional.empty());

        ResponseStatusException exception = assertThrows(ResponseStatusException.class, () -> {
            userService.updateUser(user);
        });

        assertEquals(HttpStatus.NOT_FOUND, exception.getStatusCode());
        assertTrue(exception.getReason().contains("User not found"));
        verify(userRepository, never()).save(any(User.class));
    }

    @Test
    public void testUpdateUser_UserExists_UpdatesSuccessfully() {
        User existingUser = new User();
        existingUser.setId("existing-id");
        existingUser.setName("John Doe");
        existingUser.setEmail("john@example.com");
        existingUser.setRole("SITE ENGINEER");
        existingUser.setPassword("encoded-password");

        User userToUpdate = new User();
        userToUpdate.setId("existing-id");
        userToUpdate.setName("John Doe");
        userToUpdate.setEmail("john@example.com");
        userToUpdate.setRole("ADMIN");
        userToUpdate.setPassword("new-password");

        when(userRepository.findById("existing-id")).thenReturn(Optional.of(existingUser));
        when(passwordEncoder.encode("new-password")).thenReturn("new-encoded-password");
        when(userRepository.save(any(User.class))).thenAnswer(invocation -> invocation.getArgument(0));

        User result = userService.updateUser(userToUpdate);

        assertNotNull(result);
        assertEquals("new-encoded-password", result.getPassword());
        assertEquals("ADMIN", result.getRole());
        verify(emailService, times(1)).sendRoleUpdatedEmail("john@example.com", "John Doe", "ADMIN");
    }
}
