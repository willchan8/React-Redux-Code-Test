import * as actions from './actions';
import BFS from './BFS';
import { initialState } from './initialState';

const reducer = (state = initialState, action) => {
  switch (action.type) {
    case actions.STEP: {
      const mapWidth = state.mapWidth;
      const mapHeight = state.mapHeight;

      // Make copies of individual states to prevent mutating original state
      let log = [...state.log];
      let map = [...state.map];
      let enemies = state.enemies.map(enemy => (Object.assign({}, enemy)));
      let player = Object.assign({}, state.player);

      let prevPlayerPosition = player.position; // Temp variable to store player position at start of turn
      let nextPlayerPosition;
      let nextPlayerDirection;

      switch (action.keyCode) {
        case 37: // Left
          nextPlayerPosition = prevPlayerPosition - 1;
          nextPlayerDirection = 'west';
          break;
        case 38: // Up
          nextPlayerPosition = prevPlayerPosition - mapWidth;
          nextPlayerDirection = 'north';
          break;
        case 39: // Right
          nextPlayerPosition = prevPlayerPosition + 1;
          nextPlayerDirection = 'east'
          break;
        case 40: // Down
          nextPlayerPosition = prevPlayerPosition + mapWidth;
          nextPlayerDirection = 'south'
          break;
        default:
          break;
      }

      // Player (@) is only able to move onto any adjacent '.' tile
      if (map[nextPlayerPosition] === '.') {
        // If the player (@) started a turn adjacent to an enemy (e) and moves away, the player (@) gets attacked by that enemy (e).
        enemies.forEach(enemy => {
          if (
              prevPlayerPosition === enemy.position - 1 ||
              prevPlayerPosition === enemy.position + 1 ||
              prevPlayerPosition === enemy.position - mapWidth ||
              prevPlayerPosition === enemy.position + mapWidth
            ) {
            player.hp -= enemy.damage;
            log.push('enemy attacked player');
          }
        });
        // Update player (@) position and add message to log copy
        player.position = nextPlayerPosition;
        map[player.position] = '@';
        map[prevPlayerPosition] = '.';
        log.push(`player moved ${nextPlayerDirection}`);
      }

      // Player (@) attacks enemies (e)
      if (map[nextPlayerPosition] === 'e') {
        enemies.forEach(enemy => {
          if (nextPlayerPosition === enemy.position) {
            enemy.hp -= player.damage;
            log.push('player attacked enemy');
          }
          // Remove enemy (e) from game if its health is 0 or less
          if (enemy.hp <= 0) {    
            enemies = enemies.filter(enemy => !(enemy.hp <= 0));
            map[enemy.position] = '.';
          }
        });
      }

      // Move enemies (e) toward player (@) using BFS utility function
      enemies.forEach(enemy => {
        let enemyMoves = BFS(enemy.position, prevPlayerPosition, map, mapWidth, mapHeight);
        let nextEnemyPosition = enemyMoves[0];
        let prevEnemyPosition = enemy.position;
        if ((map[nextEnemyPosition] === '.') && (nextEnemyPosition !== prevPlayerPosition)) {
          enemy.position = nextEnemyPosition;
          map[enemy.position] = 'e';
          map[prevEnemyPosition] = '.';
        }
        // Enemies (e) adjacent to the player (@) will attack if player (@) doesn't move
        if ((nextEnemyPosition === player.position) && (prevPlayerPosition === player.position)) {
          player.hp -= enemy.damage;
          log.push('enemy attacked player');
        }
      });

      // Return the next state
      return Object.assign({}, state, {
        map,
        player,
        enemies,
        log,
      });
    }
  case actions.SET_MAP_SIZE: {
      let map = [];
      const dimension = action.height * action.width;
      for (let i = 0; i < dimension; ++i) {
        //place walls on perimeter of the level
        if (
          i % action.width === 0 ||
          (i + 1) % action.width === 0 ||
          i <= action.width ||
          i > (dimension - action.width)
        ) {
          map.push('#');
        } else {
          map.push('.');
        }
      }
      //put player in top-left corner
      map[action.width + 1] = '@';
      let player = Object.assign({}, state.player);
      player.position = action.width + 1;
      return Object.assign({}, state, {
        mapHeight: action.height,
        mapWidth: action.width,
        map,
        player,
      });
    }
    case actions.ADD_ENEMY: {
      let nextMap = state.map.map(value => value);
      let enemies = state.enemies.map(value => value);
      if(nextMap[action.index] !== '@' && nextMap[action.index] !== '#') {
        nextMap[action.index] = 'e';
        enemies.push({
          hp: 5,
          damage: 1,
          position: action.index,
        });
      }
      return {...state, ...{ map: nextMap, enemies }}
    }
    default: return state;
  }
}

export default reducer;