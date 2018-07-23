import { put, select } from 'redux-saga/effects';
import { takeEvery } from 'redux-saga';
import * as constants from '../constants';
import * as actions from '../actions';
import * as selectors from '../selectors';
import { initialState } from '../reducer';
import helpers from '../utils/helpers';

function* _initRequest(action) {
  if (helpers.getField(action, 'options.logLevel', (yield select(selectors.getOptions)).logLevel) >= 2) {
    console.log('[A11Y::Init]', {action});
  }
  yield put(actions.setState({...initialState , ...{ options: action.options } }));
}

export function* watchInitRequest() {
  yield takeEvery(constants.INIT_REQUEST, _initRequest);
}
