package net.geoffcox.agarioclone.controller;

import net.geoffcox.agarioclone.model.MoveRequest;
import net.geoffcox.agarioclone.model.Player;
import net.geoffcox.agarioclone.service.GameService;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.SendTo;
import org.springframework.stereotype.Controller;
import lombok.RequiredArgsConstructor;

@Controller
@RequiredArgsConstructor
public class GameController {
    
    private final GameService gameService;
    
    @MessageMapping("/join")
    @SendTo("/topic/player-joined")
    public Player joinGame(String playerName) {
        return gameService.createPlayer(playerName);
    }
    
    @MessageMapping("/move")
    public void movePlayer(MoveRequest moveRequest) {
        gameService.updatePlayerPosition(
            moveRequest.getPlayerId(), 
            moveRequest.getDx(), 
            moveRequest.getDy()
        );
    }
    
    @MessageMapping("/leave")
    public void leaveGame(String playerId) {
        gameService.removePlayer(playerId);
    }
} 