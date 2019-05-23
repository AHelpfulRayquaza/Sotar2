/**
 * Commands File
 *
 * pick: randomly chooses between two or more options
 * poke: gets a random pokemon
 * hashpoke: gets a pseudo-random pokemon using an input string
 */

'use strict';

const Path = require('path');
const Crypto = require('crypto');

const Text = Tools('text');
const Chat = Tools('chat');

const Lang_File = Path.resolve(__dirname, 'fun.translations');

module.exports = {
	choose: "pick",
	pick: function () {
		this.setLangFile(Lang_File);
		let opts = [];
		for (let i = 0; i < this.args.length; i++) {
			let opt = this.args[i].trim();
			if (opt) {
				opts.push(opt);
			}
		}
		if (opts.length < 2) return this.errorReply(this.usage({desc: 'opt1'}, {desc: 'opt2'}, {desc: '...', optional: true}));
		this.restrictReply(Chat.bold(this.mlt('pick') + ':') + ' ' + opts[Math.floor(Math.random() * opts.length)], 'random');
	},

	rpoke: 'poke',
	poke: function (App) {
		this.setLangFile(Lang_File);
		let pokedex;
		try {
			pokedex = App.data.getPokedex();
		} catch (err) {
			App.reportCrash(err);
			return this.errorReply(this.mlt('error'));
		}
		let pokes = Object.keys(pokedex);
		let chosen = pokedex[pokes[Math.floor(Math.random() * pokes.length)]].species;
		let roomData = App.bot.rooms[this.room];
		let botid = Text.toId(App.bot.getBotNick());
		if (this.can('randpoke') && roomData && roomData.users[botid] && this.parser.equalOrHigherGroup({group: roomData.users[botid]}, 'driver')) {
			this.send('!dt ' + chosen, this.room);
		} else {
			this.pmReply(Text.stripCommands(chosen));
		}
	},

	hpoke: "hashpoke",
	hashpoke: function (App) {
		this.setLangFile(Lang_File);
		let pokedex;
		try {
			pokedex = App.data.getPokedex();
		} catch (err) {
			App.reportCrash(err);
			return this.errorReply(this.mlt('error'));
		}
		let pokes = Object.keys(pokedex);
		let data = Text.toId(this.arg) || this.byIdent.id;

		if (App.config.addons && App.config.addons.hpoke && App.config.addons.hpoke[data]) {
			let custom = Text.toId(App.config.addons.hpoke[data]);
			if (pokedex[custom]) {
				return this.restrictReply(Text.stripCommands(pokedex[custom].species), 'random');
			} else {
				return this.restrictReply(Text.stripCommands(App.config.addons.hpoke[data]), 'random');
			}
		}

		let hash = Crypto.createHash('md5').update(data).digest("hex");
		let intVal = parseInt(hash, 16) % pokes.length;
		this.restrictReply(Text.stripCommands(pokedex[pokes[intVal]].species), 'random');
	},

	randformat: "randomformat",
	randomformat: function (App) {
		let formats = Object.keys(App.bot.formats);
		let chosen = formats[Math.floor(Math.random() * formats.length)];
		if (chosen) {
			this.restrictReply(Text.stripCommands(App.bot.formats[chosen].name), 'random');
		}
	},
};
