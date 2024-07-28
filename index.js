// Flash Socket Policy Server
// Copyright 2014 One Fold Media
// MIT License

const { XMLParser, XMLBuilder, XMLValidator} = require("fast-xml-parser");
const { decode } = require('./util');
const net = require('net');

const options = {
    ignoreAttributes: false,
};
const parser = new XMLParser(options);
const builder = new XMLBuilder({...options, format: true });

const server = net.createServer(handler);
const port = process.env.PORT ||  9000;

server.listen(port, function () {
    console.log('Server listening at port %d', port);
});

serverUsers = {}
serverRooms = {}

function hash(str) {
    return str.toString();
}

function debug(ctx, data) {
    let jObj = parser.parse(data);
    console.log(ctx + ':')
    console.log(jObj);
    let xmlString = builder.build(jObj)
    console.log(xmlString)
    return jObj
}

const LinkCategory = (rooms) => {
  return {
    LinkCategory: {
      RoomLink: Object.entries(rooms).map(([id, {title, customData}]) => ({
	 "@_id" : id, "@_title": title, "CustomData": customData
      }))
    }
  }
};

const ParticipantList = (users) => {
  return {
    ParticipantList: {
      Participant: Object.entries(users).map(([id, { name, group }]) => ({
        '@_username': name, "@_groupId": group, "@_seatID": "MyseatID"
      }))
    }
  }
};

const sockets = [];

function broadcast(data) {
    sockets.map(socket => socket.write(data))
}


function handler (socket) {
    socket.setEncoding("utf8");
    socket.setNoDelay(true);

    socket.write(xmlPolicy() + '\0');
    sockets.push(socket)

    function policy_check(data) {
            console.log(Array.from(serverUsers).map(user => user.name))
	    let jObj = debug('received data', data)
	    if (jObj.hasOwnProperty('System.Login')) {
		    let jSystemLogin = jObj['System.Login']

		    let dataUser = jSystemLogin['Username']['#text'];
		    let encoding = jSystemLogin['Username']['@_encoding'];

		    let newTicket = hash(dataUser)

		    serverUsers[newTicket] = { name: decode(encoding,dataUser),
			                       group: "unassigned",
		                               socket: socket }

		    jSystemLogin['Ticket'] = newTicket;
		    delete jSystemLogin['Username']

		    let xmlString = builder.build({'System.Login.Accepted': jSystemLogin});

	            debug('sending response',xmlString)

		    socket.write(xmlString + '\0');

	    } else if (jObj.hasOwnProperty('Room.Enter')) {
		    let jRoomEnter = jObj['Room.Enter']
		    jRoomEnter['RoomDefinition'] = {
			"@_groupId" : idRoom,
			"@_roomCount": serverUsers.length,
			"@_seatID": "MyseatID",
			"ActivityAttributes": { "@_id" : idRoom, "@_title": "My Title", "@_description": "A room with this description" },
			"CustomData":         { "myCustomData" : "null" },
			...LinkCategory(serverRooms),
			...ParticipantList(serverUsers)
		    }

		    let xmlString = builder.build({ 'Room.Enter.Accepted': jRoomEnter });
		    socket.write(xmlString + '\0');
	            debug('sending response',xmlString)

		    // Broadcast to everyone
		    let clientID = jRoomEnter["@_clientID"]
		    let user = serverUsers[clientID]
		    let userEntered = { '@_username': user.name, "@_groupId": user.group, "@_seatID": "MyseatID" }
		    xmlString = builder.build({ 'Room.Action.Accepted': { 'Room.ParticipantEntered': userEntered } });
		    broadcast(xmlString + '\0')
	            debug('broadcasting',xmlString)

	    } else if (jObj.hasOwnProperty('System.Logout')) {
		    let ticket = jObj['System.Logout']['Ticket'];
		    delete serverUsers[ticket]
		    // Broadcast to everyone
		    let user = serverUsers[ticket]
		    let userExited = { '@_username': user.name, "@_groupId": user.group, "@_seatID": "MyseatID" }
		    xmlString = builder.build({ 'Room.Action.Accepted': { 'Room.ParticipantExited': userExited } });
		    broadcast(xmlString + '\0')
	            debug('broadcasting',xmlString)
	    } else if (jObj.hasOwnProperty('Room.Action')) {
		    let jRoomAction = jObj['Room.Action']
		    if (jRoomAction.hasOwnProperty('Chat')) {
			// Broadcast to everyone
			xmlString = builder.build({ 'Room.Action.Accepted': jRoomAction });
			broadcast(xmlString + '\0')
			debug('broadcasting',xmlString)
		    }
	    } else {
		    socket.write('\0');
	    }
    }

    socket.on('data', policy_check);

    socket.on("error", function (exception) {
        socket.end();
    });
    socket.on("timeout", function () {
        socket.end();
    });
    socket.on("close", function (had_error) {
        socket.end();
    });
}

function xmlResponse(res) {
    var response = '<?xml version="1.0"?>\n' + res;
}

function xmlPolicy() {
    var policy = '<?xml version="1.0"?>\n<!DOCTYPE cross-domain-policy SYSTEM'
    policy += ' "http://www.macromedia.com/xml/dtds/cross-domain-policy.dtd">';
    policy += '\n<cross-domain-policy>\n';
    policy += '<allow-access-from domain="*" to-ports="*"/>\n';
    policy += '</cross-domain-policy>\n';
    return policy;
}
