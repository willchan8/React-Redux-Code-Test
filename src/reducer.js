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

      let prevPlayerPosition = player.position;
      let nextPlayerPosition;
      let nextPlayerDirection;

      switch(action.keyCode) {
        case 37: // Left
          nextPlayerPosition = player.position - 1;
          nextPlayerDirection = 'west';
          break;
        case 38: // Up
          nextPlayerPosition = player.position - mapWidth;
          nextPlayerDirection = 'north';
          break;
        case 39: // Right
          nextPlayerPosition = player.position + 1;
          nextPlayerDirection = 'east'
          break;
        case 40: // Down
          nextPlayerPosition = player.position + mapWidth;
          nextPlayerDirection = 'south'
          break;
        default:
          break;
      }

      // Move player (@) position on map and add message to log copy if able to move
      if (map[nextPlayerPosition] === '.') {
        player.position = nextPlayerPosition;
        map[player.position] = '@';
        map[prevPlayerPosition] = '.';
        log.push(`player moved ${nextPlayerDirection}`);
      }

      // Move enemies (e) toward player using BFS utility function
      let prevEnemyPosition;
      let nextEnemyPosition;
      let enemyMoves;
      enemies.forEach(enemy => {
        enemyMoves = BFS(enemy.position, player.position, map, mapWidth, mapHeight);
        nextEnemyPosition = enemyMoves[0];
        prevEnemyPosition = enemy.position;
        if (map[nextEnemyPosition] === '.') {
          enemy.position = nextEnemyPosition;
          map[enemy.position] = 'e';
          map[prevEnemyPosition] = '.';
        }
      });

      // Player (@) attacks enemies (e)
      if (map[nextPlayerPosition] === 'e') {
        enemies.forEach(enemy => {
          if (nextPlayerPosition === enemy.position) {
            enemy.hp -= player.damage;
            log.push('player attacked enemy');
          }
          // Remove enemy from game if its health is 0 or less
          if (enemy.hp <= 0) {    
            enemies = enemies.filter(enemy => !(enemy.hp <= 0));
            map[enemy.position] = '.';
          }
        });
      }

      // Enemies (e) adjacent to the player (@) will attack
      enemies.forEach(enemy => {
        if (
            enemy.position - 1 === player.position ||
            enemy.position + 1 === player.position ||
            enemy.position - mapWidth === player.position ||
            enemy.position + mapWidth === player.position
          ) {
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