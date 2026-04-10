package com.ecommerce.backend.user;

import com.ecommerce.backend.config.JwtUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import java.util.HashMap;
import java.util.Map;

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

    @Autowired
    private JwtUtil jwtUtil;

    @PostMapping("/login")
    public Object loginUser(@RequestBody User user) {
        User loggedInUser = userService.loginUser(user.getEmail(), user.getPassword());
        if (loggedInUser == null) {
            return "Invalid email or password";
        }
        String token = jwtUtil.generateToken(loggedInUser.getEmail());
        Map<String, Object> response = new HashMap<>();
        response.put("user", loggedInUser);
        response.put("token", token);
        return response;
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
