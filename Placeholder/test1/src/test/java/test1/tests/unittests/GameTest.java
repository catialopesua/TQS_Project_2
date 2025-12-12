package test1.tests.unittests;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;
import org.junit.jupiter.api.Test;

import test1.test1.model.Game;


public class GameTest {

    @Test
    void testGameConstructorAndGetters(){
        Game game = new Game("Super Mario","Super Mario Party",4.0);
        assertEquals("Super Mario", game.getTitle());
        assertEquals("Super Mario Party", game.getDescription());
        assertEquals(4.0, game.getPricePerDay());
        assertTrue(game.isActive());
    }

    @Test
    void testGameSetters(){
        Game game = new Game("Super Mario","Super Mario Party",4.0);
        game.setTitle("Among Us");
        game.setActive(false);
        game.setDescription("Space killer game");
        game.setPricePerDay(1.2);
        assertEquals("Among Us", game.getTitle());
        assertEquals("Space killer game", game.getDescription());
        assertEquals(1.2, game.getPricePerDay());
        assertFalse(game.isActive());
    }
    
    
}
