package test1.test1.service;

import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import static org.mockito.ArgumentMatchers.any;
import org.mockito.InjectMocks;
import org.mockito.Mock;

import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import org.mockito.junit.jupiter.MockitoExtension;

import test1.test1.model.User;
import test1.test1.repository.UserRepository;
import test1.test1.util.PasswordUtil;

@ExtendWith(MockitoExtension.class)
class UserServiceTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private PasswordUtil passwordUtil;

    @InjectMocks
    private UserService userService;

    @Test
    void createUserWithUsernamePasswordBioRole_encodesPasswordAndSaves() {
        when(passwordUtil.encode("rawpass")).thenReturn("encoded");
        when(userRepository.save(any(User.class))).thenAnswer(inv -> {
            User u = inv.getArgument(0);
            u.setUserId(1);
            return u;
        });

        User result = userService.createUser("alice", "rawpass", "My bio", "admin");

        assertThat(result).isNotNull();
        assertThat(result.getUserId()).isEqualTo(1);
        assertThat(result.getUsername()).isEqualTo("alice");
        verify(passwordUtil).encode("rawpass");
        verify(userRepository).save(any(User.class));
    }

    @Test
    void createUserWithUsernamePasswordBio_encodesPasswordAndSaves() {
        when(passwordUtil.encode("pass123")).thenReturn("encoded123");
        when(userRepository.save(any(User.class))).thenAnswer(inv -> {
            User u = inv.getArgument(0);
            u.setUserId(2);
            return u;
        });

        User result = userService.createUser("bob", "pass123", "Bob's bio");

        assertThat(result).isNotNull();
        assertThat(result.getUserId()).isEqualTo(2);
        assertThat(result.getUsername()).isEqualTo("bob");
        verify(passwordUtil).encode("pass123");
        verify(userRepository).save(any(User.class));
    }

    @Test
    void createUserWithUsername_savesAndReturnsUser() {
        when(userRepository.save(any(User.class))).thenAnswer(inv -> {
            User u = inv.getArgument(0);
            u.setUserId(3);
            return u;
        });

        User result = userService.createUser("charlie");

        assertThat(result).isNotNull();
        assertThat(result.getUserId()).isEqualTo(3);
        assertThat(result.getUsername()).isEqualTo("charlie");
        verify(userRepository).save(any(User.class));
    }

    @Test
    void getAllUsers_returnsList() {
        when(userRepository.findAll()).thenReturn(List.of(new User("a"), new User("b")));

        var list = userService.getAllUsers();

        assertThat(list).hasSize(2);
        verify(userRepository).findAll();
    }

    @Test
    void getUserById_returnsOptional() {
        User u = new User("bob");
        u.setUserId(5);
        when(userRepository.findById(5)).thenReturn(Optional.of(u));

        var opt = userService.getUserById(5);

        assertThat(opt).isPresent();
        assertThat(opt.get().getUsername()).isEqualTo("bob");
        verify(userRepository).findById(5);
    }

    @Test
    void getUserById_returnsEmptyWhenNotFound() {
        when(userRepository.findById(999)).thenReturn(Optional.empty());

        var opt = userService.getUserById(999);

        assertThat(opt).isEmpty();
        verify(userRepository).findById(999);
    }

    @Test
    void findByUsername_returnsOptionalWithUser() {
        User u = new User("dave");
        when(userRepository.findByUsername("dave")).thenReturn(u);

        var opt = userService.findByUsername("dave");

        assertThat(opt).isPresent();
        assertThat(opt.get().getUsername()).isEqualTo("dave");
        verify(userRepository).findByUsername("dave");
    }

    @Test
    void findByUsername_returnsEmptyWhenNotFound() {
        when(userRepository.findByUsername("nonexistent")).thenReturn(null);

        var opt = userService.findByUsername("nonexistent");

        assertThat(opt).isEmpty();
        verify(userRepository).findByUsername("nonexistent");
    }

    @Test
    void validatePassword_returnsTrueWhenPasswordMatches() {
        User u = new User("eve");
        u.setPassword("encodedpass");
        when(passwordUtil.matches("rawpass", "encodedpass")).thenReturn(true);

        boolean result = userService.validatePassword(u, "rawpass");

        assertThat(result).isTrue();
        verify(passwordUtil).matches("rawpass", "encodedpass");
    }

    @Test
    void validatePassword_returnsFalseWhenPasswordDoesNotMatch() {
        User u = new User("frank");
        u.setPassword("encodedpass");
        when(passwordUtil.matches("wrongpass", "encodedpass")).thenReturn(false);

        boolean result = userService.validatePassword(u, "wrongpass");

        assertThat(result).isFalse();
        verify(passwordUtil).matches("wrongpass", "encodedpass");
    }

    @Test
    void validatePassword_returnsFalseWhenUserIsNull() {
        boolean result = userService.validatePassword(null, "somepass");

        assertThat(result).isFalse();
    }

    @Test
    void validatePassword_returnsFalseWhenUserPasswordIsNull() {
        User u = new User("grace");
        u.setPassword(null);

        boolean result = userService.validatePassword(u, "somepass");

        assertThat(result).isFalse();
    }

    @Test
    void validatePassword_returnsFalseWhenRawPasswordIsNull() {
        User u = new User("hank");
        u.setPassword("encodedpass");

        boolean result = userService.validatePassword(u, null);

        assertThat(result).isFalse();
    }
}
