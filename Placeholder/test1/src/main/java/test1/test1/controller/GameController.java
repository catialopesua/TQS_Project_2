package test1.test1.controller;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
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
                request.getTags(),
                isActive,
                request.getParsedStartDate(),
                request.getParsedEndDate(),
                owner
            );
            
            System.out.println("Game saved with owner: " + game.getOwnerUsername());
            
            return ResponseEntity.ok(game);
        } catch (IllegalArgumentException | java.time.format.DateTimeParseException e) {
            // Client sent invalid data (bad dates, invalid values, etc.)
            System.err.println("Invalid game data: " + e.getMessage());
            return ResponseEntity.badRequest().build();
        } catch (Exception e) {
            // Server error - database issues, service failures, etc.
            System.err.println("Error adding game: " + e.getMessage());
            return ResponseEntity.status(500).build();
        }
    }

    @GetMapping
    public List<Game> getAllGames() {
        return gameService.getAllGames();
    }

    @GetMapping("/{id}")
    public ResponseEntity<Game> getGameById(@PathVariable Integer id) {
        return gameService.getGameById(id)
            .map(ResponseEntity::ok)
            .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/owner/{ownerUsername}")
    public ResponseEntity<List<Game>> getGamesByOwner(@PathVariable String ownerUsername) {
        List<Game> games = gameService.getGamesByOwner(ownerUsername);
        return ResponseEntity.ok(games);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Game> updateGame(@PathVariable Integer id, @RequestBody GameRequest request, 
                                          jakarta.servlet.http.HttpSession session) {
        try {
            // Get username from session
            String username = (String) session.getAttribute("username");
            if (username == null || username.isEmpty()) {
                Integer userId = (Integer) session.getAttribute("userId");
                if (userId != null) {
                    java.util.Optional<test1.test1.model.User> userOpt = userService.getUserById(userId);
                    if (userOpt.isPresent()) {
                        username = userOpt.get().getUsername();
                    }
                }
            }

            // Verify ownership
            java.util.Optional<Game> gameOpt = gameService.getGameById(id);
            if (gameOpt.isEmpty()) {
                return ResponseEntity.notFound().build();
            }
            if (!gameOpt.get().getOwnerUsername().equals(username) && !gameOpt.get().getOwnerUsername().equals(request.getOwnerUsername())) {
                return ResponseEntity.status(403).build(); // Forbidden
            }

            boolean isActive = Boolean.TRUE.equals(request.getActive());
            
            Game updatedGame = gameService.updateGame(
                id,
                request.getTitle(),
                request.getDescription(),
                request.getPrice(),
                request.getCondition(),
                request.getPhotos(),
                request.getTags(),
                isActive,
                request.getParsedStartDate(),
                request.getParsedEndDate()
            );

            if (updatedGame != null) {
                return ResponseEntity.ok(updatedGame);
            }
            return ResponseEntity.status(400).build();
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteGame(@PathVariable Integer id, jakarta.servlet.http.HttpSession session) {
        try {
            // Get username from session
            String username = (String) session.getAttribute("username");
            if (username == null || username.isEmpty()) {
                Integer userId = (Integer) session.getAttribute("userId");
                if (userId != null) {
                    java.util.Optional<test1.test1.model.User> userOpt = userService.getUserById(userId);
                    if (userOpt.isPresent()) {
                        username = userOpt.get().getUsername();
                    }
                }
            }

            if (username == null || username.isEmpty()) {
                return ResponseEntity.status(401).build(); // Unauthorized
            }

            boolean deleted = gameService.deleteGame(id, username);
            if (deleted) {
                return ResponseEntity.noContent().build();
            }
            return ResponseEntity.status(403).build(); // Forbidden or not found
        } catch (IllegalArgumentException e) {
            // Client sent invalid data
            System.err.println("Invalid delete request: " + e.getMessage());
            return ResponseEntity.badRequest().build();
        } catch (Exception e) {
            // Server error - database issues, service failures, etc.
            System.err.println("Error deleting game: " + e.getMessage());
            return ResponseEntity.status(500).build();
        }
    }
}
