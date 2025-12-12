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

        Game result = gameService.addGame("Chess", "A classic game", 1.5, "good", "", true, null, null, "test-user");

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
}   
