package com.ecommerce.backend.user;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class UserService {

    @Autowired
    private UserRepository userRepository;

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

