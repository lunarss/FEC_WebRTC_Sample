'use strict';

// let localVideo = document.querySelector('video#localvideo');
// let remoteVideo = document.querySelector('video#remotevideo');
const localAudio = document.querySelector('audio#localAudio');
const remoteAudio = document.querySelector('audio#remoteAudio');

const btnConn = document.querySelector('button#connserver');
const btnRecord = document.querySelector('button#record');
const btnLeave = document.querySelector('button#leave');

let optBw = document.querySelector('select#bandwidth');
let optMimeType = document.querySelector('select#mimeType');
// let bandwidthFlag = true;

const offer = document.querySelector('textarea#offer')
const answer = document.querySelector('textarea#answer');

// var shareDeskBox = document.querySelector('input#shareDesk');
let lossRate = 0;
let concealedPackets = 0;
let totalPacketsReceived = 0;
let lossRateCount = 0;

let bitrateGraph;
let bitrateSeries;

let packetGraph;
let packetSeries;

let fecGraph;
let fecSeries;

let lossGraph;
let lossSeries;

let lastResult;
let lastReceiverResult;

let codecList;

let pcConfig = {
	'iceServers':[
		// {
		// 'urls' : 'turn:stun.al.learning.cn:3478',
		// 'credential': "mypassword",
		// 'username':"garrylea",
		// },
		{'urls': 'stun:stun.services.mozilla.com'},
        {'urls': 'stun:stun.l.google.com:19302'}
	]
};

let localStream = null;
let remoteStream = null;

let pc = null;
// let pc1 = null;
// let pc2 = null;

let roomid;
let socket = null;

let offerdesc = null;
let state = 'init';

// let mediaStream;
let localMediaRecorder;
let remoteMediaRecorder;

let oldBitrate = 0;
let baselineReport, currentReport;
let selector;


//=========================================================================================

// false for mobile terminal，true for PC
function IsPC() {
	var userAgentInfo = navigator.userAgent;
	var Agents = ["Android", "iPhone","SymbianOS", "Windows Phone","iPad", "iPod"];
	var flag = true;

	for (var v = 0; v < Agents.length; v++) {
		if (userAgentInfo.indexOf(Agents[v]) > 0) {
			flag = false;
			break;
		}
	}

	return flag;
}

// true for Android, false for IOS
function is_android() {
	var u = navigator.userAgent, app = navigator.appVersion;
	var isAndroid = u.indexOf('Android') > -1 || u.indexOf('Linux') > -1; //g
	var isIOS = !!u.match(/\(i[^;]+;( U;)? CPU.+Mac OS X/); //ios terminal
	if (isAndroid) {
		// return Android
		return true;
	}

	if (isIOS) {
      　　//这个是ios操作系统
     　　 return false;
	}
}

// fetch url parameter
function getQueryVariable(variable)
{
       var query = window.location.search.substring(1);
       var vars = query.split("&");
       for (var i=0;i<vars.length;i++) {
               var pair = vars[i].split("=");
               if(pair[0] == variable){return pair[1];}
       }
       return(false);
}

//=======================================================================

function getRemoteStream(e){
	remoteStream = e.streams[0];
	// remoteVideo.srcObject = e.streams[0];
	remoteAudio.srcObject = e.streams[0];
}

function sendMessage(roomid, data){
	// console.log('send message to other end', "roomid = ",roomid, "data = ",data);
	console.log('send message to other end', "roomid = ",roomid);
	if(!socket){
		console.log('socket is null');
	}
	socket.emit('message', roomid, data);
}

function createPeerConnection(){
	if(!pc){
		pc = new RTCPeerConnection(pcConfig);
		console.log('create RTCPeerConnection!');
		// console.log(pc);

		pc.onicecandidate = (event)=>{
			if(event.candidate){
				// console.log('event is: ', event);
				sendMessage(roomid, {
					type : 'candidate',
					label : event.candidate.sdpMLineIndex,
					id: event.candidate.sdpMid,
					candidate: event.candidate.candidate
				});
			}else {
				console.log('this is the end candidate');
			}
		}

		pc.ontrack = getRemoteStream;
		btnRecord.disabled = false;
	} else {
		console.waring('the pc have be created!');
	}

	return;
}

// function createPeerConnection(){
// 	if(!(pc1&&pc2)){
// 		pc1 = new RTCPeerConnection(pcConfig);
// 		console.log('create RTCPeerConnection 1!');
// 		console.log(pc1);
// 		pc2 = new RTCPeerConnection(pcConfig);
// 		console.log('create RTCPeerConnection 2!');
// 		console.log(pc2);

// 		pc1.onicecandidate = (event)=>{
// 			if(event.candidate){
// 				console.log('event is: ', event);
// 				sendMessage(roomid, {
// 					type : 'candidate1',
// 					label : event.candidate.sdpMLineIndex,
// 					id: event.candidate.sdpMid,
// 					candidate: event.candidate.candidate
// 				});
// 			}else {
// 				console.log('this is the end candidate 1');
// 			}
// 		}

// 		pc2.onicecandidate = (event)=>{
// 			if(event.candidate){
// 				console.log('event is: ', event);
// 				sendMessage(roomid, {
// 					type : 'candidate2',
// 					label : event.candidate.sdpMLineIndex,
// 					id: event.candidate.sdpMid,
// 					candidate: event.candidate.candidate
// 				});
// 			}else {
// 				console.log('this is the end candidate 2');
// 			}
// 		}

// 		pc2.ontrack = getRemoteStream;
// 		btnRecord.disabled = false;
// 	} else {
// 		console.waring('pc1 and pc2 have been created!');
// 	}

// 	return;
// }

// function createPeerConnection1(){
// 	if(!pc1){
// 		pc1 = new RTCPeerConnection(pcConfig);
// 		console.log('create RTCPeerConnection 1!');
// 		console.log(pc1);

// 		pc1.onicecandidate = (event)=>{
// 			if(event.candidate){
// 				sendMessage(roomid, {
// 					type : 'candidate1',
// 					label : event.candidate.sdpMLineIndex,
// 					id: event.candidate.sdpMid,
// 					candidate: event.candidate.candidate
// 				});
// 			}else {
// 				console.log('this is the end candidate 1');
// 			}
// 		}

// 		// pc1.ontrack = getRemoteStream;
// 		btnRecord.disabled = false;
// 	} else {
// 		console.waring('the pc1 have be created!');
// 	}

// 	return;
// }

// function createPeerConnection2(){
// 	if(!pc2){
// 		pc2 = new RTCPeerConnection(pcConfig);
// 		console.log('create RTCPeerConnection 2!');
// 		console.log(pc2);

// 		pc2.onicecandidate = (event)=>{
// 			if(event.candidate){
// 				sendMessage(roomid, {
// 					type : 'candidate2',
// 					label : event.candidate.sdpMLineIndex,
// 					id: event.candidate.sdpMid,
// 					candidate: event.candidate.candidate
// 				});
// 			}else {
// 				console.log('this is the end candidate 2');
// 			}
// 		}

// 		pc2.ontrack = getRemoteStream;
// 		btnRecord.disabled = false;
// 	} else {
// 		console.waring('the pc2 have be created!');
// 	}

// 	return;
// }

function bindTracks(){
	console.log('bind tracks into RTCPeerConnection!');
	// console.log(pc);

	if(pc === null || pc === undefined){
		console.error('pc is null or undefined!');
		return;
	}

	if(localStream === null || localStream === undefined){
		console.error('localStream is null or undefined!');
		return;
	}

	localStream.getTracks().forEach((track)=>{
		pc.addTrack(track, localStream);
	});
}

// function bindTracks12(){
// 	console.log('bind tracks into RTCPeerConnections!');
// 	// console.log(pc);

// 	if(pc1 === null || pc1 === undefined){
// 		console.error('pc1 is null or undefined!');
// 		return;
// 	}

// 	if(pc2 === null || pc2 === undefined){
// 		console.error('pc2 is null or undefined!');
// 		return;
// 	}

// 	if(localStream === null || localStream === undefined){
// 		console.error('localStream is null or undefined!');
// 		return;
// 	}

// 	if(remoteStream === null || remoteStream === undefined){
// 		console.error('remoteStream is null or undefined!');
// 		return;
// 	}

// 	localStream.getTracks().forEach((track)=>{
// 		pc1.addTrack(track, localStream);
// 	});

// 	remoteStream.getTracks().forEach((track)=>{
// 		pc2.addTrack(track, remoteStream);
// 	});
// }

// function bindTracks1(){
// 	console.log('bind tracks into RTCPeerConnection 1!');

// 	if(pc1 === null || pc1 === undefined){
// 		console.error('pc1 is null or undefined!');
// 		return;
// 	}

// 	if(localStream === null || localStream === undefined){
// 		console.error('localStream is null or undefined!');
// 		return;
// 	}

// 	localStream.getTracks().forEach((track)=>{
// 		pc1.addTrack(track, localStream);
// 	});
// }

// function bindTracks2(){
// 	console.log('bind tracks into RTCPeerConnection 2!');

// 	if(pc2 === null || pc2 === undefined){
// 		console.error('pc2 is null or undefined!');
// 		return;
// 	}

// 	if(remoteStream === null || remoteStream === undefined){
// 		console.error('remoteStream is null or undefined!');
// 		return;
// 	}

// 	remoteStream.getTracks().forEach((track)=>{
// 		pc2.addTrack(track, remoteStream);
// 	});
// }

function createAnswerSuc(desc){
	// desc.sdp = desc.sdp.replace('useinbandfec=1', 'useinbandfec=0');
	// desc.sdp = desc.sdp.replace('a=rtpmap:113 telephone-event/16000', 
	// 	'a=rtpmap:113 telephone-event/16000\r\na=rtpmap:116 red/48000/2');
	// \r\na=rtpmap:117 ulpfec/48000');
	// console.log(desc.sdp);
	console.log("send answer to another peer");
	pc.setLocalDescription(desc);
	// pc2.setLocalDescription(desc);
	// desc.sdp = desc.sdp.replace('useinbandfec=1', 'useinbandfec=0');

	answer.value = desc.sdp;
	optBw.disabled = false;
	optMimeType.disabled = true;

	sendMessage(roomid, desc);
}

function createOfferSuc(desc){
	// desc.sdp = desc.sdp.replace('useinbandfec=1', 'useinbandfec=0');
	// desc.sdp = desc.sdp.replace('a=rtpmap:113 telephone-event/16000', 
	// 	'a=rtpmap:113 telephone-event/16000\r\na=rtpmap:116 red/48000/2');
		// \r\na=rtpmap:117 ulpfec/48000');
	// console.log(desc.sdp);
	console.log("send offer to another peer");
	pc.setLocalDescription(desc);
	// pc1.setLocalDescription(desc);
	// desc.sdp = desc.sdp.replace('useinbandfec=1', 'useinbandfec=0');

	offer.value = desc.sdp;
	offerdesc = desc;
	// console.log('offer type is: ', desc.type);

	//send offer sdp
	sendMessage(roomid, offerdesc);
}

function createOfferFail(err){
	console.error('Failed to create answer:', err);
}

function call(){
	if(state === 'joined_conn'){
		var offerOptions = {
			offerToRecieveAudio : 1,
			offerToRecieveVideo : 0,
			voiceActivityDetection: false
		}

		pc.createOffer(offerOptions)
		// pc1.createOffer(offerOptions)
		.then(createOfferSuc)
		.catch(createOfferFail);
	}
}

function closeLocalMedia(){
	if(localStream && localStream.getTracks()){
		localStream.getTracks().forEach((track) => {
			track.stop();
		});
	}
	localStream = null;
}

function conn(){
	//3 ===============connect signalling server，set callback function===============
	socket = io.connect();

	socket.on("joined", (roomid, id) => {
		state = 'joined';

		createPeerConnection();
		// changeAudioCodec();
		bindTracks();
		// createPeerConnection1();
		// bindTracks1();

		btnConn.disabled = true;
		btnLeave.disabled = false;
		console.log('receive joined message, state = ',state,",roomid = ",roomid, ",id = ",id);
	});

	socket.on('otherjoin', (roomid, id) =>{
		if(state === 'joined_unbind'){
			createPeerConnection();
			bindTracks();
			// createPeerConnection2();
			// bindTracks2();
			btnRecord.disabled = false;
		}
		state = 'joined_conn';
		call();

		console.log('receive other_joined message, state = ', state,",roomid = ",roomid, ",id = ",id);
	});

	socket.on('full',(roomid, id) => {
		console.log('receive full message ', roomid, id);
		hangup();
		closeLocalMedia();
		state = 'leaved';
		console.log('receive full message, state = ',state);
		alert('the room is full! ');
	})

	socket.on('leaved', (roomid, id) =>{
		console.log('receive leaved message', roomid, id);

		state = 'leaved';
		socket.disconnect();
		
		console.log('receive leaved message, state = ', state);

		btnConn.disabled = false;
		btnLeave.disabled = true;
		btnRecord.disabled = true;
		optBw.disabled = true;
		optMimeType.disabled = false;
	});

	socket.on('bye', (room,id)=>{
		console.log('receive bye message', roomid, id);

		state = 'joined_unbind';
		hangup();
		offer.value = '';
		answer.value = '';
		console.log('receive bye message, state = ', state);
	})

	socket.on('disconnect', (socket)=>{
		console.log('receive disconnect message!', roomid);

		if(!(state === 'leaved')){
			hangup();
			closeLocalMedia();
		}

		state = 'leaved';

		btnConn.disabled = false;
		btnLeave.disabled = true;
		btnRecord.disabled = true;
		optBw.disabled = true;
		optMimeType.disabled = false;
	});

	socket.on('message', (roomid, data) => {

		if(data === null || data === undefined){
				console.err('the message is invalid!');
				return;
		}

		if(data.hasOwnProperty('type') && data.type === 'offer'){
			// console.log('receive offer', roomid, data);
			console.log('receive offer in room ', roomid);

			// console.log(ps2);
			// data.sdp = data.sdp.replace('useinbandfec=1', 'useinbandfec=0');
			// data.sdp = data.sdp.replace('a=rtpmap:113 telephone-event/16000', 
			// 				'a=rtpmap:113 telephone-event/16000\r\na=rtpmap:116 red/48000/2');

			offer.value = data.sdp;
			pc.setRemoteDescription(new RTCSessionDescription(data));
			// pc2.setRemoteDescription(new RTCSessionDescription(data));

			//create answer
			pc.createAnswer()
			// pc2.createAnswer()
			.then(createAnswerSuc)
			.catch(handleAnswerError);
		}else if(data.hasOwnProperty('type') && data.type === 'answer'){
			// console.log('receive answer', roomid, data);
			console.log('receive answer in room: ', roomid);

			optBw.disabled = false;
			optMimeType.disabled = true;

			// data.sdp = data.sdp.replace('useinbandfec=1', 'useinbandfec=0');
			// data.sdp = data.sdp.replace('a=rtpmap:113 telephone-event/16000', 
			// 				'a=rtpmap:113 telephone-event/16000\r\na=rtpmap:116 red/48000/2');

			answer.value = data.sdp;
			pc.setRemoteDescription(new RTCSessionDescription(data));
			// pc1.setRemoteDescription(new RTCSessionDescription(data));
		}else if(data.hasOwnProperty('type') && data.type === 'candidate'){
			// console.log('receive candidate', roomid, data);
			console.log('receive candidate in room: ', roomid);

			var candidate = new RTCIceCandidate({
				sdpMLineIndex: data.label,
				candidate: data.candidate
			});
			pc.addIceCandidate(candidate);

			// let codecList = null;
			// pc.addEventListener('icegatheringstatechange', (event) => {
			// 	if (pc.iceGatheringState === 'complete'){
			// 		const senders = pc.getSenders();
			// 		senders.forEach((sender) => {
			// 			if(sender.track.kind === 'audio'){
			// 				codecList = sender.getParameters().codecs;
			// 				console.log("codec list is: ");
			// 				return;
			// 			}
			// 		});
			// 	}
			// 	codecList = null;
			// });

			// calculate packet loss rate
			// selector = pc.getRemoteStreams()[0].getAudioTracks()[0];
			// pc.getStats(selector, function(report){
			// 	baselineReport = report;
			// }, logError);
		}
		// else if(data.hasOwnProperty('type') && data.type === 'candidate1'){
		// 	console.log('receive candidate1', roomid, data);

		// 	var candidate = new RTCIceCandidate({
		// 		sdpMLineIndex: data.label,
		// 		candidate: data.candidate
		// 	});
		// 	pc2.addIceCandidate(candidate);

		// }else if(data.hasOwnProperty('type') && data.type === 'candidate2'){
		// 	console.log('receive candidate2', roomid, data);

		// 	var candidate = new RTCIceCandidate({
		// 		sdpMLineIndex: data.label,
		// 		candidate: data.candidate
		// 	});
		// 	pc1.addIceCandidate(candidate);
			
		// }
		else{
			console.log('the message is invalid', data);
		}
	});

	roomid = getQueryVariable('room');
	socket.emit('join', roomid);
	return true;
}

function getMediaStream(stream){
	if(localStream){
		stream.getAudioTracks().forEach((track)=>{
			localStream.addTrack(track);
			stream.removeTrack(track);
		})
	} else {
		localStream = stream;
	}

	//2 ===============show local stream===============
	// localVideo.srcObject = localStream;
	localAudio.srcObject = localStream;
	// 设置record参数
	// mediaStream = stream;

	// important calling time, must call it after getMediaStream, or may cause bind failure
	conn();

	bitrateSeries = new TimelineDataSeries();
	bitrateGraph = new TimelineGraphView('bitrateGraph', 'bitrateCanvas');
	bitrateGraph.updateEndDate();

	packetSeries = new TimelineDataSeries();
	packetGraph = new TimelineGraphView('packetGraph', 'packetCanvas');
	packetGraph.updateEndDate();

	fecSeries = new TimelineDataSeries();
	fecGraph = new TimelineGraphView('fecGraph', 'fecCanvas');
	fecGraph.updateEndDate();

	lossSeries = new TimelineDataSeries();
	lossGraph = new TimelineGraphView('lossGraph', 'lossCanvas');
	lossGraph.updateEndDate();
}

function handleError(err){
	console.error("Failed to get Media Stream!", err);
}

function handleAnswerError(err){
	console.error("Failed to get Answer!", err);
}


// function getDeskStream(stream){
// 	localStream = stream;
	
// 	localVideo.srcObject = localStream;
// 	conn();
// }

// function shareDesk(){
// 	if(IsPC()){
// 		navigator.mediaDevices.getDisplayMedia({video:true})
// 		.then(getDeskStream)
// 		.catch(handleError);

// 		return true;
// 	}

// 	return false;
// }

function start(){
	if(!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia){
		// console.log(navigator.mediaDevices);
		console.error('the getUserMedia is not supported!');
		return;
	}else {
		//1 ===============set audio/video parameter===============
		var constraints;
		// console.log(navigator.mediaDevices);

		// if(shareDeskBox.checked && shareDesk()){
		// 	constraints = {
		// 		video : true,
		// 		audio : {
		// 			echoCancellation : true,
		// 			noiseSuppression : true,
		// 			autoGainControl : true
		// 		}
		// 	}
		// }else{
			constraints = {
				// video : true,
				video : false,
				audio : true
				// {
				// 	echoCancellation : true,
				// 	noiseSuppression : true,
				// 	autoGainControl : true
				// }
			}

			navigator.mediaDevices.getUserMedia(constraints)
				.then(getMediaStream)
				.catch(handleError);
		// }
	}
}

function leave(){
	if(socket){
		socket.emit('leave', roomid);
	}

	hangup();
	closeLocalMedia();

	btnConn.disabled = false;
	btnLeave.disabled = true;
	btnRecord.disabled = true;
	btnRecord.innerText = 'Start Record';
	optBw.disabled = true;
	optMimeType.disabled = false;
}

function hangup(){
	if(pc){
		offerdesc = null;
		pc.close();
		pc = null;
	}
	// if(pc2){
	// 	// offerdesc = null;
	// 	pc2.close();
	// 	pc2 = null;
	// }else if(pc1){
	// 	offerdesc = null;
	// 	pc1.close();
	// 	pc1 = null;
	// }
}

function connSignalServer(){
	// start local stream
	start();

	return true;
}

// set band width
function change_bw(){
	// let defaultBitRate;
	// if (bandwidthFlag){
	// 	pc.getSenders().forEach(sender => {
	// 		if(sender){
	// 			defaultBitRate = sender.getParameters().encodings[0].maxBitrate;
	// 		}
	// 	})
	// 	bandwidthFlag = false;
	// }
	
	// optBw.disabled = true;
	var bw = optBw.options[optBw.selectedIndex].value;

	var vsender = null;
	var senders = pc.getSenders();

	senders.forEach(sender => {
		// if(sender && sender.track.kind === 'video'){
		if(sender && sender.track.kind === 'audio'){
			vsender = sender;
		}
	});

	var parameters = vsender.getParameters();
	if(!parameters.encodings){
		return;
	}

	// if(bw == 'unlimited'){
	// 	parameters.encodings[0].maxBitrate = defaultBitRate;
	// 	vsender.setParameters(parameters)
	// 		.then(()=>{
	// 			optBw.disabled = false;
	// 			console.log(parameters.encodings[0].maxBitrate, 'bps');
	// 			console.log('Succeed to set parameters!');
	// 		})
	// 		.catch(err =>{
	// 			console.log(err);
	// 		})
	// 	// return;
	// } else {
		parameters.encodings[0].maxBitrate = bw * 1000;
		vsender.setParameters(parameters)
			.then(()=>{
				optBw.disabled = false;
				// console.log(parameters.encodings[0].maxBitrate, 'bps');
				console.log('Successfully set max bitrate to: ', parameters.encodings[0].maxBitrate, 'bps');
			})
			.catch(err =>{
				console.log(err);
			})
	// }
}

// set Codec
function changeAudioCodec() {
	let mimeType = "audio/opus";
	let count = optMimeType.options[optMimeType.selectedIndex].value;
	if (count === 1) {
		mimeType = "audio/opus";
	} else if (count === 2) {
		mimeType = "audio/red";
	}
	if (!!pc) {
		const transceivers = pc.getTransceivers();
		console.log('mimeType is: ', mimeType);

		transceivers.forEach(transceiver => {
			const kind = transceiver.sender.track.kind;
			let sendCodecs = RTCRtpSender.getCapabilities(kind).codecs;
			let recvCodecs = RTCRtpReceiver.getCapabilities(kind).codecs;
		
			if (kind === "audio") {
				sendCodecs = preferCodec(sendCodecs, mimeType);
				recvCodecs = preferCodec(recvCodecs, mimeType);
				transceiver.setCodecPreferences([...sendCodecs, ...recvCodecs]);
			}
		});
	}
	// pc.onnegotiationneeded = function() {
	// 	pc.createOffer().then(function(offer) {
	// 	  return pc.setLocalDescription(offer);
	// 	}).then(function(offer) {
	// 		// Send the offer to the remote peer through the signaling server
	// 		sendMessage(roomid, offer);
	// 	  }).catch(reportError);
	// };
}

function preferCodec(codecs, mimeType) {
	let otherCodecs = [];
	let sortedCodecs = [];
	let count = codecs.length;
  
	codecs.forEach(codec => {
	  if (codec.mimeType === mimeType) {
		sortedCodecs.push(codec);
	  } else {
		otherCodecs.push(codec);
	  }
	});
  
	// console.log("sorted codecs: ", sortedCodecs);
	return sortedCodecs.concat(otherCodecs);
}
  
// function processStats(){
// 	// console.log(currentReport);
// 	for (var i in currentReport){
// 		var now = currentReport[i];
// 		console.log(now.type);
// 		if (now.type != 'outbound-rtp') {
// 			continue;
// 		}

// 		let base = baselineReport[now.id];
// 		if (!!base){
// 			let remoteNow = currentReport[now.associateStatsId];
// 			let remoteBase = baselineReport[base.associateStatsId];
// 			let packetsSent = now.packetsSent - base.packetsSent;
// 			let packetsReceived = remoteNow.packetsReceived - remoteBase.packetsReceived;

// 			let fractionLost = (packetsSent - packetsReceived) / packetsSent; 
// 			console.log('Packets loss rate = ', fractionLost*100, '%');
// 		}
// 	}
// }

// function logError(error){
// 	log(error.name + ': ' + error.message);
// }

window.setInterval(() => {
	if(!pc){
		return;
	}

	// console.log(remoteStream.getAudioTracks());
	// console.log(!!remoteStream);

	// if (!!remoteStream){
	// 	selector = remoteStream.getAudioTracks()[0];
	// 	// console.log(selector);
	// 	pc.getStats(selector, function (report) {
	// 	// pc.getStats().then(report => {
	// 		// console.log(report);
	// 		currentReport = report;
	// 		if (!!baselineReport){
	// 			processStats();
	// 			console.log('process');
	// 		}
	// 		baselineReport = report;
	// 	}, logError);
	// }

	const sender = pc.getSenders()[0];
	if(!sender){
		return;
	}

	sender.getStats().then(res =>{
		// let bytes;
		let packets;
		let lastPackets;
		let packetsSent;
		res.forEach(report => {
			let bytes;
			// let packets;
			// let lastPackets;
			// let packetsSent;
			// console.log(report);
			if(report.type === 'outbound-rtp'){
			// if(report.type === 'transport'){
				// console.log(report);
				if(report.isRemote){
					return;
				}

				const now = report.timestamp;
				bytes = report.bytesSent;
				packets = report.packetsSent;
				if(lastResult && lastResult.has(report.id)){
					//calculate bitrate
					// const bitrate = 8 * (bytes - lastResult.get(report.id).bytesSent)/(now - lastResult.get(report.id).timestamp);
					// const bitrate = 8 * (packets - lastResult.get(report.id).packetsSent)/(now - lastResult.get(report.id).timestamp);
					// const packetsSent = packets - lastResult.get(report.id).packetsSent;
					// const packetsSent = packets - lastPackets;
					const lastBytes = lastResult.get(report.id).bytesSent;
					lastPackets = lastResult.get(report.id).packetsSent;
					const bitrate = 8 * (bytes - lastBytes)/(now - lastResult.get(report.id).timestamp);
					packetsSent = packets - lastPackets;
					// const packetsReceived = report.packetsReceived - lastResult.get(report.id).packetsReceived;
					// const fractionLost = (packetsSent - packetsReceived) / packetsSent; 
					// console.log('Packets loss rate = ', fractionLost*100, '%');
					// console.log('number of packets sent now is: ', packetsSent);

					// const packetsReceived = report.packetsReceived - lastResult.get(report.id).packetsReceived;
					// const fractionLost = (packetsSent - packetsReceived) / packetsSent; 
					// console.log('Packets loss rate = ', fractionLost*100, '%');

					// console.log('bitrate now is: ', bitrate, 'kbps');

					//append to chart 
					bitrateSeries.addPoint(now, bitrate);
					bitrateGraph.setDataSeries([bitrateSeries]);
					bitrateGraph.updateEndDate();

					//caculate number of packets and apend to chart
					packetSeries.addPoint(now, packetsSent);
					packetGraph.setDataSeries([packetSeries]);
					packetGraph.updateEndDate();

				}
			}

			// if(report.type === 'transport'){
			// 	if(lastResult && lastResult.has(report.id)){
			// 		const packetsReceived = report.packetsReceived - lastResult.get(report.id).packetsReceived;
			// 		// console.log('packetsSent: ', packetsSent);
			// 		// console.log('packetsReceived: ', packetsReceived);
			// 		const fractionLost = (packetsSent - packetsReceived) / packetsSent; 
			// 		console.log('Packets loss rate = ', fractionLost*100, '%');
			// 	}
			// }
		});
		lastResult = res;
	});

	const receiver = pc.getReceivers()[0];
	if(!receiver){
		return;
	}

	receiver.getStats().then(res => {
	  	res.forEach(report => {
			if(report.type === "track") {
				if (report.isRemote) {
					return;
				}

				const now = report.timestamp;
				if (lastReceiverResult && lastReceiverResult.has(report.id)) {
					lossRateCount += 1;
					// concealedPackets += report.concealedSamples - lastReceiverResult.get(report.id).concealedSamples;
					// totalPacketsReceived += report.totalSamplesReceived - lastReceiverResult.get(report.id).totalSamplesReceived;
					if (lossRateCount === 10){
						lossRate = 100 * (report.concealedSamples - concealedPackets) / (report.totalSamplesReceived - totalPacketsReceived);
						console.log('Loss rate now is: ', lossRate, '%');
						lossRateCount = 0;
						concealedPackets = report.concealedSamples;
						totalPacketsReceived = report.totalSamplesReceived;
					}
					// console.log(lossRate);
					lossSeries.addPoint(now, lossRate);
					lossGraph.setDataSeries([lossSeries]);
					lossGraph.updateEndDate();
				}
				// console.log("concealmentEvents: ", report.concealmentEvents, 
				// 		"\r\nconcealedSamples: ", report.concealedSamples,
				// 		"\r\ntotalSamplesReceived: ", report.totalSamplesReceived,
				// 		"\r\nloss rate: ", 100*report.concealedSamples / report.totalSamplesReceived);
			}

			if (report.type === 'inbound-rtp' && lastReceiverResult) { 
				// FEC stuff. Missing on outbound-rtp.
				if (report.isRemote) {
					return;
				}

				const now = report.timestamp;
				const received = report.fecPacketsReceived;
			//   const discarded = report.fecPacketsReceived;
	
				if (lastReceiverResult && lastReceiverResult.has(report.id)) {
					let fecRate = 1000 * (received - lastReceiverResult.get(report.id).fecPacketsReceived) / (now - lastReceiverResult.get(report.id).timestamp);
					// console.log('FEC rate now is: ', fecRate, 'kbps');
					fecSeries.addPoint(now, fecRate);
					fecGraph.setDataSeries([fecSeries]);
					fecGraph.updateEndDate();
				}
			}
	  	});
	  	lastReceiverResult = res;
	});
	
	// show codec list
	// codecList = RTCRtpSender.getCapabilities("audio").codecs;
	// console.log("default codec list in sender is: ", codecList);
	// codecList = RTCRtpReceiver.getCapabilities("audio").codecs;
	// console.log("default codec list in receiver is: ", codecList);

	// codecList = sender.getParameters().codecs;
	// console.log("codec list in sender is: ", codecList);
	// codecList = receiver.getParameters().codecs;
	// console.log("codec list in receiver is: ", codecList);

	// let sendersBW = sender.getParameters();
	// console.log("BW in sender is: ", sendersBW);

}, 1000);

btnConn.onclick = connSignalServer;
// btnRemote.onclick = getDeskStream;
btnLeave.onclick = leave;
optBw.onchange = change_bw;
// optMimeType.onchange = changeAudioCodec;
btnRecord.onclick = recordAudios;


const recordLocalPlayer = document.querySelector('audio#recordLocalAudio');
const recordRemotePlayer = document.querySelector('audio#recordRemoteAudio');
// const recordLocalBtn = document.querySelector('button#recordLocalBtn');
// const recordRemoteBtn = document.querySelector('button#recordRemoteBtn');
const playLocalBtn = document.querySelector('button#playLocalBtn');
const playRemoteBtn = document.querySelector('button#playRemoteBtn');
const downloadLocalBtn = document.querySelector('button#downloadLocalBtn');
const downloadRemoteBtn = document.querySelector('button#downloadRemoteBtn');

let localBuffer; // used to store recording array（array）
let remoteBuffer; // used to store recording array（array）
// let mediaStream;
// let localMediaRecorder;

// start();
playLocalBtn.onclick = playLocalAudio;
playRemoteBtn.onclick = playRemoteAudio;
downloadLocalBtn.onclick = downloadLocalAudio;
downloadRemoteBtn.onclick = downloadRemoteAudio;

// recording button onClick event
function recordAudios(){
// switch title between "Start Record" and "Stop Record"
	console.log(btnRecord.innerText);
    if (btnRecord.innerText==='Start Record') {
		console.log('Start recording.');
        startRecord();
        btnRecord.innerText = 'Stop Record';
        playLocalBtn.disabled = false;
        playRemoteBtn.disabled = false;
        downloadLocalBtn.disabled = false;
        downloadRemoteBtn.disabled = false;
    }else if (btnRecord.innerText==='Stop Record') {
		console.log('Stop recording.');
        stopRecord();
        btnRecord.innerText = 'Start Record';
        // playBtn.attr('disabled',true);
        // downloadBtn.attr('disabled',true);
    }
}

// Play local button onClick event
function playLocalAudio(){
    var blob = new Blob(localBuffer,{type:'audio/webm'});
    // generate url based on cache for recordPlayer
    recordLocalPlayer.src = window.URL.createObjectURL(blob);
    recordLocalPlayer.srcObject = null;
    recordLocalPlayer.controls = true; // show play widget
}

// Play remote button onClock event
function playRemoteAudio(){
    var blob = new Blob(remoteBuffer,{type:'audio/webm'});
    // generate url based on cache for recordPlayer
    recordRemotePlayer.src = window.URL.createObjectURL(blob);
    recordRemotePlayer.srcObject = null;
    recordRemotePlayer.controls = true; // show play widget
}

// Download local button onClick event
function downloadLocalAudio(){
    var blob = new Blob(localBuffer,{type:'audio/webm'});
    // generate url based on cache
    var url = window.URL.createObjectURL(blob);
    // Create 'a' symbol，point to url by 'a' to download
    var a = document.createElement('a');
    a.href = url;
    a.style.display = 'none'; // make 'a' invisible
    a.download = 'testlocal.mp3'; // downloaded file name
    a.click(); // download by calling click event of 'a'
}

// Download remote button onClick event
function downloadRemoteAudio(){
    var blob = new Blob(remoteBuffer,{type:'audio/webm'});
    // generate url based on cache
    var url = window.URL.createObjectURL(blob);
    // Create 'a' symbol，point to url by 'a' to download
    var a = document.createElement('a');
    a.href = url;
    a.style.display = 'none'; // make 'a' invisible
    a.download = 'testremote.mp3'; // downloaded file name
    a.click(); // download by calling click event of 'a'
}

// Start recording
function startRecord(){
    // var options = {mimeType:'video/webm;codecs=vp8'};
    var options = {mimeType:'audio/webm\;codecs=opus'};
    if(!MediaRecorder.isTypeSupported(options.mimeType)){
        console.log('Not support '+options.mimeType);
        return;
    }

    try{
        localBuffer = [];
        localMediaRecorder = new MediaRecorder(localStream, options);
        remoteBuffer = [];
        remoteMediaRecorder = new MediaRecorder(remoteStream, options);
    }catch(e){
        console.log('Fail to create MediaRecorder!');
        return;
    }
    localMediaRecorder.ondataavailable = handleLocalDataAvailable;
    remoteMediaRecorder.ondataavailable = handleRemoteDataAvailable;
    // Start recording，set recording snippet to 10ms(trigger ondataavilable event per 10ms)
    localMediaRecorder.start(10);
    remoteMediaRecorder.start(10);
}

// Stop recording(will trigger ondataavilable event)
function stopRecord (){
    localMediaRecorder.stop();
	remoteMediaRecorder.stop();
}

// Trigger callback function of local ondataavilable event
function handleLocalDataAvailable(e){
    if (e && e.data && e.data.size>0) {
        localBuffer.push(e.data);
    }
}

// Trigger callback function of remote ondataavilable event
function handleRemoteDataAvailable(e){
    if (e && e.data && e.data.size>0) {
        remoteBuffer.push(e.data);
    }
}

// function start(){
//     if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
//         console.log('Not support capturing audio/video data！');
//     }else{
//         // capture audio/video data
//         var constrants = {
//             video:true,
//             audio:true
//         };
//         navigator.mediaDevices.getUserMedia(constrants).then(gotMediaStream).catch(handleError);
//     }
// }


// Call once capturing data successfully
// function gotMediaStream(stream){
//     mediaStream = stream;
//     player.srcObject = stream;
// }

// // Call once failing to capture data 
// function handleError(err){
//     console.log(err.name+':'+err.message);
// }




// // let localConnection;
// // let remoteConnection;
// let sendChannel;
// let receiveChannel;
// let fileReader;
// const bitrateDiv = document.querySelector('div#bitrate');
// const fileInput = document.querySelector('input#fileInput');
// const abortButton = document.querySelector('button#abortButton');
// const downloadAnchor = document.querySelector('a#download');
// const sendProgress = document.querySelector('progress#sendProgress');
// const receiveProgress = document.querySelector('progress#receiveProgress');
// const statusMessage = document.querySelector('span#status');
// const sendFileButton = document.querySelector('button#sendFile');

// let receiveBuffer = [];
// let receivedSize = 0;

// let bytesPrev = 0;
// let timestampPrev = 0;
// let timestampStart;
// let statsInterval = null;
// let bitrateMax = 0;

// sendFileButton.addEventListener('click', () => createConnection());
// fileInput.addEventListener('change', handleFileInputChange, false);
// abortButton.addEventListener('click', () => {
//   if (fileReader && fileReader.readyState === 1) {
//     console.log('Abort read!');
//     fileReader.abort();
// 	sendFileButton.disabled = false;
// 	abortButton.disabled = true;
//   }
// });

// async function handleFileInputChange() {
//   const file = fileInput.files[0];
//   if (!file) {
//     console.log('No file chosen');
//   } else {
//     sendFileButton.disabled = false;
//   }
// }

// async function createConnection() {
// 	sendFileButton.disabled = true;
//   	abortButton.disabled = false;

// 	// socket.of("/").in(room).allSockets().then(items => {
// 	// // https_socket.of("/").in(room).allSockets().then(items => {
// 	// 	var users = 0;
// 	// 	items.forEach(item=>{
// 	// 		console.log('UserID: '+item);
// 	// 		users += 1;
// 	// 	})
// 	// 	// logger.log('the number of user in room is: ' + users);
// 	// 	console.log('the number of user in room is: ' + users);
// 	// 	console.log('the room is: ' + room);

// 	// 	if(users === 2) {
// 	// 		sendFileButton.disabled = true;
// 	// 		abortButton.disabled = false;
// 	// 	}else {
// 	// 		alert('cannot build connection');	
// 	// 		return;
// 	// 	}
// 	// });
// //   localConnection = new RTCPeerConnection();
// //   console.log('Created local peer connection object localConnection');

// //   sendChannel = localConnection.createDataChannel('sendDataChannel');
//   sendChannel = pc.createDataChannel('sendDataChannel');
//   sendChannel.binaryType = 'arraybuffer';
//   console.log('Created send data channel');

//   sendChannel.addEventListener('open', onSendChannelStateChange);
//   sendChannel.addEventListener('close', onSendChannelStateChange);
//   sendChannel.addEventListener('error', onError);

// //   localConnection.addEventListener('icecandidate', async event => {
// //     console.log('Local ICE candidate: ', event.candidate);
// //     await remoteConnection.addIceCandidate(event.candidate);
// //   });

// //   remoteConnection = new RTCPeerConnection();
// //   console.log('Created remote peer connection object remoteConnection');

// //   remoteConnection.addEventListener('icecandidate', async event => {
// //     console.log('Remote ICE candidate: ', event.candidate);
// //     await localConnection.addIceCandidate(event.candidate);
// //   });
// //   remoteConnection.addEventListener('datachannel', receiveChannelCallback);
//   pc.addEventListener('datachannel', receiveChannelCallback);

// //   try {
// // 	// var offerOptions = {
// // 	// 	offerToRecieveAudio : 1,
// // 	// 	offerToRecieveVideo : 0
// // 	// }
// //     // const offer = await localConnection.createOffer(offerOptions);
// //     const offer = await localConnection.createOffer();
// //     await gotLocalDescription(offer);
// //   } catch (e) {
// //     console.log('Failed to create session description: ', e);
// //   }

//   fileInput.disabled = true;
// }

// function sendData() {
//   const file = fileInput.files[0];
//   console.log(`File is ${[file.name, file.size, file.type, file.lastModified].join(' ')}`);

//   // Handle 0 size files.
//   statusMessage.textContent = '';
//   downloadAnchor.textContent = '';
//   if (file.size === 0) {
//     bitrateDiv.innerHTML = '';
//     statusMessage.textContent = 'File is empty, please select a non-empty file';
//     closeDataChannels();
//     return;
//   }
//   sendProgress.max = file.size;
//   receiveProgress.max = file.size;
//   const chunkSize = 16384;
//   fileReader = new FileReader();
//   let offset = 0;
//   fileReader.addEventListener('error', error => console.error('Error reading file:', error));
//   fileReader.addEventListener('abort', event => console.log('File reading aborted:', event));
//   fileReader.addEventListener('load', e => {
//     console.log('FileRead.onload ', e);
//     sendChannel.send(e.target.result);
//     offset += e.target.result.byteLength;
//     sendProgress.value = offset;
//     if (offset < file.size) {
//       readSlice(offset);
//     }
//   });
//   const readSlice = o => {
//     console.log('readSlice ', o);
//     const slice = file.slice(offset, o + chunkSize);
//     fileReader.readAsArrayBuffer(slice);
//   };
//   readSlice(0);
// }

// function closeDataChannels() {
//   console.log('Closing data channels');
//   sendChannel.close();
//   console.log(`Closed data channel with label: ${sendChannel.label}`);
//   sendChannel = null;
//   if (receiveChannel) {
//     receiveChannel.close();
//     console.log(`Closed data channel with label: ${receiveChannel.label}`);
//     receiveChannel = null;
//   }
// //   localConnection.close();
// //   remoteConnection.close();
// //   localConnection = null;
// //   remoteConnection = null;
// //   console.log('Closed peer connections');

//   // re-enable the file select
//   fileInput.disabled = false;
//   abortButton.disabled = true;
//   sendFileButton.disabled = false;
// }

// // async function gotLocalDescription(desc) {
// //   await localConnection.setLocalDescription(desc);
// //   console.log(`Offer from localConnection\n ${desc.sdp}`);
// //   await remoteConnection.setRemoteDescription(desc);
// //   try {
// //     const answer = await remoteConnection.createAnswer();
// //     await gotRemoteDescription(answer);
// //   } catch (e) {
// //     console.log('Failed to create session description: ', e);
// //   }
// // }

// // async function gotRemoteDescription(desc) {
// //   await remoteConnection.setLocalDescription(desc);
// //   console.log(`Answer from remoteConnection\n ${desc.sdp}`);
// //   await localConnection.setRemoteDescription(desc);
// // }

// function receiveChannelCallback(event) {
//   console.log('Receive Channel Callback');
//   receiveChannel = event.channel;
//   receiveChannel.binaryType = 'arraybuffer';
//   receiveChannel.onmessage = onReceiveMessageCallback;
//   receiveChannel.onopen = onReceiveChannelStateChange;
//   receiveChannel.onclose = onReceiveChannelStateChange;

//   receivedSize = 0;
//   bitrateMax = 0;
//   downloadAnchor.textContent = '';
//   downloadAnchor.removeAttribute('download');
//   if (downloadAnchor.href) {
//     URL.revokeObjectURL(downloadAnchor.href);
//     downloadAnchor.removeAttribute('href');
//   }
// }

// function onReceiveMessageCallback(event) {
//   console.log(`Received Message ${event.data.byteLength}`);
//   receiveBuffer.push(event.data);
//   receivedSize += event.data.byteLength;
//   receiveProgress.value = receivedSize;

//   // we are assuming that our signaling protocol told
//   // about the expected file size (and name, hash, etc).
//   const file = fileInput.files[0];
//   if (receivedSize === file.size) {
//     const received = new Blob(receiveBuffer);
//     receiveBuffer = [];

//     downloadAnchor.href = URL.createObjectURL(received);
//     downloadAnchor.download = file.name;
//     downloadAnchor.textContent =
//       `Click to download '${file.name}' (${file.size} bytes)`;
//     downloadAnchor.style.display = 'block';

//     const bitrate = Math.round(receivedSize * 8 /
//       ((new Date()).getTime() - timestampStart));
//     bitrateDiv.innerHTML =
//       `<strong>Average Bitrate:</strong> ${bitrate} kbits/sec (max: ${bitrateMax} kbits/sec)`;

//     if (statsInterval) {
//       clearInterval(statsInterval);
//       statsInterval = null;
//     }

//     closeDataChannels();
//   }
// }

// function onSendChannelStateChange() {
//   if (sendChannel) {
//     const {readyState} = sendChannel;
//     console.log(`Send channel state is: ${readyState}`);
//     if (readyState === 'open') {
//       sendData();
//     }
//   }
// }

// function onError(error) {
//   if (sendChannel) {
//     console.error('Error in sendChannel:', error);
//     return;
//   }
//   console.log('Error in sendChannel which is already closed:', error);
// }

// async function onReceiveChannelStateChange() {
//   if (receiveChannel) {
//     const readyState = receiveChannel.readyState;
//     console.log(`Receive channel state is: ${readyState}`);
//     if (readyState === 'open') {
//       timestampStart = (new Date()).getTime();
//       timestampPrev = timestampStart;
//       statsInterval = setInterval(displayStats, 500);
//       await displayStats();
//     }
//   }
// }

// // display bitrate statistics.
// async function displayStats() {
// //   if (remoteConnection && remoteConnection.iceConnectionState === 'connected') {
// //     const stats = await remoteConnection.getStats();
//   if (pc && pc.iceConnectionState === 'connected') {
//     const stats = await pc.getStats();
//     let activeCandidatePair;
//     stats.forEach(report => {
//       if (report.type === 'transport') {
//         activeCandidatePair = stats.get(report.selectedCandidatePairId);
//       }
//     });
//     if (activeCandidatePair) {
//       if (timestampPrev === activeCandidatePair.timestamp) {
//         return;
//       }
//       // calculate current bitrate
//       const bytesNow = activeCandidatePair.bytesReceived;
//       const bitrate = Math.round((bytesNow - bytesPrev) * 8 /
//         (activeCandidatePair.timestamp - timestampPrev));
//       bitrateDiv.innerHTML = `<strong>Current Bitrate:</strong> ${bitrate} kbits/sec`;
//       timestampPrev = activeCandidatePair.timestamp;
//       bytesPrev = bytesNow;
//       if (bitrate > bitrateMax) {
//         bitrateMax = bitrate;
//       }
//     }
//   }
// }
