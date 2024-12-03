const express = require('express');
const path = require('path');
const rti = require('rticonnextdds-connector');
const app = express();
const configFile = path.join(__dirname, 'QSystem.xml');

const dataFromHome = []; // Moved outside the function to ensure it is accessible
const dataFromKitchen = [];
const dataFromTermination = [];
const run = async () => {
  const connector = new rti.Connector('MyParticipantLibrary::MySubParticipant', configFile);
  const input = connector.getInput('MySubscriber::MySquareReader');
  try {
    console.log('Waiting for publications...');
    await input.waitForPublications();

    console.log('Waiting for data...');
    for (let i = 0; i < 500; i++) {
      await input.wait();
      input.take();
      console.log('Samples received: ' + input.samples.getLength());
      for (const sample of input.samples.validDataIter) {
        const jsonData = sample.getJson();
        console.log('Received data: ' + JSON.stringify(jsonData));
        if (jsonData.fromDevice === 'home') {
          dataFromHome.push({
            orderNum: jsonData.orderNum,
          });
        } else if (jsonData.fromDevice === 'kitchen') {
          dataFromKitchen.push({
            orderNum: jsonData.orderNum,
          });
        } else if (jsonData.fromDevice === 'orderTermination') {
          dataFromTermination.push({
            orderNum: jsonData.orderNum,
          });
        }
        
      }
    }
  } catch (err) {
    console.log('Error encountered: ' + err);
  }
  connector.close();
};

// Define the API route outside the run function
app.get('/api', (req, res) => {
  res.json({
    dataFromHome,
    dataFromKitchen,
    dataFromTermination
  });
  // Clear the arrays after sending
  dataFromHome.length = 0;
  dataFromKitchen.length = 0;
  dataFromTermination.length = 0;
});

app.listen(5003, async () => {
  console.log("Server started on port 5003");
  await run();
});