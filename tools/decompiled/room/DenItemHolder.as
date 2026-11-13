package room
{
   import Party.PartyXtCommManager;
   import avatar.AvatarManager;
   import buddy.BuddyList;
   import collection.DenItemCollection;
   import collection.DenStateItemCollection;
   import com.sbi.bit.BitUtility;
   import com.sbi.graphics.SortLayer;
   import com.sbi.loader.SwfImports;
   import den.DenItem;
   import den.DenStateItem;
   import den.DenXtCommManager;
   import flash.display.BitmapData;
   import flash.display.DisplayObject;
   import flash.display.Loader;
   import flash.display.MovieClip;
   import flash.display.Sprite;
   import flash.events.Event;
   import flash.events.EventDispatcher;
   import flash.events.KeyboardEvent;
   import flash.events.MouseEvent;
   import flash.filters.GlowFilter;
   import flash.geom.Matrix;
   import flash.geom.Point;
   import flash.geom.Rectangle;
   import flash.text.TextField;
   import flash.text.TextFormat;
   import flash.utils.Dictionary;
   import game.MinigameManager;
   import gui.AvatarEditor;
   import gui.DenUi;
   import gui.EcoPointsPopup;
   import gui.EcoScorePopup;
   import gui.GenericListGuiManager;
   import gui.GuiManager;
   import loader.DenItemHelper;
   import localization.LocalizationManager;
   import quest.QuestManager;
   import shop.ShopManager;
   
   public class DenItemHolder extends EventDispatcher
   {
      
      private const MOUSE_DOWN_TYPE:int = 0;
      
      private const MOUSE_OVER_TYPE:int = 1;
      
      private const MOUSE_OUT_TYPE:int = 2;
      
      private var _currItems:DenStateItemCollection;
      
      private var _itemsInit:DenStateItemCollection;
      
      private var _savedDenItemHelpers:Array;
      
      private var _layerManager:LayerManager;
      
      private var _dragItem:DenStateItem;
      
      private var _itemFilter:DenStateItem;
      
      private var _dragPoint:Point;
      
      private var _closeBtn:MovieClip;
      
      private var _flipBtn:MovieClip;
      
      private var _flipBtnVer:MovieClip;
      
      private var _linkBtn:MovieClip;
      
      private var _themePos:Point;
      
      private var _isWaitingToSetItemsForFirstTime:Boolean;
      
      private var _roomMode:int;
      
      private var _lastItemInvId:int;
      
      private var _itemToEnterInvId:int;
      
      private var _itemRadiusBmpData:BitmapData;
      
      private var _lastSelectedItem:DenStateItem;
      
      private var _mannaquinAvEditor:AvatarEditor;
      
      private var _mannaquinDenItemHelper:DenItemHelper;
      
      private var _ecoScorePopup:EcoScorePopup;
      
      private var _ecoPointsPopup:EcoPointsPopup;

      // Groups, locks, player depth and layer order (this server). All are
      // kept in the item's saved `flipped` value, which the server stores as
      // it is:
      //   bits 0-1   the game's flips
      //   bits 2-3   player depth: 0 by position (as the game draws), 1 always
      //              behind players, 2 always in front of them
      //              (DenItemHelper.sortOffset)
      //   bit 4      locked: in the den editor it cannot be clicked in the
      //              room (it is chosen from the layers panel), moved,
      //              flipped or put away
      //   bit 5      its group's items are chosen one by one, not as one
      //   bits 6-7   its size: SIZES (1, 1.5, 2 or 3 times), from the
      //              point it stands on (the middle of its bottom edge);
      //              with bit 31 (SIZE_HIGH) the smaller ones (0.75, 0.5,
      //              0.33, 0.25 times), so a value saved before means what
      //              it did
      //   bits 8-15  the group (0 for none)
      //   bits 16-30 layer nudge, signed pixels: drawn so much further in
      //              front (more) or behind (less) than where it stands says;
      //              a floor item's place among the floor items
      // Shift+click picks items; the pick bar (gui.DenLayersPanel) makes
      // them a group, and dragging one of a group moves all of it.
      public static const DEPTH_AUTO:int = 0;

      public static const DEPTH_BEHIND:int = 1;

      public static const DEPTH_FRONT:int = 2;

      public static const DEPTH_LABELS:Array = ["Auto depth","Below players","Above players"];

      public static const MAX_NUDGE:int = 16383;

      public static const SIZES:Array = [1,1.5,2,3,0.75,0.5,1 / 3,0.25];

      public static const SIZE_LABELS:Array = ["1x","1.5x","2x","3x","0.75x","0.5x","0.33x","0.25x"];

      // the sizes from the smallest to the biggest, as the size button's
      // "-" and "+" step through them
      private static const SIZE_STEPS:Array = [7,6,5,4,0,1,2,3];

      private static const SIZE_HIGH:int = -2147483648;

      private static const SIZE_SHIFT:int = 6;

      private static const SIZE_MASK:int = 3 << 6;

      private static const DEPTH_MASK:int = 12;

      private static const LOCK_BIT:int = 16;

      private static const LOOSE_BIT:int = 32;

      private static const GROUP_SHIFT:int = 8;

      private static const GROUP_MASK:int = 255 << 8;

      private static const NUDGE_SHIFT:int = 16;

      private static const NUDGE_MASK:int = 32767 << 16;

      private static const PICK_GLOW:uint = 16182396;

      private static const PREVIEW_GLOW:uint = 4105463;

      private static const BTN_W:int = 100;

      private static const BTN_EDGE:uint = 6042644;

      private static const BTN_TEXT:uint = 6042644;

      private var _picked:Array;

      private var _glowing:Array;

      private var _wasDown:Boolean;

      private var _pressPicked:Boolean;

      private var _shiftAtDown:Boolean;

      private var _depthBtn:Sprite;

      private var _sticky:Boolean;

      private var _preview:DenStateItem;

      private var _ungroupBtn:Sprite;
      private var _duplicateBtn:Sprite;
      // copies den items ([DenStateItem...]) in the den editor (gui.DenPrefabs)
      public var onDuplicate:Function;

      private var _lockBtn:Sprite;

      private var _sizeBtn:Sprite;

      private var _pickHint:Sprite;
      
      public function DenItemHolder(param1:LayerManager)
      {
         super();
         _themePos = new Point();
         _dragPoint = new Point();
         _layerManager = param1;
         _closeBtn = GETDEFINITIONBYNAME("closeBtn");
         _closeBtn.addEventListener("mouseDown",onCloseBtn,false,0,true);
         _flipBtn = GETDEFINITIONBYNAME("itemRotateBtnCont");
         _flipBtn.addEventListener("mouseDown",onFlipBtn,false,0,true);
         _flipBtnVer = GETDEFINITIONBYNAME("itemRotateBtnCont");
         _flipBtnVer.rotation = 90;
         _flipBtnVer.addEventListener("mouseDown",onFlipBtn,false,0,true);
         _linkBtn = GETDEFINITIONBYNAME("portalLinkBtnCont");
         _linkBtn.addEventListener("mouseDown",onLinkBtn,false,0,true);
         _picked = [];
         _glowing = [];
         _depthBtn = makeGroupButton(DEPTH_LABELS[0],onDepthBtn);
         _ungroupBtn = makeGroupButton("Ungroup",onUngroupBtn);
         _duplicateBtn = makeGroupButton("Duplicate",onDuplicateBtn);
         _lockBtn = makeGroupButton("Lock",onLockBtn);
         _sizeBtn = makeGroupButton(sizeLabel(0),onSizeBtn);
         // a little tag in the look of the layers panel: wood around cream
         _pickHint = new Sprite();
         _pickHint.mouseEnabled = false;
         _pickHint.mouseChildren = false;
         var _loc1_:TextField = DenUi.text("Shift+click: pick more",11,DenUi.TEXT);
         DenUi.woodBox(_pickHint.graphics,_loc1_.width + 22,26,3);
         _loc1_.x = 11;
         _loc1_.y = int((26 - _loc1_.height) * 0.5);
         _pickHint.addChild(_loc1_);
         gMainFrame.stage.addEventListener("mouseDown",onStageMouseDown,true,0,true);
         gMainFrame.stage.addEventListener("mouseUp",onStageMouseUp,true,0,true);
         gMainFrame.stage.addEventListener("keyDown",onStageKeyDown,true,0,true);
         release();
         _lastItemInvId = -1;
      }
      
      public function release() : void
      {
         _isWaitingToSetItemsForFirstTime = true;
         if(_currItems)
         {
            for each(var _loc1_:DenStateItem in _currItems.getCoreArray())
            {
               if(_loc1_.denItemHelper)
               {
                  _loc1_.denItemHelper.destroy();
               }
            }
         }
         _currItems = new DenStateItemCollection();
         _itemsInit = new DenStateItemCollection();
         _savedDenItemHelpers = [];
         _lastSelectedItem = null;
         _dragItem = null;
         _picked = [];
         _wasDown = false;
         _pressPicked = false;
         _sticky = false;
         _preview = null;
         updateCloseBtn();
         changed();
      }
      
      public function clearDen() : void
      {
         release();
         var _loc1_:DenStateItem = new DenStateItem(617,-1,40435715,0,0,0,50,0,0,3,0,4,0,0,0,"MusDenDef",0,"",0,0,"","",-1,"",false,null,0,0,null,null,2);
         setItem(_loc1_);
      }
      
      public function get numberOfInitItems() : int
      {
         return _itemsInit.length;
      }
      
      public function get numberOfInUseItems() : int
      {
         return _currItems.length;
      }
      
      public function get isDragging() : Boolean
      {
         return _dragItem != null;
      }

      public function get lastSelectedItem() : DenStateItem
      {
         return _lastSelectedItem;
      }
      
      public function reloadItems() : void
      {
         var _loc1_:int = 0;
         if(_savedDenItemHelpers)
         {
            _loc1_ = 0;
            while(_loc1_ < _savedDenItemHelpers.length)
            {
               itemLoaded(_savedDenItemHelpers[_loc1_],true);
               _loc1_++;
            }
         }
      }
      
      public function updateConsumers(param1:Dictionary) : void
      {
         var _loc2_:int = 0;
         var _loc3_:int = 0;
         for each(var _loc4_:DenStateItem in _currItems.getCoreArray())
         {
            for(_loc2_ in param1)
            {
               if(_loc4_.invIdx == _loc2_)
               {
                  if(!(_loc4_.ecoConsumerStateId == 0 && param1[_loc2_] == 2))
                  {
                     if(!(_loc4_.ecoConsumerStateId == 2 && param1[_loc2_] == 0))
                     {
                        if(_loc4_.ecoConsumerStateId != 2)
                        {
                           sendMouseEventToItem(_loc4_.denItemHelper.content as MovieClip);
                        }
                        else if(param1[_loc2_] != 2)
                        {
                           sendMouseEventToItem(_loc4_.denItemHelper.content as MovieClip);
                        }
                     }
                  }
                  _loc4_.ecoConsumerStateId = param1[_loc2_];
               }
            }
         }
         var _loc5_:DenItemCollection = gMainFrame.userInfo.playerUserInfo.denItemsPartial;
         _loc3_ = 0;
         while(_loc3_ < _loc5_.length)
         {
            for(_loc2_ in param1)
            {
               if(_loc5_.getDenItem(_loc3_).invIdx == _loc2_)
               {
                  _loc5_.getDenItem(_loc3_).ecoConsumerStateId = param1[_loc2_];
                  break;
               }
            }
            _loc3_++;
         }
         AvatarManager.playerAvatar.inventoryDenPartial.denItemCollection = _loc5_;
         _loc5_ = AvatarManager.playerAvatar.inventoryDenFull.denItemCollection;
         _loc3_ = 0;
         while(_loc3_ < _loc5_.length)
         {
            for(_loc2_ in param1)
            {
               if(_loc5_.getDenItem(_loc3_).invIdx == _loc2_)
               {
                  _loc5_.getDenItem(_loc3_).ecoConsumerStateId = param1[_loc2_];
                  break;
               }
            }
            _loc3_++;
         }
         gMainFrame.userInfo.playerUserInfo.denItemsFull = _loc5_;
      }
      
      public function setItems(param1:DenStateItemCollection, param2:Boolean = false) : void
      {
         var _loc8_:DenStateItem = null;
         var _loc4_:* = null;
         var _loc3_:Boolean = false;
         var _loc7_:int = 0;
         var _loc5_:Number = NaN;
         var _loc6_:Number = NaN;
         var _loc10_:DenStateItem = null;
         var _loc9_:Boolean = false;
         if(_isWaitingToSetItemsForFirstTime && param2)
         {
            _isWaitingToSetItemsForFirstTime = false;
         }
         _loc7_ = 0;
         while(_loc7_ < param1.length)
         {
            _loc8_ = param1.getDenStateItem(_loc7_);
            if(_loc8_)
            {
               if(_loc8_.catId > 0)
               {
                  _loc3_ = false;
                  for each(_loc4_ in _currItems.getCoreArray())
                  {
                     if(_loc8_.refId == _loc4_.refId && _loc8_.invIdx == _loc4_.invIdx)
                     {
                        _loc4_.flipped = _loc8_.flipped;
                        _loc5_ = _loc8_.x + _loc4_.offsetX;
                        _loc6_ = _loc8_.y + _loc4_.offsetY;
                        setItemMatrix(_loc4_,_loc5_,_loc6_,_loc4_.flipped);
                        if(_loc4_.sortCatId == 99 && _loc4_.denItemHelper)
                        {
                           _loc4_.denItemHelper.setVersion(_loc8_.version,_loc8_.version2,_loc8_.version3);
                        }
                        else if(_loc4_.petItem == null && _loc4_.version != _loc8_.version)
                        {
                           // its owner gave it another colour (DenXtCommManager "dvc")
                           _loc4_.version = _loc8_.version;
                           if(_loc4_.denItemHelper)
                           {
                              _loc4_.denItemHelper.setVersion(_loc8_.version);
                           }
                        }
                        if(_loc4_.specialType == 1)
                        {
                           _loc4_.userNameLink = _loc8_.userNameLink;
                           if(_loc4_.denItemHelper && _loc4_.denItemHelper.content && _loc4_.denItemHelper.content.hasOwnProperty("active"))
                           {
                              if(_loc4_.userNameLink != "")
                              {
                                 Object(_loc4_.denItemHelper.content).active(true);
                              }
                              else
                              {
                                 Object(_loc4_.denItemHelper.content).active(false);
                              }
                           }
                           BuddyList.destroyInWorldBuddyList();
                        }
                        if(_loc4_.uniqueImageId != _loc8_.uniqueImageId)
                        {
                           _loc4_.uniqueImageId = _loc8_.uniqueImageId;
                           _loc4_.uniqueImageCreator = _loc8_.uniqueImageCreator;
                           if(_loc4_.denItemHelper)
                           {
                              (_loc4_.denItemHelper as DenItemHelper).uniqueImageId = _loc4_.uniqueImageId;
                              (_loc4_.denItemHelper as DenItemHelper).uniqueImageCreator = _loc4_.uniqueImageCreator;
                              (_loc4_.denItemHelper as DenItemHelper).loadUniqueImage();
                           }
                        }
                        if(_loc4_.specialType == 4)
                        {
                           if(!_loc4_.mannequinData.compare(_loc8_.mannequinData,true))
                           {
                              _loc4_.mannequinData.copyFromOther(_loc8_.mannequinData);
                           }
                        }
                        _loc4_.ecoConsumerStateId = _loc8_.ecoConsumerStateId;
                        _loc3_ = true;
                        break;
                     }
                  }
                  if(!_loc3_)
                  {
                     _loc10_ = _loc8_.clone();
                     _loc10_.userAction = param2;
                     setItem(_loc10_);
                  }
               }
               else
               {
                  for each(_loc4_ in _currItems.getCoreArray())
                  {
                     if(_loc8_.refId == _loc4_.refId && _loc8_.invIdx == _loc4_.invIdx)
                     {
                        releaseItem(_loc4_,param2);
                        if(_loc4_.specialType == 5)
                        {
                           ShopManager.ifShopToSellOpenCloseIt();
                        }
                        break;
                     }
                  }
               }
            }
            _loc7_++;
         }
         for each(_loc4_ in _currItems.getCoreArray())
         {
            if(_loc4_.sortCatId == 4)
            {
               _loc9_ = true;
               break;
            }
         }
         if(!_loc9_)
         {
            _loc8_ = new DenStateItem(0,-1,40435715,0,0,0,50,0,0,3,0,4,0,0,0,"MusDenDef",0,"",0,0,"","",-1,"",param2,null,0,0,null,null,2);
            setItem(_loc8_);
         }
         if(!param2)
         {
            updateInitialState();
         }
         if(_isWaitingToSetItemsForFirstTime)
         {
            _isWaitingToSetItemsForFirstTime = false;
         }
      }
      
      public function rebuildMannequins() : void
      {
         var _loc1_:* = null;
         for each(_loc1_ in _currItems.getCoreArray())
         {
            if(_loc1_.mannequinData != null)
            {
               _loc1_.mannequinData.refreshAvatarItems();
            }
         }
      }
      
      public function removeAccessoryAndRebuildMannequin(param1:DenItem, param2:int, param3:int) : void
      {
         var _loc6_:DenStateItem = null;
         var _loc5_:int = 0;
         var _loc4_:Boolean = false;
         for each(_loc6_ in _currItems.getCoreArray())
         {
            if(_loc6_.mannequinData != null && _loc6_.invIdx == param2)
            {
               _loc6_.mannequinData.hasThisInvIdOnAndRemove(param3);
               _loc6_.mannequinData.refreshAvatarItems();
               _loc4_ = true;
               break;
            }
         }
         if(!_loc4_)
         {
            _loc6_ = new DenStateItem(param1.defId,param1.invIdx,param1.defId << 16 | param1.categoryId,0,0,param1.version,param1.version2,param1.version3,0,param1.categoryId,param1.refId,param1.sortId,param1.minigameDefId,param1.layerId,param1.enviroType,param1.strmName,0,"",param1.specialType,param1.listId,param1.uniqueImageId,param1.uniqueImageCreator,param1.uniqueImageCreatorDbId,param1.uniqueImageCreatorUUID,false,null,0,0,param1.petItem,param1.mannequinData,param1.ecoConsumerStateId);
            _loc5_ = 0;
            while(_loc5_ < _itemsInit.length)
            {
               if(_itemsInit.getDenStateItem(_loc5_).mannequinData != null && _itemsInit.getDenStateItem(_loc5_).mannequinData.invIdx == param2)
               {
                  _loc4_ = true;
                  _itemsInit.setDenStateItem(_loc5_,_loc6_.clone());
                  break;
               }
               _loc5_++;
            }
            if(!_loc4_)
            {
               _itemsInit.pushDenStateItem(_loc6_.clone());
            }
         }
      }
      
      public function removeItem(param1:int, param2:int) : void
      {
         for each(var _loc3_:DenStateItem in _currItems.getCoreArray())
         {
            if(_loc3_.refId == param2 && _loc3_.invIdx == param1)
            {
               releaseItem(_loc3_);
               break;
            }
         }
      }
      
      public function saveState(param1:int = -1) : void
      {
         var _loc2_:* = null;
         var _loc13_:* = null;
         var _loc7_:Boolean = false;
         var _loc12_:Boolean = false;
         var _loc4_:Object = null;
         var _loc9_:* = null;
         var _loc8_:int = 0;
         var _loc5_:DenItemHolderEvent = null;
         var _loc3_:Array = null;
         var _loc10_:int = 0;
         var _loc11_:int = 0;
         var _loc6_:Array = [];
         for each(_loc2_ in _itemsInit.getCoreArray())
         {
            _loc7_ = false;
            for each(_loc13_ in _currItems.getCoreArray())
            {
               if(_loc13_.refId == _loc2_.refId && _loc13_.invIdx == _loc2_.invIdx)
               {
                  _loc7_ = true;
                  if(_loc13_.sortCatId != 4 && (_loc13_.x != _loc2_.x || _loc13_.y != _loc2_.y || _loc13_.flipped != _loc2_.flipped || _loc13_.userNameLink != _loc2_.userNameLink || _loc13_.uniqueImageId != _loc2_.uniqueImageId || _loc13_.uniqueImageCreator != _loc2_.uniqueImageCreator || _loc13_.mannequinData == null && _loc2_.mannequinData != null || _loc13_.mannequinData != null && !_loc13_.mannequinData.compare(_loc2_.mannequinData,true)))
                  {
                     if(_loc13_.mannequinData == null && _loc2_.mannequinData != null || _loc13_.mannequinData != null && !_loc13_.mannequinData.compare(_loc2_.mannequinData,true))
                     {
                        _loc12_ = true;
                     }
                     _loc6_.push({
                        "di":_loc13_.denItemHelper,
                        "f":_loc13_.flipped,
                        "i":_loc13_.invIdx,
                        "x":_loc13_.x,
                        "s":_loc13_.sortCatId,
                        "y":_loc13_.y,
                        "offX":_loc13_.offsetX,
                        "offY":_loc13_.offsetY,
                        "r":_loc13_.refId,
                        "userNameLink":_loc13_.userNameLink,
                        "uniqueImageId":_loc13_.uniqueImageId,
                        "uniqueImageCreator":_loc13_.uniqueImageCreator,
                        "mannequinData":_loc13_.mannequinData
                     });
                  }
                  break;
               }
            }
            if(!_loc7_)
            {
               _loc6_.push({
                  "f":0,
                  "i":_loc2_.invIdx,
                  "s":_loc2_.sortCatId,
                  "x":0,
                  "y":0,
                  "d":0,
                  "r":_loc2_.refId,
                  "userNameLink":"",
                  "uniqueImageId":"",
                  "uniqueImageCreator":"",
                  "mannequinData":_loc2_.mannequinData
               });
            }
         }
         for each(_loc13_ in _currItems.getCoreArray())
         {
            _loc7_ = false;
            for each(_loc2_ in _itemsInit.getCoreArray())
            {
               if(_loc2_.refId == _loc13_.refId && _loc2_.invIdx == _loc13_.invIdx)
               {
                  _loc7_ = true;
                  break;
               }
            }
            if(!_loc7_)
            {
               _loc6_.push({
                  "f":_loc13_.flipped,
                  "di":_loc13_.defId,
                  "i":_loc13_.invIdx,
                  "s":_loc13_.sortCatId,
                  "x":_loc13_.x,
                  "y":_loc13_.y,
                  "offX":_loc13_.offsetX,
                  "offY":_loc13_.offsetY,
                  "r":_loc13_.refId,
                  "userNameLink":_loc13_.userNameLink,
                  "uniqueImageId":_loc13_.uniqueImageId,
                  "uniqueImageCreator":_loc13_.uniqueImageCreator,
                  "mannequinData":_loc13_.mannequinData
               });
            }
         }
         if(_loc6_.length > 0)
         {
            updateInitialState();
            if(param1 != -1)
            {
               _loc8_ = 0;
               while(_loc8_ < _loc6_.length)
               {
                  if(_loc6_[_loc8_].i == param1)
                  {
                     _loc6_.push(_loc6_[_loc8_]);
                     _loc6_.splice(_loc8_,1);
                     break;
                  }
                  _loc8_++;
               }
            }
            _loc5_ = new DenItemHolderEvent("OnSaveState");
            _loc3_ = [];
            for each(_loc9_ in _loc6_)
            {
               if(_loc9_.i != -1)
               {
                  if(_loc9_.di)
                  {
                     _loc10_ = _loc9_.x - _loc9_.offX;
                     _loc11_ = _loc9_.y - _loc9_.offY;
                     _loc4_ = {
                        "i":_loc9_.i,
                        "s":_loc9_.s,
                        "d":1,
                        "x":_loc10_,
                        "y":_loc11_,
                        "f":_loc9_.f,
                        "r":_loc9_.r,
                        "userNameLink":_loc9_.userNameLink,
                        "uniqueImageId":_loc9_.uniqueImageId,
                        "uniqueImageCreator":_loc9_.uniqueImageCreator,
                        "mannequinData":_loc9_.mannequinData
                     };
                  }
                  else
                  {
                     _loc4_ = {
                        "i":_loc9_.i,
                        "s":_loc9_.s,
                        "d":0,
                        "x":0,
                        "y":0,
                        "f":0,
                        "r":_loc9_.r,
                        "userNameLink":_loc9_.userNameLink,
                        "uniqueImageId":_loc9_.uniqueImageId,
                        "uniqueImageCreator":_loc9_.uniqueImageCreator,
                        "mannequinData":_loc9_.mannequinData
                     };
                  }
                  _loc3_.push(_loc4_);
               }
            }
            _loc5_.array = _loc3_;
            _loc5_.hasUpdates = _loc12_;
            dispatchEvent(_loc5_);
         }
      }
      
      public function removeHighlightState() : void
      {
         if(_closeBtn.parent)
         {
            _closeBtn.parent.removeChild(_closeBtn);
         }
         if(_flipBtn.parent)
         {
            _flipBtn.parent.removeChild(_flipBtn);
         }
         if(_linkBtn.parent)
         {
            _linkBtn.parent.removeChild(_linkBtn);
         }
         if(_flipBtnVer.parent)
         {
            _flipBtnVer.parent.removeChild(_flipBtnVer);
         }
         _itemFilter = null;
         _picked = [];
         _sticky = false;
         _preview = null;
         hideGroupControls();
         refreshGlows();
      }

      private function updateInitialState() : void
      {
         _itemsInit = new DenStateItemCollection();
         for each(var _loc1_:DenStateItem in _currItems.getCoreArray())
         {
            _itemsInit.pushDenStateItem(_loc1_.clone());
         }
      }
      
      public function handleMouse(param1:Number, param2:Number, param3:Boolean) : void
      {
         var _loc5_:Number = NaN;
         var _loc4_:Number = NaN;
         var _loc6_:DenStateItem = null;
         if(param3)
         {
            if(!_wasDown)
            {
               _wasDown = true;
               onPress(param1,param2);
            }
            if(_pressPicked)
            {
               return;
            }
            if(_dragItem)
            {
               if(_dragItem.specialType == 1)
               {
                  if(BuddyList.isOverWorldBuddyList(param1,param2))
                  {
                     RoomManagerWorld.instance.forceMouseUp();
                     return;
                  }
               }
               var _loc7_:Array = moveSet(_dragItem);
               if(anyLocked(_loc7_))
               {
                  _dragPoint.x = param1;
                  _dragPoint.y = param2;
                  return;
               }
               var _loc8_:Number = param1 - _dragPoint.x;
               var _loc9_:Number = param2 - _dragPoint.y;
               for each(var _loc10_:DenStateItem in _loc7_)
               {
                  setItemMatrix(_loc10_,_loc10_.x + _loc8_,_loc10_.y + _loc9_,_loc10_.flipped);
               }
               _loc5_ = _dragItem.x;
               _loc4_ = _dragItem.y;
               setBtnPos(_loc5_ + _dragItem.denItemHelper.contentWidth - 30,_loc4_);
               _dragPoint.x = param1;
               _dragPoint.y = param2;
            }
         }
         else
         {
            _wasDown = false;
            _pressPicked = false;
            if(_dragItem && overControls(param1,param2))
            {
               return;
            }
            // clicked (in the den or the layers panel): kept, whatever the
            // mouse passes over, till a click on something else
            if(_sticky && _dragItem)
            {
               return;
            }
            if(_dragItem && _dragItem.specialType == 1)
            {
               _loc6_ = hitTest(param1,param2);
               if(BuddyList.isOverWorldBuddyList(param1,param2))
               {
                  return;
               }
               if(_loc6_ != _dragItem)
               {
                  BuddyList.closeWorldBuddyList();
                  _dragItem = _loc6_;
               }
            }
            else
            {
               _dragItem = hitTest(param1,param2);
            }
            if(_dragItem)
            {
               _dragPoint.x = param1;
               _dragPoint.y = param2;
            }
            updateCloseBtn();
         }
      }
      
      public function setThemePosition(param1:int, param2:int) : void
      {
         _themePos = new Point(param1,param2);
      }
      
      public function setRoomMode(param1:int) : void
      {
         if(_roomMode == 1 && param1 != 1)
         {
            // out of den editing: no picks, glows or buttons left behind
            _picked = [];
            _wasDown = false;
            _pressPicked = false;
            _dragItem = null;
            _sticky = false;
            _preview = null;
            _roomMode = param1;
            updateCloseBtn();
            changed();
         }
         _roomMode = param1;
         stopListenersOnPets(_roomMode == 1);
         stopMouseOnNonMouseItems(_roomMode == 1);
      }
      
      public function stopListenersOnPets(param1:Boolean) : void
      {
         for each(var _loc2_:DenStateItem in _currItems.getCoreArray())
         {
            if(_loc2_.denItemHelper && _loc2_.denItemHelper.content && _loc2_.denItemHelper.content.hasOwnProperty("listenToMouse"))
            {
               if(_loc2_.specialType != 7)
               {
                  Object(_loc2_.denItemHelper.content).listenToMouse = !param1;
               }
            }
         }
      }
      
      public function stopMouseOnNonMouseItems(param1:Boolean) : void
      {
         for each(var _loc2_:DenStateItem in _currItems.getCoreArray())
         {
            if(_loc2_.denItemHelper && _loc2_.denItemHelper.content && _loc2_.denItemHelper.content.hasOwnProperty("ignoreMouseCompletely") && _loc2_.denItemHelper.displayObject)
            {
               Sprite(_loc2_.denItemHelper.displayObject).mouseEnabled = !param1;
               Sprite(_loc2_.denItemHelper.displayObject).mouseChildren = !param1;
            }
         }
      }
      
      public function shouldStopMovement(param1:Point) : Boolean
      {
         var _loc5_:DenStateItem = null;
         var _loc3_:MovieClip = null;
         var _loc4_:int = 0;
         var _loc2_:int = int(_currItems.length);
         if(_loc2_ > 0)
         {
            _loc4_ = 0;
            while(_loc4_ < _loc2_)
            {
               _loc5_ = _currItems.getDenStateItem(_loc4_);
               if(!isTheme(_loc5_.sortCatId) && _loc5_.sortCatId != 4)
               {
                  if(_loc5_.denItemHelper.displayObject.numChildren > 0)
                  {
                     _loc3_ = _loc5_.denItemHelper.displayObject.getChildAt(0) is Loader ? Loader(_loc5_.denItemHelper.displayObject.getChildAt(0)).content as MovieClip : null;
                     if(_loc3_ != null && _loc3_.parent.name == "moveToDisabled")
                     {
                        if(_loc3_.hitTestPoint(param1.x,param1.y,true))
                        {
                           return true;
                        }
                     }
                  }
               }
               _loc4_++;
            }
         }
         return false;
      }
      
      public function portalItemTest(param1:Boolean, param2:Point) : void
      {
         var _loc4_:int = 0;
         var _loc7_:DenStateItem = null;
         var _loc6_:int = 0;
         var _loc3_:Sprite = null;
         var _loc5_:Object = null;
         if(!RoomXtCommManager.isSwitching)
         {
            _loc4_ = int(_currItems.length);
            if(_loc4_ > 0)
            {
               _loc6_ = 0;
               while(_loc6_ < _loc4_)
               {
                  _loc7_ = _currItems.getDenStateItem(_loc6_);
                  if(_loc7_.specialType == 1 && _loc7_.userNameLink != "" || _loc7_.specialType == 3)
                  {
                     if(_loc7_.denItemHelper.content)
                     {
                        if(param1)
                        {
                           if(Object(_loc7_.denItemHelper.displayObject.getChildAt(0)).content.clickObject.hitTestPoint(param2.x,param2.y,true))
                           {
                              _loc3_ = Sprite(Object(_loc7_.denItemHelper.displayObject.getChildAt(0)).content.radiusObject);
                              _itemToEnterInvId = _loc7_.invIdx;
                              _itemRadiusBmpData = new BitmapData(_loc3_.width,_loc3_.height);
                              _itemRadiusBmpData.draw(_loc3_);
                           }
                           else
                           {
                              _itemToEnterInvId = -1;
                              if(_itemRadiusBmpData)
                              {
                                 _itemRadiusBmpData.dispose();
                                 _itemRadiusBmpData = null;
                              }
                           }
                           _lastItemInvId = -1;
                        }
                        if(_itemToEnterInvId == _loc7_.invIdx)
                        {
                           _loc5_ = Object(_loc7_.denItemHelper.content).getRadiusObject();
                           if(!AvatarManager.playerAvatarWorldView.bmpDataHitTest(_itemRadiusBmpData,new Point(_loc7_.x + _loc5_.x,_loc7_.y + _loc5_.y)))
                           {
                              return;
                           }
                           if(_lastItemInvId == _loc7_.invIdx)
                           {
                              return;
                           }
                           if(_lastItemInvId == -1)
                           {
                              if(_loc7_.specialType == 3)
                              {
                                 DenXtCommManager.requestDenPhantom(AvatarManager.playerAvatarWorldView.isPhantom ? 0 : 1);
                              }
                              else
                              {
                                 RoomXtCommManager.sendRoomJoinRequest("den" + _loc7_.userNameLink,_loc7_.invIdx);
                              }
                              _lastItemInvId = _loc7_.invIdx;
                              return;
                           }
                        }
                     }
                  }
                  _loc6_++;
               }
            }
         }
         _lastItemInvId = -1;
      }
      
      private function isTheme(param1:int) : Boolean
      {
         return param1 > 1 && param1 < 4;
      }
      
      private function setItem(param1:DenStateItem) : void
      {
         var _loc4_:DenItemHolderEvent = null;
         var _loc2_:DenItemHolderEvent = null;
         var _loc3_:DenItemHelper = new DenItemHelper();
         if(isTheme(param1.sortCatId))
         {
            for each(var _loc5_:DenStateItem in _currItems.getCoreArray())
            {
               if(_loc5_.sortCatId == param1.sortCatId)
               {
                  releaseItem(_loc5_);
                  _loc4_ = new DenItemHolderEvent("OnItemRemoved");
                  _loc4_.id = _loc5_.invIdx;
                  _loc4_.refId = _loc5_.refId;
                  _loc4_.array = [_loc5_];
                  dispatchEvent(_loc4_);
                  break;
               }
            }
         }
         else if(param1.sortCatId == 4)
         {
            for each(var _loc6_:DenStateItem in _currItems.getCoreArray())
            {
               if(_loc6_.sortCatId == param1.sortCatId)
               {
                  releaseItem(_loc6_);
                  _loc2_ = new DenItemHolderEvent("OnItemRemoved");
                  _loc2_.id = _loc6_.invIdx;
                  _loc2_.refId = _loc6_.refId;
                  _loc2_.array = [_loc6_];
                  dispatchEvent(_loc2_);
                  break;
               }
            }
            RoomManagerWorld.instance.playMusic(param1.strmName + ".mp3",param1.version2 / 100);
         }
         param1.denItemHelper = _loc3_;
         _currItems.pushDenStateItem(param1);
         _loc3_.initDS(param1,itemLoaded);
         if(_roomMode == 1)
         {
            if(param1.denItemHelper && param1.denItemHelper.content && param1.denItemHelper.content.hasOwnProperty("listenToMouse"))
            {
               Object(param1.denItemHelper.content).listenToMouse = false;
            }
         }
         else if(param1.denItemHelper && param1.denItemHelper.displayObject && param1.denItemHelper.content && param1.denItemHelper.content.hasOwnProperty("ignoreMouseCompletely"))
         {
            Sprite(param1.denItemHelper.displayObject).mouseEnabled = false;
            Sprite(param1.denItemHelper.displayObject).mouseChildren = false;
         }
         if(param1.denItemHelper && param1.denItemHelper.content && param1.denItemHelper.content.hasOwnProperty("active"))
         {
            if(param1.userNameLink != "")
            {
               Object(param1.denItemHelper.content).active(true);
            }
            else
            {
               Object(param1.denItemHelper.content).active(false);
            }
         }
         if(param1.minigameDefId > 0 || param1.listLauncherId > 0 || _loc3_.isUniqueImageItem)
         {
            addListenersToItem(_loc3_,param1);
         }
         else if(param1.specialType == 1)
         {
            addPortalListenersToItem(_loc3_,param1);
         }
         else if(param1.specialType == 2)
         {
            _loc3_.setupItemWithEmotes(param1);
         }
         else if(param1.defId == 3192 || param1.defId == 3193 || param1.defId == 3250 || param1.defId == 3585)
         {
            addListenersToItem(_loc3_,param1);
         }
         else if(param1.defId >= 3312 && param1.defId <= 3319)
         {
            addListenersToItem(_loc3_,param1);
         }
         else if(param1.specialType == 5)
         {
            addListenersToItem(_loc3_,param1);
         }
         else if(RoomManagerWorld.instance.isMyDen)
         {
            if(param1.defId == 3216)
            {
               addListenersToItem(_loc3_,param1);
            }
            else if(param1.specialType == 4)
            {
               addListenersToItem(_loc3_,param1);
            }
            else if(param1.specialType == 6)
            {
               addListenersToItem(_loc3_,param1);
            }
            else if(param1.specialType == 7)
            {
               if(param1.denItemHelper && param1.denItemHelper.content && param1.denItemHelper.content.hasOwnProperty("listenToMouse"))
               {
                  Object(param1.denItemHelper.content).listenToMouse = false;
               }
               addListenersToItem(_loc3_,param1);
            }
         }
         if(_isWaitingToSetItemsForFirstTime || !param1.userAction)
         {
            _itemsInit.pushDenStateItem(param1.clone());
         }
      }
      
      private function updateCloseBtn() : void
      {
         if(_dragItem)
         {
            if(_closeBtn.parent != _dragItem.denItemHelper.displayObject)
            {
               setBtnPos(_dragItem.x + _dragItem.denItemHelper.contentWidth - 30,_dragItem.y);
               _layerManager.room_chat.addChild(_closeBtn);
               _layerManager.room_chat.addChild(_flipBtn);
               _layerManager.room_chat.addChild(_flipBtnVer);
               if(_dragItem.specialType == 1)
               {
                  _layerManager.room_chat.addChild(_linkBtn);
               }
               else if(_linkBtn.parent)
               {
                  _linkBtn.parent.removeChild(_linkBtn);
                  BuddyList.closeWorldBuddyList();
               }
            }
            _itemFilter = _dragItem;
            if(isLocked(_dragItem))
            {
               if(_closeBtn.parent)
               {
                  _closeBtn.parent.removeChild(_closeBtn);
               }
               if(_flipBtn.parent)
               {
                  _flipBtn.parent.removeChild(_flipBtn);
               }
               if(_flipBtnVer.parent)
               {
                  _flipBtnVer.parent.removeChild(_flipBtnVer);
               }
            }
            showGroupControls();
            refreshGlows();
         }
         else
         {
            if(_closeBtn.parent)
            {
               _closeBtn.parent.removeChild(_closeBtn);
            }
            if(_flipBtn.parent)
            {
               _flipBtn.parent.removeChild(_flipBtn);
            }
            if(_flipBtnVer.parent)
            {
               _flipBtnVer.parent.removeChild(_flipBtnVer);
            }
            if(_linkBtn.parent)
            {
               _linkBtn.parent.removeChild(_linkBtn);
               BuddyList.closeWorldBuddyList();
            }
            _itemFilter = null;
            showGroupControls();
            refreshGlows();
         }
      }

      private function setBtnPos(param1:Number, param2:Number) : void
      {
         _closeBtn.x = param1;
         _closeBtn.y = param2;
         _flipBtn.x = param1 + 15;
         _flipBtn.y = param2 + 55;
         _flipBtnVer.x = param1 + 15;
         _flipBtnVer.y = param2 + 90;
         _linkBtn.x = param1 + 15;
         _linkBtn.y = param2 + 125;
         BuddyList.updateWorldBuddyListPosition(_linkBtn);
         placeGroupControls(param1,param2);
      }
      
      private function onCloseBtn(param1:Event) : void
      {
         var _loc2_:DenItemHolderEvent = null;
         param1.stopPropagation();
         if(_dragItem && !isLocked(_dragItem))
         {
            dropPick(_dragItem);
            _loc2_ = new DenItemHolderEvent("OnItemRemoved");
            _loc2_.id = _dragItem.invIdx;
            _loc2_.refId = _dragItem.refId;
            _loc2_.array = [_dragItem];
            releaseItem(_dragItem);
            _dragItem = null;
            updateCloseBtn();
            dispatchEvent(_loc2_);
         }
      }
      
      private function onFlipBtn(param1:Event) : void
      {
         param1.stopPropagation();
         if(_dragItem && !isLocked(_dragItem))
         {
            // bit 0: mirrored left to right; bit 1: turned upside down
            var _loc2_:int = param1.currentTarget == _flipBtnVer ? 2 : 1;
            var _loc3_:Array = moveSet(_dragItem);
            if(_loc3_.length > 1 && !anyLocked(_loc3_))
            {
               flipSet(_loc3_,_loc2_);
            }
            else
            {
               _dragItem.flipped ^= _loc2_;
               setItemMatrix(_dragItem,_dragItem.x,_dragItem.y,_dragItem.flipped);
            }
         }
      }

      // a group (or the picked items) flipped as one, as drag moves them:
      // each item flips, and its place is mirrored across the middle of
      // them all, left to right (bit 1), or turned about it (bit 2: upside
      // down is left to right and top to bottom at once). places are by
      // what each item shows, so it is the same whatever its art's origin.
      private function flipSet(param1:Array, param2:int) : void
      {
         var _loc3_:Array = [];
         var _loc4_:Rectangle = null;
         var _loc5_:DenStateItem = null;
         var _loc6_:Rectangle = null;
         var _loc7_:Rectangle = null;
         var _loc8_:int = 0;
         var _loc9_:Number = NaN;
         var _loc10_:Number = NaN;
         for each(_loc5_ in param1)
         {
            _loc6_ = shownBounds(_loc5_);
            _loc3_.push(_loc6_);
            if(_loc6_ != null)
            {
               _loc4_ = _loc4_ == null ? _loc6_.clone() : _loc4_.union(_loc6_);
            }
         }
         while(_loc8_ < param1.length)
         {
            _loc5_ = param1[_loc8_];
            _loc6_ = _loc3_[_loc8_];
            _loc5_.flipped ^= param2;
            setItemMatrix(_loc5_,_loc5_.x,_loc5_.y,_loc5_.flipped);
            _loc7_ = shownBounds(_loc5_);
            if(_loc4_ != null && _loc6_ != null && _loc7_ != null)
            {
               // where its left (and top) edge goes, mirrored about the middle
               _loc9_ = _loc4_.x + _loc4_.right - _loc6_.right - _loc7_.x;
               _loc10_ = param2 == 2 ? _loc4_.y + _loc4_.bottom - _loc6_.bottom - _loc7_.y : _loc6_.y - _loc7_.y;
               setItemMatrix(_loc5_,_loc5_.x + _loc9_,_loc5_.y + _loc10_,_loc5_.flipped);
            }
            _loc8_++;
         }
         setBtnPos(_dragItem.x + _dragItem.denItemHelper.contentWidth - 30,_dragItem.y);
         changed();
      }

      // what the item shows, where its place (x, y) is counted
      private function shownBounds(param1:DenStateItem) : Rectangle
      {
         var _loc2_:DisplayObject = param1.denItemHelper ? param1.denItemHelper.displayObject : null;
         if(_loc2_ == null || _loc2_.parent == null)
         {
            return null;
         }
         var _loc3_:Rectangle = _loc2_.getBounds(_loc2_.parent);
         return _loc3_.width > 0 || _loc3_.height > 0 ? _loc3_ : null;
      }
      
      private function onLinkBtn(param1:MouseEvent) : void
      {
         param1.stopPropagation();
         if(_dragItem)
         {
            BuddyList.buildInWorldBuddyList(_linkBtn,_dragItem,onSelectUserToLink,_dragItem.userNameLink);
         }
      }
      
      private function onSelectUserToLink(param1:String) : void
      {
         if(_dragItem)
         {
            _dragItem.userNameLink = param1;
            if(_dragItem.denItemHelper && _dragItem.denItemHelper.content && _dragItem.denItemHelper.content.hasOwnProperty("active"))
            {
               if(param1 != "")
               {
                  Object(_dragItem.denItemHelper.content).active(true);
               }
               else
               {
                  Object(_dragItem.denItemHelper.content).active(false);
               }
            }
         }
      }
      
      private function isInInitList(param1:int, param2:int) : Boolean
      {
         var _loc3_:int = 0;
         _loc3_ = 0;
         while(_loc3_ < _itemsInit.length)
         {
            if(_itemsInit.getDenStateItem(_loc3_).refId == param2 && _itemsInit.getDenStateItem(_loc3_).invIdx == param1)
            {
               return true;
            }
            _loc3_++;
         }
         return false;
      }
      
      private function releaseItem(param1:DenStateItem, param2:Boolean = true) : void
      {
         dropPick(param1);
         if(_preview == param1)
         {
            _preview = null;
         }
         var _loc3_:int = _currItems.getCoreArray().indexOf(param1);
         if(_loc3_ >= 0)
         {
            _currItems.getCoreArray().splice(_loc3_,1);
            if(param1.defId)
            {
               if(param1.denItemHelper.displayObject.parent)
               {
                  param1.denItemHelper.displayObject.parent.removeChild(param1.denItemHelper.displayObject);
               }
               if(param1.denItemHelper.minigameDefId > 0 || param1.denItemHelper.listLauncherId > 0 || param1.denItemHelper.uniqueImageId != "")
               {
                  removeListenersFromItem(param1.denItemHelper);
               }
               else if(param1.specialType == 1)
               {
                  removePortalListenersFromItem(param1.denItemHelper);
               }
               else if(param1.defId == 3192 || param1.defId == 3193 || param1.defId == 3250 || param1.defId == 3585)
               {
                  removeListenersFromItem(param1.denItemHelper);
               }
               else if(param1.defId >= 3312 && param1.defId <= 3319)
               {
                  removeListenersFromItem(param1.denItemHelper);
               }
               else if(RoomManagerWorld.instance.isMyDen)
               {
                  if(param1.defId == 3216)
                  {
                     removeListenersFromItem(param1.denItemHelper);
                  }
                  else if(param1.specialType == 4)
                  {
                     removeListenersFromItem(param1.denItemHelper);
                     if(param1.mannequinData && !param2)
                     {
                        param1.mannequinData.removeItems();
                     }
                  }
               }
               else if(param1.specialType == 5)
               {
                  removeListenersFromItem(param1.denItemHelper);
               }
               if(param1.specialType == 1)
               {
                  removePortalListenersFromItem(param1.denItemHelper);
                  _lastItemInvId = -1;
                  _itemToEnterInvId = -1;
               }
               if(_itemRadiusBmpData)
               {
                  _itemRadiusBmpData.dispose();
                  _itemRadiusBmpData = null;
               }
            }
         }
         if(!param2)
         {
            _loc3_ = 0;
            while(_loc3_ < _itemsInit.length)
            {
               if(_itemsInit.getDenStateItem(_loc3_).invIdx == param1.invIdx)
               {
                  _itemsInit.getCoreArray().splice(_loc3_,1);
                  break;
               }
               _loc3_++;
            }
         }
         _lastSelectedItem = null;
         changed();
      }

      private function setItemMatrix(param1:DenStateItem, param2:Number, param3:Number, param4:int) : void
      {
         var _loc14_:Sprite = null;
         var _loc10_:Loader = null;
         var _loc13_:MovieClip = null;
         var _loc11_:Matrix = null;
         var _loc12_:Number = NaN;
         var _loc8_:Number = NaN;
         var _loc5_:DisplayObject = param1.denItemHelper.displayObject;
         param1.x = param2;
         param1.y = param3;
         // its width and height read as the art's own, not as a size (or
         // flip) last given made them
         _loc5_.transform.matrix = new Matrix();
         _loc5_.rotation = 0;
         var _loc15_:Number = sizeOf(param4);
         if(_loc15_ != 1 && !param1.denItemHelper.bFlipLabel && !param1.denItemHelper.isUniqueImageItem && !BitUtility.isBitSetForNumber(1,param4))
         {
            // bigger, about the middle of its bottom edge (where it stands),
            // mirrored when flipped: (param2, param3) is where its unsized
            // art's origin goes
            var _loc16_:Rectangle = _loc5_.getBounds(_loc5_);
            var _loc17_:Number = param2 + _loc16_.x + _loc16_.width * 0.5;
            var _loc18_:Number = param3 + _loc16_.bottom;
            var _loc19_:Boolean = BitUtility.isBitSetForNumber(0,param4);
            var _loc20_:Matrix = new Matrix();
            _loc20_.scale(_loc19_ ? -_loc15_ : _loc15_,_loc15_);
            _loc20_.translate(_loc17_ - _loc16_.width * _loc15_ * 0.5 + (_loc19_ ? _loc15_ * _loc16_.right : -_loc15_ * _loc16_.x),_loc18_ - _loc15_ * _loc16_.bottom);
            _loc5_.transform.matrix = _loc20_;
            return;
         }
         var _loc9_:Matrix = _loc5_.transform.matrix;
         _loc9_.identity();
         var _loc6_:Number = param2;
         var _loc7_:Number = param3;
         if(param1.denItemHelper.bFlipLabel)
         {
            _loc14_ = _loc5_ as Sprite;
            _loc10_ = _loc14_.getChildAt(0) as Loader;
            _loc13_ = _loc10_.content as MovieClip;
            _loc13_.gotoAndStop(BitUtility.isBitSetForNumber(0,param4) ? "flip" : 1);
            if(BitUtility.isBitSetForNumber(1,param4))
            {
               _loc7_ += _loc5_.height;
               _loc6_ += _loc5_.width;
            }
         }
         // the flips (bit 31, a smaller size, makes the value below 0)
         else if((param4 & 3) != 0)
         {
            if(BitUtility.isBitSetForNumber(0,param4))
            {
               _loc6_ += _loc5_.width;
            }
            if(BitUtility.isBitSetForNumber(1,param4))
            {
               if(param1.denItemHelper.isUniqueImageItem)
               {
                  _loc7_ += _loc5_.height * 0.8;
                  if(!BitUtility.isBitSetForNumber(0,param4))
                  {
                     _loc6_ += _loc5_.width;
                  }
                  else
                  {
                     _loc6_ -= _loc5_.width;
                  }
               }
               else
               {
                  _loc7_ += _loc5_.height;
                  if(!BitUtility.isBitSetForNumber(0,param4))
                  {
                     _loc6_ += _loc5_.width;
                  }
                  else
                  {
                     _loc6_ -= _loc5_.width;
                  }
               }
            }
            _loc9_.scale(BitUtility.isBitSetForNumber(0,param4) ? -1 : 1,1);
         }
         if(param1.denItemHelper.isUniqueImageItem)
         {
            _loc11_ = Object(param1.denItemHelper.content).item1.imageCont.transform.matrix;
            _loc12_ = Math.abs(_loc11_.b);
            _loc8_ = Math.abs(_loc11_.a);
            _loc11_.a = 1;
            _loc11_.b = 1;
            _loc11_.a = BitUtility.isBitSetForNumber(0,param4) ? -1 : 1;
            _loc11_.b = BitUtility.isBitSetForNumber(0,param4) ? -1 : 1;
            _loc11_.a *= _loc8_;
            _loc11_.b *= _loc12_;
            Object(param1.denItemHelper.content).item1.imageCont.transform.matrix = _loc11_;
         }
         // Burrow: in a browser the upside-down turn goes into the matrix.
         // Ruffle reads a mirrored matrix back as turned 180, so setting
         // rotation after it (below) made "side" upside down and "up + side"
         // only mirrored. turning 180 about the origin, as Flash's rotation
         // does there, is all four of a, b, c, d negated.
         if(SwfImports.active)
         {
            if(BitUtility.isBitSetForNumber(1,param4))
            {
               _loc9_.a = -_loc9_.a;
               _loc9_.b = -_loc9_.b;
               _loc9_.c = -_loc9_.c;
               _loc9_.d = -_loc9_.d;
            }
            _loc9_.translate(_loc6_,_loc7_);
            _loc5_.transform.matrix = _loc9_;
            return;
         }
         _loc9_.translate(_loc6_,_loc7_);
         _loc5_.transform.matrix = _loc9_;
         if(BitUtility.isBitSetForNumber(1,param4))
         {
            _loc5_.rotation = 180;
         }
         else
         {
            _loc5_.rotation = 0;
         }
      }
      
      // ---- groups, locks, player depth and layer order ----
      public static function depthOf(param1:int) : int
      {
         return param1 >> 2 & 3;
      }

      // an item's size: its place in SIZES, and how many times
      public static function sizeIndexOf(param1:int) : int
      {
         return (param1 >> SIZE_SHIFT & 3) | ((param1 & SIZE_HIGH) != 0 ? 4 : 0);
      }

      public static function sizeOf(param1:int) : Number
      {
         return SIZES[sizeIndexOf(param1)];
      }

      // the size button's text: smaller on its left, bigger on its right
      private static function sizeLabel(param1:int) : String
      {
         return "-   " + SIZE_LABELS[param1] + "   +";
      }

      // what can be made bigger or smaller: not wallpapers and floors (they fit the
      // den), nor items the game draws by labels of their own (flip frames,
      // paintings)
      private function sizable(param1:DenStateItem) : Boolean
      {
         return param1 != null && param1.sortCatId != 2 && param1.sortCatId != 3 && param1.sortCatId != 4 && param1.denItemHelper != null
            && !param1.denItemHelper.bFlipLabel && !param1.denItemHelper.isUniqueImageItem;
      }

      // the items' size made SIZES[param2] (0-7), each from the point it stands on
      public function setSize(param1:Array, param2:int) : void
      {
         for each(var _loc3_:DenStateItem in param1)
         {
            if(sizable(_loc3_) && !isLocked(_loc3_))
            {
               _loc3_.flipped = _loc3_.flipped & ~SIZE_MASK & ~SIZE_HIGH | (param2 & 3) << SIZE_SHIFT | ((param2 & 4) != 0 ? SIZE_HIGH : 0);
               setItemMatrix(_loc3_,_loc3_.x,_loc3_.y,_loc3_.flipped);
               resort(_loc3_);
            }
         }
         updateCloseBtn();
         changed();
      }

      public static function nudgeOf(param1:int) : int
      {
         var _loc2_:int = param1 >> NUDGE_SHIFT & 32767;
         return _loc2_ >= 16384 ? _loc2_ - 32768 : _loc2_;
      }

      public static function withNudge(param1:int, param2:int) : int
      {
         param2 = Math.max(-MAX_NUDGE,Math.min(MAX_NUDGE,param2));
         return param1 & ~NUDGE_MASK | (param2 & 32767) << NUDGE_SHIFT;
      }

      // the flip value with no group, lock or one-by-one (a prefab's items)
      public static function plainFlip(param1:int) : int
      {
         return param1 & ~(GROUP_MASK | LOCK_BIT | LOOSE_BIT);
      }

      // and put in group `param2` (0: none)
      public static function inGroup(param1:int, param2:int) : int
      {
         return plainFlip(param1) | (param2 & 255) << GROUP_SHIFT;
      }

      private function groupOf(param1:DenStateItem) : int
      {
         return param1.flipped >> GROUP_SHIFT & 255;
      }

      private function isLocked(param1:DenStateItem) : Boolean
      {
         return param1 != null && (param1.flipped & LOCK_BIT) != 0;
      }

      private function isLoose(param1:DenStateItem) : Boolean
      {
         return param1 != null && groupOf(param1) != 0 && (param1.flipped & LOOSE_BIT) != 0;
      }

      // what may be picked, grouped and locked: not the den's theme or music
      private function groupable(param1:DenStateItem) : Boolean
      {
         return param1 != null && !isTheme(param1.sortCatId) && param1.sortCatId != 4 && param1.petItem == null && param1.denItemHelper != null && param1.denItemHelper.displayObject != null;
      }

      // the item and the rest of its group
      private function members(param1:DenStateItem) : Array
      {
         var _loc2_:int = groupOf(param1);
         if(_loc2_ == 0)
         {
            return [param1];
         }
         var _loc3_:Array = groupMembers(_loc2_);
         return _loc3_.length > 0 ? _loc3_ : [param1];
      }

      // what goes with the item when it is clicked: its group, or just it
      // when its group's items are chosen one by one
      private function unit(param1:DenStateItem) : Array
      {
         return isLoose(param1) ? [param1] : members(param1);
      }

      // the picked items, with the rest of their groups
      private function pickedSet() : Array
      {
         var _loc1_:Array = [];
         for each(var _loc2_:DenStateItem in _picked)
         {
            for each(var _loc3_:DenStateItem in unit(_loc2_))
            {
               if(_loc1_.indexOf(_loc3_) < 0)
               {
                  _loc1_.push(_loc3_);
               }
            }
         }
         return _loc1_;
      }

      // what moves (and locks) with this item: every picked item when it is
      // one of them, else its group (or just it)
      private function moveSet(param1:DenStateItem) : Array
      {
         if(!groupable(param1))
         {
            return [param1];
         }
         var _loc2_:Array = pickedSet();
         if(_loc2_.indexOf(param1) >= 0)
         {
            return _loc2_;
         }
         return unit(param1);
      }

      private function anyLocked(param1:Array) : Boolean
      {
         for each(var _loc2_:DenStateItem in param1)
         {
            if(isLocked(_loc2_))
            {
               return true;
            }
         }
         return false;
      }

      private function isPicked(param1:DenStateItem) : Boolean
      {
         return pickedSet().indexOf(param1) >= 0;
      }

      private function dropPick(param1:DenStateItem) : void
      {
         var _loc2_:int = int(_picked.indexOf(param1));
         if(_loc2_ >= 0)
         {
            _picked.splice(_loc2_,1);
         }
      }

      // the layers panel and the pick bar (gui.DenLayersPanel) listen
      private function changed() : void
      {
         dispatchEvent(new DenItemHolderEvent("OnLayersChanged"));
      }

      private function onStageMouseDown(param1:MouseEvent) : void
      {
         _shiftAtDown = param1.shiftKey;
      }

      private function onStageMouseUp(param1:MouseEvent) : void
      {
         _wasDown = false;
      }

      // the arrow keys move the chosen item (and what moves with it) a pixel,
      // ten with Shift; not while something is being typed
      private function onStageKeyDown(param1:KeyboardEvent) : void
      {
         if(param1.keyCode < 37 || param1.keyCode > 40 || _roomMode != 1 || !_sticky || _dragItem == null || _wasDown)
         {
            return;
         }
         var _loc2_:TextField = gMainFrame.stage.focus as TextField;
         if(_loc2_ != null && _loc2_.type == "input" && _loc2_.length > 0)
         {
            return;
         }
         var _loc3_:Array = moveSet(_dragItem);
         if(anyLocked(_loc3_))
         {
            return;
         }
         param1.stopImmediatePropagation();
         var _loc4_:Number = param1.shiftKey ? 10 : 1;
         var _loc5_:Number = param1.keyCode == 37 ? -_loc4_ : (param1.keyCode == 39 ? _loc4_ : 0);
         var _loc6_:Number = param1.keyCode == 38 ? -_loc4_ : (param1.keyCode == 40 ? _loc4_ : 0);
         for each(var _loc7_:DenStateItem in _loc3_)
         {
            setItemMatrix(_loc7_,_loc7_.x + _loc5_,_loc7_.y + _loc6_,_loc7_.flipped);
         }
         setBtnPos(_dragItem.x + _dragItem.denItemHelper.contentWidth - 30,_dragItem.y);
      }

      // items set out edge to edge, `param2` across, `param3` pixels apart,
      // in about the order they stand (by rows, top to bottom, then left to
      // right), from the top left of them all; then made one group. returns
      // the group (0: not done)
      public function arrangeGrid(param1:Array, param2:int, param3:Number = 0) : int
      {
         var _loc4_:Array = [];
         for each(var _loc5_:DenStateItem in param1)
         {
            if(groupable(_loc5_) && !isLocked(_loc5_) && _loc5_.denItemHelper && _loc5_.denItemHelper.displayObject && _loc4_.indexOf(_loc5_) < 0)
            {
               _loc4_.push(_loc5_);
            }
         }
         if(_loc4_.length < 2)
         {
            return 0;
         }
         var _loc6_:int = Math.max(1,Math.min(param2,_loc4_.length));
         var _loc7_:Number = 0;
         var _loc8_:Number = 0;
         var _loc9_:Number = Infinity;
         var _loc10_:Number = Infinity;
         for each(_loc5_ in _loc4_)
         {
            _loc7_ = Math.max(_loc7_,_loc5_.denItemHelper.contentWidth);
            _loc8_ = Math.max(_loc8_,_loc5_.denItemHelper.contentHeight);
            _loc9_ = Math.min(_loc9_,_loc5_.x);
            _loc10_ = Math.min(_loc10_,_loc5_.y);
         }
         _loc4_.sort(function(param1:DenStateItem, param2:DenStateItem):int
         {
            return param1.y < param2.y ? -1 : (param1.y > param2.y ? 1 : (param1.x < param2.x ? -1 : (param1.x > param2.x ? 1 : 0)));
         });
         var _loc11_:int = 0;
         while(_loc11_ < _loc4_.length)
         {
            var _loc12_:Array = _loc4_.slice(_loc11_,_loc11_ + _loc6_);
            _loc12_.sort(function(param1:DenStateItem, param2:DenStateItem):int
            {
               return param1.x < param2.x ? -1 : (param1.x > param2.x ? 1 : 0);
            });
            var _loc13_:int = _loc11_ / _loc6_;
            var _loc14_:int = 0;
            while(_loc14_ < _loc12_.length)
            {
               var _loc15_:DenStateItem = _loc12_[_loc14_];
               setItemMatrix(_loc15_,_loc9_ + _loc14_ * (_loc7_ + param3),_loc10_ + _loc13_ * (_loc8_ + param3),_loc15_.flipped);
               _loc14_++;
            }
            _loc11_ += _loc6_;
         }
         var _loc16_:int = makeGroup(_loc4_);
         if(_dragItem && _dragItem.denItemHelper)
         {
            setBtnPos(_dragItem.x + _dragItem.denItemHelper.contentWidth - 30,_dragItem.y);
         }
         changed();
         return _loc16_;
      }

      // the first moment of a press on the den: Shift picks (or unpicks) the
      // item and its group; a press on anything else drops the picks, and a
      // choice made in the layers panel.
      private function onPress(param1:Number, param2:Number) : void
      {
         _pressPicked = false;
         // a drag goes from here: a chosen item is kept while the mouse is
         // elsewhere, so the last point it had is old
         _dragPoint.x = param1;
         _dragPoint.y = param2;
         if(_sticky && !overControls(param1,param2) && hitTest(param1,param2) != _dragItem)
         {
            _sticky = false;
            _dragItem = hitTest(param1,param2);
            updateCloseBtn();
         }
         if(_shiftAtDown && groupable(_dragItem) && !isLocked(_dragItem))
         {
            var _loc3_:Array = unit(_dragItem);
            if(isPicked(_dragItem))
            {
               for each(var _loc4_:DenStateItem in _loc3_)
               {
                  dropPick(_loc4_);
               }
            }
            else
            {
               _picked.push(_dragItem);
            }
            _pressPicked = true;
            showGroupControls();
            refreshGlows();
            changed();
            return;
         }
         if(_picked.length > 0 && (_dragItem == null || !isPicked(_dragItem)))
         {
            _picked = [];
            showGroupControls();
            refreshGlows();
            changed();
         }
         // a click on an item keeps it chosen once the mouse leaves it, so
         // its colour and the rest can be changed in the layers panel
         if(_dragItem != null && !_sticky)
         {
            _sticky = true;
            updateCloseBtn();
            changed();
         }
      }

      // the mouse over a button by the item, or on the way to one over
      // nothing else: the item stays chosen
      private function overControls(param1:Number, param2:Number) : Boolean
      {
         var _loc5_:Rectangle = null;
         var _loc4_:Rectangle = null;
         if(_dragItem == null)
         {
            return false;
         }
         if(_dragItem.denItemHelper && _dragItem.denItemHelper.displayObject)
         {
            _loc5_ = _dragItem.denItemHelper.displayObject.getBounds(_layerManager.room_avatars);
         }
         for each(var _loc3_:DisplayObject in [_closeBtn,_flipBtn,_flipBtnVer,_linkBtn,_depthBtn,_sizeBtn,_ungroupBtn,_duplicateBtn,_lockBtn])
         {
            if(_loc3_.parent)
            {
               _loc4_ = _loc3_.getBounds(_layerManager.room_avatars);
               if(_loc4_.contains(param1,param2))
               {
                  return true;
               }
               _loc5_ = _loc5_ ? _loc5_.union(_loc4_) : _loc4_;
            }
         }
         if(_loc5_ == null)
         {
            return false;
         }
         _loc5_.inflate(6,6);
         return _loc5_.contains(param1,param2) && hitTest(param1,param2) == null;
      }

      // glows: white round the item under the mouse and what goes with it
      // (grey when locked), yellow round the picked ones, blue round the
      // one the mouse is over in the layers panel
      private function refreshGlows() : void
      {
         var _loc1_:DenStateItem = null;
         for each(_loc1_ in _glowing)
         {
            if(_loc1_.denItemHelper && _loc1_.denItemHelper.displayObject)
            {
               _loc1_.denItemHelper.displayObject.filters = [];
            }
         }
         _glowing = [];
         if(_roomMode != 1)
         {
            return;
         }
         for each(_loc1_ in pickedSet())
         {
            if(_loc1_.denItemHelper && _loc1_.denItemHelper.displayObject && _currItems.getCoreArray().indexOf(_loc1_) >= 0)
            {
               _loc1_.denItemHelper.displayObject.filters = [new GlowFilter(PICK_GLOW,1,10,10,6)];
               _glowing.push(_loc1_);
            }
         }
         if(_dragItem && _dragItem.denItemHelper && _dragItem.denItemHelper.displayObject)
         {
            for each(_loc1_ in unit(_dragItem))
            {
               if(_loc1_.denItemHelper && _loc1_.denItemHelper.displayObject)
               {
                  _loc1_.denItemHelper.displayObject.filters = [new GlowFilter(isLocked(_loc1_) ? 11184810 : 16777215,1,8,8,8)];
                  if(_glowing.indexOf(_loc1_) < 0)
                  {
                     _glowing.push(_loc1_);
                  }
               }
            }
         }
         if(_preview && _preview.denItemHelper && _preview.denItemHelper.displayObject && _currItems.getCoreArray().indexOf(_preview) >= 0)
         {
            _preview.denItemHelper.displayObject.filters = [new GlowFilter(PREVIEW_GLOW,1,12,12,6)];
            if(_glowing.indexOf(_preview) < 0)
            {
               _glowing.push(_preview);
            }
         }
      }

      // the buttons by an item, in the game's cream and brown
      private function makeGroupLabel(param1:String, param2:Number, param3:int, param4:uint) : TextField
      {
         var _loc5_:TextField = new TextField();
         _loc5_.width = param2;
         _loc5_.height = param3 + 8;
         _loc5_.selectable = false;
         _loc5_.mouseEnabled = false;
         _loc5_.embedFonts = AJClient.hasGameFont();
         _loc5_.defaultTextFormat = new TextFormat(_loc5_.embedFonts ? "CCDigitalDelivery" : "Arial",param3,param4,true,null,null,null,null,"center");
         _loc5_.text = param1;
         return _loc5_;
      }

      private function makeGroupButton(param1:String, param2:Function) : Sprite
      {
         var _loc3_:Sprite = new Sprite();
         _loc3_.buttonMode = true;
         _loc3_.mouseChildren = false;
         var _loc4_:TextField = makeGroupLabel(param1,BTN_W,12,BTN_TEXT);
         _loc4_.y = 3;
         _loc3_.addChild(_loc4_);
         drawGroupButton(_loc3_,false);
         _loc3_.addEventListener("mouseDown",param2,false,0,true);
         return _loc3_;
      }

      private function drawGroupButton(param1:Sprite, param2:Boolean) : void
      {
         var _loc3_:Matrix = new Matrix();
         _loc3_.createGradientBox(BTN_W,24,Math.PI / 2);
         param1.graphics.clear();
         param1.graphics.beginFill(0,0.25);
         param1.graphics.drawRoundRect(0,2,BTN_W,24,22,22);
         param1.graphics.endFill();
         param1.graphics.lineStyle(2,BTN_EDGE);
         param1.graphics.beginGradientFill("linear",param2 ? [16772744,15905862] : [16773836,15258010],[1,1],[0,255],_loc3_);
         param1.graphics.drawRoundRect(0,0,BTN_W,24,22,22);
         param1.graphics.endFill();
      }

      private function setGroupButtonText(param1:Sprite, param2:String, param3:Boolean = false) : void
      {
         TextField(param1.getChildAt(0)).text = param2;
         drawGroupButton(param1,param3);
      }

      private function hideGroupControls() : void
      {
         for each(var _loc1_:DisplayObject in [_depthBtn,_sizeBtn,_ungroupBtn,_duplicateBtn,_lockBtn,_pickHint])
         {
            if(_loc1_.parent)
            {
               _loc1_.parent.removeChild(_loc1_);
            }
         }
      }

      // which buttons the chosen item gets: its player depth, its lock, and
      // Ungroup when it is in a group. a locked one gets Unlock only.
      private function showGroupControls() : void
      {
         hideGroupControls();
         if(_dragItem == null || !groupable(_dragItem) || !_layerManager.room_chat || _roomMode != 1)
         {
            return;
         }
         var _loc1_:Array = pickedSet();
         if(!isLocked(_dragItem))
         {
            setGroupButtonText(_depthBtn,DEPTH_LABELS[depthOf(_dragItem.flipped)],depthOf(_dragItem.flipped) != DEPTH_AUTO);
            _layerManager.room_chat.addChild(_depthBtn);
            if(sizable(_dragItem))
            {
               setGroupButtonText(_sizeBtn,sizeLabel(sizeIndexOf(_dragItem.flipped)),sizeIndexOf(_dragItem.flipped) != 0);
               _layerManager.room_chat.addChild(_sizeBtn);
            }
         }
         setGroupButtonText(_lockBtn,isLocked(_dragItem) ? "Unlock" : "Lock",isLocked(_dragItem));
         _layerManager.room_chat.addChild(_lockBtn);
         if(groupOf(_dragItem) != 0 && !isLocked(_dragItem))
         {
            _layerManager.room_chat.addChild(_ungroupBtn);
         }
         if(!isLocked(_dragItem) && onDuplicate != null)
         {
            _layerManager.room_chat.addChild(_duplicateBtn);
         }
         if(_loc1_.length == 0)
         {
            _layerManager.room_chat.addChild(_pickHint);
         }
         placeGroupControls(_closeBtn.x,_closeBtn.y);
      }

      private function placeGroupControls(param1:Number, param2:Number) : void
      {
         var _loc3_:Number = param2;
         for each(var _loc4_:DisplayObject in [_depthBtn,_sizeBtn,_lockBtn,_ungroupBtn,_duplicateBtn,_pickHint])
         {
            if(_loc4_.parent)
            {
               _loc4_.x = param1 + 52;
               _loc4_.y = _loc3_ - 12;
               _loc3_ += 29;
            }
         }
      }

      // a group number no item in the den has
      private function freeGroup() : int
      {
         var _loc1_:Object = {};
         for each(var _loc2_:DenStateItem in _currItems.getCoreArray())
         {
            _loc1_[groupOf(_loc2_)] = true;
         }
         var _loc3_:int = 1;
         while(_loc3_ < 255 && _loc1_[_loc3_])
         {
            _loc3_++;
         }
         return _loc3_;
      }

      private function setGroup(param1:DenStateItem, param2:int) : void
      {
         param1.flipped = param1.flipped & ~GROUP_MASK | (param2 & 255) << GROUP_SHIFT;
         if(param2 == 0)
         {
            param1.flipped &= ~LOOSE_BIT;
         }
      }

      // its left end makes it a size smaller, its right end a size bigger
      // (0.25x up to 3x), its middle the size it was made
      private function onSizeBtn(param1:MouseEvent) : void
      {
         param1.stopPropagation();
         if(_dragItem == null || isLocked(_dragItem) || !sizable(_dragItem))
         {
            return;
         }
         var _loc2_:int = SIZE_STEPS.indexOf(sizeIndexOf(_dragItem.flipped));
         var _loc3_:Number = _sizeBtn.mouseX;
         if(_loc3_ < BTN_W * 0.33)
         {
            _loc2_ = Math.max(0,_loc2_ - 1);
         }
         else if(_loc3_ > BTN_W * 0.67)
         {
            _loc2_ = Math.min(SIZE_STEPS.length - 1,_loc2_ + 1);
         }
         else
         {
            _loc2_ = SIZE_STEPS.indexOf(0);
         }
         setSize(moveSet(_dragItem),SIZE_STEPS[_loc2_]);
         showGroupControls();
      }

      private function onDepthBtn(param1:MouseEvent) : void
      {
         param1.stopPropagation();
         if(_dragItem == null || isLocked(_dragItem))
         {
            return;
         }
         setDepth(moveSet(_dragItem),(depthOf(_dragItem.flipped) + 1) % 3);
      }

      // the item, its group or every picked item, copied beside them
      private function onDuplicateBtn(param1:MouseEvent) : void
      {
         param1.stopPropagation();
         if(_dragItem == null || isLocked(_dragItem) || onDuplicate == null)
         {
            return;
         }
         onDuplicate(moveSet(_dragItem));
      }

      private function onUngroupBtn(param1:MouseEvent) : void
      {
         param1.stopPropagation();
         if(_dragItem == null)
         {
            return;
         }
         ungroup(groupOf(_dragItem));
      }

      // the item, its group or every picked item. a locked item can only be
      // chosen from the layers panel after this, so it stays chosen for now.
      private function onLockBtn(param1:MouseEvent) : void
      {
         param1.stopPropagation();
         if(_dragItem == null)
         {
            return;
         }
         var _loc2_:DenStateItem = _dragItem;
         setLocked(moveSet(_loc2_),!isLocked(_loc2_));
         _dragItem = _loc2_;
         _sticky = true;
         updateCloseBtn();
      }

      private function resort(param1:DenStateItem) : void
      {
         var _loc2_:DisplayObject = param1.denItemHelper ? param1.denItemHelper.displayObject : null;
         if(_loc2_ != null && !isFloorItem(param1))
         {
            _loc2_.name = String(param1.denItemHelper.sortOffset);
         }
      }

      // ---- for the layers panel (gui.DenLayersPanel) and prefabs ----

      // what the layers panel lists: every item standing in the den but
      // its wallpaper, floor and music
      // every item in the den, loaded or still loading
      public function get placedItems() : Array
      {
         return _currItems.getCoreArray().concat();
      }

      public function get layerItems() : Array
      {
         var _loc1_:Array = [];
         for each(var _loc2_:DenStateItem in _currItems.getCoreArray())
         {
            if(!isTheme(_loc2_.sortCatId) && _loc2_.sortCatId != 4 && _loc2_.denItemHelper && _loc2_.denItemHelper.displayObject)
            {
               _loc1_.push(_loc2_);
            }
         }
         return _loc1_;
      }

      public function get inEditMode() : Boolean
      {
         return _roomMode == 1;
      }

      // a rug and the like: under everything, in an order of their own
      public function isFloorItem(param1:DenStateItem) : Boolean
      {
         return param1.layerId == 1;
      }

      // how far in front the room draws it: higher is further in front
      public function depthKey(param1:DenStateItem) : Number
      {
         var _loc2_:DisplayObject = param1.denItemHelper.displayObject;
         if(isFloorItem(param1))
         {
            return _loc2_.parent ? _loc2_.parent.getChildIndex(_loc2_) : 0;
         }
         var _loc3_:Number = Number(_loc2_.name);
         return _loc2_.getBounds(_loc2_.parent ? _loc2_.parent : _layerManager.room_avatars).bottom - (isNaN(_loc3_) ? 0 : _loc3_);
      }

      public function groupIdOf(param1:DenStateItem) : int
      {
         return groupOf(param1);
      }

      public function lockedItem(param1:DenStateItem) : Boolean
      {
         return isLocked(param1);
      }

      public function canGroup(param1:DenStateItem) : Boolean
      {
         return groupable(param1);
      }

      public function groupMembers(param1:int) : Array
      {
         var _loc2_:Array = [];
         if(param1 == 0)
         {
            return _loc2_;
         }
         for each(var _loc3_:DenStateItem in _currItems.getCoreArray())
         {
            if(groupOf(_loc3_) == param1 && groupable(_loc3_))
            {
               _loc2_.push(_loc3_);
            }
         }
         return _loc2_;
      }

      // is the group's every item chosen as the group?
      public function groupSelectsAsOne(param1:int) : Boolean
      {
         for each(var _loc2_:DenStateItem in groupMembers(param1))
         {
            if(isLoose(_loc2_))
            {
               return false;
            }
         }
         return true;
      }

      public function get selectedItem() : DenStateItem
      {
         return _dragItem;
      }

      public function get pickedItems() : Array
      {
         return pickedSet();
      }

      public function isPickedItem(param1:DenStateItem) : Boolean
      {
         return isPicked(param1);
      }

      // chosen in the layers panel: it stays chosen (its buttons by it)
      // till the mouse goes to another item in the room or the room is
      // clicked. a locked item can be chosen only so.
      public function selectItem(param1:DenStateItem) : void
      {
         if(_roomMode != 1 || param1 == null || _currItems.getCoreArray().indexOf(param1) < 0)
         {
            return;
         }
         _dragItem = param1;
         _sticky = true;
         updateCloseBtn();
         changed();
      }

      public function togglePick(param1:DenStateItem) : void
      {
         if(!groupable(param1) || isLocked(param1))
         {
            return;
         }
         if(isPicked(param1))
         {
            for each(var _loc2_:DenStateItem in unit(param1))
            {
               dropPick(_loc2_);
            }
         }
         else
         {
            _picked.push(param1);
         }
         showGroupControls();
         refreshGlows();
         changed();
      }

      // every item of a group picked, however its items are chosen
      public function pickGroup(param1:int) : void
      {
         _picked = groupMembers(param1);
         if(_picked.length > 0)
         {
            _dragItem = _picked[0];
            _sticky = true;
         }
         updateCloseBtn();
         changed();
      }

      public function setPicked(param1:Array) : void
      {
         _picked = [];
         for each(var _loc2_:DenStateItem in param1)
         {
            if(groupable(_loc2_) && _currItems.getCoreArray().indexOf(_loc2_) >= 0)
            {
               _picked.push(_loc2_);
            }
         }
         updateCloseBtn();
         changed();
      }

      public function clearPicks() : void
      {
         _picked = [];
         updateCloseBtn();
         changed();
      }

      // the item the mouse is over in the layers panel (or null)
      public function setPreview(param1:DenStateItem) : void
      {
         if(_preview != param1)
         {
            _preview = param1;
            refreshGlows();
         }
      }

      public function setLocked(param1:Array, param2:Boolean) : void
      {
         for each(var _loc3_:DenStateItem in param1)
         {
            if(groupable(_loc3_))
            {
               _loc3_.flipped = param2 ? _loc3_.flipped | LOCK_BIT : _loc3_.flipped & ~LOCK_BIT;
               if(param2)
               {
                  dropPick(_loc3_);
               }
            }
         }
         updateCloseBtn();
         changed();
      }

      public function setDepth(param1:Array, param2:int) : void
      {
         for each(var _loc3_:DenStateItem in param1)
         {
            if(groupable(_loc3_) && !isFloorItem(_loc3_) && !isLocked(_loc3_))
            {
               _loc3_.flipped = _loc3_.flipped & ~DEPTH_MASK | (param2 & 3) << 2;
               resort(_loc3_);
            }
         }
         updateCloseBtn();
         changed();
      }

      // the items made a new group (from whatever groups they were in).
      // locked if any of them was. returns the group, or 0.
      public function makeGroup(param1:Array) : int
      {
         var _loc2_:Array = [];
         for each(var _loc3_:DenStateItem in param1)
         {
            if(groupable(_loc3_) && _loc2_.indexOf(_loc3_) < 0)
            {
               _loc2_.push(_loc3_);
            }
         }
         if(_loc2_.length < 2)
         {
            return 0;
         }
         var _loc4_:int = freeGroup();
         var _loc5_:Boolean = anyLocked(_loc2_);
         for each(_loc3_ in _loc2_)
         {
            setGroup(_loc3_,_loc4_);
            _loc3_.flipped &= ~LOOSE_BIT;
            _loc3_.flipped = _loc5_ ? _loc3_.flipped | LOCK_BIT : _loc3_.flipped & ~LOCK_BIT;
         }
         _picked = [];
         updateCloseBtn();
         changed();
         return _loc4_;
      }

      public function ungroup(param1:int) : void
      {
         for each(var _loc2_:DenStateItem in groupMembers(param1))
         {
            setGroup(_loc2_,0);
            dropPick(_loc2_);
         }
         updateCloseBtn();
         changed();
      }

      // one item into a group (0: out of its group). it takes on the
      // group's lock and how its items are chosen. a group of one is no
      // group: its last item leaves it too.
      public function setItemGroup(param1:DenStateItem, param2:int) : void
      {
         if(!groupable(param1) || groupOf(param1) == param2)
         {
            return;
         }
         var _loc3_:int = groupOf(param1);
         var _loc4_:Array = groupMembers(param2);
         setGroup(param1,param2);
         if(_loc4_.length > 0)
         {
            param1.flipped = isLocked(_loc4_[0]) ? param1.flipped | LOCK_BIT : param1.flipped & ~LOCK_BIT;
            param1.flipped = isLoose(_loc4_[0]) ? param1.flipped | LOOSE_BIT : param1.flipped & ~LOOSE_BIT;
         }
         if(_loc3_ != 0 && groupMembers(_loc3_).length == 1)
         {
            setGroup(groupMembers(_loc3_)[0],0);
         }
         updateCloseBtn();
         changed();
      }

      // the group's items chosen as one (true) or one by one
      public function setGroupSelectsAsOne(param1:int, param2:Boolean) : void
      {
         for each(var _loc3_:DenStateItem in groupMembers(param1))
         {
            _loc3_.flipped = param2 ? _loc3_.flipped & ~LOOSE_BIT : _loc3_.flipped | LOOSE_BIT;
         }
         updateCloseBtn();
         changed();
      }

      // the layers panel's order for one band of items: `param1` the band's
      // items front first as the panel now shows them, `param2` the ones
      // dragged there, `param3` the band's player depth (or -1, the floor).
      // the dragged ones are nudged in between their new neighbours; the
      // ones in front of them only as much as it takes to stay in front.
      public function applyOrder(param1:Array, param2:Array, param3:int) : void
      {
         var _loc4_:DenStateItem = null;
         var _loc5_:int = 0;
         var _loc6_:int = param1.length;
         if(param3 == -1)
         {
            applyFloorOrder(param1);
            changed();
            return;
         }
         for each(_loc4_ in param2)
         {
            if(groupable(_loc4_) && !isFloorItem(_loc4_) && !isLocked(_loc4_))
            {
               _loc4_.flipped = _loc4_.flipped & ~DEPTH_MASK | (param3 & 3) << 2;
               resort(_loc4_);
            }
         }
         var _loc7_:Array = [];
         var _loc8_:Array = [];
         _loc5_ = 0;
         while(_loc5_ < _loc6_)
         {
            _loc4_ = param1[_loc5_];
            _loc8_[_loc5_] = depthKey(_loc4_);
            _loc7_[_loc5_] = _loc8_[_loc5_] - nudgeOf(_loc4_.flipped);
            _loc5_++;
         }
         var _loc9_:Number = -Infinity;
         _loc5_ = _loc6_ - 1;
         while(_loc5_ >= 0)
         {
            _loc4_ = param1[_loc5_];
            var _loc10_:Number = _loc8_[_loc5_];
            if(param2.indexOf(_loc4_) >= 0)
            {
               // the run of dragged ones this starts, and what is in front of it
               var _loc11_:int = _loc5_;
               while(_loc11_ > 0 && param2.indexOf(param1[_loc11_ - 1]) >= 0)
               {
                  _loc11_--;
               }
               var _loc12_:int = _loc5_ - _loc11_ + 1;
               var _loc13_:int = _loc5_ - _loc11_;
               var _loc14_:Number = _loc11_ > 0 ? Number(_loc8_[_loc11_ - 1]) : Infinity;
               if(_loc9_ == -Infinity && _loc14_ == Infinity)
               {
                  _loc10_ = Math.max(_loc7_[_loc5_],_loc9_ + 1);
               }
               else if(_loc9_ == -Infinity)
               {
                  _loc10_ = _loc14_ - 2 * (_loc13_ + 1);
               }
               else if(_loc14_ == Infinity || _loc14_ - _loc9_ < _loc12_ + 1)
               {
                  _loc10_ = _loc9_ + 2;
               }
               else
               {
                  _loc10_ = _loc9_ + (_loc14_ - _loc9_) / (_loc12_ + 1);
               }
            }
            if(_loc10_ <= _loc9_)
            {
               _loc10_ = _loc9_ + 1;
            }
            if(_loc10_ != _loc8_[_loc5_] && !isLocked(_loc4_))
            {
               _loc4_.flipped = withNudge(_loc4_.flipped,Math.ceil(_loc10_ - _loc7_[_loc5_]));
               resort(_loc4_);
               _loc10_ = _loc7_[_loc5_] + nudgeOf(_loc4_.flipped);
            }
            _loc8_[_loc5_] = _loc10_;
            _loc9_ = _loc10_;
            _loc5_--;
         }
         changed();
      }

      // floor items front first: each kept its place among them as its nudge
      private function applyFloorOrder(param1:Array) : void
      {
         var _loc2_:Array = [];
         var _loc3_:DisplayObject = null;
         var _loc4_:int = 0;
         var _loc5_:int = param1.length;
         var _loc6_:Sprite = _layerManager.room_bkg_main;
         for each(var _loc7_:DenStateItem in param1)
         {
            _loc3_ = _loc7_.denItemHelper.displayObject;
            if(_loc3_.parent != _loc6_)
            {
               return;
            }
            _loc2_.push(_loc6_.getChildIndex(_loc3_));
         }
         _loc2_.sort(16);
         _loc4_ = 0;
         while(_loc4_ < _loc5_)
         {
            _loc7_ = param1[_loc4_];
            if(!isLocked(_loc7_))
            {
               _loc7_.flipped = withNudge(_loc7_.flipped,_loc5_ - _loc4_);
            }
            _loc6_.removeChild(_loc7_.denItemHelper.displayObject);
            _loc4_++;
         }
         _loc4_ = 0;
         while(_loc4_ < _loc5_)
         {
            _loc6_.addChildAt(DenStateItem(param1[_loc5_ - 1 - _loc4_]).denItemHelper.displayObject,_loc2_[_loc4_]);
            _loc4_++;
         }
      }

      // a floor item put down: in its place among the others (by nudge)
      private function addFloorItem(param1:DenStateItem, param2:DisplayObject) : void
      {
         var _loc3_:Sprite = _layerManager.room_bkg_main;
         var _loc4_:int = -1;
         var _loc5_:int = nudgeOf(param1.flipped);
         for each(var _loc6_:DenStateItem in _currItems.getCoreArray())
         {
            if(_loc6_ != param1 && isFloorItem(_loc6_) && _loc6_.denItemHelper && _loc6_.denItemHelper.displayObject && _loc6_.denItemHelper.displayObject.parent == _loc3_ && nudgeOf(_loc6_.flipped) > _loc5_)
            {
               var _loc7_:int = _loc3_.getChildIndex(_loc6_.denItemHelper.displayObject);
               if(_loc4_ < 0 || _loc7_ < _loc4_)
               {
                  _loc4_ = _loc7_;
               }
            }
         }
         if(param2.parent == _loc3_)
         {
            _loc3_.removeChild(param2);
         }
         if(_loc4_ >= 0 && _loc5_ != 0)
         {
            _loc3_.addChildAt(param2,Math.min(_loc4_,_loc3_.numChildren));
         }
         else
         {
            _loc3_.addChild(param2);
         }
      }

      // the item (and what goes with it) brought to the middle of the
      // screen: for one that is out of sight
      public function bringToView(param1:DenStateItem) : void
      {
         var _loc2_:Array = moveSet(param1);
         if(anyLocked(_loc2_) || param1.denItemHelper == null)
         {
            return;
         }
         var _loc3_:Point = RoomManagerWorld.instance.convertScreenToWorldSpace(450,250);
         var _loc4_:Number = _loc3_.x - (param1.x + param1.denItemHelper.contentWidth * 0.5);
         var _loc5_:Number = _loc3_.y - (param1.y + param1.denItemHelper.contentHeight * 0.5);
         for each(var _loc6_:DenStateItem in _loc2_)
         {
            setItemMatrix(_loc6_,_loc6_.x + _loc4_,_loc6_.y + _loc5_,_loc6_.flipped);
         }
         _dragItem = param1;
         _sticky = true;
         setBtnPos(param1.x + param1.denItemHelper.contentWidth - 30,param1.y);
         updateCloseBtn();
         changed();
      }

      // the colours the item's art has (null or one: it has no others)
      public function versionsOf(param1:DenStateItem) : Array
      {
         return param1 && param1.denItemHelper && param1.petItem == null && param1.uniqueImageId == "" ? param1.denItemHelper.getVersions() : null;
      }

      // the server changed an item's colour (DenXtCommManager "dvc")
      public function setItemVersion(param1:int, param2:int) : void
      {
         for each(var _loc3_:DenStateItem in _currItems.getCoreArray())
         {
            if(_loc3_.invIdx == param1 && _loc3_.petItem == null)
            {
               _loc3_.version = param2;
               if(_loc3_.denItemHelper)
               {
                  _loc3_.denItemHelper.setVersion(param2);
               }
            }
         }
         for each(_loc3_ in _itemsInit.getCoreArray())
         {
            if(_loc3_.invIdx == param1 && _loc3_.petItem == null)
            {
               _loc3_.version = param2;
            }
         }
         changed();
      }

      // a prefab put down (gui.DenPrefabs): its items, already where they
      // go and in one group, are placed, picked and chosen
      public function spawnItems(param1:Array) : void
      {
         var _loc2_:DenStateItemCollection = new DenStateItemCollection();
         var _loc3_:DenStateItem = null;
         for each(_loc3_ in param1)
         {
            _loc2_.pushDenStateItem(_loc3_);
         }
         setItems(_loc2_,true);
         var _loc4_:Array = [];
         for each(_loc3_ in param1)
         {
            for each(var _loc5_:DenStateItem in _currItems.getCoreArray())
            {
               if(_loc5_.invIdx == _loc3_.invIdx && _loc5_.refId == _loc3_.refId)
               {
                  _loc4_.push(_loc5_);
                  break;
               }
            }
         }
         _picked = [];
         if(_loc4_.length > 0)
         {
            _dragItem = _loc4_[0];
            _sticky = true;
         }
         updateCloseBtn();
         changed();
      }

      // items taken out of the den, back to the den items list, as the
      // close button does one (a prefab's "Put away"); locked ones too
      public function putAway(param1:Array) : void
      {
         for each(var _loc2_:DenStateItem in param1.concat())
         {
            if(_currItems.getCoreArray().indexOf(_loc2_) < 0)
            {
               continue;
            }
            dropPick(_loc2_);
            var _loc3_:DenItemHolderEvent = new DenItemHolderEvent("OnItemRemoved");
            _loc3_.id = _loc2_.invIdx;
            _loc3_.refId = _loc2_.refId;
            _loc3_.array = [_loc2_];
            releaseItem(_loc2_);
            if(_dragItem == _loc2_)
            {
               _dragItem = null;
            }
            dispatchEvent(_loc3_);
         }
         _sticky = false;
         updateCloseBtn();
         changed();
      }

      // a group number no item has, for a prefab coming down
      public function newGroupId() : int
      {
         return freeGroup();
      }

      private function hitTest(param1:int, param2:int) : DenStateItem
      {
         var _loc3_:DenStateItem = null;
         var _loc7_:int = 0;
         var _loc9_:DenStateItem = null;
         var _loc6_:DisplayObject = null;
         var _loc4_:Rectangle = null;
         var _loc10_:Number = NaN;
         var _loc8_:Number = -999999999;
         var _loc11_:int = 99999999;
         var _loc5_:int = int(_currItems.length);
         while(_loc7_ < _loc5_)
         {
            _loc9_ = _currItems.getDenStateItem(_loc7_);
            if(!isTheme(_loc9_.sortCatId) && !(_roomMode == 1 && isLocked(_loc9_)))
            {
               _loc6_ = _loc9_.denItemHelper.displayObject;
               _loc4_ = _loc6_.getBounds(_layerManager.room_avatars);
               _loc4_.height = Math.max(105,_loc4_.height);
               _loc10_ = _loc4_.bottom - Number(_loc6_.name);
               if(param1 > _loc4_.left && param1 < _loc4_.right && param2 > _loc4_.top && param2 < _loc4_.bottom)
               {
                  if(_loc9_.layerId <= _loc11_)
                  {
                     if(_loc9_.layerId == 1 || _loc10_ > _loc8_)
                     {
                        _loc11_ = _loc9_.layerId;
                        _loc8_ = _loc10_;
                        _loc3_ = _loc9_;
                        if(_loc11_ == 1)
                        {
                           _loc8_ = -999999999;
                        }
                     }
                  }
               }
            }
            _loc7_++;
         }
         return _loc3_;
      }
      
      private function itemLoaded(param1:DenItemHelper, param2:Boolean = false) : void
      {
         var _loc8_:DenStateItem = null;
         var _loc3_:Sprite = null;
         var _loc5_:Number = NaN;
         var _loc7_:Number = NaN;
         var _loc4_:Boolean = false;
         var _loc11_:int = 0;
         var _loc10_:int = 0;
         var _loc12_:SortLayer = null;
         if(!param2)
         {
            _savedDenItemHelpers.push(param1);
         }
         for each(var _loc9_:DenStateItem in _currItems.getCoreArray())
         {
            if(_loc9_.denItemHelper == param1)
            {
               _loc8_ = _loc9_;
               break;
            }
         }
         if(_loc8_ && _loc8_.sortCatId != 4)
         {
            _loc3_ = param1.displayObject;
            _loc8_.offsetX = -(param1.contentWidth * 0.5);
            _loc8_.offsetY = -param1.contentHeight;
            if(param2)
            {
               _loc8_.x -= _loc8_.offsetX;
               _loc8_.y -= _loc8_.offsetY;
            }
            _loc5_ = _loc8_.x + _loc8_.offsetX;
            _loc7_ = _loc8_.y + _loc8_.offsetY;
            _loc4_ = _loc8_.newPlaced;
            if(_loc8_.newPlaced)
            {
               _loc7_ += param1.contentHeight * 0.5;
               _loc8_.newPlaced = false;
            }
            if(_roomMode == 1 || _loc8_.specialType == 7)
            {
               if(_loc8_.denItemHelper && _loc8_.denItemHelper.content && _loc8_.denItemHelper.content.hasOwnProperty("listenToMouse"))
               {
                  Object(_loc8_.denItemHelper.content).listenToMouse = false;
               }
            }
            else if(_loc3_ && _loc8_.denItemHelper && _loc8_.denItemHelper.content && _loc8_.denItemHelper.content.hasOwnProperty("ignoreMouseCompletely"))
            {
               Sprite(_loc3_).mouseEnabled = false;
               Sprite(_loc3_).mouseChildren = false;
            }
            if(_loc8_.denItemHelper && _loc8_.denItemHelper.content && _loc8_.denItemHelper.content.hasOwnProperty("active"))
            {
               if(_loc8_.userNameLink != "")
               {
                  Object(_loc8_.denItemHelper.content).active(true);
               }
               else
               {
                  Object(_loc8_.denItemHelper.content).active(false);
               }
            }
            if(_loc8_.denItemHelper)
            {
               if(_loc8_.denItemHelper.isUniqueImageItem)
               {
                  addListenersToItem(_loc8_.denItemHelper,_loc8_);
               }
            }
            if(_loc8_.specialType == 7 && _loc8_.ecoConsumerStateId == 1)
            {
               sendMouseEventToItem(_loc8_.denItemHelper.content as MovieClip);
            }
            _loc10_ = _loc8_.layerId;
            setItemMatrix(_loc8_,_loc5_,_loc7_,_loc8_.flipped);
            if(isTheme(_loc8_.sortCatId))
            {
               _loc10_ = 100;
               _loc3_.x = 0;
               _loc3_.y = 0;
               setItemMatrix(_loc8_,0,0,0);
            }
            if(!_loc4_)
            {
               for each(var _loc6_:DenStateItem in _itemsInit.getCoreArray())
               {
                  if(_loc8_.refId == _loc6_.refId && _loc8_.invIdx == _loc6_.invIdx)
                  {
                     if(_loc8_.x != _loc6_.x || _loc8_.y != _loc6_.y)
                     {
                        _loc6_.x = _loc8_.x;
                        _loc6_.y = _loc8_.y;
                        _loc6_.offsetX = _loc8_.offsetX;
                        _loc6_.offsetY = _loc8_.offsetY;
                        break;
                     }
                  }
               }
            }
            switch(_loc10_)
            {
               case 1:
                  addFloorItem(_loc8_,_loc3_);
                  break;
               case 100:
                  _layerManager.room_bkg_main.addChildAt(_loc3_,0);
                  break;
               default:
                  _loc11_ = param1.sortOffset;
                  _loc12_ = RoomManagerWorld.instance.inPreviewMode ? _layerManager.preview_room_avatar : _layerManager.room_avatars;
                  if(_loc11_)
                  {
                     _loc3_.name = String(_loc11_);
                  }
                  _loc12_.addChild(_loc3_);
            }
            changed();
         }
      }
      
      private function addListenersToItem(param1:DenItemHelper, param2:DenStateItem) : void
      {
         param1.addMouseListeners(param2,onItemDown,onItemOver,onItemOut);
      }
      
      private function addPortalListenersToItem(param1:DenItemHelper, param2:DenStateItem) : void
      {
         param1.addPortalListeners(param2,onPortalItemDown,onPortalItemOver,onPortalItemOut);
      }
      
      private function removeListenersFromItem(param1:DenItemHelper) : void
      {
         param1.removeMouseListeners();
      }
      
      private function removePortalListenersFromItem(param1:DenItemHelper) : void
      {
         param1.removePortalListeners();
      }
      
      private function onItemDown(param1:MouseEvent, param2:DenItemHelper) : void
      {
         var _loc3_:Object = null;
         if(_roomMode != 0)
         {
            return;
         }
         param1.stopPropagation();
         sendMouseEvent(param1);
         _lastSelectedItem = param2.denStateItem as DenStateItem;
         if(param2.minigameDefId > 0)
         {
            _loc3_ = {
               "typeDefId":param2.minigameDefId,
               "fromMyDenItem":RoomManagerWorld.instance.isMyDen
            };
            MinigameManager.handleGameClick(_loc3_,null);
         }
         else if(param2.listLauncherId > 0)
         {
            GuiManager.openPageFlipBook(param2.listLauncherId,true,1);
         }
         else if(param2.isUniqueImageItem)
         {
            GuiManager.openMasterpiecePreview(param2.uniqueImageId,param2.uniqueImageCreator,param2.uniqueImageCreatorDbId,param2.uniqueImageCreatorUUID,param2.version,RoomManagerWorld.instance.denOwnerName,param2.currDenItem);
         }
         else if(param2.defId == 3192 || param2.defId == 3193 || param2.defId == 3250 || param2.defId == 3585)
         {
            QuestManager.showTalkingDialog(GuiManager.guiLayer,LocalizationManager.translateIdOnly(30423).split("|"),0,-1,true,PartyXtCommManager.sendJoinPartyRequest,48);
         }
         else if(param2.defId >= 3312 && param2.defId <= 3319)
         {
            switch(param2.defId - 3312)
            {
               case 0:
                  RoomXtCommManager.sendRoomJoinRequest("jamaa_township.room_main#" + RoomManagerWorld.instance.shardId);
                  break;
               case 1:
                  RoomXtCommManager.sendRoomJoinRequest("crystal_sands.room_main#" + RoomManagerWorld.instance.shardId);
                  break;
               case 2:
                  RoomXtCommManager.sendRoomJoinRequest("appondale.room_main#" + RoomManagerWorld.instance.shardId);
                  break;
               case 3:
                  RoomXtCommManager.sendRoomJoinRequest("sarepia.room_main#" + RoomManagerWorld.instance.shardId);
                  break;
               case 4:
                  RoomXtCommManager.sendRoomJoinRequest("mountains_of_shivveer.room_main#" + RoomManagerWorld.instance.shardId);
                  break;
               case 5:
                  RoomXtCommManager.sendRoomJoinRequest("lost_temple_of_zios.room_main#" + RoomManagerWorld.instance.shardId);
                  break;
               case 6:
                  RoomXtCommManager.sendRoomJoinRequest("aussie.room_main#" + RoomManagerWorld.instance.shardId);
                  break;
               case 7:
                  RoomXtCommManager.sendRoomJoinRequest("coral_canyons.room_main#" + RoomManagerWorld.instance.shardId);
            }
         }
         else if(param2.defId == 3216)
         {
            GenericListGuiManager.genericListVolumeClicked(669);
         }
         else if(param2.isMannequin)
         {
            _mannaquinDenItemHelper = param2;
            _mannaquinAvEditor = new AvatarEditor();
            _mannaquinAvEditor.init(_mannaquinDenItemHelper.mannequin.mannequinAvatarView.avatarData,GuiManager.guiLayer,onMannequinAvEditorClose,false,false,_mannaquinDenItemHelper);
         }
         else if(param2.isDenStore)
         {
            ShopManager.launchDenShopStore(_lastSelectedItem.invIdx);
         }
         else if(param2.denStateItem.specialType == 6)
         {
            _ecoScorePopup = new EcoScorePopup(onEcoPopupClose);
         }
         else if(param2.denStateItem.specialType == 7 && (param2.content as MovieClip).clickFromCode == null || (param2.content as MovieClip).clickFromCode == false)
         {
            _ecoPointsPopup = new EcoPointsPopup(param2.denStateItem,onEcoPointsPopupClose);
         }
      }
      
      private function onPortalItemDown(param1:MouseEvent, param2:DenItemHelper) : void
      {
      }
      
      private function onItemOver(param1:MouseEvent, param2:DenItemHelper) : void
      {
         if(_roomMode != 0)
         {
            return;
         }
         if(param2.isMannequin)
         {
            return;
         }
         param1.stopPropagation();
         sendMouseEvent(param1);
         var _loc3_:Sprite = Sprite(param1.currentTarget);
         GuiManager.toolTip.init(_layerManager.room_orbs,param2.minigameDefId > 0 ? MinigameManager.getGameName(param2.minigameDefId) : LocalizationManager.translateIdOnly(param2.denStateItem.denItemHelper.nameStrId),param2.denStateItem.x + _loc3_.width * 0.5,param2.denStateItem.y + _loc3_.height - 75);
         GuiManager.toolTip.startTimer(param1);
      }
      
      private function onPortalItemOver(param1:MouseEvent, param2:DenItemHelper) : void
      {
         if(_roomMode != 0)
         {
            return;
         }
         param1.stopPropagation();
         if(param2.denStateItem.userNameLink != "")
         {
            sendMouseEvent(param1,true);
         }
      }
      
      private function onItemOut(param1:MouseEvent) : void
      {
         if(_roomMode != 0)
         {
            return;
         }
         param1.stopPropagation();
         sendMouseEvent(param1);
         GuiManager.toolTip.resetTimerAndSetVisibility();
      }
      
      private function onPortalItemOut(param1:MouseEvent) : void
      {
         if(_roomMode != 0)
         {
            return;
         }
         param1.stopPropagation();
         sendMouseEvent(param1,true);
      }
      
      private function sendMouseEvent(param1:MouseEvent, param2:Boolean = false) : void
      {
         var _loc6_:Sprite = null;
         var _loc5_:Loader = null;
         var _loc3_:MovieClip = null;
         var _loc4_:int = -1;
         switch(param1.type)
         {
            case "mouseDown":
               _loc4_ = 0;
               break;
            case "mouseOver":
               _loc4_ = 1;
               break;
            case "mouseOut":
               _loc4_ = 2;
         }
         if(_loc4_ >= 0)
         {
            if(param2)
            {
               _loc6_ = Sprite(param1.currentTarget.parent);
            }
            else
            {
               _loc6_ = Sprite(param1.currentTarget);
            }
            if(_loc6_.parent)
            {
               _loc5_ = _loc6_.getChildAt(0) as Loader;
               if(_loc5_)
               {
                  _loc3_ = _loc5_.content as MovieClip;
                  if(_loc3_)
                  {
                     if(_loc3_.hasOwnProperty("handleMouse"))
                     {
                        _loc3_.handleMouse(_loc4_);
                     }
                  }
               }
            }
         }
      }
      
      private function sendMouseEventToItem(param1:MovieClip) : void
      {
         var _loc2_:Boolean = false;
         if(param1)
         {
            if(param1.hasOwnProperty("handleMouse"))
            {
               param1.handleMouse("mouseDown");
            }
            else
            {
               _loc2_ = Boolean(param1.listenToMouse);
               param1.listenToMouse = true;
               param1.clickFromCode = true;
               MovieClip(param1.item1).dispatchEvent(new MouseEvent("mouseDown"));
               param1.listenToMouse = _loc2_;
               param1.clickFromCode = false;
            }
         }
      }
      
      private function onMannequinAvEditorClose(param1:Boolean) : void
      {
         var _loc2_:int = 0;
         var _loc3_:DenItemCollection = null;
         var _loc4_:int = 0;
         _mannaquinAvEditor.destroy();
         _mannaquinAvEditor = null;
         if(param1)
         {
            _loc3_ = gMainFrame.userInfo.playerUserInfo.denItemsPartial;
            _loc4_ = _mannaquinDenItemHelper.denStateItem.invIdx;
            _loc2_ = 0;
            while(_loc2_ < _loc3_.length)
            {
               if(_loc3_.getDenItem(_loc2_).invIdx == _loc4_)
               {
                  _loc3_.getDenItem(_loc2_).mannequinData = _mannaquinDenItemHelper.mannequin.clone();
                  break;
               }
               _loc2_++;
            }
            AvatarManager.playerAvatar.inventoryDenPartial.denItemCollection = _loc3_;
            _loc3_ = AvatarManager.playerAvatar.inventoryDenFull.denItemCollection;
            _loc2_ = 0;
            while(_loc2_ < _loc3_.length)
            {
               if(_loc3_.getDenItem(_loc2_).invIdx == _loc4_)
               {
                  _loc3_.getDenItem(_loc2_).mannequinData = _mannaquinDenItemHelper.mannequin.clone();
                  break;
               }
               _loc2_++;
            }
            gMainFrame.userInfo.playerUserInfo.denItemsFull = _loc3_;
            saveState(_loc4_);
         }
         _mannaquinDenItemHelper = null;
      }
      
      private function onEcoPopupClose() : void
      {
         _ecoScorePopup.destroy();
         _ecoScorePopup = null;
         if(GuiManager.denEditor)
         {
            GuiManager.denEditor.reloadDenItems();
         }
      }
      
      private function onEcoPointsPopupClose() : void
      {
         _ecoPointsPopup.destroy();
         _ecoPointsPopup = null;
         if(GuiManager.denEditor)
         {
            GuiManager.denEditor.reloadDenItems();
         }
      }
   }
}

