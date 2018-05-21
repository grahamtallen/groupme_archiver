const express = require('express');
const app = express();
var request = require("request");
import moment from 'moment';
import jsonexport from 'jsonexport';
import fs from 'fs';


const GROUPS_BASE_URL = "https://api.groupme.com/v3/groups";
const TOKEN_PARAM = "?token=";
const MESSAGES_PARAM = "/messages"

app.get('/', (req, res) => res.send('Hello World!'));




app.get('/groups/:access_token', (req, res) => {
	const access_token = req.params.access_token;
	const destination = `${GROUPS_BASE_URL}${TOKEN_PARAM}${access_token}`
	request(destination, function(error, response, body) {
		  if (error) {
		  	console.error(error)
		  	res.status(500).send(error);
		  }
		  try {
		  	  let groups = JSON.parse(body).response;
			  groups = groups.map(({name, group_id}) => {
			  	return {name, group_id}
			  })
			  res.send(groups);
		  } catch (e) {
			  	console.error(e)
			  	res.status(500).send(e);
		  }
		  
		});
})

app.get('/messages/:group_id/:access_token', (req, res) => {
	const access_token = req.params.access_token;
	const group_id = req.params.group_id;
	const destination = `${GROUPS_BASE_URL}/${group_id}${MESSAGES_PARAM}${TOKEN_PARAM}${access_token}&limit=100`
	request(destination, function(error, response, body) {
		  if (error) {
		  	console.error(error)
		  	res.status(500).send(error);
		  }
		  try {
		  	  let messages = JSON.parse(body).response.messages;
			  messages = messages.map(message => {
			  		const {name, text, attachments, created_at} = message;
			  		return {
			  			name, 
			  			text, 
			  			attachments,
			  			created: moment.unix(created_at).format("MM/DD/YYYY")
			  		};
			  }).reverse();

			  // save json file
			  const bufferName = './data/jsonBuffer.json';
			  const csvName = `./data/messages_group_id-${group_id}.csv`;

			  fs.writeFile(bufferName, JSON.stringify(messages), 'utf8', () => {
				  var reader = fs.createReadStream(bufferName);
				  var writer = fs.createWriteStream(csvName);

				  const stream = reader.pipe(jsonexport()).pipe(writer);
				  stream.on('finish', () =>{
				  	res.download(csvName)
			      });

			  });


			  
		  } catch (e) {
			  	console.error(e)
			  	res.status(500).send(e);
		  }
		  
		});
})


app.get('/images/:group_id/:access_token', (req, res) => {
	const access_token = req.params.access_token;
	const group_id = req.params.group_id;
	const destination = `${GROUPS_BASE_URL}/${group_id}${MESSAGES_PARAM}${TOKEN_PARAM}${access_token}&limit=100`
	request(destination, function(error, response, body) {
		  if (error) {
		  	console.error(error)
		  	res.status(500).send(error);
		  }
		  try {
		  	  let messages = JSON.parse(body).response.messages;

			  messages = messages
			  				.filter(message => {
			  					 return message.attachments && !!message.attachments.find((attachment) => attachment.type === "image")
			  				  })
			  				.map(message => {
							  		const {name, text, attachments, created_at} = message;
							  		return {
							  			name, 
							  			text, 
							  			attachments,
							  			created: moment.unix(created_at).format("MM/DD/YYYY")
							  		};
							  })


			  res.send(messages);
		  } catch (e) {
			  	console.error(e)
			  	res.status(500).send(e);
		  }
		  
		});
})

app.listen(3000, () => console.log('Example app listening on port 3000!'))