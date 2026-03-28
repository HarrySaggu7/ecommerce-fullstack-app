package com.ecommerce.backend.user;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/users")
@CrossOrigin(origins = "http://localhost:3000")
public class UserController {

    @Autowired
    private UserService userService;

    @PostMapping("/register")
    public User registerUser(@RequestBody User user) {
        return userService.registerUser(user);
    }

    @PostMapping("/login")
public Object loginUser(@RequestBody User user) {
    User loggedInUser = userService.loginUser(user.getEmail(), user.getPassword());

    if (loggedInUser == null) {
        return "Invalid email or password";
    }

    return loggedInUser;
}
}
