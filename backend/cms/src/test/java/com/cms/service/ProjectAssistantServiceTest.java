package com.cms.service;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.Mockito.when;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.server.ResponseStatusException;

@ExtendWith(MockitoExtension.class)
public class ProjectAssistantServiceTest {

    @Mock
    private ProjectAssignmentService projectAssignmentService;

    @InjectMocks
    private ProjectAssistantService projectAssistantService;

    @BeforeEach
    void setUp() {
        SecurityContextHolder.getContext().setAuthentication(
            new UsernamePasswordAuthenticationToken("pm@example.com", "password")
        );
    }

    @Test
    void testAskAboutProject_ThrowsForbidden_WhenNotAssigned() {
        // Arrange
        String projectId = "PROJ-123";
        String email = "pm@example.com";
        when(projectAssignmentService.canUserAccessProject(email, projectId)).thenReturn(false);

        // Act & Assert
        ResponseStatusException exception = assertThrows(ResponseStatusException.class, () -> {
            projectAssistantService.askAboutProject(projectId, "What is the status?");
        });
        
        assertEquals(HttpStatus.FORBIDDEN, exception.getStatusCode());
        assertEquals("You are not assigned to this project.", exception.getReason());
    }
}
