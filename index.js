const Twit = require('twit'),
  fs = require('fs'),
  path = require('path');
config = require(path.join(__dirname, 'config.js'));

const T = new Twit(config);
const imageToBase64 = require('image-to-base64');
const axios = require('axios');
const port = process.env.PORT || 3000;

const Discord = require('discord.js');
const { formatWithOptions } = require('util');
const { getPriority } = require('os');
const bot = new Discord.Client();

botstoken = 'NzU2MjAwNjQ0NjQ1MjI0NDU5.X2OYuw.VAnWx3tyopyyMgjPvGUJ8OLzb3M';
from = ['752572061058334741'];
fromtwo = ['752572061058334741'];
guild = ['475859353371541524'];
feed = ['752572061058334741'];

bot.login(botstoken);
bot.on('ready', (ready) => {
  console.log('I am ready to tweet your success!');
});

bot.on('message', (message) => {
  console.log(message.content);
  if (from.includes(message.channel.id) && message.attachments.size > 0) {
    tImageHandler(message);
  } else if (
    from.includes(message.channel.id) &&
    message.content.startsWith('https://twitter.com')
  ) {
    tReHandler(message);
  }
});

function tReHandler(inputMessage) {
  creator = inputMessage.author.id;
  array = inputMessage.content.split('/');
  lastItem = array[array.length - 1];
  console.log(lastItem); //to check

  T.post('statuses/retweet/:id', { id: lastItem }, function (
    err,
    data,
    response
  ) {
    if (err) {
      console.log('err', err);
    } else {
      console.log('Successfully Retweeted Image!');

      //create embed
      const retweet_embed = {
        title: 'Success Retweeted!',
        description: `Your success tweet has been successfully retweeted! <@${inputMessage.author.id}>`,
        color: 817651,
        footer: {
          icon_url:
            'https://media.discordapp.net/attachments/745733926051512474/756385907996753930/Flux_Dark_Centred_1.png',
          text: 'Flux Notify Success',
        },
        fields: [
          {
            name: 'View',
            value: '[Take a look!](https://twitter.com/Flux_Success)',
            inline: true,
          },
          {
            name: 'Undo Retweet',
            value: 'React below with :leftwards_arrow_with_hook:',
            inline: true,
          },
        ],
      };

      inputMessage.channel.send({ embed: retweet_embed }).then((sentEmbed) => {
        sentEmbed.react('↩');
        const filter = (reaction, user) => {
          return (
            ['↩'].includes(reaction.emoji.name) &&
            creator &&
            user.id != 756200644645224459
          );
        };
        const collector = sentEmbed.createReactionCollector(filter);
        collector.on('collect', (reaction, user) => {
          console.log('Deleting Tweet!');
          T.post('statuses/destroy/:id', { id: lastItem }, function (
            err,
            data,
            response
          ) {
            if (err) {
              console.log('err', err);
            } else {
              console.log('Successfully Unretweeted Tweet');
              const undoRetweet = new Discord.MessageEmbed()
                .setColor('#0099ff')
                .setTitle('Successfully Un-retweeted!')
                .setDescription(
                  `Your tweet has been successfully un-retweeted! <@${inputMessage.author.id}>`
                )
                .setFooter(
                  'Flux Notify Success',
                  'https://media.discordapp.net/attachments/745733926051512474/756385907996753930/Flux_Dark_Centred_1.png'
                );
              sentEmbed.edit(undoRetweet);
            }
          });
        });
      });

      //end
    }
  });
}
async function tImageHandler(inputMessage) {
  console.log('function started!');
  const creator = inputMessage.author.id;
  const imagePath = await imageToBase64(inputMessage.attachments.first().url);
  console.log(imagePath);

  //upload image
  T.post('media/upload', { media_data: imagePath }, function (
    err,
    data,
    response
  ) {
    if (err) {
      console.log('err', err);
    } else {
      console.log('image succesfully uploaded');

      //sent a post
      T.post(
        'statuses/update',
        {
          status: `Success from <@${inputMessage.author.id}> in @FluxNotify`,
          media_ids: new Array(data.media_id_string),
        },

        async function (err, data, response) {
          if (err) {
            console.log('error', err);
          } else {
            console.log('the image has been posted!');

            //create embed
            const embed = {
              title: 'Success Posted!',
              description: `Your success has been successfully posted! <@${inputMessage.author.id}>`,
              color: 817651,
              footer: {
                icon_url:
                  'https://media.discordapp.net/attachments/745733926051512474/756385907996753930/Flux_Dark_Centred_1.png',
                text: 'Flux Notify Success',
              },
              fields: [
                {
                  name: 'View',
                  value: `[Take a look!](https://twitter.com/Flux_Success/status/${data.id_str})`,
                  inline: true,
                },
                {
                  name: 'Delete',
                  value: 'React below with 🗑️',
                  inline: true,
                },
              ],
            };
            botsEmbed = await inputMessage.channel.send({ embed: embed });

            reactionHandler(botsEmbed, creator);

            function reactionHandler(inputEmbed, creator) {
              //define filter
              const filter = (reaction, user) => {
                return (
                  ['🗑️'].includes(reaction.emoji.name) &&
                  user.id == creator &&
                  !user.bot
                );
              };

              inputEmbed.react('🗑️');

              const collector = inputEmbed.createReactionCollector(filter);
              collector.on('collect', (reaction, user) => {
                console.log('Deleting Tweet!');
                T.post('statuses/destroy/:id', { id: data.id_str }, function (
                  err,
                  data,
                  response
                ) {
                  if (err) {
                    console.log('err', err);
                  } else {
                    console.log('Deleted Tweet');

                    const deletePost = new Discord.MessageEmbed()
                      .setColor('#0099ff')
                      .setTitle('Post Deleted!')
                      .setDescription(
                        `Your success post has been successfully deleted! <@${inputMessage.author.id}>`
                      )
                      .setFooter(
                        'Flux Notify Success',
                        'https://media.discordapp.net/attachments/745733926051512474/756385907996753930/Flux_Dark_Centred_1.png'
                      );
                    botsEmbed.edit(deletePost);
                  }
                });
                //end
              });
            }
          }
        }
      );
    }
  });
}
bot.login(botstoken);