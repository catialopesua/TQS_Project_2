package test1.tests.unittests;

import static org.junit.jupiter.api.Assertions.assertEquals;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import test1.test1.dto.UserResponse;

public class UserResponseTest {

    private UserResponse userResponse;
    
    @BeforeEach
    void setup(){
        userResponse = new UserResponse(2, "DiogoNasc2005", "Professional description", "CoolestRole");
    }

    @Test
    void testUserResponseGetters(){
        assertEquals(userResponse.getUserId(),2);
        assertEquals(userResponse.getUsername(),"DiogoNasc2005");
        assertEquals(userResponse.getBio(),"Professional description");
        assertEquals(userResponse.getRole(),"CoolestRole");
    }

    @Test
    void testUserResponseSetters(){
        userResponse.setUsername("Ana");
        userResponse.setUserId(4);
        userResponse.setRole("NotSoCoolRole");
        userResponse.setBio("Very descriptive bio");
        assertEquals(userResponse.getUserId(),4);
        assertEquals(userResponse.getUsername(),"Ana");
        assertEquals(userResponse.getBio(),"Very descriptive bio");
        assertEquals(userResponse.getRole(),"NotSoCoolRole");
    }


}
