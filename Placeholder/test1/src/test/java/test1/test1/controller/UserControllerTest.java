package test1.test1.controller;

import static org.assertj.core.api.Assertions.assertThat;
import static org.junit.jupiter.api.Assertions.assertSame;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;

import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import org.mockito.junit.jupiter.MockitoExtension;

import test1.test1.model.User;
import test1.test1.service.UserService;

@ExtendWith(MockitoExtension.class)
class UserControllerTest { 

    @Mock
    private UserService userService;

    @InjectMocks
    private UserController userController;

    @Test
    void createUser_delegatesToService() {
        User u = new User("sam");
        u.setUserId(2);
        when(userService.createUser("sam", "password", "bio", "renter")).thenReturn(u);

        User result = userController.createUser("sam", "password", "bio", "renter");

        assertThat(result).isNotNull();
        assertThat(result.getUserId()).isEqualTo(2);
        verify(userService).createUser("sam", "password", "bio", "renter");
    }

    @Test
    void getAllUsers_delegates() {
        userController.getAllUsers();
        verify(userService).getAllUsers();
    }

    @Test
    void getUserById_delegates() {
        userController.getUserById(3);
        verify(userService).getUserById(3);
    }

    @Test
    void createUser_withPassword_callsFullCreateUser() {
        User expected = new User();
        when(userService.createUser("john", "123", "hello", "admin"))
                .thenReturn(expected);

        User result = userController.createUser("john", "123", "hello", "admin");

        assertSame(expected, result);
        verify(userService).createUser("john", "123", "hello", "admin");
        verify(userService, never()).createUser("john"); // ensure other branch is NOT called
    }

}
