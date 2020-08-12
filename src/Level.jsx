import React from 'react';
import { connect } from 'react-redux';

//This function is responsible for rendering the level and all
//the entities in it.
function Level(props) {
  // Convert the map from a 1-D array to a 2-D array.
  const { mapHeight, mapWidth, map } = props;
  const newMap = [];
  for (let i = 0; i < mapHeight; i++) {
    newMap.push(map.slice(i * mapWidth, (i + 1) * mapWidth));
  }

  // Handle conditional style/class changes for player, enemy, and wall.
  const handleCharacterStyle = (char) => {
    switch(char) {
      case '@':
        return 'player';
      case 'e':
        return 'enemy';
      case '#':
        return 'wall';
      default:
        return 'text';
    }
  }

  return (
    <table className="table">
      <tbody>
        {newMap.map((row, rowIndex) => 
          <tr key={rowIndex}>{row.map((square, colIndex) => 
              <td 
                className={handleCharacterStyle(square)}
                index={(rowIndex * mapWidth) + colIndex}
                key={(rowIndex * mapWidth) + colIndex}
              >
                {square}
              </td>
            )}
          </tr>
        )}
      </tbody>
    </table>
  );
};

const mapStateToProps = (state) => ({
  mapHeight: state.mapHeight,
  mapWidth: state.mapWidth,
  map: state.map,
  player: state.player,
});

export default connect(mapStateToProps)(Level);