const axios = require('axios');
const fs = require('fs');
const path = require('path');

const USER_AGENT = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/127.0.0.0 Safari/537.36 Edg/127.0.0.0';

const readFile = (filePath) => {
  return new Promise((resolve, reject) => {
    fs.readFile(filePath, 'utf8', (err, data) => {
      if (err) reject(err);
      resolve(data.split('\n').filter(line => line.trim() !== ''));
    });
  });
};

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

const requestInfoAkun = async (payload) => {
  const response = await axios.post('https://api.onetime.dog/join', payload.trim(), {
    headers: { 'User-Agent': USER_AGENT }
  });
  return response.data;
};

const requestListTasks = async (userId, reference) => {
  const response = await axios.get(`https://api.onetime.dog/tasks?user_id=${userId}&reference=${reference}`, {
    headers: { 'User-Agent': USER_AGENT }
  });
  return response.data;
};

const requestGoTask = async (taskSlug, userId, reference) => {
  const response = await axios.post(`https://api.onetime.dog/tasks/verify?task=${taskSlug}&user_id=${userId}&reference=${reference}`, null, {
    headers: { 'User-Agent': USER_AGENT }
  });
  return response.data;
};

const requestBalanceRewards = async (userId) => {
  const response = await axios.get(`https://api.onetime.dog/rewards?user_id=${userId}`, {
    headers: { 'User-Agent': USER_AGENT }
  });
  return response.data;
};

const processAccount = async (payload) => {
    const INFO = `\x1b[33m[\x1b[0m INFO \x1b[33m]\x1b[0m`;
    const tTASK = `\x1b[33m[\x1b[0m TASK \x1b[33m]\x1b[0m`;
  try {
    const infoAkun = await requestInfoAkun(payload);
    const { telegram_id, username, age, wallet, streak, reference } = infoAkun;

    console.log(`\n${INFO} ID Tele  : ${telegram_id}`);
    console.log(`${INFO} Username : ${username}`);
    console.log(`${INFO} Age      : ${age}`);
    console.log(`${INFO} Day      : ${streak}`);
    console.log(`${INFO} Wallet   : ${wallet}`);

    const tasks = await requestListTasks(telegram_id, reference);
    for (const task of tasks) {
      if (!task.complete) {
        const goTaskResponse = await requestGoTask(task.slug, telegram_id, reference);
        console.log(`${tTASK} Desc     : ${task.slug}`);
        console.log(`${tTASK} Reward   : ${task.reward}`);
        console.log(`${tTASK} Status   : ${goTaskResponse.success ? '\x1b[32mSukses\x1b[0m' : '\x1b[31mGagal\x1b[0m'}`);

      }
    }

    const balanceRewards = await requestBalanceRewards(telegram_id);
    console.log(`${INFO} Balance  : ${balanceRewards.total}`);

  } catch (error) {
    console.error(`[ ERROR ] ${error.message}`);
  }
};

const main = async () => {
  const filePath = path.resolve(__dirname, 'hash.txt');
  const accounts = await readFile(filePath);
  const INFO = `\x1b[33m[\x1b[0m INFO \x1b[33m]\x1b[0m`;
  const tTASK = `\x1b[33m[\x1b[0m TASK \x1b[33m]\x1b[0m`;

  while (true) {
    for (const account of accounts) {
      await processAccount(account);
      await delay(5000);
    }
    console.log(`${INFO} All Done, Delay 12 Jam`);
    await delay(12 * 60 * 60 * 1000);
  }
};

main();