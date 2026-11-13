# The client's changes

The game client is the official `ajclient.swf` with some of its classes replaced. `swf-src/` holds the replacements: each is a decompiled class (the untouched one is under `tools/decompiled/`, by its package) changed for this server. `tools/build-client.sh` compiles them over the original with JPEXS and writes `swf/ajclient.swf`, which the server sends in place of the CDN's client. Written by `node tools/make-docs.js`.

**A change here needs `sh tools/build-client.sh`** (Java, and JPEXS in `tools/ffdec`). A class added to `swf-src/` also needs a line in that script.

For each class: the methods changed and added against the untouched original (comments and spacing aside), and the first comments in the file, which say why, mostly. Search a file for `Burrow:`, `#1009` and `#2025` (errors the original threw) for more.

### AJClient

- `swf-src/AJClient.as`, 5421 lines
- original: `tools/decompiled/AJClient.as`
- **changed:** `addedToStageHandler`, `setupGamePlay`
- **added:** `setupItemFinder`, `reportTheatreScreen`, `theatreCover`, `openTool`, `lastSeenText`, `setTheme`, `ownedSuffix`, `noteLastSeen`, `lastSeenShort`, `joinedText`, `hasGameFont`, `makePill`, `onItemDefs`, `customArtOn`, `petFormOn`, `artOf`, `customArtMode`, `customArtKey`, `customArtBitmap`, `customArtUrl`, `loadArt`, `placeEach`, `loadArtUncached`, `onStaff`, `onStaffUi`, `onTheatreVideo`, `placeTheatreButton`, `onTheatreButton`, `openTheatreControl`, `placeTheatreBox`, `buildTheatreControl`, `theatreControlButton`, `onTheatreKey`, `onTheatreControl`, `sendTheatreVideo`, `openRoomControl`, `buildRoomControl`, `roomControlButton`, `onRoomControl`, `theatreCloseButton`, `onTheatreClose`, `staffMay`, `canModerate`, `openModerate`, `showMessage`, `onStaffGoto`, `onInvisible`, `noteTyping`, `typingSent`, `onTyping`, `askYesNo`, `onYesNo`, `onWhisper`, `whisperTint`, `makeRenamable`, `onRenameHostDown`, `startRename`, `onRenameKey`, `onRenameFocusOut`, `endRename`, `onRenamed`, `pickKey`, `isPicked`, `setPicked`, `pickedItems`, `clearPicked`, `setHudShown`, `settingOf`, `smoothOn`, `performanceProfile`, `performanceProfileLabel`, `frameRate`, `cameraEases`, `onSmoothFrame`, `onSmoothTimer`, `wasdOn`, `moveKey`, `makeTextMenu`, `onTextMenuPick`, `runCommand`, `onThemeFailed`, `filterPlain`, `filterSquash`, `filterEntries`, `loadFilterLists`, `onFilterListLoaded`, `onFilterListFailed`, `onFilterState`, `onFilterAsk`, `filterHit`, `filterText`, `filterName`, `filterOrNote`, `buildChatFilter`, `filterWordsTyped`, `drawChatFilter`, `onFilterTyped`, `rulesHtml`, `loadRules`, `onRulesLoaded`, `onRulesFailed`, `buildRules`, `showRules`, `onRulesArrow`, `onRulesCloseClick`, `openRules`, `closeRules`, `showChatFilter`, `onFilterPick`, `saveChatFilter`, `onFilterSaveClick`, `onFilterCloseClick`, `finderButtonText`, `finderSearchBar`, `onFinderTyped`, `buildItemFinder`, `finderLink`, `showItemFinder`, `onFinderMouse`, `onFinderCloseClick`, `modText`, `modButton`, `paintFlatButton`, `modSetLabel`, `onFlatHover`, `modSection`, `buildModerate`, `onModerateTyped`, `showModerate`, `showModerateReason`, `hideModerate`, `onModerateCloseClick`, `onModerateButton`, `charsOfHex`, `emojiTable`, `emojiShortcodes`, `emojiToTokens`, `emojiAsNames`, `mentionStarts`, `mentionsFound`, `resolveMentions`, `onMentions`, `styleMentions`, `mentionAt`, `openProfile`, `mentionLinks`, `drawMentionBacks`, `musicLevel`, `sfxLevel`, `soundVolume`, `volumeFrom`, `loadSoundSettings`, `setSoundVolume`, `saveSoundSettings`, `applySoundSettings`, `presenceRoom`, `startEmojiButton`, `shownOnStage`, `placeEmojiButton`, `onEmojiButton`, `buildEmojiPanel`, `onEmojiHover`, `onEmojiPick`, `onEmojiStageDown`, `onItemMaker`, `makerButton`, `buildItemMaker`, `showItemMaker`, `makerMode`, `makerSay`, `makerSearch`, `onMakerFailed`, `onMakerResults`, `makerList`, `makerRows`, `makerShort`, `makerAnswer`, `makerName`, `onMakerButton`, `makerPickPicture`, `makerMaxWidth`, `makerMaxHeight`, `onMakerPictureRead`, `shrunkPng`, `crc32`, `pngChunk`, `encodePng`, `makerSendPicture`, `onFinderKey`, `onFinderKindClick`, `finderSearch`, `onFinderFailed`, `onFinderSearchDone`, `finderRowText`, `renderFinderRows`, `onFinderPrevClick`, `onFinderNextClick`, `onFinderColourClick`, `onFinderGiveClick`, `finderHexColours`, `finderPreviewColour`, `finderPreview`, `recolourFinderPreview`, `onFinderColourTyped`, `onFinderGiveDone`

> the staff's window for one player (openModerate), and what the signed-in role may do ("xsp" from the server; empty for players). Staff-only YouTube control for the theatre. The video itself is a browser overlay, called through ExternalInterface below.

### com.sbi.client.KeepAlive

- `swf-src/KeepAlive.as`, 178 lines
- original: `tools/decompiled/com/sbi/client/KeepAlive.as`
- no method changed

> how long a player may be away before the game signs them out: an hour and a quarter (the game's own was 7 minutes). the server's socket waits longer still (config.idleTimeoutMs).

### GlobalErrorCatch

- `swf-src/GlobalErrorCatch.as`, 115 lines
- original: `tools/decompiled/GlobalErrorCatch.as`
- **changed:** `globalErrorListener`
- **added:** `describeTarget`, `reportToServer`, `onReportFailed`

### XtReplyDemuxer

- `swf-src/XtReplyDemuxer.as`, 304 lines
- original: `tools/decompiled/XtReplyDemuxer.as`
- **changed:** `xtReplyHandler`

> the order a player put an animal's clothes in (avatar.AvatarUtility): it comes before that animal's list of what it wears ("il") the player's saved outfits, for the avatar editor's outfits window the player's chat filter (AJClient.filterText), on what other

### loader.MediaHelper

- `swf-src/MediaHelper.as`, 225 lines
- original: `tools/decompiled/loader/MediaHelper.as`
- **changed:** `init`, `handleMediaData`, `onBytesLoaded`, `onFrame`
- **added:** `onBytesFailed`, `refetch`, `onRefetched`

> a report to the server at each step of every media load: it was for finding a Wine decoding fault, and at 300 players it was most of the web traffic. failures are still reported.

### com.sbi.graphics.PaletteHelper

- `swf-src/PaletteHelper.as`, 303 lines
- original: `tools/decompiled/com/sbi/graphics/PaletteHelper.as`
- **changed:** `setGamePalette`, `BuildAnimalPalette`, `getHexColorsFromPalette`, `getRGBColors`
- **added:** `isCustom`, `resolve`, `handleCustomColors`

### gui.ColorTable

- `swf-src/ColorTable.as`, 498 lines
- original: `tools/decompiled/gui/ColorTable.as`
- **changed:** `init`, `destroy`, `fillColorTable`, `setCurrentColorSwatch`, `colorTableClickHandler`
- **added:** `compareSwatches`, `allPaletteIndexes`, `onCustomRegistered`, `buildHexRow`, `showHex`, `onHexKey`, `onHexKeyUp`, `onHexSetClick`, `applyHex`, `colorSlot`, `findView`, `applyRgb`, `applyCustom`

### gui.MySettings

- `swf-src/MySettings.as`, 552 lines
- original: `tools/decompiled/gui/MySettings.as`
- **changed:** `setupContent`
- **added:** `showThemeList`, `buildThemeList`, `buildSubList`, `showSavedList`, `onSavedFailed`, `onSavedList`

> a player's own items (AJClient's Item Maker) the pictures players give their items (AJClient.customArtOn) the older loading screen art, or the game's (LoadProgress.oldScreenOn)

### gui.itemWindows.ItemWindowToggle

- `swf-src/ItemWindowToggle.as`, 982 lines
- original: `tools/decompiled/gui/itemWindows/ItemWindowToggle.as`
- **changed:** `ItemWindowToggle`, `setChildrenAndInitialConditions`, `handleMouseDown`, `handleMouseMove`, `handleStopScrubbing`
- **added:** `showHouseIcon`, `showWasd`, `showChoice`, `setChoice`, `showGraphics`, `showPerformance`, `nextPerformance`, `showFrameRate`, `nextFrameRate`, `showCamera`, `setWasd`, `blockedAreHidden`, `showHideBlocked`, `setHideBlocked`, `showCustomArt`, `showLoadScreen`, `setCustomArt`

> music or sound effects (AJClient's sound settings) the settings artwork has no house among its icons, so the rows for den layouts borrow the picture of the den button on the game's bar. if that cannot be drawn, the row keeps the icon it has.

### gui.itemWindows.ItemWindowAdventure

- `swf-src/ItemWindowAdventure.as`, 195 lines
- original: `tools/decompiled/gui/itemWindows/ItemWindowAdventure.as`
- **changed:** `setChildrenAndInitialConditions`, `performContinueChecks`
- **added:** `playable`

> this server: see playable() below this server: whether the adventure may be picked. the game hides the row's "tag" when it may not; the banners of the event adventures (Bitter Sweets 46, Twists and Turns 62) have no tag at all, and

### gui.ReportAPlayer

- `swf-src/ReportAPlayer.as`, 449 lines
- original: `tools/decompiled/gui/ReportAPlayer.as`
- **changed:** `init`, `destroy`, `onReportBtnHandler`
- **added:** `addDetailBox`, `onDetailTyped`

### gui.ECardCreation

- `swf-src/ECardCreation.as`, 1481 lines
- original: `tools/decompiled/gui/ECardCreation.as`
- **changed:** `onLoadInTweenComplete`, `onChatTreeLoaded`, `onECardImageLoaded`, `msgTextDownHandler`, `onTextChanged`, `keyDownListener`, `sendMailBtnHandler`, `onECardTextClose`, `addListeners`, `removeListeners`

> Burrow: no secret valentines, so no popup asking which to send

### gui.GuiManager

- `swf-src/GuiManager.as`, 3759 lines
- original: `tools/decompiled/gui/GuiManager.as`
- **changed:** `setupSharedObject`, `displayRulesPopup`, `openAvatarCreator`, `showHudAvt`, `onHudViewChanged`, `activateDenHud`, `onEmoteClick`, `setRoomNameDisplay`
- **added:** `isPlayingAsPet`, `setPersonalPetMode`

> music and sound effects apart (AJClient's sound settings) the game's rules popup is this server's rules (AJClient.openRules) the last one may have been destroyed already by the way it was closed, which left this pointing at it (#1009 in its destroy)

### gui.ActionManager

- `swf-src/ActionManager.as`, 718 lines
- original: `tools/decompiled/gui/ActionManager.as`
- **changed:** `ActionManager`, `turnOnOceanActions`, `reload`, `addAllActions`, `getActionString`, `matchActionString`, `openActions`, `actionClickHandler`
- **added:** `ownSet`, `playerHasSet`, `showSet`, `addSwapButton`, `stopPress`, `onSwapBtn`, `roomIsOcean`, `playerHasBothSets`, `updateSwapButton`, `nameFor`, `addSitDirectionButtons`, `addDirectionButton`, `actionPill`, `sitDirectionClickHandler`, `actionHitTarget`, `selectAction`, `mirrorClickHandler`, `rememberAction`

> the actions window. an animal has the art for its own set of actions only (a land animal's sitting, sleeping, hopping; an ocean animal's diving, swirling, posing), so it is shown its own set in any room: a land animal underwater still sits and hops. an animal of land and ocean

### gui.PlayerSearch

- `swf-src/PlayerSearch.as`, 212 lines
- original: `tools/decompiled/gui/PlayerSearch.as`
- **changed:** `setInitialConditions`, `performSearch`

### avatar.NPCView

- `swf-src/NPCView.as`, 937 lines
- original: `tools/decompiled/avatar/NPCView.as`
- **changed:** `init`, `getNpcMC`

### gui.ChatHistory

- `swf-src/ChatHistory.as`, 1016 lines
- original: `tools/decompiled/gui/ChatHistory.as`
- **changed:** `resetChatPrivs`, `addMessage`, `addPrivateMessage`, `clearChat`, `enableFreeChat`, `resetTreeSearch`, `setFocusOnMsgText`, `toggleInGameHud`, `setupInitialItems`, `onChatLink`, `onTextFieldChanged`, `keyDownListener`
- **added:** `plain`, `withMentions`, `addLine`, `showLines`, `drawMentionBacks`, `showEmojiInInput`

> what players typed is text, never markup: the chat window is an HTML text field, and a line with a tag in it would be drawn as one (an <img> fetched from wherever it names, by everyone who saw the line). a line's words as plain() makes them, with each tag (`param2`,

### gui.PredictiveTextManager

- `swf-src/PredictiveTextManager.as`, 1008 lines
- original: `tools/decompiled/gui/PredictiveTextManager.as`
- **changed:** `init`, `isAllowedFreeChat`, `onTextFieldChanged`, `onKeyDown`

> free typing in the chat bar (0) and on Jammer Walls (2), whose posts go through each reader's own filter (playerWall.PostMessage). shift, ctrl, alt, caps lock and the windows keys type nothing (shift is held to pick den items), so they make no sound

### avatar.UserCommXtCommManager

- `swf-src/UserCommXtCommManager.as`, 943 lines
- original: `tools/decompiled/avatar/UserCommXtCommManager.as`
- **changed:** `sendAvatarAction`, `sendChatMessage`, `adjustSpecialWords`, `adjustCamelCase`, `fixMispellings`, `onSendMessage`, `userCommChatResponse`, `userCommAdminMessageResponse`
- **added:** `sendPetPlayerMode`, `pageAnnouncement`

> m0/m1 is deliberately a new marker: old clients sent the animation number here. New clients use it to mirror every action consistently on every screen. "!outfit" on its own opens the avatar editor's outfits window here

### buddy.BuddyCard

- `swf-src/BuddyCard.as`, 4039 lines
- original: `tools/decompiled/buddy/BuddyCard.as`
- **changed:** `destroy`, `onBuddyCardLoaded`, `setupCardWithAvatar`, `clearPetAndAvatarViews`, `mediaHelperCallback`, `sideMenuHandler`, `get currBuddyCardUserName`, `reportDownHandler`, `reportDownOverHandler`, `onCharBoxOver`
- **added:** `onBanInfo`, `removeBanLabel`, `showBanLabel`, `onBanIconLoaded`, `onBanIconFailed`, `showJoinLabel`, `memberNameField`, `restoreNameFields`, `removeBadges`, `showBadges`, `addBadgeIcon`, `onBadgeIconLoaded`, `onBadgeFrame`, `layoutBadges`, `showBadgeTip`, `onBadgeOver`, `onBadgeOut`, `onBadgeDown`, `onDiscordClick`, `onBioTabLoaded`, `onBioIconLoaded`, `removeBioTab`, `showBio`, `bioTabHandler`, `closeBioTab`, `bioTabComplete`, `bioTabOverHandler`

> first, so that nothing below that throws can leave it set a card destroyed twice, or before it was shown (#2007) the server's answer to "xbn": [.., .., username, seconds of ban left | -1 permanent | 0 not banned].

### gui.itemWindows.ItemWindowPets

- `swf-src/ItemWindowPets.as`, 273 lines
- original: `tools/decompiled/gui/itemWindows/ItemWindowPets.as`
- **changed:** `onPetLoaded`

### gui.itemWindows.ItemWindowAvtPetSml

- `swf-src/ItemWindowAvtPetSml.as`, 176 lines
- original: `tools/decompiled/gui/itemWindows/ItemWindowAvtPetSml.as`
- **changed:** `onPetViewLoaded`

### gui.itemWindows.ItemWindowBuddyList

- `swf-src/ItemWindowBuddyList.as`, 207 lines
- original: `tools/decompiled/gui/itemWindows/ItemWindowBuddyList.as`
- **changed:** `setChildrenAndInitialConditions`

### shop.Shop

- `swf-src/Shop.as`, 3047 lines
- original: `tools/decompiled/shop/Shop.as`
- **changed:** `destroy`, `setupShopWindows`

> a shop replaced before its artwork came has none to unhook (#1009)

### shop.ShopManager

- `swf-src/ShopManager.as`, 337 lines
- original: `tools/decompiled/shop/ShopManager.as`
- **changed:** `get maxItems`, `get maxDenItems`

> 5,000 of each here, as this server counts (lib/items.js, lib/dens.js).

### avatar.Avatar

- `swf-src/Avatar.as`, 489 lines
- original: `tools/decompiled/avatar/Avatar.as`
- **changed:** `accStateShowAccessory`

> up to three pieces of clothing may be worn in one place (head, neck, back, legs, tail) where the game allowed one: something comes off only to make room for a fourth. eyes and patterns are one at a time as ever.

### gui.ChatBalloon

- `swf-src/ChatBalloon.as`, 822 lines
- original: `tools/decompiled/gui/ChatBalloon.as`
- **changed:** `setText`, `setCustomAdventureMessage`, `setEmote`
- **added:** `inlineEmotes`, `emoteCodeAt`, `emojiLength`, `codePointAt`, `emojiName`, `emojiClip`, `emojiClipNamed`, `placeInline`, `clearInline`, `clearMentionBacks`, `onMentionLink`

> emotes drawn inside a line of chat, small, where they were typed: an emote's code standing as a word of its own ("hi :) there", ":fever:"), or anywhere after a "\" ("yay\:)"). and emoji (typed with Windows' emoji panel, say), which the game's font has none of: each is drawn

### room.RoomManagerView

- `swf-src/RoomManagerView.as`, 1240 lines
- original: `tools/decompiled/room/RoomManagerView.as`
- **changed:** `destroy`, `onKeyDownEvt`, `removeAndClearMiniMap`, `onKeyUpEvt`, `onMouseDownEvt`, `onMouseRightEvt`
- **added:** `disposeMiniMap`

> with W, A, S and D walking, Enter starts a chat message. The minimap grid and trail are BitmapData made for this room.  Flash may keep their native allocations after the display clips are dropped, particularly after visiting many rooms, so release only those buffers

### gui.itemWindows.ItemWindowOriginal

- `swf-src/ItemWindowOriginal.as`, 691 lines
- original: `tools/decompiled/gui/itemWindows/ItemWindowOriginal.as`
- **changed:** `setStates`
- **added:** `refreshPicked`

> draws the ring again after the list of picked items changed. picked in the item picker or for recycling (AJClient's list): the ring is green however the cell came into view.

### gui.itemWindows.ItemWindowAnimal

- `swf-src/ItemWindowAnimal.as`, 557 lines
- original: `tools/decompiled/gui/itemWindows/ItemWindowAnimal.as`
- **changed:** `onViewLoaded`
- **added:** `onRenamed`

> A double click on the name lets the player type another.

### gui.DenAndClothesItemSelect

- `swf-src/DenAndClothesItemSelect.as`, 1861 lines
- original: `tools/decompiled/gui/DenAndClothesItemSelect.as`
- **changed:** `init`, `destroy`, `winMouseOver`, `winMouseOut`, `winMouseDown`, `onClose`, `onSortByBtn`, `convertIntToListClothing`
- **added:** `keepPicked`, `pickClick`, `addPicked`, `showSortMenu`, `clothingSortType`, `onSortWord`, `sortByName`, `sortByType`

> while the picker hands over several picked items one by one, true for all but the last: whoever takes them must not close it yet. the pointer passing over a picked item does not take its ring off. for the trade list and for a trade: a click picks or

### gui.RecycleItems

- `swf-src/RecycleItems.as`, 835 lines
- original: `tools/decompiled/gui/RecycleItems.as`
- **changed:** `onPopupLoaded`, `onRecycleListCallback`, `onItemWindowDown`
- **added:** `pickRun`

> with Shift held: everything from the item clicked before

### gui.AvatarEditor

- `swf-src/AvatarEditor.as`, 4047 lines
- original: `tools/decompiled/gui/AvatarEditor.as`
- **changed:** `init`, `destroy`, `onMediaItemLoaded`, `setInitAssetVisibility`, `positionAndDrawAvatarView`, `sendChangesRequest`, `openColorTablePatternEyesTab`, `createPatternsAndEyesArrays`, `createItemWindows`, `onTradeItemSelectClose`, `sortByHandler`, `onSearchTextInput`
- **added:** `copyLayerOrder`, `setupLayers`, `sidePanelRect`, `drawOutfitsIcon`, `onOutfitsBtnOver`, `onOutfitsBtn`, `openOutfitsWindow`, `wearOutfit`, `drawLayersIcon`, `onLayersBtnOver`, `onLayersBtn`, `onLayerOrderChanged`, `sendLayerOrder`, `orderedClothing`, `destroyLayers`, `showSortMenu`, `onSortWord`, `sortByName`, `sortByType`, `isOutfitCode`, `outfitRequest`, `askOutfitImport`, `itemsText`, `onOutfitChecked`, `onOutfitConfirm`, `onOutfitImported`, `onOutfitWait`, `onOutfitFailed`

> the layers panel (gui.AvatarLayersPanel, this server): the button on the animal's box that opens it, the panel (over the colour tables), and the order it gives the clothes (AvatarUtility.resolveLayerOrder, null: the game's own), saved on closing when it changed

### gui.PetInventory

- `swf-src/PetInventory.as`, 947 lines
- original: `tools/decompiled/gui/PetInventory.as`
- **changed:** `onMediaItemLoaded`, `winMouseDown`, `reloadPets`, `addEventListeners`, `removeEventListeners`
- **added:** `showMasteryIcon`, `addPetFormSwitch`, `onPetFormSwitch`, `onPetFormSwitchOver`, `onPetFormSwitchOut`, `onPetRenamed`

> "play as your pet": the settings menu's on/off switch, in any room but a Play-As-Your-Pet party's (AJClient.petFormOn) the mastery badge has a frame per pet that had a mastery item; this server lets any pet reach 100, and a missing frame threw (#2109) and

### pet.WorldPet

- `swf-src/WorldPet.as`, 422 lines
- original: `tools/decompiled/pet/WorldPet.as`
- **changed:** `WorldPet`, `heartbeat`, `onPetLoaded`

### gui.DenEditor

- `swf-src/DenEditor.as`, 2648 lines
- original: `tools/decompiled/gui/DenEditor.as`
- **changed:** `init`, `destroy`, `showDenEditor`, `setupPlayerItems`, `setupTabsVisibilityAndPosition`, `resetWindowsAndTabsToNormal`, `drawItemWindows`, `scrollBtnHandler`, `toggleBottomHudVisibility`, `toggleEditorHud`, `setupTabs`, `tabBtnHandler`, `onSearchTextInput`
- **added:** `placePrefabTab`, `isContentItem`, `splitContentItems`, `makeContentTabs`, `shopTabIcon`, `onContentTab`, `showContentTab`, `leaveContentTab`, `onContentTabOver`, `makeShopContentBtn`, `showShopContentBtn`, `onShopContentBtn`, `onShopContentBtnOver`, `onShopContentBtnOut`, `onContentBought`, `onPrefabTab`, `onPrefabTabOver`, `hudTop`, `markPlaced`, `placePrefabItems`, `onPrefabReply`

> this server's additions: the layers panel (with its pick bar) and the content shop (gui.DenContentShop): its button at the top right, and the Custom tab (to the right of the prefab tab) with the player's content shop items, which the other tabs leave out

### gui.TradeManager

- `swf-src/TradeManager.as`, 2416 lines
- original: `tools/decompiled/gui/TradeManager.as`
- **changed:** `onTradeItemsResponse`, `addTradeItem`, `winMouseDown`

> The desktop client keeps extCallsActive set while its host is available.  It is not an indication that this player has a modal dialog open; treating it as one made every incoming trade request look like a busy response.

### avatar.AvatarView

- `swf-src/AvatarView.as`, 412 lines
- original: `tools/decompiled/avatar/AvatarView.as`
- **changed:** `setLayerHelper`, `playAnim`
- **added:** `setLayerOrder`, `get currentLayers`, `refreshLayers`, `ordered`

> the order its clothes are painted in (AvatarUtility.orderLayers): its player's (AvatarUtility.layerOrderOf), unless one is set here, as the avatar editor does for the animal it shows (null: the game's) the layers it was last given, as LayerAnim has them (for the avatar

### avatar.MannequinData

- `swf-src/MannequinData.as`, 958 lines
- original: `tools/decompiled/avatar/MannequinData.as`
- **changed:** `init`, `clone`, `hasThisInvIdOnAndRemove`, `setupMannequinAvatarView`, `updateLayer`, `removeItems`, `compare`, `copyFromOther`, `setupDataInvIdsOnly`, `setupDataFull`, `recreateAvatarForView`, `generateBodModsAndClothingList`, `setupMannequinInventory`
- **added:** `get layerOrder`, `setPieces`, `readPieces`, `get headField`, `hasPiece`, `pieceIndex`, `copyPieces`, `placeOf`, `layerOfDef`, `syncSlots`, `piecesFromSlots`, `samePieces`, `keysOf`

> everything it wears, as an animal may (three to a layer, not one to each of the five places the game had): {i: inventory id, d: def, c: colour}, the bottom first when `ordered`. the five *InvId/ *DefId/*Color above are kept to the first piece in each place, for

### avatar.AvatarWorldView

- `swf-src/AvatarWorldView.as`, 4118 lines
- original: `tools/decompiled/avatar/AvatarWorldView.as`
- **changed:** `initWorldView`, `destroy`, `setMessage`, `setAction`, `heartbeat`, `setActivePet`, `toggleNamebarSelNub`, `updatePos`, `updateOffScreenPositions`, `updateHudViewPosition`, `updateNameBarName`, `avatarChanged`
- **added:** `setTyping`, `hideTyping`, `placeTyping`, `onTypingTimer`, `setActionMirrored`, `glide`, `setPetPlayerMode`, `showPetForm`, `isPetForm`, `setPetFormName`, `placeChatBalloon`, `emoteBgOffset`, `newJumpLandFX`

> name tag badges everyone sees, buddy or not, as the game shows its News Crew camera (NameBar.isVIPBadge): the Owner, Moderator, Developer and Verified badges of lib/badges.js, by their def ids. the actions' animations, `land` and `water`. an animal has the art of

### localization.LocalizationManager

- `swf-src/LocalizationManager.as`, 1001 lines
- original: `tools/decompiled/localization/LocalizationManager.as`
- **changed:** `translateAvatarName`, `translatePetName`

> a name its owner typed (world.js xrn), not the game's word ids: through the player's chat filter (AJClient.filterName) a name its owner typed (world.js xrn), not the game's word ids: through the player's chat filter (AJClient.filterName)

### room.RoomManagerWorld

- `swf-src/RoomManagerWorld.as`, 3320 lines
- original: `tools/decompiled/room/RoomManagerWorld.as`
- **changed:** `heartbeat`, `clickVolumeTest`, `chosenLoginFinished`
- **added:** `glideCamera`, `easeCamera`, `inputNow`

> whether the worlds' names were asked for (chosenLoginFinished) the camera between two frames, `param1` milliseconds after it was last moved. as the frame has it, it only ever closes the gap to the player's animal, so more calls cannot carry it too far. returns

### gskinner.motion.GTween

- `swf-src/GTween.as`, 605 lines
- original: `tools/decompiled/gskinner/motion/GTween.as`
- no method changed
- **added:** `tickNow`

> smooth graphics (AJClient.onSmoothTimer): the tweens that go by the clock moved on between two frames as well, which is all a frame does for them. those counted in frames wait for a frame. returns whether there was one to move.

### playerWall.PostMessage

- `swf-src/PostMessage.as`, 238 lines
- original: `tools/decompiled/playerWall/PostMessage.as`
- **changed:** `PostMessage`

> through the reader's chat filter (AJClient.filterText).

### gui.itemWindows.ItemWindowPost

- `swf-src/ItemWindowPost.as`, 427 lines
- original: `tools/decompiled/gui/itemWindows/ItemWindowPost.as`
- **changed:** `updateWithInput`, `destroy`, `loadCurrItem`, `onPostDown`
- **added:** `showMentions`

> the field the message is drawn in, and its tags once the server has said which "@"s are players' (AJClient.resolveMentions) tags: light blue and underlined; a click on one opens that player's card (onPostDown), anywhere else the writer's.

### shop.BundleShop

- `swf-src/BundleShop.as`, 205 lines
- original: `tools/decompiled/shop/BundleShop.as`
- **changed:** `destroy`

> an empty shelf (this server keeps the bundle podium empty) closes the shop before it was ever shown

### gui.GenericListGuiManager

- `swf-src/GenericListGuiManager.as`, 232 lines
- original: `tools/decompiled/gui/GenericListGuiManager.as`
- **changed:** `launchMovies`

> the video lists came from the official server; this one answers them empty, and a player with nothing to play threw (#1009 in VideoPlayerOSMF.playNonStreaming)

### gui.DenSwitcher

- `swf-src/DenSwitcher.as`, 703 lines
- original: `tools/decompiled/gui/DenSwitcher.as`
- **changed:** `purchasedDenRoomCallback`

> bought from a land's den shop the switcher is only ever hidden, and closing the shop may have closed it (#1009 below); and a den whose def this client lacks has no item. the den is bought either way.

### gui.PetCreator

- `swf-src/PetCreator.as`, 1683 lines
- original: `tools/decompiled/gui/PetCreator.as`
- **changed:** `destroy`, `onPetLoadedOnStage`

> destroyed before its artwork loaded (the pet finder opened twice in a row) it has no listeners to take off (#1009) a pet that finished loading after the window was closed

### gui.NGFactManager

- `swf-src/NGFactManager.as`, 1415 lines
- original: `tools/decompiled/gui/NGFactManager.as`
- **changed:** `onGenericFactListLoaded`, `factPopupMediaCallback`

> the fact lists came from the official server; one this server has no entry for opens nothing (#1009) the popup went (or never had the place) before its picture came (#1010)

### game.distanceChallenge.DistanceChallenge

- `swf-src/DistanceChallenge.as`, 1000 lines
- original: `tools/decompiled/game/distanceChallenge/DistanceChallenge.as`
- **changed:** `addSnowmanHead`

> the winter snowman is not in every season's scene (#1009)

### buddy.BuddyList

- `swf-src/BuddyList.as`, 620 lines
- original: `tools/decompiled/buddy/BuddyList.as`
- **changed:** `onBuddyListChange`

> not always still in the block when the list changes (#2025)

### Party.PartyPopup

- `swf-src/PartyPopup.as`, 998 lines
- original: `tools/decompiled/Party/PartyPopup.as`
- **changed:** `onCustomPartiesLoaded`

> the party list closed before the hosted parties came (#1009)

### gui.ECardInbox

- `swf-src/ECardInbox.as`, 1655 lines
- original: `tools/decompiled/gui/ECardInbox.as`
- **changed:** `displayGiftPopup`, `denIconReceived`, `setupGiftPopup`, `onUserLookUpReceived`
- **added:** `giftItemDefId`, `giftItemName`

> a custom item's own picture, when it has one (AJClient.customArtUrl) A card records the historical layer id. Prefer the attached item's current accId when it is available, so items with shared or changed layers draw correctly.

### game.SoundManager

- `swf-src/SoundManager.as`, 448 lines
- original: `tools/decompiled/game/SoundManager.as`
- **changed:** `play`, `playByName`, `doFadeIn`, `doFadeOut`, `playStream`

> times the sound effects setting (AJClient.sfxLevel) through SBMusic's volume, which takes the music setting the stream went before its fade ended (#1009) the stream's volume through SBMusic, which takes the music setting

### com.sbi.corelib.audio.SBMusic

- `swf-src/SBMusic.as`, 252 lines
- original: `tools/decompiled/com/sbi/corelib/audio/SBMusic.as`
- **changed:** `SBMusic`, `get volume`, `setTransformVolume`
- **added:** `refreshAll`

> every piece of music, for the music setting (AJClient.musicLevel): each plays at the volume the game gives it times that setting, and again so when the setting changes (refreshAll). the game's own volume for it, before the music setting

### com.sbi.corelib.audio.SBSound

- `swf-src/SBSound.as`, 185 lines
- original: `tools/decompiled/com/sbi/corelib/audio/SBSound.as`
- **changed:** `SBSound`, `get volume`, `setTransformVolume`
- **added:** `refreshAll`

> every sound effect, for the sound effects setting (AJClient.sfxLevel): each plays at the volume the game gives it times that setting, and again so when the setting changes (refreshAll). the game's own volume for it, before the sound effects setting

### com.sbi.graphics.LayerAnim

- `swf-src/LayerAnim.as`, 875 lines
- original: `tools/decompiled/com/sbi/graphics/LayerAnim.as`
- **changed:** `set layers`, `requestAnim`, `buildRequestArray`, `onReceiveData`
- **added:** `rankOf`

> variables holding functions (the game sets them through isOnscreen and hasSequence), which the decompiler shows as functions: compiled as functions they cannot be assigned (#1037 at startup) each requested image's place in _layers: items worn in the same

### com.sbi.graphics.LayerBitmap

- `swf-src/LayerBitmap.as`, 1006 lines
- original: `tools/decompiled/com/sbi/graphics/LayerBitmap.as`
- **changed:** `trimLayerGroups`, `setLayer`, `paint`
- **added:** `artArrived`, `slotFor`, `keyFor`, `paintLayer`

> an animal whose player put its clothes in an order of their own (the avatar editor's layers panel, AvatarUtility.orderLayers): each worn piece has a place ORDER_BASE + its rank, bottom first, painted after every body slot (paint). an animal without one is painted by slot,

### ecard.ECard

- `swf-src/ECard.as`, 603 lines
- original: `tools/decompiled/ecard/ECard.as`
- **changed:** `get modifiedMsg`

> the game swapped any message with a word outside its approved list for "Animal Jam rocks!" (28985) when showing it; typing is free here (gui.ECardCreation), so the words are shown as sent

### game.ArtStudioKit

- `swf-src/ArtStudioKit.as`, 1656 lines

> from Strawberry Jam (another AJ Classic client): the look its art studio rework shares (wood panels, buttons, sliders, tooltips). used with its author's permission, unchanged. Mod-added (not vanilla). Shared look for the controls the mod adds to the

### game.artStudioPainting.ArtStudioPainting

- `swf-src/ArtStudioPainting.as`, 4625 lines
- original: `tools/decompiled/game/artStudioPainting/ArtStudioPainting.as`
- **changed:** `end`, `init`, `startDraw`, `endDraw`, `moveMouse`, `doSmudge`, `sceneLoaded`, `drawCanvasMouseOver`, `drawCanvasMouseOut`, `message`, `handleMasterpieceTokenReply`, `heartbeat`, `onPrintButton`, `onClearAllButton`, `setNumMasterpieceIcons`, `setupCurrIconAndBitmap`, `onPreviewIcon`, `onPreviewClose`, `onSubmissionRulesClose`, `onPreviewItemBuy`, `onPreviewBuyInventoryResponse`, `encodeImage`, `asyncEncodingComplete`, `handleClear`, `setupRequest`, `createPostData`, `onSendComplete`, `displayMasterpieceFailedPopup`, `onSendError`, `onSaveButton`, `handleLoad`
- **added:** `px`, `getCompositeColor`, `getCompositePixel`, `getBlurMask`, `stampPenCircleAt`, `onMergeLayerDown`, `onMoveLayerUp`, `onMoveLayerDown`, `onExportClick`, `onZoomInClick`, `onZoomOutClick`, `onZoomResetClick`, `startPan`, `updatePan`, `endPan`, `onKeyDown`, `onMouseWheel`, `zoomIn`, `zoomOut`, `resetZoom`, `setZoom`, `updateZoomUI`, `getAirbrush`, `getSmudge`, `onToggleLayerClick`, `onUploadCancel`, `onUploadSelect`, `onUploadFileLoaded`, `onUploadLoaderComplete`, `onImagePlaced`, `scaleAndCropToFill`, `getCompositeBitmapData`, `onUndoClick`, `onRedoClick`, `updateUndoRedoUI`, `updateLayerVisuals`, `startSubmitWatchdog`, `stopSubmitWatchdog`, `onSubmitTimeout`, `onImportClick`, `buildModUI`, `syncNativeControls`, `buildToolPanel`, `addToolButton`, `onModToolClick`, `selectModTool`, `updateToolButtons`, `pickColorAt`, `buildUndoButtons`, `buildBrushPanel`, `formatPx`, `formatPercent`, `onSizeSlider`, `setBrushSize`, `onOpacitySlider`, `onSoftSlider`, `buildLayerPanel`, `addLayerButton`, `refreshLayerPanel`, `refreshLayerThumb`, `onLayerChipClick`, `swapLayers`, `onLayerOpacitySlider`, `flashTip`, `allLayerIndices`, `captureState`, `applyState`, `disposeState`, `pushUndo`, `clearRedo`, `syncCanvasButtons`, `clampPan`, `isHandActive`, `updateCanvasCursor`, `onKeyUp`, `onMenuButton`, `isMenuChecked`, `isMenuDisabled`, `onMenuPick`, `startAdjust`, `onAdjustChange`, `onAdjustClose`, `adjustFilters`, `hueMatrix`, `saturationMatrix`, `applyInstant`, `isLayerEmpty`, `canDuplicateLayer`, `duplicateLayer`, `copyLayer`, `mergeVisibleLayers`, `applyAlphaLock`, `toggleFlipView`, `canvasLeft`, `updateSizeRing`, `drawGradientPreview`, `commitGradient`, `smoothStep`, `askCopyCount`, `onCopyCountChosen`, `capCopiesToFunds`, `buyCurrentCopy`, `nextCopy`, `finishCopies`, `stopCopies`, `showCopyBanner`, `autoHideCopyBanner`, `hideCopyBanner`

> from Strawberry Jam (another AJ Classic client), its art studio rework, used with its author's permission; Burrow's changes: buying several copies at once (their QuantityInputPopup) is left out, so Buy is the game's one-copy flow. Zooms around an anchor point in canvas-frame coordinates (the pointer

### game.artStudioGridDrawing.ArtStudioGridDrawing

- `swf-src/ArtStudioGridDrawing.as`, 2463 lines
- original: `tools/decompiled/game/artStudioGridDrawing/ArtStudioGridDrawing.as`
- **changed:** `end`, `init`, `startDraw`, `endDraw`, `moveMouse`, `sceneLoaded`, `drawCanvasMouseOver`, `drawCanvasMouseOut`, `message`, `handleMasterpieceTokenReply`, `heartbeat`, `setNumMasterpieceIcons`, `onPreviewClose`, `onSubmissionRulesClose`, `onPreviewItemBuy`, `onPreviewBuyInventoryResponse`, `asyncEncodingComplete`, `handleClear`, `setupRequest`, `createPostData`, `onSendComplete`, `displayMasterpieceFailedPopup`, `onSendError`, `handleLoad`
- **added:** `paintLine`, `paintCell`, `startSubmitWatchdog`, `stopSubmitWatchdog`, `onSubmitTimeout`, `buildModUI`, `buildToolPanel`, `addToolButton`, `onModToolClick`, `selectModTool`, `updateToolButtons`, `syncNativeTool`, `pickColorAt`, `drawCellCursor`, `outlineCell`, `onGridClick`, `onMirrorClick`, `onKeyDown`, `buildUndoButtons`, `pushUndo`, `clearRedo`, `onUndoClick`, `onRedoClick`, `updateUndoRedoUI`, `markDrawn`, `syncCanvasButtons`, `onImportClick`, `onImportSelect`, `onImportFileLoaded`, `onImportDecoded`, `onImagePlaced`, `onExportClick`, `askCopyCount`, `onCopyCountChosen`, `capCopiesToFunds`, `buyCurrentCopy`, `nextCopy`, `finishCopies`, `stopCopies`, `showCopyBanner`, `autoHideCopyBanner`, `hideCopyBanner`

> from Strawberry Jam (another AJ Classic client), its art studio rework, used with its author's permission; Burrow's changes: buying several copies at once (their QuantityInputPopup) is left out, so Buy is the game's one-copy flow. Fills every cell between two cells (Bresenham), so a quick stroke

### item.ItemXtCommManager

- `swf-src/ItemXtCommManager.as`, 1408 lines
- original: `tools/decompiled/item/ItemXtCommManager.as`
- **changed:** `itemsChangedListResponse`, `itemsInUseResponse`, `itemListResponse`, `itemBuyResponse`, `itemDefResponse`, `relocalizeItems`, `currencyExchangeDefResponse`, `relocalizeCurrencyExchanges`, `shopListResponse`
- **added:** `addItemDef`, `addItemDefs`

> Burrow: def rows sent while the game runs ("xdi", XtReplyDemuxer), for items the staff make (the server's lib/customitems.js); each with its name, which the localization the game loaded does not have. before the item pack is in, there is nothing to do: the pack has them.

### den.DenXtCommManager

- `swf-src/DenXtCommManager.as`, 1724 lines
- original: `tools/decompiled/den/DenXtCommManager.as`
- **changed:** `requestDenStateChange`, `handleXtReply`, `denItemsResponse`, `denRoomCount`, `denRoomResponse`, `relocalizeDenRooms`, `denStateResponse`, `denPhantomResponse`, `denItemDefsResponse`, `relocalizeDenItems`, `enviroItems`
- **added:** `prefabText`, `requestContentCatalog`, `requestContentItems`, `requestContentBuy`, `requestPrefabList`, `requestPrefab`, `requestPrefabSave`, `requestPrefabRename`, `requestPrefabDelete`, `requestPrefabShare`, `requestPrefabImport`, `requestPrefabGive`, `requestPrefabDuplicate`, `requestLayoutExport`, `requestLayoutShare`, `requestLayoutCode`, `requestLayoutFile`, `requestLayoutApply`, `requestItemsGive`, `requestItemColour`, `addDenItemDefs`, `addDenItemDef`

> the head carries every piece it wears (MannequinData.headField) den prefabs and colours (this server): the answers go to prefabCallback (the whole message), see gui.DenPrefabs the content shop (this server: lib/contentshop.js): the answers go

### gui.ActionManager

- `swf-src/ActionManager.as`, 718 lines
- original: `tools/decompiled/gui/ActionManager.as`
- **changed:** `ActionManager`, `turnOnOceanActions`, `reload`, `addAllActions`, `getActionString`, `matchActionString`, `openActions`, `actionClickHandler`
- **added:** `ownSet`, `playerHasSet`, `showSet`, `addSwapButton`, `stopPress`, `onSwapBtn`, `roomIsOcean`, `playerHasBothSets`, `updateSwapButton`, `nameFor`, `addSitDirectionButtons`, `addDirectionButton`, `actionPill`, `sitDirectionClickHandler`, `actionHitTarget`, `selectAction`, `mirrorClickHandler`, `rememberAction`

> the actions window. an animal has the art for its own set of actions only (a land animal's sitting, sleeping, hopping; an ocean animal's diving, swirling, posing), so it is shown its own set in any room: a land animal underwater still sits and hops. an animal of land and ocean

### gui.SitForwardAction

- `swf-src/SitForwardAction.as`, 17 lines

> not in the game: the action sprite of sitting facing forward (":sitS:", gui.ActionManager). the game's other actions are sprites of the HUD's art, found by their class name; this one has no art of its own, and only its class name is ever read.

### avatar.AvatarUtility

- `swf-src/AvatarUtility.as`, 2338 lines
- original: `tools/decompiled/avatar/AvatarUtility.as`
- **changed:** `layerArrayForItemsAndColors`
- **added:** `layerEntry`, `orderKey`, `layerOrderOf`, `setLayerOrder`, `onLayerOrder`, `sendLayerOrder`, `resolveLayerOrder`, `orderLayers`

> "d": the item, for a custom one's own picture (LayerAnim, LayerBitmap) ---- the player's own order of an animal's clothes (this server) ---- the avatar editor's layers panel (gui.AvatarLayersPanel) puts the pieces an animal wears in an order of the player's own, and every

### item.Item

- `swf-src/Item.as`, 804 lines
- original: `tools/decompiled/item/Item.as`
- **changed:** `makeSmallIcon`, `makeLargeIcon`

> a custom item's own picture (AJClient.customArtUrl), in a box the size of the game's icons

### loader.ContentAnim

- `swf-src/ContentAnim.as`, 476 lines

> a LINE PLAY content shop item's animation and music (this server: lib/contentpacks.js gives them as "lpa" in the item's file, made by tools/content/lineplay/animate.py). the item's file is its still picture, which is the animation's first frame; the frames are one

### loader.DenItemHelper

- `swf-src/DenItemHelper.as`, 1412 lines
- original: `tools/decompiled/loader/DenItemHelper.as`
- **changed:** `get sortOffset`, `init`, `initDS`, `initGeneric`, `destroy`, `loadUniqueImage`, `setVersion`, `rebuildMannequinView`, `handleData`, `onBytesLoaded`
- **added:** `get contentAnim`, `addContentListeners`, `onContentMouse`, `loadCustomArt`, `fetchArtBytes`, `customArtBytesReceived`, `onCustomArtLoaded`, `onCustomArtFailed`, `loadBaseArt`, `finishLoad`, `onThemeTileBytes`, `onThemeTileFailed`, `onThemeTileLoaded`, `themeTexture`, `floorMatrix`, `wallMatrix`, `wallRuns`, `stackRuns`, `pieceRuns`, `footAt`, `grey`, `themeShade`

> a LINE PLAY content item's animation and music (loader.ContentAnim), The low two flip bits are used by the original client.  Den editing also uses bits 2-3 as the item's player depth: 1 = always behind players and 2 = always in front (a very large offset wins over the

### den.DenItem

- `swf-src/DenItem.as`, 1148 lines
- original: `tools/decompiled/den/DenItem.as`
- **changed:** `resizeAndPositionIcon`, `listenToMouse`

> a custom item's picture (DenItemHelper.loadCustomArt) is a Bitmap, not a MovieClip: no "icon" frame, and nothing to tell the mouse

### gui.DenUi

- `swf-src/DenUi.as`, 450 lines

> the look of this server's den editor additions (the layers panel, the pick bar, prefabs), drawn to match the game's own den editor (HUDAssets' DenEditorAsset and DenAudioPopupSkin): a wooden frame, a cream inside, a gold title strip, brown words in the game's font, and

### gui.DenLayersPanel

- `swf-src/DenLayersPanel.as`, 1718 lines

> the den editor's layers panel (this server): every item in the den, front first, in four bands (above players, by position, below players, on the floor), groups as rows that open to their items. a row is clicked to choose its item (even one that is locked, hidden or

### gui.DenPrefabs

- `swf-src/DenPrefabs.as`, 1357 lines

> the den editor's prefab tab (this server): items laid out together, saved from the den (the pick bar's "Save prefab", or this tab's first tile), and put down again as one group in the middle of the screen. what the player has none of free is added to their den items first, free,

### gui.DenShare

- `swf-src/DenShare.as`, 550 lines

> the whole den, from buttons by the den editor's Shop button (this server): a picture of it saved to a file, and its layout shared as a file or a code and laid out again from one. the server's side is lib/denlayouts.js and the "dl*" messages in lib/dens.js.

### gui.DenContentShop

- `swf-src/DenContentShop.as`, 1424 lines

> the content shop (this server): its own den items (lib/contentpacks.js), opened from the den editor's top right. a game-styled frame laid out like a web shop: collections down the left, a search box, category chips, a page of item cards, a details box, and a cart that is bought

### gui.AvatarLayersPanel

- `swf-src/AvatarLayersPanel.as`, 704 lines

> the avatar editor's layers panel (this server): the clothes the animal in the editor wears, the piece worn in front at the top, each with its icon, its name and where it goes (head, neck ...). a row is dragged up or down, or moved one place with its arrows, to wear it in front of

### gui.AvatarOutfitsPanel

- `swf-src/AvatarOutfitsPanel.as`, 546 lines

> the avatar editor's outfits window (this server): the player's saved outfits ("!outfit save" or the button below), each with the icons of its pieces. "Wear" puts one on the animal in the editor (or the mannequin) as if its pieces were picked there, in the outfit's layer

### it.gotoandplay.smartfoxserver.SmartFoxClient

- `swf-src/SmartFoxClient.as`, 1558 lines
- original: `tools/decompiled/it/gotoandplay/smartfoxserver/SmartFoxClient.as`
- **changed:** `SmartFoxClient`, `set rawProtocolSeparator`, `isSecureSocketSupported`, `getConnectionUrl`, `handleSocketConnection`, `handleMessage`, `getSocketIpAddress`

> Burrow: whether the socket is a SecureSocket, kept here. Ruffle (the game in a browser, /account/play) has no SecureSocket class, and "socketConnection is SecureSocket" threw #1065 there on every connect. the class is named only where it is made.

### loadProgress.LoadProgress

- `swf-src/LoadProgress.as`, 449 lines
- original: `tools/decompiled/loadProgress/LoadProgress.as`
- **changed:** `init`, `show`, `onLoadScreenComplete`, `startLoad`, `loadCompleteHandler`, `loadProgressHandler`
- **added:** `loadScreenBytes`, `oldScreenOn`, `setOldScreen`, `giveScreen`, `fetchScreen`, `screenBytes`

> which loading screen was last asked for: a fetch that comes back after another was asked for is dropped Burrow: on every player, as the Flash plugin had it by default Burrow: the screen's bytes (loadScreenBytes). in a browser

### com.sbi.loader.SceneLoader

- `swf-src/SceneLoader.as`, 369 lines
- original: `tools/decompiled/com/sbi/loader/SceneLoader.as`
- **changed:** `getOffset`, `newAsset`, `loadAsset`

> Burrow: each asset's "complete" listener is added before its loadBytes, and in a browser its bytes go through SwfImports.strip (Ruffle never finished loading the world map's art that imports sharedFonts.swf). Burrow: an empty layer (one not loaded yet, as the world map's

### com.sbi.loader.SwfImports

- `swf-src/SwfImports.as`, 203 lines

> Burrow: in a browser (Ruffle, /account/play), a SWF given to Loader.loadBytes that has an ImportAssets tag never finishes loading: no "init", no "complete", and whatever waits for it (the world map's scene) waits for good. the game's art imports "../sharedFonts.swf" with no names

### game.GameBase

- `swf-src/GameBase.as`, 744 lines
- original: `tools/decompiled/game/GameBase.as`
- **changed:** `gemMultiplierMediaHandler`

> Burrow: in a browser each sound is known by the file it was asked for. Ruffle's Sound.url is not the address asked for, so handleAudioFilePreloaded found no names: every sound was null and the game stopped at its first (SoundManager.addSoundByName), on its

### game.hedgeHog.HedgeHog

- `swf-src/HedgeHog.as`, 1708 lines
- original: `tools/decompiled/game/hedgeHog/HedgeHog.as`
- **changed:** `setupLevel`
- **added:** `drawMapOnce`

> the level art's own drawMap calls each tile's block() nine times, with its neighbours added one by one; only the last call counts (block resets the tile first). Ruffle runs it too slowly and stops the script, so in a browser the maze is drawn here, one call per tile.

### room.DenItemHolder

- `tools/decompiled/room/DenItemHolder.as`, 3202 lines
- original: `tools/decompiled/room/DenItemHolder.as`
- no method changed

> Groups, locks, player depth and layer order (this server). All are kept in the item's saved `flipped` value, which the server stores as bits 0-1   the game's flips bits 2-3   player depth: 0 by position (as the game draws), 1 always


## Replaced as P-code

Some methods decompile wrong and cannot be compiled from source, so their bytecode is replaced instead. The script's comments say which and why:

- `swf-src/EmoticonUtility.cinit.pcode`
- `swf-src/BulletinBoard.onTutorialGLReceived.pcode`
- `swf-src/BulletinBoard.onWhatsNewVideosLoaded.pcode`
- `swf-src/AvatarManager.checkIfAnimatingOnTopOf.pcode`

## Other files in swf-src/

- `swf-src/emo_temp.png`
- `swf-src/hud`
