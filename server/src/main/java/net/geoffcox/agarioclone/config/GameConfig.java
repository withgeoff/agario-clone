package net.geoffcox.agarioclone.config;

import net.geoffcox.agarioclone.model.GameState;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class GameConfig {

    @Bean
    public GameState gameState() {
        return new GameState();
    }
} 