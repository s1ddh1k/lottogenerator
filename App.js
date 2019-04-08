import React, { Component } from 'react';
import { Text, View, StyleSheet, Alert, Button } from 'react-native';
import { Constants, BarCodeScanner, Permissions } from 'expo';

export default class App extends Component {
  state = {
    hasCameraPermission: null,
    scannedNumbers: [],
    generatedNumbers: [],
  };

  componentDidMount() {
    this._requestCameraPermission();
  }

  _requestCameraPermission = async () => {
    const { status } = await Permissions.askAsync(Permissions.CAMERA);
    this.setState({
      hasCameraPermission: status === 'granted',
    });
  };

  _handleBarCodeRead = data => {
    if (data.type !== 256) {
      Alert.alert(
        'It is not QR code',
      );
      return;
    }
    const startIndex = data.data.indexOf('q') + 1;
    const endIndex = data.data.length - 10;
    const numbers = data.data.slice(startIndex, endIndex).split('q').join('');
    const scannedNumbers = numbers.match(/.{1,2}/g);
    const generatedNumbers = this._generateNumbers(scannedNumbers);

    this.setState({
      hasCameraPermission: this.state.hasCameraPermission,
      scannedNumbers,
      generatedNumbers
    })
  };

  _generateNumbers = excludes => {
    const min = 1;
    const max = 45;
    let generated = [];

    for (let i = 0; i < 30; i++) {
      let nums = [];
      let number = excludes[0];
      while (excludes.find(e => e === number) && generated.find(e => e === number)) {
        number = Math.floor(Math.random() * (max - min + 1) + min);
        if (number < 10) {
          number = '0' + number;
        } else {
          number = number.toString();
        }
      }
      nums.push(number);

      if (i > 0 && i % 6 === 0) {
        nums.sort();
        generated = generated.concat(nums);
        nums = [];
      }

    }

    return generated;
  }

  _onPress = () => {
    this.setState({
      hasCameraPermission: this.state.hasCameraPermission,
      scannedNumbers: [],
      generatedNumbers: []
    })
  }

  _renderResult = () => {
    return <View>
      <Text>
        {
          "제외된 번호\n" +
          this.state.scannedNumbers.slice(0, 6).join() + "\n" +
          this.state.scannedNumbers.slice(6, 12).join() + "\n" +
          this.state.scannedNumbers.slice(12, 18).join() + "\n" +
          this.state.scannedNumbers.slice(18, 24).join() + "\n" +
          this.state.scannedNumbers.slice(24, 30).join() + "\n" +
          "\n생성된 번호\n" +
          this.state.generatedNumbers.slice(0, 6).join() + "\n" +
          this.state.generatedNumbers.slice(6, 12).join() + "\n" +
          this.state.generatedNumbers.slice(12, 18).join() + "\n" +
          this.state.generatedNumbers.slice(18, 24).join() + "\n" +
          this.state.generatedNumbers.slice(24, 30).join() + "\n"
        }
      </Text>
      <Button onPress={this._onPress} title="Clear"/>
    </View>
  }

  render() {
    const requesting = <Text>카메라 권한을 요청 중입니다</Text>;
    const notGranted = <Text>카메라 권한이 없습니다</Text>;
    const generatedNumbers = this._renderResult();
    let renderElement = this.state.generatedNumbers.length > 0
      ? generatedNumbers
      : <BarCodeScanner onBarCodeRead={this._handleBarCodeRead} style={{width: '100%', height: '100%'}}/>
    if (this.state.hasCameraPermission === null) renderElement = requesting;
    if (this.state.hasCameraPermission === false) renderElement = notGranted;
    return <View style={styles.container}>{renderElement}</View>;
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: Constants.statusBarHeight,
    backgroundColor: '#ecf0f1',
  }
});
