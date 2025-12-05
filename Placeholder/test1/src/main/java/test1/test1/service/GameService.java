package test1.test1.service;

import java.time.LocalDate;
import java.util.List;

import org.springframework.stereotype.Service;

import test1.test1.model.Game;
import test1.test1.repository.GameRepository;

@Service
public class GameService {

    private final GameRepository gameRepository;

    public GameService(GameRepository gameRepository) {
        this.gameRepository = gameRepository;
    }

    public Game addGame(String title, String description, double pricePerDay, 
                       String condition, String photos, boolean active, 
                       LocalDate startDate, LocalDate endDate, String ownerUsername) {
        Game g = new Game(title, description, pricePerDay, condition, photos, 
                         active, startDate, endDate, ownerUsername);
        return gameRepository.save(g);
    }

    public List<Game> getAllGames() {
        return gameRepository.findAll();
    }

    public Game getGame(Integer id) {
        return gameRepository.findById(id).orElse(null);
    }

    public void save(Game game) {
        gameRepository.save(game);
    }
}
