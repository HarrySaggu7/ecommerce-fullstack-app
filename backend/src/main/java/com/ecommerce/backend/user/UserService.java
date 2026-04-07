package com.ecommerce.backend.user;

import com.ecommerce.backend.order.OrderEmailService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class UserService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private OrderEmailService orderEmailService;

    public void sendPasswordResetEmail(String to, String resetLink) {
        String body = "To reset your password, click the following link: " + resetLink + "\nIf you did not request a password reset, please ignore this email.";
        orderEmailService.sendOrderConfirmation(to, body);
    }

    public boolean userExistsByEmail(String email) {
        return userRepository.findByEmail(email) != null;
    }

    public User registerUser(User user) {
        // If this is the first user, make them ADMIN
        if (userRepository.count() == 0) {
            user.setRole("ADMIN");
        } else if (user.getRole() == null || user.getRole().isEmpty()) {
            user.setRole("USER");
        }
        return userRepository.save(user);
    }

    public User loginUser(String email, String password) {
        User user = userRepository.findByEmail(email);
        if (user == null) {
            return null;
        }
        if (user.getPassword() != null && user.getPassword().equals(password)) {
            return user;
        }
        return null;
    }
}

