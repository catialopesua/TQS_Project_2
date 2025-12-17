package test1.test1.service;

import java.util.List;
import java.util.Optional;

import org.springframework.stereotype.Service;

import test1.test1.model.User;
import test1.test1.repository.UserRepository;
import test1.test1.util.PasswordUtil;

@Service
public class UserService {

    private final UserRepository userRepository;
    private final PasswordUtil passwordUtil;

    public UserService(UserRepository userRepository, PasswordUtil passwordUtil) {
        this.userRepository = userRepository;
        this.passwordUtil = passwordUtil;
    }

    public User createUser(String username, String password, String bio, String role) {
        User user = new User(username, passwordUtil.encode(password), bio, role);
        return userRepository.save(user);
    }

    public User createUser(String username, String password, String bio) {
        User user = new User(username, passwordUtil.encode(password), bio);
        return userRepository.save(user);
    }

    public User createUser(String username) {
        User user = new User(username);
        return userRepository.save(user);
    }

    public List<User> getAllUsers() {
        return userRepository.findAll();
    }

    public Optional<User> getUserById(Integer id) {
        return userRepository.findById(id);
    }

    public Optional<User> findByUsername(String username) {
        return Optional.ofNullable(userRepository.findByUsername(username));
    }

    public boolean validatePassword(User user, String rawPassword) {
        if (user == null || user.getPassword() == null || rawPassword == null) {
            return false;
        }
        return passwordUtil.matches(rawPassword, user.getPassword());
    }

    public User updateUser(Integer userId, String username, String bio) {
        Optional<User> optionalUser = userRepository.findById(userId);
        if (optionalUser.isPresent()) {
            User user = optionalUser.get();
            if (username != null && !username.isEmpty()) {
                user.setUsername(username);
            }
            if (bio != null) {
                user.setBio(bio);
            }
            return userRepository.save(user);
        }
        return null;
    }

    public boolean deleteUser(Integer userId) {
        if (userRepository.existsById(userId)) {
            userRepository.deleteById(userId);
            return true;
        }
        return false;
    }
}
