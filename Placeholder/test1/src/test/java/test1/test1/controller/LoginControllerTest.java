package test1.test1.controller;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.view;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.test.context.web.WebAppConfiguration;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;
import org.springframework.web.context.WebApplicationContext;
import org.junit.jupiter.api.BeforeEach;

@SpringBootTest
@WebAppConfiguration
public class LoginControllerTest {

    @Autowired
    private WebApplicationContext context;

    private MockMvc mockMvc;

    @BeforeEach
    public void setup() {
        mockMvc = MockMvcBuilders.webAppContextSetup(context).build();
    }


    @Test
    void loginPageTest() throws Exception {
        mockMvc.perform(get("/login"))
                .andExpect(status().isOk())
                .andExpect(view().name("login"));
    }

    @Test
    void homePageTest() throws Exception {
        mockMvc.perform(get("/"))
                .andExpect(status().isOk())
                .andExpect(view().name("login"));
    }

    @Test
    void listingsPageTest() throws Exception {
        mockMvc.perform(get("/listings"))
                .andExpect(status().isOk())
                .andExpect(view().name("listings"));
    }

    @Test
    void addVideogamePageTest() throws Exception {
        mockMvc.perform(get("/addvideogame"))
                .andExpect(status().isOk())
                .andExpect(view().name("addvideogame"));
    }

    @Test
    void bookingRequestsPageTest() throws Exception {
        mockMvc.perform(get("/bookingrequests"))
                .andExpect(status().isOk())
                .andExpect(view().name("bookingrequests"));
    }
}
