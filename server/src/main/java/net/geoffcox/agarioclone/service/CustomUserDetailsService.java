package net.geoffcox.agarioclone.service;

import net.geoffcox.agarioclone.model.User;
import net.geoffcox.agarioclone.repository.UserRepository;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

import java.util.stream.Collectors;

@Service
public class CustomUserDetailsService implements UserDetailsService {

    private final UserRepository userRepository;

    public CustomUserDetailsService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    @Override
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new UsernameNotFoundException("User not found: " + username));

        return new User(
                user.getUsername(),
                user.getPassword(),
                user.getEmail()
        );
    }

    boolean existsByUsername(String username) {
        return userRepository.existsByUsername(username);
    }

    boolean existsByEmail(String email) {
        return userRepository.existsByEmail(email);
    }
}
