import React, { useEffect, useRef, useState } from 'react';
import styled from 'styled-components';
import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import { useAuth } from '../context/AuthContext';

const Canvas = styled.canvas`
  background-color: #f0f0f0;
  border: 1px solid #ccc;
  width: 100%;
  height: 100%;
`;

const ErrorMessage = styled.div`
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  background-color: rgba(255, 0, 0, 0.8);
  color: white;
  padding: 1rem;
  border-radius: 4px;
  text-align: center;
  z-index: 10;
`;

const LoadingMessage = styled.div`
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  background-color: rgba(0, 0, 0, 0.8);
  color: white;
  padding: 1rem;
  border-radius: 4px;
  text-align: center;
  z-index: 10;
`;

const GameCanvas = ({ playerName }) => {
  const canvasRef = useRef(null);
  const [gameState, setGameState] = useState(null);
  const [player, setPlayer] = useState(null);
  const [stompClient, setStompClient] = useState(null);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const viewportOffsetRef = useRef({ x: 0, y: 0 });
  const [error, setError] = useState(null);
  const [isConnecting, setIsConnecting] = useState(true);
  const { token } = useAuth();
  
  // Initialize WebSocket connection
  useEffect(() => {
    if (!token) {
      setError('Authentication token is missing. Please log in again.');
      setIsConnecting(false);
      return;
    }

    setIsConnecting(true);
    setError(null);
    
    try {
      const socket = new SockJS('/game-websocket');
      const client = new Client({
        webSocketFactory: () => socket,
        connectHeaders: {
          'Authorization': `Bearer ${token}`
        },
        debug: (str) => {
          console.log(str);
        },
        reconnectDelay: 5000,
        heartbeatIncoming: 4000,
        heartbeatOutgoing: 4000,
      });

      client.onConnect = () => {
        console.log('Connected to WebSocket');
        setIsConnecting(false);
        
        // Join the game
        client.publish({
          destination: '/app/join',
          body: playerName
        });
        
        // Subscribe to game state updates
        client.subscribe('/topic/game-state', (message) => {
          const gameStateData = JSON.parse(message.body);
          setGameState(gameStateData);
        });
        
        // Subscribe to player joined notifications
        client.subscribe('/topic/player-joined', (message) => {
          const playerData = JSON.parse(message.body);
          setPlayer(playerData);
        });
      };

      client.onStompError = (frame) => {
        console.error('STOMP error', frame);
        setError(`Connection error: ${frame.headers.message || 'Unknown error'}`);
        setIsConnecting(false);
      };

      client.onWebSocketError = (event) => {
        console.error('WebSocket error', event);
        setError('WebSocket connection error. Please try again later.');
        setIsConnecting(false);
      };

      client.activate();
      setStompClient(client);
      
      return () => {
        if (client) {
          client.deactivate();
        }
      };
    } catch (err) {
      console.error('Error setting up WebSocket connection:', err);
      setError(`Connection error: ${err.message}`);
      setIsConnecting(false);
    }
  }, [playerName, token]);
  
  // Handle mouse movement
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !stompClient || !player) return;
    
    const handleMouseMove = (e) => {
      const rect = canvas.getBoundingClientRect();
      const mouseX = e.clientX - rect.left;
      const mouseY = e.clientY - rect.top;
      
      setMousePosition({ x: mouseX, y: mouseY });
    };
    
    canvas.addEventListener('mousemove', handleMouseMove);
    return () => canvas.removeEventListener('mousemove', handleMouseMove);
  }, [stompClient, player]);
  
  // Send movement updates to server
  useEffect(() => {
    if (!stompClient || !player || !canvasRef.current) return;
    
    const canvas = canvasRef.current;
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    
    // Calculate direction vector from center to mouse
    const dx = mousePosition.x - centerX;
    const dy = mousePosition.y - centerY;
    
    // Normalize the vector for consistent speed
    const length = Math.sqrt(dx * dx + dy * dy);
    const normalizedDx = length > 0 ? dx / length : 0;
    const normalizedDy = length > 0 ? dy / length : 0;
    
    // Send movement to server
    stompClient.publish({
      destination: '/app/move',
      body: JSON.stringify({
        playerId: player.id,
        dx: normalizedDx,
        dy: normalizedDy
      })
    });
  }, [stompClient, player, mousePosition]);
  
  // Send movement updates at a fixed interval
  useEffect(() => {
    if (!stompClient || !player || !canvasRef.current) return;
    
    const interval = setInterval(() => {
      const canvas = canvasRef.current;
      const centerX = canvas.width / 2;
      const centerY = canvas.height / 2;
      
      // Calculate direction vector from center to mouse
      const dx = mousePosition.x - centerX;
      const dy = mousePosition.y - centerY;
      
      // Normalize the vector for consistent speed
      const length = Math.sqrt(dx * dx + dy * dy);
      const normalizedDx = length > 0 ? dx / length : 0;
      const normalizedDy = length > 0 ? dy / length : 0;
      
      // Send movement to server
      stompClient.publish({
        destination: '/app/move',
        body: JSON.stringify({
          playerId: player.id,
          dx: normalizedDx,
          dy: normalizedDy
        })
      });
    }, 1000 / 60); // 60 times per second
    
    return () => clearInterval(interval);
  }, [stompClient, player, mousePosition]);
  
  // Update viewport offset when player position changes
  useEffect(() => {
    if (!player || !gameState || !gameState.players[player.id]) return;
    
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const currentPlayer = gameState.players[player.id];
    viewportOffsetRef.current = {
      x: currentPlayer.x - canvas.width / 2,
      y: currentPlayer.y - canvas.height / 2
    };
  }, [player, gameState]);
  
  // Render game
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !gameState) return;
    
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Set canvas dimensions to match container
    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;
    
    // Draw grid background
    drawGrid(ctx, viewportOffsetRef.current);
    
    // Draw food
    gameState.foods.forEach(food => {
      const screenX = food.x - viewportOffsetRef.current.x;
      const screenY = food.y - viewportOffsetRef.current.y;
      
      // Only draw if on screen
      if (screenX >= -20 && screenX <= canvas.width + 20 && 
          screenY >= -20 && screenY <= canvas.height + 20) {
        ctx.beginPath();
        ctx.arc(screenX, screenY, food.radius, 0, Math.PI * 2);
        ctx.fillStyle = `rgb(${food.color.red}, ${food.color.green}, ${food.color.blue})`;
        ctx.fill();
        ctx.closePath();
      }
    });
    
    // Draw players
    Object.values(gameState.players).forEach(p => {
      const screenX = p.x - viewportOffsetRef.current.x;
      const screenY = p.y - viewportOffsetRef.current.y;
      
      // Only draw if on screen
      if (screenX >= -p.radius && screenX <= canvas.width + p.radius && 
          screenY >= -p.radius && screenY <= canvas.height + p.radius) {
        // Draw player circle
        ctx.beginPath();
        ctx.arc(screenX, screenY, p.radius, 0, Math.PI * 2);
        ctx.fillStyle = `rgb(${p.color.red}, ${p.color.green}, ${p.color.blue})`;
        ctx.fill();
        ctx.closePath();
        
        // Draw player name
        ctx.font = '12px Arial';
        ctx.fillStyle = 'black';
        ctx.textAlign = 'center';
        ctx.fillText(p.name, screenX, screenY - p.radius - 5);
        
        // Draw player score
        ctx.font = '10px Arial';
        ctx.fillText(`Score: ${Math.floor(p.score)}`, screenX, screenY - p.radius - 20);
      }
    });
    
    // Draw mouse pointer
    ctx.beginPath();
    ctx.arc(mousePosition.x, mousePosition.y, 5, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
    ctx.fill();
    ctx.closePath();
    
  }, [gameState, player, mousePosition]);
  
  // Draw grid function
  const drawGrid = (ctx, offset) => {
    const gridSize = 50;
    const offsetX = offset.x % gridSize;
    const offsetY = offset.y % gridSize;
    
    ctx.strokeStyle = '#ddd';
    ctx.lineWidth = 1;
    
    // Draw vertical lines
    for (let x = -offsetX; x <= ctx.canvas.width; x += gridSize) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, ctx.canvas.height);
      ctx.stroke();
    }
    
    // Draw horizontal lines
    for (let y = -offsetY; y <= ctx.canvas.height; y += gridSize) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(ctx.canvas.width, y);
      ctx.stroke();
    }
  };
  
  return (
    <>
      <Canvas ref={canvasRef} />
      {isConnecting && <LoadingMessage>Connecting to game server...</LoadingMessage>}
      {error && <ErrorMessage>{error}</ErrorMessage>}
    </>
  );
};

export default GameCanvas;
