package test1.test1.service;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

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
                       String condition, String photos, String tags, boolean active, 
                       LocalDate startDate, LocalDate endDate, String ownerUsername) {
        Game g = new Game(title, description, pricePerDay, condition, photos, tags,
                         active, startDate, endDate, ownerUsername);
        return gameRepository.save(g);
    }

    public List<Game> getAllGames() {
        return gameRepository.findAll();
    }

    public Game getGame(Integer id) {
        return gameRepository.findById(id).orElse(null);
    }

    public Optional<Game> getGameById(Integer id) {
        return gameRepository.findById(id);
    }

    public List<Game> getGamesByOwner(String ownerUsername) {
        return gameRepository.findByOwnerUsername(ownerUsername);
    }

    public Game updateGame(Integer id, String title, String description, String deliveryInstructions,
                          double pricePerDay, String condition, String photos, String tags, boolean active,
                          LocalDate startDate, LocalDate endDate) {
        Optional<Game> gameOpt = gameRepository.findById(id);
        if (gameOpt.isPresent()) {
            Game game = gameOpt.get();
            game.setTitle(title);
            game.setDescription(description);
            game.setDeliveryInstructions(deliveryInstructions);
            game.setPricePerDay(pricePerDay);
            game.setCondition(condition);
            if (photos != null) game.setPhotos(photos);
            if (tags != null) game.setTags(tags);
            game.setActive(active);
            game.setStartDate(startDate);
            game.setEndDate(endDate);
            return gameRepository.save(game);
        }
        return null;
    }

    public boolean deleteGame(Integer id, String ownerUsername) {
        Optional<Game> gameOpt = gameRepository.findById(id);
        if (gameOpt.isPresent() && gameOpt.get().getOwnerUsername().equals(ownerUsername)) {
            gameRepository.deleteById(id);
            return true;
        }
        return false;
    }

    public void save(Game game) {
        gameRepository.save(game);
    }
}