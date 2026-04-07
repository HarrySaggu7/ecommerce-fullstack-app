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

    @PostMapping("/forgot-password")
    public String forgotPassword(@RequestBody java.util.Map<String, String> payload) {
        String email = payload.get("email");
        boolean exists = userService.userExistsByEmail(email);
        if (exists) {
            // In a real app, generate a secure token and link
            String resetLink = "https://yourfrontend.com/reset-password?email=" + email;
            userService.sendPasswordResetEmail(email, resetLink);
        }
        return "If this email exists, a reset link will be sent.";
    }
}
