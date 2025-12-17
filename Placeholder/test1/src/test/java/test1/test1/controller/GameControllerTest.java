package test1.test1.controller;

import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.eq;
import java.util.List;
import java.util.Optional;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyBoolean;
import static org.mockito.ArgumentMatchers.anyInt;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.ArgumentMatchers.anyDouble;
import static org.mockito.ArgumentMatchers.anyDouble;
import static org.mockito.ArgumentMatchers.anyInt;
import static org.mockito.ArgumentMatchers.anyString;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.ResponseEntity;

import jakarta.servlet.http.HttpSession;
import test1.test1.dto.GameRequest;
import test1.test1.model.Game;
import test1.test1.service.GameService;
import test1.test1.service.UserService;

@ExtendWith(MockitoExtension.class)
class GameControllerTest {

    @Mock
    private GameService gameService;

    @Mock
    private UserService userService;

    @Mock
    private HttpSession session;

    @InjectMocks
    private GameController gameController;

    @Test
    void createGame_delegatesToService() {
        Game g = new Game("Chess 2", "A strategic board game, again", 5.5);
        g.setGameId(1);
        when(gameService.addGame(anyString(), anyString(), anyDouble(), anyString(), anyString(), anyString(), anyBoolean(), any(), any(), anyString())).thenReturn(g);

        GameRequest request = new GameRequest();
        request.setTitle("Chess 2");
        request.setDescription("A strategic board game, again");
        request.setPrice(5.5);
        request.setCondition("good");
        request.setPhotos("");
        request.setTags("");
        request.setActive(true);
        
        ResponseEntity<Game> result = gameController.addGame(request, session);

        assertThat(result.getBody()).isNotNull();
        assertThat(result.getBody().getGameId()).isEqualTo(1);
        verify(gameService).addGame(anyString(), anyString(), anyDouble(), anyString(), anyString(), anyString(), anyBoolean(), any(), any(), anyString());
    }

    @Test
    void getAllGames_delegates() {
        gameController.getAllGames();
        verify(gameService).getAllGames();
    }

    @Test
    void getGamesByOwner_returnsGames() {
        Game g1 = new Game("Game 1", "Description 1", 10.0);
        g1.setGameId(1);
        Game g2 = new Game("Game 2", "Description 2", 20.0);
        g2.setGameId(2);
        
        when(gameService.getGamesByOwner("john")).thenReturn(List.of(g1, g2));

        ResponseEntity<List<Game>> result = gameController.getGamesByOwner("john");

        assertThat(result.getStatusCode().value()).isEqualTo(200);
        assertThat(result.getBody()).isNotNull();
        assertThat(result.getBody()).hasSize(2);
        assertThat(result.getBody().get(0).getGameId()).isEqualTo(1);
        assertThat(result.getBody().get(1).getGameId()).isEqualTo(2);
        verify(gameService).getGamesByOwner("john");
    }

    @Test
    void getGamesByOwner_returnsEmptyList() {
        when(gameService.getGamesByOwner("unknown")).thenReturn(List.of());

        ResponseEntity<List<Game>> result = gameController.getGamesByOwner("unknown");

        assertThat(result.getStatusCode().value()).isEqualTo(200);
        assertThat(result.getBody()).isNotNull();
        assertThat(result.getBody()).isEmpty();
        verify(gameService).getGamesByOwner("unknown");
    }

    @Test
    void updateGame_successfulUpdate() {
        Game existingGame = new Game("Old Title", "Old Desc", 15.0);
        existingGame.setGameId(5);
        existingGame.setOwnerUsername("john");

        Game updatedGame = new Game("New Title", "New Desc", 25.0);
        updatedGame.setGameId(5);
        updatedGame.setOwnerUsername("john");

        when(session.getAttribute("username")).thenReturn("john");
        when(gameService.getGameById(5)).thenReturn(Optional.of(existingGame));
        when(gameService.updateGame(anyInt(), anyString(), anyString(), anyDouble(), anyString(), anyString(), anyString(), anyBoolean(), any(), any())).thenReturn(updatedGame);

        GameRequest request = new GameRequest();
        request.setTitle("New Title");
        request.setDescription("New Desc");
        request.setPrice(25.0);
        request.setCondition("good");
        request.setPhotos("photo.jpg");
        request.setTags("");
        request.setActive(true);
        request.setStartDate("2025-12-01");
        request.setEndDate("2025-12-31");

        ResponseEntity<Game> result = gameController.updateGame(5, request, session);

        assertThat(result.getStatusCode().value()).isEqualTo(200);
        assertThat(result.getBody()).isNotNull();
        assertThat(result.getBody().getTitle()).isEqualTo("New Title");
        verify(gameService).getGameById(5);
    }

    @Test
    void updateGame_gameNotFound() {
        when(session.getAttribute("username")).thenReturn("john");
        when(gameService.getGameById(999)).thenReturn(Optional.empty());

        GameRequest request = new GameRequest();
        request.setTitle("Title");
        request.setStartDate("2025-12-01");
        request.setEndDate("2025-12-31");

        ResponseEntity<Game> result = gameController.updateGame(999, request, session);

        assertThat(result.getStatusCode().value()).isEqualTo(404);
        verify(gameService).getGameById(999);
    }

    @Test
    void updateGame_forbiddenWhenDifferentOwner() {
        Game existingGame = new Game("Old", "Desc", 10.0);
        existingGame.setGameId(7);
        existingGame.setOwnerUsername("owner1");

        when(session.getAttribute("username")).thenReturn("otherUser");
        when(gameService.getGameById(7)).thenReturn(Optional.of(existingGame));

        GameRequest request = new GameRequest();
        request.setOwnerUsername("anotherOwner");

        ResponseEntity<Game> result = gameController.updateGame(7, request, session);

        assertThat(result.getStatusCode().value()).isEqualTo(403);
        verify(gameService).getGameById(7);
    }

    @Test
    void updateGame_usesUsernameFromUserId() {
        Game existingGame = new Game("Old", "Desc", 10.0);
        existingGame.setGameId(8);
        existingGame.setOwnerUsername("john");

        test1.test1.model.User user = new test1.test1.model.User("john");
        user.setUserId(10);

        Game updated = new Game("New", "Desc", 12.0);
        updated.setGameId(8);
        updated.setOwnerUsername("john");

        when(session.getAttribute("username")).thenReturn(null);
        when(session.getAttribute("userId")).thenReturn(10);
        when(userService.getUserById(10)).thenReturn(Optional.of(user));
        when(gameService.getGameById(8)).thenReturn(Optional.of(existingGame));
        when(gameService.updateGame(anyInt(), anyString(), anyString(), anyDouble(), anyString(), anyString(), anyString(), anyBoolean(), any(), any())).thenReturn(updated);

        GameRequest request = new GameRequest();
        request.setTitle("New");
        request.setDescription("Desc");
        request.setPrice(12.0);
        request.setCondition("good");
        request.setPhotos("photo.jpg");
        request.setTags("tag1");
        request.setActive(true);
        request.setStartDate("2025-12-01");
        request.setEndDate("2025-12-31");

        ResponseEntity<Game> result = gameController.updateGame(8, request, session);

        assertThat(result.getStatusCode().value()).isEqualTo(200);
        assertThat(result.getBody()).isNotNull();
        assertThat(result.getBody().getTitle()).isEqualTo("New");
        verify(userService).getUserById(10);
        verify(gameService).getGameById(8);
        verify(gameService).updateGame(anyInt(), anyString(), anyString(), anyDouble(), anyString(), anyString(), anyString(), anyBoolean(), any(), any());
    }

    @Test
    void updateGame_allowsWhenRequestOwnerMatches() {
        Game existingGame = new Game("Old", "Desc", 10.0);
        existingGame.setGameId(9);
        existingGame.setOwnerUsername("owner1");

        Game updatedGame = new Game("New", "Desc", 11.0);
        updatedGame.setGameId(9);
        updatedGame.setOwnerUsername("owner1");

        when(session.getAttribute("username")).thenReturn(null);
        when(session.getAttribute("userId")).thenReturn(null);
        when(gameService.getGameById(9)).thenReturn(Optional.of(existingGame));
        when(gameService.updateGame(anyInt(), anyString(), anyString(), anyDouble(), anyString(), anyString(), anyString(), anyBoolean(), any(), any())).thenReturn(updatedGame);

        GameRequest request = new GameRequest();
        request.setOwnerUsername("owner1");
        request.setTitle("New");
        request.setPrice(11.0);
        request.setDescription("Desc");
        request.setCondition("good");
        request.setPhotos("photo.jpg");
        request.setTags("tag1");
        request.setActive(true);
        request.setStartDate("2025-12-01");
        request.setEndDate("2025-12-31");

        ResponseEntity<Game> result = gameController.updateGame(9, request, session);

        assertThat(result.getStatusCode().value()).isEqualTo(200);
        assertThat(result.getBody()).isNotNull();
        assertThat(result.getBody().getTitle()).isEqualTo("New");
        verify(gameService).getGameById(9);
        verify(gameService).updateGame(anyInt(), anyString(), anyString(), anyDouble(), anyString(), anyString(), anyString(), anyBoolean(), any(), any());
    }


    @Test
    void deleteGame_successfulDelete() {
        when(session.getAttribute("username")).thenReturn("john");
        when(gameService.deleteGame(5, "john")).thenReturn(true);

        ResponseEntity<Void> result = gameController.deleteGame(5, session);

        assertThat(result.getStatusCode().value()).isEqualTo(204);
        verify(gameService).deleteGame(5, "john");
    }

    @Test
    void deleteGame_notFound() {
        when(session.getAttribute("username")).thenReturn("john");
        when(gameService.deleteGame(999, "john")).thenReturn(false);

        ResponseEntity<Void> result = gameController.deleteGame(999, session);

        assertThat(result.getStatusCode().value()).isEqualTo(403);
        verify(gameService).deleteGame(999, "john");
    }

    @Test
    void deleteGame_noUsername() {
        when(session.getAttribute("username")).thenReturn(null);
        when(session.getAttribute("userId")).thenReturn(null);

        ResponseEntity<Void> result = gameController.deleteGame(5, session);

        assertThat(result.getStatusCode().value()).isEqualTo(401);
    }

    @Test
    void deleteGame_usernameFromUserId() {
        test1.test1.model.User user = new test1.test1.model.User("john");
        user.setUserId(10);

        when(session.getAttribute("username")).thenReturn(null);
        when(session.getAttribute("userId")).thenReturn(10);
        when(userService.getUserById(10)).thenReturn(Optional.of(user));
        when(gameService.deleteGame(5, "john")).thenReturn(true);

        ResponseEntity<Void> result = gameController.deleteGame(5, session);

        assertThat(result.getStatusCode().value()).isEqualTo(204);
        verify(userService).getUserById(10);
        verify(gameService).deleteGame(5, "john");
    }

}