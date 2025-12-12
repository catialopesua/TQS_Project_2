package test1.test1.controller;

import static org.assertj.core.api.Assertions.assertThat;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;

import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.util.Optional;

import org.mockito.junit.jupiter.MockitoExtension;

import jakarta.servlet.http.HttpSession;
import test1.test1.dto.UserResponse;
import test1.test1.model.User;
import test1.test1.service.UserService;

@ExtendWith(MockitoExtension.class)
public class AuthControllerTest {
    
    @Mock
    private UserService userService;

    @Mock
    private HttpSession httpSession;

    @InjectMocks
    private AuthController authController;

    @Test
    void loginSucessTest(){
        User user = new User("Miguel","iamsocool1234");
        user.setUserId(10);
        when(userService.findByUsername("Miguel")).thenReturn(Optional.of(user));
        when(userService.validatePassword(user, "iamsocool1234")).thenReturn(true);

        var response = authController.login("Miguel","iamsocool1234", httpSession);
        assertThat(response.getStatusCode().value()).isEqualTo(200);

        UserResponse body = (UserResponse) response.getBody();
        assertThat(body.getUserId()).isEqualTo(10);
        assertThat(body.getUsername()).isEqualTo("Miguel");
        
        verify(httpSession).setAttribute("userId", 10);

        verify(httpSession).setAttribute("username", "Miguel");

    }

    @Test
    void loginInvalidCredentialsTest(){
        when(userService.findByUsername("Miguel")).thenReturn(Optional.empty());
        var response = authController.login("Miguel", "iamsocool1234", httpSession);
        assertThat(response.getStatusCode().value()).isEqualTo(401);
    }
}
