package test1.tests.unittests;

import test1.test1.model.User;

import static org.junit.jupiter.api.Assertions.assertEquals;

import org.junit.jupiter.api.Test;

public class UserTest {

    @Test
    void testUserConstructorAndGetters1() {
        User user = new User("Tiago");

        assertEquals("Tiago", user.getUsername());
    }

    @Test
    void testUserSetters() {
        User user = new User("Tiago","1234","Biography","Role");

        user.setUsername("José");
        user.setUserId(10);
        user.setBio("Another Biography");
        user.setPassword("1600");
        user.setRole("Another Role");


    }

    @Test
    void testUserConstructorAndGetters2(){
        User user = new User("Ana","123141");
        assertEquals("Ana", user.getUsername());
        assertEquals(user.getPassword(),"123141");
    }

    @Test
    void testUserConstructorAndGetters3(){
        User user = new User("Anastacia","445566","Cool Biography");
        assertEquals("Anastacia", user.getUsername());
        assertEquals(user.getPassword(),"445566");
        assertEquals(user.getBio(),"Cool Biography");

    }

    @Test
    void testUserConstructorAndGetters4(){
        User user = new User("Anastacia","445566","Cool Biography","A Role");
        assertEquals("Anastacia", user.getUsername());
        assertEquals(user.getPassword(),"445566");
        assertEquals(user.getBio(),"Cool Biography");
        assertEquals(user.getRole(),"A Role");
    }
}
