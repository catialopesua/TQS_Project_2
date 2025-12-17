package test1.tests.unittests;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertNull;
import java.time.LocalDate;
import java.lang.reflect.Constructor;
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
        assertEquals("good", game.getCondition());
        assertEquals("", game.getPhotos());
        assertEquals("", game.getTags());
        assertEquals("test-user", game.getOwnerUsername());
        assertNotNull(game.getCreatedAt());
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

    @Test
    void testFullGameConstructor(){
        LocalDate startDate = LocalDate.of(2025, 12, 1);
        LocalDate endDate = LocalDate.of(2025, 12, 31);
        
        Game game = new Game("Elden Ring", "Action RPG", 5.0, "mint", 
                            "photo1.jpg,photo2.jpg", "RPG,Action,Adventure", 
                            true, startDate, endDate, "admin");
        
        assertEquals("Elden Ring", game.getTitle());
        assertEquals("Action RPG", game.getDescription());
        assertEquals(5.0, game.getPricePerDay());
        assertEquals("mint", game.getCondition());
        assertEquals("photo1.jpg,photo2.jpg", game.getPhotos());
        assertEquals("RPG,Action,Adventure", game.getTags());
        assertTrue(game.isActive());
        assertEquals(startDate, game.getStartDate());
        assertEquals(endDate, game.getEndDate());
        assertEquals("admin", game.getOwnerUsername());
    }

    @Test
    void testProtectedNoArgsConstructor_viaReflection(){
        try {
            Constructor<Game> ctor = Game.class.getDeclaredConstructor();
            ctor.setAccessible(true);
            Game game = ctor.newInstance();

            assertNull(game.getTitle());
            assertNull(game.getDescription());
            assertEquals(0.0, game.getPricePerDay());
            assertNull(game.getCondition());
            assertNull(game.getPhotos());
            assertNull(game.getTags());
            assertTrue(game.isActive()); // default field initialization
            assertNull(game.getStartDate());
            assertNull(game.getEndDate());
            assertNull(game.getOwnerUsername());
            assertNotNull(game.getCreatedAt());
        } catch (Exception e) {
            throw new RuntimeException(e);
        }
    }

    @Test
    void testGameIdGetter(){
        Game game = new Game("Game", "Desc", 10.0);
        game.setGameId(42);
        assertEquals(42, game.getGameId());
    }

    @Test
    void testConditionSetter(){
        Game game = new Game("Game", "Desc", 10.0);
        game.setCondition("poor");
        assertEquals("poor", game.getCondition());
        
        game.setCondition("excellent");
        assertEquals("excellent", game.getCondition());
    }

    @Test
    void testPhotosSetter(){
        Game game = new Game("Game", "Desc", 10.0);
        String photos = "path/to/photo1.jpg,path/to/photo2.jpg";
        game.setPhotos(photos);
        assertEquals(photos, game.getPhotos());
    }

    @Test
    void testTagsSetter(){
        Game game = new Game("Game", "Desc", 10.0);
        String tags = "Adventure,Puzzle,Strategy";
        game.setTags(tags);
        assertEquals(tags, game.getTags());
    }

    @Test
    void testStartDateSetter(){
        Game game = new Game("Game", "Desc", 10.0);
        LocalDate date = LocalDate.of(2025, 6, 15);
        game.setStartDate(date);
        assertEquals(date, game.getStartDate());
    }

    @Test
    void testEndDateSetter(){
        Game game = new Game("Game", "Desc", 10.0);
        LocalDate date = LocalDate.of(2025, 12, 15);
        game.setEndDate(date);
        assertEquals(date, game.getEndDate());
    }

    @Test
    void testOwnerUsernameSetter(){
        Game game = new Game("Game", "Desc", 10.0);
        game.setOwnerUsername("john_doe");
        assertEquals("john_doe", game.getOwnerUsername());
    }

    @Test
    void testCreatedAtSetter(){
        Game game = new Game("Game", "Desc", 10.0);
        LocalDate date = LocalDate.of(2025, 1, 1);
        game.setCreatedAt(date);
        assertEquals(date, game.getCreatedAt());
    }

    @Test
    void testActiveFalse(){
        Game game = new Game("Game", "Desc", 10.0);
        game.setActive(false);
        assertFalse(game.isActive());
        
        game.setActive(true);
        assertTrue(game.isActive());
    }

    @Test
    void testMultipleSettersInSequence(){
        Game game = new Game("Original", "Original Desc", 5.0);
        
        game.setTitle("Updated Title");
        game.setDescription("Updated Description");
        game.setPricePerDay(15.0);
        game.setCondition("very good");
        game.setPhotos("new_photo.jpg");
        game.setTags("NewTag");
        game.setActive(false);
        game.setOwnerUsername("new_owner");
        
        assertEquals("Updated Title", game.getTitle());
        assertEquals("Updated Description", game.getDescription());
        assertEquals(15.0, game.getPricePerDay());
        assertEquals("very good", game.getCondition());
        assertEquals("new_photo.jpg", game.getPhotos());
        assertEquals("NewTag", game.getTags());
        assertFalse(game.isActive());
        assertEquals("new_owner", game.getOwnerUsername());
    }
    
}
