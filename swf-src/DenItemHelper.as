package loader
{
   import Enums.DenItemDef;
   import avatar.AvatarManager;
   import avatar.MannequinData;
   import com.sbi.loader.FileServerEvent;
   import den.DenItem;
   import den.DenStateItem;
   import den.DenXtCommManager;
   import flash.display.Bitmap;
   import flash.display.DisplayObject;
   import flash.display.Loader;
   import flash.display.MovieClip;
   import flash.display.Sprite;
   import flash.events.Event;
   import flash.events.MouseEvent;
   import flash.net.URLLoader;
   import flash.net.URLRequest;
   import flash.utils.ByteArray;
   import pet.PetItem;
   import pet.PetManager;
   import room.DenItemHolder;
   
   public class DenItemHelper
   {
      
      private var _denItem:DenItem;
      
      private var _denStateItem:DenStateItem;
      
      private var _defId:int;
      
      private var _id:uint;
      
      private var _callback:Function;
      
      private var _loader:Loader;
      
      private var _sprite:Sprite;
      
      private var _portalSprite:Sprite;
      
      private var _sortOffset:int;
      
      private var _minigameDefId:int;
      
      private var _nameStrId:int;
      
      private var _listLauncherId:int;
      
      private var _version:int;
      
      private var _version2:int;
      
      private var _version3:int;
      
      private var _petItem:PetItem;
      
      private var _bFlipLabel:Boolean;
      
      private var _isUniqueImageItem:Boolean;
      
      private var _uniqueImageId:String;
      
      private var _uniqueImageCreator:String;
      
      private var _uniqueImageCreatorDbId:int;
      
      private var _uniqueImageCreatorUUID:String;
      
      private var _isMannequin:Boolean;
      
      private var _isDenStore:Boolean;
      
      private var _masterpieceDefHelper:MasterpieceDefHelper;
      
      private var _mannequinData:MannequinData;
      
      private var _onMouseDownCallback:Function;
      
      private var _onMouseOverCallback:Function;
      
      private var _onMouseOutCallback:Function;
      
      private var _uniqueImage:Sprite;
      
      public function DenItemHelper()
      {
         super();
      }
      
      public function get displayObject() : Sprite
      {
         return _sprite;
      }
      
      public function get content() : DisplayObject
      {
         return _loader.content;
      }
      
      public function get sortOffset() : int
      {
         // The low two flip bits are used by the original client.  Den editing
         // also uses bits 2-3 as the item's player depth: 1 = always behind
         // players and 2 = always in front (a very large offset wins over the
         // normal y-position depth sort without visibly moving the item), and
         // bits 16-30 as a nudge of so many pixels further in front, which the
         // layers panel sets to put items in the order it shows
         // (room.DenItemHolder).
         if(_denStateItem != null)
         {
            var _loc1_:int = DenItemHolder.depthOf(_denStateItem.flipped);
            var _loc2_:int = _sortOffset - DenItemHolder.nudgeOf(_denStateItem.flipped);
            if(_loc1_ == 1)
            {
               return _loc2_ + 1000000;
            }
            if(_loc1_ == 2)
            {
               return _loc2_ - 1000000;
            }
            return _loc2_;
         }
         return _sortOffset;
      }
      
      public function get id() : int
      {
         return _id;
      }
      
      public function get minigameDefId() : int
      {
         return _minigameDefId;
      }
      
      public function get bFlipLabel() : Boolean
      {
         return _bFlipLabel;
      }
      
      public function get isUniqueImageItem() : Boolean
      {
         return _isUniqueImageItem;
      }
      
      public function get listLauncherId() : int
      {
         return _listLauncherId;
      }
      
      public function get nameStrId() : int
      {
         return _nameStrId;
      }
      
      public function get uniqueImage() : Sprite
      {
         return _uniqueImage;
      }
      
      public function get uniqueImageId() : String
      {
         return _uniqueImageId;
      }
      
      public function set uniqueImageId(param1:String) : void
      {
         _uniqueImageId = param1;
      }
      
      public function get uniqueImageCreator() : String
      {
         return _uniqueImageCreator;
      }
      
      public function set uniqueImageCreator(param1:String) : void
      {
         _uniqueImageCreator = param1;
      }
      
      public function get uniqueImageCreatorDbId() : int
      {
         return _uniqueImageCreatorDbId;
      }
      
      public function get uniqueImageCreatorUUID() : String
      {
         return _uniqueImageCreatorUUID;
      }
      
      public function get denStateItem() : DenStateItem
      {
         return _denStateItem;
      }
      
      public function get defId() : int
      {
         return _defId;
      }
      
      public function get version() : int
      {
         return _version;
      }
      
      public function get mannequin() : MannequinData
      {
         return _mannequinData;
      }
      
      public function get isMannequin() : Boolean
      {
         return _isMannequin;
      }
      
      public function get isDenStore() : Boolean
      {
         return _isDenStore;
      }
      
      public function get contentWidth() : int
      {
         if(_loader != null && _loader.content != null)
         {
            if(_loader.content.hasOwnProperty("sizeCont"))
            {
               return _loader.content["sizeCont"].width;
            }
            return _loader.content.width;
         }
         return 0;
      }
      
      public function get contentHeight() : int
      {
         if(_loader != null && _loader.content != null)
         {
            if(_loader.content.hasOwnProperty("sizeCont"))
            {
               return _loader.content["sizeCont"].height;
            }
            return _loader.content.height;
         }
         return 0;
      }
      
      public function get currDenItem() : DenItem
      {
         return _denItem;
      }
      
      public function init(param1:DenItem, param2:Function, param3:PetItem = null, param4:int = 0, param5:int = 0, param6:MannequinData = null) : void
      {
         _denItem = param1;
         _defId = param1.defId;
         _id = uint(_defId << 16 | DenItem.getIconId(param1.sortId));
         _callback = param2;
         _minigameDefId = param1.minigameDefId;
         _nameStrId = param5;
         _listLauncherId = param4;
         _bFlipLabel = false;
         _isUniqueImageItem = false;
         _petItem = param3;
         _version = param1.sortId == 99 ? _petItem.petBits[0] : param1.version;
         _version2 = param1.sortId == 99 ? _petItem.petBits[1] : 0;
         _version3 = param1.sortId == 99 ? _petItem.petBits[2] : 0;
         _loader = new Loader();
         _sprite = new Sprite();
         _portalSprite = new Sprite();
         _uniqueImage = new Sprite();
         _uniqueImageId = param1.uniqueImageId;
         _uniqueImageCreator = param1.uniqueImageCreator;
         _uniqueImageCreatorDbId = param1.uniqueImageCreatorDbId;
         _uniqueImageCreatorUUID = param1.uniqueImageCreatorUUID;
         _mannequinData = param6;
         if(loadCustomArt())
         {
            return;
         }
         loadBaseArt();
      }
      
      public function initDS(param1:DenStateItem, param2:Function) : void
      {
         _denStateItem = param1;
         _defId = param1.defId;
         _id = uint(_defId << 16 | param1.catId);
         _callback = param2;
         _minigameDefId = param1.minigameDefId;
         _nameStrId = param1.nameStrId;
         _listLauncherId = param1.listLauncherId;
         _bFlipLabel = false;
         _isUniqueImageItem = false;
         _petItem = param1.petItem;
         _version = param1.sortCatId == 99 ? _petItem.petBits[0] : param1.version;
         _version2 = param1.sortCatId == 99 ? _petItem.petBits[1] : 0;
         _version3 = param1.sortCatId == 99 ? _petItem.petBits[2] : 0;
         _loader = new Loader();
         _sprite = new Sprite();
         _portalSprite = new Sprite();
         _uniqueImage = new Sprite();
         _uniqueImageId = param1.uniqueImageId;
         _uniqueImageCreator = param1.uniqueImageCreator;
         _uniqueImageCreatorDbId = param1.uniqueImageCreatorDbId;
         _uniqueImageCreatorUUID = param1.uniqueImageCreatorUUID;
         _mannequinData = param1.mannequinData;
         if(loadCustomArt())
         {
            return;
         }
         loadBaseArt();
      }
      
      public function initGeneric(param1:DenItemDef, param2:Function, param3:int = 0, param4:int = 0, param5:int = 0, param6:String = "", param7:int = -1, param8:String = "", param9:PetItem = null, param10:MannequinData = null) : void
      {
         _defId = param1.id;
         _id = uint(_defId << 16 | DenItem.getIconId(param1.sortCat));
         _callback = param2;
         _minigameDefId = param1.gameDefId;
         _nameStrId = param5;
         _listLauncherId = param4;
         _bFlipLabel = false;
         _isUniqueImageItem = false;
         _petItem = param9;
         _version = param1.sortCat == 99 ? _petItem.petBits[0] : param3;
         _version2 = param1.sortCat == 99 ? _petItem.petBits[1] : 0;
         _version3 = param1.sortCat == 99 ? _petItem.petBits[2] : 0;
         _loader = new Loader();
         _sprite = new Sprite();
         _portalSprite = new Sprite();
         _uniqueImage = new Sprite();
         _uniqueImageId = param6;
         _uniqueImageCreator = "";
         _uniqueImageCreatorDbId = param7;
         _uniqueImageCreatorUUID = param8;
         _mannequinData = param10;
         if(loadCustomArt())
         {
            return;
         }
         loadBaseArt();
      }
      
      public function destroy() : void
      {
         DenItemServer.instance.removeEventListener("OnNewData",handleData);
         if(_loader)
         {
            if(_loader.parent)
            {
               _loader.parent.removeChild(_loader);
            }
            _loader.unloadAndStop(true);
         }
         _callback = null;
         _sprite = null;
      }
      
      public function loadUniqueImage() : void
      {
         if(_loader && _loader.content && _loader.content.hasOwnProperty("setUniqueImage"))
         {
            _isUniqueImageItem = true;
            if(_uniqueImageId != "")
            {
               _masterpieceDefHelper = new MasterpieceDefHelper();
               _masterpieceDefHelper.init(_uniqueImageId,onUniqueImageIdLoaded);
            }
         }
      }
      
      public function setupItemWithEmotes(param1:DenStateItem) : void
      {
         _denStateItem = param1;
      }
      
      public function addPortalListeners(param1:DenStateItem, param2:Function, param3:Function = null, param4:Function = null) : void
      {
         _denStateItem = param1;
         _onMouseDownCallback = param2;
         _portalSprite.addEventListener("mouseDown",onMouseDown,false,0,true);
         if(param3 != null)
         {
            _onMouseOverCallback = param3;
            _portalSprite.addEventListener("mouseOver",onMouseOver,false,0,true);
         }
         if(param4 != null)
         {
            _onMouseOutCallback = param4;
            _portalSprite.addEventListener("mouseOut",onMouseOut,false,0,true);
         }
      }
      
      public function addMouseListeners(param1:DenStateItem, param2:Function, param3:Function = null, param4:Function = null) : void
      {
         _denStateItem = param1;
         _onMouseDownCallback = param2;
         _sprite.addEventListener("mouseDown",onMouseDown,false,0,true);
         if(param3 != null)
         {
            _onMouseOverCallback = param3;
            _sprite.addEventListener("mouseOver",onMouseOver,false,0,true);
         }
         if(param4 != null)
         {
            _onMouseOutCallback = param4;
            _sprite.addEventListener("mouseOut",onMouseOut,false,0,true);
         }
      }
      
      public function removeMouseListeners() : void
      {
         _denStateItem = null;
         _onMouseDownCallback = null;
         _sprite.removeEventListener("mouseDown",onMouseDown);
         if(_onMouseOverCallback != null)
         {
            _onMouseOverCallback = null;
            _sprite.removeEventListener("mouseOver",onMouseOver);
         }
         if(_onMouseOutCallback != null)
         {
            _onMouseOutCallback = null;
            _sprite.removeEventListener("mouseOut",onMouseOut);
         }
      }
      
      public function removePortalListeners() : void
      {
         _denStateItem = null;
         _onMouseDownCallback = null;
         _portalSprite.removeEventListener("mouseDown",onMouseDown);
         if(_onMouseOverCallback != null)
         {
            _onMouseOverCallback = null;
            _portalSprite.removeEventListener("mouseOver",onMouseOver);
         }
         if(_onMouseOutCallback != null)
         {
            _onMouseOutCallback = null;
            _portalSprite.removeEventListener("mouseOut",onMouseOut);
         }
      }
      
      public function getVersions() : Array
      {
         if(_loader && _loader.content && _loader.content.hasOwnProperty("getVersions"))
         {
            return _loader.content["getVersions"]();
         }
         return null;
      }
      
      public function setVersion(param1:int, param2:int = 0, param3:int = 0) : void
      {
         var _loc5_:MovieClip = null;
         var _loc4_:int = 0;
         _version = param1;
         if(param2 > 0)
         {
            _version2 = param2;
         }
         if(param3 > 0)
         {
            _version3 = param3;
         }
         if(_loader && _loader.content)
         {
            if(_loader.content.hasOwnProperty("setVersion"))
            {
               if(_version == -1)
               {
                  _version = getVersions()[0];
               }
               _loader.content["setVersion"](param1);
            }
            else if(_loader.content.hasOwnProperty("pet"))
            {
               _loc5_ = MovieClip(_loader.content);
               PetManager.setPetState(_loc5_,_version,_version2,_version3);
               if(_petItem && _petItem.isEgg)
               {
                  if(_loc5_.pet.hasOwnProperty("setEggDayInt"))
                  {
                     _loc4_ = _petItem.createdTs > 0 ? Math.floor((Utility.getInitialEpochTime() - _petItem.createdTs) / 86400) : 0;
                     _loc5_.pet.setEggDayInt(_loc4_);
                  }
               }
            }
         }
      }
      
      public function rebuildMannequinView() : void
      {
         var _loc1_:DenItemDef = DenXtCommManager.getDenItemDef(_defId);
         // a custom picture (a Bitmap) has no mannequin to dress
         if(_loc1_ != null && _loc1_.mannequinAvatarDefId > 0 && _loader.content is MovieClip)
         {
            _isMannequin = true;
            _mannequinData.setupMannequinAvatarView(_loc1_,MovieClip(_loader.content));
         }
      }
      
      // a custom den item's own picture (AJClient.customArtUrl): in place of
      // the game's art, as its icon and in a den. it goes into _loader, as the
      // game's art does (the icon, shop, den and gift code all look for a
      // Loader first in _sprite), its top left on the origin and fitted in
      // CUSTOM_ART_SIDE: the den stands it on its spot from contentWidth and
      // contentHeight, as it does any item. one that does not load (or with
      // bytes Flash cannot read) is drawn with its base's art instead.
      private static const CUSTOM_ART_SIDE:int = 160;

      // pictures' bytes by address, fetched once for every icon and den item
      // showing them (each decodes its own copy). those asked for while one
      // is fetched wait for it; its URLLoader is kept here meanwhile, or it
      // could be collected before it finishes. past CUSTOM_ART_MAX it starts
      // afresh.
      private static const CUSTOM_ART_MAX:int = 100;

      private static var _artBytes:Object = {};

      private static var _artBytesCount:int = 0;

      private static var _artFetching:Object = {};

      private function loadCustomArt() : Boolean
      {
         var _loc1_:String = AJClient.customArtUrl("den",_defId);
         if(_loc1_ == null)
         {
            return false;
         }
         _sortOffset = 0;
         fetchArtBytes(_loc1_,customArtBytesReceived);
         return true;
      }

      private static function fetchArtBytes(param1:String, param2:Function) : void
      {
         var url:String = param1;
         if(_artBytes[url] != null)
         {
            param2(_artBytes[url]);
            return;
         }
         if(_artFetching[url] != null)
         {
            _artFetching[url].waiting.push(param2);
            return;
         }
         var fetch:URLLoader = new URLLoader();
         _artFetching[url] = {"loader":fetch,"waiting":[param2]};
         var finish:Function = function(param1:ByteArray):void
         {
            var _loc2_:Array = _artFetching[url].waiting;
            fetch.removeEventListener("complete",fetched);
            fetch.removeEventListener("ioError",notFetched);
            fetch.removeEventListener("securityError",notFetched);
            delete _artFetching[url];
            if(param1 != null)
            {
               if(_artBytesCount >= CUSTOM_ART_MAX)
               {
                  _artBytes = {};
                  _artBytesCount = 0;
               }
               _artBytes[url] = param1;
               _artBytesCount++;
            }
            for each(var _loc3_:Function in _loc2_)
            {
               try
               {
                  _loc3_(param1);
               }
               catch(e:Error)
               {
               }
            }
         };
         var fetched:Function = function(param1:Event):void
         {
            var _loc2_:ByteArray = fetch.data as ByteArray;
            finish(_loc2_ != null && _loc2_.length > 0 ? _loc2_ : null);
         };
         var notFetched:Function = function(param1:Event):void
         {
            finish(null);
         };
         fetch.dataFormat = "binary";
         fetch.addEventListener("complete",fetched);
         fetch.addEventListener("ioError",notFetched);
         fetch.addEventListener("securityError",notFetched);
         try
         {
            fetch.load(new URLRequest(url));
         }
         catch(e:Error)
         {
            finish(null);
         }
      }

      private function customArtBytesReceived(param1:ByteArray) : void
      {
         if(_sprite == null)
         {
            return;
         }
         if(param1 == null)
         {
            loadBaseArt();
            return;
         }
         _loader.contentLoaderInfo.addEventListener("complete",onCustomArtLoaded);
         _loader.contentLoaderInfo.addEventListener("ioError",onCustomArtFailed);
         try
         {
            _loader.loadBytes(param1);
         }
         catch(e:Error)
         {
            onCustomArtFailed(null);
         }
      }

      private function onCustomArtLoaded(param1:Event) : void
      {
         var _loc2_:Bitmap = null;
         var _loc3_:Number = NaN;
         _loader.contentLoaderInfo.removeEventListener("complete",onCustomArtLoaded);
         _loader.contentLoaderInfo.removeEventListener("ioError",onCustomArtFailed);
         if(_sprite == null)
         {
            return;
         }
         _loc2_ = _loader.content as Bitmap;
         if(_loc2_ == null || _loc2_.bitmapData == null)
         {
            _loader.unload();
            loadBaseArt();
            return;
         }
         _loc2_.smoothing = true;
         _loc3_ = Math.min(1,CUSTOM_ART_SIDE / Math.max(1,_loc2_.bitmapData.width),CUSTOM_ART_SIDE / Math.max(1,_loc2_.bitmapData.height));
         _loc2_.scaleX = _loc2_.scaleY = _loc3_;
         _loc2_.x = 0;
         _loc2_.y = 0;
         _sprite.addChild(_loader);
         _sprite.addChild(_portalSprite);
         if(_callback != null)
         {
            _callback(this);
            _callback = null;
         }
      }

      private function onCustomArtFailed(param1:Event) : void
      {
         _loader.contentLoaderInfo.removeEventListener("complete",onCustomArtLoaded);
         _loader.contentLoaderInfo.removeEventListener("ioError",onCustomArtFailed);
         if(_sprite != null)
         {
            loadBaseArt();
         }
      }

      // the base item's own file, as for any item without a picture
      private function loadBaseArt() : void
      {
         DenItemServer.instance.addEventListener("OnNewData",handleData,false,0,true);
         DenItemServer.instance.requestFile(_id);
      }

      private function handleData(param1:FileServerEvent) : void
      {
         var _loc2_:Object = null;
         if(param1.id == _id && param1.success)
         {
            DenItemServer.instance.removeEventListener("OnNewData",handleData);
            _loader.contentLoaderInfo.addEventListener("complete",onBytesLoaded);
            param1.data.position = 0;
            _loc2_ = param1.data.readObject();
            _sortOffset = _loc2_.so;
            _loader.loadBytes(_loc2_.ba);
         }
      }
      
      private function onBytesLoaded(param1:Event) : void
      {
         var _loc3_:MovieClip = null;
         var _loc2_:int = 0;
         var _loc4_:DenItemDef = null;
         _loader.contentLoaderInfo.removeEventListener("complete",onBytesLoaded);
         var _loc5_:Array = _loader.content["currentLabels"];
         if(_loc5_.length >= 0)
         {
            for each(var _loc6_:Object in _loc5_)
            {
               if(_loc6_.name == "flip")
               {
                  _bFlipLabel = true;
                  break;
               }
            }
            if(!Utility.doesItAnimate(_loader.content))
            {
               _loader.cacheAsBitmap = true;
            }
         }
         if(_version == -1)
         {
            if(_loader.content.hasOwnProperty("getVersions"))
            {
               _version = getVersions()[0];
            }
            else
            {
               _version = 0;
            }
         }
         if(_loader.content.hasOwnProperty("setVersion") && _version >= 0)
         {
            MovieClip(_loader.content).setVersion(_version);
         }
         else if(_loader.content.hasOwnProperty("pet"))
         {
            _loc3_ = MovieClip(_loader.content);
            PetManager.setPetState(_loc3_,_version,_version2,_version3);
            if(_petItem && _petItem.isEgg)
            {
               if(_loc3_.pet.hasOwnProperty("setEggDayInt"))
               {
                  _loc2_ = _petItem.createdTs > 0 ? Math.floor((Utility.getInitialEpochTime() - _petItem.createdTs) / 86400) : 0;
                  _loc3_.pet.setEggDayInt(_loc2_);
               }
            }
         }
         if(MovieClip(_loader.content).isMoveToDisabled)
         {
            _loader.name = "moveToDisabled";
         }
         if(_mannequinData != null)
         {
            _loc4_ = DenXtCommManager.getDenItemDef(_defId);
            if(_loc4_ != null && _loc4_.mannequinAvatarDefId > 0)
            {
               _isMannequin = true;
               _mannequinData.setupMannequinAvatarView(_loc4_,MovieClip(_loader.content));
            }
         }
         if(_denStateItem != null)
         {
            if(_denStateItem.specialType == 1)
            {
               _portalSprite.addChild(MovieClip(_loader.content).clickObject);
            }
            else if(_denStateItem.specialType == 2 && _loader.content.hasOwnProperty("setEmoteCallback"))
            {
               MovieClip(_loader.content).setEmoteCallback(onEmoteItemClicked);
            }
            else if(_denStateItem.specialType == 5)
            {
               _isDenStore = true;
            }
         }
         if(_loader.content.hasOwnProperty("setUniqueImage"))
         {
            _isUniqueImageItem = true;
            if(_uniqueImageId != "")
            {
               _masterpieceDefHelper = new MasterpieceDefHelper();
               _masterpieceDefHelper.init(_uniqueImageId,onUniqueImageIdLoaded);
            }
         }
         _sprite.addChild(_loader);
         _sprite.addChild(_portalSprite);
         if(_callback != null)
         {
            _callback(this);
            _callback = null;
         }
      }
      
      private function onUniqueImageIdLoaded(param1:Sprite) : void
      {
         if(_masterpieceDefHelper)
         {
            _masterpieceDefHelper.destroy();
            _masterpieceDefHelper = null;
         }
         if(_uniqueImage)
         {
            _uniqueImage.addChild(param1);
            if(_loader && _loader.content && "setUniqueImage" in _loader.content)
            {
               MovieClip(_loader.content).setUniqueImage(_uniqueImage);
            }
         }
      }
      
      private function onEmoteItemClicked(param1:int) : void
      {
         if(AvatarManager.playerAvatarWorldView && !AvatarManager.playerAvatarWorldView.isThisAttachmentOn(param1))
         {
            AvatarManager.setPlayerAttachmentEmot(param1);
         }
      }
      
      private function onMouseDown(param1:MouseEvent) : void
      {
         if(_onMouseDownCallback != null)
         {
            _onMouseDownCallback(param1,this);
         }
      }
      
      private function onMouseOver(param1:MouseEvent) : void
      {
         if(_onMouseOverCallback != null)
         {
            _onMouseOverCallback(param1,this);
         }
      }
      
      private function onMouseOut(param1:MouseEvent) : void
      {
         if(_onMouseOutCallback != null)
         {
            _onMouseOutCallback(param1);
         }
      }
   }
}

