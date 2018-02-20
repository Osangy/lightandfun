const axios = require('axios');
const Promise = require('bluebird');



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
