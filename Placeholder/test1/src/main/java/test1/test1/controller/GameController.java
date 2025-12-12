package test1.test1.controller;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import test1.test1.dto.GameRequest;
import test1.test1.model.Game;
import test1.test1.service.GameService;

@RestController
@RequestMapping("/games")
public class GameController {

    private final GameService gameService;
    private final test1.test1.service.UserService userService;

    public GameController(GameService gameService, test1.test1.service.UserService userService) {
        this.gameService = gameService;
        this.userService = userService;
    }

    @PostMapping
    public ResponseEntity<Game> addGame(@RequestBody GameRequest request, jakarta.servlet.http.HttpSession session) {
        try {
            // First try to get username directly from session
            String owner = (String) session.getAttribute("username");
            // If not found, try getting via userId
            if (owner == null || owner.isEmpty()) {
                Integer userId = (Integer) session.getAttribute("userId");
                
                if (userId != null) {
                    // User is logged in via session, get their username from UserService
                    java.util.Optional<test1.test1.model.User> userOpt = userService.getUserById(userId);
                    if (userOpt.isPresent()) {
                        owner = userOpt.get().getUsername();
                    }
                }
            }
            
            // Fallback to request body if session doesn't have user
            if (owner == null || owner.isEmpty()) {
                owner = request.getOwnerUsername();
            }
            
            // Final fallback to "null" if still empty
            if (owner == null || owner.isEmpty() || owner.equals("null")) {
                owner = "null";
            }
            
            boolean isActive = Boolean.TRUE.equals(request.getActive());
            
            Game game = gameService.addGame(
                request.getTitle(),
                request.getDescription(),
                request.getPrice(),
                request.getCondition(),
                request.getPhotos(),
                isActive,
                request.getParsedStartDate(),
                request.getParsedEndDate(),
                owner
            );
            
            System.out.println("Game saved with owner: " + game.getOwnerUsername());
            
            return ResponseEntity.ok(game);
        } catch (Exception e) {
            // e.printStackTrace(); Uncomment for debuging
            return ResponseEntity.badRequest().build();
        }
    }

    @GetMapping
    public List<Game> getAllGames() {
        return gameService.getAllGames();
    }
}
