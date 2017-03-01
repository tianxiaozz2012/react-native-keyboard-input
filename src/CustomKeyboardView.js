import React, {Component, PropTypes} from 'react';
import {View, Platform, Dimensions, Keyboard} from 'react-native';
import TextInputKeyboardMangerIOS from './TextInputKeyboardMangerIOS';
import KeyboardRegistry from './KeyboardsRegistry';

const IsAndroid = Platform.OS === 'android';
const ScreenSize = Dimensions.get('window');

export default class CustomKeyboardView extends Component {
  static propTypes = {
    inputRef: PropTypes.object,
    initialProps: PropTypes.object,
    component: PropTypes.string,
  };

  constructor(props) {
    super(props);

    this.state = {androidKeyboardHeight: 0, canShowAndroidKeyboardComponent: false};

    const {inputRef, component, initialProps} = props;
    if (TextInputKeyboardMangerIOS && inputRef && component) {
      TextInputKeyboardMangerIOS.setInputComponent(inputRef, {component, initialProps});
    }
  }

  componentWillMount() {
    if (IsAndroid) {
      this.keyboardEventListeners = [
        Keyboard.addListener('keyboardDidShow', this.androidKeyboardDidShow.bind(this)),
      ];
    }
  }

  componentWillReceiveProps(nextProps) {
    if (IsAndroid) {
      if (nextProps.component) {
        Keyboard.dismiss();
        setTimeout(() => {
          this.setState({canShowAndroidKeyboardComponent: true});
        }, 55);
      } else {
        this.setState({canShowAndroidKeyboardComponent: false});
      }
    } else if (TextInputKeyboardMangerIOS && nextProps.inputRef && nextProps.component !== this.props.component) {
      if (nextProps.component) {
        TextInputKeyboardMangerIOS.setInputComponent(nextProps.inputRef, {
          component: nextProps.component,
          initialProps: nextProps.initialProps,
        });
      } else {
        TextInputKeyboardMangerIOS.removeInputComponent(nextProps.inputRef);
      }
    }
  }

  componentWillUnmount() {
    this.keyboardEventListeners.forEach(eventListener => eventListener.remove());
  }

  androidKeyboardDidShow(event) {
    const keyboardHeight = event.endCoordinates.height;
    if (this.state.androidKeyboardHeight !== keyboardHeight) {
      this.setState({androidKeyboardHeight: keyboardHeight});
    }
  }

  render() {
    if (IsAndroid && this.props.component && this.state.canShowAndroidKeyboardComponent) {
      const KeyboardComponent = KeyboardRegistry.getComponent(this.props.component);
      return (
        <View style={{width: ScreenSize.width, height: this.state.androidKeyboardHeight}}>
          <KeyboardComponent {...this.props.initialProps}/>
        </View>
      );
    }
    return null;
  }
}