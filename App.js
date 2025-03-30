import { StatusBar } from 'expo-status-bar';
import { SafeAreaView, StyleSheet, Text, View, TouchableOpacity, Button, TextInput, Alert, ImageBackground, ScrollView } from 'react-native';
import 'react-native-gesture-handler';
import { NavigationContainer, CommonActions } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import React, {useState, useEffect} from 'react';
import {Table, TableWrapper, Row, Rows, Col, Cols, Cell} from 'react-native-table-component';
import * as ScreenOrientation from 'expo-screen-orientation';

export default function App() {
  useEffect(() => {
    const setOrientation = async () => {
      await ScreenOrientation.unlockAsync(); // Allows auto-rotation
    };

    setOrientation();
  }, []);

  return (
    <NavigationContainer>
      <Stack.Navigator>
        <Stack.Screen name="Home" options={{headerShown: true}} component={HomeScreen} />
        <Stack.Screen name="recordExpense" component={recordExpense} />
        <Stack.Screen name="categoryExpense" component={categoryExpense} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

//Initial page
function HomeScreen({ navigation }) {
  const now = new Date();
  const month = now.getMonth() + 1;
  const year = now.getFullYear();
  const [tableData, setTableData] = useState([]);
  const [totalExpense, setTotalExpense] = useState(0);

  const handleBudget = async () => {
    try {
      const response = await fetch('http://10.0.2.2:3000/home', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ month, year }),
      });

      const data = await response.json();

      if (data.error) {
        Alert.alert('Error', data.error);
      } else {
        let total = 0;
        const formattedData = data.results.map(item => {
          total += parseFloat(item.expense);
          const formattedDate = new Date(item.createdDateTime).toLocaleString();
          return [item.expense, item.category, formattedDate];
        });
        setTableData(formattedData);
        setTotalExpense(total);
      }
    } catch (error) {
      Alert.alert('Error', error.toString());
    }
  };

  useEffect(() => {
    handleBudget();
  }, []);

  const tableHead = ['Total Amount', 'Category', 'Date'];

  const amountStyle = (amount) => {
    return parseFloat(amount) < 0 ? styles.negativeText : styles.positiveText;
  };

  return (
    <ImageBackground source={require('./images/Background.jpg')} style={styles.backgroundImage}>
    <ScrollView>
    <SafeAreaView style={styles.container}>
      <TouchableOpacity style={styles.roundedButton} onPress={() => { navigation.navigate('recordExpense'); }}>
          <Text style={styles.buttonText}>Record Expense</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.roundedButton} onPress={() => { navigation.navigate('categoryExpense'); }}>
          <Text style={styles.buttonText}>Search By Category</Text>
        </TouchableOpacity>
      <Text style={styles.totalExpense}>Total Expense: ${totalExpense.toFixed(2)}</Text>
      <Table borderStyle={{ borderWidth: 1, borderColor: '#C1C0B9' }}>
        <Row data={tableHead} style={styles.head} textStyle={styles.headText} />
        {tableData.map((rowData, index) => (
          <TableWrapper key={index} style={styles.rowSection}>
            {rowData.map((cellData, cellIndex) => (
              <Cell
                key={cellIndex}
                style={styles.cell}
                data={cellIndex === 0 ? (
                  <Text style={amountStyle(cellData)}>${cellData}</Text>
                ) : (
                  <Text style={styles.text}>{cellData}</Text>
                )}
              />
            ))}
          </TableWrapper>
        ))}
      </Table>
    </SafeAreaView>
    </ScrollView>
    </ImageBackground>
  );
}



//Page for entering expense
function recordExpense({navigation}){
  const now = new Date();
  const createdDateTime = now.toISOString().slice(0, 19).replace('T', ' ');

  const [expense, setExpense] = useState('');
  const [category, setCategory] = useState('');

  const handleRecordExpense = async () => {
    try {
      console.log('Attempting to insert budget...');
      const response = await fetch('http://10.0.2.2:3000/insertbudget', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ expense, category, createdDateTime }),
      });

      const data = await response.json();
      if (data.error) {
        console.log('Record failed:', data.error);
        Alert.alert('Error', data.error);
      } else {
        console.log('Record successful:', data.message);
        Alert.alert('Success', data.message);
        navigation.dispatch(
          CommonActions.reset({
            index: 0,
            routes: [{ name: 'Home' }],
          })
        );
      }
    } catch (error) {
      console.log('Insert error:', error.toString());
      Alert.alert('Error', error.toString());
    }
  };

  return(
    <ImageBackground source={require('./images/Background.jpg')} style={styles.backgroundImage}>
    <View style={styles.centeredContainer}>
      <View style={{ alignItems: 'center', justifyContent: 'center' }}>
        <TextInput
          style={styles.input}
          placeholder="Expense"
          value={expense}
          onChangeText={setExpense}
        />
        <TextInput
          style={styles.input}
          placeholder="Category"
          value={category}
          onChangeText={setCategory}
        />
        <TouchableOpacity style={styles.roundedButtonSubmit} onPress={handleRecordExpense}>
          <Text style={styles.whitefont}>Insert Earnings/Spendings</Text>
        </TouchableOpacity>
      </View>
    </View>
    </ImageBackground>
  );
}

//Page for searching expense based on category
function categoryExpense({navigation}){
  const [category, setCategory] = useState('');
  const [tableData, setTableData] = useState([]);

  const handleSearchCategoryExpense = async () => {
    try {
      console.log('Attempting to insert budget...');
      const response = await fetch('http://10.0.2.2:3000/searchBudgetCategory', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({category}),
      });
  
      const data = await response.json();
  
      if (data.error) {
        console.log('Search failed:', data.error);
        Alert.alert('Error', data.error);
      } else {
        console.log('Search successful:', data.message);
         // Format table data
         const formattedData = data.results.map(result => {
          return [result.expense.toFixed(2), result.category, new Date(result.createdDateTime).toLocaleDateString()];
        });
        setTableData(formattedData); // Update the table data
      }
    } catch (error) {
      console.log('Insert error:', error.toString());
      Alert.alert('Error', error.toString());
    }
  };

  const amountStyle = (amount) => {
    return parseFloat(amount) < 0 ? styles.negativeText : styles.positiveText;
  };

  const tableHead = ['Amount', 'Category','Date'];
  return (
    <ImageBackground source={require('./images/Background.jpg')} style={styles.backgroundImage}>
      <ScrollView>
      <SafeAreaView>
        <TextInput
          value={category}
          style={styles.input}
          onChangeText={setCategory}
          placeholder="Enter category"
        />
      <TouchableOpacity style={styles.roundedButtonSubmit} onPress={handleSearchCategoryExpense}>
          <Text style={styles.buttonText}>Search By Category</Text>
      </TouchableOpacity>
      <Table borderStyle={{ borderWidth: 1, borderColor: '#C1C0B9' }}>
        <Row data={tableHead} style={styles.head} textStyle={styles.headText} />
        {tableData.map((rowData, index) => (
          <TableWrapper key={index} style={styles.rowSection}>
            {rowData.map((cellData, cellIndex) => (
              <Cell
                key={cellIndex}
                style={styles.cell}
                data={cellIndex === 0 ? (
                  <Text style={amountStyle(cellData)}>${cellData}</Text>
                ) : (
                  <Text style={styles.text}>{cellData}</Text>
                )}
              />
            ))}
          </TableWrapper>
        ))}
      </Table>
      </SafeAreaView>
      </ScrollView>
      </ImageBackground>
  );
};


const Stack = createStackNavigator();


const styles = StyleSheet.create({
  container: { flex: 1, 
    padding: 16, 
    paddingTop: 30, 
  },
    buttonContainer: { 
    marginBottom: 20 
  },
  centeredContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  }, 
  roundedButton: {
    width: 400,
    backgroundColor: '#b103fc', //Colour for the buttons
    borderRadius: 20, //Round buttons
    padding: 10,
    marginBottom: 10, //Spacing between buttons
    alignItems: 'center',
    alignSelf: 'center',
  },
  roundedButtonSubmit: {
    width: 200,
    backgroundColor: '#fc0356', //Colour for the buttons
    borderRadius: 20, //Round buttons
    padding: 10,
    marginBottom: 10, //Spacing between buttons
    alignItems: 'center',
    alignSelf: 'center',
  },
  buttonText: {
    color: '#fff', //Color of the text in the button
    fontSize: 16,
    fontWeight: 'bold',
  },
  input: { 
    height: 40,
    width: 350,
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 10,
    marginTop:20,
    marginBottom: 15,
    backgroundColor: '#fff',
    alignSelf:'center',
  },
  rowSection: { flexDirection: 'row', 
    backgroundColor: '#E7E6E1' 
  },
  head: { 
    height: 44, 
    backgroundColor: 'darkblue' 
  },
  headText: { 
    fontSize: 20, 
    fontWeight: 'bold', 
    textAlign: 'center', 
    color: 'white' 
  },
  text: { 
    margin: 6, 
    fontSize: 16, 
    fontWeight: 'bold', 
    textAlign: 'center', 
    flexShrink: 1 
  },
  totalExpense: { 
    fontSize: 20, 
    fontWeight: 'bold', 
    textAlign: 'center', 
    margin: 10 
  },
  negativeText: { 
    color: 'red', 
    textAlign: 'center', 
    flexShrink: 1 
  }, //Style for positive amount
  positiveText: { 
    color: 'green', 
    textAlign: 'center', 
    flexShrink: 1 
  }, //Style for negative amount
  cell: { 
    flex: 1, 
    justifyContent: 'center' 
  }, 
  backgroundImage: {
    flex: 1,
    resizeMode: 'cover',
    justifyContent: 'center',
    alignItems: 'center',
  },
});