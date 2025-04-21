import React, { useState, useEffect, useCallback } from 'react';
import styled from 'styled-components';
import { Artist as ImportedArtist, artists as artistData } from '../data/artists';
import jazzTentImage from '../assets/tent-jazz.png';
import rockTentImage from '../assets/tent-rock.png';
import synthTentImage from '../assets/tent-synthpop.png';
import hiphopTentImage from '../assets/tent-hiphop.png';
import electronicTentImage from '../assets/tent-electronic.png';
import bubblepopTentImage from '../assets/tent-bubblepop.png';
import mainCharacterFront from '../assets/character-main-front.png';
import mainCharacterBack from '../assets/character-main-back.png';
import mainCharacterLeft from '../assets/character-main-left.png';
import mainCharacterRight from '../assets/character-main-right.png';
import beethovenImage from '../assets/character-beethoven.png';
import domiJdImage from '../assets/character-domi-jd.png';
import paramoreImage from '../assets/character-paramore.png';
import sabrinaImage from '../assets/character-sabrina.png';
import backgroundImage from '../assets/background.png';

interface Tent {
  x: number;
  y: number;
  genre: string;
  islocked: boolean;
}

interface StyledTentProps {
  $x: number;
  $y: number;
  $islocked: boolean;
}

interface CharacterPosition {
  x: number;
  y: number;
}

type Direction = 'up' | 'down' | 'left' | 'right';

interface Artist extends ImportedArtist {
  isCollected: boolean;
}

interface ArtistImageProps {
  $genre: string;
}

const GameContainer = styled.div`
  position: relative;
  width: 800px;
  height: 600px;
  background-image: url(${backgroundImage});
  background-size: cover;
  background-position: center;
  overflow: hidden;
  outline: none;
`;

const Character = styled.div<{ $x: number; $y: number; $direction: Direction }>`
  position: absolute;
  left: ${props => props.$x}px;
  top: ${props => props.$y}px;
  width: 64px;
  height: 64px;
  background-image: ${props => {
    switch(props.$direction) {
      case 'up': return `url("${mainCharacterBack}")`;
      case 'down': return `url("${mainCharacterFront}")`;
      case 'left': return `url("${mainCharacterLeft}")`;
      case 'right': return `url("${mainCharacterRight}")`;
      default: return `url("${mainCharacterFront}")`;
    }
  }};
  background-size: contain;
  background-position: center;
  background-repeat: no-repeat;
  transition: left 0.1s linear, top 0.1s linear;
  z-index: 1;
`;

const TentContainer = styled.div<StyledTentProps>`
  position: absolute;
  left: ${props => props.$x}px;
  top: ${props => props.$y}px;
  width: 128px;
  height: 128px;
  opacity: ${props => props.$islocked ? 0.5 : 1};
  display: flex;
  flex-direction: column;
  align-items: center;
`;

const TentShape = styled.div<{ $islocked: boolean; $genre: string }>`
  width: 100%;
  height: 100%;
  opacity: ${props => props.$islocked ? 0.5 : 1};
  background-image: ${props => {
    switch(props.$genre) {
      case 'Jazz Jive Isle': return `url(${jazzTentImage})`;
      case 'Amp Valley': return `url(${rockTentImage})`;
      case 'Synth City': return `url(${synthTentImage})`;
      case 'Hip-Hop Junction': return `url(${hiphopTentImage})`;
      case 'Electronica': return `url(${electronicTentImage})`;
      case 'Bubble Pop Town': return `url(${bubblepopTentImage})`;
      default: return 'none';
    }
  }};
  background-size: contain;
  background-position: center;
  background-repeat: no-repeat;
  image-rendering: pixelated;
  margin-bottom: 5px;
`;

const TentLabel = styled.div`
  color: white;
  font-size: 12px;
  text-shadow: 2px 2px 0 #000;
  white-space: nowrap;
  margin-top: 0;
`;

const SetlistUI = styled.div`
  position: absolute;
  bottom: 20px;
  right: 20px;
  background: rgba(0, 0, 0, 0.7);
  padding: 10px;
  border: 2px solid #f1c40f;
  color: white;
  font-family: monospace;
  font-size: 12px;
  max-width: 200px;
`;

const SetlistTitle = styled.h3`
  margin: 0 0 10px 0;
  color: #f1c40f;
  text-align: center;
`;

const ArtistEntry = styled.div<{ $isCollected: boolean }>`
  margin: 5px 0;
  padding: 5px;
  background: ${props => props.$isCollected ? 'rgba(241, 196, 15, 0.1)' : 'rgba(0, 0, 0, 0.3)'};
  border: ${props => props.$isCollected ? '1px solid #f1c40f' : '1px dashed #666'};
  text-align: center;
  opacity: ${props => props.$isCollected ? 1 : 0.7};
`;

const DialogueBox = styled.div`
  position: absolute;
  bottom: 20px;
  left: 50%;
  transform: translateX(-50%);
  width: 400px;
  background: rgba(0, 0, 0, 0.8);
  padding: 20px;
  border: 2px solid #f1c40f;
  color: white;
  font-family: monospace;
  font-size: 12px;
  line-height: 1.5;
  z-index: 2;
`;

const CloseButton = styled.button`
  position: absolute;
  top: 10px;
  right: 10px;
  background: none;
  border: none;
  color: #f1c40f;
  font-size: 20px;
  cursor: pointer;
  padding: 0;
  &:hover {
    color: white;
  }
`;

const SpeakerName = styled.div`
  color: #f1c40f;
  margin-bottom: 10px;
`;

const DialogueText = styled.div`
  min-height: 36px;
`;

const CompletionOverlay = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.9);
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  color: white;
  font-family: monospace;
  animation: fadeIn 1s ease-in;
  
  @keyframes fadeIn {
    from { opacity: 0; }
    to { opacity: 1; }
  }
`;

const CompletionTitle = styled.h1`
  color: #f1c40f;
  font-size: 48px;
  margin-bottom: 20px;
  text-shadow: 0 0 10px rgba(241, 196, 15, 0.5);
`;

const CompletionText = styled.p`
  font-size: 20px;
  text-align: center;
  max-width: 600px;
  line-height: 1.5;
  margin-bottom: 30px;
`;

const Stage = styled.div`
  width: 600px;
  height: 200px;
  background: #333;
  border: 4px solid #f1c40f;
  position: relative;
  margin: 40px 0;
  display: flex;
  justify-content: space-around;
  align-items: center;
  padding: 20px;
`;

const StageSpotlight = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: radial-gradient(circle at center, rgba(241, 196, 15, 0.2) 0%, transparent 70%);
  pointer-events: none;
`;

const ArtistOnStage = styled.div`
  text-align: center;
  padding: 10px;
  background: rgba(0, 0, 0, 0.5);
  border: 2px solid #f1c40f;
  border-radius: 5px;
  min-width: 120px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
`;

const ArtistName = styled.div`
  font-size: 16px;
  color: #f1c40f;
  margin-bottom: 5px;
`;

const RestartButton = styled.button`
  background: #f1c40f;
  color: #000;
  border: none;
  padding: 10px 20px;
  font-size: 16px;
  cursor: pointer;
  border-radius: 5px;
  font-family: monospace;
  transition: all 0.3s ease;
  margin-top: 20px;
  margin-bottom: 40px;
  
  &:hover {
    background: #f39c12;
    transform: scale(1.05);
  }
`;

const TriviaBox = styled.div`
  position: absolute;
  bottom: 20px;
  left: 50%;
  transform: translateX(-50%);
  width: 400px;
  background: rgba(0, 0, 0, 0.8);
  padding: 20px;
  border: 2px solid #f1c40f;
  color: white;
  font-family: monospace;
  font-size: 12px;
  line-height: 1.5;
  z-index: 2;
`;

const TriviaQuestion = styled.div`
  margin-bottom: 15px;
  font-weight: bold;
`;

const TriviaOption = styled.button<{ $selected?: boolean }>`
  display: block;
  width: 100%;
  padding: 10px;
  margin: 5px 0;
  background: ${props => props.$selected ? '#f1c40f' : 'transparent'};
  color: ${props => props.$selected ? '#000' : '#fff'};
  border: 1px solid #f1c40f;
  cursor: pointer;
  text-align: left;
  font-family: monospace;
  
  &:hover {
    background: ${props => props.$selected ? '#f1c40f' : 'rgba(241, 196, 15, 0.2)'};
  }
`;

const ArtistSprite = styled.div<{ $x: number; $y: number; $genre: string }>`
  position: absolute;
  left: ${props => props.$x}px;
  top: ${props => props.$y}px;
  width: ${props => {
    switch(props.$genre) {
      case 'Jazz Jive Isle': return '64px';  // Domi & JD Beck (duo)
      case 'Amp Valley': return '88px';      // Paramore (band) - even larger
      case 'Synth City': return '56px';      // Sabrina Carpenter (solo)
      default: return '48px';
    }
  }};
  height: ${props => {
    switch(props.$genre) {
      case 'Jazz Jive Isle': return '64px';
      case 'Amp Valley': return '88px';
      case 'Synth City': return '56px';
      default: return '48px';
    }
  }};
  background-size: contain;
  background-position: center;
  background-repeat: no-repeat;
  filter: drop-shadow(2px 2px 2px rgba(0,0,0,0.5));
  background-image: ${props => {
    switch(props.$genre) {
      case 'Jazz Jive Isle': return `url(${domiJdImage})`;
      case 'Amp Valley': return `url(${paramoreImage})`;
      case 'Synth City': return `url(${sabrinaImage})`;
      default: return 'none';
    }
  }};
  z-index: 3;
`;

const InteractionPrompt = styled.div`
  position: absolute;
  left: 50%;
  bottom: 20px;
  background: rgba(0, 0, 0, 0.9);
  color: #f1c40f;
  padding: 8px 12px;
  border-radius: 4px;
  font-size: 14px;
  font-weight: bold;
  transform: translateX(-50%);
  white-space: nowrap;
  border: 2px solid #f1c40f;
  pointer-events: none;
  z-index: 1000;
  text-shadow: 1px 1px 0 #000;
  box-shadow: 0 2px 4px rgba(0,0,0,0.5);
`;

const BeethovenCharacter = styled.div`
  position: absolute;
  left: 50%;
  bottom: 150px;
  transform: translateX(-50%);
  width: 64px;
  height: 64px;
  background-image: url(${beethovenImage});
  background-size: contain;
  background-position: center;
  background-repeat: no-repeat;
  filter: drop-shadow(2px 2px 2px rgba(0,0,0,0.5));
`;

const FestivalConfirmation = styled.div`
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 400px;
  background: rgba(0, 0, 0, 0.9);
  padding: 20px;
  border: 2px solid #f1c40f;
  color: white;
  font-family: monospace;
  text-align: center;
  z-index: 1000;
`;

const FestivalButton = styled.button`
  background: #f1c40f;
  color: #000;
  border: none;
  padding: 10px 20px;
  margin: 10px;
  font-size: 16px;
  cursor: pointer;
  border-radius: 5px;
  font-family: monospace;
  transition: all 0.3s ease;
  
  &:hover {
    background: #f39c12;
    transform: scale(1.05);
  }
`;

const SpaceIndicator = styled.div`
  color: #f1c40f;
  font-size: 12px;
  text-align: right;
  margin-top: 10px;
  font-style: italic;
  opacity: 0.8;
`;

const ArtistImage = styled.img<ArtistImageProps>`
  width: ${props => {
    switch(props.$genre) {
      case 'Jazz Jive Isle': return '64px';
      case 'Amp Valley': return '88px';
      case 'Synth City': return '56px';
      default: return '48px';
    }
  }};
  height: ${props => {
    switch(props.$genre) {
      case 'Jazz Jive Isle': return '64px';
      case 'Amp Valley': return '88px';
      case 'Synth City': return '56px';
      default: return '48px';
    }
  }};
  margin-bottom: 10px;
  filter: drop-shadow(2px 2px 2px rgba(0,0,0,0.5));
  object-fit: contain;
`;

const Game: React.FC = () => {
  const [tents, setTents] = useState<Tent[]>([
    { x: 50, y: 50, genre: 'Jazz Jive Isle', islocked: false },
    { x: 300, y: 50, genre: 'Amp Valley', islocked: false },
    { x: 550, y: 50, genre: 'Synth City', islocked: false },
    { x: 50, y: 225, genre: 'Hip-Hop Junction', islocked: true },
    { x: 300, y: 225, genre: 'Electronica', islocked: true },
    { x: 550, y: 225, genre: 'Bubble Pop Town', islocked: true }
  ]);
  
  const [artists, setArtists] = useState<Artist[]>(
    artistData.map((artist: ImportedArtist): Artist => ({
      ...artist,
      isCollected: false
    }))
  );

  const [characterPosition, setCharacterPosition] = useState<CharacterPosition>({ x: 300, y: 400 });
  const [characterDirection, setCharacterDirection] = useState<Direction>('down');
  const [showCompletion, setShowCompletion] = useState(false);
  const [currentGenre, setCurrentGenre] = useState<string | null>(null);
  const [isInDialogue, setIsInDialogue] = useState(false);
  const [dialogueIndex, setDialogueIndex] = useState(0);
  const [showTrivia, setShowTrivia] = useState(false);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [nearbyArtist, setNearbyArtist] = useState<Artist | null>(null);
  const [showFeedback, setShowFeedback] = useState(false);
  const [isAnswerCorrect, setIsAnswerCorrect] = useState(false);
  const [nearBeethoven, setNearBeethoven] = useState(false);
  const [showFestivalConfirmation, setShowFestivalConfirmation] = useState(false);

  const beethovenDialogue = [
    "Welcome to the Music Festival! I'm Beethoven, your guide.",
    "Your mission is to collect artists for your festival lineup.",
    "Use the ARROW KEYS to move around the festival grounds.",
    "Approach each tent and press SPACE to talk to the artists.",
    "Answer their trivia questions correctly to add them to your setlist.",
    "Collect all artists to complete the festival!",
    "Good luck, and may the music be with you!"
  ];

  const [showBeethovenDialogue, setShowBeethovenDialogue] = useState(true);
  const [beethovenDialogueIndex, setBeethovenDialogueIndex] = useState(0);

  const unlockTent = (genre: string) => {
    setTents(tents.map(tent => 
      tent.genre === genre ? { ...tent, islocked: false } : tent
    ));
    setArtists(artists.map(artist =>
      artist.genre === genre ? { ...artist, isCollected: true } : artist
    ));

    // Check if all artists are collected
    const allCollected = artists.every(artist => 
      artist.genre === genre ? true : artist.isCollected
    );
    
    if (allCollected) {
      setShowFestivalConfirmation(true);
    }
  };

  const getCurrentArtist = useCallback(() => {
    if (!currentGenre) return null;
    return artists.find(artist => artist.genre === currentGenre);
  }, [currentGenre, artists]);

  const getCurrentDialogue = () => {
    const artist = getCurrentArtist();
    if (!artist || dialogueIndex < 0) return null;
    
    const dialogueArray = artist.isCollected ? artist.collectedDialogue : artist.dialogue;
    if (dialogueIndex >= dialogueArray.length) return null;
    
    return {
      text: dialogueArray[dialogueIndex],
      speaker: artist.name
    };
  };

  const handleKeyPress = useCallback((e: KeyboardEvent) => {
    if (!isInDialogue || !currentGenre) return;
    if (showTrivia) return;

    const artist = getCurrentArtist();
    if (!artist) return;

    if (e.key === ' ') {
      e.preventDefault();
      const dialogueArray = artist.isCollected ? artist.collectedDialogue : artist.dialogue;
      if (dialogueIndex >= dialogueArray.length - 1) {
        if (!artist.isCollected) {
          setShowTrivia(true);
        } else {
          setIsInDialogue(false);
          setCurrentGenre(null);
          setDialogueIndex(0);
        }
      } else {
        setDialogueIndex(prev => prev + 1);
      }
    }
  }, [isInDialogue, currentGenre, showTrivia, dialogueIndex, getCurrentArtist]);

  const handleTriviaAnswer = (answerIndex: number) => {
    setSelectedAnswer(answerIndex);
    const artist = getCurrentArtist();
    if (!artist) return;

    setIsAnswerCorrect(answerIndex === artist.trivia.correctAnswer);
    setShowFeedback(true);

    // Wait 2 seconds before proceeding
    setTimeout(() => {
      setShowFeedback(false);
      if (answerIndex === artist.trivia.correctAnswer) {
        unlockTent(artist.genre);
        setIsInDialogue(false);
        setShowTrivia(false);
        setCurrentGenre(null);
        setDialogueIndex(0);
        setSelectedAnswer(null);
      }
    }, 2000);
  };

  const checkArtistProximity = useCallback((x: number, y: number) => {
    return artists.find(artist => {
      const tent = tents.find(t => t.genre === artist.genre);
      if (!tent || tent.islocked) return false;
      
      const artistX = tent.x + 140;
      const artistY = tent.y + 40;
      const distance = Math.sqrt(
        Math.pow(x - artistX, 2) + 
        Math.pow(y - artistY, 2)
      );
      return distance < 100;
    });
  }, [artists, tents]);

  const checkTentProximity = useCallback((x: number, y: number) => {
    const nearby = tents.find(tent => {
      const distance = Math.sqrt(
        Math.pow(x - (tent.x + 32), 2) + 
        Math.pow(y - (tent.y + 32), 2)
      );
      return distance < 100;
    });
    return nearby !== null;
  }, [tents]);

  const checkBeethovenProximity = (x: number, y: number) => {
    const beethovenX = 400; // Center of screen
    const beethovenY = 450; // Moved up from 500
    const distance = Math.sqrt(
      Math.pow(x - beethovenX, 2) + 
      Math.pow(y - beethovenY, 2)
    );
    setNearBeethoven(distance < 100);
  };

  const collidesWithBeethoven = (x: number, y: number) => {
    const beethovenX = 400; // Center of screen
    const beethovenY = 450; // Beethoven's position
    const beethovenLeft = beethovenX - 16; // Half of 32px width
    const beethovenRight = beethovenX + 16;
    const beethovenTop = beethovenY - 24; // Half of 48px height
    const beethovenBottom = beethovenY + 24;
    const charLeft = x;
    const charRight = x + 32;
    const charTop = y;
    const charBottom = y + 32;

    // Only check for collision if character is trying to move behind Beethoven
    if (y > beethovenY) {
      return !(
        charRight < beethovenLeft ||
        charLeft > beethovenRight ||
        charBottom < beethovenTop ||
        charTop > beethovenBottom
      );
    }
    return false; // Allow movement in front of Beethoven
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === ' ') {
        e.preventDefault();
        
        if (showBeethovenDialogue) {
          if (beethovenDialogueIndex >= beethovenDialogue.length - 1) {
            setShowBeethovenDialogue(false);
            setBeethovenDialogueIndex(0);
          } else {
            setBeethovenDialogueIndex(prev => prev + 1);
          }
          return;
        }

        if (isInDialogue) {
          handleKeyPress(e);
          return;
        }

        if (nearBeethoven) {
          setShowBeethovenDialogue(true);
          setBeethovenDialogueIndex(0);
          return;
        }

        const nearbyArtist = checkArtistProximity(characterPosition.x, characterPosition.y);
        if (nearbyArtist) {
          const tent = tents.find(t => t.genre === nearbyArtist.genre);
          if (tent && !tent.islocked) {
            setCurrentGenre(tent.genre);
            setIsInDialogue(true);
            setDialogueIndex(0);
          }
        }
        return;
      }

      // Handle movement keys
      let newX = characterPosition.x;
      let newY = characterPosition.y;
      let newDirection = characterDirection;

      switch (e.key) {
        case 'ArrowUp':
          newY = Math.max(0, characterPosition.y - 32);
          newDirection = 'up';
          break;
        case 'ArrowDown':
          newY = Math.min(568, characterPosition.y + 32);
          newDirection = 'down';
          break;
        case 'ArrowLeft':
          newX = Math.max(0, characterPosition.x - 32);
          newDirection = 'left';
          break;
        case 'ArrowRight':
          newX = Math.min(768, characterPosition.x + 32);
          newDirection = 'right';
          break;
      }

      const collidesWithTent = tents.some(tent => {
        const tentLeft = tent.x;
        const tentRight = tent.x + 64;
        const tentTop = tent.y;
        const tentBottom = tent.y + 64;
        const charLeft = newX;
        const charRight = newX + 32;
        const charTop = newY;
        const charBottom = newY + 32;

        return !(
          charRight < tentLeft ||
          charLeft > tentRight ||
          charBottom < tentTop ||
          charTop > tentBottom
        );
      });

      if (!collidesWithTent && !collidesWithBeethoven(newX, newY)) {
        setCharacterPosition({ x: newX, y: newY });
        setCharacterDirection(newDirection);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [characterPosition, characterDirection, tents, isInDialogue, dialogueIndex, currentGenre, showBeethovenDialogue, beethovenDialogueIndex, nearBeethoven, artists, beethovenDialogue.length, checkArtistProximity, handleKeyPress]);

  useEffect(() => {
    checkTentProximity(characterPosition.x, characterPosition.y);
    checkBeethovenProximity(characterPosition.x, characterPosition.y);
    const nearbyArtist = checkArtistProximity(characterPosition.x, characterPosition.y);
    setNearbyArtist(nearbyArtist || null);
  }, [characterPosition, checkArtistProximity, checkTentProximity]);

  const renderTent = (tent: Tent, index: number) => {
    const styledProps: StyledTentProps = {
      $x: tent.x,
      $y: tent.y,
      $islocked: tent.islocked
    };

    const artist = artists.find(a => a.genre === tent.genre);

    return (
      <React.Fragment key={index}>
        <TentContainer {...styledProps}>
          <TentShape $islocked={tent.islocked} $genre={tent.genre} />
          <TentLabel>{tent.genre}</TentLabel>
        </TentContainer>
        {!tent.islocked && artist && (
          <ArtistSprite 
            $x={tent.x + 140} 
            $y={tent.y + 20}  // Adjusted to match Paramore's level
            $genre={tent.genre}
          />
        )}
      </React.Fragment>
    );
  };

  return (
    <GameContainer tabIndex={0}>
      {!showCompletion && (
        <>
          {tents.map(renderTent)}
          <Character 
            $x={characterPosition.x} 
            $y={characterPosition.y} 
            $direction={characterDirection}
          />
          {(nearbyArtist || nearBeethoven) && !isInDialogue && !showTrivia && !showBeethovenDialogue && !showCompletion && (
            <InteractionPrompt>
              {nearbyArtist ? 
                "Press SPACE to talk to " + nearbyArtist.name :
                "Press SPACE to talk to Beethoven"
              }
            </InteractionPrompt>
          )}
          <BeethovenCharacter style={{ bottom: '150px' }} />
          <SetlistUI>
            <SetlistTitle>SETLIST</SetlistTitle>
            {artists.map((artist, index) => (
              <ArtistEntry key={index} $isCollected={artist.isCollected}>
                {artist.isCollected ? artist.name : "???"}
              </ArtistEntry>
            ))}
          </SetlistUI>
        </>
      )}
      {showBeethovenDialogue && (
        <DialogueBox>
          <CloseButton onClick={() => {
            setShowBeethovenDialogue(false);
            setBeethovenDialogueIndex(0);
          }}>×</CloseButton>
          <SpeakerName>Beethoven</SpeakerName>
          <DialogueText>{beethovenDialogue[beethovenDialogueIndex]}</DialogueText>
          <SpaceIndicator>Press SPACE to continue</SpaceIndicator>
        </DialogueBox>
      )}
      {isInDialogue && !showTrivia && (currentDialogue => currentDialogue && (
        <DialogueBox>
          <CloseButton onClick={() => {
            setIsInDialogue(false);
            setCurrentGenre(null);
            setDialogueIndex(0);
          }}>×</CloseButton>
          <SpeakerName>{currentDialogue.speaker}</SpeakerName>
          <DialogueText>{currentDialogue.text}</DialogueText>
          <SpaceIndicator>Press SPACE to continue</SpaceIndicator>
        </DialogueBox>
      ))(getCurrentDialogue())}
      {showTrivia && (currentArtist => currentArtist && (
        <TriviaBox>
          <SpeakerName>{currentArtist.name}</SpeakerName>
          {showFeedback ? (
            <DialogueText>
              {isAnswerCorrect ? (
                <>
                  That's right! I'll join your festival! 
                  <br/>
                  {currentArtist.genre === 'Jazz' && "Time to bring some smooth vibes!"}
                  {currentArtist.genre === 'Rock' && "Let's make this festival rock!"}
                  {currentArtist.genre === 'Synthpop' && "Get ready to dance!"}
                </>
              ) : (
                <>
                  Sorry, that's not correct. Try again!
                  <br/>
                  {currentArtist.genre === 'Jazz' && "You gotta know your jazz history!"}
                  {currentArtist.genre === 'Rock' && "Rock knowledge needs some work!"}
                  {currentArtist.genre === 'Synthpop' && "Keep up with pop culture!"}
                </>
              )}
            </DialogueText>
          ) : (
            <>
              <TriviaQuestion>{currentArtist.trivia.question}</TriviaQuestion>
              {currentArtist.trivia.options.map((option, index) => (
                <TriviaOption
                  key={index}
                  $selected={selectedAnswer === index}
                  onClick={() => handleTriviaAnswer(index)}
                >
                  {option}
                </TriviaOption>
              ))}
            </>
          )}
        </TriviaBox>
      ))(getCurrentArtist())}
      {showFestivalConfirmation && (
        <FestivalConfirmation>
          <h2>Festival Time!</h2>
          <p>You've collected all the artists!</p>
          <p>Are you ready to start the music festival?</p>
          <div>
            <FestivalButton onClick={() => {
              setShowFestivalConfirmation(false);
              setShowCompletion(true);
            }}>
              Let's Rock!
            </FestivalButton>
          </div>
        </FestivalConfirmation>
      )}
      {showCompletion && (
        <CompletionOverlay>
          <CompletionTitle>FESTIVAL COMPLETE</CompletionTitle>
          <CompletionText>
            Congratulations! You've collected all the artists for an amazing festival lineup!
            The crowd is going wild and the music is pumping!
          </CompletionText>
          <Stage>
            <StageSpotlight />
            {artists.map((artist, index) => (
              <ArtistOnStage key={index}>
                <ArtistImage 
                  src={
                    artist.genre === 'Jazz Jive Isle' ? domiJdImage :
                    artist.genre === 'Amp Valley' ? paramoreImage :
                    artist.genre === 'Synth City' ? sabrinaImage :
                    undefined
                  }
                  alt={artist.name}
                  $genre={artist.genre}
                />
                <ArtistName>{artist.name}</ArtistName>
              </ArtistOnStage>
            ))}
          </Stage>
          <RestartButton onClick={() => window.location.reload()}>
            Play Again
          </RestartButton>
        </CompletionOverlay>
      )}
    </GameContainer>
  );
};

export default Game; 