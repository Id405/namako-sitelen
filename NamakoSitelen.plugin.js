/**
 * @name namako-sitelen
 * @author 8o7wer#4686
 * @version 0.1.0
 * @description Renders messages in Sitelen Pona
*/

//A lot of this code kinda sucks :/

module.exports = (_ => {
	const config = {
		"info": {
			"name": "namako sitelen",
			"author": "jan Lili",
			"version": "0.1.0",
			"description": "namako ni li sitelen e sitelen pona anu sitelen telo. Renders discord messages in sitelen pona or sitelen telo"
		},
		"changeLog": {
		}
	};
	return !window.BDFDB_Global || (!window.BDFDB_Global.loaded && !window.BDFDB_Global.started) ? class {
		getName () {return config.info.name;}
		getAuthor () {return config.info.author;}
		getVersion () {return config.info.version;}
		getDescription () {return config.info.description;}
		
		load() {
			if (!window.BDFDB_Global || !Array.isArray(window.BDFDB_Global.pluginQueue)) window.BDFDB_Global = Object.assign({}, window.BDFDB_Global, {pluginQueue:[]});
			if (!window.BDFDB_Global.downloadModal) {
				window.BDFDB_Global.downloadModal = true;
				BdApi.showConfirmationModal("Library Missing", `The library plugin needed for ${config.info.name} is missing. Please click "Download Now" to install it.`, {
					confirmText: "Download Now",
					cancelText: "Cancel",
					onCancel: _ => {delete window.BDFDB_Global.downloadModal;},
					onConfirm: _ => {
						delete window.BDFDB_Global.downloadModal;
						require("request").get("https://mwittrien.github.io/BetterDiscordAddons/Library/0BDFDB.plugin.js", (e, r, b) => {
							if (!e && b && b.indexOf(`* @name BDFDB`) > -1) require("fs").writeFile(require("path").join(BdApi.Plugins.folder, "0BDFDB.plugin.js"), b, _ => {});
							else BdApi.alert("Error", "Could not download BDFDB library plugin, try again some time later.");
						});
					}
				});
			}
			if (!window.BDFDB_Global.pluginQueue.includes(config.info.name)) window.BDFDB_Global.pluginQueue.push(config.info.name);
		}
		start() {this.load();}
		stop() {}
	} : (([Plugin, BDFDB]) => {
        var firedEvents = [];
		var active = "latin";
		var settings = {};
		var uInterval;

        return class NamakoSitelen extends Plugin {
            onStart() {
                let sheet = window.document.styleSheets[0];
                sheet.insertRule("@font-face {font-family: 'sitelen pona pona'; src: url('https://hydrogeno.us/fonts/sitelen-pona-pona.otf');}", sheet.cssRules.length); //Theres a much better way of doing this
                sheet.insertRule("@font-face {font-family: 'sitelen telo'; src: url('https://hydrogeno.us/fonts/sitelen-telo.otf');}", sheet.cssRules.length);

				settings = BDFDB.DataUtils.load(this, "channels");

				BDFDB.ListenerUtils.add(this, document, "keydown", e => {
					if (BDFDB.DOMUtils.getParent(BDFDB.dotCN.textareawrapchat, document.activeElement)) {
                        this.onKeyDown(document.activeElement, e.which, "onKeyDown");
                    }
				});


				// let channelArea = document.getElementsByClassName("da-sidebar")[0];
				// BDFDB.ListenerUtils.add(this, channelArea, "click", e => {
				// 	console.log(channelArea);
				// 	setTimeout(this.updateFonts(), 10000); //TODO only run when click event in channel selector
				// });

				this.updateFonts();
				uInterval = setInterval(this.updateFonts, 500);
            }

            onKeyDown(target, key, name) {
                if (!firedEvents.includes(name)) {
					firedEvents.push(name);
					if (key == 13) {
                        let chatform = BDFDB.DOMUtils.getParent(BDFDB.dotCN.chatform, target);
						if (chatform && chatform.innerText.trim().toLowerCase() == ":sitelen" || chatform.innerText.trim().toLowerCase() == ":telo" || chatform.innerText.trim().toLowerCase() == ":latin") {
                            let instance = BDFDB.ReactUtils.findOwner(chatform, {name:"ChannelTextAreaForm"}) || BDFDB.ReactUtils.findOwner(chatform, {name:"ChannelTextAreaForm", up:true});
							let cactive = "latin";
							
							if(active == chatform.innerText.trim().toLowerCase()) {
                                cactive = "latin";
                            } else if (chatform.innerText.trim().toLowerCase() == ":sitelen") {
                                cactive = "pona";
                            } else if (chatform.innerText.trim().toLowerCase() == ":telo") {
                                cactive = "telo";
                            } else {
                                cactive = "latin";
                            }
							
							let channel = BDFDB.LibraryModules.ChannelStore.getChannel(BDFDB.LibraryModules.LastChannelStore.getChannelId());
							settings[channel.id] = cactive;
							
							this.updateFonts();

							if (instance) instance.setState({textValue:"", richValue:BDFDB.LibraryModules.SlateUtils.deserialize("")});
						}
					}
					BDFDB.TimeUtils.timeout(_ => {BDFDB.ArrayUtils.remove(firedEvents, name, true)});
				}
			}
			
			updateFonts() {
				let channel = BDFDB.LibraryModules.ChannelStore.getChannel(BDFDB.LibraryModules.LastChannelStore.getChannelId());
				let cactive = "latin";

				if(channel.id in settings) {
					cactive = settings[channel.id];
				}

				let sheet = window.document.styleSheets[0];
				if(cactive != active) {
					if(cactive == "pona") { //This is a poor way of doing this, every time the script changes the stylesheet grows
						sheet.insertRule(".da-channelTextArea, .da-message, .da-topic, .da-markup { font-family: 'sitelen pona pona'; font-size: 1.5rem !important;}", sheet.cssRules.length); //TODO program this not in a terrible way
					}
					if(cactive == "telo") {
						sheet.insertRule(".da-channelTextArea, .da-message, .da-topic, .da-markup { font-family: 'sitelen telo'; font-size: inherit !important;}", sheet.cssRules.length);
					}
					if(cactive == "latin") {
						sheet.insertRule(".da-channelTextArea, .da-message, .da-topic, .da-markup { font-family: inherit; font-size: inherit !important;}", sheet.cssRules.length);
					}
				}

				active = cactive;
			}
            
            onStop() {
				BDFDB.DataUtils.save(settings, this, "channels")
				clearInterval(uInterval);
				return;
			}
        };
    })(window.BDFDB_Global.PluginUtils.buildPlugin(config));
})();