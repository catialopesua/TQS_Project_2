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

    public GameController(GameService gameService) {
        this.gameService = gameService;
    }

    @PostMapping
    public ResponseEntity<Game> addGame(@RequestBody GameRequest request) {
        try {
            // Use "null" as owner if not provided (for testing without login)
            String owner = (request.getOwnerUsername() != null && !request.getOwnerUsername().isEmpty()) 
                          ? request.getOwnerUsername() 
                          : "null";
            
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
            
            return ResponseEntity.ok(game);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @GetMapping
    public List<Game> getAllGames() {
        return gameService.getAllGames();
    }
}
