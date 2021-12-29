# FEC_WebRTC_Sample

This project is a sample of testing FEC on WebRTC that embedded in Chrome browser.

First, install Node.js and nom, initiate a node project.

To start testing, run one command in terminal:

```shel
$ npm start
```

Then, open Chrome browser, enter `localhost:3000`, you'll see a input box. Enter the room number where you want to enter.

Repeat the same steps in another Chrome browser(if doesn't work, use other chrome supported browsers).

Click Connect Server on both browsers, click `Start Record`. Your voice will be live recorded from now on. When you want to stop, click `Stop Record`.
