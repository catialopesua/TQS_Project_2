package test1.tests.unittests;

import static org.junit.jupiter.api.Assertions.assertEquals;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import test1.test1.dto.GameRequest;

public class GameRequestTest {
    
    private GameRequest gameRequest;

    @BeforeEach
    void setup(){
        gameRequest=new GameRequest();
        gameRequest.setTitle("Title");
        gameRequest.setDescription("Desc");
        gameRequest.setPrice(123.0);
        gameRequest.setCondition("Condition1");
        gameRequest.setPhotos("photos.pnglsttxt");
        gameRequest.setActive(true);
        gameRequest.setStartDate("18-10-2025");
        gameRequest.setEndDate("12-12-2025");
        gameRequest.setOwnerUsername("Diogo");
    }

    @Test
    void testGameRequestGetters(){
        assertEquals(gameRequest.getTitle(), "Title");
        assertEquals(gameRequest.getDescription(), "Desc");
        assertEquals(gameRequest.getPrice(), 123.0);
        assertEquals(gameRequest.getCondition(), "Condition1");
        assertEquals(gameRequest.getPhotos(), "photos.pnglsttxt");
        assertEquals(gameRequest.getActive(), true);
        assertEquals(gameRequest.getStartDate(), "18-10-2025");
        assertEquals(gameRequest.getEndDate(),"12-12-2025");
        assertEquals(gameRequest.getOwnerUsername(), "Diogo");
    }


    @Test
    void testGameRequestSetters(){
        gameRequest.setTitle("Title2");
        gameRequest.setDescription("Desc2");
        gameRequest.setPrice(124.0);
        gameRequest.setCondition("Condition12");
        gameRequest.setPhotos("photos.pnglsttxt11");
        gameRequest.setActive(false);
        gameRequest.setStartDate("18-10-2026");
        gameRequest.setEndDate("12-12-2026");
        gameRequest.setOwnerUsername("Diogo123");

        assertEquals(gameRequest.getTitle(), "Title2");
        assertEquals(gameRequest.getDescription(), "Desc2");
        assertEquals(gameRequest.getPrice(), 124.0);
        assertEquals(gameRequest.getCondition(), "Condition12");
        assertEquals(gameRequest.getPhotos(), "photos.pnglsttxt11");
        assertEquals(gameRequest.getActive(), false);
        assertEquals(gameRequest.getStartDate(), "18-10-2026");
        assertEquals(gameRequest.getEndDate(),"12-12-2026");
        assertEquals(gameRequest.getOwnerUsername(), "Diogo123");
    }

}
