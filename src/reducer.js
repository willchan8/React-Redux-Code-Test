import * as actions from './actions';
import BFS from './BFS';
import { initialState } from './initialState';

const reducer = (state = initialState, action) => {
  switch (action.type) {
    case actions.STEP: {
      let map = state.map.map(value => value);
      let enemies = state.enemies.map(value => value);
      let mapWidth = state.mapWidth;
      let mapHeight = state.mapHeight;
      let player = Object.assign({}, state.player);
      let oldPlayerPosition = player.position;
      let newPlayerPosition;


      switch(action.keyCode) {
        case 37: // Left
          newPlayerPosition = player.position - 1;
          break;
        case 38: // Up
          newPlayerPosition = player.position - mapWidth;
          break;
        case 39: // Right
          newPlayerPosition = player.position + 1;
          break;
        case 40: // Down
          newPlayerPosition = player.position + mapWidth;
          break;
        default:
          newPlayerPosition = undefined;
          break;
      }

      // Update position of @
      if (map[newPlayerPosition] === '.') {
        player.position = newPlayerPosition;
        map[player.position] = '@';
        map[oldPlayerPosition] = '.';
      }

      // Move enemies toward player using BFS utility function
      enemies.forEach(enemy => {
        let enemyMoves = BFS(enemy.position, player.position, map, mapWidth, mapHeight);
        let newEnemyPosition = enemyMoves[0];
        let oldEnemyPosition = enemy.position;
        if (map[newEnemyPosition] === '.') {
          enemy.position = newEnemyPosition;
          map[enemy.position] = 'e';
          map[oldEnemyPosition] = '.';
        }
      });

      return Object.assign({}, state, {
        map,
        player,
        enemies,
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