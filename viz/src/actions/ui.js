export const ACTIONS = {
  INCREMENT_REQUESTED: "counter/INCREMENT_REQUESTED",
  INCREMENT: "counter/INCREMENT",
  DECREMENT_REQUESTED: "counter/DECREMENT_REQUESTED",
  DECREMENT: "counter/DECREMENT"
};

const {
  INCREMENT_REQUESTED,
  INCREMENT,
  DECREMENT_REQUESTED,
  DECREMENT
} = ACTIONS;

export const increment = () => {
  return dispatch => {
    dispatch({
      type: INCREMENT_REQUESTED
    });

    dispatch({
      type: INCREMENT
    });
  };
};

export const incrementAsync = () => {
  return dispatch => {
    dispatch({
      type: INCREMENT_REQUESTED
    });

    return setTimeout(() => {
      dispatch({
        type: INCREMENT
      });
    }, 3000);
  };
};

export const decrement = () => {
  return dispatch => {
    dispatch({
      type: DECREMENT_REQUESTED
    });

    dispatch({
      type: DECREMENT
    });
  };
};

export const decrementAsync = () => {
  return dispatch => {
    dispatch({
      type: DECREMENT_REQUESTED
    });

    return setTimeout(() => {
      dispatch({
        type: DECREMENT
      });
    }, 3000);
  };
};
