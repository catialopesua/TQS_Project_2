package test1.test1.controller;

import java.util.Map;
import java.util.Optional;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import jakarta.servlet.http.HttpSession;
import test1.test1.dto.UserResponse;
import test1.test1.model.User;
import test1.test1.service.UserService;

@RestController
@RequestMapping("/auth")
public class AuthController {

    private final UserService userService;

    public AuthController(UserService userService) {
        this.userService = userService;
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestParam String username, @RequestParam String password, HttpSession session) {
        
        Optional<User> u = userService.findByUsername(username);
        if (u.isPresent() && userService.validatePassword(u.get(), password)) {
            User user = u.get();
            // store minimal session info
            session.setAttribute("userId", user.getUserId());
            session.setAttribute("username", user.getUsername());
            
            System.out.println("Login successful!");
            System.out.println("Stored in session - userId: " + user.getUserId() + ", username: " + user.getUsername());
            
            // Return UserResponse DTO instead of User entity
            UserResponse response = new UserResponse(
                user.getUserId(),
                user.getUsername(),
                user.getBio(),
                user.getRole()
            );
            return ResponseEntity.ok(response);
        } else {
            return ResponseEntity.status(401).body(Map.of("error", "Invalid username or password"));
        }
    }
}
