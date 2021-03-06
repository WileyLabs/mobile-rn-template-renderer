# mobile-rn-sound-recorder

A helper module to record voice audio in Redux.
Redux/Saga wrapper for react-native-audio component.

Version 0.0.4, 2018/09/14

## Module Public Interfaces

### Constants

```
import { constants as soundRecorderConstants } from 'mobile-rn-sound-recorder'

General:

  NAME                    - component name (for reducer)

Pre-defined pathes

  PATH_BUNDLE             - main bundle path
  PATH_DOCUMENT           - document path
  PATH_DATA               - path for data (inter-session) files 
  PATH_TEMP               - path for temporary (session) files

Notification actions:

  ON_ERROR                - action invoked on processing error
  ON_RECORDING_SAVED      - action invoked just after sound file was successfully saved

Error codes:

  ERROR_NOT_PERMITTED     - recording audio is not permitted for application
  ERROR_NOT_MOUNTED       - component was not properly initialized (call mountRequest first)
  ERROR_RECORDING         - generic recording error (e.g. format not supported and so on)
  ERROR_ALREADY_RUNNING   - recording already running (on startRecording)
  ERROR_FS                - file system error

```

### Action Creators

```
import { actions as soundRecorderActions } from 'mobile-rn-sound-recorder'
 
Init/Shut

/**
 * Initializes component (should be called first)
 * @param options.audioSettings audio settings (optinal, see iosAudioSettings, androidAudioSettings constants for details)
 * @param options.lang language 'eng' or 'ger' (optinal, by default 'eng')
 * @param options.wordsMap words Map(key, value) (optinal, used for PermissionsAndroid.request)
 * @param options.logLevel logging level (0 - no debug info, default; 1; 2 - wordy log)
 */
const mountRequest = (options) => ({ type: constants.MOUNT_REQUEST, options });

/**
 * Shutdowns component
 */
const unmountRequest = () => ({ type: constants.UNMOUNT_REQUEST });

Start/Stop/Save to file

/**
 * Starts recording
 */
const startRequest = () => ({ type: constants.START_REQUEST });

/**
 * Ends recording
 * @param success false if stopped by error, true otherwise (true by default)
 */
const stopRequest = (success = true) => ({ type: constants.STOP_REQUEST, success });

/**
 * Saves last recording to the file
 * @param fileInfo.name file name w/o extension (optinal, if not specified generated by default)
 * @param fileInfo.path file path (optinal, by default DocumentPath)
 * @param userData user data object (optinal, passed as a payload with onFileSaved action)
 */
const saveAsFileRequest = (fileInfo, userData) => ({
  type: constants.SAVE_AS_FILE_REQUEST,
  fileInfo,
  userData
});


```

### Selectors
```
import { selectors as soundRecorderSelectors } from 'mobile-rn-sound-recorder'

soundRecorderSelectors.hasPermission()    - true if the application acquired microphone permission
soundRecorderSelectors.getAudioSettings() - current audio settings *
soundRecorderSelectors.isMounted()        - true if component is ready for recording (mounted)
soundRecorderSelectors.isRecording()      - true if recording is in progress (between start & stop requests)
soundRecorderSelectors.isReadyToSave()    - true if the last recording finished successfully and is ready 
                                            to be saved
soundRecorderSelectors.getCurrentTime()   - current recording time in secs [Real Number]
soundRecorderSelectors.getInfo()          - descriptor of the last successfully saved file **
soundRecorderSelectors.getError()         - last error ***

// * Settings object:

  // default settings for iOS
  const iosAudioSettings = {
    SampleRate: 22050,
    Channels: 1,
    AudioQuality: 'Low',
    AudioEncoding: 'caf',
    OutputFormat: 'mp3',
    AudioEncodingBitRate: 32000
  };

// default settings for Android
  const androidAudioSettings = {
    SampleRate: 22050,
    Channels: 1,
    AudioQuality: 'Low',
    AudioEncoding: 'mp3',
    OutputFormat: 'mp3',
    AudioEncodingBitRate: 32000
  };

// ** Info object:

  const defaultInfo = {
    name: '',                   // file name (auto-generated by default)
    path: '',                   // path to the file (documents by default)
    size: 0.0,                  // resulting file size in bytes
    duration: 0.0,              // sound duration in secs
    userData: {}                // data provided by the User as payload for saveAsFileRequest action
  };

// *** Error object:

  const error = { 
    errCode: 0,                 // error code, one of soundRecorderConstants.ERROR_(...) constants
    details: {                  // arbitrary additional information
      error: new Error(message) // Error object with optional message
      ...                       // additional optional data
    } 
  };

```

## Getting started

### Step 1. Install mobile-rn-sound-recorder

```
$ npm install mobile-rn-sound-recorder --save
# or with yarn
$ yarn add mobile-rn-sound-recorder
```

### Step 2. Install react-native-audio

If you have already installed [react-native-audio](https://github.com/jsierles/react-native-audio) as a dependency for your project you can skip this step. Otherwise please follow instructions provided by https://github.com/jsierles/react-native-audio.

## Project Integration (2 steps)

### Step 1. Add sound recorder's reducer to the root reducer
```javascript
// rootReducer.js

import { combineReducers } from 'redux';
import { reducer as soundRecorderReducer,
         constants as soundRecorderConstants } from 'mobile-rn-sound-recorder';

const rootReducer = combineReducers({
  ...
   [soundRecorderConstants.NAME]: soundRecorderReducer,
  ...
});

export default rootReducer;
```
or

```javascript
// rootReducer.js

import { combineReducers } from 'redux';
import soundRecorder from 'mobile-rn-sound-recorder';

const rootReducer = combineReducers({
  ...
   [soundRecorder.NAME]: soundRecorder.reducer,
  ...
});

export default rootReducer;
```
### Step 2. Initialize & run sound recorder's saga
```javascript
// rootSaga.js

import { all, call } from 'redux-saga/effects';
import { saga as soundRecorderSaga } from 'mobile-rn-sound-recorder';

export default function* rootSaga() {
  yield all([
    ...
    call(soundRecorderSaga),
    ...
  ]);
}
```
or

```javascript
// rootSaga.js

import { all, call } from 'redux-saga/effects';
import soundRecorder from 'mobile-rn-sound-recorder';

export default function* rootSaga() {
  yield all([
    ...
    call(soundRecorder.saga),
    ...
  ]);
}
```

## Usage in React Native components

### Step 1. Screen
```javascript
// components/VoiceRecorder/VoiceRecorderContainer.js

import VoiceRecorder from './VoiceRecorder';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { selectors as soundRecorderSelectors, 
         actions as soundRecorderActions } from 'mobile-rn-sound-recorder';

function mapStateToProps(state) {
  return {
    isRecording: soundRecorderSelectors.isRecording(state),
    isReadyToSave: soundRecorderSelectors.isReadyToSave(state),
    currentTime: soundRecorderSelectors.getCurrentTime(state),
    ...
  };
}

function mapDispatchToProps(dispatch) {
  return bindActionCreators({
    mountRequest: soundRecorderActions.mountRequest,
    unmountRequest: soundRecorderActions.unmountRequest,
    startRequest: soundRecorderActions.startRequest,
    stopRequest: soundRecorderActions.stopRequest,
    saveAsFileRequest: soundRecorderActions.saveAsFileRequest,
    ...
  }, dispatch);
}

export default connect(mapStateToProps, mapDispatchToProps)(VoiceRecorder);
```

```javascript
// components/VoiceRecorder/VoiceRecorder.js

class VoiceRecorder extends Component {

  static propTypes = {
    ...
    cardId: recordId: PropTypes.string,
    recordId: PropTypes.string.isRequired,
    isRecording: PropTypes.bool,
    isReadyToSave: PropTypes.bool,
    currentTime: PropTypes.number,
    mountRequest: PropTypes.func.isRequired,
    unmountRequest: PropTypes.func.isRequired,
    startRequest: PropTypes.func.isRequired,
    stopRequest: PropTypes.func.isRequired,
    saveAsFileRequest: PropTypes.func.isRequired,
    ...
  };

  static defaultProps = {
    ...
    cardId: '',
    recordId: '',
    isRecording: false,
    isReadyToSave: false,
    currentTime: 0.0
  };

  componentDidMount() {
    // Optional dictionary object that allows to re-write default messages
    // const dictionary = {
    //   titleMicrophonePermission: 'Mikrofon freischalten',
    //   msgMicrophonePermission: 'App benötigt Zugriff auf Ihr Mikrofon, sodass Sie etwas aufnehmen können',
    //   msgNoPermission: 'Für die Aufnahme wurde der Zugriff nicht erteilt.'
    // };
    // Note, that 1) the component will be drawn first time with the default props,
    // 2) It is more safe to initialize recorder somewhere earlier than here on componentDidMount()
    this.props.mountRequest({logLevel: 1, dictionary});
  }

  componentWillUnmount() {
    this.props.unmountRequest();
  }

  ...

  handlePressRecording = () => 
    this.props.isRecording ? this.props.stopRequest() : this.props.startRequest();

  handlePressDone = () => {
    ...
    // fileInfo: passed 'name' as a file name w/o extension; default path (Documents) will be used
    // userData: passed 'title' and 'cardId' as a payload for ON_RECORDING_SAVED action (see Saga)
    this.props.saveAsFileRequest({ name: this.props.recordId }, 
                                 { title: this.state.text, cardId: this.props.cardId }
    );
    ...
  }

  ...

  render() {
    ...
  }
}
...

export default VoiceRecorder;
```

### Step 2. Saga
```javascript
// saga/onSoundRecorder.js

import { Alert } from 'react-native';
import { takeLatest, call, select, put, all } from 'redux-saga/effects';
import { constants as soundRecorderConstants } from 'mobile-rn-sound-recorder';

function* _onRecordingSaved(action) {
  try {
    ...
    const { name, duration, size, userData } = action.info;
    // Create DB record with information
    yield call(createDBRecord, ..., userData.cardId, userData.title, name, duration, size);
    ...
  } catch (err) {
    console.log(err.message);
  }
}

function* _onSoundError(action) {
  try {
    const { errCode } = action.error;
    switch (errCode) {
      case soundRecorderConstants.ERROR_NOT_PERMITTED:
        Alert.alert('Attention', 'No recording permissions granted.', [{text: 'OK'}], { cancelable: false });
        break;
    }
  }
  catch (err) {
  }
}

export function* watchOnRecordingSaved() {
  yield takeLatest(soundRecorderConstants.ON_RECORDING_SAVED, _onRecordingSaved);
}

export function* watchOnSoundError() {
  yield takeLatest(soundRecorderConstants.ON_ERROR, _onSoundError);
}

// Note: you could place soundRecorder.saga here in order to have all
//       sound recorder's sagas in one place
export function* watchOnSoundRecorder() {
  yield all([
    call(watchOnRecordingSaved),
    call(watchOnSoundError)
  ]);
}
```
