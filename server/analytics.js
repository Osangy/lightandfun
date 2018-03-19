const axios = require('axios');
const Promise = require('bluebird');
const moment = require('moment');



exports.send = (user_object, event_type, event) => {

  return new Promise((resolve, reject) => {

    axios.get('https://api.amplitude.com/httpapi', {
      params: {
        api_key: process.env.AMPLITUDE_API_KEY,
        event: {
          user_id: user_object.messenger_id,
          event_type,
          event_properties: event,
          user_properties: user_object
        }
      }
    })
    .then((response) => {
      resolve();
    })
    .catch((error) => {
      console.error(error);
      reject(error);
    });

  })

}

exports.incrementWeightTime = (messengerid) => {

  return new Promise((resolve, reject) => {

    axios.get('https://api.amplitude.com/identify', {
      params: {
        api_key: process.env.AMPLITUDE_API_KEY,
        identification: {
          user_id: messengerid,
          user_properties: {
            "$add": {
              "weight_number_time": 1
            }
          }
        }
      }
    })
    .then((response) => {
      resolve();
    })
    .catch((error) => {
      console.error(error);
      reject(error);
    });

  })

}
