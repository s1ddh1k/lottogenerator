import React, { Component } from 'react';
import { Text, View, StyleSheet, Alert, Button } from 'react-native';
import { Constants, BarCodeScanner, Permissions } from 'expo';

export default class App extends Component {
  state = {
    hasCameraPermission: null,
    scannedNumbers: [],
    generatedNumbers: [],
    scan: false,
  };

  componentDidMount() {
    this._requestCameraPermission();
  }

  _requestCameraPermission = async () => {
    const { status } = await Permissions.askAsync(Permissions.CAMERA);
    this.setState({
      hasCameraPermission: status === 'granted',
      scannedNumbers: this.state.scannedNumbers,
      generatedNumbers: this.state.generatedNumbers,
      scan: false,
    });
  };

  _handleBarCodeRead = data => {
    if (!data.data.startsWith('http://m.dhlottery.co.kr/?v=')) {
      Alert.alert('QR 코드가 로또 번호가 아닙니다', data.data);
      return;
    }
    const startIndex = data.data.indexOf('q') + 1;
    const endIndex = data.data.length - 10;
    const numbers = data.data.slice(startIndex, endIndex).split('q').join('');
    const scannedNumbers = numbers.match(/.{1,2}/g);
    const generatedNumbers = this._generateFiveGames(scannedNumbers);

    this.setState({
      hasCameraPermission: this.state.hasCameraPermission,
      scannedNumbers,
      generatedNumbers,
      scan: false,
    })
  };

  _generateOneNumber = (excludes, nums) => {
    const min = 1;
    const max = 45;

    let number = Math.floor(Math.random() * (max - min + 1) + min);
    if (number < 10) {
      number = '0' + number;
    } else {
      number = number.toString();
    }

    while (excludes.find(e => e === number) || nums.find(e => e === number)) {
      number = Math.floor(Math.random() * (max - min + 1) + min);
      if (number < 10) {
        number = '0' + number;
      } else {
        number = number.toString();
      }
    }

    return number;
  }

  _generateOneGame = (excludes) => {
    const selectedNumbers = [];
    for (let i = 0; i < 6; i++) {
      const num = this._generateOneNumber(excludes, selectedNumbers);
      selectedNumbers.push(num);
    }
    return selectedNumbers.sort();
  }

  _generateFiveGames = excludes => {
    let generated = [];

    for (let i = 0; i < 5; i++) {
      const oneGameNumbers = this._generateOneGame(excludes);
      generated = generated.concat(oneGameNumbers);
    }

    return generated;
  }

  _onClear = () => {
    this.setState({
      hasCameraPermission: this.state.hasCameraPermission,
      scannedNumbers: [],
      generatedNumbers: [],
      scan: false,
    })
  }

  _renderResult = () => {
    const scannedText = this.state.scannedNumbers.map((n, i) => <Text key={i} style={styles.number}>{n}</Text>);
    const generatedText = this.state.generatedNumbers.map((n, i) => <Text key={i*2} style={styles.number}>{n}</Text>);
    return scannedText.length > 0
    ? <View>
        <Text style={styles.result}>제외된 번호</Text>
        <View style={styles.numbers}>
        {scannedText}
        </View>
        <Text style={styles.result}>생성된 번호</Text>
        <View style={styles.numbers}>
        {generatedText}
        </View>
        <Button onPress={this._onClear} title="돌아가기"/>
      </View>
    : <View>
        <Text style={styles.result}>생성된 번호</Text>
        <View style={styles.numbers}>
        {generatedText}
        </View>
        <Button onPress={this._onClear} title="돌아가기"/>
      </View>
  }

  _onScan = () => {
    this.setState({
      hasCameraPermission: this.state.hasCameraPermission,
      scannedNumbers: [],
      generatedNumbers: [],
      scan: true,
    })
  }

  _onGenerate = () => {
    const generatedNumbers = this._generateFiveGames([]);

    this.setState({
      hasCameraPermission: this.state.hasCameraPermission,
      scannedNumbers: this.state.scannedNumbers,
      generatedNumbers,
      scan: false,
    });
  }

  render() {
    const requesting = <Text>카메라 권한을 요청 중입니다</Text>;
    const notGranted = <Text>카메라 권한이 없습니다</Text>;
    const scanner = <BarCodeScanner onBarCodeRead={this._handleBarCodeRead} barCodeTypes={[256]}style={{width: '100%', height: '100%'}}/>
    const generatedNumbers = this._renderResult();
    const main = <View style={styles.main}>
      <Button onPress={this._onScan} title="QR 코드"/>
      <Button onPress={this._onGenerate} title="바로 생성"/>
    </View>

    let renderElement = this.state.generatedNumbers.length > 0 ? generatedNumbers : (this.state.scan ? scanner : main)
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
  },
  main: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'space-around',
  },
  number: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
    backgroundColor: 'green',
    width: 30,
    height: 30,
    borderRadius: 30 / 2,
    textAlign: 'center',
    lineHeight: 30,
  },
  numbers: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    width: 30*6,
  },
  result: {
    textAlign: 'center',
    fontSize: 20,
    fontWeight: 'bold',
  }
});
