package test1.test1.controller;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;

@Controller
public class LoginController {

    @GetMapping("/")
    public String home() {
        return "login";  // loads login.html from templates
    }

    @GetMapping("/login")
    public String login() {
        return "login";
    }

    @GetMapping("/listings")
    public String listings() {
        return "listings";
    }

    @GetMapping("/addvideogame")
    public String addVideogame() {
        return "addvideogame";
    }

    @GetMapping("/bookingrequests")
    public String bookingRequests() {
        return "bookingrequests";
    }
}