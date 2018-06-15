var schedule = require('node-schedule');
const plumesController = require("./server/controllers").plumes;
const usersController = require("./server/controllers").users;
const moment = require('moment');
const RequestQueue = require('node-request-queue');
const config = require('config');

var j = schedule.scheduleJob('0 10 * * *', function(){

  const lastMonth =  moment().subtract(1, 'months').format('MMMM');
  let users = [];
  plumesController.getPlumesSumsForMonth('May').then(sums => {
    sums.forEach(sum => {
      if(sum.userId) users.push(sum.userId)
    });
    return usersController.findUsersIn(users);
  }).then(users => {
    let requests = [];
    users.forEach(user => {
      const url = `https://api.chatfuel.com/bots/${config.get('bot_id')}/users/${user.messengerid}/send?chatfuel_token=${config.get('bot_token')}&chatfuel_block_name=set_plumes_number&plumes_last_month=${lastMonth}`
      const request = {
          method: 'POST',
          uri: url
      }
      requests.push(request);
    })

    // 25 requests in parallel with a delay of 1100ms
    const rq = new RequestQueue(25, 1100);

    // Events
    let j = 0;
    const start = moment();
    rq.on('resolved', res => {
        // Handle successfull response
        console.log(`one resolved : ${j}`);
        j++;
    }).on('rejected', err => {
        console.log('one rejected');
        console.log(err.message);
    }).on('completed', () => {
      const end = moment();
      const s = start.from(end);
      console.log(`Job finished with ${j} requests successful in ${s}`);
    });

    rq.pushAll(requests);

    console.log('Ok');
  }).catch(err => {
    console.error('Job had an error :');
    console.error(err.message);
  })
});
