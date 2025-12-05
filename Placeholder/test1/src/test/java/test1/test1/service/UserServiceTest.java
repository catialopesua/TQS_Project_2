package test1.test1.service;

import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import static org.mockito.ArgumentMatchers.any;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import static org.mockito.Mockito.when;
import org.mockito.junit.jupiter.MockitoExtension;

import test1.test1.model.User;
import test1.test1.repository.UserRepository;

@ExtendWith(MockitoExtension.class)
class UserServiceTest {

    @Mock
    private UserRepository userRepository;

    @InjectMocks
    private UserService userService;

    @Test
    
    void createUser_savesAndReturnsUser() {
        when(userRepository.save(any(User.class))).thenAnswer(inv -> {
            User u = inv.getArgument(0);
            u.setUserId(1);
            return u;
        });

        User result = userService.createUser("alice");

        assertThat(result).isNotNull();
        assertThat(result.getUserId()).isEqualTo(1);
        assertThat(result.getUsername()).isEqualTo("alice");
    }

    @Test
    void getAllUsers_returnsList() {
        when(userRepository.findAll()).thenReturn(List.of(new User("a"), new User("b")));

        var list = userService.getAllUsers();

        assertThat(list).hasSize(2);
    }

    @Test
    void getUserById_returnsOptional() {
        User u = new User("bob");
        u.setUserId(5);
        when(userRepository.findById(5)).thenReturn(Optional.of(u));

        var opt = userService.getUserById(5);

        assertThat(opt).isPresent();
        assertThat(opt.get().getUsername()).isEqualTo("bob");
    }
}
