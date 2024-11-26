import axios from 'axios';
import { Picker } from '@react-native-picker/picker';
import React, { createContext, useContext, useState, useEffect } from 'react';
import { ActivityIndicator, Image, StyleSheet, Switch, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons } from '@expo/vector-icons';

const ThemeContext = createContext();
const currenciesFlagData = require('./assets/data/currencies-with-flags.json');

const App = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
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

  const toggleTheme = () => {
    setIsDarkMode(!isDarkMode);
  };

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
        let newRate;
        if (baseCurrency === 'USD') {
          newRate = data.rates[targetCurrency];
        } else if (targetCurrency === 'USD') {
          newRate = 1 / data.rates[baseCurrency];
        } else {
          // We can only call API, USD as the base currency
          newRate = data.rates[targetCurrency] / data.rates[baseCurrency];
        }
        setRate(newRate);

        // Update the target value after the rate has been calculated
        const newTargetValue = (baseValue * newRate).toFixed(4);
        setTargetValue(newTargetValue);

      } catch (error) {
        setIsLoading(false);
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

  const themeStyles = isDarkMode ? darkThemeStyles : lightThemeStyles;

  return (
    <ThemeContext.Provider value={{ isDarkMode, toggleTheme }}>
      <LinearGradient
        colors={isDarkMode ? ['#121b34', '#0c5472'] : ['#3aa7ff', '#a7dafe']}
        style={themeStyles.background}
      >
        {/* Theme Toggle Switch */}
        <View style={themeStyles.toggleContainer}>
          <Switch
            value={isDarkMode}
            onValueChange={toggleTheme}
            thumbColor={isDarkMode ? "#3aa7ff" : "#121b34"}
            trackColor={{ false: "#0c5472", true: "#a7dafe" }}
          />
        </View>
        <View style={themeStyles.card}>
          <Text style={themeStyles.title}>CurrenZ</Text>
          {isLoading ? (
            <ActivityIndicator size="large" color="#14b8fb" />
          ) : error ? (
            <Text style={{ color: 'red', textAlign: 'center', }}>{error}</Text>
          ) : (
            <>
              <View style={themeStyles.currencyContainer}>
                {/* Base Currency Input */}
                <Picker
                  selectedValue={baseCurrency}
                  onValueChange={handleBaseCurrency}
                  style={themeStyles.picker}
                >
                  {options.map((option) => (
                    <Picker.Item key={option} label={option} value={option} />
                  ))}
                </Picker>

                {getCurrencyFlag(baseCurrency) && (
                  <Image
                    source={{ uri: getCurrencyFlag(baseCurrency) }}
                    style={themeStyles.flag}
                  />
                )}

                {/* Base Value Input */}
                <TextInput
                  value={baseValue.toString()}
                  onChangeText={handleTargetValue}
                  keyboardType="numeric"
                  placeholder="Enter value"
                  style={themeStyles.input}
                />
              </View>

              <View style={themeStyles.iconContainer}>
                {/* Swap Button */}
                <TouchableOpacity onPress={handleSwap}>
                  <MaterialCommunityIcons name="swap-horizontal" size={32} color="white" />
                </TouchableOpacity>
              </View>

              {/* Target Currency Input */}
              <View style={themeStyles.currencyContainer}>
                <Picker
                  selectedValue={targetCurrency}
                  onValueChange={handleTargetCurrency}
                  style={themeStyles.picker}
                >
                  {options.map((option) => (
                    <Picker.Item key={option} label={option} value={option} />
                  ))}
                </Picker>

                {getCurrencyFlag(targetCurrency) && (
                  <Image
                    source={{ uri: getCurrencyFlag(targetCurrency) }}
                    style={themeStyles.flag}
                  />
                )}

                {/* Target Value Output */}
                <TextInput
                  value={targetValue.toString()}
                  editable={false}
                  style={themeStyles.input}
                />
              </View>

              {/* Conversion Rate */}
              <Text style={themeStyles.rate}>
                {`1 ${baseCurrency} = ${rate ? rate.toFixed(8) : 'N/A'} ${targetCurrency}`}
              </Text>
            </>
          )}
        </View>
      </LinearGradient>
    </ThemeContext.Provider>
  );
};

const lightThemeStyles = StyleSheet.create({
  background: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
  },
  card: {
    alignSelf: 'center',
    borderRadius: 10,
    backgroundColor: 'white',
    elevation: 10,
    height: 'auto',
    padding: 20,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowOffset: { width: 1, height: 2 },
    shadowRadius: 5,
    verticalAlign: 'center',
    width: '85%',
  },
  currencyContainer: {
    alignItems: 'center',
    flexDirection: 'row',
    height: 50,
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  flag: {
    flex: 1,
    height: 30,
    marginRight: 10,
    width: 20,
  },
  iconContainer: {
    alignSelf: 'center',
    alignItems: 'center',
    backgroundColor: '#14b8fb',
    borderRadius: 25,
    height: 50,
    justifyContent: 'center',
    marginBottom: 15,
    transform: [{ rotate: '90deg' }],
    width: 50,
  },
  input: {
    backgroundColor: '#eee',
    borderColor: '#ccc',
    borderRadius: 5,
    borderWidth: 1,
    flex: 4,
    marginRight: 5,
    padding: 10,
  },
  picker: {
    flex: 4,
    width: 'auto',
  },
  rate: {
    textAlign: 'center',
    fontSize: 16,
    color: '#666',
    marginBottom: 10,
  },
  swapButton: {
    alignItems: 'center',
    alignSelf: 'center',
    borderRadius: 25,
    justifyContent: 'center',
    marginBottom: 30,
    padding: 20,
  },
  title: {
    color: '#14b8fb',
    fontSize: 24,
    fontWeight: 'bold',
    letterSpacing: 0.5,
    marginBottom: 20,
    textAlign: 'center',
  },
  toggleContainer: {
    position: 'absolute',
    right: 20,
    top: 50,
  },
});

const darkThemeStyles = StyleSheet.create({
  background: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
  },
  card: {
    alignSelf: 'center',
    borderRadius: 15,
    backgroundColor: '#171f31',
    elevation: 10,
    height: 'auto',
    padding: 10,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowOffset: { width: 1, height: 2 },
    shadowRadius: 5,
    verticalAlign: 'center',
    width: '85%',
  },
  currencyContainer: {
    alignItems: 'center',
    flexDirection: 'row',
    height: 50,
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  flag: {
    flex: 1,
    height: 30,
    marginRight: 10,
    width: 20,
  },
  iconContainer: {
    alignSelf: 'center',
    alignItems: 'center',
    backgroundColor: '#14b8fb',
    borderRadius: 25,
    height: 50,
    justifyContent: 'center',
    marginBottom: 15,
    transform: [{ rotate: '90deg' }],
    width: 50,
  },
  input: {
    backgroundColor: '#0f172a',
    borderColor: '#262e35',
    borderRadius: 5,
    borderWidth: 1,
    color: '#fff',
    flex: 4,
    marginRight: 5,
    padding: 10,
  },
  picker: {
    flex: 4,
    color: '#fff',
    width: 'auto',
  },
  rate: {
    textAlign: 'center',
    fontSize: 16,
    color: '#999',
    marginBottom: 10,
  },
  swapButton: {
    alignItems: 'center',
    alignSelf: 'center',
    borderRadius: 25,
    justifyContent: 'center',
    marginBottom: 30,
    padding: 20,
  },
  title: {
    color: '#14b8fb',
    fontSize: 24,
    fontWeight: 'bold',
    letterSpacing: 0.5,
    marginBottom: 20,
    textAlign: 'center',
  },
  toggleContainer: {
    position: 'absolute',
    right: 20,
    top: 50,
  },
});

export default App;