import React,{useState} from 'react';
import { StyleSheet, Text, ScrollView, View, TouchableOpacity,ToastAndroid,Image } from 'react-native';
import {launchImageLibrary} from 'react-native-image-picker';
import Tflite from 'tflite-react-native';

let tflite = new Tflite();
tflite.loadModel({
  model: 'model.tflite',
  labels: 'labels.txt',
  numThreads: 1,
},
(err, res) => {
  if(err)
    console.log(err);
  else
    console.log(res);
});

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    alignItems: 'center',
  },
  title: {
    fontSize: 35,
    marginVertical: 40,
  },
  subtitle: {
    fontSize: 20,
    marginVertical: 10,
  },
  image: {
    width: 150,
    height: 150,
    borderWidth: 2,
    borderRadius: 75
  },
  button: {
    backgroundColor: '#47477b',
    color: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 15,
    paddingHorizontal: 40,
    borderRadius: 50,
    marginTop: 20,
  },
  buttonText: {
    color: '#fff',
  },
});



export default function App() {
  
  const [label, setLabel] = useState("");
  const [confidence, setConfidence] = useState(0);
  const [directory, setDirectory] = useState(null);


  async function SelectPhoto(){
    const options = {
      mediaType:'photo'
    }
    const result = await launchImageLibrary(options)
    if(result.assets===undefined){
      // Some error log it as toast , you an parse the error to be more specific . Refer the docs
      ToastAndroid.showWithGravity(
        'Could not pick an image',
        ToastAndroid.SHORT,
        ToastAndroid.CENTER,
      );
    }else{
      const dir = result.assets[0].uri;
      //convert the image to png
      tflite.runModelOnImage({
        path: dir,  // required
        numResults: 2
      },
      (err, res) => {
        if(err)
        ToastAndroid.showWithGravity(
          'Internal Error',
          ToastAndroid.SHORT,
          ToastAndroid.CENTER,
        );
        else
          console.log(res);
          setLabel(res[0].label);
          setConfidence((res[0].confidence*100).toFixed(2));
          setDirectory({ uri: dir });
      });
    }
    
  }
  console.log(directory);
  return (
    <ScrollView contentContainerStyle={styles.screen}>
      <Text style={styles.title}>Pneumonia Indicator</Text>
      {
        (directory===null)? <></>:<Image source={directory} style={styles.image}/>
      }
      <Text style={styles.subtitle}>{label}</Text>
      <Text style={styles.subtitle}>{(confidence===0?"":(confidence+"%"))}</Text>
      <View>
        <TouchableOpacity style={styles.button} onPress={SelectPhoto}>
          <Text style={styles.buttonText}>Pick a Photo</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}
