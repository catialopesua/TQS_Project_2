package test1.test1.controller;

import java.util.List;
import java.util.Map;
import java.util.Optional;

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
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;

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
    void createUser_withoutPassword_callsSimpleCreateUser() {
        User u = new User("alice");
        u.setUserId(5);
        when(userService.createUser("alice")).thenReturn(u);

        User result = userController.createUser("alice", null, "my bio", "owner");

        assertThat(result).isNotNull();
        assertThat(result.getUserId()).isEqualTo(5);
        verify(userService).createUser("alice");
        verify(userService, never()).createUser("alice", "password", "bio", "owner");
    }

    @Test
    void createUser_withEmptyPassword_callsSimpleCreateUser() {
        User u = new User("bob");
        u.setUserId(6);
        when(userService.createUser("bob")).thenReturn(u);

        User result = userController.createUser("bob", "", "some bio", "admin");

        assertThat(result).isNotNull();
        assertThat(result.getUserId()).isEqualTo(6);
        verify(userService).createUser("bob");
    }

    @Test
    void createUser_withPasswordAndNullBio_useEmptyString() {
        User u = new User("charlie");
        u.setUserId(7);
        when(userService.createUser("charlie", "pass123", "", "renter")).thenReturn(u);

        User result = userController.createUser("charlie", "pass123", null, "renter");

        assertThat(result).isNotNull();
        verify(userService).createUser("charlie", "pass123", "", "renter");
    }

    @Test
    void createUser_withPasswordAndNullRole_useDefaultRenter() {
        User u = new User("diana");
        u.setUserId(8);
        when(userService.createUser("diana", "pass456", "bio text", "renter")).thenReturn(u);

        User result = userController.createUser("diana", "pass456", "bio text", null);

        assertThat(result).isNotNull();
        verify(userService).createUser("diana", "pass456", "bio text", "renter");
    }

    @Test
    void getAllUsers_delegates() {
        List<User> users = List.of(new User("user1"), new User("user2"));
        when(userService.getAllUsers()).thenReturn(users);
        
        List<User> result = userController.getAllUsers();

        assertThat(result).hasSize(2);
        verify(userService).getAllUsers();
    }

    @Test
    void getAllUsers_returnsEmptyList() {
        when(userService.getAllUsers()).thenReturn(List.of());
        
        List<User> result = userController.getAllUsers();

        assertThat(result).isEmpty();
        verify(userService).getAllUsers();
    }

    @Test
    void getUserById_delegates() {
        User u = new User("test");
        u.setUserId(3);
        when(userService.getUserById(3)).thenReturn(Optional.of(u));
        
        Optional<User> result = userController.getUserById(3);

        assertThat(result).isPresent();
        assertThat(result.get().getUserId()).isEqualTo(3);
        verify(userService).getUserById(3);
    }

    @Test
    void getUserById_notFound() {
        when(userService.getUserById(999)).thenReturn(Optional.empty());
        
        Optional<User> result = userController.getUserById(999);

        assertThat(result).isEmpty();
        verify(userService).getUserById(999);
    }

    @Test
    void createUser_withPassword_callsFullCreateUser() {
        User expected = new User();
        when(userService.createUser("john", "123", "hello", "admin"))
                .thenReturn(expected);

        User result = userController.createUser("john", "123", "hello", "admin");

        assertSame(expected, result);
        verify(userService).createUser("john", "123", "hello", "admin");
        verify(userService, never()).createUser("john");
    }

    @Test
    void updateUser_success() {
        User updatedUser = new User("newUsername");
        updatedUser.setUserId(10);
        updatedUser.setBio("new bio");
        
        Map<String, String> updates = Map.of("username", "newUsername", "bio", "new bio");
        when(userService.updateUser(10, "newUsername", "new bio")).thenReturn(updatedUser);

        ResponseEntity<User> response = userController.updateUser(10, updates);

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
        assertThat(response.getBody()).isNotNull();
        assertThat(response.getBody().getUsername()).isEqualTo("newUsername");
        verify(userService).updateUser(10, "newUsername", "new bio");
    }

    @Test
    void updateUser_notFound() {
        Map<String, String> updates = Map.of("username", "newUsername", "bio", "new bio");
        when(userService.updateUser(999, "newUsername", "new bio")).thenReturn(null);

        ResponseEntity<User> response = userController.updateUser(999, updates);

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.NOT_FOUND);
        assertThat(response.getBody()).isNull();
        verify(userService).updateUser(999, "newUsername", "new bio");
    }

    @Test
    void updateUser_withPartialUpdates() {
        User updatedUser = new User("partialUser");
        updatedUser.setUserId(11);
        
        Map<String, String> updates = Map.of("username", "partialUser");
        when(userService.updateUser(11, "partialUser", null)).thenReturn(updatedUser);

        ResponseEntity<User> response = userController.updateUser(11, updates);

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
        assertThat(response.getBody()).isNotNull();
        verify(userService).updateUser(11, "partialUser", null);
    }

    @Test
    void updateUser_withEmptyUpdates() {
        User user = new User("existingUser");
        user.setUserId(12);
        
        Map<String, String> updates = Map.of();
        when(userService.updateUser(12, null, null)).thenReturn(user);

        ResponseEntity<User> response = userController.updateUser(12, updates);

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
        assertThat(response.getBody()).isNotNull();
        verify(userService).updateUser(12, null, null);
    }

    @Test
    void deleteUser_success() {
        when(userService.deleteUser(5)).thenReturn(true);

        ResponseEntity<Void> response = userController.deleteUser(5);

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.NO_CONTENT);
        assertThat(response.getBody()).isNull();
        verify(userService).deleteUser(5);
    }

    @Test
    void deleteUser_notFound() {
        when(userService.deleteUser(999)).thenReturn(false);

        ResponseEntity<Void> response = userController.deleteUser(999);

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.NOT_FOUND);
        assertThat(response.getBody()).isNull();
        verify(userService).deleteUser(999);
    }

}
