import axios from 'axios';
import { Picker } from '@react-native-picker/picker';
import React, { useState, useEffect } from 'react';
import { ActivityIndicator, Image, View, Text, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons } from '@expo/vector-icons';

const currenciesFlagData = require('./assets/data/currencies-with-flags.json');

const App = () => {
  const [isLoading, setIsLoading] = useState(false);
  //const [isMore, setIsMore] = useState(false);
  const [error, setError] = useState(null);
  const [currencyData, setCurrencyData] = useState();
  const [currencyCodes, setCurrencyCodes] = useState([]);
  const [baseCurrency, setBaseCurrency] = useState("USD");
  const [targetCurrency, setTargetCurrency] = useState("EUR");
  const [rate, setRate] = useState(0);
  const [baseValue, setBaseValue] = useState(1);
  const [targetValue, setTargetValue] = useState(1);
  const options = ["USD", "EUR", "LKR", "JPY", "GBP", "KRW"];
  const filteredCurrencies = currenciesFlagData.filter(currency => options.includes(currency.code));

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        // console.log("Fetching data...");

        const response = await axios.get(`https://openexchangerates.org/api/latest.json?app_id=574dd5e6f04e438fa5d99c3dfbd77a59&base=USD`);
        // console.log("API response:", response);

        const data = response.data;
        setCurrencyData(data.rates);
        const codes = Object.keys(data.rates);
        setCurrencyCodes(codes);

        // Update rate and target value
        if (baseCurrency === 'USD') {
          // USD to targetCurrency
          setRate(data.rates[targetCurrency]);
        } else if (targetCurrency === 'USD') {
          // baseCurrency to USD
          setRate(1 / data.rates[baseCurrency]);
        } else {
          // baseCurrency to targetCurrency
          const calculatedRate = data.rates[targetCurrency] / data.rates[baseCurrency];
          setRate(calculatedRate);
        }
        setTargetValue((baseValue * rate).toFixed(4));

      } catch (error) {
        console.error("Error fetching data:", error);
        setError("Failed to fetch currency data. Please check your network connection.");
        Alert.alert("Error", "Failed to fetch currency data. Please try again.");

        // if (error.response) {
        //   // The request was made and the server responded with a status code
        //   console.error("Error response from server:", error.response.data);
        //   setError(`Error ${error.response.status}: ${error.response.data.message}`);
        // } else if (error.request) {
        //   // The request was made but no response was received
        //   console.error("No response from server:", error.request);
        //   setError("Failed to fetch currency data. No response from server.");
        // } else {
        //   // Something happened in setting up the request that triggered an Error
        //   console.error("Error during request setup:", error.message);
        //   setError("Failed to fetch currency data. Please check your network connection.");
        // }
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [baseCurrency, targetCurrency, baseValue]);

  const handleBaseCurrency = (option) => {
    setBaseCurrency(option);
  };

  const handleTargetCurrency = (option) => {
    setTargetCurrency(option);
  };

  // Handling input changes
  const handleTargetValue = (value) => {
    if (value < 0) {
      Alert.alert("Invalid Input", "Base value cannot be negative.");
      return;
    }
    setBaseValue(value);
    setTargetValue(value * rate);
  };

  // Swap currencies
  const handleSwap = () => {
    const tempCurrency = baseCurrency;
    setBaseCurrency(targetCurrency);
    setTargetCurrency(tempCurrency);
  };

  const getCurrencyFlag = (currencyCode) => {
    const currency = filteredCurrencies.find(c => c.code === currencyCode);
    return currency ? currency.flag : null;
  };

  return (
    <LinearGradient
      colors={['#3aa7ff', '#a7dafe']}
      style={styles.background}
    >
      <View style={styles.card}>
        <Text style={styles.title}>CurrenZ</Text>
        {isLoading ? (
          <ActivityIndicator size="large" color="#14b8fb" />
        ) : error ? (
          <Text style={{ color: 'red', textAlign: 'center', }}>{error}</Text>
        ) : (
          <>
            <View style={styles.currencyContainer}>
              {/* Base Currency Input */}
              <Picker
                selectedValue={baseCurrency}
                onValueChange={handleBaseCurrency}
                style={styles.picker}
              >
                {options.map((option) => (
                  <Picker.Item key={option} label={option} value={option} />
                ))}
              </Picker>

              {getCurrencyFlag(baseCurrency) && (
                <Image
                  source={{ uri: getCurrencyFlag(baseCurrency) }}
                  style={styles.flag}
                />
              )}

              {/* Base Value Input */}
              <TextInput
                value={baseValue.toString()}
                onChangeText={handleTargetValue}
                keyboardType="numeric"
                placeholder="Enter value"
                style={styles.input}
              />
            </View>

            <View style={styles.iconContainer}>
              {/* Swap Button */}
              <TouchableOpacity onPress={handleSwap}>
                <MaterialCommunityIcons name="swap-horizontal" size={32} color="white" />
              </TouchableOpacity>
            </View>

            {/* Target Currency Input */}
            <View style={styles.currencyContainer}>
              <Picker
                selectedValue={targetCurrency}
                onValueChange={handleTargetCurrency}
                style={styles.picker}
              >
                {options.map((option) => (
                  <Picker.Item key={option} label={option} value={option} />
                ))}
              </Picker>

              {getCurrencyFlag(targetCurrency) && (
                <Image
                  source={{ uri: getCurrencyFlag(targetCurrency) }}
                  style={styles.flag}
                />
              )}

              {/* Target Value Output */}
              <TextInput
                value={targetValue.toString()}
                editable={false}
                style={styles.input}
              />
            </View>

            {/* Conversion Rate */}
            <Text style={{
              textAlign: 'center',
              fontSize: 16,
              color: '#666',
              marginBottom: 10,
            }}>
              {`1 ${baseCurrency} = ${rate ? rate.toFixed(8) : 'N/A'} ${targetCurrency}`}
            </Text>
          </>
        )}
      </View>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  background: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  card: {
    width: '80%',
    height: 'auto',
    alignSelf: 'center',
    verticalAlign: 'center',
    padding: 20,
    borderRadius: 10,
    backgroundColor: 'white',
    elevation: 10,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowOffset: { width: 1, height: 2 },
    shadowRadius: 5,
  },
  currencyContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
    height: 50,
  },
  flag: {
    height: 30,
    width: 20,
    marginRight: 10,
    flex: 1,
  },
  iconContainer: {
    alignItems: 'center',
    marginBottom: 15,
    borderRadius: 25,
    backgroundColor: '#14b8fb',
    width: 50,
    height: 50,
    transform: [{ rotate: '90deg' }],
    justifyContent: 'center',
    alignSelf: 'center',
  },
  input: {
    flex: 3,
    borderColor: '#ccc',
    borderRadius: 5,
    borderWidth: 1,
    padding: 10,
  },
  picker: {
    flex: 3,
  },
  swapButton: {
    alignSelf: 'center',
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    marginBottom: 30,
  },
  title: {
    fontSize: 24,
    textAlign: 'center',
    marginBottom: 20,
  },
});

export default App;