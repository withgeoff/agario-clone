import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { useAuth } from '../context/AuthContext';
import GameCanvas from '../components/GameCanvas';

const GameContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
  height: 100vh;
  padding: 1rem;
`;

const GameHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
  max-width: 1200px;
  margin-bottom: 1rem;
`;

const GameTitle = styled.h1`
  color: #333;
  font-size: 1.5rem;
`;

const LogoutButton = styled.button`
  padding: 0.5rem 1rem;
  background-color: #f44336;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  
  &:hover {
    background-color: #d32f2f;
  }
`;

const GameArea = styled.div`
  width: 100%;
  max-width: 1200px;
  height: calc(100vh - 100px);
  background-color: #f0f0f0;
  border: 1px solid #ddd;
  border-radius: 4px;
  position: relative;
  overflow: hidden;
`;

const Game = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  
  const handleLogout = () => {
    logout();
    navigate('/login');
  };
  
  return (
    <GameContainer>
      <GameHeader>
        <GameTitle>Agar.io Clone</GameTitle>
        <LogoutButton onClick={handleLogout}>Logout</LogoutButton>
      </GameHeader>
      
      <GameArea>
        {user && <GameCanvas playerName={user.username} />}
      </GameArea>
    </GameContainer>
  );
};

export default Game;