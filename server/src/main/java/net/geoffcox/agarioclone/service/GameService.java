package net.geoffcox.agarioclone.service;

import net.geoffcox.agarioclone.model.GameState;
import net.geoffcox.agarioclone.model.Player;
import org.springframework.stereotype.Service;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.scheduling.annotation.Scheduled;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class GameService {
    private final GameState gameState;
    private final SimpMessagingTemplate messagingTemplate;

    public Player createPlayer(String name) {
        Player player = new Player(name);
        gameState.addPlayer(player);
        return player;
    }

    public void removePlayer(String playerId) {
        gameState.removePlayer(playerId);
    }

    public void updatePlayerPosition(String playerId, double dx, double dy) {
        Player player = gameState.getPlayers().get(playerId);
        if (player != null) {
            player.move(dx, dy);
        }
    }

    @Scheduled(fixedRate = 1000 / 60) // 60 FPS
    public void gameLoop() {
        // Update player positions based on their movement vectors
        for (Player player : gameState.getPlayers().values()) {
            player.updatePosition();
        }
        
        gameState.updateFood();
        gameState.checkPlayerCollisions();
        
        // Broadcast game state to all players
        messagingTemplate.convertAndSend("/topic/game-state", gameState);
    }
} 