package test1.test1.service;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import static org.mockito.ArgumentMatchers.any;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import org.mockito.junit.jupiter.MockitoExtension;

import test1.test1.model.Game;
import test1.test1.repository.GameRepository;

@ExtendWith(MockitoExtension.class)
class GameServiceTest {

    @Mock
    private GameRepository gameRepository;

    @InjectMocks
    private GameService gameService;

    @Test
    void addGame() {
        when(gameRepository.save(any(Game.class))).thenAnswer(inv -> {
            Game g = inv.getArgument(0);
            g.setGameId(1);
            return g;
        });

        Game result = gameService.addGame("Chess", "A classic game", 1.5, "good", "", "", true, null, null, "test-user");

        assertThat(result).isNotNull();
        assertThat(result.getGameId()).isEqualTo(1);
        assertThat(result.getTitle()).isEqualTo("Chess");
    }

    @Test
    void getAllGames() {
        when(gameRepository.findAll()).thenReturn(List.of(
            new Game("Game1", "Desc1", 1.0),
            new Game("Game2", "Desc2", 2.0)
        ));

        var list = gameService.getAllGames();

        assertThat(list).hasSize(2);
    }

    @Test
    void getGameById() {
        Game g = new Game("Checkers", "Desc", 1.0);
        g.setGameId(3);
        when(gameRepository.findById(3)).thenReturn(Optional.of(g));

        var result = gameService.getGame(3);

        assertThat(result).isNotNull();
        assertThat(result.getGameId()).isEqualTo(3);
    }

    @Test
    void getGamesByOwner_returnsGamesForOwner() {
        Game g1 = new Game("Game1", "Desc1", 1.0);
        g1.setGameId(1);
        g1.setOwnerUsername("john");
        
        Game g2 = new Game("Game2", "Desc2", 2.0);
        g2.setGameId(2);
        g2.setOwnerUsername("john");

        when(gameRepository.findByOwnerUsername("john")).thenReturn(List.of(g1, g2));

        List<Game> result = gameService.getGamesByOwner("john");

        assertThat(result).isNotNull();
        assertThat(result).hasSize(2);
        assertThat(result.get(0).getOwnerUsername()).isEqualTo("john");
        assertThat(result.get(1).getOwnerUsername()).isEqualTo("john");
        verify(gameRepository).findByOwnerUsername("john");
    }

    @Test
    void getGamesByOwner_returnsEmptyListWhenNoGames() {
        when(gameRepository.findByOwnerUsername("unknown")).thenReturn(List.of());

        List<Game> result = gameService.getGamesByOwner("unknown");

        assertThat(result).isNotNull();
        assertThat(result).isEmpty();
        verify(gameRepository).findByOwnerUsername("unknown");
    }

    @Test
    void updateGame_successfulUpdate() {
        Game existingGame = new Game("Old Title", "Old Desc", 10.0);
        existingGame.setGameId(5);
        existingGame.setCondition("good");
        existingGame.setOwnerUsername("john");

        Game updatedGame = new Game("New Title", "New Desc", 15.0);
        updatedGame.setGameId(5);
        updatedGame.setCondition("excellent");

        when(gameRepository.findById(5)).thenReturn(Optional.of(existingGame));
        when(gameRepository.save(any(Game.class))).thenReturn(updatedGame);

        LocalDate startDate = LocalDate.of(2025, 12, 1);
        LocalDate endDate = LocalDate.of(2025, 12, 31);
        Game result = gameService.updateGame(5, "New Title", "New Desc", "deliver", 15.0, "excellent", "photo.jpg", "tag1", true, startDate, endDate);

        assertThat(result).isNotNull();
        assertThat(result.getTitle()).isEqualTo("New Title");
        assertThat(result.getDescription()).isEqualTo("New Desc");
        assertThat(result.getPricePerDay()).isEqualTo(15.0);
        assertThat(result.getCondition()).isEqualTo("excellent");
        verify(gameRepository).findById(5);
        verify(gameRepository).save(any(Game.class));
    }

    @Test
    void updateGame_gameNotFound() {
        when(gameRepository.findById(999)).thenReturn(Optional.empty());

        Game result = gameService.updateGame(999, "Title", "Desc", "deliver", 10.0, "good", "", "", true, null, null);

        assertThat(result).isNull();
        verify(gameRepository).findById(999);
    }

    @Test
    void updateGame_withNullPhotosAndTags() {
        Game existingGame = new Game("Title", "Desc", 10.0);
        existingGame.setGameId(5);
        existingGame.setPhotos("oldphoto.jpg");
        existingGame.setTags("oldtag");

        when(gameRepository.findById(5)).thenReturn(Optional.of(existingGame));
        when(gameRepository.save(any(Game.class))).thenReturn(existingGame);

        Game result = gameService.updateGame(5, "Title", "Desc", "deliver", 10.0, "good", null, null, true, null, null);

        assertThat(result).isNotNull();
        verify(gameRepository).findById(5);
        verify(gameRepository).save(any(Game.class));
    }

    @Test
    void deleteGame_successfulDelete() {
        Game game = new Game("Game", "Desc", 10.0);
        game.setGameId(5);
        game.setOwnerUsername("john");

        when(gameRepository.findById(5)).thenReturn(Optional.of(game));

        boolean result = gameService.deleteGame(5, "john");

        assertThat(result).isTrue();
        verify(gameRepository).findById(5);
        verify(gameRepository).deleteById(5);
    }

    @Test
    void deleteGame_wrongOwner() {
        Game game = new Game("Game", "Desc", 10.0);
        game.setGameId(5);
        game.setOwnerUsername("jane");

        when(gameRepository.findById(5)).thenReturn(Optional.of(game));

        boolean result = gameService.deleteGame(5, "john");

        assertThat(result).isFalse();
        verify(gameRepository).findById(5);
    }

    @Test
    void deleteGame_gameNotFound() {
        when(gameRepository.findById(999)).thenReturn(Optional.empty());

        boolean result = gameService.deleteGame(999, "john");

        assertThat(result).isFalse();
        verify(gameRepository).findById(999);
    }


    @Test
    void testGetGamesByOwner(){
        String ownerUsername = "Joanne";
        Game game1 = new Game();
        game1.setGameId(1);
        game1.setOwnerUsername(ownerUsername);

        Game game2 = new Game();
        game2.setGameId(2);
        game2.setOwnerUsername(ownerUsername);

        List<Game> mockGames = List.of(game1, game2);

        when(gameRepository.findByOwnerUsername(ownerUsername)).thenReturn(mockGames);

        List<Game> result = gameService.getGamesByOwner(ownerUsername);
        assertNotNull(result);
        assertEquals(2, result.size());
        assertEquals(ownerUsername, result.get(0).getOwnerUsername());

    }

}   
