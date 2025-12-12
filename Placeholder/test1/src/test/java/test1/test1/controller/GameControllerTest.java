package test1.test1.controller;

import static org.assertj.core.api.Assertions.assertThat;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyBoolean;
import static org.mockito.ArgumentMatchers.anyDouble;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.ArgumentMatchers.eq;

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
        when(gameService.addGame(anyString(), anyString(), anyDouble(), anyString(), anyString(), anyBoolean(), any(), any(), anyString())).thenReturn(g);

        GameRequest request = new GameRequest();
        request.setTitle("Chess 2");
        request.setDescription("A strategic board game, again");
        request.setPrice(5.5);
        request.setCondition("good");
        request.setPhotos("");
        request.setActive(true);
        request.setStartDate("2025-12-01");
        request.setEndDate("2025-12-31");
        request.setOwnerUsername("testuser");
        
        ResponseEntity<Game> result = gameController.addGame(request, session);

        assertThat(result.getBody()).isNotNull();
        assertThat(result.getBody().getGameId()).isEqualTo(1);
        verify(gameService).addGame(anyString(), anyString(), anyDouble(), anyString(), anyString(), anyBoolean(), any(), any(), anyString());
    }

    @Test
    void testAddGameUsesUsernameFromSession(){
        when(session.getAttribute("username")).thenReturn("john");
        when(gameService.addGame(
            anyString(),
            anyString(),
            anyDouble(),
            anyString(),
            anyString(),
            anyBoolean(),
            any(),
            any(),
            anyString()
        )).thenReturn(new Game("title", "desc", 1.0));

        GameRequest request = new GameRequest();
        request.setTitle("title");
        request.setDescription("desc");
        request.setPrice(1.0);
        request.setCondition("good");
        request.setPhotos("photo.jpg");
        request.setActive(true);
        request.setStartDate("2025-12-01");
        request.setEndDate("2025-12-31");
        request.setOwnerUsername("ignored");

        gameController.addGame(request, session);

        verify(gameService).addGame(
            anyString(), anyString(), anyDouble(), anyString(), anyString(),
            anyBoolean(), any(), any(), eq("john")
        );
    }


    @Test
    void getAllGames_delegates() {
        gameController.getAllGames();
        verify(gameService).getAllGames();
    }
}
